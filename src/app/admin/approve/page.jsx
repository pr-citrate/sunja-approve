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
import 'react-toastify/dist/ReactToastify.css';

const columns = (data, setData, buttonColors, setButtonColors) => [
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
    cell: ({ row }) => (row.original.isApproved ? "승인됨" : "미승인"),
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
            { position: "top-center", autoClose: false }
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
        onClick={async () => {
          try {
            const isApproved = row.original.isApproved;
            const newStatus = !isApproved;

            const response = await fetch(`/api/requests?id=${row.original.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                isApproved: newStatus,
              }),
            });

            if (!response.ok) {
              throw new Error("Request update failed");
            }

            const updatedData = data.map((d) =>
              d.id === row.original.id ? { ...d, isApproved: newStatus } : d,
            );
            setData(updatedData);
            setButtonColors((prevColors) => ({
              ...prevColors,
              [row.original.id]: newStatus ? "red" : "green",
            }));
            toast.success(newStatus ? "승인 되었습니다." : "승인 취소 되었습니다.", { autoClose: 500, position: "top-center", style: { color: newStatus ? "green" : "red" } });
          } catch (error) {
            console.error("Error updating status:", error);
            toast.error("상태 업데이트 중 오류 발생", { autoClose: 500, position: "top-center" });
          }
        }}
        style={{
          backgroundColor: buttonColors[row.original.id] || (row.original.isApproved ? "red" : "green"),
          color: "white",
        }}
      >
        {row.original.isApproved ? "승인 취소" : "승인"}
      </Button>
    ),
  },
  {
    id: "reject",
    header: "거부",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          // 거부 확인 토스트 표시
          const rejectToastId = toast(
            <div className="flex flex-col items-center">
              <p className="mb-2">정말 거부하시겠습니까?</p>
              <div className="flex space-x-4">
                <Button
                  onClick={async () => {
                    try {
                      // 거부 요청
                      const response = await fetch(`/api/requests?id=${row.original.id}`, {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      });
  
                      if (!response.ok) {
                        throw new Error("요청 삭제 실패");
                      }
  
                      // 데이터에서 삭제
                      const updatedData = data.filter((d) => d.id !== row.original.id);
                      setData(updatedData);
                      toast.dismiss(rejectToastId);
                      toast.success("거부 되었습니다.", { autoClose: 500, position: "top-center", style: { color: "red" } });
                    } catch (error) {
                      console.error("거부 처리 오류:", error);
                      toast.dismiss(rejectToastId);
                      toast.error("거부 중 오류 발생", { autoClose: 500, position: "top-center", style: { color: "red" } });
                    }
                  }}
                  className="bg-red-500 text-white"
                >
                  거부
                </Button>
                <Button
                  onClick={() => toast.dismiss(rejectToastId)}
                  className="bg-gray-500 text-white"
                >
                  취소
                </Button>
              </div>
            </div>,
            { autoClose: false, position: "top-center" }
          );
        }}
        className="bg-red-500 text-white"
      >
        거부
      </Button>
    ),
  },
];

export default function Homeadmin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(8); // 한 페이지에 보여줄 데이터 개수
  const [buttonColors, setButtonColors] = useState({});
  const methods = useForm();

  const table = useReactTable({
    data,
    columns: columns(data, setData, buttonColors, setButtonColors),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "000000") {
      setIsPasswordCorrect(true);
    } else {
      toast.error("비밀번호가 틀렸습니다. 다시 시도해주세요.", { autoClose: 500, position: "top-center" });
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
      console.log("클라이언트에서 받아온 데이터:", result.requests);

      const transformedData = result.requests.map((request) => ({
        ...request,
        name: request.applicant[0]?.name || "N/A",
        count: `${request.applicant.length}명`,
        time: `${request.time}교시`,
        isApproved: request.isApproved === null ? false : request.isApproved,
      })).sort((a, b) => new Date(b.xata.createdAt) - new Date(a.xata.createdAt)); // 최신순으로 정렬

      console.log("변환된 데이터:", transformedData);
      setData(transformedData);
      // 초기 버튼 색상을 설정합니다.
      const initialButtonColors = transformedData.reduce((colors, request) => {
        colors[request.id] = request.isApproved ? "red" : "green";
        return colors;
      }, {});
      setButtonColors(initialButtonColors);
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
        ) : (
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
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!table.getCanPreviousPage()}
                  >
                    이전
                  </Button>
                  <span>
                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={!table.getCanNextPage()}
                  >
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
        )}
      </main>
      <ToastContainer position="top-center" />
    </FormProvider>
  );
}
