import { Controller } from "../../../core/infra/Controller";
import { InMemoryMessageRepository } from "../../../modules/messages/repositories/InMemoryMessageRepository";
import { CreateMessage } from "../../../modules/messages/usecases/CreateMessage";
import { GetMessage } from "../../../modules/messages/usecases/GetMessage";
import { UpdateMessage } from "../../../modules/messages/usecases/UpdateMessage";
import { inMemoryReaderRepository } from "../../../modules/readers/repositories/inMemoryReaderRepository";
import { CreateReader } from "../../../modules/readers/usecases/CreateReader";
import { GetReader } from "../../../modules/readers/usecases/GetReader";
import { Storage } from "../../database/in_memory/Storage";
import { ReceivingMessageWebhook } from "../weebhooks/ReceivingMessage";

export function makeReceivingMessageWebhook(): Controller {
  const storage = new Storage();

  const readerRepository = new inMemoryReaderRepository(storage);
  const messageRepository = new InMemoryMessageRepository(storage);

  const getReaderUseCase = new GetReader(readerRepository);
  const createReaderUseCase = new CreateReader(readerRepository);
  const getMessageUseCase = new GetMessage(messageRepository);
  const createMessageUseCase = new CreateMessage(messageRepository);
  const updateMessageUseCase = new UpdateMessage(messageRepository);
  
  const receivingMessageWebhook = new ReceivingMessageWebhook(
    getReaderUseCase,
    createReaderUseCase,
    getMessageUseCase,
    createMessageUseCase,
    updateMessageUseCase
  );

  return receivingMessageWebhook;
}