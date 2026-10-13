# แบบบันทึก ERP confirmation: MySQL → MSSQL

สถานะ: แบบออกแบบการเชื่อมตารางธุรกิจ ยังไม่รัน migration กับฐานข้อมูล
มี implementation ขั้นรับเข้า MSSQL หลังยืนยันแล้ว ดู `erp-confirmation-mssql-setup.md`
ขั้นนี้เก็บ payload ใน inbox; mapping และ outbox ไปตารางธุรกิจด้านล่างยังเป็นแบบออกแบบ
อ้างอิง erpConfirmation.js, api/erpConfirmation.php, api/erpConfirmationStore.php,
classes/ErpConfirmation.php, acceptMedSup.js และ DDL ที่แนบวันที่ 2026-09-22

## 1. ขอบเขตและสิ่งที่พบ

ข้อมูลรับเข้าถูกเก็บใน MySQL `sp_erp_confirmation.payload` แล้ว โดยแยกรายการด้วย
`(request_id,item_index)` และเชื่อม `sp_api_incoming_log` ปุ่มยืนยันปัจจุบันส่ง `{id}`
ไป PHP ซึ่งอัปเดต confirmed_at เท่านั้น ยังไม่มีการบันทึก MSSQL

ให้ JavaScript เป็นหน้าตรวจสอบ/แก้ข้อมูลและแสดงสถานะ ส่วน PHP รับผิดชอบ validation,
mapping, transaction และเชื่อมฐานข้อมูล การยืนยันกับการส่งสำเร็จต้องเป็นคนละสถานะ

ขอบเขตแรก: ผูกกับสัญญา/งวด MSSQL ที่มีอยู่ แล้วบันทึกรับของและรายละเอียดตรวจรับ
ไม่สร้าง `sp_tor_period_bill` จาก payload ชุดนี้ เพราะ DDL สัญญาที่ได้รับมีเพียงบางคอลัมน์
และยังไม่มีความหมายของฟิลด์ทั้งหมดที่จะใช้สร้างสัญญาได้อย่างถูกต้อง

## 2. ลำดับการบันทึก

1. รับ API → เก็บ payload ดิบใน MySQL เหมือนเดิม
2. เปิดรายละเอียด → PHP สร้าง mapping preview แสดงค่าต้นทาง ค่าปลายทาง และรายการที่ขาด
3. เจ้าหน้าที่เลือกงวด/รายการรับของ หรือระบุว่าจะสร้างรับของใหม่ กรอกข้อมูลตรวจรับที่ขาด
4. POST ยืนยัน → ตรวจสิทธิ์และ CSRF → lock แถว MySQL → ตรวจ revision และข้อมูล
5. ภายใน MySQL transaction เดียว: เก็บ normalized snapshot, mapping version,
   ผู้ยืนยัน, confirmed_at และงาน outbox แล้ว commit; ตอบ `202 queued`
6. worker จองงานด้วย lease แล้วเริ่ม MSSQL transaction ตรวจ receipt กันซ้ำ
   ตรวจงวด/เลข IR/ยอดอีกครั้ง บันทึก receive + checking + receipt แล้ว commit
7. กลับมาอัปเดต MySQL เป็น synced พร้อม ID ปลายทางและเวลาที่ส่งสำเร็จ
8. หากล้มเหลว retry งานเดิม; ถ้า MSSQL commit แล้วแต่ MySQL ยังไม่ได้อัปเดต
   ให้ worker อ่าน receipt แล้วปิดงาน โดยไม่เขียนข้อมูลธุรกิจซ้ำ

MySQL กับ MSSQL ไม่ใช้ transaction ร่วมกัน การบันทึก MySQL สำเร็จจึงต้องไม่แสดงว่า
ส่งเข้า MSSQL สำเร็จจนกว่าจะได้รับผลขั้นตอน 7

## 3. ตารางเชื่อมที่เสนอ (ยังไม่ใช่ migration)

| ฐาน/ตาราง | ข้อมูลและ constraint สำคัญ |
|---|---|
| MySQL `sp_erp_confirmation` เดิม | เก็บ payload เดิมและผู้ยืนยัน ไม่เขียนทับหลักฐานรับเข้า |
| MySQL `sp_erp_confirmation_revision` ใหม่ | id, confirmation_id FK, revision, mapping_version, normalized_payload, payload_hash, created_by, created_at; UNIQUE(confirmation_id,revision) |
| MySQL `sp_erp_entity_map` ใหม่ | source_system, entity_type, source_key, target_id, verified_by, verified_at; UNIQUE(source_system,entity_type,source_key); target_id เก็บ BIGINT |
| MySQL `sp_erp_sync_outbox` ใหม่ | id, revision_id FK UNIQUE, sync_key UNIQUE, state, attempts, next_attempt_at, lease_token, lease_until, last_error_code, last_error, target_result, synced_at |
| MSSQL `dbo.sp_erp_sync_receipt` ใหม่ | sync_key VARCHAR(64) PK, payload_hash CHAR(64), mapping_version, result_json NVARCHAR(MAX), committed_at DATETIME2; เขียนใน transaction เดียวกับข้อมูลธุรกิจ |

`source_key` เป็น composite key ที่ serialize แบบตายตัว เช่น period ใช้
source_system + po_id + period_id; checking ใช้ po_id + period_id + chk_id;
receive ใช้ชุด checking + chk_line_id จนกว่าจะยืนยันว่า ID ต้นทาง unique ระดับใด
ห้ามนำ ID ต้นทางใส่ IDENTITY ปลายทางโดยตรง

sync_key ระบุ source system + business document key + revision ให้แน่นอน
request_id เพียงอย่างเดียวป้องกันได้แค่การส่ง request เดิม ไม่ป้องกันเอกสารเดิมที่ส่งมาใหม่
payload เดิม/business key เดิม = คืนงานเดิม; payload เปลี่ยน = สร้าง revision ใหม่ให้ตรวจสอบ
ห้ามแก้ snapshot ที่ยืนยันแล้วหรือสร้าง key ใหม่ทุกครั้งที่ retry

state: queued → processing → synced; ขัดข้องชั่วคราว → retry_wait;
ข้อมูลไม่ครบ/ไม่ตรง → blocked; ต้องแยก confirmed_at ออกจาก synced_at
worker ยึด lease แบบ atomic และอัปเดตผลเฉพาะ lease_token ของตน

## 4. Mapping จาก payload ปัจจุบัน

ตารางนี้แยก mapping ที่ต้องตรวจสอบออกจากค่าที่ใช้ตรงได้ โดยไม่เดาความหมายทางธุรกิจ

| ต้นทาง | ปลายทาง | กติกา |
|---|---|---|
| pr_id, po_id, period_id | entity_map → sp_tor_period_bill_id | เลือกงวดที่มีจริง ตรวจสัญญา/ผู้ขาย/ปีงบ ไม่เทียบเลข ID ตรง ๆ |
| chk_id | business key ตรวจรับต้นทาง | ไม่ใช่ checking_id หรือ c_ir_code โดยอัตโนมัติ |
| line_ids[].chk_line_id | entity_map → sp_tor_period_bill_receive_id | ใช้กันซ้ำระดับรายการเมื่อยืนยันความหมายรายการย่อยแล้ว |
| c_contract_code | bill.c_contract_code | ใช้ตรวจความสอดคล้องกับงวดที่เลือก ไม่เขียนทับสัญญา |
| i_period | bill.i_period | ใช้ตรวจงวด ไม่ใช้เป็น primary key |
| i_budget_year | bill.i_budget_year | bill เก็บ ค.ศ.; ต้องระบุปฏิทินต้นทางก่อนแปลง |
| dc_creditor_id, dc_cost_id, user_id | master mapping | รหัสต่างระบบต้องมี crosswalk; audit ใช้ผู้ยืนยันจาก session ที่ map แล้ว |
| c_tax_number_imp | bill.c_tax_number_imp | ใช้ตรวจผู้ขาย ไม่ใช้ชื่อผู้ขายอย่างเดียวในการจับคู่ |
| d_arrive_date | receive.d_receive_date | mapping ที่เสนอ ต้องยืนยันว่าเป็นวันรับของจริง; ส่ง ISO ค.ศ. |
| d_checking_date | checking.d_checking | mapping ที่เสนอ; วันที่ ISO ค.ศ. ไม่แปลง +543 ซ้ำ |
| c_arrive_code | ยังไม่กำหนด | label ปัจจุบันคือเลขใบตรวจรับ ไม่ถือเป็นเลข IR หรือใบส่งของโดยอัตโนมัติ |
| c_doc_ref, line_ids[].c_doc_ref | ยังไม่กำหนด | ต้องยืนยันว่าเป็นใบส่งของ/ใบแจ้งหนี้ก่อน map receive.c_receive_code; false ไม่ใช่ข้อความ 'false' |
| line_ids[].d_doc_dateSub | ยังไม่กำหนด | วันเอกสารไม่จำเป็นต้องเท่ากับวันเอกสารครบหรือวันรับของ |
| f_period_amt | ใช้เทียบยอดงวด | ไม่ใช้แทนยอดรับของแต่ละแถวหรือยอดตรวจรับโดยอัตโนมัติ |
| bg_expense_name, dc_creditor_idTxt, c_overlap | ข้อมูลประกอบการตรวจ | ไม่เขียนทับ master/ข้อมูลสัญญา และไม่ใช้ชื่อเป็น key |

line_ids อาจเป็นรายการสินค้า/เอกสาร ไม่จำเป็นต้องเป็นการรับของหนึ่งครั้งต่อแถว
ต้องกำหนด cardinality ก่อน: หนึ่ง event รับของ → หนึ่ง receive; หลาย receive → หนึ่ง IR;
หนึ่ง IR → หนึ่ง checking ที่ใช้งาน ห้ามคูณ f_period_amt ซ้ำตามจำนวน line_ids

## 5. Contract ของข้อมูล normalized ที่ต้องมี

| กลุ่ม | ฟิลด์ปลายทาง / แหล่งข้อมูล |
|---|---|
| งวด | sp_tor_period_bill_id จาก mapping ที่ตรวจสอบแล้ว |
| รับของ | receive_id เดิม หรือ source_receive_key ใหม่; c_receive_code, d_receive_date, c_detail, f_amt จากข้อมูลรับของที่ตรวจสอบแล้ว |
| IR | c_ir_code จากรายการรับของเดิม หรือบริการออกเลขของระบบที่รองรับ concurrency; d_ir_issue จากบริการดังกล่าว |
| ตรวจรับทั่วไป | d_doc_complete, d_checking, c_egp_no, c_disburse_detail, i_budget_year_use จากผู้ตรวจสอบ/ต้นทางที่มีความหมายตรงกัน |
| ภาษี/ยอด | f_total_vat, b_vat, f_vat_percent, b_wht, f_wht_percent, f_penalty, b_guarantee, f_guarantee_percent, f_other ต้องให้ผู้ตรวจสอบระบุครบ |
| ยอดคำนวณ | f_before_vat, f_vat_amt, f_request_amt, f_wht_amt, f_guarantee_amt, f_pay_amt คำนวณบน server |
| หน่วยงาน | dc_cost_responsible_id, dc_cost_owner_id จาก master mapping ที่แยกบทบาทชัดเจน |
| อ้างอิง | c_overlap_no, i_budget_year_ref, c_item_name เป็น optional ตาม schema; ระบุปฏิทิน i_budget_year_ref ให้ชัดก่อนใช้ |
| audit | i_enabled=1 เมื่อสร้าง; dc_user_create_id/cost_id, d_create จากผู้ยืนยันที่ map แล้วและเวลา server; update ใช้ชุด update ไม่ทับ create |
| identity/AP | ให้ MSSQL สร้าง identity; ไม่สร้าง c_ap_code/d_ap_issue ใน flow นี้ |

ต้องมีเลข IR ที่เชื่อม receive จริงก่อนสร้าง checking; ไม่ใช้ chk_id ตั้งเลข IR เอง
โค้ดออกเลขเดิมต้องตรวจความพร้อมก่อนนำมาใช้จริง โดยเฉพาะส่วนที่ระบุว่าเป็น mock

## 6. Validation และยอดเงิน

คำนวณตามพฤติกรรมโค้ดเดิม (ไม่ใช่การกำหนดกฎภาษีใหม่):

```
before_vat = b_vat ? total / (1 + vat_percent / 100) : total
vat_amt = total - before_vat
request_amt = total
wht_amt = b_wht ? before_vat * wht_percent / 100 : 0
guarantee_amt = b_guarantee ? before_vat * guarantee_percent / 100 : 0
pay_amt = total - wht_amt - penalty - guarantee_amt - other
```

ใช้ decimal arithmetic บน server และส่งจำนวนเงินเป็น decimal string;
กำหนดการปัดเศษ 2 ตำแหน่งสำหรับยอดธุรกิจอย่างชัดเจน และทดสอบเทียบผลเดิมก่อนเปิดใช้
เพราะ controller เดิมใช้ float ส่วน MONEY เก็บได้ 4 ตำแหน่ง
ผลรวมยอด receive ที่อยู่ใน IR ต้องตรง f_total_vat ตามขอบเขตเอกสารที่ยืนยันแล้ว
ห้ามให้ยอดที่ขาดกลายเป็น 0; flag/อัตราที่ไม่ทราบต้องให้ตรวจสอบก่อน
ตรวจวันที่จริง, ช่วงตัวเลข/เปอร์เซ็นต์, ยอดสุทธิไม่ติดลบ และขนาดข้อความตามคอลัมน์
ตรวจ VARCHAR/collation ของ MSSQL ด้วยข้อความภาษาไทยก่อน rollout ไม่ตัดข้อความเงียบ ๆ
checking.i_budget_year_use เก็บ พ.ศ. ตาม DDL ต่างจาก bill.i_budget_year ที่เก็บ ค.ศ.

## 7. ป้องกันข้อมูลซ้ำและการเขียนทับ

MSSQL transaction ต้องล็อก sync_key และ IR เป้าหมายก่อนตรวจ/เขียน
receipt key เดิม/hash เดิม → คืนผลเดิม; key เดิม/hash ต่าง → conflict
ต้องสำรวจและแก้ active checking ที่มี c_ir_code ซ้ำก่อนเพิ่ม filtered UNIQUE index
บน c_ir_code WHERE i_enabled=1; รวมถึงทบทวน writer เดิมให้ใช้ invariant เดียวกัน
เพราะ query ที่แนบ JOIN checking ก่อน SUM(receive.f_amt) ทำให้ยอดซ้ำได้เมื่อมี checking ซ้ำ

รายการ receive เดิมต้องตรงงวดและ IR; หากพบ AP แล้วให้ block การเปลี่ยนยอด/งวด/IR
หากเจ้าหน้าที่แก้ข้อมูลปลายทางหลัง preview ให้ตรวจ version/hash แล้วคืน conflict
ห้าม worker เขียนทับโดยไม่ตรวจ และห้ามนำแถว soft-delete กลับมาใช้อัตโนมัติ
เมื่อ IR เดียวกันมีหลายงาน ให้ serialize ตาม IR และตรวจสมาชิกทั้งกลุ่มก่อนคำนวณยอด

## 8. จุดแก้โปรแกรมในขั้น implementation

- `erpConfirmation.js`: เพิ่ม mapping preview, ข้อมูลที่ต้องเติม, สถานะส่ง, ข้อผิดพลาด และ retry; ปุ่มยืนยันส่ง revision กับข้อมูลที่ผู้ใช้เลือก ไม่ส่ง SQL
- `api/erpConfirmation.php`: GET detail เพิ่ม normalized preview/missing fields/sync status; POST ตรวจ server-side แล้ว enqueue; retry ต้องตรวจสิทธิ์/CSRF เหมือน confirm
- `api/erpConfirmationStore.php`: เปลี่ยน confirm จาก UPDATE เดียวเป็น MySQL transaction ที่บันทึก snapshot + outbox + ผู้ยืนยันแบบ atomic
- เพิ่ม mapper/validator และ MSSQL writer แยกจาก HTTP controller เพื่อทดสอบได้ ไม่เรียก controller SAVE_CHECKING ผ่าน HTTP ภายใน เพราะมี workflow ต่อท้ายที่ไม่ควรพ่วงอัตโนมัติ
- เพิ่ม CLI worker และ migration ทั้งสองฐาน; connection ใช้ config ฝั่ง server และไม่เปิดเผยใน browser
- list API ปัจจุบันดึงเฉพาะ pr_id/c_doc_ref จาก payload แต่ JS อ่าน po_id/period_id/chk_id ด้วย ให้คืนครบเมื่อปรับหน้าจอ

## 9. เกณฑ์ทดสอบก่อนเปิดใช้

1. confirm พร้อมกันสองครั้งเกิด snapshot/outbox เดียว; การส่ง API ใหม่ด้วย business key เดิมไม่สร้างรับของซ้ำ
2. MSSQL ล่มหลัง MySQL commit งานยังอยู่และ retry ได้
3. MSSQL commit แล้ว worker หยุดก่อนอัปเดต MySQL; retry อ่าน receipt และไม่สร้าง receive/checking ซ้ำ
4. งวดไม่พบ, master mapping ไม่ครบ, IR ผิด, ยอดขาด, boolean false ในข้อความ, วันที่ผิด ต้อง blocked พร้อมเหตุผล
5. หลาย receive ต่อ IR รวมยอดถูกต้อง ไม่คูณยอดงวดตาม line_ids
6. ยอด VAT/WHT/ค้ำประกัน/ค่าปรับ/อื่น ๆ และการปัดเศษเทียบกับตัวอย่างที่เจ้าหน้าที่รับรอง
7. AP ออกแล้ว, soft-delete, IR ซ้ำ, ปลายทางถูกแก้พร้อมกัน ต้องไม่เขียนทับ
8. ภาษาไทย, BIGINT, พ.ศ./ค.ศ., lease หมดอายุ และหลาย worker ทำงานพร้อมกัน

## 10. ข้อมูลที่ยังต้องยืนยันก่อนเขียนตัวส่งจริง

- ตัวอย่าง payload ที่ครบพร้อมความหมายและความ unique ของ chk_id/chk_line_id และ line_ids
- ความสัมพันธ์ period_id กับงวด MSSQL และว่าจะเลือก receive เดิมหรือสร้างใหม่
- แหล่งเลข IR จริง; c_arrive_code เป็น IR ได้หรือไม่
- แหล่งยอดรับของ/รายละเอียด VAT/WHT/ค้ำประกันและนโยบายปัดเศษ
- crosswalk ผู้ใช้ หน่วยงาน ผู้ขาย และนโยบายแก้ไขเอกสารที่ส่งแล้ว

หากยังไม่มีข้อมูลเหล่านี้ ระบบออกแบบให้เก็บ MySQL และแสดงว่ารอตรวจ mapping ได้
แต่จะไม่ส่งค่าที่คาดเดาไปสร้างข้อมูลตรวจรับใน MSSQL
