import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface TunnelEntry {
  id: string;
  humidity: number;
  temperature: number;
  timestamp: number;
  tunnelId: number;
}

const TunnelDashboard: React.FC = () => {
  const [data, setData] = useState<TunnelEntry[]>([]);

  useEffect(() => {
    const tunnelRef = ref(database, "tunel1");

    const unsubscribe = onValue(tunnelRef, (snapshot) => {
      const dbData = snapshot.val();
      if (dbData) {
        const formatted: TunnelEntry[] = Object.keys(dbData)
          .map((key) => ({
            id: key,
            humidity: Number(dbData[key].humidity),
            temperature: Number(dbData[key].temperature),
            timestamp: Number(dbData[key].timestamp),
            tunnelId: Number(dbData[key].tunnelId),
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setData(formatted);
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-gray-900 min-h-screen text-white">
      {/* Duży kafelek z aktualnymi wartościami */}
      <div className="bg-gray-800 rounded-xl p-10 text-center shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Aktualne dane</h2>
        {latest ? (
          <>
            <div className="text-6xl font-bold text-orange-400">
              {latest.temperature}°C
            </div>
            <div className="text-4xl mt-2 text-blue-400">
              Wilgotność: {latest.humidity}%
            </div>
          </>
        ) : (
          <p className="text-xl text-gray-300">Ładowanie danych...</p>
        )}
      </div>

      {/* Kafelek z wykresem */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Historia temperatury i wilgotności
        </h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#555" strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#ccc"
                minTickGap={20}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "°C",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#ccc",
                }}
                stroke="#ff5722"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "%",
                  angle: 90,
                  position: "insideRight",
                  fill: "#ccc",
                }}
                stroke="#2196f3"
              />
              <Tooltip
                labelFormatter={(label) => formatTime(label as number)}
                contentStyle={{
                  backgroundColor: "#333",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#ff5722"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#2196f3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400">Ładowanie danych...</p>
        )}
      </div>
    </div>
  );
};

export default TunnelDashboard;
