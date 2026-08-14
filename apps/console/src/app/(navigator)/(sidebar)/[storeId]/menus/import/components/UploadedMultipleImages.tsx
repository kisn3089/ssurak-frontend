export default function UploadedMultipleImages({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-bold text-xl">올린 사진 확인</h3>
      {children}
    </div>
  );
}
