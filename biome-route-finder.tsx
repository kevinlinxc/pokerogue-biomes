"use client"

import { useState, useMemo, useEffect } from "react"
import { BiomeDropdown } from "./biome-dropdown"
import { RouteList } from "./route-list"
import { biomes, adjacencyList } from "./biome-data"
import { Tab, TabGroup, TabList } from '@headlessui/react'

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
    if (mode === 'cycle' && routeType === 'highest-probability') {
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100">
      {/* Sidebar */}
      <div className="lg:w-80 w-full bg-white p-6 lg:border-r border-b lg:border-b-0 border-slate-200 shadow-lg relative">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">PokéRogue Path Finder</h1>

        <TabGroup onChange={(index) => setMode(index === 0 ? 'route' : 'cycle')}>
          <TabList className="flex space-x-1 rounded-xl bg-red-700/20 p-1 mb-6">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-3 text-base font-medium leading-5
               focus:outline-none focus:ring-2 focus:ring-black-500
               ${selected
                ? 'bg-white text-red-900 shadow'
                : 'text-red-700 hover:bg-white/[0.12] hover:text-black-800'}`
            }>
              Route
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-3 text-base font-medium leading-5
               focus:outline-none focus:ring-2 focus:ring-black-500
               ${selected
                ? 'bg-white text-red-900 shadow'
                : 'text-red-700 hover:bg-white/[0.12] hover:text-black-800'}`
            }>
              Cycle
            </Tab>
          </TabList>
        </TabGroup>

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

          {/* First dropdown */}
          <div className="space-y-2">
            <p className="text-slate-600">Starting from</p>
            <div className="relative">
              <BiomeDropdown
                biomes={biomes}
                value={sourceBiome}
                onChange={setSourceBiome}
                placeholder="Select start biome"
                allowEmpty={false}
              />
            </div>
          </div>

          {/* Second dropdown */}
          {mode === 'route' && (
            <div className="space-y-2">
              <p className="text-slate-600">to</p>
              <div className="relative">
                <BiomeDropdown
                  biomes={biomes}
                  value={destinationBiome}
                  onChange={setDestinationBiome}
                  placeholder="Select target biome"
                  allowEmpty={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* report a bug button */}
        <a
          href="https://github.com/kevinlinxc/pokerogue-biomes/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="text-sm">Report a Bug</span>
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <RouteList
          routes={routes}
          mode={mode}
          routeType={routeType}
          sourceBiome={sourceBiome || ''}
          destinationBiome={destinationBiome || undefined}
        />
      </div>
    </div>
  );
}

