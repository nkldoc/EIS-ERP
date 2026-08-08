/* global Ext, user_right_add, user_right_edit, user_right_delete */ ///
AddTor = function (record, butt) {
  Ext.DTL = null;
  if (butt == "ADD") {
    winADD(butt);
  }
  if (butt == "EDIT") {
    Ext.DTL = Ext.selectRow.get("id");
    winADD(butt);
  }
};
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
const search = function () {
  var msg = "";
  if (msg == "") {
    Ext.storeDtl.setBaseParam("mode", "LIST");
    Ext.storeDtl.setBaseParam("type", "SEARCH");
    Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter").getValue());
    Ext.storeDtl.setBaseParam("value", Ext.getCmp("value-box").getValue());
    Ext.storeDtl.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
    Ext.storeDtl.setBaseParam("dc_cost_acc_id", Ext.getCmp("s_dc_cost_acc_id").getValue());
    Ext.storeDtl.setBaseParam("dc_cost_id", Ext.getCmp("s_dc_cost_idID").getValue());
    Ext.storeDtl.setBaseParam("i_type_contract", Ext.getCmp("i_type_contract").getValue());
    Ext.storeDtl.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
    Ext.storeDtl.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
    Ext.storeDtl.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
    Ext.storeDtl.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());

    // Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
    Ext.getCmp("tabpanel1").getStore().load();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
  Ext.storeDtl.load();
};
 
let local_i = 0;

// ฟังก์ชันสำหรับคำนวณผลรวม
function sumPayments(local_i) {
    let total = 0;

    // วนลูปทุกช่องที่สร้างขึ้นมา
    for (let i = 0; i <= local_i; i++) {
        let field = Ext.getCmp("f_bg_amt[" + i + "]ID");
        if (field) {
            // อ่านค่าในช่อง และแปลงเป็นตัวเลข (จัดการกรณีช่องว่าง)
            let value = parseFloat(field.getValue()?.replace(/,/g, "") || 0);
            total += value;
        }
    }

    // เซ็ตผลรวมในช่องผลรวม
    Ext.getCmp("f_totalID").setValue(Ext.util.Format.number(total, "0,000.00"));
}



let yearsSearch = [];
yearsSearch.push({ id: "0", c_name: "- เลือกทั้งหมด -" });

let currentTime = new Date();
let now = currentTime.getFullYear() + 1;
let id = currentTime.getFullYear() - 4;

while (id <= now) {
  let c_name = id + 543;
  yearsSearch.push({ id, c_name });
  id++;
}

Ext.store_yearSearch = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: yearsSearch,
});
sp_manual = function (event) {
  const x = event.clientX;
  const y = event.clientY;

  var menu = new Ext.menu.Menu();
  if (Ext.I_SUB_STATUS == "3.00") {
    menu.add({
      text: "คู่มือการสร้าง PR",
      icon: "../images/icons/book.png",
      scope: this,
      handler: function (e) {
        window.open("manual/คู่มือการสร้างPR.pdf");
      },
    });
  }
  if (Ext.I_SUB_STATUS != "3.00") {
    menu.add({
      text: "คู่มือการสร้างPR",
      icon: "../images/icons/book.png",
      scope: this,
      handler: function (e) {
        window.open("manual/คู่มือการสร้างPR.pdf");
      },
    });
  }
  menu.showAt([x, y]);
};
function setDisabled_button(i, v, tf, arr) {
  // v1 == button
  // v2 ==
  tf == 1 ? true : false;
  if (v == 1) {
    var buttonName = "buttonBgID" + arr; // ปุ่มลบเงิน
    var button = Ext.getCmp(buttonName);
    button.setDisabled(tf);
    // var combotype_name = "dc_expense_budget_type_id[" + arr + "]";
    // console.log(combotype_name);
    // console.log(Ext.getCmp(combotype_name));
    // Ext.getCmp(combotype_name).setReadOnly(true);
  }
  if (v == 2) {
  }
}
function purchase2(id, bg_reserve_money_id, ii) {
  // console.log(id + " == " + bg_reserve_money_id + " == " + ii);
  Ext.Ajax.request({
    url: "tor/api/mnTorController.php",
    params: {
      mode: "UPDATE_TOR_BG", //UPDATE_TOR_DTL_BG
      hdr_id: id, //sp_dtl_id
      bg_reserve_money_id: bg_reserve_money_id,
      ii: ii,
    },
    method: "POST", //POST
    success: function (result, request) {
      Ext.store2.load({
        params: { id: Ext.HDR_ID },
        callback: function (records, operation, success) {},
      });
      // Ext.getCmp("winDcExpTypeDddID").getEl().unmask();
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
  // Ext.getCmp("button" + ii).disable();
}
sumtopbar = function () {
  var i = 0;
  var max = Ext.store2.data.length - 1;
  var sumtop = 0;
  var str = "";
  while (i <= max) {
    str = Ext.store2.data.items[i].data.f_total_amt;
    sumtop += parseInt(str.replace(/\,/g, ""));
    i++;
  }
  if (sumtop != 0) {
    var textsum = "<span style=' font-size: 13px; white-space: nowrap;'>ราคารวม : ";
    textsum += sumtop.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " บาท</span>";
    Ext.getCmp("sumtop").setText(textsum);
    Ext.getCmp("f_net_total_amtID").setValue(Ext.floatRenderer(sumtop));
  } else {
    Ext.getCmp("sumtop").setText("");
    Ext.getCmp("f_net_total_amtID").setValue("0.00");
  }
};
function getlink(v, i, arr) {
  return new Promise((resolve, reject) => {
    // var f_amt_sum = f_amt - cheVal;
    // var c_name_po_expense_id = getStoreItems(Ext.po_expense, po_expense_id, "c_name");
    if (i == 1) {
      i_pr_type = Ext.getCmp("i_pr_type[0]ID").getValue().inputValue;
      dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue();
    } else if (i == 2) {
      i_pr_type = Ext.getCmp("i_pr_type[1]ID").getValue().inputValue;
      dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[1]ID").getValue();
    } else {
      i_pr_type = Ext.getCmp("i_pr_type[2]ID").getValue().inputValue;
      dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[2]ID").getValue();
    }
    var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_expense_budget_type, "c_name");
    var link =
      Ext.session.IPAPIBG +
      "/?/bg/mn_BgReserveMoney/mode/POST" +
      "/i_sys/3" +
      "/pr_id/" +
      Ext.selectRow.get("id") +
      "/po_id/0" +
      "/chk_id/0" +
      "/i_year/" +
      Ext.getCmp("i_yearID").getValue() +
      "/i_pr_type/" +
      i_pr_type + //  plan or period
      "/i_reserve/1" + // step 1 PR step 2 po step3 checking
      "/dc_cost_id/" +
      Ext.getCmp("dc_cost2_idID").getValue() +
      "/dc_budget_type_id/" +
      dc_expense_budget_type +
      // Ext.selectRow.get(i_type) +
      "/bg_expense_id/" +
      Ext.getCmp("po_expense_id_ID").getValue() +
      "/i_last/1" +
      "/f_amt/" +
      v;
    // Ext.Msg.show({
    //   title: "แจ้งเตือน!",
    //   msg: "ยืนยันการจองเงิน แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n",
    //   width: 400,
    //   icon: Ext.MessageBox.QUESTION,
    //   buttons: Ext.MessageBox.YESNO,
    //   fn: function (btn, text) {
    //     if (btn === "yes") {
    Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: link,
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success) {
          setDisabled_button(i, 1, 1, arr);
          console.log(i);
          purchase2(Ext.selectRow.get("id"), jsonData.bg_reserve_money_id, i);
          resolve();
          // Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
          // var alert_text = "มีการจองเงิน PR " + "\n";
          // alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
          // alert_text += "PR : " + Ext.selectRow.data.c_code + "\n";
          // // alert_text += "Host : " + location.host + "\n";
          // alert_text += "แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n";
          // alert_text += "หมวดค่าใช้จ่าย : " + c_name_po_expense_id + "\n";
          // // alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
          // alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
          // alert_text += "ชื่อรายการ : " + Ext.selectRow.get("c_name") + "\n";
          // alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
          // alert_text += "เงินคงเหลือหลังจอง : " + floatRenderer(floatMinus(String(f_amt_sum).replace(/,/g, ""), 2)) + "\n";
          // alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
          // Ext.Ajax.request({
          //   url: Ext.session.Notif_line,
          //   method: "POST",
          //   params: {
          //     msg: alert_text,
          //     mode: 3,
          //   },
          // });
          // Ext.storeDtl.reload({
          //   callback: function (record, operation, success) {
          //     if (success) {
          // Ext.bgMode.isbook = true;
          // Ext.getCmp(Ext.poFormID).getEl().unmask();
          // Ext.getCmp("po_expense_id_ID").setReadOnly(true);
          // Ext.getCmp("i_type_bgID").setReadOnly(true);
          // // setDisabled_button(i, 2);
          // Ext.getCmp("tabpanel1").getStore().reload();
          //     }
          //   },
          // });
          // setDisabled_button(i, 2);
          // null;
          // });
        } else {
          // setDisabled_button(i, 1);
          Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
        }
      },
      failure: function (result, request) {
        // setDisabled_button(i, 1);
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
    //     } else {
    //       // setDisabled_button(i, 1);
    //       null;
    //     }
    //   },
    // });
  });
}
function genBooklink(v, i, loop) {
  return new Promise((resolve, reject) => {
    var ii = i;
    var i_type = "dc_expense_budget_type" + i + "_id";
    var dc_expense_budget_type = Ext.selectRow.get(i_type);
    var po_expense_id = Ext.selectRow.get("po_expense_id");
    var pr_type = "i_pr_type" + i;
    var i_pr_type = Ext.selectRow.get(pr_type);
    var ip = Ext.session.ip_booking; // 192
    // var i_amount_bg = Ext.getCmp("i_amount_bgID").getValue().inputValue;

    var i_yyyy = Ext.getCmp("i_yearID").getValue();
    if (i_yyyy != Ext.selectRow.get("i_yyyy")) {
      var i_yyyy = Ext.getCmp("i_yearID").getValue();
    }
    if (
      i_pr_type == null ||
      dc_expense_budget_type == null ||
      dc_expense_budget_type != Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue() ||
      Ext.selectRow.get("dc_cost_id") != Ext.getCmp("dc_cost2_idID").getValue() ||
      Ext.selectRow.get("po_expense_id") != Ext.getCmp("po_expense_id_ID").getValue()
    ) {
      var po_expense_id = Ext.getCmp("po_expense_id_ID").getValue();
      var dc_cost2_id = Ext.getCmp("dc_cost2_idID").getValue();
      var i_pr_type = null;
      if (i == 1) {
        i_pr_type = Ext.getCmp("i_pr_type[0]ID").getValue().inputValue;
        dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue();
      } else if (i == 2) {
        i_pr_type = Ext.getCmp("i_pr_type[1]ID").getValue().inputValue;
        dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[1]ID").getValue();
      } else {
        i_pr_type = Ext.getCmp("i_pr_type[2]ID").getValue().inputValue;
        dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[2]ID").getValue();
      }
      console.log(v);
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        method: "POST",
        params: {
          mode: "ConFirm_Edit_bg",
          id: Ext.selectRow.get("id"),
          type: i,
          i_pr_type: i_pr_type,
          dc_expense_budget_type: dc_expense_budget_type,
          f_total: v.replace(/,/g, "") / 1,
          buy: 1,
          i_edit_tor: 3,
          po_expense_id: po_expense_id,
          dc_cost2_id: dc_cost2_id,
          f_total_pr: Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1,
          i_yyyy: i_yyyy,
        },
        success: function (result, request) {
          Ext.storeDtl.reload({ callback: function (record, operation, success) {} });
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            // console.log(Ext.getCmp("f_bg_amt[0]ID").getValue());
            // console.log(Ext.getCmp("f_bg_amt[0]ID").getValue());
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    }
    var link =
      Ext.session.IPAPIBG +
      "/?/bg/BgBudgetAllSupplies" +
      "/i_year/" +
      i_yyyy +
      "/dc_budget_type_id/" +
      dc_expense_budget_type +
      // Ext.selectRow.get(i_type) +
      "/dc_cost_id/" +
      dc_cost2_id +
      "/bg_expense_id/" +
      po_expense_id;
    Ext.Ajax.request({
      url: link,
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
        // let jsonData = Ext.util.JSON.decode(success.responseText);
        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        // if (success) {
        Ext.getCmp(Ext.poFormID).getEl().unmask();
        // if (jsonData.totalCount > 0) {
        var f_amt = 0;
        var cheVal = v.replace(/,/g, "") / 1;
        if (i_pr_type == 1) {
          f_amt = jsonData.data[0].f_total_plan;
        } else {
          f_amt = jsonData.data[0].f_total_dtl;
        }
        let CheckMoney = {}; // ตัวแปร global เพื่อเก็บผลลัพธ์แต่ละรอบ
        let totalEnough = 0; // ตัวแปรสำหรับเก็บผลรวมของค่า enough

        let enough = 0; // เริ่มต้นค่า enough ที่ 0
        if (f_amt >= cheVal) {
          enough = 1; // หากเข้าเงื่อนไข กำหนด enough เป็น 1
          totalEnough++; // นับจำนวนเมื่อ enough เป็น 1
        }
        CheckMoney["Money"] = {
          // ใช้ i เพื่อสร้าง key ที่ไม่ซ้ำกันในแต่ละรอบ
          id: i,
          Check: enough,
          total: totalEnough,
          debug: jsonData.debug,
          f_amt: f_amt,
          f_total: cheVal,
        };
        //  return enough; // ส่งค่า enough ของรอบนั้นกลับไป
        resolve(CheckMoney);
        /* 
                 if (f_amt >= cheVal) {
                 } else {
                 // setDisabled_button(i, 1);
                 Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                 Ext.getCmp(Ext.poFormID).getEl().unmask();
                 });
                 }*/
        // } else {
        //   Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
        // }
        // },
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });

    return link;
  });
}
DeleteTor_dtl = function (record) {
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
            url: "tor/api/mnTorControllerReq.php",
            params: {
              mode: "DELETE_TOR_DTL",
              id: record.get("id"),
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store2.load({
                params: { id: Ext.HDR_ID },
                callback: function (records, operation, success) {
                  sumtopbar();
                  Ext.getCmp("tabpanelMain4ID").getForm().reset();
                  Ext.getCmp("editDtlID").setDisabled(false);
                  Ext.getCmp("modeSub2ID").setValue("ADD");
                  Ext.getCmp("tabpanelMain4ID").setTitle("ข้อมูลรายละเอียดรายการจัดซื้อ<br>&nbsp;");
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
        text: "Cancel",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};

winADD = function (butt) {
  var tabs = new Ext.FormPanel({
    labelWidth: 175,
    border: false,
    width: 1000,
    items: {
      xtype: "tabpanel",

      activeTab: 0,
      defaults: {
        autoHeight: true,
        bodyStyle: "padding:10px",
      },
      items: [
        {
          title: "รายละเอียดของที่จัดซื้อ",
          layout: "form",
          defaults: { width: 430 },
          defaultType: "textfield",
          items: [
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงิน",
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type_idTxtID",
              name: "dc_bg_budget_type_id",
              hiddenName: "dc_expense_budget_type_id",
              // hiddenName: "dc_bg_budget_type_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
              listeners: {
                render: function (combo) {
                  tooltip_ComboBox(combo, "c_name");
                },
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
              store: Ext.po_expense,
              valueField: "id",
              displayField: "c_name",
              anchor: "70%",
              submitValue: true,
              id: "po_expense_idID",
              name: "po_expense_id",
              hiddenName: "po_expense_id",
              triggerAction: "all",
              allBlank: true,
              forceSelection: true,
              selectOnFocus: true,
              fieldLabel: "รายการย่อย",
              width: 200,
              typeAhead: false,
              emptyText: "กรุณาเลือกใช้จ่าย...",
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
              xtype: "radiogroup",
              columns: [98, 110],
              fieldLabel: "ลักษณะการจ้าง",
              id: "i_hire_type2ID",
              name: "i_hire_type",
              items: [
                {
                  checked: true,
                  inputValue: 1,
                  name: "i_hire_type",
                  boxLabel: "จ้างแบบได้ของ",
                },
                {
                  inputValue: 0,
                  name: "i_hire_type",
                  boxLabel: "จ้างแบบไม่มีของ",
                },
              ], //radiogroup
              listeners: {
                change: function () {
                  if (this.getValue().inputValue == 0) {
                    Ext.getCmp("i_product_type2ID").hide();
                    Ext.getCmp("i_is_invG2ID").hide();
                  } else {
                    Ext.getCmp("i_product_type2ID").show();
                    Ext.getCmp("i_is_invG2ID").show();
                  }
                },
              },
            },
            {
              xtype: "radiogroup",
              columns: [98, 98],
              fieldLabel: "ของที่ได้มา",
              id: "i_product_type2ID",
              name: "i_product_type",
              items: [
                {
                  checked: true,
                  name: "i_product_type",
                  inputValue: 1,
                  boxLabel: "วัสดุ",
                },
                {
                  inputValue: 2,
                  name: "i_product_type",
                  boxLabel: "ครุภัณฑ์",
                },
              ], //radiogroup
              listeners: {
                change: function () {},
                afterrender: function () {
                  if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 0) {
                    Ext.getCmp("i_product_type2ID").hide();
                    Ext.getCmp("i_is_invG2ID").hide();
                  } else {
                    Ext.getCmp("i_product_type2ID").show();
                    // Ext.getCmp("i_is_invG2ID").show();
                  }
                },
              },
            },
            {
              xtype: "checkboxgroup",
              fieldLabel: "การจัดเก็บ",
              name: "i_is_inv",
              id: "i_is_invG2ID",
              hidden: true,
              items: [
                {
                  id: "i_is_invG2IDs1",
                  boxLabel: "เข้าคลัง",
                  hidden: true,
                  name: "i_is_inv",
                  // inputValue: 1,
                  listeners: {
                    afterrender: function () {
                      if (Ext.selectRow.get("i_is_inv") == true) {
                        Ext.getCmp("i_is_invG2IDs1").setValue(true);
                      }
                    },
                  },
                },
              ],
            },
            {
              fieldLabel: "ชื่อรายการ",
              id: "c_nameID",
              name: "c_name",
              allowBlank: false,
            },
            {
              fieldLabel: "จำนวน",
              xtype: "numberfield",
              id: "i_qtyID",
              name: "i_qty",
              readOnly: true,
              value: 1,
            },
            {
              fieldLabel: "ราคา/ต่อหน่วย",
              id: "f_unit_costID",
              name: "f_unit_price",
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
            new Ext.form.ComboBox({
              mode: "local",
              fieldLabel: "หน่วยนับ 2",
              submitValue: true,
              hiddenName: "dc_unit_type_id",
              id: "dc_unit_type_idID",
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
        },
      ],
    },
    buttons: [
      {
        text: "บันทึกรายการ",
        iconCls: "icon-save-edit",
        handler: function () {
          Ext.saveDTL(true);
        },
      },
      {
        text: "ยกเลิก",
        iconCls: "icon-cancel",
        handler: function () {
          // Ext.saveDTL(false);
          Ext.getCmp("win-frm-dtlID").destroy();
        },
      },
    ],
  });

  Ext.store2.load({
    callback: function (recordx, operation, success) {
      if (success) {
        var win = new Ext.Window({
          id: "win-frm-dtlID",
          layout: "fit",
          width: 1000,
          height: 400,
          //  closeAction: 'hide',
          plain: true,
          modal: true,
          items: tabs,
        });
        var rec = Ext.selectRow;
        // rec.set("c_name", null);
        if (butt == "EDIT") {
          Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
        } else if (butt == "ADD") {
          Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(Ext.selectDefault);
        }

        win.show();
        console.log(5);
        sumtopbar();
      }
    },
  });
};

Ext.saveDTL = function (type) {
  let msg = "";
  if (Ext.getCmp("dc_expense_budget_type_idTxtID").getValue() == "") {
    //    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  }
  // if (Ext.getCmp("po_expense_idID").getValue() == "") {
  //    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รายการย่อย</span><br>";
  // }
  if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == null) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ลักษณะการจ้าง</span><br>";
  } else if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 1) {
    if (Ext.getCmp("i_product_type2ID").items.items[0].checked == false && Ext.getCmp("i_product_type2ID").items.items[1].checked == false) {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ของที่ได้มา</span><br>";
    }
  }
  if (Ext.getCmp("c_nameID").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อรายการ</span><br>";
  }
  if (Ext.getCmp("i_qtyID").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวน</span><br>";
  }
  /*if (Ext.getCmp("f_bg_peroidID").getValue() == "0" || Ext.getCmp("f_bg_peroidID").getValue() == "0.00" || Ext.getCmp("f_bg_peroidID").getValue() == "") {
     msg += "<span style='white-space: nowrap;'>- กรุณาตรวจสอบเงินตางวดตามแหล่งเงิน</span><br>";
     }*/ //จองเงิน

  if (Ext.getCmp("dc_unit_type_idID").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยนับ</span><br>";
  }

  if (msg == "") {
    if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 1) {
      i_product_type = Ext.getCmp("i_product_type2ID").getValue().inputValue;
    } else {
      i_product_type = null;
    }
    // console.log(i_product_type);
    // return false
    //   Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    var dtl_id = "";
    if (type == "EDIT_DTL") {
      dtl_id = Ext.getCmp("sp_tor_dtl_idID").getValue();
    }
    Ext.Ajax.request({
      url: "tor/api/mnTorControllerReq.php",
      method: "POST",
      params: {
        mode: "UP_SP_TOR_DTL",
        id: Ext.HDR_ID,
        dtl_id: dtl_id,
        dc_expense_budget_type_idTxtID: Ext.getCmp("dc_expense_budget_type_idTxtID").getValue(),
        po_expense_idID: Ext.getCmp("po_expense_idID").getValue(),
        i_hire_type2ID: Ext.getCmp("i_hire_type2ID").getValue().inputValue,
        i_product_type2ID: i_product_type,
        i_is_invG2ID: Ext.getCmp("i_is_invG2IDs1").getValue() == true ? 1 : "",
        c_nameID: Ext.getCmp("c_nameID").getValue(),
        f_unit_costID: Ext.getCmp("f_unit_costID").getValue() == "" ? 0 : Ext.getCmp("f_unit_costID").getValue().replace(/,/g, ""),
        i_qtyID: Ext.getCmp("i_qtyID").getValue(),
        dc_unit_type_idID: Ext.getCmp("dc_unit_type_idID").getValue(),
        //-----------------------------------//
        //f_bg_peroid: Ext.getCmp("f_bg_peroidID").getValue(),      จองเงิน
        //                f_net_total_amt: Ext.getCmp("f_net_total_amtID").getValue(),
        inv_mode_idID: 0, //Ext.getCmp("inv_mode_idID").getValue(),
        am_mode_idID: 0, // Ext.getCmp("am_mode_idID").getValue(),
        //  sp_bg_mode_id: Ext.getCmp("sp_bg_mode_idID").getValue(),จองเงิน
        /*                        Ext.getCmp("am_mode_idID").setValue(record.data.am_mode_id);
                 Ext.getCmp("inv_mode_idID").setValue(record.data.inv_mode_id);
                 Ext.getCmp("sp_bg_mode_idID").setValue(record.data.sp_bg_mode_id);
                 Ext.getCmp("f_bg_peroidID").setValue('0.00');*/
        //-----------------------------------
      },
      success: function (result, request) {
        // Ext.getCmp("win-frm-dtlID").destroy();
        Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
        Ext.store2.load({
          callback: function (recordx, operation, success) {
            if (success) {
              Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
              sumtopbar();
              if (type == "SAVE_DTL") {
                var inputEl = Ext.getCmp("gridSub5ID").getView().scroller.dom;
                inputEl.scrollTop = inputEl.scrollHeight;
              }
            }
          },
        });
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDTL
Ext.AppUx = function (app, menu) {
  //    console.log(Ext.session)
  Ext.HDR_ID = null;
  Ext.selectRow = [];
  Ext.menuEditGrid = true;
  Ext.menuRightEditgrid = true;
  Ext.costID = 97; //หน่วยงานผู้รับผิดชอบ พัสดุ
  Ext.cost2ID = Ext.session.dc_cost_id; //หน่วยงานผู้รับผิดชอบ พัสดุ
  Ext.menuCode = "ST0001";
  Ext.dcCostFix = false; //38
  Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
  Ext.i_is_more = 0;
  Ext.tor_type_idTxt = Ext.apply({
    tor_type_id1: {
      0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
      1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)",
    },
  });

  //senMsg
  Ext.senMsgToProcure = (msgType, msg, cost_id) => {
    Ext.Ajax.request({
      url: "https://eis.vajira.ac.th:8443/procure/websocket/event",
      params: {
        msgType: msgType, //msgType msg dc_cost_id
        msg: msg,
        dc_cost_id: cost_id,
      },
      method: "GET", //GET
      success: function (result, request) {},
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  };

  Ext.status = Ext.apply({
    name: menu,
    process: function (menuCode, record) {
      Ext.msgSentProcure = "มีรายการซื้อ/จ้างจากหน่วยงาน เลขหนังสืออ้างอิง " + record.get("d_doc_ref") + " เลขที่ PR  " + record.get("c_code");

      Ext.Ajax.request({
        url: "tor/api/mnTorControllerReq.php",
        params: {
          mode: "UPSTATUS",
          menuCode: menuCode,
          tor_status_id: record.get("tor_status_id"),
          id: record.get("id"),
        },
        method: "POST", //GET
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            Ext.MessageBox.alert("Success", jsonData.msg, function () {
              Ext.getCmp("tabpanel1").getStore().reload();
              Ext.senMsgToProcure(2, Ext.msgSentProcure, Ext.session.dc_cost_id);
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
  Ext.buAct = null;
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
  function cellClick(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);
    Ext.selectRow = record;
    if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
      if (Ext.selectRow.data.i_is_upload == 0) {
        Ext.MessageBox.alert("แจ้งเตือน", "กรุณาอัพโหลดเอกสารก่อนผ่านรายการ");
        return;
      } else {
        controller(Ext.selectRow, "processUpdate"); //on
      }
    }
    if (columnIndex === grid.getColumnModel().getIndexById("c_name_statusID")){
      if(Ext.selectRow.data.tor_status_id == 21 ){
        Ext.sp_tor_id = Ext.selectRow.data.id;
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"));
        let PanelDtl = new formPanelDtl(0,Ext.selectRow.data);
        console.log(Ext.selectRow);
        Ext.getCmp("contenterCenter").add(PanelDtl);
        Ext.getCmp("contenterCenter").add(PanelDtl);
        Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
        Ext.storePerDtl.load({
          params: { id: Ext.selectRow.data.id 
                    , sp_tor_contract : Ext.selectRow.data.sp_contract_id 
                  },
          callback: function () {
            var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
            var row = 0;
            while (num >= row) {
              var record = Ext.storePerDtl.getAt(row);
              record.set("i_checked_primary", 0);
              record.set("i_checked", 0);
              record.commit();
              row++;
            }
            Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
            Ext.getCmp("gridEditor").getColumnModel().setHidden(2, true);
          },
        });
      }
      
    }
    if (columnIndex === grid.getColumnModel().getIndexById("pr_check_pdfID")) {
      if (Ext.selectRow.data.i_is_upload == 1) {
        var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/eis/upload_eis_pr/";
        if (Ext.isEmpty(Ext.selectRow)) Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
        window.open(linkDownload + Ext.selectRow.get("c_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "_blank", 'fullscreen="yes"');
      } else {
        if (Ext.selectRow.data.c_code == null) {
          Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
        } else {
          var ttb = tab2();
          Ext.getCmp("contenterCenter").add(ttb);
          Ext.getCmp("contenterCenter").setActiveTab(ttb);
        }
      }
    }
    if (columnIndex === grid.getColumnModel().getIndexById("edit")) {
      AddTor(record, "EDIT");
    }
    if (columnIndex === grid.getColumnModel().getIndexById("delete")) {
      DeleteTor_dtl(record);
    }
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
        no: "ไม่",
      }; //Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
      if (rec.get("tor_status_id") != null) {
        Ext.Msg.alert(
          "แจ้งเตือน",
          "" +
            (Ext.isEmpty(rec.get("c_code")) ? "รหัส PR ยังไม่ถูกสร้าง" : "") +
            (rec.get("tor_status_id") > 0 ? "ผ่านรายการเรียบร้อยแล้ว สถานะเมนู <b>" + rec.get("c_name_status") + " - " + rec.get("c_code_status") + "</b>" : ""),
          function (bu, action) {
            return false;
          }
        );
      } else {
        if (rec.get("c_code") != null)
          Ext.Msg.show({
            title: "ประมวลผลรายการ",
            msg: "คุณต้องการผ่านรายการ " + rec.get("c_code") + " สถานะเมนู " + Ext.menuCode + " ?",
            width: 440,
            icon: Ext.MessageBox.QUESTION,
            buttons: Ext.MessageBox.YESNO,
            fn: function (btn) {
              if (btn === "yes") Ext.status.process(Ext.menuCode, rec);
              else null;
            },
          });
      }
    }
  } // Controller
  //AutoLoad
  Ext.torType = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_spAlert.php",
    baseParams: { type: "sp_type_status", i_is_type_tor: true },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  //    Ext.torItems = new Ext.data.JsonStore({
  //        autoDestroy: false,
  //        autoLoad: true,
  //        url: "api/All_spAlert.php",
  //        baseParams: {type: "sp_type_id"},
  //        root: "data",
  //        idProperty: "id",
  //        fields: ["id", "c_name"],
  //    });
  Ext.sub_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_spAlert.php",
    baseParams: { type: "sub_cost_id" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
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
      c_code_sys: Ext.C_CODE_SYS,
      all: "all"
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("s_dc_cost_idID").setValue("0");
      },
    },
  });
  Ext.dc_cost_sys_main_all = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: { type: "dc_cost_sys_main", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
    root: "data",
    idProperty: "id",
    fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("s_dc_cost_acc_id").setValue("0");
      },
    },
  });
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
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type_cost",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "c_bg_type", "i_bg_type"],
  });
  Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_poWorking.php",
    baseParams: { type: "dc_expense_budget_type", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
      },
    },
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
  Ext.dc_cost_sys_main = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: { type: "dc_cost_sys_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
    root: "data",
    idProperty: "id",
    fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
    listeners: {
      // load: function (t, records, options) {

      // },
    },
  });
  Ext.dc_cost_main = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: { type: "dc_cost_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
    root: "data",
    idProperty: "id",
    fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
    listeners: {
      load: function (t, records, options) {
        // console.log(records.length);
        if(records.length  > 1 && Ext.session.dc_center_user != 1 ){
          Ext.cost_main =  Ext.dc_cost_main
          var record = records.filter((record) => record.get("i_main") == 1);
          if (record.length === 0) record = records;
          Ext.dc_cost_acc_default = record[0].data.id;
          Ext.dc_cost_main_default = record[0].data.dc_cost_main_id;
          Ext.dc_cost_main_default_c_name = record[0].data.c_name;
          Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
          Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
        } else {
          Ext.cost_main =  Ext.dc_cost                  
          Ext.dc_cost_main_default = Ext.session.dc_cost_id;
        }
        // console.log(Ext.cost_main.baseParams.type);
        // Ext.dc_user_approve.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      },
    },
  });
  Ext.i_type_bg = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_spAlert.php",
    baseParams: { type: "sp_type_bg", i_type_bg: false },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
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
  /*
     "i_step" => intval($row["i_step"]),
     "i_forword" => intval($row["i_forword"]),
     "i_backword" => intval($row["i_backword"]),
     */
     Ext.storePerDtl = new Ext.data.JsonStore({
      autoDestroy: false,
      autoLoad: false,
      url: "tor/api/mnTorControllerReq.php",
      baseParams: {
        mode: "sp_Per_dtl",
        i_type: 0,
      },
      root: "data",
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        {
          name: "no",
        },
        {
          name: "id",
        },
        { name : "row",},    
        { name : "i_period",},    
        { name : "pr_code",},    
        { name : "c_name",},    
        { name : "d_doc_date",},    
        { name : "d_due_date",},    
        { name : "d_arrive_date",},    
        { name : "d_checking_date",},    
        { name : "dc_department",},    
        { name : "stats_period",},    
        { name : "c_code",},    
        { name : "stats_con",},    
        { name : "dc_expense_budget_type",},    
        { name : "dc_expense_budget_type_id",},    
        { name : "bg_expense",},    
        { name : "po_expense_id",},    
        { name : "dc_creditor_name",},    
        { name : "c_tax_number_imp",},    
        { name : "f_total_amt",},    
        { name : "f_type_amt",},    
        { name : "f_period",},    
        { name : "sp_emp",},    
        { name : "f_chk",},    
        { name : "c_arrive_code",},    
        { name : "c_code_chk",},    
        { name : "c_code_bl",},    
        { name : "c_code_d",},    
        { name : "d_doc_billing",},    
        { name : "d_po_working_hdr",},    
        { name : "c_file_pdf_hdr",},    
        { name : "c_file_pdf_dtl",},    
        { name : "i_is_url_pdf_hdr",},    
        { name : "i_is_url_pdf_dtl",},    
      ]
    });
  Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/mnTorControllerReq.php",
    baseParams: {
      type: "sp_working_dtl",
      mode: "LIST",
      i_type: 0,
      C_CODE_SYS :Ext.C_CODE_SYS ,
      i_read : user_right_read 
    },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      {
        name: "no",
      },
      {
        name: "id",
      },
      {
        name: "i_owner_bg",
      },
      {
        name: "i_type_bg",
      },
      {
        name: "i_type_bgProject",
      },
      {
        name: "i_type_bgTxt",
      },
      {
        name: "i_step",
      },
      {
        name: "upload",
      },
      {
        name: "sp_contract_id",
      },
      {
        name: "i_edit",
      },
      {
        name: "i_is_upload",
      },
      {
        name: "txtsub_cost",
      },
      {
        name: "i_forword",
      },
      {
        name: "i_backword",
      },
      {
        name: "c_codeStatus",
      },
      {
        name: "c_code",
      },
      {
        name: "bg_budget_dtl_project_id",
      },
      {
        name: "c_budget_dtl_project",
      },
      {
        name: "c_name",
      },
      {
        name: "c_code_status",
      },
      {
        name: "c_name_status", //
      },
      {
        name: "c_tor_type",
      },
      {
        name: "tor_status_id",
      },
      {
        name: "tor_type_id",
      },
      {
        name: "c_purchase",
      },
      {
        name: "i_purchase", //i_product_type	i_hire_type	i_is_inv
      },
      {
        name: "i_product_type",
      },
      {
        name: "i_type_bg",
      },
      {
        name: "sp_type_id",
      },
      {
        name: "i_hire_type",
      },
      {
        name: "i_is_inv",
      },
      {
        name: "i_type_fix_rate",
      },
      {
        name: "i_delivery_date",
      },
      {
        name: "d_tor_date", //
      },
      {
        name: "i_parent", //d_tor_date
      },
      {
        name: "i_is_more",
      },
      {
        name: "i_is_rename",
      },
      {
        name: "i_is_parent",
      },
      {
        name: "f_total_amt",
      },
      {
        name: "f_type_amt",
      },
      {
        name: "f_type_amt0",
      },
      {
        name: "f_type_amt1",
      },
      {
        name: "f_type_amt2",
      },
      {
        name: "dc_cost_id",
      },
      {
        name: "dc_cost2_id",
      },
      {
        name: "tag",
      },
      {
        name: "dc_cost_idTxt",
      },
      {
        name: "dc_cost2_idTxt",
      },
      {
        name: "i_yyyy",
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
        name: "d_doc_ref",
      },
      {
        name: "dc_expense_budget_type_id",
      },
      {
        name: "dc_expense_budget_type_id0",
      },
      {
        name: "dc_expense_budget_type_id1",
      },
      {
        name: "dc_expense_budget_type_id2",
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
        name: "i_enabled",
      },
      {
        name: "c_comment",
      },
      {
        name: "c_remake",
      },
      {
        name: "po_creditor_id",
      },
      {
        name: "po_creditor_idTxt",
      },
      {
        name: "d_doc_date",
      },
      {
        name: "start_date",
      },
      {
        name: "index_receive",
      },
      {
        name: "end_date",
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
        name: "bg_reserve_money1_id",
      },
      {
        name: "bg_reserve_money2_id",
      },
      {
        name: "bg_reserve_money3_id",
      },
      {
        naame:"dc_create_cost_id"
      },
      {
        name :"code"
      },
      {
        name :"c_tax_number_imp"
      },
      {
        name :"dc_creditor_name"
      },
      {
        name :"f_total_contract"
      },
      {
        name :"d_doc_content"
      },
      {
        name :"d_start_content"
      },
      {
        name :"d_due_content"
      },
      {
        name: "stats_con"
      },
    ],
  });
  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: Ext.yearTh(),
  });
  Ext.keyData = 1; //type data key in
  Ext.title = "รายการ PR ";
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
  //    console.log(' >>> ' + Ext.getDate.getNowCarlen());
  //    console.log(' >>> ' + Ext.getDate.defaultDate());
  //interlizing
  Ext.loadStore = function (status, show) {
    var statusx = status;
    console.log(statusx);
    if (statusx == "add") {
      Ext.store_month = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: [
          { id: "10", c_name: "ต.ค. " + (new Date().getFullYear() + 543 - 1) },
          { id: "11", c_name: "พ.ย. " + (new Date().getFullYear() + 543 - 1) },
          { id: "12", c_name: "ธ.ค. " + (new Date().getFullYear() + 543 - 1) },
          { id: "01", c_name: "ม.ค. " + (new Date().getFullYear() + 543) },
          { id: "02", c_name: "ก.พ. " + (new Date().getFullYear() + 543) },
          { id: "03", c_name: "มี.ค. " + (new Date().getFullYear() + 543) },
          { id: "04", c_name: "เม.ย. " + (new Date().getFullYear() + 543) },
          { id: "05", c_name: "พ.ค. " + (new Date().getFullYear() + 543) },
          { id: "06", c_name: "มิ.ย. " + (new Date().getFullYear() + 543) },
          { id: "07", c_name: "ก.ค. " + (new Date().getFullYear() + 543) },
          { id: "08", c_name: "ส.ค. " + (new Date().getFullYear() + 543) },
          { id: "09", c_name: "ก.ย. " + (new Date().getFullYear() + 543) },
        ],
      });
    } else if (statusx == "edit") {
      Ext.store_month = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: [
          // { id: "00", c_name: "- ทั้งหมด -" },
          { id: "10", c_name: "ต.ค. " + (Ext.selectRow.get("i_yyyy") - 1 + 543) },
          { id: "11", c_name: "พ.ย. " + (Ext.selectRow.get("i_yyyy") - 1 + 543) },
          { id: "12", c_name: "ธ.ค. " + (Ext.selectRow.get("i_yyyy") - 1 + 543) },
          { id: "01", c_name: "ม.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "02", c_name: "ก.พ. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "03", c_name: "มี.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "04", c_name: "เม.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "05", c_name: "พ.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "06", c_name: "มิ.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "07", c_name: "ก.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "08", c_name: "ส.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
          { id: "09", c_name: "ก.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543) },
        ],
      });
    }

    var winx = show;
    if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
        return false;
      });
    else if (statusx == "add") {
      Ext.HDR_ID = null;
      Ext.selectRow = null;
      Ext.i_is_more = 0;
      var winApp = AppPoStore(statusx);
      winApp.show();
      Ext.getCmp("winChequeID").hideTabStripItem(1);
    } else if (statusx === "edit") {
      Ext.HDR_ID = Ext.selectRow.data.id;
      Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
      Ext.i_is_more = Ext.selectRow.data.i_is_more;

      if (!Ext.selectRow.get("po_expense_id")) Ext.selectRow.set("po_expense_id", null);
      if (!Ext.selectRow.get("po_creditor_id")) Ext.selectRow.set("po_creditor_id", null);
      if (!Ext.selectRow.get("dc_expense_budget_type_id")) Ext.selectRow.set("dc_expense_budget_type_id", null);
      if (!Ext.selectRow.get("bg_budget_dtl_project_id")) Ext.selectRow.set("bg_budget_dtl_project_id", null);
      if (!Ext.selectRow.get("dc_department_id")) Ext.selectRow.set("dc_department_id", null);
      if (!Ext.selectRow.get("dc_cost_id")) Ext.selectRow.set("dc_cost_id", null);
      if (!Ext.selectRow.get("dc_cost2_id")) Ext.selectRow.set("dc_cost2_id", null);
      if (!Ext.selectRow.get("tor_type_id")) Ext.selectRow.set("tor_type_id", null);
      if (!Ext.selectRow.get("c_comment")) Ext.selectRow.set("c_comment", null);

      var winApp = AppPoStore(statusx);
      Ext.ar_pr_about = [];
      Ext.i_pr_about = 1;
      //            alert(Ext.selectRow.get("dc_expense_budget_type_id0"));
      Ext.selectRow.set("dc_expense_budget_type_idTxt[0]", Ext.selectRow.get("dc_expense_budget_type_id0"));
      Ext.selectRow.set("dc_expense_budget_type_idTxt[1]", Ext.selectRow.get("dc_expense_budget_type_id1"));
      Ext.selectRow.set("dc_expense_budget_type_idTxt[2]", Ext.selectRow.get("dc_expense_budget_type_id2"));

      Ext.selectRow.set("i_pr_type[0]", Ext.selectRow.get("i_pr_type1"));
      Ext.selectRow.set("i_pr_type[1]", Ext.selectRow.get("i_pr_type2"));
      Ext.selectRow.set("i_pr_type[2]", Ext.selectRow.get("i_pr_type3"));

      Ext.selectRow.set("f_bg_amt[0]", Ext.selectRow.get("f_type_amt0"));
      Ext.selectRow.set("f_bg_amt[1]", Ext.selectRow.get("f_type_amt1"));
      Ext.selectRow.set("f_bg_amt[2]", Ext.selectRow.get("f_type_amt2"));

      Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
      winApp.show();
      // ส่งรายการแล้วจะอัพเดทไม่ได้
      if (Ext.selectRow.get("tor_status_id") > 0) {
        Ext.getCmp("updateBuID").hide();
        //                Ext.getCmp("saveDtlID").hide();
        Ext.getCmp("modesubdelID").hide();
      } else {
        Ext.getCmp("updateBuID").show();
        //                Ext.getCmp("saveDtlID").show();
        Ext.getCmp("modesubdelID").show();
      }
      // if (Ext.selectRow.get('i_type_bg') == 3) {
      // }

      // if (Ext.selectRow.get("i_edit") > 0) Ext.Msg.alert("รายการที่ส่งแก้ไข", Ext.selectRow.get("c_comment"), function (form, action) {});
      if (Ext.selectRow.get("i_edit") == 2) {
        Ext.getCmp("modeaftereditID").show();
        Ext.getCmp("reasonID").show();
        Ext.getCmp("reasonID").setValue(Ext.selectRow.get("c_comment"));
        Ext.getCmp("menuCodeID").setValue("ST0003");
        Ext.getCmp("i_backwordID").setValue(1);
        Ext.getCmp("menubackID").setValue(4);

        //                Ext.getCmp("tor_status_idID").setValue(0);
      }
      //
      if ((Ext.selectRow.get("i_enabled") == 1 && Ext.selectRow.get("c_code") == "") || Ext.isEmpty(Ext.selectRow.get("c_code"))) {
        Ext.getCmp("GENCODEPRID").show();
        // Ext.getCmp("modesubdelID").show();
      } else {
        Ext.getCmp("GENCODEPRID").hide();
        // Ext.getCmp("modesubdelID").hide();
      }

      Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
      Ext.store2.load({
        callback: function (recordx, operation, success) {
          if (success) {
            if (Ext.store2.data.length == 0) {
              Ext.getCmp("winMain").items.items[0].items.items[1].items.items[0].getForm().loadRecord(Ext.selectDefault);
            }
          }
        },
      });
    }
  };

  var AppPoStore = function (statuss) {
    // if(statuss == 'edit'){
    //   if(Ext.selectRow.json.dc_cost2_id != Ext.session.dc_cost_id && Ext.session.user_id != 1   ){
    //     Ext.Msg.alert("แจ้งเตือน","หน่วยงานเจ้าของเรื่องไม่ตรงกันไม่สามารถเปิดรายการเพื่อแก้ไขได้")
    //     return false ;
    //   };
    // }
    var comboCost2 = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.cost_main, //Ext.dc_cost_sys_main  dc_cost
      anchor: "70%",
      value: Ext.dc_cost_main_default,
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
        render: function (combo) {
          tooltip_ComboBox(combo, "c_name");
        },
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
    });
    var comboCost = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.dc_cost,
      anchor: "50%",
      value: Ext.costID,
      hidden: true,
      fieldLabel: "หน่วยงานที่รับผิดชอบ",
      id: "dc_cost_idID",
      readOnly: true,
      valueField: "id",
      displayField: "c_name",
      hiddenName: "dc_cost_id",
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
    });

    var comboUsedBgYear = new Ext.form.ComboBox({
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
        select: function () {
          var i_year = Ext.getCmp("i_yearID").getValue() + 543;
          Ext.store_month = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            data: [
              // { id: "00", c_name: "- ทั้งหมด -" },
              { id: "10", c_name: "ต.ค. " + (i_year - 1) },
              { id: "11", c_name: "พ.ย. " + (i_year - 1) },
              { id: "12", c_name: "ธ.ค. " + (i_year - 1) },
              { id: "01", c_name: "ม.ค. " + i_year },
              { id: "02", c_name: "ก.พ. " + i_year },
              { id: "03", c_name: "มี.ค. " + i_year },
              { id: "04", c_name: "เม.ย. " + i_year },
              { id: "05", c_name: "พ.ค. " + i_year },
              { id: "06", c_name: "มิ.ย. " + i_year },
              { id: "07", c_name: "ก.ค. " + i_year },
              { id: "08", c_name: "ส.ค. " + i_year },
              { id: "09", c_name: "ก.ย. " + i_year },
            ],
          });
          Ext.getCmp("mm_startID").bindStore(Ext.store_month);
          // Ext.getCmp("mm_end").bindStore(Ext.store_month);
          Ext.getCmp("mm_startID").setValue(Ext.getCmp("mm_startID").getValue());
          // Ext.getCmp("mm_end").setValue(Ext.getCmp("mm_end").getValue());
        },
      },
    });
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

    var comboExpense = new Ext.form.ComboBox({
      mode: "local",
      store: expense_expire,
      valueField: "id",
      displayField: "c_name",
      anchor: "50%",
      submitValue: true,
      name: "c_detail",
      id: "po_expense_id_ID",
      hiddenName: "po_expense_id",
      triggerAction: "all",
      allBlank: true,
      forceSelection: true,
      selectOnFocus: true,
      fieldLabel: "ค่าใช้จ่าย",
      width: 200,
      typeAhead: false,
      emptyText: "กรุณาเลือกค่าใช้จ่าย...",
      // validator: function (val) {
      //   if (!Ext.isEmpty(val)) {
      //     return true;
      //   } else {
      //     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
      //   }
      // },
      listeners: {
        render: function (combo) {
          tooltip_ComboBox(combo, "c_name");
        },
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
    });

    var statusx = statuss;

    if (statusx == "add") {
      Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }

    Ext.store2 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorControllerReq.php",
      root: "data",
      baseParams: { mode: "LISTDTL", i_read: user_right_read }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "c_code", type: "string" },
        { name: "c_name", type: "string" },
        { name: "dc_expense_budget_type_id" },
        { name: "po_expense_id" },
        { name: "i_hire_type" },
        { name: "i_is_inv" },
        { name: "i_product_type" },
        { name: "dc_unit_type_id" },
        { name: "dc_unit_name", type: "string" },
        { name: "i_qty" },
        { name: "f_unit_price" },
        { name: "f_net_total_price" },
        { name: "f_total_amt" }, //inv_mode_id am_mode_id sp_bg_mode_id  f_peroid_amt
        { name: "inv_mode_id" },
        { name: "am_mode_id" },
        { name: "sp_bg_mode_id" },
        { name: "f_peroid_amt" },
        { name: "c_comment_product", type: "string" },
        { name: "c_comment_asset", type: "string" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
        { name: "index_receive" },
      ],
    });
    Ext.storePopMainPr = new Ext.data.JsonStore({
      autoLoad: true,
      storeId: "myStoreCost",
      url: "./api/All.php",
      baseParams: { type: "storeSpMainPR" },
      root: "data",
      idProperty: "id",
      totalProperty: "totalCount",
      fields: ["no", "id", "c_code", "c_name", "dc_expense_budget_type_id", "po_expense_id", "dc_cost_id", "dc_cost2_id", "i_purchase", "tor_type_id", "i_hire_type", "i_product_type", "d_doc_ref"],
    });
    Ext.ColumGridPop = [
      { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
      { header: "รหัส", sortable: true, dataIndex: "c_code" },
      {
        header: "ชื่อโครงการต่อเนื่อง",
        sortable: true,
        id: "c_name",
        dataIndex: "c_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='cursor:pointer';";
          return value;
        },
      },
    ];
    Ext.PopMainPr = new Ext.ux.Poplov({
      text: "PR โครงการต่อเนื่อง",
      id: "sp_tor_idID", //go to relation
      iconCls: "page_magnify",
      valueHidden: "sp_tor_id", //go to hidden
      store: Ext.storePopMainPr,
      headerGrid: Ext.ColumGridPop,
      widthText: 280,
      fieldLabel: "PR โครงการต่อเนื่อง",
      isCellClickGrid: true,
      cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "sp_tor_idID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);
        var TextShow = record.data.c_code + " " + record.data.c_name;

        Ext.getCmp(id).setValue(record.data.id);
        Ext.getCmp(nameID).setValue(TextShow);
        //  alert(TextShow);

        Ext.getCmp("c_nameMainID").setValue(record.data.c_name);
        // alert (record.data.dc_expense_budget_type_id) ;
        Ext.getCmp("dc_expense_budget_type_idID").setValue(record.data.dc_expense_budget_type_id);
        Ext.getCmp("po_expense_id_ID").setValue(record.data.po_expense_id);
        Ext.getCmp("dc_cost_idID").setValue(record.data.dc_cost_id);
        Ext.getCmp("dc_cost2_idID").setValue(record.data.dc_cost2_id);
        Ext.getCmp("i_purchaseID").setValue(record.data.i_purchase);
        Ext.getCmp("tor_type_idID").setValue(record.data.tor_type_id);
        Ext.getCmp("i_hire_typeID").setValue(record.data.i_hire_type);
        Ext.getCmp("i_product_typeID").setValue(record.data.i_product_type);
        //  Ext.getCmp('d_doc_refID').setValue(record.data.d_doc_ref);
        // Ext.getCmp('').setValue(record.data.c_name); // Ext.getCmp('').setValue(record.data.i_hire_type);
        // Ext.getCmp('').setValue(record.data.c_name);

        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
      },
      // listeners   : {'render' : function(p){ this.hide(); } }
    });

    var disp = false ? "displayfield" : "textfield";

    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
      Ext.getCmp("winChequeID").destroy();
    }

    return new Ext.Window({
      collapsible: true,
      maximizable: true,
      title: "บันทึก PR",
      // maximized: true,
      id: "winMain",
      width: Ext.getCmp("contenterCenter").getWidth() - 5,
      height: Ext.getCmp("contenterCenter").getHeight() - 5,
      minWidth: 900,
      minHeight: 564,
      layout: "fit",
      modal: true,
      plain: true,
      bodyStyle: "padding:1px;",
      buttonAlign: "center",
      listeners: {
        //WindowResize
        beforerender: function () {
          this.onWindowResize = function () {
            // console.log("ok");
            // Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
          };
        },
        afterrender: function () {
          if(statuss == 'edit' && Ext.cost_main.baseParams.type == 'dc_cost'){ 
            Ext.cost_main = Ext.dc_cost;
          }
          // console.log(Ext.selectRow.data.c_code);
          if (statusx == "edit") {
            if(Ext.cost_main.baseParams.type == 'dc_cost' && Ext.session.dc_center_user != 1 && Ext.selectRow.data.c_code != null   ){
              Ext.getCmp("dc_cost2_idID").setReadOnly(true); 
            } 
            if (Ext.selectRow.data.tor_status_id > 0) {
              Ext.getCmp("buSaveSubID").hide();
            }
            if(Ext.selectRow.data.c_code != null ){
              Ext.getCmp("i_type_bgID").setReadOnly(true);

            }
            if (Ext.selectRow.data.bg_reserve_money1_id > 0) {
              Ext.getCmp("po_expense_id_ID").setReadOnly(true);
              Ext.getCmp("i_pr_type[0]ID").setDisabled(true);
              Ext.getCmp("f_bg_amt[0]ID").setReadOnly(true);
              Ext.getCmp("f_totalID").setReadOnly(true);
              Ext.getCmp("dc_cost2_idID").setReadOnly(true);
              Ext.getCmp("i_yearID").setReadOnly(true);
              Ext.getCmp("dc_expense_budget_type_id[0]ID").setReadOnly(true);
            }
            if (Ext.selectRow.data.bg_reserve_money2_id > 0) {
              Ext.getCmp("dc_expense_budget_type_id[1]ID").setReadOnly(true);
              Ext.getCmp("f_bg_amt[1]ID").setReadOnly(true);
              Ext.getCmp("buttonBgID1").setDisabled(true);
              Ext.getCmp("i_pr_type[1]ID").setDisabled(true);
            }
            if (Ext.selectRow.data.bg_reserve_money3_id > 0) {
              Ext.getCmp("i_pr_type[2]ID").setDisabled(true);
              Ext.getCmp("f_bg_amt[2]ID").setReadOnly(true);
              Ext.getCmp("buttonBgID2").setDisabled(true);
              Ext.getCmp("dc_expense_budget_type_id[2]ID").setReadOnly(true);
            }
          }
          if (statusx == "add") {
            // console.log(Ext.getCmp("dc_cost2_idID"));
            if(Ext.cost_main.baseParams.type == 'dc_cost' && Ext.session.dc_center_user != 1 ){
              Ext.getCmp("dc_cost2_idID").setReadOnly(true); 
            } 
            Ext.getCmp("GENCODEPRID").hide();
          }
          // Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
          Ext.getCmp("winMain").on("resize", this.onWindowResize, this);
        },
      },
      items: [
        {
          xtype: "tabpanel",
          activeTab: 0,
          id: "winChequeID",
          // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
          listeners: {
            activate: function (obj) {
              console.log(obj);
            },
            beforeshow: function (obj) {
              console.log(obj);
            },
          },
          items: [
            new Ext.FormPanel({
              id: Ext.poFormID,
              columnWidth: 1,
              title: "ข้อมูลรายละเอียด PR",
              url: "tor/api/mnTorControllerReq.php",
              //                            fileUpload: true,
              frame: true,
              autoScroll: true,
              labelAlign: "left",
              bodyStyle: "padding:1px",
              labelWidth: 120,
              width: 1000,
              items: [
                {
                  layout: "column",
                  border: false,
                  items: [
                    {
                      columnWidth: 0.9,
                      layout: "form",
                      id: "contenerFormID",
                      border: true,
                      items: [
                        {
                          xtype: "hidden",
                          name: "id",
                          value: 0,
                          id: "torHdrID",
                        },
                        {
                          xtype: "hidden",
                          name: "i_dtl_add",
                          id: "i_dtl_addID",
                          value: 0,
                        },
                        {
                          xtype: "hidden",
                          name: "bg_reserve_money1_id",
                          id: "bg_reserve_money1_idID",
                          value: 0,
                        },
                        {
                          xtype: "hidden",
                          name: "c_comment",
                          value: "รายละเอียดต่างๆ",
                        },
                        new Ext.form.ComboBox({
                          mode: "local",
                          store: Ext.i_type_bg,
                          anchor: "35%",
                          fieldLabel: "ประเภท PR",
                          submitValue: true,
                          value: 1,
                          hiddenName: "i_type_bg",
                          name: "i_type_c_name_bg",
                          id: "i_type_bgID",
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          typeAhead: false,
                          emptyText: "กรุณาเลือก",
                          validator: function (val) {
                            if (!Ext.isEmpty(val)) {
                              return true;
                            } else {
                              return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                            }
                          },
                          listeners: {
                            beforerender: function () {
                              this.fnWinFind = function (i) {
                                let wf = new Ext.Window({
                                  title: "ข้อมูลที่มีอยู่แล้วในระบบ " + i,
                                  id: "fit-" + i,
                                  maximizable: true,
                                  modal: true,
                                  layout: "fit",
                                  width: 640,
                                  height: 300,
                                  items: [
                                    {
                                      xtype: "grid",
                                      layout: "fit",
                                      tbar: [
                                        {
                                          xtype: "textfield",
                                          fieldLabel: "เกี่ยวข้องในโครงการ", //
                                          name: "txtSearch",
                                          value: Ext.getCmp("areaPrnID" + i).getValue(),
                                          id: "txtSearchID",
                                          listeners: {
                                            specialkey: function (field, e) {
                                              if (e.getKey() === e.ENTER) {
                                                alert("enter" + Ext.getCmp("txtSearchID").getValue());
                                              }
                                            },
                                          },
                                        },
                                      ],
                                      store: Ext.storeDtl,
                                      columns: [
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
                                          header: "รหัส",
                                          sortable: false,
                                          align: "left",
                                          dataIndex: "id",
                                          hidden: true, // icon: "../images/icons/application_view_tile.png"
                                        },
                                        {
                                          header: "รหัส",
                                          sortable: false,
                                          width: 150,
                                          id: "editEmpTorID",
                                          align: "left",
                                          dataIndex: "c_code",
                                        },
                                        {
                                          header: "รหัสพวช",
                                          sortable: false,
                                          width: 150,
                                          id: "editEmpTorID",
                                          align: "left",
                                          dataIndex: "d_doc_ref",
                                        },
                                        {
                                          header: "ชื่อรายการ",
                                          sortable: false,
                                          width: 270,
                                          id: "editEmpTorID",
                                          align: "left",
                                          dataIndex: "c_name",
                                        },
                                      ],
                                      bbar: new Ext.PagingToolbar({
                                        pageSize: 20,
                                        store: Ext.storeDtl,
                                        displayInfo: true,
                                        displayMsg: "Displaying topics {0} - {1} of {2}",
                                      }),
                                      listeners: {
                                        rowclick: function (grid, rowIndex, e) {
                                          var record = grid.getStore().getAt(rowIndex);

                                          Ext.getCmp("areaPrnID" + i).setValue(record.get("c_code") + "|" + record.get("d_doc_ref") + "|" + record.get("c_name") + "|" + record.get("f_total_amt"));
                                          Ext.getCmp("pr_about" + i + "ID").setValue(record.get("id"));
                                          Ext.getCmp("fit-" + i).destroy();
                                        },
                                      },
                                    },
                                  ],
                                });
                                wf.show();
                              };
                              this.fnPrAbout = function (i, obj) {
                                let pr_about = i;
                                let pr_aboutRs = obj;
                                Ext.ar_pr_about.push(pr_about);

                                buttonGroup = new Ext.ButtonGroup({
                                  fieldLabel: "PR ที่เกี่ยวข้องในโครงการ",
                                  frame: false,
                                  border: false,
                                  id: "buttonGroup" + pr_about,
                                  items: [
                                    new Ext.form.TextArea({
                                      width: 200,
                                      text: "&nbsp;&nbsp;&nbsp;เลือก PR&nbsp;&nbsp;&nbsp;",
                                      fieldLabel: "เกี่ยวข้องในโครงการ " + pr_about, //
                                      name: "areaPr[" + pr_about + "]",
                                      id: "areaPrnID" + pr_about,
                                    }),
                                    {
                                      xtype: "tbspacer",
                                      width: 9,
                                    },
                                    {
                                      xtype: "button",
                                      id: "buttonFindID" + pr_about,
                                      name: "buttonFind" + pr_about,
                                      text: "เลือก PR " + pr_about,
                                      handler: function () {
                                        Ext.getCmp("i_type_bgID").fnWinFind(pr_about);
                                      },
                                    },
                                    {
                                      xtype: "tbspacer",
                                      width: 9,
                                    },
                                    {
                                      xtype: "hidden",
                                      name: "pr_about[" + pr_about + "]",
                                      id: "pr_about" + pr_about + "ID",
                                    },
                                    {
                                      xtype: "button",
                                      id: "buttonID" + pr_about,
                                      name: "button" + pr_about,
                                      text: "ลบรายการ " + pr_about,
                                      handler: function () {
                                        //                                                                                                       alert(pr_about);
                                        Ext.getCmp("contenerFormID").remove(Ext.getCmp("buttonGroup" + pr_about));
                                      },
                                    },
                                    {
                                      xtype: "label",
                                      style: {
                                        color: "red",
                                        width: "200px",
                                      },
                                      text: "* แก้ไข",
                                    },
                                  ],
                                  listeners: {
                                    afterrender: function () {
                                      if (pr_aboutRs != null) {
                                        Ext.getCmp("areaPrnID" + pr_about).setValue(pr_aboutRs.c_name);
                                        Ext.getCmp("pr_about" + pr_about + "ID").setValue(pr_aboutRs.sp_tor_id);
                                      }
                                    },
                                  },
                                });
                                Ext.getCmp("contenerFormID").insert(6, buttonGroup);
                                Ext.getCmp("contenerFormID").doLayout();
                              };
                            },
                            change: function () {
                              this.fn(this.getValue().inputValue);
                            },
                            afterrender: function () {
                              this.fn = function (i) {
                                if (!Ext.isEmpty(Ext.getCmp("buttonOpenID"))) {
                                  Ext.ar_pr_about.forEach(function (v) {
                                    Ext.getCmp("contenerFormID").remove(Ext.getCmp("buttonGroup" + v));
                                  });
                                  Ext.ar_pr_about = [];
                                  Ext.i_pr_about = 1;
                                  Ext.getCmp("contenerFormID").remove(Ext.getCmp("buttonOpenID"));
                                }

                                if (i == 3) {
                                  Ext.getCmp("frmPopPrStructorID").show();
                                  Ext.getCmp("modesubID").getValue().inputValue = "ADDMAIN";
                                } else if (i == 5) {
                                  Ext.getCmp("prToWithDrawID").show();
                                } else if (i == 2) {
                                  //Ext insert
                                  Ext.getCmp("contenerFormID").insert(
                                    5,
                                    new Ext.Button({
                                      text: "&nbsp;&nbsp;&nbsp;เพิ่ม PR เกี่ยวข้อง&nbsp;&nbsp;&nbsp;",
                                      fieldLabel: "เกี่ยวข้องในโครงการ", //
                                      name: "buttonOpen",
                                      id: "buttonOpenID",
                                      handler: function () {
                                        Ext.getCmp("i_type_bgID").fnPrAbout(Ext.i_pr_about++, null);
                                      },
                                    })
                                  );
                                  if (!Ext.isEmpty(Ext.selectRow)) {
                                    if (Ext.selectRow.get("i_type_bgProject") !== null) {
                                      Ext.selectRow.get("i_type_bgProject").forEach(function (v) {
                                        Ext.getCmp("i_type_bgID").fnPrAbout(Ext.i_pr_about++, v);
                                      });
                                    }
                                  }
                                } else {
                                  Ext.getCmp("frmPopPrStructorID").hide();
                                }
                                Ext.getCmp("contenerFormID").doLayout();
                              };
                              Ext.getCmp("i_type_bgID").fn(this.getValue().inputValue);
                            },
                            // afterrender: function () {
                            //   this.fn = function () {
                            //     value = this.getValue() ;
                            //     console.log(value);
                            //     if (value == 4 || value == 2 || value ==  8 || value == 11) {
                            //     }
                            //   };
                            // },
                            // // selectRow
                            // Change: function () {
                            //   this.fn();
                            // },
                            // beforequery: function (q) {
                            //   if (q.query) {
                            //     var length = q.query.length;
                            //     q.query = new RegExp(Ext.escapeRe(q.query));
                            //     q.query.length = length;
                            //   }
                            // },
                            blur: function () {
                              this.getStore().clearFilter();
                            },
                          },
                        }),
                        {
                          layout: "column",
                          id: "frmPopPrStructorID",
                          hidden: true,
                          border: false,
                          items: [
                            {
                              columnWidth: 1,
                              layout: "form",
                              border: false,
                              items: [Ext.PopMainPr.mini],
                            },
                          ],
                          listeners: {
                            render: function (p) {
                              // this.hide();
                            },
                          },
                        },
                        {
                          xtype: "button",
                          fieldLabel: "กดทำรายการ",
                          text: "ทำรายการข้ามไปเบิก",
                          name: "prToWithDraw",
                          id: "prToWithDrawID",
                          listeners: {
                            afterrender: function () {
                              if (!Ext.isEmpty(Ext.selectRow)) {
                                if (Ext.getCmp("i_type_bgID").getValue().inputValue == 5 && Ext.selectRow.get("sp_contract_id") == "0") this.show();
                                else this.hide();
                              } else {
                                this.hide();
                              }
                            },
                          },
                          handler: function () {
                            //send Ajax
                            Ext.Ajax.request({
                              url: "tor/api/mnPeriodController.php",
                              method: "POST",
                              params: {
                                mode: "GEN_SP_CONTRACT_CHECK",
                                sp_tor_id: Ext.HDR_ID,
                              },
                              waitMsg: "Saving Data...",
                              success: function (Success, request) {
                                var jsonData = Ext.util.JSON.decode(Success.responseText); //decode json

                                if (jsonData.success) {
                                  Ext.MessageBox.alert("Success", "ทำรายการเรียร้อยแล้ว", function () {
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.selectRow = null;
                                    Ext.getCmp("winMain").destroy();
                                  });
                                }
                              },
                              failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText);
                              },
                            });
                          },
                        },
                        {
                          xtype: "box",
                          autoEl: { tag: "hr" },
                        },
                        comboUsedBgYear,
                        {
                          xtype: disp,
                          fieldLabel: "รหัส PR",
                          id: "codeHdrID",
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                          name: "c_code",
                        },
                        {
                          fieldLabel: "เลขที่สารบัญรับ",
                          //  emptyText: "", //readOnly: true,
                          xtype: "numberfield",
                          width: 50,
                          name: "index_receive",
                          id: "index_receiveID",
                          hidden: true,
                          /* validator: function (val)
                                                     {
                                                     if (!Ext.isEmpty(val))
                                                     {
                                                     return true;
                                                     } else
                                                     {
                                                     return "กรุณาระบุ เลขทะเบียนคุมรับเอกสาร TOR";
                                                     }
                                                     }*/
                        },
                        {
                          // xtype: disp,
                          xtype: "textarea",
                          fieldLabel: "เรื่อง/โครงการ",
                          width: 450,
                          name: "c_name",
                          id: "c_nameMainID",
                        },
                        {
                          xtype: "label",
                          hidden: true,
                          style: "font-size:11px;font-weight:bold; padding:1px;",
                          html: '<div style="padding-left:30px;">หน่วยงาน<span style="color:red">*</span>  ผู้ร้บผิดชอบคือผู้รับหน่วยงานรับภาระเงิน/ดำเนินการ</div>',
                        },
                        comboCost,
                        comboCost2,
                        {
                          xtype: "radiogroup",
                          columns: [160],
                          fieldLabel: "ใช้เงินของ",
                          id: "i_owner_bgID",
                          readOnly: true,
                          name: "i_owner_bg",
                          hidden: true,
                          items: [
                            {
                              //                                                            name: "i_owner_bg",
                              //                                                            inputValue: 1,
                              //                                                            boxLabel: "หน่วยงานที่รับผิดชอบ",
                              //                                                        },
                              //                                                        {
                              checked: true,
                              inputValue: 2,
                              name: "i_owner_bg",
                              boxLabel: "หน่วยงานเจ้าของเรื่อง",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function (field, newValue, oldValue, eOpts) {
                              //                                                            if (newValue) {
                              //                                                                field.setValue(oldValue);
                              //                                                                return ;
                              //                                                            }
                            },
                            afterrender: function () {},
                          },
                        },
                        {
                          fieldLabel: "หน่วยงานย่อย",
                          emptyText: "*ถ้ามี",
                          hidden: true,
                          xtype: "textfield",
                          name: "txtsub_cost",
                          id: "txtsub_costID",
                        },
                        {
                          fieldLabel: "tag search",
                          xtype: "textfield",
                          name: "tag",
                          hidden: true,
                          id: "txttagID",
                        },
                        {
                          xtype: "buttongroup",
                          fieldLabel: "วันที่",
                          hidden: true,
                          frame: false,
                          border: false,
                          items: [
                            {
                              xtype: "datefield",
                              name: "d_tor_date",
                              hidden: true,
                              value: new Date().format("d-m-Y"),
                              validator: function (val) {
                                if (!Ext.isEmpty(val)) {
                                  return true;
                                } else {
                                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                }
                              },
                            },
                            {
                              xtype: "tbspacer",
                              width: 18,
                            },
                            {
                              xtype: "label",
                              hidden: true,
                              style: {
                                color: "red",
                                width: "100px",
                              },
                              text: "* วันที่บันทึกรายการ",
                            },
                          ],
                        },

                        {
                          xtype: "displayfield",
                          fieldLabel: "แบบ ",
                          name: "lableLess",
                          value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                          id: "lableLessID",
                          listeners: {
                            beforerender: function () {},
                            afterrender: function () {
                              this.fn = function () {
                                if (Ext.getCmp("tor_type_idID").getValue() != 1) {
                                  this.hide();
                                } else {
                                  this.show();
                                }
                              };
                              this.fn();
                            },
                          },
                        },
                        {
                          xtype: "label",
                          hidden: true,
                          style: "font-size:11px;font-weight:bold; padding:1px;",
                          html: '<div style="padding-left:30px;">วิธีดำเนินงาน <span style="color:red"> * </span> คัดเลือก/เจาะจง จะขึ้นอยู่กับจำนวนเงินรวม มีคณะกรรมการ/มากว่า 5 แสน</div>',
                        },
                        new Ext.form.ComboBox({
                          mode: "local",
                          store: Ext.torType,
                          anchor: "40%",
                          hidden: true,
                          fieldLabel: "วิธีดำเนินงาน",
                          submitValue: true,
                          hiddenName: "tor_type_id",
                          name: "c_type_id",
                          id: "tor_type_idID",
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          typeAhead: false,
                          emptyText: "กรุณาเลือก",

                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                if (this.getValue() == 1) {
                                  //tor_type_id === 1 (เจาะจง)
                                  Ext.getCmp("lableLessID").show();
                                } else {
                                  Ext.getCmp("lableLessID").hide();
                                }
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
                          fieldLabel: "ขอดำเนินการ",
                          id: "i_purchaseID",
                          name: "i_purchase",
                          items: [
                            {
                              checked: true,
                              name: "i_purchase",
                              inputValue: 1,
                              boxLabel: "จัดซื้อ",
                            },
                            {
                              inputValue: 2,
                              name: "i_purchase",
                              boxLabel: "จัดจ้าง",
                            },
                            {
                              name: "i_purchase",
                              inputValue: 3,
                              boxLabel: "จัดเช่า",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              if (this.getValue().inputValue == 3) {
                                Ext.getCmp("i_product_typeID").hide();
                                Ext.getCmp("i_hire_typeID").hide();
                                Ext.getCmp("i_is_invGID").hide();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                              } else if (this.getValue().inputValue == 2) {
                                Ext.getCmp("i_hire_typeID").show();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                if (Ext.getCmp("i_hire_typeID").getValue().inputValue == 0) {
                                  Ext.getCmp("i_product_typeID").hide();
                                  Ext.getCmp("i_is_invGID").hide();
                                } else {
                                  Ext.getCmp("i_product_typeID").show();
                                  // Ext.getCmp("i_is_invGID").show();
                                }
                              } else if (this.getValue().inputValue == 1) {
                                Ext.getCmp("i_hire_typeID").hide();
                                Ext.getCmp("i_product_typeID").show();
                                // Ext.getCmp("i_is_invGID").show();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").show();
                              }
                            },
                            afterrender: function () {
                              if (this.getValue().inputValue == 3) {
                                Ext.getCmp("i_product_typeID").hide();
                                Ext.getCmp("i_hire_typeID").hide();
                                Ext.getCmp("i_is_invGID").hide();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                              } else if (this.getValue().inputValue == 2) {
                                Ext.getCmp("i_hire_typeID").show();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                if (Ext.selectRow.get("i_hire_type") == 0) {
                                  Ext.getCmp("i_product_typeID").hide();
                                  Ext.getCmp("i_is_invGID").hide();
                                } else {
                                  Ext.getCmp("i_product_typeID").show();
                                  // Ext.getCmp("i_is_invGID").show();
                                }
                              } else if (this.getValue().inputValue == 1) {
                                Ext.getCmp("i_hire_typeID").hide();
                                Ext.getCmp("i_product_typeID").show();
                                // Ext.getCmp("i_is_invGID").show();
                                //                                                                Ext.getCmp("i_type_fix_rateGID").show();
                              }
                            },
                          },
                        },
                        {
                          xtype: "radiogroup",
                          columns: [98, 110],
                          fieldLabel: "ลักษณะการจ้าง",
                          id: "i_hire_typeID",
                          name: "i_hire_type",
                          items: [
                            {
                              checked: true,
                              name: "i_hire_type",
                              inputValue: 1,
                              boxLabel: "จ้างแบบได้ของ",
                            },
                            {
                              inputValue: 0,
                              name: "i_hire_type",
                              boxLabel: "จ้างแบบไม่มีของ",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              if (this.getValue().inputValue == 0) {
                                Ext.getCmp("i_product_typeID").hide();
                                Ext.getCmp("i_is_invGID").hide();
                              } else {
                                Ext.getCmp("i_product_typeID").show();
                                // Ext.getCmp("i_is_invGID").show();
                              }
                            },
                            afterrender: function () {
                              if (this.getValue().inputValue == 0) {
                                Ext.getCmp("i_product_typeID").hide();
                                Ext.getCmp("i_is_invGID").hide();
                              } else {
                                Ext.getCmp("i_product_typeID").show();
                                // Ext.getCmp("i_is_invGID").show();
                              }
                            },
                          },
                        },
                        {
                          xtype: "radiogroup",
                          columns: [98, 98],
                          fieldLabel: "ของที่ได้มา",
                          id: "i_product_typeID",
                          name: "i_product_type",
                          items: [
                            {
                              checked: true,
                              name: "i_product_type",
                              inputValue: 1,
                              boxLabel: "วัสดุ",
                            },
                            {
                              inputValue: 2,
                              name: "i_product_type",
                              boxLabel: "ครุภัณฑ์",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {},
                            afterrender: function () {},
                          },
                        },
                        comboExpense,

                        {
                          xtype: "label",
                          style: "font-size:11px;font-weight:bold; padding:1px;",
                          html: '<div style="padding-left:30px;">แหล่งเงิน <span style="color:red"> * </span>  สามารถเลือกได้มากว่า 1 แหล่งเงิน ซึ่งจะต้องแยกงเงินในรายละเอียดรายการซื้อจ้าง</div>',
                        },
                        {
                          xtype: "button",
                          id: "buttonFindBgID",
                          name: "buttonFindBg",
                          fieldLabel: "เพิ่มแหล่งเงิน",
                          text: "เลือกแหล่งเงิน ไม่เกิน 3 แหล่ง",
                          handler: function () {
                            //index i tems -ตำแหน่ง
                            if (Ext.arr_bg.length > 1) {
                              return false;
                            }
                            Ext.getCmp("contenerFormID").insert(Ext.getCmp("contenerFormID").items.length - 19, Ext.getCmp("buttonFindBgID").fnGenBg(Ext.i_bg++, Ext.selectRow));
                            Ext.getCmp("contenerFormID").doLayout();
                          },
                          listeners: {
                            beforerender: function () {
                              Ext.i_bg = 1;
                              Ext.f_bg = 0;
                              Ext.arr_bg_pop = ["buttonGroupBg0", "buttonGroupBg1", "buttonGroupBg2"];
                              Ext.arr_bg = [];
                            },
                            afterrender: function () {
                              this.fnGenBg = function (i, obj) {
                                let local_i = i;
                                Ext.local_i = local_i;
                                Ext.arr_bg.push("buttonGroupBg" + local_i);
                                return new Ext.ButtonGroup({
                                  fieldLabel: "แหล่งเงิน " + local_i,
                                  frame: false,
                                  border: false,
                                  anchor: "100%",
                                  id: "buttonGroupBg" + local_i,
                                  items: [
                                    // {
                                    //     xtype: "fieldset",
                                    //     title: "การใช้เงินที่ 1",
                                    //     id : "buttonGroupDc_expense[" + local_i + "]",
                                    //     collapsible: true,
                                    //     autoHeight: true,
                                    //     defaults: {width: 600},
                                    //     defaultType: "textfield",
                                    //     items: [
                                    new Ext.form.ComboBox({
                                      mode: "local",
                                      store: Ext.dc_expense_budget_type,
                                      fieldLabel: "แหล่งเงิน " + local_i,
                                      width: 400,
                                      submitValue: true,
                                      name: "dc_expense_budget_type_id[" + local_i + "]",
                                      hiddenName: "dc_expense_budget_type_idTxt[" + local_i + "]",
                                      id: "dc_expense_budget_type_id[" + local_i + "]ID",
                                      valueField: "id",
                                      displayField: "c_name",
                                      triggerAction: "all",
                                      forceSelection: true,
                                      selectOnFocus: true,
                                      typeAhead: false,
                                      emptyText: "กรุณาเลือกแหล่งเงิน...",
                                      listeners: {
                                        render: function (combo) {
                                          tooltip_ComboBox(combo, "c_name");
                                        },
                                        afterrender: function () {
                                          this.fn = function () {
                                            Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type");
                                          };
                                          this.fn();
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
                                      validator: function (val) {
                                        if (Ext.isEmpty(val)) {
                                          return "กรุณาระบุ กรุณาเลือกแหล่งเงิน";
                                        } else {
                                          return true;
                                        }
                                      },
                                    }),
                                    {
                                      xtype: "radiogroup",
                                      columns: [85, 85],
                                      fieldLabel: "ขอดำเนินการ",
                                      // hidden: i_type_bg, //status != "st0001.1",
                                      id: "i_pr_type[" + local_i + "]ID",
                                      name: "i_pr_type[" + local_i + "]",
                                      items: [
                                        {
                                          checked: true,
                                          name: "i_pr_type[" + local_i + "]",
                                          inputValue: 1,
                                          boxLabel: "แบบแผน",
                                        },
                                        {
                                          inputValue: 2,
                                          name: "i_pr_type[" + local_i + "]",
                                          boxLabel: "แบบงวด",
                                        },
                                      ],
                                      listeners: {
                                        change: function () {
                                          if (bg_reserve_money1_id) {
                                            Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                            Ext.getCmp("i_pr_type1ID").setValue(i_pr_type);
                                          }
                                        },
                                      },
                                    },
                                    {
                                      xtype: "textfield",
                                      width: 150,
                                      emptyText: "จำนวนเงิน...",
                                      name: "f_bg_amt[" + local_i + "]",
                                      id: "f_bg_amt[" + local_i + "]ID",
                                      listeners: {
                                        blur: function () {
                                          // if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                                            console.log(1);
                                            sumPayments(local_i);
                                            this.fn();
                                          // } else {
                                          //   this.fn2();
                                          // }
                                        },
                                        afterrender: function () {
                                          this.fn = function () {
                                              this.setValue(
                                                  Ext.util.Format.number(
                                                      parseFloat(this.getValue().replace(/,/g, "") || 0),
                                                      "0,000.00"
                                                  )
                                              );
                                          };
                                        },
                                        // afterrender: function () {
                                        //   this.fn = function () {
                                        //     this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                        //   };
                                        //   this.fn2 = function () {
                                        //     var val1 = 0;
                                        //     val1 = this.value;
                                        //     var f_total1 = parseFloat(val1.replace(/,/g, "") / 1);
                                        //     var val = 0;
                                        //     val = this.getValue();
                                        //     var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                        //     this.setValue(Ext.floatRenderer(f_total));
                                        //     Ext.f_bg += f_total - f_total1;
                                        //     console.log(Ext.f_bg);
                                        //     Ext.getCmp("f_totalID").setValue(Ext.floatRenderer(Ext.f_bg));
                                        //   };
                                        // },
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
                                      xtype: "hidden",
                                      name: "i_postionBg[" + local_i + "]",
                                      id: "i_postionBg" + local_i + "ID",
                                    },
                                    {
                                      xtype: "button",
                                      width: 70,
                                      id: "buttonBgID" + local_i,
                                      name: "buttonBg" + local_i,
                                      text: "ลบรายการ " + local_i,
                                      handler: function () {
                                        Ext.getCmp("contenerFormID").remove(Ext.getCmp("buttonGroupBg" + local_i));
                                        Ext.arr_bg.shift("buttonGroupBg" + local_i);
                                        sumPayments(local_i);
                                      },
                                    },
                                  ],
                                });
                              };
                              this.fn = function () {};
                            },
                          },
                        },
                        new Ext.ButtonGroup({
                          fieldLabel: "แหล่งเงิน ",
                          frame: false,
                          border: false,
                          anchor: "100%",
                          id: "buttonGroupBg0",
                          listeners: {
                            beforerender: function () {
                              //                                                            alert(1);
                            },
                            afterrender: function () {
                              if (!Ext.isEmpty(Ext.selectRow)) {
                                if (Ext.selectRow.get("dc_expense_budget_type_id1") > 0) {
                                  Ext.getCmp("contenerFormID").insert(Ext.getCmp("contenerFormID").items.length - 18, Ext.getCmp("buttonFindBgID").fnGenBg(Ext.i_bg++, Ext.selectRow));
                                }

                                if (Ext.selectRow.get("dc_expense_budget_type_id2") > 0) {
                                  Ext.getCmp("contenerFormID").insert(Ext.getCmp("contenerFormID").items.length - 19, Ext.getCmp("buttonFindBgID").fnGenBg(Ext.i_bg++, Ext.selectRow));
                                  //
                                }
                                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                              }
                            },
                          },
                          items: [
                            new Ext.form.ComboBox({
                              mode: "local",
                              store: Ext.dc_expense_budget_type,
                              fieldLabel: "แหล่งเงิน ",
                              width: 400,
                              submitValue: true,
                              name: "dc_expense_budget_type_id[0]",
                              hiddenName: "dc_expense_budget_type_idTxt[0]",
                              id: "dc_expense_budget_type_id[0]ID",
                              valueField: "id",
                              displayField: "c_name",
                              triggerAction: "all",
                              forceSelection: true,
                              selectOnFocus: true,
                              typeAhead: false,
                              emptyText: "กรุณาเลือกแหล่งเงิน...",
                              listeners: {
                                render: function (combo) {
                                  tooltip_ComboBox(combo, "c_name");
                                },
                              },
                            }),
                            {
                              xtype: "radiogroup",
                              columns: [85, 85],
                              fieldLabel: "ขอดำเนินการ",
                              // hidden: i_type_bg, //status != "st0001.1",
                              id: "i_pr_type[0]ID",
                              name: "i_pr_type[0]",
                              // hiddenName : "i_pr_type[0]",
                              items: [
                                {
                                  checked: true,
                                  name: "i_pr_type[0]",
                                  inputValue: 1,
                                  boxLabel: "แบบแผน",
                                },
                                {
                                  inputValue: 2,
                                  name: "i_pr_type[0]",
                                  boxLabel: "แบบงวด",
                                },
                              ],
                              listeners: {
                                change: function () {
                                  // if (bg_reserve_money1_id) {
                                  // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                  // Ext.getCmp("i_pr_type1ID").setValue(i_pr_type);
                                  // }
                                },
                              },
                            },
                            // {
                            //     xtype: "displayfield",
                            //     width: 70,
                            //     style: "color:blue;font-size:11px;font-weight:bold; ",
                            //     value: "จำนวนเงิน"
                            // },
                            {
                              xtype: "textfield",
                              emptyText: "จำนวนเงิน...",
                              name: "f_bg_amt[0]",
                              id: "f_bg_amt[0]ID",
                              listeners: {
                                blur: function () {
                                  // if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                                    sumPayments(0);
                                    this.fn();
                                  // } else {
                                  //   this.fn2();
                                  // }
                                },
                                afterrender: function () {
                                  this.fn = function () {
                                      this.setValue(
                                          Ext.util.Format.number(
                                              parseFloat(this.getValue().replace(/,/g, "") || 0),
                                              "0,000.00"
                                          )
                                      );
                                  };
                                },
                              //   afterrender: function () {
                              //     this.fn = function () {
                              //         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                              //     };
                              //     this.fn2 = function () {
                              //         var val1 = 0;
                              //         val1 = this.value;
                              //         var f_total1 = parseFloat(val1.replace(/,/g, "") / 1);
                              //         var val = 0;
                              //         val = this.getValue();
                              //         var f_total = parseFloat(val.replace(/,/g, "") / 1);
                              //         this.setValue(Ext.floatRenderer(f_total));
                              //         Ext.f_bg += f_total - f_total1;
                              //         Ext.getCmp("f_totalID").setValue(Ext.floatRenderer(Ext.f_bg));
                              //     };
                              // },
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
                              width: 9,
                            },
                            {
                              xtype: "hidden",
                              name: "i_postionBg[0]",
                              id: "i_postionBg0ID",
                            },
                            {
                              xtype: "label",
                              style: {
                                color: "red",
                                width: "200px",
                              },
                              text: "*",
                            },
                          ],
                        }),
                        {
                          xtype: "buttongroup",
                          fieldLabel: "จำนวนเงิน",
                          frame: false,
                          border: false,
                          items: [
                            {
                              xtype: "textfield",
                              fieldLabel: "จำนวนเงิน",
                              name: "f_total_amt",
                              emptyText: "...",
                              readOnly: true,
                              id: "f_totalID",
                              listeners: {
                                blur: function () {
                                  this.fn();
                                  if (Ext.getCmp("d_doc_refID").getValue().trim() != "") {
                                    Ext.getCmp("d_doc_refID").DocValid();
                                  }
                                },
                                afterrender: function () {
                                  this.fn = function () {
                                    var val = 0;
                                    val = this.getValue();

                                    var f_total = parseFloat(val.replace(/,/g, "") / 1);

                                    if (f_total > 500000) {
                                      Ext.i_is_more = 1;
                                    } else {
                                      Ext.i_is_more = 0;
                                    }

                                    Ext.getCmp("islessID").setValue(Ext.i_is_more);
                                    if (Ext.getCmp("tor_type_idID").getValue() == 1) {
                                      Ext.getCmp("lableLessID").setValue(Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more]);
                                    }
                                    this.setValue(Ext.floatRenderer(f_total));
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
                          ],
                        },
                        {
                          xtype: "button",
                          width: 70,
                          id: "buttonBgID0",
                          name: "buttonBg0",
                          hidden: true,
                          text: "ลบรายการ",
                          handler: function () {
                            Ext.getCmp("contenerFormID").remove(Ext.getCmp("buttonGroupBg[0]"));
                            Ext.arr_bg.shift("buttonGroupBg[0]");
                          },
                        },
                        {
                          xtype: "hidden", //textfield hidden
                          name: "i_is_more",
                          id: "islessID", //i_is_more
                        },
                        {
                          xtype: "checkboxgroup",
                          fieldLabel: "การจัดเก็บ",
                          name: "i_is_inv",
                          id: "i_is_invGID",
                          hidden: true,
                          columns: 1,
                          items: [
                            {
                              id: "i_is_invIDs1",
                              hidden: true,
                              boxLabel: "เข้าคลัง",
                              name: "i_is_inv",

                              inputValue: 1,
                            },
                            // {id: 'cbxDescription', boxLabel: 'Description', name: 'mycbxgrp', inputValue: 2}
                          ],
                          listeners: {
                            afterrender: function () {
                              if (Ext.buAct == "update") {
                                if (Ext.selectRow.get("i_is_inv") == true) {
                                  Ext.getCmp("i_is_invIDs1").setValue(true);
                                }
                              }
                            },
                          },
                        },
                        {
                          xtype: "label",
                          style: "font-size:11px;font-weight:bold; padding:1px;",
                          html: '<div style="padding-left:30px;">รหัสเอกสารอ้างอิง <span style="color:red"> * </span> ชื่อเรื่อง/หน่วยงาน/จำนวนเงิน ระบบจะแจ้งหากมีซ้ำ</div>',
                        },
                        {
                          xtype: disp,
                          fieldLabel: "รหัสเอกสารอ้างอิง/พวช",
                          name: "d_doc_ref",
                          validator: function (val) {
                            if (Ext.isEmpty(val) && this.getValue().trim() != "-") {
                              return "กรุณาระบุ รหัสเอกสารอ้างอิง";
                            } else {
                              return true;
                            }
                          },
                          id: "d_doc_refID",
                          listeners: {
                            beforerender: function () {
                              this.fnGridList = function (a) {
                                storeCreditor = new Ext.data.JsonStore({
                                  autoLoad: true,
                                  storeId: "myStoreCredit",
                                  url: "tor/api/List_spTorDocRef.php",
                                  baseParams: { type: "DocRef", id: 0, mode: "list" },
                                  root: "data",
                                  idProperty: "id",
                                  totalProperty: "totalCount",
                                  fields: [{ name: "no" }, { name: "id" }, { name: "d_doc_ref" }, { name: "c_code" }, { name: "c_cost_name" }, { name: "c_name" }, { name: "f_total_amt" }],
                                });

                                if (a == 1) {
                                  storeCreditor.setBaseParam("d_doc_ref", Ext.getCmp("d_doc_refID").getValue().trim());
                                  storeCreditor.setBaseParam("f_total_amt", parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1));
                                  storeCreditor.setBaseParam("case", 1);
                                  storeCreditor.setBaseParam("id", Ext.getCmp("torHdrID").getValue());
                                } else if (a == 2) {
                                  storeCreditor.setBaseParam("d_doc_ref", Ext.getCmp("d_doc_refID").getValue().trim());
                                  storeCreditor.setBaseParam("case", 2);
                                  storeCreditor.setBaseParam("id", Ext.getCmp("torHdrID").getValue());
                                } else if (a == 3) {
                                  storeCreditor.setBaseParam("f_total_amt", parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1));
                                  storeCreditor.setBaseParam("dc_cost2_id", Ext.getCmp("dc_cost2_idID").getValue());
                                  storeCreditor.setBaseParam("case", 3);
                                  storeCreditor.setBaseParam("id", Ext.getCmp("torHdrID").getValue());
                                }
                                var column = [
                                  {
                                    header: "ID System",
                                    sortable: true,
                                    hidden: true,
                                    dataIndex: "id",
                                  },
                                  {
                                    header: "",
                                    align: "center",
                                    width: 20,
                                    sortable: true,
                                    dataIndex: "no",
                                  },
                                  {
                                    header: "รหัสเอกสารอ้างอิง",
                                    align: "left",
                                    width: 50,
                                    sortable: true,
                                    dataIndex: "d_doc_ref",
                                  },
                                  {
                                    header: "เลข PR",
                                    align: "left",
                                    width: 50,
                                    sortable: true,
                                    dataIndex: "c_code",
                                  },
                                  {
                                    header: "ชื่อหน่วยงาน",
                                    align: "left",
                                    width: 50,
                                    sortable: true,
                                    dataIndex: "c_cost_name",
                                  },
                                  {
                                    header: "ชื่อเรื่อง/โครงการ",
                                    align: "left",
                                    width: 300,
                                    sortable: true,
                                    dataIndex: "c_name",
                                  },
                                  {
                                    header: "จำนวนเงิน",
                                    align: "right",
                                    width: 50,
                                    sortable: true,
                                    dataIndex: "f_total_amt",
                                  },
                                ];
                                var wind = new Ext.Window({
                                  title: "ข้อมูลที่มีอยู่แล้วในระบบ",
                                  layout: "fit",
                                  maximizable: true,
                                  width: Ext.getCmp("winChequeID").getWidth() - 140,
                                  height: Ext.getCmp("winChequeID").getHeight() - 100,
                                  items: [
                                    {
                                      xtype: "grid",
                                      id: "gridSub2ID",
                                      border: false,
                                      stripeRows: true,
                                      loadMask: true,
                                      height: 80,
                                      autorScroll: true,
                                      store: storeCreditor,
                                      columns: column,
                                      columnLines: true,
                                      viewConfig: { forceFit: true },
                                      bbar: new Ext.PagingToolbar({
                                        pageSize: 20,
                                        store: storeCreditor,
                                        displayInfo: true,
                                        displayMsg: "Displaying topics {0} - {1} of {2}",
                                      }),
                                      listeners: {
                                        beforerender: function () {
                                          storeCreditor.load();
                                        },
                                      },
                                    },
                                  ],
                                });
                                wind.show();
                              };
                            },
                            afterrender: function () {
                              this.DocValid = function () {
                                //return false;
                                Ext.Ajax.request({
                                  url: "tor/api/mnValidController.php",
                                  params: {
                                    mode: "doc_ref_pr",
                                    txt: Ext.getCmp("d_doc_refID").getValue().trim(),
                                    dc_cost2_id: Ext.getCmp("dc_cost2_idID").getValue(),
                                    i_year: Ext.getCmp("i_yearID").getValue(),
                                    f_net_total_amt: parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1),
                                  },
                                  method: "POST", //POST
                                  success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success) {
                                      if (jsonData.exisTxt > 0 && jsonData.exisTxt2 > 0 && Ext.getCmp("d_doc_refID").getValue().trim() != "") {
                                        if (jsonData.pr_code != null)
                                          Ext.Msg.alert("แจ้งเตือน", jsonData.pr_code + " เลข พวชและจำนวนเงิน มีอยู่แล้วในระบบ " + Ext.getCmp("d_doc_refID").getValue(), function (form, action) {
                                            Ext.getCmp("d_doc_refID").fnGridList(1);
                                            //                                                                                    Ext.getCmp('d_doc_refID').setValue(null);
                                            //                                                                                    Ext.getCmp('d_doc_refID').focus();
                                            Ext.isCostPrExist = 0;
                                            return false;
                                          });
                                      } else if (jsonData.exisTxt > 0 && jsonData.exisTxt2 == 0 && Ext.getCmp("d_doc_refID").getValue().trim() != "") {
                                        if (jsonData.pr_code != null)
                                          Ext.Msg.alert("แจ้งเตือน", jsonData.pr_code + " เลข พวช มีอยู่แล้วในระบบ " + Ext.getCmp("d_doc_refID").getValue(), function (form, action) {
                                            //                                                                                    Ext.getCmp('d_doc_refID').setValue(null);
                                            //                                                                                    Ext.getCmp('d_doc_refID').focus();
                                            Ext.getCmp("d_doc_refID").fnGridList(2);
                                            Ext.isCostPrExist = 0;
                                            return false;
                                          });
                                      } else if (jsonData.exisTxt2 > 0 && Ext.getCmp("torHdrID").getValue() == "0" && Ext.getCmp("d_doc_refID").getValue().trim() != "") {
                                        if (jsonData.pr_code != null)
                                          Ext.Msg.alert("แจ้งเตือน", jsonData.pr_code + " เลข พวช มีหน่วยงานและเงินซ้ำ ", function (form, action) {
                                            Ext.getCmp("d_doc_refID").fnGridList(3);
                                            Ext.isCostPrExist = 1;
                                            return false;
                                          });
                                      } else if (jsonData.exisTxt2 > 0) {
                                        Ext.Msg.alert("แจ้งเตือน", jsonData.pr_code + " เลข พวช มีหน่วยงานและเงินซ้ำ ", function (form, action) {
                                          Ext.getCmp("d_doc_refID").fnGridList(4);
                                          Ext.isCostPrExist = 1;
                                          return false;
                                        });
                                      } else {
                                        Ext.isCostPrExist = 0;
                                      }
                                    } else {
                                      Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                    }
                                  },
                                  failure: function (result, request) {
                                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                  },
                                });
                              };
                            },
                            blur: function () {
                              // Ext jax
                              if (Ext.getCmp("d_doc_refID").getValue().trim() != "") {
                                Ext.getCmp("d_doc_refID").DocValid();
                              }
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          name: "d_doc_date",
                          fieldLabel: "วันที่เอกสารอ้างอิง",
                          //
                        },
                        {
                          xtype: "radiogroup",
                          columns: [90, 110],
                          fieldLabel: "สถานะการใช้งาน",
                          hidden: true,
                          name: "i_enabled",
                          id: "i_enabledID",
                          items: [
                            {
                              name: "i_enabled",
                              checked: true,
                              inputValue: 1,
                              boxLabel: "ใช้งาน",
                            },
                            {
                              name: "i_enabled",
                              inputValue: 2,
                              boxLabel: "ไม่ใช้งาน",
                            },
                          ], //radiogroup
                        },
                        {
                          xtype: "box",
                          autoEl: { tag: "hr" },
                        },
                        {
                          xtype: "checkbox",
                          id: "GENCODEPRID",
                          boxLabel: "ออกเลขPR",
                          name: "GENCODEPR",
                          // inputValue: 1,
                          listeners: {
                            afterrender: function () {
                              // if (Ext.selectRow.get("c_code") != null ) {
                              // Ext.getCmp("GENCODEPR").setValue(true);
                              // }
                            },
                            check: function (checkbox, checked) {
                              // ออกเลขก่อนปีงบประมาณให้เปิดรายการนี้
                              if (checked) {
                                Ext.getCmp("updateBuID").setValue(true);
                                Ext.getCmp("modesubaddID").hide();
                                Ext.getCmp("modesubdelID").hide();
                                //   Ext.getCmp("i_type_yearID").show();
                                //   Ext.getCmp("advancedID").show();
                              } else {
                                Ext.getCmp("modesubaddID").show();
                                Ext.getCmp("modesubdelID").show();
                                Ext.getCmp("updateBuID").show();
                                //   Ext.getCmp("i_type_yearID").hide();
                                //   Ext.getCmp("advancedID").hide();
                              }
                            },
                          },
                        },
                        {
                          xtype: "radiogroup",
                          columns: [200, 350],
                          hidden: true,
                          fieldLabel: "คีย์ข้อมูลก่อนปีงบ",
                          id: "i_type_yearID",
                          name: "i_type_year",
                          items: [
                            {
                              checked: true,
                              inputValue: 1,
                              name: "i_type_year",
                              boxLabel: "ภายในปีงบประมาณ",
                            },
                            {
                              inputValue: 2,
                              name: "i_type_year",
                              boxLabel: "<font style='font-weight:bold; color:#FFA500'> ก่อนปีงบประมาณ </font>",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              if (this.getValue().inputValue == 1) {
                                Ext.getCmp("mm_ID").hide();
                              } else {
                                Ext.getCmp("mm_ID").show();
                              }
                            },
                            afterrender: function () {
                              this.fn = function (i) {};
                            },
                          },
                        },
                        {
                          xtype: "compositefield",
                          fieldLabel: "เดือน",
                          msgTarget: "under",
                          id: "mm_ID",
                          hidden: true,
                          items: [
                            new Ext.form.ComboBox({
                              id: "mm_startID",
                              width: 90,
                              mode: "local",
                              store: Ext.store_month,
                              valueField: "id",
                              displayField: "c_name",
                              hiddenName: "mm_start",
                              name: "mm_start",
                              triggerAction: "all",
                              forceSelection: true,
                              selectOnFocus: true,
                              typeAhead: false,
                              emptyText: "กรุณาเลือก...",
                              value: "01",
                              listeners: {
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
                        },
                        {
                          xtype: "box",
                          autoEl: { tag: "hr" },
                          id: "advancedID",
                          hidden: true,
                        },
                        {
                          xtype: "radiogroup",
                          columns: [120, 120, 120],
                          fieldLabel: "โหมดการบันทึก",
                          id: "modesubID",
                          style: {
                            "font-weight": "bold",
                          },
                          items:
                            statusx === "add"
                              ? [
                                  {
                                    name: "mode",
                                    inputValue: "ADD",
                                    checked: true,
                                    boxLabel: "เพิ่มรายการใหม่",
                                    id: "modesubaddID",
                                  },
                                ]
                              : [
                                  {
                                    name: "mode",
                                    checked: true,
                                    id: "updateBuID",
                                    inputValue: "UPDATE",
                                    boxLabel: "อัพเดทรายการ",
                                  },
                                  {
                                    name: "mode",
                                    inputValue: "ADD",
                                    //                                                                    checked: true,
                                    boxLabel: "เพิ่มรายการใหม่",
                                    id: "modesubaddID",
                                  },
                                  // {
                                  //   name: "mode",
                                  //   inputValue: "GENCODE",
                                  //   boxLabel: "ออกเลข PR",
                                  //   id: "modesubgencodeID",
                                  //   hidden: true,
                                  //   afterreder: function () {
                                  //     this.hide();
                                  //   },
                                  // },
                                  // {
                                  //   name: "mode",
                                  //   inputValue: "UPDATENEXTSTEP",
                                  //   boxLabel: "ทำการแก้ไขเอกสารแล้ว",
                                  //   id: "modeaftereditID",
                                  //   hidden: true,
                                  //   afterreder: function () {
                                  //     //  this.hide();
                                  //   },
                                  // },
                                  {
                                    name: "mode",
                                    inputValue: "DELETE",
                                    id: "modesubdelID",
                                    boxLabel: "ลบรายการ",
                                  },
                                ],
                          listeners: {
                            change: function () {
                              // if (this.getValue().inputValue == "GENCODE") {
                              //   Ext.getCmp("i_type_yearID").show();
                              //   Ext.getCmp("advancedID").show();
                              // } else {
                              //   Ext.getCmp("i_type_yearID").hide();
                              //   Ext.getCmp("advancedID").hide();
                              // }
                            },
                          },
                        },
                        {
                          fieldLabel: "เหตุผลในการแก้ไขเอกสารแล้ว",
                          xtype: "textarea",
                          name: "c_comment",
                          hidden: true,
                          width: 250,
                          id: "reasonID",
                        },
                        {
                          xtype: "hidden",
                          id: "i_backwordID",
                          name: "i_backword",
                        },
                        {
                          xtype: "hidden",
                          id: "menubackID",
                          name: "menuback",
                        },
                        {
                          xtype: "hidden",
                          id: "menuCodeID",
                          name: "menuCode",
                        },
                        {
                          xtype: "hidden",
                          value: 0,
                          id: "menu_noID",
                          name: "menu_no",
                        },
                      ],
                    },
                    // {
                    //   columnWidth: 0.1,
                    //   layout: "table",
                    //   items: new Ext.Panel({
                    //     border: true,
                    //     html:
                    //       '<div id="header" align="right">' +
                    //       '<div id="qrcodeID" ' +
                    //       'style="text-align:center;margin:0px 0px 0px 0px;background:#ccc; width:90px;height:80px;">' +
                    //       "<!-- QRCODE -->" +
                    //       "</div>",
                    //   }),
                    // },
                  ],
                },
              ],
              buttonAlign: "left",
              buttons: [
                {
                  text: "บันทึกรายการ",
                  id: "buSaveSubID",
                  iconCls: "icon-save-edit",

                  listeners: {
                    afterrender: function () {},
                  },
                  handler: function () {
                    // console.log(Ext.getCmp("GENCODEPRID").getValue());
                    // console.log(Ext.getCmp("GENCODEPRID").getValue().inputValue);
                    // return
                    var msg = "";
                    if (Ext.getCmp("dc_expense_budget_type_id[1]ID") == undefined) {
                      i = 1;
                      arr = 0;
                    } else if (Ext.getCmp("dc_expense_budget_type_id[2]ID") == undefined) {
                      i = 2;
                      arr = 1;
                    } else {
                      i = 3;
                      arr = 2;
                    }
                    if (Ext.getCmp("GENCODEPRID").getValue() == true) {
                      // if (Ext.store2.data.length == 0) {
                      //      msg += "<span style='white-space: nowrap;'>- กรุณาเพิ่มรายการจัดซื้อ</span><br>";
                      // }
                    }
                    if (Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue() == null) {
                      msg += "- กรุณาเลือกแหล่งเงินก่อนบันทึก" + "\n";
                    }
                    if (Ext.getCmp("i_pr_type[0]ID").getValue().inputValue == null) {
                      msg += "- กรุณาเลือกแหล่งเงินจ่ายก่อนบันทึก" + "\n";
                    }
                    if (i == 2) {
                      if (Ext.getCmp("dc_expense_budget_type_id[1]ID").getValue() == null) {
                        msg += "- กรุณาเลือกแหล่งเงินที่ 2 ก่อนบันทึก" + "\n";
                      }
                    }
                    if (i == 3) {
                      if (Ext.getCmp("dc_expense_budget_type_id[2]ID").getValue() == null) {
                        msg += "- กรุณาเลือกแหล่งเงิน ที่ 3 ก่อนบันทึก" + "\n";
                      }
                    }
                    if (msg != "") {
                      Ext.example.msg("แจ้งเตือน", msg, 1);
                      $(this).next("text copied");
                      setTimeout(function () {
                        $(this).next().remove();
                      }, 6000);
                      return;
                    }
                    // modesubgencodeID
                    if (msg == "") {
                      var formSubmit = function (form) {
                        i_type_bg = Ext.getCmp("i_type_bgID").getValue();
                        form.submit({
                          waitMsg: "Saving Data...",
                          success: function (form, action) {
                            var API_STATUS = [];
                            var Moneyready = 0;
                            Promise.all([])
                              .then((CheckMoney) => {
                                if (Ext.getCmp("GENCODEPRID").getValue() == true  && Ext.getCmp("i_type_bgID").getValue()  == "1") {
                                  Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                  return genBooklink(Ext.getCmp("f_bg_amt[0]ID").getValue(), 1, i);
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && (i == 2 || i == 3)) {
                                  Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                  return genBooklink(Ext.getCmp("f_bg_amt[1]ID").getValue(), 2, i);
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && i == 3) {
                                  Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                  return genBooklink(Ext.getCmp("f_bg_amt[2]ID").getValue(), 3, i);
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && i_type_bg == "1"  ) {
                                  Check = 0;
                                  for (let ii = 0; ii < i; ii++) {
                                    Check += API_STATUS[ii].Money.Check;
                                  }
                                  if (Check == i) {
                                    Moneyready = 1;
                                  } else {
                                    Moneyready = 0;
                                    Ext.Msg.alert("แจ้งเตือน", "ยอดเงินไม่พอ ติดต่องบประมาณ");
                                    return;
                                  }
                                  return;
                                }else if (["2","4",2,4].includes(i_type_bg)) {
                                  Moneyready = 1;
                                }else {
                                  Moneyready = 0;
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && Moneyready == 1 && i_type_bg == "1"  ) {
                                  return getlink(Ext.getCmp("f_bg_amt[0]ID").getValue(), 1, 0);
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && Moneyready == 1 && i > 1 && i_type_bg == "1") {
                                  return getlink(Ext.getCmp("f_bg_amt[1]ID").getValue(), 2, 1);
                                }
                              })
                              .then((CheckMoney) => {
                                API_STATUS.push(CheckMoney);
                                if (Ext.getCmp("GENCODEPRID").getValue() == true && Moneyready == 1 && i == 3 && i_type_bg == "1") {
                                  return getlink(Ext.getCmp("f_bg_amt[2]ID").getValue(), 3, 2);
                                }
                              })
                              .then((CheckMoney) => {
                                if (["2","4",2,4].includes(i_type_bg)) {
                                  return Ext.Ajax.request({
                                    url: "tor/api/mnTorControllerReq.php",
                                    method: "POST", //POST
                                    disableCaching: false,
                                    params: {
                                      mode: "GENCODE",
                                      id: Ext.selectRow.data.id,
                                      i_yyyy: Ext.getCmp("i_yearID").getValue(),
                                    },
                                    success: function (result, request) {
                                      Ext.storeDtl.reload({
                                        callback: function (record, operation, success) {
                                          if (success) {
                                            Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</spa>", function (form, action) {
                                              // Ext.getCmp("i_pr_type[0]ID")getValue()
                                              Ext.getCmp(Ext.poFormID).getEl().unmask();
                                              Ext.getCmp("po_expense_id_ID").setReadOnly(true);
                                              Ext.getCmp("i_type_bgID").setReadOnly(true);
                                              // setDisabled_button(i, 2, 1);
                                              Ext.getCmp("tabpanel1").getStore().reload();
                                              Ext.selectRow = null;
                                              Ext.getCmp("winMain").destroy();
                                            });
                                          }
                                        },
                                      });
                                    },
                                  });
                                } else if (Moneyready == 1 && Ext.getCmp("GENCODEPRID").getValue() == true) {
                                  // if(Ext.getCmp("GENCODEPRID").getValue() == true ){
                                  // }
                                  // return
                                  return Ext.Ajax.request({
                                    url: "tor/api/mnTorControllerReq.php",
                                    method: "POST", //POST
                                    disableCaching: false,
                                    params: {
                                      mode: "GENCODE",
                                      id: Ext.selectRow.data.id,
                                      i_yyyy: Ext.getCmp("i_yearID").getValue(),
                                    },
                                    success: function (result, request) {
                                      Ext.storeDtl.reload({
                                        callback: function (record, operation, success) {
                                          if (success) {
                                            Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</spa>", function (form, action) {
                                              // Ext.getCmp("i_pr_type[0]ID")getValue()
                                              Ext.getCmp(Ext.poFormID).getEl().unmask();
                                              Ext.getCmp("po_expense_id_ID").setReadOnly(true);
                                              Ext.getCmp("i_type_bgID").setReadOnly(true);
                                              // setDisabled_button(i, 2, 1);
                                              Ext.getCmp("tabpanel1").getStore().reload();
                                              Ext.selectRow = null;
                                              Ext.getCmp("winMain").destroy();
                                            });
                                          }
                                        },
                                      });
                                    },
                                  });
                                }
                              })
                              .then((CheckMoney) => {
                                // console.log(Ext.selectRow);
                                // return
                                if (Moneyready == 0) {
                                  return Ext.storeDtl.reload({
                                    callback: function (record, operation, success) {
                                      Ext.getCmp(Ext.poFormID).getEl().unmask();
                                      Ext.getCmp("tabpanel1").getStore().reload();
                                      Ext.getCmp("winMain").destroy();
                                    },
                                  });
                                }
                              });
                            let results = []; // สร้าง array เพื่อเก็บ object ที่เก็บข้อมูลหลายค่า
                            return results; // ส่งผลลัพธ์ทั้งหมดกลับ
                            // return false;
                            //จองเงิน
                          },
                        }); // from
                        // failure: function (form, action) {
                        //   switch (action.failureType) {
                        //     case Ext.form.Action.CLIENT_INVALID:
                        //       Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                        //       break;
                        //     case Ext.form.Action.CONNECT_FAILURE:
                        //       Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                        //       break;
                        //     case Ext.form.Action.SERVER_INVALID:
                        //       Ext.Msg.alert("Failure", action.result.msg);
                        //   }
                        // },
                      }; //END
                      if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                        if (Ext.store2.data.length > 0) {
                          var win = new Ext.Window({
                            id: "MessageBox_re",
                            title: "แจ้งเแตือน",
                            modal: true,
                            width: 260,
                            height: 120,
                            html: "<br><center><p style='font-size:12px'>ต้องการจะคัดลอกรายละเอียดจัดซื้อด้วยหรือไม่ ?</p></center>",
                            buttons: [
                              {
                                text: "ใช่",
                                handler: function () {
                                  Ext.getCmp("i_dtl_addID").setValue(0);
                                  var form = Ext.getCmp(Ext.poFormID).getForm();
                                  if (form.isValid()) {
                                    formSubmit(form);
                                  }
                                  Ext.getCmp("MessageBox_re").hide();
                                  Ext.getCmp("MessageBox_re").destroy();
                                },
                              },
                              {
                                text: "ยกเลิก",
                                handler: function () {
                                  win.destroy();
                                },
                              },
                            ],
                          }).show();
                          return;
                        }
                      }

                      var form = Ext.getCmp(Ext.poFormID).getForm();
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
                    } else {
                      Ext.Msg.alert("แจ้งเตือน", msg);
                    }
                  },
                  //haddler
                },
                {
                  text: Ext.GLOBAL_BU_BACK_TH,
                  iconCls: "icon-cancel",
                  handler: function () {
                    Ext.getCmp("winMain").hide();
                    Ext.getCmp("winMain").destroy();
                  },
                },
              ],
            }),
          ],
        },
      ],
    });
  };

  var tab2 = function () {
    function getPDF(a) {
      if (a) return "เอกสาร PDF";
      else return "ยังไม่อัพโหลดเอกสาร";
    }
    var urlUpload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/eis/mnUploadDoc_EIS_PR.php";
    var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/eis/mnUploadDoc_EIS_PR.php";

    return new Ext.Panel({
      labelAlign: "top",
      title: "เอกสารเพิ่มเติมของการทำ PR",
      bodyStyle: "padding:5px",
      id: "frmSubID",
      layout: "fit",
      items: [
        new Ext.FormPanel({
          height: 180,
          layout: "form",
          id: "frmSubItemID",
          url: urlUpload,
          fileUpload: true,
          border: false,
          listeners: {
            beforerender: function () {
              console.log(Ext.selectRow);
            },
          },
          items: [
            {
              xtype: "hidden",
              name: "id",
              value: Ext.selectRow.get("id"),
            },
            {
              xtype: "hidden",
              name: "i_is_upload",
              value: Ext.selectRow.get("i_is_upload"),
            },
            {
              fieldLabel: "hostname",
              xtype: "textfield",
              width: 400,
              readonly: true,
              name: "hostname",
              value: urlUpload,
            },
            {
              fieldLabel: "ชื่อเอกสาร",
              xtype: "textfield",
              width: 400,
              name: "c_code",
              value: Ext.selectRow.get("c_code"),
            },
            {
              xtype: "fileuploadfield",
              id: "upload_pdf1",
              allowBlank: false,
              width: 300,
              emptyText: "เลือกไฟล์ (.pdf)",
              fieldLabel: "เอกสารประกอบ (PDF)",
              name: "upload_pdf1",
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
            },
            {
              xtype: "panel",
              border: false,
              html:
                '<p>Download :: <a type="button" href="' +
                linkDownload +
                "/" +
                Ext.selectRow.get("c_code") +
                ".pdf?T=Tap_" +
                Math.floor(Math.random() * 100000) +
                '" value="facebook" target="_blank" class="buttonx">' +
                getPDF(Ext.selectRow.get("i_is_upload")) +
                "</a></p>",
              //                            html: '<p>Download :: <button onclick="funPDF();">' + Ext.selectRow.get('i_is_upload') + '.pdf</button></p>'
              //                                    + '<p>Download :: ' + linkDownload + '/' + Ext.selectRow.get('c_code') + '.pdf</p>',
            },
          ],
          buttonAlign: "left",
          buttons: [
            {
              text: "บันทึกเอกสาร",
              handler: function () {
                var form = Ext.getCmp("frmSubItemID").getForm();
                form.submit({
                  waitMsg: "Saving Data...",
                  success: function (form, action) {
                    console.log(action.options.params);
                    console.log(action.response.responseText);
                    // Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                    //   return ;
                    // });
                    Ext.Msg.alert("Success", "เรียบร้อย", function (form, action) {
                      Ext.getCmp("tabpanel1").getStore().reload();
                      Ext.selectRow = null;
                      Ext.getCmp("frmSubID").destroy();
                    });
                  },
                  failure: function (form, action) {
                    switch (action.failureType) {
                      case Ext.form.Action.CLIENT_INVALID:
                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                        break;
                      case Ext.form.Action.CONNECT_FAILURE:
                        Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                        break;
                      case Ext.form.Action.SERVER_INVALID:
                        Ext.Msg.alert("Failure", action.result.msg);
                    }
                  },
                });
              },
            },
            {
              text: Ext.GLOBAL_BU_BACK_TH,
              handler: function () {
                Ext.getCmp("frmSubID").destroy();
              },
            },
          ],
        }),
      ],
    });
  }; // END FUNCTION

  function SearchFrm() {
    return new Ext.Window({
      title: "ค้นหารายการ",
      width: 700,
      id: "winSearchFrm",
      height: 280,
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
                  fieldLabel: "รหัส PR",
                  id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                  name: "c_code",
                },
                {
                  xtype: "datefield",
                  fieldLabel: "วันที่ PR",
                  id: "sd_tor_dateID",
                  name: "d_tor_date",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "เลขที่อ้างอิง",
                  id: "sd_doc_refID",
                  name: "d_doc_ref",
                },
                {
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
                      boxLabel: "ทั้งหมด",
                    },
                    {
                      name: "i_post",
                      inputValue: 1,
                      boxLabel: "ผ่านรายการแล้ว",
                    },
                    {
                      name: "i_post",
                      inputValue: 2,
                      boxLabel: "ยังไม่ผ่านรายการ",
                    },
                    {
                      name: "i_post",
                      inputValue: 3,
                      boxLabel: "ทักท้วง",
                    },
                  ], //radiogroup
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
                  fieldLabel: "เรื่อง PR",
                  id: "sc_nameID",
                  name: "c_name",
                },
                new Ext.form.ComboBox({
                  mode: "local",
                  store: new Ext.data.JsonStore({
                    autoDestroy: false,
                    autoLoad: false,
                    url: "api/All_spAlert.php",
                    baseParams: {
                      type: "sp_type_status",
                      i_is_type_tor: true,
                      all: "all",
                    },
                    root: "data",
                    idProperty: "id",
                    fields: ["id", "c_name"],
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
                    afterrender: function () {
                      //setLoad&&callback
                      this.store.load({
                        callback: function (record, operation, success) {
                          if (success) {
                            Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                          }
                        },
                      });
                    },
                  },
                }),
                new Ext.form.ComboBox({
                  mode: "local",
                  store: Ext.dc_cost,
                  // all: "all",
                  anchor: "100%",
                  fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                  readOnly: true,
                  submitValue: true,
                  hiddenName: "stor_type_id",
                  name: "dc_cost3_id",
                  id: "dc_cost3_idID",
                  valueField: "id",
                  displayField: "c_name",
                  triggerAction: "all",
                  forceSelection: false,
                  selectOnFocus: true,
                  typeAhead: false,
                  emptyText: "กรุณาเลือก",
                  listeners: {
                    render: function (combo) {
                      tooltip_ComboBox(combo, "c_name");
                    },
                    //                                        change:function(){
                    //                                            Ext.getCmp('d_doc_refID').DocValid();
                    //                                        },
                    afterrender: function () {
                      //setLoad&&callback
                      this.store.load({
                        callback: function (record, operation, success) {
                          if (success) {
                            Ext.getCmp("dc_cost3_idID").setValue(this.data.items[0].get("c_code"));
                          }
                          // if (Ext.dc_cost2== )
                        },
                      });
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
                  columns: [80, 90],
                  fieldLabel: "สถานะการใช้งาน",
                  id: "searchEnabledID",
                  // hidden: true,
                  name: "si_enabled",
                  items: [
                    {
                      name: "si_enabled",
                      checked: true,
                      inputValue: 1,
                      boxLabel: "ใช้งาน",
                    },
                    {
                      name: "si_enabled",
                      inputValue: 2,
                      boxLabel: "ไม่ใช้งาน",
                    },
                  ], //radiogroup
                },
              ],
            },
          ],
          buttonAlign: "left",
          buttons: [
            {
              text: "ค้นหา",
              iconCls: "page_magnify",
              handler: function () {
                Ext.getCmp("winSearchFrm").search();
              },
            },
            {
              text: "ปิด",
              iconCls: "icon-concel",
              handler: function () {
                Ext.getCmp("winSearchFrm").hide();
              },
            },
          ],
        },
      ],
      listeners: {
        afterRender: function (thisForm, options) {
          this.search = function () {
            Ext.storeDtl.setBaseParam("mode", "LIST");
            Ext.storeDtl.setBaseParam("act", "SEARCH");
            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
            Ext.storeDtl.setBaseParam("dc_cost3_id", Ext.getCmp("dc_cost3_idID").getValue());

            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
            Ext.storeDtl.setBaseParam("d_doc_ref", Ext.getCmp("sd_doc_refID").getValue());
            Ext.storeDtl.load();
          };
          new Ext.KeyNav("winSearchFrm", {
            enter: function (e) {
              this.search();
            },
            scope: this,
          });
        },
      },
    });
  }
  var MenuButton = function () {
    var menu = new Ext.menu.Menu({
      id: "mainMenu",
      border: false,
      style: {
        overflow: "visible",
      },
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
    menu
      .add({
        text: "ค้นหาข้อมูล",
        icon: "../images/icons/book_magnify.png",
      })
      .on(
        "click",
        (click = function () {
          if (!Ext.isEmpty(Ext.getCmp("winSearchFrm"))) Ext.getCmp("winSearchFrm").destroy();
          var s1 = SearchFrm();
          s1.show();
          Ext.getCmp("sc_codeID").focus(false, 20);
        })
      );
    menu
      .add({
        text: "เพิ่มข้อมูล",
        icon: "../images/icons/add.png",
      })
      .on(
        "click",
        (click = function () {
          Ext.buAct = "add";
          Ext.loadStore("add", false); // app,data.load
        })
      );
    tb.doLayout();
    return tb;
  }; //MenuButton

  /////////////////// gridMain
  Ext.extend(
    (gridMain = function () {
      var colmnn = [
        new Ext.grid.RowNumberer({
          header: "ที่",
          dataIndex: "no",
          id: "idID",
          sortable: true,
          width: 30,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            return record.get("no");
          },
        }),
        {
          header: "id",
          sortable: false,
          align: "left",
          dataIndex: "id",
          hidden: true, // icon: "../images/icons/application_view_tile.png"
        },
        {
          header: "สถานะ",
          sortable: false,
          align: "left",
          dataIndex: "c_code_status",
          hidden: true,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            return value == null ? "" : value + " " + record.get("c_name_status");
          },
        },
        {
          header: "รหัส PR",
          sortable: true,
          align: "left",
          dataIndex: "c_codeStatus",
          width: 140,
        },
        {
          header: "อัพเดทสถานะ",
          sortable: false,
          align: "center",
          dataIndex: "id",
          id: "processDueID",
          width: 120,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            //                            metaData.attr = "style='cursor:pointer; text-align:center;';";
            var BtnText, IconImg;
            if (!Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") != null) {
              BtnText = "&nbspผ่านรายการแล้ว";
              IconImg = "../images/icons/application_go.png";
            } else if (Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") == null) {
              BtnText = "&nbspบันทึกแล้ว";
              IconImg = "../images/icons/application_form.png";
            } else {
              BtnText = "&nbspบันทึกแล้ว";
              IconImg = "../images/icons/cog_start.png";
            }
            var style = "font-size:12px;border:1px solid #ccc; width:110px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";
            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
          },
        },
        {
          header: "เรื่อง/โครงการ",
          sortable: true,
          align: "left",
          dataIndex: "c_name",
          width: 250,
        },
        {
          header: "เอกสาร PR",
          sortable: false,
          width: 105,
          align: "center",
          dataIndex: "pr_check_pdf",
          id: "pr_check_pdfID",
          // editor: new Ext.form.TextField({}),
          renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            if (record.get("i_is_upload") == 0) return '<img src="../images/icons/bullet_cross.png"); style="cursor:pointer"/>';
            else return '<img src="../images/icons/icon_pdf.png");/>';
          },
        },
        {
          header: "เลขสารบัญรับ",
          sortable: true,
          align: "left",
          hidden: true,
          dataIndex: "index_receive",
          width: 80,
        },
        {
          header: "สถานะรายการ",
          sortable: true,
          align: "left",
          dataIndex: "c_name_status",
          id: "c_name_statusID",
          width: 150,
          renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            let vv = record.data.i_status_last;
            let color = "";
  
            if (record.data.tor_status_id == 21) {
              color = "green";
            // } else if (record.data.i_sub_status == "0.21") {
            } else if (record.data.i_sub_status == "0.30") {
              color = "black";
              color = "#FFA80F"; //yellow
              color = "green";
            } else {
            }
            metaData.attr = 'style="font-weight: bold; color: ' + color + ';"';
            return value;
          },
        },
        {
          header: "วันที่ PR",
          sortable: false,
          align: "center",
          dataIndex: "d_tor_date",
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return shortThaiDate(val);
          },
        },
        {
          header: "วิธีดำเนินงาน",
          width: 90,
          sortable: false,
          align: "left",
          dataIndex: "c_tor_type",
        },
        {
          header: "ขอดำเนินการ",
          sortable: false,
          align: "center",
          width: 70,
          dataIndex: "c_purchase",
        },
        {
          header: "ประเภทการใช้เงิน",
          sortable: false,
          align: "left",
          width: 120,
          dataIndex: "i_type_bgTxt",
        },
        {
          header: "รหัสเอกสารอ้างอิง",
          sortable: false,
          align: "center",
          dataIndex: "d_doc_ref",
        },
        {
          header: "หน่วยงานที่รับผิดชอบ",
          align: "left",
          dataIndex: "dc_cost_idTxt",
        },
        {
          header: "หน่วยงานเจ้าของเรื่อง",
          align: "left",
          dataIndex: "dc_cost2_idTxt",
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
        },
        {
          header: "หน่วยงานแก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_update_cost_id",
        },
        {
          header: "วันที่แก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "d_update",
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return shortThaiDate(val);
          },
        },
      ];

      gridMain.superclass.constructor.call(this, {
        region: "center",
        title: Ext.title,
        xtype: "grid",
        id: "tabpanel1",
        border: true,
        stripeRows: true,
        loadMask: true,
        //------------------
        layout: "fit",
        clicksToEdit: 2,
        // clicksToEdit: 2,
        viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false,
            getRowClass: function (record, index, rowParams) {
               //   if (record.data.i_enable != 1) {
              //     return "delete-color-red";
              //   }
              if (record.data.i_is_upload == 1 && record.data.tor_status_id > 0 && record.data.tor_status_id != 21  ) {
                  return "color-green";
                } else if (record.data.tor_status_id == 21 )  {
                  return "color-yellow";
                  
                }
                // return "color-green";
                // if (record.data.i_sub_status == "0.21") {
                //   return "color-yellow";
                // }
                // if (record.data.i_sub_status > "0.21") {
                //   return "color-green";
                // return "color-grey";
                // }
            },
          },
        listeners: {
          contextmenu: function (e) {
            e.stopEvent();
            console.log(Ext.selectRow);
            var mymenu = new Ext.menu.Menu({
              items: [
                {
                  text: "แนบไฟล์ PDF",
                  icon: "../images/icons/icon_pdf.png",
                  handler: function (e) {
                    console.log(Ext.selectRow);
                    Ext.buAct = "getDetail";
                    if (Ext.isEmpty(Ext.selectRow) || Ext.selectRow.get("c_code") == "") {
                      Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                    } else if (Ext.isEmpty(Ext.getCmp("frmSubID"))) {
                      if (Ext.selectRow.data.c_code == null) {
                        Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
                      } else {
                        var ttb = tab2();
                        Ext.getCmp("contenterCenter").add(ttb);
                        Ext.getCmp("contenterCenter").setActiveTab(ttb);
                      }
                    } else {
                      if (Ext.selectRow.data.c_code == null) {
                        Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
                      } else {
                        Ext.getCmp("frmSubID").destroy();
                        var ttb = tab2();
                        Ext.getCmp("contenterCenter").add(ttb);
                        Ext.getCmp("contenterCenter").setActiveTab(ttb);
                      }
                    }
                  },
                  scope: this,
                },
                {
                  text: "เพิ่มข้อมูล",
                  icon: "../images/icons/add.png",
                  handler: function (e) {
                    Ext.buAct = "add";
                    Ext.loadStore("add", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "จัดการข้อมูล View/Copy/Edit/Delete",
                  icon: "../images/icons/application_edit.png",
                  handler: function (e) {
                    Ext.buAct = "update";
                    Ext.loadStore("edit", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow.data.c_code + '"',
                  hidden: Ext.selectRow.data.c_code ==  null ?  true :false ,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow.data.c_code);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow.data.d_doc_ref + '"',
                  hidden: Ext.selectRow.data.d_doc_ref ==  null ?  true :false ,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow.data.d_doc_ref);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow.data.dc_user_create_id + '"',
                  hidden: (Ext.selectRow.data.dc_user_create_id ==  null && Ext.session.user_id == 1) ?  true :false ,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow.data.dc_user_create_id);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow.data.dc_user_update_id + '"',
                  hidden: Ext.selectRow.data.dc_user_update_id ==  null && Ext.session.user_id == 1 ?  true :false ,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow.data.dc_user_update_id);
                  },
                },
              ],
              listeners: {
                beforerender: function () {
                  Ext.receiveJson = function (obj, id) {
                    let Date_now = new Date();
                    let jsonApplay = Ext.apply(obj, {
                      client_datetime: Date_now.format("Y-m-d H:i:s"),
                      user_sent_id: Ext.session.user_id,
                      user_id: id,
                      user_sent_name: Ext.session.user_name,
                      c_menu: "checking",
                      dc_department_id: 0,
                      dc_cost_id: 32,
                      i_status: 1,
                    });
                    if (id != 0)
                      //sent all
                      Ext.Ajax.request({
                        url: "../php-notic/insertLoger.php",
                        method: "POST",
                        params: jsonApplay,
                        success: function (response) {},
                      });
                  };
                },
                hide: function () {
                  setTimeout(function () {
                    mymenu.destroy();
                  }, 0);
                },
              },
            });
            mymenu.showAt(e.getXY());
          },
          dblclick: function (dataview, index, item, e) {
            Ext.getBody().on("click", function (e, target) {
              // console.log("คลิกที่ รายการ PR!");
              if (target.innerText.includes("รายการ PR")) {
              }
            });            
            Ext.buAct = "update";
            Ext.selectDefault = Ext.selectRow;

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
                  text: "แนบไฟล์ PDF",
                  icon: "../images/icons/icon_pdf.png",
                  handler: function (e) {
                    Ext.buAct = "getDetail";
                    if (Ext.isEmpty(Ext.selectRow) || Ext.selectRow.get("c_code") == "") {
                      Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                    } else if (Ext.isEmpty(Ext.getCmp("frmSubID"))) {
                      if (Ext.selectRow.data.c_code == null) {
                        Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
                      } else {
                        var ttb = tab2();
                        Ext.getCmp("contenterCenter").add(ttb);
                        Ext.getCmp("contenterCenter").setActiveTab(ttb);
                      }
                    } else {
                      if (Ext.selectRow.data.c_code == null) {
                        Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
                      } else {
                        Ext.getCmp("frmSubID").destroy();
                        var ttb = tab2();
                        Ext.getCmp("contenterCenter").add(ttb);
                        Ext.getCmp("contenterCenter").setActiveTab(ttb);
                      }
                    }
                  },
                  scope: this,
                },
                {
                  text: "เพิ่มข้อมูล",
                  icon: "../images/icons/add.png",
                  handler: function (e) {
                    Ext.buAct = "add";
                    Ext.loadStore("add", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "จัดการข้อมูล View/Copy/Edit/Delete",
                  icon: "../images/icons/application_edit.png",
                  handler: function (e) {
                    Ext.buAct = "update";
                    Ext.loadStore("edit", true); // app,data.load
                  },
                  scope: this,
                },

              ],
            });
          },
          afterrender: function (grid) {
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
            this.on("cellclick", cellClick, this); //cellClick
            this.on(
              "contextmenu",
              function (e, grid, rowIndex, columnIndex) {
                e.stopEvent();
                // this.contextMenu.showAt(e.getXY());
              },
              this
            );
          },
        },
        store: Ext.storeDtl,
        tbar: [
          {
            xtype: "buttongroup",
            columns: 1,
            title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            defaults: { scale: "small", style: "float: left" },
            listeners: {
              afterrender: function (cmp) {
                if (cmp.header.id) {
                  document.getElementById(cmp.header.id).style.cssText = " display: flex; justify-content: space-between; width: 99%;";
                  document.getElementById(cmp.header.id).innerHTML += `
                    <button onclick="sp_manual(event)" type="button" style="display: flex; padding: 0px; height: 15px; font-size: 10px; color: red; font-weight: bold;">
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
                  { xtype: "label", text: "ค้นหาโดย : " },
                  { xtype: "tbspacer", width: 4 },
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
                        ["c_code", "เลขPR"],
                        ["c_doc_ref", "เลขที่อ้างอิง"],
                        ["c_name", "ชื่อรายการ"],
                        // ["c_overlap", "เลขที่ใบกัน"],
                        // ["c_code_po", "เลขสัญญา"],
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
                  { xtype: "tbspacer", width: 4 },
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
                    width: 400,
                    value: "0",
                    listeners: {
                      render: function (combo) {
                        tooltip_ComboBox(combo, "c_name");
                      },
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
                  //     },
                  //   },
                  // }),
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  // { xtype: "label", text: "หน่วยงาน : " },
                  // { xtype: "tbspacer", width: 4 },
                  // { xtype: "tbspacer", width: 4 },
                  // { xtype: "label", text: "สถานะ : " },
                  // { xtype: "tbspacer", width: 4 },
                  // {
                  //   id: "s_i_status",
                  //   xtype: "combo",
                  //   width: 100,
                  //   mode: "local",
                  //   store: new Ext.data.SimpleStore({
                  //     fields: ["value", "text"],
                  //     data: [
                  //       ["0", "ทั้งหมด"],
                  //       ["1", "1 - จัดทำใบขอเบิก"],
                  //       ["2", "2 - ส่งใบเบิก"],
                  //       ["3", "3 - ทักท้วง"],
                  //       ["4", "4 - อนุมัติฏีกา"],
                  //       ["5", "5 - หัวหน้าฝ่ายการคลังลงนาม"],
                  //       ["6", "6 - ผู้บริหารลงนาม"],
                  //       ["7", "7 - ผู้บริหารลงนาม"],
                  //       ["8", "8 - จัดทำเช็ค"],
                  //       ["9", "9 - หัวหน้าฝ่ายการคลังลงนามเช็ค"],
                  //       ["10", "10 - ผู้บริหารลงนามเช็ค"],
                  //       ["11", "11 - ทำทะเบียนจ่าย"],
                  //     ],
                  //   }),
                  //   value: "0",
                  //   valueField: "value",
                  //   displayField: "text",
                  //   allowBlank: false,
                  //   editable: false,
                  //   triggerAction: "all",
                  //   typeAhead: false,
                  // },
                ],
              },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "เปิดหน้าบันทึก",
                    id: "buAdd",
                    // hidden: Ext.I_SUB_STATUS_BEFORE == "3.00" ? true : false,
                    iconCls: "icon-add",
                    handler: function (grid, rowIndex, colIndex) {
                        Ext.buAct = "add";
                        Ext.loadStore("add", false); // app,data.load
                        Ext.dc_cost_sys_main_all.baseParams = {type: "dc_cost_sys_main",  i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS}
                        Ext.dc_cost_sys_main_all.load();
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
            columns: 1,
            // hidden:true,
            defaults: { scale: "small", style: "float: right" },
            items: [
            
              {
                xtype: "buttongroup",
                frame: false,
                //   hidden:true,

                items: [
                  { xtype: "label", hidden:true, text: "ปีของสัญญา : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.ComboBox({
                    id: "s_i_year_contract",
                    mode: "local",
                    store: Ext.store_yearSearch,
                    valueField: "id",
                    hidden:true,
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
              },
              {
                xtype: "buttongroup",
                // hidden: Ext.session.user_id == 1 ? false : true,
                frame: false,
                items: [
                  { xtype: "label", text: "ส่วนงาน    : " },
                  { xtype: "tbspacer", width: 6 },
                  new Ext.form.ComboBox({
                    id: "s_dc_cost_acc_id",
                    mode: "local",
                    store: Ext.dc_cost_sys_main_all,
                    valueField: "id",
                    readOnly : Ext.session.user_id == 1 ? false : true,
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
                      render: function (combo) {
                        tooltip_ComboBox(combo, "c_name");
                      },
                      afterrender: function () {
                        this.fn = function () {};
                        this.change_set = function () {
                          Ext.dc_cost.load({ params: { dc_cost_acc_id: this.value ,i_read: 4 } });
                          // Ext.dc_expense_budget_type_all.load({ params: { dc_cost_acc_id: this.value } });
                          Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
                        };
                      },
                      select: function () {
                        this.change_set();
                      },
                      Change: function () {
                        this.change_set();
                        Ext.dc_cost.load({ params: { dc_cost_acc_id: this.value ,i_read: 4 } });
                        // Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: this.value } });
                        Ext.getCmp("s_dc_cost_idID").setValue("");
                        // Ext.getCmp("dc_expense_budget_type_id").setValue("");
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
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                // hidden: Ext.session.user_id == 1 ? false : true,
                items: [
                  { xtype: "label", text: "ฝ่ายงาน : " },
                  { xtype: "tbspacer", width: 5 },
                  new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_cost, 
                    // anchor: "70%",
                    readOnly : Ext.session.user_id == 1 ? false : true,
                    // value: Ext.session.dc_cost_id,
                    fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                    valueField: "id",
                    displayField: "c_name",
                    hiddenName: "dc_cost_id",
                    id: "s_dc_cost_idID",
                    name: "c_cost_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    validator: function (val) {
                      if (!Ext.isEmpty(val)) {
                        return true;
                      } else {
                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                      }
                    },
                    listeners: {
                      render: function (combo) {
                        tooltip_ComboBox(combo, "c_name");
                      },
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
                ]
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ปีประมาณ : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.ComboBox({
                    id: "s_i_budget_year",
                    mode: "local",
                    store: Ext.store_yearSearch,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 150,
                    value: 0,
                    //   value: Ext.bgYear,
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
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ปีที่ใช้ประมาณ : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.ComboBox({
                    id: "s_i_budget_year_overlap",
                    mode: "local",
                    store: Ext.store_yearSearch,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 150,
                    value: 0,
                    //   value: Ext.bgYear,
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
              },

              {
                xtype: "buttongroup",
                frame: false,
                hidden:true,
                items: [
                  { xtype: "label", text: "ประเภทสัญญา : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "i_type_contract",
                    xtype: "combo",
                    readOnly : true,
                    width: 159,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["value", "text"],
                      data: [
                        ["0", "ทั้งหมด"],
                        ["1", "สัญญา"],
                        ["2", "ใบสั่ง"],
                        ["3", "จะซื้อจะขาย"],
                        //   ["4", "รับคืนทักท้วง (หน่วยงาน)"],
                        //   ["5", "บันทึกโดยระบบบริหารพัสดุ"],
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
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "สถานะการจอง : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "s_i_enable",
                    xtype: "combo",
                    readOnly: true,
                    width: 80,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["value", "text"],
                      data: [
                        ["0", "ทั้งหมด"],
                        ["1", "ใช้เงินแล้ว"],
                        ["2", "ยังไม่ได้ระบุ"],
                        ["3", "ไม่ต้องระบุ"],
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
                ],
              },
              {
                xtype: "buttongroup",
                fieldLabel: "",
                hidden: true,
                height: 22,
                frame: false,
                items: [
                  { xtype: "label", text: "วันที่สร้างรายการ : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.Checkbox({
                    id: "checkbox_date",
                    boxLabel: "",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      afterrender: function () {},
                      check: function (combo, newValue) {
                        if (newValue == true) {
                          Ext.getCmp("date_start").show();
                          Ext.getCmp("date_end").show();
                          Ext.getCmp("displayfield_date").show();
                        } else {
                          Ext.getCmp("date_start").hide();
                          Ext.getCmp("date_end").hide();
                          Ext.getCmp("displayfield_date").hide();
                        }
                      },
                    },
                  }),
                  { xtype: "tbspacer", width: 4 },
                  {
                    xtype: "datefield",
                    id: "date_start",
                    width: 110,
                    value: addY(543),
                  },
                  {
                    xtype: "displayfield",
                    value: "&nbsp;&nbsp;ถึงวันที่&nbsp;&nbsp;",
                    id: "displayfield_date",
                    align: "center",
                  },
                  {
                    xtype: "datefield",
                    id: "date_end",
                    width: 110,
                    value: addY(543),
                  },
                  { xtype: "tbspacer", width: 269 },
                ],
                listeners: {
                  afterrender: function () {
                    Ext.getCmp("date_start").hide();
                    Ext.getCmp("date_end").hide();
                    Ext.getCmp("displayfield_date").hide();
                  },
                },
              },
              {
                xtype: "buttongroup",
                hidden: true,
                frame: false,
                items: [
                  { xtype: "label", text: " : " },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "s_checkbox_c_code_po",
                    boxLabel: "มีเลขที่สัญญา",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {},
                    },
                  }),
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "s_i_booking",
                    boxLabel: "มีเลขที่ PR",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {},
                    },
                  }),
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "i_pdf",
                    boxLabel: "ที่มีเอกสาร PDF",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {},
                    },
                  }),
                  { xtype: "tbspacer", width: 0 },
                ],
              },
            ],
          },
          { xtype: "tbfill" },
          {
            xtype: "container",
            items: [
              { xtype: "container", height: 92 },
              {
                xtype: "label",
                html: '<img src="../images/icons/information.png">',
                layout: {
                  pack: "center",
                  type: "hbox",
                },
                listeners: {
                  render: function (c) {
                    var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
                    var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span>ผ่านรายการ</span>";
                    text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FEF8C2;'>∎</span>บันทึกรายการสัญญา</span><br>";
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
          },
        ],
        columns: colmnn,
        bbar: new Ext.PagingToolbar({
          pageSize: 20,
          store: Ext.storeDtl,
          displayInfo: true,
          displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
      });
    }),
    Ext.grid.GridPanel,
    {}
  ); //EditorGridPanel or GridPanel
  ///////////////// EditorGridPanel
};
//OnLoad Renderer
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.user_right_add = user_right_add;
  Ext.user_right_edit = user_right_edit;
  Ext.user_right_delete = user_right_delete;
  Ext.i_pr_about = 1;
  Ext.ar_pr_about = [];
  Ext.bg_period = []; //ประเภทเงินงวดอุดหนุ่น
  Ext.AppUx("SP", "TOR สมบูรณ์"); //app & show menu
  var App = new Ext.Viewport({
    layout: "border",
    items: new Ext.TabPanel({
      region: "center",
      border: false,
      id: "contenterCenter",
      defaults: {
        autoScroll: true,
        layout: "fit",
      },
      listeners: {
        afterrender: function () {
          Ext.loadStore("load", false); //status,show
        },
      },
      items: [new gridMain()],
    }),
  });
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  Ext.getCmp("tabpanel1").on("beforeedit", function () {
    return false;
  });
});