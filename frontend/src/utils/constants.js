export const APP_NAME = "RideShare";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    SEARCH: "/search",
    RIDE_DETAILS_PATH: "/rides/:id",
    RIDE_DETAILS: (id) => `/rides/${id}`,
    CREATE_RIDE: "/create-ride",
    MY_RIDES: "/my-rides",
    MY_REQUESTS: "/my-requests",
    RIDE_REQUESTS: "/ride-requests",
    NOTIFICATIONS: "/notifications",
    PROFILE: "/profile",
    PROFILE_PATH: "/profile/:id",
    PROFILE_EDIT: '/settings/profile',
    DASHBOARD: "/dashboard",
};

export const RIDE_STATUS = {
    UPCOMING: "upcoming",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const REQUEST_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    DECLINED: "declined",
};
