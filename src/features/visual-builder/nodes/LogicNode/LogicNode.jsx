import React, { useCallback } from 'react'; // Removed useState
import { Handle, Position } from 'reactflow';
import { GitMerge } from 'lucide-react'; // Example icon
import './LogicNode.css';

// Logic node component: Combines boolean inputs using AND, OR, or NOT logic
const LogicNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  // No isEditing state needed

  // Define available logic types
  const logicTypes = [
    { value: 'AND', label: 'AND', description: 'Output is true if ALL inputs are true' },
    { value: 'OR', label: 'OR', description: 'Output is true if ANY input is true' },
    { value: 'NOT', label: 'NOT', description: 'Output is the inverse of the input' }
  ];

  // Get current logic type from data, default to AND
  const currentLogicType = data.logicType || 'AND';
  const currentLogic = logicTypes.find(l => l.value === currentLogicType) || logicTypes[0];

  // Determine if this node uses a single input (for NOT)
  const isSingleInput = currentLogicType === 'NOT';

  // Handle changes in the select dropdown
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'label' && value.trim() === '') {
       processedValue = null; // Store empty label as null
    }
    if (updateNodeData && id) {
      updateNodeData(id, { [name]: processedValue });
    }
  }, [updateNodeData, id]);

  // No toggleEdit function needed

  // Determine handle positions
  const inputA_Top = isSingleInput ? '50%' : '35%';
  const inputB_Top = '65%';
  const result_Top = '50%';

  return (
    // Removed isEditing class
    <div className={`strategy-node logic-node ${selected ? 'selected' : ''}`}>
      {/* Node Header - No longer clickable */}
      <div className="node-header">
        <div className="node-title">
          {/* Display custom label or the logic type */}
          {data.label || currentLogic.value}
        </div>
        <div className="logic-symbol-header" title={currentLogic.description}>
            {currentLogic.label}
        </div>
        {/* Toggle Icon Removed */}
      </div>

      {/* Always show configuration options */}
      {/* Logic Type Selector */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-logicType`}>Logic Type:</label>
        <select
          id={`${id}-logicType`}
          className="node-select"
          name="logicType"
          value={currentLogicType}
          onChange={handleChange}
        >
          {logicTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.description})
            </option>
          ))}
        </select>
      </div>

      {/* Label Input */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-label`}>Custom Label (Optional):</label>
        <input
          id={`${id}-label`}
          type="text"
          name="label"
          className="node-input"
          value={data.label || ''}
          onChange={handleChange}
          placeholder={`${currentLogic.value} Gate`}
        />
      </div>
      {/* Display Mode section removed */}


      {/* Input/Output Handles and Labels */}
      <div className="node-connections">
        <div className="connection-inputs">
          {/* Input A / Single Input */}
          <div className="handle-label-wrapper">
            <Handle
              type="target"
              position={Position.Left}
              id={isSingleInput ? "in" : "in1"} // Dynamic ID based on type
              className="react-flow__handle"
              style={{ top: inputA_Top }}
              isConnectable={isConnectable}
            />
            <div className="connection-label" style={{ top: inputA_Top }}>
              {isSingleInput ? "Input" : "Input A"}
            </div>
          </div>

          {/* Input B (only for AND/OR) */}
          {!isSingleInput && (
            <div className="handle-label-wrapper">
              <Handle
                type="target"
                position={Position.Left}
                id="in2" // Input B ID
                className="react-flow__handle"
                style={{ top: inputB_Top }}
                isConnectable={isConnectable}
              />
              <div className="connection-label" style={{ top: inputB_Top }}>Input B</div>
            </div>
          )}
        </div>

        <div className="connection-outputs">
          {/* Result Output Handle */}
          <div className="handle-label-wrapper">
            <Handle
              type="source"
              position={Position.Right}
              id="out" // Standard output ID
              className="react-flow__handle"
              style={{ top: result_Top }}
              isConnectable={isConnectable}
            />
            <div className="connection-label" style={{ top: result_Top }}>Result</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LogicNode);