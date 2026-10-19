(function () {
    'use strict';
    Ext.refreshSuppliesAdminTools = function () {
        var button = Ext.getCmp('supplies-admin-tools');
        if (button) button.setDisabled(window.SUPPLIES_CAN_ADMIN_TOOLS !== true);
    };
    Ext.openSuppliesAdminTools = function () {
        if (window.SUPPLIES_CAN_ADMIN_TOOLS !== true) return;
        var existing = Ext.getCmp('supplies-admin-tools-window');
        if (existing) { existing.show(); existing.toFront(); return; }
        new Ext.Window({
            id: 'supplies-admin-tools-window', title: 'รายละเอียด PR / สัญญา / ตรวจรับ · ADMIN',
            iconCls: 'supplies-admin-tools-icon', cls: 'supplies-admin-tools-window',
            width: Math.min(1160, Ext.getBody().getViewSize().width - 24),
            height: Math.min(780, Ext.getBody().getViewSize().height - 24),
            layout: 'fit', maximizable: true, constrain: true, modal: false,
            items: [{xtype: 'box', autoEl: {
                tag: 'iframe', src: '/supplies/sp/admin-tools.php',
                title: 'ค้นหาและเปิดรายละเอียด PR สัญญา IR AP และเลขเบิก D', frameborder: '0',
                style: 'display:block;width:100%;height:100%;border:0;background:#f4f7fb;'
            }}]
        }).show();
    };
    Ext.openSuppliesNotebook = function () {
        var existing = Ext.getCmp('winMsgID');
        if (existing) { existing.show(); existing.toFront(); Ext.getCmp('textMemoriesID').focus(false, 100); return; }
        var saved = '';
        try { saved = localStorage.getItem('textMemories') || ''; } catch (ignore) {}
        if (saved === '[object Object]') saved = '';
        var field = new Ext.form.TextArea({
            id: 'textMemoriesID', name: 'textMemories', value: saved,
            cls: 'supplies-notebook-paper', emptyText: 'จดสิ่งที่ต้องทำ หรือบันทึกช่วยจำไว้ที่นี่...',
            listeners: {afterrender: function (input) {
                input.el.dom.setAttribute('aria-label', 'เนื้อหาสมุดโน้ต');
                input.el.on('input', save);
            }}
        });
        function save() {
            var status = Ext.getCmp('supplies-notebook-status');
            try {
                localStorage.setItem('textMemories', field.getValue());
                if (status) status.setText('บันทึกแล้ว · ' + field.getValue().length.toLocaleString() + ' ตัวอักษร');
            } catch (error) {
                if (status) status.setText('บันทึกไม่สำเร็จ กรุณาคัดลอกข้อความเก็บไว้');
            }
        }
        var win = new Ext.Window({
            id: 'winMsgID', title: 'สมุดโน้ต · Text Memories',
            iconCls: 'supplies-notebook-icon', cls: 'supplies-notebook-window',
            width: Math.min(620, Ext.getBody().getViewSize().width - 24),
            height: Math.min(540, Ext.getBody().getViewSize().height - 24),
            minWidth: 280, minHeight: 240, constrain: true,
            layout: 'fit', closeAction: 'hide', maximizable: true, modal: false,
            tbar: [{xtype: 'tbtext', text: 'บันทึกส่วนตัว · บันทึกอัตโนมัติในเบราว์เซอร์นี้'}],
            items: [field],
            bbar: [{xtype: 'tbtext', id: 'supplies-notebook-status', text: 'พร้อมจดบันทึก'}, '->', {
                text: 'บันทึก', icon: './images/icons/disk.png', handler: save
            }, {text: 'ปิด', handler: function () { win.hide(); }}],
            listeners: {beforehide: save, show: function () { field.focus(false, 100); }}
        });
        win.show();
    };
})();
