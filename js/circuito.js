"use strict";

class Circuito {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.mapaContenedor = document.getElementById("mapaDinamico");
        this.mapa = null;
        this.marcadores = [];
        this.polilineas = [];
        this.unicaSeccion = document.querySelector("main > section"); 
        this.cargarGoogleMaps();
    }

    // Cargar Google Maps
    cargarGoogleMaps() {
        if (!document.querySelector("script[src*='maps.googleapis.com']")) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMapa`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            window.initMapa = this.inicializarMapa.bind(this);
        }
    }

    // Inicializar el mapa en el contenedor
    inicializarMapa() {
        this.mapa = new google.maps.Map(this.mapaContenedor, {
            center: { lat: -23.703751, lng: -46.699938 },
            zoom: 15,
        });
    }

    leerArchivoXML(input) {
        const archivo = input.files[0];
        if (!archivo || !archivo.name.toLowerCase().endsWith(".xml")) {
            alert("Error: Solo se permiten archivos XML.");
            return;
        }

        const lector = new FileReader();
        lector.onload = (evento) => this.procesarXML(evento.target.result);
        lector.readAsText(archivo);
    }

    procesarXML(contenido) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contenido, "application/xml");

        if (xmlDoc.querySelector("parsererror")) {
            this.unicaSeccion.innerHTML = "<p>Error al parsear el archivo XML.</p>";
            return;
        }

        this.unicaSeccion.innerHTML = this.convertirXMLaHTML(xmlDoc.documentElement);
    }

    convertirXMLaHTML(nodo) {
        let html = "<ul>";
        html += `<li>${nodo.nodeName}`;
        if (nodo.childNodes.length > 0) {
            html += "<ul>";
            nodo.childNodes.forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    html += this.convertirXMLaHTML(child);
                } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                    html += `<li>${child.textContent.trim()}</li>`;
                }
            });
            html += "</ul>";
        }
        html += "</li></ul>";
        return html;
    }

    leerArchivoSVG(input) {
        const archivo = input.files[0];
        if (!archivo || !archivo.name.toLowerCase().endsWith(".svg")) {
            alert("Error: Solo se permiten archivos SVG.");
            return;
        }

        const lector = new FileReader();
        lector.onload = (evento) => this.procesarSVG(evento.target.result);
        lector.readAsText(archivo);
    }

    procesarSVG(contenido) {
        this.unicaSeccion.innerHTML = contenido;
    }

    leerArchivoKML(input) {
        const archivo = input.files[0];
        if (!archivo || !archivo.name.toLowerCase().endsWith(".kml")) {
            alert("Error: Solo se permiten archivos KML.");
            return;
        }

        const lector = new FileReader();
        lector.onload = (evento) => this.procesarKML(evento.target.result);
        lector.readAsText(archivo);
    }

    procesarKML(contenido) {
        this.limpiarMapa(); 

        const parser = new DOMParser();
        const kml = parser.parseFromString(contenido, "application/xml");

        const puntos = kml.getElementsByTagName("Point");
        for (const punto of puntos) {
            const coords = punto.getElementsByTagName("coordinates")[0].textContent.trim();
            const [lng, lat] = coords.split(",").map(Number);
            const marcador = new google.maps.Marker({
                position: { lat, lng },
                map: this.mapa,
                title: punto.parentNode.getElementsByTagName("name")[0]?.textContent || "Punto sin título",
            });
            this.marcadores.push(marcador);
        }

        const lineas = kml.getElementsByTagName("LineString");
        for (const linea of lineas) {
            const coords = linea.getElementsByTagName("coordinates")[0].textContent.trim();
            const path = coords.split(/\s+/).map(coord => {
                const [lng, lat] = coord.split(",").map(Number);
                return { lat, lng };
            });

            const polilinea = new google.maps.Polyline({
                path,
                map: this.mapa,
                strokeColor: "#FF0000", 
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });
            this.polilineas.push(polilinea);
        }

        this.ajustarMapa();
    }

    ajustarMapa() {
        const bounds = new google.maps.LatLngBounds();
        this.marcadores.forEach((m) => bounds.extend(m.getPosition()));
        if (!bounds.isEmpty()) this.mapa.fitBounds(bounds);
    }

    limpiarMapa() {
        this.marcadores.forEach((m) => m.setMap(null));
        this.marcadores = [];
    }
}

const circuito = new Circuito("AIzaSyC6j4mF6blrc4kZ54S6vYZ2_FpMY9VzyRU");
