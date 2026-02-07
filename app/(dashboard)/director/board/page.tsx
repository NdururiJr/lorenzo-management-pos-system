'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import { SetupRequired } from '@/components/ui/setup-required';
import {
  FileText,
  Download,
  Calendar,
  Video,
  Folder,
  Clock,
  Plus,
  Eye,
  Mail,
  FileBarChart,
  Presentation,
  Loader2,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BoardDocument {
  id: string;
  title: string;
  type: 'minutes' | 'report' | 'presentation' | 'policy';
  date: string;
  status: 'draft' | 'review' | 'approved';
  author: string;
}

interface MeetingAgenda {
  id: string;
  topic: string;
  presenter: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'board' | 'committee' | 'shareholder';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
  format: 'pdf' | 'excel' | 'pptx';
}

export default function BoardRoomPage() {
  const [selectedTab, setSelectedTab] = useState<'documents' | 'meetings' | 'reports'>('documents');
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [documents, setDocuments] = useState<BoardDocument[]>([]);
  const [meetings, setMeetings] = useState<UpcomingMeeting[]>([]);

  useEffect(() => {
    async function fetchBoardData() {
      setLoading(true);
      try {
        // Check for board documents collection
        const docsRef = collection(db, 'board_documents');
        const docsSnapshot = await getDocs(docsRef);

        // Check for meetings collection
        const meetingsRef = collection(db, 'board_meetings');
        const meetingsSnapshot = await getDocs(meetingsRef);

        if (docsSnapshot.size > 0 || meetingsSnapshot.size > 0) {
          // Load real documents
          const realDocs: BoardDocument[] = [];
          docsSnapshot.forEach((doc) => {
            const data = doc.data();
            realDocs.push({
              id: doc.id,
              title: data.title,
              type: data.type,
              date: data.date,
              status: data.status,
              author: data.author,
            });
          });
          setDocuments(realDocs);

          // Load real meetings
          const realMeetings: UpcomingMeeting[] = [];
          meetingsSnapshot.forEach((doc) => {
            const data = doc.data();
            realMeetings.push({
              id: doc.id,
              title: data.title,
              date: data.date,
              time: data.time,
              location: data.location,
              attendees: data.attendees,
              type: data.type,
            });
          });
          setMeetings(realMeetings);

          setHasRealData(true);
        } else {
          setHasRealData(false);
        }
      } catch (error) {
        console.error('Error fetching board data:', error);
        setHasRealData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchBoardData();
  }, []);

  // Empty arrays when no real data
  const upcomingMeetings: UpcomingMeeting[] = meetings;
  const nextMeetingAgenda: MeetingAgenda[] = [];
  const reportTemplates: ReportTemplate[] = [];

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'review':
      case 'in_progress':
        return 'warning';
      case 'draft':
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'minutes':
        return <FileText className="h-4 w-4" />;
      case 'report':
        return <FileBarChart className="h-4 w-4" />;
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      case 'policy':
        return <Folder className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMeetingTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (type) {
      case 'board':
        return 'warning';
      case 'committee':
        return 'info';
      case 'shareholder':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const pendingDocs = documents.filter((d) => d.status !== 'approved').length;
  const nextMeeting = upcomingMeetings[0];

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading board data...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!hasRealData) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              GOVERNANCE
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Board Room</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Report generator, meeting prep, and board documents
            </p>
          </div>

          <SetupRequired
            feature="Board Documents & Meetings"
            description="No board documents or meetings configured. Add board meeting minutes, strategic plans, and schedule upcoming meetings to use this dashboard."
            variant="warning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-500" />
                Documents
              </h3>
              <p className="text-xs text-muted-foreground">
                Store and manage board meeting minutes, strategic plans, and policy documents.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Meetings
              </h3>
              <p className="text-xs text-muted-foreground">
                Schedule board meetings, committee reviews, and shareholder meetings.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-amber-500" />
                Reports
              </h3>
              <p className="text-xs text-muted-foreground">
                Generate executive summaries, financial reports, and board presentation packs.
              </p>
            </ModernCard>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              GOVERNANCE
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Board Room</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Report generator, meeting prep, and board documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="secondary" size="sm" leftIcon={<Calendar className="h-4 w-4" />}>
              Schedule Meeting
            </ModernButton>
            <ModernButton leftIcon={<Plus className="h-4 w-4" />}>
              New Document
            </ModernButton>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Documents"
            value={documents.length.toString()}
            changeLabel={`${pendingDocs} pending approval`}
            icon={<Folder className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Next Meeting"
            value={nextMeeting?.date || 'None scheduled'}
            changeLabel={nextMeeting?.title || 'No upcoming meetings'}
            icon={<Calendar className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Agenda Items"
            value={nextMeetingAgenda.length}
            changeLabel="For next meeting"
            icon={<FileText className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Report Templates"
            value={reportTemplates.length}
            changeLabel="Available to generate"
            icon={<FileBarChart className="h-5 w-5" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'documents', label: 'Documents', icon: Folder },
            { key: 'meetings', label: 'Meetings', icon: Calendar },
            { key: 'reports', label: 'Report Generator', icon: FileBarChart },
          ].map((tab) => (
            <ModernButton
              key={tab.key}
              variant={selectedTab === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              leftIcon={<tab.icon className="h-4 w-4" />}
            >
              {tab.label}
            </ModernButton>
          ))}
        </div>

        {/* Documents Tab */}
        {selectedTab === 'documents' && (
          <ModernCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Document
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Author
                    </th>
                    <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(doc.type)}
                          <span className="font-medium">{doc.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <ModernBadge variant="secondary" size="sm">
                          {doc.type}
                        </ModernBadge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.date}</td>
                      <td className="p-4">
                        <ModernBadge variant={getStatusColor(doc.status)} size="sm">
                          {doc.status}
                        </ModernBadge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.author}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ModernButton variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                            View
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                            Download
                          </ModernButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        )}

        {/* Meetings Tab */}
        {selectedTab === 'meetings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <ModernCard>
              <div className="p-4 border-b flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <h2 className="font-semibold">Upcoming Meetings</h2>
              </div>
              <div className="divide-y">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meeting.date} at {meeting.time}
                        </p>
                      </div>
                      <ModernBadge variant={getMeetingTypeColor(meeting.type)} size="sm">
                        {meeting.type}
                      </ModernBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {meeting.location.includes('Virtual') ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Folder className="h-3 w-3" />
                        )}
                        {meeting.location}
                      </span>
                      <span>{meeting.attendees} attendees</span>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Next Meeting Agenda */}
            <ModernCard>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <h2 className="font-semibold">Next Meeting Agenda</h2>
                </div>
                <ModernButton variant="secondary" size="sm" leftIcon={<Mail className="h-4 w-4" />}>
                  Send to Attendees
                </ModernButton>
              </div>
              <div className="divide-y">
                {nextMeetingAgenda.map((item, index) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.topic}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.presenter} • {item.duration}
                      </p>
                    </div>
                    <ModernBadge variant={getStatusColor(item.status)} size="sm">
                      {item.status}
                    </ModernBadge>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Duration: {nextMeetingAgenda.reduce((sum, item) => sum + parseInt(item.duration), 0)} min
                  </span>
                  <ModernButton variant="secondary" size="sm">
                    Edit Agenda
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          </div>
        )}

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <ModernCard key={template.id} className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{template.name}</h3>
                    <ModernBadge variant="secondary" size="sm">
                      {template.format.toUpperCase()}
                    </ModernBadge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last generated: {template.lastGenerated}
                    </span>
                    <ModernButton size="sm" leftIcon={<Download className="h-4 w-4" />}>
                      Generate
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
