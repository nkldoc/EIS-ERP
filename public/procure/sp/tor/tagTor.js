 /* global Ext, user_right_add, user_right_edit, user_right_delete */
 Ext.AppUx = function (app, menu)
 {

     Ext.HDR_ID = null;
     Ext.selectRow = [];
     Ext.menuEditGrid = true;
     Ext.menuRightEditgrid = true;
     Ext.costID = 38; //หน่วยงานผู้รับผิดชอบ พัสดุ
     Ext.menuCode = 'ST0001';
     Ext.dcCostFix = false; //38
     Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
     Ext.i_is_more = 0;
     Ext.tor_type_idTxt = Ext.apply({
         "tor_type_id1": {0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)"}
     });
     Ext.status = Ext.apply({
         name: menu,
         process: function (menuCode, record) {

             Ext.Ajax.request({
                 url: "tor/api/mnTorController.php",
                 params: {
                     mode: "UPSTATUS",
                     menuCode: menuCode,
                     tor_status_id: record.get("tor_status_id"),
                     id: record.get("id")
                 },
                 method: "POST", //GET
                 success: function (result, request) {
                     var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                     if (jsonData.success) {

                         Ext.MessageBox.alert("Success", jsonData.msg, function () {
                             Ext.getCmp("tabpanel1").getStore().reload();
                         });
                     } else {
                         Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                     }

                 },
                 failure: function (result, request) {
                     Ext.MessageBox.alert("Failed", result.responseText); // connect error
                 }
             });
         }
     });
     Ext.buAct = null;
     Ext.yearTh = function () {
         let years = [];
         let currentTime = new Date();
         let now = currentTime.getFullYear() + 1;
         let id = currentTime.getFullYear() - 3;
         while (id <= now)
         {
             let c_name = id + 543;
             years.push({
                 id, c_name
             });
             id++;
         }

         Ext.bgYear = now - 1;
         return years;
     };
     function cellClick(grid, rowIndex, columnIndex, e)
     {

         var record = grid.getStore().getAt(rowIndex);
         Ext.selectRow = record;
         if (columnIndex === grid.getColumnModel().getIndexById('processDueID')) { //ttf
             controller(Ext.selectRow, 'processUpdate'); //on
         }
     }
     function controller(rec, status) {

         /*
          25	5	ST0001	ลงทะเบียนรับ
          26	5	ST0002	การมอบหมายผู้ปฏิบัติ
          24	5	ST0003	ตรวจสอบเอกสาร
          13	5	ST0004	รับเรื่องจากธุรการ
          14	5	ST0005	เสนอราคา
          1	5	ST0006	ผลพิจารณา
          11	5	ST0007	ประกาศผลผู้ชนะ
          20	5	ST0008	ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ
          21	5	ST0009	บันทึกใบ PO
          2	5	ST0010	ส่งมอบงาน
          3	5	ST0011	ตรวจรับพัสดุ
          4	5	ST0012	ตรวจการรับประกัน
          5	5	ST0013	รับพัสดุ
          6	5	ST0014	อนุมัติใบตรวจรับ
          27	5	ST0015	บันทีกค่าปรับ
          7	5	ST0016	บันทึกใบขอเบิก
          8	5	ST0017	แจ้งเตือนคืนเงินประกันสัญญา
          9	5	ST0018	ทำเอกสารแจ้งคืนหลักประกันสัญญา
          10	5	ST0019	ปิดสัญญา
          */

         if (status == "processUpdate") {

             Ext.Msg.minWidth = 200;
             Ext.Msg.buttonText = {
                 ok: "ตกลง",
                 cancel: "ยกเลิก",
                 yes: "ผ่านรายการ",
                 no: "ไม่"
             }; //Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
             if (Ext.isEmpty(rec.get('c_code')) || (rec.get('tor_status_id') != null)) {
                 Ext.Msg.alert("แจ้งเตือน", ""
                         + (Ext.isEmpty(rec.get('c_code')) ? "รหัส TOR ยังไม่ถูกสร้าง" : "")
                         + ((rec.get('tor_status_id') > 0) ? "ผ่านรายการเรียบร้อยแล้ว สถานะเมนู <b>" + rec.get('c_name_status') + " - " + rec.get('c_code_status') + "</b>"
                                 : ""),
                         function (bu, action) {
                             return false;
                         });
             } else {

                 Ext.Msg.show({
                     title: 'ประมวลผล TOR',
                     msg: 'คุณต้องการผ่านรายการ ' + rec.get('c_code') + ' สถานะเมนู ' + Ext.menuCode + ' ?',
                     width: 440,
                     icon: Ext.MessageBox.QUESTION,
                     buttons: Ext.MessageBox.YESNO,
                     fn: function (btn) {
                         if (btn === 'yes')
                             Ext.status.process(Ext.menuCode, rec);
                         else
                             null;
                     }
                 });
             }

         }


     }// Controller 
//AutoLoad
  
 
     Ext.storeDtl = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: false,
                 url: "tor/api/mnTorController.php",
                 baseParams: {
                     type: "po_working_dtl",
                     mode: "LIST"
                             //keyData: Ext.keyData
                 },
                 root: "data",
                 idProperty: "id",
                 totalProperty: "totalCount",
                 fields: [{
                         name: "no"
                     }, {
                         name: "id"
                     }, {
                         name: "i_step"     
                     }, {
                         name: "c_emp_name"
                     }, {
                         name: "tag"
                     }, {
                         name: "txtsub_cost"
                     }, {
                         name: "i_forword"
                     }, {
                         name: "i_backword"
                     }, {
                         name: "c_codeStatus"
                     }, {
                         name: "c_code"
                     }, {
                         name: "bg_budget_dtl_project_id"
                     }, {
                         name: "c_budget_dtl_project"
                     }, {
                         name: "c_name"
                     }, {
                         name: "c_code_status"
                     }, {
                         name: "c_name_status" //  
                     }, {
                         name: "c_tor_type"
                     }, {
                         name: "tor_status_id"
                     }, {
                         name: "tor_type_id"
                     }, {
                         name: "c_purchase"
                     }, {
                         name: "i_purchase"
                     }, {
                         name: "d_tor_date" //
                     }, {
                         name: "i_parent" //d_tor_date
                     }, {
                         name: "i_is_more"
                     }, {
                         name: "i_is_rename"
                     }, {
                         name: "i_is_parent"
                     }, {
                         name: "f_total_amt"
                     }, {
                         name: "dc_cost_id"
                     }, {
                         name: "tag"
                     }, {
                         name: "dc_cost_idTxt"
                     }, {
                         name: "i_yyyy"
                     }, {
                         name: "c_year"
                     }, {
                         name: "dc_department_id"
                     }, {
                         name: "c_department"
                     }, {
                         name: "d_doc_ref"
                     }, {
                         name: "dc_expense_budget_type_id"
                     }, {
                         name: "po_expense_id"
                     }, {
                         name: "dc_user_create_id"
                     }, {
                         name: "dc_user_create_cost_id"
                     }, {
                         name: "d_create"
                     }, {
                         name: "dc_user_update_id"
                     }, {
                         name: "dc_user_update_cost_id"
                     }, {
                         name: "d_update"
                     }, {
                         name: "i_enabled"
                     }, {
                         name: "c_comment"
                     }, {
                         name: "c_remake"
                     }, {
                         name: "po_creditor_id"
                     }, {
                         name: "po_creditor_idTxt"
                     }, {
                         name: "start_date"
                     }, {
                         name: "end_date"
                     }
                 ],
             });
     Ext.store_year = new Ext.data.JsonStore(
             {
                 fields: ["id", "c_name"],
                 autoDestroy: false,
                 autoLoad: false,
                 data: Ext.yearTh(),
             });
     Ext.keyData = 1; //type data key in
     Ext.title = "รายการสถานะ TOR ";
     Ext.poFormID = "grid-form-cheque";
     Ext.getDate = Ext.apply(
             {
                 year: new Date().getFullYear(),
                 month: new Date().getMonth() + 1,
                 day: new Date().getDay(),
                 getNowCarlen: function ()
                 {
                     var day = new Date();
                     var dd = day.getDate();
                     var mm = day.getMonth() + 1;
                     var yy = day.getFullYear() + 543;
                     mm = mm < 10 ? "0" + mm : mm;
                     dd = dd < 10 ? "0" + dd : dd;
                     return dd + "-" + mm + "-" + yy;
                 },
                 defaultDate: function (typeStartDate)
                 {
                     var day = new Date();
                     var dd = day.getDate();
                     var mm = day.getMonth() + 1;
                     var yy = day.getFullYear() + 543;
                     if (typeStartDate === 1)
                     {
                         // วันที่เริ่ม -1 เดือน
                         dd = "01";
                         mm = "0" + mm.toString();
                     } else
                     {
                         dd = "0" + dd.toString();
                         mm = "0" + mm.toString();
                     }
                     return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
                 },
             });
     //interlizing
 
     var AppPoStore = function (statuss)
     {

         var comboCost = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     store: Ext.dc_cost,
                     anchor: "50%",
                     readOnly: Ext.dcCostFix,
                     value: Ext.costID,
                     fieldLabel: "หน่วยงานที่รับผิดชอบ",
                     valueField: "id",
                     displayField: "c_name",
                     hiddenName: "dc_cost_id",
                     name: "c_cost_name",
                     triggerAction: "all",
                     forceSelection: true,
                     selectOnFocus: true,
                     typeAhead: false,
                     emptyText: "กรุณาเลือก...",
                     validator: function (val)
                     {
                         if (!Ext.isEmpty(val))
                         {
                             return true;
                         } else
                         {
                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                         }
                     },
                     listeners: {
                         afterrender: function ()
                         {
                             this.fn = function ()
                             {};
                         },
                         Change: function ()
                         {
                             this.fn();
                         },
                         beforequery: function (q)
                         {
                             if (q.query)
                             {
                                 var length = q.query.length;
                                 q.query = new RegExp(Ext.escapeRe(q.query));
                                 q.query.length = length;
                             }
                         },
                         blur: function ()
                         {
                             this.getStore().clearFilter();
                         },
                     },
                 });
         var comboTypeBg = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     store: Ext.dc_expense_budget_type,
                     fieldLabel: "แหล่งเงิน",
                     anchor: "60%",
                     submitValue: true,
                     name: "dc_expense_budget_type_idTxt",
                     hiddenName: "dc_expense_budget_type_id",
                     //po_expense_group_id
                     valueField: "id",
                     displayField: "c_name",
                     triggerAction: "all",
                     forceSelection: true,
                     selectOnFocus: true,
                     typeAhead: false,
                     emptyText: "กรุณาเลือกแหล่งเงิน...",
                     validator: function (val)
                     {
                         if (!Ext.isEmpty(val))
                         {
                             return true;
                         } else
                         {
                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                         }
                     },
                     listeners: {
                         afterrender: function ()
                         {
                             this.fn = function ()
                             {};
                         },
                         Change: function ()
                         {
                             this.fn();
                         },
                         beforequery: function (q)
                         {
                             if (q.query)
                             {
                                 var length = q.query.length;
                                 q.query = new RegExp(Ext.escapeRe(q.query));
                                 q.query.length = length;
                             }
                         },
                         blur: function ()
                         {
                             this.getStore().clearFilter();
                         },
                     },
                 });
         var comboUsedBgYear = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     fieldLabel: "ใช้เงินปีงบประมาณ",
                     submitValue: true,
                     hiddenName: "i_yyyy",
                     name: "i_year",
                     store: Ext.store_year,
                     valueField: "id",
                     displayField: "c_name",
                     value: Ext.bgYear,
                     triggerAction: "all",
                     forceSelection: true,
                     selectOnFocus: true,
                     typeAhead: false,
                     emptyText: "กรุณาเลือกปีงบประมาณ...",
                     listeners: {
                         afterrender: function ()
                         {
                             this.fn = function ()
                             {};
                         },
                         Change: function ()
                         {
                             this.fn();
                         },
                         beforequery: function (q)
                         {
                             if (q.query)
                             {
                                 var length = q.query.length;
                                 q.query = new RegExp(Ext.escapeRe(q.query));
                                 q.query.length = length;
                             }
                         },
                         blur: function ()
                         {
                             this.getStore().clearFilter();
                         }
                     }
                 });
         var comboExpense = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     store: Ext.po_expense,
                     valueField: "id",
                     displayField: "c_name",
                     anchor: "70%",
                     submitValue: true,
                     name: "c_detail",
                     hiddenName: "po_expense_id",
                     triggerAction: "all",
                     allBlank: true,
                     forceSelection: true,
                     selectOnFocus: true,
                     fieldLabel: "รายการย่อย",
                     width: 200,
                     typeAhead: false,
                     emptyText: "กรุณาเลือกใช้จ่าย...",
                     validator: function (val)
                     {
                         if (!Ext.isEmpty(val))
                         {
                             return true;
                         } else
                         {
                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                         }
                     },
                     listeners: {
                         afterrender: function ()
                         {
                             this.fn = function ()
                             {};
                         },
                         Change: function ()
                         {
                             this.fn();
                         },
                         beforequery: function (q)
                         {
                             if (q.query)
                             {
                                 var length = q.query.length;
                                 q.query = new RegExp(Ext.escapeRe(q.query));
                                 q.query.length = length;
                             }
                         },
                         blur: function ()
                         {
                             this.getStore().clearFilter();
                             console.log(this);
                         },
                     },
                 });
         var columnMini = [
             {
                 header: "ID System",
                 sortable: true,
                 hidden: true,
                 dataIndex: "id",
             }, {
                 header: "เลขที่ใบเบิก",
                 sortable: true,
                 dataIndex: "c_code",
             }, {
                 header: "รายการ­",
                 sortable: true,
                 id: "c_name",
                 dataIndex: "c_name",
                 renderer: function (value, metaData, record, rowIndex, colIndex, store)
                 {
                     metaData.attr = "style='cursor:pointer';";
                     return value;
                 },
             }];

         var statusx = statuss;

         if (statusx == "add") {
             Ext.getCmp('tabpanel1').getSelectionModel().clearSelections();
         }
         // var typeTor = ;
         var bgProject = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     store: Ext.bgProject,
                     id: 'projectID',
                     anchor: "70%",
                     fieldLabel: "ชื่อโครงการ",
                     submitValue: true,
                     hiddenName: "bg_budget_dtl_project_id",
                     name: "c_budget_dtl_project_id",
                     valueField: "id",
                     displayField: "c_name",
                     triggerAction: "all",
                     forceSelection: false,
                     selectOnFocus: true,
                     typeAhead: false,
                     emptyText: "กรุณาเลือก",
                     validator: function (val)
                     {
                         if (!Ext.isEmpty(val))
                         {
                             return true;
                         } else
                         {
                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                         }
                     },
                     listeners: {
                         afterrender: function ()
                         {
                             this.fn = function ()
                             {};
                         },
                         Change: function ()
                         {
                             this.fn();
                         },
                         beforequery: function (q)
                         {
                             if (q.query)
                             {
                                 var length = q.query.length;
                                 q.query = new RegExp(Ext.escapeRe(q.query));
                                 q.query.length = length;
                             }
                         },
                         blur: function ()
                         {
                             this.getStore().clearFilter();
                         }
                     }
                 });
         Ext.store2 = new Ext.data.JsonStore({
             storeId: 'myStore2',
             autoLoad: false,
             url: 'api/ListDcBgTypePeriod2.php',
             root: 'data',
             baseParams: {i_read: user_right_read, i_confirm: true, }, //Permission i_read
             idProperty: 'id',
             totalProperty: 'totalCount',
             fields: [
                 {name: 'no'},
                 {name: 'id'},
                 {name: 'c_code', type: 'string'},
                 {name: 'c_name', type: 'string'},
                 {name: 'f_quan'},
                 {name: 'i_is_dtl'},
                 {name: 'buStatus'},
                 {name: 'c_doc_no_ap'},
                 {name: 'd_doc_date_ap'},
                 {name: 'f_unit_cost'},
                 {name: 'f_unit_cost_vat'},
                 {name: 'i_is_success_bargain'},
                 {name: 'i_is_audit'},
                 {name: 'i_is_delivery'},
                 {name: 'i_is_fine'},
                 {name: 'i_seq'},
                 {name: 'i_seq_status'},
                 {name: 'f_net_cost'},
                 {name: 'i_is_advance'},
                 {name: 'i_is_stock'},
                 {name: 'is_stock'},
                 {name: 'is_stock'},
                 {name: 'i_is_product'},
                 {name: 'i_status_advance'},
                 {name: 'i_status_product'},
                 {name: 'i_is_unit_type_product'},
                 {name: 'i_is_unit_type_advance'},
                 {name: 'f_sum_begin'},
                 {name: 'f_cost'},
                 {name: 'f_cost_total'},
                 {name: 'd_period_date', },
                 {name: 'c_amt_advance'},
                 {name: 'c_amt_product'},
                 {name: 'f_amt_advance'},
                 {name: 'f_amt_product'},
                 {name: 'c_comment_product', type: 'string'},
                 {name: 'c_comment_advance', type: 'string'},
                 {name: 'i_enable', type: 'int'},
                 {name: 'dc_user_create_id'},
                 {name: 'dc_user_create_cost_id'},
                 {name: 'd_create'},
                 {name: 'dc_user_update_id'},
                 {name: 'dc_user_update_cost_id'},
                 {name: 'd_update'},
             ]
         });
         var col1 = [new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: 'no'}),
             {header: "ID System", hidden: true, dataIndex: 'id'},
             {header: "งวดที่", align: 'center', dataIndex: 'i_seq', width: 10, },
             {header: "วันที่ส่งมอบ", align: 'center', dataIndex: 'd_period_date', width: 25,
                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                     if (value == "รวม") {
                         metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                         return Ext.floatRenderer(value);
                     } else {
                         metaData.attr = "";
                         if (record.get('i_is_dtl')) {
                             return '';
                         } else {
                             return DategetShortDateMonthName(value);
                         }

                     }
                 }
             },
             {header: "รายละเอียด จัดซื้อ", dataIndex: 'c_name', width: 35,
                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                     if (value.substring(0, 3) == "รวม") {
                         metaData.attr = "style='font-weight:bold;color:blue'; align='right'";

                     } else {
                         metaData.attr = "";
                     }
                     return value; //DategetShortDateMonthName(value);

                 }
             },
             {header: "จำนวน", dataIndex: 'f_quan', width: 20, align: 'right'},
             {header: "ก่อน VAT", dataIndex: 'f_unit_cost', align: 'right', width: 25, },
             {header: "รวม VAT", dataIndex: 'f_unit_cost_vat', align: 'right', width: 25, },
             {
                 header: "บันทึกรายละเอียดในงวดงาน",
                 sortable: false,
                 hideable: false, draggable: false,
                 align: 'center',
                 id: 'edit21',
                 width: 25,
                 dataIndex: 'id',
                 renderer: function (value, metaData, record, row, col, store, gridView) {
                     if (record.get('id') == "grandtotal" || record.get('i_is_dtl')) {
                         return '';
                     } else {
                         if (record.get('buStatus') == true) {
                             return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                         } else {
                             return record.get('buStatus');
                         }
                     }
                 }
             }
         ];

         var disp = false ? 'displayfield' : 'textfield';

         if (!Ext.isEmpty(Ext.getCmp('winChequeID'))) {
             Ext.getCmp('winChequeID').destroy();
         }
         return new Ext.Window(
                 {
                     collapsible: true,
                     maximizable: true,
                     title: "บันทึก TOR",
                     width: 1000,
                     id: "winChequeID",
                     height: 500,
                     minWidth: 850,
                     minHeight: 450,
                     layout: "fit",
                     modal: true,
                     plain: true,
                     bodyStyle: "padding:1px;",
                     buttonAlign: "center",
                     items: [new Ext.FormPanel({
                             id: Ext.poFormID,
                             columnWidth: 1,
                             url: "tor/api/mnTorController.php",
                             frame: true,
                             autoScroll: true,
                             labelAlign: "left",
                             bodyStyle: "padding:1px",
                             labelWidth: 120,
                             items: [{

                                     layout: 'column',
                                     border: false,
                                     items: [{
                                             columnWidth: .9,
                                             layout: 'form',
                                             border: true,
                                             items: [{
                                                     xtype: "hidden",
                                                     name: 'id',
                                                     id: "torHdrID" //i_is_more

                                                 }, {
                                                     xtype: disp,
                                                     fieldLabel: 'รหัส TOR',
                                                     id: 'codeHdrID',
                                                     style: "text-align: center;font-weight:bold;background:#eee;",
                                                     readOnly: true,
                                                     name: 'c_code'
                                                 }, {
                                                     xtype: disp,
                                                     fieldLabel: 'เรื่อง TOR',
                                                     name: 'c_name'

                                                 }, comboUsedBgYear, {
                                                     xtype: "buttongroup",
                                                     fieldLabel: "ชื่อโครงการ",
                                                     frame: false,
                                                     border: false,
                                                     items: [
                                                         bgProject, {
                                                             id: 'projectRenameID',
                                                             xtype: disp,
                                                             width: 190,
                                                             fieldLabel: 'ชื่อโครงการ',
                                                             listeners: {afterreder: function () {
                                                                     this.hidden();
                                                                 }}

                                                         }
                                                         , {
                                                             xtype: "checkbox",
                                                             id: "i_is_renameID",
                                                             name: "i_is_rename",
                                                             boxLabel: "เปลี่ยนชื่อโครงการ",

                                                             listeners: {
                                                                 check: function () {
                                                                     this.fn();
                                                                 },
                                                                 beforerender: function () {
//
                                                                     this.fn = function () {
                                                                         if (this.checked === true)
                                                                         {
                                                                             Ext.getCmp('projectRenameID').show();
                                                                             Ext.getCmp('projectID').hide();
                                                                         } else {

                                                                             Ext.getCmp('projectID').show();
                                                                             Ext.getCmp('projectRenameID').hide();
                                                                         }
                                                                     };
                                                                 },
                                                                 afterrender: function ()
                                                                 {
                                                                     this.fn();
                                                                 }

                                                             },

                                                             width: 180,
                                                             inputValue: 1,
                                                             style: {
                                                                 margin: "0px 0px 0px 3px"
                                                             }
                                                         }]
                                                 }, comboTypeBg
                                                         , comboExpense, comboCost
                                                         , {fieldLabel: "หน่วยงานย่อย", emptyText: "*ถ้ามี", xtype: 'textfield', name: 'txtsub_cost', id: 'txtsub_costID'}
                                                 , {fieldLabel: "tag search", xtype: 'textfield', name: 'tag', id: 'txttagID'}
                                                 , {

                                                             xtype: "buttongroup",
                                                             fieldLabel: "วันที่",
                                                             frame: false,
                                                             border: false,
                                                             items: [
                                                                 {
                                                                     xtype: "datefield",
                                                                     name: "d_tor_date",
                                                                     validator: function (val)
                                                                     {
                                                                         if (!Ext.isEmpty(val))
                                                                         {
                                                                             return true;
                                                                         } else
                                                                         {
                                                                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                         }
                                                                     }
                                                                 }, {
                                                                     xtype: "tbspacer",
                                                                     width: 18,
                                                                 }, {
                                                                     xtype: "label",
                                                                     style: {
                                                                         color: "red", width: '100px'
                                                                     },
                                                                     text: "* วันที่ตามเอกสาร TOR",
                                                                 }]
                                                         }, new Ext.form.ComboBox(
                                                         {
                                                             mode: "local",
                                                             store: Ext.torType,
                                                             anchor: "40%",
                                                             fieldLabel: "วิธีดำเนินงาน",
                                                             submitValue: true,
                                                             hiddenName: "tor_type_id",
                                                             name: "c_type_id",
                                                             id: "tor_type_idID",
                                                             valueField: "id",
                                                             displayField: "c_name",
                                                             triggerAction: "all",
                                                             forceSelection: false,
                                                             selectOnFocus: true,
                                                             typeAhead: false,
                                                             emptyText: "กรุณาเลือก",
                                                             validator: function (val)
                                                             {
                                                                 if (!Ext.isEmpty(val))
                                                                 {
                                                                     return true;
                                                                 } else
                                                                 {
                                                                     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                 }
                                                             },
                                                             listeners: {
                                                                 afterrender: function ()
                                                                 {
                                                                     this.fn = function ()
                                                                     {
                                                                         if (this.getValue() == 1) { //tor_type_id === 1 (เจาะจง)
                                                                             Ext.getCmp('lableLessID').show();
                                                                         } else {
                                                                             Ext.getCmp('lableLessID').hide();
                                                                         }
                                                                     };

                                                                 },
                                                                 Change: function ()
                                                                 {
                                                                     this.fn();
                                                                 },
                                                                 beforequery: function (q)
                                                                 {
                                                                     if (q.query)
                                                                     {
                                                                         var length = q.query.length;
                                                                         q.query = new RegExp(Ext.escapeRe(q.query));
                                                                         q.query.length = length;
                                                                     }
                                                                 },
                                                                 blur: function ()
                                                                 {
                                                                     this.getStore().clearFilter();

                                                                 }
                                                             }
                                                         }), {
                                                     xtype: 'displayfield',
                                                     fieldLabel: 'แบบ ',
                                                     name: 'lableLess',
                                                     value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                                                     id: 'lableLessID',
                                                     listeners: {
                                                         beforerender: function () {
                                                         },
                                                         afterrender: function () {
                                                             this.fn = function () {
                                                                 if (Ext.getCmp('tor_type_idID').getValue() != 1) {
                                                                     this.hide();
                                                                 } else {
                                                                     this.show();
                                                                 }
                                                             };
                                                             this.fn();

                                                         }

                                                     }
                                                 }, {

                                                     xtype: "buttongroup",
                                                     fieldLabel: "จำนวนเงิน",
                                                     frame: false,
                                                     border: false,
                                                     items: [{
                                                             xtype: "textfield",
                                                             fieldLabel: "จำนวนเงิน",
                                                             name: "f_total_amt",
                                                             id: "f_totalID",
                                                             listeners: {
                                                                 blur: function ()
                                                                 {
                                                                     this.fn();
                                                                 },
                                                                 afterrender: function () {
                                                                     this.fn = function () {
                                                                         var val = 0;
                                                                         val = this.getValue();

                                                                         var f_total = parseFloat((val).replace(/,/g, "") / 1);

                                                                         if (f_total > 500000)
                                                                         {
                                                                             Ext.i_is_more = 1;
                                                                         } else {
                                                                             Ext.i_is_more = 0;
                                                                         }

                                                                         Ext.getCmp('islessID').setValue(Ext.i_is_more);
                                                                         if (Ext.getCmp('tor_type_idID').getValue() == 1) {
                                                                             Ext.getCmp('lableLessID').setValue(Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more]);
                                                                         }
                                                                         this.setValue(Ext.floatRenderer(f_total));

                                                                     };
                                                                     this.fn();
                                                                 }
                                                             },
                                                             style: {
                                                                 labelAlign: "right",
                                                                 "font-weight": "bold",
                                                                 padding: "1px",
                                                                 margin: "1px",
                                                                 color: "blue",
                                                                 "background-color": "#fff",
                                                                 "text-align": "right",
                                                             }
                                                         }, {

                                                             xtype: 'button',
                                                             fieldLabel: '-',
                                                             text: 'ตรวจสอบเงินงวด',
                                                             handler: function () {
                                                                 alert('เหลือเงินในงวด 10,000,000.00 บาท');
                                                             }
                                                         }]
                                                 }, {
                                                     xtype: "hidden", //textfield hidden
                                                     name: 'i_is_more',
                                                     id: "islessID" //i_is_more
                                                 }, {

                                                     xtype: "radiogroup",
                                                     columns: [98, 98, 98],
                                                     fieldLabel: "ขอดำเนินการ",
                                                     id: "i_purchaseID",
                                                     name: "i_purchase",
                                                     items: [
                                                         {

                                                             checked: true,
                                                             name: "i_purchase",
                                                             inputValue: 1,
                                                             boxLabel: "จัดซื้อ"
                                                         }, {

                                                             inputValue: 2,
                                                             name: "i_purchase",
                                                             boxLabel: "จัดจ้าง"
                                                         }, {
                                                             name: "i_purchase",
                                                             inputValue: 3,
                                                             boxLabel: "จัดเช่า"
                                                         }] //radiogroup
                                                 }, {
                                                     xtype: disp,
                                                     fieldLabel: 'รหัสเอกสารอ้างอิง',
                                                     name: 'd_doc_ref'
                                                 }, {
                                                     xtype: "radiogroup",
                                                     columns: [90, 110],
                                                     fieldLabel: "สถานะการใช้งาน",
                                                     name: "i_enabled",
                                                     id: "i_enabledID",
                                                     items: [
                                                         {
                                                             name: "i_enabled",
                                                             checked: true,
                                                             inputValue: 1,
                                                             boxLabel: "ใช้งาน"
                                                         }, {
                                                             name: "i_enabled",
                                                             inputValue: 2,
                                                             boxLabel: "ไม่ใช้งาน"
                                                         }] //radiogroup
                                                 }, {
                                                     xtype: "radiogroup",
                                                     columns: [180],
                                                     fieldLabel: "โหมดการบันทึก",
                                                     id: "modesubID",
                                                     style: {
                                                         "font-weight": "bold"
                                                     },
                                                     items: statusx === "add" ? [
                                                         {
                                                             name: "mode",
                                                             inputValue: "ADD",
                                                             checked: true,
                                                             boxLabel: "เพิ่มรายการใหม่",
                                                             id: "modesubaddID"
                                                         }] : [
                                                         {
                                                             name: "mode",
                                                             checked: true,
                                                             inputValue: "UPDATE",
                                                             boxLabel: "อัพเดทรายการ"
                                                         }, {
                                                             name: "mode",
                                                             inputValue: "ADD",
                                                             boxLabel: "เพิ่มรายการใหม่",
                                                             id: "modesubaddID"
                                                         }, {
                                                             name: "mode",
                                                             inputValue: "GENCODE",
                                                             boxLabel: "ออกเลข TOR",
                                                             id: "modesubgencodeID",
                                                             afterreder: function () {
                                                                 this.hide();
                                                             }
                                                         }, {
                                                             name: "mode",
                                                             inputValue: "DELETE",
                                                             id: "modesubdelID",
                                                             boxLabel: "ลบรายการ"
                                                         }]

                                                 }]
                                         }, {
                                             columnWidth: .1,
                                             layout: 'table',
                                             items: new Ext.Panel({
                                                 border: true,
                                                 html: '<div id="header" align="right">'
                                                         + '<div id="qrcodeID" '
                                                         + 'style="text-align:center;margin:0px 0px 0px 0px;background:#ccc; width:90px;height:80px;">'
                                                         + '<!-- QRCODE -->'
                                                         + '</div>'
                                             })
                                         }]
                                 }, {
                                     title: 'ข้อมูลงวดงาน ',
                                     id: 'tabpanelMainID3',
                                     layout: 'form',
                                     items: [{
                                             xtype: 'grid',
                                             id: 'gridSub2ID',
                                             border: true,
                                             stripeRows: true,
                                             loadMask: true,
                                             height: 245,
                                             store: Ext.store2,
                                             columns: col1,
                                             viewConfig: {forceFit: true}
                                         }]
                                 }],
                             buttonAlign: "left",
                             buttons: [{
                                     text: "บันทึกรายการ TOR",
                                     id: "buSaveSubID",
                                     iconCls: "icon-save",
                                     listeners: {
                                         afterrender: function ()
                                         {}
                                     },
                                     handler: function ()
                                     {
                                         var formSubmit = function ()
                                         {
                                             form.submit({
                                                 waitMsg: "Saving Data...",
                                                 success: function (form, action)
                                                 {
                                                     Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                                     {
                                                         Ext.getCmp("tabpanel1").getStore().reload();
                                                         Ext.selectRow = null;
                                                         Ext.getCmp("winChequeID").destroy();
                                                     });
                                                 },
                                                 failure: function (form, action)
                                                 {
                                                     switch (action.failureType)
                                                     {
                                                         case Ext.form.Action.CLIENT_INVALID:
                                                             Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                             break;
                                                         case Ext.form.Action.CONNECT_FAILURE:
                                                             Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                             break;
                                                         case Ext.form.Action.SERVER_INVALID:
                                                             Ext.Msg.alert("Failure", action.result.msg);
                                                     }
                                                 }
                                             });
                                         };//END


                                         var form = Ext.getCmp(Ext.poFormID).getForm();
                                         if (form.isValid())
                                         {
                                             if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW")
                                             {
                                             } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE")
                                             {
                                                 Ext.MessageBox.show(
                                                         {
                                                             title: "Icon Support",
                                                             msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                             buttons: Ext.MessageBox.OKCANCEL,
                                                             icon: Ext.MessageBox.WARNING,
                                                             fn: function (btn)
                                                             {
                                                                 if (btn === "ok")
                                                                 {
                                                                     formSubmit(form);
                                                                 } else
                                                                 {
                                                                     return;
                                                                 }
                                                             }
                                                         });
                                             } else
                                             {
                                                 formSubmit(form);
                                             }
                                         }
                                     }
                                     //haddler
                                 }, {
                                     text: Ext.GLOBAL_BU_BACK_TH,
                                     handler: function ()
                                     {
                                         Ext.getCmp("winChequeID").hide();
                                         Ext.getCmp("winChequeID").destroy();
                                     }
                                 }]
                         })]

                 });
     };
     var tab2 = new Ext.FormPanel({
         //labelAlign: 'top',
         title: 'รายละเอียด TOR',
         bodyStyle: 'padding:5px',
         layout: 'fit',
         width: 600,
         items: [{
                 height: 100,
                 layout: 'column',
                 border: false,
                 items: [{
                         columnWidth: .4,
                         layout: 'form',
                         border: true,
                         items: [{
                                 xtype: 'displayfield',
                                 fieldLabel: 'รหัส TOR',
                                 name: 'c_code',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'เรื่อง TOR',
                                 name: 'c_name',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'โครงการ TOR',
                                 name: 'c_budget_dtl_project',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'เงินงบประมาณ',
                                 name: 'f_total_amt',
                                 anchor: '50%'

                             }]
                     }, {
                         columnWidth: .6,
                         layout: 'form',
                         border: true,
                         items: [{//c_name_status
                                 xtype: 'displayfield',
                                 fieldLabel: 'วิธีดำเนินงาน',
                                 name: 'c_name_status',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'วิธีดำเนินงาน',
                                 name: 'c_tor_type',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'เอกสารอ้างอิง',
                                 name: 'd_doc_ref',
                                 //  vtype: 'email',
                                 anchor: '50%'
                             }, {
                                 xtype: 'displayfield',
                                 fieldLabel: 'วันที่จัดทำ TOR',
                                 name: 'd_tor_date',
                                 //  vtype: 'email',
                                 anchor: '50%'
                             }]
                     }],
                 buttonAlign: "left",
//                 buttons: [{
//                         text: 'Save'
//                     }, {
//                         text: 'Cancel'
//                     }]
             }, {
                 xtype: 'tabpanel',
                 plain: true,
                 activeTab: 0,
                 height: 235,
                 deferredRender: false,
                 defaults: {bodyStyle: 'padding:10px'},
                 items: [{
                         title: 'รายละเอียดจัดซื้อจัดจ้าง',
                         layout: 'form',
                         defaults: {width: 230},
                         defaultType: 'textfield',

                         items: [{
                                 fieldLabel: 'First Name',
                                 name: 'first',
                                 allowBlank: false,
                                 value: 'Jack'
                             }, {
                                 fieldLabel: 'Last Name',
                                 name: 'last',
                                 value: 'Slocum'
                             }, {
                                 fieldLabel: 'Company',
                                 name: 'company',
                                 value: 'Ext JS'
                             }, {
                                 fieldLabel: 'Email',
                                 name: 'email',
                                 vtype: 'email'
                             }]
                     }, {
                         title: 'รายชื่อคณะกรรม',
                         layout: 'form',
                         defaults: {width: 230},
                         defaultType: 'textfield',

                         items: [{
                                 fieldLabel: 'Home',
                                 name: 'home',
                                 value: '(888) 555-1212'
                             }, {
                                 fieldLabel: 'Business',
                                 name: 'business'
                             }, {
                                 fieldLabel: 'Mobile',
                                 name: 'mobile'
                             }, {
                                 fieldLabel: 'Fax',
                                 name: 'fax'
                             }]
                     }, {
                         cls: 'x-plain',
                         title: 'รายเอียดเพิ่มเติม',
                         layout: 'fit',
                         items: {
                             xtype: 'htmleditor',
                             id: 'bio2',
                             name: 'tag',
                             fieldLabel: 'Tag การค้นหา'
                         }
                     }]
             }]

     });
     function SearchFrm() {

         return new Ext.Window(
                 {
//                     collapsible: true,
//                     maximizable: true,
                     title: "ค้นหารายการ TOR",
                     width: 700,
                     id: "winSearchFrm",
                     height: 300,
                     layout: "fit",
//                     modal: true,
                     plain: true,
                     bodyStyle: "padding:5px;",
                     buttonAlign: "center",
                     items: [{
                             layout: 'column',
                             border: false,
                             defauls: {background: '#eee'},
                             items: [{
                                     columnWidth: .5,
                                     layout: 'form',
                                     border: false,
                                     items: [{
                                             xtype: 'textfield',
                                             name: 'tag',
                                             id: 'stag_nameID',
                                             fieldLabel: 'คำที่ค้นหา Tag'
                                         }, {
                                             xtype: 'textfield',
                                             fieldLabel: 'รหัส TOR',
                                             id: 'sc_codeID',
                                             name: 'c_code'
                                         }, {
                                             xtype: 'datefield',
                                             fieldLabel: 'วันที่ TOR',
                                             id: 'sd_tor_dateID',
                                             name: 'd_tor_date'
                                         }, {
                                             xtype: "radiogroup",
                                             columns: [120],
                                             fieldLabel: "ผ่านรายการ",
                                             id: "searchPostID",
                                             name: "i_post",
                                             items: [
                                                 {
                                                     name: "i_post",
                                                     checked: true,
                                                     inputValue: 0,
                                                     boxLabel: "ทั้งหมด"

                                                 }, {
                                                     name: "i_post",
                                                     inputValue: 1,
                                                     boxLabel: "ผ่านรายการแล้ว"
                                                 }, {
                                                     name: "i_post",
                                                     inputValue: 2,
                                                     boxLabel: "ยังไม่ผ่านรายการ" 
                                                 }] //radiogroup
                                         }]
                                 }, {
                                     columnWidth: .5,
                                     layout: 'form',
                                     border: false,
                                     items: [{
                                             xtype: 'textfield',
                                             fieldLabel: 'เรื่อง TOR',
                                             id: 'sc_nameID',
                                             name: 'c_name'
                                         }, new Ext.form.ComboBox(
                                                 {
                                                     mode: "local",
                                                     store: new Ext.data.JsonStore({
                                                         autoDestroy: false,
                                                         autoLoad: false,
                                                         url: "api/All_spAlert.php",
                                                         baseParams: {type: "sp_type_status", i_is_type_tor: true, all: 'all'},
                                                         root: "data",
                                                         idProperty: "id",
                                                         fields: ["id", "c_name"]
                                                     }),
                                                     anchor: "100%",
                                                     fieldLabel: "วิธีดำเนินงาน",
                                                     submitValue: true,
                                                     hiddenName: "stor_type_id",
                                                     name: "sc_type_id",
                                                     id: "stor_type_idID",
                                                     valueField: "id",
                                                     displayField: "c_name",
                                                     triggerAction: "all",
                                                     forceSelection: false,
                                                     selectOnFocus: true,
                                                     typeAhead: false,
                                                     emptyText: "กรุณาเลือก",
                                                     listeners: {
                                                         afterrender: function ()
                                                         {
                                                             //setLoad&&callback
                                                             this.store.load({
                                                                 'callback': function (record, operation, success) {
                                                                     if (success)
                                                                     {
                                                                         Ext.getCmp('stor_type_idID').setValue(this.data.items[0].get('c_name'));
                                                                     }
                                                                 }
                                                             });
                                                         }
                                                     }
                                                 }), {
                                             xtype: "radiogroup",
                                             columns: [80, 90],
                                             fieldLabel: "สถานะการใช้งาน",
                                             id: "searchEnabledID",
                                             name: "si_enabled",
                                             items: [
                                                 {
                                                     name: "si_enabled",
                                                     checked: true,
                                                     inputValue: 1,
                                                     boxLabel: "ใช้งาน"

                                                 }, {
                                                     name: "si_enabled",
                                                     inputValue: 2,
                                                     boxLabel: "ไม่ใช้งาน"
                                                 }] //radiogroup
                                         }

                                     ]
                                 }],
                             buttonAlign: "left",
                             buttons: [{
                                     text: 'ค้นหา',
                                     handler: function ()
                                     {

                                         Ext.storeDtl.setBaseParam("mode", "LIST");
                                         Ext.storeDtl.setBaseParam("act", "SEARCH");
                                         Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                         Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                                         Ext.storeDtl.setBaseParam("tag", Ext.getCmp("stag_nameID").getValue());
                                         Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                         Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                         Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                         Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                                         Ext.storeDtl.load();
                                     }
                                 }, {
                                     text: 'ปิด',
                                     handler: function ()
                                     {
                                         Ext.getCmp("winSearchFrm").hide();
                                     }
                                 }]
                         }]
                 });
     }


     /////////////////// gridMain
     Ext.extend((gridMain = function () {
         var colmnn = [
             new Ext.grid.RowNumberer(
                     {
                         header: "ที่",
                         dataIndex: "no",
                         id: "idID",
                         width: 30,
                         renderer: function (value, metaData, record, row, col, store, gridView)
                         {
                             metaData.attr = "style='cursor:pointer; text-align:center;';";
                             return record.get("no");
                         }
                     }), {
                 header: "id",
                 sortable: false,
                 align: "left",
                 dataIndex: "id",
                 hidden: true  // icon: "../images/icons/application_view_tile.png"
             }, {

                 header: "สถานะ",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_code_status",
                 hidden: true,
                 renderer: function (value, metaData, record, row, col, store, gridView)
                 {

                     return (value == null) ? '' : value + ' ' + record.get('c_name_status');
                 }
             }, {
                 header: "รหัส TOR",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_code",
                 width: 120
             }, {
                 header: "ผ่านรายการ",
                 sortable: false,
                 id: "disID",
                 dataIndex: "id", 
                 renderer: function (value, metaData, record, row, col, store, gridView)
                 {
                     if (record.get('c_name_status') == null && record.get('c_code_status') == null)
                         return "<b>เอกสารยังไม่สมบูรณ์</b>";
                     else
                         return " สถานะเมนู <b>" + record.get('c_name_status') + " - " + record.get('c_code_status');


                 }

             }, {
                 header: "เรื่อง TOR",
                 sortable: true,
                 align: "left",
                 dataIndex: "c_name",
                 width: 250
             }, {
                 header: "ชื่อโครงการ",
                 sortable: false,
                 align: "left",
                 width: 150,
                 dataIndex: "c_budget_dtl_project",
                 editor: new Ext.form.DateField({})

             }, {
                 header: "ผู้รับมอบงาน",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_emp_name"
           }, {
                 header: "วันที่ TOR",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_tor_date"
             }, {
                 header: "วิธีดำเนินงาน",
                 width: 70,
                 sortable: false,
                 align: "left",
                 dataIndex: "c_tor_type"
             }, {
                 header: "ขอดำเนินการ",
                 sortable: false,
                 align: "center",
                 width: 70,
                 dataIndex: "c_purchase"
             }, {
                 header: "รหัสเอกสารอ้างอิง",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_doc_ref",
             }, {
                 header: "หน่วยงานเจ้าของเรื่อง",
                 align: "left",
                 dataIndex: "dc_cost_idTxt",
             }
         ];

         gridMain.superclass.constructor.call(this, {
             region: "center",
             title: Ext.title,
             xtype: "grid",
             id: "tabpanel1",
             border: true,
             // stripeRows: true,
             loadMask: true,
             //------------------
             layout: "fit",
             // clicksToEdit: 2,
             // clicksToEdit: 2,
             viewConfig: {
                 emptyText: "ไม่มีข้อมูล..",
                 deferEmptyText: true
             },
             listeners: {
                 dblclick: function (dataview, index, item, e) {
//                     Ext.buAct = "update";
//                     Ext.loadStore("edit", true); // app,data.load
                 },
                 viewready: function (g)
                 {
                     //

                 },
                 // Allow rows to be rendered.
                 beforeedit: function (g, )
                 {

                     if (g.rowIdx == 1)
                         return false;
                 },
                 // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                 afteredit: function (g)
                 {
                     // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                 },
                 beforerender: function (g)
                 {

                     this.contextMenu = new Ext.menu.Menu(
                             {
                                 items: [
                                     {
                                         text: "รายละเอียดทั้งหมด",
                                         icon: "../images/icons/book_magnify.png",
                                         handler: function (e)
                                         {
                                             Ext.buAct = "getDetail";
                                             tab2.getForm().loadRecord(Ext.selectRow);
                                             Ext.getCmp("contenterCenter").add(tab2);
                                             Ext.getCmp("contenterCenter").setActiveTab(tab2);
                                         },
                                         scope: this
                                     }]
                             });
                 },
                 afterrender: function (g)
                 {
                     //g.getStore().getAt(rowIndex);
                     //  console.log();

                     this.on("cellclick", cellClick, this); //cellClick
                     this.on("contextmenu", function (e, grid, rowIndex, columnIndex)
                     {
                         e.stopEvent();
                         this.contextMenu.showAt(e.getXY());
                     }, this);
                 }
             },
             store: Ext.storeDtl,
             tbar: [{
                     xtype: 'button',
                     text: ' ค้นหา ',
                     width: 80,
                     iconCls: "icon-application-view-list",
                     handler: function () {
                         if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                             Ext.getCmp("winSearchFrm").destroy();
                         var s1 = SearchFrm();
                         s1.show();
                     }
                 }],
             // tbar: MenuButton(),
             columns: colmnn,
             autoExpandColumn: 'disID',
             bbar: new Ext.PagingToolbar(
                     {
                         pageSize: 20,
                         store: Ext.storeDtl,
                         displayInfo: true,
                         displayMsg: "Displaying topics {0} - {1} of {2}",
                     }),
         });
     }), Ext.grid.GridPanel, {}); //EditorGridPanel
     ///////////////// EditorGridPanel 
     const search = function ()
     {
         var msg = "";
         if (msg == "")
         {
             Ext.storeDtl.setBaseParam("mode", "SEARCH");
             Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
             Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
             Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
             Ext.getCmp("tabpanel1").getStore().load();
         } else
         {
             Ext.Msg.alert("แจ้งเตือน", msg);
         }
     };
 };
 //OnLoad Renderer
 Ext.onReady(function () {
     Ext.QuickTips.init();
     Ext.user_right_add = user_right_add;
     Ext.user_right_edit = user_right_edit;
     Ext.user_right_delete = user_right_delete;
     Ext.AppUx("SP", "TOR สมบูรณ์"); //app & show menu
     var App = new Ext.Viewport({
         layout: "border",
         items: new Ext.TabPanel({
             region: "center",
             border: false,
             id: "contenterCenter",
             defaults: {
                 autoScroll: true,
                 layout: 'fit'
             },
             listeners: {
                 afterrender: function () {
                    // Ext.loadStore('load', false); //status,show
                 }
             },
             items: [new gridMain()]
         })
     });
     Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
     Ext.getCmp("tabpanel1").on('beforeedit', function () {
         return false;
     });
 });