<?php
//include("conf/config.php");
// Initialize cURL
$ch = curl_init(); 
// Set the URL 
curl_setopt($ch, CURLOPT_URL, 'https://eis.vajira.ac.th:8443');  //'https://erpdev.vajira.ac.th'
// Set the option to include the header in the response
curl_setopt($ch, CURLOPT_HEADER, true); 
// Set an empty string to store the response headers
$responseHeaders = ''; 
// Set a callback function to capture the headers
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($curl, $data) use (&$responseHeaders) {
    $responseHeaders .= $data;
    return strlen($data);
}); 
// Execute the request
curl_exec($ch); 
// Get the size of the response headers
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE); 
// Close cURL
curl_close($ch); 
// Extract the headers from the response string
$headers = substr($responseHeaders, 0, $headerSize); 
// Extract the cookies from the headers
preg_match_all('/^Set-Cookie:\s*([^;\r\n]*)/mi', $headers, $cookies); 
// Get the first cookie (if there are multiple)
$cookie = $cookies[1][0]??null; 
// Output the cookie
echo "Cookie: $cookie";
 
?>
