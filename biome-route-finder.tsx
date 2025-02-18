"use client"

import { useState, useMemo, useEffect } from "react"
import { BiomeDropdown } from "./biome-dropdown"
import { RouteList } from "./route-list"
import { biomes, adjacencyList } from "./biome-data"
import { Tab } from '@headlessui/react'

export type Route = {
  path: string[];
  probabilities: number[];
}

type RouteType = 'shortest' | 'highest-probability';
type PathfinderMode = 'route' | 'cycle';

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

  // console.log(`Found ${routes.length} routes:`, routes);
  return routes;
}
function findHighestProbabilityRoute(source: string, destination: string): Route[] {
  // finds highest probability route with shortest length
  // console.log(`Finding highest probability route from ${source} to ${destination}`);
  const visited = new Map<string, number>();
  const queue: { node: string; path: string[]; probs: number[]; cumProb: number }[] = [];
  let bestRoute: Route | null = null;
  let highestProbability = 0;
  let shortestLength = Infinity;

  queue.push({ node: source, path: [source], probs: [], cumProb: 1 });
  visited.set(source, 1);

  while (queue.length > 0) {
    const { node, path, probs, cumProb } = queue.shift()!;

    // If we found a path to destination
    if (node === destination) {
      if (cumProb > highestProbability) {
        // Always update if probability is higher
        highestProbability = cumProb;
        bestRoute = { path, probabilities: probs };
        shortestLength = path.length;
      } else if (cumProb === highestProbability && path.length < shortestLength) {
        // If same probability but shorter path, update
        bestRoute = { path, probabilities: probs };
        shortestLength = path.length;
      }
      continue;
    }

    // Get neighbors from adjacency list
    const neighbors = adjacencyList[node] || [];
    for (const [nextNode, probability] of neighbors) {
      const newCumProb = cumProb * probability;
      // Visit if never seen or if new probability is higher
      if (!visited.has(nextNode) || newCumProb > visited.get(nextNode)!) {
        visited.set(nextNode, newCumProb);
        queue.push({
          node: nextNode,
          path: [...path, nextNode],
          probs: [...probs, probability],
          cumProb: newCumProb
        });
      }
    }
  }

  if (bestRoute) {
    return [bestRoute];
  } else {
    console.log(`No route found`);
    return [];
  }
}

function findShortestCycle(startingPoint: string): Route[] {
  console.log(`Finding shortest cycle starting and ending at ${startingPoint}`);
  const visited = new Set<string>();
  const queue: { node: string; path: string[]; probs: number[] }[] = [];
  const cycles: Route[] = [];
  let shortestLength = Infinity;

  queue.push({ node: startingPoint, path: [startingPoint], probs: [] });

  while (queue.length > 0) {
    const { node, path, probs } = queue.shift()!;

    // If we found a cycle
    if (node === startingPoint && path.length > 1) {
      if (path.length <= shortestLength) {
        shortestLength = path.length;
        cycles.push({ path, probabilities: probs });
      }
      continue;
    }

    // Get neighbors from adjacency list
    const neighbors = adjacencyList[node] || [];
    for (const [nextNode, probability] of neighbors) {
      if (!visited.has(nextNode) || nextNode === startingPoint) {
        visited.add(nextNode);
        queue.push({
          node: nextNode,
          path: [...path, nextNode],
          probs: [...probs, probability]
        });
      }
    }
  }

  console.log(`Found ${cycles.length} cycles:`, cycles);
  return cycles;
}

function findHighestProbabilityCycle(startingPoint: string): Route[] {
  // Placeholder: Implement cycle detection with probability weights
  // For now, return empty route
  return [];
}

export default function BiomeRouteFinder() {
  const [mode, setMode] = useState<PathfinderMode>('route');
  const [routeType, setRouteType] = useState<RouteType>('shortest');
  const [sourceBiome, setSourceBiome] = useState<string | null>("Town");
  const [destinationBiome, setDestinationBiome] = useState<string | null>(null);

  const routes = useMemo(() => {
    if (mode ==='cycle' && routeType === 'highest-probability') {
      // not implemented, set it back to shortest
      setRouteType('shortest');
    }
    if (mode === 'route') {
      if (!sourceBiome || !destinationBiome) return [];
    } else {
      if (!sourceBiome) return [];
    }


    if (mode === 'route' && destinationBiome) {
      return routeType === 'shortest'
        ? findShortestRoutes(sourceBiome, destinationBiome)
        : findHighestProbabilityRoute(sourceBiome, destinationBiome);
    }

    if (mode === 'cycle') {
      return routeType === 'shortest'
        ? findShortestCycle(sourceBiome)
        : findHighestProbabilityCycle(sourceBiome);
    }

    return [];
  }, [mode, routeType, sourceBiome, destinationBiome]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-sm p-6 border-r border-slate-200 shadow-lg">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">PokéRogue Path Finder</h1>

        <Tab.Group onChange={(index) => setMode(index === 0 ? 'route' : 'cycle')}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-3 text-base font-medium leading-5
               ${selected
          ? 'bg-white text-blue-900 shadow'
          : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'}`
            }>
              Route
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-3 text-base font-medium leading-5
               ${selected
          ? 'bg-white text-blue-900 shadow'
          : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'}`
            }>
              Cycle
            </Tab>
          </Tab.List>
        </Tab.Group>

        <div className="space-y-6">
          <div className="space-y-2">
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value as RouteType)}
              className="w-full rounded-lg border border-slate-200 py-2 px-3"
            >
                {mode === 'route' ? (
                <>
                  <option value="shortest">Shortest Path</option>
                  <option value="highest-probability">Highest Probability</option>
                </>
                ) : (
                <>
                  <option value="shortest">Shortest Cycle</option>
                  <option value="highest-probability">Most Chances (not implemented)</option>
                </>
                )}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-slate-600">Starting from</p>
            <BiomeDropdown
              biomes={biomes}
              value={sourceBiome}
              onChange={setSourceBiome}
              placeholder="Select start biome"
              allowEmpty={false}  // Don't allow empty for source
            />
          </div>

          {mode === 'route' && (
            <div className="space-y-2">
              <p className="text-slate-600">to</p>
              <BiomeDropdown
                biomes={biomes}
                value={destinationBiome}
                onChange={setDestinationBiome}
                placeholder="Select target biome"
                allowEmpty={true}  // Allow empty for destination
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <RouteList routes={routes} mode={mode} />
      </div>
    </div>
  );
}

