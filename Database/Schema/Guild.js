const mongoose = require("mongoose"),
    config = require("./../../config.js");

module.exports = mongoose.model("prodact", new mongoose.Schema({

    id: { type: String }, //ID of the guild
    registeredAt: { type: Number, default: Date.now() },
    price: { type: Number, default: 0 },
    name: { type: String, default: "No name" },
    description: { type: String, default: "No description" },
    image: { type: String, default: "No image" },
    category: { type: String, default: "No category" },
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    

}));