/* Admin-only PR assignment and employee directory. */
var adminManagementUrl = 'adminupdatepr/php/AdminManagement.php';
function adminStore(action, fields) {
    var store = new Ext.data.JsonStore({url: adminManagementUrl, baseParams: {action: action}, root: 'data', totalProperty: 'totalCount', fields: fields});
    store.on('loadexception', function (proxy, options, response) {
        var message = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่';
        try { message = Ext.decode(response.responseText).msg || message; } catch (e) {}
        Ext.Msg.alert('ข้อผิดพลาด', message);
    });
    return store;
}
function adminRequest(action, params, done, complete) {
    params.action = action;
    Ext.Ajax.request({url: adminManagementUrl, method: 'POST', params: params,
        success: function (response) {
            var result;
            try { result = Ext.decode(response.responseText); } catch (e) { result = {success: false, msg: 'คำตอบจากเซิร์ฟเวอร์ไม่ถูกต้อง'}; }
            if (!result.success) Ext.Msg.alert('ข้อผิดพลาด', result.msg || 'ดำเนินการไม่สำเร็จ');
            else if (done) done(result);
        },
        failure: function () { Ext.Msg.alert('ข้อผิดพลาด', 'ไม่สามารถติดต่อเซิร์ฟเวอร์'); },
        callback: function () { if (complete) complete(); }
    });
}
function adminEnableForPermission(button, permissionKey) {
    Ext.Ajax.request({url: adminManagementUrl, method: 'GET', params: {action: 'permissions'},
        success: function (response) {
            try {
                var permission = Ext.decode(response.responseText);
                if (permission.success && permission[permissionKey]) button.enable();
                else if (!permission.success) Ext.Msg.alert('ตรวจสอบสิทธิ์', permission.msg || 'ไม่สามารถตรวจสอบสิทธิ์จัดการ');
            } catch (e) { Ext.Msg.alert('ตรวจสอบสิทธิ์', 'ไม่สามารถตรวจสอบสิทธิ์จัดการ'); }
        },
        failure: function () { Ext.Msg.alert('ตรวจสอบสิทธิ์', 'ไม่สามารถตรวจสอบสิทธิ์จัดการ'); }
    });
}
function adminEmployeeCombo(store, label) {
    var combo = new Ext.form.ComboBox({fieldLabel: label, store: store, displayField: 'search_label', valueField: 'id',
        mode: 'local', triggerAction: 'all', editable: true, forceSelection: true, typeAhead: false,
        width: 300, listWidth: 500, emptyText: 'พิมพ์ชื่อ สายงาน หรือ emp_code',
        tpl: new Ext.XTemplate('<tpl for="."><div class="x-combo-list-item">{search_label:htmlEncode}</div></tpl>')});
    combo.on('beforequery', function (event) {
        var value = String(event.query || '').toLowerCase();
        store.clearFilter();
        if (value) store.filterBy(function (record) {
            return String(record.get('search_label') || '').toLowerCase().indexOf(value) !== -1;
        });
        combo.lastQuery = value;
        combo.selectedIndex = -1;
        combo.onLoad();
        event.cancel = true;
    });
    return combo;
}
function createPrTransferTab() {
    var fields = ['id', 'emp_code', 'c_name', 'c_department', 'search_label', 'department_name', 'i_enable'];
    var sourceEmployees = adminStore('employees', fields);
    var targetEmployees = adminStore('employees', fields);
    Ext.adminTransferEmployeeStores = [sourceEmployees, targetEmployees];
    var prs = adminStore('prs', ['id', 'c_code', 'c_name']);
    var source = adminEmployeeCombo(sourceEmployees, 'จากพนักงาน');
    var target = adminEmployeeCombo(targetEmployees, 'ไปยังพนักงาน');
    var today = new Date();
    var currentYear = today.getFullYear() + (today.getMonth() >= 9 ? 1 : 0);
    var yearOptions = [[0, 'ทุกปี']];
    for (var year = currentYear + 2; year >= 2000; year--) yearOptions.push([year, String(year + 543)]);
    var fiscalYear = new Ext.form.ComboBox({fieldLabel: 'ปีงบประมาณ', labelSeparator: ':',
        store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: yearOptions}),
        displayField: 'name', valueField: 'id', value: currentYear, mode: 'local',
        triggerAction: 'all', editable: false, width: 76});
    function employeeInfo() {
        return new Ext.BoxComponent({autoEl: {tag: 'div', html: 'เลือกพนักงานเพื่อดูรายละเอียด'},
            style: 'margin: 6px 12px 0 0; padding: 9px 12px; min-height: 62px; line-height: 21px; background: #fff; border: 1px solid #c5d5e8; border-radius: 4px; color: #40546b;'});
    }
    var sourceInfo = employeeInfo();
    var targetInfo = employeeInfo();
    function showEmployee(info, record) {
        var encode = Ext.util.Format.htmlEncode;
        info.getEl().update('<b>ชื่อ:</b> ' + encode(String(record.get('c_name') || '-')) + '<br><b>สายงาน:</b> ' +
            encode(String(record.get('c_department') || record.get('department_name') || '-')) +
            '<br><b>emp_code:</b> ' + encode(String(record.get('emp_code') == null || record.get('emp_code') === '' ? '-' : record.get('emp_code'))));
    }
    var selection = new Ext.grid.CheckboxSelectionModel();
    function showDetails(record) {
        Ext.showContractDetails(record, {sp_tor_id: record.get('id') || record.get('tor_id'), initialTab: 0, adminPrManagement: true});
    }
    var grid = new Ext.grid.GridPanel({store: prs, region: 'center', autoExpandColumn: 'pr_name',
        viewConfig: {emptyText: 'เลือกพนักงานต้นทางเพื่อแสดงรายการ PR หรือไม่พบ PR ของพนักงาน', deferEmptyText: false},
        sm: selection,
        columns: [selection, {id: 'pr_details', header: 'รายละเอียดทั้งหมด', width: 125, align: 'center',
            renderer: function () { return '<span style="cursor:pointer;color:#15428b"><img src="../images/icons/book_magnify.png" alt=""> ดูรายละเอียด</span>'; }},
            {header: 'เลข PR', dataIndex: 'c_code', width: 160, renderer: Ext.util.Format.htmlEncode},
            {id: 'pr_name', header: 'ชื่อรายการ', dataIndex: 'c_name', renderer: Ext.util.Format.htmlEncode}]});
    grid.on('cellclick', function (panel, row, column) {
        if (panel.getColumnModel().getColumnId(column) === 'pr_details') showDetails(panel.store.getAt(row));
    });
    function showHistory() {
        var history = adminStore('history', ['id', 'tor_id', 'pr_code', 'pr_name', 'source_emp_name', 'target_emp_name', 'actor_user_name', 'actor_user_id', 'transferred_at']);
        var historyGrid = new Ext.grid.GridPanel({store: history, autoExpandColumn: 'history_name',
            viewConfig: {emptyText: 'ยังไม่มีประวัติการย้าย PR', deferEmptyText: false},
            columns: [
                {id: 'history_details', header: 'ข้อมูลที่เปลี่ยน', width: 115, renderer: function () { return '<span style="cursor:pointer;color:#15428b">ดูรายละเอียด</span>'; }},
                {header: 'วันที่และเวลาย้าย', dataIndex: 'transferred_at', width: 145},
                {header: 'เลข PR', dataIndex: 'pr_code', width: 130, renderer: Ext.util.Format.htmlEncode},
                {id: 'history_name', header: 'ชื่อรายการ', dataIndex: 'pr_name', renderer: Ext.util.Format.htmlEncode},
                {header: 'จากพนักงาน', dataIndex: 'source_emp_name', width: 150, renderer: Ext.util.Format.htmlEncode},
                {header: 'ไปยังพนักงาน', dataIndex: 'target_emp_name', width: 150, renderer: Ext.util.Format.htmlEncode},
                {header: 'ผู้บันทึก', dataIndex: 'actor_user_name', width: 140, renderer: Ext.util.Format.htmlEncode}],
            bbar: new Ext.PagingToolbar({store: history, pageSize: 50, displayInfo: true, displayMsg: 'รายการ {0} - {1} จาก {2}', emptyMsg: 'ไม่มีประวัติ'})});
        historyGrid.on('cellclick', function (panel, row, column) {
            if (panel.getColumnModel().getColumnId(column) !== 'history_details') return;
            var record = panel.store.getAt(row);
            var detailStore = adminStore('history_details', ['id', 'table_name', 'row_id', 'old_sp_emp_id', 'new_sp_emp_id']);
            var detailGrid = new Ext.grid.GridPanel({store: detailStore, columns: [
                {header: 'ตาราง', dataIndex: 'table_name', width: 175},
                {header: 'รหัสรายการ', dataIndex: 'row_id', width: 110},
                {header: 'sp_emp_id เดิม', dataIndex: 'old_sp_emp_id', width: 115},
                {header: 'sp_emp_id ใหม่', dataIndex: 'new_sp_emp_id', width: 115}],
                viewConfig: {emptyText: 'ไม่มีรายละเอียดแถวสำหรับประวัติรายการนี้', deferEmptyText: false}});
            var detailWindow = new Ext.Window({title: 'ข้อมูลที่เปลี่ยน — ' + Ext.util.Format.htmlEncode(record.get('pr_code') || ''),
                width: 570, height: 400, modal: true, layout: 'fit', items: [detailGrid],
                buttons: [{text: 'ปิด', handler: function () { detailWindow.close(); }}]});
            detailWindow.show(); detailStore.load({params: {id: record.get('id')}});
        });
        var win = new Ext.Window({title: 'ประวัติการย้าย PR', width: Math.min(1150, Ext.getBody().getViewSize().width - 30),
            height: Math.min(600, Ext.getBody().getViewSize().height - 30), layout: 'fit', modal: true, maximizable: true,
            items: [historyGrid], buttons: [{text: 'ปิด', handler: function () { win.close(); }}]});
        win.show(); history.load({params: {start: 0, limit: 50}});
    }
    var search = function () {
        if (!source.getValue()) return Ext.Msg.alert('ข้อมูลไม่ครบ', 'เลือกพนักงานต้นทาง');
        selection.clearSelections();
        prs.removeAll();
        prs.load({params: {source: source.getValue(), year: fiscalYear.getValue()}});
    };
    source.on('select', function (combo, record) { showEmployee(sourceInfo, record); search(); });
    target.on('select', function (combo, record) { showEmployee(targetInfo, record); });
    fiscalYear.on('select', function () { if (source.getValue()) search(); });
    var saving = false;
    var transfer = function () {
        if (saving) return;
        var selected = grid.getSelectionModel().getSelections();
        if (!source.getValue() || !target.getValue() || source.getValue() == target.getValue() || !selected.length)
            return Ext.Msg.alert('ข้อมูลไม่ครบ', 'เลือกพนักงานต้นทาง ปลายทาง และรายการ PR');
        if (selected.length > 500) return Ext.Msg.alert('จำนวนรายการ', 'เลือกได้ครั้งละไม่เกิน 500 รายการ');
        var ids = [];
        for (var i = 0; i < selected.length; i++) ids.push(selected[i].get('id'));
        var sourceId = source.getValue(), targetId = target.getValue();
        Ext.Msg.confirm('ยืนยันการย้าย PR', 'ย้าย PR จำนวน ' + ids.length + ' รายการ<br>จาก: ' + Ext.util.Format.htmlEncode(source.getRawValue()) + '<br>ไปยัง: ' + Ext.util.Format.htmlEncode(target.getRawValue()) + '<br><br>ระบบจะย้ายผู้รับผิดชอบเดิมใน PR สัญญา งวดงาน และตรวจรับที่เกี่ยวข้อง<br>ยืนยันการบันทึกหรือไม่?', function (answer) {
            if (answer !== 'yes') return;
            saving = true;
            saveButton.disable();
            adminRequest('transfer', {source: sourceId, target: targetId, ids: Ext.encode(ids)}, function (result) {
                var counts = result.changed || {};
                Ext.Msg.alert('สำเร็จ', result.msg + '<br><br>PR: ' + (counts.sp_tor || 0) +
                    ' | สัญญา: ' + (counts.sp_tor_contract || 0) + ' | งานสัญญา: ' + (counts.sp_mn_contract_hdr || 0) +
                    '<br>งวดงาน: ' + (counts.sp_tor_hdr_period || 0) + ' | ตรวจรับ: ' + (counts.sp_check_period_hdr || 0));
                search();
                if (Ext.store) Ext.store.reload();
            }, function () { saving = false; saveButton.enable(); });
        });
    };
    var saveButton = new Ext.Button({text: 'บันทึกการย้ายงาน', iconCls: 'icon-save', disabled: true, handler: transfer});
    adminEnableForPermission(saveButton, 'can_transfer');
    sourceEmployees.load();
    targetEmployees.load();
    return new Ext.Panel({title: 'ย้าย PR ระหว่างพนักงาน', layout: 'border',
        items: [{region: 'north', height: 145, layout: 'column', border: false, bodyStyle: 'padding:10px',
            items: [{layout: 'anchor', border: false, columnWidth: .49, items: [
                    {layout: 'column', border: false, items: [
                        {layout: 'form', border: false, columnWidth: .70, items: [source]},
                        {layout: 'form', border: false, columnWidth: .30, labelWidth: 85, items: [fiscalYear]}]},
                    sourceInfo]},
                {layout: 'form', border: false, columnWidth: .40, items: [target, targetInfo]},
                {border: false, columnWidth: .11, items: [{xtype: 'button', text: 'ค้นหา PR', handler: search}]}]}, grid],
        bbar: [saveButton, '-', {text: 'ประวัติการย้าย PR', handler: showHistory},
            '->', {text: 'เลือกทั้งหมด', handler: function () { grid.getSelectionModel().selectAll(); }}]});
}
function createEmployeeManagementTab() {
    var employees = adminStore('employees', ['id', 'emp_code', 'c_name', 'search_label', 'department_name', 'dc_department_id', 'c_department', 'i_parent', 'i_level', 'i_enable']);
    var departments = adminStore('departments', ['id', 'c_name', 'line_name']);
    var query = new Ext.form.TextField({width: 260, emptyText: 'ชื่อ สายงาน หรือ emp_code'});
    var lineFilter = new Ext.form.ComboBox({store: departments, displayField: 'line_name', valueField: 'id',
        mode: 'local', triggerAction: 'all', editable: false, width: 220, emptyText: 'ทุกสายงาน'});
    function searchEmployees() {
        employees.setBaseParam('q', query.getValue());
        employees.setBaseParam('department', lineFilter.getValue() || 0);
        employees.load();
    }
    lineFilter.on('select', searchEmployees);
    query.on('specialkey', function (field, event) { if (event.getKey() === event.ENTER) searchEmployees(); });
    var grid = new Ext.grid.GridPanel({store: employees, region: 'center', autoExpandColumn: 'employee_name',
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        columns: [{id: 'employee_name', header: 'ชื่อพนักงาน', dataIndex: 'c_name'},
            {header: 'emp_code', dataIndex: 'emp_code', width: 110},
            {header: 'หน่วยงาน', dataIndex: 'department_name', width: 220},
            {header: 'สายงาน', dataIndex: 'c_department', width: 220},
            {header: 'รหัสหัวหน้าสายงาน', dataIndex: 'i_parent', width: 125}]});
    function edit() {
        var row = grid.getSelectionModel().getSelected();
        if (!row) return Ext.Msg.alert('ข้อมูลไม่ครบ', 'เลือกพนักงาน');
        var name = new Ext.form.TextField({fieldLabel: 'ชื่อพนักงาน', value: row.get('c_name'), allowBlank: false, maxLength: 255, anchor: '95%'});
        var department = new Ext.form.ComboBox({fieldLabel: 'หน่วยงาน', store: departments, displayField: 'c_name', valueField: 'id',
            mode: 'local', triggerAction: 'all', editable: true, forceSelection: true, width: 300});
        department.setValue(row.get('dc_department_id'));
        var parentEmployees = adminStore('employees', ['id', 'c_name', 'search_label']);
        var parent = adminEmployeeCombo(parentEmployees, 'หัวหน้าสายงาน');
        parentEmployees.load({callback: function () { if (row.get('i_parent')) parent.setValue(row.get('i_parent')); }});
        var currentCode = String(row.get('emp_code') || '').replace(/^\s+|\s+$/g, '');
        var code = new Ext.form.TextField({fieldLabel: 'emp_code', readOnly: true, width: 300,
            value: currentCode || 'กำลังตรวจสอบรหัสถัดไป...'});
        if (!currentCode) Ext.Ajax.request({url: adminManagementUrl, method: 'GET', params: {action: 'next_emp_code'},
            success: function (response) {
                try {
                    var result = Ext.decode(response.responseText);
                    code.setValue(result.success ? result.emp_code + ' (กำหนดเมื่อบันทึก)' : 'กำหนดรหัสเมื่อบันทึก');
                } catch (e) { code.setValue('กำหนดรหัสเมื่อบันทึก'); }
            }, failure: function () { code.setValue('กำหนดรหัสเมื่อบันทึก'); }
        });
        var window = new Ext.Window({title: 'จัดการพนักงานและสายงาน', modal: true, width: 550, height: 280,
            layout: 'fit', items: [{xtype: 'form', labelWidth: 120, bodyStyle: 'padding:15px', items: [name, department, parent, code]}],
            buttons: [{text: 'บันทึก', handler: function () {
                if (!name.isValid() || !department.getValue()) return Ext.Msg.alert('ข้อมูลไม่ครบ', 'กรอกชื่อและหน่วยงาน');
                adminRequest('employee', {id: row.get('id'), name: name.getValue(), department: department.getValue(),
                    parent: parent.getValue() || ''}, function (result) {
                    window.close(); employees.reload(); Ext.sp_emp.reload();
                    Ext.each(Ext.adminTransferEmployeeStores || [], function (store) { store.reload(); });
                    Ext.Msg.alert('สำเร็จ', result.msg);
                });
            }}, {text: 'ยกเลิก', handler: function () { window.close(); }}]});
        window.show();
    }
    var editButton = new Ext.Button({text: 'แก้ไขพนักงาน/สายงาน', disabled: true, handler: edit});
    adminEnableForPermission(editButton, 'can_manage_employees');
    departments.load(); employees.load();
    return new Ext.Panel({title: 'จัดการพนักงานและสายงาน', layout: 'border',
        tbar: ['ค้นหาพนักงาน:', query, 'สายงาน:', lineFilter, {text: 'ค้นหา', handler: searchEmployees},
            {text: 'แสดงทั้งหมด', handler: function () { query.setValue(''); lineFilter.clearValue(); searchEmployees(); }},
            '-', editButton],
        items: [grid]});
}
