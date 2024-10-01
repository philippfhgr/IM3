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
    "Zürich" => [47.37869633224022, 8.540212333911228],
    "Uetliberg" => [47.349584322396176, 8.492067965844598],
    "Chur" => [46.85082283967555, 9.531958331821913],
    "Brambruesch" => [46.829063273980694, 9.516278407994756],
    "Laax" => [46.8091727097779, 9.26071885363422],
    "Vorab Gletscher" => [46.87905005375608, 9.163696789179653],
    "Grindelwald" => [46.62464271914805, 8.040336603868385],
    "Eigergletscher" => [46.568271049688214, 7.987039958259223],
    "Lago Maggiore" => [45.96424435044655, 8.647745309377637],
    "Dufourspitze" => [45.93750361001481, 7.867582342439896]
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
