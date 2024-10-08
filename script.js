class PlayerHuman {
    constructor(symbol) {
        this.symbol = symbol;
        this.human = true;
    }
}

class PlayerRandom {
    constructor(symbol) {
        this.symbol = symbol;
        this.human = false;
    }

    playing(board) {
        let row = this.#random(1, board.length);
        let column = this.#random(1, board.length);
        return new Gaming(row,column)
    }

    #random(min,max) {
        let value = Math.random() * (max - min) + min;
        return Math.round(value);
    }
}

class Gaming {
    constructor(row, column) {
        this.row = row;
        this.column = column;
    }

    get validPlay() {
        return this.row >= 0 && this.column >= 0
    }
    get nonValidPlay() {
        return (!this.validPlay);
    }
    
}

class Game {

    constructor(player1 = new PlayerHuman('X'), 
                player2 = new PlayerHuman ('O'),
                size = 3) {
                    this.player1 = player1;
                    this.player2 = player2;
                    this.size = size;
                    this.finish();         
                }

    #startBoard() {
        return Array(this.size).fill(0)
        .map(() => Array(this.size).fill(null))
    }

    gamer(gaming) {
        if(this.currentPlayer.human){
            this.#processGame(gaming);
        }
        while(!this.winner && !this.currentPlayer.human) {
            let playingRandom = this.currentPlayer.playing(this.board)
            this.#processGame(playingRandom);
        }
          
    }

    #processGame(gaming){
        if(!this.#validGame(gaming)) return;
        this.#add(gaming)
            if(this.#wonVictory(gaming)) {
                this.winner = this.currentPlayer.symbol;
            } else if(this.#tiedGame()) {
                this.winner = "-";
                return
            }
            this.#changePlayer();
    }

    #tiedGame() {
        let blankSpace = this.board
        .flat().filter((field => field === null));
        return blankSpace.length === 0;
    }

    #wonVictory(gaming) {
        let {row,column} = gaming;
        let {board, currentPlayer} = this;
        let sizeBoard = board.length;
        let index = Array(sizeBoard)
        .fill(0)
        .map((_,i) => i + 1)

        let wonRow = index.every(
            (i) => this.#blank(row, i) === currentPlayer.symbol);

        let wonColumn = index.every(
            (i) => this.#blank(i, column) === currentPlayer.symbol);
        
        let wonDiagonal1 = index.every(
            (i) => this.#blank(i,i) === currentPlayer.symbol);
        
        let wonDiagonal2 = index.every(
            (i) => this.#blank(sizeBoard - i+ 1, i) === currentPlayer.symbol);
        
        return wonRow || wonColumn || wonDiagonal1 || wonDiagonal2
    }

    finish() {
        this.board = this.#startBoard()
        this.currentPlayer = this.player1
        this.winner = null
    }

    toString() {
        let matrix = this.board
            .map(row => row.map(position => position ?? "-")
            .join(" ")).join("\n")
        let whoIsWinner = this.winner ? `Winner is: ${this.winner}` : ""
        return `${matrix} \n ${whoIsWinner}`
        
    }
    // Going through a few validation, if passes it will return true and the move is valid
    #validGame(gaming) {
        if(gaming.nonValidPlay) {
            return false;
        }
        let {row,column} = gaming;
        if(row > this.size || column > this.size) {
            return false;
        }
        if(this.#notAvailable(gaming)) {
            return false;
        }
        if(this.winner) {
            return false;
        }
        return true;
    }

    #notAvailable(gaming) {
        let {row,column} = gaming;
        return this.#blank(row,column) !== null;
    } 

    #blank(row,column) {
        return this.board[row-1][column-1];
    }

    #changePlayer() {
        this.currentPlayer =
            this.currentPlayer.symbol === this.player1.symbol 
                ? this.player2 
                : this.player1
    }

    #add(gaming) {
        let {row, column} = gaming;
        this.board[row-1][column-1] = this.currentPlayer.symbol;
    }
    status(){
        if(this.winner === "-") {
            return "Draw!"
        } else if( this.winner) {
            return `${this.winner} won!`
        } else {
            return `Now is ${this.currentPlayer.symbol} turn!`
        }
    }

}

class NougthCrossesDOM{
    constructor(board,information) {
        this.board = board;
        this.information = information;
    }
    start(game) {
        this.game = game
        this.#createBoard();
        this.#allowBoardToPlay();
    }
    #allowBoardToPlay() {
        const positions = this.board.getElementsByClassName("position")
        for( let position of positions) {
            position.addEventListener("click", (e) => {
                if(this.game.winner) {return};
                let positionSelected = e.target.attributes;
                let row = +positionSelected.row.value;
                let column = +positionSelected.column.value;
                // console.log(`cliquei e ${row} com ${column}`)
                this.game.gamer(new Gaming(row,column));
                this.information.innerText = this.game.status();
                // console.log(this.game.toString());
                this.#printSymbols();
            })
        }   
    }
    #printSymbols() {
        let {board} = this.game;
        let manyRows = board.length;
        let manyColumns = board[0].length;
        let positions = this.board.getElementsByClassName("position")
        for(let row = 0; row < manyRows; row++) {
            for(let column = 0; column < manyColumns; column++) {
                let indexInterface = row * manyRows + column;
                // 1  2 -> 1 {0 1 = 1}
                // 2  3 -> 5 {1 2 -> 5}
                positions[indexInterface].innerText = board[row][column]
            }
        }
    }

    #createBoard() {
        const size = this.game.size;
        let position = [];
        for(let row = 1; row <= size; row++){
            const columns = this.#createRowBoard(row,size);
            position.push(... columns)
        }
        this.board.innerHTML = position.join("");
        this.board.style.gridTemplateColumns = `repeat(${size},1fr)`;

    }
    #createRowBoard(row,size) {
        let columns = []
        for(let columnn = 1; columnn <= size; columnn++) {
            let classes = "position ";
            if(row === 1) {
                classes += "position-upper "
            } else if(row === size) {
                classes += "position-lower "
            } 
            
            if(columnn === 1){
                classes+= "position-left "
            } else if(columnn === size) {
                classes += "position-right "
            }

            const element = `<div class="${classes}" row=${row} column=${columnn}> </div>`
            columns.push(element);
        }
        return columns;
        
    }

    reset() {
        this.game.finish();
        let positions = document.getElementsByClassName("position");
        Array.from(positions).forEach(position => position.innerText='');
        this.information.innerText = this.game.status();
    }
}

(function () {
    const startButton = document.getElementById("buttonStart");
    const information = document.getElementById("info");
    const board = document.getElementById("board");
    const inputSize = document.getElementById("size");

    const newGame = (size) => {
        const game = new Game(new PlayerHuman("X"), new PlayerRandom("0"), size);
        return game;
    }
    

    const gameDOM = new NougthCrossesDOM(board, information);
    gameDOM.start(newGame())

    inputSize.addEventListener("input", () => {
        let size = +inputSize.value;
        gameDOM.start(newGame(size))
    })

    startButton.addEventListener("click", () => {
        gameDOM.reset();
    })
}) ()
