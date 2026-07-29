
 /* global Ext, user_right_add, user_right_edit, user_right_delete */
 Ext.AppUx = function (app, menu)
 {
     Ext.user_right_add = user_right_add;
     Ext.user_right_edit = user_right_edit;
     Ext.user_right_delete = user_right_delete;
     Ext.title = Ext.menu_name + ' ' + Ext.menu_code;
     Ext.HDR_ID = null;
     // storeYear
     Ext.selectRow = [];
     Ext.menuEditGrid = true;
     Ext.menuRightEditgrid = true;
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
     function controller(rec, evt) {

         if (Ext.isEmpty(rec))
             Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action)
             {
                 return false;
             });
         else
             Ext.Msg.show({
                 title: 'แจ้งเตือน!',
                 msg: 'Are you sure you want to process due PA & ALERT TOR?',
                 width: 400,
                 // buttons: Ext.MessageBox.YESNOCANCEL,
                 buttons: Ext.MessageBox.YESNO,
                 fn: function (btn, text) {
                     if (btn === 'yes')
                         alert('You pressed ' + btn);
                     else
                         null;
                 },
                 icon: Ext.MessageBox.ERROR
             });


     }
     function cellClick(grid, rowIndex, columnIndex, e)
     {
         Ext.selectRow = this.selModel.selection.record;
         // var record = grid.getStore().getAt(rowIndex);
         if (columnIndex === grid.getColumnModel().getIndexById('processDueID')) { //ttf

             controller(Ext.selectRow, 'processDue'); //on

         }

     }
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
     Ext.po_creditor = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",
                 baseParams: {
                     type: "po_creditor",
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
                     type: "dc_expense_budget_type"
                 },
                 root: "data",
                 idProperty: "id",
                 fields: ["id", "c_name"]
             });
     Ext.po_expense_group = new Ext.data.JsonStore(
             {
                 autoDestroy: false,
                 autoLoad: true,
                 url: "api/All_PoWorkingImpHdr.php",

                 baseParams: {
                     type: "po_expense_group"
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
                 url: "tor/api/List_DeliveryStep.php",
                 baseParams: {
                     type: "deliveries",
                     keyData: Ext.keyData,
                     tor_status_id: Ext.menu_id
                 },
                 root: "data",
                 idProperty: "id",
                 totalProperty: "totalCount",
                 fields: [{
                         name: "no"
                     }, {
                         name: "id" //id sp_tor_id i_period c_doc_ref f_total_amt d_period_date
                     }, {
                         name: "sp_tor_id"
                     }, {
                         name: "i_period"
                     }, {
                         name: "c_doc_ref"
                     }, {
                         name: "dc_creditor_idTxt"
                     }, {
                         name: "f_total_amt"
                     }, {
                         name: "d_period_date"
                     }, {
                         name: "c_code"
                     }, {
                         name: "bg_budget_item_project_id"
                     }, {
                         name: "c_budget_dtl_project"
                     }, {
                         name: "c_name"
                     }, {
                         name: "c_tor_type"
                     }, {
                         name: "tor_type_id"
                     }, {
                         name: "c_purchase"
                     }, {
                         name: "i_purchase"
                     }, {
                         name: "i_parent"
                     }, {
                         name: "i_is_parent"
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
                 ]
             });

     Ext.store_year = new Ext.data.JsonStore(
             {
                 fields: ["id", "c_name"],
                 autoDestroy: false,
                 autoLoad: false,
                 data: years,
             });

     function DisbledButton(t)
     {
         //Disabled etc...
         if (t)
         {
             Ext.getCmp("buSaveID").hide();
         } else
         {
             Ext.getCmp("buSaveID").show();
         }
     }
     //Ext
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
         if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
             Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action)
             {
                 return false;
             });
         else
             Ext.po_creditor.reload(
                     {
                         callback: function (recordx, operation, success)
                         {
                             if (success)
                             {
                                 Ext.po_creditor_transfer.reload(
                                         {
                                             callback: function (recordx, operation, success)
                                             {
                                                 if (success)
                                                 {
                                                     Ext.dc_cost.reload(
                                                             {
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
                                                                                                                                                                             if (statusx === "load")
                                                                                                                                                                             {
                                                                                                                                                                             } else
                                                                                                                                                                                 AppPoStore(statusx).show();

                                                                                                                                                                             if (statusx === "add")
                                                                                                                                                                             {
                                                                                                                                                                                 Ext.HDR_ID = null;
                                                                                                                                                                             } else if (statusx === "edit")
                                                                                                                                                                             {
                                                                                                                                                                                 Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                                                                                                                 Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                                                                                                                                             }
                                                                                                                                                                             //
                                                                                                                                                                         }
                                                                                                                                                                     },
                                                                                                                                                                 }); //po_expense
                                                                                                                                                     }
                                                                                                                                                 },
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
                                                             }); //dc_cost
                                                 }
                                             },
                                         }); //po_creditor
                             }
                         },
                     }); //po_creditor_transfer
     };
     var AppPoStore = function (statuss)
     {

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
                     items: new Ext.FormPanel(
                             {
                                 id: Ext.poFormID,
                                 columnWidth: 1,
                                 url: "reg/controller/mnPoWorkingHdrBegin.php",
                                 frame: true,
                                 labelAlign: "left",
                                 bodyStyle: "padding:1px",
                                 labelWidth: 120,
                                 items: frm4Gen(), /* {
                                         xtype: disp,
                                         fieldLabel: 'เลขที่สัญญา',
                                         name: 'c_doc_ref'

                                     }, {
                                         xtype: disp,
                                         fieldLabel: 'คู่สัญญา',
                                         name: 'dc_creditor_idTxt'
                                     }, {
                                         xtype: disp,
                                         fieldLabel: 'งวดที่',
                                         name: 'i_period'
                                     }, {
                                         xtype: disp,
                                         fieldLabel: 'วันที่ส่งมอบ',
                                         name: 'd_period_date'
                                     } ,
                                     {
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
                                                         viewConfig: {forceFit: true},
                                                     }]
                                             }*/

                                 buttons: [
                                     {
                                         text: "ทำรายการ TOR",
                                         id: "buSaveSubID",
                                         iconCls: "icon-save",
                                         listeners: {
                                             afterrender: function ()
                                             {},
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
                                                                     //  Ext.getCmp("tabpanel1").getStore().reload();
                                                                     //  Ext.selectRow = null;
                                                                     //  Ext.getCmp("winChequeID").hide();
                                                                     //  Ext.getCmp("winChequeID").destroy();
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
                                             };
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
                                                                 },
                                                             });
                                                 } else
                                                 {
                                                     formSubmit(form);
                                                 }
                                             } //isValid
                                         },
                                         //haddler
                                     }, {
                                         text: Ext.GLOBAL_BU_BACK_TH,
                                         handler: function ()
                                         {
                                             Ext.getCmp("winChequeID").hide();
                                             Ext.getCmp("winChequeID").destroy();
                                         },
                                     }, ]
                             }),
                     listeners: {
                         afterrender: function ()
                         {},
                     },
                 });
     };
     var MenuButton = function ()
     {
         // show Menu Edit Grid
         var editm = Ext.menuEditGrid;
         var menu = new Ext.menu.Menu(
                 {
                     id: "mainMenu",
                     border: false,
                     style: {
                         overflow: "visible",
                     },
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
         var tb = new Ext.Toolbar(
                 {
                     text: " รายการเมนู ",
                     border: false,
                     icon: "../images/icons/text_list_bullets.png",
                     iconCls: "menu",
                     // <-- icon
                     menu: menu,
                     // assign menu by instance
                 });
         //    รายการเมนู
         tb.add(
                 {
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
         //  เพิ่มข้อมูล
         menu.add(
                 {
                     text: "ค้นหาข้อมูล",
                     icon: "../images/icons/book_magnify.png",
                 }).on("click", (click = function ()
         {
//             Ext.loadStore("add", false); // app,data.load
         }));
         //  เพิ่มข้อมูล
         menu.add(
                 {
                     text: "เพิ่มข้อมูล",
                     icon: "../images/icons/add.png",
                 }).on("click", (click = function ()
         {
             Ext.loadStore("add", false); // app,data.load
         }));

         // แก้ไขข้อมูล
         menu.add(
                 {
                     text: "จัดการข้อมูล View/Copy/Edit/Delete",
                     icon: "../images/icons/application_edit.png",
                 }).on("click", (click = function ()
         {
             Ext.loadStore("edit", true); // app,data.load
         }));
         //   แก้ไขข้อมูลผ่าน
         if (editm === true)
         {
             menu.add(
                     {
                         text: "แก้ไขข้อมูลผ่าน Data Grid",
                         icon: "../images/icons/application_form_add.png",
                     }).on("click", (click = function ()
             {
                 Ext.gridMainfn(true);
             }));
             // ยกเลิก
             menu.add(
                     {
                         text: "ยกเลิกการแก้ไขฝ่าน Data Grid",
                         icon: "../images/icons/application_form_delete.png",
                     }).on("click", (click = function ()
             {
                 Ext.gridMainfn(false);
             }));
         }
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
     Ext.extend(
             (searchGrid = function ()
             {
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
                             }
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
     function frm4Gen() {
         Ext.validNumber = function (val) {

             var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
             var strMoney = val.replace(',', '');
             if (!regex.test(val))
             {
                 return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                 return true;
             } else {
                 return true;
             }
         };
         Ext.validEmpty = function (val) {
             if (Ext.isEmpty(val))
             {
                 return "กรุณากรอก ข้อมูล ";
             } else {
                 return true;
             }
         };

         return [{
                 fieldLabel: 'วันที่กำหนดส่ง ',
                 xtype: 'displayfield',
                 name: 'd_period_date',
                 id: 'd_doc_date_wfrmID',
                 cls: 'my-label-style'
             }, {
                 fieldLabel: 'งวดที่ ',
                 xtype: 'displayfield',
                 name: 'i_period',
                 id: 'i_period_wfrmID',
                 cls: 'my-label-style'
             }, {
                 fieldLabel: 'วงเงินค่าปรับที่ระบุจากฝ่ายจัดซื้อ ',
                 xtype: 'displayfield',
                 name: 'f_amount',
                 id: 'f_amount_wfrmID',
                 cls: 'my-label-style'
             }, {
                 fieldLabel: 'วันที่บันทึกค่าปรับ ',
                 xtype: 'datefield',
                 name: 'd_doc_date',
                 validator: Ext.validEmpty

             }, {
                 fieldLabel: 'เลขที่บันทึกค่าปรับ ',
                 xtype: 'textfield',
                 name: 'c_doc_no',
                 id: 'c_doc_no_wfrmID',
                 validator: Ext.validEmpty
             }, {
                 fieldLabel: 'ค่าปรับ ',
                 xtype: 'textfield',
                 name: 'f_amount1',
                 id: 'f_amount_inpwfrmID',
                 validator: Ext.validNumber

             }, {
                 id: 'i_is_fine_from',
                 fieldLabel: 'ค่าปรับหักจาก',
                 xtype: 'radiogroup',
                 columns: [120, 120, 120],
                 items: [{
                         xtype: 'checkbox',
                         id: 'i_is_debit_contractID',
                         name: 'i_is_debit_contract',
                         boxLabel: ' เงินประกันสัญญา',
                         inputValue: '1',
                         listeners: {
                             check: function (checkbox, checked) {
                                 if (checked) {
                                     Ext.getCmp('f_amount_contractID').setDisabled(false);
                                 } else {
                                     Ext.getCmp('f_amount_contractID').setDisabled(true);
                                     Ext.getCmp('f_amount_contractID').setValue(0);
                                     getCalfrm();
                                 }

                             }
                         }
                     }, {
                         xtype: 'checkbox',
                         id: 'i_is_debit_periodID',
                         name: 'i_is_debit_period',
                         boxLabel: ' เงินประจำงวด',
                         checked: true,
                         inputValue: '1',
                         listeners: {
                             check: function (checkbox, checked) {
                                 if (checked) {
                                     Ext.getCmp('f_amount_periodID').setDisabled(false);
                                 } else {
                                     Ext.getCmp('f_amount_periodID').setDisabled(true);
                                     Ext.getCmp('f_amount_periodID').setValue(0);
                                     getCalfrm();
                                 }

                             }
                         }
                     }, {
                         xtype: 'checkbox',
                         id: 'i_is_debit_cntID',
                         name: 'i_is_debit_cnt',
                         boxLabel: ' เรียกเก็บจากผู้ขาย',
                         inputValue: '3',
                         listeners: {
                             check: function (checkbox, checked) {
                                 if (checked) {
                                     Ext.getCmp('f_amount_cntID').setDisabled(false);
                                 } else {
                                     Ext.getCmp('f_amount_cntID').setDisabled(true);
                                     Ext.getCmp('f_amount_cntID').setValue(0);
                                     getCalfrm();
                                 }

                             }
                         }
                     }],

             }, {
                 fieldLabel: 'เงินประกันสัญญา ',
                 xtype: 'textfield',
                 name: 'f_amount_contract',
                 id: 'f_amount_contractID',
                 validator: Ext.validNumber,
                 disabled: true,
             }, {
                 fieldLabel: 'เงินประจำงวด ',
                 xtype: 'textfield',
                 name: 'f_amount_period',
                 //value:Ext.getCmp('f_amount_inpwfrmID').getValue(),
                 id: 'f_amount_periodID',
                 validator: Ext.validNumber,
                 disabled: false,
             }, {
                 fieldLabel: 'เรียกเก็บจากผู้ขาย/ผู้รับจ้าง ',
                 xtype: 'textfield',
                 name: 'f_amount_cnt',
                 id: 'f_amount_cntID',
                 validator: Ext.validNumber,
                 disabled: true,
             }, {
                 fieldLabel: 'จำนวนเงินค่าปรับรวม ',
                 xtype: 'textfield',
                 name: 'f_sum',
                 readOnly: true,
                 id: 'f_sumID',
             }, {
                 fieldLabel: 'หมายเหตุ',
                 id: 'c_comment_wfrmID',
                 name: 'c_comment',
                 xtype: 'textarea',
                 height: 60,
                 width: 430,

             }];
     }

     /////////////////// gridMain
     Ext.extend(
             (gridMain = function ()
             {
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
                         header: "ชื่อคู่สัญญา",
                         sortable: false,
                         align: "center",
                         dataIndex: "dc_creditor_idTxt",
                         width: 90
                     }, {
                         header: "เลขที่สัญญา",
                         sortable: false,
                         align: "center",
                         dataIndex: "c_doc_ref",
                         width: 90
                     }, {
                         header: "งวดที่",
                         sortable: false,
                         align: "center",
                         dataIndex: "i_period",
                         width: 90
//                     }, {
//                         header: "",
//                         sortable: false,
//                         align: "center",
//                         dataIndex: "d_period_date",
//                         id: 'processDueID',
//                         width: 90,
//                         renderer: function (value, metaData, record, row, col, store, gridView)
//                         {
//                             metaData.attr = "style='cursor:pointer; text-align:center;';";
//                             return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
//                         }

                     }, {
                         header: "วันส่งมอบ",
                         sortable: false,
                         align: "center",
                         dataIndex: "d_period_date",
                         width: 100

                     }, {
                         header: "เรื่อง TOR",
                         sortable: false,
                         align: "center",
                         dataIndex: "c_name",
                         width: 90
                     }, {
                         header: "ชื่อโครงการ",
                         sortable: false,
                         align: "center",
                         width: 150,
                         dataIndex: "c_budget_dtl_project",
                         editor: new Ext.form.DateField({})

                     }, {
                         header: "วิธีดำเนินงาน",
                         sortable: false,
                         align: "left",
                         dataIndex: "c_tor_type",
                     }, {
                         header: "ขอดำเนินการ",
                         sortable: false,
                         align: "left",
                         dataIndex: "c_purchase",
                     }, {
                         header: "รหัสเอกสารอ้างอิง",
                         sortable: false,
                         align: "center",
                         dataIndex: "d_doc_ref",
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
                         },
                     },
                 ];

                 gridMain.superclass.constructor.call(this, {
                     region: "center",
                     title: Ext.title + '',
                     xtype: "grid",
                     id: "tabpanel1",
                     border: true,
                     stripeRows: true,
                     loadMask: true,
                     //------------------
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
                     layout: "fit",
                     clicksToEdit: 2,
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
                                                 text: "ค้นหาข้อมูล",
                                                 icon: "../images/icons/book_magnify.png",
                                                 handler: function (e)
                                                 {
//                                                     Ext.loadStore("add", true); // app,data.load
                                                 },
                                                 scope: this,
                                             }, {
                                                 text: "เพิ่มข้อมูล",
                                                 icon: "../images/icons/add.png",
                                                 handler: function (e)
                                                 {
                                                     Ext.loadStore("add", true); // app,data.load
                                                 },
                                                 scope: this,
                                             }, {
                                                 text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                                 icon: "../images/icons/application_edit.png",
                                                 handler: function (e)
                                                 {
                                                     Ext.loadStore("edit", true); // app,data.load
                                                 },
                                                 scope: this,
                                             }, {
                                                 text: "คัดลอกข้อมูลใน copy data in cell grid",
                                                 icon: "../images/icons/page_copy.png",
                                                 handler: function (e)
                                                 {
                                                     //field
                                                     var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                                                     var rowx = Ext.selectRow;

                                                     if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                                                         //if Ctlr+c
                                                         CopyToClipboard(rowx, arrDataCopy);
                                                 },
                                                 scope: this,
                                             }, ],
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

                             /*
                              //  Ctlr+c
                              new Ext.KeyMap(Ext.get('tabpanel1'), [{
                              key: "c",
                              ctrl: true,
                              scope: this,
                              fn: function (e, ele) {
                              ele.preventDefault();
                              var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                              var rowx = Ext.selectRow;
                              if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy)) //if Ctlr+c
                              CopyToClipboard(rowx, arrDataCopy);

                              }
                              }]);
                              //end key
                              */
                         }
                     },
                     store: Ext.storeDtl,
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

     //Class Extend
     formAdd = function () {
         saveHdr = function () {
             var msg = "";

             var i_is_start_from_contract = Ext.getCmp("i_is_start_from_contract").getValue().inputValue;

             if (Ext.getCmp("i_year").getValue() == "") {
                 msg += "- กรุณาเลือก ปีขอจัดซื้อ<br>";
             }
             if (Ext.BG_TYPE == 1) {
                 // งบทำการ
             } else if (Ext.BG_TYPE == 2) {
                 // งบลงทุน
                 if (Ext.getCmp("bg_hdr_id").getValue() == "") {
                     msg += "- กรุณาเลือก จัดซื้อ/จัดจ้างใน<br>";
                 }
             } else if (Ext.BG_TYPE == 3) {
                 // งบสำรองเร่งด่วน
                 if (Ext.getCmp("dc_bg_obj_id").getValue() == "") {
                     msg += "- กรุณาเลือก วัตถุประสงค์<br>";
                 }
                 if (Ext.getCmp("dc_bg_cap_id").getValue() == "") {
                     msg += "- กรุณาเลือก ส่วนงาน<br>";
                 }
             }
             if (Ext.getCmp("d_doc_date").getValue() == "" || Ext.getCmp("d_doc_date").getValue() == null) {
                 msg += "- กรุณากรอก วันที่อนุมัติ<br>";
             }
             if (Ext.getCmp("ap_process_type_id").getValue() == "" || Ext.getCmp("ap_process_type_id").getValue() == null) {
                 msg += "- กรุณากรอก วิธี<br>";
             }
             if (Ext.getCmp("i_is_doc").getValue().inputValue == 1) {
                 if (Ext.getCmp("c_doc_no").getValue() == "") {
                     msg += "- กรุณากรอก เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า<br>";
                 }
                 if (Ext.getCmp("d_doc_no_date").getValue() == "") {
                     msg += "- กรุณากรอก วันที่ใบสั่ง<br>";
                 }
                 if (i_is_start_from_contract == 0 || i_is_start_from_contract == 1) {
                     msg += "- กรุณาเลือก นับถัดจาก/นับตั้งแต่<br>";
                 }
             } else {
                 if (Ext.getCmp("c_doc_resp_no").getValue() == "") {
                     msg += "- กรุณากรอก เลขที่เอกสารรับสนองราคา<br>";
                 }
                 if (Ext.getCmp("d_doc_resp_date").getValue() == "") {
                     msg += "- กรุณากรอก วันที่รับสนองราคา<br>";
                 }
                 if (i_is_start_from_contract == 2) {
                     msg += "- กรุณาเลือก นับถัดจาก/นับตั้งแต่<br>";
                 }
             }
             if (Ext.getCmp("c_name").getValue() == "") {
                 msg += "- กรุณากรอก เรื่อง<br>";
             }
             if (Ext.getCmp("i_delivery").getValue() == "") {
                 msg += "- กรุณากรอก กำหนดส่งภายใน<br>";
             }
             if (Ext.getCmp("dc_cost_id").getValue() == "" || Ext.getCmp("dc_cost_id").getValue() == null) {
                 msg += "- กรุณากรอก หน่วยงานเจ้าของเรื่อง<br>";
             }

             if (msg == "") {
                 Ext.getCmp("frm-Add")
                         .getEl()
                         .mask("Please wait...", "x-mask-loading");
                 Ext.Ajax.request({
                     url: "api/mn_ApPoHdr.php",
                     method: "POST",
                     params: {
                         mode: Ext.getCmp("role-form-mode").getValue(),
                         BG_TYPE: Ext.BG_TYPE,
                         id: Ext.getCmp("id").getValue(),
                         dc_bg_type_id: Ext.BG_TYPE, // 1 = งบทำการ, 2 = งบลงทุน, 3 = งบสำรองเร่งด่วน
                         bg_hdr_id: Ext.BG_TYPE == 2 ? Ext.getCmp("bg_hdr_id").getValue() : null,
                         dc_bg_obj_id: Ext.BG_TYPE == 3 ? Ext.getCmp("dc_bg_obj_id").getValue() : null,
                         dc_bg_cap_id: Ext.BG_TYPE == 3 ? Ext.getCmp("dc_bg_cap_id").getValue() : null,
                         i_is_import: Ext.BG_TYPE == 3 ? Ext.getCmp("i_is_import").getValue().inputValue : null,
                         i_year: Ext.BG_TYPE == 3 ? (Ext.getCmp("i_type_year").getValue().inputValue == 1 ? Ext.getCmp("i_year").getValue() - 1 : Ext.getCmp("i_year").getValue()) : Ext.getCmp("i_year").getValue(),
                         i_is_purchase: Ext.getCmp("i_is_purchase").getValue().inputValue,
                         d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
                         ap_process_type_id: Ext.getCmp("ap_process_type_id").getValue(),
                         i_is_doc: Ext.getCmp("i_is_doc").getValue().inputValue,
                         i_is_start_from_contract: i_is_start_from_contract,
                         another_detail: i_is_start_from_contract == 3 ? Ext.getCmp("another_detail").getValue() : null,
                         i_is_fine: Ext.getCmp("i_is_fine").getValue().inputValue,
                         i_fine_per:
                                 Ext.getCmp("i_is_fine").getValue().inputValue == 1
                                 ? Ext.getCmp("i_fine_per")
                                 .getValue()
                                 .replace(/,/g, "")
                                 : null,
                         i_fine_amt:
                                 Ext.getCmp("i_is_fine").getValue().inputValue == 2
                                 ? Ext.getCmp("i_fine_amt")
                                 .getValue()
                                 .replace(/,/g, "")
                                 : null,
                         c_name: Ext.getCmp("c_name").getValue(),
                         c_doc_no: Ext.getCmp("i_is_doc").getValue().inputValue == 1 ? Ext.getCmp("c_doc_no").getValue() : null,
                         d_doc_no_date: Ext.getCmp("i_is_doc").getValue().inputValue == 1 ? Ext.util.Format.date(Ext.getCmp("d_doc_no_date").getValue(), "Y-m-d") : null,
                         c_doc_resp_no: Ext.getCmp("i_is_doc").getValue().inputValue == 2 ? Ext.getCmp("c_doc_resp_no").getValue() : null,
                         d_doc_resp_date: Ext.getCmp("i_is_doc").getValue().inputValue == 2 ? Ext.util.Format.date(Ext.getCmp("d_doc_resp_date").getValue(), "Y-m-d") : null,
                         i_delivery: Ext.getCmp("i_delivery")
                                 .getValue()
                                 .replace(/,/g, ""),
                         dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
                         c_reason_for_po: Ext.getCmp("c_reason_for_po").getValue(),
                         c_comment: Ext.getCmp("c_comment").getValue(),
                         i_is_inv: Ext.BG_TYPE == 2 ? 0 : Ext.getCmp("i_is_inv").getValue() ? 1 : 0
                     },
                     success: function (result, request) {
                         Ext.getCmp("frm-Add")
                                 .getEl()
                                 .unmask();
                         var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                         if (jsonData.success == true) {
                             Ext.store.load({params: {mode: ""}});
                             Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                             Ext.getCmp("id").setValue(jsonData.ap_po_hdr_id);
                             Ext.getCmp("role-form-mode").setValue("EDIT");
                             //							Ext.getCmp("GENCODE").show();
                             boxDetail1(jsonData.ap_po_hdr_id, jsonData.i_is_purchase);
                             boxDetail2(jsonData.ap_po_hdr_id);
                             boxDetail3({ap_po_hdr_id: jsonData.ap_po_hdr_id, i_is_purchase: jsonData.i_is_purchase});
                             boxDetail4({ap_po_hdr_id: jsonData.ap_po_hdr_id});
                         } else {
                             Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                         }
                     },
                     failure: function (result, request) {
                         Ext.MessageBox.alert("Failed", result.responseText); // connect error
                     }
                 });
             } else {
                 Ext.Msg.alert("แจ้งเตือน", msg);
             }
         }; // saveHdr
         /*
          formAdd.superclass.constructor.call(this, {
          region: "center",
          title: "ข้อมูล" + title_panel,
          id: "frm-Add",
          border: false,
          stripeRows: true,
          loadMask: true,
          listeners: {
          afterrender: function(obj, eOpts) {}
          },
          items: [
          {
          xtype: "form",
          id: "form-widgets",
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
          title: "บันทึกข้อมูล " + title_panel,
          RemoveCls: "x-box-item",
          collapsible: true,
          collapsed: false,
          defaults: { labelStyle: "width:200px;", allowBlank: true },
          items: [
          {
          xtype: "hidden",
          id: "role-form-mode",
          name: "mode",
          readOnly: true
          },
          {
          xtype: "hidden",
          id: "id",
          name: "id",
          readOnly: true
          },
          {
          xtype: "displayfield",
          fieldLabel: "ประเภทงบประมาณ",
          value: "<b>" + title_panel + "</b>"
          },
          new Ext.form.ComboBox({
          fieldLabel: "ปีขอจัดซื้อ",
          id: "i_year",
          name: "i_year",
          width: 200,
          mode: "local",
          store: Ext.store_year,
          valueField: "id",
          displayField: "c_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก...",
          value: new Date().getFullYear(),
          listeners: {
          afterrender: function() {
          this.fn = function(chk = true) {
          var val = this.getValue();
          if (val == "") {
          this.reset();
          }
          if (Ext.BG_TYPE == 2) {
          // งบลงทุน
          Ext.getCmp("frm-Add")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
          Ext.bg_hdr.setBaseParam("i_year", val);
          Ext.bg_hdr.load({
          callback: function(records, operation, success) {
          if (success == true) {
          Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
          if (chk == true) {
          Ext.getCmp("bg_hdr_id").setValue("");
          } else {
          Ext.getCmp("bg_hdr_id").setValue(Ext.getCmp("bg_hdr_id").getValue());
          }
          Ext.getCmp("bg_hdr_id").fn(chk);
          }
          }
          });
          } else if (Ext.BG_TYPE == 3) {
          // งบสำรองเร่งด่วน
          if (val == "") {
          val = new Date().getFullYear();
          }
          var index_id = Ext.storeBgYear.findExact("yearPre", "" + val + "");
          var rec = Ext.storeBgYear.data.items[index_id];

          var f_amtOld = floatRenderer(floatMinus(rec.get("f_amtOld").replace(/,/g, ""), 2));
          var f_amtPre = floatRenderer(floatMinus(rec.get("f_amtPre").replace(/,/g, ""), 2));

          Ext.select("#yearOld").update("งบประมาณปี " + (parseInt(rec.get("yearOld")) + 543) + " <font color=red>(วงเงินงบประมาณสำรองเร่งด่วนคงเหลือ = " + f_amtOld + " บาท)</font>");
          Ext.select("#yearPre").update("งบประมาณปี " + (parseInt(rec.get("yearPre")) + 543) + " <font color=red>(วงเงินงบประมาณสำรองเร่งด่วนคงเหลือ = " + f_amtPre + " บาท)</font>");
          }
          };
          },
          Change: function() {
          this.fn();
          },
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          new Ext.form.ComboBox({
          fieldLabel: "จัดซื้อ/จัดจ้างใน",
          id: "bg_hdr_id",
          name: "bg_hdr_id",
          width: 500,
          mode: "local",
          store: Ext.bg_hdr,
          valueField: "id",
          displayField: "c_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก...",
          hidden: Ext.BG_TYPE == 2 ? false : true,
          listeners: {
          afterrender: function() {
          this.fn = function(chk = true) {
          var val = this.getValue();
          if (val == "") {
          this.reset();

          Ext.getCmp("cost_name").setValue("");
          Ext.getCmp("f_amount").setValue("");
          Ext.getCmp("f_res").setValue("");
          Ext.getCmp("sum_bg").setValue("");
          Ext.getCmp("obj_name").setValue("");
          Ext.getCmp("cap_name").setValue("");
          Ext.getCmp("i_year_start").setValue("");
          Ext.getCmp("i_year_end").setValue("");
          Ext.getCmp("dc_cost_id").setValue("");
          } else {
          var index_id = this.getStore().findExact("id", val);
          var rec = this.getStore().data.items[index_id];

          Ext.getCmp("cost_name").setValue(rec.get("cost_name"));
          Ext.getCmp("f_amount").setValue(rec.get("f_amount"));
          Ext.getCmp("f_res").setValue(rec.get("f_res"));
          Ext.getCmp("sum_bg").setValue(rec.get("sum_bg"));
          Ext.getCmp("obj_name").setValue(rec.get("obj_name"));
          Ext.getCmp("cap_name").setValue(rec.get("cap_name"));
          Ext.getCmp("i_year_start").setValue(parseInt(rec.get("i_year_start")) + 543);
          Ext.getCmp("i_year_end").setValue(parseInt(rec.get("i_year_end")) + 543);
          if (chk == true) {
          Ext.getCmp("dc_cost_id").setValue(rec.get("dc_cost_id"));
          }

          if (rec.get("i_is_import") == 1) {
          Ext.getCmp("i_is_import1").setValue(true);
          } else if (rec.get("i_is_import") == 2) {
          Ext.getCmp("i_is_import2").setValue(true);
          } else if (rec.get("i_is_import") == 3) {
          Ext.getCmp("i_is_import3").setValue(true);
          }

          Ext.getCmp("f_amount").fn();
          Ext.getCmp("f_res").fn();
          Ext.getCmp("sum_bg").fn();
          }
          };
          },
          Change: function() {
          this.fn();
          },
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          {
          xtype: "displayfield",
          id: "cost_name",
          fieldLabel: "หน่วยงานเจ้าของงบประมาณ",
          hidden: Ext.BG_TYPE == 2 ? false : true
          },
          new Ext.form.CompositeField({
          fieldLabel: "วงเงินงบประมาณตามแผน",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 2 ? false : true,
          items: [
          new Ext.form.TextField({
          id: "f_amount",
          name: "f_amount",
          style: "text-align: right; color: blue; font-weight: bolder;",
          width: 200,
          readOnly: true,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          }),
          { xtype: "displayfield", value: "บาท" }
          ]
          }),
          new Ext.form.CompositeField({
          fieldLabel: "สำรองราคา",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 2 ? false : true,
          items: [
          new Ext.form.TextField({
          id: "f_res",
          name: "f_res",
          style: "text-align: right; color: blue; font-weight: bolder;",
          width: 200,
          readOnly: true,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          }),
          { xtype: "displayfield", value: "บาท" }
          ]
          }),
          new Ext.form.CompositeField({
          fieldLabel: "รวมเงินทั้งสิ้น",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 2 ? false : true,
          items: [
          new Ext.form.TextField({
          id: "sum_bg",
          name: "sum_bg",
          style: "text-align: right; color: blue; font-weight: bolder;",
          width: 200,
          readOnly: true,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          }),
          { xtype: "displayfield", value: "บาท" }
          ]
          }),
          new Ext.form.TextField({
          fieldLabel: "วัตถุประสงค์",
          id: "obj_name",
          name: "obj_name",
          width: 200,
          hidden: Ext.BG_TYPE == 2 ? false : true,
          readOnly: true
          }),
          new Ext.form.TextField({
          fieldLabel: "การลงทุน",
          id: "cap_name",
          name: "cap_name",
          width: 200,
          hidden: Ext.BG_TYPE == 2 ? false : true,
          readOnly: true
          }),
          new Ext.form.CompositeField({
          fieldLabel: "ปีที่อนุมัติงบประมาณ",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 2 ? false : true,
          items: [
          new Ext.form.TextField({
          id: "i_year_start",
          name: "i_year_start",
          width: 88,
          readOnly: true
          }),
          { xtype: "displayfield", value: "ถึง" },
          new Ext.form.TextField({
          id: "i_year_end",
          name: "i_year_end",
          width: 89,
          readOnly: true
          })
          ]
          }),
          {
          xtype: "radiogroup",
          id: "i_type_year",
          fieldLabel: "ปีที่ขออนุมัติงบประมาณ",
          columns: [500],
          hidden: Ext.BG_TYPE == 3 ? false : true,
          items: [
          { xtype: "displayfield", value: "<b><font color=red>*** กรุณาเลือกใช้เงินของปีงบประมาณเก่าให้หมดก่อนค่อยเลือกปีงบประมาณใหม่ </font></b>" },
          {
          boxLabel: "<span id='yearOld'></span>",
          name: "i_type_year",
          inputValue: 1
          },
          {
          boxLabel: "<span id='yearPre'></span>",
          name: "i_type_year",
          inputValue: 2,
          checked: true
          }
          ]
          },
          {
          xtype: "radiogroup",
          fieldLabel: "ประเภทการจัดหา",
          id: "i_is_import",
          columns: [80, 85, 160],
          disabled: Ext.BG_TYPE == 2 ? true : false,
          hidden: Ext.BG_TYPE == 2 || Ext.BG_TYPE == 3 ? false : true,
          items: [
          {
          boxLabel: "ในประเทศ",
          id: "i_is_import1",
          name: "i_is_import",
          checked: Ext.BG_TYPE == 2 ? false : true,
          inputValue: 1
          },
          {
          boxLabel: "ต่างประเทศ",
          id: "i_is_import2",
          name: "i_is_import",
          inputValue: 2
          },
          {
          boxLabel: "ในประเทศและต่างประเทศ",
          id: "i_is_import3",
          name: "i_is_import",
          inputValue: 3
          }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "วัตถุประสงค์",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 3 ? false : true,
          items: [
          new Ext.form.ComboBox({
          id: "dc_bg_obj_id",
          name: "dc_bg_obj_id",
          store: Ext.dc_bg_object,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 310,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          listeners: {
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          { xtype: "displayfield", value: " <font color='red'>*</font>" }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "ส่วนงาน",
          anchor: "100%",
          msgTarget: "under",
          hidden: Ext.BG_TYPE == 3 ? false : true,
          items: [
          new Ext.form.ComboBox({
          id: "dc_bg_cap_id",
          name: "dc_bg_cap_id",
          store: Ext.dc_bg_capital,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 310,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          listeners: {
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          { xtype: "displayfield", value: " <font color='red'>*</font>" }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "หน่วยงานเจ้าของเรื่อง",
          anchor: "100%",
          msgTarget: "under",
          items: [
          new Ext.form.ComboBox({
          id: "dc_cost_id",
          name: "dc_cost_id",
          store: Ext.dc_cost,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 310,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          listeners: {
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          { xtype: "displayfield", value: " <font color='red'>*</font>" }
          ]
          },
          {
          xtype: "datefield",
          fieldLabel: "วันที่อนุมัติ",
          id: "d_doc_date",
          name: "d_doc_date",
          width: 100,
          value: addY(543)
          },
          {
          xtype: "radiogroup",
          id: "i_is_doc",
          fieldLabel: "เลือกประเภทเอกสาร",
          columns: [205, 200],
          items: [
          {
          boxLabel: "เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
          name: "i_is_doc",
          inputValue: 1,
          checked: true
          },
          {
          boxLabel: "เอกสารรับสนองราคา",
          name: "i_is_doc",
          inputValue: 2
          }
          ],
          listeners: {
          afterrender: function() {
          this.fn = function() {
          if (this.getValue().inputValue == 1) {
          Ext.getCmp("span_doc").show();
          Ext.getCmp("span_doc_resp").hide();
          Ext.getCmp("i_is_start_from_contract0").hide();
          Ext.getCmp("i_is_start_from_contract1").hide();
          Ext.getCmp("i_is_start_from_contract2").show();
          } else {
          Ext.getCmp("span_doc").hide();
          Ext.getCmp("span_doc_resp").show();
          Ext.getCmp("i_is_start_from_contract0").show();
          Ext.getCmp("i_is_start_from_contract1").show();
          Ext.getCmp("i_is_start_from_contract2").hide();
          }
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          },
          {
          xtype: "compositefield",
          fieldLabel: "&nbsp;",
          id: "span_doc",
          anchor: "100%",
          msgTarget: "under",
          hidden: true,
          items: [
          { xtype: "displayfield", value: "เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า" },
          {
          xtype: "textfield",
          id: "c_doc_no",
          name: "c_doc_no"
          },
          { xtype: "displayfield", value: "<font color=red>*</font> วันที่ใบสั่ง" },
          {
          xtype: "datefield",
          id: "d_doc_no_date",
          name: "d_doc_no_date",
          width: 100,
          value: addY(543)
          },
          { xtype: "displayfield", value: "<font color=red>*</font>" }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "&nbsp;",
          id: "span_doc_resp",
          anchor: "100%",
          msgTarget: "under",
          hidden: true,
          items: [
          { xtype: "displayfield", value: "เลขที่เอกสารรับสนองราคา" },
          {
          xtype: "textfield",
          id: "c_doc_resp_no",
          name: "c_doc_resp_no"
          },
          { xtype: "displayfield", value: "<font color=red>*</font> วันที่รับสนองราคา" },
          {
          xtype: "datefield",
          id: "d_doc_resp_date",
          name: "d_doc_resp_date",
          width: 100,
          value: addY(543)
          },
          { xtype: "displayfield", value: "<font color=red>*</font>" }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "เรื่อง",
          anchor: "100%",
          msgTarget: "under",
          items: [
          {
          xtype: "textfield",
          id: "c_name",
          name: "c_name",
          width: 400
          },
          { xtype: "displayfield", value: "<font color=red>*</font>" }
          ]
          },
          {
          xtype: "checkbox",
          id: "i_is_inv",
          name: "i_is_inv",
          boxLabel: "ซื้อวัสดุเข้าคลัง",
          hidden: Ext.BG_TYPE == 2 ? true : false, // งบลงทุนไม่มี
          inputValue: 1
          },
          {
          xtype: "radiogroup",
          fieldLabel: "ขอดำเนินการ",
          id: "i_is_purchase",
          columns: [55, 60, 50],
          items: [
          {
          boxLabel: "จัดซื้อ",
          name: "i_is_purchase",
          checked: true,
          inputValue: 1
          },
          {
          boxLabel: "จัดจ้าง",
          name: "i_is_purchase",
          inputValue: 0
          },
          {
          boxLabel: "จัดเช่า",
          name: "i_is_purchase",
          inputValue: 2
          }
          ]
          },
          {
          xtype: "compositefield",
          fieldLabel: "วิธี",
          anchor: "100%",
          msgTarget: "under",
          items: [
          new Ext.form.ComboBox({
          id: "ap_process_type_id",
          name: "ap_process_type_id",
          store: Ext.ap_process_type,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 200,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          listeners: {
          beforequery: function(q) {
          if (q.query) {
          var length = q.query.length;
          q.query = new RegExp(Ext.escapeRe(q.query));
          q.query.length = length;
          }
          },
          blur: function() {
          this.getStore().clearFilter();
          }
          }
          }),
          { xtype: "displayfield", value: " <font color='red'>*</font>" }
          ]
          },
          {
          xtype: "textarea",
          fieldLabel: "เหตุผลและความจำเป็น",
          id: "c_reason_for_po",
          name: "c_reason_for_po",
          width: 400
          },
          {
          xtype: "textarea",
          fieldLabel: "ข้อมูลการจัดซื้อโดยสรุป",
          id: "c_comment",
          name: "c_comment",
          width: 400
          },
          {
          xtype: "compositefield",
          fieldLabel: "กำหนดส่งภายใน",
          anchor: "100%",
          msgTarget: "under",
          items: [
          {
          xtype: "textfield",
          id: "i_delivery",
          name: "i_delivery",
          style: "text-align: right",
          width: 70,
          value: 1,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 0)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          },
          { xtype: "displayfield", value: "วัน <font color='red'>*</font>" }
          ]
          },
          {
          xtype: "radiogroup",
          id: "i_is_start_from_contract",
          fieldLabel: "นับถัดจาก/นับตั้งแต่",
          columns: [115, 120, 200, 100],
          items: [
          {
          boxLabel: "วันที่รับสนองราคา",
          id: "i_is_start_from_contract0",
          name: "i_is_start_from_contract",
          hidden: true,
          inputValue: 0
          },
          {
          boxLabel: "วันลงนามในสัญญา",
          id: "i_is_start_from_contract1",
          name: "i_is_start_from_contract",
          hidden: true,
          inputValue: 1
          },
          {
          boxLabel: "วันลงนามในใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
          id: "i_is_start_from_contract2",
          name: "i_is_start_from_contract",
          checked: true,
          hidden: true,
          inputValue: 2
          },
          {
          boxLabel: "อื่นๆ",
          id: "i_is_start_from_contract3",
          name: "i_is_start_from_contract",
          inputValue: 3
          }
          ],
          listeners: {
          afterrender: function() {
          this.fn = function() {
          if (this.getValue().inputValue == 3) {
          Ext.getCmp("span_another_detail").show();
          } else {
          Ext.getCmp("span_another_detail").hide();
          }
          };
          },
          Change: function() {
          this.fn();
          }
          }
          },
          {
          xtype: "compositefield",
          id: "span_another_detail",
          fieldLabel: "&nbsp;",
          anchor: "100%",
          msgTarget: "under",
          hidden: true,
          items: [
          {
          xtype: "textfield",
          id: "another_detail",
          name: "another_detail"
          },
          { xtype: "displayfield", value: "<font color=red>(เฉพาะกรณีการเลือกอื่นๆ)</font>" }
          ]
          },
          {
          xtype: "radiogroup",
          id: "i_is_fine",
          fieldLabel: "รายการค่าปรับ",
          columns: [120, 100],
          items: [
          {
          boxLabel: "ค่าปรับคิดเป็น (%)",
          name: "i_is_fine",
          inputValue: 1,
          checked: true
          },
          {
          boxLabel: "ค่าปรับ(บาท)/วัน",
          name: "i_is_fine",
          inputValue: 2
          }
          ],
          listeners: {
          Change: function(value) {
          if (this.getValue().inputValue == 1) {
          Ext.getCmp("span_fine_per").show();
          Ext.getCmp("span_fine_amt").hide();
          } else {
          Ext.getCmp("span_fine_per").hide();
          Ext.getCmp("span_fine_amt").show();
          }
          }
          }
          },
          {
          xtype: "compositefield",
          id: "span_fine_per",
          fieldLabel: "&nbsp;",
          anchor: "100%",
          msgTarget: "under",
          items: [
          {
          xtype: "textfield",
          id: "i_fine_per",
          name: "i_fine_per",
          style: "text-align: right",
          width: 200,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          },
          { xtype: "displayfield", value: "%" }
          ]
          },
          {
          xtype: "compositefield",
          id: "span_fine_amt",
          fieldLabel: "&nbsp;",
          anchor: "100%",
          msgTarget: "under",
          hidden: true,
          items: [
          {
          xtype: "textfield",
          id: "i_fine_amt",
          name: "i_fine_amt",
          style: "text-align: right",
          width: 200,
          listeners: {
          afterrender: function() {
          this.fn = function() {
          this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          };
          },
          Change: function(value) {
          this.fn();
          }
          }
          },
          { xtype: "displayfield", value: "บาท" }
          ]
          }
          ]
          }
          ]
          }
          ],
          buttonAlign: "left",
          buttons: [
          {
          text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
          id: "saveHdr",
          iconCls: "icon-save",
          handler: function() {
          saveHdr();
          }
          },
          {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
          }
          }
          ]
          },
          { border: false, html: "<div id='EXT_boxDetail1' style='padding-top: 10px;'></div>" },
          { border: false, html: "<div id='EXT_boxDetail2' style='padding-top: 10px;'></div>" },
          { border: false, html: "<div id='EXT_boxDetail3' style='padding-top: 10px;'></div>" },
          { border: false, html: "<div id='EXT_boxDetail4' style='padding-top: 10px;'></div>" }
          ]
          });*/
     }; // formAdd
     Ext.extend(formAdd, Ext.Panel, {});

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
 