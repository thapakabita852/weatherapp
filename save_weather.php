<?php
$servername = "sql101.infinityfree.com";
$username = "if0_34864036";
$password = "CyFB9FrqSXhgw9R";
$dbname = "if0_34864036_weather_db";

$data = json_decode(file_get_contents("php://input"), true);
$city = $data['city'];
$temperature = $data['temperature'];
$description = $data['description'];

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo '<b style="color: green;">Connected successfully</b><br>';




// Check if a record for the same date and city exists
$checkQuery = "SELECT * FROM weather_history WHERE city='$city' AND DATE(date) = CURDATE()";
$checkResult = $conn->query($checkQuery);

if ($checkResult->num_rows === 0) {
    // Insert a new record if no record for the same date and city exists
    $insertQuery = "INSERT INTO weather_history (city, date, temperature, description) VALUES ('$city', NOW(), '$temperature', '$description')";

    if ($conn->query($insertQuery) === TRUE) {
        echo "Weather data saved successfully";
    } else {
        echo "Error: " . $insertQuery . "<br>" . $conn->error;
    }
} else {
    echo "Weather data for today and the same city already exists.";
}

$conn->close();
?>
