# 🚗 Ride Share
A modern, full-stack ride-sharing platform connecting drivers with passengers. Built with React, Django, and PostgreSQL.
## 🌟 Features
- **User Authentication**: Secure signup and login for drivers and passengers.
- **Ride Management**: Drivers can publish rides with details (origin, destination, date, price, car image).
- **Ride Search & Filtering**: Advanced search with filters for convenient ride finding.
- **Booking System**: Passengers can request to book seats on available rides.
- **Real-time Notifications**: Instant updates for ride requests and status changes.
- **Reviews & Ratings**: Trust system with user reviews for drivers and passengers.
- **User Profiles**: Personalized dashboards and profile management.
## 🛠️ Tech Stack
### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: TailwindCSS
- **State/Data**: Context API, Axios
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
### Backend
- **Framework**: Django 5
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)
- **Real-time**: Django Channels (WebSockets)
## 🚀 Getting Started
### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL
### 🔧 Backend Setup
1. **Clone the repository**
   ```bash
   git clone [https://github.com/TouaibiAhmed/Ride-Share.git](https://github.com/TouaibiAhmed/Ride-Share.git)
   cd Ride-Share/rideshare-backend
2.Create a virtual environment

python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

3.Install dependencies

pip install -r requirements.txt

4.Configure Database
Create a PostgreSQL database named rideshare (or update settings.py).
Run migrations:
python manage.py migrate

5.Run the server

python manage.py runserver

💻 Frontend Setup
1.Navigate to frontend directory

cd ../frontend
2.Install dependencies
npm install
3.Run Development Server
npm run dev

2.Install dependencies
npm install

3.Run Development Server
npm run dev

