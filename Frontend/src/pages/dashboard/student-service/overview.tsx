import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studentApi } from '@/lib/api/students';
import { classApi } from '@/lib/api/seat-plan';
import { moduleApi } from '@/lib/api/modules';
import { mailApi } from '@/lib/api/mail';

export default function StudentServiceOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      title: 'Total Students',
      value: '...',
      description: 'Enrolled across all classes',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Class Sections',
      value: '...',
      description: 'Active examination groups',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Active Modules',
      value: '...',
      description: 'Registered course modules',
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Mail Dispatches',
      value: '...',
      description: 'Total broadcasts sent',
      icon: Mail,
      color: 'bg-primary-light text-primary',
    },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, classesRes, modulesRes, mailRes] =
          await Promise.all([
            studentApi.list({ limit: 1 }).catch(() => ({ data: { total: 0 } })),
            classApi.list().catch(() => ({ data: [] })),
            moduleApi.list({ limit: 1 }).catch(() => ({ data: { total: 0 } })),
            mailApi.getStats().catch(() => ({
              data: { totalSent: 0, totalQueued: 0, totalFailed: 0 },
            })),
          ]);

        const totalStudents = studentsRes.data?.total ?? 0;
        const totalClasses = classesRes.data?.length ?? 0;
        const totalModules = modulesRes.data?.total ?? 0;
        const totalMail =
          (mailRes.data?.totalSent ?? 0) + (mailRes.data?.totalQueued ?? 0);

        setStats([
          {
            title: 'Total Students',
            value: String(totalStudents),
            description: 'Enrolled across all classes',
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            title: 'Class Sections',
            value: String(totalClasses),
            description: 'Active examination groups',
            icon: GraduationCap,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            title: 'Active Modules',
            value: String(totalModules),
            description: 'Registered course modules',
            icon: BookOpen,
            color: 'bg-purple-50 text-purple-600',
          },
          {
            title: 'Mail Dispatches',
            value: String(totalMail),
            description: 'Total broadcasts sent',
            icon: Mail,
            color: 'bg-primary-light text-primary',
          },
        ]);
      } catch {
        // Stats remain as '...'
      }
    }

    loadStats();
  }, []);

  const quickLinks = [
    {
      title: 'Classes',
      description: 'Manage class lists and automated seat assignments',
      to: '/dashboard/student-service/classes',
      icon: GraduationCap,
    },
    {
      title: 'Students',
      description: 'Browse student roster, enrollment details and status',
      to: '/dashboard/student-service/students',
      icon: Users,
    },
    {
      title: 'Module Management',
      description: 'Curriculum modules, course codes and credits',
      to: '/dashboard/student-service/modules',
      icon: BookOpen,
    },
    {
      title: 'Results',
      description: 'Publish exam scores, grade sheets and student reports',
      to: '/dashboard/student-service/results',
      icon: Award,
    },
    {
      title: 'Mail Management',
      description: 'Send notifications, announcements and exam seat emails',
      to: '/dashboard/student-service/mail',
      icon: Mail,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Student Service Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to the Student Service portal. Manage classes, students,
          courses, results, and communications.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2.5">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Quick Access & Services
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <Card
                key={i}
                className="hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => navigate(item.to)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-2.5 text-sm group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 pb-4 px-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Fast Action CTA */}
      <Card className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Need to manage examination classes or rosters?
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Create a new class section or browse enrolled students for
              upcoming sessions.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/student-service/students')}
            >
              View Students
            </Button>
            <Button
              onClick={() => navigate('/dashboard/student-service/classes/new')}
            >
              New Class
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
