"use client"

import { useState, useMemo } from "react"
import { BiomeDropdown } from "./biome-dropdown"
import { RouteList } from "./route-list"
import { biomes, adjacencyList } from "./biome-data"

export type Route = {
  path: string[];
  probabilities: number[];
}

function findShortestRoutes(source: string, destination: string): Route[] {
  console.log(`Finding routes from ${source} to ${destination}`);
  const visited = new Set<string>();
  const queue: { node: string; path: string[]; probs: number[] }[] = [];
  const routes: Route[] = [];
  
  queue.push({ node: source, path: [source], probs: [] });
  visited.add(source);
  let shortestLength = Infinity;

  while (queue.length > 0) {
    const { node, path, probs } = queue.shift()!;
    console.log(`Visiting node ${node}, path so far:`, path);

    // If we found a path to destination
    if (node === destination) {
      console.log(`Found path to destination:`, path);
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
    console.log(`Neighbors for ${node}:`, neighbors);
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

  console.log(`Found ${routes.length} routes:`, routes);
  return routes;
}

export default function BiomeRouteFinder() {
  const [sourceBiome, setSourceBiome] = useState<string | null>(null)
  const [destinationBiome, setDestinationBiome] = useState<string | null>(null)

  const routes = useMemo(() => {
    console.log("Finding routes from", sourceBiome, "to", destinationBiome);
    if (sourceBiome && destinationBiome) {
      return findShortestRoutes(sourceBiome, destinationBiome)
    }
    return []
  }, [sourceBiome, destinationBiome])

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-sm p-6 border-r border-slate-200 shadow-lg">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">PokéRogue Path Finder</h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-slate-600">I want to go from</p>
            <BiomeDropdown
              biomes={biomes}
              value={sourceBiome}
              onChange={setSourceBiome}
              placeholder="Select start biome"
            />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600">to</p>
            <BiomeDropdown
              biomes={biomes}
              value={destinationBiome}
              onChange={setDestinationBiome}
              placeholder="Select target biome"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <RouteList routes={routes} />
      </div>
    </div>
  )
}

