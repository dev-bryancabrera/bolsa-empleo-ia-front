// import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Select, SelectContent, SelectTrigger, SelectValue, SelectItem, Input, Popover, PopoverTrigger, PopoverContent, Calendar } from "@/core/components"
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect } from "react";
// import type { CreatePreciosHistoricosRequest } from "../types/PreciosHistoricosTypes";
// import { CalendarIcon } from "lucide-react";
// import { cn } from "@/lib/utils";

// const preciosHistoricosSchema = z.object({
//     idPreciosHistoricos: z.number().optional(),
//     idProductoProveedor: z.number().int().positive("Debes seleccionar un Producto Proveedor"),
//     precio: z.number().int().positive("Debes ingresar el precio"),
//     fechaInicio: z
//         .date()
//         .refine((date) => !!date, {
//             message: "La fecha de Inicio es obligatoria",
//         }),
//     fechaFinalizacion: z
//         .date()
//         .refine((date) => !!date, {
//             message: "La fecha de Finalización es obligatoria",
//         }),
// });

// type FormValues = z.infer<typeof preciosHistoricosSchema>

// interface Props {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     editingPrecioHistorico: CreatePreciosHistoricosRequest | null
//     // productosProveedor: {
//     //     IdUbicacion: number,
//     //     LugarUbicacion: string
//     // }[];
//     onSubmit: (data: FormValues) => void;
// }

// export const PrecioHistoricoDialog = ({ open, onOpenChange, editingPrecioHistorico, /* productosProveedor,  */onSubmit }: Props) => {
//     const {
//         handleSubmit,
//         reset,
//         setValue,
//         watch,
//         register,
//         formState: { errors }
//     } = useForm<FormValues>({
//         resolver: zodResolver(preciosHistoricosSchema),
//         defaultValues: {
//             idPreciosHistoricos: 0,
//             idProductoProveedor: 0,
//             precio: 0,
//             fechaInicio: new Date(),
//             fechaFinalizacion: new Date(),
//         },
//     });

//     // const estado = watch("estado");

//     useEffect(() => {
//         if (open && editingPrecioHistorico) {
//             setValue("idPreciosHistoricos", editingPrecioHistorico.idPreciosHistoricos);
//             setValue("idProductoProveedor", editingPrecioHistorico.idProductoProveedor);
//             setValue("precio", editingPrecioHistorico.precio);
//             setValue("fechaInicio", new Date(editingPrecioHistorico.fechaInicio));
//             setValue("fechaFinalizacion", new Date(editingPrecioHistorico.fechaFinalizacion));
//         } else if (!open) {
//             reset();
//         }
//     }, [open, editingPrecioHistorico, setValue, reset])

//     const handleFormSubmit = handleSubmit((data) => {
//         const formattedData = {
//             ...data,
//             // fechaCreacion: editingPrecioHistorico?.fechaInicio || new Date(),
//         };
//         onSubmit(formattedData);
//         onOpenChange(false);
//     });
//     return (

//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                     <DialogTitle>{editingPrecioHistorico ? "Editar Precio Histórico" : "Nuevo Precio Histórico"}</DialogTitle>
//                     <DialogDescription>
//                         {editingPrecioHistorico
//                             ? "Modifica la información del Precio Histórico"
//                             : "Completa la información para registrar el Precio Histórico"}
//                     </DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleFormSubmit}>
//                     <div className="grid gap-6 py-4">
//                         {/* Información básica */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {/*  <div className="grid gap-2">
//                                 <Label htmlFor="ubicacionOrigenId">Ubicación de Origen *</Label>
//                                 <Select
//                                     value={watch("idProductoProveedor")?.toString() || "none"}
//                                     onValueChange={(value) => {
//                                         if (value !== "none") {
//                                             setValue("idProductoProveedor", parseInt(value));
//                                         }
//                                     }}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Selecciona el proveedor" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="none" disabled>
//                                             Seleccione una ubicación
//                                         </SelectItem>
//                                         {ubicaciones?.map((prov, i) => (
//                                             prov.IdUbicacion !== undefined ? (
//                                                 <SelectItem key={prov.IdUbicacion} value={prov.IdUbicacion.toString()}>
//                                                     {prov.LugarUbicacion}
//                                                 </SelectItem>
//                                             ) : null
//                                         ))}

//                                     </SelectContent>
//                                 </Select>
//                                 {errors.idProductoProveedor && (
//                                     <p className="text-sm text-red-500">{errors.idProductoProveedor.message}</p>
//                                 )}
//                             </div> */}

//                             <div className="grid gap-2">
//                                 <Label htmlFor="precio">Precio *</Label>
//                                 <Input
//                                     id="precio"
//                                     placeholder="Número de Orden"
//                                     {...register("precio")}
//                                 />
//                                 {errors.precio && (
//                                     <p className="text-sm text-red-500">{errors.precio.message}</p>
//                                 )}
//                             </div>

//                             <div className="grid gap-2">
//                                 <Label htmlFor="fecha">Fecha de Inicio *</Label>
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className={cn(
//                                                 "w-full justify-start text-left font-normal",
//                                                 !watch("fechaInicio") && "text-muted-foreground"
//                                             )}
//                                         >
//                                             <CalendarIcon className="mr-2 h-4 w-4" />
//                                             {watch("fechaInicio")
//                                                 ? new Date(watch("fechaInicio")).toISOString().split("T")[0]
//                                                 : "Selecciona una Fecha de Inicio"}
//                                         </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0" align="start">
//                                         <Calendar
//                                             mode="single"
//                                             selected={watch("fechaInicio")}
//                                             onSelect={(date) => date && setValue("fechaInicio", date)}
//                                             disabled={{ before: new Date() }}
//                                         />
//                                     </PopoverContent>
//                                 </Popover>
//                                 {errors.fechaInicio && (
//                                     <p className="text-sm text-red-500">{errors.fechaInicio.message}</p>
//                                 )}
//                             </div>

//                             <div className="grid gap-2">
//                                 <Label htmlFor="fecha">Fecha de Finalización *</Label>
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className={cn(
//                                                 "w-full justify-start text-left font-normal",
//                                                 !watch("fechaFinalizacion") && "text-muted-foreground"
//                                             )}
//                                         >
//                                             <CalendarIcon className="mr-2 h-4 w-4" />
//                                             {watch("fechaFinalizacion")
//                                                 ? new Date(watch("fechaFinalizacion")).toISOString().split("T")[0]
//                                                 : "Selecciona una Fecha de Finalización"}
//                                         </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0" align="start">
//                                         <Calendar
//                                             mode="single"
//                                             selected={watch("fechaFinalizacion")}
//                                             onSelect={(date) => date && setValue("fechaFinalizacion", date)}
//                                             disabled={{ before: new Date() }}
//                                         />
//                                     </PopoverContent>
//                                 </Popover>
//                                 {errors.fechaFinalizacion && (
//                                     <p className="text-sm text-red-500">{errors.fechaFinalizacion.message}</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => onOpenChange(false)}>
//                             Cancelar
//                         </Button>
//                         <Button type="submit">
//                             {editingPrecioHistorico ? "Actualizar" : "Crear"} Precio Histórico
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }
