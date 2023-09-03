import requests
import config
from get_sticker_collection_data import get_sticker_collection_data
import time
from pymongo_add_documents import pymongo_add_documents

request_amount = 0

sticker_collection_data = get_sticker_collection_data([
    "katowice 2014",
    "cologne 2014",
    "dreamhack 2014",
    "katowice 2015",
    "Luminosity Gaming (Holo) | MLG Columbus 2016",
    "Flammable (Foil)",
    "Crown (Foil)"
])

headers = {
    "Cookie": config.BUFF_COOKIE
}

all_weapons = []

skins_data = []

def get_request(request_url, headers):
    global request_amount
    url = request_url.replace("__PAGENUM__", str(page_num))

    response = requests.get(url, headers=headers)

    response = response.json()

    request_amount += 1

    return response

def do_calculations(weapon_list, sticker_price):
    for item in weapon_list:
        sticker_prices = float(sticker_price) * 4
        sticker_amounts = 4

        skins_data.append({
            "sticker_name": sticker["name"],
            "sticker_amount": sticker_amounts,
            "item_name": item["market_hash_name"],
            "item_img": item["goods_info"]["icon_url"],
            "market_price": item["sell_reference_price"],
            "seller_price": item["sell_min_price"],
            "sticker_price": sticker_prices,
            "sticker_seller_price": float(item["sell_min_price"]) - float(item["sell_reference_price"]),
            "sticker_percentage_price": (float(item["sell_min_price"]) - float(item["sell_reference_price"])) / float(sticker_prices)
        })


for sticker in sticker_collection_data:
    sid = sticker["id"]
    
    get_requests = [
        f"https://buff.163.com/api/market/goods?category=weapon_ak47%2Cweapon_awp%2Cweapon_m4a1_silencer%2Cweapon_m4a1%2Cweapon_glock&extra_tag_ids={sid}%2C{sid}%2C{sid}%2C{sid}&game=csgo&page_num=__PAGENUM__&page_size=60",
        f"https://buff.163.com/api/market/goods?category=weapon_hkp2000%2Cweapon_usp_silencer%2Cweapon_deagle&extra_tag_ids={sid}%2C{sid}%2C{sid}%2C{sid}&game=csgo&page_num=__PAGENUM__&page_size=60"
    ]

    for request_url in get_requests:
        page_num = 1

        response = get_request(request_url, headers=headers)

        all_weapons.extend(response["data"]["items"])

        total_pages = response["data"]["total_page"]
        print(f"Getting data from sticker {sticker['name']} current page: {page_num} total pages: {total_pages}")

        time.sleep(3)

        if total_pages > 1:
            for i in range(2, total_pages + 1):
                page_num = i
                response = get_request(request_url, headers=headers)
                print(f"Getting data from sticker {sticker['name']} current page: {i} total pages: {total_pages}")

                all_weapons.extend(response["data"]["items"])

                time.sleep(3)
    
    do_calculations(weapon_list=all_weapons, sticker_price=sticker["price"])
    all_weapons = []


skins_data_sorted = sorted(skins_data, key=lambda x: x["sticker_percentage_price"])
pymongo_add_documents(skins_data_sorted)
print("DONE")
print(f"REQUESTS AMOUNT: {request_amount}")
