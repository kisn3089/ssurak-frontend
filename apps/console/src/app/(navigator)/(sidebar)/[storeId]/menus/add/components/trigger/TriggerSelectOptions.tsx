import { SelectContent, SelectItem } from "@ssurak/ui/components/forms/select";
import { SelectOption } from "../../../../components/form/SelectFormField";

export default function TriggerSelectOptions({
  options,
}: {
  options: SelectOption[];
}) {
  return (
    <SelectContent>
      {options.map((condition) => (
        <SelectItem
          key={condition.value}
          value={condition.value.toString()}
          className="h-11 font-semibold"
        >
          {condition.label}
        </SelectItem>
      ))}
    </SelectContent>
  );
}
