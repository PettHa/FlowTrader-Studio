import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import './ActionNode.css';

const actionTypes = [ { value: 'ENTRY', label: 'Entry' }, { value: 'EXIT', label: 'Exit' } ];
const positionTypes = [ { value: 'LONG', label: 'Long' }, { value: 'SHORT', label: 'Short' } ];

const ActionNode = ({ data, selected, id, isConnectable, updateNodeData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentActionType = data.actionType || 'ENTRY';
  const currentPositionType = data.positionType || 'LONG';
  const isLong = currentPositionType === 'LONG';

  const currentActionLabel = actionTypes.find(a => a.value === currentActionType)?.label || 'Action';
  const currentPositionLabel = positionTypes.find(p => p.value === currentPositionType)?.label || 'Position';

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

  const getPositionIcon = () => {
    return isLong ?
      <ArrowUp size={14} className="position-icon long" title="Long Position" /> :
      <ArrowDown size={14} className="position-icon short" title="Short Position" />;
  };

  const getSummaryText = () => {
    return `${currentActionLabel} ${currentPositionLabel}`;
  }

  const getHeaderTitle = () => {
    if (data.label && data.label.trim() !== '') {
        return data.label;
    }
    return getSummaryText();
  };

  return (
    <div className={`strategy-node action-node ${selected ? 'selected' : ''} ${isLong ? 'long' : 'short'} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="node-header" onClick={toggleExpand} title={isExpanded ? 'Collapse' : 'Expand'}>
        <div className="node-title">
          {getHeaderTitle()}
        </div>
        {getPositionIcon()}
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
                <label className="node-param-label" htmlFor={`${id}-actionType`}>Action Type:</label>
                <select id={`${id}-actionType`} className="node-select" name="actionType" value={currentActionType} onChange={handleChange}>
                  {actionTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="node-param-group">
                <label className="node-param-label" htmlFor={`${id}-positionType`}>Position Type:</label>
                <select id={`${id}-positionType`} className="node-select" name="positionType" value={currentPositionType} onChange={handleChange}>
                  {positionTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
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
            <Handle type="target" position={Position.Left} id="trigger" className="react-flow__handle" style={{ top: '50%' }} isConnectable={isConnectable}/>
            <div className="connection-label" style={{ top: '50%' }}>Trigger</div>
          </div>
        </div>
        <div className="connection-outputs"></div>
      </div>
    </div>
  );
};

export default React.memo(ActionNode);