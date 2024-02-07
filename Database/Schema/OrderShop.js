const mongoose = require("mongoose");

module.exports = mongoose.model("OrderShop", new mongoose.Schema({
    userID: { type: String, required: true },
}));