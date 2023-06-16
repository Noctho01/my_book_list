import { Name } from "../../_shared/domain/Name";
import { Rating } from "../domain/book/Rating";
import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { IReaderRepository } from "../repositories/IReaderRepository";

type UpdateBookReaderRequest = {
  phoneNumber: string;
  book: {
    _id: string;
    name?: string;
    author?: string;
    rating?: number;
    gender?: string;
  }
}

export class UpdateBookReader {
  constructor(readonly readerRepository: IReaderRepository) {}
  
  async execute({ phoneNumber, book: rawBook }: UpdateBookReaderRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);
    const book = reader.books.get(rawBook._id);

    if (!book) throw new Error('Book not found');

    let updated = false;

    if (rawBook.name) {
      const validatedName = Name.create(rawBook.name);
      if (book.name.value !== validatedName.value) {
        book.name = validatedName;
        updated = true;
      }
    }

    if (rawBook.author) {
      const validatedAuthor = Name.create(rawBook.author);
      if (book.author?.value !== validatedAuthor.value){
        book.author = validatedAuthor;
        updated = true;
      }
    }

    if (rawBook.rating) {
      const validatedRating = Rating.create(rawBook.rating);
      if (book.rating?.value !== validatedRating.value) {
        book.rating = validatedRating;
        updated = true;
      }
    }

    if (rawBook.gender) {
      const validatedGender = Name.create(rawBook.gender);
      if (book.gender?.value !== validatedGender.value) {
        book.gender = validatedGender;
        updated = true;
      }
    }

    if (updated) await this.readerRepository.save(reader);
  }
}