"use client";

import { useEffect, useState, useRef } from "react";
import { ShoppingBag, Package, CheckCircle, ArrowLeft, Calendar, Clock, X } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import SaleGraph from "@/components/admin/SaleGraph";
import BestSellers from "@/components/admin/BestSellers";
import Breadcrumb from "@/components/admin/Breadcrumb";

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  returnOrders: number;
}

interface RecentOrder {
  _id: string;
  userId: { name: string; email: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    returnOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Close calendar on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const handleApplyDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setDateRange({
        start: new Date(tempStartDate),
        end: new Date(tempEndDate)
      });
      setShowCalendar(false);
    }
  };

  const handleQuickSelect = (days: number) => {
    setDateRange({
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      end: new Date()
    });
    setShowCalendar(false);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalOrders: data.totalOrders || 126500,
          activeOrders: data.activeOrders || 126500,
          completedOrders: data.completedOrders || 126500,
          returnOrders: data.returnOrders || 126500,
        });
      }

      // Fetch recent orders
      const ordersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders?limit=6`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "badge badge-delivered";
      case "CANCELLED":
      case "CANCELED":
        return "badge badge-canceled";
      case "PENDING":
        return "badge badge-pending";
      default:
        return "badge";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb and Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb items={[{ label: "Home" }, { label: "Dashboard" }]} />
            <h1 className="page-title">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Clock size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="relative" ref={calendarRef}>
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="btn-secondary flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <Calendar size={16} />
                <span>
                  {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </button>
              
              {showCalendar && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Select Date Range</h3>
                    <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={tempStartDate || dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={tempEndDate || dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Quick Select</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleQuickSelect(7)} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Last 7 days</button>
                      <button onClick={() => handleQuickSelect(30)} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Last 30 days</button>
                      <button onClick={() => handleQuickSelect(90)} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Last 90 days</button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleApplyDateRange}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Container */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Oders"
            value={`₹${stats.totalOrders.toLocaleString()}`}
            comparison="34.7%"
            icon={ShoppingBag}
            trend="up"
          />
          <StatCard
            title="Active Orders"
            value={`₹${stats.activeOrders.toLocaleString()}`}
            comparison="34.7%"
            icon={ShoppingBag}
            trend="up"
          />
          <StatCard
            title="Completed Orders"
            value={`₹${stats.completedOrders.toLocaleString()}`}
            comparison="34.7%"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Return Orders"
            value={`₹${stats.returnOrders.toLocaleString()}`}
            comparison="34.7%"
            icon={ArrowLeft}
            trend="up"
          />
        </div>
      </div>

      {/* Analytics Container */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SaleGraph />
          </div>
          <div>
            <BestSellers />
          </div>
        </div>
      </div>

      {/* Recent Orders Container */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button className="menu-btn hover:bg-gray-100 rounded-full p-2 transition-colors duration-200">⋮</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">Lorem Ipsum</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-mono">
                      #{order._id.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                        <span className="text-xs font-medium text-white">
                          {order.userId.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 font-medium">
                        {order.userId.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${getStatusBadgeClass(order.status)} transition-all duration-200 hover:scale-105`}>
                      ● {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}