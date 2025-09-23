
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { Button } from "./ui/button";

// Import Popover components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NavMain({ items }: { items: { title: string; url: string; icon: React.ElementType }[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Menu chính</span>
            </SidebarMenuButton>

            {/* Sử dụng Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  className="size-8 group-data-[collapsible=icon]:opacity-0"
                  variant="outline"
                >
                  <IconMail />
                  <span className="sr-only">Inbox</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 text-sm" side="right" align="center" sideOffset={8}>
                {/* Nội dung popup */}
                <p className="mb-2">Truy cập Cổng thông tin CUSC?</p>
                <Link
                  href="https://aptechcantho.cusc.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                >
                  Đi đến aptechcantho.cusc.vn
                </Link>
              </PopoverContent>
            </Popover>

          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item, index) => {
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  className={isActive ? "bg-blue-100 text-blue-700 font-semibold" : ""}
                >
                  <Link href={item.url}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
