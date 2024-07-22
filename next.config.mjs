/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_XATA_API_KEY: process.env.NEXT_PUBLIC_XATA_API_KEY,
      XATA_BRANCH: process.env.XATA_BRANCH 
    },
  };
  
  export default nextConfig;
  