"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
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

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    id: "approve",
    header: "Approve",
    cell: ({ row }) => {
      return (
        <Button
          onClick={() => {
            alert(
              `${row.original.name} with number ${row.original.number} is approved.`
            );
          }}
        >
          Approve
        </Button>
      );
    },
  },
];

export default function Home() {
  const [password, setPassword] = React.useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
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
      fetchData();
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/requests"); // 서버에서 데이터를 가져오는 API 엔드포인트
      const result = await response.json();
      setData(result.requests); // 서버로부터 받아온 데이터를 상태로 설정
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsPasswordCorrect(false);
  };

  return (
    <FormProvider {...methods}>
      <main className="flex justify-center items-center w-full h-screen">
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
          <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-screen">
            <div className="rounded-md border mb-4">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
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
                    {data.length ? (
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
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <Button type="button" onClick={handleBack} className="mt-4">
              뒤로
            </Button>
          </Card>
        )}
      </main>
    </FormProvider>
  );
}
