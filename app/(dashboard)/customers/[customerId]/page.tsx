'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  CreditCard,
  Clock,
  ArrowLeft,
  Edit,
} from 'lucide-react';
import { getCustomer } from '@/lib/db/customers';
import { getOrdersByCustomer } from '@/lib/db/orders';
import type { Customer, Order } from '@/lib/db/schema';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!customerId) return;

    setIsLoading(true);
    try {
      const [customerData, customerOrders] = await Promise.all([
        getCustomer(customerId),
        getOrdersByCustomer(customerId),
      ]);

      setCustomer(customerData);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <User className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Customer Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The customer you are looking for does not exist.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/customers')}
          >
            Back to Customers
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent text-gray-500 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>

      <SectionHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt.toDate())}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button>
              <ShoppingBag className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-medium text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Addresses
                  </p>
                  {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {customer.addresses.map((addr, i) => (
                        <p key={i} className="font-medium text-gray-900">
                          {addr.label}: {addr.address}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No addresses saved</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">Language</span>
                <Badge variant="secondary" className="uppercase">
                  {customer.preferences.language}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">Notifications</span>
                <Badge
                  variant={
                    customer.preferences.notifications ? 'default' : 'secondary'
                  }
                >
                  {customer.preferences.notifications ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {customer.orderCount}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  Total Orders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  Total Spent
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length > 0
                    ? formatDate(orders[0].createdAt.toDate())
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  Last Order
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Tab */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: 'Order ID',
                    accessor: (order) => (
                      <span className="font-medium text-brand-blue">
                        {order.orderId}
                      </span>
                    ),
                  },
                  {
                    header: 'Date',
                    accessor: (order) => formatDate(order.createdAt.toDate()),
                  },
                  {
                    header: 'Status',
                    accessor: (order) => (
                      <Badge variant="outline" className="capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Items',
                    accessor: (order) => order.garments.length,
                  },
                  {
                    header: 'Amount',
                    accessor: (order) => formatCurrency(order.totalAmount),
                  },
                  {
                    header: 'Action',
                    accessor: (order) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                      >
                        View
                      </Button>
                    ),
                  },
                ]}
                data={orders}
                isLoading={isLoading}
                emptyState={{
                  icon: ShoppingBag,
                  heading: 'No orders yet',
                  description: "This customer hasn't placed any orders yet.",
                  action: {
                    label: 'Create Order',
                    onClick: () => router.push('/pos'),
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
