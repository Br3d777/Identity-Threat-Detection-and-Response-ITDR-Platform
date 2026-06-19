import os
import msal
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv("AZURE_CLIENT_ID")
tenant_id = os.getenv("AZURE_TENANT_ID")
client_secret = os.getenv("AZURE_CLIENT_SECRET")

authority = f"https://login.microsoftonline.com/{tenant_id}"

app = msal.confidentialclientApplication(
  client_id,
  authority=authority,
  client_credential=client_secret
)
token = app.acquire_token_for_client(
  scopes=["httpds://graph.microsoft.com/.default"]
)
print(token)
