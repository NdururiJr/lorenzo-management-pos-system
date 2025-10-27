/**
 * Pickups Page
 *
 * Displays all orders that require garment pickup from customer locations.
 * Allows staff to assign drivers and track pickup status.
 *
 * @module app/(dashboard)/pickups/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { PickupTable } from '@/components/features/pickups/PickupTable';
import { getDocuments } from '@/lib/db';
import { where, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/db/schema';
import { toast } from 'sonner';

export default function PickupsPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Separate state for each tab
  const [pendingPickups, setPendingPickups] = useState<Order[]>([]);
  const [scheduledPickups, setScheduledPickups] = useState<Order[]>([]);
  const [completedPickups, setCompletedPickups] = useState<Order[]>([]);

  // Load pickups on mount and tab change
  useEffect(() => {
    loadPickups();
  }, [activeTab]);

  const loadPickups = async () => {
    try {
      setLoading(true);

      // Base query: orders where collectionMethod === 'pickup_required'
      const baseConstraints = [
        where('collectionMethod', '==', 'pickup_required'),
      ];

      // Add tab-specific filters
      let constraints = [...baseConstraints];

      if (activeTab === 'pending') {
        // Pending: no pickup completion time
        constraints.push(where('pickupCompletedTime', '==', null));
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (activeTab === 'scheduled') {
        // Scheduled: has scheduled time but not completed
        constraints.push(where('pickupCompletedTime', '==', null));
        // Note: Firestore doesn't support filtering on undefined/null for existence
        // We'll filter client-side for pickupScheduledTime
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (activeTab === 'completed') {
        // Completed: has pickup completion time
        // Note: Need to use a different query structure
        constraints = [
          where('collectionMethod', '==', 'pickup_required'),
          orderBy('pickupCompletedTime', 'desc'),
        ];
      }

      const orders = await getDocuments<Order>('orders', ...constraints);

      // Filter results based on tab
      if (activeTab === 'pending') {
        // Pending: no completed time AND no scheduled time
        const filtered = orders.filter(
          (order) => !order.pickupCompletedTime && !order.pickupScheduledTime
        );
        setPendingPickups(filtered);
      } else if (activeTab === 'scheduled') {
        // Scheduled: has scheduled time but not completed
        const filtered = orders.filter(
          (order) => !order.pickupCompletedTime && order.pickupScheduledTime
        );
        setScheduledPickups(filtered);
      } else if (activeTab === 'completed') {
        // Completed: has completion time
        const filtered = orders.filter((order) => order.pickupCompletedTime);
        setCompletedPickups(filtered);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupCompleted = () => {
    // Reload pickups after marking as completed
    loadPickups();
    toast.success('Pickup marked as completed');
  };

  const handleRefresh = () => {
    loadPickups();
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingPickups;
      case 'scheduled':
        return scheduledPickups;
      case 'completed':
        return completedPickups;
      default:
        return [];
    }
  };

  const currentData = getCurrentTabData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Pickups</h1>
        <p className="text-muted-foreground">
          Manage garment pickups from customer locations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Pending Pickup</CardDescription>
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : pendingPickups.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Scheduled Today</CardDescription>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                scheduledPickups.filter((p) => {
                  if (!p.pickupScheduledTime) return false;
                  const scheduledDate = p.pickupScheduledTime.toDate();
                  const today = new Date();
                  return (
                    scheduledDate.toDateString() === today.toDateString()
                  );
                }).length
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Completed Today</CardDescription>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                completedPickups.filter((p) => {
                  if (!p.pickupCompletedTime) return false;
                  const completedDate = p.pickupCompletedTime.toDate();
                  const today = new Date();
                  return (
                    completedDate.toDateString() === today.toDateString()
                  );
                }).length
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pickups Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Pickup Orders</CardTitle>
          <CardDescription>
            View and manage orders requiring garment pickup
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pending
                {pendingPickups.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingPickups.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Scheduled
                {scheduledPickups.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {scheduledPickups.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PickupTable
                  pickups={pendingPickups}
                  onPickupCompleted={handlePickupCompleted}
                  onRefresh={handleRefresh}
                />
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PickupTable
                  pickups={scheduledPickups}
                  onPickupCompleted={handlePickupCompleted}
                  onRefresh={handleRefresh}
                />
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PickupTable
                  pickups={completedPickups}
                  onPickupCompleted={handlePickupCompleted}
                  onRefresh={handleRefresh}
                  showCompleted
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
