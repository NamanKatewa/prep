import "./App.scss";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Navbar from "./Components/Navbar";
import Toolbar from "./Components/Toolbar";

function App() {
  const [path, setPath] = useState([]);
  const [plan, setPlan] = useState(null);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [toolMode, setToolMode] = useState("select");
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [editingNode, setEditingNode] = useState(null);
  const [editForm, setEditForm] = useState({
    label: "",
    type: "room",
    hazard: false,
  });
  const [startNodeId, setStartNodeId] = useState(null);

  const svgRef = useRef();

  const handleSaveEdit = () => {
    setPlan((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === editingNode ? { ...node, ...editForm } : node
      ),
    }));
    setEditingNode(null);
  };

  const handleEdgeClick = (event, edge) => {
    event.stopPropagation();

    if (toolMode === "delete-edge") {
      if (window.confirm("Delete this edge?")) {
        setPlan((prev) => ({
          ...prev,
          edges: prev.edges.filter(
            (e) => !(e.from === edge.from && e.to === edge.to)
          ),
        }));
      }
    }
  };

  const handleDragStart = (event, nodeId) => {
    if (toolMode !== "select") return;
    event.sourceEvent.stopPropagation();
  };

  const handleDragging = (event, nodeId) => {
    if (toolMode !== "select") return;

    const gridSpacing = 50;

    const newX = Math.round(event.x / gridSpacing) * gridSpacing;
    const newY = Math.round(event.y / gridSpacing) * gridSpacing;

    setPlan((prevPlan) => ({
      ...prevPlan,
      nodes: prevPlan.nodes.map((node) =>
        node.id === nodeId ? { ...node, x: newX, y: newY } : node
      ),
    }));
  };

  const handleDragEnd = (event, nodeId) => {
    if (toolMode !== "select") return;
  };
  useEffect(() => {
    if (!plan) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const gridSpacing = 50;
    const numColumns = Math.floor(plan.dimensions.width / gridSpacing);
    const numRows = Math.floor(plan.dimensions.height / gridSpacing);

    svg
      .append("rect")
      .attr("width", plan.dimensions.width)
      .attr("height", plan.dimensions.height)
      .attr("fill", "#f0f0f0")
      .on("click", handleSvgClick);

    for (let i = 0; i <= numRows; i++) {
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", i * gridSpacing)
        .attr("x2", plan.dimensions.width)
        .attr("y2", i * gridSpacing)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);
    }

    for (let i = 0; i <= numColumns; i++) {
      svg
        .append("line")
        .attr("x1", i * gridSpacing)
        .attr("y1", 0)
        .attr("x2", i * gridSpacing)
        .attr("y2", plan.dimensions.height)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);
    }

    const pathGroup = svg.append("g").attr("class", "paths");
    const edgeGroup = svg.append("g").attr("class", "edges");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    plan.edges.forEach((edge) => {
      const fromNode = plan.nodes.find((n) => n.id === edge.from);
      const toNode = plan.nodes.find((n) => n.id === edge.to);

      edgeGroup
        .append("line")
        .attr("x1", fromNode.x)
        .attr("y1", fromNode.y)
        .attr("x2", toNode.x)
        .attr("y2", toNode.y)
        .attr("stroke", edge.status === "blocked" ? "red" : "black")
        .attr("stroke-width", 2)
        .attr("cursor", toolMode === "delete-edge" ? "pointer" : "default")
        .on("click", (event) => handleEdgeClick(event, edge));
    });

    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const fromNode = plan.nodes[path[i]];
        const toNode = plan.nodes[path[i + 1]];

        if (!fromNode || !toNode) continue;

        pathGroup
          .append("line")
          .attr("x1", fromNode.x)
          .attr("y1", fromNode.y)
          .attr("x2", toNode.x)
          .attr("y2", toNode.y)
          .attr("stroke", "orange")
          .attr("stroke-width", 4)
          .attr("stroke-dasharray", "6 4");
      }
    }

    const colorMap = {
      room: "steelblue",
      hallway: "gray",
      exit: "green",
    };

    plan.nodes.forEach((node) => {
      nodeGroup
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", 8)
        .attr("fill", () =>
          node.id === startNodeId
            ? "orange" // starting node
            : node.hazard
            ? "red"
            : colorMap[node.type]
        )
        .attr("cursor", toolMode === "select" ? "move" : "pointer")
        .call(
          d3
            .drag()
            .on("start", (event) => handleDragStart(event, node.id))
            .on("drag", (event) => handleDragging(event, node.id))
            .on("end", (event) => handleDragEnd(event, node.id))
        )
        .on("click", (event) => handleNodeClick(event, node.id));

      nodeGroup
        .append("text")
        .attr("x", node.x + 10)
        .attr("y", node.y - 10)
        .attr("font-size", "10px")
        .text(node.label);
    });
  }, [plan, toolMode, selectedNodes, path]);

  const handleSvgClick = (event) => {
    if (toolMode !== "add-node") return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());

    const newNode = {
      id: crypto.randomUUID(),
      x: cursorpt.x,
      y: cursorpt.y,
      type: "room",
      label: "New Room",
      hazard: false,
    };

    setPlan((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  };

  const handleNodeClick = (event, nodeId) => {
    event.stopPropagation();

    const node = plan.nodes.find((n) => n.id === nodeId);

    if (toolMode === "add-edge") {
      if (selectedNodes.length === 0) {
        setSelectedNodes([nodeId]);
      } else {
        const newEdge = {
          from: selectedNodes[0],
          to: nodeId,
          weight: 1,
          status: "open",
        };
        setPlan((prevPlan) => ({
          ...prevPlan,
          edges: [...prevPlan.edges, newEdge],
        }));
        setSelectedNodes([]);
      }
    } else if (toolMode === "delete") {
      if (window.confirm("Delete this node?")) {
        deleteNode(nodeId);
      }
    } else if (toolMode === "select") {
      setEditingNode(nodeId);
      setEditForm({
        label: node.label,
        type: node.type,
        hazard: node.hazard,
      });
    }
  };

  const deleteNode = (nodeId) => {
    setPlan((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    }));
  };

  return (
    <div className="App">
      <Navbar
        plan={plan}
        setPlan={setPlan}
        width={width}
        setWidth={setWidth}
        height={height}
        setHeight={setHeight}
      />

      <Toolbar
        setToolMode={setToolMode}
        plan={plan}
        editingNode={editingNode}
        setStartNodeId={setStartNodeId}
        startNodeId={startNodeId}
        setPath={setPath}
      />

      {plan && (
        <div className="plan">
          <svg
            ref={svgRef}
            width={plan.dimensions.width}
            height={plan.dimensions.height}
            style={{ border: "1px solid black", marginTop: "10px" }}
          ></svg>
          {editingNode && (
            <div className="edit-panel" style={{ marginTop: "20px" }}>
              <h3>Edit Node</h3>
              <div>
                <label>Label: </label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) =>
                    setEditForm({ ...editForm, label: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Type: </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                >
                  <option value="room">Room</option>
                  <option value="hallway">Hallway</option>
                  <option value="exit">Exit</option>
                </select>
              </div>
              <div>
                <label>Hazard: </label>
                <input
                  type="checkbox"
                  checked={editForm.hazard}
                  onChange={(e) =>
                    setEditForm({ ...editForm, hazard: e.target.checked })
                  }
                />
              </div>
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
