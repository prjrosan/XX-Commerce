import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  user_id: mongoose.Types.ObjectId;
  seller_id: mongoose.Types.ObjectId;
  product_id?: mongoose.Types.ObjectId;
  messages: Array<{
    sender_id: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
    is_read: boolean;
  }>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const chatSchema = new Schema<IChat>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  messages: [{
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    is_read: {
      type: Boolean,
      default: false
    }
  }],
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
chatSchema.index({ user_id: 1 });
chatSchema.index({ seller_id: 1 });
chatSchema.index({ product_id: 1 });
chatSchema.index({ is_active: 1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Virtual for unread message count
chatSchema.virtual('unread_count').get(function() {
  return this.messages.filter(msg => !msg.is_read).length;
});

// Ensure virtual fields are serialized
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

export default mongoose.model<IChat>('Chat', chatSchema); 