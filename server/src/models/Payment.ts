import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order_id: mongoose.Types.ObjectId;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'paypay' | 'bank_transfer' | 'cash_on_delivery';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  payment_details: Record<string, any>;
  transaction_id?: string;
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const paymentSchema = new Schema<IPayment>({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'paypay', 'bank_transfer', 'cash_on_delivery']
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_details: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  transaction_id: {
    type: String,
    trim: true
  },
  payment_date: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ payment_status: 1 });
paymentSchema.index({ payment_method: 1 });
paymentSchema.index({ created_at: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema); 