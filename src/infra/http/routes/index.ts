import { Router } from "express";
import { adaptRoute } from "../../../core/infra/adapters/ExpressRouterAdapter";
import { makeReceivingMessageWebhook } from "../factories/MakeReceivingMessageWebhook";
const router = Router()

router.post('/', adaptRoute(makeReceivingMessageWebhook()));

export { router };