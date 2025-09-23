'use client';

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    user_type: string;
  };
}) {
  const { isMobile } = useSidebar();

  // Hàm chuyển đổi sang tiếng Việt
  function translateUserType(type?: string): string {
    switch (type) {
      case 'manager':
        return 'Quản lý';
      case 'counselor':
        return 'Tư vấn viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return 'Không rõ';
    }
  }

  // utils/auth.ts

  async function handleLogout() {
    const accessToken = localStorage.getItem('accessToken');

    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        // credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`, // 👈 cần dòng này
          'Content-Type': 'application/json',
        },
      });

      localStorage.removeItem('accessToken'); // Nếu bạn lưu token ở đây
      window.location.href = '/login';
    } catch (err) {
      console.error('Đăng xuất thất bại:', err);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              {/* <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>

                <span className="text-blue-500 text-xs font-semibold uppercase">
                  {user.user_type}
                </span>

                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div> */}
              <div className="flex items-center gap-3 px-2 py-2 max-w-full">
                <div className="flex flex-col justify-center leading-tight min-w-0 w-full">
                  <div className="flex items-center gap-2 w-full pr-8">
                    {/* Tên người dùng – được phép truncate */}
                    <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate max-w-[150px] flex-1">
                      {user.name}
                    </span>

                    {/* Badge user_type – luôn hiển thị đầy đủ, không cắt */}
                    <span className="text-[10px] font-semibold text-white bg-blue-500 px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm flex-shrink-0">
                      {translateUserType(user.user_type)}
                    </span>
                  </div>

                  {/* Email – cắt nếu dài */}
                  <span className="text-xs text-muted-foreground truncate max-w-full">
                    {user.email}
                  </span>
                </div>
              </div>

              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center leading-tight max-w-[240px] line-clamp-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white leading-snug break-words max-w-[240px] whitespace-normal ">
                    {user.name}
                  </span>

                  <span className="text-[10px] font-semibold text-white bg-blue-500 px-2 py-0.5 rounded-md uppercase tracking-wide self-start mt-0.5">
                    {translateUserType(user.user_type)}
                  </span>

                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>
              <IconLogout />
              <a href="/login">Log out</a>
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <IconLogout className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
