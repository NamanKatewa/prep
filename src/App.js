import "./App.css";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

function App() {
  const [plan, setPlan] = useState(null);
  const svgRef = useRef();

  // Load floor plan
  useEffect(() => {
    d3.json("/floorPlan.json")
      .then((data) => setPlan(data))
      .catch((error) => console.error("Error loading floor plan:", error));
  }, []);

  // Render with D3
  useEffect(() => {
    if (!plan) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // Draw Background
    svg
      .append("rect")
      .attr("width", plan.dimensions.width)
      .attr("height", plan.dimensions.height)
      .attr("fill", "#f0f0f0");

    // Draw Grid (Optional)
    if (plan.settings.showGrid) {
      const gridSize = 50;
      for (let x = 0; x <= plan.dimensions.width; x += gridSize) {
        svg
          .append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", plan.dimensions.height)
          .attr("stroke", "#ccc");
      }
      for (let y = 0; y <= plan.dimensions.height; y += gridSize) {
        svg
          .append("line")
          .attr("x1", 0)
          .attr("y1", y)
          .attr("x2", plan.dimensions.width)
          .attr("y2", y)
          .attr("stroke", "#ccc");
      }
    }

    // Draw Edges (Connections)
    plan.edges.forEach((edge) => {
      const fromNode = plan.nodes.find((n) => n.id === edge.from);
      const toNode = plan.nodes.find((n) => n.id === edge.to);

      svg
        .append("line")
        .attr("x1", fromNode.x)
        .attr("y1", fromNode.y)
        .attr("x2", toNode.x)
        .attr("y2", toNode.y)
        .attr("stroke", edge.status === "blocked" ? "red" : "black")
        .attr("stroke-width", 2);
    });

    // Draw Nodes
    const colorMap = {
      room: "steelblue",
      hallway: "gray",
      exit: "green",
    };

    plan.nodes.forEach((node) => {
      svg
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", 5)
        .attr("fill", node.hazard ? "red" : colorMap[node.type]);

      svg
        .append("text")
        .attr("x", node.x + 15)
        .attr("y", node.y + 5)
        .attr("font-size", "10px")
        .text(node.label);
    });
  }, [plan]);

  return (
    <div className="App">
      {plan ? (
        <svg
          ref={svgRef}
          width={plan.dimensions.width}
          height={plan.dimensions.height}
        ></svg>
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default App;
