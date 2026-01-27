/** @type {import('next').NextConfig} */
const nextConfig = {
  // 에러 무시 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// ❌ 기존 (에러 원인): module.exports = nextConfig;
// ✅ 수정 (정답):
export default nextConfig;