"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { stringify } from "qs";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 테이블 열 정의
const columns = (data, setData) => [
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
  {
    id: "approve",
    header: "확인",
    cell: ({ row }) => (
      <Button
        onClick={() => handleApprove(row.original, data, setData)}
        className={`bg-green-500 text-white ${row.original.isApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={row.original.isApproved} // isApproved가 true이면 비활성화
      >
        승인
      </Button>
    ),
  },
  

  {
    id: "reject",
    header: "거부",
    cell: ({ row }) => (
      <Button
        onClick={() => handleReject(row.original, data, setData)}
        className={`bg-red-500 text-white ${!row.original.isApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!row.original.isApproved} // isApproved가 false이면 비활성화
      >
        거부
      </Button>
    ),
  },
];

// 상태 업데이트 핸들러 함수
const handleUpdateStatus = async (row, data, setData, isApproved) => {
  try {
    const response = await fetch(`/api/requests?id=${row.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isApproved }),
    });

    if (!response.ok) {
      throw new Error("Request update failed");
    }

    const updatedData = data.map((d) =>
      d.id === row.id ? { ...d, isApproved } : d,
    );
    setData(updatedData);

    toast.success(isApproved ? "승인 되었습니다." : "거부되었습니다.", {
      autoClose: 500,
      position: "top-center",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("상태 업데이트 중 오류 발생", { autoClose: 500, position: "top-center" });
  }
};

// 승인 핸들러 함수
const handleApprove = (row, data, setData) => {
  handleUpdateStatus(row, data, setData, true);
};

// 거부 핸들러 함수
const handleReject = (row, data, setData) => {
  handleUpdateStatus(row, data, setData, false);
};

const PasswordForm = ({ handlePasswordSubmit, password, setPassword, router }) => (
  <Card className="w-96 grid justify-items-center items-center p-8">
    <form onSubmit={handlePasswordSubmit} className="w-full grid justify-items-center">
      <Label htmlFor="password" className="text-xl mb-4">
        비밀번호 입력
      </Label>
      <Input
        id="password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 text-lg w-full"
      />
      <Button type="submit" className="text-lg mt-4 w-full">
        로그인
      </Button>
      <Button type="button" onClick={() => router.push("/admin")} className="text-lg mt-4">
        뒤로
      </Button>
    </form>
  </Card>
);

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
          <Button onClick={handlePreviousPage} disabled={!table.getCanPreviousPage()}>
            이전
          </Button>
          <span>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button onClick={handleNextPage} disabled={!table.getCanNextPage()}>
            다음
          </Button>
        </div>
      </>
    )}
    <div className="flex space-x-4 mt-4">
      <Button className="text-lg mb-4 w-full" onClick={() => router.push("/statusfalse")}>
        거절 현황
      </Button>
      <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin")}>
        홈
      </Button>
      <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin/status")}>
        승인 현황
      </Button>
    </div>
  </Card>
);

export default function Homeadmin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const methods = useForm();

  const table = useReactTable({
    data,
    columns: columns(data, setData),
    pageCount: Math.ceil(data.length / 8),
    state: {
      pagination: { pageIndex, pageSize: 8 },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "000000") {
      setIsPasswordCorrect(true);
    } else {
      toast.error("비밀번호가 틀렸습니다. 다시 시도해주세요.", {
        autoClose: 500,
        position: "top-center",
      });
    }
  };

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
          }),
      );
      const result = await response.json();
      const transformedData = result.requests
        .map((request) => ({
          ...request,
          name: request.applicant[0]?.name || "N/A",
          count: `${request.applicant.length}명`,
          time: `${request.time}교시`,
          isApproved: request.isApproved || false,
        }))
        .sort((a, b) => new Date(b.xata.createdAt) - new Date(a.xata.createdAt));

      setData(transformedData);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      toast.error("데이터 가져오기 중 오류 발생", { autoClose: 500, position: "top-center" });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPasswordCorrect) {
      fetchData();
    }
  }, [isPasswordCorrect]);

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, table.getPageCount() - 1));
  };

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormProvider {...methods}>
      <main className="flex justify-center items-center w-screen h-screen">
        {!isPasswordCorrect ? (
          <PasswordForm
            handlePasswordSubmit={handlePasswordSubmit}
            password={password}
            setPassword={setPassword}
            router={router}
          />
        ) : (
          <DataTable
            table={table}
            data={data}
            isLoading={isLoading}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            pageIndex={pageIndex}
            router={router}
          />
        )}
      </main>
      <ToastContainer position="top-center" />
    </FormProvider>
  );
}
