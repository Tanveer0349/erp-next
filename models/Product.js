
import mongoose from 'mongoose';

const RecipeItem = new mongoose.Schema({
  rawProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, enum: ['raw','finished'], required: true },
  unit: { type: String, default: 'pcs' },
  recipe: { type: [RecipeItem], default: [] },
  lowStockThreshold: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);