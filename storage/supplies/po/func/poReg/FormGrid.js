Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";

po_manual = function (event) {
  const x = event.clientX;
  const y = event.clientY;

  var menu = new Ext.menu.Menu();
  if (Ext.I_SUB_STATUS == "3.00") {
    menu.add({
      text: "คู่มือการส่งคืนทักท้วง/ยกเลิกและสร้างใบเบิกใหม่",
      icon: "../images/icons/book.png",
      scope: this,
      handler: function (e) {
        window.open("manual/คู่มือการส่งคืนทักท้วง.pdf");
      },
    });
  }
  if (Ext.I_SUB_STATUS != "3.00") {
    menu.add({
      text: "คู่มือการบันทึกใบขอเบิก",
      icon: "../images/icons/book.png",
      scope: this,
      handler: function (e) {
        window.open("manual/คู่มือการบันทึกใบขอเบิก.pdf");
      },
    });
  }
  menu.showAt([x, y]);
};

Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  const SUB_STATUS = [
    ["0.10", "พร้อมเบิก"],
    ["0.20", "ร่างใบขอเบิก"],
    ["0.21", "รอเงินได้รับจริง"],
    ["0.30", "บันทึกใบขอเบิก"],
    ["0.40", "เจ้าหน้าที่ลงนาม"],
    ["0.50", "ผู้เบิกลงนาม"],
    ["1.00", "รอรับใบขอใบเบิก"],
    ["2.00", "รับใบขอใบเบิก"],
    ["3.00", "ทักท้วง"],
    ["4.00", "อนุมัติฏีกา"],
    ["5.00", "หักงบประมาณ"],
    ["6.00", "หัวหน้าฝ่ายการคลังลงนาม"],
    ["7.00", "ผู้บริหารลงนาม"],
    ["8.00", "จัดทำเช็ค"],
    ["9.00", "หัวหน้าฝ่ายการคลังลงนามเช็ค"],
    ["10.00", "ผู้บริหารลงนามเช็ค"],
    ["11.00", "ทำทะเบียนจ่าย"],
    ["12.00", "ตัดจ่ายเจ้าหนี้"],
    ["13.00", "ยกเลิก"],
  ];
  const index_status = SUB_STATUS.findIndex(([code]) => code == Ext.I_SUB_STATUS);
  Ext.title_panel = SUB_STATUS[index_status][1];

  Ext.COLOR_STATUS = [];
  Ext.COLOR_STATUS[2] = "red";
  Ext.COLOR_STATUS[4] = "#9100ff";
  Ext.COLOR_STATUS[5] = "#00a75a";
  Ext.COLOR_STATUS[6] = "#1000ff";
  Ext.COLOR_STATUS[7] = "#a9a9a9";
  Ext.COLOR_STATUS[8] = "#0ba2b1";
  Ext.COLOR_STATUS[9] = "#e4dd00";
  Ext.COLOR_STATUS[10] = "#000000";
  Ext.COLOR_STATUS[11] = "#e067e8";
  Ext.COLOR_STATUS[12] = "green";

  /*===============================================*/

  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
    items: [
      "->",
      {
        xtype: "label",
        html: '<img src="../images/icons/information.png">',
        listeners: {
          render: function (c) {
            var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
            var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E6E6E6;'>∎</span> ร่างใบขอเบิก </span><br>";
            text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#FEF8C2;'>∎</span> รอเงินได้รับจริง</span><br>";
            text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#FFEBEB;'>∎</span> ทักท้วง</span><br>";
            text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#E4FFE4;'>∎</span> อนุมัติฏีกาเรียบร้อย </span>";
            new Ext.ToolTip({
              target: c.id,
              anchor: "left",
              html: text_ToolTip,
              anchorOffset: 15,
              bodyStyle: {
                backgroundColor: "#FFFFFF",
              },
            });
          },
        },
      },
    ],
  });

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
  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    // Ext.po_working_begin.load();
    if (butt == "add") {
      Ext.po_working_begin_item.clearData();
      Ext.po_working_begin_item.removeAll();
      Ext.can_edit = false;
      data_items_dtl_1[0] = [];
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
      // Ext.getCmp("po_working_begin_hdr_idID").setValue(null);
      // Ext.getCmp("po_working_begin_hdr_idID_Name").setValue(null);
      // Ext.getCmp("pop_po_working_begin_hdr_idID").hide();
      Ext.getCmp("btn_pdf2").hide();
      Ext.getCmp("i_edit_pdf2ID").hide();
      Ext.getCmp("c_booking_radiogroup").hide();
      Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
      Ext.getCmp("upload_pdf2").show();

      Ext.getCmp("po_emp_id").setValue(Ext.session.user_name);
      Ext.getCmp("d_doc_date").setValue(addY(543));
      Ext.getCmp("f_vat").setReadOnly(true);
      Ext.getCmp("f_vat").el.setStyle("background", "#eee");
      Ext.getCmp("f_tax_personal").setReadOnly(true);
      Ext.getCmp("f_tax_personal").el.setStyle("background", "#eee");
      sum_debt_label();
      Ext.po_working_begin_item.setBaseParam("po_working_begin_hdr_id", "0");

      // Ext.getCmp('dc_cost_acc_id').setValue(Ext.dc_cost_acc_default);
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //

      Ext.HDR_ID = record.data.id;
      Ext.BEGIN_HDR_ID = record.data.po_working_begin_hdr_id;
      Ext.i_is_url_pdf_hdr = record.data.i_is_url_pdf_hdr;
      Ext.i_is_url_pdf_dtl = record.data.i_is_url_pdf_dtl;
      Ext.pdf_hdr = record.data.pdf_hdr;
      Ext.pdf_dtl = record.data.pdf_dtl;
      Ext.dataSelect = record.data;
      Ext.can_edit = record.data.i_sub_status == "0.30" ? true : false;

      Ext.po_working_begin_item.setBaseParam("po_working_begin_hdr_id", record.data.po_working_begin_hdr_id);
      var promises = [];
      if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
        Ext.INSIDE_COST = record.data.i_inside_cost == 1 ? true : false;
      }
      Promise.all([])
        .then(() => {
          Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
        })
        .then(() => {
          return StoreLoadWithPromise(Ext.po_working_begin_item, { po_working_begin_hdr_id: record.data.po_working_begin_hdr_id });
        })
        .then(() => {
          return StoreLoadWithPromise(Ext.dc_expense_budget_type, { dc_cost_acc_id: record.data.dc_cost_acc_id });
        })
        .then(() => {
          return StoreLoadWithPromise(Ext.dc_cost, { dc_cost_acc_id: record.data.dc_cost_acc_id });
        })
        .then(() => {
          return StoreLoadWithPromise(Ext.dc_user_approve, { dc_cost_acc_id: record.data.dc_cost_acc_id });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            data_items_dtl_1[0] = [];
            Ext.po_working_pay_item_all.setBaseParam("id", Ext.dataSelect.id);
            Ext.po_working_pay_item_all.load({
              callback: function () {
                Ext.po_working_pay_item_all.each(function (record, index) {
                  if (!data_items_dtl_1[0]) {
                    data_items_dtl_1[0] = [];
                  }
                  data_items_dtl_1[0].push({
                    id: record.data.id,
                    c_code_bank_acc: record.data.c_code_bank_acc,
                    c_name_bank_acc: record.data.c_name_bank_acc,
                    dc_bank_id: record.data.dc_bank_id,
                    f_total: record.data.f_total,
                  });
                });
                resolve();
              },
            });
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            if (record.data.i_working_type == 2) {
              Ext.sp_sbill.load({
                params: { sp_sbill_hdr_id: record.data.sp_sbill_hdr_id },
                callback: function () {
                  resolve();
                },
              });
            } else {
              resolve();
            }
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            if (record.data.po_working_program_hdr_id > 0) {
              Ext.po_working_program.load({
                params: { po_working_program_hdr_id: record.data.po_working_program_hdr_id },
                callback: function () {
                  resolve();
                },
              });
            } else {
              resolve();
            }
          });
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            let frmAdd = new formAdd(record.data);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("EDIT");
            Ext.getCmp("form-widgets").getForm().loadRecord(record);

            Ext.getCmp("gl_tran_hdr_id").setValue(record.data.gl_tran_hdr_id);
            Ext.getCmp("c_code_debt").setValue(record.data.c_code_debt);
            Ext.getCmp("d_debt_date").setValue(record.data.d_debt_date);
            Ext.getCmp("c_debt_month").setValue(record.data.c_debt_month);
            Ext.getCmp("c_debt_year").setValue(record.data.c_debt_year);

            Ext.getCmp("f_total").fn();
            Ext.getCmp("f_inv").fn();
            Ext.getCmp("f_vat_rate").fn();
            Ext.getCmp("f_vat").fn();
            Ext.getCmp("f_inv_vat").fn();
            Ext.getCmp("f_tax_personal").fn();
            Ext.getCmp("f_tax_personal_rate").fn();
            Ext.getCmp("f_social_security").fn();
            Ext.getCmp("f_prov_fund").fn();
            Ext.getCmp("f_fine").fn();
            Ext.getCmp("f_warranty").fn();
            Ext.getCmp("f_other").fn();
            Ext.getCmp("f_pay").fn();
            if (Ext.I_SUB_STATUS != "3.00") {
              Ext.getCmp("i_inside_cost").setValue(Ext.INSIDE_COST ? 1 : 0);
            }

            if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
              Ext.getCmp("c_booking_radiogroup").show();
            } else {
              Ext.getCmp("c_booking_radiogroup").hide();
            }

            if (Ext.butt == "edit") {
              Ext.getCmp("i_edit_pdf1ID").show();
              Ext.getCmp("btn_pdf1").show();
              Ext.getCmp("upload_pdf1").hide();
              Ext.getCmp("btn_pdf2").show();
              Ext.getCmp("upload_pdf2").hide();
              Ext.getCmp("i_edit_pdf2ID").show();
            } else {
              Ext.getCmp("i_edit_pdf1ID").hide();
              Ext.getCmp("btn_pdf1").hide();
              Ext.getCmp("btn_pdf2").hide();
              Ext.getCmp("i_edit_pdf2ID").hide();
            }

            if (Ext.getCmp("f_vat_rate").getValue() > 0) {
              var checkbox = Ext.getCmp("check_vat");
              var checkHandler = checkbox.initialConfig.listeners.check;
              checkbox.un("check", checkHandler);
              checkbox.setValue(true);
              checkbox.on("check", checkHandler);
              Ext.getCmp("f_vat").setReadOnly(false);
              Ext.getCmp("f_vat").el.setStyle("background", "#fff");
            } else {
              var checkbox = Ext.getCmp("check_vat");
              var checkHandler = checkbox.initialConfig.listeners.check;
              checkbox.un("check", checkHandler);
              checkbox.setValue(false);
              checkbox.on("check", checkHandler);
              Ext.getCmp("f_vat").setReadOnly(true);
              Ext.getCmp("f_vat").el.setStyle("background", "#eee");
            }

            if (Ext.getCmp("f_tax_personal_rate").getValue() > 0) {
              var checkbox = Ext.getCmp("check_tax_personal");
              var checkHandler = checkbox.initialConfig.listeners.check;
              checkbox.un("check", checkHandler);
              checkbox.setValue(true);
              checkbox.on("check", checkHandler);
              Ext.getCmp("f_tax_personal").setReadOnly(false);
              Ext.getCmp("f_tax_personal").el.setStyle("background", "#fff");
            } else {
              var checkbox = Ext.getCmp("check_tax_personal");
              var checkHandler = checkbox.initialConfig.listeners.check;
              checkbox.un("check", checkHandler);
              checkbox.setValue(false);
              checkbox.on("check", checkHandler);
              Ext.getCmp("f_tax_personal").setReadOnly(true);
              Ext.getCmp("f_tax_personal").el.setStyle("background", "#eee");
            }

            if (Ext.getCmp("pdf_upload_mode").getValue().inputValue == 1) {
              Ext.getCmp("BuGroupPdf1").hide();
              Ext.getCmp("upload_pdf1").hide();
            }
            if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
              Ext.getCmp("upload_pdf2").show();
              Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
              Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
              if (!(Ext.butt == "edit")) {
                Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
                Ext.getCmp("upload_pdf1").show();
              }
            }

            if (record.data.i_budget_year > record.data.i_budget_year_overlap) {
              Ext.getCmp("c_booking_radiogroup").show();
              Ext.getCmp("BuPopSelectID").disable();
            } else {
              Ext.getCmp("c_booking_radiogroup").hide();
              Ext.getCmp("BuPopSelectID").enable();
            }

            if (record.data.c_code_advance) {
              Ext.getCmp("c_code_advance").show();
            }

            if (record.data.creditor_name.includes("ทดรองจ่าย")) {
              Ext.getCmp("c_code_advance").show();
            }

            if (record.data.i_working_type == 2) {
              Ext.getCmp("c_bookingID").forceSelection = false;
            } else {
              Ext.getCmp("c_bookingID").forceSelection = true;
            }

            if (record.data.i_working_type == 3) {
              setTimeout(() => {
                Ext.getCmp("group_type_3").show();
              }, 500);
            } else {
              setTimeout(() => {
                Ext.getCmp("group_type_3").hide();
              }, 500);
            }
            if (record.data.po_working_program_hdr_id > 0) {
              setTimeout(() => {
                Ext.getCmp("group_po_working_program").show();
              }, 450);
            }
            if (record.data.i_working_type == 2 && ["50", "82"].includes(Ext.dataSelect.dc_cost_id)) {
              setTimeout(() => {
                Ext.getCmp("c_bookingID").forceSelection = true;
                Ext.getCmp("group_sp_sbill").show();
                Ext.getCmp("c_code_invoice").hide();
              }, 450);
            } else {
              Ext.getCmp("group_sp_sbill").hide();
              Ext.getCmp("c_code_invoice").show();
            }

            if (Ext.butt == "edit") {
              Ext.getCmp("i_edit_pdf1ID").show();
              Ext.getCmp("btn_pdf1").show();
              Ext.getCmp("upload_pdf1").hide();
              Ext.getCmp("btn_pdf2").show();
              Ext.getCmp("upload_pdf2").hide();
              Ext.getCmp("i_edit_pdf2ID").show();
            } else {
              Ext.getCmp("i_edit_pdf1ID").hide();
              Ext.getCmp("btn_pdf1").hide();
              Ext.getCmp("btn_pdf2").hide();
              Ext.getCmp("i_edit_pdf2ID").hide();
            }
            if (Ext.getCmp("pdf_upload_mode").getValue().inputValue == 1) {
              Ext.getCmp("BuGroupPdf1").hide();
              Ext.getCmp("upload_pdf1").hide();
            }
            if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
              Ext.getCmp("upload_pdf2").show();
              Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
              Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
              if (!(Ext.butt == "edit")) {
                Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
                Ext.getCmp("upload_pdf1").show();
              }
            }
            if (Ext.can_edit) {
              Ext.getCmp("modesubID").setValue("UPDATE");
              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: false });
              Ext.getCmp("upload_pdf2").hide();
            }
            if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
              setReadOnlyForProtest(true);
              var comment = record.data.c_receive_comment;
              comment = comment == null ? "" : comment + "\n";
              comment = comment + "รับคืนทักท้วงครั้งที่ " + Ext.dataSelect.i_protest + " " + Ext.util.Format.date(addY(543), "d/m/y");
              document.getElementById("c_receive_comment").value = comment;
              Ext.getCmp("d_receive_date").setValue(addY(543));

              if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                Ext.getCmp("c_booking_radiogroup").show();
                Ext.getCmp("c_bookingID").setValue(Ext.dataSelect.c_booking);
                Ext.booking_store.load({ params: { dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(), dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue() } });
              }

              if (record.data.i_protect_only_doc == 1 && record.data.i_protest_only_doc_hdr != 1) {
                Ext.getCmp("group_input_box_1").getEl().setStyle("display", "none");
                Ext.getCmp("group_input_box_2").getEl().setStyle("display", "none");
                Ext.getCmp("group_input_box_3").getEl().setStyle("display", "none");
                Ext.getCmp("i_pdf_dtl_outside").hide();
                Ext.getCmp("mode_protest_value2").hide();
                Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: false });
              }
              if (record.data.i_protect_only_doc != 1 && record.data.i_protest_only_doc_hdr == 1) {
                Ext.getCmp("group_input_box_4").getEl().setStyle("display", "none");
              }

              if (record.data.c_file_pdf_protest_hdr || record.data.c_file_pdf_protest_dtl) {
                Ext.getCmp("group_input_box_doc_protest").show();
                Ext.getCmp("c_file_pdf_protest_hdr_buttongroup").setVisible(!!record.data.c_file_pdf_protest_hdr);
                Ext.getCmp("c_file_pdf_protest_dtl_buttongroup").setVisible(!!record.data.c_file_pdf_protest_dtl);
              }

              // group_input_box_doc_protest
            } else {
              if (Ext.I_SUB_STATUS_BEFORE == "0.20" && Ext.dataSelect.i_sub_status == "0.30") {
                setReadOnlyForProtest(true);
                Ext.getCmp("c_bookingID").setValue(Ext.dataSelect.c_booking);
                Ext.booking_store.load({ params: { dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(), dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue() } });
              } else {
                setReadOnlyForProtest(true);
                Ext.getCmp("c_bookingID").setValue(Ext.dataSelect.c_booking);
                Ext.booking_store.load({ params: { dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(), dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue() } });
              }
            }
            text_show_item_pay_update(data_items_dtl_1[0]);
            sum_debt_label();
            resolve();
          });
        })
        .then(() => {
          if (record.data.dc_creditor_id > 0) {
            creditor_taxdata_load(record.data.dc_creditor_id);
          }
          load_f_income_total(Ext.dataSelect.i_budget_year, Ext.dataSelect.dc_expense_budget_type_id, Ext.dataSelect.bg_expense_id, Ext.dataSelect.dc_cost_id);
          Ext.dc_bank_acc_creditor.load({
            params: { dc_creditor_id: record.data.dc_creditor_transfer_id },
            callback: function (recordx, operation, success) {
              if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                var dc_bank_acc_creditor_id = record.data.dc_bank_acc_creditor_id;
                var index = dc_bank_acc_creditor_id > 0 ? dc_bank_acc_creditor_id : 0;
                Ext.getCmp("dc_bank_acc_creditor_id").setValue(index);
                if (index == 0) {
                  Ext.getCmp("i_type_transfer").setValue("2");
                }
              } else {
                Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                Ext.getCmp("i_type_transfer").setValue("2");
              }
            },
          });
          if (["1", "3"].includes(record.data.i_sys_ss) && record.data.chk_id_ss > 0) {
            console.log(record.data.i_protect_only_doc);
            if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
              if ((record.data.i_protect_only_doc != 1 && record.data.i_protest_only_doc_hdr == 1) || (record.data.i_protect_only_doc == record.data.i_protest_only_doc_hdr) == 1) {
                Ext.getCmp("modeProtestID").setValue("SEND");
                Ext.getCmp("mode_protest_value1").hide();
              }
            } else {
              Ext.getCmp("modeEditID").setValue("SEND");
              Ext.getCmp("mode_edit_value1").hide();
            }
            setTimeout(() => {
              setReadOnly_D_AP();
            }, 250);
          }
          setTimeout(() => {
            if (record.data.chk_id_ss > 0) {
              if (record.data.i_sys_ss == 1) {
                Ext.getCmp("i_select_data").show();
                var idEl = Ext.getCmp("i_select_data").getEl().dom.nextSibling.id;
                document.getElementById(idEl).innerHTML = "ดึงข้อมูลจากระบบจัดซื้อจัดจ้าง (คณะแพทย์ศาสตร์ชิรพยาบาล)";
              } else if (record.data.i_sys_ss == 3) {
                Ext.getCmp("i_select_data").show();
                var idEl = Ext.getCmp("i_select_data").getEl().dom.nextSibling.id;
                document.getElementById(idEl).innerHTML = "ดึงข้อมูลจากระบบจัดซื้อจัดจ้าง (สำนักงานอธิการบดี)";
              }
            }
          }, 450);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          Ext.getCmp("contenterCenter").getEl().unmask();
        });
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (record.data.i_enable == 1 || Ext.session.user_id == 1) {
        controllTab(record, "edit");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClick

  rowContextmenu = function (grid, rowIndex, e) {
    e.stopEvent();
    grid.getSelectionModel().selectRow(rowIndex);
    var record = grid.store.getAt(rowIndex);
    if (record) {
      var menu = new Ext.menu.Menu();
      if (record.data.c_code) {
        menu.add({
          text: 'คัดลอก "' + record.data.c_code + '"',
          icon: "../images/icons/page_copy.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.c_code);
          },
        });
      }

      if (record.data.c_code_debt) {
        menu.add({
          text: 'คัดลอก "' + record.data.c_code_debt + '"',
          icon: "../images/icons/page_copy.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.c_code_debt);
          },
        });
      }
      if (Ext.I_SUB_STATUS == '3.00' && record.data.i_working_type != 2) {
        menu.add({
          text: "ยกเลิกรายการ <span style='font-size: 7px; color: red;'>(สำหรับรายการที่ผู้ตรวจอนุญาติให้ยกเลิก)</span'>",
          icon: "../images/icons/delete.png",
          scope: this,
          handler: function (e) {
            winDisable_admin(true, record);
          },
        });
      }

      if (Ext.session.user_id == 1) {
        menu.addSeparator();
        menu.add(
          new Ext.menu.Item({
            text: "show only admin",
            disabled: true,
            cls: "menu-separator-text",
          })
        );
        menu.add({
          text: "เปิดใช้งานรายการ",
          icon: "../images/icons/yes.gif",
          scope: this,
          handler: function (e) {
            winDisable_admin(false, record);
          },
        });
        menu.add({
          text: "ยกเลิกรายการ",
          icon: "../images/icons/delete.png",
          scope: this,
          handler: function (e) {
            winDisable_admin(true, record);
          },
        });
        menu.add({
          text: "(console_record)",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            console.log(record);
          },
        });

        menu.add({
          text: "po_working_hdr_id : " + record.data.id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.id);
          },
        });

        menu.add({
          text: "po_working_begin_hdr_id : " + record.data.po_working_begin_hdr_id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.po_working_begin_hdr_id);
          },
        });

        menu.add({
          text: "dc_cost_id : " + record.data.dc_cost_id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.dc_cost_id);
          },
        });

        menu.add({
          text: "dc_cost_acc_id : " + record.data.dc_cost_acc_id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.dc_cost_acc_id);
          },
        });

        menu.add({
          text: "URL : PDF_PoWorking",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            console.log(window.location.origin);
            copyToClipboard(window.location.origin + "/NMU_EIS/po/pdf/PDF_PoWorking.php?id=" + record.data.id);
          },
        });
        menu.add({
          text: "REGEN_PDF",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            Progress_Default_fast("start", "กำลังทำรายการกรุณารอสักครู่...", "");
            Ext.Ajax.request({
              url: "api/mn_poSendStatusAll.php",
              method: "POST",
              params: {
                mode: "REGEN_PDF",
                id: record.data.id,
              },
              success: function (result, request) {
                Progress_Default_fast("success", function () {});
                // let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
              },
            });
          },
        });

        menu.add({
          text: "gl_tran_hdr_id : " + record.data.gl_tran_hdr_id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.gl_tran_hdr_id);
          },
        });
      }
      menu.showAt(e.getXY());
    }
  }; //rowContextmenu

  const search = function () {
    var msg = "";
    if (msg == "") {
      if (Ext.getCmp("value-box").getValue() != "") {
        Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
        Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
      } else {
        Ext.store.setBaseParam("value", "");
        Ext.store.setBaseParam("filter", "");
      }
      Ext.store.setBaseParam("mode", "SEARCH");
      Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
      Ext.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("s_dc_cost_acc_id").getValue());
      Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
      Ext.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("s_dc_cost_acc_id").getValue());
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      Ext.store.setBaseParam("i_view_my_status", Ext.getCmp("i_view_my_status").getValue() ? 1 : 0);
      Ext.store.setBaseParam("i_status_enable", Ext.getCmp("s_i_status_enable").getValue());
      // Ext.store.setBaseParam("i_sub_status", Ext.getCmp("s_i_sub_status").getValue());
      // Ext.store.setBaseParam("checkbox_overlab_no_booking", Ext.getCmp("checkbox_overlab_no_booking").getValue() ? 1 : 0);
      Ext.store.load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "บันทึกใบขอเบิก " + (Ext.INSIDE_COST == 1 ? "<font color=blue>(ภายใน)</font><font style='font-size: 9px;' color=blue> *รายการจะถูกส่งผู้ตรวจสอบ เมื่อผู้ดำเนินการลงนาม</font> " : ""),
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: true,
      getRowClass: function (record, index, rowParams) {
        if (record.data.i_enable != 1) {
          return "delete-color-red";
        }
        if (Ext.I_SUB_STATUS_BEFORE != "3.00") {
          if (record.data.i_sub_status == "0.20") {
            return "color-grey";
          }
          if (record.data.i_sub_status == "0.21") {
            return "color-yellow";
          }
          if (record.data.i_sub_status > "0.21") {
            return "color-green";
          }
        }
      },
    },
    listeners: {
      afterRender: function (grid) {
        var element = Ext.get(grid.getView().mainHd.id);
        element.on("contextmenu", function (e, t) {
          e.stopEvent();
          var menu = new Ext.menu.Menu();
          menu.add({
            text: "Refresh",
            icon: "../images/icons/arrow_refresh_small.png",
            scope: this,
            handler: function (e) {
              grid.store.load();
            },
          });
          if (Ext.session.user_id == 1) {
            menu.addSeparator();
            menu.add(
              new Ext.menu.Item({
                text: "show only admin",
                disabled: true,
                cls: "menu-separator-text",
              })
            );
            menu.add({
              text: "Inspect SQL",
              icon: "../images/icons/script_lightning.png",
              scope: this,
              handler: function (e) {
                grid.store.load({ params: { show_sql: 1 } });
              },
            });
          }
          menu.showAt(e.getXY());
        });
      },
    },
    tbar: [
      {
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        listeners: {
          afterrender: function (cmp) {
            if (cmp.header.id) {
              document.getElementById(cmp.header.id).style.cssText = " display: flex; justify-content: space-between; width: 99%;";
              document.getElementById(cmp.header.id).innerHTML += `
                <button onclick="po_manual(event)" type="button" style="display: flex; padding: 0px; height: 15px; font-size: 10px; color: red; font-weight: bold;">
                <img src='../images/icons/book.png' style='width: 12px; height: 12px; margin-right:1px;'/>
                ใบแนบคู่มือใช้งาน
                </button>
              `;
            }
          },
        },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_budget_year",
                xtype: "combo",
                width: 185,
                mode: "local",
                store: Ext.store_year_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: Ext.bgYear,
              },
              { xtype: "tbspacer", width: 9 },
              { xtype: "label", text: "ใช้เงินปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_budget_year_overlap",
                xtype: "combo",
                width: 185,
                mode: "local",
                store: Ext.store_year_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: "0",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 135,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    // ["c_approve", "เลขที่ฏีกา"],
                    ["c_code_ref", "เลขที่ขอเบิก"],
                    ["c_code_debt", "เลขที่ AP"],
                  ],
                }),
                value: "c_code_ref",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 335,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ส่วนงาน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_cost_acc_id",
                mode: "local",
                store: Ext.dc_cost_sys_main_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 475,
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                    this.change_set = function () {
                      Ext.dc_expense_budget_type_all.load({ params: { dc_cost_acc_id: this.value } });
                      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
                    };
                  },
                  select: function () {
                    this.change_set();
                  },
                  change: function (combo, newValue) {
                    this.change_set();
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
              // { xtype: "tbspacer", width: 4 },
              // { xtype: "label", text: "สถานะ : " },
              // { xtype: "tbspacer", width: 4 },
              // {
              //   id: "s_i_sub_status",
              //   xtype: "combo",
              //   width: 120,
              //   mode: "local",
              //   store: new Ext.data.SimpleStore({
              //     fields: ["value", "text"],
              //     data: [
              //       ["99", "ทั้งหมด"],
              //       ["0.20", "ร่างใบขอใบเบิก"],
              //       ["0.21", "รอเงินได้รับจริง"],
              //       // ["0.30", "บันทึกใบขอเบิก"],
              //       // ["0.40", "ลงนามเจ้าหน้าที่"],
              //       // ["0.50", "ลงนามผู้เบิก"],
              //       // ["1.00", "รอรับใบขอใบเบิก"],
              //       // ["2.00", "รับใบขอใบเบิก"],
              //       // ["3.00", "ทักท้วง"],
              //       // ["4.00", "อนุมัติฏีกา"],
              //       // ["5.00", "หักงบประมาณ"],
              //       // ["6.00", "หัวหน้าฝ่ายการคลังลงนาม"],
              //       // ["7.00", "ผู้บริหารลงนาม"],
              //       // ["8.00", "จัดทำเช็ค"],
              //       // ["9.00", "หัวหน้าฝ่ายการคลังลงนามเช็ค"],
              //       // ["10.00", "ผู้บริหารลงนามเช็ค"],
              //       // ["11.00", "ทำทะเบียนจ่าย"],
              //     ],
              //   }),
              //   value: "99",
              //   valueField: "value",
              //   displayField: "text",
              //   allowBlank: false,
              //   editable: false,
              //   triggerAction: "all",
              //   typeAhead: false,
              // },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "แหล่งเงิน : " },
              { xtype: "tbspacer", width: 4 },
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
                width: 474,
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
              // { xtype: "tbspacer", width: 10 },
              // new Ext.form.Checkbox({
              //   id: "i_pdf",
              //   boxLabel: "ที่มีเอกสาร PDF",
              //   inputValue: 1,
              //   checked: false,
              //   listeners: {
              //     check: function (combo, newValue) {
              //       search();
              //     },
              //   },
              // }),
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เปิดหน้าบันทึก",
            id: "buAdd",
            hidden: Ext.I_SUB_STATUS_BEFORE == "3.00" ? true : false,
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              controllTab({}, "add");
            },
          },
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
              search();
            },
          },
        ],
      },
      {
        xtype: "buttongroup",
        // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        hidden: Ext.I_SUB_STATUS != "-1.00" ? false : true,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            fieldLabel: "",
            hidden: Ext.I_SUB_STATUS != "-1.00" ? false : true,
            height: 22,
            frame: false,
            items: [
              new Ext.form.Checkbox({
                id: "i_view_my_status",
                boxLabel: "",
                inputValue: 1,
                checked: true,
                listeners: {
                  afterrender: function () {},
                  check: function (combo, newValue) {
                    search();
                  },
                },
              }),
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: " : แสดงรายการสามารถดำเนินการ" },
            ],
          },
          {
            xtype: "buttongroup",
            fieldLabel: "",
            height: 22,
            frame: false,
            // hidden: Ext.I_SUB_STATUS != "-1.00" ? false : true,
            items: [
              { xtype: "label", text: "สถานะการใช้งาน : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_status_enable",
                xtype: "combo",
                width: 118,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["99", "ทั้งหมด"],
                    ["1", "ใช้งาน"],
                    ["2", "ยกเลิก"],
                  ],
                }),
                value: "1",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
            ],
          },
          { xtype: "container", height: 100 },
        ],
      },
      { xtype: "tbfill" },
      // {
      //   xtype: "container",
      //   items: [
      //     { xtype: "container", height: 110 },
      //     {
      //       xtype: "label",
      //       html: '<img src="../images/icons/information.png">',
      //       listeners: {
      //         render: function (c) {
      //           var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
      //           var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E6E6E6;'>∎</span> ร่างใบขอเบิก </span><br>";
      //           text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#FEF8C2;'>∎</span> รอเงินได้รับจริง</span><br>";
      //           text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#FFEBEB;'>∎</span> ทักท้วง</span><br>";
      //           text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color:#E4FFE4;'>∎</span> อนุมัติฏีกาเรียบร้อย </span>";
      //           new Ext.ToolTip({
      //             target: c.id,
      //             anchor: "top",
      //             html: text_ToolTip,
      //             bodyStyle: {
      //               backgroundColor: "#FFFFFF",
      //             },
      //           });
      //         },
      //       },
      //     },
      //   ],
      // },
      // { width: 2 },
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        },
      }),
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 80,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          let vv = record.data.i_sub_status;
          if (record.data.i_enable != 1) return "";
          if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
            return "<button style='font-size:11px; cursor:pointer; color: green; height:18px; padding:0px;'>&nbsp&nbspส่งคืน&nbsp&nbsp</button>";
          }
          if (vv <= "0.30") {
            return "<button style='font-size:11px; cursor:pointer; color: green; height:18px; padding:0px;'>&nbsp&nbspแก้ไข&nbsp&nbsp</button>";
          }
          return "<button style='font-size:11px; cursor:pointer; color: blue; height:18px; padding:0px;'>&nbsp&nbspแสดง&nbsp&nbsp</button>";
        },
      },
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "id",
        width: 40,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
        },
      },
      {
        header: "เอกสารขอใบเบิก",
        sortable: false,
        width: 115,
        align: "center",
        dataIndex: "pdf_hdr",
        editor: new Ext.form.TextField({}),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.c_code) {
            var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" + record.data.c_code + "</b>&nbsp</spen>";
            if (record.data.i_is_url_pdf_hdr == null) {
              return "-";
            } else if (record.data.i_is_url_pdf_hdr == 0) {
              return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code + '\')" type="button">' + BtnText + "</button>";
            } else {
              return "-";
            }
          } else {
            return "-";
          }
        },
      },
      {
        header: "เอกสารประกอบ",
        sortable: false,
        width: 109,
        align: "center",
        dataIndex: "pdf_dtl",
        editor: new Ext.form.TextField({}),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_pdf_dtl_outside == 1) {
            var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color:red;'>ㅤนอกระบบㅤㅤ</spen>";
          } else {
            var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบ&nbsp</spen>";
          }
          if (record.data.i_is_url_pdf_dtl == null) {
            return "-";
          } else if (record.data.i_is_url_pdf_dtl == 0) {
            return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code + '\')" type="button">' + BtnText + "</button>";
          } else {
            return "-";
          }
        },
      },
      // {
      //   header: "เลขที่ฏีกา",
      //   sortable: false,
      //   align: "center",
      //   width: 100,
      //   dataIndex: "c_approve",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value;
      //   },
      // },
      // {
      //   header: "เลขที่ใบแจ้งหนี้",
      //   sortable: false,
      //   align: "center",
      //   width: 100,
      //   dataIndex: "c_approve",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value;
      //   },
      // },
      // {
      //   header: "วันที่ตรวจรับเอกสาร<br>สถานะรายการล่าสุด",
      //   sortable: true,
      //   align: "center",
      //   dataIndex: "d_status_date_last",
      //   width: 120,
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     let note = "";
      //     if (record.data.i_protest > 0) {
      //       for (let i = 1; i <= record.data.i_protest; i++) {
      //         note += "*";
      //       }
      //     }
      //     note = note != "" ? " <font color=red>" + note + "</font>" : "";

      //     return value != "" ? shortThaiDate(value) + note : "";
      //   },
      // },
      {
        header: "สถานะดำเนินการ",
        sortable: true,
        align: "center",
        dataIndex: "c_status_last",
        width: 190,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          let vv = record.data.i_status_last;
          let color = "";

          if (record.data.i_sub_status == "0.20") {
            color = "black";
          } else if (record.data.i_sub_status == "0.21") {
            color = "#FFA80F"; //yellow
          } else if (record.data.i_sub_status == "0.30") {
            color = "green";
          } else {
          }
          metaData.attr = 'style="font-weight: bold; color: ' + color + ';"';
          return value;
        },
      },
      {
        header: "ผู้สอบตรวจ",
        sortable: false,
        hidden: Ext.I_SUB_STATUS == "3.00" ? false : true,
        align: "center",
        width: 200,
        dataIndex: "dc_approve_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "สถานะการลงบัญชี",
        sortable: true,
        hidden: true,
        align: "center",
        dataIndex: "c_send_jv",
        width: 90,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          let i_send_jv = record.data.i_send_jv;
          let c_send_jv = record.data.c_send_jv;
          if (i_send_jv == 1) {
            /* ไม่ระบุ */
            color = "black";
          } else if (i_send_jv == 2) {
            /* ไม่บันทึกบัญชี */
            color = "black";
          } else if (i_send_jv == 3) {
            /* รอบันทึกบัญชี */
            color = "#FFA80F";
          } else if (i_send_jv == 4) {
            /* บันทึกบัญชีแล้ว */
            color = "#FFA80F";
          } else if (i_send_jv == 9) {
            /* ยกเลิกบันทึกบัญชี */
            color = "red";
          } else {
            /* - */
            color = "black";
            value = " - ";
          }
          metaData.attr = 'style="font-weight: bold; color: ' + color + ';"';
          return value;
        },
      },
      {
        header: "วันที่สร้างรายการ",
        sortable: true,
        align: "center",
        dataIndex: "d_create",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      // {
      //   header: "วันที่อนุมัติฏีกา",
      //   sortable: true,
      //   align: "center",
      //   dataIndex: "d_approve_date",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value != "" ? shortThaiDate(value) : "";
      //   },
      // },
      {
        header: "หน่วยงาน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "cost_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "แหล่งเงิน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "budget_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "รายการย่อย",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "bg_expense_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "จำนวนเงินขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_total",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="color: blue; text-align: right;"';
          return floatRenderer(floatMinus(value, 2));
        },
      },
      {
        header: "ชื่อเรื่อง",
        sortable: false,
        align: "center",
        width: 300,
        dataIndex: "c_heading",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      // { header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      // { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" },
      { width: 40, dataIndex: "" },
    ],
    //     // autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  Ext.getCmp("tabpanel1").on("rowContextmenu", rowContextmenu, this);
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
  Ext.myComboStores = [Ext.bg_expense, Ext.bg_expense_have, Ext.dc_cost_sys_main_all, Ext.dc_expense_budget_type_all, Ext.dc_expense_budget_type, Ext.po_parcel_officer, Ext.po_reason_protest, Ext.dc_cost];
  chkLoadingStore(Ext.myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
