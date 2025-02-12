import { useCallback, useLayoutEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { adjacencyList, biomes } from './biome-data';
import type { Route } from './biome-route-finder';

interface BiomeGraphProps {
  activePath: string[];
  activeProbs: number[];
}

const nodeSpacingX = 130;
const nodeSpacingY = 100;
const BORDER_RADIUS = '0.25rem'; // Consistent border radius for both selection and image

const nodePositions: { [key: string]: { x: number, y: number } } = {
  "Abyss":            { x: 6, y: 2 },
  "Ancient Ruins":    { x: 5, y: 7 },
  "Badlands":         { x: 7, y: 1 },
  "Beach":            { x: 8, y: 4 },
  "Cave":             { x: 7, y: 3 },
  "Construction Site":{ x: 2, y: 7 },
  "Desert":           { x: 4, y: 7 },
  "Dojo":             { x: 1, y: 8 },
  "Factory":          { x: 2, y: 5 },
  "Fairy Cave":       { x: 8, y: 6 },
  "Forest":           { x: 3, y: 5 },
  "Grassy Field":     { x: 1, y: 3 },
  "Graveyard":        { x: 5, y: 2 },
  "Ice Cave":         { x: 9, y: 6 },
  "Island":           { x: 8, y: 3 },
  "Jungle":           { x: 3, y: 8 },
  "Laboratory":       { x: 2, y: 6 },
  "Lake":             { x: 7, y: 4 },
  "Meadow":           { x: 5, y: 5 },
  "Metropolis":       { x: 0, y: 4 },
  "Mountain":         { x: 11, y: 5 },
  "Plains":           { x: 1, y: 4 },
  "Power Plant":      { x: 1, y: 6 },
  "Sea":              { x: 9, y: 3 },
  "Seabed":           { x: 8, y: 2 },
  "Slum":             { x: 0, y: 5 },
  "Snowy Forest":     { x: 8, y: 5 },
  "Space":            { x: 6, y: 7 },
  "Swamp":            { x: 5, y: 3.5 },
  "Tall Grass":       { x: 3, y: 3 },
  "Temple":           { x: 4, y: 8 },
  "Town":             { x: 0, y: 3 },
  "Volcano":          { x: 10, y: 4 },
  "Wasteland":        { x: 9, y: 1.5 }
};

// Custom Node Component
function BiomeNode({ data, selected }: { data: { label: string }; selected: boolean }) {
  const imagePath = `/images/${data.label.toLowerCase().replace(" ", '_')}.png`;
  return (
    <div className={`
        relative w-28 h-16 overflow-hidden
        ${selected ? 'ring-2 ring-blue-500' : 'ring-transparent'}
        transform-gpu
      `}
      style = {{ borderRadius: "0.2rem" }} //crying, sobbing
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400/50" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400/50" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400/50" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400/50" />
      
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={imagePath} 
          alt={data.label}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}

// Create base nodes from biomes list with images
const initialNodes: Node[] = biomes.map((biome) => ({
  id: biome,
  data: { label: biome },
  // Use saved position or default to center
  position: nodePositions[biome] ? { x: nodePositions[biome].x * nodeSpacingX, y: -1 * nodePositions[biome].y * nodeSpacingY } : { x: 500, y: 300 },
  type: 'biomeNode',
}));

export function BiomeGraph({ activePath, activeProbs }: BiomeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add position logging
  const handleNodesChange = (changes: any) => {
    onNodesChange(changes);
  };

  // Remove layout useEffect and replace with simple edge creation
  useLayoutEffect(() => {
    setEdges(createEdges(adjacencyList));
  }, []);

  // Update active path immediately and when it changes
  useLayoutEffect(() => {
    if (!edges.length) return; // Skip if edges haven't been created yet
    
    setEdges((eds) =>
      eds.map((edge) => {
        const isActive = activePath.some((_, i) => 
          i < activePath.length - 1 && 
          edge.id === `${activePath[i]}-${activePath[i + 1]}`
        );
        
        return {
          ...edge,
          animated: isActive,
          style: {
            stroke: isActive ? '#3b82f6' : '#94a3b8',
            opacity: isActive ? 1 : 0.3,
            strokeWidth: isActive ? 3 : 1,
          },
        };
      })
    );

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          borderColor: activePath.includes(node.id) ? '#3b82f6' : '#111111',
          borderWidth: activePath.includes(node.id) ? '2px' : '1px',
          background: 'black',
          borderRadius: "0.3rem", // crying, sobbing
        },
      }))
    );
  }, [activePath, edges.length]);

  return (
    <div className="h-[600px] bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{ biomeNode: BiomeNode }}
        fitView
        className="bg-slate-50/50"
        minZoom={0.5}
        maxZoom={3}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      />
    </div>
  );
}

// Helper function to create edges from adjacency list
function createEdges(adjacencyList: { [key: string]: [string, number][] }): Edge[] {
  const edges: Edge[] = [];
  Object.entries(adjacencyList).forEach(([source, targets]) => {
    targets.forEach(([target, probability]) => {
      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        animated: false,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        label: `${(probability * 100).toFixed(0)}%`,
        labelStyle: { fill: '#64748b', fontSize: 10 },
        style: { stroke: '#94a3b8', opacity: 0.3 },
      });
    });
  });
  return edges;
}
