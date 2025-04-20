import React from 'react';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react'; // Using Database icon
import './PriceNode.css'; // Ensure CSS is correctly imported

// Price node component: Represents the source of market data (OHLC, Volume)
const PriceNode = ({ data, selected, isConnectable }) => { // Added isConnectable prop
  // List of possible outputs from the market data
  // Define positions more dynamically if needed, or use fixed layout
  const outputs = [
    { id: 'open', label: 'Open', top: '20%' },
    { id: 'high', label: 'High', top: '35%' },
    { id: 'low', label: 'Low', top: '50%' },
    { id: 'close', label: 'Close', top: '65%' },
    { id: 'volume', label: 'Volume', top: '80%' },
    // Add other derived values if needed (e.g., 'hl2', 'hlc3')
  ];

  return (
    // Apply specific styling for the price node
    <div className={`strategy-node price-node ${selected ? 'selected' : ''}`}>
      {/* Header (not configurable in this version) */}
      <div className="node-header">
        <div className="node-title">
          {/* Display label from data or default */}
          {data.label || 'Market Data'}
        </div>
         {/* Icon indicating data source */}
         <Database size={14} />
      </div>

      {/* Content area displaying info - Keep minimal */}
      <div className="node-content">
        <p className="text-xs text-center text-gray-600">
          Source
        </p>
      </div>

      {/* Output Handles */}
      <div className="node-connections">
         <div className="connection-inputs"></div> {/* No inputs */}

         <div className="connection-outputs">
            {outputs.map(output => (
              <div key={output.id} className="handle-label-wrapper">
                {/* Position handle using style */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  className="react-flow__handle"
                  style={{ top: output.top }} // Apply vertical position
                  isConnectable={isConnectable} // Use prop
                />
                 {/* Position label using style */}
                <div className="connection-label" style={{ top: output.top }}>{output.label}</div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default React.memo(PriceNode);