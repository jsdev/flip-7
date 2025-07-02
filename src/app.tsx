import './app.css';
import GameBoard from './components/GameBoard';

export function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <GameBoard />
    </div>
  );
}

export default App;
