const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
for (const system of ['supplies', 'procure']) {
    const source = fs.readFileSync(`public/${system}/sp/tor/checking.js`, 'utf8');
    const helper = source.slice(source.indexOf('Ext.checkingBudgetYearError ='), source.indexOf('// End checking budget year validation'));
    const context = {Ext: {}};
    vm.runInNewContext(helper, context);
    const validate = context.Ext.checkingBudgetYearError;
    assert.equal(validate(2569, 2570, '69-104-02-1'), '');
    assert.equal(validate(2026, 2570, '69-104-02-1'), '');
    assert.equal(validate(2570, 2570, ''), '');
    assert(validate(2569, 2570, ''));
    assert(validate(2571, 2570, 'future'));
    assert(validate('', 2570, 'booking'));
    assert(validate(2570, null, ''));
    assert(source.includes('Ext.bg_budget_year.load({'));
    assert(!source.includes('Ext.selectRow.get("c_yyyy") != i_year'));
}
console.log('PASS: both systems: current funds, carryover, AD/BE years, missing booking/year, future year');
