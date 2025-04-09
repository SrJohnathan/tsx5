import {useState} from "../state";


type FormState<T> = {
    values: () => T;
    handleChange: (field: keyof T, value: any) => void;
    handleSubmit: (callback: (values: T) => void) => (event: Event) => void;
};

export function useForm<T extends Record<string, any>>(initialValues: T): FormState<T> {
    const [values, setValues] = useState<T>(initialValues);

    const handleChange = (field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (callback: (values: T) => void) => (event: Event) => {
        event.preventDefault();
        callback(values());
    };

    return { values, handleChange, handleSubmit };
}
