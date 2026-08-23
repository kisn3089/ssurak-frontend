import QrEntryLoadingView from "./QrEntryLoadingView";

export default async function QrEntryPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const { qrCode } = await params;
  const enterHref = `/qr/${encodeURIComponent(qrCode)}/enter`;

  return (
    <>
      <QrEntryLoadingView />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(enterHref)})`,
        }}
      />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${enterHref}`} />
      </noscript>
    </>
  );
}
