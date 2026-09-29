const tablero = document.getElementById("tablero");
const contadorMinas = document.getElementById("contadorMinas");
const cronometro = document.getElementById("cronometro");
const botonReiniciar = document.getElementById("reiniciar");
const botonDificultad = document.getElementById("dificultad");
const mensaje = document.getElementById("mensaje");
const botonPersonalizadoToggle = document.getElementById("botonPersonalizadoToggle");
const personalizadoDiv = document.getElementById("personalizado");
const inputFilas = document.getElementById("inputFilas");
const inputColumnas = document.getElementById("inputColumnas");
const inputMinas = document.getElementById("inputMinas");
const botonPersonalizado = document.getElementById("botonPersonalizado");

let FILAS = 9;
let COLUMNAS = 9;
let N_MINAS = 10;
let BANDERAS_PUESTAS = 0;
let CELDAS_REVELADAS = 0;

let tableroDatos = [];
let estadoJuego = "jugando"; // 'jugando' | 'ganado' | 'perdido'
let segundos = 0;
let intervaloId = null;
let tiempoIniciado = false;

function iniciarJuego(){
    tableroDatos = [];

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

    resetCronometro();
    colocarMinas();
    calcularAdyacentes();
    pintarTablero();
}

function colocarMinas(){
    let i = N_MINAS;
    while(i > 0){
        let filaRand = Math.floor(Math.random() * FILAS);
        let columnaRand = Math.floor(Math.random() * COLUMNAS);

        if(!tableroDatos[filaRand][columnaRand].hasMine){
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
    while(tablero.firstChild){
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

function revelarCelda(fila, columna){
    if(estadoJuego !== "jugando") return;

    const celda = tableroDatos[fila][columna];

    if(celda.isRevealed || celda.isFlagged) return;

    iniciarCronometro();

    celda.isRevealed = true;

    const div = document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);
    div.classList.add("revelada");

    if(celda.hasMine){
        div.textContent = "💣";
        perderJuego(); 
        return;
    }

    CELDAS_REVELADAS++;

    if(celda.adjacentMines > 0){
        div.textContent = celda.adjacentMines;
    } else {
        // Flood fill: revelamos automáticamente las 8 vecinas
        for(let df = -1; df <= 1; df++){
            for(let dc = -1; dc <= 1; dc++){
                if(df === 0 && dc === 0) continue;

                const filaVecina = fila + df;
                const colVecina = columna + dc;

                if(filaVecina >= 0 && filaVecina < FILAS && colVecina >= 0 && colVecina < COLUMNAS){
                    revelarCelda(filaVecina, colVecina); // llamada recursiva
                }
            }
        }
    }

    if(CELDAS_REVELADAS === ((FILAS * COLUMNAS)-N_MINAS)){
        ganarJuego();
    }
}

function perderJuego(){
    estadoJuego = "perdido";
    mensaje.textContent = "💥💥💥💥 GAME OVER 💥💥💥💥";
    pararCronometro();

    // Revelamos todas las minas del tablero, aunque el jugador no las haya clicado
    for(let f = 0; f < FILAS; f++){
        for(let c = 0; c < COLUMNAS; c++){
            const celda = tableroDatos[f][c];
            if(celda.hasMine){
                const div = document.querySelector(`[data-fila="${f}"][data-columna="${c}"]`);
                div.classList.add("revelada");
                div.textContent = "💣";
            }
        }
    }
}

function marcarCelda(fila, columna){
    if(estadoJuego !== "jugando") return;

    const celda = tableroDatos[fila][columna];
    if(celda.isRevealed) return;

    const div = document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);

    if(!celda.isFlagged){
        if(BANDERAS_PUESTAS < N_MINAS){
            celda.isFlagged = true;
            div.textContent = "🚩";
            BANDERAS_PUESTAS++;
        }
    } else {
        celda.isFlagged = false;
        div.textContent = "";
        BANDERAS_PUESTAS--;
    }
    contadorMinas.textContent = `🚩 ${N_MINAS - BANDERAS_PUESTAS}`;
}

function ganarJuego(){
    estadoJuego = "ganado";
    mensaje.textContent = "VICTORY";
    contadorMinas.textContent = "🚩 0";
    pararCronometro();

    // Marcamos visualmente las minas que quedaban sin bandera
    for(let f = 0; f < FILAS; f++){
        for(let c = 0; c < COLUMNAS; c++){
            const celda = tableroDatos[f][c];
            if(celda.hasMine){
                const div = document.querySelector(`[data-fila="${f}"][data-columna="${c}"]`);
                div.classList.add("revelada");
                div.textContent = "🚩";
            }
        }
    }
}

function reiniciarJuego() {
  // 1. Resetear variables de estado a sus valores iniciales
  estadoJuego = "jugando";
  BANDERAS_PUESTAS = 0;
  CELDAS_REVELADAS = 0;

  // 2. Limpiar textos en pantalla
  mensaje.textContent = "";
  contadorMinas.textContent = `🚩 ${N_MINAS}`;

  // 3. Montar la partida de nuevo
  iniciarJuego();
}

function iniciarCronometro(){
    if(tiempoIniciado) return;

    tiempoIniciado = true;

    intervaloId = setInterval(function(){
        if(segundos < 999) segundos++;
        cronometro.textContent = String(segundos).padStart(3, "0");
    }, 1000);
}

function pararCronometro(){
    clearInterval(intervaloId);
}

function resetCronometro(){
    pararCronometro();
    segundos = 0;
    tiempoIniciado = false;
    cronometro.textContent = "000";
}

tablero.addEventListener("click", function(event){
    if(!event.target.classList.contains("celda")) return;
    
    const fila = Number(event.target.dataset.fila);
    const columna = Number(event.target.dataset.columna);

    revelarCelda(fila, columna);
});

tablero.addEventListener("contextmenu", function(event){
    event.preventDefault();

    if(!event.target.classList.contains("celda")) return;
    
    const fila = Number(event.target.dataset.fila);
    const columna = Number(event.target.dataset.columna);

    marcarCelda(fila, columna);
});

botonReiniciar.addEventListener("click", ()=>{
    reiniciarJuego();
});

botonDificultad.addEventListener("click", function(event){
    if(!(event.target.tagName === "BUTTON")) return;
    if(!event.target.dataset.tamanio) return; // nuevo: ignora botones sin data-tamanio

    FILAS = Number(event.target.dataset.tamanio);
    COLUMNAS = Number(event.target.dataset.tamanio);
    N_MINAS = Number(event.target.dataset.minas);

    reiniciarJuego();
});

botonPersonalizadoToggle.addEventListener("click", function(){
    personalizadoDiv.classList.toggle("oculto");
});

botonPersonalizado.addEventListener("click", function(){
    const filas = Number(inputFilas.value);
    const columnas = Number(inputColumnas.value);
    const minas = Number(inputMinas.value);

    if(!Number.isInteger(filas) || filas < 5 || filas > 30){
        mensaje.textContent = "Filas inválidas (5-30)";
        return;
    }

    if(!Number.isInteger(columnas) || columnas < 5 || columnas > 30){
        mensaje.textContent = "Columnas inválidas (5-30)";
        return;
    }

    if(!Number.isInteger(minas) || minas < 1 || minas >= filas * columnas){
        mensaje.textContent = "Número de minas inválido";
        return;
    }

    FILAS = filas;
    COLUMNAS = columnas;
    N_MINAS = minas;

    reiniciarJuego();
});

iniciarJuego();