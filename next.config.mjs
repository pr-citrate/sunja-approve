import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

export default nextPWA({
    dest: "public", // sw.js 파일이 생성될 위치 (Next.js의 기본 정적 파일 폴더는 public입니다)
    register: true, // 서비스 워커 자동 등록
    skipWaiting: true, // 새 서비스 워커가 즉시 활성화되도록 함
    disable: false
})(nextConfig);
