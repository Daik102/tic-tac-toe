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
  const getBoardValues = () => board.map((row) => row.map((cell) => cell.getValue()));
  
  const putSymbol = (row, column, player) => {
    const occupiedCell = board[row][column].getValue();
  
    if (occupiedCell) {
      return occupiedCell;
    }

    board[row][column].addValue(player);
  };

  

  return {getBoard, getBoardValues, putSymbol};
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

  const getPlayers = () => players;

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
    if (activePlayer.name !== 'Robot') {
      const occupiedCell = board.putSymbol(row, column, getActivePlayer().symbol);
      if (occupiedCell) {
        return;
      }
    }

    const boardValues = board.getBoardValues();
    if (row === 'getValue') {
      return boardValues; 
    }
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

  return {getBoard: board.getBoard, getPlayers, getActivePlayer, playRound, getOccupiedCell};
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

    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');
        cellBtn.dataset.row = i;
        cellBtn.dataset.column = j;

        if (cell.getValue() === 1) {
          cellBtn.innerHTML = 'X';
        } else if (cell.getValue() === 2) {
          cellBtn.innerHTML = 'O';
        }

        boardDiv.appendChild(cellBtn);
      })
    })
  };

  const getHumanMove = (e) => {
    if (finished) return;

    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    actionHandlerBoard(selectedRow, selectedColumn);
  }
  boardDiv.addEventListener('click', getHumanMove);

  const getRobotMove = () => {
    const boardValues = game.playRound('getValue');
    const playerOneName = game.getPlayers()[0].name;
    let robotRow;
    let robotColumn;
    let robotSymbol;
    let humanSymbol;
    let indexCounter = 0;
    let robotSymbolCounter = 0;
    let humanSymbolCounter = 0;
    
    if (playerOneName === 'Robot') {
      robotSymbol = 1;
      humanSymbol = 2;
    } else {
      robotSymbol = 2;
      humanSymbol = 1;
    }

    if (boardValues[0][0] === robotSymbol && boardValues[1][1] === robotSymbol && boardValues[2][2] === 0) {
      robotRow = 2;
      robotColumn = 2;
    } else if (boardValues[0][0] === robotSymbol && boardValues[2][2] === robotSymbol && boardValues[1][1] === 0 || boardValues[0][2] === robotSymbol && boardValues[2][0] === robotSymbol && boardValues[1][1] === 0) {
      robotRow = 1;
      robotColumn = 1;
    } else if (boardValues[1][1] === robotSymbol && boardValues[2][2] === robotSymbol && boardValues[0][0] === 0) {
      robotRow = 0;
      robotColumn = 0;
    } else if (boardValues[0][2] === robotSymbol && boardValues[1][1] === robotSymbol && boardValues[2][0] === 0) {
      robotRow = 2;
      robotColumn = 0;
    } else if (boardValues[2][0] === robotSymbol && boardValues[1][1] === robotSymbol && boardValues[0][2] === 0) {
      robotRow = 0;
      robotColumn = 2;
    }

    if (robotRow === undefined) {
      boardValues.forEach((row, i) => {
        row.forEach((cell) => {
          
          if (indexCounter === 3) {
            indexCounter = 0;
            robotSymbolCounter = 0;
            humanSymbolCounter = 0;
          }

          indexCounter++;

          if (cell === robotSymbol) {
            robotSymbolCounter++;
          } else if (cell === humanSymbol) {
            humanSymbolCounter++;
          }
          if (indexCounter === 3 && robotSymbolCounter === 2 && humanSymbolCounter === 0) {
            robotRow = i;
          }
        });
      });
    }
    
    if (robotRow === undefined) {
      const columns = [[0, 0], [0, 0], [0, 0]];

      boardValues.forEach((row, i) => {
        row.forEach((cell, j) => {

          if (cell === robotSymbol) {
            columns[j][0]++;
          } else if (cell === humanSymbol) {
            columns[j][1]++;
          }
          if (i === 2 && columns[j][0] === 2 && columns[j][1] === 0) {
            robotColumn = j;
          }
        });
      });
    }

    if (robotRow === undefined && robotColumn === undefined) {
      if (boardValues[0][0] === humanSymbol && boardValues[1][1] === humanSymbol && boardValues[2][2] === 0) {
        robotRow = 2;
        robotColumn = 2;
      } else if (boardValues[0][0] === humanSymbol && boardValues[2][2] === humanSymbol && boardValues[1][1] === 0 || boardValues[0][2] === humanSymbol && boardValues[2][0] === humanSymbol && boardValues[1][1] === 0) {
        robotRow = 1;
        robotColumn = 1;
      } else if (boardValues[1][1] === humanSymbol && boardValues[2][2] === humanSymbol && boardValues[0][0] === 0) {
        robotRow = 0;
        robotColumn = 0;
      } else if (boardValues[0][2] === humanSymbol && boardValues[1][1] === humanSymbol && boardValues[2][0] === 0) {
        robotRow = 2;
        robotColumn = 0;
      } else if (boardValues[2][0] === humanSymbol && boardValues[1][1] === humanSymbol && boardValues[0][2] === 0) {
        robotRow = 0;
        robotColumn = 2;
      }
    }

    if (robotRow === undefined && robotColumn === undefined) {
      boardValues.forEach((row, i) => {
        row.forEach((cell) => {
          
          if (indexCounter === 3) {
            indexCounter = 0;
            robotSymbolCounter = 0;
            humanSymbolCounter = 0;
          }

          indexCounter++;

          if (cell === robotSymbol) {
            robotSymbolCounter++;
          } else if (cell === humanSymbol) {
            humanSymbolCounter++;
          }
          if (indexCounter === 3 && humanSymbolCounter === 2 && robotSymbolCounter === 0) {
            robotRow = i;
          }
        });
      });
    }

    if (robotRow === undefined && robotColumn === undefined) {
      const column = [[0, 0], [0, 0], [0, 0]];

      boardValues.forEach((row, i) => {
        row.forEach((cell, j) => {

          if (cell === robotSymbol) {
            column[j][0]++;
          } else if (cell === humanSymbol) {
            column[j][1]++;
          }
          if (i === 2 && column[j][0] === 0 && column[j][1] === 2) {
            robotColumn = j;
          }
        });
      });
    }

    setTimeout(() => {
      if (robotRow === undefined) {
        robotRow = Math.floor(Math.random() * 3);
      }
      if (robotColumn === undefined) {
        robotColumn = Math.floor(Math.random() * 3);
      }

      const occupiedCell = game.getOccupiedCell(robotRow, robotColumn);

      if (occupiedCell) {
        getRobotMove();
      } else {
        setTimeout(() => {
          finished = false;
          actionHandlerBoard(robotRow, robotColumn);
        }, 1000);
      }
    }, 20);
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

  modeBtnContainer.style.display = 'none';
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
    const alertBlankOne = document.querySelector('.alert-blank-one');
    const alertBlankTwo = document.querySelector('.alert-blank-two');
    const alertDuplicate = document.querySelector('.alert-duplicate');
    const alertBlankName = document.querySelector('.alert-blank-name');
    const alertRobot = document.querySelector('.alert-robot');
    const playerFirst = document.getElementById('player-first');

    if (e.target.className === 'start-btn') {
      if (playerOneName === '') {
        alertBlankTwo.classList.remove('on-alert');
        alertDuplicate.classList.remove('on-alert');
        alertBlankOne.classList.add('on-alert');
        return;
      } else if (playerTwoName === '') {
        alertBlankOne.classList.remove('on-alert');
        alertDuplicate.classList.remove('on-alert');
        alertBlankTwo.classList.add('on-alert');
        return;
      } else if (playerOneName === playerTwoName) {
        alertBlankOne.classList.remove('on-alert');
        alertBlankTwo.classList.remove('on-alert');
        alertDuplicate.classList.add('on-alert');
        return;
      }

      dialogHuman.close();
      ScreenController(playerOneName, playerTwoName);
    } else if (e.target.className === 'play-btn') {
      if (playerName === '') {
        alertRobot.classList.remove('on-alert');
        alertBlankName.classList.add('on-alert');
        return;
      } else if (playerName.toLowerCase() === 'robot') {
        alertBlankName.classList.remove('on-alert');
        alertRobot.classList.add('on-alert');
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