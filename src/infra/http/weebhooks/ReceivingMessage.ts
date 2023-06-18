import { Controller } from "../../../core/infra/Controller";
import { HttpResponse, ok } from "../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../modules/messages/domain/message/Message";
import { CreateMessage } from "../../../modules/messages/usecases/CreateMessage";
import { GetMessage } from "../../../modules/messages/usecases/GetMessage";
import { UpdateMessage } from "../../../modules/messages/usecases/UpdateMessage";
import { ReaderDTO } from "../../../modules/readers/domain/book/Reader";
import { CreateReader } from "../../../modules/readers/usecases/CreateReader";
import { GetReader } from "../../../modules/readers/usecases/GetReader";
import { sendMessageService } from "../../services/SendMessageService";

type ReceivingMessageRequest = {
  ProfileName?: string;
  Body: string;
  WaId: string;
}

export class ConnectionDTO {

  readonly name: string;
  readonly message: string;
  readonly phoneNumber: string;

  constructor(props: ReceivingMessageRequest){
    this.name = props.ProfileName ?? props.WaId;
    this.message = props.Body;
    this.phoneNumber = props.WaId;
  }
}

export class ReceivingMessageWebhook implements Controller<ReceivingMessageRequest> {

  constructor(
    readonly getReaderUseCase: GetReader,
    readonly createReaderUseCase: CreateReader,
    readonly getMessageUseCase: GetMessage,
    readonly createMessageUseCase: CreateMessage,
    readonly updateMessageUseCase: UpdateMessage
  ){}
  
  async handler(request: ReceivingMessageRequest): Promise<HttpResponse> {
    const connectionDTO = new ConnectionDTO(request);
    const readerDTO = await this.getReaderDTOService(connectionDTO);
    const messageDTO = await this.getMessageDTOService(readerDTO);
    
    switch(messageDTO.context) {
      case 'menu inicial':
        switch(messageDTO.step) {
          case 0:
            await sendMessageService(connectionDTO.phoneNumber, `Olar ${readerDTO.name}, bem vindo a sua lista de livros\nno whatsapp!😉\n\n✔️lidos: ${(readerDTO.books?.filter(book => !!book.readed))?.length}\n✖️pendentes: ${(readerDTO.books?.filter(book => !book.readed))?.length}\n\nopções:\n1️⃣ - cagar nas calças\n2️⃣ - vender drogas\n3️⃣ - cair fora`);
              await this.updateMessageUseCase.execute({
                phoneNumber: connectionDTO.phoneNumber,
                step: 1
              });
              return ok();
          default:
            return ok();
        }

      case 'sobre livro':
        return ok();
      default:
        return ok();
    }
  }

  private async getMessageDTOService(readerDTO: ReaderDTO): Promise<MessageDTO> {
    try {
      const messageDTO = await this.getMessageUseCase.execute(readerDTO);
      return messageDTO
    } catch (err) {
      await this.createMessageUseCase.execute(readerDTO);
      const messageDTO = await this.getMessageUseCase.execute(readerDTO);
      return messageDTO;
    }
  }

  private async getReaderDTOService(connectionDTO: ConnectionDTO): Promise<ReaderDTO> {
    try {
      const readerDTO = await this.getReaderUseCase.execute(connectionDTO);
      return readerDTO;
    } catch (err) {
      await this.createReaderUseCase.execute(connectionDTO);
      const readerDTO = await this.getReaderUseCase.execute(connectionDTO);
      return readerDTO;
    }
  }
}