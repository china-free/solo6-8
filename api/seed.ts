import dotenv from 'dotenv'
dotenv.config()

import prisma from './prisma.js'
import { hashPassword } from './lib/password.js'

async function main() {
  console.log('开始清理现有数据...')

  await prisma.statusLog.deleteMany()
  await prisma.interviewEvaluation.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.job.deleteMany()
  await prisma.user.deleteMany()

  console.log('清理完成，开始创建种子数据...')

  const passwordHash = await hashPassword('123456')

  const admin = await prisma.user.create({
    data: {
      name: '系统管理员',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      department: '技术部',
    },
  })
  console.log(`创建用户: ${admin.name} (${admin.email})`)

  const hr = await prisma.user.create({
    data: {
      name: '张HR',
      email: 'hr@example.com',
      passwordHash,
      role: 'HR',
      department: '人力资源部',
    },
  })
  console.log(`创建用户: ${hr.name} (${hr.email})`)

  const interviewer = await prisma.user.create({
    data: {
      name: '李面试官',
      email: 'interviewer@example.com',
      passwordHash,
      role: 'INTERVIEWER',
      department: '技术部',
    },
  })
  console.log(`创建用户: ${interviewer.name} (${interviewer.email})`)

  const manager = await prisma.user.create({
    data: {
      name: '王经理',
      email: 'manager@example.com',
      passwordHash,
      role: 'HIRING_MANAGER',
      department: '产品部',
    },
  })
  console.log(`创建用户: ${manager.name} (${manager.email})`)

  const job1 = await prisma.job.create({
    data: {
      title: '高级前端工程师',
      department: '技术部',
      description: '负责公司核心产品的前端开发，参与技术架构设计与优化。',
      requirements: '5年以上前端开发经验，精通React/Vue，熟悉Node.js。',
      salaryRange: '25K-40K',
      location: '北京',
      status: 'PUBLISHED',
      hiringManagerId: manager.id,
    },
  })
  console.log(`创建职位: ${job1.title}`)

  const job2 = await prisma.job.create({
    data: {
      title: '产品经理',
      department: '产品部',
      description: '负责产品需求分析、产品规划与设计，推动产品迭代。',
      requirements: '3年以上产品经理经验，有B端产品经验优先。',
      salaryRange: '20K-35K',
      location: '上海',
      status: 'PUBLISHED',
      hiringManagerId: manager.id,
    },
  })
  console.log(`创建职位: ${job2.title}`)

  const job3 = await prisma.job.create({
    data: {
      title: '后端开发工程师',
      department: '技术部',
      description: '负责公司后端服务的开发与维护，保障系统稳定性。',
      requirements: '3年以上Java/Go开发经验，熟悉微服务架构。',
      salaryRange: '22K-38K',
      location: '深圳',
      status: 'DRAFT',
      hiringManagerId: manager.id,
    },
  })
  console.log(`创建职位: ${job3.title}`)

  const candidateData = [
    { name: '张三', email: 'zhangsan@example.com', phone: '13800138001', position: '高级前端工程师', experience: 6, education: '本科', skills: 'React,Vue,TypeScript,Node.js', status: 'HIRED' as const, source: '智联招聘', rating: 5, appliedJobId: job1.id },
    { name: '李四', email: 'lisi@example.com', phone: '13800138002', position: '前端开发工程师', experience: 4, education: '本科', skills: 'Vue,JavaScript,Webpack', status: 'OFFER_ACCEPTED' as const, source: 'BOSS直聘', rating: 4, appliedJobId: job1.id },
    { name: '王五', email: 'wangwu@example.com', phone: '13800138003', position: '产品经理', experience: 5, education: '硕士', skills: 'Axure,需求分析,项目管理', status: 'FINAL_INTERVIEW' as const, source: '猎头推荐', rating: 4, appliedJobId: job2.id },
    { name: '赵六', email: 'zhaoliu@example.com', phone: '13800138004', position: '高级产品经理', experience: 7, education: '本科', skills: '产品规划,B端产品,数据分析', status: 'SECOND_INTERVIEW' as const, source: '内部推荐', rating: 5, appliedJobId: job2.id },
    { name: '钱七', email: 'qianqi@example.com', phone: '13800138005', position: '前端工程师', experience: 3, education: '本科', skills: 'React,JavaScript,CSS', status: 'FIRST_INTERVIEW' as const, source: '拉勾网', rating: 3, appliedJobId: job1.id },
    { name: '孙八', email: 'sunba@example.com', phone: '13800138006', position: '后端工程师', experience: 4, education: '本科', skills: 'Java,Spring Boot,MySQL', status: 'SCREENING_PASSED' as const, source: '智联招聘', rating: 4, appliedJobId: job3.id },
    { name: '周九', email: 'zhoujiu@example.com', phone: '13800138007', position: '产品经理', experience: 3, education: '本科', skills: '需求文档,原型设计,用户调研', status: 'SCREENING' as const, source: 'BOSS直聘', rating: 3, appliedJobId: job2.id },
    { name: '吴十', email: 'wushi@example.com', phone: '13800138008', position: '前端开发', experience: 2, education: '大专', skills: 'HTML,CSS,JavaScript', status: 'NEW' as const, source: '前程无忧', rating: 2, appliedJobId: job1.id },
    { name: '郑十一', email: 'zheng11@example.com', phone: '13800138009', position: '高级后端工程师', experience: 8, education: '硕士', skills: 'Go,Microservices,Kubernetes', status: 'OFFER_SENT' as const, source: '猎头推荐', rating: 5, appliedJobId: job3.id },
    { name: '王十二', email: 'wang12@example.com', phone: '13800138010', position: '前端工程师', experience: 5, education: '本科', skills: 'React,Vue,TypeScript', status: 'OFFER_PENDING' as const, source: '内部推荐', rating: 4, appliedJobId: job1.id },
    { name: '冯十三', email: 'feng13@example.com', phone: '13800138011', position: '产品经理', experience: 4, education: '本科', skills: '产品设计,数据分析,项目管理', status: 'REJECTED' as const, source: '拉勾网', rating: 2, appliedJobId: job2.id },
    { name: '陈十四', email: 'chen14@example.com', phone: '13800138012', position: '后端开发', experience: 3, education: '本科', skills: 'Java,MyBatis,Redis', status: 'NEW' as const, source: '智联招聘', rating: 3, appliedJobId: job3.id },
    { name: '楚十五', email: 'chu15@example.com', phone: '13800138013', position: '前端工程师', experience: 4, education: '本科', skills: 'Vue,React,小程序', status: 'SCREENING' as const, source: 'BOSS直聘', rating: 3, appliedJobId: job1.id },
    { name: '魏十六', email: 'wei16@example.com', phone: '13800138014', position: '产品助理', experience: 1, education: '本科', skills: 'Axure,需求文档', status: 'NEW' as const, source: '校园招聘', rating: 2, appliedJobId: job2.id },
    { name: '蒋十七', email: 'jiang17@example.com', phone: '13800138015', position: '全栈工程师', experience: 6, education: '硕士', skills: 'React,Node.js,MongoDB', status: 'OFFER_REJECTED' as const, source: '猎头推荐', rating: 4, appliedJobId: job1.id },
  ]

  const candidates: any[] = []
  for (const data of candidateData) {
    const candidate = await prisma.candidate.create({ data })
    candidates.push(candidate)
    console.log(`创建候选人: ${candidate.name} (${candidate.status})`)

    if (data.status !== 'NEW') {
      await prisma.statusLog.create({
        data: {
          candidateId: candidate.id,
          fromStatus: 'NEW',
          toStatus: data.status,
          operatorId: hr.id,
          note: '初始化状态',
        },
      })
    } else {
      await prisma.statusLog.create({
        data: {
          candidateId: candidate.id,
          fromStatus: null,
          toStatus: 'NEW',
          operatorId: hr.id,
          note: '简历入库',
        },
      })
    }
  }

  const now = new Date()
  const interviews = [
    {
      candidateId: candidates[2].id,
      jobId: job2.id,
      round: 3,
      type: 'ONSITE' as const,
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      meetingRoom: '会议室A301',
      status: 'SCHEDULED' as const,
      interviewerIds: [interviewer.id, manager.id],
    },
    {
      candidateId: candidates[3].id,
      jobId: job2.id,
      round: 2,
      type: 'VIDEO' as const,
      scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      duration: 45,
      meetingLink: 'https://meeting.example.com/abc123',
      status: 'SCHEDULED' as const,
      interviewerIds: [manager.id],
    },
    {
      candidateId: candidates[4].id,
      jobId: job1.id,
      round: 1,
      type: 'PHONE' as const,
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      duration: 30,
      status: 'SCHEDULED' as const,
      interviewerIds: [interviewer.id],
    },
    {
      candidateId: candidates[0].id,
      jobId: job1.id,
      round: 2,
      type: 'ONSITE' as const,
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      duration: 60,
      meetingRoom: '会议室B201',
      status: 'COMPLETED' as const,
      interviewerIds: [interviewer.id, manager.id],
    },
    {
      candidateId: candidates[1].id,
      jobId: job1.id,
      round: 1,
      type: 'VIDEO' as const,
      scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      duration: 45,
      meetingLink: 'https://meeting.example.com/def456',
      status: 'COMPLETED' as const,
      interviewerIds: [interviewer.id],
    },
  ]

  for (const data of interviews) {
    const { interviewerIds, ...interviewData } = data
    const interview = await prisma.interview.create({
      data: {
        ...interviewData,
        interviewers: {
          connect: interviewerIds.map((id) => ({ id })),
        },
      },
    })
    console.log(`创建面试: ${interview.id} (round ${interview.round})`)

    if (interview.status === 'COMPLETED') {
      for (const interviewerId of interviewerIds) {
        const evaluation = await prisma.interviewEvaluation.create({
          data: {
            interviewId: interview.id,
            interviewerId,
            candidateId: interviewData.candidateId,
            technicalRating: Math.floor(Math.random() * 2) + 4,
            communicationRating: Math.floor(Math.random() * 2) + 4,
            problemSolvingRating: Math.floor(Math.random() * 2) + 4,
            teamworkRating: Math.floor(Math.random() * 2) + 4,
            cultureFitRating: Math.floor(Math.random() * 2) + 4,
            overallRating: Math.floor(Math.random() * 2) + 4,
            comments: '候选人表现优秀，技术扎实，沟通良好。',
            recommendation: 'HIRE',
          },
        })
        console.log(`  创建评价: ${evaluation.id}`)
      }
    }
  }

  console.log('\n种子数据创建完成！')
  console.log(`\n登录账号（密码均为 123456）：`)
  console.log(`  管理员: admin@example.com`)
  console.log(`  HR: hr@example.com`)
  console.log(`  面试官: interviewer@example.com`)
  console.log(`  用人经理: manager@example.com`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
