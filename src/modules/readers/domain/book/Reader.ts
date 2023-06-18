import { Entity } from "../../../../core/domain/Entity";
import { Name } from "./Name";
import { BookDTO } from "./Book";
import { Books } from "./Books";
import { PhoneNumber } from "./PhoneNumber";

interface IReaderProps {
  _id?: string;
  name: Name;
  phoneNumber: PhoneNumber;
  books: Books; 
}

export interface ReaderDTO {
  _id?: string;
  name: string;
  phoneNumber: string;
  books?: BookDTO[]; 
}

export class Reader extends Entity<IReaderProps> {
  static create(readerDTO: ReaderDTO): Reader {
    return new Reader({
      _id: readerDTO._id ?? undefined,
      name: Name.create(readerDTO.name),
      phoneNumber: PhoneNumber.create(readerDTO.phoneNumber),
      books: Books.create(readerDTO.books ?? [])
    })
  }

  protected constructor(props: IReaderProps) {
    super(props, props._id);
  }

  get name(): Name {
    return this.props.name;
  }

  set name(value: Name) {
    this.props.name = value;
  }

  get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  set phoneNumber(value: PhoneNumber) {
    this.props.phoneNumber = value;
  }

  get books(): Books {
    return this.props.books;
  }

  toJSON(): ReaderDTO {
    return {
      _id: this._id,
      name: this.name.value,
      phoneNumber: this.phoneNumber.value,
      books: this.books.getAllToDTO()
    }
  }
}