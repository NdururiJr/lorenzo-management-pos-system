/**
 * Home Page
 *
 * Landing page with links to login portals.
 *
 * @module app/page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Phone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-black">
            Lorenzo
          </h1>
          <p className="text-xl text-gray-600">Dry Cleaners Management System</p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Professional dry cleaning service with comprehensive management tools
            for staff and easy order tracking for customers.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Staff Login */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white mb-4">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Staff Login</CardTitle>
              <CardDescription>
                Access the management system with your email and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  Staff Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Order Management
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Customer Database
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Reports & Analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Customer Login */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-white mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Customer Login</CardTitle>
              <CardDescription>
                Track your orders using your phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer-login">
                <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white">
                  Customer Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Track Your Orders
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Order History
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Quick OTP Login
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Lorenzo Dry Cleaners - Professional Service Since 2024
          </p>
        </div>
      </div>
    </div>
  );
}
