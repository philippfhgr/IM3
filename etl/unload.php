<?php

require_once 'config.php'; // Stellen Sie sicher, dass dies auf Ihre tatsächliche Konfigurationsdatei verweist

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $results = ['id', 'longitude', 'latitude', 'time', 'uvindex']; // Array, um die Ergebnisse zu speichern
    $locations = [
        ['longitude' => 8.540212, 'latitude' => 47.378696],
        ['longitude' => 8.492068, 'latitude' => 47.349584],
        ['longitude' => 9.531958, 'latitude' => 46.850823], 
        ['longitude' => 9.516278, 'latitude' => 46.829063],
        ['longitude' => 9.260719, 'latitude' => 46.809173],
        ['longitude' => 9.163697, 'latitude' => 46.879050],
        ['longitude' => 8.040337, 'latitude' => 46.624643],
        ['longitude' => 7.987040, 'latitude' => 46.568271],
        ['longitude' => 8.647745, 'latitude' => 45.964244],
        ['longitude' => 7.867582, 'latitude' => 45.937504]
    ];
    

    foreach ($locations as $location) {
        // Bereitet eine SQL-Anfrage vor, um UV-Daten für eine bestimmte Koordinate zu holen
        $stmt = $pdo->prepare("
            SELECT id, longitude, latitude, time, uvindex
            FROM uv_data
            WHERE longitude = :longitude AND latitude = :latitude
            ORDER BY time DESC
        ");

        // Füllt die Anfrage mit den Koordinaten
        $stmt->execute([
            ':longitude' => $location['longitude'],
            ':latitude' => $location['latitude']
        ]); 
        
        // Speichert die Ergebnisse im Array $results unter den jeweiligen Koordinaten
        $results[] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($results); // Gibt die UV-Daten im JSON-Format aus
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]); // Gibt einen Fehler im JSON-Format aus, falls eine Ausnahme auftritt
}
?>
