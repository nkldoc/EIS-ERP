<?php
require_once __DIR__ . '/erpConfirmationMapper.php';
final class ErpConfirmationFields {
    public static function missing($payload, $document) {
        $names=array_map(function($t){return $t['schema'].'.'.$t['name'];},$document['tables']??[]);
        if(in_array('dbo.sp_tor_period_bill',$names,true)&&in_array('dbo.sp_tor_period_bill_receive',$names,true)){
            $all=[];foreach($document['tables'] as $table){
                $part=$document;$part['tables']=[$table];$parent=$table['name']==='sp_tor_period_bill'&&$table['schema']==='dbo';$child=$table['name']==='sp_tor_period_bill_receive'&&$table['schema']==='dbo';
                if($parent)$part['source']='';if($child)$part['source']='["line_ids"]';
                $part['mapping']=array_values(array_filter($part['mapping'],function($pair)use($table,$child){$t=json_decode($pair[1],true);return $t[0]===$table['schema']&&$t[1]===$table['name']&&!($child&&$t[2]==='sp_tor_period_bill_id');}));
                if($parent)foreach($part['mapping'] as &$pair){$field=json_decode($pair[0],true);$field[0]='root';$pair[0]=json_encode($field);}unset($pair);
                foreach(self::missing($payload,$part) as $missing)$all[json_encode($missing['path'])]=$missing;
            }return array_values($all);
        }
        $data=json_decode($payload, true);
        $source=empty($document['source'])?[]:json_decode($document['source'],true);
        if (!is_array($data) || !is_array($source)) throw new InvalidArgumentException('JSON หรือ source ใน mapper ไม่ถูกต้อง');
        $rows=$data;
        foreach ($source as $key) {
            if (!is_array($rows) || !array_key_exists($key,$rows)) throw new InvalidArgumentException('ไม่พบชุดข้อมูล source กรุณาตรวจ mapper');
            $rows=$rows[$key];
        }
        $missing=[];
        foreach ($document['mapping'] ?? [] as $pair) {
            $field=json_decode($pair[0],true);
            if (!is_array($field) || count($field)<2) throw new InvalidArgumentException('mapping ไม่ถูกต้อง');
            $paths=[$field[0]==='root'||!$source?[]:null];
            if ($paths[0]===null) {
                if (!is_array($rows)) throw new InvalidArgumentException('source ต้องเป็น array');
                $paths=[];foreach(array_keys($rows) as $index)$paths[]=array_merge($source,[$index]);
            }
            foreach($paths as $prefix) {
                $path=array_merge($prefix,array_slice($field,1));$value=$data;$absent=false;
                foreach($path as $key){if(!is_array($value)||!array_key_exists($key,$value)){$absent=true;break;}$value=$value[$key];}
                if($absent)$missing[json_encode($path)]=['path'=>$path,'label'=>implode('.',$path)];
            }
        }
        return array_values($missing);
    }
    public static function apply($payload, $missing, $values) {
        if(!is_array($values))throw new InvalidArgumentException('ค่า field ไม่ถูกต้อง');
        $data=json_decode($payload,true);
        foreach($missing as $field){
            $key=json_encode($field['path'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
            if(!array_key_exists($key,$values))throw new InvalidArgumentException('กรุณาระบุค่า '.$field['label']);
            $value=$values[$key];if(is_array($value)||is_object($value))throw new InvalidArgumentException('ค่าต้องเป็นข้อความ ตัวเลข boolean หรือ null');
            $ref=&$data;$path=$field['path'];$last=array_pop($path);
            foreach($path as $part){if(!array_key_exists($part,$ref))$ref[$part]=[];if(!is_array($ref[$part]))throw new InvalidArgumentException('path ชนกับค่าเดิม: '.$field['label']);$ref=&$ref[$part];}
            $ref[$last]=$value;unset($ref);
        }
        return json_encode($data,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
    }
}
