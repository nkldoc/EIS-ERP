formAddDtl = function (args) {
    Ext.ns('Ext.ux.Button');
    Ext.ns('Ext.ux.Grid');
    Ext.ns('Ext.Window');
    
    Ext.sing_stemp_doc = [{
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
            items: [
                {
                    title: "บันทึกข้อมูล " + Ext.title,
                    RemoveCls: "x-box-item",
                    collapsible: true,
                    collapsed: false,
                    defaults: {labelStyle: "width:200px;", allowBlank: true},
                    items: [
                        {
                            xtype: "hidden",
                            id: "role-form-mode",
                            name: "mode",
                            readOnly: true
                        },
                        {
                            xtype: "hidden",
                            id: " step_document_id", //  step_sign status_approve approve_by
                            name: "step_document_id",
                            readOnly: true

                        },
                        {
                            xtype: "hidden",
                            id: "id",
                            name: "id",
                            readOnly: true
                        },
                        /*{
                         xtype: "radiogroup",
                         columns: [150,150],
                         fieldLabel: "รายการอ้างอิง",
                         id: "searchPostID",
                         name: "i_post",
                         items: [
                         {
                         name: "i_post",
                         checked: true,
                         inputValue: 0,
                         boxLabel: "PR ก่อนทำสัญญา",
                         },
                         {
                         name: "i_post",
                         inputValue: 1,
                         boxLabel: "หลังออกเลขสัญญา พวช.",
                         },
                         {
                         name: "i_post",
                         inputValue: 2,
                         boxLabel: "ซื้อ PO",
                         },
                         {
                         name: "i_post",
                         inputValue: 3,
                         boxLabel: "เลขรับของ IR",
                         },
                         ], //radiogroup
                         },*/
//                    PopContForm,
                        new Ext.form.ComboBox({
//new Ext.ux.form.LovCombo({
//                        readOnly: false,
//                        editable: true,
                            fieldLabel: "เอกสารที่ดำเนินการ",
                            mode: "local",
                            store: Ext.sp_status_document_items,
                            id: "approved_document_val",
                            hiddenName: "approved_document_val",
                            name: "approved_document_val",
                            valueField: "id",
                            displayField: "c_name",
                            width: 400,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            resizable: true, // optional for manual resizing
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {
                                    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
                                        Ext.storePrDoc.setBaseParam("type", "PRLISTSTEP02");
//                                        Ext.storeDepartments.setBaseParam("mode", "LIST");
                                        Ext.storePrDoc.setBaseParam("docType", this.getValue());
                                        Ext.storePrDoc.load({
                                            callback: function (record ,operation, success) {
                                                 console.log(record);
                                                 Ext.getCmp("frm-Add").getEl().unmask();
                                            }
                                        }); 
                                    };     
                                },
                                change: function () {
//                                    this.fn();
                                },
                                select: function () {
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
                                expand: function (cb) {
                                    // Automatically adjust list width based on longest option
                                    var max = 0;
                                    cb.store.each(function (rec) {
                                        var len = rec.get(cb.displayField).length;
                                        if (len > max) {
                                            max = len;
                                        }
                                    });

                                    var newWidth = (max * 7) + 30; // 7 is approx avg char width in px
                                    cb.list.setWidth(Math.max(cb.getWidth(), newWidth));
                                }
                            }
                        }),
//                    Ext.wondowPRSel().mini,
                        {
                            xtype: "buttongroup",
                            frame: false,
                            fieldLabel: "รายการ PR อ้างอิง ",
                            items: [
//                            {xtype: "label", text: "รายการ PR อ้างอิง : ", style: "font-size: 14px; "},
//                            {xtype: "tbspacer", width: 4},
                                {
                                    xtype: "textfield",
                                    id: "d_doc_ref",
                                    name: "d_doc_ref",
                                    style: "font-size: 14px;",
                                    width: 100,
                                },
                                {xtype: "tbspacer", width: 4},
                                Ext.PopChoosePRForm.mini 
                            ],
                        },

                        new Ext.ux.form.LovCombo({
                            readOnly: false,
                            editable: true,
                            fieldLabel: "เจ้าหน้าที่ดำเนินการลงนาม",
                            mode: "local",
                            store: Ext.sp_signin_document,
                            id: "sign_step_doc",
                            hiddenName: "sign_step_doc", //sp_signin_document
                            name: "sign_step_doc",
                            valueField: "id",
                            displayField: "c_name",
                            width: 400,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",

                            listeners: {
                                beforerender: function () {
                                    Ext.arr1 = [];
                                },
                                beforeselect: function (t, records, options) {
                                    if (Ext.arr1.length === 3 && records.get('checked') === false) {
                                        Ext.example.msg("", 1);
//                                                    $(this).next("text copied");
                                        setTimeout(function () {
                                            $(this).next().remove();
                                        }, 6000);
                                        return false;
                                    }
                                },
                                select: function (t, records, options) {
                                    if (records.get('checked') === true) {
//                                                    Ext.arr1.push(records.get('id'));
                                    } else {
//                                                    Ext.arr1.shift(records.get('id'));

                                    }
                                }
                            }
                        }),

                        /* new Ext.form.ComboBox({
                         fieldLabel: "เจ้าหน้าที่ดำเนินการ",
                         mode: "local",
                         store: Ext.sp_signin_document,
                         id: "sign_step_doc",
                         hiddenName: "sign_step_doc", //sp_signin_document
                         name: "sign_step_doc",
                         valueField: "id",
                         displayField: "c_name",
                         width: 400,
                         triggerAction: "all",
                         readOnly: true,
                         forceSelection: true,
                         selectOnFocus: true,
                         typeAhead: false,
                         emptyText: "กรุณาเลือก...",
                         editable: false,
                         resizable: true, // optional for manual resizing
                         listeners: {
                         expand: function (cb) {
                         // Automatically adjust list width based on longest option
                         var max = 0;
                         cb.store.each(function (rec) {
                         var len = rec.get(cb.displayField).length;
                         if (len > max) {
                         max = len;
                         }
                         });
                         
                         var newWidth = (max * 7) + 30; // 7 is approx avg char width in px
                         cb.list.setWidth(Math.max(cb.getWidth(), newWidth));
                         }
                         }
                         }),*/
                        {
                            xtype: "textfield",
                            fieldLabel: "ผู้ดำเนินการ",
                            id: "c_name",
                            name: "c_name",
                            width: 400,
                        },
                        {
                            xtype: "textarea",
                            fieldLabel: "หมายเหตุ",
                            id: "c_comment",
                            name: "c_comment",
                            emptyText: "กรุณาเลือก...",
                            width: 400,
                        }, {
                            xtype: "radiogroup",
                            id: "text_pdf_up",
                            columns: 1,
                            hidden: false,
                            items: [
                                {
                                    xtype: "label",
                                    html: `
                              <span style='color:blue; font-size: 15px;'>
                              *กรุณาแนบเอกสารใบขอเบิกที่ผู้ขอเบิกลงนามแล้ว + เอกสารประกอบ
                              <br>(ผู้ขอเบิกไม่ต้องเข้ามากดภายในระบบหลังจากขั้นตอนนี้)
                              </span>
                              `,
                                },
                            ],
                        },
                    ]
                }]}];

    formAddDtl.superclass.constructor.call(this, {
        region: "center",
        title: "ข้อมูล " + Ext.title,
        iconCls: "icon-application-form-add",
        id: "frm-Add",
        border: false,
        stripeRows: true,
        loadMask: true,
        listeners: {
            afterrender: function (obj, eOpts) {}
        },
        items: [
            {
                xtype: "form",
                id: "form-widgets",
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
//        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false, },
                defaults: {labelStyle: "width:200px;", allowBlank: true},
                items:[],
//                items: Ext.sing_stemp_doc,
                buttonAlign: "left",
                buttons: [
                    {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        disabled: Ext.butt == "ADD" || Ext.butt == "EDIT" ? false : true,
                        handler: function () {
                            preview(true);
                            
                            return false;
                            saveHdr(false);
                        }
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                        }
                    }
                ]
            }
        ]
    });
}; // formAdd
Ext.extend(formAddDtl, Ext.Panel, {});