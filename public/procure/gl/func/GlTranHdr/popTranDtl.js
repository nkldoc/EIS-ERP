//=================================== รายละเอียดสมุดรายวัน ===================================//
SaveTranDtl = function(id, i_chk, mini) {
  var jsonArr = [];
  var msg = "";

  var total_dr = 0;
  var total_cr = 0;

  $("input[id^=dtl_no]").each(function(i, val) {
    // ROW RUN

    var index = val.value;
    var i_group = 0;

    var dc_creditor_id = null;
    var dc_debtor_id = null;
    var dc_emp_id = null;
    var c_other_name = null;
    var i_is_nontax_exp = null;
    var i_type_year = Ext.getCmp("i_type_year[" + index + "]").getValue().inputValue;
    var c_budget_year = null;
    var dc_expense_budget_type_id = Ext.getCmp("dtl_dc_expense_budget_type_id[" + index + "]").getValue();
    var f_dr = parseFloat(
      Ext.getCmp("dtl_f_dr[" + index + "]")
        .getValue()
        .replace(/,/g, "")
    );
    var f_cr = parseFloat(
      Ext.getCmp("dtl_f_cr[" + index + "]")
        .getValue()
        .replace(/,/g, "")
    );

    if (Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue() != "") {
      var ss = Ext.dc_acc.findExact("id", Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue());
      var i_group = Ext.dc_acc.data.items[ss].data.i_group;
    }

    // 1 = ปีงบประมาณ, 2 = เหลื่อมปี, 9 = ไม่ระบุ
    if (i_type_year == 1 || i_type_year == 2) {
      c_budget_year = Ext.getCmp("c_budget_year[" + index + "]").getValue();
    }

    if (i_group == 5) {
      if (Ext.getCmp("dtl_i_is_nontax_exp[" + index + "]").getValue() == true) {
        i_is_nontax_exp = 1;
      } else {
        i_is_nontax_exp = 2;
      }
    } else {
      i_is_nontax_exp = 2;
    }

    if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_DEBTOR) {
      // ลูกหนี้
      dc_debtor_id = Ext.getCmp("dtl_dc_debtor_id[" + index + "]").getValue();
      dc_creditor_id = null;
      dc_emp_id = null;
      c_other_name = null;
    } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_CREDITOR) {
      // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
      dc_debtor_id = null;
      dc_creditor_id = Ext.getCmp("dtl_dc_creditor_id[" + index + "]").getValue();
      dc_emp_id = null;
      c_other_name = null;
    } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_EMPLOYEE) {
      // เจ้าหนี้พนักงาน
      dc_debtor_id = null;
      dc_creditor_id = null;
      dc_emp_id = Ext.getCmp("dtl_dc_emp_id[" + index + "]").getValue();
      c_other_name = null;
    } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_OTHER) {
      // เจ้าหนี้ทั่วไป
      dc_debtor_id = null;
      dc_creditor_id = null;
      dc_emp_id = null;
      c_other_name = Ext.getCmp("dtl_c_other_name[" + index + "]").getValue();
    } else {
      dc_debtor_id = null;
      dc_creditor_id = null;
      dc_emp_id = null;
      c_other_name = null;
    }

    if (i_chk == true) {
      var dd = "";

      if (Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue() == 0) {
        dd += ", ผังบัญชี";
      }
      if (i_group == 4 || i_group == 5) {
        if (Ext.getCmp("dtl_dc_expense_budget_type_id[" + index + "]").getValue() == "") {
          dd += ", แหล่งเงิน";
        }
      }
      if (i_type_year == "") {
        dd += ", ปีงบประมาณ";
      } else {
        if ((i_type_year == 1 || i_type_year == 2) && Ext.getCmp("c_budget_year[" + index + "]").getValue() == "") {
          dd += ", ปี";
        }
      }
      if (Ext.getCmp("dtl_dc_cost_acc_id[" + index + "]").getValue() == 0) {
        dd += ", ศูนย์ต้นทุนทางบัญชี";
      }
      if (f_dr > 0 || f_cr > 0) {
        if (f_dr > 0 && f_cr > 0) {
          dd += ", จำนวนเงินเดบิตหรือเครดิตเท่านั้น";
        } else {
          total_dr += f_dr > 0 ? parseFloat(f_dr) : 0;
          total_cr += f_cr > 0 ? parseFloat(f_cr) : 0;
        }
      } else {
        dd += ", จำนวนเงินเดบิตหรือเครดิต";
      }

      if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_DEBTOR) {
        // ลูกหนี้
        if (dc_debtor_id == "") {
          dd += ", กรุณาเลือก ลูกหนี้";
        }
      } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_CREDITOR) {
        // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
        if (dc_creditor_id == "") {
          dd += ", กรุณาเลือก เจ้าหนี้ผู้ขาย/ผู้รับจ้าง";
        }
      } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_EMPLOYEE) {
        // เจ้าหนี้พนักงาน
        dc_emp_id = Ext.getCmp("dtl_dc_emp_id[" + index + "]").getValue();
        if (dc_emp_id == "") {
          dd += ", กรุณาเลือก ชื่อบุคคลภายใน";
        }
      } else if (Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue == PERSON_TYPE_OTHER) {
        // เจ้าหนี้ทั่วไป
        if (c_other_name == "") {
          dd += ", กรุณาเลือก ชื่อเจ้าหนี้ทั่วไป";
        }
      }

      if (dd != "") {
        msg += "แถวที่ " + (i + 1) + " กรุณาตรวจสอบ ( " + dd.substring(2) + " )<br>";
      }
    }

    jsonArr.push({
      gl_tran_hdr_id: id,
      i_rank: Ext.getCmp("dtl_i_rank[" + index + "]").getValue(),
      dc_acc_id: Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue(),
      dc_cost_acc_id: Ext.getCmp("dtl_dc_cost_acc_id[" + index + "]").getValue(),
      f_dr: f_dr,
      f_cr: f_cr,
      i_is_nontax_exp: i_is_nontax_exp,
      dc_product_id: Ext.getCmp("dtl_dc_product_id[" + index + "]").getValue(),
      i_type_person: Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue,
      dc_creditor_id: dc_creditor_id,
      dc_debtor_id: dc_debtor_id,
      dc_emp_id: dc_emp_id,
      c_other_name: c_other_name,
      i_type_year: i_type_year,
      c_budget_year: c_budget_year,
      dc_expense_budget_type_id: dc_expense_budget_type_id,
      i_return: Ext.getCmp("i_return[" + index + "]").getValue().inputValue
    });
  });

  if (i_chk == true) {
    if (total_dr.toFixed(2) != total_cr.toFixed(2)) {
      msg += "รวมทุกแถวต้องมีเงิน เดบิต เท่ากับ เครดิต<br>";
    }
  }

  if (msg == "") {
    Ext.getCmp("win-pop-tran-dtl")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_GlTranhdr.php",
      method: "POST",
      params: {
        mode: "GL_TRAN_DTL",
        id: id,
        i_chk_gl_dtl: i_chk,
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("win-pop-tran-dtl")
          .getEl()
          .unmask();
        var obj = $.parseJSON(result.responseText);
        if (obj.success == true) {
          if (mini == false) {
            Ext.store_tran_dtl_show.setBaseParam("id", id);
            Ext.store_tran_dtl_show.load();
          }
          Ext.getCmp("win-pop-tran-dtl").destroy();
        } else if (obj.success == false) {
          var dd = "";
          $.each(obj.data, function(index, v) {
            if (v.chk_tax == false) {
              msg += "กรุณาลบข้อมูลรายการภาษีซื้อที่ได้บันทึกไว้แล้วก่อนจึงจะสามารถ<br>ลบรหัสบัญชีภาษีหรือเปลี่ยนเป็นชื่อบัญชีอื่นได้<br>";
            }
            if (v.none) {
              var ss = "";
              $.each(v.none, function(indexA, vA) {
                ss += ", " + vA;
              });
              if (ss != "") {
                msg += '<br>- กรุณาบันทึกรายละเอียดภาษีซื้อที่แถบรายละเอียดภาษีซื้อ<br><span style="color: blue;">( ' + ss.substring(2) + " )</span><br>";
              }
            }
            if (v.unalike) {
              var ss = "";
              $.each(v.unalike, function(indexB, vB) {
                ss += ", " + vB;
              });
              if (ss != "") {
                msg += '<br>- กรุณาตรวจสอบ "จำนวนเงินภาษี" กับ "จำนวนยอดบันทึกบัญชี"<br><span style="color: blue;">( ' + ss.substring(2) + " )</span> ให้เท่ากัน<br>";
              }
            }
          });
          Ext.MessageBox.alert("แจ้งเตือน", msg);
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      }
    });
  } else {
    Ext.MessageBox.alert("แจ้งเตือน", msg);
  }
}; // SaveTranDtl

PopTranDtl = function(id, mini = false, i_receive = 2) {
  Ext.store_tran_dtl = new Ext.ux.grid.livegrid.Store({
    url: "api/List_GlTranhdr.php",
    baseParams: { type: "gl_tran_dtl", total_show: true },
    bufferSize: 300,
    reader: reader
  });

  new Ext.Window({
    title: "แสดงรายละเอียดสมุดรายวัน",
    id: "win-pop-tran-dtl",
    modal: true,
    preventBodyReset: true,
    closable: true,
    autoScroll: true,
    maximizable: true,
    // maximized: true, // เต็มจอ auto
    height: Ext.getBody().getViewSize().height * 0.99,
    width: Ext.getBody().getViewSize().width * 0.99,
    listeners: {
      afterrender: function(component) {
        // Create Row
        var tbody = "";

        Ext.getCmp("win-pop-tran-dtl")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        $.ajax({
          url: "api/List_GlTranhdr.php",
          type: "POST",
          data: {
            type: "gl_tran_dtl",
            id: id
          },
          success: function(result) {
            var obj = $.parseJSON(result);

            if (obj.debug == true) {
              $.each(obj.data, function(index, v) {
                var addBody = "";

                // GEN TBODY
                addBody += "<input id='dtl_no[" + index + "]' type='hidden' value='" + index + "'>";
                addBody += "<td id='Ext_dtl_i_rank[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dtl_dc_acc_id[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dtl_dc_cost_acc_id[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dtl_f_dr[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dtl_f_cr[" + index + "]' align='center'></td>";
                addBody += "<td align='center'><div id='Ext_i_return[" + index + "]' style='width:205px;'></div></td>";
                addBody += "<td id='Ext_dtl_i_is_nontax_exp[" + index + "]' align='center'></td>";
                addBody += "<td align='center'><div id='Ext_i_type_year[" + index + "]' style='width:250px;'></div></td>";
                addBody += "<td id='Ext_dtl_dc_expense_budget_type_id[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dtl_dc_product_id[" + index + "]' align='center'></td>";
                addBody += "<td align='center'><div id='Ext_dtl_i_type_person[" + index + "]' style='width:400px;'></div></td>";
                addBody += "<td id='Ext_dtl_delete[" + index + "]' align='center'></td>";

                $("#myTableDtl > tbody:last").append("<tr id='dtl_row[" + index + "]'>" + addBody + "</tr>");

                myFunc(index, v);
              });

              Ext.getCmp("win-pop-tran-dtl")
                .getEl()
                .unmask();
            }
          }
        });
      }
    },
    tbar: [
      {
        id: "row-tran-dtl",
        xtype: "idcardfield",
        width: 70,
        value: 1,
        hidden: mini == true && i_receive == 2 ? true : false,
        autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
        emptyText: "จำนวนแถว",
        listeners: {
          change: function(obj, value) {
            if (value == "") {
              obj.setValue(1);
            }
          }
        }
      },
      "-",
      {
        text: "เพิ่มแถว",
        hidden: mini == true && i_receive == 2 ? true : false,
        iconCls: "icon-add",
        handler: function(grid, rowIndex, colIndex) {
          var msg = "";

          if (msg == "") {
            for (var i = 1; i <= Ext.getCmp("row-tran-dtl").getValue(); i++) {
              var addBody = "";
              var beforeIndex = parseInt($("#myTableDtl > tbody > tr:last > input[id^=dtl_no]").val());
              var index = isNaN(beforeIndex) ? 0 : parseInt(beforeIndex) + 1;

              addBody += "<input id='dtl_no[" + index + "]' type='hidden' value='" + index + "'>";
              addBody += "<td id='Ext_dtl_i_rank[" + index + "]' align='center'></td>";
              addBody += "<td id='Ext_dtl_dc_acc_id[" + index + "]' align='center'></td>";
              addBody += "<td id='Ext_dtl_dc_cost_acc_id[" + index + "]' align='center'></td>";
              addBody += "<td id='Ext_dtl_f_dr[" + index + "]' align='center'></td>";
              addBody += "<td id='Ext_dtl_f_cr[" + index + "]' align='center'></td>";
              addBody += "<td align='center'><div id='Ext_i_return[" + index + "]' style='width:205px;'></div></td>";
              addBody += "<td id='Ext_dtl_i_is_nontax_exp[" + index + "]' align='center'></td>";
              addBody += "<td align='center'><div id='Ext_i_type_year[" + index + "]' style='width:250px;'></div></td>";
              addBody += "<td id='Ext_dtl_dc_expense_budget_type_id[" + index + "]' align='center'></td>";
              addBody += "<td id='Ext_dtl_dc_product_id[" + index + "]' align='center'></td>";
              addBody += "<td align='center'><div id='Ext_dtl_i_type_person[" + index + "]' style='width:400px;'></div></td>";
              addBody += "<td id='Ext_dtl_delete[" + index + "]' align='center'></td>";

              $("#myTableDtl > tbody:last").append("<tr id='dtl_row[" + index + "]'>" + addBody + "</tr>");

              myFunc(index);
              ChangeAcc(index);
            }
          } else {
            Ext.MessageBox.alert("แจ้งเตือน", msg);
          }
        }
      }
    ],
    html:
      "<div style='background:#fff; overflow:auto;'>" +
      "<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
      "<input type='hidden' id='dtl_creditor_dtl_id'>" +
      "<input type='hidden' id='dtl_creditor_dtl_val'>" +
      "<table id='myTableDtl' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
      // headder
      "<thead class='x-grid3-header'>" +
      "<tr class='x-grid3-hd-row' height='20'>" +
      "<td nowrap>ที่</td>" +
      "<td nowrap>รหัสบัญชี</td>" +
      "<td nowrap>ชื่อศูนย์ต้นทุน</td>" +
      "<td nowrap>เดบิต</td>" +
      "<td nowrap>เครดิต</td>" +
      "<td nowrap>(รายละเอียด เครดิต)</td>" +
      "<td nowrap>รายการบวกกลับ</td>" +
      "<td nowrap>ปีงบประมาณ</td>" +
      "<td nowrap>แหล่งเงิน</td>" +
      "<td nowrap>รายการรายได้/รายการออกอากาศ</td>" +
      "<td nowrap>ชื่อลูกหนี้/เจ้าหนี้</td>" +
      "<td nowrap width='40'>-</td>" +
      "</tr>" +
      "</thead>" +
      // body
      "<tbody></tbody>" +
      "<tfoot>" +
      "<tr>" +
      "<td colspan='3' align='right'><b>รวม</b></td>" +
      "<td id='sum_dr' style='text-align: right; font-weight: bold;'>0.00</td>" +
      "<td id='sum_cr' style='text-align: right; font-weight: bold;'>0.00</td>" +
      "</tr>" +
      "</tfoot>" +
      "</table>" +
      "</form>" +
      "</div>",
    buttonAlign: "left",
    buttons: [
      {
        text: Ext.GLOBAL_BU_SAVE_TH,
        iconCls: "icon-save",
        hidden: mini == true ? true : false,
        handler: function() {
          var chkData = false;
          $("input[id^=dtl_no]").each(function(i, val) {
            chkData = true;
          });
          if (chkData == true) {
            SaveTranDtl(id, false, mini);
          } else {
            Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ");
          }
        }
      },
      {
        text: "บันทึกการแก้ไขและตรวจสอบ",
        iconCls: "icon-save",
        handler: function() {
          var chkData = false;
          $("input[id^=dtl_no]").each(function(i, val) {
            chkData = true;
          });
          if (chkData == true) {
            SaveTranDtl(id, true, mini);
          } else {
            Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ");
          }
        }
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function() {
          Ext.getCmp("win-pop-tran-dtl").destroy();
        }
      }
    ]
  }).show();

  // ============================ myFunc ============================ //
  var myFunc = function(index, v = null) {
    // ลำดับที่
    new Ext.form.TextField({
      id: "dtl_i_rank[" + index + "]",
      style: "text-align: center",
      width: 50,
      renderTo: "Ext_dtl_i_rank[" + index + "]"
    });

    // รหัสบัญชี
    new Ext.form.ComboBox({
      id: "dtl_dc_acc_id[" + index + "]",
      store: Ext.dc_acc,
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
        blur: function() {
          this.getStore().clearFilter();
        },
        afterrender: function() {
          this.fn = function() {
            ChangeAcc(index);
          };
        },
        Change: function(value) {
          this.fn();
        }
      },
      renderTo: "Ext_dtl_dc_acc_id[" + index + "]"
    });

    // ชื่อศูนย์ต้นทุน
    new Ext.form.ComboBox({
      id: "dtl_dc_cost_acc_id[" + index + "]",
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
        blur: function() {
          this.getStore().clearFilter();
        }
      },
      renderTo: "Ext_dtl_dc_cost_acc_id[" + index + "]"
    });

    // เดบิต
    new Ext.form.TextField({
      id: "dtl_f_dr[" + index + "]",
      style: "text-align: right",
      listeners: {
        afterrender: function() {
          this.fn = function() {
            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            SumPrice();
          };
        },
        Change: function(value) {
          this.fn();
        }
      },
      width: 100,
      renderTo: "Ext_dtl_f_dr[" + index + "]"
    });

    // เครดิต
    new Ext.form.TextField({
      id: "dtl_f_cr[" + index + "]",
      style: "text-align: right",
      listeners: {
        afterrender: function() {
          this.fn = function() {
            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            SumPrice();
          };
        },
        Change: function(value) {
          this.fn();
        }
      },
      width: 100,
      renderTo: "Ext_dtl_f_cr[" + index + "]"
    });

    new Ext.form.RadioGroup({
      id: "i_return[" + index + "]",
      columns: [70, 70, 65],
      items: [
        { boxLabel: "หักส่งคืน", name: "i_return[" + index + "]", inputValue: 1 },
        { boxLabel: "ปรับปรุง", name: "i_return[" + index + "]", inputValue: 2 },
        { boxLabel: "ไม่ระบุ", name: "i_return[" + index + "]", inputValue: 3, checked: true }
      ],
      renderTo: "Ext_i_return[" + index + "]"
    });

    new Ext.ButtonGroup({
      columns: 1,
      frame: false,
      items: [
        new Ext.form.RadioGroup({
          id: "i_type_year[" + index + "]",
          columns: [90, 70, 50],
          items: [
            { boxLabel: "ปีงบประมาณ", name: "i_type_year[" + index + "]", inputValue: 1 },
            { boxLabel: "เหลื่อมปี", name: "i_type_year[" + index + "]", inputValue: 2 },
            { boxLabel: "ไม่ระบุ", name: "i_type_year[" + index + "]", inputValue: 9, checked: true }
          ],
          listeners: {
            afterrender: function() {
              this.fn = function() {
                var i_type_year = Ext.getCmp("i_type_year[" + index + "]").getValue().inputValue;

                if (i_type_year == 1 || i_type_year == 2) {
                  Ext.getCmp("span_year[" + index + "]").show();
                } else {
                  Ext.getCmp("span_year[" + index + "]").hide();
                }
              };
            },
            Change: function(value) {
              this.fn();
            }
          }
        }),
        {
          xtype: "buttongroup",
          frame: false,
          items: [
            {
              xtype: "buttongroup",
              id: "span_year[" + index + "]",
              frame: false,
              width: 200,
              items: [
                new Ext.form.ComboBox({
                  id: "c_budget_year[" + index + "]",
                  store: Ext.store_year,
                  valueField: "id",
                  displayField: "c_name",
                  mode: "local",
                  triggerAction: "all",
                  emptyText: "กรุณาเลือก...",
                  forceSelection: true,
                  selectOnFocus: true,
                  typeAhead: false,
                  value: new Date().getFullYear(),
                  listeners: {
                    beforequery: function(q) {
                      if (q.query) {
                        var length = q.query.length;
                        q.query = new RegExp(Ext.escapeRe(q.query));
                        q.query.length = length;
                      }
                    },
                    blur: function() {
                      this.getStore().clearFilter();
                    }
                  }
                })
              ]
            }
          ]
        }
      ],
      renderTo: "Ext_i_type_year[" + index + "]"
    });

    new Ext.form.ComboBox({
      id: "dtl_dc_expense_budget_type_id[" + index + "]",
      store: Ext.dc_expense_budget_type,
      valueField: "id",
      displayField: "c_name",
      mode: "local",
      triggerAction: "all",
      emptyText: "กรุณาเลือก...",
      width: 320,
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
        blur: function() {
          this.getStore().clearFilter();
        }
      },
      renderTo: "Ext_dtl_dc_expense_budget_type_id[" + index + "]"
    });

    // รายการบวกกลับ
    new Ext.form.Checkbox({
      id: "dtl_i_is_nontax_exp[" + index + "]",
      inputValue: "1",
      hidden: true,
      renderTo: "Ext_dtl_i_is_nontax_exp[" + index + "]"
    });

    // รายการรายได้
    new Ext.ButtonGroup({
      columns: 1,
      frame: false,
      items: [
        {
          xtype: "buttongroup",
          frame: false,
          width: 300,
          items: [
            {
              xtype: "button",
              iconCls: "book_open_mark",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    PopProduct(index);
                  };
                },
                click: function() {
                  this.fn();
                }
              }
            },
            { xtype: "tbspacer", width: 4 },
            { id: "dtl_dc_product_id[" + index + "]", xtype: "hidden" },
            { id: "dtl_dc_product_name[" + index + "]", xtype: "textfield", width: 200, readOnly: true },
            { xtype: "tbspacer", width: 4 },
            {
              xtype: "button",
              text: "Reset",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    var arr = ["dtl_dc_product_id[" + index + "]", "dtl_dc_product_name[" + index + "]"];
                    Reset(arr);
                  };
                },
                click: function() {
                  this.fn();
                }
              }
            }
          ]
        }
      ],
      renderTo: "Ext_dtl_dc_product_id[" + index + "]"
    });

    // ชื่อลูกหนี้/เจ้าหนี้
    new Ext.ButtonGroup({
      columns: 1,
      frame: false,
      items: [
        new Ext.form.RadioGroup({
          id: "dtl_i_type_person[" + index + "]",
          columns: [50, 60, 135, 90, 60],
          items: [
            { boxLabel: "ไม่มี", name: "i_type_person[" + index + "]", inputValue: 0, checked: true },
            { boxLabel: "ลูกหนี้", name: "i_type_person[" + index + "]", inputValue: PERSON_TYPE_DEBTOR },
            { boxLabel: "เจ้าหนี้ผู้ขาย/ผู้รับจ้าง", name: "i_type_person[" + index + "]", inputValue: PERSON_TYPE_CREDITOR },
            { boxLabel: "บุคคลภายใน", name: "i_type_person[" + index + "]", inputValue: PERSON_TYPE_EMPLOYEE },
            { boxLabel: "ทั่วไป", name: "i_type_person[" + index + "]", inputValue: PERSON_TYPE_OTHER }
          ],
          listeners: {
            afterrender: function() {
              this.fn = function() {
                ChangeCreditor(index);
              };
            },
            Change: function(value) {
              this.fn();
            }
          }
        }),
        {
          xtype: "buttongroup",
          frame: false,
          items: [
            {
              xtype: "buttongroup",
              id: "span_creditor[" + index + "]",
              frame: false,
              width: 400,
              items: [
                {
                  xtype: "button",
                  iconCls: "book_open_mark",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        PopCreditor("vw_dc_creditor", index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                },
                { xtype: "tbspacer", width: 4 },
                { id: "dtl_dc_creditor_id[" + index + "]", xtype: "hidden" },
                { id: "dtl_dc_creditor_name[" + index + "]", xtype: "textfield", width: 300, readOnly: true },
                { xtype: "tbspacer", width: 4 },
                {
                  xtype: "button",
                  text: "Reset",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        var arr = ["dtl_dc_creditor_id[" + index + "]", "dtl_dc_creditor_name[" + index + "]"];
                        Reset(arr);
                        ChangeCreditor(index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                }
              ]
            },
            {
              xtype: "buttongroup",
              id: "span_debtor[" + index + "]",
              frame: false,
              width: 400,
              items: [
                {
                  xtype: "button",
                  iconCls: "book_open_mark",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        PopCreditor("vw_dc_debtor", index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                },
                { xtype: "tbspacer", width: 4 },
                { id: "dtl_dc_debtor_id[" + index + "]", xtype: "hidden" },
                { id: "dtl_dc_debtor_name[" + index + "]", xtype: "textfield", width: 300, readOnly: true },
                { xtype: "tbspacer", width: 4 },
                {
                  xtype: "button",
                  text: "Reset",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        var arr = ["dtl_dc_debtor_id[" + index + "]", "dtl_dc_debtor_name[" + index + "]"];
                        Reset(arr);
                        ChangeCreditor(index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                }
              ]
            },
            {
              xtype: "buttongroup",
              id: "span_emp[" + index + "]",
              frame: false,
              width: 400,
              items: [
                {
                  xtype: "button",
                  iconCls: "book_open_mark",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        PopCreditor("dc_emp", index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                },
                { xtype: "tbspacer", width: 4 },
                { id: "dtl_dc_emp_id[" + index + "]", xtype: "hidden" },
                { id: "dtl_dc_emp_name[" + index + "]", xtype: "textfield", width: 300, readOnly: true },
                { xtype: "tbspacer", width: 4 },
                {
                  xtype: "button",
                  text: "Reset",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        var arr = ["dtl_dc_emp_id[" + index + "]", "dtl_dc_emp_name[" + index + "]"];
                        Reset(arr);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                }
              ]
            },
            {
              xtype: "buttongroup",
              id: "span_other_name[" + index + "]",
              frame: false,
              width: 400,
              items: [
                {
                  xtype: "button",
                  iconCls: "book_open_mark",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        PopCreditor("other_name", index);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                },
                { xtype: "tbspacer", width: 4 },
                { id: "dtl_c_other_name[" + index + "]", xtype: "textfield", width: 300, readOnly: true },
                { xtype: "tbspacer", width: 4 },
                {
                  xtype: "button",
                  text: "Reset",
                  listeners: {
                    afterrender: function() {
                      this.fn = function() {
                        var arr = ["dtl_c_other_name[" + index + "]"];
                        Reset(arr);
                      };
                    },
                    click: function() {
                      this.fn();
                    }
                  }
                }
              ]
            }
          ]
        }
      ],
      renderTo: "Ext_dtl_i_type_person[" + index + "]"
    });

    // ลบ
    new Ext.Button({
      id: "dtl_delete[" + index + "]",
      icon: "../images/icons/bin.gif",
      tooltip: "ลบรายการ",
      handler: function() {
        $("#myTableDtl > tbody > #dtl_row\\[" + index + "\\]").remove();
        SumPrice();
      },
      renderTo: "Ext_dtl_delete[" + index + "]"
    });

    if (v != null) {
      if (v.dc_acc_id > 0) {
        Ext.getCmp("dtl_dc_acc_id[" + index + "]").setValue(v.dc_acc_id);
        Ext.getCmp("dtl_dc_acc_id[" + index + "]").fn();
      } else {
        ChangeAcc(index);
      }

      if (v.dc_cost_acc_id > 0) {
        Ext.getCmp("dtl_dc_cost_acc_id[" + index + "]").setValue(v.dc_cost_acc_id);
      }
      if (v.f_dr > 0) {
        Ext.getCmp("dtl_f_dr[" + index + "]").setValue(v.f_dr);
        Ext.getCmp("dtl_f_dr[" + index + "]").fn();
      }
      if (v.f_cr > 0) {
        Ext.getCmp("dtl_f_cr[" + index + "]").setValue(v.f_cr);
        Ext.getCmp("dtl_f_cr[" + index + "]").fn();
      }
      if (v.dc_product_id > 0) {
        Ext.getCmp("dtl_dc_product_id[" + index + "]").setValue(v.dc_product_id);
        Ext.getCmp("dtl_dc_product_name[" + index + "]").setValue(v.dc_product_name);
      }
      if (v.dc_debtor_id > 0) {
        Ext.getCmp("dtl_dc_debtor_id[" + index + "]").setValue(v.dc_debtor_id);
      }
      if (v.dc_creditor_id > 0) {
        Ext.getCmp("dtl_dc_creditor_id[" + index + "]").setValue(v.dc_creditor_id);
      }
      if (v.dc_emp_id > 0) {
        Ext.getCmp("dtl_dc_emp_id[" + index + "]").setValue(v.dc_emp_id);
      }
      if (v.dc_expense_budget_type_id > 0) {
        Ext.getCmp("dtl_dc_expense_budget_type_id[" + index + "]").setValue(v.dc_expense_budget_type_id);
      }
      Ext.getCmp("i_type_year[" + index + "]").setValue(v.i_type_year);
      Ext.getCmp("i_type_year[" + index + "]").fn();
      Ext.getCmp("c_budget_year[" + index + "]").setValue(v.c_budget_year);
      Ext.getCmp("dtl_i_type_person[" + index + "]").setValue(v.i_type_person);
      Ext.getCmp("dtl_i_type_person[" + index + "]").fn();
      Ext.getCmp("dtl_i_rank[" + index + "]").setValue(v.i_rank);
      Ext.getCmp("i_return[" + index + "]").setValue(v.i_return);
      Ext.getCmp("dtl_i_is_nontax_exp[" + index + "]").setValue(v.i_is_nontax_exp);
      Ext.getCmp("dtl_dc_debtor_name[" + index + "]").setValue(v.dc_debtor_name);
      Ext.getCmp("dtl_dc_creditor_name[" + index + "]").setValue(v.dc_creditor_name);
      Ext.getCmp("dtl_dc_emp_name[" + index + "]").setValue(v.dc_emp_name);
      Ext.getCmp("dtl_c_other_name[" + index + "]").setValue(v.c_other_name);
    } else {
      Ext.getCmp("dtl_i_rank[" + index + "]").setValue(index + 1);
      Ext.getCmp("dtl_i_type_person[" + index + "]").fn();
    }
    ChangeCreditor(index); // check hide span

    if (mini == true && i_receive == 2) {
      Ext.getCmp("dtl_i_rank[" + index + "]").disable(true);
      Ext.getCmp("dtl_dc_acc_id[" + index + "]").disable(true);
      Ext.getCmp("dtl_dc_cost_acc_id[" + index + "]").disable(true);
      Ext.getCmp("dtl_f_dr[" + index + "]").disable(true);
      Ext.getCmp("dtl_f_cr[" + index + "]").disable(true);
      Ext.getCmp("dtl_i_is_nontax_exp[" + index + "]").disable(true);
      Ext.getCmp("dtl_delete[" + index + "]").disable(true);
    }
  }; // myFunc

  // ============================================ //
  var ChangeAcc = function(index) {
    var i_group = 0;

    if (Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue() > 0) {
      var ss = Ext.dc_acc.findExact("id", "" + Ext.getCmp("dtl_dc_acc_id[" + index + "]").getValue() + "");
      if (ss > -1) {
        i_group = Ext.dc_acc.data.items[ss].data.i_group;
      }
    }

    if (i_group == 5) {
      Ext.getCmp("dtl_i_is_nontax_exp[" + index + "]").show();
    } else {
      Ext.getCmp("dtl_i_is_nontax_exp[" + index + "]").hide();
    }
  };

  // ============================================ //
  var SumPrice = function() {
    var index;
    var f_dr = 0.0;
    var c_dr = 0.0;
    var sum_dr = 0.0;
    var sum_cr = 0.0;

    $("input[id^=dtl_no]").each(function(i, val) {
      // ROW RUN

      index = val.value;
      f_dr = parseFloat(
        Ext.getCmp("dtl_f_dr[" + index + "]")
          .getValue()
          .replace(/,/g, "")
      );
      f_cr = parseFloat(
        Ext.getCmp("dtl_f_cr[" + index + "]")
          .getValue()
          .replace(/,/g, "")
      );

      sum_dr += f_dr > 0.0 ? f_dr : 0.0;
      sum_cr += f_cr > 0.0 ? f_cr : 0.0;
    });

    sum_dr = sum_dr > 0.0 ? floatRenderer(floatAccount(sum_dr.toFixed(2), 2)) : "0.00";
    sum_cr = sum_cr > 0.0 ? floatRenderer(floatAccount(sum_cr.toFixed(2), 2)) : "0.00";

    $("#sum_dr").text(sum_dr);
    $("#sum_cr").text(sum_cr);
  };

  // ============================================ //
  var ChangeCreditor = function(index) {
    var i_type_person = Ext.getCmp("dtl_i_type_person[" + index + "]").getValue().inputValue;

    if (i_type_person == PERSON_TYPE_DEBTOR) {
      // ลูกหนี้

      Ext.getCmp("span_debtor[" + index + "]").show();
      Ext.getCmp("span_creditor[" + index + "]").hide();
      Ext.getCmp("span_emp[" + index + "]").hide();
      Ext.getCmp("span_other_name[" + index + "]").hide();
    } else if (i_type_person == PERSON_TYPE_CREDITOR) {
      // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง

      Ext.getCmp("span_debtor[" + index + "]").hide();
      Ext.getCmp("span_creditor[" + index + "]").show();
      Ext.getCmp("span_emp[" + index + "]").hide();
      Ext.getCmp("span_other_name[" + index + "]").hide();
    } else if (i_type_person == PERSON_TYPE_EMPLOYEE) {
      // เจ้าหนี้พนักงาน

      Ext.getCmp("span_debtor[" + index + "]").hide();
      Ext.getCmp("span_creditor[" + index + "]").hide();
      Ext.getCmp("span_emp[" + index + "]").show();
      Ext.getCmp("span_other_name[" + index + "]").hide();
    } else if (i_type_person == PERSON_TYPE_OTHER) {
      // เจ้าหนี้ทั่วไป

      Ext.getCmp("span_debtor[" + index + "]").hide();
      Ext.getCmp("span_creditor[" + index + "]").hide();
      Ext.getCmp("span_emp[" + index + "]").hide();
      Ext.getCmp("span_other_name[" + index + "]").show();
    } else {
      Ext.getCmp("span_debtor[" + index + "]").hide();
      Ext.getCmp("span_creditor[" + index + "]").hide();
      Ext.getCmp("span_emp[" + index + "]").hide();
      Ext.getCmp("span_other_name[" + index + "]").hide();
    }
  };

  // ============================================ //
  var cellClick_lov = function(grid, rowIndex, columnIndex, e) {
    var ss_id;
    var ss_store;
    var record = grid.getStore().getAt(rowIndex);
    var creditor_dtl_id = $("#dtl_creditor_dtl_id").val();
    var index = $("#dtl_creditor_dtl_val").val();

    if (creditor_dtl_id == "vw_dc_creditor") {
      ss_id = Ext.vw_dc_creditor.findExact("id", record.data.id);
      ss_store = Ext.vw_dc_creditor.data.items[ss_id];

      Ext.getCmp("dtl_dc_creditor_id[" + index + "]").setValue(ss_store.data.id);
      Ext.getCmp("dtl_dc_creditor_name[" + index + "]").setValue(ss_store.data.c_name);

      ChangeCreditor(index);
    } else if (creditor_dtl_id == "vw_dc_debtor") {
      ss_id = Ext.vw_dc_debtor.findExact("id", record.data.id);
      ss_store = Ext.vw_dc_debtor.data.items[ss_id];

      Ext.getCmp("dtl_dc_debtor_id[" + index + "]").setValue(ss_store.data.id);
      Ext.getCmp("dtl_dc_debtor_name[" + index + "]").setValue(ss_store.data.c_name);

      ChangeCreditor(index);
    } else if (creditor_dtl_id == "dc_emp") {
      ss_id = Ext.vw_show_emp_name_gl0201b.findExact("id", record.data.id);
      ss_store = Ext.vw_show_emp_name_gl0201b.data.items[ss_id];

      Ext.getCmp("dtl_dc_emp_id[" + index + "]").setValue(ss_store.data.id);
      Ext.getCmp("dtl_dc_emp_name[" + index + "]").setValue(ss_store.data.c_name);
    } else if (creditor_dtl_id == "other_name") {
      ss_id = Ext.vw_c_other.findExact("id", record.data.id);
      ss_store = Ext.vw_c_other.data.items[ss_id];

      Ext.getCmp("dtl_c_other_name[" + index + "]").setValue(ss_store.data.c_name);
    }

    Ext.getCmp("win-pop-lov").destroy();
  };

  // ============================================ //
  var PopCreditor = function(name_id, val) {
    var sto;

    if (name_id == "vw_dc_creditor") {
      sto = Ext.vw_dc_creditor;
    } else if (name_id == "vw_dc_debtor") {
      sto = Ext.vw_dc_debtor;
    } else if (name_id == "dc_emp") {
      sto = Ext.vw_show_emp_name_gl0201b;
    } else if (name_id == "other_name") {
      sto = Ext.vw_c_other;
    }

    $("#dtl_creditor_dtl_id").val(name_id);
    $("#dtl_creditor_dtl_val").val(val);

    if (name_id == "vw_dc_creditor" || name_id == "vw_dc_debtor" || name_id == "dc_emp") {
      new Ext.Window({
        id: "win-pop-lov",
        title: "เลือกข้อมูล",
        modal: true,
        maximizable: true,
        height: Ext.getBody().getViewSize().height * 0.8,
        width: Ext.getBody().getViewSize().width * 0.8,
        layout: "fit",
        items: [
          {
            xtype: "grid",
            id: "win-pop-lov-tabpanel",
            border: false,
            stripeRows: true,
            loadMask: true,
            store: sto,
            viewConfig: {
              emptyText: "ไม่มีข้อมูล..",
              deferEmptyText: false
            },
            listeners: {
              afterrender: function() {
                this.getStore().setBaseParam("mode", "");
                this.getStore().load();
              }
            },
            tbar: [
              {
                id: "pop-filter",
                xtype: "combo",
                width: 110,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["c_code", "รหัส"],
                    ["c_name", "ชื่อ"]
                  ]
                }),
                valueField: "value",
                displayField: "text",
                value: "c_code",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                emptyText: "เลือกตัวกรอง"
              },
              " ",
              {
                id: "pop-value",
                xtype: "textfield",
                width: 130,
                emptyText: "คำที่ต้องการค้นหา"
              },
              "-",
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function() {
                  if (Ext.getCmp("pop-value").getValue() != "") {
                    sto.setBaseParam("filter", Ext.getCmp("pop-filter").getValue());
                    sto.setBaseParam("value", Ext.getCmp("pop-value").getValue());
                  } else {
                    sto.setBaseParam("filter", "");
                    sto.setBaseParam("value", "");
                  }
                  sto.setBaseParam("mode", "SEARCH");
                  sto.load();
                }
              }
            ],
            bbar: new Ext.PagingToolbar({
              pageSize: 15,
              store: sto,
              displayInfo: true,
              displayMsg: "Displaying topics {0} - {1} of {2}"
            }),
            columns: [
              new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function(value, metaData, record, row, col, store, gridView) {
                  return record.get("no");
                }
              }),
              {
                header: "รหัส",
                sortable: true,
                dataIndex: "c_code",
                renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='cursor:pointer; text-align:center;';";
                  return value;
                }
              },
              {
                id: "synName",
                header: "ชื่อ",
                sortable: true,
                dataIndex: "c_name",
                renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='cursor:pointer';";
                  return value;
                }
              }
            ],
            autoExpandColumn: "synName"
          }
        ]
      }).show();
    } else {
      new Ext.Window({
        id: "win-pop-lov",
        title: "เลือกข้อมูล",
        modal: true,
        maximizable: true,
        height: Ext.getBody().getViewSize().height * 0.8,
        width: Ext.getBody().getViewSize().width * 0.8,
        layout: "fit",
        items: [
          {
            xtype: "grid",
            id: "win-pop-lov-tabpanel",
            border: false,
            stripeRows: true,
            loadMask: true,
            store: sto,
            viewConfig: {
              emptyText: "ไม่มีข้อมูล..",
              deferEmptyText: false
            },
            listeners: {
              afterrender: function() {
                this.getStore().setBaseParam("mode", "");
                this.getStore().load();
              }
            },
            tbar: [
              {
                id: "pop-filter",
                xtype: "combo",
                width: 110,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [["c_name", "ชื่อ"]]
                }),
                valueField: "value",
                displayField: "text",
                value: "c_name",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                emptyText: "เลือกตัวกรอง"
              },
              " ",
              {
                id: "pop-value",
                xtype: "textfield",
                width: 130,
                emptyText: "คำที่ต้องการค้นหา"
              },
              "-",
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function() {
                  if (Ext.getCmp("pop-value").getValue() != "") {
                    sto.setBaseParam("filter", Ext.getCmp("pop-filter").getValue());
                    sto.setBaseParam("value", Ext.getCmp("pop-value").getValue());
                  } else {
                    sto.setBaseParam("filter", "");
                    sto.setBaseParam("value", "");
                  }
                  sto.setBaseParam("mode", "SEARCH");
                  sto.load();
                }
              }
            ],
            bbar: new Ext.PagingToolbar({
              pageSize: 15,
              store: sto,
              displayInfo: true,
              displayMsg: "Displaying topics {0} - {1} of {2}"
            }),
            columns: [
              new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function(value, metaData, record, row, col, store, gridView) {
                  return record.get("no");
                }
              }),
              {
                id: "synName",
                header: "ชื่อ",
                sortable: true,
                dataIndex: "c_name",
                renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='cursor:pointer';";
                  return value;
                }
              }
            ],
            autoExpandColumn: "synName"
          }
        ]
      }).show();
    }
    Ext.getCmp("win-pop-lov-tabpanel").on("cellclick", cellClick_lov, this);
  };

  // ============================================ //
  var PopProduct = function(index) {
    var cellClick_Product = function(grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      var ss_id = Ext.vw_product_class_type_new2.findExact("id", record.data.id);
      var ss_store = Ext.vw_product_class_type_new2.data.items[ss_id];

      Ext.getCmp("dtl_dc_product_id[" + index + "]").setValue(ss_store.data.id);
      Ext.getCmp("dtl_dc_product_name[" + index + "]").setValue(ss_store.data.c_name);

      Ext.getCmp("win-product").destroy();
    };

    new Ext.Window({
      id: "win-product",
      title: "เลือกข้อมูล",
      modal: true,
      maximizable: true,
      height: Ext.getBody().getViewSize().height * 0.8,
      width: Ext.getBody().getViewSize().width * 0.8, //80% *0.8
      layout: "fit",
      items: [
        {
          xtype: "grid",
          id: "win-product-tabpanel",
          border: false,
          stripeRows: true,
          loadMask: true,
          store: Ext.vw_product_class_type_new2,
          viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false
          },
          listeners: {
            afterrender: function() {
              this.getStore().setBaseParam("mode", "");
              this.getStore().load();
            }
          },
          tbar: [
            {
              id: "product-filter",
              xtype: "combo",
              width: 110,
              mode: "local",
              store: new Ext.data.SimpleStore({
                fields: ["value", "text"],
                data: [
                  ["c_code", "รหัสรายการรายได้"],
                  ["c_name", "ชื่อรายการรายได้"]
                ]
              }),
              valueField: "value",
              displayField: "text",
              value: "c_name",
              allowBlank: false,
              editable: false,
              triggerAction: "all",
              typeAhead: false,
              emptyText: "เลือกตัวกรอง"
            },
            " ",
            {
              id: "product-value",
              xtype: "textfield",
              width: 130,
              emptyText: "คำที่ต้องการค้นหา"
            },
            "-",
            {
              text: "ค้นหา",
              iconCls: "icon-magnifier",
              handler: function() {
                if (Ext.getCmp("product-value").getValue() != "") {
                  Ext.vw_product_class_type_new2.setBaseParam("filter", Ext.getCmp("product-filter").getValue());
                  Ext.vw_product_class_type_new2.setBaseParam("value", Ext.getCmp("product-value").getValue());
                } else {
                  Ext.vw_product_class_type_new2.setBaseParam("filter", "");
                  Ext.vw_product_class_type_new2.setBaseParam("value", "");
                }
                Ext.vw_product_class_type_new2.setBaseParam("mode", "SEARCH");
                Ext.vw_product_class_type_new2.load();
              }
            }
          ],
          bbar: new Ext.PagingToolbar({
            pageSize: 15,
            store: Ext.vw_product_class_type_new2,
            displayInfo: true,
            displayMsg: "Displaying topics {0} - {1} of {2}"
          }),
          columns: [
            new Ext.grid.RowNumberer({
              header: "ลำดับ",
              width: 30,
              renderer: function(value, metaData, record, row, col, store, gridView) {
                return record.get("no");
              }
            }),
            {
              header: "รหัสรายการรายได้",
              sortable: true,
              dataIndex: "c_code",
              renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = 'style= "cursor:pointer; text-align:center;";';
                return value;
              }
            },
            {
              id: "synName",
              header: "ชื่อรายการรายได้",
              sortable: true,
              dataIndex: "c_name",
              renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = 'style= "cursor:pointer";';
                return value;
              }
            }
          ],
          autoExpandColumn: "synName"
        }
      ]
    }).show();

    Ext.getCmp("win-product-tabpanel").on("cellclick", cellClick_Product, this);
  };

  // ============================================ //
  var Reset = function(arr) {
    $(arr).each(function(i, val) {
      // ROW RUN
      Ext.getCmp(val).setValue("");
    });
  };
}; // PopTranDtl
