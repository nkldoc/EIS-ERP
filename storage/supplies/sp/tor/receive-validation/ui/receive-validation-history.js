/* global Ext */
Ext.ns('Ext.receiveValidation');

Ext.receiveHistory = function (context) {
    context = context || {};
    var api = 'tor/receive-validation/api/', todayText = Ext.util.Format.date(new Date(), 'Y-m-d');
    context.date_from = context.date_from || todayText;
    context.date_to = context.date_to || todayText;
    var encoded = Ext.encode(context);
    var labels = {
        sp_check_period_hdr_id: 'รหัสตรวจรับ', sp_tor_hdr_period_id: 'รหัสงวด', sp_check_period_dtl_id: 'รหัสรายละเอียด',
        sp_tranf_item_id: 'รหัสรายการ', c_name: 'ชื่อรายการ', f_net_total_price: 'จำนวนเงิน', f_vat_amt: 'ภาษีมูลค่าเพิ่ม',
        dc_bg_budget_type_id: 'แหล่งเงิน', i_enabled: 'สถานะใช้งาน', d_doc_arrive_dt: 'วันที่รับของ/เอกสารสมบูรณ์',
        d_checking_date: 'วันที่บันทึกการตรวจรับ', old_i_enabled: 'สถานะเดิม', new_i_enabled: 'สถานะใหม่',
        table_name: 'ตาราง', action: 'การดำเนินการ', document_number: 'เลขเอกสาร/เลขตรวจรับ', status: 'สถานะ',
        details: 'รายละเอียด', booking_code: 'เลขจดจอง', booking_url: 'ลิงก์การจดจอง', row_id: 'รหัสแถว',
        field_name: 'ชื่อฟิลด์', value: 'ค่า'
    };
    function safe(v) { return Ext.util.Format.htmlEncode(v === null || v === undefined || v === '' ? '-' : String(v)); }
    function parseJson(value) {
        if (!value) return [];
        try { value = Ext.decode(value); } catch (e) { return [{message: value}]; }
        return Ext.isArray(value) ? value : [value];
    }
    function valueText(key, value) {
        if (key.indexOf('f_') === 0 && !isNaN(parseFloat(value))) return Ext.util.Format.number(parseFloat(value), '0,000.00');
        if (key === 'i_enabled' && String(value) === '1') return '1 — เปิดใช้งาน';
        if (key === 'i_enabled' && String(value) === '2') return '2 — ถูกยกเลิก';
        if (key === 'dc_bg_budget_type_id' && String(value) === '49') return '49 — เงินรายได้ส่วนงาน';
        return safe(value);
    }
    function jsonCards(value, title, color) {
        var rows = parseJson(value), html = ['<div style="padding:10px"><h3 style="margin:0 0 8px;color:' + color + '">' + safe(title) + '</h3>'];
        if (!rows.length) html.push('<div style="color:#888">ไม่มีข้อมูล</div>');
        Ext.each(rows, function (row, index) {
            html.push('<div style="margin-bottom:8px;padding:8px;border-left:4px solid ' + color + ';background:#fafafa">');
            if (rows.length > 1) html.push('<b>รายการที่ ' + (index + 1) + '</b>');
            Ext.iterate(row, function (key, val) {
                var label = labels[key] || key.replace(/_/g, ' ');
                html.push('<div style="padding:2px 0"><span style="display:inline-block;width:190px;color:#666">' + safe(label) + '</span><b>' + valueText(key, val) + '</b></div>');
            });
            html.push('</div>');
        });
        html.push('</div>'); return html.join('');
    }
    var store = new Ext.data.JsonStore({url: api + 'validationHistory.php', root: 'rows', idProperty: 'sp_check_fix_case_log_id',
        baseParams: {context: encoded}, fields: ['sp_check_fix_case_log_id','sp_check_fix_case_id','c_case_code','c_case_name','i_severity',
            'i_version_no','c_status','before_json','after_json','parameter_json','dc_user_id','d_create','c_error_message',
            'c_source','table_name','action_name','document_number','booking_url']});
    var beforePanel = new Ext.Panel({title: 'ข้อมูลก่อนแก้ไข', region: 'west', width: 535, split: true, autoScroll: true, html: '<div style="padding:15px;color:#888">เลือกรายการประวัติด้านบน</div>'});
    var afterPanel = new Ext.Panel({title: 'ข้อมูลหลังแก้ไข', region: 'center', autoScroll: true, html: '<div style="padding:15px;color:#888">เลือกรายการประวัติด้านบน</div>'});
    var dateFieldConfig = {width:110,allowBlank:false,emptyText:'YYYY-MM-DD',selectOnFocus:true};
    var dateFromField = new Ext.form.TextField(Ext.apply({value:context.date_from},dateFieldConfig));
    var dateToField = new Ext.form.TextField(Ext.apply({value:context.date_to},dateFieldConfig));
    function loadByDateRange() {
        var dateFrom = String(dateFromField.getValue() || '').replace(/^\s+|\s+$/g,''),
            dateTo = String(dateToField.getValue() || '').replace(/^\s+|\s+$/g,''),
            datePattern = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
        if (!dateFrom || !dateTo) return Ext.Msg.alert('ข้อมูลไม่ครบ','กรุณาระบุวันที่ตั้งแต่และถึงวันที่');
        if (!datePattern.test(dateFrom) || !datePattern.test(dateTo)) return Ext.Msg.alert('รูปแบบวันที่ไม่ถูกต้อง','กรุณากรอกวันที่รูปแบบ YYYY-MM-DD เช่น 2026-01-31');
        if (dateFrom > dateTo) return Ext.Msg.alert('ช่วงวันที่ไม่ถูกต้อง','วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
        context.date_from = dateFrom;
        context.date_to = dateTo;
        store.baseParams.context = Ext.encode(context);
        store.load();
    }
    dateFromField.on('specialkey',function(field,event){if(event.getKey()===event.ENTER)loadByDateRange();});
    dateToField.on('specialkey',function(field,event){if(event.getKey()===event.ENTER)loadByDateRange();});
    var grid = new Ext.grid.GridPanel({region: 'north', height: 240, split: true, store: store, stripeRows: true,loadMask:true,
        columns: [new Ext.grid.RowNumberer(),
            {header:'วันที่/เวลา',dataIndex:'d_create',width:135},{header:'แหล่ง Log',dataIndex:'c_source',width:90},
            {header:'ตาราง',dataIndex:'table_name',width:145},{header:'ทำอะไร',dataIndex:'c_case_name',width:240},
            {header:'เลขตรวจรับ/เอกสาร',dataIndex:'document_number',width:145},
            {header:'สถานะ',dataIndex:'c_status',width:120},{header:'ผู้ดำเนินการ',dataIndex:'dc_user_id',width:90},
            {header:'Error',dataIndex:'c_error_message',width:180,renderer:function(v){return v?'<span style="color:red">'+safe(v)+'</span>':'-';}},
            {header:'การจดจอง',dataIndex:'booking_url',width:100,renderer:function(v){return v?'<a href="'+safe(v)+'" target="_blank">เปิดใบจดจอง</a>':'-';}}
        ], tbar: ['ตั้งแต่วันที่',dateFromField,'ถึงวันที่',dateToField,
            {text:'ค้นหา Logs',iconCls:'icon-search',handler:loadByDateRange},
            {text:'วันนี้',handler:function(){dateFromField.setValue(todayText);dateToField.setValue(todayText);loadByDateRange();}},'-',
            {text:'รีเฟรช',iconCls:'icon-refresh',handler:loadByDateRange},'-','แสดงสูงสุด 50 รายการล่าสุด',
            {text:'คัดลอกข้อมูลก่อนแก้ไข',iconCls:'icon-page-copy',handler:function(){var r=grid.getSelectionModel().getSelected();if(!r)return Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกรายการ');var a=document.createElement('textarea');a.value=r.get('before_json')||'';document.body.appendChild(a);a.select();document.execCommand('copy');document.body.removeChild(a);Ext.Msg.alert('คัดลอกแล้ว','คัดลอกข้อมูลก่อนแก้ไขแล้ว');}}],
        listeners: {rowclick: function (g) {var r=g.getSelectionModel().getSelected();if(!r)return;beforePanel.body.update(jsonCards(r.get('before_json'),'ก่อนแก้ไข','#d9534f'));afterPanel.body.update(jsonCards(r.get('after_json'),'หลังแก้ไข','#5cb85c'));beforePanel.body.scrollTo('top',0);afterPanel.body.scrollTo('top',0);}}
    });
    var viewSize = Ext.getBody().getViewSize(), windowWidth = Math.max(300, Math.min(1280, viewSize.width - 30)),
        windowHeight = Math.max(300, Math.min(750, viewSize.height - 30));
    var win = new Ext.Window({title:'Logs หน้าตรวจรับ — การบันทึก/ออกเลข/Error/การจดจอง',width:windowWidth,height:windowHeight,
        modal:true,minimizable:true,maximizable:true,closable:true,collapsible:true,constrain:true,constrainHeader:true,layout:'border',
        listeners:{minimize:function(windowPanel){windowPanel.collapse();}},
        items:[grid,beforePanel,afterPanel],buttons:[{text:'ปิด',iconCls:'icon-cancel',handler:function(){win.close();}}]});
    win.show(); loadByDateRange();
};
