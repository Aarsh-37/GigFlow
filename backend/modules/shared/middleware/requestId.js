import { v4 as uuid } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const als = new AsyncLocalStorage();

export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuid();
  res.setHeader('x-request-id', requestId);
  als.run({ requestId }, next);
}
