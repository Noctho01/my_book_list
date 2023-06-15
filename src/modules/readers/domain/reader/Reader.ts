import { Entity } from "../../../../core/domain/Entity";
import { Name } from "../../../_shared/domain/Name";
import { BookDTO } from "../../../books/domain/book/Book";
import { Books } from "./Books";
import { PhoneNumber } from "./PhoneNumber";

interface IReaderProps {
  _id?: string;
  name: Name;
  phoneNumber: PhoneNumber;
  books: Books; 
}

export class ReaderDTO {
  constructor(
    readonly _id: string,
    readonly name: string,
    readonly phoneNumber: string,
    readonly books: BookDTO[]
  ) {}
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

  static toJSON(reader: Reader): ReaderDTO {
    return new ReaderDTO(
      reader._id,
      reader.name.value,
      reader.phoneNumber.value,
      reader.books.getAllToDTO()
    )
  }

  protected constructor(props: IReaderProps) {
    super(props);
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
}