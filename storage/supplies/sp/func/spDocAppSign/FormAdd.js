    creditor_taxdata_load = function (dc_creditor_id) {
    if (dc_creditor_id) {
      Ext.creditor_taxdata.load({
        params: { dc_creditor_id: dc_creditor_id },
        callback: function (recordx, operation, success) {
          var data = Ext.creditor_taxdata.getAt(0).data;
          var title_district = data.tax_c_province == "กรุงเทพมหานคร" ? "เขต" : "อำเภอ";
          var title_tambon = data.tax_c_province == "กรุงเทพมหานคร" ? "แขวง" : "ตำบล";
          var text_tax = "เลขประจำตัวผู้เสียภาษี: " + data.c_tax_number_imp + "\n";
          text_tax += "ประเภทกิจการทางภาษี: " + data.c_name_tax_customer + " : " + data.c_name_tax_income + "\n";
          text_tax += "ชื่อ: " + data.tax_c_title + data.tax_c_name + (data.tax_c_middle_name ? " " + data.tax_c_middle_name : "") + (data.tax_c_last_name ? " " + data.tax_c_last_name : "") + "\n";
          text_tax += data.tax_c_branch ? "สาขา: " + data.tax_c_branch + "\n" : "";
          text_tax += "ที่อยู่: " + (data.tax_c_bldg ? "อาคาร " + data.tax_c_bldg + " " : "") + (data.tax_c_room_no ? "ห้อง " + data.tax_c_room_no + " " : "") + (data.tax_c_floor ? "ชั้น " + data.tax_c_floor + " " : "") + (data.tax_c_village ? "หมู่บ้าน " + data.tax_c_village + " " : "") + "\n";
          text_tax += "        " + (data.tax_c_house_no ? "เลขที่ " + data.tax_c_house_no + " " : "") + (data.tax_c_village_no ? "หมู่ที่ " + data.tax_c_village_no + " " : "") + (data.tax_c_lane ? "ซอย" + data.tax_c_lane + " " : "") + (data.tax_c_road ? "ถนน" + data.tax_c_road + " " : "") + "\n";
          text_tax += "        " + (data.tax_c_tambon ? title_tambon + data.tax_c_tambon + " " : "") + (data.tax_c_district ? title_district + data.tax_c_district + " " : "") + (data.tax_c_province ? "จังหวัด" + data.tax_c_province + " " : "") + data.tax_c_post_code + "\n";
          text_tax += "เบอร์โทรศัพท์: " + data.c_tele_imp + "\n";
          text_tax += "อีเมล: " + data.c_email;
          Ext.getCmp("textarea_tax").setValue(text_tax);

          var msg = "";
          if (["", null, undefined].includes(data.c_name_tax_customer)) {
            msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
          }
          if (data.c_name_tax_income != "") {
            if (["", null, undefined].includes(data.c_tax_number_imp)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_title)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ คำนำหน้า</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_name)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก ชื่อ</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_house_no)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขที่</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_province)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ จังหวัด</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_district)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ เขต/อำเภอ</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_tambon)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ แขวง/ตำบล</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_post_code)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ รหัสไปรษณีย์</span><br>";
            }
          }
          Ext.tax_msg = msg == "" ? "" : "<span style='white-space: nowrap;'>- ข้อมูลทางภาษีไม่ครบถ้วน</span><br>" + msg;
        },
      });
    }
  };
  
  formPanelAdd = function (args) { 
  formPanelAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูลใบขอเบิก",
    iconCls: "icon-application-form-add",
    id: "frm-Dtl",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {},
    },
    items: [
      {
        xtype: "form",
        id: "form-Dtl",
        fileUpload: true,
        // disabled: true,
        frame: true,
        labelAlign: "right",
        labelWidth: 150,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side" },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            labelWidth: 180,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                items: [
                  new Ext.form.ComboBox({
                    fieldLabel: "ส่วนงาน",
                    name: "dc_cost_acc_id",
                    mode: "local",
                    store: Ext.dc_cost_sys_main,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 300,
                    readOnly: true,
                  }),
                  new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_cost,
                    allowBlank: false,
                    width: 300,
                    fieldLabel: "หน่วยงาน",
                    valueField: "id",
                    displayField: "c_name",

                    name: "dc_cost_id",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    readOnly: true,
                  }),

                  new Ext.form.ComboBox({
                    fieldLabel: "ประเภทใบขอเบิก",

                    name: "i_working_type",
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        ["1", "F : ค่าใช้จ่าย"],
                        ["2", "D : จัดซื้อ/จัดจ้าง/จัดเช่า"],
                        ["3", "F : เงินเดือน/ค่าจ้าง/ค่าตอบแทน"],
                        ["4", "F : ชดใช้เงินยืม"],
                        ["5", "W : ถอนคืนเงินยืม"],
                        ["6", "A : ใบถอนเงินทดรองจ่าย"],
                        ["7", "BR : สัญญายืม"],
                        ["8", "G : ใบถอนเงินประเภทอื่น"],
                        ["9", "WM : ใบถอนเงินรับฝาก"],
                        ["10", "WT : ใบถอนโอนเงิน"],
                      ],
                    }),
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 150,
                    readOnly: true,
                  }),
                ],
              },
            ],
          },
          {
            layout: "column",
            modal: true,
            border: false,
            items: [
              {
                // column 1
                columnWidth: 0.6,
                layout: "fit",
                border: false,
                items: [
                  {
                    xtype: "container",
                    layout: "hbox",
                    align: "stretch",
                    RemoveHeight: true,
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "ข้อมูลรายการ",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:150px;" },
                        items: [
                          {
                            xtype: "textfield",
                            fieldLabel: "เลขที่อ้างอิง",
                            iconCls: "icon-information",
                            width: 190,
                            name: "c_code_per",
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
                            readOnly: true,
                            enableKeyEvents: true,
                          },
                          {
                            xtype: "textfield",
                            fieldLabel: "เลขที่ใบขอเบิก",
                            iconCls: "icon-information",
                            width: 190,
                            name: "c_code_ref",
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
                            readOnly: true,
                            enableKeyEvents: true,
                          },

                          new Ext.form.ComboBox({
                            mode: "local",

                            fieldLabel: "ปีงบประมาณ",
                            submitValue: true,

                            name: "i_budget_year",
                            store: Ext.store_year,
                            valueField: "id",
                            displayField: "c_name",
                            value: Ext.bgYear,
                            triggerAction: "all",
                            readOnly: true,
                            config: {
                              requireMe: false,
                            },
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            fieldLabel: "ใช้เงินปีงบประมาณ",
                            submitValue: true,
                            name: "i_budget_year_overlap",
                            store: Ext.store_year,
                            valueField: "id",
                            displayField: "c_name",
                            value: Ext.bgYear,
                            readOnly: true,
                            emptyText: "กรุณาเลือกปีงบประมาณ...",
                          }),
                          {
                            xtype: "textfield",
                            fieldLabel: "เลขที่ใบกันเงินเหลื่อปี",
                            iconCls: "icon-information",
                            name: "c_booking",
                            // hidden: Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue() ? false : true,
                            width: 190,
                            readOnly: true,
                            style: {
                              // "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "background-color": "#eee !important",
                              // "text-align": "center",
                            },
                          },
                          {
                            fieldLabel: "ชื่อเรื่อง",
                            xtype: "textfield",
                            name: "c_heading",
                            iconCls: "icon-information",
                            anchor: "90%",
                            readOnly: true,
                            style: {
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "background-color": "#eee !important",
                            },
                          },
                          {
                            fieldLabel: "ชื่อโครงการ",
                            xtype: "textfield",
                            name: "c_title",
                            iconCls: "icon-information",
                            anchor: "90%",
                            readOnly: true,
                            style: {
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "background-color": "#eee !important",
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
                            fieldLabel: "แหล่งเงิน",
                            anchor: "90%",
                            name: "dc_expense_budget_type_id",
                            valueField: "id",
                            displayField: "c_name",
                            readOnly: true,
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.bg_expense_have,
                            valueField: "id",
                            displayField: "c_name",
                            anchor: "90%",
                            name: "bg_expense_id",
                            fieldLabel: "รายการย่อย",
                            readOnly: true,
                          }),
                          { xtype: "container", height: 15 },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.sp_sbill,
                            hidden: Ext.dataSelect.i_working_type == 2 ? false : true,
                            valueField: "id",
                            displayField: "c_contract_code",
                            anchor: "90%",
                            name: "sp_sbill_hdr_id",
                            fieldLabel: "<a href='#' onclick='show_sp_sbill_item(" + Ext.store_frmDtl.getAt(0).data.sp_sbill_hdr_id + ")''>รายการใบแจ้งหนี้</a>",
                            readOnly: true,
                          }),
                          {
                            xtype: "textfield",
                            anchor: "90%",
                            hidden: Ext.dataSelect.i_working_type == 2 ? true : false,
                            fieldLabel: "เลขที่ใบแจ้งหนี้",
                            name: "c_code_invoice",
//                            new Ext.toolbar_btn_menu({
//            id: "btn_menu",
//          }).mini
                            readOnly: true,
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_creditor,
                            anchor: "90%",
                            fieldLabel: "จ่ายให้",
                            valueField: "id",
                            displayField: "c_name",
                            name: "dc_creditor_id",
                            readOnly: true,
                          }),
                          {
                            xtype: "textarea",
                            fieldLabel: "ข้อมูลทางภาษี",
                            anchor: "90%",
                            name: "textarea_tax",
                            id: "textarea_tax",
                            validator: function (val) {
                              return true;
                            },
                            readOnly: true,
                            height: 140,
                            style: {
                              background: "#EEEEEE",
                              color: "#333",
                              border: "1px solid #ADADAD",
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_creditor,
                            anchor: "90%",
                            fieldLabel: "โดยมอบให้",
                            valueField: "id",
                            displayField: "c_name",
                            name: "dc_creditor_transfer_id",
                            readOnly: true,
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_bank_acc_creditor,
                            fieldLabel: "บัญชีธนาคาร",
                            anchor: "90%",
                            submitValue: true,
                            name: "dc_bank_acc_creditor_id",
                            valueField: "id",
                            displayField: "c_name_full",
                            readOnly: true,
                          }),
                          { xtype: "container", height: 8 },
                          new Ext.grid.GridPanel({
                            region: "center",
                            layout: "fit",
                            id: "gridAcc",
                            name: "gridAcc",
                            height: 260,
                            stripeRows: true,
                            loadMask: true,
                            clicksToEdit: 1,
                            store: Ext.po_working_begin_item,
                            viewConfig: {
                              forceFit: true,
                              emptyText: "ไม่มีข้อมูล..",
                              deferEmptyText: false,
                            },
                            listeners: {
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
                              },
                            },
                            tbar: [
                              {
                                xtype: "buttongroup",
                                title: "ข้อมูลการตั้งหนี้",
                                columns: 1,
                                frame: false,
                                defaults: { scale: "small", style: "float: left" },
                                listeners: {
                                  afterrender: function () {
                                    var headerEl = Ext.get(this.header.id);
                                    if (headerEl) headerEl.setStyle("text-align", "left");
                                  },
                                },
                                items: [
                                  {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                      { xtype: "tbspacer", width: 70 },
                                      { xtype: "label", text: "เลขที่ตั้งหนี้ : " },
                                      { xtype: "tbspacer", width: 4 },
                                      {
                                        xtype: "textfield",
                                        width: 120,
                                        name: "c_code_debt",
                                        value: Ext.store_frmDtl.getAt(0).data.c_code_debt,
                                        readOnly: true,
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
                                      { xtype: "tbspacer", width: 9 },
                                      { xtype: "label", text: "วันที่ตั้งหนี้ : " },
                                      { xtype: "tbspacer", width: 4 },
                                      {
                                        xtype: "textfield",
                                        width: 90,
                                        name: "d_debt_date",
                                        value: Ext.store_frmDtl.getAt(0).data.d_debt_date,
                                        readOnly: true,
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
                                    ],
                                  },
                                  { xtype: "container", height: 3 },
                                  {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                      { xtype: "tbspacer", width: 25 },
                                      { xtype: "label", text: "เดือนปีที่เกิดค่าใช่จ่าย : " },
                                      { xtype: "tbspacer", width: 4 },
                                      {
                                        name: "c_debt_month",
                                        xtype: "combo",
                                        width: 175,
                                        mode: "local",
                                        readOnly: true,
                                        store: new Ext.data.SimpleStore({
                                          fields: ["id", "c_name"],
                                          data: [
                                            ["01", "มกราคม (ม.ค.)"],
                                            ["02", "กุมภาพันธ์ (ก.พ.)"],
                                            ["03", "มีนาคม (มี.ค.)"],
                                            ["04", "เมษายน (เม.ย.)"],
                                            ["05", "พฤษภาคม (พ.ค.)"],
                                            ["06", "มิถุนายน (มิ.ย.)"],
                                            ["07", "กรกฎาคม (ก.ค.)"],
                                            ["08", "สิงหาคม (ส.ค.)"],
                                            ["09", "กันยายน (ก.ย.)"],
                                            ["10", "ตุลาคม (ต.ค.)"],
                                            ["11", "พฤศจิกายน (พ.ย.)"],
                                            ["12", "ธันวาคม (ธ.ค.)"],
                                          ],
                                        }),
                                        value: Ext.store_frmDtl.getAt(0).data.c_debt_month,
                                        valueField: "id",
                                        displayField: "c_name",
                                      },
                                      { xtype: "tbspacer", width: 9 },
                                      {
                                        name: "c_debt_year",
                                        xtype: "combo",
                                        width: 90,
                                        mode: "local",
                                        store: Ext.store_year,
                                        valueField: "id",
                                        displayField: "c_name",
                                        value: Ext.store_frmDtl.getAt(0).data.c_debt_year,
                                        readOnly: true,
                                      },
                                      { xtype: "tbspacer", width: 3 },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                      { xtype: "tbspacer", width: 130 },
                                      {
                                        xtype: "label",
                                        text: "*กรณีเกิดค่าใช้จ่ายหลายเดือน ให้ระบุเดือนสุดท้าย",
                                        style: { color: "red" },
                                      },
                                    ],
                                  },
                                  { xtype: "container", height: 4 },
                                ],
                              },
                            ],
                            columns: [
                              new Ext.grid.RowNumberer(),
                              {
                                header: "เดือนเกิดค่าใช้จ่าย",
                                sortable: false,
                                width: 50,
                                align: "center",
                                dataIndex: "c_month",
                                editor: new Ext.form.ComboBox({
                                  mode: "local",
                                  id: "editor_c_month",
                                  store: new Ext.data.SimpleStore({
                                    fields: ["id", "c_name"],
                                    data: [
                                      ["01", "มกราคม (ม.ค.)"],
                                      ["02", "กุมภาพันธ์ (ก.พ.)"],
                                      ["03", "มีนาคม (มี.ค.)"],
                                      ["04", "เมษายน (เม.ย.)"],
                                      ["05", "พฤษภาคม (พ.ค.)"],
                                      ["06", "มิถุนายน (มิ.ย.)"],
                                      ["07", "กรกฎาคม (ก.ค.)"],
                                      ["08", "สิงหาคม (ส.ค.)"],
                                      ["09", "กันยายน (ก.ย.)"],
                                      ["10", "ตุลาคม (ต.ค.)"],
                                      ["11", "พฤศจิกายน (พ.ย.)"],
                                      ["12", "ธันวาคม (ธ.ค.)"],
                                    ],
                                  }),
                                  valueField: "id",
                                  displayField: "c_name",
                                  triggerAction: "all",
                                  forceSelection: true,
                                  selectOnFocus: true,
                                  typeAhead: false,
                                  emptyText: "กรุณาเลือก...",
                                }),
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                  if (value != "" && value != undefined) {
                                    metaData.attr = "style='text-align: left;'";
                                    let name = getStoreItems(
                                      new Ext.data.SimpleStore({
                                        fields: ["id", "c_name"],
                                        data: [
                                          ["01", "มกราคม (ม.ค.)"],
                                          ["02", "กุมภาพันธ์ (ก.พ.)"],
                                          ["03", "มีนาคม (มี.ค.)"],
                                          ["04", "เมษายน (เม.ย.)"],
                                          ["05", "พฤษภาคม (พ.ค.)"],
                                          ["06", "มิถุนายน (มิ.ย.)"],
                                          ["07", "กรกฎาคม (ก.ค.)"],
                                          ["08", "สิงหาคม (ส.ค.)"],
                                          ["09", "กันยายน (ก.ย.)"],
                                          ["10", "ตุลาคม (ต.ค.)"],
                                          ["11", "พฤศจิกายน (พ.ย.)"],
                                          ["12", "ธันวาคม (ธ.ค.)"],
                                        ],
                                      }),
                                      value,
                                      "c_name"
                                    );
                                    return name;
                                  } else {
                                    metaData.attr = "style='text-align: center; color:red;'";
                                    return "-";
                                  }
                                },
                              },
                              {
                                header: "รายการ",
                                sortable: false,
                                width: 250,
                                align: "center",
                                dataIndex: "dc_acc_id",
                                id: "dc_acc_id",
                                editor: new Ext.form.ComboBox({
                                  mode: "local",
                                  store: Ext.dc_acc,
                                  valueField: "id",
                                  displayField: "c_name",
                                }),
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                  if (value != "" && value != undefined) {
                                    metaData.attr = "style='text-align: left;'";
                                    let name = getStoreItems(Ext.dc_acc, value, "c_name");
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
                                dataIndex: "f_inv",
                                width: 110,
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                  if (value) {
                                    metaData.attr = "style='text-align: right; color:blue;'";
                                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                                  } else {
                                    metaData.attr = "style='text-align: right; color:red;'";
                                    return "-";
                                  }
                                },
                              },
                              {
                                header: "ภาษีมูลค่าเพิ่ม",
                                sortable: false,
                                align: "center",
                                dataIndex: "f_vat",
                                width: 110,
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                  if (value) {
                                    metaData.attr = "style='text-align: right; color:blue;'";
                                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                                  } else {
                                    metaData.attr = "style='text-align: right; color:red;'";
                                    return "-";
                                  }
                                },
                              },
                              {
                                header: "จำนวนเงิน + ภาษีมูลค่าเพิ่ม",
                                sortable: false,
                                align: "center",
                                dataIndex: "f_inv_vat",
                                width: 110,
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                  if (value) {
                                    metaData.attr = "style='text-align: right; color:blue;'";
                                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                                  } else {
                                    metaData.attr = "style='text-align: right; color:red;'";
                                    return "-";
                                  }
                                },
                              },
                              { width: 10, dataIndex: "" },
                            ],
                            autoExpandColumn: "dc_acc_id",
                            // bbar: Ext.pagingBar,
                          }),
                          { xtype: "container", height: 10 },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                // column 2
                columnWidth: 0.4,
                layout: "fit",
                border: false,
                items: [
                  {
                    xtype: "container",
                    layout: "hbox",
                    align: "stretch",
                    RemoveHeight: true,
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "รายละเอียดการขอเบิก",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:150px;" },
                        items: [
                          {
                            xtype: "textfield",
                            fieldLabel: "จำนวนรายการ",
                            name: "c_qty",
                            readOnly: true,
                            style: {
                              padding: "1px",
                              margin: "1px",
                              "background-color": "#fff",
                              "text-align": "left",
                              width: "100px",
                            },
                          },
                          {
                            xtype: "textfield",
                            readOnly: true,
                            fieldLabel: "จำนวนเงินขอเบิก",
                            name: "f_total",
                            style: {
                              labelAlign: "right",
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "green",
                              "background-color": "#fff",
                              "text-align": "right",
                            },
                          },
                          {
                            xtype: "datefield",
                            fieldLabel: "วันที่เกิดค่าใช่จ่าย/<br>วันที่ตรวจรับ",
                            name: "d_audit_date",
                            readOnly: true,
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.po_emp,
                            anchor: "90%",
                            valueField: "id",
                            displayField: "c_name",
                            fieldLabel: "ผู้ดำเนินการ",
                            name: "po_emp_id",
                            readOnly: true,
                          }),
                          {
                            xtype: "datefield",
                            fieldLabel: "วันที่ใบขอเบิก",
                            name: "d_doc_date",
                            readOnly: true,
                          },
                          {
                            xtype: "textarea",
                            fieldLabel: "คำอธิบายรายการ",
                            name: "c_comment",
                            validator: function (val) {
                              return true;
                            },
                            width: 200,
                            readOnly: true,
                          },
                          { xtype: "container", height: 30 },
                          {
                            xtype: "container",
                            layout: "hbox",
                            align: "stretch",
                            RemoveHeight: true,
                            width: 500,
                            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                            items: [
                              {
                                title: "รายละเอียดเงิน",
                                RemoveCls: "x-box-item",
                                collapsible: false,
                                collapsed: false,
                                defaults: { labelStyle: "width:200px;", allowBlank: true },
                                items: [
                                  {
                                    xtype: "buttongroup", // จำนวนเงิน
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 80,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงิน:",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_inv",
                                        readOnly: true,
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
                                    xtype: "buttongroup", // ภาษีมูลค่าเพิ่ม
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 38,
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 19,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ภาษีมูลค่าเพิ่ม :",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_vat",
                                        readOnly: true,
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
                                        width: 10,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "(%): ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 25,
                                        name: "f_vat_rate",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "center",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // จำนวนเงินขอเบิก
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 46,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงินขอเบิก: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_inv_vat",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "green",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  { xtype: "container", height: 10 },
                                  {
                                    xtype: "buttongroup", // ภาษีหัก ณ ที่จ่าย
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 30,
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 19,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ภาษีหัก ณ ที่จ่าย: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_tax_personal",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 10,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "(%): ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        name: "f_tax_personal_rate",
                                        width: 25,
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "center",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าประกันสังคม
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 57,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าประกันสังคม: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_social_security",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // กองทุนสำรองเลื้ยงชีพ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 23,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "กองทุนสำรองเลื้ยงชีพ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_prov_fund",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าปรับ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 98,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าปรับ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_fine",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าประกันผลงาน
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 52,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าประกันผลงาน: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_warranty",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // อื่นๆ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 111,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "อื่นๆ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_other",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // จำนวนเงินที่จ่าย
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 53,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงินที่จ่าย: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_pay",
                                        readOnly: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "right",
                                        },
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  

  
  creditor_taxdata_load(Ext.store_frmDtl.getAt(0).data.dc_creditor_id);
}; // formPanelDtl 
Ext.extend(formPanelAdd, Ext.Panel, {});