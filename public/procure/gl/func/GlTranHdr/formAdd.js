// Class Extend
formAdd	 = function(butt) {

	saveHdr	= function(mode = "") {
		
		mode = (mode == "")? Ext.getCmp("role-form-mode").getValue() : mode;
			
		var msg		= "";
		
		if(Ext.getCmp("c_ref_doc").getValue() == "") { msg += "- กรุณากรอก เลขที่เอกสาร<br>"; }
		if(Ext.getCmp("d_doc_date").getValue() == "") { msg += "- กรุณากรอก วันที่เอกสาร<br>"; }
		if(Ext.getCmp("d_save_date").getValue() == "") { msg += "- กรุณากรอก วันที่บันทึกบัญชี<br>"; }
		if(Ext.getCmp("gl_dc_book_type_id").getValue() == "") { msg += "- กรุณาเลือก ประเภทสมุดบัญชี<br>"; }
		
		if (msg == "") {
			Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
			Ext.Ajax.request({
				url: "api/mn_GlTranhdr.php",
				method: "POST",
				params: {
					mode: mode,
					id: Ext.getCmp("id").getValue(),
					c_ref_doc: Ext.getCmp("c_ref_doc").getValue(),
					d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
					d_save_date: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "Y-m-d"),
					gl_dc_book_type_id: Ext.getCmp("gl_dc_book_type_id").getValue(),
					c_comment1: Ext.getCmp("c_comment1").getValue(),
					c_comment2: Ext.getCmp("c_comment2").getValue(),
					c_comment3: Ext.getCmp("c_comment3").getValue()
				},
				success: function ( result, request ) {
					Ext.getCmp("contenterCenter").getEl().unmask();
					var jsonData = Ext.util.JSON.decode(result.responseText);	// decode json
					if ( jsonData.success == true ) {
						// new Ext.Window
						if(Ext.getCmp("role-form-mode").getValue() == "ADD") {
							new Ext.Window({
								id: "win-ap-add-warning",
								title: "แจ้งเตือน",
								modal: true, 
								height: (Ext.getBody().getViewSize().height*0.7),
								width: (Ext.getBody().getViewSize().width*0.7),
								bodyStyle: { "background-color": "white", "padding": "20px" },
								closable: true,
								autoScroll: true,
								html: 	"<div style='font-size: 20px; text-align: center; padding: 10px 0px;'><span style='background: red; text-decoration: underline;'><b>แจ้งเตือนสำหรับแถบรายละเอียดสมุดรายวัน</b></span></div>" +
										"<div style='font-size: 16px;'>" +
											"<p style='padding: 10px 0px;'>" +
												"- <span style='text-decoration: underline;'><b>กรุณากดปุ่ม \"บันทึกรายการ\" ทุกครั้ง</b></span>" +
												" ที่มีการ <span style='text-decoration: underline;'>เพิ่มแถว/ลบแถว/แก้ไขรายละเอียดสมุดรายวัน</span>" +
												" เพื่อบันทึกข้อมูลไว้ ถึงแม้จะยังบันทึกข้อมูลต่างๆไม่สมบูรณ์ก็ตาม ที่ปุ่มนี้ <img src='images/btn_save.jpg'>" +
											"</p>" +
											"<p style='padding: 10px 0px;'>" +
											"- เมื่อบันทึกข้อมูลทุกอย่างสมบูรณ์แล้ว ให้กดปุ่ม \"บันทึกการแก้ไขและตรวจสอบ\"" +
											" เพื่อบันทึกข้อมูลและตรวจสอบความถูกต้อง ที่ปุ่มนี้ <img src='images/btn_save_validate.jpg'>" +
											"</p>" +
										"</div>",
								buttons: [{
									text: "ปิด",
									handler : function() { Ext.getCmp("win-ap-add-warning").destroy(); }
								}]
							}).show();
						}
						
						Ext.store.load();
						Ext.getCmp("id").setValue(jsonData.id);
						Ext.getCmp("role-form-mode").setValue("EDIT");
						Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
						if(mode == "GEN_CODE") { Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; }
						else {
							if(butt != "edit_hdr") Ext_Show( jsonData.id );
						}
						
					} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
				},
				failure: function ( result, request) { 
					Ext.MessageBox.alert("Failed", result.responseText);		// connect error
				}
			});
		} else { Ext.Msg.alert("แจ้งเตือน", msg); }
	}; // saveHdr
	
	// ============================================================ //
	formAdd.superclass.constructor.call(this, {
		region: "center",
		title: "ข้อมูล"+title_panel,
		id: "frm-Add",
		border: false,
		stripeRows: true,
		loadMask: true,
		listeners:{
			afterrender: function( obj, eOpts ){ /* console.log('Load Finish'); */},
		},
		items: [{
			xtype: "form",
			id: "form-widgets",
			frame: true,
			labelAlign: "right",
			labelWidth: 200,
			bodyStyle: { padding: "10px 20px" },
			defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
			items: [{
				xtype: "container",
				layout: "hbox",
				align: "stretch",
				RemoveHeight: true,
				defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
				items: [{
					title: "บันทึกข้อมูล "+title_panel,
					RemoveCls: "x-box-item",
					collapsible: true,
					collapsed: false,
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [{
						id: "role-form-mode",
						xtype: "hidden",
						name: "mode",
						readOnly: true
					}, {
						xtype: "hidden",
						name: "id",
						id: "id",
						readOnly: true
					}, {
						xtype: "displayfield",
						name: "c_code",
						style: "color: red; font-weight: bold;",
						fieldLabel: "เลขที่สมุดรายวัน"
					}, {
						xtype: "textfield",
						id: "c_ref_doc",
						name: "c_ref_doc",
						fieldLabel: "เลขที่เอกสาร",
						width: 300
					}, {
						xtype: "datefield",
						id: "d_doc_date",
						name: "d_doc_date",
						value: addY(543),
						fieldLabel: "วันที่เอกสาร",
						width: 150
					}, {
						xtype: "datefield",
						id: "d_save_date",
						name: "d_save_date",
						value: addY(543),
						fieldLabel: "วันที่บันทึกบัญชี",
						width: 150
					}, new Ext.form.ComboBox({
						fieldLabel: "ประเภทสมุดบัญชี",
						id: "gl_dc_book_type_id",
						name: "gl_dc_book_type_id",
						store: Ext.vw_gl_dc_book_type,
						valueField: "id",
						displayField: "c_name",
						typeAhead: true,
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true
					}), {
						xtype: "textfield",
						id: "c_comment1",
						name: "c_comment1",
						fieldLabel: "คำอธิบายเพิ่มเติม",
						width: 300
					}, {
						xtype: "textfield",
						id: "c_comment2",
						name: "c_comment2",
						fieldLabel: "",
						width: 300
					}, {
						xtype: "textfield",
						id: "c_comment3",
						name: "c_comment3",
						fieldLabel: "",
						width: 300
					}]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
				id: "saveHdr",
				iconCls	: "icon-save",
				handler : function() { saveHdr(); }
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
				}
			}]
		}, { html: "<div id='Ext_Show'></div>", border: false }]
	});
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {}); 