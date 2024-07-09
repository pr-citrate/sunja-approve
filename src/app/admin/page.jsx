"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "000000") {
      setIsPasswordCorrect(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="grid justify-items-center items-center w-full h-full">
      {isPasswordCorrect || (
        <Form onSubmit={handlePasswordSubmit}>
          <Label htmlFor="password" className="text-xl mb-4">
            Enter Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 text-lg w-80"
          />
          <Button type="submit" className="text-lg mt-4">
            Submit
          </Button>
        </Form>
      )}
      <Card className="min-w-96 grid justify-items-center items-center p-8 m-12 min-h-96"></Card>
    </main>
  );
}
