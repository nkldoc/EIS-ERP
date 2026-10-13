<?php

 class clsPageStatus {
 private $temp;

     function __construct($db, $req) {
         $this->db = $db;
         $this->req_name = $req;

         $stmt = $this->db->QueryParam("select [sp_status_hdr_id] as id ,[sp_type_status_id] as type_id , js,c_code,c_name,i_alarm,i_day,i_config from dbo.sp_status_hdr where c_code=?", array($this->req_name));
         while ($row = $db->Fetch($stmt)) {
             $this->temp = array(
                 "id" => $row["id"] ?? 0,
                 "type_id" => $row["type_id"] ?? 0,
                 "js" => $row["js"] ?? null,
                 "c_code" => $row["c_code"] ?? null,
                 "c_name" => $row["c_name"] ?? 0,
                 "i_day" => $row["i_day"] ?? 0,
                 "i_alarm" => $row["i_alarm"] ?? 0,
                 "i_config" => $row["i_config"] ?? 0
             );
         }
     }

     // Methods
     function set_name($name) {
         $this->name = $name;
     }

     function get_name() {
         return $this->name;
     }

     function get_id() {
         return $this->temp['id'];
     }

     function get_type_id() {
         return $this->temp['type_id'];
     }

     function get_i_alarm() {
         return $this->temp['i_alarm'];
     }

     function get_i_day() {
         return $this->temp['i_day'];
     }

     function get_i_config() {
         return $this->temp['i_config'];
     }

     function get_js() {
         return $this->temp['js'];
     }

     function get_code() {
         return $this->temp['c_code'];
     }

     function get_menu() {
         return $this->temp['c_name'];
     }

 }



