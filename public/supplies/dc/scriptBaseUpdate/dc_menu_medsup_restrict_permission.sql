USE NMU_ERP;
GO

/*
 * จำกัดสิทธิ์การมองเห็นเมนูตระกูลเวชภัณฑ์ (medsup) ให้เห็นเฉพาะผู้ใช้ของ
 *   - dc_cost_id 82 = งานเวชภัณฑ์ทางการแพทย์
 *   - dc_cost_id 50 = ฝ่ายเภสัชกรรม
 * ฝ่ายพัสดุ (และหน่วยงานอื่น) ไม่ต้องเห็น
 *
 * เดิมสคริปต์ dc_menu_medsup_*.sql คัดลอกสิทธิ์มาจากเมนูพัสดุทั่วไป (ST0009, ST0012 ฯลฯ)
 * ทำให้ผู้ใช้พัสดุ 59-60 คนเห็นเมนูเวชภัณฑ์ปะปน ส่วนผู้ใช้เวชภัณฑ์/เภสัชกลับไม่ได้สิทธิ์
 *
 * เมนูที่ครอบคลุม: ST00092, sp-newTorMedSup, ST00093 (ซ่อนอยู่), ST00094, ST00095,
 * ST00096, ST00097
 *
 * ขั้นตอน
 *   1) สำรองสิทธิ์เดิมของเมนูเหล่านี้ไว้ที่ dc_user_menu_bak_medsup_20261019 (ครั้งแรกเท่านั้น)
 *   2) ลบสิทธิ์ของผู้ใช้ที่ไม่ได้อยู่ cost 82/50
 *   3) เพิ่มสิทธิ์ให้ผู้ใช้ที่ยังใช้งานของ cost 82/50 (รวมโหนดกลุ่ม 0551xx ที่เมนูเหล่านี้
 *      บางตัวอยู่ใต้) - สิทธิ์เท่ากับที่ผู้ใช้พัสดุเคยได้ (เพิ่ม/แก้ไข/ลบ)
 *
 * Idempotent: รันซ้ำได้ ไม่เพิ่มแถวซ้ำ
 * ย้อนกลับ: INSERT ... SELECT กลับจาก dc_user_menu_bak_medsup_20261019
 */
SET NOCOUNT ON;

DECLARE @menus TABLE (dc_menu_id BIGINT PRIMARY KEY);
INSERT INTO @menus
SELECT dc_menu_id FROM [dbo].[dc_menu]
WHERE i_delete IN (1, 2)
  AND c_filelocation IN ('sp-contract?st=ST00092', 'sp-newTorMedSup', 'sp-contract?st=ST00093',
                         'sp-contract?st=ST00094', 'sp-contract?st=ST00095', 'sp-contract?st=ST00096',
                         'sp-contract?st=ST00097');

IF OBJECT_ID('dbo.dc_user_menu_bak_medsup_20261019') IS NULL
    SELECT um.* INTO [dbo].[dc_user_menu_bak_medsup_20261019]
    FROM [dbo].[dc_user_menu] um
    WHERE um.dc_menu_id IN (SELECT dc_menu_id FROM @menus);

BEGIN TRANSACTION;

-- 2) ถอนสิทธิ์ผู้ใช้ที่ไม่ใช่เวชภัณฑ์/เภสัช
DELETE um
FROM [dbo].[dc_user_menu] um
LEFT JOIN [dbo].[dc_user] u ON u.dc_user_id = um.dc_user_id
WHERE um.dc_menu_id IN (SELECT dc_menu_id FROM @menus)
  AND (u.dc_user_id IS NULL OR ISNULL(u.dc_cost_id, 0) NOT IN (50, 82));

-- 3) ให้สิทธิ์ผู้ใช้ cost 82/50 ที่ใช้งานอยู่
INSERT INTO [dbo].[dc_user_menu]
    (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete)
SELECT u.dc_user_id, m.dc_menu_id, 0, 1, 1, 0, 0, NULL, 1, 1, 1
FROM [dbo].[dc_user] u
CROSS JOIN @menus m
JOIN [dbo].[dc_menu] mm ON mm.dc_menu_id = m.dc_menu_id AND mm.i_delete = 2   -- ข้ามเมนูที่ถูกลบ (ST00093)
WHERE u.dc_cost_id IN (50, 82) AND u.i_delete = 2 AND u.i_enable = 1
  AND NOT EXISTS (SELECT 1 FROM [dbo].[dc_user_menu] x WHERE x.dc_user_id = u.dc_user_id AND x.dc_menu_id = m.dc_menu_id);

-- โหนดกลุ่ม 0551xx (140697) ที่ ST00095-97 อยู่ใต้ - ต้องมีสิทธิ์แสดงด้วยจึงจะเห็นเมนูย่อย
INSERT INTO [dbo].[dc_user_menu]
    (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete)
SELECT u.dc_user_id, 140697, 0, 1, 0, 0, 0, NULL, 0, 0, 0
FROM [dbo].[dc_user] u
WHERE u.dc_cost_id IN (50, 82) AND u.i_delete = 2 AND u.i_enable = 1
  AND EXISTS (SELECT 1 FROM [dbo].[dc_menu] WHERE dc_menu_id = 140697)
  AND NOT EXISTS (SELECT 1 FROM [dbo].[dc_user_menu] x WHERE x.dc_user_id = u.dc_user_id AND x.dc_menu_id = 140697);

COMMIT TRANSACTION;
GO

SELECT m.c_filelocation,
       SUM(CASE WHEN u.dc_cost_id IN (50, 82) THEN 1 ELSE 0 END) AS medsup_pharmacy_users,
       SUM(CASE WHEN ISNULL(u.dc_cost_id, 0) NOT IN (50, 82) THEN 1 ELSE 0 END) AS other_users
FROM [dbo].[dc_user_menu] um
JOIN [dbo].[dc_menu] m ON m.dc_menu_id = um.dc_menu_id
LEFT JOIN [dbo].[dc_user] u ON u.dc_user_id = um.dc_user_id
WHERE m.c_filelocation IN ('sp-contract?st=ST00092', 'sp-newTorMedSup', 'sp-contract?st=ST00094',
                           'sp-contract?st=ST00095', 'sp-contract?st=ST00096', 'sp-contract?st=ST00097')
  AND um.i_show = 1
GROUP BY m.c_filelocation;
GO
