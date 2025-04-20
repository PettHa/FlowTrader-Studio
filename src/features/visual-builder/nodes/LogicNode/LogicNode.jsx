import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './LogicNode.css';

const logicTypes = [
  { value: 'AND', label: 'AND', description: 'Output is true if ALL inputs are true' },
  { value: 'OR', label: 'OR', description: 'Output is true if ANY input is true' },
  { value: 'NOT', label: 'NOT', description: 'Output is the inverse of the input' }
];

const LogicNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentLogicType = data.logicType || 'AND';
  const currentLogic = logicTypes.find(l => l.value === currentLogicType) || logicTypes[0];
  const isSingleInput = currentLogicType === 'NOT';

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;
     if (name === 'label') {
       processedValue = value.trim() === '' ? null : value;
    }
    if (updateNodeData && id) {
      updateNodeData(id, { [name]: processedValue });
    }
  }, [updateNodeData, id]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const inputA_Top = isSingleInput ? '50%' : '35%';
  const inputB_Top = '65%';
  const result_Top = '50%';

  const getSummaryText = () => {
    return currentLogic.label;
  }

  const getHeaderTitle = () => {
    if (data.label && data.label.trim() !== '') {
        return data.label;
    }
    return getSummaryText();
  };

  return (
    <div className={`strategy-node logic-node ${selected ? 'selected' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="node-header" onClick={toggleExpand} title={isExpanded ? 'Collapse' : 'Expand'}>
        <div className="node-title">
          {getHeaderTitle()}
        </div>
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
                <label className="node-param-label" htmlFor={`${id}-logicType`}>Logic Type:</label>
                <select id={`${id}-logicType`} className="node-select" name="logicType" value={currentLogicType} onChange={handleChange}>
                  {logicTypes.map(type => <option key={type.value} value={type.value}>{type.label} ({type.description})</option>)}
                </select>
              </div>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-label`}>Custom Label (Optional):</label>
                <input id={`${id}-label`} type="text" name="label" className="node-input" value={data.label || ''} onChange={handleChange} placeholder={getSummaryText()}/>
              </div>
          </>
      )}

      <div className="node-connections">
        <div className="connection-inputs">
          <div className="handle-label-wrapper">
            <Handle type="target" position={Position.Left} id={isSingleInput ? "in" : "in1"} className="react-flow__handle" style={{ top: inputA_Top }} isConnectable={isConnectable}/>
            <div className="connection-label" style={{ top: inputA_Top }}>{isSingleInput ? "Input" : "Input A"}</div>
          </div>
          {!isSingleInput && (
            <div className="handle-label-wrapper">
              <Handle type="target" position={Position.Left} id="in2" className="react-flow__handle" style={{ top: inputB_Top }} isConnectable={isConnectable}/>
              <div className="connection-label" style={{ top: inputB_Top }}>Input B</div>
            </div>
          )}
        </div>
        <div className="connection-outputs">
          <div className="handle-label-wrapper">
            <Handle type="source" position={Position.Right} id="out" className="react-flow__handle" style={{ top: result_Top }} isConnectable={isConnectable}/>
            <div className="connection-label" style={{ top: result_Top }}>Result</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LogicNode);