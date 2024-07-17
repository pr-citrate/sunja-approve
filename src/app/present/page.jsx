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
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const columns = (data, setData) => [
  {
    accessorKey: "time",
    header: "교시",
  },
  {
    accessorKey: "teamCount",
    header: "팀 수",
  },
];

export default function Home() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm();

  const table = useReactTable({
    data,
    columns: columns(data, setData),
    getCoreRowModel: getCoreRowModel(),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/requests");
      const result = await response.json();
      console.log("클라이언트에서 받아온 데이터:", result.requests);

      const timeCounts = result.requests.reduce((acc, request) => {
        const time = `${request.time}교시`;
        if (!acc[time]) {
          acc[time] = 0;
        }
        acc[time]++;
        return acc;
      }, {});

      const transformedData = Object.keys(timeCounts).map((time) => ({
        time,
        teamCount: `${timeCounts[time]}팀`,
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
    fetchData();
  }, []);

  const handleButtonClick = (url) => {
    window.history.back();
  };

  return (
    <FormProvider {...methods}>
      <main className="flex justify-center items-center w-screen h-screen">
        <Card className="min-w-96 grid justify-items-center items-center p-8 m-12 min-h-96">
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
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <Button
            type="button"
            onClick={handleButtonClick("/standard")}
            className="mt-4"
          >
            뒤로
          </Button>
        </Card>
      </main>
    </FormProvider>
  );
}
