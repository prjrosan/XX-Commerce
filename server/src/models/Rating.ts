import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  user_id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

const ratingSchema = new Schema<IRating>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure one rating per user per order
ratingSchema.index({ user_id: 1, order_id: 1 }, { unique: true });

// Create indexes for better performance
ratingSchema.index({ rating: 1 });
ratingSchema.index({ created_at: -1 });

export default mongoose.model<IRating>('Rating', ratingSchema); 