#celery is not supported on windows but this still works for development on windows: celery -A celery_config worker --pool=solo -l info

from celery import Celery
from dotenv import load_dotenv
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client

load_dotenv("sendgrid.env")

app = Celery("buff_browser", broker="pyamqp://guest@localhost//")

@app.task
def send_notification_email(email, skin_name, wear, sticker):
    message = Mail(
        from_email='buffbrowser@gmail.com',
        to_emails=email,
        subject='A skin from your watchlist was found!',
        html_content=(f"{skin_name} ({wear}) with {sticker}'s from your watchlist was found on Buff163.")
    )
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
    except Exception as e:
        print(f"An error occurred while sending email: {str(e)}")

@app.task
def send_notification_phone(phone_number, skin_name, wear, sticker):
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")

    client = Client(account_sid, auth_token)

    message = client.messages.create(
        to=phone_number,
        from_="+14582910846",
        body=f"{skin_name} ({wear}) with {sticker}'s from your watchlist was found on Buff163."
    )