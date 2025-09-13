import React, { useRef, useEffect, useState } from "react";
import { Gift, Plane, Info, Bell, Dot } from "lucide-react";

const exampleNotifications = [
  {
    id: 1,
    type: "promo",
    title: "Special Promo! Get 20% off Bali Tours this week.",
    description: "Enjoy exclusive discounts for Bali activities until Sunday.",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: 2,
    type: "booking",
    title: "Booking Confirmed",
    description: "Your booking for Lombok Snorkeling is confirmed.",
    timestamp: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    type: "info",
    title: "New Features Available",
    description: "Check out the latest updates on our platform.",
    timestamp: "3 days ago",
    unread: false,
  },
];

const iconMap = {
  promo: Gift,
  booking: Plane,
  info: Info,
};

export default function NotificationPanel({
  open,
  onClose,
  notifications = exampleNotifications,
  onMarkAllRead,
}) {
  const panelRef = useRef(null);
  const [localNotifications, setLocalNotifications] = useState(notifications);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  const handleMarkAllRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (onMarkAllRead) onMarkAllRead();
  };

  return (
    <div
      ref={panelRef}
      className={`absolute -right-12/12 -bottom-60 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50
        ${
          open
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }
        origin-top-right transition-all duration-200`}
      tabIndex={-1}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
        <span className="font-bold text-lg text-gray-900">Notifications</span>
        <button
          onClick={handleMarkAllRead}
          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded transition"
        >
          Mark all as read
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto bg-white rounded-b-xl">
        {localNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="w-10 h-10 text-gray-300 mb-2" />
            <span className="text-gray-600 font-medium">
              No new notifications
            </span>
          </div>
        ) : (
          localNotifications.map((notif) => {
            const Icon = iconMap[notif.type] || Info;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 transition rounded-xl relative
                  ${notif.unread ? "bg-blue-50" : ""}
                  hover:bg-gray-50`}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-7 h-7 text-blue-500" />
                  {notif.unread && (
                    <Dot className="absolute -top-1 -right-1 w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {notif.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {notif.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {notif.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
