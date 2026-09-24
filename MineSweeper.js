const tablero = document.getElementById("tablero");
const contadorMinas = document.getElementById("contadorMinas");
const cronometro = document.getElementById("cronometro");
const botonReiniciar = document.getElementById("reiniciar");
const mensaje = document.getElementById("mensaje");

let FILAS = 9;
let COLUMNAS = 9;
let N_MINAS = 10;

let tableroDatos = [];

//Crear tablero
for(let i = 0; i < FILAS; i++){
    let fila = [];
    for(let j = 0; j < COLUMNAS; j++){
        fila.push({
            hasMine: false,
            adjacentMines:0,
            isRevealed: false,
            isFlagged: false
        });
    }
    tableroDatos.push(fila);
}

function colocarMinas(){
    let i = N_MINAS;
    while(i > 0){
        let filaRand = Math.floor(Math.random() * FILAS);
        let columnaRand = Math.floor(Math.random() * COLUMNAS);

        if(tableroDatos[filaRand][columnaRand].hasMine == false){
            tableroDatos[filaRand][columnaRand].hasMine = true;
            i--;
        }        
    }  
}

function calcularAdyacentes(){
  for(let f = 0; f < FILAS; f++){
    for(let c = 0; c < COLUMNAS; c++){
        const celda = tableroDatos[f][c];

        if(celda.hasMine) continue; // si tiene mina, no calculamos nada, pasamos a la siguiente

        let contador = 0;

        for(let df = -1; df <= 1; df++){
            for(let dc = -1; dc <= 1; dc++){
                if(df === 0 && dc === 0) continue;

                let filaVecina = f + df;
                let colVecina = c + dc;
                
                if(filaVecina >= 0 && filaVecina <= (FILAS - 1) && colVecina >= 0 && colVecina <= (COLUMNAS - 1)){
                    const celdaVecina = tableroDatos[filaVecina][colVecina];
                    if(celdaVecina.hasMine === true){
                        contador++;
                    }
                }
            }
        }
        celda.adjacentMines = contador;
    }
  }
}

function pintarTablero() {
    //Limpia el div de tablero
    while (tablero.firstChild){
        tablero.removeChild(tablero.firstChild);
    }

    tablero.style.setProperty("--cols", COLUMNAS);

    for (let f = 0; f < FILAS; f++) {
        for (let c = 0; c < COLUMNAS; c++) {
            const div = document.createElement("div");
            div.classList.add("celda");
            div.dataset.fila = f;
            div.dataset.columna = c;

            tablero.appendChild(div);
        }
    }
}

function imprimirTablero() {
  for (let f = 0; f < FILAS; f++) {
    let filaTexto = "";

    for (let c = 0; c < COLUMNAS; c++) {
      const celda = tableroDatos[f][c];

      if (celda.hasMine) {
        filaTexto += "* ";
      } else {
        filaTexto += celda.adjacentMines + " ";
      }
    }

    console.log(filaTexto);
  }
}