import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="grid justify-items-center items-center w-full h-full">
      <Card className="min-w-80 grid justify-items-center items-center min-h-80">
        <Form>
          <Label>Lorem ipsum</Label>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time</SelectLabel>
                <SelectItem value="1">time 1</SelectItem>
                <SelectItem value="2">time 2</SelectItem>
                <SelectItem value="3">time 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input placeholder="reason" type="text" />
          <Input placeholder="tel" type="tel" />

          <div className="flex flex-row">
            <Input placeholder="name" type="text" />
            <Input placeholder="number" type="text" />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar mode="single" />
            </PopoverContent>
          </Popover>

          <Button type="submit">Submit</Button>
        </Form>
      </Card>
    </main>
  );
}
