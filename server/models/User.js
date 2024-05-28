const userSchema = {
    username: { type: String, unique: false, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  };
  
  module.exports = userSchema;
