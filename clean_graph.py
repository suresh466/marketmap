# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "lxml",
# ]
# ///
from lxml import etree

# Parse the XML file
tree = etree.parse("./backend/flea_market.graphml")
root = tree.getroot()

# Define namespace mapping
namespaces = {
    "graphml": "http://graphml.graphdrawing.org/xmlns",
    "y": "http://www.yworks.com/xml/graphml",
}

graph = root.find(".//graphml:graph", namespaces)

# remove all edges
if graph is not None:
    for edge in graph.findall("graphml:edge", namespaces):
        graph.remove(edge)

for node in root.findall(".//graphml:node", namespaces):
    shape_type = node.find(".//y:ShapeNode/y:Shape", namespaces)

    # remove non-booth nodes
    if shape_type is None or shape_type.get("type") not in [
        "rectangle",
        "hexagon",
        "roundrectangle",
    ]:
        graph.remove(node)
    else:
        node_label = node.find(".//y:NodeLabel", namespaces)
        geometry = node.find(".//y:Geometry", namespaces)

        if node_label is not None and geometry is not None:
            width = int(float(geometry.get("width")) / 10)
            height = int(float(geometry.get("height")) / 10)
            original_label = node_label.text
            new_label = f"{original_label} ({height}'x{width}')"
            node_label.text = new_label

tree.write("clean_flea_market.graphml", encoding="UTF-8", xml_declaration=True)
