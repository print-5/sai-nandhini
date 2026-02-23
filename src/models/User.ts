import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "staff", "user"],
      default: "customer",
    },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      pincode: String,
      state: String,
    },
  },
  {
    timestamps: true,
    collection: "user",
  },
);

if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}
const User = model("User", UserSchema);

export default User;
