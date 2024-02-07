const mongoose = require("mongoose");

module.exports = mongoose.model("Accept", new mongoose.Schema({
    ShopID: { type: String, required: true },
    productID: { type: Number, required: true }
}));