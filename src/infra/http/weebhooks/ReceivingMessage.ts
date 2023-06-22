import { Controller } from "../../../core/infra/Controller";
import { HttpResponse, internalError, ok } from "../../../core/infra/HttpResponse";
import { MessageDTO } from "../../../modules/messages/domain/message/Message";
import { CreateMessage } from "../../../modules/messages/usecases/CreateMessage";
import { GetMessage } from "../../../modules/messages/usecases/GetMessage";
import { UpdateMessage } from "../../../modules/messages/usecases/UpdateMessage";
import { ReaderDTO } from "../../../modules/readers/domain/book/Reader";
import { CreateReader } from "../../../modules/readers/usecases/CreateReader";
import { GetReader } from "../../../modules/readers/usecases/GetReader";
import { sendMessageService } from "../../services/SendMessageService";
import { AdicionarLivroContext } from "../controllers/contexts/AdicionarLivroContext";
import { ListarLivrosContext } from "../controllers/contexts/ListarLivrosContext";
import { MenuInicialContext } from "../controllers/contexts/MenuInicialContext";
import { RemoverLivroContext } from "../controllers/contexts/RemoverLivroContext";
import { SobreOLivroContext } from "../controllers/contexts/SobreOLivroContext";

type ReceivingMessageRequest = {
  ProfileName?: string;
  Body: string;
  WaId: string;
}

export class RequestDTO {

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
    while (true) {
      const requestDTO = new RequestDTO(request);
      const readerDTO = await this.getReaderDTOService(requestDTO);
      const messageDTO = await this.getMessageDTOService(readerDTO);

      let httpResponse: HttpResponse;

      switch(messageDTO.context) {
        case 'menu inicial':
          httpResponse = await MenuInicialContext.create().handler({ messageDTO, readerDTO, requestDTO });
          if (httpResponse.statusCode === 0) break;
          return httpResponse;

        case 'listar livros':
          httpResponse = await ListarLivrosContext.create().handler({ messageDTO, readerDTO, requestDTO });
          if (httpResponse.statusCode === 0) break;
          return httpResponse;

        case 'sobre livro':
          httpResponse = await SobreOLivroContext.create().handler({ messageDTO, readerDTO, requestDTO });
          if (httpResponse.statusCode === 0) break;
          return httpResponse;

        case 'adicionando livro':
          httpResponse = await AdicionarLivroContext.create().handler({ messageDTO, readerDTO, requestDTO });
          if (httpResponse.statusCode === 0) break;
          return httpResponse;

        case 'removendo livro':
          httpResponse = await RemoverLivroContext.create().handler({ messageDTO, readerDTO, requestDTO });
          if (httpResponse.statusCode === 0) break;
          return httpResponse;

        default:
          await sendMessageService(readerDTO.phoneNumber, '⚠️ocorreu um erro, tente novamente ou volte mais tarde!')
          return internalError(Error('context is invalid'));
      }
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

  private async getReaderDTOService(requestDTO: RequestDTO): Promise<ReaderDTO> {
    try {
      const readerDTO = await this.getReaderUseCase.execute(requestDTO);
      return readerDTO;
    } catch (err) {
      await this.createReaderUseCase.execute(requestDTO);
      const readerDTO = await this.getReaderUseCase.execute(requestDTO);
      return readerDTO;
    }
  }
}