from orders import total_by_customer, top_customers, products_bought

ORDERS = [
    {"customer": "Sara", "lines": [{"product": "Mouse", "qty": 2, "price": 130}, {"product": "Cable", "qty": 1, "price": 60}]},
    {"customer": "Omar", "lines": [{"product": "Monitor", "qty": 1, "price": 3200}]},
    {"customer": "Sara", "lines": [{"product": "Mouse", "qty": 1, "price": 130}]},
    {"customer": "Mona", "lines": [{"product": "Cable", "qty": 4, "price": 60}]},
]

def test_totals():
    """Totals add every line of every order"""
    assert total_by_customer(ORDERS) == {"Sara": 450, "Omar": 3200, "Mona": 240}

def test_top():
    """Top customers come highest first"""
    assert top_customers(ORDERS, 2) == ["Omar", "Sara"]

def test_ties():
    """Ties are broken by name"""
    tied = [{"customer": "Zed", "lines": [{"product": "A", "qty": 1, "price": 10}]},
            {"customer": "Amy", "lines": [{"product": "B", "qty": 1, "price": 10}]}]
    assert top_customers(tied, 2) == ["Amy", "Zed"]

def test_products():
    """Products appear once, sorted"""
    assert products_bought(ORDERS) == ["Cable", "Monitor", "Mouse"]
