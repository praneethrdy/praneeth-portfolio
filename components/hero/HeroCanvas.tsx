"use client";

import dynamic from "next/dynamic";

// three.js needs the browser, so the scene is only loaded on the client.
const SystemScene = dynamic(() => import("./SystemScene"), { ssr: false });

export default function HeroCanvas() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-0">
      <SystemScene />
    </div>
  );
}
