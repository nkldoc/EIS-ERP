  const winDisable_admin = function (BOOLE, record_data) {
    let msg = "";

    if (msg == "") {
      var win = new Ext.Window({
        id: "MessageBox_re",
        title: "ยืนยันยกเลิกรายการ ",
        modal: true,
        maximizable: false,
        resizable: false,
        width: 310,
        items: [
          {
            xtype: "form",
            frame: true,
            labelAlign: "right",
            labelWidth: 0.1,
            bodyStyle: { padding: "10px 20px" },
            defaults: { anchor: "100%", msgTarget: "side" },
            items: [
              {
                xtype: "displayfield",
                id: "displaytext",
                width: 200,
                value: BOOLE
                  ? `
                    <span style='color: red; white-space: nowrap; font-size: 15px;'>*รายการจะถูกยกเลิกการใช้งาน</span>
                    <br><span style='color: red; white-space: nowrap;'>ท่านต้องการยืนยัน <b><u>ยกเลิกการใช้งาน</u></b> ?</span>
                  `
                  : `<span style='color: green; white-space: nowrap; font-size: 15px;'>*เปิดใช้งานรายการ</span>`,
                style: "text-align: center;",
              },
              {
                xtype: "textarea",
                hidden: BOOLE ? false : true,
                emptyText: "สาเหตุยกเลิกรายการ...",
                id: "c_comment_restatus",
                width: 300,
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "ยืนยัน",
            id: "btn_save-MessageBox_re",
            icon: BOOLE ? "../images/icons/delete.png" : "../images/icons/yes.gif",
            listeners: {
              afterrender: function () {
                btn_set_color(this, BOOLE ? "red" : "green"); //color : green, red, yellow, orange
              },
            },
            handler: function () {
              let msg = "";
              if (msg == "") {
                Ext.Msg.wait("Uploading...");

                Ext.Ajax.request({
                  url: "api/mn_poSendStatusAll.php",
                  method: "POST",
                  params: {
                    mode: BOOLE ? "DISABLE_admin" : "ENABLE_admin",
                    id: record_data.data.id,
                    begin_hdr_id: record_data.data.po_working_begin_hdr_id,
                    i_status: Ext.I_STATUS,
                    i_sub_status: Ext.I_SUB_STATUS,
                    i_sub_status_before: Ext.I_SUB_STATUS_BEFORE,
                    c_comment: Ext.getCmp("c_comment_restatus").getValue(),
                    re_protest: record_data.data.i_sub_status == "3.00" ? 1 : 0,
                  },
                  success: function (result, request) {
                    let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success == true) {
                      Ext.store.load({ params: { mode: "" } });
                      Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                      Ext.getCmp("MessageBox_re").hide();
                      Ext.getCmp("MessageBox_re").destroy();
                      Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                      Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {};
                    } else {
                      Ext.MessageBox.alert("แจ้งเตือน", '<font color="red" style="white-space: nowrap;">' + jsonData.msg + "</font>");
                    }
                  },
                  failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                  },
                });
              } else {
                Ext.Msg.alert("แจ้งเตือนddd", msg);
              }
            },
          },
          { xtype: "tbfill" },
          {
            text: "ย้อนกลับ",
            handler: function () {
              Ext.getCmp("MessageBox_re").hide();
              Ext.getCmp("MessageBox_re").destroy();
            },
          },
        ],
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  }; // reStatus

  function copyToClipboard(str) {
    var el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    var selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    Ext.example.msg("Copied to Clipboard.&nbsp;", "- คัดลอกไปยังคลิปบอร์ดสำเร็จ", 1);
    $(this).next("text copied");
    setTimeout(function () {
      $(this).next().remove();
    }, 2000);
  }

  const Preview = function (id) {
    let url = "../po/preview/Pre_Working.php";
    let loader_display = '<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;"><div class="loader"></div><p>&nbsp;&nbsp;กำลังโหลดสถานะกรุณารอสักครู่...</p></div>';

    new Ext.Window({
      title: "แสดงสถานะใบขอเบิก",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: loader_display + '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "printer_mono",
          handler: function () {
            document.printf.window.print();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Preview").destroy();
          },
        },
      ],
      listeners: {
        afterrender: function () {
          $("iframe")
            .load(function () {
              document.getElementById("loader_display").remove();
            })
            .show();
        },
      },
    }).show();
  };

  const setNumberByName = function (form, arr_name) {
    var items = form.items.items;
    arr_name.forEach((name) => {
      var index = items.findIndex((item) => item.name === name);
      var item = items[index];
      item.setValue(floatRenderer(floatMinus(item.getValue().replace(/,/g, ""), 2)));
    });
  };

  function StoreLoadWithPromise(store, params) {
    return new Promise((resolve, reject) => {
      store.load({
        params: params,
        callback: (records, operation, success) => {
          success ? resolve(records) : reject(`Failed to load ${store}`);
        },
      });
    });
  }

Ext.AppUx = function (app, menu)
{
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.costID = 38; //หน่วยงานผู้รับผิดชอบ พัสดุ 
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
    Ext.yearTh = function () {
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
        return years;
    };
    //
    Ext.butTxtEdit = " แก้ไข ";
    Ext.butTxtAdd = " ทำรายการ ";
    Ext.butTxtSign = " ลงนาม ";
    Ext.butTxtApprove = " อนุมัติ ";
    //
//AutoLoad 
    Ext.keyData = 1; //type data key in 
    Ext.poFormID = "grid-form-cheque";
    Ext.getDate = Ext.apply({
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
    Ext.groupSearHeight = 120;
    //interlizing 
//gridColumn   

    var expander = new Ext.ux.grid.RowExpander({
 
       /**
     * @cfg {Boolean} expandOnEnter
     * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
     * key is pressed (defaults to <tt>true</tt>).
     */
    expandOnEnter : true,
    /**
     * @cfg {Boolean} expandOnDblClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnDblClick : true, 
    header : '',
    width : 23,
    sortable : false,
    fixed : true,
    hideable: false,
    menuDisabled : true,
    dataIndex : '',
    id : 'expander',
    lazyRender : true,
    enableCaching : true,
        tpl: new Ext.Template(
                '<p style="font-weight:bold;"> รายละเอียด ',
                '<div style="padding-left:35px; border-top:1px solid #ece;">',
                '<p><b>ขอดำเนินการ</b> : {step_document}',
                '<p><b>ชื่อรายการ </b>: {c_name}',
                '<p><b>เลขที่ PR </b>: {c_code}',
                '<p><b>เเลขที่ อ้างอิง </b>: {d_doc_ref}',
                )

    }); 
    var sm = new Ext.grid.CheckboxSelectionModel({
        renderer : function(v, p, record){
            return '<div class="x-grid3-row-checker">&#160;</div>';
        } 
    });
    var styleBu = 'style="width:auto; min-width:85px; display: flex; height: 18px; padding: 0px 5px 0px 17px;"';
 
// Ext.styleBt.style,
    Ext.buStyle = Ext.apply({ 
     style: {
        backgroundImage: 'url(../images/icons/magnifier2.png)',
        display: 'flex',
        height:'18px',
        padding:'0px 15px 0px 15px',
        boxSizing: 'border-box',
        fontVariant: 'small-caps', 
        backgroundColor: 'buttonface',
        margin: '1em',
        paddingBlock: '1px',
//        paddingInline: '6psx',
        borderWidth: '1px',
        with: '150px',
        borderStyle: 'outset',
        borderColor: 'buttonborder',   
        fontFamily: 'Tahoma, sans-serif',
        fontSize: '10px', 
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '5px center',
        paddingLeft: '15px'  // เผื่อที่ให้ข้อความไม่ทับกับไอคอน
        
    }   //display: flex; height: 18px; padding: 0px 15px 0px 15px;
    }); 
    
    Ext.gridColumn= Ext.apply({column:[
                expander, 
                sm,   
                { //  step_document  step_sign status_approve approve_by
                    id: "editColID",
                    header: "-",
                    align: "center",
                    fixed: true,
                    menuDisabled: true,
                    width: 110,
                    dataIndex: "id",
                    renderer: function (value, metaData, record, row, col, store, gridView) {  
                        
                        var val =(record.get('sp_approval_hdr_id') === 0)?Ext.butTxtAdd:Ext.butTxtEdit;  
                        var BtnText = "<img src='../images/icons/vcard_edit.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>"+val+"</spen>"; 
                        return '<button '+styleBu+' type="button">' + BtnText + "</button>";

                    }
                },
                {
                    id: "delete",
                    header: "-",
                    fixed: true,
                    menuDisabled: true,
                    align: "center",
                    width:90,
                    dataIndex: "id",
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("i_use") == 1) { 
                            return "<font color=green>มีการใช้งานในระบบ</font>";
                        } else {
                            var BtnText = "<img src='../images/icons/control_remove_blue.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspลบ&nbsp</spen>";
                            return '<button '+styleBu+' type="button">' + BtnText + "</button>";

                        }
                    }
                },
                {
                    header: "เอกสารที่ดำเนินการ",
                    width: 239,
                    align: "center",
                    dataIndex: "step_document", 
//                    fixed: true, 
//                    menuDisabled: true, 
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        var txtBt =value;  metaData.attr = 'ext:qtip="' + value + '"'; 
//                        var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
//                                + txtBt+ "</b>&nbsp</spen>"; 
//                        var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
                        return txtBt; 
                    } 
        }, {
                    header: "ขั้นตอนอนุมัติ",
                    width: 199,
                    align: "center",
                    dataIndex: "step_sign", 
                   /* fixed: true, 
                    menuDisabled: true, 
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                         var txtBt = value;
                          metaData.attr = 'ext:qtip="' + value + '"'; 
                        var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
                                + txtBt+ "</b>&nbsp</spen>"; 
                        var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
                        return btSet; 
                    } */
        }, {
                    header: "สถานะลงนาม/อนุมิติ",
                    width: 159,
                    align: "center",
                    dataIndex: "status_approve", 
//                    fixed: true, 
//                    menuDisabled: true, 
//                    renderer: function (value, metaData, record, rowIndex, colIndex, store) { 
//                          metaData.attr = 'ext:qtip="' + value + '"'; 
//                        var txtBt = value;
//                        var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
//                                + txtBt+ "</b>&nbsp</spen>"; 
//                        var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
//                        return btSet; 
//                    } 
  
        },
        {
                    header: "เอกสารประกอบ",
                    sortable: false, width: 109,
                    fixed: true, menuDisabled: true,
                    align: "center",
                    dataIndex: "c_file_pdf_dtl",
                    // editor: new Ext.form.TextField({}),
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบ&nbsp</spen>";
                        return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code_ref + '\')" type="button">' + BtnText + "</button>";
                        if (record.data.i_pdf_dtl_outside == 1) {
                            // var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color:red;'>ㅤนอกระบบㅤㅤ</spen>";
                        } else {
                        }
                        if (record.data.i_is_url_pdf_dtl == null) {
                            return "-";
                        } else if (record.data.i_is_url_pdf_dtl == 0) {
                        } else {
                            return "-";
                        }
                    },
    //                },
    //                {
    //
    //                    id: "view",
    //                    header: "-",
    //                    align: "center",
    //                    fixed: true,
    //                    menuDisabled: true,
    //                    width: 90,
    //                    dataIndex: "id",
    //                    renderer: function (value, metaData, record, row, col, store, gridView) {
    //                        var BtnText = "<img src='../images/icons/application_view_columns.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspแสดง&nbsp</spen>";
    //                        return '<button '+styleBu+' type="button">' + BtnText + "</button>";
    //                    }
                },
                {
               
                    id: "c_name",
                    header: "รายการซื้อจ้าง    ",
                     width:180,
                    align: "center", 
                    dataIndex: "c_name",
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        metaData.attr = "style='text-align: left;'";
                        return value;
                    }
                }, {
                    header: "id",
                    sortable: false,
                    align: "left",
                    dataIndex: "id",
                    hidden: true, // icon: "../images/icons/application_view_tile.png"
                },
                {
                    header: "เลขที่อ้างอิง",
                    sortable: true,
                    align: "left",
                    dataIndex: "d_doc_ref",
                    width: 150,
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        return value;
                    },
                },
                {
                    header: "เลขที่ PR",
                    sortable: true,
                    dataIndex: "c_code",
                    width: 130,
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                        if (false) {
                            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                        } else {
                            metaData.attr = "";
                        }
                        return value; //DategetShortDateMonthName(value);
                    }
                },{
                    header: "ชื่อผู้ดำเนินการ",
                    align: "left",
                    hidden: true,
                    dataIndex: "ap_sp_emp_name",
                   
//                }, {
//                    header: "ชื่อพนักงานเบิก",
//                    align: "left",
//                    dataIndex: "withdraw_name",
//                    width: 180,
                },
                {
                    header: "หน่วยงานเจ้าของเรื่อง",
                    align: "left",
                    hidden: true,
                    dataIndex: "dc_cost_idTxt",
                },
                {
                    header: "ชื่อผู้สร้างรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_create_name",
                    hidden: true,
                },
                {
                    header: "หน่วยงานผู้สร้าง",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_create_cost_name",
                    hidden: true,
                },
                {
                    header: "วันที่สร้างรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "d_create",
                    hidden: true,
                    renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                        return shortThaiDate(val);
                    },
                },
                {
                    header: "ชื่อผู้แก้ไขรายการ",
                    sortable: false,
                    hidden: true,
                    align: "center",
                    dataIndex: "dc_user_update_name",
                },
                {
                    header: "หน่วยงานแก้ไขรายการ",
                    sortable: false,
                    hidden: true,
                    align: "center",
                    dataIndex: "dc_user_update_cost_name",
                },
                {
                    header: "วันที่แก้ไขรายการ",
                    sortable: false,
                    hidden: true,
                    align: "center",
                    dataIndex: "d_update",
                    renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                        return shortThaiDate(val);
                    },
                }
                , { header: "", menuDisabled: true, } 
            ]});
        
    Ext.gridtbar = Ext.apply({tbar:[
                {
                    xtype: "buttongroup",
                    columns: 1,
                    title: "ระบุเงื่อนไขในการค้นหาข้อมูล <a href='#' onclick='sp_manual(event)'>คู่มือ</a>",
                    height: Ext.groupSearHeight,
                    defaults: {scale: "small", style: "font-size:10px; float: left"},
                    labelWidth: 180,
                    layout: {
                        align: 'top',
                        pack: 'left',
                        type: 'vbox'
                    },
                    items: [
                        {
                            xtype: "buttongroup",
                            frame: false,
                            id: 'tbarBtId',
                            items: [
                                {xtype: "label", text: "ค้นหาโดย : "},
                                {xtype: "tbspacer", width: 4},
                                {
                                    id: "filter",
                                    xtype: "combo",
                                    width: 300,
                                    mode: "local",
                                    store: new Ext.data.SimpleStore({
                                        fields: ["value", "text"],
                                        data: [
                                            //   ["sql", "SQL"],
                                            //   ["tor_id", "hdr_id"],
                                            //   ["sp_tor_contract_id", "sp_tor_contract_id"],
                                            ["c_code", "เลขที่ตรวจรับ"],
                                            ["c_arrive_code", "เลขที่รับของ"],
                                            ["d_code", "เลขที่ใบเบิก"],
                                            ["c_overlap", "เลขที่ใบกัน"],
                                            ["c_code_po", "เลขสัญญา"],
                                            // ["c_code", "เลขที่ PR"],
                                            ["dc_creditor_name", "ผู้ขายผุ้รับจ้าง"],
                                            ["dc_creditor_tax_numbe", "เลชประจำตัวผู้เสียภาษีผู้ขายผุ้รับจ้าง"],
                                        ],
                                    }),
                                    value: "c_code",
                                    valueField: "value",
                                    displayField: "text",
                                    allowBlank: false,
                                    editable: false,
                                    triggerAction: "all",
                                    typeAhead: false,
                                },
                                {xtype: "tbspacer", width: 4},
                                {
                                    xtype: "textfield",
                                    id: "value-box",
                                    width: 196,
                                    fieldLabel: "fieldLabel",
                                    emptyText: "คำที่ต้องการค้นหา",
                                },
                            ],
                        },
                        {
                            xtype: "buttongroup",
                            frame: false,
                            items: [
                                {xtype: "label", text: "แหล่งเงิน : "},
                                {xtype: "tbspacer", width: 4},
                                new Ext.form.ComboBox({
                                    id: "s_dc_expense_budget_type_id",
                                    mode: "local",
                                    store: Ext.dc_expense_budget_type_all,
                                    valueField: "id",
                                    displayField: "c_name",
                                    triggerAction: "all",
                                    forceSelection: true,
                                    selectOnFocus: true,
                                    typeAhead: false,
                                    emptyText: "กรุณาเลือก...",
                                    width: 400,
                                    value: "0",
                                    listeners: {
                                        afterrender: function () {
                                            this.fn = function () {};
                                        },
                                        change: function (combo, newValue) {
                                            if (newValue == "") {
                                                combo.reset();
                                            }
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
                            ],
                        }, {
                            xtype: "buttongroup",
                            frame: false,
                            items: [{xtype: "label", text: "สถานะ : "},
                                {xtype: "tbspacer", width: 4},
                                {
                                    id: "s_i_statusID",
                                    xtype: "combo",
                                    anchor: "40%",
                                    mode: "local",
                                    store: new Ext.data.SimpleStore({
                                        fields: ["value", "text"],
                                        data: [
                                            ["0", "ทั้งหมด"],
                                            ["1", "1 - รอตรวจรับ"],
                                            ["2", "2 - รอวางบิล"],
                                            ["3", "3 - ออกเลขวางบิล"],
                                            ["4", "4 - ผ่านวางบิลแล้ว(รอเบิก)"],
                                            ["5", "5 - เบิกแล้ว"],
                                        ],
                                    }),
                                    value: "0",
                                    valueField: "value",
                                    displayField: "text",
                                    allowBlank: false,
                                    editable: false,
                                    triggerAction: "all",
                                    typeAhead: false,
                                },
                                {xtype: "label", text: "สถานะ : "},
                                {
                                    id: "s_i_product_typeID",
                                    xtype: "combo",
                                    width: 100,
                                    mode: "local",
                                    store: new Ext.data.SimpleStore({
                                        fields: ["value", "text"],
                                        data: [
                                            ["0", "ทั้งหมด"],
                                            ["1", "1 - วัสดุ"],
                                            ["2", "2 - ครุภัณฑ์"],
                                            ["3", "3 - ไม่ระบุของ"],
                                                    // ["3", "3 - ทักท้วง"],
                                                    // ["4", "4 - อนุมัติฏีกา"],
                                                    // ["5", "5 - หัวหน้าฝ่ายการคลังลงนาม"],
                                                    // ["6", "6 - ผู้บริหารลงนาม"],
                                                    // ["7", "7 - ผู้บริหารลงนาม"],
                                                    // ["8", "8 - จัดทำเช็ค"],
                                                    // ["9", "9 - หัวหน้าฝ่ายการคลังลงนามเช็ค"],
                                                    // ["10", "10 - ผู้บริหารลงนามเช็ค"],
                                                    // ["11", "11 - ทำทะเบียนจ่าย"],
                                        ],
                                    }),
                                    value: "0",
                                    valueField: "value",
                                    displayField: "text",
                                    allowBlank: false,
                                    editable: false,
                                    triggerAction: "all",
                                    typeAhead: false,
                                },
                                {xtype: "tbfill"},
                            ],
                        }, {
                            xtype: "buttongroup",
                            frame: false, 
                            items: [{xtype: "label", text: "ค้นหาโดย : "},
                                {
                                    text: "ค้นหา",
                                    width: 100,
                                    iconCls: "icon-save-page",
                                    xtype: "button",
                                    layout: {
                                        type: "hbox",
                                        align: "right",
                                        pack: "end"
                                    },
                                    handler: function () {
                                        Ext.gridtSearch.search();
                                    },
                                }, {
                                xtype: "label", text: ""},{
                                xtype: "label", text: ""},{
                                    text: "บันทีกแบบขออนุมัติเอกสาร",
                                    width: 100,
                                    iconCls: "icon-save-page",
                                    xtype: "button",
                                    layout: {
                                        type: "hbox",
                                        align: "right",
                                        pack: "end"
                                    },
                                    handler: function () { 
                                        controllTab({},"ADD");
                                    } 
                                }
                            ],
                        },
                    ],
                },
                {
                    xtype: "buttongroup",
                    columns: 1,
                    height: Ext.groupSearHeight,
                    defaults: {scale: "small", style: "float: right" },
                 
//                    items: [
//                        {
//                            xtype: "buttongroup",
//                            frame: false,
//                            items: [
//                                {xtype: "label", text: "ปีประมาณ : "},
//                                {xtype: "tbspacer", width: 4},
//                                new Ext.form.ComboBox({
//                                    id: "s_i_budget_year",
//                                    mode: "local",
//                                    store: Ext.store_yearSearch,
//                                    valueField: "id",
//                                    displayField: "c_name",
//                                    triggerAction: "all",
//                                    forceSelection: true,
//                                    selectOnFocus: true,
//                                    typeAhead: false,
//                                    emptyText: "กรุณาเลือก...",
//                                    width: 284,
//                                    value: 0,
//                                    //   value: Ext.bgYear,
//                                    listeners: {
//                                        afterrender: function () {
//                                            this.fn = function () {};
//                                        },
//                                        change: function (combo, newValue) {
//                                            if (newValue == "") {
//                                                combo.reset();
//                                            }
//                                        },
//                                        beforequery: function (q) {
//                                            if (q.query) {
//                                                var length = q.query.length;
//                                                q.query = new RegExp(Ext.escapeRe(q.query));
//                                                q.query.length = length;
//                                            }
//                                        },
//                                        blur: function () {
//                                            this.getStore().clearFilter();
//                                        },
//                                    },
//                                }),
//                            ],
//                        },
//                        {
//                            xtype: "buttongroup",
//                            frame: false,
//                            items: [
//                                {xtype: "label", text: "ปีที่ใช้ประมาณ : "},
//                                {xtype: "tbspacer", width: 4},
//                                new Ext.form.ComboBox({
//                                    id: "s_i_budget_year_overlap",
//                                    mode: "local",
//                                    store: Ext.store_yearSearch,
//                                    valueField: "id",
//                                    displayField: "c_name",
//                                    triggerAction: "all",
//                                    forceSelection: true,
//                                    selectOnFocus: true,
//                                    typeAhead: false,
//                                    emptyText: "กรุณาเลือก...",
//                                    width: 284,
//                                    value: 0,
//                                    //   value: Ext.bgYear,
//                                    listeners: {
//                                        afterrender: function () {
//                                            this.fn = function () {};
//                                        },
//                                        change: function (combo, newValue) {
//                                            if (newValue == "") {
//                                                combo.reset();
//                                            }
//                                        },
//                                        beforequery: function (q) {
//                                            if (q.query) {
//                                                var length = q.query.length;
//                                                q.query = new RegExp(Ext.escapeRe(q.query));
//                                                q.query.length = length;
//                                            }
//                                        },
//                                        blur: function () {
//                                            this.getStore().clearFilter();
//                                        },
//                                    },
//                                }),
//                            ],
//                        },
//                        {
//                            xtype: "buttongroup",
//                            frame: false,
//                            //   hidden:true,
//
//                            items: [
//                                {xtype: "label", text: "ปีของสัญญา : "},
//                                {xtype: "tbspacer", width: 4},
//                                new Ext.form.ComboBox({
//                                    id: "s_i_year_contract",
//                                    mode: "local",
//                                    store: Ext.store_yearSearch,
//                                    valueField: "id",
//                                    displayField: "c_name",
//                                    triggerAction: "all",
//                                    forceSelection: true,
//                                    selectOnFocus: true,
//                                    typeAhead: false,
//                                    emptyText: "กรุณาเลือก...",
//                                    width: 284,
//                                    value: "0",
//                                    listeners: {
//                                        afterrender: function () {
//                                            this.fn = function () {};
//                                        },
//                                        change: function (combo, newValue) {
//                                            if (newValue == "") {
//                                                combo.reset();
//                                            }
//                                        },
//                                        beforequery: function (q) {
//                                            if (q.query) {
//                                                var length = q.query.length;
//                                                q.query = new RegExp(Ext.escapeRe(q.query));
//                                                q.query.length = length;
//                                            }
//                                        },
//                                        blur: function () {
//                                            this.getStore().clearFilter();
//                                        },
//                                    },
//                                }),
//                            ],
//                        },
//                        {
//                            xtype: "buttongroup",
//                            frame: false,
//                            //   hidden:true,
//                            items: [
//                                {xtype: "label", text: "ประเภทสัญญา : "},
//                                {xtype: "tbspacer", width: 4},
//                                {
//                                    id: "i_type_contract",
//                                    xtype: "combo",
//                                    width: 159,
//                                    mode: "local",
//                                    store: new Ext.data.SimpleStore({
//                                        fields: ["value", "text"],
//                                        data: [
//                                            ["0", "ทั้งหมด"],
//                                            ["1", "สัญญา"],
//                                            ["2", "ใบสั่ง"],
//                                            ["3", "จะซื้อจะขาย"],
//                                                    //   ["4", "รับคืนทักท้วง (หน่วยงาน)"],
//                                                    //   ["5", "บันทึกโดยระบบบริหารพัสดุ"],
//                                        ],
//                                    }),
//                                    value: "0",
//                                    valueField: "value",
//                                    displayField: "text",
//                                    allowBlank: false,
//                                    editable: false,
//                                    triggerAction: "all",
//                                    typeAhead: false,
//                                },
//                                {xtype: "tbspacer", width: 4},
//                                {xtype: "label", text: "สถานะการจอง : "},
//                                {xtype: "tbspacer", width: 4},
//                                {
//                                    id: "s_i_enable",
//                                    xtype: "combo",
//                                    readOnly: true,
//                                    width: 80,
//                                    mode: "local",
//                                    store: new Ext.data.SimpleStore({
//                                        fields: ["value", "text"],
//                                        data: [
//                                            ["0", "ทั้งหมด"],
//                                            ["1", "ใช้เงินแล้ว"],
//                                            ["2", "ยังไม่ได้ระบุ"],
//                                            ["3", "ไม่ต้องระบุ"],
//                                        ],
//                                    }),
//                                    value: "0",
//                                    valueField: "value",
//                                    displayField: "text",
//                                    allowBlank: false,
//                                    editable: false,
//                                    triggerAction: "all",
//                                    typeAhead: false,
//                                },
//                            ],
//                        },
//                        {
//                            xtype: "buttongroup",
//                            fieldLabel: "",
//                            hidden: true,
//                            height: 22,
//                            frame: false,
//                            items: [
//                                {xtype: "label", text: "วันที่สร้างรายการ : "},
//                                {xtype: "tbspacer", width: 4},
//                                new Ext.form.Checkbox({
//                                    id: "checkbox_date",
//                                    boxLabel: "",
//                                    inputValue: 1,
//                                    checked: false,
//                                    listeners: {
//                                        afterrender: function () {},
//                                        check: function (combo, newValue) {
//                                            if (newValue == true) {
//                                                Ext.getCmp("date_start").show();
//                                                Ext.getCmp("date_end").show();
//                                                Ext.getCmp("displayfield_date").show();
//                                            } else {
//                                                Ext.getCmp("date_start").hide();
//                                                Ext.getCmp("date_end").hide();
//                                                Ext.getCmp("displayfield_date").hide();
//                                            }
//                                        },
//                                    },
//                                }),
//                                {xtype: "tbspacer", width: 4},
//                                {
//                                    xtype: "datefield",
//                                    id: "date_start",
//                                    width: 110,
//                                    value: addY(543),
//                                },
//                                {
//                                    xtype: "displayfield",
//                                    value: "&nbsp;&nbsp;ถึงวันที่&nbsp;&nbsp;",
//                                    id: "displayfield_date",
//                                    align: "center",
//                                },
//                                {
//                                    xtype: "datefield",
//                                    id: "date_end",
//                                    width: 110,
//                                    value: addY(543),
//                                },
//                                {xtype: "tbspacer", width: 269},
//                            ],
//                            listeners: {
//                                afterrender: function () {
//                                    Ext.getCmp("date_start").hide();
//                                    Ext.getCmp("date_end").hide();
//                                    Ext.getCmp("displayfield_date").hide();
//                                },
//                            },
//                        },
//                        {
//                            xtype: "buttongroup",
//                            hidden: true,
//                            frame: false,
//                            items: [
//                                {xtype: "label", text: " : "},
//                                {xtype: "tbspacer", width: 4},
//                                {xtype: "tbspacer", width: 7},
//                                new Ext.form.Checkbox({
//                                    id: "s_checkbox_c_code_po",
//                                    boxLabel: "มีเลขที่สัญญา",
//                                    inputValue: 1,
//                                    checked: false,
//                                    listeners: {
//                                        check: function (combo, newValue) {
//                                        },
//                                    },
//                                }),
//                                {xtype: "tbspacer", width: 7},
//                                new Ext.form.Checkbox({
//                                    id: "s_i_booking",
//                                    boxLabel: "มีเลขที่ PR",
//                                    inputValue: 1,
//                                    checked: false,
//                                    listeners: {
//                                        check: function (combo, newValue) {
//                                        },
//                                    },
//                                }),
//                                {xtype: "tbspacer", width: 7},
//                                new Ext.form.Checkbox({
//                                    id: "i_pdf",
//                                    boxLabel: "ที่มีเอกสาร PDF",
//                                    inputValue: 1,
//                                    checked: false,
//                                    listeners: {
//                                        check: function (combo, newValue) {
//                                        },
//                                    },
//                                }),
//                                {xtype: "tbspacer", width: 0},
//                            ],
//                        },
//                    ],
                },
                {xtype: "tbfill"}, 
                {
                    xtype: "container",
                    items: [
                        {xtype: "container", height: 92},
                        {
                            xtype: "label",
                            html: '<img src="../images/icons/information.png">',
                            listeners: {
                                render: function (c) {
                                    var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
                                    var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span>ผ่านรายการ</span>";
                                    //   var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #DEDEDE;'>∎</span></span><br>";
                                    //   text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FFEBEB;'>∎</span> รายการยกเลิก</span><br>";
                                    new Ext.ToolTip({
                                        target: c.id,
                                        anchor: "top",
                                        html: text_ToolTip,
                                        bodyStyle: {
                                            backgroundColor: "#FFFFFF",
                                        },
                                    });
                                },
                            },
                        },
                    ],
                }, '->',
                new Ext.form.TwinTriggerField({
                    xtype: 'twintriggerfield',
                    trigger1Class: 'x-form-clear-trigger',
                    trigger2Class: 'x-form-search-trigger',
                    onTrigger1Click: function ( ) {
                        alert(1);
                        Ext.getCmp("gridID").getSelectionModel( ).selectRow(2);
                    }, onTrigger2Click: function ( ) {
                        
                        Ext.getCmp("gridID").getSelectionModel( ).selectRow(0);
                    }
                })
            ]});     
        
    Ext.gridtSearch = Ext.apply({search:function () {
            var msg = "";
            if (msg == "") {
                Ext.store.setBaseParam("mode", "LIST_SUB_PERIOD_HDR");
                Ext.store.setBaseParam("type", "SEARCH");
                Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                Ext.store.setBaseParam("i_type_contract", Ext.getCmp("i_type_contract").getValue());
                Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
                Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
                Ext.store.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
                Ext.store.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());
                Ext.store.setBaseParam("i_product_type", Ext.getCmp("s_i_product_typeID").getValue());
                Ext.store.setBaseParam("i_status", Ext.getCmp("s_i_statusID").getValue()); 
            } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
            }
            Ext.store.load();
        }
    });
    
    Ext.gridBbar = Ext.apply({bbar:[{xtype: 'button', iconCls: "icon-save", text: 'บันทีกรายการที่เลือก'},' ', '->', 
                        new Ext.PagingToolbar({
                            pageSize: 20,
                            store:Ext.store,
                            displayInfo: true,
                            displayMsg: "Displaying topics {0} - {1} of {2}",
                        })
                    ]});
                
                
    Ext.gridListeners = Ext.apply({  });            
    Ext.extend((gridMain = function () { 
        
        //plug in checkbox expan 
        gridMain.superclass.constructor.call(this, {
            region: "center",
            iconCls: 'icon-application-view-list',
            padding: "10px 10px 10px 10px",
            frame: true,
            loadMask: true, trackMouseOver: false,
            title: Ext.menu_name, 
            id: "tabpanel1",
            border: true,
//            stripeRows: true, 
            layout: "fit",
            //------------------
            sm: sm, 
            autoScroll: true, 
            plugins: expander,
            clicksToEdit:1,
            store: Ext.store,
            tbar: Ext.gridtbar.tbar,
            columns: Ext.gridColumn.column,
            viewConfig: { 
                emptyText: "ไม่มีข้อมูล..",
                deferEmptyText: false, 
            }, 
            bbar:Ext.gridBbar.bbar,  
            listeners:{ 
                dblclick: function (dataview, index, item, e) {
//                     Ext.buAct = "update";
//                     Ext.loadStore("edit", true); // app,data.load
                }, 
                viewready: function (grid){  
                    grid.getView().mainBody.on('click', function(e, t) {
                            var view = grid.getView();

                            var rowIndex = view.findRowIndex(t);   // หา row index
                            var colIndex = view.findCellIndex(t);  // หา column index
 
                            var record = grid.getStore().getAt(rowIndex);
                            var fieldName = grid.getColumnModel().getDataIndex(colIndex);


//                                console.log('rowIndex:', rowIndex);
//                                console.log('colIndex:', colIndex);
//                                console.log('fieldName:', fieldName);
//                                console.log('record:', record.data);
            
                           if (colIndex ===  grid.getColumnModel().getIndexById("editColID")) {
                               controllTab(record, record.get('sp_approval_hdr_id')>0?'EDIT':'ADD'); //on  
                            }
                    
                    }, null, { delegate: 'button' });
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
                   
            
                },
                afterrender: function  (grid, rowIndex, columnIndex, e)
                { 
                                 
                    
                    this.RowContextMenu = new Ext.menu.Menu({  
                        items: [
                                    {
                                        text: "แก้ไขรายละเอียดสัญญา",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e)
                                        {
                                       
                                        },
                                        scope: this
                                    }]
                    }); 
                                this.on("cellclick", cellClick, this);
                                this.on("contextmenu", function (dataview, index, item, e) 
                                {
                                            // Use preventDefault to stop the default context menu
                                            e.preventDefault();
                                            // Optionally, stop the event from bubbling
                                            // e.stopPropagation();
                                            this.RowContextMenu.showAt(e.getXY());
                                 }, this);

                     
                }
            }
        });
    }
    ), Ext.grid.GridPanel, {}); 
    //EditorGridPanel


function cellClick(grid, rowIndex, columnIndex, e)
{ 
    var rec = grid.getStore().getAt(rowIndex); 
    var statust = value;
    console.log(rec);
    controllTab(rec, rec.get('sp_approval_hdr_id')>0?'EDIT':'ADD',evnt); //on
 
} 
function controllTab(rec , evnt){ 
if(Ext.getCmp("frm-Add")) Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
if(Ext.getCmp("frm-Dtl"))Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {}; // null obj not errer
if(Ext.getCmp("PanelDtl"))Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
if(Ext.getCmp("MutiSave"))Ext.getCmp("contenterCenter").remove(Ext.getCmp("MutiSave"), true) || {}; // null obj not errer
  
 if (evnt == "ADD") {
      Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
 }
  Ext.butt = evnt;  
 
 
      Promise.all([])
        .then(() => {
          Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
        })
        .then(() => {
          return StoreLoadWithPromise(Ext.sp_status_document_items,{ sp_approval_hdr_id: rec.get('sp_approval_hdr_id') });
        })  
        .then(() => {
          return new Promise((resolve, reject) => {
      
                let frmAdd = new formAdd(rec); 
//              let frmDtl = new formPanelDtl(record.data);
//              Ext.getCmp("contenterCenter").add(frmDtl);
//              Ext.getCmp("contenterCenter").setActiveTab(frmDtl);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("ADD");
            Ext.getCmp("form-widgets").getForm().loadRecord(rec);
       
            resolve();
          });
        }).catch((error) => {
          console.error(error);
        })
        .finally(() => {
          Ext.getCmp("contenterCenter").getEl().unmask();
        });
    }}; // controllTab
// 
//OnLoad Renderer App
Ext.onReady(function () {
    Ext.QuickTips.init();
   
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = 'บันทึกใบขอซื้อจ้าง <font color="/blue/">(ลงนาม เอกสารภายใน)</font>';
    Ext.menu_name = Ext.title;
    Ext.AppUx("SP", Ext.menu_code); //app & show menu
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
            items: [new gridMain()],
            listeners: { 
             afterrender: function () {  
                            fnLoad =()=>{
                //                          Ext.po_working_parent_view.setBaseParam("id", rec.po_working_hdr_id);
                //                          Ext.po_working_parent_view.load(); 
                                            Ext.getCmp("contenterCenter").setActiveTab("tabpanel1"); 
                                            Ext.Ajax.request({
                                                url: './app/conf/config.json',
                                                method: 'GET',
                                                success: function (response) {

                                                        Ext.config = Ext.decode(response.responseText); 
                                                        Ext.menu_code = Ext.config.status_step_document[1].c_code; // {APSTEP11,APSTEP21}
                                                        Ext.store.setBaseParam("type", Ext.status_sigature_document);
                                                        Ext.getCmp("contenterCenter").getEl().unmask(); 

                                                },
                                                failure: function (response) {
                                                    Ext.Msg.alert('Error', 'Failed to load config.json'); 
                                                    Ext.getCmp("contenterCenter").getEl().unmask(); 
                                                } 
                                            });
                                    }; 
                            fnLoad();
                     
             }
            } 
           
        }),
    });  
});