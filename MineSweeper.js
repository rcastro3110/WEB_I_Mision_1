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

let filas = 9;
let columnas = 9;
let nMinas = 10;
let celdasMarcadas = 0;
let celdasReveladas = 0;

let tableroDatos = [];
let estadoJuego = "jugando"; // 'jugando' | 'ganado' | 'perdido'
let segundos = 0;
let intervaloId = null;
let tiempoIniciado = false;

function iniciarJuego(){
    tableroDatos = [];

    //Crear tablero
    for(let i = 0; i < filas; i++){
        let fila = [];
        for(let j = 0; j < columnas; j++){
            fila.push({
                hasMine: false,
                adjacentMines:0,
                isRevealed: false,
                isFlagged: false,
                elemento: null
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
    let i = nMinas;
    while(i > 0){
        let filaRand = Math.floor(Math.random() * filas);
        let columnaRand = Math.floor(Math.random() * columnas);

        if(!tableroDatos[filaRand][columnaRand].hasMine){
            tableroDatos[filaRand][columnaRand].hasMine = true;
            i--;
        }        
    }  
}

function calcularAdyacentes(){
  for(let f = 0; f < filas; f++){
    for(let c = 0; c < columnas; c++){
        const celda = tableroDatos[f][c];

        if(celda.hasMine) continue; // si tiene mina, no calculamos nada, pasamos a la siguiente

        let contador = 0;

        const vecinos = vecinosDe(f,c);
        for(const v of vecinos){
            const celdaVecina = tableroDatos[v.fila][v.columna];
            if(celdaVecina.hasMine){
                contador++;
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

    tablero.style.setProperty("--cols", columnas);

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            const div = document.createElement("div");
            div.classList.add("celda");
            div.dataset.fila = f;
            div.dataset.columna = c;

            tablero.appendChild(div);
            tableroDatos[f][c].elemento = div;
        }
    }
}

function revelarCelda(fila, columna){
    if(estadoJuego !== "jugando") return;

    const celda = tableroDatos[fila][columna];

    if(celda.isRevealed || celda.isFlagged) return;

    iniciarCronometro();

    celda.isRevealed = true;

    const div = celda.elemento;
    div.classList.add("revelada");

    if(celda.hasMine){
        div.textContent = "💣";
        perderJuego(); 
        return;
    }

    celdasReveladas++;

    if(celda.adjacentMines > 0){
        div.textContent = celda.adjacentMines;
    } else {
        // Flood fill: revelamos automáticamente las 8 vecinas
        const vecinos = vecinosDe(fila, columna);

        for(const v of vecinos){
            revelarCelda(v.fila, v.columna);
        }
    }
        
    if(celdasReveladas === ((filas * columnas)-nMinas)){
        ganarJuego();
    }
}

function vecinosDe(fila, columna){
    const vecinos = [];

    for(let df = -1; df <= 1; df++){
        for(let dc = -1; dc <= 1; dc++){
            if(df === 0 && dc === 0) continue;

            const filaVecina = fila + df;
            const colVecina = columna + dc;

            if(filaVecina >= 0 && filaVecina < filas && colVecina >= 0 && colVecina < columnas){
                vecinos.push({ fila: filaVecina, columna: colVecina });
            }
        }
    }

    return vecinos;
}

function perderJuego(){
    estadoJuego = "perdido";
    mensaje.textContent = "💥💥💥💥 GAME OVER 💥💥💥💥";
    pararCronometro();

    // Revelamos todas las minas del tablero, aunque el jugador no las haya clicado
    revelarTodasLasMinas("💣");
}

function marcarCelda(fila, columna){
    if(estadoJuego !== "jugando") return;

    const celda = tableroDatos[fila][columna];
    if(celda.isRevealed) return;

    const div = celda.elemento;

    if(!celda.isFlagged){
        if(celdasMarcadas < nMinas){
            celda.isFlagged = true;
            div.textContent = "🚩";
            celdasMarcadas++;
        }
    } else {
        celda.isFlagged = false;
        div.textContent = "";
        celdasMarcadas--;
    }
    contadorMinas.textContent = `🚩 ${nMinas - celdasMarcadas}`;
}

function ganarJuego(){
    estadoJuego = "ganado";
    mensaje.textContent = "VICTORY";
    contadorMinas.textContent = "🚩 0";
    pararCronometro();

    // Marcamos visualmente las minas que quedaban sin bandera
    revelarTodasLasMinas("🚩");
}

//Refactorizada ya que es el mismo codigo para ganar como para perder
function revelarTodasLasMinas(emoji){
    for(let f = 0; f < filas; f++){
        for(let c = 0; c < columnas; c++){
            const celda = tableroDatos[f][c];
            if(celda.hasMine){
                const div = celda.elemento;
                div.classList.add("revelada");
                div.textContent = emoji;
            }
        }
    }
}

function reiniciarJuego() {
  // 1. Resetear variables de estado a sus valores iniciales
  estadoJuego = "jugando";
  celdasMarcadas = 0;
  celdasReveladas = 0;

  // 2. Limpiar textos en pantalla
  mensaje.textContent = "";
  contadorMinas.textContent = `🚩 ${nMinas}`;

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
    
    filas = Number(event.target.dataset.tamanio);
    columnas = Number(event.target.dataset.tamanio);
    nMinas = Number(event.target.dataset.minas);

    reiniciarJuego();
});

botonPersonalizadoToggle.addEventListener("click", function(){
    personalizadoDiv.classList.toggle("oculto");
});

botonPersonalizado.addEventListener("click", function(){
    const nuevasFilas = Number(inputFilas.value);
    const nuevasColumnas = Number(inputColumnas.value);
    const nuevasMinas = Number(inputMinas.value);

    if(!Number.isInteger(nuevasFilas) || nuevasFilas < 5 || nuevasFilas > 30){
        mensaje.textContent = "Filas inválidas (5-30)";
        return;
    }

    if(!Number.isInteger(nuevasColumnas) || nuevasColumnas < 5 || nuevasColumnas > 30){
        mensaje.textContent = "Columnas inválidas (5-30)";
        return;
    }

    if(!Number.isInteger(nuevasMinas) || nuevasMinas < 1 || nuevasMinas >= nuevasFilas * nuevasColumnas){
        mensaje.textContent = "Número de minas inválido";
        return;
    }

    filas = nuevasFilas;
    columnas = nuevasColumnas;
    nMinas = nuevasMinas;

    reiniciarJuego();
});

document.addEventListener("keydown", function(event){
    if(event.key === "b"){
        document.body.classList.toggle("oscuro");
    }
})

iniciarJuego();