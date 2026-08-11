const Uiedit_contractNew = function (rec) {
  Ext.SpHoliday = new Ext.data.JsonStore({
    autoLoad: true,
    storeId: "myStoreCost",
    url: "api/All.php",
    baseParams: { type: "List_spHoliday" },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["no", "id", "d_holiday", "c_name"],
  });

  function addDays(date, numDays) {
    var newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }
  function isSameDate(d1, d2) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  }
  function parseThaiDate(v) {
    if (!v) return null;
    if (Ext.isDate(v)) {
      return new Date(v.getFullYear(), v.getMonth(), v.getDate());
    }
    if (typeof v === "string") {
      var p = v.split(/[-/]/); // รองรับทั้ง - หรือ /
      if (p.length < 3) return null;
      var d = parseInt(p[0], 10);
      var m = parseInt(p[1], 10) - 1;
      var y = parseInt(p[2], 10);
      if (y > 2400) y -= 543; // แปลง พ.ศ. -> ค.ศ.
      return new Date(y, m, d);
    }
    return null;
  }
  function calculateBusinessEndDate(startDate, numberOfBusinessDays, holidayStore) {
    var endDate = new Date(startDate);
    var count = 0;
    while (count < numberOfBusinessDays) {
      endDate = addDays(endDate, 1); // ✅ ใช้ฟังก์ชัน addDays แทน Ext.Date.add

      // ข้ามเสาร์-อาทิตย์
      if (endDate.getDay() === 0 || endDate.getDay() === 6) continue;

      // ข้ามวันหยุดใน store
      var isHoliday =
        holidayStore.findBy(function (rec) {
          var h = rec.get("d_holiday");
          if (!h) return false;
          var holidayDate = new Date(h);
          return isSameDate(holidayDate, endDate); // ✅ เปรียบเทียบวัน
        }) !== -1;
      if (!isHoliday) {
        count++; // ✅ เพิ่มเฉพาะวันที่ไม่ใช่วันหยุด
      }
    }

    return endDate;
  }

  function i_dayID_ChangeNew() {
    if (Ext.getCmp("i_dayID").getValue() != "") {
      var Text_alert = "";
      if (Ext.getCmp("d_doc_datePerID").getValue() == "") {
        Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
      }
      if (Ext.getCmp("i_dayID").getValue() < 0) {
        Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
      }

      if (Text_alert == "") {
        var day = Ext.getCmp("i_dayID").getValue();
        var oneDay = 24 * 60 * 60 * 1000;
        var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_datePerID").getValue(), "Y/m/d"));
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
      Ext.selectRow.json.po_expense_id +
      "/i_last/" +
      (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
      "/f_amt/" +
      v;

    Ext.Ajax.request({
      url: link,
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success) {
          var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_budget_type_id, "c_name");
          var c_name_po_expense_id = getStoreItems(Ext.po_expense, Ext.selectRow.get("po_expense_id"), "c_name");
          Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
            var alert_text = "มีการจองเงิน PO " + "\n";
            alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
            alert_text += "PR : " + Ext.selectRow.json.pr_code + "\n";
            alert_text += "เลขที่สัญญา : " + Ext.selectRow.data.c_code + "\n";
            // alert_text += "Host : " + location.host + "\n";
            alert_text += "แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n";
            alert_text += "หมวดค่าใช้จ่าย : " + c_name_po_expense_id + "\n";
            // alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
            alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
            alert_text += "ชื่อรายการ : " + Ext.selectRow.get("c_name") + "\n";
            alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
            alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
            Ext.Ajax.request({
              url: Ext.session.Notif_line,
              method: "POST",
              params: {
                msg: alert_text,
                mode: 3,
              },
            });
            updateBookingContract(Ext.selectRow.get("sp_tor_contract_id"), jsonData.bg_reserve_money_id, ii);
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          });
        } else {
          Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        }
      },
      failure: function (result, request) {
        console.log(result);
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
        Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
      },
    });
    return link;
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
    } else if (ii == 2) {
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
    } else {
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
          mode: "UPDATE_CONTRACT3_BG", //UPDATE_TOR_DTL_BG
          sp_tor_contract_id: id, //sp_dtl_id
          bg_reserve_money3_id: bg_reserve_money_id,
          i_pr_type3: Ext.getCmp("i_pr_type2ID").getValue().inputValue,
          f_type3_amt: Ext.getCmp("f_type3_amtID").getValue(),
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

  function genBookBg2(v, i) {
    var ii = i;
    //  var ip = 'localhost';  // 192
    var ip = Ext.session.ip_booking; // 192
    var dc_budget_type_id = 0;
    var i_pr_type1 = 0;

    i_pr_type1 = Ext.selectRow.get("i_pr_type2");
    dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type2_id");

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
      Ext.selectRow.json.po_expense_id +
      "/i_last/" +
      (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
      "/f_amt/" +
      v;
    Ext.Ajax.request({
      url: link,
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success) {
          Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
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
  function genBookBg3(v, i) {
    var ii = i;
    //  var ip = 'localhost';  // 192
    var ip = Ext.session.ip_booking; // 192
    var dc_budget_type_id = 0;
    var i_pr_type1 = 0;

    i_pr_type1 = Ext.selectRow.get("i_pr_type3");
    dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type3_id");

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
    Ext.Ajax.request({
      url: link,
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success) {
          Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
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
  Ext.getCmp("tabpanel1").getEl().unmask();
  function destroyWinContractNew() {
    const win = Ext.getCmp("wincontractNewID");
    if (win && !win.isDestroyed) {
      win.destroy(); // ทำลาย window
      console.log("✅ wincontractNewID ถูก destroy แล้ว");
    } else {
      console.warn("⚠️ ไม่พบ wincontractNewID หรือถูก destroy ไปแล้ว");
    }
  }

  Ext.dc_expense_budget_type2.load({
    params: {
      c_dc_expense_budget_type2_id: rec.data.dtl_dc_bg_budget_type_id2,
      c_dc_expense_budget_type_id: rec.data.dtl_dc_bg_budget_type_id1,
      c_dc_expense_budget_type3_id: rec.data.dtl_dc_bg_budget_type_id3,
    },
  });
  window.loadToForm = function (id) {
    const store = Ext.getCmp("gridSub1ID").getStore();
    console.log(store);
    const rec = store.findRecord("id", id);

    if (rec) {
      Ext.getCmp("i_periodID").setValue(rec.get("i_period"));
      Ext.getCmp("d_doc_dateID").setValue(rec.get("d_doc_date"));
      Ext.getCmp("d_due_dateID").setValue(rec.get("d_due_date"));
      Ext.getCmp("i_pr_type2ID").setValue(rec.data.i_pr_type1);
      Ext.getCmp("f_totalID").setValue(floatRenderer(rec.get("f_total_amt")));
    }
  };
  function bgBagedOver(rec, i) {
    Ext.rec = rec;
    console.log(rec);
    var ip = Ext.session.ip_booking; // 192

    if (rec.get("i_overlap") === 2) return false;
    else
      return new Ext.Window({
        id: "winDcExpTypeDdd2ID",
        modal: true,
        width: 850,
        title: "ใช้เงินใบกันเหลื่อม" + Ext.selectRow.get("f_total_amt"),
        layout: "fit",
        height: 300,

        items: new Ext.FormPanel({
          frame: true,
          labelWidth: 160,
          padding: "10px 10px 10px 10px",
          url: "tor/api/mnBgExpenseController3.php",
          //                    url: "tor/api/mnBgExpenseController2.php",
          id: "formDcExpTypeDddID",
          items: [
            {
              xtype: "hidden",
              name: "sp_tor_contract_id",
              value: Ext.selectRow.get("sp_tor_contract_id"),
              id: "sp_tor_contract_idID",
            },
            {
              xtype: "hidden",
              name: "i_overlap",
              value: Ext.selectRow.get("i_overlap"), //1 ก่อนจอง 2 จองแล้ว
              id: "i_overlapID",
            },
            {
              xtype: "hidden",
              name: "mode",
              id: "modesubID",
              value: "UPDATEIOVER1", //1 ก่อนจอง 2 จองแล้ว
            },
            Ext.PopDepartmentForm.mini,
            // {
            //   xtype: "textfield",
            //   fieldLabel: "ปีเลขที่ของใบกัน",
            //   // readOnly: true,
            //   name: "yearTxt",
            //   value: rec.get("i_yyyy_overlap"),
            //   id: "i_yearOverlapID",
            // },
            new Ext.form.ComboBox({
              mode: "local",
              fieldLabel: "ใช้เงินปีงบประมาณ",
              allowBlank: false,
              submitValue: true,
              id: "i_yearOverlapID",
              hiddenName: "yearTxt",
              name: "yearTxt",
              store: Ext.store_year,
              valueField: "id",
              displayField: "c_name",
              value: Ext.bgYear,
              // readOnly: true,
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกปีงบประมาณ...",
              listeners: {
                afterrender: function () {
                  this.ReadOnly_set = function (set) {
                    this.setReadOnly(set);
                    this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                  };
                  this.fn = function () {};
                  this.select_value = function () {
                    if (Ext.getCmp("i_budget_year").getValue() > this.getValue()) {
                      // Ext.bg_expense_have.load();
                      // Ext.getCmp("BuPopSelectID").disable();
                      Ext.getCmp("c_booking_radiogroup").show();
                      Ext.getCmp("c_bookingID").setReadOnly(false);
                      // Ext.getCmp("winPeriodHdrID").getEl().mask("Please wait...", "x-mask-loading");
                      Ext.booking_store.load({
                        params: { dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(), i_yyyy_overlap: Ext.getCmp("i_yyyy_overlapID").getValue() },
                        callback: function (record, success) {
                          if (success) {
                            // console.log(3);
                            // Ext.getCmp("winPeriodHdrID").getEl().unmask();
                            // Ext.getCmp("winPeriodHdrID").getEl().mask("Please wait...", "x-mask-loading");
                          }
                        },
                      });
                    } else if (this.getValue() == Ext.getCmp("i_budget_year").getValue()) {
                      Ext.getCmp("c_bookingID").setReadOnly(true);
                      Ext.getCmp("c_booking_radiogroup").hide(true);
                      // Ext.getCmp("c_bookingID").setReadOnly(true);
                    } else {
                      // Ext.getCmp("bg_expense_id").setValue("");
                      Ext.getCmp("c_bookingID").setValue("");
                    }
                  };
                },
                select: function () {
                  this.fn();
                  this.select_value();
                },
                Change: function () {
                  this.fn();
                  this.select_value();
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
              xtype: "displayfield",
              fieldLabel: "หน่วยงาน",
              name: "dc_costTxt",
              value: rec.get("dc_cost_idTxt"),
              id: "dc_cost_idID",
            },
            {
              xtype: "displayfield",
              fieldLabel: "แหล่งเงิน",
              name: "budget_typeTxt",
              value: rec.get("c_expense_budget_type_name"),
              id: "dc_expense_budget_type_idID",
            },
            {
              xtype: "displayfield",
              fieldLabel: "หมวดค่าใช้จ่ายย่อย",
              name: "c_expense_nameTxt",
              value: rec.get("c_expense_name"),
              id: "c_expenseID",
            },
            {
              xtype: "displayfield",
              fieldLabel: "เลขที่ใบกัน",
              name: "c_overlap",
              value: rec.get("c_overlap"),
              id: "c_overlapID",
            },
            {
              fieldLabel: "บันทึกใบกันเหลื่อมผ่าระบบงบประมาณ",
              xtype: "button",
              text: "บันทึกจองกันเหลื่อม",
              width: 80,
              name: "bookOverlap",
              id: "bookOverlapID",
              handler: function () {
                function getCode(event) {
                  switch (event) {
                    case "c_overlap":
                      link =
                        Ext.session.IPAPIBG +
                        "/?/bg/BgBudgetAllSupplies" +
                        "/i_year/" +
                        rec.get("i_yyyy_overlap") +
                        "/dc_expense_budget_type_id/" +
                        rec.get("dc_expense_budget_type_id") +
                        "/dc_cost_id/" +
                        rec.get("dc_cost_id") +
                        "/bg_expense_id/" +
                        rec.get("po_expense_id") +
                        "/c_code_overlap/" +
                        encodeURIComponent(rec.get("c_overlap")) +
                        "/";
                      break;
                    case "c_overlap_book":
                      link =
                        Ext.session.IPAPIBG +
                        "/?/bg/mn_BgReserveMoney/mode/POST" +
                        "/i_sys/1" +
                        "/pr_id/" +
                        rec.get("sp_tor_id") +
                        "/po_id/" +
                        rec.get("sp_tor_contract_id") +
                        "/chk_id/0" +
                        "/i_year/" +
                        rec.get("i_yyyy") +
                        "/i_pr_type/" +
                        1 + //  plan or period
                        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
                        "/dc_cost_id/" +
                        Ext.rec.get("dc_cost_id") +
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
                  }
                  return link;
                }
                function your_func(link) {
                  Ext.Ajax.request({
                    url: link,
                    method: "GET", //POST
                    disableCaching: false,
                    success: function (result, request) {
                      let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                      if (jsonData.data[0].f_overlap_total < parseFloat(rec.get("f_total_amt").replace(/\,/g, ""))) {
                        Ext.Msg.alert("Success", "ไม่สารถใช้เงินกันเหลื่ยเนื่องจากเงินในใบกันไม่พอ", function (form, action) {
                          Ext.getCmp("winDcExpTypeDdd2ID").getEl().unmask();
                        });
                      } else {
                        //BOOK
                        Ext.Ajax.request({
                          url: getCode("c_overlap_book"),
                          method: "GET", //POST
                          disableCaching: false,
                          success: function (result, request) {
                            let jsonData = Ext.util.JSON.decode(result.responseText); //decode json

                            //UPDATE
                            Ext.Ajax.request({
                              url: "tor/api/mnBgExpenseController3.php",
                              method: "POST", //POST
                              params: {
                                mode: "UPDATEIOVER2",
                                sp_tor_contract_id: rec.get("sp_tor_contract_id"),
                                bg_budget_dtl_overlap_id: jsonData.bg_reserve_overlap_id,
                              },
                              success: function (result, request) {
                                let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                // console.log(jsonData);
                                Ext.Msg.alert("Success", "บันทึกการใช้เงินใบกันเหลื่อมเรียบร้อยแล้ว", function (form, action) {
                                  Ext.storeDtl.reload({
                                    callback: function (record, operation, success) {
                                      if (success) {
                                        //บันทึกแล้ว
                                        Ext.each(record, function (value) {
                                          //   // console.log(value);
                                          if (rec.data.sp_tor_contract_id === value.data.sp_tor_contract_id) {
                                            Ext.selectRow = value;
                                            Ext.getCmp("winDcExpTypeDdd2ID").getEl().unmask();
                                            Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                            if (typeof Ext.poFormID !== "undefined" && Ext.getCmp(Ext.poFormID)) {
                                              Ext.getCmp(Ext.poFormID).destroy();
                                            } else if (Ext.getCmp("winMainNew")) {
                                              Ext.getCmp("winMainNew").destroy();
                                            }
                                            Ext.buAct = "update";
                                            Ext.loadStore("editNew", true);
                                          }
                                        });
                                      }
                                    },
                                  });
                                });
                              },
                              failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect
                              },
                            });
                          },
                          failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText); // connect
                          },
                        });
                      }
                    },
                    failure: function (result, request) {
                      Ext.MessageBox.alert("Failed", result.responseText); // connect
                    },
                  });
                }
                Ext.getCmp("winDcExpTypeDdd2ID").getEl().mask("กำลังจองใบกัน...", "x-mask-loading");

                setTimeout(function () {
                  //                                    your_func(getCode('c_overlap_book'));
                  your_func(getCode("c_overlap"));
                }, 5000);
              },
              listeners: {
                afterrender: function () {
                  if (Ext.getCmp("c_overlapID").getValue() == "") {
                    Ext.getCmp("bookOverlapID").hide();
                  }
                },
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
                console.log("asdf");
                var form = Ext.getCmp("formDcExpTypeDddID").getForm();
                var msg = "";
                // console.log(nameID);
                // return ;
                if (Ext.getCmp("bg_budget_dtl_overlap_idID_Name").getValue() == "") {
                  msg += "<span style='white-space: nowrap;'>- กรุณาเลือกใบกันเหลื่อม</span><br>";
                }
                if (msg == "") {
                  form.submit({
                    waitMsg: "Saving Data...",
                    success: function (form, action) {
                      Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                        Ext.storeDtl.reload({
                          callback: function (record, operation, success) {
                            if (success) {
                              //บันทึกแล้ว
                              record.forEach(function (v) {
                                if (Ext.selectRow.get("sp_tor_contract_id") === v.get("sp_tor_contract_id")) {
                                  // Override record
                                  Ext.selectRow = v;
                                  Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                                  // Override window items
                                  var win = bgBagedOver(v, 2);
                                  win.items.items[0].getForm().loadRecord(record);
                                  win.show();
                                  // END
                                }
                              });
                            }
                          },
                        });
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
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", msg);
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
  const delete_contractNew = function (rec) {
    var win = new Ext.Window({
      id: "win-msg-delete",
      title: "ลบรายการ",
      modal: true,
      resizable: false,
      width: 300,
      layout: "form",
      labelWidth: 180,
      bodyStyle: "padding:3px;",
      items: [
        {
          xtype: "textfield",
          readOnly: true,
          width: 50,
          fieldLabel: "คุณต้องการจะลบข้อมูลงวด",
          name: "deledte_i_period_id",
          value: rec.data.i_period,
        },
      ],
      buttons: [
        {
          text: "ตกลง",
          handler: function () {
            Ext.Ajax.request({
              url: "tor/api/mnEditContract.php",
              params: {
                mode: "delete_contractNew",
                SP_TOR_HDR_PERIOD_ID: rec.data.id,
                i_enabled: 2,
              },
              method: "GET", //POST
              success: function (result, request) {
                Ext.storeDtl.reload();
                Ext.storeedit.reload();
                let itemStore = Ext.getCmp("gridSub1ID").getStore();
                itemStore.reload();
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
  loadBgStoreNew = function (id) {
    Ext.idStatus = id;
    Ext.storeDtl.reload({
      callback: function (record, operation, success) {
        if (success) {
          //Override SelectRow Record
          record.forEach(function (v) {
            if (Ext.selectRow.get("sp_tor_contract_id") == v.get("sp_tor_contract_id")) {
              Ext.selectRow = v;
              var rec = v;

              if (Ext.selectRow.get("i_purchase") == 1) {
                //แหล่งเงินที่ 1
                Ext.selectRow.set("f_type_amt", rec.get("dtl_f_type_amt1"));
                Ext.selectRow.set("i_pr_type1", rec.get("dtl_i_pr_type1") / 1);
                Ext.selectRow.set("po_expense_id", parseInt(rec.get("dtl_po_expense_id1")) / 1);
                Ext.selectRow.set("dc_expense_budget_type_id", parseInt(rec.get("dtl_dc_bg_budget_type_id1")) / 1);
                //แหล่งเงินที่ 2
                Ext.selectRow.set("f_type2_amt", rec.get("dtl_f_type_amt2"));
                Ext.selectRow.set("i_pr_type2", rec.get("dtl_i_pr_type2") / 1);
                Ext.selectRow.set("po_expense2_id", parseInt(rec.get("dtl_po_expense_id2")) / 1);
                Ext.selectRow.set("dc_expense_budget_type2_id", parseInt(rec.get("dtl_dc_bg_budget_type_id2")) / 1);
                //แหล่งเงินที่ 3
                Ext.selectRow.set("f_type3_amt", rec.get("dtl_f_type_amt3"));
                Ext.selectRow.set("i_pr_type3", rec.get("dtl_i_pr_type3") / 1);
                Ext.selectRow.set("po_expense3_id", parseInt(rec.get("dtl_po_expense_id3")) / 1);
                Ext.selectRow.set("dc_expense_budget_type3_id", parseInt(rec.get("dtl_dc_bg_budget_type_id3")) / 1);
              }

              if (Ext.selectRow.get("count_period") === 0 && Ext.selectRow.get("i_type_contract") !== 3) {
                Ext.MessageBox.alert("Warning", " กรุณากรอกข้อมูลงวด /" + Ext.selectRow.get("count_period"));
                return false;
              } else {
                var win = bgBagedTypeNew().show();
                win.items.items[0].getForm().loadRecord(Ext.selectRow);
                win.show();
              } //else
            }
          });
        } //success
      }, //callback
    });
  };
  function bgBagedTypeNew() {
    return new Ext.Window({
      id: "wincontractNewID", //wincontractNewID
      modal: true,
      // width: 850,
      //                height: 430,
      title: "เปลี่ยนแปลงแหล่งเงินที่จัด ซื้อ/เช่า/จ้าง เงินในสัญญา " + Ext.selectRow.get("f_total_amt"),
      layout: "form",
      width: Ext.getCmp("contenterCenter").getWidth() - 5,
      height: Ext.getCmp("contenterCenter").getHeight() - 5,
      layout: "fit",
      modal: true,
      plain: true,
      items: [
        new Ext.FormPanel({
          frame: true,
          labelWidth: 160,
          padding: "10px 10px 10px 10px",
          url: "tor/api/mnBgExpenseController2.php",
          id: "formDcExpTypeDddID",
          items: [
            {
              xtype: "hidden",
              name: "tor_id",
              id: "tor_id",
              value: Ext.selectRow.get("sp_tor_id"),
            },
            {
              xtype: "displayfield",
              name: "f_contract_amt",
              fieldLabel: "เงินในสัญญา",
              value: Ext.selectRow.get("f_total_amt"),
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
              readOnly: true,
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
                  value: 20,
                  listeners: {
                    blur: function () {
                      this.fn(true);
                    },
                    afterrender: function () {
                      this.fn = function (t) {
                        //                                        console.log('dddddddddd');
                        //                                        console.log(Ext.getCmp('f_totalID').getValue());
                        var val = 0;
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
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      //                                            alert(Ext.getCmp('f_type_amtID').getValue());
                      //                                            return false;
                      genBookBg(Ext.getCmp("f_type_amtID").getValue(), 1);
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
            {
              xtype: "buttongroup",
              fieldLabel: "ปิดสัญญาจองจะซื้อจะขาย 1",
              hidden: Ext.selectRow.get("i_type_contract") == 3 ? false : true,
              frame: false,
              border: false,
              items: [
                {
                  xtype: "button",
                  text: "* จะซื้อจะขาย/ส่งเลขสัญญาให้ ERP",
                  id: "button12",
                  hidden: Ext.isEmpty(Ext.idStatus) ? false : true,
                  handler: function () {
                    Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");

                    Ext.Ajax.request({
                      //                      url: Ext.session.ip_booking + "/procure/po_send", //@TODO
                      url: "./tor/api/po_send.php",
                      method: "POST",
                      params: {
                        mode: "CONTRACT_ERP",
                        tor_id: Ext.selectRow.get("sp_tor_id"),
                        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                      },
                      success: function (result, request) {
                        try {
                          let json = Ext.util.JSON.decode(result.responseText);

                          Ext.MessageBox.alert("Success", "ส่งข้อมูลสัญญาให้ทาง ERP เรียบร้อยแล้ว retid:" + Ext.selectRow.get("sp_tor_contract_id"), function () {
                            Ext.getCmp("wincontractNewID").destroy();
                          });
                        } catch (err) {
                          Ext.Msg.alert("Error", "Some error occured during execution.<br/></br>" + err);
                          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                        }
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                        Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                      },
                    });
                  },
                },
                {
                  xtype: "button",
                  text: "* ปิดสัญญา",
                  id: "button11",
                  disabled: Ext.selectRow.get("bg_reserve_i_last1") > 0 ? true : false,
                  handler: function () {
                    //                                        alert(Ext.selectRow.get('bg_reserve_i_last1'));
                    //                                        console.log(Ext.selectRow.get('bg_reserve_i_last1'));
                    //                                        return false;
                    Ext.Ajax.request({
                      url: "tor/api/mnValidGetBgPeriod.php",
                      method: "POST",
                      params: {
                        mode: "SUM_BG_TYPE_PERIOD",
                        dc_expense_budget_type_id: Ext.selectRow.get("dc_expense_budget_type_id"),
                        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                      },
                      success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                        Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                        genBookBgClose(json.f_dtl_amt, 1);
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                      },
                    });
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "displayfield",
                  value: "* ปิดสัญญา",
                  style: {
                    width: "200px",
                    padding: "1px",
                    margin: "1px",
                    color: "red",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
              ],
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 2",
              disabled: Ext.selectRow.get("dc_expense_budget_type2_id") > 0 ? false : true,
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type2_idTxtID",
              name: "dc_bg_budget_type2_id",
              hiddenName: "dc_expense_budget_type2_id",
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
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
              frame: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
              border: false,
              items: [
                {
                  xtype: "displayfield",
                  name: "f_type2_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
                  name: "c_f_type2_amt",
                  id: "f_type2_amtID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
                  listeners: {
                    blur: function () {
                      this.fn();
                    },
                    afterrender: function () {
                      this.fn = function () {
                        var val = 0;
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
                  id: "button2",
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type2_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      genBookBg2(Ext.getCmp("f_type2_amtID").getValue(), 2);
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type2ID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
                  name: "i_pr_type2",
                  items: [
                    {
                      //  checked: true,
                      name: "i_pr_type2",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type2",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 3",
              disabled: Ext.selectRow.get("dc_expense_budget_type3_id") > 0 ? false : true,
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type3_idTxtID",
              name: "dc_bg_budget_type3_id",
              hiddenName: "dc_expense_budget_type3_id",
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
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
              frame: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
              border: false,
              items: [
                {
                  xtype: "displayfield",
                  name: "f_type3_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
                  name: "c_f_type3_amt",
                  id: "f_type3_amtID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
                  listeners: {
                    blur: function () {
                      this.fn();
                    },
                    afterrender: function () {
                      this.fn = function () {
                        var val = 0;
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
                  id: "button3",
                  listeners: {
                    afterrender: function () {
                      this.setDisabled((Ext.selectRow.get("c_bg_reserve_money3_id") > 0 && Ext.selectRow.get("c_f_type3_amt").replace(/,/g, "")) > 0 ? true : false);
                    },
                  },
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type3_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      genBookBg3(Ext.getCmp("f_type3_amtID").getValue(), 3);
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type3ID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
                  name: "i_pr_type3",
                  items: [
                    {
                      name: "i_pr_type3",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type3",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
            {
              xtype: "buttongroup",
              fieldLabel: "ปิดสัญญาจองจะซื้อจะขาย 2",
              hidden: Ext.selectRow.get("i_type_contract") == 3 ? false : true,
              frame: false,
              border: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? false : true,
              items: [
                {
                  xtype: "button",
                  text: "* แก้เงินจอง",
                  id: "button22",
                  disabled: Ext.selectRow.get("bg_reserve_i_last2") > 0 ? true : false,
                  handler: function () {
                    Ext.Ajax.request({
                      url: "tor/api/mnValidGetBgPeriod.php",
                      method: "POST",
                      params: {
                        mode: "SUM_BG_TYPE_PERIOD",
                        dc_expense_budget_type_id: Ext.selectRow.get("dc_expense_budget_type2_id"),
                        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                      },
                      success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                        Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                        genBookBgClose(json.f_dtl_amt, 2);
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                      },
                    });
                  },
                },
              ],
            },
          ],
          buttons: [
            {
              text: "Cancel",
              handler: function () {
                Ext.getCmp("wincontractNewID").destroy();
                //                                Ext.getCmp("winChequeID").destroy();
                //                                Ext.getCmp("winMain").destroy();
                Ext.storeDtl.reload();
              },
            },
          ],
        }),
      ],
    }).show();
  }
  Ext.storeBank = new Ext.data.JsonStore({
    autoLoad: true,
    storeId: "myStoreCost",
    url: "api/All_ArCombo.php",
    baseParams: { type: "storeBank" },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["no", "id", "c_code", "c_name"],
  });
  Ext.ColumGridPop = [
    { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
    { header: "รหัส", sortable: true, dataIndex: "c_code" },
    {
      header: "่ชื่อ",
      sortable: true,
      id: "c_name",
      dataIndex: "c_name",

      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='cursor:pointer';";
        return value;
      },
    },
  ];
  var PopBank = new Ext.ux.Poplov({
    text: "ชื่อธนาคาร",
    id: "dc_bank_idID", //go to relation
    iconCls: "page_magnify",
    valueHidden: "dc_bank_id", //go to hidden
    store: Ext.storeBank,
    headerGrid: Ext.ColumGridPop,
    widthText: 280,
    fieldLabel: "ชื่อธนาคาร ",
    // listeners   : {'render' : function(p){ this.hide(); } }
  });
  var disp = false ? "displayfield" : "textfield";
  var comboCost = new Ext.form.ComboBox({
    mode: "local",
    readOnly: Ext.session.dc_center_user == 1 ? false : true,
    store: Ext.dc_cost,
    anchor: "80%",
    fieldLabel: "หน่วยงานที่รับผิดชอบ",
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
  var colPOPNew = [
    new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
    { header: "ID System", hidden: true, dataIndex: "sp_tor_contract_editid" },
    // {
    //   header: "-",
    //   align: "center",
    //   dataIndex: "creditor_name",
    //   width: 42,
    //   id: "detailBidder",
    //   renderer: function (value, metaData, record, row, col, store, gridView) {
    //     return "<button>รายละเอียดการแก้ไข</button>";
    //   },
    // },
    {
      header: "งวดที่",
      align: "center",
      dataIndex: "i_period",
      width: 50,
      renderer: function (value, metaData, record, row, col, store, gridView) {
        if (record.get("no") === 9999) return " ";
        else if (record.get("no") === 9998) return " ";
        else if (record.get("no") === 9997) return " ";
        else return value;
      },
    },
    {
      header: "วันที่เริ่มนับในงวดงาน",
      align: "center",
      dataIndex: "d_doc_date",
      width: 150,
      renderer: function (val, metaData, record, rowIndex, colIndex, store) {
        return shortThaiDate(val);
      },
    },
    {
      header: "วันที่สิ้นสุดในงวดงาน",
      align: "center",
      dataIndex: "d_period_date",
      width: 150,
      renderer: function (val, metaData, record, rowIndex, colIndex, store) {
        return shortThaiDate(val);
      },
    },
    {
      header: "งวดที่/สัญญา",
      align: "center",
      dataIndex: "dc_expense_budget_type_txt",
      width: 50,
//      dataIndex: "i_period",
      renderer: function (value, metaData, record, row, col, store, gridView) {
        if (Ext.selectRow.get("i_type_contract") == 3) return "สัญญา " + record.get("c_contract_code");
        else return "งวด " + value;
      },
    },
    {
      header: "แหล่งเงิน",
      align: "center",
      dataIndex: "dc_expense_budget_type_txt",
      width: 350,
    },
    {
      header: "งวดสุดท้าย",
      align: "center",
      dataIndex: "d_due_date",
      width: 120,
      renderer: function (value, metaData, record, row, col, store, gridView) {
        metaData.attr = "style='cursor:pointer; text-align:center;';";
        if (record.data.i_is_last == 1) {
          return '<img src="../images/icons/accept.png");/>';
        } else {
          return '<img src="../images/icons/cancel.png"); style="cursor:pointer"/>';
        }
      },
    },
    {
      header: "วันที่แจ้งเตือน",
      align: "center",
      dataIndex: "i_day",
      width: 150,
      renderer: function (value, metaData, record, row, col, store, gridView) {
        if (record.get("no") === 9999) return "ยอดรวม";
        else if (record.get("no") === 9998) return "ยอดที่ใช้ได้";
        else if (record.get("no") === 9997) return "ยอดคงเหลือ";
        else return value;
      },
    },
    {
      header: "จำนวนเงิน",
      sortable: false,
      align: "center",
      dataIndex: "f_total_amt",
      width: 150,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='color:blue;text-align: right;'";
        return floatRenderer(value);
      },
    },
    {
      header: "แก้ไข",
      sortable: false,
      hideable: false,
      hidden: true,
      draggable: false,
      align: "center",
      id: "edit_bidder_hdr",
      width: 300,
      dataIndex: "id",
      renderer: function (value, metaData, record, row, col, store, gridView) {
        if (record.get("no") === 9999) return "";
        else if (record.get("no") === 9998) return " ";
        else if (record.get("no") === 9997) return "";
        else
          return `<button style=" padding: 0px 5px; font-size: 10px; height: 18px; line-height: 14px; border-radius: 2px; cursor: pointer; display: inline-block;">
    แก้ไข</button>`;
      },
    },
    {
      id: "delete_contractNew",
      header: "ลบ",
      sortable: false,
      align: "center",
      width:100,
      dataIndex: "id",
      renderer: function (value, metaData, record, row, col, store, gridView) {
        if (record.get("no") === 9999) return "";
        else if (record.get("no") === 9998) return " ";
        else if (record.get("no") === 9997) return "";
        else
          return `<button style=" padding: 0px 5px; font-size: 10px; height: 18px; line-height: 14px; border-radius: 2px; cursor: pointer; display: inline-block;">  ลบ </button>`;
      },
    },
    { width: 30, dataIndex: "" },
  ];
  var win = new Ext.Window({
    // var win = new Ext.Window({
    collapsible: true,
    maximizable: true,
    title: "ข้อมูลสัญญา",
    width: 1500,
    id: "winMainNew",
    width: Ext.getCmp("contenterCenter").getWidth() - 5,
    height: Ext.getCmp("contenterCenter").getHeight() - 5,
    layout: "fit",
    modal: true,
    plain: true,
    resizable: true,
    maximizable: true,
    layout: "fit",
    modal: true,
    plain: true,
    bodyStyle: "padding:1px;",
    buttonAlign: "center",
    items: [
      {
        xtype: "tabpanel",
        activeTab: 0,
        labelWidth: 500,
        id: "winChequeNewID",
        // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
        items: [
          new Ext.FormPanel({
            title: "รายละเอียดสัญญา",
            id: "form_New_contract",
            columnWidth: 1,
            url: "tor/api/mnEditContract.php",
            frame: true,
            autoScroll: true,
            fileUpload: true,
            labelAlign: "left",
            bodyStyle: "padding:1px",
            labelWidth: 500,
            listeners: {
              afterrender: function () {
                // Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
              },
            },
            items: [
              {
                xtype: "fieldset",
                title: "ข้อมูลปัจจุบัน& 📄",
                collapsible: true,
                collapsed: false,
                labelWidth: 800,
                // height: 250,
                id: "groupProductTypeID",
                layout: "column",
                items: [
                  {
                    xtype: "panel",
                    layout: "form",
                    id: "formProductType",
                    columnWidth: 0.5,
                    labelWidth: 160,
                    items: [
                      {
                        columnWidth: 0.6,
                        layout: "form",
                        border: true,
                        items: [
                          {
                            xtype: "hidden",
                            name: "sp_tor_id",
                            id: "sp_tor_idID", //i_is_more
                          },
                          {
                            xtype: "hidden",
                            name: "sp_tor_contract_id",
                            id: "sp_tor_contract_idID",
                          },
                          {
                            xtype: "hidden",
                            name: "i_enabled",
                            value: 1,
                          },
                          {
                            xtype: "buttongroup",
                            frame: false,
                            items: [
                              { xtype: "tbspacer", width: 3 },
                              // { xtype: "label", text: "เลขที่สัญญา: " },
                              { xtype: "tbspacer", width: 160 },
                              {
                                xtype: "hidden",
                                name: "c_comment",
                                id: "c_commentID",
                                value: "แก้ไขข้อมูลจาก New UI 04-08-2568",
                              },
                              {
                                xtype: "textfield",
                                readOnly: true,
                                // fieldLabel: "เลขที่สัญญา",
                                id: "code_contactID",
                                style: "text-align: center;font-weight:bold;background:#eee;",
                                readOnly: true,
                                name: "c_code",
                                style: {
                                  "font-weight": "bold",
                                  padding: "1px",
                                  margin: "1px",
                                  color: "#000",
                                  "text-align": "center",
                                  background: "#EEEEEE",
                                  color: "#333",
                                  border: "1px solid #ADADAD",
                                },
                              },
                              { xtype: "tbspacer", width: 3 },
                              {
                                xtype: "textfield",
                                readOnly: true,
                                width: 350,
                                // fieldLabel: "เลขที่สัญญา",
                                id: "dc_creditor_idTxtID",
                                style: "text-align: left;font-weight:bold;background:#eee;",
                                readOnly: true,
                                name: "dc_creditor_idTxt",
                                style: {
                                  "font-weight": "bold",
                                  padding: "1px",
                                  margin: "1px",
                                  color: "#000",
                                  "padding-left": "12px", // ✅ เพิ่มระยะห่างจากขอบซ้าย
                                  background: "#EEEEEE",
                                  color: "#333",
                                  border: "1px solid #ADADAD",
                                },
                              },
                            ],
                          },
                          {
                            xtype: "textarea",
                            width: 450,
                            height: 35,
                            // readOnly: true,
                            fieldLabel: "เรื่อง/โครงการ",
                            name: "c_name",
                            style: {
                              marginTop: "8px", // ✅ เพิ่มระยะห่างด้านบน
                            },
                          },
                          // comboUsedBgYear,
                          // { xtype: "displayfield", fieldLabel: "ชื่อโครงการ", name: "c_budget_dtl_project" },
                          comboCost,
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_cost,
                            maxHeight: 200, // ความสูงสูงสุดของรายการใน Dropdown
                            anchor: "80%",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
                            value: Ext.costID,
                            fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                            valueField: "id",
                            displayField: "c_name",
                            hiddenName: "dc_cost2_id",
                            name: "c_cost_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            width: 400, // ความกว้างของ ComboBox
                            listWidth: 500, // ความกว้างของ Dropdown
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
                              select: function (combo, record) {
                                combo.setTooltip(record.get("c_name")); // กำหนด Tooltip เป็นข้อความเต็ม
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
                            // anchor: "95%",
                            submitValue: true,
                            name: "c_detail",
                            id: "po_expense_hdr_idID",
                            hiddenName: "po_expense_id",
                            triggerAction: "all",
                            allBlank: true,
                            forceSelection: true,
                            selectOnFocus: true,
                            width: 400, // ความกว้างของ ComboBox
                            listWidth: 500, // ความกว้างของ Dropdown
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
                            fieldLabel: "รายการย่อย",
                            width: 200,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกใช้จ่าย...",
                            listeners: {
                              render: function (combo) {
                                tooltip_ComboBox(combo, "c_name");
                              },
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
                              select: function (combo, record) {
                                combo.setTooltip(record.get("c_name")); // กำหนด Tooltip เป็นข้อความเต็ม
                              },
                              blur: function () {
                                this.getStore().clearFilter();
                                console.log(this);
                              },
                            },
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
                            fieldLabel: "แหล่งเงิน",
                            anchor: "80%",
                            submitValue: true,
                            name: "dc_expense_budget_type_idTxt",
                            hiddenName: "dc_expense_budget_type_id",
                            id: "dc_expense_budget_type_hdr_id1",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.torType,
                            anchor: "40%",
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
                            fieldLabel: "ของที่ได้",
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
                                console.log(newValue);
                                if (["0", "3", "7"].includes(newValue)) {
                                  console.log(1);
                                  Ext.getCmp("period_i_hire_type").setValue(0);
                                } else if (newValue > "2" && !["0", "3", "7"].includes(newValue)) {
                                  console.log(2);
                                } else {
                                  console.log(3);
                                  Ext.getCmp("period_i_hire_type").setValue(1);
                                  Ext.getCmp("period_i_product_type2").setValue(newValue);
                                }

                                // if (newValue > 2) {

                                // } else {
                                // }

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
                            xtype: "textfield",
                            readOnly: true,
                            fieldLabel: "รหัสเอกสารอ้างอิง",
                            name: "d_doc_ref",
                          },
                          {
                            xtype: "button",
                            name: "overlap",
                            id: "overlapID",
                            hidden: Ext.selectRow.json.i_status_overlap == 1 ? false : true,
                            fieldLabel: "ใช้ใบกันเหลื่อม",
                            text: "เลือกใช้/จอง ใบกัน",
                            listeners: {
                              render: function (p) {
                                if (Ext.selectRow.get("i_overlap") === 2) {
                                  this.setText("บันทีกใบกันแล้ว " + Ext.selectRow.get("c_overlap"));
                                }
                              },
                            },
                            handler: function () {
                              var record = Ext.selectRow;
                              if (record.data.bg_reserve_overlap_id > 0) {
                              } else {
                                popOverlap();
                                var win = bgBagedOver(record, 2);
                                win.items.items[0].getForm().loadRecord(record);
                                win.show();
                              }
                            },
                          },
                          {
                            xtype: "button",
                            text: "จองเงินงบประมาณ",
                            name: "i_ren_bgType",
                            hidden: Ext.selectRow.json.i_status_overlap == 0 && Ext.selectRow.json.i_type_check == false ? false : true,
                            id: "i_ren_bgTypeID",
                            // disabled: (Ext.selectRow.get('i_is_notor') || Ext.selectRow.get('i_type_bg') == 8  ) ? true : false   ,
                            fieldLabel: "จองเงินงบประมาณแหล่งเงิน",
                            listeners: {
                              beforerender: function () {
                                this.fn = function () {};
                              },
                              afterrender: function () {
                                // if (Ext.selectRow.get("i_is_notor") === 1) {
                                //     this.hide();
                                // } else {
                                //     this.show();
                                // }
                              },
                            },
                            handler: function () {
                              loadBgStoreNew();
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    xtype: "panel",
                    layout: "form",
                    labelWidth: 100,
                    columnWidth: 0.5,
                    items: [
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่ออกเลขสัญญา",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "d_doc_date",
                            id: "d_doc_dateID",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                        ],
                      },
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่มารับสัญญา",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "d_contract_receiving_date",
                            id: "d_contract_receiving_dateID", //Date of receiving the contract
                            // maxValue : Ext.Date.min(rec.data.d_doc_date, rec.data.d_due_date) ,
                            maxValue: rec.data.d_due_date,
                            // readOnly: Ext.session.dc_center_user == 1 ? false : true,
                            validator: function (val) {
                              if (Ext.isEmpty(val)) return true;

                              var date = parseThaiDate(val);
                              var max1 = parseThaiDate(rec.data.d_due_date);
                              var max2 = parseThaiDate(rec.data.d_doc_date);

                              // if (date > max1 || date > max2) {
                              //   console.log(2);
                              //   // ❗ ล้างค่าทันที
                              //   // Ext.getCmp("d_contract_receiving_dateID").setValue('11-08-2568');
                              //   return "วันที่ไม่ถูกต้อง กรุณาเลือกใหม่";
                              // }
                              return true;
                            },
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  var value = this.value; // "06-08-2568"
                                  if (!value) return;
                                  console.log(value);
                                  // 1. แปลงจาก พ.ศ. → ค.ศ.
                                  var parts = value.split("-");
                                  var day = parseInt(parts[0], 10);
                                  var month = parseInt(parts[1], 10) - 1; // JavaScript นับเดือนจาก 0-11
                                  var year = parseInt(parts[2], 10) - 543;

                                  var date = new Date(year, month, day);

                                  // 2. บวก 1 วัน
                                  date.setDate(date.getDate() + 1);

                                  // 3. แปลงกลับเป็น d-m-พ.ศ.
                                  var nextDay = ("0" + date.getDate()).slice(-2);
                                  var nextMonth = ("0" + (date.getMonth() + 1)).slice(-2);
                                  var nextYear = date.getFullYear() + 543;

                                  var result = `${nextDay}-${nextMonth}-${nextYear}`;
                                  console.log(result);
                                  Ext.getCmp("d_contract_start_dateID").setValue(result);
                                  console.log("วันถัดไป:", result);
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
                                // this.getStore().clearFilter();
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 18,
                          },
                        ],
                      },
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่สัญญามีผล/วันที่เข้าพื้นที่",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "d_contract_start_date",
                            id: "d_contract_start_dateID",
                            maxValue: rec.data.d_due_date,
                            // readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                        ],
                      },
                      {
                        fieldLabel: "กำหนดส่งภายใน ",
                        xtype: "buttongroup",
                        // columns: [50, 150],
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "textfield",
                            name: "i_delivery",
                            id: "i_deliveryID",
                            // value: 1,
                            validator: function (val) {
                              var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                              var strMoney = val.replace(/\,/g, "");
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
                          {
                            xtype: "tbspacer",
                            width: 18,
                          },
                          {
                            xtype: "checkbox",
                            id: "i_working_day",
                            boxLabel: "<b style='color: blue; font-size: 10px;'>นับตามวันทำการ</b>",
                            // hidden: Ext.INSIDE_COST == 1 ? false : true,
                            inputValue: 1,
                            checked: false,
                            listeners: {
                              check: function (checkbox, checked) {
                                if (checked) {
                                  // ✅ ดึงค่าจาก field
                                  var startDate = Ext.getCmp("d_contract_receiving_dateID").getValue(); // วันที่เริ่ม
                                  var days = Ext.getCmp("i_deliveryID").getValue(); // จำนวนวัน
                                  var holidayStore = Ext.SpHoliday; // store ที่โหลดวันหยุดไว้แล้ว
                                  if (startDate && days) {
                                    // ✅ เรียกฟังก์ชันที่เราสร้างไว้
                                    var endDate = calculateBusinessEndDate(startDate, days, holidayStore);
                                    // ✅ ใส่วันผลลัพธ์กลับไปที่ช่อง datefield
                                    Ext.getCmp("d_due_dateID").setValue(endDate);
                                  } else {
                                    // ❌ ถ้ายกเลิก checkbox → คำนวณใหม่แบบรวมวันหยุดด้วย
                                    var startDate = Ext.getCmp("d_contract_receiving_dateID").getValue();
                                    var days = Ext.getCmp("i_deliveryID").getValue();

                                    if (startDate && days) {
                                      var endDate = new Date(startDate);
                                      endDate.setDate(endDate.getDate() + parseInt(days)); // ✅ นับแบบรวมวันหยุด
                                      Ext.getCmp("d_due_dateID").setValue(endDate);
                                    } else {
                                      Ext.getCmp("i_working_day").setValue(null);
                                      Ext.Msg.alert("กรุณาระบุ", "วันที่เริ่มต้น และจำนวนวันให้ครบก่อน");
                                    }
                                  }
                                } else {
                                  // ❌ ถ้ายกเลิก checkbox → คำนวณใหม่แบบรวมวันหยุดด้วย
                                  var startDate = Ext.getCmp("d_contract_receiving_dateID").getValue();
                                  var days = Ext.getCmp("i_deliveryID").getValue();

                                  if (startDate && days) {
                                    var endDate = new Date(startDate);
                                    endDate.setDate(endDate.getDate() + parseInt(days)); // ✅ นับแบบรวมวันหยุด
                                    Ext.getCmp("d_due_dateID").setValue(endDate);
                                  } else {
                                    Ext.Msg.alert("กรุณาระบุ", "วันที่เริ่มต้น และจำนวนวันให้ครบก่อน");
                                  }
                                }
                              },
                            },
                          },
                        ],
                      },
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่สิ้นสุดสัญญา",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "d_due_date",
                            id: "d_due_dateID",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                        ],
                      },

                      {
                        xtype: "radiogroup",
                        columns: [250, 250],
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
                        xtype: "checkbox",
                        id: "i_joint_ventureID",
                        name: "i_is_join_venture",
                        height: 20,
                        readOnly: true,
                        fieldLabel: "กิจการค้าร่วม ",
                        // value :  Ext.selectRow.data.i_is_join_venture,
                        boxLabel: "มีผู้ชายผู้รับจ้างในสัญญามากกว่า 1 ",
                        inputValue: "1",
                        listeners: {
                          check: function (checkbox, checked) {},
                          afterrender: function () {},
                        },
                      },
                      {
                        xtype: "textfield",
                        fieldLabel: "จำนวนเงิน",
                        // readOnly: true,
                        readOnly: Ext.session.dc_center_user == 1 ? false : true,
                        name: "f_total_amt",
                        id: "f_totalID",
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              // Ext.getCmp("f_type_edit_amtID").setValue(Ext.selectRow.get("f_type_amt"));
                              // var val = 0;
                              // val = this.getValue();
                              // var f_total = parseFloat(val.replace(/,/g, "") / 1);
                              // this.setValue(Ext.floatRenderer(f_total));
                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                            };
                            this.fn();
                          },
                          blur: function () {
                            this.fn();
                          },
                          keyup: function () {
                            Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                ],
              },
              {
                xtype: "fieldset",
                title: "ข้อมูลหลักประกันสัญญา",
                collapsible: true,
                layout: "column",
                items: [
                  {
                    columnWidth: 1,
                    layout: "column",
                    defaults: {
                      layout: "form",
                      border: false,
                      labelWidth: 140,
                      bodyStyle: "padding: 2px",
                    },
                    items: [
                      {
                        columnWidth: 0.5,
                        items: [
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.guarantee,
                            anchor: "30%",
                            fieldLabel: "วิธีการค้ำประกัน",
                            submitValue: true,
                            readOnly: true,
                            hiddenName: "i_is_book",
                            name: "i_is_book",
                            id: "i_is_bookID",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            value: rec && rec.data ? rec.data.i_is_book : "",
                            emptyText: "เลิอกวิธีการค้ำประกัน",
                            listeners: {
                              select: function (combo, record) {
                                this.updateVisibility(combo.getValue());
                              },
                              change: function (combo, newValue) {
                                this.updateVisibility(newValue);
                              },
                              beforeselect: function (combo, record) {
                                console.log(record.get("id"));
                                this.updateVisibility(record.get("id"));
                              },
                              afterrender: function () {
                                var combo = this;
                                this.updateVisibility = function (val) {
                                  // Cash เงินสด
                                  var refField = Ext.getCmp("c_receipt_noID");
                                  var dateField = Ext.getCmp("d_book_dateID");
                                  var amountField = Ext.getCmp("f_warranty_amtID");

                                  // Book แคชเชียร์เช็ค 8
                                  var c_receipt_cashiercheque = Ext.getCmp("c_receipt_cashierchequeID");
                                  var d_cashiercheque_date = Ext.getCmp("d_cashiercheque_dateID");
                                  var f_cashiercheque_warranty_amt = Ext.getCmp("f_warranty_amtID2");
                                  // Book หนังสือค้ำประกัน 9
                                  var bankField = Ext.getCmp("frmPopBankID");
                                  var docField = Ext.getCmp("c_doc_noID");
                                  var daedoc1 = Ext.getCmp("d_doc_date1ID");
                                  var expiryField = Ext.getCmp("d_expire_warrantyID");
                                  var amountField1 = Ext.getCmp("f_warranty_amt1ID");

                                  var val = this.getValue();
                                  // Default Hide All
                                  var safeHide = function (cmp) {
                                    if (cmp) cmp.setVisible(false);
                                  };
                                  var safeShow = function (cmp) {
                                    if (cmp) cmp.setVisible(true);
                                  };
                                  var safeUpdateLabel = function (cmp, text) {
                                    if (cmp && cmp.label) cmp.label.update(text);
                                  };

                                  // safeHide(refField);
                                  // safeHide(dateField);
                                  // safeHide(bankField);
                                  // safeHide(amountField);
                                  // safeHide(expiryField);
                                  // console.log(val);
                                  if (val == 9) {
                                    console.log("Book");
                                    // Book
                                    safeShow(docField);
                                    // safeUpdateLabel(refField, "เลขที่หนังสือค้ำประกัน :");
                                    safeShow(daedoc1);
                                    safeShow(bankField);

                                    safeShow(amountField1);
                                    safeShow(expiryField);
                                  } else if (val == 8) {
                                    console.log("Cheque");
                                    // Cheque
                                    safeShow(c_receipt_cashiercheque);
                                    safeShow(d_cashiercheque_date);
                                    safeShow(f_cashiercheque_warranty_amt);
                                  } else if (val == 1) {
                                    // Cash
                                    console.log("Cash");
                                    safeShow(refField);
                                    safeShow(dateField);
                                    safeShow(amountField);
                                  }
                                  var groupField = Ext.getCmp("groupProductPereID");
                                  if (groupField) groupField.doLayout();
                                };
                                this.updateVisibility(this.getValue());
                              },
                            },
                          }),
                          {
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "เลขที่หนังสือค้ำประกัน",
                            name: "c_doc_no",
                            id: "c_doc_noID",
                            hidden: true,
                            readOnly: true,
                          },
                          {
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "เลขที่หนังสือค้ำประกัน",
                            name: "c_receipt_cashiercheque",
                            id: "c_receipt_cashierchequeID",
                            hidden: true,
                            readOnly: true,
                          },
                          {
                            xtype: "compositefield",
                            id: "frmPopBankID",
                            fieldLabel: "เลือกธนาคาร",
                            anchor: "90%",
                            hidden: true,
                            readOnly: true,
                            defaults: { flex: 1 },
                            items: [PopBank.mini],
                          },
                          {
                            xtype: "datefield",
                            anchor: "30%",
                            fieldLabel: "วันที่รับเงิน",
                            id: "d_book_dateID",
                            name: "d_book_date",
                            // format: "d/m/Y",
                            hidden: true,
                            readOnly: true,
                          },

                          {
                            xtype: "datefield",
                            anchor: "30%",
                            fieldLabel: "วันที่เอกสาร",
                            hidden: true,
                            readOnly: true,
                            id: "d_guarantee_dateID",
                            name: "d_guarantee_date",
                            // format: "d/m/Y",
                          },
                        ],
                      },
                      {
                        columnWidth: 0.5,
                        id: "groupWarrantyID",
                        // hidden : true,
                        items: [
                          {
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "เลขที่เอกสาร",
                            name: "c_receipt_no",
                            id: "c_receipt_noID",
                            hidden: true,
                            readOnly: true,
                          },
                          {
                            xtype: "datefield",
                            anchor: "30%",
                            fieldLabel: "วันที่แคชเชียร์เช็ค",
                            hidden: true,
                            readOnly: true,
                            id: "d_cashiercheque_dateID",
                            name: "d_cashiercheque_date",
                            // format: "d/m/Y",
                          },
                          {
                            xtype: "datefield",
                            anchor: "30%",
                            fieldLabel: "วันที่หนังสือค้ำประกัน",
                            hidden: true,
                            readOnly: true,
                            id: "d_doc_date1ID",
                            name: "d_doc_date1",
                            // format: "d/m/Y",
                          },
                          {
                            fieldLabel: "วันหมดอายุหนังสือค้ำประกัน",
                            id: "d_expire_warrantyID",
                            name: "d_expire_warranty",
                            xtype: "datefield",
                            hidden: true,
                            readOnly: true,
                            // width: 180,
                            anchor: "30%",
                            listeners: {
                              render: function (p) {
                                // this.hide();
                              },
                            }, //d_doc_date_M
                          },
                          {
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "วงเงินค้ำประกัน",
                            emptyText: "0.00",
                            hidden: true,
                            readOnly: true,
                            name: "f_cashiercheque_warranty_amt2",
                            id: "f_warranty_amtID2",
                            setValue: function (v) {
                              if (v && typeof v === "string") v = v.replace(/,/g, "");
                              v = parseFloat(v);
                              if (isNaN(v)) v = 0;
                              // Force 2 decimal places
                              var formatted = Ext.util.Format.number(v, "0,000.00");
                              Ext.form.TextField.prototype.setValue.call(this, formatted);
                            },
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                };
                                this.fn();
                              },
                              blur: function () {
                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                this.setValue(Ext.floatRenderer(f_total));
                              },
                              keyup: function () {
                                // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "วงเงินค้ำประกัน",
                            emptyText: "0.00",
                            hidden: true,
                            readOnly: true,
                            name: "f_warranty_amt",
                            id: "f_warranty_amtID",
                            setValue: function (v) {
                              if (v && typeof v === "string") v = v.replace(/,/g, "");
                              v = parseFloat(v);
                              if (isNaN(v)) v = 0;
                              // Force 2 decimal places
                              var formatted = Ext.util.Format.number(v, "0,000.00");
                              Ext.form.TextField.prototype.setValue.call(this, formatted);
                            },
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                };
                                this.fn();
                              },
                              blur: function () {
                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                this.setValue(Ext.floatRenderer(f_total));
                              },
                              keyup: function () {
                                // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                            xtype: "textfield",
                            anchor: "50%",
                            fieldLabel: "วงเงินค้ำประกัน",
                            emptyText: "0.00",
                            hidden: true,
                            readOnly: true,
                            name: "f_warranty_amt1",
                            id: "f_warranty_amt1ID",
                            setValue: function (v) {
                              if (v && typeof v === "string") v = v.replace(/,/g, "");
                              v = parseFloat(v);
                              if (isNaN(v)) v = 0;
                              // Force 2 decimal places
                              var formatted = Ext.util.Format.number(v, "0,000.00");
                              Ext.form.TextField.prototype.setValue.call(this, formatted);
                            },
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                };
                                this.fn();
                              },
                              blur: function () {
                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                this.setValue(Ext.floatRenderer(f_total));
                              },
                              keyup: function () {
                                // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                    ],
                  },
                ],
              },
              {
                xtype: "fieldset",
                title: "ระบุข้อมูลงวดเพื่อเพิ่ม ➕",
                collapsible: true,
                collapsed: false,
                labelWidth: 1500,
                // height: 250,
                id: "groupProductPereID",
                layout: "column",
                items: [
                  {
                    xtype: "panel",
                    layout: "form",
                    id: "formProductPerType1",
                    columnWidth: 0.5,
                    labelWidth: 160,
                    items: [
                      {
                        xtype: "hidden",
                        name: "mode",
                        id: "mode_id",
                        value: "UP_SP_TOR_HDR_DTL_PERIOD",
                      },
                      {
                        xtype: "hidden",
                        name: "sp_tor_hdr_period_id",
                        id: "sp_tor_hdr_period_idID",
                        // value: Ext.selectRow.data.id,
                      },
                      {
                        xtype: "hidden",
                        name: "tor_id",
                        value: Ext.TOR_ID,
                      },
                      {
                        xtype: "hidden",
                        name: "sp_tor_contract_id",
                        value: Ext.SP_TOR_CONTRACT_ID,
                      },
                      {
                        xtype: "hidden",
                        name: "i_is_join_ventureID",
                        value: Ext.selectRow.data.i_is_join_venture,
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
                        xtype: "hidden",
                        name: "dc_unit_type_id",
                        id: "period_dc_unit_type_id",
                        value: 24,
                      },
                      {
                        xtype: "hidden",
                        name: "sp_check_period",
                        id: "sp_check_period",
                        value: 24,
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
                        xtype: "compositefield",
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
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_expense_budget_type2,
                        fieldLabel: "แหล่งเงินที่ ",
                        width: 350,
                        value: Ext.selectRow.get("dtl_dc_expense_budget_type_id"),
                        submitValue: true,
                        // dc_expense_budget_type_id
                        id: "dc_expense_budget_type_idPerTxtID",
                        name: "dc_bg_budget_type_Per_id",
                        hiddenName: "dc_expense_budget_type_id",
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
                              // alert(this.getValue());
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
                        store: Ext.po_expense,
                        valueField: "id",
                        displayField: "c_name",
                        width: 350,
                        submitValue: true,
                        id: "period_po_expense_id",
                        name: "po_expense_id",
                        hiddenName: "period_po_expense_id",
                        triggerAction: "all",
                        allBlank: true,
                        forceSelection: true,
                        selectOnFocus: true,
                        readOnly: true,
                        fieldLabel: "รายการย่อย",
                        typeAhead: false,
                        emptyText: "กรุณาเลือกใช้จ่าย...",
                        listeners: {
                          render: function (combo) {
                            tooltip_ComboBox(combo, "c_name");
                          },
                          afterrender: function () {
                            this.setValue(Ext.selectRow.data.po_expense_id);
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
                        //                    readOnly: true,
                        store: Ext.dc_cost,
                        width: 350,
                        fieldLabel: "หน่วยงานที่รับของ",
                        value: Ext.selectRow.get("dc_cost2_id"),
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
                          render: function (combo) {
                            tooltip_ComboBox(combo, "c_name");
                          },
                          afterrender: function () {
                            this.fn = function () {
                              this.store;
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
                      }),

                      {
                        xtype: "radiogroup",
                        columns: [98, 98, 98],
                        fieldLabel: "ของที่ได้มา",
                        id: "period_i_product_type2",
                        name: "i_product_type",
                        items: [
                          {
                            checked: true,
                            // hidden: true,
                            name: "i_product_type",
                            id: "i_product_type0",
                            inputValue: 0,
                            boxLabel: "ไม่มีของ",
                          },
                          {
                            inputValue: 2,
                            name: "i_product_type",
                            id: "i_product_type2",
                            boxLabel: "ครุภัณฑ์",
                          },
                          {
                            // checked: true,
                            name: "i_product_type",
                            inputValue: 1,
                            boxLabel: "วัสดุทั่วไป",
                            id: "i_product_type1",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 3,
                            boxLabel: "เช่า",
                            // id: "i_product_type",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 4,
                            boxLabel: "จ้างออกแบบ",
                            // id: "i_product_type",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 5,
                            boxLabel: "ที่ดิน",
                            // id: "i_product_type",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 6,
                            boxLabel: "ปรับปรุงอาคาร - ได้ของ",
                            // id: "",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 7,
                            boxLabel: "ปรับปรุงอาคาร - ไม่ได้ของ",
                            // id: "i_product_type1",
                          },
                          {
                            hidden: true,
                            name: "i_product_type",
                            inputValue: 8,
                            boxLabel: "สิ่งก่อสร้าง",
                            // id: "i_product_type1",
                          },
                        ], //radiogroup
                        listeners: {
                          afterrender: function () {
                            // if (Ext.getCmp("period_i_hire_type").getValue().inputValue == 0) {
                            //   Ext.getCmp("period_i_product_type2").hide();
                            //   Ext.getCmp("period_i_is_invG2").hide();
                            // } else {
                            //   Ext.getCmp("period_i_product_type2").show();
                            //   Ext.getCmp("period_i_is_invG2").show();
                            // }
                          },
                        },
                      },
                    ],
                  },
                  {
                    xtype: "panel",
                    layout: "form",
                    id: "formProductPerType2",
                    columnWidth: 0.5,
                    labelWidth: 160,
                    items: [
                      {
                        xtype: "radiogroup",
                        columns: [98, 98],
                        fieldLabel: "",
                        id: "i_type_editID",
                        name: "i_type_edit",
                        items: [
                          {
                            checked: true,
                            name: "i_type_edit",
                            inputValue: 1,
                            boxLabel: "เพิ่ม",
                          },
                          {
                            inputValue: 2,
                            hidden: true,
                            id: "i_type_edit2ID",
                            name: "i_type_edit",
                            boxLabel: "แก้ไข",
                          },
                        ], //radiogroup
                      },
                      {
                        xtype: "radiogroup",
                        columns: [98, 110],
                        fieldLabel: "ลักษณะการจ้าง",
                        id: "period_i_hire_type",
                        name: "i_hire_type",
                        hidden: true,
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
                          change: function () {},
                          afterrender: function () {},
                        },
                      },
                      {
                        xtype: "radiogroup",
                        columns: [98, 98],
                        fieldLabel: "",
                        id: "i_pr_type2ID",
                        hidden: true,
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
                        ], //radiogroup
                      },
                      {
                        xtype: "hidden",
                        name: "dc_creditor_id",
                        id: "dc_creditor_per_idID",
                        value: Ext.selectRow.data.dc_creditor_id,
                      },
                      {
                        xtype: "hidden",
                        name: "i_is_join_venture_per",
                        id: "i_is_join_venture_perID",
                        value: Ext.selectRow.data.i_is_join_venture,
                      },
                      {
                        xtype: "textfield",
                        width: 200,
                        fieldLabel: "ผู้ขายผู้รับจ้าง",
                        hidden: true,
                        id: "dc_creditor_per_text",
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                        name: "c_code",
                      },
                      {
                        xtype: "compositefield",
                        id: "dc_creditor_idID_pop",
                        hidden: true,
                        fieldLabel: "เลือกผู้เสนอราคา",
                        msgTarget: "side",
                        anchor: "-20",
                        defaults: {
                          flex: 1,
                        },
                        items: [PopCreditorForm.mini],
                      },
                      {
                        xtype: "datefield",
                        fieldLabel: "วันที่เริ่มนับการส่งของในงวด  ",
                        id: "d_doc_datePerID",
                        name: "d_doc_datePer",
                        width: 100,
                        validator: function (val) {
                          if (Ext.isEmpty(val)) {
                            return "กรุณากรอก วันที่เริ่มนับการส่งของในงวด ";
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
                                i_dayID_ChangeNew();
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
                                i_alertID_Change();
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
                        fieldLabel: "จำนวน",
                        xtype: "numberfield",
                        id: "period_i_qty",
                        name: "i_qty",
                        value: 1,
                        hidden: true,
                      },
                      {
                        xtype: "textfield",
                        fieldLabel: "จำนวนเงินงวด",
                        // readOnly: true,
                        // readOnly: Ext.session.dc_center_user == 1 ? false : true,
                        id: "f_total_amtPerID",
                        name: "f_total_amtPer",
                        validator: function (val) {
                          if (!Ext.isEmpty(val)) {
                            return true;
                          } else {
                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                          }
                        },
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                            };
                            this.fn();
                          },
                          blur: function () {
                            var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                            this.setValue(Ext.floatRenderer(f_total));
                          },
                          keyup: function () {
                            // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                    buttonAlign: "left",
                  },
                ],
              },
              {
                xtype: "fieldset",
                title: "ข้อมูลงวด &#x2708; ", // &#x2714; &#x274C;
                collapsible: true,
                labelWidth: 100,
                collapsed: false,
                autoScroll: true,
                height: 250,
                layout: "fit",
                tbar: [
                  {
                    text: "เพิ่มข้อมูลรายการ",
                    id: "button_add_per",
                    iconCls: "icon-add",
                    handler: function () {
                      Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", rec.data.sp_tor_contract_id);
                      Ext.storeSUMcontract.load({
                        callback: function (record, operation, success) {
                          if (success) {
                            msg = "";
                            const store = Ext.storeNew3;
                            const summaryRecord = store.getAt(store.find("no", 9997));
                            const f_total_amt = summaryRecord.get("f_total_amt").replace(/<[^>]+>/g, ""); // remove span ถ้ามี HTML
                            const totalAmt = parseFloat(f_total_amt.replace(/,/g, "")) || 0;
                            console.log("ยอดรวมจาก no: 9997 =", totalAmt);

                            // var rec = record[0];
                            var f_total = Ext.getCmp("f_total_amtPerID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                            // var f_period = Ext.getCmp("f_total_amtPerID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                            var f_unit_costID = Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1; // จำนวนเงินสัญญา
                            // var f_total_amt = rec.get("f_total_amt"); //.replace(/,/g, "") / 1; // จำนวนเงินของทุกงวดรวมกัน
                            // var f_total_sum = f_total + f_total_amt; // จำนวนเงินของทุกงวดที่บันทึกข้อมูลไปแล้ว + จำนวนเงินที่คีย์อยู่
                            // var f = f_total - f_period + f_total;
                            if (f_total > totalAmt && Ext.getCmp("i_type_editID").getValue().inputValue == 1) {
                              msg += " - ยอดเงินเกินวงเงินในสัญญา" + "\n";
                            }
                            // return;
                            // if (f > f_unit_costID) {
                            //   msg += "ยอดรวมของทุกงวดเกินวงเงินในสัญญาสัญญา";
                            // }
                            console.log(Ext.getCmp("sp_check_period").getValue());
                            if (![null, "", undefined].includes(Ext.getCmp("sp_check_period").getValue()) && Ext.getCmp("i_type_editID").getValue().inputValue == 2) {
                              msg += "- ตรวจรับแล้ว ไม่สามารถแก้ไขข้อมูลได้ " + "\n";
                            }

                            var formSubmit = function () {
                              form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                  Ext.storeDtl.reload();
                                  Ext.storeedit.reload();
                                  let itemStore = Ext.getCmp("gridSub1ID").getStore();
                                  itemStore.reload();
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
                            };

                            var form = Ext.getCmp("form_New_contract").getForm();
                            if (msg != "") {
                              Ext.example.msg("แจ้งเตือน", msg, 1);
                              $(this).next("text copied");
                              setTimeout(function () {
                                $(this).next().remove();
                              }, 6000);
                              return;
                            } else if (form.isValid()) {
                              Ext.getCmp("mode_id").setValue("UP_SP_TOR_HDR_DTL_PERIOD");
                              formSubmit(form);
                            } else {
                              Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
                            }
                            // }
                          }
                        },
                      });
                    },
                  },
                ],
                items: [
                  {
                    xtype: "grid",
                    id: "gridSub1ID",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    height: 200,
                    store: Ext.storeNew3,
                    style: {
                      overflowX: "auto",
                    },
                    listeners: {
                      // contextmenu: function (e) {
                      //   e.stopEvent();
                      //   var id = Ext.selectRow.json.imp_assetall_supplies_hdr_id;
                      //   var mymenu = new Ext.menu.Menu({
                      //     items: [],
                      //   });
                      // },
                      beforerender: function () {
                        Ext.DidderHdr = function (evt, rec) {
                          var win = new Ext.Window({
                            labelWidth: 175,
                            collapsible: true,
                            maximizable: true,
                            modal: true,
                            title: "เพิ่มผู้เสนอราคา",
                            id: "win-frm-contractID",
                            layout: "fit",
                            border: false,
                            width: 630,
                            height: 300,
                            items: [{}],
                          });
                        };
                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                          var record = grid.getStore().getAt(rowIndex);
                          Ext.SelectStore = Ext.storeNew3.getAt(rowIndex);
                          // console.log(Ext.SelectStore.data.row_edit);
                          // Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                          if ([9999, 9998, 9997].includes(Ext.SelectStore.data.no)) {
                            Ext.getCmp("i_type_editID").setValue(1);
                            Ext.getCmp("i_type_edit2ID").hide();
                          } else {
                            if (columnIndex === grid.getColumnModel().getIndexById("delete_contractNew")) {
                              // Ext.SelectStore.data.sp_tor_contract_editid;
                              if (record.data.sp_check_period != null) {
                                Ext.MessageBox.alert("แจ้งเตือน", "คุณตรวจรับไปแล้วไม่สามารถลบรายไขได้");
                              } else {
                                delete_contractNew(Ext.SelectStore);
                              }
                            } else {
                              RecSet = record.data;
                              console.log(RecSet);
                              Ext.getCmp("i_type_edit2ID").show();
                              Ext.getCmp("i_type_editID").setValue(2);
                              Ext.getCmp("sp_check_period").setValue(RecSet.sp_check_period);
                              Ext.getCmp("i_type_editID").setValue(2);
                              Ext.getCmp("i_periodID").setValue(RecSet.i_period);
                              Ext.getCmp("i_pr_type2ID").setValue(RecSet.i_pr_type1);
                              Ext.getCmp("i_is_item").setValue(RecSet.i_is_item);
                              Ext.getCmp("i_is_lastID").setValue(RecSet.i_is_last);
                              Ext.getCmp("d_doc_datePerID").setValue(RecSet.d_doc_date);
                              Ext.getCmp("d_period_dateID").setValue(RecSet.d_period_date);
                              Ext.getCmp("i_dayID").setValue(RecSet.i_day);
                              Ext.getCmp("i_alertID").setValue(RecSet.i_alert);
                              Ext.getCmp("sp_tor_hdr_period_idID").setValue(RecSet.id);
                              Ext.getCmp("dc_expense_budget_type_idPerTxtID").setValue(RecSet.dc_expense_budget_type_id);
                              Ext.getCmp("period_po_expense_id").setValue(RecSet.po_expense_per_dtl_id);
                              Ext.getCmp("dc_cost2_idID").setValue(RecSet.dc_cost2_id);
                              Ext.getCmp("f_total_amtPerID").setValue(RecSet.f_total_amt);
                              Ext.getCmp("i_period_contractID").setValue(RecSet.i_period);
                            }
                          }
                        };
                        // this.
                      },
                      rowcontextmenu: function (grid, rowIndex, e) {
                        e.stopEvent(); // ❗ หยุด default context menu
                        const record = grid.getStore().getAt(rowIndex); // ✅ ดึงข้อมูลแถว
                        Ext.selectRow5 = record; // ✅ สำคัญ เพื่อใช้ใน handler ภายหลัง
                        var mymenu = new Ext.menu.Menu({
                          items: [
                            {
                              text: "ขอแก้ไข",
                              // hidden: Ext.selectRow.data.c_code_po == null ? true : false,
                              icon: "../images/icons/application_view_detail.png",
                              scope: this,
                              handler: function (e) {
                                win_request_disable_acc(Ext.selectRow.data);
                              },
                            },
                          ],
                          listeners: {
                            beforerender: function () {},
                            hide: function () {
                              setTimeout(function () {
                                mymenu.destroy();
                              }, 0);
                            },
                          },
                        });
                        console.log(mymenu);
                        mymenu.showAt(e.getXY());
                      },
                      cellDblClick: function (grid, rowIndex, columnIndex, e) {
                        console.log(123);
                        const columnModel = grid.getColumnModel();
                        const column = columnModel.getColumnAt(columnIndex);
                        const columnId = column.id;
                        const dataIndex = column.dataIndex;
                      },
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
                              grid.store.load({ params: { sp_tor_contract_id: rec.data.sp_tor_contract_id } });
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
                                // console.log(grid)
                                // console.log(e)
                                // console.log(rec.data.sp_tor_contract_id)
                                grid.store.load({ params: { show_sql: 1, sp_tor_contract_id: rec.data.sp_tor_contract_id } });
                              },
                            });
                          }
                          menu.showAt(e.getXY());
                        });
                        Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                      },
                    },
                    columns: colPOPNew,
                    viewConfig: {
                      forceFit: false,
                      scrollOffset: 20, // เพิ่มความกว้าง scrollbar
                      emptyText: "ไม่มีข้อมูล..",
                      deferEmptyText: false,
                      getRowClass: function (record) {
                        if ([9999, 9998, 9997].includes(record.data.no)) {
                        } else {
                          return "td-succeed ";
                        }
                      },
                    },
                    // tbar: [

                    // ]
                  },
                ],
              },
            ],
            buttons: [
              {
                text: "บันทึกรายการ",
                handler: function () {
                  msg = "";
                  var formSubmit = function () {
                    form.submit({
                      waitMsg: "Saving Data...",
                      success: function (form, action) {
                        Ext.storeDtl.reload();
                        Ext.storeedit.reload();
                        let itemStore = Ext.getCmp("gridSub1ID").getStore();
                        itemStore.reload();
                      },
                    });
                  };
                  var form = Ext.getCmp("form_New_contract").getForm();
                  Ext.getCmp("mode_id").setValue("Edit_contrct");
                  Ext.getCmp("i_period_contractID").setValue(0);
                  Ext.getCmp("i_periodID").setValue(0);
                  Ext.getCmp("d_doc_datePerID").setValue(new Date().format("d-m-Y"));
                  Ext.getCmp("d_period_dateID").setValue(new Date().format("d-m-Y"));
                  Ext.getCmp("i_dayID").setValue(0);
                  Ext.getCmp("i_alertID").setValue(0);
                  Ext.getCmp("f_total_amtPerID").setValue(0);
                  Ext.getCmp("c_commentID").setValue("แก้ไขข้อมูลจาก New UI 04-08-2568");
                  Ext.getCmp("mode_id").setValue("Edit_contrct");
                  if (msg != "") {
                    Ext.example.msg("แจ้งเตือน", msg, 1);
                    $(this).next("text copied");
                    setTimeout(function () {
                      $(this).next().remove();
                    }, 6000);
                    return;
                  } else if (form.isValid()) {
                    formSubmit(form);
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
                  }
                },
              },
              {
                text: "ย้อนกลับ",
                handler: function () {
                  Ext.getCmp("winMainNew").destroy();
                  // Ext.getCmp(Ext.poFormID).hide();
                },
              },
            ],
          }),
        ],
      },
    ],
    listeners: {
      afterrender: function (win) {
        // win.maximize(); // สั่งให้หน้าต่างเต็มจอ
      },
    },
  });
  win.show();
};
