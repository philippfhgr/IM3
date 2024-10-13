// URL der API, von der die Daten abgerufen werden sollen
const apiUrl = 'https://etl.mmp.li/RayWatch/etl/unload.php';

// Koordinaten für die Standorte
const locations = {
    "Zürich": [8.540212, 47.378696],
    "Uetliberg": [8.492068, 47.349584],
    "Chur": [9.531958, 46.850823],
    "Brambruesch": [9.516278, 46.829063],
    "Laax": [9.260719, 46.809173],
    "Vorab Gletscher": [9.163697, 46.879050],
    "Grindelwald": [8.040337, 46.624643],
    "Eigergletscher": [7.987040, 46.568271],
    "Lago Maggiore": [8.647745, 45.964244],
    "Dufourspitze": [7.867582, 45.937504]
};

// Funktion zum Abrufen von Daten von der API
async function fetchData() {
    console.log("fetchData wurde aufgerufen");

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API-Daten wurden abgerufen:", data);

        // Erstelle Liniendiagramme für alle Standorte
        Object.keys(locations).forEach(locationName => {
            createLineChart(data, locationName, locations[locationName]);
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Funktion zum Erstellen eines Liniendiagramms
function createLineChart(apiData, locationName, coordinates) {
    // Filtere die UV-Daten für den aktuellen Standort
    const uvDataArray = apiData.filter(item => 
        parseFloat(item.longitude) === coordinates[0] && 
        parseFloat(item.latitude) === coordinates[1]
    );

    // Manuelle Erstellung der Labels für die letzten 24 Stunden
    const labels = Array.from({ length: uvDataArray.length }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (uvDataArray.length - 1 - i));
        return hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    // Extrahiere die UV-Index-Daten
    const uvIndexData = uvDataArray.map(item => parseFloat(item.uvindex));

    // Daten für das Diagramm aufbereiten
    const chartData = {
        labels: labels,
        datasets: [{
            label: `UV-Index in ${locationName}`,
            data: uvIndexData,
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
    const chartContainer = document.createElement('canvas');
    chartContainer.id = `chart-${locationName.replace(/\s+/g, '-')}`; // ID für das Canvas-Element
    document.getElementById('chart-container').appendChild(chartContainer);
    const ctx = chartContainer.getContext('2d');
    new Chart(ctx, config);
}

// Funktion aufrufen
fetchData();
