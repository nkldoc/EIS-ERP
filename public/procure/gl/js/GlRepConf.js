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
    defaultDate: function (typeStartDate) {
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
    },
});

Ext.hdrID = null;
Ext.eventGrid = Ext.apply({
    click: '',
    click2: '',

});

Ext.getStoreRecord = function (store, value) {
    for (i = 0; i < store.data.length; i++) {
        var rec = store.data.items[i];
        if (value == rec.data.id) {
            return rec;
        }
    }// loop 
}; //


// หมวดผังบัญชี
Ext.i_cal_method1 = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: [

        {id: 1, c_name: "-  ยอดรวมของ ผลต่าง เดบิต-เครดิต"},
        {id: 2, c_name: "-  ยอดรวมของ ผลต่าง เครดิต-เดบิต"}
    ]
});

Ext.i_cal_method2 = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: [

        {id: 1, c_name: "-  ยอดรวมของ ผลต่าง ยอดยกมาเดบิต-ยอดยกมาเครดิต "},
        {id: 2, c_name: "-  ยอดรวมของ ผลต่าง ยอดยกมาเครดิต-ยอดยกมาเดบิต"},

        {id: 3, c_name: "-  ยอดรวมของ ผลต่าง เดบิต-เครดิต"},
        {id: 4, c_name: "-  ยอดรวมของ ผลต่าง เครดิต-เดบิต"},

        {id: 5, c_name: "- ยอดรวมของ ผลต่าง ยอดยกไปเดบิต-ยอดยกไปเครดิต"},
        {id: 6, c_name: "- ยอดรวมของ ผลต่าง ยอดยกไปเครดิต-ยอดยกไปเดบิต"},
    ]
});
Ext.calAcc = Ext.apply({
    i_source: null,
    i_source_item: null,
    i_source_item1: null,
    i_source_item2: null,

    i_is_acc: false,
    getVal: function () {
        var i_show = Ext.getCmp('i_showID').getValue().inputValue || {};



        if (i_show == 1 || i_show == 3) {
            Ext.calAcc.i_source_item = null;
            Ext.calAcc.i_source = null;
            Ext.getCmp('i_cal_method1ID').hide();
            Ext.getCmp('i_cal_method2ID').hide();

        } else {

            var i_source = Ext.getCmp('i_sourceID').getValue().inputValue || {};
            var item1 = Ext.getCmp('i_cal_method1ID').getValue() || {};
            var item2 = Ext.getCmp('i_cal_method2ID').getValue() || {};



            if (i_source == 1) {
                Ext.calAcc.i_source_item = item1;
                Ext.getCmp('i_cal_method1ID').show();
            } else {
                Ext.calAcc.i_source_item = item2;
                Ext.getCmp('i_cal_method2ID').show();
            }

            Ext.calAcc.i_source = i_source;
        }




    },
});

function controllTab(record, butt) {

    Ext.eventGrid.click = butt;


    if (butt == 'add') {

        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer

        var frmSoHdr = new formSoHdr();
        Ext.getCmp('contenterCenter').add(frmSoHdr);
        Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);
        Ext.getIshow();
        Ext.calAcc.getVal();
        //Default Cost Ext.session 

        DisbledButton(false, 'add');

    } else if (butt == 'edit' || butt == 'view' || butt == 'addEdit') {

        Ext.hdrID = record.get('id');
        Ext.calAcc.i_is_acc = record.get('i_is_acc');

        //------------------||------------//
        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
        Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
        //----------------- ||------------//

        var frmSoHdr = new formSoHdr();
        Ext.getCmp('contenterCenter').add(frmSoHdr);
        Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);
        frmSoHdr.getForm().loadRecord(record);

        if (record.get('i_show') != 1 && record.get('i_show') != 3 && record.get('i_show') != 8 && record.get('i_show') != 9) {


            var frmSoDtl = new formSoDtl();

            Ext.getCmp('contenterCenter').add(frmSoDtl);
            Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);
            Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);

            Ext.getCmp('frm-so-hdrID').getEl().mask("Please wait...", "x-mask-loading");




            Ext.storeDtl.reload({
                params: {mode: 'GETDATA', id: Ext.getCmp('hdrID').getValue()},
                callback: function (records, operation, success) {
                    if (success) {

                        var store = records;
                        var i;
                        //*************gen combo radio 							
                        Ext.apply(Ext.form.RadioGroup, {rr: null, com1Id: null, com2Id: null});
                        Ext.apply(Ext.form.ComboBox, {rr: null
                            , com1Id: null
                            , com2Id: null
                            , i_source: null
                            , i_source_item: null
                        });
                        for (i = 0; i < records.length; i++) {

                            var val = records[i].get("i_source");

                            var i_source = record.get("i_source");
                            var i_source_item = records[i].get("i_source_item");

                            var rr = 'sub_i_sourceID' + records[i].get("id");
                            var com1Id = "sub_i_cal_method1ID" + records[i].get("id");
                            var com2Id = "sub_i_cal_method2ID" + records[i].get("id");
                            var com1Name = "sub_i_source_item1Name" + records[i].get("id");
                            var com2Name = "sub_i_source_item2Name" + records[i].get("id");

                            var rd = new Ext.form.RadioGroup({
                                fieldLabel: 'แหล่งที่มาของเงิน',
                                xtype: 'radiogroup',
                                id: 'sub_i_sourceID' + records[i].get("id"),
                                renderTo: "radioID" + records[i].get("id"),
                                rr: rr,
                                com1Id: com1Id,
                                com2Id: com2Id,
                                value: records[i].get("i_source"),
                                columns: [180, 110],
                                items: [
                                    {boxLabel: 'บันทึกระหว่างงวด (GX/GL)', checked: true, name: 'sub_i_source' + records[i].get("id"), inputValue: 1},
                                    {boxLabel: 'ประมวลผลลงบัญชี', name: 'sub_i_source' + records[i].get("id"), inputValue: 2}
                                ],
                                listeners: {
                                    change: function (cb, rec, ind) {
                                        if (rec.inputValue == 1)
                                            this.fnValue(rec.inputValue);
                                        else
                                            this.fnValue(rec.inputValue);
                                    },
                                    afterrender: function (obj, eOpts) {

                                        this.fnValue = function (id) {

                                            if (id == 1) {
                                                Ext.getCmp(this.com1Id).show();
                                                Ext.getCmp(this.com2Id).hide();

                                                //if(Ext.getCmp(this.com2Id).getValue()>2)Ext.getCmp(this.com1Id).setValue(1);

                                            } else {
                                                Ext.getCmp(this.com1Id).hide();
                                                Ext.getCmp(this.com2Id).show();

                                            }
                                        };
                                        //this.setValue({'sub_i_source'+this.i:'inputValue'});
                                        //rec.inputValue
                                    },
                                },
                            });



                            var com1 = new Ext.form.ComboBox({
                                id: com1Id,
                                name: com1Name,
                                store: Ext.i_cal_method1,
                                renderTo: "combo" + records[i].get("id"),
                                rr: rr,
                                com1Id: com1Id,
                                com2Id: com2Id,

                                fieldLabel: "สูตรคำนวณ",
                                hiddenName: com1Name,
                                valueField: "id",
                                displayField: "c_name",

                                mode: "local",
                                triggerAction: "all",
                                emptyText: "กรุณาเลือก...",
                                width: 400,
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false, //dc_acc_id 
                                value: records[i].get("i_source_item1"),
                                listeners: {
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
                                    afterrender: function () {
                                        if (Ext.calAcc.i_is_acc) {
                                            if (this.rr == 1)
                                                this.show();
                                            else
                                                this.show();
                                        } else {
                                            this.hide();
                                        }

                                    },
                                },

                            });
                            var com2 = new Ext.form.ComboBox({
                                id: com2Id,
                                name: com2Name,
                                store: Ext.i_cal_method2,
                                renderTo: "combo" + records[i].get("id"),
                                rr: rr,
                                com1Id: com1Id,
                                com2Id: com2Id,
                                fieldLabel: "สูตรคำนวณ",
                                hiddenName: com2Name,
                                valueField: "id",
                                displayField: "c_name",
                                mode: "local",
                                triggerAction: "all",
                                emptyText: "กรุณาเลือก...",
                                width: 400,
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: true,
                                value: records[i].get("i_source_item2"),
                                listeners: {
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

                                    afterrender: function () {

                                        this.fnValue = function () {

                                            if (Ext.getCmp(this.rr).getValue().inputValue == 1) {
                                                Ext.getCmp(this.com1Id).show();
                                                Ext.getCmp(this.com2Id).hide();

                                            } else {
                                                Ext.getCmp(this.com1Id).hide();
                                                Ext.getCmp(this.com2Id).show();
                                            }

                                        };

                                        this.fnValue(Ext.getCmp(this.rr).getValue().inputValue);
                                    },
                                },

                            });


                        }//End Loop
                        Ext.getCmp('frm-so-hdrID').getEl().unmask("Please wait...", "x-mask-loading");
                        Ext.calAcc.getVal();


                    }
                },
            });


        } else {
            //------------------||------------//

            //----------------- ||------------//
            Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);

        }
        //เงื่อนไขการโชว์ UI



        //-----------------
        Ext.getCmp('modeID').setValue('EDIT');
        if (butt == 'view') {
            DisbledButton(true, {});
            //Ext.storeDtl.setBaseParam("accessData", "view");

        } else {
            DisbledButton(false, {});

            //Ext.storeDtl.setBaseParam("accessData", "edit");
        }

        //-----------------




    } else if (butt == 'remove') {

        var win = new Ext.Window({
            id: "win-msg-delete",
            title: "Remove",
            modal: true,
            width: 250,
            height: 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons: [
                {
                    text: "Confirm",
                    handler: function () {
                        Ext.Ajax.request({
                            url: 'api/mnGlRepActivity.php',
                            params: {
                                mode: 'DELETE',
                                id: record.get('id'),
                            },
                            method: 'GET', //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                if (jsonData.success) {

                                    //------------------||------------//
                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer

                                    if (jsonData.data.enabledDelete) {
                                        Ext.MessageBox.alert('Success', jsonData.msg);
                                        Ext.getCmp("win-msg-delete").destroy();
                                        Ext.getCmp('tabpanel1').getStore().reload();

                                    } else {
                                        Ext.MessageBox.alert((jsonData.data.status == 'delete' ? 'Success' : 'Failed'), jsonData.msg);
                                        Ext.getCmp("win-msg-delete").destroy();
                                        Ext.getCmp('tabpanel1').getStore().reload();
                                    }

                                } else {
                                    Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error

                                    Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
                                    Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
                                    Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
                                }
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert('Failed', result.responseText);		// connect error
                            }
                        });
                    }
                },
                {
                    text: "Cancel",
                    handler: function () {
                        Ext.getCmp("win-msg-delete").hide();
                        Ext.getCmp("win-msg-delete").destroy();
                        Ext.getCmp('tabpanel1').getStore().reload();
                    }
                }
            ]
        }).show();

    }

    //console.log(Ext.eventGrid);
}
; //End

function cellClick(grid, rowIndex, columnIndex, e)
{
    var record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
        controllTab(record, 'edit');
    } else if (columnIndex == grid.getColumnModel().getIndexById('view')) {
        controllTab(record, 'view');
    } else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
        controllTab(record, 'remove');
    }
}
;

function DisbledButton(t) {
    //Disabled etc...
    if (t) {
        Ext.getCmp('buSaveID').hide();
        if (!Ext.isEmpty(Ext.getCmp('buSave1ID')))
            Ext.getCmp('buSave1ID').hide();

    } else {
        Ext.getCmp('buSaveID').show();
        if (!Ext.isEmpty(Ext.getCmp('buSave1ID')))
            Ext.getCmp('buSave1ID').show();
    }
}

//Class Extend gl_dc_activity

var gl_dc_activityStore = new Ext.data.JsonStore({
    //autoDestroy: true,
    autoLoad: true,
    url: "api/All_GlRepActivity.php",
    baseParams: {mode: "gl_dc_activity", select: "empty"}, //select
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"]
});

formSoHdr = function () {
    formSoHdr.superclass.constructor.call(this, {
        listeners: {
            afterrender: function (obj, eOpts) { /*console.log('Load Finish'); */
            },
        },
        id: 'frm-so-hdrID',
        url: 'api/mnGlRepActivity.php',
        frame: true,
        bodyStyle: "padding:0px",
        autoScroll: true,
        loadMask: true,
        width: 700,
        labelWidth: 180,
        bodyStyle: "padding:5px",
        defaults: {flex: 1, },

        title: 'บันทึกการสร้างรายงาน งบกระแสเงินสด',
        items: [{
                id: "frm-mode",
                xtype: "hidden",
                name: "mode",
                value: 'ADD',
                readOnly: true
            }, {
                xtype: 'hidden', name: 'mode', id: 'modeID', value: 'ADD' //
            }, {
                xtype: "hidden",
                name: "id",
                id: 'hdrID',
            }, {
                xtype: "hidden",
                id: "i_levelID",
                name: "i_level",
                value: 1,
            }, {
                xtype: 'textfield',
                fieldLabel: 'บรรทัดที่',
                width: 50,
                name: 'i_row',
                validator: function (val) {
                    var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)?$/;
                    if (!regex.test(val))
                    {
                        return "กรุณาระบุ ตำแหน่งบรรทัดที่จะโชว์ในรายงาน";
                    } else {
                        return true;
                    }
                },
            }, {
                xtype: 'textfield',
                fieldLabel: 'ข้อความ',
                width: '80%',
                name: 'c_name',
                validator: function (val) {
                    if (!Ext.isEmpty(val)) {
                        return true;
                    } else {
                        return "กรุณาระบุ ข้อความ";
                    }
                }
            }, {
                fieldLabel: 'เลือกประเภทหัวข้อ',
                xtype: 'radiogroup',
                id: 'i_showID',
                columns: [400],
                items: [
                    {boxLabel: 'Groupใหญ่ [Level1] <span style="color:red;">*(หัวข้อ ไม่เลือกบัญชี)</span>', checked: true, name: 'i_show', inputValue: 1},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;หัวข้อหลักไม่มีรายละเอียดย่อย [Level2]', name: 'i_show', inputValue: 2},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;หัวข้อหลักมีรายละเอียดย่อย [Level2]<span style="color:red;">*(หัวข้อ ไม่เลือกบัญชี)</span>', name: 'i_show', inputValue: 3},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;หัวข้อย่อย[Level3]', name: 'i_show', inputValue: 4},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;สรุปท้ายหัวข้อหลักไม่มีรายละเอียดย่อย[Level2]', name: 'i_show', inputValue: 5},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;สรุปท้ายหัวข้อหลักมีรายละเอียดย่อย[Level2]', name: 'i_show', inputValue: 6},
                    {boxLabel: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;สรุปท้ายหัวข้อย่อย[Level3]', name: 'i_show', inputValue: 7},
                    {boxLabel: 'สรุปท้าย Groupใหญ่[Level1]', name: 'i_show', inputValue: 8},
                    {boxLabel: 'หัวข้อสรุปท้ายรายงาน[Level1]', name: 'i_show', inputValue: 9},
                ],
                listeners: {
                    change: function (cb, rec, ind) {
                        if (rec.inputValue == 1)
                            this.fnValue(rec.inputValue);
                        else
                            this.fnValue(rec.inputValue);
                    },
                    afterrender: function (obj, eOpts) {
                        this.fnValue = function (id) {
                            Ext.calAcc.getVal();
                            if (id == 1 || id == 3 || id == 8 || id == 9) {

                                Ext.getCmp('i_sourceID').hide();
                                Ext.getCmp('i_cal_method1ID').hide();
                                Ext.getCmp('i_cal_method2ID').hide();
                                Ext.getCmp('f_totalID').hide();

                            } else {

                                Ext.getCmp('i_sourceID').show();
                                Ext.getCmp('f_totalID').show();

                                if (Ext.getCmp('i_sourceID').getValue().inputValue == 1) {
                                    Ext.getCmp('i_cal_method1ID').show();
                                    Ext.getCmp('i_cal_method2ID').hide();
                                } else {

                                    Ext.getCmp('i_cal_method1ID').hide();
                                    Ext.getCmp('i_cal_method2ID').show();
                                }
                            }


                        };
                        this.fnValue(this.getValue().inputValue);
                    }
                },
            }, {
                xtype: 'combo',
                id: 'gl_dc_activity_idID',
                store: gl_dc_activityStore,
                fieldLabel: 'กิจกรรม',
                valueField: 'id',
                width: 300,
                displayField: 'c_name',
                hiddenName: 'gl_dc_activity_id',
                mode: "local",
                triggerAction: "all",
                editable: false,
                forceSelection: true,
                value: 0,
                //emptyText: "- ไม่เลือก -",

            }, {
                fieldLabel: 'แหล่งที่มาของเงิน',
                xtype: 'radiogroup',
                id: 'i_sourceID',
                columns: [180, 110],
                items: [
                    {boxLabel: 'บันทึกระหว่างงวด (GX/GL)', checked: true, name: 'i_source', inputValue: 1}, /* 1,2*/
                    {boxLabel: 'ประมวลผลลงบัญชี', name: 'i_source', inputValue: 2}/* 1,2,3,4*/
                ],
                listeners: {
                    change: function (cb, rec, ind) {
                        if (rec.inputValue == 1)
                            this.fnValue(rec.inputValue);
                        else
                            this.fnValue(rec.inputValue);
                    },
                    afterrender: function (obj, eOpts) {
                        this.fnValue = function (id) {
                            Ext.calAcc.getVal();
                            if (id == 1) {
                                //Level 1 
                                Ext.getCmp('i_cal_method1ID').show();
                                Ext.getCmp('i_cal_method2ID').hide();


                            } else {
                                //Level 3 
                                Ext.getCmp('i_cal_method1ID').hide();
                                Ext.getCmp('i_cal_method2ID').show();
                            }
                        };

                    }
                },

            },
            new Ext.form.ComboBox({
                id: "i_cal_method1ID",
                name: "i_source_item1",
                fieldLabel: "สูตรคำนวณ",
                hiddenName: "i_source_item1",
                store: Ext.i_cal_method1,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 400,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                value: 1,
                listeners: {
                    beforequery: function (q) {
                        if (q.query) {
                            var length = q.query.length;
                            q.query = new RegExp(Ext.escapeRe(q.query));
                            q.query.length = length;
                        }
                    },
                    blur: function () {
                        this.getStore().clearFilter();
                        Ext.calAcc.getVal();
                    }
                }
            }),
            new Ext.form.ComboBox({
                id: "i_cal_method2ID",
                name: "i_source_item2",
                store: Ext.i_cal_method2,
                fieldLabel: "สูตรคำนวณ",
                hiddenName: "i_source_item2",
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 400,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                value: 1,
                listeners: {
                    //afterrender:function(){ this.hide();},
                    beforequery: function (q) {
                        if (q.query) {
                            var length = q.query.length;
                            q.query = new RegExp(Ext.escapeRe(q.query));
                            q.query.length = length;
                        }
                    },
                    blur: function () {
                        this.getStore().clearFilter();
                        Ext.calAcc.getVal();
                    },
                    afterrender: function () {
                        Ext.calAcc.getVal();
                    },
                },

            }), {
                xtype: 'textfield',
                fieldLabel: 'ค่าเริ่มต้น',
                width: '80%',
                width: 200,
                name: 'f_total',
                id: 'f_totalID',
                afterrender: function (obj, eOpts) {
                    var id = Ext.getCmp('i_showID').getValue().inputValue;
                    if (id == 1 || id == 3 || id == 8 || id == 9)
                        this.hide();
                    else
                        this.show();

                }
            }],
        buttonAlign: 'left',
        buttons: [{
                text: 'บันทึกรายการ',
                id: 'buSaveID',
                iconCls: 'icon-save',
                listeners: {
                    afterrender: function () {

                    }
                },
                handler: function () {

                    function checkUi() {

                        var id = Ext.getCmp('i_showID').getValue().inputValue;
                        var idID = Ext.getCmp('gl_dc_activity_idID').getValue();
                        
                        //console.log(id+'<>'+idID);
                        /*
                         if ((id == 1 || id == 8 || id == 9) && idID == '') {
                         Ext.Msg.alert('Failure', 'กรุณาระบุ กิจกรรม');
                         return false;
                         } else {
                         return true;
                         }*/
                        return true;
                    }
                    ;
                    var form = Ext.getCmp('frm-so-hdrID').getForm();

                    if (form.isValid() && checkUi()) {
                        form.submit({
                            waitMsg: 'Saving Data...',
                            success: function (form, action) {
                                Ext.Msg.alert('Success', action.result.msg, function () {

                                    Ext.getCmp('hdrID').setValue(action.result.data.id);

                                    Ext.store.reload({
                                        params: {i_read: user_right_read},
                                        callback: function (records, operation, success) {
                                            if (success) {
                                                var record = Ext.getStoreRecord(this, Ext.getCmp('hdrID').getValue());

                                                if (record.get('i_show') != 1 && record.get('i_show') !=3 && record.get('i_show') !=8 && record.get('i_show') !=9) {
                                                    controllTab(record, 'addEdit');
                                                } else {

                                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
                                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer

                                                }

                                            }
                                        }
                                    });


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
                    } //else 

                }
            }, {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
                }
            }]
    });
};

Ext.extend(formSoHdr, Ext.FormPanel, {});

Ext.getIshow = function (id) {

    if (Ext.getCmp('i_sourceID').getValue().inputValue) {
        Ext.getCmp('i_sourceID').hide();
        Ext.getCmp('i_cal_method1ID').hide();
        Ext.getCmp('i_cal_method2ID').hide();

    } else {
        Ext.getCmp('i_sourceID').show();
        if (Ext.getCmp('i_sourceID').getValue().inputValue == 1) {
            Ext.getCmp('i_cal_method1ID').show();
            Ext.getCmp('i_cal_method2ID').hide();
        } else {
            Ext.getCmp('i_cal_method1ID').hide();
            Ext.getCmp('i_cal_method2ID').show();
        }
    }
};
Ext.store = new Ext.data.JsonStore({
    storeId: 'myStore',
    autoDestroy: true,
    autoLoad: true,
    url: 'api/ListGlRepActivity.php',
    root: 'data',
    baseParams: {i_read: user_right_read}, //Permission i_read
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
        {name: 'no'},
        {name: 'gl_dc_activity_id'},
        {name: 'id'},
        {name: 'i_row'},
        {name: 'i_is_acc', type: 'boolean'},
        {name: 'i_source'},
        {name: 'i_source_item'},
        {name: 'i_source_item1'},
        {name: 'i_source_item2'},
        {name: 'i_level'},
        {name: 'i_show'},
        {name: 'f_total'},
        {name: 'c_name'},
        {name: 'c_comment'},
        {name: 'i_enable'},
        {name: 'dc_user_create_id'},
        {name: 'dc_user_create_cost_id'},
        {name: 'd_create'},
        {name: 'dc_user_update_id'},
        {name: 'dc_user_update_cost_id'},
        {name: 'd_update'}
    ]
});

Ext.storeDtl = new Ext.data.JsonStore({
    storeId: 'myStoreDtl',
    url: 'api/ListGlDcAccRep.php',
    root: 'data',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {type: 'DTL', hdrID: Ext.hdrID}, //Permission i_read 
    fields: [
        {name: 'no'},
        {name: 'id'},
        {name: 'c_name'},
        {name: 'checkbox'},
        {name: 'radioID'},
        {name: 'comboID'},
        {name: 'dc_acc_id'},
        {name: 'i_source'},
        {name: 'i_group'},
        {name: 'i_source_item'},
        {name: 'i_source_item1'},
        {name: 'i_source_item2'},
    ]
});

function checkAll(ele, i_group) {
    var checkboxes = document.getElementsByName('dc_acc_id[' + i_group + '][]'); //dc_acc_id[1]

    if (ele.checked) {
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].type == 'checkbox') {
                checkboxes[i].checked = true;
            }
        }
    } else {
        for (var i = 0; i < checkboxes.length; i++) {

            if (checkboxes[i].type == 'checkbox') {
                checkboxes[i].checked = false;
            }
        }
    }
}

formSoDtl = function () {
    Ext.i_group = 0;
    var gridDtl = {
        xtype: 'grid',
        id: 'tabSoDtlGrid',
        border: false,
        stripeRows: true,
        loadMask: true,
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        store: Ext.storeDtl,
        viewConfig: {forceFit: true, getCellCls: function (value) { }},
        columns: [
            /*  new Ext.grid.RowNumberer({
             width:35,
             header:" No ",
             hidden:true,
             renderer:function(value, metaData, record, row, col, store, gridView){
             return record.get('no');
             }
             }),  */
            /* { header: "ID System", sortable: true, hidden:true, dataIndex: 'id' 
             ,renderer: function (value, metaData, record, row, col, store, gridView) {
             return value; 
             }}, */
            {header: "เลือกทั้งหมด", width: 50, sortable: true, dataIndex: 'i_group'
                , renderer: function (value, metaData, record, row, col, store, gridView)
                {

                    if (Ext.i_group != value) {

                        metaData.style = "background-color:#eeeeee;";
                        metaData.tdAttr = 'style="background:#eeeeee"';


                        xx = '<input type="checkbox" onchange="checkAll(this,'
                                + record.get('i_group') + ')" id="i_group'
                                + record.get('i_group') + 'ID" name="i_group'
                                + record.get('i_group') + '" value="'
                                + record.get('i_group') + '"/>'
                                + '<label for="i_group' + record.get('i_group') + 'ID"> หมวด  ' + record.get('i_group') + '</label>';

                    } else {

                        xx = '';
                    }
                    Ext.i_group = value;
                    return xx;


                }},
            {header: "รายการบัญชี", align: 'left', dataIndex: 'checkbox'},

            {header: "แหล่งที่มาของเงิน", align: 'left', width: 130, dataIndex: 'radioID'},
            {header: "สูตรคำนวณ", align: 'left', width: 180, dataIndex: 'comboID'},
        ],
    };

    formSoDtl.superclass.constructor.call(this, {
        listeners: {
            afterrender: function (obj, eOpts) { },
        },
        id: 'frm-so-dtlID',
        url: 'api/mnGlRepActivity.php',
        frame: true,
        bodyStyle: "padding:0px",
        autoScroll: true,
        loadMask: true,
        width: 600,
        labelWidth: 180,
        bodyStyle: "padding:5px",
        defaults: {flex: 1, },
        title: 'การจับคู่บัญชี',
        items: [
            {xtype: 'hidden', name: 'tbl', value: 'dtl'},
            {xtype: 'hidden', name: 'mode', value: 'ADD'},
            {xtype: 'hidden', name: 'id', value: Ext.getCmp('hdrID').getValue()}, gridDtl],
        buttonAlign: 'left',
        buttons: [{
                text: 'บันทึกบัญชี',
                id: 'buSave1ID',
                iconCls: 'icon-save',
                listeners: {
                    afterrender: function () {

                    }
                },
                handler: function () {
                    var form = Ext.getCmp('frm-so-dtlID').getForm();
                    if (form.isValid()) {
                        form.submit({
                            waitMsg: 'Saving Data...',
                            success: function (form, action) {
                                Ext.Msg.alert('Success', action.result.msg, function () {
                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {};
                                    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer		  
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
                }
            }, {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
                }
            }]
    });
};
Ext.extend(formSoDtl, Ext.FormPanel, {});


searchGrid = function () {

    var cmbFilters = {
        xtype: 'combo',
        id: 'filter-ID',
        store: new Ext.data.SimpleStore({
            fields: ["id", "c_name"],
            data: [['c_name', "ชื่อที่แสดงในรายงาน"]]
        }),
        value: 'c_name',
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
        },
    };

    Ext.fieldsetID = false;

    //classOverride				
    searchGrid.superclass.constructor.call(this, {
        initComponent: function () {
            searchGrid.superclass.initComponent.call(this);
            this.fn(this);
        },
        listeners: {
            afterrender: function (obj, eOpts) { /*console.log('Load Finish');*/
            },
        },
        fn: function () { },
        id: 'frm-grid-searchID',
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        width: 730,
        labelWidth: 180,
        defaults: {
            anchor: '0'
        },
        items: [{
                xtype: 'compositefield',
                fieldLabel: 'คำที่ค้นหา',
                msgTarget: 'side',
                anchor: '-10',
                defaults: {flex: 1},
                items: [{
                        xtype: 'textfield',
                        id: 'val-ID',
                        name: 'value'
                    }, cmbFilters
                ]
            }
        ],
        buttonAlign: 'left',
        buttons: [{
                text: 'เพิ่มข้อมูล',
                id: 'buAdd',
                iconCls: 'icon-add',
                handler: function (grid, rowIndex, colIndex) {
                    controllTab({}, 'add');
                }
            }, {
                xtype: 'tbfill'
            }, {
                text: 'ค้นหา',
                id: 'buSearchID',
                iconCls: 'icon-magnifier',
                handler: function () {

                    Ext.store.setBaseParam("mode", "SEARCH");
                    Ext.store.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
                    Ext.store.setBaseParam("value", Ext.getCmp("val-ID").getValue());
                    Ext.getCmp('tabpanel1').getStore().load();
                }
            }, {
                text: 'เริ่มใหม',
                iconCls: 'icon-reset',
                handler: function () {
                    Ext.getCmp('frm-grid-searchID').getForm().reset();
                }
            }]

    });
};

Ext.extend(searchGrid, Ext.FormPanel, {});

//store


//OnLoad
Ext.onReady(function () {

    var store_example = new Ext.data.SimpleStore({
        fields: ['value', 'col1', 'col2'],
        data: [['val1', 'Collumn 1', 'Collumn 2'], ['hworld', 'Hello', 'world']]
    });


    Ext.QuickTips.init();
    var gridMain = {
        region: 'center',
        title: 'แสดงข้อมูลการสร้างรายงาน งบกระแสเงินสด',
        xtype: 'grid',
        id: 'tabpanel1',
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store,
        tbar: [new searchGrid()],
        viewConfig: {forceFit: true, getCellCls: function (value) { }},
        columns: [
            {header: "บรรทัดที่แสดงในรายงาน", width: 50, sortable: true, align: 'center', dataIndex: 'i_row'},
            {header: "ID System", sortable: true, hidden: true, dataIndex: 'id'},
            {id: 'c_name', header: "รายการแสดงในรายงาน", width: 210, dataIndex: 'c_name',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    var i_show = record.get('i_show');
                    if (parseInt(i_show) == 1 || parseInt(i_show) == 8 || parseInt(i_show) == 9) {
                        return '<div style="font-weight:bold;">' + value + '</div>';
                    }
                    if (parseInt(i_show) == 2 || parseInt(i_show) == 3 || parseInt(i_show) == 5 || parseInt(i_show) == 6) {
                        return '<div style="padding-left:10px;">' + value + '</div>';
                    } else {
                        return '<div style="padding-left:20px;">' + value + '</div>';
                    }
                }},

            {
                header: "Status",
                width: 30,
                sortable: false,
                align: 'center',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    var i_enable = record.get('i_enable');
                    if (parseInt(i_enable) === parseInt(Ext.CONF_STATUS_ENABLE)) {
                        return '<img src="../images/icons/yes.gif");/>';
                    } else {
                        return '<img src="../images/icons/no.gif");/>';
                    }
                }
            },
        ],
//		autoExpandColumn: 'c_name',
        bbar: new Ext.PagingToolbar({
            pageSize: 100,
            store: Ext.store,
            displayInfo: true,
            displayMsg: 'Displaying topics {0} - {1} of {2}'
        })
    };

    new Ext.Viewport({
        layout: 'border',
        items: [new Ext.TabPanel({
                region: 'center',
                border: false,
                id: 'contenterCenter',
                defaults: {autoScroll: true},
                items: [gridMain],
                listeners: {

                    tabchange: function (tabPanel, newTab, oldTab, eOpts) {
                        /* if(newTab.id=='tabpanelAssurance'){ getAssurance(); } */

                        if (newTab.id == 'frm-so-dtlID') {
                            //Ext.getCmp('frm-so-hdrID').getEl().mask("Please wait...", "x-mask-loading"); 

                        }
                    },

                }, //End
            })]
    });

    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
    Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
    InfoMainGrid('tabpanel1', true, true, true, true, true, true);
});
