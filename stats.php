<?php
class Formula1Manager {
    private $conn;

    public function __construct() {
        $this->connectDB();
    }

    private function connectDB() {
        $host = 'localhost';
        $username = 'DBUSER2024';
        $password = 'DBPSWD2024';
        $dbname = 'f1_stats';

        $this->conn = new mysqli($host, $username, $password, $dbname);

        if ($this->conn->connect_error) {
            die("Error de conexión");
        }
    }

    public function crearTablas() {
        $sqlFile = 'formula1_db.sql';

        if (file_exists($sqlFile)) {
            $sql = file_get_contents($sqlFile);
            if ($this->conn->multi_query($sql)) {
                do {
                    if ($result = $this->conn->store_result()) {
                        $result->free();
                    }
                } while ($this->conn->next_result());
            }
        }
    }

    public function obtenerPilotos() {
        $query = "SELECT piloto_id, CONCAT(nombre, ' ', apellido) AS nombre_completo FROM Pilotos";
        $result = $this->conn->query($query);
        $pilotos = [];

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $pilotos[] = $row;
            }
        }
        return $pilotos;
    }

    public function compararPilotos($piloto1_id, $piloto2_id) {
        $query = "SELECT 
                    p.piloto_id,
                    CONCAT(p.nombre, ' ', p.apellido) AS nombre,
                    p.fecha_nacimiento,
                    p.pais,
                    IFNULL(e.nombre, 'Sin equipo') AS equipo,
                    COALESCE(SUM(r.puntos), 0) AS total_puntos,
                    COUNT(r.resultado_id) AS total_carreras
                  FROM Pilotos p
                  LEFT JOIN Equipos e ON p.equipo_id = e.equipo_id
                  LEFT JOIN Resultados r ON p.piloto_id = r.piloto_id
                  WHERE p.piloto_id IN (?, ?)
                  GROUP BY p.piloto_id, p.nombre, p.apellido, p.fecha_nacimiento, p.pais, e.nombre";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $piloto1_id, $piloto2_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $datosComparacion = [];

        while ($row = $result->fetch_assoc()) {
            $datosComparacion[] = $row;
        }
        return $datosComparacion;
    }
}

function generarGraficoSVG($piloto1, $piloto2, $datos, $atributo) {
  $width = 800; // Ancho total del SVG
  $height = 400; // Alto total del SVG
  $barWidth = 100; // Ancho de cada barra
  $barSpacing = 50; // Espacio entre barras
  $margin = 50; // Margen alrededor del gráfico

  $atributoLabel = ($atributo === 'total_carreras') ? 'Total Carreras' : 'Total Puntos';
  $maxValue = max($datos[$atributo]);

  // Escalado seguro
  $maxValue = max($maxValue, 1); // Evita divisiones por cero
  $scale = ($height - 2 * $margin) / $maxValue;

  // Inicio del SVG
  $svg = "<svg width='$width' height='$height' xmlns='http://www.w3.org/2000/svg'>";

  // Dibujar fondo
  $svg .= "<rect width='100%' height='100%' fill='white' />";

  // Dibujar barras y añadir valores
  for ($i = 0; $i < 2; $i++) {
      $x = $margin + $i * ($barWidth + $barSpacing);
      $barHeight = $datos[$atributo][$i] * $scale;
      $y = $height - $margin - $barHeight;

      // Dibujar la barra
      $svg .= "<rect x='$x' y='$y' width='$barWidth' height='$barHeight' fill='blue'/>";

      // Añadir el valor encima de la barra
      $svg .= "<text x='" . ($x + $barWidth / 2) . "' y='" . ($y - 10) . "' text-anchor='middle' font-size='14' fill='black'>{$datos[$atributo][$i]}</text>";

      // Añadir la etiqueta del piloto debajo de la barra
      $svg .= "<text x='" . ($x + $barWidth / 2) . "' y='" . ($height - $margin + 20) . "' text-anchor='middle' font-size='14' fill='black'>{$datos['nombres'][$i]}</text>";
  }

  // Dibujar el eje X
  $svg .= "<line x1='$margin' y1='" . ($height - $margin) . "' x2='" . ($width - $margin) . "' y2='" . ($height - $margin) . "' stroke='black' />";

  // Dibujar el eje Y
  $svg .= "<line x1='$margin' y1='$margin' x2='$margin' y2='" . ($height - $margin) . "' stroke='black' />";

  // Añadir leyenda
  $svg .= "<rect x='650' y='50' width='20' height='20' fill='blue' />";
  $svg .= "<text x='680' y='65' font-family='Arial' font-size='14' fill='black'>$atributoLabel</text>";

  // Cerrar el SVG
  $svg .= "</svg>";

  return $svg;
}

// *** AQUÍ DEBE IR LA CREACIÓN DEL OBJETO Y LÓGICA ***
$manager = new Formula1Manager();
$pilotos = $manager->obtenerPilotos();
$resultados = [];
$graficoSVG = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['crear_tablas'])) {
        $manager->crearTablas();
    } elseif (isset($_POST['comparar'])) {
        $piloto1_id = $_POST['piloto1'];
        $piloto2_id = $_POST['piloto2'];
        $atributo = $_POST['valor_comparar'] ?? null;

        if ($atributo && in_array($atributo, ['total_carreras', 'total_puntos'])) {
            $resultados = $manager->compararPilotos($piloto1_id, $piloto2_id);

            if (!empty($resultados)) {
                $datos = [
                    'nombres' => [
                        $resultados[0]['nombre'] ?? 'Piloto 1',
                        $resultados[1]['nombre'] ?? 'Piloto 2'
                    ],
                    'total_carreras' => [
                        $resultados[0]['total_carreras'] ?? 0,
                        $resultados[1]['total_carreras'] ?? 0
                    ],
                    'total_puntos' => [
                        $resultados[0]['total_puntos'] ?? 0,
                        $resultados[1]['total_puntos'] ?? 0
                    ],
                ];
                $graficoSVG = generarGraficoSVG($datos['nombres'][0], $datos['nombres'][1], $datos, $atributo);
            }
        }
    }
}
?>
<!DOCTYPE HTML>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="author" content="Adrian Dumitru" />
  <meta name="description" content="Gestión de Fórmula 1" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="keywords" content="estadisticas,pilotos" />
  <title>Gestión Fórmula 1 - F1 Desktop</title>
  <link rel="stylesheet" href="estilo/estilo.css" />
  <link rel="stylesheet" href="estilo/layout.css" />
  <link rel="stylesheet" href="estilo/article_elements.css" />
  <link rel="icon" href="multimedia/imagenes/favicon.ico" sizes="16x16" />
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
      <a href="viajes.php">Viajes</a>
      <a href="juegos.html">Juegos</a>
    </nav>
  </header>
  <p>Estas en: <a href="Index.html">Inicio</a>&gt;&gt; <a href="juegos.html">Juegos</a> &gt;&gt; Gestión Fórmula 1</p>
  
  <main>
    <section>
      <h2>Gestión de Fórmula 1</h2>
      <form method="POST">
        <h3>Crear Tablas</h3>
        <button type="submit" name="crear_tablas">Crear Tablas</button>
      </form>

      <form method="POST" enctype="multipart/form-data">
        <h3>Importar Datos</h3>
        <label for="tabla_importar">Seleccionar Tabla:</label>
        <select id="tabla_importar" name="tabla">
          <option value="Pilotos">Pilotos</option>
          <option value="Equipos">Equipos</option>
          <option value="Circuitos">Circuitos</option>
          <option value="Carreras">Carreras</option>
          <option value="Resultados">Resultados</option>
        </select>
        
        <label for="csv_file">Archivo CSV:</label>
        <input id="csv_file" type="file" name="csv_file" accept=".csv" required>
        
        <button type="submit" name="importar">Importar</button>
      </form>

      <form method="POST">
        <h3>Exportar Datos</h3>
        <label for="tabla_exportar">Seleccionar Tabla:</label>
        <select id="tabla_exportar" name="tabla">
          <option value="Pilotos">Pilotos</option>
          <option value="Equipos">Equipos</option>
          <option value="Circuitos">Circuitos</option>
          <option value="Carreras">Carreras</option>
          <option value="Resultados">Resultados</option>
        </select>
        <button type="submit" name="exportar">Exportar</button>
      </form>

      <form method="POST">
        <h3>Comparar Pilotos</h3>
        <label for="piloto1">Seleccionar Piloto 1:</label>
        <select id="piloto1" name="piloto1" required>
          <?php foreach ($pilotos as $piloto): ?>
            <option value="<?= $piloto['piloto_id'] ?>"><?= htmlspecialchars($piloto['nombre_completo']) ?></option>
          <?php endforeach; ?>
        </select>
        
        <label for="piloto2">Seleccionar Piloto 2:</label>
        <select id="piloto2" name="piloto2" required>
          <?php foreach ($pilotos as $piloto): ?>
            <option value="<?= $piloto['piloto_id'] ?>"><?= htmlspecialchars($piloto['nombre_completo']) ?></option>
          <?php endforeach; ?>
        </select>
        
        <label for="valor_comparar">Seleccionar Valor a Comparar:</label>
        <select id="valor_comparar" name="valor_comparar" required>
          <option value="total_carreras">Total Carreras</option>
          <option value="total_puntos">Total Puntos</option>
        </select>
        
        <button type="submit" name="comparar">Comparar</button>
      </form>
    </section>

    <?php if (!empty($resultados)): ?>
    <section>
      <h2>Resultados de la Comparación</h2>
      <table>
        <thead>
          <tr>
            <th>Piloto</th>
            <th>Fecha de Nacimiento</th>
            <th>País</th>
            <th>Equipo</th>
            <th>Total Carreras</th>
            <th>Total Puntos</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($resultados as $piloto): ?>
          <tr>
            <td><?= htmlspecialchars($piloto['nombre']) ?></td>
            <td><?= htmlspecialchars($piloto['fecha_nacimiento']) ?></td>
            <td><?= htmlspecialchars($piloto['pais']) ?></td>
            <td><?= htmlspecialchars($piloto['equipo']) ?></td>
            <td><?= htmlspecialchars($piloto['total_carreras']) ?></td>
            <td><?= htmlspecialchars($piloto['total_puntos']) ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </section>
    <?php endif; ?>

    <?php if (!empty($graficoSVG)): ?>
      <section>
        <h2>Gráfico de Comparación</h2>
        <?= $graficoSVG ?>
      </section>
    <?php endif; ?>
  </main>
</body>
</html>
