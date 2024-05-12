from pymongo import MongoClient
from celery_config import send_notification_email, send_notification_phone

client = MongoClient("mongodb://localhost:27017")

db = client["buff_data"]

new_skins_collection = db["temp_incoming_hashes"]
all_users_collection = db["users"]

new_skins_dict = {skin["hash"]: True for skin in new_skins_collection.find({})}

for user in all_users_collection.find({}):
    for watchlist_item in user["watchlist"]:
        if new_skins_dict.get(watchlist_item["hash"]):
            #Remove the item which has been found from the users watchlist
            all_users_collection.update_one(
                {"_id": user["_id"]},
                {"$pull": {"watchlist": {"hash": watchlist_item["hash"]}}}
            )

            #Send a notification based on users preference
            if user["notificationPreference"] == "Email":
                send_notification_email.delay(
                    user["email"],
                    watchlist_item["itemName"], 
                    watchlist_item["wear"], 
                    watchlist_item["stickerName"]
                )
            elif user["notificationPreference"] == "Phone":
                send_notification_phone.delay(
                    user["phone"], 
                    watchlist_item["itemName"], 
                    watchlist_item["wear"], 
                    watchlist_item["stickerName"]
                )

new_skins_collection.delete_many({})