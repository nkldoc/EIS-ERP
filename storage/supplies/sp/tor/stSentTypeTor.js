 /* global Ext, user_right_add, user_right_edit, user_right_delete */
 Ext.AppUx = function (app, menu)
 {
     Ext.user_right_add = user_right_add;
     Ext.user_right_edit = user_right_edit;
     Ext.user_right_delete = user_right_delete;
     Ext.title = Ext.menu_name + ' ' + Ext.menu_code;
     //Ext.menu_i_entrance;
     Ext.HDR_ID = null;
     Ext.selectRow = [];
     Ext.menuEditGrid = true;
     Ext.menuRightEditgrid = true;
     Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
     Ext.i_is_more = 0;
     /*tor_type_id,i_is_more*/
     Ext.tor_type_idTxt = Ext.apply({
         "tor_type_id1": {0: "แบบมีหัวงาน/ฝ่าย พิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการ พิจารณาผล(เกิน 5 แสนแสนบาท)"}
     });
     //Ext.menuCode = 'ST0005';
     Ext.status = Ext.apply({
         name: menu,
         process: function (menuCode, record) {
             Ext.Ajax.request({
                 url: "tor/api/mnTorController.php",
                 params: {
                     mode: "UPDATENEXTSTEP",
                     menuCode: menuCode,
                     i_seq: Ext.menu_i_seq,
                     tor_status_id: record.get("tor_status_id"),
                     tor_type_id: record.get("tor_type_id"),
                     i_entrance: Ext.menu_i_entrance,
                     i_is_more: record.get("i_is_more"),
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
     // copy text in cell on select row no
     function CopyToClipboard(rec, arrDataCopy)
     {
         var input = rec;
         var textToClipboard = "";
         //text on
         var success = true;
         for (var i = 0; i < arrDataCopy.length; i++)
         {
             textToClipboard += ", " + input.get(arrDataCopy[i]);
         }

         if (window.clipboardData)
         {
             // Internet Explorer
             window.clipboardData.setData("Text", textToClipboard);
         } else
         {
             var forExecElement = CreateElementForExecCommand(textToClipboard);
             SelectContent(forExecElement);
             var supported = true;
             // UniversalXPConnect privilege is required for clipboard access in Firefox
             try
             {
                 if (window.netscape && netscape.security)
                 {
                     netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                 }
                 success = document.execCommand("copy", false, null);
             } catch (e)
             {
                 success = false;
             }
             document.body.removeChild(forExecElement);
         }

         if (success)
         {
             console.log("The text is on the clipboard, try to paste it!");
         } else
         {
             console.log("Your browser doesn't allow clipboard access!");
         }
     }
     function CreateElementForExecCommand(textToClipboard, arrDataCopy)
     {
         var forExecElement = document.createElement("div");
         forExecElement.style.position = "absolute";
         forExecElement.style.left = "-10000px";
         forExecElement.style.top = "-10000px";
         forExecElement.textContent = textToClipboard;
         document.body.appendChild(forExecElement);
         forExecElement.contentEditable = true;
         return forExecElement;
     }
     function SelectContent(element)
     {
         // first create a range
         var rangeToSelect = document.createRange();
         rangeToSelect.selectNodeContents(element);
         // select the contents
         var selection = window.getSelection();
         selection.removeAllRanges();
         selection.addRange(rangeToSelect);
     }
     function cellClick(grid, rowIndex, columnIndex, e)
     {
         Ext.selectRow = this.selModel.selection.record;
         // var record = grid.getStore().getAt(rowIndex);
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
             };
             if (rec.get('i_step') == 0)
                 Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                     return false;
                 });
//             else
             Ext.Msg.show({
                 title: 'ประมวลผล TOR',
                 msg: 'คุณต้องการผ่านรายการ ' + rec.get('c_code') + ' <div>ไปยังวิธีการดำเนินงาน <b>"' + rec.get('c_tor_type') + '"</b>'
                         + ((rec.get('tor_type_id') == 1) ? Ext.tor_type_idTxt.tor_type_id1[rec.get('i_is_more')] : '')
                         + ' ? </div>',
                 width: 450,
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
     }// Controller

//AutoLoad
     Ext.torType = new Ext.data.JsonStore({
         autoDestroy: false,
         autoLoad: true,
         url: "api/All_spAlert.php",
         baseParams: {type: "sp_type_status", i_is_type_tor: true},
         root: "data",
         idProperty: "id",
         fields: ["id", "c_name"]
     });
     Ext.po_user = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_user",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"],
             });
     // copy text in cell on select row no
     Ext.po_emp = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_emp",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_code", "c_name"],
             });
     Ext.bgProject = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "bg_project",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name", "f_project"],
             });
     Ext.po_user_permission = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: false,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_user_permission",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"],
             });
     Ext.dc_cost = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "dc_cost",
                 },

                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_code", "c_name"],
             });

     Ext.po_creditor_transfer = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_creditor_transfer",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_code", "c_name"],
             });
     Ext.dc_expense_budget_type = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "dc_expense_budget_type",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"],
             });
     Ext.po_expense_group = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",

                 baseParams: {
                     type: "po_expense_group",
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"],
             });
     Ext.po_expense = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_expense"
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"]
             });
     Ext.storeDtl = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "tor/api/List_TorStep.php",
                 baseParams: {
                     type: "po_working_dtl",
                     keyData: Ext.keyData,
                     tor_status_id: Ext.menu_id
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
                         name: "tor_status_id"
                     }, {
                         name: "tor_type_id" //
                     }, {
                         name: "c_tor_type" //c_tor_type
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
                         name: "dc_cost_idTxt"
                     }, {
                         name: "i_year"
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
                         name: "d_tor_status_date"
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
     Ext.loadStore = function (status, show)
     {
         var statusx = status;

         var winx = show;
         if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
             Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action)
             {
                 return false;
             });
         else
//             Ext.po_creditor.reload(
//                     {
//                         callback: function (recordx, operation, success)
//                         {
//                             if (success)
//                             {
//                                 Ext.po_creditor_transfer.reload(
//                                         {
//                                             callback: function (recordx, operation, success)
//                                             {
//                                                 if (success)
//                                                 {
             Ext.dc_cost.reload({
                 callback: function (recordx, operation, success)
                 {
                     if (success)
                     {
                         Ext.po_emp.reload(
                                 {
                                     callback: function (recordx, operation, success)
                                     {
                                         if (success)
                                         {
                                             Ext.po_user_permission.reload(
                                                     {
                                                         callback: function (recordx, operation, success)
                                                         {
                                                             if (success)
                                                             {
                                                                 Ext.dc_expense_budget_type.reload(
                                                                         {
                                                                             callback: function (recordx, operation, success)
                                                                             {
                                                                                 if (success)
                                                                                 {
                                                                                     Ext.po_expense_group.reload(
                                                                                             {
                                                                                                 callback: function (recordx, operation, success)
                                                                                                 {
                                                                                                     if (success)
                                                                                                     {
                                                                                                         Ext.po_expense.reload(
                                                                                                                 {
                                                                                                                     callback: function (recordx, operation, success)
                                                                                                                     {
                                                                                                                         if (success)
                                                                                                                         {

//AppPoStore(statusx).show();

                                                                                                                             if (statusx == "add")
                                                                                                                             {

                                                                                                                                 Ext.HDR_ID = null;
                                                                                                                                 Ext.selectRow = null;
                                                                                                                                 Ext.i_is_more = 0;
                                                                                                                                 var winApp = AppPoStore(statusx);
                                                                                                                                 winApp.show();
                                                                                                                             } else if (statusx === "edit")
                                                                                                                             {
//
                                                                                                                                 Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                                                                                                 Ext.tor_type_id = Ext.selectRow.data.tor_type_id;// default start เจาะจงน้อวกว่า 5 แสน
                                                                                                                                 Ext.i_is_more = Ext.selectRow.data.i_is_more;

                                                                                                                                 if (!Ext.selectRow.get('po_expense_id'))
                                                                                                                                     Ext.selectRow.set('po_expense_id', null);
                                                                                                                                 if (!Ext.selectRow.get('po_creditor_id'))
                                                                                                                                     Ext.selectRow.set('po_creditor_id', null);
                                                                                                                                 if (!Ext.selectRow.get('dc_expense_budget_type_id'))
                                                                                                                                     Ext.selectRow.set('dc_expense_budget_type_id', null);
                                                                                                                                 if (!Ext.selectRow.get('bg_budget_dtl_project_id'))
                                                                                                                                     Ext.selectRow.set('bg_budget_dtl_project_id', null);
                                                                                                                                 if (!Ext.selectRow.get('dc_department_id'))
                                                                                                                                     Ext.selectRow.set('dc_department_id', null);
                                                                                                                                 if (!Ext.selectRow.get('dc_cost_id'))
                                                                                                                                     Ext.selectRow.set('dc_cost_id', null);

                                                                                                                                 var winApp = AppPoStore(statusx);
                                                                                                                                 Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                                                                 winApp.show();






                                                                                                                             }

                                                                                                                             //
                                                                                                                         }
                                                                                                                     }
                                                                                                                 }); //po_expense
                                                                                                     }
                                                                                                 }
                                                                                             }); //po_expense_group
                                                                                 }
                                                                             },
                                                                         }); //dc_expense_budget_type
                                                             }
                                                         },
                                                     }); //po_user_permission
                                         }
                                     },
                                 }); //po_emp
                     }
                 },
             });

//                                                 }
//                                             }
//                                         }); //po_creditor
//                             }
//                         }
//                     }); //po_creditor_transfer

     };

     var AppPoStore = function (statuss)
     {

         var comboCost = new Ext.form.ComboBox(
                 {
                     mode: "local",
                     readOnly: true,
                     store: Ext.dc_cost,
                     anchor: "100%",
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
                     readOnly: true,
                     store: Ext.dc_expense_budget_type,
                     fieldLabel: "แหล่งเงิน",
                     anchor: "100%",
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
                     readOnly: true,
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
                     readOnly: true,
                     store: Ext.po_expense,
                     valueField: "id",
                     displayField: "c_name",
                     anchor: "100%",
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
                     anchor: "100%",
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
                     title: Ext.title,
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
                                             columnWidth: .6,
                                             layout: 'form',
                                             border: true,
                                             items: [{
                                                     xtype: "hidden",
                                                     name: 'id',
                                                     id: "torHdrID" //i_is_more

                                                 }, {
                                                     xtype: disp,
                                                     readOnly: true,
                                                     fieldLabel: 'รหัส TOR',
                                                     id: 'codeHdrID',
                                                     style: "text-align: center;font-weight:bold;background:#eee;",
                                                     readOnly: true,
                                                     name: 'c_code'
                                                 }, {
                                                     xtype: disp,
                                                     readOnly: true,
                                                     fieldLabel: 'เรื่อง TOR',
                                                     name: 'c_name'

                                                 },
                                                 comboUsedBgYear,
                                                 {xtype: 'displayfield', fieldLabel: "ชื่อโครงการ", name: 'c_budget_dtl_project'},
                                                 comboTypeBg,
                                                 comboExpense,
                                                 comboCost
                                                         , {

                                                             xtype: "buttongroup",
                                                             fieldLabel: "วันที่",
                                                             frame: false,
                                                             border: false,
                                                             items: [
                                                                 {
                                                                     xtype: "datefield",
                                                                     name: "d_tor_date",
                                                                     readOnly: true,
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
                                                         },
                                                 {
                                                     xtype: 'combo',
                                                     readOnly: true,
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
                                                 }, {
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
                                                                 var tor_type_idID = Ext.getCmp('tor_type_idID').getValue();
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
                                                             xtype: "displayfield",
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
                                                                         this.setValue(Ext.floatRenderer(f_total));

                                                                     };
                                                                     this.fn();
                                                                 }
                                                             }
                                                         }]
                                                 }, {

                                                     xtype: 'displayfield',
                                                     fieldLabel: 'รหัสเอกสารอ้างอิง',
                                                     name: 'd_doc_ref'

                                                 }, {
                                                     xtype: 'datefield', name: 'd_tor_status_date', validator: function (val)
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
                                                     xtype: 'textarea',
                                                     width: 400,
                                                     name: 'c_comment'
//
                                                 }, {
                                                     xtype: "radiogroup",
                                                     columns: [180],
                                                     fieldLabel: "โหมดการบันทึก",
                                                     id: "modesubID",
                                                     style: {
                                                         "font-weight": "bold"
                                                     },
                                                     items: [{
                                                             name: "mode",
                                                             checked: true,
                                                             inputValue: "UPDATEFORMSTSATUS",
                                                             boxLabel: "บันทึกรายการ"
                                                         }]

                                                 }]
                                         }, {
                                             columnWidth: .4,
                                             layout: 'table'
                                         }]

                                 }],
                             buttonAlign: "center",
                             buttons: [{
                                     text: "บันทึกรายการ",
                                     id: "buSaveSubID",
                                     iconCls: "icon-save",
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
                                         }; //END


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
         title: 'Inner Tabs',
         bodyStyle: 'padding:5px',
         layout: 'fit',
         width: 600,
         items: [{
                 height: 200,
                 layout: 'column',
                 border: false,
                 items: [{
                         columnWidth: .5,
                         layout: 'form',
                         border: true,
                         items: [{
                                 xtype: 'textfield',
                                 fieldLabel: 'First Name',
                                 name: 'first',
                                 anchor: '50%'
                             }, {
                                 xtype: 'textfield',
                                 fieldLabel: 'Company',
                                 name: 'company',
                                 anchor: '50%'
                             }]
                     }, {
                         columnWidth: .5,
                         layout: 'form',
                         border: true,
                         items: [{
                                 xtype: 'textfield',
                                 fieldLabel: 'Last Name',
                                 name: 'last',
                                 anchor: '50%'
                             }, {
                                 xtype: 'textfield',
                                 fieldLabel: 'Email',
                                 name: 'email',
                                 vtype: 'email',
                                 anchor: '50%'
                             }]
                     }],
                 buttonAlign: "left",
                 buttons: [{
                         text: 'Save'
                     }, {
                         text: 'Cancel'
                     }]
             }, {
                 xtype: 'tabpanel',
                 plain: true,
                 activeTab: 0,
                 height: 235,
                 deferredRender: false,
                 defaults: {bodyStyle: 'padding:10px'},
                 items: [{
                         title: 'Personal Details',
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
                         title: 'Phone Numbers',
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
                         title: 'Biography',
                         layout: 'fit',
                         items: {
                             xtype: 'htmleditor',
                             id: 'bio2',
                             fieldLabel: 'Biography'
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
                     height: 200,
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
                                             fieldLabel: 'รหัส TOR',
                                             id: 'sc_codeID', // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
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
     var MenuButton = function ()
     {
         var menu = new Ext.menu.Menu({
             id: "mainMenu",
             border: false,
             style: {
                 overflow: "visible",
             }
             /*
              items: [{
              text: "ประเภทข้อมูล",
              icon: "../images/icons/application_form_magnify.png",
              menu: {
              items: [
              '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
              {
              text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
              checked: false,
              id: "keyDatat1",
              uri: 1,
              group: "theme",
              checkHandler: onLocationCheck
              },
              {
              text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
              checked: false,
              uri: 0,
              id: "keyDatat2",
              group: "theme",
              checkHandler: onLocationCheck
              },
              {
              text: " เลือกประเภทข้อมูลที่ทั้งหมด",
              checked: true,
              id: "keyDatat3",
              uri: null,
              group: "theme",
              checkHandler: onLocationCheck
              }
              ]
              }
              }]*/
         });
         var tb = new Ext.Toolbar({
             text: " รายการเมนู ",
             border: false,
             icon: "../images/icons/text_list_bullets.png",
             iconCls: "menu",
             // <-- icon
             menu: menu,
             // assign menu by instance
         });
         tb.add({
             text: " รายการเมนู ",
             icon: "../images/icons/text_list_bullets.png",
             iconCls: "bmenu",
             // <-- icon
             border: false,
             bodyStyle: "padding:0px 0px 0px 0px !important;",
             menu: menu,
             // assign menu by instance
         });
         menu.addSeparator();
         menu.add({
             text: "ค้นหาข้อมูล",
             icon: "../images/icons/book_magnify.png"
         }).on("click", (click = function () {
             if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                 Ext.getCmp("winSearchFrm").destroy();
             var s1 = SearchFrm();
             s1.show();
         }));
         tb.doLayout();
         return tb;
     }; //MenuButton
     Ext.gridMainfn = function (editAbled)
     {
         if (!Ext.isEmpty(Ext.getCmp("tabpanel1")))
             Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

         var gridMains = new gridMain();
         Ext.getCmp("contenterCenter").add(gridMains);
         Ext.getCmp("contenterCenter").setActiveTab(gridMains);
         Ext.getCmp("tabpanel1").on("beforeedit", function ()
         {
             return editAbled;
         });
         if (editAbled)
             Ext.getCmp("buSaveGridID").show();
         else
             Ext.getCmp("buSaveGridID").hide();

         return gridMains;
     };
     /////////////////// searchGrid Extend
     Ext.extend((searchGrid = function () {
         var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
         //classOverride
         searchGrid.superclass.constructor.call(this, {
             initComponent: function ()
             {
                 searchGrid.superclass.initComponent.call(this);
                 this.fn(this);
                 /*console.log('Loading...');*/
             },
             listeners: {
                 afterrender: function (obj, eOpts)
                 {
                     /*console.log('Load Finish');*/
                 },
             },
             fn: function ()
             {},
             id: "frm-grid-searchID",
             frame: true,
             bodyStyle: "padding:1px",
             autoHeight: true,
             border: false,
             width: 600,
             url: mnController,
             labelWidth: 180,
             defaults: {
                 anchor: "0",
             },
             items: [
                 {
                     xtype: "hidden",
                     name: "mode",
                     value: "saveDataGrid",
                 }, {
                     xtype: "hidden",
                     name: "gridMain",
                     id: "gridMainID",
                 },
                 menu ? MenuButton() : []],
             buttonAlign: "left",
             buttons: [
                 {
                     text: "บันทึกรายการ",
                     id: "buSaveGridID",
                     iconCls: "icon-save",
                     listeners: {
                         afterrender: function ()
                         {
                             this.hide();
                         },
                     },
                     handler: function ()
                     {
                         var formSubmit = function ()
                         {
                             form.submit(
                                     {
                                         waitMsg: "Saving Data...",
                                         success: function (form, action)
                                         {
                                             Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                             {
                                                 Ext.getCmp("tabpanel1").getStore().reload();
                                                 Ext.getCmp("winChequeID").hide();
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
                                         },
                                     });
                         }; //func submit
                         var saveDtl = function (mode)
                         {
                             let msg = "";
                             let jsonArr = [];
                             let sto = Ext.getCmp("tabpanel1").store.data.items;
                             sto.forEach(function (v)
                             {
                                 //d_audit_date d_approve_date d_doc_date d_inv_date
                                 jsonArr.push(
                                         {
                                             po_working_dtl_id: v.data.id,
                                             d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                                             d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                                             d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                                             d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                                         });
                             });

                             //console.log(JSON.stringify(jsonArr));
                             //console.log(jsonArr);
                             //TODO @ setGridDirty to idCmp
                             Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                             formSubmit(form); //submit grid form
                         }; // saveDtl
                         var form = Ext.getCmp("frm-grid-searchID").getForm();
                         if (form.isValid())
                         {
                             Ext.MessageBox.show(
                                     {
                                         title: "Icon Support",
                                         msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                                         buttons: Ext.MessageBox.OKCANCEL,
                                         icon: Ext.MessageBox.WARNING,
                                         fn: function (btn)
                                         {
                                             if (btn === "ok")
                                             {
                                                 //TODO @ setGridDirty to idCmp
                                                 saveDtl();
                                             } else
                                             {
                                                 return;
                                             }
                                         },
                                     });
                         }
                     },
                     //haddler
                 }, {
                     xtype: "tbfill",
                 }, {
                     text: "ค้นหา",
                     id: "buSearchID",
                     iconCls: "icon-magnifier",
                     handler: function ()
                     {
                         search();
                     },
                 }, {
                     text: "เริ่มใหม",
                     iconCls: "icon-reset",
                     handler: function ()
                     {
                         Ext.getCmp("frm-grid-searchID").getForm().reset();
                     },
                 }]
         });
     }), Ext.FormPanel, {});
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
                 header: "ลำดับ",
                 sortable: false,
                 align: "left",
                 dataIndex: "id",
                 hidden: true  // icon: "../images/icons/application_view_tile.png"
             }, {
                 header: "รหัส TOR",
                 sortable: false,
                 align: "center",
                 dataIndex: "c_codeStatus",
                 width: 120
             }, {
                 header: "ผ่านรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "id",
                 id: 'processDueID',
                 width: 70,
                 renderer: function (value, metaData, record, row, col, store, gridView)
                 {
                     metaData.attr = "style='cursor:pointer; text-align:center;';";
                     return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
                 }
             }, {
                 header: "วิธีดำเนินงาน",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_tor_type", //c_tor_type
                 renderer: function (val, metaData, record, row, col, store, gridView)
                 {
                     var c_type = record.get('tor_type_id');
                     var c_more = (c_type == 1) ? Ext.tor_type_idTxt.tor_type_id1[record.get('i_is_more')] : '';
                     return '<b>' + val + '</b> ' + c_more;

                 }
                 // width: 80
             }, {
                 header: "เรื่อง TOR",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_name", //c_tor_type
                 width: 150
             }, {
                 header: "ชื่อโครงการ",
                 sortable: false,
                 align: "left",
                 width: 150,
                 dataIndex: "c_budget_dtl_project",
                 editor: new Ext.form.DateField({})

             }, {
                 header: "วันที่ TOR",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_tor_date"
             }, {
                 header: "วันที่เอกสาร",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_tor_status_date"
//             }, {
//                 header: "วิธีดำเนินงาน",
//                 sortable: false,
//                 align: "left",
//                 dataIndex: "c_tor_type"
//             }, {
//                 header: "ขอดำเนินการ",
//                 sortable: false,
//                 align: "left",
//                 dataIndex: "c_purchase"
             }, {
                 header: "หมายเหตุ",
                 sortable: false,
                 align: "left",
                 dataIndex: "c_comment"
             }, {
                 header: "หน่วยงานเจ้าของเรื่อง",
                 align: "left",
                 dataIndex: "dc_cost_idTxt",

             }, {
                 header: "ชื่อผู้สร้างรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "dc_user_create_id",
                 hidden: true,
             }, {
                 header: "หน่วยงานผู้สร้าง",
                 sortable: false,
                 align: "center",
                 dataIndex: "dc_user_create_cost_id",
                 hidden: true,
             }, {
                 header: "วันที่สร้างรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_create",
                 hidden: true,
                 renderer: function (val, metaData, record, rowIndex, colIndex, store)
                 {
                     return shortThaiDate(val);
                 },
             }, {
                 header: "ชื่อผู้แก้ไขรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "dc_user_update_id",
             }, {
                 header: "หน่วยงานแก้ไขรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "dc_user_update_cost_id",
             }, {
                 header: "วันที่แก้ไขรายการ",
                 sortable: false,
                 align: "center",
                 dataIndex: "d_update",
                 renderer: function (val, metaData, record, rowIndex, colIndex, store)
                 {
                     return shortThaiDate(val);
                 }
             }
         ];

         gridMain.superclass.constructor.call(this, {
             region: "center",
             title: Ext.title,
             xtype: "grid",
             id: "tabpanel1",
             border: true,
             stripeRows: true,
             loadMask: true,
             //------------------
             layout: "fit",
             clicksToEdit: 2,
             // clicksToEdit: 2,
             viewConfig: {
                 emptyText: "ไม่มีข้อมูล..",
                 deferEmptyText: true
             },
             listeners: {
                 dblclick: function (dataview, index, item, e) {
                     Ext.buAct = "update";
                     Ext.loadStore("edit", true); // app,data.load
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
                                             Ext.getCmp("contenterCenter").add(tab2);
                                             Ext.getCmp("contenterCenter").setActiveTab(tab2);
                                         },
                                         scope: this
//                                     }, {
//                                         text: "เพิ่มข้อมูล",
//                                         icon: "../images/icons/add.png",
//                                         handler: function (e)
//                                         {
//                                             Ext.buAct = "add";
//                                             Ext.loadStore("add", true); // app,data.load
//                                         },
//                                         scope: this
                                     }, {
                                         text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                         icon: "../images/icons/application_edit.png",
                                         handler: function (e)
                                         {
                                             Ext.buAct = "update";
                                             Ext.loadStore("edit", true); // app,data.load
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
             tbar: [menu ? MenuButton() : []],
             columns: colmnn,
             bbar: new Ext.PagingToolbar(
                     {
                         pageSize: 20,
                         store: Ext.storeDtl,
                         displayInfo: true,
                         displayMsg: "Displaying topics {0} - {1} of {2}",
                     }),
         });
     }), Ext.grid.EditorGridPanel, {});
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
