import { FieldLabel } from "@ssurak/ui/components/forms/field";

type FormLabelProps = {
  id: string;
  required?: boolean;
  children?: React.ReactNode;
};

export default function FormLabel({
  id,
  required = false,
  children,
}: FormLabelProps) {
  return (
    <div>
      <FieldLabel className="gap-0 font-semibold" htmlFor={id}>
        {children}
        {required && (
          <span className="ml-0.5 inline-block text-red-500">*</span>
        )}
      </FieldLabel>
    </div>
  );
}
