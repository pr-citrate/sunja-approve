import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function Home() {
  return (
    <main className="grid justify-items-center items-center w-full h-full">
      <Card className="min-w-80 grid justify-items-center items-center min-h-80">
        <Form>
          <Label>Lorem ipsum</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"}>date</Button>
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
