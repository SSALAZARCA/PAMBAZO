import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { AlertCircle } from 'lucide-react';

export interface FormField {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    defaultValue?: string | number;
}

interface FormBuilderProps {
    fields: FormField[];
    onSubmit: (data: Record<string, any>) => void | Promise<void>;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;
    isLoading?: boolean;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
    fields,
    onSubmit,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    onCancel,
    isLoading = false,
}) => {
    const [formData, setFormData] = React.useState<Record<string, any>>({});
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Initialize form data with default values
    React.useEffect(() => {
        const initialData: Record<string, any> = {};
        fields.forEach((field) => {
            if (field.defaultValue !== undefined) {
                initialData[field.name] = field.defaultValue;
            }
        });
        setFormData(initialData);
    }, [fields]);

    const validateField = (field: FormField, value: any): string | null => {
        if (field.required && !value) {
            return `${field.label} es requerido`;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Email inválido';
            }
        }

        if (field.pattern && value) {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
                return `${field.label} no cumple con el formato requerido`;
            }
        }

        if (field.minLength && value && value.length < field.minLength) {
            return `${field.label} debe tener al menos ${field.minLength} caracteres`;
        }

        if (field.maxLength && value && value.length > field.maxLength) {
            return `${field.label} no puede exceder ${field.maxLength} caracteres`;
        }

        if (field.min !== undefined && value < field.min) {
            return `${field.label} debe ser al menos ${field.min}`;
        }

        if (field.max !== undefined && value > field.max) {
            return `${field.label} no puede exceder ${field.max}`;
        }

        return null;
    };

    const handleChange = (field: FormField, value: any) => {
        setFormData((prev) => ({ ...prev, [field.name]: value }));

        // Clear error when user starts typing
        if (errors[field.name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field.name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        fields.forEach((field) => {
            const error = validateField(field, formData[field.name]);
            if (error) {
                newErrors[field.name] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit form
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        id={field.name}
                        name={field.name}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={isLoading}
                    />
                    {errors[field.name] && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors[field.name]}</span>
                        </div>
                    )}
                </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-4">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isLoading ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default FormBuilder;
