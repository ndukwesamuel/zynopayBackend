const errorMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode == 200 ? 500 : res.statusCode;
  if (err.errors?.email) {
    err.message = err.errors.email.message;
    statusCode = 400;
  } else if (err.errors?.message) {
    err.message = err.errors.username.message;
    statusCode = 400;
  } else if (err.errors?.phoneNumber) {
    err.message = err.errors.phoneNumber.message;
    statusCode = 400;
  }

  if (err.code === 11000 && err.keyValue.email) {
    err.message = `User with this email already exists`;
    statusCode = 400;
  }
  // if (err.code === 11000 && err.keyValue.phoneNumber) {
  //   err.message = `User with this phone number already exists`;
  //   statusCode = 400;
  // }

  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  err.message = !err.message
    ? '"Something went wrong, try again later"'
    : err.message;

  res.status(statusCode).json({ message: err.message });
};

module.exports = errorMiddleware;
