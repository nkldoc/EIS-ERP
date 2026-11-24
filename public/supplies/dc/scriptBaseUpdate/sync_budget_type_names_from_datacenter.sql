-- ซิงก์ชื่อแหล่งเงิน (dc_expense_budget_type.c_name) ในสำเนาของ supplies/procure ให้ตรงกับ NMU_DATACENTER (ศูนย์กลาง)
-- ปัญหา: ศูนย์กลางเปลี่ยนชื่อ (เช่น id 8 เงินสะสมคณะแพทย์ฯ -> เงินสะสมส่วนงาน) แต่สำเนาใน NMU_ERP/EIS_PROCURE ค้างชื่อเก่า
--        หน้าเดียวกันจึงขึ้นคนละชื่อ (ฟอร์มหลักอ่านศูนย์กลาง / หน้าต่างยืนยันใบกันอ่านสำเนา)
-- แก้เฉพาะ c_name ของแถวที่มี id ตรงกันและชื่อต่างกัน (ไม่เพิ่ม/ไม่ลบแถว ไม่แตะ id)
-- สำรองเฉพาะแถวที่จะแก้ไว้ที่ <ฐานข้อมูล>.dbo.bak_dc_expense_budget_type_<วันที่_เวลา> ก่อนแก้ (ไม่ใช้ BEGIN TRAN)
-- @apply = 0 = ดูตัวอย่างอย่างเดียว / 1 = แก้จริง   รันซ้ำได้ (ถ้าชื่อตรงกันแล้วจะไม่มีแถวให้แก้)
SET NOCOUNT ON;
DECLARE @apply INT = 0;

-- ===== ตัวอย่าง: แถวที่ชื่อต่างจากศูนย์กลาง =====
PRINT N'--- NMU_ERP (ที่ supplies ใช้) ---';
SELECT l.dc_expense_budget_type_id AS id, l.c_name AS ชื่อในสำเนา, c.c_name AS ชื่อศูนย์กลาง
FROM NMU_ERP.dbo.dc_expense_budget_type l
INNER JOIN NMU_DATACENTER.dbo.dc_expense_budget_type c ON c.dc_expense_budget_type_id = l.dc_expense_budget_type_id
WHERE ISNULL(l.c_name, N'') <> ISNULL(c.c_name, N'') ORDER BY l.dc_expense_budget_type_id;

PRINT N'--- EIS_PROCURE (ที่ procure ใช้) ---';
SELECT l.dc_expense_budget_type_id AS id, l.c_name AS ชื่อในสำเนา, c.c_name AS ชื่อศูนย์กลาง
FROM EIS_PROCURE.dbo.dc_expense_budget_type l
INNER JOIN NMU_DATACENTER.dbo.dc_expense_budget_type c ON c.dc_expense_budget_type_id = l.dc_expense_budget_type_id
WHERE ISNULL(l.c_name, N'') <> ISNULL(c.c_name, N'') ORDER BY l.dc_expense_budget_type_id;

IF @apply = 1
BEGIN
    DECLARE @sfx VARCHAR(20) = CONVERT(VARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @db TABLE (n SYSNAME);
    INSERT INTO @db VALUES (N'NMU_ERP'), (N'EIS_PROCURE');
    DECLARE @name SYSNAME;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT n FROM @db;
    OPEN cur; FETCH NEXT FROM cur INTO @name;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- 1) สำรองแถวที่จะแก้ (เฉพาะที่ชื่อต่าง)
        SET @sql = N'SELECT l.* INTO ' + QUOTENAME(@name) + N'.dbo.' + QUOTENAME(N'bak_dc_expense_budget_type_' + @sfx)
            + N' FROM ' + QUOTENAME(@name) + N'.dbo.dc_expense_budget_type l'
            + N' INNER JOIN NMU_DATACENTER.dbo.dc_expense_budget_type c ON c.dc_expense_budget_type_id = l.dc_expense_budget_type_id'
            + N' WHERE ISNULL(l.c_name, N'''') <> ISNULL(c.c_name, N'''')';
        EXEC (@sql);
        -- 2) แก้ชื่อให้ตรงกับศูนย์กลาง
        SET @sql = N'UPDATE l SET l.c_name = c.c_name FROM ' + QUOTENAME(@name) + N'.dbo.dc_expense_budget_type l'
            + N' INNER JOIN NMU_DATACENTER.dbo.dc_expense_budget_type c ON c.dc_expense_budget_type_id = l.dc_expense_budget_type_id'
            + N' WHERE ISNULL(l.c_name, N'''') <> ISNULL(c.c_name, N'''')';
        EXEC (@sql);
        PRINT @name + N': แก้แล้ว ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' แถว (สำรองที่ bak_dc_expense_budget_type_' + @sfx + N')';
        FETCH NEXT FROM cur INTO @name;
    END
    CLOSE cur; DEALLOCATE cur;
END
