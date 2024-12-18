<?php
class Carrusel {
    private $apiKey = "0565634739c78dcdbf56368cb0991f0b";

    public function obtenerImagenes($tag = "viajes") {
        $url = "https://api.flickr.com/services/feeds/photos_public.gne?";
        $url .= "tags=" . urlencode($tag);
        $url .= "&format=json&nojsoncallback=1";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($curl);
        curl_close($curl);

        $data = json_decode($response, true);

        $imagenes = [];
        if (!empty($data["items"])) {
            foreach ($data["items"] as $item) {
                $imagenes[] = [
                    "src" => $item["media"]["m"],
                    "title" => $item["title"] ?: "Imagen sin título",
                ];
            }
        }

        return $imagenes;
    }
}

class Moneda {
    private $monedaLocal;
    private $monedaReferencia;
    private $accessKey;

    public function __construct($monedaLocal = "BRL", $monedaReferencia = "EUR", $accessKey = "") {
        $this->monedaLocal = $monedaLocal;
        $this->monedaReferencia = $monedaReferencia;
        $this->accessKey = $accessKey;
    }

    public function obtenerCambio() {
        if ($this->accessKey) {
            $url = "https://api.exchangerate.host/latest?access_key={$this->accessKey}&base={$this->monedaReferencia}&symbols={$this->monedaLocal}";
        } else {
            $url = "https://api.exchangerate.host/latest?base={$this->monedaReferencia}&symbols={$this->monedaLocal}";
        }

        $respuesta = file_get_contents($url);
        $data = json_decode($respuesta, true);

        if (isset($data['rates'][$this->monedaLocal])) {
            return $data['rates'][$this->monedaLocal];
        } else {
            return "Error al obtener el tipo de cambio.";
        }
    }
}

$moneda = new Moneda("BRL", "EUR", "d5bc503b91aef8ad7f2c169899b8c9f4"); 
$cambio = $moneda->obtenerCambio();

$carrusel = new Carrusel();
$imagenes = $carrusel->obtenerImagenes();
?>
<!DOCTYPE HTML>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="author" content="Adrian Dumitru" />
  <meta name="description" content="Viajes con Geolocalización" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="keywords" content="viajes,mapas" />
  <title>Viajes - F1 Desktop</title>
  <link rel="stylesheet" href="estilo/estilo.css" />
  <link rel="stylesheet" href="estilo/layout.css" />
  <link rel="stylesheet" href="estilo/article_elements.css" />
  <link rel="stylesheet" href="estilo/api.css" />
  <link rel="icon" href="multimedia/imagenes/favicon.ico" sizes="16x16" />
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="js/viajes.js" defer></script>
</head>
<body>
  <header>
    <h1><a href="Index.html">F1 Desktop</a></h1>
    <nav>
      <a href="Index.html">Inicio</a>
      <a href="piloto.html">Piloto</a>
      <a href="noticias.html">Noticias</a>
      <a href="calendario.html">Calendario</a>
      <a href="meteorología.html">Meteorología</a>
      <a href="circuito.html">Circuito</a>
      <a href="viajes.php" class="active">Viajes</a>
      <a href="juegos.html">Juegos</a>
    </nav>
  </header>
  <p>Estas en: <a href="Index.html">Inicio</a> &gt;&gt; Viajes</p>

  <main>
    <!-- Sección de mapas -->
    <section>
      <h2>Obtener mapas con tu ubicación</h2>
      <p>Haz clic en los botones para generar un mapa estático o dinámico con tu ubicación actual:</p>
      <button type="button" onClick="viaje.generarMapaEstatico()">Obtener mapa estático</button>
      <button type="button" onClick="viaje.cargarMapaDinamico()">Obtener mapa dinámico</button>
      <article id="mapa">
        <h3>mapa</h3>
      </article>
    </section>

    <!-- Sección de tipo de cambio -->
    <section>
      <h2>Tipo de Cambio</h2>
      <p>
        <?php
        echo is_numeric($cambio)
            ? "1€ equivale a " . number_format($cambio, 2) . " BRL."
            : $cambio;
        ?>
      </p>
    </section>

    <!-- Sección del carrusel -->
    <section>
    <h3>Carrusel</h3>
      <article>
        <h2>Carrusel de Imágenes</h2>
        <?php foreach ($imagenes as $imagen): ?>
          <img src="<?= htmlspecialchars($imagen['src']) ?>" alt="<?= htmlspecialchars($imagen['title']) ?>" />
        <?php endforeach; ?>
        <button>&gt;</button>
        <button>&lt;</button>
      </article>
    </section>
  </main>
</body>
</html>
