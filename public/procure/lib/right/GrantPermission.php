<?php
include("../../conf/config.php");
include("../database/DatabaseServer.php");
header("Content-Type: application/javascript; charset=utf-8");
?>

Ext.override(Ext.data.Store,{
addField: function(field){
field = new Ext.data.Field(field);
this.recordType.prototype.fields.replace(field);
if(typeof field.defaultValue != 'undefined'){
this.each(function(r){
if(typeof r.data[field.name] == 'undefined'){
r.data[field.name] = field.defaultValue;
}
});
}
},
removeField: function(name){
this.recordType.prototype.fields.removeKey(name);
this.each(function(r){
delete r.data[name];
if(r.modified){
delete r.modified[name];
}
});
}
});
Ext.override(Ext.grid.ColumnModel,{
addColumn: function(column, colIndex){
if(typeof column == 'string'){
column = {header: column, dataIndex: column};
}
var config = this.config;
this.config = [];
if(typeof colIndex == 'number'){
config.splice(colIndex, 0, column);
}else{
colIndex = config.push(column);
}
this.setConfig(config);
return colIndex;
},
removeColumn: function(colIndex){
var config = this.config;
this.config = [config[colIndex]];
config.splice(colIndex, 1);
this.setConfig(config);
}
});


Ext.override(Ext.grid.GridPanel,{
addColumn: function(field, column, colIndex){
if(!column){
if(field.dataIndex){
column = field;
field = field.dataIndex;
} else{
column = field.name || field;
}
}
this.store.addField(field);
return this.colModel.addColumn(column, colIndex);
},
removeColumn: function(name, colIndex){
this.store.removeField(name);
if(typeof colIndex != 'number'){
colIndex = this.colModel.findColumnIndex(name);
}
if(colIndex >= 0){
this.colModel.removeColumn(colIndex);
}
}
});
<?php
$db = new DatabaseServer();

$requestFile = isset($_REQUEST["f"]) ? (string) $_REQUEST["f"] : "";
list($path) = explode(".", $requestFile);
$arrPath = explode("/", $path);

$file = "";

if (is_array($arrPath)) {
    for ($i = 2; $i <= count($arrPath) - 1; $i++) {
        $file .= "-" . $arrPath[$i];
    }

    $file = substr($file, 1);
}

$sql = "select isnull(b.i_read_self, 0) as i_read_self
			,isnull(b.i_read_cost, 0) as i_read_cost
			,isnull(b.i_read_all, 0) as i_read_all
			,isnull(b.i_per_add, 0) as i_per_add
            ,isnull(b.i_read_overall, 0) as i_read_overall
			,isnull(b.i_per_update, 0) as i_per_update
			,isnull(b.i_per_delete, 0) as i_per_delete
            ,isnull((select dc_emp_id from dbo.dc_user where dc_user_id=b.dc_user_id)
, 0) as dc_emp_id
		 from dc_menu a
			inner join dc_user_menu b on a.dc_menu_id = b.dc_menu_id
		where a.c_filelocation = ? and b.dc_user_id = ?";
$userId = (int) ($_SESSION["user_id"] ?? 0);
$data = $db->GetDataBySQL($sql, array($file, $userId));

if (is_array($data)) {
    $i_add = $data["i_per_add"];
    $i_update = $data["i_per_update"];
    $i_delete = $data["i_per_delete"];
    $dc_emp_id = $data["dc_emp_id"];
    if ($data["i_read_overall"] > 0)
        $i_read = 4;
    else if ($data["i_read_all"] > 0)
        $i_read = 3;
    else if ($data["i_read_cost"] > 0)
        $i_read = 2;
    else
        $i_read = 1;
} else {
    $i_add = 0;
    $i_update = 0;
    $i_delete = 0;
    $i_read = 1;
    $dc_emp_id = 0;
}

$sessionData = array(
    "cost_name" => (string) ($_SESSION["cost_name"] ?? ""),
    "cost_code" => (string) ($_SESSION["cost_code"] ?? ""),
    "i_type_emp" => (string) ($_SESSION["i_type_emp"] ?? ""),
    "dc_cost_id" => (int) ($_SESSION["dc_cost_id"] ?? 0),
    "dc_center_user" => (int) ($_SESSION["dc_center_user"] ?? 0),
    "user_id" => $userId,
    "dc_department_id" => (int) ($_SESSION["dc_department_id"] ?? 0),
    "dc_department_type_id" => (int) ($_SESSION["dc_department_type_id"] ?? 0),
    "i_level" => (int) ($_SESSION["i_level"] ?? 0),
    "sp_emp_id" => (int) ($_SESSION["sp_emp_id"] ?? 0),
    "user_name" => (string) ($_SESSION["user_name"] ?? ""),
    "super_user" => (string) ($_SESSION["super_user"] ?? ""),
    "dc_cost_acc_id" => (string) ($_SESSION["dc_cost_acc_id"] ?? ""),
    "i_sys" => (string) I_SYS,
    "ip_booking" => (string) IPBOOK,
    "HOST_ERP" => (string) NMU_SUPPLIES_HOST,
    "HOST_NMU" => OST_HOST . "://" . NMU_HOST,
    "NMU_EIS_HOST" => OST_HOST . "://" . NMU_EIS_HOST,
    "FM_NMU_HOST" => OST_HOST . "://" . FM_NMU_HOST,
    "NMU_PERMISSION_HOST" => OST_HOST . "://" . NMU_PERMISSION_HOST,
    "HOST_NAME" => (string) MAIN_HOST_NAME,
    "Notif_line" => OST_HOST . "://" . LINE_NOTIF,
    "IPAPIBG" => (string) IPAPIBG,
    "bg_year" => (int) YEARBG
);
$hostData = array(
    "ost_host" => (string) OST_HOST,
    "nmu_permission_host" => (string) NMU_PERMISSION_HOST,
    "nmu_eis_host" => (string) NMU_EIS_HOST,
    "nmu_host" => (string) NMU_HOST,
    "fm_nmu_host" => (string) FM_NMU_HOST,
    "nmu_api_host" => (string) NMU_API_HOST,
    "nmu_supplies_host" => (string) NMU_SUPPLIES_HOST
);

echo "
				var user_right_edit = " . intVal($i_update) . ";
				var user_right_delete = " . intVal($i_delete) . ";
				var user_right_add = " . intVal($i_add) . ";
				var user_right_read = " . intVal($i_read) . ";
				var emp_id = " . intVal($dc_emp_id) . ";
				Ext.session = Ext.apply(" . json_encode($sessionData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ");
				Ext.HostServer = " . json_encode($hostData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";
		";

