import { SelectTrigger, SelectValue } from "@ssurak/ui/components/forms/select";

export default function TriggerSelect() {
  return (
    <SelectTrigger
      type="button"
      className="min-w-20 w-fit max-w-44 border-blue-primary-edge text-blue-primary-foreground font-semibold hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 dark:hover:border-blue-600"
      svgClassName="text-blue-primary-foreground opacity-100"
    >
      <SelectValue
        className="[&>span]:text-blue-primary-foreground"
        placeholder={"종류"}
      />
    </SelectTrigger>
  );
}
