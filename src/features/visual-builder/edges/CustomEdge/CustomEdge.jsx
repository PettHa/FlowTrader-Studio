import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';
import './CustomEdge.css';

// Custom edge component: Renders a smooth step path, potentially with animation or labels
function CustomEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {}, // Default empty style object
  markerEnd,
  label, // Optional label prop
  animated // Optional animation prop
}) {
  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 5, // Slightly rounded corners
  });

  // Define base style and merge with passed style
  const baseStyle = {
    strokeWidth: 1.5, // Default stroke width
    stroke: '#888',   // Default color (can be overridden by style prop)
  };
  const mergedStyle = { ...baseStyle, ...style };

  // Define animation class if requested
  const animationClass = animated ? 'animated-edge' : '';

  return (
    <>
      {/* The main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd} // Arrow head definition
        style={mergedStyle}
        className={animationClass} // Apply animation class
      />

      {/* Optional: Render a label centered on the edge */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#f0f0f0', // Label background
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 500,
              color: '#555',
              pointerEvents: 'all', // Allow interaction with label if needed
            }}
            className="nodrag nopan" // Prevent dragging/panning when interacting with label
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default CustomEdge;