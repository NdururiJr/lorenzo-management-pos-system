/**
 * Dashboard Home Page
 *
 * Main dashboard page showing user info and basic navigation.
 * Verifies authentication is working.
 *
 * @module app/(dashboard)/dashboard/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LogOut, User, Mail, Phone, Building2, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, signOut, isAdmin, isManager, isStaff, isCustomer } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (_error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user || !userData) {
    return null;
  }

  const initials = userData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userData.name}!
          </p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Separator />

      {/* User Info Card */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Your Profile</CardTitle>
          <CardDescription>
            Your account information and role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-gray-200">
              <AvatarFallback className="bg-black text-white text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-black">{userData.name}</h2>
              <Badge className={getRoleBadgeColor(userData.role)}>
                {getRoleDisplayName(userData.role)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* User Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-mono text-black">{userData.uid.slice(0, 20)}...</p>
                </div>
              </div>

              {userData.email && (
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-black">{userData.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-black">{userData.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="text-black">{getRoleDisplayName(userData.role)}</p>
                </div>
              </div>

              {userData.branchId && (
                <div className="flex items-center space-x-3 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="text-black">{userData.branchId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 text-sm">
                <div className="h-4 w-4" />
                <div>
                  <p className="text-gray-500">Account Status</p>
                  <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Access Info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Access Permissions</CardTitle>
          <CardDescription>
            Features available based on your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-black">Administrator Access</span>
              <Badge variant={isAdmin ? 'default' : 'secondary'}>
                {isAdmin ? 'Granted' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-black">Manager Access</span>
              <Badge variant={isManager || isAdmin ? 'default' : 'secondary'}>
                {isManager || isAdmin ? 'Granted' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-black">Staff Access</span>
              <Badge variant={isStaff ? 'default' : 'secondary'}>
                {isStaff ? 'Granted' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-black">Customer Access</span>
              <Badge variant={isCustomer ? 'default' : 'secondary'}>
                {isCustomer ? 'Granted' : 'Not Available'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Authentication System Active
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your authentication system is working correctly. You are logged in
                and authenticated.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
