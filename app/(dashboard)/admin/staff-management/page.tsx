/**
 * Staff Management Page
 *
 * Admin dashboard page for managing staff accounts.
 * Features:
 *   - List all staff with search and filtering
 *   - Add new staff accounts
 *   - Edit existing staff accounts
 *   - International phone number support
 *   - Role-based access (admin/director only)
 *
 * @module app/(dashboard)/admin/staff-management
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Filter, Search, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

// ============================================
// TYPES
// ============================================

type UserRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'front_desk'
  | 'driver';

interface StaffMember {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId: string;
  active: boolean;
  createdAt?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  director: 'Director',
  general_manager: 'General Manager',
  store_manager: 'Store Manager',
  workstation_manager: 'Workstation Manager',
  workstation_staff: 'Workstation Staff',
  front_desk: 'Front Desk',
  driver: 'Driver',
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function StaffManagementPage() {
  const { userData } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Fetch staff list
  useEffect(() => {
    fetchStaff();
  }, [roleFilter]);

  async function fetchStaff() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`/api/admin/staff?${params}`);
      const data = await response.json();

      if (response.ok && data.staff) {
        setStaff(data.staff);
      } else {
        console.error('Failed to fetch staff:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter by search term
  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  // Check if user has access (admin or director only)
  if (userData && userData.role !== 'admin' && userData.role !== 'director') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">
                Only administrators and directors can access staff management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600">Manage staff accounts and permissions</p>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <AddStaffForm
              onSuccess={() => {
                setShowAddModal(false);
                fetchStaff();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="general_manager">General Manager</SelectItem>
                <SelectItem value="store_manager">Store Manager</SelectItem>
                <SelectItem value="front_desk">Front Desk</SelectItem>
                <SelectItem value="workstation_manager">Workstation Manager</SelectItem>
                <SelectItem value="workstation_staff">Workstation Staff</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading staff...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No staff members found</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Branch</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.uid} className="border-b last:border-0">
                      <td className="py-3">{member.name}</td>
                      <td className="py-3 text-gray-600">{member.email}</td>
                      <td className="py-3 text-gray-600">{member.phone}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs rounded bg-gray-100">
                          {ROLE_LABELS[member.role]}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{member.branchId}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            member.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingStaff(member)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <EditStaffForm
                              staff={member}
                              onSuccess={() => {
                                setEditingStaff(null);
                                fetchStaff();
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ADD STAFF FORM
// ============================================

function AddStaffForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'front_desk' as UserRole,
    branchId: 'BR-MAIN-001',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          branchId: formData.branchId,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to create staff account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add New Staff Member</DialogTitle>
      </DialogHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name*</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label>Email*</Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="staff@lorenzo.com"
          />
        </div>
      </div>

      <div>
        <Label>Phone* (International format)</Label>
        <Input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+254712345678 or +12025550123"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: +[country code][number] (e.g., +254712345678 for Kenya, +12025550123 for US)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role*</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front_desk">Front Desk</SelectItem>
              <SelectItem value="workstation_staff">Workstation Staff</SelectItem>
              <SelectItem value="workstation_manager">Workstation Manager</SelectItem>
              <SelectItem value="store_manager">Store Manager</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="general_manager">General Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Branch ID*</Label>
          <Input
            required
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            placeholder="BR-MAIN-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Password*</Label>
          <Input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={8}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <Label>Confirm Password*</Label>
          <Input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Re-enter password"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Staff Account'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// EDIT STAFF FORM
// ============================================

function EditStaffForm({
  staff,
  onSuccess,
}: {
  staff: StaffMember;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: staff.name,
    phone: staff.phone,
    role: staff.role,
    branchId: staff.branchId,
    active: staff.active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: staff.uid,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to update staff account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit Staff Member</DialogTitle>
      </DialogHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <Label>Email (cannot be changed)</Label>
        <Input value={staff.email} disabled className="bg-gray-50" />
        <p className="text-xs text-gray-500 mt-1">
          Email addresses cannot be changed after account creation
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name*</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Phone*</Label>
          <Input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+254712345678"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role*</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front_desk">Front Desk</SelectItem>
              <SelectItem value="workstation_staff">Workstation Staff</SelectItem>
              <SelectItem value="workstation_manager">Workstation Manager</SelectItem>
              <SelectItem value="store_manager">Store Manager</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="general_manager">General Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Branch ID*</Label>
          <Input
            required
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4"
          id="active-checkbox"
        />
        <Label htmlFor="active-checkbox">Active (staff can login)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Staff Account'}
        </Button>
      </div>
    </form>
  );
}
