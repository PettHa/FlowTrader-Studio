import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, GitCompare, GitMerge, Play, ChevronDown } from 'lucide-react'; // Changed Logic icon
import './AddNodeDropdown.css'

// Node types grouped by category, including default data
const NODE_TYPES = [
  {
    category: 'Indicators',
    items: [
      { type: 'indicatorNode', label: 'SMA', data: { label: 'SMA', indicatorType: 'SMA', period: 20 } },
      { type: 'indicatorNode', label: 'EMA', data: { label: 'EMA', indicatorType: 'EMA', period: 20 } },
      // Removed default levels from RSI data
      { type: 'indicatorNode', label: 'RSI', data: { label: 'RSI', indicatorType: 'RSI', period: 14 } },
      { type: 'indicatorNode', label: 'MACD', data: { label: 'MACD', indicatorType: 'MACD', fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      { type: 'indicatorNode', label: 'Bollinger Bands', data: { label: 'Bollinger', indicatorType: 'BBANDS', period: 20, stdDev: 2 } },
      { type: 'indicatorNode', label: 'Stochastic', data: { label: 'Stoch', indicatorType: 'STOCH', kPeriod: 14, dPeriod: 3, slowing: 3 } }
    ]
  },
  {
    category: 'Conditions',
    items: [
      { type: 'conditionNode', label: 'Greater Than', data: { label: '>', conditionType: 'GT' } },
      { type: 'conditionNode', label: 'Less Than', data: { label: '<', conditionType: 'LT' } },
      { type: 'conditionNode', label: 'Equals', data: { label: '=', conditionType: 'EQ' } },
      { type: 'conditionNode', label: 'Crosses Above', data: { label: 'Crosses ↑', conditionType: 'CROSS_ABOVE' } },
      { type: 'conditionNode', label: 'Crosses Below', data: { label: 'Crosses ↓', conditionType: 'CROSS_BELOW' } }
    ]
  },
  {
    category: 'Logic',
    items: [
      { type: 'logicNode', label: 'AND', data: { label: 'AND', logicType: 'AND' } },
      { type: 'logicNode', label: 'OR', data: { label: 'OR', logicType: 'OR' } },
      { type: 'logicNode', label: 'NOT', data: { label: 'NOT', logicType: 'NOT' } }
    ]
  },
  {
    category: 'Actions',
    items: [
      { type: 'actionNode', label: 'Long Entry', data: { label: 'Enter Long', actionType: 'ENTRY', positionType: 'LONG' } },
      { type: 'actionNode', label: 'Long Exit', data: { label: 'Exit Long', actionType: 'EXIT', positionType: 'LONG' } },
      { type: 'actionNode', label: 'Short Entry', data: { label: 'Enter Short', actionType: 'ENTRY', positionType: 'SHORT' } },
      { type: 'actionNode', label: 'Short Exit', data: { label: 'Exit Short', actionType: 'EXIT', positionType: 'SHORT' } }
    ]
  }
];

// Helper function to get icon based on node type
const getNodeIcon = (type) => {
  switch (type) {
    case 'indicatorNode': return <TrendingUp size={16} />;
    case 'conditionNode': return <GitCompare size={16} />;
    case 'logicNode': return <GitMerge size={16} />; // Updated Logic icon
    case 'actionNode': return <Play size={16} />;
    default: return null;
  }
};

// Helper function to get CSS class for icon background
const getIconClass = (type) => {
  switch (type) {
    case 'indicatorNode': return 'indicator';
    case 'conditionNode': return 'condition';
    case 'logicNode': return 'logic';
    case 'actionNode': return 'action';
    default: return '';
  }
};

/**
 * Dropdown menu component for adding new nodes to the strategy flow.
 */
function AddNodeDropdown({ onAddNode, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown menu container
  const buttonRef = useRef(null); // Ref for the button that triggers the dropdown

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if the click is outside both the button and the menu
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener on component unmount or when isOpen changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Re-run effect when isOpen changes

  // Handle selecting a node type from the menu
  const handleNodeSelect = (type, data) => {
    if (onAddNode) {
      onAddNode(type, data); // Pass the type and default data
    }
    setIsOpen(false); // Close the menu after selection
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="add-node-dropdown" ref={buttonRef}> {/* Attach ref to the main container */}
      <button
        className="strategy-control-btn primary-btn" // Use primary style for add button
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Add a new node to the strategy"
      >
        + Add Node <ChevronDown size={14} className={`ml-1 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="add-node-menu" ref={dropdownRef}> {/* Attach ref to the menu */}
          <div className="add-node-menu-header">Add Node</div>

          {NODE_TYPES.map((category) => (
            <div key={category.category} className="add-node-menu-group">
              <div className="add-node-menu-group-title">{category.category}</div>

              {category.items.map((item) => (
                <button
                  key={`${item.type}-${item.label}`}
                  className="add-node-menu-item"
                  onClick={() => handleNodeSelect(item.type, item.data)}
                  title={`Add ${item.label} node`}
                >
                  <div className={`add-node-icon ${getIconClass(item.type)}`}>
                    {getNodeIcon(item.type)}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddNodeDropdown;