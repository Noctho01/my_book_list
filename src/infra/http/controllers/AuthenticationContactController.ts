import { Controller } from "../../../core/infra/Controller";
import { HttpResponse, created, internalError, ok } from "../../../core/infra/HttpResponse";
import { inMemoryReaderRepository } from "../../../modules/readers/repositories/inMemoryReaderRepository";
import { CreateReader } from "../../../modules/readers/usecases/CreateReader";
import { GetReader } from "../../../modules/readers/usecases/GetReader";
import { Storage } from "../../database/in_memory/Storage";
import { MessageDTO } from "../weebhooks/ReceivingMessage";

type AuthenticationContactControllerRequest = MessageDTO;

export class AuthenticationContactController implements Controller<AuthenticationContactControllerRequest> {

  static create(): AuthenticationContactController {
    const storage = new Storage;
    const readerRepository = new inMemoryReaderRepository(storage);
    const createReader = new CreateReader(readerRepository);
    const getReader = new GetReader(readerRepository);
    
    return new AuthenticationContactController(getReader, createReader);
  }

  constructor(
    readonly getReaderUseCase: GetReader,
    readonly createReaderUseCase: CreateReader
  ) {}
  
  async handler({ phoneNumber, name }: AuthenticationContactControllerRequest): Promise<HttpResponse> {
    try {
      const readerDTO = await this.getReaderUseCase.execute({ phoneNumber })
      return ok(readerDTO);
    } catch (err: any) {
      if (err.message !== 'Reader not found') return internalError(err);
      await this.createReaderUseCase.execute({ name, phoneNumber });
      const readerDTO = await this.getReaderUseCase.execute({ phoneNumber });
      return created(readerDTO);
    }
  }
}