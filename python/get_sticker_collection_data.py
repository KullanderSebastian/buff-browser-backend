import requests
import config

def get_sticker_collection_data(sticker_collection):
    sticker_prices = []

    for sticker in sticker_collection:
        url = "https://buff.163.com/api/market/order_tags"

        headers = {
            "Cookie": config.BUFF_COOKIE
        }

        params = {
            "page_num": 1,
            "game": "csgo",
            "page_size": 100,
            "use_suggestion": 0,
            "search": sticker,
            "_": 1689782881766
        }

        response = requests.get(url, headers=headers, params=params)

        response = response.json()

        for item in response["data"]["items"]:
            sticker_prices.append({
                "name": item["value"],
                "id": item["id"],
                "price": item["formated_price"].split()[1]
            })

    return sticker_prices
