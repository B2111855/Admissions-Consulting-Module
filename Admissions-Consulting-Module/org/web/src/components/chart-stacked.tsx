// // src/components/chart-stacked.tsx
// 'use client';

// import { TrendingUp } from 'lucide-react';
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from '@/components/ui/chart';
// import { ConsultationAnalyticsResult } from '@/services/report.service';

// // Define the chart configuration based on your service interface
// const chartConfig = {
//   phoneCall: {
//     label: 'Gọi điện',
//     color: 'hsl(var(--chart-A-1))',
//   },
//   onlineMeeting: {
//     label: 'Họp online',
//     color: 'hsl(var(--chart-A-2))',
//   },
//   inPerson: {
//     label: 'Trực tiếp',
//     color: 'hsl(var(--chart-A-3))',
//   },
//   email: {
//     label: 'Email',
//     color: 'hsl(var(--chart-A-4))',
//   },
//   chat: {
//     label: 'Chat',
//     color: 'hsl(var(--chart-A-5))',
//   },
// } satisfies ChartConfig;

// interface ComponentProps {
//   data: ConsultationAnalyticsResult | null | undefined;
//   isLoading: boolean;
//   error: Error | null;
// }

// export function Component({ data, isLoading, error }: ComponentProps) {
//   // Loading state
//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
//           <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
//         </CardHeader>
//         <CardContent>
//           <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
//         </CardContent>
//         <CardFooter>
//           <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
//         </CardFooter>
//       </Card>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Phân tích kênh tư vấn</CardTitle>
//           <CardDescription>Lỗi tải dữ liệu</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center h-64 border border-red-200 rounded-lg bg-red-50 text-center">
//             <div>
//               <div className="text-red-600 mb-2">⚠️ Lỗi tải dữ liệu</div>
//               <div className="text-sm text-red-500">
//                 {error.message || 'Không thể tải dữ liệu biểu đồ'}
//               </div>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
//               >
//                 Thử lại
//               </button>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <div className="flex w-full items-start gap-2 text-sm">
//             <div className="grid gap-2">
//               <div className="flex items-center gap-2 font-medium leading-none">
//                 Không có dữ liệu trending.
//               </div>
//               <div className="flex items-center gap-2 leading-none text-muted-foreground">
//                 Dữ liệu không khả dụng.
//               </div>
//             </div>
//           </div>
//         </CardFooter>
//       </Card>
//     );
//   }

//   // Empty state
//   if (!data || !data.chartData || data.chartData.chartData.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Phân tích kênh tư vấn</CardTitle>
//           <CardDescription>
//             Hiển thị số liệu tư vấn theo các kênh
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
//             Không có dữ liệu để hiển thị.
//           </div>
//         </CardContent>
//         <CardFooter>
//           <div className="flex w-full items-start gap-2 text-sm">
//             <div className="grid gap-2">
//               <div className="flex items-center gap-2 font-medium leading-none">
//                 Không có dữ liệu trending.
//               </div>
//               <div className="flex items-center gap-2 leading-none text-muted-foreground">
//                 {data?.summary?.period || 'Không có dữ liệu'}
//               </div>
//             </div>
//           </div>
//         </CardFooter>
//       </Card>
//     );
//   }

//   // Main render with data
//   const chartData = data.chartData.chartData;
//   const summary = data.summary;

//   // Calculate trending
//   let trendingPercentage = 0;
//   let trendingDirectionIcon = <TrendingUp className="h-4 w-4" />;
//   let trendingColor = 'text-green-500';

//   if (chartData.length >= 2) {
//     const lastMonthTotal = Object.values(chartData[chartData.length - 1]).reduce(
//       (sum, value) => (typeof value === 'number' ? sum + value : sum),
//       0
//     );
//     const prevMonthTotal = Object.values(chartData[chartData.length - 2]).reduce(
//       (sum, value) => (typeof value === 'number' ? sum + value : sum),
//       0
//     );

//     if (prevMonthTotal > 0) {
//       trendingPercentage = ((lastMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
//     } else if (lastMonthTotal > 0) {
//       trendingPercentage = 100;
//     }

//     if (trendingPercentage < 0) {
//       trendingDirectionIcon = <TrendingUp className="h-4 w-4 transform rotate-180 text-red-500" />;
//       trendingColor = 'text-red-500';
//     }
//   }

//   const trendingText = `${trendingPercentage >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(
//     trendingPercentage
//   ).toFixed(1)}% tháng này`;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Phân tích kênh tư vấn</CardTitle>
//         <CardDescription>
//           Hiển thị số liệu tư vấn theo các kênh trong {summary.period}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <AreaChart
//             accessibilityLayer
//             data={chartData}
//             margin={{
//               left: 12,
//               right: 12,
//             }}
//           >
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="month"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               tickFormatter={(value) => value.slice(0, 3)}
//             />
//             <YAxis />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent indicator="dot" />}
//             />
//             <Area
//               dataKey="phoneCall"
//               type="natural"
//               fill="hsl(var(--chart-A-1))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-A-1))"
//               stackId="a"
//             />
//             <Area
//               dataKey="onlineMeeting"
//               type="natural"
//               fill="hsl(var(--chart-A-2))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-A-2))"
//               stackId="a"
//             />
//             <Area
//               dataKey="inPerson"
//               type="natural"
//               fill="hsl(var(--chart-A-3))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-A-3))"
//               stackId="a"
//             />
//             <Area
//               dataKey="email"
//               type="natural"
//               fill="hsl(var(--chart-A-4))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-A-4))"
//               stackId="a"
//             />
//             <Area
//               dataKey="chat"
//               type="natural"
//               fill="hsl(var(--chart-A-5))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-A-5))"
//               stackId="a"
//             />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter>
//         <div className="flex w-full items-start gap-2 text-sm">
//           <div className="grid gap-2">
//             <div className={`flex items-center gap-2 font-medium leading-none ${trendingColor}`}>
//               {trendingText} {trendingDirectionIcon}
//             </div>
//             <div className="flex items-center gap-2 leading-none text-muted-foreground">
//               Tổng lượt tư vấn: {summary.totalConsultations.toLocaleString()} |
//               Thời gian TB: {summary.averageDuration} phút |
//               Tăng trưởng: {summary.growthRate}
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
