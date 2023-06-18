import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";
import { MessageDTO } from "../domain/message/Message";
import { IMessageRepository } from "../repositories/IMessageRepository";

type GetMessageRequest = {
  phoneNumber: string;
}

type GetMessageResponse = MessageDTO;

export class GetMessage {
  constructor(readonly messageRepository: IMessageRepository) {}

  async execute({ phoneNumber }: GetMessageRequest): Promise<GetMessageResponse> {
    const validatedPhoneNumber = PhoneNumber.create(phoneNumber);
    const message = await this.messageRepository.findByPhoneNumber(validatedPhoneNumber);
    return message.toJSON();
  }
}