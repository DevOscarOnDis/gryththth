const mongoose = require("mongoose");


module.exports = mongoose.model("User", new mongoose.Schema({
  id: { type: String },
  registeredAt: { type: Number, default: Date.now() },
  money: { type: Number, default: 0 },
  email: { type: String, default: "No email" },
  emailtoken: { type: String },
  verified: { type: Boolean, default: false },
  invites: { type: Number, default: 0 },
  invite_code: { type: Number },
  invited: { type: Boolean, default: false },
  invites_people: { type: Object },
}));