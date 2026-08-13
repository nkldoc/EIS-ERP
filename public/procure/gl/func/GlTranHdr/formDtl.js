//=================================== รายละเอียดเพิ่มเติม ===================================//
Ext_Show = function(id) {
  $("#Ext_Show").empty();

  Ext.store_tran_dtl_show = new Ext.ux.grid.livegrid.Store({
    url: "api/List_GlTranhdr.php",
    baseParams: { type: "gl_tran_dtl", total_show: true },
    bufferSize: 300,
    reader: reader
  });

  Ext.store_tran_purchase_tax_show = new Ext.ux.grid.livegrid.Store({
    url: "api/List_GlTranhdr.php",
    baseParams: { type: "gl_tran_purchase_tax" },
    bufferSize: 300,
    reader: reader2
  });

  //====================== gridtab1 ====================== //
  var gridtab1 = new Ext.ux.grid.livegrid.GridPanel({
    title: "รายละเอียดสมุดรายวัน",
    id: "gridtab1",
    height: 400,
    stripeRows: true,
    loadMask: true,
    store: Ext.store_tran_dtl_show,
    tbar: [
      {
        text: "แก้ไขข้อมูล",
        id: "btn_dtl",
        iconCls: "icon-add",
        handler: function(grid, rowIndex, colIndex) {
          PopTranDtl(id);
        }
      }
    ],
    view: new Ext.ux.grid.livegrid.GridView({
      nearLimit: 100,
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
      //autoFill: true, // ย่อ columns
      //scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
      loadMask: { msg: "Buffering. Please wait..." }
    }),
    selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
    columns: [
      { header: "ที่", dataIndex: "i_rank", width: 40, sortable: true },
      { header: "ผังบัญชี", dataIndex: "dc_acc_name", width: 250, sortable: true },
      { header: "ปีงบประมาณ", dataIndex: "c_year", width: 100, align: "center", sortable: true },
      { header: "แหล่งเงิน", dataIndex: "dc_expense_budget_type_name", width: 200, sortable: true },
      {
        header: "ศูนย์ต้นทุนทางบัญชี",
        dataIndex: "dc_cost_acc_name",
        width: 250,
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.total_type) {
            metaData.attr = "style='text-align:right';";
            return "<b>รวม</b>";
          } else {
            return value;
          }
        }
      },
      {
        header: "เดบิต",
        dataIndex: "f_dr",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:right';";
          if (record.data.total_type) {
            return "<b>" + floatRenderer(value) + "</b>";
          } else {
            return floatRenderer(value);
          }
        }
      },
      {
        header: "เครดิต",
        dataIndex: "f_cr",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:right';";
          if (record.data.total_type) {
            return "<b>" + floatRenderer(value) + "</b>";
          } else {
            return floatRenderer(value);
          }
        }
      },
      {
        header: "(รายละเอียด เครดิต)",
        dataIndex: "i_return",
        sortable: false,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:center';";
          if (value == 1) {
            return "หักส่งคืน";
          } else if (value == 2) {
            return "ปรับปรุง";
          } else {
            return "ไม่ระบุ";
          }
        }
      },
      {
        header: "บวกกลับ",
        dataIndex: "i_is_nontax_exp",
        sortable: false,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:center';";
          if (value == 1) {
            return "เป็นรายการบวกกลับ";
          } else if (value == 2) {
            return "ไม่เป็นรายการบวกกลับ";
          }
        }
      },
      { header: "รายการรายได้", dataIndex: "dc_product_name", width: 150, sortable: true },
      { header: "ประเภทเจ้าหนี้", dataIndex: "i_type_person_name", width: 150, sortable: true },
      {
        header: "ชื่อลูกหนี้/เจ้าหนี้",
        dataIndex: "i_type_person",
        width: 150,
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (value == PERSON_TYPE_DEBTOR) {
            // ลูกหนี้
            return record.data.dc_debtor_name;
          } else if (value == PERSON_TYPE_CREDITOR) {
            // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
            return record.data.dc_creditor_name;
          } else if (value == PERSON_TYPE_EMPLOYEE) {
            // เจ้าหนี้พนักงาน
            return record.data.dc_emp_name;
          } else if (value == PERSON_TYPE_OTHER) {
            // เจ้าหนี้ทั่วไป
            return record.data.c_other_name;
          } else {
            return "";
          }
        }
      }
    ]
    //			autoExpandColumn: "dc_acc_name"
  }); // gridtab1

  //============================= gridtab2 ============================= //
  var gridtab2 = new Ext.ux.grid.livegrid.GridPanel({
    title: "รายละเอียดภาษีซื้อ",
    id: "gridtab2",
    height: 400,
    stripeRows: true,
    loadMask: true,
    store: Ext.store_tran_purchase_tax_show,
    tbar: [
      {
        text: "แก้ไขข้อมูล",
        id: "btn_tax",
        iconCls: "icon-add",
        handler: function(grid, rowIndex, colIndex) {
          PopTranPurchaseTax(Ext.getCmp("id").getValue());
        }
      }
    ],
    view: new Ext.ux.grid.livegrid.GridView({
      nearLimit: 100,
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
      //autoFill: true, // ย่อ columns
      //scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
      loadMask: {
        msg: "Buffering. Please wait..."
      }
    }),
    selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
    columns: [
      { header: "ศูนย์ต้นทุนทางบัญชี", dataIndex: "dc_cost_acc_name", sortable: true },
      { header: "วันที่", dataIndex: "d_vat", sortable: true, renderer: shortThaiDate },
      { header: "เลขที่/เล่มที่", dataIndex: "c_doc", sortable: true },
      {
        header: "นำส่งเดือน",
        dataIndex: "c_mm",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (value != "") {
            var ss = Ext.store_month.findExact("id", value);
            var value = Ext.store_month.data.items[ss].data.c_name;
            return value;
          } else {
            return "";
          }
        }
      },
      {
        header: "นำส่งปี",
        dataIndex: "c_yyyy",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (value != "") {
            var ss = Ext.store_year.findExact("id", parseInt(value));
            var value = Ext.store_year.data.items[ss].data.c_name;
            return value;
          } else {
            return "";
          }
        }
      },
      { header: "ชื่อผู้ขาย", dataIndex: "c_vendor", sortable: true },
      { header: "เลขที่ประจำตัวผู้เสียภาษีฯ<br>ของผู้ขายสินค้า", dataIndex: "c_tax", sortable: true },
      {
        header: "สถานประกอบการ",
        dataIndex: "i_branch",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (value == 1) {
            return "สาขาที่";
          } else if (value == 2) {
            return "สำนักงานใหญ่";
          } else if (value == 3) {
            return "อื่นๆ";
          } else {
            return "";
          }
        }
      },
      { header: "เลขที่สาขา", dataIndex: "c_branch", sortable: true },
      {
        header: "มูลค่าสินค้า/บริการ",
        dataIndex: "f_price",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:right;'";
          return floatRenderer(value);
        }
      },
      {
        header: "จำนวนเงินภาษี",
        dataIndex: "f_vat",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:right;'";
          return floatRenderer(value);
        }
      },
      {
        header: "ยื่น",
        dataIndex: "i_more",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (value == 1) {
            return "ยื่น";
          } else {
            return "ไม่ยื่น";
          }
        }
      },
      {
        header: "เดือน",
        dataIndex: "c_mm_more",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (value != "") {
            var ss = Ext.store_month.findExact("id", value);
            var value = Ext.store_month.data.items[ss].data.c_name;
            return value;
          } else {
            return "";
          }
        }
      },
      {
        header: "ปี",
        dataIndex: "c_yyyy_more",
        sortable: true,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (value != "") {
            var ss = Ext.store_year.findExact("id", parseInt(value));
            var value = Ext.store_year.data.items[ss].data.c_name;
            return value;
          } else {
            return "";
          }
        }
      }
    ]
    //			autoExpandColumn: "dc_cost_acc_name"
  }); // gridtab2

  // แสดง FROM PANEL ทั้งหมด
  new Ext.FormPanel({
    id: "panel_show",
    border: false,
    style: { padding: "10px 0px 0px 0px" },
    items: [
      new Ext.TabPanel({
        autoHeight: true,
        defaults: { autoScroll: true },
        activeTab: 0, //default Tab
        items: [gridtab1, gridtab2],
        listeners: {
          tabchange: function(panel, tab) {
            if (tab.id == "gridtab1") {
              Ext.store_tran_dtl_show.setBaseParam("id", id);
              Ext.store_tran_dtl_show.load();
            } else if (tab.id == "gridtab2") {
              Ext.store_tran_purchase_tax_show.setBaseParam("id", id);
              Ext.store_tran_purchase_tax_show.load();
            }
          }
        }
      })
    ],
    buttonAlign: "center",
    buttons: [
      {
        text: Ext.GLOBAL_BU_PRINT_TH,
        iconCls: "icon-magnifier",
        handler: function(grid, rowIndex, colIndex) {
          Ext.getCmp("contenterCenter")
            .getEl()
            .mask("Please wait...", "x-mask-loading");
          $.ajax({
            url: "api/List_GlTranhdr.php",
            type: "POST",
            data: {
              type: "print_hdr",
              id: Ext.getCmp("id").getValue()
            },
            success: function(result) {
              var obj = $.parseJSON(result);
              if (obj.debug == true) {
                if (obj.i_preview == 1) {
                  Preview(id);
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", "กรุณาบันทึกรายการก่อน");
                }
              }
              Ext.getCmp("contenterCenter")
                .getEl()
                .unmask();
            }
          });
        }
      },
      {
        text: "&nbsp;บันทึกออกเลข&nbsp;",
        id: "btn_gen",
        iconCls: "icon-save",
        handler: function(grid, rowIndex, colIndex) {
          saveHdr("GEN_CODE");
        }
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function() {
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
        }
      }
    ],
    renderTo: "Ext_Show"
  });
}; // Ext_Show
