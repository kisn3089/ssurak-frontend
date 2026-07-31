import { Field, FieldDescription } from "@ssurak/ui/components/forms/field";
import { cn } from "@ssurak/ui/lib/utils";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import FormLabel from "../FormLabel";
import ReorderForm, { ReorderRowData } from "./ReorderForm";

export type StaticReorderField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  type: "reorder";
  disabled?: boolean;
  badgeLabel?: string;
  description?: React.ReactNode;
  isHighlightRow?: (rows: ReorderRowData[]) => ReorderRowData["id"] | undefined;
  renderMetaInfo?: (row: ReorderRowData) => React.ReactNode;
};

export type DynamicReorderField<Payload extends FieldValues> =
  StaticReorderField<Payload> & {
    control: Control<Payload>;
    reorderRow: ReorderRowData[];
  };

export default function ReorderFormField<Payload extends FieldValues>({
  id,
  label,
  disabled,
  description,
  control,
  reorderRow,
  badgeLabel,
  isHighlightRow,
  renderMetaInfo,
}: DynamicReorderField<Payload>) {
  const { field } = useController({ control, name: id });

  return (
    <div
      inert={disabled}
      className={cn("grid gap-2", {
        "opacity-50 pointer-events-none": disabled,
      })}
    >
      <Field>
        <FormLabel id={id} label={label} />
        <ReorderForm
          reorderRow={reorderRow}
          badgeLabel={badgeLabel}
          onReorder={field.onChange}
          isHighlightRow={isHighlightRow}
          renderMetaInfo={renderMetaInfo}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
