from pymongo import MongoClient
import hashlib

def pymongo_add_documents(skins_data):
    client = MongoClient("localhost", 27017)
    db = client.buff_data

    my_collection = db["skins"]

    for skin in skins_data:
        skin["last_updated"] = None

        my_collection.insert_one(skin)

    client.close()

def pymongo_create_hashes(skins_data):
    client = MongoClient("localhost", 27017)
    db = client.buff_data

    my_collection = db["skins_hash"]

    for skin in skins_data:
        data = "|".join(map(str, [skin["sticker_name"], skin["item_name"]]))

        sha256_hash = hashlib.sha256(data.encode()).hexdigest()

        my_collection.insert_one({
            "unique_skin_hash": sha256_hash
        })

    client.close()

def pymongo_check_hashes(skins_data):
    '''1: Hämta alla hashes från databasen

    2: Lägg till alla hashes i en set() för att snabbt kunna kolla om skinnet finns eller inte

    3: skapa hash av de "nya" skinnets attributer och sticker namn

    if():
        4: jämför ifall den nya hashen finns i hash databasen. Ifall den inte finns lägg till som ett NYTT skins_data
    else:
        5: ifall hashen redan finns i hashdatabasen hittade skinnet i databasen och kolla ifall priset behöver uppdateras, isåfall ska de markeras att priset är uppdaterat annars ska inget annat ändras

    6: hashes som inte jämförs i existing hashes ska tas bort då de blivit borttagna eller sålda ifrån buff.'''
    client = MongoClient("localhost", 27017)
    db = client.buff_data

    hash_collection = db["skins_hash"]
    skins_collection = db["skins"]

    all_hashes = hash_collection.find({})

    existing_hashes = set()

    for skin_hash in all_hashes:
        existing_hashes.add(skin_hash)

    existing_hashes_copy = existing_hashes.copy()

    for skin in skins_data:
        data = "|".join(map(str, [skin["sticker_name"], skin["item_name"]]))

        sha256_hash = hashlib.sha256(data.encode()).hexdigest()

        if sha256_hash in existing_hashes_copy:
            print("hash already exists update price")
        else:
            skins_collection.insert_one(skin)

