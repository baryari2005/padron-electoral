import { useRouter } from "next/navigation";
import { CompanyFormProps } from "./CompanyForm.type";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { formSchema } from "./CompanyForm.form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadButton } from "@/utils/uploadthing"
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";

export function CompanyForm(props: CompanyFormProps) {
    const { company } = props;
    const router = useRouter();
    const [photoUploaded, setPhotoUploaded] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: company.name,
            description: company.description,
            country: company.country ?? "",
            website: company.website ?? "",
            phone: company.phone ?? "",
            cif: company.cif ?? "",
            profileImage: company.profileImage ?? "/images/default-company.png"
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/companies/${company.id}`, values);
            toast("Success", {
                description: "Company Updated!",
            });
            router.refresh();
        }
        catch (error) {
            console.log(error);
            toast("Destructive", {
                description: "Something went wrong!",
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
                                <FormLabel>Company name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Company name..." type="text" {...field} />
                                </FormControl>
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
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
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
                                    <Input placeholder="website..." type="text" {...field} />
                                </FormControl>
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
                                    <Input placeholder="4444..." type="text" {...field} />
                                </FormControl>
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
                                    <Input placeholder="cif..." type="text" {...field} />
                                </FormControl>
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
                                    <div>
                                        {
                                            photoUploaded ? (
                                                <p className="text-sm">Image uploaded</p>
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
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Company Description..."
                                        {...field}
                                        value={form.getValues().description ?? ''} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Edit company</Button>
            </form>
        </Form>
    )
}
