const YELLOW_CLASS = 'yellow'
const RED_CLASS = 'red'
const WIN_CLASS = 'winner'
const HEIGHT = 6
const WIDTH = 7
// const initialBoard = [
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0]
// ]
const cellElements = document.querySelectorAll('[data-cell]')
const boardElement = document.getElementById('board')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
let redTurn
let currentBoard
let winningNumbers = []
let muteButtonClicked = false;
let marioButtonClicked = false;

$('#muteButton').on('click', function() {
  if (muteButtonClicked) {
    $('img.mute').removeClass('selected');
    muteButtonClicked = false;
  } else {
    $('img.mute').addClass('selected');
    muteButtonClicked = true;
  }
});

$('#marioButton').on('click', function() {
  if (marioButtonClicked) {
    $('img.mario').removeClass('selected');
    marioButtonClicked = false;
  } else {
    $('img.mario').addClass('selected');
    marioButtonClicked = true;
  }
});

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  }
  this.stop = function() {
    this.sound.pause();
  }
}

let clickSound = new sound("media/click.mp3")
let smmWin = new sound("media/smmWin.mp3")
let winSound = new sound("media/win.mp3")
let drawSound = new sound("media/drawSound.mp3")
let coinSound = new sound("media/coin.mp3")

//----------------------------------------//
//----------------RUN GAME----------------//
//----------------------------------------//

startGame()
restartButton.addEventListener('click', startGame)

//----------------------------------------//
//------------CLICK FUNCTIONS-------------//
//----------------------------------------//

function startGame() {
  redTurn = true

  // for some reason currentBoard = initialBoard doens't work???
  currentBoard = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ]
  winningNumbers = []


  cellElements.forEach((cell, i) => {
    cell.id = i
    cell.classList.remove(YELLOW_CLASS)
    cell.classList.remove(RED_CLASS)
    cell.classList.remove(WIN_CLASS)
    cell.removeEventListener('click', handleClick)
    cell.addEventListener('click', handleClick)
  })
  setBoardHoverClass()
  winningMessageElement.classList.remove('show')
}

function handleClick(e) {

  if (!muteButtonClicked) {
    if (marioButtonClicked) {
      coinSound.play()
    } else {
      clickSound.play()
    }
  }
  const cell = e.target
  const currentClass = redTurn ? RED_CLASS : YELLOW_CLASS

  placeMark(cell, currentClass)

  if (checkWin()) {

    if (!muteButtonClicked) {
      if (marioButtonClicked) {
        smmWin.play()
      } else {
        winSound.play()
      }
    }
    endGame(false)
  } else if (isDraw()) {
    if (!muteButtonClicked) drawSound.play()
    endGame(true)
  } else {
    swapTurns()
    setBoardHoverClass()
  }
}

function swapTurns() {
  redTurn = !redTurn
}

//----------------------------------------------//
//----------------WIN CONDITIONS----------------//
//----------------------------------------------//

function checkWin() {
  // code adapted from:
  // https://codereview.stackexchange.com/questions/127091/java-connect-four-four-in-a-row-detection-algorithms

  // go through entire board, check for win
  // note that here we start from the top left of the board

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      let value = currentBoard[row][col]
      // skip over emtpy spots in grid
      if (value == 0) continue

      // check for horizontal win (to the right)
      if (col + 3 < WIDTH &&
        value == currentBoard[row][col + 1] &&
        value == currentBoard[row][col + 2] &&
        value == currentBoard[row][col + 3]) {
        // keep track of the cells that won
        findWinningNumbers(row, col, "horizontal")
        return true
      }

      // check for wins below current cell (make sure we're in bounds)
      if (row + 3 < HEIGHT) {
        // check for veritcal win (straight down)
        if (value == currentBoard[row + 1][col] &&
          value == currentBoard[row + 2][col] &&
          value == currentBoard[row + 3][col]) {
          findWinningNumbers(row, col, "vertical")
          return true
        }
        // check for diagonal win (down and to the right)
        if (col + 3 < WIDTH &&
          value == currentBoard[row + 1][col + 1] &&
          value == currentBoard[row + 2][col + 2] &&
          value == currentBoard[row + 3][col + 3]) {
          findWinningNumbers(row, col, "diagonal-right")
          return true
        }
        // check for diagonal win (down and to the left)
        if (col - 3 >= 0 &&
          value == currentBoard[row + 1][col - 1] &&
          value == currentBoard[row + 2][col - 2] &&
          value == currentBoard[row + 3][col - 3]) {
          findWinningNumbers(row, col, "diagonal-left")
          return true
        }
      }
    }
  }
}

// goes through entire board and cell that caused
// there to be a win to manually keep track of winning cell numbers
function findWinningNumbers(row, col, winType) {

  switch (winType) {
    case "horizontal":
      let countH = 0
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          // if this is one of the four winning numbers add it
          if ((r == row && c == col) ||
            (r == row && c == col + 1) ||
            (r == row && c == col + 2) ||
            (r == row && c == col + 3)) {
            winningNumbers.push(countH)
          }
          countH++
        }
      }
      return

    case "vertical":
      let countV = 0
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          // if this is one of the four winning numbers add it
          if ((r == row && c == col) ||
            (r == row + 1 && c == col) ||
            (r == row + 2 && c == col) ||
            (r == row + 3 && c == col)) {
            winningNumbers.push(countV)
          }
          countV++
        }
      }
      return


    case "diagonal-right":
      let countDR = 0
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          // if this is one of the four winning numbers add it
          if ((r == row && c == col) ||
            (r == row + 1 && c == col + 1) ||
            (r == row + 2 && c == col + 2) ||
            (r == row + 3 && c == col + 3)) {
            winningNumbers.push(countDR)
          }
          countDR++
        }
      }
      return

    case "diagonal-left":
      let countDL = 0
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
          // if this is one of the four winning numbers add it
          if ((r == row && c == col) ||
            (r == row + 1 && c == col - 1) ||
            (r == row + 2 && c == col - 2) ||
            (r == row + 3 && c == col - 3)) {
            winningNumbers.push(countDL)
          }
          countDL++
        }
      }
      return
  }
}

function isDraw() {
  return [...cellElements].every(cell => {
    return cell.classList.contains(RED_CLASS) ||
      cell.classList.contains(YELLOW_CLASS)
  })
}

function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = 'Draw!'
    winningMessageTextElement.setAttribute('style', 'color:white')
  } else {
    // check who won
    if (redTurn) {
      winningMessageTextElement.innerText = "Red Wins!"
      // can change this to red
      winningMessageTextElement.setAttribute('style', 'color:white')
    } else {
      winningMessageTextElement.innerText = "Yellow Wins!"
      // can change this to yellow
      winningMessageTextElement.setAttribute('style', 'color:white')
    }
  }
  // would be nice to have "Wins! in white text"
  // let content = document.createTextNode(" Wins!")
  // content.setAttribute('style', 'color:white')
  // winningMessageTextElement.appendChild(content)
  winningMessageElement.classList.add('show')

  // for each winning cell add an outline by adding .winner class
  cellElements.forEach((cell, i) => {
    // winning numbers is an array of each cell number that won
    if (winningNumbers.includes(i)) {
      cell.classList.add(WIN_CLASS)
    }
  })
}

//-------------------------------------------------//
//----------------DRAWING FUNCTIONS----------------//
//-------------------------------------------------//

function placeMark(cell, currentClass) {

  // FIX THIS ideally fix hover marks to also drop down

  let cellNumber = parseInt(cell.id)
  let columnNumber = getColumn(cellNumber)
  let rowNumber = getRow(cellNumber)
  let legalRowNum = nextLegalRow(columnNumber)


  // update our currentBoard
  currentBoard[legalRowNum][columnNumber] = currentClass

  // based on placed piece, update our visualization
  updateBoardDrawing()
}

function setBoardHoverClass() {
  boardElement.classList.remove(YELLOW_CLASS)
  boardElement.classList.remove(RED_CLASS)
  if (redTurn) {
    boardElement.classList.add(RED_CLASS)
  } else {
    boardElement.classList.add(YELLOW_CLASS)
  }
}

function updateBoardDrawing() {
  let flattenedBoard = []

  // go through entire board and keep track of placed pieces
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      flattenedBoard.push(currentBoard[row][col])
    }
  }

  // based on placed pieces, update our cells by id accordingly
  cellElements.forEach((cell, i) => {
    let val = flattenedBoard[i]
    if (val != 0) {
      // this adds the proper coloring to the proper cell
      cell.classList.add(val)
      // make it so you can't click on a placed cell twice
      cell.removeEventListener('click', handleClick)
    }
  })
}

//--------------------------------------------------------//
//----------------ROW AND COLUMN FUNCTIONS----------------//
//--------------------------------------------------------//

// returns the row number at which one can move
// based on the column selected and the current state
// of the board (you can only stack on top)
function nextLegalRow(columnNumber) {

  let columnArray = []

  // go through entire board and keep track of our column
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (col == columnNumber) {
        columnArray.push(currentBoard[row][col])
      }
    }
  }

  let legalRow

  // figure out which row we can next add piece to
  for (let i = 0; i < columnArray.length; i++) {
    if (columnArray[i] != 0) {
      legalRow = i - 1
      return legalRow
    }
  }

  // if empty then go to bottom row
  return 5
}

function getColumn(cellNumber) {
  switch (cellNumber % 7) {
    case 0:
      return 0
    case 1:
      return 1
    case 2:
      return 2
    case 3:
      return 3
    case 4:
      return 4
    case 5:
      return 5
    case 6:
      return 6
  }
}

function getRow(cellNumber) {
  if (cellNumber >= 0 && cellNumber <= 6) return 0
  if (cellNumber >= 7 && cellNumber <= 13) return 1
  if (cellNumber >= 14 && cellNumber <= 20) return 2
  if (cellNumber >= 21 && cellNumber <= 27) return 3
  if (cellNumber >= 28 && cellNumber <= 34) return 4
  if (cellNumber >= 35 && cellNumber <= 41) return 5
}