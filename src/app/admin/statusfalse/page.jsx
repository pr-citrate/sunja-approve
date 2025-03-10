"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { stringify } from "qs";
import { useMediaQuery } from "react-responsive";

const columns = [
  {
    accessorKey: "name",
    header: "대표자",
  },
  {
    accessorKey: "contact",
    header: "전화번호",
  },
  {
    accessorKey: "reason",
    header: "사유",
  },
  {
    accessorKey: "count",
    header: "총인원",
  },
];

export default function RequestsPage() {
  const router = useRouter();
  const methods = useForm();

  // 모든 훅은 최상위에서 호출
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [mounted, setMounted] = useState(false);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const table1 = useReactTable({
    data: data1,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const table2 = useReactTable({
    data: data2,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const table3 = useReactTable({
    data: data3,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/requests?" +
        stringify({
          $all: [
            {
              "xata.createdAt": {
                $ge: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
              },
            },
            {
              "xata.createdAt": {
                $le: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
              },
            },
          ],
        })
      );
      const result = await response.json();
      console.log("클라이언트에서 받아온 데이터:", result.requests);

      // status가 rejected인 데이터만 필터링
      const approvedData = result.requests.filter(
        (request) => request.status === "rejected"
      );

      const dataByTime = { 1: [], 2: [], 3: [] };

      approvedData.forEach((request) => {
        if (request.time >= 1 && request.time <= 3) {
          dataByTime[request.time].push({
            ...request,
            name: request.applicant.length > 0 ? request.applicant[0].name : "N/A",
            count: `${request.applicant.length}명`,
          });
        }
      });

      setData1(dataByTime[1]);
      setData2(dataByTime[2]);
      setData3(dataByTime[3]);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      setData1([]);
      setData2([]);
      setData3([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 모든 훅이 호출된 상태이므로 mounted 여부에 따라 로딩 상태를 보여줍니다.
  if (!mounted) {
    return <div>로딩 중...</div>;
  }

  // 모바일 슬라이더용 배열
  const slides = [
    { label: "1교시 신청 목록", data: data1, table: table1 },
    { label: "2교시 신청 목록", data: data2, table: table2 },
    { label: "3교시 신청 목록", data: data3, table: table3 },
  ];

  return (
    <FormProvider {...methods}>
      <main className="w-screen min-h-screen bg-gray-50 pb-4">
        {isMobile ? (
          // 모바일 UI
          <>
            <div className="sticky top-12 z-10 bg-gray-50 border-b py-2 flex items-center justify-center">
              {slides.map((slide, index) => (
                <Button
                  key={index}
                  variant={currentSlide === index ? "default" : "outline"}
                  onClick={() => setCurrentSlide(index)}
                  className="text-sm rounded-none first:rounded-l last:rounded-r border-r-0 last:border-r"
                >
                  {slide.label.split(" ")[0]}
                </Button>
              ))}
            </div>
            {/* 카드 전체를 100px 아래로 내림 */}
            <div className="mt-[100px] flex justify-center items-center px-4">
              <Card className="w-full max-w-md p-4 shadow">
                <Label className="text-xl md:text-2xl mb-4">
                  {slides[currentSlide].label}
                </Label>
                {isLoading ? (
                  <p>로딩 중...</p>
                ) : !slides[currentSlide].data || slides[currentSlide].data.length === 0 ? (
                  <p>거절된 신청이 없습니다</p>
                ) : (
                  <div className="rounded-md border mb-4 w-full overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        {slides[currentSlide].table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {slides[currentSlide].table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </div>
          </>
        ) : (
          // 데스크톱 UI: 중앙 정렬 컨테이너로 감싸서 좌측 치우침 방지
          <div className="flex flex-col items-center">
            <Card className="w-5/6 mx-auto grid justify-items-center items-center p-8 m-4 min-w-80 min-h-36 shadow">
              <Label className="text-2xl mb-4">1교시 신청 목록</Label>
              {isLoading ? (
                <p>로딩 중...</p>
              ) : !data1 || data1.length === 0 ? (
                <p>거절된 신청이 없습니다</p>
              ) : (
                <div className="rounded-md border mb-4 w-full">
                  <Table className="w-full">
                    <TableHeader>
                      {table1.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table1.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
            <Card className="w-5/6 mx-auto grid justify-items-center items-center p-8 m-4 min-w-80 min-h-36 shadow">
              <Label className="text-2xl mb-4">2교시 신청 목록</Label>
              {isLoading ? (
                <p>로딩 중...</p>
              ) : !data2 || data2.length === 0 ? (
                <p>거절된 신청이 없습니다</p>
              ) : (
                <div className="rounded-md border mb-4 w-full">
                  <Table className="w-full">
                    <TableHeader>
                      {table2.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table2.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
            <Card className="w-5/6 mx-auto grid justify-items-center items-center p-8 m-4 min-w-80 min-h-36 shadow">
              <Label className="text-2xl mb-4">3교시 신청 목록</Label>
              {isLoading ? (
                <p>로딩 중...</p>
              ) : !data3 || data3.length === 0 ? (
                <p>거절된 신청이 없습니다</p>
              ) : (
                <div className="rounded-md border mb-4 w-full">
                  <Table className="w-full">
                    <TableHeader>
                      {table3.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table3.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        )}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
          >
            뒤로
          </Button>
        </div>
      </main>
    </FormProvider>
  );
}
