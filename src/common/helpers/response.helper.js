export const success = (res, data, message = "OK", statusCode = 200) => {
  return res
    .status(statusCode)
    .json({ status: "success", statusCode, message, data });
};

export const errorResponse = (res, message = "Internal Server Error", statusCode = 500) => {
  return res
    .status(statusCode)
    .json({ status: "error", statusCode, message });
};
