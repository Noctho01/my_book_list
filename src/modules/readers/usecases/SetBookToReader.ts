import { Book } from "../domain/book/Book";
import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { IReaderRepository } from "../repositories/IReaderRepository";

type SetBookToReaderRequest = {
  phoneNumber: string;
  book: {
    name: string;
    readed: boolean;
    author?: string;
    rating?: number;
    gender?: string;
  }
}

export class SetBookToReader {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ phoneNumber, book }: SetBookToReaderRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);

    const newBook = Book.create(book);

    reader.books.add(newBook);

    await this.readerRepository.save(reader);
  }
}