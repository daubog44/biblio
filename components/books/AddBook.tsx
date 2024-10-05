"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Book, Category, Prisma } from "@prisma/client"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { addBook } from "@/app/actions/restDB"
import { useToast } from "@/hooks/use-toast"
import { ComboboxCat } from "./ComboBoxCat";

export function DialogAddBook({ categories, btnClasses }: { btnClasses?: string, categories: Category[] }) {
    const { toast } = useToast();
    const [state, setState] = useState({} as Book);
    const { pending } = useFormStatus()
    const [catSelected, setCat] = useState<null | number>(null);
    const [file, setFile] = useState<File | null>(null)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={btnClasses}>Aggiungi libro</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-[999]">
                <DialogHeader>
                    <DialogTitle>Modifica</DialogTitle>
                </DialogHeader>
                <form>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right" htmlFor="picture">Immagine</Label>
                            <Input onChange={(event) => { if (event.target.files && event.target.files[0]) setFile(event.target.files[0]) }} id="picture" className="col-span-3" placeholder="Seleziona un immagine" type="file" accept="image/*" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="titolo" className="text-right">
                                Titolo
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, titolo: e.target.value.toLowerCase() })) }} id="titolo" name="titolo" placeholder="titolo necessario" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="anno" className="text-right">
                                anno
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, annoPubblicazione: e.target.value.toLowerCase() })) }} id="anno" name="anno" placeholder="inserisci anno" className="col-span-3" />
                        </div>
                        <div className="relative grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="casaEditrice" className="text-right">
                                casa editrice
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, casaEditrice: e.target.value.toLowerCase() })) }} id="casaEditrice" name="casaEditrice" placeholder="titolo la casa editrice" className="col-span-3" />
                        </div>
                        <div className="relative grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="note" className="text-right">
                                note
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, note: e.target.value.toLowerCase() })) }} id="note" name="note" placeholder="inserisci note" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="scompartoCase" className="text-right">
                                scomparto
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, scompartoCase: e.target.value.toLowerCase() })) }} id="scompartoCase" name="scompartoCase" placeholder="inserisci scomparto" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryId" className="text-right">
                                categoria
                            </Label>
                            <ComboboxCat setCat={setCat} categories={categories} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={pending} onClick={async (e) => {
                            e.preventDefault();
                            const bytes = await file?.arrayBuffer();
                            const formData = new FormData();
                            if (bytes) {
                                const blob = new Blob([bytes]);
                                formData.append('file', blob, file?.name);
                                formData.set("fileType", file!.type);
                            }
                            const call = addBook.bind(null, { ...state, ...(catSelected && { categoryId: catSelected }) }, formData)
                            const data = await call();
                            if (data.error) {
                                toast({
                                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                    description: data.error,
                                })
                            } else if (data.msg === "success") {
                                toast({ title: "Libro aggiunto!" })
                            }
                        }} type="submit">Salva modifiche</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}