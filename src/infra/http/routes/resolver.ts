import { NextFunction, Request, Response } from "express";

export const resolver = (handler: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(handler(req, res)).catch(error => next(error));
  }
}