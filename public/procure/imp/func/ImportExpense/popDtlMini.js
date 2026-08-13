// SaveDtl = function(id) {
//   var jsonArr = [];
//   var msg = "";

//   $("input[id^=dtl_no]").each(function(i, val) {
//     // ROW RUN

//     var index = val.value;
//     jsonArr.push({
//       id: Ext.getCmp("dtl_imp_expense_vsn_dtl_id[" + index + "]").getValue(),
//       c_booking: Ext.getCmp("dtl_c_booking[" + index + "]").getValue()
//     });
//   });

//   if (msg == "") {
//     Ext.getCmp("win-pop-dtl")
//       .getEl()
//       .mask("Please wait...", "x-mask-loading");
//     Ext.Ajax.request({
//       url: "api/mn_ImportExpenseVSN.php",
//       method: "POST",
//       params: {
//         mode: "SAVE_DTL_DETAIL",
//         data: JSON.stringify(jsonArr)
//       },
//       success: function(result, request) {
//         Ext.getCmp("win-pop-dtl")
//           .getEl()
//           .unmask();
//         var obj = $.parseJSON(result.responseText);
//         if (obj.success == true) {
//           Ext.getCmp("win-pop-dtl").destroy();
//           Ext.MessageBox.alert("แจ้งเตือน", obj.msg);
//         }
//       },
//       failure: function(result, request) {
//         Ext.MessageBox.alert("Failed", result.responseText);
//       }
//     });
//   } else {
//     Ext.MessageBox.alert("แจ้งเตือน", msg);
//   }
// }; // SaveDtl

const PopDtlMini = function(record) {
  $("#form_save_dtl > tbody").empty();

  new Ext.Window({
    title: "รายละเอียดค่าใช้จ่าย (e-PHIS)",
    id: "win-pop-dtl",
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
        Ext.getCmp("win-pop-dtl")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        $.ajax({
          url: "api/List_ImportExpense.php",
          type: "POST",
          data: {
            type: "imp_expense_dtl",
            hdr_id: record.data.id
          },
          success: function(result) {
            var obj = $.parseJSON(result);
            if (obj.debug == true) {
              $.each(obj.data, function(index, v) {
                var addBody = "";
                // GEN TBODY
                addBody += "<input id='dtl_no[" + index + "]' type='hidden' value='" + index + "'>";
                addBody += "<td align='center'>" + v.no + "</td>";
                addBody += "<td align='center'>" + (parseInt(v.c_budget_year) + 543) + " " + (parseInt(v.i_type_year) == 1 ? "" : "(เหลื่อมปี)") + "</td>";
                addBody += "<td id='Ext_c_booking[" + index + "]' align='center'></td>";
                addBody += "<td>" + v.dc_expense_group_name + "</td>";
                addBody += "<td>" + v.dc_expense_name + "</td>";
                addBody += "<td align='center'><font color=green>" + v.c_acc_name + "</font></td>";
                addBody += "<td align='center'>" + v.c_approve + "</td>";
                addBody += "<td nowrap align='center' style='color: red;'>" + v.d_pay_show + "</td>";
                addBody += "<td nowrap align='right' style='color: blue;'><b>" + floatRenderer(floatMinus(v.f_inv, 2)) + "</b></td>";
                addBody += "<td nowrap align='right'>" + floatRenderer(floatMinus(v.f_tax_personal, 2)) + "</td>";
                addBody += "<td nowrap align='right'>" + floatRenderer(floatMinus(v.f_tax_corporate, 2)) + "</td>";
                addBody += "<td nowrap align='right'>" + floatRenderer(floatMinus(v.f_social_security, 2)) + "</td>";
                addBody += "<td nowrap align='right'>" + floatRenderer(floatMinus(v.f_fine, 2)) + "</td>";
                addBody += "<td nowrap align='right'>" + floatRenderer(floatMinus(v.f_total, 2)) + "</td>";
                addBody += "<td nowrap align='center'>" + v.c_cheque + "</td>";
                $("#myTableDtl > tbody:last").append("<tr>" + addBody + "</tr>");
                myFunc(index, v);
              });
              Ext.getCmp("win-pop-dtl")
                .getEl()
                .unmask();
            }
          }
        });
      }
    },
    html:
      "<div style='background:#fff; overflow:auto;'>" +
      "<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
      "<table id='myTableDtl' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
      // headder
      "<thead class='x-grid3-header'>" +
      "<tr class='x-grid3-hd-row' height='20'>" +
      "<td>ที่</td>" +
      "<td>ปีงบประมาณ</td>" +
      "<td>เลขที่ใบขอกันเงิน</td>" +
      "<td>หมวดรายจ่าย</td>" +
      "<td>รายจ่ายย่อย</td>" +
      "<td>ผังบัญชี</td>" +
      "<td>เลขที่ฎีกา</td>" +
      "<td>วันที่ดำเนินการจัดทำทะเบียนจ่าย</td>" +
      "<td>จำนวนขอเบิกทั้งสิ้น</td>" +
      "<td>ภาษีเงินได้บุคคลธรรมดา</td>" +
      "<td>ภาษีเงินได้นิติบุคคล</td>" +
      "<td>ค่าประกันสังคม</td>" +
      "<td>ค่าปรับ</td>" +
      "<td>จำนวนเงินที่จ่าย</td>" +
      "<td>เลขที่เช็ค</td>" +
      "</tr>" +
      "</thead>" +
      // body
      "<tbody></tbody>" +
      "</table>" +
      "</form>" +
      "</div>",
    buttonAlign: "left",
    buttons: [
      {
        text: Ext.GLOBAL_BU_SAVE_TH,
        iconCls: "icon-save",
        handler: function() {
          SaveDtl(record.data.id);
        }
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function() {
          Ext.getCmp("win-pop-dtl").destroy();
        }
      }
    ]
  }).show();

  // ============================ myFunc ============================ //
  var myFunc = function(index, v = null) {
    new Ext.form.TextField({
      id: "dtl_imp_expense_dtl_id[" + index + "]",
      hidden: true
    });

    // ลำดับที่
    new Ext.form.TextField({
      id: "dtl_c_booking[" + index + "]",
      width: 70,
      renderTo: "Ext_c_booking[" + index + "]"
    });

    if (v != null) {
      Ext.getCmp("dtl_imp_expense_dtl_id[" + index + "]").setValue(v.id);
      Ext.getCmp("dtl_c_booking[" + index + "]").setValue(v.c_booking);
    }
  }; // myFunc
}; // PopDtlMini
