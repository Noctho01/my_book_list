import { Controller } from "../../../../core/infra/Controller";
import { HttpResponse, clientError, internalError, ok, reload } from "../../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../../modules/messages/domain/message/Message";
import { InMemoryMessageRepository } from "../../../../modules/messages/repositories/InMemoryMessageRepository";
import { DeleteMessage } from "../../../../modules/messages/usecases/DeleteMessage";
import { UpdateMessage } from "../../../../modules/messages/usecases/UpdateMessage";
import { ReaderDTO } from "../../../../modules/readers/domain/book/Reader";
import { Storage } from "../../../database/in_memory/Storage";
import { RequestDTO } from "../../weebhooks/ReceivingMessage";
import { sendMessageService } from "../../../services/SendMessageService";

type SobreOLivroContextRequest = {
  messageDTO: MessageDTO;
  readerDTO: ReaderDTO;
  requestDTO: RequestDTO;
}

export class SobreOLivroContext implements Controller<SobreOLivroContextRequest> {

  static create(): SobreOLivroContext {
    const storage = new Storage();
    const messageRepository = new InMemoryMessageRepository(storage);
    const updateMessageUseCase = new UpdateMessage(messageRepository);
    const deleteMessageUseCase = new DeleteMessage(messageRepository);

    return new SobreOLivroContext(
      updateMessageUseCase,
      deleteMessageUseCase
    );
  }

  constructor(
    readonly updateMessageUseCase: UpdateMessage,
    readonly deleteMessageUseCase: DeleteMessage,
  ){}
  
  async handler({ messageDTO, readerDTO, requestDTO }: SobreOLivroContextRequest): Promise<HttpResponse> {
    console.log('----------------------------------------');
    console.log('context sobre o livro');
    switch (messageDTO.step) {
      case 0: return await this.stepZeroStrategy(requestDTO);
      case 1: return await this.stepOneStrategy(requestDTO, readerDTO);
      case 2: return await this.stepTwoStrategy(requestDTO);
      default: return internalError(Error('context step is invalid'));
    }
  }

  private async stepZeroStrategy({ phoneNumber }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 0');
      await sendMessageService(phoneNumber, 'informe o nome do livro');
      await this.updateMessageUseCase.execute({ phoneNumber, step: 1 });
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, volte mais tarde!');
      return internalError(err);
    }
  }

  private async stepOneStrategy({ message }: RequestDTO, { books, phoneNumber }:ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 1');
      const bookName = message.trim();
      const bookDTO = books?.find(bookDTO => bookDTO.name.toLowerCase() === bookName.toLowerCase());
      if (!bookDTO) {
        await sendMessageService(phoneNumber, 'livro não encontrato, por favor informe um nome valido...');
        await this.updateMessageUseCase.execute({ phoneNumber, context: 'listar livros', step: 0 });
        return reload();
      }
      let stars = '';
        const starsNumber = bookDTO.rating ?? 0;
        for(let i = 0; i <= starsNumber; i++) {
          stars = stars + '⭐';
        }
      const firstMessage = `*${bookDTO.name.toUpperCase()}*\nlido:${bookDTO.readed ? '✅' : '💤'}\nautor: ${bookDTO.author ?? '...'}\ngenero: ${bookDTO.gender ?? '...'}\nestrelas: ${stars}`;
      await sendMessageService(phoneNumber, firstMessage).then(async () => {
        const secondMessage = 'opções:\n1️⃣ - editar\n2️⃣ - remover\n3️⃣ - voltar\n4️⃣ - sair';
        await sendMessageService(phoneNumber, secondMessage);
      });
      await this.updateMessageUseCase.execute({ phoneNumber, step: 2 });
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, volte mais tarde!');
      return internalError(err);
    }
  }

  private async stepTwoStrategy({ message, phoneNumber }: RequestDTO): Promise<HttpResponse> {
    try {
      console.log('step 2');
      const value = message.trim();
      switch (value) {
        case '1':
          await this.updateMessageUseCase.execute({ phoneNumber, context: 'editando livro', step: 0 });
          return reload();

        case '2':
          await this.updateMessageUseCase.execute({ phoneNumber, context: 'removendo livro', step: 0 })
          return reload();

        case '3':
          await this.updateMessageUseCase.execute({phoneNumber, context: 'menu inicial', step: 0});
          return reload();

        case '4':
          const firstMessage = 'Tudo bem😔';
          await sendMessageService(phoneNumber, firstMessage).then(async () => {
            const secondMessage = 'Estarei aqui se precisa😀, é so mandar um "oi"';
            await sendMessageService(phoneNumber, secondMessage);
          });
          await this.deleteMessageUseCase.execute({ phoneNumber });
          return ok();

        default:
          const messageError = 'mensagem invalida, informa um dos valores apresentados nas opções acima';
          await sendMessageService(phoneNumber, messageError);
          return clientError(Error('message is invalid'));
      }
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, volte mais tarde!');
      return internalError(err);
    }
  }
}