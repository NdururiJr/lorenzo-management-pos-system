'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import {
  createPermissionRequest,
  PERMISSION_REQUEST_TYPES,
  PermissionRequestType
} from '@/lib/db/permission-requests';

interface CreatePermissionRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess?: () => void;
}

export function CreatePermissionRequestModal({
  open,
  onOpenChange,
  branchId,
  branchName,
  onSuccess
}: CreatePermissionRequestModalProps) {
  const { user, userData } = useAuth();
  const [type, setType] = useState<PermissionRequestType>('expense');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    setSubmitting(true);
    setError(null);

    try {
      await createPermissionRequest({
        requestedBy: user.uid,
        requestedByName: userData.name || 'Unknown',
        branchId,
        branchName,
        type,
        reason,
        ...(amount && { amount: parseFloat(amount) })
      });

      // Reset form
      setType('expense');
      setReason('');
      setAmount('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error creating permission request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showAmountField = ['expense', 'discount', 'refund', 'equipment'].includes(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Permission Request</DialogTitle>
          <DialogDescription>
            Submit a request for Director approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Request Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PermissionRequestType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERMISSION_REQUEST_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Details</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details about this request..."
              rows={4}
              required
            />
          </div>

          {showAmountField && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Branch:</span> {branchName}
            </p>
            <p className="text-gray-500 mt-1">
              <span className="font-medium text-gray-700">Requested by:</span> {userData?.name}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="bg-lorenzo-teal hover:bg-lorenzo-teal/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
