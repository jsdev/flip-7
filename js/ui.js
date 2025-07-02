// DOM manipulation functions for Flip 7

/**
 * Render a card to the #player-hand container with accessibility in mind.
 * @param {Card} cardObject
 */
export function renderCard(cardObject) {
    const hand = document.getElementById('player-hand');
    const cardDiv = document.createElement('div');
    cardDiv.className = `card suit-${cardObject.suit}`;
    cardDiv.setAttribute('role', 'img');
    cardDiv.setAttribute('aria-label', `${cardObject.rank} of ${cardObject.suit}`);
    cardDiv.tabIndex = 0;
    cardDiv.innerHTML = `
        <span class="card-rank">${cardObject.rank}</span>
        <span class="card-suit">${getSuitSymbol(cardObject.suit)}</span>
    `;
    hand.appendChild(cardDiv);
}

function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return '';
    }
}

/**
 * Update the info panel with the current total and card count.
 */
export function updateInfoPanel(total, cardCount) {
    document.getElementById('current-total').textContent = total;
    document.getElementById('cards-flipped').textContent = cardCount;
}

/**
 * Display a message in the game message area, with optional type for styling.
 */
export function displayMessage(message, type = '') {
    const msg = document.getElementById('game-message');
    msg.textContent = message;
    msg.className = type ? `${type}-message` : '';
}

/**
 * Clear the player hand and reset messages.
 */
export function clearBoard() {
    document.getElementById('player-hand').innerHTML = '';
    displayMessage('');
}

/**
 * Enable or disable the Flip and Bank buttons.
 */
export function toggleGameButtons(disabled) {
    document.getElementById('flip-btn').disabled = disabled;
    document.getElementById('bank-btn').disabled = disabled;
}
