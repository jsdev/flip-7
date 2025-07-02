import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import GameBoard from './components/GameBoard.jsx';

export function App() {
  return <GameBoard />;
}

export default App;
