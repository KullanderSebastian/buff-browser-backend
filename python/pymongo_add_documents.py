from pymongo import MongoClient

def pymongo_add_documents(skins_data):
    client = MongoClient("localhost", 27017)
    db = client.buff_data

    my_collection = db["skins"]

    for skin in skins_data:
        my_collection.insert_one(skin)

    client.close()