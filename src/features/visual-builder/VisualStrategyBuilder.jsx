import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel as ReactFlowPanel
} from 'reactflow';
import 'reactflow/dist/style.css';

import './VisualStrategyBuilder.css';
import IndicatorNode from './nodes/IndicatorNode/IndicatorNode.jsx';
import LogicNode from './nodes/LogicNode/LogicNode.jsx';
import ConditionNode from './nodes/ConditionNode/ConditionNode.jsx'; // Forenklet node
import ActionNode from './nodes/ActionNode/ActionNode.jsx';
import PriceNode from './nodes/PriceNode/PriceNode.jsx';
// Importer hjelpefunksjonene
import { getNodeId, generateNodePosition, calculateDynamicHeader } from './utils/index.js';
import AddNodeDropdown from './components/AddNodeDropdown/AddNodeDropdown.jsx';
import CustomEdge from './edges/CustomEdge/CustomEdge.jsx';

const edgeTypes = { customEdge: CustomEdge };

// Initial nodes (data har ikke 'label' for noder som skal ha dynamisk tittel)
const initialNodes = [
  { id: 'price', type: 'priceNode', data: { label: 'Market Data' }, position: { x: 50, y: 150 }, deletable: false },
  { id: 'entry_long_1', type: 'actionNode', data: { actionType: 'ENTRY', positionType: 'LONG' }, position: { x: 700, y: 100 } },
  { id: 'exit_long_1', type: 'actionNode', data: { actionType: 'EXIT', positionType: 'LONG' }, position: { x: 700, y: 250 } }
];
const initialEdges = [];

function VisualStrategyBuilder({ disabled = false }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const reactFlowWrapper = useRef(null);

  // --- Sentralisert Kalkulering av Dynamiske Headers ---
  useEffect(() => {
    // Kjører hver gang nodes eller edges endres
    // console.log("[VisualStrategyBuilder] useEffect for header calculation triggered.");

    let hasChanges = false;
    const nextNodes = nodes.map(node => {
      // Kalkuler potensiell dynamisk header for denne noden
      const dynamicHeader = calculateDynamicHeader(node, nodes, edges);

      // Sjekk om den kalkulerte headeren (eller null) er forskjellig fra den som evt. er lagret
      // Vi sjekker også om dynamicHeader faktisk er beregnet (ikke null/undefined)
      // for å unngå å legge til calculatedHeader: null på noder som ikke trenger det.
      if (dynamicHeader !== undefined && node.data?.calculatedHeader !== dynamicHeader) {
         const newData = {
             ...node.data,
             // Lagre den kalkulerte headeren (kan være null hvis calculateDynamicHeader returnerer null)
             calculatedHeader: dynamicHeader
         };
         hasChanges = true;
         // console.log(`[VisualStrategyBuilder] Updating header for node ${node.id}:`, dynamicHeader);
         return { ...node, data: newData };
      }

      // Hvis ingen endring for denne noden, returner den som den er
      return node;
    });

    // Oppdater state KUN hvis det faktisk var endringer
    if (hasChanges) {
      // console.log("[VisualStrategyBuilder] Setting updated nodes state due to header changes.");
      setNodes(nextNodes);
    } else {
      // console.log("[VisualStrategyBuilder] No header changes detected, skipping setNodes.");
    }
  }, [nodes, edges]); // Avhengig av BÅDE nodes og edges

  const onNodesChange = useCallback((changes) => {
    const nonDeletableChanges = changes.filter(change => !(change.type === 'remove' && change.id === 'price'));
    if (nonDeletableChanges.length > 0) {
      setNodes((nds) => applyNodeChanges(nonDeletableChanges, nds));
    }
    const removedNodeChange = changes.find(change => change.type === 'remove' && change.id === selectedNodeId);
    if (removedNodeChange) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection) => {
    const newEdge = { ...connection, type: 'customEdge', animated: true };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const addNode = useCallback((type, nodeData = {}) => {
    const id = getNodeId(type);
    const position = generateNodePosition(nodes);
    // nodeData kommer nå uten 'label' fra AddNodeDropdown for de fleste typer
    const newNode = { id, type, position, data: { ...nodeData, id } };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
    // console.log("Added node:", newNode);
  }, [nodes]); // Avhengig av nodes for posisjonering

  // Mottar oppdateringer fra brukerinput inne i nodene
  const updateNodeData = useCallback((id, newData) => {
    // console.log(`[VisualStrategyBuilder] updateNodeData called for ${id} with`, newData);
    setNodes(currentNodes => currentNodes.map(node => {
      if (node.id === id) {
        // Behold calculatedHeader fra forrige state, den oppdateres av useEffect
        const { calculatedHeader, ...restOfExistingData } = node.data;
        return {
          ...node,
          data: {
            calculatedHeader, // Behold den gamle kalkulerte verdien midlertidig
            ...restOfExistingData,
            ...newData // Legg til brukerens endringer
          }
        };
      }
      return node;
    }));
  }, []);

  // Definer nodeTypes, send med updateNodeData
   const nodeTypes = useMemo(() => ({
    indicatorNode: (props) => <IndicatorNode {...props} updateNodeData={updateNodeData} />,
    logicNode: (props) => <LogicNode {...props} updateNodeData={updateNodeData} />,
    conditionNode: (props) => <ConditionNode {...props} updateNodeData={updateNodeData} />,
    actionNode: (props) => <ActionNode {...props} updateNodeData={updateNodeData} />,
    priceNode: (props) => <PriceNode {...props} />
  }), [updateNodeData]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === 'price') return;
    onNodesChange([{ type: 'remove', id: selectedNodeId }]);
    setSelectedNodeId(null);
  }, [selectedNodeId, onNodesChange]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && selectedNodeId !== 'price') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT' && document.activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          deleteSelectedNode();
        }
      }
      if (event.key === 'Escape') {
        setSelectedNodeId(null);
        if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, deleteSelectedNode]);

  const saveStrategy = useCallback(() => {
    if (!rfInstance) {
        console.warn("ReactFlow instance not available for saving.");
        return;
    }
    // Fjern calculatedHeader før lagring for å unngå unødvendig data
    const flowToSave = rfInstance.toObject();
    flowToSave.nodes = flowToSave.nodes.map(n => {
        const { calculatedHeader, ...restData } = n.data || {};
        return { ...n, data: restData };
    });

    const strategyJson = JSON.stringify(flowToSave, null, 2);
    console.log('Strategy Flow (JSON):', strategyJson);
    try {
        localStorage.setItem('flowtrader_strategy', strategyJson);
        alert('Strategy saved to console and localStorage (key: flowtrader_strategy)');
    } catch (error) {
        console.error("Error saving strategy to localStorage:", error);
        alert('Strategy saved to console, but failed to save to localStorage.');
    }
  }, [rfInstance]);

  const loadStrategy = useCallback(() => {
    try {
        const savedStrategyJson = localStorage.getItem('flowtrader_strategy');
        if (savedStrategyJson) {
            const flow = JSON.parse(savedStrategyJson);
            if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
                 let priceNodeExists = false;
                 let updatedNodes = flow.nodes.map(n => {
                    if (n.id === 'price' && n.type === 'priceNode') {
                        priceNodeExists = true;
                        return { ...n, deletable: false };
                    }
                    return { ...n, deletable: n.deletable !== undefined ? n.deletable : true };
                 });
                 if (!priceNodeExists) {
                     updatedNodes.unshift({
                        id: 'price', type: 'priceNode',
                        data: { label: 'Market Data' }, position: { x: 50, y: 150 }, deletable: false,
                     });
                 }
                // Viktig: Ikke sett calculatedHeader her, la useEffect kalkulere det
                setNodes(updatedNodes);
                setEdges(flow.edges);
                setSelectedNodeId(null);
                alert('Strategy loaded from localStorage.');
                setTimeout(() => rfInstance?.fitView({ padding: 0.1 }), 100);
            } else {
                console.error("Invalid strategy format in localStorage.");
                alert('Failed to load strategy: Invalid format found in localStorage.');
            }
        } else {
            alert('No saved strategy found in localStorage.');
        }
    } catch (error) {
        console.error("Error loading strategy from localStorage:", error);
        alert(`Failed to load strategy from localStorage: ${error.message}`);
    }
  }, [rfInstance, setNodes, setEdges, setSelectedNodeId]); // Added dependencies

  return (
    <div className="visual-strategy-builder-container" data-disabled={disabled}>
      <div className="visual-strategy-controls">
        <AddNodeDropdown onAddNode={addNode} disabled={disabled}/>
        <button
          className="strategy-control-btn delete-btn"
          onClick={deleteSelectedNode}
          disabled={disabled || !selectedNodeId || selectedNodeId === 'price'}
          title="Delete Selected Node (Del/Backspace)"
        > Delete Selected </button>
        <div className="strategy-control-spacer"></div>
        <button className="strategy-control-btn secondary-btn" onClick={loadStrategy} disabled={disabled} title="Load strategy from localStorage"> Load </button>
        <button className="strategy-control-btn primary-btn" onClick={saveStrategy} disabled={disabled} title="Save strategy to localStorage"> Save Strategy </button>
      </div>
      <div className="strategy-editor-container">
        <ReactFlowProvider>
          <div ref={reactFlowWrapper} className="reactflow-wrapper">
            <ReactFlow
              nodes={nodes} // Bruker den oppdaterte 'nodes' state
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setRfInstance}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              fitView
              snapToGrid={true}
              snapGrid={[15, 15]}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={!disabled}
              nodesConnectable={!disabled}
              elementsSelectable={!disabled}
              selectNodesOnDrag={true}
              connectionMode="loose"
              deleteKeyCode={null}
              defaultEdgeOptions={{ type: 'customEdge', animated: false }}
              elevateNodesOnSelect={true}
            >
              <Background color="#e0e0e0" gap={20} size={1.5} />
              <Controls showInteractive={false} />
              <MiniMap
                 nodeStrokeWidth={2}
                 nodeStrokeColor={(n) => {
                  if (n.selected) return 'var(--primary-dark)';
                  if (n.type === 'priceNode') return '#0041d0';
                  if (n.type === 'indicatorNode') return '#db2777'; // pink-600
                  if (n.type === 'conditionNode') return '#057a55'; // success-color
                  if (n.type === 'logicNode') return '#4f46e5'; // indigo-600
                  if (n.type === 'actionNode') return n.data?.positionType === 'LONG' ? '#10b981' : '#ef4444';
                  return '#aaa';
                }}
                nodeColor={(n) => {
                  if (n.selected) return 'rgba(59, 130, 246, 0.2)';
                  if (n.type === 'priceNode') return 'rgba(37, 99, 235, 0.1)';
                  if (n.type === 'indicatorNode') return 'rgba(219, 39, 119, 0.1)';
                  if (n.type === 'conditionNode') return 'rgba(5, 122, 85, 0.1)';
                  if (n.type === 'logicNode') return 'rgba(79, 70, 229, 0.1)';
                   if (n.type === 'actionNode') return n.data?.positionType === 'LONG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                  return '#fff';
                }}
                nodeBorderRadius={2}
                maskColor="rgba(240, 240, 240, 0.6)"
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default VisualStrategyBuilder;