const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String},
    email: { type: String, required: true},
    // phone: { type: Number},
    password: { type: String, required: true},
    isAdmin: {type: Boolean, default: false, immutable: true},
})

const User = mongoose.model('User', UserSchema)
exports.User = User;