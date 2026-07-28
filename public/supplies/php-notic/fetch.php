<?php

include("../conf/config.php");

include('connect.php');
header('Content-Type: text/html; charset=utf-8');
$type = $_POST['type'] ?? null;
$data_type = $_POST['data_type'] ?? null;
$act = $_POST['view'] ?? null;
if (isset($act)) {


if (($act == 'detail' || $act == 'save' || $act == '') && $data_type == null) {

        if ($act == 'yes') {
            $id = $_POST['id'] ?? null;
            $stmt = $con->prepare("UPDATE comments SET comment_status = 1 WHERE comment_id=? and comment_status=0 and (i_type_user = ? or user_id=?)");
            $stmt->bind_param('iii', $id, $_SESSION['i_type_user'], $_SESSION['user_id']);
            $stmt->execute();
        }
        $query = "SELECT * FROM comments ORDER BY comment_id DESC LIMIT 5";
        $result = mysqli_query($con, $query);
        $output = '';
        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_array($result)) {

               $fg2 = $row['comment_status'] == 0 ? '<b>*' : '';
                $fg22 = $row['comment_status'] == 0 ? '</b>' : '';
                $output .= '<li class="view_comment" style="padding:5px;" id="' . $row["comment_id"] . '">
                                <a href="#">  <strong> ' . $fg2 . $row["comment_subject"] . $fg22. '</strong><br />
                                 <small><em>' . $row["comment_text"] . '</em></small>
                               </li> </a>
                        ';
            }
                    $output .= '<li class="view_comment" style="padding:5px;" id="comment_all">
                                <a href="#">  <strong> ดูทั้งหมด </strong></a>
                               </li>
                        ';
        } else {
            $output .= '
         <li><a href="#" class="text-bold text-italic">No Noti Found</a></li>';
        }

        $status_query = "SELECT * FROM comments WHERE comment_status=0";
        $result_query = mysqli_query($con, $status_query);
        $count = mysqli_num_rows($result_query);
        $data = array(
            'notification' => $output,
            'unseen_notification' => $count
        );
        echo json_encode($data);
} else if (($act == 'detail' || $act == '' || $act == 'yes') && $data_type == 'warranty') {

        if ($act == 'yes') {
            $id = $_POST['id'] ?? null;
            $stmt = $con->prepare("UPDATE warranty SET comment_status = 1 WHERE comment_id=? and comment_status=0 and (i_type_user = ? or user_id=?)");
            $stmt->bind_param('iii', $id, $_SESSION['i_type_user'], $_SESSION['user_id']);
            $stmt->execute();
        }
        $query = "SELECT * FROM warranty ORDER BY comment_id DESC LIMIT 50";
        $result = mysqli_query($con, $query);
        $output = '';
        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_array($result)) {

                $fg2 = $row['comment_status'] == 0 ? '<b>*' : '';
                $fg22 = $row['comment_status'] == 0 ? '</b>' : '';

                $output .= '<li class="view_warranty" style="padding:3px;" id="' . $row["comment_id"] . '">
                                <a href="#">  <b> ' . $fg2 . $row["comment_subject"] . $fg22. '<br />
                                 <small><em>' . $row["comment_text"] . '</em></small>
                              </a> </li>
                        ';
            }
               $output .= '<li class="view_comment" style="padding:5px;" id="warranty_all">
                                <a href="#"><strong> ดูทั้งหมด </strong></a>
                               </li>
                        ';
        } else {
            $output .= '
         <li><a href="#" class="text-bold text-italic">No Noti Found</a></li>';
        }

        $status_query = "SELECT * FROM warranty WHERE comment_status=0";
        $result_query = mysqli_query($con, $status_query);
        $count = mysqli_num_rows($result_query);
        $data = array('user'=>'warranty', 'row' => array('notification' => $output, 'unseen_notification' => $count));
        echo json_encode($data);
    }
}