/**
 * Settings Page
 *
 * Staff settings and profile management page with teal/gold theme.
 * Includes Account Details and Access Permissions cards moved from Dashboard.
 * Admin users can access AI Configuration settings.
 *
 * @module app/(dashboard)/settings/page
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getRoleDisplayName } from '@/lib/auth/utils';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { ModernBadge, StatusBadge } from '@/components/modern/ModernBadge';
import { AIConfigPanel } from '@/components/features/settings';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield,
  Star, TrendingUp, Users, Package, Cpu
} from 'lucide-react';

export default function SettingsPage() {
  const { user, userData, isAdmin, isManager, isStaff, isCustomer } = useAuth();

  return (
    <PageContainer>
      <SectionHeader
        title="Settings"
        description="Manage your account and system preferences"
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white border border-lorenzo-teal/10">
          <TabsTrigger value="profile" className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white">
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white">
            Account Details
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="ai-config" className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white">
              <Cpu className="h-4 w-4 mr-2" />
              AI Config
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="system" className="data-[state=active]:bg-lorenzo-deep-teal data-[state=active]:text-white">
              System
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-lorenzo-teal/10">
            <CardHeader>
              <CardTitle className="text-lorenzo-dark-teal">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={userData?.name} className="border-lorenzo-teal/20 focus:border-lorenzo-accent-teal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email || ''} disabled className="bg-lorenzo-cream/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={userData?.phone} className="border-lorenzo-teal/20 focus:border-lorenzo-accent-teal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    defaultValue={
                      userData ? getRoleDisplayName(userData.role) : ''
                    }
                    disabled
                    className="bg-lorenzo-cream/50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-lorenzo-accent-teal text-lorenzo-dark-teal hover:bg-lorenzo-accent-teal/90">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ModernCard hover glowIntensity="medium">
                <ModernCardHeader>
                  <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                  <p className="text-sm text-gray-600">Your account information</p>
                </ModernCardHeader>
                <ModernCardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-3 text-sm p-3 rounded-xl bg-lorenzo-cream/50">
                      <div className="p-2 rounded-xl bg-lorenzo-teal/10">
                        <User className="h-4 w-4 text-lorenzo-teal" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">User ID</p>
                        <p className="font-mono text-gray-900 text-sm">{userData?.uid?.slice(0, 20)}...</p>
                      </div>
                    </div>

                    {userData?.email && (
                      <div className="flex items-center space-x-3 text-sm p-3 rounded-xl bg-lorenzo-cream/50">
                        <div className="p-2 rounded-xl bg-lorenzo-teal/10">
                          <Mail className="h-4 w-4 text-lorenzo-teal" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="text-gray-900">{userData.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 text-sm p-3 rounded-xl bg-lorenzo-cream/50">
                      <div className="p-2 rounded-xl bg-lorenzo-teal/10">
                        <Phone className="h-4 w-4 text-lorenzo-teal" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p className="text-gray-900">{userData?.phone}</p>
                      </div>
                    </div>

                    {userData?.branchId && (
                      <div className="flex items-center space-x-3 text-sm p-3 rounded-xl bg-lorenzo-cream/50">
                        <div className="p-2 rounded-xl bg-lorenzo-teal/10">
                          <Building2 className="h-4 w-4 text-lorenzo-teal" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Branch</p>
                          <p className="text-gray-900">{userData.branchId}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 text-sm p-3 rounded-xl bg-lorenzo-cream/50">
                      <div className="p-2 rounded-xl bg-lorenzo-teal/10">
                        <Shield className="h-4 w-4 text-lorenzo-teal" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-500 text-xs">Status:</p>
                        <StatusBadge status={userData?.isActive ? 'active' : 'inactive'} />
                      </div>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </motion.div>

            {/* Access Permissions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ModernCard hover glowIntensity="medium">
                <ModernCardHeader>
                  <h2 className="text-xl font-bold text-gray-900">Access Permissions</h2>
                  <p className="text-sm text-gray-600">Features available based on your role</p>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isAdmin
                          ? 'bg-linear-to-r from-lorenzo-teal/10 to-lorenzo-teal/5 border border-lorenzo-teal/20'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Star className={`h-4 w-4 ${isAdmin ? 'text-lorenzo-teal' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">Administrator</span>
                      </div>
                      <ModernBadge variant={isAdmin ? 'primary' : 'secondary'} size="sm">
                        {isAdmin ? 'Yes' : 'No'}
                      </ModernBadge>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isManager || isAdmin
                          ? 'bg-linear-to-r from-lorenzo-teal/10 to-lorenzo-teal/5 border border-lorenzo-teal/20'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <TrendingUp className={`h-4 w-4 ${isManager || isAdmin ? 'text-lorenzo-teal' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">Manager</span>
                      </div>
                      <ModernBadge variant={isManager || isAdmin ? 'primary' : 'secondary'} size="sm">
                        {isManager || isAdmin ? 'Yes' : 'No'}
                      </ModernBadge>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isStaff
                          ? 'bg-linear-to-r from-lorenzo-teal/10 to-lorenzo-teal/5 border border-lorenzo-teal/20'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className={`h-4 w-4 ${isStaff ? 'text-lorenzo-teal' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">Staff</span>
                      </div>
                      <ModernBadge variant={isStaff ? 'primary' : 'secondary'} size="sm">
                        {isStaff ? 'Yes' : 'No'}
                      </ModernBadge>
                    </div>

                    <div
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isCustomer
                          ? 'bg-linear-to-r from-lorenzo-teal/10 to-lorenzo-teal/5 border border-lorenzo-teal/20'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className={`h-4 w-4 ${isCustomer ? 'text-lorenzo-teal' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">Customer</span>
                      </div>
                      <ModernBadge variant={isCustomer ? 'primary' : 'secondary'} size="sm">
                        {isCustomer ? 'Yes' : 'No'}
                      </ModernBadge>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-lorenzo-teal/10">
            <CardHeader>
              <CardTitle className="text-lorenzo-dark-teal">Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-lorenzo-cream/30">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-lorenzo-cream/30">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive urgent updates via SMS
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end">
                <Button className="bg-lorenzo-accent-teal text-lorenzo-dark-teal hover:bg-lorenzo-accent-teal/90">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="ai-config">
            <AIConfigPanel />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="system">
            <Card className="border-lorenzo-teal/10">
              <CardHeader>
                <CardTitle className="text-lorenzo-dark-teal">System Configuration</CardTitle>
                <CardDescription>
                  Manage global system settings (Admin only).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-lorenzo-teal/10 rounded-lg bg-lorenzo-cream/30 text-center text-gray-500">
                  System configuration settings will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}
