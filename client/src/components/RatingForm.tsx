import { useState } from 'react';
import { Star, Send, MessageCircle } from 'lucide-react';
import { CreateRatingRequest } from '../types';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface RatingFormProps {
  orderId: number;
  onRatingSubmitted?: () => void;
  onCancel?: () => void;
}

export default function RatingForm({ orderId, onRatingSubmitted, onCancel }: RatingFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData: CreateRatingRequest = {
        order_id: orderId,
        rating,
        comment: comment.trim() || undefined
      };

      const response = await api.post('/ratings', ratingData);
      
      if (response.data.success) {
        toast.success('Thank you for your rating! 🌟');
        onRatingSubmitted?.();
      } else {
        toast.error(response.data.error || 'Failed to submit rating');
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h3>
        <p className="text-blue-200">How was your shopping experience with XX-Commerce?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className={`transition-all duration-200 transform hover:scale-110 ${
                  (hoveredRating || rating) >= star
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-yellow-300'
                }`}
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star 
                  className={`h-12 w-12 ${
                    (hoveredRating || rating) >= star
                      ? 'fill-current'
                      : 'fill-none'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <p className="text-lg font-semibold text-white">
            {getRatingText((hoveredRating || rating || 0) as number)}
          </p>
          
          {rating && (
            <div className="mt-2">
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                    }`}
                  />
                ))}
                <span className="text-blue-200 ml-2">({rating}/5)</span>
              </div>
            </div>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-blue-200 mb-2">
            <MessageCircle className="h-4 w-4 inline mr-1" />
            Share your thoughts (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right mt-1">
            <span className="text-xs text-gray-400">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-slate-600 text-slate-300 hover:bg-slate-700/50 rounded-xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!rating || isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Rating</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Rating Tips */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-200 mb-2">Rating Guide:</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              ))}
            </div>
            <span>Excellent - Perfect experience</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              ))}
            </div>
            <span>Good - Very satisfied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= 3 ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              ))}
            </div>
            <span>Fair - Met expectations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= 2 ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              ))}
            </div>
            <span>Poor - Below expectations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            </div>
            <span>Very Poor - Unsatisfactory</span>
          </div>
        </div>
      </div>
    </div>
  );
} 