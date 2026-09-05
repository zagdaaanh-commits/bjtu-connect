-- ====================================================================
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

-- Insert Teachers
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_chen_zhang', 'teacher', 'Prof. Chen Zhang', '张晨', 'T2018092', 'IEEE Fellow & Professor', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'School of Computer & Information Technology', 'Siyuan Hall 402 (思源楼402)', 'Tue & Thu 14:00 - 17:00', ARRAY['course_cs201','course_ai405']::text[], 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQKPrt-I2VNAUYYXmhphKcPo0bf1AA8q7moxA7W08n4dz5VM2wLH9v52LyXhXyeYHCQxJvCvLkvsTXjhDva0ZvRPQ4delQU9Wb9hRI_xYepHEH0sU10cHJQI5y2oqkzPDRvUte74Bi4vDi7pu6IWqR2q010aCkU_nxrKX8rbSytIIKQrYej-aGpUjhIjTO1xHtuN0MdrXS9b5xX_AIvUfOaZDl8sIxfkN4OeFkB2sRM-IvlVbeyLUr', 'chen.zhang@bjtu.edu.cn', 'available', 'Live in Siyuan Hall 402. Focus: Autonomous Rail Safety & Edge Neural Networks.', ARRAY['Autonomous Rail Safety','Edge Neural Networks','Distributed Optimization']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_1', 'teacher', 'Prof. Jian Wang', '王建', 'BJTU-T10024', 'Associate Professor & Vice Dean', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'Dept. of Computer Science & AI', 'Siyuan East Building 402B (思源东楼402B)', 'Tue & Thu 14:00 - 16:30', ARRAY['course_cs201','course_ai405']::text[], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'j.wang@bjtu.edu.cn', 'available', 'Office doors open in Siyuan East 402B. Welcome for CS201 questions.', ARRAY['Rail Transit Algorithms','Distributed AI','Knowledge Graphs']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_2', 'teacher', 'Prof. Chen Liu', '刘晨', 'BJTU-T10088', 'Professor & Doctoral Supervisor', 'School of Economics and Management (经济管理学院)', 'sem', 'Dept. of Logistics & Supply Chain Finance', 'Siyuan Building 718 (思源楼718)', 'Mon & Wed 15:00 - 17:00', ARRAY['course_fin301']::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'chen.liu@bjtu.edu.cn', 'office_hours', 'In Office Hours! Siyuan 718 available for drop-in thesis consultations.', ARRAY['Transportation Economics','Supply Chain Finance','Digital Infrastructure']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_3', 'teacher', 'Prof. Yue Lin', '林悦', 'BJTU-T10115', 'Associate Professor', 'School of Law (法学院)', 'law', 'Dept. of Transportation & Intellectual Property Law', 'Yifu Building 305 (逸夫楼305)', 'Wednesday 10:00 - 12:00', ARRAY['course_law102']::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'yue.lin@bjtu.edu.cn', 'in_meeting', 'In academic symposium until 16:00. Messages will be replied today.', ARRAY['Autonomous Driving Ethics & Law','IP in High-Tech','Patent Governance']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_4', 'teacher', 'Dr. Peng Zhao', '赵鹏', 'BJTU-T10230', 'Associate Professor', 'School of Traffic and Transportation (交通运输学院)', 'trans', 'Dept. of Railway Transportation Management', 'Mechanical Building 210 (机械楼210)', 'Friday 14:00 - 16:00', ARRAY['course_trans204']::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'peng.zhao@bjtu.edu.cn', 'offline', 'Conducting high-speed railway dispatch field tests. Reachable via portal.', ARRAY['High-Speed Railway Dispatch','Network Flow Optimization','Traffic Simulation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_5', 'teacher', 'Prof. Meiling Zhang', '张美玲', 'BJTU-T10302', 'Distinguished Professor', 'School of Electronic and Information Engineering (电子信息工程学院)', 'ee', 'Dept. of Communication Engineering', 'No. 9 Teaching Building 512 (九号教学楼512)', 'Tuesday 09:30 - 11:30', ARRAY['course_ee305']::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'ml.zhang@bjtu.edu.cn', 'available', 'Available for lab inquiries and 5G-R wireless communication topics.', ARRAY['5G-R / 6G Rail Transit Comms','Satellite-Terrestrial Networks','Signal Processing']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_6', 'teacher', 'Prof. Hongwei Sun', '孙宏伟', 'BJTU-T10411', 'Professor & Dean', 'School of Automation and Intelligence (自动化与智能学院)', 'ai', 'Dept. of Intelligent Control & Robotics', 'No. 9 Teaching Building 408 (九号教学楼408)', 'Thursday 15:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 'hw.sun@bjtu.edu.cn', 'available', 'Consulting on intelligent train autopilot & pattern recognition.', ARRAY['Intelligent Train Autopilot','Robot Perception','Adaptive Control Systems']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_7', 'teacher', 'Prof. Lin Tao', '陶林', 'BJTU-T10522', 'Associate Professor', 'School of Software Engineering (软件学院)', 'se', 'Dept. of Software Architecture & Cloud Computing', 'Yifu Building 412 (逸夫楼412)', 'Monday 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'l.tao@bjtu.edu.cn', 'office_hours', 'Office hours open for software design capstones and full-stack projects.', ARRAY['Cloud Native Microservices','High-Concurrency Systems','Software Verification']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_8', 'teacher', 'Prof. Guofeng Song', '宋国峰', 'BJTU-T10633', 'Professor & Lab Director', 'School of Cyberspace Security (网络空间安全学院)', 'sec', 'Dept. of Cryptography & Rail Network Security', 'Siyuan East Building 601 (思源东楼601)', 'Wednesday 14:00 - 16:00', '{}'::text[], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'gf.song@bjtu.edu.cn', 'available', 'Welcoming discussions on rail signaling cybersecurity and zero-trust systems.', ARRAY['Rail Network Security','Quantum-Resistant Cryptography','Zero Trust Architecture']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_9', 'teacher', 'Prof. Minghua Wu', '吴明华', 'BJTU-T10744', 'Professor & Doctoral Supervisor', 'School of Civil Engineering (土木建筑工程学院)', 'civil', 'Dept. of Bridge & Tunnel Engineering', 'Civil Engineering Hall 206 (土木工程楼206)', 'Tuesday 14:30 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'mh.wu@bjtu.edu.cn', 'available', 'Available for consultations on high-speed rail bridges & underground structures.', ARRAY['High-Speed Rail Bridge Dynamics','Tunnel Structural Health','Seismic Engineering']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_10', 'teacher', 'Prof. Dexiang Han', '韩德祥', 'BJTU-T10855', 'Distinguished Professor & Honors Dean', 'Zhan Tianyou College (詹天佑学院)', 'zty', 'Elite Engineering Honors Program', 'Tianyou Hall 101 (天佑大楼101)', 'Thursday 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'dx.han@bjtu.edu.cn', 'available', 'Zhan Tianyou Honors college academic mentoring & cross-disciplinary inquiries.', ARRAY['Interdisciplinary Transportation Engineering','Future Rail Systems','Talent Incubation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_11', 'teacher', 'Prof. Haoyu Ding', '丁浩宇', 'BJTU-T10911', 'Professor & Lab Chair', 'School of Mechanical, Electronic and Control Engineering (机械与电子控制工程学院)', 'mece', 'Dept. of Railway Vehicle Engineering', 'Mechanical Engineering Building 304 (机械工程楼304)', 'Monday 09:00 - 11:30', '{}'::text[], 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', 'hy.ding@bjtu.edu.cn', 'available', 'Open for locomotive dynamics & structural health monitoring queries.', ARRAY['Locomotive Dynamics','Intelligent Manufacturing','Condition Monitoring']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_12', 'teacher', 'Prof. Rui Kang', '康瑞', 'BJTU-T11022', 'Professor & Doctoral Supervisor', 'School of Electrical Engineering (电气工程学院)', 'elec', 'Dept. of Traction Power & Renewable Energy', 'Electrical Engineering Hall 415 (电气工程楼415)', 'Tuesday 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'r.kang@bjtu.edu.cn', 'available', 'Office open for high-speed rail traction power supply & smart grid topics.', ARRAY['Rail Traction Power Systems','Smart Grids','Renewable Energy Integration']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_13', 'teacher', 'Prof. Zhenhua Feng', '冯振华', 'BJTU-T11133', 'Professor', 'School of Systems Science (系统科学学院)', 'sys', 'Dept. of Complex Systems Modeling', 'Science Building 602 (理科楼602)', 'Wednesday 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'zh.feng@bjtu.edu.cn', 'office_hours', 'In office hours! Drop in for complex network analysis and systemic simulation.', ARRAY['Complex Transportation Networks','System Dynamics','Network Science']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_14', 'teacher', 'Prof. Xiaoyan Lu', '陆晓燕', 'BJTU-T11244', 'Associate Professor', 'School of Environment (环境学院)', 'env', 'Dept. of Ecological Transit & Carbon Neutrality', 'Environment Building 310 (环境楼310)', 'Friday 09:30 - 11:30', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'xy.lu@bjtu.edu.cn', 'available', 'Welcoming students interested in green rail infrastructure & carbon offset.', ARRAY['Green Rail Infrastructure','Carbon Accounting','Environmental Chemistry']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_15', 'teacher', 'Prof. Weimin Liang', '梁伟民', 'BJTU-T11355', 'Distinguished Professor', 'School of Mathematics and Statistics (数学与统计学院)', 'math', 'Dept. of Applied Mathematics & Stochastics', 'Science Building 318 (理科楼318)', 'Thursday 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'wm.liang@bjtu.edu.cn', 'available', 'Office open for stochastic modeling, calculus, and statistical consultations.', ARRAY['Applied Probability','Stochastic Optimization','Combinatorial Mathematics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_16', 'teacher', 'Prof. Jianguo He', '何建国', 'BJTU-T11466', 'Professor & Dean', 'School of Physical Science and Engineering (物理科学与工程学院)', 'phys', 'Dept. of Applied Physics & Photonics', 'Physics Hall 502 (物理楼502)', 'Wednesday 15:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'jg.he@bjtu.edu.cn', 'available', 'Available for consultations on quantum optoelectronics and rail sensors.', ARRAY['Optical Fiber Sensors','Quantum Optics','Condensed Matter Physics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_17', 'teacher', 'Prof. Yuxin Tang', '唐雨欣', 'BJTU-T11577', 'Associate Professor', 'School of Architecture and Art (建筑与艺术学院)', 'arch', 'Dept. of Urban Rail Transit Station Architecture', 'Architecture Building 405 (建筑楼405)', 'Tuesday 10:00 - 12:30', '{}'::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'yx.tang@bjtu.edu.cn', 'office_hours', 'Design studio open for station terminal aesthetics & transit hub architecture.', ARRAY['High-Speed Rail Hub Architecture','Urban Transit Design','Heritage Preservation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_18', 'teacher', 'Prof. Qionghua Nie', '聂琼华', 'BJTU-T11688', 'Associate Professor', 'School of Languages and Communication (语言与传播学院)', 'lang', 'Dept. of International Communication & Translation', 'Dongheng Building 202 (东亨楼202)', 'Monday 13:30 - 15:30', '{}'::text[], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'qh.nie@bjtu.edu.cn', 'available', 'Available for international technical communication & academic English advice.', ARRAY['Cross-Cultural Transit Comms','Technical Translation','Corpus Linguistics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_19', 'teacher', 'Prof. Baocheng Zhu', '朱宝成', 'BJTU-T11799', 'Professor', 'School of Marxism (马克思主义学院)', 'marx', 'Dept. of Philosophy & Social Sciences', 'Siyuan West Building 309 (思源西楼309)', 'Friday 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 'bc.zhu@bjtu.edu.cn', 'available', 'Open for academic discussions on modernization theory & engineering ethics.', ARRAY['Engineering Ethics','Chinese Modernization Theory','Philosophy of Technology']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_20', 'teacher', 'Prof. Guoming Fan', '范国明', 'BJTU-T11810', 'Chief Scientist & Distinguished Chair', 'National Institute of Excellence in Engineering (国家卓越工程师学院)', 'eng_lead', 'Dept. of Strategic Mega-Project Engineering', 'Engineering Excellence Building 108 (卓越工程师楼108)', 'Wednesday 14:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'gm.fan@bjtu.edu.cn', 'available', 'Strategic engineering mentoring & industry-academia national projects.', ARRAY['High-Speed Rail Mega-Projects','Systems Engineering','Strategic Innovation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_21', 'teacher', 'Prof. David Sterling', '戴维·斯特林', 'BJTU-T11921', 'International Visiting Professor', 'Weihai International College (威海国际学院)', 'weihai', 'Dept. of Dual-Degree Engineering Programs', 'Weihai Campus Admin Hall 301 (威海校区行政楼301)', 'Tue & Thu 15:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'd.sterling@bjtu.edu.cn', 'available', 'Online & on-campus consultations for Lancaster-BJTU dual-degree students.', ARRAY['International Engineering Standards','Telecommunications','Global Project Management']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_22', 'teacher', 'Prof. Shuhua Xue', '薛淑华', 'BJTU-T12032', 'Associate Dean & Senior Lecturer', 'College of Distance and Continuing Education (远程与继续教育学院)', 'dist', 'Dept. of Lifelong Learning & Professional Rail Certifications', 'Continuing Education Complex 201 (继续教育学院201)', 'Monday 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'sh.xue@bjtu.edu.cn', 'available', 'Open for professional accreditation & continuing railway education advisement.', ARRAY['Digital Continuing Education','Lifelong Railway Training','Hybrid Learning Models']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_ee_2', 'teacher', 'Prof. Guodong Zhang', '张国栋', 'BJTU-T10303', 'Associate Professor & Lab Director', 'School of Electronic and Information Engineering (电子信息工程学院)', 'ee', 'Dept. of Microelectronics & Integrated Circuits', 'No. 9 Teaching Building 610 (九号教学楼610)', 'Wed & Fri 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'gd.zhang@bjtu.edu.cn', 'office_hours', 'In office hours. Consultation on RF IC design and high-frequency semiconductors.', ARRAY['RF Integrated Circuits','High-Speed Signal Processing','Semiconductor Devices']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_ee_3', 'teacher', 'Prof. Yanping Wang', '王艳平', 'BJTU-T10304', 'Professor & Doctoral Supervisor', 'School of Electronic and Information Engineering (电子信息工程学院)', 'ee', 'Dept. of Information & Telecommunication Systems', 'Siyuan East Building 305 (思源东楼305)', 'Mon & Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'yp.wang@bjtu.edu.cn', 'available', 'Available for 6G rail wireless communications and MIMO antenna array projects.', ARRAY['6G Massive MIMO','Wireless Sensor Networks','Electromagnetic Compatibility']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_cs_2', 'teacher', 'Prof. Zhiwei Chen', '陈志伟', 'BJTU-T10025', 'Professor & Big Data Lab Chair', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'Dept. of Data Science & Big Data Engineering', 'Siyuan East Building 518 (思源东楼518)', 'Tue & Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'zw.chen@bjtu.edu.cn', 'available', 'Office open for high-performance computing & distributed graph analytics queries.', ARRAY['Distributed Computing','Graph Analytics','High-Performance Rail Simulation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_cs_3', 'teacher', 'Dr. Sihan Li', '李思涵', 'BJTU-T10026', 'Associate Professor', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'Dept. of Intelligent Computing & Knowledge Systems', 'Siyuan Building 320 (思源楼320)', 'Wed 09:30 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'sh.li@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on knowledge graphs and LLM prompt engineering welcome.', ARRAY['Knowledge Graphs','Natural Language Processing','Neuro-Symbolic Reasoning']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_ai_2', 'teacher', 'Prof. Junjie Guo', '郭俊杰', 'BJTU-T10412', 'Associate Professor & Lab Fellow', 'School of Automation and Intelligence (自动化与智能学院)', 'ai', 'Dept. of Autonomous Systems & Neural Networks', 'No. 9 Teaching Building 412 (九号教学楼412)', 'Mon & Wed 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'jj.guo@bjtu.edu.cn', 'available', 'Consulting on deep reinforcement learning and unmanned train trajectory tracking.', ARRAY['Deep Reinforcement Learning','Autonomous Train Control','Multi-Agent Motion Planning']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_ai_3', 'teacher', 'Dr. Tingting Zhou', '周婷婷', 'BJTU-T10413', 'Assistant Professor', 'School of Automation and Intelligence (自动化与智能学院)', 'ai', 'Dept. of Computer Vision & Intelligent Perception', 'No. 9 Teaching Building 402 (九号教学楼402)', 'Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'tt.zhou@bjtu.edu.cn', 'office_hours', 'Open for questions on 3D LiDAR SLAM and track obstacle perception.', ARRAY['Computer Vision','3D LiDAR SLAM','Track Obstacle Detection']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_se_2', 'teacher', 'Prof. Bowen Yang', '杨博文', 'BJTU-T10523', 'Associate Professor', 'School of Software Engineering (软件学院)', 'se', 'Dept. of Distributed Systems & Software Quality', 'Yifu Building 408 (逸夫楼408)', 'Tue & Thu 15:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'bw.yang@bjtu.edu.cn', 'available', 'Available for DevOps pipelines, automated testing, and software reliability queries.', ARRAY['Automated Testing','Continuous Integration / DevOps','Software Reliability']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_se_3', 'teacher', 'Dr. Jiaxin Zheng', '郑嘉欣', 'BJTU-T10524', 'Assistant Professor', 'School of Software Engineering (软件学院)', 'se', 'Dept. of Cloud Computing & Mobile Software', 'Yifu Building 415 (逸夫楼415)', 'Wed 13:30 - 16:00', '{}'::text[], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'jx.zheng@bjtu.edu.cn', 'office_hours', 'In Office Hours! Ready to help with mobile app architecture and serverless backends.', ARRAY['Mobile Computing','Serverless Architectures','Full-Stack Engineering']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sec_2', 'teacher', 'Prof. Weihua Deng', '邓伟华', 'BJTU-T10634', 'Associate Professor & Research Chair', 'School of Cyberspace Security (网络空间安全学院)', 'sec', 'Dept. of Industrial IoT Security & Cryptography', 'Siyuan East Building 608 (思源东楼608)', 'Mon & Thu 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 'wh.deng@bjtu.edu.cn', 'available', 'Office open for ICS/SCADA security and industrial bus protocol encryption.', ARRAY['Industrial IoT Security','SCADA Protocols','Post-Quantum Cryptography']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sec_3', 'teacher', 'Dr. Qianyun Meng', '孟千云', 'BJTU-T10635', 'Associate Professor', 'School of Cyberspace Security (网络空间安全学院)', 'sec', 'Dept. of Cyber Defense & Threat Intelligence', 'Siyuan East Building 612 (思源东楼612)', 'Tue 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'qy.meng@bjtu.edu.cn', 'office_hours', 'In Office Hours! Welcoming questions on threat modeling and vulnerability audits.', ARRAY['Vulnerability Assessment','Threat Intelligence','AI Security & Privacy']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_trans_2', 'teacher', 'Prof. Keqiang Li', '李克强', 'BJTU-T10231', 'Professor & Vice Dean', 'School of Traffic and Transportation (交通运输学院)', 'trans', 'Dept. of Intelligent Transportation Systems', 'Mechanical Building 218 (机械楼218)', 'Wed & Fri 15:00 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'kq.li@bjtu.edu.cn', 'available', 'Office doors open for rail dispatch scheduling and high-speed corridor design.', ARRAY['Rail Timetable Optimization','Multi-Modal Hub Coordination','High-Speed Rail Networks']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_trans_3', 'teacher', 'Prof. Shanshan He', '何珊珊', 'BJTU-T10232', 'Associate Professor', 'School of Traffic and Transportation (交通运输学院)', 'trans', 'Dept. of Urban Public Transit Engineering', 'Mechanical Building 205 (机械楼205)', 'Thu 09:30 - 11:30', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'ss.he@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on subway crowd management & demand prediction.', ARRAY['Urban Metro Operations','Crowd Dynamics & Evacuation','Transit Big Data']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_civil_2', 'teacher', 'Prof. Ronggui Liu', '刘荣贵', 'BJTU-T10745', 'Professor & Geotechnical Institute Chair', 'School of Civil Engineering (土木建筑工程学院)', 'civil', 'Dept. of Underground & Geotechnical Engineering', 'Civil Engineering Hall 312 (土木工程楼312)', 'Mon & Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', 'rg.liu@bjtu.edu.cn', 'available', 'Consulting on shield tunneling settlement and deep foundation safety.', ARRAY['Tunnel Shield Excavation','Subgrade Stability','Geotechnical Earthquake Engineering']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_civil_3', 'teacher', 'Dr. Linfeng Chen', '陈林峰', 'BJTU-T10746', 'Associate Professor', 'School of Civil Engineering (土木建筑工程学院)', 'civil', 'Dept. of Structural Health Monitoring & Green Materials', 'Civil Engineering Hall 215 (土木工程楼215)', 'Wed 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'lf.chen@bjtu.edu.cn', 'office_hours', 'Office hours open for fiber-optic sensor queries and smart bridge maintenance.', ARRAY['Bridge Structural Health Monitoring','Ultra-High Performance Concrete','Smart Materials']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_mece_2', 'teacher', 'Prof. Xiangjun Qian', '钱向军', 'BJTU-T10912', 'Associate Professor & Lab Chair', 'School of Mechanical, Electronic and Control Engineering (机械与电子控制工程学院)', 'mece', 'Dept. of Advanced Mechatronics & Precision Control', 'Mechanical Engineering Building 318 (机械工程楼318)', 'Tue & Fri 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'xj.qian@bjtu.edu.cn', 'available', 'Available for train suspension vibration isolation and precision mechatronics.', ARRAY['Bogie Suspension Dynamics','Active Vibration Control','Precision Actuation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_mece_3', 'teacher', 'Dr. Yanqing Cui', '崔燕青', 'BJTU-T10913', 'Associate Professor', 'School of Mechanical, Electronic and Control Engineering (机械与电子控制工程学院)', 'mece', 'Dept. of Intelligent Manufacturing & Digital Twins', 'Mechanical Engineering Building 210 (机械工程楼210)', 'Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'yq.cui@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on digital twin maintenance and gear wear prognosis.', ARRAY['Digital Twins for Rolling Stock','Acoustic Emission Prognostics','Additive Manufacturing']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_elec_2', 'teacher', 'Prof. Baichuan Huang', '黄百川', 'BJTU-T11023', 'Professor & Doctoral Supervisor', 'School of Electrical Engineering (电气工程学院)', 'elec', 'Dept. of Power Electronics & Electric Drives', 'Electrical Engineering Hall 408 (电气工程楼408)', 'Mon & Wed 14:00 - 16:00', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'bc.huang@bjtu.edu.cn', 'available', 'Open for traction inverter design and high-efficiency permanent magnet drives.', ARRAY['High-Power Traction Inverters','Permanent Magnet Motor Drives','Wide Bandgap Semiconductors']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_elec_3', 'teacher', 'Dr. Jingyi Shen', '沈静宜', 'BJTU-T11024', 'Associate Professor', 'School of Electrical Engineering (电气工程学院)', 'elec', 'Dept. of Renewable Microgrids & Energy Storage', 'Electrical Engineering Hall 316 (电气工程楼316)', 'Thu 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'jy.shen@bjtu.edu.cn', 'office_hours', 'In Office Hours! Ready for questions on trackside energy storage & solar integration.', ARRAY['Trackside Energy Storage','Regenerative Braking Utilization','Railway Smart Microgrids']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sys_2', 'teacher', 'Prof. Dawei Jin', '金大伟', 'BJTU-T11134', 'Associate Professor & Systems Lab Chair', 'School of Systems Science (系统科学学院)', 'sys', 'Dept. of Multi-Agent Systems & Complexity', 'Science Building 608 (理科楼608)', 'Tue & Thu 14:30 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'dw.jin@bjtu.edu.cn', 'available', 'Office open for multi-agent simulation and non-equilibrium statistical physics.', ARRAY['Multi-Agent Simulation','Statistical Physics of Traffic','Synchronization in Complex Networks']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sys_3', 'teacher', 'Dr. Mengting Gao', '高梦婷', 'BJTU-T11135', 'Assistant Professor', 'School of Systems Science (系统科学学院)', 'sys', 'Dept. of Socio-Technical Systems & Network Resilience', 'Science Building 615 (理科楼615)', 'Mon 09:30 - 11:30', '{}'::text[], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'mt.gao@bjtu.edu.cn', 'office_hours', 'In Office Hours! Consulting on cascade failure models and systemic risk control.', ARRAY['Cascade Failure in Power-Rail Networks','Systemic Resilience','Spatial Network Optimization']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_env_2', 'teacher', 'Prof. Junhao Tan', '谭俊豪', 'BJTU-T11245', 'Professor & Institute Director', 'School of Environment (环境学院)', 'env', 'Dept. of Transit Noise, Vibration & Pollution Control', 'Environment Building 315 (环境楼315)', 'Wed & Fri 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 'jh.tan@bjtu.edu.cn', 'available', 'Welcoming students for acoustic barrier design and low-frequency vibration dampening.', ARRAY['Rail Noise & Vibration Control','Acoustic Barrier Metamaterials','Environmental Geotechnics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_env_3', 'teacher', 'Dr. Wenjie Pan', '潘文杰', 'BJTU-T11246', 'Associate Professor', 'School of Environment (环境学院)', 'env', 'Dept. of Environmental Sensing & Sustainable Transit', 'Environment Building 208 (环境楼208)', 'Tue 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'wj.pan@bjtu.edu.cn', 'office_hours', 'In Office Hours! Drop in for life cycle assessment (LCA) and zero-carbon transit hubs.', ARRAY['Life Cycle Assessment','Atmospheric Particulate Sensing','Green Transit Standards']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_math_2', 'teacher', 'Prof. Ruofei Cheng', '程若飞', 'BJTU-T11356', 'Professor & Vice Dean', 'School of Mathematics and Statistics (数学与统计学院)', 'math', 'Dept. of Mathematical Modeling & Scientific Computing', 'Science Building 325 (理科楼325)', 'Mon & Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'rf.cheng@bjtu.edu.cn', 'available', 'Available for mathematical modeling competitions, ODE/PDE systems, and fluid dynamics.', ARRAY['Partial Differential Equations','Numerical Linear Algebra','MCM/ICM Coaching']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_math_3', 'teacher', 'Dr. Haining Jiang', '姜海宁', 'BJTU-T11357', 'Associate Professor', 'School of Mathematics and Statistics (数学与统计学院)', 'math', 'Dept. of Statistics & Biometrics', 'Science Building 310 (理科楼310)', 'Wed 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'hn.jiang@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on Bayesian estimation and high-dimensional hypothesis testing.', ARRAY['Bayesian Statistics','High-Dimensional Inference','Statistical Machine Learning']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_phys_2', 'teacher', 'Prof. Zhiyuan Fan', '范志远', 'BJTU-T11467', 'Associate Professor & Lab Fellow', 'School of Physical Science and Engineering (物理科学与工程学院)', 'phys', 'Dept. of Applied Electromagnetics & Acoustics', 'Physics Hall 508 (物理楼508)', 'Tue & Thu 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'zy.fan@bjtu.edu.cn', 'available', 'Office open for electromagnetic metamaterials, acoustic levitation, and antenna optics.', ARRAY['Electromagnetic Metamaterials','Acoustic Wave Manipulation','Terahertz Photonics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_phys_3', 'teacher', 'Dr. Lihua Song', '宋丽华', 'BJTU-T11468', 'Associate Professor', 'School of Physical Science and Engineering (物理科学与工程学院)', 'phys', 'Dept. of Quantum Information Materials & Sensor Chips', 'Physics Hall 412 (物理楼412)', 'Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'lh.song@bjtu.edu.cn', 'office_hours', 'In Office Hours! Ready for quantum spintronics and low-temperature superconductor queries.', ARRAY['2D Quantum Materials','Superconducting Sensors','Spintronic Devices']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sem_2', 'teacher', 'Prof. Zongping Bai', '白宗平', 'BJTU-T10089', 'Professor & Associate Dean', 'School of Economics and Management (经济管理学院)', 'sem', 'Dept. of Transportation Economics & Strategy', 'Siyuan Building 722 (思源楼722)', 'Tue & Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', 'zp.bai@bjtu.edu.cn', 'available', 'Consulting on dynamic rail ticket pricing models and regional economic multiplier effects.', ARRAY['High-Speed Rail Pricing','Regional Transportation Economics','Yield Management']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_sem_3', 'teacher', 'Dr. Yihan Xie', '谢依涵', 'BJTU-T10090', 'Associate Professor', 'School of Economics and Management (经济管理学院)', 'sem', 'Dept. of Financial Technology & Infrastructure ESG', 'Siyuan Building 615 (思源楼615)', 'Mon 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'yh.xie@bjtu.edu.cn', 'office_hours', 'In Office Hours! Advising on green infrastructure bonds and fintech risk analytics.', ARRAY['Green Infrastructure Financing','Fintech Analytics','Corporate ESG Governance']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_arch_2', 'teacher', 'Prof. Shuo Liang', '梁硕', 'BJTU-T11578', 'Associate Professor & Studio Lead', 'School of Architecture and Art (建筑与艺术学院)', 'arch', 'Dept. of Transit Hub Interior & Environmental Design', 'Architecture Building 412 (建筑楼412)', 'Wed & Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'sh.liang@bjtu.edu.cn', 'available', 'Design critiques open for subterranean station lighting, passenger flow ergonomics.', ARRAY['Transit Station Interior Ergonomics','Subterranean Spatial Quality','Public Architecture']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_arch_3', 'teacher', 'Dr. Jingjing Cao', '曹静静', 'BJTU-T11579', 'Assistant Professor', 'School of Architecture and Art (建筑与艺术学院)', 'arch', 'Dept. of Digital Media & Public Space Design', 'Architecture Building 308 (建筑楼308)', 'Mon 13:30 - 16:00', '{}'::text[], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'jj.cao@bjtu.edu.cn', 'office_hours', 'In Office Hours! Welcoming queries on digital wayfinding signage and interactive installations.', ARRAY['Digital Wayfinding Systems','Interactive Urban Media','Sensory Architecture']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_law_2', 'teacher', 'Prof. Xiangdong Qin', '秦向东', 'BJTU-T10116', 'Professor & International Law Chair', 'School of Law (法学院)', 'law', 'Dept. of International Trade & Transportation Law', 'Yifu Building 310 (逸夫楼310)', 'Tue & Thu 09:30 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'xd.qin@bjtu.edu.cn', 'available', 'Consulting on Belt & Road international rail transport conventions and cross-border liability.', ARRAY['International Rail Transport Law','Cross-Border Arbitration','Maritime-Rail Multimodal Treaties']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_law_3', 'teacher', 'Dr. Meiqi Xiao', '肖美琪', 'BJTU-T10117', 'Associate Professor', 'School of Law (法学院)', 'law', 'Dept. of Data Privacy & Cyber Regulation', 'Yifu Building 318 (逸夫楼318)', 'Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'mq.xiao@bjtu.edu.cn', 'office_hours', 'In Office Hours! Discussions on AI algorithmic governance and transit passenger data rights.', ARRAY['Data Security Law','Autonomous Driving Regulatory Policy','Algorithmic Fairness']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_lang_2', 'teacher', 'Prof. Christopher Vance', '克里斯托弗·万斯', 'BJTU-T11689', 'Foreign Senior Lecturer', 'School of Languages and Communication (语言与传播学院)', 'lang', 'Dept. of Applied Cross-Cultural Linguistics', 'Dongheng Building 206 (东亨楼206)', 'Wed & Fri 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', 'c.vance@bjtu.edu.cn', 'available', 'Available for international conference speaking, academic publishing, and intercultural rhetoric.', ARRAY['English for Academic Purposes (EAP)','Cross-Cultural Rhetoric','Global Discourse']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_lang_3', 'teacher', 'Dr. Xiaoyu Duan', '段晓宇', 'BJTU-T11690', 'Associate Professor', 'School of Languages and Communication (语言与传播学院)', 'lang', 'Dept. of Multilingual Translation & Cognitive Linguistics', 'Dongheng Building 212 (东亨楼212)', 'Tue 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'xy.duan@bjtu.edu.cn', 'office_hours', 'In Office Hours! Ready for corpus linguistics and technical terminology localization advice.', ARRAY['Corpus Translation Studies','Technical Terminology Standardization','Machine Translation Post-Editing']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_marx_2', 'teacher', 'Prof. Xueping Du', '杜雪平', 'BJTU-T11800', 'Associate Professor', 'School of Marxism (马克思主义学院)', 'marx', 'Dept. of Political Economy & Infrastructure Ethics', 'Siyuan West Building 315 (思源西楼315)', 'Mon & Wed 14:00 - 16:00', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'xp.du@bjtu.edu.cn', 'available', 'Open for academic dialogue on infrastructure political economy and scientific socialism.', ARRAY['Infrastructure Political Economy','Technological Social Theory','Chinese Modernization']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_marx_3', 'teacher', 'Dr. Chenghua Peng', '彭成华', 'BJTU-T11801', 'Associate Professor', 'School of Marxism (马克思主义学院)', 'marx', 'Dept. of Ideological Education & Modernization Theory', 'Siyuan West Building 320 (思源西楼320)', 'Thu 09:30 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', 'ch.peng@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on historical materialism and modern engineering ethics welcome.', ARRAY['Engineering Ethics','Historical Materialism','Higher Education Ideological Formation']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_zty_2', 'teacher', 'Prof. Wei Lu', '鲁伟', 'BJTU-T10856', 'Professor & Senior Honors Mentor', 'Zhan Tianyou College (詹天佑学院)', 'zty', 'Dept. of Advanced Rail Engineering Systems', 'Tianyou Hall 108 (天佑大楼108)', 'Tue & Thu 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80', 'w.lu@bjtu.edu.cn', 'available', 'Advising honors students on interdisciplinary high-speed aerodynamics and patent submissions.', ARRAY['High-Speed Train Aerodynamics','Interdisciplinary Engineering','Patent Strategies']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_zty_3', 'teacher', 'Dr. Siyu Fang', '方思雨', 'BJTU-T10857', 'Associate Professor & Honors Counselor', 'Zhan Tianyou College (詹天佑学院)', 'zty', 'Dept. of Cognitive Engineering & Honors Leadership', 'Tianyou Hall 115 (天佑大楼115)', 'Wed 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'sy.fang@bjtu.edu.cn', 'office_hours', 'In Office Hours! Mentoring Tianyou honors scholars on international exchange & capstones.', ARRAY['Honors Engineering Pedagogy','Cognitive Ergonomics','STEM Leadership Development']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_eng_lead_2', 'teacher', 'Prof. Zhenggang Tao', '陶正刚', 'BJTU-T11811', 'Chief Industrial Fellow & Professor', 'National Institute of Excellence in Engineering (国家卓越工程师学院)', 'eng_lead', 'Dept. of Heavy Rail Vehicle Systems', 'Engineering Excellence Building 115 (卓越工程师楼115)', 'Mon & Thu 15:00 - 17:30', '{}'::text[], 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', 'zg.tao@bjtu.edu.cn', 'available', 'Guiding national-level doctoral engineering candidates on heavy-haul axle load dynamics.', ARRAY['Heavy-Haul Rail Dynamics','Industrial Rolling Stock Prototyping','Crashworthiness Design']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_eng_lead_3', 'teacher', 'Dr. Jingwei Luo', '罗敬伟', 'BJTU-T11812', 'Senior Engineering Fellow', 'National Institute of Excellence in Engineering (国家卓越工程师学院)', 'eng_lead', 'Dept. of Mega-Project Safety & System Reliability', 'Engineering Excellence Building 202 (卓越工程师楼202)', 'Fri 09:30 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80', 'jw.luo@bjtu.edu.cn', 'office_hours', 'In Office Hours! Ready for consultations on mission-critical system safety certifications.', ARRAY['Systemic Safety Verification','Reliability Assessment','Mega-Project Governance']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_weihai_2', 'teacher', 'Prof. Elena Rostova', '叶莲娜·罗斯托娃', 'BJTU-T11922', 'Associate Professor of International Engineering', 'Weihai International College (威海国际学院)', 'weihai', 'Dept. of Joint International Academic Affairs', 'Weihai Admin Building 306 (威海校区行政楼306)', 'Tue & Thu 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', 'e.rostova@bjtu.edu.cn', 'available', 'Advising dual-degree engineering candidates on UK/China syllabus equivalence.', ARRAY['International Engineering Accreditation','Smart Materials Engineering','Applied Thermodynamics']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_weihai_3', 'teacher', 'Dr. Kai Feng', '冯凯', 'BJTU-T11923', 'Assistant Dean & Senior Lecturer', 'Weihai International College (威海国际学院)', 'weihai', 'Dept. of Dual-Degree Computing & Embedded Systems', 'Weihai Admin Building 312 (威海校区行政楼312)', 'Wed 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'k.feng@bjtu.edu.cn', 'office_hours', 'In Office Hours! Available for questions on Lancaster-BJTU embedded systems modules.', ARRAY['Embedded Microcontrollers','International CS Pedagogy','Real-Time Operating Systems']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_dist_2', 'teacher', 'Prof. Qingyun Lu', '卢清云', 'BJTU-T12033', 'Senior Lecturer & Program Director', 'College of Distance and Continuing Education (远程与继续教育学院)', 'dist', 'Dept. of Railway Operations Online Training', 'Continuing Education Complex 205 (继续教育学院205)', 'Tue & Fri 14:00 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'qy.lu@bjtu.edu.cn', 'available', 'Advising in-service railway engineers on remote technical credentialing.', ARRAY['Virtual Simulation for Rail Training','E-Learning Systems','Workforce Upskilling']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_dist_3', 'teacher', 'Dr. Zhaoming Yuan', '袁兆明', 'BJTU-T12034', 'Associate Professor', 'College of Distance and Continuing Education (远程与继续教育学院)', 'dist', 'Dept. of Digital Pedagogy & Rail Credentials', 'Continuing Education Complex 210 (继续教育学院210)', 'Thu 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', 'zm.yuan@bjtu.edu.cn', 'office_hours', 'In Office Hours! Inquiries on micro-credentials and hybrid adult education platforms.', ARRAY['Digital Credential Standards','Adult Learning Pedagogy','Interactive Learning Platforms']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_cie_1', 'teacher', 'Prof. Michael Harrison', '迈克尔·哈里森', 'BJTU-T12101', 'Dean & Distinguished Professor', 'College of International Education (国际教育学院)', 'cie', 'Dept. of Cross-Cultural Rail Education & Global Governance', 'International Exchange Complex 301 (国际交流大厦301)', 'Tue & Thu 14:30 - 17:00', '{}'::text[], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'm.harrison@bjtu.edu.cn', 'available', 'Consultation on international student exchange, degree recognition & global programs.', ARRAY['Global Transit Education','Cross-Cultural Higher Education','International Policy Governance']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_cie_2', 'teacher', 'Prof. Liwei Chen', '陈立伟', 'BJTU-T12102', 'Associate Professor & Vice Dean', 'College of International Education (国际教育学院)', 'cie', 'Dept. of International Chinese Education & Intercultural Studies', 'International Exchange Complex 308 (国际交流大厦308)', 'Mon & Wed 10:00 - 12:00', '{}'::text[], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'lw.chen@bjtu.edu.cn', 'office_hours', 'In Office Hours! Advising international students on Chinese language proficiency & academic writing.', ARRAY['Teaching Chinese as a Second Language','Intercultural Communication','Corpus Pedagogy']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;
INSERT INTO public.teachers (id, role, full_name, chinese_name, staff_id, title, faculty, faculty_key, department, office_location, office_hours, courses_taught_ids, avatar, email, status, custom_status_message, research_interests, password)
VALUES ('teacher_cie_3', 'teacher', 'Dr. Sophia Martinez', '索菲亚·马丁内斯', 'BJTU-T12103', 'Assistant Professor & International Student Counselor', 'College of International Education (国际教育学院)', 'cie', 'Dept. of International Student Development & Academic Affairs', 'International Exchange Complex 215 (国际交流大厦215)', 'Friday 13:30 - 16:30', '{}'::text[], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 's.martinez@bjtu.edu.cn', 'available', 'Open for international student academic mentoring, visa queries, and internship guidance.', ARRAY['International Student Mobility','Multicultural Campus Integration','Comparative Pedagogy']::text[], 'bjtu2026')
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
  research_interests = EXCLUDED.research_interests;

-- Insert Students
INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES ('student_haoran', 'student', 'Wang Haoran', '王浩然', '21281034', 'School of Software Engineering (软件学院)', 'se', 'Transit Information & Software Engineering', 'Undergraduate Year 4 (Class of 2025)', 'SE-2101', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgd-b1mcTk4ODLnXjMeQ3s4f3hrEMvobs-2cgcxrBFjiQPoMEjcO5lVTA9_SnyinOU14tkMrqfm1Ci94dkYjmmlsIfTgulYgwm01MdDSoUkp4ce_fNeznqGomCqPjrAViVghKQtebGHAmmy6QmsQqc7J0ud63z9LCZD14Tt94se5ziyMejMnpcGamNxkILx22-aIqY--gTL3bEt-uer3CaaGpygVSQdlHz5Ihf2XXvGEHm_gVEfXVF', '21281034@bjtu.edu.cn', '+86 138-2128-1034', ARRAY['course_cs201','course_ai405']::text[], '3.92 / 4.0', 'bjtu2026')
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
  gpa = EXCLUDED.gpa;
INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES ('student_1', 'student', 'Ming Li', '李明', '2023010482', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'Computer Science & Technology', 'Year 3 (Class of 2026)', 'CS-2301', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', 'liming2023@bjtu.edu.cn', '+86 138-0010-2301', ARRAY['course_cs201','course_ai405','course_trans204']::text[], '3.88 / 4.0', 'bjtu2026')
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
  gpa = EXCLUDED.gpa;
INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES ('student_2', 'student', 'Wei Zhang', '张伟', '2023020193', 'School of Economics and Management (经济管理学院)', 'sem', 'Financial Engineering & Logistics Big Data', 'Year 2 (Class of 2027)', 'SEM-2402', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=80', 'zhangwei24@bjtu.edu.cn', '+86 139-1122-3344', ARRAY['course_fin301','course_cs201']::text[], '3.75 / 4.0', 'bjtu2026')
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
  gpa = EXCLUDED.gpa;
INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES ('student_3', 'student', 'Sisi Chen', '陈思思', '2022030811', 'School of Law (法学院)', 'law', 'Transportation & Cyber Law', 'Year 4 (Class of 2025)', 'LAW-2201', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'sisi.chen@bjtu.edu.cn', '+86 136-9988-7766', ARRAY['course_law102','course_ee305']::text[], '3.92 / 4.0', 'bjtu2026')
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
  gpa = EXCLUDED.gpa;
INSERT INTO public.students (id, role, full_name, chinese_name, student_id, faculty, faculty_key, major, grade, class_group, avatar, email, phone, enrolled_course_ids, gpa, password)
VALUES ('student_4', 'admin', 'ZAGDSUREN ANKHBAYAR', '安哈 (Admin)', '25239002', 'School of Software Engineering (软件学院)', 'se', 'Software Engineering & Cloud Computing', 'Year 2 (Class of 2027)', 'SE-2501', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'anhaa@bjtu.edu.cn', '+86 138-2523-9002', ARRAY['course_cs201','course_ai405']::text[], '3.98 / 4.0', 'admin')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
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
  gpa = EXCLUDED.gpa;

-- Insert Courses
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_cs201', 'CS201', 'Data Structures & Rail Algorithms', '数据结构与轨道交通算法', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'teacher_1', 'Fall 2026', 'Mon 08:00-09:35, Wed 10:00-11:35', 'Siyuan Building 3-201 (思源楼3-201)', 4, 'required', 60, 52, ARRAY[1,3]::int[], 1)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_ai405', 'AI405', 'Applied Machine Learning & Deep Neural Nets', '应用机器学习与深度神经网络', 'School of Computer Science and Technology (计算机科学与技术学院)', 'cs', 'teacher_1', 'Fall 2026', 'Tue 10:00-11:35, Thu 14:00-15:35', 'Siyuan East Lab 102 (思源东楼机房102)', 3, 'elective', 50, 44, ARRAY[2,4]::int[], 2)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_fin301', 'FIN301', 'Supply Chain Finance & Infrastructure Valuation', '供应链金融与基建资产估值', 'School of Economics and Management (经济管理学院)', 'sem', 'teacher_2', 'Fall 2026', 'Mon 14:00-16:35', 'Siyuan Building 401 (思源楼401)', 3, 'elective', 65, 58, ARRAY[1]::int[], 3)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_trans204', 'TRANS204', 'Intelligent Rail Transit & Traffic Optimization', '智能轨道交通组织与网络优化', 'School of Traffic and Transportation (交通运输学院)', 'trans', 'teacher_4', 'Fall 2026', 'Fri 08:00-10:25', 'No. 9 Teaching Building 304 (九教304)', 3, 'required', 55, 48, ARRAY[5]::int[], 1)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_ee305', 'EE305', 'High-Speed Railway Wireless Comms & IoT', '高速铁路专网无线通信与物联网', 'School of Electronic and Information Engineering (电子信息工程学院)', 'ee', 'teacher_5', 'Fall 2026', 'Tue 14:00-16:35', 'Mechanical Building Hall 101 (机械楼101)', 3, 'elective', 45, 36, ARRAY[2]::int[], 3)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_law102', 'LAW102', 'Transportation AI & Intellectual Property Law', '交通智能科技与知识产权法', 'School of Law (法学院)', 'law', 'teacher_3', 'Fall 2026', 'Thu 08:00-10:25', 'Yifu Building 202 (逸夫楼202)', 3, 'general', 80, 65, ARRAY[4]::int[], 1)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_se302', 'SE302', 'Modern Cloud Native & Microservices Architecture', '现代云原生与微服务架构开发', 'School of Software Engineering (软件学院)', 'se', 'teacher_7', 'Fall 2026', 'Wed 14:00-16:35', 'Yifu Building Software Lab 302 (逸夫楼软件机房302)', 3, 'elective', 60, 41, ARRAY[3]::int[], 3)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_sec201', 'SEC201', 'Railway Network Cyber Security & Cryptography', '铁路关键信息基础设施网络安全与密码学', 'School of Cyberspace Security (网络空间安全学院)', 'sec', 'teacher_8', 'Fall 2026', 'Thu 10:00-11:35', 'Siyuan East Building 501 (思源东楼501)', 3, 'elective', 50, 33, ARRAY[4]::int[], 2)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_ai301', 'AI301', 'Autonomous Train Control & Computer Vision', '无人驾驶列车感知与计算机视觉', 'School of Automation and Intelligence (自动化与智能学院)', 'ai', 'teacher_6', 'Fall 2026', 'Tue 08:00-09:35', 'No. 9 Teaching Building 410 (九教410)', 3, 'elective', 45, 39, ARRAY[2]::int[], 1)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_civil203', 'CIVIL203', 'High-Speed Rail Bridge & Tunnel Dynamics', '高速铁路桥隧结构动力学与防灾', 'School of Civil Engineering (土木建筑工程学院)', 'civil', 'teacher_9', 'Fall 2026', 'Mon 10:00-11:35', 'Civil Engineering Hall 102 (土木楼102)', 3, 'required', 50, 42, ARRAY[1]::int[], 2)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_mece304', 'MECE304', 'High-Speed Train Dynamics & Intelligent Diagnostics', '高速列车动力学与智能运维诊断', 'School of Mechanical, Electronic and Control Engineering (机械与电子控制工程学院)', 'mece', 'teacher_11', 'Fall 2026', 'Wed 08:00-09:35', 'Mechanical Building Hall 203 (机械楼203)', 3, 'elective', 50, 29, ARRAY[3]::int[], 1)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_elec202', 'ELEC202', 'Smart Grid & Railway Traction Power Supply', '智能电网与轨道交通牵引供电', 'School of Electrical Engineering (电气工程学院)', 'elec', 'teacher_12', 'Fall 2026', 'Fri 10:00-11:35', 'Electrical Building 302 (电气楼302)', 3, 'required', 55, 47, ARRAY[5]::int[], 2)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_math101', 'MATH101', 'Advanced Stochastic Modeling & Operations Research', '高等随机过程与运筹优化', 'School of Mathematics and Statistics (数学与统计学院)', 'math', 'teacher_15', 'Fall 2026', 'Thu 14:00-16:35', 'Science Building 201 (理科楼201)', 4, 'required', 70, 61, ARRAY[4]::int[], 3)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_gen205', 'GEN205', 'History of Railway Civilization & Chinese Modernization', '世界铁路工业文明与中国式现代化', 'School of Marxism (马克思主义学院)', 'marx', 'teacher_19', 'Fall 2026', 'Wed 19:00-20:35', 'Tianyou Auditorium 101 (天佑大礼堂101)', 2, 'general', 120, 98, ARRAY[3]::int[], 5)
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
  category = EXCLUDED.category;
INSERT INTO public.courses (id, code, name, chinese_name, faculty, faculty_key, teacher_id, semester, schedule, classroom, credits, category, capacity, enrolled_count, day_of_week, period_slot)
VALUES ('course_zty101', 'ZTY101', 'Zhan Tianyou Interdisciplinary Innovation Practicum', '詹天佑拔尖创新交叉研讨与工程实践', 'Zhan Tianyou College (詹天佑学院)', 'zty', 'teacher_10', 'Fall 2026', 'Fri 14:00-16:35', 'Tianyou Hall 205 (天佑楼205)', 2, 'elective', 30, 18, ARRAY[5]::int[], 3)
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
  category = EXCLUDED.category;

-- Insert Conversations
INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES ('conv_haoran_zhang', 'student_haoran', 'teacher_chen_zhang', 'course_ai405', 'Research Guidance', 0, 1, TRUE, 'Wang Haoran (GPA 3.92, Top 3%). Thesis discussion on Lyapunov stability for discrete-time railway perturbations.', '{"content":"Good catch. The Lyapunov function holds provided the slip vector remains within the Euclidean bounded manifold. Take a look at the attached lemma notes before our slot at 15:30.","timestamp":1788590744721,"senderId":"teacher_chen_zhang","status":"delivered","tag":"Research Guidance"}'::jsonb, 1788590744721)
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES ('conv_1', 'student_1', 'teacher_1', 'course_cs201', 'Assignment Question', 0, 1, TRUE, 'Ming Li is an outstanding student in CS201. Optimizing Dijkstra and Trie indices for rail dispatch routing.', '{"content":"I uploaded my updated draft with the time complexity analysis for rail pathfinding. Could you review when you have a moment?","timestamp":1788590504721,"senderId":"student_1","status":"delivered","tag":"Assignment Question"}'::jsonb, 1788590504721)
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES ('conv_2', 'student_2', 'teacher_1', 'course_cs201', 'Office Hour Request', 0, 0, FALSE, 'Cross-registered student from School of Economics & Management. Needs guidance on graph memoization.', '{"content":"Thank you Professor Wang! I will come to your Siyuan East 402B office this Thursday at 14:30.","timestamp":1788580424721,"senderId":"student_2","status":"read","tag":"Office Hour Request"}'::jsonb, 1788580424721)
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES ('conv_3', 'student_2', 'teacher_2', 'course_fin301', 'Grade Inquiry', 1, 0, FALSE, 'High-speed rail bond DCF valuation discrepancy resolved.', '{"content":"I reviewed your supply chain financing paper. Your cost of capital assumption is well defended. Come by Siyuan 718 during office hours.","timestamp":1788588524721,"senderId":"teacher_2","status":"sent","tag":"Grade Inquiry"}'::jsonb, 1788588524721)
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.conversations (id, student_id, teacher_id, course_id, topic_tag, unread_count_student, unread_count_teacher, starred_by_teacher, teacher_notes, last_message, updated_at)
VALUES ('conv_4', 'student_3', 'teacher_3', 'course_law102', 'Recommendation Letter', 0, 1, TRUE, 'Senior honors student applying for LLM in Autonomous Tech & Cyber Law.', '{"content":"Dear Prof. Lin, I have uploaded my CV, research statement on autonomous railway regulation, and transcript. Could you write a recommendation letter?","timestamp":1788587624721,"senderId":"student_3","status":"delivered","tag":"Recommendation Letter"}'::jsonb, 1788587624721)
ON CONFLICT (id) DO UPDATE SET
  topic_tag = EXCLUDED.topic_tag,
  unread_count_student = EXCLUDED.unread_count_student,
  unread_count_teacher = EXCLUDED.unread_count_teacher,
  starred_by_teacher = EXCLUDED.starred_by_teacher,
  teacher_notes = EXCLUDED.teacher_notes,
  last_message = EXCLUDED.last_message,
  updated_at = EXCLUDED.updated_at;

-- Insert Messages
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_hz_1', 'conv_haoran_zhang', 'student_haoran', 'student', 'Wang Haoran', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgd-b1mcTk4ODLnXjMeQ3s4f3hrEMvobs-2cgcxrBFjiQPoMEjcO5lVTA9_SnyinOU14tkMrqfm1Ci94dkYjmmlsIfTgulYgwm01MdDSoUkp4ce_fNeznqGomCqPjrAViVghKQtebGHAmmy6QmsQqc7J0ud63z9LCZD14Tt94se5ziyMejMnpcGamNxkILx22-aIqY--gTL3bEt-uer3CaaGpygVSQdlHz5Ihf2XXvGEHm_gVEfXVF', 'Professor, I reviewed Theorem 4.2 in the Advanced Rail Transit Control paper—could we discuss the Lyapunov stability condition for discrete-time perturbations?', 1788590264721, 'read', 'Research Guidance', '[]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_hz_2', 'conv_haoran_zhang', 'teacher_chen_zhang', 'teacher', 'Prof. Chen Zhang', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQKPrt-I2VNAUYYXmhphKcPo0bf1AA8q7moxA7W08n4dz5VM2wLH9v52LyXhXyeYHCQxJvCvLkvsTXjhDva0ZvRPQ4delQU9Wb9hRI_xYepHEH0sU10cHJQI5y2oqkzPDRvUte74Bi4vDi7pu6IWqR2q010aCkU_nxrKX8rbSytIIKQrYej-aGpUjhIjTO1xHtuN0MdrXS9b5xX_AIvUfOaZDl8sIxfkN4OeFkB2sRM-IvlVbeyLUr', 'Good catch. The Lyapunov function holds provided the slip vector remains within the Euclidean bounded manifold. Take a look at the attached lemma notes before our slot at 15:30.', 1788590744721, 'delivered', 'Research Guidance', '[{"name":"Research_Draft_v3_LemmaNotes.pdf","url":"#","type":"application/pdf","size":"2.4 MB"}]'::jsonb, '{"date":"Today","time":"15:30 - 16:15","location":"Siyuan Hall 402 (思源楼402)","status":"accepted","notes":"Review discrete Lyapunov stability lemma notes beforehand."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_hz_3', 'conv_haoran_zhang', 'student_haoran', 'student', 'Wang Haoran', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgd-b1mcTk4ODLnXjMeQ3s4f3hrEMvobs-2cgcxrBFjiQPoMEjcO5lVTA9_SnyinOU14tkMrqfm1Ci94dkYjmmlsIfTgulYgwm01MdDSoUkp4ce_fNeznqGomCqPjrAViVghKQtebGHAmmy6QmsQqc7J0ud63z9LCZD14Tt94se5ziyMejMnpcGamNxkILx22-aIqY--gTL3bEt-uer3CaaGpygVSQdlHz5Ihf2XXvGEHm_gVEfXVF', 'Thank you Professor. I have annotated Section 3 with the boundary proof.', 1788591104721, 'delivered', 'Research Guidance', '[]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_1_1', 'conv_1', 'student_1', 'student', 'Ming Li', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', 'Hello Professor Wang! In CS201 Assignment 3 regarding the train scheduling shortest path rebalancing, I noticed that Case 2 triggers rotation overhead under dense network vertices.', 1788584024721, 'read', 'Assignment Question', '[{"name":"train_scheduling_benchmark.py","url":"#","type":"text/x-python","size":"14.2 KB"}]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_1_2', 'conv_1', 'teacher_1', 'teacher', 'Prof. Jian Wang', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'Excellent observation, Ming! Let us analyze the Fibonacci Heap priority queue optimization together in my office. Would you like to meet in Siyuan East 402B tomorrow?', 1788585824721, 'read', NULL, '[]'::jsonb, '{"date":"Tomorrow, Thursday","time":"14:30 - 15:00","location":"Siyuan East Building Room 402B (思源东楼402B)","status":"pending","notes":"Bring your laptop with the Valgrind benchmark script."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_1_3', 'conv_1', 'student_1', 'student', 'Ming Li', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', 'I uploaded my updated draft with the time complexity analysis for rail pathfinding. Could you review when you have a moment?', 1788590504721, 'delivered', 'Assignment Question', '[{"name":"rail_pathfinding_complexity.pdf","url":"#","type":"application/pdf","size":"1.8 MB"},{"name":"benchmark_results.png","url":"#","type":"image/png","size":"420 KB"}]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_2_1', 'conv_2', 'student_2', 'student', 'Wei Zhang', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=80', 'Prof. Wang, as an economics student cross-enrolled in CS201, I have a quick inquiry regarding memoized dynamic programming for the train timetable scheduling problem.', 1788576824721, 'read', 'Office Hour Request', '[]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_2_2', 'conv_2', 'teacher_1', 'teacher', 'Prof. Jian Wang', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'Sure Wei! You are very welcome to come by Siyuan East 402B this Thursday afternoon at 14:30. We will walk through the state transition formulation.', 1788579224721, 'read', NULL, '[]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_2_3', 'conv_2', 'student_2', 'student', 'Wei Zhang', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=80', 'Thank you Professor Wang! I will come to your Siyuan East 402B office this Thursday at 14:30.', 1788580424721, 'read', 'Office Hour Request', '[]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
INSERT INTO public.messages (id, conversation_id, sender_id, sender_role, sender_name, sender_avatar, content, timestamp, status, tag, attachments, booking_proposal)
VALUES ('msg_4_1', 'conv_4', 'student_3', 'student', 'Sisi Chen', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'Dear Prof. Lin, I have uploaded my CV, research statement on autonomous railway regulation, and transcript. Could you write a recommendation letter?', 1788587624721, 'delivered', 'Recommendation Letter', '[{"name":"Sisi_Chen_CV_2026.pdf","url":"#","type":"application/pdf","size":"320 KB"},{"name":"Research_Statement_Autonomous_Railway.pdf","url":"#","type":"application/pdf","size":"1.1 MB"}]'::jsonb, NULL)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  timestamp = EXCLUDED.timestamp,
  attachments = EXCLUDED.attachments,
  booking_proposal = EXCLUDED.booking_proposal;
