# EcoRoute

## Run locally
Prerequisites: Node 18+, MongoDB running locally.

### Backend
    cd backend
    npm install
    # edit .env -> add GEMINI_API_KEY
    npm run seed
    npm run dev        # http://localhost:5000

### Frontend
    cd frontend
    npm install
    # edit .env -> add VITE_MAPBOX_TOKEN (free public token from mapbox.com)
    npm run dev        # http://localhost:5173

## API
- GET  /api/routes?mode=NORMAL|URGENT|NIGHT&vehicleType=PETROL_CAR|BIKE|EV
- GET  /api/routes/alerts
- POST /api/routes/alerts  { routeId, type, description?, delayMins? }
- POST /api/ai-assistant   { userMessage, currentMode, vehicleType }
