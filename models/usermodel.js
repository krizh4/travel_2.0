const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String},
    email: { type: String },
    phone: { type: Number},
})

const User = mongoose.model('Travel20_Users', UserSchema)
exports.User = User;