"use client"
import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Category, Prisma } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from 'use-debounce';
import CardBook from "./books/CardBook"
import Pagination from "./Pagination"
import Loading from "@/components/Loading";
import React from "react"
import { per_page_def } from "@/app/lib/utils"

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

  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const page = searchParams.get('page') ?? '1'
  const per_page = searchParams.get('limit') ?? per_page_def;
  const prev_page = searchParams.get('prev_page');
  const category = searchParams.get('category');
  const query = searchParams.get('query');
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedCategory, setSelectedCategory] = useState(categories[0].name)
  useEffect(() => {
    router.prefetch(`/?page=${Number(page) - 1}&limit=${per_page}&category=${category || ""}&query=${query || ""}&prev_page=${prev_page || ""
      }`);
    router.prefetch(`/?page=${Number(page) + 1}&limit=${per_page}&category=${category || ""}&query=${query || ""}&prev_page=${prev_page || ""
      }`);
  }, [category, page])

  const debounced = useDebouncedCallback(
    // function
    (_val) => {
      startTransition(() => {
        router.push(`/?page=${1}&limit=${per_page}&query=${searchTerm.trim() || ""}`, { scroll: false })
      })
    },
    // delay in ms
    1000
  );

  const handlePage = (newpage: number) => {
    startTransition(() => {
      router.push(`/?page=${newpage}&limit=${per_page}&category=${category || ""}&query=${query || ""}&prev_page=${prev_page || ""
        }`, { scroll: false })
    })

  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Biblioteca</h1>

      <Tabs defaultValue="search" className="mb-6">
        <TabsList>
          <TabsTrigger onClick={() => {
            startTransition(() => {
              router.push(`/?page=${prev_page || 1}&limit=${per_page}`, { scroll: false })
            })
          }} value="search">Carca libro</TabsTrigger>
          <TabsTrigger onClick={() => {
            startTransition(() => {
              router.push(`/?page=${1}&limit=${per_page}&prev_page=${page}&category=${categories[0].name}`, { scroll: false })
            })
          }} value="categories">categorie</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search by title or author"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                debounced(e.target.value);
              }}
              className="flex-grow"
            />
            <Button onClick={() => {
              startTransition(() => {
                router.push(`/?page=${1}&limit=${per_page}&query=${searchTerm.trim() || ""}`, { scroll: false })
              })
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
                  setSelectedCategory(category.name);
                  startTransition(() => {
                    router.push(`/?page=${1}&limit=${per_page}&category=${category.name || ""}&prev_page=${prev_page || ""}`, { scroll: false })
                  })
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isPending ? <Loading hFit={true} /> :
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <CardBook book={book} key={book.id} />
          ))}
        </div>
      }
      {count === 0 && (
        <p className="text-center text-muted-foreground mt-6">No books found. Try a different search term or category.</p>
      )}

      {count > 0 && (
        <Pagination isPending={isPending} hasNextPage={hasNextPage} page={Number(page)} totalPages={totalPages} hasPrevPage={hasPrevPage} handelPage={handlePage} />
      )}
    </div>
  )
}