"use client";

import { useMemo, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import SpriteImage from "./sprite-image";
import { formatPokemonNameForSprite, normalizePokemonName } from "@/lib/pokemon-names";
import { pokemonPerBiome } from "@/biome-data";

type PokemonSearchProps = {
    value?: string | null;
    onSelect: (pokemon: string | null) => void;
};

export default function PokemonSearch({ value, onSelect }: PokemonSearchProps) {
    const [query, setQuery] = useState("");

    // Build unique pokemon list once from pokemonPerBiome
    const allPokemon = useMemo(() => {
        const set = new Set<string>();
        const biomeEntries = pokemonPerBiome ? Object.values(pokemonPerBiome) : [];
        biomeEntries.forEach((rarityMap) => {
            const lists = rarityMap ? Object.values(rarityMap) : [];
            lists.forEach((list) => {
                if (Array.isArray(list)) {
                    list.forEach((name) => set.add(name));
                }
            });
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, []);

    const filtered = useMemo(() => {
        if (value) return [];
        if (!query.trim()) return [];
        const q = normalizePokemonName(query);
        return allPokemon
            .filter(name => normalizePokemonName(name).includes(q))
            .slice(0, 25);
    }, [allPokemon, query, value]);

    const handleSelect = (name: string) => {
        onSelect(name);
        setQuery(name);
    };

    const handleClear = () => {
        setQuery("");
        onSelect(null);
    };

    return (
        <div className="relative w-full max-w-xs">
            {/* Visible suggestions above input (outside Command to avoid overflow clipping) */}
            {filtered.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 z-20 rounded-lg shadow-md border border-slate-200 bg-white overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                        {filtered.map((name) => {
                            const slug = formatPokemonNameForSprite(name);
                            return (
                                <button
                                    key={name}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-100"
                                    onClick={() => handleSelect(name)}
                                >
                                    <SpriteImage name={name} slug={slug} width={24} height={24} style={{ width: 24, height: 24 }} />
                                    <span className="ml-1 text-sm">{name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input bar anchored */}
            <Command className="relative">
                <div className="rounded-md shadow-md border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center">
                        <CommandInput
                            placeholder="Search for a pokemon..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        {(query || value) && (
                            <button
                                aria-label="Clear search"
                                className="px-2 py-1 text-slate-500 hover:text-slate-700"
                                onClick={handleClear}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                {/* Hidden list to satisfy cmdk internal expectations */}
                <CommandList className="hidden">
                    <CommandGroup />
                </CommandList>
            </Command>
        </div>
    );
}
