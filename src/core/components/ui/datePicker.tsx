import * as React from "react"
import { Calendar } from "@/core/components/ui/calendar"
import { Field, FieldLabel } from "@/core/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/core/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/core/components/ui/popover"
import { CalendarIcon } from "lucide-react"

interface DatePickerInputProps {
    label?: string
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    name?: string
}

function formatDate(date: Date | undefined) {
    if (!date) return ""

    return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

export function DatePickerInput({
    label,
    value,
    onChange,
    placeholder = "Seleccionar fecha",
    name,
}: DatePickerInputProps) {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(value)
    const [inputValue, setInputValue] = React.useState(formatDate(value))

    React.useEffect(() => {
        setInputValue(formatDate(value))
        setMonth(value)
    }, [value])

    return (
        <Field className="w-full">
            {label && <FieldLabel>{label}</FieldLabel>}

            <InputGroup>
                <InputGroupInput
                    name={name}
                    value={inputValue}
                    placeholder={placeholder}
                    readOnly
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />

                <InputGroupAddon align="inline-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Seleccionar fecha"
                            >
                                <CalendarIcon />
                            </InputGroupButton>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            sideOffset={8}
                        >
                            <Calendar
                                mode="single"
                                selected={value}
                                month={month}
                                onMonthChange={setMonth}
                                captionLayout="dropdown"
                                fromYear={1950}
                                toYear={new Date().getFullYear()}
                                onSelect={(date) => {
                                    onChange?.(date)
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}
