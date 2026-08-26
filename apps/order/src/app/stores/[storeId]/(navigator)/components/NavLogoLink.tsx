import Link from "next/link";
import Image from "next/image";
import StoreName from "./StoreName";

export default function NavLogoLink({ storeId }: { storeId: string }) {
  return (
    <Link href={`/stores/${storeId}`}>
      <div className="flex items-center gap-x-2">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={20}
          height={20}
          className="w-5"
          loading="eager"
        />
        <StoreName />
      </div>
    </Link>
  );
}
