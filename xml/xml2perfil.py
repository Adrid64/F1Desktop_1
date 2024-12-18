import xml.etree.ElementTree as ET

# Función para cargar datos del archivo XML
def cargar_datos_xml(nombre_archivo):
    tree = ET.parse(nombre_archivo)
    root = tree.getroot()
    namespace = {'ns': 'http://www.uniovi.es'}

    tramos = []
    for tramo in root.findall('ns:tramos/ns:tramo', namespace):
        distancia = float(tramo.attrib['distancia'])
        altitud = float(tramo.find('ns:coordenadasFinales/ns:altitud', namespace).text)
        tramos.append((distancia, altitud))

    return tramos

def generar_svg(tramos, nombre_archivo_svg):
    # Dimensiones del SVG
    ancho = 800
    alto = 400
    margen = 20

    max_distancia = sum([tramo[0] for tramo in tramos])
    max_altitud = max([tramo[1] for tramo in tramos])
    min_altitud = min([tramo[1] for tramo in tramos])

    escala_x = (ancho - 2 * margen) / max_distancia
    escala_y = (alto - 2 * margen) / (max_altitud - min_altitud)

    puntos = []
    distancia_acumulada = 0
    for distancia, altitud in tramos:
        x = margen + distancia_acumulada * escala_x
        y = alto - margen - (altitud - min_altitud) * escala_y
        puntos.append(f'{x},{y}')
        distancia_acumulada += distancia

    puntos.append(f'{margen + distancia_acumulada * escala_x},{alto - margen}')
    puntos.append(f'{margen},{alto - margen}')
    puntos_str = ' '.join(puntos)

    contenido_svg = f'''<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="{puntos_str}" fill="lightblue" stroke="black" stroke-width="2"/>
    </svg>'''

    with open(nombre_archivo_svg, 'w') as archivo_svg:
        archivo_svg.write(contenido_svg)

    print(f'Se ha generado el archivo SVG: {nombre_archivo_svg}')

def main():
    nombre_archivo_xml = 'circuitoEsquema.xml'
    tramos = cargar_datos_xml(nombre_archivo_xml)

    nombre_archivo_svg = 'altimetria.svg'
    generar_svg(tramos, nombre_archivo_svg)

if __name__ == '__main__':
    main()
