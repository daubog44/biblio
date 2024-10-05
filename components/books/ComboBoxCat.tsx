"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Category, Prisma } from "@prisma/client"

type d = React.Dispatch<React.SetStateAction<number | null>>

export function ComboboxCat({ categories, setCat, book }: { book?: Prisma.BookGetPayload<{ include: { category: true } }> | undefined, setCat: d, categories: Category[] }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(book?.category.name || "")
    const [cats, _] = React.useState(categories);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-52 md:w-60 justify-between"
                >
                    {value
                        ? categories.find((cat) => String(cat.name) === value)?.name
                        : "Seleziona categoria..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full z-[9999]">
                <Command>
                    <CommandInput
                        id="categoryId"
                        defaultValue={book?.category.name} placeholder="Cerca categoria..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>Nessuna categoria trovata.</CommandEmpty>
                        <CommandGroup>
                            {cats.map((cat) => (
                                <CommandItem
                                    key={cat.id + "00"}
                                    value={String(cat.name)}
                                    onSelect={(currentValue: string) => {
                                        setValue(currentValue)
                                        setCat(cats.find((cat) => String(cat.name) === currentValue)?.id as number)
                                        setOpen(false)
                                    }}
                                >
                                    {cat.name}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === String(cat.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
