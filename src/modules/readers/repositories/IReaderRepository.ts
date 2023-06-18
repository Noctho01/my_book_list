import { PhoneNumber } from "../domain/book/PhoneNumber";
import { Reader } from "../domain/book/Reader";

export interface IReaderRepository {
  exists(phoneNumber: PhoneNumber): Promise<boolean>;
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Reader>;
  save(reader: Reader): Promise<void>;
}