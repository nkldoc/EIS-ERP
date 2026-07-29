Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "  <font color=red>*(แก้ไขเงิน)</font>";
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });
  Ext.date_now = new Date().toLocaleDateString("en-CA");
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
  }
  const approve = function (record){
    Ext.store.load({
      callback: function (_records, _operation, _success) {
        // Ext.pagingBar.changePage(num_page);
        console.log(record.data);
        // console.log(Ext.select_row);
    let msg = "";
    var rec =  record.data ;
    if (msg == "") {
      var win = new Ext.Window({
        id: "MessageBox_bg",
        title: "ยันยืนผ่านรายการ ",
        modal: true,
        width: 300,
        // height: 150,
        items: [
          {
            xtype: "form",
            id: "form-widgets2",
            frame: true,
            labelAlign: "right",
            labelWidth: 0.1,
            bodyStyle: { padding: "10px 20px" },
            defaults: { anchor: "100%", msgTarget: "side" },
            items: [
              {
                xtype: "displayfield",
                id: "displaytextbg",
                width: 200,
                value: "ต้องการผ่านรายการ",
                style: "text-align: center; color:red; white-space: nowrap;",
              },
              // {
              //   xtype: "textfield",
              //   enableKeyEvents: true,
              //   id: "confirm_text",
              //   width: 200,
              //   value: "",
              //   style: "text-align: center;",
              //   emptyText: 'กรุณากรอก "ยืนยัน" เพื่อลบรายการ',
              //   listeners: {
              //     keyup: function () {
              //       if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
              //         // Ext.getCmp("Save_edit_bg").setDisabled(false);
              //       } else {
              //         // Ext.getCmp("Save_edit_bg").setDisabled(true);
              //       }
              //     },
              //   },
              // },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "บันทึกรายการ",
            id: "Save_edit_bg",
            iconCls: "icon-save",
            // disabled: true,
            handler: function () {
              // เก็บ log_bg
              Ext.Ajax.request({  
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                  mode: "next_bg",
                  id: rec.id,
                  i_step_bg : 2 ,
                  // dc_expense_budget_type_edit_id1 : Ext.getCmp("dc_expense_budget_type_edit_id1").getValue(),
                  // dc_expense_budget_type_edit_id2 : Ext.getCmp("dc_expense_budget_type_edit_id2").getValue(),
                  // dc_expense_budget_type_edit_id3 : Ext.getCmp("dc_expense_budget_type_edit_id3").getValue(), 
                  // po_expense_id1 : Ext.getCmp("po_expense_edit_id1").getValue(), 
                  // po_expense_id2 : Ext.getCmp("po_expense_edit_id2").getValue(), 
                  // po_expense_id3 : Ext.getCmp("po_expense_edit_id3").getValue(), 
                  // f_total_amt1  : Ext.getCmp("f_total_amt_edit1").getValue(), 
                  // f_total_amt2  : Ext.getCmp("f_total_amt_edit2").getValue(), 
                  // f_total_amt3  : Ext.getCmp("f_total_amt_edit3").getValue(), 
                  // bg_reserve_money_id1 : rec.bg_reserve_money1, 
                  // bg_reserve_money_id2 : rec.bg_reserve_money2, 
                  // bg_reserve_money_id3 : rec.bg_reserve_money3,
                  // i_pr_type1 : rec.i_pr_type1, 
                  // i_pr_type2 : rec.i_pr_type2, 
                  // i_pr_type3 : rec.i_pr_type3, 
                  // i_edit: 2,
                  // i_status: 2,
                  // i_amount_bg: Ext.getCmp("i_amount_edit_bgID").getValue().inputValue,
                },
                success: function (result, request) { 
                  Ext.getCmp("MessageBox_bg").hide();
                  Ext.getCmp("MessageBox_bg").destroy();
                  Ext.store.load({
                    params: { id: id },
                    callback: function (records, operation, success) {},
                  });
                },
                failure: function (result, request) {
                    setDisabled_button(i, 1);
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                  },
                 }); // เก็บ log 
            },
          },
          { xtype: "tbfill" },
          {
            text: "ย้อนกลับ",
            handler: function () {
              Ext.getCmp("MessageBox_bg").hide();
              Ext.getCmp("MessageBox_bg").destroy();
            },
          },
        ],
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  },
});
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
    // Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      Ext.contract_id = record.data.sp_tor_contract_id;
      Ext.select_row = record.data;
      console.log(Ext.select_row);
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);
      // Ext.storeDtl
      Ext.getCmp("f_total").fn();
 
      // ============ PanelDtl ============ //  
      // let PanelDtl = new formPanelDtl();
      // Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.storeDtl.load({
        params: { id: Ext.HDR_ID , sp_tor_contract : Ext.contract_id },
        callback: function () {
          // var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
          // var row = 0;
          // while (num >= row) {
          //   var record = Ext.storeDtl.getAt(row);
          //   record.set("i_checked_primary", 0);
          //   record.set("i_checked", 0);
          //   record.commit();
          //   row++;
          // }
          // Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
          // Ext.getCmp("gridEditor").getColumnModel().setHidden(2, true);
        },
      });

      if (record.data.c_booking != null) {
        Ext.bg_budget_overlap.load({
          params: { c_booking: record.data.c_booking },
          callback: function (records, operation, success) {
            var record_overlap = Ext.bg_budget_overlap.getAt(0);
            Ext.getCmp("dis_bg_budget_dtl_overlap_id").setValue(record_overlap.get("bg_budget_dtl_overlap_id"));
            Ext.getCmp("dis_i_year").setValue(record_overlap.get("i_year") - 0 + 543);
            Ext.getCmp("dis_c_code_ref").setValue(record_overlap.get("c_code_ref"));
            // dc_expense_budget_type_id
            document.getElementById(Ext.getCmp("dis_dc_expense_budget_type_name").label.id).innerHTML = "แหล่งเงิน : " + record_overlap.get("dc_expense_budget_type_id1") + " : ";
            Ext.getCmp("dis_dc_expense_budget_type_name").setValue(record_overlap.get("dc_expense_budget_type_name"));

            document.getElementById(Ext.getCmp("dis_bg_expense_name").label.id).innerHTML = "รายการย่อย : " + record_overlap.get("po_expense_id") + " : ";
            Ext.getCmp("dis_bg_expense_name").setValue(record_overlap.get("bg_expense_name"));

            document.getElementById(Ext.getCmp("dis_dc_cost_name").label.id).innerHTML = "หน่วยงาน : " + record_overlap.get("dc_cost_id") + " : ";
            Ext.getCmp("dis_dc_cost_name").setValue(record_overlap.get("dc_cost_name"));

            Ext.getCmp("dis_c_creditor").setValue(record_overlap.get("c_creditor"));
            Ext.getCmp("dis_i_extend_time").setValue(record_overlap.get("i_extend_time"));
            Ext.getCmp("dis_d_end_date").setValue(record_overlap.get("d_end_date"));
            Ext.getCmp("dis_f_overlap").setValue(floatRenderer(floatMinus(record_overlap.get("f_overlap").replace(/,/g, ""), 2)));
            Ext.getCmp("dis_f_cancel").setValue(floatRenderer(floatMinus(record_overlap.get("f_cancel").replace(/,/g, ""), 2)));
            Ext.getCmp("dis_f_reserve").setValue(floatRenderer(floatMinus(record_overlap.get("f_reserve").replace(/,/g, ""), 2)));
            Ext.getCmp("dis_f_working").setValue(floatRenderer(floatMinus(record_overlap.get("f_working").replace(/,/g, ""), 2)));
            Ext.getCmp("dis_f_total").setValue(floatRenderer(floatMinus(record_overlap.get("f_total").replace(/,/g, ""), 2)));
          },
        });
      }
      if (record.data.c_booking == null && (record.data.i_sav_by_sys == 5 || Ext.select_row.i_sav_by_sys == 4)) {
        Ext.bg_reserve_money.load({
          params: {
            id: Ext.HDR_ID,
            i_overlap: record.data.i_budget_year == record.data.i_budget_year_overlap ? 1 : 2,
          },
          callback: function (records, operation, success) {
            var record_reserve = Ext.bg_reserve_money.getAt(0);

            document.getElementById(Ext.getCmp("dis_re_dc_expense_budget_type_name").label.id).innerHTML = "แหล่งเงิน : " + record_reserve.get("dc_expense_budget_type_id1") + " : ";
            Ext.getCmp("dis_re_dc_expense_budget_type_name").setValue(record_reserve.get("dc_expense_budget_type_name"));

            document.getElementById(Ext.getCmp("dis_re_bg_expense_name").label.id).innerHTML = "รายการย่อย : " + record_reserve.get("po_expense_id") + " : ";
            Ext.getCmp("dis_re_bg_expense_name").setValue(record_reserve.get("bg_expense_name"));

            document.getElementById(Ext.getCmp("dis_re_dc_cost_name").label.id).innerHTML = "หน่วยงาน : " + record_reserve.get("dc_cost_id") + " : ";
            Ext.getCmp("dis_re_dc_cost_name").setValue(record_reserve.get("dc_cost_name"));

            Ext.getCmp("dis_re_pr_id").setValue(record_reserve.get("pr_id"));
            Ext.getCmp("dis_re_po_id").setValue(record_reserve.get("po_id"));
            Ext.getCmp("dis_re_chk_id").setValue(record_reserve.get("chk_id"));
            Ext.getCmp("dis_re_sys_name").setValue(record_reserve.get("sys_name"));
            Ext.getCmp("dis_re_dc_cost_name").setValue(record_reserve.get("dc_cost_name"));
            Ext.getCmp("dis_re_dc_expense_budget_type_name").setValue(record_reserve.get("dc_expense_budget_type_name"));
            Ext.getCmp("dis_re_bg_expense_name").setValue(record_reserve.get("bg_expense_name"));
            Ext.getCmp("dis_re_f_amt").setValue(floatRenderer(floatMinus(record_reserve.get("f_amt").replace(/,/g, ""), 2)));
          },
        });
      }

      // creditor_taxdata_load(Ext.select_row.dc_creditor_po_id);
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      // if()
      console.log(record.data.c_comment_edit1);
      Ext.MessageBox.alert("แจ้งเตือน-", record.data.c_comment_edit1); // alert massage error

      controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    } else if (columnIndex == grid.getColumnModel().getIndexById("approve")) {
      approve(record)
    }
  }; //cellClick

  rowContextmenu = function (grid, rowIndex, e) {
    e.stopEvent();
    grid.getSelectionModel().selectRow(rowIndex);
    var record = grid.store.getAt(rowIndex);
    if (record) {
      new Ext.menu.Menu({
        items: [
          // {
          //   text: "SQL",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 1);
          //   },
          // },
          // {
          //   text: "SQL",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 1);
          //   },
          // },
          // {
          //   text: "HDR_SQL",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 2);
          //   },
          // },
          // {
          //   text: "DTL_SQL",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 3);
          //   },
          // },
          // {
          //   text: "ITEM_SQL",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 4);
          //   },
          // },
          // {
          //   text: "SQL (จองเงิน)",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 5);
          //   },
          // },
          // {
          //   text: "SQL (จัดซื้อ)",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.id, 6);
          //   },
          // },
          // {
          //   text: "SQL (บัญชี)",
          //   icon: "../images/icons/layout_edit.png",
          //   scope: this,
          //   handler: function (e) {
          //     Sql_copy(record.data.c_code_ref, 7);
          //   },
          // },
        ],
      }).showAt(e.getXY());
    }
  }; //rowContextmenu

  Sql_copy = function (id, i_type) {
    // var id = Ext.store.getAt(index).get("id");

    var text = "";
    if (i_type == 1) {
      text = "select * from po_working_hdr where po_working_hdr_id = " + id + "\nselect * from po_working_dtl where po_working_hdr_id = " + id + "\nselect * from po_working_item where po_working_hdr_id = " + id + "\n";
    } else if (i_type == 2) {
      text = "select * from po_working_hdr where po_working_hdr_id = " + id;
    } else if (i_type == 3) {
      text = "select * from po_working_dlt where po_working_hdr_id = " + id;
    } else if (i_type == 4) {
      text = "select * from po_working_item where po_working_hdr_id = " + id;
    } else if (i_type == 5) {
      text = "select * from bg_reserve_money where chk_id = \n";
      text += "\t(select sp_check_period_hdr_id from NMU_ERP..sp_withdraw where c_code_ref =\n";
      text += "\t\t(select case when isnull(parent_id,0) > 0 then (select c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = a.parent_id) else c_code_ref end as c_code_ref from po_working_hdr a\n";
      text += "\t\twhere a.po_working_hdr_id = " + id + "))\n";
    } else if (i_type == 6) {
      text = "select * from NMU_ERP..sp_tor where tor_id =\n";
      text += "\t(select sp_tor_id from nmu_erp..sp_tor_contract where sp_tor_contract_id =\n";
      text += "\t(select sp_tor_contract_id from nmu_erp..sp_check_period_hdr where sp_check_period_hdr_id =\n";
      text += "\t(select sp_check_period_hdr_id from NMU_ERP..sp_withdraw where c_code_ref =\n";
      text += "\t(select case when isnull(parent_id,0) > 0 then (select c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = a.parent_id) else c_code_ref end as c_code_ref from po_working_hdr a\n";
      text += "\twhere a.po_working_hdr_id = " + id + "))))\n\n";

      text += "select * from nmu_erp..sp_tor_contract where sp_tor_contract_id =\n";
      text += "\t(select sp_tor_contract_id from nmu_erp..sp_check_period_hdr where sp_check_period_hdr_id =\n";
      text += "\t(select sp_check_period_hdr_id from NMU_ERP..sp_withdraw where c_code_ref =\n";
      text += "\t(select case when isnull(parent_id,0) > 0 then (select c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = a.parent_id) else c_code_ref end as c_code_ref from po_working_hdr a\n";
      text += "\twhere a.po_working_hdr_id = " + id + ")))\n\n";

      text += "select * from nmu_erp..sp_check_period_hdr where sp_check_period_hdr_id =\n";
      text += "\t(select sp_check_period_hdr_id from NMU_ERP..sp_withdraw where c_code_ref =\n";
      text += "\t(select case when isnull(parent_id,0) > 0 then (select c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = a.parent_id) else c_code_ref end as c_code_ref from po_working_hdr a\n";
      text += "\twhere a.po_working_hdr_id = " + id + "))\n\n";

      text += "select * from NMU_ERP..sp_withdraw where c_code_ref =\n";
      text += "\t(select case when isnull(parent_id,0) > 0 then (select c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = a.parent_id) else c_code_ref end as c_code_ref from po_working_hdr a\n";
      text += "\twhere a.po_working_hdr_id = " + id + ")\n\n";
    } else if (i_type == 7) {
      text = "select\n";
      text += "\tREPLACE(SUBSTRING(b.c_request_desc, CHARINDEX(':', b.c_request_desc) +1, 20 ),' ','') as c_request_desc\n";
      text += "\t,po_h.c_code_ref\n";
      text += "\t,c.dc_acc_id\n";
      text += "\t,po.bg_expense_id\n";
      text += "\t,(select top 1 aa.c_code + ' : ' + aa.c_name from dc_acc aa where aa.dc_acc_id = c.dc_acc_id) dc_acc_name\n";
      text += "\t,(select top 1 aa.c_code + ' : ' + aa.c_name from bg_expense aa where aa.bg_expense_id = po.bg_expense_id) bg_expense_name\n";
      text += "\t,c.f_cr\n";
      text += "\t,c.f_dr\n";
      text += "\t,a.dc_expense_budget_type_id as dc_expense_budget_type_id_1\n";
      text += "\t,po.dc_expense_budget_type_id as dc_expense_budget_type_id_2\n";
      text += "\t,d.c_name as dc_expense_budget_type_name_1\n";
      text += "\t,(select c_name from dc_expense_budget_type aa  where po.dc_expense_budget_type_id = aa.dc_expense_budget_type_id) as dc_expense_budget_type_name_2\n";
      text += "\t,po.i_budget_year\n";
      text += "\t,po.i_budget_year_overlap\n";
      text += "\t,po.po_working_hdr_id\n";
      text += "from imp_request_vsn_hdr a\n";
      text += "inner join imp_request_vsn_dtl b on a.imp_request_vsn_hdr_id = b.imp_request_vsn_hdr_id\n";
      text += "inner join imp_request_vsn_item c on c.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id\n";
      text += "left join dc_expense_budget_type d on a.dc_expense_budget_type_id = d.dc_expense_budget_type_id\n";
      text += "left join po_working_dtl po on REPLACE(po.c_code,' ','') = REPLACE(SUBSTRING(b.c_request_desc, CHARINDEX(':', b.c_request_desc) +1, 20 ),' ','')\n";
      text += "inner join po_working_hdr po_h on po_h.po_working_hdr_id = po.po_working_hdr_id\n";
      text += "where 1=1\n";
      text += "\t--and a.dc_expense_budget_type_id != (case when po.dc_expense_budget_type_id = 2 then 9 else po.dc_expense_budget_type_id end)\n";
      text += "\t--and c.f_cr < 1\n";
      text += "\tand po_h.c_code_ref = '" + id + "'\n";
      text += "order by po.i_budget_year,d.c_name\n";
    }

    copyToClipboard(text);
    Ext.example.msg("Copied to Clipboard.&nbsp;", "- คัดลอกไปยังคลิปบอร์ดสำเร็จ", 1);
    $(this).next("text copied");
    setTimeout(function () {
      $(this).next().remove();
    }, 2000);
  };

  // creditor_taxdata_load = function (dc_creditor_id) {
  //   Ext.creditor_taxdata.load({
  //     params: { dc_creditor_id: dc_creditor_id },
  //     callback: function (recordx, operation, success) {
  //       var data = Ext.creditor_taxdata.getAt(0).data;
  //       var title_district = data.tax_c_province == "กรุงเทพมหานคร" ? "เขต" : "อำเภอ";
  //       var title_tambon = data.tax_c_province == "กรุงเทพมหานคร" ? "แขวง" : "ตำบล";
  //       var text_tax = "เลขประจำตัวผู้เสียภาษี: " + data.c_tax_number_imp + "\n";
  //       text_tax += "ประเภทกิจการทางภาษี: " + data.c_name_tax_customer + " : " + data.c_name_tax_income + "\n";
  //       text_tax += "ชื่อ: " + data.tax_c_title + data.tax_c_name + (data.tax_c_middle_name ? " " + data.tax_c_middle_name : "") + (data.tax_c_last_name ? " " + data.tax_c_last_name : "") + "\n";
  //       text_tax += data.tax_c_branch ? "สาขา: " + data.tax_c_branch + "\n" : "";
  //       text_tax += "ที่อยู่: " + (data.tax_c_bldg ? "อาคาร " + data.tax_c_bldg + " " : "") + (data.tax_c_room_no ? "ห้อง " + data.tax_c_room_no + " " : "") + (data.tax_c_floor ? "ชั้น " + data.tax_c_floor + " " : "") + (data.tax_c_village ? "หมู่บ้าน " + data.tax_c_village + " " : "") + "\n";
  //       text_tax += "        " + (data.tax_c_house_no ? "เลขที่ " + data.tax_c_house_no + " " : "") + (data.tax_c_village_no ? "หมู่ที่ " + data.tax_c_village_no + " " : "") + (data.tax_c_lane ? "ซอย" + data.tax_c_lane + " " : "") + (data.tax_c_road ? "ถนน" + data.tax_c_road + " " : "") + "\n";
  //       text_tax += "        " + (data.tax_c_tambon ? title_tambon + data.tax_c_tambon + " " : "") + (data.tax_c_district ? title_district + data.tax_c_district + " " : "") + (data.tax_c_province ? "จังหวัด" + data.tax_c_province + " " : "") + data.tax_c_post_code + "\n";
  //       text_tax += "เบอร์โทรศัพท์: " + data.c_tele_imp + "\n";
  //       text_tax += "อีเมล: " + data.c_email;
  //       Ext.getCmp("textarea_tax").setValue(text_tax);

  //       var msg = "";
  //       if (["", null, undefined].includes(data.c_name_tax_customer)) {
  //         msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
  //       }
  //       if (data.c_name_tax_income != "") {
  //         if (["", null, undefined].includes(data.c_tax_number_imp)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_title)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ คำนำหน้า</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_name)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก ชื่อ</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_house_no)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขที่</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_province)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ จังหวัด</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_district)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ เขต/อำเภอ</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_tambon)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ แขวง/ตำบล</span><br>";
  //         }
  //         if (["", null, undefined].includes(data.tax_c_post_code)) {
  //           msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ รหัสไปรษณีย์</span><br>";
  //         }
  //       }
  //       Ext.tax_msg = msg == "" ? "" : "<span style='white-space: nowrap;'>- ข้อมูลทางภาษีไม่ครบถ้วน</span><br>" + msg;
  //     },
  //   });
  // };

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
      Ext.store.setBaseParam("dc_expense_budget_type_id1", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      // Ext.store.setBaseParam("dc_cost_id", Ext.getCmp("s_dc_cost_id").getValue());
      Ext.store.setBaseParam("i_status", Ext.getCmp("s_i_status").getValue());

      Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
      Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
      Ext.store.setBaseParam("i_booking", Ext.getCmp("s_i_booking").getValue() ? "1" : "0");
      Ext.store.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());
      Ext.store.setBaseParam("i_sav_by_sys", Ext.getCmp("s_i_sav_by_sys").getValue());
      Ext.store.setBaseParam("i_pdf", Ext.getCmp("i_pdf").getValue() ? "1" : "0");
      Ext.store.setBaseParam("checkbox_c_code_po", Ext.getCmp("s_checkbox_c_code_po").getValue() ? "1" : "0");

      Ext.store.setBaseParam("checkbox_date", Ext.getCmp("checkbox_date").getValue() ? 1 : 0);
      Ext.store.setBaseParam("date_start", Ext.util.Format.date(Ext.getCmp("date_start").getValue(), "Y-m-d"));
      Ext.store.setBaseParam("date_end", Ext.util.Format.date(Ext.getCmp("date_end").getValue(), "Y-m-d"));
      Ext.store.load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "รายการ PR" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: true,
      getRowClass: function (record, index, rowParams) {
        if (record.data.dc_approve_id == null) {
          return "td-wait_approve";
        }
        if (record.data.i_status_last >= 11) {
          return "td-select";
        }
        if (record.data.i_enable != 1) {
          return "td-delete";
        }
        if (record.data.i_enabled== 2) {
          return 'disabled-row';
      }
      },
    },
    tbar: [
      {
        xtype: "buttongroup",
        // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
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
                width: 150,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    // ["sql", "SQL"],
                    // ["tor_id", "hdr_id"],
                    // ["sp_tor_contract_id", "sp_tor_contract_id"],
                    ["c_code_po", "เลขสัญญา"],
                    ["c_code", "เลขที่ PR"],
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
                width: 200,
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
                width: 356,
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
            frame: false,
            items: [
              { xtype: "label", text: "หน่วยงาน : " },
              { xtype: "tbspacer", width: 4 },
              // new Ext.form.ComboBox({
              //   id: "s_dc_cost_id",
              //   mode: "local",
              //   store: Ext.dc_cost_all,
              //   valueField: "id",
              //   displayField: "c_name",
              //   triggerAction: "all",
              //   forceSelection: true,
              //   selectOnFocus: true,
              //   typeAhead: false,
              //   emptyText: "กรุณาเลือก...",
              //   width: 210,
              //   value: "0",
              //   listeners: {
              //     afterrender: function () {
              //       this.fn = function () {};
              //     },
              //     change: function (combo, newValue) {
              //       if (newValue == "") {
              //         combo.reset();
              //       }
              //     },
              //     beforequery: function (q) {
              //       if (q.query) {
              //         var length = q.query.length;
              //         q.query = new RegExp(Ext.escapeRe(q.query));
              //         q.query.length = length;
              //       }
              //     },
              //     blur: function () {
              //       this.getStore().clearFilter();
              //     },
              //   },
              // }),
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_status",
                xtype: "combo",
                width: 100,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "ทั้งหมด"],
                    ["1", "1 - จัดทำใบขอเบิก"],
                    ["2", "2 - ส่งใบเบิก"],
                    ["3", "3 - ทักท้วง"],
                    ["4", "4 - อนุมัติฏีกา"],
                    ["5", "5 - หัวหน้าฝ่ายการคลังลงนาม"],
                    ["6", "6 - ผู้บริหารลงนาม"],
                    ["7", "7 - ผู้บริหารลงนาม"],
                    ["8", "8 - จัดทำเช็ค"],
                    ["9", "9 - หัวหน้าฝ่ายการคลังลงนามเช็ค"],
                    ["10", "10 - ผู้บริหารลงนามเช็ค"],
                    ["11", "11 - ทำทะเบียนจ่าย"],
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
        ],
        buttonAlign: "left",
        buttons: [
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
     /* {
        xtype: "buttongroup",
        // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_i_budget_year",
                mode: "local",
                store: Ext.store_year,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 284,
                value: Ext.bgYear,
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
              // { xtype: "label", text: "ปีที่ใช้งบประมาณ : " },
              // { xtype: "tbspacer", width: 4 },
              // new Ext.form.ComboBox({
              //   id: "s_i_budget_year_overlap",
              //   mode: "local",
              //   store: Ext.store_year,
              //   valueField: "id",
              //   displayField: "c_name",
              //   triggerAction: "all",
              //   forceSelection: true,
              //   selectOnFocus: true,
              //   typeAhead: false,
              //   emptyText: "กรุณาเลือก...",
              //   width: 284,
              //   value: "0",
              //   listeners: {
              //     afterrender: function () {
              //       this.fn = function () {};
              //     },
              //     change: function (combo, newValue) {
              //       if (newValue == "") {
              //         combo.reset();
              //       }
              //     },
              //     beforequery: function (q) {
              //       if (q.query) {
              //         var length = q.query.length;
              //         q.query = new RegExp(Ext.escapeRe(q.query));
              //         q.query.length = length;
              //       }
              //     },
              //     blur: function () {
              //       this.getStore().clearFilter();
              //     },
              //   },
              // }),
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "สถานะการบันทึก : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_sav_by_sys",
                xtype: "combo",
                width: 159,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "ทั้งหมด"],
                    ["1", "บันทึกโดยระบบบริหารงานเบิกจ่าย"],
                    ["2", "เพิ่มรายการโดยการยกเลิกใบเบิกเดิม โดยระบบบันทึกผ่านระบบสนับสนุนการบริหารงานเบิกจ่าย"],
                    ["3", "บันทึกใบขอเบิก (หน่วยงาน)"],
                    ["4", "รับคืนทักท้วง (หน่วยงาน)"],
                    ["5", "บันทึกโดยระบบบริหารพัสดุ"],
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
              { xtype: "label", text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_enable",
                xtype: "combo",
                width: 80,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "ทั้งหมด"],
                    ["1", "ใช้งาน"],
                    ["2", "ยกเลิก"],
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
          /*{
            xtype: "buttongroup",
            fieldLabel: "",
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
          },*/
          /*{
            xtype: "buttongroup",
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
                  check: function (combo, newValue) {
                    search();
                  },
                },
              }),
              { xtype: "tbspacer", width: 7 },
              new Ext.form.Checkbox({
                id: "s_i_booking",
                boxLabel: "มีเลขที่ PR",
                inputValue: 1,
                checked: false,
                listeners: {
                  check: function (combo, newValue) {
                    search();
                  },
                },
              }),
              { xtype: "tbspacer", width: 7 },
              new Ext.form.Checkbox({
                id: "i_pdf",
                boxLabel: "ที่มีเอกสาร PDF",
                inputValue: 1,
                checked: false,
                listeners: {
                  check: function (combo, newValue) {
                    search();
                  },
                },
              }),
              { xtype: "tbspacer", width: 0 },
            ],
          },// ปิด
        ],
      },*/
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
                var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #DEDEDE;'>∎</span> ส่งใบเบิก (รอการรับ) </span><br>";
                text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FFEBEB;'>∎</span> รายการยกเลิก</span><br>";
                text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span> ทำทะเบียนจ่าย</span>";
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
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 40,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          // var dot = record.data.d_create == DateNow() ? " <font color=red>●</font>" : "";
          return record.get("no");
        },
      }),
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 70,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
        },
      },
      {
        id: "approve",
        header: "-",
        sortable: false,
        align: "center",
        width: 80,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: blue;'>ผ่านรายการ</button>";
        },
      },
      {
        header: "เอกสาร PR",
        sortable: false,
        width: 105,
        align: "center",
        dataIndex: "pdf_hdr",
        editor: new Ext.form.TextField({}),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
          var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสาร PR</spen>";
          if (record.data.i_is_upload == null) {
            return "-";
          } else if (record.data.i_is_upload == 1) {
            return '<button style="display: flex" onclick="window.open(\'' + linkDownload + record.data.c_code + '.pdf'  + '\')" type="button">' + BtnText + "</button>";
          }
          
        },
      },
      {
        header: "ชื่อรายการ",
        sortable: true,
        // hidden: true,
        align: "left",
        dataIndex: "c_name",
        width: 350,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      {
        header: "เลขที่ PR",
        sortable: false,
        align: "center",
        width: 150,
        dataIndex: "c_code",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: green;"';
          return value;
        },
      },
      // {
      //   header: "เลขที่สัญญา",
      //   sortable: false,
      //   align: "left",
      //   width: 100,
      //   dataIndex: "c_code_po",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     let vv = record.data.i_status_last;
      //     metaData.attr = 'style="font-weight: bold; color: ' + Ext.COLOR_STATUS[vv] + ';"';
      //     return value;        },
      // },
      {
        header: "ประเภท PR",
        sortable: false,
        align: "left",
        width: 200,
        dataIndex: "i_type_bg",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          let vv = record.data.i_status_last;
          metaData.attr = 'style="font-weight: bold; color: ' + Ext.COLOR_STATUS[vv] + ';"';
          return value;        },
      },
      {
        header: "ผู้รับผิดชอบงานPR",
        sortable: true,
        align: "left",
        dataIndex: "sp_emp_pr",
        width: 190,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      }, 
      {
        header: "ผู้รับผิดชอบงานPO",
        sortable: true,
        align: "center",
        dataIndex: "sp_emp_po",
        width: 190,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      }, 
      {
        header: "สถานะ",
        sortable: true,
        // hidden: true,
        align: "left",
        dataIndex: "c_name_status",
        width: 160,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },

      {
        header: "ประเภทกิจการ",
        sortable: true,
        align: "left",
        dataIndex: "c_type_name",
        width: 160,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      // {
      //   header: "วันที่เริ่มสัญญา",
      //   sortable: true,
      //   width: 115,
      //   align: "center",
      //   dataIndex: "d_doc_th",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value;
      //   },
      // },
      // {
      //   header: "วันที่สิ้นสุดสัญญา",
      //   sortable: true,
      //   width: 115,
      //   align: "center",
      //   dataIndex: "d_due_thsss",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value;
      //   },
      // },
      { width: 40, dataIndex: "" },
    ],
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
  Ext.getCmp("tabpanel1").on("rowContextmenu", rowContextmenu, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
  let myComboStores = [Ext.dc_expense_budget_type_all, Ext.dc_expense_budget_type
    , Ext.bg_expense
    , Ext.dc_cost
    , Ext.dc_creditor
    , Ext.sp_emp
    // , Ext.dc_approve
  ];

  chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
