"use client"

import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormContactProps } from "./FormContact.types";
import { useForm } from 'react-hook-form';
import { formSchema } from "./FormContact.form";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export function FormContact(props: FormContactProps) {
    const { setOpen, companyId, onContactCreated  } = props;
    const params = useParams<{ companyId: string }>();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "",
            phone: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            console.log(params.companyId);
            const response = await axios.post(`/api/companies/${params.companyId}/contact`, values);
            toast("Success", {
                description: "Contact created!",
            });

            onContactCreated(response.data);            
            setOpen(false);
            form.reset();
        }
        catch(error){
            toast("Destructive", {
                description: "There was an error!",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="md:grid-cols-2 grid gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre y apellido..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="+11 6666..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the role" />                                        
                                    </SelectTrigger>                                    
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Comercial"> Comercial </SelectItem>
                                    <SelectItem value="CEO"> CEO </SelectItem>
                                    <SelectItem value="Analytics"> Analytics </SelectItem>
                                </SelectContent>
                                <FormMessage />
                            </Select>
                        </FormItem>
                    )}
                />

                <Button type="submit">Save Contact</Button>
            </form>
        </Form>
    )
}
