"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [numApplicant, setNumApplicant] = useState(2);
  const [submitStatus, setSubmitStatus] = useState("");
  const form = useForm();

  const onSubmit = async (data) => {
    console.log("Submitting data:", data); // 폼 데이터를 콘솔에 출력

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Data submitted successfully:", result);
      setSubmitStatus("제출 완료");
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmitStatus("제출 실패");
    }
  };

  return (
    <main className="grid justify-items-center items-center w-full min-h-full">
      <Card className="min-w-screen grid justify-items-center items-center p-8 m-12 min-h-96">
        <Form {...form}>
          <form
            className="w-full h-full flex flex-col items-center justify-center"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Label className="text-xl mb-4">순자증 신청</Label>
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="mb-4 w-full">
                  <FormLabel htmlFor="time" className="block mb-1">
                    사용 시간
                  </FormLabel>
                  <FormControl>
                    <Select
                      id="time"
                      className="text-lg w-full"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
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
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicant"
              render={({ field }) => (
                <FormItem className="mb-4 w-full">
                  <FormLabel htmlFor="applicant" className="block mb-1">
                    사용 인원
                  </FormLabel>
                  <FormControl>
                    <Select
                      id="applicant"
                      className="text-lg w-full"
                      onValueChange={(value) => {
                        setNumApplicant(parseInt(value));
                        field.onChange(value);
                      }}
                      value={field.value}
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
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="mb-4 w-full">
                  <FormLabel htmlFor="reason" className="block mb-1">
                    사유
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="reason"
                      placeholder="사유"
                      type="text"
                      className="text-g w-full"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem className="mb-4 w-full">
                  <Label htmlFor="contact" className="block mb-1">
                    전화번호 (대표자)
                  </Label>
                  <FormControl>
                    <Input
                      id="contact"
                      placeholder="전화번호 (대표자)"
                      type="tel"
                      className="text-g w-full"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <AnimatePresence>
              {[...Array(numApplicant)].map((_, i) => {
                const number = `${i + 1}${i ? "" : " (대표자)"}`;
                return (
                  <motion.div
                    className="flex flex-row mb-4 space-y-0 space-x-2"
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <FormField
                      control={form.control}
                      name={`applicant[${i}].name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Label htmlFor={`name${i}`} className="block mb-1">
                            {`이름 ${number}`}
                          </Label>
                          <FormControl>
                            <Input
                              id={`name${i}`}
                              placeholder={`이름 ${number}`}
                              type="text"
                              className="text-g"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`applicant[${i}].number`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Label htmlFor={`id${i}`} className="block mb-1">
                            {`학번 ${number}`}
                          </Label>
                          <FormControl>
                            <Input
                              id={`id${i}`}
                              placeholder={`학번 ${number}`}
                              type="text"
                              className="text-g"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <Button type="submit" className="text-lg mt-4">
              제출
            </Button>
            {submitStatus && <p className="mt-4 text-lg">{submitStatus}</p>}
          </form>
        </Form>
      </Card>
    </main>
  );
}
