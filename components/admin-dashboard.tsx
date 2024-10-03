"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Label as LChart } from 'recharts'
import { TrendingUp } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data (unchanged)
const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com" },
  { id: 4, name: "Bob Williams", email: "bob@example.com" },
]

const books = [
  { id: 1, title: "1984", author: "George Orwell", category: "Fiction", status: "Available" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", status: "On Loan" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", status: "Available" },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", category: "Romance", status: "Available" },
]

const categories = ["Fiction", "Non-Fiction", "Science Fiction", "Mystery", "Biography", "Romance"]

const genreData = [
  { name: "Fiction", count: 50, fill: "hsl(var(--chart-1))" },
  { name: "Non-Fiction", count: 30, fill: "hsl(var(--chart-2))" },
  { name: "Science Fiction", count: 20, fill: "hsl(var(--chart-3))" },
  { name: "Mystery", count: 15, fill: "hsl(var(--chart-4))" },
  { name: "Biography", count: 10, fill: "hsl(var(--chart-5))" },
  { name: "Romance", count: 25, fill: "hsl(var(--chart-6))" },
]

const chartConfig = {
  count: {
    label: "Books",
  },
  Fiction: {
    label: "Fiction",
    color: "hsl(var(--chart-1))",
  },
  "Non-Fiction": {
    label: "Non-Fiction",
    color: "hsl(var(--chart-2))",
  },
  "Science Fiction": {
    label: "Science Fiction",
    color: "hsl(var(--chart-3))",
  },
  Mystery: {
    label: "Mystery",
    color: "hsl(var(--chart-4))",
  },
  Biography: {
    label: "Biography",
    color: "hsl(var(--chart-5))",
  },
  Romance: {
    label: "Romance",
    color: "hsl(var(--chart-6))",
  },
}

export function AdminDashboardComponent() {
  const [selectedBook, setSelectedBook] = useState<undefined | null | typeof books[0]>(null)
  const [loanUser, setLoanUser] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")

  const handleLoanBook = () => {
    if (selectedBook && loanUser) {
      console.log(`Book "${selectedBook.title}" loaned to ${loanUser}`)
      setSelectedBook(null)
      setLoanUser("")
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.category.toLowerCase().includes(bookSearch.toLowerCase())
  )

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const totalBooks = useMemo(() => {
    return genreData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="loans">Book Loans</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>Add, edit, or remove users from the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="mb-4"
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button className="mt-4">Add New User</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Manage Books</CardTitle>
              <CardDescription>Add, edit, or remove books from the library.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search books..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="mb-4"
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{book.status}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button className="mt-4">Add New Book</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, or remove book categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="mb-4"
              />
              <ul className="space-y-2">
                {filteredCategories.map((category, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{category}</span>
                    <div>
                      <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button className="mt-4">Add New Category</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Book Loans</CardTitle>
              <CardDescription>Manage book loans to users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="book-select">Select Book</Label>
                    <Select onValueChange={(value) => setSelectedBook(books.find(b => b.id.toString() === value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>{book.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="user-input">User Name</Label>
                    <Input
                      id="user-input"
                      value={loanUser}
                      onChange={(e) => setLoanUser(e.target.value)}
                      placeholder="Enter user name"
                    />
                  </div>
                </div>
                <Button onClick={handleLoanBook} disabled={!selectedBook || !loanUser}>
                  Loan Book
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Books by Genre</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={genreData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <LChart
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalBooks.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Books
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 3.7% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total books by genre for the last 6 months
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}