/**
 * Contact Support Page
 *
 * Page for customers to contact support via WhatsApp or create support tickets.
 *
 * @module app/(customer)/portal/contact/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MessageCircle, Ticket, Send, ArrowLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BRANCH_PHONE = '+254725462859'; // Lorenzo Dry Cleaners contact
const WHATSAPP_MESSAGE = 'Hello! I need help with my order.';

type TicketStatus = 'open' | 'in_progress' | 'resolved';
type TicketPriority = 'low' | 'medium' | 'high';

interface MockTicket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  lastUpdated: Date;
}

// Mock ticket data - Replace with actual data from Firestore
const MOCK_TICKETS: MockTicket[] = [
  {
    id: 'TKT-001',
    subject: 'Issue with order ORD-MAIN-20250101-0001',
    category: 'Order Issue',
    status: 'open',
    priority: 'high',
    createdAt: new Date('2025-01-20'),
    lastUpdated: new Date('2025-01-20'),
  },
  {
    id: 'TKT-002',
    subject: 'Question about delivery time',
    category: 'General Inquiry',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date('2025-01-18'),
    lastUpdated: new Date('2025-01-19'),
  },
];

export default function ContactPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<MockTicket[]>(MOCK_TICKETS);

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${BRANCH_PHONE.replace(/\+/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !category || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual ticket system in Firestore
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
        subject,
        category,
        status: 'open' as TicketStatus,
        priority,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      setTickets([newTicket, ...tickets]);

      toast.success('Support ticket created successfully!', {
        description: `Ticket ID: ${newTicket.id}`,
      });

      // Reset form
      setSubject('');
      setCategory('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const variants = {
      open: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      in_progress: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
      resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-red-100 text-red-700',
    };

    return (
      <Badge className={`${colors[priority]} border-0`}>
        {priority.toUpperCase()}
      </Badge>
    );
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
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
            <p className="text-gray-600 mt-1">
              Get help from our support team
            </p>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Need Immediate Help?
              </h2>
              <p className="text-gray-600">
                Chat with us on WhatsApp for quick responses to your questions.
              </p>
            </div>
            <Button
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Create Ticket Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <ModernCard>
          <ModernCardContent className="!p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-brand-blue" />
              <h2 className="text-xl font-semibold text-gray-900">
                Create Support Ticket
              </h2>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_issue">Order Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="delivery">Delivery Concern</SelectItem>
                    <SelectItem value="quality">Quality Issue</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)} required>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General question</SelectItem>
                    <SelectItem value="medium">Medium - Needs attention</SelectItem>
                    <SelectItem value="high">High - Urgent issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-blue hover:bg-brand-blue-dark"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </Button>
            </form>
          </ModernCardContent>
        </ModernCard>
      </motion.div>

      {/* Existing Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Support Tickets
        </h2>

        {tickets.length === 0 ? (
          <ModernCard>
            <ModernCardContent className="!p-8 text-center">
              <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No support tickets yet.</p>
            </ModernCardContent>
          </ModernCard>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <ModernCard key={ticket.id} className="hover:shadow-glow-blue transition-all cursor-pointer">
                <ModernCardContent className="!p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-brand-blue">
                          {ticket.id}
                        </span>
                        {getStatusBadge(ticket.status as TicketStatus)}
                        {getPriorityBadge(ticket.priority as TicketPriority)}
                      </div>
                      <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ticket.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {ticket.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        )}
      </motion.div>
    </ModernSection>
  );
}
