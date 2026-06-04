import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { ZodTypeAny } from "zod";
import type { CollectionName, EntityOf } from "./collections";
import type { Density } from "./enums";
import type { PermissionKey } from "./rbac";

export interface FieldOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}
export type OptionsSource = FieldOption[] | (() => FieldOption[]);

/** Declarative form field; FormModal renders any form from a list of these. */
export type FormFieldDef =
  | {
      type: "text" | "email" | "tel" | "textarea" | "number" | "date" | "time" | "password" | "pin";
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      helper?: string;
      col?: 1 | 2;
      min?: number;
      max?: number;
      mono?: boolean;
      disabled?: boolean;
    }
  | {
      type: "select" | "combobox" | "multiselect" | "radio";
      name: string;
      label: string;
      options: OptionsSource;
      required?: boolean;
      helper?: string;
      col?: 1 | 2;
      placeholder?: string;
    }
  | { type: "switch" | "checkbox"; name: string; label: string; helper?: string; col?: 1 | 2 }
  | { type: "rating"; name: string; label: string; col?: 1 | 2 }
  | { type: "file"; name: string; label: string; accept?: string; maxMB?: number; col?: 1 | 2; helper?: string }
  | { type: "section"; label: string }
  | { type: "hidden"; name: string };

export type FieldDefinitionScope = "admission" | "student" | "staff" | "sports" | "leave" | "timetable";

export interface ResourceColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => string | number | boolean | null | undefined;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  mono?: boolean;
  width?: number;
  hideBelow?: "sm" | "md" | "lg";
  defaultHidden?: boolean;
}

export interface FilterDef<T> {
  key: string;
  labelKey: string;
  type: "select" | "multiselect" | "boolean";
  options?: OptionsSource;
  accessor?: (row: T) => string | number | boolean | null | undefined;
}

export interface ActionCtx {
  refresh: () => void;
  navigate: (to: string) => void;
}

export interface RowAction<T> {
  key: string;
  labelKey: string;
  icon?: LucideIcon;
  permission?: PermissionKey;
  variant?: "default" | "destructive";
  show?: (row: T) => boolean;
  onSelect: (row: T, ctx: ActionCtx) => void | Promise<void>;
}

export interface BulkAction<T> {
  key: string;
  labelKey: string;
  icon?: LucideIcon;
  permission?: PermissionKey;
  variant?: "default" | "destructive";
  onSelect: (rows: T[], ctx: ActionCtx) => void | Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;

/** Minimal CRUD service shape every domain service satisfies. */
export interface CrudService<T> {
  list: (filter?: (row: T) => boolean) => Promise<T[]>;
  get: (id: string) => Promise<T | null>;
  create: (input: Partial<T>) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  softDelete: (id: string) => Promise<void>;
}

export interface ResourceConfig<C extends CollectionName = CollectionName> {
  key: string;
  collection: C;
  icon: LucideIcon;
  titleKey: string;
  singularKey: string;
  service: CrudService<EntityOf<C>>;
  columns: ResourceColumn<EntityOf<C>>[];
  searchText?: (row: EntityOf<C>) => string;
  filters?: FilterDef<EntityOf<C>>[];
  defaultSort?: { key: string; desc?: boolean };
  primaryLink?: (row: EntityOf<C>) => string;
  form?: {
    schema?: ZodTypeAny;
    fields: FormFieldDef[];
    dynamicScope?: FieldDefinitionScope;
    defaults?: () => FormValues;
    toEntity?: (values: FormValues) => Partial<EntityOf<C>>;
    fromEntity?: (entity: EntityOf<C>) => FormValues;
    modalSize?: "sm" | "md" | "lg";
  };
  permissions: {
    view?: PermissionKey;
    create?: PermissionKey;
    edit?: PermissionKey;
    delete?: PermissionKey;
    deleteEntity?: string;
    export?: boolean;
  };
  rowActions?: RowAction<EntityOf<C>>[];
  bulkActions?: BulkAction<EntityOf<C>>[];
  exportable?: { excel?: boolean; pdf?: boolean };
  density?: Density;
  emptyHintKey?: string;
}
