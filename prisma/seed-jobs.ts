import { PrismaClient, JobType, JobStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding jobs for recruiter addys1243@gmail.com...');

  // 1. Find or create the recruiter
  let recruiter = await prisma.user.findUnique({
    where: { email: 'addys1243@gmail.com' }
  });

  if (!recruiter) {
    console.log('Recruiter user not found, creating user addys1243@gmail.com...');
    recruiter = await prisma.user.create({
      data: {
        clerkId: 'user_recruiter_addys',
        email: 'addys1243@gmail.com',
        firstName: 'Adwait',
        lastName: 'Recruiter',
        username: 'addys_recruiter',
        role: UserRole.recruiter,
        isVerified: true,
        isActive: true,
        bio: 'Tech Recruiter looking for high-quality developer talent.'
      }
    });
  } else {
    console.log(`Recruiter user found: ${recruiter.firstName} ${recruiter.lastName}. Ensuring role is recruiter...`);
    recruiter = await prisma.user.update({
      where: { id: recruiter.id },
      data: { role: UserRole.recruiter }
    });
  }

  console.log(`Recruiter ID: ${recruiter.id}`);

  // 2. Define the jobs list to seed (3 original + 2 random new ones)
  const jobsToSeed = [
    {
      title: 'Junior Python Developer',
      company: 'Stripe',
      companyLogo: 'S',
      location: 'Remote',
      jobType: JobType.full_time,
      salaryMin: 95000,
      salaryMax: 115000,
      salaryDisplay: '$95,000 - $115,000',
      description: 'We are looking for a Junior Python Developer to join our backend integration team. You will write clean, testable Python code and build scalable APIs.',
      requirements: '• Solid understanding of Python 3\n• Experience with Flask, Django or FastAPI\n• Familiarity with relational databases (PostgreSQL/MySQL)\n• Basic git workflow knowledge',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Git'],
    },
    {
      title: 'Frontend Engineer Intern',
      company: 'Vercel',
      companyLogo: 'V',
      location: 'San Francisco, CA',
      jobType: JobType.internship,
      salaryMin: 40,
      salaryMax: 55,
      salaryDisplay: '$40 - $55 / hr',
      description: 'Join the Vercel design system team to craft premium web interfaces using React, Next.js, and CSS modules. Help build the future of the web platform.',
      requirements: '• Strong knowledge of HTML, CSS, and modern JavaScript\n• Hands-on projects built with React/Next.js\n• Attention to detail, layouts, and web animations\n• Good team communication skills',
      skills: ['React', 'Next.js', 'CSS Modules', 'TypeScript'],
    },
    {
      title: 'Software Engineer',
      company: 'GitHub',
      companyLogo: 'G',
      location: 'Remote, US',
      jobType: JobType.full_time,
      salaryMin: 110000,
      salaryMax: 140000,
      salaryDisplay: '$110,000 - $140,000',
      description: 'Help build and maintain the developer platforms at GitHub. You will design web-scale APIs, work with highly distributed service grids, and improve the daily flow of millions of developers.',
      requirements: '• 2+ years of software development experience\n• Proficiency in Go, Ruby, or Node.js\n• Experience building high-throughput distributed systems\n• Solid understanding of API security protocols',
      skills: ['Go', 'Ruby on Rails', 'Docker', 'REST APIs'],
    },
    {
      title: 'Backend Engineer (Go/Node.js)',
      company: 'Uber',
      companyLogo: 'U',
      location: 'Bangalore, India',
      jobType: JobType.full_time,
      salaryMin: 1800000,
      salaryMax: 2400000,
      salaryDisplay: '₹1,800,000 - ₹2,400,000',
      description: 'Design and write high-throughput microservices, optimize real-time routing engines, and manage high-volume transactional databases supporting millions of rides.',
      requirements: '• Strong proficiency in Go, C++ or Node.js\n• Experience with Redis, Kafka or RabbitMQ\n• Familiarity with PostgreSQL optimization\n• Passion for writing clean, performant service layers',
      skills: ['Go', 'Redis', 'Kafka', 'PostgreSQL', 'Microservices'],
    },
    {
      title: 'Data Engineer',
      company: 'Netflix',
      companyLogo: 'N',
      location: 'Remote, India',
      jobType: JobType.full_time,
      salaryMin: 1500000,
      salaryMax: 2000000,
      salaryDisplay: '₹1,500,000 - ₹2,000,000',
      description: 'Build stream processing pipelines using Apache Spark, manage multi-petabyte warehouses, and optimize analytical SQL databases for real-time recommendation engines.',
      requirements: '• Proficiency in Python, Scala, or Java\n• Experience with Apache Spark, Hadoop, or Snowflake\n• Excellent SQL query optimization skills\n• Familiarity with cloud storage solutions (AWS S3/RDS)',
      skills: ['Apache Spark', 'Python', 'Snowflake', 'AWS', 'SQL'],
    }
  ];

  for (const jobData of jobsToSeed) {
    // Find or create the job by company and title
    let dbJob = await prisma.job.findFirst({
      where: {
        company: jobData.company,
        title: jobData.title
      }
    });

    if (!dbJob) {
      console.log(`Creating job: ${jobData.title} at ${jobData.company}...`);
      await prisma.job.create({
        data: {
          ...jobData,
          recruiterId: recruiter.id,
          status: JobStatus.active,
          publishedAt: new Date()
        }
      });
    } else {
      console.log(`Job already exists: ${jobData.title} at ${jobData.company}. Updating fields...`);
      await prisma.job.update({
        where: { id: dbJob.id },
        data: {
          ...jobData,
          recruiterId: recruiter.id,
          status: JobStatus.active
        }
      });
    }
  }

  console.log('Jobs seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
