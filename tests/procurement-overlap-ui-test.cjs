const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync(__dirname + '/../public/supplies/bi/js/ProcurementProgressDashboard.js', 'utf8');
const elements = {statusOwnerFilter:{value:''},overlapDialog:{open:false,showModal(){this.open=true;}},overlapDialogTitle:{},overlapDialogCount:{},overlapDialogRows:{}};
const context = {document:{getElementById:id=>elements[id]}};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  function el('), source.indexOf('  function unique(')) + source.slice(source.indexOf('  function stage('),source.indexOf('  function applyFilters(')) + source.slice(source.indexOf('  var overlapGroups'),source.indexOf('  function renderStatus(')),context);
context.filteredRows = [
  {tor_id:1,pr_code:'PR1',c_name:'<script>alert(1)</script>',owner_name:'A',period_total:1,overlap_status:'saved',overlap_debt_status:'debt',overlap_codes:['SECOND'],overlap_evidence:[{source:'PO',reference:'PO1',field:'c_overlap2',code:'SECOND',verified:true,year:2569,document_year:2026}]},
  {tor_id:2,pr_code:'PR2',owner_name:'B',period_total:1,overlap_status:'saved'},
  {tor_id:3,pr_code:'PR3',owner_name:'A',overlap_status:'review'}
];
assert.equal(vm.runInContext('overlapRows("", "").length', context),3);
assert.equal(vm.runInContext('overlapGroups.length', context),6);
assert(vm.runInContext('overlapGroups.includes("จองใช้ใบกัน") && overlapGroups.includes("บันทึกใช้ใบกันแล้ว")', context));
elements.statusOwnerFilter.value='A';
assert.equal(vm.runInContext('overlapRows("", "").length', context),2);
assert.equal(vm.runInContext('overlapRows("", "saved").length', context),1);
assert.equal(vm.runInContext('overlapRows("missing stage", "saved").length', context),0);
vm.runInContext('openOverlapDetails("", "saved")',context);
assert(elements.overlapDialog.open);
assert(elements.overlapDialogRows.innerHTML.includes('c_overlap2'));
assert(elements.overlapDialogRows.innerHTML.includes('SECOND'));
assert(elements.overlapDialogRows.innerHTML.includes('&lt;script&gt;'));
assert(!elements.overlapDialogRows.innerHTML.includes('<script>'));
assert(!elements.overlapDialogRows.innerHTML.includes('PR2'));
assert(vm.runInContext('overlapCountButton(0,"","")',context).includes(' disabled'));
console.log('PASS: drilldown owner/status filters, second slot evidence, safe text, zero counts');
