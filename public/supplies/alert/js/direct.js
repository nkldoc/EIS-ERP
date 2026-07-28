  /*!
   * Ext JS Library 3.3.1
   * Copyright(c) 2006-2010 Sencha Inc.
   * licensing@sencha.com
   * http://www.sencha.com/license
   */

  Ext.onReady ( function () {
      var items = [ ] ;

      Ext.QuickTips.init () ;
      //=============================================================
      // Toolbar / Menu
      //=============================================================
      var menu = new Ext.menu.Menu ( {
          items : [ {
                  text : 'Menu item'
              } , {
                  text : 'Check 1' ,
                  checked : true
              } , {
                  text : 'Check 2' ,
                  checked : false
              } , '-' , {
                  text : 'Option 1' ,
                  checked : true ,
                  group : 'opts'
              } , {
                  text : 'Option 2' ,
                  checked : false ,
                  group : 'opts'
              } , '-' , {
                  text : 'Sub-items' ,
                  menu : new Ext.menu.Menu ( {
                      items : [ { text : 'Item 1' } , { text : 'Item 2' } ]
                  } )
              } ]
      } ) ;
      items.push ( {
          xtype : 'panel' ,
          width : 450 ,
          height : 200 ,
          title : 'Basic Panel With Toolbars' ,
//SET X Y
          x : 50 , y : 50 ,
          tbar : [ 'Toolbar &amp; Menus' , ' ' , '-' , {
                  text : 'Button'
              } , {
                  text : 'Menu Button' ,
                  id : 'menu-btn' ,
                  menu : menu
              } , {
                  xtype : 'tbsplit' ,
                  text : 'Split Button' ,
                  menu : new Ext.menu.Menu ( {
                      items : [ { text : 'Item 1' } , { text : 'Item 2' } ]
                  } )
              } , {
                  xtype : 'button' ,
                  enableToggle : true ,
                  pressed : true ,
                  text : 'Toggle Button'
              } ] ,
          bbar : [ {
                  text : 'Bottom Bar'
              } ]
      } ) ;



      //=============================================================
      // Grid
      //=============================================================
      var myData = [
          [ '3m Co' , 71.72 , 0.02 , 0.03 , '9/1 12:00am' ] ,
          [ 'Alcoa Inc' , 29.01 , 0.42 , 1.47 , '9/1 12:00am' ] ,
          [ 'Altria Group Inc' , 83.81 , 0.28 , 0.34 , '9/1 12:00am' ] ,
          [ 'American Express Company' , 52.55 , 0.01 , 0.02 , '9/1 12:00am' ] ,
          [ 'American International Group, Inc.' , 64.13 , 0.31 , 0.49 , '9/1 12:00am' ] ,
          [ 'AT&T Inc.' , 31.61 , - 0.48 , - 1.54 , '9/1 12:00am' ] ,
          [ 'Boeing Co.' , 75.43 , 0.53 , 0.71 , '9/1 12:00am' ] ,
          [ 'Caterpillar Inc.' , 67.27 , 0.92 , 1.39 , '9/1 12:00am' ] ,
          [ 'Citigroup, Inc.' , 49.37 , 0.02 , 0.04 , '9/1 12:00am' ] ,
          [ 'E.I. du Pont de Nemours and Company' , 40.48 , 0.51 , 1.28 , '9/1 12:00am' ]
      ] ;
      var store = new Ext.data.SimpleStore ( {
          fields : [
              { name : 'company' } ,
              { name : 'price' , type : 'float' } ,
              { name : 'change' , type : 'float' } ,
              { name : 'pctChange' , type : 'float' } ,
              { name : 'lastChange' , type : 'date' , dateFormat : 'n/j h:ia' }
          ] ,
          sortInfo : {
              field : 'company' , direction : 'ASC'
          }
      } ) ;
      var pagingBar = new Ext.PagingToolbar ( {
          pageSize : 5 ,
          store : store ,
          displayInfo : true ,
          displayMsg : 'Displaying topics {0} - {1} of {2}'
      } ) ;
      store.loadData ( myData ) ;

      items.push ( {
          xtype : 'grid' ,
          store : store ,
          columns : [
              { id : 'company' , header : "Company" , width : 160 , sortable : true , dataIndex : 'company' } ,
              { header : "Price" , width : 75 , sortable : true , renderer : 'usMoney' , dataIndex : 'price' } ,
              { header : "Change" , width : 75 , sortable : true , dataIndex : 'change' } ,
              { header : "% Change" , width : 75 , sortable : true , dataIndex : 'pctChange' } ,
              { header : "Last Updated" , width : 85 , sortable : true , renderer : Ext.util.Format.dateRenderer ( 'm/d/Y' ) , dataIndex : 'lastChange' }
          ] ,
          stripeRows : true ,
          autoExpandColumn : 'company' ,
          loadMask : true ,
          height : 420 ,
          width : 450 ,
//SET X Y
          x : 600 , y : 50 ,
          title : 'GridPanel' ,
          bbar : pagingBar ,
          tbar : [
              { text : 'Toolbar' } , '->' ,
              new Ext.form.TwinTriggerField ( {
                  xtype : 'twintriggerfield' ,
                  trigger1Class : 'x-form-clear-trigger' ,
                  trigger2Class : 'x-form-search-trigger' ,
                  onTrigger1Click : function () {
                      alert ( 1 ) ;
                  } , onTrigger2Click : function () {
                      alert ( 2 ) ;
                  }
              } )
          ]
      } ) ;

      //=============================================================
      // ListView
      //=============================================================

      var listView = new Ext.list.ListView ( {
          store : store ,
          multiSelect : true ,
          emptyText : 'No images to display' ,
          reserveScrollOffset : true ,
          columns : [
              { id : 'company' , header : "Company" , width : .5 , sortable : true , dataIndex : 'company' } ,
              { header : "Price" , width : .25 , sortable : true , tpl : '{price:usMoney}' , dataIndex : 'price' } ,
              { header : "Change" , width : .25 , sortable : true , dataIndex : 'change' }
          ]
      } ) ;

      items.push ( {
          xtype : 'panel' ,
          id : 'images-view' ,
          width : 450 ,
          height : 200 ,
//SET X Y       
          x : 50 , y : 260 ,
          collapsible : false ,
          layout : 'fit' ,
          title : 'Simple ListView' , // <i>(0 items selected)</i>
          items : listView ,
          bbar : [ {
                  text : 'Bottom Bar'
              } ]
      } ) ;

      //=============================================================
      // Render everything!
      //=============================================================
      new Ext.Viewport ( {
          layout : 'absolute' ,
          autoScroll : true ,
          items : items
      } ) ;


  } ) ;