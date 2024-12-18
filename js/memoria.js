class Memoria {
    constructor() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.cartas = [
            { "id": 1, "nombre": "Elemento 1", "imagen": "multimedia/imagenes/imagen1.svg" },
            { "id": 2, "nombre": "Elemento 1", "imagen": "multimedia/imagenes/imagen1.svg" },
            { "id": 3, "nombre": "Elemento 2", "imagen": "multimedia/imagenes/imagen2.svg" },
            { "id": 4, "nombre": "Elemento 2", "imagen": "multimedia/imagenes/imagen2.svg" },
            { "id": 5, "nombre": "Elemento 3", "imagen": "multimedia/imagenes/imagen3.svg" },
            { "id": 6, "nombre": "Elemento 3", "imagen": "multimedia/imagenes/imagen3.svg" },
            { "id": 7, "nombre": "Elemento 4", "imagen": "multimedia/imagenes/imagen4.svg" },
            { "id": 8, "nombre": "Elemento 4", "imagen": "multimedia/imagenes/imagen4.svg" },
            { "id": 9, "nombre": "Elemento 5", "imagen": "multimedia/imagenes/imagen5.svg" },
            { "id": 10, "nombre": "Elemento 5", "imagen": "multimedia/imagenes/imagen5.svg" },
            { "id": 11, "nombre": "Elemento 6", "imagen": "multimedia/imagenes/imagen6.svg" },
            { "id": 12, "nombre": "Elemento 6", "imagen": "multimedia/imagenes/imagen6.svg" }
        ];
        this.shuffleElements();
        this.createElements();
        this.addEventListeners();
    }

    shuffleElements() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); 
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]]; 
        }
    }

    // Crear los elementos HTML de cada tarjeta
    createElements() {
        const section = document.createElement('section');
        section.classList.add('memoria-section');

        this.cartas.forEach((carta) => {
            const article = document.createElement('article');
            article.classList.add('memoria-card');
            article.setAttribute('data-element', carta.nombre);

            const h3 = document.createElement('h3');
            h3.textContent = "Tarjeta de memoria";

            const img = document.createElement('img');
            img.src = carta.imagen;
            img.alt = carta.nombre;
            img.classList.add('hidden'); 

            article.appendChild(h3);
            article.appendChild(img);
            section.appendChild(article);
        });

        document.body.appendChild(section); 
    }


    addEventListeners() {
        const cards = document.querySelectorAll('.memoria-card');

        cards.forEach(card => {
            card.addEventListener('click', this.flipCard.bind(this, card)); 
        });
    }

    // Método para voltear la tarjeta
    flipCard(card) {
        // Comprobaciones
        if (this.lockBoard || card.classList.contains('flip')) return; 
        if (card === this.firstCard) return; 

  
        card.classList.add('flip'); 

  
        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true;       
            this.firstCard = card;           
            return;
        }

        this.secondCard = card; 
        this.checkForMatch();    
    }

    setCardsAsMatched() {
        this.firstCard.classList.add('revealed');
        this.secondCard.classList.add('revealed');

        this.firstCard.removeEventListener('click', this.flipCard);
        this.secondCard.removeEventListener('click', this.flipCard);

        this.resetBoard();
    }

    checkForMatch() {
        const isMatch = this.firstCard.dataset.element === this.secondCard.dataset.element;

        if (isMatch) {
            this.setCardsAsMatched();
        } else {
            this.unflipCards();
        }
    }

    unflipCards() {
        this.lockBoard = true;
        setTimeout(() => {
            this.firstCard.classList.remove('flip');
            this.secondCard.classList.remove('flip');
            this.resetBoard();
        }, 1500);
    }

    resetBoard() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
    }
}

const memoria = new Memoria();
