"use client";
import { deleteCat } from "@/app/actions/restDB";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";
import { Category } from "@prisma/client"
import { Label } from "../ui/label";
import { useState } from "react";
import { ComboboxCat } from "../books/ComboBoxCat";

export function DeleteCat({ category, categories }: { category: Category, categories: Category[] }) {
    const { toast } = useToast();
    const [catSelected, setCat] = useState<null | number>(null);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">Elimina</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro di voler eliminare la categoria?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Se elimini la categoria senza selezionarne un&apos;altra con cui sostituire i libri, i libri di questa categoria saranno tutti eliminati.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoryId" className="text-right">
                            Cambia
                        </Label>
                        <ComboboxCat setCat={setCat} categories={categories} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancella</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        const fn = deleteCat.bind(null, category.id, catSelected || undefined);
                        const res = await fn();

                        if (res.error) {
                            toast({
                                variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                description: res.error,
                            })
                        } else if (res.msg === "success") {
                            toast({ title: "Categoria eliminata!" })
                        }
                    }}>Continua</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
