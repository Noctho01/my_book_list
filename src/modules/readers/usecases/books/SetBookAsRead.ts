import { PhoneNumber } from "../../domain/book/PhoneNumber";
import { IReaderRepository } from "../../repositories/IReaderRepository";

type SetBookAsReadRequest = {
  phoneNumber: string;
  bookId: string;
}

export class SetBookAsRead {
  constructor(readonly readerRepository: IReaderRepository){}

  async execute({ phoneNumber, bookId }: SetBookAsReadRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);
    const book = reader.books.get(bookId);

    if (!book) throw new Error('Book not found');

    book.read();

    await this.readerRepository.save(reader);
  }
}