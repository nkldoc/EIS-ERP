<?php
header('Content-Type: application/json');

$response = ['status' => 'error', 'message' => 'Unknown error.'];

try {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'No file uploaded or upload error.';
        echo json_encode($response);
        exit;
    }

    $dir = isset($_POST['dir']) ? $_POST['dir'] : '';
    $fileName = basename($_FILES['file']['name']); // ป้องกัน path traversal จากชื่อไฟล์
    $tmpPath = $_FILES['file']['tmp_name'];

    if ($dir === '') {
        $response['message'] = 'Directory path is missing.';
        echo json_encode($response);
        exit;
    }

    $destPath = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $fileName;

    if (move_uploaded_file($tmpPath, $destPath)) {
        $response['status'] = 'success';
        $response['message'] = 'File uploaded successfully.';
        $response['fileName'] = $fileName;
    } else {
        $response['message'] = 'Failed to move uploaded file.';
    }

} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);