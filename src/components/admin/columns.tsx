
import { ColumnDef } from "@tanstack/react-table";
import { FormData } from "@/types/mentalPrep";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const columns: ColumnDef<FormData>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm" onClick={() => console.log(row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "selectedStates",
    header: "מצבים מנטליים",
    cell: ({ row }) => {
      const states = row.getValue("selectedStates") as string[];
      return states.join(", ");
    },
  },
  {
    accessorKey: "gameType",
    header: "סוג משחק",
    cell: ({ row }) => {
      const gameTypes = {
        league: "ליגה",
        cup: "גביע",
        friendly: "ידידות",
        other: "אחר",
      };
      return gameTypes[row.getValue("gameType") as keyof typeof gameTypes] || row.getValue("gameType");
    },
  },
  {
    accessorKey: "opposingTeam",
    header: "קבוצה יריבה",
  },
  {
    accessorKey: "matchDate",
    header: "תאריך משחק",
  },
  {
    accessorKey: "fullName",
    header: "שם שחקן",
  }
];
