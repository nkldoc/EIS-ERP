/* global Ext, user_right_add, user_right_read, user_right_delete, i_delete, user_right_edit

 * @globalUserCostName, @globalUserCostID

i_adj_rest = 0  เต็มจำนวน 1 บางส่วน
 
 * @returns {Array}{
 header: "หมายเหตุ",
 dataIndex: 'c_comment',
 width: 70
 }

mode: ADD => EDIT
id: 437539
i_adj_rest: 0
dc_cnt_id: 9
txtdc_cnt_idID: CV00009 บริษัท เมเจอร์ แอ็ดเวอร์ไทซิ่ง จำกัด
ar_so_hdr_id: 304055
txtar_so_hdr_idID: SO180401140
ar_bill_invoice_hdr_id: 437539
txtar_bill_invoice_hdr_idID: BL000T0118040110
c_comment: ยกเลิกรายการออกอากาศ
d_request_adjust_date: 19-06-2562
dc_comment_dec_id: 1
c_comment2: ddd
i_parent:
dc_tax_id_vat:
dc_tax_id_tax:
vat_rate:
tax_rate:
 */

var adjHdrItems = function () {

    return [{xtype: 'displayfield', fieldLabel: 'เลขที่ใบขอปรับปรุงหนี้', name: 'adj_code'}
        , {xtype: 'hidden', name: 'mode', id: 'modeID', value: "ADD"}
        , {xtype: 'hidden', name: 'id', id: 'hdrID'}
        , {xtype: 'hidden', name: 'i_adj_rest', value: 0}
        , Ext.obj.PopCntForm().mini
        , {
                    xtype: 'fieldset',
                    title: 'ข้อมูลลูกค้า',
                    id: 'disPlayCntID',
                    layout: 'form',
                    defaults: {width: '600px', xtype: 'displayfield', style: {overflowY: 'auto'}},
                    listeners: {
                        afterrender: function () {
                            this.getActive = function (v) {
                                if (parseInt(Ext.getCmp('dc_cnt_idID').getValue()) > 0)
                                    this.show();
                                else
                                    this.hide();
                            };
                            this.getActive(Ext.getCmp('dc_cnt_idID').getValue());
                        }
                    },
                    // dc_cnt_type_name, c_tax_value c_address  c_telephone c_mobile, c_fax
                    items: [{
                            fieldLabel: 'ประเภทลูกค้า ', name: 'dc_cnt_type_name'
                        }, {
                            fieldLabel: 'เลขประจำตัวผู้เสียภาษีอากร ', name: 'c_tax_value'
                        }, {
                            fieldLabel: 'ที่อยู่	', name: 'c_address'
                        }, {
                            fieldLabel: 'โทรศัพท์ ', name: 'c_telephone'
                        }, {
                            fieldLabel: 'โทรศัพท์เคลื่อนที่ ', name: 'c_mobile'
                        }, {
                            fieldLabel: 'โทรสาร ', name: 'c_fax'
                        }]}
		, Ext.obj.PopSoForm().mini
        , {
                    xtype: 'fieldset',
                    title: 'ข้อมูลใบสั่งโฆษณา (Order)',
                    id: 'disPlaySoID',
                    layout: 'form',
                    defaults: {width: '600px', xtype: 'displayfield', style: {overflowY: 'auto'}},
                    listeners: {
                        afterrender: function () {
                            this.getActive = function (v) {
                                if (parseInt(Ext.getCmp('ar_so_hdr_idID').getValue()) > 0)
                                    this.show();
                                else
                                    this.hide();
                            };
                            this.getActive(Ext.getCmp('ar_so_hdr_idID').getValue());
                }
                    },
                    items: [
                        {

                            fieldLabel: 'เลขที่ใบสั่งโฆษณา (Order)',
                            name: 'so_code'
                        }, {
                            fieldLabel: 'เลขที่ใบสั่งซื้อ/เช่าเวลาจากลูกค้า',
                            name: 'c_po_no'
                        }, {

                            fieldLabel: 'ชื่อผู้นำเข้า',
                            name: 'dc_comm_name'

                        }, {
                            fieldLabel: 'วันที่ใบสั่งโฆษณา/เช่าเวลา',
                            name: 'd_so_date'

                        }

                    ]
                }

        , Ext.obj.PopBlForm().mini
        , {
                    xtype: 'fieldset',
                    title: 'ข้อมูลใบวางบิล/ใบแจ้งหนี้',
                    id: 'disPlayBlID',
                    layout: 'form',
                    defaults: {width: '600px', xtype: 'displayfield', style: {overflowY: 'auto'}},
                    listeners: {
                        afterrender: function () {
                            this.getActive = function (v) {
                                if (parseInt(Ext.getCmp('ar_bill_invoice_hdr_idID').getValue()) > 0)
                                    this.show();
                                else
                                    this.hide();
                            };
                            this.getActive(Ext.getCmp('ar_bill_invoice_hdr_idID').getValue());
                        }
                    },
// dc_cnt_type_name, c_tax_value c_address  c_telephone c_mobile, c_fax
// so_code c_po_no dc_comm_name d_so_date
// bl_code d_billing_date f_total_cost_amt f_disc_com_amt f_net_disc_comm_amt f_net_cost_amt f_vat_amt f_net_cost_add_vat_amt

                    items: [{
                            fieldLabel: 'เลขที่ใบวางบิล/ใบแจ้งหนี้',
                            name: 'bl_code',
                        }, {
                            fieldLabel: 'วันที่วางบิล/แจ้งหนี้	',
                            name: 'd_billing_date',
                        }, {
                            fieldLabel: 'จำนวนเงิน',
                            name: 'f_total_cost_amt',
                        }, {
                            fieldLabel: 'ส่วนลดการค้า',
                            name: 'f_disc_com_amt',
                        }, {
                            fieldLabel: 'จำนวนเงินหลังหักส่วนลดการค้า',
                            name: 'f_net_disc_comm_amt',
                        }, {
                            fieldLabel: 'จำนวนเงินสุทธิ',
                            name: 'f_net_cost_amt',
                        }, {
                            fieldLabel: 'ภาษีมูลค่าเพิ่ม 7.00 %',
                            name: 'f_vat_amt',
                        }, {
                            fieldLabel: 'จำนวนเงินรวมภาษีมูลค่าเพิ่ม',
                            name: 'f_net_cost_add_vat_amt',
                        }]
                }
        , {xtype: 'hidden', id: 'c_commentID', name: 'c_comment'}
        , {
            xtype: 'datefield'
            , name: 'd_request_adjust_date'
            , value: Ext.obj.defaultDate(2)
            , validator: function (val) {
                return Ext.isEmpty(val) ? "กรุณาเลือก วันที่ใบสั่งโฆษณา" : true;
            }
        }, {
            xtype: 'combo',
            mode: 'local',
            value: 1,
            width: 250,
            // disabled: dis,
            triggerAction: 'all',
            forceSelection: true,
            editable: false,
            fieldLabel: 'เหตุผลในการขอปรับปรุงหนี้',
            id: 'dc_comment_dec_idID',
            name: 'dc_comment_dec_id',
            hiddenName: 'dc_comment_dec_id',
            displayField: 'c_name',
            valueField: 'id', 
            store: Ext.commentDecStore,
            listeners: {
                select: function (cb, rec, ind) {
                    this.getRate(rec.json.c_name);
                },
                afterrender: function () {
                    this.getRate = function (v) {
                        Ext.getCmp('c_commentID').setValue(v);
                        console.log(v);
                    };
                    this.getRate(this.getStore().data.items[0].json.c_name);
                }
            }
        }
        , {xtype: 'textarea', width: 500, fieldLabel: 'หมายเหตุ', name: 'c_comment2'}
        , {xtype: 'hidden', name: 'i_parent', id: 'i_parentID'}
        , {xtype: 'hidden', id: 'dc_vat_idID', name: 'dc_tax_id_vat'}
        , {xtype: 'hidden', id: 'f_vat_rateID', name: 'dc_tax_id_tax'}
        , {xtype: 'hidden', id: 'dc_tax_idID', name: 'vat_rate'}
        , {xtype: 'hidden', id: 'f_tax_rateID', name: 'tax_rate'}

    ];
};

function frmAddAdjHdr(i) // BL DTL (i) แสดงข้อมูลอย่างเดียว Else
{
    frmAddAdjHdr.superclass.constructor.call(this, {
        id: 'frm-adj-hdrID',
        url: Ext.obj.controllerMain,
        frame: true,
        bodyStyle: "padding:5px",
        autoScroll: true,
        width: 700,
        labelWidth: 180,
        defaults: {flex: 1},
        //closable:true,
        loadMask: true,
        title: Ext.obj.title_gridMain_th,
        items: adjHdrItems(),
        buttonAlign: 'left',
        listeners: {afterrender: function (win) { }},
        buttons: [{
                text: 'บันทึกรายการ',
                id: 'buSaveID',
                iconCls: 'icon-save',
                handler: function () {
                    var form = Ext.getCmp('frm-adj-hdrID').getForm();
                    if (Ext.getCmp('ar_bill_invoice_hdr_idID_Name').getValue() == '') {
                        var isChk = false;
                        Ext.Msg.alert('Failure', 'กรุณาเลือกใบวางบิลที่จะปรับปรุงหนี้', function () {
                            Ext.get('ar_bill_invoice_hdr_idID_Name').dom.focus();

                        });

                    } else if (form.isValid()) {
                        form.submit({
                            waitMsg: 'Saving Data...',
                            success: function (form, action) {
                                Ext.obj.id = action.result.data.id;
                                if (action.result.data.id === 0) {
//เตือนในกรณีบันทึกไม่ฟ่าน ปิดเดือนหรือ..
                                    Ext.Msg.alert('Success', action.result.data.msg);

                                } else {

                                    Ext.Msg.alert('Success', action.result.data.msg, function () {

                                        Ext.storeBl.reload({
                                            params: {
                                                typeStore: action.result.data.id
                                            },
                                            callback: function (records, operation, success) {
                                                if (success) {
                                                    Ext.obj.controllTabAdj(Ext.obj.getStoreRow(this, action.result.data.id), 'AddEdit');
                                                    Ext.getCmp('buSaveID').hide();
                                                }
                                            }
                                        });
                                        return true;
                                    });
                                }
                            },
                            failure: function (form, action) {
                                switch (action.failureType) {

                                    case Ext.form.Action.CLIENT_INVALID:

                                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:

                                        Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:

                                        Ext.Msg.alert('Failure', action.result.msg);
                                }
                            }
                        });
                    } //else
                } //hand
            }, {

                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {

                    Ext.getCmp('contenterCenter').setActiveTab('tabGridID');
                }
            }]
    });
}

Ext.obj = Ext.apply({
    pid: 'adj001',
    customer_th: "MCOT อสมท.",
    method: 'POST',
    title_menu_th: "รายการใบขอปรับปรุงนี้แจ้งหนี้ พิมพ์",
    title_gridMain_th: "แสดงข้อมูลรายการโครงการ",
    title_formMain_th: "แก้ไขรายละเอียดการโครงการ",
    title_gridDetail_th: "รายการปรับปรุงนี้แจ้งหนี้",
    dc_cnt_id: null,
    ar_so_hdr_id: null,
    controllerMain: './adj/controller/mnAdj001.php', //manage MODE ADD EDIT DELETE GENCODE ADJ
    controllerDetail: './adj/controller/mnAdjDtl001.php', //manage MODE ADD DELETE
    DAOMain: './adj/DAO/adj001_list.php?mode=READ', //list dtl from i_parent  <> 0
    DAODetail: './adj/DAO/ListTvAddSoBillingDtl.php?mode=READ', //list dtl from i_parent  = 0
    DAODetailed: './adj/DAO/adj001Dtl_list.php?mode=READSUB', //list dtl from i_parent <> 0
    //ListTvAddSoBillingDtl
    setParamsEdit: function (record) {
        console.log(record);


        Ext.getCmp('disPlayCntID').show();
        Ext.obj.dc_cnt_id = record.data.dc_cnt_id;
        Ext.storeSo.baseParams = {type: 'storeSo', dc_cnt_id: Ext.obj.dc_cnt_id};
        Ext.getCmp('disPlaySoID').show();
        Ext.obj.ar_so_hdr_id = record.data.ar_so_hdr_id;
        Ext.storeBl.baseParams = {type: 'storeBl', dc_cnt_id: Ext.obj.dc_cnt_id, ar_so_hdr_id: Ext.obj.ar_so_hdr_id};
        Ext.getCmp('disPlayBlID').show();

        Ext.obj.ar_bill_invoice_hdr_id = record.data.ar_bill_invoice_hdr_id;


        var clx = " dc_cnt_id" + Ext.obj.dc_cnt_id;
        clx += " , " + Ext.obj.ar_so_hdr_id;
        clx += " , " + Ext.obj.ar_bill_invoice_hdr_id;

        console.log(clx);
    },
//Controller
    controllTabAdj: function (record, butt) {

        if (butt === 'add') {

            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-hdrID'), true) || {}; //null obj not errer
            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer
            var frmAdj = new frmAddAdjHdr(false);
            Ext.getCmp('contenterCenter').add(frmAdj);
            Ext.getCmp('contenterCenter').setActiveTab(frmAdj);
            Ext.getCmp('modeID').setValue("ADD");
        } else if (butt === 'AddEdit') {
            ////////////////
            //before add tab remove
            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-bill-edit-hdrID'), true) || {}; //null obj not errer
            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer

            //create form and add tab
            var frmBill = new frmAddAdjHdr(false);
            Ext.getCmp('contenterCenter').add(frmBill);
            Ext.getCmp('contenterCenter').setActiveTab(frmBill);
            frmBill.getForm().loadRecord(record);
            //frmBill.getEl().mask("Please wait...", "x-mask-loading");
            Ext.getCmp('modeID').setValue("EDIT");
            var formBlDtl = new formBlDtlEdit(false);
            Ext.getCmp('contenterCenter').add(formBlDtl);
            Ext.getCmp('contenterCenter').setActiveTab(formBlDtl);
            formBlDtl.getForm().loadRecord(record);
            // Ext.getCmp('contenterCenter').setActiveTab(frmBill);
            formBlDtl.getEl().mask("Please wait...", "x-mask-loading");
            Ext.proTypeStore.reload({
                params: {
                    ar_bill_invoice_hdr_id: record.data.id,
                    dc_product_type_id: record.data.dc_product_type_id,
                    ar_so_hdr_id: record.data.ar_so_hdr_id
                },
                callback: function (records, operation, success) {
                    if (success) {
                        if (records.length > 0 && record.get('dc_product_type_id') > 0) {

                            Ext.getCmp('dc_product_type_idID').setValue(record.get('dc_product_type_id'));
                            Ext.getCmp('disBlDtlTypeProID').setValue(Ext.getStoreItems(Ext.proTypeStore, Ext.getCmp('dc_product_type_idID').getValue(), 'c_name'));
                        } else {

                            Ext.getCmp('dc_product_type_idID').setValue(-1);
                        }
                        frmBill.getEl().unmask();
                    }
                },
            });

            Ext.obj.id = record.get('id');
            Ext.rec = record;
            Ext.storeBlDtl.reload({
                params: {
                    mode: 'GETDATA',
                    id: record.data.id,
                    accessData: 'edit'
                },
                callback: function (records, operation, success) {
                    if (success) {
                        //frmSoDtl.getEl().unmask();
                        formBlDtl.getEl().unmask();
                        Ext.getCmp('hdrID').setValue(record.get('ar_bill_invoice_hdr_id'));
                        Ext.getCmp('soHdrID').setValue(record.get('ar_so_hdr_id'));
                        Ext.getCmp('tabBlDtlGrid').on('cellclick', Ext.global.clickRemoveProductBl, this);
                        validVat();
                        console.log("validVat" + Ext.obj.id);
                    }
                },
            });

            ////////////////
        } else if (butt === "edit" || butt === 'view') {
            var c_area_print = '' + record.get('c_area_print');
            //var c_area_code = '' + record.get('c_area_code');
            if (c_area_print !== '0') // +||c_area_print
                var dis = true;
            else
                var dis = false;

            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-hdrID'), true) || {}; //null obj not errer
            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer

            //create form and add tab
            var frmBill = new frmAddAdjHdr(false);
            Ext.getCmp('contenterCenter').add(frmBill);
            Ext.getCmp('contenterCenter').setActiveTab(frmBill);
            console.log(record);
            record.set("f_total_cost_amt", record.get("f_total_cost_amt1"));
            record.set("f_disc_com_amt", record.get("f_disc_com_amt1"));
            record.set("f_net_disc_comm_amt", record.get("f_net_disc_comm_amt1"));
            record.set("f_net_cost_amt", record.get("f_net_cost_amt1"));
            record.set("f_vat_amt", record.get("f_vat_amt1"));
            record.set("f_net_cost_add_vat_amt", record.get("f_net_cost_add_vat_amt1"));
            console.log(record);
            // f_total_cost_amt f_disc_com_amt f_net_disc_comm_amt f_net_cost_amt f_vat_amt f_net_cost_add_vat_amt
            frmBill.getForm().loadRecord(record);

            var formBlDtl = new frmAddAdjDtl(false);
            Ext.getCmp('contenterCenter').add(formBlDtl);
            Ext.getCmp('modeID').setValue("EDIT");
            formBlDtl.getForm().loadRecord(record);
            Ext.getCmp('contenterCenter').setActiveTab(frmBill);
            Ext.getCmp('contenterCenter').setActiveTab(formBlDtl);

            this.setParamsEdit(record);

            Ext.storeDtled.reload(
                    {
                        params: {
                            mode: 'GETDATA',
                            id: record.data.id,
                            accessData: 'edit'
                        },
                        callback: function (records, operation, success) {
                            if (success) {
                                //frmSoDtl.getEl().unmask();
                                formBlDtl.getEl().unmask();
                                Ext.getCmp('hdrID').setValue(record.get('ar_bill_invoice_hdr_id'));
                                Ext.getCmp('soHdrID').setValue(record.get('ar_so_hdr_id'));

                                Ext.getCmp('tabBlDtlGrid').on('cellclick', Ext.obj.clickRemoveProductBl, this);
                                //Ext.default.f_vat_amtID =1
                                //Ext.default.f_vat_amtID = 1;

                                validVat();
                            }
                        }
                    });
        } else if (butt === 'formPrint') {
            this.ar_so_hdr_id = record.get('ar_so_hdr_id');
            this.dc_cnt_id = record.get('dc_cnt_id');
            this.id = record.get('id'); //ar_bill_invoice_hdr_id

// This code will generate a layout table that is 3 columns by 2 rows
// with some spanning included.  The basic layout will be:
// +--------+-----------------+
// |   A    |   B             |
// |        |--------+--------|
// |        |   C    |   D    |
// +--------+--------+--------+
            var table = new Ext.Panel({
                title: 'Table Layout',
                layout: 'table',
                defaults: {
                    // applied to each contained panel
                    bodyStyle: 'padding:20px;'
                },
                layoutConfig: {
                    // The total column count must be specified here
                    columns: 3
                },
                items: [{
                        html: '<p>Cell A content</p>',
                        rowspan: 2
                    }, {
                        html: '<p>Cell B content</p>',
                        colspan: 2
                    }, {
                        html: '<p>Cell C content</p>',
                        cellCls: 'highlight'
                    }, {
                        html: '<p>Cell D content</p>'
                    }]
            });
            // frmAdd3.getForm().loadRecord(record);
            var win = new Ext.Window(
                    {
                        id: "win-formprint",
                        title: "พิมพ์",
                        modal: true,
                        constrainHeader: true,
                        maximizable: true,
                        //minimizable: true,
                        closable: true,
                        width: 1000,
//                        height: 500,
                        items: table, //frmAdd3,
                        buttonAlign: 'left',
                        buttons: [
                            {
                                text: 'บันทึกรายการ',
                                id: 'buSaveID3',
                                iconCls: 'icon-save',
                                listeners: {
                                    afterrender: function () { }
                                },
                                handler: function () {
                                    var form = Ext.getCmp('frm-Add3').getForm();
                                    if (form.isValid()) {
                                        form.submit(
                                                {
                                                    waitMsg: 'Saving Data...',
                                                    success: function (form, action) {
                                                        Ext.Msg.alert('Success', action.result.msg, function () {

                                                            Ext.getCmp('win-formprint').destroy();
                                                            Ext.getCmp('tabpanel1').getStore().reload();
                                                            // autoCal();
                                                        });
                                                    },
                                                    failure: function (form, action) {
                                                        switch (action.failureType) {
                                                            case Ext.form.Action.CLIENT_INVALID:
                                                                Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                                                break;
                                                            case Ext.form.Action.CONNECT_FAILURE:
                                                                Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                                                break;
                                                            case Ext.form.Action.SERVER_INVALID:
                                                                Ext.Msg.alert('Failure', action.result.msg);
                                                        }
                                                    }
                                                });
                                    }
                                }
                            }, {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {
                                    //Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
                                    Ext.getCmp('win-formprint').destroy();
                                }
                            }]
                    }).show();
        }

    },
    columnMini: [{
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
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            }
        }],
    columnSo: [{
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: 'id'
        }, {
            header: "รหัส",
            sortable: true,
            dataIndex: 'c_code',
        }, {
            header: "รายการ",
            sortable: true,
            id: 'c_name',
            dataIndex: 'c_name',
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            }
        }],
    columnBl: [{
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: 'id'
        }, {
            header: "รหัส",
            sortable: true,
            dataIndex: 'c_code',
            width: 300,
        }, {
            header: "รายการ",
            sortable: true,
            id: 'c_name',
            dataIndex: 'c_name',
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            }
        }],
//+++++++++++++++++++++++++++++*******************
    storeDcCnt: function () {
        return new Ext.data.JsonStore(
                {
//                    autoLoad: true,
                    storeId: 'myStoreCnt',
                    url: 'adj/DAO/items.php',
                    baseParams: {
                        type: 'storeCnt'
                    },
                    root: 'data',
                    idProperty: 'id',
                    totalProperty: 'totalCount',
                    fields: ['no', 'id', 'c_code', 'c_name', 'dc_cnt_type_name', 'c_tax_value', 'c_address', 'c_telephone', 'c_mobile', 'c_fax']
                            /***  
                             *
                             ประเภทลูกค้า	: เอเจนซี
                             เลขประจำตัวผู้เสียภาษีอากร	: 0105516013258
                             ที่อยู่	: 2 อาคารเพลินจิตเซ็นเตอร์ ชั้น 22 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
                             โทรศัพท์	: 02-629-6000 ต่อ 6320,6306
                             โทรศัพท์เคลื่อนที่	:
                             โทรสาร	:
                             */
                })
    },
    PopCntForm: function () {
        return new Ext.ux.Poplov(
                {
                    text: 'ชื่อลูกค้า',
                    id: 'dc_cnt_idID',
                    iconCls: 'page_magnify',
                    valueHidden: 'dc_cnt_id',
                    store: this.storeDcCnt(),
                    headerGrid: this.columnMini,
                    widthText: 350,
                    fieldLabel: 'ชื่อลูกค้า',
                    isCellClickGrid: true,
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                        Ext.getCmp('disPlayCntID').show();
                        var id = 'dc_cnt_idID';
                        var nameID = id + '_Name';
                        var record = grid.getStore().getAt(rowIndex);
                        if (parseInt(record.data.id) !== parseInt(Ext.obj.dc_cnt_id) && Ext.obj.dc_cnt_id !== null) {

                            Ext.MessageBox.alert('Clear Data', "ข้อมูล  SO และ BL จะถูกเคลียร์", function () {
                                console.log("ข้อมูล  SO และ BL จะถูกเคลียร์");
                            });
                        } else {

                        }

                        var TextShow = record.data.c_code + ' ' + record.data.c_name;
                        Ext.getCmp(id).setValue(record.data.id);
                        Ext.getCmp(nameID).setValue(TextShow);
                        Ext.getCmp("win-pop-lov" + id).hide();
                        Ext.getCmp("win-pop-lov" + id).destroy();
                        Ext.obj.dc_cnt_id = record.data.id;
                        Ext.storeSo.baseParams = {type: 'storeSo', dc_cnt_id: Ext.obj.dc_cnt_id};
                        Ext.getCmp('frm-adj-hdrID').getForm().loadRecord(record);
                        //



                    }
                });
    },
//------------------------------------------------
    storeSo: function () {

        return new Ext.data.JsonStore({
//                    autoLoad: true,
                    storeId: 'storeSo',
                    url: 'adj/DAO/items.php',
                    root: 'data',
                    idProperty: 'id',
                    totalProperty: 'totalCount',
                    fields: ['no', 'id', 'ar_so_hdr_id', 'c_code', 'c_name', 'c_contract_no', 'c_po_no', 'd_so_date', 'dc_comm_id', 'dc_comm_name']
                });
    },
    PopSoForm: function () {
        return new Ext.ux.Poplov(
                {
                    text: 'เลขที่ Order',
                    id: 'ar_so_hdr_idID',
                    iconCls: 'page_magnify',
                    valueHidden: 'ar_so_hdr_id',
                    store: Ext.storeSo, // this.storeSo(),
                    headerGrid: this.columnSo,
                    widthText: 350,
                    fieldLabel: 'เลขที่ Order',
                    isCellClickGrid: true,
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
//Lable show
                        Ext.getCmp('disPlaySoID').show();
//Default
                        var id = 'ar_so_hdr_idID';
                        var nameID = id + '_Name';
                        var record = grid.getStore().getAt(rowIndex);
                        if (parseInt(record.data.id) !== parseInt(Ext.obj.ar_so_hdr_id) && Ext.obj.ar_so_hdr_id !== null) {

                            Ext.MessageBox.alert('Clear Data', "BL จะถูกเคลียร์", function () {
                                console.log("BL จะถูกเคลียร์");
                            });
                        } else {

                        }

                        var TextShow = record.data.c_code + ' ' + record.data.c_name;
                        Ext.getCmp(id).setValue(record.data.id);
                        Ext.getCmp(nameID).setValue(TextShow);
                        Ext.getCmp("win-pop-lov" + id).hide();
                        Ext.getCmp("win-pop-lov" + id).destroy();

                        Ext.obj.ar_so_hdr_id = record.data.id;
                        record.set('so_code', record.data.c_code);
                        Ext.storeBl.baseParams = {type: 'storeBl', dc_cnt_id: Ext.obj.dc_cnt_id, ar_so_hdr_id: Ext.obj.ar_so_hdr_id};
                        Ext.getCmp('frm-adj-hdrID').getForm().loadRecord(record);


                    }
                });
    },
//------------------------------------------------
    storeBl: function () {
        return new Ext.data.JsonStore(
                {
                    storeId: 'myStoreBl',
                    url: 'adj/DAO/items.php',
                    baseParams: {
                        type: 'storeBl',
                        dc_cnt_id: this.dc_cnt_id, // Ext.getCmp('dc_cnt_idID').getValue(),
                        ar_so_hdr_id: this.ar_so_hdr_id // Ext.getCmp('ar_so_hdr_idID').getValue()
                    },
                    root: 'data',
                    idProperty: 'id',
                    totalProperty: 'totalCount',
                        fields: ['no', 'id', 'c_code',
                        'c_name',
                        'dc_tax_id_tax', 'dc_tax_id_vat', 'vat_rate', 'tax_rate',
                        'd_billing_date',
                        'f_total_cost_amt', 'f_disc_com_amt', 'f_net_disc_comm_amt',
                        'f_net_cost_amt', 'f_vat_amt', 'f_net_cost_add_vat_amt']

                });
    },
    PopBlForm: function () {
        return new Ext.ux.Poplov(
                {
                    text: 'เลขที่ใบวางบิล/ใบแจ้งหนี้',
                    id: 'ar_bill_invoice_hdr_idID',
                    iconCls: 'page_magnify',
                    valueHidden: 'ar_bill_invoice_hdr_id',
                    store: Ext.storeBl,
                    headerGrid: this.columnBl,
                    widthText: 350,
                    fieldLabel: 'เลขที่ใบวางบิล/ใบแจ้งหนี้',
                    isCellClickGrid: true,
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                        Ext.getCmp('disPlayBlID').show();
                        var id = 'ar_bill_invoice_hdr_idID';
                        var nameID = id + '_Name';
                        var record = grid.getStore().getAt(rowIndex);
                        var TextShow = record.data.c_code + ' ' + record.data.c_name;
                        Ext.getCmp(id).setValue(record.data.id);
                        Ext.getCmp(nameID).setValue(TextShow);
                        Ext.getCmp("win-pop-lov" + id).hide();
                        Ext.getCmp("win-pop-lov" + id).destroy();
                        Ext.obj.ar_bill_invoice_hdr_id = record.data.id;
                        record.set('bl_code', record.data.c_code);
                        record.set('c_name', record.data.c_area_code);
                        record.set('i_parent', record.data.id);
                        record.set('id', 0);
                        record.set('ar_bill_invoice_hdr_id', 0);
                        Ext.getCmp('frm-adj-hdrID').getForm().loadRecord(record);
                    }
                });
    },
//------------------------------------------------
    statusBuGenCode: function () {
        var items = parseFloat(Ext.getCmp('f_total_cost_amtID').getValue().replace(/,/g, '')),
                c_code = '' + Ext.getCmp('c_area_codeEditDisID').getValue(),
                print_code = '' + Ext.getCmp('c_area_printEditDisID').getValue();

        if (items === 0 && c_code === '0' && print_code === '0') {
            Ext.getCmp('modeEditID').setValue('EDITDTL');
            Ext.getCmp('buGenCodeID').setText('บันทึกรายละเอียด');
            Ext.getCmp('buGenCodeID').hide();
            Ext.getCmp('buSaveID').show();
        } else if (items !== 0 && c_code === '0' && print_code === '0') {

            Ext.getCmp('modeEditID').setValue('GENCODE');
            Ext.getCmp('buGenCodeID').setText('บันทึกและออกเลข');
            Ext.getCmp('buGenCodeID').show();
            Ext.getCmp('buSaveID').show();
        } else if (items !== 0 && c_code !== '0' && print_code === '0') {
            Ext.getCmp('modeEditID').setValue('EDITDTL');
            Ext.getCmp('buGenCodeID').setText('บันทึกรายละเอียด');
            Ext.getCmp('buGenCodeID').show();
            Ext.getCmp('buSaveID').show();
        } else {
            Ext.getCmp('buGenCodeID').hide();
            Ext.getCmp('buSaveID').hide();
        }


    },
    right: function () {
        console.log('i_read ::: ' + this.i_read
                + 'add ::: ' + this.i_add
                + 'edit :::: ' + this.i_edit
                + 'del :::: ' + this.i_delete);
    },
    i_add: user_right_add,
    i_read: user_right_read,
    i_edit: 0, // user_right_edit,
    i_delete: user_right_delete,
    fieldsetCntID: false,
    //soDtl choose billing
    i_soDtl: 0,
    id: null,
    setLog: function (i) {

        this.logId = i; //now
        const songs = [0];
        const totalSongs = songs.push(1);
        console.log(totalSongs);
    },
    getLog: function () {
        return this.txtArray[this.logId];
    },
    getStoreRow: function (store, value) { // Ext.global.getStoreRow(store,id);
        for (i = 0; i < store.data.items.length; i++) {
            var rec = store.data.items[i];
            if (value === rec.data.id) {
                return rec;
            }
        } // loop
    },
    getItemsDtl: function () {
        return this.i_soDtl;
    },
    glCloseMonth: function () {
        return null;
        },
    columnOnGrid: function (grid, rowIndex, columnIndex, e) {


    },
    cellClick: function (grid, rowIndex, columnIndex, e) //EVENT
    {
        var record = grid.getStore().getAt(rowIndex);

        if (columnIndex === grid.getColumnModel().getIndexById('c_area_codeID')) //before PRINT
        {
            if (record.get('i_is_status') === 2)
                Ext.obj.controllTabAdj(record, 'formPrint');
        } else if (columnIndex === grid.getColumnModel().getIndexById('edit')) //EDIT
        {
            // #TODO 2 open edit & cancel
            //if (record.get('i_is_status') === 2)
            Ext.obj.controllTabAdj(record, 'edit');
        } else if (columnIndex === grid.getColumnModel().getIndexById('view')) //VIEW
        {
            //disbled Bu Save
        } else if (columnIndex === grid.getColumnModel().getIndexById('cancelID')) //CANCLE
        {
            if (record.get('i_is_status') === 2)
                deRemove(record.get('id'), 'cancel');
        } else if (columnIndex === grid.getColumnModel().getIndexById('delID')) //DEL
        {

            if (record.get('i_is_status') === 1)
                deRemove(record.get('id'), 'del');
        } else if (columnIndex === grid.getColumnModel().getIndexById('print_statusID')) // after PRINT
        {

            var status = record.get('print_status');
            if (status === 1) {
                //printPreview(record);
            } else if (status === 2) {
                printPreview(record);
            } else if (status === 3) {
                Preview(record.get('id'));
            }

        }
    },
    clickRemoveProductBl: function (grid, rowIndex, columnIndex, e) //Remove  BL DTL
    {
        var record = grid.getStore().getAt(rowIndex);
        if (columnIndex === grid.getColumnModel().getIndexById('removePro')) {
            //                Ext.obj.setLog(9);
            var win = new Ext.Window(
                    {
                        id: "win-msg-delete-master-sub-bl",
                        title: "Remove",
                        modal: true,
                        width: 250,
                        height: 130,
                        html: "ท่านต้องการที่จะลบข้อมูล ?",
                        buttons: [
                            {
                                text: "Confirm",
                                handler: function () {
                                    Ext.Ajax.request(
                                            {
                                                url: Ext.obj.controllerDetail,
                                                params: {
                                                    mode: 'DELETE',
                                                    id: record.get('id'),
                                                    ar_bill_invoice_hdr_id: record.get('ar_bill_invoice_hdr_id'),
                                                    ar_so_dtl_id: record.get('ar_so_dtl_id')
                                                },
                                                method: 'POST',
                                                //POST
                                                success: function (result, request) {

                                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                                    if (jsonData.success) {
                                                        Ext.default.f_vat_amtID = 3;
                                                        Ext.f_vat = null;
                                                    } else {

                                                        Ext.MessageBox.alert('Failed', jsonData.msg); // alert massage error
                                                    }


                                                    Ext.getCmp("win-msg-delete-master-sub-bl").destroy(); // clear memory :: garbage collection
                                                    //DELETE BL DTL
                                                    Ext.getCmp('tabBlDtlGrid').getStore().reload();
                                                    Ext.getCmp('tabGridMasterID').getStore().reload(); // reload grid & store
                                                },
                                                failure: function (result, request) {

                                                    Ext.MessageBox.alert('Failed', result.responseText); // connect error
                                                }
                                            });
                                }
                            }, {
                                text: "Cancel",
                                handler: function () {


                                    Ext.getCmp("win-msg-delete-master-sub-bl").destroy();
                                    Ext.getCmp('tabGridMasterID').getStore().reload();
                                }
                            }]
                    }).show();
        }
    },
    controllTab: function ( { }, butt) { //OPEN WINDOW
        if (butt === "adj001") {
            var title_txt = "แสดงรายการบิล/แจ้งหนี้ แล้ว";
            var menu_txt = "adj001";
        } else if (butt === "adjWaitQue001") {
            var title_txt = "แสดงรายการที่วางบิลแล้ว";
            var menu_txt = "adjWaitQue001";
        }
        var webAppWaiting = new Ext.Window(
                {
                    iconCls: 'icon-grid',
                    loadMask: true,
                    height: Ext.getBody().getViewSize().height * 0.8,
                    width: Ext.getBody().getViewSize().width * 0.8,
                    //80%
                    constrainHeader: true,
                    maximizable: true,
                    minimizable: true,
                    closable: true,
                    layout: 'fit',
                    title: title_txt,
                    id: 'win-panel-iframe-load',
                    bodyStyle: {
                        mixHeight: '100px'
                    },
                    autoScroll: true,
                    listeners: {
                        beforerender: function (win) {

                        },
                        afterrender: function (win) {
                            Ext.getCmp('win-panel-iframe-load').update('<iframe id="win-panel-iframe-loadID" src="' + menu_txt + '.php" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>');

                        },
                        'close': function (win) {
                            Ext.MessageBox.show({
                                title: 'Confirm Reload',
                                msg: ' คุณต้องการที่เรียกดูข้อมูลรายการที่วางบิลแล้ว ใหม่อีกครั้ง ?',
                                buttons: Ext.MessageBox.OKCANCEL,
                                icon: '',
                                //                                icon: Ext.MessageBox.QUESTION,

                                fn: function (btn) {
                                    if (btn === 'ok') {
                                        Ext.store.reload();
                                    } else {
                                        console.log(Ext.MessageBox);
                                        return;
                                    }
                                }
                            });
                        }
                    },
                    single: true,
                    minimize: function (win) {
                        var f = win;
                        f.doLayout();
                        var h = f.body.dom.scrollHeight;
                        win.setWidth(Ext.getBody().getViewSize().width * 0.2);
                        win.setHeight(Ext.getBody().getViewSize().height * 0.2);
                        win.center();
                    }
                });
        webAppWaiting.show();
    },
    storeSoDtl: function () {
        return new Ext.data.JsonStore(
                {
                    storeId: 'myStoreSoDtl',
                    baseParams: {
                        type: 'storeSoBillingDtl'
                    },
                    proxy: new Ext.data.HttpProxy(
                            {
                                url: Ext.obj.DAODetail, //'api/ListTvAddSoBillingDtl.php',
                                timeout: 90000
                            }),
                    root: 'data',
                    idProperty: 'id',
                    totalProperty: 'totalCount',
                    fields: [
                        { name: 'no'
                        }, { name: 'id'
                        }, { name: 'soBill', type: 'int'
                        }, { name: 'billing'
                        }, {name: 'f_receive_amt'
                        }, { name: 'soDtlID'
                        }, {
                            name: 'soDtlEditID'
                        }, {
                            name: 'soDtlBIlling'
                        }, {
                            name: 'ap_po_hdr_id'
                        }, {
                            name: 'dc_product_id',
                            type: 'int'
                        }, {
                            name: 'txtdc_product_idID',
                            type: 'string'
                        }, {
                            name: 'c_code',
                            type: 'string'
                        }, {
                            name: 'c_name',
                            type: 'string'
                        }, {
                            name: 'i_enable',
                            type: 'int'
                        }, {
                            name: 'dc_user_create_id'
                        }, {
                            name: 'i_is_jingle'
                        }, {
                            name: 'i_seq',
                            type: 'int'
                        }, {
                            name: 'c_type'
                        }, {
                            name: 'f_quan'
                        }, {
                            name: 'f_total_cost'
                        }, {
                            name: 'f_disc_com_amt'
                        }, {
                            name: 'f_disc_com'
                        }, {
                            name: 'f_disc_cash_amt_bal'
                        }, {
                            name: 'f_disc_cash'
                        }, {
                            name: 'f_disc_cash_amt'
                        }, {name: 'f_net_cost'
                        }, {name: 'c_comment'
                        }, {name: 'f_net_disc_comm_amt'
                        }, {name: 'f_total_req'
                        }, {name: 'f_balance'
                        }, {name: 'f_req_amt'
                        }, {name: 'f_new_net_cost'

                                    //f_net_disc_comm_amt f_total_req f_balance f_req_amt f_new_net_cost
//                        }, {
//                            name: 'dc_user_create_cost_id'
//                        }, {
//                            name: 'd_create'
//                        }, {
//                            name: 'dc_user_update_id'
//                        }, {
//                            name: 'dc_user_update_cost_id'
//                        }, {
//                            name: 'd_update'
                        }]
                });
    },
    selectProductBilling: function (record) {
        var storeSoDtl = Ext.obj.storeSoDtl();

        storeSoDtl.setBaseParam("mode", "GETDATA");
        storeSoDtl.setBaseParam("id", Ext.getCmp("hdrID").getValue());
        storeSoDtl.setBaseParam("i_parent", Ext.getCmp("i_parentID").getValue());
        /*รายการวางบิล/แจ้งหนี้	สถานะยืนยันรายได้	จำนวนเงิน
         หลังหักส่วนลดการค้า	รวมเงินที่ขอ
         ปรับลดหนี้แล้ว	ยอดหนี้คงเหลือ	จำนวนเงินที่ขอปรับลด	จำนวนเงินที่ถูกต้อง*/
        var gridDtl = {
            xtype: 'grid',
            id: 'tabInvoiceDtlGrid',
            border: false,
            stripeRows: true,
            loadMask: true,
            //frame : true,
            autoHeight: true,
            store: storeSoDtl,
            tbar: [
                {xtype: 'displayfield', name: 'disPayAdj', value: 'ระบุรายการที่จะปรับปรุงหนี้ ยอดเงินของใบแจ้งนี้คงเหลือ '},
                {xtype: 'displayfield', name: 'f_receive_all_bill', id: 'f_receive_all_billID'},
                {xtype: 'hidden', name: 'f_rec_amt', id: 'f_rec_amtID'}
            ],
            columns: [new Ext.grid.RowNumberer({
                            width: 35,
                            header: " No ",
                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                return record.get('no');
                            }
                        }), {
                    header: "ID System",
                    sortable: true,
                    hidden: true,
                    dataIndex: 'id'

                    /**รายการวางบิล/แจ้งหนี้	สถานะยืนยันรายได้	จำนวนเงิน
                     หลังหักส่วนลดการค้า	รวมเงินที่ขอ
                     ปรับลดหนี้แล้ว	ยอดหนี้คงเหลือ	จำนวนเงินที่ขอปรับลด	จำนวนเงินที่ถูกต้อง*/
                }, {
                    header: "รายการวางบิล/แจ้งหนี้",
                    dataIndex: 'c_name',
                    id: 'CproductID'

                }, {
                    header: "<p>จำนวนเงิน</p>หลังหักส่วนลดการค้า",
                    align: 'right',
                    dataIndex: 'f_net_disc_comm_amt',
                    width: 170
                }, {
                    header: "<p>รวมเงินที่ขอ</p>ปรับลดหนี้แล้ว",
                    align: 'right',
                    dataIndex: 'f_total_req',
                    width: 180
                }, {
                    header: "ยอดหนี้คงเหลือ",
                    align: 'right',
                    dataIndex: 'f_balance',
                    width: 130
                }, {
                    header: "จำนวนเงินที่ขอปรับลด",
                    align: 'right',
                    dataIndex: 'f_req_amt',
                    width: 130
                }, {//  f_net_disc_comm_amt f_total_req f_balance f_req_amt f_new_net_cost
                    header: "จำนวนเงินที่ถูกต้อง",
                    align: 'right',
                    dataIndex: 'f_new_net_cost',
                    width: 130,
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (record.get('id') === 'grandTotal') {
                            console.log(record);
                            Ext.getCmp('f_receive_all_billID').setValue(record.get('f_receive_amt'));
                        }
                        return value;
                    }
                }],
            autoExpandColumn: "CproductID"
        };
        var itemsSoDtl = [
            {
                xtype: 'hidden',
                name: 'mode',
                value: 'ADD',
            }, {

                xtype: 'hidden',
                name: 'ar_bill_invoice_hdr_id',
                value: Ext.getCmp('hdrID').getValue(),
            },
            gridDtl];
        var id = 'invoice_dtlID';

        if (!Ext.isEmpty((storeSoDtl.load())))
            new Ext.Window(
                    {
                        id: "win-pop-lov" + id,
                        title: " เลือกรายการปรับปรุงหนี้",
                        modal: true,
                        plain: true,
                        frame: true,
                        layout: "fit",
                        maximizable: true,
                        constrainHeader: true,
                        closable: true,
                        init: function () {

                            console.log();
                        },
                        listeners: {
                            afterrender: function (obj, eOpts) {

                                this.fn = function (widht, height) { //percentage
                                    var width = Ext.getBody().getViewSize().width * widht;
                                    var height = Ext.getBody().getViewSize().height * height;
                                    this.setSize(width, height);
                                };
                                this.fn(.70, .75);
                            },
                            "maximize": function (window, opts) { //when property minimizable
                                window.setWidth(Ext.getBody().getViewSize().width * .999);
                                window.expand('', false);
                                window.center();
                            }
                        },
                        items: [
                            {
                                xtype: 'form',
                                id: 'form-widgets' + id,
                                url: 'adj/controller/mnSoBillingDtl.php',
                                items: itemsSoDtl,
                                autoScroll: true,
                                buttonAlign: 'left',
                                buttons: [
                                    {
                                        text: 'บันทึกรายการ ที่เลือก',
                                        id: 'buSaveSubID',
                                        iconCls: 'icon-save',
                                        handler: function () {
                                            var form = Ext.getCmp('form-widgets' + id).getForm();
                                            if (form.isValid() && Ext.obj.getItemsDtl() > 0) {
                                                form.submit(
                                                        {
                                                            waitMsg: 'Saving Data...',
                                                            success: function (form, action) {
                                                                Ext.Msg.alert('Success', action.result.msg, function () {
                                                                    Ext.storeDtl.reload(
                                                                            {
                                                                                callback: function (records, operation, success) {
                                                                                    if (success) {
                                                                                        Ext.select('#f_vat_amtID').on('blur', function () {
                                                                                            var old = parseFloat(Ext.getCmp('f_vat_amtID').value.replace(/,/g, ''));
                                                                                            var f_vat_amt = Ext.isEmpty(Ext.getCmp('f_vat_amtID').getValue()) ? 0.00 : parseFloat(Ext.getCmp('f_vat_amtID').getValue().replace(/,/g, ''));
                                                                                            var v1 = old + 0.02;
                                                                                            var v2 = old - 0.02;
                                                                                            if (v1 < f_vat_amt || v2 > f_vat_amt) {
                                                                                                Ext.Msg.alert('Failure', old.toFixed(2) + ' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท', function () {
                                                                                                    Ext.getCmp('contenterCenter').setActiveTab('contenterCenter1');
                                                                                                    Ext.getCmp('contenterCenter1').setActiveTab('frm-so-dtlID');
                                                                                                    Ext.get('f_vat_amtID').dom.focus();
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    } //success
                                                                                },
                                                                            });
                                                                    // 1.Unset value checkbox
                                                                    Ext.obj.i_soDtl = 0;
                                                                    // 2.cancle Ext.default.f_vat_amtID
                                                                    Ext.
                                                                            default.f_vat_amtID = 4;
                                                                    Ext.getCmp('tabBlDtlGrid').getStore().reload();
                                                                    Ext.getCmp('tabGridMasterID').getStore().reload(); // reload grid & store
                                                                    Ext.getCmp("win-pop-lov" + id).destroy();
                                                                    return true;
                                                                });
                                                            },
                                                            failure: function (form, action) {
                                                                switch (action.failureType) {

                                                                    case Ext.form.Action.CLIENT_INVALID:

                                                                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                                                        break;
                                                                    case Ext.form.Action.CONNECT_FAILURE:

                                                                        Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                                                        break;
                                                                    case Ext.form.Action.SERVER_INVALID:

                                                                        Ext.Msg.alert('Failure', action.result.msg);
                                                                }
                                                            }
                                                        });
                                            }
                                        }
                                    }, {

                                        text: Ext.GLOBAL_BU_BACK_TH,
                                        handler: function () {

                                            Ext.getCmp("win-pop-lov" + id).destroy();
                                        }
                                    }],
                                //buttons
                            }]
                                //items
                    }).show();
    },
    defaultDate(typeStartDate) {
        var day = new Date();
        var dd = day.getDate();
        var mm = day.getMonth() + 1;
        var yy = day.getFullYear() + 543;

        if (typeStartDate == 1) // วันที่เริ่ม -1 เดือน
        {
            dd = "01";
            mm = "0" + mm.toString();
        } else {
            dd = "0" + dd.toString();
            mm = "0" + mm.toString();
        }
        return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
    }
});
Ext.store = new Ext.data.JsonStore(
    {
        storeId: 'myStore',
        autoDestroy: true,
        proxy: new Ext.data.HttpProxy(
            {
                        url: Ext.obj.DAOMain, //
                        timeout: 1200000,
                        method: 'POST'
            }),
        root: 'data',
        baseParams: {
            i_read: user_right_read
        },
        //Permission i_read
        idProperty: 'id',
        totalProperty: 'totalCount',
            //sortInfo:{I field: 'd_doc_date', direction: 'DESC'},
            // vat_rate ,tax_rate ,dc_tax_id_vat ,dc_tax_id_tax
        fields: [
                {name: 'no'
                }, {name: 'f_total_cost_amt1'
                }, {name: 'f_disc_com_amt1'
                }, {name: 'f_net_disc_comm_amt1'
                }, {name: 'f_net_cost_amt1'
                }, {name: 'f_vat_amt1'
                }, {name: 'f_net_cost_add_vat_amt1'
                }, {name: 'txt_status', type: 'string'
                }, {name: 'print_code', type: 'string'
                }, {name: 'c_area_ref_doc', type: 'string'
                }, {name: 'dc_cnt_type_name', type: 'string'
                }, {name: 'dc_comm_name', type: 'string'
                }, {name: 'i_parent', type: 'int'
                }, {name: 'vat_rate', type: 'int'
                }, {name: 'tax_rate', type: 'int'
                }, {name: 'dc_tax_id_vat', type: 'int'
                }, {name: 'dc_tax_id_tax', type: 'int'
                }, {name: 'c_comment2', type: 'string'
                }, {name: 'i_enabled_txt'
                }, {name: 'id'
                }, {name: 'delID'
                }, {name: 'editID'
                }, {name: 'cancelID'
                }, {name: 'c_area_code', type: 'string'
                }, {name: 'c_area_print', type: 'string'
                }, {name: 'bl_code', type: 'string'
                }, {name: 'so_code', type: 'string'
                }, {name: 'txt_pro_type', type: 'string'
                }, {name: 'c_invoice_item'
                }, {name: 'c_ref_code', type: 'string'
                }, {name: 'ar_so_hdr_id'
                }, {name: 'so_contract'
                }, {name: 'so_date'
                }, {name: 'c_billing_addr'
                }, {name: 'print_status'
                }, {name: 'c_billing_date'
                }, {name: 'c_billing_name'
                }, {name: 'ar_bill_invoice_hdr_id'
                }, {name: 'txtar_so_hdr_idID'
                }, {name: 'txtar_bill_invoice_hdr_idID'
                }, {name: 'ar_bill_invoice_hdr_id'
                }, {name: 'ar_so_hdr_id'
                }, {name: 'ar_pre_print_bill_hdr_id'
                }, {name: 'dc_cnt_id', type: 'int'
                }, {name: 'txtdc_cnt_idID', type: 'string'
                }, {name: 'c_cnt_name', type: 'string'
                }, {name: 'dc_product_type_id', type: 'int'
                }, {name: 'c_enable', type: 'string'
                }, {name: 'txt_onair_yyyy_mm', type: 'string'
                }, {name: 'c_name', type: 'string'
                }, {name: 'dc_vat_id',
                }, {name: 'vat_rate',
                }, {name: 'delCancelID',
                }, {name: 'buStatus',
                }, {name: 'condition_pay', type: 'string'
                }, {name: 'onair_yyyy_mm'
                }, {name: 'txt_onair_yyyy_mm', type: 'string'

            }, {
                name: 'bill_close_yyyy_mm'
            }, {
                name: 'txt_close_yyyy_mm',
                type: 'string'
            }, {
                name: 'd_end_credit'
            }, {
                name: 'i_is_show_disc_cash'
            }, {
                name: 'i_is_show_txt_dtl'
            }, {
                name: 'c_comment',
                type: 'string'
            }, {
                name: 'c_billing_inv_des',
                type: 'string'
            }, {
                name: 'order_type',
                type: 'string'
            }, {
                name: 'c_cnt_type',
                type: 'string'
            }, {
                name: 'd_billing_date'
            }, {
                    name: 'd_request_adjust_date'
            }, {
                name: 'd_so_date'
            }, {
                name: 'c_address',
                type: 'string'
            }, {
                name: 'c_tax_value',
                type: 'string'
            }, {
                name: 'c_email',
                type: 'string'
            }, {
                name: 'c_website',
                type: 'string'
            }, {
                name: 'c_fax',
                type: 'string'
            }, {
                name: 'c_mobile',
                type: 'string'
            }, {
                name: 'c_telephone',
                type: 'string'
            }, {
                name: 'c_cnt_type',
                type: 'string'
            }, {
                name: 'due_bill',
                type: 'string'
            }, {
                name: 'channel_name',
                type: 'string'
            }, {
                name: 'c_contract_no',
                type: 'string'
            }, {
                name: 'c_name_inv',
                type: 'string'
            }, {
                name: 'c_address_inv',
                type: 'string'
            }, {
                name: 'condition_pay',
                type: 'string'
            }, {
                name: 'dc_area_id',
                type: 'int'
            }, {
                name: 'c_area_name',
                type: 'string'
            }, {
                    name: 'f_new_net_cost'
            }, {
                    name: 'f_dif_amt' // original f_disc_cash_amt on  bill
            }, {
                    name: 'f_req_amt' // f_new_net_cost f_dif_amt f_req_amt f_vat_amt f_net_cost_add_vat_amt
                }, {
                    name: 'f_vat_amt'

            }, {
                    name: 'f_net_cost_add_vat_amt'
            }, {
                name: 'i_enabled'
            }, {
                name: 'i_is_status'
            }, {
                name: 'create_id'
            }, {
                name: 'create_org_id'
            }, {
                name: 't_create_dt'
            }, {
                name: 'update_id'
            }, {
                name: 'update_org_id'
            }, {
                name: 't_update_dt'
            }]
    });
Ext.storeDtl = new Ext.data.JsonStore(
    {
        storeId: 'myStoreDtl',
        proxy: new Ext.data.HttpProxy(
            {
                        url: Ext.obj.DAODetail,
                timeout: 90000,
            }),
        //baseParams: { mn:'editso', },
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        //sortInfo:{ field: 'i_seq', direction: 'ASC'},
        fields: [
            {
                name: 'no'
            }, {
                name: 'id'
            }, {
                name: 'ar_so_hdr_id'
            }, {
                name: 'ar_so_dtl_id'
            }, {
                name: 'soBill',
                type: 'int'
            }, {
                name: 'billing'
            }, {
                name: 'soDtlID'
            }, {
                name: 'soDtlEditID'
            }, {
                name: 'ap_po_hdr_id'
            }, {
                name: 'f_wht_amt'
            }, {
                name: 'f_net_disc_comm_amt'
            }, {
                name: 'f_vat_amt'
            }, //ยอดรวม vat
            {
                name: 'f_net_vat_amt'
            }, //ยอดรวมทั้งหมดบวก vat f_net_disc_comm_amt+f_vat_amt
            {
                name: 'dc_product_id',
                type: 'int'
            }, {
                name: 'txtdc_product_idID',
                type: 'string'
            }, {
                name: 'c_code',
                type: 'string'
            }, {
                name: 'c_name',
                type: 'string'
            }, {
                name: 'c_comment',
                type: 'string'
            }, {
                name: 'i_enabled',
                type: 'int'
            }, {
                name: 'i_is_jingle'
            }, {
                name: 'i_seq',
                type: 'int'
            }, {
                name: 'c_type'
            }, {
                name: 'f_quan'
            }, {
                name: 'f_total_cost'
            }, {
                name: 'f_disc_com_amt'
            }, {
                name: 'f_disc_com'
            }, {
                name: 'f_disc_cash_amt_bal'
            }, {
                name: 'f_disc_cash'
            }, {
                name: 'f_disc_cash_amt'
            }, {
                name: 'f_net_cost'
            }]
    });
Ext.storeDtled = new Ext.data.JsonStore(
    {
        storeId: 'myStoreBlDtl',
        proxy: new Ext.data.HttpProxy(
            {
                        url: Ext.obj.DAODetailed,
                timeout: 90000,
            }),
        //baseParams: { mn:'editso', },
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        //sortInfo:{ field: 'i_seq', direction: 'ASC'},
        fields: [
            {
                name: 'no'
            }, {
                name: 'id'
            }, {
                name: 'ar_so_dtl_id'

                }, {
                name: 'soBill',
                type: 'int'
            }, {
                name: 'billing'
            }, {
                name: 'soDtlID'
            }, {
                name: 'soDtlEditID'
            }, {
                name: 'ap_po_hdr_id'
            }, {
                name: 'f_wht_amt'
            }, {
                name: 'f_net_disc_comm_amt'
            }, {
                name: 'f_vat_amt'
            }, //ยอดรวม vat
            {
                name: 'f_net_vat_amt'
            }, //ยอดรวมทั้งหมดบวก vat f_net_disc_comm_amt+f_vat_amt
            {
                name: 'dc_product_id',
                type: 'int'
            }, {
                name: 'txtdc_product_idID',
                type: 'string'
            }, {
                name: 'c_code',
                type: 'string'
            }, {
                name: 'c_name',
                type: 'string'
            }, {
                name: 'c_comment',
                type: 'string'
            }, {
                name: 'i_enable',
                type: 'int'
            }, {
                name: 'dc_user_create_id'
            }, {
                name: 'i_is_jingle'
            }, {
                name: 'i_seq',
                type: 'int'
            }, {
                name: 'c_type'
            }, {
                name: 'f_quan'
            }, {
                name: 'f_total_cost'
            }, {
                name: 'f_disc_comm_amt'
            }, {
                name: 'f_disc_com'
            }, {
                name: 'f_disc_cash_amt_bal'
            }, {
                name: 'f_disc_cash'
            }, {
                name: 'f_disc_cash_amt'
            }, {
                name: 'f_net_cost'
            }, {
                name: 'dc_user_create_cost_id'
            }, {
                name: 'd_create'
            }, {
                name: 'dc_user_update_id'
            }, {
                name: 'dc_user_update_cost_id'
            }, {
                name: 'd_update'
            },]
        });
Ext.commentDecStore = new Ext.data.JsonStore(
        {
            autoLoad: true,
            storeId: 'myStoreDc_comment_dec',
            url: './api/dc/DAO/ListDc_comment_dec.php',
            baseParams: {
                type: 'vatStore'
            },
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
            fields: ['id', 'c_code', 'c_name']
        });
function validVat() {
    Ext.select('#f_vat_amtID').on('blur', function () {
        //        Ext.obj.setLog(10);
        //click on load Record Detail in Ext.obj.f_vat_amt
        var f_vat_dtl = parseFloat(Ext.getCmp('f_vat_dtlID').getValue().replace(/,/g, ''));
        //click on load Record Master in f_vat_amtID
        var f_vat_amt = Ext.isEmpty(Ext.getCmp('f_vat_amtID').getValue()) ? 0.00 : parseFloat(Ext.getCmp('f_vat_amtID').getValue().replace(/,/g, ''));
        var v1 = f_vat_dtl + 0.02;
        var v2 = f_vat_dtl - 0.02;
        if (v1 < f_vat_amt || v2 > f_vat_amt) {

            Ext.Msg.alert('Failure', f_vat_dtl.toFixed(2) + ' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท', function () {
                Ext.getCmp('contenterCenter').setActiveTab('contenterCenter');
                Ext.getCmp('contenterCenter').setActiveTab('frm-adj-dtlID');
                Ext.get('f_vat_amtID').dom.focus();
            });
        }
    });
}
function deRemove(id, statusBu) {

    //1 noAction 2 cancel, 3 remove
    //    Ext.obj.setLog(statusBu === 'del' ? 4 : 5); //del or remove
    var txt = (statusBu === 'del') ? 'ลบข้อมูล' : 'ยกเลิกรายการใช้งาน';
    var win = new Ext.Window(
        {
            id: "win-msg-delete-master-sub",
            title: "" + txt,
            modal: true,
            width: 250,
            height: 130,
            loadMask: true,
            html: "ท่านต้องการที่จะ [" + txt + "] ข้อมูล ?",
            buttons: [
                {
                    text: "Confirm",
                    handler: function () {
                        Ext.showLoadingMask();
                        Ext.Ajax.request(
                            {
                                url: 'api/mnTvAddBilling.php',
                                params: {
                                    mode: 'DELETE',
                                    statusBu: statusBu,
                                    id: id
                                },
                                method: 'POST',
                                //POST
                                success: function (result, request) {

                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success) {

                                        if (jsonData.data.invalid)
                                            Ext.MessageBox.alert('Warnning', jsonData.msg);
                                        else
                                            Ext.MessageBox.alert('Success', jsonData.msg, function () {
                                                //before add tab remove
                                                        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-hdrID'), true) || {}; //null obj not errer
                                                        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer
                                            }); // alert massage success
                                    } else {

                                        Ext.MessageBox.alert('Failed', jsonData.msg); // alert massage error
                                    }

                                    Ext.getCmp("win-msg-delete-master-sub").destroy(); // clear memory :: garbage collection
                                    Ext.store.reload(); // reload grid & store
                                },
                                failure: function (result, request) {

                                    Ext.MessageBox.alert('Failed', result.responseText); // connect error
                                }
                            });
                    }
                }, {
                    text: "Cancel",
                    handler: function () {

                        Ext.getCmp("win-msg-delete-master-sub").destroy();
                    }
                }]
        });
    if (statusBu === 1)
        Ext.MessageBox.alert('Warnning', "ปิดการวางบิลรับเงินแล้ว ");
    else if (statusBu === 2)
        Ext.MessageBox.alert('Warnning', "ใบวางบิลถูกผูกกับรายการปรับปรุงหนี้แล้ว ");
    else if (statusBu === 'cancel' || statusBu === 'del' || statusBu === 'enabled')
        win.show();
}
/*
 * mnSoBillingDtl.php
 * i_used
 * **********/
//-------------FROM PRINT----------
function frmPrePrint() {
    frmPrePrint.superclass.constructor.call(this, {
        listeners: {
            afterrender: function (obj, eOpts) { }
        },
        id: 'frm-Add3',
        url: 'api/imc0003_mn.php',
        frame: true,
        autoScroll: true,
        loadMask: true,
        closable: true,
        labelWidth: 1,
        bodyStyle: false,
        items: [
            {
                xtype: 'hidden',
                name: 'mode',
                value: 'GENCODE_IVC',
            }, {
                xtype: 'hidden',
                name: 'type',
                value: 'print_json'
            }, {
                xtype: 'hidden',
                name: 'pj_hdr_id',
                value: Ext.getField.pj_hdr_id
            }, {
                xtype: 'hidden',
                name: 'pj_invoice_hdr_id',
                value: Ext.getField.id
            }, {
                xtype: 'compositefield',
                msgTarget: 'side',
                items: [
                    {
                        xtype: 'textfield',
                        style: {
                            width: '100%',
                            fontWeight: 'bold',
                            paddingLeft: '40%',
                            paddingRight: 'auto',
                            marginBottom: '100px'
                        },
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_business',
                        value: 'บริษัท อสมท จำกัด (มหาชน)'
                    }

                ]

            }, {
                xtype: 'compositefield',
                msgTarget: 'side',
                items: [
                    {
                        xtype: 'displayfield',
                        name: 'lblcnt',
                        value: 'ลูกค้า'
                    }, // c_name_inv i_is_show_txt_dtl
                    {
                        xtype: 'textfield',
                        style: {
                            width: '42%',
                            marginBottom: '10px'
                        },
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_name_inv',
                    }, {
                        xtype: 'displayfield',
                        anchor: '-50',
                        name: 'lbladress',
                        value: 'ที่อยู่'
                    }, {
                        xtype: 'textarea',
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_address_inv',
                    }]
            }, {
                xtype: 'compositefield',
                msgTarget: 'side',
                anchor: '-50',
                items: [
                    {
                        xtype: 'displayfield',
                        name: 'lbldate',
                        value: 'วันที่'
                    }, {
                        xtype: 'textfield',
                        style: {
                            width: '45%',
                            marginBottom: '10px'
                        },
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'd_billing_date',
                    }, {
                        xtype: 'displayfield',
                        name: 'lblc_area_code',
                        value: 'เลขที่'
                    }, {
                        xtype: 'textfield',
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_area_code',
                    }]

            }, {
                xtype: 'compositefield',
                msgTarget: 'side',
                anchor: '-50',
                items: [

                    {
                        xtype: 'displayfield',
                        name: 'lblc_code',
                        value: 'เลขที่ Order'
                    }, {
                        xtype: 'textfield',
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_code',
                    },]
            }, {
                xtype: 'compositefield',
                msgTarget: 'side',
                items: [
                    {
                        xtype: 'displayfield',
                        name: 'lblcontact_no',
                        value: 'เลขที่สัญญา  '
                    }, {
                        xtype: 'textfield',
                        style: {
                            width: '38%',
                            marginBottom: '10px'
                        },
                        readOnly: true,
                        cls: 'frm-hidden',
                        name: 'c_contract_no',
                    }, {
                        xtype: 'displayfield',
                        name: 'lbld_doc_date',
                        value: 'ลงวันที่'
                    }, {
                        xtype: 'textfield',
                        cls: 'frm-hidden',
                        name: 'd_doc_date',
                    },]
            },
            gridDetailPrint()
            /*, {
             html: "<hr>",
             style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
             }*/
        ],
    });
}
//FORM SERACH
function frmSearchMainGrid() {
    frmSearchMainGrid.superclass.constructor.call(this, {
        initComponent: function () {
            frmSearchMainGrid.superclass.initComponent.call(this);
            this.fn(this);
        },
        listeners: {
            afterrender: function () {

            }
        },
        fn: function () { },
        id: 'frm-grid-searchID',
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        width: 600,
        labelWidth: 130,
        defaults: {
            anchor: '0',
        },
        items: [
            {
                xtype: 'compositefield',
                fieldLabel: 'คำที่ค้นหา',
                msgTarget: 'side',
                anchor: '-10',
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        xtype: 'textfield',
                        id: 'val-ID',
                        name: 'value'
                    }, {
                        xtype: 'combo',
                        id: 'filter-ID',
                        store: new Ext.data.SimpleStore(
                            {
                                fields: ["id", "c_name"],
                                    data: [
                                        ['b.c_area_ref_doc', "เลขที่ใบขอปรับปรุงหนี้"],
                                    ['b.c_area_code', "เลขที่ใบวางบิล"],
                                    ['b.c_area_print', "เลขที่พิมพ์ใบวางบิล"], //dc_area_id
                                    ['s.c_code', "เลขที่ Order"],
                                        ['c.c_billing_name', "ชื่อลูกค้า"]
                                    ] //c_area_ref_doc txt_is_status so_code c_billing_name d_request_adjust_date
                                }),

                        value: 'b.c_area_ref_doc',
                        valueField: 'id',
                        displayField: 'c_name',
                        submitValue: true,
                        hiddenName: 'filter',
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
                    }]
            }, {
                xtype: 'compositefield',
                fieldLabel: '&nbsp;&nbsp;ระหว่างวันที่ขอปรับปรุงหนี้',
                msgTarget: 'side',
                items: [{
                        xtype: 'datefield',
                        name: 'startDate',
                        id: 'startDateID',
                        value: Ext.obj.defaultDate(1)
                    }, {
                        xtype: 'datefield',
                        name: 'endDate',
                        id: 'endDateID',
                        value: Ext.obj.defaultDate(2)
                    }]
            }, {
                xtype: 'compositefield',
                fieldLabel: 'สถานะของรายการ',
                msgTarget: 'side',
                anchor: '-10',
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        xtype: 'combo',
                        id: 'i_is_bill_completeID',
                        store: new Ext.data.SimpleStore(
                            {
                                fields: ["id", "c_name"],
                                data: [
                                    ['-1', "เลือกทั้งหมด"],
                                    ['AR', "ยังไม่พิมพ์ใบวางบิล"],
                                    ['BL', "พิมพ์ใบวางบิลแล้ว"]
                                ],
                            }),
                        value: '-1',
                        valueField: 'id',
                        displayField: 'c_name',
                        submitValue: true,
                        hiddenName: 'status_print',
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
                    }, {
                        xtype: 'combo',
                        id: 'enabled-ID',
                        store: new Ext.data.JsonStore(
                            {
                                fields: [
                                    {
                                        name: 'id'
                                    }, {
                                        name: 'c_name'
                                    }],
                                data: [
                                    {
                                        id: '-1',
                                        c_name: 'ทั้งหมด'
                                    }, {
                                        id: '1',
                                        c_name: 'ใช้งาน'
                                    }, {
                                        id: '2',
                                        c_name: 'ไม่ใช้งาน'
                                    }]
                            }),
                        value: '-1',
                        valueField: 'id',
                        displayField: 'c_name',
                        submitValue: true,
                        hiddenName: 'i_enabled',
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
                    }]
            }],
        buttonAlign: 'left',

        buttons: [
            {
                text: 'เพิ่มคำร้องปรับปรุงหนี',
                id: 'buView',
                iconCls: 'icon-add',
                handler: function () {
                    Ext.obj.controllTabAdj({}, 'add'); //controllTabAdj
                }

            }, {
                xtype: 'tbfill'
            }, {
                text: 'ค้นหา',
                iconCls: 'icon-magnifier',
                handler: function () {

                    Ext.store.setBaseParam("mode", "SEARCH");
                    Ext.store.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
                    Ext.store.setBaseParam("value", Ext.getCmp("val-ID").getValue());
                    Ext.store.setBaseParam("i_is_bill_complete", Ext.getCmp("i_is_bill_completeID").getValue());
                    Ext.store.setBaseParam("startDate", Ext.getCmp("startDateID").getValue());
                    Ext.store.setBaseParam("endDate", Ext.getCmp("endDateID").getValue());
                    Ext.getCmp('tabGridMasterID').getStore().load();
                }
            }, {
                text: 'เริ่มใหม',
                iconCls: 'icon-reset', //iconfinder_POWER - RESTART_16946.png
                handler: function () {
                    Ext.getCmp('frm-grid-searchID').getForm().reset();
                }
            }],

    });
}
//TAB GRID&SUMARY DTL VAT TO HDR
function frmAddAdjDtl(i) // BL DTL (i) แสดงข้อมูลอย่างเดียว
{
    var buSelectPro = (i) ? [] : [
        {
            xtype: 'button',
            text: 'ระบุรายการวางบิล',
            id: 'buAddSubDtlID',
            handler: function () {
                Ext.obj.selectProductBilling();
            }
        }];
    var columnDelete = (!i) ? {
        id: 'removePro',
        align: 'center',
        header: "ลบ ",
        width: 50,
        dataIndex: 'soDtlID',
        renderer: function (value, metaData, record, row, col, store, gridView) {
            return (record.get('id') === 'grandTotal') ? '' : value;
        }
    } : {
            id: 'disabledID',
            align: 'center',
            header: "ลบ ",
            width: 50,
            dataIndex: 'soDtlID',
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return '-';
            }

        };
    var dyColumn = [new Ext.grid.RowNumberer(
        {
            width: 35,
            header: " No ",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return record.get('no');
            }
        }), {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: 'id'
    },
        columnDelete, {
        header: "รายการวางบิล",
        width: 210,
        dataIndex: 'c_name'
    }, {
        header: "หัก ณ ที่จ่าย",
        align: 'right',
        dataIndex: 'f_wht_amt',
        hidden: true,
        renderer: function (value, metaData, record, row, col, store, gridView) {
            //grandTotal
            if (record.get('id') === 'grandTotal') {
                Ext.getCmp('f_vat_dtlID').setValue(record.get('f_vat_amt'));
                Ext.getCmp('f_wht_amtID').setValue(record.get('f_wht_amt'));
                Ext.getCmp('f_total_cost_amtID').setValue(record.get('f_total_cost'));
                Ext.getCmp('f_disc_cash_amtID').setValue(record.get('f_disc_com'));
                Ext.getCmp('f_net_cost_amtID').setValue(record.get('f_net_disc_comm_amt'));
                Ext.getCmp('f_net_cost_add_vat_amtID').setValue(record.get('f_net_vat_amt'));
                if (Ext.
                    default.f_vat_amtID !== 1)
                    Ext.getCmp('f_vat_amtID').setValue(record.get('f_vat_amt'));

                Ext.obj.statusBuGenCode(); //2
            }

            return value;
        }
    }, {
        header: "จำนวนครั้ง",
        align: 'right',
        width: 70,
        dataIndex: 'f_quan'
    }, {
        header: "ราคา",
        align: 'right',
        dataIndex: 'f_total_cost'
    }, {
        header: "ส่วนลดการค้า ",
        align: 'right',
        dataIndex: 'f_disc_com'
    }, {
        header: "ส่วนลดการค้า ",
        align: 'right',
        dataIndex: 'f_net_cost'
    }, {
        header: "จำนวนเงินสุทธิ",
        align: 'right',
        dataIndex: 'f_net_disc_comm_amt'
    }, {
        header: "หมายเหตุ",
        dataIndex: 'c_comment',
        width: 70
    }];
    //TODO
    console.log(' dyColumn method' + i);
    var gridDtl2 = {
        xtype: 'grid',
        id: 'tabBlDtlGrid',
        border: false,
        stripeRows: true,
        loadMask: true,
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        store: Ext.storeDtled,
        viewConfig: {
            forceFit: true,
            getCellCls: function (value) {
                console.log(value);
            }
        },
        columns: dyColumn
    };
    frmAddAdjDtl.superclass.constructor.call(this, {
        id: 'frm-adj-dtlID',
        frame: true,
        url: Ext.obj.controllerDetail,
        bodyStyle: "padding:3px",
        autoScroll: true,
        loadMask: true,
        width: 700,
        labelWidth: 145,
        defaults: {flex: 1},
        title: 'แก้ไข/เลือกรายการปรับปรุงหนี้',
        items: [
            {
                xtype: 'hidden',
                name: 'id',
                //value: Ext.getCmp('hdrID').getValue(),
            }, {
                // isEditVatRate
                // isEditVatRate
                xtype: 'hidden',
                name: 'isEditVat',
                id: 'isEditVatID',
                value: false
            }, {
                xtype: 'hidden',
                name: 'mode',
                id: 'modeEditID',
                value: 'GENCODE',
            }, {
                xtype: 'displayfield',
                fieldLabel: 'เดือน/ปี ที่ออกอากาศ',
                name: 'txt_onair_yyyy_mm',
            }, {
                xtype: 'displayfield',
                fieldLabel: 'ประเภทรายได้',
                id: 'disBlDtlTypeProID'

            },
            buSelectPro, gridDtl2, //grid
            {
                html: "<p>&nbsp;</p>",
                style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
            }, {// 
                xtype: 'hidden', //displayfield
                name: 'f_vat_rate',
                value:Ext.getCmp('f_vat_rateID').getValue()
            }, {
                xtype: 'textfield',
                fieldLabel: 'จำนวนเงินรวมทั้งหมด',
                name: 'f_total_cost_amt',
                id: 'f_total_cost_amtID',
                value: 0,
                readOnly: true,
                style: {
                    'labelAlign': 'right',
                    'font-weight': 'bold',
                    'padding': '3px',
                    'margin': '3px',
                    'background-color': '#fff',
                    'text-align': 'right',
                    'width': '200px'
                }
            }, {
                xtype: 'textfield',
                fieldLabel: 'ส่วนลดการค้า',
                name: 'f_disc_cash_amt',
                id: 'f_disc_cash_amtID',
                value: 0,
                readOnly: true, style: {
                    'labelAlign': 'right',
                    'font-weight': 'bold',
                    'padding': '3px',
                    'margin': '3px',
                    'background-color': '#fff',
                    'text-align': 'right',
                    'width': '200px'
                }
            }, {
                xtype: 'textfield',
                fieldLabel: 'จำนวนเงินหลังหักส่วนลด',
                name: 'f_net_cost_amt',
                value: 0,
                id: 'f_net_cost_amtID',
                readOnly: true, style: {
                    'labelAlign': 'right',
                    'font-weight': 'bold',
                    'padding': '3px',
                    'margin': '3px',
                    'background-color': '#fff',
                    'text-align': 'right',
                    'width': '200px'
                }
            }, {
                xtype: 'compositefield',
                fieldLabel: 'จำนวนเงินภาษีมูลค่าเพิ่ม',
                msgTarget: 'side',
                items: [
                    {
                        xtype: 'hidden',
                        name: 'f_vat_dtl',
                        value: 0,
                        id: 'f_vat_dtlID'
                    }, {
                        xtype: 'textfield',
                        value: 0,
                        name: 'f_vat_amt',
                        id: 'f_vat_amtID', style: {
                            'labelAlign': 'right',
                            'font-weight': 'bold',
                            'padding': '3px',
                            'margin': '3px',
                            'background-color': '#fff',
                            'text-align': 'right',
                            'width': '200px'
                        }
                    }, {
                        xtype: 'displayfield',
                        style: 'font-weight:bold;color:red;',
                        value: '<p>!! หมายเหตุ จำนวนเงินภาษีมูลค่าเพิ่ม แก้ไขได้ไม่เกิน (+/-) 0.02 บาท</p>'


                    }]

            }, {
                xtype: 'textfield',
                fieldLabel: 'จำนวนเงินรวมภาษีมูลค่าเพิ่ม',
                name: 'f_net_cost_add_vat_amt',
                value: 0,
                id: 'f_net_cost_add_vat_amtID',
                readOnly: true, style: {
                    'labelAlign': 'right',
                    'font-weight': 'bold',
                    'padding': '3px',
                    'margin': '3px',
                    'background-color': '#fff',
                    'text-align': 'right',
                    'width': '200px'
                }
            }, {
                html: "<div>&nbsp;</div>",
                style: 'background:eee !important; display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
            }, {
                xtype: 'textfield',
                fieldLabel: 'จำนวนเงินภาษีหัก ณ ที่จ่าย ',
                name: 'f_wht_amt',
                value: 0,
                id: 'f_wht_amtID',
                readOnly: true, style: {
                    'labelAlign': 'right',
                    'font-weight': 'bold',
                    'padding': '3px',
                    'margin': '3px',
                    'background-color': '#fff',
                    'text-align': 'right',
                    'width': '200px'
                }
            }],
        buttonAlign: 'left',
        listeners: {
            beforerender: function () {
                Ext.showLoadingMask();
            },
            afterrender: function () {
                //                var f_vat_amt = Ext.getCmp('f_vat_amtID').getValue();
                //                var f_vat_dtl = Ext.getCmp('f_vat_dtlID').getValue();
                //                if (f_vat_amt))
                //                    Ext.getmp('f_vat_amtID').setValue(0);
                //                if (Ext.isEmpt(f_vat_dtl))
                //                    Ext.getmp('f_vat_dtlID').setValue(0);
            }

        },
        buttons: [
            {
                text: ' ออกเลข ARXX',
                id: 'buGenCodeID',
                iconCls: 'icon-save',
                listeners: {
                    afterrender: function () {
                        // console.log(Ext.isEdit('f_vat_amtID', true));
                    } //afterrender
                },
                handler: function () {

//                     var isEdit = Ext.glob.isEdit('f_vat_amtID'); //  true fals
//                     isEditVatID
//                     console.log("isEdit ::: ");
//                     console.log(isEdit);
//                     if (isEdit)
//                     Ext.getCmp('isEditVatID').setValue(true);

                    var form = Ext.getCmp('frm-adj-dtlID').getForm();
                    //                    Ext.obj.setLog(8);

                    form.submit(
                        {
                            waitMsg: 'Saving Data...',
                            success: function (form, action) {

                                var c_code = Ext.getCmp('c_area_codeEditDisID').getValue();
                                if (c_code === '0')
                                    Ext.Msg.alert('Success', action.result.data.c_code, function () {
                                            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-hdrID'), true) || {}; //null obj not errer
                                            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer
                                        Ext.store.reload();
                                    });
                                else // update f_vat_amt 0.02
                                    Ext.Msg.alert('Success', 'บันทีกรายการเรียบร้อย', function () {
                                            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-hdrID'), true) || {}; //null obj not errer
                                            Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-adj-dtlID'), true) || {}; //null obj not errer
                                        Ext.store.reload();
                                    });
                            },
                            failure: function (form, action) {
                                switch (action.failureType) {

                                    case Ext.form.Action.CLIENT_INVALID:

                                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:

                                        Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:

                                        Ext.Msg.alert('Failure', action.result.msg);
                                }
                            }
                        });
                }
            }]

    });
}
//CHECK SELECT SO DTL TO BL DTL
function getChk(obj) {
    if (obj.checked)
        Ext.obj.i_soDtl++;
    else
        Ext.obj.i_soDtl--;
}

Ext.extend(frmPrePrint, Ext.FormPanel, {});
Ext.extend(frmSearchMainGrid, Ext.FormPanel, {});
Ext.extend(frmAddAdjHdr, Ext.FormPanel, {});
Ext.extend(frmAddAdjDtl, Ext.FormPanel, {});
//----------RUNAPP-----------------
Ext.onReady(function () {
    //   Ext.showLoadingMask();
    Ext.QuickTips.init();
    Ext.obj.right();
    Ext.default = Ext.apply({
                f_vat_rate: null
    });
    var gridMain = {
        region: 'center',
        title: Ext.obj.title_gridMain_th,
        // 'แสดงข้อมูลรายการวางบิลแล้ว Billing',
        xtype: 'grid',
        id: 'tabGridMasterID',
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store,
        listeners: {
            render: function (grid) {

//                grid.getView().el.select('.x-grid3-header').setStyle('display', 'none');

            }

        },
        tbar: [new frmSearchMainGrid()],
        defaults: {
            flex: 1
        },
        columns: [
            new Ext.grid.RowNumberer(
                {
                        width: 35,
                    header: " No ",
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        return record.get('no');
                    }
                    }), {
                header: "ID System",
                sortable: true,
                hidden: true,
                dataIndex: 'id'
            }, {
                header: "แก้ไข",
                sortable: false,
                align: 'center',
                id: 'edit',
                width: 30,
                dataIndex: 'id',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    //../images/icons/book_addresses_edit.png => images/icons/billing-icon.png
                    return '<img src="images/icons/billing-icon.png"); align="center" style="cursor:pointer"/>';
                }
            }, {
                        header: "เลขที่ขอปรับปรุงหนี้", sortable: true, width: 60, dataIndex: 'c_area_ref_doc',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return value + '' + record.get('print_code');
                }

            }, {
                /******เลขที่ใบขอปรับปรุงหนี้	สถานะ	วันที่ขอปรับปรุงหนี้	เลขที่ใบวางบิล/ใบแจ้งหนี้	เลขที่พิมพ์ใบวางบิล/ใบแจ้งหนี้	เลขที่ Order	ชื่อลูกค้า
                 จำนวนเงิน / ที่วางบิล/แจ้งหนี้	 || ยอดที่ถูกต้อง	 || จำนวนเงิน / ที่ขอปรับลด	 || ภาษีมูลค่าเพิ่ม	 || จำนวนเงิน / ที่ขอปรับลดรวมภาษี*/
                header: "สถานะ",
                width: 32,
                dataIndex: 'txt_status'
            }, {
                header: "วันที่ขอปรับปรุงหนี้", sortable: true, width: 50, dataIndex: 'd_request_adjust_date', renderer: Ext.shortThaiDate

            }, {

                header: "เลขที่ใบวางบิล/ใบแจ้งหนี้", sortable: true, hidden: true, width: 58, dataIndex: 'c_area_code'
            }, {
                header: "เลขที่พิมพ์ใบวางบิล/ใบแจ้งหนี้", sortable: true, width: 66, dataIndex: 'c_area_print'
            }, {
                header: "เลขที่ Order", sortable: true, width: 40, dataIndex: 'so_code'
            }, {
                header: "ชื่อลูกค้า", sortable: true, width: 120, dataIndex: 'c_cnt_name'
            }, {
                header: 'จำนวนเงิน/ที่วางบิลแจ้งหนี้', align: 'right', dataIndex: 'f_new_net_cost', width: 65, sortable: true
            }, {
                header: 'ยอดที่ถูกต้อง', align: 'right', dataIndex: 'f_dif_amt', width: 40, sortable: true
            }, {
                header: 'จำนวนเงิน/ที่ขอปรับลด', align: 'right', dataIndex: 'f_req_amt', width: 55, sortable: true
            }, {
                header: "ภาษีมูลค่าเพิ่ม", align: 'right', sortable: true, width: 55, dataIndex: 'f_vat_amt'
            }, {
                header: 'จำนวนเงิน/ที่ขอปรับลดรวมภาษี', align: 'right', dataIndex: 'f_net_cost_add_vat_amt', width: 70, sortable: true
            }, {
                header: "ลบ",
                sortable: false,
                align: 'center',
                id: 'delID',
                width: 30,
                dataIndex: 'delID',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    metaData = 'align="left" style="cursor:pointer"';
                    return value;
                }
            }, {
                header: "ยกเลิก/ใช้งาน",
                sortable: false,
                align: 'center',
                id: 'cancelID',
                width: 50,
                dataIndex: 'cancelID',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    metaData = 'align="right" style="padding-right:10px !important; cursor:pointer"';
                    return value;
                }
            }, {

                header: "ผู้ที่สร้าง",
                hidden: true,
                sortable: true,
                dataIndex: 'create_id'
            }, {
                header: "วันที่สร้าง",
                hidden: true,
                sortable: true,
                dataIndex: 't_create_dt',
                renderer: Ext.shortThaiDate
            }, {
                header: "หน่วยงานผู้สร้าง",
                hidden: true,
                sortable: true,
                dataIndex: 'create_org_id'
            }, {
                header: "ผู้แก้ไข",
                hidden: true,
                sortable: true,
                dataIndex: 'update_id'
            }, {
                header: "วันที่แก้ไข",
                hidden: true,
                sortable: true,
                dataIndex: 't_update_dt',
                renderer: Ext.shortThaiDate
            }, {
                header: "หน่วยงานผู้แก้ไข",
                hidden: true,
                sortable: true,
                dataIndex: 'update_org_id'
            }],
        viewConfig: {
            forceFit: true
        },
        bbar: new Ext.PagingToolbar(
            {
                pageSize: 20,
                store: Ext.store,
                displayInfo: true,
                displayMsg: 'แสดงรายการ {0} - {1} of {2}'
            })
    };
    new Ext.Viewport(
        {
            layout: 'border',
                items: [{
                    border: false,
                        region: 'center',
                        xtype: 'tabpanel',
                    id: 'contenterCenter',
                    defaults: {
                        autoScroll: true
                    },
                    items: [gridMain],
                        resizeTabs: true,
                        minTabWidth: 200,
                        tabWidth: 300,
                        enableTabScroll: true,
                        listeners: {
                            afterrender: function () {
                                Ext.getCmp('contenterCenter').setActiveTab('tabGridMasterID');
                                Ext.store.reload();
                                Ext.getCmp('tabGridMasterID').on('cellclick', Ext.obj.cellClick, this);
                                ///
                                Ext.storeSo = Ext.obj.storeSo();
                                Ext.storeBl = Ext.obj.storeBl();

                            },
                            afteradd: function (obj, ownerCt, index) { },
                            tabchange: function (tabPanel, newTab, oldTab, eOpts) {
                                console.log(newTab.id);
                                Ext.getCmp(newTab.id).doLayout();
                            },
                            remove: function (obj, cp) {
                                // console.log(obj.getId());
                            }
                        }
                    }]

        });
});