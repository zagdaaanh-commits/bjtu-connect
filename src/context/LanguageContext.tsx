'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, TeacherProfile, FacultyKey } from '../types/portal';
import { FACULTIES } from '../data/dummyData';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  formatSchool: (keyOrName: string) => string;
  formatCourse: (course: Pick<Course, 'name' | 'chineseName'>) => string;
  formatTeacher: (teacher: Pick<TeacherProfile, 'fullName' | 'chineseName'>) => string;
  formatLocation: (location: string) => string;
  formatCategory: (category: string) => string;
  formatTitle: (title: string) => string;
  formatOfficeHours: (hours: string) => string;
}

const STORAGE_KEY = 'bjtu_portal_lang_pref';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Branding & Header
    'app.name': 'BJTU Connect',
    'app.university': 'Beijing Jiaotong University',
    'app.tagline': 'Student-Teacher Consultation Portal',
    'app.motto': 'Knowing and Doing • Excellence in Action',
    'app.signOut': 'Sign Out',
    'app.switchPersona': 'Switch Persona',
    'app.editProfile': 'Edit Profile',
    'app.role.student': 'Student',
    'app.role.teacher': 'Faculty Member',
    'app.resetDemo': 'Reset Demo Data',
    'app.loading': 'Loading BJTU Consultation Portal...',
    'app.connecting': 'Connecting Beijing Jiaotong University real-time synchronization',
    'app.footer.copy': 'Beijing Jiaotong University • Student-Teacher Consultation System',
    'app.footer.motto': 'Knowing & Doing • Rail Transit & Intelligent Info Platform',
    'app.footer.year': 'Academic Year 2026-2027',

    // Navigation Tabs (Student)
    'tab.directory': 'Faculty Directory',
    'tab.courses': 'My Enrolled Courses & Schedule',
    'tab.chats': 'Consultation Chats',

    // Navigation Tabs (Teacher)
    'tab.inbox': 'Consultation Inbox',
    'tab.schedule': 'Office Hours & Status',

    // Common Actions
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.reset': 'Reset',
    'action.clear': 'Clear',
    'action.cancel': 'Cancel',
    'action.save': 'Save',
    'action.confirm': 'Confirm',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.close': 'Close',
    'action.send': 'Send',
    'action.back': 'Back',
    'action.view': 'View',
    'action.select': 'Select Course',
    'action.drop': 'Drop Course',
    'action.addCustomCourse': 'Add Custom Course',
    'action.bookOfficeHour': 'Book Office Hour',
    'action.startChat': 'Direct Consultation',
    'action.viewProfile': 'View Profile',

    // Statuses
    'status.available': 'Available for Consultation',
    'status.office_hours': 'In Office Hours',
    'status.in_meeting': 'In Meeting / Academic Busy',
    'status.offline': 'Offline / Away',
    'status.all': 'All Statuses',

    // Faculty Directory
    'faculty.hub.badge': 'BJTU Faculty Consultation Hub',
    'faculty.hub.title': 'Connect Directly with University Faculty',
    'faculty.hub.desc': 'Browse verified professors and advisors across schools. Check real-time office hours and launch 1-on-1 direct consultations for academic inquiries, research, and course guidance.',
    'faculty.schools': 'BJTU Schools',
    'faculty.schoolDirectory': 'BJTU School Directory',
    'faculty.filterSchool': 'Filter schools...',
    'faculty.allSchools': 'All Schools',
    'faculty.searchPlaceholder': 'Search professors by name, department, research area...',
    'faculty.clearFilters': 'Clear all filters',
    'faculty.professorsFound': 'faculty members found',
    'faculty.yourInstructor': 'Your Course Instructor',
    'faculty.officeLocation': 'Office Location',
    'faculty.officeHours': 'Office Hours',
    'faculty.coursesTaught': 'Courses Taught',
    'faculty.researchAreas': 'Research Interests',
    'faculty.noResults': 'No faculty members match your criteria',
    'faculty.tryAdjusting': 'Try adjusting your search query or clear school filters.',

    // Courses & Timetable
    'courses.portal.badge': 'Official BJTU Academic Affairs System (AA & MIS)',
    'courses.portal.title': 'Course Enrollment & Weekly Timetable',
    'courses.portal.desc': 'Synchronized with BJTU Academic Affairs (aa.bjtu.edu.cn) and MIS. View enrolled courses, weekly schedule, select new courses, or create custom courses.',
    'courses.subtab.enrolled': 'My Enrolled Courses',
    'courses.subtab.timetable': 'Weekly Timetable',
    'courses.subtab.selection': 'Course Selection Center',
    'courses.totalEnrolled': 'Total Enrolled Courses',
    'courses.totalCredits': 'Total Credits Completed / Registered',
    'courses.quickAdd': 'Add Custom Course',
    'courses.col.code': 'Course Code',
    'courses.col.name': 'Course Title',
    'courses.col.school': 'School / College',
    'courses.col.instructor': 'Instructor',
    'courses.col.credits': 'Credits',
    'courses.col.schedule': 'Schedule & Classroom',
    'courses.col.category': 'Category',
    'courses.col.action': 'Actions',
    'courses.category.required': 'Major Required',
    'courses.category.elective': 'Major Elective',
    'courses.category.general': 'General Education',
    'courses.timetable.header': 'Weekly Course Schedule (Mon - Fri)',
    'courses.timetable.day1': 'Monday',
    'courses.timetable.day2': 'Tuesday',
    'courses.timetable.day3': 'Wednesday',
    'courses.timetable.day4': 'Thursday',
    'courses.timetable.day5': 'Friday',
    'courses.timetable.period1': 'Period 1-2 (08:00 - 09:35)',
    'courses.timetable.period2': 'Period 3-4 (10:00 - 11:35)',
    'courses.timetable.period3': 'Period 5-6 (14:00 - 15:35)',
    'courses.timetable.period4': 'Period 7-8 (16:00 - 17:35)',
    'courses.timetable.period5': 'Period 9-10 (19:00 - 20:35)',
    'courses.selection.search': 'Search available courses by code, title, or instructor...',
    'courses.selection.allCategories': 'All Categories',
    'courses.selection.available': 'courses available for registration',
    'courses.enrolledBadge': 'Enrolled',

    // Add Custom Course Modal
    'modal.addCourse.title': 'Add Custom Course',
    'modal.addCourse.subtitle': 'Custom course entry synchronized with BJTU Academic Affairs System (AA & MIS)',
    'modal.addCourse.code': 'Course Code',
    'modal.addCourse.codePlaceholder': 'e.g. CS410',
    'modal.addCourse.name': 'Course Title (English)',
    'modal.addCourse.namePlaceholder': 'e.g. Intelligent Rail Transportation Algorithms',
    'modal.addCourse.zhName': 'Course Title (Chinese - Optional)',
    'modal.addCourse.zhNamePlaceholder': 'e.g. 智能轨道交通算法',
    'modal.addCourse.school': 'School / College',
    'modal.addCourse.instructor': 'Lead Instructor',
    'modal.addCourse.credits': 'Credits',
    'modal.addCourse.category': 'Course Category',
    'modal.addCourse.classroom': 'Classroom Location',
    'modal.addCourse.classroomPlaceholder': 'e.g. Siyuan East Building 402',
    'modal.addCourse.classDays': 'Class Days',
    'modal.addCourse.classPeriod': 'Class Period Slot',
    'modal.addCourse.directEnroll': 'Directly enroll in this course immediately',
    'modal.addCourse.submit': 'Save & Add Course',

    // Chat & Consultations
    'chat.inbox': 'Active Consultations',
    'chat.search': 'Search conversations...',
    'chat.typePlaceholder': 'Type your academic inquiry message...',
    'chat.quickTags': 'Inquiry Tags',
    'chat.sendBtn': 'Send Message',
    'chat.emptySelect': 'Select a conversation or professor to begin consultation',
    'chat.officeHourBooked': 'Office Hour Booked',
    'chat.requestOfficeHour': 'Request Office Hour Appointment',
    'chat.noMessages': 'No consultation messages yet.',

    // Teacher Inbox & Office Hours
    'teacher.inbox.title': 'Unified Student Consultation Inbox',
    'teacher.inbox.desc': 'Manage academic inquiries, office hour requests, and student communications.',
    'teacher.filter.all': 'All Inquiries',
    'teacher.filter.unread': 'Unread Messages',
    'teacher.filter.officeHour': 'Office Hour Appointments',
    'teacher.status.toggle': 'Office Hour Status Toggle',
    'teacher.status.broadcast': 'Broadcast current consultation status to students in real-time',
    'teacher.studentContext': 'Student Academic Context',
    'teacher.major': 'Major',
    'teacher.grade': 'Grade',
    'teacher.class': 'Class',
    'teacher.studentId': 'Student ID',

    // Auth Portal
    'auth.title': 'Select Your BJTU Access Channel',
    'auth.subtitle': 'Please choose whether you are entering as a Student or Faculty Instructor to access your tailored workspace.',
    'auth.channel.student': 'Student Access Channel',
    'auth.channel.studentDesc': 'Undergraduate & Graduate students',
    'auth.channel.teacher': 'Faculty Instructor Channel',
    'auth.channel.teacherDesc': 'Professors, lecturers & academic staff',
    'auth.loginTab': 'Sign In with BJTU ID',
    'auth.registerTab': 'New Account Registration',
    'auth.studentId': 'Student ID / BJTU Email',
    'auth.studentIdPlaceholder': 'Enter 10-digit Student ID (e.g. 2023010482)',
    'auth.teacherStaffId': 'Staff ID / BJTU Email',
    'auth.teacherStaffIdPlaceholder': 'Enter Staff ID (e.g. BJTU-T10024)',
    'auth.password': 'Password / CAS PIN',
    'auth.signInBtn': 'Sign In to Portal',
    'auth.registerStudentBtn': 'Register Student Profile & Enter',
    'auth.registerTeacherBtn': 'Onboard Faculty & Open Inbox',
    'auth.ssoActive': 'Unified CAS / SSO Active',
    'auth.fullName': 'Full English Name',
    'auth.chineseName': 'Chinese Name',
    'auth.academicTitle': 'Academic Title',
    'auth.department': 'Department',
    'auth.officeLocation': 'Office Location',
    'auth.officeHours': 'Consultation Hours',
  },
  zh: {
    // Branding & Header
    'app.name': '知行协同',
    'app.university': '北京交通大学',
    'app.tagline': '师生学业咨询协同门户',
    'app.motto': '知行合一 • 教学相长',
    'app.signOut': '退出登录',
    'app.switchPersona': '切换身份',
    'app.editProfile': '修改个人信息',
    'app.role.student': '学生',
    'app.role.teacher': '教师 / 教授',
    'app.resetDemo': '重置演示数据',
    'app.loading': '正在载入北京交通大学协同门户...',
    'app.connecting': '正在连接北京交通大学实时协同网络',
    'app.footer.copy': '北京交通大学 • 师生咨询协同系统',
    'app.footer.motto': '知行校训 • 轨道交通与智能信息技术综合平台',
    'app.footer.year': '2026-2027学年',

    // Navigation Tabs (Student)
    'tab.directory': '师资目录',
    'tab.courses': '我的已选课程与课表',
    'tab.chats': '咨询沟通',

    // Navigation Tabs (Teacher)
    'tab.inbox': '咨询收件箱',
    'tab.schedule': '答疑时间与状态',

    // Common Actions
    'action.search': '搜索',
    'action.filter': '筛选',
    'action.reset': '重置',
    'action.clear': '清除',
    'action.cancel': '取消',
    'action.save': '保存',
    'action.confirm': '确认',
    'action.delete': '删除',
    'action.edit': '编辑',
    'action.close': '关闭',
    'action.send': '发送',
    'action.back': '返回',
    'action.view': '查看',
    'action.select': '选择此课',
    'action.drop': '退选此课',
    'action.addCustomCourse': '自主添加课程',
    'action.bookOfficeHour': '预约答疑',
    'action.startChat': '发起直连咨询',
    'action.viewProfile': '查看主页',

    // Statuses
    'status.available': '在线可答疑',
    'status.office_hours': '答疑时间中',
    'status.in_meeting': '会议 / 学术研讨中',
    'status.offline': '离线 / 暂离',
    'status.all': '全部状态',

    // Faculty Directory
    'faculty.hub.badge': '北京交通大学师资咨询平台',
    'faculty.hub.title': '直连全校优秀教师与学术导师',
    'faculty.hub.desc': '浏览全校认证教授与导师信息，实时查看答疑开放状态，发起一对一学业辅导、科研探讨与选课指导咨询。',
    'faculty.schools': '学院目录',
    'faculty.schoolDirectory': '北京交通大学学院目录',
    'faculty.filterSchool': '筛选学院...',
    'faculty.allSchools': '全部学院',
    'faculty.searchPlaceholder': '按教师姓名、系所、研究方向搜索...',
    'faculty.clearFilters': '清除全部筛选',
    'faculty.professorsFound': '位教师匹配',
    'faculty.yourInstructor': '您本学期的任课教师',
    'faculty.officeLocation': '办公地点',
    'faculty.officeHours': '答疑时间',
    'faculty.coursesTaught': '主讲课程',
    'faculty.researchAreas': '研究方向',
    'faculty.noResults': '未找到匹配的教师',
    'faculty.tryAdjusting': '请尝试调整搜索关键词或清除学院筛选条件。',

    // Courses & Timetable
    'courses.portal.badge': '北京交通大学教务管理系统 (AA & MIS)',
    'courses.portal.title': '课程选修与个人课表',
    'courses.portal.desc': '已直连北京交通大学教务系统 (aa.bjtu.edu.cn) 及综合信息服务系统 (MIS)。支持查看已选课程、周课表日程、自主选课大厅与自主添加新课程。',
    'courses.subtab.enrolled': '我的已选课程',
    'courses.subtab.timetable': '选课课表',
    'courses.subtab.selection': '自主选课大厅',
    'courses.totalEnrolled': '已选课程总数',
    'courses.totalCredits': '已修 / 所选学分',
    'courses.quickAdd': '自主添加课程',
    'courses.col.code': '课程代码',
    'courses.col.name': '课程名称',
    'courses.col.school': '开课学院',
    'courses.col.instructor': '主讲教师',
    'courses.col.credits': '学分',
    'courses.col.schedule': '时间与教室',
    'courses.col.category': '课程性质',
    'courses.col.action': '操作',
    'courses.category.required': '必修课',
    'courses.category.elective': '专业选修',
    'courses.category.general': '通识选修',
    'courses.timetable.header': '个人学期周课表 (周一 至 周五)',
    'courses.timetable.day1': '星期一',
    'courses.timetable.day2': '星期二',
    'courses.timetable.day3': '星期三',
    'courses.timetable.day4': '星期四',
    'courses.timetable.day5': '星期五',
    'courses.timetable.period1': '第 1-2 节 (08:00 - 09:35)',
    'courses.timetable.period2': '第 3-4 节 (10:00 - 11:35)',
    'courses.timetable.period3': '第 5-6 节 (14:00 - 15:35)',
    'courses.timetable.period4': '第 7-8 节 (16:00 - 17:35)',
    'courses.timetable.period5': '第 9-10 节 (19:00 - 20:35)',
    'courses.selection.search': '按课程代码、名称或主讲教师搜索可选课程...',
    'courses.selection.allCategories': '全部课程类别',
    'courses.selection.available': '门课程开放选课',
    'courses.enrolledBadge': '已选',

    // Add Custom Course Modal
    'modal.addCourse.title': '自主添加课程',
    'modal.addCourse.subtitle': '自定义课程录入，自动同步至北京交通大学教务系统 (AA & MIS) 课表',
    'modal.addCourse.code': '课程代码',
    'modal.addCourse.codePlaceholder': '例如: CS410',
    'modal.addCourse.name': '课程英文名称',
    'modal.addCourse.namePlaceholder': '例如: Intelligent Rail Algorithms',
    'modal.addCourse.zhName': '课程中文名称',
    'modal.addCourse.zhNamePlaceholder': '例如: 智能轨道交通算法',
    'modal.addCourse.school': '开课学院',
    'modal.addCourse.instructor': '主讲教师',
    'modal.addCourse.credits': '学分',
    'modal.addCourse.category': '课程属性',
    'modal.addCourse.classroom': '上课教室',
    'modal.addCourse.classroomPlaceholder': '例如: 思源东楼402',
    'modal.addCourse.classDays': '上课星期',
    'modal.addCourse.classPeriod': '上课节次',
    'modal.addCourse.directEnroll': '创建后直接加入我的已选课程',
    'modal.addCourse.submit': '保存并选课',

    // Chat & Consultations
    'chat.inbox': '当前咨询列表',
    'chat.search': '搜索咨询对话...',
    'chat.typePlaceholder': '输入您的学业学术咨询消息...',
    'chat.quickTags': '咨询分类标签',
    'chat.sendBtn': '发送消息',
    'chat.emptySelect': '请选择对话或教师以开始咨询沟通',
    'chat.officeHourBooked': '答疑预约成功',
    'chat.requestOfficeHour': '申请预约答疑',
    'chat.noMessages': '暂无咨询记录。',

    // Teacher Inbox & Office Hours
    'teacher.inbox.title': '学生咨询协同收件箱',
    'teacher.inbox.desc': '统一处理学生学业提问、答疑预约申请与学术沟通。',
    'teacher.filter.all': '全部咨询',
    'teacher.filter.unread': '未读消息',
    'teacher.filter.officeHour': '答疑预约',
    'teacher.status.toggle': '答疑状态快速切换',
    'teacher.status.broadcast': '向全校学生实时广播您的当前答疑开放状态',
    'teacher.studentContext': '学生学业背景档案',
    'teacher.major': '专业',
    'teacher.grade': '年级',
    'teacher.class': '班级',
    'teacher.studentId': '学号',

    // Auth Portal
    'auth.title': '选择您的北京交通大学访问通道',
    'auth.subtitle': '请选择您作为学生或教师身份进入专属协同工作台。',
    'auth.channel.student': '学生访问通道',
    'auth.channel.studentDesc': '本科生、硕士及博士研究生',
    'auth.channel.teacher': '教师访问通道',
    'auth.channel.teacherDesc': '教授、副教授、讲师及教学科研人员',
    'auth.loginTab': '学工号统一身份认证',
    'auth.registerTab': '新用户注册通道',
    'auth.studentId': '学号 / 校园邮箱',
    'auth.studentIdPlaceholder': '请输入10位学号 (如 2023010482)',
    'auth.teacherStaffId': '工号 / 校园邮箱',
    'auth.teacherStaffIdPlaceholder': '请输入教工号 (如 BJTU-T10024)',
    'auth.password': '统一认证密码',
    'auth.signInBtn': '登录协同系统',
    'auth.registerStudentBtn': '注册学生档案并进入',
    'auth.registerTeacherBtn': '完成教师入驻并打开收件箱',
    'auth.ssoActive': 'BJTU 统一身份认证已连接',
    'auth.fullName': '英文姓名',
    'auth.chineseName': '中文姓名',
    'auth.academicTitle': '职称',
    'auth.department': '所属系所',
    'auth.officeLocation': '办公室地点',
    'auth.officeHours': '答疑时间',
  },
};

function cleanLocation(location: string, lang: Language): string {
  if (!location) return '';
  const match = location.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return lang === 'zh' ? match[2] : match[1];
  }
  return location;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  formatSchool: (keyOrName: string) => keyOrName,
  formatCourse: (course) => course.name,
  formatTeacher: (teacher) => teacher.fullName,
  formatLocation: (loc) => loc,
  formatCategory: (cat) => cat,
  formatTitle: (title) => title,
  formatOfficeHours: (hours) => hours,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'zh') {
        setLanguageState(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] || fallback || key;
  };

  const formatSchool = (keyOrName: string): string => {
    if (!keyOrName) return '';
    const faculty = FACULTIES.find(
      (f) => f.key === keyOrName || f.nameZh === keyOrName || f.nameEn === keyOrName || keyOrName.includes(f.nameZh)
    );
    if (faculty) {
      return language === 'zh' ? faculty.nameZh : faculty.nameEn;
    }
    const match = keyOrName.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return language === 'zh' ? match[2] : match[1];
    }
    return keyOrName;
  };

  const formatCourse = (course: Pick<Course, 'name' | 'chineseName'>): string => {
    if (!course) return '';
    if (language === 'zh') {
      return course.chineseName || course.name;
    }
    return course.name;
  };

  const formatTeacher = (teacher: Pick<TeacherProfile, 'fullName' | 'chineseName'>): string => {
    if (!teacher) return '';
    if (language === 'zh') {
      return teacher.chineseName || teacher.fullName;
    }
    return teacher.fullName;
  };

  const formatLocation = (location: string): string => {
    return cleanLocation(location, language);
  };

  const formatCategory = (category: string): string => {
    if (category === 'required') {
      return language === 'zh' ? '必修课' : 'Major Required';
    }
    if (category === 'elective') {
      return language === 'zh' ? '专业选修' : 'Major Elective';
    }
    if (category === 'general') {
      return language === 'zh' ? '通识选修' : 'General Education';
    }
    return category;
  };

  const formatTitle = (title: string): string => {
    if (!title) return '';
    if (language === 'en') return title;
    const map: Record<string, string> = {
      'Associate Professor & Vice Dean': '副教授、副院长',
      'Professor & Doctoral Supervisor': '教授、博士生导师',
      'Distinguished Professor': '特聘教授、博士生导师',
      'Full Professor': '教授',
      'Professor': '教授',
      'Associate Professor': '副教授',
      'Assistant Professor': '助理教授',
      'Lecturer': '讲师',
      'Senior Lecturer': '高级讲师',
      'Senior Engineer': '高级工程师',
      'Chair Professor': '讲席教授',
    };
    return map[title] || title;
  };

  const formatOfficeHours = (hours: string): string => {
    if (!hours) return '';
    if (language === 'en') return hours;
    return hours
      .replace(/Monday/g, '周一')
      .replace(/Tuesday/g, '周二')
      .replace(/Wednesday/g, '周三')
      .replace(/Thursday/g, '周四')
      .replace(/Friday/g, '周五')
      .replace(/Mon/g, '周一')
      .replace(/Tue/g, '周二')
      .replace(/Wed/g, '周三')
      .replace(/Thu/g, '周四')
      .replace(/Fri/g, '周五')
      .replace(/&/g, '、');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatSchool,
        formatCourse,
        formatTeacher,
        formatLocation,
        formatCategory,
        formatTitle,
        formatOfficeHours,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
