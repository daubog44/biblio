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
import { Category } from "@prisma/client"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import { modifyCat } from "@/app/actions/restDB"
import { useToast } from "@/hooks/use-toast"

export function DialogModifyCat({ category, btnClasses }: { btnClasses?: string, category: Category }) {
    const { toast } = useToast();
    const [state, setState] = useState("");
    const { pending } = useFormStatus();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={`${btnClasses}`}>Modifica</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-[999]">
                <DialogHeader>
                    <DialogTitle>Modifica</DialogTitle>
                </DialogHeader>
                <form>
                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nomeCat" className="text-right">
                                Nome
                            </Label>
                            <Input onChange={(e) => { setState(e.target.value) }} id="nomeCat" name="nomeCat" defaultValue={category.name} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={pending} onClick={async (e) => {
                            e.preventDefault();
                            const call = modifyCat.bind(null, category.id, state)
                            const data = await call();
                            if (data.error) {
                                toast({
                                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                    description: data.error,
                                })
                            } else if (data.msg === "success") {
                                toast({ title: "Categoria aggiornata!" })
                            }
                        }} type="submit">Salva modifiche</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}