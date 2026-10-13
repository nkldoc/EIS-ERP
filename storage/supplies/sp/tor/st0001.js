 /* global Ext, user_right_add, user_right_edit, user_right_delete */
 Ext.AppUx = function (app, menu)
 {

     Ext.AppConfig();
     //interlizing
     Ext.menuCode = 'ST0001.1'; //go to
     //
     Ext.status = Ext.runStatus(menu);
     //Load 
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
                     fieldLabel: "ปีงบประมาณ",
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
                                                 },
                                                 {
                                                     xtype: "hidden",
                                                     name: 'dc_emp_id'
                                                 },
                                                 {
                                                     xtype: "hidden", //textfield
                                                     name: 'sp_emp_id'
                                                 }, {
                                                     xtype: "hidden", //hidden
                                                     name: 'dc_department_id'

                                                 }, {
                                                     xtype: disp,
                                                     readOnly: true,
                                                     fieldLabel: 'รหัส PR',
                                                     id: 'codeHdrID',
                                                     style: "text-align: center;font-weight:bold;background:#eee;",
                                                     readOnly: true,
                                                     name: 'c_code'
                                                 }, {
                                                     fieldLabel: "เลขที่สารบัญรับ", 
                                                   //  emptyText: "", //readOnly: true, 
                                                     xtype: 'numberfield', 
                                                     width: 70, 
                                                     name: 'index_receive', 
                                                     id: 'index_receiveID',
                                                    /* validator: function (val)
                                                     {
                                                         if (!Ext.isEmpty(val))
                                                         {
                                                             return true;
                                                         } else
                                                         {
                                                             return "กรุณาระบุ เลขทะเบียนคุมรับเอกสาร TOR";
                                                         }
                                                     }*/
                                                 }, {
                                                     xtype: disp,
                                                     readOnly: true,
                                                     fieldLabel: 'เรื่อง/โครงการ',
                                                     name: 'c_name',
                                                     width: 450,

                                                 },
                                                 comboUsedBgYear,
                                                //  {xtype: 'displayfield', fieldLabel: "ชื่อโครงการ", name: 'c_budget_dtl_project'},
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
                                                                     text: "* วันที่บันทึกรายการ",
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
                                                             xtype: "textfield",
                                                             readOnly: true,
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

                                                     xtype: "buttongroup",
                                                     fieldLabel: "วันที่แจ้งเตือน",
                                                     frame: false,
                                                     border: false,
                                                     items: [
                                                         {
                                                             xtype: "datefield",
                                                             name: "DateAdd1",
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
                                                             text: "* นับการแจ้งเตือนจากวันถัดไปที่บันทึก " + Ext.menu_i_alarm + " วัน"
                                                         }]
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
                                                             boxLabel: "อัพเดทรายการ"
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
     const sp_tor_delete = function (status,menu) {
        var statusx = status;
            new Ext.Window({
            id: "win-msg-cancel",
            title: "เหตุผลในการถูกส่งคืน",
            resizable: false,
            modal: true,
            width: 600,
            // height: 250,
            layout : "form",
            // html: "ท่านต้องการที่จะ ?",
            items:[
                    {
                        fieldLabel : "เหตุผล",
                        xtype: "textarea",
                        name: "tor_delete_comment",
                        width: 400,
                        value: Ext.selectRow.data.tor_delete_comment,
                        id: "tor_delete_commentID",
                        listeners: {
                            afterrender: function () {
                            },
                        },
                    },
            ],
            buttons: [
                {
                    text: "รับรู้เหตุผลในการส่งคืน",
                    iconCls: "icon-table_delete",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                mode: "Recognize_Reason",
                                id: Ext.selectRow.data.id ,
                                sp_status_hdr_id : Ext.selectRow.data.tor_status_id,
                                c_comment_delete : Ext.getCmp("tor_delete_commentID").getValue(),
                                sp_emp_id : Ext.selectRow.data.sp_emp_id ,
                                i_enabled :  2
                                
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                Ext.storeDtl.reload({
                                    callback: function (record, operation, success) {
                                            if (success) {               
                                                Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                Ext.i_is_more = Ext.selectRow.data.i_is_more;
                                                Ext.storeDepartment.setBaseParam("dc_department_id", Ext.selectRow.get("dc_department_id"));
      
                                                var winApp = AppPoStore('edit');
                                                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                winApp.show();
                                                //แบ่งเพรมเลย load ไม่เข้า bug Codex แก้เรื่องเงินหาย
                                                Ext.getCmp("sp_emp_idID_Name").setValue(Ext.selectRow.get("txtsp_emp_idID"));
                                                Ext.getCmp("sp_emp_idID").setValue(Ext.selectRow.get("sp_emp_id"));
                                                }
                                                
                                    }
                                }); 
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("win-msg-cancel").destroy();
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                    });
                                    } else {
                                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                    }
                                },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                            },
                        });
                    },
                },
            ],
        }).show();
        // } 
      };
     Ext.loadStore = function (status, show) {
         var statusx = status;
         var winx = show;
         if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
             Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action)
             {
                 return false;
             });
         else
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
                                                                                                                             } else if (statusx === "edit") {
                                                                                                                                console.log(Ext.selectRow.data);
                                                                                                                                if(Ext.selectRow.data.sp_tor_delete == 1){
                                                                                                                                    sp_tor_delete()
                                                                                                                                    return;
                                                                                                                                }
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
     };
 };
