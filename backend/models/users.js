const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:{ type: String, required:true},
  password: { type: String, required: true },
  userType :{ type: String , required:true}
  // userType : 1 - seller , 0 - buyer
});
/* create table user (username char(10) notnull unique) */
const User = mongoose.model('User', userSchema);

module.exports = User;