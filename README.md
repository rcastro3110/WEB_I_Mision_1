# Buscaminas/MineSweeper

Misión M1 · El Despertar del DOM — Web Development I.

## Cómo probarlo
Abre MineSweeper.html en el navegador (o con Live Server). Elige dificultad
(Easy/Medium/Hard) o pulsa "Custom" para definir filas, columnas y
minas a mano. El clic izquierdo revela una casilla y el clic derecho pone o
quita una bandera. Tecla secreta: pulsa "b" para el modo claro.

## Uso de IA
Usé Claude como pareja ded programación, fase a fase
Ejemplos de promt real: 
"Voy a construir buscaminas con HTML, CSS y JavaScript puro, sin frameworks ni librerías. Antes de escribir código: propón 4 o 5 fases pequeñas para construirlo, cada una con algo visible funcionando al terminarla, y dime qué estado necesito guardar en JavaScript y por qué. No escribas todavía ningún archivo."
"Como deberia de empezar el js, lo quiero hacer yo aqi que dime pasos, no escribas nada de codigo"
Una vez tenia hecho el html y el css, para comprobar que el JS iba funcionando probaba cada cosa implementada, probando todo tipo de inputs para arreglar los bugs (clic en casillas ya clicadas, clic con la partida terminada, clic sobre casillas con banderas, terminar sin marcar todas las minas, etc...)
Escribí a mano: Las subfunciones de revelarCelda (ganarJuego(), perderJuego()). Con la ayuda de Claude para las otras funciones estas dos fueron sencillas de sacar. El resto fueron mas seguir los pasos de Claude, mostrarle mi intento y que me corrigiera lo que faltaba. En algunos casos estaba cerca de sacarlo y en otros muy lejos pero le pedia a Claude que me lo explicara.

## Autopsia
1. Cada celda es un objeto ("hasMine", "adjacentMines", "isRevealed",
   "isFlagged") dentro de un array 2D, en vez de varios arrays paralelos
   o un bitmask. Para un tablero de come mucho unos cientos de celdas el
   rendimiento no es un problema real con ninguna opción; los objetos
   ganan porque agrupan todo lo de una celda en un solo sitio y evitan
   el bug típico de actualizar un array paralelo y olvidarte de otro.

2. Las minas se colocan con "intenta y comprueba" (coordenada aleatoria,
   si ya tiene mina se descarta y se prueba otra) en vez de barajar una
   lista completa de posiciones (Fisher-Yates). Descarté la segunda
   porque añade un algoritmo nuevo que aprender sin ninguna ventaja real
   de rendimiento a esta escala, la diferencia solo importaría con
   tableros mucho más grandes.

3. Un solo listener de "click" y otro de "contextmenu" en el contenedor
   del tablero (delegación de eventos), leyendo "data-fila"/"data-columna"
   del "event.target", en vez de un listener por celda. Necesario además
   porque el tablero se destruye y se repinta entero al reiniciar o
   cambiar de dificultad/tamaño, con un listener por celda habría que
   volver a engancharlos todos cada vez.
   
4. El flood fill es recursivo: "revelarCelda" se llama a sí misma sobre
   las vecinas de una celda con 0 minas alrededor, y la recursión
   termina sola porque cada llamada nueva topa con celdas ya reveladas
   o con número > 0. Con el tamaño máximo del juego (30×30 = 900
   celdas) el peor caso son unos cientos de llamadas anidadas, muy por
   debajo del límite de pila típico de un navegador, asi que para este 
   proyecto no hace falta pasar a una versión iterativa a este tamaño.