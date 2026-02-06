'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StatBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
  viewAllLabel?: string;
}

export function StatBreakdownModal({
  open,
  onClose,
  title,
  children,
  viewAllLink,
  viewAllLabel = 'View All',
}: StatBreakdownModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4">{children}</div>

        {viewAllLink && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = viewAllLink;
              }}
            >
              {viewAllLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
