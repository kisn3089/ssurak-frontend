import { Button } from "@ssurak/ui/components/buttons/button";
import { Input } from "@ssurak/ui/components/forms/input";
import { Resolver, useForm } from "react-hook-form";

export type RenamingFormValues = { name: string };

type RenamingRowProps = {
  defaultName?: string;
  resolver: Resolver<RenamingFormValues>;
  updateRename: (newName: string) => void;
  closeRenamingRow: () => void;
};

export default function RenamingRow({
  defaultName,
  resolver,
  updateRename,
  closeRenamingRow,
}: RenamingRowProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RenamingFormValues>({
    resolver,
    mode: "onChange",
    defaultValues: { name: defaultName },
  });

  const submitRename = handleSubmit(({ name }) => {
    if (name === defaultName) return closeRenamingRow();
    updateRename(name);
  });

  return (
    <>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <Input
          type="text"
          autoFocus
          aria-invalid={!!errors.name}
          {...register("name")}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter") submitRename(event);
            if (event.key === "Escape") closeRenamingRow();
          }}
        />
        {errors.name && (
          <span className="text-xs text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>
      <div className="flex gap-x-2">
        <Button
          type="button"
          variant={"default"}
          className="text-xs font-semibold px-3 h-8 ml-2 w-fit"
          disabled={!isValid}
          onClick={submitRename}
        >
          저장
        </Button>
        <Button
          type="button"
          variant={"outline"}
          size={"icon-sm"}
          className="text-xs shadow-none px-3 h-8 w-fit"
          onClick={closeRenamingRow}
        >
          취소
        </Button>
      </div>
    </>
  );
}
