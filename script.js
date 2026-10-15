function createGameBoard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];

    for (let j = 0; j < columns; j++) {
      board[i].push(createCell());
    }
  }

  const getBoard = () => board;
  const getBoardValues = () => board.map((row) => row.map((cell) => cell.getValue()));
  const putSymbol = (row, column, symbol) => board[row][column].setValue(symbol);
  const resetBoard = () => board.map((row) => row.map((cell) => cell.resetValue()));

  return {
    getBoard,
    getBoardValues,
    putSymbol,
    resetBoard,
  };
}

function createCell() {
  let value = 0;
  const setValue = (symbol) => value = symbol;
  const getValue = () => value;
  const resetValue = () => value = 0;

  return {
    setValue,
    getValue,
    resetValue,
  };
}

function createPlayer(symbol, active) {
  return {
    name: '',
    symbol,
    active,
    result: null,
    pattern: [],
    score: 0,
  };
}

function handleGame() {
  const board = createGameBoard();
  prepareGame();

  function getActivePlayer() {
    let activePlayer = {};
    playerOne.active ? activePlayer = playerOne : activePlayer = playerTwo;
    return activePlayer;
  }

  const getHumanMove = (e) => {
    const activePlayer = getActivePlayer();
  
    if (activePlayer.name === 'Robot' || activePlayer.result !== null || !e.target.classList.contains('cell')) {
      return;
    }
    
    const row = e.target.dataset.row;
    const column = e.target.dataset.column;
    const coordinate = [row, column];
    
    handleMove(coordinate);
  }

  function getSquares(boardValues) {
    const squares = [];

    for (let i = 0; i < boardValues.length; i++) {
      const row = boardValues[i];

      for (let j = 0; j < row.length; j++) {
        const square = row[j];
        squares.push(square);
      }
    }

    return squares;
  }

  function getLines() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return lines;
  }

  const getRobotMove = () => { 
    const boardValues = board.getBoardValues();
    const activePlayer = getActivePlayer();
    const symbol = activePlayer.symbol;
    let opponentSymbol = playerOne.symbol;
    
    if (symbol === opponentSymbol) {
      opponentSymbol = playerTwo.symbol;
    }

    const squares = getSquares(boardValues);
    const lines = getLines();
    let robotMove = null;

    function calculateRobotMove(symbol) {
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] === symbol && squares[a] === squares[b] && squares[c] === 0) {
          robotMove = c;
        } else if (squares[a] === symbol && squares[a] === squares[c] && squares[b] === 0) {
          robotMove = b;
        } else if (squares[b] === symbol && squares[b] === squares[c] && squares[a] === 0) {
          robotMove = a;
        }
      }
    }

    calculateRobotMove(symbol);

    if (robotMove === null) {
      calculateRobotMove(opponentSymbol);
    }

    let coordinate = [];

    if (robotMove !== null) {
      const row = Math.floor(robotMove / 3);
      const column = robotMove % 3;
      coordinate = [row, column];
    } else {
      const emptyCells = [];

      for (let i = 0; i < boardValues.length; i++) {
        const row = boardValues[i];

        for (let j = 0; j < row.length; j++) {
          const cell = row[j];

          if (cell === 0) {
            emptyCells.push([i, j]);
          }
        }
      }

      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      coordinate = emptyCells[randomIndex];
    }
    
    setTimeout(() => {
      handleMove(coordinate);
    }, 1000);
  };

  function handleMove(coordinate) {
    const row = coordinate[0];
    const column = coordinate[1];
    const occupiedCell = board.getBoard()[row][column].getValue();

    if (occupiedCell) {
      return;
    }

    let activePlayer = getActivePlayer();
    const symbol = activePlayer.symbol;
    board.putSymbol(row, column, symbol);
    checkResult();

    if (activePlayer.result !== null) {
      displayResult(activePlayer);
    } else {
      if (playerOne.active) {
        playerOne.active = false;
        playerTwo.active = true;
      } else {
        playerOne.active = true;
        playerTwo.active = false;
      }

      activePlayer = getActivePlayer();
      renderBoard(board.getBoard(), activePlayer);
      moveWithArrowKey(board.getBoardValues());
      
      if (activePlayer.name === 'Robot') {
        getRobotMove();
      }
    }
  }

  function checkResult() {
    const boardValues = board.getBoardValues();
    const activePlayer = getActivePlayer();
    let result = activePlayer.result;
    let pattern = activePlayer.pattern;
    const squares = getSquares(boardValues);
    const lines = getLines();
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        pattern.push(a, b, c);
        result = squares[a];
      }
    }

    if (pattern.length > 3) {
      pattern = [...new Set(pattern)];
    }

    if (!result) {
      const emptySquare = squares.includes(0);
      
      if (!emptySquare) {
        result = 'draw';
      }
    }
    
    if (result) {
      activePlayer.result = result;

      if (result !== 'draw') {
        activePlayer.pattern = pattern;
      }
    }
  }
  
  function displayResult(activePlayer) {
    const message = document.querySelector('.message');
    const result = activePlayer.result;
    const pattern = activePlayer.pattern;
    
    if (result === 'draw') {
      message.textContent = 'Draw';
      renderBoard(board.getBoard());
    } else {
      if (result === playerOne.symbol) {
        playerOne.score += 1;
        message.innerHTML = `${playerOne.name} won!`;
      } else {
        playerTwo.score += 1;
        message.innerHTML = `${playerTwo.name} won!`;
      }

      renderBoard(board.getBoard(), '', pattern);
    }
    
    setTimeout(() => {
      const dialogResultHTML = `
        <div class="dialog dialog-result">
          <form>
            <div class="crown-container">
              <div class="player-one-won">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
              </div>
              <div class="player-two-won">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
              </div>
            </div>
            <div class="name-row"><p>${playerOne.name}</p><p>${playerTwo.name}</p></div>
            <div class="score-row"><p>${playerOne.score}</p><div class="sword-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.2,2.44L18.1,14.34L20.22,12.22L21.63,13.63L19.16,16.1L22.34,19.28C22.73,19.67 22.73,20.3 22.34,20.69L21.63,21.4C21.24,21.79 20.61,21.79 20.22,21.4L17,18.23L14.56,20.7L13.15,19.29L15.27,17.17L3.37,5.27V2.44H6.2M15.89,10L20.63,5.26V2.44H17.8L13.06,7.18L15.89,10M10.94,15L8.11,12.13L5.9,14.34L3.78,12.22L2.37,13.63L4.84,16.1L1.66,19.29C1.27,19.68 1.27,20.31 1.66,20.7L2.37,21.41C2.76,21.8 3.39,21.8 3.78,21.41L7,18.23L9.44,20.7L10.85,19.29L8.73,17.17L10.94,15Z" /></svg>
            </div><p>${playerTwo.score}</p></div>
            <div class="btn-container">
              <button type="button" class="quit-btn">Quit</button>
              <button type="button" class="retry-btn">Retry</button>
            </div>
          </form>
        </div>
      `;

      const boardDiv = document.querySelector('.board');
      boardDiv.classList.remove('display-board');
      boardDiv.innerHTML = dialogResultHTML;

      const playerOneWon = document.querySelector('.player-one-won');
      const playerTwoWon = document.querySelector('.player-two-won');

      if (result === playerOne.symbol) {
        playerOneWon.classList.add('visible-crown');
      } else if (result === playerTwo.symbol) {
        playerTwoWon.classList.add('visible-crown');
      }
      
      const quitBtn = document.querySelector('.quit-btn');
      const retryBtn = document.querySelector('.retry-btn');
      quitBtn.addEventListener('click', resetGame);
      retryBtn.addEventListener('click', resetGame);

      document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;

        if (activeElement === document.body) {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            quitBtn.focus();
          }
        }
      });

      quitBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          retryBtn.focus();
        }
      });

      retryBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          quitBtn.focus();
        }
      });
    }, 1500);
  }

  function resetGame(e) {
    board.resetBoard();
    playerOne.active = true;
    playerTwo.active = false;
    playerOne.result = null;
    playerTwo.result = null;
    playerOne.pattern = [];
    playerTwo.pattern = [];
    
    if (e.target.classList.contains('retry-btn')) {
      const boardDiv = document.querySelector('.board');
      boardDiv.classList.add('display-board');
      renderBoard(board.getBoard(), playerOne);
      moveWithArrowKey();

      if (playerOne.name === 'Robot') {
        getRobotMove();
      }
    } else {
      const message = document.querySelector('.message');
      message.classList.remove('player-two-message');
      playerOne.name = '';
      playerTwo.name = '';
      playerOne.score = 0;
      playerTwo.score = 0;
      reloadPage();
    }
  }

  const moveWithArrowKey = (boardValues) => {
    const cells = document.querySelectorAll('.cell');
    const columns = 3;
    let cellIndex = 0;

    function adjustCellIndex(e, initial) {
      if (initial) {
        if (boardValues) {
          const row = Math.floor(cellIndex / columns);
          const column = cellIndex % columns;
          const symbol = boardValues[row][column];

          if (symbol !== 0) {
            cellIndex += 1;
          }
        }
      } else {
        if (e.key === 'ArrowRight') {
          cellIndex += 1;
        } else if (e.key === 'ArrowLeft') {
          cellIndex -= 1;
        } else if (e.key === 'ArrowDown') {
          cellIndex += columns;
        } else if (e.key === 'ArrowUp') {
          cellIndex -= columns;
        }
      }

      if (cellIndex >= cells.length) {
        cellIndex -= cells.length;
      } else if (cellIndex < 0) {
        cellIndex += cells.length;
      }

      if (boardValues) {
        const row = Math.floor(cellIndex / columns);
        const column = cellIndex % columns;
        const symbol = boardValues[row][column];

        if (symbol !== 0) {
          adjustCellIndex(e, initial);
        }
      }
      
      cells[cellIndex].focus();
    }

    const activePlayer = getActivePlayer();
    const name = activePlayer.name;

    function handleKeydown(e, initial) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        adjustCellIndex(e, initial);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const message = document.querySelector('.message');
        message.textContent = 'Use arrow keys please';

        setTimeout(() => {
          if (!activePlayer.result) {
            message.textContent = `${name}'s turn`;
          }
        }, 1500);
      }
    }

    document.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;

      if (activeElement === document.body) {
        handleKeydown(e, 'initial');
      }
    });
    
    cells.forEach((cell) => {
      cell.addEventListener('keydown', handleKeydown);
    });
  };

  return {
    getBoard: board.getBoard,
    getHumanMove,
    getRobotMove,
    moveWithArrowKey,
  };
}

function renderBoard(board, activePlayer, pattern) {
  const boardDiv = document.querySelector('.board');
  boardDiv.innerHTML = '';
  
  for (let i = 0; i < board.length; i++) {
    const boardRow = board[i];
    
    for (let j = 0; j < boardRow.length; j++) {
      const value = boardRow[j].getValue();
      const cell = document.createElement('button');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.column = j;
      
      if (value === playerOne.symbol) {
        cell.classList.add('player-one-cell');
        cell.textContent = playerOne.symbol;
      } else if (value === playerTwo.symbol) {
        cell.classList.add('player-two-cell');
        cell.textContent = playerTwo.symbol;
      }

      boardDiv.appendChild(cell);
    }
  }

  const cells = document.querySelectorAll('.cell');
  
  if (activePlayer) {
    const message = document.querySelector('.message');
    const symbol = activePlayer.symbol;
    const name = activePlayer.name;

    if (symbol === playerTwo.symbol) {
      message.classList.add('player-two-message');
    } else {
      message.classList.remove('player-two-message');
    }

    message.textContent = `${name}'s turn`;
  
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', (e) => {
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
        const value = board[row][column].getValue();
        
        if (value === 0) {
          cell.classList.add('hovering-cell');
        }
      });

      cell.addEventListener('mouseleave', () => {
        cell.classList.remove('hovering-cell');
      });
    });
  }
  
  if (pattern) {
    for (const index of pattern) {
      cells[index].classList.add('victory-cell');
    }
  }
};

function startGame(playerOneName, playerTwoName) {
  const boardDiv = document.querySelector('.board');
  const board = game.getBoard();
  playerOne.name = playerOneName;
  playerTwo.name = playerTwoName;
  boardDiv.classList.add('display-board');
  boardDiv.addEventListener('click', game.getHumanMove);

  if (playerOne.name === 'Robot') {
    game.getRobotMove();
  }
  
  renderBoard(board, playerOne);
  game.moveWithArrowKey();
}

function reloadPage() {
  const message = document.querySelector('.message');
  const boardDiv = document.querySelector('.board');
  const titlePageHTML = `
    <div class="mode-btn-container">
      <button class="human-btn">Vs Human</button>
      <button class="robot-btn">Vs Robot</button>
    </div>
  `;

  message.textContent = 'Select Game';
  boardDiv.innerHTML = titlePageHTML;
  prepareGame();
}

function enterName(e) {
  if (e.target.classList.contains('start-btn')) {
    const playerOneName = document.getElementById('player-one-name');
    const playerTwoName = document.getElementById('player-two-name');
    const alertBlankOne = document.querySelector('.alert-blank-one');
    const alertBlankTwo = document.querySelector('.alert-blank-two');

    if (playerOneName.value === '') {
      alertBlankTwo.classList.remove('on-alert');
      alertBlankOne.classList.add('on-alert');
    } else if (playerTwoName.value === '') {
      alertBlankOne.classList.remove('on-alert');
      alertBlankTwo.classList.add('on-alert');
    } else {
      startGame(playerOneName.value, playerTwoName.value);
    }
  } else if (e.target.classList.contains('start-btn-for-robot')) {
    const playerName = document.getElementById('player-name');
    const alertBlankName = document.querySelector('.alert-blank-name');
    const playerFirst = document.getElementById('player-first');

    if (playerName.value === '') {
      alertBlankName.classList.add('on-alert');
    } else {
      if (playerFirst.checked) {
        startGame(playerName.value, 'Robot');
      } else {
        startGame('Robot', playerName.value);
      }
    }
  }
}

function openDialog(e) {
  const message = document.querySelector('.message');
  const boardDiv = document.querySelector('.board');

  if (e.target.classList.contains('human-btn')) {
    const dialogHumanHTML = `
      <div class="dialog dialog-human">
        <form>
          <p>
            <label for="player-one-name" class="player-one-label">Player 1: </label>
            <input type="text" id="player-one-name" maxlength="8">
          </p>
          <div class="alert-blank-one alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13,13V7H11V13H13M13,17V15H11V17H13Z" /></svg>
            Fill out here
          </div>
          <p>
            <label for="player-two-name" class="player-two-label">Player 2: </label>
            <input type="text" id="player-two-name" maxlength="8">
          </p>
          <div class="alert-blank-two alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13,13V7H11V13H13M13,17V15H11V17H13Z" /></svg>
            Fill out here
          </div>
          <div class="btn-container">
            <button type="button" class="back-btn">Back</button>
            <button type="button" class="start-btn">Start</button>
          </div>
        </form>
      </div>
    `;

    message.textContent = 'Enter names';
    boardDiv.innerHTML = dialogHumanHTML;

    const playerOneName = document.getElementById('player-one-name');
    const playerTwoName = document.getElementById('player-two-name');
    playerOneName.focus();

    const backBtn = document.querySelector('.back-btn');
    const startBtn = document.querySelector('.start-btn');
    backBtn.addEventListener('click', reloadPage);
    startBtn.addEventListener('click', enterName);

    playerOneName.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        startBtn.focus();
      } else if (e.key === 'ArrowDown') {
        playerTwoName.focus();
      }
    });

    playerTwoName.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        playerOneName.focus();
      } else if (e.key === 'ArrowDown') {
        backBtn.focus();
      }
    });

    backBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        playerTwoName.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        startBtn.focus();
      }
    });

    startBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        backBtn.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        playerOneName.focus();
      }
    });
  } else {
    const dialogRobotHTML = `
      <div class="dialog dialog-robot">
        <form>
          <p class="name-container">
            <label for="player-name" class="player-label">Name: </label>
            <input type="text" id="player-name" maxlength="8">
          </p>
          <div class="alert-blank-name alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13,13V7H11V13H13M13,17V15H11V17H13Z" /></svg>
            Fill out here
          </div>
          <p class="first-radio-row">
            <input type="radio" id="player-first" name="play-order" value="player-first" checked>
            <label for="player-first" class="player-first-label">I play first</label>
          </p>
          <p class="second-radio-row">
            <input type="radio" id="robot-first" name="play-order" value="robot-first">
            <label for="robot-first" class="robot-first-label">Robot plays first</label>
          </p>
          <div class="btn-container">
            <button type="button" class="back-btn-for-robot">Back</button>
            <button type="button" class="start-btn-for-robot">Start</button>
          </div>
        </form>
      </div>
    `;

    message.textContent = 'Enter name';
    boardDiv.innerHTML = dialogRobotHTML;

    const playerName = document.getElementById('player-name');
    const playerFirst = document.getElementById('player-first');
    const robotFirst = document.getElementById('robot-first');
    playerName.focus();

    const backBtnForRobot = document.querySelector('.back-btn-for-robot');
    const startBtnForRobot = document.querySelector('.start-btn-for-robot');
    backBtnForRobot.addEventListener('click', reloadPage);
    startBtnForRobot.addEventListener('click', enterName);

    playerName.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        startBtnForRobot.focus();
      } else if (e.key === 'ArrowDown') {
        playerFirst.focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    });

    playerFirst.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playerName.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        robotFirst.focus();
      }
    });

    robotFirst.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playerFirst.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        backBtnForRobot.focus();
      }
    });

    backBtnForRobot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        robotFirst.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        startBtnForRobot.focus();
      }
    });

    startBtnForRobot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        backBtnForRobot.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        playerName.focus();
      }
    });
  }
}

function prepareGame() {
  const humanBtn = document.querySelector('.human-btn');
  const robotBtn = document.querySelector('.robot-btn');
  const link = document.querySelector('.link');
  humanBtn.addEventListener('click', openDialog);
  robotBtn.addEventListener('click', openDialog);

  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;

    if (activeElement === document.body) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        humanBtn.focus();
      }
    }
  });

  humanBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      link.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      robotBtn.focus();
    }
  });

  robotBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      humanBtn.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      link.focus();
    }
  });

  link.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      robotBtn.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      humanBtn.focus();
    }
  });
}

const playerOne = createPlayer('X', true);
const playerTwo = createPlayer('O', false);
const game = handleGame();
