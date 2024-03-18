const customError = (statusCode, message) => {
  const error = {
    statusCode,
    message,
  };
  return error;
};

module.exports = customError;
