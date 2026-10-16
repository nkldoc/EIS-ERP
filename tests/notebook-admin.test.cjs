const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../public/supplies/js/notebook.js'), 'utf8');
function setup(allowed) {
    const windows = []; let disabled, shows = 0;
    const Ext = {
        getCmp(id) {
            if (id === 'supplies-admin-tools') return {setDisabled(value) { disabled = value; }};
            if (id === 'supplies-admin-tools-window' && windows.length) return {show() {shows++;}, toFront() {}};
        },
        getBody() {return {getViewSize() {return {width:1280,height:900};}};},
        Window: function(config) {windows.push(config); this.show = () => {shows++;};}
    };
    vm.runInNewContext(source, {Ext, window:{SUPPLIES_CAN_ADMIN_TOOLS:allowed}});
    Ext.refreshSuppliesAdminTools();
    return {Ext, windows, disabled, get shows() {return shows;}};
}
test('non-admin cannot open global admin tools', () => {
    const result = setup(false); result.Ext.openSuppliesAdminTools();
    assert.equal(result.disabled, true); assert.equal(result.windows.length, 0);
});
test('admin can open tools without an active page or selected record', () => {
    const result = setup(true); result.Ext.openSuppliesAdminTools();
    assert.equal(result.disabled, false);
    assert.equal(result.windows[0].items[0].autoEl.src, '/supplies/sp/admin-tools.php');
    assert.equal(result.shows, 1);
});
test('opening again reuses the existing tool window', () => {
    const result = setup(true); result.Ext.openSuppliesAdminTools(); result.Ext.openSuppliesAdminTools();
    assert.equal(result.windows.length, 1); assert.equal(result.shows, 2);
});