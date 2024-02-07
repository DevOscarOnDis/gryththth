const mongoose = require("mongoose"),
    config = require("./../../config.js");

module.exports = mongoose.model("boosts", new mongoose.Schema({

    id: { type: String }, //ID of the guild
    boost : { type: Number, default : 0},
    

}));