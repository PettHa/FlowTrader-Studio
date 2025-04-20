import React from 'react';
import './App.css';
import Header from './layout/Header/Header.jsx';// Simplified Header
import VisualStrategyBuilder from './features/visual-builder/VisualStrategyBuilder.jsx';

function App() {
  console.log("[App.js Render] Rendering simplified App.");

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="container">
          <h2 className="builder-title">FlowTrader Studio</h2>
          {/* Render only the Visual Strategy Builder */}
          <VisualStrategyBuilder />
        </div>
      </main>
      {/* Footer can be added here if desired */}
    </div>
  );
}

export default App;