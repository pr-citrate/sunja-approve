"use client";

import * as React from "react";
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
} from "@tanstack/react-table";

const initialData = [
  { id: 1, name: "윤석영", count: 2 },
  { id: 2, name: "안채헌", count: 3 },
];

const columns = [
  {
    accessorKey: "id",
    header: "신청 목록",
  },
  {
    accessorKey: "name",
    header: "대표자 이름",
  },
  {
    accessorKey: "count",
    header: "총 인원",
  },
  {
    id: "approve",
    header: "확인",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            alert(
              `${row.original.name} 외 ${
                row.original.count - 1
              }명 신청 확인 되었습니다.`
            );
          }}
        >
          신청 확인
        </Button>
      );
    },
  },
];

export default function Home() {
  const [password, setPassword] = React.useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = React.useState(false);
  const [data] = React.useState(initialData);
  const methods = useForm();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "000000") {
      setIsPasswordCorrect(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleBack = () => {
    setIsPasswordCorrect(false);
  };

  return (
    <FormProvider {...methods}>
      <main className="flex justify-center items-center w- h-screen">
        {!isPasswordCorrect ? (
          <Card className="w-96 grid justify-items-center items-center p-8">
            <form
              onSubmit={handlePasswordSubmit}
              className="w-full grid justify-items-center"
            >
              <Label htmlFor="password" className="text-xl mb-4">
                Enter Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4 text-lg w-full"
              />
              <Button type="submit" className="text-lg mt-4 w-full">
                로그인
              </Button>
            </form>
          </Card>
        ) : (
          <>
            <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-screen">
              <div className="rounded-md border mb-4">
                <Table>
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
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
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
                      ))
                    ) : (
                      <TableRow></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" onClick={handleBack} className="mt-4">
                뒤로
              </Button>
            </Card>
          </>
        )}
      </main>
    </FormProvider>
  );
}
