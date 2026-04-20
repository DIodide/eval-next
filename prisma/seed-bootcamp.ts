import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    },
  },
});

// Cloudinary-hosted bootcamp media. Derived URLs (sp_hd HLS and fixed folder
// paths) stay stable even when the MP4 is re-uploaded, so we can rely on the
// canonical form rather than the version-pinned secure_url.
const CLOUD_NAME = "dg4uuzj9z";
const BOOTCAMP_FOLDER = "recruit-bootcamp";
const cloudinaryAsset = (key: string) => ({
  videoUrl: `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${BOOTCAMP_FOLDER}/videos/${key}.mp4`,
  hlsUrl: `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${BOOTCAMP_FOLDER}/videos/${key}.m3u8`,
  transcriptVttUrl: `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${BOOTCAMP_FOLDER}/captions/${key}.vtt`,
  posterUrl: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${BOOTCAMP_FOLDER}/posters/${key}.jpg`,
});

const MEDIA = {
  whatswhy: { ...cloudinaryAsset("whatswhy"), durationSeconds: 20 },
  "step-1": { ...cloudinaryAsset("step-1"), durationSeconds: 176 },
  "step-2-p1-college-list": {
    ...cloudinaryAsset("step-2-p1-college-list"),
    durationSeconds: 111,
  },
  "step-2-p2-coach-fit": {
    ...cloudinaryAsset("step-2-p2-coach-fit"),
    durationSeconds: 63,
  },
  "step-2-p3-eval-search": {
    ...cloudinaryAsset("step-2-p3-eval-search"),
    durationSeconds: 36,
  },
  "step-3": { ...cloudinaryAsset("step-3"), durationSeconds: 346 },
  "step-4": { ...cloudinaryAsset("step-4"), durationSeconds: 105 },
  "step-5": { ...cloudinaryAsset("step-5"), durationSeconds: 47 },
} as const;

type MediaKey = keyof typeof MEDIA;

const BOOTCAMP = {
  slug: "recruit-bootcamp",
  title: "EVAL Recruit Bootcamp",
  description:
    "Through five lessons, you will learn how to access college esports scholarship opportunities nationwide. Walk away with a clear college list, a verified recruiting profile, a college-level highlight reel, an understanding of how gaming strengthens your college application, and the ability to connect with coaches.",
  is_published: true,
  version: 1,
};

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

interface LessonData {
  slug: string;
  title: string;
  description: string;
  media_key: MediaKey | null;
  content_markdown: string;
  common_questions: { question: string; answer: string }[] | null;
  order_index: number;
  requires_reflection: boolean;
  quiz: {
    title: string;
    questions: QuizQuestion[];
  } | null;
}

interface ModuleData {
  slug: string;
  title: string;
  description: string;
  order_index: number;
  is_free: boolean;
  lessons: LessonData[];
}

const MODULES: ModuleData[] = [
  // ========== STEP 0 ==========
  {
    slug: "step-0-welcome",
    title: "Welcome & Why EVAL Exists",
    description:
      "Learn why EVAL was created, what this bootcamp will teach you, and the five outcomes you will walk away with.",
    order_index: 0,
    is_free: true,
    lessons: [
      {
        slug: "welcome-and-why-eval-exists",
        title: "Welcome & Why EVAL Exists",
        description: "Introduction to the EVAL Bootcamp and your five key outcomes.",
        media_key: "whatswhy",
        content_markdown: `# Welcome & Why EVAL Exists

Through these five lessons, you will learn how to access college esports scholarship opportunities nationwide.

By the end of this program, you should walk away with five tangible outcomes:

1. A clear and realistic college list
2. A verified recruiting esports profile
3. A college-level esports highlight reel
4. An understanding of how gaming can strengthen your college application
5. The ability to begin outreach and connect with coaches

These steps are based on our first bootcamp, which included top esports players across the country who now have college opportunities.

But before:

- College offers
- College visits
- Becoming a top prospect nationally

You need clarity on why you are doing this.

Recruiting takes time and consistent effort. Progress is not always visible. If you do not understand your "why," you will not stay disciplined long enough for this process to work.

That is why one of your first actions in this program is to reflect on your personal motivation — not what sounds impressive, but what genuinely drives you.

In Step 1, we will break down what it truly takes to get recruited.

Let's get started.`,
        common_questions: [
          {
            question: "Do I need to be a top-ranked player to benefit from this bootcamp?",
            answer:
              "No. This bootcamp is designed for players at all competitive levels. Coaches value character, consistency, and coachability alongside skill.",
          },
          {
            question: "How long does the bootcamp take to complete?",
            answer:
              "You can work through the bootcamp at your own pace. Most players complete it in 1-2 weeks.",
          },
          {
            question: "What games does this apply to?",
            answer:
              "The recruiting principles apply to all college esports titles. The specific advice works across Valorant, Rocket League, Overwatch, Smash, and more.",
          },
        ],
        order_index: 0,
        requires_reflection: false,
        quiz: {
          title: "Step 0 Quiz",
          questions: [
            {
              question: "What is the main goal of the EVAL Bootcamp?",
              options: [
                "To help players go professional immediately",
                "To teach players how to access college esports scholarship opportunities",
                "To improve in-game mechanics only",
                "To rank players nationally",
              ],
              correct_index: 1,
            },
            {
              question:
                "How many tangible outcomes should you walk away with by the end of the program?",
              options: ["3", "4", "5", "6"],
              correct_index: 2,
            },
            {
              question: "Which of the following is NOT listed as one of the five outcomes?",
              options: [
                "A clear college list",
                "A verified recruiting esports profile",
                "A professional esports contract",
                "A college-level highlight reel",
              ],
              correct_index: 2,
            },
            {
              question: 'Why is understanding your "why" important in recruiting?',
              options: [
                "It helps you negotiate scholarships",
                "It increases your gaming skill",
                "It keeps you consistent through a long process",
                "It guarantees college offers",
              ],
              correct_index: 2,
            },
            {
              question: "What happens in Step 1?",
              options: [
                "You create your highlight reel",
                "You contact college coaches",
                "You learn what it takes to get recruited",
                "You commit to a college",
              ],
              correct_index: 2,
            },
          ],
        },
      },
    ],
  },

  // ========== STEP 1 ==========
  {
    slug: "step-1-define-your-why",
    title: 'Define Your "Why"',
    description:
      "Define the internal standard that drives you — before competition, rankings, or scholarships.",
    order_index: 1,
    is_free: false,
    lessons: [
      {
        slug: "define-your-why",
        title: 'Define Your "Why"',
        description:
          "Discover your deeper motivation and build the foundation everything else rests on.",
        media_key: "step-1",
        content_markdown: `# Define Your "Why"

Through this lesson, you will define the internal standard that drives you — before competition, rankings, or scholarships.

By the end of this step, you should walk away with three clear foundations:

1. A defined personal "why" that goes deeper than esports
2. A clear standard for how you will show up as a student and competitor
3. Direction on where you want to grow — academically and competitively

This foundation separates players who are temporarily motivated from those who are consistently disciplined.

But before:

- Scholarships
- Recruiting conversations
- College offers
- Becoming a top prospect nationally

You need clarity on who you are and why you are doing this.

Your "why" is not:

- Your rank
- Your favorite game
- The idea of a scholarship

Your why is the reason you choose discipline when progress is slow.
It is the reason you prepare when no one is watching.
It is the reason you respond with maturity when things do not go your way.

Top coaches consistently value responsibility over raw talent.

Recruiting takes time and consistent effort. Character is what sustains effort long enough for opportunity to appear.

Once your why is clear, direction becomes easier.

You begin asking:

- What environment will challenge me?
- What game am I willing to commit to long-term?
- What education supports who I am becoming?

Esports should support your long-term life — not replace it.

By the end of this step, you should be able to confidently say:

I know who I am doing this for.
I know the standard I hold myself to.
I know the direction I am moving in.

This is the foundation everything else builds on.`,
        common_questions: [
          {
            question: "What if I don't know my 'why' yet?",
            answer:
              "That's exactly what this step is for. Start with what matters to you outside of gaming — family, education, personal growth. Your 'why' doesn't need to be perfect; it needs to be honest.",
          },
          {
            question: "How long should my written reflection be?",
            answer:
              "3-5 sentences minimum. Focus on being specific and personal rather than writing a lot.",
          },
        ],
        order_index: 0,
        requires_reflection: true,
        quiz: {
          title: "Step 1 Quiz",
          questions: [
            {
              question: 'What does your "why" represent?',
              options: [
                "The game you enjoy most",
                "The deeper reason you choose discipline and growth",
                "The scholarship amount you want",
                "Your current rank",
              ],
              correct_index: 1,
            },
            {
              question: "According to this lesson, what do coaches value most?",
              options: [
                "Rank alone",
                "Social media presence",
                "Responsibility, preparation, and character",
                "One major tournament win",
              ],
              correct_index: 2,
            },
            {
              question: "Recruiting requires:",
              options: [
                "Immediate visible success",
                "Motivation only when convenient",
                "Consistent effort over time",
                "Natural talent alone",
              ],
              correct_index: 2,
            },
            {
              question: 'Once your "why" is clear, what becomes easier?',
              options: [
                "Skipping steps in the process",
                "Making aligned decisions about your direction",
                "Winning instantly",
                "Avoiding school responsibilities",
              ],
              correct_index: 1,
            },
          ],
        },
      },
    ],
  },

  // ========== STEP 2 ==========
  {
    slug: "step-2-college-list",
    title: "Build Your College List",
    description:
      "Build a strategic college list, choose the right esports program, and learn to use the EVAL College Search Engine.",
    order_index: 2,
    is_free: false,
    lessons: [
      {
        slug: "building-your-college-list",
        title: "Part 1 — Building Your College List",
        description:
          "Learn how to build a balanced college list with safety, target, and reach schools.",
        media_key: "step-2-p1-college-list",
        content_markdown: `# Part 1 — Building Your College List

Regardless of whether you commit through esports, building a strong college list is required.

A good college list includes three types of schools:

**Safety Schools**
Schools you are highly confident you can get into. These often have higher acceptance rates and align clearly with your academic profile.

**Target Schools**
Schools where admission is realistic but not guaranteed. Your GPA and test scores give you a solid chance.

**Reach Schools**
Highly competitive institutions with lower acceptance rates. Admission is possible but uncertain.

Most students apply to **6–15 colleges**.

A strong balance:
- 2–3 Safeties
- 4–5 Targets
- 2–3 Reaches

Applying to too few increases risk.
Applying to too many lowers application quality.

Also consider:
- Location
- Campus culture
- Cost
- Overall fit

You are choosing where you will live for the next several years. Choose intentionally.`,
        common_questions: [
          {
            question: "How many schools should I apply to?",
            answer:
              "Most students apply to 6-15 colleges. A strong balance is 2-3 safeties, 4-5 targets, and 2-3 reaches.",
          },
          {
            question: "Should I only consider schools with esports programs?",
            answer:
              "No. Build your college list based on academics and fit first. Esports is an added benefit, not the only factor.",
          },
        ],
        order_index: 0,
        requires_reflection: false,
        quiz: {
          title: "Step 2 Part 1 Quiz",
          questions: [
            {
              question: "What is the purpose of a college list?",
              options: [
                "Apply randomly",
                "Create a balanced admissions plan",
                "Focus only on rankings",
                "Guarantee acceptance",
              ],
              correct_index: 1,
            },
            {
              question: "A safety school is:",
              options: [
                "Highly ranked nationally",
                "Almost certain admission",
                "Most expensive option",
                "Top esports program",
              ],
              correct_index: 1,
            },
            {
              question: "A target school means:",
              options: [
                "Guaranteed admission",
                "No chance of admission",
                "Realistic but not guaranteed",
                "Only chosen for prestige",
              ],
              correct_index: 2,
            },
            {
              question: "Most students apply to how many colleges?",
              options: ["1–3", "3–5", "6–15", "20–30"],
              correct_index: 2,
            },
            {
              question: "Applying to too many colleges can result in:",
              options: [
                "Better scholarships",
                "Lower application quality",
                "Automatic admission",
                "Higher rankings",
              ],
              correct_index: 1,
            },
          ],
        },
      },
      {
        slug: "choosing-the-right-esports-program",
        title: "Part 2 — Choosing the Right Esports Program",
        description:
          "Learn how to evaluate esports programs based on fit, coaching philosophy, and team culture.",
        media_key: "step-2-p2-coach-fit",
        content_markdown: `# Part 2 — Choosing the Right Esports Program

Choosing an esports program is no different than choosing a college major.

If a student wants to study law, they choose a school strong in liberal arts.
If you are an esports athlete, you should choose a program that specializes in your specific game.

But skill alignment is only part of the decision.

The most important factor is fit.

You should:

- Meet with the coach
- Understand their coaching philosophy
- Make sure your personalities align
- Speak with current players
- Evaluate team culture
- Tour facilities (in-person or virtual)

Prestige and rankings should not be your only focus.

You must be able to see yourself:

- Training in that environment
- Learning from that coach
- Living at that school
- Competing as part of that team

Fit determines development.

Choose a program where you can grow — not just one that looks impressive.

## Deliverable

For each program you are considering, answer:

- Does this program specialize in my game?
- Do I connect with the coach?
- Does the coaching philosophy fit me?
- What is the team culture like?
- Can I see myself thriving here?`,
        common_questions: [
          {
            question: "What if I can't visit a school in person?",
            answer:
              "Virtual tours, video calls with coaches, and speaking with current players are all effective alternatives. Many programs offer virtual visit options.",
          },
        ],
        order_index: 1,
        requires_reflection: false,
        quiz: null,
      },
      {
        slug: "using-the-eval-college-search-engine",
        title: "Part 3 — Using the EVAL College Search Engine",
        description:
          "Learn how to use the EVAL platform to discover, compare, and refine your college list.",
        media_key: "step-2-p3-eval-search",
        content_markdown: `# Part 3 — Using the EVAL College Search Engine

The EVAL College Search Engine is the first feature you will see on the EVAL platform.

This tool is designed to help you discover colleges and universities with esports programs that match your interests.

The directory includes hundreds of colleges and provides key insights such as:

- Coach contact information
- Tuition details
- Scholarship availability
- Future program tryouts
- Academic requirements

You can also use filters to narrow your search by:

- Your specific game
- Scholarship availability
- Location
- Other program features

Instead of manually searching across dozens of websites, the EVAL directory centralizes the information and allows you to compare programs efficiently.

This tool helps you refine your college list by:

- Adding programs that fit your goals
- Removing programs that do not align
- Identifying new opportunities you may not have considered

Use the search engine strategically — not casually.`,
        common_questions: [
          {
            question: "Is the EVAL College Search Engine free to use?",
            answer:
              "Yes, browsing the college directory is available to all EVAL users.",
          },
          {
            question: "How often is the directory updated?",
            answer:
              "The directory is continuously updated as new programs are added and existing program information changes.",
          },
        ],
        order_index: 2,
        requires_reflection: false,
        quiz: {
          title: "Step 2 Part 3 Quiz",
          questions: [
            {
              question: "What is the primary purpose of the EVAL College Search Engine?",
              options: [
                "To rank players nationally",
                "To discover and compare esports programs",
                "To replace the college application process",
                "To guarantee scholarships",
              ],
              correct_index: 1,
            },
            {
              question: "The directory provides which of the following information?",
              options: [
                "Coach contact details",
                "Tuition information",
                "Scholarship availability",
                "All of the above",
              ],
              correct_index: 3,
            },
            {
              question: "The filters feature allows you to sort schools by:",
              options: [
                "Your specific game",
                "Scholarship availability",
                "Location",
                "All of the above",
              ],
              correct_index: 3,
            },
            {
              question: "The search engine helps you:",
              options: [
                "Randomly choose schools",
                "Automatically get admitted",
                "Refine and improve your college list",
                "Avoid meeting coaches",
              ],
              correct_index: 2,
            },
            {
              question: "After using the directory, you should:",
              options: [
                "Commit immediately",
                "Ignore your previous research",
                "Re-evaluate and refine your list",
                "Apply to every school shown",
              ],
              correct_index: 2,
            },
          ],
        },
      },
    ],
  },

  // ========== STEP 3 ==========
  {
    slug: "step-3-application-and-profile",
    title: "Your Application & Profile",
    description:
      "Frame yourself in your college application, understand what coaches look for, and build your EVAL profile.",
    order_index: 3,
    is_free: false,
    lessons: [
      {
        slug: "framing-yourself-in-your-application",
        title: "Part 1 — Framing Yourself in Your College Application",
        description:
          "Learn how to present esports in your college application effectively.",
        media_key: "step-3",
        content_markdown: `# Part 1 — Framing Yourself in Your College Application

When colleges read your application, they are not just evaluating your rank.

They are evaluating you.

As a student-athlete, "student" comes first for a reason.

Your job is not to prove you are cracked at your game.
Your job is to explain:

- Who you are
- What you spend your time doing
- Why it matters

Every strong college application answers three questions:

1. Who are you?
2. What do you spend your time doing?
3. Why does it matter?

When writing about esports, avoid listing only achievements.

Instead of saying:
"I am Radiant in Valorant."

Say:
"I spend 15–20 hours a week practicing, reviewing gameplay, and competing. Through this, I've learned communication under pressure, accountability, and how to accept coaching."

Colleges are not just looking for performance.
They are looking for growth.

Use this simple structure in essays:

- Start with a specific moment (a loss, comeback, challenge, or turning point)
- Explain what you learned
- Connect it to who you are today

Esports can appear in:

- Your Activities section
- Your Personal Statement or supplemental essays
- Additional Information (if needed)

In the Activities section, be specific.

Instead of:
"Esports Player"

Write:
"Varsity Valorant player — 15 hrs/week. Led strategy sessions, organized practices, reviewed gameplay footage, mentored teammates."

Concrete actions demonstrate leadership and discipline.

Your application and your esports recruiting profile should tell the same story.

You are not two different people.

You are one student-athlete.`,
        common_questions: [
          {
            question: "Can I mention esports in my college essays?",
            answer:
              "Absolutely. Esports can appear in your activities section, personal statement, supplemental essays, and additional information. Focus on what you learned, not just your rank.",
          },
          {
            question: "What if I don't have a high rank?",
            answer:
              "Rank is not the only thing that matters. Coaches and admissions officers value commitment, growth, leadership, and character over raw stats.",
          },
        ],
        order_index: 0,
        requires_reflection: false,
        quiz: {
          title: "Step 3 Part 1 Quiz",
          questions: [
            {
              question:
                "What is the main goal when writing about esports in your application?",
              options: [
                "To list rankings only",
                "To show growth, discipline, and character",
                "To focus on statistics",
                "To highlight wins only",
              ],
              correct_index: 1,
            },
            {
              question: "Every strong application answers which three questions?",
              options: [
                "Rank, wins, and tournaments",
                "Who are you, what do you do, and why does it matter",
                "Scholarship amount and team prestige",
                "Social media metrics",
              ],
              correct_index: 1,
            },
            {
              question: "Instead of listing rank, you should focus on:",
              options: [
                "Kill counts",
                "Prize earnings",
                "Time commitment and lessons learned",
                "Leaderboards",
              ],
              correct_index: 2,
            },
            {
              question: "Where can esports appear in your application?",
              options: [
                "Activities section",
                "Essays",
                "Additional information",
                "All of the above",
              ],
              correct_index: 3,
            },
            {
              question: "Your recruiting profile and college application should:",
              options: [
                "Tell different stories",
                "Emphasize rankings only",
                "Reflect the same narrative",
                "Focus only on achievements",
              ],
              correct_index: 2,
            },
          ],
        },
      },
      {
        slug: "what-colleges-and-coaches-look-for",
        title: "Part 2 — What Colleges and Coaches Actually Look For",
        description:
          "Understand the four areas coaches and admissions officers evaluate.",
        media_key: null,
        content_markdown: `# Part 2 — What Colleges and Coaches Actually Look For

Now let's talk about what colleges actually care about.

They are asking one core question:

Can you handle college?

That means:

- Can you manage your time?
- Can you work through challenges?
- Can you contribute to a community?

Esports only matters if it proves those things.

When coaches and admissions officers evaluate you, they look at four main areas:

## 1. Academics

If your grades are weak, esports will not save you.
Your first responsibility is being a student.

## 2. Consistency

They care more about steady effort over time than one peak performance.

## 3. Coachability

Do you take feedback?
Do you apply it?
Do you improve?

## 4. Character

How do you speak about teammates?
How do you respond to losses?
Do you take accountability?

When writing your application, emphasize who you are beyond gameplay.

Talk about:

- Your academics
- What drives you
- How you contribute to community
- Moments of growth

Do not avoid failure.

Instead, show growth through it.

Instead of saying:
"I'm competitive."

Say:
"After losing an important match, I began reviewing footage daily and asking teammates for feedback. Over time, our communication improved and we qualified for playoffs."

That is evidence.
That is maturity.

Colleges are not just building a roster.

They are building a campus.

Your job is to show you belong in both.`,
        common_questions: [
          {
            question: "What if my GPA is low?",
            answer:
              "Focus on showing an upward trend and explaining what you've learned. Coaches value improvement and accountability over a perfect GPA.",
          },
          {
            question: "What does 'coachability' really mean?",
            answer:
              "It means you can receive feedback without getting defensive, apply it to improve, and demonstrate growth over time. Coaches need players who can adapt.",
          },
        ],
        order_index: 1,
        requires_reflection: false,
        quiz: {
          title: "Step 3 Part 2 Quiz",
          questions: [
            {
              question: "What is the main question colleges are asking?",
              options: [
                "What is your rank?",
                "Can you handle college?",
                "How many tournaments have you won?",
                "How many followers do you have?",
              ],
              correct_index: 1,
            },
            {
              question: "If your academics are weak, esports will:",
              options: [
                "Automatically compensate",
                "Guarantee admission",
                "Not save your application",
                "Replace GPA",
              ],
              correct_index: 2,
            },
            {
              question: "Coaches value consistency because it shows:",
              options: [
                "Luck",
                "Long-term discipline",
                "Social popularity",
                "Natural talent only",
              ],
              correct_index: 1,
            },
            {
              question: "Coachability means:",
              options: [
                "Ignoring feedback",
                "Taking feedback and improving",
                "Leading every conversation",
                "Avoiding criticism",
              ],
              correct_index: 1,
            },
            {
              question: 'Instead of saying "I\'m competitive," you should:',
              options: [
                "List your stats",
                "Show evidence of growth and response to failure",
                "Mention rankings",
                "Focus only on wins",
              ],
              correct_index: 1,
            },
          ],
        },
      },
      {
        slug: "turning-this-into-your-eval-profile",
        title: "Part 3 — Turning This Into Your EVAL Profile",
        description:
          "Build your EVAL profile — the esports Common App that coaches see first.",
        media_key: null,
        content_markdown: `# Part 3 — Turning This Into Your EVAL Profile

Now we turn everything you've built into something real:

Your EVAL Profile.

Think of EVAL as your esports Common App.

This is what coaches see first.

Your profile should be clear, complete, and professional within 30 seconds.

---

## Step 1 — Academics

Fill out:

- Major interests
- GPA
- Graduation year

Do not skip this.

Coaches want student-athletes. Academics come first.

---

## Step 2 — Competitive Information

Include:

- Your primary game
- Current rank
- Team history

Keep it accurate and up to date.

---

## Step 3 — Your Bio

This is one of the most important sections.

Use this simple structure:

- One sentence about who you are
- One sentence about your game
- One sentence about your goals

Example:

"I'm a junior interested in computer science who competes in Valorant. I've spent the last two years developing team communication and in-game leadership. I'm looking for a college program where I can grow academically while competing at a high level."

Clean. Professional. Real.

---

## Step 4 — Upload Clips

Your clips do not need to be perfect yet.

They should clearly show:

- Decision-making
- Communication
- Mechanics
- Team play

Progress over perfection.

---

## Step 5 — Recruiting Preferences

Tell coaches what you're looking for:

- Scholarships
- Location
- Division
- Program type

Be specific. Clarity attracts alignment.

---

When you're done, ask yourself:

If I were a coach, would I understand this student in 30 seconds?

If the answer is yes — you're ready.

By the end of Step 3, you now have:

- A college-ready story
- A polished EVAL profile
- A clear recruiting identity

You are no longer guessing.

Next: turning gameplay into a highlight reel.`,
        common_questions: [
          {
            question: "How long should my bio be?",
            answer:
              "3 sentences is ideal. One about you, one about your game, one about your goals. Keep it clean, professional, and honest.",
          },
          {
            question: "Do I need highlight clips to complete my profile?",
            answer:
              "Clips are recommended but not required to complete your profile. You'll learn how to create them in Step 4.",
          },
        ],
        order_index: 2,
        requires_reflection: false,
        quiz: {
          title: "Step 3 Part 3 Quiz",
          questions: [
            {
              question: "The EVAL profile is best described as:",
              options: [
                "A highlight-only page",
                "An esports Common App for coaches",
                "A ranking leaderboard",
                "A social media page",
              ],
              correct_index: 1,
            },
            {
              question: "Why is the academics section important?",
              options: [
                "It is optional",
                "Coaches only care about gameplay",
                "Coaches recruit student-athletes",
                "It increases rank",
              ],
              correct_index: 2,
            },
            {
              question: "Your bio should include:",
              options: [
                "Only your rank",
                "One sentence about you, your game, and your goals",
                "A full essay",
                "Tournament stats only",
              ],
              correct_index: 1,
            },
            {
              question: "Clips should primarily show:",
              options: [
                "Only flashy plays",
                "Random highlights",
                "How you play and think in-game",
                "Edited montages only",
              ],
              correct_index: 2,
            },
            {
              question: "After completing your profile, you should ask:",
              options: [
                "Is this the highest ranked profile?",
                "Would a coach understand me in 30 seconds?",
                "Did I include enough emojis?",
                "Did I add enough stats?",
              ],
              correct_index: 1,
            },
          ],
        },
      },
    ],
  },

  // ========== STEP 4 ==========
  {
    slug: "step-4-highlight-reel",
    title: "Building a College-Level Highlight Reel",
    description:
      "Learn how to create a 2-3 minute highlight reel that helps coaches evaluate you quickly.",
    order_index: 4,
    is_free: false,
    lessons: [
      {
        slug: "building-a-highlight-reel",
        title: "Building a College-Level Highlight Reel",
        description:
          "Create a concise, effective highlight reel that shows coaches how you play.",
        media_key: "step-4",
        content_markdown: `# Building a College-Level Highlight Reel

Most coaches do not have time to watch full matches.

Your highlight reel saves them time and helps them quickly decide whether they want to learn more about you.

Your reel should answer one question:

Why would a coach want this player on their team?

A highlight reel is not entertainment.
It is evaluation.

Keep it short — 2 to 3 minutes maximum.

Start with your strongest clip. Do not build up to it.

Show real gameplay — ranked, scrims, or official matches.

Make sure your role is clear. Whether you are fragging, supporting, shot-calling, or leading, a coach should understand how you impact the game.

Include your tag, rank, and role somewhere on screen.

Avoid common mistakes:

- Do not include long intros or logo animations.
- Do not rely on heavy edits or montage-only clips.
- Do not include bad audio or clips with no context.
- Do not make the video 6–10 minutes long.
- Do not include clips where nothing meaningful happens.

If a coach has to wait for the good part, they will not wait.

Here is the simple process:

1. Record full matches.
2. Select 5–10 clips that show real impact — not just kills.
3. Trim each clip to the moment that matters.
4. Put your best clip first.
5. Export it clean and simple.

If you can clearly explain why each clip matters, it belongs in your reel.

If you cannot explain it, remove it.

Your highlight reel does not need to be flashy.

It needs to be clear.

If a coach understands how you play in under three minutes, you have done your job.

Next, you will learn how to share your reel properly and make sure it gets seen.`,
        common_questions: [
          {
            question: "What recording software should I use?",
            answer:
              "OBS Studio (free), Medal.tv, or your platform's built-in recording. Any tool that captures clean 1080p gameplay works.",
          },
          {
            question: "Should I add music to my highlight reel?",
            answer:
              "Optional. If you do, keep it subtle and avoid copyrighted music. The focus should be on gameplay, not production value.",
          },
          {
            question: "What if I only play ranked and not scrims?",
            answer:
              "Ranked gameplay is perfectly fine. Coaches care about how you play, not the match type. Just make sure the clips show meaningful impact.",
          },
        ],
        order_index: 0,
        requires_reflection: false,
        quiz: {
          title: "Step 4 Quiz",
          questions: [
            {
              question: "What is the main purpose of a highlight reel?",
              options: [
                "To entertain viewers",
                "To showcase editing skills",
                "To help coaches evaluate you quickly",
                "To replace your profile",
              ],
              correct_index: 2,
            },
            {
              question: "How long should your highlight reel be?",
              options: [
                "6–10 minutes",
                "4–5 minutes",
                "2–3 minutes",
                "30 seconds",
              ],
              correct_index: 2,
            },
            {
              question: "What should come first in your reel?",
              options: [
                "A long intro",
                "A montage",
                "Your strongest clip",
                "Background music",
              ],
              correct_index: 2,
            },
            {
              question: "Coaches primarily evaluate:",
              options: [
                "Visual effects",
                "Decision-making and impact",
                "Song choice",
                "Transitions",
              ],
              correct_index: 1,
            },
            {
              question:
                "If a coach has to wait for the good part, they will most likely:",
              options: [
                "Watch the full video",
                "Share it",
                "Stop watching",
                "Replay it",
              ],
              correct_index: 2,
            },
          ],
        },
      },
    ],
  },

  // ========== STEP 5 ==========
  {
    slug: "step-5-outreach-email",
    title: "Write Your College Outreach Email",
    description:
      "Learn how to write a clear, professional email to college esports programs that opens doors.",
    order_index: 5,
    is_free: false,
    lessons: [
      {
        slug: "write-your-outreach-email",
        title: "Write Your College Outreach Email",
        description:
          "Craft your first impression with a college coach — clear, confident, and honest.",
        media_key: "step-5",
        content_markdown: `# Write Your College Outreach Email

In this step, you'll learn how to write a clear, professional email to college esports programs that introduces who you are and why you're a strong fit.

Your email should cover **five things**:

## 1. Who you are
Your name, grade, school, and location.

## 2. What you play
Your main game(s), role, and competitive level or rank.

## 3. Your experience
Teams, leadership roles, championships, or notable results.

## 4. Your academics & character
GPA, leadership, work ethic, and growth mindset.

## 5. Why you're reaching out
Express interest in their program and ask for a conversation.

This email is your **first impression** with a college coach — clear, confident, and honest beats flashy every time.

---

## Email Template

Here's a structure you can follow:

**Subject:** [Your Name] — [Game] Player | Class of [Year] | Interested in [School Name]

Hi Coach [Last Name],

My name is [Name], and I'm a [grade] at [school] in [city, state]. I compete in [game] as a [role], currently ranked [rank].

Over the past [timeframe], I've [describe experience — team, leadership, notable results]. Beyond gameplay, I maintain a [GPA] GPA and am interested in studying [major/interest].

I'm reaching out because [school name]'s esports program stands out to me for [specific reason — coaching philosophy, team culture, academic fit]. I'd love the opportunity to learn more about your program and how I might contribute.

I've attached my EVAL profile and highlight reel for your review. I'd welcome the chance to connect at your convenience.

Thank you for your time.

Best,
[Your Name]
[Your EVAL Profile Link]
[Your Email / Phone]`,
        common_questions: [
          {
            question: "How do I find a coach's email address?",
            answer:
              "Use the EVAL College Search Engine — many programs list coach contact information. You can also check the school's athletics or esports program page.",
          },
          {
            question: "Should I email multiple coaches at the same school?",
            answer:
              "Start with the head coach or program director. If there's a specific game coordinator, they may be the better first contact.",
          },
          {
            question: "What if I don't hear back?",
            answer:
              "Follow up once after 1-2 weeks with a brief, polite message. Coaches are busy — persistence (not spam) shows genuine interest.",
          },
          {
            question: "Should I attach my highlight reel or link to it?",
            answer:
              "Link to it. Attachments can get caught in spam filters. Include your EVAL profile link and a separate link to your highlight reel.",
          },
        ],
        order_index: 0,
        requires_reflection: false,
        quiz: {
          title: "Step 5 Quiz",
          questions: [
            {
              question: "What is the main purpose of your outreach email?",
              options: [
                "To ask for a scholarship immediately",
                "To introduce yourself professionally and express interest",
                "To send your highlight reel only",
                "To compare yourself to other players",
              ],
              correct_index: 1,
            },
            {
              question: "Which of the following should be included in your email?",
              options: [
                "Your name, grade, school, and location",
                "Your main game and role",
                "Your academic information",
                "All of the above",
              ],
              correct_index: 3,
            },
            {
              question: "When describing your experience, you should include:",
              options: [
                "Only your rank",
                "Teams, leadership roles, and notable results",
                "Personal opinions about other teams",
                "Social media stats",
              ],
              correct_index: 1,
            },
            {
              question: "Why should you mention academics and character?",
              options: [
                "Coaches only care about gameplay",
                "Colleges recruit student-athletes",
                "It replaces your highlight reel",
                "It guarantees admission",
              ],
              correct_index: 1,
            },
            {
              question: "How should your email feel to a coach reading it?",
              options: [
                "Flashy and dramatic",
                "Long and detailed",
                "Clear, confident, and honest",
                "Aggressive and competitive",
              ],
              correct_index: 2,
            },
          ],
        },
      },
    ],
  },
];

async function main() {
  console.log("Seeding bootcamp data...\n");

  // 1. Upsert the bootcamp
  const bootcamp = await prisma.bootcamp.upsert({
    where: { slug: BOOTCAMP.slug },
    update: {
      title: BOOTCAMP.title,
      description: BOOTCAMP.description,
      is_published: BOOTCAMP.is_published,
      version: BOOTCAMP.version,
    },
    create: BOOTCAMP,
  });
  console.log(`Bootcamp: ${bootcamp.title} (${bootcamp.id})`);

  // 2. Upsert modules and lessons
  for (const moduleData of MODULES) {
    const mod = await prisma.bootcampModule.upsert({
      where: {
        bootcamp_id_slug: {
          bootcamp_id: bootcamp.id,
          slug: moduleData.slug,
        },
      },
      update: {
        title: moduleData.title,
        description: moduleData.description,
        order_index: moduleData.order_index,
        is_free: moduleData.is_free,
      },
      create: {
        bootcamp_id: bootcamp.id,
        slug: moduleData.slug,
        title: moduleData.title,
        description: moduleData.description,
        order_index: moduleData.order_index,
        is_free: moduleData.is_free,
      },
    });
    console.log(`  Module ${moduleData.order_index}: ${mod.title}`);

    for (const lessonData of moduleData.lessons) {
      const media = lessonData.media_key ? MEDIA[lessonData.media_key] : null;
      const mediaFields = {
        video_url: media?.videoUrl ?? null,
        video_hls_url: media?.hlsUrl ?? null,
        transcript_vtt_url: media?.transcriptVttUrl ?? null,
        poster_url: media?.posterUrl ?? null,
        duration_seconds: media?.durationSeconds ?? null,
      };
      const lesson = await prisma.lesson.upsert({
        where: {
          module_id_slug: {
            module_id: mod.id,
            slug: lessonData.slug,
          },
        },
        update: {
          title: lessonData.title,
          description: lessonData.description,
          ...mediaFields,
          content_markdown: lessonData.content_markdown,
          common_questions: lessonData.common_questions ?? undefined,
          order_index: lessonData.order_index,
          requires_reflection: lessonData.requires_reflection,
        },
        create: {
          module_id: mod.id,
          slug: lessonData.slug,
          title: lessonData.title,
          description: lessonData.description,
          ...mediaFields,
          content_markdown: lessonData.content_markdown,
          common_questions: lessonData.common_questions ?? undefined,
          order_index: lessonData.order_index,
          requires_reflection: lessonData.requires_reflection,
        },
      });
      console.log(`    Lesson ${lessonData.order_index}: ${lesson.title}`);

      // Upsert quiz if present
      if (lessonData.quiz) {
        const quiz = await prisma.quiz.upsert({
          where: { lesson_id: lesson.id },
          update: {
            title: lessonData.quiz.title,
            passing_score: Math.ceil(lessonData.quiz.questions.length * 0.75), // 75% required
            questions: JSON.parse(JSON.stringify(lessonData.quiz.questions)),
          },
          create: {
            lesson_id: lesson.id,
            title: lessonData.quiz.title,
            passing_score: Math.ceil(lessonData.quiz.questions.length * 0.75), // 75% required
            questions: JSON.parse(JSON.stringify(lessonData.quiz.questions)),
          },
        });
        console.log(
          `      Quiz: ${quiz.title} (${lessonData.quiz.questions.length} questions, pass: ${quiz.passing_score}/${lessonData.quiz.questions.length})`,
        );
      }
    }
  }

  console.log("\nBootcamp seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
