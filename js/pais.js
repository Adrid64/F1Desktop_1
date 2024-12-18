class Pais {
    constructor(nombre, capital, poblacion) {
        this.nombre = nombre;
        this.capital = capital;
        this.poblacion = poblacion;
        this.circuitoF1 = null;
        this.formaDeGobierno = null;
        this.coordenadasMeta = null;
        this.religionMayoritaria = null;
        this.pronostico = [];
    }

    rellenarDatos(circuitoF1, formaDeGobierno, coordenadasMeta, religionMayoritaria) {
        this.circuitoF1 = circuitoF1;
        this.formaDeGobierno = formaDeGobierno;
        this.coordenadasMeta = coordenadasMeta.split(',').map(coord => parseFloat(coord.trim()));
        this.religionMayoritaria = religionMayoritaria;
    }

    obtenerPronostico() {
        const apiKey = '702f4ae2dd07c12a99ec4f03a81a9f94';
        const [latitud, longitud] = this.coordenadasMeta;
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitud}&lon=${longitud}&appid=${apiKey}&mode=xml&units=metric&lang=es`;

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'xml',
            success: (data) => {
                this.procesarPronostico(data);
                this.mostrarPronostico();
            },
            error: (error) => {
                console.error('Error al obtener el pronóstico:', error);
            }
        });
    }

    procesarPronostico(data) {
        const pronosticos = $(data).find('time');

        this.pronostico = [];
        pronosticos.each((_, elemento) => {
            const fecha = $(elemento).attr('from').split('T')[0];
            const tempMax = $(elemento).find('temperature').attr('max');
            const tempMin = $(elemento).find('temperature').attr('min');
            const humedad = $(elemento).find('humidity').attr('value');
            const lluvia = $(elemento).find('precipitation').attr('value') || 0;
            const icono = $(elemento).find('symbol').attr('var');

            this.pronostico.push({
                fecha,
                maxTemp: parseFloat(tempMax).toFixed(1),
                minTemp: parseFloat(tempMin).toFixed(1),
                humedad: parseFloat(humedad).toFixed(1),
                lluvia: parseFloat(lluvia).toFixed(1),
                icono
            });
        });
    }

    mostrarPronostico() {
        const contenedor = $('main');
        contenedor.empty();
        this.pronostico.forEach(dia => {
            contenedor.append(`
                <article>
                    <h3>Pronóstico para el día: ${dia.fecha}</h3>
                    <p>Temperatura máxima: ${dia.maxTemp}°C</p>
                    <p>Temperatura mínima: ${dia.minTemp}°C</p>
                    <p>Humedad: ${dia.humedad}%</p>
                    <p>Lluvia: ${dia.lluvia} mm</p>
                    <img src="https://openweathermap.org/img/wn/${dia.icono}@2x.png" alt="Icono del clima">
                </article>
            `);
        });
    }
}

const brasil = new Pais("Brasil", "Brasilia", 214000000);
brasil.rellenarDatos("Interlagos", "República federal", "-23.703751, -46.699938", "Cristianismo");
brasil.obtenerPronostico();
