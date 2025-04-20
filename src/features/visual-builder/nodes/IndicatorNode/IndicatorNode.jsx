import React, { useCallback } from 'react'; // Removed useState
import { Handle, Position } from 'reactflow';
import { TrendingUp } from 'lucide-react'; // Use an icon for the header maybe
import './IndicatorNode.css';

// Indicator node component: Represents technical indicators like SMA, RSI, etc.
const IndicatorNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  // No isEditing state needed

  // Define available indicator types
  const indicatorTypes = [
    { value: 'SMA', label: 'Simple Moving Average' },
    { value: 'EMA', label: 'Exponential Moving Average' },
    { value: 'RSI', label: 'Relative Strength Index' },
    { value: 'MACD', label: 'MACD' },
    { value: 'BBANDS', label: 'Bollinger Bands' },
    { value: 'STOCH', label: 'Stochastic Oscillator' }
  ];

  // Get current indicator type from data, default to SMA
  const currentIndicatorType = data.indicatorType || 'SMA';
  const currentIndicator = indicatorTypes.find(i => i.value === currentIndicatorType) || indicatorTypes[0];

  // Handle changes in input fields or select dropdowns
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;

    let processedValue = value;
    let fieldToUpdate = name;

    // Handle standard number inputs
    if (type === 'number') {
      processedValue = value.trim() === '' ? '' : parseFloat(value);
      // Optional: Add validation or default if NaN
      if (value.trim() !== '' && isNaN(processedValue)) {
        console.warn(`Invalid number input for ${name}: ${value}`);
        return; // Or set a default, e.g., processedValue = 0;
      }
    } else if (name === 'label' && value.trim() === '') {
       processedValue = null; // Store empty label as null
    }


    if (updateNodeData && id) {
      updateNodeData(id, { [fieldToUpdate]: processedValue });
    }
  // Removed data.levels from dependency array as it's no longer directly managed here for RSI
  }, [updateNodeData, id]);


  // No toggleEdit function needed

  // --- Render Functions for Parameters and Handles ---

  // Generate parameter input fields based on the selected indicator type
  const renderParameters = () => {
    // Always show parameters now

    switch (currentIndicatorType) {
      case 'SMA':
      case 'EMA':
        return (
          <div className="node-param-group">
            <label className="node-param-label" htmlFor={`${id}-period`}>Period:</label>
            <input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 20} onChange={handleChange} min="1" />
          </div>
        );

      case 'RSI':
        return (
          <>
            <div className="node-param-group">
              <label className="node-param-label" htmlFor={`${id}-period`}>Period:</label>
              <input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 14} onChange={handleChange} min="1" />
            </div>
            {/* REMOVED Overbought/Oversold inputs from here */}
          </>
        );

      case 'MACD':
        return (
          <>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-fastPeriod`}>Fast Period:</label><input id={`${id}-fastPeriod`} type="number" className="node-input" name="fastPeriod" value={data.fastPeriod ?? 12} onChange={handleChange} min="1" /></div>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-slowPeriod`}>Slow Period:</label><input id={`${id}-slowPeriod`} type="number" className="node-input" name="slowPeriod" value={data.slowPeriod ?? 26} onChange={handleChange} min="1" /></div>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-signalPeriod`}>Signal Period:</label><input id={`${id}-signalPeriod`} type="number" className="node-input" name="signalPeriod" value={data.signalPeriod ?? 9} onChange={handleChange} min="1" /></div>
          </>
        );

      case 'BBANDS':
        return (
          <>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-period`}>Period:</label><input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 20} onChange={handleChange} min="1" /></div>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-stdDev`}>StdDev Multiplier:</label><input id={`${id}-stdDev`} type="number" className="node-input" name="stdDev" value={data.stdDev ?? 2} onChange={handleChange} min="0.1" step="0.1" /></div>
          </>
        );

      case 'STOCH':
        return (
          <>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-kPeriod`}>%K Period:</label><input id={`${id}-kPeriod`} type="number" className="node-input" name="kPeriod" value={data.kPeriod ?? 14} onChange={handleChange} min="1" /></div>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-dPeriod`}>%D Period:</label><input id={`${id}-dPeriod`} type="number" className="node-input" name="dPeriod" value={data.dPeriod ?? 3} onChange={handleChange} min="1" /></div>
            <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-slowing`}>Slowing:</label><input id={`${id}-slowing`} type="number" className="node-input" name="slowing" value={data.slowing ?? 3} onChange={handleChange} min="1" /></div>
          </>
        );

      default:
        return <div className="node-param-group"><p className="text-xs text-gray-500">No parameters for this indicator type.</p></div>;
    }
  };

  // Generate output handles based on the indicator type
  const renderOutputHandles = () => {
    // Base position adjusted slightly due to potentially more controls
    let handleBaseStyle = { top: '50%' }; // Default
    let handles = [];

    // Define handle positions - use percentages for flexibility
    const positions = {
        single: '50%',
        dual_top: '40%',
        dual_bottom: '60%',
        triple_top: '30%',
        triple_mid: '50%',
        triple_bottom: '70%',
    };


    switch (currentIndicatorType) {
      case 'SMA':
      case 'EMA':
        handles.push({ id: 'value', label: 'Value', top: positions.single });
        break;

      case 'RSI':
        handles.push({ id: 'value', label: 'RSI', top: positions.single }); // Only output RSI value
        break;

      case 'MACD':
        handles.push({ id: 'macd', label: 'MACD', top: positions.triple_top });
        handles.push({ id: 'signal', label: 'Signal', top: positions.triple_mid });
        handles.push({ id: 'histogram', label: 'Hist', top: positions.triple_bottom });
        break;

      case 'BBANDS':
        handles.push({ id: 'upper', label: 'Upper', top: positions.triple_top });
        handles.push({ id: 'middle', label: 'Middle', top: positions.triple_mid });
        handles.push({ id: 'lower', label: 'Lower', top: positions.triple_bottom });
        break;

      case 'STOCH':
        handles.push({ id: '%k', label: '%K', top: positions.dual_top });
        handles.push({ id: '%d', label: '%D', top: positions.dual_bottom });
        break;

      default: // Default for unknown types
        handles.push({ id: 'value', label: 'Value', top: positions.single });
    }

    return (
        <div className="connection-outputs">
            {handles.map(handle => (
                 <div className="handle-label-wrapper" key={handle.id}>
                     <Handle
                        type="source"
                        position={Position.Right}
                        id={handle.id}
                        className="react-flow__handle"
                        style={{ top: handle.top }} // Apply dynamic top position
                        isConnectable={isConnectable}
                      />
                      <div className="connection-label" style={{ top: handle.top }}>{handle.label}</div>
                 </div>
            ))}
        </div>
    );
  };

  // Subtitle removed

  return (
    // Removed isEditing class
    <div className={`strategy-node indicator-node ${selected ? 'selected' : ''}`}>
      {/* Node Header */}
      <div className="node-header">
        <div className="node-title">
          {data.label || currentIndicator.label}
        </div>
        <TrendingUp size={14} /> {/* Example Icon */}
        {/* Toggle Icon Removed */}
      </div>

      {/* Indicator Type Selector */}
      <div className="node-param-group">
        <label className="node-param-label" htmlFor={`${id}-indicatorType`}>Indicator Type:</label>
        <select
          id={`${id}-indicatorType`}
          className="node-select"
          name="indicatorType"
          value={currentIndicatorType}
          onChange={handleChange}
        >
          {indicatorTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Parameters (always rendered now) */}
      {renderParameters()}

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
          placeholder={currentIndicator.label}
        />
      </div>

      {/* Subtitle removed */}

      {/* Input/Output Handles */}
      <div className="node-connections">
        <div className="connection-inputs">
           <div className="handle-label-wrapper">
              <Handle
                type="target"
                position={Position.Left}
                id="input" // Standard input ID
                className="react-flow__handle"
                style={{ top: '50%' }}
                isConnectable={isConnectable}
              />
              <div className="connection-label" style={{ top: '50%' }}>Input</div>
           </div>
        </div>
        {renderOutputHandles()}
      </div>
    </div>
  );
};

export default React.memo(IndicatorNode);