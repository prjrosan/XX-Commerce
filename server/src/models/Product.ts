import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  seller_id: mongoose.Types.ObjectId;
  images: string[];
  specifications: Record<string, any>;
  customization_options: Array<{
    type: string;
    name: string;
    price_adjustment: number;
    available_values: string[];
  }>;
  rating: {
    average: number;
    count: number;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock_quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  seller_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  customization_options: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price_adjustment: {
      type: Number,
      default: 0
    },
    available_values: [{
      type: String,
      trim: true
    }]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller_id: 1 });
productSchema.index({ price: 1 });
productSchema.index({ is_active: 1 });

// Virtual for formatted price
productSchema.virtual('formatted_price').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model<IProduct>('Product', productSchema); 