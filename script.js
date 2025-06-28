function gameBoard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;
  
  const putSymbol = (row, column, player) => {
    const occupiedCell = board[row][column].getValue();
  
    if (occupiedCell) {
      return occupiedCell;
    }

    board[row][column].addValue(player);
  };

  const returnResult = () => {
    const boardValues = board.map((row) => row.map((cell) => cell.getValue()));
    
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

  return {getBoard, putSymbol, returnResult};
}

function Cell() {
  let value = 0;

  const addValue = (player) => value = player;
  const getValue = () => value;
  const resetValue = () => value = 0;

  return {addValue, getValue, resetValue};
}

function GameController(playerOneName, playerTwoName) {
  const board = gameBoard();
  const players = [
    {name: playerOneName, symbol: 1},
    {name: playerTwoName, symbol: 2}
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = (result) => {
    if (result !== undefined) {
      activePlayer = players[0];
    } else {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
  };
  const getActivePlayer = () => activePlayer;

  const playRound = (row, column) => {
    if (row < 0 || row > 2 || column < 0 || column > 2) {
      return;
    }

    const occupiedCell = board.putSymbol(row, column, getActivePlayer().symbol);
    if (occupiedCell) {
      return;
    }

    const result = board.returnResult();
    if (result !== undefined) {
      switchPlayerTurn(result);
      return result;
    }
    
    switchPlayerTurn();
  };

  return {playRound, getActivePlayer, getBoard: board.getBoard};
}

function ScreenController(playerOneName, playerTwoName) {
  const game = GameController(playerOneName, playerTwoName);
  const playerTurnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');
  const dialogResult = document.querySelector('.dialog-result');
  const quitBtn = document.querySelector('.quit-btn');
  const playAgainBtn = document.querySelector('.play-again-btn');
  const scoreDiv = document.querySelector('.score');
  const playerOneWon = document.querySelector('.player-one-won');
  const playerTwoWon = document.querySelector('.player-two-won');
  let playerOneScore = 0;
  let playerTwoScore = 0;

  const updateScreen = () => {
    boardDiv.textContent = '';

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    
    playerTurnDiv.textContent = `${activePlayer.name}'s turn`;

    board.forEach((row, indexRow) => {
      row.forEach((cell, indexColumn) => {
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');
        cellBtn.dataset.row = indexRow;
        cellBtn.dataset.column = indexColumn;

        if (cell.getValue() === 1) {
          cellBtn.innerHTML = '&#10799;';
        } else if (cell.getValue() === 2) {
          cellBtn.innerHTML = '&#8413;';
          cellBtn.classList.add('circle');
        } else {
          cellBtn.textContent = '';
        }

        boardDiv.appendChild(cellBtn);
      })
    })
  };

  function clickHandlerBoard(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    
    if (!selectedColumn) return;
  
    const result = game.playRound(selectedRow, selectedColumn);

    updateScreen();

    if (result === 1) {
      playerOneScore++;
      playerOneWon.style.visibility = 'visible';
      playerTurnDiv.innerHTML = `${playerOneName} won!`;
    } else if (result === 2) {
      playerTwoScore++;
      playerTwoWon.style.visibility = 'visible';
      playerTurnDiv.innerHTML = `${playerTwoName} won!`;
    } else if (result === 0) {
      playerTurnDiv.textContent = 'Draw';
    }
    if (result !== undefined) {
      setTimeout(() => {
        scoreDiv.innerHTML = `<span>${playerOneName}</span> ${playerOneScore} - ${playerTwoScore} <span>${playerTwoName}</span>`;
        dialogResult.showModal();
      }, 1500);
    }
  }
  boardDiv.addEventListener('click', clickHandlerBoard);

  function reloadPage() {
    location.reload();
  }
  quitBtn.addEventListener('click', reloadPage);

  function restartGame(e) {
    playerOneWon.style.visibility = 'hidden';
    playerTwoWon.style.visibility = 'hidden';
    
    const board = game.getBoard();
    e.preventDefault();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[i][j].resetValue();
      }
    }
    dialogResult.close();
    updateScreen();
  }
  playAgainBtn.addEventListener('click', restartGame);

  updateScreen();
}

function startHumanMode() {
  const boardDiv = document.querySelector('.board');
  const modeBtnContainer = document.querySelector('.mode-btn-container');
  const playerOneName = prompt('What\'s player one\'s name?');
  const playerTwoName = prompt('What\'s player two\'s name?');

  modeBtnContainer.style.display= 'none';
  boardDiv.style.display = 'grid';

  ScreenController(playerOneName, playerTwoName);
}

const humanBtn = document.querySelector('.human-btn');
const computerBtn = document.querySelector('.computer-btn');
humanBtn.addEventListener('click', startHumanMode);