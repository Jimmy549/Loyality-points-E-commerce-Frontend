"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { User, Mail, Shield, Award, Calendar, MapPin, Phone, Edit, Package } from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567", // Mock data
    address: "123 Main St, New York, NY 10001", // Mock data
    joinDate: "January 2024" // Mock data
  });

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else {
        setIsLoading(false);
        setUserInfo({
          name: user?.name || "Guest User",
          email: user?.email || "guest@example.com",
          phone: "+1 (555) 123-4567",
          address: "123 Main St, New York, NY 10001",
          joinDate: "January 2024"
        });
      }
    }
  }, [isAuthenticated, loading, router, user]);

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update user info
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { name: "Platinum", color: "text-purple-600", bg: "bg-purple-100" };
    if (points >= 500) return { name: "Gold", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (points >= 100) return { name: "Silver", color: "text-gray-600", bg: "bg-gray-100" };
    return { name: "Bronze", color: "text-orange-600", bg: "bg-orange-100" };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const loyaltyTier = getLoyaltyTier(user.loyaltyPoints);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-white/80">{user.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                {user.role === 'USER' && (
                  <span className={`px-3 py-1 rounded-full text-sm ${loyaltyTier.bg} ${loyaltyTier.color} bg-opacity-20`}>
                    {loyaltyTier.name} Member
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    className="w-full mt-1 px-2 py-1 border rounded"
                  />
                ) : (
                  <p className="text-gray-900">{userInfo.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Email Address</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    className="w-full mt-1 px-2 py-1 border rounded"
                  />
                ) : (
                  <p className="text-gray-900">{userInfo.email}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Phone Number</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    className="w-full mt-1 px-2 py-1 border rounded"
                  />
                ) : (
                  <p className="text-gray-900">{userInfo.phone}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Address</p>
                {isEditing ? (
                  <textarea
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                    className="w-full mt-1 px-2 py-1 border rounded"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-900">{userInfo.address}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-gray-900">{userInfo.joinDate}</p>
              </div>
            </div>
            
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Loyalty Program - Only show for regular users */}
        {user.role === 'USER' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Loyalty Program
            </h3>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-6 rounded-lg mb-4">
                <h4 className="text-lg font-semibold mb-2">Your Points Balance</h4>
                <p className="text-4xl font-bold">{user.loyaltyPoints}</p>
                <p className="text-sm opacity-90 mt-2">Points Available</p>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${loyaltyTier.bg} ${loyaltyTier.color} font-medium`}>
                {loyaltyTier.name} Member
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="font-medium text-green-800">Earn Rate</p>
                  <p className="text-green-600">1 point per $1</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="font-medium text-blue-800">Redeem Rate</p>
                  <p className="text-blue-600">100 points = $5</p>
                </div>
              </div>
              
              {/* Progress to next tier */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress to {loyaltyTier.name === "Platinum" ? "Platinum" : "Next Tier"}</span>
                  <span className="text-sm text-gray-600">
                    {user.loyaltyPoints}/{loyaltyTier.name === "Platinum" ? "1000+" : 
                      loyaltyTier.name === "Gold" ? "1000" : 
                      loyaltyTier.name === "Silver" ? "500" : "100"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (user.loyaltyPoints / (loyaltyTier.name === "Platinum" ? 1000 : 
                        loyaltyTier.name === "Gold" ? 1000 : 
                        loyaltyTier.name === "Silver" ? 500 : 100)) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Info - Show for admin users */}
        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Admin Information
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Access Level</h4>
                <p className="text-blue-600">{user.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Permissions</h4>
                <ul className="text-green-600 text-sm space-y-1">
                  <li>• Manage Products</li>
                  <li>• View Orders</li>
                  <li>• Manage Users</li>
                  {user.role === 'SUPER_ADMIN' && <li>• System Administration</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/orders")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">View Orders</h4>
              <Package className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Check your order history</p>
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Continue Shopping</h4>
              <Shield className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Explore our products</p>
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">View Cart</h4>
              <Award className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Complete your purchase</p>
          </button>
        </div>
      </div>
    </div>
  );
}