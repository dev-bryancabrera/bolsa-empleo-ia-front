import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/core/components/ui/dialog';
import { toast } from 'react-toastify';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/core/components/ui/select';
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Award, Target, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { CVService } from '@/modules/cv/services/CVService';
import { CVDialog } from '../components/CVDialog';
import { HabilidadService } from '../services/HabilidadService';

export const CVPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const [cvData, setCvData] = useState(null);
    const [habilidades, setHabilidades] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingHabilidad, setIsEditingHabilidad] = useState(false);
    const [currentHabilidad, setCurrentHabilidad] = useState(null);

    // Estados del formulario Habilidad
    const [formHabilidad, setFormHabilidad] = useState({
        nombre: '',
        categoria: '',
        nivel: '',
        anios_experiencia: 0,
    });

    useEffect(() => {
        fetchCVData();
    }, []);

    const fetchCVData = async () => {
        if (authUser?.id) {
            try {
                const data = await CVService.obtenerCVPorUsuario(authUser.id);

                if (!data) {
                    console.warn('El usuario no tiene CV aún');
                    setCvData(null);
                    setHabilidades([]);
                    return;
                }

                if (data?.habilidades) {
                    setHabilidades(data.habilidades);
                }

                setCvData(data);
            } catch (error) {
                console.error("Error cargando datos de persona: ", error);
            }

        }
    };

    const handleSaveCV = async () => {
        fetchCVData();
        setIsModalOpen(false);
    };

    const handleSaveHabilidad = async () => {
        try {
            if (!cvData?.id) {
                toast.error('Debes crear un CV primero');
                return;
            }

            // Validar campos
            if (!formHabilidad.nombre || !formHabilidad.categoria || !formHabilidad.nivel) {
                toast.error('Por favor completa todos los campos');
                return;
            }

            if (currentHabilidad?.id) {
                // Actualizar habilidad existente
                await HabilidadService.actualizarHabilidad(currentHabilidad.id, {
                    nombre: formHabilidad.nombre,
                    categoria: formHabilidad.categoria,
                    nivel: formHabilidad.nivel,
                    anios_experiencia: formHabilidad.anios_experiencia,
                    id_cv: cvData.id
                });
                toast.success('Habilidad actualizada exitosamente');
            } else {
                // Crear nueva habilidad
                await HabilidadService.crearHabilidad({
                    nombre: formHabilidad.nombre,
                    categoria: formHabilidad.categoria,
                    nivel: formHabilidad.nivel,
                    anios_experiencia: formHabilidad.anios_experiencia,
                    id_cv: cvData.id
                });
                toast.success('Habilidad creada exitosamente');
            }

            // Recargar datos y cerrar modal
            await fetchCVData();
            setIsEditingHabilidad(false);
            setCurrentHabilidad(null);
            setFormHabilidad({
                nombre: '',
                categoria: '',
                nivel: '',
                anios_experiencia: 0,
            });
        } catch (error) {
            console.error('Error al guardar habilidad:', error);
            toast.error('Error al guardar la habilidad');
        }
    };

    const handleDeleteHabilidad = async (idHabilidad: number) => {
        try {
            await HabilidadService.eliminarHabilidad(idHabilidad);
            toast.success('Habilidad eliminada exitosamente');
            await fetchCVData();
        } catch (error) {
            console.error('Error al eliminar habilidad:', error);
            toast.error('Error al eliminar la habilidad');
        }
    };

    const getNivelColor = (nivel) => {
        const colores = {
            'Básico': 'bg-blue-100 text-blue-700',
            'Intermedio': 'bg-green-100 text-green-700',
            'Avanzado': 'bg-purple-100 text-purple-700',
            'Experto': 'bg-orange-100 text-orange-700',
        };
        return colores[nivel] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Mi Currículum Vitae 📄
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona tu perfil profesional y destaca tus habilidades
                        </p>
                    </div> {cvData ? (
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="gap-2 bg-yellow-500 hover:bg-yellow-600"
                        >
                            ✏️ Editar CV
                        </Button>
                    ) : ''}

                </div>
            </div>

            {/* Información Principal del CV */}
            {cvData ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">
                                    Años de Experiencia
                                </CardTitle>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {cvData.anios_experiencia || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Experiencia profesional
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">
                                    Nivel de Educación
                                </CardTitle>
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-gray-900 truncate">
                                    {cvData.nivel_educacion || 'No especificado'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Formación académica
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">
                                    Sector Profesional
                                </CardTitle>
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Target className="h-5 w-5 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-gray-900 truncate">
                                    {cvData.sector_profesional || 'No especificado'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Área de especialización
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700">
                                    Habilidades
                                </CardTitle>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Award className="h-5 w-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {habilidades.length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    <span className="text-green-600 font-medium">
                                        Registradas
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Perfil Profesional */}
                    <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                                {cvData.titulo_profesional}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {cvData.resumen_profesional || 'No hay resumen profesional disponible.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Habilidades */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Award className="h-6 w-6 text-purple-600" />
                                    Habilidades Profesionales
                                    {habilidades.length > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                            {habilidades.length}
                                        </span>
                                    )}
                                </CardTitle>
                                <Dialog open={isEditingHabilidad} onOpenChange={setIsEditingHabilidad}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all"
                                            onClick={() => {
                                                setCurrentHabilidad(null);
                                                setFormHabilidad({
                                                    nombre: '',
                                                    categoria: '',
                                                    nivel: '',
                                                    anios_experiencia: 0,
                                                });
                                            }}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Habilidad
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader className="border-b pb-4 bg-gradient-to-r from-orange-50 to-purple-50 -mx-6 -mt-6 px-6 pt-6 mb-4">
                                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    {currentHabilidad ? (
                                                        <Edit2 className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <Plus className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-2xl">
                                                        {currentHabilidad ? 'Editar Habilidad' : 'Nueva Habilidad'}
                                                    </div>
                                                    <p className="text-sm font-normal text-gray-600 mt-1">
                                                        {currentHabilidad
                                                            ? 'Modifica la información de tu habilidad'
                                                            : 'Agrega una nueva habilidad a tu perfil profesional'
                                                        }
                                                    </p>
                                                </div>
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-5 py-4">
                                            {/* Nombre de la Habilidad */}
                                            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 hover:shadow-md transition-shadow">
                                                <CardContent className="pt-2">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                            <Award className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <Label htmlFor="nombre-hab" className="text-base font-semibold text-gray-900">
                                                                Nombre de la Habilidad <span className="text-red-500">*</span>
                                                            </Label>
                                                            <Input
                                                                id="nombre-hab"
                                                                placeholder="ej. React.js, Python, Diseño UX"
                                                                className="text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                                value={formHabilidad.nombre}
                                                                onChange={(e) => setFormHabilidad({ ...formHabilidad, nombre: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Categoría */}
                                            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 hover:shadow-md transition-shadow">
                                                <CardContent className="pt-2">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                            <Briefcase className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <Label htmlFor="categoria-hab" className="text-base font-semibold text-gray-900">
                                                                Categoría <span className="text-red-500">*</span>
                                                            </Label>
                                                            <Input
                                                                id="categoria-hab"
                                                                placeholder="ej. Frontend, Backend, Diseño, Marketing"
                                                                className="text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                                value={formHabilidad.categoria}
                                                                onChange={(e) => setFormHabilidad({ ...formHabilidad, categoria: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Nivel y Años */}
                                            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 hover:shadow-md transition-shadow">
                                                <CardContent className="pt-2">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                            <TrendingUp className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <h3 className="text-base font-semibold text-gray-900">Nivel de Dominio</h3>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {/* Nivel */}
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="nivel-hab" className="text-sm font-medium">
                                                                        Nivel <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <Select
                                                                        value={formHabilidad.nivel || 'none'}
                                                                        onValueChange={(value) => {
                                                                            if (value !== 'none') {
                                                                                setFormHabilidad({ ...formHabilidad, nivel: value });
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                                            <SelectValue placeholder="Selecciona el nivel" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="none" disabled>Selecciona un nivel</SelectItem>
                                                                            <SelectItem value="Básico">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                                    <span>Básico</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="Intermedio">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                                    <span>Intermedio</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="Avanzado">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                                                                    <span>Avanzado</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                            <SelectItem value="Experto">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                                                    <span>Experto</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {/* Años de Experiencia */}
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="anios-hab" className="text-sm font-medium">
                                                                        Años de Experiencia <span className="text-red-500">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        id="anios-hab"
                                                                        type="number"
                                                                        min="0"
                                                                        max="50"
                                                                        placeholder="0"
                                                                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                        value={formHabilidad.anios_experiencia}
                                                                        onChange={(e) => setFormHabilidad({
                                                                            ...formHabilidad,
                                                                            anios_experiencia: parseInt(e.target.value) || 0
                                                                        })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <DialogFooter className="border-t pt-4 mt-4 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditingHabilidad(false);
                                                    setCurrentHabilidad(null);
                                                    setFormHabilidad({
                                                        nombre: '',
                                                        categoria: '',
                                                        nivel: '',
                                                        anios_experiencia: 0,
                                                    });
                                                }}
                                                className="hover:bg-gray-100"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleSaveHabilidad}
                                                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 gap-2 shadow-md hover:shadow-lg transition-all"
                                            >
                                                {currentHabilidad ? (
                                                    <>
                                                        <Edit2 className="h-4 w-4" />
                                                        Actualizar Habilidad
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4" />
                                                        Guardar Habilidad
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {habilidades.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {habilidades.map((habilidad) => (
                                        <Card
                                            key={habilidad.id}
                                            className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white"
                                        >
                                            <CardContent className="pt-5 pb-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                            {habilidad.nombre}
                                                        </h4>
                                                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">
                                                            {habilidad.categoria}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 hover:bg-blue-50 rounded-lg transition-colors"
                                                            onClick={() => {
                                                                setCurrentHabilidad(habilidad);
                                                                setFormHabilidad(habilidad);
                                                                setIsEditingHabilidad(true);
                                                            }}
                                                        >
                                                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 hover:bg-red-50 rounded-lg transition-colors"
                                                            onClick={() => handleDeleteHabilidad(habilidad.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mt-4">
                                                    <Badge className={`${getNivelColor(habilidad.nivel)} border-0 shadow-sm px-3 py-1`}>
                                                        <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                                                        {habilidad.nivel}
                                                    </Badge>

                                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {habilidad.anios_experiencia} {habilidad.anios_experiencia === 1 ? 'año' : 'años'} de experiencia
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                                    <CardContent className="py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Award className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium mb-1">No has agregado habilidades aún</p>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Agrega tus habilidades profesionales para destacar tu perfil
                                        </p>
                                        <Button
                                            onClick={() => setIsEditingHabilidad(true)}
                                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Agregar Primera Habilidad
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="text-center py-16">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Aún no has creado tu CV
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Crea tu currículum profesional y destaca tus habilidades para conseguir mejores oportunidades laborales
                        </p>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-700"
                            size="lg"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Mi Currículum
                        </Button>
                    </CardContent>
                </Card>
            )}

            <CVDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingCV={cvData}
                habilidadesIniciales={habilidades}
                onSubmit={handleSaveCV}
            />
        </div>
    );
};