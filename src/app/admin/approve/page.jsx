
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleData = [
  { id: 1, user: "John Doe", ip: "192.168.1.1", action: "Login", date: "2024-08-12" },
  { id: 2, user: "Jane Doe", ip: "192.168.1.2", action: "Logout", date: "2024-08-12" },
  // Add more data as needed
];

export default function ApprovePage() {
  const [data, setData] = useState(sampleData);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((entry) =>
    entry.ip.includes(searchTerm) || entry.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Logs</h1>
      <Input placeholder="Search by IP or User" value={searchTerm} onChange={handleSearch} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.id}</TableCell>
              <TableCell>{entry.user}</TableCell>
              <TableCell>{entry.ip}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
