'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { z } from 'zod';
import { IconPlus } from '@tabler/icons-react';

import {
  ColumnDef,
  ColumnFiltersState,
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
  Row,
  Table as TanstackTable,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';

// Imports for shadcn/ui components
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  PlusIcon,
  SearchIcon,
  GripVerticalIcon,
  ArrowUpDownIcon,
} from 'lucide-react';

import useDebounce from '@/hooks/debounce';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableProps {
  data: ConsultationHistoryItem[];
  metadata?: {
    totalRecords: number;
    firstPage: number;
    lastPage: number;
    page: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export const consultationHistorySchema = z.object({
  consultation_session_id: z.number().int(),
  session_date: z.string(),
  duration_minutes: z.number().int().nullable(),
  session_type: z.string(),
  session_status: z.string(),
  session_notes: z.string().nullable(),
  counselor_name: z.string(),
  counseler_email: z.string().email(),
  student_name: z.string(),
  student_email: z.string().email().nullable(),
  student_phone_number: z.string(),
});

export type ConsultationHistoryItem = z.infer<typeof consultationHistorySchema>;

// Đặt đối tượng ánh xạ tên cột sang tiếng Việt ở đây (phạm vi toàn cục)
const columnDisplayNames: Record<string, string> = {
  select: 'Chọn', // Cho cột checkbox
  drag: 'Kéo/Sắp xếp', // Cho cột kéo
  student_name: 'Tên Sinh Viên',
  counselor_name: 'Tư Vấn Viên',
  session_date: 'Ngày Tư Vấn',
  session_type: 'Loại Tư Vấn',
  session_status: 'Trạng Thái',
  session_notes: 'Ghi Chú',
  duration_minutes: 'Thời Lượng',
  // Thêm các cột khác nếu có và muốn tùy chỉnh tên hiển thị
};

// ===== COLUMN DEFINITIONS =====
const createSortableHeader =
  (title: string) =>
  ({ column }: { column: any }) =>
    (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        {title}
        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    );

export const createColumns = (): ColumnDef<ConsultationHistoryItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Chọn tất cả"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'drag',
    header: '',
    cell: () => (
      <div className="flex items-center justify-center">
        <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  {
    accessorKey: 'student_name',
    header: createSortableHeader('Tên Sinh Viên'),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('student_name')}</div>
    ),
    filterFn: 'includesString',
  },
  {
    accessorKey: 'counselor_name',
    header: createSortableHeader('Tư Vấn Viên'),
    cell: ({ row }) => <div>{row.getValue('counselor_name')}</div>,
  },
  {
    accessorKey: 'session_date',
    header: createSortableHeader('Ngày Tư Vấn'),
    cell: ({ row }) => {
      const date = row.getValue('session_date') as string;
      return <div>{new Date(date).toLocaleDateString('vi-VN')}</div>;
    },
  },
  {
    accessorKey: 'session_type',
    header: 'Loại Tư Vấn',
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('session_type')}</div>
    ),
  },
  {
    accessorKey: 'session_status',
    header: 'Trạng Thái',
    cell: ({ row }) => {
      const status = row.getValue('session_status') as string;
      const statusColors = {
        completed: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
      };
      const colorClass =
        statusColors[status.toLowerCase() as keyof typeof statusColors] ||
        'bg-gray-100 text-gray-800';

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'session_notes',
    header: 'Ghi Chú',
    cell: ({ row }) => {
      const notes = row.getValue('session_notes') as string | null;
      if (!notes) {
        return <div className="text-muted-foreground">Không có ghi chú</div>;
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 flex items-center justify-between gap-1 w-full text-left p-2"
            >
              <span className="truncate max-w-[150px]">
                {notes.length > 30 ? notes.substring(0, 27) + '...' : notes}
              </span>
              <ChevronDownIcon className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-4 text-sm break-words whitespace-normal">
            <h4 className="font-semibold mb-2">Chi tiết Ghi chú:</h4>
            <p>{notes}</p>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'duration_minutes',
    header: createSortableHeader('Thời Lượng'),
    cell: ({ row }) => {
      const duration = row.getValue('duration_minutes') as number | null;
      return <div>{duration ? `${duration} phút` : 'N/A'}</div>;
    },
  },
];

// ===== SHARED HOOKS =====
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

// Custom hook để quản lý table state
const useDataTableState = <TData,>(initialData: TData[]) => {
  const [data, setData] = React.useState<TData[]>(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  return {
    data,
    setData,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
  };
};

// Custom hook để quản lý drag & drop
const useDragAndDrop = <TData extends { consultation_session_id: number }>(
  data: TData[],
  setData: React.Dispatch<React.SetStateAction<TData[]>>
) => {
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      data?.map(({ consultation_session_id }) => consultation_session_id) || [],
    [data]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active && over && active.id !== over.id) {
        setData((data) => {
          const oldIndex = dataIds.indexOf(active.id);
          const newIndex = dataIds.indexOf(over.id);
          return arrayMove(data, oldIndex, newIndex);
        });
      }
    },
    [dataIds, setData]
  );

  return {
    sortableId,
    sensors,
    dataIds,
    handleDragEnd,
  };
};

// ===== REUSABLE COMPONENTS =====

// Search component với debounce
const SearchInput = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

// Generic table controls component
interface TableControlsProps<TData> {
  table: TanstackTable<TData>;
  onSearch: (term: string) => void;
  onAddNew?: () => void;
  addButtonText?: string;
}

const TableControls = <TData,>({
  table,
  onSearch,
  onAddNew,
  addButtonText = 'Thêm mới',
}: TableControlsProps<TData>) => (
  <div className="flex items-center justify-between px-4 lg:px-6">
    <Label htmlFor="view-selector" className="sr-only">
      View
    </Label>
    <Select defaultValue="overview">
      <SelectTrigger className="@4xl/main:hidden flex w-fit" id="view-selector">
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
      <SearchInput onSearch={onSearch} />
      <ColumnVisibilityDropdown table={table} />
      {/* {onAddNew && (
        <Button variant="outline" size="sm" onClick={onAddNew}>
          <PlusIcon />
          <span className="hidden lg:inline">{addButtonText}</span>
        </Button>
      )} */}
    </div>
  </div>
);

const handleExport = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('⚠️ Chưa có access token trong localStorage');
      return;
    }

    const res = await fetch(
      'http://localhost:3000/api/exportexcel/consultationsessionsData',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Danh_sach_lich_su_tu_van.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
};

// Column visibility dropdown component
const ColumnVisibilityDropdown = <TData,>({
  table,
}: {
  table: TanstackTable<TData>;
}) => (
  <div>
    {' '}
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
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(value)}
            >
              {columnDisplayNames[column.id] || column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <Button variant="outline" size="sm" onClick={handleExport}>
      <IconPlus />
      <span className="hidden lg:inline">Xuất ra Excel</span>
    </Button>
  </div>
);

// Reusable pagination component
const TablePagination = ({
  table,
  metadata,
  onPageChange,
  onItemsPerPageChange,
}: {
  table: TanstackTable<ConsultationHistoryItem>;
  metadata?: DataTableProps['metadata'];
  onPageChange?: DataTableProps['onPageChange'];
  onItemsPerPageChange?: DataTableProps['onItemsPerPageChange'];
}) => {
  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    table.setPageSize(newSize);
    onItemsPerPageChange?.(newSize);
  };

  const handlePageIndexChange = (newIndex: number) => {
    table.setPageIndex(newIndex);
    onPageChange?.(newIndex + 1); // +1 because TanStack Table uses 0-based index
  };

  return (
    <div className="flex items-center justify-between px-4">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} trong{' '}
        {metadata?.totalRecords || table.getFilteredRowModel().rows.length}{' '}
        hàng.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Số hàng mỗi trang
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
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
          Trang {table.getState().pagination.pageIndex + 1} của{' '}
          {metadata
            ? Math.ceil(metadata.totalRecords / metadata.limit)
            : table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageIndexChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Đi đến trang đầu tiên</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() =>
              handlePageIndexChange(table.getState().pagination.pageIndex - 1)
            }
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Đi đến trang trước</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() =>
              handlePageIndexChange(table.getState().pagination.pageIndex + 1)
            }
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Đi đến trang tiếp theo</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() =>
              handlePageIndexChange(
                metadata
                  ? Math.ceil(metadata.totalRecords / metadata.limit) - 1
                  : table.getPageCount() - 1
              )
            }
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Đi đến trang cuối cùng</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Generic form field component
const FormField = ({
  id,
  label,
  value,
  type = 'text',
  readOnly = false,
  className = '',
}: {
  id: string;
  label: string;
  value: string | number | null;
  type?: string;
  readOnly?: boolean;
  className?: string;
}) => (
  <div className={`flex flex-col gap-3 ${className}`}>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} defaultValue={value ?? ''} type={type} readOnly={readOnly} />
  </div>
);

// Generic detail viewer sheet
const DetailViewerSheet = <TData extends ConsultationHistoryItem>({
  item,
  title,
  description,
  trigger,
  fields,
}: {
  item: TData;
  title: string;
  description: string;
  trigger: React.ReactNode;
  fields: Array<{
    id: keyof TData;
    label: string;
    type?: string;
    section?: string;
    className?: string;
  }>;
}) => {
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || 'default';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof fields>);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-[1200px]">
        <SheetHeader className="gap-1">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <form className="flex flex-col gap-4 px-4">
            {Object.entries(groupedFields).map(([section, sectionFields]) => (
              <React.Fragment key={section}>
                {section !== 'default' && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="font-semibold text-lg">{section}</h3>
                  </>
                )}
                {sectionFields.map((field) => (
                  <FormField
                    key={String(field.id)}
                    id={String(field.id)}
                    label={field.label}
                    value={item[field.id] as string | number | null}
                    type={field.type}
                    readOnly
                    className={field.className}
                  />
                ))}
              </React.Fragment>
            ))}
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ===== MAIN COMPONENT =====
export function DataTable({
  data: initialData,
  metadata,
  onPageChange,
  onItemsPerPageChange,
}: DataTableProps) {
  const tableState = useDataTableState(initialData);
  const { sortableId, sensors, dataIds, handleDragEnd } = useDragAndDrop(
    tableState.data,
    tableState.setData
  );

  // Create columns instance
  const columns = React.useMemo(() => createColumns(), []);

  const table = useReactTable({
    data: tableState.data,
    columns,
    state: {
      sorting: tableState.sorting,
      columnVisibility: tableState.columnVisibility,
      rowSelection: tableState.rowSelection,
      columnFilters: tableState.columnFilters,
      pagination: tableState.pagination,
    },
    getRowId: (row) => row.consultation_session_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: tableState.setRowSelection,
    onSortingChange: tableState.setSorting,
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onPaginationChange: tableState.setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleSearch = useCallback(
    (searchTerm: string) => {
      table.getColumn('student_name')?.setFilterValue(searchTerm || undefined);
    },
    [table]
  );

  // Detail viewer fields configuration
  const detailFields = [
    {
      id: 'consultation_session_id' as keyof ConsultationHistoryItem,
      label: 'Mã Buổi Tư Vấn',
    },
    {
      id: 'session_date' as keyof ConsultationHistoryItem,
      label: 'Ngày Tư Vấn',
    },
    {
      id: 'duration_minutes' as keyof ConsultationHistoryItem,
      label: 'Thời Lượng (phút)',
      type: 'number',
      className: 'col-span-1',
    },
    {
      id: 'session_type' as keyof ConsultationHistoryItem,
      label: 'Loại Tư Vấn',
      className: 'col-span-1',
    },
    {
      id: 'session_status' as keyof ConsultationHistoryItem,
      label: 'Trạng Thái Buổi Tư Vấn',
    },
    {
      id: 'session_notes' as keyof ConsultationHistoryItem,
      label: 'Ghi Chú Buổi Tư Vấn',
    },
    {
      id: 'counselor_name' as keyof ConsultationHistoryItem,
      label: 'Tên Tư Vấn Viên',
      section: 'Thông tin Tư Vấn Viên',
    },
    {
      id: 'counseler_email' as keyof ConsultationHistoryItem,
      label: 'Email Tư Vấn Viên',
      section: 'Thông tin Tư Vấn Viên',
    },
    {
      id: 'student_name' as keyof ConsultationHistoryItem,
      label: 'Tên Sinh Viên',
      section: 'Thông tin Sinh Viên',
    },
    {
      id: 'student_email' as keyof ConsultationHistoryItem,
      label: 'Email Sinh Viên',
      section: 'Thông tin Sinh Viên',
      className: 'col-span-1',
    },
    {
      id: 'student_phone_number' as keyof ConsultationHistoryItem,
      label: 'Số Điện Thoại Sinh Viên',
      section: 'Thông tin Sinh Viên',
      className: 'col-span-1',
    },
  ];

  return (
    <Tabs
      defaultValue="overview"
      className="flex w-full flex-col justify-start gap-6"
    >
      <TableControls
        table={table}
        onSearch={handleSearch}
        // Đã bỏ onAddNew và addButtonText để xóa nút "Thêm Buổi Tư Vấn"
        // onAddNew={() => console.log('Add new consultation')}
        // addButtonText="Thêm Buổi Tư Vấn"
      />

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
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow
                        key={row.id}
                        row={row}
                        detailFields={detailFields}
                      />
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
        <TablePagination table={table} />
      </TabsContent>
    </Tabs>
  );
}

// Enhanced DraggableRow with integrated detail viewer
function DraggableRow({
  row,
  detailFields,
}: {
  row: Row<ConsultationHistoryItem>;
  detailFields: Array<{
    id: keyof ConsultationHistoryItem;
    label: string;
    type?: string;
    section?: string;
    className?: string;
  }>;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.consultation_session_id,
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
          {cell.column.id === 'student_name' ? (
            <DetailViewerSheet
              item={row.original}
              title="Chi Tiết Buổi Tư Vấn"
              description="Thông tin chi tiết về buổi tư vấn này."
              trigger={
                <Button
                  variant="link"
                  className="w-fit px-0 text-left text-foreground"
                >
                  {row.original.student_name}
                </Button>
              }
              fields={detailFields}
            />
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
