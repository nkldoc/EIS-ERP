const fs = require('fs'), vm = require('vm'), assert = require('assert');
const requests = [], confirmations = [], alerts = [], statuses = [];
const button = {childNumberApproved: true}, tokenField = {setValue(value) {this.value = value;}};
const Ext = {util: {Format: {htmlEncode: value => String(value).replace(/</g, '&lt;')}}, decode: JSON.parse,
    Ajax: {request: config => requests.push(config)},
    getCmp: id => ({'checking-child-number-status': {rendered: true, update: html => statuses.push(html)},
        buSaveSub3ID: button, 'checking-child-number-token': tokenField}[id]),
    Msg: {confirm: (title, html, callback) => confirmations.push({html, callback}), alert: (title, text) => alerts.push(text)}};
vm.runInNewContext(fs.readFileSync('public/supplies/sp/tor/checkingChildNumber.js','utf8'), {Ext});
let saved = 0, cancelled = 0;
const reply = (data, success = true) => requests[requests.length - 1].callback({},success,{responseText:JSON.stringify(data)});
const child = {is_child:true, parent_code:'03AP69090162/03', ir_code:'IR12', existing_code:'', proposed_code:'03AP69090162.1/03'};
Ext.confirmCheckingChildNumber(12, token => {assert.equal(token,'TOKEN'); saved++;}, () => cancelled++);
reply({success:true,data:child,confirmation_token:'TOKEN'});
assert.equal(saved,0); assert(confirmations[0].html.includes('03AP69090162.1/03'));
confirmations[0].callback('no'); assert.equal(saved,0); assert.equal(cancelled,1);
Ext.confirmCheckingChildNumber(12, () => saved++);
reply({success:true,data:child,confirmation_token:'TOKEN'});
confirmations[1].callback('yes'); assert.equal(saved,1);
Ext.confirmCheckingChildNumber(13, () => saved++, () => cancelled++);
reply({success:false,msg:'missing mother AP'}, false);
assert.equal(saved,1); assert.equal(cancelled,2); assert.equal(alerts[0],'missing mother AP');
Ext.loadCheckingChildNumberStatus(12); reply({success:true,data:child});
assert(statuses[statuses.length-1].includes('รายการลูก'));
Ext.clearCheckingChildConfirmation(); assert.equal(button.childNumberApproved,false); assert.equal(tokenField.value,'');
console.log('PASS: preview shows mother/child AP; cancellation and failed preview prevent save; explicit confirmation continues; status and reset');
