export type Role = 'student' | 'teacher' | 'admin';

export type TeacherStatus = 'available' | 'office_hours' | 'in_meeting' | 'offline';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type InquiryTag =
  | 'Assignment Question'
  | 'Office Hour Request'
  | 'Grade Inquiry'
  | 'Exam Review'
  | 'Research Guidance'
  | 'Recommendation Letter'
  | 'General Inquiry';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'code' | 'doc';
  url?: string;
  previewUrl?: string;
}

export type FacultyKey =
  | 'all'
  | 'ee' // 电子信息工程学院
  | 'cs' // 计算机科学与技术学院
  | 'ai' // 自动化与智能学院
  | 'se' // 软件学院
  | 'sec' // 网络空间安全学院
  | 'trans' // 交通运输学院
  | 'civil' // 土木建筑工程学院
  | 'mece' // 机械与电子控制工程学院
  | 'elec' // 电气工程学院
  | 'sys' // 系统科学学院
  | 'env' // 环境学院
  | 'math' // 数学与统计学院
  | 'phys' // 物理科学与工程学院
  | 'sem' // 经济管理学院
  | 'arch' // 建筑与艺术学院
  | 'law' // 法学院
  | 'lang' // 语言与传播学院
  | 'marx' // 马克思主义学院
  | 'zty' // 詹天佑学院
  | 'eng_lead' // 国家卓越工程师学院
  | 'weihai' // 威海国际学院
  | 'dist' // 远程与继续教育学院
  | 'cie' // 国际教育学院
  | (string & {});

export interface StudentProfile {
  id: string;
  role: Role;
  isAdmin?: boolean;
  is_admin?: boolean;
  fullName: string;
  chineseName?: string;
  studentId: string; // e.g. "2023010482"
  faculty: string; // e.g. "School of Computer & Information Technology (计算机与信息技术学院)"
  facultyKey: FacultyKey;
  major: string; // e.g. "Computer Science & Technology"
  grade: string; // e.g. "Year 3 (Class of 2026)"
  classGroup: string; // e.g. "CS-2301"
  avatar: string;
  email: string;
  phone?: string;
  enrolledCourseIds: string[];
  gpa?: string;
  password?: string;
}

export interface TeacherProfile {
  id: string;
  role: Role;
  isAdmin?: boolean;
  is_admin?: boolean;
  fullName: string;
  chineseName?: string;
  staffId?: string; // e.g. "T10048"
  title: string; // e.g. "Associate Professor & Vice Dean"
  faculty: string; // e.g. "School of Computer & Information Technology"
  facultyKey: FacultyKey;
  department: string; // e.g. "Dept. of Computer Science & AI"
  officeLocation: string; // e.g. "Siyuan East Building 402B (思源东楼402B)"
  officeHours: string; // e.g. "Tue & Thu 14:00 - 16:30"
  coursesTaughtIds: string[];
  avatar: string;
  email: string;
  status: TeacherStatus;
  customStatusMessage?: string;
  researchInterests?: string[];
  password?: string;
}

export type UserProfile = StudentProfile | TeacherProfile;

export interface Course {
  id: string;
  code: string;
  name: string;
  chineseName: string;
  faculty: string;
  facultyKey: FacultyKey;
  teacherId: string;
  semester: string;
  schedule: string;
  classroom: string; // e.g. "Siyuan Building 3-201"
  credits: number;
  category?: 'required' | 'elective' | 'general';
  capacity?: number;
  enrolledCount?: number;
  dayOfWeek?: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  periodSlot?: number; // 1 = 08:00-09:35, 2 = 10:00-11:35, 3 = 14:00-15:35, 4 = 16:00-17:35, 5 = 19:00-20:35
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: Role;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  tag?: InquiryTag;
  attachments?: Attachment[];
  bookingProposal?: {
    date: string;
    time: string;
    location: string;
    status: 'pending' | 'accepted' | 'declined';
    notes?: string;
  };
}

export interface Conversation {
  id: string;
  studentId: string;
  teacherId: string;
  courseId?: string;
  lastMessage?: {
    content: string;
    timestamp: number;
    senderId: string;
    status: MessageStatus;
    tag?: InquiryTag;
  };
  unreadCountStudent: number;
  unreadCountTeacher: number;
  starredByTeacher?: boolean;
  topicTag?: InquiryTag;
  teacherNotes?: string;
  updatedAt: number;
}
