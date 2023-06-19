import { Controller } from "../../../../core/infra/Controller";
import { HttpResponse, clientError, internalError, ok, reload } from "../../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../../modules/messages/domain/message/Message";
import { InMemoryMessageRepository } from "../../../../modules/messages/repositories/InMemoryMessageRepository";
import { DeleteMessage } from "../../../../modules/messages/usecases/DeleteMessage";
import { UpdateMessage } from "../../../../modules/messages/usecases/UpdateMessage";
import { BookDTO } from "../../../../modules/readers/domain/book/Book";
import { ReaderDTO } from "../../../../modules/readers/domain/book/Reader";
import { inMemoryReaderRepository } from "../../../../modules/readers/repositories/inMemoryReaderRepository";
import { CreateBook } from "../../../../modules/readers/usecases/books/CreateBook";
import { Storage } from "../../../database/in_memory/Storage";
import { sendMessageService } from "../../../services/SendMessageService";
import { RequestDTO } from "../../weebhooks/ReceivingMessage";

type AdicionarLivroContextRequest = {
  messageDTO: MessageDTO;
  readerDTO: ReaderDTO;
  requestDTO: RequestDTO;
}

export class AdicionarLivroContext implements Controller<AdicionarLivroContextRequest> {

  static create(): AdicionarLivroContext {
    const storage = new Storage();
    const messageRepository = new InMemoryMessageRepository(storage);
    const readerRepository = new inMemoryReaderRepository(storage);
    const updateMessageUseCase = new UpdateMessage(messageRepository);
    const deleteMessageUseCase = new DeleteMessage(messageRepository);
    const createBookUseCase = new CreateBook(readerRepository);

    return new AdicionarLivroContext(
      updateMessageUseCase,
      deleteMessageUseCase,
      createBookUseCase
    );
  }

  constructor(
    readonly updateMessageUseCase: UpdateMessage,
    readonly deleteMessageUseCase: DeleteMessage,
    readonly createBookUseCase: CreateBook
  ){}
  
  async handler({ messageDTO, readerDTO, requestDTO }: AdicionarLivroContextRequest): Promise<HttpResponse> {
    console.log('----------------------------------------');
    console.log('context adicionar livro');
    switch (messageDTO.step) {
      case 0: return await this.stepZeroStrategy(readerDTO);
      case 1: return await this.stepOneStrategy(requestDTO, readerDTO);
      default: return internalError(Error('context step is invalid'));
    }
  }

  private async stepZeroStrategy({ phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      await sendMessageService(phoneNumber, 'informe apenas o nome do livro ou complemente com outras informações');
      await sendMessageService(phoneNumber, 'Nome do Livro\n- lido\n- genero: _genero aqui_ \n- author: _nome do author aqui_ \n- estrelas: _numero de 1 a 5 aqui_');
      await sendMessageService(phoneNumber, 'obs: _fora o nome, todos os outros dados são opcionais\nporem, se informados, devem contem na mesma mensagem_ ');
      await this.updateMessageUseCase.execute({ phoneNumber, step: 1 });
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, volte mais tarde!');
      return internalError(err);
    }
  }

  private async stepOneStrategy({ message }: RequestDTO, { books, phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 0');
      const [name, ...items] = message.trim().split('-').map(value => value.trim());
      const bookRequest: BookDTO = {
        name,
        readed: items?.includes('lido') ?? false,
        author: items?.find(value => value.includes('autor:'))?.split(':')[1]?.trim(),
        gender: items?.find(value => value.includes('genero:'))?.split(':')[1]?.trim(),
        rating: (() => {
          const stars = items?.find(value => value.includes('estrelas:'))?.split(':')[1]?.trim();
          return stars ? parseInt(stars) : undefined;
        })()
      };
      await this.createBookUseCase.execute({ phoneNumber, book: bookRequest });
      await this.updateMessageUseCase.execute({ phoneNumber, context: 'listar livros', step: 0 });
      await sendMessageService(phoneNumber, 'o livro foi adicionado a lista com sucesso!');
      return reload();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, volte mais tarde!');
      return internalError(err);
    }
  }

}