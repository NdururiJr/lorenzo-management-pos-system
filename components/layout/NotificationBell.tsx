/**
 * Notification Bell Component
 *
 * Displays notification icon with unread count badge.
 * Shows dropdown with recent notifications.
 *
 * @module components/layout/NotificationBell
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'low_stock' | 'critical_stock' | 'order_ready' | 'delivery_complete';
  title: string;
  message: string;
  branchId?: string;
  itemCount?: number;
  items?: Array<{ id: string; name: string; quantity: number }>;
  orderId?: string;
  createdAt: any;
  read: boolean;
}

export function NotificationBell() {
  const { userData } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', userData?.branchId],
    queryFn: async () => {
      if (!userData?.branchId) return [];

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('branchId', '==', userData.branchId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
    },
    enabled: !!userData?.branchId,
    refetchInterval: 60000, // Refetch every minute
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical_stock':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'order_ready':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'delivery_complete':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id);

    // Navigate based on notification type
    if (notification.type === 'low_stock' || notification.type === 'critical_stock') {
      router.push('/inventory');
    } else if (notification.orderId) {
      router.push(`/orders/${notification.orderId}`);
    }

    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  {notification.items && notification.items.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.items.slice(0, 3).map((item) => item.name).join(', ')}
                      {notification.items.length > 3 && ` +${notification.items.length - 3} more`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.createdAt &&
                      format(notification.createdAt.toDate(), 'MMM d, h:mm a')}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
