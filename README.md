# Pokérogue Biomes

Hosted at [https://pokerogue-biomes.vercel.app/](https://pokerogue-biomes.vercel.app/)

![demo-gif](pokerogue-biomes.gif)

A simple map/pathfinder web-app for [https://pokerogue.net/](https://pokerogue.net/) biomes

Features:
- Click on biomes to see what pokemon inhabit it
- Find shortest route from one biome to another
- Find highest probability route from one biome to another
- Find shortest cycle(s) that visit the same biome repeatedly


## To run locally

Install npm, then:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000)


## File layout

[`biome-route-finder.tsx`](/biome-route-finder.tsx) is the main component, used in [`/app/page.tsx`](/app/page.tsx)

The list of biomes and the adjacency list that stores info about edges/probabilties is in [`biome-data.ts`](/biome-data.ts),
although the information about the actual ReactFlow graph, such as node placement, edge endpoint placement, and edge type is in [`biome-graph.tsx`](/biome-graph.tsx).

Some other supporting files:
- [`route-list.tsx`](/route-list.tsx)
- ['biome-dropdown.tsx`](/biome-dropdown.tsx) 

## Testing
No unit tests =D

- Temple has two shortest cycles, useful for testing that
- Space to Abyss has vastly different shortest and highest probability path