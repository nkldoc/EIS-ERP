IF OBJECT_ID('dbo.sp_contract_backdate_request', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_contract_backdate_request (
        request_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        contract_id int NOT NULL,
        tor_id int NOT NULL,
        requested_date date NOT NULL,
        reason nvarchar(2000) NOT NULL,
        requester_id int NOT NULL,
        approver_id int NOT NULL,
        status varchar(12) NOT NULL DEFAULT 'pending',
        created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        decided_at datetime2 NULL,
        decision_reason nvarchar(2000) NULL,
        used_at datetime2 NULL,
        CONSTRAINT CK_contract_backdate_status CHECK (status IN ('pending','approved','rejected','used'))
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.sp_contract_backdate_request') AND name='IX_contract_backdate_contract')
    CREATE INDEX IX_contract_backdate_contract ON dbo.sp_contract_backdate_request(contract_id,status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.sp_contract_backdate_request') AND name='IX_contract_backdate_inbox')
    CREATE INDEX IX_contract_backdate_inbox ON dbo.sp_contract_backdate_request(approver_id,status);
