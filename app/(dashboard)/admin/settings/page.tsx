'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  DollarSign,
  Bell,
  Shield,
  Truck,
  Loader2,
  RefreshCw,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/db/audit-logs';
import { toast } from 'sonner';

const ALLOWED_ROLES = ['admin', 'director'];

interface SystemSettings {
  // Security Settings
  inactivityTimeout: number; // seconds
  maxLoginAttempts: number;
  sessionDuration: number; // hours
  requireMfaForAdmin: boolean;

  // Business Settings
  expressMultiplier: number;
  defaultPaymentMethod: string;
  taxRate: number;
  currencySymbol: string;

  // Reminder Settings
  reminderIntervals: {
    '7days': boolean;
    '14days': boolean;
    '30days': boolean;
    monthly: boolean;
  };
  disposalThresholdDays: number;

  // Delivery Classification
  deliveryClassification: {
    small: {
      maxGarments: number;
      maxWeight: number;
      maxValue: number;
    };
    bulk: {
      minGarments: number;
    };
  };

  // Notification Settings
  enableWhatsAppNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;

  // Metadata
  updatedBy?: string;
  updatedAt?: Timestamp;
}

const DEFAULT_SETTINGS: SystemSettings = {
  inactivityTimeout: 600,
  maxLoginAttempts: 5,
  sessionDuration: 8,
  requireMfaForAdmin: false,
  expressMultiplier: 1.5,
  defaultPaymentMethod: 'cash',
  taxRate: 16,
  currencySymbol: 'KES',
  reminderIntervals: {
    '7days': true,
    '14days': true,
    '30days': true,
    monthly: true,
  },
  disposalThresholdDays: 90,
  deliveryClassification: {
    small: {
      maxGarments: 5,
      maxWeight: 10,
      maxValue: 5000,
    },
    bulk: {
      minGarments: 6,
    },
  },
  enableWhatsAppNotifications: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false,
};

export default function SystemSettingsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Access control
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  // Fetch settings
  useEffect(() => {
    if (userData && ALLOWED_ROLES.includes(userData.role)) {
      fetchSettings();
    }
  }, [userData]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'system_settings', 'global');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() } as SystemSettings);
      } else {
        // Create default settings if not exists
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      const settingsRef = doc(db, 'system_settings', 'global');
      const updatedSettings = {
        ...settings,
        updatedBy: userData.uid,
        updatedAt: Timestamp.now(),
      };

      await setDoc(settingsRef, updatedSettings);

      // Create audit log
      await createAuditLog(
        'update',
        'system_settings',
        'global',
        userData.uid,
        userData.name || userData.email || 'Unknown',
        userData.role,
        'Updated system settings',
        userData.branchId
      );

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNestedSettings = <K extends keyof SystemSettings>(
    parentKey: K,
    childKey: string,
    value: unknown
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as Record<string, unknown>),
        [childKey]: value,
      },
    }));
    setHasChanges(true);
  };

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title="System Settings"
        description="Configure system-wide settings and preferences"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSettings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving || !hasChanges}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        }
      />

      {hasChanges && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800">You have unsaved changes</span>
        </div>
      )}

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="business">
            <DollarSign className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <Clock className="w-4 h-4 mr-2" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="w-4 h-4 mr-2" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security-related settings for user sessions and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="inactivityTimeout">Inactivity Timeout (seconds)</Label>
                  <Input
                    id="inactivityTimeout"
                    type="number"
                    value={settings.inactivityTimeout}
                    onChange={(e) => updateSettings('inactivityTimeout', parseInt(e.target.value) || 600)}
                    min={60}
                    max={3600}
                  />
                  <p className="text-xs text-gray-500">
                    Auto-lock after {Math.round(settings.inactivityTimeout / 60)} minutes of inactivity
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSettings('maxLoginAttempts', parseInt(e.target.value) || 5)}
                    min={3}
                    max={10}
                  />
                  <p className="text-xs text-gray-500">
                    Account lockout after {settings.maxLoginAttempts} failed attempts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
                  <Input
                    id="sessionDuration"
                    type="number"
                    value={settings.sessionDuration}
                    onChange={(e) => updateSettings('sessionDuration', parseInt(e.target.value) || 8)}
                    min={1}
                    max={24}
                  />
                  <p className="text-xs text-gray-500">Auto-logout after {settings.sessionDuration} hours</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Require MFA for Admins</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enforce multi-factor authentication for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireMfaForAdmin}
                    onCheckedChange={(checked) => updateSettings('requireMfaForAdmin', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure pricing, tax, and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expressMultiplier">Express Service Multiplier</Label>
                  <Input
                    id="expressMultiplier"
                    type="number"
                    step="0.1"
                    value={settings.expressMultiplier}
                    onChange={(e) => updateSettings('expressMultiplier', parseFloat(e.target.value) || 1.5)}
                    min={1}
                    max={3}
                  />
                  <p className="text-xs text-gray-500">
                    Express orders are {settings.expressMultiplier}x normal price
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.5"
                    value={settings.taxRate}
                    onChange={(e) => updateSettings('taxRate', parseFloat(e.target.value) || 16)}
                    min={0}
                    max={50}
                  />
                  <p className="text-xs text-gray-500">VAT rate applied to orders</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => updateSettings('currencySymbol', e.target.value)}
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                  <select
                    id="defaultPaymentMethod"
                    className="w-full p-2 border rounded-md"
                    value={settings.defaultPaymentMethod}
                    onChange={(e) => updateSettings('defaultPaymentMethod', e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminder Settings */}
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Reminder Settings</CardTitle>
              <CardDescription>Configure automated customer reminder schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Reminder Intervals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>7 Days</Label>
                      <p className="text-xs text-gray-500">First reminder</p>
                    </div>
                    <Switch
                      checked={settings.reminderIntervals['7days']}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('reminderIntervals', '7days', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>14 Days</Label>
                      <p className="text-xs text-gray-500">Second reminder</p>
                    </div>
                    <Switch
                      checked={settings.reminderIntervals['14days']}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('reminderIntervals', '14days', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>30 Days</Label>
                      <p className="text-xs text-gray-500">Final standard</p>
                    </div>
                    <Switch
                      checked={settings.reminderIntervals['30days']}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('reminderIntervals', '30days', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Monthly</Label>
                      <p className="text-xs text-gray-500">After 30 days</p>
                    </div>
                    <Switch
                      checked={settings.reminderIntervals.monthly}
                      onCheckedChange={(checked) =>
                        updateNestedSettings('reminderIntervals', 'monthly', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="disposalThreshold">Disposal Threshold (days)</Label>
                <Input
                  id="disposalThreshold"
                  type="number"
                  value={settings.disposalThresholdDays}
                  onChange={(e) => updateSettings('disposalThresholdDays', parseInt(e.target.value) || 90)}
                  min={30}
                  max={365}
                />
                <p className="text-xs text-gray-500">
                  Orders become eligible for disposal after {settings.disposalThresholdDays} days
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Classification</CardTitle>
              <CardDescription>
                Configure automatic delivery classification rules (Small vs Bulk)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Small Delivery (Motorcycle)</h4>
                  <p className="text-sm text-gray-500">Orders classified as small if ANY condition is met</p>

                  <div className="space-y-2">
                    <Label>Max Garments</Label>
                    <Input
                      type="number"
                      value={settings.deliveryClassification.small.maxGarments}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          deliveryClassification: {
                            ...prev.deliveryClassification,
                            small: {
                              ...prev.deliveryClassification.small,
                              maxGarments: parseInt(e.target.value) || 5,
                            },
                          },
                        }))
                      }
                      min={1}
                      max={20}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Weight (kg)</Label>
                    <Input
                      type="number"
                      value={settings.deliveryClassification.small.maxWeight}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          deliveryClassification: {
                            ...prev.deliveryClassification,
                            small: {
                              ...prev.deliveryClassification.small,
                              maxWeight: parseInt(e.target.value) || 10,
                            },
                          },
                        }))
                      }
                      min={1}
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Value (KES)</Label>
                    <Input
                      type="number"
                      value={settings.deliveryClassification.small.maxValue}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          deliveryClassification: {
                            ...prev.deliveryClassification,
                            small: {
                              ...prev.deliveryClassification.small,
                              maxValue: parseInt(e.target.value) || 5000,
                            },
                          },
                        }))
                      }
                      min={1000}
                      max={100000}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Bulk Delivery (Van)</h4>
                  <p className="text-sm text-gray-500">Orders classified as bulk if exceeding small limits</p>

                  <div className="space-y-2">
                    <Label>Min Garments for Bulk</Label>
                    <Input
                      type="number"
                      value={settings.deliveryClassification.bulk.minGarments}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          deliveryClassification: {
                            ...prev.deliveryClassification,
                            bulk: {
                              ...prev.deliveryClassification.bulk,
                              minGarments: parseInt(e.target.value) || 6,
                            },
                          },
                        }))
                      }
                      min={2}
                      max={50}
                    />
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Orders with {settings.deliveryClassification.bulk.minGarments}+ garments, or exceeding{' '}
                      {settings.deliveryClassification.small.maxWeight}kg, or valued above KES{' '}
                      {settings.deliveryClassification.small.maxValue.toLocaleString()} will be classified
                      as bulk deliveries.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification channels for customer communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">WhatsApp Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Send order updates via WhatsApp (Wati.io)
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableWhatsAppNotifications}
                    onCheckedChange={(checked) => updateSettings('enableWhatsAppNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">Send order updates via email (Resend)</p>
                  </div>
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => updateSettings('enableEmailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">Send order updates via SMS (fallback)</p>
                  </div>
                  <Switch
                    checked={settings.enableSmsNotifications}
                    onCheckedChange={(checked) => updateSettings('enableSmsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
