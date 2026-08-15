import { Metadata } from "next";
import SectionLayout from "../../components/SectionLayout";
import ImportMenusLink from "../add/components/ImportMenusLink";
import BulkCreateMenuForm from "./components/BulkCreateMenuForm";
import ServerPrefetch from "@/app/(navigator)/components/ServerPrefetch";
import { use } from "react";
import { DRAFT_REVIEW_PAGE_DESCRIPTION } from "../import/constants/page-copy";
import { draftIdSchema } from "@ssurak/api/schemas/model/menuDraft.schema";
import { menuDraftUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";

export const metadata: Metadata = {
  title: "여러 메뉴 추가 - ssurak",
  description: "여러 메뉴를 한 번에 추가하는 페이지입니다",
};

export default function MenuBulkCreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ draftId?: string }>;
}) {
  const { storeId } = use(params);
  const { draftId } = use(searchParams);

  const validatedDraftId = draftIdSchema.safeParse(draftId ?? "");
  const draftUrl = validatedDraftId.success
    ? menuDraftUrl(storeId, validatedDraftId.data)
    : null;

  return (
    <SectionLayout
      title="여러 메뉴 추가"
      description={DRAFT_REVIEW_PAGE_DESCRIPTION}
      renderRightHeader={<ImportMenusLink />}
    >
      <ServerPrefetch url={`/stores/v1/${storeId}/menus`}>
        {draftUrl ? (
          <ServerPrefetch url={draftUrl}>
            <BulkCreateMenuForm />
          </ServerPrefetch>
        ) : (
          <BulkCreateMenuForm />
        )}
      </ServerPrefetch>
    </SectionLayout>
  );
}
