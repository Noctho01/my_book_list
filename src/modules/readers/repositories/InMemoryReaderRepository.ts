import fs from 'node:fs';
import { PhoneNumber } from "../domain/book/PhoneNumber";
import { Reader, ReaderDTO } from "../domain/book/Reader";
import { IReaderRepository } from "./IReaderRepository";
import { Storage } from '../../../infra/database/in_memory/Storage';

export class inMemoryReaderRepository implements IReaderRepository {
  
  constructor(private readonly _storage: Storage){}

  private async rdStorage(): Promise<ReaderDTO[]> {
    return await this._storage.readCollection<ReaderDTO>('readers');
  }

  private async wtStorage(readers: ReaderDTO[]): Promise<void> {
    await this._storage.writeCollection<ReaderDTO>('readers', readers)
  }
  
  async exists(phoneNumber: PhoneNumber): Promise<boolean> {
    const readers = await this.rdStorage();
    const exists = readers.find(readerDTO => readerDTO.phoneNumber === phoneNumber.value);
    return !!exists;
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Reader> {
    const readers = await this.rdStorage();
    const readerDTO = readers.find(readerDTO => readerDTO.phoneNumber === phoneNumber.value)
    if (!readerDTO) throw new Error('reader not found');
    return Reader.create(readerDTO);
  }
  
  async save(reader: Reader): Promise<void> {
    const readerDTO = reader.toJSON();
    const readers = await this.rdStorage();
    const readerExists = readers.find(readerInCollection => readerInCollection._id === readerDTO._id)
    if (!readerExists) {
      readers.push(readerDTO);
    } else {
      readerExists.name = readerDTO.name;
      readerExists.books = readerDTO.books;
    }
    await this.wtStorage(readers);
  }
}