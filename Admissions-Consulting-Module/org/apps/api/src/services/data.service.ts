import {
  PrismaClient,
  studentstatushistory_old_status,
  studentstatushistory_new_status,
} from '@prisma/client';
import {
  consultationsessions_session_status,
  consultationsessions_session_type,
} from '@prisma/client';
import type { studentenrollments_payment_status } from '@prisma/client';
import { students_current_education_level } from '@prisma/client';
import { users_status } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllStudentsOnly = async () => {
  const students = await prisma.students.findMany({
    include: {
      student_interested_courses: {
        include: {
          courses: true, // lấy thông tin khóa học
        },
      },
    },
  });
  return students.map((s) => ({
    id: s.id,
    student_name: s.student_name,
    email: s.email,
    phone_number: s.phone_number,
    gender: s.gender,
    registration_date: s.registration_date,
    interested_courses_details: s.student_interested_courses
      .map((ic) => ic.courses?.name)
      .filter(Boolean) // loại bỏ null nếu có
      .join(', '), // ghép thành chuỗi
  }));
};

export const getCountIdStudent = async () => {
  const maxStudent = await prisma.students.findFirst({
    orderBy: {
      id: 'desc', // Sắp xếp theo ID giảm dần
    },
    select: {
      id: true, // Chỉ lấy trường id
    },
  });

  const maxId = maxStudent?.id ?? 0; // Nếu không có bản ghi nào thì gán là 0
  console.log('Max student ID:', maxId);

  return maxId;
};

export const getStudent = async (counselorId: number) => {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const isCounselor = userType?.user_type === 'counselor';

  const students = await prisma.students.findMany({
    where: isCounselor ? { assigned_counselor_id: counselorId } : {},
    include: {
      student_interested_courses: {
        include: {
          courses: true,
        },
      },
      studentstatushistory: {
        orderBy: { change_date: 'desc' },
        take: 1,
      },
      consultationsessions: {
        orderBy: { session_date: 'desc' },
        take: 1,
        include: {
          users: {
            select: {
              full_name: true,
            },
          },
        },
      },
      users: true,
    },
  });

  const result = students.map((student) => {
    const latestSession = student.consultationsessions[0]; // Lấy phiên gần nhất nếu có

    return {
      id: student.id,
      student_name: student.student_name,
      email: student.email,
      phone_number: student.phone_number,
      gender: student.gender,
      zalo_phone: student.zalo_phone,
      link_facebook: student.link_facebook,
      date_of_birth: student.date_of_birth,
      current_education_level: student.current_education_level,
      other_education_level_description:
        student.other_education_level_description,
      high_school_name: student.high_school_name,
      city: student.city,
      source: student.source,
      other_source_description: student.other_source_description,
      notification_consent: student.notification_consent,
      other_notification_consent_description:
        student.other_notification_consent_description,
      current_status: student.current_status,
      assigned_counselor_id: student.users?.full_name || '',
      status_change_date: student.status_change_date,
      registration_date: student.registration_date,
      created_at: student.created_at,
      updated_at: student.updated_at,
      student_interested_courses: student.student_interested_courses.map(
        (s) => s.courses.name
      ),
      latest_consultation_date: latestSession?.session_date ?? null,
      latest_consultation_duration: latestSession?.duration_minutes ?? null,
      latest_consultation_notes: latestSession?.notes ?? '',
      latest_consultation_type: latestSession?.session_type ?? '',
      latest_consultation_status: latestSession?.session_status ?? '',
      latest_consultation_counselor: latestSession?.users?.full_name ?? '',
    };
  });

  return result;
};

export const getAllUser = async () => {
  const users = await prisma.users.findMany({
    where: {
      user_type: 'counselor',
    },
  });
  return users;
};

export const getEnrollments = async (counselorId: number) => {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const isCounselor = userType?.user_type === 'counselor';

  const enrollments = await prisma.studentenrollments.findMany({
    where: isCounselor ? { counselor_id: counselorId } : {},
    include: {
      students: true,
      courses: true,
      users: true, // Thêm để lấy thông tin tư vấn viên
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    student_id: e.student_id,
    course_id: e.course_id,
    students: e.students.student_name,
    courses: e.courses.name,
    enrollment_date: e.enrollment_date,
    fee_paid: e.fee_paid.toNumber(),
    payment_status: e.payment_status,
    counselor_id: e.users?.full_name || '', // ← Chuyển từ ID sang tên
    consultation_session_id: e.consultation_session_id,
    notes: e.notes,
    created_at: e.created_at,
    updated_at: e.updated_at,
  }));
};

export const AddStudent = async (formData: any) => {
  const student = await prisma.students.create({
    data: formData,
  });

  return student;
};

export const IDisEmailExists = async (
  email: string
): Promise<number | null> => {
  const student = await prisma.students.findFirst({
    where: { email },
    select: { id: true },
  });

  return student?.id ?? null;
};

export const getDataCourse = async () => {
  const coursecategoriesRaw = await prisma.coursecategories.findMany({
    include: {
      courses: {
        orderBy: { id: 'asc' }, // optional: sắp xếp theo ID
      },
    },
  });
  return coursecategoriesRaw;
};

export const getInfoCourse = async (courseName: string) => {
  const course = await prisma.courses.findFirst({
    where: { name: courseName },
    select: {
      id: true,
      program_type: true,
    },
  });
  return course; // course có thể là null nếu không tìm thấy
};

export const addStudentInterestedCourse = async (data: {
  studentId: number;
  courseId: number;
  interestDate?: Date;
  notes?: string | null;
}) => {
  const { studentId, courseId, interestDate, notes = null } = data;

  try {
    const result = await prisma.student_interested_courses.create({
      data: {
        student_id: studentId,
        course_id: courseId,
        ...(interestDate && { interest_date: interestDate }),
        notes: notes, // nếu không truyền notes thì là null
      },
    });
    return result;
  } catch (error) {
    console.error('Error adding student interested course:', error);
    throw error;
  }
};

export const getUser = async (programType: string) => {
  if (programType === 'Short_term___Steam') {
    programType = 'SHORT-TERM + STEAM';
  }
  const result = await prisma.$queryRaw<
    Array<{ id: number; full_name: string; student_count: number }>
  >`
    SELECT u.id, u.full_name, COUNT(s.id) AS student_count
    FROM users u
    LEFT JOIN students s ON u.id = s.assigned_counselor_id
    WHERE u.program_type = ${programType}  AND u.user_type = 'counselor'
    GROUP BY u.id
    ORDER BY student_count ASC
    LIMIT 1
  `;

  const raw = result[0];
  if (!raw) return null;

  // ✅ Ép kiểu BigInt -> number
  return {
    id: Number(raw.id),
    full_name: raw.full_name,
    student_count: Number(raw.student_count),
  };
};

export const isStudentInterestedCourseExists = async (
  studentId: number,
  courseId: number
) => {
  const existing = await prisma.student_interested_courses.findUnique({
    where: {
      student_id_course_id: {
        student_id: studentId,
        course_id: courseId,
      },
    },
    select: { student_id: true }, // chỉ cần 1 field nhỏ nhất
  });

  return !!existing; // trả về true nếu tồn tại, false nếu không
};

export const getAllCourse = async (): Promise<string[]> => {
  const courses = await prisma.courses.findMany({
    where: {
      is_active: true,
    },
    select: {
      name: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return courses.map((course) => course.name);
};

export const getUserIdByName = async (
  fullName: string
): Promise<number | null> => {
  const user = await prisma.users.findFirst({
    where: {
      full_name: fullName,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
};

export const updateAssignedCounselor = async (
  studentId: number,
  AssignedCounselorId: number
) => {
  const updated = await prisma.students.update({
    where: {
      id: studentId,
    },
    data: {
      assigned_counselor_id: AssignedCounselorId,
    },
  });

  return updated;
};

export const createStudentEnrollment = async (formData: any) => {
  try {
    if (
      formData.student_id === undefined ||
      formData.course_id === undefined ||
      formData.counselor_id === undefined ||
      formData.consultation_session_id === undefined
    ) {
      return 'Thiếu trường bắt buộc';
    }

    const newEnrollment = await prisma.studentenrollments.create({
      data: {
        student_id: formData.student_id,
        course_id: formData.course_id,
        enrollment_date: new Date(),
        fee_paid: 0,
        payment_status: 'Pending',
        counselor_id: formData.counselor_id ?? null,
        consultation_session_id: formData.consultation_session_id ?? null,
        notes: formData.notes ?? null,
      },
    });
    return newEnrollment;
  } catch (error) {
    console.error('❌ Error creating enrollment:', error);
    throw error;
  }
};

export const getconsultationsessionsID = async (
  studentId: number,
  counselorId: number
) => {
  try {
    const latestSession = await prisma.consultationsessions.findFirst({
      where: {
        student_id: studentId,
        counselor_id: counselorId,
      },
      orderBy: {
        id: 'desc', // ID lớn nhất (mới nhất)
      },
    });

    return latestSession;
  } catch (error) {
    console.error(' Error fetching latest consultation session:', error);
    throw error;
  }
};

export const addStudentStatusHistory = async ({
  student_id,
  old_status,
  new_status,
  changed_by_user_id,
  notes,
}: {
  student_id: number;
  old_status?: string;
  new_status?: string;
  changed_by_user_id: number;
  notes?: string;
}) => {
  try {
    const history = await prisma.studentstatushistory.create({
      data: {
        student_id,
        old_status: old_status
          ? (old_status as studentstatushistory_old_status)
          : studentstatushistory_old_status.Lead,
        new_status: new_status
          ? (new_status as studentstatushistory_new_status)
          : studentstatushistory_new_status.Lead,
        changed_by_user_id,
        notes: notes ?? null,
        change_date: new Date(),
      },
    });

    return history;
  } catch (error) {
    console.error('❌ Lỗi khi thêm student status history:', error);
    throw error;
  }
};

interface AddConsultationSessionParams {
  studentId: number;
  counselorIdForNewSession: number;
  updateData: {
    last_consultation_date?: string;
    last_consultation_type?: string;
    last_consultation_status?: string;
    last_consultation_notes?: string;
    last_consultation_duration_minutes?: number;
  };
}
export const Addconsultationsessions = async ({
  studentId,
  counselorIdForNewSession,
  updateData,
}: AddConsultationSessionParams) => {
  try {
    const newSession = await prisma.consultationsessions.create({
      data: {
        student_id: studentId,
        counselor_id: counselorIdForNewSession,
        session_date: updateData.last_consultation_date
          ? new Date(updateData.last_consultation_date)
          : new Date(),
        session_type: (updateData.last_consultation_type ||
          'Phone_Call') as consultationsessions_session_type,
        session_status: (updateData.last_consultation_status ||
          'Scheduled') as consultationsessions_session_status,
        notes: updateData.last_consultation_notes || '',
        duration_minutes: updateData.last_consultation_duration_minutes
          ? parseInt(updateData.last_consultation_duration_minutes as any, 10)
          : null,
      },
    });
    return newSession;
  } catch (error) {
    console.error('❌ Failed to add consultation session:', error);
    throw error;
  }
};

export const updateStudentEnrollment = async (
  studentId: number,
  courseId: number,
  feePaid: number,
  paymentStatus: studentenrollments_payment_status
) => {
  try {
    const updated = await prisma.studentenrollments.updateMany({
      where: {
        student_id: studentId,
        course_id: courseId,
      },
      data: {
        fee_paid: feePaid,
        payment_status: paymentStatus,
        updated_at: new Date(),
      },
    });

    return updated;
  } catch (error) {
    console.error('❌ Failed to update student enrollment:', error);
    throw error;
  }
};

// export async function countConsultationSessionsByType({
//   counselorId,
//   educationLevel,
//   startDate,
//   endDate,
//   users,
// }: {
//   counselorId?: number;
//   educationLevel?: string;
//   startDate?: Date;
//   endDate?: Date;
//   users?: string;
// }) {
//   const userType = await prisma.users.findUnique({
//     where: {
//       id: counselorId,
//     },
//     select: {
//       user_type: true,
//     },
//   });

//   return prisma.consultationsessions.groupBy({
//     by: ['session_type'],
//     where: {
//       ...(counselorId &&
//         userType?.user_type === 'counselor' && { counselor_id: counselorId }),
//       ...(educationLevel && {
//         students: {
//           current_education_level:
//             educationLevel as students_current_education_level,
//         },
//       }),
//       ...(startDate && {
//         session_date: {
//           gte: startDate,
//         },
//       }),
//       ...(endDate && {
//         session_date: {
//           ...(startDate ? { gte: startDate } : {}), // tránh override
//           lte: endDate,
//         },
//       }),
//       ...(users &&
//         users !== '' && {
//           users: {
//             full_name: users,
//           },
//         }),
//     },
//     _count: {
//       session_type: true,
//     },
//   });
// }

// export async function countStudentsByStatus({
//   counselorId,
//   educationLevel,
//   startDate,
//   endDate,
//   users,
// }: {
//   counselorId?: number;
//   educationLevel?: string; // nhận string từ query
//   startDate?: Date;
//   endDate?: Date;
//   users?: string;
// }) {
//   const educationLevelEnum = Object.values(
//     students_current_education_level
//   ).includes(educationLevel as any)
//     ? (educationLevel as students_current_education_level)
//     : undefined;

//   const userType = await prisma.users.findUnique({
//     where: {
//       id: counselorId,
//     },
//     select: {
//       user_type: true,
//     },
//   });

//   return prisma.students.groupBy({
//     by: ['current_status'],
//     where: {
//       ...(counselorId && userType?.user_type === 'counselor'
//         ? { assigned_counselor_id: counselorId }
//         : {}),
//       ...(educationLevelEnum && {
//         current_education_level: educationLevelEnum,
//       }),
//       ...(startDate && endDate
//         ? {
//             created_at: {
//               gte: startDate,
//               lte: endDate,
//             },
//           }
//         : startDate
//         ? { created_at: { gte: startDate } }
//         : endDate
//         ? { created_at: { lte: endDate } }
//         : {}),
//       ...(users &&
//         users !== '' && {
//           assigned_counselor: {
//             full_name: users,
//           },
//         }),
//     },
//     _count: {
//       current_status: true,
//     },
//   });
// }

// export async function getAllConsultationSessions({
//   counselorId,
//   educationLevel,
//   startDate,
//   endDate,
//   users,
// }: {
//   counselorId?: number;
//   educationLevel?: string;
//   startDate?: Date;
//   endDate?: Date;
//   users?: string;
// }) {
//   const parsedEducationLevel = educationLevel as
//     | students_current_education_level
//     | undefined;

//   const userType = await prisma.users.findUnique({
//     where: {
//       id: counselorId,
//     },
//     select: {
//       user_type: true,
//     },
//   });

//   const sessions = await prisma.consultationsessions.findMany({
//     where: {
//       ...(counselorId &&
//         userType?.user_type === 'counselor' && { counselor_id: counselorId }),
//       ...(parsedEducationLevel && {
//         students: {
//           current_education_level: parsedEducationLevel,
//         },
//       }),
//       ...(startDate && {
//         session_date: {
//           gte: startDate,
//         },
//       }),
//       ...(endDate && {
//         session_date: {
//           ...(startDate ? { gte: startDate } : {}),
//           lte: endDate,
//         },
//       }),
//       ...(users && users !== '' && {
//         users: {
//           full_name: users,
//         },
//       }),
//     },
//     select: {
//       session_date: true,
//       duration_minutes: true,
//     },
//     orderBy: {
//       session_date: 'asc',
//     },
//   });

//   return sessions.map((s) => ({
//     session_date: s.session_date.toISOString().split('T')[0],
//     duration_minutes: s.duration_minutes ?? 0,
//   }));
// }

export async function countConsultationSessionsByType({
  counselorId,
  educationLevel,
  startDate,
  endDate,
  users,
}: {
  counselorId?: number;
  educationLevel?: string;
  startDate?: Date;
  endDate?: Date;
  users?: string;
}) {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const userIdFromName = users ? await getUserIdByName(users) : null;

  return prisma.consultationsessions.groupBy({
    by: ['session_type'],
    where: {
      ...(counselorId &&
        userType?.user_type === 'counselor' && { counselor_id: counselorId }),
      ...(educationLevel && {
        students: {
          current_education_level:
            educationLevel as students_current_education_level,
        },
      }),
      ...(startDate && {
        session_date: {
          gte: startDate,
        },
      }),
      ...(endDate && {
        session_date: {
          ...(startDate ? { gte: startDate } : {}),
          lte: endDate,
        },
      }),
      ...(userIdFromName && { counselor_id: userIdFromName }),
    },
    _count: {
      session_type: true,
    },
  });
}

export async function countStudentsByStatus({
  counselorId,
  educationLevel,
  startDate,
  endDate,
  users,
}: {
  counselorId?: number;
  educationLevel?: string;
  startDate?: Date;
  endDate?: Date;
  users?: string;
}) {
  const educationLevelEnum = Object.values(
    students_current_education_level
  ).includes(educationLevel as any)
    ? (educationLevel as students_current_education_level)
    : undefined;

  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const userIdFromName = users ? await getUserIdByName(users) : null;

  return prisma.students.groupBy({
    by: ['current_status'],
    where: {
      ...(counselorId && userType?.user_type === 'counselor'
        ? { assigned_counselor_id: counselorId }
        : {}),
      ...(educationLevelEnum && {
        current_education_level: educationLevelEnum,
      }),
      ...(startDate && endDate
        ? { created_at: { gte: startDate, lte: endDate } }
        : startDate
        ? { created_at: { gte: startDate } }
        : endDate
        ? { created_at: { lte: endDate } }
        : {}),
      ...(userIdFromName && {
        assigned_counselor_id: userIdFromName,
      }),
    },
    _count: {
      current_status: true,
    },
  });
}

export async function getAllConsultationSessions({
  counselorId,
  educationLevel,
  startDate,
  endDate,
  users,
}: {
  counselorId?: number;
  educationLevel?: string;
  startDate?: Date;
  endDate?: Date;
  users?: string;
}) {
  const parsedEducationLevel = educationLevel as
    | students_current_education_level
    | undefined;

  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const userIdFromName = users ? await getUserIdByName(users) : null;

  const sessions = await prisma.consultationsessions.findMany({
    where: {
      ...(counselorId &&
        userType?.user_type === 'counselor' && { counselor_id: counselorId }),
      ...(parsedEducationLevel && {
        students: {
          current_education_level: parsedEducationLevel,
        },
      }),
      ...(startDate && {
        session_date: {
          gte: startDate,
        },
      }),
      ...(endDate && {
        session_date: {
          ...(startDate ? { gte: startDate } : {}),
          lte: endDate,
        },
      }),
      ...(userIdFromName && {
        counselor_id: userIdFromName,
      }),
    },
    select: {
      session_date: true,
      duration_minutes: true,
    },
    orderBy: {
      session_date: 'asc',
    },
  });

  return sessions.map((s) => ({
    session_date: s.session_date.toISOString().split('T')[0],
    duration_minutes: s.duration_minutes ?? 0,
  }));
}

export async function GetCountEnrollments({
  counselorId,
  educationLevel,
  startDate,
  endDate,
  users,
}: {
  counselorId?: number;
  educationLevel?: string;
  startDate?: Date;
  endDate?: Date;
  users?: string;
}) {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const userIdFromName = users ? await getUserIdByName(users) : null;

  const stats = await prisma.studentenrollments.groupBy({
    by: ['course_id'],
    where: {
      ...(counselorId &&
        userType?.user_type === 'counselor' && {
          counselor_id: counselorId,
        }),
      ...(startDate && {
        created_at: {
          gte: startDate,
        },
      }),
      ...(endDate && {
        created_at: {
          ...(startDate ? { gte: startDate } : {}),
          lte: endDate,
        },
      }),
      ...(educationLevel && {
        students: {
          current_education_level:
            educationLevel as students_current_education_level,
        },
      }),
      ...(userIdFromName && { counselor_id: userIdFromName }),
    },
    _count: {
      course_id: true,
    },
  });

  // Gán tên môn học từ bảng courses
  const result = await Promise.all(
    stats.map(async (stat) => {
      const course = await prisma.courses.findUnique({
        where: {
          id: stat.course_id,
        },
        select: {
          name: true,
        },
      });

      return {
        subject: course?.name ?? 'Không rõ',
        count: stat._count.course_id,
      };
    })
  );

  return result;
}

export async function GetStudentRegistrationDistribution({
  counselorId,
  educationLevel,
  startDate,
  endDate,
  users,
}: {
  counselorId?: number;
  educationLevel?: string;
  startDate?: Date;
  endDate?: Date;
  users?: string;
}) {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const userIdFromName = users ? await getUserIdByName(users) : null;

  // Group by student_id để đếm số môn học mỗi học viên đã đăng ký
  const studentEnrollments = await prisma.studentenrollments.groupBy({
    by: ['student_id'],
    where: {
      ...(counselorId &&
        userType?.user_type === 'counselor' && {
          counselor_id: counselorId,
        }),
      ...(userIdFromName && {
        counselor_id: userIdFromName,
      }),
      ...(startDate && {
        created_at: {
          gte: startDate,
        },
      }),
      ...(endDate && {
        created_at: {
          ...(startDate ? { gte: startDate } : {}),
          lte: endDate,
        },
      }),
      ...(educationLevel && {
        students: {
          current_education_level:
            educationLevel as students_current_education_level,
        },
      }),
    },
    _count: {
      course_id: true,
    },
  });

  // Tính số lượng sinh viên theo số môn đã đăng ký
  let onlyRegister = 0;
  let ManyRegister = 0;

  for (const student of studentEnrollments) {
    const courseCount = student._count.course_id;
    if (courseCount === 1) onlyRegister++;
    else if (courseCount > 1) ManyRegister++;
  }

  return {
    onlyRegister,
    ManyRegister,
  };
}

export const getUserInfoById = async (
  id: number
): Promise<{ full_name: string; user_type: string; email: string } | null> => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      full_name: true,
      user_type: true,
      email: true,
    },
  });

  return user ?? null;
};

export const getUsersPage = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [rawUsers, total] = await Promise.all([
    prisma.users.findMany({
      skip,
      take: limit,
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        user_type: true,
        program_type: true,
        employment_date: true,
        status: true,
      },
    }),
    prisma.users.count(),
  ]);

  // Format employment_date to yyyy-mm-dd
  const users = rawUsers.map((user) => ({
    ...user,
    employment_date: user.employment_date
      ? user.employment_date.toISOString().split('T')[0]
      : null,
  }));

  return {
    data: users,
    metadata: {
      page,
      limit,
      total,
    },
  };
};

export const updateUserStatus = async (id: number, status: string) => {
  if (!id || !status) {
    throw new Error('Thiếu id hoặc status');
  }

  // Kiểm tra xem status có nằm trong enum không
  const isValidStatus = Object.values(users_status).includes(
    status as users_status
  );
  if (!isValidStatus) {
    throw new Error(`Trạng thái không hợp lệ: ${status}`);
  }

  // Ép kiểu sau khi đã xác minh hợp lệ
  const enumStatus = status as users_status;

  return await prisma.users.update({
    where: { id },
    data: { status: enumStatus },
  });
};

export const getConsultationSessions = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { user_type: true },
  });

  const isCounselor = user?.user_type === 'counselor';

  const sessions = await prisma.consultationsessions.findMany({
    where: isCounselor ? { counselor_id: userId } : {},
    include: {
      students: {
        select: {
          id: true,
          student_name: true,
          email: true,
          phone_number: true,
        },
      },
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      session_date: 'desc',
    },
  });

  return sessions.map((s) => ({
    sessionId: s.id,
    sessionDate: s.session_date?.toISOString() ?? '',
    duration: s.duration_minutes ?? 0,
    sessionType: s.session_type,
    sessionStatus: s.session_status,
    notes: s.notes ?? '',

    id_student: s.students?.id ?? '',
    studentName: s.students?.student_name ?? '',
    studentEmail: s.students?.email ?? '',
    studentPhone: s.students?.phone_number ?? '',

    id_counselor: s.users?.id ?? '',
    counselorName: s.users?.full_name ?? '',
    counselorEmail: s.users?.email ?? '',
  }));
};

export const getDataExport = async (
  counselorId: number,
  page: number,
  limit: number,
  filter?: { fromDate?: string; toDate?: string }
) => {
  const userType = await prisma.users.findUnique({
    where: { id: counselorId },
    select: { user_type: true },
  });

  const isCounselor = userType?.user_type === 'counselor';

  const skip = (page - 1) * limit;

  const dateFilter: any = {};
  if (filter?.fromDate) {
    dateFilter.gte = new Date(filter.fromDate);
  }
  if (filter?.toDate) {
    // Cộng thêm 1 ngày để lấy hết ngày toDate
    const toDate = new Date(filter.toDate);
    toDate.setDate(toDate.getDate() + 1);
    dateFilter.lt = toDate;
  }

  const whereClause: any = {
    ...(isCounselor ? { counselor_id: counselorId } : {}),
    ...(filter?.fromDate || filter?.toDate
      ? { enrollment_date: dateFilter }
      : {}),
  };

  const [rawEnrollments, total] = await Promise.all([
    prisma.studentenrollments.findMany({
      skip,
      take: limit,
      where: whereClause,
      select: {
        id: true,
        enrollment_date: true,
        students: {
          select: {
            id: true,
            student_name: true,
            email: true,
          },
        },
        courses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.studentenrollments.count({
      where: whereClause,
    }),
  ]);

  const formatted = rawEnrollments.map((item) => ({
    id: item.id,
    id_student: item.students.id,
    full_name: item.students.student_name,
    email: item.students.email,
    name_course: item.courses.name,
    enrollment_date: item.enrollment_date?.toISOString().split('T')[0] ?? null,
  }));

  return {
    data: formatted,
    metadata: {
      page,
      limit,
      total,
    },
  };
};

interface DataPDF {
  coursename: string;
  fullName: string;
  gender: string;
  dob: string;
  bir_place: string;
  phone: string;
  email: string;
  zalo: string;
  fb: string;
  educationLevel: string;
  address: string;
  day: string;
}

export const getDataPDF = async (
  counselorId: number[]
): Promise<DataPDF[] | null> => {
  const enrollments = await prisma.studentenrollments.findMany({
    where: { id: { in: counselorId } },
    select: {
      enrollment_date: true,
      students: {
        select: {
          student_name: true,
          date_of_birth: true,
          zalo_phone: true,
          link_facebook: true,
          email: true,
          phone_number: true,
          current_education_level: true,
          city: true,
          gender: true,
        },
      },
      courses: {
        select: {
          name: true,
        },
      },
    },
  });

  const result: DataPDF[] = enrollments.map((s) => ({
    coursename: s.courses.name,
    fullName: s.students.student_name,
    dob: s.students.date_of_birth
      ? s.students.date_of_birth.toISOString().split('T')[0]
      : '',
    bir_place: s.students.city ?? '',
    gender: s.students.gender,
    phone: s.students.phone_number,
    email: s.students.email ?? '',
    educationLevel: s.students.current_education_level,
    zalo: s.students.zalo_phone ?? '',
    fb: s.students.link_facebook ?? '',
    address: '',
    day: s.enrollment_date ? s.enrollment_date.toISOString().split('T')[0] : '',
  }));
  return result;
};

export const UpdateStatusStudent = async (student_id: number) => {
  const result = await prisma.students.update({
    where: { id: student_id },
    data: {
      current_status: 'Registered',
      status_change_date: new Date(), // nên có để track thời điểm đổi status
    },
  });

  return result;
};
