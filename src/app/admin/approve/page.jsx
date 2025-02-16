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
import { useMediaQuery } from "react-responsive";

// ─── 삭제 확인 토스트 (커스텀 컴포넌트) ─────────────────────────────
const confirmDelete = (row, data, setData) => {
  toast(
    ({ closeToast }) => (
      <div>
        <div className="mb-2">정말 삭제하시겠습니까?</div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-green-500 text-white rounded"
            onClick={() => {
              closeToast();
              handleDeleteConfirmed(row, data, setData);
            }}
          >
            확인
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded"
            onClick={closeToast}
          >
            취소
          </button>
        </div>
      </div>
    ),
    { autoClose: false, position: "top-center" }
  );
};

const handleDeleteConfirmed = async (row, data, setData) => {
  try {
    const response = await fetch(`/api/requests?id=${row.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("삭제 실패");
    }
    const updatedData = data.filter((d) => d.id !== row.id);
    setData(updatedData);
    toast.success("삭제되었습니다.", {
      autoClose: 500,
      position: "top-center",
    });
  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
    toast.error("삭제 중 오류 발생", {
      autoClose: 500,
      position: "top-center",
    });
  }
};

// ─── 데스크톱용 테이블 열 정의 ─────────────────────────────
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
    cell: ({ row }) => (
      <>
        {row.original.count}{" "}
        <span
          onClick={() => {
            toast.info(
              row.original.applicant
                .map(
                  (applicant) =>
                    `${applicant.name} (${applicant.number})`
                )
                .join("\n"),
              { position: "top-center", autoClose: false }
            );
          }}
          className="ml-1 text-sm text-gray-500 underline cursor-pointer"
        >
          더보기
        </span>
      </>
    ),
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
    id: "approve",
    header: "확인",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          if (row.original.status === "approved") {
            handleReject(row.original, data, setData);
          } else {
            handleApprove(row.original, data, setData);
          }
        }}
        className={`w-full ${row.original.status === "approved"
            ? "bg-red-500 text-white"
            : "bg-green-500 text-white"
          }`}
      >
        {row.original.status === "approved" ? "거부" : "승인"}
      </Button>
    ),
  },
  {
    id: "delete",
    header: "삭제",
    cell: ({ row }) => (
      <Button
        onClick={() => confirmDelete(row.original, data, setData)}
        className="bg-gray-500 text-white w-full"
      >
        삭제
      </Button>
    ),
  },
];

// ─── 상태 업데이트, 승인/거부 핸들러 ─────────────────────────
const handleUpdateStatus = async (row, data, setData, isApproved) => {
  // isApproved true => status "approved", false => status "rejected"
  const newStatus = isApproved ? "approved" : "rejected";
  try {
    const response = await fetch(`/api/requests?id=${row.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Request update failed");
    }

    const updatedData = data.map((d) =>
      d.id === row.id ? { ...d, status: newStatus } : d
    );
    setData(updatedData);

    toast.success(isApproved ? "승인 되었습니다." : "거부되었습니다.", {
      autoClose: 500,
      position: "top-center",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("상태 업데이트 중 오류 발생", {
      autoClose: 500,
      position: "top-center",
    });
  }
};

const handleApprove = (row, data, setData) => {
  handleUpdateStatus(row, data, setData, true);
};

const handleReject = (row, data, setData) => {
  handleUpdateStatus(row, data, setData, false);
};

// ─── 로그인 전 비밀번호 입력 폼 ─────────────────────────────
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
      <Button type="button" onClick={() => router.push("/admin")} className="text-lg mt-4 w-full">
        뒤로
      </Button>
    </form>
  </Card>
);

// ─── 데스크톱용 데이터 테이블 (react-table 사용) ─────────────────
const DataTable = ({ table, data, isLoading, handlePreviousPage, handleNextPage, router }) => (
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
      </>
    )}
  </Card>
);

// ─── 모바일용 간소화 데이터 리스트 ─────────────────────────────
const MobileDataView = ({ table, data, setData, isLoading, handlePreviousPage, handleNextPage, router }) => {
  if (isLoading) return <p>로딩 중...</p>;

  // react-table의 현재 페이지 데이터에서 원본 데이터를 추출
  const currentPageData = table.getRowModel().rows.map((row) => row.original);
  if (currentPageData.length === 0) return <p>신청 목록이 없습니다</p>;

  return (
    <div className="w-full p-4">
      {currentPageData.map((item) => (
        <Card key={item.id} className="relative p-4 m-2">
          {/* 카드 우측 상단의 삭제 버튼 */}
          <span
            onClick={() => confirmDelete(item, data, setData)}
            className="absolute top-1 right-1 text-gray-500 cursor-pointer"
          >
            X
          </span>
          <p>
            <strong>대표자:</strong> {item.name}
          </p>
          <p>
            <strong>전화번호:</strong> {item.contact}
          </p>
          <p>
            <strong>총인원:</strong> {item.count}{" "}
            <span
              onClick={() => {
                toast.info(
                  item.applicant
                    .map(
                      (applicant) =>
                        `${applicant.name} (${applicant.number})`
                    )
                    .join("\n"),
                  { position: "top-center", autoClose: false }
                );
              }}
              className="ml-1 text-sm text-gray-500 underline cursor-pointer"
            >
              더보기
            </span>
          </p>
          <p>
            <strong>신청교시:</strong> {item.time}
          </p>
          <p>
            <strong>사유:</strong> {item.reason}
          </p>
          <div className="mt-2">
            <Button
              onClick={() => {
                if (item.status === "approved") {
                  handleReject(item, data, setData);
                } else {
                  handleApprove(item, data, setData);
                }
              }}
              className={`w-full ${item.status === "approved"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
                }`}
            >
              {item.status === "approved" ? "거부" : "승인"}
            </Button>
          </div>
        </Card>
      ))}
      <div className="flex justify-between items-center w-full mt-4">
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
      <div className="flex space-x-4 mt-4">
        <Button className="text-lg w-full" onClick={() => router.push("/statusfalse")}>
          거절 현황
        </Button>
        <Button className="text-lg w-full" onClick={() => router.push("/admin")}>
          홈
        </Button>
        <Button className="text-lg w-full" onClick={() => router.push("/admin/status")}>
          승인 현황
        </Button>
      </div>
    </div>
  );
};

export default function Homeadmin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const methods = useForm();

  // react-responsive를 사용해 픽셀 기반 미디어 쿼리 적용 (최대 768px 이하이면 모바일)
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  // 모바일이면 페이지 당 3개, 데스크톱이면 8개씩 보여주기
  const pageSize = isMobile ? 3 : 8;

  const table = useReactTable({
    data,
    columns: columns(data, setData),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/password", {
      method: "POST",
      body: password,
    });
    const result = await res.json();
    if (result.success) {
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
      const transformedData = result.requests
        .map((request) => ({
          ...request,
          name: request.applicant[0]?.name || "N/A",
          contact: request.contact || "N/A",
          count: `${request.applicant.length}명`,
          time: `${request.time}교시`,
          reason: request.reason || "",
          // status 값이 없으면 "rejected"로 기본 처리 (pending도 rejected로 취급)
          status: request.status || "rejected",
        }))
        .sort((a, b) => new Date(b.xata.createdAt) - new Date(a.xata.createdAt));

      setData(transformedData);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      toast.error("데이터 가져오기 중 오류 발생", {
        autoClose: 500,
        position: "top-center",
      });
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
        ) : isMobile ? (
          <MobileDataView
            table={table}
            data={data}
            setData={setData}
            isLoading={isLoading}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            router={router}
          />
        ) : (
          <DataTable
            table={table}
            data={data}
            isLoading={isLoading}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            router={router}
          />
        )}
      </main>
      <ToastContainer
        position="top-center"
        toastStyle={
          isMobile
            ? {}
            : { minHeight: "80px", minWidth: "400px", padding: "20px" }
        }
      />
    </FormProvider>
  );
}
