# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "lxml",
# ]
# ///

import csv
import sys

from lxml import etree


def update_booth_names(graphml_file, csv_file, output_file):
    """
    Update booth names in a GraphML file based on a CSV mapping.
    Handles extension booths by marking them with extension field.
    Processes comma-separated booth labels in CSV.

    Args:
        graphml_file (str): Path to the GraphML file
        csv_file (str): Path to the CSV file with name-label mappings
        output_file (str): Path to save the updated GraphML.
    """
    if output_file is None:
        # Use more descriptive output filename
        output_file = graphml_file.replace(".graphml", "_updated.graphml")

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
    label_to_extension = {}  # Track extension number for each label
    csv_row_count = 0
    skipped_rows = []
    duplicate_labels = []
    used_mappings = set()  # Track which mappings are actually used

    # Track vendor booths for extension processing
    vendor_to_booths = {}  # Vendor name -> list of booth labels

    try:
        with open(csv_file, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_row_count += 1
                if "label" in row and "name" in row:
                    vendor_name = row["name"].strip()

                    # Split label entries by comma
                    label_entries = [label.strip() for label in row["label"].split(",")]

                    # Process each booth label for this vendor
                    for index, original_label in enumerate(label_entries):
                        if not original_label:  # Skip empty entries
                            continue

                        # Normalize label: remove dashes, lowercase and strip whitespace
                        normalized_label = original_label.lower().replace("-", "")

                        # Check for duplicates
                        if normalized_label in label_to_name:
                            duplicate_labels.append(
                                (
                                    csv_row_count,
                                    normalized_label,
                                    original_label,
                                    vendor_name,
                                )
                            )

                        # Store mapping with appropriate extension number
                        label_to_name[normalized_label] = vendor_name

                        # First booth (index 0) gets extension=0, others get 1, 2, etc.
                        if index == 0:
                            label_to_extension[normalized_label] = "0"  # Main booth
                        else:
                            label_to_extension[normalized_label] = str(
                                index
                            )  # Extension booth

                        # Group booths by vendor
                        if vendor_name not in vendor_to_booths:
                            vendor_to_booths[vendor_name] = []
                        vendor_to_booths[vendor_name].append(normalized_label)
                else:
                    skipped_rows.append(csv_row_count)
                    print(
                        f"Warning: Row {csv_row_count} missing 'label' or 'name' column"
                    )

        print(
            f"Loaded {len(label_to_name)} label-name mappings from {csv_row_count} CSV rows"
        )
        print(
            f"Found {sum(1 for v in vendor_to_booths.values() if len(v) > 1)} vendors with multiple booths"
        )

    except Exception as e:
        print(f"Error reading CSV file: {e}", file=sys.stderr)
        return False

    # Step c: Find and update nodes
    nodes_updated = 0
    nodes_total = 0
    extension_booths = 0

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
                original_label = label_elem.text.strip()
                node_label = original_label.lower().replace("-", "").strip()

                # Check if this label is in our mapping
                if node_label in label_to_name:
                    vendor_name = label_to_name[node_label]
                    extension_value = label_to_extension[node_label]

                    # Find or create the name element (d4)
                    name_elem = node.find('./data[@key="d4"]', nsmap)
                    if name_elem is None:
                        name_elem = etree.SubElement(node, "data")
                        name_elem.set("key", "d4")

                    # Only create/update extension element (d10) if it's not the default value (0)
                    if extension_value != "0":
                        # Find or create extension element (d10)
                        extension_elem = node.find('./data[@key="d10"]', nsmap)
                        if extension_elem is None:
                            extension_elem = etree.SubElement(node, "data")
                            extension_elem.set("key", "d10")
                        extension_elem.text = extension_value
                        extension_booths += 1
                        # Set name for extension booth
                        name_elem.text = f"{vendor_name} - Extension"
                        print(
                            f"Booth {original_label} marked as extension {extension_value} for {vendor_name}"
                        )
                    else:
                        # This is the main booth, don't create extension element as it's the default value
                        name_elem.text = vendor_name
                        print(
                            f"Booth {original_label} set as main booth for {vendor_name}"
                        )

                    used_mappings.add(node_label)
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
    print(f"  - Total booth mappings: {len(label_to_name)}")
    print(
        f"  - Vendors with multiple booths: {sum(1 for v in vendor_to_booths.values() if len(v) > 1)}"
    )
    print(f"  - Extension booths processed: {extension_booths}")
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
