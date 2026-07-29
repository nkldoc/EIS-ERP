  Ext.onReady(function () {
      // @ts-ignore
      Ext.QuickTips.init();
      Ext.idRep = 'frm-Rep0002';
      Ext.urlReport = "./rep/Rep0002.php";
      Ext.titleReport = 'รายงานการจ่ายเงินงบประมาณ เงินกองทุนพัฒนาคณะแพทย์ฯ เงินรายได้คณะแพทย์ฯ - รพ. เงินทดรองจ่ายและแหล่งเงินอื่นๆ';
      Ext.getDate = Ext.apply({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDay(),
          getNowCarlen: function () {
              var day = new Date();
              var dd = day.getDate();
              var mm = day.getMonth() + 1;
              var yy = day.getFullYear() + 543;
              mm = (mm < 10) ? ("0" + mm) : mm;
              dd = (dd < 10) ? ("0" + dd) : dd;
              return dd + '-' + mm + '-' + yy;
          },
      });
      // สถานะ
      var storeStatus = new Ext.data.JsonStore({
          fields: ['id', 'c_name'],
          data: [{
                  id: '0',
                  c_name: 'เลือกทั้งหมด'
              },
              {
                  id: '' + Ext.CONF_STATUS_ENABLE,
                  c_name: 'ใช้งาน'
              },
              {
                  id: '' + Ext.CONF_STATUS_DISABLE,
                  c_name: 'ไม่ใช้งาน'
              }
          ]
      });
      Ext.bgYear = Ext.apply({
          startYearBg: function () {
              return BG_YEAR_START;
          },
          endYearBg: function () {
              return BG_YEAR_END;
          },
          years: [],
          listBgYear: function () {

              var name1 = Ext.bgYear.startYearBg();
              var name2 = Ext.bgYear.endYearBg();
              var years = this.years;
              i = 0;
              for (i = name1; i <= name2; i++) {
                  var id = i;
                  var name = parseInt(i + 543);
                  years.push({
                      id: id,
                      c_name: name
                  });
              }
              years.reverse();
              return new Ext.data.JsonStore({
                  fields: ["id", "c_name"],
                  data: years
              });
          }
      });

      function frmWithOutAjax(value) {

          var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
          frm.setAttribute('target', "Report");
          frm.setAttribute('action', Ext.urlReport);
          Ext.getCmp('modeID').setValue(value);
          frm.submit();
          frm.focus();
      }

      function checkUi() {
          if (Ext.getCmp('dc_cost_idID_Name').getValue() == '') {
              Ext.MessageBox.alert('Failed', 'กรุณาเลือกหน่วยงาน ', function () {
                  Ext.get('dc_cost_idID_Name').dom.focus();
                  return false;
              });
          } else if (Ext.getCmp('dc_cost_id2ID_Name').getValue() == '') {
              Ext.MessageBox.alert('Failed', 'กรุณาเลือกหน่วยงาน ', function () {
                  Ext.get('dc_cost_id2ID_Name').dom.focus();
                  return false;
              });
          } else if (Ext.getCmp('dc_debtor_idID_Name').getValue() == '') {
              Ext.MessageBox.alert('Failed', 'กรุณาเลือกลูกค้า', function () {
                  Ext.get('dc_debtor_idID_Name').dom.focus();
                  return false;
              });
          } else {
              return true;
          }
          /* return true; */
      }

      function setButtonReport() {

          var htmlReport = {
              text: Ext.GLOBAL_BU_REPORT_TH,
              scale: 'small',
              iconCls: 'icon-html',
              handler: function () {
                  frmWithOutAjax('html');
              }
          };
          var excelReport = {
              text: Ext.GLOBAL_BU_EXCEL_TH,
              scale: 'small',
              id: 'rep-excel',
              iconCls: 'icon-excel',
              handler: function () {
                  if (checkUi())
                      frmWithOutAjax('excel');
              }
          };
          var downloadReport = {
              text: Ext.GLOBAL_BU_DOWNLOAD_TH,
              scale: 'small',
              iconCls: 'icon-downloadHTML',
              handler: function () {
                  if (checkUi())
                      frmWithOutAjax('downloadHTML');
              }
          };
          return [htmlReport /* , excelReport, downloadReport */ ];
      }
      var panelForm = new Ext.Panel({
          region: "center",
          title: Ext.titleReport,
          border: false,
          stripeRows: true,
          loadMask: true,
          items: [{
              xtype: "form",
              id: Ext.idRep,
              frame: true,
              labelAlign: "right",
              labelWidth: 200,
              bodyStyle: {
                  padding: "10px 20px"
              },
              defaults: {
                  anchor: "100%",
                  msgTarget: "side",
                  allowBlank: false
              },
              items: [{
                  xtype: "container",
                  layout: "hbox",
                  align: "stretch",
                  RemoveHeight: true,
                  defaults: {
                      xtype: "fieldset",
                      flex: 1,
                      margins: "0px 3px",
                      autoHeight: true
                  },
                  items: [{
                      title: "เงื่อนไขการแสดงรายงาน",
                      //
                      RemoveCls: "x-box-item",
                      defaults: {
                          labelStyle: "width:200px;",
                          allowBlank: true
                      },
                      items: [{
                              xtype: 'hidden',
                              id: 'titleReportID',
                              name: 'titleReport',
                              value: Ext.titleReport
                          }, {
                              xtype: 'hidden',
                              id: 'modeID',
                              name: 'mode',
                              value: 'html'
                          }, {
                              xtype: 'hidden',
                              id: 'type',
                              name: 'type',
                              value: 'html'
                          }
                          /*, {
                                                                   fieldLabel : 'เลือกเงื่อนไขในการดูรายงาน' ,
                                                                   id : 'whID' ,
                                                                   xtype : 'checkboxgroup' ,
                                                                   //checkboxgroup
                                                                   style : {
                                                                       fontWeight : 'bold' ,
                                                                       marginBottom : '10px' ,
                                                                   } ,
                                                                   columns : [ 150 , 150 , 150 ] ,
                                                                   items : [
                                                                       {
                                                                           boxLabel : 'รายการออกอนุมัติฎีกาแล้ว' ,
                                                                           name : 'c_code' ,
                                                                           inputValue : 1
                                                                       } , {
                                                                           boxLabel : 'รายการจับคู่ประเภทงบ' ,
                                                                           name : 'dc_expense_budget_type_id' ,
                                                                           inputValue : 1
                                                                       } , {
                                                                           boxLabel : 'รายการจับคู่หมวดค่าใช้จ่าย' ,
                                                                           name : 'bg_expense_group_id' ,
                                                                           inputValue : 1
                                                                       } ] ,

                                                               }*/
                          , {
                              xtype: 'combo',
                              fieldLabel: 'ปีงบประมาณ',
                              store: Ext.bgYear.listBgYear(),
                              value: new Date().getFullYear(),
                              valueField: 'id',
                              displayField: 'c_name',
                              submitValue: true,
                              hiddenName: 'i_yyyy',
                              id: 'i_yyyyID',
                              mode: "local",
                              triggerAction: "all",
                              forceSelection: true,
                              selectOnFocus: true,
                              editable: false,
                              listeners: {
                                  select: function (combo, record, index) {
                                      var newValue = record.data.id;
                                  }
                              }
                          }
                      ]
                  }]
              }],
              buttonAlign: "left",
              buttons: setButtonReport()
          }]
      });

      new Ext.Viewport({
          layout: 'border',
          items: panelForm
      });
  });