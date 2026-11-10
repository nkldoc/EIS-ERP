IF OBJECT_ID(N'dbo.sp_pr_transfer_history', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_pr_transfer_history (
        id bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
        tor_id int NOT NULL,
        pr_code nvarchar(100) NULL,
        pr_name nvarchar(max) NULL,
        source_emp_id int NOT NULL,
        source_emp_name nvarchar(255) NULL,
        target_emp_id int NOT NULL,
        target_emp_name nvarchar(255) NULL,
        actor_user_id int NOT NULL,
        actor_user_name nvarchar(255) NULL,
        transferred_at datetime NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_sp_pr_transfer_history_date ON dbo.sp_pr_transfer_history (transferred_at DESC, id DESC);
    CREATE INDEX IX_sp_pr_transfer_history_tor ON dbo.sp_pr_transfer_history (tor_id, transferred_at DESC);
END;

IF OBJECT_ID(N'dbo.sp_pr_transfer_history_detail', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_pr_transfer_history_detail (
        id bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
        history_id bigint NOT NULL,
        table_name varchar(64) NOT NULL,
        row_id int NOT NULL,
        old_sp_emp_id int NOT NULL,
        new_sp_emp_id int NOT NULL,
        CONSTRAINT FK_sp_pr_transfer_history_detail_history FOREIGN KEY (history_id) REFERENCES dbo.sp_pr_transfer_history(id)
    );
    CREATE INDEX IX_sp_pr_transfer_history_detail_history ON dbo.sp_pr_transfer_history_detail (history_id);
END;
