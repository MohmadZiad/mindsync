"use client";
import React, { useEffect, useRef } from "react";
import cloud from "d3-cloud";
import * as d3 from "d3";

type Word = { text: string; value: number };

// الكلمات بعد تخطيط d3-cloud (بتصير فيها إحداثيات وحجم ودوران)
type CloudWord = Word & {
  x: number;
  y: number;
  rotate: number;
  size: number;
};

type Lang = "en" | "ar";

const T = {
  en: { title: "Notes Word Cloud" },
  ar: { title: "سحابة الكلمات" },
} as const;

export default function NotesWordCloud({
  words,
  lang = "en",
  title,
}: {
  words: Word[];
  lang?: Lang;
  title?: React.ReactNode;
}) {
  const t = T[lang];
  const heading = title ?? t.title;
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

      .on("end", (out: Word[]) => draw(out as unknown as CloudWord[]));

    layout.start();

    function draw(nodes: CloudWord[]) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", 600)
        .attr("height", 260);
      svg.selectAll("*").remove();

      const palette = d3.schemeCategory10 as readonly string[];

      svg
        .append("g")
        .attr("transform", "translate(300,130)")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", "sans-serif")
        .style(
          "fill",
          () => palette[Math.floor(Math.random() * palette.length)]
        )
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d) => d.text);
    }
  }, [words]);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="border rounded-2xl p-3 bg-[var(--bg-1)]"
    >
      <div className="mb-2 font-semibold">{heading}</div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
