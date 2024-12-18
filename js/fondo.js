class Fondo {
    constructor(pais, capital, circuito) {
        this.pais = pais;
        this.capital = capital;
        this.circuito = circuito;
    }

    cargarImagenes() {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

        $.getJSON(flickrAPI, {
            tags: `Formula 1, ${this.pais}`,
            tagmode: "all",
            format: "json"
        })
        .done((data) => {
            if (data.items.length === 0) {
                $("#body").append("<p>No se encontraron imágenes para este circuito.</p>");
                return;
            }
            const randomIndex = Math.floor(Math.random() * data.items.length);
            const photo = data.items[randomIndex];

            const photoUrl = photo.media.m.replace('_m', '_b'); 

            $("body").css("background-image", `url(${photoUrl})`);
            $("body").css("background-size", "cover");
            $("body").css("background-position", "center");
            $("body").css("background-repeat", "no-repeat");
            $("body").css("height", "100vh");   
        })
        .fail((jqxhr, textStatus, error) => {
            console.error("Error al cargar las imágenes: " + textStatus + ", " + error);
        });
    }
}

const fondo = new Fondo("INTERLAGOS", "Brasilia", "Brasil");
fondo.cargarImagenes();