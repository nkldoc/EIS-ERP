/*
  ตรวจใบเบิก D ที่ยังใช้งาน แต่ใบตรวจรับถูกยกเลิก
  รันใน SQL Server / SSMS: อ่านข้อมูลเท่านั้น ไม่มีการแก้ไขข้อมูล
  ตรวจทั้งลิงก์จากตรวจรับ และ chk_id จากใบเบิก (รวมคู่ซ้ำเป็นหนึ่งคู่)
  จำนวน total_matches คือจำนวนคู่ใบตรวจรับ/ใบเบิก ไม่ใช่จำนวนใบเบิกไม่ซ้ำ
*/
USE [NMU_ERP];
GO
SET NOCOUNT ON;

;WITH withdrawal_links AS
(
    SELECT
        c.sp_check_period_hdr_id,
        c.po_working_hdr_id,
        1 AS linked_from_checking,
        0 AS linked_from_withdrawal
    FROM dbo.sp_check_period_hdr AS c
    WHERE c.i_enabled = 2
      AND c.po_working_hdr_id IS NOT NULL

    UNION ALL

    SELECT
        b.chk_id,
        b.po_working_hdr_id,
        0,
        1
    FROM NMU_EIS.dbo.po_working_begin_hdr AS b
    INNER JOIN dbo.sp_check_period_hdr AS c
        ON c.sp_check_period_hdr_id = b.chk_id
       AND c.i_enabled = 2
),
distinct_links AS
(
    SELECT
        sp_check_period_hdr_id,
        po_working_hdr_id,
        MAX(linked_from_checking) AS linked_from_checking,
        MAX(linked_from_withdrawal) AS linked_from_withdrawal
    FROM withdrawal_links
    GROUP BY sp_check_period_hdr_id, po_working_hdr_id
)
SELECT
    COUNT_BIG(*) OVER () AS total_matches,
    c.sp_check_period_hdr_id,
    c.c_code AS checking_code,
    c.c_contract_code,
    c.sp_tor_hdr_period_id,
    c.i_enabled AS checking_enabled,
    N'ยกเลิก' AS checking_status,
    w.po_working_hdr_id,
    w.c_code_ref AS withdrawal_code,
    w.i_enable AS withdrawal_enabled,
    N'ใช้งาน' AS withdrawal_status,
    c.po_working_hdr_id AS checking_current_withdrawal_id,
    l.linked_from_checking,
    l.linked_from_withdrawal
FROM distinct_links AS l
INNER JOIN dbo.sp_check_period_hdr AS c
    ON c.sp_check_period_hdr_id = l.sp_check_period_hdr_id
INNER JOIN NMU_EIS.dbo.po_working_hdr AS w
    ON w.po_working_hdr_id = l.po_working_hdr_id
WHERE c.i_enabled = 2
  AND w.i_enable = 1
  AND UPPER(LTRIM(RTRIM(w.c_code_ref))) LIKE 'D%'
ORDER BY c.sp_check_period_hdr_id, w.po_working_hdr_id;
GO
