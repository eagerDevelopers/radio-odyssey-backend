const { body } = require("express-validator");

function User(username, passwod, firstName, lastName, email) {
    this.username = username;
    this.password = passwod;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email
}

const signUpUserChain = () => [
    body("username").notEmpty(),
    body("password").isString().notEmpty(),
    body("firstName").isString().notEmpty(),
    body("lastName").isString().notEmpty(),
    body("email").isEmail().notEmpty(),
];

module.exports = { User, signUpUserChain }; 