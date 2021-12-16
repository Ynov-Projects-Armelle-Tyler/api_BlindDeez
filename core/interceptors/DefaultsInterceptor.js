export default function DefaultsInterceptor (req, res, next) {
  req.blinddeez = {};

  next();
}
