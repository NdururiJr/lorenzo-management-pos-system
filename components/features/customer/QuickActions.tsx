/**
 * Quick Actions Component
 *
 * Quick action buttons for common tasks including Request Pickup,
 * Contact Support, Track Orders, and Profile access.
 *
 * @module components/features/customer/QuickActions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ModernCard } from '@/components/modern/ModernCard';
import { Package, MessageCircle, Truck, User } from 'lucide-react';
import { RequestPickupModal } from './RequestPickupModal';

const BRANCH_PHONE = '+254725462859'; // Lorenzo Dry Cleaners contact
const WHATSAPP_MESSAGE = 'Hello! I need help with my order.';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: typeof Package;
  color: string;
  action: 'link' | 'modal' | 'whatsapp';
  href?: string;
}

const ACTIONS: QuickAction[] = [
  {
    id: 'request-pickup',
    label: 'Request Pickup',
    description: 'Schedule pickup',
    icon: Truck,
    color: 'bg-brand-blue-50 text-brand-blue border-brand-blue-100',
    action: 'modal',
  },
  {
    id: 'track-order',
    label: 'Track Order',
    description: 'View orders',
    icon: Package,
    color: 'bg-green-50 text-green-600 border-green-200',
    action: 'link',
    href: '/portal/orders',
  },
  {
    id: 'contact-support',
    label: 'Contact Us',
    description: 'Get help',
    icon: MessageCircle,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    action: 'whatsapp',
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Edit details',
    icon: User,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    action: 'link',
    href: '/profile',
  },
];

export function QuickActions() {
  const [showPickupModal, setShowPickupModal] = useState(false);

  const handleActionClick = (action: QuickAction) => {
    if (action.action === 'modal') {
      setShowPickupModal(true);
    } else if (action.action === 'whatsapp') {
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${BRANCH_PHONE.replace(/\+/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon;

            if (action.action === 'link' && action.href) {
              return (
                <Link key={action.id} href={action.href}>
                  <ModernCard
                    className={`!p-4 hover:shadow-glow-blue transition-all cursor-pointer hover:scale-[1.02] border ${action.color}`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-semibold text-sm">{action.label}</div>
                        <div className="text-xs opacity-80 hidden sm:block">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                </Link>
              );
            }

            return (
              <ModernCard
                key={action.id}
                className={`!p-4 hover:shadow-glow-blue transition-all cursor-pointer hover:scale-[1.02] border ${action.color}`}
                onClick={() => handleActionClick(action)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold text-sm">{action.label}</div>
                    <div className="text-xs opacity-80 hidden sm:block">
                      {action.description}
                    </div>
                  </div>
                </div>
              </ModernCard>
            );
          })}
        </div>
      </div>

      {/* Request Pickup Modal */}
      <RequestPickupModal
        open={showPickupModal}
        onClose={() => setShowPickupModal(false)}
      />
    </>
  );
}
