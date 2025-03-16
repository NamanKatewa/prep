import "./App.css";
import { useEffect, useState } from "react";
import { json } from "d3";

function App() {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    json("/floorPlan.json")
      .then((data) => {
        setPlan(data);
      })
      .catch((error) => {
        console.error("Error loading floor plan:", error);
      });
  }, []);
  console.log(plan);

  return (
    <div className="App">
      {plan ? (
        <svg width={plan.dimensions.width} height={plan.dimensions.height}>
          <rect
            width={plan.dimensions.width}
            height={plan.dimensions.height}
            fill="000000"
          ></rect>
        </svg>
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default App;
