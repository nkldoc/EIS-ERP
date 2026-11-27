const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(__dirname + '/../public/supplies/bi/js/ProcurementProgressDashboard.js', 'utf8');
const elements = {};
for (const id of ['yearFromFilter','yearToFilter','fundFilter','keywordFilter','refreshButton','loading','statusOwnerFilter','ownerMatrixFilter','departmentMatrixFilter','personalOwnerFilter']) {
  elements[id] = {value:'',disabled:false,options:[],classList:{add(){},remove(){}}};
}
elements.yearFromFilter.value='2570'; elements.yearToFilter.value='2570';
let requests = [], renders = 0, fail = false;
const context = {
  document:{getElementById:id=>elements[id]},
  appliedReport:{from:'',to:'',fund:''}, allRows:[], filteredRows:[],
  el:id=>elements[id],
  fillSelect(select){select.value='';}, unique(){return ['A','B'];},
  updateReportContext(){}, render(){renders++;}, alert(){},
  fetch(url){requests.push(url);return Promise.resolve({ok:true,json:()=>Promise.resolve(fail?{success:false,msg:'failure'}:{success:true,data:[{fund_source:'A'},{fund_source:'B'}]})});}
};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  function applyFilters('),source.indexOf('  function updateReportContext(')),context);
vm.runInContext(source.slice(source.indexOf('  function loadData('),source.indexOf(' el("statusOwnerFilter").addEventListener')),context);
const settle = () => new Promise(resolve=>setImmediate(resolve));
(async()=>{
  assert(source.includes('initFiscalYearFilters();loadData();'), 'Initial page load still fetches');
  assert(!/addEventListener\("change",(?:loadData|applyFilters)\)/.test(source), 'Header selections do not load or apply');
  vm.runInContext('loadData()',context); await settle();
  assert.equal(requests.length,1); assert.equal(context.filteredRows.length,2);
  elements.yearFromFilter.value='2569'; elements.fundFilter.value='B';
  vm.runInContext('applyFilters()',context);
  assert.equal(context.filteredRows.length,2,'Keyword filtering keeps the applied fund');
  assert.equal(context.appliedReport.from,'2570','Pending year does not relabel existing data');
  vm.runInContext('loadData();loadData()',context); await settle();
  assert.equal(requests.length,2,'Repeated clicks during loading do not duplicate requests');
  assert(requests[1].includes('year_from=2569'));
  assert.equal(context.filteredRows.length,1); assert.equal(context.appliedReport.fund,'B');
  assert.equal(elements.fundFilter.value,'B','Fund choice survives rebuilding options');
  fail=true; elements.yearFromFilter.value='2568';
  vm.runInContext('loadData()',context); await settle();
  assert.equal(context.appliedReport.from,'2569','Failed fetch retains previous report');
  assert.equal(context.filteredRows.length,1); assert.equal(elements.refreshButton.disabled,false);
  console.log('PASS: initial load, deferred header filters, refresh snapshot, preserved fund, duplicate clicks, failed fetch');
})().catch(error=>{console.error(error);process.exitCode=1;});
