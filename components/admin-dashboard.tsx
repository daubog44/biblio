"use client"

import { useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Pagination from "./Pagination"
import { Book, Category, Prisma, User } from "@prisma/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Label } from "./ui/label"
import { ComboboxBooks } from "./loans/ComboBoxLoans"
import { postLoan, restituito } from "@/app/actions/restDB"
import { useToast } from "@/hooks/use-toast"
import { DialogModifyUser } from "./user/EditUserDialog"
import { DeleteUser } from "./user/deleteUserBtn"
import { DialogAddUser } from "./user/AdduserBtn"
import { DialogModifyBook } from "./books/EditBookDialog"
import { DialogAddBook } from "./books/AddBook"
import { DeleteBook } from "./books/DeleteBtnBook"
import { DialogAddCategoria } from "./categories/AddCat"
import { DialogModifyCat } from "./categories/ModifyCat"
import { DeleteCat } from "./categories/DeleteCat"
import Loading from "./Loading"


type Books = Prisma.BookGetPayload<{ include: { category: true } }>[];
export function AdminDashboardComponent({ loans, books, users, categories, userCount, booksCount, start, end }: {
  categories: Category[] | undefined, users: User[] | undefined, userCount: number | undefined, booksCount: number | undefined, books: Books | undefined, start: number, end: number, loans: Book[] | undefined;
}) {
  const { toast } = useToast();
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = searchParams.get('page') ?? '1'
  const per_page = searchParams.get('limit') ?? '8'
  const section = searchParams.get('section') ?? "user";
  const query = searchParams.get('query');
  const [isPending, startTransition] = useTransition()
  const [userSearch, setUserSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")
  const [loanUser, setLoanUser] = useState("")
  const [loanBook, setLoanBook] = useState<number | undefined>()

  const [categorySearch, setCategorySearch] = useState("")

  const debounced = useDebouncedCallback(
    // function
    (val) => {
      startTransition(() => {
        router.push(`/admin?page=${1}&limit=${per_page}&section=${section || "users"}&query=${val || ""}`, { scroll: false })
      })
    },
    // delay in ms
    1000
  );


  const handlePrev = () => {
    startTransition(() => {
      router.push(`/admin?page=${Number(page) - 1}&limit=${per_page}&section=${section || "users"}&query=${query || ""}`, { scroll: false })
    });
  }

  const handleNext = () => {
    startTransition(() => {
      router.push(`/admin?page=${Number(page) + 1}&limit=${per_page}&section=${section || "users"}&query=${query || ""}`, { scroll: false })
    });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue={section}>
        <TabsList className="mb-4 flex flex-wrap h-fit">
          <TabsTrigger onClick={() => {
            router.push(`/admin?page=${1}&limit=${per_page}&section=user`, { scroll: false })
          }} value="user">Utenti</TabsTrigger>
          <TabsTrigger onClick={() => {
            router.push(`/admin?page=${1}&limit=${per_page}&section=book`, { scroll: false })
          }} value="book">Libri</TabsTrigger>
          <TabsTrigger onClick={() => {
            router.push(`/admin?page=${1}&limit=${per_page}&section=category`, { scroll: false })
          }} value="category">Categorie</TabsTrigger>
          <TabsTrigger onClick={() => {
            router.push(`/admin?page=${1}&limit=${per_page}&section=loan&query=`, { scroll: false })
          }} value="loan">In prestito</TabsTrigger>
        </TabsList>

        <TabsContent value="user" >
          <Card>
            <CardHeader>
              <CardTitle>Gestisci utenti</CardTitle>
              <CardDescription>Aggiungi, modifica o rimuovi utenti.</CardDescription>
              <DialogAddUser btnClasses="mt-4" />
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Cerca utente..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value)
                  debounced(e.target.value)
                }}
                className="mb-4"
              />
              {isPending ? <Loading hFit={true} /> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || "nessuno"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {/*<Button variant="outline" size="sm" className="mr-2">Modifica</Button>*/}
                          <DialogModifyUser btnClasses="mr-2" user={user} />
                          <DeleteUser user={user} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>}
              {userCount === 0 && (
                <p className="text-center text-muted-foreground mt-6">Nessun utente.</p>
              )}

              {userCount && userCount > 0 && (
                <Pagination isPending={isPending} page={Number(page)} totalPages={Math.ceil(userCount / Number(per_page))} hasPrevPage={start > 0} hasNextPage={end < userCount} handelPrev={handlePrev} handleNext={handleNext} />
              )}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="book">
          <Card>
            <CardHeader>
              <CardTitle>Gestisci libri</CardTitle>

              <CardDescription>Aggiungi, modifica o rimuovi un libro dalla libreria.</CardDescription>
              <DialogAddBook btnClasses="w-full mt-4" categories={categories as Category[]} />
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Cerca libri..."
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value)
                  debounced(e.target.value)
                }}
                className="mb-4"
              />
              {isPending ? <Loading hFit={true} /> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Autore</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Anno</TableHead>
                      <TableHead>azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books && books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.titolo}</TableCell>
                        <TableCell>{book.autore}</TableCell>
                        <TableCell>{book.category.name}</TableCell>
                        <TableCell>{book.annoPubblicazione}</TableCell>
                        <TableCell>
                          {/*<Button variant="outline" size="sm" className="mr-2">Modifica</Button>*/}
                          <DialogModifyBook btnClasses="mr-2" book={book} categories={categories as Category[]} />
                          <DeleteBook book={book} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>}
              {booksCount === 0 && (
                <p className="text-center text-muted-foreground mt-6">Nessun libro.</p>
              )}

              {booksCount && booksCount > 0 && (
                <Pagination isPending={isPending} page={Number(page)} totalPages={Math.ceil(booksCount / Number(per_page))} hasPrevPage={start > 0} hasNextPage={end < booksCount} handelPrev={handlePrev} handleNext={handleNext} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Gestisci categorie</CardTitle>
              <CardDescription>Aggiungi, modifica o elimina una categoria di libri.</CardDescription>
              <DialogAddCategoria btnClasses="mt-4" />
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Cerca categorie..."
                value={categorySearch}
                onChange={(e) => { setCategorySearch(e.target.value); }}
                className="mb-4"
              />

              {isPending ? <Loading hFit={true} /> : <ul className="space-y-2">
                {categories && categories.filter(cat => {
                  if (categorySearch) { return cat.name.toLowerCase().includes(categorySearch.toLowerCase()) }
                  return true;
                }).map((category, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <div>
                      <DialogModifyCat btnClasses="mr-2" category={category} />
                      <DeleteCat category={category} categories={categories} />
                    </div>
                  </li>))}
              </ul>}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="loan">
          <Card>
            <CardHeader>
              <CardTitle>Libri in prestito</CardTitle>
              <CardDescription>Gestisci i libri in prestito.</CardDescription>
              <Button onClick={async () => {
                const fn = postLoan.bind(null, { id: loanBook, details: loanUser });
                const res = await fn();
                if (res.error) {
                  toast({
                    variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                    description: res.error,
                  })
                } else if (res.msg) {
                  toast({ title: "Libro dato in prestito!" })
                }
              }} disabled={!loanBook || !loanUser}>
                Dai in prestito
              </Button>
            </CardHeader>
            <CardContent>
              {isPending ? <Loading hFit={false} /> : <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="book-select">Seleziona libro</Label>
                    {/*<SelectTrigger>
                        <SelectValue placeholder="Seleziona libro" />
                      </SelectTrigger>
                      <SelectContent>
                        {books && books.map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>{book.titolo}</SelectItem>
                        ))}
                      </SelectContent>*/}
                    <ComboboxBooks setLoanBook={setLoanBook as any} page={Number(page)} per_page={Number(per_page)} books={books} />
                  </div>
                  <div>
                    <Label htmlFor="user-input">Dettagli prestito</Label>
                    <Input
                      id="user-input"
                      value={loanUser}
                      onChange={(e) => setLoanUser(e.target.value)}
                      placeholder="inserisci nome"
                    />
                  </div>
                </div>


                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titolo</TableHead>
                        <TableHead>Autore</TableHead>
                        <TableHead>Dettagli prestito</TableHead>
                        <TableHead>azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans && loans.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>{book.titolo}</TableCell>
                          <TableCell>{book.autore}</TableCell>
                          <TableCell>{book.dettagliPrestito}</TableCell>
                          <TableCell>
                            <Button onClick={async () => {
                              const fn = restituito.bind(null, { id: book.id });
                              const res = await fn();
                              if (res.error) {
                                toast({
                                  variant: "destructive", title: "Uh oh! Qualcosa è andato storto.",
                                  description: res.error,
                                })
                              } else if (res.msg) {
                                toast({ title: "Libro restituito!" })
                              }
                            }} variant="outline" size="sm" className="mr-2">Restituito</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {loans && loans.length === 0 && (
                  <p className="text-center text-muted-foreground mt-6">Nessun libro in prestito.</p>
                )}
              </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 