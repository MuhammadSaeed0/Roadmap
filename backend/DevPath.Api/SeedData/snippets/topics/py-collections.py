products = [
    {"name": "Keyboard", "price": 450, "tags": ["office", "usb"]},
    {"name": "Mouse", "price": 130, "tags": ["office", "usb", "office"]},
    {"name": "Monitor", "price": 3200, "tags": ["screen"]},
]

# Like LINQ: Where + Select in one comprehension
cheap = [p["name"] for p in products if p["price"] < 1000]          # ['Keyboard', 'Mouse']

prices = {p["name"]: p["price"] for p in products}                  # dict comprehension
cheapest = min(prices, key=prices.get)                              # 'Mouse'

tags = sorted({tag for p in products for tag in p["tags"]})          # a set removes duplicates
by_price = sorted(products, key=lambda p: p["price"], reverse=True)
print(cheap, cheapest, tags, by_price[0]["name"])
