#!/usr/bin/env python
import json
import jsbeautifier
import sys


def prettify_json(input_file, output_file):
    # Read the input JSON file
    with open(input_file, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    options = jsbeautifier.default_options()
    options.indent_size = 4
    pretty_json = jsbeautifier.beautify(json.dumps(data), options)
    
    # Write the prettified JSON to the output file
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(pretty_json)


if __name__ == "__main__":
    # The script accepts two command line arguments: input file and output file.
    if len(sys.argv) != 3:
        print("Usage: python prettify.py in.json out.json")
    else:
        input_file_path = sys.argv[1]
        output_file_path = sys.argv[2]
        prettify_json(input_file_path, output_file_path)
