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

  const getBoardValues = () => board.map((row) => row.map((cell) => cell.getValue()));

  return {getBoard, putSymbol, getBoardValues};
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
    if (result >= 0) {
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

    if (activePlayer.name !== 'Robot') {
      const occupiedCell = board.putSymbol(row, column, getActivePlayer().symbol);
      if (occupiedCell) {
        return;
      }
    }

    const boardValues = board.getBoardValues();
    let result;

    if (boardValues[0][2] === 1 && boardValues[1][1] === 1 && boardValues[2][0] === 1 || boardValues[0][0] === 1 && boardValues[1][1] === 1 && boardValues[2][2] === 1) {
      result = 1;
    } else if (boardValues[0][2] === 2 && boardValues[1][1] === 2 && boardValues[2][0] === 2 || boardValues[0][0] === 2 && boardValues[1][1] === 2 && boardValues[2][2] === 2) {
      result = 2;
    }

    let occupiedCounter = 0;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const win = boardValues[i].every((val, i, arr) => val === arr[0]);
        if (win && boardValues[i][j] === 1) {
          result = 1;
        } else if (win && boardValues[i][j] === 2) {
          result = 2;
        }

        if (boardValues[i][j] !== 0) {
          occupiedCounter++;
        }
      }

      const column = [boardValues[0][i], boardValues[1][i], boardValues[2][i]];
      const win = column.every((val, i, arr) => val === arr[0]);

      if (win) {
        if (column[i] === 1) {
          result = 1;
        } else if (column[i] === 2) {
          result = 2;
        }
      }
    }

    if (occupiedCounter === 9 && result === undefined) {
      result = 0;
    }

    switchPlayerTurn(result);
    return result;
  };

  const getOccupiedCell = (row, column) => board.putSymbol(row, column, getActivePlayer().symbol);

  return {playRound, getActivePlayer, getBoard: board.getBoard, getOccupiedCell};
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

    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');
        cellBtn.dataset.row = rowIndex;
        cellBtn.dataset.column = columnIndex;

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

  const getHumanMove = (e) => {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    
    if (!selectedColumn) return;
    if (finished) return;

    actionHandlerBoard(selectedRow, selectedColumn);
  }
  boardDiv.addEventListener('click', getHumanMove);

  const getRobotMove = () => {
    let counter = 0;
    let robotRow;
    let robotColumn;

    setTimeout(() => {
      finished = false;

      if (counter === 0) {
        robotRow = '0';
        robotColumn = '0';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 1) {
        robotRow = '0';
        robotColumn = '2';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 2) {
        robotRow = '0';
        robotColumn = '1';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 3) {
        robotRow = '2';
        robotColumn = '0';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 4) {
        robotRow = '1';
        robotColumn = '1';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 5) {
        robotRow = '1';
        robotColumn = '0';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 6) {
        robotRow = '2';
        robotColumn = '2';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 7) {
        robotRow = '1';
        robotColumn = '2';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
      if (counter === 8) {
        robotRow = '2';
        robotColumn = '1';
        const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);
        if (occupiedCell) {
          counter++
        } else {
          actionHandlerBoard(robotRow, robotColumn);
          return;
        }
      }
    }, 1000);
  }

  const activePlayer = game.getActivePlayer();
  if (activePlayer.name === 'Robot') {
    getRobotMove();
  }

  const actionHandlerBoard = (row, column) => {
    const result = game.playRound(row, column);
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

    const activePlayer = game.getActivePlayer();

    if (result >= 0) {
      finished = true;
      setTimeout(() => {
        scoreDiv.innerHTML = `<span>${playerOneName}</span> ${playerOneScore} - ${playerTwoScore} <span>${playerTwoName}</span>`;
        dialogResult.showModal();
      }, 1500);
    } else if (activePlayer.name === 'Robot') {
      finished = true;
      getRobotMove();
    }
  }

  const reloadPage = (e) => {
    e.preventDefault();
    location.reload();
  }
  quitBtn.addEventListener('click', reloadPage);

  const restartGame = (e) => {
    e.preventDefault();
    playerOneWon.style.visibility = 'hidden';
    playerTwoWon.style.visibility = 'hidden';
    finished = false;
    
    const board = game.getBoard();
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[i][j].resetValue();
      }
    }
    dialogResult.close();
    updateScreen();

    const activePlayer = game.getActivePlayer();
    if (activePlayer.name === 'Robot') {
      getRobotMove();
    }
  }
  playAgainBtn.addEventListener('click', restartGame);

  updateScreen();
}

function enterName(e) {
  const boardDiv = document.querySelector('.board');
  const modeBtnContainer = document.querySelector('.mode-btn-container');
  const dialogHuman = document.querySelector('.dialog-human');
  const dialogRobot = document.querySelector('.dialog-robot');
  const backBtn = document.querySelector('.back-btn');
  const startBtn = document.querySelector('.start-btn');
  const backBtnRobot = document.querySelector('.back-btn-robot');
  const playBtn = document.querySelector('.play-btn');

  modeBtnContainer.style.display= 'none';
  boardDiv.style.display = 'grid';

  if (e.target.className === 'human-btn') {
    dialogHuman.showModal();
  } else if (e.target.className === 'robot-btn') {
    dialogRobot.showModal();
  }

  const reloadPage = (e) => {
    e.preventDefault();
    location.reload();
  }
  backBtn.addEventListener('click', reloadPage);
  backBtnRobot.addEventListener('click', reloadPage);

  const startGame = (e) => {
    e.preventDefault();
    
    const playerOneName = document.getElementById('player-one-name').value;
    const playerTwoName = document.getElementById('player-two-name').value;
    const playerName = document.getElementById('player-name').value;
    const blankAlertOne = document.querySelector('.blank-alert-one');
    const blankAlertTwo = document.querySelector('.blank-alert-two');
    const duplicateAlert = document.querySelector('.duplicate-alert');
    const blankAlertName = document.querySelector('.blank-alert-name');
    const playerFirst = document.getElementById('player-first');
    const humanAlert = document.querySelector('.human-alert');

    if (e.target.className === 'start-btn') {
      if (playerOneName === '') {
        blankAlertTwo.classList.remove('on-alert');
        duplicateAlert.classList.remove('on-alert');
        blankAlertOne.classList.add('on-alert');
        return;
      } else if (playerTwoName === '') {
        blankAlertOne.classList.remove('on-alert');
        duplicateAlert.classList.remove('on-alert');
        blankAlertTwo.classList.add('on-alert');
        return;
      } else if (playerOneName === playerTwoName) {
        blankAlertOne.classList.remove('on-alert');
        blankAlertTwo.classList.remove('on-alert');
        duplicateAlert.classList.add('on-alert');
        return;
      }

      dialogHuman.close();
      ScreenController(playerOneName, playerTwoName);
    } else if (e.target.className === 'play-btn') {
      if (playerName === '') {
        humanAlert.classList.remove('on-alert');
        blankAlertName.classList.add('on-alert');
        return;
      } else if (playerName.toLowerCase() === 'robot') {
        blankAlertName.classList.remove('on-alert');
        humanAlert.classList.add('on-alert');
        return;
      }
      
      dialogRobot.close();
      if (playerFirst.checked) {
        ScreenController(playerName, 'Robot');
      } else {
        ScreenController('Robot', playerName);
      }
    }
  }

  startBtn.addEventListener('click', startGame);
  playBtn.addEventListener('click', startGame);
}

const humanBtn = document.querySelector('.human-btn');
const robotBtn = document.querySelector('.robot-btn');
let finished;

humanBtn.addEventListener('click', enterName);
robotBtn.addEventListener('click', enterName);