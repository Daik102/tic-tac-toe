function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => {
    board;
  };

  const putSymbol = (row, column, player) => {
    const occupiedCell = board[row][column].getValue();
  
    if (occupiedCell) {
      return occupiedCell;
    }

    board[row][column].addValue(player);
  };

  const printBoard = () => {
    const boardValues = board.map((row) => row.map((cell) => cell.getValue()));
    console.log(boardValues);
    
    if (boardValues[0][2] === 1 && boardValues[1][1] === 1 && boardValues[2][0] === 1 || boardValues[0][0] === 1 && boardValues[1][1] === 1 && boardValues[2][2] === 1) {
      return 1;
    } else if (boardValues[0][2] === 2 && boardValues[1][1] === 2 && boardValues[2][0] === 2 || boardValues[0][0] === 2 && boardValues[1][1] === 2 && boardValues[2][2] === 2) {
      return 2;
    }

    let occupiedCounter = 0;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const win = boardValues[i].every((val, i, arr) => val === arr[0]);
        if (win && boardValues[i][j] === 1) {
          return 1;
        } else if (win && boardValues[i][j] === 2) {
          return 2;
        }

        if (boardValues[i][j] !== 0) {
          occupiedCounter++;
        }
      }

      const column = [boardValues[0][i], boardValues[1][i], boardValues[2][i]];
      const win = column.every((val, i, arr) => val === arr[0]);

      if (win) {
        if (column[i] === 1) {
          return 1;
        } else if (column[i] === 2) {
          return 2;
        }
      }
    }

    if (occupiedCounter === 9) {
      return 0;
    }
  };

  return {getBoard, putSymbol, printBoard};
}

function Cell() {
  let value = 0;

  const addValue = (player) => value = player;
  const getValue = () => value;

  return {addValue, getValue};
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();
  const players = [
    {name: playerOneName, symbol: 1},
    {name: playerTwoName, symbol: 2}
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    const result = board.printBoard();
    
     if (result === 1) {
       console.log(`${playerOneName} win!`);
       return;
     } else if (result === 2) {
       console.log(`${playerTwoName} win!`);
       return;
     } else if (result === 0) {
      console.log('Draw');
      return;
     }
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playRound = (row, column) => {
    if (row < 0 || row > 2 || column < 0 || column > 2) {
      return;
    }

    const occupiedCell = board.putSymbol(row, column, getActivePlayer().symbol);
    if (occupiedCell) {
      return;
    }
    
    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {playRound, getActivePlayer};
}

const game = GameController();

game.playRound(2, 2);
game.playRound(1, 1);
game.playRound(1, 0);
game.playRound(0, 2);
game.playRound(1, 2);
game.playRound(0, 1);
game.playRound(2, 1);
game.playRound(0, 0);
