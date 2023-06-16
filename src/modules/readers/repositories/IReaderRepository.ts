import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { Reader } from "../domain/reader/Reader";

export interface IReaderRepository {
  exists(phoneNumber: PhoneNumber): Promise<boolean>;
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Reader>
  save(reader: Reader): Promise<void>
}