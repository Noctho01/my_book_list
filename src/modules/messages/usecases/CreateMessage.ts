import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { Message } from "../domain/message/Message";
import { IMessageRepository } from "../repositories/IMessageRepository";

type CreateMessageRequest = {
  phoneNumber: string;
}

export class CreateMessage {
  constructor(readonly messageRepository: IMessageRepository) {}

  async execute({ phoneNumber }: CreateMessageRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const messageAlredyExists = await this.messageRepository.exists(validatedPhoneNumber);
    
    if (messageAlredyExists) throw new Error('message already exists');

    const message = Message.create({
      phoneNumber,
      context:'menu inicial',
      step:0
    });

    await this.messageRepository.save(message);
  }
}