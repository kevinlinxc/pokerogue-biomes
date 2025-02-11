"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BiomeDropdownProps {
  biomes: string[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder: string
}

export function BiomeDropdown({ biomes, value, onChange, placeholder }: BiomeDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[200px] justify-between bg-emerald-600 hover:bg-emerald-700 text-white border-none pr-3"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search biome..." className="h-9" />
          <CommandList>
            <CommandEmpty>No biome found.</CommandEmpty>
            <CommandGroup>
              {biomes.map((biome) => (
                <CommandItem
                  key={biome}
                  onSelect={() => {
                    onChange(biome === value ? null : biome)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === biome ? "opacity-100" : "opacity-0")} />
                  {biome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

