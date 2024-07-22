/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_XATA_API_KEY: process.env.XATA_API_KEY,
      NEXT_PUBLIC_XATA_BRANCH: process.env.XATA_BRANCH 
    },
  };
  
  export default nextConfig;
  