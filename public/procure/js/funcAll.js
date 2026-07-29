loadScript = (src,rec) => {
    // Remove existing script if it exists
    let existingScript = document.getElementById("dynamicScript");
    if (existingScript) {
        existingScript.remove();
    }
    // Create a new script element
    let script = document.createElement("script");
    script.src = src + '.js?_dc=' + Math.floor(100000 + Math.random() * 900000);
    script.id = "dynamicScript";
    script.onload = function () {
                console.log(`${src} loaded`); //file
                Ext.application.setRow(rec);  
                Ext.selectRow = Ext.application.getRow(rec);  
    }; 
    // Append the script to the body 
    document.body.appendChild(script);
    
 
};
getScript = (code) => {
 
    // Remove existing script if it exists
    let codeMenu = null;
    if (['ST0012', 'ST0013'].includes(code)) { // งวดงาน ตรวจรับ
        codeMenu = 'tor_all_menu_1';
    } else if (['ST0003', 'ST0004' , 'ST0005', 'ST0006', 'ST0007', 'ST0008', 'ST0009'
        , 'ST1004', 'ST1005', 'ST1006', 'ST1007', 'ST1008', 'ST1009', 'ST1010'
        , 'ST1005', 'ST1006'
        , 'ST2005', 'ST2006', 'ST3005', 'ST3006'].includes(code)) {
        
        switch (code) { 
            case 'ST1005': codeMenu = 'tor_all_menu_15';  
                break; 
            case 'ST1006': codeMenu = 'tor_all_menu_16';  
                break; 
            case 'ST1007': codeMenu = 'tor_all_menu_17';  
                break; 
            case 'ST1008': codeMenu = 'tor_all_menu_18';  
                break; 
            case 'ST1009': codeMenu = 'tor_all_menu_19';  
                break; 
            case 'ST1010': codeMenu = 'tor_all_menu_20';  
                break; 
                
            case 'ST0009': codeMenu = 'tor_all_menu_09';  
                break; 
            case 'ST0008': codeMenu = 'tor_all_menu_08';  
                break; 
            case 'ST0007': codeMenu = 'tor_all_menu_07';  
                break; 
            case 'ST0006': codeMenu = 'tor_all_menu_06';  
                break; 
            case 'ST0005': codeMenu = 'tor_all_menu_05';  
                break; 
            case 'ST0004': codeMenu = 'tor_all_menu_04';  
                break; 
            case 'ST3005': codeMenu = 'tor_all_menu_35';  
                break; 
            case 'ST3006': codeMenu = 'tor_all_menu_36'; 
                break; 
            case 'ST2006': codeMenu = 'tor_all_menu_26'; 
                break; 
            case 'ST2005': codeMenu = 'tor_all_menu_25'; 
                break;   
            default:   break;
        }
//
//    
    } else {
        console.error(codeMenu,code+' !== '+ codeMenu);
    }
    codeMenu = (codeMenu) ? codeMenu : 'tor_all_menu';
//    console.log(code+' == '+codeMenu);
    return codeMenu;
};