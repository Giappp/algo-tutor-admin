import React from 'react'
import {ColumnDef} from "@tanstack/table-core";
import {Tag} from "@/types/tag";

export const columns: ColumnDef<Tag>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "problemsNum",
        header: "Problems",
        cell: ({row}) => {
            const problemsNum = row.original["problemsNum"];
            return <span>{problemsNum}</span>;
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({row}) => {

        }
    }
]