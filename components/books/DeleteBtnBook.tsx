"use client";
import { deleteBook } from "@/app/actions/restDB";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";
import { Book } from "@prisma/client"

export function DeleteBook({ book }: { book: Book }) {
    const { toast } = useToast();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">Elimina</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro di voler eliminare il libro?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancella</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        const fn = deleteBook.bind(null, book.id)
                        const res = await fn();

                        if (res.error) {
                            toast({
                                variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                description: res.error,
                            })
                        } else if (res.msg === "success") {
                            toast({ title: "Libro eliminato!" })
                        }
                    }}>Continua</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
