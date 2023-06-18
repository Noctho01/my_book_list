import { PhoneNumber } from "../../domain/book/PhoneNumber";
import { IReaderRepository } from "../../repositories/IReaderRepository";

type RemoveBookRequest = {
  phoneNumber: string;
  bookId: string;
}

export class RemoveBook {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ phoneNumber, bookId }: RemoveBookRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);

    reader.books.remove(bookId);

    await this.readerRepository.save(reader);
  }
}