const {mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    }
});

userSchema.statics.findByUsernameOrEmail = function(username, email) {
    return this.find(
        {$or: [
            {username: username},
            {email: email}
        ]}
    );
};

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;