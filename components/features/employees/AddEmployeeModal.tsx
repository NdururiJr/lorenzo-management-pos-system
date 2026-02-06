/**
 * Add Employee Modal Component
 *
 * Comprehensive form for adding new employees with Firebase Auth integration.
 *
 * @module components/features/employees/AddEmployeeModal
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const employeeSchema = z.object({
  displayName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+254\d{9}$/, 'Phone must be in format +254XXXXXXXXX (Kenyan number)')
    .or(z.literal('')),
  role: z.enum([
    'front_desk',
    'workstation_staff',
    'workstation_manager',
    'driver',
    'manager',
    'store_manager',
    'satellite_staff',
  ]),
  branchId: z.string().min(1, 'Branch is required'),
  startDate: z.string().optional(),
  active: z.boolean(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const isSuperAdmin = userData?.isSuperAdmin || false;

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phone: '',
      role: 'front_desk',
      branchId: userData?.branchId || '',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
    },
  });

  // Load branches for super admin
  useEffect(() => {
    async function loadBranches() {
      if (!isSuperAdmin) {
        setLoadingBranches(false);
        return;
      }

      try {
        const allBranches = await getActiveBranches();
        setBranches(allBranches);
      } catch (error) {
        console.error('Error loading branches:', error);
        toast.error('Failed to load branches');
      } finally {
        setLoadingBranches(false);
      }
    }

    if (open) {
      loadBranches();
    }
  }, [open, isSuperAdmin]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        displayName: '',
        email: '',
        phone: '',
        role: 'front_desk',
        branchId: userData?.branchId || '',
        startDate: new Date().toISOString().split('T')[0],
        active: true,
      });
    }
  }, [open, form, userData?.branchId]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeForm) => {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        tempPassword
      );

      const uid = userCredential.user.uid;

      // Create Firestore user document
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phone || null,
        role: data.role,
        branchId: data.branchId,
        branchAccess: [], // Empty array for now
        isSuperAdmin: false,
        status: data.active ? 'active' : 'inactive',
        startDate: data.startDate
          ? Timestamp.fromDate(new Date(data.startDate))
          : Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { uid, email: data.email, tempPassword };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(
        `Employee created! Temporary password: ${result.tempPassword}`,
        {
          duration: 10000,
          description: 'Please share this password securely with the employee.',
        }
      );
      form.reset();
      onOpenChange(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error('Error creating employee:', error);
      const message =
        error.code === 'auth/email-already-in-use'
          ? 'This email is already in use'
          : error.message || 'Failed to create employee';
      toast.error(message);
    },
  });

  const onSubmit = (data: EmployeeForm) => {
    createEmployeeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account with Firebase Authentication credentials.
            A temporary password will be generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+254712345678" {...field} />
                    </FormControl>
                    <FormDescription>Format: +254XXXXXXXXX</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role and Branch */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="front_desk">Front Desk</SelectItem>
                        <SelectItem value="workstation_staff">Workstation Staff</SelectItem>
                        <SelectItem value="workstation_manager">Workstation Manager</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="store_manager">Store Manager</SelectItem>
                        <SelectItem value="satellite_staff">Satellite Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isSuperAdmin || loadingBranches}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isSuperAdmin
                          ? branches.map((branch) => (
                              <SelectItem key={branch.branchId} value={branch.branchId}>
                                {branch.name}
                              </SelectItem>
                            ))
                          : userData?.branchId && (
                              <SelectItem value={userData.branchId}>
                                {userData.branchId}
                              </SelectItem>
                            )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isSuperAdmin
                        ? 'Select the branch for this employee'
                        : 'Branch is locked to your branch'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Employee's official start date</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this account for immediate access
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createEmployeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="bg-black hover:bg-gray-800"
              >
                {createEmployeeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Employee'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
