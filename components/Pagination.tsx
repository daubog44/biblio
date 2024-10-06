"use client";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react";

export default function Pagination({ isPending, hasNextPage, page, handelPage, hasPrevPage, totalPages }: { isPending?: boolean, hasNextPage: boolean, page: number, totalPages: number, hasPrevPage: boolean, handelPage: (page: number) => void }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fn = (event: WheelEvent) => {
            event.preventDefault();
            scrollRef.current?.scrollBy({
                left: event.deltaY < 0 ? -250 : 250, // Adjust the scroll amount as needed
                behavior: 'smooth'
            });
        }
        if (scrollRef.current) {
            const el = document.getElementById(page + "btn");
            if (!el) return;
            const targetPosition = el.offsetLeft - scrollRef.current.offsetLeft;
            scrollRef.current.scroll({
                left: targetPosition,
                behavior: 'instant' // Optional: for smooth scrolling
            });
            scrollRef.current.addEventListener('wheel', fn);
        }

        return () => {
            scrollRef.current?.removeEventListener("wheel", fn);
        }
    }, [page, scrollRef])


    return <div className="flex justify-center items-center space-x-2 mt-6">
        <Button
            variant="outline"
            disabled={!hasPrevPage || isPending}
            onClick={() => { handelPage(page - 1) }}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <ScrollArea className="max-w-96 whitespace-nowrap rounded-md" ref={scrollRef} >
            <div className="flex w-max space-x-4 p-4">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageL =>
                    <Button key={pageL + "11"}
                        id={pageL + "btn"}
                        variant={page === pageL ? "default" : "outline"}
                        onClick={() => { if (page !== pageL) handelPage(pageL) }}
                    >
                        {pageL}
                    </Button>
                )}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea >
        <Button
            variant="outline"
            onClick={() => { handelPage(page + 1) }}
            disabled={!hasNextPage || isPending}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div >
}
