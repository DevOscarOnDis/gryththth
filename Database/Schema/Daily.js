const mongoose = require("mongoose"),
    config = require("./../../config.js");

module.exports = mongoose.model("daily", new mongoose.Schema({

    id: { type: String }, //ID of the guild  

}, {
    timestamps: true
}
));