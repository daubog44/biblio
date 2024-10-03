"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { LogOutIcon } from "lucide-react"
import { logout } from "@/app/actions/auth"

export function Logout() {

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
        >
            <LogOutIcon className="h-5 w-5" />
            <span className="sr-only">Logout</span>
        </Button>
    )
}
