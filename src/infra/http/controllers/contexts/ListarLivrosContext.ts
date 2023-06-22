import { Controller } from "../../../../core/infra/Controller";
import { HttpResponse, clientError, internalError, ok, reload } from "../../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../../modules/messages/domain/message/Message";
import { InMemoryMessageRepository } from "../../../../modules/messages/repositories/InMemoryMessageRepository";
import { DeleteMessage } from "../../../../modules/messages/usecases/DeleteMessage";
import { UpdateMessage } from "../../../../modules/messages/usecases/UpdateMessage";
import { ReaderDTO } from "../../../../modules/readers/domain/book/Reader";
import { Storage } from "../../../database/in_memory/Storage";
import { sendMessageService } from "../../../services/SendMessageService";
import { RequestDTO } from "../../weebhooks/ReceivingMessage";

type ListarLivrosContextRequest = {
  messageDTO: MessageDTO;
  readerDTO: ReaderDTO;
  requestDTO: RequestDTO;
}

export class ListarLivrosContext implements Controller<ListarLivrosContextRequest> {

  static create(): ListarLivrosContext {
    const storage = new Storage();
    const messageRepository = new InMemoryMessageRepository(storage);
    const updateMessageUseCase = new UpdateMessage(messageRepository);
    const deleteMessageUseCase = new DeleteMessage(messageRepository);

    return new ListarLivrosContext(
      updateMessageUseCase,
      deleteMessageUseCase,
    );
  }

  constructor(
    readonly updateMessageUseCase: UpdateMessage,
    readonly deleteMessageUseCase: DeleteMessage,
  ){}
  
  async handler({ messageDTO, readerDTO, requestDTO }: ListarLivrosContextRequest): Promise<HttpResponse> {
    console.log('----------------------------------------')
    console.log('context listar livros');
    switch (messageDTO.step) {
      case 0: return await this.stepZeroStrategy(readerDTO);
      case 1: return await this.stepOneStrategy(requestDTO, readerDTO);
      default: return internalError(Error('context step is invalid'));
    }
  }

  private async stepZeroStrategy({ books, phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 0')
      const booksExists = books!!.length > 0;
      let firstMessage =  booksExists ? '*📚LIVROS*' : '*NENHUM LIVRO ENCONTRADO...*';
      books?.forEach((book, index) => {
        let stars = '';
        const starsNumber = book.rating ?? 0;
        for(let i = 0; i < starsNumber; i++) stars = stars + '⭐';
        firstMessage = firstMessage + `\n\n[${index + 1}] ${book.name} - ${book.readed ? '_lido_' : '_pendente_'}`;
      });
      await sendMessageService(phoneNumber, firstMessage);
      const secondMessage = `opções:\n${booksExists ? '1️⃣ - sobre livro\n' : ''}2️⃣ - adicionar livro\n3️⃣ - voltar\n4️⃣ - sair`;
      await sendMessageService(phoneNumber, secondMessage);
      await this.updateMessageUseCase.execute({ phoneNumber, step: 1 });
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!');
      return internalError(err);
    }
  }

  private async stepOneStrategy({ message, phoneNumber }: RequestDTO, { books }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 1')
      const value = message.trim();
      switch(value) {
        case '1':
          if (books!!.length > 0){
            await this.updateMessageUseCase.execute({phoneNumber, context: 'sobre livro', step: 0});
            return reload();
          }
          await sendMessageService(phoneNumber, 'opção indisponivel pois não existe nenhum livro na sua lista');
          return clientError(Error('message is invalid'));

        case '2':
          await this.updateMessageUseCase.execute({phoneNumber, context: 'adicionando livro', step: 0 });
          return reload();

        case '3':
          await this.updateMessageUseCase.execute({phoneNumber, context: 'menu inicial', step: 0});
          return reload();

        case '4':
          const firstMessage = 'Tudo bem😔';
          await sendMessageService(phoneNumber, firstMessage);
          const secondMessage = 'Estarei aqui se precisa😀, é so mandar um "oi"';
          await sendMessageService(phoneNumber, secondMessage);
          await this.deleteMessageUseCase.execute({ phoneNumber });
          return ok();

        default:
          const messageError = 'mensagem invalida, informa um dos valores apresentados nas opções acima';
          await sendMessageService(phoneNumber, messageError);
          return clientError(Error('message is invalid'));
      }
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!');
      return internalError(err);
    }
  }
}