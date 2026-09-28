// Adds our own field to Express's Request type, so `req.requestId` is typed
// everywhere. It is set by the requestId middleware.
declare namespace Express {
  interface Request {
    requestId: string;
  }
}
