Ext.HDR_ID = null;
var wp = window.parent || null;
if(wp){ 
//    wp.north.toggleCollapse(false);
    wp.Ext.getCmp('north').collapse(true); 
    wp.Ext.WestGlo.collapse(true); 
}

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

Ext.genToPdf = (set,sign) => {
    
   
var set0 = set || 0; 
    var payLoad = {
        pr_code: Ext.getCmp('d_doc_ref').getValue(),
        document_id: Ext.getCmp('document_idID').getValue(),
        sp_tor_id: Ext.getCmp('sp_tor_idID').getValue(),
        urlfile: Ext.getCmp('urlfileID').getValue(),
//        userId: set0>0?0:Ext.getCmp('sessionID').getValue(),
        userId: set0>0?0:Ext.getCmp('sessionID').getValue(),
//        image: sign?sign:Ext.getCmp('imgSignID').getValue(),
        image: sign,
        dateSign: Ext.util.Format.date(Ext.getCmp('dateSignID').getValue(), 'Y-m-d'), //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
        step_sign: set0>0?0:Ext.getCmp('stepSignID').getValue() || ''
    };
    
    console.log("บันทึกลงนาม",payLoad); 
//     return false;
    Ext.Ajax.request({
        url: '/supplies/gen_pdf_grid',
        method: 'POST',
        jsonData: payLoad,
        success: function (response) {
            try {
                var res = Ext.decode(response.responseText); // แปลง JSON string เป็น object
                if (res.ok) {
                    if(set0>0){
                        Ext.Msg.alert('สำเร็จ', 'แก้ไขเอกสาร PDF เรียบร้อยแล้ว ' + res.message, function () {
//                            Ext.getCmp('panelPreviewID').setText('ลงลายเซ็น PDF เรียบร้อย');
//                            Ext.getCmp('previewSignID').setText('แสดงเอกสาร PDF ');
//                            Ext.example.msg("แจ้งเตือน", 'Save To Status', 3);
                            console.log('📄 ไฟล์บันทึกที่:', res.saved_path);
//                            Ext.previewPDF();
                        });
                    }else{
                        Ext.Msg.alert('สำเร็จ', 'บันทีกลายเซ็นลง PDF ถูกสร้างเรียบร้อยแล้ว ' + res.message, function () {
                            Ext.getCmp('panelPreviewID').setText('ลงลายเซ็น PDF เรียบร้อย');
                            Ext.getCmp('previewSignID').setText('แสดงเอกสาร PDF ');
                            Ext.example.msg("แจ้งเตือน", 'Save To Status', 3);
                            console.log('📄 ไฟล์บันทึกที่:', res.saved_path);
                            
                            Ext.previewPDF();
                        });
                    }

                } else {
                    // ❌ ไม่แสดง Ext.Msg.alert อีกต่อไป
                    console.warn('⚠️ ไม่สามารถสร้าง PDF ได้:', res.message || 'unknown error');
                    Ext.example.msg("แจ้งเตือน", 'ไม่สามารถสร้าง PDF ได้', 3);
                }
      
            } catch (e) {
                Ext.Msg.alert('ข้อผิดพลาด', 'ไม่สามารถอ่านข้อมูลจาก server ได้');
                console.error('Response parse error:', e, response.responseText);
          
            }
        },
        failure: function (response) {
            Ext.Msg.alert('ข้อผิดพลาด', 'การเชื่อมต่อกับ server ล้มเหลว (' + response.status + ')');
            console.error('Server error:', response);
 
        }
    });


}; //genToPdf

Ext.openEditWindow  = ()=>{
                       
                                var win = new Ext.Window({
                                    title: 'เลือกรูปแบบที่ต้องการแก้ไข',
                                    id: 'msgTxtID',
                                    modal: true,
                                    width: 800,
                                    height: 350,
                                    layout: 'fit',
                                    bodyStyle: {background: "#ffffff", "padding": "15px"},
                                   // html: '<div style="font-size:18px; font-weight:normal; ">' + msgTxt + '</div>',
                                    items:[{
                                        xtype: 'radiogroup',
                                        fieldLabel: 'การดำเนินการแก้ไข',
                                        columns: 1,
                                        vertical: true,
                                        name: 'sp_edit_id',
                                        id: 'sp_edit_id',
                                        items: [
            //                            { boxLabel: 'ส่งคืน', name: 'action', inputValue: 'return' },
                                            {boxLabel: 'แก้ไขไฟล์เอกสาร pdfและรายชื่อผู้ลงลงนาม', name: 'action', inputValue: 'all'},
                                            {boxLabel: 'แก้ไขเฉพาะไฟล์เอกสาร pdf', name: 'action', inputValue: 'forward'}
                                        ]
                                    }],
                                    buttonAlign: "center",
                                    buttons: [{
                                            text: 'เลือกวิธการแก้ไข',
                                            icon: '../images/icons/save.png',
                                            id: 'btnApprove',
                                            handler: function () {
                                               // Ext.approved.updateStatus('forward', Ext.getCmp('msgTxtID'));

                                            }
                                        },
                                        {
                                            text: 'ดูเอกสารที่ลงนาม',
                                            icon: '../images/icons/icon_pdf.png', // ต้องมีไฟล์ภาพ
                                            handler: function () {

                                                this.ownerCt.ownerCt.close();
                                                Ext.previewPDF();


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
};
formAdd = function (args) {

    Ext.sing_stemp_doc = [{
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {xtype: "fieldset", flex: 1, margins: "0px 0px", autoHeight: true},
               
            items: [
                {
                    title: "บันทึกข้อมูล " + Ext.title,
                    RemoveCls: "x-box-item",
                    collapsible: true,
                    collapsed: false,
//                defaults: { labelStyle: "width:200px;", allowBlank: true, flex: 1, margins: "0px 3px", autoHeight: true},
             // ✅ Toolbar ด้านบนซ้าย
                tbar: ['->', {
                        text: '🔧 แก้ไขรายการ',
                        icon: '../images/icons/edit.png',
                        id: 'btnEditItemTop',
                        handler: function () {
                            // --- ใส่ logic ของคุณที่นี่ ---
                            Ext.Msg.alert("แก้ไขรายการ", "เรียกหน้าแก้ไขรายการ");
                            // ตัวอย่างเปิดหน้าต่างสำหรับแก้ไข
                            Ext.openEditWindow();
                        }
                    }, ''],
                    items: [
                        {
                            xtype: "hidden",
                            id: "role-form-mode",
                            name: "mode",
                            readOnly: true

                        },
                        {
                            xtype: "hidden",
                            id: "sp_tor_idID",
                            name: "sp_tor_id",
                        },
                        {
                            xtype: "hidden",
                            id: "d_doc_ref",
                            name: "pr_code",
                        },
                        {//sp_approval_hdr_id	c_name	c_code
                            xtype: "hidden",
                            name: "sp_approval_hdr_id",
                        },
                        {//sp_approval_hdr_id	c_name	c_code
                            xtype: "hidden",
                            name: "document_id",
                            id: "document_idID",
                        },
                        {//sp_approval_hdr_id	c_name	c_code
                            xtype: "textfield",
                            name: "msgReturn",
                            id: "msgReturnID"

                        },
                        {
                            xtype: "hidden",
                            name: "imgSign",
                            id: "imgSignID"
                        },
                        {
                            xtype: "textfield",
                            name: "nextUserId", // all ; value:'40050,30047,60630,60520,1',
                            id: "nextUserId", width: 400,
                        },
                        {
                            xtype: "hidden",
                            name: "urlfile",
                            id: "urlfileID", width: 400,

                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "file PDF",
                            id: "urlID",
                            name: "url", readOnly: true,
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
                        }, {
                            xtype: "textfield",
                            id: "stepSignID",
                            name: 'step_sign',
                            fieldLabel: "ขั้นตอนที่ ลงนาม",
                            style: "background:#ccc;font-size: 14px;",
                            width: 100,
                            value: 1
                        },
                        {
                            xtype: "hidden",
                            id: "sessionID",
                            value: Ext.session.user_id
                        },
                        {
                            xtype: "datefield",
                            id: "dateSignID",
                            name: "dateSign",
                            fieldLabel: "วันที่จะลงนาม",
                            style: "background:#ccc;font-size: 14px;",

                        },
                        {
                            xtype: "hidden",
                            id: "evGen",
                            name: "evGen",
                            value: Ext.util.Format.date(new Date(), 'YmdHis')

                        }, {
                            xtype: 'button',
                            id: 'panelshowID',
                            icon: "../images/icons/document_edit.gif",
                            fieldLabel: "ตรวจสอบเอกสารก่อนลงนาม <span style='font-weight:bold; font-size:18px;'>✓</span>",
                            text: '...ตรวจสอบ',
                            handler: function () {
                                Ext.genTabAuditDoc(Ext.getCmp('urlID').getValue());

                            }

                        }

                        , {
                            xtype: 'button',
                            id: 'panelSignID',
                            icon: "../images/icons/text_signature.png",
                            fieldLabel: "ลงนามเอกสาร <span style='font-weight:bold; font-size:18px;'>✓</span>",
                            text: '...ลงลายเซ็น',
                            handler: function () {
                                Ext.genTabSignDoc(Ext.getCmp('urlID').getValue());

                            }
                        }, {
                            xtype: 'button',
                            id: 'panelPreviewID',
                            icon: "../images/icons/table_save.png",
                            fieldLabel: "บันทึกลงเอกสาร PDF <span style='font-weight:bold; font-size:18px;'>✓</span>",
                            text: '...ลงลายเซ็น PDF',
                            handler: function () {
                                Ext.getCmp("frm-Add")
                                        .getEl()
                                        .mask("ระบบกำลังสร้างลายเซ็นและลงนามในเอกสาร....", "x-mask-loading");
                                Ext.genToPdf();

                            }

                        }, {
                            xtype: 'button',
                            id: 'previewSignID',
                            icon: "../images/icons/page_white_acrobat.png",
                            fieldLabel: "เอกสารที่ลงนาม",
                            text: '...',
                            handler: function () {

                                Ext.previewPDF();
                            }
                        }
                    ], buttonAlign: "center",
                    buttons: [{
                            text: "&nbsp; ยืนยันการลงนาม &nbsp;",
                            id: "saveAudit",
                            icon: '../images/icons/save.png',
                            

                        },
                        {
                            text: Ext.GLOBAL_BU_BACK_TH,
                            iconCls: "icon-cancel",
                            handler: function () {
                                Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
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
            afterrender: function (obj, eOpts) {
               
            }
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
            }
        ]
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
