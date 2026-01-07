import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  comparison: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export default function StatCard({ title, value, comparison, icon: Icon, trend = "up" }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon-wrapper">
          <Icon size={24} className="stat-icon" />
        </div>
        <button className="stat-menu-btn">⋮</button>
      </div>
      
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <div className="stat-comparison">
          {trend === "up" ? (
            <TrendingUp size={16} className="trend-icon trend-up" />
          ) : (
            <TrendingDown size={16} className="trend-icon trend-down" />
          )}
          <span className={trend === "up" ? "trend-up" : "trend-down"}>
            {comparison}
          </span>
        </div>
      </div>
    </div>
  );
}
