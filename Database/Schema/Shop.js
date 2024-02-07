const mongoose = require("mongoose");

module.exports = mongoose.model("Shops", new mongoose.Schema({
    id: { type: String, required: true },
    creatorID: { type: Number, required: true },
    creatorEmail: { type: String, default: "No email", required: true },
    followers: { type: Number, required: true, },
    name: { type: String, required: true },
    desc: {type: String, required: true },
    logo: { type: String, required: true },
    banner: { type: String, required: true },
  
}));