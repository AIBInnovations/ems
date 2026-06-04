import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { db } from "@/data/db";
import type { FieldDefinitionScope, FormFieldDef, FormValues, OptionsSource } from "@/types";

export interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
  defaultValues?: FormValues;
  dynamicScope?: FieldDefinitionScope;
  size?: "sm" | "md" | "lg";
  onSubmit: (values: FormValues) => Promise<void> | void;
}

const SIZE: Record<NonNullable<FormModalProps["size"]>, string> = {
  sm: "sm:max-w-[480px]",
  md: "sm:max-w-[600px]",
  lg: "sm:max-w-[760px]",
};

function opts(source: OptionsSource) {
  return typeof source === "function" ? source() : source;
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
  schema,
  defaultValues,
  dynamicScope,
  size = "md",
  onSubmit,
}: FormModalProps) {
  const { t } = useTranslation();

  const dynamicFields = useMemo<FormFieldDef[]>(() => {
    if (!dynamicScope) return [];
    return db
      .query("fieldDefinitions", (f) => f.scope === dynamicScope)
      .sort((a, b) => a.order - b.order)
      .map((f): FormFieldDef => {
        const name = `extra.${f.key}`;
        if (f.type === "select")
          return { type: "select", name, label: f.label, required: f.required, options: (f.options ?? []).map((o) => ({ value: o, label: o })) };
        if (f.type === "checkbox") return { type: "switch", name, label: f.label };
        if (f.type === "number") return { type: "number", name, label: f.label, required: f.required };
        if (f.type === "date") return { type: "date", name, label: f.label, required: f.required };
        if (f.type === "file") return { type: "file", name, label: f.label };
        return { type: "text", name, label: f.label, required: f.required };
      });
  }, [dynamicScope]);

  const allFields = useMemo(() => [...fields, ...dynamicFields], [fields, dynamicFields]);

  const form = useForm<FieldValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues ?? {},
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset(defaultValues ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  const errorFor = (name: string) => {
    const parts = name.split(".");
    let cur: unknown = form.formState.errors;
    for (const p of parts) cur = (cur as Record<string, unknown>)?.[p];
    return (cur as { message?: string } | undefined)?.message;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZE[size], "max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {allFields.map((field) => {
            if (field.type === "section") {
              return (
                <div key={field.label} className="col-span-full mt-1 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </div>
              );
            }
            if (field.type === "hidden") return null;
            const span = field.col === 2 || field.type === "textarea" ? "sm:col-span-2" : "";
            const err = errorFor(field.name);
            return (
              <div key={field.name} className={cn("space-y-1.5", span)}>
                <Label htmlFor={field.name} className="flex items-center gap-1">
                  {field.label}
                  {"required" in field && field.required ? <span className="text-destructive">*</span> : null}
                </Label>
                <FieldControl field={field} form={form} />
                <div className="min-h-[16px] text-xs text-destructive">{err}</div>
              </div>
            );
          })}

          <DialogFooter className="col-span-full">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("action.cancel", "Cancel")}</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("action.save", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldControl({ field, form }: { field: FormFieldDef; form: ReturnType<typeof useForm> }) {
  switch (field.type) {
    case "textarea":
      return <Textarea id={field.name} placeholder={field.placeholder} {...form.register(field.name)} />;
    case "number":
      return <Input id={field.name} type="number" placeholder={field.placeholder} {...form.register(field.name, { valueAsNumber: true })} />;
    case "date":
      return <Input id={field.name} type="date" {...form.register(field.name)} />;
    case "time":
      return <Input id={field.name} type="time" {...form.register(field.name)} />;
    case "password":
    case "pin":
      return <Input id={field.name} type="password" placeholder={field.placeholder} {...form.register(field.name)} />;
    case "file":
      return <Input id={field.name} type="file" accept={field.accept} className="cursor-pointer file:cursor-pointer" />;
    case "select":
    case "combobox":
      return (
        <Controller
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <Select value={f.value ?? ""} onValueChange={f.onChange}>
              <SelectTrigger id={field.name}><SelectValue placeholder={field.placeholder ?? "Select…"} /></SelectTrigger>
              <SelectContent>
                {opts(field.options).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      );
    case "radio":
      return (
        <Controller
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <RadioGroup value={f.value} onValueChange={f.onChange} className="flex flex-wrap gap-4 pt-1">
              {opts(field.options).map((o) => (
                <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value={o.value} /> {o.label}
                </label>
              ))}
            </RadioGroup>
          )}
        />
      );
    case "switch":
    case "checkbox":
      return (
        <Controller
          control={form.control}
          name={field.name}
          render={({ field: f }) => <Switch checked={!!f.value} onCheckedChange={f.onChange} />}
        />
      );
    case "rating":
      return (
        <Controller
          control={form.control}
          name={field.name}
          render={({ field: f }) => (
            <div className="flex items-center gap-3 pt-1">
              <Slider min={1} max={5} step={1} value={[f.value ?? 3]} onValueChange={(v) => f.onChange(v[0])} className="max-w-[160px]" />
              <span className="font-mono text-sm tabular-nums">{f.value ?? 3} / 5</span>
            </div>
          )}
        />
      );
    case "multiselect":
      return (
        <Controller
          control={form.control}
          name={field.name}
          render={({ field: f }) => {
            const value: string[] = Array.isArray(f.value) ? f.value : [];
            return (
              <div className="flex flex-wrap gap-2 pt-1">
                {opts(field.options).map((o) => {
                  const on = value.includes(o.value);
                  return (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => f.onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
                      className={cn("rounded-full border px-3 py-1 text-sm transition-colors", on ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
      );
    case "section":
    case "hidden":
      return null;
    default:
      return <Input id={field.name} type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"} placeholder={field.placeholder} {...form.register(field.name)} />;
  }
}
