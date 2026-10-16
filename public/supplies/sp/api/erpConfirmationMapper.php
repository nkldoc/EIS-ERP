<?php
/** Executes only metadata-validated INSERTs, using the incoming ERP payload. */
final class ErpConfirmationMapper {
    public static function active($userId) {
        $path = dirname(__DIR__, 4) . '/storage/jsonmapper/' . hash('sha256', (string)$userId) . '.json';
        $lock = @fopen($path . '.lock', 'r');
        if (!$lock || !flock($lock, LOCK_SH)) throw new InvalidArgumentException('ไม่พบ mapper Active ของผู้ยืนยัน กรุณาบันทึก mapper ก่อน');
        try { $state = json_decode(@file_get_contents($path), true); }
        finally { flock($lock, LOCK_UN); fclose($lock); }
        foreach ($state['items'] ?? [] as $entry) {
            if ($entry['id'] === ($state['active'] ?? null)) return $entry['document'];
        }
        throw new InvalidArgumentException('ไม่พบ mapper Active ของผู้ยืนยัน กรุณาบันทึก mapper ก่อน');
    }

    private static function value($data, $path) {
        if (!is_array($path)) throw new InvalidArgumentException('เส้นทาง JSON ใน mapper ไม่ถูกต้อง');
        foreach ($path as $key) {
            if (!is_array($data) || !array_key_exists($key, $data)) throw new InvalidArgumentException('ไม่พบ JSON field: ' . implode('.', $path));
            $data = $data[$key];
        }
        return $data;
    }

    public static function preview($document, $payload) {
        $names=array_map(function($t){return $t['schema'].'.'.$t['name'];},$document['tables']??[]);
        if(in_array('dbo.sp_tor_period_bill',$names,true)&&in_array('dbo.sp_tor_period_bill_receive',$names,true)){
            $items=[];
            foreach($document['tables'] as $table){
                $part=$document;$part['tables']=[$table];
                $isParent=$table['schema']==='dbo'&&$table['name']==='sp_tor_period_bill';
                $isChild=$table['schema']==='dbo'&&$table['name']==='sp_tor_period_bill_receive';
                if($isParent)$part['source']='';if($isChild)$part['source']='["line_ids"]';
                $part['mapping']=array_values(array_filter($part['mapping'],function($pair)use($table,$isChild){$t=json_decode($pair[1],true);return $t[0]===$table['schema']&&$t[1]===$table['name']&&!($isChild&&$t[2]==='sp_tor_period_bill_id');}));
                if($isParent)foreach($part['mapping'] as &$pair){$f=json_decode($pair[0],true);$f[0]='root';$pair[0]=json_encode($f);}unset($pair);
                $items=array_merge($items,self::preview($part,$payload)['items']);
                if($isChild){$data=json_decode($payload,true);foreach($data['line_ids']??[] as $i=>$line)$items[]=['destination'=>'dbo.sp_tor_period_bill_receive.sp_tor_period_bill_id','row'=>$i+1,'source'=>'INSERTED.sp_tor_period_bill_id','value'=>'ID งวดหลักเดิมที่จะ UPDATE หรือ ID ใหม่เมื่อไม่พบ pr_id + po_id + period_id','error'=>null];}
            }
            return ['name'=>$document['name']??'','items'=>$items];
        }
        $source=empty($document['source'])?[]:json_decode($document['source'],true);
        if(!is_array($source))throw new InvalidArgumentException('source ใน mapper ไม่ถูกต้อง');
        $data=json_decode($payload,true);
        $rows=$source?self::value($data,$source):[$data];
        if(!is_array($rows)||!$rows)throw new InvalidArgumentException('ไม่มีแถวข้อมูลสำหรับ INSERT');
        $tables=$document['tables']??[['schema'=>$document['schema'],'name'=>$document['table']]];
        $items=[];
        foreach($tables as $table)foreach($rows as $index=>$row)foreach($document['mapping']??[] as $pair){
            $target=isset($document['tables'])?json_decode($pair[1],true):[$table['schema'],$table['name'],$pair[1]];
            $field=json_decode($pair[0],true);
            if(!is_array($target)||count($target)!==3||!is_array($field)||count($field)<2)throw new InvalidArgumentException('mapping ไม่ถูกต้อง');
            if($target[0]!==$table['schema']||$target[1]!==$table['name'])continue;
            $entry=['destination'=>implode('.',$target),'row'=>$index+1,'source'=>implode('.',$field),'value'=>null,'error'=>null];
            try{
                $value=self::value($field[0]==='root'?$data:$row,array_slice($field,1));
                $entry['value']=is_bool($value)?(int)$value:$value;
                if(is_array($value))$entry['error']='ค่าต้องเป็น scalar';
            }catch(InvalidArgumentException $e){$entry['error']=$e->getMessage();}
            $items[]=$entry;
        }
        return ['name'=>$document['name']??'', 'items'=>$items];
    }

    public static function insert($document, $payload, callable $query, $captureBillId = false, $updateBillId = null) {
        $selected=$document['tables']??[];
        $has=function($name)use($selected){foreach($selected as $t)if($t['schema']==='dbo'&&$t['name']===$name)return true;return false;};
        if($has('sp_tor_period_bill')&&$has('sp_tor_period_bill_receive'))return self::insertLinked($document,$payload,$query);
        $tables = $document['tables'] ?? [['schema'=>$document['schema'], 'name'=>$document['table']]];
        $source = ($document['source'] ?? '') === '' ? [] : json_decode($document['source'], true);
        if (!is_array($source)) throw new InvalidArgumentException('ชุดข้อมูล source ใน mapper ไม่ถูกต้อง');
        $data = json_decode($payload, true);
        $rows = $source ? self::value($data, $source) : [$data];
        if (!is_array($rows) || !$rows || !is_array($tables) || !$tables) throw new InvalidArgumentException('mapper ไม่มีตารางหรือชุดข้อมูลสำหรับ INSERT');
        $quote = function ($name) { return '[' . str_replace(']', ']]', $name) . ']'; };
        $plans = [];
        $seen = [];
        foreach ($tables as $table) {
            $schema = $table['schema'] ?? ''; $name = $table['name'] ?? '';
            if (!is_string($schema) || !is_string($name) || !$schema || !$name) throw new InvalidArgumentException('ชื่อตารางใน mapper ไม่ถูกต้อง');
            $label = $schema . '.' . $name;
            if (isset($seen[$label])) throw new InvalidArgumentException('ตารางใน mapper ซ้ำ: ' . $label);
            $seen[$label] = true;
            $stmt = $query('SELECT c.name,ty.name AS type,c.is_nullable,c.is_identity,c.is_computed,c.generated_always_type,c.default_object_id FROM sys.columns c JOIN sys.tables t ON t.object_id=c.object_id JOIN sys.schemas s ON s.schema_id=t.schema_id JOIN sys.types ty ON ty.user_type_id=c.user_type_id WHERE s.name=? AND t.name=?', [$schema, $name]);
            $columns = [];
            while ($c = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $columns[$c['name']] = $c;
            sqlsrv_free_stmt($stmt);
            if (!$columns) throw new InvalidArgumentException('ไม่พบตาราง: ' . $label);
            $mapped = [];
            foreach ($document['mapping'] ?? [] as $pair) {
                $field = json_decode($pair[0], true);
                $target = isset($document['tables']) ? json_decode($pair[1], true) : [$schema, $name, $pair[1]];
                if (!is_array($field) || count($field)<2 || !in_array($field[0], ['root','row'], true) || !is_array($target) || count($target)!==3) throw new InvalidArgumentException('รูปแบบ mapping ไม่ถูกต้อง');
                if ($target[0] !== $schema || $target[1] !== $name) continue;
                $column = $target[2]; $c = $columns[$column] ?? null;
                if (!$c || $c['is_identity'] || $c['is_computed'] || $c['generated_always_type'] || in_array($c['type'], ['timestamp','rowversion'], true)) throw new InvalidArgumentException('เขียนคอลัมน์ไม่ได้: ' . $label . '.' . $column);
                if (isset($mapped[$column])) throw new InvalidArgumentException('mapping ซ้ำ: ' . $label . '.' . $column);
                $mapped[$column] = $field;
            }
            if (!$mapped) throw new InvalidArgumentException('ไม่มี mapping สำหรับ ' . $label);
            foreach ($columns as $column=>$c) {
                if ($updateBillId === null && !$c['is_nullable'] && !$c['default_object_id'] && !$c['is_identity'] && !$c['is_computed'] && !$c['generated_always_type'] && !in_array($c['type'], ['timestamp','rowversion'], true) && !isset($mapped[$column])) throw new InvalidArgumentException('ขาด field บังคับ: ' . $label . '.' . $column);
            }
            foreach ($rows as $index=>$row) {
                $params = [];
                foreach ($mapped as $column=>$field) {
                    $context = $label . '.' . $column . ' แถว ' . ($index + 1);
                    try { $value = self::value($field[0] === 'root' ? $data : $row, array_slice($field, 1)); }
                    catch (InvalidArgumentException $e) { throw new InvalidArgumentException($context . ': ' . $e->getMessage()); }
                    if ((!$columns[$column]['is_nullable'] && ($value === null || (is_string($value) && trim($value)===''))) || is_array($value)) throw new InvalidArgumentException($context . ': ค่าว่างหรือชนิดข้อมูลไม่ถูกต้อง');
                    $params[] = is_bool($value) ? (int)$value : $value;
                }
                if($updateBillId!==null){
                    if($schema!=='dbo'||$name!=='sp_tor_period_bill')throw new InvalidArgumentException('UPDATE ใช้ได้เฉพาะ master งวด');
                    $sql='UPDATE dbo.sp_tor_period_bill SET '.implode(',',array_map(function($column)use($quote){return $quote($column).'=?';},array_keys($mapped))).' WHERE sp_tor_period_bill_id=?';
                    $params[]=$updateBillId;
                }else{
                    $sql='INSERT INTO ' . $quote($schema) . '.' . $quote($name) . ' (' . implode(',', array_map($quote, array_keys($mapped))) . ') VALUES (' . implode(',', array_fill(0, count($params), '?')) . ')';
                }
                $plans[] = [$label, $index + 1, $sql, $params];
            }
        }
        $insertedIds=[];
        foreach ($plans as [$label, $index, $sql, $params]) {
            try {
                if($captureBillId){
                    $sql='DECLARE @mapper_ids TABLE (id bigint); '.str_replace(') VALUES (', ') OUTPUT INSERTED.[sp_tor_period_bill_id] INTO @mapper_ids VALUES (', $sql).'; SELECT CONVERT(varchar(30),id) AS mapper_insert_id FROM @mapper_ids;';
                }
                $stmt = $query($sql, $params);
                // SQL Server can report constraint/trigger errors in later result sets.
                do {
                    if($captureBillId && sqlsrv_num_fields($stmt)>0){while($result=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)){if(isset($result['mapper_insert_id']))$insertedIds[]=$result['mapper_insert_id'];}}
                    $next = sqlsrv_next_result($stmt);
                } while ($next === true);
                if ($next === false) {
                    $messages = [];
                    foreach (sqlsrv_errors(SQLSRV_ERR_ERRORS) ?: [] as $error) $messages[] = 'SQL Server ' . (int)$error['code'] . ': ' . ($error['message'] ?? 'INSERT failed');
                    sqlsrv_free_stmt($stmt);
                    throw new ErpConfirmationMssqlException(implode(' | ', $messages));
                }
                sqlsrv_free_stmt($stmt);
            }
            catch (ErpConfirmationMssqlException $e) { throw new ErpConfirmationMssqlException(($updateBillId===null?'INSERT ':'UPDATE ') . $label . ' แถว ' . $index . ' ไม่ได้: ' . $e->getMessage()); }
        }
        if($captureBillId&&count($insertedIds)!==count($plans))throw new ErpConfirmationMssqlException('อ่าน ID งวดที่สร้างไม่สำเร็จ');
        return $insertedIds;
    }
    private static function insertLinked($document,$payload,callable $query){
        $data=json_decode($payload,true);
        if(empty($data['line_ids'])||!is_array($data['line_ids']))throw new InvalidArgumentException('ต้องมี line_ids สำหรับรายการรับของ');
        $parent=$document;$parent['tables']=[['schema'=>'dbo','name'=>'sp_tor_period_bill']];$parent['source']='';
        $parent['mapping']=array_values(array_filter($document['mapping'],function($pair){$t=json_decode($pair[1],true);return $t[0]==='dbo'&&$t[1]==='sp_tor_period_bill';}));
        // Header mappings always read the root payload, independently of the line source.
        foreach($parent['mapping'] as &$pair){$f=json_decode($pair[0],true);$f[0]='root';$pair[0]=json_encode($f);}unset($pair);
        $where=[];$keys=[];$keyColumns=[];
        foreach(['pr_id','po_id','period_id'] as $key){
            $value=$data[$key]??null;
            if(!is_scalar($value)||is_bool($value)||trim((string)$value)==='')throw new InvalidArgumentException('ต้องระบุ '.$key.' เพื่อค้นหา master');
            $targets=[];
            foreach($parent['mapping'] as $pair){$field=json_decode($pair[0],true);$target=json_decode($pair[1],true);if(array_slice($field,1)===[$key])$targets[]=$target[2];}
            if(count($targets)!==1)throw new InvalidArgumentException('กรุณา mapping '.$key.' ไปคอลัมน์ master หนึ่งคอลัมน์');
            $keyColumns[]=$targets[0];$where[]='['.str_replace(']',']]',$targets[0]).']=?';$keys[]=$value;
        }
        if(count(array_unique($keyColumns))!==3)throw new InvalidArgumentException('คอลัมน์ master สำหรับ pr_id / po_id / period_id ต้องไม่ซ้ำกัน');
        // Range locks keep matching/updating/creating the master inside the receipt transaction.
        $stmt=$query('SELECT TOP (2) sp_tor_period_bill_id FROM dbo.sp_tor_period_bill WITH (UPDLOCK,HOLDLOCK) WHERE '.implode(' AND ',$where),$keys);
        $ids=[];while($record=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC))$ids[]=(string)$record['sp_tor_period_bill_id'];sqlsrv_free_stmt($stmt);
        if($record===false)throw new ErpConfirmationMssqlException('อ่าน master เดิมไม่สำเร็จ');
        if(count($ids)>1)throw new InvalidArgumentException('พบ master ซ้ำสำหรับ pr_id + po_id + period_id กรุณาตรวจข้อมูลก่อน');
        $updated=(bool)$ids;
        if($updated)self::insert($parent,$payload,$query,false,$ids[0]);
        else $ids=self::insert($parent,$payload,$query,true);
        if(count($ids)!==1)throw new ErpConfirmationMssqlException('ต้องสร้างงวดหลักหนึ่งรายการ');
        $child=$document;$child['tables']=[['schema'=>'dbo','name'=>'sp_tor_period_bill_receive']];$child['source']='["line_ids"]';
        $child['mapping']=array_values(array_filter($document['mapping'],function($pair){$t=json_decode($pair[1],true);return $t[0]==='dbo'&&$t[1]==='sp_tor_period_bill_receive'&&$t[2]!=='sp_tor_period_bill_id';}));
        $ref='__mapper_generated_bill_id';$data[$ref]=$ids[0];
        $child['mapping'][]=[json_encode(['root',$ref]),json_encode(['dbo','sp_tor_period_bill_receive','sp_tor_period_bill_id'])];
        self::insert($child,json_encode($data,JSON_UNESCAPED_UNICODE),$query);
        $other=$document;$other['tables']=array_values(array_filter($document['tables'],function($t){return !($t['schema']==='dbo'&&in_array($t['name'],['sp_tor_period_bill','sp_tor_period_bill_receive'],true));}));
        if($other['tables'])self::insert($other,$payload,$query);
        return ['sp_tor_period_bill_id'=>$ids[0],'receive_rows'=>count($data['line_ids']),'updated_master'=>$updated];
    }
}
