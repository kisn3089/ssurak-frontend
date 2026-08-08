import {
  MenuOptionChoice,
  MenuOptionGroup,
  OptionChoiceState,
  OptionSelectionType,
} from "@ssurak/api/types/menu/menuOptions.interface";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeAll, describe, expect, it } from "vitest";
import OptionFormField from "../../components/form/OptionFormField";
import OptionFields from "../add/components/OptionFields";
import useOptionPreviewDrafts, {
  OptionPreviewDraftContext,
} from "../hooks/useOptionPreviewDrafts";
import { mergePreviewOptions } from "../utils/option-preview";

/** Radix Select가 쓰는 API는 jsdom에 없다 (OptionFormField.test.tsx와 같은 이유) */
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

const OPTION_ID = "optionaaaaaaaaaaaaaaaaaaaaa";

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
  overrides: Partial<MenuOptionGroup> = {}
): MenuOptionGroup {
  return {
    publicId: OPTION_ID,
    name: "원두",
    selectionType: OptionSelectionType.SINGLE,
    required: true,
    minSelect: 1,
    maxSelect: 1,
    sortOrder: 10,
    enabled: true,
    trigger: null,
    choices: [
      buildChoice({ publicId: "choiceaaaaaaaaaaaaaaaaaaaa", name: "케냐" }),
    ],
    ...overrides,
  };
}

/**
 * MenuForm과 같은 조립: 카드들은 컨텍스트로 편집 중인 값을 올리고, 미리보기는 저장된
 * 목록 위에 그 값을 덮어 그린다. 여기서는 미리보기 대신 이름만 나열해 확인한다.
 */
function PreviewHarness({ savedOptions }: { savedOptions: MenuOptionGroup[] }) {
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const { drafts, setDrafts } = useOptionPreviewDrafts();

  const previewOptions = mergePreviewOptions(savedOptions, draftIds, drafts);

  return (
    <>
      <OptionPreviewDraftContext.Provider value={setDrafts}>
        <OptionFormField
          id="menu-options"
          label="옵션"
          onAddOptionGroup={() =>
            setDraftIds((previous) => [
              ...previous,
              `draft-${previous.length + 1}`,
            ])
          }
        >
          {savedOptions.map((option) => (
            <OptionFields
              key={option.publicId}
              formId={option.publicId}
              option={option}
              savedOptions={savedOptions}
            />
          ))}
          {draftIds.map((draftId) => (
            <OptionFields
              key={draftId}
              formId={draftId}
              savedOptions={[]}
              onDiscard={() =>
                setDraftIds((previous) =>
                  previous.filter((id) => id !== draftId)
                )
              }
            />
          ))}
        </OptionFormField>
      </OptionPreviewDraftContext.Provider>

      <ul aria-label="미리보기 옵션">
        {previewOptions.map((option) => (
          <li key={option.publicId}>
            {option.name}
            <ul aria-label={`${option.name} 선택지`}>
              {option.choices.map((choice) => (
                <li key={choice.publicId}>
                  {choice.name} {choice.priceDelta}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

function renderPreview(savedOptions: MenuOptionGroup[] = []) {
  return render(<PreviewHarness savedOptions={savedOptions} />);
}

/** 시트가 열려 있으면 미리보기는 aria-hidden 뒤로 빠지므로 hidden까지 훑는다. */
const preview = () =>
  screen.getByRole("list", { name: "미리보기 옵션", hidden: true });

const previewChoices = (optionName: string) =>
  screen.getByRole("list", { name: `${optionName} 선택지`, hidden: true });

/** 줄(그립을 뺀 나머지 전체가 버튼이다)을 눌러 편집 시트를 연다. */
async function openGroup(
  user: ReturnType<typeof userEvent.setup>,
  name: string
) {
  const row = screen.getByRole("group", { name });
  await user.click(within(row).getByText(name));
  return screen.getByRole("dialog", { name });
}

/** 시트가 열려 있는 동안은 뒤의 미리보기가 접근성 트리에서 빠지므로, 확인 전에 닫는다. */
async function closeSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

describe("옵션 편집 중 미리보기", () => {
  it("저장된 옵션은 편집 전에도 미리보기에 그대로 있다", () => {
    renderPreview([buildOption()]);

    expect(within(preview()).getByText("원두")).toBeInTheDocument();
  });

  it("옵션 이름을 고치면 저장 전에도 미리보기가 따라온다", async () => {
    const user = userEvent.setup();
    renderPreview([buildOption()]);
    await openGroup(user, "원두");

    await user.clear(screen.getByLabelText("옵션 이름"));
    await user.type(screen.getByLabelText("옵션 이름"), "원두 선택");

    expect(within(preview()).getByText("원두 선택")).toBeInTheDocument();
    expect(within(preview()).queryByText("원두")).toBeNull();
  });

  it("선택지 이름과 추가 금액도 입력하는 대로 반영된다", async () => {
    const user = userEvent.setup();
    renderPreview([buildOption()]);
    await openGroup(user, "원두");

    await user.clear(screen.getByLabelText("옵션 값 1 이름"));
    await user.type(screen.getByLabelText("옵션 값 1 이름"), "콜롬비아");
    await user.type(screen.getByLabelText("옵션 값 1 추가 금액"), "500");

    expect(
      within(previewChoices("원두")).getByText("콜롬비아 500")
    ).toBeInTheDocument();
  });

  /** 저장 버튼을 누르지 않고 나간 편집이 목록 줄·미리보기에 남으면 서버에 없는 값을 보여주게 된다. */
  it("저장된 그룹은 저장하지 않고 시트를 닫으면 저장된 값으로 되돌아간다", async () => {
    const user = userEvent.setup();
    renderPreview([buildOption()]);
    await openGroup(user, "원두");

    await user.clear(screen.getByLabelText("옵션 이름"));
    await user.type(screen.getByLabelText("옵션 이름"), "원두 선택");
    await user.clear(screen.getByLabelText("옵션 값 1 이름"));
    await user.type(screen.getByLabelText("옵션 값 1 이름"), "콜롬비아");
    await closeSheet(user);

    expect(screen.getByRole("group", { name: "원두" })).toBeInTheDocument();
    expect(within(preview()).getByText("원두")).toBeInTheDocument();
    expect(within(preview()).queryByText("원두 선택")).toBeNull();
    expect(
      within(previewChoices("원두")).getByText("케냐 0")
    ).toBeInTheDocument();
  });

  /** 이름도 선택지도 비어 있는 초안은 미리보기에 빈 칸으로 서면 안 된다. */
  it("추가만 하고 아무것도 입력하지 않은 그룹은 미리보기에 서지 않는다", async () => {
    const user = userEvent.setup();
    renderPreview();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));
    await closeSheet(user);

    expect(within(preview()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("저장 전 새 그룹도 입력하는 대로 미리보기에 붙는다", async () => {
    const user = userEvent.setup();
    renderPreview([buildOption()]);

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));

    const draft = screen.getByRole("dialog", { name: "새 옵션 그룹" });
    await user.type(within(draft).getByLabelText("옵션 이름"), "온도");
    await user.type(within(draft).getByLabelText("옵션 값 1 이름"), "아이스");
    await closeSheet(user);

    expect(within(preview()).getByText("온도")).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "온도 선택지" })).getByText(
        "아이스 0"
      )
    ).toBeInTheDocument();
  });

  /** 카드가 사라졌는데 미리보기에 남으면 손님 화면에 없는 옵션을 보여주게 된다. */
  it("초안을 삭제하면 미리보기에서도 빠진다", async () => {
    const user = userEvent.setup();
    renderPreview();

    await user.click(screen.getByRole("button", { name: "+ 옵션 그룹 추가" }));
    await user.type(screen.getByLabelText("옵션 이름"), "온도");
    await closeSheet(user);
    expect(within(preview()).getByText("온도")).toBeInTheDocument();

    await openGroup(user, "온도");
    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.keyboard("{Enter}");

    expect(within(preview()).queryByText("온도")).toBeNull();
  });
});
