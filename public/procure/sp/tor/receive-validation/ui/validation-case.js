/* global Ext */
Ext.ns('Ext.receiveValidation');

Ext.receiveValidation.openCaseManager = function () {
    var url = 'tor/receive-validation/api/';
    var store = new Ext.data.JsonStore({
        url: url + 'validationCaseList.php', root: 'rows', idProperty: 'sp_check_fix_case_id',
        baseParams: {include_disabled: 1},
        fields: ['sp_check_fix_case_id', 'c_case_code', 'c_case_name', 'c_case_description', 'sql_condition',
            'sql_before_display', 'sql_update', 'sql_after_display', 'sql_before_snapshot',
            {name: 'i_severity', type: 'int'}, {name: 'i_require_confirm', type: 'bool'},
            {name: 'i_allow_update', type: 'bool'}, {name: 'i_enable', type: 'bool'}, {name: 'i_sort_order', type: 'int'}]
    });
    function editor(rec) {
        var form = new Ext.form.FormPanel({labelWidth: 170, bodyStyle: 'padding:10px', autoScroll: true,
            defaults: {anchor: '98%'}, items: [
                {xtype: 'hidden', name: 'sp_check_fix_case_id'},
                {xtype: 'textfield', fieldLabel: 'รหัสเคส', name: 'c_case_code', allowBlank: false},
                {xtype: 'textfield', fieldLabel: 'ชื่อเคส', name: 'c_case_name', allowBlank: false},
                {xtype: 'textarea', fieldLabel: 'คำอธิบาย', name: 'c_case_description', height: 50},
                {xtype: 'textarea', fieldLabel: 'Query ตรวจเงื่อนไข', name: 'sql_condition', height: 80, allowBlank: false},
                {xtype: 'textarea', fieldLabel: 'Query แสดงก่อนแก้', name: 'sql_before_display', height: 80, allowBlank: false},
                {xtype: 'textarea', fieldLabel: 'Query Snapshot JSON', name: 'sql_before_snapshot', height: 80, allowBlank: false},
                {xtype: 'textarea', fieldLabel: 'Query Update', name: 'sql_update', height: 80},
                {xtype: 'textarea', fieldLabel: 'Query แสดงหลังแก้', name: 'sql_after_display', height: 80, allowBlank: false},
                {xtype: 'combo', fieldLabel: 'ต้องแก้ไข', name: 'i_severity', hiddenName: 'i_severity', mode: 'local', triggerAction: 'all', editable: false,
                    store: [[1, 'ข้อมูล'], [2, 'แจ้งเตือน'], [3, 'ยืนยันการแก้ไข'], [4, 'ต้องแก้ไขข้อมูล']]},
                {xtype: 'numberfield', fieldLabel: 'ลำดับ', name: 'i_sort_order', value: 0},
                {xtype: 'checkbox', fieldLabel: 'ต้องยืนยัน', name: 'i_require_confirm', inputValue: 1},
                {xtype: 'checkbox', fieldLabel: 'อนุญาตแก้ไข', name: 'i_allow_update', inputValue: 1},
                {xtype: 'checkbox', fieldLabel: 'เปิดใช้งาน', name: 'i_enable', inputValue: 1, checked: true}
            ]});
        if (rec)
            form.on('afterrender', function () {
                form.getForm().loadRecord(rec);
            });
        new Ext.Window({title: rec ? 'แก้ไขเคส' : 'เพิ่มเคส', width: 850, height: 650, modal: true, layout: 'fit', items: form,
            buttons: [{text: 'บันทึก', iconCls: 'icon-save', handler: function () {
                        if (!form.getForm().isValid())
                            return;
                        // getFieldValues keeps textarea whitespace intact; getValues may turn spaces into '+' in ExtJS 3.
                        var values = form.getForm().getFieldValues(false);
                        values.i_require_confirm = form.getForm().findField('i_require_confirm').getValue() ? 1 : 0;
                        values.i_allow_update = form.getForm().findField('i_allow_update').getValue() ? 1 : 0;
                        values.i_enable = form.getForm().findField('i_enable').getValue() ? 1 : 0;
                        form.getForm().submit({url: url + 'validationCaseSave.php', params: {data: Ext.encode(values)}, success: function (f, a) {
                                form.ownerCt.close();
                                store.reload();
                            }, failure: function (f, a) {
                                Ext.Msg.alert('ผิดพลาด', a.result ? a.result.message : 'บันทึกไม่สำเร็จ');
                            }});
                    }}, {text: 'ปิด', handler: function (b) {
                        b.ownerCt.ownerCt.close();
                    }}]}).show();
    }
    var grid = new Ext.grid.GridPanel({store: store, stripeRows: true, columns: [
            new Ext.grid.RowNumberer(), {header: 'รหัส', dataIndex: 'c_case_code', width: 90}, {header: 'ชื่อเคส', dataIndex: 'c_case_name', width: 260},
            {header: 'ระดับ', dataIndex: 'i_severity', width: 55}, {header: 'ยืนยัน', dataIndex: 'i_require_confirm', width: 55, renderer: function (v) {
                    return v ? 'ใช่' : 'ไม่';
                }},
            {header: 'แก้ไขได้', dataIndex: 'i_allow_update', width: 65, renderer: function (v) {
                    return v ? 'ใช่' : 'ไม่';
                }},
            {header: 'ใช้งาน', dataIndex: 'i_enable', width: 55, renderer: function (v) {
                    return v ? 'ใช่' : 'ไม่';
                }}
        ], tbar: [{text: 'เพิ่มเคส', iconCls: 'icon-add', handler: function () {
                    editor(null);
                }}, {text: 'แก้ไข', iconCls: 'icon-edit', handler: function () {
                    var r = grid.getSelectionModel().getSelected();
                    if (r)
                        editor(r);
                }}, {text: 'ปิดใช้งาน', iconCls: 'icon-delete', handler: function () {
                    var r = grid.getSelectionModel().getSelected();
                    if (!r)
                        return;
                    Ext.Msg.confirm('ยืนยัน', 'ปิดใช้งานเคสนี้?', function (b) {
                        if (b === 'yes')
                            Ext.Ajax.request({url: url + 'validationCaseDelete.php', method: 'POST', params: {sp_check_fix_case_id: r.id}, callback: function () {
                                    store.reload();
                                }});
                    });
                }}]});
    new Ext.Window({title: 'จัดการเคสตรวจสอบและแก้ไข', width: 900, height: 550, modal: true, layout: 'fit', items: grid}).show();
    store.load();
};
