Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "ครุภัณฑ์";
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });
  const DisbledButton = function (t, record) {
    if (t) {
      Ext.getCmp("saveDtl").hide();
      Ext.getCmp("saveHdr").hide();
      Ext.getCmp("add_dtl").hide();
    } else {
      Ext.getCmp("saveHdr").show();
    }
  };

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
      // Ext.getCmp("btn_f_cancel_over").hide();
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      // Ext.imp_assetall_dtl.load({
      //   params: { hdr_id: Ext.HDR_ID },
      // });
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);
      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
      // Ext.getCmp("btn_f_cancel_over").show();
      // Ext.getCmp("saveDtl").hide();
      if (butt == "view") {
        DisbledButton(true, record);
      } else {
        DisbledButton(false, record);
      }
    }
  }; // controllTab

  win_delele_group = function (record) {
    new Ext.Window({
      id: "win-msg-delete",
      title: "Remove",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการลบ ? <br>&nbsp;&nbsp;&nbsp;" + record.get("c_name"),
      buttons: [
        {
          text: "Confirm",
          handler: function () {
            Ext.Ajax.request({
              url: "api/mn_AmAssetGroup.php",
              method: "POST",
              params: {
                mode: "DELETE_GROUP",
                id: record.get("id"),
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                  //Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.load({
                  params: { hdr_id: Ext.HDR_ID },
                });
                // Ext.imp_assetall_dtl.load({
                //   params: { hdr_id: Ext.HDR_ID },
                // });
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
          },
        },
      ],
    }).show();
  };

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete") && record.data.am_asset_count == 0) {
      win_delele_group(record);
    }
  }; //cellClick

  // const search = function () {
  //   var msg = "";
  //   if (msg == "") {
  //     Ext.store.setBaseParam("mode", "SEARCH");
  //     Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
  //     Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
  //     Ext.store.load();
  //   } else {
  //     Ext.Msg.alert("แจ้งเตือน", msg);
  //   }
  // };
  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "เพิ่มกลุ่ม" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
    },
    tbar: [
      {
        text: "เพิ่มข้อมูล",
        id: "buAdd",
        iconCls: "icon-add",
        handler: function (grid, rowIndex, colIndex) {
          // Ext.imp_assetall_dtl.load({
          //   params: { hdr_id: 0 },
          // });
          controllTab({}, "add");
        },
      },
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
        width: 150,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: green;'>เลือกครุภัณฑ์ลงในกลุ่ม</button>";
        },
      },
      {
        header: "ชื่อ",
        sortable: false,
        align: "center",
        width: 300,
        dataIndex: "c_name",
      },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
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
      {
        id: "delete",
        header: "ลบ",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.data.am_asset_count > 0) {
            return "<font color=green>มีการใช้งาน</font>";
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
          }
        },
      },
      { width: 40, dataIndex: "" },
    ],
    //     autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: false },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
  // let myComboStores = [Ext.imp_assetall_dtl];
  // chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
