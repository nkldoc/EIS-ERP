/* global Ext */
(function () {
        Ext.CheckingRelationLookup = {
                open: function (onSelect) {
                        var keywordField = new Ext.form.TextField({ width: 260, emptyText: 'เลขที่เอกสาร หรือชื่อเรื่อง' });
                        var createStore = function (source) {
                                return new Ext.data.JsonStore({
                                        url: 'tor/api/mnCheckingController.php',
                                        root: 'data',
                                        fields: ['source', 'tor_id', 'sp_tor_contract_id', 'sp_check_period_hdr_id', 'c_code', 'c_name', 'i_enabled'],
                                        baseParams: { mode: 'SEARCH_RELATION_CODES', source: source },
                                        autoLoad: true
                                });
                        };
                        var torStore = createStore('tor');
                        var contractStore = createStore('contract');
                        var apStore = createStore('ap');
                        var selectWindow;
                        var chooseRecord = function (grid) {
                                var sm = grid.getSelectionModel();
                                var selected = sm.getSelected ? sm.getSelected() : null;
                                if (!selected) {
                                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกรายการ');
                                        return;
                                }
                                selectWindow.close();
                                var source = selected.get('source');
                                onSelect({
                                        search_type: source === 'ap' ? 'ap_code' : (source === 'contract' ? 'contract_code' : 'tor_code'),
                                        search_code: selected.get('c_code')
                                });
                        };
                        var createGrid = function (title, store) {
                                var grid = new Ext.grid.GridPanel({
                                        title: title,
                                        store: store,
                                        stripeRows: true,
                                        columns: [
                                                new Ext.grid.RowNumberer({ width: 35 }),
                                                { header: 'เลขที่', dataIndex: 'c_code', width: 180, sortable: true },
                                                { header: 'ชื่อเรื่อง/ชื่อสัญญา', dataIndex: 'c_name', width: 520, sortable: true },
                                                { header: 'TOR ID', dataIndex: 'tor_id', width: 80, align: 'center' },
                                                { header: 'Contract ID', dataIndex: 'sp_tor_contract_id', width: 90, align: 'center' },
                                                { header: 'Enabled', dataIndex: 'i_enabled', width: 65, align: 'center' }
                                        ],
                                        viewConfig: { forceFit: false, emptyText: 'ไม่พบข้อมูล' },
                                        listeners: { rowdblclick: function () { chooseRecord(grid); } },
                                        bbar: [{
                                                        text: 'เลือกข้อมูลนี้',
                                                        iconCls: 'icon-accept',
                                                        handler: function () { chooseRecord(grid); }
                                                }]
                                });
                                return grid;
                        };
                        var torGrid = createGrid('Grid sp_tor', torStore);
                        var contractGrid = createGrid('Grid sp_tor_contract', contractStore);
                        var apGrid = createGrid('ค้นหาด้วยเลขตรวจรับ AP', apStore);
                        var tabs = new Ext.TabPanel({ activeTab: 0, items: [torGrid, contractGrid, apGrid] });
                        var runSearch = function () {
                                var keyword = String(keywordField.getValue() || '').replace(/^\s+|\s+$/g, '');
                                torStore.setBaseParam('keyword', keyword);
                                contractStore.setBaseParam('keyword', keyword);
                                apStore.setBaseParam('keyword', keyword);
                                torStore.reload();
                                contractStore.reload();
                                apStore.reload();
                        };
                        selectWindow = new Ext.Window({
                                title: 'เลือกข้อมูล TOR หรือสัญญา',
                                width: 980,
                                height: 600,
                                layout: 'fit',
                                modal: true,
                                maximizable: true,
                                items: tabs,
                                tbar: [{ xtype: 'tbtext', text: '<b>ค้นหา:</b>' }, keywordField, {
                                                text: 'ค้นหา', iconCls: 'icon-magnifier', handler: runSearch
                                        }, {
                                                text: 'ล้างค่า', handler: function () { keywordField.setValue(''); runSearch(); }
                                        }],
                                buttons: [{ text: 'ปิด', handler: function () { selectWindow.close(); } }]
                        });
                        keywordField.on('specialkey', function (field, event) {
                                if (event.getKey() === event.ENTER) { runSearch(); }
                        });
                        selectWindow.show();
                }
        };
})();
