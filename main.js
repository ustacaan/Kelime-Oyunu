// import keywords
import dictionaryMocks from './mocks/dictionary.json';
import targetWordsMocks from './mocks/targetWord.json';

// variables
const dictionary = dictionaryMocks;
const targetWords = targetWordsMocks;

const guessGrid = document.querySelector('[data-guess-grid]');
const alertContainer = document.querySelector('[data-alert-container]');
const keyboardContainer = document.querySelector('[data-keyboard]');
const targetWord = targetWords[Math.floor(Math.random() * 80)].toLocaleLowerCase('tr');

// trick :/
console.log(targetWord);

// play game
playGame();

function playGame() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
}

// stop game
function stopGame() {
  document.removeEventListener('click', handleMouseClick);
  document.removeEventListener('keydown', handleKeyPress);
}

// mouse click
function handleMouseClick(e) {
  if(e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

// keydown
function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if(e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-zığüşöçA-ZİĞÜŞÖÇ]$/)) {
    pressKey(e.key);
    return;
  }
}

// press keydown
function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= 5) { return; }
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLocaleLowerCase('tr');
  nextTile.innerText = key;
  nextTile.dataset.state = "active";
}

// delete key
function deleteKey() {
  const activeTiles = getActiveTiles();
  // find last tile
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile === undefined) { return; }
  // delete last tile
  lastTile.innerText = "";
  delete lastTile.dataset.state
  delete lastTile.dataset.letter
}

// submit guess
function submitGuess() {
  // nodeList to Array with spread operator
  const activeTiles = [...getActiveTiles()];

  // guess length is short 
  if (activeTiles.length !== 5) {
    showAlert('Tahmin ettiğin kelime çok kısa');
    shakeTiles(activeTiles);
    return;
  }

  // guess
  const guess = activeTiles.reduce((word,tile) => {
    return word + tile.dataset.letter;
  }, "");

  // guess is not have list
  if (!dictionary.includes(guess.toLocaleUpperCase('tr'))) {
    showAlert(`Tahmin ettiğin kelime listede yok: '${guess}'`);
    shakeTiles(activeTiles);
    return;
  }

  // guess is have list and is enough letter
  activeTiles.forEach((tile, index, array) => flipTile(tile, index, array, guess));
}

// flip tile
function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;

  // turkish char fix
  const key = keyboardContainer.querySelector(`[data-key="${letter.toLocaleUpperCase('tr')}"]`);

  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * 500) / 2);

  tile.addEventListener('animationend', () => {
    // animation remove
    tile.classList.remove("flip");
    
    // targetWord action
    if (targetWord[index] === letter) {
      tile.dataset.state = "correct";
      key.classList.add("correct"); 
    } else if(targetWord.includes(letter)) {
      tile.dataset.state = "wrong-location";
      key.classList.add("wrong-location");
    } else {
      tile.dataset.state = "wrong";
      key.classList.add("wrong");
    }

    if (index === array.length - 1) {
      tile.addEventListener('animationend', () => {
        playGame();
        checkWinLose(guess, array);
      }, { once: true })
    }
  }, { once: true })
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert(`Tebrikler Kazandın 🎉 tahmin: "${guess}"`, 5000);
    danceTiles(tiles);
    stopGame();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');

  if (remainingTiles.length === 0) {
    showAlert(`Kaybetiniz kelime: ${targetWord.toLocaleUpperCase('tr')}`, null) 
    stopGame();
  }
}

// get has data-state="active" tiles
function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

// show alert 
function showAlert(message, duration = 1300) {
  const alert = document.createElement("div");
  alert.innerHTML = message
  alert.classList.add("alert");
  alertContainer.prepend(alert);

  if (duration === null) { return; }

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    })
  }, duration);
}

// animations
function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake");
    tile.addEventListener('animationend', () => {
      tile.classList.remove("shake")
    }, { once: true })
  });
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {      
    tile.classList.add("dance");
    tile.addEventListener('animationend', () => {
      tile.classList.remove("dance")
    }, { once: true })
  }, index * 500 / 5);
  });
}