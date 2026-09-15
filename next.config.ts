import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Tailwind CSS v4 generates @layer properties (CSS Houdini @property polyfill)
    // in its PostCSS output. Turbopack's built-in CSS parser (lightningcss) in
    // Next.js 16.3.5 does not yet support this syntax, causing "Invalid dangling
    // combinator in selector". ignoreIssue suppresses this known incompatibility
    // so the rest of the CSS compiles and renders correctly.
    ignoreIssue: [
      {
        path: "**/*.css",
        title: "Parsing CSS source code failed",
      },
    ],
  },
};

export default nextConfig;