'use client';

import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const branches = [
  { name: 'Village Market Courtyard', phone: '+254 113 499 854' },
  { name: 'Westgate Mall 2nd Floor', phone: '+254 794 592 392' },
  { name: 'Dennis Pritt Rd', phone: '+254 745 294 808' },
  { name: 'Muthaiga Mini Market', phone: '+254 759 602 282' },
  { name: 'Adlife Plaza Mezzanine Flr', phone: '+254 724 228 414' },
  { name: 'Naivas Kilimani Mall (Ground Floor)', phone: '+254 742 122 985' },
  { name: 'Hurlingham Quickmart', phone: '+254 706 945 997' },
  { name: 'Lavington Legend Valley Mall', phone: '+254 741 350 858' },
  { name: 'Greenpark- Arcadia', phone: '+254 769 573 764' },
  { name: 'South C Naivas- South C', phone: '+254 700 765 223' },
  { name: 'Langata Kobil- 1st Floor', phone: '+254 792 875 647' },
  { name: 'Bomas Rubis Petrol', phone: '+254 791 269 369' },
  { name: 'Waterfront Karen (Ground Floor)', phone: '+254 748 259 918' },
  { name: 'Langata Freedom Heights (Ground Floor)', phone: '+254 792 905 326' },
  { name: 'Ngong Shell Kerarapon', phone: '+254 114 445 902' },
  { name: 'Imara - Imara Mall Ground Floor', phone: '+254 115 094 399' },
  { name: 'Nextgen Mall- South C (Ground Floor)', phone: '+254 799 224 299' },
  { name: 'Kileleshwa Quickmart', phone: '+254 705 704 397' },
  { name: 'Arboretum Shell', phone: '+254 703 726 656' },
  { name: 'Kilimani - Shujah Mall Opposite Adlife', phone: '+254 769 717 450' },
  { name: 'Karen - My Town Mall Opp Karen Hosp', phone: '+254 769 718 906' },
];

export default function BranchesPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Branch Management"
        description="Manage store locations and settings"
        action={
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {branches.length} Locations
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-start gap-2">
                <Store className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                <span>{branch.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>Nairobi, Kenya</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
