// Wrap controller async de loi luon duoc day ve global error handler,
// giu controller/doc code ngan gon.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
