/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-repTor";

    //Spring Boot cross context
    Ext.urlReport1 = 1 ? "https://eis.nmu.ac.th:8443/reports/repBgExpense" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG 
//   Ext.urlReport1 = false ? "https://eis.nmu.ac.th:8443/reports/repBgExpense" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG

    Ext.titleReport = "รายงานการจองงบประมาณ ฝ่ายพัสดุ (PR)";
    function PermissionEmp(p) {
 //  console.log(Ext.session);
 
        switch (Ext.session.i_level) {
            case 1:
                var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                break;
            case 2:
                var i_level = [{id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                break;
            case 3:
                var i_level = [{id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                break; 
        } 
        
        Ext.storeEmp = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            data: i_level
        });

        return new Ext.form.ComboBox({
            id: "viewID",
            fieldLabel: "ดูรายงานตามสิทธิ์",
            hiddenName: "i_view",
            store: Ext.storeEmp,
            valueField: "id",
            displayField: "c_name",
            mode: "local",
            triggerAction: "all",
            width: 150,
            forceSelection: true,
            selectOnFocus: true,
            value: Ext.session.i_level,
        });
    }
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var yy_en = Ext.START_YEAR_ACC;
    years.push({id: "0", c_name: "- เลือกทั้งหมด -"});
    while (yy_en <= now) {
        years.push({id: yy_en, c_name: yy_en + 543});
        yy_en++;
    }

    Ext.store_year_all = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: years,
    });
    let Date_now = new Date();
    Date_now = Date_now.toISOString().split("T")[0].split("-");
    Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
  
    store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
    });
    Ext.dc_expense_budget_type = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpTorExp.php",
        baseParams: {type: "dc_expense_budget_type", all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
            },
        },
    });

    Ext.po_expense = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpTorExp.php",
        baseParams: {
            type: "po_expense",
            all: "all",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("po_expense_idID").setValue("0");
            },
        },
    });

    Ext.torType = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpTorExp.php",
        baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
//                Ext.getCmp("i_bgID").setValue("0");
            },
        },
    });


    function getTitleReport(v) {
        Ext.getCmp("getReportTypeID").setValue(v);
        var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
        Ext.getCmp("getReportTypeID").setValue(v);
        Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
        Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
        Ext.getCmp("dis_i_bgID").setValue(getStoreItems(Ext.torType, Ext.getCmp("i_bgID").getValue(), "c_name"));

        Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
        Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));

    }

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);
        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute("target","_blank");
        //Switch
        var urlReport = Ext.urlReport1;
//        var expression = Ext.getCmp('i_bgID').getValue().inputValue; 
//        switch (expression) {
//            case 1:
//                urlReport = Ext.urlReport1;
//                break;
//            case 2:
//                urlReport = Ext.urlReport2;
//                break;
//            case 3:
//                urlReport = Ext.urlReport3;
//                break; 
//        } 
        
        frm.setAttribute("action", urlReport);
        frm.submit();
        frm.focus();
    }

    function setButtonReport() {
        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: "small",
            iconCls: "icon-pdf",
            handler: function () {
                frmWithOutAjax("pdf");
            },
        };
        var excelReport = {
            text: Ext.GLOBAL_BU_EXCEL_TH,
            scale: "small",
            id: "rep-excel",
            iconCls: "icon-excel",
            handler: function () {
                frmWithOutAjax("excel");
            },
        };
        var exp2pdf = {
            text: "Export Pdf",
            scale: "small",
            id: "rep-exp2pdf",
            iconCls: "icon-export",
            handler: function () {
                frmWithOutAjax("exp2pdf");
            },
        };
        var exp2xlsx = {
            text: "Export Xlsx",
            scale: "small",
            id: "rep-exp2xlsx",
            iconCls: "icon-export",
            handler: function () {
                frmWithOutAjax("exp2xlsx");
            },
        };
        return [pdfReport, excelReport/*, exp2pdf, exp2xlsx*/];
    }

    var panelForm = new Ext.Panel({
        region: "center",
        title: Ext.titleReport,
        border: false,
        stripeRows: true,
        loadMask: true,
        items: [
            {
                xtype: "form",
                id: Ext.idRep,
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
                defaults: {anchor: "100%", msgTarget: "side", allowBlank: false},
                items: [
                    {
                        xtype: "container",
                        layout: "hbox",
                        align: "stretch",
                        RemoveHeight: true,
                        defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
                        items: [
                            {
                                title: "รายงานการจองงบประมาณ ฝ่ายพัสดุ (PR)",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "sp_emp_idtID", name: "sp_emp_id", value: Ext.session.sp_emp_id},
                                    
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepTor"},

                                    {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_i_bgID", name: "dis_tor_type_id", value: "PR ขอบเขตจัดซื้อ"},
                                    {xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_i_type_fix_rateID", name: "dis_i_type_fix_rate", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "i_type_fix_rate", name: "i_type_fix_rate", value: "ทั้งหมด"},
                                    { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                                    { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                                    new Ext.form.ComboBox({
                                        id: "i_yyyyID",
                                        fieldLabel: "ปีงบประมาณ",
                                        width: 163,
                                        mode: "local",
                                        store: store_year,
                                        hiddenName: "i_yyyy",
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        value: new Date().getFullYear(),
                                        listeners: {
                                            select: function () {
                                                var newValue =  Ext.getCmp('i_yyyyID').getValue() 
                                                if (newValue == "") {
                                                combo.reset();
                                                } else {
                                                Ext.getCmp('d_date_startID').setValue( "01-10-" + (newValue-1));
                                                Ext.getCmp('d_date_endID').setValue( "30-09-" + (newValue));
                                                Ext.getCmp('dis_d_date_startID').setValue( "30-09-" + (newValue));
                                                Ext.getCmp('dis_d_date_endID').setValue( "30-09-" + (newValue));
                                                if (newValue.id == Ext.bgYear) {
                                                    Ext.getCmp("d_date_startID").setValue(addY(543));
                                                    Ext.getCmp("d_date_endID").setValue(addY(543));
                                                    } else {
                                                        Ext.getCmp("d_date_startID").setValue("30-09" + newValue.id);
                                                        Ext.getCmp("d_date_endID").setValue("30-09" + newValue.id);
                                                    }
                                                }
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                var length = q.query.length;
                                                q.query = new RegExp(Ext.escapeRe(q.query));
                                                q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            },
                                            },
                                        }),
                                    new Ext.form.ComboBox({
                                        id: "dc_expense_budget_type_idID",
                                        hiddenName: "dc_expense_budget_type_id",
                                        fieldLabel: "แหล่งเงิน",
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        emptyText: "กรุณาเลือก...",
                                        width: 500,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        value: "0",
                                        listeners: {
                                            change: function (combo, newValue) {
                                                if (newValue == "") {
                                                    combo.reset();
                                                }
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                    var length = q.query.length;
                                                    q.query = new RegExp(Ext.escapeRe(q.query));
                                                    q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            },
                                        },
                                    }),
                                    new Ext.form.ComboBox({
                                        id: "po_expense_idID",
                                        hiddenName: "po_expense_id",
                                        fieldLabel: "รายการย่อย",
                                        store: Ext.po_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        emptyText: "กรุณาเลือก...",
                                        width: 500,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        value: "0",
                                        listeners: {
                                            change: function (combo, newValue) {
                                                if (newValue == "") {
                                                    combo.reset();
                                                }
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                    var length = q.query.length;
                                                    q.query = new RegExp(Ext.escapeRe(q.query));
                                                    q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            },
                                        },
                                    }),
                                    {
                                        xtype: "compositefield",
                                        fieldLabel: "ระหว่างวันที่",
                                        msgTarget: "under",
                                        items: [
                                        {
                                            xtype: "datefield",
                                            id: "d_date_startID",
                                            width: 177,
                                            value: "01-10" + (Ext.bgYear - 1),
                                        },
                                        {
                                            xtype: "displayfield",
                                            value: "ถึงวันที่",
                                            width: 36,
                                            align: "center",
                                        },
                                        {
                                            xtype: "datefield",
                                            id: "d_date_endID",
                                            width: 177,
                                            value: addY(543),
                                        },
                                        ],
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [150],
                                        fieldLabel: "การจอง",
                                        id: "i_bgID",
                                        name: "i_bg",
                                        items: [
                                            {

                                                name: "i_bg",
                                                inputValue: 1,
                                                checked: true,
                                                boxLabel: "PR ขอบเขตจัดซื้อ",
                                            },
                                            {
                                                inputValue: 2,
                                                name: "i_bg",
                                                boxLabel: "PO สัญญา",
                                            },
                                            {
                                                name: "i_bg",
                                                inputValue: 3,
                                                boxLabel: "Checking ตรวจรับ",
                                            },
                                            {
                                                // hidden : true,
                                                name: "i_bg",
                                                inputValue: 4,
                                                boxLabel: "รายงาน เงินอุดหนุน กทม.",
                                                load: function () {
                                                                Ext.getCmp("dc_expense_budget_type_idID").setValue("4");
                                                                    },
                                            },
                                            {
                                                // hidden : true,
                                                name: "i_bg",
                                                inputValue: 5,
                                                boxLabel: "รายงาน เงินอุดหนุน รัฐบาล",
                                                load: function () {
                                                    Ext.getCmp("dc_expense_budget_type_idID").setValue("5");
                                                        },
                                            },
                                            {
                                                // hidden : true,
                                                name: "i_bg",
                                                inputValue: 6,
                                                boxLabel: "รายงานการจองงบประมาณ",
                                                load: function () {
                                                    // Ext.getCmp("dc_expense_budget_type_idID").setValue("5");
                                                        },
                                            },
                                        ], //radiogroup 
                                        listeners: {
                                            // load: function (t, records, options) {
                                                // Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
                                            // },
                                            change: function () {
                                                if (this.getValue().inputValue  == 4 ) {
                                                    Ext.getCmp('dc_expense_budget_type_idID').hide();
                                                    // Ext.getCmp('i_bgID').hide();
                                                    Ext.getCmp('dc_expense_budget_type_idID').setValue(4);
                                                    // Ext.dc_expense_budget_type.load();
                                                } else if (this.getValue().inputValue == 5) {
                                                    Ext.getCmp('dc_expense_budget_type_idID').hide();
                                                    // Ext.getCmp('i_bgID').hide();
                                                    Ext.getCmp('dc_expense_budget_type_idID').setValue(5);
                                                } else {
                                                    Ext.getCmp('dc_expense_budget_type_idID').show();
                                                    // Ext.getCmp('i_bgID').show();
                                                    // Ext.dc_expense_budget_type.load();
                                                }
                                            },
                                        },
                                    },
                                    PermissionEmp()
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: setButtonReport()
            },
        ],
    });
    new Ext.Viewport({
        id: 'portViewID',
        layout: "border",
        items: panelForm,
        listeners: {
            beforerender: function () {
                Ext.getCmp('portViewID').getEl().mask("Please wait...", "x-mask-loading");
            },
            afterrender: function () {
                Ext.getCmp('portViewID').getEl().unmask();
            }
        }
    });
});
