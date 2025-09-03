import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user_id: mongoose.Types.ObjectId;
  items: Array<{
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    customization_options?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
  }>;
  total: number;
  created_at: Date;
  updated_at: Date;
}

const cartSchema = new Schema<ICart>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [{
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customization_options: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  }],
  total: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes are already defined in the schema fields above

// Virtual for item count
cartSchema.virtual('item_count').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICart>('Cart', cartSchema); 