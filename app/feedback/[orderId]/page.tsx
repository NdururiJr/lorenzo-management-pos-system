/**
 * Customer Feedback Form Page
 *
 * Public page for customers to submit feedback via QR code on receipts.
 * Accessible without authentication.
 *
 * @module app/feedback/[orderId]/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createFeedback,
  hasFeedback,
  getStaffForOrder,
} from '@/lib/db/feedback';
import type { ProcessingStage, StaffRating } from '@/lib/db/schema';

interface StaffMember {
  staffId: string;
  staffName: string;
  stage: ProcessingStage;
}

export default function FeedbackPage() {
  const params = useParams();
  const _router = useRouter();
  const orderId = params.orderId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [staffRatings, setStaffRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  // Check if feedback already exists
  useEffect(() => {
    async function checkExisting() {
      try {
        const exists = await hasFeedback(orderId);
        if (exists) {
          setAlreadySubmitted(true);
        }

        // Get staff who handled the order
        const staff = await getStaffForOrder(orderId);
        setStaffMembers(staff);
      } catch (err) {
        console.error('Error checking feedback:', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      checkExisting();
    }
  }, [orderId]);

  // Handle staff rating change
  const handleStaffRating = (staffId: string, rating: number) => {
    setStaffRatings(prev => ({
      ...prev,
      [staffId]: rating,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      setError('Please select an overall rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build staff ratings array
      const staffRatingsArray: StaffRating[] = Object.entries(staffRatings)
        .filter(([_, rating]) => rating > 0)
        .map(([staffId, rating]) => {
          const staff = staffMembers.find(s => s.staffId === staffId);
          return {
            staffId,
            staffName: staff?.staffName || 'Unknown',
            stage: staff?.stage || 'reception',
            rating,
          };
        });

      await createFeedback({
        orderId,
        customerId: '', // Will be filled from order data
        branchId: '', // Will be filled from order data
        overallRating,
        staffRatings: staffRatingsArray.length > 0 ? staffRatingsArray : undefined,
        source: 'qr_code',
        comment: comment || undefined,
        wouldRecommend: wouldRecommend ?? undefined,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({
    value,
    onChange,
    size = 'md',
  }: {
    value: number;
    onChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-black mb-2">
                Feedback Already Received
              </h2>
              <p className="text-gray-600">
                Thank you! We have already received your feedback for this order.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-black mb-2">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-4">
                Your feedback has been submitted successfully.
                We appreciate you taking the time to share your experience.
              </p>
              <div className="flex gap-2 justify-center mt-6">
                {[...Array(overallRating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Feedback form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">
            Lorenzo Dry Cleaners
          </h1>
          <p className="text-gray-600 mt-1">
            We&apos;d love to hear about your experience
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Overall Rating */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Overall Rating</CardTitle>
              <CardDescription>
                How would you rate your overall experience?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <StarRating
                  value={overallRating}
                  onChange={setOverallRating}
                  size="lg"
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {overallRating === 0 && 'Tap a star to rate'}
                {overallRating === 1 && 'Poor'}
                {overallRating === 2 && 'Fair'}
                {overallRating === 3 && 'Good'}
                {overallRating === 4 && 'Very Good'}
                {overallRating === 5 && 'Excellent'}
              </p>
            </CardContent>
          </Card>

          {/* Staff Ratings */}
          {staffMembers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Rate Our Team</CardTitle>
                <CardDescription>
                  How did each team member handle your items? (Optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffMembers.map(staff => (
                  <div key={staff.staffId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black">{staff.staffName}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {staff.stage.replace('_', ' ')}
                      </p>
                    </div>
                    <StarRating
                      value={staffRatings[staff.staffId] || 0}
                      onChange={rating => handleStaffRating(staff.staffId, rating)}
                      size="sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Would Recommend */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Would You Recommend Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant={wouldRecommend === true ? 'default' : 'outline'}
                  onClick={() => setWouldRecommend(true)}
                  className={wouldRecommend === true ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  Yes, definitely!
                </Button>
                <Button
                  type="button"
                  variant={wouldRecommend === false ? 'default' : 'outline'}
                  onClick={() => setWouldRecommend(false)}
                  className={wouldRecommend === false ? 'bg-gray-500 hover:bg-gray-600' : ''}
                >
                  Maybe not
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Additional Comments
              </CardTitle>
              <CardDescription>
                Share any additional thoughts or suggestions (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || overallRating === 0}
            className="w-full bg-black hover:bg-gray-800 text-white h-12 text-lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>

          {/* Order Reference */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Order: {orderId}
          </p>
        </form>
      </div>
    </div>
  );
}
