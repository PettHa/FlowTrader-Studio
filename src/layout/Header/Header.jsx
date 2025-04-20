import React from 'react';
import './Header.css'; // Use shared CSS file
import { Zap } from 'lucide-react'; // Example icon

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Simplified Brand */}
          <div className="header-brand">
             <a href="/" className="header-logo-link">
                <Zap size={24} style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                <h1 className="header-logo-text">FlowTrader</h1>
             </a>
          </div>

          {/* Optional: Placeholder for future actions */}
          <div className="header-actions">
            {/* Actions can be added here */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;