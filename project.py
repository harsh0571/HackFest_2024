import datetime
import spacy
from dateutil import parser

class MuseumTicketBot:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.tickets = {
            "adult": 15,
            "child": 8,
            "senior": 10
        }
        self.available_dates = [
            datetime.date.today() + datetime.timedelta(days=i)
            for i in range(1, 8)
        ]
        self.booking = {}

    def start(self):
        print("Welcome to the Museum Ticket Booking Bot!")
        print("You can ask me about booking tickets, available dates, or ticket prices.")
        print("Type 'quit' to exit the conversation.")

        while True:
            user_input = input("\nHow can I help you? ").lower()
            if user_input == 'quit':
                print("Thank you for using our service. Goodbye!")
                break

            self.process_input(user_input)

    def process_input(self, user_input):
        doc = self.nlp(user_input)
        
        # Check for intents
        if any(token.text in ["book", "reserve", "buy"] for token in doc):
            self.start_booking()
        elif any(token.text in ["date", "when", "day"] for token in doc):
            self.show_available_dates()
        elif any(token.text in ["price", "cost", "ticket"] for token in doc):
            self.show_ticket_prices()
        else:
            print("I'm sorry, I didn't understand that. Can you please rephrase or ask about booking, dates, or prices?")

    def start_booking(self):
        print("Great! Let's start your booking.")
        self.get_date()
        self.get_tickets()
        self.confirm_booking()

    def show_available_dates(self):
        print("\nHere are the available dates for booking:")
        for date in self.available_dates:
            print(date.strftime('%A, %B %d, %Y'))

    def show_ticket_prices(self):
        print("\nHere are our ticket prices:")
        for ticket_type, price in self.tickets.items():
            print(f"{ticket_type.capitalize()}: ${price}")

    def get_date(self):
        while True:
            date_input = input("\nWhat date would you like to visit? (e.g., 'next Monday', 'May 15', etc.): ")
            try:
                parsed_date = parser.parse(date_input, fuzzy=True).date()
                if parsed_date in self.available_dates:
                    self.booking["date"] = parsed_date
                    print(f"Great! You're booked for {parsed_date.strftime('%A, %B %d, %Y')}.")
                    break
                else:
                    print("I'm sorry, that date is not available. Please choose from the following dates:")
                    self.show_available_dates()
            except ValueError:
                print("I couldn't understand that date. Please try again.")

    def get_tickets(self):
        self.booking["tickets"] = {}
        for ticket_type in self.tickets:
            while True:
                amount_input = input(f"How many {ticket_type} tickets would you like? ")
                doc = self.nlp(amount_input)
                numbers = [token.text for token in doc if token.like_num]
                if numbers:
                    try:
                        amount = int(numbers[0])
                        if amount >= 0:
                            self.booking["tickets"][ticket_type] = amount
                            break
                        else:
                            print("Please enter a non-negative number.")
                    except ValueError:
                        print("Please enter a valid number.")
                else:
                    print("I couldn't understand the number. Please try again.")

    def confirm_booking(self):
        print("\nBooking Summary:")
        print(f"Date: {self.booking['date'].strftime('%A, %B %d, %Y')}")
        total_cost = 0
        for ticket_type, amount in self.booking["tickets"].items():
            if amount > 0:
                cost = amount * self.tickets[ticket_type]
                total_cost += cost
                print(f"{ticket_type.capitalize()} tickets: {amount} (${cost})")
        print(f"Total cost: ${total_cost}")

        while True:
            confirmation = input("\nWould you like to confirm this booking? ").lower()
            doc = self.nlp(confirmation)
            if any(token.text in ["yes", "yeah", "sure", "confirm"] for token in doc):
                print("Booking confirmed! Thank you for using our service.")
                break
            elif any(token.text in ["no", "nope", "cancel"] for token in doc):
                print("Booking cancelled. Feel free to start over if you'd like to make changes.")
                break
            else:
                print("I'm sorry, I didn't understand. Please say 'yes' to confirm or 'no' to cancel.")

if __name__ == "__main__":
    bot = MuseumTicketBot()
    bot.start()