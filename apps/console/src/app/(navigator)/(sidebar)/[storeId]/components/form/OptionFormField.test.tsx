import { menuFormPayloadSchema } from "@ssurak/api/schemas/model/menu-form-payload.schema";
import { MenuOption } from "@ssurak/api/types/menu/menuOptions.interface";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  MenuFormPayload,
  OptionGroupForm,
} from "../../menus/types/menu-form-payload.type";
import { toMenuOptionRecords } from "../../menus/utils/menu-option-form";
import useFormResolver from "../../menus/hooks/useFormResolver";
import { NEW_MENU_ID } from "../../menus/utils/menu-sort-order";
import OptionFormField from "./OptionFormField";

/**
 * Radix Select는 포인터 캡처와 scrollIntoView를 쓰는데 jsdom에는 없다.
 * (setup.ts의 ResizeObserver와 같은 이유로 여기서만 채워 넣는다)
 */
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

/** cuid2 검증(소문자·숫자 24~32자)을 통과하는 값. 옵션과 무관한 필드를 막지 않기 위함이다. */
const CATEGORY_ID = "category1abcdefghijklmnop";

let groupIdSequence = 0;

function buildGroup(overrides: Partial<OptionGroupForm> = {}): OptionGroupForm {
  groupIdSequence += 1;

  return {
    groupId: `testGroup-${groupIdSequence}`,
    groupKey: "원두",
    options: [
      { key: "케냐", price: 0 },
      { key: "콜롬비아", price: 500 },
    ],
    defaultIndex: 0,
    trigger: [],
    ...overrides,
  };
}

type HarnessProps = {
  requiredOptions?: OptionGroupForm[];
  customOptions?: OptionGroupForm[];
  onSubmit?: (options: MenuOption) => void;
};

/**
 * OptionFormField는 control이 있어야 동작하므로 실제 useForm 위에 올린다.
 * 제출 시에는 MenuForm과 같은 방식으로 폼 배열을 서버 Record로 변환해 넘긴다.
 */
function OptionFormHarness({
  requiredOptions = [],
  customOptions = [],
  onSubmit = () => {},
}: HarnessProps) {
  // MenuForm과 같은 리졸버를 쓴다. 메뉴 이름 중복 검사는 이 테스트와 무관해 빈 집합으로 둔다.
  const resolver = useFormResolver<MenuFormPayload>({
    schema: menuFormPayloadSchema,
    existingValues: new Set<string>(),
    field: "name",
    duplicateMessage: "이미 존재하는 메뉴 이름입니다.",
  });

  const form = useForm<MenuFormPayload>({
    resolver,
    mode: "all",
    defaultValues: {
      name: "아메리카노",
      price: 4000,
      categoryId: CATEGORY_ID,
      imageKey: "menu/americano.png",
      isAvailable: true,
      // 정렬 목록은 이 테스트와 무관하지만, 비어 있으면 폼 전체가 invalid라 제출이 막힌다.
      sortOrder: [NEW_MENU_ID],
      requiredOptions,
      customOptions,
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        const records = toMenuOptionRecords(values);

        onSubmit({
          requiredOptions: records.requiredOptions ?? null,
          customOptions: records.customOptions ?? null,
        });
      })}
    >
      <OptionFormField
        id="requiredOptions"
        type="option"
        label="필수 옵션"
        addOptionGroupButtonLabel="+ 필수 옵션 그룹 추가"
        control={form.control}
      />
      <OptionFormField
        id="customOptions"
        type="option"
        label="선택 옵션"
        addOptionGroupButtonLabel="+ 선택 옵션 그룹 추가"
        control={form.control}
      />
      <button type="submit">저장</button>
    </form>
  );
}

const group = (name: string) => screen.getByRole("group", { name });

describe("옵션 그룹 추가·삭제", () => {
  it("기본값이 비어 있으면 그룹 없이 추가 버튼만 보인다", () => {
    render(<OptionFormHarness />);

    expect(screen.queryAllByLabelText("옵션 이름")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    ).toBeInTheDocument();
  });

  it("그룹을 추가하면 빈 옵션 값 한 줄을 가진 그룹이 생긴다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness />);

    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );

    const newGroup = group("새 옵션 그룹");
    expect(within(newGroup).getByLabelText("옵션 이름")).toHaveValue("");
    expect(within(newGroup).getByLabelText("옵션 값 1 이름")).toHaveValue("");
    expect(within(newGroup).queryByLabelText("옵션 값 2 이름")).toBeNull();
  });

  it("그룹을 삭제하면 목록에서 사라진다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    await user.click(screen.getByRole("button", { name: "원두 삭제" }));

    expect(screen.queryByRole("group", { name: "원두" })).toBeNull();
  });

  it("필수 옵션 추가 버튼은 필수 옵션 목록에만 그룹을 넣는다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness customOptions={[buildGroup()]} />);

    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );

    expect(screen.getAllByLabelText("옵션 이름")).toHaveLength(2);
    // 새 그룹은 필수 옵션 쪽에, 기존 "원두"는 선택 옵션 쪽에 그대로 남는다.
    expect(
      within(group("새 옵션 그룹")).getByLabelText("옵션 이름")
    ).toHaveValue("");
    expect(within(group("원두")).getByLabelText("옵션 이름")).toHaveValue(
      "원두"
    );
    expect(screen.queryByText("노출 조건")).toBeInTheDocument();
  });
});

describe("그룹 접힘 상태", () => {
  it("이름이 있는 그룹은 접힌 채로 시작한다", () => {
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    expect(screen.getByRole("button", { name: "원두 펼치기" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("새로 추가한 그룹은 펼친 채로 시작한다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness />);

    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );

    expect(
      screen.getByRole("button", { name: "새 옵션 그룹 접기" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("옵션 값 이름은 접힌 상태에서도 헤더에 남는다", () => {
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    const collapsed = group("원두");
    expect(within(collapsed).getByText("케냐")).toBeInTheDocument();
    expect(within(collapsed).getByText("콜롬비아")).toBeInTheDocument();
  });

  /**
   * 접힘은 높이를 자를 뿐 자식을 언마운트하지 않는다. 접은 채로 두면 에러 메시지가
   * 화면 밖에 갇혀, 제출 버튼만 막히고 이유는 보이지 않는 상태가 된다.
   */
  it("에러가 생긴 그룹은 펼쳐지고 접기 버튼이 막힌다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness requiredOptions={[buildGroup(), buildGroup()]} />
    );

    expect(screen.getAllByRole("button", { name: "원두 펼치기" })).toHaveLength(
      2
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("이미 사용한 옵션 이름입니다.")
    ).toBeInTheDocument();

    const expanded = screen.getAllByRole("button", { name: "원두 접기" });
    expect(expanded.length).toBeGreaterThan(0);
    expanded.forEach((toggle) => expect(toggle).toBeDisabled());
  });
});

describe("옵션 값 줄", () => {
  it("옵션 값을 추가하면 줄이 늘어난다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    await user.click(screen.getByRole("button", { name: "+ 옵션 값 추가" }));

    expect(
      within(group("원두")).getByLabelText("옵션 값 3 이름")
    ).toBeInTheDocument();
  });

  it("마지막 한 줄은 삭제할 수 없다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness
        requiredOptions={[buildGroup({ options: [{ key: "케냐", price: 0 }] })]}
      />
    );

    expect(
      screen.getByRole("button", { name: "옵션 값 1 삭제" })
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "+ 옵션 값 추가" }));

    expect(
      screen.getByRole("button", { name: "옵션 값 1 삭제" })
    ).toBeEnabled();
  });
});

describe("기본값 선택", () => {
  const defaultButtons = () =>
    screen.getAllByRole("button", { name: "기본값" });

  it("기본값 버튼을 누르면 그 줄이 기본값이 된다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "true");

    await user.click(defaultButtons()[1]);

    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "false");
    expect(defaultButtons()[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("기본값으로 지정된 줄을 지우면 첫 줄이 기본값이 된다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness requiredOptions={[buildGroup({ defaultIndex: 1 })]} />
    );

    await user.click(screen.getByRole("button", { name: "옵션 값 2 삭제" }));

    expect(screen.getByLabelText("옵션 값 1 이름")).toHaveValue("케냐");
    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("기본값보다 앞 줄을 지워도 같은 옵션이 기본값으로 남는다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness requiredOptions={[buildGroup({ defaultIndex: 1 })]} />
    );

    await user.click(screen.getByRole("button", { name: "옵션 값 1 삭제" }));

    // 콜롬비아가 0번으로 당겨졌으므로 defaultIndex도 1 → 0으로 따라와야 한다.
    expect(screen.getByLabelText("옵션 값 1 이름")).toHaveValue("콜롬비아");
    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "true");
  });
});

describe("추가 금액 입력", () => {
  it("새로 추가한 옵션 값의 추가 금액은 빈 칸으로 시작한다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness />);

    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );

    expect(screen.getByLabelText("옵션 값 1 추가 금액")).toHaveValue(null);

    await user.click(screen.getByRole("button", { name: "+ 옵션 값 추가" }));

    expect(screen.getByLabelText("옵션 값 2 추가 금액")).toHaveValue(null);
  });

  it("0을 지우면 빈 칸으로 남는다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    const price = screen.getByLabelText("옵션 값 1 추가 금액");
    expect(price).toHaveValue(0);

    await user.clear(price);

    // undefined로 비우면 RHF가 defaultValues의 0을 되돌려 넣는다. null이어야 빈 칸이 유지된다.
    expect(price).toHaveValue(null);
  });

  it("숫자를 입력하면 그대로 반영된다", async () => {
    const user = userEvent.setup();
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    const price = screen.getByLabelText("옵션 값 1 추가 금액");
    await user.clear(price);
    await user.type(price, "1500");

    expect(price).toHaveValue(1500);
  });
});

describe("노출 조건", () => {
  it("필수 옵션 그룹에는 노출 조건 영역이 없다", () => {
    render(<OptionFormHarness requiredOptions={[buildGroup()]} />);

    expect(screen.queryByText("노출 조건")).toBeNull();
  });

  it("선택 옵션 그룹에는 노출 조건 영역이 있다", () => {
    render(<OptionFormHarness customOptions={[buildGroup()]} />);

    expect(screen.getByText("노출 조건")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "+ 조건 추가" })
    ).toBeInTheDocument();
  });

  it("조건 그룹 선택지에서 자기 자신은 빠진다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness
        requiredOptions={[buildGroup({ groupKey: "종류" })]}
        customOptions={[buildGroup({ groupKey: "샷" })]}
      />
    );

    await user.click(screen.getByRole("button", { name: "+ 조건 추가" }));
    await user.click(screen.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "종류" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "샷" })).toBeNull();
  });

  it("조건을 삭제하면 줄이 사라진다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness
        requiredOptions={[buildGroup({ groupKey: "종류" })]}
        customOptions={[buildGroup({ groupKey: "샷" })]}
      />
    );

    await user.click(screen.getByRole("button", { name: "+ 조건 추가" }));
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("이름 없는 그룹은 조건 선택지가 되지 못해 조건을 추가할 수 없다", async () => {
    const user = userEvent.setup();
    render(
      <OptionFormHarness customOptions={[buildGroup({ groupKey: "샷" })]} />
    );

    // 이름이 없는 그룹을 하나 더 만들어도 선택지가 늘어나지 않는다.
    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );

    expect(screen.getByRole("button", { name: "+ 조건 추가" })).toBeDisabled();
    expect(
      screen.getByText(
        "조건으로 쓸 다른 옵션 그룹이 없습니다. 먼저 다른 그룹의 이름을 입력해 주세요."
      )
    ).toBeInTheDocument();
  });
});

describe("노출 조건 대상 추적", () => {
  const temperatureGroup = buildGroup({
    groupId: "temperature",
    groupKey: "온도",
    options: [
      { key: "아이스", price: 0 },
      { key: "핫", price: 0 },
    ],
  });
  const shotGroup = buildGroup({
    groupId: "shot",
    groupKey: "샷",
    trigger: [{ groupId: "temperature", in: ["아이스"] }],
  });

  it("대상 그룹 이름을 바꿔도 조건이 새 이름으로 따라간다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness
        requiredOptions={[temperatureGroup]}
        customOptions={[shotGroup]}
        onSubmit={onSubmit}
      />
    );

    const groupNameInput = within(group("온도")).getByLabelText("옵션 이름");
    await user.clear(groupNameInput);
    await user.type(groupNameInput, "온도선택");

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].customOptions?.["샷"].trigger).toEqual([
      { group: "온도선택", in: ["아이스"] },
    ]);
  });

  it("조건으로 지정한 그룹을 지우면 제출되지 않고 메시지를 보여준다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness
        requiredOptions={[temperatureGroup]}
        customOptions={[shotGroup]}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "온도 삭제" }));
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText(
        "조건으로 지정한 옵션 그룹이 없습니다. 다시 골라 주세요."
      )
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("제출 payload 변환", () => {
  it("그룹이 없으면 옵션을 보내지 않는다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OptionFormHarness onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      requiredOptions: null,
      customOptions: null,
    });
  });

  it("폼 배열을 그룹 이름 Record로 바꾸고 defaultIndex를 defaultKey로 변환한다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness
        requiredOptions={[buildGroup({ defaultIndex: 1 })]}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].requiredOptions).toEqual({
      원두: {
        options: [
          { key: "케냐", price: 0 },
          { key: "콜롬비아", price: 500 },
        ],
        defaultKey: "콜롬비아",
      },
    });
  });

  it("추가 금액을 비워두면 0으로 채워 보낸다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness requiredOptions={[buildGroup()]} onSubmit={onSubmit} />
    );

    await user.clear(screen.getByLabelText("옵션 값 2 추가 금액"));
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].requiredOptions?.["원두"].options).toEqual(
      [
        { key: "케냐", price: 0 },
        { key: "콜롬비아", price: 0 },
      ]
    );
  });

  it("노출 조건이 비어 있으면 trigger 필드 자체를 빼고 보낸다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness customOptions={[buildGroup()]} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(
      onSubmit.mock.calls[0][0].customOptions?.["원두"]
    ).not.toHaveProperty("trigger");
  });
});

describe("검증", () => {
  it("그룹 이름이 비어 있으면 제출되지 않고 메시지를 보여준다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OptionFormHarness onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: "+ 필수 옵션 그룹 추가" })
    );
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("옵션 이름을 입력해 주세요.")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("그룹 이름이 겹치면 제출되지 않는다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness
        requiredOptions={[buildGroup(), buildGroup()]}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("이미 사용한 옵션 이름입니다.")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("한 그룹 안에서 옵션 값 이름이 겹치면 제출되지 않는다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OptionFormHarness
        requiredOptions={[
          buildGroup({
            options: [
              { key: "케냐", price: 0 },
              { key: "케냐", price: 500 },
            ],
          }),
        ]}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("이미 사용한 옵션 값 이름입니다.")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
