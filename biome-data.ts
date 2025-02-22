// also see manual data entered for node placement and handle placemenet in biome-graph.tsx
export const biomes = [
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

export const adjacencyList: { [key: string]: [string, number][] } = {
  "Abyss": [["Space", 0.5], ["Cave", 1.0], ["Wasteland", 0.5]],
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
  "Wasteland": [["Badlands", 1.0]]
};
