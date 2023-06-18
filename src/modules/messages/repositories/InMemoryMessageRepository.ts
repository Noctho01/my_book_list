import { Message, MessageDTO } from "../domain/message/Message";
import { IMessageRepository } from "./IMessageRepository";
import { Storage } from '../../../infra/database/in_memory/Storage';
import { PhoneNumber } from "../../readers/domain/book/PhoneNumber";

export class InMemoryMessageRepository implements IMessageRepository {

  private async rdStorage(): Promise<MessageDTO[]> {
    return await this._storage.readCollection<MessageDTO>('messages');
  }

  private async wtStorage(messages: MessageDTO[]): Promise<void> {
    await this._storage.writeCollection<MessageDTO>('messages', messages)
  }
  
  constructor(private readonly _storage: Storage){}

  async delete(message: Message): Promise<void> {
    const messages = await this.rdStorage();
    const messagesUpdated = messages.filter(messageDTO => messageDTO._id !== message.id);
    await this.wtStorage(messagesUpdated);
  }
  
  async exists(phoneNumber: PhoneNumber): Promise<boolean> {
    const messages = await this.rdStorage();
    const message = messages.find(messageDTO => messageDTO.phoneNumber === phoneNumber.value);
    if (!message) return false;
    const notExpired = message.expiresIn!! >= new Date(Date.now());
    if (notExpired) {
      await this.delete(Message.create(message));
      return false;
    }
    return true;
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Message> {
    const messages = await this.rdStorage();
    const messageDTO = messages.find(messageDTO => messageDTO.phoneNumber === phoneNumber.value)
    if (!messageDTO) throw new Error('message not found');
    const message = Message.create(messageDTO);
    if (message.expiresIn >= new Date(Date.now())) {
      await this.delete(message);
      throw new Error('message not found');
    }
    return message;
  }
  
  async save(message: Message): Promise<void> {
    const messageDTO = message.toJSON();
    const messages = await this.rdStorage();
    const messageExists = messages.find(messageInCollection => messageInCollection._id === messageDTO._id)
    if (!messageExists) {
      messages.push(messageDTO);
    } else {
      messageExists.context = messageDTO.context;
      messageExists.step = messageDTO.step;
    }
    await this.wtStorage(messages);
  }

}