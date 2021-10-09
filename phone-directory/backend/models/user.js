const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_name: { type: String, required: true },
  password: { type: String, required: true },
  contacts: [{
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    mobile: { type: Number },
    landline: { type: Number },
    email: { type: String },
    notes: { type: String },
    date_added: { type: Date },
    photoUrl: {type: String},
    date_edited: { type: Date },
    views: [{
      viewed_date: { type: String },
      frequency: { type: Number }
    }],
    total_views: { type: Number, default: 0 }
  }]
});

//db schema
module.exports = mongoose.model("user", userSchema);
