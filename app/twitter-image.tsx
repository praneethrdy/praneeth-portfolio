import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = "Praneeth Reddy, Java backend engineer, open to backend roles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A small service graph drawn as dots and lines, echoing the site's hero.
const nodes = [
  [760, 170], [880, 120], [1000, 200], [930, 320], [1080, 360], [820, 430], [1010, 500],
];
const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 3]];

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(120% 90% at 75% 40%, #0a1820 0%, #05080b 60%)",
          color: "#e7eef2",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#2ee6ff" strokeOpacity="0.35" strokeWidth="2" />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 3 ? 22 : 12} fill={i === 3 ? "#2ee6ff" : "#0f6f80"} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "72px", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#2ee6ff", letterSpacing: 2 }}>{"{ pr }"}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>
            <span>{profile.firstName}</span>
            <span>{profile.lastName}</span>
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#7f8f9a" }}>Java backend engineer · Quarkus · gRPC · PostgreSQL</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              fontSize: 24,
              color: "#2ee6ff",
              border: "2px solid #0f6f80",
              borderRadius: 999,
              padding: "8px 20px",
              width: 360,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#2ee6ff" }} />
            {profile.status}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
