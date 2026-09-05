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
import {
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  COURSES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
} from '../data/dummyData';
import { broadcastEvent } from './realtime';
import {
  isSupabaseConfigured,
  fetchSupabaseState,
  insertSupabaseMessage,
  upsertSupabaseConversation,
  updateSupabaseTeacherStatus,
  updateSupabaseNotes,
  updateSupabaseBookingStatus,
  markSupabaseConversationRead,
  upsertSupabaseUser,
} from './supabase';

const STORAGE_KEYS = {
  TEACHERS: 'bjtu_portal_teachers_v3',
  STUDENTS: 'bjtu_portal_students_v3',
  COURSES: 'bjtu_portal_courses_v3',
  CONVERSATIONS: 'bjtu_portal_conversations_v3',
  MESSAGES: 'bjtu_portal_messages_v3',
  CURRENT_USER: 'bjtu_portal_current_user_v3',
};

export interface PortalState {
  teachers: TeacherProfile[];
  students: StudentProfile[];
  courses: Course[];
  conversations: Conversation[];
  messages: Message[];
  currentUser: UserProfile | null;
}

export function initializePortalStorage(): PortalState {
  if (typeof window === 'undefined') {
    return {
      teachers: INITIAL_TEACHERS,
      students: INITIAL_STUDENTS,
      courses: COURSES,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      currentUser: null,
    };
  }

  try {
    const rawTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    const rawConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const rawMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const rawCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (!rawTeachers || !rawStudents || !rawConversations || !rawMessages) {
      resetPortalStorage();
      return {
        teachers: INITIAL_TEACHERS,
        students: INITIAL_STUDENTS,
        courses: COURSES,
        conversations: INITIAL_CONVERSATIONS,
        messages: INITIAL_MESSAGES,
        currentUser: null,
      };
    }

    let teachers: TeacherProfile[] = INITIAL_TEACHERS;
    if (rawTeachers) {
      try {
        const parsed: TeacherProfile[] = JSON.parse(rawTeachers);
        const parsedIds = new Set(parsed.map((t) => t.id));
        const missingSeeds = INITIAL_TEACHERS.filter((t) => !parsedIds.has(t.id));
        teachers = [
          ...parsed.map((t) => {
            const seed = INITIAL_TEACHERS.find((s) => s.id === t.id);
            const isTAnhaa =
              t.id === 'teacher_1788593795967' ||
              (t as any).staffId === 'T25239002' ||
              (t as any).staff_id === 'T25239002' ||
              t.email === '25239003@bjtu.edu.cn' ||
              (t.fullName && t.fullName.toLowerCase().includes('anhaa')) ||
              ((t as any).full_name && (t as any).full_name.toLowerCase().includes('anhaa')) ||
              t.role === 'admin' ||
              (t as any).is_admin === true ||
              (t as any).isAdmin === true;
            if (isTAnhaa) {
              return { ...(seed || {}), ...t, role: 'admin' as const, isAdmin: true, is_admin: true };
            }
            return seed ? { ...seed, ...t } : t;
          }),
          ...missingSeeds,
        ];
        if (missingSeeds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
        }
      } catch {
        teachers = INITIAL_TEACHERS;
      }
    }
    let students: StudentProfile[] = INITIAL_STUDENTS;
    if (rawStudents) {
      try {
        const parsed: StudentProfile[] = JSON.parse(rawStudents);
        const parsedIds = new Set(parsed.map((s) => s.id));
        const missingSeeds = INITIAL_STUDENTS.filter((s) => !parsedIds.has(s.id));
        students = [
          ...parsed.map((s) => {
            const seed = INITIAL_STUDENTS.find((init) => init.id === s.id);
            const isSAnhaa =
              s.id === 'student_4' ||
              (s as any).studentId === '25239002' ||
              (s as any).student_id === '25239002' ||
              s.email === 'anhaa@bjtu.edu.cn' ||
              (s.fullName && s.fullName.toLowerCase().includes('anhaa')) ||
              ((s as any).full_name && (s as any).full_name.toLowerCase().includes('anhaa')) ||
              s.role === 'admin' ||
              (s as any).is_admin === true ||
              (s as any).isAdmin === true;
            if (isSAnhaa) {
              return { ...(seed || {}), ...s, role: 'admin' as const, isAdmin: true, is_admin: true };
            }
            return seed ? { ...seed, ...s } : s;
          }),
          ...missingSeeds,
        ];
        if (missingSeeds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        }
      } catch {
        students = INITIAL_STUDENTS;
      }
    }

    let courses: Course[] = COURSES;
    if (rawCourses) {
      try {
        const parsed: Course[] = JSON.parse(rawCourses);
        const parsedIds = new Set(parsed.map((c) => c.id));
        const missingSeeds = COURSES.filter((c) => !parsedIds.has(c.id));
        courses = [...parsed, ...missingSeeds].map((c) => {
          const seed = COURSES.find((s) => s.id === c.id);
          return seed ? { ...seed, ...c } : c;
        });
      } catch {
        courses = COURSES;
      }
    }

    let conversations: Conversation[] = INITIAL_CONVERSATIONS;
    if (rawConversations) {
      try {
        const parsed: Conversation[] = JSON.parse(rawConversations);
        const parsedIds = new Set(parsed.map((c) => c.id));
        const missingSeeds = INITIAL_CONVERSATIONS.filter((c) => !parsedIds.has(c.id));
        conversations = [...parsed, ...missingSeeds];
        if (missingSeeds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        }
      } catch {
        conversations = INITIAL_CONVERSATIONS;
      }
    }

    let messages: Message[] = INITIAL_MESSAGES;
    if (rawMessages) {
      try {
        const parsed: Message[] = JSON.parse(rawMessages);
        const parsedIds = new Set(parsed.map((m) => m.id));
        const missingSeeds = INITIAL_MESSAGES.filter((m) => !parsedIds.has(m.id));
        messages = [...parsed, ...missingSeeds];
        if (missingSeeds.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        }
      } catch {
        messages = INITIAL_MESSAGES;
      }
    }

    let currentUser = rawCurrentUser ? JSON.parse(rawCurrentUser) : null;
    if (currentUser) {
      const isCurAnhaa =
        currentUser.id === 'student_4' ||
        currentUser.id === 'teacher_1788593795967' ||
        currentUser.studentId === '25239002' ||
        (currentUser as any).student_id === '25239002' ||
        currentUser.staffId === 'T25239002' ||
        (currentUser as any).staff_id === 'T25239002' ||
        currentUser.email === 'anhaa@bjtu.edu.cn' ||
        currentUser.email === '25239003@bjtu.edu.cn' ||
        (currentUser.fullName && currentUser.fullName.toLowerCase().includes('anhaa')) ||
        ((currentUser as any).full_name && (currentUser as any).full_name.toLowerCase().includes('anhaa')) ||
        (currentUser.chineseName && currentUser.chineseName.toLowerCase().includes('anhaa')) ||
        currentUser.role === 'admin' ||
        (currentUser as any).is_admin === true ||
        (currentUser as any).isAdmin === true;

      if (isCurAnhaa) {
        currentUser = { ...currentUser, role: 'admin', isAdmin: true, is_admin: true };
        if (typeof window !== 'undefined') {
          localStorage.setItem('bjtu_admin_session', 'true');
          localStorage.setItem('bjtu_admin_user_id', currentUser.id);
        }
      }
    }

    return { teachers, students, courses, conversations, messages, currentUser };
  } catch (err) {
    console.error('Error reading portal storage, falling back to seed data:', err);
    return {
      teachers: INITIAL_TEACHERS,
      students: INITIAL_STUDENTS,
      courses: COURSES,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      currentUser: null,
    };
  }
}

export function resetPortalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(COURSES));
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  broadcastEvent({ type: 'DATA_RESET' });
}

export function getStoredState(): PortalState {
  return initializePortalStorage();
}

export function isUserAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  const isAnhaa = Boolean(
    user.id === 'student_4' ||
      user.id === 'teacher_1788593795967' ||
      (user as any).studentId === '25239002' ||
      (user as any).student_id === '25239002' ||
      (user as any).staffId === 'T25239002' ||
      (user as any).staff_id === 'T25239002' ||
      user.email === 'anhaa@bjtu.edu.cn' ||
      user.email === '25239003@bjtu.edu.cn' ||
      (user.fullName && user.fullName.toLowerCase().includes('anhaa')) ||
      ((user as any).full_name && (user as any).full_name.toLowerCase().includes('anhaa')) ||
      (user.chineseName && user.chineseName.toLowerCase().includes('anhaa')) ||
      user.role === 'admin' ||
      (user as any).is_admin === true ||
      (user as any).is_admin === 'true' ||
      (user as any).isAdmin === true ||
      (user as any).isAdmin === 'true'
  );
  if (isAnhaa) return true;
  if (typeof window !== 'undefined' && localStorage.getItem('bjtu_admin_session') === 'true') {
    return true;
  }
  return false;
}

export function loginUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  const isAdmin =
    user.role === 'admin' ||
    (user as any).is_admin === true ||
    (user as any).is_admin === 'true' ||
    (user as any).isAdmin === true ||
    (user as any).isAdmin === 'true';

  if (isAdmin) {
    localStorage.setItem('bjtu_admin_session', 'true');
    localStorage.setItem('bjtu_admin_user_id', user.id);
  } else {
    localStorage.removeItem('bjtu_admin_session');
    localStorage.removeItem('bjtu_admin_user_id');
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  broadcastEvent({ type: 'USER_SWITCHED', payload: user });
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem('bjtu_admin_session');
  localStorage.removeItem('bjtu_admin_user_id');
  broadcastEvent({ type: 'USER_LOGGED_OUT' });
}

export function registerStudent(data: {
  fullName: string;
  chineseName?: string;
  studentId: string;
  faculty: string;
  facultyKey: any;
  major: string;
  grade: string;
  classGroup: string;
  email: string;
  avatar?: string;
}): StudentProfile {
  const state = getStoredState();
  const newStudent: StudentProfile = {
    id: `student_${Date.now()}`,
    role: 'student',
    fullName: data.fullName,
    chineseName: data.chineseName,
    studentId: data.studentId,
    faculty: data.faculty,
    facultyKey: data.facultyKey,
    major: data.major,
    grade: data.grade,
    classGroup: data.classGroup,
    avatar:
      data.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    email: data.email,
    enrolledCourseIds: ['course_cs201', 'course_ai405'],
    gpa: '3.80 / 4.0',
  };

  const updatedStudents = [...state.students, newStudent];
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));
  loginUser(newStudent);
  if (isSupabaseConfigured()) {
    upsertSupabaseUser(newStudent);
  }
  return newStudent;
}

export function registerTeacher(data: {
  fullName: string;
  chineseName?: string;
  staffId?: string;
  title: string;
  faculty: string;
  facultyKey: any;
  department: string;
  officeLocation: string;
  officeHours: string;
  email: string;
  avatar?: string;
}): TeacherProfile {
  const state = getStoredState();
  const newTeacher: TeacherProfile = {
    id: `teacher_${Date.now()}`,
    role: 'teacher',
    fullName: data.fullName,
    chineseName: data.chineseName,
    staffId: data.staffId || `BJTU-T${Math.floor(10000 + Math.random() * 90000)}`,
    title: data.title,
    faculty: data.faculty,
    facultyKey: data.facultyKey,
    department: data.department,
    officeLocation: data.officeLocation,
    officeHours: data.officeHours,
    coursesTaughtIds: ['course_cs201'],
    avatar:
      data.avatar ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: data.email,
    status: 'available',
    customStatusMessage: 'Office doors open. Welcome for consultations.',
    researchInterests: ['Intelligent Transportation Systems', 'Distributed Computing'],
  };

  const updatedTeachers = [...state.teachers, newTeacher];
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedTeachers));
  loginUser(newTeacher);
  if (isSupabaseConfigured()) {
    upsertSupabaseUser(newTeacher);
  }
  return newTeacher;
}

export function switchCurrentUser(userId: string, role: 'student' | 'teacher'): UserProfile {
  const state = getStoredState();
  let user: UserProfile | undefined;
  if (role === 'teacher') {
    user = state.teachers.find((t) => t.id === userId) || state.teachers[0];
  } else {
    user = state.students.find((s) => s.id === userId) || state.students[0];
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  broadcastEvent({ type: 'USER_SWITCHED', payload: user });
  return user;
}

export function updateTeacherStatus(teacherId: string, status: TeacherStatus, customMessage?: string): void {
  const state = getStoredState();
  const updatedTeachers = state.teachers.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        status,
        customStatusMessage: customMessage !== undefined ? customMessage : t.customStatusMessage,
      };
    }
    return t;
  });

  if (state.currentUser && state.currentUser.id === teacherId) {
    const updatedCurrentUser = {
      ...state.currentUser,
      status,
      customStatusMessage: customMessage !== undefined ? customMessage : (state.currentUser as TeacherProfile).customStatusMessage,
    } as TeacherProfile;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedCurrentUser));
  }

  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedTeachers));
  broadcastEvent({ type: 'TEACHER_STATUS_UPDATED', payload: { teacherId, status, customMessage } });
  if (isSupabaseConfigured()) {
    updateSupabaseTeacherStatus(teacherId, status, customMessage);
  }
}

export function updateTeacherNotes(conversationId: string, notes: string): void {
  const state = getStoredState();
  const updated = state.conversations.map((c) => {
    if (c.id === conversationId) {
      return { ...c, teacherNotes: notes };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
  broadcastEvent({ type: 'NOTES_UPDATED', payload: { conversationId, notes } });
  if (isSupabaseConfigured()) {
    updateSupabaseNotes(conversationId, notes);
  }
}

export function markConversationRead(conversationId: string, readerRole: 'student' | 'teacher'): void {
  const state = getStoredState();

  const updatedMessages = state.messages.map((m) => {
    if (m.conversationId === conversationId && m.senderRole !== readerRole && m.status !== 'read') {
      return { ...m, status: 'read' as const };
    }
    return m;
  });

  const updatedConversations = state.conversations.map((c) => {
    if (c.id === conversationId) {
      return {
        ...c,
        unreadCountStudent: readerRole === 'student' ? 0 : c.unreadCountStudent,
        unreadCountTeacher: readerRole === 'teacher' ? 0 : c.unreadCountTeacher,
        lastMessage: c.lastMessage && c.lastMessage.senderId !== (readerRole === 'student' ? c.studentId : c.teacherId)
          ? { ...c.lastMessage, status: 'read' as const }
          : c.lastMessage,
      };
    }
    return c;
  });

  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updatedConversations));
  broadcastEvent({ type: 'CONVERSATION_READ', payload: { conversationId, readerRole } });
  if (isSupabaseConfigured()) {
    markSupabaseConversationRead(conversationId, readerRole);
  }
}

export function createOrGetConversation(studentId: string, teacherId: string, courseId?: string, tag?: InquiryTag): Conversation {
  const state = getStoredState();
  let conv = state.conversations.find((c) => c.studentId === studentId && c.teacherId === teacherId);

  if (!conv) {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      teacherId,
      courseId,
      topicTag: tag || 'General Inquiry',
      unreadCountStudent: 0,
      unreadCountTeacher: 0,
      starredByTeacher: false,
      teacherNotes: '',
      updatedAt: Date.now(),
    };
    const updated = [newConv, ...state.conversations];
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
    broadcastEvent({ type: 'CONVERSATION_CREATED', payload: newConv });
    if (isSupabaseConfigured()) {
      upsertSupabaseConversation(newConv);
    }
    return newConv;
  }

  if (tag && conv.topicTag !== tag) {
    conv = { ...conv, topicTag: tag };
    const updated = state.conversations.map((c) => (c.id === conv!.id ? conv! : c));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
    if (isSupabaseConfigured()) {
      upsertSupabaseConversation(conv);
    }
  }

  return conv;
}

export function sendPortalMessage(params: {
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'teacher';
  senderName: string;
  senderAvatar: string;
  content: string;
  tag?: InquiryTag;
  attachments?: Attachment[];
  bookingProposal?: Message['bookingProposal'];
}): Message {
  const state = getStoredState();
  const newMsg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderRole: params.senderRole,
    senderName: params.senderName,
    senderAvatar: params.senderAvatar,
    content: params.content,
    timestamp: Date.now(),
    status: 'delivered',
    tag: params.tag,
    attachments: params.attachments,
    bookingProposal: params.bookingProposal,
  };

  const updatedMessages = [...state.messages, newMsg];

  const updatedConversations = state.conversations.map((c) => {
    if (c.id === params.conversationId) {
      return {
        ...c,
        updatedAt: newMsg.timestamp,
        topicTag: params.tag || c.topicTag,
        unreadCountStudent: params.senderRole === 'teacher' ? c.unreadCountStudent + 1 : c.unreadCountStudent,
        unreadCountTeacher: params.senderRole === 'student' ? c.unreadCountTeacher + 1 : c.unreadCountTeacher,
        lastMessage: {
          content: params.content,
          timestamp: newMsg.timestamp,
          senderId: params.senderId,
          status: 'delivered' as const,
          tag: params.tag,
        },
      };
    }
    return c;
  });

  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updatedConversations));
  broadcastEvent({ type: 'NEW_MESSAGE', payload: newMsg });

  if (isSupabaseConfigured()) {
    insertSupabaseMessage(newMsg);
    const convToUpdate = updatedConversations.find((c) => c.id === params.conversationId);
    if (convToUpdate) {
      upsertSupabaseConversation(convToUpdate);
    }
  }

  return newMsg;
}

export function updateBookingProposalStatus(
  conversationId: string,
  messageId: string,
  status: 'accepted' | 'declined'
): void {
  const state = getStoredState();
  const updatedMessages = state.messages.map((m) => {
    if (m.id === messageId && m.bookingProposal) {
      return {
        ...m,
        bookingProposal: {
          ...m.bookingProposal,
          status,
        },
      };
    }
    return m;
  });

  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
  broadcastEvent({ type: 'BOOKING_STATUS_CHANGED', payload: { conversationId, messageId, status } });
  if (isSupabaseConfigured()) {
    updateSupabaseBookingStatus(messageId, status);
  }
}

export function updateProfile(updated: UserProfile): void {
  const state = getStoredState();
  if (updated.role === 'teacher') {
    const updatedTeachers = state.teachers.map((t) => (t.id === updated.id ? (updated as TeacherProfile) : t));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedTeachers));
  } else {
    const updatedStudents = state.students.map((s) => (s.id === updated.id ? (updated as StudentProfile) : s));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));
  }

  // Synchronize avatar and full name in all messages sent by this user
  const updatedMessages = state.messages.map((m) => {
    if (m.senderId === updated.id) {
      return { ...m, senderAvatar: updated.avatar, senderName: updated.fullName };
    }
    return m;
  });
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  broadcastEvent({ type: 'PROFILE_UPDATED', payload: updated });
  if (isSupabaseConfigured()) {
    upsertSupabaseUser(updated);
  }
}

export function updateUserAvatar(newAvatar: string): void {
  const state = getStoredState();
  if (state.currentUser) {
    const updated = { ...state.currentUser, avatar: newAvatar };
    updateProfile(updated);
  }
}

export function enrollStudentCourse(studentId: string, courseId: string): { success: boolean; message: string } {
  const state = getStoredState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return { success: false, message: 'Student not found' };

  if (student.enrolledCourseIds.includes(courseId)) {
    return { success: false, message: 'Already enrolled in this course (该课程已选)' };
  }

  const courseList = state.courses && state.courses.length > 0 ? state.courses : COURSES;
  const course = courseList.find((c) => c.id === courseId);
  if (!course) return { success: false, message: 'Course not found' };

  // Calculate current total credits
  const currentCourses = courseList.filter((c) => student.enrolledCourseIds.includes(c.id));
  const currentCredits = currentCourses.reduce((sum, c) => sum + c.credits, 0);
  if (currentCredits + course.credits > 28) {
    return {
      success: false,
      message: `Cannot exceed maximum 28 credits (超出学分上限28学分，当前已选${currentCredits}学分)`,
    };
  }

  const updatedCourseIds = [...student.enrolledCourseIds, courseId];
  const updatedStudent: StudentProfile = {
    ...student,
    enrolledCourseIds: updatedCourseIds,
  };

  const updatedStudents = state.students.map((s) => (s.id === studentId ? updatedStudent : s));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

  if (state.currentUser && state.currentUser.id === studentId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedStudent));
  }

  // Update course enrolledCount
  const updatedCourses = courseList.map((c) => {
    if (c.id === courseId) {
      return { ...c, enrolledCount: (c.enrolledCount || 0) + 1 };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));

  broadcastEvent({
    type: 'PROFILE_UPDATED',
    payload: updatedStudent,
  });

  return { success: true, message: `Successfully enrolled in ${course.code} (选课成功)` };
}

export function dropStudentCourse(studentId: string, courseId: string): { success: boolean; message: string } {
  const state = getStoredState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return { success: false, message: 'Student not found' };

  if (!student.enrolledCourseIds.includes(courseId)) {
    return { success: false, message: 'Not enrolled in this course (未选修该课程)' };
  }

  const courseList = state.courses && state.courses.length > 0 ? state.courses : COURSES;
  const course = courseList.find((c) => c.id === courseId);
  const updatedCourseIds = student.enrolledCourseIds.filter((id) => id !== courseId);
  const updatedStudent: StudentProfile = {
    ...student,
    enrolledCourseIds: updatedCourseIds,
  };

  const updatedStudents = state.students.map((s) => (s.id === studentId ? updatedStudent : s));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

  if (state.currentUser && state.currentUser.id === studentId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedStudent));
  }

  // Decrement course enrolledCount
  const updatedCourses = courseList.map((c) => {
    if (c.id === courseId && c.enrolledCount && c.enrolledCount > 0) {
      return { ...c, enrolledCount: c.enrolledCount - 1 };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));

  broadcastEvent({
    type: 'PROFILE_UPDATED',
    payload: updatedStudent,
  });

  return { success: true, message: `Dropped ${course?.code || ''} from enrolled courses (退选成功)` };
}

export function createCustomCourse(
  data: {
    code: string;
    name: string;
    chineseName?: string;
    faculty: string;
    facultyKey: any;
    teacherId?: string;
    customTeacherName?: string;
    semester?: string;
    schedule?: string;
    classroom: string;
    credits: number;
    category?: 'required' | 'elective' | 'general';
    capacity?: number;
    dayOfWeek?: number[];
    periodSlot?: number;
  },
  studentIdToEnroll?: string
): Course {
  const state = getStoredState();

  // If a custom teacher name was provided and no teacherId, find or attach to a default or create placeholder
  let assignedTeacherId = data.teacherId;
  if (!assignedTeacherId || assignedTeacherId === 'custom') {
    const defaultTeacher = state.teachers.find((t) => t.facultyKey === data.facultyKey) || state.teachers[0];
    assignedTeacherId = defaultTeacher?.id || 'teacher_1';
  }

  const daysText = (data.dayOfWeek || [1])
    .map((d) => (d === 1 ? 'Mon' : d === 2 ? 'Tue' : d === 3 ? 'Wed' : d === 4 ? 'Thu' : 'Fri'))
    .join(', ');

  const periodTimes: Record<number, string> = {
    1: '08:00-09:35',
    2: '10:00-11:35',
    3: '14:00-15:35',
    4: '16:00-17:35',
    5: '19:00-20:35',
  };
  const timeStr = periodTimes[data.periodSlot || 1] || '08:00-09:35';
  const finalSchedule = data.schedule || `${daysText} ${timeStr}`;

  const newCourse: Course = {
    id: `course_custom_${Date.now()}`,
    code: data.code.trim().toUpperCase(),
    name: data.name.trim(),
    chineseName: data.chineseName?.trim() || data.name.trim(),
    faculty: data.faculty,
    facultyKey: data.facultyKey,
    teacherId: assignedTeacherId,
    semester: data.semester || 'Fall 2026',
    schedule: finalSchedule,
    classroom: data.classroom.trim() || 'Siyuan Building (思源楼)',
    credits: Number(data.credits) || 3,
    category: data.category || 'elective',
    capacity: Number(data.capacity) || 50,
    enrolledCount: studentIdToEnroll ? 1 : 0,
    dayOfWeek: data.dayOfWeek && data.dayOfWeek.length > 0 ? data.dayOfWeek : [1],
    periodSlot: Number(data.periodSlot) || 1,
  };

  const updatedCourses = [newCourse, ...state.courses];
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));

  if (studentIdToEnroll) {
    enrollStudentCourse(studentIdToEnroll, newCourse.id);
  }

  broadcastEvent({
    type: 'PROFILE_UPDATED',
    payload: newCourse,
  });

  return newCourse;
}

/**
 * Hydrates local storage state from Supabase PostgreSQL database if available
 */
export async function hydrateFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const data = await fetchSupabaseState();
    if (!data) return false;

    if (data.teachers && data.teachers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(data.teachers));
    }
    if (data.students && data.students.length > 0) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    }
    if (data.courses && data.courses.length > 0) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(data.courses));
    }
    if (data.conversations && data.conversations.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversations));
    }
    if (data.messages && data.messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
    }

    // Keep currentUser up-to-date with fresh Supabase profile data & admin flags
    const rawCurUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawCurUser) {
      try {
        const curUser = JSON.parse(rawCurUser);
        const freshUser =
          data.students?.find((s) => s.id === curUser.id) ||
          data.teachers?.find((t) => t.id === curUser.id);
        if (freshUser) {
          const merged = { ...curUser, ...freshUser };
          const isAnhaaUser =
            merged.id === 'student_4' ||
            merged.id === 'teacher_1788593795967' ||
            merged.studentId === '25239002' ||
            (merged as any).student_id === '25239002' ||
            merged.staffId === 'T25239002' ||
            (merged as any).staff_id === 'T25239002' ||
            merged.email === 'anhaa@bjtu.edu.cn' ||
            merged.email === '25239003@bjtu.edu.cn' ||
            (merged.fullName && merged.fullName.toLowerCase().includes('anhaa')) ||
            ((merged as any).full_name && (merged as any).full_name.toLowerCase().includes('anhaa')) ||
            merged.role === 'admin' ||
            merged.is_admin === true ||
            merged.isAdmin === true;

          if (isAnhaaUser) {
            merged.role = 'admin';
            merged.isAdmin = true;
            merged.is_admin = true;
            localStorage.setItem('bjtu_admin_session', 'true');
            localStorage.setItem('bjtu_admin_user_id', merged.id);
          }
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(merged));
        }
      } catch (e) {
        // Silently ignore corrupted session
      }
    }

    broadcastEvent({ type: 'DATA_RESET' });
    return true;
  } catch (err) {
    console.warn('Hydration from Supabase encountered error:', err);
    return false;
  }
}


