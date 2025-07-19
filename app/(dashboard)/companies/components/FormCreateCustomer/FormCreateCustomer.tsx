"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FormCreateCustomerProps } from "./FormCreateCustomer.type"
import { useState } from "react"
import { UploadButton } from "@/utils/uploadthing"
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2).max(50),
    country: z.string().min(2),
    website: z.string().min(2),
    phone: z.string().min(6),
    cif: z.string().min(6),
    profileImage: z.string()
})

export function FormCreateCustomer(props: FormCreateCustomerProps) {
    const { setOpenModalCreate, onCreated } = props;
    const router = useRouter();
    const [photoUploaded, setPhotoUploaded] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),       
        defaultValues: {
            name: "",
            country: "",
            website: "",
            phone: "",
            cif: "",
            profileImage: ""
        },
    });

    const { isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/company", values);
            toast("Company", {
                description: "Company created",
            });
            //router.refresh();
            setOpenModalCreate(false);
            onCreated();
        }
        catch (error) {
            toast("Something went wrong", {
                description: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Company Name..." type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tje country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="argentina">Argentina</SelectItem>
                                        <SelectItem value="españa">España</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input placeholder="wwww.website.com..." type="text" {...field} />
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
                                    <Input placeholder="+54 11 5555 5555" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cif"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CIF</FormLabel>
                                <FormControl>
                                    <Input placeholder="1623" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="profileImage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Image</FormLabel>
                                <FormControl>
                                    {photoUploaded ? (
                                        <p className="text-sm">Image uploaded!</p>
                                    ) : (
                                        <UploadButton
                                            className="bg-slate-600/20 text-slate-800rounded-lg outline-dotted outline-3"
                                            {...field}
                                            endpoint="profileImage"
                                            onClientUploadComplete={(res) => {
                                                if (res && res.length > 0) {
                                                    const url = res[0].url;
                                                    form.setValue("profileImage", url); // ✅ Actualiza el campo del form
                                                    setPhotoUploaded(true);
                                                    toast("Photo", {
                                                        description: "Photo uploaded!",
                                                    });
                                                }
                                            }}
                                            onUploadError={(error: Error) => {
                                                // Do something with the error.
                                                toast("Photo", {
                                                    description: "Error uploading photo",
                                                })
                                            }}
                                        />
                                    )
                                    }

                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={!isValid}>Submit</Button>
            </form>
        </Form>
    )
}
