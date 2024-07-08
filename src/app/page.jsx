"use client";

import { useRef, useState } from 'react';
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

const Home = () => {
  const numParticipantsRef = useRef(2); 
  const [update, setUpdate] = useState(false); 

  const handleNumParticipantsChange = (value) => {
    const numParticipants = parseInt(value);
    if (!isNaN(numParticipants)) {
      if (numParticipants === 2 || numParticipants === 3 || numParticipants === 4 || numParticipants === 5) {
        numParticipantsRef.current = numParticipants;
        setUpdate(!update); 
      }
    }
  };

  const renderStudentInputs = () => {
    let inputs = [];
    inputs.push(
      <div className="flex flex-row mb-4" key="representative">
        <div className="mr-2 flex-1">
          <Label htmlFor="representativeName" className="block mb-1">대표자 이름</Label>
          <Input id="representativeName" placeholder="대표자 이름" type="text" className="text-lg" />
        </div>
        <div className="flex-1">
          <Label htmlFor="representativeId" className="block mb-1">대표자 학번</Label>
          <Input id="representativeId" placeholder="대표자 학번" type="text" className="text-lg" />
        </div>
      </div>
    );

    for (let i = 1; i < numParticipantsRef.current; i++) {
      inputs.push(
        <div className="flex flex-row mb-4" key={i}>
          <div className="mr-2 flex-1">
            <Label htmlFor={`name${i}`} className="block mb-1">{`이름 ${i}`}</Label>
            <Input id={`name${i}`} placeholder={`이름 ${i}`} type="text" className="text-lg" />
          </div>
          <div className="flex-1">
            <Label htmlFor={`id${i}`} className="block mb-1">{`학번 ${i}`}</Label>
            <Input id={`id${i}`} placeholder={`학번 ${i}`} type="text" className="text-lg" />
          </div>
        </div>
      );
    }
    return inputs;
  };

  return (
    <main className="grid justify-items-center items-center w-full h-full">
      <Card className="min-w-screen grid justify-items-center items-center min-h-screen p-8">
        <Form>
          <Label className="text-xl mb-4">순자증 신청</Label>
          <div className="mb-4 w-full">
            <Label htmlFor="time" className="block mb-1">사용 시간</Label>
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
            <Label htmlFor="participants" className="block mb-1">사용 인원</Label>
            <Select id="participants" className="text-lg w-full" onValueChange={(value) => handleNumParticipantsChange(value)}>
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
            <Label htmlFor="reason" className="block mb-1">사유</Label>
            <Input id="reason" placeholder="사유" type="text" className="text-lg w-full" />
          </div>
          <div className="mb-4 w-full">
            <Label htmlFor="phone" className="block mb-1">대표자 전화번호</Label>
            <Input id="phone" placeholder="대표자 전화번호" type="tel" className="text-lg w-full" />
          </div>

          {renderStudentInputs()}

          <Button type="submit" className="text-lg mt-4">Submit</Button>
        </Form>
      </Card>
    </main>
  );
};

export default Home;
