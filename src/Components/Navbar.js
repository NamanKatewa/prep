import { useState } from "react";
import "./Navbar.scss";
import Modal from "./Modal";

const Navbar = ({ plan, setPlan, width, setWidth, height, setHeight }) => {
  const [mode, setMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <div className="navbar">
        <button
          onClick={() => {
            const layoutData = JSON.stringify(plan, null, 2);
            const blob = new Blob([layoutData], { type: "application/json" });
            const link = document.createElement("a");
            link.download = "floorPlan.json";
            link.href = URL.createObjectURL(blob);
            link.click();
          }}
        >
          Save Layout
        </button>
        <button
          onClick={() => {
            setMode("upload");
            openModal();
          }}
        >
          Upload Layout
        </button>
        <button
          onClick={() => {
            setMode("create");
            openModal();
          }}
        >
          Create New Layout
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {mode === "upload" && (
          <>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const uploadedPlan = JSON.parse(event.target.result);
                    setPlan(uploadedPlan);
                    closeModal();
                  } catch (err) {
                    alert("Invalid JSON file");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </>
        )}
        {mode === "create" && (
          <>
            <label>Width: </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(+e.target.value)}
            />
            <label>Height: </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(+e.target.value)}
            />
            <button
              onClick={() => {
                const newPlan = {
                  id: crypto.randomUUID(),
                  name: "New Plan",
                  dimensions: { width, height },
                  meta: {
                    createdBy: "User",
                    createdAt: new Date().toISOString(),
                    description: "",
                  },
                  nodes: [],
                  edges: [],
                  settings: {
                    showGrid: true,
                    snapToGrid: true,
                    pathAlgorithm: "A",
                  },
                };
                setPlan(newPlan);
                closeModal();
              }}
            >
              Create Plan
            </button>
          </>
        )}
      </Modal>
    </>
  );
};

export default Navbar;
