


from requests import get

IP_ADDRESS = '172.71.30.10' # Replace with the actual IP address you want to look up

loc = get(f'https://ipapi.co/{IP_ADDRESS}/json/')
print (loc.json())