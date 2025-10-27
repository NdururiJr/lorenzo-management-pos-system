/**
 * Inspection Queue Component
 *
 * Shows orders pending detailed workstation inspection (Stage 2).
 * Allows staff to perform comprehensive garment inspection with photo documentation.
 *
 * @module components/features/workstation/InspectionQueue
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClipboardList, Loader2, Inbox, ChevronDown, ChevronUp, Camera, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getOrdersPendingInspection, completeGarmentInspection, markMajorIssue } from '@/lib/db/workstation';
import { updateOrderStatus } from '@/lib/db/orders';
import type { Order, StainDetail, RipDetail } from '@/lib/db/schema';
import { format } from 'date-fns';

export function InspectionQueue() {
  const { user, userData } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inspection form state
  const [conditionAssessment, setConditionAssessment] = useState<'good' | 'minor_issues' | 'major_issues'>('good');
  const [missingButtons, setMissingButtons] = useState<number>(0);
  const [stains, setStains] = useState<StainDetail[]>([]);
  const [rips, setRips] = useState<RipDetail[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
  const [otherAction, setOtherAction] = useState('');
  const [additionalTime, setAdditionalTime] = useState<number>(0);

  // Fetch pending inspection orders
  const { data: pendingOrders = [], refetch, isLoading } = useQuery({
    queryKey: ['pending-inspection', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersPendingInspection(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  const handleToggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setSelectedGarmentIndex(null);
      resetForm();
    } else {
      setExpandedOrder(orderId);
      setSelectedGarmentIndex(null);
      resetForm();
    }
  };

  const handleSelectGarment = (index: number) => {
    setSelectedGarmentIndex(index);
    resetForm();
  };

  const resetForm = () => {
    setConditionAssessment('good');
    setMissingButtons(0);
    setStains([]);
    setRips([]);
    setPhotos([]);
    setRecommendedActions([]);
    setOtherAction('');
    setAdditionalTime(0);
  };

  const handleAddStain = () => {
    setStains([...stains, { location: '', type: '', severity: 'light' }]);
  };

  const handleUpdateStain = (index: number, field: keyof StainDetail, value: string) => {
    const updated = [...stains];
    updated[index] = { ...updated[index], [field]: value };
    setStains(updated);
  };

  const handleRemoveStain = (index: number) => {
    setStains(stains.filter((_, i) => i !== index));
  };

  const handleAddRip = () => {
    setRips([...rips, { location: '', size: '' }]);
  };

  const handleUpdateRip = (index: number, field: keyof RipDetail, value: string) => {
    const updated = [...rips];
    updated[index] = { ...updated[index], [field]: value };
    setRips(updated);
  };

  const handleRemoveRip = (index: number) => {
    setRips(rips.filter((_, i) => i !== index));
  };

  const handleActionToggle = (action: string) => {
    if (recommendedActions.includes(action)) {
      setRecommendedActions(recommendedActions.filter((a) => a !== action));
    } else {
      setRecommendedActions([...recommendedActions, action]);
    }
  };

  const handleSubmitInspection = async (order: Order, garmentIndex: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Validate major issues require photos
    if (conditionAssessment === 'major_issues' && photos.length === 0) {
      toast.error('Photos are required for major issues');
      return;
    }

    setIsSubmitting(true);

    try {
      const garment = order.garments[garmentIndex];

      const inspectionData: any = {
        conditionAssessment,
      };

      if (missingButtons > 0) inspectionData.missingButtonsCount = missingButtons;
      if (stains.length > 0) inspectionData.stainDetails = stains;
      if (rips.length > 0) inspectionData.ripDetails = rips;
      if (photos.length > 0) inspectionData.damagePhotos = photos;
      if (recommendedActions.length > 0) {
        inspectionData.recommendedActions = recommendedActions as any;
      }
      if (otherAction && recommendedActions.includes('other')) {
        inspectionData.recommendedActionsOther = otherAction;
      }
      if (additionalTime > 0) inspectionData.estimatedAdditionalTime = additionalTime;

      await completeGarmentInspection(
        order.orderId,
        garment.garmentId,
        inspectionData,
        user.uid
      );

      // Mark major issue if detected
      if (conditionAssessment === 'major_issues') {
        await markMajorIssue(order.orderId, garment.garmentId);
        toast.warning(
          `Major issues detected on ${garment.type}. Workstation Manager notified for approval.`,
          { duration: 5000 }
        );
      }

      // Check if all garments in order are inspected
      const allInspected = order.garments.every((g, idx) => {
        if (idx === garmentIndex) return true; // Current garment
        return g.inspectionCompleted === true;
      });

      // If all garments inspected, move order to queued
      // Note: Orders with major issues should still move to queued, but require manager approval
      if (allInspected) {
        await updateOrderStatus(order.orderId, 'queued', user.uid);
        toast.success(`Order ${order.orderId} inspection complete! Moved to queue.`);
      } else {
        toast.success(`Garment ${garmentIndex + 1} inspection complete`);
      }

      refetch();
      resetForm();
      setSelectedGarmentIndex(null);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Inbox className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-sm">No orders pending inspection</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Inspection Queue ({pendingOrders.length})
          </CardTitle>
          <CardDescription>
            Perform detailed workstation inspection for each garment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingOrders.map((order) => (
            <div key={order.orderId} className="border rounded-lg">
              {/* Order Header */}
              <button
                onClick={() => handleToggleOrder(order.orderId)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-semibold text-black">{order.orderId}</div>
                    <div className="text-sm text-gray-600">
                      {order.customerName} • {order.garments.length} garment
                      {order.garments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Inspection
                  </Badge>
                  {expandedOrder === order.orderId ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedOrder === order.orderId && (
                <div className="p-4 pt-0 space-y-4">
                  <Separator />

                  {/* Garments List */}
                  <div className="space-y-2">
                    <Label>Select Garment to Inspect:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.garments.map((garment, idx) => (
                        <button
                          key={garment.garmentId}
                          onClick={() => handleSelectGarment(idx)}
                          disabled={garment.inspectionCompleted}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedGarmentIndex === idx
                              ? 'bg-black text-white border-black'
                              : garment.inspectionCompleted
                              ? 'bg-green-50 border-green-200 cursor-not-allowed'
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {garment.type} - {garment.color}
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {garment.brand || 'No brand'}
                              </div>
                            </div>
                            {garment.inspectionCompleted && (
                              <Badge className="bg-green-600 text-white">✓ Done</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inspection Form */}
                  {selectedGarmentIndex !== null && !order.garments[selectedGarmentIndex].inspectionCompleted && (
                    <div className="space-y-6 border-t pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-black mb-2">
                          Inspecting: {order.garments[selectedGarmentIndex].type} -{' '}
                          {order.garments[selectedGarmentIndex].color}
                        </h4>

                        {/* Show initial inspection notes if available */}
                        {order.garments[selectedGarmentIndex].hasNotableDamage && (
                          <Alert className="mt-3">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                              <strong>POS Inspection Notes:</strong>
                              <p className="mt-1 text-sm">
                                {order.garments[selectedGarmentIndex].initialInspectionNotes || 'Notable damage recorded'}
                              </p>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Condition Assessment */}
                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition Assessment *</Label>
                        <Select value={conditionAssessment} onValueChange={(value: any) => setConditionAssessment(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good - No issues</SelectItem>
                            <SelectItem value="minor_issues">Minor Issues - Standard handling</SelectItem>
                            <SelectItem value="major_issues">Major Issues - Requires review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Missing Buttons */}
                      <div className="space-y-2">
                        <Label htmlFor="buttons">Missing Buttons</Label>
                        <Input
                          id="buttons"
                          type="number"
                          min="0"
                          value={missingButtons}
                          onChange={(e) => setMissingButtons(parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      {/* Stains */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Stain Details</Label>
                          <Button type="button" size="sm" variant="outline" onClick={handleAddStain}>
                            + Add Stain
                          </Button>
                        </div>
                        {stains.map((stain, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                            <Input
                              placeholder="Location"
                              value={stain.location}
                              onChange={(e) => handleUpdateStain(idx, 'location', e.target.value)}
                            />
                            <Input
                              placeholder="Type"
                              value={stain.type}
                              onChange={(e) => handleUpdateStain(idx, 'type', e.target.value)}
                            />
                            <Select
                              value={stain.severity}
                              onValueChange={(value: any) => handleUpdateStain(idx, 'severity', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveStain(idx)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Rips */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Rip/Tear Details</Label>
                          <Button type="button" size="sm" variant="outline" onClick={handleAddRip}>
                            + Add Rip
                          </Button>
                        </div>
                        {rips.map((rip, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                            <Input
                              placeholder="Location"
                              value={rip.location}
                              onChange={(e) => handleUpdateRip(idx, 'location', e.target.value)}
                            />
                            <Input
                              placeholder="Size (e.g., 2cm)"
                              value={rip.size}
                              onChange={(e) => handleUpdateRip(idx, 'size', e.target.value)}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveRip(idx)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Photos */}
                      {conditionAssessment === 'major_issues' && (
                        <Alert variant="destructive">
                          <Camera className="w-4 h-4" />
                          <AlertDescription>
                            <strong>Photos Required:</strong> Major issues must be documented with photos.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label>Damage Photos {conditionAssessment === 'major_issues' && <span className="text-red-600">*</span>}</Label>
                        <div className="text-sm text-gray-500">Photo upload placeholder - Firebase Storage integration coming soon</div>
                        <div className="text-xs text-gray-400">{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="space-y-2">
                        <Label>Recommended Actions</Label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={recommendedActions.includes('repair')}
                              onCheckedChange={() => handleActionToggle('repair')}
                            />
                            <span className="text-sm">Repair required</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={recommendedActions.includes('special_treatment')}
                              onCheckedChange={() => handleActionToggle('special_treatment')}
                            />
                            <span className="text-sm">Special treatment needed</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={recommendedActions.includes('standard_process')}
                              onCheckedChange={() => handleActionToggle('standard_process')}
                            />
                            <span className="text-sm">Standard process</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={recommendedActions.includes('other')}
                              onCheckedChange={() => handleActionToggle('other')}
                            />
                            <span className="text-sm">Other (specify below)</span>
                          </label>
                        </div>
                        {recommendedActions.includes('other') && (
                          <Textarea
                            placeholder="Describe other recommended actions... (max 200 words)"
                            value={otherAction}
                            onChange={(e) => setOtherAction(e.target.value)}
                            maxLength={1000}
                            rows={3}
                          />
                        )}
                      </div>

                      {/* Additional Time */}
                      <div className="space-y-2">
                        <Label htmlFor="time">Estimated Additional Time (minutes)</Label>
                        <Input
                          id="time"
                          type="number"
                          min="0"
                          value={additionalTime}
                          onChange={(e) => setAdditionalTime(parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedGarmentIndex(null);
                            resetForm();
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSubmitInspection(order, selectedGarmentIndex)}
                          disabled={isSubmitting || (conditionAssessment === 'major_issues' && photos.length === 0)}
                          className="flex-1 bg-black text-white hover:bg-gray-800"
                        >
                          {isSubmitting ? 'Submitting...' : 'Complete Inspection'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
