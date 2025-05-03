// src/components/ConnectionLine.jsx
import { X } from 'lucide-react';

export default function ConnectionLine({ connection, nodes, onDelete }) {
  const fromNode = nodes.find(n => n.id === connection.from);
  const toNode = nodes.find(n => n.id === connection.to);
  
  if (!fromNode || !toNode) return null;

  const startX = fromNode.x + 160;
  const startY = fromNode.y + 30;
  const endX = toNode.x;
  const endY = toNode.y + 30;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#888"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <g onClick={() => onDelete(connection.from, connection.to)} className="connection-delete">
        <circle
          cx={midX}
          cy={midY}
          r="12"
          fill="white"
          stroke="#888"
          strokeWidth="1"
        />
        <X
          x={midX - 6}
          y={midY - 6}
          width={12}
          height={12}
          color="#888"
        />
      </g>
    </>
  );
}