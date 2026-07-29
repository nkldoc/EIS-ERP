/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
Ext.urlReport     = true ? "../../reports/repSpContract_registrationGL" : "../../reports/printr.php?get=true"; //DEBUG (PDF/Excel เดิม)
Ext.urlReportHTML = "report/RepSpContract_registrationGL_html.php"; // endpoint HTML ใหม่
  // Spring Boot
  Ext.titleReport = "รายงานทะเบียนคุมสัญญา";
  function PermissionEmp(p) {
        if (Ext.session.i_level == 1  ){
                var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                var level = 1
        } else if (Ext.session.i_level == 2&& Ext.session.dc_department_id != 5){
                var i_level = [{id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                var level = 2
        } else if (Ext.session.i_level == 3 ){
                var i_level = [{id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
                var level = 3
        } else if (Ext.session.i_level == 2 && Ext.session.dc_department_id == 5){
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
    baseParams: { type: "sp_department", all: "all" },
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
    baseParams: { type: "sp_tor_contract", all: "all", i_sys: "0" },
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
  Ext.sp_emp = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContractPeriodnotor.php",
    baseParams: { type: "sp_emp", all: "all", i_sys: "0" },
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
    baseParams: { type: "dc_expense_budget_type", all: "all", i_sys: "0" },
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
        i_sys: "0",
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
Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContract.php",
    baseParams: { type: "dc_creditor", all: "all", i_sys: "0" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
        load: function (t, records, options) {
            Ext.getCmp("dc_creditor_idID").setValue("0");
        },
    },
});
// ── ส่วนงาน (dc_cost) : แหล่งข้อมูลของ combo ค้นหา + เลือกได้หลายรายการ ──
// (แทนที่ radio "ข้อมูลซื้อจ้าง" เดิม) — join กับ NMU_DATACENTER..dc_cost
Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/RepSpContract_registrationGL_dc_cost.php",
    root: "data",
    idProperty: "dc_cost_acc_id",
    fields: ["dc_cost_acc_id", "dc_cost_parent_id", "c_code", "c_code_tree", "c_name"],
});
// var pu_arr = [];
  // pu_arr[1]="จัดซื้อ";
  // pu_arr[2]="จัดจ้าง";
  // pu_arr[3]="จัดเช่า";
  // Ext.getCmp("dis_i_purchaseID").setValue(pu_arr[Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue];
  function getTitleReport(v) {
       Ext.getCmp('getReportTypeID').setValue(v);
       var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;

       //
      // Ext.getCmp("dis_dc_department_idID").setValue(getStoreItems(Ext.sp_department,Ext.getCmp("dc_department_idID").getValue() , "c_name"));
      Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_emp,Ext.getCmp("sp_emp_idID").getValue() , "c_name"));
      Ext.getCmp("dis_sp_tor_contract_idID").setValue(getStoreItems(Ext.sp_tor_contract,Ext.getCmp("sp_tor_contract_idID").getValue() , "c_code"));
      // Ext.getCmp("dis_i_purchaseID").setValue(Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue)].boxLabel) ;
      // Ext.getCmp("dis_type_contractID").setValue(Ext.getCmp("i_type_contractID").items.items[(Ext.getCmp("i_type_contractID").getValue().inputValue)].boxLabel) ;
      Ext.getCmp("dis_i_type_RepID").setValue(Ext.getCmp("i_type_RepID").items.items[(Ext.getCmp("i_type_RepID").getValue().inputValue)]) ;
      // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ;       
      // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ; 

      Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
      Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
      Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
      Ext.getCmp("dis_dc_creditor_idID").setValue(getStoreItems(Ext.dc_creditor, Ext.getCmp("dc_creditor_idID").getValue(), "c_name"));
      // ส่วนงาน (เลือกได้หลายรายการ) — combo จะอัพเดต dis_dc_cost_acc_idID ให้เองทุกครั้งที่เลือก/ยกเลิกเลือก
      // แต่ sync ซ้ำอีกครั้งตรงนี้เผื่อกรณี field ยังไม่เคย trigger listener
      var dcCostCombo = Ext.getCmp("dc_cost_acc_idID");
      if (dcCostCombo && typeof dcCostCombo.updateDisplay === "function") {
        dcCostCombo.updateDisplay();
      }
    }
  function frmWithOutAjax(value) {
    getTitleReport(value);
    var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
    frm.setAttribute("target", Ext.idRep);
    frm.setAttribute("action", Ext.urlReport);
    frm.submit();
    frm.focus();
  }
  // เปิดรายงาน HTML ใน tab ใหม่ (ส่ง params ผ่าน URL querystring)
  function frmHtmlReport() {
    getTitleReport("html");
    var form   = Ext.getCmp(Ext.idRep).getForm();
    var values = form.getValues();
    // ข้อมูลซื้อจ้าง (i_sys) ถูกแทนที่ด้วยฟิลด์ "ส่วนงาน" (dc_cost_acc_id) แล้ว
    // คงค่า i_sys ไว้ตามค่าจาก hidden field เดิม (ค่าเริ่มต้น "0" = ไม่กรองแยกระบบ)
    // อ่านค่า i_type_Rep จาก DOM โดยตรง (1=PR, 2=เลขสัญญา, 0=ทั้งหมด)
    var checkedRep = document.querySelector('input[name="i_type_Rep"]:checked');
    values['i_type_Rep'] = checkedRep ? checkedRep.value : '1';
    var qs = [];
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(values[k]));
        }
    }
    var url = Ext.urlReportHTML + '?' + qs.join('&');
    window.open(url, '_blank');
}
  // เปิดรายงาน HTML แบบเดียวกัน แต่สั่ง auto export เป็น Excel ทันที
  // (ใช้คิวรี่ชุดเดียวกับรายงาน HTML ผ่าน RepSpContract_registrationGL_data.php)
  function frmExcelReport() {
    getTitleReport("excel");
    var form   = Ext.getCmp(Ext.idRep).getForm();
    var values = form.getValues();
    // ข้อมูลซื้อจ้าง (i_sys) ถูกแทนที่ด้วยฟิลด์ "ส่วนงาน" (dc_cost_acc_id) แล้ว
    var checkedRep = document.querySelector('input[name="i_type_Rep"]:checked');
    values['i_type_Rep'] = checkedRep ? checkedRep.value : '1';
    values['auto'] = 'excel'; // บอกหน้า HTML report ให้ดาวน์โหลด Excel อัตโนมัติหลังโหลดข้อมูลเสร็จ
    var qs = [];
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(values[k]));
        }
    }
    var url = Ext.urlReportHTML + '?' + qs.join('&');
    window.open(url, '_blank');
  }
  function setButtonReport() {
    var htmlReport = {
      text: "\u0e41\u0e2a\u0e14\u0e07\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19", // แสดงรายงาน
      scale: "small",
      iconCls: "icon-pdf",
      handler: function () {
        frmHtmlReport();
      },
    };
    var excelReport = {
      text: Ext.GLOBAL_BU_EXCEL_TH,
      scale: "small",
      id: "rep-excel",
      iconCls: "icon-excel",
      handler: function () {
        frmExcelReport();
      },
    };
    return [htmlReport, excelReport];
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
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "รายงานรายระเอียดสัญญางวด",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  // { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpContractPeriodnotorNew" },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // { xtype: "hidden", id: "dis_dc_department_idID", name: "dis_dc_department_id", value: "ทั้งหมด" },
                  {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                  // {xtype: "hidden", id: "sp_emp_idtID", name: "sp_emp_id", value: Ext.session.sp_emp_id},
                  { xtype: "hidden", id: "dis_sp_tor_contract_idID", name: "dis_sp_tor_contract_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "i_sysID", name: "i_sys", value: "0" }, // 0=ทั้งหมด 1=คณะแพทย์ 3=มหาวิทยาลัย
                  // { xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_type_contractID", name: "dis_i_type_contract", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_type_RepID", name: "dis_i_type_Rep", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_c_checking_codeID", name: "dis_c_checking_code", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด" },
                  {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "2566" },
                  {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_dc_creditor_idID", name: "dis_dc_creditor_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_dc_cost_acc_idID", name: "dis_dc_cost_acc_id", value: "ทั้งหมด"},
                  // เก็บ id ของ "ส่วนงาน" ที่เลือกไว้จริง (คั่นด้วยจุลภาค รองรับเลือกหลายรายการ)
                  { xtype: "hidden", id: "dc_cost_acc_idHiddenID", name: "dc_cost_acc_id", value: "" },
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
                    value: "0",
                    listeners: {

                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      select: function (combo, newValue) {
                        Ext.getCmp("d_date_startID").setValue("01-10" + (newValue.id - 1));
                        // Ext.getCmp("d_date_endID").setValue("01-10" + (newValue.id - 1));
                        Ext.getCmp("dis_d_date_startID").setValue("01-10" + (newValue.id - 1));
                        // Ext.getCmp("dis_d_date_endID").setValue("01-10" + (newValue.id - 1));
                        if (newValue.id == Ext.bgYear) {
                          // Ext.getCmp("d_date_startID").setValue(addY(543));
                          Ext.getCmp("d_date_endID").setValue(addY(543));
                          // Ext.getCmp("dis_d_date_startID").setValue(addY(543));
                          Ext.getCmp("dis_d_date_endID").setValue(addY(543));
                        } else {
                          // Ext.getCmp("d_date_startID").setValue("30-09" + newValue.id);
                          Ext.getCmp("d_date_endID").setValue("30-09" + newValue.id);
                          // Ext.getCmp("dis_d_date_startID").setValue("30-09" + newValue.id);
                          Ext.getCmp("dis_d_date_endID").setValue("30-09" + newValue.id);
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
                      fieldLabel: "ระหว่างวันที่เริ่มสัญญา",
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
                    width: 260,
                    listWidth: 320,
                    forceSelection: true,
                    selectOnFocus: true,
                    value: "0",
                  }),
                  PermissionEmp(),

                  new Ext.form.ComboBox({
                    id: "sp_emp_idID",
                    hiddenName: "sp_emp_id",
                    fieldLabel: "ชื่อพนักงาน",
                    store: Ext.sp_emp,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 350,
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
                    id: "dc_creditor_idID",
                    hiddenName: "dc_creditor_id",
                    fieldLabel: "ผู้ขายผู้รับจ้าง",
                    store: Ext.dc_creditor,
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
                  }),
                  
                  {
                    xtype: "radiogroup",
                    columns: [115,115,115,115],
                    fieldLabel: "การดำเนินงาน",
                    id: "i_purchaseID",
                    hidden:true,
                    name: "i_purchase",
                    items: [
                        {
                        checked: true,
                        name: "i_purchase",
                        inputValue: 0,
                        boxLabel: "ทั้งหมด",
                        },
                        {
                            
                            name: "i_purchase",
                            inputValue: 1,
                            boxLabel: "จัดซื้อ",
                        },
                        {
                            inputValue: 2,
                            name: "i_purchase",
                            boxLabel: "จัดจ้าง",
                        },
                        {
                            name: "i_purchase",
                            inputValue: 3,
                            boxLabel: "จัดเช่า",
                        },
                    ], //radiogroup
                    listeners: {
                        change: function () {
                          Ext.getCmp('i_type_contractID').fn();
                        }
                    },
                },
                   {
                      xtype: "radiogroup",
                      columns: [115, 115,115,115],
                      fieldLabel: "ประเภทสัญญา",
                      hidden:true,
                      id: "i_type_contractID",
                      name: "i_type_contract",
                      items: [
                         {
                          checked: true,
                          name: "i_type_contract",
                          id: "i_type_contract0",
                          inputValue: 0,
                          
                          boxLabel: "ทั้งหมด",
                          },
                          {
                              
                              name: "i_type_contract",
                              id: "i_type_contract1",
                              inputValue: 1,
                              hidden: true,
                              boxLabel: "สัญญา",
                          },
                          {
                              inputValue: 2,
                              name: "i_type_contract",
                              id: "i_type_contract2",
                              hidden: true,
                              boxLabel: "ใบสั่ง",
                          },
                          {
                              name: "i_type_contract",
                              id: "i_type_contract3",
                              inputValue: 3,
                              hidden: true,
                              boxLabel: "จะซื้อจะขาย",
                       
                          },
                      ], 
                      listeners:{
                        beforerender:function(){
                          this.fn = function(){
                            if(Ext.getCmp('i_purchaseID').getValue().inputValue == 1){
                              Ext.getCmp('i_type_contract1').show();
                              Ext.getCmp('i_type_contract2').show();
                              Ext.getCmp('i_type_contract3').show();
                            } else  if(Ext.getCmp('i_purchaseID').getValue().inputValue == 2){
                              Ext.getCmp('i_type_contract1').show();
                              Ext.getCmp('i_type_contract2').show();
                              Ext.getCmp('i_type_contract3').hide();
                            } else  if(Ext.getCmp('i_purchaseID').getValue().inputValue == 3){
                              Ext.getCmp('i_type_contract1').show();
                              Ext.getCmp('i_type_contract2').hide();
                              Ext.getCmp('i_type_contract3').hide();
                            } else {
                              Ext.getCmp('i_type_contract1').show();
                              Ext.getCmp('i_type_contract2').show();
                              Ext.getCmp('i_type_contract3').show();
                            }
                          //  alert(Ext.getCmp('i_purchaseID').getValue().inputValue);
                          } 
                         }, 
                        afterrender:function(){  
                          Ext.getCmp('i_type_contractID').fn();
                         }
                      }  
                  },
                  {
                    // ── ส่วนงาน : ค้นหาได้ + เลือกได้หลายรายการ (แทนที่ radio "ข้อมูลซื้อจ้าง" เดิม) ──
                    // ข้อมูลมาจาก NMU_DATACENTER..dc_cost (ตรวจสอบแล้วว่ามีข้อมูลจริง)
                    // การเลือก: คลิกที่รายการในลิสต์เพื่อติ๊ก/ยกเลิกติ๊ก โดยลิสต์จะไม่ปิดจนกว่าจะคลิกออกนอกกล่อง
                    // ค่าที่เลือกจริงจะถูกเก็บเป็น id คั่นด้วยจุลภาคไว้ใน hidden field "dc_cost_acc_idID" (ดูด้านบน)
                    xtype: "combo",
                    id: "dc_cost_acc_idID",
                    fieldLabel: "ส่วนงาน",
                    store: Ext.dc_cost,
                    valueField: "dc_cost_acc_id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    width: 500,
                    listWidth: 460,
                    editable: true,
                    forceSelection: false,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "ค้นหาและเลือกส่วนงาน (เลือกได้หลายรายการ) — ค่าเริ่มต้น: ทั้งหมด",
                    minChars: 0,
                    selectedIds: [], // เก็บ dc_cost_acc_id ที่ถูกเลือกไว้ทั้งหมด
                    tpl:
                      '<tpl for=".">' +
                      '<div class="x-combo-list-item dc-cost-item" data-costid="{dc_cost_acc_id}">' +
                      '<input type="checkbox" class="dc-cost-chk" style="margin-right:6px;"/>{c_name}' +
                      '</div></tpl>',
                    listeners: {
                      beforequery: function (q) {
                        q.forceAll = true;
                        var input = Ext.fly(q.combo.el.dom);
                      },
                      select: function (combo, record) {
                        var id = record.get("dc_cost_acc_id");
                        var idx = combo.selectedIds.indexOf(id);
                        if (idx >= 0) {
                          combo.selectedIds.splice(idx, 1);
                        } else {
                          combo.selectedIds.push(id);
                        }
                        combo.updateDisplay();
                        combo.syncCheckboxes();
                        // เปิดลิสต์ค้างไว้เพื่อให้เลือกรายการถัดไปได้ต่อเนื่อง (multi-select)
                        Ext.defer(function () {
                          combo.doQuery(combo.getRawValue(), true);
                        }, 10);
                        return false;
                      },
                      afterrender: function (combo) {
                        combo.syncCheckboxes = function () {
                          var view = this.view;
                          if (!view || !view.all || !view.all.elements) return;
                          Ext.each(view.all.elements, function (el) {
                            var node = Ext.get(el);
                            var rec = view.getRecord(el);
                            if (!rec) return;
                            var chk = node.child("input.dc-cost-chk");
                            if (chk) {
                              chk.dom.checked = combo.selectedIds.indexOf(rec.get("dc_cost_acc_id")) >= 0;
                            }
                          });
                        };
                        combo.updateDisplay = function () {
                          if (this.selectedIds.length === 0) {
                            this.setRawValue("");
                            Ext.getCmp("dc_cost_acc_idHiddenID").setValue("");
                            Ext.getCmp("dis_dc_cost_acc_idID").setValue("ทั้งหมด");
                            return;
                          }
                          var names = [];
                          Ext.each(this.selectedIds, function (id) {
                            var rec = Ext.dc_cost.getById(id);
                            if (rec) names.push(rec.get("c_name"));
                          });
                          this.setRawValue(names.join(", "));
                          Ext.getCmp("dc_cost_acc_idHiddenID").setValue(this.selectedIds.join(","));
                          Ext.getCmp("dis_dc_cost_acc_idID").setValue(names.join(", "));
                        };
                      },
                      expand: function (combo) {
                        Ext.defer(function () {
                          if (combo.syncCheckboxes) combo.syncCheckboxes();
                        }, 10);
                      },
                    },
                  },
                  {
                    xtype: "radiogroup",
                    columns: [115,115,115],
                    // hidden: true,
                    fieldLabel: "เรียงตาม",
                    id: "i_type_RepID",
                    name: "i_type_Rep",
                    items: [
                      {
                            inputValue: 0,
                            name: "i_type_Rep",
                            boxLabel: "ทั้งหมด",
                        },
                        {
                            checked: true,
                            inputValue: 1,
                            name: "i_type_Rep",
                            boxLabel: "เลขที่PR",
                        },
                        {
                            
                            inputValue: 2,
                            name: "i_type_Rep",
                            boxLabel: "เลขสัญญา",
                        },
                    ], //radiogroup
                    listeners: {
                        change: function () {
                            //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                        },
                        afterrender: function () {
                            this.fn = function (i) {
                                // if (i == 3)
                                //     this.hide();
                                // else
                                //     this.show();
                            };
                        },
                    },
                }, {
                  xtype: "radiogroup",
                  columns: [115,115,115,115,115,300],
                  fieldLabel: "สถานะ",
                  id: "c_checking_codeID", //c_checking_codeID
                  hidden:true,
                  name: "c_checking_code", //c_checking_code
                  items: [
                    {
                      checked: true,
                      name: "c_checking_code",
                      inputValue: 0,
                      boxLabel: "ทั้งหมด",
                    },
                    {
                      name: "c_checking_code",
                      inputValue: 1,
                      boxLabel: "รอส่งมอบงาน",
                    },
                    {
                      name: "c_checking_code",
                      inputValue: 2,
                      boxLabel: "ส่งมอบงานเรียบร้อย",
                    },
                    {
                      inputValue: 3,
                      name: "c_checking_code",
                      boxLabel: "ตรวจรับเรียบร้อย",
                    },
                    {
                    inputValue:  4,
                    name: "c_checking_code",
                    boxLabel: "ส่งเบิกเรียบร้อย",
                    },
                    {
                    inputValue:  5,
                    name: "c_checking_code",
                    boxLabel: "รายงานทะเบียนคุมค้ำประกันสัญญา",
                    },
                  ], //radiogroup
                }
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