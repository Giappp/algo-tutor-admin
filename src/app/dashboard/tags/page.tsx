"use client"
import {columns} from "./columns"
import {DataTable} from "./data-table"
import {useAdminTags} from "@/hooks/use-tags"
import {CreateTagDialog} from "@/components/tags/create-tag-dialog"

export default function AdminTagPage() {
    const {data: tags, isLoading} = useAdminTags()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                    <p className="text-muted-foreground">Manage your problem tags.</p>
                </div>
                <CreateTagDialog/>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    Loading tags...
                </div>
            ) : (
                <DataTable columns={columns} data={tags || []}/>
            )}
        </div>
    )
}
