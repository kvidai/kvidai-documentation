> **DRAFT, not published. This file is a FRAGMENT, not a full page.** Copy the section below into `docs/pricing.md` (after "Image Generation", before "Usage Examples") when the public prices are confirmed, and the Korean one into `i18n/ko/docusaurus-plugin-content-docs/current/pricing.md`. Delete this note. The numbers are the current values of the production pricing table (`service_type=llm_api`, list price of the provider × 1.2), which the operations team can change in the Strapi console: re-read them before publishing.

---

## LLM API (Chat Completions)

Credits are charged by the tokens a call actually used. Prices are in credits per 1,000 tokens.

| Model | Input | Output (including reasoning) | Cached input (read) | Cached input (write) |
|-------|-------|------------------------------|---------------------|----------------------|
| `openrouter/openai/gpt-6-luna` | 0.012 | 0.06 | 0.0012 | 0.015 |

- The charge of a call is rounded up to 0.01 credit (minimum 0.01 credit per successful call).
- Reasoning tokens count as output tokens.
- Failed calls are not charged.
- How to call it: [LLM API](/docs/api-services/llm-api).
