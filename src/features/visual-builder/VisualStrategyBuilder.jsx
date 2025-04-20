import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel as ReactFlowPanel // Alias Panel to avoid naming conflicts
} from 'reactflow';
import 'reactflow/dist/style.css';

import './VisualStrategyBuilder.css';
import IndicatorNode from './nodes/IndicatorNode/IndicatorNode.jsx';
import LogicNode from './nodes/LogicNode/LogicNode.jsx';
import ConditionNode from './nodes/ConditionNode/ConditionNode.jsx';
import ActionNode from './nodes/ActionNode/ActionNode.jsx';
import PriceNode from './nodes/PriceNode/PriceNode.jsx';
import { getNodeId, generateNodePosition } from './utils/index.js';
// NodeConfig panel removed - configuration happens directly in nodes
// import NodeConfig from './components/NodeConfig/NodeConfig.jsx';
import AddNodeDropdown from './components/AddNodeDropdown/AddNodeDropdown.jsx';

// Custom edge with animated path
import CustomEdge from './edges/CustomEdge/CustomEdge.jsx';

// Define custom edge types
const edgeTypes = {
  customEdge: CustomEdge
};

// Initial nodes - market data source and basic action nodes
const initialNodes = [
  {
    id: 'price',
    type: 'priceNode',
    data: { label: 'Market Data', outputLabels: ['OHLC', 'Volume'] },
    position: { x: 50, y: 150 },
    deletable: false, // Make price node non-deletable
  },
  {
    id: 'entry_long_1',
    type: 'actionNode',
    data: { label: 'Enter Long', actionType: 'ENTRY', positionType: 'LONG' },
    position: { x: 700, y: 100 },
  },
  {
    id: 'exit_long_1',
    type: 'actionNode',
    data: { label: 'Exit Long', actionType: 'EXIT', positionType: 'LONG' },
    position: { x: 700, y: 250 },
  }
];

// Initial edges
const initialEdges = [];


function VisualStrategyBuilder({ disabled = false }) { // Removed NodeConfig dependencies
  // State for nodes and edges
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null); // Still needed for selection actions
  // State for context menu node picker removed, using AddNodeDropdown instead
  // const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  // const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });

  // Refs
  const reactFlowWrapper = useRef(null);

  // Callbacks for node and edge changes
  const onNodesChange = useCallback(
    (changes) => {
        // Prevent deleting the 'price' node
        const nonDeletableChanges = changes.filter(change =>
            !(change.type === 'remove' && change.id === 'price')
        );
        if (nonDeletableChanges.length > 0) {
            setNodes((nds) => applyNodeChanges(nonDeletableChanges, nds))
        }
         // Clear selection if the selected node is removed
        const removedNodeChange = changes.find(change => change.type === 'remove' && change.id === selectedNodeId);
        if (removedNodeChange) {
            setSelectedNodeId(null);
        }

    },
    [selectedNodeId] // Add dependency
  );


  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Callback for edge connections
  const onConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        type: 'customEdge', // Use custom edge type
        animated: true, // Make new connections animated by default
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    // No default behavior prevention needed now
    setSelectedNodeId(node.id);
  }, []);

  // Clear selection when clicking on the canvas
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Context menu is removed - use AddNodeDropdown button instead

  // Add a new node
  const addNode = useCallback((type, nodeData = {}) => {
    const id = getNodeId(type);
    const position = generateNodePosition(nodes); // Find suitable position

    const newNode = {
      id,
      type,
      position,
      data: {
        ...nodeData, // Include default data from AddNodeDropdown
        id // Ensure ID is in data for reference if needed
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id); // Select the newly added node
    console.log("Added node:", newNode);
  }, [nodes]); // Dependency on nodes to calculate position


  // Update node data (passed to NodeConfig and custom node components)
  const updateNodeData = useCallback((id, newData) => {
    setNodes(currentNodes => currentNodes.map(node => {
      if (node.id === id) {
        // Merge new data with existing data
        return {
          ...node,
          data: {
            ...node.data,
            ...newData
          }
        };
      }
      return node;
    }));
  }, []); // No dependencies needed if it only uses setNodes

  // Define custom node types with updateNodeData passed to them
  // Price node usually doesn't need updateData from panel, but might if internal config added later
  const nodeTypes = useMemo(() => ({
    indicatorNode: (props) => <IndicatorNode {...props} updateNodeData={updateNodeData} />,
    logicNode: (props) => <LogicNode {...props} updateNodeData={updateNodeData} />,
    conditionNode: (props) => <ConditionNode {...props} updateNodeData={updateNodeData} />,
    actionNode: (props) => <ActionNode {...props} updateNodeData={updateNodeData} />,
    priceNode: (props) => <PriceNode {...props} />
  }), [updateNodeData]);


  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === 'price') return; // Prevent deleting price node

    // Trigger node removal via onNodesChange mechanism
    onNodesChange([{ type: 'remove', id: selectedNodeId }]);
    setSelectedNodeId(null); // Clear selection after delete

  }, [selectedNodeId, onNodesChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Delete selected node with Delete or Backspace key
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId && selectedNodeId !== 'price') {
        // Ensure focus isn't inside an input field to prevent deleting text
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT' && document.activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault(); // Prevent browser back navigation on backspace
          deleteSelectedNode();
        }
      }

      // Escape key to clear selection
      if (event.key === 'Escape') {
        setSelectedNodeId(null);
        // Optionally blur active element if needed
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, deleteSelectedNode]);

  // Save the strategy to JSON (illustrative)
  const saveStrategy = useCallback(() => {
    if (!rfInstance) {
        console.warn("ReactFlow instance not available for saving.");
        return;
    }
    const flow = rfInstance.toObject();
    const strategyJson = JSON.stringify(flow, null, 2); // Pretty print JSON

    console.log('Strategy Flow (JSON):', strategyJson);
    // Example: Save to localStorage
    try {
        localStorage.setItem('flowtrader_strategy', strategyJson);
        alert('Strategy saved to console and localStorage (key: flowtrader_strategy)');
    } catch (error) {
        console.error("Error saving strategy to localStorage:", error);
        alert('Strategy saved to console, but failed to save to localStorage.');
    }
  }, [rfInstance]);

  // Load a saved strategy (illustrative)
  const loadStrategy = useCallback(() => {
    try {
        const savedStrategyJson = localStorage.getItem('flowtrader_strategy');
        if (savedStrategyJson) {
            const flow = JSON.parse(savedStrategyJson);
            // Basic validation
            if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
                 // Ensure the essential 'price' node exists after loading
                 let priceNodeExists = false;
                 let updatedNodes = flow.nodes.map(n => {
                    if (n.id === 'price' && n.type === 'priceNode') {
                        priceNodeExists = true;
                        return { ...n, deletable: false }; // Ensure price node is not deletable
                    }
                    // Ensure other nodes are deletable unless specifically marked otherwise
                    return { ...n, deletable: n.deletable !== undefined ? n.deletable : true };
                 });

                 if (!priceNodeExists) {
                     // Add the price node back if it's missing
                     updatedNodes.unshift({
                        id: 'price',
                        type: 'priceNode',
                        data: { label: 'Market Data', outputLabels: ['OHLC', 'Volume'] },
                        position: { x: 50, y: 150 }, // Default position
                        deletable: false,
                     });
                 }

                setNodes(updatedNodes);
                setEdges(flow.edges);
                setSelectedNodeId(null); // Clear selection after load
                alert('Strategy loaded from localStorage.');
                // Optional: Fit view after loading
                setTimeout(() => rfInstance?.fitView({ padding: 0.1 }), 100); // Add padding to fitView
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
      {/* Top Control Bar */}
      <div className="visual-strategy-controls">
        <AddNodeDropdown
          onAddNode={addNode}
          disabled={disabled}
        />

        <button
          className="strategy-control-btn delete-btn"
          onClick={deleteSelectedNode}
          disabled={disabled || !selectedNodeId || selectedNodeId === 'price'} // Disable delete for price node
          title="Delete Selected Node (Del/Backspace)"
        >
          Delete Selected
        </button>

        <div className="strategy-control-spacer"></div>

        <button
          className="strategy-control-btn secondary-btn"
          onClick={loadStrategy}
          disabled={disabled}
          title="Load strategy from localStorage"
        >
          Load
        </button>
        <button
          className="strategy-control-btn primary-btn"
          onClick={saveStrategy}
          disabled={disabled}
          title="Save strategy to localStorage"
        >
          Save Strategy
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="strategy-editor-container">
        <ReactFlowProvider>
          <div ref={reactFlowWrapper} className="reactflow-wrapper">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setRfInstance}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              // onPaneContextMenu removed
              fitView
              snapToGrid={true}
              snapGrid={[15, 15]} // Slightly larger grid
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }} // Hide React Flow attribution
              nodesDraggable={!disabled}
              nodesConnectable={!disabled}
              elementsSelectable={!disabled}
              selectNodesOnDrag={true} // Select node when starting drag
              connectionMode="loose" // Allow connections from/to any handle
              deleteKeyCode={null} // Disable default delete key behavior, handled by useEffect
              defaultEdgeOptions={{ type: 'customEdge', animated: false }} // Default to non-animated edges
              elevateNodesOnSelect={true} // Bring selected node to front
            >
              <Background color="#e0e0e0" gap={20} size={1.5} />
              <Controls showInteractive={false} /> {/* Hide interactive button */}
              <MiniMap
                 nodeStrokeWidth={2} // Slightly thicker stroke in minimap
                 nodeStrokeColor={(n) => {
                  if (n.selected) return 'var(--primary-dark)'; // Highlight selected
                  if (n.type === 'priceNode') return '#0041d0';
                  if (n.type === 'indicatorNode') return '#ff0072';
                  if (n.type === 'conditionNode') return '#057a55';
                  if (n.type === 'logicNode') return '#1a192b';
                  if (n.type === 'actionNode') {
                      return n.data?.positionType === 'LONG' ? '#10b981' : '#ef4444';
                  }
                  return '#aaa';
                }}
                nodeColor={(n) => {
                  if (n.selected) return 'rgba(59, 130, 246, 0.2)'; // Light blue for selected background
                  if (n.type === 'priceNode') return 'rgba(0, 65, 208, 0.1)';
                  if (n.type === 'indicatorNode') return 'rgba(255, 0, 114, 0.1)';
                  if (n.type === 'conditionNode') return 'rgba(5, 122, 85, 0.1)';
                  if (n.type === 'logicNode') return 'rgba(26, 25, 43, 0.1)';
                   if (n.type === 'actionNode') {
                      return n.data?.positionType === 'LONG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                  }
                  return '#fff';
                }}
                nodeBorderRadius={2}
                maskColor="rgba(240, 240, 240, 0.6)" // Semi-transparent mask
              />

              {/* Node Picker (Context Menu) Removed */}
            </ReactFlow>
          </div>
        </ReactFlowProvider>
        {/* Node Configuration Panel Removed */}
      </div>
    </div>
  );
}

export default VisualStrategyBuilder;