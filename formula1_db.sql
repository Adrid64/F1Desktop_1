-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS f1_stats;


-- Usar la base de datos
USE f1_stats;

-- Crear la tabla Equipos
CREATE TABLE Equipos (
    equipo_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    fundacion YEAR NOT NULL
);

-- Crear la tabla Pilotos
CREATE TABLE Pilotos (
    piloto_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    pais VARCHAR(50) NOT NULL,
    equipo_id INT,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(equipo_id) ON DELETE SET NULL
);

-- Crear la tabla Circuitos
CREATE TABLE Circuitos (
    circuito_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    longitud FLOAT NOT NULL, -- Longitud en kilómetros
    vueltas INT NOT NULL     -- Número de vueltas
);

-- Crear la tabla Carreras
CREATE TABLE Carreras (
    carrera_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    circuito_id INT NOT NULL,
    FOREIGN KEY (circuito_id) REFERENCES Circuitos(circuito_id) ON DELETE CASCADE
);

-- Crear la tabla Resultados
CREATE TABLE Resultados (
    resultado_id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NOT NULL,
    piloto_id INT NOT NULL,
    posicion INT NOT NULL, -- Posición final en la carrera
    tiempo TIME,           -- Tiempo registrado
    puntos FLOAT NOT NULL, -- Puntos obtenidos
    FOREIGN KEY (carrera_id) REFERENCES Carreras(carrera_id) ON DELETE CASCADE,
    FOREIGN KEY (piloto_id) REFERENCES Pilotos(piloto_id) ON DELETE CASCADE
);

INSERT INTO Equipos (nombre, pais, fundacion) VALUES
('Red Bull Racing', 'Austria', 2005),
('Mercedes AMG Petronas', 'Alemania', 2010),
('Scuderia Ferrari', 'Italia', 1950);
INSERT INTO Pilotos (nombre, apellido, pais, equipo_id, fecha_nacimiento) VALUES
('Max', 'Verstappen', 'Países Bajos', 1, '1997-09-30'),
('Lewis', 'Hamilton', 'Reino Unido', 2, '1985-01-07'),
('Charles', 'Leclerc', 'Mónaco', 3, '1997-10-16'),
('Sergio', 'Pérez', 'México', 1, '1990-01-26'),
('George', 'Russell', 'Reino Unido', 2, '1998-02-15');
INSERT INTO Circuitos (nombre, pais, longitud, vueltas) VALUES
('Monza', 'Italia', 5.79, 53),
('Silverstone', 'Reino Unido', 5.89, 52),
('Interlagos', 'Brasil', 4.31, 71),
('Suzuka', 'Japón', 5.81, 53),
('Spa-Francorchamps', 'Bélgica', 7.00, 44);
INSERT INTO Carreras (nombre, fecha, circuito_id) VALUES
('Gran Premio de Italia', '2024-09-15', 1),
('Gran Premio de Gran Bretaña', '2024-07-07', 2),
('Gran Premio de Brasil', '2024-11-10', 3),
('Gran Premio de Japón', '2024-10-13', 4),
('Gran Premio de Bélgica', '2024-08-25', 5);
INSERT INTO Resultados (carrera_id, piloto_id, posicion, tiempo, puntos) VALUES
(1, 1, 1, '1:22:15', 25),
(1, 2, 2, '1:22:30', 18),
(1, 3, 3, '1:22:45', 15),
(2, 2, 1, '1:30:12', 25),
(2, 5, 2, '1:30:30', 18),
(3, 1, 1, '1:40:05', 25),
(3, 4, 2, '1:40:22', 18),
(4, 1, 1, '1:25:10', 25),
(4, 3, 3, '1:26:00', 15),
(5, 5, 1, '1:35:12', 25);
