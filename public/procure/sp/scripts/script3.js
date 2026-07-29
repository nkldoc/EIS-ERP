    Ext.loadStore = function (status, show) {
        if (status === 'edit') {

            new Ext.Window({
                layout: 'form',
                id: "win-frmID",
                width: 800,
                title: "รายการวางบิล",
                bodyStyle: "padding:5px;",
                defauls: {background: "#eee", },
//                collapsible: true,
                maximizable: true,
                items: [{
                        xtype: 'form',
                        bodyStyle: "padding:5px;",
                        url: "../FileUploadServletJson",
                        fileUpload: true,
                        id: 'frm-showID',
                        labelWidth: 180,
                        items: [{
                                xtype: "displayfield",
                                fieldLabel: "เลขสัญญา",
                                readOnly: true,
                                name: "contract_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "รหัสวางบิล",
                                readOnly: true,
                                name: "bl_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "รหัสตรวจรับ",
                                readOnly: true,
                                id: "c_codefID",
                                name: "c_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "เลขใบวางบิลจากลูกค้า",
                                readOnly: true,
                                name: "c_doc_ref"
//                            }, {
//                                xtype: "displayfield",
//                                fieldLabel: "รายการ", readOnly: true,
//                                width: 500,
//                                name: "c_name"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "ผู้ขาย/รับจ้าง", readOnly: true,
                                width: 500,
                                name: "dc_creditor_name"
//                            }, {
//                                xtype: "displayfield", readOnly: true,
//                                fieldLabel: "ที่อยู่",
//                                width: 500,
                            }, {
                                xtype: "hidden",
                                name: "dir",
                                id: "dirID",
                                value: "D:\\ExportFile\\"
                            }, {
                                xtype: "fileuploadfield",
                                id: "upload_pdf1",
                                allowBlank: false,
                                width: 300,
                                emptyText: "เลือกไฟล์ (.pdf)",
                                fieldLabel: "เอกสารประกอบ (PDF)",
                                name: "file",
                                buttonText: "",
                                buttonCfg: {
                                    iconCls: "icon-pdf",
                                },
                                validator: function (val) {
                                    if (Ext.isEmpty(val)) {
                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                    } else {
                                        return true;
                                    }
                                },

                            }, {
                                xtype: 'fieldset',
                                title: 'รายละเอียดเอกสาร',
                                id: "fileuploadID",
                                hidden: true,
//                                hidden: (rec.data.dc_tax_customer_id == 0) ? false : true,
//                                collapsible: true,
//                                autoHeight: true,
                                height: Ext.getCmp("contenterCenter").getHeight() - 260,
                                html: '<iframe id="ifpdfID" src="' + window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_ap/' + Ext.selectRow.get('upload_name') + '?T=Tap_' + Math.floor(Math.random() * 100) + '" frameborder="0" width="100%" height="100%"></iframe>',

                            }],
                        listeners: {
                            beforerender: function () {
                                Ext.updateStatu = function (name, id) {

                                    Ext.Ajax.request({
                                        url: "tor/api/mnUpdateController.php",
                                        method: "POST",
                                        params: {mode: "EDIT", fldUpName: name, fldName: "i_is_upload", fldVal: 1, tblName: "sp_check_period_hdr", keyName: "sp_check_period_hdr_id", idVal: id},
                                        success: function (result, request) {
                                            if (request.success) {
                                                Ext.MessageBox.alert("Success", "<span style='white-space: nowrap;'>บันทีกเรียบร้อย</span>", function () {
                                                    Ext.storeDtl.reload({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                //close or showv
                                                                Ext.each(record || {}, function (rec) {
                                                                    if (id == rec.get('id')) {
                                                                        Ext.selectRow = rec;
                                                                    }
                                                                });
                                                                Ext.MessageBox.hide();
                                                                Ext.getCmp("win-frmID").destroy();
                                                                Ext.formPanelMain();
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        },
                                        failure: function (result, request) {
                                            Ext.MessageBox.alert("Failed", result.responseText);
                                        },
                                    });

                                };
                            },
                            afterrender: function () {
                                if (["", null, undefined].includes(Ext.selectRow.get('upload_name'))) {
                                    Ext.getCmp('fileuploadID').hide();
                                } else {
                                    Ext.getCmp('fileuploadID').show();
                                }
                                Ext.getCmp('frm-showID').getForm().loadRecord(Ext.selectRow);
                            }
                        }
                    }],
                buttonAlign: 'left',
                buttons: [{

                        text: "upload เอกสาร",
                        id: "uploadID",
                        hidden: (Ext.appFromAp ? true : false),
                        icon: "../images/icons/folder_up.png",

                        handler: function () {


//                            Error id ไม่ตรงกัน
                            if (Ext.isEmpty(Ext.getCmp("upload_pdf1").getValue())) {
                                Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>กรุณกรอกข้อมูลให้ถูกต้อง</span>");
                                return false;
                            }
                            const myForm = document.getElementById('ext-gen69');  // Our HTML form's ID
                            const myFile = document.getElementById('upload_pdf1-file');  // Our HTML files' ID 
//                            console.log(myFile);
//                            return false;
                            myForm.onsubmit = function () {
                                const dir = "D:\\php_supplies\\api\\upload_ap\\";
                                const files = myFile.files;
                                const formData = new FormData();
                                const file = files[0];
                                const fileNameDoc = Ext.getCmp("c_codefID").getValue() + ".pdf";
                                if (file.type !== "application/pdf") {
                                    console.log(file);
                                    Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>กรุณกรอกข้อมูลให้ถูกต้อง .PDF เท่านั้น </span>");
                                    return false;
                                }
//                                console.log(file.name);
//                                console.log(fileNameDoc);
//                                return false;
//
                                // Add the file to the AJAX request
                                formData.append('file', file, fileNameDoc);
//                                formData.append('file', file, file.name);
                                formData.append('dir', dir);
//                                formData.append('c_code_inv', fileNameDoc);
                                const xhr = new XMLHttpRequest();
                                xhr.open('POST', '../FileUploadServletJson', true);
                                Ext.MessageBox.show({
                                    title: 'โปรแกรมทำงานอยู่',
                                    msg: 'กำลังประมวลผล กรุณารอสักครู่...',
                                    id: 'progressBarID',
                                    progress: true,
                                    width: 400,
                                    closable: false,
                                    wait: true, // ทำให้ MessageBox แสดงเป็นโหมดรอ (มี ProgressBar เคลื่อนไหว)
                                    waitConfig: {interval: 500}, // ตั้งค่าความเร็วในการอัปเดต ProgressBar
                                    icon: Ext.MessageBox.INFO, // แสดงไอคอนข้อมูล
                                    animateTarget: 'progresElID'
                                });
                                xhr.onload = function () {
                                    var jsonData = Ext.util.JSON.decode(xhr.response); //decode json
                                    if (xhr.status == 200) { 
                                        Ext.updateStatu(fileNameDoc, Ext.selectRow.get('id'));
                                    } else {
                                        alert('Upload error. Try again.');
                                    }
                                };
                                xhr.send(formData);
                            }; //End onsubmit
                            if (Ext.selectRow.get('i_is_upload')) {
                                Ext.Msg.show({
                                    title: "แจ้งเตือน!",
                                    msg: "<span style='white-space: nowrap;'>เอกสารได้เคยอัพโหลดแล้ว คุณต้องการที่จะอัพโหลดทับไฟล์เดิม ?</span>",
                                    width: 400,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn, text) {
                                        if (btn === "yes")
                                            myForm.onsubmit();
                                        else
                                            null;
                                    },
                                    icon: Ext.MessageBox.WARNING,
                                });
                            } else {
                                Ext.Msg.show({
                                    title: "ยืนยัน!",
                                    msg: "<span style='white-space: nowrap;'>เอกสารได้เคยอัพโหลดเอกสารส่งเบิก  ?</span>",
                                    width: 400,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn, text) {
                                        if (btn === "yes")
                                            myForm.onsubmit();
                                        else
                                            null;
                                    },
                                    icon: Ext.MessageBox.INFO,
                                });
                            }


                        }

                    },
                      {
                          text: "ปิด",
                          icon: "../images/icons/bullet_cross.png",
                          handler: function () {
                              Ext.getCmp("win-frmID").destroy();
                          }
                      }],

            }).show();
        }
    };