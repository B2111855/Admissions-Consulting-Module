'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { z } from 'zod';
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
import { IconPlus } from '@tabler/icons-react';

interface DataTableProps {
  data: UserItem[];
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

export const userSchema = z.object({
  id: z.number(),
  id_student: z.number(),
  full_name: z.string(),
  email: z.string().email(),
  name_course: z.string(),
  enrollment_date: z.string().optional(),
});

export type UserItem = z.infer<typeof userSchema>;

// Đặt đối tượng ánh xạ tên cột sang tiếng Việt ở đây (phạm vi toàn cục)
// Tên hiển thị cho từng cột trong bảng
export const columnDisplayNames: Record<string, string> = {
  select: 'Chọn', // Cột checkbox chọn hàng
  drag: 'Kéo/Sắp xếp',
  id_student: 'Id Học viên',
  full_name: 'Họ và tên',
  email: 'Email',
  name_course: 'Tên khóa học',
  enrollment_date: 'Ngày đăng ký',

  // Thêm các trường khác nếu có trong schema user
  // phone_number: 'Số điện thoại',
  // gender: 'Giới tính',
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

export const createUserColumns = (): ColumnDef<UserItem>[] => [
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
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        className="mr-3 ml-3" // 👈 thêm padding trái ở đây
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
        className="mr-3 ml-3" // 👈 thêm padding trái ở đây
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
    accessorKey: 'id_student',
    header: createSortableHeader('ID Học Viên'),
    cell: ({ row }) => (
      <div className="w-full text-center capitalize">
        {row.getValue('id_student')}
      </div>
    ),
  },
  {
    accessorKey: 'full_name',
    header: createSortableHeader('Họ và Tên'),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('full_name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'name_course',
    header: 'Tên khóa học',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name_course')}</div>
    ),
  },
  {
    accessorKey: 'enrollment_date',
    header: createSortableHeader('Ngày đăng ký'),
    cell: ({ row }) => <div>{row.getValue('enrollment_date')}</div>,
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
const useDragAndDrop = <TData extends { id: number }>(
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
    () => data?.map(({ id }) => id) || [],
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
    <>
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {/* <div className="flex items-center gap-2">
        <Label>Từ ngày</Label>
        <Input
          type="date"
          onChange={(e) =>
            table.getColumn('enrollment_date')?.setFilterValue((old: any) => ({
              ...old,
              from: e.target.value, // giữ dạng 'YYYY-MM-DD'
            }))
          }
        />
        <Label>Đến ngày</Label>
        <Input
          type="date"
          onChange={(e) =>
            table.getColumn('enrollment_date')?.setFilterValue((old: any) => ({
              ...old,
              to: e.target.value,
            }))
          }
        />
      </div> */}
    </>
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

const getDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy} ${mm} ${dd}_${hh}-${min}-${ss}`;
};

const handleExport = async () => {
  try {
    const selectedIdsString = localStorage.getItem('selectedStudentIds');
    const selectedIds = selectedIdsString ? JSON.parse(selectedIdsString) : [];

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      console.warn('⚠️ Không có dữ liệu được chọn. Không gửi yêu cầu.');
      return;
    }

    const res = await fetch('http://localhost:3000/api/exportword/word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }), // ✅ đúng cú pháp JSON
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Lỗi từ server: ${res.status} - ${errorText}`);
      return;
    }

    const contentDisposition = res.headers.get('Content-Disposition');
    let filename = getDate();

    if (contentDisposition && contentDisposition.includes('filename=')) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) {
        filename = decodeURIComponent(match[1]);
      }
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Lỗi khi tải file:', err);
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
      <span className="hidden lg:inline">Tạo file đăng ký</span>
    </Button>
  </div>
);

// Reusable pagination component
const TablePagination = <TData,>({
  table,
  metadata,
  onPageChange,
  onItemsPerPageChange,
}: {
  table: TanstackTable<TData>;
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
              {[1, 10, 20, 30, 40, 50].map((pageSize) => (
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
const userDetailFields: { id: keyof UserItem; label: string }[] = [
  { id: 'id', label: 'ID ' },
  { id: 'id_student', label: 'ID học viên ' },
  { id: 'full_name', label: 'Họ và Tên' },
  { id: 'email', label: 'Email' },
  { id: 'name_course', label: 'Tên khóa học' },
  { id: 'enrollment_date', label: 'Ngày đăng ký' },
];

const DetailViewerSheet = <TData extends Record<string, any>>({
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

  const [formData, setFormData] = React.useState({
    status: item.status || '',
  });

  const closeRef = React.useRef<HTMLButtonElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        'http://localhost:3000/api/updatedata/Statususer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, status: formData.status }),
        }
      );

      closeRef.current?.click(); // 👈 Đóng sheet
      window.location.reload();

      if (!res.ok) throw new Error('Cập nhật thất bại');
    } catch (err) {}
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-[1200px]">
        <SheetHeader className="gap-1">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {/* <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <form
            className="flex flex-col gap-4 px-4"
            onSubmit={handleSubmit}
            id="updateForm"
          >
            {Object.entries(groupedFields).map(([section, sectionFields]) => (
              <React.Fragment key={section}>
                {section !== 'default' && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="font-semibold text-lg">{section}</h3>
                  </>
                )}
                {sectionFields.map((field: any) =>
                  field.id === 'status' ? (
                    <div key="status" className="flex flex-col gap-1">
                      <label htmlFor="status" className="font-medium">
                        Trạng thái
                      </label>
                      <select
                        id="status"
                        className="border rounded px-3 py-2"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      ></select>
                    </div>
                  ) : (
                    <FormField
                      key={String(field.id)}
                      id={String(field.id)}
                      label={field.label}
                      value={item[field.id] as string | number | null}
                      type={field.type}
                      readOnly
                      className={field.className}
                    />
                  )
                )}
              </React.Fragment>
            ))}
          </form>
        </div> */}

        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button type="submit" className="w-full" form="updateForm">
            Cập nhật
          </Button>
          <SheetClose asChild>
            <Button ref={closeRef} variant="outline" className="w-full">
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
  const columns = React.useMemo(() => createUserColumns(), []);
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
    getRowId: (row) => row.id.toString(),
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

  React.useEffect(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id); // 👈 đảm bảo có field `id_student`

    localStorage.setItem('selectedStudentIds', JSON.stringify(selectedIds));
  }, [table.getState().rowSelection]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      table.getColumn('email')?.setFilterValue(searchTerm || undefined);
      // hoặc table.getColumn('full_name')?.setFilterValue(searchTerm || undefined);
    },
    [table]
  );

  // Detail viewer fields configuration
  const detailFields = userDetailFields;

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
                        detailFields={userDetailFields}
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
  row: Row<UserItem>;
  detailFields: Array<{
    id: keyof UserItem;
    label: string;
    type?: string;
    section?: string;
    className?: string;
  }>;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
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
