/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.AppUx = function (app, menu)
{

    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.costID = 38; //หน่วยงานผู้รับผิดชอบ พัสดุ
    Ext.menuCode = 'ST0001';
    Ext.dcCostFix = false; //38
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
	   "tor_type_id1": {0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)"}
    });
    Ext.status = Ext.apply({
	   name: menu,
	   process: function (menuCode, record) {

		  Ext.Ajax.request({
			 url: "tor/api/mnTorController.php",
			 params: {
				mode: "UPSTATUS",
				menuCode: menuCode,
				tor_status_id: record.get("tor_status_id"),
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

    function cellClick(grid, rowIndex, columnIndex, e)
    {

	   var record = grid.getStore().getAt(rowIndex);
	   Ext.selectRow = record;
//        if (columnIndex === grid.getColumnModel().getIndexById('processDueID')) { //ttf
//            controller(Ext.selectRow, 'processUpdate'); //on
//        }

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
		  }; //Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
		  if (Ext.isEmpty(rec.get('c_code')) || (rec.get('tor_status_id') != null)) {
			 Ext.Msg.alert("แจ้งเตือน", ""
				    + (Ext.isEmpty(rec.get('c_code')) ? "รหัส TOR ยังไม่ถูกสร้าง" : "")
				    + ((rec.get('tor_status_id') > 0) ? "ผ่านรายการเรียบร้อยแล้ว สถานะเมนู <b>" + rec.get('c_name_status') + " - " + rec.get('c_code_status') + "</b>"
						  : ""),
				    function (bu, action) {
					   return false;
				    });
		  } else {

			 Ext.Msg.show({
				title: 'ประมวลผล TOR',
				msg: 'คุณต้องการผ่านรายการ ' + rec.get('c_code') + ' สถานะเมนู ' + Ext.menuCode + ' ?',
				width: 440,
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

	   }


    }// Controller
//AutoLoad

    Ext.storeDtl = new Ext.data.JsonStore({
	   storeId: "myStore1",
	   autoDestroy: false,
	   autoLoad: false,
	   url: "tor/api/List_bookContract.php",
	   baseParams: {type: "lasperiodNotification"}, // LIST_SUB_PERIOD_HDR LIST_PERIOD_SUB_HDR
	   root: "data",
	   idProperty: "id",
	   totalProperty: "totalCount",
	   fields: [{
			 name: "readOnly"
		  },
		  {
			 name: "no"
		  },
		  {
			 name: "id"
		  },
		  {
			 name: "c_name"
		  },
		  {
			 name: "c_detail"
		  },
		  {
			 name: "close_detail"
		  },
		  {
			 name: "i_is_complete"
		  },
		  {
			 name: "i_before"
		  },
		  {
			 name: "i_is_start"
		  },
		  {
			 name: "txti_is_close"

		  },
		  {
			 name: "i_is_close"
		  },
		  {
			 name: "sp_emp_id"
		  },
		  {
			 name: "sp_emp_idTxt"
		  },
		  {
			 name: "notif_date"
		  },
		  {
			 name: "due_date"
		  },
		  {
			 name: "user_id"
		  },
		  {
			 name: "sp_tor_contract_id"
		  },
		  {
			 name: "c_doc_ref"
		  },
		  {
			 name: "c_contract_name"
		  },
		  {
			 name: "c_code"
		  },
		  {
			 name: "dc_creditor_id"
		  },
		  {
			 name: "sp_tor_id"
		  },
		  {
			 name: "sp_tor_id"
		  },
		  {
			 name: "f_total_amt"
		  },
		  {
			 name: "d_po_date"
		  },
		  {
			 name: "d_po_date"
		  },
		  {
			 name: "due_date"
		  },
		  {
			 name: "c_d_due_date"
		  },
		  {
			 name: "d_doc_date"
		  },
		  {
			 name: "i_notification"},
		  {
			 name: "i_contract_status"
		  },
		  {
			 name: "i_status"
		  },
		  {
			 name: "i_is_last"
		  },
		  {
			 name: "d_period_date"
		  },
		  {
			 name: "d_create"
		  }
	   ]
    }
    );
    Ext.yearTh = function () {
	   let years = [];
	   let currentTime = new Date();
	   let now = currentTime.getFullYear() + 1;
	   let id = currentTime.getFullYear() - 3;
	   while (id <= now) {
		  let c_name = id + 543;
		  years.push({
			 id,
			 c_name,
		  });
		  id++;
	   }

	   let Date_now = new Date();
	   Date_now = Date_now.toISOString().split("T")[0].split("-");
	   Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
	   return years;
    };
    Ext.store_year = new Ext.data.JsonStore(
		  {
			 fields: ["id", "c_name"],
			 autoDestroy: false,
			 autoLoad: false,
			 data: Ext.yearTh()
		  });

    Ext.bookContrack = new Ext.data.JsonStore({
	   storeId: "myStore2",
	   autoLoad: false,
	   url: "./api/All_cost.php",
	   root: "data",
	   baseParams: {mode: "LISTDTL", i_read: user_right_read},
	   idProperty: "id",
	   totalProperty: "totalCount",
	   fields: [
		  {name: "no"},
		  {name: "id"},
		  {name: "c_code", type: "string"},
		  {name: "c_name", type: "string"}
	   ]
    });
    Ext.storeStepContract = new Ext.data.JsonStore(
		  {
			 fields: ["id", "c_name"],
			 autoDestroy: false,
			 autoLoad: false,
			 data: [{id: 0, c_name: 'เริ่มทำสัญญา'},
				{id: 1, c_name: 'จัดทำ/ร่าง สัญญา'},
				{id: 2, c_name: 'ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ'},
				{id: 3, c_name: 'บันทึกใบ PO (สัญญาย่อย)'},
				{id: 4, c_name: 'ลงนามในสัญญา PO (สัญญาย่อย)'},
				{id: 5, c_name: "ส่งมอบงาน"},
				{id: 6, c_name: "ตรวจรับพัสดุ/ครุภัณฑ์"},
				{id: 7, c_name: "รอเงินงบประมาณที่มีอยู่จริง/ตรวจรับพัสดุ/ครุภัณฑ์"},
				{id: 8, c_name: "ส่งเบิกบันทึกใบขอเบิก"},
				{id: 10, c_name: 'ยกเลิก'}
			 ]
		  });
    Ext.storeCloseContract = new Ext.data.JsonStore(
		  {
			 fields: ["id", "c_name"],
			 autoDestroy: false,
			 autoLoad: false,
			 data: [
				{id: 0, c_name: 'จองเลขสัญญา'},
				{id: 1, c_name: 'mapping สัญญา กับ PR'},
				{id: 2, c_name: 'ยกเลิกสัญญา'}
			 ]
		  });
    /* 'เริ่มทำสัญญา',
	1 => 'จัดทำ/ร่าง สัญญา',
	2 => 'ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ',
	3 => 'บันทึกใบ PO (สัญญาย่อย)',
	4 => 'ลงนามในสัญญา PO (สัญญาย่อย)',
	5 => "ส่งมอบงาน",
	6 => "ตรวจรับพัสดุ/ครุภัณฑ์",
	CHECKING_WAITING_BG  => "รอเงินงบประมาณที่มีอยู่จริง/ตรวจรับพัสดุ/ครุภัณฑ์",
	CHECKING_WITHDRAW => "ส่งเบิกบันทึกใบขอเบิก",
	10 => "ยกเลิก"*/
    Ext.keyData = 1; //type data key in
    Ext.title = "รายการสถานะ TOR ";
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

    function mappingFrm() {

	   return new Ext.Window(
			 {
//                     collapsible: true,
//                     maximizable: true,
				title: "จับเลขที่สัญญากับรายการทำสัญญา",
				width: 700,
				id: "winMappingFrm",
				modal: true,
				height: 300,
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
								    name: 'tag',
								    id: 'stag_nameID',
								    fieldLabel: 'คำที่ค้นหา Tag'
								}, {
								    xtype: 'textfield',
								    fieldLabel: 'รหัส TOR',
								    id: 'sc_codeID',
								    name: 'c_code'
								}, {
								    xtype: 'datefield',
								    fieldLabel: 'วันที่ TOR',
								    id: 'sd_tor_dateID',
								    name: 'd_tor_date'
								}
								/*}, {
								 xtype: "radiogroup",
								 columns: [120],
								 fieldLabel: "ผ่านรายการ",
								 id: "searchPostID",
								 name: "i_post",
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
								 }*/
							 ]
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
										  fieldLabel: "จับเลขที่สัญญากับรายการทำสัญญา",
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
								    name: "si_enabled",
								    items: [
									   {
										  name: "si_enabled",
										  checked: true,
										  inputValue: 1,
										  boxLabel: "ใช้งาน"

									   }, {
										  name: "si_enabled",
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
								Ext.storeDtl.setBaseParam("tag", Ext.getCmp("stag_nameID").getValue());
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
    function SearchFrm() {

	   return new Ext.Window(
			 {
//                     collapsible: true,
//                     maximizable: true,
				title: "ค้นหารายการ TOR",
				width: 700,
				id: "winSearchFrm",
				height: 300,
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
								    name: 'tag',
								    id: 'stag_nameID',
								    fieldLabel: 'คำที่ค้นหา Tag'
								}, {
								    xtype: 'textfield',
								    fieldLabel: 'รหัส TOR',
								    id: 'sc_codeID',
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
								    name: "i_post",
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
								    name: "si_enabled",
								    items: [
									   {
										  name: "si_enabled",
										  checked: true,
										  inputValue: 1,
										  boxLabel: "ใช้งาน"

									   }, {
										  name: "si_enabled",
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
								Ext.storeDtl.setBaseParam("tag", Ext.getCmp("stag_nameID").getValue());
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


    //plug in checkbox expan
    fnNewWin = (c) => {
	   Ext.addTab(c);
    };

remvoeNoConract = (c_code)=> {
    // แสดงกล่องยืนยันพร้อมช่องกรอกเหตุผล (Multiline prompt)
    Ext.Msg.show({
        title: 'ยืนยันการยกเลิกเลขจอง',
        msg: 'กรุณาระบุเหตุผลในการยกเลิกรายการ รหัส: ' + c_code,
        width: 350,
        buttons: Ext.Msg.OKCANCEL,
        multiline: true, // เปิดใช้งานช่องกรอกเหตุผลแบบหลายบรรทัด
        fn: function(btn, text) {
            // ถ้าผู้ใช้กด OK และมีการกรอกเหตุผล
            if (btn === 'ok') {
                // ตรวจสอบว่ากรอกเหตุผลหรือไม่ (ป้องกันการส่งค่าว่าง)
                if (!text || text.trim() === "") {
                    Ext.Msg.alert('แจ้งเตือน', 'กรุณาระบุเหตุผลก่อนกดยืนยัน', function() {
                        remvoeNoConract(c_code); // เรียกตัวเองซ้ำเพื่อให้กรอกใหม่
                    });
                    return;
                }

                // ส่งข้อมูลไปยัง Backend ด้วย Ext.Ajax
           try {
    Ext.Ajax.request({
        url: 'tor/api/mnCheckingController.php',
        method: 'POST',
        params: {
            mode: 'removeContracBook',
            c_code: c_code,
            c_comment: text // ส่งเหตุผลที่กรอกไปด้วย
        },
        success: function(response) {
            try {
                // ป้องกันกรณี response.responseText ว่างเปล่า หรือไม่ใช่ JSON ที่ถูกต้อง
                if (!response.responseText) {
                    throw new Error("ระบบไม่ได้ส่งข้อมูลตอบกลับมา");
                }

                // แปลงผลลัพธ์ที่ส่งกลับมาจาก Server
                var result = Ext.decode(response.responseText);
                
                if (result.success) {
                    Ext.Msg.alert('สำเร็จ', 'ยกเลิกเลขจองเรียบร้อยแล้ว');
                    // คุณสามารถเพิ่มโค้ด Reload Grid หรือหน้าจอตรงนี้ได้
                } else {
                    Ext.Msg.alert('ล้มเหลว', result.message || 'ไม่สามารถยกเลิกรายการได้');
                }
            } catch (jsonError) {
                // ดักจับ Error ตอนแปลง JSON หรือตอนประมวลผลภายใน success
                console.error("JSON Decode Error: ", jsonError);
                Ext.Msg.alert('ผิดพลาด', 'รูปแบบข้อมูลที่ส่งกลับมาจากเซิร์ฟเวอร์ไม่ถูกต้อง');
            }
        },
        failure: function(response) {
            Ext.Msg.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ (Status: ' + response.status + ')');
        }
    });
} catch (globalError) {
    // ดักจับ Error เผื่อตัวแปรระบบบางตัวไม่ได้ถูกประกาศไว้ (Runtime Error)
    console.error("Global Request Error: ", globalError);
    Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง');
}
            }
        }
    });
};
    //plug in checkbox expan
    var expander = new Ext.ux.grid.RowExpander({
//        header: '-',
	   width: 28,
	   tpl: new Ext.XTemplate(
			 '<p style="font-weight:bold;">รายละเอียด</p>',
			 '<div style="padding-left:35px; border-top:1px solid #ece;">',
			 '<tpl if="c_name && c_name != \'\'">',
			 '<p>ผู้จองสัญญา : {c_name}</p>',
			 '</tpl>',
			 '<p>สัญญา : {c_code}</p>',
			 '<p>ระบุผู้จองเลข : <button onclick="fnNewWin(\'{c_code}\');" id="mappingFrmID"> พนักงานเจ้าของสัญญา </button></p>',
			 '<p>ยกเลิกรายการ : <button onclick="remvoeNoConract(\'{c_code}\');" id="remvoeNoConractID"> ยกเลิกเลขจอง </button></p>',
			 '</div>'
			 )

    });
    var sm = new Ext.grid.CheckboxSelectionModel({
	   header: '<center><input type="checkbox" name="id" id="checkAll" onClick="clkAll(this,\'tabpanel1\');"/></center>',
	   dataIndex: "id",
	   id: "idID",
	   width: 50,
	   renderer: function (value, metaData, record, row, col, store, gridView)
	   {
		  //set load value record.get('field flag')
		  var val = value % 2 ? null : null;
		  var id = value;
//          var val = record.get('field flag');

		  return '<center><input style="margin-left:5px;" type="checkbox"  id="checkAll[' + id + ']"  name="checkAll[' + id + ']" ' + (val ? 'checked' : '') + ' onclick=""></center>';
	   }
    });
    sm.on('selectionchange', function (selModel) {
	   var grid = Ext.getCmp('tabpanel1');
	   var sm = grid.getSelectionModel();
	   var checkAll = document.getElementById('checkAll');
	   if (!checkAll)
		  return;
	   var total = grid.getStore().getCount();
	   var selected = selModel.getCount();
	   checkAll.checked = (total > 0 && total === selected);
    });

    /////////////////// gridMain
    Ext.extend((gridMain = function () {
	   var colmnn = [
		  expander,
		  {
			 header: "รหัส",
			 sortable: true,
			 align: "left",
			 dataIndex: "c_code",
			 width: 120
		  }, {
			 header: "ผู้จองสัญญา",
			 sortable: true,
			 align: "left",
			 dataIndex: "c_name",
			 width: 200
//		  }, {
//			 header: "รายละเอียดแก้ไขสถานะของสัญญา",
//			 sortable: true,
//			 align: "left",
//			 dataIndex: "close_detail",
//			 width: 180


		  }, {
			 header: "วันที่สร้าง",
			 sortable: false,
			 align: "center",
			 dataIndex: "d_create", width: 150,

		  }, {
//			 header: "วันที่หมดสัญญา",
//			 sortable: false,
//			 align: "center",
//			 dataIndex: "due_date", width: 150, 
//		  }, {
			 header: "เจ้าของเรื่อง",
			 sortable: false,
			 align: "left",
			 width: 150,
			 dataIndex: "sp_emp_idTxt"
		  }
	   ];
	   Ext.dc_cost = new Ext.data.JsonStore({
		  autoDestroy: false,
		  autoLoad: true,
		  url: "api/All_cost.php",
		  baseParams: {
			 type: "dc_cost",
		  },
		  root: "data",
		  idProperty: "id",
		  fields: ["id", "c_sub", "c_code", "c_name"],
	   });


	   Ext.storeDepartment = new Ext.data.JsonStore({
		  storeId: "storeDepartment",
		  autoLoad: true,
		  url: "api/All.php",
		  root: "data",
		  baseParams: {type: "storeSpEmp", start: 0, limit: 20, mode: null}, //Permission i_read
		  idProperty: "id",
		  totalProperty: "totalCount",
		  fields: ["id", "c_code", "c_name"],
		  //  fields: ['id', 'c_code', 'c_name', 'TextShow', 'dc_department_type_id', 'i_level', 'i_parent', 'c_department']
	   });
	   var columnMini = [
		  {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
		  {header: "สายงาน", sortable: true, dataIndex: "c_code"},
		  {
			 header: "ผู้ปฎิบัติงาน",
			 sortable: true,
			 id: "c_name",
			 dataIndex: "c_name",
			 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
				metaData.attr = "style='cursor:pointer';";
				return value;
			 },
		  },
	   ];
	   Ext.PopDepartmentForm = new Ext.ux.Poplov({
		  text: "ผู้จองสัญญา",
		  id: "sp_emp_idID", //go to relation
		  iconCls: "page_magnify",
		  valueHidden: "sp_emp_id", //go to hidden
		  store: Ext.storeDepartment,
		  headerGrid: columnMini,
		  widthText: 280,
		  fieldLabel: "ผู้จองสัญญา",
		  isCellClickGrid: true,
		  cellClickGrid: function (grid, rowIndex, columnIndex, e) {
			 var id = "sp_emp_idID";
			 var nameID = id + "_Name";
			 var record = grid.getStore().getAt(rowIndex);

			 var TextShow = record.data.c_code + " " + record.data.c_name;

			 Ext.getCmp(id).setValue(record.data.id);
			 Ext.getCmp(nameID).setValue(TextShow);
			 Ext.getCmp("win-pop-lov" + id).hide();
			 Ext.getCmp("win-pop-lov" + id).destroy();

			 Ext.util.Cookies.set("sp_emp_name", TextShow);
			 Ext.util.Cookies.set("sp_emp_id", record.data.id);
		  },
	   });


	   gridMain.superclass.constructor.call(this, {
		  region: "center",
		  title: Ext.title,
		  xtype: "grid",
		  id: "tabpanel1",
		  border: true,
		  stripeRows: true,
		  loadMask: true,
		  //------------------
		  sm: sm,
		  plugins: expander,
		  layout: "fit",
		  clicksToEdit: 2,
		  viewConfig: {
			 emptyText: "ไม่มีข้อมูล..",
			 deferEmptyText: true,
		  },
		  listeners: {

			 dblclick: function (dataview, index, item, e) {
//                     Ext.buAct = "update";
//                     Ext.loadStore("edit", true); // app,data.load
			 },
			 viewready: function (g)
			 {
				console.log(Ext.get('checkAll'));
			 },
			 // Allow rows to be rendered.
			 beforeedit: function (g)
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
								text: "แก้ไขรายละเอียดสัญญา",
								icon: "../images/icons/book_magnify.png",
								handler: function (e)
								{
								    Ext.buAct = "getDetail";
								    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frmSubID'), true) || {}; //null obj not errer
								    var tab2 = new Ext.FormPanel({
									   //labelAlign: 'top',
									   id: 'frmSubID',
									   url: "tor/api/mnContractController.php",
									   layout: 'fit',
									   height: 435,
									   listeners: {
										  beforerender: function () {
											 this.setTitle("เลขที่สัญญา " + Ext.selectRow.get('c_name'));
										  }
									   },
									   items: [{
											 xtype: 'tabpanel',
											 plain: true,
											 activeTab: 0,
											 height: 435,
											 deferredRender: true,
											 defaults: {bodyStyle: 'padding:10px'},
											 items: [{
												    title: 'สถานะของสัญญา',
												    layout: 'form',
												    defaults: {width: 230},
												    labelWidth: 200,
												    defaultType: 'textfield',
												    url: "tor/api/mnContractController.php",
												    items: [new Ext.form.ComboBox({
														  mode: "local",
														  store: Ext.storeCloseContract,
														  anchor: "40%",
														  fieldLabel: "การปรับสถานะของสัญญา",
														  valueField: "id",
														  displayField: "c_name",
														  hiddenName: "i_is_close",
														  name: "i_is_close",
														  triggerAction: "all",
														  forceSelection: true,
														  selectOnFocus: true,
														  typeAhead: false,
														  emptyText: "-- ถ้าต้องการเป็นสถานะ--"
													   }), {
														  xtype: "checkbox",
														  id: "i_is_completeID",
														  name: "i_is_complete",
														  fieldLabel: "สถานะส่งของ",
														  boxLabel: "ส่งของครบ",
														  listeners: {
															 check: function () {
															 },
															 beforerender: function () {
															 },
															 afterrender: function ()
															 {
															 }
														  },
														  width: 180,
														  inputValue: 1,
														  style: {
															 margin: "0px 0px 0px 3px"
														  }
													   },
													   {
														  xtype: 'hidden',
														  name: 'mode',
														  id: 'modeID',
														  value: 'UPDATESTATUSCONTRACT'
													   },
													   {
														  xtype: 'hidden',
														  name: 'id', //sp_tor_contract_id
														  id: 'idID',
													   },
													   {
														  xtype: "textfield",
														  width: 170,
														  fieldLabel: "รหัส CTS",
														  id: "codeCTS",
														  style: "text-align: center;font-weight:bold;background:#eee;",
														  readOnly: true,
														  name: "c_code"
													   },
													   {
														  fieldLabel: "เลขที่",
														  readOnly: false,
														  id: "c_contract_noID",
														  name: "c_doc_ref",
														  xtype: "textfield",
														  width: 170,
														  validator: function (val) {
															 if (Ext.isEmpty(val)) {
																return "กรุณากรอก เลขที่";
															 } else {
																return true;
															 }
														  },
//													   },
//													   {
//														  fieldLabel: "วันที่ลงนาม ",
//														  id: "d_doc_dateID",
//														  name: "d_doc_date",
//														  xtype: "datefield",
//														  width: 160,
//														  validator: function (val) {
//															 if (Ext.isEmpty(val)) {
//																return "วันที่ลงนาม";
//															 } else {
//																return true;
//															 }
//														  },
													   },
													   {
														  fieldLabel: "วันที่อายุสัญญา ",
														  id: "due_dateID",
														  name: "due_date",
														  xtype: "datefield",
														  width: 160,
														  validator: function (val) {
															 if (Ext.isEmpty(val)) {
																return "วันที่อายุสัญญา";
															 } else {
																return true;
															 }
														  },
//													   },
//													   {
//														  fieldLabel: "เรื่อง ",
//														  xtype: "textfield",
//														  width: 300,
//														  id: "c_nameID",
//														  name: "c_name",
//														  cls: "my-label-style",
													   }, {
														  fieldLabel: "รายละเอียดการแก้ไขสถานะสัญญา",
														  xtype: "textarea",
														  width: 300,
														  id: "close_detailID",
														  name: "close_detail",
														  cls: "my-label-style",
													   }]

												}]
										  }],
									   buttonAlign: "left",
									   buttons: [{
											 text: "บันทึกออกเลขสัญญา",
											 id: "buSaveAllID",
											 iconCls: "icon-save",
											 listeners: {
												afterrender: function ()
												{}
											 },
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
															 Ext.getCmp("frmSubID").destroy();
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


												var form = Ext.getCmp("frmSubID").getForm();
												if (form.isValid())
												{
												    formSubmit(form);
												}
											 }
											 //haddler
										  }, {
											 text: Ext.GLOBAL_BU_BACK_TH,
											 handler: function ()
											 {

												Ext.getCmp("frmSubID").destroy();
											 }
										  }]


								    }) || {};
								    tab2.getForm().loadRecord(Ext.selectRow);
								    Ext.getCmp("contenterCenter").add(tab2);
								    Ext.getCmp("contenterCenter").setActiveTab(tab2);
								},
								scope: this
							 }]
					   });
			 },
			 afterrender: function (g)
			 {

				this.on("cellclick", cellClick, this); //cellClick

				/*	this.on("contextmenu", function (e, grid, rowIndex, columnIndex)
				 {
				 //                        var record = grid.getStore().getAt(rowIndex);
				 //                        Ext.selectRow = record;
				 
				 e.stopEvent();
				 this.contextMenu.showAt(e.getXY());
				 }, this);*/
			 }
		  },
		  store: Ext.storeDtl,
		  tbar: [{
				xtype: 'button',
				text: ' เพิ่มรายการจองสัญญา ',
				width: 80,
				iconCls: "icon-application-view-list",
				handler: function () {
				    Ext.addTab();
				}
			 }, '->', {
				xtype: 'label', text: ' วันที่'
			 }, {
				xtype: "datefield",
				fieldLabel: "เริ่มวันที่ตรวจรับ",
				id: "s_checking_dateID",
				name: "s_checking_date",
			 }, {
				xtype: 'label', text: 'ถึง วันที่'
			 },
			 {
				xtype: "datefield",
				fieldLabel: "ถึงวันที่ตรวจรับ",
				id: "e_checking_dateID",
				name: "e_checking_date",
			 },
			 new Ext.form.TwinTriggerField({
				xtype: 'twintriggerfield',
				id:'inputTriggerID',
				trigger1Class: 'x-form-clear-trigger',
				trigger2Class: 'x-form-search-trigger',
				onTrigger1Click: function ( ) {
				 Ext.getCmp("s_checking_dateID").setValue("");
				 Ext.getCmp("e_checking_dateID").setValue("");
				 Ext.getCmp("inputTriggerID").setValue("");
				 
				}, onTrigger2Click: function ( ) {
//				    alert(2);
//				    Ext.getCmp("gridID").getSelectionModel().selectRow(0);

//**************/
					   Ext.storeDtl.setBaseParam("mode", "lasperiodNotification");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            Ext.storeDtl.setBaseParam("d_start", Ext.getCmp("s_checking_dateID").getValue()); 
                            Ext.storeDtl.setBaseParam("d_end", Ext.getCmp("e_checking_dateID").getValue()); 
                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("inputTriggerID").getValue()); 
                            Ext.storeDtl.load();
					   
				    
				}
			 })],
		  columns: colmnn,
		  //  autoExpandColumn: 'disID',
		  bbar: [{xtype: 'button', iconCls: "icon-save", text: 'บันทีกรายการที่เลือก'}, ' ', '->', new Ext.PagingToolbar(
				    {
					   pageSize: 20,
					   store: Ext.storeDtl,
					   displayInfo: true,
					   displayMsg: "Displaying topics {0} - {1} of {2}",
				    })],
	   });
    }
    ), Ext.grid.GridPanel, {}
    ); //EditorGridPanel
    ///////////////// EditorGridPanel
    Ext.addTab = (c) => {
	   if (c) {
		  var itemsDynamic = [{
				xtype: 'tabpanel',
				plain: true,
				activeTab: 0,
				height: 435,
				deferredRender: true,
				defaults: {bodyStyle: 'padding:10px'},
				items: [{
					   title: 'สถานะของสัญญา',
					   layout: 'form',
//                                                                defaults: {width: 230},
					   labelWidth: 200,
					   defaultType: 'textfield',
//								    url: "tor/api/mnContractController.php",
					   items: [
						  {

							 xtype: 'hidden',
							 name: 'mode',
							 id: 'modeID',
							 value: 'ADD'
						  },
						  {
							 xtype: 'hidden',
							 name: 'type',
							 id: 'modeID',
							 value: 'mappingUser'
						  },
						  {
							 xtype: 'hidden',
							 name: 'id', //sp_tor_contract_id
							 id: 'idID',

						  }, Ext.PopDepartmentForm.mini, {
							 xtype: "hidden",
							 name: "i_value",
							 id: "i_value",

						  }, {
							 xtype: "buttongroup",
							 fieldLabel: "ใบสั่ง/สํญญา จอง",
							 frame: false,
							 border: false,
							 items: [
								{
								    xtype: "textfield",
								    width: 170,
								    id: "codeCTS2",
								    style: "text-align: center;font-weight:bold;background:#eee;",
								    readOnly: true,
								    value: c,
								    name: "c_contract_code"
								},
							 ],
						  }]

				    }]
			 }];
	   } else {
		  var itemsDynamic = [{
				xtype: 'tabpanel',
				plain: true,
				activeTab: 0,
				height: 435,
				deferredRender: true,
				defaults: {bodyStyle: 'padding:10px'},
				items: [{
					   title: 'สถานะของสัญญา',
					   layout: 'form',
//                                                                defaults: {width: 230},
					   labelWidth: 200,
					   defaultType: 'textfield',
//								    url: "tor/api/mnContractController.php",
					   items: [{
							 xtype: 'textfield',
							 fieldLabel: "เลขส่วนงาน",
							 name: 'c_sub',
							 readOnly: true,
							 id: 'c_subID',
						  },
						  new Ext.form.ComboBox({
							 mode: "local",
							 store: Ext.dc_cost,
							 anchor: "50%",
//      readOnly: Ext.dcCostFix,  
							 fieldLabel: "หน่วยงานเจ้าของเรื่อง",
							 valueField: "id",
							 displayField: "c_name",
							 hiddenName: "dc_cost2_id",
							 id: "dc_cost2_idID",
							 name: "c_cost_name",
							 triggerAction: "all",
							 forceSelection: true,
							 selectOnFocus: true,
							 typeAhead: false,
							 emptyText: "กรุณาเลือก...",
							 validator: function (val) {
								if (!Ext.isEmpty(val)) {
								    return true;
								} else {
								    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
								}
							 },
							 listeners: {
								beforrender: () => {

								},
								afterrender: function () {
								    this.fn = function () {
									   Ext.getCmp('c_subID').setValue(Ext.getStoreItems(this.store, this.getValue(), 'c_sub'));
								    };
								},
								Change: function () {
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
							 },
						  }),
						  {
							 xtype: "radiogroup",
							 columns: [98, 98, 98],
							 fieldLabel: "การดำเนินงาน",
							 id: "i_purchaseID",
							 name: "i_purchase",
							 items: [
								{
								    checked: true,
								    name: "i_purchase",
								    inputValue: 'ซ.',
								    boxLabel: "จัดซื้อ",
								},
								{
								    inputValue: 'จ.',
								    name: "i_purchase",
								    boxLabel: "จัดจ้าง",

								}
							 ], //radiogroup
							 listeners: {
								change: function () {
//                                                            Ext.getCmp("i_product_typeID").fn();
								},
							 },
						  },
						  {
							 xtype: "radiogroup",
							 columns: [98, 98, 98],
							 fieldLabel: "ประเภทสัญญา",
							 id: "i_type_contractID",
							 name: "i_type_contract",
							 items: [
								{
								    inputValue: '',
								    name: "i_type_contract",
								    id: "i_type_contract2", checked: true,
								    boxLabel: "ใบสั่ง",
								},
								{
								    name: "i_type_contract",
								    id: "i_type_contract1",
								    inputValue: 'สญ.',
								    boxLabel: "สัญญา",
								},
							 ], //radiogroup
						  },
						  new Ext.form.ComboBox({
							 mode: "local",
							 fieldLabel: " ปีงบประมาณ",
							 submitValue: true,
							 hiddenName: "i_yyyy",
							 name: "i_year",
							 id: "i_yearID",
							 width: 120,
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
								afterrender: function () {
								    this.fn = function () {};
								},
								Change: function () {
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
							 },
						  }),

						  {
							 xtype: 'hidden',
							 name: 'mode',
							 id: 'modeID',
							 value: 'ADD'
						  },
						  {
							 xtype: 'hidden',
							 name: 'type',
							 id: 'modeID',
							 value: 'addContract'
						  },
						  {
							 xtype: 'hidden',
							 name: 'id', //sp_tor_contract_id
							 id: 'idID',
//                                                                    },
//                                                                    {
//                                                                        xtype: "textfield",
//                                                                        width: 170,
//                                                                        fieldLabel: "ใบสั่ง/สํญญา ล่าสุด",
//                                                                        id: "codeCTS",
//                                                                        style: "text-align: center;font-weight:bold;background:#eee;",
//                                                                        readOnly: true,
//                                                                        name: "c_code"
						  }, Ext.PopDepartmentForm.mini, {
							 xtype: "buttongroup",
							 fieldLabel: "ใบสั่ง/สํญญา ล่าสุด",
							 frame: false,
							 border: false,
							 items: [
								{
								    xtype: "textfield",
								    width: 170,
								    fieldLabel: "ใบสั่ง/สํญญา ล่าสุด",
								    id: "codeCTS",
								    style: "text-align: center;font-weight:bold;background:#eee;",
								    readOnly: true,
								    name: "c_code"
								},
								{
								    xtype: "tbspacer",
								    width: 18,
								},
								{
								    xtype: "button",
								    style: {
									   color: "blue",
								    },
								    text: "เรียกดู",
								    handler: function () {

 
									   Ext.call_last = () => {
										  Ext.bookContrack.setBaseParam("i_yyyy", Ext.getCmp('i_yearID').lastSelectionText);
										  Ext.bookContrack.setBaseParam("type", "contract");
										  Ext.bookContrack.setBaseParam("i_purchase", Ext.getCmp('i_purchaseID').getValue().inputValue);
										  Ext.bookContrack.setBaseParam("i_type_contract", Ext.getCmp('i_type_contractID').getValue().inputValue);

										  Ext.bookContrack.reload({
											 callback: function (record, operation, success) {
												if (success)
												{

												    if (!Ext.isEmpty(record)) {
													   Ext.getCmp('i_value').setValue(this.data.items[0].get('id'));
													   Ext.getCmp('codeCTS').setValue(this.data.items[0].get('c_name'));
												    } else {
													   console.log('NULL');
													   Ext.getCmp('i_value').setValue(0);
													   Ext.getCmp('codeCTS').setValue("ว่าง");
												    }
												}
											 }
										  });
									   };
									   Ext.call_last();
								    }
								},
							 ],
						  }, {
							 xtype: "hidden",
							 name: "i_value",
							 id: "i_value",
//									   },
//									   {
//										  fieldLabel: "วันที่ลงนาม ",
//										  id: "d_doc_dateID",
//										  name: "d_doc_date",
//										  xtype: "datefield",
//										  width: 160,
//									   },
//									   {
//										  fieldLabel: "เรื่อง ",
//										  xtype: "textfield",
//										  width: 300,
//										  id: "c_nameID",
//										  name: "c_name",
//										  cls: "my-label-style",
						  }, {
							 xtype: "buttongroup",
							 fieldLabel: "ใบสั่ง/สํญญา จะจอง",
							 frame: false,
							 border: false,
							 items: [
								{
								    xtype: "textfield",
								    width: 170,
								    id: "codeCTS2",
								    style: "text-align: center;font-weight:bold;background:#eee;",
								    readOnly: true,
								    name: "c_contract_code"
								},
								{
								    xtype: "tbspacer",
								    width: 18,
								},
								{
								    xtype: "button",
								    style: {
									   color: "blue",
								    },
								    text: "จองใบสั่ง/สัญญา",
								    handler: function () {
									   if (Ext.getCmp('c_subID').getValue() == "") {
										  Ext.example.msg("แจ้งเตือน", 'กรุณาเลือกหน่วงานเจ้าของเรื่อง', 3);
										  return false;
									   }
									   if (Ext.getCmp('codeCTS').getValue() == "") {
										  Ext.example.msg("แจ้งเตือน", 'เรียกดูข้อมูลสัญญาล่าสุดก่อน', 3);
										  return false;
									   }
									   if (Ext.getCmp('sp_emp_idID_Name').getValue() == "") {
										  Ext.example.msg("แจ้งเตือน", 'เลือกพนักงานเจ้าของสัญญาก่อน', 3);
										  return false;
									   }


									   let number = 0;
									   let result = number + ((Ext.getCmp('i_value').getValue() * 1) + 1);
// แปลงเป็น string และเติมศูนย์ด้านหน้าให้ครบ 5 หลัก
									   let padded = result.toString().padStart(4, '0');
									   Ext.call_last();
									   Ext.c_contract = Ext.getCmp('i_type_contractID').getValue().inputValue + Ext.getCmp('i_purchaseID').getValue().inputValue

											 + "" + Ext.getCmp('c_subID').getValue()
											 + "" + padded
											 + "/" + (Ext.getCmp('i_yearID').getValue() + 543)

									   Ext.getCmp('codeCTS2').setValue(Ext.c_contract);
									   Ext.example.msg("แจ้งเตือน", Ext.c_contract, 3);



								    }
								},
							 ],
						  }, ]

				    }]
			 }];
	   }
	   var tab2 = new Ext.FormPanel({
		  //labelAlign: 'top',
		  id: 'frmSubID',
		  url: "./api/All_cost.php",
		  layout: 'fit',
		  height: 435,
		  listeners: {
			 beforerender: function () {
				this.setTitle("เลขที่สัญญา ");
			 }
		  },
		  items: itemsDynamic,
		  buttonAlign: "left",
		  buttons: [{
				text: "บันทึกสถานะสัญญา",
				id: "buSaveAllID",
				iconCls: "icon-save",
				listeners: {
				    afterrender: function ()
				    {}
				},
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
								Ext.getCmp("frmSubID").destroy();
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


				    var form = Ext.getCmp("frmSubID").getForm();
				    if (form.isValid())
				    {
					   formSubmit(form);
				    }
				}
				//haddler
			 }, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function ()
				{

				    Ext.getCmp("frmSubID").destroy();
				}
			 }]


	   }) || {};


	   Ext.getCmp("contenterCenter").add(tab2);
	   Ext.getCmp("contenterCenter").setActiveTab(tab2);
    }; //Fun AddTab

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
//OnLoad Renderer
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.AppUx("SP", "TOR สมบูรณ์"); //app & show menu
    var App = new Ext.Viewport({
	   layout: "border",
	   items: new Ext.TabPanel({
		  region: "center",
		  border: false,
		  id: "contenterCenter",
		  defaults: {
			 autoScroll: true,
			 layout: 'fit'
		  },
		  listeners: {
			 afterrender: function () {
				Ext.getCmp("tabpanel1").getStore().load();

			 }
		  },
		  items: [new gridMain()]
	   })
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    Ext.getCmp("tabpanel1").on('beforeedit', function () {
	   return false;
    });


});