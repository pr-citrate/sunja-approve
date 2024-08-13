import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function FormInput({ form, id, name, isSubmitting, isFormDisabled }) {
  return (
    <FormField
      control={form.control}
      name="reason"
      render={({ field }) => (
        <FormItem className="mb-4 w-full">
          <FormLabel htmlFor={id} className="block mb-1">
            {name}
          </FormLabel>
          <FormControl>
            <Input
              id={id}
              placeholder={name}
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
  );
}
