import { Button } from "@ssurak/ui/components/buttons/button";

type ChangeFormControlProps = {
  hasChildren?: boolean;
  isRenderChild?: number | undefined;
  setIsRenderChild: (value: number | undefined) => void;
  commit: () => void;
};

export default function ChangeFormControl({
  hasChildren,
  isRenderChild,
  setIsRenderChild,
  commit,
}: ChangeFormControlProps) {
  if (!hasChildren) return null;

  return (
    <div className="ml-auto">
      {isRenderChild === undefined ? (
        <Button
          type="button"
          variant={"outline"}
          className="shadow-none"
          onClick={() => setIsRenderChild(-1)}
        >
          관리
        </Button>
      ) : (
        <Button type="button" className="shadow-none" onClick={commit}>
          완료
        </Button>
      )}
    </div>
  );
}
