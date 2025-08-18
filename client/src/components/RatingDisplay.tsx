import { Star } from 'lucide-react';
import { Rating, RatingStats } from '../types';

interface RatingDisplayProps {
  rating: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({ rating, showText = false, size = 'md', className = '' }: RatingDisplayProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'md': return 'h-4 w-4';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getRatingText = (rating: number) => {
    const safeRating = rating || 0;
    if (safeRating >= 4.5) return 'Excellent';
    if (safeRating >= 4) return 'Very Good';
    if (safeRating >= 3.5) return 'Good';
    if (safeRating >= 3) return 'Fair';
    if (safeRating >= 2) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${getSizeClasses()} ${
            star <= Math.round(rating || 0) 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-400'
          }`}
        />
      ))}
      {showText && (
        <span className="text-sm text-gray-600 ml-2">
          {(rating || 0).toFixed(1)} ({getRatingText(rating || 0)})
        </span>
      )}
    </div>
  );
}

interface RatingStatsDisplayProps {
  stats: RatingStats;
  className?: string;
}

export function RatingStatsDisplay({ stats, className = '' }: RatingStatsDisplayProps) {
  const totalRatings = stats.total_ratings;
  const averageRating = stats.average_rating || 0;

  const getPercentage = (count: number) => {
    return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Rating */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">{(averageRating || 0).toFixed(1)}</div>
        <RatingDisplay rating={averageRating || 0} size="lg" className="justify-center" />
        <div className="text-sm text-gray-600 mt-1">
          Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[
          { stars: 5, count: stats.five_star, label: '5 stars' },
          { stars: 4, count: stats.four_star, label: '4 stars' },
          { stars: 3, count: stats.three_star, label: '3 stars' },
          { stars: 2, count: stats.two_star, label: '2 stars' },
          { stars: 1, count: stats.one_star, label: '1 star' }
        ].map(({ stars, count, label }) => (
          <div key={stars} className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 w-12">{label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(count)}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RatingCardProps {
  rating: Rating;
  className?: string;
}

export function RatingCard({ rating, className = '' }: RatingCardProps) {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <RatingDisplay rating={rating.rating} size="sm" />
        <span className="text-xs text-gray-500">
          {new Date(rating.created_at).toLocaleDateString()}
        </span>
      </div>
      
      {rating.comment && (
        <p className="text-sm text-gray-700 mt-2">{rating.comment}</p>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        Order #{rating.order_id} • {rating.user_name || 'Anonymous'}
      </div>
    </div>
  );
} 