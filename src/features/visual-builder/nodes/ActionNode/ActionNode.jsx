import React, { useCallback } from 'react'; // Removed useState
import { Handle, Position } from 'reactflow';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Removed Chevron icons
import './ActionNode.css';

// Action node component: Represents trade entries or exits (Long/Short)
const ActionNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  // No isEditing state needed

  // Define available action types
  const actionTypes = [
    { value: 'ENTRY', label: 'Entry' },
    { value: 'EXIT', label: 'Exit' }
  ];

  // Define available position types
  const positionTypes = [
    { value: 'LONG', label: 'Long' },
    { value: 'SHORT', label: 'Short' }
  ];

  // Determine current settings from data, with defaults
  const currentActionType = data.actionType || 'ENTRY';
  const currentPositionType = data.positionType || 'LONG';
  const isLong = currentPositionType === 'LONG';
  const isEntry = currentActionType === 'ENTRY';

  // Get descriptive labels
  const currentActionLabel = actionTypes.find(a => a.value === currentActionType)?.label || 'Action';
  const currentPositionLabel = positionTypes.find(p => p.value === currentPositionType)?.label || 'Position';

  // Handle changes in select dropdowns
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (updateNodeData && id) {
      // Ensure label updates correctly if user clears it
      const updateValue = name === 'label' && value.trim() === '' ? null : value;
      updateNodeData(id, { [name]: updateValue });
    }
  }, [updateNodeData, id]);

  // No toggleEdit function needed

  // Get the appropriate icon (up for long, down for short)
  const getPositionIcon = () => {
    return isLong ?
      <ArrowUp size={14} className="position-icon long" title="Long Position" /> :
      <ArrowDown size={14} className="position-icon short" title="Short Position" />;
  };

  return (
    // Removed isEditing class and toggle related props from main div
    <div className={`strategy-node action-node ${selected ? 'selected' : ''} ${isLong ? 'long' : 'short'}`}>
      {/* Node Header - No longer clickable to toggle */}
      <div className="node-header">
        <div className="node-title">
          {/* Display custom label or generate default */}
          {data.label || `${currentActionLabel} ${currentPositionLabel}`}
        </div>
        {/* Toggle Icon Removed */}
        {getPositionIcon()} {/* Keep the icon in header */}
      </div>

      {/* Always show configuration inputs */}
      {/* Action Type Selector */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-actionType`}>Action Type:</label>
        <select
          id={`${id}-actionType`}
          className="node-select"
          name="actionType" // Name matches the data field
          value={currentActionType}
          onChange={handleChange}
        >
          {actionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Position Type Selector */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-positionType`}>Position Type:</label>
        <select
          id={`${id}-positionType`}
          className="node-select"
          name="positionType" // Name matches the data field
          value={currentPositionType}
          onChange={handleChange}
        >
          {positionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
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
          placeholder={`${currentActionLabel} ${currentPositionLabel}`}
        />
      </div>
      {/* Display Mode section removed */}

      {/* Input Handle (always present) */}
      <div className="node-connections">
        <div className="connection-inputs">
          <div className="handle-label-wrapper">
            {/* Use Handle component for connections */}
            <Handle
              type="target" // This node receives input
              position={Position.Left}
              id="trigger" // Unique ID for this handle
              className="react-flow__handle" // Use default handle styling plus specifics
              isConnectable={isConnectable}
              style={{ top: '50%' }} // Position handle vertically centered in its wrapper
            />
            <div className="connection-label">Trigger</div>
          </div>
        </div>
        {/* No output handles for Action nodes */}
        <div className="connection-outputs"></div>
      </div>
    </div>
  );
};

export default React.memo(ActionNode);