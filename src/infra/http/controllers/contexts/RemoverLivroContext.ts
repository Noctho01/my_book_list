import { Controller } from "../../../../core/infra/Controller";
import { HttpResponse, clientError, internalError, ok, reload } from "../../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../../modules/messages/domain/message/Message"
import { InMemoryMessageRepository } from "../../../../modules/messages/repositories/InMemoryMessageRepository";
import { DeleteMessage } from "../../../../modules/messages/usecases/DeleteMessage";
import { UpdateMessage } from "../../../../modules/messages/usecases/UpdateMessage";
import { ReaderDTO } from "../../../../modules/readers/domain/book/Reader";
import { inMemoryReaderRepository } from "../../../../modules/readers/repositories/inMemoryReaderRepository";
import { RemoveBook } from "../../../../modules/readers/usecases/books/RemoveBook";
import { Storage } from "../../../database/in_memory/Storage";
import { sendMessageService } from "../../../services/SendMessageService";
import { RequestDTO } from "../../weebhooks/ReceivingMessage";

type RemoverLivroContextRequest = {
  messageDTO: MessageDTO;
  readerDTO: ReaderDTO;
  requestDTO: RequestDTO;
}

export class RemoverLivroContext implements Controller<RemoverLivroContextRequest> {

  static create(): RemoverLivroContext {
    const storage = new Storage();
    const messageRepository = new InMemoryMessageRepository(storage);
    const readerRepository = new inMemoryReaderRepository(storage);
    const updateMessageUseCase = new UpdateMessage(messageRepository);
    const deleteMessageUseCase = new DeleteMessage(messageRepository);
    const removeBookUseCase = new RemoveBook(readerRepository);

    return new RemoverLivroContext(
      updateMessageUseCase,
      deleteMessageUseCase,
      removeBookUseCase,
    );
  }

  constructor(
    readonly updateMessageUseCase: UpdateMessage,
    readonly deleteMessageUseCase: DeleteMessage,
    readonly removeBookUseCase: RemoveBook,
  ){}
  
  async handler({ messageDTO, readerDTO, requestDTO }: RemoverLivroContextRequest): Promise<HttpResponse> {
    console.log('----------------------------------------');
    console.log('context remover livro');
    switch (messageDTO.step) {
      case 0: return await this.stepZeroStrategy(readerDTO);
      case 1: return await this.stepOneStrategy(requestDTO, readerDTO);
      default: return internalError(Error('context step is invalid'));
    }
  }

  private async stepZeroStrategy({ phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 0');
      await sendMessageService(phoneNumber, 'tem certeza? se sim informe o nome do livro, caso contrario, envie qualquer outra mensagem');
      await this.updateMessageUseCase.execute({ phoneNumber, step: 1 });
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!');
      return internalError(err);
    }
  }

  private async stepOneStrategy({ message }: RequestDTO, { books, phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 1');
      const bookName = message.trim();
      const bookDTO = books?.find(bookDTO => bookDTO.name.toUpperCase() === bookName.toUpperCase());
      if (!bookDTO) {
        await this.updateMessageUseCase.execute({ phoneNumber, context: 'listar livros', step: 0 });
        return reload();
      }
      await this.removeBookUseCase.execute({ phoneNumber, bookId: bookDTO._id!! });
      await sendMessageService(phoneNumber, 'o livro foi removido da sua lista...');
      await this.updateMessageUseCase.execute({ phoneNumber, context: 'listar livros', step: 0 });
      return reload();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!');
      return internalError(err);
    }
  }
}