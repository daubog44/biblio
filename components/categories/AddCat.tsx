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
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { addCategory } from "@/app/actions/restDB"
import { useToast } from "@/hooks/use-toast"

export function DialogAddCategoria({ btnClasses }: { btnClasses?: string }) {
    const { toast } = useToast();
    const [state, setState] = useState("");
    const { pending } = useFormStatus()
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={btnClasses}>Aggiungi categoria</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Aggiungi</DialogTitle>
                </DialogHeader>
                <form>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">
                                Nome
                            </Label>
                            <Input onChange={(e) => { setState(e.target.value) }} id="numero" name="number" className="col-span-3" placeholder="inserisci il nome della categoria" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={pending} onClick={async (e) => {
                            e.preventDefault();
                            if (!state) {
                                toast({
                                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                    description: "aggiungi il nome per creare la categoria.",
                                })
                            }
                            const call = addCategory.bind(null, state)
                            const data = await call();
                            if (data.error) {
                                toast({
                                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                    description: data.error,
                                })
                            } else if (data.msg === "success") {
                                toast({ title: "Categoria aggiunta!" })
                            }
                        }} type="submit">Salva modifiche</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}