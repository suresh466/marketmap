import xml.etree.ElementTree as ET
from typing import Dict, List

import networkx as nx
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


def add_geometry_to_graph(G, file_path: str):
    """Parse GraphML file to extract and add node geometry to graph"""
    tree = ET.parse(file_path)
    root = tree.getroot()

    # GraphML uses namespaces, we need to handle them
    namespaces = {"graphml": "http://graphml.graphdrawing.org/xmlns"}

    # Find all node elements
    for node in root.findall(".//graphml:node", namespaces):
        node_id = node.get("id")
        # Find geometry data (specific to yEd GraphML format)
        geometry = node.find(
            ".//y:Geometry", {"y": "http://www.yworks.com/xml/graphml"}
        )
        if geometry is not None:
            width = float(geometry.get("width", 0000))
            height = float(geometry.get("height", 0000))

            G.nodes[node_id]["width"] = width
            G.nodes[node_id]["height"] = height


def load_graphml_to_cytoscape(file_path: str) -> Dict:
    """
    Load GraphML file and convert to Cytoscape.js format
    """
    try:
        G = nx.read_graphml(file_path).to_undirected()
        add_geometry_to_graph(G, file_path)

        # Convert to Cytoscape.js format
        elements = {"nodes": [], "edges": []}

        # Add nodes with their positions and data
        for node in G.nodes(data=True):
            top_y = float(node[1].get("y", 0))
            node_height = float(node[1].get("height", 0))
            bottom_y = top_y + node_height

            left_x = float(node[1].get("x", 0))
            node_width = float(node[1].get("width", 0))
            right_x = left_x + node_width

            node_data = {
                "data": {
                    "id": str(node[0]),
                    "label": node[1].get("label", str(node[0])),
                    "width": node[1].get("width", 30),
                    "height": node[1].get("height", 30),
                    "shape_type": node[1].get("shape_type", "rectangle"),
                },
                "position": {"x": left_x, "y": bottom_y},
            }
            elements["nodes"].append(node_data)

        # Add edges
        for edge in G.edges(data=True):
            edge_data = {
                "data": {
                    "id": f"edge_{edge[0]}_{edge[1]}",
                    "source": str(edge[0]),
                    "target": str(edge[1]),
                }
            }
            elements["edges"].append(edge_data)

        return elements

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def load_booths(file_path: str) -> List:
    """
    Load GraphML file and return booths
    """
    try:
        G = nx.read_graphml(file_path).to_undirected()

        booths = []

        for node in G.nodes(data=True):
            booth_data = {
                "id": str(node[0]),
                "label": node[1].get("label", str(node[0])),
            }
            booths.append(booth_data)

        return booths

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def get_index():
    """Serve the main HTML page"""
    with open("static/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)


@app.get("/api/graph")
async def get_graph():
    """API endpoint to get the graph data"""
    try:
        graph_data = load_graphml_to_cytoscape("flea_market.graphml")
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/booths")
async def get_booths():
    """API endpoint to get the booth data"""
    try:
        booth_data = load_booths("flea_market.graphml")
        return booth_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/shortest-path/{start}/{end}")
async def get_shortest_path(start: str, end: str):
    file_path = "flea_market.graphml"
    G = nx.read_graphml(file_path).to_undirected()
    path = nx.shortest_path(G, start, end, weight="weight")

    return {"path": path}
