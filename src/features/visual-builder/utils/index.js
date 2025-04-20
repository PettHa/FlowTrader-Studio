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
    return { x: 100, y: 150 };
  }

  try {
    const rightmostNode = nodes.reduce((max, node) => {
      if (node.position && typeof node.position.x === 'number') {
         if (!max.position || node.position.x > max.position.x) {
            return node;
         }
      }
      return max;
    }, { position: { x: -Infinity } });

    if (rightmostNode.position && typeof rightmostNode.position.x === 'number') {
        return {
            x: rightmostNode.position.x + PADDING,
            y: rightmostNode.position.y + VERTICAL_OFFSET
        };
    }
  } catch (error) {
      console.error("Error calculating node position:", error, nodes);
      return { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 };
  }

  return { x: 100, y: 150 + nodes.length * 20 };
};

/**
 * Genererer en kort visningsstreng for en gitt node,
 * basert på dens type og data. Brukes for å vise info
 * om tilkoblede noder.
 * @param {object} node - Node-objektet.
 * @param {object} [edge] - Optional: Kanten som kobler til denne noden (for å vite sourceHandle).
 * @returns {string} - En kort visningsstreng.
 */
export const getNodeDisplayValue = (node, edge = null) => {
  if (!node) return '?';

  // Brukerens label har høyest prioritet hvis den finnes
  // (Selv om noden selv ikke viser sin egen label her, kan andre noder vise den)
  if (node.data?.label && node.data.label.trim() !== '') {
      return node.data.label;
  }

  // Generer streng basert på nodetype
  switch (node.type) {
    case 'priceNode':
      if (edge?.sourceHandle) {
        // Gjør sourceHandle om til pen tekst (f.eks. 'close' -> 'Close')
        return edge.sourceHandle.charAt(0).toUpperCase() + edge.sourceHandle.slice(1);
      }
      return node.data?.label || 'Market Data'; // Fallback

    case 'indicatorNode':
      // Brukerens label for indikatoren er allerede sjekket øverst
      // Generer den dynamiske teksten
      const type = node.data?.indicatorType || '?';
      const period = node.data?.period ?? '?';
      const fast = node.data?.fastPeriod ?? '?';
      const slow = node.data?.slowPeriod ?? '?';
      const signal = node.data?.signalPeriod ?? '?';
      const stdDev = node.data?.stdDev ?? '?';
      const k = node.data?.kPeriod ?? '?';
      const d = node.data?.dPeriod ?? '?';
      const slowing = node.data?.slowing ?? '?';
      if (type === 'SMA' || type === 'EMA' || type === 'RSI') return `${type}(${period})`;
      if (type === 'MACD') return `MACD(${fast},${slow},${signal})`;
      if (type === 'BBANDS') return `BB(${period},${stdDev})`;
      if (type === 'STOCH') return `Stoch(${k},${d},${slowing})`;
      return type;

    case 'conditionNode':
       // Hvis input er en annen condition, vis den kalkulerte headeren dens, ELLER symbolet
       if (node.data?.calculatedHeader) return node.data.calculatedHeader;
       const condType = node.data?.conditionType || '?';
       const condTypes = { GT: '>', LT: '<', EQ: '=', CROSS_ABOVE: '↗', CROSS_BELOW: '↘' };
       const symbol = condTypes[condType] || '?';
       const threshold = node.data?.threshold;
       const usesThreshold = typeof threshold === 'number' && !isNaN(threshold);
       return usesThreshold ? `${symbol} ${threshold}` : symbol;

    case 'logicNode':
      // Vis logikktypen
      return node.data?.logicType || '?';

    case 'actionNode':
        // En action node har vanligvis ikke output som brukes, vis en enkel identifikator
        const action = node.data?.actionType || 'ACT';
        const pos = node.data?.positionType || 'POS';
        return `${action.substring(0,1)}${pos.substring(0,1)}`; // F.eks. EL (Entry Long)

    default:
      return node.id; // Fallback til ID
  }
};

/**
 * Kalkulerer den dynamiske header-tittelen for en gitt node (f.eks. ConditionNode)
 * basert på dens tilkoblinger og data. Returnerer null hvis noden ikke skal ha
 * en dynamisk kalkulert header.
 * @param {object} node - Noden som tittelen skal kalkuleres for.
 * @param {Array} allNodes - Hele node-listen.
 * @param {Array} allEdges - Hele kant-listen.
 * @returns {string | null} - Den kalkulerte tittelen, eller null.
 */
export const calculateDynamicHeader = (node, allNodes, allEdges) => {
    // --- Condition Node ---
    if (node.type === 'conditionNode') {
        const conditionTypes = { GT: '>', LT: '<', EQ: '=', CROSS_ABOVE: '↗', CROSS_BELOW: '↘' };
        const currentConditionType = node.data?.conditionType || 'GT';
        const symbol = conditionTypes[currentConditionType] || '?';
        const thresholdValue = node.data?.threshold;
        const usesThreshold = typeof thresholdValue === 'number' && !isNaN(thresholdValue);

        const edgeA = allEdges.find(edge => edge.target === node.id && edge.targetHandle === 'a');
        const sourceNodeA = edgeA ? allNodes.find(n => n.id === edgeA.source) : null;
        const valueA = getNodeDisplayValue(sourceNodeA, edgeA);

        let valueB;
        if (usesThreshold) {
            valueB = thresholdValue.toString();
        } else {
            const edgeB = allEdges.find(edge => edge.target === node.id && edge.targetHandle === 'b');
            const sourceNodeB = edgeB ? allNodes.find(n => n.id === edgeB.source) : null;
            valueB = getNodeDisplayValue(sourceNodeB, edgeB);
        }
        return `${valueA} ${symbol} ${valueB}`;
    }

    // --- Logic Node (Eksempel) ---
    // Kan legge til lignende logikk for LogicNode hvis ønskelig,
    // f.eks. vise input A og B hvis de er koblet til:
    // if (node.type === 'logicNode') {
    //   const logicType = node.data?.logicType || '?';
    //   if (logicType === 'NOT') {
    //      const edgeIn = allEdges.find(edge => edge.target === node.id && edge.targetHandle === 'in');
    //      const sourceNodeIn = edgeIn ? allNodes.find(n => n.id === edgeIn.source) : null;
    //      const valueIn = getNodeDisplayValue(sourceNodeIn, edgeIn);
    //      return `NOT (${valueIn})`;
    //   } else { // AND, OR
    //      const edgeIn1 = allEdges.find(edge => edge.target === node.id && edge.targetHandle === 'in1');
    //      const sourceNodeIn1 = edgeIn1 ? allNodes.find(n => n.id === edgeIn1.source) : null;
    //      const valueIn1 = getNodeDisplayValue(sourceNodeIn1, edgeIn1);
    //
    //      const edgeIn2 = allEdges.find(edge => edge.target === node.id && edge.targetHandle === 'in2');
    //      const sourceNodeIn2 = edgeIn2 ? allNodes.find(n => n.id === edgeIn2.source) : null;
    //      const valueIn2 = getNodeDisplayValue(sourceNodeIn2, edgeIn2);
    //      return `${valueIn1} ${logicType} ${valueIn2}`;
    //   }
    // }

    // Returner null for alle andre nodetyper (Indicator, Action, Price)
    // Disse nodene genererer sin egen header basert på intern state/props.
    return null;
};