import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element safely
const container = document.getElementById('root');

if (!container) {
  throw new Error("Root element not found. Make sure you have <div id='root'></div> in index.html");
}

// Create root and render app
const root = createRoot(container);
root.render(<App />);
