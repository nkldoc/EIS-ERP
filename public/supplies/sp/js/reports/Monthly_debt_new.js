 
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/Monthly_debt_new" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
// Ext.urlReport = false ? "https://eis.nmu.ac.th:8443/reports/repSpContractPeriodnotorNew" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานก่อหนี้ประจำเดือน";
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
    baseParams: { type: "sp_tor_contract", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code"],
    listeners: {
      load: function (t, records, options) {
        // Ext.getCmp("sp_tor_contract_idID").setValue("0");
        // alert("sp_tor_contract") ;
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
    baseParams: { type: "sp_emp", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        //Ext.getCmp("sp_emp_idID").setValue("0");
      },
    },
  });
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorExp.php",
    baseParams: { type: "dc_expense_budget_type", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
      // Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
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
            // Ext.getCmp("po_expense_idID").setValue("0");
        },
    },
});
// var pu_arr = [];
  // pu_arr[1]="จัดซื้อ";
  // pu_arr[2]="จัดจ้าง";
  // pu_arr[3]="จัดเช่า";
  // Ext.getCmp("dis_i_purchaseID").setValue(pu_arr[Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue];
  function getTitleReport(v) {
       Ext.getCmp('getReportTypeID').setValue(v);
      //  var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;

       //
      // Ext.getCmp("dis_dc_department_idID").setValue(getStoreItems(Ext.sp_department,Ext.getCmp("dc_department_idID").getValue() , "c_name"));
      // Ext.getCmp("dis_sp_tor_contract_idID").setValue(getStoreItems(Ext.sp_tor_contract,Ext.getCmp("sp_tor_contract_idID").getValue() , "c_code"));
      // Ext.getCmp("dis_i_purchaseID").setValue(Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue)].boxLabel) ;
      // Ext.getCmp("dis_type_contractID").setValue(Ext.getCmp("i_type_contractID").items.items[(Ext.getCmp("i_type_contractID").getValue().inputValue)].boxLabel) ;
      // Ext.getCmp("dis_i_product_typeID").setValue(Ext.getCmp("i_product_typeID").items.items[(Ext.getCmp("i_product_typeID").getValue().inputValue)].boxLabel) ;
      // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ;       
      // Ext.getCmp("dis_c_checking_codeID").setValue(Ext.getCmp("c_checking_codeID").items.items[(Ext.getCmp("c_checking_codeID").getValue().inputValue)].boxLabel) ; 

      Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
      // Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
      // Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
      // Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
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
                  { xtype: "hidden", name: "jasperName", value: "Monthly_debt" },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // { xtype: "hidden", id: "dis_dc_department_idID", name: "dis_dc_department_id", value: "ทั้งหมด" },
                  // {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                  // {xtype: "hidden", id: "sp_emp_idtID", name: "sp_emp_id", value: Ext.session.sp_emp_id},
                  // { xtype: "hidden", id: "dis_sp_tor_contract_idID", name: "dis_sp_tor_contract_id", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_type_contractID", name: "dis_i_type_contract", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_i_product_typeID", name: "dis_i_product_type", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_c_checking_codeID", name: "dis_c_checking_code", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                  // {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},
                  // {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                  // {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
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
                     id: "dc_expense_budget_type_idID",
                     hiddenName: "dc_expense_budget_type_id",
                     fieldLabel: "แหล่งเงิน",
                     store: Ext.dc_expense_budget_type,
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
                  // PermissionEmp(),
                   {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างวันที่ตั้งค้างจ่าย",
                    msgTarget: "under",
                    items: [
                    {
                        xtype: "datefield",
                        id: "d_date_startID",
                        width: 177,
                        value: new Date(new Date().getFullYear(), new Date().getMonth()-1, 1),
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
                        // value: addY(543),
                        value: new Date(new Date().getFullYear(), new Date().getMonth()-1,31),
                    },
                    ],
                },
                /*
                new Ext.form.ComboBox({
                  id: "i_yyyyID",
                  fieldLabel: "ปีงบประมาณ",
                  hiddenName: "i_yyyy",
                  store: Ext.store_year_all,
                  valueField: "id",
                  displayField: "c_name",
                  mode: "local",
                  triggerAction: "all",
                  width: 150,
                  forceSelection: true,
                  selectOnFocus: true,
                  value: "0",
                  }),
                 /* new Ext.form.ComboBox({
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
                  }), */

                   //       /
                  /*
                  {
                    xtype: "radiogroup",
                    columns: [115,115,115,115],
                    fieldLabel: "การดำเนินงาน",
                    id: "i_purchaseID",
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
                    xtype: "radiogroup",
                    columns: [115,115,115],
                    fieldLabel: "ประเภทการจัดหา",
                    id: "i_product_typeID",
                    name: "i_product_type",
                    hidden: true,
                    items: [
                        {
                            checked: true,
                            inputValue: 0,
                            name: "i_product_type",
                            id: "i_product_type0",
                            boxLabel: "ทั้งหมด",
                        },
                        {
                            
                            inputValue: 1,
                            name: "i_product_type",
                            id: "i_product_type1",
                            boxLabel: "วัสดุทั่วไป",
                        },
                        {
                          
                            inputValue: 2,
                            name: "i_product_type",
                            id: "i_product_type2",
                            boxLabel: "ครุภัณฑ์",
                        }, 
                        
                    ], //radiogroup
                    listeners: {
                        change: function () {
                            //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                        },
                        afterrender: function () {
                            this.fn = function (i) {
                                if (i == 3)
                                    this.hide();
                                else
                                    this.show();
                            };
                            this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                        },
                    },
                }, {
                  xtype: "radiogroup",
                  columns: [115,115,115,115,115,300],
                  fieldLabel: "สถานะ",
                  id: "c_checking_codeID", //c_checking_codeID
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
                }*/
                // ,
                //   {
                //     xtype: "compositefield",
                //     fieldLabel: "ระหว่างวันที่",
                //     msgTarget: "under",
                //     items: [
                //       {
                //         xtype: "datefield",
                //         id: "d_date_startID",
                //         width: 177,
                //         value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                //       },
                //       {
                //         xtype: "displayfield",
                //         value: "ถึงวันที่",
                //         width: 36,
                //         align: "center",
                //       },
                //       {
                //         xtype: "datefield",
                //         id: "d_date_endID",
                //         width: 177,
                //         value: addY(543),
                //       },
                //     ],
                //   },
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



