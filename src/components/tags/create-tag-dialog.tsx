"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import z from "zod";

import {useCreateTag} from "@/hooks/use-tags";
import {toAppError} from "@/api/core/api-error";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";

import {Loader2Icon, PlusIcon} from "lucide-react";

const createTagSchema = z.object({
    name: z.string().min(1, "Tag name is required").max(50, "Tag name must be 50 characters or less"),
});

type CreateTagData = z.infer<typeof createTagSchema>;

export function CreateTagDialog() {
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<CreateTagData>({
        resolver: zodResolver(createTagSchema),
        defaultValues: {
            name: "",
        },
    });

    const createTag = useCreateTag();

    const onSubmit = (data: CreateTagData) => {
        setServerError(null);
        createTag.mutate(data.name, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            onError: (err) => {
                setServerError(toAppError(err).message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button>
                    <PlusIcon className="w-4 h-4 mr-2"/>
                    New Tag
                </Button>
            }/>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Tag</DialogTitle>
                        <DialogDescription>
                            Create a new tag to categorize problems.
                        </DialogDescription>
                    </DialogHeader>

                    {serverError && (
                        <div className="p-3 my-4 text-sm rounded-md bg-destructive/15 text-destructive">
                            {serverError}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input
                                placeholder="e.g. Dynamic Programming"
                                aria-invalid={!!errors.name}
                                disabled={createTag.isPending}
                                {...register("name")}
                            />
                            {errors.name && <FieldError>{errors.name.message}</FieldError>}
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}
                                disabled={createTag.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createTag.isPending}>
                            {createTag.isPending && <Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
