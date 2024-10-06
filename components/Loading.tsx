import { Loader2 } from "lucide-react"

export default function Loading({ hFit }: { hFit?: boolean }) {
    return (
        <div className={`flex flex-col items-center justify-center ${hFit ? "h-full" : "min-h-screen"} bg-background`}>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold mt-4 text-foreground">Caricamento...</h2>
        </div>
    )
}