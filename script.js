const game = (function () {
  const gameboard = (function () {
    const board = [null, null, null, null, null, null, null, null, null];
    const getBoard = () => board.map((cell) => cell);
    const setBoard = (marker, index) => {
      board[index] = marker;
      return board;
    };
    const clearBoard = () => {
      for (let i = 0; i < board.length; i++) {
        board[i] = null;
      }
      return board;
    };
    return { getBoard, setBoard, clearBoard };
  })();

  const players = (function () {
    function createPlayer(name, marker) {
      let score = 0;
      const getName = () => name;
      const setName = (newName) => (name = newName);
      const getMarker = () => marker;
      const setMarker = (newMarker) => (marker = newMarker);
      const getScore = () => score;
      const setScore = () => ++score;
      return { getName, setName, getScore, setScore, getMarker, setMarker };
    }
    const playerOne = createPlayer("P1", "x");
    const playerTwo = createPlayer("P2", "o");
    return { playerOne, playerTwo };
  })();

  const gameController = (function () {
    let activeMarker = "x";
    let roundComplete = false;
    function winChecker(board) {
      if (
        board[0] == activeMarker &&
        board[1] == activeMarker &&
        board[2] == activeMarker
      ) {
        return true;
      } else if (
        board[3] == activeMarker &&
        board[4] == activeMarker &&
        board[5] == activeMarker
      ) {
        return true;
      } else if (
        board[6] == activeMarker &&
        board[7] == activeMarker &&
        board[8] == activeMarker
      ) {
        return true;
      } else if (
        board[0] == activeMarker &&
        board[3] == activeMarker &&
        board[6] == activeMarker
      ) {
        return true;
      } else if (
        board[1] == activeMarker &&
        board[4] == activeMarker &&
        board[7] == activeMarker
      ) {
        return true;
      } else if (
        board[2] == activeMarker &&
        board[5] == activeMarker &&
        board[8] == activeMarker
      ) {
        return true;
      } else if (
        board[0] == activeMarker &&
        board[4] == activeMarker &&
        board[8] == activeMarker
      ) {
        return true;
      } else if (
        board[2] == activeMarker &&
        board[4] == activeMarker &&
        board[6] == activeMarker
      ) {
        return true;
      }
    }
    function tieChecker(board) {
      return !board.some((cell) => cell === null);
    }
    function validMove(index) {
      return gameboard.getBoard()[index] === null && !roundComplete;
    }
    function turnSwapper() {
      return (activeMarker = activeMarker == "x" ? "o" : "x");
    }
    function playerMarkerSwapper() {
      players.playerOne.getMarker() == "x"
        ? players.playerOne.setMarker("o")
        : players.playerOne.setMarker("x");
      players.playerTwo.getMarker() == "x"
        ? players.playerTwo.setMarker("o")
        : players.playerTwo.setMarker("x");
      return {
        playerOneMarker: players.playerOne.getMarker(),
        playerTwoMarker: players.playerTwo.getMarker(),
      };
    }
    const getRoundComplete = () => roundComplete;
    const getActiveMarker = () => activeMarker;
    const getActivePlayer = () => {
      return players.playerOne.getMarker() == activeMarker
        ? players.playerOne.getName()
        : players.playerTwo.getName();
    };
    const restartGame = () => {
      roundComplete = false;
      activeMarker = "x";
      gameboard.clearBoard();
      return { statusCode: 4, gameState: state() };
    };
    const playAgain = () => {
      roundComplete = false;
      activeMarker = "x";
      playerMarkerSwapper();
      gameboard.clearBoard();
      return { statusCode: 5, gameState: state() };
    };
    const playRound = (index) => {
      if (validMove(index)) {
        gameboard.setBoard(getActiveMarker(), index);
        if (winChecker(gameboard.getBoard())) {
          roundComplete = true;
          return {
            statusCode: 3,
            gameState: state(),
            winner: getActivePlayer(),
          };
        } else if (tieChecker(gameboard.getBoard())) {
          roundComplete = true;
          return { statusCode: 2, gameState: state() };
        } else {
          turnSwapper();
          return { statusCode: 1, gameState: state() };
        }
      } else {
        return { statusCode: 0, gameState: state() };
      }
    };
    return {
      restartGame,
      playAgain,
      playRound,
      getActiveMarker,
      getActivePlayer,
      getRoundComplete,
    };
  })();

  function state() {
    return {
      roundComplete: gameController.getRoundComplete(),
      gameboard: gameboard.getBoard(),
      activeMarker: gameController.getActiveMarker(),
      activePlayer: gameController.getActivePlayer(),
      playerOne: {
        name: players.playerOne.getName(),
        marker: players.playerOne.getMarker(),
        score: players.playerOne.getScore(),
      },
      playerTwo: {
        name: players.playerTwo.getName(),
        marker: players.playerTwo.getMarker(),
        score: players.playerTwo.getScore(),
      },
    };
  }

  return { gameboard, players, gameController, state };
})();

(function displayController() {
  const form = document.querySelector("#player-setup-form");
  const playerOneInput = document.querySelector("#playerOneInput");
  const playerTwoInput = document.querySelector("#playerTwoInput");
  const resetGameBtn = document.querySelector("#reset-btn");
  const newGameBtn = document.querySelector("#new-game-btn");
  const playerOneLabel = document.querySelector("#playerOneLabel");
  const playerTwoLabel = document.querySelector("#playerTwoLabel");
  const cells = document.querySelectorAll(".cell");
  const gameStatus = document.querySelector("#game-status");

  function updateBoard(board) {
    cells.forEach((cell, index) => {
      if (board[index] == "x") {
        cell.classList.remove("o");
        cell.classList.add("x");
        cell.textContent = board[index];
      } else if (board[index] == "o") {
        cell.classList.remove("x");
        cell.classList.add("o");
        cell.textContent = board[index];
      } else if (board[index] == null) {
        cell.classList.remove("x", "o");
        cell.textContent = "";
      }
    });
  }

  function updateNames(payload) {
    playerOneLabel.textContent = `${payload.playerOne.name} (${payload.playerOne.marker.toUpperCase()})`;
    playerTwoLabel.textContent = `${payload.playerTwo.name} (${payload.playerTwo.marker.toUpperCase()})`;
  }

  function render(payload) {
    switch (payload.statusCode) {
      case 0:
        gameStatus.textContent = "Invalid Move!! Try Again.";
        updateNames(payload);
        break;
      case 1:
        updateBoard(payload.gameState.gameboard);
        gameStatus.textContent = `${payload.gameState.activePlayer}'s turn.`;
        updateNames(payload);
        break;
      case 2:
        updateBoard(payload.gameState.gameboard);
        gameStatus.textContent = `Tie`;
        updateNames(payload.gameState);
        break;
      case 3:
        updateBoard(payload.gameState.gameboard);
        gameStatus.textContent = `${payload.winner} has won!!!`;
        updateNames(payload);
        break;
      case 4:
        updateBoard(payload.gameState.gameboard);
        gameStatus.textContent = `${payload.gameState.activePlayer}'s turn.`;
        updateNames(payload);
        break;
      case 5:
        updateBoard(payload.gameState.gameboard);
        gameStatus.textContent = `${payload.gameState.activePlayer}'s turn.`;
        updateNames(payload.gameState);
        break;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (playerOneInput.value)
      game.players.playerOne.setName(playerOneInput.value);
    if (playerTwoInput.value)
      game.players.playerTwo.setName(playerTwoInput.value);
    form.reset();
    updateNames(game.state());
    gameStatus.textContent = `${game.state().activePlayer}'s turn.`;
  });
  cells.forEach((cell) => {
    cell.addEventListener("click", (event) => {
      render(game.gameController.playRound(event.target.dataset.index));
    });
  });
  resetGameBtn.addEventListener("click", () => {
    render(game.gameController.restartGame());
  });
  newGameBtn.addEventListener("click", () => {
    render(game.gameController.playAgain());
  });

  updateNames(game.state());
  gameStatus.textContent = `${game.state().activePlayer}'s turn.`;
})();
