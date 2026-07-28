/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-repTor";
    //Spring Boot cross context
    Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/repSpContractPeriodnotorNew" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
// Ext.urlReport = false ? "https://eis.nmu.ac.th:8443/reports/repSpContractPeriodnotorNew" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
    // Spring Boot
    Ext.titleReport = "รายงานทะเบียนคุมสัญญา";
    function PermissionEmp(p) {
        if (Ext.session.i_level == 1) {
            var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
            var level = 1
        } else if (Ext.session.i_level == 2 && Ext.session.dc_department_id != 5) {
            var i_level = [{id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
            var level = 2
        } else if (Ext.session.i_level == 3) {
            var i_level = [{id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
            var level = 3
        } else if (Ext.session.i_level == 2 && Ext.session.dc_department_id == 5) {
            var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
            var level = 1
        } else {
            var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
            var level = 1
        }
        // switch (Ext.session.i_level &&Ext.session.dc_department_id ) {
        //   // if (Ext.session.)
        //   case 1  :
        //       var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
        //       break;
        //   case 2 :
        //       var i_level = [{id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
        //       break;
        //   case 3:
        //       var i_level = [{id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
        //       break;
        // }

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
            value: level,
        });
    }
    Ext.sp_department = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_RepSpContractPeriodnotor.php",
        baseParams: {type: "sp_department", all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                // Ext.getCmp("dc_department_idID").setValue("0");
                // alert("sp_department") ;
            },
        },
    });
    Ext.sp_tor_contract = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_RepSpContract.php",
        baseParams: {type: "sp_tor_contract", all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("sp_tor_contract_idID").setValue("0");
                // alert("sp_tor_contract") ;
            },
        },
    });
    Ext.dc_creditor = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_creditor",
            Repall: "Repall",
            all: "all_dc"
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("dc_creditor_idID").setValue("0");
            },
        },
    });
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
    Ext.sp_emp = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpContractPeriodnotor.php",
        baseParams: {type: "sp_emp", all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("sp_emp_idID").setValue("0");
            },
        },
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
    Ext.store_year_s = new Ext.data.JsonStore({
        autoLoad: true,
        url: "api/All_RepSpTorExp.php",
        baseParams: {type: "store_year_s", i_level: 4, show: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
// var pu_arr = [];
    // pu_arr[1]="จัดซื้อ";
    // pu_arr[2]="จัดจ้าง";
    // pu_arr[3]="จัดเช่า";
    // Ext.getCmp("dis_i_purchaseID").setValue(pu_arr[Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue];
    function getTitleReport(v) {
        Ext.getCmp('getReportTypeID').setValue(v);
        //  var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
        Ext.getCmp("dis_i_yearID").setValue(Ext.newYear);
        Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_emp, Ext.getCmp("sp_emp_idID").getValue(), "c_name"));
        Ext.getCmp("dis_sp_tor_contract_idID").setValue(getStoreItems(Ext.sp_tor_contract, Ext.getCmp("sp_tor_contract_idID").getValue(), "c_code"));
        // Ext.getCmp("dis_i_purchaseID").setValue(Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue)].boxLabel) ;
        // Ext.getCmp("dis_type_contractID").setValue(Ext.getCmp("i_type_contractID").items.items[(Ext.getCmp("i_type_contractID").getValue().inputValue)].boxLabel) ;
        // Ext.getCmp("dis_i_product_typeID").setValue(Ext.getCmp("i_product_typeID").items.items[(Ext.getCmp("i_product_typeID").getValue().inputValue)].boxLabel) ;
        // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ;
        // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ;

        // Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
        // Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
        // Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
        Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
    }
    function frmWithOutAjax(value) {
        if (Ext.newYear == null || Ext.newYear == "") {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกปีงบประมาณ");
            return false;
        }
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
        //
        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: "small",
            iconCls: "icon-pdf",
            handler: function () {
                //  console.log (Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue-1)].boxLabel) ;
                //  console.log (Ext.getCmp("i_type_contractID").items.items[(Ext.getCmp("i_type_contractID").getValue().inputValue-1)].boxLabel) ;
                //  console.log (Ext.getCmp("i_product_typeID").items.items[(Ext.getCmp("i_product_typeID").getValue().inputValue-1)].boxLabel) ;
                //  console.log (Ext.getCmp("i_report_contentID").items.items[(Ext.getCmp("i_report_contentID").getValue().inputValue-1)].boxLabel) ;
                //  return false ;
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
        var html = {
            text: "html",
            scale: "small",
            id: "rep-exp2pdf",
            iconCls: "icon-html",
            handler: function () {
                frmWithOutAjax("exp2html");
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
                                title: "รายงานรายระเอียดสัญญางวด",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    // { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepSpContractPeriodnotorNew"},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    // { xtype: "hidden", id: "dis_dc_department_idID", name: "dis_dc_department_id", value: "ทั้งหมด" },
                                    {xtype: "hidden", id: "dis_i_yearID", name: "dis_i_year", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "dis_sp_emp_idtID", name: "dis_sp_emp_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_sp_tor_contract_idID", name: "dis_sp_tor_contract_id", value: "ทั้งหมด"},
                                    // { xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_type_contractID", name: "dis_i_type_contract", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_i_product_typeID", name: "dis_i_product_type", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_c_checking_codeID", name: "dis_c_checking_code", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                                    {xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด"},
                                    // { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                                    // { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                                    // {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    /*new Ext.form.ComboBox({
                                     id: "dc_department_idID",
                                     fieldLabel: "สายงาน",
                                     hiddenName: "dc_department_id",
                                     store: Ext.sp_department,
                                     valueField: "id",
                                     displayField: "c_name",
                                     mode: "local",
                                     triggerAction: "all",
                                     width: 350,
                                     forceSelection: true,
                                     selectOnFocus: true,
                                     value: "0",
                                     }),*/
                                    {
                                        xtype: "hidden",
                                        name: "i_sys",
                                        value: 1
                                    },
                                    new Ext.ux.form.LovCombo({
                                        id: "s_i_year",
                                        fieldLabel: "ประจำปี",
                                        width: 163,
                                        mode: "local",
                                        store: Ext.store_year_s,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        listeners: {
                                            Change: function () {
                                                var myStr = this.value;
                                                Ext.replace_id = myStr.replaceAll(";", ",");
                                                Ext.newYear = Ext.replace_id;
                                                // console.log(Ext.newStr)
                                                // }
                                            }
                                        }
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
                                    new Ext.form.ComboBox({
                                        id: "sp_tor_contract_idID",
                                        fieldLabel: "เลขที่สัญญา",
                                        hiddenName: "sp_tor_contract_id",
                                        store: Ext.sp_tor_contract,
                                        valueField: "id",
                                        displayField: "c_code",
                                        mode: "local",
                                        triggerAction: "all",
                                        width: 150,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        value: "0",
                                    }),
                                    // PermissionEmp(),
                                    new Ext.form.ComboBox({
                                        id: "sp_emp_idID",
                                        hiddenName: "sp_emp_id",
                                        fieldLabel: "ชื่อพนักงาน",
                                        // store: Ext.sp_user,
                                        store: Ext.sp_emp,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        emptyText: "กรุณาเลือก...",
                                        width: 200,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        // value: ((Ext.session.i_level == 3) ? "0" : Ext.session.sp_emp_id),
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
                                            }
                                        }
                                    }),
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        store: Ext.dc_creditor,
                                        anchor: "50%",
                                        fieldLabel: "ผู้ขายผู้รับจ้าง",
                                        valueField: "id",
                                        displayField: "c_name",
                                        hiddenName: "dc_creditor_id",
                                        name: "dc_creditor_name",
                                        id: "dc_creditor_idID",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        submitValue: true,
                                        allowBlank: false,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                                this.fn_change = function () {
                                                    if (this.getValue() > 0) {
                                                        creditor_taxdata_load(this.getValue());
                                                    }
                                                };
                                            },
                                            change: function (combo, newValue) {
                                                this.fn();
                                                var record = this.getStore().getAt(this.getStore().findExact("id", newValue));
                                                if (record) {
                                                    this.fn_change();
                                                } else {
                                                }
                                            },
                                            select: function (combo, record, index) {
                                                this.fn_change();
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



    Ext.sp_department.reload({
        callback: function (record, operation, success) {
            if (success) { ////
                Ext.sp_tor_contract.reload({
                    callback: function (record, operation, success) {
                        if (success) {
                            new Ext.Viewport({
                                layout: "border",
                                items: panelForm,
                            });
                        }
                    },
                });
            }
        },
    });
});



