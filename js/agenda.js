// Clase para gestionar los datos de las carreras de la temporada de F1
class Agenda {
    constructor() {
        this.apiUrl = 'https://api.jolpi.ca/ergast/f1/2024/races';
    }

    verJSON() {
        console.log("Iniciando la obtención de datos...");
        this.loadRaceData();
        document.querySelector("button").setAttribute("disabled", "disabled");
    }

    loadRaceData() {
        $.ajax({
            url: this.apiUrl,
            method: 'GET',
            dataType: 'json',
            success: (data) => {
                console.log("Datos obtenidos exitosamente");
                this.displayRaceDetails(data.MRData.RaceTable.Races);
            },
            error: (error) => {
                console.error("Error al obtener los datos:", error);
                const errorMessage = document.createElement("h3");
                errorMessage.textContent = "Error al obtener datos de Jolpica F1.";
                document.querySelector("main").appendChild(errorMessage);
            }
        });
    }
    displayRaceDetails(races) {
        let raceInfoHTML = "";  
        races.forEach(race => {
            const { raceName, Circuit, date, time } = race;
            const { circuitName, Location } = Circuit;
            const coordinates = `${Location.lat}, ${Location.long}`;

            raceInfoHTML += `
                <article>
                    <header><h3>${raceName}</h3></header>
                    <p>Circuito: ${circuitName}, ${Location.locality}, ${Location.country}</p>
                    <p>Coordenadas: ${coordinates}</p>
                    <p>Fecha y Hora: ${new Date(`${date}T${time}`).toLocaleString()}</p>
                </article>
                `;
        });

        document.querySelector("main").innerHTML += raceInfoHTML;  
    }
}

const agenda = new Agenda();
