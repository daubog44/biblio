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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { User } from "@prisma/client"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { modifyUser } from "@/app/actions/restDB"
import { Alert, AlertDescription } from "../ui/alert"
import { useToast } from "@/hooks/use-toast"
import { EyeOff, Eye } from "lucide-react";

export function DialogModifyUser({ user, btnClasses }: { btnClasses?: string, user: User }) {
    const { toast } = useToast();
    const [state, setState] = useState({ id: user.id } as { [key: string]: string | number });
    const [showPassword, setShowPassword] = useState(false);
    const { pending } = useFormStatus()
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={btnClasses}>Modifica</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifica</DialogTitle>
                </DialogHeader>
                <form>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="numero" className="text-right">
                                Numero
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, number: e.target.value })) }} id="numero" name="number" defaultValue={user.number || ""} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, name: e.target.value })) }} id="name" name="name" defaultValue={user.name || ""} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input onChange={(e) => { setState((prev) => ({ ...prev, email: e.target.value })) }} id="email" name="email" defaultValue={user.email} className="col-span-3" />
                        </div>
                        <div className="relative grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input type={showPassword ? "text" : "password"} onChange={(e) => { setState((prev) => ({ ...prev, password: e.target.value })) }} id="password" name="password" placeholder="inserisci per modificare" className="col-span-3" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                </span>
                            </Button>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Ruolo
                            </Label>
                            <Select onValueChange={(e) => { setState((prev) => ({ ...prev, role: e })) }} name="role" defaultValue={user.role}>
                                <SelectTrigger className="w-[180px] md:w-[277px]">
                                    <SelectValue id="role" placeholder={user.role} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="VIEWER">VIEWER</SelectItem>
                                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={pending} onClick={async (e) => {
                            e.preventDefault();
                            const call = modifyUser.bind(null, { ...state })
                            const data = await call();
                            if (data.error) {
                                toast({
                                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                    description: data.error,
                                })
                            } else if (data.msg === "success") {
                                toast({ title: "Utente aggiornato!" })
                            }
                        }} type="submit">Salva modifiche</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}