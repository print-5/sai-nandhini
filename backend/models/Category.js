import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Performance Indexes
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isActive: 1, order: 1 });

const Category = models.Category || model("Category", CategorySchema);

export default Category;
