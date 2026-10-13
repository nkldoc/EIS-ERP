<?PHP
require __DIR__ . "/vendor/autoload.php";
$_ENV["DB_HOST"] = "localhost";
$_ENV["DB_NAME"] = "php_auth_api";
$_ENV["DB_USER"] = "root";
$_ENV["DB_PASS"] = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    $database = new Database(
        $_ENV["DB_HOST"],
        $_ENV["DB_NAME"],
        $_ENV["DB_USER"],
        $_ENV["DB_PASS"]
    );

    $conn = $database->getConnection();

    $sql = "INSERT INTO user (name, username, password_hash)
            VALUES (:name, :username, :password_hash)";

    $stmt = $conn->prepare($sql);

    $password_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);


    $stmt->bindValue(":name", $_POST["name"], PDO::PARAM_STR);
    $stmt->bindValue(":username", $_POST["username"], PDO::PARAM_STR);
    $stmt->bindValue(":password_hash", $password_hash, PDO::PARAM_STR);


    $stmt->execute();

    echo "Thank you for registering.";
    exit;
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Registration</title>
    <link rel="stylesheet" href="./lib/css/style.css">

</head>

<body>
    <div class="container">
        <h2>User Registration</h2>
        <pre id="json"></pre>
        <form action="register.php" method="post">
            <div class="form-group">
                <label for="name">End Point:</label>
                <input type="text" id="url" name="url" required>
            </div>
<!--            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>-->
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <input type="submit" value="login">
            </div>
        </form>
    </div>
</body>
<script type="text/javascript">
    var data = {
        "enpiont":"https://api-eis.vajira.ac.th/procure",
        "email":"erpsendapi@mail.com",
        "password":"erpsendapi"
    };


    document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);
</script>
</html>