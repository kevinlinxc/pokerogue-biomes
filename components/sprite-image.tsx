"use client";

import Image from "next/image";
import { CSSProperties, useState } from "react";

type SpriteImageProps = {
    name: string; // display name for alt
    slug: string; // formatted name for file/url
    width?: number; // intrinsic width for Next/Image (px)
    height?: number; // intrinsic height for Next/Image (px)
    className?: string;
    style?: CSSProperties;
};

// Tries to load local sprite from /public/sprites/[slug].png first, fallback to PokemonDB.
export function SpriteImage({ name, slug, width = 80, height = 80, className, style }: SpriteImageProps) {
    const [useRemote, setUseRemote] = useState(false);

    // these two don't have sprites in the normal place
    const remoteUrl =
        slug === "ursaluna-bloodmoon"
            ? "https://img.pokemondb.net/sprites/scarlet-violet/normal/ursaluna-bloodmoon.png"
            : slug === "darmanitan-galarian"
                ? "https://img.pokemondb.net/sprites/sword-shield/normal/darmanitan-galarian-standard.png"
                : `https://img.pokemondb.net/sprites/scarlet-violet/icon/${slug}.png`;

    // Try webp first (smaller), then png, else remote
    const src = useRemote ? remoteUrl : `/sprites/${slug}.webp`;

    return (
        <Image
            src={src}
            alt={name}
            width={width}
            height={height}
            sizes="80px"
            className={className}
            style={{ imageRendering: "auto", ...style }}
            onError={() => {
                // If not using remote and failed to load webp, switch to remote
                if (!useRemote) {
                    setUseRemote(true);
                }
            }}
            loading="lazy"
            unoptimized
        />
    );
}

export default SpriteImage;
