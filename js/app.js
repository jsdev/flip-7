// Main game controller and state for Flip 7

let deck, playerHand, currentTotal, cardsFlipped, isBusted;

function startGame() {
    deck = new Deck();
    deck.shuffle();
    playerHand = [];
    currentTotal = 0;
    cardsFlipped = 0;
    isBusted = false;
    clearBoard();
    updateInfoPanel(currentTotal, cardsFlipped);
    toggleGameButtons(false);
    displayMessage('Flip up to 7 cards without busting!');
}

function handleFlipClick() {
    if (isBusted) return;
    const card = deck.deal();
    if (!card) {
        displayMessage('No more cards in the deck.', 'bust');
        toggleGameButtons(true);
        return;
    }
    playerHand.push(card);
    renderCard(card);
    currentTotal += card.value;
    cardsFlipped++;
    handleAceAdjustment();
    updateInfoPanel(currentTotal, cardsFlipped);
    if (checkForBust()) return;
    if (cardsFlipped === 7) endRound('win');
}

function handleBankClick() {
    if (!isBusted) endRound('banked');
}

function checkForBust() {
    if (currentTotal > 21) {
        isBusted = true;
        endRound('bust');
        return true;
    }
    return false;
}

function handleAceAdjustment() {
    // If busted and hand contains Ace(s) valued at 11, reduce to 1
    if (currentTotal > 21) {
        for (const card of playerHand) {
            if (card.rank === 'A' && card.value === 11) {
                card.value = 1;
                currentTotal -= 10;
                if (currentTotal <= 21) break;
            }
        }
    }
}

function endRound(reason) {
    toggleGameButtons(true);
    if (reason === 'bust') displayMessage('You Busted!', 'bust');
    else if (reason === 'win') displayMessage('You Win!', 'win');
    else if (reason === 'banked') displayMessage('You Banked Your Score!', 'win');
}

function setupEventListeners() {
    document.getElementById('flip-btn').addEventListener('click', handleFlipClick);
    document.getElementById('bank-btn').addEventListener('click', handleBankClick);
    document.getElementById('new-game-btn').addEventListener('click', startGame);
}

// Deck import for browser
window.Deck = window.Deck || Deck;

window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startGame();
});
