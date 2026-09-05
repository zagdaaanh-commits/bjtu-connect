const fs = require('fs');
const path = require('path');
const data = require('./temp_data/data/dummyData.js');

const esc = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (Array.isArray(val)) {
    if (val.length === 0) return "'{}'::text[]";
    if (typeof val[0] === 'number') {
      return 'ARRAY[' + val.join(',') + ']::int[]';
    }
    const escaped = val.map((s) => "'" + String(s).replace(/'/g, "''") + "'");
    return 'ARRAY[' + escaped.join(',') + ']::text[]';
  }
  if (typeof val === 'object') {
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  return "'" + String(val).replace(/'/g, "''") + "'";
};

let sql = `-- ====================================================================
-- BEIJING JIAOTONG UNIVERSITY (BJTU) ACADEMIC CONSULTATION PORTAL
-- SUPABASE POSTGRESQL SCHEMA & REALTIME SETUP SCRIPT
-- ====================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/wgkkotkyyzjstqwgbycn
-- 2. Navigate to the "SQL Editor" tab on the left menu.
-- 3. Click "New query", paste this entire script, and click "Run".
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'student',
    full_name TEXT NOT NULL,
    chinese_name TEXT,
    student_id TEXT UNIQUE NOT NULL,
    faculty TEXT NOT NULL,
    faculty_key TEXT NOT NULL,
    major TEXT NOT NULL,
    grade TEXT NOT NULL,
    class_group TEXT NOT NULL,
    avatar TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    enrolled_course_ids TEXT[] DEFAULT '{}',
    gpa TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'teacher',
    full_name TEXT NOT NULL,
    chinese_name TEXT,
    staff_id TEXT,
    title TEXT NOT NULL,
    faculty TEXT NOT NULL,
    faculty_key TEXT NOT NULL,
    department TEXT NOT NULL,
    office_location TEXT NOT NULL,
    office_hours TEXT NOT NULL,
    courses_taught_ids TEXT[] DEFAULT '{}',
    avatar TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    custom_status_message TEXT,
    research_interests TEXT[] DEFAULT '{}',
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    chinese_name TEXT NOT NULL,
    faculty TEXT NOT NULL,
    faculty_key TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    semester TEXT NOT NULL,
    schedule TEXT NOT NULL,
    classroom TEXT NOT NULL,
    credits NUMERIC DEFAULT 3,
    category TEXT DEFAULT 'required',
    capacity INT DEFAULT 60,
    enrolled_count INT DEFAULT 0,
    day_of_week INT[] DEFAULT '{}',
    period_slot INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    course_id TEXT,
    topic_tag TEXT DEFAULT 'General Inquiry',
    unread_count_student INT DEFAULT 0,
    unread_count_teacher INT DEFAULT 0,
    starred_by_teacher BOOLEAN DEFAULT FALSE,
    teacher_notes TEXT DEFAULT '',
    last_message JSONB,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    status TEXT DEFAULT 'delivered',
    tag TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    booking_proposal JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_student ON public.conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_teacher ON public.conversations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_teachers_faculty ON public.teachers(faculty_key);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(status);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON public.courses(faculty_key);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anon public access for student & faculty portal operations
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access students" ON public.students;
    CREATE POLICY "Public access students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access teachers" ON public.teachers;
    CREATE POLICY "Public access teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access courses" ON public.courses;
    CREATE POLICY "Public access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access conversations" ON public.conversations;
    CREATE POLICY "Public access conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access messages" ON public.messages;
    CREATE POLICY "Public access messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
END
$$;

-- 5. ENABLE SUPABASE REALTIME REPLICATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'teachers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'students') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    END IF;
END
$$;

-- 6. SEED DATA (Beijing Jiaotong University Official Demo Records)
`;

// Seed Teachers
sql += '\n-- Insert Teachers\n';
for (const t of data.INITIAL_TEACHERS) {
  sql += `INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES (${esc(t.id)}, ${esc(t.role)}, ${esc(t.fullName)}, ${esc(t.chineseName)}, ${esc(t.staffId)}, ${esc(t.title)}, ${esc(t.faculty)}, ${esc(t.facultyKey)}, ${esc(t.department)}, ${esc(t.officeLocation)}, ${esc(t.officeHours)}, ${esc(t.coursesTaughtIds)}, ${esc(t.avatar)}, ${esc(t.email)}, ${esc(t.status)}, ${esc(t.customStatusMessage)}, ${esc(t.researchInterests)}, ${esc(t.password || 'bjtu2026')})
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  chinese_name = EXCLUDED.chinese_name,
  staff_id = EXCLUDED.staff_id,
  title = EXCLUDED.title,
  faculty = EXCLUDED.faculty,
  faculty_key = EXCLUDED.faculty_key,
  department = EXCLUDED.department,
  office_location = EXCLUDED.office_location,
  office_hours = EXCLUDED.office_hours,
  courses_taught_ids = EXCLUDED.courses_taught_ids,
  avatar = EXCLUDED.avatar,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  custom_status_message = EXCLUDED.custom_status_message,
  research_interests = EXCLUDED.research_interests;\n`;
}

// Seed Students
sql += '\n-- Insert Students\n';
for (const s of data.INITIAL_STUDENTS) {
  sql += `INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES (${esc(s.id)}, ${esc(s.role)}, ${esc(s.fullName)}, ${esc(s.chineseName)}, ${esc(s.studentId)}, ${esc(s.faculty)}, ${esc(s.facultyKey)}, ${esc(s.major)}, ${esc(s.grade)}, ${esc(s.classGroup)}, ${esc(s.avatar)}, ${esc(s.email)}, ${esc(s.phone)}, ${esc(s.enrolledCourseIds)}, ${esc(s.gpa)}, ${esc(s.password || 'bjtu2026')})
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  chinese_name = EXCLUDED.chinese_name,
  student_id = EXCLUDED.student_id,
  faculty = EXCLUDED.faculty,
  faculty_key = EXCLUDED.faculty_key,
  major = EXCLUDED.major,
  grade = EXCLUDED.grade,
  class_group = EXCLUDED.class_group,
  avatar = EXCLUDED.avatar,
  email = EXCLUDED.email,
  enrolled_course_ids = EXCLUDED.enrolled_course_ids,
  gpa = EXCLUDED.gpa;\n`;
}

// Seed Courses
sql += '\n-- Insert Courses\n';
for (const c of data.COURSES) {
  sql += `INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES (${esc(c.id)}, ${esc(c.code)}, ${esc(c.name)}, ${esc(c.chineseName)}, ${esc(c.faculty)}, ${esc(c.facultyKey)}, ${esc(c.teacherId)}, ${esc(c.semester)}, ${esc(c.schedule)}, ${esc(c.classroom)}, ${esc(c.credits)}, ${esc(c.category)}, ${esc(c.capacity)}, ${esc(c.enrolledCount)}, ${esc(c.dayOfWeek)}, ${esc(c.periodSlot)})
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  chinese_name = EXCLUDED.chinese_name,
  faculty = EXCLUDED.faculty,
  faculty_key = EXCLUDED.faculty_key,
  teacher_id = EXCLUDED.teacher_id,
  semester = EXCLUDED.semester,
  schedule = EXCLUDED.schedule,
  classroom = EXCLUDED.classroom,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category;\n`;
}

// Seed Conversations
sql += '\n-- Insert Conversations\n';
for (const conv of data.INITIAL_CONVERSATIONS) {
  sql += `INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES (${esc(conv.id)}, ${esc(conv.studentId)}, ${esc(conv.teacherId)}, ${esc(conv.courseId)}, ${esc(conv.topicTag)}, ${esc(conv.unreadCountStudent)}, ${esc(conv.unreadCountTeacher)}, ${esc(conv.starredByTeacher)}, ${esc(conv.teacherNotes)}, ${esc(conv.lastMessage)}, ${esc(conv.updatedAt)})
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;\n`;
}

// Seed Messages
sql += '\n-- Insert Messages\n';
for (const m of data.INITIAL_MESSAGES) {
  sql += `INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES (${esc(m.id)}, ${esc(m.conversationId)}, ${esc(m.senderId)}, ${esc(m.senderRole)}, ${esc(m.senderName)}, ${esc(m.senderAvatar)}, ${esc(m.content)}, ${esc(m.timestamp)}, ${esc(m.status)}, ${esc(m.tag)}, ${esc(m.attachments || [])}, ${esc(m.bookingProposal)})
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  booking_proposal = EXCLUDED.booking_proposal;\n`;
}

if (!fs.existsSync('supabase')) {
  fs.mkdirSync('supabase');
}
fs.writeFileSync('supabase/schema.sql', sql, 'utf8');
console.log('Successfully generated supabase/schema.sql, size:', sql.length, 'bytes');
