import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, GitCompare, GitMerge, Play, ChevronDown } from 'lucide-react';
import './AddNodeDropdown.css'

// Node types grouped by category, including default data
const NODE_TYPES = [
  {
    category: 'Indicators',
    items: [
      // Fjernet 'label' fra data
      { type: 'indicatorNode', label: 'SMA', data: { indicatorType: 'SMA', period: 20 } },
      { type: 'indicatorNode', label: 'EMA', data: { indicatorType: 'EMA', period: 20 } },
      { type: 'indicatorNode', label: 'RSI', data: { indicatorType: 'RSI', period: 14 } },
      { type: 'indicatorNode', label: 'MACD', data: { indicatorType: 'MACD', fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      { type: 'indicatorNode', label: 'Bollinger Bands', data: { indicatorType: 'BBANDS', period: 20, stdDev: 2 } },
      { type: 'indicatorNode', label: 'Stochastic', data: { indicatorType: 'STOCH', kPeriod: 14, dPeriod: 3, slowing: 3 } }
    ]
  },
  {
    category: 'Conditions',
    items: [
      // Fjernet 'label' fra data
      { type: 'conditionNode', label: 'Greater Than', data: { conditionType: 'GT' } },
      { type: 'conditionNode', label: 'Less Than', data: { conditionType: 'LT' } },
      { type: 'conditionNode', label: 'Equals', data: { conditionType: 'EQ' } },
      { type: 'conditionNode', label: 'Crosses Above', data: { conditionType: 'CROSS_ABOVE' } },
      { type: 'conditionNode', label: 'Crosses Below', data: { conditionType: 'CROSS_BELOW' } }
    ]
  },
  {
    category: 'Logic',
    items: [
       // Fjernet 'label' fra data
      { type: 'logicNode', label: 'AND', data: { logicType: 'AND' } },
      { type: 'logicNode', label: 'OR', data: { logicType: 'OR' } },
      { type: 'logicNode', label: 'NOT', data: { logicType: 'NOT' } }
    ]
  },
  {
    category: 'Actions',
    items: [
      // Fjernet 'label' fra data
      { type: 'actionNode', label: 'Long Entry', data: { actionType: 'ENTRY', positionType: 'LONG' } },
      { type: 'actionNode', label: 'Long Exit', data: { actionType: 'EXIT', positionType: 'LONG' } },
      { type: 'actionNode', label: 'Short Entry', data: { actionType: 'ENTRY', positionType: 'SHORT' } },
      { type: 'actionNode', label: 'Short Exit', data: { actionType: 'EXIT', positionType: 'SHORT' } }
    ]
  }
];

// Helper function to get icon based on node type
const getNodeIcon = (type) => {
  switch (type) {
    case 'indicatorNode': return <TrendingUp size={16} />;
    case 'conditionNode': return <GitCompare size={16} />;
    case 'logicNode': return <GitMerge size={16} />;
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

function AddNodeDropdown({ onAddNode, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNodeSelect = (type, nodeData) => {
    if (onAddNode) {
      // console.log("[AddNodeDropdown] Adding node:", type, "with data:", nodeData); // Debug log
      onAddNode(type, nodeData); // Sender nå data UTEN label
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="add-node-dropdown" ref={buttonRef}>
      <button
        className="strategy-control-btn primary-btn"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Add a new node to the strategy"
      >
        + Add Node <ChevronDown size={14} className={`ml-1 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="add-node-menu" ref={dropdownRef}>
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