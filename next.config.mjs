/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      XATA_API_KEY: process.env.XATA_API_KEY,
      XATA_BRANCH: process.env.XATA_BRANCH 
    },
  };
  
  export default nextConfig;
  