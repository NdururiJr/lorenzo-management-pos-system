/**
 * Major Issues Review Modal Component
 *
 * Modal for Workstation Managers to review and approve garments with major issues.
 * Allows adjusting estimated completion time and approving for processing.
 *
 * @module components/features/workstation/MajorIssuesReviewModal
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { approveGarmentWithMajorIssue } from '@/lib/db/workstation';
import type { Order, Garment } from '@/lib/db/schema';

interface MajorIssuesReviewModalProps {
  order: Order;
  garment: Garment;
  onClose: () => void;
  onApprove: () => void;
}

export function MajorIssuesReviewModal({
  order,
  garment,
  onClose,
  onApprove,
}: MajorIssuesReviewModalProps) {
  const { user } = useAuth();
  const [additionalTime, setAdditionalTime] = useState(garment.estimatedAdditionalTime || 0);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsApproving(true);

    try {
      await approveGarmentWithMajorIssue(
        order.orderId,
        garment.garmentId,
        user.uid,
        additionalTime
      );

      toast.success(
        `Major issues approved for ${garment.type}. ${
          additionalTime > 0 ? `Added ${additionalTime} minutes to processing time.` : ''
        }`
      );

      onApprove();
    } catch (error) {
      console.error('Error approving major issues:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve garment');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Review Major Issues
          </DialogTitle>
          <DialogDescription>
            Review and approve this garment with major issues for processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Major Issues Detected:</strong> This garment requires manager approval before
              it can proceed to processing. Review the issues below and approve if processing should
              continue.
            </AlertDescription>
          </Alert>

          {/* Order & Garment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Order ID:</div>
              <div className="font-semibold text-black">{order.orderId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Customer:</div>
              <div className="font-semibold text-black">{order.customerName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Garment:</div>
              <div className="font-semibold text-black">
                {garment.type} - {garment.color}
              </div>
            </div>
            {garment.brand && (
              <div>
                <div className="text-sm text-gray-600">Brand:</div>
                <div className="font-semibold text-black">{garment.brand}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Inspection Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black">Inspection Report</h3>

            {/* Condition */}
            <div>
              <div className="text-sm text-gray-600 mb-1">Condition Assessment:</div>
              <Badge variant="destructive" className="text-sm">
                Major Issues
              </Badge>
            </div>

            {/* Missing Buttons */}
            {garment.missingButtonsCount && garment.missingButtonsCount > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Missing Buttons:</div>
                <div className="text-black">{garment.missingButtonsCount} buttons</div>
              </div>
            )}

            {/* Stains */}
            {garment.stainDetails && garment.stainDetails.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Stains Detected:</div>
                <div className="space-y-2">
                  {garment.stainDetails.map((stain, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-red-900">
                          {stain.type} - {stain.location}
                        </span>
                        <Badge
                          className={
                            stain.severity === 'heavy'
                              ? 'bg-red-600 text-white'
                              : stain.severity === 'medium'
                              ? 'bg-orange-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }
                        >
                          {stain.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rips/Tears */}
            {garment.ripDetails && garment.ripDetails.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Rips/Tears Detected:</div>
                <div className="space-y-2">
                  {garment.ripDetails.map((rip, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
                    >
                      <div className="font-medium text-red-900">
                        {rip.location} - Size: {rip.size}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {garment.recommendedActions && garment.recommendedActions.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Recommended Actions:</div>
                <div className="flex flex-wrap gap-2">
                  {garment.recommendedActions.map((action, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                      {action.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                {garment.recommendedActionsOther && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                    <div className="font-medium mb-1">Additional Notes:</div>
                    <div>{garment.recommendedActionsOther}</div>
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            {garment.damagePhotos && garment.damagePhotos.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Documentation Photos:</div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <ImageIcon className="w-4 h-4" />
                  <span>{garment.damagePhotos.length} photo(s) attached</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Adjust Processing Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <Label htmlFor="additionalTime" className="text-base">
                Adjust Processing Time
              </Label>
            </div>
            <div className="space-y-2">
              <Input
                id="additionalTime"
                type="number"
                min="0"
                value={additionalTime}
                onChange={(e) => setAdditionalTime(parseInt(e.target.value) || 0)}
                placeholder="Additional minutes needed"
              />
              <p className="text-xs text-gray-500">
                Add extra time (in minutes) to account for special treatment or repairs
              </p>
            </div>
          </div>

          {/* Inspector Info */}
          {garment.inspectionCompletedBy && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">Inspected by:</div>
              <div className="text-sm font-medium text-black">{garment.inspectionCompletedBy}</div>
              {garment.inspectionCompletedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(garment.inspectionCompletedAt.toDate()).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isApproving}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isApproving ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve for Processing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
