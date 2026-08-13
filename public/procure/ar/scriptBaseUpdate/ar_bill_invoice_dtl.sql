-- drop table ar_bill_invoice_dtl
CREATE TABLE [dbo].[ar_bill_invoice_dtl](
	[ar_bill_invoice_dtl_id] [bigint] PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[ar_bill_invoice_hdr_id] [bigint] NULL, 
	[ar_so_dtl_id] [bigint] NULL,
	[dc_product_id] [bigint] NULL, 	
	[dc_tax_id] [bigint] NULL,
	[f_tax_amt] [decimal](18, 2) NULL,
	[f_quan] [decimal](18, 2) NULL, 
	[i_seq] [bigint] NULL, 	
	[f_unit_cost] [decimal](18, 2) NULL, 	
	[f_total_cost] [decimal](18, 2) NULL,  
	[f_disc_com] [decimal](18, 2) NULL,
	[f_disc_cash] [decimal](18, 2) NULL,  
	[f_net_cost] [decimal](18, 2) NULL, 
	[i_receive] [int] NULL,
	[c_comment] [varchar](255) NULL,
	[i_enable] [int] NULL,
	[dc_user_create_id] [bigint] NULL,
	[dc_user_create_cost_id] [bigint] NULL,
	[d_create] [datetime] NULL,
	[dc_user_update_id] [bigint] NULL,
	[dc_user_update_cost_id] [bigint] NULL,
	[d_update] [datetime] NULL
) ON [PRIMARY] 
GO 
SET ANSI_PADDING OFF
GO


