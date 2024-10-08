<?php

require_once 'config.php';

// Funktion zur Abfrage der UV-Daten für gegebene Koordinaten
function fetchUvData($latitude, $longitude) {
    $url = "https://currentuvindex.com/api/v1/uvi?latitude=$latitude&longitude=$longitude";

    // Initialisiert eine cURL-Sitzung
    $ch = curl_init($url);

    // Setzt Optionen
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Führt die cURL-Sitzung aus und erhält den Inhalt
    $response = curl_exec($ch);

    // Fehlerüberprüfung für cURL
    if (curl_errno($ch)) {
        echo 'cURL Error: ' . curl_error($ch);
        return null; // Rückgabe von null im Fehlerfall
    }

    // Schließt die cURL-Sitzung
    curl_close($ch);

    // Dekodiert die JSON-Antwort und gibt Daten zurück
    return json_decode($response, true);
}

// Array mit den Koordinaten (Stadt => [Latitude, Longitude])
$locations = [
    "Zürich" => [8.540212, 47.378696],
    "Uetliberg" => [8.492068, 47.349584],
    "Chur" => [9.531958, 46.850823],
    "Brambruesch" => [9.516278, 46.829063],
    "Laax" => [9.260719, 46.809173],
    "Vorab Gletscher" => [9.163697, 46.879050],
    "Grindelwald" => [8.040337, 46.624643],
    "Eigergletscher" => [7.987040, 46.568271],
    "Lago Maggiore" => [8.647745, 45.964244],
    "Dufourspitze" => [7.867582, 45.937504]
];

// Establish database connection
try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Prepare the SQL statement
$sql = "INSERT INTO uv_data (longitude, latitude, uvindex) VALUES (:longitude, :latitude, :uvindex)";
$stmt = $pdo->prepare($sql);

// Schleife über alle Koordinaten und Abruf der UV-Daten
foreach ($locations as $location => $coords) {
    $latitude = $coords[0];
    $longitude = $coords[1];
    
    // Abrufen der UV-Daten
    $uvData = fetchUvData($latitude, $longitude);
    
    if ($uvData && isset($uvData['now'])) {
        // Ausgabe der Ergebnisse für jede Stadt
        echo "UV-Index für $location:\n";
        echo "Aktueller UV-Index: " . $uvData['now']['uvi'] . " um " . $uvData['now']['time'] . "\n";

        // Daten in die Datenbank einfügen
        $stmt->execute([
            ':longitude' => $longitude, // Longitude
            ':latitude' => $latitude, // Latitude
            ':uvindex' => $uvData['now']['uvi'] // UV-Index
        ]);
    } else {
        echo "Fehler beim Abrufen der UV-Daten für $location.\n";
    }

    echo "\n\n"; // Trennung zwischen den Ergebnissen
}

echo "Daten erfolgreich in die Datenbank eingefügt.";

?>
