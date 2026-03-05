var numSelected = null;
var tileSelected = null;
var errors = 0;
var maxErrors = 5; // Numărul maxim de greșeli permise
var isGameComplete = false;

var seconds = 0; // Inițializăm secunde pentru timer
var timerInterval; // Intervalul pentru timer

var board = [
    "--7--16-5",
    "2---6-3-9",
    "-----7-1-",
    "-586----4",
    "--3----9-",
    "--62----7",
    "9-4-7---2",
    "67-83--4-",
    "81---5---"
];

var solution = [
    "387491625",
    "241568379",
    "569327418",
    "758619234",
    "123784596",
    "496253187",
    "934176852",
    "675832941",
    "812945763"
];

window.onload = function() {
    shuffleLayout(); // Amestecăm blocurile de rânduri și coloane
    permuteBoard();  // Permutăm cifrele între ele
    setGame();       // Generăm tabla
    startTimer();    // Pornim cronometrul
}

// FUNCȚII PENTRU AMESTECAREA LAYOUT-ULUI 
function shuffleLayout() {
    for (let block = 0; block < 3; block++) {
        let r1 = block * 3 + Math.floor(Math.random() * 3);
        let r2 = block * 3 + Math.floor(Math.random() * 3);
        swapRows(r1, r2);

        let c1 = block * 3 + Math.floor(Math.random() * 3);
        let c2 = block * 3 + Math.floor(Math.random() * 3);
        swapCols(c1, c2);
    }
}

function swapRows(row1, row2) {
    let tempBoard = board[row1];
    board[row1] = board[row2];
    board[row2] = tempBoard;

    let tempSolution = solution[row1];
    solution[row1] = solution[row2];
    solution[row2] = tempSolution;
}

function swapCols(col1, col2) {
    for (let r = 0; r < 9; r++) {
        let rowArr = board[r].split("");
        let temp = rowArr[col1];
        rowArr[col1] = rowArr[col2];
        rowArr[col2] = temp;
        board[r] = rowArr.join("");

        let solArr = solution[r].split("");
        let tempSol = solArr[col1];
        solArr[col1] = solArr[col2];
        solArr[col2] = tempSol;
        solution[r] = solArr.join("");
    }
}

// FUNCȚII PENTRU PERMUTAREA CIFRELOR 
function permuteBoard() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(numbers);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== "-") {
                let originalValue = parseInt(board[r][c]);
                board[r][c] = numbers[originalValue - 1]; 
            }
            if (solution[r][c] !== "-") {
                let originalValueSolution = parseInt(solution[r][c]);
                solution[r][c] = numbers[originalValueSolution - 1]; 
            }
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}

// LOGICA JOCULUI ȘI GENERAREA TABLEI 
function setGame() {
    // Generăm cifrele de jos (1-9)
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    // Generăm tabla 9x9
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            
            if (board[r][c] != "-") {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }

            // ADAUGĂM LINIILE GROASE PENTRU CELE 9 PĂTRATE
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }

            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

function selectNumber() {
    if (numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}

function selectTile() {
    if (numSelected && !isGameComplete) {
        if (this.innerText != "") {
            return;
        }

        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        // CÂND CIFRA ESTE CORECTĂ
        if (solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id;

            document.body.classList.add("correct-background");
            
            // TIMPUL REDUS LA 0.3 SECUNDE PENTRU EFECT (300 ms)
            setTimeout(() => {
                document.body.classList.remove("correct-background");
            }, 1000);

            checkGameComplete(); 
        } 
        // CÂND CIFRA ESTE GREȘITĂ
        else {
            errors += 1;
            document.getElementById("errors").innerText = "Numărul de greșeli: " + errors;

            let message = document.createElement("div");
            message.id = "try-again";
            message.innerText = "mai încearcă";
            message.classList.add("error-message");
            document.body.appendChild(message);

            let rect = this.getBoundingClientRect();
            message.style.position = "absolute";
            message.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
            message.style.top = `${rect.top + window.scrollY - 30}px`; 

            // Mesajul "mai încearcă" dispare după 1 secundă
            setTimeout(() => {
                let msgElement = document.getElementById("try-again");
                if(msgElement) msgElement.remove();
            }, 1000);

            if (errors >= maxErrors) {
                endGame(); 
            }
        }
    }
}

function checkGameComplete() {
    let tiles = document.querySelectorAll("#board .tile");
    let allFilledCorrectly = Array.from(tiles).every(tile => {
        let coords = tile.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        return tile.innerText == solution[r][c];
    });

    if (allFilledCorrectly) {
        isGameComplete = true;
        displayCelebration(); 
    }
}

function displayCelebration() {
    clearInterval(timerInterval); 

    let message = document.createElement("div");
    message.innerText = "🎉 Felicitări! Ai rezolvat Sudoku-ul cu succes! 🎉";
    message.classList.add("celebration-message");
    
    message.style.position = "fixed";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.backgroundColor = "#4CAF50";
    message.style.color = "white";
    message.style.padding = "20px 40px";
    message.style.fontSize = "24px";
    message.style.borderRadius = "10px";
    message.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.3)";
    message.style.zIndex = "1000";
    
    document.body.appendChild(message);
}

function endGame() {
    isGameComplete = true; 
    clearInterval(timerInterval); 

    let message = document.createElement("div");
    message.innerText = "❌ Joc încheiat! Ai făcut 5 greșeli. Dă refresh pentru a încerca din nou.";
    message.classList.add("end-game-message");
    
    message.style.position = "fixed";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.backgroundColor = "#f44336";
    message.style.color = "white";
    message.style.padding = "20px 40px";
    message.style.fontSize = "24px";
    message.style.borderRadius = "10px";
    message.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.3)";
    message.style.zIndex = "1000";

    document.body.appendChild(message);

    let tiles = document.querySelectorAll(".tile");
    tiles.forEach(tile => tile.removeEventListener("click", selectTile));

    let numbers = document.querySelectorAll(".number");
    numbers.forEach(number => number.removeEventListener("click", selectNumber));
}


function startTimer() {
    timerInterval = setInterval(function() {
        seconds += 1;
        displayTime();
    }, 1000);
}

function displayTime() {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    document.getElementById("timer").innerText = `Timp: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
}