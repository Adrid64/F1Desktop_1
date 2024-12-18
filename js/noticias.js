class Noticias {
  constructor() {
    this.initEventListeners();
  }


  initEventListeners() {
    const inputArchivo = document.querySelector('input[type="file"]');
    const btnAgregarNoticia = document.getElementById("agregarNoticiaBtn");

    inputArchivo.addEventListener("change", (event) => {
      this.leerArchivoTexto(event.target.files);
    });

    btnAgregarNoticia.addEventListener("click", () => {
      const titular = document.getElementById("titularInput").value.trim();
      const entradilla = document.getElementById("entradillaInput").value.trim();
      const autor = document.getElementById("autorInput").value.trim();

      if (titular && entradilla && autor) {
        this.crearNoticiaHTML(titular, entradilla, autor);
      } else {
        alert("Por favor, completa todos los campos.");
      }
    });
  }

  
  leerArchivoTexto(files) {
    const archivo = files[0];
    if (!archivo) {
      alert("No se ha seleccionado ningún archivo.");
      return;
    }

    const tipoTexto = /text.*/;
    if (!archivo.type.match(tipoTexto)) {
      alert("Por favor, selecciona un archivo de texto válido (.txt).");
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      this.procesarContenido(lector.result);
    };
    lector.onerror = () => {
      alert("Hubo un error al leer el archivo.");
    };
    lector.readAsText(archivo);
  }

  /**
   * Procesa el contenido del archivo y crea noticias en el `<main>`.
   */
  procesarContenido(contenido) {
    const main = document.querySelector("main"); 

    const lineas = contenido.split("\n");
    lineas.forEach((linea) => {
      if (linea.trim()) {
        const partes = linea.split("_");
        if (partes.length === 3) {
          const [titular, entradilla, autor] = partes.map(item => item.trim());
          this.crearNoticiaHTML(titular, entradilla, autor, main);
        } else {
          console.log(`Línea incorrecta: ${linea}`);
        }
      }
    });
  }

  /**
   * Crea un artículo de noticia y lo agrega al `<main>`.
   */
  crearNoticiaHTML(titular, entradilla, autor, contenedor = document.querySelector("main")) {
    const articulo = document.createElement("article");
    articulo.innerHTML = `
      <header><h3>${titular}</h3></header>
      <p>${entradilla}</p>
      <footer>Escrito por: ${autor}</footer>
    `;

    contenedor.appendChild(articulo);
  }
}

new Noticias();
