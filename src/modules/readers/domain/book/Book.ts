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

export interface BookDTO {
  _id?: string,
  name: string,
  readed: boolean,
  author?: string,
  rating?: number,
  gender?: string,
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

  toJSON(): BookDTO {
    return {
      _id: this._id,
      name: this.name.value,
      readed: this.readed,
      author: this.author?.value,
      rating: this.rating?.value,
      gender: this.gender?.value
    };
  }
}