"use client";

import { useState, useEffect } from "react";

interface SaleGraphProps {
  data?: any;
}

interface SalesData {
  period: string;
  value: number;
}

export default function SaleGraph({ data }: SaleGraphProps) {
  const [period, setPeriod] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real sales data
  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/sales?period=${period.toLowerCase()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSalesData(data.salesData || generateMockData());
      } else {
        // Fallback to mock data if API fails
        setSalesData(generateMockData());
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      setSalesData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): SalesData[] => {
    if (period === "WEEKLY") {
      return [
        { period: "MON", value: 120 },
        { period: "TUE", value: 180 },
        { period: "WED", value: 150 },
        { period: "THU", value: 220 },
        { period: "FRI", value: 280 },
        { period: "SAT", value: 350 },
        { period: "SUN", value: 200 }
      ];
    } else if (period === "YEARLY") {
      return [
        { period: "2019", value: 2800 },
        { period: "2020", value: 3200 },
        { period: "2021", value: 2900 },
        { period: "2022", value: 3800 },
        { period: "2023", value: 4200 },
        { period: "2024", value: 4800 }
      ];
    } else {
      return [
        { period: "JUL", value: 100 },
        { period: "AUG", value: 150 },
        { period: "SEP", value: 120 },
        { period: "OCT", value: 180 },
        { period: "NOV", value: 160 },
        { period: "DEC", value: 400 }
      ];
    }
  };

  const maxValue = Math.max(...salesData.map(d => d.value));
  const roundedMax = Math.ceil(maxValue / 100) * 100;

  return (
    <div className="sale-graph">
      <div className="graph-header">
        <h3 className="graph-title">Sale Graph</h3>
        <div className="graph-period-selector">
          <button
            className={`period-btn ${period === "WEEKLY" ? "active" : "inactive"}`}
            onClick={() => setPeriod("WEEKLY")}
          >
            WEEKLY
          </button>
          <button
            className={`period-btn ${period === "MONTHLY" ? "active" : "inactive"}`}
            onClick={() => setPeriod("MONTHLY")}
          >
            MONTHLY
          </button>
          <button
            className={`period-btn ${period === "YEARLY" ? "active" : "inactive"}`}
            onClick={() => setPeriod("YEARLY")}
          >
            YEARLY
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="graph-content">
            <div className="graph-y-axis">
              <span>₹{roundedMax}</span>
              <span>₹{Math.round(roundedMax * 0.75)}</span>
              <span>₹{Math.round(roundedMax * 0.5)}</span>
              <span>₹{Math.round(roundedMax * 0.25)}</span>
              <span>0</span>
            </div>
            
            <div className="graph-chart">
              <svg viewBox="0 0 600 300" className="chart-svg">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 75}
                    x2="600"
                    y2={i * 75}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}

                {/* Animated line chart */}
                <polyline
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={salesData
                    .map((item, i) => {
                      const x = (i * 600) / (salesData.length - 1);
                      const y = 300 - (item.value / roundedMax) * 300;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  style={{
                    strokeDasharray: '1000',
                    strokeDashoffset: loading ? '1000' : '0',
                    transition: 'stroke-dashoffset 2s ease-in-out'
                  }}
                />

                {/* Animated points with hover effect */}
                {salesData.map((item, i) => {
                  const x = (i * 600) / (salesData.length - 1);
                  const y = 300 - (item.value / roundedMax) * 300;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="#0EA5E9"
                        stroke="white"
                        strokeWidth="3"
                        className="transition-all duration-200 hover:r-8 cursor-pointer"
                        style={{
                          opacity: loading ? 0 : 1,
                          transition: `opacity 0.5s ease-in-out ${i * 0.1}s`
                        }}
                      />
                      {/* Tooltip on hover */}
                      <text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontWeight="600"
                        className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      >
                        ₹{item.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="graph-x-axis">
            {salesData.map((item) => (
              <span key={item.period}>{item.period}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
