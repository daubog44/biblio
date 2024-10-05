"use client";
import { Prisma } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { BookCover } from 'book-cover-3d'
import { BookOpen, BookX } from "lucide-react";

export default function CardBook({ book }: { book: Prisma.BookGetPayload<{ include: { category: true } }> }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-grow">
                <div className="relative">
                    <BookCover>
                        <Image
                            src={book.image || "/bookD.jpg"}
                            alt={`Cover of ${book.titolo}`}
                            width={300}
                            height={450}
                            className="w-full object-cover rounded-md mb-0"
                        />
                    </BookCover>
                    <Badge
                        variant={book.inPrestito ? "destructive" : "secondary"}
                        className="absolute top-1 right-1"
                    >
                        {book.inPrestito ? (
                            <BookX className="h-4 w-4 mr-1" />
                        ) : (
                            <BookOpen className="h-4 w-4 mr-1" />
                        )}
                        {book.inPrestito ? "in prestito" : "disponibile"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <CardTitle className="text-wrap text-lg pr-4 w-fit truncate">{book.titolo && book.titolo?.length > 100 ? book.titolo?.slice(0, 100) + "..." : book.titolo}</CardTitle>
                <p className="mt-4 text-sm font-semibold mb-1 w-fit">Di {book.autore}</p>
                <p className="text-sm text-muted-foreground mb-2 w-fit">
                    pubblicato il: {book.annoPubblicazione}, dalla casa: {book.casaEditrice}
                </p>
                <p className="text-sm">{book.note}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <span className="text-sm text-muted-foreground">{book.category.name}</span>
            </CardFooter>
        </Card>
    )
}