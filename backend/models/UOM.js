import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const UOMSchema = new Schema({
    name: { type: String, required: true }, // e.g. "500gms"
    code: { type: String, required: true, unique: true }, // e.g. "500g"
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const UOM = models.UOM || model("UOM", UOMSchema);

export default UOM;
