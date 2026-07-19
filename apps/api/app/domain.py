from pydantic import BaseModel


class DomainProfile(BaseModel):
    name: str
    listing_label: str
    booking_label: str
    assistant_name: str
    system_prompt: str


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
}


def get_profile(domain: str) -> DomainProfile:
    return PROFILES.get(domain, PROFILES["professional-services"])
