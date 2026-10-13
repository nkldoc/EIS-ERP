
<?php
// marcuscode.com/user
$request_uri = "/";

try {

    if (!isUrlExist($request_uri)) {
        throw new MarcuscodeException("Page not found.", 
        $request_uri);
    }

    echo "Welcome!\n";

} catch (MarcuscodeException $e) {

    echo "Caught exception: " . $e->getMessage() . "\n";
    $e->info();

}

function isUrlExist($url) {
    $urls = ["/", "/about", "/tutorials"];
    return in_array($url, $urls);
}

class MarcuscodeException extends Exception {

    public $domain = "http://localhost";
    public $path;

    public function __construct($message, $path) {
        $this->message = $message;
        $this->path = $path;
    }

    public function info() {
        echo "$this->domain/$this->path" . 
        " doesn't exist on marcuscode.\n";
    }

}