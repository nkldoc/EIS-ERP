const fs = require('fs'), vm = require('vm'), assert = require('assert');
function scenario(rows, failure) {
    const controls = [], requests = [];
    function Control(config) {
        Object.assign(this, config); controls.push(this); this.events = {};
        this.on = (name, fn) => { this.events[name] = fn; };
        this.rendered = false;
        this.update = html => { assert(this.rendered, 'Must not update a deferred Ext panel before render'); this.html = html; };
        this.enable = () => { this.disabled = false; }; this.disable = () => { this.disabled = true; };
        this.show = () => { this.hidden = false; }; this.hide = () => { this.hidden = true; };
        this.setVisible = value => { this.hidden = !value; };
        this.getValue = () => this.value;
        this.setValue = value => { this.value = value; if (this.events.check) this.events.check(this, value); };
        this.setText = text => { this.text = text; };
        this.getSelections = () => []; this.clearSelections = () => {};
        this.records = [];
        this.each = fn => this.records.forEach(fn);
        this.indexOf = record => this.records.indexOf(record);
        this.loadData = payload => {
            this.records = payload.data.map(data => ({data, get: key => data[key]}));
            if (this.events.load) this.events.load();
        };
        this.selectRows = indices => { this.checkedIndices = indices; if (this.events.selectionchange) this.events.selectionchange(); };
        this.load = options => { this.lastLoad = options; };
    }
    const panel = {add() {}, doLayout() {}};
    const Ext = {session: {dc_center_user: 1}, util: {Format: {htmlEncode: String, number: value => Number(value).toFixed(2)}},
        each: (items, fn) => items.forEach(fn), encode: JSON.stringify, decode: JSON.parse,
        form: {TextField: Control, Checkbox: Control}, Toolbar: {TextItem: Control},
        data: {JsonStore: Control}, grid: {CheckboxSelectionModel: Control, GridPanel: Control},
        Panel: Control, Button: Control, Ajax: {request: config => requests.push(config)}, Msg: {alert() {}}};
    vm.runInNewContext(fs.readFileSync('public/supplies/sp/tor/checkingParent.js', 'utf8'), {Ext});
    Ext.addCheckingParentSelector(panel, {get: () => 10});
    const checkbox = controls.find(c => c.name === 'i_parent');
    const save = controls.find(c => c.text === 'บันทึกใบแม่ / AP ลูก');
    const retry = controls.find(c => c.text === 'โหลดข้อมูลอีกครั้ง');
    assert(checkbox.disabled && save.disabled);
    const grid = controls.find(c => c.columns);
    const details = controls.find(c => c.items && c.items.includes(grid));
    assert(!details.hidden, 'Search must be visible independently of parent checkbox and load');
    const keyword = controls.find(c => c.emptyText && c.emptyText.includes('01059'));
    keyword.setValue('สัญญาอื่น/2568');
    grid.tbar.find(item => item && item.text === 'ค้นหา AP / IR').handler();
    assert.equal(grid.store.lastLoad.params.keyword, 'สัญญาอื่น/2568');
    const reply = (request, data, success = true) => request.callback({}, success, {responseText: JSON.stringify(data)});
    if (failure) {
        reply(requests[0], {success: false, msg: 'SQL missing columns'}, false);
        assert(checkbox.disabled && save.disabled); assert.equal(retry.hidden, false);
        assert(controls.some(c => c.html === 'SQL missing columns'));
        retry.handler(); assert.equal(requests.length, 2);
    }
    reply(requests[requests.length - 1], {success: true, data: rows, csrf_token: 'TOKEN', snapshot: 'SNAPSHOT', reason: 'เหตุผลที่บันทึกไว้'});
    assert.equal(controls.find(c => c.fieldLabel === 'เหตุผลในการแก้ไข').getValue(), 'เหตุผลที่บันทึกไว้');
    grid.rendered = true;
    grid.events.viewready();
    return {controls, checkbox, save, panel, grid, requests, reply};
}
let result = scenario([{sp_check_period_hdr_id: 10, i_parent: 0, parent_id: null}]);
assert.equal(result.checkbox.disabled, false); assert.equal(result.save.disabled, false);
result = scenario([{sp_check_period_hdr_id: 10, i_parent: 1, parent_id: null}, {sp_check_period_hdr_id: 12, c_code: 'AP12', parent_id: 10}]);
assert.equal(result.save.disabled, false); assert.deepEqual(Array.from(result.panel.getSelectedParentAPs()), [12]);
assert.equal(result.grid.store.records[0].get('sp_check_period_hdr_id'), 12);
assert.deepEqual(Array.from(result.grid.sm.checkedIndices), [0], 'Saved children must appear checked when the grid renders');
result.controls.find(c => c.fieldLabel === 'เหตุผลในการแก้ไข').setValue('save children');
result.save.handler();
assert.equal(result.requests[result.requests.length - 1].params.mode, 'parent_save');
result.reply(result.requests[result.requests.length - 1], {success: true, snapshot: 'NEW', data: [
    {sp_check_period_hdr_id: 10, i_parent: 1}, {sp_check_period_hdr_id: 12, c_code: 'AP12', parent_id: 10, i_period: 2, f_total: 1000}
]});
assert.deepEqual(Array.from(result.grid.sm.checkedIndices), [0], 'Save response restores checked child rows');
assert.equal(result.grid.store.records[0].get('i_period'), 2);
assert.equal(result.grid.store.records[0].get('f_total'), 1000);
assert.equal(result.controls.find(c => c.fieldLabel === 'เหตุผลในการแก้ไข').getValue(), 'save children');
result.checkbox.setValue(false);
assert.deepEqual(Array.from(result.panel.getSelectedParentAPs()), [12], 'Parent checkbox must not clear independently selected search results');
result = scenario([{sp_check_period_hdr_id: 10, i_parent: 0, parent_id: 99}]);
assert(result.checkbox.disabled && result.save.disabled);
assert(result.controls.some(c => c.html && c.html.includes('ID 99')));
result = scenario([{sp_check_period_hdr_id: 10, i_parent: 0, parent_id: null}], true);
assert.equal(result.save.disabled, false);
result = scenario([{sp_check_period_hdr_id: 10, i_parent: 1, parent_id: null},
    {sp_check_period_hdr_id: 13, c_code: null, c_arrive_code: 'IR13', parent_id: 10}]);
assert.deepEqual(Array.from(result.panel.getSelectedParentAPs()), [13]);
assert(result.controls.some(c => c.html && c.html.includes('IR13')));
assert(result.controls.some(c => c.columns && c.columns.some(column => column.dataIndex === 'c_arrive_code')));
console.log('PASS: deferred tab load enables controls; restores children; explains child restriction; retries failed loads');

result = scenario([{sp_check_period_hdr_id: 10, i_parent: 1, f_total: 1000},
    {sp_check_period_hdr_id: 12, parent_id: 10, f_total: 600, budget_name: 'Income'}]);
assert(result.grid.columns.some(c => c.dataIndex === 'budget_name'));
assert(result.controls.some(c => c.html && c.html.includes('400.00') && c.html.includes('color:#b91c1c')));
result = scenario([{sp_check_period_hdr_id: 10, i_parent: 1, f_total: 0.3},
    {sp_check_period_hdr_id: 12, parent_id: 10, f_total: 0.1},
    {sp_check_period_hdr_id: 13, parent_id: 10, f_total: 0.2}]);
assert(result.controls.some(c => c.html && c.html.includes('color:#15803d')));
result.grid.bbar[2].handler();
assert(result.controls.some(c => c.html && c.html.includes('0.30') && c.html.includes('color:#b91c1c')));
