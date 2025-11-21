/**
 * Employee Table Component
 *
 * Displays list of employees with their details and actions.
 *
 * @module components/features/employees/EmployeeTable
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Edit, UserX, UserCheck } from 'lucide-react';
import type { Employee } from '@/app/(dashboard)/employees/page';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EmployeeTableProps {
  employees: Employee[];
  isSuperAdmin?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  front_desk: 'Front Desk',
  workstation: 'Workstation',
  driver: 'Driver',
  manager: 'Manager',
  admin: 'Admin',
};

export function EmployeeTable({ employees, isSuperAdmin = false }: EmployeeTableProps) {
  const [branches, setBranches] = useState<Record<string, string>>({});

  // Fetch branch names for super admin view
  useEffect(() => {
    if (!isSuperAdmin) return;

    async function fetchBranchNames() {
      const uniqueBranchIds = [...new Set(employees.map((e) => e.branchId))];
      const branchMap: Record<string, string> = {};

      for (const branchId of uniqueBranchIds) {
        try {
          const branchDoc = await getDoc(doc(db, 'branches', branchId));
          if (branchDoc.exists()) {
            branchMap[branchId] = branchDoc.data().name;
          } else {
            branchMap[branchId] = branchId; // Fallback to ID
          }
        } catch (error) {
          console.error(`Error fetching branch ${branchId}:`, error);
          branchMap[branchId] = branchId;
        }
      }

      setBranches(branchMap);
    }

    fetchBranchNames();
  }, [employees, isSuperAdmin]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead>Branch</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Today's Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.displayName}</TableCell>
                  <TableCell className="text-gray-600">{employee.email}</TableCell>
                  <TableCell className="text-gray-600">{employee.phoneNumber || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROLE_LABELS[employee.role] || employee.role}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-gray-600">
                      {branches[employee.branchId] || employee.branchId}
                    </TableCell>
                  )}
                  <TableCell>
                    {employee.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      Not Clocked In
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {employee.status === 'active' ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
