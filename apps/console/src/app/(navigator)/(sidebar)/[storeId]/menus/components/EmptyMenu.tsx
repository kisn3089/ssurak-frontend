import ImportMenusLink from "../add/components/ImportMenusLink";

export default function EmptyMenu() {
  return (
    <div className="grid place-content-center min-h-96 text-center">
      <h1 className="font-bold text-2xl pb-2">아직 등록된 메뉴가 없습니다.</h1>
      <p className="font-semibold mb-8">
        메뉴판이나 포스기 사진을 업로드하여 한 번에 여러 메뉴를 추가해 보세요.
      </p>
      <ImportMenusLink />
    </div>
  );
}
