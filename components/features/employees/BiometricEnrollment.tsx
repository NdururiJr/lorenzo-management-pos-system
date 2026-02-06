/**
 * Biometric Enrollment Component
 *
 * UI for managing employee biometric IDs.
 * Allows enrolling new biometric IDs and removing existing ones.
 *
 * @module components/features/employees/BiometricEnrollment
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Fingerprint,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  enrollEmployee,
  unenrollBiometricId,
} from '@/services/biometric';
import type { BiometricVendor } from '@/lib/db/schema';

interface BiometricEnrollmentProps {
  /** Employee ID to manage biometric IDs for */
  employeeId: string;
  /** Employee name for display */
  employeeName: string;
  /** Current biometric IDs */
  biometricIds?: string[];
  /** Whether the employee is enrolled */
  biometricEnrolled?: boolean;
  /** Callback when enrollment changes */
  onEnrollmentChange?: () => void;
  /** Display mode */
  mode?: 'card' | 'inline';
}

const VENDOR_OPTIONS: { value: BiometricVendor; label: string; description: string }[] = [
  { value: 'zkteco', label: 'ZKTeco', description: 'Most common biometric devices' },
  { value: 'suprema', label: 'Suprema', description: 'Premium biometric solutions' },
  { value: 'hikvision', label: 'Hikvision', description: 'Security cameras & devices' },
  { value: 'generic', label: 'Generic/Other', description: 'Other compatible devices' },
];

export function BiometricEnrollment({
  employeeId,
  employeeName,
  biometricIds = [],
  biometricEnrolled = false,
  onEnrollmentChange,
  mode = 'card',
}: BiometricEnrollmentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBiometricId, setNewBiometricId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<BiometricVendor>('zkteco');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Enroll biometric ID mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!newBiometricId.trim()) {
        throw new Error('Biometric ID is required');
      }
      return enrollEmployee(employeeId, newBiometricId.trim());
    },
    onSuccess: () => {
      toast.success('Biometric ID enrolled successfully');
      setNewBiometricId('');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onEnrollmentChange?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll biometric ID');
    },
  });

  // Unenroll biometric ID mutation
  const unenrollMutation = useMutation({
    mutationFn: async (biometricId: string) => {
      return unenrollBiometricId(employeeId, biometricId);
    },
    onSuccess: () => {
      toast.success('Biometric ID removed successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onEnrollmentChange?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove biometric ID');
    },
  });

  const content = (
    <>
      {/* Status Banner */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg mb-4',
          biometricEnrolled
            ? 'bg-green-50 text-green-800'
            : 'bg-amber-50 text-amber-800'
        )}
      >
        {biometricEnrolled ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-medium">Biometric Enrolled</p>
              <p className="text-sm opacity-80">
                {biometricIds.length} ID{biometricIds.length !== 1 ? 's' : ''} registered
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Not Enrolled</p>
              <p className="text-sm opacity-80">
                Add a biometric ID to enable clock-in
              </p>
            </div>
          </>
        )}
      </div>

      {/* Current Biometric IDs */}
      {biometricIds.length > 0 && (
        <div className="mb-4">
          <Label className="text-sm text-gray-500 mb-2 block">
            Registered Biometric IDs
          </Label>
          <div className="space-y-2">
            {biometricIds.map((id, index) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-mono text-sm">{id}</p>
                    <p className="text-xs text-gray-500">ID #{index + 1}</p>
                  </div>
                </div>
                <AlertDialog open={deleteId === id} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Biometric ID?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the biometric ID <strong className="font-mono">{id}</strong> from {employeeName}.
                        They will no longer be able to clock in using this ID.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => unenrollMutation.mutate(id)}
                        disabled={unenrollMutation.isPending}
                      >
                        {unenrollMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Biometric ID */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant={biometricIds.length > 0 ? 'outline' : 'default'}>
            <Plus className="w-4 h-4 mr-2" />
            {biometricIds.length > 0 ? 'Add Another ID' : 'Enroll Biometric ID'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Enroll Biometric ID
            </DialogTitle>
            <DialogDescription>
              Enter the biometric ID from the device to link it to {employeeName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Biometric ID Input */}
            <div className="space-y-2">
              <Label htmlFor="biometric-id">Biometric ID</Label>
              <Input
                id="biometric-id"
                placeholder="e.g., 12345 or ABC123"
                value={newBiometricId}
                onChange={(e) => setNewBiometricId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                This is the unique ID stored in the biometric device when the employee
                registers their fingerprint or face.
              </p>
            </div>

            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Device Vendor</Label>
              <Select value={selectedVendor} onValueChange={(v) => setSelectedVendor(v as BiometricVendor)}>
                <SelectTrigger id="vendor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_OPTIONS.map((vendor) => (
                    <SelectItem key={vendor.value} value={vendor.value}>
                      <div>
                        <p className="font-medium">{vendor.label}</p>
                        <p className="text-xs text-gray-500">{vendor.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">How to find the Biometric ID</p>
                <ol className="mt-1 list-decimal list-inside text-xs space-y-1 opacity-80">
                  <li>Open the biometric device admin panel</li>
                  <li>Navigate to User Management</li>
                  <li>Find or register the employee</li>
                  <li>Copy their User ID / Biometric ID</li>
                </ol>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending || !newBiometricId.trim()}
            >
              {enrollMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Fingerprint className="w-4 h-4 mr-2" />
              )}
              Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Text */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Biometric IDs are used to automatically track attendance when
          employees use fingerprint or face recognition devices.
        </p>
      </div>
    </>
  );

  if (mode === 'inline') {
    return <div className="p-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Biometric Enrollment
        </CardTitle>
        <CardDescription>
          Manage biometric IDs for {employeeName}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
