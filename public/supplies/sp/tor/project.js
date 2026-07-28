/* global Ext, user_right_add, user_right_edit, user_right_delete */
/*
 * @param {type} mode
 * @returns {undefined}
 */
const ip = Ext.session.ip_booking; // 192
const genLinkBg = function (event, rec) {
  //c_overlap genLinkBg('c_overlap')
  let link = null;
 
  switch (event) {
    //c_overlap_book
    case "c_overlap":
      link =
        Ext.session.IPAPIBG +
        "/?/bg/BgBudgetAllSupplies" +
        "/i_year/" +
        (rec.get("i_year") - 543) +
        "/dc_expense_budget_type_id/" +
        rec.get("dc_expense_budget_type_id") +
        "/dc_cost_id/" +
        rec.get("dc_cost_id") +
        "/bg_expense_id/" +
        rec.get("bg_expense_id") +
        "/c_code_overlap/" +
        encodeURIComponent(Ext.getCmp("c_overlapID").getValue()) +
        "/";
      break;
    case "c_overlap_book":
      link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/1" +
        "/pr_id/" +
        rec.get("sp_tor_pro_id") +
        "/po_id/" +
        rec.get("sp_tor_contract_pro_id") +
        "/chk_id/0" +
        "/i_year/" +
        rec.get("i_yyyy") +
        "/i_pr_type/" +
        rec.get("i_pr_type1") + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/dc_budget_type_id/" +
        rec.get("dc_expense_budget_type_id") +
        "/bg_expense_id/" +
        rec.get("po_expense_id") +
        "/i_last/" +
        (rec.get("i_type_contract") === 3 ? 0 : 1) + // pr มี สัญญาเดียว = 1
        "/c_code_overlap/" +
        encodeURIComponent(rec.get("c_overlap")) +
        "/f_amt/" +
        rec.get("f_total_amt");
      break;
    case "c_pr":
      link =
        Ext.session.IPAPIBG +
        "/?/bg/BgBudgetAllSupplies" +
        "/i_year/" +
        rec.get("i_yyyy") +
        "/dc_budget_type_id/" +
        rec.get("dc_expense_budget_type_id") +
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/bg_expense_id/" +
        rec.get("po_expense_id");
      break;
    case "c_book_pr":
      link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/1" +
        "/pr_id/" +
        rec.get("sp_tor_pro_id") +
        "/po_id/0" +
        "/chk_id/0" +
        "/i_year/" +
        rec.get("i_yyyy") +
        "/i_pr_type/" +
        rec.get("i_pr_type1") +
        "/i_reserve/1" +
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/dc_budget_type_id/" +
        rec.get("dc_expense_budget_type_id") +
        "/bg_expense_id/" +
        rec.get("po_expense_id") +
        "/i_last/1" +
        "/f_amt/" +
        Ext.getCmp("f_type_amtID").getValue();
      break;
    case "c_book_po":
      link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/1" +
        "/pr_id/" +
        rec.get("sp_tor_pro_id") +
        "/po_id/" +
        rec.get("sp_tor_contract_pro_id") +
        "/chk_id/0" +
        "/i_year/" +
        rec.get("i_yyyy") +
        "/i_pr_type/" +
        rec.get("i_pr_type1") + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/dc_budget_type_id/" +
        rec.get("dc_expense_budget_type_id") +
        "/bg_expense_id/" +
        rec.get("po_expense_id") +
        "/i_last/" +
        (rec.get("i_type_contract") === 3 ? 0 : 1) + // pr มี สัญญาเดียว = 1
        "/f_amt/" +
        Ext.getCmp("f_type_amtID").getValue();
      break;
  }
  return link;
};
const DeleteTor_dtl = function (record) {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          // console.log(record.json.sp_tor_contract_pro_id);
          Ext.Ajax.request({
            url: "tor/api/mnContractProject.php",
            params: {
              mode: "DEL",
              sp_tor_pro_id: record.json.sp_tor_pro_id,
              sp_tor_contract_pro_id: record.json.sp_tor_contract_pro_id,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.storeProject.reload();
              Ext.getCmp("win-msg-delete").destroy();
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};
const updateBookingContract = function (id, bg_reserve_money_id, ii) {
  // i_pr_type1ID f_type_amtID
  if (ii == 1) {
    //แหล่งเงิน
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      params: {
        mode: "UPDATE_CONTRACT_BG", //UPDATE_TOR_DTL_BG
        sp_tor_contract_id: id, //sp_dtl_id
        bg_reserve_money1_id: bg_reserve_money_id,
        i_pr_type1: Ext.getCmp("i_pr_type1ID").getValue().inputValue,
        f_type_amt: Ext.getCmp("f_type_amtID").getValue(),
        ii: ii,
      },
      method: "POST", //POST
      success: function (result, request) {
        Ext.getCmp("winDcExpTypeDdd2ID").destroy();
        Ext.getCmp("winChequeID").getEl().unmask(); //end
        Ext.storeProject.reload();
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      params: {
        mode: "UPDATE_CONTRACT2_BG", //UPDATE_TOR_DTL_BG
        sp_tor_contract_id: id, //sp_dtl_id
        bg_reserve_money2_id: bg_reserve_money_id,
        i_pr_type2: Ext.getCmp("i_pr_type1ID").getValue().inputValue,
        f_type2_amt: Ext.getCmp("f_type_amtID").getValue(),
        ii: ii,
      },
      method: "POST", //POST
      success: function (result, request) {
        Ext.getCmp("winDcExpTypeDdd2ID").destroy();
        Ext.getCmp("winChequeID").getEl().unmask(); //end
        Ext.storeProject.reload();
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  }
};
const bookingPRPO = function (i, link) {
  Ext.Ajax.request({
    url: link,
    method: "GET", //POST
    disableCaching: false,
    success: function (result, request) {
      let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
      if (i === 1) {
        bookingPRPO(2, genLinkBg("c_book_po", Ext.rec)); //End if
      } else if (i === 2) {
        updateBookingContract(Ext.rec.get("sp_tor_contract_pro_id"), jsonData.bg_reserve_money_id, 1);
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
};
const bookingOverlap = function (i, link, rec) {
  var ii = i;

  Ext.getCmp("winDcExpTypeDdd2ID").hide();
  Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");

  Ext.Ajax.request({
    url: link,
    method: "GET", //POST
    disableCaching: false,
    success: function (result, request) {
      var msg = "";
      let jsonData = Ext.util.JSON.decode(result.responseText); //decode json

      // console.log("OK")
      // return ;
      if (ii === 2) {
        if (jsonData.success != true) {
          msg += "<span style='white-space: nowrap;'>เกิดข้อผิดพลาดกรุณาติดต่อ admin </span><br>";
        } else {
          // if (
          //   jsonData.data[0].f_overlap_total <
          //   rec.get("f_total_amt").replace(/,/g, "") - 0
          // ) {
          //   msg +=
          //     "<span style='white-space: nowrap;'>จำนวนเงินใบกันไม่เพียงพอ</span><br>";
          // }
        }

        if (msg == "") {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "UPDATE_CONTRACT_BG_OVERLAP2", //UPDATE_TOR_DTL_BG
              sp_tor_contract_id: Ext.rec.get("sp_tor_contract_pro_id"), //sp_dtl_id
              bg_reserve_overlap_id: jsonData.bg_reserve_overlap_id,
            },
            method: "POST", //POST
            success: function (result, request) {
              Ext.getCmp("winDcExpTypeDdd2ID").destroy();
              Ext.getCmp("winChequeID").getEl().unmask(); //end
              Ext.storeProject.reload();
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        } else {
          Ext.MessageBox.alert("Failed", msg);
          Ext.getCmp("winChequeID").getEl().unmask(); //end
          Ext.getCmp("winDcExpTypeDdd2ID").destroy();
        }
      } else {
        if (jsonData.debug != true) {
          msg += "<span style='white-space: nowrap;'>เกิดข้อผิดพลาดกรุณาติดต่อ admin </span><br>";
        } else {
          if (jsonData.data[0].f_overlap_total < rec.get("f_total_amt").replace(/,/g, "") - 0) {
            msg += "<span style='white-space: nowrap;'>จำนวนเงินใบกันไม่เพียงพอ</span><br>";
          }
        }

        if (msg == "") {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "UPDATE_CONTRACT_BG_OVERLAP", //UPDATE_TOR_DTL_BG
              sp_tor_contract_id: Ext.rec.get("sp_tor_contract_pro_id"), //sp_dtl_id
              c_overlap: Ext.getCmp("c_overlapID").getValue(),
            },
            method: "POST", //POST
            success: function (result, request) {
              Ext.getCmp("winDcExpTypeDdd2ID").destroy();
              Ext.getCmp("winChequeID").getEl().unmask(); //end
              Ext.storeProject.reload();
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        } else {
          Ext.MessageBox.alert("Failed", msg);
          Ext.getCmp("winChequeID").getEl().unmask(); //end
          Ext.getCmp("winDcExpTypeDdd2ID").destroy();
        }
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
};

const text_dc_expense_budget = function (event, rec) {
  var dc_budget_NUM = Ext.dc_expense_budget_in_tor.data.length;
  var sum_f_total_dc_expense_budget_in_tor = 0;
  var text_dc_expense_budget = "<table width='100%' border='0' cellspacing='0' cellpadding='0'><thead valign='top'></thead>";
  var style = "";
  Ext.sum_minus = 0;

  for (table_loop = 1; dc_budget_NUM >= table_loop; table_loop++) {
    f_sum_monthly_hdr = 0;
    var dc_expense_budget_in_tor_id = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.id;
    var sum_expense_budget = 0;
    for (i_sum_loop = 1; Ext.sp_gl_monthly_dtl.data.length >= i_sum_loop; i_sum_loop++) {
      if (Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.dc_expense_budget_type_id == dc_expense_budget_in_tor_id) {
        var f_month_total = Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, "");
        sum_expense_budget = sum_expense_budget + parseFloat(f_month_total);
      }
      f_sum_monthly_hdr = f_sum_monthly_hdr + parseFloat(Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, ""));
    }
    sum_expense_budget = Number.parseFloat(sum_expense_budget).toFixed(2);
    dc_expense_budget_in_tor = Number.parseFloat(Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.f_total).toFixed(2);
    var c_name_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.c_name;
    var f_total_dc_expense_budget_in_tor = dc_expense_budget_in_tor - sum_expense_budget;
    // var style = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
    if (f_total_dc_expense_budget_in_tor < 0) {
      style = "color:red;";
      Ext.sum_minus = 1;
    } else {
      style = "color:green;";
    }
    // Ext.sum_minus = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
    text_dc_expense_budget += "<tr><td style='' align='right'>" + table_loop + ".&nbsp;</td>";
    text_dc_expense_budget += "<td style='' align='left'>" + c_name_dc_expense_budget_in_tor + "</td>";
    text_dc_expense_budget += "<td style='" + style + "' align='right'>" + Ext.util.Format.number(parseFloat(f_total_dc_expense_budget_in_tor), "0,000.00") + "</td></tr>";
    sum_f_total_dc_expense_budget_in_tor = sum_f_total_dc_expense_budget_in_tor + f_total_dc_expense_budget_in_tor;
  }
  var style = sum_f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
  text_dc_expense_budget += "<td style='' align='left'></td>";
  text_dc_expense_budget += "<td style='' align='left'><b><u>เงินรวม :</u></b></td>";
  text_dc_expense_budget += "<td style='" + style + "' align='right'><b><u>" + Ext.util.Format.number(parseFloat(sum_f_total_dc_expense_budget_in_tor), "0,000.00") + "</u></b></td></tr>";
  text_dc_expense_budget += "</thead></table>";
  Ext.getCmp("f_sum_monthly_hdr").setValue(Ext.util.Format.number(parseFloat(f_sum_monthly_hdr), "0,000.00"));
  if (Number.parseFloat(f_sum_monthly_hdr).toFixed(2) == rec.get("f_total_amt").replace(/,/g, "")) {
    Ext.get("f_sum_monthly_hdr").setStyle("color", "green");
    Ext.not_equal = 0;
  } else {
    Ext.get("f_sum_monthly_hdr").setStyle("color", "red");
    Ext.not_equal = 1;
  }
  return text_dc_expense_budget;
  // Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget);
};
const buMonthly = function (rec, event) {
  return {
    xtype: "button",
    id: "bnt_SetDebt",
    fieldLabel: "กำหนดตั้งหนี้ค่าใช้จ่าย",
    text: "กำหนดตั้งหนี้ค่าใช้จ่าย",
    iconCls: "icon-add",
    handler: function () {
      if (Ext.getCmp("sp_tor_contract_id").getValue() > 0) {
        Ext.dc_expense_budget_in_tor = new Ext.data.JsonStore({
          storeId: "myStore1",
          // autoLoad: true,
          url: "tor/api/mnGlController.php",
          root: "data",
          baseParams: {
            mode: "DC_EXPENSE_BUDGET_IN_TOR",
            sp_tor_id: rec.get("sp_tor_pro_id"),
            sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
          }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["id", "c_name", "f_total"],
        });

        //--------------------------------------------------------------------------
        Ext.dc_expense_id = new Ext.data.JsonStore({
          storeId: "myStore1",
          // autoLoad: true,
          url: "tor/api/mnGlController.php",
          root: "data",
          baseParams: {
            mode: "DC_EXPENSE_BUDGET_IN_TOR",
            sp_tor_id: rec.get("sp_tor_pro_id"),
            sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
          }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["id", "c_name", "f_total"],
        });

        //--------------------------------------------------------------------------

        Ext.sp_gl_monthly_hdr = new Ext.data.JsonStore({
          storeId: "myStore1",
          // autoLoad: true,
          url: "tor/api/mnGlController.php",
          root: "data",
          baseParams: {
            mode: "SP_GL_MONTHLY_HDR",
            sp_tor_id: rec.get("sp_tor_pro_id"),
            sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
          }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["sp_gl_monthly_hdr_id", "i_month_total", "f_total", "d_doc_date", "dc_acc_id", "c_dc_acc", "dc_cost_id", "c_comment"],
        });
        Ext.sp_gl_monthly_dtl = new Ext.data.JsonStore({
          // autoLoad: true,
          url: "tor/api/mnGlController.php",
          root: "data",
          baseParams: {
            mode: "LIST_SP_GL_MONTHLY_DTL",
            sp_gl_monthly_hdr_id: 0,
          }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["sp_gl_monthly_hdr_id", "sp_gl_monthly_dtl_id", "i_month", "dc_expense_budget_type_id", "dc_acc_id", "f_month_total", "d_doc_date", "c_comment", "po_expense_id"],
        });
        Ext.dc_expense_budget_in_tor.reload({
          callback: function (recordx, operation, success) {
            if (success) {
              Ext.sp_gl_monthly_hdr.reload({
                callback: function (recordx, operation, success) {
                  if (success) {
                    if (Ext.sp_gl_monthly_hdr.data.length > 0) {
                      Ext.sp_gl_monthly_dtl.reload({
                        params: {
                          mode: "LIST_SP_GL_MONTHLY_DTL",
                          sp_gl_monthly_hdr_id: Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id,
                        },
                        callback: function (recordx, operation, success) {
                          if (success) {
                            Ext.getCmp("sp_gl_monthly_hdr_id").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id);
                            Ext.getCmp("i_month_total").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.i_month_total);
                            Ext.getCmp("d_date_monthly_hdr").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.d_doc_date);
                            Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget(event, rec));
                          }
                        },
                      });
                    } else {
                      Ext.getCmp("sp_gl_monthly_hdr_id").setValue(0);
                    }
                  }
                },
              });
            }
          },
        });
        Ext.storeAccExpense = new Ext.data.JsonStore({
          storeId: "myStore1",
          autoLoad: true,
          url: "../sp/api/All_DcExpense.php",
          root: "data",
          baseParams: { type: "storeAccExpense" }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["id", "c_code", "c_name"],
        });
        Ext.NMU_dc_acc = new Ext.data.JsonStore({
          storeId: "myStore1",
          autoLoad: true,
          url: "../sp/api/All_DcExpense.php",
          root: "data",
          baseParams: { type: "NMU_dc_acc" }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["id", "c_name"],
        });

        Ext.dc_expense_id = new Ext.data.JsonStore({
          storeId: "myStore1",
          autoLoad: true,
          url: "../sp/api/All_DcExpense.php",
          root: "data",
          baseParams: { type: "dc_expense_id" }, //Permission i_read
          idProperty: "id",
          totalProperty: "totalCount",
          fields: ["id", "c_name"],
        });
        let storeDtlRecord = Ext.data.Record.create([
          { name: "i_month" },
          { name: "dc_expense_budget_type_id" },
          { name: "dc_acc_id" },
          { name: "bg_budget_dtl_overlap_id" },
          { name: "f_total" },
          { name: "d_doc_date" },
          { name: "c_code_ref" },
          { name: "c_comment" },
        ]);

        Ext.dc_expense_id.reload({
          callback: function (recordx, operation, success) {
            if (success) {
              //

              if (!Ext.isEmpty(Ext.getCmp("win-sp_gl_monthly"))) Ext.getCmp("win-sp_gl_monthly").destroy();

              win = new Ext.Window({
                title: "ตั้งหนี้ค่าใช่จ่าย",
                id: "win-sp_gl_monthly",
                width: Ext.getCmp("contenterCenter").getWidth() - 10,
                height: Ext.getCmp("contenterCenter").getHeight() - 10,
                modal: true,
                plain: true,
                layout: "fit",
                maximizable: true,
                collapsible: true,
                closable: true,
                frame: true,
                listeners: {
                  close: function () {
                    //                                                                            Ext.getCmp("win-frm-contractID").destroy();
                    //                                                                            Ext.getCmp(Ext.poFormID).destroy();
                    //                                                                            Ext.storeDtl.reload();
                  },
                },
                layout: {
                  type: "vbox",
                  align: "stretch",
                },
                defaults: {
                  xtype: "panel",
                  flex: 1,
                },
                items: [
                  {
                    xtype: "form",
                    id: "form-widgets2",
                    // url: "api/mnDcUser.php",
                    frame: true,
                    labelWidth: 100,
                    bodyStyle: {
                      padding: "10px 20px",
                    },
                    defaults: {
                      anchor: "100%",
                      msgTarget: "side",
                    },
                    items: [
                      {
                        xtype: "hidden",
                        id: "sp_gl_monthly_hdr_id",
                      },
                      {
                        xtype: "hidden",
                        value: rec.get("dc_creditor_id"),
                        id: "dc_creditor_idID",
                      },
                      {
                        fieldLabel: "งวดเงิน ",
                        id: "i_month_total",
                        emptyText: "กรุณากรอกจำนวนเตือน",
                        xtype: "textfield",
                        anchor: "35%",
                        style: "text-align: center",
                      },
                      {
                        fieldLabel: "วันที่บันทึก ",
                        id: "d_date_monthly_hdr",
                        xtype: "datefield",
                        anchor: "35%",
                        validator: function (val) {
                          if (!Ext.isEmpty(val)) {
                            return true;
                          } else {
                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                          }
                        },
                      },
                      {
                        fieldLabel: "วงเงิน ",
                        id: "f_total_all_month",
                        xtype: "textfield",
                        readOnly: true,
                        anchor: "30%",
                        style: "color:blue; text-align: right;",
                        listeners: {
                          Change: function (value) {
                            this.fn();
                          },
                          blur: function () {
                            this.fn();
                          },
                          afterrender: function () {
                            this.fn = function () {
                              var val = 0;
                              val = this.getValue();
                              var f_total = rec.get("f_total_amt");
                              this.setValue(Ext.floatRenderer(parseFloat(f_total.replace(/,/g, "") / 1)));
                            };
                            this.fn();
                          },
                        },
                      },
                      {
                        id: "fieldsetID",
                        xtype: "fieldset",
                        anchor: "40%",
                        title: "ข้อมูลเงินวง PR เหลือแยกตามแหล่งเงิน ",
                        autoHeight: true,
                        // defaultType: 'radio', // each item will be a radio button
                        items: [
                          {
                            xtype: "label",
                            id: "text_dc_expense_budget",
                            // html: "<span style='white-space: nowrap;'>1. เงินกองทุนพัฒนาคณะแพทยศาสตร์วชิรพยาบาล : 20,000.00 บาท<br></span>",
                            html: Ext.text_expense_budget,
                            listeners: {
                              afterrender: function () {
                                Ext.dc_expense_budget_in_tor.reload({
                                  callback: function (recordx, operation, success) {
                                    if (success) {
                                      Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget(event, rec));
                                    }
                                  },
                                });
                              },
                            },
                          },
                        ],
                        listeners: {
                          afterrender: function () {},
                          beforerender: function () {
                            this.fn = function () {};
                            this.fn();
                          },
                        },
                      },
                    ],
                  },

                  new Ext.grid.EditorGridPanel({
                    id: "gridEditor_sp_gl_monthly",
                    region: "center",
                    width: "100%",
                    height: 450,
                    layout: "fit",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    clicksToEdit: 1,
                    store: Ext.sp_gl_monthly_dtl,

                    listeners: {
                      afteredit: function () {
                        Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget(event, rec));
                      },
                      beforerender: function () {
                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                          if (columnIndex === grid.getColumnModel().getIndexById("delete_dtl_monthly")) {
                            Ext.sp_gl_monthly_dtl.removeAt(rowIndex);
                          }
                        };
                      },
                      afterrender: function () {
                        Ext.getCmp("gridEditor_sp_gl_monthly").on("cellclick", this.thisCick, this);
                      },
                    },
                    tbar: [
                      {
                        xtype: "button",
                        iconCls: "icon-add",
                        text: "เพิ่มรายการ",
                        handler: function () {
                          var dc_expense_budget_type_id = Ext.dc_expense_budget_in_tor.data.length == 1 ? Ext.dc_expense_budget_in_tor.data.items[0].data.id : "";
                          let myNewRecord = new storeDtlRecord({
                            sp_gl_monthly_dtl_id: 0,
                            i_month: "",
                            dc_expense_budget_type_id: dc_expense_budget_type_id,
                            po_expense_id: 0,
                            bg_budget_dtl_overlap_id: "",
                            f_month_total: "0",
                            d_date: "",
                            c_comment: "",
                          });
                          Ext.sp_gl_monthly_dtl.insert(0, myNewRecord);
                        },
                      },
                    ],
                    columns: [
                      {
                        header: "งวด",
                        sortable: false,
                        align: "center",
                        dataIndex: "i_month",
                        width: 60,
                        editor: new Ext.form.TextField({
                          style: "text-align: center",
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                // this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                              };
                            },
                            Change: function (value) {
                              this.fn();
                            },
                          },
                        }),
                      },
                      {
                        header: "แหล่งเงิน1",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_expense_budget_type_id",
                        width: 250,
                        editor: new Ext.form.ComboBox({
                          mode: "local",
                          id: "editor_dc_cost_id",
                          store: Ext.dc_expense_budget_in_tor,
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          typeAhead: false,
                          emptyText: "กรุณาเลือก...",
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
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          if (record.data.i_type == 1 || record.data.i_type == 2) {
                            metaData.attr = "style='text-align: right; font-weight: bold;'";
                            let name = record.data.i_type == 1 ? getStoreItems(Ext.dc_expense_budget_type, value, "c_name") : "รวมทั้งสิ้น";
                            name = name != "" ? name : "- ไม่ระบุหน่วยงาน -";
                            return name;
                          } else if (value != "" && value != undefined) {
                            metaData.attr = "style='text-align: left;'";
                            let name = getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
                            return name;
                          } else {
                            metaData.attr = "style='text-align: center; color:red;'";
                            return "-";
                          }
                        },
                      },
                      {
                        header: "ค่าใช้จ่าย",
                        sortable: false,
                        align: "center",
                        dataIndex: "c_comment",
                        width: 300,
                        editor: new Ext.form.TextField({
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {};
                            },
                            Change: function (value) {
                              this.fn();
                            },
                          },
                        }),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='text-align: left;'";
                          return value;
                        },
                      },
                      {
                        header: "งบประมาณ LV.4",
                        sortable: false,
                        align: "center",
                        dataIndex: "po_expense_id",
                        width: 250,
                        editor: new Ext.form.ComboBox({
                          mode: "local",
                          id: "editor_dc_expense_id",
                          store: Ext.dc_expense_id,
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          typeAhead: false,
                          emptyText: "กรุณาเลือก...",
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
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          if (record.data.i_type == 1 || record.data.i_type == 2) {
                            metaData.attr = "style='text-align: right; font-weight: bold;'";
                            let name = record.data.i_type == 1 ? getStoreItems(Ext.dc_expense_id, value, "c_name") : "รวมทั้งสิ้น";
                            name = name != "" ? name : "- ค่าใช้จ่าย-";
                            return name;
                          } else if (value != "" && value != undefined) {
                            metaData.attr = "style='text-align: left;'";
                            let name = getStoreItems(Ext.dc_expense_id, value, "c_name");
                            return name;
                          } else {
                            metaData.attr = "style='text-align: center; color:red;'";
                            return "-";
                          }
                        },
                      },

                      {
                        header: "จำนวนเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_month_total",
                        width: 110,
                        editor: new Ext.form.TextField({
                          style: "text-align: right",
                          // enableKeyEvents: true,
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                this.setValue(this.getValue() <= 0 ? 0 : this.getValue());
                                this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                              };
                            },
                            Change: function (value) {
                              // text_dc_expense_budget();
                              this.fn();
                            },
                          },
                        }),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          if (record.data.i_type == 1 || record.data.i_type == 2) {
                            metaData.attr = "style='text-align: right; font-weight: bold;'";
                            return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                          } else if (value) {
                            metaData.attr = "style='text-align: right;'";
                            return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                          } else {
                            metaData.attr = "style='text-align: right; color:red;'";
                            return "-";
                          }
                        },
                      },
                      {
                        header: "วันที่",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_date",
                        editor: new Ext.form.DateField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          return value != "" && value != null ? shortThaiDate(value) : "";
                        },
                      },

                      {
                        id: "delete_dtl_monthly",
                        header: "ลบ",
                        sortable: false,
                        align: "center",
                        width: 30,
                        dataIndex: "id",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                          // if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
                          return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                        },
                      },
                      { width: 20, dataIndex: "" },
                    ],
                    bbar: [
                      {
                        text: "&nbsp;บันทึกการตั้งหนี้ค่าใช้จ่าย&nbsp;",
                        id: "saveExtendTime",
                        iconCls: "icon-save",
                        handler: function () {
                          // alert("รอการทำการบันทึก");
                          let msg = "";
                          let jsonArr = [];
                          let Arr_month_group = [];
                          let sto = Ext.sp_gl_monthly_dtl.data.items;
                          let msg_show = 0;
                          sto.forEach(function (v) {
                            jsonArr.push({
                              sp_gl_monthly_dtl_id: v.data.sp_gl_monthly_dtl_id,
                              i_month: v.data.i_month,
                              dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
                              dc_expense_id: v.data.dc_expense_id,
                              po_expense_id: v.data.po_expense_id,
                              dc_acc_id: v.data.dc_acc_id,
                              dc_creditor_id: Ext.getCmp("dc_creditor_idID").getValue(),
                              f_month_total: v.data.f_month_total ? v.data.f_month_total.replace(/,/g, "") : "",
                              d_date: Ext.util.Format.gridDate(v.data.d_doc_date, "Y-m-d"),
                              c_comment: v.data.c_comment,
                            });
                            if (Arr_month_group.find((e) => e == v.data.i_month) == undefined) {
                              Arr_month_group.push(v.data.i_month);
                            }
                            if (v.data.i_month == "" || v.data.i_month == null || isNaN(v.data.i_month) == true) {
                              msg_show = 1;
                            }
                            if (v.data.dc_expense_budget_type_id == "" || v.data.dc_expense_budget_type_id == null) {
                              msg_show = 1;
                            }
                            /* if (v.data.po_expense_id == "" || v.data.dc_acc_id == null) {
                                                                                             msg_show = 1;*/
                            if (v.data.dc_acc_id == "" || v.data.dc_acc_id == null) {
                              msg_show = 1;
                            }
                            if (v.data.d_doc_date == "" || v.data.d_doc_date == null) {
                              msg_show = 1;
                            }
                          });
                          for (var i = 1; i <= Ext.getCmp("i_month_total").getValue(); i++) {
                            if (Arr_month_group.find((e) => e == i) == undefined) {
                              msg += "<span style='white-space: nowrap;'>- กรุณาระบุรายละเอียดของเดือนที่ " + i + "</span><br>";
                            }
                          }
                          if (Arr_month_group.length != Ext.getCmp("i_month_total").getValue()) {
                            msg += "<span style='white-space: nowrap;'>- รายระเอียดเดือนไม่ตรงกับจำนวนเดือนที่กำหนด</span><br>";
                          }
                          /* if (msg_show == 1) {
                                                                                         msg += "<span style='white-space: nowrap;'>- กรุณากรอกรายระเอียด</span><br>";
                                                                                         }*/
                          if (Ext.getCmp("i_month_total").getValue() == "") {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอกจำนวนเดือน</span><br>";
                          }
                          if (isNaN(Ext.getCmp("i_month_total").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาจำนวนเดือนเป็นตัวเลข</span><br>";
                          }
                          //  -------------------------------------------------------------------------ผังบัญชี
                          /*   if (Ext.getCmp("dc_acc_idID").getValue() <= 0) {    
                                                                                         //  msg += "<span style='white-space: nowrap;'>- กรุณากรอกผังบัญชี</span><br>";
                                                                                         }*/
                          if (Ext.not_equal == 1) {
                            //  msg += "<span style='white-space: nowrap;'>- กรุณาตั้งหนี้ค่าใช้ค่าให้กับพอดีวงเงิน</span><br>";
                          }
                          if (Ext.sum_minus == 1) {
                            msg += "<span style='white-space: nowrap;'>- วงเงินแหล่งเงินไม่เพียงพอ</span><br>";
                          }
                          if (msg == "") {
                            Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                            Ext.Ajax.request({
                              url: "tor/api/mnTorController.php",
                              method: "POST",
                              params: {
                                mode: "UP_SP_GL_MONTHLY",
                                sp_tor_id: rec.get("sp_tor_pro_id"),
                                sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
                                c_doc_ref: rec.get("c_doc_ref"),
                                sp_gl_monthly_hdr_id: Ext.getCmp("sp_gl_monthly_hdr_id").getValue(),
                                i_month_total: Ext.getCmp("i_month_total").getValue(),
                                d_date_monthly_hdr: Ext.util.Format.date(Ext.getCmp("d_date_monthly_hdr").getValue(), "Y-m-d"),
                                i_is_period: rec.get("i_is_period"),

                                //                                                       po_expense_idID: Ext.getCmp("po_expense_idID").getValue(),

                                // dc_acc_idID: Ext.getCmp("dc_acc_idID").getValue(),  ผังบัญชี --ฝั่งบัญชี
                                dc_cost_id: Ext.selectRow.data.dc_cost_id,
                                f_total: Ext.getCmp("f_total_all_month").getValue() ? Ext.getCmp("f_total_all_month").getValue().replace(/,/g, "") : "",
                                data: JSON.stringify(jsonArr),
                              },
                              success: function (result, request) {
                                Ext.getCmp("contenterCenter").getEl().unmask();
                                let json = Ext.util.JSON.decode(result.responseText); //decode json
                                Ext.Msg.alert("แจ้งเตือน", json.msg);
                                Ext.getCmp("win-sp_gl_monthly").destroy();
                                if (json.success == true) {
                                  Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                                }
                              },
                              failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                              },
                            });
                          } else {
                            Ext.Msg.alert("แจ้งเตือน", msg);
                          }
                        },
                      },
                      "->",
                      {
                        id: "f_sum_monthly_hdr",
                        xtype: "textfield",
                        style: "text-align: right; font-weight: bold; color: green;",
                        width: 150,
                        readOnly: true,
                        value: "0.00",
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                              this.setValue(floatRenderer(value));
                            };
                          },
                          Change: function (value) {
                            this.fn();
                          },
                        },
                      },
                    ],
                  }),
                ],
              });

              win.show();
              //
            }
          },
        });
      } else {
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกสัญญาก่อนทำการกำหนดตั้งหนี้ค่าใช้จ่าย</span><br>");
      }
    },
  };
}; //End function
/*
 *
 * @param {type} mode
 * @returns {undefined}
 */
const saveDtl = function (mode) {
  let msg = "";
  let jsonArr = [];
  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
  var row = 0;
  while (num >= row) {
    if (document.getElementById("chk_" + row).checked == true) {
      jsonArr.push({
        sp_tor_id: Ext.TOR_ID,
        sp_tor_dtl_id: document.getElementById("chk_" + row).value,
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
        i_qty: document.getElementById("num_" + row).value,
        // f_net_unit_price: document.getElementById("num_" + row).value,
        // c_name: Ext.getCmp("gridEditor").store.data.items[row].data.c_name,
      });
    }
    row++;
  }

  if (jsonArr.length <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
  }
  if (msg == "") {
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      method: "POST",
      params: {
        mode: "UP_SP_TOR_DTL_PERIOD",
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText);
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        Ext.getCmp("win-frm-perid-bal-dtlID").destroy();
        Ext.store4.load({
          callback: function (record, operation, success) {
            if (success) {
              var i = this.data.length - 1;
              if (i >= 0) {
                Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
              } else {
                Ext.getCmp("bbf_total_price4ID").setValue("0");
                Ext.getCmp("bbf_qty4ID").setValue("0.00");
              }
            }
          },
        });
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};
const savePerid = function () {
  //    return false;

  let msg = "";

  if (Ext.getCmp("period_dc_expense_budget_type_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกแหล่งเงิน</span><br>";
  }
  if (Ext.getCmp("period_po_expense_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการย่อย</span><br>";
  }
  if (Ext.getCmp("period_c_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกกรอกชื่อ</span><br>";
  }
  if (Ext.getCmp("period_i_qty").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุจำนวน</span><br>";
  }
  if (Ext.getCmp("period_dc_unit_type_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกหน่วยนับ</span><br>";
  }

  let jsonArr = [];

  if (msg == "") {
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      method: "POST",
      params: {
        mode: "UP_SP_TOR_DTL_PERIOD_NEW",
        sp_tor_id: Ext.sp_tor_contract_pro_id,
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
        sp_tor_hdr_period_id: Ext.getCmp("sp_tor_hdr_period_idID").getValue(),
        sp_tor_dtl_period_id: Ext.getCmp("sp_tor_dtl_period_idID").getValue(),
        dc_bg_budget_type_id: Ext.getCmp("period_dc_expense_budget_type_id").getValue(),
        po_expense_id: Ext.getCmp("period_po_expense_id").getValue(),
        i_is_item: Ext.getCmp("i_is_item").getValue() == true ? 1 : 0 ,
        i_hire_type: Ext.getCmp("period_i_hire_type").getValue().inputValue,
        i_product_type: Ext.getCmp("period_i_hire_type").getValue().inputValue == 1 ? Ext.getCmp("period_i_product_type2").getValue().inputValue : null,
        i_is_inv: 0,
        c_name: Ext.getCmp("period_c_name").getValue(),
        i_qty: Ext.getCmp("period_i_qty").getValue(),
        f_net_unit_price: Ext.getCmp("period_f_net_unit_price").getValue(),
        dc_unit_type_id: Ext.getCmp("period_dc_unit_type_id").getValue(),
      },
      success: function (result, request) {
        Ext.getCmp("win-frm-perid-bal-dtl2ID").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText);
        Ext.Msg.alert("แจ้งเตือน", json.msg, function () {
          Ext.getCmp("grid-productID").getStore().reload();
          Ext.getCmp("frm-panel-proID").getForm().reset();
          Ext.getCmp("frm-proID").hide();
        });
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};
const delete_dtl_period = function () {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttons: [
      {
        text: "ตกลง",
        handler: function () {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "DELETE_SP_TOR_DTL_PERIOD",
              id: Ext.SP_TOR_DTL_PERIOD_ID,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store4.load({
                callback: function (record, operation, success) {
                  if (success) {
                    var i = this.data.length - 1;
                    if (i >= 0) {
                      Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                      Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                    } else {
                      Ext.getCmp("bbf_total_price4ID").setValue("0");
                      Ext.getCmp("bbf_qty4ID").setValue("0.00");
                    }
                  }
                },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
          Ext.getCmp("gridSub3ID").getStore().reload();
          Ext.store3.load();
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};
const delete_hdr_period = function () {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "DELETE_SP_TOR_HDR_PERIOD",
              id: Ext.SP_TOR_HDR_PERIOD_ID,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store3.load({
                callback: function (record, operation, success) {
                  // if (success) {
                  //   var i = this.data.length - 1;
                  //   if (i >= 0) {
                  //     Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                  //     Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                  //   } else {
                  //     Ext.getCmp("bbf_total_price4ID").setValue("0");
                  //     Ext.getCmp("bbf_qty4ID").setValue("0.00");
                  //   }
                  // }
                },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};
if (Ext.selectRow != null) {
  let po_expense_id = Ext.selectRow.data.po_expense_id;
  let id_1 = getStoreItems(Ext.po_expense_expire, po_expense_id, "id");
  let id_2 = getStoreItems(Ext.po_expense, po_expense_id, "id");
  if (id_1 != id_2) {
    expense_expire = Ext.po_expense;
  } else {
    expense_expire = Ext.po_expense_expire;
  }
} else {
  expense_expire = Ext.po_expense_expire;
}
Ext.Poplov_in = Ext.extend(Ext.Button, {
  config: {},
  initComponent: function () {
    this.mini = this.Minipop();
    this.isCellClickGrid = false;
    this.isSetFilter = false;
    this.setReset();
  },

  setReset: function (t) {
    if (t) {
      Ext.getCmp(this.id + "_Name").setValue();
      Ext.getCmp(this.id).setValue();
    }
  },
  afterrender: function () {},
  uiSearch: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = id;

    var setDefaultFilter = [
      ["c_tax_number_imp", "เลขที่ประจำตัวผู้เสียภาษี"],
      ["c_name", "ชื่อ"],
    ];
    var setFilter = [["c_name", "ชื่อ"]];

    var filterGrid = new Ext.data.SimpleStore({
      fields: ["value", "text"],
      data: this.isSetFilter ? setFilter : setDefaultFilter,
    });
    var store = this.store;

    var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
    var defFilter = this.defFilter; //default filter

    return [
      {
        id: "filter" + id,
        xtype: "combo",
        width: 130,
        mode: "local",
        store: filterGrid,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: Ext.isEmpty(defFilter) ? "c_tax_number_imp" : defFilter,
      },
      "-",
      {
        id: "value-box" + id,
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
        listeners: {
          specialkey: function (f, e) {
            if (e.getKey() == e.ENTER) {
              store.setBaseParam("type", "SEARCH");
              store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
              store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
              Ext.getCmp("win-pop-lov-modal-" + id)
                .getStore()
                .load();
            }
          },
        },
      },
    ];
  },

  Minipop: function () {
    /******/
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = this.id;
    var nameID = this.id + "_Name";
    var widthText = isNaN(this.widthText) ? 198 : this.widthText;
    var uiSearch = this.uiSearch(id);

    /*****/
    function SearchGrid(store, id) {
      if (Ext.getCmp("value-box" + id).getValue() != "") {
        store.setBaseParam("type", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("type", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      var TextShow = record.data.c_tax_number_imp + " " + record.data.c_name;
      Ext.getCmp(id).setValue(record.data.id);
      Ext.getCmp(nameID).setValue(TextShow);

      Ext.getCmp("win-pop-lov" + id).hide();
      Ext.getCmp("win-pop-lov" + id).destroy();
    };

    cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;
    //*++
    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        {
          xtype: "hidden",
          name: this.valueHidden,
          id: id,
          value: this.value,
        },
        {
          xtype: "textfield",
          name: "txt" + this.id,
          emptyText: this.text,
          id: nameID,
          readOnly: true,
        },
        {
          xtype: "button",
          id: "Bu" + this.id,
          name: "Bu" + this.id,
          iconCls: this.iconCls,
          handler: function () {
            /* //Load Store Begin SearchGrid */
            store.setBaseParam("type", "");
            store.load();

            var win = new Ext.Window({
              id: "win-pop-lov" + id,
              title: "เลือกข้อมูล",
              modal: true,
              plain: true,
              layout: "fit",
              maximizable: true,
              constrainHeader: true,
              closable: true,
              listeners: {
                afterrender: function (obj, eOpts) {
                  this.fn = function (widht, height) {
                    //percentage
                    var width = Ext.getBody().getViewSize().width * widht;
                    var height = Ext.getBody().getViewSize().height * height;
                    this.setSize(width, height);
                  };
                  this.fn(0.8, 0.85);
                },
                maximize: function (window, opts) {
                  //when property minimizable
                  window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                  window.expand("", false);
                  window.center();
                },
              },
              items: [
                {
                  xtype: "grid",
                  id: "win-pop-lov-modal-" + id,
                  border: false,
                  stripeRows: true,
                  loadMask: true,
                  store: store,
                  tbar: [
                    uiSearch,
                    " ",
                    "-",
                    {
                      text: "ค้นหา",
                      id: "magnifier_" + id,
                      iconCls: "icon-magnifier",
                      handler: function () {
                        SearchGrid(store, id);
                      },
                    },
                    "->",
                    {
                      id: "buBackSub2ID",
                      xtype: "button",
                      iconCls: "icon-add",
                      text: "เพิ่มรายชื่อ",
                      disabled: true,

                      handler: function () {
                        //*--
                        Ext.DidderAdd();
                        // Ext.getCmp("winChequeID").setActiveTab(0);
                      },
                    },
                  ],
                  columns: headerGrid,
                  listeners: {
                    afterrender: function (obj, eOpts) {
                      this.fn = function (widht, height) {
                        //percentage

                        var width = Ext.getBody().getViewSize().width * widht;
                        var height = Ext.getBody().getViewSize().height * height;
                        this.setSize(width, height);
                      };
                      this.fn(0.5, 0.4);
                    },
                  },
                  autoExpandColumn: "c_name",
                  bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: store,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                  }),
                },
              ],
            });

            win.show();
            Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
          },
        },
      ],
    };
  }, //Mini
});
Ext.storeCreditor = new Ext.data.JsonStore({
  //autoLoad: true,
  storeId: "myStoreCont",
  url: "tor/api/mnTorController.php",
  baseParams: { mode: "LIST_POP_CREDITOR", id: 0 },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "dc_creditor_id2" }, { name: "c_tax_number_imp" }, { name: "c_name" }],
});
var columnMini2 = [
  {
    header: "ID System",
    sortable: true,
    hidden: true,
    dataIndex: "dc_creditor_id",
  },
  {
    header: "",
    sortable: true,
    hidden: true,
    dataIndex: "c_code",
  },
  {
    header: "เลขที่ประจำตัวผู้เสียภาษี",
    align: "center",
    width: 150,
    sortable: true,
    dataIndex: "c_tax_number_imp",
  },
  {
    header: "ชื่อ",
    sortable: true,
    id: "c_name",
    dataIndex: "c_name",
    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      metaData.attr = "style='cursor:pointer';";
      return value;
    },
  },
];
var PopCreditorForm = new Ext.Poplov_in({
  text: "เลือกผู้เสนอราคา",
  id: "dc_creditor_id2ID",
  iconCls: "page_magnify",
  // hidden: true,
  name: "dc_creditor_period_id",
  // name: "dc_creditor_period_id",
  valueHidden: "dc_creditor_id2",
  store: Ext.storeCreditor,
  headerGrid: columnMini2,
  widthText: 350,
  fieldLabel: "เลือกผู้เสนอราคา",
  isCellClickGrid: true,
  cellClickGrid: function (grid, rowIndex, columnIndex, e) {
    var id = "dc_creditor_id2ID";
    var nameID = id + "_Name";
    var record = grid.getStore().getAt(rowIndex);
    var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
    var TextShow = c_tax_number_imp + " : " + record.data.c_name;
    Ext.getCmp("dc_creditor_id2ID").setValue(record.data.dc_creditor_id);
    Ext.getCmp("dc_creditor_per_idID").setValue(record.json.dc_creditor_id);
    // Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
    // var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
    // Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));  dc_creditor_id2ID_Name
    Ext.getCmp(nameID).setValue(TextShow);
    Ext.getCmp("win-pop-lov" + id).hide();
    Ext.getCmp("win-pop-lov" + id).destroy();
  },
});
/*functi*/
function win_hdr_period(rec, event) {
  var tabs = new Ext.FormPanel({
    labelWidth: 175,
    bodyStyle: "padding:1px",
    id: "frm-panel-periodID",
    url: "tor/api/mnTorController.php",
    border: false,
    autoScroll: true,
    frame: true,
    listeners: {
      afterrender: function () {
        Ext.getCmp("dc_creditor_per_text").setValue(Ext.selectRow.data.dc_creditor_idTxt);
        if (Ext.selectRow.data.i_is_join_venture == 1) {
          Ext.getCmp("dc_creditor_per_text").hide();
          Ext.getCmp("pop_dc_creditor_id2ID").show();
        } else {
          Ext.getCmp("pop_dc_creditor_id2ID").hide();
          Ext.getCmp("dc_creditor_per_text").show();
        }
      },
    },
    items: [
      {
        xtype: "tabpanel",
        activeTab: 0,
        defaults: {
          autoHeight: true,
          bodyStyle: "padding:2px",
        },
        id: "frm-periodID",
        items: [
          {
            title: "รายละเอียดงวดงานในสัญญา", //htmleditor
            layout: "form",
            defaults: { width: 430 },
            border: false,
            defaultType: "textfield",
            items: [
              {
                xtype: "hidden", //hidden
                name: "mode",
                value: "UP_SP_TOR_HDR_PERIOD_PRO",
              },
              {
                xtype: "hidden", //hidden textfield
                id: "hdr_periodID",
                name: "sp_tor_hdr_period_id",
              },
              {
                xtype: "hidden", //hidden
                name: "tor_id",
                value: rec.get("sp_tor_pro_id"),
              },
              {
                xtype: "hidden", //hidden
                name: "sp_tor_contract_id",
                value: rec.get("sp_tor_contract_pro_id"),
              },
              {
                xtype: "hidden",
                name: "i_is_po",
                value: Ext.I_IS_PO,
              },
              {
                xtype: "hidden",
                name: "i_is_purchase",
              },
              {
                xtype: "hidden",
                name: "ap_po_hdr_id",
              },
              {
                xtype: "buttongroup",
                fieldLabel: "งวดตามสัญญา  ",
                width: 500,
                frame: false,
                border: false,
                items: [
                  {
                    fieldLabel: "งวดตามสัญญา",
                    xtype: "numberfield",
                    //                        value: 1,
                    style: "text-align: center",
                    name: "i_period_contract",
                    id: "i_period_contractID",
                    width: 50,
                    validator: function (val) {
                      var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                      if (!regex.test(val)) {
                        return "กรุณากรอก ตัวเลข";
                        return true;
                      } else {
                        return true;
                      }
                    },
                  },
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                  {
                    xtype: "displayfield",
                    value: "* งวดตามสัญญา ใช้อ้างอิง ในกรณีต้องแยก แหล่งเงิน/ปี อื่นๆ",
                    width: 400,
                    style: {
                      color: "red",
                    },
                  },
                ],
              },
              {
                xtype: "buttongroup",
                fieldLabel: "งวดเงิน  ",
                width: 500,
                frame: false,
                border: false,
                items: [
                  {
                    fieldLabel: "งวดที่",
                    xtype: "numberfield",
                    style: "text-align: center",
                    name: "i_period",
                    id: "i_periodID",
                    width: 50,
                    listeners: {
                      afterrender: function () {
                        //alert(this.getValue());
                        // if (Ext.getCmp("i_period_contractID").getValue() == "" || 0) Ext.getCmp("i_period_contractID").setValue(this.getValue());
                      },
                      change: function () {
                        // if (Ext.getCmp("i_period_contractID").getValue() == "" || 0) Ext.getCmp("i_period_contractID").setValue(this.getValue());
                      },
                    },
                    validator: function (val) {
                      var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                      if (!regex.test(val)) {
                        return "กรุณากรอก ตัวเลข";
                        return true;
                      } else {
                        return true;
                      }
                    },
                  },
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                  {
                    xtype: "checkbox",
                    id: "i_is_lastID",
                    name: "i_is_last",
                    boxLabel: "<b style='color: red; font-size: 12px;'>งวดสุดท้าย</b>",
                    // hidden: Ext.INSIDE_COST == 1 ? false : true,
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {
                        if (newValue) {
                        }
                      },
                    },
                  },
                ],
              },
              {
                xtype: "datefield",
                fieldLabel: "วันที่ออกเอกสาร  ",
                id: "d_doc_dateID",
                name: "d_doc_date",
                width: 100,
                validator: function (val) {
                  if (Ext.isEmpty(val)) {
                    return "กรุณากรอก วันที่ออกเอกสาร ";
                  } else {
                    return true;
                  }
                },
                listeners: {
                  change: function () {
                    d_doc_dateID_Change();
                  },
                },
              },
              {
                xtype: "radiogroup",
                columns: [150, 200],
                fieldLabel: "ลักษณะบันทึกวันส่งงวด",
                id: "i_day_useID",
                name: "i_day_use",
                items: [
                  {
                    checked: true,
                    inputValue: 1,
                    name: "i_day_use_l",
                    boxLabel: "วันที่กำหนดส่งในงวดงาน",
                  },
                  {
                    inputValue: 0,
                    name: "i_day_use_l",
                    boxLabel: "จำนวนวันที่กำหนดส่งในงวดงาน",
                  },
                ], //radiogroup
                listeners: {
                  change: function () {
                    if (this.getValue().inputValue == 0) {
                      Ext.getCmp("group_period_date").hide();
                      Ext.getCmp("group_i_day").show();
                    } else {
                      Ext.getCmp("group_period_date").show();
                      Ext.getCmp("group_i_day").hide();
                    }
                  },
                },
              },
              {
                xtype: "buttongroup",
                fieldLabel: "วันที่กำหนดส่งในงวดงาน  ",
                id: "group_period_date",
                width: 500,
                frame: false,
                border: false,
                items: [
                  {
                    xtype: "datefield",
                    id: "d_period_dateID",
                    name: "d_period_date",
                    width: 100,
                    validator: function (val) {
                      if (Ext.isEmpty(val)) {
                        return "กรุณากรอก วันที่กำหนดส่งในงวดงาน  ";
                      } else {
                        return true;
                      }
                    },
                    listeners: {
                      change: function () {
                        d_period_dateID_change();
                      },
                    },
                  },
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                  {
                    xtype: "displayfield",
                    id: "txt_d_period_dateID",
                    value: "",
                    width: 400,
                    style: {
                      color: "red",
                    },
                  },
                ],
              },
              {
                xtype: "buttongroup",
                fieldLabel: "จำนวนวันที่กำหนดส่งในงวดงาน  ",
                id: "group_i_day",
                hidden: true,
                hideMode: "offsets",
                width: 500,
                frame: false,
                border: false,
                items: [
                  {
                    xtype: "textfield",
                    id: "i_dayID",
                    style: "text-align: center",
                    name: "i_day",
                    width: 50,
                    validator: function (val) {
                      var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                      if (!regex.test(val)) {
                        return "กรุณากรอก ตัวเลข";
                        return true;
                      } else {
                        return true;
                      }
                    },
                    listeners: {
                      change: function () {
                        //                                            i_dayID_Change();
                      },
                    },
                  },
                  {
                    xtype: "displayfield",
                    value: "วัน",
                  },
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                  {
                    xtype: "displayfield",
                    id: "txt_i_dayID",
                    value: "",
                    width: 400,
                  },
                ],
              },
              {
                xtype: "buttongroup",
                fieldLabel: "จำนวนวันที่แจ้งเตือน  ",
                id: "group_i_alert",
                frame: false,
                border: false,
                items: [
                  {
                    xtype: "textfield",
                    id: "i_alertID",
                    style: "text-align: center",
                    name: "i_alert",
                    width: 50,
                    validator: function (val) {
                      var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                      if (!regex.test(val)) {
                        return "กรุณากรอก ตัวเลข";
                        return true;
                      } else {
                        return true;
                      }
                    },
                    listeners: {
                      change: function () {
                        //                                            i_alertID_Change();
                      },
                    },
                  },
                  {
                    xtype: "displayfield",
                    value: "วัน",
                  },
                  {
                    xtype: "tbspacer",
                    width: 18,
                  },
                  {
                    xtype: "displayfield",
                    id: "txt_i_alertID",
                    value: "",
                    width: 400,
                  },
                ],
              },
              {
                fieldLabel: "วงเงินในงวด",
                id: "f_total_amtID",
                width: 150,
                name: "f_total_amt",
                listeners: {
                  blur: function () {
                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                    this.setValue(Ext.floatRenderer(f_total));
                  },
                },
                style: {
                  labelAlign: "right",
                  "font-weight": "bold",
                  padding: "1px",
                  margin: "1px",
                  color: "blue",
                  "background-color": "#fff",
                  "text-align": "right",
                },
              },
              {
                xtype: "buttongroup",
                fieldLabel: "ของที่ได้มาในงวดสุดท้าย",
                frame: false,
                border: false,
                items: [
                  new Ext.form.ComboBox({
                    // fieldLabel: "ประเภทสัญญาของที่จะได้ ในงวดสุดท้าย",
                    id: "i_is_product_last",
                    mode: "local",
                    allowBlank: false,
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        ["0", "1 : จ้างไม่ได้ของ"],
                        ["1", "2 : วัสดุ"],
                        ["2", "3 : ครุภัณฑ์"],
                        ["3", "4 : วัสดุ - ครุภัณฑ์"],
                        // ["4", "5 : จ้างออกแบบ"],
                        // ["5", "6 : ที่ดิน"],
                        // ["6", "7 : ปรับปรุงอาคาร - ได้ของ"],
                        // ["7", "8 : ปรับปรุงอาคาร - ไม่ได้ของ"],
                        // ["8", "9 : สิ่งก่อสร้าง"],
                      ],
                    }),
                    valueField: "id",
                    hiddenName: "i_is_product_last",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 170,
                    listeners: {
                      afterrender: function () {
                        this.ReadOnly_set = function (set) {
                          this.setReadOnly(set);
                          // this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                        };
                        this.fn = function () {};
                        this.change_set = function () {};
                      },
                      change: function (combo, newValue) {
                        this.change_set();
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      select: function () {
                        this.change_set();
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
              },
              {
                xtype: "buttongroup",
                fieldLabel: "แหล่งเงิน",
                frame: false,
                border: false,
                items: [
                  new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type2,
                    fieldLabel: "แหล่งเงินที่ 1",
                    width: 500,
                    value: rec.get("dc_expense_budget_type_id"),
                    submitValue: true,
                    id: "dc_expense_budget_type_id1TxtID",
                    name: "dc_bg_budget_type_id",
                    hiddenName: "dc_expense_budget_type_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                        //***************************************************************************************แผนหรืองวด*******************************************************************

                        if (this.getValue() == 4 || this.getValue() == 5) {
                          Ext.getCmp("i_pr_type2ID").setValue(2);
                        } else {
                          Ext.getCmp("i_pr_type2ID").setValue(1);
                        }
                        //*********************************************************************************************************************************************************************
                        // alert(this.getValue());
                      },
                    },
                  }),
                ],
              },
              new Ext.form.ComboBox({
                mode: "local",
                //                    readOnly: true,
                store: Ext.dc_cost,
                anchor: "50%",
                fieldLabel: "หน่วยงานที่รับของ",
                valueField: "id",
                displayField: "c_name",
                hiddenName: "dc_cost2_id",
                id: "dc_cost2_idID",
                name: "c_cost2_name",
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
                xtype: "textfield",
                width: 200,
                fieldLabel: "ผู้ขายผู้รับจ้าง",
                // hidden: true,
                id: "dc_creditor_per_text",
                style: "text-align: center;font-weight:bold;background:#eee;",
                readOnly: true,
                name: "c_code",
              },
              {
                xtype: "hidden",
                name: "dc_creditor_id",
                id: "dc_creditor_per_idID",
                value: rec.get("dc_creditor_id"),
              },
              {
                xtype: "hidden",
                name: "i_is_join_venture_per",
                id: "i_is_join_venture_perID",
                value: Ext.selectRow.data.i_is_join_venture,
              },
              PopCreditorForm.mini,
              {
                xtype: "radiogroup",
                fieldLabel: "ใช้เงินงบประมาณ",
                columns: [98, 98],
                id: "i_pr_type2ID",
                name: "i_pr_type1",
                value: rec.get("i_pr_type1"),
                items: [
                  {
                    checked: true,
                    name: "i_pr_type1",
                    inputValue: 1,
                    boxLabel: "จองแบบแผน",
                  },
                  {
                    inputValue: 2,
                    name: "i_pr_type1",
                    boxLabel: "จองแบบงวด",
                  },
                ], //radiogroup
              },
              {
                fieldLabel: "หมายเหตุ",
                id: "c_comment_product3ID",
                name: "c_discription",
                value: rec.get("c_discription"),
                xtype: "textarea",
                height: 40,
                width: 430,
              },
              {
                fieldLabel: "",
                id: "copy_contract_dtl_id",
                name: "copy_contract_dtl",
                xtype: "radiogroup",
                columns: [150, 150],
                items: [
                  {
                    checked: true,
                    inputValue: "save",
                    name: "copy_contract_dtl",
                    boxLabel: "บันทึกรายการ",
                  },
                  {
                    id: "copy_periodID",
                    inputValue: "copy_period",
                    hidden: true,
                    name: "copy_contract_dtl",
                    boxLabel: "คัดลอกรายการ",
                  },
                ],
              },
            ],
            buttonAlign: "left",
            buttons: [
              {
                text: "บันทึกรายการ",
                id: "buSaveSub2ID",
                iconCls: "icon-save",
                handler: function () {
                  msg = "";
                  var formSubmit = function () {
                    form.submit({
                      waitMsg: "Saving Data...",
                      success: function (form, action) {
                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                          Ext.getCmp("frm-periodID").hide();
                          Ext.getCmp("frm-panel-periodID").getForm().reset();
                          Ext.getCmp("grid-periodID").getStore().reload();
                        });
                      },
                      failure: function (form, action) {
                        switch (action.failureType) {
                          case Ext.form.Action.CLIENT_INVALID:
                            Ext.Msg.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบถ้วน !!!");
                            break;
                          case Ext.form.Action.CONNECT_FAILURE:
                            Ext.Msg.alert("แจ้งเตือน", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                            break;
                          case Ext.form.Action.SERVER_INVALID:
                            Ext.Msg.alert("แจ้งเตือน", action.result.msg);
                        }
                      },
                    });
                  }; //END
                  var form = Ext.getCmp("frm-panel-periodID").getForm();
                  formSubmit(form);
                },
              },
              {
                text: "ยกเลิก",
                handler: function () {
                  Ext.getCmp("frm-periodID").hide();
                  Ext.getCmp("frm-panel-periodID").getForm().reset();
                },
              },
            ],
            ///==========================

            ///==========================
          },
        ],
      },
      new Ext.grid.GridPanel({
        id: "grid-periodID",
        title: "งวด PO ย่อย",
        region: "center",
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        height: 800,
        store: Ext.store3,
        tbar: [
          {
            xtype: "button",
            iconCls: "icon-add",
            text: "เพิ่ม งวด PO ย่อย",
            handler: function () {
              Ext.getCmp("frm-panel-periodID").getForm().reset();
              Ext.getCmp("hdr_periodID").setValue(null);
              Ext.getCmp("frm-periodID").show();
              Ext.getCmp("copy_periodID").show();
              console.log(Ext.selectRow);
              Ext.getCmp("dc_cost2_idID").setValue(Ext.selectRow.get("dc_cost2_id"));
              Ext.getCmp("dc_cost2_idID").setValue(Ext.selectSubRow.po_expense_id);
            },
          },
          buMonthly(rec, event),
          {
            xtype: "button",
            iconCls: "icon-back",
            text: "ย้อนกลับไปสัญญาย่อย",
            handler: function () {
              Ext.getCmp("win-frm-dtlID").destroy();
            },
          },
           // ✅ เพิ่มตรงนี้
          {
           xtype: "button",
        iconCls: "icon-find",
        text: "แสดงรายการที่ถูกลบ",
        enableToggle: true,
        toggleHandler: function (btn, pressed) {  // ✅ เปลี่ยนจาก handler เป็น toggleHandler
            Ext.store3.load({
                params: {
                    mode: "LISTHDRPERIOD",
                    sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
                    i_enabled: pressed ? 2 : 1
                }
            });
        },
    },
        ],
        listeners: {
          beforerender: function () {
            this.thisCick = function (grid, rowIndex, columnIndex, e) {
              var record = grid.getStore().getAt(rowIndex);
              if (record.get("no") > 9996) return "";
              if (columnIndex === grid.getColumnModel().getIndexById("i_peridDetail")) {
                win_dtl_period(record, "ADD");
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridEditShow")) {
                Ext.getCmp("buSaveSub2ID").hide();
                Ext.getCmp("frm-periodID").show();
                Ext.getCmp("copy_periodID").show();
                record.set("sp_tor_hdr_period_id", record.get("id"));
                Ext.getCmp("frm-panel-periodID").getForm().loadRecord(record);
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridEdit")) {
                //ห้ามแก้ไข
                //                if (record.json.i_contract_status > 1) {
                //                  Ext.MessageBox.alert("แจ้งเตือน", "ผ่านรายการแล้วไม่สามารถแก้ไขรายการได้");
                //                } else {
                Ext.getCmp("frm-periodID").show();
                Ext.getCmp("copy_periodID").show();
                record.set("sp_tor_hdr_period_id", record.get("id"));
                Ext.getCmp("frm-panel-periodID").getForm().loadRecord(record);
                //                }
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridDel")) {
                console.log(record.json.i_contract_status);
                if (record.json.i_contract_status > 1) {
                  Ext.MessageBox.prompt(
                    "ยืนยันการลบ",
                    "รายการนี้ผ่านรายการแล้ว กรุณาพิมพ์ <b>ยืนยัน</b> เพื่อลบรายการ",
                    function (btn, text) {
                      if (btn === "ok") {
                        if (text === "ยืนยัน") {
                          DeletePeriodHdr(record);
                        } else {
                          Ext.MessageBox.alert("แจ้งเตือน", "คำยืนยันไม่ถูกต้อง กรุณาพิมพ์ ยืนยัน");
                        }
                      }
                    }
                  );
                } else {
                  DeletePeriodHdr(record);
                }
                 // ✅ เพิ่มตรงนี้ ต่อจาก i_peridDel
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridRestore")) {
                Ext.MessageBox.prompt(
                  "ยืนยันการดึงกลับ",
                  "กรุณาพิมพ์ <b>ยืนยัน</b> เพื่อดึงรายการกลับมา",
                  function (btn, text) {
                    if (btn === "ok") {
                      if (text === "ยืนยัน") {
                        Ext.Ajax.request({
                          url: "tor/api/mnTorController.php",
                          params: {
                            mode: "RESTORE_SP_TOR_HDR_PERIOD",
                            id: record.get("id")
                          },
                         success: function (res) {
                            var result = Ext.decode(res.responseText);
                            if (result.success === "Success") {
                              Ext.MessageBox.alert("สำเร็จ", "ดึงรายการกลับเรียบร้อยแล้ว", function() {
                                Ext.store3.load({
                                  params: {
                                    mode: "LISTHDRPERIOD",
                                    sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
                                    i_enabled: 1
                                  }
                                });
                              });
                            }
                          }
                        });
                      } else {
                        Ext.MessageBox.alert("แจ้งเตือน", "คำยืนยันไม่ถูกต้อง");
                      }
                    }
                  }
                );
              }
            };
          },
          afterrender: function () {
            this.on("cellclick", this.thisCick, this);
            Ext.store3.load({
              params: {
                mode: "LISTHDRPERIOD",
                sp_tor_contract_id: rec.get("sp_tor_contract_pro_id"),
              },
              callback: function (records, operation, success) {
                Ext.Store3load = records;
              },
            });
          },
        },
        columns: [
          new Ext.grid.RowNumberer({
            width: 50,
            header: " No ",
            dataIndex: "no",
          }),
          { header: "ID System", hidden: true, dataIndex: "id" },
          {
            header: "รายละเอียด",
            align: "left",
            dataIndex: "id",
            width: 200,
            id: "i_peridDetail",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              return "<button style='font-size:10px;'>รายละเอียดของในงวด </button>";
            },
          },
          {
            header: "งวดที่/สัญญา",
            align: "center",
            dataIndex: "i_period",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              if (Ext.I_IS_PO == 1) return "สัญญา " + record.get("c_contract_code");
              else return "งวด " + value;
            },
          },
          {
            header: "สถานะแจ้งเตือน",
            align: "center",
            dataIndex: "i_is_last",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (value == 1) return "งวดสุดท้าย";
              else return "";
            },
          },
          {
            header: "วันที่ส่งมอบ",
            dataIndex: "d_period_date",
            align: "center",
          },
          { header: "จำนวนเงิน", dataIndex: "f_total_amt", align: "right" },
          {
            header: "สถานะ",
            dataIndex: "id",
            align: "center",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.get("no") > 9996) return "";
              if (record.get("i_is_status") == 1) {
                return '<img src="../images/icons/accept.png"); style="cursor:pointer"/>';
              } else if (record.get("i_is_status") == 2) {
                return '<img src="../images/icons/arrow_redo.png"); style="cursor:pointer"/>';
              } else {
                return '<img src="../images/icons/add.png"); style="cursor:pointer"/>';
              }
            },
          },
          {
            header: "แสดงรายการ",
            align: "center",
            // width: 30,
            // hidden: true,
            dataIndex: "i_period",
            id: "i_peridEditShow",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              else if (record.get("i_status") == 2) {
                return "";
              } else {
                return '<img src="../images/icons/page_green.png"); style="cursor:pointer"/>';
              }
            },
          },
          {
            header: "แก้ไข",
            align: "center",
            dataIndex: "i_periodid",
            id: "i_peridEdit",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              if (record.get("i_status") == 2) {
                return "";
              } else {
                return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
              }
            },
          },
          {
            header: "ลบ",
            align: "center",
            width: 35,
            dataIndex: "i_period",
            id: "i_peridDel",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              if (record.get("i_status") == 2) {
                return "";
              } else {
                return '<img src="../images/icons/table_delete.png" style="cursor:pointer"/>';
              }
            },
          },

          // ✅ เพิ่ม column ใหม่แยกออกมา
          {
            header: "คืนค่า",
            align: "center",
            width: 60,
            dataIndex: "i_enabled",
            id: "i_peridRestore",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") > 9996) return "";
              if (record.get("i_enabled") == 2) {
                return '<img src="../images/icons/arrow_undo.png" style="cursor:pointer" title="ดึงรายการกลับ"/>';
              } else {
                return "";
              }
            },
          },

          { width: 40, dataIndex: "" },
        ],
      }),
    ],
  });
  Ext.storeUnitType.load({
    callback: function (recordx, operation, success) {
      if (success) {
        var win = new Ext.Window({
          id: "win-frm-dtlID",
          collapsible: true,
          maximizable: true,
          title: "รายละเอียดของงวด PO ย่อย",
          width: Ext.getCmp("contenterCenter").getWidth() - 5,
          height: Ext.getCmp("contenterCenter").getHeight() - 5,
          layout: "fit",
          modal: true,
          plain: true,
          items: tabs,
          listeners: {
            afterrender: function () {
              Ext.getCmp("frm-periodID").hide();
            },
          },
        });
        var rec = Ext.selectRow_PeridHdr;
        if (Ext.selectRow_PeridHdr != null) {
          Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
        }
        win.show();
      }
    },
  });
}
function win_dtl_period(rec, event) {
  var record = rec;
  Ext.am_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "am_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.inv_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "inv_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
//alert(" "+Ext.selectSubPo_expense_id);  
  var tabs = new Ext.FormPanel({
    labelWidth: 175,
    bodyStyle: "padding:1px",
    id: "frm-panel-proID",
    url: "tor/api/mnTorController.php",
    border: false,
    frame: true,
    items: [
      {
        xtype: "tabpanel",
        activeTab: 0,
        defaults: {
          autoHeight: true,
          bodyStyle: "padding:10px",
        },
        id: "frm-proID",
        items: [
          {
            title: "รายละเอียดของที่จัดซื้อในงวด ค่าใช้จ่าย "+(Ext.selectSubPo_expense_id),
            id: "form-dtl-pro",
            layout: "form",
            defaults: { width: 430 },
            defaultType: "textfield",
            items: [
              {
                xtype: "hidden",
                id: "sp_tor_hdr_period_idID",
                value: rec.get("id"),
                name: "sp_tor_hdr_period_id",
              },
              {
                xtype: "hidden",
                id: "sp_tor_dtl_period_idID",
                value: rec.get("sp_tor_dtl_period_id"),
                name: "sp_tor_dtl_period_id",
              },
                {
                    xtype: "checkbox",
                    id: "i_is_item",
                    boxLabel: "<b style='color: blue; font-size: 12px;'>ได้ของ</b>",
                    // hidden: Ext.INSIDE_COST == 1 ? false : true,
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {
                        if (newValue) {
                        }
                      },
                    },
                  },
              new Ext.form.ComboBox({
                mode: "local",
                store: Ext.dc_expense_budget_type,
                fieldLabel: "แหล่งเงิน",
                anchor: "60%",
                submitValue: true,
                id: "period_dc_expense_budget_type_id",
                name: "dc_bg_budget_type_id",
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                value: record.get("dc_expense_budget_type_id"),
                typeAhead: false,
                emptyText: "กรุณาเลือกแหล่งเงิน...",
                listeners: {
                  afterrender: function () {
                    //                                        console.log(Ext.selectRow);
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
              }), //
              new Ext.form.ComboBox({
                mode: "local",
                store: Ext.po_expense,
                valueField: "id",
                displayField: "c_name",
                anchor: "70%",
                submitValue: true,
                id: "period_po_expense_id",
                name: "po_expense_id",
                value:Ext.selectSubPo_expense_id,// Ext.selectRow.get("po_expense_id"),
                triggerAction: "all",
                allBlank: true,
                forceSelection: true,
                selectOnFocus: true,
                fieldLabel: "รายการย่อย  ***",
                width: 200,
                typeAhead: false,
                emptyText: "กรุณาเลือกใช้จ่าย...",
                listeners: {
                  afterrender: function () {
                    this.setValue(Ext.selectSubPo_expense_id);
//                    alert(this.getValue());
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
                xtype: "radiogroup",
                columns: [98, 110],
                fieldLabel: "ลักษณะการจ้าง",
                id: "period_i_hire_type",
                name: "i_hire_type",
                items: [
                  {
                    checked: true,
                    inputValue: 1,
                    name: "i_hire_type_l",
                    boxLabel: "จ้างแบบได้ของ",
                  },
                  {
                    inputValue: 0,
                    name: "i_hire_type_l",
                    boxLabel: "จ้างแบบไม่มีของ",
                  },
                ], //radiogroup
                listeners: {
                  change: function () {
                    if (this.getValue().inputValue == 0) {
                      Ext.getCmp("period_i_product_type2").hide();
                      //                                            Ext.getCmp("period_i_is_invG2").hide();
                      //                                       Ext.getCmp('inv_mode_idID').hide();
                      //                                    Ext.getCmp('am_mode_idID').hide();
                    } else {
                      Ext.getCmp("period_i_product_type2").show();
                      //                                            Ext.getCmp("period_i_is_invG2").show();
                      //      Ext.getCmp('inv_mode_idID').show();
                      //       Ext.getCmp('am_mode_idID').show();
                    }
                  },
                  afterrender: function () {
                    if (Ext.selectRow.get("i_purchase") == 1) this.hide();
                    else this.show();
                  },
                },
              },
              {
                xtype: "radiogroup",
                columns: [98, 98],
                fieldLabel: "ของที่ได้มา",
                id: "period_i_product_type2",
                name: "i_product_type",
                items: [
                  {
                    checked: true,
                    name: "i_product_type_l",
                    inputValue: 1,
                    boxLabel: "วัสดุ",
                  },
                  {
                    inputValue: 2,
                    name: "i_product_type_l",
                    boxLabel: "ครุภันฑ์",
                  },
                ], //radiogroup
                listeners: {
                  /* change: function () {
                                     if (Ext.getCmp('period_i_product_type2').getValue().inputValue == 1) { //วัสดุ
                                     Ext.getCmp('inv_mode_idID').show();
                                     Ext.getCmp('am_mode_idID').hide();
                                     
                                     } else {
                                     Ext.getCmp('am_mode_idID').show();
                                     Ext.getCmp('inv_mode_idID').hide();
                                     }
                                     },*/
                  afterrender: function () {
                    if (Ext.getCmp("period_i_hire_type").getValue().inputValue == 0) {
                      Ext.getCmp("period_i_product_type2").hide();
                      //                                            Ext.getCmp("period_i_is_invG2").hide();
                    } else {
                      Ext.getCmp("period_i_product_type2").show();
                      //                                            Ext.getCmp("period_i_is_invG2").show();
                    }
                  },
                },
              },
              {
                fieldLabel: "ชื่อรายการ",
                id: "period_c_name",
                name: "c_name",
                allowBlank: false,
              },
              {
                fieldLabel: "จำนวน",
                xtype: "numberfield",
                id: "period_i_qty",
                name: "i_qty",
                value: 1,
              },
              {
                fieldLabel: "ราคา/ต่อหน่วย ",
                id: "period_f_net_unit_price",
                name: "f_net_unit_price",
                listeners: {
                  blur: function () {
                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                    this.setValue(Ext.floatRenderer(f_total));
                    if (this.getValue() == "" || this.getValue() == 0) {
                      this.setValue("0.00");
                    }
                  },
                  afterrender: function () {
                    if (this.getValue() == "" || this.getValue() == 0) {
                      this.setValue("0.00");
                    }
                  },
                },
                style: {
                  labelAlign: "right",
                  "font-weight": "bold",
                  padding: "1px",
                  margin: "1px",
                  color: "blue",
                  "background-color": "#fff",
                  "text-align": "right",
                },
              },
              new Ext.form.ComboBox({
                mode: "local",
                fieldLabel: "หน่วยนับ",
                submitValue: true,
                // hiddenName: "dc_unit_type_id",
                id: "period_dc_unit_type_id",
                name: "dc_unit_type_id",
                store: Ext.storeUnitType,
                valueField: "id",
                displayField: "c_name",
                //value: Ext.bgYear,
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือกหน่วยนับ...",
                listeners: {
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
            buttonAlign: "left",
            buttons: [
              {
                text: "บันทึกรายการ",
                iconCls: "icon-save",
                id: "buSave_i_pro_ID",
                // id : " "
                //                            text: "Save",
                handler: function () {
                  savePerid();
                },
              },
              {
                text: "ยกเลิก",
                handler: function () {
                  Ext.getCmp("frm-proID").hide();
                },
              },
            ],
          },
        ],
      },
      new Ext.grid.GridPanel({
        id: "grid-productID",
        title: "รายละเอียดซื้อจ้าง",
        region: "center",
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        height: 800,
        viewConfig: {
          forceFit: true,
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record) {},
        },
        store: Ext.storePro,
        tbar: [
          {
            xtype: "button",
            iconCls: "icon-add",
            text: "เพิ่มรายละเอียดซื้อจ้าง",
            handler: function () {
              Ext.getCmp("frm-panel-proID").getForm().reset();
              Ext.getCmp("frm-proID").show();
              
            },
          },
          {
            xtype: "button",
            iconCls: "icon-back",
            text: "ย้อนกลับไปงวด",
            handler: function () {
              Ext.getCmp("win-frm-perid-bal-dtl2ID").destroy();
            },
          },
        ],
        listeners: {
          beforerender: function () {
            this.thisCick = function (grid, rowIndex, columnIndex, e) {
              var record = grid.getStore().getAt(rowIndex);
              if (columnIndex === grid.getColumnModel().getIndexById("i_proDetail")) {
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_proShow")) {
                // win_project(record, "SHOW");
                Ext.getCmp("frm-panel-proID").getForm().reset();
                Ext.getCmp("frm-proID").show();
                Ext.getCmp("frm-panel-proID").getForm().loadRecord(record);
                Ext.getCmp("buSave_i_pro_ID").hide();
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_proEdit")) {
                console.log(record.data.i_contract_status);
                if (record.data.i_contract_status > 1) {
                  Ext.MessageBox.alert("แจ้งเตือน", "ผ่านรายการแล้วไม่สามารถแก้ไขรายการได้");
                } else {
                  Ext.getCmp("frm-panel-proID").getForm().reset();
                  Ext.getCmp("frm-proID").show();
                  Ext.getCmp("frm-panel-proID").getForm().loadRecord(record);
                }
              } else if (columnIndex === grid.getColumnModel().getIndexById("i_proDel")) {
                if (record.data.i_contract_status > 1) {
                  Ext.MessageBox.alert("แจ้งเตือน", "ผ่านรายการแล้วไม่สามารถลบรายการได้");
                } else {
                  DeleteProHdr(record);
                }
              }
            };
          },
          afterrender: function () { 
            record.set('period_po_expense_id',Ext.selectSubPo_expense_id);
            this.on("cellclick", this.thisCick, this);
            Ext.storePro.load({
              params: {
                mode: "LISTDTLPERIODUSED",
                sp_tor_hdr_period_id: record.get("id"),
              },
              callback: function (records, operation, success) {},
            });
          },
        },
        columns: [
          new Ext.grid.RowNumberer({
            width: 35,
            header: " No ",
            dataIndex: "no",
          }),
          { header: "ID System", hidden: true, dataIndex: "id" },
          {
            header: "รายละเอียด จัดซื้อ",
            dataIndex: "c_name",  width: 230,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value.substring(0, 3) == "รวม") {
                metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
              } else {
                 metaData.attr ='';
              }
                  if (value) {
      // ใส่ ext:qtip เพื่อให้ ExtJS ดึงไปทำ Tooltip ตอนเอาเมาส์มาวาง
      metaData.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(value) + '"';
    }
              return value; //DategetShortDateMonthName(value);
            },
        },
          {
            header: "ค่าใช้จ่าย/โครงการ",
            align: "left",
            width: 230,
            dataIndex: "c_expense",
            // เพิ่ม renderer ตรงนี้เพื่อแสดง Tooltip เวลา Mouseover
  renderer: function (value, metaData, record, rowIndex, colIndex, store) {
    if (value) {
      // ใส่ ext:qtip เพื่อให้ ExtJS ดึงไปทำ Tooltip ตอนเอาเมาส์มาวาง
      metaData.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(value) + '"';
    }
    return value;
  }
          },
          {
              
            header: "หน่วย",
            align: "left",
            dataIndex: "dc_unit_name",
          },
          { header: "จำนวน", dataIndex: "i_qty", align: "right" },
          {
            header: "ราคา/หน่วย",
            dataIndex: "f_net_unit_price",
            align: "right",
          },
          {
            header: "รวม",
            dataIndex: "f_net_total_price",
            align: "right",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "แสดงรายการ",
            align: "center",
            // width: 30,
            // hidden: true,
            dataIndex: "i_period",
            id: "i_proShow",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.get("no") === 9999) return "";
              else if (record.get("i_status") == 2) {
                return "";
              } else {
                return '<img src="../images/icons/page_green.png"); style="cursor:pointer"/>';
              }
            },
          },
          {
            id: "i_proEdit",
            header: "แก้ไข",
            sortable: false,
            // hidden: true,
            align: "center",
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              if (record.data.sp_tor_dtl_id < 1) {
                return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
              } else {
                return "-";
                // return '<img src="../images/icons/cross.png"); style="cursor:pointer"/>';
              }
            },
          },
          {
            id: "i_proDel",
            header: "ลบ",
            // hidden: true,
            sortable: false,
            align: "center",
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
            },
          },
          { width: 1, dataIndex: "" },
        ],
      }),
    ],
  });
  var win = new Ext.Window({
    collapsible: true,
    maximizable: true,
    id: "win-frm-perid-bal-dtl2ID",
    layout: "fit",
    width: Ext.getCmp("contenterCenter").getWidth() - 5,
    height: Ext.getCmp("contenterCenter").getHeight() - 5,
    title: "รายการของ",
    plain: true,
    modal: true,
    items: tabs,
    listeners: {
      afterrender: function () {
        Ext.getCmp("frm-proID").hide();
        Ext.getCmp("win-frm-perid-bal-dtl2ID").setTitle("รายละเอียดซื้อจ้าง งวด " + record.get("i_period")+' => '+Ext.selectSubPo_expense_id);
      },
    },
  });
  var rec = Ext.selectRow_PeridDtl;
  if (Ext.selectRow_PeridDtl != null) {
    //        Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(rec);
    Ext.am_mode_acc.reload({
      callback: function (record, operation, success) {
        if (success) {
          Ext.am_mode_acc.reload({
            callback: function (record, operation, success) {
              if (success) {
                Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(rec);
              }
            },
          });
        }
      },
    });
  } else {
    //        Ext.selectRow.set('c_name', null);
//    Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(Ext.selectRow);
  }
  win.show();

  /*if (Ext.getCmp('period_i_product_type2').getValue().inputValue == 1) { //วัสดุ
     Ext.getCmp('inv_mode_idID').show();
     Ext.getCmp('am_mode_idID').hide();
     
     } else {
     Ext.getCmp('am_mode_idID').show();
     Ext.getCmp('inv_mode_idID').hide();
     }*/

  // }
  // },
  // });
}
/*formAdd*/
formAdd = function (event, record) {
  formAdd.superclass.constructor.call(this, {
    listeners: {
      afterrender: function (obj, eOpts) {
        Ext.getCmp("mode-projectID").setValue(event);

        switch (event) {
          case "ADD":
            Ext.getCmp("buSaveContractID").setText("เพิ่มรายการ");
            break;
          case "EDIT":
            Ext.getCmp("buSaveContractID").setText("แก้ไขรายการ");
            break;
          case "SHOW":
            // Ext.getCmp("buSaveContractID").setText("แก้ไขรายการ");
            Ext.getCmp("buSaveContractID").hide();
            break;
          case "DEL":
            Ext.getCmp("buSaveContractID").setText("ลบรายการ");
            break;
          case "DETAIL":
            Ext.getCmp("buSaveContractID").hide();
            break;
        }
      },
    },
    id: "frm-contract-project",
    labelWidth: 255,
    url: "tor/api/mnContractProject.php",
    bodyStyle: "padding-left:5px",
    frame: true,
    autoScroll: true,
    loadMask: true,
    title: "PR ย่อยโครงการต่อเนื่องเทียบเท่า ID "+Ext.selectRow.get("sp_tor_id")+" "+(Ext.selectRow && Ext.selectRow.data?Ext.selectRow.get('po_expense_id'):""),
    listenners:{
        afterrender:function(){
            console.log(Ext.selectRow);
        },
    },
        items: [
      {
        xtype: "hidden",
        name: "mode",
        id: "mode-projectID",
        value: "CONTRACT_PROJECT",
      },
      {
        xtype: "hidden",
        name: "sp_tor_id",
        value: Ext.selectRow.get("sp_tor_id"),
      },
      {
        xtype: "hidden",
        name: "sp_tor_contract_id",
        value: Ext.selectRow.get("sp_tor_contract_id"),
      },
      {
        xtype: "hidden",
        name: "sp_tor_pro_id",
      },
      {
        xtype: "hidden",
        name: "sp_tor_contract_pro_id",
      },
      {
        fieldLabel: "สัญญาโครงการต่อเนื่อง",
        xtype: "displayfield",
        value: Ext.selectRow.get("c_code"),
      },
      {
        fieldLabel: "ปีสัญญาหลัก",
        xtype: "displayfield",
        name: "display_year",
        value: parseInt(Ext.selectRow.get("i_year")) + 543,
      },
      {
        fieldLabel: "จำนวนเงิน",
        xtype: "displayfield",
        name: "display_c_code",
        value: Ext.selectRow.get("f_total_amt"),
      },
        new Ext.form.ComboBox({
        mode: "local",
        fieldLabel: "ใช้ปีงบประมาณ",
        submitValue: true,
        hiddenName: "i_yyyy_overlap",
        name: "c_yyyy_overlap",
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
      new Ext.form.ComboBox({
        mode: "local",
        fieldLabel: "งบประมาณ",
        submitValue: true,
        hiddenName: "i_yyyy",
        name: "i_year",
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
    xtype: 'displayfield',
    id: 'display_detail_info',
    fieldLabel: 'ข้อมูลที่ต้องดูจากรหัสงบประมาณ',
    name: 'c_expense_name',
    value: '-****** ค่าใช้จ่ายถ้าเปลี่ยนปีปัจจุบัน กรุณาตรวจสอบ จำนวนเงิน และ ชื่ออาจซ้ำ', 
    style: 'color: red; font-weight: bold; padding-left: 5px;', // เพิ่ม padding เล็กน้อยให้สวยงาม
     listeners: {
         afterrender:function(){
//             console.log(Ext.getCmp('po_expense_hdr_idID').getValue()); 
         }
     }
} , {
    xtype: "buttongroup",
    fieldLabel: "หมวดค่าใช้จ่าย **จะเปลี่ยนทุกปี",
    items: [
        new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_expense_expire,
            valueField: "id",
            displayField: "c_name",
            id: "po_expense_hdr_idID",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            forceSelection: true,
            width: 750,
            emptyText: "กรุณาเลือกใช้จ่าย...",
 
                    selectOnFocus: true,
                    typeAhead: false, 
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {};
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
    
//            listeners: {
//                beforequery: function (q) {
//                                if (q.query) {
//                                  var length = q.query.length;
//                                  q.query = new RegExp(Ext.escapeRe(q.query));
//                                  q.query.length = length;
//                                }
//                              },
//                // กรณีผู้ใช้คลิกเลือกจาก Dropdown
//                select: function(combo, record) {
//                    var detail = record.get('c_name'); // ดึงฟิลด์ที่ต้องการ 
//                    Ext.getCmp('display_detail_info').setValue('<span style="color:red">กรุณาตรวจสอบรหัสเล่มงบประมาณ ** </span>  '+detail);
//                    combo.setTooltip(record.get("c_name")); // กำหนด Tooltip เป็นข้อความเต็ม 
//                },
//                // กรณีมีการสั่ง setValue จาก Code หรือตอน Load Data
//                change: function(combo, newValue, oldValue) {
//                    var record = combo.getStore().getById(newValue);
//                    if (record) {
//                        Ext.getCmp('display_detail_info').setValue('<span style="color:red">กรุณาตรวจสอบรหัสเล่มงบประมาณ ** </span>  '+record.get('c_name'));
//                    }
//                },
//                blur: function() {
//                    this.getStore().clearFilter();
//                },
//                afterrender:function(combo, record) { 
//                    Ext.getCmp('display_detail_info').setValue('<span style="color:red">กรุณาตรวจสอบรหัสเล่มงบประมาณ **</span> '+Ext.selectRow.get("c_expense_name"));
//                }
//              
//            }
        }),
    ]
}
 /*     {
        xtype: "buttongroup",
        fieldLabel: "หมวดค่าใช้จ่าย ****",
        frame: false,
        border: false,
        items: [
          new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_expense_expire,
            valueField: "id",
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "c_detail",
            id: "po_expense_hdr_idID",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 750,
            value: Ext.selectRow.get("po_expense_id"),
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
            listeners: {
              afterrender: function () {
                this.fn = function () {
                  // Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
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
                console.log(this);
              },
            },
          }),
        ],
      },
      {
        xtype:'displayfield',   
      },*/
     , {
        xtype: "buttongroup",
        fieldLabel: "แหล่งเงิน",
        frame: false,
        border: false,
        items: [
          new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_expense_budget_type2,
            fieldLabel: "แหล่งเงินที่",
            width: 500,
            submitValue: true,
            id: "dc_expense_budget_type_id1TxtID",
            name: "dc_bg_budget_type_id",
            hiddenName: "dc_expense_budget_type_id",
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            value: Ext.selectRow.get("dc_expense_budget_type_id"),
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                //***************************************************************************************แผนหรืองวด*******************************************************************

                if (this.getValue() == 4 || this.getValue() == 5) {
                  Ext.getCmp("i_pr_type2ID").setValue(2);
                } else {
                  Ext.getCmp("i_pr_type2ID").setValue(1);
                }
                //*********************************************************************************************************************************************************************
              },
            },
          }),
        ],
      }, 
      {
        xtype: "datefield",
        fieldLabel: "วันที่เริ่มสัญญา",
        id: "d_doc_dateID",
        name: "d_doc_date",
        readOnly: true,
        value: Ext.selectRow.get("d_doc_date"),
        width: 100,
        validator: function (val) {
          if (Ext.isEmpty(val)) {
            return "กรุณากรอก วันที่ออกเอกสาร ";
          } else {
            return true;
          }
        },
      },
      {
        xtype: "datefield",
        fieldLabel: "วันที่สิ้นสุดสัญญา",
        id: "d_due_dateID",
        name: "d_due_date",
        readOnly: true,
        value: Ext.selectRow.get("d_due_date"),
        width: 100,
        validator: function (val) {
          if (Ext.isEmpty(val)) {
            return "กรุณากรอก วันที่กำหนดส่งในงวดงาน  ";
          } else {
            return true;
          }
        },
      },
      new Ext.form.ComboBox({
        fieldLabel: "ประเภทสัญญาของที่จะได้ ในงวดสุดท้าย",
        id: "i_working_type",
        mode: "local",
        allowBlank: false,
        store: new Ext.data.SimpleStore({
          fields: ["id", "c_name"],
          data: [
            ["0", "1 : จ้างไม่ได้ของ"],
            ["1", "2 : วัสดุ"],
            ["2", "3 : ครุภัณฑ์"],
            ["3", "4 : เช่า"],
            ["4", "5 : จ้างออกแบบ"],
            ["5", "6 : ที่ดิน"],
            ["6", "7 : ปรับปรุงอาคาร - ได้ของ"],
            ["7", "8 : ปรับปรุงอาคาร - ไม่ได้ของ"],
            ["8", "9 : สิ่งก่อสร้าง"],
          ],
        }),
        valueField: "id",
        hiddenName: "i_working_type_ID",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...",
        width: 170,
        listeners: {
          afterrender: function () {
            this.ReadOnly_set = function (set) {
              this.setReadOnly(set);
              // this.getEl().dom.style.background = set ? "#EEEEEE" : "";
            };
            this.fn = function () {};
            this.change_set = function () {};
          },
          change: function (combo, newValue) {
            this.change_set();
            if (newValue == "") {
              combo.reset();
            }
          },
          select: function () {
            this.change_set();
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
        columns: [98, 98],
        fieldLabel: "ใช้เงินจาก",
        id: "i_booking_bgID",
        name: "i_booking_bg",
        items: [
          {
            checked: true,
            name: "i_booking_bg",
            inputValue: 1,
            boxLabel: "เงินประจำปี",
          },
          {
            inputValue: 2,
            name: "i_booking_bg",
            boxLabel: "เงินกันเหลื่อม",
          },
        ],
        listeners: {
          change: function () {
            Ext.getCmp("i_pr_type2ID").fn();
          },
        },
      },
      {
        fieldLabel: "วงเงิน",
        xtype: "textfield",
        width: 150,
        name: "f_total_amt",
        listeners: {
          blur: function () {
            var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
            this.setValue(Ext.floatRenderer(f_total));
          },
        },
        style: {
          labelAlign: "right",
          "font-weight": "bold",
          padding: "1px",
          margin: "1px",
          color: "blue",
          "background-color": "#fff",
          "text-align": "right",
        },
      },
      {
        xtype: "radiogroup",
        columns: [98, 98],
        fieldLabel: "",
        id: "i_pr_type2ID",
        name: "i_pr_type1",
        items: [
          {
            checked: true,
            name: "i_pr_type1",
            inputValue: 1,
            boxLabel: "จองแบบแผน",
          },
          {
            inputValue: 2,
            name: "i_pr_type1",
            boxLabel: "จองแบบงวด",
          },
        ],
        listeners: {
          afterrender: function () {
            this.fn = function () {
              var booking = Ext.getCmp("i_booking_bgID").getValue().inputValue;
              if (booking === 2) {
                Ext.getCmp("i_pr_type2ID").hide();
              } else {
                Ext.getCmp("i_pr_type2ID").show();
              }
              //                                        alert(Ext.getCmp('i_booking_bgID').getValue().inputValue);
            };
            this.fn();
          },
        }, //radiogroup
      },
      {
        fieldLabel: "หมายเหตุ",
        name: "c_discription",
        xtype: "textarea",
        height: 40,
        width: 430,
      },
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "บันทึกรายการ",
        id: "buSaveContractID",
        iconCls: "icon-save",
        listeners: {
          afterrender: function () {},
        },
        handler: function () {
          var form = Ext.getCmp("frm-contract-project").getForm();
          if (form.isValid()) {
            form.submit({
              waitMsg: "Saving Data...",
              success: function (form, action) {
                Ext.Msg.alert("Success", action.result.msg, function () {
                  Ext.storeProject.reload();
                  Ext.getCmp("windows-contract").destroy();
                });
              },
              failure: function (form, action) {
                switch (action.failureType) {
                  case Ext.form.Action.CLIENT_INVALID:
                    Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                    break;
                  case Ext.form.Action.CONNECT_FAILURE:
                    Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                    break;
                  case Ext.form.Action.SERVER_INVALID:
                    Ext.Msg.alert("Failure", action.result.msg);
                }
              },
            });
          }
        },
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function () {
          Ext.getCmp("windows-contract").destroy();
        },
      },
    ],
  });
};
Ext.extend(formAdd, Ext.FormPanel, {});
/*Ext.extend(formAdd*/
function win_project(rec, event) {
  var frm = new formAdd(event);
  new Ext.Window({
    collapsible: true,
    maximizable: true,
    title: "",
    id: "windows-contract",
    width: Ext.getCmp("contenterCenter").getWidth() - 7,
    height: Ext.getCmp("contenterCenter").getHeight() - 7,
    layout: "fit",
    modal: true,
    plain: true,
    items: frm,
    listeners: {
      afterrender: function () {
        Ext.getCmp("frm-contract-project")
          .getForm()
          .loadRecord(rec || {});
      },
    },
  }).show();
}
function i_alertID_Change() {
  if (Ext.getCmp("i_alertID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_period_dateID").getValue() == "") {
      var Txt = Ext.getCmp("i_day_useID").getValue().inputValue == 0 ? "จำนวนวันที่กำหนดส่งในงวดงาน" : "วันที่กำหนดส่งในงวดงาน";
      Text_alert = "<font color='red'>* กรุณากรอก : " + Txt + "</font>";
    }
    if (Ext.getCmp("i_alertID").getValue() < 0) {
      Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
    }

    if (Text_alert == "") {
      var day = Ext.getCmp("i_alertID").getValue();
      var oneDay = 24 * 60 * 60 * 1000;
      var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var date = new Date(secondDate.getTime() - oneDay * day);

      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      var Txt2 = "";
      if (date.getTime() == addY(0).getTime()) {
        Txt2 = "<font color='red'> *(วันแจ้งเตือนเท่ากับวันปัจุบัน)</font>";
      }
      if (date.getTime() < addY(0).getTime()) {
        Txt2 = "<font color='red'> *(วันแจ้งเตือนน้อยกว่าวันปัจุบัน)</font>";
      }
      Ext.getCmp("txt_i_alertID").setValue("<font color='green'>แจ้งเตือน ณ " + FullDay + "</font> " + Txt2);
    } else {
      Ext.getCmp("txt_i_alertID").setValue(Text_alert);
      Ext.getCmp("i_alertID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_i_alertID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
  }
}
function i_dayID_Change() {
  if (Ext.getCmp("i_dayID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_doc_dateID").getValue() == "") {
      Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
    }
    if (Ext.getCmp("i_dayID").getValue() < 0) {
      Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
    }

    if (Text_alert == "") {
      var day = Ext.getCmp("i_dayID").getValue();
      var oneDay = 24 * 60 * 60 * 1000;
      var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_dateID").getValue(), "Y/m/d"));
      var date = new Date(firstDate.getTime() + oneDay * day);
      Ext.getCmp("d_period_dateID").setValue(new Date(firstDate.getTime() + oneDay * day));
      Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + day + " วัน</font>");

      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");

      if (Ext.getCmp("i_alertID").getValue() != "") {
        i_alertID_Change();
      }
    } else {
      Ext.getCmp("txt_i_dayID").setValue(Text_alert);
      Ext.getCmp("d_period_dateID").setValue("");
      Ext.getCmp("i_dayID").setValue(null);
      Ext.getCmp("i_alertID").setValue(null);
      Ext.getCmp("txt_i_alertID").setValue(null);
      Ext.getCmp("txt_d_period_dateID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_i_dayID").setValue(null);
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("i_dayID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
    Ext.getCmp("txt_i_alertID").setValue(null);
    Ext.getCmp("txt_d_period_dateID").setValue(null);
  }
}
function d_period_dateID_change() {
  if (Ext.getCmp("d_period_dateID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_doc_dateID").getValue() == "") {
      Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
    } else {
      var oneDay = 24 * 60 * 60 * 1000;
      var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_dateID").getValue(), "Y/m/d"));
      var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var days = Math.round(Math.abs((firstDate - secondDate) / oneDay));
      if (firstDate.getTime() > secondDate.getTime()) {
        Text_alert = "<font color='red'>* กรุณากรอกวันที่ให้มากกว่าวันที่ออกเอกสาร</font>";
      }
    }

    if (Text_alert == "") {
      Ext.getCmp("i_dayID").setValue(days);
      Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + days + " วัน</font>");

      var date = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");
      if (Ext.getCmp("i_alertID").getValue() != "") {
        i_alertID_Change();
      }
    } else {
      Ext.getCmp("txt_d_period_dateID").setValue(Text_alert);
      Ext.getCmp("d_period_dateID").setValue("");
      Ext.getCmp("txt_i_dayID").setValue(null);
      Ext.getCmp("i_dayID").setValue(null);
      Ext.getCmp("i_alertID").setValue(null);
      Ext.getCmp("txt_i_alertID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_d_period_dateID").setValue(null);
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("txt_i_dayID").setValue(null);
    Ext.getCmp("i_dayID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
    Ext.getCmp("txt_i_alertID").setValue(null);
  }
}
function d_doc_dateID_Change() {
  if (Ext.getCmp("d_doc_dateID").getValue() == "") {
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("txt_d_period_dateID").setValue("");
    Ext.getCmp("i_alertID").setValue("");
    Ext.getCmp("txt_i_alertID").setValue("");
    Ext.getCmp("i_dayID").setValue("");
    Ext.getCmp("txt_i_dayID").setValue("");
  } else {
    if (Ext.getCmp("d_period_dateID").getValue() != "") {
      if (Ext.getCmp("i_day_useID").getValue().inputValue == 1) {
        d_period_dateID_change();
      } else {
        i_dayID_Change();
      }
    }
  }
}
/******/

Ext.AppUx = function (app, menu) {
  //...
  Ext.status = Ext.apply({
    name: menu,
    process: function (menuCode, record) {
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
          mode: "UPSTATUS_CONTRACT",
          menuCode: menuCode,
          id: record.get("sp_tor_contract_pro_id"),
        },
        method: "POST", //GET
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            Ext.Ajax.request({
              url: "tor/api/mnTorController.php",
              method: "POST", //GET
              params: {
                mode: "UP_SP_MN_CONTRACT_HDR",
                sp_contract_po_id: record.get("sp_tor_contract_pro_id"),
                f_total_amt: record.get("f_total_amt"),
                d_doc_date: record.data.d_doc_date,
                d_start_date: record.get("d_start_date"),
                d_end_date: record.json.d_due_date,
                c_name_in: record.get("c_name"),
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                  Ext.MessageBox.alert("Success", jsonData.msg, function () {
                    Ext.storeProject.reload();
                  });
                }
              },
            });
            Ext.MessageBox.alert("Success", jsonData.msg, function () {
              Ext.storeProject.reload();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    },
  });
  Ext.chkBg = false;
  Ext.chkBg.status = false;
  Ext.chkBgfn = function (st, f, f_bg, cancle) {
    Ext.chkBg = Ext.apply({ status: st, f_amt: f, f_bg: f_bg });
    var cl = cancle || null;
    if (cl) {
      Ext.getCmp("disBgID").setValue(cl === true ? "เบิกได้ไม่ผ่าน" : "กรุณาตรวจสอบเงินตามงวด");
      Ext.getCmp("buSaveSubID").setText(cl === true ? "บันทึกรายการไม่ผ่าน" : "ตรวจสอบเงิน");
    } else {
      Ext.getCmp("disBgID").setValue(Ext.chkBg.status === true ? "เบิกได้" : "กรุณาตรวจสอบเงินตามงวด");
      Ext.getCmp("buSaveSubID").setText(Ext.chkBg.status === true ? "บันทึกรายการ" : "ตรวจสอบเงิน");
    }
  };
  Ext.user_right_add = user_right_add;
  Ext.user_right_edit = user_right_edit;
  Ext.user_right_delete = user_right_delete;
  Ext.title = Ext.menu_name + " " + Ext.menu_code;
  Ext.HDR_ID = null;
  // storeYear
  Ext.selectRow = [];
  Ext.menuEditGrid = true;
  Ext.menuRightEditgrid = true;
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

  // copy text in cell on select row no
  function CopyToClipboard(rec, arrDataCopy) {
    var input = rec;
    var textToClipboard = "";
    //text on
    var success = true;
    for (var i = 0; i < arrDataCopy.length; i++) {
      textToClipboard += ", " + input.get(arrDataCopy[i]);
    }

    if (window.clipboardData) {
      // Internet Explorer
      window.clipboardData.setData("Text", textToClipboard);
    } else {
      var forExecElement = CreateElementForExecCommand(textToClipboard);
      SelectContent(forExecElement);
      var supported = true;
      // UniversalXPConnect privilege is required for clipboard access in Firefox
      try {
        if (window.netscape && netscape.security) {
          netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        }
        success = document.execCommand("copy", false, null);
      } catch (e) {
        success = false;
      }
      document.body.removeChild(forExecElement);
    }

    if (success) {
      console.log("The text is on the clipboard, try to paste it!");
    } else {
      console.log("Your browser doesn't allow clipboard access!");
    }
  }
  function CreateElementForExecCommand(textToClipboard, arrDataCopy) {
    var forExecElement = document.createElement("div");
    forExecElement.style.position = "absolute";
    forExecElement.style.left = "-10000px";
    forExecElement.style.top = "-10000px";
    forExecElement.textContent = textToClipboard;
    document.body.appendChild(forExecElement);
    forExecElement.contentEditable = true;
    return forExecElement;
  }
  function SelectContent(element) {
    // first create a range
    var rangeToSelect = document.createRange();
    rangeToSelect.selectNodeContents(element);
    // select the contents
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeToSelect);
  }

  function upStatusController(rec, evt) {
    if (Ext.isEmpty(rec)) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action) {
        return false;
      });
    } else if (Ext.isPerioid == 0) {
      Ext.Msg.alert("แจ้งเตือน", "งวดยังไม่ได้ระบุงวดสุดท้าย", function (bu, action) {
        return false;
      });
    } else {
      if (rec.data.i_contract_status == 1) {
        Ext.Msg.show({
          title: "แจ้งเตือน!",
          msg: "ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือโดยสมบูรณ์  " + rec.data.c_code,
          width: 400,
          icon: Ext.MessageBox.info,
          // buttons: Ext.MessageBox.YESNOCANCEL,
          buttons: Ext.MessageBox.YESNO,
          fn: function (btn, text) {
            if (btn === "yes") Ext.status.process("ST0099", rec);
            else null;
          },
          //icon: Ext.MessageBox.ERROR
        });
      } else if (rec.data.i_contract_status == 2) {
        Ext.Msg.show({
          title: "แจ้งเตือน!",
          msg: "รายการนี้ผ่านรายการไปแล้ว",
          width: 185,
        });
      }
    }
  }
  function cellClick(grid, rowIndex, columnIndex, e) {
    Ext.selectRow = this.selModel.selection.record;
    Ext.isPerioid = 1;
    Ext.selectRow.get("i_last_period");
    Ext.TOR_ID = Ext.selectRow.data.sp_tor_id;
    Ext.SP_TOR_CONTRACT_ID = Ext.selectRow.data.sp_tor_contract_id;
    Ext.I_IS_PO = Ext.selectRow.data.i_is_po;
    // var record = grid.getStore().getAt(rowIndex);
    if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
      controller(Ext.selectRow); //on
    }
  }

  Ext.po_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_user",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  // copy text in cell on select row no
  Ext.po_emp = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_emp",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.bgProject = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "bg_project",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "f_project"],
  });

  Ext.po_user_permission = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_user_permission",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_cost",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });

  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_expense_budget_type2 = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense1 = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense_group = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",

    baseParams: {
      type: "po_expense_group",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/List_DeliveryStep.php",
    baseParams: {
      type: "project",
      keyData: Ext.keyData,
      tor_status_id: Ext.menu_id,
    },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      {
        name: "no",
      },
      {
        name: "id", //id sp_tor_id i_period c_doc_ref f_total_amt d_period_date
      },
      {
        name: "sp_tor_id",
      },
      {
        name: "count_period",
      },
      {
        name: "i_is_notor",
      },
      {
        name: "dc_cost_id", // dc_cost_id dc_cost_idTxt
      },
      {
        name: "dc_cost_idTxt",
      },
      {
        name: "dc_cost2_id",
      },
      {
        name: "dc_cost2_idTxt",
      },
      {
        name: "sp_tor_contract_id",
      },
      {
        name: "dtl_po_expense_id1",
      },
      {
        name: "dtl_dc_bg_budget_type_id1",
      },
      {
        name: "dtl_i_pr_type1",
      },
      {
        name: "dtl_f_type_amt1",
      },
      {
        name: "bg_reserve_i_last1",
      },
      {
        name: "dtl_po_expense_id2",
      },
      {
        name: "dtl_dc_bg_budget_type_id2",
      },
      {
        name: "dtl_i_pr_type2",
      },
      {
        name: "dtl_f_type_amt2",
      },
      {
        name: "bg_reserve_i_last2",
      },
      {
        name: "i_yyyy",
      },
      {
        name: "dc_expense_id",
      },
      {
        name: "i_last_period",
      },
      {
        name: "c_expense_budget_type_name", //แหล่งเงิน
      },
      {
        name: "c_expense_name", //c_expense_name
      },
      {
        name: "dtl_dc_expense_budget_type_id",
      },
      {
        name: "dtl_i_pr_type",
      },
      {
        name: "c_dc_expense_budget_type_id",
      },
      {
        name: "c_f_type_amt",
      },
      {
        name: "c_i_pr_type2",
      },
      {
        name: "f_dtl1_amt",
      },
      {
        name: "f_dtl2_amt",
      },
      {
        name: "c_bg_reserve_money1_id",
      },
      {
        name: "c_dc_expense_budget_type2_id",
      },
      {
        name: "c_f_type2_amt",
      },
      {
        name: "c_i_pr_type2",
      },
      {
        name: "c_bg_reserve_money2_id",
      },
      {
        name: "dc_expense_budget_type_id",
      },
      {
        name: "f_type_amt",
      },
      {
        name: "bg_reserve_money1_id",
      },
      {
        name: "dc_expense_budget_type2_id",
      },
      {
        name: "f_type2_amt",
      },
      {
        name: "bg_reserve_money2_id",
      },
      {
        name: "dc_expense_budget_type3_id",
      },
      {
        name: "f_type3_amt",
      },
      {
        name: "bg_reserve_money3_id",
      },
      {
        name: "dc_expense_budget_type4_id",
      },
      {
        name: "f_type4_amt",
      },
      {
        name: "bg_reserve_money4_id",
      },
      {
        name: "dc_expense_budget_type5_id",
      },
      {
        name: "f_type5_amt",
      },
      {
        name: "bg_reserve_money5_id",
      },
      {
        name: "i_pr_type1",
      },
      {
        name: "i_pr_type2",
      },
      {
        name: "i_pr_type3",
      },
      {
        name: "i_pr_type4",
      },
      {
        name: "i_pr_type5",
      },
      {
        name: "po_expense_id",
      },
      {
        name: "po_expense_main_id",
      },
      {
        name: "d_due_date",
        type: "datetime", //d_due_date f_total_amt
      },
      {
        name: "i_is_po", //d_due_date f_total_amt
      },
      {
        name: "c_doc_ref",
      },
      {
        name: "dc_creditor_idTxt",
      },
      {
        name: "f_total_amt",
      },
      {
        name: "d_period_date",
      },
      {
        name: "c_code",
      },
      {
        name: "bg_budget_item_project_id",
      },
      {
        name: "c_budget_dtl_project",
      },
      {
        name: "c_name",
      },
      {
        name: "c_tax_number_imp",
      },
      {
        name: "c_tor_type",
      },
      {
        name: "tor_type_id",
      },
      {
        name: "c_purchase",
      },
      {
        name: "i_purchase",
      },
      {
        name: "i_type_contract",
      },
      {
        name: "i_parent",
      },
      {
        name: "i_is_parent",
      },
      {
        name: "c_discription",
      },
      {
        name: "i_delivery",
      },
      {
        name: "i_type_fine",
      },
      {
        name: "f_fine",
      },
      {
        name: "i_year",
      },
      {
        name: "c_year",
      },
      {
        name: "dc_department_id",
      },
      {
        name: "c_department",
      },
      {
        name: "d_tor_date",
      },
      {
        name: "d_doc_ref",
      },
      {
        name: "dc_expense_budget_type_id",
      },
      {
        name: "po_expense_id",
      },
      {
        name: "dc_user_create_id",
      },
      {
        name: "dc_user_create_cost_id",
      },
      {
        name: "d_create",
      },
      {
        name: "dc_user_update_id",
      },
      {
        name: "dc_user_update_cost_id",
      },
      {
        name: "d_update",
      },
      {
        name: "c_comment",
      },
      {
        name: "c_remark",
      },
      {
        name: "dc_creditor_id",
      },
      {
        name: "po_creditor_id",
      },
      {
        name: "po_creditor_idTxt",
      },
      {
        name: "start_date",
      },
      {
        name: "end_date",
      },
      {
        name: "c_doc_date",
      },
      {
        name: "c_due_date",
      },
      {
        name: "d_doc_date",
        type: "datetime",
      },
      {
        name: "d_po_date",
      },
      {
        name: "c_po_no",
      },
      {
        name: "i_contract_status",
      },
      {
        name: "i_is_join_venture",
      },
    ],
  });

  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: years,
  });

  //Ext
  Ext.keyData = 1; //type data key in

  Ext.poFormID = "grid-form-cheque";
  Ext.getDate = Ext.apply({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDay(),
    getNowCarlen: function () {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      mm = mm < 10 ? "0" + mm : mm;
      dd = dd < 10 ? "0" + dd : dd;
      return dd + "-" + mm + "-" + yy;
    },
    defaultDate: function (typeStartDate) {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      if (typeStartDate === 1) {
        // วันที่เริ่ม -1 เดือน
        dd = "01";
        mm = "0" + mm.toString();
      } else {
        dd = "0" + dd.toString();
        mm = "0" + mm.toString();
      }
      return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
    },
  });
  //interlizing

  var AppPoStore = function (statuss) {
    var statusx = statuss;

    if (statusx == "add") {
      Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }
    var col1 = [
      new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
      { header: "ID System", hidden: true, dataIndex: "id" },
      { header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10 },
      {
        header: "วันที่ส่งมอบ",
        align: "center",
        dataIndex: "d_period_date",
        width: 25,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value == "รวม") {
            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
            return Ext.floatRenderer(value);
          } else {
            metaData.attr = "";
            if (record.get("i_is_dtl")) {
              return "";
            } else {
              return DategetShortDateMonthName(value);
            }
          }
        },
      },
      {
        header: "รายละเอียด จัดซื้อ",
        dataIndex: "c_name",
        width: 35,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value.substring(0, 3) == "รวม") {
            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
          } else {
            metaData.attr = "";
          }
          return value; //DategetShortDateMonthName(value);
        },
      },
      { header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right" },
      {
        header: "ก่อน VAT",
        dataIndex: "f_unit_cost",
        align: "right",
        width: 25,
      },
      {
        header: "รวม VAT",
        dataIndex: "f_unit_cost_vat",
        align: "right",
        width: 25,
      },
      {
        header: "บันทึกรายละเอียดในงวดงาน",
        sortable: false,
        hideable: false,
        draggable: false,
        align: "center",
        id: "edit21",
        width: 25,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
            return "";
          } else {
            if (record.get("buStatus") == true) {
              return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
            } else {
              return record.get("buStatus");
            }
          }
        },
      },
    ];
    Ext.storeUnitType = new Ext.data.JsonStore({
      autoDestroy: false,
      autoLoad: true,
      url: "api/All_PoWorkingImpHdr.php",
      baseParams: {
        type: "dc_unit_type",
      },
      root: "data",
      idProperty: "id",
      fields: ["id", "c_code", "c_name"],
    });
    //คูสัญญา
    Ext.store1 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: { mode: "LISTCREDITOR", i_read: user_right_read }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id", type: "int" },
        { name: "sp_tor_id", type: "int" },
        { name: "dc_creditor_id", type: "int" },
        { name: "f_total_amt", type: "string" },
        { name: "c_name", type: "string" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    }); //dc_creditor
    //เลขสัญญา
    Ext.store2 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: { mode: "LISTCREDITOR", i_read: user_right_read }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "creditor_name", type: "string" },
        { name: "c_name", type: "string" },
        { name: "d_doc_date", type: "string" },
        { name: "c_doc_ref", type: "string" },
        { name: "f_total_amt", type: "string" },
        { name: "i_enabled", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    });
    //งวด
    Ext.store3 = new Ext.data.JsonStore({
      storeId: "myStore3",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTPROHDRPERIOD",
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "dc_creditor_id" },
        { name: "dc_cost2_id" },
        { name: "i_yyyy" },
        { name: "dc_expense_id" },
        { name: "dc_creditor_name" },
        { name: "sp_tor_contract_id", type: "string" },
        { name: "c_contract_code", type: "string" },
        { name: "c_doc_ref_contract" },
        { name: "sp_po_id", type: "int" },
        { name: "bg_reserve_money_id" },
        { name: "i_period", type: "int" },
        { name: "f_total_amt", type: "string" },
        { name: "d_doc_date" },
        { name: "d_period_date" },
        { name: "i_is_product_last" },
        { name: "i_day" },
        { name: "i_alert" },
        { name: "dtl_period_count" },
        { name: "i_is_last" },
        { name: "i_is_item" },
        { name: "i_pr_type1" },
        { name: "dc_expense_budget_type_id" },
        { name: "bg_reserve_money_id" },
        { name: "c_discription" },
        { name: "dc_creditor_period_id" },
        { name: "dc_creditor_id2ID_Name" },
      ],
    });
    //ของ
    Ext.storeProject = new Ext.data.JsonStore({
      storeId: "myProject",
      autoLoad: true,
      url: "tor/api/List_Project.php",
      root: "data",
      baseParams: {
        mode: "LISTCONTRACTPROJECT",
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "sp_tor_pro_id" },
        { name: "po_expense_id" },
        { name: "dc_creditor_id" },
        { name: "sp_tor_contract_pro_id" },
        { name: "dc_creditor_id" },
        { name: "c_code" },
        { name: "dc_cost_idTxt" },
        { name: "dc_cost_id" },
        { name: "dc_cost2_idTxt" },
        { name: "dc_cost2_id" },
        { name: "i_overlap" },
        { name: "i_contract_status" },
        { name: "c_overlap" },
        { name: "dc_costTxt" },
        { name: "project_code" },
        { name: "c_discription" },
        { name: "i_yyyy" },
        { name: "i_yyyy_overlap" },
        { name: "dc_expense_id" },
        { name: "dc_creditor_name" },
        { name: "sp_tor_contract_id", type: "int" },
        { name: "bg_reserve_money_id" },
        { name: "f_total_amt", type: "string" },
        { name: "d_doc_date" },
        { name: "d_due_date" },
        { name: "i_day" },
        { name: "i_alert" },
        { name: "dtl_period_count" },
        { name: "i_is_last" },
        { name: "i_pr_type1" },
        { name: "dc_expense_budget_type_id" },
        { name: "po_expense_id" },
        { name: "bg_reserve_money_id" },
        { name: "c_discription" },
        { name: "i_booking_bg" },
        { name: "bg_reserve_money1_id" },
        { name: "bg_reserve_money2_id" },
        { name: "i_working_type" },
      ],
    });
    Ext.po_expense_expire = new Ext.data.JsonStore({
      autoDestroy: false,
      autoLoad: true,
      url: "api/All_PoWorkingImpHdr.php",
      baseParams: {
        type: "po_expense_expire",
      },
      root: "data",
      idProperty: "id",
      fields: ["id", "c_name"],
    });
    //ContractF
    function updateCloseBg(contract_id, ii) {
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
          mode: "UPDATE_CONTRACT_CLOSE_BG", //UPDATE_TOR_DTL_BG
          sp_tor_contract_id: contract_id, //sp_dtl_id
          ii: ii,
        },
        method: "POST", //POST
        success: function (result, request) {
          Ext.storeDtl.reload();
          Ext.getCmp("winDcExpTypeDddID").destroy();
          Ext.getCmp(Ext.poFormID).destroy();
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    }

    function updateBookingContract(id, bg_reserve_money_id, ii) {
      //                            alert(id+' > '+bg_reserve_money_id+' > '+ii);
      //                            return false;
      if (ii == 1) {
        Ext.Ajax.request({
          url: "tor/api/mnTorController.php",
          params: {
            mode: "UPDATE_CONTRACT_BG", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money1_id: bg_reserve_money_id,
            i_pr_type1: Ext.getCmp("i_pr_type1ID").getValue().inputValue,
            f_type_amt: Ext.getCmp("f_type_amtID").getValue(),
            ii: ii,
          },
          method: "POST", //POST
          success: function (result, request) {
            Ext.storeDtl.reload();
            Ext.getCmp("winDcExpTypeDddID").destroy();
            Ext.getCmp(Ext.poFormID).destroy();
          },
          failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
          },
        });
      } else {
        Ext.Ajax.request({
          url: "tor/api/mnTorController.php",
          params: {
            mode: "UPDATE_CONTRACT2_BG", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money2_id: bg_reserve_money_id,
            i_pr_type2: Ext.getCmp("i_pr_type2ID").getValue().inputValue,
            f_type2_amt: Ext.getCmp("f_type2_amtID").getValue(),
            ii: ii,
          },
          method: "POST", //POST
          success: function (result, request) {
            Ext.storeDtl.reload();
            Ext.getCmp("winDcExpTypeDddID").destroy();
            Ext.getCmp(Ext.poFormID).destroy();
          },
          failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
          },
        });
      }
      Ext.getCmp("button" + ii).disable();
    }
    //BG
    function genBookBg(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      var i_pr_type1 = 0;

      i_pr_type1 = Ext.selectRow.get("i_pr_type1");
      dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type_id");

      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/1" +
        "/pr_id/" +
        Ext.selectRow.get("sp_tor_id") +
        "/po_id/" +
        Ext.selectRow.get("sp_tor_contract_id") +
        "/chk_id/0" +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/i_pr_type/" +
        i_pr_type1 + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/" +
        (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
        "/f_amt/" +
        v;

      //     alert(Ext.selectRow.get('i_type_contract'));
      //     alert(ii);
      //     return false;

      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          //                    console.log(jsonData);
          if (jsonData.success) {
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              //update where id
              //                            alert(Ext.selectRow.get('sp_tor_contract_id')+' > '+jsonData.bg_reserve_money_id+' > '+ii);
              //                            return false;
              updateBookingContract(Ext.selectRow.get("sp_tor_contract_id"), jsonData.bg_reserve_money_id, ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }

    function genBookBgClose(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      var bg_reserve_money_id = 0;
      var run = i > 1 ? "2" : "";
      if (Ext.selectRow.get("i_purchase") === 1) {
        dc_budget_type_id = Ext.selectRow.get("dtl_dc_expense_budget_type_id");
        bg_reserve_money_id = Ext.selectRow.get("c_bg_reserve_money1_id");
      } else {
        var run = i > 1 ? "2" : "";
        dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type" + run + "_id");
        bg_reserve_money_id = Ext.selectRow.get("c_bg_reserve_money1_id");
      }

      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/PUT" +
        "/bg_reserve_money_id/" +
        bg_reserve_money_id +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/1" +
        "/f_amt/" +
        v;
      //                  alert(link);
      //            return false;
      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          //                    console.log(jsonData);

          if (jsonData.success) {
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              updateCloseBg(Ext.selectRow.get("sp_tor_contract_id"), ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }

    Ext.storePro = new Ext.data.JsonStore({
      storeId: "storePro",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      //            baseParams: {
      //                mode: "LISTDTLPERIODUSED",
      //                sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
      //            }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "sp_tor_hdr_period_id" },
        { name: "sp_tor_dtl_period_id" },
        { name: "sp_tor_dtl_id" },
        { name: "dc_bg_budget_type_id" },
        { name: "dc_cost2_id" },
        { name: "po_expense_id" },
        { name: "c_expense" },
        { name: "i_period", type: "int" },
        { name: "c_code", type: "string" },
        { name: "c_name", type: "string" },
        { name: "dc_unit_type_id" },
        { name: "i_contract_status" },
        { name: "dc_unit_name", type: "string" },
        { name: "i_qty" },
        { name: "f_net_unit_price" }, // f_net_unit_price f_net_total_price
        { name: "f_net_total_price" }, // f_net_unit_price f_net_total_price
        { name: "i_qty_amt" }, //sum
        { name: "i_hire_type" },
        { name: "i_product_type" },
        { name: "i_is_inv" },
        { name: "i_is_item" },
        { name: "f_total_amt" },
        { name: "c_comment_product", type: "string" },
        { name: "c_comment_asset", type: "string" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    });
    //----------------------------------------------------------------- -----------
    Ext.store4 = new Ext.data.JsonStore({
      storeId: "myStore4",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTCONTRACTPROJECT",
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    });
    Ext.store5 = new Ext.data.JsonStore({
      storeId: "myStore4",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTTORDTL",
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
        sp_tor_id: Ext.TOR_ID,
        dc_creditor_id: Ext.DC_CREDITOR_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "sp_tor_dtl_id" },
        { name: "sp_tor_id", type: "int" },
        { name: "c_name", type: "string" },
        { name: "c_expense", type: "string" },
        { name: "i_qty" },
        { name: "i_qty_all" },
        { name: "c_unit" },
        { name: "f_unit_price" }, // f_net_unit_price f_net_total_price
        { name: "f_total_price" }, // f_net_unit_price f_net_total_price
      ],
    });

    var disp = false ? "displayfield" : "textfield";
    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
      Ext.getCmp("winChequeID").destroy();
    }
    const transfer = function (data) {
      // console.log(Ext.rec);
      return new Ext.Window({
        id: "transfermoney",
        title: "ยืนยันการเปลี่ยนแปลงข้อมูล",
        modal: true,
        width: 800,
        // height: 250,
        items: new Ext.FormPanel({
          id: "Form-Parent",
          frame: true,
          labelAlign: "left",
          bodyStyle: "padding:1px",
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              // fieldLabel: "กรุณาตรวจสอบจำนวนเงินที่ถูกยกเลิกก่อนยืนยันการทำรายการ",
              width: 200,
              value: "ข้อมูลใบกันเหลื่อมไม่ตรงกับข้อมูลในสัญญา",
              style: "text-align: center; color:red; white-space: nowrap;",
            },
            {
              xtype: "textfield",
              fieldLabel: "แหล่งเงิน (สัญญา)",
              emptyText: "กรุณาระบุ...",
              value: Ext.rec.json.c_expense_budget_type_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "แหล่งเงิน (ใบกันเหลื่อม)",
              abelWidth: 150,
              emptyText: "กรุณาระบุ...",
              value: Ext.overlap_budget_type.data.c_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "หมวดค่าใช้จ่าย (สัญญา)",
              emptyText: "กรุณาระบุ...",
              value: Ext.rec.json.c_expense_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "หมวดค่าใช้จ่าย (ใบกันเหลื่อม)",
              labelWidth: 160,
              emptyText: "กรุณาระบุ...",
              value: Ext.overlap_expense.data.c_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
          ],
        }),
        buttons: [
          {
            text: "ยืนยัน",
            handler: function () {
              // console.log(Ext.rec.json.sp_tor_contract_pro_id); // sp_tor_pro_id
              // return
              Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                  mode: "UP_EXPENSE_BUDGET_PROJECT",
                  sp_tor_pro_id: Ext.rec.json.sp_tor_pro_id,
                  sp_tor_contract_pro_id: Ext.rec.json.sp_tor_contract_pro_id,
                  // sp_check_period_dtl_id : Ext.selectRow.get('sp_check_period_dtl_id'),
                  // sp_tor_dtl_period_id : Ext.selectRow.get('sp_tor_dtl_period_id'),
                  // sp_tor_hdr_period_id : Ext.selectRow.get('sp_tor_hdr_period_id'),
                  po_expense_id: Ext.overlap_expense.data.id,
                  dc_expense_budget_type_id: Ext.overlap_budget_type.data.id,
                },
                success: function (result, request) {
                  v = Ext.overlap_expense;
                  Ext.getCmp("transfermoney").getEl().unmask();
                  // Ext.getCmp("bg_budget_dtl_overlap_idID").destroy();
                  Ext.getCmp("bg_budget_dtl_overlap_idID").getEl().unmask();
                  let json = Ext.util.JSON.decode(result.responseText);
                  Ext.getCmp("transfermoney").destroy();
                  if (json.success == "Success") {
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                  } else {
                    Ext.Msg.alert("Error", "ผิดพลาด", json.msg);
                  }
                },
              });
            },
          },
          {
            text: "ย้อนกลับ",
            handler: function () {
              var id = "bg_budget_dtl_overlap_idID";
              var nameID = id + "_Name";
              Ext.getCmp("bg_budget_dtl_overlap_idID").setValue(""); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
              Ext.getCmp("dc_cost_idID").setValue("");
              Ext.getCmp("c_overlapID").setValue("");
              // Ext.getCmp("i_yearOverlapID").setValue("");
              Ext.getCmp(nameID).setValue("");
              Ext.getCmp("transfermoney").hide();
              Ext.getCmp("transfermoney").destroy();
            },
          },
        ],
      }).show();
    };
    Ext.poFormID = "win-frm-xxx001";
    function popOverlap(rec) {
      console.log(rec);

      Ext.storeDepartment = new Ext.data.JsonStore({
        storeId: "storeDepartment",
        autoLoad: true,
        url: "api/All.php",
        root: "data",
        // baseParams: { type: "storeOverlap", start: 0, limit: 20, mode: null }, //Permission i_read
        baseParams: { type: "storeOverlap", start: 0, limit: 20, mode: null, dc_cost_id: rec.data.dc_cost_id, i_yyyy_overlap: rec.data.i_yyyy_overlap, po_expense_id: rec.data.po_expense_id },
        idProperty: "id",
        totalProperty: "totalCount",
        //                                       fields: ["id", "c_department", "c_name"],
        fields: ["id", "bg_budget_dtl_overlap_id", "dc_costTxt", "c_name", "i_year", "c_code_ref", "dc_expense_budget_type_id", "dc_cost_id", "bg_expense_id", "d_end_date", "f_total"],
      });
      var columnMini = [
        { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
        {
          header: "ปีเลขที่ใบกัน",
          align: "center",
          width: 150,
          sortable: true,
          dataIndex: "i_year",
        },
        {
          header: "เลขที่ใบกัน",
          sortable: true,
          id: "c_name",
          //    align: "center",
          dataIndex: "c_name",
          renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = "style='cursor:pointer';";
            return value;
          },
        },
        { header: "วันหมดอายุใบกัน", sortable: true, dataIndex: "d_end_date" },
        { header: "หน่วยงาน", sortable: true, dataIndex: "dc_costTxt" },
        {
          header: "จำนวนเงิน",
          sortable: true,
          align: "RIGHT",
          dataIndex: "f_total",
        },
      ];
      Ext.PopDepartmentForm = new Ext.ux.Poplov({
        text: "เลขที่ใบกัน",
        id: "bg_budget_dtl_overlap_idID", //go to relation
        iconCls: "page_magnify",
        name: "bg_budget_dtl_overlap_id",
        valueHidden: "bg_budget_dtl_overlap_id", //go to hidden
        store: Ext.storeDepartment,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "เลขที่ใบกัน",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
          var id = "bg_budget_dtl_overlap_idID";
          var nameID = id + "_Name";
          var record = grid.getStore().getAt(rowIndex);
          var TextShow = record.data.c_code_ref;
          Ext.recs = record;
          Ext.getCmp(id).setValue(record.data.id); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
          Ext.getCmp("dc_expense_budget_typeID").setValue(record.data.dc_expense_budget_type_id);
          Ext.getCmp("po_expense_typeidID").setValue(record.data.bg_expense_id);
          Ext.getCmp("f_total_amt_overlapID").setValue(record.data.f_total);
          Ext.getCmp("c_overlapID").setValue(TextShow);
          Ext.getCmp(nameID).setValue(TextShow);
          Ext.getCmp("win-pop-lov" + id).hide();
          Ext.getCmp("win-pop-lov" + id).destroy();
          if (Ext.data.dc_expense_budget_type_id != Ext.selectRow.get("dc_expense_budget_type_id")) {
            var index = Ext.dc_expense_budget_type.findExact("id", record.data.dc_expense_budget_type_id);
            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
            var index = Ext.po_expense1.findExact("id", record.data.bg_expense_id);
            Ext.overlap_expense = Ext.po_expense1.getAt(index);
            var index = Ext.po_expense1.findExact("id", Ext.selectRow.get("po_expense_id") + "");
            Ext.po_expense_old = Ext.po_expense1.getAt(index);
            // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ข้อมูลแหล่งเงินไม่ตรงกัน เมื่อกดปุ่มบันทึกรายการจะอัพเดทข้อมูล</span><br>");
            transfer();
            // msg += "<span style='white-space: nowrap;'>- กรุณา</span><br>";
          } else if (record.data.bg_expense_id != Ext.selectRow.get("po_expense_id")) {
            var index = Ext.dc_expense_budget_type.findExact("id", record.data.dc_expense_budget_type_id);
            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
            var index = Ext.po_expense1.findExact("id", record.data.bg_expense_id);
            Ext.overlap_expense = Ext.po_expense1.getAt(index);
            var index = Ext.po_expense1.findExact("id", Ext.selectRow.get("po_expense_id") + "");
            Ext.po_expense_old = Ext.po_expense1.getAt(index);
            transfer();
          } else {
            console.log(Ext.po_expense_old);
            return;
          }
        },
      });
    }
    function bgBagedOver(rec, i) {
      Ext.rec = rec;
      if (rec.get("i_overlap") === 2) return false;
      else
        return new Ext.Window({
          id: "winDcExpTypeDdd2ID",
          modal: true,
          width: 850,
          title: "จองใบกัน " + Ext.selectRow.get("f_total_amt"),
          layout: "fit",
          height: 250,
          items: new Ext.FormPanel({
            frame: true,
            labelWidth: 160,
            padding: "10px 10px 10px 10px",
            url: "tor/api/mnBgExpenseController2.php",
            id: "formDcExpTypeDddID",
            items: [
              Ext.PopDepartmentForm.mini,
              // โชว์ข้อมูลหลังกดใบกัน
              new Ext.form.ComboBox({
                mode: "local",
                store: Ext.dc_expense_budget_type2,
                fieldLabel: "แหล่งเงินที่",
                width: 500,
                readOnly: true,
                value: Ext.rec.data.dc_expense_budget_type_id,
                submitValue: true,
                id: "dc_expense_budget_typeID",
                name: "dc_expense_budget_typeTxt",
                hiddenName: "dc_expense_budget_type_id",
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                    //***************************************************************************************แผนหรืองวด*******************************************************************

                    if (this.getValue() == 4 || this.getValue() == 5) {
                      Ext.getCmp("i_pr_type2ID").setValue(2);
                    } else {
                      Ext.getCmp("i_pr_type2ID").setValue(1);
                    }
                    //*********************************************************************************************************************************************************************
                    // alert(this.getValue());
                  },
                },
              }),
              new Ext.form.ComboBox({
                mode: "local",
                store: Ext.po_expense_expire,
                valueField: "id",
                displayField: "c_name",
                width: 500,
                submitValue: true,
                name: "c_detail",
                readOnly: true,
                id: "po_expense_typeidID",
                hiddenName: "po_expense_typeid",
                triggerAction: "all",
                allBlank: true,
                forceSelection: true,
                selectOnFocus: true,
                fieldLabel: "รายการย่อย ****",
                // width: 750,
                value: Ext.rec.data.po_expense_id,
                typeAhead: false,
                emptyText: "กรุณาเลือกใช้จ่าย...",
                listeners: {
                  afterrender: function () {
                    this.fn = function () {
                      // Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
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
                    console.log(this);
                  },
                },
              }),
              {
                xtype: "displayfield",
                fieldLabel: "เลขที่ใบกัน",
                name: "c_overlap",
                value: rec.get("c_overlap"),
                id: "c_overlapID",
              },
              {
                fieldLabel: "วงเงิน",
                xtype: "textfield",
                width: 150,
                value: Ext.rec.data.f_total_amt,
                name: "f_total_amt_overlap",
                id: "f_total_amt_overlapID",
                listeners: {
                  blur: function () {
                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                    this.setValue(Ext.floatRenderer(f_total));
                  },
                },
                style: {
                  labelAlign: "right",
                  "font-weight": "bold",
                  padding: "1px",
                  margin: "1px",
                  color: "blue",
                  "background-color": "#fff",
                  "text-align": "right",
                },
              },
            ],
            buttonAlign: "center",
            buttons: [
              {
                text: "บันทึกรายการ",
                id: "buSaveOverLapSubID",
                iconCls: "icon-save",
                //disabled: true,
                listeners: {
                  afterrender: function () {},
                },
                handler: function () {
                  if (rec.get("i_booking_bg") === 2 && rec.get("i_overlap") === 1) {
                    bookingOverlap(2, genLinkBg("c_overlap_book", rec), rec);
                  } else {
                    bookingOverlap(1, genLinkBg("c_overlap", Ext.recs), rec);
                  }
                },
                //haddler
              },
              {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                  Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                },
              },
            ],
          }),
        });
    }

    function bgBagedType(rec) {
      var record = rec;
      return new Ext.Window({
        id: "winDcExpTypeDdd2ID",
        modal: true,
        width: 850,
        //                height: 430,
        title: "เปลี่ยนแปลงแหล่งเงินที่จัด ซื้อ/เช่า/จ้าง เงินในสัญญา " + Ext.selectRow.get("f_total_amt"),
        layout: "form",
        items: new Ext.FormPanel({
          frame: true,
          labelWidth: 160,
          padding: "10px 10px 10px 10px",
          url: "tor/api/mnBgExpenseController2.php",
          id: "frm-booking-allID",
          items: [
            {
              xtype: "hidden",
              name: "tor_id",
              id: "tor_id",
              value: Ext.selectRow.get("sp_tor_id"),
            },
            {
              xtype: "hidden",
              name: "sp_tor_contract_id",
              id: "sp_tor_contract_idID",
              value: Ext.selectRow.get("sp_tor_contract_id"),
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 1",
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type_id1TxtID",
              name: "dc_bg_budget_type_id",
              hiddenName: "dc_expense_budget_type_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
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
              xtype: "buttongroup",
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 1",
              frame: false,
              border: false,
              items: [
                {
                  xtype: "displayfield",
                  name: "f_type_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                  disabled: (Ext.selectRow.get("c_bg_reserve_money1_id") > 0 && Ext.selectRow.get("c_f_type_amt").replace(/,/g, "")) > 0 ? true : false,
                  name: "c_f_type_amt",
                  id: "f_type_amtID",
                  listeners: {
                    blur: function () {
                      this.fn(true);
                    },
                    afterrender: function () {
                      this.fn = function (t) {
                        var val = 100000000000000;
                        val = this.getValue();
                        this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                      };
                      this.fn();
                    },
                  },
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "blue",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "button",
                  text: "* บันทึกรายการจอง",
                  id: "button1",
                  listeners: {
                    afterrender: function () {
                      this.setDisabled((Ext.selectRow.get("c_bg_reserve_money1_id") > 0 && Ext.selectRow.get("c_f_type_amt").replace(/,/g, "")) > 0 ? true : false);
                    },
                  },
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("winDcExpTypeDdd2ID").hide();
                      Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
                      Ext.Ajax.request({
                        url: genLinkBg("c_pr", rec), //genLink();
                        method: "GET", //POST
                        disableCaching: false,
                        success: function (result, request) {
                          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                          var cheVal = parseFloat(Ext.getCmp("f_type_amtID").getValue().replace(/\,/g, ""));
                          if (Ext.getCmp("i_pr_type1ID").getValue().inputValue === 1) {
                            f_amt = parseFloat(jsonData.data[0].f_total_plan.replace(/\,/g, ""));
                          } else {
                            f_amt = parseFloat(jsonData.data[0].f_total_dtl.replace(/\,/g, ""));
                          }
                          // console.log("F_amt"+f_amt);
                          // console.log("cheVal"+cheVal);
                          // return;
                          if (f_amt >= cheVal) {
                            Ext.MessageBox.alert("Success", "เงินที่จะเบิกมีเพียงพอ", function () {
                              Ext.rec = rec;
                              bookingPRPO(1, genLinkBg("c_book_pr", rec));
                              //bookingPRPO(2,genLinkBg('c_book_po',rec));
                            });
                          } else {
                            Ext.MessageBox.alert("Success", "เงินจองไม่พอ ระบบได้ดำเนินการร้องของเงินแล้ว กรุณาติดต่อฝ่ายคลัง", function () {
                              //End Property
                              Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                              Ext.getCmp("winChequeID").getEl().unmask(); //end
                              Ext.storeProject.reload();
                            });
                          }

                          return false;
                        },
                        failure: function (result, request) {
                          Ext.MessageBox.alert("Failed", result.responseText); // connect error
                        },
                      });
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type1ID",
                  name: "i_pr_type1",
                  items: [
                    {
                      // checked: true,
                      name: "i_pr_type1",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type1",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
          ],
          buttons: [
            {
              text: "Cancel",
              handler: function () {
                Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                Ext.storeDtl.reload();
              },
            },
          ],
        }),
      });
    }
    return new Ext.Window({
      collapsible: true,
      maximizable: true,
      title: Ext.title,
      id: Ext.poFormID,
      width: Ext.getCmp("contenterCenter").getWidth() - 5,
      height: Ext.getCmp("contenterCenter").getHeight() - 5,
      layout: "fit",
      modal: true,
      plain: true,
      items: [
        {
          xtype: "tabpanel",
          activeTab: 0,
          id: "winChequeID",
          // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
          items: [
            //--รายละเอียด TOR
            new Ext.FormPanel({
              title: "รายละเอียดการลงนามในสัญญา",
              id: "tap_main",
              iconCls: "icon-start",
              columnWidth: 1,
              url: "tor/api/mnTorController.php",
              frame: true,
              autoScroll: true,
              labelAlign: "left",
              bodyStyle: "padding:1px",
              labelWidth: 200,
              items: [
                {
                  layout: "column",
                  border: false,
                  items: [
                    {
                      columnWidth: 0.8,
                      layout: "form",
                      border: true,
                      items: [
                        {
                          xtype: "hidden",
                          name: "sp_tor_contract_id",
                          id: "sp_tor_contract_id",
                        },
                        {
                          xtype: "hidden",
                          name: "i_yyyy",
                          id: "i_yyyyID",
                        },
                        {
                          xtype: "hidden",
                          name: "dc_expense_budget_type_id",
                          id: "dc_expense_budget_type_idID",
                        }, ////i_yyyy dc_expense_budget_type_id po_expense_id
                        {
                          xtype: "hidden",
                          name: "po_expense_id",
                          id: "po_expense_idID",
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "เลขสัญญา",
                          id: "codeHdrID",
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          name: "c_code",
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "แหล่งเงิน",
                          name: "c_expense_budget_type_name",
                          width: 300, // c_expense_name c_expense_budget_type_name
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "รายจ่าย",
                          name: "c_expense_name",
                          width: 300,
                        },
                        {
                          xtype: "textarea",
                          readOnly: true,
                          fieldLabel: "เรื่อง/โครงการ",
                          id: "main_c_nameID",
                          name: "c_name",
                          width: 500,
                          height: 105,
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่ใบสั่ง ",
                          id: "d_doc_dateMianID", //d_due_dateMianID d_doc_dateMianID
                          name: "d_doc_date",
                          width: 150,
                          listeners: {
                            change: function () {
                              Ext.getCmp("d_due_dateMianID").fn();
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่ในสัญญา",
                          id: "d_due_dateMianID",
                          name: "d_due_date",
                          width: 150,
                          listeners: {
                            change: function () {
                              this.fn();
                            },
                            beforrender: function () {},
                            afterrender: function () {
                              this.fn = function () {
                                var aa = Ext.getCmp("d_doc_dateMianID").getValue();
                                var bb = Ext.getCmp("d_due_dateMianID").getValue();
                                var date1 = new Date(aa); //d_due_dateID d_doc_dateID
                                var date2 = new Date(bb);
                                const diffTime = Math.abs(date2 - date1);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                Ext.getCmp("i_deliveryID").setValue(diffDays);
                                console.log(aa + " == " + bb);
                                console.log(diffDays);
                              };
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่รับสนองราคา ",
                          id: "d_doc_resp_dateID",
                          name: "d_doc_resp_date",
                          width: 150,
                          listeners: {
                            render: function (p) {
                              this.hide();
                            },
                          },
                        },
                        {
                          xtype: "displayfield",
                          fieldLabel: "รหัสเอกสารอ้างอิง",
                          name: "d_doc_ref",
                        },
                        {
                          fieldLabel: "เหตผล",
                          xtype: "textarea",
                          width: 400,
                          name: "c_discription",
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: " เลขที่เอกสารรับสนองราคา ",
                          id: "c_doc_resp_noID",
                          name: "c_doc_resp_no",
                          width: 150,
                          listeners: {
                            render: function (p) {
                              this.hide();
                            },
                          },
                        },
                        {
                          xtype: "hidden",
                          //                                                    fieldLabel: " เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
                          id: "c_po_noID",
                          name: "c_po_no",
                        },
                        {
                          xtype: "displayfield",
                          fieldLabel: "คู่สัญญา/ผู้ขาย ",
                          name: "dc_creditor_idTxt",
                          cls: "my-label-style",
                        },
                        {
                          fieldLabel: "กำหนดส่งภายใน ",
                          xtype: "radiogroup",
                          columns: [50, 150],
                          items: [
                            {
                              xtype: "textfield",
                              name: "i_delivery",
                              id: "i_deliveryID",
                              value: 1,
                              validator: function (val) {
                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                var strMoney = val.replace(",", "");
                                if (!regex.test(val)) {
                                  return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                } else {
                                  return true;
                                }
                              },
                            },
                            {
                              xtype: "displayfield",
                              value: "วัน ",
                              cls: "my-label-style",
                            },
                          ],
                        },
                        {
                          xtype: "radiogroup",
                          columns: [250],
                          fieldLabel: "การคิดค่าปรับแบบ",
                          id: "type_fineID",
                          style: {
                            "font-weight": "bold",
                          },
                          items: [
                            {
                              name: "i_type_fine",
                              checked: true,
                              inputValue: 0,
                              boxLabel: "ปรับตามความสำเร็จของงานพร้อมกันทั้งหมด",
                            },
                            {
                              name: "i_type_fine",
                              inputValue: 1,
                              boxLabel: "ปรับแยกตามรายงวด",
                            },
                          ],
                        },
                        {
                          fieldLabel: "คิดจากวงเงินในสัญญาจำนวน ",
                          id: "i_is_fineID",
                          xtype: "radiogroup",
                          columns: [150, 150],
                          items: [
                            {
                              xtype: "textfield",
                              id: "i_is_fineTextID", //(i_fine_amt,i_fine_per) in i_is_fineTextID fn(cal)
                              name: "f_fine",
                              width: 430,
                              value: "0.00",
                              validator: function (val) {
                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                if (!regex.test(val)) {
                                  return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                } else {
                                  return true;
                                }
                              },
                            },
                            {
                              xtype: "displayfield",
                              id: "fpBt",
                              value: "(บาท)/วัน",
                              cls: "my-label-style",
                            },
                          ],
                        },
                        {
                          xtype: "radiogroup",
                          columns: [180],
                          fieldLabel: "โหมดการบันทึก",
                          id: "modesubID",
                          style: {
                            "font-weight": "bold",
                          },
                          items: [
                            {
                              name: "mode",
                              checked: true,
                              inputValue: "UP_SP_TOR_CONTRACT_NEXT",
                              boxLabel: "อัพเดทรายการ",
                            },
                          ],
                        },
                      ],
                      buttonAlign: "center",
                      buttons: [
                        {
                          text: "บันทึกรายการ",
                          id: "buSaveSubID",
                          iconCls: "icon-save",
                          //disabled: true,
                          listeners: {
                            afterrender: function () {},
                          },
                          handler: function () {
                            var formSubmit = function () {
                              form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                  Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.selectRow = null;
                                    Ext.getCmp(Ext.poFormID).destroy();
                                  });
                                },
                                failure: function (form, action) {
                                  switch (action.failureType) {
                                    case Ext.form.Action.CLIENT_INVALID:
                                      Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                      break;
                                    case Ext.form.Action.CONNECT_FAILURE:
                                      Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                      break;
                                    case Ext.form.Action.SERVER_INVALID:
                                      Ext.Msg.alert("Failure", action.result.msg);
                                  }
                                },
                              });
                            }; //END

                            var form = Ext.getCmp("tap_main").getForm();
                            if (form.isValid()) {
                              if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                              } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                Ext.MessageBox.show({
                                  title: "Icon Support",
                                  msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                  buttons: Ext.MessageBox.OKCANCEL,
                                  icon: Ext.MessageBox.WARNING,
                                  fn: function (btn) {
                                    if (btn === "ok") {
                                      formSubmit(form);
                                    } else {
                                      return;
                                    }
                                  },
                                });
                              } else {
                                formSubmit(form);
                              }
                            }
                          },
                          //haddler
                        },
                        {
                          text: Ext.GLOBAL_BU_BACK_TH,
                          handler: function () {
                            Ext.getCmp(Ext.poFormID).hide();
                            Ext.getCmp(Ext.poFormID).destroy();
                          },
                        },
                      ],
                    },
                    {
                      columnWidth: 0.4,
                      layout: "table",
                    },
                  ],
                },
              ],
            }),
            //รายละเอียดงวดงาน
            {
              title: "ข้อมูลสัญญาโครงการต่อเนื่อง",
              frame: true,
              autoScroll: true,
              id: "tabpanelMain2ID",
              iconCls: "icon-contract",
              layout: "form", //form
              border: false,
              items: [
                {
                  labelStyle: "padding: 10px 10px;",
                  fieldLabel: "เลขที่สัญญา",
                  xtype: "displayfield",
                  id: "DISPLAY_c_name_hdr_period",
                  name: "c_name",
                },
                {
                  labelStyle: "padding: 10px 10px;",
                  fieldLabel: "คู่สัญญา",
                  xtype: "displayfield",
                  id: "DISPLAY_creditor_name_hdr_period",
                  name: "creditor_name",
                },
                {
                  labelStyle: "padding: 10px 10px;",
                  fieldLabel: "วันที่ในสัญญา",
                  xtype: "displayfield",
                  id: "DISPLAY_creditor_d_doc_date_hdr_period",
                  name: "d_doc_date",
                },
                {
                  labelStyle: "padding: 10px 10px;",
                  fieldLabel: "วงเงินในสัญญา",
                  xtype: "displayfield",
                  id: "DISPLAY_creditor_f_total_amt_hdr_period",
                  name: "f_total_amt",
                },

                {
                  xtype: "hidden",
                  name: "id",
                },
                {
                  xtype: "hidden",
                  name: "sp_tor_id",
                },
                {
                  xtype: "hidden",
                  name: "sp_tor_contract_id",
                },
                {
                  xtype: "hidden",
                  name: "parent_id",
                },
                {
                  xtype: "grid",
                  id: "gridSub3ID",
                  border: false,
                  stripeRows: true,
                  loadMask: true,
                  // autoHeight: true,
                  height: 500,
                  store: Ext.storeProject,
                  tbar: [
                    {
                      xtype: "button",
                      iconCls: "icon-add",
                      text: "เพิ่ม PO ย่อย",
                      handler: function () {
                        Ext.SP_TOR_HDR_PERIOD_ID = null;
                        Ext.selectRow_PeridHdr = null;
                        win_project({}, "ADD");
                      },
                    },
                    {
                      id: "buBackSub2ID",
                      xtype: "button",
                      iconCls: "icon-back",
                      text: "ย้อนกลับไปสัญญาโครงการ",
                      handler: function () {
                        Ext.getCmp("winChequeID").setActiveTab(0);
                      },
                    },
                  ],
                  columns: [
                    new Ext.grid.RowNumberer({
                      width: 35,
                      header: " No ",
                      dataIndex: "no",
                    }),
                    { header: "ID System", hidden: true, dataIndex: "id" },
                    {
                      header: "รายละเอียด",
                      align: "left",
                      dataIndex: "id",
                      width: 90,
                      id: "hdrProject",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("no") === 9999) return "";
                        else return "<button style='font-size:10px;'>รายละเอียดงวดใน PO ย่อย </button>";
                      },
                    },
                    {
                      header: "งบประมาณ/ใบกันเหลื่อม",
                      align: "left",
                      dataIndex: "id",
                      width: 60,
                      id: "hdrProjectBooking",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("no") === 9999) {
                          return "";
                        } else if (record.get("i_booking_bg") === 1) {
                          if (record.get("bg_reserve_money1_id") > 0) {
                            return "จองแล้ว";
                          } else {
                            return "<button style='font-size:10px;'>จองเงิน</button>";
                          }
                        } else {
                          if (record.get("i_overlap") === 1) {
                            return "<button style='font-size:10px;'>" + record.get("c_overlap") + "</button>";
                          } else if (record.get("i_overlap") === 2) {
                            return record.get("c_overlap") + " จองแล้ว";
                          } else {
                            return "<button style='font-size:10px;'>เลขใบกันเหลื่อม </button>";
                          }
                        }
                      },
                    },
                    {
                      header: "ผ่านรายการ",
                      align: "center",
                      width: 80,
                      id: "processDueID",
                      dataIndex: "project_code",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.data.i_contract_status == 1) {
                          return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
                        } else if (record.data.i_contract_status > 1) {
                          return '<img src="../images/icons/application_go.png" style="cursor:pointer"/>';
                        }
                      },
                    },
                    {
                      header: "PO ย่อย",
                      align: "center",
                      width: 80,
                      dataIndex: "project_code",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        return value;
                      },
                    },
                    {
                      header: "เลขใบกัน",
                      align: "center",
                      width: 80,
                      dataIndex: "c_overlap",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        return value;
                      },
                    },
                    //            {header: "วันที่ส่งมอบ", dataIndex: "d_doc_date", align: "center"},
                    {
                      header: "วันที่ส่งมอบ",
                      width: 50,
                      dataIndex: "d_due_date",
                      align: "center",
                    },
                    {
                      header: "จำนวนเงิน",
                      dataIndex: "f_total_amt",
                      align: "right",
                    },
                    {
                      header: "แสดงรายการ",
                      align: "center",
                      width: 30,
                      // hidden: true,
                      dataIndex: "i_period",
                      id: "hdrProjectShow",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("no") === 9999) return "";
                        else if (record.get("i_status") == 2) {
                          return "";
                        } else {
                          return '<img src="../images/icons/page_green.png"); style="cursor:pointer"/>';
                        }
                      },
                    },
                    {
                      header: "แก้ไข",
                      align: "center",
                      width: 35,
                      // hidden: true,
                      dataIndex: "i_period",
                      id: "hdrProjectEdit",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("no") === 9999) return "";
                        else if (record.get("i_status") == 2) {
                          return "";
                        } else {
                          return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
                        }
                      },
                    },
                    {
                      header: "ลบ",
                      align: "center",
                      width: 35,
                      // hidden: true,
                      dataIndex: "i_period",
                      id: "hdrProjectDel",
                      renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get("no") === 9999) {
                          return "";
                        } else if (record.get("i_status") == 2) {
                          return "";
                        } else {
                          return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                        }
                      },
                    },
                  ],
                  listeners: {
                    beforerender: function () {
                      this.thisCick = function (grid, rowIndex, columnIndex, e) {
                        var record = grid.getStore().getAt(rowIndex);
                        if (record.get("no") === 9999) return "";
                        else if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
                          upStatusController(record);
                        } else if (columnIndex === grid.getColumnModel().getIndexById("hdrProject")) {
                          //win_project(record,'DETAIL');
                          //
                          console.log( ' record => '+record);
                          console.log( ' po_expense_id => '+record.get('po_expense_id'));
              
                          Ext.selectSubPo_expense_id= record.get('po_expense_id');
//      alert(Ext.selectSubPo_expense_id);
                          Ext.sp_tor_contract_pro_id = record.data.sp_tor_contract_pro_id;
                          win_hdr_period(record, "ADD");
                          Ext.hdrProject = record;
                          Ext.getCmp("grid-periodID").setTitle("งวด PO ย่อย " + record.get("c_code"));
                        } else if (columnIndex === grid.getColumnModel().getIndexById("hdrProjectBooking")) {
                          Ext.selectRow.set("i_pr_type1", record.get("i_pr_type1"));
                          Ext.selectRow.set("c_f_type_amt", record.get("f_total_amt"));
                          if (record.get("bg_reserve_money1_id") > 0 || record.get("i_overlap") === 1) {
                            // จองแล้ว is null
                            console.log(record);
                            console.log(record.get("bg_reserve_money1_id"));
                            if (record.get("i_booking_bg") === 2 && record.get("i_overlap") === 1) {
                              popOverlap(record);
                              var win = bgBagedOver(record, 2);
                              win.items.items[0].getForm().loadRecord(record);
                              win.show();
                              Ext.getCmp("pop_bg_budget_dtl_overlap_idID").hide();
                              Ext.getCmp("buSaveOverLapSubID").setText("จองเงินผ่านใบกัน");
                            } else if (record.get("i_booking_bg") === 2 && record.get("i_overlap") === 1) {
                            }
                          } else {
                            popOverlap(record);
                            if (record.get("i_booking_bg") === 2 && record.get("i_overlap") === 0) {
                              var win = bgBagedOver(record, 1);
                              win.items.items[0].getForm().loadRecord(Ext.selectRow);
                              win.show();
                            } else if (record.get("i_booking_bg") === 2 && record.get("i_overlap") === 2) {
                            } else if (record.get("i_booking_bg") === 2 && record.get("i_overlap") === 3) {
                            } else {
                              var win = bgBagedType(record);
                              win.items.items[0].getForm().loadRecord(Ext.selectRow);
                              win.show();
                            }
                            // win.items.items[0].getForm().loadRecord(Ext.selectRow);
                            // win.show();
                          }
                        } else if (columnIndex === grid.getColumnModel().getIndexById("hdrProjectShow")) { 
                          win_project(record, "SHOW");
                        } else if (columnIndex === grid.getColumnModel().getIndexById("hdrProjectEdit")) {
                          if (record.get("i_contract_status") > 1) {
                            Ext.MessageBox.alert("แจ้งเตือน", "ผ่านรายการแล้วไม่สามารถแก้ไขรายการได้");
                          } else if (record.get("i_overlap") > 1) {
                            Ext.MessageBox.alert("แจ้งเตือน", "จองแล้วไม่สามารถแก้ไขได้");
                          } else {
                            win_project(record, "EDIT");
                          }
                        } else if (columnIndex === grid.getColumnModel().getIndexById("hdrProjectDel")) {
                          if (record.get("i_contract_status") > 1) {
                            Ext.MessageBox.alert("แจ้งเตือน", "ผ่านรายการแล้วไม่สามารถลบรายการได้");
                          } else {
                            DeleteTor_dtl(record);
                          }
                        }
                      };
                    },
                    afterrender: function () {
                      this.on("cellclick", this.thisCick, this);
                    },
                  },
                  viewConfig: {
                    forceFit: true,
                    emptyText: "ไม่มีข้อมูล..",
                    deferEmptyText: false,
                    getRowClass: function (rec) {
                      if (rec.get("no") === 9999) {
                        return "";
                      } else {
                        return rec;
                      }
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  };

  DeleteProHdr = function (record) {
    // console.log(record);
    var win = new Ext.Window({
      id: "win-msg-delete",
      title: "Remove",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการที่จะลบข้อมูล รายละเอียดของในงวด ? " + record.get("sp_tor_dtl_period_id"),
      buttons: [
        {
          text: "ตกลง",
          handler: function () {
            Ext.Ajax.request({
              url: "tor/api/mnTorController.php",
              params: {
                mode: "DELETE_SP_TOR_DTL_PERIOD", //DELETE_SP_TOR_HDR_PERIOD DELETE_SP_TOR_DTL_PERIOD
                id: record.get("sp_tor_dtl_period_id"),
              },
              method: "GET", //POST
              success: function (result, request) {
                Ext.getCmp("win-msg-delete").destroy();
                Ext.store3.reload({
                  callback: function (record, operation, success) {
                    if (success) {
                      var i = this.data.length - 1;
                      Ext.getCmp("grid-productID").getStore().reload();
                    }
                  },
                });
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
              },
            });
          },
        },
        {
          text: "ยกเลิก",
          handler: function () {
            Ext.getCmp("win-msg-delete").hide();
            Ext.getCmp("win-msg-delete").destroy();
            Ext.getCmp("tabpanel1").getStore().reload();
          },
        },
      ],
    }).show();
  };
  DeletePeriodHdr = function (record) {
    var win = new Ext.Window({
      id: "win-msg-delete",
      title: "Remove",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการที่จะลบข้อมูลงวด ? " + record.get("id"),
      buttons: [
        {
          text: "ตกลง",
          handler: function () {
            Ext.Ajax.request({
              url: "tor/api/mnTorController.php",
              params: {
                mode: "DELETE_SP_PROJECT_HDR_PERIOD", //DELETE_SP_TOR_HDR_PERIOD DELETE_SP_TOR_DTL_PERIOD
                id: record.get("id"),
              },
              method: "GET", //POST
              success: function (result, request) {
                Ext.getCmp("win-msg-delete").destroy();
                Ext.store3.reload({
                  callback: function (record, operation, success) {
                    if (success) {
                      var i = this.data.length - 1;
                      Ext.getCmp("grid-periodID").getStore().reload();
                    }
                  },
                });
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
              },
            });
          },
        },
        {
          text: "ยกเลิก",
          handler: function () {
            Ext.getCmp("win-msg-delete").hide();
            Ext.getCmp("win-msg-delete").destroy();
            Ext.getCmp("tabpanel1").getStore().reload();
          },
        },
      ],
    }).show();
  };
  var MenuButton = function () {
    // show Menu Edit Grid
    var editm = Ext.menuEditGrid;
    var menu = new Ext.menu.Menu({
      id: "mainMenu",
      border: false,
      style: {
        overflow: "visible",
      },
      /*
             items: [{
             text: "ประเภทข้อมูล",
             icon: "../images/icons/application_form_magnify.png",
             menu: {
             items: [
             '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
             {
             text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
             checked: false,
             id: "keyDatat1",
             uri: 1,
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
             checked: false,
             uri: 0,
             id: "keyDatat2",
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทข้อมูลที่ทั้งหมด",
             checked: true,
             id: "keyDatat3",
             uri: null,
             group: "theme",
             checkHandler: onLocationCheck
             }
             ]
             }
             }]*/
    });
    var tb = new Ext.Toolbar({
      text: " รายการเมนู ",
      border: false,
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "menu",
      // <-- icon
      menu: menu,
      // assign menu by instance
    });
    //    รายการเมนู
    tb.add({
      text: " รายการเมนู ",
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "bmenu",
      // <-- icon
      border: false,
      bodyStyle: "padding:0px 0px 0px 0px !important;",
      menu: menu,
      // assign menu by instance
    });
    menu.addSeparator();
    //  เพิ่มข้อมูล
    menu.add({ text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png" }).on(
      "click",
      (click = function () {
        //             Ext.loadStore("add", false); // app,data.load
      })
    );
    // แก้ไขข้อมูล
    menu
      .add({
        text: "จัดการข้อมูล View/Copy/Edit/Delete",
        icon: "../images/icons/application_edit.png",
      })
      .on(
        "click",
        (click = function () {
          Ext.loadStore("edit", true);
        })
      );

    tb.doLayout();
    return tb;
  }; //MenuButton
  Ext.gridMainfn = function (editAbled) {
    if (!Ext.isEmpty(Ext.getCmp("tabpanel1"))) Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

    var gridMains = new gridMain();
    Ext.getCmp("contenterCenter").add(gridMains);
    Ext.getCmp("contenterCenter").setActiveTab(gridMains);
    Ext.getCmp("tabpanel1").on("beforeedit", function () {
      return editAbled;
    });
    if (editAbled) Ext.getCmp("buSaveGridID").show();
    else Ext.getCmp("buSaveGridID").hide();
    return gridMains;
  };
  /////////////////// searchGrid Extend
  Ext.extend(
    (searchGrid = function () {
      var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
      //classOverride
      searchGrid.superclass.constructor.call(this, {
        initComponent: function () {
          searchGrid.superclass.initComponent.call(this);
          this.fn(this);
        },
        listeners: {
          afterrender: function (obj, eOpts) {},
        },
        fn: function () {},
        id: "frm-grid-searchID",
        frame: true,
        bodyStyle: "padding:1px",
        autoHeight: true,
        border: false,
        width: 600,
        url: mnController,
        labelWidth: 180,
        defaults: {
          anchor: "0",
        },
        items: [
          {
            xtype: "hidden",
            name: "mode",
            value: "saveDataGrid",
          },
          {
            xtype: "hidden",
            name: "gridMain",
            id: "gridMainID",
          },
          menu ? MenuButton() : [],
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "บันทึกรายการ ",
            id: "buSaveGridID",
            iconCls: "icon-save",
            listeners: {
              afterrender: function () {
                this.hide();
              },
            },
            handler: function () {
              var formSubmit = function () {
                form.submit({
                  waitMsg: "Saving Data...",
                  success: function (form, action) {
                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                      Ext.getCmp("tabpanel1").getStore().reload();
                      Ext.getCmp("winChequeID").hide();
                      Ext.getCmp("winChequeID").destroy();
                    });
                  },
                  failure: function (form, action) {
                    switch (action.failureType) {
                      case Ext.form.Action.CLIENT_INVALID:
                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                        break;
                      case Ext.form.Action.CONNECT_FAILURE:
                        Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                        break;
                      case Ext.form.Action.SERVER_INVALID:
                        Ext.Msg.alert("Failure", action.result.msg);
                    }
                  },
                });
              }; //func submit
              var saveDtl = function (mode) {
                let msg = "";
                let jsonArr = [];
                let sto = Ext.getCmp("tabpanel1").store.data.items;
                sto.forEach(function (v) {
                  //d_audit_date d_approve_date d_doc_date d_inv_date
                  jsonArr.push({
                    po_working_dtl_id: v.data.id,
                    d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                  });
                });
                Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                formSubmit(form); //submit grid form
              }; // saveDtl
              var form = Ext.getCmp("frm-grid-searchID").getForm();
              if (form.isValid()) {
                Ext.MessageBox.show({
                  title: "Icon Support",
                  msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                  buttons: Ext.MessageBox.OKCANCEL,
                  icon: Ext.MessageBox.WARNING,
                  fn: function (btn) {
                    if (btn === "ok") {
                      //TODO @ setGridDirty to idCmp
                      saveDtl();
                    } else {
                      return;
                    }
                  },
                });
              }
            },
            //haddler
          },
          {
            xtype: "tbfill",
          },
          {
            text: "ค้นหา",
            id: "buSearchID",
            iconCls: "icon-magnifier",
            handler: function () {
              search();
            },
          },
          {
            text: "เริ่มใหม",
            iconCls: "icon-reset",
            handler: function () {
              Ext.getCmp("frm-grid-searchID").getForm().reset();
            },
          },
        ],
      });
    }),
    Ext.FormPanel,
    {}
  );
  function SearchFrm() {
    return new Ext.Window({
      //                     collapsible: true,
      //                     maximizable: true,
      title: "ค้นหารายการ",
      width: 700,
      id: "winSearchFrm",
      height: 150,
      layout: "fit",
      //                     modal: true,
      plain: true,
      bodyStyle: "padding:5px;",
      buttonAlign: "center",

      items: [
        {
          layout: "column",
          border: false,
          defauls: { background: "#eee" },
          items: [
            {
              columnWidth: 0.5,
              layout: "form",
              border: false,
              items: [
                {
                  xtype: "textfield",
                  //       height: 18,
                  fieldLabel: "เลขที่สัญญา",
                  id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                  name: "c_code",
                  // value: "พวช.จ.01064/2567",
                },
              ],
            },
            {
              columnWidth: 0.5,
              layout: "form",
              border: false,
              items: [
                {
                  xtype: "textfield",
                  fieldLabel: "ชื่อคู่สัญญา2",
                  id: "sc_nameID",
                  name: "c_name",
                },
              ],
            },
          ],
          buttonAlign: "left",
          buttons: [
            {
              text: "ค้นหา",
              handler: function () {
                Ext.storeDtl.setBaseParam("mode", "LIST");
                Ext.storeDtl.setBaseParam("act", "SEARCH");
                // Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                // Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                // Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                Ext.storeDtl.load();
              },
            },
            {
              text: "ปิด",
              handler: function () {
                Ext.getCmp("winSearchFrm").hide();
              },
            },
          ],
        },
      ],
    });
  }
  /////////////////// gridMain
  Ext.extend(
    (gridMain = function () {
      var colmnn = [
        new Ext.grid.RowNumberer({
          header: "ที่",
          dataIndex: "no",
          id: "idID",
          width: 30,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            return record.get("no");
          },
        }),
        {
          header: "ลำดับ",
          sortable: false,
          align: "left",
          dataIndex: "id",
          hidden: true, // icon: "../images/icons/application_view_tile.png"
        },
        {
          header: "ชื่อคู่สัญญา1",
          sortable: false,
          align: "left",
          dataIndex: "dc_creditor_idTxt",
          width: 250,
        },
        {
          header: "เลขประจำตัวผู้เสียภาษี(คู่สัญญา)",
          sortable: false,
          align: "left",
          dataIndex: "c_tax_number_imp",
          width: 150,
        },
        {
          header: "เลขที่สัญญา",
          sortable: false,
          align: "left",
          dataIndex: "c_doc_ref",
          width: 150,
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = record.get("i_is_notor") == 1 ? "style='color:blue;font-wieght:bold';" : "";
            return record.get("c_code") + "/" + record.get("d_doc_ref");
          },
        },
        {
          header: "สถานะการจอง",
          sortable: false,
          align: "left",
          dataIndex: "c_bg_reserve_money1_id",
          width: 150,
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return val > 0 ? "จองแล้ว" : "-";
          },
          //                    },
          //                    {
          //                        header: "สัญญาแบบ",
          //                        sortable: false,
          //                        align: "left",
          //                        dataIndex: "i_is_po",
          //                        width: 90,
          //                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
          //
          //                            var i = val == 1 ? "&nbsp;&nbsp;สัญญาย่อย" : "สัญญาปกติ";
          //                            return i;
          //                        },
        },
        {
          header: "",
          sortable: false,
          align: "center",
          dataIndex: "d_period_date",

          width: 50,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            if (record.data.i_contract_status == 1) {
              return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
            } else if (record.data.i_contract_status > 1) {
              return '<img src="../images/icons/application_go.png" style="cursor:pointer"/>';
            }
          },
        },
        {
          header: "วันที่เริ่มสัญญา",
          sortable: false,
          align: "center",
          dataIndex: "d_doc_date",
          width: 100,
        },
        {
          header: "วันที่สิ้นสุดสัญญา",
          sortable: false,
          align: "center",
          dataIndex: "d_due_date",
          width: 100,
        },
        {
          header: "เรื่อง",
          sortable: false,
          //                        align: "center",
          dataIndex: "c_name",
          width: 150,
        },
        {
          header: "วิธีดำเนินงาน",
          sortable: false,
          align: "center",
          dataIndex: "c_tor_type",
          width: 80,
        },
        {
          header: "ขอดำเนินการ",
          sortable: false,
          align: "center",
          dataIndex: "c_purchase",
          width: 80,
        },
        {
          header: "รหัสเอกสารอ้างอิง",
          sortable: false,
          align: "center",
          dataIndex: "d_doc_ref",
        },
        {
          header: "หน่วยงานเจ้าของเรื่อง",
          align: "left",
          dataIndex: "dc_cost_idTxt",
          width: 120,
        },
        {
          header: "ชื่อผู้สร้างรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_create_id",
          hidden: true,
        },
        {
          header: "หน่วยงานผู้สร้าง",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_create_cost_id",
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
          align: "center",
          dataIndex: "dc_user_update_id",
          width: 120,
        },
        {
          header: "หน่วยงานแก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_update_cost_id",
          width: 120,
        },
        {
          header: "วันที่แก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "d_update",
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return shortThaiDate(val);
          },
          //                    },
          //                    {
          //                        header: "แก้ไขสถานะสัญญา",
          //                        sortable: false,
          //                        align: "center",
          //                        dataIndex: "id",
          //                        id: "editContractID",
          //                        width: 120,
          //                        renderer: function (value, metaData, record, row, col, store, gridView) {
          //                            metaData.attr = "style='cursor:pointer; text-align:center;';";
          //                            //...
          //
          //                            return '<img src="../images/icons/page_edit.png"); style="cursor:pointer"/>';
          //
          //                        }
        },
      ];

      gridMain.superclass.constructor.call(this, {
        region: "center",
        title: Ext.title + "",
        xtype: "grid",
        id: "tabpanel1",
        border: true,
        stripeRows: true,
        loadMask: true,
        //------------------
        tbar: [
          {
            xtype: "button",
            text: " ค้นหา ",
            width: 80,
            iconCls: "icon-application-view-list",
            handler: function () {
              if (!Ext.isEmpty(Ext.getCmp("winSearchFrm"))) Ext.getCmp("winSearchFrm").destroy();
              var s1 = SearchFrm();
              s1.show();
            },
          },
        ],
        layout: "fit",
        clicksToEdit: 2,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: true,
        },
        listeners: {
          dblclick: function (dataview, index, item, e) {
            Ext.buAct = "update";
            Ext.loadStore("edit", true); // app,data.load
          },
          viewready: function (g) {
            //
          },
          // Allow rows to be rendered.
          beforeedit: function (g) {
            if (g.rowIdx == 1) return false;
          },
          // Allow rows to be rendered. console.log(value.format('d-m-Y'));
          afteredit: function (g) {
            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
          },
          beforerender: function (g) {
            this.contextMenu = new Ext.menu.Menu({
              items: [
                {
                  text: "ค้นหาข้อมูล",
                  icon: "../images/icons/book_magnify.png",
                  handler: function (e) {
                    //                                                     Ext.loadStore("add", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "เพิ่มข้อมูล",
                  icon: "../images/icons/add.png",
                  handler: function (e) {
                    Ext.loadStore("add", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "จัดการข้อมูล View/Copy/Edit/Delete",
                  icon: "../images/icons/application_edit.png",
                  handler: function (e) {
                    Ext.loadStore("edit", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "คัดลอกข้อมูลใน copy data in cell grid",
                  icon: "../images/icons/page_copy.png",
                  handler: function (e) {
                    var arrDataCopy = ["dc_creditor_idTxt", "c_code", "f_total_amt"];
                    var rowx = Ext.selectRow;

                    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                      //if Ctlr+c
                      CopyToClipboard(rowx, arrDataCopy);
                  },
                  scope: this,
                },
              ],
            });
          },
          afterrender: function (g) {
            //g.getStore().getAt(rowIndex);
            //  console.log();

            this.on("cellclick", cellClick, this); //cellClick
            this.on(
              "contextmenu",
              function (e, grid, rowIndex, columnIndex) {
                e.stopEvent();
                this.contextMenu.showAt(e.getXY());
              },
              this
            );

            /*
                             //  Ctlr+c
                             new Ext.KeyMap(Ext.get('tabpanel1'), [{
                             key: "c",
                             ctrl: true,
                             scope: this,
                             fn: function (e, ele) {
                             ele.preventDefault();
                             var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                             var rowx = Ext.selectRow;
                             if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy)) //if Ctlr+c
                             CopyToClipboard(rowx, arrDataCopy);
                             
                             }
                             }]);
                             //end key
                             */
          },
        },
        store: Ext.storeDtl,
        columns: colmnn,
        bbar: new Ext.PagingToolbar({
          pageSize: 20,
          store: Ext.storeDtl,
          displayInfo: true,
          displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
      });
    }),
    Ext.grid.EditorGridPanel,
    {}
  );
  ///////////////// EditorGridPanel
  const search = function () {
    var msg = "";
    if (msg == "") {
      Ext.storeDtl.setBaseParam("mode", "SEARCH");
      Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
      Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
      Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
      Ext.getCmp("tabpanel1").getStore().load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  Ext.loadStore = function (status, show) {
    var statusx = status;
    var winx = show;
    if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
        return false;
      });
    else if (statusx === "load") {
    } else AppPoStore(statusx).show();

    if (statusx === "add") {
      Ext.HDR_ID = null;
    } else if (statusx === "edit") {
      //before Load
      var rec = Ext.selectRow;

      Ext.selectRow = rec;

      Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(rec);
      //After Load Trigger
      Ext.getCmp("d_due_dateMianID").fn();

      Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
      Ext.DC_CREDITOR_ID = Ext.selectRow.data.dc_creditor_id; ////i_yyyy dc_expense_budget_type_id po_expense_id

      // Ext.store3.load();

      Ext.getCmp("winChequeID").hideTabStripItem(2);
      Ext.getCmp("DISPLAY_c_name_hdr_period").setValue(Ext.selectRow.data.c_code);
      Ext.getCmp("DISPLAY_creditor_name_hdr_period").setValue(Ext.selectRow.data.dc_creditor_idTxt);
      Ext.getCmp("DISPLAY_creditor_d_doc_date_hdr_period").setValue(Ext.selectRow.data.d_due_date);
      Ext.getCmp("DISPLAY_creditor_f_total_amt_hdr_period").setValue(Ext.selectRow.data.f_total_amt);
      if (Ext.selectRow.data.i_is_po == 1) {
        Ext.Msg.alert("แจ้งเตือน", "สัญญาจะซื้อจะขาย " + Ext.selectRow.get("c_code"), function (bu, action) {
          //                    Ext.getCmp("winChequeID").hideTabStripItem(1);
          return true;
        });
      }

      if (Ext.selectRow.data.i_contract_status > 1) {
        Ext.getCmp("buSaveSubID").hide();
      }
    } //End Edit
  };
};
