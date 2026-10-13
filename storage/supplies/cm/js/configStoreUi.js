    //storeMonth
	Ext.monthStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : [
		        { id : '01', c_name : 'มกราคม' },
		        { id : '02', c_name : 'กุมภาพันธ์' },
		        { id : '03', c_name : 'มีนาคม' },
		        { id : '04', c_name : 'เมษายน' },
		        { id : '05', c_name : 'พฤษภาคม' },
		        { id : '06', c_name : 'มิถุนายน' },
		        { id : '07', c_name : 'กรกฎาคม' },
		        { id : '08', c_name : 'สิงหาคม' },
		        { id : '09', c_name : 'กันยายน' },
		        { id : '10', c_name : 'ตุลาคม' },
		        { id : '11', c_name : 'พฤศจิกายน' },
		        { id : '12', c_name : 'ธันวาคม' }
		       ]
	});	
	Ext.monthNumericStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : [
		        { id : 1, c_name : 'มกราคม' },
		        { id : 2, c_name : 'กุมภาพันธ์' },
		        { id : 3, c_name : 'มีนาคม' },
		        { id : 4, c_name : 'เมษายน' },
		        { id : 5, c_name : 'พฤษภาคม' },
		        { id : 6, c_name : 'มิถุนายน' },
		        { id : 7, c_name : 'กรกฎาคม' },
		        { id : 8, c_name : 'สิงหาคม' },
		        { id : 9, c_name : 'กันยายน' },
		        { id : 10, c_name : 'ตุลาคม' },
		        { id : 11, c_name : 'พฤศจิกายน' },
		        { id : 12, c_name : 'ธันวาคม' }
		       ]
	});
	//Combox Store UI
	Ext.enableStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}], 
		data : [{ id : '-1'	, c_name : 'ทั้งหมด' }, 
				{ id : '1'	, c_name : 'ใช้งาน' },
		        { id : '2'	, c_name : 'ไม่ใช้งาน' }, 
		       ]
	}); 
	
	Ext.isDebStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}], 
		data : [{ id : '-1'	, c_name : 'ทั้งหมด' }, 
				{ id : Ext.CNT_TYPE1	, c_name : 'ลูกหนี้' },
		        { id : Ext.CNT_TYPE2	, c_name : 'ลูกหนี้/เจ้าหนี้ ' }, 
		        { id : Ext.CNT_TYPE3	, c_name : 'เจ้าหนี้' }, 
		       ]
	}); 
 
	Ext.isOfficeStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}], 
		data : [{ id : '-1'	, c_name : 'ทั้งหมด' }, 
				{ id : Ext.CNT_TYPE1	, c_name : 'สำนักงานใหญ่' },
		        { id : Ext.CNT_TYPE2	, c_name : 'สาขา ' }, 
		        { id : Ext.CNT_TYPE3	, c_name : 'อื่นๆ' }, 
		       ]
	});
	
	Ext.isEmployeeStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}], 
		data : [{ id : '-1'	, c_name : 'ทั้งหมด' }, 
				{ id : Ext.AR_EMPLOYE1	, c_name : 'เป็นลูกจ้าง' },
		        { id : Ext.AR_EMPLOYE2	, c_name : 'ไม่เป็นลูกจ้าง ' }   
		       ]
	});
	
	// storeYear 
	Ext.genYearList = function(now,backto, isBudha){
		var isBudha = Ext.isEmpty(isBudha)?false:true;
		var years 		= []; 
		var now 		= new Date().getFullYear()+parseInt(now); 
		var yy_en 		= new Date().getFullYear()-parseInt(backto); //rundown of year
		while(yy_en <= now){ 
			years.push({id:yy_en,c_name:yy_en + 543}); 
			yy_en++; 
		}; 
		return years;
	};
	
	Ext.yearStore = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : Ext.genYearList(1,5), 
		sortInfo:{ field: 'id', direction: 'DESC'} 
	});	 
 	// storeYear 
	Ext.genYearList2 = function(now,backto, isBudha){
		var isBudha =Ext.isEmpty(isBudha)?false:true;
		var years 		= []; 
		var now 		= new Date().getFullYear()+parseInt(now); 
		var yy_en 		= new Date().getFullYear()-parseInt(backto); //rundown of year
		while(yy_en <= now){ 
			years.push({id:(yy_en + 543),c_name:(yy_en + 543) }); 
			yy_en++; 
		};
		
		return years;
	} 
	Ext.yearStore2 = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : Ext.genYearList2(1,5), 
		sortInfo:{ field: 'id', direction: 'DESC'} 
	});	
	
	Ext.genYearListAll = function(now,backto, isBudha){
		var isBudha =Ext.isEmpty(isBudha)?false:true;
		var years 		= []; 
		var now 		= new Date().getFullYear()+parseInt(now); 
		var yy_en 		= new Date().getFullYear()-parseInt(backto); //rundown of year
		years.push({id:-1, c_name:'ทั้งหมด' });
		while(yy_en <= now){ 
			years.push({id:(yy_en + 543),c_name:(yy_en + 543) }); 
			yy_en++; 
		};
		
		return years;
	};	
	Ext.yearStoreAll = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : Ext.genYearListAll(1,5),
		sortInfo:{ field: 'id', direction: 'ASC'} 
	});	
	Ext.monthStoreAll = new Ext.data.JsonStore({
		fields: [{name:'id'},{name:'c_name'}],
		data : [{ id : '-1', c_name : 'ทั้งหมด' },
		        { id : '01', c_name : 'มกราคม' },
		        { id : '02', c_name : 'กุมภาพันธ์' },
		        { id : '03', c_name : 'มีนาคม' },
		        { id : '04', c_name : 'เมษายน' },
		        { id : '05', c_name : 'พฤษภาคม' },
		        { id : '06', c_name : 'มิถุนายน' },
		        { id : '07', c_name : 'กรกฎาคม' },
		        { id : '08', c_name : 'สิงหาคม' },
		        { id : '09', c_name : 'กันยายน' },
		        { id : '10', c_name : 'ตุลาคม' },
		        { id : '11', c_name : 'พฤศจิกายน' },
		        { id : '12', c_name : 'ธันวาคม' }
		       ],
		sortInfo:{ field: 'id', direction: 'ASC'}  , 
	});	