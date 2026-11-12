/* ============================================================================
   sp_sync_overlap_from_withdrawal  (NMU_ERP)

   ปัญหา: user เลือกใบกันเหลื่อมที่หน้า "ใบเบิก" (EIS: po_working_dtl.c_booking +
   i_budget_year_overlap) แต่หน้า "ตรวจรับ" ไม่รู้ ทำให้
     - ตรวจรับไม่มีเลขใบกัน (sp_check_period_hdr.c_overlap ว่าง) / ใบเบิกร่างไม่แสดงเลขใบกัน
     - ไม่มีรายการตัดใบกัน (bg_reserve_overlap)
     - ยังจองเงินปีปัจจุบัน (bg_reserve_money) ค้างอยู่ -> ตัดเงินซ้ำ

   ทำอะไร (เมื่อ @apply = 1 และเข้าเงื่อนไข):
     1) สร้างรายการตัดใบกัน bg_reserve_overlap (i_sys=1, chk_id=เลขตรวจรับ, ปีของใบกัน, ปิดแล้ว i_finish=1)
     2) เติม sp_check_period_hdr: c_overlap, i_overlap=2, bg_reserve_overlap_id, i_yyyy_overlap
     3) ยกเลิกการจองเงินปีปัจจุบันที่ค้าง (bg_reserve_money.i_enable=0) ถ้ายังไม่ปิด

   เงื่อนไข: ตรวจรับมีใบเบิกที่ใช้งานอยู่, ใบเบิกมีเลขใบกัน (c_booking) และ "ปีที่ใช้เงิน" <> "ปีงบประมาณ",
             ตรวจรับยังไม่มีเลขใบกัน (ถ้ามีแล้วใช้เครื่องมือ "ตรวจใบกัน" > แก้ไขรายการที่ผิด)
   @apply = 0 : ตรวจอย่างเดียว ไม่เขียนข้อมูล (status = PENDING ถ้าต้องปรับ)

   ผลลัพธ์ (1 แถว): status, chk_id, wd_code, c_booking, i_year_overlap, bg_reserve_overlap_id, money_cancelled, err_msg
   status: PENDING | SYNCED | ALREADY_LINKED | NOT_OVERLAP | NO_WITHDRAWAL | OVERLAP_NOT_FOUND | NOT_FOUND | ERROR (err_msg)
   เรียกจาก: EIS po/api/mn_poReg.php (ตอนบันทึกใบเบิก) และ ERP sp/tor/api/mnCheckingController.php
   ============================================================================ */
USE NMU_ERP;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
IF OBJECT_ID('dbo.sp_sync_overlap_from_withdrawal') IS NOT NULL
    DROP PROCEDURE dbo.sp_sync_overlap_from_withdrawal;
GO
CREATE PROCEDURE dbo.sp_sync_overlap_from_withdrawal
    @chk_id INT,
    @apply BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    -- ไม่ใช้ XACT_ABORT: โพรซีเจอร์นี้ถูกเรียกระหว่าง transaction ของการบันทึกใบเบิก (EIS)
    -- ถ้า error ต้องไม่ทำให้การบันทึกใบเบิกล้มตามไปด้วย ใช้ SAVE TRAN + TRY/CATCH ย้อนเฉพาะส่วนของตัวเอง
    SET XACT_ABORT OFF;

    DECLARE @status VARCHAR(30) = 'NOT_FOUND';
    DECLARE @found INT = 0, @contract BIGINT, @tor BIGINT, @wd_id BIGINT, @c_overlap VARCHAR(100),
            @money_id BIGINT, @f_total DECIMAL(18,2);
    DECLARE @wd_code VARCHAR(50), @booking VARCHAR(100), @by INT, @oy INT, @wd_amt DECIMAL(18,2);
    DECLARE @ov_year INT, @ov_cost INT, @ov_bt INT, @ov_exp INT, @ov_acc INT;
    DECLARE @m_pr BIGINT, @m_prtype INT, @m_cost INT, @m_bt INT, @m_exp INT, @m_acc INT,
            @m_amt DECIMAL(18,2), @m_enable INT, @m_finish INT;
    DECLARE @new_ro BIGINT = NULL, @money_cancelled INT = 0, @tc INT = @@TRANCOUNT, @err NVARCHAR(400) = NULL;

    SELECT @found = 1, @contract = sp_tor_contract_id, @wd_id = po_working_hdr_id,
           @c_overlap = c_overlap, @money_id = bg_checking_money_id, @f_total = f_total
    FROM dbo.sp_check_period_hdr
    WHERE sp_check_period_hdr_id = @chk_id AND ISNULL(i_enabled, 1) = 1;

    IF @found = 1
    BEGIN
        SELECT TOP 1 @wd_code = d.c_code, @booking = LTRIM(RTRIM(d.c_booking)),
               @by = d.i_budget_year, @oy = d.i_budget_year_overlap, @wd_amt = d.f_total
        FROM NMU_EIS.dbo.po_working_hdr h
        INNER JOIN NMU_EIS.dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
        WHERE h.po_working_hdr_id = @wd_id AND h.i_enable = 1
        ORDER BY d.po_working_dtl_id;

        IF @@ROWCOUNT = 0 OR @wd_id IS NULL
            SET @status = 'NO_WITHDRAWAL';
        ELSE IF ISNULL(@booking, '') = '' OR @oy IS NULL OR @by IS NULL OR @oy = @by
            SET @status = 'NOT_OVERLAP';
        ELSE IF ISNULL(@c_overlap, '') <> ''
            SET @status = 'ALREADY_LINKED';
        ELSE
        BEGIN
            SELECT TOP 1 @ov_year = o.i_year, @ov_cost = o.dc_cost_id, @ov_bt = o.dc_expense_budget_type_id,
                   @ov_exp = o.bg_expense_id, @ov_acc = o.dc_cost_acc_id
            FROM NMU_EIS.dbo.vw_bg_budget_overlap o
            WHERE o.c_code_ref = @booking;

            IF @@ROWCOUNT = 0
                SET @status = 'OVERLAP_NOT_FOUND';
            ELSE IF ISNULL(@apply, 0) = 0
                SET @status = 'PENDING';
            ELSE
            BEGIN
                SELECT @tor = sp_tor_id FROM dbo.sp_tor_contract WHERE sp_tor_contract_id = @contract;

                IF @money_id IS NOT NULL
                    SELECT @m_pr = pr_id, @m_prtype = i_pr_type, @m_cost = dc_cost_id, @m_bt = dc_budget_type_id,
                           @m_exp = bg_expense_id, @m_acc = dc_cost_acc_id, @m_amt = f_amt,
                           @m_enable = i_enable, @m_finish = i_finish
                    FROM NMU_EIS.dbo.bg_reserve_money WHERE bg_reserve_money_id = @money_id;

                BEGIN TRY
                IF @tc = 0 BEGIN TRAN; ELSE SAVE TRAN sync_overlap_wd;

                SELECT TOP 1 @new_ro = bg_reserve_overlap_id
                FROM NMU_EIS.dbo.bg_reserve_overlap
                WHERE i_sys = 1 AND chk_id = @chk_id AND c_code_overlap = @booking AND i_enable = 1;

                IF @new_ro IS NULL
                BEGIN
                    INSERT INTO NMU_EIS.dbo.bg_reserve_overlap
                        (c_code_overlap, i_sys, pr_id, po_id, chk_id, i_year, i_pr_type, i_reserve,
                         dc_cost_id, dc_budget_type_id, bg_expense_id, i_finish, i_last, f_amt,
                         i_enable, d_create, d_update, dc_cost_acc_id)
                    VALUES
                        (@booking, 1, ISNULL(@m_pr, @tor), @contract, @chk_id, @ov_year, ISNULL(@m_prtype, 1), 3,
                         ISNULL(@m_cost, @ov_cost), ISNULL(@m_bt, @ov_bt), ISNULL(@m_exp, @ov_exp), 1, 0,
                         ISNULL(@m_amt, ISNULL(@f_total, @wd_amt)),
                         1, GETDATE(), GETDATE(), ISNULL(@m_acc, @ov_acc));
                    SET @new_ro = SCOPE_IDENTITY();
                END

                UPDATE dbo.sp_check_period_hdr
                SET c_overlap = @booking, i_overlap = 2, bg_reserve_overlap_id = @new_ro,
                    i_yyyy_overlap = CAST(@ov_year AS VARCHAR(4)), d_update = GETDATE()
                WHERE sp_check_period_hdr_id = @chk_id;

                -- ยกเลิกการจองเงินปีปัจจุบันที่ค้าง (ใช้ใบกันแล้ว ไม่ต้องตัดเงินปีปัจจุบันซ้ำ)
                IF @money_id IS NOT NULL AND ISNULL(@m_enable, 0) = 1 AND ISNULL(@m_finish, 0) = 0
                BEGIN
                    UPDATE NMU_EIS.dbo.bg_reserve_money
                    SET i_enable = 0, d_update = GETDATE(),
                        c_comment = LEFT(N'ยกเลิก ' + CONVERT(VARCHAR(10), GETDATE(), 23)
                            + N': ใบเบิก ' + ISNULL(@wd_code, '') + N' ใช้ใบกันเหลื่อม ' + @booking + N' แล้ว', 255)
                    WHERE bg_reserve_money_id = @money_id AND i_enable = 1;
                    SET @money_cancelled = @@ROWCOUNT;
                END

                IF @tc = 0 COMMIT TRAN;
                SET @status = 'SYNCED';
                END TRY
                BEGIN CATCH
                    SET @err = ERROR_MESSAGE();
                    SET @status = 'ERROR';
                    SET @new_ro = NULL;
                    SET @money_cancelled = 0;
                    IF @tc = 0 AND @@TRANCOUNT > 0 ROLLBACK TRAN;
                    ELSE IF @tc > 0 AND XACT_STATE() = 1 ROLLBACK TRAN sync_overlap_wd;
                END CATCH
            END
        END
    END

    SELECT @status AS status, @chk_id AS chk_id, @wd_code AS wd_code, @booking AS c_booking,
           @ov_year AS i_year_overlap, @new_ro AS bg_reserve_overlap_id, @money_cancelled AS money_cancelled, @err AS err_msg;
END
GO
