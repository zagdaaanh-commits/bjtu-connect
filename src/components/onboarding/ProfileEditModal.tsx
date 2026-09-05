'use client';

import React, { useState, useRef } from 'react';
import { UserProfile, StudentProfile, TeacherProfile, FacultyKey } from '../../types/portal';
import { Modal } from '../common/Modal';
import { updateProfile } from '../../lib/storage';
import { FACULTIES } from '../../data/dummyData';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaved: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaved,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [chineseName, setChineseName] = useState(currentUser.chineseName || '');
  const [email, setEmail] = useState(currentUser.email);
  const [facultyKey, setFacultyKey] = useState<FacultyKey>(currentUser.facultyKey || 'cs');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Student specific
  const [studentId, setStudentId] = useState(
    !isTeacher ? (currentUser as StudentProfile).studentId : ''
  );
  const [major, setMajor] = useState(
    !isTeacher ? (currentUser as StudentProfile).major : ''
  );
  const [grade, setGrade] = useState(
    !isTeacher ? (currentUser as StudentProfile).grade : ''
  );

  // Teacher specific
  const [title, setTitle] = useState(
    isTeacher ? (currentUser as TeacherProfile).title : ''
  );
  const [officeLocation, setOfficeLocation] = useState(
    isTeacher ? (currentUser as TeacherProfile).officeLocation : ''
  );
  const [officeHours, setOfficeHours] = useState(
    isTeacher ? (currentUser as TeacherProfile).officeHours : ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Center crop and compress image into a square 256x256 JPEG data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const minDim = Math.min(img.width, img.height);
          const targetSize = 256;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await processImageFile(file);
      setAvatar(dataUrl);
    } catch (err) {
      console.error('Failed to read image file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFacultyObj = FACULTIES.find((f) => f.key === facultyKey);
    const facultyLabel = selectedFacultyObj
      ? `${selectedFacultyObj.nameEn} (${selectedFacultyObj.nameZh})`
      : currentUser.faculty;

    if (isTeacher) {
      const updated: TeacherProfile = {
        ...(currentUser as TeacherProfile),
        avatar,
        fullName,
        chineseName,
        email,
        faculty: facultyLabel,
        facultyKey,
        title,
        officeLocation,
        officeHours,
      };
      updateProfile(updated);
    } else {
      const updated: StudentProfile = {
        ...(currentUser as StudentProfile),
        avatar,
        fullName,
        chineseName,
        email,
        faculty: facultyLabel,
        facultyKey,
        studentId,
        major,
        grade,
      };
      updateProfile(updated);
    }

    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={`Edit ${isTeacher ? 'Faculty' : 'Student'} Profile • 编辑个人资料`}
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar / Photo Customization Section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-academic-700" />
            <span>Profile Photo / 头像更换 (支持本地上传)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Big Avatar Preview with Camera Badge */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0"
              title="Click to choose a photo from your computer"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-academic-700/30 ring-4 ring-academic-600/10 shadow-sm relative">
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Upload</span>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center text-xs font-bold text-academic-700">
                  Loading...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-academic-700 hover:bg-academic-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo (本地上传图片)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Preset (精选头像)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Image URL (网络图片)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP. Photos are automatically cropped to square format and synchronized across the portal.
              </p>

              {/* URL Input Form */}
              {showUrlInput && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                  <input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-academic-700"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preset Avatars Gallery */}
          {showPresets && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 mb-2">
                Click any avatar below to use it:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(pUrl);
                      setShowPresets(false);
                    }}
                    className={cn(
                      'w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-transform hover:scale-110 cursor-pointer',
                      avatar === pUrl
                        ? 'border-academic-700 ring-2 ring-academic-600/30'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    )}
                  >
                    <img src={pUrl} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full English Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chinese Name (中文名)
            </label>
            <input
              type="text"
              value={chineseName}
              onChange={(e) => setChineseName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              School / Faculty (学院 - 22个官方学院可选)
            </label>
            <select
              value={facultyKey}
              onChange={(e) => setFacultyKey(e.target.value as FacultyKey)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none bg-white"
            >
              {FACULTIES.filter((f) => f.key !== 'all').map((f) => (
                <option key={f.key} value={f.key}>
                  {f.nameZh} ({f.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Specific Fields */}
        {!isTeacher && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID (学号)
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Major (专业)
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class / Grade (年级)
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
              />
            </div>
          </div>
        )}

        {/* Teacher Specific Fields */}
        {isTeacher && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Title (职称)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office Location (办公室)
                </label>
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office Hours (答疑时间)
                </label>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-academic-600/20 focus:border-academic-700 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-academic-700 hover:bg-academic-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Save Profile Details (保存设置)
          </button>
        </div>
      </form>
    </Modal>
  );
};
