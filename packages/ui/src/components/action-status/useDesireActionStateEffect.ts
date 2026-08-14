import { useEffect, useRef } from "react";
import { useActionStatus, type ActionStatus } from "./ActionStatusContext";

type UseDesireActionStateEffectProps = {
  state: ActionStatus;
  when: "unmounted" | "mounted" | "changed";
  delay?: number /** ms */;
};

export default function useDesireActionStateEffect({
  state,
  when,
  delay,
}: UseDesireActionStateEffectProps) {
  const { actionStatus, setActionStatus } = useActionStatus();

  /** cleanup이 최신 상태를 "읽기"만 하고, 상태 변화가 effect를 재실행시키진 않도록 ref에 담는다 */
  const latestStatus = useRef(actionStatus);
  useEffect(() => {
    latestStatus.current = actionStatus;
  }, [actionStatus]);

  function unmountEffect() {
    if (when !== "unmounted") return;

    return () => {
      if (latestStatus.current !== state) setActionStatus(state);
    };
  }

  function mountEffect() {
    if (when !== "mounted") return;

    const timer = setTimeout(() => setActionStatus(state), delay ?? 0);
    return () => clearTimeout(timer);
  }

  function changeEffect() {
    if (when !== "changed") return;
    if (actionStatus === state) return;

    const timer = setTimeout(() => setActionStatus(state), delay ?? 0);
    return () => clearTimeout(timer);
  }

  useEffect(unmountEffect, [when, state, setActionStatus]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(mountEffect, []);
  useEffect(changeEffect, [when, state, delay, actionStatus, setActionStatus]);
}
