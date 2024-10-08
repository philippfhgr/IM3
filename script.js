// URL der API, von der die Daten abgerufen werden sollen
const apiUrl = 'https://etl.mmp.li/RayWatch/etl/unload.php';

// Koordinaten für die UV-Index-Abfrage
const targetCoordinates = { longitude: 8.540212, latitude: 47.378696 }; // Zürich

// Funktion zum Abrufen von Daten von der API
async function fetchData() {
    try {
        // Daten von der API abrufen
        const response = await fetch(apiUrl);

        // Überprüfen, ob die Antwort erfolgreich war (Status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        // Die Antwort als JSON parsen
        const data = await response.json();
        console.log(data); // Überprüfen der abgerufenen Daten

        // Diagramm initialisieren mit den abgerufenen Daten
        createChart(data);
    } catch (error) {
        // Fehler behandeln
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}



// Funktion zum Erstellen des Diagramms
function createChart(apiData) {
    // Zugriff auf das letzte Element der Hauptstruktur, das die Daten enthält
    const uvDataArray = apiData[5]; // Das ist das Array von UV-Daten
    console.log(uvDataArray); // Überprüfen der UV-Daten

    // Manuelle Erstellung der Labels für die letzten 24 Stunden
    const labels = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i));
        return hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    // Filtern der UV-Daten basierend auf den Koordinaten
    const uvIndexData = uvDataArray
    .filter(item => 
        parseFloat(item.longitude) === targetCoordinates.longitude && // Überprüfen, ob die longitude übereinstimmt
        parseFloat(item.latitude) === targetCoordinates.latitude // Überprüfen, ob die latitude übereinstimmt
    )
    .slice(-24) // Nur die letzten 24 Einträge verwenden
    .map(item => parseFloat(item.uvindex)); // Hier extrahieren wir nur den UV-Index

console.log(uvIndexData); // Überprüfen der UV-Index-Daten

    // Daten für das Diagramm aufbereiten
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'UV-Index in Zürich',
            data: uvIndexData, // Hier nehmen wir die extrahierten UV-Index-Daten
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Konfiguration für das Diagramm
    const config = {
        type: 'line',
        data: chartData,
    };

    // Diagramm initialisieren
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, config);
}

// Funktion aufrufen
fetchData();
