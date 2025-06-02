import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust if your backend runs elsewhere

export default function RealTimeChart() {
  const [data, setData] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const maxPoints = 100;
  const timeRef = useRef(0);

  useEffect(() => {
    if (!capturing) return;

    const handler = (value) => {
      const y = parseFloat(value);
      if (!isNaN(y)) {
        timeRef.current += 1;
        setData((prevData) => {
          const newData = [...prevData, { x: timeRef.current, y }];
          return newData.slice(-maxPoints); // Keep only last N points
        });
      }
    };

    socket.on("signalData", handler);
    return () => {
      socket.off("signalData", handler);
    };
  }, [capturing]);

  const handleStart = () => {
    socket.emit("startCapture");
    setCapturing(true);
  };

  const handleStop = () => {
    socket.emit("stopCapture");
    setCapturing(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Signal</h2>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleStart}
          disabled={capturing}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!capturing}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <LineChart width={800} height={400} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="x" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#8884d8" dot={false} />
      </LineChart>
    </div>
  );
}
