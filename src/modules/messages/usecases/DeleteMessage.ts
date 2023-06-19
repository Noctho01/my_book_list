import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { IMessageRepository } from "../repositories/IMessageRepository";

type DeleteMessageRequest = {
  phoneNumber: string;
}

export class DeleteMessage {
  constructor(readonly messageRepository: IMessageRepository) {}

  async execute({ phoneNumber }: DeleteMessageRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const message = await this.messageRepository.findByPhoneNumber(validatedPhoneNumber);
    await this.messageRepository.delete(message);
  }
}