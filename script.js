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
        console.log("API-Antwortstatus:", response.status);  // Überprüfe den HTTP-Status

        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Rohdaten aus der API:", data);  // Rohdaten anzeigen

        // Die ersten fünf Elemente sind Metadaten
        const uvDataArrays = data.slice(4); // Nimm nur die Datenarrays ab dem 5. Element

        // Erstelle Liniendiagramme für alle Standorte
        Object.keys(locations).forEach(locationName => {
            console.log(`Erstelle Liniendiagramm für ${locationName}`);
            createLineChart(uvDataArrays, locationName, locations[locationName]);
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Funktion zum Erstellen eines Liniendiagramms
function createLineChart(uvDataArrays, locationName, coordinates) {
    console.log(`UV-Daten für ${locationName} werden gefiltert. Koordinaten:`, coordinates);

    // Array für die UV-Daten des aktuellen Standorts
    let uvDataArray = [];

    // Filtere die UV-Daten für den aktuellen Standort aus den Datenarrays
    uvDataArrays.forEach(dataArray => {
        // Überprüfe, ob das Array gültig ist
        if (Array.isArray(dataArray)) {
            // Filtere die UV-Daten basierend auf den Koordinaten
            const filteredData = dataArray.filter(item => 
                Math.abs(parseFloat(item.longitude) - coordinates[0]) < 0.0001 && 
                Math.abs(parseFloat(item.latitude) - coordinates[1]) < 0.0001
            );

            // Füge die gefilterten Daten zum uvDataArray hinzu
            if (filteredData.length > 0) {
                uvDataArray = uvDataArray.concat(filteredData);
            }
        } else {
            console.warn("Erwartetes Array nicht gefunden:", dataArray);
        }
    });

    console.log(`${locationName}: ${uvDataArray.length} passende Datensätze gefunden`);

    if (uvDataArray.length === 0) {
        console.warn(`Keine UV-Daten für ${locationName} vorhanden!`);
        return;
    }

    // Wähle nur die letzten 24 Datensätze aus
    const recentUvDataArray = uvDataArray.slice(-24);
    console.log(`${locationName}: ${recentUvDataArray.length} passende Datensätze gefunden (letzte 24 Einträge)`);

    // Manuelle Erstellung der Labels basierend auf den Zeitstempeln der letzten 24 Daten
    const labels = recentUvDataArray.map(item => {
        const time = new Date(item.time);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    console.log(`${locationName}: Generierte Labels:`, labels);

    // Extrahiere die UV-Index-Daten
    const uvIndexData = recentUvDataArray.map(item => parseFloat(item.uvindex));
    console.log(`${locationName}: UV-Index-Daten:`, uvIndexData);

    // Daten für das Diagramm aufbereiten
    const chartData = {
        labels: labels,
        datasets: [{
            label: `UV-Index ${locationName}`,
            data: uvIndexData,
            fill: false,
            borderColor: 'rgb(255, 0, 0)',
            tension: 0.1
        }]
    };

    // Konfiguration für das Diagramm mit Y-Achsen-Einstellungen
    const config = {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                y: {
                    min: 0, // Minimum-Wert für die Y-Achse
                    max: 11, // Maximum-Wert für die Y-Achse
                    ticks: {
                        stepSize: 1 // Schrittgröße für die Y-Achsen-Ticks
                    }
                }
            }
        }
    };

    // Überprüfe, ob ein Canvas-Element für diesen Standort bereits existiert
    let chartContainer = document.getElementById(`chart-${locationName.replace(/\s+/g, '-')}`);
    if (!chartContainer) {
        chartContainer = document.createElement('canvas');
        chartContainer.id = `chart-${locationName.replace(/\s+/g, '-')}`;  // ID für das Canvas-Element
        console.log(`Canvas für ${locationName} erstellt, ID:`, chartContainer.id);

        document.getElementById('chart-container').appendChild(chartContainer);
    } else {
        console.log(`Canvas für ${locationName} existiert bereits:`, chartContainer.id);
    }

    const ctx = chartContainer.getContext('2d');
    new Chart(ctx, config);
}

// Globaler Fehlerhandler für unvorhergesehene Fehler
window.addEventListener('error', function (e) {
    console.error("Globaler Fehler:", e.message);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error("Unbehandeltes Promise-Reject:", e.reason);
});

// Funktion aufrufen
fetchData();
