-- =======================================================
-- เริ่มต้นทำงานสำหรับฐานข้อมูล NMU_ERP
-- =======================================================
USE [NMU_ERP];
GO

/* ตรวจสอบ Schema สำหรับโมดูล receive-validation ในฐานข้อมูล NMU_ERP
   ไฟล์หลักสำหรับสร้างตาราง:
   ../../scriptBaseUpdate/sp_check_fix_case.sql */
IF OBJECT_ID(N'dbo.sp_check_fix_case',N'U') IS NULL
    THROW 51000, 'Missing dbo.sp_check_fix_case in NMU_ERP. Run sp_check_fix_case.sql first.', 1;
IF OBJECT_ID(N'dbo.sp_check_fix_case_log',N'U') IS NULL
    THROW 51000, 'Missing dbo.sp_check_fix_case_log in NMU_ERP. Run sp_check_fix_case.sql first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.sp_check_fix_case_log') AND name=N'IX_sp_check_fix_case_log_checking')
    CREATE INDEX [IX_sp_check_fix_case_log_checking]
    ON [dbo].[sp_check_fix_case_log]([sp_check_period_hdr_id],[sp_check_fix_case_id],[d_create] DESC);
GO

IF OBJECT_ID(N'dbo.sp_check_history',N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.sp_check_history') AND name=N'IX_sp_check_history_hdr_date')
    CREATE INDEX [IX_sp_check_history_hdr_date]
    ON [dbo].[sp_check_history]([sp_check_period_hdr_id],[date_time] DESC)
    INCLUDE ([document_number],[status],[subject]);
GO

IF OBJECT_ID(N'dbo.sp_tranf_hdr',N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.sp_tranf_hdr') AND name=N'IX_sp_tranf_hdr_checking')
    CREATE INDEX [IX_sp_tranf_hdr_checking]
    ON [dbo].[sp_tranf_hdr]([sp_check_period_hdr_id],[sp_tranf_hdr_id]);
GO

IF OBJECT_ID(N'dbo.sp_tranf_item',N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.sp_tranf_item') AND name=N'IX_sp_tranf_item_hdr')
    CREATE INDEX [IX_sp_tranf_item_hdr]
    ON [dbo].[sp_tranf_item]([sp_tranf_hdr_id],[sp_tranf_item_id]);
GO

USE [NMU_ERPLOG];
GO
IF OBJECT_ID(N'dbo.sys_log_change',N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.sys_log_change') AND name=N'IX_sys_log_change_table_row_date')
    CREATE INDEX [IX_sys_log_change_table_row_date]
    ON [dbo].[sys_log_change]([table_name],[row_id],[date_create] DESC)
    INCLUDE ([field_name],[old_value],[new_value],[user_id],[remarks]);
GO
USE [NMU_ERP];
GO

/* Case: current fiscal year must use departmental revenue (49), not source 2. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-WRONG-FUND-CURRENT-YEAR')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-WRONG-FUND-CURRENT-YEAR',
        N'ใช้เงินผิดแหล่งเงิน',
        N'ปีงบประมาณปัจจุบันและแหล่งเงินเดิมเป็น 2 ต้องเปลี่ยนเป็นเงินรายได้ส่วนงาน (49)',
        N'SELECT CASE WHEN EXISTS (
            SELECT 1 FROM dbo.sp_check_period_dtl d
            JOIN dbo.sp_check_period_hdr h ON h.sp_check_period_hdr_id=d.sp_check_period_hdr_id
            JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
            JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=p.sp_tor_contract_id
            JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id
            WHERE d.sp_check_period_hdr_id=:sp_check_period_hdr_id
              AND d.dc_bg_budget_type_id=2
              AND CASE WHEN h.i_yyyy_overlap IS NULL AND c.i_yyyy_overlap IS NULL THEN t.i_yyyy
                       WHEN h.i_yyyy_overlap IS NULL THEN c.i_yyyy_overlap
                       WHEN c.i_yyyy_overlap IS NULL THEN h.i_yyyy_overlap
                       ELSE h.i_yyyy_overlap END
                  = CASE WHEN MONTH(GETDATE())>9 THEN YEAR(GETDATE())+1 ELSE YEAR(GETDATE()) END
        ) THEN 1 ELSE 0 END AS is_invalid',
        N'SELECT d.sp_check_period_dtl_id,d.sp_check_period_hdr_id,
                 d.dc_bg_budget_type_id AS old_dc_bg_budget_type_id,
                 CAST(49 AS BIGINT) AS new_dc_bg_budget_type_id,
                 N''เงินรายได้ส่วนงาน'' AS new_budget_type_name
          FROM dbo.sp_check_period_dtl d
          WHERE d.sp_check_period_hdr_id=:sp_check_period_hdr_id AND d.dc_bg_budget_type_id=2',
        N'UPDATE d SET d.dc_bg_budget_type_id=49
          FROM dbo.sp_check_period_dtl d
          JOIN dbo.sp_check_period_hdr h ON h.sp_check_period_hdr_id=d.sp_check_period_hdr_id
          JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
          JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=p.sp_tor_contract_id
          JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id
          WHERE d.sp_check_period_hdr_id=:sp_check_period_hdr_id
            AND d.dc_bg_budget_type_id=2
            AND CASE WHEN h.i_yyyy_overlap IS NULL AND c.i_yyyy_overlap IS NULL THEN t.i_yyyy
                     WHEN h.i_yyyy_overlap IS NULL THEN c.i_yyyy_overlap
                     WHEN c.i_yyyy_overlap IS NULL THEN h.i_yyyy_overlap
                     ELSE h.i_yyyy_overlap END
                = CASE WHEN MONTH(GETDATE())>9 THEN YEAR(GETDATE())+1 ELSE YEAR(GETDATE()) END',
        N'SELECT d.sp_check_period_dtl_id,d.sp_check_period_hdr_id,d.dc_bg_budget_type_id,
                 CASE WHEN d.dc_bg_budget_type_id=49 THEN N''เงินรายได้ส่วนงาน'' ELSE N''ไม่ถูกต้อง'' END AS result
          FROM dbo.sp_check_period_dtl d WHERE d.sp_check_period_hdr_id=:sp_check_period_hdr_id',
        N'SELECT d.* FROM dbo.sp_check_period_dtl d
          WHERE d.sp_check_period_hdr_id=:sp_check_period_hdr_id AND d.dc_bg_budget_type_id=2',
        2,1,1,1,10
    );
END;
GO


/* Case: current UI budget year must use departmental revenue source 49. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-CURRENT-YEAR-EXPENSE-FUND-49')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-CURRENT-YEAR-EXPENSE-FUND-49',
        N'ยืนยันเปลี่ยนแหล่งเงินปีงบประมาณปัจจุบัน',
        N'เมื่อใช้เงินปีงบประมาณปัจจุบันและแหล่งเงินไม่ใช่ 49 ต้องยืนยันเปลี่ยนเป็นเงินรายได้ส่วนงาน 49',
        N'SELECT CASE WHEN
            ISNULL(TRY_CONVERT(INT,:dc_expense_budget_type_id),0)<>49
            AND TRY_CONVERT(INT,:i_yyyy_overlap) IN (
                CASE WHEN MONTH(GETDATE())>9 THEN YEAR(GETDATE())+1 ELSE YEAR(GETDATE()) END,
                CASE WHEN MONTH(GETDATE())>9 THEN YEAR(GETDATE())+544 ELSE YEAR(GETDATE())+543 END
            )
            THEN 1 ELSE 0 END AS is_invalid',
        N'SELECT :sp_tor_hdr_period_id AS sp_tor_hdr_period_id,
            TRY_CONVERT(INT,:i_yyyy_overlap) AS i_yyyy_overlap,
            CASE WHEN MONTH(GETDATE())>9 THEN YEAR(GETDATE())+544 ELSE YEAR(GETDATE())+543 END AS current_budget_year,
            TRY_CONVERT(INT,:dc_expense_budget_type_id) AS old_dc_expense_budget_type_id,
            CAST(49 AS INT) AS new_dc_expense_budget_type_id,
            N''เงินรายได้ส่วนงาน'' AS new_budget_type_name',
        N'UPDATE dbo.sp_tor_hdr_period
          SET dc_expense_budget_type_id=49
          WHERE sp_tor_hdr_period_id=:sp_tor_hdr_period_id
            AND ISNULL(dc_expense_budget_type_id,0)<>49',
        N'SELECT p.sp_tor_hdr_period_id,p.i_yyyy_overlap,p.dc_expense_budget_type_id,
            CASE WHEN p.dc_expense_budget_type_id=49 THEN N''เงินรายได้ส่วนงาน'' ELSE N''ยังไม่ถูกต้อง'' END AS result
          FROM dbo.sp_tor_hdr_period p
          WHERE p.sp_tor_hdr_period_id=:sp_tor_hdr_period_id',
        N'SELECT p.sp_tor_hdr_period_id,p.i_yyyy_overlap,p.dc_expense_budget_type_id
          FROM dbo.sp_tor_hdr_period p
          WHERE p.sp_tor_hdr_period_id=:sp_tor_hdr_period_id',
        3,1,1,1,15
    );
END;
GO


/* Repair/refresh the closed-period case if it was saved through form URL encoding. */
UPDATE dbo.sp_check_fix_case
SET sql_condition=N'SELECT CASE WHEN TRY_CONVERT(DATE,NULLIF(:d_checking_date,'''')) IS NOT NULL AND EXISTS (
        SELECT 1 FROM NMU.dbo.gl_dc_period p
        WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
          AND ((YEAR(TRY_CONVERT(DATE,:d_checking_date))+543)*100+MONTH(TRY_CONVERT(DATE,:d_checking_date)))
              <= (TRY_CONVERT(INT,p.c_yyyy)*100+TRY_CONVERT(INT,p.c_mm))
    ) THEN 1 ELSE 0 END AS is_warning',
    sql_before_display=N'SELECT TOP 1 :sp_check_period_hdr_id AS sp_check_period_hdr_id,
        RIGHT(''0''+CONVERT(VARCHAR(2),p.c_mm),2)+''/''+CONVERT(VARCHAR(4),p.c_yyyy) AS closed_period,
        RIGHT(''0''+CONVERT(VARCHAR(2),MONTH(TRY_CONVERT(DATE,:d_checking_date))),2)+''/''+CONVERT(VARCHAR(4),YEAR(TRY_CONVERT(DATE,:d_checking_date))) AS checking_month,
        N''วันที่ตรวจรับต้องอยู่ในเดือนถัดจากงวดที่ปิดแล้ว'' AS warning_message
      FROM NMU.dbo.gl_dc_period p
      WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
      ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
    sql_update=NULL,
    sql_after_display=N'SELECT TOP 1 p.c_mm,p.c_yyyy,p.i_status,p.c_status,p.i_system,p.i_last_period
      FROM NMU.dbo.gl_dc_period p
      WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
      ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
    sql_before_snapshot=N'SELECT TOP 1 p.* FROM NMU.dbo.gl_dc_period p
      WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
      ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
    i_allow_update=0,
    d_update=SYSDATETIME()
WHERE c_case_code='RV-CHECKING-DATE-CLOSED-PERIOD';
GO

/* Case: inspection month must be later than the latest closed GL period for system 4. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-CHECKING-DATE-CLOSED-PERIOD')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-CHECKING-DATE-CLOSED-PERIOD',
        N'วันที่ตรวจรับอยู่ในงวดบัญชีที่ปิดแล้ว',
        N'เดือนของวันที่บันทึกการตรวจรับต้องมากกว่างวดบัญชีล่าสุดที่ปิดสำหรับระบบจัดซื้อ',
        N'SELECT CASE WHEN TRY_CONVERT(DATE,NULLIF(:d_checking_date,'''')) IS NOT NULL AND EXISTS (
            SELECT 1 FROM NMU.dbo.gl_dc_period p
            WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
              AND ((YEAR(TRY_CONVERT(DATE,:d_checking_date))+543)*100+MONTH(TRY_CONVERT(DATE,:d_checking_date)))
                  <= (TRY_CONVERT(INT,p.c_yyyy)*100+TRY_CONVERT(INT,p.c_mm))
        ) THEN 1 ELSE 0 END AS is_warning',
        N'SELECT TOP 1 :sp_check_period_hdr_id AS sp_check_period_hdr_id,
            RIGHT(''0''+CONVERT(VARCHAR(2),p.c_mm),2)+''/''+CONVERT(VARCHAR(4),p.c_yyyy) AS closed_period,
            RIGHT(''0''+CONVERT(VARCHAR(2),MONTH(TRY_CONVERT(DATE,:d_checking_date))),2)+''/''+CONVERT(VARCHAR(4),YEAR(TRY_CONVERT(DATE,:d_checking_date))) AS checking_month,
            N''วันที่ตรวจรับต้องอยู่ในเดือนถัดจากงวดที่ปิดแล้ว'' AS warning_message
          FROM NMU.dbo.gl_dc_period p
          WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
          ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
        NULL,
        N'SELECT TOP 1 p.c_mm,p.c_yyyy,p.i_status,p.c_status,p.i_system,p.i_last_period
          FROM NMU.dbo.gl_dc_period p WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
          ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
        N'SELECT TOP 1 p.* FROM NMU.dbo.gl_dc_period p
          WHERE p.i_system=''4'' AND p.i_status=2 AND p.i_last_period=1
          ORDER BY TRY_CONVERT(INT,p.c_yyyy) DESC,TRY_CONVERT(INT,p.c_mm) DESC',
        2,0,0,1,50
    );
END;
GO

/* Case: UI debt amount must equal the inspection amount. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-DEBT-AMOUNT-MISMATCH')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-DEBT-AMOUNT-MISMATCH',
        N'เงินตั้งหนี้ไม่ตรงกับเงินตรวจรับ',
        N'ยอดเงินตั้งหนี้ไม่เท่ากับยอดเงินตรวจรับ กรุณากลับไปแก้ไขข้อมูลในหน้าตรวจรับ',
        N'SELECT CASE WHEN
            ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_sum_Transf),0)
            <> ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_totalID),0)
            THEN 1 ELSE 0 END AS is_warning',
        N'SELECT :sp_check_period_hdr_id AS sp_check_period_hdr_id,
            ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_sum_Transf),0) AS f_sum_Transf,
            ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_totalID),0) AS f_totalID,
            ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_sum_Transf),0)-ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_totalID),0) AS difference_amount,
            N''กรุณากลับไปแก้ไขยอดเงินในหน้าตรวจรับ'' AS warning_message',
        NULL,
        N'SELECT :sp_check_period_hdr_id AS sp_check_period_hdr_id,
            TRY_CONVERT(DECIMAL(18,2),:f_sum_Transf) AS f_sum_Transf,
            TRY_CONVERT(DECIMAL(18,2),:f_totalID) AS f_totalID',
        N'SELECT h.* FROM dbo.sp_check_period_hdr h WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id',
        2,0,0,1,40
    );
END;
GO

/* Case: receive/document-complete date must not be after the inspection date. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-DATE-INCONSISTENT')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-DATE-INCONSISTENT',
        N'วันที่รับของและวันที่ตรวจรับไม่สอดคล้องกัน',
        N'วันที่รับของ/เอกสารสมบูรณ์ต้องน้อยกว่าหรือเท่ากับวันที่บันทึกการตรวจรับ',
        N'SELECT CASE WHEN
            TRY_CONVERT(DATE,NULLIF(:d_doc_arrive_dt,'''')) IS NOT NULL
            AND TRY_CONVERT(DATE,NULLIF(:d_checking_date,'''')) IS NOT NULL
            AND TRY_CONVERT(DATE,:d_doc_arrive_dt)>TRY_CONVERT(DATE,:d_checking_date)
            THEN 1 ELSE 0 END AS is_warning',
        N'SELECT :sp_check_period_hdr_id AS sp_check_period_hdr_id,
            CONVERT(VARCHAR(10),TRY_CONVERT(DATE,:d_doc_arrive_dt),23) AS receive_complete_date,
            CONVERT(VARCHAR(10),TRY_CONVERT(DATE,:d_checking_date),23) AS checking_date,
            N''วันที่รับของ/เอกสารสมบูรณ์ต้องไม่เกินวันที่บันทึกการตรวจรับ'' AS warning_message',
        NULL,
        N'SELECT h.sp_check_period_hdr_id,h.d_doc_arrive_dt,h.d_checking_date
          FROM dbo.sp_check_period_hdr h WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id',
        N'SELECT h.* FROM dbo.sp_check_period_hdr h WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id',
        2,0,0,1,30
    );
END;
GO

/* Keep the installed date case based strictly on the current UI values. */
UPDATE dbo.sp_check_fix_case
SET sql_condition=N'SELECT CASE WHEN
        TRY_CONVERT(DATE,NULLIF(:d_doc_arrive_dt,'''')) IS NOT NULL
        AND TRY_CONVERT(DATE,NULLIF(:d_checking_date,'''')) IS NOT NULL
        AND TRY_CONVERT(DATE,:d_doc_arrive_dt)>TRY_CONVERT(DATE,:d_checking_date)
        THEN 1 ELSE 0 END AS is_warning',
    sql_before_display=N'SELECT :sp_check_period_hdr_id AS sp_check_period_hdr_id,
        CONVERT(VARCHAR(10),TRY_CONVERT(DATE,:d_doc_arrive_dt),23) AS receive_complete_date,
        CONVERT(VARCHAR(10),TRY_CONVERT(DATE,:d_checking_date),23) AS checking_date,
        N''วันที่รับของ/เอกสารสมบูรณ์ต้องไม่เกินวันที่บันทึกการตรวจรับ'' AS warning_message',
    d_update=SYSDATETIME()
WHERE c_case_code='RV-DATE-INCONSISTENT';
GO

/* Case: the current receive period was cancelled and must be re-enabled. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-PERIOD-CANCELLED')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-PERIOD-CANCELLED',
        N'งวดตรวจรับถูกยกเลิก',
        N'พบ sp_tor_hdr_period.i_enabled = 2 ต้องยืนยันเพื่อเปิดใช้งานงวดกลับเป็น 1',
        N'SELECT CASE WHEN EXISTS (
            SELECT 1 FROM dbo.sp_check_period_hdr h
            JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
            WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2
        ) THEN 1 ELSE 0 END AS is_cancelled',
        N'SELECT h.sp_check_period_hdr_id,p.sp_tor_hdr_period_id,h.c_checking_code,h.c_arrive_code,
                 p.i_enabled AS old_i_enabled,CAST(1 AS INT) AS new_i_enabled,
                 N''งวดถูกยกเลิก ต้องเปิดใช้งานก่อนบันทึก'' AS warning_message
          FROM dbo.sp_check_period_hdr h
          JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
        N'UPDATE p SET p.i_enabled=1
          FROM dbo.sp_tor_hdr_period p
          JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id=p.sp_tor_hdr_period_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
        N'SELECT h.sp_check_period_hdr_id,p.sp_tor_hdr_period_id,p.i_enabled,
                 CASE WHEN p.i_enabled=1 THEN N''เปิดใช้งานแล้ว'' ELSE N''ยังไม่เปิดใช้งาน'' END AS result
          FROM dbo.sp_check_period_hdr h
          JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id',
        N'SELECT p.* FROM dbo.sp_check_period_hdr h
          JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
        3,1,1,1,5
    );
END;
GO

/* Keep an already-installed case aligned with the actual period table. */
UPDATE dbo.sp_check_fix_case
SET c_case_description=N'พบ sp_tor_hdr_period.i_enabled = 2 ต้องยืนยันเพื่อเปิดใช้งานงวดกลับเป็น 1',
    sql_condition=N'SELECT CASE WHEN EXISTS (
        SELECT 1 FROM dbo.sp_check_period_hdr h
        JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
        WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2
    ) THEN 1 ELSE 0 END AS is_cancelled',
    sql_before_display=N'SELECT h.sp_check_period_hdr_id,p.sp_tor_hdr_period_id,h.c_checking_code,h.c_arrive_code,
        p.i_enabled AS old_i_enabled,CAST(1 AS INT) AS new_i_enabled,
        N''งวดถูกยกเลิก ต้องเปิดใช้งานก่อนบันทึก'' AS warning_message
        FROM dbo.sp_check_period_hdr h
        JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
        WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
    sql_update=N'UPDATE p SET p.i_enabled=1
        FROM dbo.sp_tor_hdr_period p
        JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id=p.sp_tor_hdr_period_id
        WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
    sql_after_display=N'SELECT h.sp_check_period_hdr_id,p.sp_tor_hdr_period_id,p.i_enabled,
        CASE WHEN p.i_enabled=1 THEN N''เปิดใช้งานแล้ว'' ELSE N''ยังไม่เปิดใช้งาน'' END AS result
        FROM dbo.sp_check_period_hdr h
        JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
        WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id',
    sql_before_snapshot=N'SELECT p.* FROM dbo.sp_check_period_hdr h
        JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
        WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id AND p.i_enabled=2',
    d_update=SYSDATETIME()
WHERE c_case_code='RV-PERIOD-CANCELLED';
GO

/* UI value overrides the not-yet-saved database VAT value. */
UPDATE dbo.sp_check_fix_case
SET sql_condition=N'SELECT CASE
        WHEN ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_vat),0)>0 THEN 0
        WHEN EXISTS (
            SELECT 1 FROM dbo.sp_tranf_item i
            JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id
            WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id
              AND i.i_enabled=1 AND ISNULL(i.f_vat_amt,0)=0
        ) THEN 1 ELSE 0 END AS is_warning',
    d_update=SYSDATETIME()
WHERE c_case_code='RV-VAT-AMOUNT-ZERO';
GO

/* Case: warn when a transfer item has no VAT; informational only, no auto-fix. */
IF NOT EXISTS (SELECT 1 FROM dbo.sp_check_fix_case WHERE c_case_code='RV-VAT-AMOUNT-ZERO')
BEGIN
    INSERT dbo.sp_check_fix_case
    (
        c_case_code,c_case_name,c_case_description,
        sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,
        i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order
    )
    VALUES
    (
        'RV-VAT-AMOUNT-ZERO',
        N'ยอดภาษีมูลค่าเพิ่มเป็นศูนย์',
        N'พบรายการที่ f_vat_amt เป็น 0 กรุณาตรวจสอบความถูกต้องก่อนบันทึกรายการหลัก',
        N'SELECT CASE
        WHEN ISNULL(TRY_CONVERT(DECIMAL(18,2),:f_vat),0)>0 THEN 0
        WHEN EXISTS (
            SELECT 1 FROM dbo.sp_tranf_item i
            JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id
            WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id
              AND i.i_enabled=1 AND ISNULL(i.f_vat_amt,0)=0
        ) THEN 1 ELSE 0 END AS is_warning',
        N'SELECT i.sp_tranf_item_id,i.sp_tranf_hdr_id,i.c_name,
                 i.f_net_total_price,ISNULL(i.f_vat_amt,0) AS f_vat_amt,
                 N''กรุณาตรวจสอบยอดภาษีมูลค่าเพิ่ม'' AS warning_message
          FROM dbo.sp_tranf_item i
          JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id
            AND i.i_enabled=1 AND ISNULL(i.f_vat_amt,0)=0',
        NULL,
        N'SELECT i.sp_tranf_item_id,i.sp_tranf_hdr_id,i.c_name,
                 i.f_net_total_price,ISNULL(i.f_vat_amt,0) AS f_vat_amt
          FROM dbo.sp_tranf_item i
          JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id
            AND i.i_enabled=1 AND ISNULL(i.f_vat_amt,0)=0',
        N'SELECT i.* FROM dbo.sp_tranf_item i
          JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id
          WHERE h.sp_check_period_hdr_id=:sp_check_period_hdr_id
            AND i.i_enabled=1 AND ISNULL(i.f_vat_amt,0)=0',
        2,0,0,1,20
    );
END;
GO
