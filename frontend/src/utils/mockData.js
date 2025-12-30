// Mock Users
export const MOCK_USERS = [
    {
        id: 1,
        name: "Alex Johnson",
        email: "alex@example.com",
        rating: 4.8,
        reviewsCount: 124,
        joinedDate: "2023-01-15",
        isVerified: true,
        avatar: "https://i.pravatar.cc/150?u=1",
        bio: "Frequent traveler between NY and Boston. Love music and good conversation.",
        stats: { ridesGiven: 45, ridesTaken: 12, distance: "3,450 km" }
    },
    {
        id: 2,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        rating: 4.9,
        reviewsCount: 89,
        joinedDate: "2023-03-10",
        isVerified: true,
        avatar: "https://i.pravatar.cc/150?u=2",
        bio: "Student at BU. Often travel on weekends.",
        stats: { ridesGiven: 10, ridesTaken: 35, distance: "1,200 km" }
    },
    {
        id: 3,
        name: "Mike Brown",
        email: "mike@example.com",
        rating: 4.7,
        reviewsCount: 56,
        joinedDate: "2023-05-22",
        isVerified: false,
        avatar: "https://i.pravatar.cc/150?u=3",
        bio: "Commuting for work. Punctual and safe driver.",
        stats: { ridesGiven: 28, ridesTaken: 5, distance: "2,100 km" }
    }
];

export const CURRENT_USER = {
    id: 100,
    name: "John Doe",
    email: "john.doe@example.com",
    rating: 5.0,
    reviewsCount: 12,
    joinedDate: "2023-08-01",
    isVerified: true,
    avatar: "https://i.pravatar.cc/150?u=100",
    bio: "Love traveling and meeting new people. Safe driver with 5+ years of experience.",
    stats: { ridesGiven: 5, ridesTaken: 8, distance: "850 km" }
};

// Mock Rides
export const MOCK_RIDES = [
    {
        id: "101",
        driverId: 1,
        origin: "New York, NY",
        originAddress: "Penn Station, 8th Ave & 31st St",
        destination: "Boston, MA",
        destinationAddress: "South Station, 700 Atlantic Ave",
        departureTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        arrivalTime: new Date(new Date().getTime() + 28 * 60 * 60 * 1000).toISOString(),
        price: 45.00,
        seatsAvailable: 3,
        totalSeats: 4,
        description: "Heading to Boston for the weekend. I have a spacious car and plenty of trunk space. Flexible with drop-off points along the way.",
        car: { make: "Toyota", model: "Camry", color: "Silver", year: 2022 },
        preferences: { smoking: false, pets: false, music: true, chat: true },
        status: "upcoming"
    },
    {
        id: "102",
        driverId: 3,
        origin: "Boston, MA",
        originAddress: "Logan Airport",
        destination: "Providence, RI",
        destinationAddress: "Downtown",
        departureTime: new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        arrivalTime: new Date(new Date().getTime() + 49.5 * 60 * 60 * 1000).toISOString(),
        price: 15.00,
        seatsAvailable: 2,
        totalSeats: 3,
        description: "Quick trip to Providence. No smoking please.",
        car: { make: "Honda", model: "Civic", color: "Black", year: 2020 },
        preferences: { smoking: false, pets: true, music: true, chat: false },
        status: "upcoming"
    },
    {
        id: "103",
        driverId: 1,
        origin: "New York, NY",
        originAddress: "JFK Airport",
        destination: "Philadelphia, PA",
        destinationAddress: "30th Street Station",
        departureTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        arrivalTime: new Date(new Date().getTime() - 22 * 60 * 60 * 1000).toISOString(),
        price: 30.00,
        seatsAvailable: 0,
        totalSeats: 4,
        description: "Business trip.",
        car: { make: "Toyota", model: "Camry", color: "Silver", year: 2022 },
        preferences: { smoking: false, pets: false, music: true, chat: true },
        status: "completed"
    }
];

// Mock Requests
export const MOCK_REQUESTS = [
    {
        id: "201",
        rideId: "101",
        passengerId: 2,
        seats: 1,
        status: "pending",
        timestamp: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "202",
        rideId: "102",
        passengerId: 100, // Current user
        seats: 1,
        status: "accepted",
        timestamp: new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString()
    }
];

// Helper to get full ride details with driver info
export const getRideWithDriver = (rideId) => {
    const ride = MOCK_RIDES.find(r => r.id === rideId);
    if (!ride) return null;
    const driver = MOCK_USERS.find(u => u.id === ride.driverId) || CURRENT_USER;
    return { ...ride, driver };
};

// Helper to get user's rides
export const getUserRides = (userId, role = 'driver') => {
    if (role === 'driver') {
        return MOCK_RIDES.filter(r => r.driverId === userId).map(r => ({
            ...r,
            driver: userId === CURRENT_USER.id ? CURRENT_USER : MOCK_USERS.find(u => u.id === userId)
        }));
    } else {
        // Rides where user is a passenger (based on requests)
        const userRequests = MOCK_REQUESTS.filter(req => req.passengerId === userId && req.status === 'accepted');
        return userRequests.map(req => {
            const ride = MOCK_RIDES.find(r => r.id === req.rideId);
            const driver = MOCK_USERS.find(u => u.id === ride.driverId);
            return { ...ride, driver };
        });
    }
};
