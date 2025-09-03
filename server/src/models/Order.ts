import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user_id: mongoose.Types.ObjectId;
  items: Array<{
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    customization_options?: Record<string, any>;
  }>;
  total_amount: number;
  shipping_address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipping_method: string;
  tracking_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const orderSchema = new Schema<IOrder>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    price: {
      type: Number,
      required: true,
      min: 0
    },
    customization_options: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    }
  }],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  shipping_address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  shipping_method: {
    type: String,
    required: true,
    trim: true
  },
  tracking_number: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ created_at: -1 });

// Virtual for order summary
orderSchema.virtual('item_count').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model<IOrder>('Order', orderSchema); 