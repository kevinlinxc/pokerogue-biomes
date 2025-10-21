// Utilities for working with Pokemon names and sprites

// Format display name to sprite slug used by local/remote images
export function formatPokemonNameForSprite(name: string): string {
  let formattedName = name.toLowerCase();

  const regionalForms = ["alolan", "galarian", "hisuian", "paldean"];
  for (const form of regionalForms) {
    if (formattedName.startsWith(form + " ")) {
      const parts = formattedName.split(" ");
      formattedName = parts.slice(1).join("-") + `-${form}`;
    }
  }

  // Handle special characters and forms
  formattedName = formattedName
    .replace(/ /g, "-")
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/:/g, "")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m");

  // Specific manual overrides for edge cases
  const nameOverrides: { [key: string]: string } = {
    "bloodmoon-ursaluna": "ursaluna-bloodmoon",
    "flabébé": "flabebe",
    "eternal-floette": "floette-eternal",
  };

  if (nameOverrides[formattedName]) {
    return nameOverrides[formattedName];
  }

  return formattedName;
}

// Simple case-insensitive normalization for search comparison
export function normalizePokemonName(name: string): string {
  return name
    .toLowerCase()
    // strip basic accents commonly encountered
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, ' ') // collapse non-alphanumerics
    .trim();
}
