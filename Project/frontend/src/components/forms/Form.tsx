'use client';
import React from 'react';
import { FormProvider, useForm, useFormContext, type UseFormReturn, type FieldValues, type DefaultValues, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { cn } from '@/utils/cn';

/* ── Form Wrapper ──────────────────────────────────────── */
interface FormProps<T extends FieldValues> {
  schema?: ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  className?: string;
  id?: string;
}

export function Form<T extends FieldValues>({ schema, defaultValues, onSubmit, children, className, id }: FormProps<T>) {
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...methods}>
      <form id={id} onSubmit={methods.handleSubmit(onSubmit)} className={cn('space-y-4', className)} noValidate>
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
}

/* ── FormInput ─────────────────────────────────────────── */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormInput({ name, label, hint, ...props }: FormInputProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  return <Input label={label} hint={hint} error={error} {...register(name)} {...props} />;
}

/* ── FormSelect ────────────────────────────────────────── */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function FormSelect({ name, label, hint, options, placeholder, ...props }: FormSelectProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  return <Select label={label} hint={hint} error={error} options={options} placeholder={placeholder} {...register(name)} {...props} />;
}

/* ── FormTextarea ──────────────────────────────────────── */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  hint?: string;
}

export function FormTextarea({ name, label, hint, className, ...props }: FormTextareaProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-300">{label}{props.required && <span className="text-emergency-light ml-1">*</span>}</label>}
      <textarea {...register(name)} className={cn('w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all duration-200 min-h-[80px]', error ? 'border-emergency/50' : 'border-white/10 hover:border-white/20', className)} {...props} />
      {error && <p className="text-xs text-emergency-light" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
