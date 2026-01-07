"use client";

import { Search, Bell, ChevronDown, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import socketService from "@/lib/socket/socket.service";
import { logout } from "@/lib/features/auth/authSlice";

interface Notification {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: string;
}

export default function AdminHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch initial notifications from backend
    fetchNotifications();
    
    // Listen for sale started notifications
    const handleSaleStarted = (data: any) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: `Sale Started: ${data.productName || "Product"}`,
        amount: data.salePrice || 0,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: "Sale",
      };
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Optional: Play a sound or show browser notification
      if (document.hidden && Notification.permission === "granted") {
        new Notification("Sale Started!", {
          body: `${data.productName} is now on sale!`,
        });
      }
    };

    const handleNewOrder = (data: any) => {
       const newNotification: Notification = {
        id: Date.now().toString(),
        title: `New Order: #${data.orderId?.slice(-4) || "0000"}`,
        amount: data.totalAmount || 0,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: "New",
      };
      setNotifications((prev) => [newNotification, ...prev]);
    };

    socketService.onSaleStarted(handleSaleStarted);
    socketService.onNotification(handleNewOrder);
    
    // Request permission for browser notifications
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socketService.off("saleStarted");
      socketService.off("notification");
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const formattedNotifications = data.map((notif: any) => ({
          id: notif._id,
          title: notif.title,
          amount: notif.data?.totalAmount || notif.data?.points || 0,
          date: new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: notif.type,
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Search products
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?search=${searchQuery}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    socketService.disconnect();
    router.push("/auth/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left"></div>

      <div className="header-right">
        {/* Search */}
        <div className="relative">
          <button
            className="header-icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={20} />
          </button>

          {searchOpen && (
            <div className="search-dropdown">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="search-input"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="search-close"
                >
                  <X size={18} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <div className="search-results-header">Products</div>
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => {
                        router.push(`/admin/products/${product._id}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      {product.title}
                    </div>
                  ))}
                  <button
                    className="search-view-all"
                    onClick={() => {
                      router.push(`/admin/products?search=${searchQuery}`);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    See all products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="header-icon-btn relative"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3 className="notifications-title">Notifications</h3>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="notifications-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon"></div>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-amount">₹{notification.amount}</p>
                      <p className="notification-date">{notification.date}</p>
                    </div>
                    <span className="notification-status">{notification.status}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                   <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                )}
              </div>

              <div className="notifications-footer">
                <button 
                  className="mark-read-btn"
                  onClick={() => setNotifications([])}
                >
                  ✓ MARK ALL AS READ
                </button>
                <button className="view-all-notifications-btn">
                  VIEW ALL NOTIFICATON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Dropdown */}
        <div className="admin-dropdown">
          <button
            className="admin-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="admin-name">ADMIN</span>
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">{user?.name || "Admin"}</div>
              <div className="dropdown-item dropdown-item-clickable">
                CHANGE PASSWORD
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item dropdown-logout"
                onClick={handleLogout}
              >
                LOG OUT
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
