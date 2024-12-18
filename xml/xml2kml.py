import xml.etree.ElementTree as ET

class Kml:
    """
    Genera archivo KML con puntos y líneas
    @version 1.0 17/Noviembre/2023
    @autor: Juan Manuel Cueva Lovelle. Universidad de Oviedo
    """
    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, 'Document')
    
    def addPlacemark(self, nombre, descripcion, long_lat_alt, modo_altitud):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        ET.SubElement(pm, 'description').text = descripcion
        punto = ET.SubElement(pm, 'Point')
        ET.SubElement(punto, 'coordinates').text = long_lat_alt
        ET.SubElement(punto, 'altitudeMode').text = modo_altitud

    def addLineString(self, nombre, extrude, tesela, lista_coordenadas, modo_altitud, color, ancho):
        """
        Añade un elemento con líneas
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = extrude
        ET.SubElement(ls, 'tessellate').text = tesela
        ET.SubElement(ls, 'coordinates').text = lista_coordenadas
        ET.SubElement(ls, 'altitudeMode').text = modo_altitud
        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = color
        ET.SubElement(linea, 'width').text = ancho

    def escribir(self, nombre_archivo_kml):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        arbol.write(nombre_archivo_kml, encoding='utf-8', xml_declaration=True)

def xml_to_kml(xml_file, kml_file):
    # Parsear el archivo XML
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"Error al parsear el archivo XML: {e}")
        return
    except FileNotFoundError:
        print("El archivo XML no fue encontrado.")
        return

    # Definir el espacio de nombres
    ns = {'ns': 'http://www.uniovi.es'}

    # Crear objeto Kml
    kml = Kml()

    # Extraer información general del circuito
    try:
        nombre_circuito = root.find('ns:nombre', ns).text
        descripcion = f"{nombre_circuito} - {root.find('ns:localidad', ns).text}, {root.find('ns:pais', ns).text}"
    except AttributeError as e:
        print("Error al extraer información del circuito. Asegúrate de que los elementos existan.")
        print(e)
        return

    # Añadir puntos de coordenadas geográficas
    try:
        coordenadas = root.find('ns:coordenadasGeograficas', ns)
        long_lat_alt = f"{coordenadas.find('ns:longitud', ns).text},{coordenadas.find('ns:latitud', ns).text},{coordenadas.find('ns:altitud', ns).text}"
        kml.addPlacemark(nombre_circuito, descripcion, long_lat_alt, "absolute")
    except AttributeError as e:
        print("Error al extraer coordenadas geográficas.")
        print(e)
        return

    # Añadir tramos como LineString
    try:
        tramos = root.find('ns:tramos', ns)
        lista_coordenadas = ""
        for tramo in tramos.findall('ns:tramo', ns):
            coord_finales = tramo.find('ns:coordenadasFinales', ns)
            coord = f"{coord_finales.find('ns:longitud', ns).text},{coord_finales.find('ns:latitud', ns).text},{coord_finales.find('ns:altitud', ns).text}"
            lista_coordenadas += coord + " "

        kml.addLineString(nombre="Recorrido del Circuito", extrude="1", tesela="1",
                          lista_coordenadas=lista_coordenadas.strip(), modo_altitud="absolute",
                          color="ff0000ff", ancho="2")
    except AttributeError as e:
        print("Error al extraer los tramos.")
        print(e)
        return

    # Guardar el archivo KML
    kml.escribir(kml_file)
    print(f"Archivo {kml_file} generado con éxito.")

if __name__ == "__main__":
    # Archivos de entrada y salida
    xml_input = "circuitoEsquema.xml"
    kml_output = "circuito.kml"

    # Convertir XML a KML
    xml_to_kml(xml_input, kml_output)
