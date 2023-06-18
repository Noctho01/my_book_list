import { HttpResponse } from "./HttpResponse";

export interface Controller<T = any> {
  handler(request:T): Promise<HttpResponse>
}
