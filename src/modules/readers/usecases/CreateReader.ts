import { Reader } from "../domain/reader/Reader";
import { IReaderRepository } from "../repositories/IReaderRepository";

interface ICreateReaderRequest {
  name: string;
  phoneNumber: string;
}

interface ICreateReaderResponse {
  readerId: string;
}

export class CreateReader {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ name, phoneNumber }: ICreateReaderRequest): Promise<ICreateReaderResponse> {
    const reader = Reader.create({ name, phoneNumber });
    const phoneNumberAlreadyExists = await this.readerRepository.exists(reader.phoneNumber);
  
    if (phoneNumberAlreadyExists) {
      throw new Error('Reader with this phoneNumber already exists')
    }
    
    await this.readerRepository.save(reader);

    return { readerId: reader.id };
  }
}