/* global Ext */

// The data store containing the list of states
/*
 *	Here is where we create the Form 
 */


Ext.onReady(function ()
{
    Ext.QuickTips.init();
    Ext.idRep = 'frm-report';
    //Spring Boot cross context
     Ext.urlReport = (1) ? '../../reports/getRepImc002' : '../../reports/printr.php?get=true'; //DEBUG 
    // Spring Boot
    Ext.titleReport = 'รายงาน Order งานโครงการ';
    Ext.MessageBox.minWidth = 200;
    Ext.getDate = Ext.apply(
            {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                day: new Date().getDay(),
                getNowCarlen: function ()
                {
                    var day = new Date();
                    var dd = day.getDate();
                    var mm = day.getMonth() + 1;
                    var yy = day.getFullYear() + 543;
                    mm = (mm < 10) ? ("0" + mm) : mm;
                    dd = (dd < 10) ? ("0" + dd) : dd;
                    return dd + '-' + mm + '-' + yy;
                }
            });
    /**
     * Commentdis_year2
     */
    function displayTitleReport(v)
    {
        Ext.getCmp('getReportTypeID').setValue(v);
        
        Ext.getCmp('c_yearID').setValue(getStoreItems(store_year, Ext.getCmp("s_year").getValue(), 'c_name')); //cast string
        Ext.getCmp('c_monthID').setValue(getStoreItems(store_month, Ext.getCmp("s_month").getValue(), 'c_name'));
        Ext.getCmp('c_year2ID').setValue(getStoreItems(store_year, Ext.getCmp("s_year2").getValue(), 'c_name')); //cast string
        Ext.getCmp('c_month2ID').setValue(getStoreItems(store_month, Ext.getCmp("s_month2").getValue(), 'c_name'));
    }

    function frmWithOutAjax(value)
    {
        if (true) //if (checkUi())
        {
            //set display title report
            displayTitleReport(value);
            //set submit post report with ajax
            var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
            frm.setAttribute('target', "ReportImc002");
            frm.setAttribute('action', Ext.urlReport);
            frm.submit();
            frm.focus();
        }
    }
    /**
     * Comment
     */

    function checkUi()
    {

        if (Ext.getCmp('dc_cost_idID').getValue() === '')
        {
            Ext.MessageBox.alert('Failed ', 'กรุณาเลือกหน่วยงาน ', function ()
            {
                Ext.get('dc_cost_idID_Name').dom.focus();

                return false;
            });
        } else if (Ext.getCmp('dc_debtor_idID_Name').getValue() === '')
        {
            Ext.MessageBox.alert('Failed ', 'กรุณาเลือกชื่อลูกค้า', function ()
            {
                Ext.get('dc_debtor_idID_Name').dom.focus();
                return false;
            });
        } else
        {
            return true;
        }
        /* return true; */
    }

    function setButtonReport()
    {

        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: 'small',
            iconCls: 'icon-pdf',
            handler: function ()
            {
                frmWithOutAjax('pdf');
            }
        };
        var excelReport = {
            text: Ext.GLOBAL_BU_EXCEL_TH,
            scale: 'small',
            id: 'rep-excel',
            iconCls: 'icon-excel',
            handler: function ()
            {
                frmWithOutAjax('excel');
            }
        };

        var exp2pdf = {
            text: 'Export Pdf',
            scale: 'small',
            id: 'rep-exp2pdf',
            iconCls: 'icon-export',
            handler: function ()
            {
                frmWithOutAjax('exp2pdf');
            }
        };

        var exp2xlsx = {
            text: 'Export Xlsx',
            scale: 'small',
            id: 'rep-exp2xlsx',
            iconCls: 'icon-export',
            handler: function ()
            {
                frmWithOutAjax('exp2xlsx');
            }
        };
        var exp2csv = {
            text: 'Export Csv',
            scale: 'small',
            id: 'rep-exp2csv',
            iconCls: 'icon-export',
            handler: function ()
            {
                frmWithOutAjax('exp2csv');
            }
        };

        return [pdfReport, excelReport, exp2pdf, exp2xlsx];
    }
    store_month = new Ext.data.JsonStore(
            {
                fields: ["id", "c_name"],
                data: [
                    {
                        id: "1",
                        c_name: "มกราคม"
                    }, {
                        id: "2",
                        c_name: "กุมภาพันธ์"
                    }, {
                        id: "3",
                        c_name: "มีนาคม"
                    }, {
                        id: "4",
                        c_name: "เมษายน"
                    }, {
                        id: "5",
                        c_name: "พฤษภาคม"
                    }, {
                        id: "6",
                        c_name: "มิถุนายน"
                    }, {
                        id: "7",
                        c_name: "กรกฎาคม"
                    }, {
                        id: "8",
                        c_name: "สิงหาคม"
                    }, {
                        id: "9",
                        c_name: "กันยายน"
                    }, {
                        id: "10",
                        c_name: "ตุลาคม"
                    }, {
                        id: "11",
                        c_name: "พฤศจิกายน"
                    }, {
                        id: "12",
                        c_name: "ธันวาคม"
                    }]
            });
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var yy_en = 2009; //currentTime.getFullYear()-7;
    while (yy_en <= now)
    {
        years.push(
                {
                    id: '' + yy_en,
                    c_name: yy_en + 543
                }); //cast string
        yy_en++;
    }
    ;
    store_year = new Ext.data.JsonStore(
            {
                fields: ["id", "c_name"],
                data: years
            });

    var columnMini = [
        {
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: 'id'
        }, {
            header: "รหัส",
            sortable: true,
            dataIndex: 'c_code',
        }, {
            header: "ชื่อ",
            sortable: true,
            id: 'c_name',
            dataIndex: 'c_name',
            renderer: function (value, metaData, record, rowIndex, colIndex, store)
            {
                metaData.attr = "style='cursor:pointer';";
                return value;
            }
        }];
    //**********CNT****************************************
    Ext.storeDebtor = new Ext.data.JsonStore(
            {
                autoLoad: true,
                storeId: 'myStoreCnt',
                url: 'api/dc/DAO/listCombo/All_ArCombo.php',
                baseParams: {
                    type: 'storeDebtor'
                },
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount',
                fields: ['no', 'id', 'c_code', 'c_name']
            });

    Ext.storeCost = new Ext.data.JsonStore(
            {
                autoLoad: true,
                storeId: 'myStoreCostFormTv',
                url: 'api/dc/DAO/listCombo/All_ArCombo.php',
                baseParams: {
                    type: 'storeCost',
                    all: true
                },
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount',
                fields: ['no', 'id', 'c_code', 'c_name']
            });

    Ext.storeDcCntType = new Ext.data.JsonStore(
            {
                autoLoad: true,
                storeId: 'myStoreDcCntType',
                url: 'api/dc/DAO/listCombo/listData.php',
                //        url: '../dc/api/ListDcDebtorType.php',
                baseParams: {
                    getStore: 'storeDcCntType'
                },
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount',
                fields: ['no', 'id', 'c_code', 'c_name']
            });
    //*********COST********************************************
    //********FormLove*****************************************
    Ext.PopCostForm = new Ext.ux.Poplov(
            {
                text: 'หน่วยงาน',
                id: 'dc_cost_idID',
                //go to relation
                iconCls: 'page_magnify',
                valueHidden: 'dc_cost_id',
                loadMask: true,
                //go to hidden
                store: Ext.storeCost,
                headerGrid: columnMini,
                widthText: 280,
                fieldLabel: 'หน่วยงานเจ้าของเรื่อง ',
            });
    Ext.PopCntForm = new Ext.ux.Poplov(
            {
                text: 'ชื่อลูกค้า',
                id: 'dc_debtor_idID',
                //go to relation
                iconCls: 'page_magnify',
                valueHidden: 'dc_debtor_id',
                //go to hidden
                store: Ext.storeDebtor,
                headerGrid: columnMini,
                widthText: 350,
                fieldLabel: 'ชื่อลูกค้า',
                isCellClickGrid: true,
                cellClickGrid: function (grid, rowIndex)
                {

                    var id = 'dc_debtor_idID';
                    var nameID = id + '_Name';
                    var record = grid.getStore().getAt(rowIndex);
                    var TextShow = record.data.c_code + ' ' + record.data.c_name;

                    Ext.getCmp(id).setValue(record.data.id);
                    Ext.getCmp(nameID).setValue(TextShow);
                    Ext.getCmp("win-pop-lov" + id).hide();
                    Ext.getCmp("win-pop-lov" + id).destroy();



                }
            });

    var panelForm = new Ext.Panel(
            {
                region: "center",
                title: Ext.titleReport,
                border: false,
                stripeRows: true,
                loadMask: true,
                items: [
                    {
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
                        items: [
                            {
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
                                items: [
                                    {
                                        title: "รายงาน Order งานโครงการ",
                                        RemoveCls: "x-box-item",
                                        defaults: {
                                            labelStyle: "width:200px;",
                                            allowBlank: true
                                        },
                                        items: [
                                            {
                                                xtype: 'hidden',
                                                id: 'titleReportID',
                                                name: 'titleReport',
                                                value: Ext.titleReport
                                            }, {
                                                xtype: 'hidden',
                                                id: 'dcTypeID',
                                                name: 'dcTypeID'

                                            }, {
                                                xtype: 'hidden',
                                                id: 'rptID',
                                                name: 'rpt',
                                                value: 5,
                                            }, {
                                                xtype: 'hidden',
                                                id: 'getReportTypeID',
                                                name: 'getReportType',
                                                value: "pdf"
                                            }, {
                                                xtype: 'hidden',
                                                name: 'jasperName',
                                                value: "imc002"
                                            },
                                            // display title report
                                            {
                                                xtype: 'hidden',
                                                id: 'c_monthID',
                                                name: 'dis_month',
                                                value: "ไม่ระบุ"
                                            }, {
                                                xtype: 'hidden',
                                                id: 'c_yearID',
                                                name: 'dis_year',
                                                value: "ไม่ระบุ"
                                            },
                                            // display title report 2
                                            {
                                                xtype: 'hidden',
                                                id: 'c_month2ID',
                                                name: 'dis_month2',
                                                value: "ไม่ระบุ"
                                            }, {
                                                xtype: 'hidden',
                                                id: 'c_year2ID',
                                                name: 'dis_year2',
                                                value: "ไม่ระบุ"
                                            },
                                            Ext.PopCostForm.mini, {
                                                id: 'dcType',
                                                name: 'dcType',
                                                xtype: 'lovcombo',
                                                hideOnSelect: false,
                                                fieldLabel: 'ประเภทลูกค้า',
                                                store: Ext.storeDcCntType //states
                                                ,
                                                queryMode: 'local',
                                                displayField: 'c_name',
                                                editable: false,
                                                valueField: 'id',
                                                multiSelect: true,
                                                maxSelections: 3,
                                                width: 400,
                                                anchor: '60%',
                                                triggerAction: 'all',
                                                listeners: {
                                                    blur: function ()
                                                    {
                                                        Ext.getCmp(this.getName() + 'ID').setValue(this.value);
                                                    }
                                                },
                                                mode: 'local'
                                            }, {

                                                xtype: "compositefield",
                                                fieldLabel: "เดือน/ปี ออกอากาศ",
                                                anchor: "100%",
                                                msgTarget: "under",
                                                items: [new Ext.form.ComboBox(
                                                            {
                                                                id: "s_month",
                                                                width: 100,
                                                                mode: "local",
                                                                hiddenName: 'c_month',
                                                                store: store_month,
                                                                value: (new Date().getMonth() + 1),
                                                                valueField: "id",
                                                                displayField: "c_name",
                                                                triggerAction: "all",
                                                                forceSelection: true,
                                                                selectOnFocus: true,
                                                                typeAhead: false,
                                                                emptyText: "กรุณาเลือก...",
                                                                listeners: {
                                                                    "change": function (combo, newValue)
                                                                    {
                                                                        if (newValue == "")
                                                                        {
                                                                            combo.reset();
                                                                        }
                                                                    },
                                                                    beforequery: function (q)
                                                                    {
                                                                        if (q.query)
                                                                        {
                                                                            var length = q.query.length;
                                                                            q.query = new RegExp(Ext.escapeRe(q.query));
                                                                            q.query.length = length;
                                                                        }
                                                                    },
                                                                    blur: function ()
                                                                    {
                                                                        this.getStore().clearFilter();

                                                                    }
                                                                }
                                                            }), {
                                                        xtype: "displayfield",
                                                        value: "ปี : "
                                                    },
                                                    new Ext.form.ComboBox(
                                                            {
                                                                id: "s_year",
                                                                fieldLabel: "ปี",
                                                                width: 100,
                                                                mode: "local",
                                                                hiddenName: 'c_year',
                                                                store: store_year,
                                                                value: new Date().getFullYear(),
                                                                valueField: "id",
                                                                displayField: "c_name",
                                                                triggerAction: "all",
                                                                forceSelection: true,
                                                                selectOnFocus: true,
                                                                typeAhead: false,
                                                                emptyText: "กรุณาเลือก...",
                                                                listeners: {
                                                                    "change": function (combo, newValue)
                                                                    {
                                                                        if (newValue == "")
                                                                        {
                                                                            combo.reset();
                                                                        } else
                                                                        {
                                                                            Ext.getCmp('s_year2').setValue(Ext.getCmp('s_year').getValue());
                                                                        }
                                                                    },
                                                                    beforequery: function (q)
                                                                    {
                                                                        if (q.query)
                                                                        {
                                                                            var length = q.query.length;
                                                                            q.query = new RegExp(Ext.escapeRe(q.query));
                                                                            q.query.length = length;
                                                                        }
                                                                    },
                                                                    blur: function ()
                                                                    {
                                                                        this.getStore().clearFilter();
                                                                    }
                                                                }
                                                            })]
                                            }, {
                                                xtype: "compositefield",
                                                fieldLabel: "ถึงเดือน",
                                                anchor: "100%",
                                                msgTarget: "under",
                                                items: [new Ext.form.ComboBox(
                                                            {
                                                                id: "s_month2",
                                                                width: 100,
                                                                mode: "local",
                                                                hiddenName: 'c_month2',
                                                                store: store_month,
                                                                value: (new Date().getMonth() + 1),
                                                                valueField: "id",
                                                                displayField: "c_name",
                                                                triggerAction: "all",
                                                                forceSelection: true,
                                                                selectOnFocus: true,
                                                                typeAhead: false,
                                                                emptyText: "กรุณาเลือก...",
                                                                listeners: {
                                                                    "change": function (combo, newValue)
                                                                    {
                                                                        if (newValue == "")
                                                                        {
                                                                            combo.reset();
                                                                        }
                                                                    },
                                                                    beforequery: function (q)
                                                                    {
                                                                        if (q.query)
                                                                        {
                                                                            var length = q.query.length;
                                                                            q.query = new RegExp(Ext.escapeRe(q.query));
                                                                            q.query.length = length;
                                                                        }
                                                                    },
                                                                    blur: function ()
                                                                    {
                                                                        this.getStore().clearFilter();
                                                                    }
                                                                }
                                                            }), {
                                                        xtype: "displayfield",
                                                        value: "ปี : "
                                                    },
                                                    new Ext.form.ComboBox(
                                                            {
                                                                id: "s_year2",
                                                                fieldLabel: "ปี",
                                                                width: 100,
                                                                mode: "local",
                                                                hiddenName: 'c_year2',
                                                                store: store_year,
                                                                value: new Date().getFullYear(),
                                                                valueField: "id",
                                                                displayField: "c_name",
                                                                triggerAction: "all",
                                                                forceSelection: true,
                                                                selectOnFocus: true,
                                                                typeAhead: false,
                                                                emptyText: "กรุณาเลือก...",
                                                                listeners: {
                                                                    "change": function (combo, newValue)
                                                                    {
                                                                        if (newValue == "")
                                                                        {
                                                                            combo.reset();
                                                                        } else
                                                                        {
                                                                            Ext.getCmp('s_year').setValue(Ext.getCmp('s_year2').getValue());
                                                                        }
                                                                    },
                                                                    beforequery: function (q)
                                                                    {
                                                                        if (q.query)
                                                                        {
                                                                            var length = q.query.length;
                                                                            q.query = new RegExp(Ext.escapeRe(q.query));
                                                                            q.query.length = length;
                                                                        }
                                                                    },
                                                                    blur: function ()
                                                                    {
                                                                        this.getStore().clearFilter();
                                                                    }
                                                                }
                                                            })]
                                            },
                                            Ext.PopCntForm.mini


                                        ]
                                    }]
                            }],
                        buttonAlign: "left",
                        buttons: setButtonReport()
                    }]
            });
    new Ext.Viewport(
            {
                layout: 'border',
                items: panelForm
            });
});