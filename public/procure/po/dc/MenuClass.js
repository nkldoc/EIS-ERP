
//OnLoad Renderer 
  Ext.onReady ( function ( ) {
      Ext.QuickTips.init ( ) ;
      var store = new Ext.data.JsonStore ( {
          fields : [ 'season' , 'total' ] ,
          data : [ {
                  season : 'Summer' ,
                  total : 150
              } , {
                  season : 'Fall' ,
                  total : 245
              } , {
                  season : 'Winter' ,
                  total : 117
              } , {
                  season : 'Spring' ,
                  total : 184
              } ]
      } ) ;
      var chart = new Ext.chart.Chart ( {
          renderTo : Ext.getBody () ,
          width : 800 ,
          height : 600 ,
          animate : true ,
          store : store ,
          theme : 'White' ,
          axes : [ {
                  type : 'Numeric' ,
                  position : 'bottom' ,
                  fields : [ 'data1' ] ,
                  title : 'Number of Hits'
              } , {
                  type : 'Category' ,
                  position : 'left' ,
                  fields : [ 'name' ] ,
                  title : 'Month of the Year'
              } ] ,
          //Add Bar series.
          series : [ {
                  type : 'bar' ,
                  axis : 'bottom' ,
                  xField : 'name' ,
                  yField : 'data1' ,
                  highlight : true ,
                  label : {
                      display : 'insideEnd' ,
                      field : 'data1' ,
                      renderer : Ext.util.Format.numberRenderer ( '0' ) ,
                      orientation : 'horizontal' ,
                      color : '#333' ,
                      'text-anchor' : 'middle'
                  }
              } ]
      } ) ;
//Test
  } ) ;
