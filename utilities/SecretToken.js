require("dotenv").config();
const jwt = require("jsonwebtoken");

const createSecretToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_HOURS,
  });
};

module.exports = createSecretToken;