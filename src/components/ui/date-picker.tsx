
import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps<
  TFieldValues extends FieldValues,
> {
  id?: string
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker<
  TFieldValues extends FieldValues,
>({
  id,
  control,
  name,
  onChange,
  placeholder = "בחר תאריך",
}: DatePickerProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-right font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {field.value ? (
                format(field.value, "dd/MM/yyyy")
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(date) => {
                field.onChange(date)
                if (onChange) {
                  onChange(date)
                }
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    />
  )
}
