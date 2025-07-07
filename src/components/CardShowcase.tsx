import { useState } from 'preact/hooks';
import { generateDeck } from '../lib/deck';
import CardComponent from './CardComponent';
import { CardType } from '../types';

interface CardShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardShowcase({ isOpen, onClose }: CardShowcaseProps) {
  const [currentSection, setCurrentSection] = useState(0);

  if (!isOpen) return null;

  // Generate all card types for showcase
  const allCards = generateDeck();

  // Group cards by type
  const numberCards = allCards.filter((card) => card.type === 'number');
  const modifierCards = allCards.filter((card) => card.type === 'modifier');
  const actionCards = allCards.filter((card) => card.type === 'action');

  // Remove duplicates for cleaner display
  const uniqueNumberCards = numberCards.filter(
    (card, index, self) => index === self.findIndex((c) => c.value === card.value),
  );
  const uniqueModifierCards = modifierCards.filter(
    (card, index, self) => index === self.findIndex((c) => c.value === card.value),
  );
  const uniqueActionCards = actionCards.filter(
    (card, index, self) => index === self.findIndex((c) => c.value === card.value),
  );

  const sections = [
    {
      title: 'Number Cards',
      description: 'Basic point cards (0-12). You bust if you draw a duplicate number.',
      cards: uniqueNumberCards,
      getCardInfo: (card: CardType) => `${card.value} points`,
    },
    {
      title: 'Modifier Cards',
      description: 'Add to your score or multiply your total.',
      cards: uniqueModifierCards,
      getCardInfo: (card: CardType) =>
        card.value === 'X2' ? 'Doubles your score' : `+${card.value} points`,
    },
    {
      title: 'Action Cards',
      description: 'Special abilities to affect the game.',
      cards: uniqueActionCards,
      getCardInfo: (card: CardType) => {
        switch (card.value) {
          case 'Freeze':
            return "Skip another player's turn";
          case 'Flip Three':
            return 'Force another player to flip 3 cards';
          case 'Second Chance':
            return 'Survive one bust';
          default:
            return 'Special action';
        }
      },
    },
  ];

  const currentSectionData = sections[currentSection];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="card-showcase-overlay"
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        data-testid="card-showcase"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Card Showcase</h2>
            <p className="text-gray-600 mt-1">Explore all card types in Flip 7</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-center p-4 border-b bg-gray-50">
          {sections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 mx-2 rounded-lg transition-colors ${
                currentSection === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentSectionData.title}</h3>
            <p className="text-gray-600">{currentSectionData.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentSectionData.cards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                data-card-type={card.type}
              >
                <div className="mb-2">
                  <CardComponent card={card} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-800">
                    {card.type === 'number' ? `Card ${card.value}` : card.value}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentSectionData.getCardInfo(card)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card Counts */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Deck Composition</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>Number Cards:</strong> {numberCards.length} total
                <div className="text-xs text-blue-600 mt-1">
                  Cards 1-7 (3 each), Cards 8-12 (2 each), Card 13 (1)
                </div>
              </div>
              <div>
                <strong>Modifier Cards:</strong> {modifierCards.length} total
                <div className="text-xs text-blue-600 mt-1">+2, +4, +6, +8, +10, X2 (1 each)</div>
              </div>
              <div>
                <strong>Action Cards:</strong> {actionCards.length} total
                <div className="text-xs text-blue-600 mt-1">
                  Freeze, Flip Three, Second Chance (3 each)
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-blue-800">
              Total Deck Size: {allCards.length} cards
            </div>
          </div>

          {/* Scoring Information */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Scoring Rules</h4>
            <div className="text-sm text-green-700 space-y-2">
              <div>
                • <strong>Base Score:</strong> Sum of all number cards
              </div>
              <div>
                • <strong>X2 Modifier:</strong> Doubles your base score (applied first)
              </div>
              <div>
                • <strong>Addition Modifiers:</strong> Added after multiplication (+2, +4, +6, +8,
                +10)
              </div>
              <div>
                • <strong>Flip 7 Bonus:</strong> +21 points for collecting cards 1-7
              </div>
              <div>
                • <strong>Target Score:</strong> First to reach 75 points wins!
              </div>
            </div>
          </div>

          {/* Game Tips */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Strategy Tips</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• Bank early to secure points and avoid busting</div>
              <div>• Save the X2 modifier for when you have a high base score</div>
              <div>• Use action cards strategically to disrupt opponents</div>
              <div>• Going for Flip 7 is risky but offers a huge bonus</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
