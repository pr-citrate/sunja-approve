"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 테이블 열 정의
const columns = () => [
  {
    accessorKey: "name",
    header: "대표자",
  },
  {
    accessorKey: "contact",
    header: "전화번호",
  },
  {
    accessorKey: "count",
    header: "총인원",
  },
  {
    accessorKey: "time",
    header: "신청교시",
  },
  {
    accessorKey: "reason",
    header: "사유",
  },
  {
    accessorKey: "status",
    header: "승인 상태",
    cell: ({ row }) => (row.original.isApproved ? "승인" : "미승인"),
  },
  {
    accessorKey: "ip",
    header: "IP 주소",
  },
  {
    accessorKey: "createdAt", 
    header: "신청일",
    cell: ({ row }) => new Date(row.original.xata.createdAt).toLocaleDateString(),
  },
  {
    id: "details",
    header: "총신청자",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          toast.info(
            row.original.applicant
              .map((applicant) => `${applicant.name} (${applicant.number})`)
              .join("\n"),
            { position: "top-center", autoClose: false },
          );
        }}
      >
        더보기
      </Button>
    ),
  },
];

const DataTable = ({
  table,
  data,
  isLoading,
  handlePreviousPage,
  handleNextPage,
  router,
}) => (
  <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-96 min-w-96">
    {isLoading ? (
      <p>로딩 중...</p>
    ) : !data || data.length === 0 ? (
      <p>신청 목록이 없습니다</p>
    ) : (
      <>
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
        <div className="flex justify-between items-center w-full">
          <Button onClick={handlePreviousPage} disabled={isLoading || !table.getCanPreviousPage()}>
            이전
          </Button>
          <span>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button onClick={handleNextPage} disabled={isLoading || !table.getCanNextPage()}>
            다음
          </Button>
        </div>
      </>
    )}
    <div className="flex space-x-4 mt-4">
      <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin")}>
        홈
      </Button>
    </div>
  </Card>
);

export default function Homeadmin() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const methods = useForm();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/requests");
      
      if (!response.ok) {
        throw new Error("데이터를 가져오는 중 네트워크 오류가 발생했습니다.");
      }

      const result = await response.json();
      
      if (!result.requests) {
        throw new Error("서버에서 요청 데이터를 받지 못했습니다.");
      }

      // applicant 배열이 존재하는지, 첫 번째 요소가 있는지 확인
      const transformedData = result.requests.map((request) => ({
        ...request,
        name: request.applicant?.[0]?.name || "N/A", // 안전하게 접근
        count: `${request.applicant?.length || 0}명`,
        time: `${request.time}교시`,
        ip: request.ip || "N/A",
        isApproved: request.isApproved || false,
        createdAt: request.createdAt || new Date(),
      })).reverse(); // 최신 데이터를 가장 앞으로

      setData(transformedData);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      toast.error(`데이터 가져오기 중 오류 발생: ${error.message}`, { autoClose: 500, position: "top-center" });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns: columns(),
    pageCount: Math.ceil(data.length / 8),
    state: {
      pagination: { pageIndex, pageSize: 8 },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, table.getPageCount() - 1));
  };

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormProvider {...methods}>
      <main className="flex justify-center items-center w-screen h-screen">
        <DataTable
          table={table}
          data={data}
          isLoading={isLoading}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          pageIndex={pageIndex}
          router={router}
        />
      </main>
      <ToastContainer position="top-center" />
    </FormProvider>
  );
}
