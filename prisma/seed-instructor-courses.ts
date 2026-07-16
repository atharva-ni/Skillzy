import { PrismaClient, CourseLevel, CourseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding courses for instructor sahasrabudheadwait7@gmail.com...');

  // 1. Find the instructor
  const instructor = await prisma.user.findUnique({
    where: { email: 'sahasrabudheadwait7@gmail.com' }
  });

  if (!instructor) {
    console.error('ERROR: User with email sahasrabudheadwait7@gmail.com not found in database.');
    process.exit(1);
  }

  console.log(`Found instructor: ${instructor.firstName} ${instructor.lastName} (ID: ${instructor.id})`);

  // 2. Ensure categories exist
  const schoolCategory = await prisma.category.upsert({
    where: { slug: 'school-courses' },
    update: {},
    create: {
      name: 'School Courses',
      slug: 'school-courses',
      icon: '🏫',
      sortOrder: 6
    }
  });

  const professionalCategory = await prisma.category.upsert({
    where: { slug: 'professional-courses' },
    update: {},
    create: {
      name: 'Professional Courses',
      slug: 'professional-courses',
      icon: '💼',
      sortOrder: 7
    }
  });

  console.log('Categories verified.');

  // 3. Define the courses list
  const coursesToSeed = [
    // School Courses
    {
      title: 'EuroSchool Python Programming for Grade 7',
      slug: 'euroschool-python-programming-grade-7',
      description: 'Learn the foundations of programming with Python. Designed specifically for EuroSchool Grade 7 students, covering variables, loops, conditions, and basic drawing with Turtle.',
      shortDescription: 'Introductory Python programming tailored for Grade 7 curriculum.',
      categoryId: schoolCategory.id,
      level: CourseLevel.beginner,
      price: 250000, // ₹2,500 in paise
      durationHours: 15.0,
      studentsEnrolled: 342,
      ratingAvg: 4.8,
      ratingCount: 28,
      isFeatured: false,
      modules: [
        {
          title: 'Introduction to Python',
          description: 'First steps in writing code with Python.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Hello World in Python',
              description: 'Learn how to print messages and run your first Python program.',
              durationMins: 20,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Introduction to printing',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Python makes it super easy to print text. Use the print() function:\n\n```python\nprint("Hello, EuroSchool!")\n```\nTry typing this in your editor to see the output!',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Delhi Public School Java Programming for Grade 8',
      slug: 'dps-java-programming-grade-8',
      description: 'An engaging introduction to object-oriented programming in Java for DPS Grade 8 students. Learn classes, objects, methods, and compile your first programs.',
      shortDescription: 'Core Java fundamentals for Grade 8 school curriculum.',
      categoryId: schoolCategory.id,
      level: CourseLevel.beginner,
      price: 350000, // ₹3,500 in paise
      durationHours: 18.0,
      studentsEnrolled: 412,
      ratingAvg: 4.7,
      ratingCount: 35,
      isFeatured: false,
      modules: [
        {
          title: 'Java Basics',
          description: 'Introduction to Java Syntax and Structure.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Understanding Class & Main Method',
              description: 'Learn why every Java program starts with a class.',
              durationMins: 25,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'The Main Method',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'In Java, the entry point of execution is the `main` method:\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DPS!");\n    }\n}\n```',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Orchids International School Scratch Programming for Grade 6',
      slug: 'orchids-scratch-programming-grade-6',
      description: 'Visual block-based programming with Scratch for Orchids International Grade 6 students. Build stories, games, and animations step-by-step.',
      shortDescription: 'Fun and interactive game design using Scratch block coding.',
      categoryId: schoolCategory.id,
      level: CourseLevel.beginner,
      price: 550000, // ₹5,500 in paise
      durationHours: 12.0,
      studentsEnrolled: 528,
      ratingAvg: 4.9,
      ratingCount: 42,
      isFeatured: false,
      modules: [
        {
          title: 'Getting Started with Blocks',
          description: 'Drag and drop programming concepts.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Moving your Sprite',
              description: 'Make a cat sprite move and sound.',
              durationMins: 15,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Movement Blocks',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Drag the **Move 10 steps** block into the scripting area and click on it to see your Sprite move!',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'VIBGYOR High HTML & CSS for Grade 9',
      slug: 'vibgyor-html-css-grade-9',
      description: 'Learn to design and style websites from scratch. Perfect for VIBGYOR High Grade 9 students looking to learn HTML tags, CSS styling, layouts, and page structures.',
      shortDescription: 'Create beautiful, responsive static websites with HTML & CSS.',
      categoryId: schoolCategory.id,
      level: CourseLevel.beginner,
      price: 300000, // ₹3,000 in paise
      durationHours: 16.0,
      studentsEnrolled: 289,
      ratingAvg: 4.6,
      ratingCount: 22,
      isFeatured: false,
      modules: [
        {
          title: 'HTML Structure',
          description: 'Learn the basic skeleton of web pages.',
          sortOrder: 1,
          lessons: [
            {
              title: 'HTML Headings & Paragraphs',
              description: 'Structure content using heading and paragraph tags.',
              durationMins: 20,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Basic HTML Tags',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Learn how to use `<h1>` through `<h6>` for headings and `<p>` for paragraphs:\n\n```html\n<h1>Welcome to my website</h1>\n<p>This is a paragraph of text.</p>\n```',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Ryan International School C Programming for Class 11',
      slug: 'ryan-c-programming-class-11',
      description: 'Get a head start in computer science with standard C Programming. Specifically designed for Ryan International Class 11 students, covering syntax, data types, structures, arrays, and functions.',
      shortDescription: 'Intermediate programming fundamentals using the C language.',
      categoryId: schoolCategory.id,
      level: CourseLevel.intermediate,
      price: 450000, // ₹4,500 in paise
      durationHours: 24.0,
      studentsEnrolled: 195,
      ratingAvg: 4.5,
      ratingCount: 19,
      isFeatured: false,
      modules: [
        {
          title: 'Introduction to C',
          description: 'Setting up compilation and basic variables.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Variables and Data Types',
              description: 'Understand integers, floats, characters, and standard declaration.',
              durationMins: 30,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Data Types',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'In C, variables must be declared with a type:\n\n```c\n#include <stdio.h>\n\nint main() {\n    int age = 16;\n    printf("Age is %d\\n", age);\n    return 0;\n}\n```',
                }
              ]
            }
          ]
        }
      ]
    },

    // Professional Courses
    {
      title: 'Full-Stack Web Development with React & Next.js',
      slug: 'full-stack-web-development-react-nextjs',
      description: 'Master modern full-stack web application development. Learn component architectures, server-side rendering, routing, middleware, api handling, database migrations, and deployments using React & Next.js.',
      shortDescription: 'Build high-performance full-stack web applications with React & Next.js.',
      categoryId: professionalCategory.id,
      level: CourseLevel.advanced,
      price: 550000, // ₹5,500 in paise
      durationHours: 45.0,
      studentsEnrolled: 1420,
      ratingAvg: 4.9,
      ratingCount: 154,
      isFeatured: true,
      modules: [
        {
          title: 'React & Next.js Foundations',
          description: 'Building blocks of state and server rendering.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Server vs Client Components',
              description: 'Understand the core concepts of RSC in Next.js.',
              durationMins: 35,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'React Server Components',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'By default, Next.js uses React Server Components (RSC) to render pages on the server for faster load times and better SEO.',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Machine Learning with Python',
      slug: 'machine-learning-python',
      description: 'Go from mathematical formulas to code. Learn NumPy, Pandas, Scikit-Learn, TensorFlow, regression analysis, clustering, neural networks, and model evaluations.',
      shortDescription: 'Build and deploy predictive machine learning models using Python.',
      categoryId: professionalCategory.id,
      level: CourseLevel.advanced,
      price: 300000, // ₹3,000 in paise
      durationHours: 38.0,
      studentsEnrolled: 980,
      ratingAvg: 4.8,
      ratingCount: 88,
      isFeatured: false,
      modules: [
        {
          title: 'Supervised Learning',
          description: 'Algorithms that learn from labeled training data.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Linear Regression from Scratch',
              description: 'Learn the math behind fitting lines.',
              durationMins: 40,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Regression Line Fitting',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Learn how variables are plotted and how mean squared error is minimized to find optimal weights.',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Data Structures & Algorithms using C++',
      slug: 'data-structures-algorithms-cpp',
      description: 'Ace technical interviews. Deep dive into big-O notation, arrays, linked lists, hash tables, binary trees, graphs, sorting, searching, and advanced algorithmic paradigms in C++.',
      shortDescription: 'Master data structures & algorithm designs for technical interviews.',
      categoryId: professionalCategory.id,
      level: CourseLevel.intermediate,
      price: 450000, // ₹4,500 in paise
      durationHours: 40.0,
      studentsEnrolled: 2310,
      ratingAvg: 4.9,
      ratingCount: 220,
      isFeatured: true,
      modules: [
        {
          title: 'Complexity & Big-O Notation',
          description: 'Analyze time and space complexity of code.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Time Complexity Intro',
              description: 'Evaluate loops and recursive calls.',
              durationMins: 30,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Constant vs Linear Time',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Understand O(1) constant time versus O(n) linear execution time using loop diagnostics.',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      description: 'Learn the principles of securing modern networks and systems. Covers cryptography, network defense protocols, threat analysis, access controls, risk management, and cybersecurity policies.',
      shortDescription: 'Core concepts in information security, threat defense, and protocols.',
      categoryId: professionalCategory.id,
      level: CourseLevel.beginner,
      price: 250000, // ₹2,500 in paise
      durationHours: 30.0,
      studentsEnrolled: 640,
      ratingAvg: 4.7,
      ratingCount: 47,
      isFeatured: false,
      modules: [
        {
          title: 'Cryptography',
          description: 'Secure communication techniques.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Symmetric vs Asymmetric Encryption',
              description: 'Learn private and public key structures.',
              durationMins: 35,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Public Keys',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Asymmetric encryption relies on a public key for encryption and a private key for decryption, securing communication paths.',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Cloud Computing with AWS',
      slug: 'cloud-computing-aws',
      description: 'Learn to design, build, scale, and secure reliable cloud architectures on Amazon Web Services. Covers EC2, S3, RDS, Lambda, IAM, VPC, and CloudWatch metrics.',
      shortDescription: 'Understand cloud services, architectures, and deployments with AWS.',
      categoryId: professionalCategory.id,
      level: CourseLevel.intermediate,
      price: 350000, // ₹3,500 in paise
      durationHours: 35.0,
      studentsEnrolled: 810,
      ratingAvg: 4.8,
      ratingCount: 63,
      isFeatured: false,
      modules: [
        {
          title: 'AWS Core Services',
          description: 'Compute, Storage, and Networking essentials.',
          sortOrder: 1,
          lessons: [
            {
              title: 'Introduction to EC2 and S3',
              description: 'Configure a virtual server and cloud file storage bucket.',
              durationMins: 45,
              isFree: true,
              sortOrder: 1,
              steps: [
                {
                  title: 'Launching EC2 Instances',
                  stepType: 'text',
                  sortOrder: 1,
                  textContent: 'Amazon Elastic Compute Cloud (EC2) provides resizable computing capacity in the AWS Cloud.',
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  for (const cData of coursesToSeed) {
    const { modules, ...courseFields } = cData;

    // Check if course already exists
    let dbCourse = await prisma.course.findUnique({
      where: { slug: courseFields.slug }
    });

    if (!dbCourse) {
      console.log(`Creating course: ${courseFields.title}...`);
      dbCourse = await prisma.course.create({
        data: {
          ...courseFields,
          instructorId: instructor.id,
          status: CourseStatus.published,
        }
      });
    } else {
      console.log(`Course already exists: ${courseFields.title}. Updating field data...`);
      dbCourse = await prisma.course.update({
        where: { id: dbCourse.id },
        data: {
          ...courseFields,
          instructorId: instructor.id,
          status: CourseStatus.published,
        }
      });
    }

    // Seed modules, lessons, and steps
    for (const mData of modules) {
      const { lessons, ...moduleFields } = mData;

      // Find or create module
      let dbModule = await prisma.module.findFirst({
        where: { courseId: dbCourse.id, title: moduleFields.title }
      });

      if (!dbModule) {
        dbModule = await prisma.module.create({
          data: {
            ...moduleFields,
            courseId: dbCourse.id
          }
        });
      }

      for (const lData of lessons) {
        const { steps, ...lessonFields } = lData;

        // Find or create lesson
        let dbLesson = await prisma.lesson.findFirst({
          where: { moduleId: dbModule.id, title: lessonFields.title }
        });

        if (!dbLesson) {
          dbLesson = await prisma.lesson.create({
            data: {
              ...lessonFields,
              moduleId: dbModule.id
            }
          });
        }

        for (const sData of steps) {
          // Find or create lesson step
          let dbStep = await prisma.lessonStep.findFirst({
            where: { lessonId: dbLesson.id, title: sData.title }
          });

          if (!dbStep) {
            await prisma.lessonStep.create({
              data: {
                title: sData.title,
                stepType: 'text',
                sortOrder: sData.sortOrder,
                textContent: sData.textContent,
                lessonId: dbLesson.id
              }
            });
          }
        }
      }
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
