import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { ReaderDTO } from "../domain/reader/Reader";
import { IReaderRepository } from "../repositories/IReaderRepository";

type GetReaderRequest = {
  phoneNumber: string;
}

type  GetReaderResponse = ReaderDTO

export class GetReader {
  constructor(readonly readerRepository: IReaderRepository) {}
  
  async execute({ phoneNumber }: GetReaderRequest): Promise<GetReaderResponse> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);
    return reader.toJSON();
  }
}