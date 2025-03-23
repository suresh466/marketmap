# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "lxml",
# ]
# ///

import csv
import sys

from lxml import etree


def update_booth_names(graphml_file, csv_file, output_file=None):
    """
    Update booth names in a GraphML file based on a CSV mapping.

    Args:
        graphml_file (str): Path to the GraphML file
        csv_file (str): Path to the CSV file with name-label mappings
        output_file (str, optional): Path to save the updated GraphML. If None, overwrites the input file.
    """
    if output_file is None:
        output_file = "updated" + graphml_file

    # Step a: Parse the GraphML file
    try:
        tree = etree.parse(graphml_file)
        root = tree.getroot()

        # Extract namespaces from the root element
        nsmap = root.nsmap
        # Add y namespace if not present (for y:NodeLabel)
        if "y" not in nsmap:
            nsmap["y"] = "http://www.yworks.com/xml/graphml"
    except Exception as e:
        print(f"Error parsing GraphML file: {e}", file=sys.stderr)
        return False

    # Step b: Create mapping from CSV
    label_to_name = {}
    csv_row_count = 0
    skipped_rows = []
    duplicate_labels = []
    used_mappings = set()  # Track which mappings are actually used
    try:
        with open(csv_file, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_row_count += 1
                if "label" in row and "name" in row:
                    # Normalize label: lowercase and strip whitespace
                    normalized_label = row["label"].lower().strip()

                    # Check for duplicates
                    if normalized_label in label_to_name:
                        duplicate_labels.append(
                            (csv_row_count, normalized_label, row["label"], row["name"])
                        )

                    label_to_name[normalized_label] = row["name"].strip()
                else:
                    skipped_rows.append(csv_row_count)
                    print(
                        f"Warning: Row {csv_row_count} missing 'label' or 'name' column"
                    )

        print(
            f"Loaded {len(label_to_name)} label-name mappings from {csv_row_count} CSV rows"
        )
    except Exception as e:
        print(f"Error reading CSV file: {e}", file=sys.stderr)
        return False

    # Step c: Find and update nodes
    nodes_updated = 0
    nodes_total = 0

    # Find all nodes
    nodes = root.findall(".//node", nsmap)

    for node in nodes:
        nodes_total += 1
        # Find the node label within y:NodeLabel (inside y:ShapeNode)
        shape_node = node.find(".//y:ShapeNode", nsmap)
        if shape_node is not None:
            label_elem = shape_node.find(".//y:NodeLabel", nsmap)

            if label_elem is not None and label_elem.text:
                # Extract and normalize the label text
                # The CDATA might need special handling
                node_label = label_elem.text.lower().strip()

                # Check if this label is in our mapping
                if node_label in label_to_name:
                    # Find the data element with key="d4" (name attribute)
                    name_elem = node.find('./data[@key="d4"]', nsmap)

                    # If name element doesn't exist, create it
                    if name_elem is None:
                        name_elem = etree.SubElement(node, "data")
                        name_elem.set("key", "d4")

                    # Update the name value
                    name_elem.text = label_to_name[node_label]
                    used_mappings.add(node_label)  # Mark this mapping as used
                    print(
                        f"Updated node with label '{node_label}' to name '{label_to_name[node_label]}'"
                    )
                    nodes_updated += 1

    # Print CSV entries that weren't found in the GraphML
    unused_mappings = set(label_to_name.keys()) - used_mappings
    if unused_mappings:
        print("\nThe following CSV entries were not found in the GraphML file:")
        for label in unused_mappings:
            print(f"  - Label: '{label}', Name: '{label_to_name[label]}'")

    # Print summary statistics
    print("\nSummary:")
    print(f"  - Total CSV rows: {csv_row_count}")
    print(f"  - Valid mappings in CSV: {len(label_to_name)}")
    print(f"  - Mappings used (nodes updated): {len(used_mappings)}")
    print(f"  - Mappings not used: {len(unused_mappings)}")
    if skipped_rows:
        print(
            f"  - Rows skipped (missing columns): {len(skipped_rows)} - {skipped_rows}"
        )
    if duplicate_labels:
        print(f"  - Duplicate normalized labels (overwritten): {len(duplicate_labels)}")
        for row_num, norm_label, orig_label, name in duplicate_labels:
            print(
                f"    - Row {row_num}: '{orig_label}' (normalized to '{norm_label}') with name '{name}'"
            )

    # Step d: Save the updated XML
    try:
        tree.write(
            output_file, pretty_print=True, xml_declaration=True, encoding="UTF-8"
        )
        print(
            f"Successfully updated {nodes_updated} out of {nodes_total} nodes in {output_file}"
        )
        return True
    except Exception as e:
        print(f"Error writing updated GraphML file: {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(
            "Usage: python update_booth_names.py <graphml_file> <csv_file> [output_file]"
        )
        sys.exit(1)

    graphml_file = sys.argv[1]
    csv_file = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    if not update_booth_names(graphml_file, csv_file, output_file):
        sys.exit(1)
