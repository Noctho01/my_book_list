import { Book, BookDTO } from "../../domain/book/Book";
import { PhoneNumber } from "../../domain/book/PhoneNumber";
import { IReaderRepository } from "../../repositories/IReaderRepository";

type CreateBookRequest = {
  phoneNumber: string;
  book: BookDTO;
}

export class CreateBook {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ phoneNumber, book }:CreateBookRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);

    const newBook = Book.create(book);

    reader.books.add(newBook);

    await this.readerRepository.save(reader);
  }
}