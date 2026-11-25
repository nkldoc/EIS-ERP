/* global Ext */
(function () {
    Ext.addCheckingParentSelector = function (panel, inspection) {
        if (!panel || Number(Ext.session.dc_center_user) !== 1) return;
        var id = Number(inspection.get('sp_check_period_hdr_id') || inspection.get('id'));
        if (!id) return;
        var selected = {}, syncing = false, ready = false, csrf, snapshot;
        function setPanelHtml(target, html) {
            if (target.rendered) target.update(html);
            else target.html = html;
        }
        var encode = Ext.util.Format.htmlEncode;
        var keyword = new Ext.form.TextField({width: 280, emptyText: 'เช่น พวช.จ.01059/2567'});
        var count = new Ext.Toolbar.TextItem('เลือก AP / IR 0 รายการ');
        var store = new Ext.data.JsonStore({
            url: 'tor/api/mnCheckingController.php', root: 'data',
            idProperty: 'sp_check_period_hdr_id',
            fields: ['sp_check_period_hdr_id', 'c_code', 'c_arrive_code', 'contract_code', 'c_name', 'i_period', 'f_total'],
            baseParams: {mode: 'SEARCH_RELATION_CODES', source: 'contract_ap'}
        });
        var selection = new Ext.grid.CheckboxSelectionModel({singleSelect: false});
        selection.on('selectionchange', function () {
            if (syncing) return;
            store.each(function (record) { delete selected[record.get('sp_check_period_hdr_id')]; });
            Ext.each(selection.getSelections(), function (record) { selected[record.get('sp_check_period_hdr_id')] = record.data; });
            updateCount();
        });
        function updateCount() {
            var codes = [], total = 0;
            for (var key in selected) if (Object.prototype.hasOwnProperty.call(selected,key)) { total++; codes.push(selected[key].c_code || selected[key].c_arrive_code); }
            count.setText('เลือก AP / IR ' + total + ' รายการ');
            setPanelHtml(selectedSummary, 'AP / IR ลูกที่เลือก: ' + encode(codes.join(', ') || '-'));
        }
        var search = function () {
            var value = String(keyword.getValue() || '').replace(/^\s+|\s+$/g, '');
            if (!value) return Ext.Msg.alert('ค้นหา AP', 'กรุณาระบุเลขสัญญา');
            syncing = true;
            store.load({params: {keyword: value}, callback: function () { syncing = false; }});
        };
        store.on('exception', function () { Ext.Msg.alert('ค้นหา AP', 'ไม่สามารถโหลดข้อมูล AP ได้ กรุณาลองใหม่'); });
        function restoreChecks() {
            if (!grid.rendered) return;
            syncing = true;
            var indices = [];
            store.each(function (record) {
                if (selected[record.get('sp_check_period_hdr_id')]) indices.push(store.indexOf(record));
            });
            selection.selectRows(indices);
            syncing = false;
        }
        store.on('load', restoreChecks);
        function showSavedChildren(rows) {
            var children = [];
            selected = {};
            Ext.each(rows, function (row) {
                if (Number(row.sp_check_period_hdr_id) !== id) {
                    selected[row.sp_check_period_hdr_id] = row;
                    children.push(row);
                } else {
                    enabled.setValue(Number(row.i_parent) === 1);
                    setPanelHtml(motherSummary, 'เลข AP แม่: <b style="color:#b91c1c">' + encode(row.c_code || 'ยังไม่ออกเลข AP') + '</b>');
                }
            });
            syncing = true;
            store.loadData({data: children});
            syncing = false;
            restoreChecks();
            updateCount();
        }
        var selectedSummary = new Ext.Panel({border: false, html: 'AP ลูกที่เลือก: -', bodyStyle: 'padding:8px;word-break:break-word'});
        var grid = new Ext.grid.GridPanel({
            store: store, sm: selection, height: 340, border: true,
            columns: [selection,
                {header: 'เลขสัญญา', dataIndex: 'contract_code', width: 180, renderer: encode},
                {header: 'เลข AP', dataIndex: 'c_code', width: 180, renderer: encode},
                {header: 'เลข IR', dataIndex: 'c_arrive_code', width: 180, renderer: encode},
                {header: 'งวดที่', dataIndex: 'i_period', width: 65, align: 'center', sortable: true, renderer: encode},
                {header: 'จำนวนเงินรวม VAT (บาท)', dataIndex: 'f_total', width: 160, align: 'right', sortable: true,
                    renderer: function (value) {
                        if (value === null || value === undefined || value === '') return '-';
                        var amount = Number(value);
                        return isFinite(amount) ? Ext.util.Format.number(amount, '0,000.00') : '-';
                    }},
                {header: 'ชื่อสัญญา', dataIndex: 'c_name', width: 470, renderer: encode}],
            tbar: ['เลขสัญญา:', keyword, {text: 'ค้นหา AP / IR', handler: search}],
            bbar: [count, '->', {text: 'ล้างการเลือก', handler: function () { selected = {}; selection.clearSelections(); updateCount(); }}],
            viewConfig: {emptyText: 'กรอกเลขสัญญาแล้วกดค้นหา เพื่อแสดง AP และ IR ทั้งหมดของสัญญา เลือกได้หลายรายการ', deferEmptyText: false}
        });
        var reason = new Ext.form.TextField({fieldLabel: 'เหตุผลในการแก้ไข', maxLength: 1000, anchor: '98%'});
        grid.on('viewready', restoreChecks);
        var details = new Ext.Panel({border: false, items: [grid, selectedSummary]});
        var enabled = new Ext.form.Checkbox({name: 'i_parent', fieldLabel: 'i_parent',
            boxLabel: 'เป็นใบแม่ (เลือก AP ลูกจากเลขสัญญา)', checked: false, disabled: true});
        keyword.on('specialkey', function (field, event) { if (event.getKey() === event.ENTER) search(); });
        var save = new Ext.Button({text: 'บันทึกใบแม่ / AP ลูก', disabled: true, handler: function () {
            if (!ready) return;
            if (!enabled.getValue() && panel.getSelectedParentAPs().length) return Ext.Msg.alert('บันทึก', 'กรุณาติ๊กเป็นใบแม่ก่อนบันทึก AP / IR ลูก หรือล้างการเลือกหากต้องการยกเลิกใบแม่');
            var explanation = String(reason.getValue() || '').replace(/^\s+|\s+$/g, '');
            if (!explanation) return Ext.Msg.alert('บันทึก', 'กรุณาระบุเหตุผลในการแก้ไข');
            save.disable();
            Ext.Ajax.request({url: 'tor/api/checkingAdmin', method: 'POST', params: {
                mode: 'parent_save', sp_check_period_hdr_id: id, csrf_token: csrf, snapshot: snapshot,
                i_parent: enabled.getValue() ? 1 : 0, children: Ext.encode(panel.getSelectedParentAPs()), reason: explanation
            }, callback: function (options, success, response) {
                save.enable();
                var result;
                try { result = Ext.decode(response.responseText); } catch (ignore) {}
                if (!success || !result || !result.success) return Ext.Msg.alert('บันทึก', result && result.msg || 'ไม่สามารถบันทึกได้');
                snapshot = result.snapshot;
                showSavedChildren(result.data);
                reason.setValue(result.reason || explanation);
                Ext.Msg.alert('บันทึก', result.msg);
            }});
        }});
        var status = new Ext.Panel({border: false, html: 'กำลังโหลดข้อมูลใบแม่ / AP ลูก...', bodyStyle: 'padding:8px;word-break:break-word'});
        var motherSummary = new Ext.Panel({border: false, html: 'เลข AP แม่: -', bodyStyle: 'padding:8px;font-size:14px'});
        var retry = new Ext.Button({text: 'โหลดข้อมูลอีกครั้ง', hidden: true, handler: function () { loadParent(); }});
        panel.add(motherSummary, status, retry, enabled, details, reason, save);
        panel.getSelectedParentAPs = function () {
            var ids = [];
            for (var key in selected) if (Object.prototype.hasOwnProperty.call(selected,key)) ids.push(Number(key));
            return ids;
        };
        panel.doLayout();
        function loadParent() {
        ready = false;
        enabled.disable(); save.disable(); retry.hide();
        setPanelHtml(status, 'กำลังโหลดข้อมูลใบแม่ / AP ลูก...');
        Ext.Ajax.request({url: 'tor/api/checkingAdmin.php', method: 'GET', timeout: 30000, params: {mode: 'parent_load', sp_check_period_hdr_id: id},
            callback: function (options, success, response) {
                if (panel.destroyed || panel.isDestroyed) return;
                var result;
                try { result = Ext.decode(response.responseText); } catch (ignore) {}
                if (!success || !result || !result.success) {
                    setPanelHtml(status, encode(result && result.msg || 'โหลดข้อมูลไม่ได้ กรุณาตรวจสอบว่าได้รัน SQL เพิ่มฟิลด์แล้ว'));
                    retry.show(); panel.doLayout(); return;
                }
                csrf = result.csrf_token; snapshot = result.snapshot;
                var mother;
                Ext.each(result.data, function (row) {
                    if (Number(row.sp_check_period_hdr_id) === id) mother = row;
                });
                if (!mother) {
                    setPanelHtml(status, 'ไม่พบข้อมูลใบตรวจรับที่เปิดอยู่');
                    retry.show(); panel.doLayout(); return;
                }
                showSavedChildren(result.data);
                reason.setValue(result.reason || '');
                if (mother && Number(mother.parent_id) > 0) {
                    setPanelHtml(status, 'AP นี้เป็นลูกของใบตรวจรับ ID ' + Number(mother.parent_id) + ' จึงไม่สามารถตั้งเป็นใบแม่ได้');
                    panel.doLayout(); return;
                }
                ready = true; enabled.enable(); save.enable();
                setPanelHtml(status, 'โหลดข้อมูลแล้ว สามารถกำหนดใบแม่และเลือก AP ลูกได้');
                panel.doLayout();
            }});
        }
        loadParent();
    };
}());
