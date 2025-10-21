import { pokemonPerBiome } from "./biome-data";
import SpriteImage from "./components/sprite-image";
import { formatPokemonNameForSprite } from "./lib/pokemon-names";


export function BiomePokemonPopover({ biomeName }: { biomeName: string }) {
    const biomePokemon = pokemonPerBiome[biomeName];

    if (!biomePokemon) {
        return <div>No data available for this biome.</div>;
    }

    const rarityOrder = ["Common", "Uncommon", "Rare", "Super Rare", "Ultra Rare", "Boss", "Boss Rare", "Boss Super Rare", "Boss Ultra Rare"];

    return (
        <div
            style={{
                padding: '4px',
            }}
        >
            <h3
                style={{
                    fontSize: '1.525rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                    textAlign: 'center',
                }}
            >
                {biomeName}
            </h3>
            {rarityOrder.map((rarity) => {
                const pokemons = biomePokemon[rarity];
                if (!pokemons || pokemons.length === 0) {
                    return null;
                }
                return (
                    <div key={rarity} style={{ marginBottom: '10px' }}>
                        <h4
                            style={{
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                marginBottom: '6px',
                                borderBottom: '1px solid rgb(226 232 240)',
                                paddingBottom: '2px',
                            }}
                        >
                            {rarity}
                        </h4>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(8, minmax(20px, 1fr))',
                                gap: '8px 8px',
                                alignItems: 'center',
                                justifyItems: 'center',
                            }}
                        >
                            {pokemons.map((pokemon) => {
                                const slug = formatPokemonNameForSprite(pokemon);
                                return (
                                    <div
                                        key={pokemon}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            gap: '2px',
                                            width: '100%',
                                        }}
                                        title={pokemon}
                                    >
                                        <SpriteImage
                                            name={pokemon}
                                            slug={slug}
                                            width={80}
                                            height={80}
                                            style={{ width: '5rem', height: '5rem' }}
                                        />
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                lineHeight: 1.1,
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {pokemon}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
