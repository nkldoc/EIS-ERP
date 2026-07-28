const PrintPreview = function (id) {
  let url = Ext.session.NMU_EIS_HOST + "../po/preview/Pre_Working.php";
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
 const delete_event = function (rec) {
  console.log(rec);
    var win = new Ext.Window({
      id: "win-msg-delete",
      title: "ลบรายการ",
      modal: true,
      resizable: false,
      width: 350,
      height: 150,
      // labelWidth: 400,
      // minWidth: 600,
      // minHeight: 350,
      layout: "form",
      bodyStyle: "padding:3px;",
      items: [
        {
          xtype: "textarea",
          readOnly: true,
          width: 180,
          fieldLabel: "คุณต้องการจะลบข้อมูล",
          name: "event_detail",
          value: rec.data.event_detail,
        },
      ],
      buttons: [
        {
          text: "ตกลง",
          handler: function () {
            Ext.Ajax.request({
              url: "tor/api/mnTorCheckList.php",
              params: {
                mode: "delete_event",
                id : rec.data.id,
                i_enabled: 2,
              },
              method: "GET", //POST
              success: function (result, request) {
                Ext.storeEven.reload();
                Ext.storeDtl.reload();
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