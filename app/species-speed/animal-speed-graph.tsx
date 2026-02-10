/* eslint-disable */
"use client";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { csv } from "d3-fetch";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

// Interface
interface AnimalDatum {
  name: string;
  speed: number;
  diet: "herbivore" | "omnivore" | "carnivore";
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV data
  useEffect(() => {
    csv("/sample_animals.csv").then((data) => {
      const cleaned: AnimalDatum[] = data
        .filter((d) => d.name && d.speed && ["herbivore", "omnivore", "carnivore"].includes(String(d.diet)))
        .map((d) => ({
          name: String(d.name),
          speed: Number(d.speed),
          diet: d.diet as AnimalDatum["diet"],
        }));

      setAnimalData(cleaned);
    });
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const height = 400;
    const margin = { top: 70, right: 20, bottom: 90, left: 100 };

    // Design note:
    // This chart uses a data-driven width (fixed px per bar) with horizontal scrolling.
    // This ensures consistent bar spacing and label readability regardless of container size.
    const barWidth = 50;
    const barsWidth = animalData.length * barWidth;

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    // Note: The chart is composed of multiple SVGs (fixed Y axis, scrollable bars,
    // and fixed X-axis label) rather than a single root SVG.

    // Implement the rest of the graph
    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis

    // Scales
    const yScale = scaleLinear()
      .domain([0, max(animalData, (d) => d.speed)! * 1.1])
      .range([height - margin.bottom, margin.top]);

    const xScale = scaleBand()
      .domain(animalData.map((d) => d.name))
      .range([margin.left, barsWidth])
      .padding(0.3);

    const colorScale = scaleOrdinal<string>()
      .domain(["herbivore", "omnivore", "carnivore"])
      .range(["#4ade80", "#facc15", "#f87171"]);

    // Y axis
    const ySvg = select(graphRef.current)
      .append("svg")
      .attr("class", "animal-speed-yaxis")
      .attr("width", margin.left)
      .attr("height", height);

    ySvg
      .append("g")
      .attr("transform", `translate(${margin.left - 1},0)`)
      .call(axisLeft(yScale).ticks(6))
      .selectAll("text")
      .attr("class", "axis-label");

    // Y axis label
    ySvg
      .append("text")
      .attr("class", "axis-label axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(20,${height / 2}) rotate(-90)`)
      .text("Average Speed (km/h)");

    // Scrollable bars + X axis //

    // Center column: holds scrollable chart + fixed X label
    const centerCol = select(graphRef.current).append("div").attr("class", "animal-speed-center");

    // Scrollable bars container
    const scrollDiv = centerCol.append("div").attr("class", "animal-speed-scroll");

    const barsSvg = scrollDiv
      .append("svg")
      .attr("width", barsWidth + margin.right + 40)
      .attr("height", height);

    // Bars
    barsSvg
      .selectAll("rect")
      .data(animalData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.name)!)
      .attr("y", (d) => yScale(d.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.speed))
      .attr("fill", (d) => colorScale(d.diet));

    // X axis (ticks only — scrolls)
    barsSvg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(axisBottom(xScale))
      .selectAll("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    // X axis label
    const xLabelSvg = centerCol
      .append("svg")
      .attr("class", "animal-speed-xlabel")
      .attr("width", "100%")
      .attr("height", 40);

    xLabelSvg
      .append("text")
      .attr("class", "axis-label axis-title")
      .attr("x", "50%")
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text("Animal");

    // Legend
    const legendSvg = select(graphRef.current)
      .append("svg")
      .attr("class", "animal-speed-legend")
      .attr("width", 120)
      .attr("height", height);

    const diets: AnimalDatum["diet"][] = ["herbivore", "omnivore", "carnivore"];

    diets.forEach((diet, i) => {
      legendSvg
        .append("rect")
        .attr("x", 10)
        .attr("y", margin.top + i * 30)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", colorScale(diet));

      legendSvg
        .append("text")
        .attr("class", "legend-label")
        .attr("x", 40)
        .attr("y", margin.top + i * 30 + 15)
        .text(diet.charAt(0).toUpperCase() + diet.slice(1));
    });
  }, [animalData]);

  // Return the graph
  return <div ref={graphRef} className="animal-speed-wrapper" />;
}
