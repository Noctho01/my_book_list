import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { ContextEnum } from "../domain/message/Message";
import { IMessageRepository } from "../repositories/IMessageRepository";

type UpdateMessageRequest = {
  phoneNumber: string;
  context?: ContextEnum;
  step?: number;
}

export class UpdateMessage {
  constructor(readonly messageRepository: IMessageRepository) {}

  async execute({ phoneNumber, context, step }: UpdateMessageRequest): Promise<void> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const message = await this.messageRepository.findByPhoneNumber(validatedPhoneNumber);

    let updated = false;

    if (context) {
      if (message.context !== context) {
        message.context = context;
        updated = true;
      }
    }

    if (step) {
      if (message.step !== step) {
        message.step = step;
        updated = true;
      }
    }

    if (updated) await this.messageRepository.save(message);
  }
}