/**
 * Inventory Table Component
 *
 * Displays inventory items in a table with stock level indicators,
 * actions for editing and adjusting stock.
 *
 * @module components/features/inventory/InventoryTable
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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
import { MoreHorizontal, Edit, TrendingUp, History, Trash2 } from 'lucide-react';
import { EditItemModal } from './EditItemModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { AdjustmentHistoryModal } from './AdjustmentHistoryModal';
import { DeleteItemDialog } from './DeleteItemDialog';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

interface InventoryTableProps {
  items: InventoryItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  detergents: 'Detergents',
  softeners: 'Softeners',
  hangers: 'Hangers',
  packaging: 'Packaging',
  stain_removers: 'Stain Removers',
  others: 'Others',
};

export function InventoryTable({ items }: InventoryTableProps) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const getStockLevelColor = (quantity: number, reorderLevel: number) => {
    const ratio = quantity / reorderLevel;
    if (ratio < 1) return 'bg-red-50 text-red-700 border-red-200';
    if (ratio <= 1.2) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const getStockLevelLabel = (quantity: number, reorderLevel: number) => {
    const ratio = quantity / reorderLevel;
    if (ratio < 1) return 'Critical';
    if (ratio <= 1.2) return 'Low';
    return 'Good';
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead>Cost/Unit</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          item.quantity < item.reorderLevel
                            ? 'text-red-600'
                            : item.quantity <= item.reorderLevel * 1.2
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{item.unit}</TableCell>
                    <TableCell className="text-gray-600">{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStockLevelColor(item.quantity, item.reorderLevel)}
                      >
                        {getStockLevelLabel(item.quantity, item.reorderLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.lastRestocked
                        ? format(item.lastRestocked.toDate(), 'MMM d, yyyy')
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.costPerUnit ? `$${item.costPerUnit.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.supplier || '-'}
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
                          <DropdownMenuItem onClick={() => setEditingItem(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAdjustingItem(item)}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setHistoryItem(item)}>
                            <History className="w-4 h-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingItem(item)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
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

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <StockAdjustmentModal
          item={adjustingItem}
          open={!!adjustingItem}
          onOpenChange={(open) => !open && setAdjustingItem(null)}
        />
      )}

      {/* History Modal */}
      {historyItem && (
        <AdjustmentHistoryModal
          item={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      {/* Delete Dialog */}
      {deletingItem && (
        <DeleteItemDialog
          item={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
        />
      )}
    </>
  );
}
