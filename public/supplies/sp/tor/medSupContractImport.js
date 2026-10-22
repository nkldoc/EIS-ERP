/* global Ext, XLSX, user_right_add, user_right_edit, user_right_delete */

// เมนู "นำเข้าสัญญา (เวชภัณฑ์)" (ST00097) - นำเข้าสัญญา/งวดทีละหลายรายการจากไฟล์ Excel
// หน้าหลัก = ประวัติการนำเข้าแต่ละครั้ง (ชื่อรายการ/ไฟล์/จำนวนสัญญา/ยอดรวม/ผู้นำเข้า)
// "นำเข้าใหม่" = กรอกชื่อรายการ (เช่น "นำเข้าสัญญา 100 รายการ") + แนบไฟล์ Excel -> "ตรวจสอบ
// ข้อมูล" แสดงรายละเอียดทุกแถวพร้อมผลตรวจก่อน -> "บันทึกเข้าระบบ" (นำเข้าเฉพาะสัญญาที่ติ๊ก "นำเข้า" - สัญญาที่มีแถวผิดติ๊กไม่ได้)
// ไฟล์อ่านที่เบราว์เซอร์ด้วย SheetJS (bi/lib/xlsx.full.min.js) ตรวจ/บันทึกจริงที่
// tor/api/mnMedSupContractImport.php (ตรวจซ้ำทุกครั้งตอนบันทึก) บันทึกลง sp_tor_period_bill
// ตารางเดียวกับเมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092)

Ext.MEDSUP_IMPORT_URL = "tor/api/mnMedSupContractImport.php";
Ext.MEDSUP_IMPORT_TEMPLATE = "tor/template/medsup_contract_import_template.xlsx";

// คอลัมน์ในไฟล์ (แถวที่ 1 = ชื่อคอลัมน์) - ต้องตรงกับแม่แบบ Excel และ key ที่ PHP ใช้
// (* = จำเป็น) จับคู่ด้วยชื่อคอลัมน์ ไม่ใช่ตำแหน่ง (สลับลำดับคอลัมน์ในไฟล์ได้)
Ext.MEDSUP_IMPORT_COLUMNS = [
    {key: "seq", label: "ลำดับสัญญา*"},
    {key: "dept", label: "ประเภท*"},
    {key: "expense_code", label: "รหัสค่าใช้จ่าย*", pad: 12},
    {key: "project", label: "ชื่อโครงการ(ชื่อตามเล่มงบ)", alias: ["ชื่อโครงการ"]},
    {key: "contract_code", label: "เลขที่สัญญา"},
    {key: "contract_type", label: "ประเภทของสัญญา*"},
    {key: "fund1", label: "แหล่งเงินที่ 1*"},
    {key: "amt1", label: "จำนวนเงินแหล่งที่ 1(วงเงินทำสัญญา)*", alias: ["จำนวนเงินแหล่งที่ 1*"]},
    {key: "fund2", label: "แหล่งเงินที่ 2"},
    {key: "amt2", label: "จำนวนเงินแหล่งที่ 2"},
    {key: "fund3", label: "แหล่งเงินที่ 3"},
    {key: "amt3", label: "จำนวนเงินแหล่งที่ 3"},
    {key: "year", label: "ปีงบประมาณ (พ.ศ.)*"},
    {key: "start", label: "วันที่เริ่มสัญญา", date: true},
    {key: "end", label: "วันที่สิ้นสุดสัญญา", date: true},
    {key: "tax", label: "เลขประจำตัวผู้เสียภาษีผู้ขาย", pad: 13},
    {key: "vendor", label: "ผู้ขาย/ผู้รับจ้าง"},
    {key: "period", label: "งวดที่*"},
    {key: "doc_ref", label: "เลขงวด"},
    {key: "due", label: "วันที่ครบกำหนดส่งของ", date: true},
    {key: "detail", label: "ชื่อเรื่อง(EGP)", alias: ["รายละเอียด"]},
    {key: "period_fund", label: "แหล่งเงินของงวดนี้*"},
    {key: "period_amt", label: "จำนวนเงินจากแหล่งเงินนี้(ใบสั่งซื้อ)*", alias: ["จำนวนเงินจากแหล่งเงินนี้*"]},
    // รายการรับของ (dtl ของหน้าส่งมอบงาน ST00095) - ไม่บังคับ 1 แถว = 1 รายการรับของ แถวที่
    // ลำดับสัญญา + งวดที่ เดียวกันคืองวดเดียวกัน (1 งวดมีหลายรายการรับของได้)
    {key: "rc_code", label: "ใบแจ้งหนี้/รับของ"},
    {key: "rc_erp", label: "เลขรับเข้าคลังของ ERP"},
    {key: "rc_date", label: "วันรับของ", date: true},
    {key: "rc_detail", label: "รายละเอียดรับของ"},
    {key: "rc_amt", label: "จำนวนเงินรับของ(บิลส่งของ)", alias: ["จำนวนเงินรับของ"]},
    // VAT ของรายการรับของ (ตามหน้า "แก้ไข VAT" ที่หน้าส่งมอบงาน) - ไม่บังคับ ว่าง = ค่าเริ่มต้น
    // (VAT 7% / หัก ณ ที่จ่าย 1% / ไม่มีค่าประกันผลงาน) "จำนวนเงินรวม VAT" = จำนวนเงินรับของ
    // [ผู้ใช้ขอ] ตัดคอลัมน์ "(มี/ไม่มี)" ออก - ไม่มี VAT / ไม่หัก ณ ที่จ่าย = กรอก 0 ที่ช่อง (บาท) หรือ (%)
    // ค่าประกันผลงาน = มีเมื่อกรอก (%) มากกว่า 0
    {key: "vat_amt", label: "ภาษีมูลค่าเพิ่ม (บาท)"},
    {key: "vat_pct", label: "ภาษีมูลค่าเพิ่ม (%)"},
    {key: "wht_amt", label: "ภาษีหัก ณ ที่จ่าย (บาท)"},
    {key: "wht_pct", label: "ภาษีหัก ณ ที่จ่าย (%)"},
    {key: "penalty", label: "ค่าปรับ"},
    {key: "guar_pct", label: "ค่าประกันผลงาน (%)"},
    {key: "other", label: "อื่นๆ(ส่วนลด)", alias: ["อื่นๆ"]},
    // [ผู้ใช้ขอ] ต่อท้ายสุดของไฟล์ - pr_id/po_id/chk_id = เลขอ้างอิงจากไฟล์ที่ export มา (เก็บไว้อ้างอิงเท่านั้น)
    // c_overlap = เลขใบกันเหลื่อมของแหล่งเงินที่ 1 (ระดับสัญญา - กรอกที่แถวแรกของสัญญา ว่าง = ปีต่อปี)
    {key: "pr_id", label: "pr_id"},
    {key: "po_id", label: "po_id"},
    {key: "chk_id", label: "chk_id"},
    {key: "c_overlap", label: "c_overlap"},
];

// ชื่อคอลัมน์เทียบแบบไม่สนช่องว่าง/เครื่องหมาย * (ผู้ใช้อาจลบ * หรือเว้นวรรคต่างกัน)
Ext.fnImportNormLabel = function (s) {
    return String(s == null ? "" : s).replace(/\*/g, "").replace(/\s+/g, "");
};

// โหลด SheetJS ครั้งแรกที่ต้องใช้ (หน้า loader contract.php ไม่ได้โหลดไว้ให้)
Ext.fnLoadSheetJs = function (cb) {
    if (window.XLSX) {
        cb();
        return;
    }
    var s = document.createElement("script");
    s.src = "../bi/lib/xlsx.full.min.js";
    s.onload = cb;
    s.onerror = function () {
        Ext.Msg.alert("แจ้งเตือน", "โหลดตัวอ่านไฟล์ Excel ไม่สำเร็จ");
    };
    document.getElementsByTagName("head")[0].appendChild(s);
};

// แปลงค่าเซลล์เป็นข้อความที่ PHP อ่านได้ - วันที่ที่ Excel เก็บเป็นตัวเลข serial/Date แปลงเป็น
// วว-ดด-ปปปป (ค.ศ. - PHP แปลงให้ทั้ง พ.ศ./ค.ศ.) รหัสที่ Excel ตัดเลข 0 นำหน้าทิ้ง (เซลล์เป็น
// ตัวเลข) เติม 0 คืนตามความยาว (รหัสค่าใช้จ่าย 12 หลัก / เลขผู้เสียภาษี 13 หลัก)
Ext.fnImportCell = function (v, col) {
    if (v === null || v === undefined || v === "") {
        return "";
    }
    if (col.date) {
        var d = null;
        if (v instanceof Date) {
            d = {d: v.getDate(), m: v.getMonth() + 1, y: v.getFullYear()};
        } else if (typeof v === "number" && XLSX.SSF && XLSX.SSF.parse_date_code) {
            d = XLSX.SSF.parse_date_code(v);
        }
        if (d) {
            return String(d.d).padStart(2, "0") + "-" + String(d.m).padStart(2, "0") + "-" + d.y;
        }
    }
    if (col.pad && typeof v === "number") {
        return String(Math.round(v)).padStart(col.pad, "0");
    }
    return String(v).trim();
};

// ตารางกว้างหลายคอลัมน์ (ตรวจสอบก่อนบันทึก 31 คอลัมน์ / รายละเอียดที่นำเข้า) ใช้ตาราง HTML
// ธรรมดาแทน Ext grid - grid ของ ExtJS 3 วาดหัวคอลัมน์กับข้อมูลเป็นคนละตารางแล้วซิงก์
// ตำแหน่งเลื่อนเอา บน Chrome พอเลื่อนขวาข้อมูลเหลื่อมไม่ตรงหัวคอลัมน์ (ผู้ใช้แจ้ง ลองแก้
// ความกว้างแล้วไม่หาย) ตาราง HTML หัว+ข้อมูลอยู่ตารางเดียวกันจึงตรงกันเสมอ หัวตาราง sticky
// cols: [{header, key, align, render(v, row)}], rowCls(row) = class ของแถว ("err"/"warn")
Ext.fnImportCss = function () {
    if (document.getElementById("medsupImportCss")) {
        return;
    }
    var css = ".medsup-imp-tbl{border-collapse:separate;border-spacing:0;font-size:12px;font-family:tahoma,arial,sans-serif;}"
        + ".medsup-imp-tbl th,.medsup-imp-tbl td{border-right:1px solid #d0d0d0;border-bottom:1px solid #e4e4e4;padding:3px 6px;white-space:nowrap;}"
        + ".medsup-imp-tbl th{position:sticky;top:0;z-index:1;background:#eef3fa;font-weight:normal;text-align:left;border-bottom:1px solid #99bbe8;}"
        + ".medsup-imp-tbl tr:nth-child(even) td{background:#f7f7f7;}"
        + ".medsup-imp-tbl tr.err td{background:#fdecea;}"
        + ".medsup-imp-tbl tr.warn td{background:#fff7e0;}"
        + ".medsup-imp-empty{padding:12px;color:#888;}";
    var s = document.createElement("style");
    s.id = "medsupImportCss";
    s.appendChild(document.createTextNode(css));
    document.getElementsByTagName("head")[0].appendChild(s);
};
Ext.fnImportHtmlTable = function (cols, rows, rowCls) {
    var enc = Ext.util.Format.htmlEncode;
    if (!rows.length) {
        return "<div class=\"medsup-imp-empty\">ไม่มีรายการ..</div>";
    }
    var h = ["<table class=\"medsup-imp-tbl\"><thead><tr>"];
    cols.forEach(function (c) {
        h.push("<th style=\"text-align:" + (c.align || "left") + ";\">" + enc(c.header) + "</th>");
    });
    h.push("</tr></thead><tbody>");
    rows.forEach(function (r) {
        h.push("<tr class=\"" + (rowCls ? rowCls(r) : "") + "\">");
        cols.forEach(function (c) {
            var v = r[c.key];
            var html = c.render ? c.render(v, r) : enc(v == null ? "" : v);
            h.push("<td style=\"text-align:" + (c.align || "left") + ";\">" + html + "</td>");
        });
        h.push("</tr>");
    });
    h.push("</tbody></table>");
    return h.join("");
};
// สถานะจองเงินในระบบงบ (ข้อความจาก imp_reserve_status ฝั่ง PHP): จองแล้ว = เขียว / อื่นๆ = ส้ม
// ไม่พบการจอง = ตัวแดง + บอกเลข pr_id/po_id ของแถวนั้นว่ายังไม่ได้จองเงินมา [ผู้ใช้ขอ]
Ext.fnImportRsvNotFound = function (v) {
    return /^ไม่พบการจอง/.test(v || "");
};
Ext.fnImportRsvNotFoundText = function (r) {
    return "เลข pr_id " + (r.pr_id || "-") + " และเลข po_id " + (r.po_id || "-") + " นี้ยังไม่ได้จองเงินมา";
};
Ext.fnImportRsvStatus = function (v, r) {
    if (!v) {
        return "";
    }
    if (Ext.fnImportRsvNotFound(v)) {
        return "<span style=\"color:#c00;font-weight:bold;\">" + Ext.util.Format.htmlEncode(v + " - " + Ext.fnImportRsvNotFoundText(r || {})) + "</span>";
    }
    var color = /^จองขั้นสัญญาแล้ว/.test(v) ? "#080" : "#c60";
    return "<span style=\"color:" + color + ";\">" + Ext.util.Format.htmlEncode(v) + "</span>";
};
Ext.fnImportMoney = function (v) {
    var n = parseFloat(String(v == null ? "" : v).replace(/,/g, ""));
    return v === "" || v == null || isNaN(n) ? Ext.util.Format.htmlEncode(v == null ? "" : v) : Ext.util.Format.number(n, "0,000.00");
};

Ext.storeMedSupImportList = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: Ext.MEDSUP_IMPORT_URL,
    baseParams: {mode: "LIST"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["id", "c_import_name", "c_file_name", "i_contract_count", "i_row_count", "i_receive_count", "f_total_amt", "d_create", "c_user_name"],
});

// รายละเอียดสัญญา/งวดที่นำเข้าในครั้งนั้น (ดับเบิลคลิกแถวประวัติ)
function winMedSupImportRows(rec) {
    Ext.fnImportCss();
    var cols = [
        // ติ๊กเลือกสัญญาที่จะยกเลิก (ช่องติ๊กอยู่ที่แถวแรกของแต่ละสัญญา - 1 สัญญามีหลายแถว/งวด)
        {
            header: "เลือก", key: "hdr_id", align: "center",
            render: function (v, r) {
                return r._first ? "<input type=\"checkbox\" class=\"medsup-imp-chk\" value=\"" + parseInt(v, 10) + "\">" : "";
            }
        },
        {header: "ที่", key: "_no", align: "center"},
        {header: "เลขที่สัญญา", key: "c_contract_code"},
        {header: "ประเภท", key: "c_ap_dept_type", align: "center"},
        {header: "ชื่อโครงการ", key: "c_project_name"},
        {header: "ประเภทของสัญญา", key: "c_contract_type"},
        {header: "ผู้ขาย/ผู้รับจ้าง", key: "c_creditor_name"},
        {header: "ปีงบประมาณ", key: "i_budget_year", align: "center"},
        {header: "งวดที่", key: "i_period", align: "center"},
        {header: "เลขงวด", key: "c_doc_ref"},
        {header: "วันที่ครบกำหนดส่งของ", key: "d_doc_dateSub", align: "center"},
        {header: "ชื่อเรื่อง(EGP)", key: "c_detail"},
        {header: "แหล่งเงินของงวดนี้", key: "c_fund_source_dtl"},
        {header: "จำนวนเงิน(ใบสั่งซื้อ)", key: "f_fund_amt_dtl", align: "right"},
        {header: "ใบแจ้งหนี้/รับของ", key: "c_receive_code"},
        {header: "เลขรับเข้าคลังของ ERP", key: "c_erp_stock_code"},
        {header: "วันรับของ", key: "d_receive_date", align: "center"},
        {header: "รายละเอียดรับของ", key: "rc_detail"},
        {header: "จำนวนเงินรับของ(บิลส่งของ)", key: "rc_amt", align: "right"},
        {header: "pr_id", key: "pr_id"},
        {header: "po_id", key: "po_id"},
        {header: "chk_id", key: "chk_id"},
        {header: "c_overlap", key: "c_overlap"},
        {header: "สถานะจองเงิน (ระบบงบ)", key: "rsv_status", render: Ext.fnImportRsvStatus},
    ];
    var tablePanel = new Ext.Panel({border: false, autoScroll: true, html: "<div class=\"medsup-imp-empty\">กำลังโหลด..</div>"});
    var curRows = [];   // แถวที่แสดงอยู่ (ลำดับเดียวกับ <tr> ในตาราง)
    var searchFld = new Ext.form.TextField({
        width: 280, emptyText: "เลขที่สัญญา / โครงการ / ผู้ขาย / รายละเอียด ..", enableKeyEvents: true,
        listeners: {
            keyup: function (f, e) {
                if (e.getKey() === e.ENTER) {
                    applySearch();
                }
            }
        },
    });
    var countTxt = new Ext.Toolbar.TextItem({text: ""});
    var win = new Ext.Window({
        title: "รายการที่นำเข้า - " + Ext.util.Format.htmlEncode(rec.get("c_import_name")),
        width: 1150, height: 480, modal: true, maximizable: true, layout: "fit", closeAction: "destroy",
        items: [tablePanel],
        tbar: [
            {xtype: "tbtext", text: "ค้นหา:"},
            " ",
            searchFld,
            {text: "ค้นหา", icon: "../images/icons/book_magnify.png", handler: applySearch},
            {text: "ล้าง", handler: function () { searchFld.setValue(""); applySearch(); }},
            "-",
            countTxt,
        ],
        buttonAlign: "left",
        buttons: [
            {
                // เลือก/ไม่เลือก เฉพาะสัญญาที่แสดงอยู่ (ตามผลค้นหา)
                text: "เลือกทั้งหมด / ไม่เลือก", handler: function () {
                    var boxes = visibleBoxes();
                    var all = boxes.length > 0 && boxes.every(function (b) { return b.checked; });
                    boxes.forEach(function (b) { b.checked = !all; });
                }
            },
            {
                text: "ยกเลิกสัญญาที่เลือก", iconCls: "icon-clear", handler: function () {
                    var ids = Array.prototype.map.call(
                        tablePanel.body.dom.querySelectorAll("input.medsup-imp-chk:checked"), function (b) { return b.value; });
                    if (!ids.length) {
                        Ext.Msg.alert("แจ้งเตือน", "กรุณาติ๊กเลือกสัญญาที่ต้องการยกเลิก");
                        return;
                    }
                    // เลขที่สัญญาที่ติ๊กไว้ทั้งหมด (รวมที่ถูกซ่อนจากผลค้นหา) แสดงให้ยืนยันก่อนยกเลิก
                    var codes = [];
                    curRows.forEach(function (r) {
                        if (r._first && ids.indexOf(String(r.hdr_id)) >= 0) {
                            codes.push(r.c_contract_code);
                        }
                    });
                    medSupImportCancel(rec, ids, function () {
                        Ext.storeMedSupImportList.reload();
                        loadRows();
                    }, codes);
                }
            },
            "->",
            {text: "ปิด", iconCls: "icon-clear", handler: function () { win.destroy(); }},
        ],
    });
    win.show();
    // ช่องติ๊กของสัญญาที่แสดงอยู่ (แถวไม่ถูกซ่อนจากผลค้นหา)
    function visibleBoxes() {
        return Array.prototype.filter.call(tablePanel.body.dom.querySelectorAll("input.medsup-imp-chk"), function (b) {
            return b.parentNode.parentNode.style.display !== "none";
        });
    }
    // ค้นหาในทุกช่องของตาราง (เลขที่สัญญา/โครงการ/ผู้ขาย/เลขงวด/รายละเอียด/ใบแจ้งหนี้ ฯลฯ) หลายคำเว้นวรรค = ต้องเจอทุกคำ
    // สัญญาที่มีแถวใดแถวหนึ่งตรง แสดงทุกแถวของสัญญานั้น (ช่องติ๊กอยู่ที่แถวแรก) ซ่อนแถวด้วย CSS ค่าที่ติ๊กไว้ไม่หาย
    function applySearch() {
        var words = String(searchFld.getValue() || "").toLowerCase().split(/\s+/).filter(function (w) { return w !== ""; });
        var match = {};
        var total = {};
        curRows.forEach(function (r) {
            total[r.hdr_id] = 1;
            if (match[r.hdr_id]) {
                return;
            }
            var text = cols.map(function (c) { return c.key === "hdr_id" || c.key === "_no" ? "" : String(r[c.key] == null ? "" : r[c.key]); })
                .join(" ").toLowerCase();
            if (words.every(function (w) { return text.indexOf(w) >= 0; })) {
                match[r.hdr_id] = 1;
            }
        });
        var trs = tablePanel.body.dom.querySelectorAll("table.medsup-imp-tbl tbody tr");
        Array.prototype.forEach.call(trs, function (tr, i) {
            tr.style.display = curRows[i] && match[curRows[i].hdr_id] ? "" : "none";
        });
        var nAll = Object.keys(total).length, nShow = Object.keys(match).length;
        countTxt.setText(words.length ? "พบ " + nShow + " จาก " + nAll + " สัญญา" : "ทั้งหมด " + nAll + " สัญญา");
    }
    function loadRows() {
        Ext.Ajax.request({
            url: Ext.MEDSUP_IMPORT_URL,
            method: "GET",
            params: {mode: "LIST_ROWS", import_id: rec.get("id")},
            success: function (response) {
                var res = Ext.decode(response.responseText);
                var prev = null;
                curRows = (res.data || []).map(function (r, i) {
                    var first = r.hdr_id !== prev;
                    prev = r.hdr_id;
                    return Ext.apply({_no: i + 1, _first: first}, r);
                });
                tablePanel.update(Ext.fnImportHtmlTable(cols, curRows));
                applySearch();
            },
            failure: function () {
                tablePanel.update("<div class=\"medsup-imp-empty\">โหลดข้อมูลไม่สำเร็จ</div>");
            }
        });
    }
    loadRows();
}

// ยกเลิกทั้งชุดนำเข้า (ข้อมูลในไฟล์ผิด ต้องการแก้ไฟล์แล้วนำเข้าใหม่) - เซิร์ฟเวอร์ตรวจให้เองทั้งชุดว่ามี
// สัญญาใดถูกทำงานต่อไปแล้ว (จองเงิน/ออกเลข IR/ออกเลขตรวจรับ) ผู้ใช้ไม่ต้องไล่ดูทีละสัญญา:
// ไม่มี -> ถามเหตุผลแล้วยกเลิกทั้งชุด / มี -> ไม่ยกเลิกเลย แสดงเลขที่สัญญาที่ติดพร้อมสาเหตุ
// hdrIds = ยกเลิกเฉพาะสัญญาที่ติ๊กเลือก (จากหน้าต่างรายการที่นำเข้า) ไม่ส่ง = ยกเลิกทั้งชุด
// codes = เลขที่สัญญาที่ติ๊กไว้ (แสดงให้ยืนยันก่อนยกเลิก กันยกเลิกผิดใบ)
function medSupImportCancel(rec, hdrIds, onDone, codes) {
    var enc = Ext.util.Format.htmlEncode;
    var name = enc(rec.get("c_import_name"));
    var partial = !!(hdrIds && hdrIds.length);
    var mask = new Ext.LoadMask(Ext.getBody(), {msg: "กำลังตรวจสอบ..."});
    var call = function (params, done) {
        mask.show();
        Ext.Ajax.request({
            url: Ext.MEDSUP_IMPORT_URL,
            method: "POST",
            timeout: 300000,
            params: Ext.apply({import_id: rec.get("id"), hdr_ids: partial ? hdrIds.join(",") : ""}, params),
            success: function (response) {
                mask.hide();
                var res;
                try {
                    res = Ext.decode(response.responseText);
                } catch (e) {
                    res = {success: false, msg: "รูปแบบข้อมูลตอบกลับจาก Server ไม่ถูกต้อง"};
                }
                done(res);
            },
            failure: function () {
                mask.hide();
                Ext.Msg.alert("แจ้งเตือน", "ทำรายการไม่สำเร็จ");
            }
        });
    };
    var showBlocked = function (res) {
        var list = (res.blocked || []).slice(0, 30).map(function (b) {
            return "- " + enc(b.c_contract_code) + " : " + enc(b.reason);
        }).join("<br>");
        var more = (res.blocked || []).length > 30 ? "<br>... และอีก " + (res.blocked.length - 30) + " รายการ" : "";
        Ext.Msg.alert("ยกเลิกไม่ได้", enc(res.msg || "ยกเลิกไม่สำเร็จ") + (list ? "<br><br>" + list + more
            + "<br><br>ต้องยกเลิกการจองเงิน / เลข IR ของสัญญาเหล่านี้ก่อน"
            + (partial ? " หรือเอาติ๊กสัญญาเหล่านี้ออกแล้วยกเลิกเฉพาะที่เหลือ" : " แล้วจึงยกเลิกชุดนำเข้า (หรือดับเบิลคลิกรายการเพื่อเลือกยกเลิกบางสัญญา)") : ""));
    };
    call({mode: "CANCEL_CHECK"}, function (chk) {
        if (!chk.success) {
            showBlocked(chk);
            return;
        }
        Ext.Msg.show({
            title: partial ? "ยกเลิกสัญญาที่เลือก" : "ยกเลิกชุดนำเข้า",
            msg: (partial
                ? "ยกเลิกสัญญาที่เลือก " + chk.contract_count + " รายการ ของ \"" + name + "\" (พร้อมงวดและรายการรับของ)<br>"
                    + (codes && codes.length
                        ? "<div style=\"max-height:120px;overflow:auto;margin:6px 0;padding:4px 6px;border:1px solid #ccc;background:#fff;\">"
                            + codes.map(enc).join("<br>") + "</div>"
                        : "")
                    + "สัญญาที่เลือกจะหายจากทุกเมนู สัญญาอื่นในชุดนี้ยังอยู่ตามเดิม"
                : "ยกเลิก \"" + name + "\" ทั้งชุด (สัญญา " + chk.contract_count + " รายการ พร้อมงวดและรายการรับของ)<br>"
                    + "สัญญาทั้งหมดของชุดนี้จะหายจากทุกเมนู แก้ไฟล์แล้วนำเข้าใหม่ได้")
                + "<br><br>เหตุผลที่ยกเลิก:",
            width: 460,
            prompt: true,
            multiline: true,
            buttons: Ext.Msg.OKCANCEL,
            fn: function (btn, text) {
                if (btn !== "ok") {
                    return;
                }
                if (!String(text || "").trim()) {
                    Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเหตุผลที่ยกเลิก");
                    return;
                }
                call({mode: "CANCEL", c_reason: String(text).trim()}, function (res) {
                    if (!res.success) {
                        showBlocked(res);
                        return;
                    }
                    if (onDone) {
                        onDone(res);
                    } else {
                        Ext.storeMedSupImportList.reload();
                    }
                    Ext.Msg.alert("สำเร็จ", partial
                        ? "ยกเลิกสัญญาที่เลือกแล้ว " + res.contract_count + " รายการ"
                        : "ยกเลิก \"" + name + "\" แล้ว (สัญญา " + res.contract_count + " รายการ)");
                });
            }
        });
    });
}

// หน้าต่างนำเข้าใหม่: ชื่อรายการ + ไฟล์ -> ตรวจสอบ (แสดงรายละเอียด) -> บันทึก
function winMedSupImportNew() {
    var parsedRows = null;   // แถวจากไฟล์ (ส่งให้ PHP) ของรอบตรวจสอบล่าสุด
    var previewRows = [];    // แถวที่แสดงในตารางก่อนบันทึก (ค่าจากไฟล์ + ผลตรวจ + _chk = ติ๊กเลือกไว้)
    var fileName = "";

    var nameFld = new Ext.form.TextField({
        fieldLabel: "ชื่อรายการ", width: 420, allowBlank: false, emptyText: "เช่น นำเข้าสัญญา 100 รายการ",
    });
    var fileFld = new Ext.form.TextField({fieldLabel: "ไฟล์ Excel", width: 420, inputType: "file"});
    var summaryFld = new Ext.form.DisplayField({hideLabel: true, value: "", style: "font-weight:bold;"});

    // [ผู้ใช้ขอ] ตารางก่อนบันทึกแสดง "ตาม Excel" - คอลัมน์/ชื่อ/ลำดับเดียวกับไฟล์ทุกช่อง (ค่าที่
    // อ่านจากไฟล์ตรงๆ) นำหน้าด้วย แถว/สถานะ/สาเหตุ จากผลตรวจของเซิร์ฟเวอร์ - ตาราง HTML (ดู
    // Ext.fnImportHtmlTable) หัวคอลัมน์กับข้อมูลตรงกันเสมอ
    Ext.fnImportCss();
    var enc = Ext.util.Format.htmlEncode;
    var moneyKeys = {amt1: 1, amt2: 1, amt3: 1, period_amt: 1, rc_amt: 1, vat_amt: 1, wht_amt: 1, penalty: 1, other: 1};
    // ยอดที่เซิร์ฟเวอร์คำนวณจากช่อง VAT (ต่อท้ายคอลัมน์ Excel พื้นสีฟ้าอ่อน) - เทียบกับหน้า "แก้ไข VAT"
    var calcRender = function (v) {
        return v === null || v === undefined || v === "" ? ""
            : "<span style=\"color:#036;\">" + Ext.util.Format.number(v, "0,000.00") + "</span>";
    };
    var calcCols = [
        {header: "(คำนวณ) จำนวนเงินก่อน VAT", key: "calc_before", align: "right", render: calcRender},
        {header: "(คำนวณ) ภาษีมูลค่าเพิ่ม", key: "calc_vat", align: "right", render: calcRender},
        {header: "(คำนวณ) ภาษีหัก ณ ที่จ่าย", key: "calc_wht", align: "right", render: calcRender},
        {header: "(คำนวณ) ค่าปรับ", key: "calc_penalty", align: "right", render: calcRender},
        {header: "(คำนวณ) ค่าประกันผลงาน", key: "calc_guar", align: "right", render: calcRender},
        {header: "(คำนวณ) จำนวนเงินที่จ่าย", key: "calc_pay", align: "right", render: function (v) {
            return calcRender(v) ? "<b>" + calcRender(v) + "</b>" : "";
        }},
    ];
    var previewCols = [
        // [ผู้ใช้ขอ] เลือกนำเข้าเฉพาะบางรายการได้ - ติ๊กอัตโนมัติทุกสัญญาที่ถูกต้อง, สัญญา (ลำดับสัญญา)
        // ที่มีแถวผิดติ๊กไม่ได้, ติ๊ก/เอาติ๊กออกแถวใดแถวหนึ่ง = ทั้งสัญญา (ทุกแถวของลำดับสัญญาเดียวกัน)
        {
            header: "นำเข้า", key: "_imp", align: "center",
            render: function (v, r) {
                return "<input type=\"checkbox\" class=\"medsup-imp-sel\" data-i=\"" + r._i + "\" data-seq=\"" + enc(r.seq) + "\""
                    + (v ? " checked" : "") + (r._bad ? " disabled" : "") + ">";
            }
        },
        // [ผู้ใช้ขอ] ติ๊กอัตโนมัติที่รายการ "ไม่พบการจองในระบบงบ" - ใช้เลือกแถวที่จะดาวน์โหลด Excel ส่งคืนผู้ใช้
        {
            header: "เลือก (ดาวน์โหลด)", key: "_chk", align: "center",
            render: function (v, r) {
                return "<input type=\"checkbox\" class=\"medsup-imp-chk\" data-i=\"" + r._i + "\"" + (v ? " checked" : "") + ">";
            }
        },
        {header: "แถว", key: "row_no", align: "center"},
        {
            header: "สถานะ", key: "status", align: "center",
            render: function (v, r) {
                if (v === "ERROR") {
                    return "<span title=\"" + enc(r.message) + "\" style=\"color:#c00;font-weight:bold;\">&#10008; ผิด</span>";
                }
                if (v === "WARN") {
                    return "<span title=\"" + enc(r.message) + "\" style=\"color:#c60;font-weight:bold;\">! เตือน</span>";
                }
                return "<span style=\"color:#080;\">&#10004; ถูกต้อง</span>";
            }
        },
        {
            header: "สาเหตุ / หมายเหตุ", key: "message",
            render: function (v, r) {
                return v ? "<span style=\"color:" + (r.status === "ERROR" ? "#c00" : "#c60") + ";\">" + enc(v) + "</span>" : "";
            }
        },
        // สถานะจองเงินในระบบงบของฝั่ง ERP เวชภัณฑ์ (ค้นจาก pr_id/po_id/chk_id ในไฟล์ - แสดงให้ดูเท่านั้น)
        {header: "สถานะจองเงิน (ระบบงบ)", key: "rsv_status", render: Ext.fnImportRsvStatus},
    ].concat(Ext.MEDSUP_IMPORT_COLUMNS.map(function (c) {
        var col = {header: c.label, key: c.key};
        if (moneyKeys[c.key]) {
            col.align = "right";
            col.render = Ext.fnImportMoney;
        } else if (c.date || /^(seq|period|dept|year|vat_flag|wht_flag|guar_flag|vat_pct|wht_pct|guar_pct)$/.test(c.key)) {
            col.align = "center";
        }
        return col;
    })).concat(calcCols);
    var previewPanel = new Ext.Panel({
        region: "center", title: "รายละเอียดก่อนบันทึก (ชี้ที่สถานะเพื่อดูสาเหตุ)", border: true, autoScroll: true,
        html: "<div class=\"medsup-imp-empty\">เลือกไฟล์แล้วกด \"ตรวจสอบข้อมูล\"..</div>",
    });
    var saveBtn = new Ext.Button({text: "บันทึกเข้าระบบ", iconCls: "icon-save", disabled: true});
    // [ผู้ใช้ขอ] ดาวน์โหลดแถวที่ติ๊กไว้ (ค่าเริ่มต้น = รายการที่ไม่พบการจองในระบบงบ) เป็น Excel ส่งคืนผู้ใช้
    var exportBtn = new Ext.Button({
        text: "ดาวน์โหลด Excel รายการที่เลือก", icon: "../images/icons/page_excel.png", disabled: true, handler: exportChecked,
    });

    function checkedRows() {
        return previewRows.filter(function (r) { return r._chk; });
    }
    function importRows() {
        return previewRows.filter(function (r) { return r._imp; });
    }
    function updateSaveBtn() {
        var n = importRows().length;
        saveBtn.setText("บันทึกเข้าระบบ" + (n ? " (" + n + " แถว)" : ""));
        saveBtn.setDisabled(!n);
    }
    function updateExportBtn() {
        var n = checkedRows().length;
        exportBtn.setText("ดาวน์โหลด Excel รายการที่เลือก" + (n ? " (" + n + " แถว)" : ""));
        exportBtn.setDisabled(!n);
    }
    // ไฟล์ส่งคืน: คอลัมน์/ชื่อ/ลำดับเดียวกับแม่แบบ (แก้แล้วนำเข้าใหม่ได้เลย) + 2 คอลัมน์ท้าย = สถานะจองเงิน/หมายเหตุ
    function exportChecked() {
        var rows = checkedRows();
        if (!rows.length) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาติ๊กเลือกรายการที่ต้องการดาวน์โหลด");
            return;
        }
        Ext.fnLoadSheetJs(function () {
            var aoa = [Ext.MEDSUP_IMPORT_COLUMNS.map(function (c) { return c.label; }).concat(["สถานะจองเงิน (ระบบงบ)", "หมายเหตุ"])];
            rows.forEach(function (r) {
                var line = Ext.MEDSUP_IMPORT_COLUMNS.map(function (c) {
                    var v = r[c.key] == null ? "" : r[c.key];
                    var n = parseFloat(String(v).replace(/,/g, ""));
                    return moneyKeys[c.key] && v !== "" && !isNaN(n) ? n : String(v);
                });
                var notes = [];
                if (Ext.fnImportRsvNotFound(r.rsv_status)) {
                    notes.push(Ext.fnImportRsvNotFoundText(r));
                }
                if (r.message) {
                    notes.push(r.message);
                }
                aoa.push(line.concat([r.rsv_status || "", notes.join(" / ")]));
            });
            var ws = XLSX.utils.aoa_to_sheet(aoa);
            ws["!cols"] = aoa[0].map(function (h, i) { return {wch: i >= Ext.MEDSUP_IMPORT_COLUMNS.length ? 45 : 18}; });
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ข้อมูล");
            XLSX.writeFile(wb, "รายการส่งคืน_" + String(fileName || "import").replace(/\.[^.]*$/, "") + ".xlsx");
        });
    }

    // ไฟล์ถูกเปลี่ยน = ผลตรวจเดิมใช้ไม่ได้ ต้องตรวจสอบใหม่ก่อนบันทึก
    function resetPreview() {
        parsedRows = null;
        previewRows = [];
        previewPanel.update("<div class=\"medsup-imp-empty\">เลือกไฟล์แล้วกด \"ตรวจสอบข้อมูล\"..</div>");
        summaryFld.setValue("");
        updateSaveBtn();
        updateExportBtn();
    }

    function readFile() {
        var input = fileFld.getEl() && fileFld.getEl().dom;
        var file = input && input.files && input.files[0];
        if (!file) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกไฟล์ Excel");
            return;
        }
        fileName = file.name;
        Ext.fnLoadSheetJs(function () {
            var reader = new FileReader();
            reader.onload = function (e) {
                var rows;
                try {
                    var wb = XLSX.read(new Uint8Array(e.target.result), {type: "array"});
                    // ชีต "ข้อมูล" ของแม่แบบ ไม่มีก็ใช้ชีตแรก
                    var ws = wb.Sheets["ข้อมูล"] || wb.Sheets[wb.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(ws, {header: 1, raw: true, defval: ""});
                } catch (err) {
                    Ext.Msg.alert("แจ้งเตือน", "อ่านไฟล์ไม่สำเร็จ (ต้องเป็นไฟล์ .xlsx / .xls)");
                    return;
                }
                if (!rows.length) {
                    Ext.Msg.alert("แจ้งเตือน", "ไฟล์ไม่มีข้อมูล");
                    return;
                }
                // แถวที่ 1 = ชื่อคอลัมน์ -> หาตำแหน่งของแต่ละคอลัมน์
                var header = rows[0].map(Ext.fnImportNormLabel);
                var colIdx = {};
                var missing = [];
                Ext.MEDSUP_IMPORT_COLUMNS.forEach(function (c) {
                    var idx = header.indexOf(Ext.fnImportNormLabel(c.label));
                    // ชื่อคอลัมน์เดิมก่อนเปลี่ยนชื่อ (ไฟล์ที่ทำจากแม่แบบรุ่นเก่ายังนำเข้าได้)
                    (c.alias || []).forEach(function (a) {
                        if (idx < 0) {
                            idx = header.indexOf(Ext.fnImportNormLabel(a));
                        }
                    });
                    colIdx[c.key] = idx;
                    if (idx < 0 && /\*$/.test(c.label)) {
                        missing.push(c.label);
                    }
                });
                if (missing.length) {
                    Ext.Msg.alert("แจ้งเตือน", "ไม่พบคอลัมน์ในแถวที่ 1 ของไฟล์:<br>- " + missing.join("<br>- ")
                        + "<br><br>กรุณาใช้แม่แบบ Excel (ปุ่ม \"ดาวน์โหลดแม่แบบ Excel\")");
                    return;
                }
                var out = [];
                for (var r = 1; r < rows.length; r++) {
                    var obj = {_row: r + 1};
                    var hasValue = false;
                    Ext.MEDSUP_IMPORT_COLUMNS.forEach(function (c) {
                        var v = colIdx[c.key] >= 0 ? Ext.fnImportCell(rows[r][colIdx[c.key]], c) : "";
                        obj[c.key] = v;
                        if (v !== "") {
                            hasValue = true;
                        }
                    });
                    if (hasValue) {
                        out.push(obj);
                    }
                }
                if (!out.length) {
                    Ext.Msg.alert("แจ้งเตือน", "ไฟล์ไม่มีข้อมูล (มีแต่แถวชื่อคอลัมน์)");
                    return;
                }
                preview(out);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function preview(rows) {
        var mask = new Ext.LoadMask(win.body, {msg: "กำลังตรวจสอบข้อมูล..."});
        mask.show();
        Ext.Ajax.request({
            url: Ext.MEDSUP_IMPORT_URL,
            method: "POST",
            timeout: 300000,
            params: {mode: "PREVIEW", rows: Ext.encode(rows)},
            success: function (response) {
                mask.hide();
                var res = Ext.decode(response.responseText);
                if (!res.success) {
                    Ext.Msg.alert("แจ้งเตือน", res.msg || "ตรวจสอบไม่สำเร็จ");
                    return;
                }
                parsedRows = rows;
                // ผลตรวจ (res.data) เรียงตามแถวที่ส่งไปเสมอ (1:1) - จับคู่กับค่าที่อ่านจากไฟล์
                previewRows = rows.map(function (raw, i) {
                    var r = res.data[i] || {};
                    return Ext.apply({
                        _i: i, row_no: raw._row, status: r.status || "", message: r.message || "", rsv_status: r.rsv_status || "",
                        calc_before: r.calc_before, calc_vat: r.calc_vat, calc_wht: r.calc_wht,
                        calc_guar: r.calc_guar, calc_penalty: r.calc_penalty, calc_pay: r.calc_pay,
                    }, raw);
                });
                // ติ๊กอัตโนมัติ: ทุกแถวของสัญญา (ลำดับสัญญาเดียวกัน) ที่มีแถวไม่พบการจองในระบบงบ - ไฟล์ส่งคืนจะได้ครบทั้งสัญญา
                var noRsv = previewRows.filter(function (r) { return Ext.fnImportRsvNotFound(r.rsv_status); });
                var noRsvSeq = {};
                noRsv.forEach(function (r) { noRsvSeq[String(r.seq)] = true; });
                // สัญญา (ลำดับสัญญา) ที่มีแถวผิดอย่างน้อย 1 แถว = นำเข้าไม่ได้ทั้งสัญญา
                var badSeq = {};
                previewRows.forEach(function (r) {
                    if (r.status === "ERROR") {
                        badSeq[String(r.seq)] = true;
                    }
                });
                previewRows.forEach(function (r) {
                    r._bad = badSeq[String(r.seq)] === true;
                    r._imp = !r._bad;
                    // [ผู้ใช้ขอ] แถวผิด (สีแดง) ติ๊กดาวน์โหลดให้อัตโนมัติ - ส่งไฟล์คืนผู้ใช้ไปแก้ได้เลย
                    r._chk = r._bad || Ext.fnImportRsvNotFound(r.rsv_status) || (String(r.seq) !== "" && noRsvSeq[String(r.seq)] === true);
                });
                previewPanel.update(Ext.fnImportHtmlTable(previewCols, previewRows, function (r) {
                    return r.status === "ERROR" ? "err" : (r.status === "WARN" || Ext.fnImportRsvNotFound(r.rsv_status) ? "warn" : "");
                }));
                updateExportBtn();
                updateSaveBtn();
                var ok = res.error_rows === 0;
                summaryFld.setValue(
                    "สัญญา " + res.contract_count + " รายการ / " + res.row_count + " งวด / รับของ "
                    + res.receive_count + " รายการ / ยอดรวม "
                    + Ext.util.Format.number(res.total, "0,000.00") + " บาท - "
                    + (ok ? "<span style=\"color:#080;\">&#10004; ข้อมูลถูกต้อง พร้อมบันทึก</span>"
                        : "<span style=\"color:#c00;\">ผิดพลาด " + res.error_rows + " แถว (ตัวแดง) - แก้ไฟล์แล้วตรวจสอบใหม่ หรือติ๊ก \"นำเข้า\" เฉพาะสัญญาที่ถูกต้อง</span>")
                );
                if (noRsv.length) {
                    var noRsvMsg = "ไม่พบการจองในระบบงบ " + noRsv.length + " รายการ (ติ๊กเลือกให้แล้ว)";
                    summaryFld.setValue(summaryFld.getValue() + "<br><span style=\"color:#c00;\">" + noRsvMsg
                        + " - กด \"ดาวน์โหลด Excel รายการที่เลือก\" เพื่อส่งคืนผู้ใช้</span>");
                    Ext.Msg.show({
                        title: "แจ้งเตือน", icon: Ext.Msg.WARNING, buttons: Ext.Msg.OK, minWidth: 460,
                        msg: "<span style=\"color:#c00;font-weight:bold;\">" + noRsvMsg + "</span><br><br>"
                            + noRsv.slice(0, 15).map(function (r) {
                                return "<span style=\"color:#c00;\">แถว " + r.row_no + ": " + enc(Ext.fnImportRsvNotFoundText(r)) + "</span>";
                            }).join("<br>")
                            + (noRsv.length > 15 ? "<br>... และอีก " + (noRsv.length - 15) + " รายการ" : "")
                            + "<br><br>กดปุ่ม \"ดาวน์โหลด Excel รายการที่เลือก\" เพื่อโหลดไฟล์ส่งคืนผู้ใช้",
                    });
                }
            },
            failure: function () {
                mask.hide();
                Ext.Msg.alert("แจ้งเตือน", "ตรวจสอบไม่สำเร็จ");
            }
        });
    }

    function save() {
        if (!nameFld.isValid() || !String(nameFld.getValue()).trim()) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกชื่อรายการ");
            return;
        }
        if (!parsedRows) {
            return;
        }
        // ส่งเฉพาะแถวที่ติ๊ก "นำเข้า" (เซิร์ฟเวอร์ตรวจซ้ำกับชุดที่ส่งไป)
        var sel = importRows();
        if (!sel.length) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาติ๊กเลือกรายการที่ต้องการนำเข้า");
            return;
        }
        var selRows = sel.map(function (r) { return parsedRows[r._i]; });
        Ext.Msg.confirm("ยืนยัน", "บันทึก \"" + Ext.util.Format.htmlEncode(nameFld.getValue()) + "\"<br>"
            + "นำเข้า " + sel.length + " แถว จากทั้งหมด " + previewRows.length + " แถวในไฟล์"
            + "<br><br>เข้าระบบใช่หรือไม่?", function (btn) {
            if (btn !== "yes") {
                return;
            }
            var mask = new Ext.LoadMask(win.body, {msg: "กำลังบันทึก..."});
            mask.show();
            Ext.Ajax.request({
                url: Ext.MEDSUP_IMPORT_URL,
                method: "POST",
                timeout: 300000,
                params: {mode: "SAVE", c_import_name: nameFld.getValue(), c_file_name: fileName, rows: Ext.encode(selRows)},
                success: function (response) {
                    mask.hide();
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert("แจ้งเตือน", res.msg || "บันทึกไม่สำเร็จ");
                        return;
                    }
                    Ext.storeMedSupImportList.reload();
                    win.destroy();
                    Ext.Msg.alert("สำเร็จ", "นำเข้าสัญญา " + res.contract_count + " รายการ (รับของ " + res.receive_count + " รายการ) เรียบร้อยแล้ว<br>เลขที่สัญญา: "
                        + res.codes.map(Ext.util.Format.htmlEncode).join(", "));
                },
                failure: function () {
                    mask.hide();
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกไม่สำเร็จ");
                }
            });
        });
    }
    saveBtn.setHandler(save);

    var win = new Ext.Window({
        title: "นำเข้าสัญญา (เวชภัณฑ์) จากไฟล์ Excel",
        width: 1250, height: 620, modal: true, maximizable: true, layout: "border", closeAction: "destroy",
        items: [
            {
                region: "north", xtype: "form", height: 150, border: false, bodyStyle: "padding:10px;", labelWidth: 90,
                items: [
                    nameFld,
                    {
                        xtype: "compositefield", fieldLabel: "ไฟล์ Excel",
                        items: [
                            fileFld,
                            {xtype: "button", text: "ตรวจสอบข้อมูล", icon: "../images/icons/book_magnify.png", handler: readFile},
                            {
                                xtype: "button", text: "ดาวน์โหลดแม่แบบ Excel", icon: "../images/icons/page_excel.png",
                                handler: function () { window.open(Ext.MEDSUP_IMPORT_TEMPLATE, "_blank"); }
                            },
                        ],
                    },
                    summaryFld,
                ],
            },
            previewPanel,
        ],
        buttons: [exportBtn, saveBtn, {text: "ปิด", iconCls: "icon-clear", handler: function () { win.destroy(); }}],
    });
    win.show();
    // เลือกไฟล์ใหม่ = ล้างผลตรวจเดิม (ต้องกดตรวจสอบใหม่ก่อนบันทึก)
    fileFld.getEl().on("change", resetPreview);
    // ติ๊ก/เอาติ๊กออกในตารางก่อนบันทึก (ตารางถูกสร้างใหม่ทุกครั้งที่ตรวจสอบ จึงดักที่ตัวพาเนล)
    previewPanel.body.on("click", function (e, t) {
        // ติ๊ก "นำเข้า" = ทั้งสัญญา (ทุกแถวของลำดับสัญญาเดียวกัน)
        if (t && t.className === "medsup-imp-sel" && previewRows[t.getAttribute("data-i")]) {
            var seq = String(previewRows[t.getAttribute("data-i")].seq);
            previewRows.forEach(function (r) {
                if (String(r.seq) === seq && !r._bad) {
                    r._imp = t.checked;
                }
            });
            Ext.each(previewPanel.body.dom.querySelectorAll(".medsup-imp-sel"), function (el) {
                if (String(previewRows[el.getAttribute("data-i")].seq) === seq && !el.disabled) {
                    el.checked = t.checked;
                }
            });
            updateSaveBtn();
            return;
        }
        if (t && t.className === "medsup-imp-chk" && previewRows[t.getAttribute("data-i")]) {
            previewRows[t.getAttribute("data-i")]._chk = t.checked;
            updateExportBtn();
        }
    });
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];

    Ext.loadStore = function () {};

    Ext.extend(
        (gridMain = function () {
            gridMain.superclass.constructor.call(this, {
                region: "center",
                title: Ext.title,
                xtype: "grid",
                id: "tabpanel1",
                border: true,
                stripeRows: true,
                loadMask: true,
                layout: "fit",
                viewConfig: {emptyText: "ยังไม่มีประวัติการนำเข้า..", deferEmptyText: true},
                listeners: {
                    afterrender: function () {
                        this.on("rowdblclick", function (grid, rowIndex) {
                            winMedSupImportRows(grid.getStore().getAt(rowIndex));
                        });
                    },
                },
                store: Ext.storeMedSupImportList,
                tbar: [
                    {text: "นำเข้าใหม่", iconCls: "icon-add", handler: winMedSupImportNew},
                    "-",
                    {
                        text: "ยกเลิกชุดนำเข้า", iconCls: "icon-clear",
                        handler: function () {
                            var rec = Ext.getCmp("tabpanel1").getSelectionModel().getSelected();
                            if (!rec) {
                                Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการนำเข้าที่ต้องการยกเลิก");
                                return;
                            }
                            medSupImportCancel(rec);
                        }
                    },
                    "-",
                    {
                        text: "ดาวน์โหลดแม่แบบ Excel", icon: "../images/icons/page_excel.png",
                        handler: function () { window.open(Ext.MEDSUP_IMPORT_TEMPLATE, "_blank"); }
                    },
                    "->",
                    {xtype: "tbtext", text: "ดับเบิลคลิกรายการเพื่อดูสัญญาที่นำเข้า"},
                ],
                columns: [
                    new Ext.grid.RowNumberer({header: "ที่", width: 40}),
                    {header: "ชื่อรายการ", dataIndex: "c_import_name", width: 260},
                    {header: "ไฟล์", dataIndex: "c_file_name", width: 220},
                    {header: "จำนวนสัญญา", dataIndex: "i_contract_count", width: 90, align: "right"},
                    {header: "จำนวนงวด", dataIndex: "i_row_count", width: 80, align: "right"},
                    {header: "รายการรับของ", dataIndex: "i_receive_count", width: 90, align: "right"},
                    {header: "ยอดเงินรวม", dataIndex: "f_total_amt", width: 120, align: "right"},
                    {header: "ผู้นำเข้า", dataIndex: "c_user_name", width: 180},
                    {header: "วันที่นำเข้า", dataIndex: "d_create", width: 140, align: "center"},
                ],
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
