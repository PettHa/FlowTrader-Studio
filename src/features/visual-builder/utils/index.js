// Counter for generating unique node IDs
let nodeCounter = 1;

/**
 * Generates a unique ID for a new node.
 * Example: 'indicator_1', 'condition_5'
 *
 * @param {string} type - The node type (e.g., 'indicatorNode', 'conditionNode').
 * @returns {string} A unique node ID.
 */
export const getNodeId = (type) => {
  // Use a simpler prefix derived from the type
  const prefix = type.replace('Node', '').toLowerCase();
  const id = `${prefix}_${nodeCounter++}`;
  return id;
};

/**
 * Calculates a suitable position for a newly added node.
 * Tries to place it slightly offset from the center of the viewport or
 * to the right of the rightmost node.
 *
 * @param {Array} nodes - Array of existing nodes.
 * @param {object} [viewport] - Optional viewport information { x, y, zoom }.
 * @returns {object} An object containing { x, y } coordinates.
 */
export const generateNodePosition = (nodes, viewport = { x: 0, y: 0, zoom: 1 }) => {
  const PADDING = 200; // Space between nodes horizontally
  const VERTICAL_OFFSET = 50; // Slight vertical offset for new nodes

  if (!nodes || nodes.length === 0) {
    // Place the first node near the projected center of the initial viewport
    // This requires the reactflow instance, so might be better calculated inside the component
    // For now, use a default reasonable position.
    return { x: 100, y: 150 };
  }

  try {
    // Find the node furthest to the right
    const rightmostNode = nodes.reduce((max, node) => {
      // Ensure node.position exists and has x
      if (node.position && typeof node.position.x === 'number') {
         // If max has no position yet, or current node is further right
         if (!max.position || node.position.x > max.position.x) {
            return node;
         }
      }
      return max; // Keep current max
    }, { position: { x: -Infinity } }); // Start with a very small x

     // If a rightmost node was found
    if (rightmostNode.position && typeof rightmostNode.position.x === 'number') {
        // Place the new node to the right of the rightmost node
        return {
            x: rightmostNode.position.x + PADDING,
            y: rightmostNode.position.y + VERTICAL_OFFSET // Add a slight vertical offset
        };
    }
  } catch (error) {
      console.error("Error calculating node position:", error, nodes);
      // Fallback position if calculation fails
      return { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 };
  }

  // Default fallback if no nodes have valid positions or calculation failed
  return { x: 100, y: 150 + nodes.length * 20 }; // Stack vertically as a last resort
};

// --- Potentially add more utility functions needed specifically for the builder ---
// Example: Function to validate connections (if needed beyond React Flow's default)
// export const isValidConnection = (connection, nodes, edges) => { ... }

// Example: Function to get default node data based on type (already handled in AddNodeDropdown)
// export const getDefaultNodeData = (type) => { ... }