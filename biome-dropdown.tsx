import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

interface BiomeDropdownProps {
  biomes: string[]
  value: string | null
  onChange: (value: string | null) => void 
  placeholder: string
  allowEmpty?: boolean
}

export function BiomeDropdown({ biomes, value, onChange, placeholder, allowEmpty }: BiomeDropdownProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 
                                 text-left border border-slate-200 hover:border-slate-300
                                 focus:outline-none focus-visible:ring-2 
                                 focus-visible:ring-slate-500 focus-visible:ring-opacity-75">
          <span className="block truncate text-slate-700">
            {value || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto 
                                    rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 
                                    focus:outline-none">
            {allowEmpty && (
              <Listbox.Option
                value={null}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`
                }
              >
                <span className="block truncate font-normal">{placeholder}</span>
              </Listbox.Option>
            )}
            {biomes.map((biome) => (
              <Listbox.Option
                key={biome}
                value={biome}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {biome}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

