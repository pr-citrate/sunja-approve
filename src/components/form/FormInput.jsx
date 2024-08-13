
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/router";

export default function FormInput({ form, id, name, isSubmitting, isFormDisabled }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000)); // Replace with actual submission logic
    setLoading(false);
    router.push('/success'); // Redirect to success page
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem className="mb-4 w-full">
            <FormLabel htmlFor={id} className="block mb-1">
              {name}
            </FormLabel>
            <FormControl>
              <Input {...field} id={id} disabled={isFormDisabled || loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {loading && <div className="spinner"></div>} {/* Spinner shown during submission */}
    </form>
  );
}
