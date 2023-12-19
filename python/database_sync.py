import sqlite3
import json
import hashlib
from pymongo import MongoClient

#with open("mock.json", "r") as file:
    #data = json.load(file)

def connect_to_database(db_name):
    client = MongoClient("mongodb://localhost:27017")

    db = client[db_name]

    return client, db

def create_hash(item, key_selection_array):
    data = {}

    for key_selector in key_selection_array:
        data[list(item)[key_selector]] = list(item.values())[key_selector]

    data_json = json.dumps(data, sort_keys=True)

    sha256_hash = hashlib.sha256()
    sha256_hash.update(data_json.encode("utf-8"))
    hashed_data = sha256_hash.hexdigest()

    return hashed_data

def populate_db(data, db_name, collection_name, key_selection_array,  keep_track_on_changes_keys):
    client, db = connect_to_database(db_name)

    collection = db[collection_name]

    if collection.count_documents({}) == 0:
        for item in data:
            document = {}

            for key in item.keys():
                document[key] = item[key]

                try:
                    for index in keep_track_on_changes_keys:
                        if key in list(item.keys())[index]:
                            document[f"previous_{key}"] = ""
                except IndexError:
                    print(f"IndexError: Index {index} is out of range. Please check that you entered a valid position.")
                    return

            document["hash"] = create_hash(item, key_selection_array)

            collection.insert_one(document)
    else:
        print("Database is already populated, running sync_db")
        sync_db(data, db_name, collection_name, key_selection_array, keep_track_on_changes_keys)

    client.close()

def sync_db(data, db_name, collection_name, key_selection_array, keep_track_on_changes_keys):
    client, db = connect_to_database(db_name)

    collection = db[collection_name]

    existing_hashes = set(doc["hash"] for doc in collection.find({}, {"hash": 1}))
    incoming_hashes = set()

    for item in data:
        keys = item.keys()
        keys_list = list(keys)

        hashed_data = {}

        for key in keys:
            hashed_data[key] = item[key]

        incoming_hash = create_hash(hashed_data, key_selection_array)
        incoming_hashes.add(incoming_hash)

        if incoming_hash in existing_hashes:
            print("Incoming hash exists.")

            if len(keys) <= len(key_selection_array):
                print("No field in the document have been specified to update")
                continue
            
            for index in keep_track_on_changes_keys:
                key = keys_list[index]
                new_value = item[key]
                row_hash = incoming_hash

                existing_document = collection.find_one({"hash": row_hash})

                collection.update_one(
                    {"hash": row_hash},
                    {
                        "$set": {
                            f"previous_{key}": existing_document[key],
                            key: new_value
                        }
                    }
                )

        else:
            print("Incoming hash does not exist.")
            print(f"INSERT INTO {collection_name}: {item}")
            
            document = {}

            for key in item.keys():
                document[key] = item[key]

                try:
                    for index in keep_track_on_changes_keys:
                        if key in list(item.keys())[index]:
                            document[f"previous_{key}"] = ""
                except IndexError:
                    print(f"IndexError: Index {index} is out of range. Please check that you entered a valid position.")
                    return

            document["hash"] = create_hash(item, key_selection_array)

            collection.insert_one(document)

    removed_hashes = list(existing_hashes - incoming_hashes)

    collection.delete_many({"hash": {"$in": removed_hashes}})
    print(f"Deleted {len(removed_hashes)} records from the collection")
    
    client.close()