import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { IReaderRepository } from "../repositories/IReaderRepository";

type RemoveBookReaderRequest = {
  phoneNumber: string;
  bookId: string;
}

export class RemoveBookReader {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ phoneNumber, bookId }: RemoveBookReaderRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);

    reader.books.remove(bookId);

    await this.readerRepository.save(reader);
  }
}