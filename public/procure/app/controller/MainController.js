Ext.ns('MyApp.controller');  
MyApp.controller.MainController = {
    initTabs: function(tabPanel) {
	 var userItems = new MyApp.view.FormUser();
	  console.log(userItems);
        tabPanel.add({
            title: 'User Management',
            layout: 'border',
            items: [
                {
                    region: 'center',
                    xtype: 'grid',
				items:[],
//                    items: [new MyApp.view.GridUser()]
                },
                {
                    region: 'east',
                    width: 300,
                    xtype: 'form',items:[],
//                    items: [this.add()]
				/**/
                }
            ]
        });

        tabPanel.add({
            title: 'Employee Management',
            layout: 'border',
            items: [
                {
                    region: 'center',
                    xtype: 'grid',items:[],
//                    items: [new MyApp.viewUserGrid.GridEmp()]
                },
                {
                    region: 'east',
                    width: 300,
                    xtype: 'form',items:[],
//                    items: this.add(userItems)
                }
            ]
        });
//	   tabPanel.add(userItems);
        tabPanel.setActiveTab(0);
    }
};