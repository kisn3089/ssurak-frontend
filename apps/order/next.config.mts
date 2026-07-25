import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// remotePatterns 는 빌드 타임에 고정되므로 런타임 주입으로는 반영되지 않는다.
// 값이 없으면 이미지가 전부 400 으로 떨어지니 빌드 단계에서 바로 실패시킨다.
const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;
if (!imageHostname) {
  throw new Error(
    "NEXT_PUBLIC_IMAGE_HOSTNAME 이 설정되지 않았습니다. apps/order/.env 를 확인하세요.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  devIndicators: false,
  reactCompiler: true,
  transpilePackages: ["@ssurak/ui", "@ssurak/api", "@ssurak/auth"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: imageHostname,
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일: 메뉴 이미지는 자주 바뀌지 않으므로 길게 캐싱
  },
};

export default nextConfig;
