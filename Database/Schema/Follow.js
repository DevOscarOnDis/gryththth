const mongoose = require("mongoose");

module.exports = mongoose.model("Follow", new mongoose.Schema({
    userID: { type: String, required: true },
    shopID: { type: String, required: true },
}));