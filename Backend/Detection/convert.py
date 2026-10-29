import json

json_path = "results.json"

with open(json_path, "r") as file:
    data_dict = json.load(file)

print(data_dict)

