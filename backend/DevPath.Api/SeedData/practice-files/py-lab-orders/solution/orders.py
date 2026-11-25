def total_by_customer(orders):
    """{customer: total of quantity * price over all their orders}."""
    totals = {}
    for order in orders:
        amount = sum(line["qty"] * line["price"] for line in order["lines"])
        totals[order["customer"]] = totals.get(order["customer"], 0) + amount
    return totals


def top_customers(orders, n):
    """The n customers with the highest totals, highest first; ties in name order."""
    totals = total_by_customer(orders)
    return sorted(totals, key=lambda name: (-totals[name], name))[:n]


def products_bought(orders):
    """Every product name bought, without duplicates, sorted A-Z."""
    return sorted({line["product"] for order in orders for line in order["lines"]})
