-- Create table for storing contract budget reserve
-- Run this script to create the required table

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sp_tor_contract_budget_reserve' AND xtype='U')
BEGIN
    CREATE TABLE sp_tor_contract_budget_reserve (
        sp_tor_contract_budget_reserve_id INT IDENTITY(1,1) PRIMARY KEY,
        sp_tor_contract_id INT NOT NULL,
        f_reserve_money NUMERIC(18, 2) DEFAULT 0,
        f_budget NUMERIC(18, 2) DEFAULT 0,
        i_enable INT DEFAULT 1,
        c_create_by VARCHAR(50),
        d_create_dt DATETIME DEFAULT GETDATE(),
        c_last_modify_by VARCHAR(50),
        d_last_modify_dt DATETIME DEFAULT GETDATE(),
        
        CONSTRAINT FK_sp_tor_contract_budget_reserve FOREIGN KEY (sp_tor_contract_id)
            REFERENCES sp_tor_contract(sp_tor_contract_id),
        CONSTRAINT UQ_sp_tor_contract_budget_reserve UNIQUE (sp_tor_contract_id)
    );
    
    -- Create indexes
    CREATE INDEX IX_sp_tor_contract_budget_reserve_contract_id 
        ON sp_tor_contract_budget_reserve(sp_tor_contract_id);
    
    PRINT 'Table sp_tor_contract_budget_reserve created successfully';
END
ELSE
BEGIN
    PRINT 'Table sp_tor_contract_budget_reserve already exists';
END;
