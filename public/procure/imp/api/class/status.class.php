<?php //global function
class StatusOrder
{
    public $bar;
	
    
        public function __construct($db) {
                    $this->db = $db;
                    $this->msg = null;  
        }
 
	public function DtlBilling($id=0){
		
                if($id>0){
                $sql = "select count(a.ar_bill_invoice_dtl_id) from ar_bill_invoice_dtl a
                                        inner join ar_bill_invoice_hdr b on a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id 
                                where isnull(b.i_enable,2) = 1 and a.ar_so_dtl_id =?";
 
                    return $this->db->GetDataBySQL($sql, array($id));
                }else{
                    return 0;
                }
	}	
    
	public function printLog($a){
		$m = $this->{$a};
		if (is_object($m)) var_dump($m); else echo $m; 
	}
	
        function __destruct(){}
}
?>