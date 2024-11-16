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
async def get_graph_data():
    G = nx.Graph()

    grid = [
        [100, 101, 102, 103, 104, 105],  # row_A
        [200, 201, 202, 203, 204, 205],  # row_B
        [300, 301, 302, 303, 304, 305],  # row_C
        [400, 401, 402, 403, 404, 405],  # row_D
        [500, 501, 502, 503, 504, 505],  # row_E
        [600, 601, 602, 603, 604, 605],  # row_E
        [700, 701, 702, 703, 704, 705],  # row_E
    ]

    # Get the number of rows and columns
    rows = len(grid)
    cols = len(grid[0])

    # Create a list to store the edges with weights
    edges_with_weights = []

    # Iterate over each node in the grid
    for i in range(rows):
        for j in range(cols):
            current_node = grid[i][j]

            # Check top neighbor (i-1, j)
            if i > 0:
                top_node = grid[i - 1][j]
                edges_with_weights.append((current_node, top_node, 1))

            # Check right neighbor (i, j+1)
            if j < cols - 1:
                right_node = grid[i][j + 1]
                edges_with_weights.append((current_node, right_node, 2))

            # Check bottom neighbor (i+1, j)
            if i < rows - 1:
                bottom_node = grid[i + 1][j]
                edges_with_weights.append((current_node, bottom_node, 1))

            # Check left neighbor (i, j-1)
            if j > 0:
                left_node = grid[i][j - 1]
                edges_with_weights.append((current_node, left_node, 2))

    print(edges_with_weights)

    G.add_weighted_edges_from(edges_with_weights)

    # Prepare JSON response
    edges = [
        {"source": u, "target": v, "weight": data["weight"]}
        for u, v, data in G.edges(data=True)
    ]

    # Positioning logic that accounts for weights
    pos = {}
    start_x, start_y = 100, 100  # Initial position offsets

    # Build positions by iterating and considering weights
    # 100: j=0, i=0, pos[100] = (100, 100)
    # 101: j=1, i=0, leftnode = 100, pos[101] = ({100+100*(G[101][100]['weight'])=2==200}=300, 100) [100+(100*2)=300]
    # 102: j=2, i=0, leftnode = 101, pos[102] = ({300+100*(G[102][101]['weight'])=2==200}=500, 100) [300+(100*2)=500]
    # 103: j=3, i=0, leftnode = 102, pos[103] = ({500+100*(G[103][102]['weight'])=2==200}=700, 100) [500+(100*2)=700]
    # 104: j=4, i=0, leftnode = 103, pos[104] = ({700+100*(G[104][103]['weight'])=2==200}=900, 100) [700+(100*2)=900]
    # 105: j=5, i=0, leftnode = 104, pos[105] = ({900+100*(G[104][103]['weight'])=2==200}=1100, 100) [900+(100*2)=1100]
    #
    # 200: j=0, i=1, topnode = 100, pos[200] = (100, {100+100*(G[200][100]['weight'])=1==100}=200) [100+(100*1)=200]
    # 201: j=1, i=1, leftnode = 200, pos[201] = ({100+100*(G[201][200]['weight'])=2==200}=300, 100) [100+(100*2)=300]

    for i in range(rows):
        for j in range(cols):
            current_node = grid[i][j]
            if j == 0:
                # Start each row at the initial X offset
                if i == 0:
                    pos[current_node] = (start_x, start_y)
                else:
                    top_node = grid[i - 1][j]
                    pos[current_node] = (
                        pos[top_node][0],
                        pos[top_node][1] + 100 * G[current_node][top_node]["weight"],
                    )
            else:
                left_node = grid[i][j - 1]
                pos[current_node] = (
                    pos[left_node][0] + 100 * G[current_node][left_node]["weight"],
                    pos[left_node][1],
                )

    nodes = [{"id": node, "x": pos[node][0], "y": pos[node][1]} for node in G.nodes()]

    return {"nodes": nodes, "edges": edges}


@app.get("/shortest-path/{start}/{end}")
async def get_shortest_path(start: str, end: str):
    path = nx.shortest_path(G, start, end, weight="weight")
    return {"path": path}
