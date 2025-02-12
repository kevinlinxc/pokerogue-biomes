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
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { adjacencyList, biomes } from './biome-data';
import type { Route } from './biome-route-finder';

interface BiomeGraphProps {
  activePath: string[];
  activeProbs: number[];
}

const nodeWidth = 30;
const nodeHeight = 18;
const BORDER_RADIUS = '0.25rem'; // Consistent border radius for both selection and image

// Layout function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', ranker: "tight-tree" });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get positions from layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
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
  position: { x: 0, y: 0 },
  type: 'biomeNode',
}));

export function BiomeGraph({ activePath, activeProbs }: BiomeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create and layout edges
  useLayoutEffect(() => {
    const baseEdges = createEdges(adjacencyList);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      baseEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
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
        onNodesChange={onNodesChange}
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
