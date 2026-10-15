from pydantic import BaseModel


class DomainProfile(BaseModel):
    name: str
    listing_label: str
    booking_label: str
    assistant_name: str
    system_prompt: str
    approved_knowledge: str = ""


PROFILES = {
    "professional-services": DomainProfile(
        name="Professional services",
        listing_label="experts",
        booking_label="session",
        assistant_name="Clarity concierge",
        system_prompt=(
            "You are a concise professional-services concierge. Use only the provided knowledge "
            "and do not invent availability, pricing, credentials, or policies."
        ),
    ),
    "healthcare": DomainProfile(
        name="Healthcare",
        listing_label="practitioners",
        booking_label="appointment",
        assistant_name="Care concierge",
        system_prompt="You help find appointments and explain clinic information. Do not provide medical advice.",
    ),
    "art-craft": DomainProfile(
        name="Art and craft",
        listing_label="creations",
        booking_label="order request",
        assistant_name="Crafts by Vani assistant",
        system_prompt="You help visitors understand custom art and craft orders. Explain that final price and delivery depend on design, size, materials and quantity. Do not invent availability or promises.",
    ),
    "bridal-makeup": DomainProfile(
        name="Bridal makeup",
        listing_label="looks",
        booking_label="enquiry",
        assistant_name="Monika Glam Up assistant",
        system_prompt=(
            "You are Monika Glam Up's concise bridal concierge. Help visitors compare makeup "
            "finishes, understand what is included, and prepare a complete enquiry. Use only the "
            "approved knowledge. Never claim that a date is available or a booking is confirmed. "
            "State clearly that travel, lenses, eyelashes and special accessories may cost extra."
        ),
        approved_knowledge="""Monika Glam Up offers bridal makeup, hairstyling and saree draping.
Bridal finishes: Matte Finish Bridal Look ₹8,000; Soft Glam Bridal Look ₹9,000; Skin Finish Bridal Look ₹10,000; Glow Finish Bridal Look ₹12,000.
Each bridal package includes the selected makeup finish, bridal hairstyling or hairdo, saree draping, hair finishing and styling support, and hair extensions where required subject to prior discussion.
Contact lenses, eyelashes, travel allowance, special accessories, additional products and customised requirements are charged separately unless agreed otherwise.
Bridal Hairstyling is ₹2,500. Hair Preparation is ₹100. Hair Accessories Placement is priced based on the requirement.
Saree Pre-Pleating is ₹600. Saree Draping is ₹1,000. The supplied service guide lists Pre-Pleating plus Draping at ₹400; this should be confirmed in the final quotation.
Bridesmaid Makeup Package is ₹5,000 and includes makeup, hairstyling or hairdo, and saree draping. Bridesmaid Hairstyling is ₹1,500.
Party Makeup Package is ₹3,500 and includes makeup and hairstyling. It is suitable for parties, receptions, engagements, family functions and other special occasions.
Final pricing can vary for complex hairstyles, very long or thick hair, multiple events or looks, location and special requirements. Availability depends on the event date and confirmed schedule.
For an enquiry, collect event date, event time, event place, number of clients and services required. Ask for outfit details, hairstyle references, jewellery or accessories and preferred makeup finish before the appointment.""",
    ),
}


def get_profile(domain: str) -> DomainProfile:
    return PROFILES.get(domain, PROFILES["professional-services"])
