const readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);

//The Connect Four View 
class ConnectView {
    constructor (boardSize) {
        this.boardSize = boardSize; //The printed board is X by X size, where X is the initial boardSide given by the user.
    }

    //This method takes in data from the Model and prints it into the console. 
    display = (data) => {
        const boardSizeStr = boardSize + "";
        let boardDisplayString = " " + this.addSpace("", boardSizeStr) + "| ";
        for (let i = 0; i < this.boardSize; i++) {
            boardDisplayString += this.addSpace(i + "", boardSizeStr) + "| "
        }
        const dividerLength = boardDisplayString.length;
        let dash = "";
        for (let i = 0; i < dividerLength; i++) {
            dash += "-";
        }
        boardDisplayString += "\n" + dash + "\n ";
        for (let i = 0; i < this.boardSize; i++) {
            boardDisplayString += this.addSpace(i + "", boardSizeStr) + "| ";
            for (let j = 0; j < this.boardSize; j++) {
                boardDisplayString += this.addSpace(data.board[i][j], boardSizeStr) + "| ";
            }
            boardDisplayString += "\n" + dash + "\n ";
        }
        console.log(boardDisplayString);
    }

    //This method adds padding to cells to keep row/column alignment when row/column heading numbers get to double or triple digits. 
    addSpace = (current, target) => {
        while (current.length <= target.length) {
            current += " ";
        }
        return current;
    }

    //This method checks if the user-provided coordinate pair is within bounds
    isWithinBounds = (x, y) => x >=0 && x < this.boardSize && y >= 0 && y < this.boardSize;

    //This method checks if a user input is valid; it expects an x,y coordinate and throws an error otherwise.
    validateInput = (position) => {
        const res = position.split(",");
        if (res.length !== 2) throw new Error("Please enter a valid input.");
        const y = res[0];
        const x = res[1];
        if(isNaN(x) || isNaN(y)) throw new Error("Please enter a valid input.");
        if(!this.isWithinBounds(x, y)) throw new Error("Please enter a valid input.");
        return { x, y };
    }

    //This is the Connect Four run method, which runs recursively until either a 'win' or 'draw' condition is hit (as determined by the model).
    run = () => {
        rl.question('Please place your move in a space: ', (position) => {
            try {
                const { x , y } = this.validateInput(position);
                const data = model.playerMove(x, y);
                if (!data) throw new Error("Please enter a valid input.")
                this.display(data);
                if(data.state === "win") {
                    console.log(`${data.player} has won! Please play again.`)
                    return rl.close();
                } else if (data.state === "draw") {
                    console.log("Tie game! Please play again.")
                    return rl.close();
                }
            } catch (err) {
                console.log(err.message);
            }
            this.run();
        });
    }
};

//The Minesweeper Model
class ConnectModel {
    constructor (boardSize) {
        this.boardSize = boardSize; //The model board is X by X size, where X is the initial boardSide given by the user. This should match the view.
        this.state = "ongoing"; //draw, win
        this.board = this.createBoard();
        this.player = "X"; //This value keeps track of which player is active ('X' or 'O')
    }

    //This method generates the Model for the game board, which is stored in a 2-D array.
    createBoard = () => {
        let board = new Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++) {
            board[i] = new Array(this.boardSize);
            for (let j = 0; j < this.boardSize; j++) {
                board[i][j] = " ";
            }
        }
        return board;
    }

    //This method checks if a move was valid (if the given coordinate pair wasn't already filled).
    validMove = (x, y) => this.board[x][y] === " ";

    //This method takes in the user's coordinate pair given in the View, 
    //and returns the current board and game state to the View if the input was valid, and once the Model has been updated.
    playerMove = (x, y) => {
        if(!this.validMove(x, y)) return null;
        this.board[x][y] = this.player;
        this.isWin();
        this.isDraw();
        if (this.state !== "win") this.changePlayer();
        return {
            board: this.board,
            player: this.player,
            state: this.state
        }
    }

    //This method changes the active player.
    changePlayer = () => {
        if (this.player === "X") {
            this.player = "O";
        } else {
            this.player = "X";
        }
    }

    //This method checks for the draw condition (if all cells are filled and no winner is found).
    isDraw = () => {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === " ") {
                    return;
                }
            }
        }
        this.state = "draw";
    }

    //This method checks for various win conditions when a move has been made.
    isWin = () => {
        //Horizontal win
        let winCheck = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === this.player) {
                    winCheck++;
                } else {
                    winCheck = 0;
                }
                if (winCheck === 4) return this.state = "win";
            }
            winCheck = 0;
        }

        //Vertical win
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[j][i] === this.player) {
                    winCheck++;
                } else {
                    winCheck = 0;
                }
                if (winCheck === 4) return this.state = "win";
            }
            winCheck = 0;
        }

        //Diagonal win 1
        let currX = 0;
        let currY = 0;
        let x = 0;
        let y = 0;
        for (let i = 0; i < this.boardSize*2 - 2; i++) {
            while(this.isWithinBounds(x, y)) {
                if (this.board[x][y] === this.player) {
                    winCheck++;
                } else {
                    winCheck = 0;
                }
                x += 1;
                y -= 1;
                if (winCheck === 4) return this.state = "win";
            }
            if (i >= this.boardSize - 1) {
                currX += 1
            } else {
                currY += 1;
            }
            x = currX;
            y = currY;
            winCheck = 0;
        }

        //Diagonal win 2
        currX = 0;
        currY = this.boardSize - 1;
        x = 0;
        y = this.boardSize - 1;
        for (let i = 0; i < this.boardSize*2 - 2; i++) {
            while(this.isWithinBounds(x, y)) {
                if (this.board[x][y] === this.player) {
                    winCheck++;
                } else {
                    winCheck = 0;
                }
                x -= 1;
                y -= 1;
                if (winCheck === 4) return this.state = "win";
            }
            if (i >= this.boardSize - 1) {
                currY -= 1;
            } else {
                currX += 1
            }
            x = currX;
            y = currY;
            winCheck = 0;
        }
    }

    //This method checks whether a given coordinate pair is in bounds of the board. 
    isWithinBounds = (x, y) => x >=0 && x < this.boardSize && y >=0 && y < this.boardSize;

}

//Initial values; can be changed here if desired. Note that boardSide must be below a certain value (depending on user display) to display properly.
const boardSize = 5;

let view = new ConnectView(boardSize);
let model = new ConnectModel(boardSize);

view.run();
