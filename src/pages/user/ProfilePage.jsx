import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { getLoggedUser, updateProfile } from "../../api/user";
import { getMyTransactions } from "../../api/transaction";
import { User, Mail, Phone, Calendar, Check, X } from "lucide-react";
import { commonButtons } from "../../utils/buttonStyles";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profilePictureUrl: "",
  });
  const { showToast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      const result = await getLoggedUser();
      if (result.success) {
        const data = result.data.data;
        setUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          profilePictureUrl: data.profilePictureUrl || "",
        });
      } else {
        showToast("Failed to load profile", "error");
      }
    } catch {
      showToast("Error fetching profile", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const result = await getMyTransactions();
      if (result.success) {
        setTransactions(result.data.data);
      }
    } catch {
      showToast("Error fetching transactions", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, [fetchProfile, fetchTransactions]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setUser((prev) => ({ ...prev, ...formData }));
        setEditing(false);
        showToast("Profile updated successfully", "success");
      } else {
        showToast(result.error || "Failed to update profile", "error");
      }
    } catch {
      showToast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-500 to-cyan-600 py-16 text-white text-center">
        <img
          src={
            user?.profilePictureUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || "User"
            )}&background=2563eb&color=fff&size=120`
          }
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto mb-6 object-cover"
        />
        <h1 className="text-3xl font-bold">{user?.name}</h1>
        <p className="opacity-80">{user?.email}</p>
        {user?.createdAt && (
          <p className="mt-2 text-sm flex justify-center items-center gap-2">
            <Calendar className="w-4 h-4" /> Member since{" "}
            {new Date(user.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Personal Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className={commonButtons.exploreButton}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormItem
              editing={editing}
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              icon={<User />}
            />
            <FormItem
              editing={editing}
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              icon={<Mail />}
            />
            <FormItem
              editing={editing}
              label="Phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              icon={<Phone />}
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            My Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-600">You have no transactions yet.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium">{tx.activityTitle}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    Rp {tx.totalAmount?.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FormItem({ editing, label, value, onChange, type = "text", icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-400">{icon}</span>
          <span className="text-gray-900">{value || "Not provided"}</span>
        </div>
      )}
    </div>
  );
}
