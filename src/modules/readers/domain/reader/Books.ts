import { Book, BookDTO } from "../../../books/domain/book/Book";

export class Books {
  private books: Book[];

  static validate(books: BookDTO[]): boolean {
    if (books === undefined || books === null) return false
    return true
  }

  static create(booksDTO: BookDTO[]): Books {
    return new Books(booksDTO.map(bookDTO => Book.create(bookDTO)));
  }

  private constructor(books: Book[]) {
    this.books = books;
  }

  getAll(): Book[] {
    return this.books;
  }

  getAllToDTO(): BookDTO[] {
    return this.books.map(book => Book.toJSON(book));
  }

  get(id: string): Book | undefined {
    return this.books?.find(book => book.id === id);
  }

  getToDTO(id: string): BookDTO | undefined {
    const book =  this.books?.find(book => book.id === id);
    return !!book ? Book.toJSON(book) : undefined;
  }

  add(newBook: Book): void {
    const alreadyExist = this.books?.find(book => book.id === newBook.id);
    if (alreadyExist) throw new Error('this book already exist on this collection');
    this.books.push(newBook);
  }

  remove(id: string): void {
    const exist = this.books?.find(book => book.id === id);
    if (!exist) throw new Error('this book already removed on this collection');
    this.books = this.books.filter(book => book.id !== id);
  }
}