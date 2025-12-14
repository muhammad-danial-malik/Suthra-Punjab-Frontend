import React, { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/topbar";
import { useGetpenaltiesQuery } from "../api/apiSlice";
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    Clock,
    X,
    Eye,
    Trash2,
    Filter,
    Search
} from "lucide-react";

const Notifications = () => {
    const { data: penaltiesApiData, isLoading, error } = useGetpenaltiesQuery();
    const penaltiesData = penaltiesApiData?.data || [];

    // Generate notifications from penalty data
    const dynamicNotifications = useMemo(() => {
        if (!penaltiesData.length) return [];

        const notifications = [];
        let notificationId = 1;

        // Helper function to format date
        const formatDate = (date) => {
            const penaltyDate = new Date(date);
            return penaltyDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Helper function to get notification type based on status
        const getNotificationType = (status) => {
            switch (status.toLowerCase()) {
                case 'new':
                    return 'info';
                case 'pending':
                    return 'warning';
                case 'resolved':
                case 'approved':
                    return 'success';
                case 'overdue':
                case 'rejected':
                    return 'error';
                default:
                    return 'info';
            }
        };        // Create notifications for each penalty based on their status
        penaltiesData.forEach(penalty => {
            const status = penalty.status.toLowerCase();
            const penaltyCreatedDate = formatDate(penalty.createdAt);
            const penaltyDeadlineDate = penalty.deadline ? formatDate(penalty.deadline) : null;
            const isRecent = new Date() - new Date(penalty.createdAt) < 30 * 24 * 60 * 60 * 1000; // Within last 30 days

            if (isRecent) {
                let title, message, details, notificationDate;

                switch (status) {
                    case 'new':
                        title = "New Penalty Added";
                        message = `A new penalty has been added to your account`;
                        details = `Penalty ID: ${penalty.penaltyId} | Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Status: New`;
                        notificationDate = penaltyCreatedDate;
                        break;
                    case 'pending':
                        title = "Penalty Status: Pending";
                        message = `Penalty ${penalty.penaltyId} status changed to Pending`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Awaiting review and processing`;
                        notificationDate = penalty.updatedAt ? formatDate(penalty.updatedAt) : penaltyCreatedDate;
                        break;
                    case 'resolved':
                        title = "Penalty Resolved";
                        message = `Penalty ${penalty.penaltyId} has been resolved successfully`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Payment processed and penalty closed`;
                        notificationDate = penalty.updatedAt ? formatDate(penalty.updatedAt) : penaltyCreatedDate;
                        break;
                    case 'overdue':
                        title = "Penalty Status: Overdue";
                        message = `Penalty ${penalty.penaltyId} is now marked as Overdue`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Payment deadline: ${penaltyDeadlineDate || 'N/A'}`;
                        notificationDate = penaltyDeadlineDate || penaltyCreatedDate;
                        break;
                    case 'approved':
                        title = "Penalty Approved";
                        message = `Penalty appeal for ${penalty.penaltyId} has been approved`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Appeal successful`;
                        notificationDate = penalty.updatedAt ? formatDate(penalty.updatedAt) : penaltyCreatedDate;
                        break;
                    case 'rejected':
                        title = "Penalty Rejected";
                        message = `Penalty appeal for ${penalty.penaltyId} has been rejected`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Appeal denied, full penalty amount stands`;
                        notificationDate = penalty.updatedAt ? formatDate(penalty.updatedAt) : penaltyCreatedDate;
                        break;
                    default:
                        title = "Penalty Status Updated";
                        message = `Penalty ${penalty.penaltyId} status has been updated`;
                        details = `Amount: Rs.${penalty.penaltyAmount} | Circle: ${penalty.circle?.name || 'N/A'} | Status: ${penalty.status}`;
                        notificationDate = penalty.updatedAt ? formatDate(penalty.updatedAt) : penaltyCreatedDate;
                }

                notifications.push({
                    id: notificationId++,
                    title,
                    message,
                    type: getNotificationType(status),
                    time: notificationDate,
                    read: Math.random() > 0.6, // Randomly mark some as read/unread for demo
                    details,
                    penaltyId: penalty.penaltyId,
                    status: status,
                    actualPenaltyId: penalty._id,
                    sortDate: penalty.updatedAt || penalty.createdAt // For sorting purposes
                });
            }
        });

        // Sort notifications by actual date (most recent first)
        return notifications.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
    }, [penaltiesData]);

    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Update notifications when dynamic data changes
    useEffect(() => {
        setNotifications(dynamicNotifications);
    }, [dynamicNotifications]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case "error":
                return <X className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getNotificationBg = (type, read) => {
        const baseClasses = read ? "bg-gray-50" : "bg-white border-l-4";
        switch (type) {
            case "success":
                return `${baseClasses} ${!read ? "border-green-500" : ""}`;
            case "warning":
                return `${baseClasses} ${!read ? "border-yellow-500" : ""}`;
            case "error":
                return `${baseClasses} ${!read ? "border-red-500" : ""}`;
            default:
                return `${baseClasses} ${!read ? "border-blue-500" : ""}`;
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const filteredNotifications = notifications.filter(notif => {
        const matchesFilter = filter === "all" ||
            (filter === "unread" && !notif.read) ||
            (filter === "read" && notif.read) ||
            (filter === "new" && notif.status === "new") ||
            (filter === "pending" && notif.status === "pending") ||
            (filter === "resolved" && notif.status === "resolved") ||
            (filter === "overdue" && notif.status === "overdue") ||
            (filter === "approved" && notif.status === "approved") ||
            (filter === "rejected" && notif.status === "rejected");

        const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.penaltyId.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    // Loading state
    if (isLoading) {
        return (
            <div>
                <Topbar />
                <main className="flex-1 p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading penalty notifications...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div>
                <Topbar />
                <main className="flex-1 p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Notifications</h3>
                        <p className="text-red-600">Failed to load penalty data. Please try again later.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Topbar />
            <main className="flex-1 p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <Bell className="w-8 h-8 text-green-600" />
                                Penalty Notifications
                            </h1>
                            <p className="text-gray-600">
                                {unreadCount > 0 ? `You have ${unreadCount} unread penalty notifications` : "All penalty notifications are read"}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark All as Read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                                <option value="new">New Penalties</option>
                                <option value="pending">Pending Penalties</option>
                                <option value="resolved">Resolved Penalties</option>
                                <option value="overdue">Overdue Penalties</option>
                                <option value="approved">Approved Penalties</option>
                                <option value="rejected">Rejected Penalties</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search penalties by ID, title, or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-80"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {notifications.length === 0 ? "No recent penalty notifications" : "No notifications found"}
                            </h3>
                            <p className="text-gray-500">
                                {notifications.length === 0
                                    ? "You don't have any penalty status changes in the last 30 days"
                                    : "Try adjusting your search or filter criteria"
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`${getNotificationBg(notification.type, notification.read)} rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className={`${notification.read ? 'text-gray-600' : 'text-gray-800'} mb-2`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-2">{notification.details}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {notification.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;