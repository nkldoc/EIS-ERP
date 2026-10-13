const sendData = function () {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  sto.forEach(function (v) {
    if (v.dirty) {
      jsonArr.push({
        id: v.data.id,
        i_status: v.data.i_status,
        d_doc_date: Ext.util.Format.gridDate(v.data.d_doc_date, "Y-m-d"),
        d_receive_date: v.data.i_status == 3 ? Ext.util.Format.gridDate(v.data.d_receive_date, "Y-m-d") : "",
        c_comment: v.data.c_comment,
      });
    }
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorkingAdvanced.php",
      method: "POST",
      params: {
        mode: "SAVE_DTL",
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { id: Ext.HDR_ID } });
        Ext.Msg.alert("แจ้งเตือน", json.msg);
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียดใบขอเบิก",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    // layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      new Ext.grid.EditorGridPanel({
        id: "gridEditor",
        region: "center",
        // layout: "fit",
        height: 400,
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
        },
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            width: 30,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              return record.get("no");
            },
          }),
          {
            header: "สถานะ",
            sortable: false,
            align: "center",
            width: 200,
            dataIndex: "c_status",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: right;"';
              return value;
            },
          },
          {
            header: "วันที่ส่ง",
            sortable: true,
            align: "center",
            dataIndex: "d_doc_date",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
            editor: new Ext.form.DateField(),
          },
          {
            header: "วันที่รับทักท้วง",
            sortable: true,
            align: "center",
            dataIndex: "d_receive_date",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_status == 3) {
                return value != "" ? shortThaiDate(value) : "";
              } else {
                return "-";
              }
            },
            editor: new Ext.form.DateField(),
          },
          {
            id: "c_comment",
            header: "หมายเหตุ",
            sortable: true,
            align: "center",
            dataIndex: "c_comment",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return "<pre>" + value + "</pre>";
            },
            editor: new Ext.form.TextArea(),
          },
          { header: "ผู้ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "dc_user_update_id" },
          {
            header: "วันที่ทำรายการล่าสุด",
            sortable: true,
            align: "center",
            dataIndex: "d_update",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, align: "center", width: 150, dataIndex: "dc_user_update_cost_id" },
          { width: 40, dataIndex: "" },
        ],
        bbar: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              {
                text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                id: "saveCheque",
                iconCls: "icon-save",
                scale: "medium",
                handler: function () {
                  sendData();
                },
              },
            ],
          },
        ],
        autoExpandColumn: "c_comment",
      }),
    ],
  });
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
