import requests

url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"

payload = {
    "asset": "USDT",
    "fiat": "BOB",
    "tradeType": "BUY",
    "page": 1,
    "rows": 10,
    "payTypes": [],
    #"publisherType": None 
    "publisherType": "merchant"  
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

# Extraer los precios
if data["data"]:
    prices = [float(ad["adv"]["price"]) for ad in data["data"]]
    cheapest = min(prices)
    average = sum(prices) / len(prices)

    print("Precios encontrados:", prices)
    print(f"➡️  Precio más barato: Bs. {cheapest}")
    print(f"📊 Promedio de los 10 precios: Bs. {average:.2f}")
else:
    print("❌ No se encontraron anuncios.")