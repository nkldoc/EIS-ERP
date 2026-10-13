/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-repTor";
    //Spring Boot cross context
    Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/RepSpContractSurety" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
    // Ext.urlReport = false ? "https://eis.nmu.ac.th:8443/reports/RepSpContractSurety" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
    // Spring Boot
    Ext.titleReport = "รายงานการค้ำประกันสัญญา";

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

    // Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    //     autoDestroy: false,
    //     autoLoad: true,
    //     url: "api/All_RepSpTorExp.php",
    //     baseParams: {type: "dc_expense_budget_type", all: "all"},
    //     root: "data",
    //     idProperty: "id",
    //     fields: ["id", "c_name"],
    //     listeners: {
    //         load: function (t, records, options) {
    //             Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
    //         },
    //     },
    // });

    // Ext.po_expense = new Ext.data.JsonStore({
    //     autoDestroy: false,
    //     autoLoad: true,
    //     url: "api/All_RepSpTorExp.php",
    //     baseParams: {
    //         type: "po_expense",
    //         all: "all",
    //     },
    //     root: "data",
    //     idProperty: "id",
    //     fields: ["id", "c_name"],
    //     listeners: {
    //         load: function (t, records, options) {
    //             Ext.getCmp("po_expense_idID").setValue("0");
    //         },
    //     },
    // });

    // Ext.torType = new Ext.data.JsonStore({
    //     autoDestroy: false,
    //     autoLoad: true,
    //     url: "api/All_RepSpTorExp.php",
    //     baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
    //     root: "data",
    //     idProperty: "id",
    //     fields: ["id", "c_name"],
    //     listeners: {
    //         load: function (t, records, options) {
    //             Ext.getCmp("tor_type_idID").setValue("0");
    //         },
    //     },
    // });


    function getTitleReport(v) {
        Ext.getCmp("getReportTypeID").setValue(v);
        // var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
        // var dis_i_purchase = Ext.getCmp("i_purchaseID").getValue().inputValue == 0 ? "- เลือกทั้งหมด -" : Ext.getCmp("i_purchaseID").getValue().boxLabel;
 
        Ext.getCmp("getReportTypeID").setValue(v);
        // Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        // Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
        // Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
        // Ext.getCmp("dis_tor_type_idID").setValue(getStoreItems(Ext.torType, Ext.getCmp("tor_type_idID").getValue(), "c_name"));
        // Ext.getCmp("dis_i_purchaseID").setValue(dis_i_purchase);
        // Ext.getCmp("dis_product_typeID").setValue(Ext.getCmp("i_product_typeID").getValue().boxLabel);
        // Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
        // Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));


    }

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);
        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute("target", Ext.idRep);
        frm.setAttribute("action", Ext.urlReport);
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
            listeners: {
                afterrender: function () {
                  this.fn = function () {
                        //  alert('trigger change store cr');
                        //  alert('trigger change store dr');
                        // Ext.getCmp("c_viwe_ID").setValue(getStoreItems();
                  };
                },
                Change: function () {
                  this.fn();
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
        });
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
                                title: "รายงานการค้ำประกันสัญญา",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "sp_emp_idtID", name: "sp_emp_id", value: Ext.session.sp_emp_id},
                                    // {xtype: "hidden", id: "c_viwe_ID", name: "c_viwe", value: "ทั้งหมด"},
                                    


                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepSpContractSurety"},

                                    // {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},
                                    // {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                                    // {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
                                    // {xtype: "hidden", id: "dis_tor_type_idID", name: "dis_tor_type_id", value: "ทั้งหมด"},
                                    // {xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด"}, 
                                    // {xtype: "hidden", id: "dis_product_typeID", name: "dis_product_type", value: "ทั้งหมด"},
                                    // { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                                    // new Ext.form.ComboBox({
                                    //     id: "i_yyyyID",
                                    //     fieldLabel: "ปีงบประมาณ",
                                    //     hiddenName: "i_yyyy",
                                    //     store: Ext.store_year_all,
                                    //     valueField: "id",
                                    //     displayField: "c_name",
                                    //     mode: "local",
                                    //     triggerAction: "all",
                                    //     width: 150,
                                    //     forceSelection: true,
                                    //     selectOnFocus: true,
                                    //     value: "0",
                                    // }),
                                    // new Ext.form.ComboBox({
                                    //     id: "dc_expense_budget_type_idID",
                                    //     hiddenName: "dc_expense_budget_type_id",
                                    //     fieldLabel: "แหล่งเงิน",
                                    //     store: Ext.dc_expense_budget_type,
                                    //     valueField: "id",
                                    //     displayField: "c_name",
                                    //     mode: "local",
                                    //     triggerAction: "all",
                                    //     emptyText: "กรุณาเลือก...",
                                    //     width: 500,
                                    //     forceSelection: true,
                                    //     selectOnFocus: true,
                                    //     typeAhead: false,
                                    //     value: "0",
                                    //     listeners: {
                                    //         change: function (combo, newValue) {
                                    //             if (newValue == "") {
                                    //                 combo.reset();
                                    //             }
                                    //         },
                                    //         beforequery: function (q) {
                                    //             if (q.query) {
                                    //                 var length = q.query.length;
                                    //                 q.query = new RegExp(Ext.escapeRe(q.query));
                                    //                 q.query.length = length;
                                    //             }
                                    //         },
                                    //         blur: function () {
                                    //             this.getStore().clearFilter();
                                    //         },
                                    //     },
                                    // }),
                                    // new Ext.form.ComboBox({
                                    //     id: "po_expense_idID",
                                    //     hiddenName: "po_expense_id",
                                    //     fieldLabel: "รายการย่อย",
                                    //     store: Ext.po_expense,
                                    //     valueField: "id",
                                    //     displayField: "c_name",
                                    //     mode: "local",
                                    //     triggerAction: "all",
                                    //     emptyText: "กรุณาเลือก...",
                                    //     width: 500,
                                    //     forceSelection: true,
                                    //     selectOnFocus: true,
                                    //     typeAhead: false,
                                    //     value: "0",
                                    //     listeners: {
                                    //         change: function (combo, newValue) {
                                    //             if (newValue == "") {
                                    //                 combo.reset();
                                    //             }
                                    //         },
                                    //         beforequery: function (q) {
                                    //             if (q.query) {
                                    //                 var length = q.query.length;
                                    //                 q.query = new RegExp(Ext.escapeRe(q.query));
                                    //                 q.query.length = length;
                                    //             }
                                    //         },
                                    //         blur: function () {
                                    //             this.getStore().clearFilter();
                                    //         },
                                    //     },
                                    // }),
                                    /*{
                                        xtype: "compositefield",
                                        fieldLabel: "ระหว่างวันที่",
                                        msgTarget: "under",
                                        items: [
                                        {
                                            xtype: "datefield",
                                            id: "d_date_startID",
                                            width: 177,
                                            value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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
                                    },*/
                                    // new Ext.form.ComboBox({
                                    //     id: "tor_type_idID",
                                    //     hiddenName: "tor_type_id",
                                    //     fieldLabel: "วิธีดำเนินงาน",
                                    //     store: Ext.torType,
                                    //     valueField: "id",
                                    //     displayField: "c_name",
                                    //     mode: "local",
                                    //     triggerAction: "all",
                                    //     emptyText: "กรุณาเลือก...",
                                    //     width: 150,
                                    //     forceSelection: true,
                                    //     selectOnFocus: true,
                                    //     typeAhead: false,
                                    //     value: "0",
                                    //     listeners: {
                                    //         change: function (combo, newValue) {
                                    //             if (newValue == "") {
                                    //                 combo.reset();
                                    //             }
                                    //         },
                                    //         beforequery: function (q) {
                                    //             if (q.query) {
                                    //                 var length = q.query.length;
                                    //                 q.query = new RegExp(Ext.escapeRe(q.query));
                                    //                 q.query.length = length;
                                    //             }
                                    //         },
                                    //         blur: function () {
                                    //             this.getStore().clearFilter();
                                    //         },
                                    //     },
                                    // }),
                                    // {
                                    //     xtype: "radiogroup",
                                    //     columns: [90, 60, 60, 60],
                                    //     fieldLabel: "ขอดำเนินการ",
                                    //     id: "i_purchaseID",
                                    //     name: "i_purchase",
                                    //     items: [
                                    //         {
                                    //             checked: true,
                                    //             name: "i_purchase",
                                    //             inputValue: 0,
                                    //             boxLabel: "เลือกทั้งหมด",
                                    //         },
                                    //         {
                                    //             name: "i_purchase",
                                    //             inputValue: 1,
                                    //             boxLabel: "จัดซื้อ",
                                    //         },
                                    //         {
                                    //             inputValue: 2,
                                    //             name: "i_purchase",
                                    //             boxLabel: "จัดจ้าง",
                                    //         },
                                    //         {
                                    //             name: "i_purchase",
                                    //             inputValue: 3,
                                    //             boxLabel: "จัดเช่า",
                                    //         },
                                    //     ], //radiogroup
                                    //     listeners: {
                                    //         change: function () {
                                    //             if (this.getValue().inputValue > 1 ) {
                                    //                 Ext.getCmp('i_type_contract3ID').hide();
                                    //             } else {
                                    //                 Ext.getCmp('i_type_contract3ID').show();
                                    //             }
                                    //         },
                                    //     },
                                    // }, {
                                    //     xtype: "radiogroup",
                                    //     columns: [90, 60, 60, 100],
                                    //     fieldLabel: "ประเภทสัญญา",
                                    //     id: "i_type_contractID",
                                    //     name: "i_type_contract",
                                    //     items: [
                                    //         {
                                    //             checked: true,
                                    //             name: "i_type_contract",
                                    //             id: "i_type_contract1ID",
                                    //             inputValue: 0,
                                    //             boxLabel: "เลือกทั้งหมด",
                                    //         },
                                    //         {
                                    //             name: "i_type_contract",
                                    //             inputValue: 1,
                                    //             boxLabel: "สัญญา",
                                    //         },
                                    //         {
                                    //             inputValue: 2,
                                    //             id: "i_type_contract2ID",
                                    //             name: "i_type_contract",
                                    //             boxLabel: "ใบสั่ง",
                                    //         },
                                    //         {
                                    //             name: "i_type_contract",
                                    //             id: "i_type_contract3ID",
                                    //             inputValue: 3,
                                    //             boxLabel: "จะซื้อจะขาย",
                                    //         },
                                    //     ], //radiogroup
                                    //     listeners: {
                                    //         change: function () {

                                    //         },
                                    //     },
                                    // }, {
                                    //     xtype: "radiogroup",
                                    //     columns: [90, 60, 80, 100],
                                    //     fieldLabel: "ของที่ได้มา",
                                    //     id: "i_product_typeID",
                                    //     name: "i_type_contract",
                                    //     items: [
                                    //         {
                                    //             checked: true,
                                    //             name: "i_product_type", 
                                    //             inputValue: -1,
                                    //             boxLabel: "เลือกทั้งหมด",
                                    //         },
                                    //         { 
                                    //             name: "i_product_type", 
                                    //             inputValue: 0,
                                    //             boxLabel: "ไม่มีของ", 
                                    //         },
                                    //         {
                                    //             name: "i_product_type",
                                    //             inputValue: 1,
                                    //             boxLabel: "วัสดุทั่วไป",
                                    //         },
                                    //         {
                                    //             inputValue: 2, 
                                    //             name: "i_product_type",
                                    //             boxLabel: "ครุภัณฑ์", 
                                    //         },
                                    //     ], //radiogroup
                                    //     listeners: {
                                    //         change: function () {

                                    //         },
                                    //     },
                                    // }
                                    // /*  เงื่อนไขการส่งเบิก
                                    //  * TOR(PR)		ระหว่างดำเนินการ(PO)		รอส่งของ(ARR)		ตรวจรับพัสดุ(CHK)		ส่งเบิกแล้ว(Withdrawal)
                                    //  * 
                                    //  * */
                                    // ,{
                                    //     xtype: "radiogroup",
                                    //     columns: [150, 150, 150],
                                    //     fieldLabel: "สถานะรายการ",
                                    //     id: "i_statusID",
                                    //     name: "i_status",
                                    //     items: [
                                    //         {
                                    //             name: "i_status",
                                    //             checked: true,
                                    //             inputValue: 1,
                                    //             boxLabel: "TOR(PR)",
                                    //         },
                                    //         {
                                    //             inputValue: 2, 
                                    //             name: "i_status",
                                    //             boxLabel: "ระหว่างดำเนินการ(PO)",
                                    //         },
                                    //         {
                                    //             name: "i_status", 
                                    //             inputValue: 3,
                                    //             boxLabel: "รอส่งของ(ARR)",
                                    //         },
                                    //         {
                                    //             name: "i_status", 
                                    //             inputValue: 4,
                                    //             boxLabel: "ตรวจรับพัสดุ(CHK)",
                                    //         },
                                    //         {
                                    //             name: "i_status", 
                                    //             inputValue: 5,
                                    //             boxLabel: "ส่งเบิกแล้ว(Withdrawal)",
                                    //         },
                                    //     ], //radiogroup
                                    //     listeners: {
                                    //         change: function () {

                                    //         },
                                    //     },
                                    // }, 
                                    PermissionEmp()
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: setButtonReport(),
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
