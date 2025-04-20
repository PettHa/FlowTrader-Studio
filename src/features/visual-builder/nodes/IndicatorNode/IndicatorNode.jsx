import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import './IndicatorNode.css';

const indicatorTypes = [
  { value: 'SMA', label: 'Simple Moving Average' },
  { value: 'EMA', label: 'Exponential Moving Average' },
  { value: 'RSI', label: 'Relative Strength Index' },
  { value: 'MACD', label: 'MACD' },
  { value: 'BBANDS', label: 'Bollinger Bands' },
  { value: 'STOCH', label: 'Stochastic Oscillator' }
];

const IndicatorNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentIndicatorType = data.indicatorType || 'SMA';
  const currentIndicator = indicatorTypes.find(i => i.value === currentIndicatorType) || indicatorTypes[0];

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    let fieldToUpdate = name;

    if (type === 'number') {
      processedValue = value.trim() === '' ? '' : parseFloat(value);
      if (value.trim() !== '' && isNaN(processedValue)) {
        console.warn(`[IndicatorNode ${id}] Invalid number input for ${name}: ${value}`);
        return;
      }
    } else if (name === 'label') {
       processedValue = value.trim() === '' ? null : value;
    }

    if (updateNodeData && id) {
      updateNodeData(id, { [fieldToUpdate]: processedValue });
    }
  }, [updateNodeData, id]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const renderParameters = () => {
    if (!isExpanded) return null;
    switch (currentIndicatorType) {
      case 'SMA': case 'EMA':
        return <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-period`}>Period:</label><input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 20} onChange={handleChange} min="1" /></div>;
      case 'RSI':
        return <div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-period`}>Period:</label><input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 14} onChange={handleChange} min="1" /></div>;
      case 'MACD':
        return (<><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-fastPeriod`}>Fast Period:</label><input id={`${id}-fastPeriod`} type="number" className="node-input" name="fastPeriod" value={data.fastPeriod ?? 12} onChange={handleChange} min="1" /></div><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-slowPeriod`}>Slow Period:</label><input id={`${id}-slowPeriod`} type="number" className="node-input" name="slowPeriod" value={data.slowPeriod ?? 26} onChange={handleChange} min="1" /></div><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-signalPeriod`}>Signal Period:</label><input id={`${id}-signalPeriod`} type="number" className="node-input" name="signalPeriod" value={data.signalPeriod ?? 9} onChange={handleChange} min="1" /></div></>);
      case 'BBANDS':
        return (<><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-period`}>Period:</label><input id={`${id}-period`} type="number" className="node-input" name="period" value={data.period ?? 20} onChange={handleChange} min="1" /></div><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-stdDev`}>StdDev Multiplier:</label><input id={`${id}-stdDev`} type="number" className="node-input" name="stdDev" value={data.stdDev ?? 2} onChange={handleChange} min="0.1" step="0.1" /></div></>);
      case 'STOCH':
        return (<><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-kPeriod`}>%K Period:</label><input id={`${id}-kPeriod`} type="number" className="node-input" name="kPeriod" value={data.kPeriod ?? 14} onChange={handleChange} min="1" /></div><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-dPeriod`}>%D Period:</label><input id={`${id}-dPeriod`} type="number" className="node-input" name="dPeriod" value={data.dPeriod ?? 3} onChange={handleChange} min="1" /></div><div className="node-param-group"><label className="node-param-label" htmlFor={`${id}-slowing`}>Slowing:</label><input id={`${id}-slowing`} type="number" className="node-input" name="slowing" value={data.slowing ?? 3} onChange={handleChange} min="1" /></div></>);
      default: return <div className="node-param-group"><p className="text-xs text-gray-500">No parameters.</p></div>;
    }
  };

  const renderOutputHandles = () => {
    const positions = { single: '50%', dual_top: '40%', dual_bottom: '60%', triple_top: '30%', triple_mid: '50%', triple_bottom: '70%' };
    let handles = [];
    switch (currentIndicatorType) {
      case 'SMA': case 'EMA': handles.push({ id: 'value', label: 'Value', top: positions.single }); break;
      case 'RSI': handles.push({ id: 'value', label: 'RSI', top: positions.single }); break;
      case 'MACD': handles.push({ id: 'macd', label: 'MACD', top: positions.triple_top }, { id: 'signal', label: 'Signal', top: positions.triple_mid }, { id: 'histogram', label: 'Hist', top: positions.triple_bottom }); break;
      case 'BBANDS': handles.push({ id: 'upper', label: 'Upper', top: positions.triple_top }, { id: 'middle', label: 'Middle', top: positions.triple_mid }, { id: 'lower', label: 'Lower', top: positions.triple_bottom }); break;
      case 'STOCH': handles.push({ id: '%k', label: '%K', top: positions.dual_top }, { id: '%d', label: '%D', top: positions.dual_bottom }); break;
      default: handles.push({ id: 'value', label: 'Value', top: positions.single });
    }
    return <div className="connection-outputs">{handles.map(h => <div className="handle-label-wrapper" key={h.id}><Handle type="source" position={Position.Right} id={h.id} className="react-flow__handle" style={{ top: h.top }} isConnectable={isConnectable} /><div className="connection-label" style={{ top: h.top }}>{h.label}</div></div>)}</div>;
  };

  const getSummaryText = () => {
    let summaryText = currentIndicator.label; // Fallback
    const period = data.period ?? '?';
    const fastPeriod = data.fastPeriod ?? '?';
    const slowPeriod = data.slowPeriod ?? '?';
    const signalPeriod = data.signalPeriod ?? '?';
    const stdDev = data.stdDev ?? '?';
    const kPeriod = data.kPeriod ?? '?';
    const dPeriod = data.dPeriod ?? '?';
    const slowing = data.slowing ?? '?';
    switch (currentIndicatorType) {
      case 'SMA': case 'EMA': case 'RSI': summaryText = `${currentIndicatorType}(${period})`; break;
      case 'MACD': summaryText = `MACD(${fastPeriod}, ${slowPeriod}, ${signalPeriod})`; break;
      case 'BBANDS': summaryText = `BB(${period}, ${stdDev})`; break;
      case 'STOCH': summaryText = `Stoch(${kPeriod}, ${dPeriod}, ${slowing})`; break;
      default: summaryText = currentIndicatorType;
    }
    return summaryText;
  };

  const getHeaderTitle = () => {
    if (data.label && data.label.trim() !== '') {
        return data.label;
    }
    return getSummaryText();
  };

  return (
    <div className={`strategy-node indicator-node ${selected ? 'selected' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="node-header" onClick={toggleExpand} title={isExpanded ? 'Collapse' : 'Expand'}>
        <div className="node-title">
          {getHeaderTitle()}
        </div>
        <TrendingUp size={14} className="node-header-icon" />
        {isExpanded ? <ChevronUp className="edit-toggle-icon" size={14} /> : <ChevronDown className="edit-toggle-icon" size={14} />}
      </div>

      {!isExpanded && (
          <div className="node-summary" title={getHeaderTitle()}>
              {getHeaderTitle()}
          </div>
      )}

      {isExpanded && (
          <>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-indicatorType`}>Indicator Type:</label>
                <select id={`${id}-indicatorType`} className="node-select" name="indicatorType" value={currentIndicatorType} onChange={handleChange}>
                  {indicatorTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              {renderParameters()}
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-label`}>Custom Label (Optional):</label>
                <input id={`${id}-label`} type="text" name="label" className="node-input" value={data.label || ''} onChange={handleChange} placeholder={getSummaryText()}/>
              </div>
          </>
      )}

      <div className="node-connections">
        <div className="connection-inputs">
           <div className="handle-label-wrapper">
              <Handle type="target" position={Position.Left} id="input" className="react-flow__handle" style={{ top: '50%' }} isConnectable={isConnectable}/>
              <div className="connection-label" style={{ top: '50%' }}>Input</div>
           </div>
        </div>
        {renderOutputHandles()}
      </div>
    </div>
  );
};

export default React.memo(IndicatorNode);