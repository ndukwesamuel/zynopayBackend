/** @format */

const notFound = async (req, res, next) => {
  const error = new Error("Route Not Found");
  res.statusCode = 404;
  next(error);
};

module.exports = notFound;
