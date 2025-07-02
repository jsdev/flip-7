import { render } from 'preact';
import './index.css';
import { App } from './app';

// eslint-disable-next-line no-undef
const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
