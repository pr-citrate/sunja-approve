"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [numParticipants, setNumParticipants] = useState(2);

  return (
    <main className="grid justify-items-center items-center w-full h-full">
      <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-screen">
        <Form>
          <Label className="text-xl mb-4">순자증 신청</Label>
          <div className="mb-4 w-full">
            <Label htmlFor="time" className="block mb-1">
              사용 시간
            </Label>
            <Select id="time" className="text-lg w-full">
              <SelectTrigger>
                <SelectValue placeholder="사용 시간" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>시간</SelectLabel>
                  <SelectItem value="1">야자 1교시</SelectItem>
                  <SelectItem value="2">야자 2교시</SelectItem>
                  <SelectItem value="3">야자 3교시</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 w-full">
            <Label htmlFor="participants" className="block mb-1">
              사용 인원
            </Label>
            <Select
              id="participants"
              className="text-lg w-full"
              onValueChange={(value) => setNumParticipants(parseInt(value))}
            >
              <SelectTrigger className="outline-none">
                <SelectValue placeholder="사용 인원" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>인원</SelectLabel>
                  <SelectItem value="2">2명</SelectItem>
                  <SelectItem value="3">3명</SelectItem>
                  <SelectItem value="4">4명</SelectItem>
                  <SelectItem value="5">5명</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 w-full">
            <Label htmlFor="reason" className="block mb-1">
              사유
            </Label>
            <Input
              id="reason"
              placeholder="사유"
              type="text"
              className="text-g w-full"
            />
          </div>
          <div className="mb-4 w-full">
            <Label htmlFor="phone" className="block mb-1">
              전화번호 (대표자)
            </Label>
            <Input
              id="phone"
              placeholder="전화번호 (대표자)"
              type="tel"
              className="text-g w-full"
            />
          </div>

          {[...Array(numParticipants)].map((_, i) => {
            const number = `${i + 1}${i ? "" : " (대표자)"}`;
            return (
              <div className="flex flex-row mb-4" key={i}>
                <div className="mr-2 flex-1">
                  <Label htmlFor={`name${i}`} className="block mb-1">
                    {`이름 ${number}`}
                  </Label>
                  <Input
                    id={`name${i}`}
                    placeholder={`이름 ${number}`}
                    type="text"
                    className="text-g"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`id${i}`} className="block mb-1">
                    {`학번 ${number}`}
                  </Label>
                  <Input
                    id={`id${i}`}
                    placeholder={`학번 ${number}`}
                    type="text"
                    className="text-g"
                  />
                </div>
              </div>
            );
          })}

          <Button type="submit" className="text-lg mt-4">
            제출
          </Button>
        </Form>
      </Card>
    </main>
  );
}
