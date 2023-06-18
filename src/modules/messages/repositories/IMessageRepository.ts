import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { Message } from "../domain/message/Message";

export interface IMessageRepository {
  exists(phoneNumber: PhoneNumber): Promise<boolean>;
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Message>;
  save(message: Message): Promise<void>;
  delete(message: Message): Promise<void>;
}