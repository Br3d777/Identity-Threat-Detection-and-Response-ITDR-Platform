import requests
from auth import token_response

GRAPH_API_URL = "https://graph.microsoft.com/v1.0/auditLogs/signIns"

ACCESS_TOKEN = token["access_token"]

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}
response = requests.get(
    GRAPH_API_URL,
    headers=headers
)

if response.status_code == 200:
    print("Successfully fetched sign-in logs")

    data = response.json()

    for sign_in in data["value"]:
        print("-------------------------------")
        print("user:", sign_in.get("userDisplayName"))
        print("IP:", sign_in.get("ipAddress"))
        print("Status:", sign_in.get("status"))

    else:
        print("Failed to fetch data")
        print("Status Code:", response.status_code)
        print(response.text)