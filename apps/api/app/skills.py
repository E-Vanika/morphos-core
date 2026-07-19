from dataclasses import dataclass


@dataclass(frozen=True)
class AgentSkill:
    id: str
    description: str
    input_hint: str


SKILLS = (
    AgentSkill("search_providers", "Find providers by specialty, expertise, or keyword.", "query: string"),
    AgentSkill("check_availability", "Find open appointment slots for a provider.", "provider_id: string, date_range: string"),
    AgentSkill("create_booking_draft", "Prepare, but never finalize, a booking from confirmed details.", "provider_id: string, slot: string"),
)
