import { Controller } from "../../../../core/infra/Controller";
import { inMemoryReaderRepository } from "../../../../modules/readers/repositories/inMemoryReaderRepository";
import { CreateReader } from "../../../../modules/readers/usecases/CreateReader";
import { GetReader } from "../../../../modules/readers/usecases/GetReader";
import { Storage } from "../../../database/in_memory/Storage";
import { AuthenticationContactController } from "../../controllers/AuthenticationContactController";

export function makeAuthenticationContactController(): Controller {
  const storage = new Storage();
  const readerRepository = new inMemoryReaderRepository(storage);
  const createReader = new CreateReader(readerRepository);
  const getReader = new GetReader(readerRepository);
  const authenticationContactController = new AuthenticationContactController(getReader, createReader);

  return authenticationContactController;
}