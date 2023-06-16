import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { IReaderRepository } from "../repositories/IReaderRepository";

type SetReadedBookReaderRequest = {
  phoneNumber: string;
  bookId: string;
}

export class SetReadedBookReader {
  constructor(readonly readerRepository: IReaderRepository){}

  async execute({ phoneNumber, bookId }: SetReadedBookReaderRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);
    const book = reader.books.get(bookId);

    if (!book) throw new Error('Book not found');

    book.read();

    await this.readerRepository.save(reader);
  }
}