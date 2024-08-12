"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { zodResolver } from "@hookform/resolvers/zod";
import formSchema from "@/schema";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const router = useRouter();
  const [numApplicant, setNumApplicant] = useState(2);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: "",
      applicant: Array(2).fill({ name: "", number: "" }),
      reason: "",
      contact: "",
      applicantNum: "2",
    },
  });

  const showToast = (message, type) => {
    toast[type](message, {
      style: {
        width: "300px",
        height: "100px",
      },
      position: "top-center",
      autoClose: 3000, // 3초 동안 표시
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClose: () => {
        setIsFormDisabled(false);
        form.reset(); // 폼 초기화
      },
    });
  };

  const onSubmit = async (data) => {
    setIsFormDisabled(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast("제출되었습니다.", "success");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      showToast("제출 실패", "error");
    }
  };

  const handleApplicantNumChange = (value) => {
    setNumApplicant(parseInt(value));
  };

  useEffect(() => {
    form.setValue("applicant", Array(numApplicant).fill({ name: "", number: "" }));
  }, [numApplicant, form]);

  const { isSubmitting } = form.formState;

  return (
    <main className="grid justify-items-center items-center w-full min-h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
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
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting || isFormDisabled}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicantNum"
                render={({ field }) => (
                  <FormItem className="mb-4 w-full">
                    <FormLabel htmlFor="applicant" className="block mb-1">
                      사용 인원
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          handleApplicantNumChange(value);
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                        disabled={isSubmitting || isFormDisabled}
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
                    <FormMessage />
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
                        disabled={isSubmitting || isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
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
                        disabled={isSubmitting || isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AnimatePresence>
                {form.watch("applicant").map((_, i) => (
                  <motion.div
                    className="flex flex-row mb-4 space-y-0 space-x-2"
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name={`applicant[${i}].name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Label htmlFor={`name${i}`} className="block mb-1">
                            {`이름 ${i + 1}${i ? "" : " (대표자)"}`}
                          </Label>
                          <FormControl>
                            <Input
                              id={`name${i}`}
                              placeholder={`이름 ${i + 1}${i ? "" : " (대표자)"}`}
                              type="text"
                              className="text-g"
                              {...field}
                              disabled={isSubmitting || isFormDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`applicant[${i}].number`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Label htmlFor={`id${i}`} className="block mb-1">
                            {`학번 ${i + 1}${i ? "" : " (대표자)"}`}
                          </Label>
                          <FormControl>
                            <Input
                              id={`id${i}`}
                              placeholder={`학번 ${i + 1}${i ? "" : " (대표자)"}`}
                              type="text"
                              className="text-g"
                              {...field}
                              disabled={isSubmitting || isFormDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                type="submit"
                className="text-lg mt-4"
                disabled={isSubmitting || isFormDisabled}
              >
                제출
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/status")}
                className="text-lg mt-4"
                disabled={isSubmitting || isFormDisabled}
              >
                승인 현황
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/statusfalse")}
                className="text-lg mt-4"
                disabled={isSubmitting || isFormDisabled}
              >
                거절 현황
              </Button>
            </form>
          </Form>
        </Card>
      </motion.div>
      <ToastContainer />
    </main>
  );
}
