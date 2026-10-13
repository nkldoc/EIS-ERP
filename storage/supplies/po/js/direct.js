  Ext.onReady ( function ()
  {

      Ext.Direct.addProvider (
          Ext.app.REMOTING_API , {
              type : 'polling' ,
              url : 'php/poll.php'
          } ) ;
      var out = new Ext.form.DisplayField (
          {
              cls : 'x-form-text' ,
              id : 'out'
          } ) ;
      Ext.Direct.on ( 'message' , function ( e )
      {


          if ( e.chg === true )
          {
              out.append ( String.format ( '<p><i>{0}</i></p>' , e.data ) ) ;
              out.el.scroll ( 'b' , 100000 , true ) ;
//              console.log ( e.chg ) ;
          }
      } ) ;
      var p = new Ext.Panel (
          {
              title : 'Remote Call Log' ,
              //frame:true,
              width : 600 ,
              height : 300 ,
              layout : 'fit' ,
              items : [ out ] ,
              bbar : [ '-' ]
          } ).render ( Ext.getBody () ) ;

      var p1 = new Ext.Panel (
          {
              title : 'รายการเตือน' ,
              frame : true ,
              width : 600 ,
              height : 300 ,
              layout : 'fit' ,

//              items : [ out ] ,
              bbar : [ '-' ]
          } ).render ( Ext.getBody () ) ;


  } ) ;
