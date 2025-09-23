'use client';

import * as React from 'react';
import Search from './search';
import { useCallback } from 'react';
import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';

import { getCourses } from '../data/data_course';
import { getUsers } from '../data/data_user';
import { IconPlus } from '@tabler/icons-react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext, // Corrected import source
  arrayMove,
  useSortable, // Corrected import source
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'; // Changed from @dnd-kit/utilities
import { CSS } from '@dnd-kit/utilities'; // This is still correct for CSS utility
import { Check } from 'lucide-react';

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  CalendarIcon,
  XCircleIcon,
  MessageSquareIcon,
  ArchiveIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';
import { format } from 'date-fns'; // Dùng date-fns để format ngày tháng

import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import {
  consultingDataSchema,
  ConsultingTableRow,
  Metadata,
} from '@/lib/schema/consulting-data-schema';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DataTableProps {
  data: ConsultingTableRow[];
  metadata: Metadata;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onSearch: (searchTerm: string) => void;
  onUpdate: (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => Promise<void>;
  currentSearchTerm: string;
  isSearching: boolean;
  initialSearchTerm?: string;
  isUpdating?: boolean;
}

//Khai báo các mảng dữ liệu
const provinces = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cần Thơ',
  'Cao Bằng',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];
const columnNamesMap: {
  current_education_level: string;
  current_status: string;
  phone_number: string;
  email: string;
  last_consultation_date: string;
  source: string;
  assigned_counselor_name: string;

  [key: string]: string;
} = {
  current_education_level: 'Trình độ học vấn',
  current_status: 'Trạng thái',
  phone_number: 'Số điện thoại',
  email: 'Email',
  last_consultation_date: 'Ngày tư vấn gần nhất',
  source: 'Nguồn',
  assigned_counselor_name: 'Người tư vấn',
};

interface Counselor {
  id: string;
  full_name: string;
}

////////////////////////////////////////////////////////
type HandleSelectOptions = {
  multiple?: boolean;
  selected: string | string[];
  setSelected: (value: any) => void;
  setInputValue?: (value: string) => void;
  setShowDropdown?: (value: boolean) => void;
};

const handleSelect = (
  item: string,
  {
    multiple = false,
    selected,
    setSelected,
    setInputValue,
    setShowDropdown,
  }: HandleSelectOptions
) => {
  if (multiple) {
    if (Array.isArray(selected) && !selected.includes(item)) {
      setSelected([...selected, item]);
    }
    setInputValue?.('');
  } else {
    setSelected(item);
    setInputValue?.(item);
    setShowDropdown?.(false);
  }
};

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}
const getDaysDifference = (date1: any, date2: any) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isConsultationOverdue = (
  lastConsultationDate: any,
  daysThreshold = 3
) => {
  if (!lastConsultationDate) return false;

  const today = new Date();
  const consultationDate = new Date(lastConsultationDate);
  return getDaysDifference(today, consultationDate) >= daysThreshold;
};

const columns: ColumnDef<ConsultingTableRow>[] = [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.student_id} />,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'student_name',
    header: 'Tên Sinh Viên',
    cell: ({ row, table }) => {
      const onUpdate = (table.options.meta as any)?.onUpdate;
      return <TableCellViewer item={row.original} onUpdate={onUpdate} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'current_education_level',
    header: 'Trình Độ Học Vấn',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.current_education_level}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'current_status',
    header: ({ column }) => {
      const currentFilter = column.getFilterValue() as string | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Trạng Thái</span>
              <ChevronDownIcon className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[150px]">
            <DropdownMenuRadioGroup
              value={currentFilter}
              onValueChange={(value) => {
                column.setFilterValue(value === 'all' ? undefined : value);
              }}
            >
              <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Tiềm năng">
                Tiềm năng
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Đang tương tác">
                Đang tư vấn
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Đã đăng ký">
                Đã đăng ký
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Thôi học">
                Đã ngừng
              </DropdownMenuRadioItem>
              {/* <DropdownMenuRadioItem value="Lưu trữ">
                Đã lưu trữ
              </DropdownMenuRadioItem> */}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.current_status === 'Đã đăng ký' ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.current_status === 'Thôi học' ? (
          <XCircleIcon className="text-red-500 dark:text-red-400" />
        ) : row.original.current_status === 'Đang tương tác' ? (
          <MessageSquareIcon className="text-yellow-500 dark:text-yellow-400" />
        ) : row.original.current_status === 'Lưu trữ' ? (
          <ArchiveIcon className="text-gray-500 dark:text-gray-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.current_status}
      </Badge>
    ),
  },
  {
    accessorKey: 'phone_number',
    header: 'Số Điện Thoại',
    cell: ({ row }) => row.original.phone_number,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'last_consultation_date',
    header: 'Ngày tư vấn gần nhất',
    cell: ({ row }) => {
      // Hàm kiểm tra ngày tư vấn gần nhất
      const isConsultationOverdue = (
        lastConsultationDate: any,
        currentStatus: string
      ) => {
        if (
          !lastConsultationDate ||
          currentStatus === 'Thôi học' ||
          currentStatus === 'Đã đăng ký'
        )
          return false;

        const today = new Date();
        const consultationDate = new Date(lastConsultationDate);
        const diffTime = Math.abs(today.getTime() - consultationDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 2;
      };

      const isOverdue = isConsultationOverdue(
        row.original.last_consultation_date,
        row.original.current_status
      );

      // Hàm kiểm tra ngày tư vấn gần nhất
      // const isDroppeOut = row.original.current_status === 'Thôi học';

      // const isDroppeOut = row.original.current_status === 'Thôi học';
      // console.log(isOverdue);
      const formattedDate = row.original.last_consultation_date || 'Chưa có';
      const currentStatusnew = row.original.current_status;

      return (
        <span
          className={`${
            currentStatusnew === 'Thôi học'
              ? 'line-through text-gray-500 dark:text-gray-400'
              : isOverdue
              ? 'text-red-600 font-medium bg-red-50 px-2 py-1 rounded dark:text-red-400 dark:bg-red-950'
              : 'text-foreground'
          }
         `}
        >
          {formattedDate}
        </span>
      );
    },
  },
  {
    accessorKey: 'source',
    header: 'Nguồn',
    cell: ({ row }) => row.original.source,
  },
  {
    accessorKey: 'assigned_counselor_name',
    header: 'Người Tư Vấn',
    cell: ({ row }) => {
      const isAssigned =
        row.original.assigned_counselor_name !== '' &&
        row.original.assigned_counselor_name !== null;

      if (isAssigned) {
        return row.original.assigned_counselor_name;
      }

      return (
        <>
          {/* <Label
            htmlFor={`${row.original.student_id}-counselor`}
            className="sr-only"
          >
            Người Tư Vấn
          </Label> */}
          {/* <Select>
            <SelectTrigger
              className="h-8 w-40"
              id={`${row.original.student_id}-counselor`}
            >
              <SelectValue placeholder="Gán người tư vấn" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
              <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
            </SelectContent>
          </Select> */}
        </>
      );
    },
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Chỉnh Sửa</DropdownMenuItem>
          <DropdownMenuItem>Tạo Bản Sao</DropdownMenuItem>
          <DropdownMenuItem>Thêm vào Yêu Thích</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<ConsultingTableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.student_id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: serverData, // Đổi tên initialData thành serverData để rõ ràng hơn
  metadata, // Nhận metadata từ props
  onPageChange,
  onItemsPerPageChange,
  onUpdate,
  onSearch,
  currentSearchTerm,
  initialSearchTerm,
  isUpdating = false,
}: DataTableProps) {
  // Bỏ state `data` cục bộ nếu bạn không cần drag-and-drop cho dữ liệu phân trang
  // Nếu bạn VẪN cần drag-and-drop, bạn phải suy nghĩ lại logic hoặc chỉ cho phép drag-drop trên dữ liệu của trang hiện tại.
  // Hiện tại, để đơn giản hóa pagination, tôi sẽ giả định bạn không cần drag-drop cho server-side pagination.
  // Nếu vẫn cần Drag & Drop, bạn cần chỉnh sửa `setData` để nó thay đổi dữ liệu từ serverData (không phải local state).
  // Tuy nhiên, việc thực hiện kéo thả trên dữ liệu được phân trang từ server rất phức tạp.
  // Đối với trường hợp này, tôi sẽ tập trung vào việc sửa phân trang trước.
  const [data, setData] = React.useState(serverData); // Giữ lại nếu drag-drop là bắt buộc và bạn chỉ drag trên trang hiện tại

  // Sử dụng useEffect để cập nhật `data` khi `serverData` thay đổi (tức là khi API trả về trang mới)
  React.useEffect(() => {
    setData(serverData);
  }, [serverData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleStudentUpdate = async (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => {
    try {
      await onUpdate(studentId, updateData);
      toast.success('Cập nhật thông tin sinh viên thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật sinh viên:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Bỏ quản lý pagination state ở đây. React Table sẽ điều khiển nó thông qua props.
  // const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10, });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ student_id }) => student_id) || [],
    [data]
  );
  const [open, setOpen] = React.useState(false);

  const table = useReactTable({
    data: serverData,
    columns,
    meta: {
      onUpdate: onUpdate, // Truyền prop onUpdate vào meta
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      // Bỏ pagination state ở đây và chuyển sang external control
      pagination: {
        pageIndex: metadata.page - 1, // pageIndex là 0-based
        pageSize: metadata.limit,
      },
    },
    // Bỏ onPaginationChange
    // onPaginationChange: setPagination,

    // Cần cung cấp manual pagination flags
    manualPagination: true, // RẤT QUAN TRỌNG: Nói với React Table rằng pagination được quản lý thủ công (bởi server)
    pageCount: metadata.lastPage, // RẤT QUAN TRỌNG: Cung cấp tổng số trang từ metadata

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Bỏ getPaginationRowModel() - vì pagination là manual
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.student_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleSearch = useCallback(
    (searchTerm: string) => {
      // Logic tìm kiếm này vẫn là client-side. Nếu bạn muốn tìm kiếm server-side,
      // bạn sẽ cần truyền searchTerm lên page.tsx và sau đó vào useConsultingList.
      if (searchTerm) {
        table.getColumn('student_name')?.setFilterValue(searchTerm);
      } else {
        table.getColumn('student_name')?.setFilterValue(undefined);
      }
    },
    [table]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        // Lưu ý: Dragging sẽ chỉ hoạt động trên dữ liệu của trang hiện tại.
        // Việc reorder và gửi lên server phức tạp hơn nếu bạn muốn thay đổi thứ tự toàn bộ.
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const handleExport = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('⚠️ Chưa có access token trong localStorage');
        return;
      }

      const res = await fetch(
        'http://localhost:3000/api/exportexcel/studentData',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        toast.error('Lỗi khi lấy dữ liệu!');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Danh_sach_sinh_vien_tu_van.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải file thành công!');
    } catch (err) {
      toast.error('Lỗi khi export!');
      console.error(err);
    }
  };

  return (
    <Tabs
      defaultValue="overview"
      className="flex w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="overview">
          <SelectTrigger
            className="@4xl/main:hidden flex w-fit"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Tổng Quan</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Search onSearch={onSearch} initialSearchTerm={currentSearchTerm} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Tùy Chỉnh Cột</span>
                <span className="lg:hidden">Cột</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map((column) => {
                  // Lấy tên tiếng Việt từ columnNamesMap, nếu không có thì dùng column.id
                  const displayColumnName =
                    columnNamesMap[column.id] || column.id;

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize" // Bạn có thể bỏ className="capitalize" nếu muốn giữ nguyên chữ cái đầu của tên tiếng Việt
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {displayColumnName} {/* Sử dụng tên tiếng Việt ở đây */}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <IconPlus />
            <span className="hidden lg:inline">Xuất ra Excel</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="overview"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds} // dataIds bây giờ lấy từ id của Row objects
                    strategy={verticalListSortingStrategy}
                  >
                    {/* SỬA LỖI TẠI ĐÂY: Dùng table.getRowModel().rows để map */}
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Không có kết quả.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} trong{' '}
            {table.getFilteredRowModel().rows.length} hàng đã chọn.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số hàng mỗi trang
              </Label>
              <Select
                value={`${metadata.limit}`} // Sử dụng metadata.limit
                onValueChange={(value) => {
                  if (onItemsPerPageChange) {
                    // KIỂM TRA SỰ TỒN TẠI TRƯỚC KHI GỌI
                    onItemsPerPageChange(Number(value)); // Gọi hàm prop
                  }
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={metadata.limit} // Sử dụng metadata.limit
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Trang {metadata.page} của {metadata.lastPage}{' '}
              {/* Sử dụng metadata.page và metadata.lastPage */}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)} // Gọi hàm prop, trang 1
                disabled={metadata.page <= 1} // Vô hiệu hóa nếu đang ở trang đầu
              >
                <span className="sr-only">Đi đến trang đầu tiên</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(metadata.page - 1)} // Gọi hàm prop, trang trước
                disabled={metadata.page <= 1} // Vô hiệu hóa nếu đang ở trang đầu
              >
                <span className="sr-only">Đi đến trang trước</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(metadata.page + 1)} // Gọi hàm prop, trang tiếp theo
                disabled={metadata.page >= metadata.lastPage} // Vô hiệu hóa nếu đang ở trang cuối
              >
                <span className="sr-only">Đi đến trang tiếp theo</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(metadata.lastPage)} // Gọi hàm prop, trang cuối
                disabled={metadata.page >= metadata.lastPage} // Vô hiệu hóa nếu đang ở trang cuối
              >
                <span className="sr-only">Đi đến trang cuối cùng</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

const filterEmptyValues = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== null && value !== '' && value !== undefined) {
        filtered[key] = value;
      }
    }
  }
  return filtered;
};

function TableCellViewer({
  item,
  onUpdate,
}: {
  item: z.infer<typeof consultingDataSchema>;
  onUpdate?: (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => Promise<void>;
}) {
  const isMobile = useIsMobile();

  const [initialData, setInitialData] = React.useState(item);

  React.useEffect(() => {
    setInitialData(item);
    resetForm(item);
  }, [item]);

  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSources(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSource = (value: string) => {
    setSource((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const [Student_id, setStudent_id] = React.useState(item.student_id);

  const [studentName, setStudentName] = React.useState(item.student_name);
  const [email, setEmail] = React.useState(item.email ?? '');
  const [phoneNumber, setPhoneNumber] = React.useState(item.phone_number);
  const [zaloPhone, setZaloPhone] = React.useState(item.zalo_phone ?? '');
  const [linkFacebook, setLinkFacebook] = React.useState(
    item.link_facebook ?? ''
  );
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(
    item.date_of_birth ? new Date(item.date_of_birth) : undefined
  );
  const [currentEducationLevel, setCurrentEducationLevel] = React.useState(
    item.current_education_level
  );
  const [otherEducationLevelDescription, setOtherEducationLevelDescription] =
    React.useState(item.other_education_level_description ?? '');
  const [highSchoolName, setHighSchoolName] = React.useState(
    item.high_school_name ?? ''
  );
  const [city, setCity] = React.useState(item.city);
  const [other_source_description, setOther_source_description] =
    React.useState(item.other_source_description ?? '');
  const [
    other_notification_consent_description,
    setOther_notification_consent_description,
  ] = React.useState(item.other_notification_consent_description ?? '');
  // const [source, setSource] = React.useState(item.source);
  const [notificationConsent, setNotificationConsent] = React.useState(
    item.notification_consent
  );
  const [currentStatus, setCurrentStatus] = React.useState(item.current_status);
  const [statusChangeDate, setStatusChangeDate] = React.useState<
    Date | undefined
  >(item.status_change_date ? new Date(item.status_change_date) : undefined);
  const [registrationDate, setRegistrationDate] = React.useState<
    Date | undefined
  >(item.registration_date ? new Date(item.registration_date) : undefined);
  // student_created_at and student_updated_at are read-only, no need for useState if not modified by user
  const [assignedCounselorName, setAssignedCounselorName] = React.useState(
    item.assigned_counselor_id ?? ''
  );

  const [assignedCounselorType, setAssignedCounselorType] = React.useState(
    item.assigned_counselor_type
  );
  const [interestedCoursesDetails, setInterestedCoursesDetails] =
    React.useState(item.interested_courses_details ?? '');
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = React.useState(
    item.enrolled_courses_details ?? ''
  );
  const [studentStatusHistoryNotes, setStudentStatusHistoryNotes] =
    React.useState(item.student_status_history ?? ''); // Renamed to avoid confusion with the table name
  const [lastConsultationDate, setLastConsultationDate] = React.useState<
    Date | undefined
  >(
    item.last_consultation_date
      ? new Date(item.last_consultation_date)
      : undefined
  );
  const [lastConsultationDurationMinutes, setLastConsultationDurationMinutes] =
    React.useState<number | string>(
      item.last_consultation_duration_minutes ?? ''
    );
  const [lastConsultationNotes, setLastConsultationNotes] = React.useState(
    item.last_consultation_notes ?? ''
  );
  const [lastConsultationType, setLastConsultationType] = React.useState(
    item.last_consultation_type ?? ''
  );
  const [lastConsultationStatus, setLastConsultationStatus] = React.useState(
    item.last_consultation_status ?? ''
  );
  const [lastConsultationCounselorName, setLastConsultationCounselorName] =
    React.useState(item.last_consultation_counselor_name ?? '');

  // UI states for expandable fields
  const [showStatusHistory, setShowStatusHistory] = React.useState(false);
  const [showInterestedCourses, setShowInterestedCourses] =
    React.useState(false);
  const [showEnrolledCourses, setShowEnrolledCourses] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isError, setisError] = React.useState(false);

  const sheetCloseRef = React.useRef<HTMLButtonElement>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [source, setSource] = React.useState<string[]>([]);
  const [showSources, setShowSources] = React.useState(false); // mở mặc định
  const [otherNotificationConsent, setOtherNotificationConsent] =
    React.useState('');

  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setShowDropdown(true);
  };

  // const handleSelectProvince = (province: string) => {
  //   handleSelectGeneric(
  //     province,
  //     [selectedProvince], // selectedList
  //     (val) => setSelectedProvince(val[0]), // setSelectedList (chọn 1)
  //     false, // allowMultiple
  //     setCity, // set input
  //     setShowDropdown // ẩn dropdown
  //   );
  // };

  const filteredProvinces = provinces.filter((p) =>
    p.toLowerCase().includes(city.toLowerCase())
  );

  // Ẩn dropdown khi click ngoài
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };
  const resetForm = (data: z.infer<typeof consultingDataSchema>) => {
    setStudentName(data.student_name);
    setEmail(data.email ?? '');
    setPhoneNumber(data.phone_number);
    setZaloPhone(data.zalo_phone ?? '');
    setLinkFacebook(data.link_facebook ?? '');
    setDateOfBirth(
      data.date_of_birth ? new Date(data.date_of_birth) : undefined
    );
    setCurrentEducationLevel(data.current_education_level);
    setOtherEducationLevelDescription(
      data.other_education_level_description ?? ''
    );
    setHighSchoolName(data.high_school_name ?? '');
    setCity(data.city);
    setOther_source_description(data.other_source_description ?? '');
    setOther_notification_consent_description(
      data.other_notification_consent_description ?? ''
    );
    setSource(data.source.split(',').map((s) => s.trim()));
    setNotificationConsent(data.notification_consent);
    setCurrentStatus(data.current_status);
    setStatusChangeDate(
      data.status_change_date ? new Date(data.status_change_date) : undefined
    );
    setRegistrationDate(
      data.registration_date ? new Date(data.registration_date) : undefined
    );
    setAssignedCounselorName(data.assigned_counselor_name);
    setAssignedCounselorType(data.assigned_counselor_type);
    setInterestedCoursesDetails(data.interested_courses_details ?? '');
    setEnrolledCoursesDetails(data.enrolled_courses_details ?? '');
    setStudentStatusHistoryNotes(data.student_status_history ?? '');
    setLastConsultationDate(
      data.last_consultation_date
        ? new Date(data.last_consultation_date)
        : undefined
    );
    setLastConsultationDurationMinutes(
      data.last_consultation_duration_minutes ?? ''
    );
    setLastConsultationNotes(data.last_consultation_notes ?? '');
    setLastConsultationType(data.last_consultation_type ?? '');
    setLastConsultationStatus(data.last_consultation_status ?? '');
    setLastConsultationCounselorName(
      data.last_consultation_counselor_name ?? ''
    );
  };

  const handleCancel = () => {
    resetForm(initialData);
  };

  const HybridDatePickerField = React.memo(
    ({
      label,
      date,
      setDate,
      id,
      readOnly = false,
    }: {
      label: string;
      date: Date | undefined;
      setDate: (d: Date | undefined) => void;
      id: string;
      readOnly?: boolean;
    }) => {
      const formatDateForInput = useCallback((date: Date | undefined) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
      }, []);

      const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value) {
            try {
              const newDate = new Date(value);
              if (!date || newDate.getTime() !== date.getTime()) {
                setDate(newDate);
              }
            } catch (error) {
              console.error('Error parsing date:', error);
            }
          } else {
            setDate(undefined);
          }
        },
        [date, setDate]
      );

      const handleCalendarSelect = useCallback(
        (selectedDate: Date | undefined) => {
          if (
            (!date && selectedDate) ||
            (date && !selectedDate) ||
            (date && selectedDate && date.getTime() !== selectedDate.getTime())
          ) {
            setDate(selectedDate);
          }
        },
        [date, setDate]
      );

      return (
        <div className="flex flex-col gap-3">
          <Label htmlFor={id}>{label}</Label>
          <div className="flex gap-2">
            <Input
              id={id}
              type="date"
              value={formatDateForInput(date)}
              onChange={handleInputChange}
              readOnly={readOnly}
              className={cn(
                'flex-1',
                readOnly && 'bg-muted cursor-not-allowed'
              )}
            />
            {!readOnly && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleCalendarSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      );
    }
  );

  // Helper component for expandable text content
  const ExpandableTextField = React.memo(
    ({
      label,
      content,
      id,
      show,
      setShow,
      onContentChange,
      readOnly = false,
    }: {
      label: string;
      content: string | null | undefined;
      id: string;
      show: boolean;
      setShow: (b: boolean) => void;
      onContentChange?: (value: string) => void;
      readOnly?: boolean;
    }) => {
      const toggleShow = useCallback(() => setShow(!show), [show, setShow]);

      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={id}>{label}</Label>
            <Button variant="ghost" size="icon" onClick={toggleShow}>
              <ChevronDownIcon
                className={cn(
                  'size-4 transition-transform',
                  show ? 'rotate-180' : 'rotate-0'
                )}
              />
            </Button>
          </div>
          {show && (
            <div
              className="border rounded-md p-3 bg-muted/20 overflow-y-auto"
              style={{ maxHeight: '6.0rem', lineHeight: '1.5rem' }} // giới hạn 5 dòng
            >
              {onContentChange && !readOnly ? (
                <textarea
                  id={id}
                  className="w-full min-h-[6rem] p-2 bg-transparent text-sm text-muted-foreground resize-y focus:outline-none"
                  value={content ?? ''}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder={`Nhập ${label.toLowerCase()}...`}
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {content || (
                    <span className="italic">Không có thông tin.</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
  );

  const getBackendStatus = (status: string): string => {
    switch (status) {
      case 'Tiềm năng':
        return 'Lead';
      case 'Đang tương tác':
        return 'Engaging';
      case 'Đã đăng ký':
        return 'Registered';
      case 'Thôi học':
        return 'Dropped_Out';
      case 'Lưu trữ':
        return 'Archived';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  const getBackendConsultType = (status: string): string => {
    switch (status) {
      case 'Cuộc gọi điện thoại':
      case 'Phone_Call':
        return 'Phone_Call';
      case 'Họp trực tuyến':
      case 'Online_Meeting':
        return 'Online_Meeting';
      case 'Trực tiếp':
      case 'In_Person':
        return 'In_Person';
      case 'Email':
        return 'Email';
      case 'Trò chuyện':
      case 'Chat':
        return 'Chat';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };
  const getBackendConsultSession = (status: string): string => {
    switch (status) {
      case 'Đã lên lịch':
      case 'Scheduled':
        return 'Scheduled';
      case 'Hoàn thành':
      case 'Completed':
        return 'Completed';
      case 'Đã hủy':
      case 'Canceled':
        return 'Canceled';
      case 'Không tham dự':
      case 'No_Show':
        return 'No_Show';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  const getBackendNotifi = (status: string): string => {
    switch (status) {
      case 'Đồng ý':
      case 'Agree':
        return 'Agree';
      case 'Không đồng ý':
      case 'Disagree':
        return 'Disagree';
      case 'Khác':
      case 'Other':
        return 'Other';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) {
      console.error('Missing onUpdate function');
      toast.error('Không thể cập nhật: Thiếu hàm xử lý cập nhật');
      return;
    }

    if (!item.student_id) {
      console.error('Missing student ID');
      toast.error('Không thể cập nhật: Thiếu ID sinh viên');
      return;
    }

    // Chuyển đổi các giá trị frontend sang backend trước khi tạo updateData
    let backendCurrentEducationLevel,
      backendSource,
      backendNotificationConsent,
      backendCurrentStatus,
      backendLastConsultationType,
      backendLastConsultationStatus;

    try {
      backendCurrentEducationLevel = currentEducationLevel;
      backendSource = source.length > 0 ? source.join(', ') : undefined;
      backendNotificationConsent = notificationConsent
        ? getBackendNotifi(notificationConsent)
        : undefined;
      backendCurrentStatus = currentStatus
        ? getBackendStatus(currentStatus)
        : undefined;
      backendLastConsultationType = lastConsultationType
        ? getBackendConsultType(lastConsultationType)
        : undefined;
      backendLastConsultationStatus = lastConsultationStatus
        ? getBackendConsultSession(lastConsultationStatus)
        : undefined;
    } catch (error: any) {
      toast.error(error.message);
      return;
    }

    // Chuyển đổi các giá trị null thành undefined để phù hợp với kiểu Partial<ConsultingTableRow>
    const updateData: Partial<ConsultingTableRow> = {
      student_name: studentName,
      email: email || undefined,
      phone_number: phoneNumber,
      zalo_phone: zaloPhone || undefined,
      link_facebook: linkFacebook || undefined,
      date_of_birth: dateOfBirth
        ? format(dateOfBirth, 'yyyy-MM-dd')
        : undefined,
      current_education_level: backendCurrentEducationLevel,
      other_education_level_description:
        otherEducationLevelDescription || undefined,
      high_school_name: highSchoolName || undefined,
      city: city,
      source: backendSource,
      other_source_description: other_source_description,
      other_notification_consent_description:
        other_notification_consent_description,
      notification_consent: backendNotificationConsent,
      current_status: backendCurrentStatus,
      status_change_date: statusChangeDate
        ? format(statusChangeDate, 'yyyy-MM-dd')
        : undefined,
      registration_date: registrationDate
        ? format(registrationDate, 'yyyy-MM-dd')
        : undefined,
      assigned_counselor_name: assignedCounselorName || undefined,
      assigned_counselor_type: assignedCounselorType || undefined,
      interested_courses_details: interestedCoursesDetails || undefined,
      enrolled_courses_details: enrolledCoursesDetails || undefined,
      student_status_history: studentStatusHistoryNotes || undefined,
      last_consultation_date: lastConsultationDate
        ? format(lastConsultationDate, 'yyyy-MM-dd')
        : undefined,
      last_consultation_duration_minutes: lastConsultationDurationMinutes
        ? Number(lastConsultationDurationMinutes)
        : undefined,
      last_consultation_notes: lastConsultationNotes || undefined,
      last_consultation_type: backendLastConsultationType,
      last_consultation_status: backendLastConsultationStatus,
      last_consultation_counselor_name:
        lastConsultationCounselorName || undefined,
    };

    // Xử lý trường hợp thay đổi status
    if (currentStatus !== item.current_status) {
      updateData.status_change_date = new Date().toISOString();
    }

    const changedData: Partial<ConsultingTableRow> = {};

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        const typedKey = key as keyof ConsultingTableRow;
        const value = updateData[typedKey];

        if (value !== initialData[typedKey]) {
          (changedData as any)[typedKey] = value === null ? undefined : value;
        }
      }
    }

    // Kiểm tra nếu không có gì thay đổi
    if (Object.keys(changedData).length === 0) {
      toast.info('Không có thay đổi nào để cập nhật');
      return;
    }

    try {
      await onUpdate(item.student_id, changedData);
      // console.log(updateStudent);
      // }
      // const updateStudent = await onUpdate(item.student_id, changedData);
      // const hasChanged =
      //   (lastConsultationDate &&
      //     format(lastConsultationDate, 'yyyy-MM-dd') !==
      //       (item.last_consultation_date
      //         ? format(new Date(item.last_consultation_date), 'yyyy-MM-dd')
      //         : '')) ||
      //   Number(lastConsultationDurationMinutes || 0) !==
      //     (item.last_consultation_duration_minutes || 0) ||
      //   (lastConsultationNotes || '') !==
      //     (item.last_consultation_notes || '') ||
      //   lastConsultationType !== item.last_consultation_type ||
      //   lastConsultationStatus !== item.last_consultation_status;

      if (
        isEditing &&
        (lastConsultationStatus === '' ||
          lastConsultationType === '' ||
          lastConsultationDurationMinutes === '' ||
          Number(lastConsultationDurationMinutes) < 0)
      ) {
        setisError(true);
      } else if (isEditing) {
        // Dang ky khoa hoc api
        await fetch('http://localhost:3000/api/updatedata/RegisterCourse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: Student_id,
            selectedCoursesRegister: selectedCoursesRegister,
            last_consultation_counselor_name: countName,
            last_consultation_date: lastConsultationDate,
            last_consultation_type: getBackendConsultType(lastConsultationType),
            last_consultation_status: getBackendConsultSession(
              lastConsultationStatus
            ),
            last_consultation_notes: lastConsultationNotes,
            last_consultation_duration_minutes: lastConsultationDurationMinutes,
          }),
        });
      }

      // if (hasChanged) {
      // }

      // if (updateStudent) {

      // }

      if (selectedCourses && selectedCourses.length > 0) {
        // Dang ky khia hoc quan tam api
        await fetch('http://localhost:3000/api/updatedata/InteresCourse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // counselor_id: assignedCounselorId || null,
            student_id: Student_id,
            selectedCourses: selectedCourses,
            // bạn có thể thêm các trường khác nếu cần
          }),
        });
        if (!filteredInterestedCourses) {
          await fetch('http://localhost:3000/api/updatedata/StatusStudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: Student_id,
            }),
          });
        }
      }

      const hasChanged = assignedCounselorName !== countName;
      if (hasChanged) {
        // Doi nguoi phu trach
        await fetch('http://localhost:3000/api/updatedata/AssignCounselor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: Student_id,
            assignedCounselorName: assignedCounselorName,
            last_consultation_counselor_name: countName,
            current_status: getBackendStatus(item.current_status),
            // bạn có thể thêm các trường khác nếu cần
          }),
        });
      }

      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      // if (!isError) {
      // }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      setTimeout(() => setisError(false), 2000);

      setSelectedCourses([]); // <-- reset danh sách
      setShowInput(false); // <-- đóng input lại
      setShowInterestedCourses(false);
      setSelectedCoursesRegister([]); // <-- reset danh sách
      setShowInputRegister(false); // <-- đóng input lại
      setShowEnrolledCourses(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };
  // const handleAddCourse = () => {
  //   const trimmed = newCourse.trim();
  //   if (trimmed && !interestedCourses.includes(trimmed)) {
  //     setInterestedCourses([...interestedCourses, trimmed]);
  //     setNewCourse('');
  //     setShowInput(false);
  //   }
  // };

  ////////////////////////////////////////////////////////////////////////
  const [interestedCourses, setInterestedCourses] = React.useState<string[]>(
    []
  );
  const [newCourse, setNewCourse] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);

  const allCourses = getCourses(); // ✅ lấy ra dùng

  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [inputValueCourses, setInputValueCourses] = React.useState<string>('');

  // Xử lý bỏ chọn
  const handleRemove = (item: string) => {
    setSelectedCourses(selectedCourses.filter((i) => i !== item));
  };

  // Gợi ý đã được lọc
  const filtered = allCourses.filter(
    (item) =>
      item.toLowerCase().includes(inputValueCourses.toLowerCase()) &&
      !selectedCourses.includes(item) &&
      !interestedCoursesDetails.includes(item)
  );

  //////////////////////////////////////////////////////////////////////////
  const [interestedCoursesRegister, setInterestedCoursesRegister] =
    React.useState<string[]>([]);
  const [newCourseRegister, setNewCourseRegister] = React.useState('');
  const [showInputRegister, setShowInputRegister] = React.useState(false);
  const [selectedCoursesRegister, setSelectedCoursesRegister] = React.useState<
    string[]
  >([]);
  const [inputValueCoursesRegister, setInputValueCoursesRegister] =
    React.useState<string>('');

  const handleRemoveRegister = (item: string) => {
    setSelectedCoursesRegister(
      selectedCoursesRegister.filter((i) => i !== item)
    );
  };

  // Gợi ý đã được lọc
  const interestedCoursesArray =
    typeof interestedCoursesDetails === 'string'
      ? interestedCoursesDetails
          .split(';')
          .map((item) => {
            const beforeParen = item.split('(')[0].trim(); // Cắt phần trước dấu (
            const firstDashIndex = beforeParen.indexOf('-'); // Vị trí dấu - đầu tiên
            if (firstDashIndex !== -1) {
              return beforeParen.slice(firstDashIndex + 1).trim(); // Lấy phần sau dấu - đầu tiên
            }
            return null;
          })
          .filter((v): v is string => !!v)
      : [];

  const filteredRegister = interestedCoursesArray.filter(
    (item) =>
      item.toLowerCase().includes(inputValueCoursesRegister.toLowerCase()) &&
      !selectedCoursesRegister.includes(item) &&
      !enrolledCoursesDetails.includes(item)
  );

  const getFilteredInterestedCourses = (
    interested: string,
    enrolled: string
  ): string => {
    if (!interested) return '';

    const interestedArr = interested
      .split(';\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const enrolledArr = enrolled
      ? enrolled
          .split(';\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Lấy tên khóa học trước dấu "("
    const enrolledNames = enrolledArr.map((e) => e.split('(')[0].trim());

    // Lọc bỏ khóa học đã đăng ký
    const filteredInterested = interestedArr.filter((i) => {
      const courseName = i.split('(')[0].trim();
      return !enrolledNames.includes(courseName);
    });

    return filteredInterested.join(';\n');
  };

  // Lọc ra danh sách quan tâm thực sự (loại bỏ cái đã đăng ký)
  const filteredInterestedCourses = React.useMemo(() => {
    return getFilteredInterestedCourses(
      interestedCoursesDetails,
      enrolledCoursesDetails
    );
  }, [interestedCoursesDetails, enrolledCoursesDetails]);

  const consultationStatusOptions = [
    { id: 'Scheduled', label: 'Đã lên lịch' },
    { id: 'Completed', label: 'Hoàn thành' },
    { id: 'Canceled', label: 'Đã hủy' },
    { id: 'No_Show', label: 'Không tham dự' },
  ];
  const consultationTypeOptions = [
    { id: 'Phone_Call', label: 'Cuộc gọi điện thoại' },
    { id: 'Online_Meeting', label: 'Họp trực tuyến' },
    { id: 'In_Person', label: 'Trực tiếp' },
    { id: 'Email', label: 'Email' },
    { id: 'Chat', label: 'Trò chuyện' },
  ];

  //Xử lý Đổi quản trị viên
  const counselors = getUsers(); // Không cần useState nữa

  // const [assignedCounselorId, setAssignedCounselorId] = React.useState('');
  // const [isSubmitting, setIsSubmitting] = React.useState(false);

  // const selectedCounselor = Array.isArray(counselors)
  //   ? counselors.find((c) => String(c.id) === String(assignedCounselorId))
  //   : undefined;

  const [countName, setCountName] = React.useState('');

  React.useEffect(() => {
    if (item.assigned_counselor_name) {
      setCountName(item.assigned_counselor_name);
    }
  }, [item.assigned_counselor_name]);

  /////////////////////////////////////////
  React.useEffect(() => {
    if (selectedCoursesRegister && selectedCoursesRegister.length > 0) {
      setIsEditing(true);
    }
  }, [selectedCoursesRegister]);

  //Thao tác chỉnh sửa tư vấn
  const [isEditing, setIsEditing] = React.useState(false);
  React.useEffect(() => {
    if (isEditing) {
      setLastConsultationDurationMinutes('');
      setLastConsultationNotes('');
      setLastConsultationType('');
      setLastConsultationStatus('');
    } else {
      setLastConsultationDurationMinutes(
        item.last_consultation_duration_minutes ?? ''
      );
      setLastConsultationNotes(item.last_consultation_notes ?? '');
      setLastConsultationType(item.last_consultation_type ?? '');
      setLastConsultationStatus(item.last_consultation_status ?? '');
    }
  }, [isEditing]);

  // Các trường dữ liệu: lastConsultationDate, lastConsultationType, ...
  // Sẽ được giữ nguyên như bạn đang có.

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
            onClick={() => setIsSheetOpen(true)}
          >
            {item.student_name}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          // Đảm bảo SheetContent có chiều rộng phù hợp và có thể cuộn
          className="flex flex-col w-[1200px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-y-auto" // THÊM overflow-y-auto VÀO ĐÂY
        >
          <SheetHeader className="gap-1">
            <SheetTitle>{item.student_name}</SheetTitle>
            <SheetDescription>
              Thông tin chi tiết về sinh viên này.
            </SheetDescription>
          </SheetHeader>

          {/* Đổi div này để nó không tự cuộn nữa, vì SheetContent đã cuộn */}
          <div className="flex flex-col gap-4 py-4 text-sm">
            {' '}
            {/* BỎ overflow-y-auto Ở ĐÂY */}
            {!isMobile && (
              <>
                <Separator />
                <div className="grid gap-2 px-4">
                  <div className="flex gap-2 font-medium leading-none">
                    Trạng thái hiện tại: {currentStatus}{' '}
                    {currentStatus === 'Đã đăng ký' ? (
                      <CheckCircle2Icon className="size-4 text-green-500 dark:text-green-400" />
                    ) : currentStatus === 'Thôi học' ? (
                      <XCircleIcon className="size-4 text-red-500 dark:text-red-400" />
                    ) : currentStatus === 'Đang tương tác' ? (
                      <MessageSquareIcon className="size-4 text-yellow-500 dark:text-yellow-400" />
                    ) : currentStatus === 'Lưu trữ' ? (
                      <ArchiveIcon className="size-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <LoaderIcon className="size-4" />
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Đây là một đoạn văn bản mô tả chung về sinh viên và trạng
                    thái của họ.
                  </div>
                </div>
                <Separator />
              </>
            )}
            {/* Form của bạn */}
            <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
              {/* Mã Sinh Viên - READ ONLY */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="student_id">Mã Sinh Viên</Label>
                <Input
                  id="student_id"
                  value={Student_id}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="student_name">Tên Sinh Viên</Label>
                <Input
                  id="student_name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="phone_number">Số Điện Thoại</Label>
                  <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="zalo_phone">Số Zalo</Label>
                  <Input
                    id="zalo_phone"
                    value={zaloPhone}
                    onChange={(e) => setZaloPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="link_facebook">Link Facebook</Label>
                  <Input
                    id="link_facebook"
                    value={linkFacebook}
                    onChange={(e) => setLinkFacebook(e.target.value)}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <HybridDatePickerField
                label="Ngày Sinh"
                id="date_of_birth"
                date={dateOfBirth}
                setDate={setDateOfBirth}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="current_education_level">
                    Trình Độ Học Vấn
                  </Label>
                  <Select
                    value={currentEducationLevel || ''}
                    onValueChange={setCurrentEducationLevel}
                  >
                    <SelectTrigger
                      id="current_education_level"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THPT">THPT</SelectItem>
                      <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentEducationLevel === 'Khác' && (
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="other_education_level_description">
                      Mô Tả Trình Độ Học Vấn Khác
                    </Label>
                    <Input
                      id="other_education_level_description"
                      value={otherEducationLevelDescription}
                      onChange={(e) =>
                        setOtherEducationLevelDescription(e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="high_school_name">Tên Trường Cấp 3</Label>
                <Input
                  id="high_school_name"
                  value={highSchoolName}
                  onChange={(e) => setHighSchoolName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-3 relative" ref={dropdownRef}>
                  <Label htmlFor="city">Thành Phố</Label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    autoComplete="off"
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 p-2 border rounded border-gray-300"
                    onFocus={() => setShowDropdown(true)}
                  />

                  {showDropdown && city != '' && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md mt-1 max-h-40 overflow-y-auto text-sm z-50">
                      {filteredProvinces.map((province, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSelect(province, {
                              multiple: false,
                              selected: selectedProvince,
                              setSelected: setSelectedProvince,
                              setInputValue: setCity,
                              setShowDropdown: setShowDropdown,
                            })
                          }
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                          {province}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  ref={containerRef}
                  className="flex flex-col gap-3 relative"
                >
                  <Label>Nguồn</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSources((prev) => !prev)}
                    className="w-full flex justify-between items-center text-left rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  >
                    <span className="truncate flex-1 font-normal">
                      {source.length > 0 ? source.join(', ') : 'Chọn nguồn'}
                    </span>
                    <ChevronDownIcon
                      className={`ml-2 h-4 w-4 shrink-0 transition-transform ${
                        showSources ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>

                  {showSources && (
                    <div className="absolute z-50 top-full mt-2 left-0 w-full rounded-md border bg-white p-3 shadow-lg dark:bg-zinc-900">
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {[
                          'Mail',
                          'Fanpage',
                          'Zalo',
                          'Website',
                          'Friend',
                          'SMS',
                          'Banderole',
                          'Poster',
                          'Brochure',
                          'Google',
                          'Brand',
                          'Event',
                        ].map((value) => (
                          <label
                            key={value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              id={value}
                              checked={source.includes(value)}
                              onCheckedChange={() => toggleSource(value)}
                            />
                            <span className="text-sm">{value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="other_source_description">Nguồn Khác</Label>
                  <Input
                    id="other_source_description"
                    value={other_source_description}
                    onChange={(e) =>
                      setOther_source_description(e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="notification_consent">
                    Đồng Ý Nhận Thông Báo
                  </Label>

                  <Select
                    value={notificationConsent}
                    onValueChange={(value) => {
                      setNotificationConsent(value);
                      if (value !== 'Khác') setOtherNotificationConsent(''); // Reset nếu không chọn "Khác"
                    }}
                  >
                    <SelectTrigger id="notification_consent" className="w-full">
                      <SelectValue placeholder="Đồng ý/Không đồng ý" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đồng ý">Đồng ý</SelectItem>
                      <SelectItem value="Không đồng ý">Không đồng ý</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {notificationConsent === 'Khác' && (
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="other_notification_consent_description">
                      Mô Tả Nhận Thông Báo Khác
                    </Label>
                    <Input
                      id="other_notification_consent_description"
                      value={other_notification_consent_description}
                      onChange={(e) =>
                        setOther_notification_consent_description(
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* TRẠNG THÁI HIỆN TẠI - CÓ THỂ CHỈNH SỬA */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="current_status">Trạng Thái Hiện Tại</Label>
                  <Select
                    value={currentStatus}
                    onValueChange={setCurrentStatus}
                  >
                    <SelectTrigger id="current_status" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* ĐỊNH NGHĨA CÁC GIÁ TRỊ TRẠNG THÁI */}
                      <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                      <SelectItem value="Đang tương tác">
                        Đang tương tác
                      </SelectItem>
                      <SelectItem value="Đã đăng ký">Đã đăng ký</SelectItem>
                      <SelectItem value="Thôi học">Đã ngừng</SelectItem>
                      {/* Thêm các trạng thái khác nếu cần */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ngày Thay Đổi Trạng Thái - READ ONLY */}
                <HybridDatePickerField
                  label="Ngày Thay Đổi Trạng Thái"
                  id="status_change_date"
                  date={statusChangeDate}
                  setDate={setStatusChangeDate}
                  readOnly={true} // Vẫn giữ là Readonly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Registration Date */}
                <HybridDatePickerField
                  label="Ngày Đăng Ký"
                  id="registration_date"
                  date={registrationDate}
                  setDate={setRegistrationDate}
                />

                {/* Student Created At */}
                <HybridDatePickerField
                  label="Ngày Tạo Sinh Viên"
                  id="student_created_at"
                  date={
                    item.student_created_at
                      ? new Date(item.student_created_at)
                      : undefined
                  }
                  setDate={() => {}} // Readonly
                  readOnly={true}
                />
              </div>

              {/* Student Updated At */}
              <HybridDatePickerField
                label="Ngày Cập Nhật Sinh Viên"
                id="student_updated_at"
                date={
                  item.student_updated_at
                    ? new Date(item.student_updated_at)
                    : undefined
                }
                setDate={() => {}} // Readonly
                readOnly={true}
              />
              <hr className="border-1 border-gray-400 my-6 mx-10" />

              <div className="grid grid-cols-2 gap-4">
                {/* Tên Người Tư Vấn Được Gán - READ ONLY */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="assigned_counselor_name">Người Tư Vấn</Label>
                  <Select
                    value={assignedCounselorName}
                    onValueChange={setAssignedCounselorName}
                  >
                    <SelectTrigger
                      id="assigned_counselor_name"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn tư vấn viên" />
                    </SelectTrigger>

                    <SelectContent>
                      {counselors.map((counselor) => (
                        <SelectItem
                          key={counselor.id}
                          value={counselor.full_name} // hoặc counselor.id.toString() nếu bạn dùng id
                        >
                          {counselor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loại Người Tư Vấn Được Gán - READ ONLY */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="assigned_counselor_type">
                    Loại Người Tư Vấn Được Gán
                  </Label>
                  <Input
                    id="assigned_counselor_type"
                    value={assignedCounselorType}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Chi Tiết Khóa Học Quan Tâm - READ ONLY */}
              <div className="space-y-3">
                {/* Field expandable hiển thị danh sách khóa học */}
                <ExpandableTextField
                  label="Chi Tiết Khóa Học Quan Tâm"
                  id="interested_courses_details"
                  content={filteredInterestedCourses}
                  show={showInterestedCourses}
                  setShow={setShowInterestedCourses}
                  readOnly={true}
                />

                {/* Nút hiển thị input thêm khóa học */}
                {showInterestedCourses && !showInput && (
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="text-blue-600 underline text-sm"
                  >
                    + Thêm khóa học quan tâm
                  </button>
                )}

                {/* Input + nút xác nhận thêm khóa học */}
                {showInterestedCourses && showInput && (
                  <div className="w-full p-4 rounded border border-sky-200 shadow-sm bg-sky-50 space-y-3">
                    {/* Input + nút Đóng nằm cùng hàng */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhập tên khóa học..."
                        value={inputValueCourses}
                        onChange={(e) => setInputValueCourses(e.target.value)}
                        className="flex-1 px-3 py-2 border border-sky-400 rounded focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white shadow-sm"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setShowInput(false);
                          setInputValueCourses('');
                        }}
                        title="Đóng"
                        className="p-2 rounded-full text-red-500 hover:text-white hover:bg-red-500 transition duration-200"
                      >
                        <span className="text-lg leading-none">✕</span>
                      </button>
                    </div>

                    {/* Dropdown gợi ý */}
                    {inputValueCourses && filtered.length > 0 && (
                      <div className="relative">
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-gray-300 rounded shadow bg-white text-sm max-h-40 overflow-y-auto">
                          {filtered.map((item) => (
                            <div
                              key={item}
                              onMouseDown={() =>
                                handleSelect(item, {
                                  multiple: true,
                                  selected: selectedCourses,
                                  setSelected: setSelectedCourses,
                                  setInputValue: setInputValueCourses,
                                })
                              }
                              className="px-3 py-2 hover:bg-blue-100 cursor-pointer transition"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Danh sách đã chọn */}
                    <div className="flex flex-wrap gap-2">
                      {selectedCourses.map((item) => (
                        <div
                          key={item}
                          className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() => handleRemove(item)}
                            className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                            title="Xoá"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Chi Tiết Khóa Học Đã Đăng Ký - READ ONLY */}
                <ExpandableTextField
                  label="Chi Tiết Khóa Học Đã Đăng Ký"
                  id="enrolled_courses_details"
                  content={enrolledCoursesDetails}
                  show={showEnrolledCourses}
                  setShow={setShowEnrolledCourses}
                  readOnly={true}
                />

                {/* Nút hiển thị input thêm khóa học */}
                {showEnrolledCourses && !showInputRegister && (
                  <button
                    type="button"
                    onClick={() => setShowInputRegister(true)}
                    className="text-blue-600 underline text-sm"
                  >
                    + Thêm khóa học đăng ký
                  </button>
                )}

                {/* Input + nút xác nhận thêm khóa học */}
                {showEnrolledCourses && showInputRegister && (
                  <div className="w-full p-4 rounded border border-sky-200 shadow-sm bg-sky-50 space-y-3">
                    {/* Input + nút Đóng nằm cùng hàng */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhập tên khóa học..."
                        value={inputValueCoursesRegister}
                        onChange={(e) =>
                          setInputValueCoursesRegister(e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-sky-400 rounded focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm bg-white shadow-sm"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setShowInputRegister(false);
                          setInputValueCoursesRegister('');
                        }}
                        title="Đóng"
                        className="p-2 rounded-full text-red-500 hover:text-white hover:bg-red-500 transition duration-200"
                      >
                        <span className="text-lg leading-none">✕</span>
                      </button>
                    </div>

                    {/* Dropdown gợi ý */}
                    {inputValueCoursesRegister &&
                      filteredRegister.length > 0 && (
                        <div className="relative">
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-gray-300 rounded shadow bg-white text-sm max-h-40 overflow-y-auto">
                            {filteredRegister.map((item) => (
                              <div
                                key={item}
                                onMouseDown={() =>
                                  handleSelect(item, {
                                    multiple: true,
                                    selected: selectedCoursesRegister,
                                    setSelected: setSelectedCoursesRegister,
                                    setInputValue: setInputValueCoursesRegister,
                                  })
                                }
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer transition"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Danh sách đã chọn */}
                    <div className="flex flex-wrap gap-2">
                      {selectedCoursesRegister.map((item) => (
                        <div
                          key={item}
                          className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() => handleRemoveRegister(item)}
                            className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                            title="Xoá"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lịch sử trạng thái sinh viên - EDITABLE */}
              <ExpandableTextField
                label="Ghi chú Lịch Sử Trạng Thái Sinh Viên"
                id="student_status_history"
                content={studentStatusHistoryNotes}
                show={showStatusHistory}
                setShow={setShowStatusHistory}
                onContentChange={setStudentStatusHistoryNotes}
              />

              <hr className="border-1 border-gray-400 mt-3 mb-4 mx-10" />
              <div className="flex justify-end mr-10 ">
                <span
                  className={`inline-block px-4 py-1.5 rounded-lg text-sm font-semibold shadow-md cursor-pointer transition-all duration-200 ${
                    isEditing
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${
                    selectedCoursesRegister &&
                    selectedCoursesRegister.length > 0
                      ? 'opacity-50 cursor-not-allowed pointer-events-none'
                      : 'cursor-pointer'
                  }`}
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? 'ON' : 'OFF'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <HybridDatePickerField
                  label="Ngày Tư Vấn Cuối Cùng"
                  id="last_consultation_date"
                  date={lastConsultationDate}
                  readOnly={!isEditing}
                  setDate={setLastConsultationDate}
                />
                <div className="flex flex-col gap-3">
                  <Label htmlFor="last_consultation_duration_minutes">
                    Thời Lượng Tư Vấn Cuối Cùng (phút)
                  </Label>
                  <Input
                    id="last_consultation_duration_minutes"
                    value={lastConsultationDurationMinutes}
                    onChange={(e) =>
                      setLastConsultationDurationMinutes(e.target.value)
                    }
                    type="number"
                    readOnly={!isEditing}
                    className={`transition-all duration-200 ${
                      isEditing
                        ? 'bg-white cursor-text'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
              {/* Last Consultation Date */}

              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_notes">
                  Ghi Chú Tư Vấn Cuối Cùng
                </Label>
                <Input
                  id="last_consultation_notes"
                  value={lastConsultationNotes}
                  disabled={!isEditing}
                  onChange={(e) => setLastConsultationNotes(e.target.value)}
                  className={` ${
                    isEditing
                      ? 'bg-white cursor-text'
                      : 'bg-gray-200 text-black cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="last_consultation_type">
                    Loại Tư Vấn Cuối Cùng
                  </Label>
                  <Select
                    value={lastConsultationType}
                    onValueChange={setLastConsultationType}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      id="last_consultation_type"
                      className={`w-full ${
                        isEditing
                          ? 'bg-white cursor-text'
                          : 'bg-gray-200 text-black cursor-not-allowed'
                      }`}
                    >
                      <SelectValue placeholder="Chọn loại tư vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultationTypeOptions.map((lasttype) => (
                        <SelectItem
                          key={lasttype.id}
                          value={lasttype.label} // hoặc counselor.id.toString() nếu bạn dùng id
                        >
                          {lasttype.label}
                        </SelectItem>
                      ))}
                      {/* <SelectItem value="Phone_Call">
                        Cuộc gọi điện thoại
                      </SelectItem>
                      <SelectItem value="Online_Meeting">
                        Họp trực tuyến
                      </SelectItem>
                      <SelectItem value="In_Person">Trực tiếp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Chat">Trò chuyện</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="last_consultation_status">
                    Trạng Thái Tư Vấn Cuối Cùng
                  </Label>
                  <Select
                    value={lastConsultationStatus}
                    onValueChange={setLastConsultationStatus}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      id="last_consultation_status"
                      className={`w-full ${
                        isEditing
                          ? 'bg-white cursor-text'
                          : 'bg-gray-200 text-black cursor-not-allowed'
                      }`}
                    >
                      <SelectValue placeholder="Chọn trạng thái tư vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultationStatusOptions.map((laststatus) => (
                        <SelectItem
                          key={laststatus.id}
                          value={laststatus.label} // hoặc counselor.id.toString() nếu bạn dùng id
                        >
                          {laststatus.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_counselor_name">
                  Tên Người Tư Vấn Cuối Cùng
                </Label>
                <Input
                  id="last_consultation_counselor_name"
                  value={lastConsultationCounselorName}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                <Button type="submit" className="w-full">
                  Lưu Thay Đổi
                </Button>
                <SheetClose asChild ref={sheetCloseRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      {isSuccess && (
        <Alert className="fixed top-4 right-4 w-[350px]">
          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
          <AlertTitle>Thành công!</AlertTitle>
          <AlertDescription>
            Thay đổi của bạn đã được lưu thành công.
          </AlertDescription>
        </Alert>
      )}
      {isError && (
        <Alert variant="destructive" className="fixed top-4 right-4 w-[350px]">
          <AlertTitle className="text-red-600">
            Thay đổi chưa được lưu
          </AlertTitle>
          <AlertDescription className="text-sm ">
            Có lỗi xảy ra trong quá trình lưu.
            <br />
            Vui lòng kiểm tra lại dữ liệu và thử lại.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
