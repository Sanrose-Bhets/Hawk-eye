import { useState } from 'react';
import { Mail, Send, CheckCheck, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const RECENT_DISPATCHES = [
  {
    id: 'MAIL-1',
    subject: 'Seat Plan & Examination Allocation Notice',
    recipientGroup: 'All Grade 10 - Section A Students',
    sentAt: 'Today, 10:30 AM',
    delivered: 24,
    failed: 0,
    status: 'Delivered',
  },
  {
    id: 'MAIL-2',
    subject: 'Upcoming Midterm Exam Schedule & Hall Rules',
    recipientGroup: 'All Enrolled Students',
    sentAt: 'Yesterday, 3:15 PM',
    delivered: 48,
    failed: 0,
    status: 'Delivered',
  },
  {
    id: 'MAIL-3',
    subject: 'Module Registration Confirmation for Spring 2026',
    recipientGroup: 'Computer Science Department',
    sentAt: 'Sep 08, 2026',
    delivered: 32,
    failed: 1,
    status: 'Delivered',
  },
];

export default function MailManagementPage() {
  const [messages] = useState(RECENT_DISPATCHES);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Mail Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast seating notifications, exam passes, and student
            announcements
          </p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Compose Broadcast
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Sent Emails
              </span>
              <Send size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">104</p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Delivery Rate
              </span>
              <CheckCheck size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">99.1%</p>
            <p className="text-xs text-gray-500 mt-1">Active mail delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Queued</span>
              <Clock size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            <p className="text-xs text-gray-500 mt-1">All dispatched</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Broadcasts
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:px-6 hover:bg-gray-50/80 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary mt-0.5">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {item.subject}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        To: {item.recipientGroup} • {item.sentAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center pl-12 sm:pl-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCheck size={12} />
                      {item.delivered} Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
