/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.SelFrm = function (i) {

    return new Ext.Window({
        //                     collapsible: true,
        //                     maximizable: true,
        title: "เกณฑ์ราคาประกอบ เกณฑ์อื่น (เกณฑ 7ข้อ)",
        width: 700,
        id: "winSearchFrm",
        height: 300,
        layout: "fit",
        buttonAlign: "left",
        items: [
            {
                layout: "column",
                border: false,
                defauls: {background: "#eee"},
                items: [
                    {
                        columnWidth: 0.9,
                        layout: "form",
                        border: false,
                        items: [
                            {
                                xtype: "checkboxgroup",
                                id: "i_more2[" + i + "]",
//    fieldLabel: "เกณฑ์ราคาประกอบ เกณฑ์อื่น (เกณฑ์ 7 ข้อ)",
                                columns: [1], // แสดงในแนวตั้ง
                                items: [
                                    {
                                        boxLabel: "ต้นทุนของพัสดุนั้นตลอดอายุการใช้งาน",
                                        name: "i_expense",
                                        inputValue: 1,
//            checked: true,
                                    },
                                    {
                                        boxLabel: "มาตรฐานของสินค้าหรือบริการ",
                                        name: "i_expense",
                                        inputValue: 2,
                                    },
                                    {
                                        boxLabel: "บริการหลังการขาย",
                                        name: "i_expense",
                                        inputValue: 3,
                                    },
                                    {
                                        boxLabel: "พัสดุที่รัฐต้องการส่งเสริมหรือสนับสนุน",
                                        name: "i_expense",
                                        inputValue: 4,
                                    },
                                    {
                                        boxLabel: "การประเมินผลการปฏิบัติงานของผู้ประกอบการ",
                                        name: "i_expense",
                                        inputValue: 5,
                                    },
                                    {
                                        boxLabel: "ข้อเสนอด้านเทคนิคหรือข้อเสนออื่น ในกรณีที่กำหนดให้มีการยื่นข้อเสนอด้านเทคนิค",
                                        name: "i_expense",
                                        inputValue: 6,
                                    },
                                    {
                                        boxLabel: "เกณฑ์อื่นตามที่กำหนดในกฎกระทรวง",
                                        name: "i_expense",
                                        inputValue: 7,
                                    }
                                ], listeners: {
                                    beforerender: function (cmp) {
                                        
                                        if (Ext.i_selID[i].datas.data === null)
                                            console.log("Ext.i_selID = null");
                                        else {
                                            console.log(Ext.i_selID[i].datas.row);
                                            console.log(Ext.i_selID[i].datas.data);
                                            
                                        }

                                    },
                                    afterrender: function (cmp) {
                                        if (Ext.i_selID[i].datas.data !== null) {
                                            var checkboxes = cmp.items.items;
                                      

                                            Ext.each(checkboxes, function (checkbox) {
                                                for (var ii = 0; ii < Ext.i_selID[i].datas.data.length; ii++) {


                                                    if (checkbox.inputValue === Ext.i_selID[i].datas.data[ii].inputValue) {
                                                        checkbox.setValue(true);
                                                    }

                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columnWidth: 0.1,
                        layout: "form",
                        border: false,
                        items: [],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "บันทึกเกณฑ์ราคาประกอบ",
                        iconCls: "icon-save",
                        handler: function () {
//                            Ext.i_selID = [];

                            Ext.i_selID[i] = Ext.apply({name: 'i_sel[' + i + ']', datas: {row: i, data: Ext.getCmp("i_more2[" + i + "]").getValue()}});
                            /* console.log(Ext.i_selID[i]);
                             alert(i);*/
//                            console.log(Ext.i_selID[i]);

                            var sel = Ext.getCmp("i_more2[" + i + "]").getValue(), txt = '';
                            for (ii = 0; ii < sel.length; ii++) {
                                txt += sel[ii].inputValue + ') ' + sel[ii].boxLabel + '<br>';
                                
                            }
                            Ext.example.msg("แจ้งเตือน", txt, 3);
                            Ext.getCmp('leftfrmID').insert(3,{
                                xtype:'displayfield',
                                value:txt,
                                fieldLabel:'รายการ '+Ext.getCmp("i_qtyID[" + i + "]").getValue()
                            });
                            Ext.getCmp('leftfrmID').doLayout();
                            Ext.getCmp("winSearchFrm").destroy();
                        }
                    },
                    {
                        text: "ปิด",
                        iconCls: "icon-cancel",
                        handler: function () {
                            Ext.getCmp("winSearchFrm").destroy();
                        },
                    },
                ],
            },
        ],
    });
};
Ext.workScore = function () {
    if (!Ext.isEmpty(Ext.getCmp("frmTab2")))
        Ext.getCmp("frmTab2").destroy();
    Ext.i_pr_about = 1;
    Ext.ar_pr_about = [];
    Ext.ar_pr_about2 = [];
    Ext.torItemsHdr = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_work_hdr"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"]
    });
    Ext.torItems = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_work", sp_type_status_id: 1},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name", "score", "i_group", "sp_cate_id"]
    });
    Ext.torScores = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_scores", id: Ext.selectRow.get('id')},
        root: "data",
        idProperty: "id",
//sp_tor_id	dc_department_id	sp_emp_id	sp_cate_id	sp_type_id	i_enabled  
        fields: ["id", "sp_tor_id", "c_name", "score"
                    , "dc_department_id"
                    , "sp_emp_id"
                    , "sp_cate_id"
                    , "sp_type_id"
                    , "c_type_id"
                    , "sp_tor_work_id"
                    , "c_sp_tor_work_id"
                    , "i_enabled"
        ]
    });// 
    Ext.countItems = 11;
    Ext.scoreTotal = 0;
    var tab2 = new Ext.FormPanel({
//        labelAlign: 'top',
        title: "บันทึกรายละเอียดภาระงาน",
        bodyStyle: "padding:5px",
        layout: "fit",
        id: "frmTab2",
        url: "api/mnTorWorkingController.php",
        frame: false,
        items: [{
//                xtype: 'displayfield',
//                width: 80,
//                id: 'scoreTotalID',
//                html: "<div style='background-color:#cEcEcE; font-weight:bold;padding: 10px 10px 10px 10px;white-space: nowrap;'>" + " -  รวมภาระงาน " + parseFloat(Ext.scoreTotal).toFixed(2) + " คะแนน</div>"
//            },
//            {
                layout: "column",
                border: false,
                autoScroll: true,
                style: "font:bold 12px \'Mitr\', sans-serif; padding:5px;margin-bottom:5px;",
                html: "<div"
                        + " class='x-toolbar x-small-editor x-toolbar-layout-ct'"
                        + " style='background-color:#cEcEcE; font-weight:bold; padding:5px; margin-bottom:5px; white-space: nowrap;'>"
                        + " -  รวมภาระงาน <span style='font-weight:bold;' id='scoreTotalID'>"
                        + parseFloat(Ext.scoreTotal).toFixed(2)
                        + "</span> คะแนน</div>"
                , items: [
                    {
                        columnWidth: 0.4,
                        layout: "form",
                        id: "rightfrmID",
                        border: false,
                        labelWidth: 100,
                        bodyStyle: "padding:1px",
                        items: [{
                                xtype: "hidden",
                                name: "id",
                                id: "torHdrID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_emp_id"
                            },
                            {
                                xtype: "hidden",
                                name: "mode",
                                value: "EDIT1",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_cate_id",
                                id: "sp_cate_idID",
                                value: 2
                            },
                            {
                                xtype: "hidden",
                                name: "dc_department_id",
                                id: "dc_department_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                /**sp_type_id: 2
                                 c_type_id: เจาะจง 500,000.00 ขี้นไป
                                 sp_tor_work_idID: 5;6;7;8
                                 c_sp_tor_work_idID: รายการที่เลือก (4)*/
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "c_type_id",
                                id: "c_type_idID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_tor_work_id",
                                id: "sp_tor_work_id2ID"
                            },
                            {
                                xtype: "hidden",
                                name: "c_sp_tor_work_id",
                                id: "c_sp_tor_work_idID"
                            }, {
                                xtype: 'textfield',
                                fieldLabel: "รหัส PR",
                                id: "codeHdrID",
                                style: "text-align: center;font-weight:bold;background:#eee;",
                                readOnly: true,
                                name: "c_code"
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "เรื่อง/โครงการ",
                                name: "c_name",
                                id: "c_name",
                                readOnly: true,
                                anchor: "80%"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_type_amt",
                                id: "f_type_amt", // f_total_amt f_type_amt
                                readOnly: true,
                                anchor: "50%",

                            }, {
                                xtype: "radiogroup",
                                columns: [170],
                                fieldLabel: "รูปแบบการพิจารณา",
                                id: "i_bgID",
                                name: "i_bg",
                                items: [
                                    {

                                        name: "i_bg",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "พิจารณา รวม",
                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_bg",
                                        boxLabel: "พิจารณาแต่ละรายการ",
                                    },
                                ], //radiogroup 
                                listeners: {
                                    afterrender: function () {
                                        Ext.file = 'ProRepApNonePo';
                                    },
                                    change: function () {
                                        if (this.getValue().inputValue == 2) {
                                            Ext.file = 'ProRepApNonePo2';
                                            Ext.getCmp('itProID').show();

                                        } else if (this.getValue().inputValue == 1) {
                                            Ext.file = 'ProRepApNonePo';
                                            Ext.getCmp('itProID').hide();
                                        }

                                        Ext.example.msg("รูปแบบการดูรีพอร์ท", this.getValue().boxLabel + ' file ' + Ext.file, 3);
                                    },
                                },
                            }, {
                                xtype: 'compositefield',
//                    fieldLabel: 'เพิ่มจำวนหน่วยงานที่แยก', 
                                id: 'itProID',
                                hidden: true,
                                msgTarget: 'under',
                                items: [{
                                        xtype: "numberfield",
                                        id: "lineID",
                                        name: "line",
                                        value: 1,
                                        width: 60,
                                        fieldLabel: "แยกรายการ",
                                        listeners: {
                                            change: function (component, newValue, oldValue) {

                                                if (newValue > 20) {
                                                    component.setValue(oldValue);
                                                    //---------------- 
                                                }
                                            }
                                        }
                                    }, {
                                        xtype: "button",
                                        iconCls: "icon-add",
//                            fieldLabel: "รายละเอียดบิล",
                                        name: "button",
                                        text: "รายการ",
                                        handler: function () {
                                            var cont = Ext.getCmp('lineID').getValue();
//                                            Ext.f_total_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, ''));
//                                            Ext.f_part_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, '')) / cont;
                                            var el = Ext.query('*[id^=legendID]');
                                            var legen = el.length;
                                            Ext.i_selID = [];
                                            for (var i = 1; i <= legen; i++) {
//                                    alert(i);
                                                Ext.objLine = 0;
                                                Ext.getCmp('rightfrmID').remove(Ext.getCmp("i_qtyID[" + i + "]"));
                                                Ext.getCmp('rightfrmID').doLayout();
                                            }
                                            for (var i = 0; i < cont; i++) {
                                                Ext.objLine++;
                                                Ext.fnAddItems(Ext.objLine);
                                                Ext.i_selID[Ext.objLine] = Ext.apply({name: 'i_sel[' + Ext.objLine + ']', datas: {row: Ext.objLine, data: null}});

                                            }
                                            console.log(Ext.objLine);
                                            for (var i = 1; i <= Ext.objLine; i++) {
//                                                 Ext.i_selID = [i]; 
                                                Ext.getCmp('i_selID[' + i + ']').hide();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }
//                                            console.log(Ext.i_selID);

                                        }, listeners: {
                                            beforerender: function () {
                                                Ext.objLine = 0;
                                                Ext.fnAddItems = (li) => {
                                                    Ext.sp_sbill_pop = new Ext.data.JsonStore({
                                                        autoDestroy: false,
                                                        autoLoad: true,
                                                        url: "api/All_poWorking.php",
                                                        baseParams: {type: "sp_sbill_pop"},
                                                        root: "data",
                                                        idProperty: "id",
                                                        totalProperty: "totalCount",
                                                        fields: ["no", "id", "c_contract_code", "count", "f_sum"],
                                                    });
                                                    var total = Ext.getCmp('rightfrmID').items.length;
                                                    var totalCount = total + 2;
                                                    var line = Ext.objLine;
                                                    Ext.getCmp('rightfrmID').insert(totalCount, new Ext.ButtonGroup({
                                                        frame: false,
                                                        border: false,
                                                        style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                                        id: 'buttonGroup2' + Ext.objLine,
                                                        fieldLabel: "รายการพิจารณา " + Ext.objLine,
                                                        items: [{
                                                                xtype: "textfield",
                                                                id: "i_qtyID[" + line + "]",
                                                                name: "i_qty[" + line + "]",
                                                                emptyText: "รายการพิจารณา ", style: "text-align: right",
                                                                width: '7ท0%',
                                                                fieldLabel: "รายการพิจารณา " + Ext.objLine,
                                                                validator: function (val) {
                                                                    if (Ext.isEmpty(val)) {
                                                                        return "กรุณากรอกข้อมูลให้ถูกต้อง";
                                                                    } else {
                                                                        return true;
                                                                    }
                                                                }

                                                            }, {
                                                                xtype: 'button',
//                                                                hidden:true,
                                                                id: "i_selID[" + line + "]",
                                                                name: "i_sel[" + line + "]",
                                                                text: "เลือกเกณฑ์ อื่นประกอบ " + Ext.objLine,
                                                                fieldLabel: "เลือกเกณฑ์ อื่นประกอบ  " + Ext.objLine,
                                                                handler: function () {
                                                                    var selFrm = Ext.SelFrm(line);
                                                                    selFrm.show();
                                                                },
                                                                listeners: {
                                                                    beforerender: function () { //this.fn = function () { }; 
                                                                    },
                                                                    afterrender: function () {
//                                                                        Ext.i_selID = Ext.apply({row: Ext.objLine, data: []});

                                                                    },
                                                                },
                                                            }],
                                                    })
                                                            );
                                                    Ext.getCmp('rightfrmID').doLayout();
                                                };
                                            },
                                            afterrender: function () {
                                                Ext.example.msg("แจ้งเตือน", "test", 3);
                                            },
                                            Change: function () {  //this.fn1();
                                            },
                                            blur: function () { //this.fn1();
                                            },
                                        },
                                    }]
                            }
                            , new Ext.form.Label({
                                xtype: 'label',
                                id: "sp_tor_work_idID",
                                style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                html: '<div style="padding-left:30px;"><span style="color:red">*</span>ค่าภาระงานส่วนที่ 1 รายการพิจารณาที่จะไปทำสัญญา</div>',
                                listeners: {
                                    beforerender: function () {
                                        Ext.rate2 = 0.33;
                                        this.fnData2 = function (i, rec) {
                                            let pr_about = i;
                                            let pr_aboutRs = rec;
                                            Ext.ar_pr_about.push(pr_about);
                                            if (pr_aboutRs === null) {
                                                var cateNull = false;
                                                var cateText = true;

                                                let twoPlacedFloat = parseFloat(parseFloat(Ext.rate2).toFixed(2));
                                                Ext.scoreTotal += twoPlacedFloat;
                                                Ext.get('scoreTotalID').update(Ext.scoreTotal.toFixed(2));
                                            } else {
                                                var cateNull = (pr_aboutRs.get('sp_cate_id') == 1) ? true : false;
                                                var cateText = false;

                                            }
                                            buttonGroup = new Ext.ButtonGroup({
//                                                fieldLabel: cateNull ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : "เกณฑ์ราคาประกอบ",
                                                frame: false,
                                                border: false,
                                                style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                                id: 'buttonGroup' + pr_about,
                                                items: [
                                                    {
                                                        xtype: "label",
                                                        id: 'labelID' + pr_about,
                                                        style: "margin-right:5px;",
                                                        text: cateNull ? "" : "เกณฑ์ราคาประกอบ"
                                                    },
                                                    {
                                                        xtype: (cateText ? "textarea" : 'displayfield'),
                                                        width: 200,
                                                        readOnly: cateNull,
                                                        name: "c_name[" + pr_about + "]",
                                                        id: "c_nameID" + pr_about,
                                                        validator: function (val) {
                                                            if (!Ext.isEmpty(val)) {
                                                                return true;
                                                            } else {
                                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            }
                                                        }
                                                    }, {
                                                        xtype: "tbspacer",
                                                        width: 9
                                                    }, {
                                                        xtype: cateText ? 'textfield' : 'displayfield',
                                                        name: 'score[' + pr_about + "]",
                                                        readOnly: true,
                                                        width: 80,
                                                        id: 'score' + pr_about + 'ID'
                                                    }, {
                                                        xtype: "label",
                                                        style: {
                                                            color: "blue",
                                                            width: "200px"
                                                        },
                                                        text: " คะแนน"
                                                    }, {
                                                        xtype: "tbspacer",
                                                        width: 9,
//                                                    }, {
//                                                        xtype: 'hidden',
//                                                        name: 'id[' + pr_about + "]",
//                                                        id: 'id' + pr_about + 'ID',
                                                    }, {
                                                        xtype: 'button',
                                                        id: 'buttonID' + pr_about,
                                                        hidden: cateText ? false : true,
                                                        name: 'button' + pr_about,
                                                        text: 'ลบรายการ ' + pr_about,
                                                        handler: function () {
                                                            Ext.getCmp('leftfrmID').remove(Ext.getCmp('buttonGroup' + pr_about));

                                                        } //
//                                                        id: 'id' + pr_about + 'ID',
                                                    }, {
                                                        xtype: 'button',
                                                        id: 'button2ID' + pr_about,
                                                        hidden: cateText ? false : true,
                                                        name: 'button' + pr_about,
                                                        text: 'รายการพิจาณา ' + pr_about,
                                                        handler: function () {
//                                                            Ext.getCmp('leftfrmID').remove(Ext.getCmp('buttonGroup' + pr_about));

                                                        } //
                                                    }
                                                ],
                                                listeners: {
                                                    removed: function () {
                                                        let twoPlacedFloat = parseFloat(parseFloat(Ext.getCmp('score' + pr_about + 'ID').getValue()).toFixed(2));
                                                        Ext.scoreTotal -= twoPlacedFloat;
                                                        Ext.get('scoreTotalID').update(Ext.scoreTotal.toFixed(2));
                                                    },
                                                    afterrender: function () {

                                                        if (pr_aboutRs != null) {
                                                            Ext.getCmp("c_nameID" + pr_about).setValue(pr_aboutRs.get("c_name"));
                                                            Ext.getCmp('score' + pr_about + 'ID').setValue(!cateNull ? parseFloat(parseFloat(pr_aboutRs.get("score")).toFixed(2)) : pr_aboutRs.get("score"));
                                                            let twoPlacedFloat = parseFloat(parseFloat(pr_aboutRs.get("score")).toFixed(2));
                                                            Ext.scoreTotal += twoPlacedFloat;
                                                            Ext.get('scoreTotalID').update(Ext.scoreTotal);

                                                        }
                                                    }
                                                }
                                            });
                                            if (cateNull) {
                                                Ext.getCmp('rightfrmID').insert(Ext.torScores.data.length + Ext.countItems + 1, buttonGroup);
                                                Ext.getCmp('rightfrmID').doLayout();
                                            } else {
                                                Ext.getCmp('score' + pr_about + 'ID').setValue(Ext.rate2);
                                                Ext.getCmp('leftfrmID').insert(2, buttonGroup);
                                                Ext.getCmp('leftfrmID').doLayout();

                                            }
                                        };
                                    },
                                    afterrender: function () { /*
                                     Ext.getCmp('leftfrmID').insert(1, new Ext.form.Label({
                                     xtype: 'label',
                                     style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                     html: '<div style="padding-left:30px;"><span style="color:red">*</span>ค่าภาระงานส่วนที่ 2</div>'
                                     }));
                                     Ext.getCmp('leftfrmID').doLayout();*/
//                                        Ext.getCmp('leftfrmID').insert(Ext.countItems, new Ext.Button({
//                                            text: '&nbsp;เพิ่ม เกณฑ์ราคาประกอบเกณฑ์อื่น&nbsp;', 
//                                            name: "buttonOpen2", 
//                                            handler: function () {
//
//                                                Ext.getCmp('sp_tor_work_idID').fnData2(Ext.i_pr_about++, null);
//
//                                            },
//                                            listeners: {afterrender: function () {
//
//                                                    Ext.torScores.reload({
//                                                        callback: function (record, operation, success) {
//
//                                                            //end left              
//                                                            record.forEach(function (v) {
//
//
//                                                                Ext.lenCate1 = Ext.getCmp('sp_tor_work_idID').fnData2(Ext.i_pr_about++, v);
//                                                                if (record.length == Ext.i_pr_about) {
//                                                                    Ext.getCmp('sp_cate_idID').setValue(2);
//                                                                    Ext.getCmp('dc_department_idID').setValue(v.get("dc_department_id"));
//                                                                    Ext.getCmp('sp_type_idID').setValue(v.get("sp_type_id"));
//                                                                    Ext.getCmp('c_type_idID').setValue(v.get("c_type_id"));
//                                                                    Ext.getCmp('sp_tor_work_id2ID').setValue(v.get("sp_tor_work_id"));
//                                                                    Ext.getCmp('c_sp_tor_work_idID').setValue(v.get("c_sp_tor_work_id"));
//                                                                    /**sp_type_id: 2
//                                                                     c_type_id: เจาะจง 500,000.00 ขี้นไป
//                                                                     sp_tor_work_id: 5;6;7;8
//                                                                     c_sp_tor_work_id: รายการที่เลือก (4)*/
//                                                                }
//
//                                                            });
//                                                        }
//                                                    });
//                                                }
//                                            }
//                                        }));
//                                        Ext.getCmp('leftfrmID').doLayout();
                                    }
                                }
                            }),
                        ],
                    },
                    {
                        columnWidth: 0.6,
                        layout: "form",
                        border: false,
                        bodyStyle: "padding:3px",
                        id: "leftfrmID",
                        labelWidth: 200,
                        items: [{
                                xtype: "radiogroup",
                                columns: [170],
                                fieldLabel: "รูปแบบ เกณฑ์ราคาประกอบ",
                                id: "i_bg2ID",
                                name: "i_bg2",
                                items: [
                                    {

                                        name: "i_bg2",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "เกณฑ์ราคา",
                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_bg2",
                                        boxLabel: "เกณฑ์ราคาประกอบ เกณฑ์อื่น (เกณฑ์ 7ข้อ)",
                                    },
                                ], //radiogroup 
                                listeners: {
                                    afterrender: function () {
                                        Ext.file = 'ProRepApNonePo';
                                        for (var i = 1; i <= Ext.objLine; i++) {
                                            Ext.getCmp('i_selID[' + i + ']').hide();
                                            Ext.getCmp('leftfrmID').doLayout();
                                        }

                                    },
                                    change: function () {
                                        if (this.getValue().inputValue == 2) {
                                            Ext.file = 'ProRepApNonePo2';
                                            Ext.getCmp('itProID').hide();
                                            for (var i = 1; i <= Ext.objLine; i++) {

                                                Ext.getCmp('i_selID[' + i + ']').show();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }

                                        } else if (this.getValue().inputValue == 1) {
                                            Ext.file = 'ProRepApNonePo';
                                            Ext.getCmp('itProID').hide();
                                            for (var i = 1; i <= Ext.objLine; i++) {
                                                Ext.getCmp('i_selID[' + i + ']').hide();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }

                                        }

                                        Ext.example.msg("รูปแบบการดูรีพอร์ท", this.getValue().boxLabel + ' file ' + Ext.file, 3);
                                    },
                                },
                            }
                        ],
                    }
                ],

                buttonAlign: "left",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        iconCls: "icon-save",
                        handler: function () {

//console.log(JSON.parse(JSON.stringify(Ext.getCmp('leftfrmID').items.items))); 
console.log(Ext.getCmp('leftfrmID').items.items.length);
console.log(Ext.getCmp('leftfrmID').items.items);
console.log(Ext.getCmp('rightfrmID').items.items);

return false;
                            var form = Ext.getCmp("frmTab2").getForm();
                            if (Ext.selectRow.get("sp_cate_id") == 2 && Ext.menu_code == 'ST0006') {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ! PR ท่านได้เคยบันทึกแล้วถ้าต้องการแก้ไข/ติดต่อแอดมิน</span><br>", function (bu, action) {
                                    console.log("sp_cate_id 1 >> " + Ext.selectRow.get("sp_cate_id"));
                                    console.log("menu ST0006 >> " + Ext.menu_code);
                                    return false;
                                });
                            } else if (form.isValid()) {
                                Ext.Msg.show({
                                    title: "ยืนยันบันทึกภาระงานที่ทำ",
                                    msg: "คุณต้องภาระงาน ?",
                                    width: 440,
                                    icon: Ext.MessageBox.QUESTION,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn) {
                                        if (btn === "yes")
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                        Ext.getCmp("frmTab2").destroy();
                                                    });
                                                },
                                                failure: function (form, action) {
                                                    switch (action.failureType) {
                                                        case Ext.form.Action.CLIENT_INVALID:
                                                            Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                            break;
                                                        case Ext.form.Action.CONNECT_FAILURE:
                                                            Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                            break;
                                                        case Ext.form.Action.SERVER_INVALID:
                                                            Ext.Msg.alert("Failure", action.result.msg);
                                                    }
                                                }
                                            });
                                        else
                                            null;
                                    }
                                });

                            }
                        }
                    },
                    {
                        text: "ยกเลิก",
                        iconCls: "icon-cancel",
                        handler: function () {
                            Ext.getCmp("frmTab2").destroy();

                        }
                    }
                ]
            }
        ]
    });

    Ext.buAct = "getDetail";
    Ext.getCmp("contenterCenter").add(tab2);
    Ext.getCmp("contenterCenter").setActiveTab(tab2);
    Ext.selectRow.set('f_type_amt', Ext.selectRow.get('f_total_amt'));// f_total_amt 
    Ext.getCmp("frmTab2").getForm().loadRecord(Ext.selectRow);

}; //End work score
const saveDtl = function (mode) {
    let msg = "";
    let jsonArr = [];
    var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (document.getElementById("chk_" + row).checked == true) {
            jsonArr.push({
                c_name: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_creditor_name,
                sp_tor_bidder_dtl_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_bidder_dtl_id,
                dc_creditor_id: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_creditor_id,
                sp_tor_dtl_id: Ext.SP_TOR_DTL_ID,
                sp_tor_id: Ext.SP_TOR_ID,
            });
        }
        row++;
    }
    if (jsonArr.length <= 0) {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
    }
    if (msg == "") {
        // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "UP_SP_TOR_VICTORY",
                data: JSON.stringify(jsonArr),
            },
            success: function (result, request) {
                // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                let json = Ext.util.JSON.decode(result.responseText);
                Ext.Msg.alert("แจ้งเตือน", json.msg);
                Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                /*Ext.store3.load({
                 callback: function (recordx, operation, success) {
                 if (success) {
                 var sto = recordx;
                 sto.forEach(function (v) { 
                 if(v.get('CheckColumn')===true){  
                 Ext.saveDtlID = true; 
                 } 
                 
                 
                 });
                 
                 TabNext(record, "view"); //on
                 
                 }
                 }
                 });*/
                Ext.store3.load({
                    callback: function (recordx, operation, success) {
                        if (success) {

                            Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store2.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.getCmp("winChequeID").setActiveTab(0);
                                        var sto = recordx;
                                        sto.forEach(function (v) {
                                            if (v.get('CheckColumn') === true) {
                                                Ext.saveDtlID = true;
                                                Ext.getCmp('saveDtlID').setDisabled(true);
                                            }
                                        });
                                    }
                                },
                            });
                        }
                    },
                });

                if (json.success == true) {
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText);
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
};
const cancel_victory = function (id) {
    var win = new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะยกเลิกรายการนี้ ?",
        buttons: [
            {
                text: "Confirm",
                handler: function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        params: {
                            mode: "DELETE_SP_TOR_VICTORY",
                            id: id,
                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            Ext.getCmp("win-msg-delete").destroy();
                            Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                            Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                            Ext.store3.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                        Ext.store2.load();
                                    }
                                },
                            });
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
                    Ext.getCmp("tabpanel1").getStore().reload();
                },
            },
        ],
    }).show();
};
function checkID(RowCheck) {
    var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (RowCheck != row) {
            document.getElementById("chk_" + row).checked = false;
        }
        row++;
    }
    // var models = Ext.getCmp("gridEditor2").getStore().getRange();
    // if (document.getElementById("chk_" + row).checked == true) {
    //   models[row].set("CheckColumn", true);
    // } else {
    //   models[row].set("CheckColumn", false);
    //   document.getElementById("f_bid" + row).value = null;
    //   document.getElementById("f_bid_total" + row).value = null;
    // }
}
Ext.AppUx = function (app, menu) {


    Ext.store2 = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "LIST_TOR_DTL_ST0006", i_read: user_right_read}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "sp_tor_dtl_id"},
            {name: "sp_tor_id"},
            {name: "c_name"},
            {name: "i_qty"},
            {name: "i_used"},
            {name: "i_balance"},
            {name: "dc_unit_type_id"},
            {name: "dc_unit_type_name"},
            {name: "c_unit"},
            {name: "dc_bg_budget_type_id"},
            {name: "i_product_type"},
            {name: "i_is_inv"},
            {name: "po_expense_id"},
            {name: "dc_creditor_id"},
            {name: "i_hire_type"},
            {name: "f_disc_price"},
            {name: "f_unit_price"},
            {name: "f_total_price"},
            {name: "f_net_disc_price"},
            {name: "f_net_unit_price"},
            {name: "f_net_total_price"},
            {name: "i_is_victory"},
        ],
    });
    Ext.store3 = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "LIST_BIDDER_DTL_ST0006"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "CheckColumn"},
            {name: "i_is_victory"},
            {name: "sp_tor_bidder_dtl_id"},
            {name: "dc_creditor_id"},
            {name: "dc_creditor_name"},
            {name: "f_bid_unit_price"},
            {name: "i_bid_qty"},
            {name: "f_bid_total_price"},
            {name: "f_unit_price"},
            {name: "i_qty"},
            {name: "f_total_price"},
            {name: "dc_unit_type_name"},
        ],
    });
    Ext.all_bidder = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "ALL_BIDDER"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "id"}, {name: "c_name"}],
        listeners: {
            load: function (t, records, options) {
             //   Ext.getCmp("all_bidderID").setValue("0");
            },
        },
    });
    Ext.bidder_select = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "BIDDER_SELECT"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "victory_id"},
            {name: "CheckColumn"},
            {name: "sp_tor_bidder_dtl_id"},
            {name: "sp_tor_dtl_id"},
            {name: "dc_creditor_id"},
            {name: "c_name"},
            {name: "dc_creditor_name"},
            {name: "f_bid_unit_price"},
            {name: "f_bid_total_price"},
            {name: "i_bid_qty"},
            {name: "f_unit_price"},
            {name: "f_total_price"},
            {name: "i_qty"},
            {name: "dc_unit_type_name"},
        ],
        listeners: {
            // load: function (t, records, options) {
            //   Ext.getCmp("all_bidderID").setValue("0");
            // },
        },
    });
    var colPOP = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
        {
            header: "-",
            align: "center",
            dataIndex: "creditor_name",
            width: 110,
            id: "detailBidder",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return "<button>รายชื่อผู้เสนอ</button>";
            },
        },
        {
            header: "ชื่อรายการ",
            align: "left",
            dataIndex: "c_name",
            width: 200,
        },
        {
            header: "จำนวน",
            align: "center",
            dataIndex: "i_qty",
            width: 50,
        },
        {
            header: "หน่วยนับ",
            align: "center",
            dataIndex: "dc_unit_type_name",
            width: 80,
        },
        {
            header: "จำนวนเงิน ต่อหน่วย",
            align: "right",
            dataIndex: "f_unit_price",
            width: 100,
        },
        {
            header: "จำนวนเงินรวม",
            align: "right",
            dataIndex: "f_total_price",
            width: 100,
        },

        {width: 5, dataIndex: ""},
    ];

    Ext.AppConfig();
    //interlizing
    Ext.menuCode = "ST0007"; //go to
    //
    Ext.storeDtl.setBaseParam("type_menu", 2); //set สายงาน
    Ext.status = Ext.runStatus(menu);
    //Load
    var AppPoStore = function (statuss) {
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_cost,
            anchor: "100%",
            fieldLabel: "หน่วยงานที่รับผิดชอบ",
            valueField: "id",
            displayField: "c_name",
            hiddenName: "dc_cost_id",
            name: "c_cost_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    this.fn();
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
        });
        var comboCost2 = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            anchor: "100%",
            readOnly: true,
            value: Ext.costID,
            fieldLabel: "หน่วยงานเจ้าของเรื่อง",
            valueField: "id",
            displayField: "c_name",
            hiddenName: "dc_cost2_id",
            name: "c_cost_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    this.fn();
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

            }
        });
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            fieldLabel: "ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_yyyy",
            name: "i_year",
            store: Ext.store_year,
            valueField: "id",
            displayField: "c_name",
            value: Ext.bgYear,
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกปีงบประมาณ...",
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    this.fn();
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
        });
        var columnMini = [
            {
                header: "ID System",
                sortable: true,
                hidden: true,
                dataIndex: "id",
            },
            {
                header: "เลขที่ใบเบิก",
                sortable: true,
                dataIndex: "c_code",
            },
            {
                header: "รายการ­",
                sortable: true,
                id: "c_name",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='cursor:pointer';";
                    return value;
                },
            },
        ];

        var statusx = statuss;

        if (statusx == "add") {
            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
        }
        // var typeTor = ;
        var bgProject = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.bgProject,
            id: "projectID",
            anchor: "100%",
            fieldLabel: "ชื่อโครงการ",
            submitValue: true,
            hiddenName: "bg_budget_dtl_project_id",
            name: "c_budget_dtl_project_id",
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: false,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    this.fn();
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
        });
        var col1 = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10},
            {
                header: "วันที่ส่งมอบ",
                align: "center",
                dataIndex: "d_period_date",
                width: 25,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value == "รวม") {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                        return Ext.floatRenderer(value);
                    } else {
                        metaData.attr = "";
                        if (record.get("i_is_dtl")) {
                            return "";
                        } else {
                            return DategetShortDateMonthName(value);
                        }
                    }
                },
            },
            {
                header: "รายละเอียด จัดซื้อ",
                dataIndex: "c_name",
                width: 35,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value.substring(0, 3) == "รวม") {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    } else {
                        metaData.attr = "";
                    }
                    return value; //DategetShortDateMonthName(value);
                },
            },
            {header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right"},
            {header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25},
            {header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25},
            {
                header: "บันทึกรายละเอียดในงวดงาน",
                sortable: false,
                hideable: false,
                draggable: false,
                align: "center",
                id: "edit21",
                width: 25,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
                        return "";
                    } else {
                        if (record.get("buStatus") == true) {
                            return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                        } else {
                            return record.get("buStatus");
                        }
                    }
                },
            },
        ];

        var disp = false ? "displayfield" : "textfield";
        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }
        // ดึงขนาดความกว้างและความสูงของหน้าจอเบราว์เซอร์ปัจจุบัน
        var screenSize = Ext.getBody().getViewSize();
        var winWidth = screenSize.width * 0.98;
        var winHeight = screenSize.height * 0.98;
        
//        var reasonStore = new Ext.data.ArrayStore({
//    fields: ['id', 'reasonText'],
//    data: [
//        [1, '1 . เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้เสนอราคาต่ำสุด'],
//        [2, '2. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ได้คะแนนรวมสูงสุด'],
//        [3, '3. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ชนะการเสนอราคาตามกฎกระทรวงกำหนดพัสดุและวิธีการจัดซื้อจัดจ้างพัสดุที่รัฐต้องการส่งเสริมหรือสนับสนุน (ฉบับที่ ๒) พ.ศ. ๒๕๖๓']
//    ]
//});
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: Ext.title,
            width: winWidth,   // กำหนดเป็น 90% ของความกว้างหน้าจอ
            height: winHeight, // กำหนดเป็น 90% ของความสูงหน้าจอ
            id: "winMain", 
            layout: "fit",
            modal: true,
            plain: true,
            bodyStyle: "padding:1px;",
            buttonAlign: "center",
            items: [
                {
                    xtype: "tabpanel",
                    activeTab: 0,
                    id: "winChequeID",
                    // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                    items: [
                        new Ext.FormPanel({
                            title: "รายละเอียด PR",
                            id: Ext.poFormID,
                            columnWidth: 1,
                            url: "tor/api/mnTorController.php",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 220,
                            listeners: {
                                afterrender: function () {
                                    Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
                                    Ext.getCmp("i_pr_type2ID").setValue(Ext.selectRow.json.i_pr_type2);
                                    Ext.getCmp("i_pr_type3ID").setValue(Ext.selectRow.json.i_pr_type3);
                                    Ext.getCmp("f_type_amtID").setValue(Ext.selectRow.json.f_total_amt);
                                    Ext.getCmp("f_type_amtID2").setValue(Ext.selectRow.json.f_type2_amt);
                                    Ext.getCmp("f_type_amtID3").setValue(Ext.selectRow.json.f_type3_amt);
                                },
                            },
                            items: [
                                {
                                    layout: "column",
                                    border: false,
                                    items: [
                                        {
                                            columnWidth: 0.99,
                                            layout: "form",
                                            border: true,
                                            items: [
                                                {
                                                    xtype: "hidden",
                                                    name: "id",
                                                    id: "torHdrID", //i_is_more
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "dc_emp_id",
                                                    id: "dc_emp_idID", //i_is_more
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "sp_emp_id",
                                                    id: "sp_emp_idID", //i_is_more
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "dc_department_id",
                                                    id: "dc_department_idID", //i_is_more
                                                },
                                                {
                                                    xtype: disp,
                                                    readOnly: true,
                                                    fieldLabel: "รหัส PR",
                                                    id: "codeHdrID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    readOnly: true,
                                                    name: "c_code",
                                                },
                                                {
                                                    xtype: "textarea",
                                                    width: 500,
                                                    height: 35,
                                                    // readOnly: true,
                                                    fieldLabel: "เรื่อง/โครงการ",
                                                    name: "c_name",
                                                },
                                                comboUsedBgYear,
                                                // { xtype: "displayfield", fieldLabel: "ชื่อโครงการ", name: "c_budget_dtl_project" },
                                                comboCost,
                                                comboCost2,
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "d_tor_date",
                                                            readOnly: true,
                                                            validator: function (val) {
                                                                if (!Ext.isEmpty(val)) {
                                                                    return true;
                                                                } else {
                                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                }
                                                            },
                                                        },
                                                        {
                                                            xtype: "tbspacer",
                                                            width: 18,
                                                        },
                                                        {
                                                            xtype: "label",
                                                            style: {
                                                                color: "red",
                                                                width: "100px",
                                                            },
                                                            text: "* วันที่ตามเอกสาร PR",
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "combo",
                                                    readOnly: true,
                                                    mode: "local",
                                                    store: Ext.torType,
                                                    anchor: "40%",
                                                    fieldLabel: "วิธีดำเนินงาน",
                                                    submitValue: true,
                                                    hiddenName: "tor_type_id",
                                                    name: "c_type_id",
                                                    id: "tor_type_idID",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: false,
                                                    selectOnFocus: true,
                                                    typeAhead: false,
                                                    emptyText: "กรุณาเลือก",
                                                    validator: function (val) {
                                                        if (!Ext.isEmpty(val)) {
                                                            return true;
                                                        } else {
                                                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                        }
                                                    },
                                                    listeners: {
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                if (this.getValue() == 1) {
                                                                    //tor_type_id === 1 (เจาะจง)
                                                                    Ext.getCmp("lableLessID").show();
                                                                } else {
                                                                    Ext.getCmp("lableLessID").hide();
                                                                }
                                                            };
                                                        },
                                                        Change: function () {
                                                            this.fn();
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
                                                },
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "แบบ ",
                                                    name: "lableLess",
                                                    value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                                                    id: "lableLessID",
                                                    listeners: {
                                                        beforerender: function () {},
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                var tor_type_idID = Ext.getCmp("tor_type_idID").getValue();
                                                                if (Ext.getCmp("tor_type_idID").getValue() != 1) {
                                                                    this.hide();
                                                                } else {
                                                                    this.show();
                                                                }
                                                            };
                                                            this.fn();
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "จำนวนเงิน",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "textfield",
                                                            readOnly: true,
                                                            fieldLabel: "จำนวนเงิน",
                                                            name: "f_total_amt",
                                                            id: "f_totalID",
                                                            listeners: {
                                                                blur: function () {
                                                                    this.fn();
                                                                },
                                                                afterrender: function () {
                                                                    this.fn = function () {
                                                                        var val = 0;
                                                                        val = this.getValue();
                                                                        var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                                        this.setValue(Ext.floatRenderer(f_total));
                                                                    };
                                                                    this.fn();
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "textfield",
                                                    readOnly: true,
                                                    fieldLabel: "รหัสเอกสารอ้างอิง",
                                                    name: "d_doc_ref",
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่บันทึกแจ้งเตือน",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "DateAdd1",
                                                            validator: function (val) {
                                                                if (!Ext.isEmpty(val)) {
                                                                    return true;
                                                                } else {
                                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                }
                                                            },
                                                        },
                                                        {
                                                            xtype: "tbspacer",
                                                            width: 18,
                                                        },
                                                        {
                                                            xtype: "label",
                                                            style: {
                                                                color: "red",
                                                                width: "100px",
                                                            },
                                                            text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่บันทึก PA",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "DateAdd2",
                                                            validator: function (val) {
                                                                if (!Ext.isEmpty(val)) {
                                                                    return true;
                                                                } else {
                                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                }
                                                            },
                                                        },
                                                        {
                                                            xtype: "tbspacer",
                                                            width: 18,
                                                        },
                                                        {
                                                            xtype: "label",
                                                            style: {
                                                                color: "red",
                                                                width: "150px",
                                                            },
                                                            text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                                                        },
                                                    ],
                                                },
                                                {
                                                    fieldLabel: "วันที่บันทึก",
                                                    xtype: "datefield",
                                                    name: "d_tor_status_date",
                                                    validator: function (val) {
                                                        if (!Ext.isEmpty(val)) {
                                                            return true;
                                                        } else {
                                                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                        }
                                                    },
                                                },
                                                {
                                                    xtype: "textarea",
                                                    width: 400,
                                                    name: "c_comment",
                                                    //
                                                }, //

                                                Ext.getBodyMultiBudget(Ext.selectRow, 'st0006'),
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [180],
                                                    fieldLabel: "โหมดการบันทึก",
                                                    id: "modesubID",
                                                    hidden: true,
                                                    style: {
                                                        "font-weight": "bold",
                                                    },
                                                    items: [
                                                        {
                                                            name: "mode",
                                                            checked: true,
                                                            inputValue: "UPDATEFORMSTSATUS",
                                                            boxLabel: "อัพเดทรายการ",
                                                        },
                                                    ],
                                                }, 
                                            ],
                                        },
                                        
                                        {
                                            columnWidth: 0.01,
                                            layout: "table",
                                        },
                                    ],
                                },
                                {
                                    xtype: "grid",
                                    id: "gridSub1ID",
                                    border: true,
                                    stripeRows: true,
                                    disableSelection: true,
                                    loadMask: true,
                                    height: 500,
                                    store: Ext.store2,
                                    viewConfig: {
                                        forceFit: true,
                                        emptyText: "ไม่มีข้อมูล..",
                                        deferEmptyText: false,
                                        getRowClass: function (record) {
                                            if (record.data.i_is_victory == true) {
                                                return "td-succeed ";
                                            }
                                        },
                                    },
                                    tbar: [{
                                            xtype: "buttongroup", 
                                            columns: 1,  
                                            defaults: {scale: "small", style: "float: left"},
                                            items: [ { xtype: "label", text: "เป็นผู้ได้รับคัดเลือก เนื่องจาก : "},
                                                        {xtype: "tbspacer", width: 4},
                                                new Ext.form.ComboBox({
                fieldLabel: 'เป็นผู้ได้รับคัดเลือก เนื่องจาก',
                store: new Ext.data.ArrayStore({
                    fields: ['id', 'c_name', 'text'], // เพิ่มฟิลด์ text เข้าไปตรงนี้
                    data: [
                        [1, '1 . เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้เสนอราคาต่ำสุด', '1 . เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้เสนอราคาต่ำสุด'],
                        [2, '2. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ได้คะแนนรวมสูงสุด', '2. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ได้คะแนนรวมสูงสุด'],
                        [3, '3. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ชนะการเสนอราคาตามกฎกระทรวงกำหนดพัสดุและวิธีการจัดซื้อจัดจ้างพัสดุที่รัฐต้องการส่งเสริมหรือสนับสนุน (ฉบับที่ ๒) พ.ศ. ๒๕๖๓', '3. เป็นผู้มีคุณสมบัติและข้อเสนอทางด้านเทคนิคถูกต้องครบถ้วนและเป็นผู้ชนะการเสนอราคาตามกฎกระทรวงกำหนดพัสดุและวิธีการจัดซื้อจัดจ้างพัสดุที่รัฐต้องการส่งเสริมหรือสนับสนุน (ฉบับที่ ๒) พ.ศ. ๒๕๖๓']
                    ]
                }),
          
                id: 'reason_winnerID',
                name: 'reason_winner',
                hiddenName: 'reason_winner', 
               valueField: "c_name",
               displayField: "c_name",
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                width:460,
                emptyText: '--- เลือกเหตุผลความจำเป็น ---',
                selectOnFocus: true,  
                listeners:{
                    afterrender:function(){ 
                          this.setValue(Ext.selectRow.get('reason_winner'));
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
                // เพิ่มคุณสมบัติ 2 บรรทัดนี้
                listWidth: 450, // กำหนดความกว้างขั้นต่ำของตัว Dropdown (ปรับได้ตามความเหมาะสม) 
                tpl: '<tpl for="."><div class="x-combo-list-item" style="white-space: normal; word-wrap: break-word; color: #000000 !important; padding: 5px; min-height: 20px;">{c_name}</div></tpl>',
                itemSelector: 'div.x-combo-list-item'
            }),
                                            ],
                                            // buttonAlign: "left",
                                        },
                                        {
                                            xtype: "buttongroup",
                                            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
                                            columns: 1,
                                            defaults: {scale: "small", style: "float: right"},
                                            items: [
                                                {
                                                    xtype: "buttongroup",
                                                    frame: false,
                                                    items: [
                                                        {xtype: "label", text: "ผู้เสนอราคา : "},
                                                        {xtype: "tbspacer", width: 4},
                                                        new Ext.form.ComboBox({
                                                            id: "all_bidderID",
                                                            store: Ext.all_bidder,
                                                            valueField: "id",
                                                            displayField: "c_name",
                                                            mode: "local",
                                                            name:'winner',
                                                            triggerAction: "all",
                                                            forceSelection: true,
                                                            selectOnFocus: true,
                                                            typeAhead: false,
                                                            emptyText: "กรุณาเลือก...",
                                                            width: 354,
                                                            value: "0",
                                                            listeners: {
                                                                afterrender:function(){ 
                          this.setValue(Ext.selectRow.get('winner'));
                          alert(Ext.getCmp('all_bidderID').getValue());
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
                                                        {xtype: "tbspacer", width: 4},
                                                        // { xtype: "tbfill" },
                                                        {
                                                            text: " &nbsp;&nbsp;พิจารณาผลจากผู้เสนอราคา",
                                                            iconCls: "icon-save",
                                                            handler: function () {
                                                                var msg = "";
                                                                if (Ext.getCmp("all_bidderID").getValue() == 0) {
                                                                    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                                }
                                                                if (msg == "") {
                                                                    Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                    Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                    Ext.bidder_select.load({
                                                                        callback: function (recordx, operation, success) {
                                                                            if (success) {
                                                                                const cancel_victory_all_bidderID = function (id) {
                                                                                    var win = new Ext.Window({
                                                                                        id: "win-msg-delete",
                                                                                        title: "Remove",
                                                                                        modal: true,
                                                                                        width: 250,
                                                                                        height: 130,
                                                                                        html: "ท่านต้องการที่จะยกเลิกรายการนี้ ?",
                                                                                        buttons: [
                                                                                            {
                                                                                                text: "Confirm",
                                                                                                handler: function () {
                                                                                                    Ext.Ajax.request({
                                                                                                        url: "tor/api/mnTorController.php",
                                                                                                        params: {
                                                                                                            mode: "DELETE_SP_TOR_VICTORY",
                                                                                                            id: id,
                                                                                                        },
                                                                                                        method: "GET", //POST
                                                                                                        success: function (result, request) {
                                                                                                            Ext.getCmp("win-msg-delete").destroy();
                                                                                                            Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                            Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                                                            Ext.bidder_select.load({
                                                                                                                callback: function (record, operation, success) {
                                                                                                                    if (success) {
                                                                                                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                                        Ext.store2.load();
                                                                                                                    }
                                                                                                                },
                                                                                                            });
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
                                                                                                    Ext.getCmp("tabpanel1").getStore().reload();
                                                                                                },
                                                                                            },
                                                                                        ],
                                                                                    }).show();
                                                                                };

                                                                                check_allID = function (v) {
                                                                                    if (v) {
                                                                                        var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                        var row = 0;
                                                                                        while (num >= row) {
                                                                                            if (Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                                document.getElementById("chk_B_" + row).checked = true;
                                                                                            }
                                                                                            row++;
                                                                                        }
                                                                                    } else {
                                                                                        var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                        var row = 0;
                                                                                        while (num >= row) {
                                                                                            if (Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                                document.getElementById("chk_B_" + row).checked = false;
                                                                                            }
                                                                                            row++;
                                                                                        }
                                                                                    }
                                                                                };

                                                                                var win = new Ext.Window({
                                                                                    labelWidth: 175,
                                                                                    collapsible: true,
                                                                                    maximizable: true,
                                                                                    modal: true,
                                                                                    title: "ผู้เสนอราคา : " + Ext.getCmp("all_bidderID").lastSelectionText,
                                                                                    id: "win-frm-contractID",
                                                                                    layout: "fit",
                                                                                    border: false,
                                                                                    width: 900,
                                                                                    height: 500,
                                                                                    items: [
                                                                                        new Ext.grid.GridPanel({
                                                                                            id: "grid_all_bidder",
                                                                                            region: "center",
                                                                                            layout: "fit",
                                                                                            border: false,
                                                                                            stripeRows: true,
                                                                                            loadMask: true,
                                                                                            height: 1000,
                                                                                            clicksToEdit: 1,
                                                                                            // disableSelection: true,
                                                                                            store: Ext.bidder_select,
                                                                                            viewConfig: {
                                                                                                forceFit: true,
                                                                                                emptyText: "ไม่มีข้อมูล..",
                                                                                                deferEmptyText: false,
                                                                                                getRowClass: function (record) {
                                                                                                    if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id != null) {
                                                                                                        return "td-succeed ";
                                                                                                    }
                                                                                                    if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id == null) {
                                                                                                        return "td-wait ";
                                                                                                    }
                                                                                                },
                                                                                            },
                                                                                            listeners: {
                                                                                                beforerender: function () {
                                                                                                    this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                                                                        var record = grid.getStore().getAt(rowIndex);
                                                                                                        if (columnIndex === grid.getColumnModel().getIndexById("cancel_bidder_dtl")) {
                                                                                                            if (record.data.sp_tor_bidder_dtl_id != null) {
                                                                                                                cancel_victory_all_bidderID(record.data.sp_tor_bidder_dtl_id);
                                                                                                            }
                                                                                                        }
                                                                                                    };
                                                                                                },
                                                                                                afterrender: function () {
                                                                                                    Ext.getCmp("grid_all_bidder").on("cellclick", this.thisCick, this);
                                                                                                },
                                                                                            },
                                                                                            columns: [
                                                                                                new Ext.grid.RowNumberer({
                                                                                                    header: "ที่",
                                                                                                    dataIndex: "no",
                                                                                                    sortable: false,
                                                                                                    id: "idID",
                                                                                                    width: 30,
                                                                                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                        metaData.attr = "style='cursor:pointer; text-align:center;';";
                                                                                                        return record.get("no");
                                                                                                    },
                                                                                                }),
                                                                                                {header: "ID System", hidden: true, dataIndex: "sp_tor_bidder_dtl_id"},

                                                                                                {
                                                                                                    header: "<div class='topAlign'><input id='check_allID' type='checkbox' onchange='check_allID(this.checked)'></div>",
                                                                                                    sortable: false,
                                                                                                    align: "center",
                                                                                                    dataIndex: "CheckColumn",
                                                                                                    width: 50,
                                                                                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                        // metaData.style="background-color:#ffaaaa !important;";
                                                                                                        // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                                                                                        // metaData.style = "background:#FFE0D2;";
                                                                                                        if (record.data.victory_id > 0) {
                                                                                                            var readonly = "disabled";
                                                                                                            var checked = record.data.victory_id == Ext.getCmp("all_bidderID").getValue() ? "checked" : "";
                                                                                                        } else {
                                                                                                            var readonly = "";
                                                                                                            var checked = "";
                                                                                                        }
                                                                                                        console.log(record.data.sp_tor_bidder_dtl_id);
                                                                                                        return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_B_" + row + "' value='" + value + "' " + checked + "  " + readonly + "> ";
                                                                                                    },
                                                                                                },
                                                                                                {
                                                                                                    header: "ราคาเสนอ/ต่อหน่วย (รวม VAT)",
                                                                                                    sortable: false,
                                                                                                    dataIndex: "f_bid_unit_price",
                                                                                                    align: "right",
                                                                                                    width: 114,
                                                                                                },
                                                                                                {
                                                                                                    hidden: true,
                                                                                                    sortable: false,
                                                                                                    dataIndex: "victory_id",
                                                                                                    align: "right",
                                                                                                    width: 114,
                                                                                                },
                                                                                                {
                                                                                                    header: "ราคาเสนอ (รวม)",
                                                                                                    sortable: false,
                                                                                                    dataIndex: "f_bid_total_price",
                                                                                                    align: "right",
                                                                                                    width: 114,
                                                                                                },
                                                                                                {
                                                                                                    header: "รายการ",
                                                                                                    sortable: false,
                                                                                                    dataIndex: "c_name",
                                                                                                    width: 200,
                                                                                                },
                                                                                                {
                                                                                                    header: "จำนวน",
                                                                                                    sortable: false,
                                                                                                    align: "center",
                                                                                                    dataIndex: "i_qty",
                                                                                                    width: 70,
                                                                                                },
                                                                                                {
                                                                                                    header: "ราคาต่อหน่วย",
                                                                                                    sortable: false,
                                                                                                    align: "right",
                                                                                                    dataIndex: "f_unit_price",
                                                                                                    width: 120,
                                                                                                },
                                                                                                {
                                                                                                    header: "ราคาทั้งหมด",
                                                                                                    sortable: false,
                                                                                                    align: "right",
                                                                                                    dataIndex: "f_total_price",
                                                                                                    width: 120,
                                                                                                },
                                                                                                {
                                                                                                    id: "cancel_bidder_dtl",
                                                                                                    header: "ยกเลิก",
                                                                                                    sortable: false,
                                                                                                    align: "center",
                                                                                                    width: 40,
                                                                                                    dataIndex: "id",
                                                                                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                        if (record.data.victory_id == Ext.getCmp("all_bidderID").getValue()) {
                                                                                                            return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                                                                        }
                                                                                                    },
                                                                                                },
                                                                                                {width: 20, dataIndex: ""},
                                                                                            ],
                                                                                        }),
                                                                                    ],
                                                                                    // liesteners: {
                                                                                    //   afterrender: function () {
                                                                                    //     this.fn = function () {
                                                                                    //       alert(this.getValue());
                                                                                    //     };
                                                                                    //     this.fn();
                                                                                    //   },
                                                                                    // },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: "บันทึก",
                                                                                            handler: function () {
                                                                                                let msg = "";
                                                                                                let jsonArr = [];
                                                                                                // console.log(Ext.getCmp("grid_all_bidder"));
                                                                                                var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                                var row = 0;
                                                                                                while (num >= row) {
                                                                                                    if (document.getElementById("chk_B_" + row).checked == true && Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                                        jsonArr.push({
                                                                                                            c_name: Ext.getCmp("grid_all_bidder").store.data.items[row].data.dc_creditor_name,
                                                                                                            sp_tor_bidder_dtl_id: Ext.getCmp("grid_all_bidder").store.data.items[row].data.sp_tor_bidder_dtl_id,
                                                                                                            dc_creditor_id: Ext.getCmp("all_bidderID").getValue(),
                                                                                                            sp_tor_dtl_id: Ext.getCmp("grid_all_bidder").store.data.items[row].data.sp_tor_dtl_id,
                                                                                                            sp_tor_id: Ext.SP_TOR_ID,
                                                                                                        });
                                                                                                    }
                                                                                                    row++;
                                                                                                }
                                                                                                if (jsonArr.length <= 0) {
                                                                                                    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
                                                                                                    console.log("testt");
                                                                                                }
                                                                                                if (msg == "") {
                                                                                                    // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
                                                                                                    Ext.Ajax.request({
                                                                                                        url: "tor/api/mnTorController.php",
                                                                                                        method: "POST",
                                                                                                        params: {
                                                                                                            mode: "UP_SP_TOR_VICTORY",
                                                                                                            data: JSON.stringify(jsonArr),
                                                                                                        },
                                                                                                        success: function (result, request) {
                                                                                                            // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                                                                                                            let json = Ext.util.JSON.decode(result.responseText);
                                                                                                            Ext.Msg.alert("แจ้งเตือน", json.msg);
                                                                                                            Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                            Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                                                            Ext.bidder_select.load({
                                                                                                                callback: function (record, operation, success) {
                                                                                                                    if (success) {
                                                                                                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                                        Ext.store2.load();
                                                                                                                    }
                                                                                                                },
                                                                                                            });
                                                                                                            if (json.success == true) {
                                                                                                                Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                                                                                                            }
                                                                                                        },
                                                                                                        failure: function (result, request) {
                                                                                                            Ext.MessageBox.alert("Failed", result.responseText);
                                                                                                        },
                                                                                                    });
                                                                                                } else {
                                                                                                    Ext.Msg.alert("แจ้งเตือน", msg);
                                                                                                }

                                                                                                // msg = "";
                                                                                                // if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                                                                                                //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                                                                // } else {
                                                                                                //   var Row = 0;
                                                                                                //   var RowMax = Ext.store2.data.length - 1;
                                                                                                //   var RowCreditor = Ext.store2.data.items;
                                                                                                //   var NewCreditor = Ext.getCmp("dc_creditor_idID").getValue();
                                                                                                //   while (RowMax > Row) {
                                                                                                //     if (RowCreditor[Row].data.dc_creditor_id == NewCreditor) {
                                                                                                //       msg += "<span style='white-space: nowrap;'>- มีผู้เสนอราคารายนี้แล้ว</span><br>";
                                                                                                //     }
                                                                                                //     Row++;
                                                                                                //   }
                                                                                                // }
                                                                                                // if (msg == "") {
                                                                                                //   var formSubmit = function () {
                                                                                                //     form.submit({
                                                                                                //       waitMsg: "Saving Data...",
                                                                                                //       success: function (form, action) {
                                                                                                //         Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                                //           Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                                //           // Ext.selectRow = null;
                                                                                                //           Ext.getCmp("win-frm-contractID").destroy();
                                                                                                //         });
                                                                                                //       },
                                                                                                //       failure: function (form, action) {
                                                                                                //         switch (action.failureType) {
                                                                                                //           case Ext.form.Action.CLIENT_INVALID:
                                                                                                //             Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                                                //             break;
                                                                                                //           case Ext.form.Action.CONNECT_FAILURE:
                                                                                                //             Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                                                //             break;
                                                                                                //           case Ext.form.Action.SERVER_INVALID:
                                                                                                //             Ext.Msg.alert("Failure", action.result.msg);
                                                                                                //         }
                                                                                                //       },
                                                                                                //     });
                                                                                                //   }; //END
                                                                                                // } else {
                                                                                                //   Ext.Msg.alert("แจ้งเตือน", msg);
                                                                                                // }

                                                                                                // var form = Ext.getCmp("form-widgets").getForm();
                                                                                                // if (form.isValid()) {
                                                                                                //   if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                                                                //   } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                                                                //     Ext.MessageBox.show({
                                                                                                //       title: "Icon Support",
                                                                                                //       msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                                                                //       buttons: Ext.MessageBox.OKCANCEL,
                                                                                                //       icon: Ext.MessageBox.WARNING,
                                                                                                //       fn: function (btn) {
                                                                                                //         if (btn === "ok") {
                                                                                                //           formSubmit(form);
                                                                                                //         } else {
                                                                                                //           return;
                                                                                                //         }
                                                                                                //       },
                                                                                                //     });
                                                                                                //   } else {
                                                                                                //     if (msg == "") {
                                                                                                //       formSubmit(form);
                                                                                                //     }
                                                                                                //   }
                                                                                                // }
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            text: "ย้อนกลับ",
                                                                                            handler: function () {
                                                                                                Ext.getCmp("win-frm-contractID").destroy();
                                                                                                Ext.getCmp("winMain").destroy();
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                });
                                                                                win.show();
                                                                            }
                                                                        },
                                                                    });
                                                                } else {
                                                                    Ext.Msg.alert("แจ้งเตือน", msg);
                                                                }
                                                                // search();
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                            // buttonAlign: "left",
                                        },
                                     
                                        '->', 

                                    ],
                                    listeners: {
                                        beforerender: function () {
                                            // Ext.DidderHdr = function (evt, rec) {
                                            //   var win = new Ext.Window({
                                            //     labelWidth: 175,
                                            //     collapsible: true,
                                            //     maximizable: true,
                                            //     modal: true,
                                            //     title: "เพิ่มผู้เสนอราคา",
                                            //     id: "win-frm-contractID",
                                            //     layout: "fit",
                                            //     border: false,
                                            //     width: 630,
                                            //     height: 135,
                                            //     items: [
                                            //       {
                                            //         xtype: "form",
                                            //         id: "form-widgets",
                                            //         url: "tor/api/mnTorController.php",
                                            //         frame: true,
                                            //         labelAlign: "left",
                                            //         autoScroll: true,
                                            //         labelWidth: 100,
                                            //         bodyStyle: { padding: "10px 20px" },
                                            //         defaults: { msgTarget: "side" },
                                            //         items: [
                                            //           // {
                                            //           //   id: "role-form-mode",
                                            //           //   xtype: "hidden",
                                            //           //   name: "mode",
                                            //           //   value: "ADD",
                                            //           //   readOnly: true,
                                            //           // },
                                            //           {
                                            //             xtype: "hidden",
                                            //             name: "id",
                                            //             // value: Ext.selectRow.data.id,
                                            //             id: "idID",
                                            //           },
                                            //           {
                                            //             xtype: "hidden",
                                            //             name: "sp_tor_id",
                                            //             value: Ext.SP_TOR_ID,
                                            //           },
                                            //           {
                                            //             xtype: "hidden",
                                            //             name: "sp_tor_bidder_hdr_id",
                                            //             value: Ext.SP_TOR_BIDDER_HDR_ID,
                                            //           },
                                            //           {
                                            //             xtype: "hidden",
                                            //             name: "mode",
                                            //             value: "UP_SP_TOR_BIDDER_HDR",
                                            //             readOnly: true,
                                            //           },
                                            //         ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                                            //         viewConfig: { forceFit: true },
                                            //       },
                                            //     ],
                                            //     // liesteners: {
                                            //     //   afterrender: function () {
                                            //     //     this.fn = function () {
                                            //     //       alert(this.getValue());
                                            //     //     };
                                            //     //     this.fn();
                                            //     //   },
                                            //     // },
                                            //     buttons: [
                                            //       {
                                            //         text: "Save",
                                            //         handler: function () {
                                            //           msg = "";
                                            //           if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                                            //             msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                            //           } else {
                                            //             var Row = 0;
                                            //             var RowMax = Ext.store2.data.length - 1;
                                            //             var RowCreditor = Ext.store2.data.items;
                                            //             var NewCreditor = Ext.getCmp("dc_creditor_idID").getValue();
                                            //             while (RowMax > Row) {
                                            //               if (RowCreditor[Row].data.dc_creditor_id == NewCreditor) {
                                            //                 msg += "<span style='white-space: nowrap;'>- มีผู้เสนอราคารายนี้แล้ว</span><br>";
                                            //               }
                                            //               Row++;
                                            //             }
                                            //           }
                                            //           if (msg == "") {
                                            //             var formSubmit = function () {
                                            //               form.submit({
                                            //                 waitMsg: "Saving Data...",
                                            //                 success: function (form, action) {
                                            //                   Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                            //                     Ext.getCmp("gridSub1ID").getStore().reload();
                                            //                     // Ext.selectRow = null;
                                            //                     Ext.getCmp("win-frm-contractID").destroy();
                                            //                   });
                                            //                 },
                                            //                 failure: function (form, action) {
                                            //                   switch (action.failureType) {
                                            //                     case Ext.form.Action.CLIENT_INVALID:
                                            //                       Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                            //                       break;
                                            //                     case Ext.form.Action.CONNECT_FAILURE:
                                            //                       Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                            //                       break;
                                            //                     case Ext.form.Action.SERVER_INVALID:
                                            //                       Ext.Msg.alert("Failure", action.result.msg);
                                            //                   }
                                            //                 },
                                            //               });
                                            //             }; //END
                                            //           } else {
                                            //             Ext.Msg.alert("แจ้งเตือน", msg);
                                            //           }

                                            //           var form = Ext.getCmp("form-widgets").getForm();
                                            //           if (form.isValid()) {
                                            //             if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                            //             } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                            //               Ext.MessageBox.show({
                                            //                 title: "Icon Support",
                                            //                 msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                            //                 buttons: Ext.MessageBox.OKCANCEL,
                                            //                 icon: Ext.MessageBox.WARNING,
                                            //                 fn: function (btn) {
                                            //                   if (btn === "ok") {
                                            //                     formSubmit(form);
                                            //                   } else {
                                            //                     return;
                                            //                   }
                                            //                 },
                                            //               });
                                            //             } else {
                                            //               if (msg == "") {
                                            //                 formSubmit(form);
                                            //               }
                                            //             }
                                            //           }
                                            //         },
                                            //       },
                                            //       {
                                            //         text: "Cancel",
                                            //         handler: function () {
                                            //           Ext.getCmp("win-frm-contractID").destroy();
                                            //         },
                                            //       },
                                            //     ],
                                            //   });

                                            //   win.show();
                                            // };
                                            function TabNext(rec, event) {
                                                if (event == "view") {
                                                    Ext.getCmp("winChequeID").setActiveTab(1);
                                                    Ext.getCmp("tabpanelMain2ID").setTitle(rec.data.c_name);
                                                    Ext.getCmp("winChequeID").unhideTabStripItem(1);
                                                }

                                            }
                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                Ext.saveDtlID = false;
                                                Ext.SelectStore = Ext.store2.getAt(rowIndex);
                                                if (columnIndex === grid.getColumnModel().getIndexById("detailBidder")) {
                                                    Ext.SP_TOR_ID = Ext.SelectStore.data.sp_tor_id;
                                                    Ext.SP_TOR_DTL_ID = Ext.SelectStore.data.sp_tor_dtl_id;
                                                    Ext.DC_CREDITOR_ID = Ext.SelectStore.data.dc_creditor_id;

                                                    Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                    Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                                                    Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                                                    Ext.store3.load({
                                                        callback: function (recordx, operation, success) {
                                                            if (success) {
                                                                var sto = recordx;
                                                                sto.forEach(function (v) {
                                                                    if (v.get('CheckColumn') === true) {
                                                                        Ext.saveDtlID = true;
                                                                    }


                                                                });

                                                                TabNext(record, "view"); //on

                                                            }
                                                        }
                                                    });


//                                                    Ext.getCmp('saveDtlID').setDisabed(true);
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    columns: colPOP,
                                },
                            ],
                            buttonAlign: "center",
                            buttons: [
                                {
                                    text: "บันทึกรายการ...",
                                    id: "buSaveSubID",
                                    iconCls: "icon-save",
                                    handler: function () {
                                        console.log(Ext.store2.sum("i_is_victory"));
                                        var msg = "";
                                        if (Ext.store2.sum("i_is_victory") != Ext.store2.data.length) {
                                            msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้ชนะให้ครบ</span><br>";
                                        }
                                        if (Ext.getCmp('reason_winnerID').getValue() =='') {
                                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุผู้ได้รับคัดเลือก เนื่องจาก</span><br>";
                                            
                                             
                                        }
                                        if (msg == "") {
                                            var formSubmit = function () {
                                                form.submit({
                                                    waitMsg: "Saving Data...",
                                                    success: function (form, action) {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                            Ext.selectRow = null;
                                                            Ext.getCmp("winMain").destroy();
                                                        });
                                                    },
                                                    failure: function (form, action) {
                                                        switch (action.failureType) {
                                                            case Ext.form.Action.CLIENT_INVALID:
                                                                Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                break;
                                                            case Ext.form.Action.CONNECT_FAILURE:
                                                                Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                break;
                                                            case Ext.form.Action.SERVER_INVALID:
                                                                Ext.Msg.alert("Failure", action.result.msg);
                                                        }
                                                    },
                                                });
                                            }; //END

                                            var form = Ext.getCmp(Ext.poFormID).getForm();
                                            if (form.isValid()) {
                                                if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                    Ext.MessageBox.show({
                                                        title: "Icon Support",
                                                        msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                        buttons: Ext.MessageBox.OKCANCEL,
                                                        icon: Ext.MessageBox.WARNING,
                                                        fn: function (btn) {
                                                            if (btn === "ok") {
                                                                formSubmit(form);
                                                            } else {
                                                                return;
                                                            }
                                                        },
                                                    });
                                                } else {
                                                    formSubmit(form);
                                                }
                                            }
                                        } else {
                                            Ext.Msg.alert("แจ้งเตือน", msg);
                                        }
                                    },

                                    //haddler
                                },
                                {
                                    text: Ext.GLOBAL_BU_BACK_TH,
                                    iconCls: "icon-cancel",
                                    handler: function () {
                                        Ext.getCmp("winMain").destroy();
                                    },
                                },
                            ],
                        }),
                        {
                            title: "",
                            frame: true,
                            autoScroll: true,
                            id: "tabpanelMain2ID",
                            iconCls: "icon-contract",
                            layout: "form", //form
                            border: false,
                            // viewConfig: { forceFit: true },
                            items: [
                                new Ext.grid.GridPanel({
                                    id: "gridEditor2",
                                    region: "center",
                                    layout: "fit",
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    height: 1000,
                                    clicksToEdit: 1,
                                    disableSelection: true,
                                    store: Ext.store3,
                                    viewConfig: {
                                        forceFit: true,
                                        emptyText: "ไม่มีข้อมูล..",
                                        deferEmptyText: false,
                                        getRowClass: function (record) {
                                            if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id != null) {
                                                return "td-succeed ";
                                            }
                                            if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id == null) {
                                                return "td-wait ";
                                            }
                                        },
                                    },
                                    listeners: {
                                        beforerender: function () {
                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                if (columnIndex === grid.getColumnModel().getIndexById("cancel_victory")) {
                                                    if (record.data.CheckColumn == true) {
                                                        cancel_victory(record.data.sp_tor_bidder_dtl_id);
                                                    }
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridEditor2").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    columns: [
                                        new Ext.grid.RowNumberer({
                                            header: "ที่",
                                            dataIndex: "no",
                                            sortable: false,
                                            id: "idID",
                                            width: 30,
                                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                                metaData.attr = "style='cursor:pointer; text-align:center;';";
                                                return record.get("no");
                                            },
                                        }),
                                        // { width: 35, header: " ที่ ", align: "center", dataIndex: "no" },
                                        {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
                                        {
                                            header: "-",
                                            sortable: false,
                                            align: "center",
                                            dataIndex: "CheckColumn",
                                            width: 40,
                                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                                // metaData.style="background-color:#ffaaaa !important;";
                                                // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                                // metaData.style = "background:#FFE0D2;";
                                                var checked = value ? "checked" : "";
                                                var readonly = record.data.i_is_victory == 1 ? "disabled" : "";
                                                return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_" + row + "' value='" + value + "' " + checked + " " + readonly + "> ";
                                            },
                                        },
                                        {
                                            header: "ชื่อผู้เสนอ",
                                            sortable: false,
                                            dataIndex: "dc_creditor_name",
                                            width: 200,
                                        },
                                        {
                                            header: "ราคาเสนอ (ต่อหน่วย)",
                                            sortable: false,
                                            dataIndex: "f_bid_unit_price",
                                            align: "right",
                                            width: 114,
                                        },
                                        {
                                            header: "จำนวนเสนอ",
                                            sortable: false,
                                            dataIndex: "i_bid_qty",
                                            align: "center",
                                            width: 114,
                                        },
                                        {
                                            header: "ราคาเสนอ (รวม)",
                                            dataIndex: "f_bid_total_price",
                                            sortable: false,
                                            align: "right",
                                            width: 114,
                                        },
                                        {
                                            header: "จำนวน",
                                            sortable: false,
                                            align: "center",
                                            dataIndex: "i_qty",
                                            width: 70,
                                        },
                                        {
                                            header: "ราคาต่อหน่วย",
                                            sortable: false,
                                            align: "right",
                                            dataIndex: "f_unit_price",
                                            width: 120,
                                        },
                                        {
                                            header: "ราคาทั้งหมด",
                                            sortable: false,
                                            align: "right",
                                            dataIndex: "f_total_price",
                                            width: 120,
                                        },
                                        {
                                            header: "หน่วยนับ",
                                            sortable: false,
                                            align: "center",
                                            dataIndex: "dc_unit_type_name",
                                            width: 120,
                                        },
                                        {
                                            id: "cancel_victory",
                                            header: "ยกเลิก",
                                            sortable: false,
                                            align: "center",
                                            width: 40,
                                            dataIndex: "id",
                                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                                if (record.data.CheckColumn == true) {
                                                    return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                }
                                            },
                                        },
                                        {width: 20, dataIndex: ""},
                                    ],
                                }),
                            ],
                            bbar: [
                                {
                                    text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
                                    id: "saveDtlID",
                                    //disabled: Ext.saveDtlID===false ? true : false,
                                    iconCls: "icon-save",
                                    listeners: {
                                        afterrender: function () {
//                                            alert(Ext.saveDtlID+' >>>> '+1);
                                            this.setDisabled(Ext.saveDtlID === true ? true : false);
                                        }
                                    },
                                    handler: function () {

                                        saveDtl("SAVE_DTL");
                                    },
                                },
                                "->",
                                {
                                    id: "buBackSub2ID",
                                    xtype: "button",
                                    iconCls: "icon-back",
                                    text: "ย้อนกลับ",
                                    handler: function () {
                                        Ext.getCmp("winChequeID").setActiveTab(0);
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    };

    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else
            Ext.dc_cost.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        Ext.po_emp.reload({
                            callback: function (recordx, operation, success) {
                                if (success) {
                                    Ext.po_user_permission.reload({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.dc_expense_budget_type.reload({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            Ext.po_expense_group.reload({
                                                                callback: function (recordx, operation, success) {
                                                                    if (success) {
                                                                        Ext.po_expense.reload({
                                                                            callback: function (recordx, operation, success) {
                                                                                if (success) {
                                                                                    //AppPoStore(statusx).show();

                                                                                    if (statusx == "add") {
                                                                                        Ext.HDR_ID = null;
                                                                                        Ext.selectRow = null;
                                                                                        Ext.i_is_more = 0;
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        winApp.show();
                                                                                    } else if (statusx === "edit") {
                                                                                        Ext.SP_TOR_ID = Ext.selectRow.data.id;
                                                                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                        Ext.store2.load();
                                                                                        Ext.all_bidder.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                        Ext.all_bidder.load();

                                                                                        if (!Ext.selectRow.get("po_expense_id"))
                                                                                            Ext.selectRow.set("po_expense_id", null);
                                                                                        if (!Ext.selectRow.get("po_creditor_id"))
                                                                                            Ext.selectRow.set("po_creditor_id", null);
                                                                                        if (!Ext.selectRow.get("dc_expense_budget_type_id"))
                                                                                            Ext.selectRow.set("dc_expense_budget_type_id", null);
                                                                                        if (!Ext.selectRow.get("bg_budget_dtl_project_id"))
                                                                                            Ext.selectRow.set("bg_budget_dtl_project_id", null);
                                                                                        if (!Ext.selectRow.get("dc_department_id"))
                                                                                            Ext.selectRow.set("dc_department_id", null);
                                                                                        if (!Ext.selectRow.get("dc_cost_id"))
                                                                                      Ext.selectRow.set("dc_cost_id", null);
                                                                                  
                                                                                   
                                                                                       
                                                                                  
//  if(!Ext.isEmpty(Ext.selectRow.get('reason_winner'))){                                                                                      
//        console.log(Ext.selectRow.get('reason_winner'));
//        const text =Ext.selectRow.get('reason_winner'); 
//        // Split ด้วยจุด แล้วเอาสมาชิกตัวแรก [0]
//        const onlyNumber = text.split('.')[0];  
//        console.log(onlyNumber);  
//        const intNumber = parseInt(onlyNumber, 10); // ได้เลข 3 (Integer)
//        Ext.selectRow.set('reason_winner',intNumber);
//  }
                                                                                        console.log('reason_winner',Ext.selectRow.get('reason_winner'));
                                                                                        var winApp = AppPoStore(statusx);
                                                                           
                                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                        winApp.show();
                                                                                       
                                                                                        Ext.getCmp("winChequeID").hideTabStripItem(1);
                                                                                    }

                                                                                    //
                                                                                }
                                                                            },
                                                                        }); //po_expense
                                                                    }
                                                                },
                                                            }); //po_expense_group
                                                        }
                                                    },
                                                }); //dc_expense_budget_type
                                            }
                                        },
                                    }); //po_user_permission
                                }
                            },
                        }); //po_emp
                    }
                },
            });
    };
};
