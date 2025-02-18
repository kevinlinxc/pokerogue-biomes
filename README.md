# Pokerogue Biomes

This is a simple web-app for figuring out the optimal routing for the online game [https://pokerogue.net/](https://pokerogue.net/)

Made with [Next.js](https://nextjs.org) 

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
