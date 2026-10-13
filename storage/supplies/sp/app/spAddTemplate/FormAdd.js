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

Ext.fnTrigger = (combo) => {
    combo.store.load({
	   callback: function () {
		  combo.onTriggerClick(); // Auto-open dropdown 
	   }
    });
};

formAdd = function (args) {
    Ext.ns('Ext.ux.Button');
    Ext.ns('Ext.ux.Grid');
    Ext.ns('Ext.Window');
    Ext.rec = args;
    var store = new Ext.data.JsonStore({
	   storeId: "myStore",
	   autoDestroy: false,
	   autoLoad: true,
	   url: "./api/ListDcUser.php",
	   baseParams: {
		  i_read: user_right_read,
	   }, //Permission i_read
	   root: "data",
	   idProperty: "id",
	   totalProperty: "totalCount",
	   fields: [
		  {name: "no", type: "int"},
		  {name: "id"},
		  {name: "menu_hdr_id"},
		  {name: "dc_user_id"},
		  {name: "dc_emp_id"},
		  {name: "c_name"},
		  {name: "c_full_name"},
		  {name: "full_name"},
		  {name: "position_name"},
		  {name: "action"},
		  {name: "org_name"},
		  {name: "i_signer"},
		  {name: "i_audit"}, //i_audit i_signer
		  {
			 name: 'sign_date'
		  },
		  {name: "row"},
		  {name: "col"},
		  {name: "type_id"},
		  {name: "line"},
		  {name: "page"},
		  {name: "position_x"},
		  {name: "position_y"},
		  //  type_id	page	position_x	position_y	line
//type_id,	line,	dc_user_id,	full_name,	position_name,	action,	org_name,	sign_date,	row,	col             
		  {name: "dc_cost_id"},
		  {name: "c_user_name"},
		  {name: "c_sub_name_eng"},
		  {name: "c_email"},
		  {name: "c_name"},
		  {name: "c_password"},
		  {name: "c_comment"},
		  {name: "i_type_user"},
		  {name: "i_enable"},
		  {name: "i_delete"},
		  {name: "dc_user_create_id"},
		  {name: "dc_user_create_cost_id"},
		  {name: "d_create"},
		  {name: "dc_user_update_id"},
		  {name: "dc_user_update_cost_id"},
		  {name: "d_update"},
	   ]
    });
    Ext.customEditor = new Ext.form.TriggerField({
	   triggerClass: 'x-form-search-trigger', // shows the search icon
	   editable: false,
	   onTriggerClick: function () {
		  // Show your custom window here


		  if (!Ext.getCmp('win-grid-empID')) {

			 var ss = new Ext.Window({
				title: 'บันทีกผู้ลงนาม',
				id: 'win-grid-empID',
//                    modal: true,
				maximizable: true,
				closable: true,
				listeners: {
				    afterrender: function (obj, eOpts)
				    {

					   this.fn = function (d, h) { //percentage
						  var width = Ext.getBody().getViewSize().width * d;
						  var height = Ext.getBody().getViewSize().height * h;
						  this.setSize(width, height);
						  this.setTitle(Ext.getCmp('tabpanelGridEmp').lastSelectionText);
					   };
					   this.fn(0.8, 0.8);
				    },
				    "maximize": function (window, opts) { //when property minimizable
					   window.setWidth(Ext.getBody().getViewSize().width * 0.99);
					   window.setHeight(Ext.getBody().getViewSize().height * 0.99);
					   window.expand('', false);
					   window.center();
					   Ext.getCmp('tabpanelGridEmp').setWidth(Ext.getBody().getViewSize().width * 0.98);
					   Ext.getCmp('tabpanelGridEmp').setHeight(Ext.getBody().getViewSize().height * 0.98);
				    }
				},
				items: [{

					   title: "แสดงข้อมูลผู้ใช้งานระบบ",
					   xtype: "grid",
					   id: "tabpanelGridEmp",
					   border: false,
					   stripeRows: true,
					   layout: {
						  type: 'vbox',
						  align: 'stretch'  // Child items are stretched to full width
					   },
					   defaults: {
						  xtype: 'textfield'
					   },
					   listeners: {
						  afterrender: function (obj, eOpts)
						  {
							 cellClick_choose = (grid, rowIndex, columnIndex, e) => {

								var rec = Ext.getCmp('tabpanelGridEmp').getStore().getAt(rowIndex);
								var dateTypeVal = Ext.getCmp('dateTypeID').getValue();
								var date_set = (dateTypeVal.inputValue !== 1) ? '' : rec.get("sign_date");
								if (rec) {
								    var gridSub = Ext.getCmp('grid-step-sign-doc').getSelectionModel().getSelectedCell();
								    var recs = Ext.getCmp('grid-step-sign-doc').getStore().getAt(gridSub[0]);
								    Ext.approveLine = 5; //line approved
								    Ext.action = (recs.get('line') == Ext.approveLine) ? "ปฏิบัติการแทนอธิการบดี" : "คณะแพทยศาสตร์วชิรพยาบาล";
								    Ext.orgName = "มหาวิทยาลัยนวมินทราธิราช";
								    recs.set("line", recs.get('line')); //i_audit i_signer
								    recs.set("i_audit", recs.get('i_audit')); //i_audit i_signer
								    recs.set("i_signer", recs.get('i_signer')); //i_audit i_signer
								    recs.set("dc_user_id", rec.get('dc_user_id'));
								    recs.set("dc_emp_id", rec.get('dc_emp_id'));
								    recs.set("full_name", "(" + rec.get('c_full_name') + ")");
								    recs.set("position_name", rec.get('position_name'));
								    recs.set("action", Ext.action);
								    recs.set("org_name", Ext.orgName);
								    recs.set("c_approved", rec.get("org_name"));
								    recs.set("sign_date", date_set);
//                                            recs.commit();
								    Ext.getCmp('win-grid-empID').destroy();
								} else {
								    Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบ");
								}

							 };
							 this.on('cellclick', cellClick_choose, this);
							 this.fn = function (d, h) { //percentage
								var width = Ext.getBody().getViewSize().width * d;
								var height = Ext.getBody().getViewSize().height * h;
								this.setSize(width, height);
								this.setTitle(Ext.getCmp('tabpanelGridEmp').lastSelectionText);
							 };
							 this.fn(0.79, 0.8);
						  },
					   },
					   loadMask: true,
					   store: store,
					   tbar: ["",
						  "", new Ext.form.TwinTriggerField({
							 xtype: 'twintriggerfield',
							 text: "ค้นหาจากใบล่าสุด",
							 trigger1Class: 'x-form-clear-trigger',
							 trigger2Class: 'x-form-search-trigger',
							 listeners: {
								specialkey: function (field, e) {
								    if (e.getKey() === e.ENTER) {
									   if (field.getValue() !== "") {
										  field.onTrigger2Click(); //  
									   } else {
										  field.onTrigger1Click(); //  
									   }
								    }
								}
							 },
							 onTrigger1Click: function () {
								this.setValue('');
								store.setBaseParam("mode", "");
								Ext.getCmp("tabpanelGridEmp").getStore().load();
							 }, onTrigger2Click: function () {
//                                        alert(2);
								store.setBaseParam("mode", "SEARCH");
								store.setBaseParam("filter", Ext.getCmp("filterEmpID").getValue());
								store.setBaseParam("value", this.getValue());
								Ext.getCmp("tabpanelGridEmp").getStore().load();
							 }
						  }), {
							 text: "ค้นหาจากใบล่าสุด",
							 iconCls: "icon-magnifier",
							 handler: function () {
								store.setBaseParam("mode", "LastGenDoc");
								Ext.getCmp("tabpanelGridEmp").getStore().load();
							 }
						  },
						  {
							 xtype: "tbfill",
						  },
						  "",
						  "",
						  "-",
						  {
							 id: "filterEmpID",
							 xtype: "combo",
							 width: 130,
							 mode: "local",
							 store: new Ext.data.SimpleStore({
								fields: ["value", "text"],
								data: [
								    ["c_full_name", "ชื่อพนักงาน"],
								    ["c_user_name", "ชื่อผู้ใช้งานระบบ"],
								],
							 }),
							 valueField: "value",
							 displayField: "text",
							 allowBlank: false,
							 editable: false,
							 triggerAction: "all",
							 typeAhead: false,
							 value: "c_full_name",
						  },
						  "-"
					   ],
					   columns: [
						  new Ext.grid.RowNumberer({
							 width: 35,
							 header: " No ",
							 renderer: function (value, metaData, record, row, col, store, gridView) {
								return record.get("no");
							 },
						  }),
						  {
							 header: "ID System",
							 sortable: true,
							 hidden: true,
							 dataIndex: "id",
						  },
						  {
							 header: "อัพเดทเมนู",
							 sortable: true,
							 dataIndex: "id",
							 renderer: function (value, metaData, record, row, col, store, gridView) {
								return record.get("menu_hdr_id") > 0 ? '<button id="buUpdaeMenu" onclick="Ext.runx(' + record.get("menu_hdr_id") + "," + record.get("id") + ')">updateMenu</button>' : "";
							 },
						  },
						  {
							 header: "ชื่อผู้ใช้งานระบบ",
							 sortable: true,
							 dataIndex: "c_user_name",
						  },
						  {
							 id: "c_full_name",
							 header: "ชื่อพนักงาน",
							 sortable: true,
							 dataIndex: "c_full_name",
						  },
						  {
							 sortable: false,
							 width: 150,
							 align: "center",
							 renderer: function (value, metaData, record, row, col, store, gridView) {
								return record.get("i_enable") ? '<img src="../../images/icons/yes.gif");/>' : '<img src="../../images/icons/no.gif");/>';
							 },
						  },
					   ],
					   clicksToEdit: 1,
					   autoExpandColumn: "c_full_name",
					   bbar: (pagingBar = new Ext.PagingToolbar({
						  pageSize: 20,
						  store: store,
						  displayInfo: true,
						  displayMsg: "Displaying topics {0} - {1} of {2}",
					   })),
				    }]
			 }).show();
		  }
	   }
    });
    // === ฟังก์ชันแปลงวันที่ พ.ศ. (dd-mm-2568) -> Date(ค.ศ.) ===
    function parseThaiBE(ddmmyyyy) {
	   if (!ddmmyyyy)
		  return null;
	   var m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(ddmmyyyy);
	   if (!m)
		  return null;
	   var d = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, y = parseInt(m[3], 10);
	   // แปลง BE -> AD
	   if (y >= 2400)
		  y -= 543;
	   return new Date(y, mo, d);
    }



    var previewPDF = () => {
	   // ฟังก์ชันสร้าง iframe HTML
	   function iframeHtml(url) {
		  return `<iframe src="${url}" 
                   width="100%" 
                   height="100%" 
                   frameborder="0" 
                   style="border:none;"></iframe>`;
	   }

// ดึง tabPanel หลัก
	   var tabPanel = Ext.getCmp('contenterCenter');

	   /**
	    * Comment
	    */
	   function stepPreview(url, step) {
		  if (!url || typeof url !== "string")
			 return "";

		  // แยก path ออกเป็นส่วน ๆ โดยรองรับทั้ง / และ \
		  var parts = url.split(/[\/\\]+/);

		  if (parts.length < 4) {
			 console.warn("Invalid URL format:", url);
			 return url; // คืนค่าเดิมถ้ารูปแบบไม่ถูก
		  }

		  var year = parts[0];      // เช่น 2025
		  var prCode = parts[1];    // เช่น PR25680400078
		  var fileName = parts[3];  // เช่น PR25680400078_1_1.pdf

		  let urlPath;
		  if (step == '') {
			 // step 0 → ใช้ path เดิม
			 urlPath = `${year}/${prCode}/input/${fileName}`;
		  } else if (step === 0) {
			 // step 0 → ใช้ path เดิม
			 urlPath = `${year}/${prCode}/${step}_${fileName}`;
		  } else {
			 // step > 0 → เปลี่ยนชื่อไฟล์ตามรูปแบบที่ต้องการ
			 urlPath = `${year}/${prCode}/${step}_${fileName}`;
		  }
//alert(urlPath);
		  return urlPath;
	   }


	   if (tabPanel) {
		  // ตรวจสอบว่ามีแท็บ prw แล้วหรือยัง
		  var tabId = 'tab-prw';
		  var existingTab = tabPanel.getComponent(tabId);
		  var urlPath = stepPreview(Ext.getCmp('urlID').getValue(), Ext.getCmp('stepSignID').getValue() || '');

		  if (!existingTab) {
			 // ถ้ายังไม่มี -> เพิ่มแท็บใหม่
			 tabPanel.add({
				id: tabId,
				title: 'PRW Document',
				iconCls: 'icon-vcard', // ใช้ไอคอนตามต้องการ
				closable: true,
				layout: 'fit',
				html: iframeHtml('list_pdf.php?__dc=' + Math.random() + '&path=' + urlPath)
			 });
			 // แสดงแท็บที่เพิ่มขึ้นมา
			 tabPanel.setActiveTab(tabId);
		  } else {
			 // ถ้ามีแท็บอยู่แล้ว -> สลับไปที่แท็บนั้น
//                tabPanel.setActiveTab(existingTab);
			 existingTab.destroy();
			 tabPanel.add({
				id: tabId,
				title: 'PRW Document',
				iconCls: 'icon-vcard', // ใช้ไอคอนตามต้องการ
				closable: true,
				layout: 'fit',
				html: iframeHtml('list_pdf.php?__dc=' + Math.random() + '&path=' + urlPath)
			 });
			 // แสดงแท็บที่เพิ่มขึ้นมา
			 tabPanel.setActiveTab(tabId);
		  }
	   } else {
		  console.error('tabMainID not found!');
	   }
//        alert(Ext.getCmp('urlID').getValue());
	   function openPrwTab() {
		  var tabPanel = Ext.getCmp('contenterCenter');
		  if (!tabPanel)
			 return;
		  var tabId = 'tab-prw';
		  var existing = tabPanel.getComponent(tabId);
		  if (existing) {
			 tabPanel.setActiveTab(existing);
		  } else {
			 tabPanel.add({
				id: tabId,
				title: 'PREVIEW Document PDF Setting',
				iconCls: 'icon-pr',
				closable: true,
				html: iframeHtml('list_pdf.php?__dc=' + Math.random() + '&path=' + Ext.getCmp('urlID').getValue())
			 }).show();
		  }
	   }
	   return openPrwTab();
    };

    var genToPdf = () => {
	   window.parent.Ext.getCmp("settingID").getEl().mask("กรุณาสักครู่ระบบกำลังสร้าง PDF ", "x-mask-loading");

	   var imageData = "data:image/png;base64,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";

//        const imageData = canvas.toDataURL('image/png');
	   var payLoad = {
		  pr_code: Ext.getCmp('d_doc_ref').getValue(),
		  document_id: Ext.getCmp('document_idID').getValue(),
		  sp_tor_id: Ext.getCmp('sp_tor_idID').getValue(),
		  urlfile: Ext.getCmp('urlID').getValue(),
		  userId: Ext.getCmp('sessionID').getValue(),
		  image: imageData,
		  dateSign: Ext.util.Format.date(Ext.getCmp('dateSignID').getValue(), 'Y-m-d'), //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
		  step_sign: Ext.getCmp('stepSignID').getValue() || ''
	   };

	   Ext.Ajax.request({
		  url: '/supplies/gen_pdf_grid',
		  method: 'POST',
		  jsonData: payLoad,
		  success: function (response) {
			 try {
				var res = Ext.decode(response.responseText); // แปลง JSON string เป็น object
				if (res.ok) {
				    window.parent.Ext.getCmp("settingID").getEl().unmask();
				    Ext.Msg.alert('สำเร็จ', res.message || 'PDF ถูกสร้างเรียบร้อยแล้ว',function(){
                                        previewPDF();
                                    });
                                    
				    console.log('📄 ไฟล์บันทึกที่:', res.saved_path);

				} else {
				    Ext.Msg.alert('ผิดพลาด', res.message || 'ไม่สามารถสร้าง PDF ได้');
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

    var auditToPdf = () => {
	   window.parent.Ext.getCmp("settingID").getEl().mask("กรุณาสักครู่ระบบกำลังสร้าง PDF ", "x-mask-loading");
	   function stepPreview(url, step) {
		  if (!url || typeof url !== "string")
			 return "";

		  // แยก path ออกเป็นส่วน ๆ โดยรองรับทั้ง / และ \
		  var parts = url.split(/[\/\\]+/);

		  if (parts.length < 4) {
			 console.warn("Invalid URL format:", url);
			 return url; // คืนค่าเดิมถ้ารูปแบบไม่ถูก
		  }

		  var year = parts[0];      // เช่น 2025
		  var prCode = parts[1];    // เช่น PR25680400078
		  var fileName = parts[3];  // เช่น PR25680400078_1_1.pdf

		  let urlPath = `${year}/${prCode}/${step}_${fileName}`;

//alert(urlPath);
		  return urlPath;
	   }
	   var urlPath = stepPreview(Ext.getCmp('urlID').getValue(), 0);
	   let c_text = window.parent.Ext.getCmp('settingID').title;
	   c_text = c_text.replace(/<span[^>]*>/g, '');
//        const imageData = canvas.toDataURL('image/png');
	   var payLoad = {
		  pr_code: Ext.getCmp('d_doc_ref').getValue(),
		  c_name: c_text,
		  document_id: Ext.getCmp('document_idID').getValue(),
		  sp_tor_id: Ext.getCmp('sp_tor_idID').getValue(),
		  urlfile: Ext.getCmp('urlID').getValue(),
		  url: urlPath,
		  dateSign: Ext.util.Format.date(Ext.getCmp('dateSignID').getValue(), 'Y-m-d'), //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
		  i_audit:Ext.getCmp('grid-step-sign-doc').getStore().data.itemAt(0).get('id') 
	   };
//           console.log(Ext.getCmp('grid-step-sign-doc').getStore().data.itemAt(0).get('id'));
//return false;
	   Ext.Ajax.request({
		  url: '/supplies/sp/app/api/mnSignerAuditDoc.php',
		  method: 'POST',
		  jsonData: payLoad,
		  success: function (response) {
			 try {
				var res = Ext.decode(response.responseText); // แปลง JSON string เป็น object
				if (res.ok) {
				    window.parent.Ext.getCmp("settingID").getEl().unmask();
				    Ext.Msg.alert('สำเร็จ', res.message || 'PDF ถูกสร้างเรียบร้อยแล้ว');
				    console.log('📄 ไฟล์บันทึกที่:', res.saved_path);

				} else {
				    Ext.Msg.alert('ผิดพลาด', res.message || 'ไม่สามารถสร้าง PDF ได้');
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

    var gridOnSave = (gridId) => {

	   if (gridId === 'grid-step-sign-doc-audit') {
		  auditToPdf();
		  return false;
	   }
	   if (gridId === 'addToPdf') {
		  genToPdf();
		  return false;
	   }
	   //         

	   const gridID = gridId;
	   const grid = Ext.getCmp(gridID);
	   const dataToSave = [];
	   const dataToSave2 = [];
	   const dataToSave3 = [];
	   // ตรวจสอบว่ามีค่าไหม
	   if (Ext.getCmp('step_sign_doc')) {
		  const store = grid.getStore();
		  Ext.recMain = new Ext.data.Record({});
		  Ext.recMain.set('document_id', Ext.getCmp('document_idID').getValue());
		  Ext.recMain.set('url', Ext.getCmp('urlID').getValue());
		  Ext.recMain.set('docType', Ext.getCmp('docTypeID').getValue().inputValue);
		  Ext.recMain.set('dateType', Ext.getCmp('dateTypeID').getValue().inputValue);
		  Ext.recMain.set('pr_code', Ext.getCmp('d_doc_ref').getValue()), Ext.recMain.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
		  Ext.recMain.set('sp_sign_type_id', 1);
		  Ext.recMain.set('position_y', Ext.getCmp('position_yID').getValue());
		  Ext.recMain.set('page', Ext.getCmp('pageID').getValue());
		  Ext.recMain.set('c_approve', Ext.getCmp('c_approveID').getValue()); 
		  Ext.recMain.set('dtl', dataToSave);
//Ext.select('input[id^=chk_audit_]').each(function(el) {
//    console.log(el.id, el.dom.checked);
//     record.set('i_signer', (Ext.get('chk_signer_'+record.get('line')).dom.checked?1:0));
//     record.set('i_audit',  (Ext.get('chk_audit_'+record.get('line')).dom.checked?1:0)); 
//});     
		  store.each(function (record) {
			 record.set('page', Ext.getCmp('pageID').getValue());
			 record.set('c_approved', Ext.getCmp('c_approveID').getValue()); 
			 record.set('rc', record.get('row') + ',' + record.get('col'));
			
			 record.set('position_y', Ext.getCmp('position_yID').getValue());
			 record.set('sp_sign_type_id', Ext.getCmp('sp_sign_type_idID').getValue());
			 record.set('position_name', record.get('c_postion'));
			 record.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
			 record.set('sp_sign_type_id', 1);
//            record.set('sign_date', Ext.util.Format.date(record.get('sign_date'), 'Y-m-d'); //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
			 dataToSave.push(record.data); 
                         console.log(record.data);
//                         return false;
		  });
	   } else {
		  Ext.recMain = {};
		  store = {};
	   }
//            return false;
	   if (Ext.getCmp('tab2')) {

		  const grid2 = Ext.getCmp('grid-copy1');
		  const store2 = grid2.getStore();
		  Ext.recMain2 = new Ext.data.Record({});
		  Ext.recMain2.set('url', Ext.getCmp('urlID').getValue());
		  Ext.recMain2.set('docType', Ext.getCmp('docTypeID').getValue().inputValue);
		  Ext.recMain2.set('dateType', Ext.getCmp('dateTypeID').getValue().inputValue);
		  Ext.recMain2.set('pr_code', Ext.getCmp('d_doc_ref').getValue());
		  Ext.recMain2.set('document_id', Ext.getCmp('document_idID').getValue());
		  Ext.recMain2.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
		  Ext.recMain2.set('sp_sign_type_id', 2);
		  Ext.recMain2.set('position_y', Ext.getCmp('grid-copy1_position_y').getValue());
		  Ext.recMain2.set('page', Ext.getCmp('grid-copy1_page').getValue());
		  Ext.recMain2.set('c_approve', Ext.getCmp('grid-copy1c_approveID').getValue()); 
		  store2.each(function (record) {
//            record.set('sign_date', Ext.util.Format.date(record.get('sign_date'), 'Y-m-d'); //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
			 record.set('sp_sign_type_id', 2);
			 record.set('position_name', record.get('c_postion')); 
			 record.set('dc_emp_id', record.get('dc_emp_id'));
			 record.set('page', Ext.getCmp('grid-copy1_page').getValue());
			 record.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
			 record.set('c_approve',  Ext.getCmp('grid-copy1c_approveID').getValue());
			 record.set('rc', record.get('row') + ',' + record.get('col'));
			 dataToSave2.push(record.data);
		  });
	   } else {
		  Ext.recMain2 = {};
		  store2 = {};
	   }
	   if (Ext.getCmp('tab3')) {
		  const grid3 = Ext.getCmp('grid-copy2');
		  const store3 = grid3.getStore();
		  Ext.recMain3 = new Ext.data.Record({});
		  Ext.recMain3.set('url', Ext.getCmp('urlID').getValue());
		  Ext.recMain3.set('docType', Ext.getCmp('docTypeID').getValue().inputValue);
		  Ext.recMain3.set('dateType', Ext.getCmp('dateTypeID').getValue().inputValue);
		  Ext.recMain3.set('pr_code', Ext.getCmp('d_doc_ref').getValue());
		  Ext.recMain3.set('document_id', Ext.getCmp('document_idID').getValue());
		  Ext.recMain3.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
		  Ext.recMain3.set('sp_sign_type_id', 3);
		  Ext.recMain3.set('position_y', Ext.getCmp('grid-copy2_position_y').getValue());
		  Ext.recMain3.set('page', Ext.getCmp('grid-copy2_page').getValue());
                  Ext.recMain3.set('c_approve', Ext.getCmp('grid-copy2c_approveID').getValue()); 
		  store3.each(function (record) {
			 record.set('sp_sign_type_id', 3);
			 record.set('position_name', record.get('c_postion'));
			 record.set('dc_emp_id', record.get('dc_emp_id'));
			 record.set('page', Ext.getCmp('grid-copy2_page').getValue());
			 record.set('sp_tor_id', Ext.getCmp('sp_tor_idID').getValue());
			 record.set('rc', record.get('row') + ',' + record.get('col'));
			 record.set('c_approve', Ext.getCmp('grid-copy2c_approveID').getValue());
//            record.set('sign_date', Ext.util.Format.date(record.get('sign_date'), 'Y-m-d'); //Ext.util.Format.date(record.get('sign_date')), 'Y-m-d')
			 dataToSave3.push(record.data);
		  });
	   } else {
		  Ext.recMain3 = {};
		  store3 = {};
	   }



	   var payLoad = {
		  mode: (Ext.butt !== "EDIT") ? 'add' : 'edit', // หรือ 'add', 'delete' ตามกรณี 
		  sp_sign_type_id: Ext.recMain.get('sp_sign_type_id'),
		  pr_code: Ext.getCmp('d_doc_ref').getValue(),
		  document_id: Ext.recMain.get('document_id'),
		  sp_tor_id: window.parent.Ext.globValue.sp_tor_id,
		  page: Ext.getCmp('pageID').getValue(),
		  url: Ext.getCmp('urlID').getValue(),
		  docType: Ext.getCmp('docTypeID').getValue().inputValue,
		  dateType: Ext.getCmp('dateTypeID').getValue().inputValue,
		  position_y: Ext.getCmp('position_yID').getValue(),
		  c_approve: Ext.getCmp('c_approveID').getValue(), 
		  record: dataToSave, // ส่ง 1 record ถ้าเป็นแบบหลาย record ต้องวนลูปทีละตัว
		  mainRec2: Ext.recMain2.data,
		  mainRec3: Ext.recMain3.data,
		  recordDtl2: dataToSave2,
		  recordDtl3: dataToSave3
	   };


	   window.parent.Ext.getCmp("settingID").getEl().mask("Please wait...", "x-mask-loading");
// console.log(store);
//        return false;
	   Ext.Ajax.request({
		  url: './api/mnSignerTemplate.php',
		  method: 'POST',
		  jsonData: payLoad,
		  success: function (response) {
			 const res = Ext.decode(response.responseText);
                            
			 if (res.success === 'success') {
                                Ext.getCmp('grid-step-sign-doc').getView().refresh();
				Ext.Msg.alert('สำเร็จ', res.message || 'บันทึกข้อมูลเรียบร้อยแล้ว',()=>{  
                                gridOnSave('addToPdf'); 
                                });
				
                                

			 } else {
				Ext.Msg.alert('ผิดพลาดในการบันทึก', res.message || '<span style="white-space: nowrap;">เกิดข้อผิดพลาด/มีการบันทึกซ้ำ</span>');
			 }
		  },
		  failure: function (response) {
			 Ext.Msg.alert('ผิดพลาด', '<span style="white-space: nowrap;">ไม่สามารถติดต่อเซิร์ฟเวอร์ได้</span>');
		  }
	   });
	   window.parent.Ext.getCmp("settingID").getEl().unmask();
    };

// === Key สำหรับ localStorage ===
    var C_APPROVE_KEY = 'approve_history_5';
// โหลดประวัติจาก localStorage (สูงสุด 5 รายการ)
    function loadApproveHistory() {
	   try {
		  var arr = JSON.parse(localStorage.getItem(C_APPROVE_KEY) || '[]');
		  if (!Ext.isArray(arr))
			 arr = [];
		  return arr.slice(0, 5);
	   } catch (e) {
		  return [];
	   }
    }
// บันทึกข้อความใหม่ลงประวัติ
    function saveApproveHistory(text) {
	   var v = (text || '').replace(/\s+/g, ' ').trim();
	   if (!v)
		  return;
	   var arr = loadApproveHistory();
	   // ลบค่าที่ซ้ำกับ v
	   arr = arr.filter(function (x) {
		  return x !== v;
	   });
	   // ใส่ไว้หัวแถว
	   arr.unshift(v);
	   // จำกัดไม่เกิน 5 รายการ
	   arr = arr.slice(0, 5);
	   try {
		  localStorage.setItem(C_APPROVE_KEY, JSON.stringify(arr));
	   } catch (e) {
	   }

	   // อัปเดต store ถ้ามี
	   var st = Ext.StoreMgr.get('approveHistoryStore');
	   if (st) {
		  var data = [];
		  Ext.each(arr, function (x) {
			 data.push([x]);
		  });
		  st.loadData(data);
	   }
    }
    // === สร้าง store สำหรับคอมโบ ===
    var approveHistoryStore = new Ext.data.ArrayStore({
	   id: 'approveHistoryStore',
	   fields: ['v'],
	   data: (function () {
		  var data = [];
		  Ext.each(loadApproveHistory(), function (x) {
			 data.push([x]);
		  });
		  return data;
	   })()
    });
// === Combo สำหรับกรอกหรือเลือกประวัติ ===
 Ext.setRec = (cl,rec)=>{
     console.log(rec);
                          alert();
//                           if(cl=='i_audit'){
//                               rec.set('i_audit',  (Ext.get('chk_audit_'+rec.get('line')).dom.checked?1:0)); 
//                               
//                           }else{
//                                 rec.set('i_signer', (Ext.get('chk_signer_'+rec.get('line')).dom.checked?1:0));
//                           }
                           
                      };
    var comboApprove = {
	   xtype: "combo",
	   name: "c_approve",
	   id: "c_approveID",
	   width: 300,
	   style: "font-size: 12px;",
	   emptyText: "- เห็นชอบ",
	   store: approveHistoryStore,
	   displayField: 'v',
	   valueField: 'v',
	   mode: 'local',
	   editable: true,
	   forceSelection: false,
	   triggerAction: 'all',
	   typeAhead: true,
	   minChars: 0,
	   listeners: {
		  select: function (combo, rec) {
			 combo.setValue(rec.get('v'));
			 saveApproveHistory(rec.get('v'));
		  },
		  specialkey: function (field, e) {
			 if (e.getKey() === e.ENTER) {
				saveApproveHistory(field.getValue());
			 }
		  },
		  blur: function (field) {
			 saveApproveHistory(field.getValue());
		  },
		  afterrender: function (combo) {
			 combo.getEl().on('focus', function () {
				combo.doQuery('', true);
			 });
		  }
	   }
    };
 var LS_KEY_POSY = 'sign_position_y';
var LS_KEY_STEP = 'sign_position_step';


    var grid = new Ext.grid.EditorGridPanel({
//    title: 'Editable Grid',
	   id: 'grid-step-sign-doc',
	   layout: "fit",
	   height: 400,
	   border: false, 
tbar: ['-', 'หน้าที่จะวาง(1,2-5):',
    {
        xtype: "textfield",
        id: "pageID",
        name: "page",
        style: "font-size: 12px;",
        width: 80,
        value: "1",
    }, '-',
    'ตำแหน่ง y ขยับขึ้น/ลง:',
    {
        xtype: "textfield",
        id: "position_yID",
        name: "position_y",
        style: "font-size: 12px;",
        width: 60,
        value: (localStorage.getItem(LS_KEY_POSY) || "50")
    },
    { xtype: 'tbtext', text: 'ช่วง:' },
    {
        xtype: "textfield",
        id: "position_stepID",
        name: "position_step",
        style: "font-size: 12px;",
        width: 50,
        value: (localStorage.getItem(LS_KEY_STEP) || "5")
    },
    {
        xtype: 'button',
        text: '-',
        tooltip: 'ลดตำแหน่ง Y ด้วยช่วงที่กำหนด',
        handler: function () {
            changePositionY(-1);
        }
    },
    {
        xtype: 'button',
        text: '+',
        tooltip: 'เพิ่มตำแหน่ง Y ด้วยช่วงที่กำหนด',
        handler: function () {
            changePositionY(1);
        }
    },
    '-', '-', '-', 'คำอนุมัติ/เห็นชอบ:', comboApprove,
    {
        xtype: "hidden",
        name: "sp_sign_type_id",
        id: "sp_sign_type_idID"
    }
],
	   viewConfig: {
		  emptyText: "ไม่มีข้อมูล..",
		  deferEmptyText: false,
	   },
	   listeners: {
               viewready: function (grid) {
                    grid.getView().mainBody.on('click', function (e, t) {
                        var view = grid.getView(); 
                        var rowIndex = view.findRowIndex(t);   // หา row index
                        var colIndex = view.findCellIndex(t);  // หา column index

                        var rec = grid.getStore().getAt(rowIndex);
                        var fieldName = grid.getColumnModel().getDataIndex(colIndex);

                               

                    }, null, {delegate: 'button'});
                },
		  afterrender: function () {
                     
                        cellClick_del = (grid, rowIndex, columnIndex, e) => {

				var gridSub = Ext.getCmp('grid-step-sign-doc').getSelectionModel().getSelectedCell();
				var rec = Ext.getCmp('grid-step-sign-doc').getStore().getAt(gridSub[0]);
				if (gridSub[1] === Ext.getCmp('grid-step-sign-doc').getColumnModel().getIndexById("dc_user_del_idID")) {
				    if (rec) {
					   Ext.getCmp('grid-step-sign-doc').getStore().remove(rec);
				    } else {
					   Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบ");
				    }
				}else if (gridSub[1] === Ext.getCmp('grid-step-sign-doc').getColumnModel().getIndexById("i_auditID")) {  
                                          rec.set('i_audit',  (Ext.get('chk_audit_'+rec.get('line')).dom.checked?1:0)); 
                                }else if (gridSub[1] === Ext.getCmp('grid-step-sign-doc').getColumnModel().getIndexById("i_signer")) {  
                                          rec.set('i_signer', (Ext.get('chk_signer_'+rec.get('line')).dom.checked?1:0));
                                }

			 };
 function toNumber(value, fallback) {
            var n = parseFloat(value);
            return (isNaN(n) ? fallback : n);
        }

        // save memories
        function saveMemories() {
            var posy = Ext.getCmp('position_yID').getValue();
            var step = Ext.getCmp('position_stepID').getValue();
            // store as strings (but we always treat them as numbers)
            localStorage.setItem(LS_KEY_POSY, posy);
            localStorage.setItem(LS_KEY_STEP, step);
        }

        // apply delta to the position_y field (grid selection)
        function applyDeltaToSelectedRows(delta) {
            var gridCmp = Ext.getCmp('grid-step-sign-doc');
            var sm = gridCmp.getSelectionModel();
            var store = gridCmp.getStore();

            // if no selection, do nothing (or optionally notify)
            var selections = sm.getSelections ? sm.getSelections() : [];
//            if (!selections || selections.length === 0) {
//                Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกรายการที่ต้องการปรับตำแหน่ง Y (เลือกได้หลายแถว)');
//                return;
//            }

            Ext.each(selections, function (rec) {
                var cur = toNumber(rec.get('position_y'), 0);
                var newVal = cur + delta;
                rec.set('position_y', newVal);
                rec.commit(); // mark as changed
            });
        }

        // main change function called by +/- buttons
        window.changePositionY = function (dir) {
            // dir = +1 or -1
            var posField = Ext.getCmp('position_yID');
            var stepField = Ext.getCmp('position_stepID');

            var cur = toNumber(posField.getValue(), 0);
            var step = toNumber(stepField.getValue(), 1);
            var newVal = cur + (dir * step);

            // optional: clamp to integer if you want ints
            // newVal = Math.round(newVal);

            // update the UI field and save memories
            posField.setValue(newVal);
            saveMemories();

            // apply to selected rows as well
            applyDeltaToSelectedRows(dir * step);
        };

        // when user manually edits the position_y field, save it as number
        Ext.getCmp('position_yID').on('change', function (field, newVal, oldVal) {
            // ensure stored value is numeric string
            var numeric = toNumber(newVal, null);
            if (numeric === null) {
                // invalid input -> revert to old or 0
                field.setValue(oldVal || 0);
            } else {
                // store
                localStorage.setItem(LS_KEY_POSY, numeric);
            }
        });

        // when user edits step, save it
        Ext.getCmp('position_stepID').on('change', function (field, newVal, oldVal) {
            var numeric = toNumber(newVal, null);
            if (numeric === null) {
                field.setValue(oldVal || 1);
            } else {
                localStorage.setItem(LS_KEY_STEP, numeric);
            }
        });


		  }
	   }, 
	   anchor: '100% 100%',
	   autoScroll: true,
	   store: new Ext.data.ArrayStore({
		  fields: [
			 {name: 'id'},
			 {name: 'sp_sign_type_id'},
			 {name: 'line'},
			 {name: 'i_signer'},
			 {name: 'i_audit'},
			 {name: 'dc_user_id'},
			 {name: 'full_name'},
			 {name: 'position_name'},
			 {name: 'action'},
			 {name: 'c_approved'},
			 {name: 'page'},
			 {name: 'date_document'},
			 {name: 'line_approved'},
			 {name: 'position_y'},
			 {name: 'org_name'},
			 {name: 'sign_date'},
			 {name: 'row'},
			 {name: 'col'},
			 {name: 'step_sign'},
			 {name: 'document_id'},
			 {
				name: 'c_name',
				convert: function (v, rec) {
				    return rec.position_name + " " + rec.full_name;
				}
			 },
			 {
				name: 'rc',
				convert: function (v, rec) {
				    return rec.row + "," + rec.col;
				}
			 }
		  ],
		  data: [] //dc_user_id c_postion full_name action org_name sign_date position_x
	   }),
	   columns: [
		  {
			 header: '-',
//            hidden:true,
			 menuDisabled: true,
			 dataIndex: 'id', fixed: true,
			 align: "center",
			 width: 30,
		  },
		  {
			 header: 'dc_user_id',
			 hidden: true,
			 dataIndex: 'dc_user_id',
		  },
		  {

			 header: 'ตำแหน่ง r,c',
			 align: 'center',
			 dataIndex: 'rc', width: 80,
			 editor: Ext.customEditorRowCol,
			 id: 'position_xyID', menuDisabled: true, fixed: true,
			 renderer: function (value, metaData, record, row, col, store, gridView) {
				if (value == "") {
				    metaData.css = 'grid-icon-cell';
				    return '<img src="../../images/icons/xhtml_valid.png" style="vertical-align:middle;margin-right:5px;" />' +
						  '<span style="color:red;"> ' + record.get('row') + ',' + record.get('col') + ' </span>';
				} else {
				    return '<span style="color:blue;">' + record.get('row') + ',' + record.get('col') + '  </span>';
				}

			 }
		  },
                  {
                                header: 'ผู้ตรวจ',
                                dataIndex: 'i_audit', // ถ้าต้องการเก็บสถานะจริงในฟิลด์อื่น ให้เปลี่ยนชื่อที่นี่
                                id: 'i_auditID', // ถ้าต้องการเก็บสถานะจริงในฟิลด์อื่น ให้เปลี่ยนชื่อที่นี่
                                width:60,
                                align: "center",
                                    editor: {
        xtype: 'checkbox',
        style: 'margin-left:23px;vertical-align: middle; display: block !important;',  
        listeners: {
            change: function(cb, newVal) {
                // ไม่ค่อยจำเป็นเพราะ grid จะ set ให้เมื่อ editor ปิด
            }
        }
    }, renderer: function(v) { return v ? '☑' : '🔳'; }
//                                renderer:function(v, m, rec){ 
//                                return '<input type="checkbox" onclick="Ext.setRec(\"i_audit\,'+rec+'")" id="chk_audit_'+rec.get('line')+'" class="rowpick" data-rowid="'+Ext.util.Format.htmlEncode(rec.i_audit|| 0)+'" '+(v?'checked':'')+' />';
//                               }
                               
		  },
                  {
                                header: 'ลงนาม',
                                dataIndex: 'i_signer', // ถ้าต้องการเก็บสถานะจริงในฟิลด์อื่น ให้เปลี่ยนชื่อที่นี่
                                id: 'i_signerID', // ถ้าต้องการเก็บสถานะจริงในฟิลด์อื่น ให้เปลี่ยนชื่อที่นี่
                                width:60,
                                align: "center", 
    editor: {
        xtype: 'checkbox', //xtype: 'checkbox', 
        style: 'margin-left:23px;vertical-align: middle; display: block !important;',  
        listeners: {
            change: function(cb, newVal) {
                // ไม่ค่อยจำเป็นเพราะ grid จะ set ให้เมื่อ editor ปิด
                
            }
        }
    }, renderer: function(v) { return v ?'☑' : '🔳'; }
//                               renderer:function(v, m, rec){ 
//                                return '<input type="checkbox" onclick="Ext.setRec(\"i_audit\,'+rec+'")" id="chk_signer_'+rec.get('line')+'" class="rowpick" data-rowid="'+Ext.util.Format.htmlEncode(rec.i_signer|| 0)+'" '+(v?'checked':'')+' />';
//                              }
                },
		  {
			 header: 'เลือกผู้ปฎิบัติหน้าที่ ', width: 230,
			 dataIndex: 'c_postion', menuDisabled: true, fixed: true,
			 id: 'dc_user_idID',
			 editor: Ext.customEditor,
			 iconCls: "icon-vcard",
			 renderer: function (value, metaData, record, row, col, store, gridView) {
				if (!value || value == 0) {
				    metaData.css = 'grid-icon-cell';
				    return '<img src="../../images/icons/user_add.png" style="vertical-align:middle;margin-right:5px;" />' +
						  '<span style="color:red;"> แก้ไข ' + value + '</span>';
				} else {
				    return '<img src="../../images/icons/user_edit.png" style="vertical-align:middle;margin-right:5px;" />' +
						  '<span style="color:blue;"> เลือก ' + value + '</span>';
				}

			 }
		  },
		  {

			 header: 'เจ้าหน้าที่ดำเนินการลงนาม',
			 dataIndex: 'full_name', width: 200,
			 editor: new Ext.form.TextField({
				allowBlank: false
			 })
//            },
//            {
//
//                header: 'ปฎิบัติหน้าที่แทน',
//                dataIndex: 'position_name', width: 150,
//                editor: new Ext.form.TextField({
//                    allowBlank: false
//                })
		  },
		  {

			 header: 'ส่วนงาน/ปฎิบัติหน้าที่',
			 dataIndex: 'action', width: 200,
			 editor: new Ext.form.TextField({
				allowBlank: false
			 })
		  },
		  {

			 header: 'องค์กร/สังกัด',
			 dataIndex: 'org_name', width: 150,
			 editor: new Ext.form.TextField({
				allowBlank: false
			 })
		  }, {
			 header: "วันที่ลงนาม",
			 sortable: true,
			 align: "center",
			 dataIndex: "sign_date",
			 width: 120,
			 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
				return shortThaiDate(value);
			 },
			 editor: new Ext.form.DateField()
		  }
	   ],
	   clicksToEdit: 1

    });
    
    if (!Ext.isEmpty(window.parent.Ext.globValue)) {
	   var p = window.parent.Ext.globValue;
	   var dataTorType = [
		  {id: 1, name: 'เฉพาะเจาะจง'},
		  {id: 2, name: 'E-MARKET'},
		  {id: 3, name: 'คัดเลือก'},
		  {id: 4, name: 'E-BIDDING'}
	   ];
    }
    Ext.dateSignID = function (checkedRadio) {
	 
	   if (checkedRadio.getValue().inputValue == 1) {
		  Ext.getCmp('dateSignID').setDisabled(false);
	   } else {
		  Ext.getCmp('dateSignID').setDisabled(true);
	   }

    };
    Ext.sing_stemp_doc = [{
		  xtype: "container",
		  region: "center",
		  layout: "hbox",
		  align: "stretch",
		  height: window.parent.Ext.getCmp('settingID').getHeight() - 100,
		  autoScroll: true,
		  defaults: {
			 xtype: "fieldset",
			 flex: 1,
			 margin: "0 3px",
			 autoHeight: true
		  },

		  items: [
			 {
				title: "บันทึกข้อมูล " + Ext.title,
				RemoveCls: "x-box-item",
				collapsible: true,
				collapsed: false,
				id: "fromGroupID",
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
				    {
					   xtype: "hidden",
					   id: "sp_tor_idID",
					   name: "sp_tor_id",
					   value: p.sp_tor_id
				    },
				    {
					   xtype: "textfield",
					   id: "document_idID",
					   name: "document_id",
					   fieldLabel: "ชุดเอกสาร",
					   style: "background:#ccc;font-size: 14px;",
					   width: 100, readOnly: true,
					   value: p.group
				    },
				    {
					   xtype: "hidden",
					   id: "stepSignID",
					   fieldLabel: "เอกสาร ลงนาม",
					   style: "background:#ccc;font-size: 14px;",
					   width: 100,
					   readOnly: true,
					   value: 0
				    },
				    {
					   xtype: "hidden",
					   id: "sessionID",
					   fieldLabel: "60047,40050,30047,60630,60520",
					   style: "background:#ccc;font-size: 14px;",
					   width: 100,
					   value: 0


				    },
				    {
					   xtype: "textfield",
					   id: "urlID",
					   name: "url",
					   fieldLabel: "URL FILE",
					   style: "background:#ccc;font-size: 14px;",
					   width: 400, readOnly: true,
					   value: p.url
				    },
				    {
					   xtype: "hidden",
					   id: "tor_type_idID",
					   name: "tor_type_id",
					   width: 200,
					   value: p.tor_type_id
				    },
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
							 readOnly: true,
							 value: p.pr_code,
							 style: "background:#ccc;font-size: 14px;",
							 width: 200,
						  },
						  {xtype: "tbspacer", width: 4},
//                                Ext.PopChoosePRForm.mini
					   ],
				    }, new Ext.form.RadioGroup({
					   fieldLabel: 'ประเภทการลงนามเอกสาร',
					   id: 'docTypeID',
					   columns: [130, 130],
					   vertical: true,
					   items: [
						  {boxLabel: 'เอกสารจัดซื้อ', checked: true, name: 'docType', inputValue: 0},
						  {boxLabel: 'เอกสารสัญญา', name: 'docType', inputValue: 1},
								// { boxLabel: 'เอกสารแต่งตั้งคณะกรรมการ', name: 'docType', inputValue: 2 }
					   ],
					   listeners: {
						  change: function (radiogroup, checkedRadio) {
							 if (checkedRadio) {
							 } else {
							 }
						  }
					   }
				    })

						  , new Ext.form.RadioGroup({
							 fieldLabel: 'วันที่ลงนาม', // Label ของกลุ่มทั้งหมด
							 columns: [145, 165, 150],
							 vertical: true,
							 id: 'dateTypeID',
							 items: [
								{boxLabel: 'วันที่เซ็นตามวันลงนาม', checked: true, name: 'dateType', inputValue: 0},
								{boxLabel: 'วันที่เซ็นตามวันที่กำหนด', name: 'dateType', inputValue: 1},
								{boxLabel: 'วันที่เซ็นตามวัน(ว่าง)', name: 'dateType', inputValue: 2}
							 ], listeners: {
								change: function (checkedRadio) {
								    Ext.dateSignID(checkedRadio);
								}
							 }
						  }), {
					   xtype: "datefield",
					   id: "dateSignID",
					   fieldLabel: "วันที่จะลงนาม",
					   style: "background:#ccc;font-size: 14px;",
					   listeners: {
						  afterrender: function () {
										 Ext.dateSignID(Ext.getCmp('dateTypeID'));

						  }
					   }
				    }, {
					   xtype: "displayfield",
					   fieldLabel: "เอกสาร",
					   value: window.parent.Ext.getCmp('settingID').title,
					   name: 'groupTxt',
					   id: 'groupID',
					   style: "color: blue; font-style: italic;",

				    },
				    new Ext.ux.form.LovCombo({
					   readOnly: false,
					   editable: false,
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
						  },
						  blur: function (t, records, options) {

						  },
						  select: function (t, records, options) {
//                                    alert(records.get('id'));
							 var NewRecord = grid.store.recordType; // this gets the Record constructor

							 switch (parseInt(records.get('id'))) {
								case 1:
								    var r = 1;
								    var c = 2;
								    break;
								case 2:
								    var r = 2;
								    var c = 2;
								    break;
								case 3:
								    var r = 3;
								    var c = 2;
								    break;
								case 4:
								    var r = 2;
								    var c = 1;
								    break;
								case 5:
								    var r = 3;
								    var c = 1;
								    break;
							 }
							 var newRec = new NewRecord({
								id: records.get('id'),
								dc_user_id: null,
								c_postion: records.get('c_name'),
								full_name: null,
								action: null,
								org_name: null,
								sign_date: null,
								c_approved: null,
								i_audit: 1,
								i_signer: 1,
								row: r,
								col: c,
								line: records.get('id'),
								rc: null,
								step_sign: null,
								document_id: null //document_id step_sign line
							 });
							 if (records.get('checked') === true) {
								grid.store.add(newRec);
							 } else {
								var rec = Ext.getCmp('grid-step-sign-doc').getStore();
								var rs = Ext.getStoreRow(rec, records.get('id'));
								if (rs) {
								    Ext.getCmp('grid-step-sign-doc').getStore().remove(rs);
								    grid.store.remove(records);
								} else {
								    Ext.example.msg("แจ้งเตือน", 'กรุณาเลือกรายการที่จะลบ', 1);
								}
							 }

						  },
						  afterrender: function (combo) {
							 // ตั้งค่า value หลายค่าเมื่อโหลดเสร็จ
							 var defaultValues = []; // ใส่ id ของรายการที่ต้องการให้เลือก
//                                    var defaultValues = ['2', '4']; // ใส่ id ของรายการที่ต้องการให้เลือก

							 combo.setValue(defaultValues.join(','));
							 // optional: trigger select manually
							 combo.getStore().each(function (rec) {
								if (defaultValues.indexOf(String(rec.get('id'))) !== -1) {
								    rec.set('checked', true); // ทำให้ checkbox ติ๊กถูก
								    Ext.arr1.push(rec.data);
								}
							 });
						  }
					   }
				    }),
				    {
					   xtype: "tabpanel",
					   plain: true,
					   id: 'tabMainID',
					   activeTab: 0,
					   deferredRender: false,
					   defaults: {bodyStyle: "padding:0px", autoHeight: true},
					   items: [
						  {
							 title: "ลงนามเอกสาร วางลายเซ็นแบบที่ 5 ตำแหน่ง",
							 iconCls: "icon-vcard",
							 id: 'step_sign_doc',
							 items: [grid],
							 closable: true
						  }
					   ],
				    }]
			 }]}];
    Ext.confirmSave = 0;
    Ext.ifrmCheckDataAi = () => {
	   var win = new Ext.Window({
		  title: 'Sign Document',
		  width: 900,
		  height: window.parent.Ext.getCmp('settingID').getHeight() - 50,
		  modal: true,
		  layout: 'fit',
		  html: '<iframe id="signIframe" src="/supplies/ai/signAi.php?q=\'ตรวจสอบฟอร์มเอกสาร pr_code = PR25680700005  document_id = 2\'" width="100%" height="100%" frameborder="0"></iframe>'
	   });

	   win.show();

	   win.on('afterrender', function () {
		  var iframe = document.getElementById('signIframe');
		  if (iframe) {
			 iframe.onload = function () {
				iframe.contentWindow.postMessage({
				    pr_code: 'PR25680700005',
				    document_id: 2,
				    sp_tor_id: 3694,
				    q: 'ตรวจสอบฟอร์มเอกสาร pr_code = PR25680700005  document_id = 2'
				}, '*');
			 };
		  } else {
			 console.warn('ไม่พบ iframe signIframe');
		  }
	   });

    };
    formAdd.superclass.constructor.call(this, {
	   title: "ข้อมูล " + Ext.title,
	   iconCls: "icon-application-form-add",
	   id: "frm-Add",
	   border: false,
	   stripeRows: true,
	   loadMask: true,
	   listeners: {
		  beforender: function () {

		  },
		  afterrender: function (obj, eOpts) {

			 Ext.getCmp("form-widgets").on('render', function () {

//                    Ext.getCmp("form-widgets").getForm().loadRecord(Ext.rec);

				Ext.getCmp("form-widgets").getForm().items.each(function (field) {
//console.log(" render form-widgets ",field);
//                        field.on('blur', function (f) {
//                            if (Ext.rec && f.name) {
//                                Ext.rec.set(f.name, f.getValue());
//                            }
//                            Ext.example.msg("แจ้งเตือน", f.getValue(), 3);
//                        });

				});
			 });
//                           w = this.getWidth(),
//                h = this.getHeight(),
//                l = this.getLeft(true),
//                t = this.getTop(true);
//       alert(window.parent.Ext.getCmp('settingID').getHeight());
		  }
	   },
	   items: [
		  {
			 xtype: "form",
			 id: "form-widgets",
			 frame: true,
			 labelAlign: "right",
			 labelWidth: 200,
//                bodyStyle: {padding: "2px 5px"},

			 defaults: {labelStyle: "width:200px;", allowBlank: true},
			 items: [Ext.sing_stemp_doc],
			 buttonAlign: "left",
			 bbar: ['-', {
				    text: "เพิ่มรูปแบบที 2 ตำแหน่ง",
				    iconCls: 'icon-draf',
				    handler: function () {


					   if (!Ext.getCmp('tab2')) {

						  Ext.getCmp('tabMainID').add({
							 title: "วางลายเซ็นแบบที่ 2 ตำแหน่ง",
							 iconCls: "icon-vcard",
							 id: "tab2",
							 closable: true,
							 layout: "fit",
							 items: [Ext.createGrid("grid-copy1", Ext.getCmp('grid-step-sign-doc').getStore())]
						  });
						  Ext.getCmp('tabMainID').setActiveTab('tab2');
						  Ext.getCmp('grid-copy1').on('viewready', function (gridCmp) {
							 var store = gridCmp.getStore();
							 store.each(function (record) {
								var rid = parseInt(record.get('id'), 10);
								if (rid === 3) {
								    record.set('row', 2);
								    record.set('col', 2);
								}
								if (rid === 5) {
								    record.set('row', 3);
								    record.set('col', 2);
								}
							 });
							 store.commitChanges();
							 gridCmp.getView().refresh();
							 this.on('cellclick', function (grid, rowIndex, columnIndex) {
								var rec = grid.getStore().getAt(rowIndex);
								console.log(rec);
//                                Ext.Msg.alert("แจ้งเตือน", this.getId()); 
							 });
						  });
					   } else {
						  Ext.getCmp('tabMainID').setActiveTab('tab2');
					   }
				    }
				}, '-',
				{
				    text: "เพิ่มรูปแบบที่ 1 ตำแหน่ง",
				    iconCls: 'icon-draf',
				    handler: function () {
					   if (!Ext.getCmp('tab3')) {
						  Ext.getCmp('tabMainID').add({
							 title: " วางลายเซ็นแบบที่ 1 ตำแหน่ง",
							 iconCls: "icon-vcard",
							 id: "tab3",
							 layout: "fit",
							 closable: true,
							 items: [Ext.createGrid("grid-copy2", Ext.getCmp('grid-step-sign-doc').getStore())],
						  });
						  Ext.getCmp('tabMainID').setActiveTab('tab3');
						  Ext.getCmp('grid-copy2').on('viewready', function (gridCmp) {
							 var store = gridCmp.getStore();
							 store.each(function (record) {
								var rid = parseInt(record.get('id'), 10);
								if (rid === 5) {
								    record.set('row', 3);
								    record.set('col', 2);
								}
							 });
							 store.commitChanges();
							 gridCmp.getView().refresh();
							 this.on('cellclick', function (grid, rowIndex, columnIndex) {
								var rec = grid.getStore().getAt(rowIndex);
								console.log(rec);
//                                Ext.Msg.alert("แจ้งเตือน", this.getId()); 
							 });
						  });
					   } else {
						  Ext.getCmp('tabMainID').setActiveTab('tab3');
					   }
				    }
				}, '->', {
				    xtype: 'button',
//                        iconCls: 'icon-save-edit',
				    icon: "../../images/icons/picture_save.png",
				    text: 'บันทึกข้อมูลตั้งค่า DATA',
				    handler: function () {
					   gridOnSave('grid-step-sign-doc');
				    } 
//				}, '-', {
//				    text: "บันทึกข้อข้อมูลตั้งค่าลง PDF",
//				    id: "SaveTempHdr", 
//				    icon: "../../images/icons/page_save.png",
//				    handler: function (f) {
// 					   gridOnSave('addToPdf'); 
//				    },
				}, '-', {
				    text: "เปิดดูเอกสาร PDF",
				    id: "priviewHdr",
				    iconCls: "icon-pdf",
				    handler: function (f) {
					   previewPDF();

				    },
				}, '-',
				{
				    text: "บันทึกรายการ ตรวจสอบเอกสารและลงนาม",
				    id: "saveHdr",
				    icon: "../../images/icons/save.png",
				    handler: function () {
					   var msgBox = Ext.Msg.show({
						  title: 'ยืนยันการบันทึก',
						  msg: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
						  buttons: Ext.Msg.YESNO,
						  icon: Ext.Msg.QUESTION,
						  fn: function (btn) {
							 if (btn === 'yes') {
                                                              gridOnSave('grid-step-sign-doc-audit');
//								Ext.Msg.confirm('ยืนยันอีกครั้ง', 'ต้องการตรวจสอบด้วย ai ก่อนบันทึก ใช่หรือไม่?', function (confirmBtn) {
//								    if (confirmBtn === 'yes') {
//									   Ext.ifrmCheckDataAi();
//								    }
//								    if (confirmBtn === 'no') {
//									   gridOnSave('grid-step-sign-doc-audit');
//								    }
//								});

								/*
								 Ext.Msg.prompt('บันทึกข้อมูล', 'กรุณากรอกชื่อเอกสาร:', function(btn, text) {
								 if (btn === 'ok') {
								 Ext.Msg.confirm('ยืนยันอีกครั้ง', 'ต้องการบันทึก "' + text + '" ใช่หรือไม่?', function(confirmBtn) {
								 if (confirmBtn === 'yes') {
								 Ext.Msg.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว: ' + text);
								 // 🔸 โค้ดบันทึกจริงอยู่ที่นี่
								 setTimeout(function () {
								 Ext.Msg.hide();
								 Ext.Msg.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว'+text);
								 }, 1000);
								 }
								 });
								 }
								 }    ,
								 this,
								 true);*/
								// จำลองการบันทึก

							 }
						  }
					   });

					   // ทำให้ message box ค่อย ๆ แสดงแบบ fade
					   var el = Ext.get(msgBox.getDialog().getEl());
					   el.setOpacity(0);
					   el.fadeIn({duration: 0.4});
				    }
				}
				, '-', '-', '-']

		  }
	   ]
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
