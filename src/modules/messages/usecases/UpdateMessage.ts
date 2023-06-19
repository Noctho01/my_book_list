import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { ContextEnum, MessageDTO } from "../domain/message/Message";
import { IMessageRepository } from "../repositories/IMessageRepository";

type UpdateMessageRequest = {
  phoneNumber: string;
  context?: ContextEnum;
  step?: number;
}

type UpdateMessageResponse = MessageDTO;

export class UpdateMessage {
  constructor(readonly messageRepository: IMessageRepository) {}

  async execute({ phoneNumber, context, step }: UpdateMessageRequest): Promise<UpdateMessageResponse> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const message = await this.messageRepository.findByPhoneNumber(validatedPhoneNumber);

    let updated = false;

    if (context !== null && context !== undefined) {
      if (message.context !== context) {
        message.context = context;
        updated = true;
      }
    }

    if (step !== null && step !== undefined) {
      if (message.step !== step) {
        message.step = step;
        updated = true;
      }
    }

    if (updated) await this.messageRepository.save(message);

    return message.toJSON();
  }
}