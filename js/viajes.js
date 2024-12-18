"use strict";

class Viajes {
    constructor() {
        this.latitud = null;
        this.longitud = null;
        this.apiKey = "AIzaSyC6j4mF6blrc4kZ54S6vYZ2_FpMY9VzyRU";
        this.mapaGeoposicionado = null;
        this.scriptCargado = false;

        this.slides = $("article img");
        this.nextButton = $("article button:nth-of-type(1)");
        this.prevButton = $("article button:nth-of-type(2)");
        this.curSlide = 0;
        this.maxSlide = this.slides.length - 1;

        this.initCarrusel();
    }

    /**
     * Obtiene la posición del usuario y llama a una función callback.
     */
    obtenerUbicacion(callback) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (posicion) => {
                    this.latitud = posicion.coords.latitude;
                    this.longitud = posicion.coords.longitude;
                    console.log(`Ubicación obtenida: ${this.latitud}, ${this.longitud}`);
                    callback();
                },
                this.mostrarErrorGeolocalizacion.bind(this)
            );
        } else {
            this.mostrarMensaje("La geolocalización no está disponible en este navegador.");
        }
    }

    /**
     * Genera el mapa estático después de obtener la ubicación.
     */
    generarMapaEstatico() {
        this.obtenerUbicacion(() => {
            const url = `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitud},${this.longitud}&zoom=15&size=800x600&markers=${this.latitud},${this.longitud}&key=${this.apiKey}`;
            $("article#mapa").html(`<img src="${url}" alt="Mapa estático de Google Maps">`);
        });
    }

    /**
     * Carga el script de Google Maps y genera el mapa dinámico.
     */
    cargarMapaDinamico() {
        this.obtenerUbicacion(() => {
            if (!this.scriptCargado) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap&loading=async`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                window.initMap = this.initMap.bind(this); 
                this.scriptCargado = true;
            } else {
                this.initMap();
            }
        });
    }

    /**
     * Inicializa el mapa dinámico.
     */
    initMap() {
        const centro = { lat: this.latitud, lng: this.longitud };
        const mapaContenedor = document.getElementById("mapa");

        if (!mapaContenedor) {
            console.error("El contenedor del mapa dinámico no está definido.");
            return;
        }

        mapaContenedor.innerHTML = "";
        this.mapaGeoposicionado = new google.maps.Map(mapaContenedor, {
            zoom: 15,
            center: centro,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        const infoWindow = new google.maps.InfoWindow({
            position: centro,
            content: "Localización encontrada",
        });

        infoWindow.open(this.mapaGeoposicionado);
    }

    /**
     * Muestra mensajes de error si la geolocalización falla.
     */
    mostrarErrorGeolocalizacion(error) {
        let mensaje = "Error desconocido.";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                mensaje = "Permiso denegado para acceder a la ubicación.";
                break;
            case error.POSITION_UNAVAILABLE:
                mensaje = "La información de la ubicación no está disponible.";
                break;
            case error.TIMEOUT:
                mensaje = "La solicitud de ubicación ha caducado.";
                break;
        }
        this.mostrarMensaje(mensaje);
    }

    mostrarMensaje(mensaje) {
        $("article#mapa").html(`<p>${mensaje}</p>`);
    }

    /**
     * Inicializa el carrusel.
     */
    initCarrusel() {
        this.slides.css("transform", (i) => `translateX(${100 * (i - this.curSlide)}%)`);

        this.nextButton.on("click", () => this.nextSlide());
        this.prevButton.on("click", () => this.prevSlide());
    }

    nextSlide() {
        this.curSlide = (this.curSlide === this.maxSlide) ? 0 : this.curSlide + 1;
        this.updateSlides();
    }

    prevSlide() {
        this.curSlide = (this.curSlide === 0) ? this.maxSlide : this.curSlide - 1;
        this.updateSlides();
    }

    updateSlides() {
        this.slides.each((i, slide) => {
            $(slide).css("transform", `translateX(${100 * (i - this.curSlide)}%)`);
        });
    }
}
const viaje = new Viajes();
