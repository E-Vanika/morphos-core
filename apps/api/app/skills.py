from dataclasses import dataclass


@dataclass(frozen=True)
class AgentSkill:
    id: str
    description: str
    input_hint: str
    domain: str = "all"


SKILLS = (
    AgentSkill("get_bridal_service_menu", "Return Monika Glam Up's current bridal, bridesmaid, party, hair and draping menu.", "category?: bridal | bridesmaid | party | hair | saree", "bridal-makeup"),
    AgentSkill("prepare_bridal_enquiry", "Validate and save a bridal enquiry for Monika to review; it does not confirm availability.", "customer_name, phone, event_date?, event_time?, event_place?, client_count?, requested_service, details?", "bridal-makeup"),
    AgentSkill("ask_bridal_concierge", "Answer a bridal-service question using approved Monika Glam Up knowledge.", "message: string", "bridal-makeup"),
    AgentSkill("get_craft_service_menu", "Return the current Crafts by Vani service menu.", "category?: string", "art-craft"),
)


def skills_for_domain(domain: str) -> tuple[AgentSkill, ...]:
    return tuple(skill for skill in SKILLS if skill.domain in {"all", domain})
