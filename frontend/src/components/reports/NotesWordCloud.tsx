"use client";
import React, { useEffect, useRef } from "react";
import cloud from "d3-cloud";
import * as d3 from "d3";

type Word = { text: string; value: number };
type Lang = "en" | "ar";

const T = {
  en: { title: "Notes Word Cloud" },
  ar: { title: "سحابة الكلمات" },
} as const;

export default function NotesWordCloud({
  words,
  lang = "en",
}: {
  words: Word[];
  lang?: Lang;
}) {
  const t = T[lang];
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const layout = cloud<Word>()
      .size([600, 260])
      .words(words.map((d) => ({ ...d })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("sans-serif")
      .fontSize((d) => 10 + d.value * 5)
      .on("end", draw);

    layout.start();

    function draw(words: Word[]) {
      const svg = d3.select(svgRef.current).attr("width", 600).attr("height", 260);
      svg.selectAll("*").remove();

      svg
        .append("g")
        .attr("transform", "translate(300,130)")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d: any) => `${d.size}px`)
        .style("font-family", "sans-serif")
        .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d: any) => d.text);
    }
  }, [words]);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="border rounded-2xl p-3 bg-[var(--bg-1)]">
      <div className="mb-2 font-semibold">{t.title}</div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
