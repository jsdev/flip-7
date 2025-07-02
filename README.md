# Software Plan: Flip 7 Web Game (Modular)

## Bake Accessibility In
This game will use native interactive elements and elements that natively hold state
- [ ] **Github Actions**
    - [ ] Lighthouse CI
    - [ ] Axe Linter
    - [ ] ESLint

## Outline

This document outlines a modular development plan for the web-based card game "Flip 7". The goal is to separate concerns into distinct files for logic, UI manipulation, and styling.

### Project File Structure


/
├── index.html
├── styles/
│   └── style.css
└── js/
├── app.js       // Main game controller and state
├── deck.js      // Deck and Card class definitions
└── ui.js        // DOM manipulation functions


---

### Phase 1: Foundational Setup & Core Objects

This phase focuses on creating the project structure and the fundamental data models for the game.

- [ ] **Project Initialization**
    - [x] Create the directory structure as defined above.
    - [x] Set up a Git repository (`git init`).
    - [x] Create `index.html`, `styles/style.css`, `js/app.js`, `js/deck.js`, and `js/ui.js`.

- [ ] **HTML Structure (`index.html`)**
    - [ ] Set up the basic HTML document structure (`<!DOCTYPE html>`, `head`, `body`).
    - [ ] Link to the stylesheet: `<link rel="stylesheet" href="styles/style.css">`.
    - [ ] Link to the JavaScript files (in order): `<script src="js/deck.js"></script>`, `<script src="js/ui.js"></script>`, `<script src="js/app.js" defer></script>`.
    - [ ] Create the main game container: `<div id="game-board">`.
    - [ ] Add display areas inside the board:
        - `<div id="info-panel">` for score and card count.
        - `<div id="player-hand">` to hold the flipped cards.
        - `<div id="deck-area">` for the deck and status messages.
    - [ ] Add control buttons: `<button id="flip-btn">Flip Card</button>`, `<button id="bank-btn">Bank</button>`, `<button id="new-game-btn">New Game</button>`.
    - [ ] Add elements for displaying data: `<span id="current-total">0</span>`, `<span id="cards-flipped">0</span>`, and `<p id="game-message"></p>`.

- [ ] **Card & Deck Modeling (`js/deck.js`)**
    - [ ] Create a `Deck` class.
    - [ ] In the `Deck` constructor, generate a 52-card array of objects. Each card object should have `suit`, `rank`, and `value`.
    - [ ] Implement a `shuffle()` method within the `Deck` class to randomize the card array.
    - [ ] Implement a `deal()` method to remove and return the top card from the deck.

---

### Phase 2: Visuals & UI Rendering

This phase focuses on styling the game and writing the JavaScript functions that will render game state to the screen.

- [ ] **Core Layout Styling (`styles/style.css`)**
    - [ ] Style the `body` for background and font.
    - [ ] Style the `#game-board` to center it on the page.
    - [ ] Arrange `#info-panel`, `#player-hand`, and `#deck-area` using Flexbox or Grid.
    - [ ] Style the control buttons (`#flip-btn`, etc.) with clear hover and active states.

- [ ] **Card Styling (`styles/style.css`)**
    - [ ] Create a `.card` class for the basic dimensions, border, and shadow of a card.
    - [ ] Create styles for card suits (e.g., `.suit-hearts`, `.suit-diamonds`) to color the text.
    - [ ] Create a `.card-back` class to represent the unflipped deck.

- [ ] **UI Rendering Logic (`js/ui.js`)**
    - [ ] Create a `renderCard(cardObject)` function that:
        - Creates a `div` element with the class `.card`.
        - Populates its content with the card's rank and suit.
        - Appends it to the `#player-hand` container.
    - [ ] Create an `updateInfoPanel(total, cardCount)` function to update the text of `#current-total` and `#cards-flipped`.
    - [ ] Create a `displayMessage(message, type)` function to update `#game-message` and add a class (e.g., `.win-message`, `.bust-message`) for styling.
    - [ ] Create a `clearBoard()` function that removes all cards from `#player-hand` and resets messages.
    - [ ] Create a `toggleGameButtons(disabled)` function to enable/disable the "Flip" and "Bank" buttons.

---

### Phase 3: Gameplay Implementation & State Management

This phase connects all the pieces by implementing the game's rules and state changes in the main controller file.

- [ ] **Game State & Initialization (`js/app.js`)**
    - [ ] Define global state variables: `deck`, `playerHand`, `currentTotal`, `cardsFlipped`, `isBusted`.
    - [ ] Write a `startGame()` function that:
        - Resets all state variables to their initial values.
        - Calls `clearBoard()` from `ui.js`.
        - Creates a new `Deck` instance and shuffles it.
        - Updates the UI using `updateInfoPanel()` and `toggleGameButtons()`.
    - [ ] Add event listeners for the three control buttons, linking them to handler functions.
    - [ ] Call `startGame()` once the script loads to begin the first game.

- [ ] **"Flip Card" Action (`js/app.js`)**
    - [ ] Create a `handleFlipClick()` function.
    - [ ] Inside the function:
        - `deal()` a card from the `deck`.
        - Add the card to the `playerHand` array.
        - Call `renderCard()` from `ui.js` to display it.
        - Update `currentTotal` and `cardsFlipped`.
        - Call a `checkForBust()` helper function.
        - Call `updateInfoPanel()` from `ui.js`.
        - Check for win/loss conditions.

- [ ] **Game Rules Logic (`js/app.js`)**
    - [ ] Create a `checkForBust()` function that checks `currentTotal`. If over the limit, it should set `isBusted` to true and call an `endRound()` function.
    - [ ] Enhance the `handleFlipClick` function to check if `cardsFlipped === 7`. If so, call `endRound()`.
    - [ ] Implement logic to handle Ace values (e.g., reduce total by 10 if a bust occurs and an Ace is in hand).

- [ ] **"Bank" & End Round Actions (`js/app.js`)**
    - [ ] Create a `handleBankClick()` function that calls `endRound('banked')`.
    - [ ] Create the `endRound(reason)` function that:
        - Displays the final message (`You Busted!`, `You Win!`, `You Banked Your Score!`) using `displayMessage()` from `ui.js`.
        - Disables the "Flip" and "Bank" buttons using `toggleGameButtons()` from `ui.js`.

---

### Phase 4 & 5: Polish and Deployment

These final phases are for refinement and release.

- [ ] **Polish**
    - [ ] **Animations (`styles/style.css`):** Add a CSS animation for the card flip.
    - [ ] **Sound (`js/app.js`):** Add simple sound effects for flip, bust, and win events (optional).
    - [ ] **Instructions (`index.html`):** Add a "How to Play" section.
- [ ] **Testing**
    - [ ] Test all button functionalities and game logic paths.
    - [ ] Test on multiple browsers and screen sizes.
- [ ] **Deployment**
    - [ ] Deploy the project folder to a hosting service like GitHub Pages or Netlify.
