import type { NextConfig } from "next";

// No images.remotePatterns on purpose: the OWM icons are 1-3 KB PNGs served `unoptimized`.
// Add it back if any <Image> drops `unoptimized`.
const nextConfig: NextConfig = {};

export default nextConfig;
