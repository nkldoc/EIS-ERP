<?PHP
class api
{
    public $tor_id;
    public $sp_tor_contract_id;
    public $i_period;
    public $d_doc_date;
    public $d_period_date;
    public $i_day;
    public $i_alert;
    public $f_total_amt;
    public $dc_cost2_id;


    public function getFiledperiodPicup()
    {

        $tbl_dtl[] = array(
            'erp_dtl_period_id' => 1218,
            'c_name' => 'ซื้อวัสดุสำนักงาน 63 รายการ',
            'i_qty' => 63,
            'dc_unit_id' => 1,
            'dc_unit_name' => "รายการ",
            'f_net_unit_price' => '100,000.00',
            'dc_product_type_id' => 24,
            'dc_product_type_name' => "วัสดุสำนักงาน"

        );

        $data[] = array(
            'erp_hdr_period_id' => 1218,
            'sp_tor_contract_id' => 658,  //req
            'c_doc_ref' => 'inv1001',
            'd_pickup_date' => '2023-07-14',
            'c_comment' => 'test',
            'tbl_dtl' => $tbl_dtl
        );

        return array(
            "datatype" => "periodPickup",
            "data" => $data
        );
    }

    public function getFiledperiod()
    {
        /*
        post contract:[   
            'mode': UP_SP_TOR_HDR_PERIOD
            'sp_tor_hdr_period_id': 
            'tor_id': 700
            'sp_tor_contract_id': 658
            'i_is_po': 0
            'i_is_purchase': 
            'ap_po_hdr_id': 
            'i_period': 1
            'd_doc_date': '17-07-2566'
            'i_day_use_l': 1
            'd_period_date': '21-07-2566'
            'i_day': 4
            'i_alert': 1
            'f_total_amt': '100,000.00'
            'dc_expense_budget_type_id': 2
            'dc_bg_budget_type_id': 'เงินรายได้คณะแพทย์ฯ-โรงพยาบาล'
            'dc_cost2_id': 38
            'i_pr_type1': 1
            'c_discription3': 
            'copy_contract_dtl': save
        ]  
        reqest:[
                        mode: UP_SP_TOR_DTL_PERIOD_NEW
                        sp_tor_id: 700
                        sp_tor_contract_id: 658
                        sp_tor_hdr_period_id: 1218
                        dc_bg_budget_type_id: 2
                        po_expense_id: 119
                        i_hire_type: 1
                        i_product_type: 1
                        i_is_inv: 1
                        c_name: ซื้ือวัสดุสำนักงาน 63 รายการ
                        i_qty: 1
                        f_net_unit_price: 100,000.00
                        dc_unit_type_id: 24
                    ] 
                    tbl_dtl[{
                                "sp_tor_hdr_period_id":1218,
                                "c_name":"ซื้ือวัสดุสำนักงาน 63 รายการ",
                                "product_type_id":1,
                                "i_qty":63,
                                "f_net_unit_price":"100,000.00",
                                "dc_unit_type_id":24,
                                "dc_unit_name":"รายการ"
                            }]
*/

        $tbl_dtl[] = array(
            'erp_dtl_period_id' => 1218,
            'c_name' => 'ซื้อวัสดุสำนักงาน 63 รายการ',
            'i_qty' => 63,
            'dc_unit_id' => 1,
            'dc_unit_name' => "รายการ",
            'f_net_unit_price' => '100,000.00',
            'dc_product_type_id' => 24,
            'dc_product_type_name' => "วัสดุสำนักงาน"

        );

        $data[] = array(
            'erp_hdr_period_id' => 1218,
            'tor_id' => 700, //req
            'sp_tor_contract_id' => 658,  //req
            'i_period' => 1, //req
            'd_doc_date' => '17-07-2566', //req
            'd_period_date' => '21-07-2566', //req 
            'i_day' => 4, //req 
            'i_alert' => 1, //req
            'f_total_amt' => '100,000.00', //req  
            'dc_cost2_id' => 38,
            'tbl_dtl' => $tbl_dtl
        );
        return array(
            "datatype" => "periodBilling",
            "data" => $data
        );
    }
};
