import React, { useCallback } from 'react'; // Removed useState
import { Handle, Position } from 'reactflow';
// Removed Chevron icons
import './ConditionNode.css';

// Condition node component: Compares two inputs or one input against a threshold
const ConditionNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  // No isEditing state needed

  // Define available condition types with labels and descriptions
  const conditionTypes = [
    { value: 'GT', label: '>', description: 'Greater Than' },
    { value: 'LT', label: '<', description: 'Less Than' },
    { value: 'EQ', label: '=', description: 'Equals' },
    { value: 'CROSS_ABOVE', label: '↗', description: 'Crosses Above' },
    { value: 'CROSS_BELOW', label: '↘', description: 'Crosses Below' }
    // Add more conditions like '!=' (Not Equals), '>=', '<=' if needed
  ];

  // Get current condition settings from data, with defaults
  const currentConditionType = data.conditionType || 'GT';
  const currentCondition = conditionTypes.find(c => c.value === currentConditionType) || conditionTypes[0];

  // Determine if a threshold value is being used (input B is ignored if threshold is set)
  const thresholdValue = data.threshold;
  const usesThreshold = typeof thresholdValue === 'number' && !isNaN(thresholdValue);

  // Handle changes in select dropdowns or input fields
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === 'threshold') {
      // Allow empty string to unset the threshold, otherwise parse as float
      processedValue = value.trim() === '' ? '' : parseFloat(value);
      if (value.trim() !== '' && isNaN(processedValue)) {
        processedValue = 0; // Default to 0 if invalid number entered (or handle differently)
      }
    } else if (name === 'label' && value.trim() === '') {
       processedValue = null; // Store empty label as null/undefined
    }
    // Add handling for other potential number inputs if needed

    if (updateNodeData && id) {
      updateNodeData(id, { [name]: processedValue });
    }
  }, [updateNodeData, id]);


  // No toggleEdit function needed

  // Determine handle positions based on whether threshold is used
  const inputA_Top = usesThreshold ? '50%' : '35%';
  const inputB_Top = '65%';
  const result_Top = '50%';

  return (
    // Removed isEditing class
    <div className={`strategy-node condition-node ${selected ? 'selected' : ''}`}>
      {/* Node Header - No longer clickable */}
      <div className="node-header">
        <div className="node-title">
          {/* Display custom label or generate default */}
          {data.label || currentCondition.description}
        </div>
        {/* Display condition symbol in header */}
        <div className="condition-symbol-header" title={currentCondition.description}>
            {currentCondition.label}
            {usesThreshold && ` ${thresholdValue}`} {/* Show threshold value if used */}
        </div>
        {/* Toggle Icon Removed */}
      </div>

      {/* Always show configuration options */}
      {/* Condition Type Selector */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-conditionType`}>Condition Type:</label>
        <select
          id={`${id}-conditionType`}
          className="node-select"
          name="conditionType"
          value={currentConditionType}
          onChange={handleChange}
        >
          {conditionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.description})
            </option>
          ))}
        </select>
      </div>

      {/* Threshold Input */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-threshold`}>Threshold Value (Optional):</label>
        <input
          id={`${id}-threshold`}
          type="number"
          name="threshold"
          className="node-input"
          value={thresholdValue ?? ''} // Use empty string if null/undefined
          onChange={handleChange}
          step="any" // Allow decimals
          placeholder="Use Input B if empty"
        />
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
          placeholder={currentCondition.description}
        />
      </div>
      {/* Display Mode section removed */}

      {/* Input/Output Handles and Labels */}
      <div className="node-connections">
        <div className="connection-inputs">
          {/* Input A Handle */}
          <div className="handle-label-wrapper">
            <Handle
              type="target"
              position={Position.Left}
              id="a" // ID for Input A
              className="react-flow__handle"
              style={{ top: inputA_Top }} // Dynamic top position
              isConnectable={isConnectable}
            />
            <div className="connection-label" style={{ top: inputA_Top }}>Input A</div>
          </div>

          {/* Input B Handle (only shown if threshold is NOT used) */}
          {!usesThreshold && (
             <div className="handle-label-wrapper">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="b" // ID for Input B
                    className="react-flow__handle"
                    style={{ top: inputB_Top }} // Position bottom
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
                id="result" // ID for the boolean result
                className="react-flow__handle"
                style={{ top: result_Top }} // Center the output handle
                isConnectable={isConnectable}
              />
              <div className="connection-label" style={{ top: result_Top }}>Result</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConditionNode);