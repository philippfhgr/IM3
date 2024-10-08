// URL der API, von der die Daten abgerufen werden sollen
const apiUrl = 'https://etl.mmp.li/RayWatch/etl/unload.php'; // Ersetze dies durch die echte API-URL

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

        // Daten verarbeiten (z. B. ausgeben)
        console.log(data);
    } catch (error) {
        // Fehler behandeln
        console.error('Fehler beim Abrufen der Daten:', error);
    }
}

// Funktion aufrufen
fetchData();
