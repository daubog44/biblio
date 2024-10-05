import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

export default function Pagination({ hasNextPage, page, handleNext, handelPrev, hasPrevPage, totalPages }: { hasNextPage: boolean, page: number, totalPages: number, hasPrevPage: boolean, handelPrev: () => void, handleNext: () => void }) {

    return <div className="flex justify-center items-center space-x-2 mt-6">
        <Button
            variant="outline"
            disabled={!hasPrevPage}
            onClick={handelPrev}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
            Page {Number(page)} of {totalPages}
        </span>
        <Button
            variant="outline"
            onClick={handleNext}
            disabled={!hasNextPage}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
}
