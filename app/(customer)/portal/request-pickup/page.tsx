/**
 * Request Pickup Page
 *
 * Page for customers to request a pickup for their garments.
 *
 * @module app/(customer)/portal/request-pickup/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCustomer } from '@/lib/db/customers';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
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
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowLeft, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Address } from '@/lib/db/schema';

export default function RequestPickupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  // Fetch customer addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (user?.uid) {
        try {
          const customer = await getCustomer(user.uid);
          setAddresses(customer.addresses || []);
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          setAddresses([]);
        } finally {
          setFetchingAddresses(false);
        }
      }
    }

    fetchAddresses();
  }, [user]);

  // Set minimum date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    if (!preferredDate) {
      setPreferredDate(minDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressIndex || !preferredDate || !preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Integrate with actual pickup scheduling system
      const selectedAddress = addresses[parseInt(selectedAddressIndex)];

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        'Pickup request submitted! We\'ll contact you shortly to confirm.',
        {
          description: `${selectedAddress.label} - ${preferredDate} (${preferredTime})`,
        }
      );

      // Reset form
      setSelectedAddressIndex('');
      setPreferredDate('');
      setPreferredTime('morning');
      setNotes('');

      // Navigate back after success
      setTimeout(() => router.push('/portal'), 1500);
    } catch (error) {
      console.error('Failed to submit pickup request:', error);
      toast.error('Failed to submit pickup request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 pl-0 hover:bg-transparent hover:text-brand-blue"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white shadow-md">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Pickup</h1>
            <p className="text-gray-600 mt-1">
              Schedule a pickup for your garments
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ModernCard>
          <ModernCardContent className="!p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Selection */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Pickup Address <span className="text-red-500">*</span>
                </Label>
                {fetchingAddresses ? (
                  <p className="text-sm text-gray-500">Loading addresses...</p>
                ) : addresses.length > 0 ? (
                  <Select
                    value={selectedAddressIndex}
                    onValueChange={setSelectedAddressIndex}
                    required
                  >
                    <SelectTrigger id="address">
                      <SelectValue placeholder="Select pickup address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((addr, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-brand-blue" />
                            <div>
                              <span className="font-medium">{addr.label}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {addr.address.substring(0, 40)}
                                {addr.address.length > 40 ? '...' : ''}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                    <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      No saved addresses found.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/profile')}
                      className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                    >
                      Add Address in Profile
                    </Button>
                  </div>
                )}
              </div>

              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Preferred Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue" />
                  <Input
                    id="date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Preferred Time */}
              <div className="space-y-2">
                <Label htmlFor="time">
                  Preferred Time <span className="text-red-500">*</span>
                </Label>
                <Select value={preferredTime} onValueChange={setPreferredTime} required>
                  <SelectTrigger id="time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-blue" />
                        Morning (8:00 AM - 12:00 PM)
                      </div>
                    </SelectItem>
                    <SelectItem value="afternoon">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-blue" />
                        Afternoon (12:00 PM - 4:00 PM)
                      </div>
                    </SelectItem>
                    <SelectItem value="evening">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-blue" />
                        Evening (4:00 PM - 6:00 PM)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for pickup (e.g., gate code, specific location)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || addresses.length === 0}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue-dark"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </ModernCardContent>
        </ModernCard>
      </motion.div>
    </ModernSection>
  );
}
