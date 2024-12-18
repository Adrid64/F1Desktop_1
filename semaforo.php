<?php
class Record {
    private $conn;

    // Constructor: establece la conexión a la base de datos
    public function __construct() {
        $server = "localhost";
        $user = "DBUSER2024";
        $pass = "DBPSWD2024";
        $dbname = "records";

        $this->conn = new mysqli($server, $user, $pass, $dbname);

        if ($this->conn->connect_error) {
            die("Error de conexión: " . $this->conn->connect_error);
        }
    }

    // Guardar el récord en la base de datos
    public function saveRecord($name, $surname, $level, $reactionTime) {
        $stmt = $this->conn->prepare("INSERT INTO registro (nombre, apellidos, nivel, tiempo) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssdd", $name, $surname, $level, $reactionTime);

        if ($stmt->execute()) {
            echo "Récord guardado exitosamente.";
        } else {
            echo "Error al guardar el récord: " . $stmt->error;
        }

        $stmt->close();
    }

    // Obtener los mejores 10 récords
    public function getTopRecords($level) {
        $stmt = $this->conn->prepare("SELECT nombre, apellidos, tiempo FROM registro WHERE nivel = ? ORDER BY tiempo ASC LIMIT 10");
        $stmt->bind_param("d", $level);
        $stmt->execute();
        $result = $stmt->get_result();

        $records = [];
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }

        $stmt->close();
        return $records;
    }

    // Cerrar la conexión
    public function closeDB() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $record = new Record();

    $name = htmlspecialchars(trim($_POST['name']));
    $surname = htmlspecialchars(trim($_POST['surname']));
    $level = (float) htmlspecialchars(trim($_POST['level']));
    $reactionTime = (float) htmlspecialchars(trim($_POST['reactionTime']));

    $record->saveRecord($name, $surname, $level, $reactionTime);
    $record->closeDB();
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['level'])) {
    $record = new Record();

    $level = (float) htmlspecialchars(trim($_GET['level']));
    $topRecords = $record->getTopRecords($level);

    header('Content-Type: application/json');
    echo json_encode($topRecords);

    $record->closeDB();
    exit;
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juego de Reacción - Semáforo</title>
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css">
    <meta name="keywords" content="juego,reaccion" />
    <link rel="stylesheet" type="text/css" href="estilo/semaforo_grid.css">
    <link rel="stylesheet" type="text/css" href="estilo/layout.css">
    <link rel="icon" href="multimedia/imagenes/favicon.ico" sizes="16x16" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <header>
        <h1><a href="index.html">F1 Desktop</a></h1>
        <nav>
            <a href="index.html">Inicio</a>
            <a href="piloto.html">Piloto</a>
            <a href="noticias.html">Noticias</a>
            <a href="calendario.html">Calendario</a>
            <a href="meteorologia.html">Meteorología</a>
            <a href="circuito.html">Circuito</a>
            <a href="viajes.php">Viajes</a>
            <a href="juegos.html">Juegos</a>
        </nav>
    </header>
    <p>Estas en: <a href="Index.html">Inicio</a>&gt;&gt; <a href="juegos.html">Juegos</a> &gt;&gt; Semaforo</p>
    <main>
    <script src="js/semaforo.js" defer></script>
</main>
</body>
</html>
