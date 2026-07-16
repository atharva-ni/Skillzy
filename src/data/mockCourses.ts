export interface MockStep {
  id: string;
  title: string;
  stepType: 'text' | 'video' | 'lab';
  sortOrder: number;
  textContent?: string;
  videoUrl?: string;
  videoDurationSecs?: number;
  labLanguage?: string;
  labStarterCode?: string;
  labInstructions?: string;
}

export interface MockLesson {
  id: string;
  title: string;
  description: string;
  durationMins: number;
  isFree: boolean;
  sortOrder: number;
  steps: MockStep[];
}

export interface MockModule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: MockLesson[];
}

export interface MockCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructorId: string;
  categoryId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'published';
  price: number;
  currency: string;
  thumbnailUrl: string;
  durationHours: number;
  studentsEnrolled: number;
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  category: {
    name: string;
    slug: string;
    icon: string;
  };
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    bio: string;
  };
  modules: MockModule[];
}

export const MOCK_COURSES: MockCourse[] = [];
