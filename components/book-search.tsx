"use client"
import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Category, Prisma } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from 'use-debounce';
import CardBook from "./CardBook"

// Mock data for books and categories
/*
const allBooks = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Book ${i + 1}`,
  author: `Author ${i + 1}`,
  image: `/placeholder.svg?height=200&width=150`,
  category: ["Fiction", "Science Fiction", "Romance", "Adventure"][Math.floor(Math.random() * 4)],
  publishedYear: 2000 + Math.floor(Math.random() * 23),
  description: `This is a short description for Book ${i + 1}. It provides a brief overview of the book's content.`
}))
const categories = ["All", "Fiction", "Science Fiction", "Romance", "Adventure"]*/

export function BookSearchComponent({ books, count, totalPages, hasNextPage, hasPrevPage, categories }: { count: number, categories: Category[], books: Prisma.BookGetPayload<{ include: { category: true } }>[], totalPages: number, hasPrevPage: boolean, hasNextPage: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = searchParams.get('page') ?? '1'
  const per_page = searchParams.get('limit') ?? '8'
  const prev_page = searchParams.get('prev_page');
  const category = searchParams.get('category');
  const query = searchParams.get('query');
  const [_, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("")
  const value = useDebounce(searchTerm, 1000);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name)

  useEffect(
    () => {
      if (value[1].isPending())
        router.push(`/?page=${1}&limit=${per_page}&query=${value[0].trim() || ""}`, { scroll: false })
    },
    [per_page, router, value]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Biblioteca</h1>

      <Tabs defaultValue="search" className="mb-6">
        <TabsList>
          <TabsTrigger onClick={() => {
            router.push(`/?page=${prev_page}&limit=${per_page}`, { scroll: false })
          }} value="search">Carca libro</TabsTrigger>
          <TabsTrigger onClick={() => {
            router.push(`/?page=${1}&limit=${per_page}&prev_page=${page}&category=${categories[0].name}`, { scroll: false })
          }} value="categories">categorie</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
              className="flex-grow"
            />
            <Button onClick={() => {
              router.push(`/?page=${1}&limit=${per_page}&query=${searchTerm.trim() || ""}`, { scroll: false })
            }}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => {
                  router.push(`/?page=${1}&limit=${per_page}&category=${category.name || ""}&prev_page=${prev_page || ""}`, { scroll: false })
                  startTransition(() => {
                    setSelectedCategory(category.name);
                  })
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <CardBook book={book} key={book.id} />
        ))}
      </div>

      {count === 0 && (
        <p className="text-center text-muted-foreground mt-6">No books found. Try a different search term or category.</p>
      )}

      {count > 0 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            disabled={!hasPrevPage}
            onClick={() => {
              router.push(`/?page=${Number(page) - 1}&limit=${per_page}&category=${category || ""}&query=${query || ""}&prev_page=${prev_page || ""
                }`, { scroll: false })
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {Number(page)} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/?page=${Number(page) + 1}&limit=${per_page}&category=${category || ""}&query=${query || ""}&prev_page=${prev_page || ""
                }`, { scroll: false })
            }}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}