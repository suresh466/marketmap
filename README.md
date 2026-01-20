# MarketMap

An interactive indoor mapping and navigation system designed for complex spaces like flea markets. MarketMap provides real-time pathfinding, booth location search, and a clear visual interface to help users navigate layouts with ease.

## 🚀 Key Features

- **Interactive Graph Visualization**: Renders layout, booths, and paths using Cytoscape.js for a responsive 2D graph view.
- **Intelligent Pathfinding**: Calculates the shortest walking routes between booths using NetworkX algorithms.
- **Booth Search**: Rapidly locate specific vendors or booths to set as origin or destination.
- **Interactive Navigation**: Clickable nodes, zoom/pan controls, and visual path highlighting.
- **Responsive Design**: Optimized layout for seamless navigation on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS v3
- **Mapping & Graph:** [Cytoscape.js](https://js.cytoscape.org/)
- **Backend:** Python 3.12+, FastAPI, [NetworkX](https://networkx.org/)
- **Infrastructure:** Docker, Docker Compose, Caddy Web Server

## 📦 Getting Started

### Using Docker (Recommended)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/username/marketmap.git && cd marketmap
   ```

2. **Start with Docker Compose**:

   ```bash
   docker compose --env-file env.dev up
   ```

   The application will be available at `http://localhost:5173`.

### Local Development

1. **Install dependencies**:

   ```bash
   cd frontend && npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

   Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## 🗺️ Data Structure

The application relies on GraphML data for rendering the map and calculating paths:
- `backend/flea_market.graphml`: Defines the nodes (booths/locations) and edges (paths) that make up the market layout.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.