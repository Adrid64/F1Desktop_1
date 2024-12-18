console.log("Archivo semaforo.js cargado correctamente.");

class Semaforo {
    levels = [0.2, 0.5, 0.8]; 
    lights = 4; 
    unload_moment = null;
    clic_moment = null;
    difficulty;

    constructor() {
        const randomIndex = Math.floor(Math.random() * this.levels.length);
        this.difficulty = this.levels[randomIndex];

        this.createStructure();

        this.startButton = $("#startButton");
        this.reactionButton = $("#reactionButton");
        this.reactionTimeDisplay = $("#reactionTime");

        console.log("Semáforo inicializado con dificultad:", this.difficulty);
    }

    createStructure() {
        const mainElement = $("main");

        const title = $("<h1>Juego de Reacción - Semáforo</h1>");
        mainElement.append(title);

        for (let i = 0; i < this.lights; i++) {
            const lightDiv = $("<div class='semaforo-light'></div>");
            mainElement.append(lightDiv);
        }

        const startButton = $("<button id='startButton'>Iniciar Semáforo</button>");
        startButton.on("click", () => this.initSequence());
        mainElement.append(startButton);

        const reactionButton = $("<button id='reactionButton' disabled>Registrar Reacción</button>");
        reactionButton.on("click", () => this.stopReaction());
        mainElement.append(reactionButton);

        const reactionTime = $("<div id='reactionTime'>Tiempo de Reacción: --</div>");
        mainElement.append(reactionTime);
    }

    initSequence() {
        console.log("Secuencia iniciada...");
        $("main").removeClass("unload").addClass("load");

        this.startButton.prop("disabled", true);
        this.reactionButton.prop("disabled", true);

        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, 2000 + this.difficulty * 100);
    }

    endSequence() {
        console.log("Apagando luces...");
        $("main").removeClass("load").addClass("unload");

        this.reactionButton.prop("disabled", false);
    }

    stopReaction() {
        console.log("Botón de reacción pulsado.");
        this.clic_moment = new Date();
        const reactionTime = this.clic_moment - this.unload_moment;

        this.reactionTimeDisplay.text(`Tiempo de Reacción: ${(reactionTime / 1000).toFixed(3)} s`);

        this.createRecordForm(reactionTime);
        this.displayTopRecords(this.difficulty);
        this.resetGame();
    }

    resetGame() {
        console.log("Reiniciando juego...");
        $("main").removeClass("load unload");
        this.startButton.prop("disabled", false);
        this.reactionButton.prop("disabled", true);
    }createRecordForm(reactionTime) {
        console.log("Creando formulario de récord.");
        const mainElement = $("main");
    
        mainElement.find("form").remove();
        mainElement.find("ol").remove();
    
        const form = $(`
            <form>
                <h2>Formulario de Almacenaje de Récords</h2>
                <label>Nombre:</label>
                <input type="text" name="name" required><br>
                <label>Apellidos:</label>
                <input type="text" name="surname" required><br>
                <label>Nivel:</label>
                <input type="text" name="level" value="${this.difficulty}" readonly><br>
                <label>Tiempo de Reacción:</label>
                <input type="text" name="reactionTime" value="${(reactionTime / 1000).toFixed(3)}" readonly><br>
                <button type="submit">Guardar Récord</button>
            </form>
        `);
    
        mainElement.append(form);
    
        mainElement.find("form").on("submit", (e) => {
            e.preventDefault(); 
    
            const formData = mainElement.find("form").serialize(); 
    
            $.ajax({
                url: "semaforo.php",
                method: "POST",
                data: formData,
                success: () => {
                    console.log("Récord guardado correctamente.");
                    mainElement.find("form").remove(); 
                    this.displayTopRecords(this.difficulty); 
                },
                error: (err) => {
                    console.error("Error al guardar el récord:", err);
                }
            });
        });
    }
    

    displayTopRecords(level) {
        $.ajax({
            url: "semaforo.php",
            method: "GET",
            data: { level: level },
            dataType: "json",
            success: (data) => {
                const mainElement = $("main");
                mainElement.find("ol").remove(); 
                const recordList = $("<ol>Mejores Récords:</ol>");

                data.forEach((record) => {
                    const listItem = $(`<li>${record.nombre} ${record.apellidos} - ${record.tiempo.toFixed(3)}s</li>`);
                    recordList.append(listItem);
                });

                mainElement.append(recordList);
            },
            error: (err) => {
                console.error("Error al obtener los récords:", err);
            }
        });
    }
}

$(document).ready(() => {
    console.log("jQuery está cargado y listo.");
    new Semaforo();
});
