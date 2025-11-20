'use client';

import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Reports & Analytics"
        description="View business performance and insights"
      />

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Analytics Dashboard Coming Soon
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            We are building comprehensive reports to help you track revenue,
            orders, and staff performance.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
