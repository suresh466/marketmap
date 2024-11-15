import networkx as nx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create our square graph
G = nx.Graph()
edges = [
    ("A", "B", {"weight": 1}),  # Left vertical side
    ("C", "D", {"weight": 3}),  # Right vertical side
    ("A", "C", {"weight": 2}),  # Top horizontal side
    ("B", "D", {"weight": 3}),  # Bottom horizontal side
]
G.add_edges_from(edges)


@app.get("/", response_class=HTMLResponse)
async def root():
    with open("index.html", "r") as f:
        return f.read()


@app.get("/graph")
async def get_graph():
    nodes = list(G.nodes())
    edges = [
        {"source": u, "target": v, "weight": d["weight"]}
        for (u, v, d) in G.edges(data=True)
    ]
    return {"nodes": nodes, "edges": edges}


@app.get("/shortest-path/{start}/{end}")
async def get_shortest_path(start: str, end: str):
    path = nx.shortest_path(G, start, end, weight="weight")
    return {"path": path}
