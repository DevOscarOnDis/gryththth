const mongoose = require("mongoose");

module.exports = mongoose.model("Products", new mongoose.Schema({
    id: { type: Number, required: true },
    ShopID: { type: String, required: true },
    name: { type: String, required: true },
    desc: {type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    isShow: { type: Boolean, required: true },
    productEmail: { type: String, required: true },
}));