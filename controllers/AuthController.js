const User = require("../models/User");
const createSecretToken = require("../utilities/SecretToken")
const bcrypt = require("bcrypt");

const signup = async function (request, response) {
    try {
        const existingUsers = await User.findByUsernameOrEmail(request.body.username, request.body.email);
        if (existingUsers.length != 0) {
            return response.status(401).json({ message: "User already defined in database" });
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(request.body.password, salt);

        const user = new User({
            username: request.body.username,
            password: passwordHash,
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
        });
        await user.save();

        const token = createSecretToken(user._id);
        response.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });
        return response.status(200).json({ message: "User successfully signed up"});
    } catch (error) {
        response.status(500).json({ message: "Error during signup: " + error });
    }    
}

const login = async function (request, response) {
    try {
        const user = await User.findOne({username: request.body.username});
        if (!user) {
            return response.status(404).json({ userAuthenticated: false, message: "User not defined in database"});
        }

        const passwordIsValid = bcrypt.compareSync(request.body.password, user.password);
        if (!passwordIsValid) {
            return response.status(401).send({ userAuthenticated: false, message: "Invalid Password" });
        }

        const token = createSecretToken(user._id);
        response.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });

        return response.status(200).json({ userAuthenticated: true, message: "User successfully signed in"});
    } catch (error) {
        return response.status(500).json({ userAuthenticated: false, message: "Error during login: " + error });
    }
}

module.exports = { signup, login }
