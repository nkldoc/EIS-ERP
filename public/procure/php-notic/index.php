<!DOCTYPE html>
<html>
    <head>
        <title>Notification using PHP Ajax Bootstrap</title>
<!--        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>-->
        <!-- Alarm -->
        <script src="../js/jquery.min.js"></script>
        <link rel="stylesheet" href="./bootstrap/css/bootstrap.min.css" />
        <script src="../js/bootstrap.min.js"></script>
    </head>
    <body>
        <br /><br />
        <div class="container">
            <nav class="navbar navbar-inverse">
                <div class="container-fluid">
                    <div class="navbar-header">
                        <a class="navbar-brand" href="#">NMU แจ้งเตือน</a>
                    </div>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <span class="label label-pill label-danger count" style="border-radius:10px;"></span>
                                <span class="glyphicon glyphicon-bell" style="font-size:18px;"></span></a>
                            <ul class="dropdown-menu"></ul>
                        </li>
                    </ul>
                </div>
            </nav>
            <br />
            <form method="post" id="comment_form">
                <div class="form-group">
                    <label>หัวข้อเรื่อง</label>
                    <input type="text" name="subject" id="subject" class="form-control">
                </div>
                <div class="form-group">
                    <label>รายละเอีด</label>
                    <textarea name="comment" id="comment" class="form-control" rows="5"></textarea>
                </div>
                <div class="form-group">
                    <input type="submit" name="post" id="post" class="btn btn-info" value="Post" />
                </div>
            </form>

        </div>
    </body>
</html>

<script>
$(document).ready(function(){

 function load_unseen_notification(view = '',id=null)
 {
  $.ajax({
   url:"fetch.php",
   method:"POST",
   data:{view:view,id:id},
   dataType:"json",
   success:function(data)
   {
    $('.dropdown-menu').html(data.notification);
    if(data.unseen_notification > 0)
    {
     $('.count').html(data.unseen_notification);
    }
   }
  });
 }

 load_unseen_notification();

 $('#comment_form').on('submit', function(event){
  event.preventDefault();
  if($('#subject').val() != '' && $('#comment').val() != '')
  {
   var form_data = $(this).serialize();
   $.ajax({
    url:"insert.php",
    method:"POST",
    data:form_data,
    success:function(data)
    {
     $('#comment_form')[0].reset();
     load_unseen_notification();
    }
   });
  }
  else
  {
   alert("Both Fields are Required");
  }
 });
function showPage(id){
    alert(id);
}
$(document).on('click', '.view_comment', function(){
    $('.count').html('');
    load_unseen_notification('yes', $(this).attr('id'));
});

// $(document).on('click', '.sp_check', function(){
//     if($(this).attr('id')==="everID"){
//                alert('ได้ตรวจสอบแล้ว');
//     }else{
//            $(document).on('click', '.view_comment', function(){
//                load_unseen_notification('yes', $(this).attr('id'));
//                $('.count').html('');
//            });
//     }
// });

// $(document).on('click', '.dropdown-toggle', function(){
  //$('.count').html('');
  //  load_unseen_notification('yes');
// });


 setInterval(function(){
  load_unseen_notification();
 }, 5000);

});
</script>