from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time
import pickle

chrome_driver_path = "C:/webdrivers/chromedriver.exe"

service = Service(chrome_driver_path)

driver = webdriver.Chrome(service=service)

driver.get("https://buff.163.com/")

login_button = driver.find_element(By.XPATH, "//*[contains(text(), 'Login/Register')]")

login_button.click()

time.sleep(5)

steam_login = driver.find_element(By.XPATH, "//*[contains(text(), 'Other login methods')]")

steam_login.click()

time.sleep(15)

