import { useCallback, useLayoutEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  EdgeTypes,
  getSmoothStepPath,
  getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { adjacencyList, biomes } from './biome-data';
import type { Route } from './biome-route-finder';

interface BiomeGraphProps {
  activePath: string[];
  activeProbs: number[];
}

const nodeSpacingX = 150;
const nodeSpacingY = 130;
const BORDER_RADIUS = '0.25rem'; // Consistent border radius for both selection and image

const nodePositions: { [key: string]: { x: number, y: number } } = {
  "Abyss": { x: 6, y: 2 },
  "Ancient Ruins": { x: 5, y: 7 },
  "Badlands": { x: 7, y: 1 },
  "Beach": { x: 8.28, y: 4 },
  "Cave": { x: 7, y: 3 },
  "Construction Site": { x: 2.1, y: 7 },
  "Desert": { x: 4, y: 7 },
  "Dojo": { x: 1, y: 8 },
  "Factory": { x: 2, y: 5.1 },
  "Fairy Cave": { x: 8, y: 6 },
  "Forest": { x: 3, y: 5 },
  "Grassy Field": { x: 1, y: 3 },
  "Graveyard": { x: 5, y: 2 },
  "Ice Cave": { x: 9, y: 6 },
  "Island": { x: 8, y: 3 },
  "Jungle": { x: 3, y: 8 },
  "Laboratory": { x: 1.9, y: 6.2 },
  "Lake": { x: 7.2, y: 4 },
  "Meadow": { x: 5, y: 5 },
  "Metropolis": { x: 0, y: 4 },
  "Mountain": { x: 11, y: 5 },
  "Plains": { x: 1, y: 4 },
  "Power Plant": { x: 1, y: 6 },
  "Sea": { x: 9, y: 3 },
  "Seabed": { x: 8, y: 2 },
  "Slum": { x: 0, y: 4.7 },
  "Snowy Forest": { x: 8.2, y: 5 },
  "Space": { x: 6, y: 7 },
  "Swamp": { x: 5, y: 3.5 },
  "Tall Grass": { x: 3, y: 3 },
  "Temple": { x: 4, y: 8 },
  "Town": { x: 0, y: 3 },
  "Volcano": { x: 10, y: 4 },
  "Wasteland": { x: 9, y: 1.5 }
};

// Custom Node Component

export const TargetHandleWithValidation = ({ id, position, source, style }: { id: any, position: Position, source: string, style: any }) => (
  <Handle
    type="target"
    id={id}
    position={position}
    isValidConnection={(connection) => connection.source === source}
    onConnect={(params) => console.log('handle onConnect', params)}
    style={{
      ...style,
      width: '12px',
      height: '12px',
      background: '#3b82f6', // Bright blue color
      border: '2px solid white',
      opacity: 0, // Full opacity
      zIndex: 1000, // Ensure handles are above other elements 
    }}
  />
);

export const SourceHandleWithValidation = ({ id, position, target, style }: { id: any, position: Position, target: string, style: any }) => (

  <Handle
    type="source"
    id={id}
    position={position}
    isValidConnection={(connection) => connection.target === target}
    onConnect={(params) => console.log('handle onConnect', params)}
    style={{
      ...style,
      width: '12px',
      height: '12px',
      background: '#FF0000', // 
      border: '2px solid white',
      opacity: 0, // Full opacity
      zIndex: 1000, // Ensure handles are above other elements 
    }}
  />
);

// Define handle direction types
type HandleDirection = 'T' | 'TR' | 'RT' | 'R' | 'BR' | 'RB' | 'B' | 'BL' | 'LB' | 'L' | 'TL' | 'LT';

// Define the connection points interface
interface BiomeConnections {
  sources: [HandleDirection, string][]; // [direction, targetBiome]
  targets: [HandleDirection, string][]; // [direction, sourceBiome]
}

// Map each direction to its position and style
const handlePositions: Record<HandleDirection, { position: Position, style: React.CSSProperties }> = {
  'T': { position: Position.Top, style: {} },
  'TR': { position: Position.Top, style: { transform: 'translateX(400%)' } },
  'RT': { position: Position.Right, style: { transform: 'translateY(-200%)' } },
  'R': { position: Position.Right, style: {} },
  'BR': { position: Position.Bottom, style: { transform: 'translateX(400%)' } },
  'RB': { position: Position.Right, style: { transform: 'translateY(150%)' } },
  'B': { position: Position.Bottom, style: {} },
  'BL': { position: Position.Bottom, style: { transform: 'translateX(-500%)' } },
  'LB': { position: Position.Left, style: { transform: 'translateY(150%)' } },
  'L': { position: Position.Left, style: {} },
  'TL': { position: Position.Top, style: { transform: 'translateX(-500%)' } },
  'LT': { position: Position.Left, style: { transform: 'translateY(-200%)' } },
};

// Define the connection points for each biome
const biomeHandles: Record<string, BiomeConnections> = {
  "Abyss": {
    sources: [['T', 'Space'], ['TR', 'Cave'], ['B', 'Wasteland']],
    targets: [['L', 'Graveyard']]
  },
  "Ancient Ruins": {
    sources: [['TR', 'Mountain'], ['B', 'Forest']],
    targets: [['L', 'Desert'], ['T', 'Temple'], ['R', 'Space']]
  },
  "Badlands": {
    sources: [['L', 'Desert'], ['RB', 'Mountain']],
    targets: [['T', 'Cave'], ['R', 'Wasteland']]
  },
  "Beach": {
    sources: [['B', 'Island'], ['BR', 'Sea']],
    targets: [['L', 'Lake'], ['R', 'Volcano']]
  },
  "Cave": {
    sources: [['TL', 'Laboratory'], ['T', 'Lake'], ['B', 'Badlands']],
    targets: [['L', 'Tall Grass'], ['BL', 'Abyss'], ['BR', 'Seabed']]
  },
  "Construction Site": {
    sources: [['BL', 'Power Plant'], ['TL', 'Dojo']],
    targets: [['L', 'Slum'], ['B', 'Laboratory'], ['BR', 'Lake'], ['R', 'Desert']]
  },
  "Desert": {
    sources: [['L', 'Construction Site'], ['R', 'Ancient Ruins']],
    targets: [['T', 'Temple'], ['B', 'Badlands']]
  },
  "Dojo": {
    sources: [['LB', 'Plains'], ['T', 'Temple'], ['R', 'Jungle']],
    targets: [['BR', 'Construction Site']]
  },
  "Factory": {
    sources: [['T', 'Laboratory'], ['BL', 'Plains']],
    targets: [['TL', 'Power Plant']]
  },
  "Fairy Cave": {
    sources: [['T', 'Space'], ['R', 'Ice Cave']],
    targets: [['L', 'Meadow']]
  },
  "Forest": {
    sources: [['T', 'Jungle'], ['R', 'Meadow']],
    targets: [['B', 'Tall Grass'], ['BR', 'Snowy Forest'], ['TR', 'Ancient Ruins']]
  },
  "Grassy Field": {
    sources: [['R', 'Tall Grass']],
    targets: [['T', 'Plains']]
  },
  "Graveyard": {
    sources: [['R', 'Abyss']],
    targets: [['T', 'Swamp']]
  },
  "Ice Cave": {
    sources: [['BL', 'Snowy Forest']],
    targets: [['L', 'Fairy Cave'], ['B', 'Sea'], ['R', 'Volcano']]
  },
  "Island": {
    sources: [['R', 'Sea']],
    targets: [['T', 'Beach']]
  },
  "Jungle": {
    sources: [['R', 'Temple']],
    targets: [['L', 'Dojo'], ['B', 'Forest']]
  },
  "Laboratory": {
    sources: [['T', 'Construction Site']],
    targets: [['R', 'Cave'], ['B', 'Factory']]
  },
  "Lake": {
    sources: [['T', 'Construction Site'], ['R', 'Beach'], ['BL', 'Swamp']],
    targets: [['L', 'Plains'], ['B', 'Cave'], ['TR', 'Snowy Forest']]
  },
  "Meadow": {
    sources: [['B', 'Plains'], ['R', 'Fairy Cave']],
    targets: [['L', 'Forest']]
  },
  "Metropolis": {
    sources: [['T', 'Slum']],
    targets: [['R', 'Plains']]
  },
  "Mountain": {
    sources: [['T', 'Space'], ['B', 'Wasteland'], ['BL', 'Volcano']],
    targets: [['L', 'Snowy Forest'], ['TR', 'Ancient Ruins'], ['BR', 'Badlands']]
  },

  "Plains": {
    sources: [['L', 'Metropolis'], ['B', 'Grassy Field'], ['R', 'Lake']],
    targets: [['BL', 'Town'], ['TR', 'Factory'], ['RT', 'Meadow'], ['LT', 'Dojo']]
  },
  "Power Plant": {
    sources: [['BR', 'Factory']],
    targets: [['TR', 'Construction Site']]
  },
  "Sea": {
    sources: [['T', 'Ice Cave'], ['BL', 'Seabed']],
    targets: [['L', 'Island'], ['TL', 'Beach']]
  },
  "Seabed": {
    sources: [['TL', 'Cave'], ['R', 'Volcano']],
    targets: [['TR', 'Sea']]
  },
  "Slum": {
    sources: [['T', 'Construction Site'], ['R', 'Swamp']],
    targets: [['B', 'Metropolis']]
  },
  "Snowy Forest": {
    sources: [['L', 'Lake'], ['B', 'Forest'], ['R', 'Mountain']],
    targets: [['TR', 'Ice Cave']]
  },
  "Space": {
    sources: [['L', 'Ancient Ruins']],
    targets: [['RT', 'Mountain'], ['B', 'Abyss'], ['R', 'Fairy Cave']]
  },
  "Swamp": {
    sources: [['LB', 'Tall Grass'], ['B', 'Graveyard']],
    targets: [['L', 'Slum'], ['LT', 'Temple'], ['R', 'Lake']]
  },
  "Tall Grass": {
    sources: [['T', 'Forest'], ['R', 'Cave']],
    targets: [['L', 'Grassy Field'], ['RT', 'Swamp']]
  },
  "Temple": {
    sources: [['R', 'Ancient Ruins'], ['RB', 'Swamp'], ['B', 'Desert']],
    targets: [['L', 'Jungle'], ['TL', 'Dojo']]
  },
  "Town": {
    sources: [['TR', 'Plains']],
    targets: []
  },
  "Volcano": {
    sources: [['T', 'Ice Cave'], ['L', 'Beach']],
    targets: [['B', 'Seabed'], ['R', 'Mountain']]
  },
  "Wasteland": {
    sources: [['B', 'Badlands']],
    targets: [['L', 'Abyss'], ['R', 'Mountain']]
  },

};

// Add the initial edges configuration
const initialEdgeConnections = [
  {
    "id": "Mountain-Wasteland",
    "source": "Mountain",
    "target": "Wasteland",
    "sourceHandle": "source-B-Wasteland",
    "targetHandle": "target-R-Mountain",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Wasteland-Badlands",
    "source": "Wasteland",
    "target": "Badlands",
    "sourceHandle": "source-B-Badlands",
    "targetHandle": "target-R-Wasteland",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Abyss-Wasteland",
    "source": "Abyss",
    "target": "Wasteland",
    "sourceHandle": "source-B-Wasteland",
    "targetHandle": "target-L-Abyss",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Seabed-Volcano",
    "source": "Seabed",
    "target": "Volcano",
    "sourceHandle": "source-R-Volcano",
    "targetHandle": "target-B-Seabed",
    "type": "smoothstep",
    "label": "33%"
  },
  {
    "id": "Sea-Seabed",
    "source": "Sea",
    "target": "Seabed",
    "sourceHandle": "source-BL-Seabed",
    "targetHandle": "target-TR-Sea",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Sea-Ice Cave",
    "source": "Sea",
    "target": "Ice Cave",
    "sourceHandle": "source-T-Ice Cave",
    "targetHandle": "target-B-Sea",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Mountain-Volcano",
    "source": "Mountain",
    "target": "Volcano",
    "sourceHandle": "source-BL-Volcano",
    "targetHandle": "target-R-Mountain",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Snowy Forest-Mountain",
    "source": "Snowy Forest",
    "target": "Mountain",
    "sourceHandle": "source-R-Mountain",
    "targetHandle": "target-L-Snowy Forest",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Mountain-Space",
    "source": "Mountain",
    "target": "Space",
    "sourceHandle": "source-T-Space",
    "targetHandle": "target-RT-Mountain",
    "type": "smoothstep",
    "label": "33%"
  },
  {
    "id": "Ancient Ruins-Mountain",
    "source": "Ancient Ruins",
    "target": "Mountain",
    "sourceHandle": "source-TR-Mountain",
    "targetHandle": "target-TR-Ancient Ruins",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Ice Cave-Snowy Forest",
    "source": "Ice Cave",
    "target": "Snowy Forest",
    "sourceHandle": "source-BL-Snowy Forest",
    "targetHandle": "target-TR-Ice Cave",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Fairy Cave-Ice Cave",
    "source": "Fairy Cave",
    "target": "Ice Cave",
    "sourceHandle": "source-R-Ice Cave",
    "targetHandle": "target-L-Fairy Cave",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Meadow-Fairy Cave",
    "source": "Meadow",
    "target": "Fairy Cave",
    "sourceHandle": "source-R-Fairy Cave",
    "targetHandle": "target-L-Meadow",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Snowy Forest-Lake",
    "source": "Snowy Forest",
    "target": "Lake",
    "sourceHandle": "source-L-Lake",
    "targetHandle": "target-TR-Snowy Forest",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Lake-Beach",
    "source": "Lake",
    "target": "Beach",
    "sourceHandle": "source-R-Beach",
    "targetHandle": "target-L-Lake",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Beach-Island",
    "source": "Beach",
    "target": "Island",
    "sourceHandle": "source-B-Island",
    "targetHandle": "target-T-Beach",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Beach-Sea",
    "source": "Beach",
    "target": "Sea",
    "sourceHandle": "source-BR-Sea",
    "targetHandle": "target-TL-Beach",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Volcano-Beach",
    "source": "Volcano",
    "target": "Beach",
    "sourceHandle": "source-L-Beach",
    "targetHandle": "target-R-Volcano",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Island-Sea",
    "source": "Island",
    "target": "Sea",
    "sourceHandle": "source-R-Sea",
    "targetHandle": "target-L-Island",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Seabed-Cave",
    "source": "Seabed",
    "target": "Cave",
    "sourceHandle": "source-TL-Cave",
    "targetHandle": "target-BR-Seabed",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Cave-Lake",
    "source": "Cave",
    "target": "Lake",
    "sourceHandle": "source-T-Lake",
    "targetHandle": "target-B-Cave",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Cave-Badlands",
    "source": "Cave",
    "target": "Badlands",
    "sourceHandle": "source-B-Badlands",
    "targetHandle": "target-T-Cave",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Abyss-Space",
    "source": "Abyss",
    "target": "Space",
    "sourceHandle": "source-T-Space",
    "targetHandle": "target-B-Abyss",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Abyss-Cave",
    "source": "Abyss",
    "target": "Cave",
    "sourceHandle": "source-TR-Cave",
    "targetHandle": "target-BL-Abyss",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Fairy Cave-Space",
    "source": "Fairy Cave",
    "target": "Space",
    "sourceHandle": "source-T-Space",
    "targetHandle": "target-R-Fairy Cave",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Volcano-Ice Cave",
    "source": "Volcano",
    "target": "Ice Cave",
    "sourceHandle": "source-T-Ice Cave",
    "targetHandle": "target-R-Volcano",
    "type": "smoothstep",
    "label": "33%"
  },
  {
    "id": "Tall Grass-Cave",
    "source": "Tall Grass",
    "target": "Cave",
    "sourceHandle": "source-R-Cave",
    "targetHandle": "target-L-Tall Grass",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Grassy Field-Tall Grass",
    "source": "Grassy Field",
    "target": "Tall Grass",
    "sourceHandle": "source-R-Tall Grass",
    "targetHandle": "target-L-Grassy Field",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Town-Plains",
    "source": "Town",
    "target": "Plains",
    "sourceHandle": "source-TR-Plains",
    "targetHandle": "target-BL-Town",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Plains-Grassy Field",
    "source": "Plains",
    "target": "Grassy Field",
    "sourceHandle": "source-B-Grassy Field",
    "targetHandle": "target-T-Plains",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Plains-Metropolis",
    "source": "Plains",
    "target": "Metropolis",
    "sourceHandle": "source-L-Metropolis",
    "targetHandle": "target-R-Plains",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Metropolis-Slum",
    "source": "Metropolis",
    "target": "Slum",
    "sourceHandle": "source-T-Slum",
    "targetHandle": "target-B-Metropolis",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Slum-Construction Site",
    "source": "Slum",
    "target": "Construction Site",
    "sourceHandle": "source-T-Construction Site",
    "targetHandle": "target-L-Slum",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Swamp-Tall Grass",
    "source": "Swamp",
    "target": "Tall Grass",
    "sourceHandle": "source-LB-Tall Grass",
    "targetHandle": "target-RT-Swamp",
    "type": "bezier",
    "label": "100%"
  },
  {
    "id": "Badlands-Mountain",
    "source": "Badlands",
    "target": "Mountain",
    "sourceHandle": "source-RB-Mountain",
    "targetHandle": "target-BR-Badlands",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Space-Ancient Ruins",
    "source": "Space",
    "target": "Ancient Ruins",
    "sourceHandle": "source-L-Ancient Ruins",
    "targetHandle": "target-R-Space",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Desert-Ancient Ruins",
    "source": "Desert",
    "target": "Ancient Ruins",
    "sourceHandle": "source-R-Ancient Ruins",
    "targetHandle": "target-L-Desert",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Temple-Ancient Ruins",
    "source": "Temple",
    "target": "Ancient Ruins",
    "sourceHandle": "source-R-Ancient Ruins",
    "targetHandle": "target-T-Temple",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Temple-Swamp",
    "source": "Temple",
    "target": "Swamp",
    "sourceHandle": "source-RB-Swamp",
    "targetHandle": "target-LT-Temple",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Ancient Ruins-Forest",
    "source": "Ancient Ruins",
    "target": "Forest",
    "sourceHandle": "source-B-Forest",
    "targetHandle": "target-TR-Ancient Ruins",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Forest-Jungle",
    "source": "Forest",
    "target": "Jungle",
    "sourceHandle": "source-T-Jungle",
    "targetHandle": "target-B-Forest",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Jungle-Temple",
    "source": "Jungle",
    "target": "Temple",
    "sourceHandle": "source-R-Temple",
    "targetHandle": "target-L-Jungle",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Dojo-Temple",
    "source": "Dojo",
    "target": "Temple",
    "sourceHandle": "source-T-Temple",
    "targetHandle": "target-TL-Dojo",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Dojo-Jungle",
    "source": "Dojo",
    "target": "Jungle",
    "sourceHandle": "source-R-Jungle",
    "targetHandle": "target-L-Dojo",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Construction Site-Dojo",
    "source": "Construction Site",
    "target": "Dojo",
    "sourceHandle": "source-TL-Dojo",
    "targetHandle": "target-BR-Construction Site",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Desert-Construction Site",
    "source": "Desert",
    "target": "Construction Site",
    "sourceHandle": "source-L-Construction Site",
    "targetHandle": "target-R-Desert",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Temple-Desert",
    "source": "Temple",
    "target": "Desert",
    "sourceHandle": "source-B-Desert",
    "targetHandle": "target-T-Temple",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Graveyard-Abyss",
    "source": "Graveyard",
    "target": "Abyss",
    "sourceHandle": "source-R-Abyss",
    "targetHandle": "target-L-Graveyard",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Swamp-Graveyard",
    "source": "Swamp",
    "target": "Graveyard",
    "sourceHandle": "source-B-Graveyard",
    "targetHandle": "target-T-Swamp",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Lake-Swamp",
    "source": "Lake",
    "target": "Swamp",
    "sourceHandle": "source-BL-Swamp",
    "targetHandle": "target-R-Lake",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Factory-Plains",
    "source": "Factory",
    "target": "Plains",
    "sourceHandle": "source-BL-Plains",
    "targetHandle": "target-TR-Factory",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Meadow-Plains",
    "source": "Meadow",
    "target": "Plains",
    "sourceHandle": "source-B-Plains",
    "targetHandle": "target-RT-Meadow",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Dojo-Plains",
    "source": "Dojo",
    "target": "Plains",
    "sourceHandle": "source-LB-Plains",
    "targetHandle": "target-LT-Dojo",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Construction Site-Power Plant",
    "source": "Construction Site",
    "target": "Power Plant",
    "sourceHandle": "source-BL-Power Plant",
    "targetHandle": "target-TR-Construction Site",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Power Plant-Factory",
    "source": "Power Plant",
    "target": "Factory",
    "sourceHandle": "source-BR-Factory",
    "targetHandle": "target-TL-Power Plant",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Factory-Laboratory",
    "source": "Factory",
    "target": "Laboratory",
    "sourceHandle": "source-T-Laboratory",
    "targetHandle": "target-B-Factory",
    "type": "straight",
    "label": "50%"
  },
  {
    "id": "Laboratory-Construction Site",
    "source": "Laboratory",
    "target": "Construction Site",
    "sourceHandle": "source-T-Construction Site",
    "targetHandle": "target-B-Laboratory",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Tall Grass-Forest",
    "source": "Tall Grass",
    "target": "Forest",
    "sourceHandle": "source-T-Forest",
    "targetHandle": "target-B-Tall Grass",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Forest-Meadow",
    "source": "Forest",
    "target": "Meadow",
    "sourceHandle": "source-R-Meadow",
    "targetHandle": "target-L-Forest",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Snowy Forest-Forest",
    "source": "Snowy Forest",
    "target": "Forest",
    "sourceHandle": "source-B-Forest",
    "targetHandle": "target-BR-Snowy Forest",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Badlands-Desert",
    "source": "Badlands",
    "target": "Desert",
    "sourceHandle": "source-L-Desert",
    "targetHandle": "target-B-Badlands",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Lake-Construction Site",
    "source": "Lake",
    "target": "Construction Site",
    "sourceHandle": "source-T-Construction Site",
    "targetHandle": "target-BR-Lake",
    "type": "smoothstep",
    "label": "100%"
  },
  {
    "id": "Plains-Lake",
    "source": "Plains",
    "target": "Lake",
    "sourceHandle": "source-R-Lake",
    "targetHandle": "target-L-Plains",
    "type": "straight",
    "label": "100%"
  },
  {
    "id": "Slum-Swamp",
    "source": "Slum",
    "target": "Swamp",
    "sourceHandle": "source-R-Swamp",
    "targetHandle": "target-L-Slum",
    "type": "smoothstep",
    "label": "50%"
  },
  {
    "id": "Cave-Laboratory",
    "source": "Cave",
    "target": "Laboratory",
    "sourceHandle": "source-TL-Laboratory",
    "targetHandle": "target-R-Cave",
    "type": "smoothstep",
    "label": "50%"
  },
] as const;

// Update BiomeNode to use the connections
function BiomeNode({ data, selected }: { data: { label: string }; selected: boolean }) {
  const imagePath = `/images/${data.label.toLowerCase().replace(" ", '_')}.png`;
  const connections = biomeHandles[data.label] || { sources: [], targets: [] };

  return (
    <div className={`
        relative w-28 h-16 overflow-hidden
        ${selected ? 'ring-2 ring-blue-500' : 'ring-transparent'}
        transform-gpu
      `}
      style={{ borderRadius: "0.2rem" }} //crying, sobbing
    >
      {/* Render source handles */}
      {connections.sources.map(([direction, targetBiome]) => {
        const config = handlePositions[direction];
        return (
          <SourceHandleWithValidation
            id={`source-${direction}-${targetBiome}`}
            position={config.position}
            target={targetBiome}
            style={{ ...config.style }}
          />
        );
      })}

      {/* Render target handles */}
      {connections.targets.map(([direction, sourceBiome]) => {
        const config = handlePositions[direction];
        return (
          <TargetHandleWithValidation
            id={`target-${direction}-${sourceBiome}`}
            position={config.position}
            source={sourceBiome}
            style={{ ...config.style, background: '#94a3b8', width: '10px', height: '10px' }}
          />
        );
      })}

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

const nodeTypes = {
  biomeNode: BiomeNode,
}

interface SavedEdgeData {
  edges: Edge[];
  version: string;
  timestamp: number;
}


type EdgeType = 'straight' | 'smoothstep' | 'bezier';

interface EdgeTypeMenuProps {
  position: { x: number; y: number };
  onSelect: (type: EdgeType) => void;
  onClose: () => void;
}

function EdgeTypeMenu({ position, onSelect, onClose }: EdgeTypeMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-2"
      style={{ left: position.x, top: position.y }}
    >
      <div className="space-y-1">
        {(['straight', 'smoothstep', 'bezier'] as EdgeType[]).map(type => (
          <button
            key={type}
            className="w-full px-4 py-2 text-left hover:bg-slate-100 rounded text-sm capitalize"
            onClick={() => onSelect(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BiomeGraph({ activePath, activeProbs }: BiomeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // Initialize edges with the predefined connections
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdgeConnections.map(conn => ({
      ...conn,
      animated: false,
      style: {
        stroke: conn.label.includes('50%') ? '#3b82f6' :
          conn.label.includes('33%') ? '#eab308' : '#94a3b8',
        opacity: 0.3
      },
      labelStyle: {
        fill: conn.label.includes('50%') ? '#3b82f6' :
          conn.label.includes('33%') ? '#eab308' : '#000000',
        fontSize: 15,
      },
      markerEnd: { type: MarkerType.ArrowClosed },
    }))
  );

  const [menu, setMenu] = useState<{ position: { x: number; y: number }; connection: any } | null>(null);

  // Handle connection
  // const onConnect = useCallback((connection: any) => {
  //   // Show menu at mouse position
  //   console.log(connection);
  //   setMenu({
  //     position: { x: (window.event as MouseEvent)?.clientX * 0.7 || 0, y: (window.event as MouseEvent)?.clientY * 0.7 || 0 },
  //     connection
  //   });
  // }, []);

  // Handle edge type selection
  // const handleEdgeTypeSelect = useCallback((type: EdgeType) => {
  //   if (!menu) return;

  //   const { source, target, sourceHandle, targetHandle } = menu.connection;
  //   console.log("connection: ", menu.connection);

  //   // Find probability from adjacencyList
  //   const probability = adjacencyList[source]?.find(([t]) => t === target)?.[1] || 1.0;
  //   // if probability is less than 100%, add the label
  //   if (probability < 1.0) {
  //     // make it blue if == 0.5, yellow if 0.3
  //     let labelColor = '#000000';
  //     let lineStroke = '#94a3b8';
  //     if (probability === 0.5) {
  //       labelColor = '#3b82f6';
  //       lineStroke = '#3b82f6';
  //     } else if (probability === 0.33) {
  //       labelColor = '#eab308';
  //       lineStroke = '#eab308';
  //     }
  //     const newEdge: Edge = {
  //       id: `${source}-${target}`,
  //       source: source,
  //       target: target,
  //       sourceHandle: sourceHandle,
  //       targetHandle: targetHandle,
  //       type,
  //       animated: false,
  //       label: `${(probability * 100).toFixed(0)}%`,
  //       labelStyle: { fill: labelColor, fontSize: 19 },
  //       style: { stroke: lineStroke, opacity: 0.3 },
  //       markerEnd: { type: MarkerType.ArrowClosed },
  //     };
  //     setEdges(eds => [...eds, newEdge]);
  //   }
  //   else {
  //     const newEdge: Edge = {
  //       id: `${source}-${target}`,
  //       source: source,
  //       target: target,
  //       sourceHandle: sourceHandle,
  //       targetHandle: targetHandle,
  //       type,
  //       animated: false,
  //       style: { stroke: '#94a3b8', opacity: 0.3 },
  //       markerEnd: { type: MarkerType.ArrowClosed },
  //     };
  //     setEdges(eds => [...eds, newEdge]);
  //   }
  //   // Create new edge

  //   setMenu(null);
  // }, [menu, setEdges]);

  // const handleSaveEdges = useCallback(() => {
  //   const edgeData = edges.map(edge => ({
  //     id: edge.id,
  //     source: edge.source,
  //     target: edge.target,
  //     sourceHandle: edge.sourceHandle,
  //     targetHandle: edge.targetHandle,
  //     type: edge.type,
  //     label: edge.label,
  //   }));
  //   console.log('Edge Data:');
  //   console.log(JSON.stringify(edgeData, null, 2));
  // }, [edges]);

  // Add position logging
  const handleNodesChange = (changes: any) => {
    onNodesChange(changes);
  };

  // // Remove layout useEffect and replace with simple edge creation
  // useLayoutEffect(() => {
  //   setEdges(createEdges(adjacencyList));
  // }, []);
  useLayoutEffect(() => {
    if (!edges.length) return; // Skip if edges haven't been created yet

    setEdges((eds) =>
      eds.map((edge) => {
        const isActive = activePath.some((_, i) =>
          i < activePath.length - 1 &&
          edge.id === `${activePath[i]}-${activePath[i + 1]}`
        );

        // Get original color based on probability label
        const originalColor = typeof edge.label === 'string' && edge.label.includes('50%') ? '#3b82f6' :
          typeof edge.label === 'string' && edge.label.includes('33%') ? '#eab308' :
            '#363a45';

        return {
          ...edge,
          animated: isActive,
          style: {
            ...edge.style,
            stroke: isActive ? "#25bd49" : originalColor,
            opacity: 1,
            strokeDasharray: 5,
            strokeWidth: isActive ? 5 : 2,
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

  const edgeOptions = {
    type: 'simplebezier',
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  // Add handler for removing last edge
  // const handleRemoveLastEdge = useCallback(() => {
  //   setEdges(eds => eds.slice(0, -1));
  // }, [setEdges]);

  // Update the buttons section in the return statement
  return (
    <div className="h-[800px] bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200">
      {/* {menu && (
        <EdgeTypeMenu
          position={menu.position}
          onSelect={handleEdgeTypeSelect}
          onClose={() => setMenu(null)}
        />
      )} */}
      {/* <div className="absolute top-4 right-4 z-10 space-x-2">
        <button
          onClick={handleRemoveLastEdge}
          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          title="Remove last edge"
        >
          Undo Edge
        </button>
        <button
          onClick={handleSaveEdges}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
        >
          Print Edges to Console
        </button>
      </div> */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50/50"
        minZoom={0.7}
        maxZoom={1}
        defaultEdgeOptions={edgeOptions}
      />
    </div>
  );
}
