export type UserRole = 'student' | 'instructor' | 'recruiter' | 'admin';

export interface User {
  id: string;
  clerkId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  isVerified?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  modules: number;
  lessons: number;
  image: string;
  status: 'published' | 'draft' | 'pending';
  progress?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  status: 'active' | 'closed' | 'draft';
  description: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: 'active' | 'closed' | 'draft';
  type: 'coding' | 'written' | 'quiz';
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: string;
  grade: number | null;
  status: 'pending' | 'graded' | 'ai_reviewed';
  aiScore: number | null;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface Payment {
  id: string;
  studentName: string;
  courseName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  method: string;
  invoiceId: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  matchScore: number;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'hired' | 'rejected';
  skills: string[];
  experience: string;
}
