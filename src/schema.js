import { z } from "zod";

const applicantSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  number: z.string().min(1, "학번을 입력하세요"),
});

const formSchema = z.object({
  time: z.string().min(1, "사용 시간을 선택하세요"),
  applicant: z.array(applicantSchema).min(3, "사용 인원을 선택하세요"),
  reason: z.string().min(1, "사유를 입력하세요"),
  contact: z.string().min(1, "대표자 전화번호를 입력하세요"),
});

export default formSchema;
