Ext.HDR_ID = null;

const saveHdr = function (type) {
    let msg = "";
    if (Ext.getCmp("c_name").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอก ผู้ดำเนินการ</span><br>";
    }

    if (msg == "") {
        Ext.getCmp("frm-Add")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "api/mn_poEmp.php",
            method: "POST",
            params: {
                mode: Ext.getCmp("role-form-mode").getValue(),
                id: Ext.getCmp("id").getValue(),
                c_name: Ext.getCmp("c_name").getValue(),
                c_comment: Ext.getCmp("c_comment").getValue()
            },
            success: function (result, request) {
                Ext.getCmp("frm-Add")
                        .getEl()
                        .unmask();
                let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success == true) {
                    Ext.store.load({params: {mode: ""}});
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
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
const Obj_MutiSave = [
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "วันที่ทำรายการ : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "datefield",
                id: "d_doc_date",
                style: "font-size: 14px;",
                width: 100,
            },
            {xtype: "tbspacer", width: 100},
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "รักษาการแทน : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "checkbox",
                id: "i_instead_cost_sign",
                // boxLabel: "รักษาการแทน",
                inputValue: 1,
                checked: false,
                listeners: {
                    check: function (combo, newValue) {
                        if (newValue) {
                            Ext.getCmp("c_instead_cost_sign").show();
                            Ext.getCmp("c_instead_cost_sign").setValue("รักษาการแทนหัวหน้าฝ่าย");
                        } else {
                            Ext.getCmp("c_instead_cost_sign").hide();
                        }
                    },
                },
            },
            {xtype: "tbspacer", width: 183},
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            // { xtype: "tbspacer", width: 4 },
            {
                xtype: "textfield",
                hidden: true,
                id: "c_instead_cost_sign",
                name: "c_instead_cost_sign",
                style: "color: blue;",
                width: 200,
                value: "รักษาการแทนหัวหน้าฝ่าย",
            },
            {xtype: "tbspacer", width: 201},
                    // { xtype: "tbspacer", width: 100 },
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "หมายเหตุ : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "textarea",
                fieldLabel: "หมายเหตุ",
                id: "c_comment_status",
                height: 40, // Set the height here
                width: 200,
            },
        ],
    },
]; // Obj_MutiSave
// Class Extend


/*Ext.sing_stemp_doc1 = [
 {
 xtype: "form",
 id: "form-widgets",
 fileUpload: true,
 frame: true,
 labelAlign: "right",
 labelWidth: 200,
 bodyStyle: { padding: "10px 20px" },
 defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
 items: [
 new Ext.toolbar_btn_menu({
 id: "btn_menu",
 }).mini,
 {
 xtype: "container",
 layout: "hbox",
 align: "stretch",
 RemoveHeight: true,
 defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
 items: [
 {
 title: "บันทึกข้อมูล " + Ext.title_panel,
 RemoveCls: "x-box-item",
 collapsible: true,
 collapsed: false,
 defaults: { labelStyle: "width:200px;", allowBlank: true },
 items: [
 {
 xtype: "hidden",
 id: "role-form-mode",
 name: "mode",
 readOnly: true,
 },
 {
 xtype: "hidden",
 id: "id",
 name: "id",
 readOnly: true,
 },
 {
 xtype: "textfield",
 fieldLabel: "เลขที่ใบขอเบิก",
 id: "c_code",
 name: "c_code",
 style: "text-align:center; font-weight:bold; background:#eee;",
 width: 180,
 readOnly: true,
 },
 {
 xtype: "datefield",
 fieldLabel: "วันที่เจ้าหน้าที่ลงนาม",
 name: "d_status_date",
 id: "d_doc_date",
 },
 {
 xtype: "textarea",
 fieldLabel: "หมายเหตุ",
 id: "c_comment_status",
 name: "c_comment_status",
 width: 300,
 },
 {
 xtype: "checkbox",
 id: "i_cost_sign_out",
 style: {
 width: "19px",
 height: "19px",
 },
 boxLabel: "<b style='color: red; font-size: 18px;'>ผู้ขอเบิกลงนามนอกระบบ</b>",
 hidden: Ext.dataSelect.i_inside_cost != 1 ? false : true,
 inputValue: 1,
 checked: false,
 listeners: {
 afterrender: function () {
 setTimeout(() => {
 Ext.getCmp("upload_pdf").hide();
 }, 50);
 },
 check: function (combo, newValue) {
 if (newValue) {
 Ext.getCmp("text_pdf_up").show();
 Ext.getCmp("upload_pdf").show();
 } else {
 Ext.getCmp("text_pdf_up").hide();
 Ext.getCmp("upload_pdf").hide();
 }
 },
 },
 },
 {
 xtype: "radiogroup",
 id: "text_pdf_up",
 columns: 1,
 hidden: true,
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
 new Ext.ux.FileUpload({
 id: "upload_pdf",
 constructorForm: "frm-Add",
 uploadLabel: "เอกสาร (PDF)",
 uploadEmptyText: "แก้ไขเอกสารประกอบใบเบิก* เลือกไฟล์ (.pdf)",
 buttonText: "ดาวน์โหลดเอกสารประกอบใบเบิก",
 fileExt: "pdf",
 iconCls: "icon-pdf",
 editForm: false,
 width: 300,
 // hidden: true,
 btnViewClick: function () {
 Po_OpenPdf(Ext.dataSelect.pdf_dtl, Ext.dataSelect.c_code);
 },
 fileSelecte: function () {},
 }).mini,
 
 // new Ext.ux.FileUpload({
 //   id: "upload_pdf",
 //   constructorForm: "frm-Add",
 //   uploadLabel: "เอกสาร (PDF)",
 //   uploadEmptyText: "แก้ไขเอกสารประกอบใบเบิก* เลือกไฟล์ (.pdf)",
 //   buttonText: "ดาวน์โหลดเอกสารประกอบใบเบิก",
 //   fileExt: "pdf",
 //   iconCls: "icon-pdf",
 //   editForm: Ext.i_status <= Ext.I_STATUS_BEFORE ? false : true,
 //   width: 300,
 //   // hidden: true,
 //   btnViewClick: function () {
 //     Po_OpenPdf(Ext.dataSelect.pdf_dtl, Ext.dataSelect.c_code);
 //   },
 //   fileSelecte: function () {},
 // }).mini,
 ],
 },
 ],
 },
 ],
 buttonAlign: "left",
 buttons: [
 {
 text: "&nbsp;เจ้าหน้าที่ลงนาม&nbsp;",
 id: "btn_save_hdr",
 iconCls: "icon-save",
 disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
 handler: function () {
 if (Ext.SING_CONFIG) {
 win_input_pin();
 } else {
 var vv = Ext.dataSelect.i_sub_status;
 var type = vv == Ext.I_SUB_STATUS_BEFORE ? "ADD" : "EDIT";
 saveHdr(type);
 }
 },
 listeners: {
 afterrender: function () {
 var vv = Ext.dataSelect.i_sub_status;
 if (vv == Ext.I_SUB_STATUS_BEFORE) {
 btn_set_color(this, "green"); //color : green, red, yellow, orange
 Ext.getCmp("btn_save_hdr").enable();
 } else if (vv == Ext.I_SUB_STATUS) {
 btn_set_color(this, "yellow"); //color : green, red, yellow, orange
 Ext.getCmp("btn_save_hdr").setText("&nbsp;บันทึกการแก้ไข&nbsp;");
 } else {
 btn_set_color(this, "yellow"); //color : green, red, yellow, orange
 Ext.getCmp("btn_save_hdr").disable();
 Ext.getCmp("btn_save_hdr").setText("&nbsp;บันทึกการแก้ไข&nbsp;");
 }
 },
 },
 },
 {
 text: Ext.GLOBAL_BU_BACK_TH,
 handler: function () {
 Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
 Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {};
 },
 },
 ],
 },
 ];*/
formAdd = function (args) {
    console.log(" Ext.rec ", Ext.rec);
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
//                defaults: { labelStyle: "width:200px;", allowBlank: true, flex: 1, margins: "0px 3px", autoHeight: true},
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
                        {//sp_approval_hdr_id	c_name	c_code
                            xtype: "hidden",
                            name: "sp_approval_hdr_id",
                        },
                        {//sp_approval_hdr_id	c_name	c_code
                            xtype: "hidden",
                            name: "msgReturn",
                            id: "msgReturnID"

                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "รหัสเอกสาร",
                            id: "c_code",
                            name: "c_code", readOnly: true,
                            width: 400,
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "รหัสเอกสารอ้างอิง",
                            id: "c_code_detail",
                            name: "c_code_detail", readOnly: true,
                            width: 400,
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "เอกสาร",
                            id: "c_name",
                            name: "c_name", readOnly: true,
                            width: 400,
                        },

                        {
                            xtype: "datefield",
                            fieldLabel: "วันที่ลงนาม",
                            id: "sign_dtID", readOnly: true,
                            name: "sign_dt",
                            value: Ext.util.Format.date(new Date(), 'd-m-Y')
                        },
                        {
                            xtype: "hidden",
                            id: "evGen",
                            name: "evGen",
                            value: Ext.util.Format.date(new Date(), 'YmdHis')

                        }, {
                            xtype: 'button',
                            id: 'panelshowID',
                            icon: "../images/icons/text_signature.png",
                            fieldLabel: "สร้างลายเซ็นต์",
                            text: '...',
                            handler: function () {
                                var BOOLE = true;
                                var win = new Ext.Window({
                                    id: "MessageBox_re",
                                    title: "สร้างลายเซ็น ",
//                                    maximizable: true,
//                                    resizable: true,
                                    maximized: true, // <-- แสดงแบบเต็มหน้าจอทันที
                                    width: 1100,
                                    height: 500,
//        frame:false,
                                    html: '<iframe src="../upload/draw.php?_evGen=' + Ext.getCmp('evGen').getValue() + '" frameborder="0" width="100%" height="100%"></iframe>',
                                    buttonAlign: "left",
                                    buttons: [
                                        {
                                            text: "บันทึกรายการ",
                                            id: "btn_save-MessageBox_re",
                                            icon: false ? "../images/icons/delete.png" : "../images/icons/yes.gif",
                                            listeners: {
                                                afterrender: function () {
                                                    btn_set_color(this, false ? "red" : "green"); //color : green, red, yellow, orange
                                                },
                                            },
                                            handler: function () {
                                                let msg = "";
                                                if (msg == "") {
                                                    Ext.Msg.wait("Uploading...");

                                                } else {
                                                    Ext.Msg.alert("แจ้งเตือนddd", msg);
                                                }
                                            },
                                        },
                                        {
                                            text: "ย้อนกลับ",
                                            icon: "../images/icons/delete.png",
                                            handler: function () {
                                                Ext.getCmp("MessageBox_re").hide();
                                                Ext.getCmp("MessageBox_re").destroy();
                                            },
                                        },
                                    ]
                                }).show();   // <-- แสดงแบบเต็มหน้าจอหลังจากเปิด
                            }
//                    }, {
//                        xtype:'panel',
//                        id:'panelID',
//                        html:'ssssssssss'
                            /*   }, {
                             xtype: "radiogroup",
                             id: "text_pdf_up",
                             columns: 1,
                             hidden: false,
                             items: [{
                             xtype: "checkbox",
                             id: "i_instead_cost_sign",
                             boxLabel: "รักษาการแทน",
                             inputValue: 1,
                             checked: false,
                             listeners: {
                             check: function (combo, newValue) {
                             if (newValue) {
                             //                                                    Ext.getCmp("c_instead_cost_sign").show();
                             //                                                    Ext.getCmp("c_instead_cost_sign").setValue("รักษาการแทนหัวหน้าฝ่าย");
                             } else {
                             //                                                    Ext.getCmp("c_instead_cost_sign").hide();
                             }
                             },
                             },
                             },
                             {
                             xtype: "label",
                             html:` <span style='color:red; font-size: 15px;'> * ลงนามแทน(ชื่อจะขึ้นในเอกสารรักษาการแทน)   </span> ` 
                             } 
                             ] */
                        }, {
                            xtype: 'button',
                            id: 'previewSignID',
                            icon: "../images/icons/application_view_gallery.png",
                            fieldLabel: "เอกสารที่ลงนาม",
                            text: '...',
                            handler: function () {
                                addTabPreviewSign(Ext.rec.get('c_filename'), Ext.rec.get('c_dir'));
                            }
                        }
                    ]
                }]}];

    formAdd.superclass.constructor.call(this, {
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
                defaults: {labelStyle: "width:200px;", allowBlank: true},
                items: Ext.sing_stemp_doc,
                buttonAlign: "left",
                buttons: [
                    {
                        text: "&nbsp; บันทึกลงนามเอกสาร &nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        disabled: Ext.butt == "ADD" || Ext.butt == "EDIT" ? false : true,
                        handler: function () {
                            //saveHdr(false);
                            var msgTxt = "ยืนการการลงนามอย่างสมบูรณ์";
                            var win = new Ext.Window({
                                title: msgTxt,
                                modal: true,
                                width: 500,
                                height: 150,
                                layout: 'fit',
                                html: '<div style="font-size:24px;font-weight:bold; padding:15px;">' + msgTxt + '</div>',
                                buttons: [{
                                        text: 'ยืนยันบันทึกการลงนาม',
                                        iconCls: "icon-save",
                                        handler: function () {
                                            Ext.example.msg("แจ้งเตือน", 'Save To Status', 3);
                                            this.ownerCt.ownerCt.close();
                                        }
                                    },
                                    {
                                        text: 'ดูเอกสารที่ลงนาม',
                                        icon: '../images/icons/icon_pdf.png', // ต้องมีไฟล์ภาพ
                                        handler: function () {
                                            addTabPreviewSign(Ext.rec.get('c_filename'), Ext.rec.get('c_dir'));
                                            Ext.getCmp("MessageBox_re").close();
                                            this.ownerCt.ownerCt.close();

                                        }
                                   
                                    },
                                    {
                                        text: 'ยกเลิก',
                                        icon: '../images/icons/application_form_delete.png',
                                        handler: function () {
                                            console.log('ยกเลิก');
                                            this.ownerCt.ownerCt.close();
                                        }
                                    }
                                ]
                            }).show();
                        }
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        iconCls: "icon-cancel",
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                        }
                    }
                ]
            }
        ]
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
