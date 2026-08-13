//====================== SaveTranTax ====================== //
SaveTranTax	= function( id, i_chk ) {
	
	var jsonArr = [];
	var vatArr	= [];
	var msg		= "";
	
	$( "input[id^=tax_no]" ).each(function( i, val ) { // ROW RUN

		var index	= val.value;

		if(Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue == 1) {
			var c_branch		= Ext.getCmp("tax_c_branch["+index+"]").getValue();
		} else {
			var c_branch		= null;
		}
		
		if(Ext.getCmp("tax_i_more["+index+"]").getValue() == true) {
			var i_more		= 1;
			var	c_mm_more	= Ext.getCmp("tax_c_mm_more["+index+"]").getValue();
			var	c_yyyy_more	= Ext.getCmp("tax_c_yyyy_more["+index+"]").getValue();
		} else {
			var i_more		= 2;
			var c_mm_more	= null;
			var c_yyyy_more	= null;
		}
		
		var d_vat	= Ext.util.Format.date(Ext.getCmp("tax_d_vat["+index+"]").getValue(), "Y-m-d");
		
		if( i_chk == true ) {
			var dd = "";
			
			if(Ext.getCmp("tax_dc_cost_acc_id["+index+"]").getValue() == 0) { dd += ", ศูนย์ต้นทุนทางบัญชี"; }
			if(d_vat == "") {
				dd += ", วันที่ใบกำกับภาษี";
			}
			if(Ext.getCmp("tax_c_doc["+index+"]").getValue() == "") { dd += ", ใบกำกับภาษีเล่มที่/เลขที่"; }
			if(Ext.getCmp("tax_c_mm["+index+"]").getValue() == "") { dd += ", นำส่งเดือน"; }
			if(Ext.getCmp("tax_c_yyyy["+index+"]").getValue() == "") { dd += ", นำส่งปี"; }
			if(Ext.getCmp("tax_c_vendor["+index+"]").getValue() == "") { dd += ", ชื่อผู้ขาย"; }
			if(Ext.getCmp("tax_c_tax["+index+"]").getValue().length < 13) {
				dd += ", เลขประจำตัวผู้เสียภาษี";
			} else {
				$( "input[id^=tax_no]" ).each(function( qq, vals ) {
					var fd	= vals.value;
					if(index != fd) {
						if(Ext.getCmp("tax_c_tax["+index+"]").getValue() == Ext.getCmp("tax_c_tax["+fd+"]").getValue()) {
							if(Ext.getCmp("tax_c_doc["+index+"]").getValue() == Ext.getCmp("tax_c_doc["+fd+"]").getValue()) {
								dd += ", เลขที่ใบกำกับภาษีซ้ำ";
								return false;
							}
						}
					}
				});	
			}
			if(Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue == "1") {
				if(Ext.getCmp("tax_c_branch["+index+"]").getValue().length < 5) {
					dd += ", สาขาที่";
				}
			}
			if(Ext.getCmp("tax_f_price["+index+"]").getValue() <= 0) { dd += ", มูลค่าสินค้า/บริการ"; }
			if(Ext.getCmp("tax_f_vat["+index+"]").getValue() <= 0) { dd += ", จำนวนเงินภาษี"; }
			if(Ext.getCmp("tax_i_more["+index+"]").getValue() == "1") {
				if(Ext.getCmp("tax_c_mm_more["+index+"]").getValue() == "") { dd += ", ยื่นเพิ่มเติมเดือน"; }
				if(Ext.getCmp("tax_c_yyyy_more["+index+"]").getValue() == "") { dd += ", ยื่นเพิ่มเติมปี"; }
			}
			
			if(dd != "") { msg += "แถวที่ "+(i+1)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>"; }
		}
		
		jsonArr.push({
			index: index,
			gl_tran_hdr_id: id,
			dc_cost_acc_id: Ext.getCmp("tax_dc_cost_acc_id["+index+"]").getValue(),
			d_vat: d_vat,
			c_doc: Ext.getCmp("tax_c_doc["+index+"]").getValue(),
			c_mm: Ext.getCmp("tax_c_mm["+index+"]").getValue(),
			c_yyyy: Ext.getCmp("tax_c_yyyy["+index+"]").getValue(),
			c_vendor: Ext.getCmp("tax_c_vendor["+index+"]").getValue(),
			c_tax: Ext.getCmp("tax_c_tax["+index+"]").getValue(),
			i_branch: Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue,
			c_branch: c_branch,
			f_price: Ext.getCmp("tax_f_price["+index+"]").getValue(),
			f_vat: Ext.getCmp("tax_f_vat["+index+"]").getValue(),
			i_more: i_more,
			c_mm_more: c_mm_more,
			c_yyyy_more: c_yyyy_more
	    });			
	});
	
	if(msg	== "") {
		Ext.getCmp("win-pop-tran-tax").getEl().mask("Please wait...", "x-mask-loading");
		Ext.Ajax.request({
			url: "api/mn_GlTranhdr.php",
			method: "POST",
			params: {
				mode: "GL_TRAN_TAX",
				id: id,
				i_chk_gl_purchase: i_chk,
				data: JSON.stringify(jsonArr)
			},
			success: function ( result, request ) {
				Ext.getCmp("win-pop-tran-tax").getEl().unmask();
				var obj = $.parseJSON( result.responseText );
				if(obj.success == true) {
					Ext.store_tran_purchase_tax_show.setBaseParam("id", id);
					Ext.store_tran_purchase_tax_show.load();					
					Ext.getCmp("win-pop-tran-tax").destroy();
				} else if (obj.success == false) {
					
					var msg	= "";
					
					$.each(obj.data, function( index, v ) {
						var dd	= "";
						
						if(v.index) {
							if(v.d_vat == false) { dd += ", ใบกำกับภาษี ห้ามเกิน 6 เดือน นับจากวันที่1ของเดือนปีปัจจุบัน"; }
							if(v.c_mm_yyyy == false) { dd += ", เดือนปีที่นำส่งต้องไม่น้อยกว่า เดือนปีของใบกำกับภาษี"; }
							if(v.c_doc == false) { dd += ", เลขที่ใบกำกับภาษีซ้ำ"; }
						}
						if(dd != "") { msg += "แถวที่ "+(v.index)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>"; }
						
						if(v.acc == false) { msg += "กรุณาเพิ่มรายการรายละเอียดภาษีซื้ออย่างน้อย 1 รายการ<br>"; }
						
						if(v.none) {
							var ss	= "";
							$.each(v.none, function( indexA, vA ) {
								ss += ", "+vA;
							});
							if(ss != "") { msg += "<br>- กรุณาบันทึกรหัสบัญชี \"ภาษีซื้อ\" ที่แถบ \"รายละเอียดสมุดรายวัน\"<br>สำหรับหน่วยงาน <span style=\"color: blue;\">( "+ss.substring(2)+" )</span><br>"; }	
						}
						
						if(v.unalike) {
							var ss	= "";
							$.each(v.unalike, function( indexB, vB ) {
								ss += ", "+vB;
							});
							if(ss != "") { msg += "<br>- กรุณาตรวจสอบ \"จำนวนเงินภาษี\" ที่แถบ \"รายละเอียดภาษีซื้อ\"<br>กับ \"จำนวนยอดบันทึกบัญชี\" ที่แถบ \"รายละเอียดสมุดรายวัน\"<br>สำหรับหน่วยงาน <span style=\"color: blue;\">( "+ss.substring(2)+" )</span> ให้เท่ากัน<br>"; }	
						}
					});
					Ext.MessageBox.alert("แจ้งเตือน", msg);
				}
			},
			failure: function ( result, request) { 
				Ext.MessageBox.alert("Failed", result.responseText);		// connect
			}
		});
	} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
};

//=================================== รายละเอียดภาษีซื้อ ===================================//
PopTranPurchaseTax = function( id ) {
	
	Ext.store_tran_purchase_tax = new Ext.ux.grid.livegrid.Store({
		url : "api/List_GlTranhdr.php",
		baseParams: { type: "gl_tran_purchase_tax" },
		bufferSize: 300,
		reader: reader2
	});
	
	new Ext.Window({
		title: "แสดงรายละเอียดภาษีซื้อ",
		id: "win-pop-tran-tax",
		modal: true,
		preventBodyReset: true,
		closable: true,
		autoScroll: true,
		maximized: true, // เต็มจอ auto
		height: (Ext.getBody().getViewSize().height * 0.8),
		width: (Ext.getBody().getViewSize().width * 0.8),   //80% *0.8
		listeners: {
			"minimize": function (window, opts) { //when property minimizable
				window.collapse();
				window.setWidth(200);
				window.alignTo(Ext.getBody(), "bl-bl")
			},
			afterrender: function( component ) {
				// ======================== Create Row ======================== //
				var tbody	= "";
				
				Ext.getCmp("win-pop-tran-tax").getEl().mask("Please wait...", "x-mask-loading");
				$.ajax({
					url: "api/List_GlTranhdr.php",
					type: "POST",
					data: {
						type: "gl_tran_purchase_tax",
						id: id
					},
					success: function(result) {
						var obj = $.parseJSON( result );
						
						if(obj.debug == true) {
							$.each(obj.data , function( index, v ) {
								
								var addBody		= "";
								
								// GEN TBODY
								addBody	+= "<input id='tax_no["+index+"]' type='hidden' value='"+index+"'>";
								addBody	+= "<td id='Ext_tax_dc_cost_acc_id["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_d_vat["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_doc["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_mm["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_yyyy["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_vendor["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_tax["+index+"]' align='center'></td>";
								addBody	+= "<td align='center'><div id='Ext_tax_i_branch["+index+"]' style='width:300px;'></div></td>";
								addBody	+= "<td id='Ext_tax_f_price["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_f_vat["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_i_more["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_c_more["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_tax_delete["+index+"]' align='center'></td>";

								$("#myTableTax > tbody:last").append("<tr id='tax_row["+index+"]'>"+addBody+"</tr>");
								
								myFunc( index, v );
							});
							
							Ext.getCmp("total_dtl").setValue(floatRenderer(obj.total_dtl));
							Ext.getCmp("win-pop-tran-tax").getEl().unmask();
						}
					}
				});
	        }
		},
		tbar: [{
			id: "row-tran-tax",
			xtype: "idcardfield",
			width: 70,
			value: 1,
			autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
			emptyText : "จำนวนแถว",
			listeners: {
           	     change : function(obj, value) { if(value == "") { obj.setValue(1); } }
			}
		}, "-", {
			text : "เพิ่มแถว",
			iconCls: "icon-add",
			handler: function(grid, rowIndex, colIndex) {
				
				for(var i = 1; 	i <= Ext.getCmp("row-tran-tax").getValue(); i++) {
					
					var addBody		= "";
					var beforeIndex	= parseInt($("#myTableTax > tbody > tr:last > input[id^=tax_no]").val());
					var index		= (isNaN(beforeIndex))? 0 : parseInt(beforeIndex) + 1;

					addBody	+= "<input id='tax_no["+index+"]' type='hidden' value='"+index+"'>";
					addBody	+= "<td id='Ext_tax_dc_cost_acc_id["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_d_vat["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_doc["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_mm["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_yyyy["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_vendor["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_tax["+index+"]' align='center'></td>";
					addBody	+= "<td align='center'><div id='Ext_tax_i_branch["+index+"]' style='width:300px;'></div></td>";
					addBody	+= "<td id='Ext_tax_f_price["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_f_vat["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_i_more["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_c_more["+index+"]' align='center'></td>";
					addBody	+= "<td id='Ext_tax_delete["+index+"]' align='center'></td>";

					$("#myTableTax > tbody:last").append("<tr id='tax_row["+index+"]'>"+addBody+"</tr>");
					
					myFunc( index );
				}
			}
		}],
		bbar: [{ xtype: "tbfill" }, {
			xtype: "buttongroup",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", style: "color: blue", text: "รวมจำนวนเงินภาษีซื้อจากใบสำคัญ : " }, 
            	        { xtype: "tbspacer", width: 4 },
            	        { id: "total_tax", xtype: "textfield", value: "0.00", style: "text-align: right", width: 100, readOnly: true }]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", style: "color: red", text: "จำนวนเงินภาษีที่ลงบัญชี : " }, 
            	        { xtype: "tbspacer", width: 4 },
            	        { id: "total_dtl", xtype: "textfield", value: "0.00", style: "text-align: right", width: 100, readOnly: true }]
            }]
		}],
		html:	"<div style='background:#fff; overflow:auto;'>" +
					"<form id='form_save_tax' name='form_save_tax' method='POST'>" +
						"<table id='myTableTax' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
							// headder
							"<thead class='x-grid3-header'>" +
								"<tr class='x-grid3-hd-row' height='20'>" +
									"<td rowspan='2' nowrap>ศูนย์ต้นทุนทางบัญชี</td>" +
									"<td colspan='2' nowrap>ใบกำกับภาษี</td>" +
									"<td colspan='2' nowrap>นำส่ง</td>" +
									"<td rowspan='2' nowrap>ชื่อผู้ขาย</td>" +
									"<td rowspan='2' nowrap>เลขประจำตัวผู้เสียภาษีฯ<br>ของผู้ขายสินค้า</td>" +
									"<td rowspan=2' nowrap>สถานประกอบการ</td>" +
									"<td rowspan='2' nowrap>มูลค่าสินค้า/บริการ</td>" +
									"<td rowspan='2' nowrap>จำนวนเงินภาษี</td>" +
									"<td colspan='2' nowrap>ยื่นเพิ่มเติม</td>" +
									"<td rowspan='2' nowrap width='40'>-</td>" +
								"</tr>" +
								"<tr class='x-grid3-hd-row' height='20'>" +
									"<td>วันที่</td>" +
									"<td>เล่มที่/เลขที่</td>" +
									"<td>เดือน</td>" +
									"<td>ปี</td>" +
									"<td>ยื่น</td>" +
									"<td>เดือนปี</td>" +
								"</tr>" +
							"</thead>" +
							// body
							"<tbody></tbody>" +
						"</table>" +
					"</form>" +
				"</div>",
		buttonAlign: "left",
		buttons : [{
			text: Ext.GLOBAL_BU_SAVE_TH,
			iconCls: "icon-save",
			handler: function() { SaveTranTax( id, false ); }
		}, {
			text: "บันทึกการแก้ไขและตรวจสอบ",
			iconCls: "icon-save",
			handler: function() { SaveTranTax( id, true ); }
		}, {
			text: Ext.GLOBAL_BU_BACK_TH,
			handler: function() { Ext.getCmp("win-pop-tran-tax").destroy(); }
		}]
	}).show();
	
	// ============================ myFunc ============================ //
	var myFunc	= function( index, v = null ) {
		
		// รหัสศูนย์ต้นทุนทางบัญชี
		new Ext.form.ComboBox({
			id: "tax_dc_cost_acc_id["+index+"]",
			store: Ext.vw_dc_cost_gl_last,
			valueField: "id",
			displayField: "c_name",
			mode: "local",
			triggerAction: "all",
			emptyText: "กรุณาเลือก...",
			width: 300,
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
				blur: function() { this.getStore().clearFilter(); }
			},
			renderTo: "Ext_tax_dc_cost_acc_id["+index+"]"
		});
		
		// วันที่
		new Ext.form.DateField({
			id: "tax_d_vat["+index+"]",
			width: 100,
			listeners : {
				afterrender: function() {
					this.setValue(addY(543));
				}
			},
			renderTo: "Ext_tax_d_vat["+index+"]"
		});
		
		// เล่มที่/เลขที่
		new Ext.form.TextField({
			id: "tax_c_doc["+index+"]",
			width: 150,
			renderTo: "Ext_tax_c_doc["+index+"]"
		});
		
		// นำส่งเดือน
		new Ext.form.ComboBox({
			id: "tax_c_mm["+index+"]",
			store: Ext.store_month,
			valueField: "id",
			displayField: "c_name",
			value: (new Date().getMonth()+1),
			mode: "local",
			triggerAction: "all",
			emptyText: "กรุณาเลือก...",
			width: 90,
			forceSelection: true,
			selectOnFocus: true,
			typeAhead: false,
			editable: false,
			renderTo: "Ext_tax_c_mm["+index+"]"
		});
		
		// นำส่งปี
		new Ext.form.ComboBox({
			id: "tax_c_yyyy["+index+"]",
			store: Ext.store_year,
			valueField: "id",
			displayField: "c_name",
			value: (new Date().getFullYear()),
			mode: "local",
			triggerAction: "all",
			emptyText: "กรุณาเลือก...",
			width: 90,
			forceSelection: true,
			selectOnFocus: true,
			typeAhead: false,
			editable: false,
			renderTo: "Ext_tax_c_yyyy["+index+"]"
		});
		
		// ชื่อผู้ขาย
		new Ext.form.TextField({
			id: "tax_c_vendor["+index+"]",
			width: 300,
			renderTo: "Ext_tax_c_vendor["+index+"]"
		});
		
		// เลขประจำตัวผู้เสียภาษี
		new Ext.form.IdCardField({
			id: "tax_c_tax["+index+"]",
			autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
			width: 150,
			renderTo: "Ext_tax_c_tax["+index+"]"
		});
		
		// สถานประกอบการ
		new Ext.ButtonGroup({
			columns: 4,
			width: 300,
			frame: false,
			items: [
				new Ext.form.RadioGroup({
					id: "tax_i_branch["+index+"]",
        			columns: [ 44, 93, 60 ],
        			items: [
        				{ boxLabel: "อื่นๆ", name: "tax_i_branch["+index+"]", inputValue: 3 },
        				{ boxLabel: "สำนักงานใหญ่", name: "tax_i_branch["+index+"]", inputValue: 2, checked: true },
        				{ boxLabel: "สาขาที่", name: "tax_i_branch["+index+"]", inputValue: 1 }
        			],
        			listeners: {
        				afterrender: function() {
    						this.fn	= function() {
    							ChangeBranch( index );
    						}
    					},
    					Change: function(value) {
    						this.fn();
    					}
					}
				}),
				new Ext.form.IdCardField({
					id: "tax_c_branch["+index+"]",
					autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 5 },
					emptyText: "ตัวอย่าง 00001",
					width: 100
				})
			],
			renderTo: "Ext_tax_i_branch["+index+"]"
		});
		
		// มูลค่าสินค้า/บริการ
		new Ext.form.TextField({
			id: "tax_f_price["+index+"]",
			style: "text-align: right",
			width: 100,
			listeners: {
				afterrender: function() {
					this.fn	= function() {
						ChangePrice( index );
						ChangeVat( index );
					}
				},
				Change: function(value) {
					this.fn();
				}
			},
			renderTo: "Ext_tax_f_price["+index+"]"
		});
		
		// จำนวนเงินภาษี
		new Ext.form.TextField({
			id: "tax_f_vat["+index+"]",
			style: "text-align: right",
			width: 100,
			listeners: {
				afterrender: function() {
					this.fn	= function() {
						ChangeVat( index );
					}
				},
				Change: function(value) {
					this.fn();
				}
			},
			renderTo: "Ext_tax_f_vat["+index+"]"
		});
		
		// ยื่น
		new Ext.form.Checkbox({
			id: "tax_i_more["+index+"]",
			width: 30,
			inputValue: 1,
			listeners: {
				afterrender: function() {
					this.fn	= function() {
						ChangeMore( index );
					}
				},
				check: function(value) {
					this.fn();
				}
			},
			renderTo: "Ext_tax_i_more["+index+"]"
		});
		
		// ยื่นเพิ่มเติมเดือน
		new Ext.form.ComboBox({
			id: "tax_c_mm_more["+index+"]",
			store: Ext.store_month,
			valueField: "id",
			displayField: "c_name",
			mode: "local",
			triggerAction: "all",
			emptyText: "กรุณาเลือก...",
			width: 90,
			forceSelection: true,
			selectOnFocus: true,
			typeAhead: false,
			editable: false,
			renderTo: "Ext_tax_c_more["+index+"]"
		});
		
		// ยื่นเพิ่มเติมปี
		new Ext.form.ComboBox({
			id: "tax_c_yyyy_more["+index+"]",
			store: Ext.store_year,
			valueField: "id",
			displayField: "c_name",
			mode: "local",
			triggerAction: "all",
			emptyText: "กรุณาเลือก...",
			width: 90,
			forceSelection: true,
			selectOnFocus: true,
			typeAhead: false,
			editable: false,
			renderTo: "Ext_tax_c_more["+index+"]"
		});
		
		// ลบ
		new Ext.Button({
			id: "tax_delete["+index+"]",
			icon: "../images/icons/bin.gif",
			tooltip: "ลบรายการ",
			handler: function() {
				$("#myTableTax > tbody > #tax_row\\["+index+"\\]").remove();
				ChangeVat( index );
            },
			renderTo: "Ext_tax_delete["+index+"]"
		});
		
		if(v != null) {
			if(v.f_price > 0) {
				Ext.getCmp("tax_f_price["+index+"]").setValue(v.f_price);
				Ext.getCmp("tax_f_price["+index+"]").fn();
			}
			if(v.f_vat > 0) {
				Ext.getCmp("tax_f_vat["+index+"]").setValue(v.f_vat);
				Ext.getCmp("tax_f_vat["+index+"]").fn();
			}
			if(v.dc_cost_acc_id > 0){ Ext.getCmp("tax_dc_cost_acc_id["+index+"]").setValue(v.dc_cost_acc_id); }
			Ext.getCmp("tax_d_vat["+index+"]").setValue(new Date(v.DATEADD_VAT));
			Ext.getCmp("tax_c_doc["+index+"]").setValue(v.c_doc);
			Ext.getCmp("tax_c_mm["+index+"]").setValue(v.c_mm);
			Ext.getCmp("tax_c_yyyy["+index+"]").setValue(v.c_yyyy);
			Ext.getCmp("tax_c_vendor["+index+"]").setValue(v.c_vendor);
			Ext.getCmp("tax_c_tax["+index+"]").setValue(v.c_tax);
			Ext.getCmp("tax_i_branch["+index+"]").setValue(v.i_branch);
			Ext.getCmp("tax_i_branch["+index+"]").fn();
			Ext.getCmp("tax_c_branch["+index+"]").setValue(v.c_branch);
			Ext.getCmp("tax_i_more["+index+"]").setValue(v.i_more);
			Ext.getCmp("tax_i_more["+index+"]").fn();
			Ext.getCmp("tax_c_mm_more["+index+"]").setValue(v.c_mm_more);
			Ext.getCmp("tax_c_yyyy_more["+index+"]").setValue(v.c_yyyy_more);
		} else {
			Ext.getCmp("tax_i_branch["+index+"]").fn();
			Ext.getCmp("tax_i_more["+index+"]").fn();
		}
	}

	// ============================================ //
	var ChangeBranch	= function ( index ) {
		var i_branch	= Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue;
		
		if(i_branch == 1) {
			Ext.getCmp("tax_c_branch["+index+"]").setDisabled(false);
		} else {
			Ext.getCmp("tax_c_branch["+index+"]").setDisabled(true);
		}
	}
	
	// ============================================ //
	var ChangePrice	= function ( index ) {
		var f_price	= floatAccount(Ext.getCmp("tax_f_price["+index+"]").getValue(), 2);
		var f_vat	= "";
		
		if(f_price > 0) {
			f_vat	= ((f_price * 7) / 100).toFixed(2);
			
			Ext.getCmp("tax_f_price["+index+"]").setValue(f_price);
			Ext.getCmp("tax_f_vat["+index+"]").setValue(f_vat);
		} else {
			Ext.getCmp("tax_f_price["+index+"]").setValue("");
			Ext.getCmp("tax_f_vat["+index+"]").setValue("");
		}
	}
	
	// ============================================ //
	var ChangeVat	= function ( index ) {
		var f_vat	= floatAccount(Ext.getCmp("tax_f_vat["+index+"]").getValue(), 2);
		var total	= parseInt(0);
		
		Ext.getCmp("tax_f_vat["+index+"]").setValue(f_vat);
		
		$( "input[id^=tax_no]" ).each(function( i, val ) { // ROW RUN
			var index	= val.value;
			
			if(Ext.getCmp("tax_f_vat["+index+"]").getValue() != "") {
				total	+= parseFloat(Ext.getCmp("tax_f_vat["+index+"]").getValue());
			}
		});
		
		Ext.getCmp("total_tax").setValue(floatRenderer(total.toFixed(2)));
	}
	
	// ============================================ //
	var ChangeMore	= function ( index ) {
		var i_more	= Ext.getCmp("tax_i_more["+index+"]").getValue();
		
		if(i_more == true) {
			Ext.getCmp("tax_c_mm_more["+index+"]").setDisabled(false);
			Ext.getCmp("tax_c_yyyy_more["+index+"]").setDisabled(false);
		} else {
			Ext.getCmp("tax_c_mm_more["+index+"]").setDisabled(true);
			Ext.getCmp("tax_c_yyyy_more["+index+"]").setDisabled(true);
		}
	}
}; // PopTranPurchaseTax