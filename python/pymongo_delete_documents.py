from pymongo import MongoClient

def pymongo_delete_documents():
    client = MongoClient("localhost", 27017)
    db = client.buff_data

    skins_collection = db["skins"]
    hashes_collection = db["temp_incoming_hashes"]

    skins_result = skins_collection.delete_many({})
    hashes_result = hashes_collection.delete_many({})

    print(f"Deleted {skins_result.deleted_count} skins_documents")
    print(f"Deleted {hashes_result.deleted_count} hashes_documents")

pymongo_delete_documents()