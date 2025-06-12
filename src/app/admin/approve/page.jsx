"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
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

// ─── 삭제 확인 토스트 ─────────────────────────────
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
    cell: ({ row }) => {
      const name = row.getValue("name");
      const shouldFlash = name === "안채헌" || name === "윤석영" || name === "정준호";
      return (
        <div className={shouldFlash ? "flash-cell" : ""}>
          {name}
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "전화번호",
    cell: ({ row }) => {
      const shouldFlash =
        row.original.name === "안채헌" || row.original.name === "윤석영" || row.original.name === "정준호";
      return (
        <div className={shouldFlash ? "flash-cell" : ""}>
          {row.getValue("contact")}
        </div>
      );
    },
  },
  {
    accessorKey: "count",
    header: "총인원",
    cell: ({ row }) => {
      const shouldFlash =
        row.original.name === "안채헌" || row.original.name === "윤석영" || row.original.name === "정준호";
      return (
        <div className={shouldFlash ? "flash-cell" : ""}>
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
        </div>
      );
    },
  },
  {
    accessorKey: "time",
    header: "신청교시",
    cell: ({ row }) => {
      const shouldFlash =
        row.original.name === "안채헌" || row.original.name === "윤석영" || row.original.name === "정준호";
      return (
        <div className={shouldFlash ? "flash-cell" : ""}>
          {row.getValue("time")}
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "사유",
    cell: ({ row }) => {
      const shouldFlash =
        row.original.name === "안채헌" || row.original.name === "윤석영" || row.original.name === "정준호";
      return (
        <div className={shouldFlash ? "flash-cell" : ""}>
          {row.getValue("reason")}
        </div>
      );
    },
  },
  {
    id: "approve",
    header: "확인",
    cell: ({ row }) => (
      <Button
        onClick={() => {
          if (row.original.isApproved) {
            handleReject(row.original, data, setData);
          } else {
            handleApprove(row.original, data, setData);
          }
        }}
        className={`w-full ${row.original.isApproved
          ? "bg-red-500 text-white"
          : "bg-green-500 text-white"
          }`}
      >
        {row.original.isApproved ? "거부" : "승인"}
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

// ─── 상태 업데이트 및 알림 전송 ─────────────────────────────
const handleUpdateStatus = async (row, data, setData, isApproved) => {
  const newStatus = isApproved ? "approved" : "rejected";
  try {
    const response = await fetch(`/api/requests?id=${row.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus, isApproved }),
    });

    if (!response.ok) {
      throw new Error("Request update failed");
    }

    const updatedData = data.map((d) =>
      d.id === row.id ? { ...d, status: newStatus, isApproved } : d
    );
    setData(updatedData);

    toast.success(isApproved ? "승인 되었습니다." : "거부되었습니다.", {
      autoClose: 500,
      position: "top-center",
    });

    const notifyResponse = await fetch("/api/notify-approval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: row.id, isApproved }),
    });
    const notifyData = await notifyResponse.json();
    console.log("알림 전송 결과:", notifyData);
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

// ─── 데스크톱용 데이터 테이블 ─────────────────────────────
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
                <TableRow key={row.original.id}>
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
          <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin/statusfalse")}>
            거절 현황
          </Button>
          <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin/download")}>
            다운로드
          </Button>
          <Button className="text-lg mb-4 w-full" onClick={() => router.push("/admin/status")}>
            승인 현황
          </Button>
        </div>
      </>
    )}
  </Card>
);

// ─── 모바일용 데이터 리스트 ─────────────────────────────
const MobileDataView = ({ table, data, setData, isLoading, handlePreviousPage, handleNextPage, router }) => {
  if (isLoading) return <p>로딩 중...</p>;

  const currentPageData = table.getRowModel().rows.map((row) => row.original);
  if (currentPageData.length === 0) return <p>신청 목록이 없습니다</p>;

  return (
    <div className="w-full p-4">
      {currentPageData.map((item) => (
        <Card key={item.id} className="relative p-4 m-2">
          <span
            onClick={() => confirmDelete(item, data, setData)}
            className="absolute top-1 right-1 text-gray-500 cursor-pointer"
          >
            X
          </span>
          <p>
            <strong>대표자:</strong>{" "}
            <span className={item.name === "안채헌" || item.name === "윤석영" || item.name === "정준호" ? "flash-cell" : ""}>
              {item.name}
            </span>
          </p>
          <p>
            <strong>전화번호:</strong>{" "}
            <span className={item.name === "안채헌" || item.name === "윤석영" || item.name === "정준호" ? "flash-cell" : ""}>
              {item.contact}
            </span>
          </p>
          <p>
            <strong>총인원:</strong>{" "}
            <span className={item.name === "안채헌" || item.name === "윤석영" || item.name === "정준호" ? "flash-cell" : ""}>
              {item.count}
            </span>{" "}
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
            <strong>신청교시:</strong>{" "}
            <span className={item.name === "안채헌" || item.name === "윤석영" || item.name === "정준호" ? "flash-cell" : ""}>
              {item.time}
            </span>
          </p>
          <p>
            <strong>사유:</strong>{" "}
            <span className={item.name === "안채헌" || item.name === "윤석영" || item.name === "정준호" ? "flash-cell" : ""}>
              {item.reason}
            </span>
          </p>
          <div className="mt-2">
            <Button
              onClick={() => {
                if (item.isApproved) {
                  handleReject(item, data, setData);
                } else {
                  handleApprove(item, data, setData);
                }
              }}
              className={`w-full ${item.isApproved ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
            >
              {item.isApproved ? "거부" : "승인"}
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
        <Button className="text-lg w-full" onClick={() => router.push("/admin/download")}>
          다운로드
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

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
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
          id: request.id,
          ...request,
          name: request.applicant[0]?.name || "N/A",
          contact: request.contact || "N/A",
          count: `${request.applicant.length}명`,
          time: `${request.time}교시`,
          reason: request.reason || "",
          status: request.status || "rejected",
          isApproved: request.isApproved ?? false,
        }))
        .sort((a, b) => {
          const aSpecial = a.name === "안채헌" || a.name === "윤석영" || a.name === "정준호";
          const bSpecial = b.name === "안채헌" || b.name === "윤석영" || b.name === "정준호";
          if (aSpecial && !bSpecial) return -1;
          if (bSpecial && !aSpecial) return 1;
          return new Date(b.xata.createdAt) - new Date(a.xata.createdAt);
        });

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
      <main className="flex flex-col justify-center items-center w-screen h-screen">
        {!isPasswordCorrect ? (
          <Link href={"/morepeople"}>morepeople</Link>
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
