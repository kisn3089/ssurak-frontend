import useMenuOptionMutation from "@ssurak/api/core/store/menu/option/useMenuOptionMutation";
import { CreateMenuOptionPayload } from "@ssurak/api/schemas/model/menuOption.schema";
import {
  MenuOptionChoice,
  MenuOptionGroup,
  OptionChoiceState,
  OptionSelectionType,
} from "@ssurak/api/types/menu/menuOptions.interface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import useDragSort, { reorder, resolveDropEdge } from "../../hooks/useDragSort";
import OptionFields from "../../menus/add/components/OptionFields";
import OptionGroupList from "../../menus/add/components/option-field/OptionGroupList";
import { Button } from "@ssurak/ui/components/buttons/button";
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

afterEach(() => vi.restoreAllMocks());

/**
 * 시트를 연 채로 끝난 테스트는 body에 스크롤 잠금(pointer-events: none)을 남긴다.
 * 정리는 언마운트 뒤에 끝나므로, 다음 테스트가 클릭하기 전인 여기서 걷어낸다.
 */
beforeEach(() => {
  document.body.style.pointerEvents = "";
});

const ROW_HEIGHT = 56;

/** cuid2 검증(소문자·숫자 24~32자)을 통과하는 값. 트리거 스키마가 id 모양을 본다. */
const STORE_ID = "storeaaaaaaaaaaaaaaaaaaaaa";
const MENU_ID = "menuaaaaaaaaaaaaaaaaaaaaaa";

function buildChoice(
  overrides: Partial<MenuOptionChoice> & Pick<MenuOptionChoice, "publicId">
): MenuOptionChoice {
  return {
    name: "케냐",
    priceDelta: 0,
    quantityEnabled: false,
    maxQuantity: 1,
    isDefault: false,
    sortOrder: 10,
    state: OptionChoiceState.AVAILABLE,
    ...overrides,
  };
}

function buildOption(
  overrides: Partial<MenuOptionGroup> & Pick<MenuOptionGroup, "publicId">
): MenuOptionGroup {
  return {
    name: "원두",
    selectionType: OptionSelectionType.SINGLE,
    required: true,
    minSelect: 1,
    maxSelect: 1,
    sortOrder: 10,
    enabled: true,
    trigger: null,
    choices: [
      buildChoice({
        publicId: "choiceaaaaaaaaaaaaaaaaaaaa",
        name: "케냐",
        isDefault: true,
      }),
      buildChoice({
        publicId: "choicebbbbbbbbbbbbbbbbbbbb",
        name: "콜롬비아",
        priceDelta: 500,
        sortOrder: 20,
      }),
    ],
    ...overrides,
  };
}

/**
 * 실제 화면과 같은 조립(셸 + 카드 목록)을 그대로 세운다.
 * 저장 버튼을 누르지 않는 한 요청은 나가지 않으므로 뮤테이션은 진짜 훅을 쓴다.
 *
 * 그룹 재정렬은 앱에서 서버 응답이 순서를 정하지만(낙관적 업데이트 → invalidate),
 * 여기서는 MenuOptionsSection과 같은 방식으로 훅만 걸고 결과를 로컬 상태에 반영한다.
 */
function OptionsHarness({
  options,
  isReordering = false,
}: {
  options: MenuOptionGroup[];
  isReordering?: boolean;
}) {
  const mutations = useMenuOptionMutation(STORE_ID);
  const invalidateOptions = async () => {
    await mutations.invalidateOptions(MENU_ID);
  };
  const createOption = async (payload: CreateMenuOptionPayload) => {
    await mutations.createOption.mutateAsync({
      menuId: MENU_ID,
      createMenuOptionPayload: payload,
    });
  };
  const deleteOption = async (optionId: string) => {
    await mutations.deleteOption.mutateAsync({ menuId: MENU_ID, optionId });
  };
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [savedOptions, setSavedOptions] = useState(options);

  const { listRef, draggingIndex, targetIndex, getHandleProps, getItemProps } =
    useDragSort(
      savedOptions.length,
      (from, to) => setSavedOptions((previous) => reorder(previous, from, to)),
      { disabled: isReordering }
    );

  return (
    <OptionFormField
      id="menu-options"
      label="옵션"
      onAddOptionGroup={() =>
        setDraftIds((prev) => [...prev, `draft-${prev.length + 1}`])
      }
    >
      <OptionGroupList
        ref={listRef}
        isEmpty={savedOptions.length + draftIds.length === 0}
      >
        {savedOptions.map((option, index) => (
          <OptionFields
            key={option.publicId}
            formId={option.publicId}
            option={option}
            savedOptions={savedOptions}
            invalidateOptions={invalidateOptions}
            createOptionCallback={createOption}
            deleteOptionCallback={deleteOption}
            drag={{
              handleProps: getHandleProps(index),
              itemProps: getItemProps(index),
              isDragging: draggingIndex === index,
              dropEdge: resolveDropEdge(draggingIndex, targetIndex, index),
              isDisabled: isReordering,
            }}
          >
            {(save, formState) => (
              <Button
                type="button"
                onClick={save}
                disabled={formState.isSubmitting}
              >
                저장하기
              </Button>
            )}
          </OptionFields>
        ))}
        {draftIds.map((draftId) => (
          <OptionFields
            key={draftId}
            formId={draftId}
            savedOptions={savedOptions}
            invalidateOptions={invalidateOptions}
            createOptionCallback={createOption}
            deleteOptionCallback={deleteOption}
            onDiscard={() =>
              setDraftIds((prev) => prev.filter((id) => id !== draftId))
            }
          >
            {(save, formState) => (
              <Button
                type="button"
                onClick={save}
                disabled={formState.isSubmitting}
              >
                추가하기
              </Button>
            )}
          </OptionFields>
        ))}
      </OptionGroupList>
    </OptionFormField>
  );
}

function renderOptions(options: MenuOptionGroup[] = [], isReordering = false) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <OptionsHarness options={options} isReordering={isReordering} />
    </QueryClientProvider>
  );
}

/** 목록에 서 있는 그룹 줄. 편집 폼은 여기가 아니라 시트 안에 있다. */
const group = (name: string) => screen.getByRole("group", { name });

/** 열려 있는 편집 시트. 이름은 그룹 이름을 그대로 쓴다. */
const sheet = (name: string) => screen.getByRole("dialog", { name });

/** 줄(그립을 뺀 나머지 전체가 버튼이다)을 눌러 편집 시트를 연다. */
async function openGroup(
  user: ReturnType<typeof userEvent.setup>,
  name: string
) {
  await user.click(within(group(name)).getByText(name));
  return sheet(name);
}

/** 시트가 열려 있는 동안은 뒤의 목록이 접근성 트리에서 빠지므로, 줄을 보기 전에 닫는다. */
async function closeSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

/**
 * jsdom은 레이아웃을 계산하지 않아 getBoundingClientRect가 전부 0이다.
 * 줄이 재정렬되어도 따라가도록, 호출 시점의 형제 순서로 위치를 만들어 준다.
 * 그룹 카드 안에 선택지 줄이 또 들어 있으므로 자리는 같은 부모 안에서만 센다.
 * (SelectFormField.test.tsx의 stubRowRects와 같은 이유)
 */
function stubRowRects() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const siblings = Array.from(this.parentElement?.children ?? []).filter(
        (sibling) => sibling.hasAttribute("data-drag-item")
      );
      const index = siblings.indexOf(this);
      const top = index < 0 ? 0 : index * ROW_HEIGHT;
      const height = index < 0 ? 0 : ROW_HEIGHT;

      return { top, height, bottom: top + height } as DOMRect;
    }
  );
}

/** rowNumber(1부터)의 그립을 잡고 clientY 까지 끌어다 놓는다. */
function dragHandle(handleName: string, rowNumber: number, toClientY: number) {
  const handle = screen.getByRole("button", { name: handleName });
  const fromClientY = (rowNumber - 1) * ROW_HEIGHT + ROW_HEIGHT / 2;

  fireEvent.pointerDown(handle, {
    button: 0,
    pointerId: 1,
    clientY: fromClientY,
  });
  fireEvent.pointerMove(handle, { pointerId: 1, clientY: toClientY });
  fireEvent.pointerUp(handle, { pointerId: 1, clientY: toClientY });
}

/** 카드 안의 Field도 role=group이라, 이름이 붙은 그룹 카드만 추린다. */
const groupNames = () =>
  screen
    .getAllByRole("group")
    .map((element) => element.getAttribute("aria-label"))
    .filter((label) => label !== null);

/** 밀어서 확정하는 버튼. 한 번 눌러 켠 뒤 키보드로 확정한다(끌 수 없는 입력이라 바로 실행된다). */
async function confirmDragButton(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement
) {
  await user.click(button);
  await user.keyboard("{Enter}");
}

describe("옵션 그룹 추가·삭제", () => {
  it("저장된 옵션이 없으면 그룹 없이 추가 버튼만 보인다", () => {
    renderOptions();

    expect(screen.queryAllByLabelText("옵션 이름")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "+ 옵션 그룹 추가" })
    ).toBeInTheDocument();
  });

  it("그룹을 추가하면 빈 옵션 값 한 줄을 가진 그룹이 생긴다", async () => {
    const user = userEvent.setup();
    renderOptions();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    const newGroup = sheet("새 옵션 그룹");
    expect(within(newGroup).getByLabelText("옵션 이름")).toHaveValue("");
    expect(within(newGroup).getByLabelText("옵션 값 1 이름")).toHaveValue("");
    expect(within(newGroup).queryByLabelText("옵션 값 2 이름")).toBeNull();
  });

  /** 저장 전 그룹은 서버에 없으므로 삭제 요청 없이 목록에서만 사라져야 한다. */
  it("저장하지 않은 그룹은 삭제로 사라진다", async () => {
    const user = userEvent.setup();
    renderOptions();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));
    await confirmDragButton(user, screen.getByRole("button", { name: "삭제" }));

    expect(screen.queryByRole("group", { name: "새 옵션 그룹" })).toBeNull();
  });

  /** 저장된 그룹은 수정이고 새 그룹은 생성이라 확정 버튼의 이름이 다르다. */
  it("저장된 그룹은 저장하기, 새 그룹은 추가하기로 확정한다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    const saved = await openGroup(user, "원두");
    expect(
      within(saved).getByRole("button", { name: "저장하기" })
    ).toBeInTheDocument();
    await closeSheet(user);

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    const draft = sheet("새 옵션 그룹");
    expect(
      within(draft).getByRole("button", { name: "추가하기" })
    ).toBeInTheDocument();
    expect(
      within(draft).queryByRole("button", { name: "저장하기" })
    ).toBeNull();
  });
});

describe("옵션 그룹 순서", () => {
  const savedGroups = () => [
    buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa", name: "원두" }),
    buildOption({ publicId: "optionbbbbbbbbbbbbbbbbbbbbb", name: "온도" }),
  ];

  it("그룹 그립을 아래로 끌면 카드 순서가 바뀐다", () => {
    renderOptions(savedGroups());
    stubRowRects();

    dragHandle("원두 순서 변경", 1, ROW_HEIGHT / 2 + 20);

    expect(groupNames()).toEqual(["온도", "원두"]);
  });

  it("그룹 그립에서 방향키로도 순서를 바꾼다", async () => {
    const user = userEvent.setup();
    renderOptions(savedGroups());

    await user.click(screen.getByRole("button", { name: "온도 순서 변경" }));
    await user.keyboard("{ArrowUp}");

    expect(groupNames()).toEqual(["온도", "원두"]);
  });

  /**
   * 앞선 재정렬이 끝나기 전에 다음 요청이 나가면 응답이 역순으로 도착해
   * 서버가 이전 순서로 끝날 수 있다. 확정될 때까지 그립을 잠근다.
   */
  it("재정렬 요청이 끝나기 전에는 그립을 잡을 수 없다", () => {
    renderOptions(savedGroups(), true);
    stubRowRects();

    expect(
      screen.getByRole("button", { name: "원두 순서 변경" })
    ).toBeDisabled();

    dragHandle("원두 순서 변경", 1, ROW_HEIGHT / 2 + 20);
    fireEvent.keyDown(screen.getByRole("button", { name: "원두 순서 변경" }), {
      key: "ArrowDown",
    });

    expect(groupNames()).toEqual(["원두", "온도"]);
  });

  /** 저장 전 그룹은 서버에 없어서 순서를 가질 수 없다. */
  it("저장하지 않은 그룹에는 그립이 없다", async () => {
    const user = userEvent.setup();
    renderOptions(savedGroups());

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));
    await closeSheet(user);

    expect(
      within(group("새 옵션 그룹")).queryByRole("button", {
        name: "새 옵션 그룹 순서 변경",
      })
    ).toBeNull();
  });
});

describe("편집 시트", () => {
  it("저장된 그룹은 시트가 닫힌 채로 시작한다", () => {
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    expect(screen.queryByRole("dialog")).toBeNull();
    // 줄 버튼의 이름은 그룹 이름과 배지를 그대로 읽어 준다.
    expect(
      screen.getByRole("button", { name: "원두 케냐 콜롬비아" })
    ).toBeInTheDocument();
  });

  it("새로 추가한 그룹은 시트가 열린 채로 시작한다", async () => {
    const user = userEvent.setup();
    renderOptions();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    expect(sheet("새 옵션 그룹")).toBeInTheDocument();
  });

  it("줄 아무 곳이나 눌러도 시트가 열린다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    await user.click(within(group("원두")).getByText("케냐"));

    expect(sheet("원두")).toBeInTheDocument();
  });

  /** 그립은 순서를 바꾸는 자리다. 여기서 시트가 열리면 끌고 놓을 때마다 편집 화면이 튀어나온다. */
  it("그립을 눌러도 시트는 열리지 않는다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    await user.click(screen.getByRole("button", { name: "원두 순서 변경" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("줄을 눌러 열고 ESC로 닫는다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    const opened = await openGroup(user, "원두");
    expect(within(opened).getByLabelText("옵션 이름")).toHaveValue("원두");

    await closeSheet(user);
    expect(screen.queryByLabelText("옵션 이름")).toBeNull();
  });

  it("옵션 값 이름과 상태는 목록 줄에 남는다", () => {
    renderOptions([
      buildOption({
        publicId: "optionaaaaaaaaaaaaaaaaaaaaa",
        enabled: false,
      }),
    ]);

    const row = group("원두");
    expect(within(row).getByText("케냐")).toBeInTheDocument();
    expect(within(row).getByText("콜롬비아")).toBeInTheDocument();
    expect(within(row).getByText("미노출")).toBeInTheDocument();
  });
});

describe("옵션 값 줄", () => {
  it("옵션 값을 추가하면 줄이 늘어난다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    const opened = await openGroup(user, "원두");

    await user.click(screen.getByRole("button", { name: "+ 옵션 값 추가" }));

    expect(within(opened).getByLabelText("옵션 값 3 이름")).toBeInTheDocument();
  });

  it("마지막 한 줄은 삭제할 수 없다", async () => {
    const user = userEvent.setup();
    renderOptions([
      buildOption({
        publicId: "optionaaaaaaaaaaaaaaaaaaaaa",
        choices: [
          buildChoice({ publicId: "choiceaaaaaaaaaaaaaaaaaaaa", name: "케냐" }),
        ],
      }),
    ]);
    await openGroup(user, "원두");

    expect(
      screen.getByRole("button", { name: "옵션 값 1 삭제" })
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "+ 옵션 값 추가" }));

    expect(
      screen.getByRole("button", { name: "옵션 값 1 삭제" })
    ).toBeEnabled();
  });

  it("그립을 아래로 끌면 두 줄의 순서가 바뀐다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");
    stubRowRects();

    // 첫 줄 중앙에서 20px만 내린 지점. 둘째 줄 중앙선에는 못 미쳐도 한 칸 이동은 확정된다.
    dragHandle("옵션 값 1 순서 변경", 1, ROW_HEIGHT / 2 + 20);

    expect(screen.getByLabelText("옵션 값 1 이름")).toHaveValue("콜롬비아");
    expect(screen.getByLabelText("옵션 값 2 이름")).toHaveValue("케냐");
  });

  it("그립에서 방향키로도 순서를 바꾼다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");

    await user.click(
      screen.getByRole("button", { name: "옵션 값 1 순서 변경" })
    );
    await user.keyboard("{ArrowDown}");

    expect(screen.getByLabelText("옵션 값 1 이름")).toHaveValue("콜롬비아");
    expect(screen.getByLabelText("옵션 값 2 이름")).toHaveValue("케냐");
  });

  it("첫 줄에서 위로는 더 올라가지 않는다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");

    await user.click(
      screen.getByRole("button", { name: "옵션 값 1 순서 변경" })
    );
    await user.keyboard("{ArrowUp}");

    expect(screen.getByLabelText("옵션 값 1 이름")).toHaveValue("케냐");
    expect(screen.getByLabelText("옵션 값 2 이름")).toHaveValue("콜롬비아");
  });
});

describe("기본값 선택", () => {
  const defaultButtons = () =>
    screen.getAllByRole("button", { name: "기본값" });

  it("하나만 고르는 옵션에서는 기본값이 하나만 남는다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");

    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "true");

    await user.click(defaultButtons()[1]);

    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "false");
    expect(defaultButtons()[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("여러 개 고르는 옵션에서는 기본값을 둘 이상 지정할 수 있다", async () => {
    const user = userEvent.setup();
    renderOptions([
      buildOption({
        publicId: "optionaaaaaaaaaaaaaaaaaaaaa",
        selectionType: OptionSelectionType.MULTIPLE,
        maxSelect: 2,
      }),
    ]);
    await openGroup(user, "원두");

    await user.click(defaultButtons()[1]);

    expect(defaultButtons()[0]).toHaveAttribute("aria-pressed", "true");
    expect(defaultButtons()[1]).toHaveAttribute("aria-pressed", "true");
  });

  /** 품절·숨김을 기본값으로 두면 고객 화면이 고를 수 없는 값으로 열린다. */
  it("판매 중이 아닌 선택지는 기본값으로 지정할 수 없다", async () => {
    const user = userEvent.setup();
    renderOptions([
      buildOption({
        publicId: "optionaaaaaaaaaaaaaaaaaaaaa",
        choices: [
          buildChoice({
            publicId: "choiceaaaaaaaaaaaaaaaaaaaa",
            name: "케냐",
            state: OptionChoiceState.SOLD_OUT,
          }),
        ],
      }),
    ]);
    await openGroup(user, "원두");

    expect(defaultButtons()[0]).toBeDisabled();
  });
});

describe("추가 금액 입력", () => {
  it("새로 추가한 옵션 값의 추가 금액은 빈 칸으로 시작한다", async () => {
    const user = userEvent.setup();
    renderOptions();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    expect(screen.getByLabelText("옵션 값 1 추가 금액")).toHaveValue(null);
  });

  it("0을 지우면 빈 칸으로 남는다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");

    const price = screen.getByLabelText("옵션 값 1 추가 금액");
    expect(price).toHaveValue(0);

    await user.clear(price);

    // undefined로 비우면 RHF가 defaultValues의 0을 되돌려 넣는다. null이어야 빈 칸이 유지된다.
    expect(price).toHaveValue(null);
  });
});

describe("노출 조건", () => {
  const OTHER_OPTION_ID = "optionbbbbbbbbbbbbbbbbbbbbb";

  it("조건으로 쓸 다른 옵션이 없으면 조건을 추가할 수 없다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);
    await openGroup(user, "원두");

    expect(screen.getByRole("button", { name: "+ 조건 추가" })).toBeDisabled();
    expect(
      screen.getByText(
        "조건으로 쓸 다른 옵션이 없습니다. 조건이 될 옵션을 먼저 저장해 주세요."
      )
    ).toBeInTheDocument();
  });

  it("조건 후보에서 자기 자신은 빠진다", async () => {
    const user = userEvent.setup();
    renderOptions([
      buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa", name: "온도" }),
      buildOption({ publicId: OTHER_OPTION_ID, name: "샷" }),
    ]);

    const target = await openGroup(user, "온도");
    await user.click(
      within(target).getByRole("button", { name: "+ 조건 추가" })
    );

    // 선택 방식·상태는 모두 탭이라, 시트에 남는 셀렉트는 조건 셀렉트뿐이다.
    await user.click(within(target).getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "샷" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "온도" })).toBeNull();
  });

  it("조건을 삭제하면 줄이 사라진다", async () => {
    const user = userEvent.setup();
    renderOptions([
      buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa", name: "온도" }),
      buildOption({ publicId: OTHER_OPTION_ID, name: "샷" }),
    ]);

    const target = await openGroup(user, "온도");
    await user.click(
      within(target).getByRole("button", { name: "+ 조건 추가" })
    );
    expect(within(target).getAllByRole("combobox")).toHaveLength(1);

    await user.click(within(target).getByRole("button", { name: "조건 삭제" }));
    expect(within(target).queryAllByRole("combobox")).toHaveLength(0);
  });
});

describe("저장 전 검증", () => {
  it("옵션 이름이 비어 있으면 메시지를 보여준다", async () => {
    const user = userEvent.setup();
    renderOptions();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));
    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(
      await screen.findByText("옵션 이름은 필수입니다.")
    ).toBeInTheDocument();
  });

  /** 같은 메뉴 안에서만 유일하면 되는 규칙이라 스키마가 아니라 카드가 판정한다. */
  it("같은 메뉴에 이미 있는 이름이면 메시지를 보여준다", async () => {
    const user = userEvent.setup();
    renderOptions([buildOption({ publicId: "optionaaaaaaaaaaaaaaaaaaaaa" })]);

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    const draft = sheet("새 옵션 그룹");
    await user.type(within(draft).getByLabelText("옵션 이름"), "원두");
    await user.type(within(draft).getByLabelText("옵션 값 1 이름"), "케냐");
    await user.click(within(draft).getByRole("button", { name: "추가하기" }));

    expect(
      await screen.findByText("이미 있는 옵션 이름입니다.")
    ).toBeInTheDocument();
  });
});
