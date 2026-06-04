import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { FormModal } from "./FormModal";
import { useDialogs } from "./dialogs";
import { useResourceList } from "@/hooks/useResource";
import { useCan } from "@/lib/rbac";
import type { CollectionName, EntityOf, FormValues, ResourceConfig } from "@/types";

export interface ResourceListPageProps<C extends CollectionName> {
  config: ResourceConfig<C>;
  title?: string;
  description?: string;
  scope?: (row: EntityOf<C>) => boolean;
  /** Force read-only regardless of permissions (e.g. a viewer role). */
  readOnly?: boolean;
  headerActions?: ReactNode;
}

export function ResourceListPage<C extends CollectionName>({
  config,
  title,
  description,
  scope,
  readOnly,
  headerActions,
}: ResourceListPageProps<C>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const { requestDelete } = useDialogs();
  const { data, loading, refresh } = useResourceList(config.service, scope);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EntityOf<C> | null>(null);

  const p = config.permissions;
  const canCreate = !readOnly && !!p.create && can({ permission: p.create });
  const canEdit = !readOnly && !!p.edit && can({ permission: p.edit });
  const canDelete = !readOnly && !!p.delete && can({ permission: p.delete, deleteEntity: p.deleteEntity });
  const Icon = config.icon;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row: EntityOf<C>) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    const payload = config.form?.toEntity ? config.form.toEntity(values) : (values as Partial<EntityOf<C>>);
    if (editing) {
      await config.service.update(editing.id, payload);
      toast.success(t("toast.updated", "Updated successfully"));
    } else {
      await config.service.create(payload);
      toast.success(t("toast.created", "Created successfully"));
    }
    refresh();
  };

  const askDelete = (row: EntityOf<C>) => {
    const label = config.form?.fromEntity ? title ?? config.key : "";
    requestDelete({
      label: rowLabel(config, row),
      entityType: config.collection,
      entityId: row.id,
      onConfirm: () => config.service.softDelete(row.id),
      afterDelete: refresh,
    });
    void label;
  };

  const rowActions = (row: EntityOf<C>): ReactNode => {
    const custom = (config.rowActions ?? []).filter((a) => (a.permission ? can({ permission: a.permission }) : true) && (a.show ? a.show(row) : true));
    if (!config.primaryLink && !canEdit && !canDelete && custom.length === 0) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">{t("common.actions", "Actions")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {config.primaryLink ? (
            <DropdownMenuItem onSelect={() => navigate(config.primaryLink!(row))}>
              <Eye className="size-4" /> {t("action.view", "View")}
            </DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem onSelect={() => openEdit(row)}>
              <Pencil className="size-4" /> {t("action.edit", "Edit")}
            </DropdownMenuItem>
          ) : null}
          {custom.map((a) => {
            const ActionIcon = a.icon;
            return (
              <DropdownMenuItem
                key={a.key}
                className={a.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                onSelect={() => a.onSelect(row, { refresh, navigate })}
              >
                {ActionIcon ? <ActionIcon className="size-4" /> : null} {t(a.labelKey, a.labelKey)}
              </DropdownMenuItem>
            );
          })}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => askDelete(row)}>
                <Trash2 className="size-4" /> {t("action.delete", "Delete")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const bulkBar = (rows: EntityOf<C>[], clear: () => void): ReactNode => {
    const actions = (config.bulkActions ?? []).filter((a) => (a.permission ? can({ permission: a.permission }) : true));
    return (
      <>
        {actions.map((a) => {
          const ActionIcon = a.icon;
          return (
            <Button key={a.key} variant={a.variant === "destructive" ? "destructive" : "outline"} size="sm" onClick={() => { void a.onSelect(rows, { refresh, navigate }); clear(); }}>
              {ActionIcon ? <ActionIcon className="size-4" /> : null} {t(a.labelKey, a.labelKey)}
            </Button>
          );
        })}
        {canDelete ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              requestDelete({
                label: `${rows.length} ${t(config.titleKey, config.titleKey)}`,
                entityType: config.collection,
                entityId: rows[0]?.id,
                onConfirm: async () => {
                  for (const r of rows) await config.service.softDelete(r.id);
                },
                afterDelete: () => { refresh(); clear(); },
              })
            }
          >
            <Trash2 className="size-4" /> {t("action.delete", "Delete")}
          </Button>
        ) : null}
      </>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={title ?? t(config.titleKey, config.titleKey)}
        description={description}
        icon={<Icon className="size-5" />}
        actions={headerActions}
      />
      <DataTable<EntityOf<C>>
        data={data}
        columns={config.columns}
        getRowId={(r) => r.id}
        searchText={config.searchText}
        filters={config.filters}
        defaultSort={config.defaultSort}
        loading={loading}
        density={config.density}
        onRowClick={config.primaryLink ? (row) => navigate(config.primaryLink!(row)) : undefined}
        rowActions={rowActions}
        selection={{ enabled: true, bulkBar }}
        toolbar={{ onAdd: canCreate && config.form ? openCreate : undefined, addLabel: t("action.add", "Add") + " " + t(config.singularKey, config.singularKey) }}
        exportConfig={config.exportable ? { filename: config.key, title: title ?? config.key, excel: config.exportable.excel, pdf: config.exportable.pdf } : undefined}
      />

      {config.form ? (
        <FormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? `${t("action.edit", "Edit")} ${t(config.singularKey, config.singularKey)}` : `${t("action.add", "Add")} ${t(config.singularKey, config.singularKey)}`}
          fields={config.form.fields}
          schema={config.form.schema}
          dynamicScope={config.form.dynamicScope}
          size={config.form.modalSize}
          defaultValues={editing ? (config.form.fromEntity ? config.form.fromEntity(editing) : (editing as unknown as FormValues)) : config.form.defaults?.()}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}

function rowLabel<C extends CollectionName>(config: ResourceConfig<C>, row: EntityOf<C>): string {
  // best-effort label from the first column accessor
  const first = config.columns[0];
  if (first?.accessor) return String(first.accessor(row) ?? config.key);
  const v = (row as unknown as Record<string, unknown>)[first?.key ?? "id"];
  return String(v ?? config.key);
}
