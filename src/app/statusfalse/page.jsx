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
import { useMediaQuery } from "react-responsive"; // react-responsive 임포트

// 테이블 컬럼 정의
const columns = [
  {
    accessorKey: "name",
    header: "대표자",
  },
  {
    accessorKey: "count",
    header: "총인원",
  },
];

// DataTable 컴포넌트
const DataTable = ({ title, data, isLoading }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="w-5/6 grid justify-items-center items-center p-8 m-4 min-w-80 min-h-36">
      <Label className="text-2xl mb-4">{title}</Label>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : !data || data.length === 0 ? (
        <p>신청 목록이 없습니다</p>
      ) : (
        <div className="rounded-md border mb-4 w-full">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
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
              {table.getRowModel().rows.map((row) => (
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
  );
};

// RequestsPage 컴포넌트
export default function RequestsPage() {
  const router = useRouter();
  const [dataByTime, setDataByTime] = useState({ 1: [], 2: [], 3: [] });
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm();

  // react-responsive를 사용해 픽셀 기반 미디어 쿼리 적용 (예: 최대 768px 이하일 때 모바일)
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // 데이터 가져오는 함수
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/requests?" +
        stringify({
          $all: [
            {
              "xata.createdAt": { $ge: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() },
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

      // status의 값이 "approved"인 데이터만 필터링
      const approvedData = result.requests.filter((request) => request.status === "rejected");

      // 시간대별 데이터 정리
      const updatedDataByTime = { 1: [], 2: [], 3: [] };

      approvedData.forEach((request) => {
        if (request.time >= 1 && request.time <= 3) {
          updatedDataByTime[request.time].push({
            ...request,
            name: request.applicant.length > 0 ? request.applicant[0].name : "N/A",
            count: `${request.applicant.length}명`,
          });
        }
      });

      setDataByTime(updatedDataByTime);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      setDataByTime({ 1: [], 2: [], 3: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트가 마운트될 때 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <FormProvider {...methods}>
      {/* 모바일일 때는 min-h-screen과 overflow-auto를 적용해 스크롤 가능하도록, 데스크톱은 h-screen 고정 */}
      <main
        className={`flex flex-col justify-center items-center w-screen ${isMobile ? "min-h-screen overflow-auto" : "h-screen"
          }`}
      >
        {["1교시", "2교시", "3교시"].map((title, index) => (
          <DataTable
            key={index}
            title={`${title} 신청 목록`}
            data={dataByTime[index + 1]}
            isLoading={isLoading}
          />
        ))}
        <Button type="button" onClick={() => router.back()} className="mt-4">
          뒤로
        </Button>
      </main>
    </FormProvider>
  );
}
