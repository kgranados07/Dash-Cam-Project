import requests

def registerDevice(userid):
    try:
        user = requests.get(f"https://dash-cam-project.onrender.com/users/{userid}")
        print(user)
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

