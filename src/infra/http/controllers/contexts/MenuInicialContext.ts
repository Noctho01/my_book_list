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

type MenuInicialContextRequest = {
  readerDTO: ReaderDTO;
  messageDTO: MessageDTO;
  requestDTO: RequestDTO;
};

export class MenuInicialContext implements Controller<MenuInicialContextRequest> {

  static create(): MenuInicialContext {
    const storage = new Storage();
    const messageRepository = new InMemoryMessageRepository(storage);
    const updateMessageUseCase = new UpdateMessage(messageRepository);
    const deleteMessageUseCase = new DeleteMessage(messageRepository);

    return new MenuInicialContext(
      updateMessageUseCase,
      deleteMessageUseCase,
    );
  }

  constructor(
    readonly updateMessageUseCase: UpdateMessage,
    readonly deleteMessageUseCase: DeleteMessage,
  ){}

  async handler({ readerDTO, messageDTO, requestDTO }: MenuInicialContextRequest): Promise<HttpResponse> {
    console.log('------------------------------------');
    console.log('context menu inicial')
    switch (messageDTO.step) {
      case 0: return await this.stepZeroStrategy(readerDTO);
      case 1: return await this.stepOneStrategy(requestDTO);
      case 2: return ok();
      case 3: return ok();
      default: return internalError(Error('context step is invalid'));
    }
  }

  /**
   * > Etapa Zero <
   * - mensagem de apresentação
   */
  private async stepZeroStrategy({ name, phoneNumber, books }: ReaderDTO): Promise<HttpResponse> {
    try {
      console.log('step 0');
      const readeds = (books?.filter(book => !!book.readed))?.length ?? 0;
      const noReadeds = (books?.filter(book => !book.readed))?.length ?? 0;
      const message = `Olar ${name}, bem vindo a sua lista de livros no whatsapp!😉\n\n- lidos: ${readeds}\n- pendentes: ${noReadeds}\n\nopções:\n1️⃣ - ver livros\n2️⃣ - sair`;  
      await sendMessageService(phoneNumber, message);
      await this.updateMessageUseCase.execute({ phoneNumber, step: 1});
      return ok();
    } catch (err: any) {
      await sendMessageService(phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!');
      return internalError(err);
    }
  }

  /**
   * > Etapa Um <
   * - tratando opção escolhida pelo usuario
   */
  private async stepOneStrategy({ message, phoneNumber }: RequestDTO): Promise<HttpResponse> {
    try {
      console.log('step 1');
      const value = message.trim();
      console.log(value);
      switch(value) {
        case '1':
          await this.updateMessageUseCase.execute({phoneNumber,context: 'listar livros', step: 0});
          return reload();

        case '2':
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