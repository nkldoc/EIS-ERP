(function () {
    Ext.openAdminOverviewSearch = function () {
        var resultType = 'pr';
        var type = new Ext.form.ComboBox({width: 150, mode: 'local', triggerAction: 'all', editable: false,
            store: [['pr', 'PR'], ['contract', 'สัญญา'], ['ir', 'IR'], ['ap', 'AP'], ['d', 'เลขเบิก D']], value: 'pr'});
        var keyword = new Ext.form.TextField({width: 320, emptyText: 'ระบุเลขเอกสารทั้งหมดหรือบางส่วน', enableKeyEvents: true,
            listeners: {specialkey: function (field, event) { if (event.getKey() === event.ENTER) search(); }}});
        var store = new Ext.data.JsonStore({url: 'tor/api/adminOverviewSearch.php', method: 'GET', root: 'data',
            fields: ['sp_tor_id', 'sp_tor_contract_id', 'sp_check_period_hdr_id', 'c_code', 'c_name', 'pr_code', 'contract_code', 'i_enabled']});
        function search() {
            if (!String(keyword.getValue()).replace(/\s/g, '')) { keyword.focus(); return; }
            var requestedType = type.getValue();
            store.load({params: {type: requestedType, keyword: keyword.getValue()}, callback: function (records, options, success) {
                if (success) resultType = requestedType;
                if (!success) Ext.Msg.alert('แจ้งเตือน', 'ค้นหาไม่สำเร็จ กรุณาลองอีกครั้ง');
                else if (!records.length) Ext.Msg.alert('ผลการค้นหา', 'ไม่พบเอกสารที่ค้นหา');
            }});
        }
        function openDetails() {
            var record = grid.getSelectionModel().getSelected();
            if (!record) return Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกเอกสาร');
            var checkId = Number(record.get('sp_check_period_hdr_id'));
            // Retired inspections remain searchable without requesting an active-only inspection filter.
            Ext.showContractDetails(record, {allowAdminEdit: true,
                sp_tor_id: resultType === 'pr' ? Number(record.get('sp_tor_id')) : 0,
                sp_check_period_hdr_id: Number(record.get('i_enabled')) === 1 ? checkId : 0,
                initialTab: checkId ? 3 : (resultType === 'contract' ? 2 : 0), maximized: true});
        }
        var grid = new Ext.grid.GridPanel({store: store, border: false, loadMask: true,
            sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
            columns: [{header: 'เลขเอกสาร', dataIndex: 'c_code', width: 210, renderer: Ext.util.Format.htmlEncode},
                {header: 'เลข PR', dataIndex: 'pr_code', width: 180, renderer: Ext.util.Format.htmlEncode},
                {header: 'เลขสัญญา', dataIndex: 'contract_code', width: 210, renderer: Ext.util.Format.htmlEncode},
                {header: 'เรื่อง / โครงการ', dataIndex: 'c_name', width: 500, renderer: Ext.util.Format.htmlEncode}],
            listeners: {rowdblclick: openDetails},
            tbar: ['ค้นหาจาก', type, keyword, {text: 'ค้นหา', handler: search}, '-', {text: 'เปิดรายละเอียด', handler: openDetails}]});
        new Ext.Viewport({layout: 'fit', items: [grid]});
        keyword.focus(false, 200);
    };
})();
