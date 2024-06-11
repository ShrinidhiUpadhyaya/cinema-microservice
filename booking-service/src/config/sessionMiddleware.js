const { v4: uuidv4 } = require("uuid");

function sessionMiddleware(req, res, next) {
  if (!req.headers["x-session-id"]) {
    req.headers["x-session-id"] = uuidv4();
  }
  next();
}

module.exports = sessionMiddleware;
