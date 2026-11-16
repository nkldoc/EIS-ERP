// เมนู "อนุมัติยกเลิก PR" สำหรับผู้ใช้ จัดสรรงบประมาณพัสดุ (dc_user_id 60104)
// แสดงคำขอยกเลิก PR จากหน้าตรวจสอบเอกสาร พร้อมสาเหตุ -> อนุมัติ (ยกเลิก PR + คืนเงินจองทันที) / ไม่อนุมัติ
Ext.onReady(function () {
    var API = "tor/api/mnTorCancelReq.php";
    var isApprover = parseInt(Ext.session && Ext.session.user_id, 10) === 60104;
    var curStatus = 1;

    var store = new Ext.data.JsonStore({
        url: API,
        baseParams: {mode: "LIST", i_status: 1},
        root: "data",
        totalProperty: "totalCount",
        autoLoad: true,
        fields: ["id", "tor_id", "c_code", "c_name", "f_total_amt", "sp_emp_name", "c_status_name", "c_reason", "i_status", "n_reserve", "d_req", "c_result_comment", "can_restore", "c_restore_comment"],
    });

    function act(mode, title) {
        var sm = grid.getSelectionModel();
        var rec = sm.getSelected();
        if (!rec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ");
            return;
        }
        var isApprove = mode == "APPROVE";
        Ext.Msg.show({
            title: title + " " + rec.get("c_code"),
            msg:
                "<b>" + rec.get("c_name") + "</b><br>สาเหตุที่ขอยกเลิก: <span style='color:red'>" + rec.get("c_reason") + "</span><br>" +
                (isApprove
                    ? "เมื่ออนุมัติ PR จะถูกยกเลิก" + (rec.get("n_reserve") > 0 ? " และเงินที่จองไว้จะคืนเข้างบประมาณทันที" : "") + "<br>หมายเหตุ (ถ้ามี):"
                    : "กรุณาระบุเหตุผลที่ไม่อนุมัติ:"),
            width: 520,
            buttons: Ext.MessageBox.OKCANCEL,
            multiline: 80,
            fn: function (btn, text) {
                if (btn != "ok") {
                    return;
                }
                if (!isApprove && (Ext.isEmpty(text) || !text.trim())) {
                    Ext.example.msg("แจ้งเตือน", "กรุณากรอกเหตุผล", 1);
                    return;
                }
                Ext.Ajax.request({
                    url: API,
                    method: "POST",
                    params: {mode: mode, id: rec.get("id"), comment: text || ""},
                    success: function (result) {
                        var res = Ext.util.JSON.decode(result.responseText);
                        Ext.MessageBox.alert(res.success ? "Success" : "แจ้งเตือน", res.msg, function () {
                            store.reload();
                        });
                    },
                    failure: function (result) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                    },
                });
            },
        });
    }

    // ดับเบิลคลิกแถว / ปุ่ม "ดูรายละเอียด" : แสดงรายละเอียด PR ให้ผู้อนุมัติตรวจสอบก่อนตัดสินใจ
    var statusText = {1: "รออนุมัติ", 2: "อนุมัติแล้ว (PR ถูกยกเลิก)", 3: "ไม่อนุมัติ", 4: "กู้คืนแล้ว"};
    function showDetail(rec) {
        if (!rec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ");
            return;
        }
        var e = function (v) {
            return Ext.util.Format.htmlEncode(v === null || v === undefined || v === "" ? "-" : String(v));
        };
        var row = function (k, v) {
            return "<tr><td style='width:150px;color:#555;vertical-align:top;padding:3px 6px'>" + k + "</td><td style='padding:3px 6px'>" + v + "</td></tr>";
        };
        var th = "style='background:#eef3fa;text-align:left;padding:4px 6px;border-bottom:1px solid #cdd8e8'";
        var td = "style='padding:4px 6px;border-bottom:1px solid #eee'";
        var title = function (t, first) {
            return "<div style='font-weight:bold;font-size:14px;margin:" + (first ? "0" : "12px") + " 0 4px'>" + t + "</div>";
        };
        Ext.Ajax.request({
            url: API,
            method: "POST",
            params: {mode: "DETAIL", id: rec.get("id")},
            success: function (result) {
                var res = Ext.util.JSON.decode(result.responseText);
                if (!res.success) {
                    Ext.Msg.alert("แจ้งเตือน", res.msg);
                    return;
                }
                var d = res.data, q = d.req;
                var html = "<div style='padding:10px;font-size:13px;font-family:Tahoma,sans-serif'>";
                html += title("คำขอยกเลิก", true) + "<table style='width:100%;border-collapse:collapse'>" +
                    row("สถานะคำขอ", "<b>" + e(statusText[q.status]) + "</b>") +
                    row("ผู้ขอ / วันที่ขอ", e(q.by) + " / " + e(q.d_req)) +
                    row("สถานะ PR ตอนขอ", e(d.status_req)) +
                    row("สาเหตุที่ขอยกเลิก", "<span style='color:#c00'>" + e(q.reason) + "</span>") +
                    (q.status != 1 ? row("หมายเหตุผู้อนุมัติ", e(q.result_comment) + " (" + e(q.d_result) + ")") : "") +
                    (q.status == 4 ? row("หมายเหตุการกู้คืน", e(q.restore_comment) + " (" + e(q.d_restore) + ")") : "") +
                    "</table>";
                html += title("รายละเอียด PR") + "<table style='width:100%;border-collapse:collapse'>" +
                    row("เลขที่ PR", "<b>" + e(d.c_code) + "</b> " + (d.tor_enabled == 2 ? "<span style='color:#c00'>(ถูกยกเลิกแล้ว)</span>" : "")) +
                    row("ชื่อรายการ", e(d.c_name)) +
                    row("จำนวนเงินรวม", "<b>" + e(d.f_total_amt) + "</b> บาท") +
                    row("ปีงบประมาณ", e(d.i_yyyy)) +
                    row("หน่วยงาน", e(d.cost_name)) +
                    row("ผู้รับผิดชอบ", e(d.emp_name)) +
                    row("สถานะปัจจุบัน", e(d.status_now)) +
                    row("รหัสแผน", e(d.plan_code)) +
                    row("วันที่สร้าง PR", e(d.d_create)) +
                    "</table>";
                html += title("แหล่งเงิน");
                if (d.sources.length) {
                    html += "<table style='width:100%;border-collapse:collapse'><tr><th " + th + ">แหล่งเงิน</th><th " + th + " align='right'>จำนวนเงิน</th></tr>";
                    Ext.each(d.sources, function (x) {
                        html += "<tr><td " + td + ">" + e(x.name) + "</td><td " + td + " align='right'>" + e(x.amt) + "</td></tr>";
                    });
                    html += "</table>";
                } else {
                    html += "-";
                }
                html += title("รายการพัสดุ/จ้าง (" + d.items.length + ")");
                if (d.items.length) {
                    html += "<table style='width:100%;border-collapse:collapse'><tr><th " + th + ">รายการ</th><th " + th + " align='right'>จำนวน</th><th " + th + ">หน่วย</th><th " + th + " align='right'>ราคา/หน่วย</th><th " + th + " align='right'>รวม</th></tr>";
                    Ext.each(d.items, function (x) {
                        html += "<tr><td " + td + ">" + e(x.name) + "</td><td " + td + " align='right'>" + e(x.qty) + "</td><td " + td + ">" + e(x.unit) +
                            "</td><td " + td + " align='right'>" + e(x.price) + "</td><td " + td + " align='right'>" + e(x.total) + "</td></tr>";
                    });
                    html += "</table>";
                } else {
                    html += "-";
                }
                html += title("การจองเงิน");
                if (d.reserves.length) {
                    html += "<table style='width:100%;border-collapse:collapse'><tr><th " + th + ">เลขที่การจอง</th><th " + th + ">ปีงบประมาณ</th><th " + th + " align='right'>จำนวนเงิน</th><th " + th + ">สถานะ</th><th " + th + ">วันที่จอง</th></tr>";
                    Ext.each(d.reserves, function (x) {
                        html += "<tr><td " + td + ">" + e(x.id) + "</td><td " + td + ">" + e(x.year) + "</td><td " + td + " align='right'>" + e(x.amt) +
                            "</td><td " + td + ">" + (x.active ? "<b style='color:#c00'>จองอยู่</b>" : "<span style='color:#080'>ยกเลิกการจองแล้ว (คืนงบประมาณแล้ว)</span>") + "</td><td " + td + ">" + e(x.d_create) + "</td></tr>";
                    });
                    html += "</table>";
                } else {
                    html += "ไม่มีการจองเงิน";
                }
                html += "</div>";
                new Ext.Window({
                    title: "รายละเอียด PR " + d.c_code,
                    width: Math.min(900, Ext.getBody().getViewSize().width - 40),
                    height: Math.min(640, Ext.getBody().getViewSize().height - 40),
                    modal: true,
                    maximizable: true,
                    autoScroll: true,
                    bodyStyle: "background:#fff",
                    html: html,
                    buttons: [{text: "ปิด", handler: function () { this.ownerCt.ownerCt.close(); }}],
                }).show();
            },
            failure: function (result) {
                Ext.MessageBox.alert("Failed", result.responseText);
            },
        });
    }

    // กู้คืน PR ที่อนุมัติยกเลิกไปแล้ว (เผื่อ user กดผิด) : PR กลับมาใช้งานต่อ + เปิดการจองเงินเดิมคืน
    function restore() {
        var rec = grid.getSelectionModel().getSelected();
        if (!rec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ");
            return;
        }
        if (!rec.get("can_restore")) {
            Ext.Msg.alert("แจ้งเตือน", "รายการนี้กู้คืนไม่ได้ (PR ไม่ได้อยู่ในสถานะยกเลิกแล้ว)");
            return;
        }
        Ext.Msg.show({
            title: "กู้คืน PR " + rec.get("c_code"),
            msg:
                "<b>" + rec.get("c_name") + "</b><br>PR จะกลับมาใช้งานต่อจากสถานะเดิม" +
                (rec.get("n_reserve") > 0 ? " และเปิดการจองเงินเดิมคืน (" + rec.get("n_reserve") + " รายการ)<br><span style='color:red'>ตรวจสอบก่อนว่างบประมาณพอสำหรับยอดนี้</span>" : "") +
                "<br>หมายเหตุการกู้คืน (ถ้ามี):",
            width: 520,
            buttons: Ext.MessageBox.OKCANCEL,
            multiline: 70,
            fn: function (btn, text) {
                if (btn != "ok") {
                    return;
                }
                Ext.Ajax.request({
                    url: API,
                    method: "POST",
                    params: {mode: "RESTORE", id: rec.get("id"), comment: text || ""},
                    success: function (result) {
                        var res = Ext.util.JSON.decode(result.responseText);
                        Ext.MessageBox.alert(res.success ? "Success" : "แจ้งเตือน", res.msg, function () {
                            store.reload();
                        });
                    },
                    failure: function (result) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                    },
                });
            },
        });
    }

    var statusCombo = new Ext.form.ComboBox({
        mode: "local",
        triggerAction: "all",
        editable: false,
        width: 130,
        valueField: "v",
        displayField: "t",
        value: 1,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: [[1, "รออนุมัติ"], [2, "อนุมัติแล้ว"], [3, "ไม่อนุมัติ"], [4, "กู้คืนแล้ว"]]}),
        listeners: {
            select: function (c, r) {
                curStatus = r.get("v");
                store.baseParams.i_status = curStatus;
                store.load();
                Ext.getCmp("btnApprove").setDisabled(!isApprover || curStatus != 1);
                Ext.getCmp("btnReject").setDisabled(!isApprover || curStatus != 1);
                Ext.getCmp("btnRestore").setDisabled(!isApprover || curStatus != 2);
            },
        },
    });

    var grid = new Ext.grid.GridPanel({
        region: "center",
        title: "อนุมัติยกเลิก PR",
        store: store,
        stripeRows: true,
        loadMask: true,
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        tbar: [
            "สถานะ: ", statusCombo, "-",
            {id: "btnApprove", text: "อนุมัติยกเลิก", iconCls: "icon-accept", disabled: !isApprover, handler: function () { act("APPROVE", "อนุมัติยกเลิก"); }},
            {id: "btnReject", text: "ไม่อนุมัติ", iconCls: "icon-cancel", disabled: !isApprover, handler: function () { act("REJECT", "ไม่อนุมัติ"); }},
            "-",
            {text: "ดูรายละเอียด", iconCls: "icon-application-view-list", handler: function () { showDetail(grid.getSelectionModel().getSelected()); }},
            {id: "btnRestore", text: "กู้คืน PR", iconCls: "icon-arrow_undo", disabled: true, handler: restore},
            "->",
            {text: "รีเฟรช", iconCls: "icon-arrow_refresh", handler: function () { store.reload(); }},
        ],
        colModel: new Ext.grid.ColumnModel({
            columns: [
                new Ext.grid.RowNumberer({width: 35}),
                {header: "เลขที่ PR", dataIndex: "c_code", width: 120},
                {header: "ชื่อรายการ", dataIndex: "c_name", width: 280},
                {header: "จำนวนเงิน", dataIndex: "f_total_amt", width: 100, align: "right"},
                {header: "ผู้รับผิดชอบ", dataIndex: "sp_emp_name", width: 130},
                {header: "สถานะ PR ตอนขอ", dataIndex: "c_status_name", width: 160},
                {header: "สาเหตุที่ขอยกเลิก", dataIndex: "c_reason", width: 280},
                {header: "จองเงิน", dataIndex: "n_reserve", width: 80, align: "center", renderer: function (v) { return v > 0 ? "<b style='color:red'>จอง</b>" : "-"; }},
                {header: "วันที่ขอ", dataIndex: "d_req", width: 120},
                {header: "หมายเหตุผู้อนุมัติ", dataIndex: "c_result_comment", width: 220},
                {header: "หมายเหตุการกู้คืน", dataIndex: "c_restore_comment", width: 200},
            ],
            defaults: {sortable: true},
        }),
    });

    // ดับเบิลคลิกแถวเพื่อดูรายละเอียด
    grid.on("rowdblclick", function (g, rowIndex) {
        showDetail(store.getAt(rowIndex));
    });

    new Ext.Viewport({layout: "border", items: [grid]});
});
