import { createClient } from '@supabase/supabase-js';
import {
  StudentProfile,
  TeacherProfile,
  Course,
  Conversation,
  Message,
  UserProfile,
  TeacherStatus,
  InquiryTag,
  Attachment,
} from '../types/portal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('http') &&
      supabaseAnonKey.length > 10
  );
};

// Create a single supabase client for interacting with the database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ==========================================
// DATA MAPPERS (Database snake_case <-> App camelCase)
// ==========================================

export function rowToStudent(r: any): StudentProfile {
  return {
    id: r.id,
    role: 'student',
    fullName: r.full_name,
    chineseName: r.chinese_name || undefined,
    studentId: r.student_id,
    faculty: r.faculty,
    facultyKey: r.faculty_key,
    major: r.major,
    grade: r.grade,
    classGroup: r.class_group,
    avatar: r.avatar,
    email: r.email,
    phone: r.phone || undefined,
    enrolledCourseIds: r.enrolled_course_ids || [],
    gpa: r.gpa || undefined,
    password: r.password || undefined,
  };
}

export function studentToRow(s: StudentProfile): any {
  return {
    id: s.id,
    role: 'student',
    full_name: s.fullName,
    chinese_name: s.chineseName || null,
    student_id: s.studentId,
    faculty: s.faculty,
    faculty_key: s.facultyKey,
    major: s.major,
    grade: s.grade,
    class_group: s.classGroup,
    avatar: s.avatar,
    email: s.email,
    phone: s.phone || null,
    enrolled_course_ids: s.enrolledCourseIds || [],
    gpa: s.gpa || null,
    password: s.password || null,
  };
}

export function rowToTeacher(r: any): TeacherProfile {
  return {
    id: r.id,
    role: 'teacher',
    fullName: r.full_name,
    chineseName: r.chinese_name || undefined,
    staffId: r.staff_id || undefined,
    title: r.title,
    faculty: r.faculty,
    facultyKey: r.faculty_key,
    department: r.department,
    officeLocation: r.office_location,
    officeHours: r.office_hours,
    coursesTaughtIds: r.courses_taught_ids || [],
    avatar: r.avatar,
    email: r.email,
    status: (r.status as TeacherStatus) || 'available',
    customStatusMessage: r.custom_status_message || undefined,
    researchInterests: r.research_interests || [],
    password: r.password || undefined,
  };
}

export function teacherToRow(t: TeacherProfile): any {
  return {
    id: t.id,
    role: 'teacher',
    full_name: t.fullName,
    chinese_name: t.chineseName || null,
    staff_id: t.staffId || null,
    title: t.title,
    faculty: t.faculty,
    faculty_key: t.facultyKey,
    department: t.department,
    office_location: t.officeLocation,
    office_hours: t.officeHours,
    courses_taught_ids: t.coursesTaughtIds || [],
    avatar: t.avatar,
    email: t.email,
    status: t.status,
    custom_status_message: t.customStatusMessage || null,
    research_interests: t.researchInterests || [],
    password: t.password || null,
  };
}

export function rowToCourse(r: any): Course {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    chineseName: r.chinese_name,
    faculty: r.faculty,
    facultyKey: r.faculty_key,
    teacherId: r.teacher_id,
    semester: r.semester,
    schedule: r.schedule,
    classroom: r.classroom,
    credits: Number(r.credits) || 3,
    category: r.category || 'required',
    capacity: r.capacity || 60,
    enrolledCount: r.enrolled_count || 0,
    dayOfWeek: r.day_of_week || [],
    periodSlot: r.period_slot || 1,
  };
}

export function courseToRow(c: Course): any {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    chinese_name: c.chineseName,
    faculty: c.faculty,
    faculty_key: c.facultyKey,
    teacher_id: c.teacherId,
    semester: c.semester,
    schedule: c.schedule,
    classroom: c.classroom,
    credits: c.credits,
    category: c.category || 'required',
    capacity: c.capacity || 60,
    enrolled_count: c.enrolledCount || 0,
    day_of_week: c.dayOfWeek || [],
    period_slot: c.periodSlot || 1,
  };
}

export function rowToConversation(r: any): Conversation {
  return {
    id: r.id,
    studentId: r.student_id,
    teacherId: r.teacher_id,
    courseId: r.course_id || undefined,
    topicTag: r.topic_tag || 'General Inquiry',
    unreadCountStudent: r.unread_count_student || 0,
    unreadCountTeacher: r.unread_count_teacher || 0,
    starredByTeacher: Boolean(r.starred_by_teacher),
    teacherNotes: r.teacher_notes || '',
    lastMessage: r.last_message || undefined,
    updatedAt: Number(r.updated_at) || Date.now(),
  };
}

export function conversationToRow(c: Conversation): any {
  return {
    id: c.id,
    student_id: c.studentId,
    teacher_id: c.teacherId,
    course_id: c.courseId || null,
    topic_tag: c.topicTag || 'General Inquiry',
    unread_count_student: c.unreadCountStudent || 0,
    unread_count_teacher: c.unreadCountTeacher || 0,
    starred_by_teacher: Boolean(c.starredByTeacher),
    teacher_notes: c.teacherNotes || '',
    last_message: c.lastMessage || null,
    updated_at: c.updatedAt || Date.now(),
  };
}

export function rowToMessage(r: any): Message {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    senderRole: r.sender_role,
    senderName: r.sender_name,
    senderAvatar: r.sender_avatar,
    content: r.content,
    timestamp: Number(r.timestamp) || Date.now(),
    status: r.status || 'delivered',
    tag: r.tag || undefined,
    attachments: r.attachments || [],
    bookingProposal: r.booking_proposal || undefined,
  };
}

export function messageToRow(m: Message): any {
  return {
    id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    sender_role: m.senderRole,
    sender_name: m.senderName,
    sender_avatar: m.senderAvatar,
    content: m.content,
    timestamp: m.timestamp,
    status: m.status,
    tag: m.tag || null,
    attachments: m.attachments || [],
    booking_proposal: m.bookingProposal || null,
  };
}

// ==========================================
// SUPABASE ASYNC DATA SERVICE FUNCTIONS
// ==========================================

export async function fetchSupabaseState(): Promise<{
  teachers: TeacherProfile[];
  students: StudentProfile[];
  courses: Course[];
  conversations: Conversation[];
  messages: Message[];
} | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const [
      { data: teachersRows, error: tErr },
      { data: studentsRows, error: sErr },
      { data: coursesRows, error: cErr },
      { data: conversationsRows, error: convErr },
      { data: messagesRows, error: mErr },
    ] = await Promise.all([
      supabase.from('teachers').select('*'),
      supabase.from('students').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('conversations').select('*').order('updated_at', { ascending: false }),
      supabase.from('messages').select('*').order('timestamp', { ascending: true }),
    ]);

    if (tErr || sErr || cErr || convErr || mErr) {
      console.warn('Supabase fetch returned error:', { tErr, sErr, cErr, convErr, mErr });
      return null;
    }

    if (!teachersRows || teachersRows.length === 0) {
      // Database tables might not be populated yet
      return null;
    }

    return {
      teachers: (teachersRows || []).map(rowToTeacher),
      students: (studentsRows || []).map(rowToStudent),
      courses: (coursesRows || []).map(rowToCourse),
      conversations: (conversationsRows || []).map(rowToConversation),
      messages: (messagesRows || []).map(rowToMessage),
    };
  } catch (err) {
    console.warn('Failed to fetch from Supabase:', err);
    return null;
  }
}

export async function insertSupabaseMessage(msg: Message): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const row = messageToRow(msg);
    const { error } = await supabase.from('messages').insert(row);
    if (error) console.warn('Supabase message insert error:', error);
  } catch (err) {
    console.warn('Supabase insertMessage failed:', err);
  }
}

export async function upsertSupabaseConversation(conv: Conversation): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const row = conversationToRow(conv);
    const { error } = await supabase.from('conversations').upsert(row);
    if (error) console.warn('Supabase conversation upsert error:', error);
  } catch (err) {
    console.warn('Supabase upsertConversation failed:', err);
  }
}

export async function updateSupabaseTeacherStatus(
  teacherId: string,
  status: TeacherStatus,
  customMessage?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const payload: any = { status };
    if (customMessage !== undefined) {
      payload.custom_status_message = customMessage;
    }
    const { error } = await supabase
      .from('teachers')
      .update(payload)
      .eq('id', teacherId);
    if (error) console.warn('Supabase teacher status update error:', error);
  } catch (err) {
    console.warn('Supabase updateTeacherStatus failed:', err);
  }
}

export async function updateSupabaseNotes(conversationId: string, notes: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ teacher_notes: notes })
      .eq('id', conversationId);
    if (error) console.warn('Supabase notes update error:', error);
  } catch (err) {
    console.warn('Supabase updateNotes failed:', err);
  }
}

export async function updateSupabaseBookingStatus(
  messageId: string,
  status: 'pending' | 'accepted' | 'declined'
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: msgRow } = await supabase.from('messages').select('booking_proposal').eq('id', messageId).single();
    if (msgRow && msgRow.booking_proposal) {
      const updatedProposal = { ...msgRow.booking_proposal, status };
      await supabase.from('messages').update({ booking_proposal: updatedProposal }).eq('id', messageId);
    }
  } catch (err) {
    console.warn('Supabase updateBookingStatus failed:', err);
  }
}

export async function markSupabaseConversationRead(
  conversationId: string,
  readerRole: 'student' | 'teacher'
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    // 1. Mark unread messages as read
    const otherRole = readerRole === 'student' ? 'teacher' : 'student';
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('conversation_id', conversationId)
      .eq('sender_role', otherRole)
      .neq('status', 'read');

    // 2. Reset unread count on conversation
    const updatePayload =
      readerRole === 'student'
        ? { unread_count_student: 0 }
        : { unread_count_teacher: 0 };

    await supabase.from('conversations').update(updatePayload).eq('id', conversationId);
  } catch (err) {
    console.warn('Supabase markConversationRead failed:', err);
  }
}

export async function upsertSupabaseUser(user: UserProfile): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    if (user.role === 'student') {
      const row = studentToRow(user as StudentProfile);
      await supabase.from('students').upsert(row);
    } else {
      const row = teacherToRow(user as TeacherProfile);
      await supabase.from('teachers').upsert(row);
    }
  } catch (err) {
    console.warn('Supabase upsertUser failed:', err);
  }
}
