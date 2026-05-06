# Canyon

Navigation platform for driving enthusiasts featuring real-time hazard reporting, scenic route discovery, and community-generated featured drives.

Tech stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Mapbox GL JS
Backend
FastAPI
Python
Uvicorn
SQLAlchemy
PostgreSQL
WebSockets
Database
PostgreSQL
later: PostGIS

How to run
Split terminal
--> Terminal 1
    cd backend
    source venv/bin/activate
    uvicorn app.main:app
    uvicorn app.main:app --reload

--> Terminal 2
    cd frontend
    npm run dev
