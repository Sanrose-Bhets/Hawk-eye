import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Copy,
  Check,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
} from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { studentApi } from '@/lib/api/students';
import { facultyApi } from '@/lib/api/faculties';
import type { Student, Faculty } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function StudentProfilePage() {
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [student, setStudent] = useState<Student | null>(null);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const studentEmail = user?.email?.toLowerCase() || '';
        let currentStudent: Student | null = null;

        // 1. Try fetching by user.id if available
        if (user?.id) {
          try {
            const res = await studentApi.get(user.id);
            if (res.data) {
              currentStudent = res.data;
            }
          } catch {
            // Fallback to search by email
          }
        }

        // 2. If not found by ID, search by email
        if (!currentStudent && studentEmail) {
          try {
            const searchRes = await studentApi.list({
              search: studentEmail,
              limit: 1,
            });
            if (searchRes.data?.data && searchRes.data.data.length > 0) {
              const matched = searchRes.data.data.find(
                (s) => s.email.toLowerCase() === studentEmail,
              );
              if (matched) currentStudent = matched;
            }
          } catch {
            // Error search
          }
        }

        // 3. Fallback mock if student data is not yet seeded
        if (!currentStudent) {
          const derivedName = user?.email
            ? user.email
                .split('@')[0]
                .split('.')
                .map(
                  (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
                )
                .join(' ')
            : 'Student User';

          currentStudent = {
            id: user?.id || 'STU-2026-9482',
            name: derivedName,
            email: user?.email || 'student@islingtoncollege.com',
            address: 'Kamalpokhari, Kathmandu, Nepal',
            contact: '+977 9801234567',
            parentEmail: 'guardian@islingtoncollege.com',
            image: null,
            role: 'STUDENT',
            facultyId: 'fac-computing',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        setStudent(currentStudent);

        // 4. Load Faculty if available
        if (currentStudent?.facultyId) {
          try {
            const facListRes = await facultyApi.list({ limit: 50 });
            if (facListRes.data?.data) {
              const matchedFac = facListRes.data.data.find(
                (f) => f.id === currentStudent?.facultyId,
              );
              if (matchedFac) setFaculty(matchedFac);
            }
          } catch {
            // Default faculty fallback
          }
        }

        // 5. Load Image URL if student has an image
        if (currentStudent?.id) {
          try {
            const imgRes = await studentApi.getImageUrl(currentStudent.id);
            if (imgRes.data?.url) {
              setImageUrl(imgRes.data.url);
            }
          } catch {
            // Ignore image fetch failure
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student?.id) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('Invalid format. Only JPG and PNG images are allowed.');
      return;
    }

    // Validate size (max 500 KB)
    if (file.size > 500 * 1024) {
      setUploadError('Image size exceeds 500 KB limit.');
      return;
    }

    try {
      setUploading(true);

      // Local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      const res = await studentApi.uploadImage(student.id, file);
      if (res.data) {
        setStudent(res.data);
      }

      // Fetch fresh presigned URL
      try {
        const freshUrlRes = await studentApi.getImageUrl(student.id);
        if (freshUrlRes.data?.url) {
          setImageUrl(freshUrlRes.data.url);
        }
      } catch {
        // Keep preview
      }

      setUploadSuccess('Profile picture updated successfully.');
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to upload photo.'
          : 'Failed to upload photo.';
      setUploadError(
        typeof errorMsg === 'string' ? errorMsg : 'Upload failed. Try again.',
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyStudentId = () => {
    if (!student?.id) return;
    navigator.clipboard.writeText(student.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const initials = student?.name
    ? student.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-16">
      {/* 1. Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          Student Profile
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Official academic identity, verified credentials, and institutional
          records.
        </p>
      </header>

      {/* 2. Profile Photo & Primary Identity Card */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          01 / PROFILE PHOTO & IDENTITY
        </div>

        <div className="border border-gray-200 bg-white p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 md:gap-6">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={student?.name || 'Student'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-mono font-bold text-gray-400">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Upload Trigger overlay icon */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Upload photo"
                  className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 border border-white hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
                  title="Change profile picture"
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* Identity Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    {loading ? 'Loading...' : student?.name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {loading ? '—' : student?.email}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-mono">
                  <span>ID: {student?.id?.slice(0, 16)}...</span>
                  <button
                    type="button"
                    onClick={copyStudentId}
                    className="hover:text-gray-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Copy full Student ID"
                  >
                    {copiedId ? (
                      <Check size={12} className="text-primary" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span className="text-[10px]">
                      {copiedId ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Photo Action Area */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-none border-gray-300 text-xs font-mono font-bold tracking-wider uppercase hover:bg-gray-50"
              >
                <Camera size={14} className="mr-2 text-gray-500" />
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Button>
              <p className="text-[10px] text-gray-400 font-mono">
                JPG, PNG • Max 500 KB
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {uploadSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Academic & Personal Records (Read-Only) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
            02 / ACADEMIC & CONTACT INFORMATION
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
            <Lock size={11} /> Read-Only
          </span>
        </div>

        <div className="border border-gray-200 bg-white divide-y divide-gray-200">
          <div className="p-5 md:p-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 size={12} />
                FACULTY / DEPARTMENT
              </span>
              <Lock size={12} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-900">
              {faculty?.name || 'Department of Computing & IT'}
            </p>
            <p className="text-xs text-gray-500 font-sans">
              {faculty?.description || 'Undergraduate academic degree program'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-5 md:p-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} />
                  OFFICIAL STUDENT EMAIL
                </span>
                <Lock size={12} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-900 font-mono">
                {student?.email || 'student@islingtoncollege.com'}
              </p>
              <p className="text-xs text-gray-500 font-sans">
                Primary address for official examination notices
              </p>
            </div>

            <div className="p-5 md:p-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone size={12} />
                  CONTACT TELEPHONE
                </span>
                <Lock size={12} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-900 font-mono">
                {student?.contact || '+977 9801234567'}
              </p>
              <p className="text-xs text-gray-500 font-sans">
                Registered student mobile number
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-5 md:p-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} />
                  RESIDENTIAL ADDRESS
                </span>
                <Lock size={12} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-900">
                {student?.address || 'Kamalpokhari, Kathmandu, Nepal'}
              </p>
              <p className="text-xs text-gray-500 font-sans">
                Permanent residential record on file
              </p>
            </div>

            <div className="p-5 md:p-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={12} />
                  GUARDIAN / PARENT EMAIL
                </span>
                <Lock size={12} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-900 font-mono">
                {student?.parentEmail || 'guardian@islingtoncollege.com'}
              </p>
              <p className="text-xs text-gray-500 font-sans">
                Emergency and grade reporting contact
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
