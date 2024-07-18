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
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { stringify } from "qs";

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
    cell: ({ row }) => (row.original.isApproved ? "승인됨" : "미승인"),
  },
  {
    id: "details",
    header: "총신청자",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          alert(
            row.original.applicant
              .map((applicant) => `${applicant.name} (${applicant.number})`)
              .join("\n"),
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
            alert(newStatus ? "승인 되었습니다." : "승인 취소 되었습니다.");
          } catch (error) {
            console.error("Error updating status:", error);
          }
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
        onClick={async () => {
          try {
            const response = await fetch(`/api/requests?id=${row.original.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error("Request deletion failed");
            }

            const updatedData = data.filter((d) => d.id !== row.original.id);
            setData(updatedData);
            alert("거부 되었습니다.");
          } catch (error) {
            console.error("Error deleting request:", error);
          }
        }}
      >
        거부
      </Button>
    ),
  },
];

export default function Homeadmin() {
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm();

  const table = useReactTable({
    data,
    columns: columns(data, setData),
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "000000") {
      setIsPasswordCorrect(true);
    } else {
      alert("비밀번호가 틀렸습니다. 다시 시도해주세요.");
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
      }));

      console.log("변환된 데이터:", transformedData);
      setData(transformedData);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
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

  const handleButtonClick = (url) => {
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
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
              <Button
                type="button"
                onClick={() => handleButtonClick("/admin")}
                className="text-lg mt-4"
              >
                뒤로
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-screen">
            <div className="rounded-md border mb-4 w-full">
              {isLoading ? (
                <p>로딩 중...</p>
              ) : !data || data.length === 0 ? (
                <p>신청 목록이 없습니다</p>
              ) : (
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
              )}
            </div>
            <div className="flex space-x-4 mt-4">
              <Button
                className="text-lg mb-4 w-full"
                onClick={() => handleButtonClick("/admin/status")}
              >
                승인 현황
              </Button>
              <Button className="text-lg mb-4 w-full" onClick={() => handleButtonClick("/admin")}>
                홈
              </Button>
            </div>
          </Card>
        )}
      </main>
    </FormProvider>
  );
}
