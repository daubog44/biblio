"use client";
import { deleteUser } from "@/app/actions/restDB";
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
import { User } from "@prisma/client"

export function DeleteUser({ user }: { user: User }) {
    const { toast } = useToast();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Elimina</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro di voler eliminare l&apos;utente?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancella</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        const fn = deleteUser.bind(null, user.id)
                        const res = await fn();

                        if (res.error) {
                            toast({
                                variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                description: res.error,
                            })
                        } else if (res.msg === "success") {
                            toast({ title: "Utente eliminato!" })
                        }
                    }}>Continua</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
