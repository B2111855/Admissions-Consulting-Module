// src/components/register.tsx

'use client';

import * as React from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from '@tabler/icons-react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { z } from 'zod';

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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

// Import schema từ file của bạn
import {
  consultingDataSchema,
  metadataSchema,
  ConsultingTableRow,
} from '@/lib/schema/consulting-data-schema';
import { exportDataToExcel } from '@/lib/export-to-excel';
import { ChevronDown, ChevronRight } from 'lucide-react';

// ---
// ## Schemas and Data Transformation

// This schema is used for the DataTable's internal structure.
// This is the shape the `transformConsultingData` function will output.
// Updated to include all fields from the consultingDataSchema for the table view.
export const tableSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().nullable(),
  phone_number: z.string(),
  zalo_phone: z.string().nullable(),
  link_facebook: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  current_education_level: z.string(),
  other_education_level_description: z.string().nullable(),
  high_school_name: z.string().nullable(),
  city: z.string(),
  source: z.string(),
  notification_consent: z.string(),
  current_status: z.string(),
  status_change_date: z.string().nullable(),
  registration_date: z.string().nullable(),
  student_created_at: z.string(),
  student_updated_at: z.string(),
  assigned_counselor_name: z.string(),
  assigned_counselor_type: z.string(),
  interested_courses_details: z.string().nullable(),
  enrolled_courses_details: z.string().nullable(),
  student_status_history: z.string().nullable(),
  last_consultation_date: z.string().nullable(),
  last_consultation_duration_minutes: z.number().nullable(),
  last_consultation_notes: z.string().nullable(),
  last_consultation_type: z.string().nullable(),
  last_consultation_status: z.string().nullable(),
  last_consultation_counselor_name: z.string().nullable(),
  gender: z.string().nullable(),
  other_source_description: z.string().nullable(),
  other_notification_consent_description: z.string().nullable(),
});

// Function to transform API data to the table schema.
// This bridges the gap between your API's raw data and the table's expected format.
// We can directly use the API data since the schemas are now aligned.
function transformConsultingData(
  apiData: ConsultingTableRow[]
): z.infer<typeof tableSchema>[] {
  if (!apiData) return [];
  // The schemas are identical, so we can return the data as is.
  // We'll just cast it to the correct type.
  return apiData as z.infer<typeof tableSchema>[];
}

// ---
// ## Helper Components and Columns

// Create a separate component for the drag handle
function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Updated columns to display all fields with Vietnamese headers
const columns: ColumnDef<z.infer<typeof tableSchema>>[] = [
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
    accessorKey: 'student_id',
    header: 'ID',
  },
  {
    accessorKey: 'student_name',
    header: 'Tên Học Viên',
    cell: ({ row }) => {
      // Use TableCellViewer for the student_name column
      return <TableCellViewer item={row.original} />;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone_number',
    header: 'Số Điện Thoại',
  },
  {
    accessorKey: 'current_status',
    header: 'Trạng Thái',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-muted-foreground px-1.5 flex items-center gap-1"
      >
        {row.original.current_status === 'Đã ghi danh' ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" />
        ) : (
          <IconLoader className="animate-spin size-4" />
        )}
        {row.original.current_status}
      </Badge>
    ),
  },
  // {
  //   accessorKey: 'zalo_phone',
  //   header: 'Zalo',
  // },
  {
    accessorKey: 'link_facebook',
    header: 'Link Facebook',
  },
  {
    accessorKey: 'date_of_birth',
    header: 'Ngày Sinh',
  },
  {
    accessorKey: 'current_education_level',
    header: 'Trình Độ Hiện Tại',
  },
  {
    accessorKey: 'high_school_name',
    header: 'Trường Cấp 3',
  },
  {
    accessorKey: 'city',
    header: 'Thành Phố',
  },
  {
    accessorKey: 'source',
    header: 'Nguồn',
  },

  // {
  //   accessorKey: 'registration_date',
  //   header: 'Ngày Đăng Ký',
  // },
  // {
  //   accessorKey: 'assigned_counselor_name',
  //   header: 'Tên Tư Vấn Viên',
  // },
  // {
  //   accessorKey: 'last_consultation_date',
  //   header: 'Ngày TV Gần Nhất',
  // },
  // {
  //   accessorKey: 'last_consultation_status',
  //   header: 'Trạng Thái TV Gần Nhất',
  // },
  // {
  //   accessorKey: 'last_consultation_notes',
  //   header: 'Ghi Chú TV',
  // },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Sửa</DropdownMenuItem>
          <DropdownMenuItem>Tạo bản sao</DropdownMenuItem>
          <DropdownMenuItem>Yêu thích</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof tableSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.student_id, // Use student_id as the unique ID for drag and drop
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

// ---
// ## DataTable Component
export const paymentStatusOptions = [
  { id: 'Pending', label: 'Chờ thanh toán' },
  { id: 'Paid', label: 'Đã thanh toán' },
  { id: 'Partially_Paid', label: 'Thanh toán một phần' },
  { id: 'Refunded', label: 'Đã hoàn tiền' },
];

function getPaymentStatusIdByLabel(label: string): string {
  return (
    paymentStatusOptions.find((option) => option.label === label)?.id || label
  );
}

function getPaymentStatusLabelById(id: string): string {
  return paymentStatusOptions.find((option) => option.id === id)?.label || id;
}

// Define the props interface for clarity and type safety.
export interface DataTableProps {
  data: ConsultingTableRow[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  meta: z.infer<typeof metadataSchema>;
  isFetching: boolean;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

// Use the defined interface for the component's props.
export function DataTable({
  data,
  pagination,
  meta,
  isFetching,
  onPaginationChange,
}: DataTableProps) {
  // Transform the data once when the `data` prop changes.
  const transformedData = React.useMemo(
    () => transformConsultingData(data),
    [data]
  );

  // Use a local state for the reorderable data.
  const [reorderableData, setReorderableData] = React.useState(transformedData);

  // Update the local state whenever the incoming data prop changes.
  React.useEffect(() => {
    setReorderableData(transformedData);
  }, [transformedData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => reorderableData?.map(({ student_id }) => student_id) || [],
    [reorderableData]
  );

  const table = useReactTable({
    data: reorderableData, // Use the local state data for the table
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    // Calculate pageCount from the new meta structure
    pageCount:
      meta.totalRecords > 0 ? Math.ceil(meta.totalRecords / meta.limit) : 1,
    manualPagination: true,
    getRowId: (row) => row.student_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPaginationState =
        typeof updater === 'function'
          ? updater(table.getState().pagination)
          : updater;
      onPaginationChange(
        newPaginationState.pageIndex,
        newPaginationState.pageSize
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // This function now updates the local state, not a prop.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setReorderableData((prevData) => {
        // Find the index of the dragged item using its ID.
        const oldIndex = prevData.findIndex(
          (item) => item.student_id === active.id
        );
        const newIndex = prevData.findIndex(
          (item) => item.student_id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) {
          return prevData; // Do nothing if IDs are not found
        }

        return arrayMove(prevData, oldIndex, newIndex);
      });
      // If you need to save the new order to the server,
      // you would call an API function here.
      // E.g., saveNewOrder(arrayMove(reorderableData, oldIndex, newIndex));
    }
  }
  // const handleExport = async () => {
  //   try {
  //     const res = await fetch('http://localhost:3000/api/exportword/word', {
  //       method: 'GET',
  //     });

  //     if (!res.ok) {
  //       toast.error('Lỗi khi lấy dữ liệu!');
  //       return;
  //     }

  //     const blob = await res.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'aa.pdf';
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //     toast.success('Đã tải file thành công!');
  //   } catch (err) {
  //     toast.error('Lỗi khi export!');
  //     console.error(err);
  //   }
  // };

  const handleExport = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('⚠️ Chưa có access token trong localStorage');
        return;
      }

      const res = await fetch(
        'http://localhost:3000/api/exportexcel/enrollmentsData',
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
      a.download = 'Danh_sach_sinh_vien_dang_ky.xlsx';
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

  // const [openIndexes, setOpenIndexes] = React.useState<number[]>([]);

  // const toggleOpen = (index: number) => {
  //   setOpenIndexes((prev) =>
  //     prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
  //   );
  // };
  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="[&>button>span>span]:data-[slot=badge]:bg-muted-foreground/30 hidden [&>button>span>span]:data-[slot=badge]:size-5 [&>button>span>span]:data-[slot=badge]:rounded-full [&>button>span>span]:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Tùy chỉnh cột</span>
                <span className="lg:hidden">Cột</span>
                <IconChevronDown />
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
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
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
        value="outline"
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
              <TableHeader className="bg-muted sticky top-0 z-10">
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
              <TableBody className="[&>tr>td:first-child]:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
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
        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Đã chọn {table.getFilteredSelectedRowModel().rows.length} trên{' '}
            {table.getFilteredRowModel().rows.length} hàng.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số hàng mỗi trang
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
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
              Trang {table.getState().pagination.pageIndex + 1} trên{' '}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || isFetching}
              >
                <span className="sr-only">Đi đến trang đầu</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isFetching}
              >
                <span className="sr-only">Đi đến trang trước</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isFetching}
              >
                <span className="sr-only">Đi đến trang sau</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || isFetching}
              >
                <span className="sr-only">Đi đến trang cuối</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

// ---
// ## Viewer and Chart Components
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--primary)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

// Updated TableCellViewer to show all fields in the drawer
function TableCellViewer({ item }: { item: z.infer<typeof tableSchema> }) {
  const isMobile = useIsMobile();

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };
  const [formValues, setFormValues] = React.useState<
    Record<number, Record<string, string>>
  >({});

  React.useEffect(() => {
    const initialValues: Record<number, Record<string, string>> = {};

    (item.enrolled_courses_details || '')
      .split(';')
      .filter(Boolean)
      .forEach((courseBlock, courseIndex) => {
        const [infoPart, consultingPartRaw] = courseBlock.split(')*');
        const consultingPart = consultingPartRaw?.trim();

        const [_, ...registerDetailsRaw] = infoPart
          .split('*')
          .map((p) => p.trim());

        const registerDetails = registerDetailsRaw
          .join('*')
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean);

        const consultingDetails = consultingPart
          ? consultingPart
              .split(',')
              .map((d) => d.trim())
              .filter(Boolean)
          : [];

        const courseValues: Record<string, string> = {};

        [...registerDetails, ...consultingDetails].forEach((detail) => {
          const [label, ...rest] = detail.split(':');
          const value = rest.join(':').trim();
          courseValues[label.trim()] = value;
        });

        initialValues[courseIndex] = courseValues;
      });

    setFormValues(initialValues);
  }, [item]);

  const handleInputChange = (
    courseIdx: number,
    label: string,
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [courseIdx]: {
        ...(prev[courseIdx] || {}),
        [label]: value,
      },
    }));
  };

  const [open, setOpen] = React.useState(false);

  const handleSubmit = async () => {
    const studentId = item.student_id;
    const updates: {
      courseTitle: string;
      paymentStatus: string;
      amountPaid: string;
    }[] = [];

    (item.enrolled_courses_details || '')
      .split(';')
      .filter(Boolean)
      .forEach((courseBlock, courseIndex) => {
        const [infoPart] = courseBlock.split(')*');
        const [courseTitle, ...registerDetailsRaw] = infoPart
          .split('*')
          .map((p) => p.trim());

        const registerDetails = registerDetailsRaw
          .join('*')
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean);

        const values = formValues[courseIndex] || {};

        const paymentStatusLabel = values['Trạng thái thanh toán']?.trim();
        const paymentStatusId = getPaymentStatusIdByLabel(paymentStatusLabel);

        const amountPaid = values['Phí đã trả']?.trim() || '';

        updates.push({
          courseTitle,
          paymentStatus: paymentStatusId || '', // nếu không có sẽ là ''
          amountPaid,
        });
      });

    try {
      const res = await fetch(
        'http://localhost:3000/api/updatedata/Studentenrollments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studentId, updates }),
        }
      );

      if (!res.ok) {
        throw new Error('Server error');
      }

      const result = await res.json();
      toast.success('Cập nhật thành công!');
    } catch (error) {
      toast.error('Lỗi khi gửi dữ liệu');
    }

    window.location.reload();
  };

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.student_name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.student_name}</DrawerTitle>
          <DrawerDescription>
            ID: {item.student_id} - Trạng thái: {item.current_status}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              {/* You can keep or remove the chart section as needed */}
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="student_name">Tên Học Viên</Label>
                <Input id="student_name" defaultValue={item.student_name} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={item.email || ''} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone_number">Số Điện Thoại</Label>
                <Input id="phone_number" defaultValue={item.phone_number} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="zalo_phone">Zalo</Label>
                <Input id="zalo_phone" defaultValue={item.zalo_phone || ''} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="link_facebook">Link Facebook</Label>
                <Input
                  id="link_facebook"
                  defaultValue={item.link_facebook || ''}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="date_of_birth">Ngày Sinh</Label>
                <Input
                  id="date_of_birth"
                  defaultValue={item.date_of_birth || ''}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="gender">Giới tính</Label>
                <Input id="gender" defaultValue={item.gender || ''} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_education_level">
                  Trình Độ Học Vấn
                </Label>
                <Input
                  id="current_education_level"
                  defaultValue={item.current_education_level}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="high_school_name">Tên Trường Cấp 3</Label>
                <Input
                  id="high_school_name"
                  defaultValue={item.high_school_name || ''}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="city">Thành Phố</Label>
                <Input id="city" defaultValue={item.city} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="source">Nguồn</Label>
                <Input id="source" defaultValue={item.source} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_status">Trạng Thái Hiện Tại</Label>
                <Input id="current_status" defaultValue={item.current_status} />
              </div>
              {/* <div className="flex flex-col gap-3">
                <Label htmlFor="assigned_counselor_name">Tên Tư Vấn Viên</Label>
                <Input
                  id="assigned_counselor_name"
                  defaultValue={item.assigned_counselor_name}
                />
              </div> */}
              {/* <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_date">Ngày TV Gần Nhất</Label>
                <Input
                  id="last_consultation_date"
                  defaultValue={item.last_consultation_date || ''}
                />
              </div> */}
              {/* <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_notes">Ghi Chú TV</Label>
                <Input
                  id="last_consultation_notes"
                  defaultValue={item.last_consultation_notes || ''}
                />
              </div> */}
              {/* <div className="flex flex-col gap-3">
                <Label htmlFor="interested_courses_details">
                  Khóa học quan tâm
                </Label>
                <Input
                  id="interested_courses_details"
                  defaultValue={item.interested_courses_details || ''}
                />
              </div> */}
            </div>
            {/* <div className="flex flex-col gap-3">
              <Label htmlFor="enrolled_courses_details">
                Khóa học đã đăng ký
              </Label>
              <Input
                id="enrolled_courses_details"
                defaultValue={item.enrolled_courses_details || ''}
              />
            </div> */}
            <div className="flex flex-col gap-5">
              <Label className="text-base font-medium">
                Khóa học đã đăng ký
              </Label>

              {(item.enrolled_courses_details || '')
                .split(';')
                .filter(Boolean)
                .map((courseBlock, courseIndex) => {
                  const [infoPart, consultingPartRaw] = courseBlock.split(')*');
                  const consultingPart = consultingPartRaw?.trim();

                  const [courseTitle, ...registerDetailsRaw] = infoPart
                    .split('*')
                    .map((p) => p.trim());

                  const registerDetails = registerDetailsRaw
                    .join('*')
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean);

                  const consultingDetails = consultingPart
                    ? consultingPart
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean)
                    : [];

                  const isOpen = openIndex === courseIndex;

                  return (
                    <div
                      key={courseIndex}
                      className="rounded border border-gray-300 bg-white shadow-sm"
                    >
                      {/* Tiêu đề + toggle */}
                      <button
                        type="button"
                        onClick={() => toggleOpen(courseIndex)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-t text-sm font-semibold"
                      >
                        <span>{courseTitle}</span>
                        {isOpen ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>

                      {isOpen && (
                        <div className="space-y-5 px-3 pb-3 pt-1">
                          {/* Thông tin đăng ký */}
                          <div className="flex flex-col gap-1">
                            <Label className="block text-sm font-medium text-center text-blue-700">
                              Thông tin đăng ký
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {registerDetails.map((detail, i) => {
                                const [label, ...rest] = detail.split(':');
                                const value = rest.join(':').trim();
                                const labelKey = label.trim();
                                const lowerLabel = labelKey.toLowerCase();

                                const formValue =
                                  formValues[courseIndex]?.[labelKey] ?? value;

                                return (
                                  <div key={i} className="flex flex-col gap-1">
                                    <Label
                                      htmlFor={`course_${courseIndex}_register_${i}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      {labelKey}
                                    </Label>

                                    {lowerLabel === 'trạng thái thanh toán' ? (
                                      <Select
                                        value={getPaymentStatusIdByLabel(
                                          formValue
                                        )} // Convert label -> id
                                        onValueChange={
                                          (id) =>
                                            handleInputChange(
                                              courseIndex,
                                              labelKey,
                                              getPaymentStatusLabelById(id)
                                            ) // Save label nếu muốn
                                        }
                                      >
                                        <SelectTrigger
                                          id={`course_${courseIndex}_register_${i}`}
                                          className="w-full text-sm"
                                        >
                                          <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>

                                        <SelectContent>
                                          {paymentStatusOptions.map(
                                            (option) => (
                                              <SelectItem
                                                key={option.id}
                                                value={option.id}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        id={`course_${courseIndex}_register_${i}`}
                                        value={formValue}
                                        onChange={(e) =>
                                          handleInputChange(
                                            courseIndex,
                                            labelKey,
                                            e.target.value
                                          )
                                        }
                                        className="text-sm"
                                        readOnly={lowerLabel !== 'phí đã trả'}
                                        title={`${labelKey}: ${formValue}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Thông tin tư vấn */}
                          {consultingDetails.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <Label className="block text-sm font-medium text-center text-green-700">
                                Thông tin tư vấn
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {consultingDetails.map((detail, i) => {
                                  const [label, ...rest] = detail.split(':');
                                  const value = rest.join(':').trim();
                                  const labelKey = label.trim();
                                  const formValue =
                                    formValues[courseIndex]?.[labelKey] ??
                                    value;

                                  return (
                                    <div
                                      key={i}
                                      className="flex flex-col gap-1"
                                    >
                                      <Label
                                        htmlFor={`course_${courseIndex}_consulting_${i}`}
                                        className="text-xs text-muted-foreground"
                                      >
                                        {labelKey}
                                      </Label>
                                      <Input
                                        id={`course_${courseIndex}_consulting_${i}`}
                                        value={formValue}
                                        onChange={(e) =>
                                          handleInputChange(
                                            courseIndex,
                                            labelKey,
                                            e.target.value
                                          )
                                        }
                                        className="text-sm"
                                        readOnly
                                        title={detail}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit}>Gửi</Button>
          <DrawerClose asChild>
            <Button variant="outline">Đóng</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
