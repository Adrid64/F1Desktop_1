class PitStopGame {
    constructor() {
        this.canvas = document.querySelector("main > section:nth-of-type(3) > canvas");
        this.ctx = this.canvas.getContext("2d");
        this.msg = document.querySelector("main > section:nth-of-type(3) > p");
        this.tbody = document.querySelector("main > section:nth-of-type(4) > table > tbody");
        this.figuras = document.querySelectorAll("main > section:nth-of-type(2) > figure");
        this.zonaCanvas = this.canvas;
        this.btnIniciar = document.querySelector("main > section:nth-of-type(1) > button");

        this.tiempoMax = 20;
        this.tiempoRestante = this.tiempoMax;
        this.intervalo = null;

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.cocheX = w * 0.15;
        this.cocheY = h * 0.25;
        this.cocheW = w * 0.7;
        this.cocheH = h * 0.5;

        this.posiciones = {
            "front-left":  {x: w * 0.25, y: h * 0.38, colocado: false},
            "front-right": {x: w * 0.75, y: h * 0.38, colocado: false},
            "rear-left":   {x: w * 0.25, y: h * 0.62, colocado: false},
            "rear-right":  {x: w * 0.75, y: h * 0.62, colocado: false}
        };

        this.tipoArrastrado = null;
        this.db = null;
        this.dbName = "pitstopDB";
        this.storeName = "tiempos";

        this.onStart = this.onStart.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragOver = e => e.preventDefault();
        this.onDrop = this.onDrop.bind(this);
    }

    iniciar() {
        this.initDB(() => {
            this.btnIniciar.addEventListener("click", this.onStart);
        });
    }

    onStart() {
        Object.values(this.posiciones).forEach(p => p.colocado = false);
        this.msg.textContent = "";
        this.dibujar();
        this.iniciarTempo();
        this.addListeners();
    }

    addListeners() {
        this.figuras.forEach(fig => fig.addEventListener("dragstart", this.onDragStart));
        this.zonaCanvas.addEventListener("dragover", this.onDragOver);
        this.zonaCanvas.addEventListener("drop", this.onDrop);
    }

    removeListeners() {
        this.figuras.forEach(fig => fig.removeEventListener("dragstart", this.onDragStart));
        this.zonaCanvas.removeEventListener("dragover", this.onDragOver);
        this.zonaCanvas.removeEventListener("drop", this.onDrop);
    }

    dibujar() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        // Coche
        this.ctx.fillStyle = "#ccc";
        this.ctx.fillRect(this.cocheX, this.cocheY, this.cocheW, this.cocheH);

        // Zonas neumáticos
        for (const p of Object.values(this.posiciones)) {
            this.ctx.strokeStyle = "#000";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 30, 0, 2*Math.PI);
            this.ctx.stroke();
        }

        // Neumáticos colocados
        for (const p of Object.values(this.posiciones)) {
            if (p.colocado) {
                this.ctx.fillStyle = "#333";
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 25, 0, 2*Math.PI);
                this.ctx.fill();
            }
        }

        // Crono
        this.ctx.fillStyle = "#000";
        this.ctx.font = "1em Arial";
        this.ctx.fillText(`Tiempo: ${this.tiempoRestante}s`, 10, 20);
    }

    iniciarTempo() {
        this.tiempoRestante = this.tiempoMax;
        this.intervalo = setInterval(() => {
            this.tiempoRestante--;
            if (this.tiempoRestante <= 0) {
                this.tiempoRestante = 0;
                clearInterval(this.intervalo);
                this.fin(false);
            }
            this.dibujar();
        }, 1000);
    }

    completado() {
        return Object.values(this.posiciones).every(p => p.colocado);
    }

    fin(exito) {
        this.removeListeners();
        if (this.intervalo) clearInterval(this.intervalo);

        if (exito) {
            const tiempoUsado = this.tiempoMax - this.tiempoRestante;
            this.msg.textContent = `¡Excelente! ${tiempoUsado} segundos.`;
            this.guardarTiempo(tiempoUsado);
        } else {
            this.msg.textContent = "¡Tiempo agotado!";
        }
    }

    onDragStart(e) {
        this.tipoArrastrado = e.currentTarget.dataset.tipo;
        e.dataTransfer.setData("text/plain", this.tipoArrastrado);
    }

    onDrop(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.tipoArrastrado) {
            const p = this.posiciones[this.tipoArrastrado];
            if (!p.colocado) {
                const dist = Math.sqrt((x - p.x)**2 + (y - p.y)**2);
                if (dist < 30) {
                    p.colocado = true;
                    this.dibujar();
                    if (this.completado()) this.fin(true);
                }
            }
            this.tipoArrastrado = null;
        }
    }

    initDB(cb) {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = e => {
            this.db = e.target.result;
            if(!this.db.objectStoreNames.contains(this.storeName)){
                this.db.createObjectStore(this.storeName, {autoIncrement: true});
            }
        };
        req.onsuccess = e => {
            this.db = e.target.result;
            this.mostrarTiempos();
            if (cb) cb();
        };
        req.onerror = e => {
            console.error("Error DB:", e);
            if (cb) cb();
        };
    }

    guardarTiempo(t) {
        const tx = this.db.transaction(this.storeName, "readwrite");
        const st = tx.objectStore(this.storeName);
        st.add({tiempo: t, fecha: new Date().toISOString()});
        tx.oncomplete = () => this.mostrarTiempos();
    }

    mostrarTiempos() {
        while (this.tbody.firstChild) this.tbody.removeChild(this.tbody.firstChild);

        const tx = this.db.transaction(this.storeName, "readonly");
        const st = tx.objectStore(this.storeName);
        const req = st.getAll();
        req.onsuccess = () => {
            const res = req.result;
            res.sort((a,b) => a.tiempo - b.tiempo);
            res.slice(0,5).forEach(r => {
                const tr = document.createElement("tr");
                const td1 = document.createElement("td");
                td1.textContent = r.tiempo;
                tr.appendChild(td1);
                const td2 = document.createElement("td");
                td2.textContent = new Date(r.fecha).toLocaleString();
                tr.appendChild(td2);
                this.tbody.appendChild(tr);
            });
        };
    }
}
    const juego = new PitStopGame();
    juego.iniciar();

