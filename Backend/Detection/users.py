import requests
import json

def registerDevice(userid):
    '''Registers Account to Camera Device (in this case a linux device with camera attached) via user ID and url'''
    try:
        url = "https://dash-cam-project.onrender.com"
        user = requests.get(f"{url}/users/{userid}")

        data = user.json()
        #create JSON file based on request (duh)
        with open("UserRegistry.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")  # e.g., 404 Not Found, 500 Server Error
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection error occurred: {conn_err}")  # e.g., DNS failure, refused connection
    except requests.exceptions.Timeout as timeout_err:
        print(f"Request timed out: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        # Catch-all for any other requests-related exceptions
        print(f"An error occurred: {req_err}")
    except ValueError as json_err:
        # Handles cases where response.json() fails due to invalid JSON
        print(f"Failed to parse JSON: {json_err}")

def validateUser():
    # Opens File into content
    try:
        with open("UserRegistry.json", "r") as file:
            content = json.load(file)
    except FileNotFoundError:
        print("User registration does not exist.")
        return False
    user_id = content["user_id"]
    # get request to validate user
    try:
        url = "https://dash-cam-project.onrender.com"
        user = requests.get(f"{url}/users/{content["user_id"]}")
        data = user.json()

        if "message" in data:
            return False
        else:
            return True
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occif userurred: {http_err}")  # e.g., 404 Not Found, 500 Server Error
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection error occurred: {conn_err}")  # e.g., DNS failure, refused connection
    except requests.exceptions.Timeout as timeout_err:
        print(f"Request timed out: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        # Catch-all for any other requests-related exceptions
        print(f"An error occurred: {req_err}")
    except ValueError as json_err:
        # Handles cases where response.json() fails due to invalid JSON
        print(f"Failed to parse JSON: {json_err}")
        return False

#

print(validateUser())
