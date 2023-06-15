import { Entity } from "../../../../core/domain/Entity";
import { Name } from "../../../_shared/domain/Name";
import { Rating } from "./Rating";

interface IBookProps {
  _id?: string;
  name: Name;
  readed: boolean;
  author?: Name;
  rating?: Rating;
  gender?: Name;
}

export class BookDTO {
  constructor(
    readonly _id: string,
    readonly name: string,
    readonly readed: boolean,
    readonly author?: string,
    readonly rating?: number,
    readonly gender?: string,
  ){}
}

export class Book extends Entity<IBookProps> {
  static create(bookDTO: BookDTO): Book {
    return new Book({
      _id: bookDTO._id ?? undefined,
      name: Name.create(bookDTO.name),
      readed: bookDTO.readed,
      author: !!bookDTO.author ? Name.create(bookDTO.author) : undefined,
      gender: !!bookDTO.gender ? Name.create(bookDTO.gender) : undefined,
      rating: !!bookDTO.rating ? Rating.create(bookDTO.rating) : undefined,
    });
  }

  static toJSON(book: Book): BookDTO {
    return new BookDTO(
      book._id,
      book.name.value,
      book.readed,
      book.author?.value,
      book.rating?.value,
      book.gender?.value
    );
  }

  protected constructor(props: IBookProps) {
    super(props);
  }

  get name(): Name {
    return this.props.name;
  }

  set name(value: Name) {
    this.props.name = value;
  }

  get readed(): boolean {
    return this.props.readed;
  }

  get author(): Name| undefined {
    return this.props.author;
  }

  set author(value: Name) {
    this.props.author = value;
  }

  get gender(): Name | undefined {
    return this.props.gender;
  }

  set gender(value: Name) {
    this.props.gender = value;
  }

  get rating(): Rating| undefined {
    return this.props.rating;
  }

  set rating(value: Rating) {
    this.props.rating = value;
  }
  
  read(): void {
    this.props.readed = true;
  }
}