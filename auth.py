import os
import msal
from dotenv import load_dotenv

load_dotenv(".env")

CLIENT_ID = os.getenv("c1ecba2487-45d2-8fba-b9e39d6206fa")
TENANT_ID = os.getenv("e308630a=26fe-4d4f-9004-2647bd305127")
CLIENT_SECRET = os.getenv("5beb035b8807aca6fb15d5854726046eee0260c6")

AUTHORITY =
f"https://login.microsoftonline.com/e308630a-26fe-4d4f-9004-2647bd305127"

app = msal.ConfidentialClientApplication(
  client_id=client_id=c1ecba2487-45d2-8fba-b9e39d6206fa,
  authority=AUTHORITY,
  client_credential=CLIENT_SECRET
)

token_response = app.acquire_token_for_client(
  scopes=["https://graph.microsoft.com/.default"]
)

if "access_token" in token_response:
  print("Access token created successfully")
  print(token_response["access_token"])
else:
  print("Token generation failed")
  print(token_response)
