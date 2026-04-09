// This file documents how to generate OG images with Next.js ImageResponse
// For now, we use a static OG image at /public/og-image.png
// When ready to use dynamic OG, rename this to opengraph-image.tsx

// import { ImageResponse } from "next/og"
//
// export const runtime = "edge"
// export const alt = "WalletRoast — The brutally honest personal finance app"
// export const size = { width: 1200, height: 630 }
// export const contentType = "image/png"
//
// export default async function Image() {
//   return new ImageResponse(
//     (
//       <div style={{
//         background: "linear-gradient(135deg, #0a0a0c 0%, #1a0a00 100%)",
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         fontFamily: "Inter, sans-serif",
//       }}>
//         <div style={{ fontSize: 80, fontWeight: 900, color: "white", textAlign: "center", lineHeight: 1.1 }}>
//           Stop Being Broke.
//         </div>
//         <div style={{
//           fontSize: 80,
//           fontWeight: 900,
//           background: "linear-gradient(90deg, #f97316, #ef4444)",
//           backgroundClip: "text",
//           color: "transparent",
//           textAlign: "center",
//           lineHeight: 1.1,
//         }}>
//           Start Taking Control.
//         </div>
//         <div style={{ fontSize: 28, color: "#71717a", marginTop: 32, textAlign: "center" }}>
//           The personal finance app that tells you the truth about your money.
//         </div>
//         <div style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//           marginTop: 48,
//           padding: "16px 32px",
//           background: "linear-gradient(90deg, #f97316, #ea580c)",
//           borderRadius: 16,
//           fontSize: 24,
//           fontWeight: 700,
//           color: "white",
//         }}>
//           🔥 WalletRoast
//         </div>
//       </div>
//     ),
//     { ...size }
//   )
// }
export {}
