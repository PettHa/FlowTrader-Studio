import React, { useState, useCallback } from 'react';
// Fjernet useNodes, useEdges, useMemo
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './ConditionNode.css';

// Flyttet ut hit for lesbarhet, men brukes nå kun i placeholder/fallback
const conditionTypes = [
  { value: 'GT', label: '>', description: 'Greater Than' },
  { value: 'LT', label: '<', description: 'Less Than' },
  { value: 'EQ', label: '=', description: 'Equals' },
  { value: 'CROSS_ABOVE', label: '↗', description: 'Crosses Above' },
  { value: 'CROSS_BELOW', label: '↘', description: 'Crosses Below' }
];

const ConditionNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Leser KUN fra egen data-prop nå
  const currentConditionType = data.conditionType || 'GT';
  const currentCondition = conditionTypes.find(c => c.value === currentConditionType) || conditionTypes[0];
  const thresholdValue = data.threshold;
  const usesThreshold = typeof thresholdValue === 'number' && !isNaN(thresholdValue);

  // handleChange oppdaterer KUN lokal konfigurasjon (conditionType, threshold, label)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'threshold') {
      processedValue = value.trim() === '' ? '' : parseFloat(value);
      if (value.trim() !== '' && isNaN(processedValue)) processedValue = 0;
    } else if (name === 'label') {
       processedValue = value.trim() === '' ? null : value;
    }
    if (updateNodeData && id) {
      // Sender opp endringen til VisualStrategyBuilder
      updateNodeData(id, { [name]: processedValue });
      // VisualStrategyBuilder sin useEffect vil så re-kalkulere headeren
    }
  }, [updateNodeData, id]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const inputA_Top = usesThreshold ? '50%' : '35%';
  const inputB_Top = '65%';
  const result_Top = '50%';

  // --- Forenklet getHeaderTitle ---
  // Leser den pre-kalkulerte headeren ELLER brukerens label
  const getHeaderTitle = () => {
    // Brukerens label har høyest prioritet
    if (data.label && data.label.trim() !== '') {
        return data.label;
    }
    // Ellers, bruk den kalkulerte headeren hvis den finnes
    if (data.calculatedHeader) {
        return data.calculatedHeader;
    }
    // Fallback hvis den kalkulerte headeren av en eller annen grunn mangler
    return `${currentCondition.label}${usesThreshold ? ` ${thresholdValue}` : ''}`;
  };

   // --- Forenklet summary text for placeholder ---
   const getSummaryTextPlaceholder = () => {
    const symbol = currentCondition.label;
    return usesThreshold ? `${symbol} ${thresholdValue}` : symbol;
   }

   // Tekst for kollapset visning
   const getCollapsedText = () => {
     // Bruker samme logikk som header for konsistens
     return getHeaderTitle();
   }


  return (
    <div className={`strategy-node condition-node ${selected ? 'selected' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="node-header" onClick={toggleExpand} title={isExpanded ? 'Collapse' : 'Expand'}>
        <div className="node-title">
          {/* Viser resultatet fra den forenklede getHeaderTitle */}
          {getHeaderTitle()}
        </div>
        {isExpanded ? <ChevronUp className="edit-toggle-icon" size={14} /> : <ChevronDown className="edit-toggle-icon" size={14} />}
      </div>

      {!isExpanded && (
          <div className="node-summary" title={getHeaderTitle()}>
             {getCollapsedText()}
          </div>
      )}

      {isExpanded && (
          <>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-conditionType`}>Condition Type:</label>
                <select id={`${id}-conditionType`} className="node-select" name="conditionType" value={currentConditionType} onChange={handleChange}>
                  {conditionTypes.map(type => <option key={type.value} value={type.value}>{type.label} ({type.description})</option>)}
                </select>
              </div>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-threshold`}>Threshold Value (Optional):</label>
                <input id={`${id}-threshold`} type="number" name="threshold" className="node-input" value={thresholdValue ?? ''} onChange={handleChange} step="any" placeholder="Use Input B if empty"/>
              </div>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-label`}>Custom Label (Optional):</label>
                {/* Placeholder viser nå bare det enkle symbolet/threshold */}
                <input id={`${id}-label`} type="text" name="label" className="node-input" value={data.label || ''} onChange={handleChange} placeholder={getSummaryTextPlaceholder()}/>
              </div>
          </>
      )}

      <div className="node-connections">
        <div className="connection-inputs">
          <div className="handle-label-wrapper">
            <Handle type="target" position={Position.Left} id="a" className="react-flow__handle" style={{ top: inputA_Top }} isConnectable={isConnectable}/>
            <div className="connection-label" style={{ top: inputA_Top }}>Input A</div>
          </div>
          {!usesThreshold && (
             <div className="handle-label-wrapper">
                <Handle type="target" position={Position.Left} id="b" className="react-flow__handle" style={{ top: inputB_Top }} isConnectable={isConnectable}/>
                 <div className="connection-label" style={{ top: inputB_Top }}>Input B</div>
            </div>
          )}
        </div>
        <div className="connection-outputs">
           <div className="handle-label-wrapper">
              <Handle type="source" position={Position.Right} id="result" className="react-flow__handle" style={{ top: result_Top }} isConnectable={isConnectable}/>
              <div className="connection-label" style={{ top: result_Top }}>Result</div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Kan fortsatt bruke React.memo, vil nå re-rendre sjeldnere
export default React.memo(ConditionNode);