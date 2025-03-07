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
import { useMediaQuery } from "react-responsive";

// pdf-lib와 downloadjs를 사용하여 템플릿 PDF를 불러와 데이터를 채워 다운로드하는 함수
import { PDFDocument, rgb } from "pdf-lib";
import download from "downloadjs";
import fontkit from "@pdf-lib/fontkit";

// 날짜 문자열을 파싱하여 { month, day } 객체로 반환하는 함수
const formatDateParts = (dateStr) => {
  if (!dateStr) return { month: "월", day: "일" };
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj)) return { month: "오류", day: "오류" };
  const month = dateObj.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
  const day = dateObj.getDate();
  return { month, day };
};

// ─── 임시 승인/거부, 삭제 처리 함수 ─────────────────────────────
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

// ─── 템플릿 PDF에 데이터를 채워 다운로드하는 함수 ─────────────────────────────
const downloadTemplatePDF = async (rowData) => {
  // 템플릿 PDF 파일을 public 폴더에서 불러오기 (경로 조정 필요)
  const existingPdfBytes = await fetch("/sunja.pdf").then((res) =>
    res.arrayBuffer()
  );
  
  // PDFDocument 생성 및 fontkit 등록
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // 한글 텍스트를 출력하기 위해 public 폴더에 위치한 NanumGothic.ttf 파일을 불러와 임베드
  const fontBytes = await fetch("/NanumGothic.ttf").then((res) =>
    res.arrayBuffer()
  );
  const customFont = await pdfDoc.embedFont(fontBytes);

  // xata.createdAt에서 월, 일을 분리해서 추출
  const { month, day } = formatDateParts(rowData.xata.createdAt);

  // Time: "교시" 문구 제거 (예: "1교시" → "1")
  const timeText = rowData.time ? rowData.time.replace("교시", "") : "정보 없음";

  // 예시: 월과 일을 각각 다른 좌표에 출력 (좌표는 템플릿에 맞게 조정)
  firstPage.drawText(`${month}`, {
    x: 430,
    y: height - 155,
    size: 12,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${day}`, {
    x: 480,
    y: height - 155,
    size: 12,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  
  // 사용시간과 사유 추가
  firstPage.drawText(`야자 ${rowData.time} 교시`, {
    x: 305,
    y: height - 190,
    size: 12,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${rowData.reason || "정보 없음"}`, {
    x: 260,
    y: height - 227,
    size: 15,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  
  // 신청자 목록: 신청자 이름이 3개 이상일 경우 2개씩 그룹으로 묶어서 한 줄에 출력
  if (rowData.applicant && rowData.applicant.length > 0) {
    const applicants = rowData.applicant;
    const groups = [];
    for (let i = 0; i < applicants.length; i += 2) {
      groups.push(applicants.slice(i, i + 2));
    }
    let yPos = height - 270; // 시작 y 좌표 (템플릿에 맞게 조정)
    groups.forEach((group) => {
      const text = group
        .map((applicant) => `${applicant.number} ${applicant.name}`)
        .join(" / ");
      firstPage.drawText(text, {
        x: 245,
        y: yPos,
        size: 15,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      yPos -= 17;
    });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, `${rowData.name}_template.pdf`, "application/pdf");
};

// ─── 데스크톱용 테이블 열 정의 ─────────────────────────────
const columnsDesktop = (data, setData, downloadTemplatePDF) => [
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
    id: "template",
    header: "템플릿 다운로드",
    cell: ({ row }) => (
      <Button onClick={() => downloadTemplatePDF(row.original)}>
        템플릿 다운로드
      </Button>
    ),
  },
];

// ─── 모바일용 리스트 뷰 컴포넌트 (한 화면에 3개씩 표시) ─────────────────────────────
const MobileDataView = ({ data, downloadTemplatePDF, setData, router, pageIndex, totalPages, handleNextPage, handlePreviousPage }) => {
  // 한 페이지에 mobilePageSize(3)개의 항목만 표시
  const mobilePageSize = 3;
  const itemsToShow = data.slice(pageIndex * mobilePageSize, pageIndex * mobilePageSize + mobilePageSize);

  return (
    <div className="w-full p-4">
      {itemsToShow.map((item) => (
        <Card key={item.id} className="p-4 m-2">
          <p>
            <strong>대표자:</strong> {item.name}
          </p>
          <p>
            <strong>전화번호:</strong> {item.contact}
          </p>
          <p>
            <strong>총인원:</strong> {item.count}
          </p>
          <p>
            <strong>신청교시:</strong> {item.time}
          </p>
          <p>
            <strong>사유:</strong> {item.reason}
          </p>
          <Button className="mt-2" onClick={() => downloadTemplatePDF(item)}>
            템플릿 다운로드
          </Button>
        </Card>
      ))}
      <div className="flex justify-between mt-4">
        <Button onClick={handlePreviousPage} disabled={pageIndex === 0}>
          이전
        </Button>
        <span>
          {pageIndex + 1} / {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={pageIndex + 1 === totalPages}>
          다음
        </Button>
      </div>
      <div className="flex justify-around mt-4">
        <Button onClick={() => router.push("/admin")}>홈</Button>
        <Button onClick={() => router.push("/admin/status")}>승인 현황</Button>
        <Button onClick={() => router.push("/statusfalse")}>거절 현황</Button>
      </div>
    </div>
  );
};

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
  // 데스크톱용 페이지 인덱스
  const [pageIndex, setPageIndex] = useState(0);
  // 모바일용 페이지 인덱스 (한 화면에 3개씩)
  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const pageSize = 8;
  const mobilePageSize = 3;
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // API에서 데이터 가져오기: xata.createdAt을 그대로 할당
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
          time: request.time, // 예: "1교시"
          reason: request.reason || "",
          status: request.status || "rejected",
          isApproved: request.isApproved ?? false,
          // xata.createdAt을 그대로 할당 (formatDateParts 함수 내에서 파싱)
          "xata.createdAt": request["xata.createdAt"],
          teacher: request.teacher, // 예: "김선생님"
        }))
        // isApproved가 true인 값만 필터링
        .filter((item) => item.isApproved)
        .sort((a, b) => new Date(b["xata.createdAt"]) - new Date(a["xata.createdAt"]));

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

  // 모바일용 페이지네이션 핸들러 (한 화면에 mobilePageSize개씩)
  const handleMobileNext = () => {
    setMobilePageIndex((prev) =>
      Math.min(prev + 1, Math.ceil(data.length / mobilePageSize) - 1)
    );
  };

  const handleMobilePrevious = () => {
    setMobilePageIndex((prev) => Math.max(prev - 1, 0));
  };

  const totalMobilePages = Math.ceil(data.length / mobilePageSize);

  // 데스크톱용 테이블
  const table = useReactTable({
    data,
    columns: columnsDesktop(data, setData, downloadTemplatePDF),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <main className="flex flex-col items-center w-screen min-h-screen p-4">
      {isMobile ? (
        <MobileDataView
          data={data}
          downloadTemplatePDF={downloadTemplatePDF}
          setData={setData}
          router={router}
          pageIndex={mobilePageIndex}
          totalPages={totalMobilePages}
          handleNextPage={handleMobileNext}
          handlePreviousPage={handleMobilePrevious}
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
      <ToastContainer position="top-center" />
    </main>
  );
}
