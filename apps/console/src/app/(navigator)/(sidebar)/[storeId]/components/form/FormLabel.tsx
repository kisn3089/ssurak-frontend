import { FieldLabel } from "@ssurak/ui/components/forms/field";

type FormLabelProps = {
  id: string;
  label: string | React.ReactNode;
  required?: boolean;
  children?: React.ReactNode;
};

export default function FormLabel({
  id,
  label,
  required = false,
  children,
}: FormLabelProps) {
  return (
    <div className="flex">
      <FieldLabel className="gap-0 font-bold" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 inline-block text-red-500">*</span>
        )}
      </FieldLabel>
      {children}
    </div>
  );
}
