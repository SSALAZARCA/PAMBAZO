import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Flag, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from './NotificationSystem';
import { useStore } from '../store/useStore';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RatingBreakdown {
  average: number;
  total: number;
  distribution: { [key: number]: number };
}

// Star Rating Component
interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export const StarRating = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              transition-colors duration-200
            `}
          >
            <Star
              className={`
                ${sizes[size]}
                ${filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
                }
              `}
            />
          </motion.button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Rating Breakdown Component
interface RatingBreakdownProps {
  breakdown: RatingBreakdown;
}

export const RatingBreakdown = ({ breakdown }: RatingBreakdownProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Calificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{breakdown.average.toFixed(1)}</div>
          <StarRating rating={breakdown.average} readonly size="lg" />
          <p className="text-sm text-muted-foreground mt-1">
            Basado en {breakdown.total} reseñas
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = breakdown.distribution[stars] || 0;
            const percentage = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-8">{stars}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                    className="bg-yellow-400 h-2 rounded-full"
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Review Form Component
interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSubmit: (review: Partial<Review>) => void;
  onCancel: () => void;
}

export const ReviewForm = ({ productId, orderId, onSubmit, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useToast();
  const { user } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      notify.warning('Calificación requerida', 'Por favor selecciona una calificación');
      return;
    }

    if (!title.trim()) {
      notify.warning('Título requerido', 'Por favor escribe un título para tu reseña');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: Partial<Review> = {
        productId,
        orderId: orderId || '',
        rating,
        title: title.trim(),
        comment: comment.trim(),
        userId: user?.id || 'anonymous',
        userName: user?.name || 'Usuario Anónimo',
        verified: !!orderId,
        helpful: 0,
        notHelpful: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await onSubmit(reviewData);
      notify.success('¡Reseña enviada!', 'Gracias por tu opinión');

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
    } catch (error) {
      notify.error('Error', 'No se pudo enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escribir una reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Calificación *
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Título de la reseña *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumen de tu experiencia"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/100 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Comentario
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte los detalles de tu experiencia..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !title.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Review Item Component
interface ReviewItemProps {
  review: Review;
  onHelpful: (reviewId: string, helpful: boolean) => void;
  onReport: (reviewId: string) => void;
}

export const ReviewItem = ({ review, onHelpful, onReport }: ReviewItemProps) => {
  const [userVote, setUserVote] = useState<'helpful' | 'not-helpful' | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleVote = (helpful: boolean) => {
    const newVote = helpful ? 'helpful' : 'not-helpful';
    if (userVote === newVote) {
      setUserVote(null);
    } else {
      setUserVote(newVote);
      onHelpful(review.id, helpful);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b pb-6 last:border-b-0"
    >
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={review.userAvatar} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.userName}</span>
            {review.verified && (
              <Badge variant="secondary" className="text-xs">
                Compra verificada
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} readonly size="sm" />
            <span className="font-medium">{review.title}</span>
          </div>

          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(true)}
                className={`h-8 px-2 ${userVote === 'helpful' ? 'bg-green-100 text-green-700' : ''
                  }`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">{review.helpful}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(false)}
                className={`h-8 px-2 ${userVote === 'not-helpful' ? 'bg-red-100 text-red-700' : ''
                  }`}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                <span className="text-xs">{review.notHelpful}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport(review.id)}
              className="h-8 px-2 text-muted-foreground"
            >
              <Flag className="h-4 w-4 mr-1" />
              <span className="text-xs">Reportar</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Reviews List Component
interface ReviewsListProps {
  reviews: Review[];
  breakdown: RatingBreakdown;
  productId: string;
  canReview?: boolean;
  onAddReview?: (review: Partial<Review>) => void;
}

export const ReviewsList = ({
  reviews,
  breakdown,
  productId,
  canReview = false,
  onAddReview
}: ReviewsListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const notify = useToast();

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const handleAddReview = async (reviewData: Partial<Review>) => {
    if (onAddReview) {
      await onAddReview(reviewData);
      setShowForm(false);
    }
  };

  const handleHelpful = (_reviewId: string, _helpful: boolean) => {
    notify.info('Voto registrado', 'Gracias por tu feedback');
  };

  const handleReport = (_reviewId: string) => {
    notify.info('Reporte enviado', 'Revisaremos esta reseña');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RatingBreakdown breakdown={breakdown} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Reseñas ({reviews.length})
            </h3>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="highest">Mejor calificadas</option>
                <option value="lowest">Peor calificadas</option>
                <option value="helpful">Más útiles</option>
              </select>

              {canReview && (
                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Escribir reseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nueva reseña</DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      productId={productId}
                      onSubmit={handleAddReview}
                      onCancel={() => setShowForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {sortedReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onHelpful={handleHelpful}
                  onReport={handleReport}
                />
              ))}
            </AnimatePresence>

            {reviews.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay reseñas aún</p>
                <p className="text-sm">¡Sé el primero en dejar una reseña!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  StarRating,
  RatingBreakdown,
  ReviewForm,
  ReviewItem,
  ReviewsList
};