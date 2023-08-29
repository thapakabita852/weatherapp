<?php
$servername = "sql101.infinityfree.com";
$username = "if0_34864036";
$password = "CyFB9FrqSXhgw9R";
$dbname = "if0_34864036_weather_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$city = $_GET['city'];

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM weather_history WHERE city='$city' ORDER BY date DESC LIMIT 7";
$result = $conn->query($sql);

$historyData = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $historyData[] = array(
            'date' => $row['date'],
            'temperature' => $row['temperature'],
            'description' => $row['description']
        );
    }
}

echo json_encode($historyData);

$conn->close();
?>
