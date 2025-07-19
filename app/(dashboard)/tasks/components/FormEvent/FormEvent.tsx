import { z } from 'zod';
import { FormEventProps } from "./FormEvent.type";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    eventName: z.string().min(2, "Event name is required"),
    companyId: z.string().min(1, "Please select a company")
});

export function FormEvent(props: FormEventProps) {
    const { companies, setNewEvent, setOnSaveNewEvent, setOpen } = props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eventName: "",
            companyId: ""
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const selectedCompany = companies.find(c => c.id === values.companyId);

        if (!selectedCompany) return;

        setNewEvent({
            eventName: values.eventName,
            companySelected: {
                id: selectedCompany.id,
                name: selectedCompany.name
            }
        });

        setOpen(false);
        setOnSaveNewEvent(true);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Meeting...' {...field} />
                            </FormControl>
                            <FormDescription>This is your event name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a company" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    Save Event
                </button>
            </form>
        </Form>
    );
}
