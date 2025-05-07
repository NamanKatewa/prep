import { dijkstraPath } from "../helpers/pathfinding";
import "./Toolbar.scss";

const Toolbar = ({
  setToolMode,
  plan,
  editingNode,
  setStartNodeId,
  startNodeId,
  setPath,
}) => {
  const handleVisualizePath = () => {
    if (!plan) return;

    const edges = plan.edges.map((e) => ({
      from: plan.nodes.findIndex((n) => n.id === e.from),
      to: plan.nodes.findIndex((n) => n.id === e.to),
      weight: e.weight,
      status: e.status === "blocked" ? 1 : 0,
    }));

    const nodes = plan.nodes;

    const startIdx = nodes.findIndex((n) => n.id === startNodeId);
    const endIdx = nodes.findIndex((n) => n.type === "exit");

    if (startIdx === -1 || endIdx === -1) {
      console.warn("Start or End node not found.");
      return;
    }

    const path = dijkstraPath(edges, nodes.length, startIdx, endIdx);
    console.log(
      "Computed path:",
      path.map((i) => nodes[i].label)
    );
    setPath(path);
  };
  return plan ? (
    <div className="toolbar">
      <button onClick={() => setToolMode("add-node")}>Add Node</button>
      <button onClick={() => setToolMode("add-edge")}>Add Edge</button>
      <button onClick={() => setToolMode("delete")}>Delete Node</button>
      <button onClick={() => setToolMode("delete-edge")}>Delete Edge</button>
      <button onClick={() => setToolMode("select")}>Select/Edit</button>
      {plan.nodes.find((n) => n.id === editingNode)?.type !== "exit" && (
        <button onClick={() => setStartNodeId(editingNode)}>
          Set as Start Node
        </button>
      )}
      <button onClick={handleVisualizePath}>Visualize Escape Route</button>
    </div>
  ) : null;
};

export default Toolbar;
