export interface StoryLine {
  speaker: string;
  portrait: string;
  text: string;
}

export interface StoryBeat {
  id: string;
  triggerDay: number;
  lines: StoryLine[];
}

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'prologue',
    triggerDay: 1,
    lines: [
      {
        speaker: 'Narrator',
        portrait: '\u{1F4D6}',
        text: 'A small restaurant on the corner of a quiet street. It used to be packed every night — back when your grandmother ran the place.',
      },
      {
        speaker: 'Narrator',
        portrait: '\u{1F4D6}',
        text: "But she's retired now, and the kitchen has gone cold. The tables are dusty, the reputation forgotten.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "Hey, you must be the new owner! I'm Marco — I was your grandmother's sous chef years ago.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "She always said you had a gift for hospitality. That's why she left the restaurant to you.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "Here's the deal: we have 21 days to prove this place can thrive again. We need to earn $5,000 to cover the renovation loan.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "I'll handle the cooking. You manage the floor — hire waiters, buy tables, keep customers happy. Let's make her proud!",
      },
    ],
  },
  {
    id: 'day7',
    triggerDay: 7,
    lines: [
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "One week down! Word is starting to spread around the neighborhood. I can feel the momentum building.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "I heard a food critic from the city paper might visit soon. We need to keep our rating up — first impressions matter!",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "Maybe it's time to invest in some advertising? A few flyers around town could bring in more customers.",
      },
    ],
  },
  {
    id: 'day14',
    triggerDay: 14,
    lines: [
      {
        speaker: 'Food Critic',
        portrait: '\u{1F9D1}\u{200D}\u{1F4BC}',
        text: "Good evening. I'm a food critic for the Daily Gazette. I've been hearing quite a lot about this little restaurant.",
      },
      {
        speaker: 'Food Critic',
        portrait: '\u{1F9D1}\u{200D}\u{1F4BC}',
        text: "I'll be dining here over the next few days. Don't mind me — just do what you do. I'll be watching... everything.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "A food critic! This is huge. If we impress them, it could put us on the map for good.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "No angry customers, fast service, keep those tables clean. We've got one week left — let's make every order count!",
      },
    ],
  },
  {
    id: 'day21',
    triggerDay: 21,
    lines: [
      {
        speaker: 'Narrator',
        portrait: '\u{1F4D6}',
        text: "Day 21. The final day. Everything you've built over the past three weeks comes down to this.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "Last day, boss. Whatever happens today, I want you to know — your grandmother would be proud of how far we've come.",
      },
      {
        speaker: 'Chef Marco',
        portrait: '\u{1F468}\u{200D}\u{1F373}',
        text: "Let's give it everything we've got. One more day. Let's finish strong!",
      },
    ],
  },
];

export function getStoryForDay(day: number): StoryBeat | undefined {
  return STORY_BEATS.find((s) => s.triggerDay === day);
}
