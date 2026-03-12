import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const SubCategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const SubCategory = models.SubCategory || model("SubCategory", SubCategorySchema);

export default SubCategory;
