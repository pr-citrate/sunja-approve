"use client";

import React, { useState, useEffect } from "react";
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
import { stringify } from "qs";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import nanumGothicBase64 from "./nanum-gothic-base64";

// ─── 임시 승인/거부, 삭제 처리 함수 (실제 로직에 맞게 수정) ─────────────────────────────
const handleApprove = (item, data, setData) => {
  const updatedData = data.map((d) =>
    d.id === item.id ? { ...d, isApproved: true } : d
  );
  setData(updatedData);
  toast.success(`${item.name} 승인됨`);
};

const handleReject = (item, data, setData) => {
  const updatedData = data.map((d) =>
    d.id === item.id ? { ...d, isApproved: false } : d
  );
  setData(updatedData);
  toast.info(`${item.name} 거부됨`);
};

const confirmDelete = (item, data, setData) => {
  if (window.confirm("정말 삭제하시겠습니까?")) {
    const updatedData = data.filter((d) => d.id !== item.id);
    setData(updatedData);
    toast.info(`${item.name} 삭제됨`);
  }
};

// ─── 각 행별 PDF 다운로드 함수 ─────────────────────────────
const downloadRowPDF = (rowData) => {
  const doc = new jsPDF();
  // 한글 폰트 등록 (매번 새 인스턴스에서 등록)
  doc.addFileToVFS("NanumGothic.ttf", nanumGothicBase64);
  doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
  doc.setFont("NanumGothic");

  let y = 100;
  doc.text(50, y, `총인원: ${rowData.count}`);
  y += 10;
  doc.text(50, y, `신청교시: ${rowData.time}`);
  y += 10;
  doc.text(50, y, `사유: ${rowData.reason}`);
  y += 10;
  if (rowData.applicant && rowData.applicant.length > 0) {
    y += 10;
    rowData.applicant.forEach((applicant, index) => {
      doc.text(50, y, `${applicant.number} ${applicant.name}`);
      y += 10;
      // 페이지 높이 초과 시 새 페이지 추가 (약 280mm 기준)
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
  }
  doc.save(`${rowData.name}_data.pdf`);
};

// ─── 데스크톱용 테이블 열 정의 ─────────────────────────────
const columns = (data, setData, downloadRowPDF) => [
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
          if (row.original.isApproved) {
            handleReject(row.original, data, setData);
          } else {
            handleApprove(row.original, data, setData);
          }
        }}
        className={`w-full ${
          row.original.isApproved
            ? "bg-red-500 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        {row.original.isApproved ? "거부" : "승인"}
      </Button>
    ),
  },
  {
    id: "download",
    header: "다운로드",
    cell: ({ row }) => (
      <Button onClick={() => downloadRowPDF(row.original)}>
        다운로드
      </Button>
    ),
  },
];

// ─── 데스크톱용 데이터 테이블 컴포넌트 ─────────────────────────────
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
        <div className="flex space-x-4 mt-4 w-full">
          <Button className="w-full" onClick={() => router.push("/statusfalse")}>
            거절 현황
          </Button>
          <Button className="w-full" onClick={() => router.push("/admin")}>
            홈
          </Button>
          <Button className="w-full" onClick={() => router.push("/admin/status")}>
            승인 현황
          </Button>
        </div>
      </>
    )}
  </Card>
);

export default function Homeadmin() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 8;

  // 테이블 생성 시 downloadRowPDF 함수를 columns에 전달합니다.
  const table = useReactTable({
    data,
    columns: columns(data, setData, downloadRowPDF),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // API에서 데이터 가져오기
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
    fetchData();
  }, []);

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, table.getPageCount() - 1));
  };

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <main className="flex flex-col items-center w-screen min-h-screen p-4">
      <DataTable
        table={table}
        data={data}
        isLoading={isLoading}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        router={router}
      />
      <ToastContainer position="top-center" />
    </main>
  );
}
