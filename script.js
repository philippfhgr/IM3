const apiUrl = 'https://etl.mmp.li/RayWatch/etl/unload.php';

const locations = {
    "Zürich (413 m ü. M.)": [8.540212, 47.378696],
    "Uetliberg (853 m ü. M.)": [8.492068, 47.349584],
    "Chur (603 m ü. M.)": [9.531958, 46.850823],
    "Brambruesch (1597 m ü. M.)": [9.516278, 46.829063],
    "Laax (1054 m ü. M.)": [9.260719, 46.809173],
    "Vorab Gletscher (2751 m ü. M.)": [9.163697, 46.879050],
    "Grindelwald (1081 m ü. M.)": [8.040337, 46.624643],
    "Eigergletscher (2845 m ü. M.)": [7.987040, 46.568271],
    "Lago Maggiore (193 m ü. M.)": [8.647745, 45.964244],
    "Dufourspitze (4492 m ü. M.)": [7.867582, 45.937504]
};

const imagePaths = [
    'img/img1.png',
    'img/img2.png',
    'img/img3.png',
    'img/img4.png',
    'img/img5.png',
    'img/img6.png',
    'img/img7.png',
    'img/img8.png',
    'img/img9.png',
    'img/img10.png',
    'img/img11.png',
    'img/img11.png',
];

let images = [];

// Funktion zum Laden eines Bildes
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Fehler beim Laden des Bildes: ${src}`));
    });
}

// Lade alle Bilder mit Promise.all
Promise.all(imagePaths.map(loadImage))
    .then(loadedImages => {
        images = loadedImages;
        fetchData();
    })
    .catch(error => {
        console.error('Ein oder mehrere Bilder konnten nicht geladen werden:', error);
    });

// Funktion zum Abrufen von Daten von der API
async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        const data = await response.json();
        const uvDataArrays = data.slice(4);

        Object.keys(locations).forEach(locationName => {
            createLineChart(uvDataArrays, locationName, locations[locationName]);
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Definiere das Plugin für das Zeichnen der Bilder
const imagePlugin = {
    id: 'imagePlugin',
    beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const currentValue = Math.round(chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1]);

        let imageToDraw = images[0]; // Standardbild initialisieren
        if (currentValue >= 1 && currentValue <= images.length) {
            imageToDraw = images[currentValue - 1]; // Bilder werden bei 0 indiziert
        }

        if (imageToDraw) {
            const x = chart.chartArea.right - 40;
            const y = chart.chartArea.top - 50;

            ctx.drawImage(imageToDraw, x, y, 40, 40);
        } else {
            console.warn('Kein Bild gefunden für den Wert:', currentValue);
        }
    }
};

let lastClickedButton = null;  // Variable zum Speichern des zuletzt geklickten Buttons

// Funktion zum Erstellen der Buttons
function createButton(text, startIndex, buttonsContainer, uvDataArray, locationName, updateChart, chartLastClickedButton) {
    const button = document.createElement('button');
    button.innerText = text;

    // Event-Handler für den Klick auf den Button
    button.onclick = () => {
        // Wenn es einen vorherigen Button für diese Chart gibt, setze ihn zurück
        if (chartLastClickedButton[locationName]) {
            chartLastClickedButton[locationName].style.backgroundColor = ''; // Hintergrundfarbe auf Standard zurücksetzen
            chartLastClickedButton[locationName].style.color = '';           // Textfarbe zurücksetzen
        }

        // Setze den geklickten Button auf die neue Farbe
        button.style.backgroundColor = '#FFFFFF';
        button.style.color = '#2C73A1';

        // Speichere den aktuellen Button als den zuletzt geklickten für diese Chart
        chartLastClickedButton[locationName] = button;

        // Aktualisiere das Diagramm mit den entsprechenden Daten
        updateChart(uvDataArray, locationName, startIndex);
    };

    buttonsContainer.appendChild(button);  // Füge den Button in den Container ein
    return button;  // Gib den Button zurück, um ihn für spätere Aktionen zu nutzen
}

// Funktion zum Erstellen des LineCharts
function createLineChart(uvDataArrays, locationName, coordinates) {
    let uvDataArray = [];
    const chartLastClickedButton = {};  // Objekt zur Speicherung des letzten geklickten Buttons für jede Chart

    // Filtere die UV-Daten basierend auf den Koordinaten
    uvDataArrays.forEach(dataArray => {
        if (Array.isArray(dataArray)) {
            const filteredData = dataArray.filter(item => 
                Math.abs(parseFloat(item.longitude) - coordinates[0]) < 0.0001 && 
                Math.abs(parseFloat(item.latitude) - coordinates[1]) < 0.0001
            );

            if (filteredData.length > 0) {
                uvDataArray = uvDataArray.concat(filteredData);
            }
        }
    });

    if (uvDataArray.length === 0) {
        console.warn(`Keine UV-Daten für ${locationName} vorhanden!`);
        return;
    }

    // Erstelle ein Wrapper-Div, um das Chart und die Buttons zu gruppieren
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    document.getElementById('chart-container').appendChild(chartWrapper); // Füge den Wrapper zum Container hinzu

    // Chart-Canvas erstellen
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = `chart-${locationName.replace(/\s+/g, '-')}`;
    chartWrapper.appendChild(chartCanvas); // Canvas dem Wrapper hinzufügen

    // Buttons-Container erstellen
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'chart-buttons';
    chartWrapper.appendChild(buttonsContainer); // Buttons dem Wrapper hinzufügen (unterhalb des Canvas)

    // Buttons erstellen (24 Stunden, 48 Stunden, 72 Stunden)
    const button24h = createButton('Letzte 24 Stunden', -24, buttonsContainer, uvDataArray, locationName, updateChart, chartLastClickedButton);
    createButton('Letzte 48 Stunden', -48, buttonsContainer, uvDataArray, locationName, updateChart, chartLastClickedButton);
    createButton('Letzte 72 Stunden', -72, buttonsContainer, uvDataArray, locationName, updateChart, chartLastClickedButton);

    let chartInstance;

    // Initiale Chart-Daten festlegen
    const initialData = uvDataArray.slice(-24);
    updateChart(initialData, locationName, 0);

    // Standardmäßig den Button für 24 Stunden "klicken"
    button24h.click();

    // Chart rendern
    function renderChart(data, locationName) { // locationName als Parameter hinzufügen
        const labels = data.map(item => new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const uvIndexData = data.map(item => parseFloat(item.uvindex));

        const chartData = {
            labels: labels,
            datasets: [{
                label: 'UV-Index',
                data: uvIndexData,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                tension: 0.1
            }]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: `UV-Index für ${locationName}`, // Hier wird locationName verwendet
                        font: { size: 20, weight: 'bold' },
                        color: 'black',
                        align: 'start',
                        padding: 20,
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 13,
                        ticks: { stepSize: 1 }
                    }
                },
                elements: {
                    point: { radius: 5 }
                }
            },
            plugins: [imagePlugin]
        };

        const ctx = chartCanvas.getContext('2d');

        // Zerstöre die vorherige Chart-Instanz, falls vorhanden
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, config); // Speichere die neue Chart-Instanz
        chartCanvas.chart = chartInstance;
    }

    // Update Chart-Funktion
    function updateChart(uvDataArray, locationName, startIndex) {
        const slicedData = uvDataArray.slice(startIndex); // Slice-Daten entsprechend dem Button
        renderChart(slicedData, locationName); // Passiere locationName an renderChart
    }
}


// Fehlerbehandlung
window.addEventListener('error', function (e) {
    console.error("Globaler Fehler:", e.message);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error("Unbehandeltes Promise-Reject:", e.reason);
});

// Initialisiere den Chart-Container
document.addEventListener('DOMContentLoaded', () => {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
        console.error('Chart-Container nicht gefunden.');
    }
});