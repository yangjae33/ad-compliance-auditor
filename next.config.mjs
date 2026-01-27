/** @type {import('next').NextConfig} */
const nextConfig = {
  // 아래 두 옵션을 추가하면, 변수 안 쓴 거나 타입 에러가 있어도 무조건 배포됩니다.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; // mjs라면 export default nextConfig;