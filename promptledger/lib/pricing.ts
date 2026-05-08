export const PRICING = {
  cursor: {
    Hobby: 0,
    Pro: 20,
    Business: 40,
    Enterprise: 40, // custom, use 40 as floor estimate
  },
  github_copilot: {
    Individual: 10,
    Business: 19,
    Enterprise: 39,
  },
  claude: {
    Free: 0,
    Pro: 20,
    Max: 100,
    Team: 30,       // per seat, min 5
    Enterprise: 40, // estimate, custom pricing
  },
  anthropic_api: {
    'Pay-as-you-go': 0, // variable, user enters actual spend
  },
  chatgpt: {
    Free: 0,
    Plus: 20,
    Team: 30,       // per seat
    Enterprise: 60, // estimate
  },
  openai_api: {
    'Pay-as-you-go': 0, // variable
  },
  gemini: {
    Free: 0,
    'AI Premium': 19.99,
    'API pay-as-you-go': 0, // variable
  },
  windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 35,
  },
} as const