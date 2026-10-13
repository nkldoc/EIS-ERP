/* global Ext */
(function () {
    if (typeof Ext === 'undefined' || Ext.showAdminSystemLogWindow) {
        return;
    }

    var API_URL = '/supplies/sp/tor/api/adminSystemLogList.php';
    var statusText = {
        NEW: 'รายการใหม่',
        IN_PROGRESS: 'กำลังตรวจสอบ',
        RESOLVED: 'แก้ไขเรียบร้อย',
        REJECTED: 'ไม่รับดำเนินการ',
        CANCELLED: 'ยกเลิก'
    };
    var statusStyle = {
        NEW: 'background:#fff3cd;color:#856404;',
        IN_PROGRESS: 'background:#d1ecf1;color:#0c5460;',
        RESOLVED: 'background:#d4edda;color:#155724;',
        REJECTED: 'background:#f8d7da;color:#721c24;',
        CANCELLED: 'background:#e2e3e5;color:#383d41;'
    };

    function htmlEncode(value) {
        return Ext.util.Format.htmlEncode(String(value == null ? '' : value));
    }

    function statusRenderer(value) {
        return '<span style="' + (statusStyle[value] || statusStyle.CANCELLED) +
            'padding:3px 8px;border-radius:10px;white-space:nowrap;">' +
            htmlEncode(statusText[value] || value || '-') + '</span>';
    }

    function showDetail(record) {
        if (!record) {
            return;
        }
        var data = record.data;
        // API กรอง tag/attribute แล้ว และ iframe sandbox ป้องกันเนื้อหา Log ทำงานกับหน้าหลัก
        var detailDocument = '<!doctype html><html><head><meta charset="utf-8">' +
            '<style>body{font-family:Tahoma,sans-serif;padding:10px;line-height:1.55}' +
            'img{max-width:100%;height:auto}table{border-collapse:collapse}' +
            'td,th{border:1px solid #ccc;padding:5px}</style></head><body>' +
            (data.detail_html || '<pre>' + htmlEncode(data.detail_text) + '</pre>') + '</body></html>';
        var detail = '<iframe sandbox="" style="width:100%;height:285px;border:1px solid #ddd;" srcdoc="' +
            htmlEncode(detailDocument) + '"></iframe>';
        var safeUrl = /^https?:\/\//i.test(String(data.current_url || '')) ? data.current_url : '';
        var link = safeUrl
            ? '<a href="' + htmlEncode(safeUrl) + '" target="_blank" rel="noopener noreferrer">เปิดหน้าที่แจ้ง</a>'
            : '-';

        new Ext.Window({
            title: 'รายละเอียด Log #' + htmlEncode(data.admin_system_log_id),
            width: 760,
            height: 520,
            modal: true,
            maximizable: true,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                autoScroll: true,
                bodyStyle: 'padding:15px;background:#fff;',
                html: '<table style="width:100%;border-collapse:collapse;line-height:1.7;">' +
                    '<tr><td style="width:130px;font-weight:bold;">วันที่แจ้ง</td><td>' + htmlEncode(data.created_date) + '</td></tr>' +
                    '<tr><td style="font-weight:bold;">ผู้แจ้ง</td><td>' + htmlEncode(data.created_name || data.created_by || '-') + '</td></tr>' +
                    '<tr><td style="font-weight:bold;">เลขที่อ้างอิง</td><td>' + htmlEncode(data.reference_code || '-') + '</td></tr>' +
                    '<tr><td style="font-weight:bold;">หัวข้อ</td><td>' + htmlEncode(data.subject) + '</td></tr>' +
                    '<tr><td style="font-weight:bold;">สถานะ</td><td>' + statusRenderer(data.log_status) + '</td></tr>' +
                    '<tr><td style="font-weight:bold;">หน้าที่แจ้ง</td><td>' + link + '</td></tr>' +
                    '</table><hr><div style="overflow:auto;">' + detail + '</div>'
            }],
            buttons: [{
                text: 'ปิด',
                handler: function (button) {
                    button.ownerCt.ownerCt.close();
                }
            }]
        }).show();
    }

    Ext.showAdminSystemLogWindow = function () {
        var oldWindow = Ext.getCmp('adminSystemLogWindow');
        if (oldWindow) {
            oldWindow.show();
            oldWindow.toFront();
            return;
        }

        var store = new Ext.data.JsonStore({
            url: API_URL,
            root: 'data',
            totalProperty: 'total',
            idProperty: 'admin_system_log_id',
            remoteSort: false,
            fields: [
                {name: 'admin_system_log_id', type: 'int'},
                'module_code', 'reference_id', 'reference_code', 'subject',
                'detail_html', 'detail_text', 'current_url', 'log_status',
                'priority_code', 'assigned_admin_id', 'admin_comment',
                'created_by', 'created_name', 'created_ip', 'created_date'
            ],
            baseParams: {mode: 'LIST_ADMIN_LOG', status: '', search: ''},
            listeners: {
                exception: function (proxy, type, action, options, response) {
                    var message = 'ไม่สามารถโหลดรายการ Log ได้';
                    if (response && response.responseText) {
                        try {
                            var result = Ext.decode(response.responseText);
                            message = result.message || result.msg || message;
                        } catch (ignore) {}
                    }
                    Ext.Msg.alert('เกิดข้อผิดพลาด', message);
                }
            }
        });

        var statusFilter = new Ext.form.ComboBox({
            width: 155,
            mode: 'local',
            triggerAction: 'all',
            editable: false,
            value: '',
            store: new Ext.data.ArrayStore({
                fields: ['value', 'text'],
                data: [
                    ['', 'ทุกสถานะ'], ['NEW', 'รายการใหม่'],
                    ['IN_PROGRESS', 'กำลังตรวจสอบ'], ['RESOLVED', 'แก้ไขเรียบร้อย'],
                    ['REJECTED', 'ไม่รับดำเนินการ'], ['CANCELLED', 'ยกเลิก']
                ]
            }),
            valueField: 'value',
            displayField: 'text'
        });
        var searchField = new Ext.form.TextField({
            width: 230,
            emptyText: 'ค้นหาเลขที่/รายละเอียด/ผู้แจ้ง',
            enableKeyEvents: true
        });

        function loadFirstPage() {
            store.baseParams.status = statusFilter.getValue() || '';
            store.baseParams.search = searchField.getValue() || '';
            store.load({params: {start: 0, limit: 50}});
        }

        statusFilter.on('select', loadFirstPage);
        searchField.on('specialkey', function (field, event) {
            if (event.getKey() === event.ENTER) {
                loadFirstPage();
            }
        });

        var grid = new Ext.grid.GridPanel({
            store: store,
            stripeRows: true,
            border: false,
            loadMask: {msg: 'กำลังโหลดรายการ Log...'},
            columns: [
                {header: 'Log ID', dataIndex: 'admin_system_log_id', width: 70},
                {header: 'วันที่แจ้ง', dataIndex: 'created_date', width: 135},
                {header: 'เลขที่อ้างอิง', dataIndex: 'reference_code', width: 125, renderer: htmlEncode},
                {header: 'หัวข้อ', dataIndex: 'subject', width: 230, renderer: htmlEncode},
                {header: 'รายละเอียด', dataIndex: 'detail_text', width: 310, renderer: htmlEncode},
                {header: 'ผู้แจ้ง', dataIndex: 'created_name', width: 150, renderer: htmlEncode},
                {header: 'สถานะ', dataIndex: 'log_status', width: 125, renderer: statusRenderer}
            ],
            tbar: [statusFilter, '-', searchField, {
                text: 'ค้นหา',
                icon: '/supplies/images/icons/magnifier.png',
                handler: loadFirstPage
            }, {
                text: 'ล้าง',
                handler: function () {
                    statusFilter.setValue('');
                    searchField.reset();
                    loadFirstPage();
                }
            }, '->', {
                text: 'รีเฟรช',
                icon: '/supplies/images/icons/arrow_refresh.png',
                handler: function () { store.reload(); }
            }],
            bbar: new Ext.PagingToolbar({
                store: store,
                pageSize: 50,
                displayInfo: true,
                displayMsg: 'แสดง {0} - {1} จาก {2} รายการ',
                emptyMsg: 'ไม่พบรายการ Log'
            }),
            listeners: {
                rowdblclick: function (gridPanel, rowIndex) {
                    showDetail(gridPanel.getStore().getAt(rowIndex));
                }
            }
        });

        new Ext.Window({
            id: 'adminSystemLogWindow',
            title: 'รายการแจ้ง Admin/เจ้าหน้าที่ผู้ดูแลระบบ',
            width: 1100,
            height: 650,
            modal: true,
            maximizable: true,
            layout: 'fit',
            closeAction: 'close',
            items: [grid],
            buttons: [{
                text: 'ดูรายละเอียด',
                handler: function () {
                    var selected = grid.getSelectionModel().getSelected();
                    if (!selected) {
                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกรายการที่ต้องการดู');
                        return;
                    }
                    showDetail(selected);
                }
            }, {
                text: 'ปิด',
                handler: function (button) { button.ownerCt.ownerCt.close(); }
            }]
        }).show();

        loadFirstPage();
    };
}());
