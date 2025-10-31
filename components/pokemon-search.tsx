"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Command, CommandGroup, CommandInput, CommandList } from "./ui/command";
import SpriteImage from "./sprite-image";
import { formatPokemonNameForSprite, normalizePokemonName } from "@/lib/pokemon-names";
import { pokemonPerBiome } from "@/biome-data";

type PokemonSearchProps = {
    value?: string | null;
    onSelect: (pokemon: string | null) => void;
};

export default function PokemonSearch({ value, onSelect }: PokemonSearchProps) {
    const [query, setQuery] = useState("");
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const listRef = useRef<HTMLDivElement | null>(null);

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
        if (!query.trim()) return [];
        // If a selection exists, hide suggestions only when query matches selection.
        if (value && normalizePokemonName(query) === normalizePokemonName(value)) return [];
        const q = normalizePokemonName(query);
        return allPokemon
            .filter(name => normalizePokemonName(name).includes(q))
            .slice(0, 25);
    }, [allPokemon, query, value]);

    const handleSelect = (name: string) => {
        onSelect(name);
        setQuery(name);
        setHighlightIndex(-1);
    };

    const handleClear = () => {
        setQuery("");
        onSelect(null);
        setHighlightIndex(-1);
    };

    // Reset highlight when the filtered list changes
    useEffect(() => {
        if (filtered.length > 0) {
            setHighlightIndex(0);
        } else {
            setHighlightIndex(-1);
        }
    }, [filtered]);

    // Ensure highlighted item stays visible
    useEffect(() => {
        if (!listRef.current) return;
        if (highlightIndex < 0) return;
        const el = listRef.current.querySelector<HTMLButtonElement>(`[data-idx="${highlightIndex}"]`);
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIndex]);

    return (
        <div className="relative w-full max-w-xs">
            {/* Visible suggestions above input (outside Command to avoid overflow clipping) */}
            {filtered.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 right-0 z-20 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto" ref={listRef}>
                        {filtered.map((name, idx) => {
                            const slug = formatPokemonNameForSprite(name);
                            return (
                                <button
                                    key={name}
                                    data-idx={idx}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 ${highlightIndex === idx ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
                                    onClick={() => handleSelect(name)}
                                    onMouseEnter={() => setHighlightIndex(idx)}
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
                <div className="rounded-md shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="flex items-center">
                        <CommandInput
                            placeholder="Search for a pokemon..."
                            value={query}
                            onValueChange={(val) => {
                                setQuery(val);
                                if (value) {
                                    // User edited the search; clear current selection
                                    onSelect(null);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (filtered.length === 0) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setHighlightIndex((prev) => (prev + 1) % filtered.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setHighlightIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                                } else if (e.key === 'Enter') {
                                    if (highlightIndex >= 0 && highlightIndex < filtered.length) {
                                        e.preventDefault();
                                        handleSelect(filtered[highlightIndex]);
                                    }
                                } else if (e.key === 'Escape') {
                                    setHighlightIndex(-1);
                                }
                            }}
                        />
                        {(query || value) && (
                            <button
                                aria-label="Clear search"
                                className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
