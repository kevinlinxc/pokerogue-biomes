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

const nodeWidth = 64;
const nodeHeight = 64;

// Layout function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR' });

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
      w-30 h-16 rounded-xl overflow-hidden shadow-sm transition-all duration-200
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-1 ring-slate-200'}
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-slate-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400" />
      
      <div className="relative w-full h-full group">
        <img 
          src={imagePath} 
          alt={data.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                        text-white text-xs font-medium text-center 
                        absolute inset-0 flex items-center justify-center">
            {data.label}
          </div>
        </div>
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
    console.log("Initializing graph with edges");
    const baseEdges = createEdges(adjacencyList);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      baseEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, []);

  // Update active path
  useLayoutEffect(() => {
    console.log("Updating active path:", activePath);
    if (activePath.length > 1) {
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
            borderColor: activePath.includes(node.id) ? '#3b82f6' : '#94a3b8',
            borderWidth: activePath.includes(node.id) ? '2px' : '1px',
            background: activePath.includes(node.id) ? '#eff6ff' : '#fff',
          },
        }))
      );
    }
  }, [activePath, setEdges, setNodes]);

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
        maxZoom={1.5}
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
