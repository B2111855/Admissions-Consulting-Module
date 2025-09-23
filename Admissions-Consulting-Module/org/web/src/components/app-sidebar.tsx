'use client';

import * as React from 'react';
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconPasswordUser,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconFileArrowRight,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface User {
  name: string;
  email: string;
  avatar: string;
  user_type: string;
}

const data = {
  // user: {
  //   name: 'Tran Nguyen Ngoc Tram',
  //   email: 'm@example.com',
  //   avatar: '/avatars/shadcn.jpg',
  //   user_type: 'admin',
  // },
  navMain: [
    {
      title: 'Quản lý thông tin tư vấn',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Quản lý lịch sử tư vấn',
      url: '/history',
      icon: IconListDetails,
    },
    {
      title: 'Thống kê & báo cáo',
      url: '/statistical',
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: 'Thêm khóa học',
      url: '/course',
      icon: IconDatabase,
    },
    {
      name: 'Danh sách học viên đã đăng ký',
      url: '/register',
      icon: IconReport,
    },
    {
      name: 'Xuất file đăng ký',
      url: '/exportpdf',
      icon: IconFileArrowRight,
    },
    {
      name: 'Quản lý tài khoản đăng nhập',
      url: '/users',
      icon: IconPasswordUser,
    },
  ],
};

// let user: User | null = null;

export async function fetchUserOnce(): Promise<User | null> {
  // Nếu đã có trong localStorage thì trả về luôn
  // const cachedUser = localStorage.getItem('cachedUser');
  // if (cachedUser) {
  //   return JSON.parse(cachedUser) as User;
  // }

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error('⚠️ Chưa có access token trong localStorage');
    return null;
  }

  try {
    const res = await fetch('http://localhost:3000/api/data/UserInfoLogin', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    const userData = data?.data?.users;

    if (!userData) {
      console.error('❌ Không tìm thấy user trong response');
      return null;
    }

    const user: User = {
      name: userData.full_name,
      email: userData.email,
      user_type: userData.user_type,
      avatar: '/avatars/shadcn.jpg',
    };

    // ✅ Lưu lại vào localStorage để tái sử dụng
    if (!userData?.user_type) {
      console.error('❌ Không tìm thấy user_type trong userData');
      return null;
    }
    localStorage.setItem('cachedUserType', userData.user_type);
    // localStorage.setItem('cachedUser', JSON.stringify(user));

    return user;
  } catch (err) {
    console.error('❌ Failed to fetch user info', err);
    return null;
  }
}

// Gọi khi load trang (chỉ chạy 1 lần nếu chưa có user)
// window.addEventListener('DOMContentLoaded', fetchUserOnce);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserOnce();
      if (data) setUser(data);
    };

    if (!user) loadUser();
  }, [user]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">CUSC Management</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments
          items={
            user?.user_type !== 'counselor'
              ? data.documents
              : data.documents.filter(
                  (doc) => doc.name !== 'Quản lý tài khoản đăng nhập'
                )
          }
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
