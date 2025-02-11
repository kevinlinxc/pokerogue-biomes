"use client"

import { useState, useMemo } from "react"
import { BiomeDropdown } from "./biome-dropdown"
import { RouteList } from "./route-list"

const biomes = [
  "Abyss",
  "Ancient Ruins",
  "Badlands",
  "Beach",
  "Cave",
  "Construction Site",
  "Desert",
  "Dojo",
  "Factory",
  "Fairy Cave",
  "Forest",
  "Grassy Field",
  "Graveyard",
  "Ice Cave",
  "Island",
  "Jungle",
  "Laboratory",
  "Lake",
  "Meadow",
  "Metropolis",
  "Mountain",
  "Plains",
  "Power Plant",
  "Sea",
  "Seabed",
  "Slum",
  "Snowy Forest",
  "Space",
  "Swamp",
  "Tall Grass",
  "Temple",
  "Town",
  "Volcano",
  "Wasteland",
]

const adjacencyList: { [key: string]: [string, number][] } = {
  "Abyss": [["Space", 0.5], ["Cave", 1.0]],
  "Ancient Ruins": [["Mountain", 1.0], ["Forest", 0.5]],
  "Badlands": [["Mountain", 1.0], ["Desert", 1.0]],
  "Beach": [["Sea", 1.0], ["Island", 0.5]],
  "Cave": [["Lake", 1.0], ["Laboratory", 0.5], ["Badlands", 1.0]],
  "Construction Site": [["Dojo", 0.5], ["Power Plant", 1.0]],
  "Desert": [["Ancient Ruins", 1.0], ["Construction Site", 0.5]],
  "Dojo": [["Plains", 1.0], ["Jungle", 0.5], ["Temple", 0.5]],
  "Factory": [["Plains", 1.0], ["Laboratory", 0.5]],
  "Fairy Cave": [["Space", 0.5], ["Ice Cave", 1.0]],
  "Forest": [["Meadow", 1.0], ["Jungle", 1.0]],
  "Grassy Field": [["Tall Grass", 1.0]],
  "Graveyard": [["Abyss", 1.0]],
  "Ice Cave": [["Snowy Forest", 1.0]],
  "Island": [["Sea", 1.0]],
  "Jungle": [["Temple", 1.0]],
  "Laboratory": [["Construction Site", 1.0]],
  "Lake": [["Swamp", 1.0], ["Beach", 1.0], ["Construction Site", 1.0]],
  "Meadow": [["Plains", 1.0], ["Fairy Cave", 1.0]],
  "Metropolis": [["Slum", 1.0]],
  "Mountain": [["Space", 0.33], ["Volcano", 1.0], ["Wasteland", 0.5]],
  "Plains": [["Grassy Field", 1.0], ["Metropolis", 1.0], ["Lake", 1.0]],
  "Power Plant": [["Factory", 1.0]],
  "Sea": [["Seabed", 1.0], ["Ice Cave", 1.0]],
  "Seabed": [["Cave", 1], ["Volcano", 0.33]],
  "Slum": [["Construction Site", 1.0], ["Swamp", 0.5]],
  "Snowy Forest": [["Forest", 1.0], ["Mountain", 0.5], ["Lake", 0.5]],
  "Space": [["Ancient Ruins", 1.0]],
  "Swamp": [["Graveyard", 1.0], ["Tall Grass", 1.0]],
  "Tall Grass": [["Cave", 1.0], ["Forest", 1.0]],
  "Temple": [["Desert", 1.0], ["Ancient Ruins", 0.5], ["Swamp", 0.5]],
  "Town": [["Plains", 1.0]],
  "Volcano": [["Beach", 1.0], ["Ice Cave", 0.33]],
  "Wasteland": [["Badlands", 1.0]],
}

export function validateBiomeGraph(biomes: string[], adjacencyList: { [key: string]: [string, number][] }): boolean {
  const uniqueAdjacencyBiomes = new Set<string>();
  // Add all source biomes (keys)
  Object.keys(adjacencyList).forEach(biome => uniqueAdjacencyBiomes.add(biome));

  // Add all destination biomes (from the connection lists)
  Object.values(adjacencyList).forEach(connections => {
    connections.forEach(([biome]) => uniqueAdjacencyBiomes.add(biome));
  });
  const uniqueBiomesList = new Set(biomes);

  if (uniqueAdjacencyBiomes.size !== uniqueBiomesList.size) {
    console.error("Biome count mismatch:", {
      adjacencyListCount: uniqueAdjacencyBiomes.size,
      biomesListCount: uniqueBiomesList.size,
      missingInAdjacencyList: [...uniqueBiomesList].filter(b => !uniqueAdjacencyBiomes.has(b)),
      missingInBiomesList: [...uniqueAdjacencyBiomes].filter(b => !uniqueBiomesList.has(b))
    });
    return false;
  }

  // Check 2: Verify all nodes can be visited using DFS
  const visited = new Set<string>();

  function dfs(node: string) {
    visited.add(node);
    const neighbors = adjacencyList[node] || [];
    for (const [nextNode] of neighbors) {
      if (!visited.has(nextNode)) {
        dfs(nextNode);
      }
    }
  }

  // Start DFS from the first node
  const startNode = "Town";
  dfs(startNode);

  // Check if all nodes were visited
  const unreachableNodes = biomes.filter(node => !visited.has(node));
  if (unreachableNodes.length > 0) {
    console.error("Unreachable biomes:", unreachableNodes);
    return false;
  }
  console.log("Biome graph is valid");

  return true;
}

validateBiomeGraph(biomes, adjacencyList);

type Route = {
  path: string[];
  probabilities: number[];
}

function findShortestRoutes(source: string, destination: string): Route[] {
  const visited = new Set<string>();
  const queue: { node: string; path: string[]; probs: number[] }[] = [];
  const routes: Route[] = [];
  
  queue.push({ node: source, path: [source], probs: [] });
  visited.add(source);
  let shortestLength = Infinity;

  while (queue.length > 0) {
    const { node, path, probs } = queue.shift()!;

    // If we found a path to destination
    if (node === destination) {
      // If this is the first path or same length as shortest
      if (path.length <= shortestLength) {
        shortestLength = path.length;
        routes.push({ path, probabilities: probs });
      }
      // If this path is longer than shortest, we can stop (BFS property)
      if (path.length > shortestLength) break;
      continue;
    }

    // Get neighbors from adjacency list
    const neighbors = adjacencyList[node] || [];
    for (const [nextNode, probability] of neighbors) {
      if (!visited.has(nextNode)) {
        visited.add(nextNode);
        queue.push({
          node: nextNode,
          path: [...path, nextNode],
          probs: [...probs, probability]
        });
      }
    }
  }

  return routes;
}

export default function BiomeRouteFinder() {
  const [sourceBiome, setSourceBiome] = useState<string | null>(null)
  const [destinationBiome, setDestinationBiome] = useState<string | null>(null)

  const routes = useMemo(() => {
    if (sourceBiome && destinationBiome) {
      return findShortestRoutes(sourceBiome, destinationBiome)
    }
    return []
  }, [sourceBiome, destinationBiome])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="container max-w-2xl mx-auto p-8 bg-black bg-opacity-30 backdrop-blur-lg rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Pokerogue Biome Route Finder</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          <div className="w-full sm:w-[200px]">
            <BiomeDropdown
              biomes={biomes}
              value={sourceBiome}
              onChange={setSourceBiome}
              placeholder="Select start biome"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <BiomeDropdown
              biomes={biomes}
              value={destinationBiome}
              onChange={setDestinationBiome}
              placeholder="Select target biome"
            />
          </div>
        </div>
        <RouteList routes={routes} />
      </div>
    </div>
  )
}

