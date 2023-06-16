import { Name } from "../../_shared/domain/Name";
import { PhoneNumber } from "../domain/reader/PhoneNumber";
import { IReaderRepository } from "../repositories/IReaderRepository";

type UpdateReaderNameRequest = {
  phoneNumber: string;
  name: string;
}

export class UpdateReaderName {
  constructor(readonly readerRepository: IReaderRepository) {}

  async execute({ phoneNumber, name }: UpdateReaderNameRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const reader = await this.readerRepository.findByPhoneNumber(validatedPhoneNumber);
    
    let updated = false;

    const validatedName = Name.create(name);
    if (validatedName.value !== reader.name.value) {
      reader.name = validatedName;
      updated = true;
    }

    if (updated) {
      await this.readerRepository.save(reader);
    }
  }
}