import { Entity } from "../../../../core/domain/Entity";
import { PhoneNumber } from "../../../readers/domain/book/PhoneNumber";

export type ContextEnum = 'menu inicial' | 'listar livros' | 'sobre livro' | 'adicionando livro' | 'removendo livro' | 'editando livro' | 'sobre leitor' | 'editando nome leitor';

export type MessageDTO = {
  _id?: string;
  phoneNumber: string;
  context: ContextEnum;
  step: number;
  expiresIn?: Date;
}

interface MessageProps {
  _id?: string;
  phoneNumber: PhoneNumber;
  context: ContextEnum;
  step: number;
  expiresIn: Date;
}

export class Message extends Entity<MessageProps> {

  static validate(props: MessageDTO): boolean {
    if (
      props.context === undefined
      || props.context === null
      || props.step === undefined
      || props.step === null
    ) return false;
    return true;
  }

  static create(props: MessageDTO): Message {
    if (!this.validate(props)) throw new Error('message is invalid');
    const phoneNumber = PhoneNumber.create(props.phoneNumber);
    const expiresIn = props.expiresIn
      ?? (() => {
        const date = new Date(Date.now());
        date.setDate(date.getDate() + 1);
        return date
      })();

    return new Message({
      ...props,
      phoneNumber,
      expiresIn
    });
  }
  
  protected constructor(props: MessageProps) {
    super(props, props._id);
  }

  get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  get expiresIn(): Date {
    return this.props.expiresIn;
  }

  get context(): ContextEnum {
    return this.props.context;
  }

  set context(value: ContextEnum) {
    this.props.context = value;
  }

  get step(): number {
    return this.props.step;
  }

  set step(value: number) {
    this.props.step = value;
  }

  toJSON(): MessageDTO {
    return {
      _id: this.id,
      phoneNumber: this.phoneNumber.value,
      context: this.context,
      step: this.step,
      expiresIn: this.expiresIn,
    }
  }
}