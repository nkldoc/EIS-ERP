const fs = require('fs'), vm = require('vm'), assert = require('assert');
const source = fs.readFileSync('public/supplies/sp/tor/checking.js','utf8');
let requestedUrl;
const Ext = {util: {Format: {htmlEncode: value => String(value).replace(/</g,'&lt;'), number: Number}, JSON: {decode: JSON.parse}},
    getCmp: id => id === 'f_totalID' ? {getValue: () => '967,658.25'} : null,
    selectRow: {get: () => 'WRONG-BOOKING'}};
function XMLHttpRequest() {
    this.open = (method, url) => { requestedUrl = url; };
    this.send = () => { this.responseText = JSON.stringify({data:[{f_overlap:32000000,f_used:31032341.75,f_remain:967658.25}]}); };
}
vm.runInNewContext(source.slice(source.indexOf('Ext.overlapNotEnoughMsg ='),source.indexOf('/* global Ext v-pro*/')), {Ext, XMLHttpRequest});
const error = Ext.overlapNotEnoughMsg({url:'https://example/api/c_code_overlap/68-105-03-1-1748/chk_id/7087/i_year/2025/f_amt/967658.25',response:{msg:' - Not enough money / ค่าใช้จ่ายไม่ถูกต้อง.<br>id : [970]'}});
assert(requestedUrl.includes('68-105-03-1-1748')); assert(!requestedUrl.includes('WRONG'));
assert(error.includes('ยอดตามหน้าจอเพียงพอ')); assert(error.includes('[970]')); assert(error.includes('7087')); assert(error.includes('2025'));
assert(error.includes('&lt;br>'));
const current = Ext.overlapNotEnoughMsg({url:'https://example/api/f_amt/967658.25',response:{msg:'Not enough money'}});
assert(current.includes('งบประมาณ')); assert(!current.includes('เลขใบกัน'));
console.log('PASS: exact-balance error retains actual API reason, requested booking, inspection and year; no false overlap diagnosis for current-year funds');
