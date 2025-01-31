const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true }, // Explicit index
    password: { type: String, required: true },
    roles: {
      type: [{ type: String, enum: ["super-admin", "admin", "merchant", "driver", "customer"] }],
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Password encryption
userSchema.pre("save", async function (next) {
  // Hash password only if modified or new
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password validation
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent duplicate roles in the roles array
userSchema.methods.addRole = function (role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
};

module.exports = mongoose.model("User", userSchema);
