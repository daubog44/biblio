"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Book } from "@prisma/client";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input"
import { SetStateAction } from "react"

type d = React.Dispatch<SetStateAction<{} | undefined>>
export function ComboboxDemo({ books, per_page, page, setLoanBook }: { setLoanBook: d, page: number, per_page: number, books: Book[] | undefined }) {
    const router = useRouter()

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [searchValue, setSearchValue] = React.useState("")
    const [values, setValuea] = React.useState<{ value: string, label: string }[] | []>([])
    const debounced = useDebouncedCallback(
        // function
        (val) => {
            router.push(`/admin?page=${page}&limit=${per_page}&section=loan&query=${val.trim() || ""}`, { scroll: false })
        },
        // delay in ms
        1000
    );
    React.useEffect(() => {
        if (books)
            setValuea(books.map(b => ({ value: String(b.id), label: b.titolo as string })))
    }, [books])


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full ustify-between"
                >
                    {value !== ""
                        ? values.find((framework) => framework.value === value)?.label
                        : "Seleziona libro"}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <Input value={searchValue} onChange={(e) => {
                        setSearchValue(e.target.value);
                        debounced(e.target.value)
                    }} placeholder="Cerca libro..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>Nessun libro trovato.</CommandEmpty>
                        <CommandGroup>
                            {values.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        console.log("currentValue", currentValue);
                                        setValue(currentValue)
                                        setLoanBook(currentValue);
                                        setOpen(false)
                                    }}
                                >
                                    {framework.label}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
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
