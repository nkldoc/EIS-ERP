-- Run against the supplies database before deploying the PHP change.
-- The legacy procedure inserts without a column list, so update it in the same transaction.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'dbo.sp_doc_gen', N'c_detail') IS NULL
        ALTER TABLE dbo.sp_doc_gen ADD c_detail NVARCHAR(MAX) NULL;
    ELSE
        ALTER TABLE dbo.sp_doc_gen ALTER COLUMN c_detail NVARCHAR(MAX) NULL;

    EXEC sys.sp_executesql N'
ALTER PROCEDURE dbo.SP_GEN_CODE_CONTRACT
    @doc_code VARCHAR(20), @c_yyyy VARCHAR(4), @doc_gen VARCHAR(20),
    @user_id NUMERIC, @user_cost_id NUMERIC, @ref_id NUMERIC
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @dc_doc_id NUMERIC, @digit INT, @now DATETIME = GETDATE();
    SELECT @dc_doc_id = dc_doc_id, @digit = i_digit
    FROM dbo.sp_doc WHERE c_code = @doc_code;

    INSERT INTO dbo.sp_doc_gen
        (dc_doc_id, ref_id, c_yyyy, i_value, dc_user_create_id,
         dc_user_create_cost_id, d_create, c_gen, c_date, d_gen_date, c_detail)
    SELECT @dc_doc_id, @ref_id, @c_yyyy, a.i_max_value,
        @user_id, @user_cost_id, @now, n.c_gen, NULL, NULL,
        N''วันที่ออกเลข: '' + LEFT(CONVERT(VARCHAR(10), @now, 105), 6)
        + CONVERT(VARCHAR(4), YEAR(@now) + 543) + NCHAR(13) + NCHAR(10)
        + N''เลขสัญญา: '' + n.c_gen + NCHAR(13) + NCHAR(10)
        + N''ประเภท: ปกติ (''
        + CASE WHEN @dc_doc_id IN (1, 2, 3) THEN N''ใบสั่ง'' ELSE N''สัญญา'' END
        + CASE WHEN @dc_doc_id IN (1, 4) THEN N''ซื้อ''
               WHEN @dc_doc_id IN (2, 5) THEN N''จ้าง''
               WHEN @dc_doc_id IN (3, 6) THEN N''เช่า'' ELSE N'''' END + N'')''
    FROM (SELECT ISNULL(MAX(i_value), 0) + 1 AS i_max_value
          FROM dbo.sp_doc_gen WHERE dc_doc_id = @dc_doc_id AND c_yyyy = @c_yyyy) a
    CROSS APPLY (SELECT @doc_code + @doc_gen
        + RIGHT(''00000000000000000000'' + CAST(a.i_max_value AS VARCHAR(10)), @digit)
        + ''/'' + @c_yyyy AS c_gen) n;

    SELECT (SELECT TOP 1 c_gen FROM dbo.sp_doc_gen
            WHERE dc_doc_id = @dc_doc_id AND c_yyyy = @c_yyyy AND ref_id = @ref_id
            ORDER BY i_value DESC) AS c_code_gen, @ref_id AS reference_id;
END';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
