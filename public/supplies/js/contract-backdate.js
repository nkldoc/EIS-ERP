(function () {
    if (typeof Ext.openBackdateRequests === 'function') return;
    // IIS canonical URLs are extensionless, preserving POST bodies across routing.
    var endpoint = '/supplies/sp/tor/api/contractBackdateRequest', token = '';
    var labels = {pending:'รอพิจารณา', approved:'อนุมัติแล้ว', rejected:'ไม่อนุมัติ', used:'ออกเลขแล้ว'};
    function encode(value) { return Ext.util.Format.htmlEncode(String(value || '')); }
    function call(params, done, quiet) {
        params.csrf = token;
        Ext.Ajax.request({url:endpoint, method:'POST', params:params, callback:function (options, ok, response) {
            var result;
            try { result = Ext.decode(response.responseText); } catch (e) {}
            if (!ok || !result || !result.success) {
                if (!quiet) Ext.Msg.alert('คำขอออกเลขย้อนหลัง', result && result.msg || 'ไม่สามารถติดต่อระบบคำขอได้');
                if (done) done(null);
                return;
            }
            if (result.csrf) token = result.csrf;
            if (done) done(result);
        }});
    }
    Ext.openBackdateRequests = function () {
        call({mode:'LIST'}, function (result) {
            if (!result) return;
            var store = new Ext.data.JsonStore({fields:['request_id','contract_id','tor_id','requested_date','reason','status','created_at','decision_reason','decided_at','requester_name','contract_code'], data:result.data});
            var win;
            function reload() { call({mode:'LIST'},function (r) { if (r) { store.loadData(r.data); Ext.refreshBackdateBadge(); } }); }
            function details() {
                var row = grid.getSelectionModel().getSelected();
                if (!row) { Ext.Msg.alert('คำขอ', 'กรุณาเลือกรายการคำขอ'); return; }
                var r = row.data;
                var note = new Ext.form.TextArea({fieldLabel:'เหตุผลพิจารณา',maxLength:2000,anchor:'98%',height:75});
                var detail;
                function decide(status) {
                    if (status === 'rejected' && !note.getValue().trim()) { Ext.Msg.alert('คำขอ','กรุณากรอกเหตุผลที่ไม่อนุมัติ'); return; }
                    Ext.Msg.confirm('ยืนยันผลพิจารณา',status === 'approved' ? 'อนุมัติคำขอนี้ใช่หรือไม่?' : 'ไม่อนุมัติคำขอนี้ใช่หรือไม่?',function (answer) {
                        if (answer !== 'yes') return;
                        call({mode:'DECIDE',request_id:r.request_id,decision:status,decision_reason:note.getValue()}, function (response) {
                            if (response) { detail.close(); reload(); Ext.Msg.alert('คำขอ',response.msg); }
                        });
                    });
                }
                var actions = [];
                if (result.is_approver && r.status === 'pending') {
                    actions.push({text:'อนุมัติ',handler:function () { decide('approved'); }});
                    actions.push({text:'ไม่อนุมัติ',handler:function () { decide('rejected'); }});
                }
                actions.push({text:'ปิด',handler:function () { detail.close(); }});
                detail = new Ext.Window({title:'เหตุผลคำขอ #' + r.request_id,modal:true,width:640,height:480,layout:'fit',autoScroll:true,
                    items:[{xtype:'form',padding:18,labelWidth:110,autoScroll:true,items:[
                        {xtype:'box',autoEl:{tag:'div',html:'<p>ผู้ขอ: '+encode(r.requester_name)+'</p><p>สัญญา ID: '+encode(r.contract_id)+' | วันที่ขอ: '+encode(r.requested_date)+'</p><p>สถานะ: '+encode(labels[r.status])+'</p><b>เหตุผลคำขอ</b><p style="white-space:pre-wrap;word-break:break-word">'+encode(r.reason)+'</p><p style="white-space:pre-wrap">ผลพิจารณา: '+encode(r.decision_reason)+'</p>'}},
                        note
                    ]}],buttons:actions});
                detail.show();
            }
            var grid = new Ext.grid.GridPanel({store:store,border:false,autoExpandColumn:'backdate-reason',sm:new Ext.grid.RowSelectionModel({singleSelect:true}),
                columns:[{header:'คำขอ',dataIndex:'request_id',width:55},{header:'ผู้ขอ',dataIndex:'requester_name',width:155,renderer:encode},
                    {header:'สัญญา ID',dataIndex:'contract_id',width:80},{header:'วันที่ย้อนหลัง',dataIndex:'requested_date',width:95},
                    {header:'สถานะ',dataIndex:'status',width:100,renderer:function (v) {return encode(labels[v]);}},
                    {header:'เหตุผล',id:'backdate-reason',dataIndex:'reason',renderer:encode}],
                listeners:{rowdblclick:details},tbar:[{text:'ดูเหตุผล / พิจารณา',handler:details},{text:'รีเฟรช',handler:reload}]});
            win = new Ext.Window({title:result.is_approver ? 'คำขอออกเลขย้อนหลัง — หัวหน้าพัสดุ' : 'คำขอออกเลขย้อนหลังของฉัน',modal:true,
                width:Math.min(1050,Ext.getBody().getViewSize().width-30),height:Math.min(600,Ext.getBody().getViewSize().height-30),layout:'fit',items:[grid]});
            win.show();
        });
    };
    Ext.requestBackdateContract = function () {
        var contractId = Ext.SelectStore && Ext.SelectStore.data.sp_tor_contract_id;
        if (!contractId) { Ext.Msg.alert('คำขอ','กรุณาบันทึกรายละเอียดสัญญาก่อนส่งคำขอออกเลขย้อนหลัง'); return; }
        call({mode:'LIST'}, function (result) {
            if (!result) return;
            var date = new Ext.form.DateField({fieldLabel:'วันที่ย้อนหลัง',format:'d-m-Y',allowBlank:false,maxValue:new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()-1),anchor:'95%'});
            var reason = new Ext.form.TextArea({fieldLabel:'เหตุผล',allowBlank:false,maxLength:2000,height:140,anchor:'95%'});
            var win = new Ext.Window({title:'ขออนุมัติออกเลขสัญญาย้อนหลัง',width:600,height:350,modal:true,layout:'fit',items:[{xtype:'form',padding:20,labelWidth:100,items:[
                {xtype:'box',autoEl:{tag:'p',html:'ส่งถึง: ภูริวัชร์ เชาว์โรจนนนท์ — หัวหน้าฝ่ายพัสดุ'}},date,reason
            ]}],buttons:[{text:'ส่งคำขอ',handler:function (button) {
                if (!date.isValid() || !reason.isValid() || !reason.getValue().trim()) return;
                button.disable();
                call({mode:'REQUEST',contract_id:contractId,tor_id:Ext.HDR_ID,requested_date:date.getValue().format('Y-m-d'),reason:reason.getValue()},function (response) {
                    if (!button.destroyed) button.enable();
                    if (response) { win.close(); Ext.Msg.alert('คำขอ',response.msg); }
                });
            }},{text:'ปิด',handler:function () {win.close();}}]});
            win.show();
        });
    };
    Ext.applyApprovedBackdate = function () {
        var id = Ext.SelectStore && Ext.SelectStore.data.sp_tor_contract_id;
        if (!id) { Ext.requestBackdateContract(); return; }
        call({mode:'LIST'},function (result) {
            if (!result) return;
            var match = null;
            Ext.each(result.data,function (r) {if (Number(r.contract_id) === Number(id) && r.status === 'approved') match = r;});
            if (!match) { Ext.requestBackdateContract(); return; }
            Ext.contractDateLock.release();
            var field = Ext.getCmp('d_contract_dateID');
            field.setReadOnly(false);
            field.setValue(Date.parseDate(match.requested_date,'Y-m-d'));
            field.setReadOnly(true);
            d_doc_dateID_Change();
            Ext.Msg.alert('คำขอ','อนุมัติแล้ว ใช้วันที่ '+encode(match.requested_date)+' ตามคำขอ สามารถกดออกเลขสัญญาได้');
        });
    };
    Ext.refreshBackdateBadge = function () {
        if (!Ext.getCmp('backdate-request-notification')) return;
        call({mode:'LIST'},function (result) {
            if (!result) return;
            var button = Ext.getCmp('backdate-request-notification');
            if (button) button.setText((result.is_approver ? 'คำขอย้อนหลังรออนุมัติ' : 'คำขอออกเลขย้อนหลัง')+' ('+result.pending+')');
        },true);
    };
    Ext.onReady(function () { Ext.refreshBackdateBadge(); window.setInterval(Ext.refreshBackdateBadge,30000); });
}());
