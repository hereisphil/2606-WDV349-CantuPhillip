# Project & Portfolio

* **Research Notes**
* **Phillip Cantu**
* **Assignment Due Date:  Nov 2, 2026**

## Main Topic - Project Clarification & Kick Off

I'm writing this one a little differently. It's still the research for class, but I also want to open this file in a few months and remember what I decided, and why, when the build starts pulling me in ten directions. If future-me is lost, start with the Kick Off section.

---

### Project Clarification (via the supplied resources)

We were given the [YouTube Video](https://www.youtube.com/watch?v=Th8JoIan4dg) where Jared Friedman from Y Combinator talks about how he evaluates startups. I found this to be extremely informative. For example, the Top 4 Mistakes that startups or founders looking to start one are:

- Not solving a real problem
- Stuck on a "tarpit idea" (an idea that's been historically difficult to solve)
- Not evaluating or thoroughly analyzing the idea
- Waiting for the perfect idea.

I do believe, although perhaps there is some bias, and some unknowns that I have, that my mnemonic-image, SRS-based language learning app, Memli, does not fall into any of the above mistakes. However, perhaps I can do more evaluating, especially of my competitors. Jared went on to ask 10 Questions one should ask about their idea and/or startup, most of which I've already answered here in my research and the [Project Proposal](../ProjectProposal.md) or [Tech Stack](../TechStack.md) documents. His questions about the competition, and whether this is something other people want, are both areas I need to dig into more as I continue to build.

Nevertheless, much of my research is indeed for launching a legitimate app / startup into the world, marketing it, selling it, and growing a company. If Memli doesn't pass all of the marks, that's okay. My ultimate goal is to learn and grow as a developer, and I already know that I am building something I plan to use. Something I definitely want to exist.

The article and the book chapter were both written more for project managers than for someone building alone, but I still took a lot from them. The Getting Started chapter is about what a proposal has to hold before a project should kick off: the problem, the goals, what's in scope, what's out, how you'll know it worked, and what could go wrong. A lot of that already lives in the proposal. What I had not been honest about yet is the line around what I am not building yet, and what "done" even means for me versus for a company. I answer that below.

The Envy Labs article is the question list. Even without a team for now, besides any AI agent I use for help, these are the ones worth keeping:

- What blind spots do competitors have? Who actually gains from this app?
- What features am I implementing, in what order, and how will I know they worked?
- Have I set up design standards? Where do they live, and when do I revisit them?
- What third-party tech should I use, and what am I refusing to add just because it looks cool?
- How does this stay maintained once the exciting part is over?
- What does failure look like, so I can see it coming?

I have several of these already answered through my documentation. They're still questions I need to revisit as I iterate. The Kick Off section is the revisit. If a new idea shows up and I can't place it against that list, it waits.

#### Reference Links

**Jared Friedman's talk**<br />[How to Get and Evaluate Startup Ideas | Startup School
](https://www.youtube.com/watch?v=Th8JoIan4dg)

**Envy Labs' article**<br />[Discovery: Can You Answer Software’s Key Kickoff Questions?
](https://envylabs.com/insights/software-development-discovery-process)

**The Principles of Project Management (SitePoint: Project Management)**<br />[Ch 2. Getting Started](https://learning.oreilly.com/library/view/the-principles-of/9780980285864/Text/ch02.html)

---

### Kick Off

A kickoff is the point where everyone agrees on the goal and the scope, usually right before a contract is signed. After that, the job is to build, not to keep renegotiating what the thing is. A statement of work is just that agreement written down: the proposal, the wireframes, the technical plan.

I don't have a client or a signed contract. The agreement is with myself, and the paperwork is the [Project Proposal](../ProjectProposal.md), the [Tech Stack](../TechStack.md), and the designs already in this repo. If I later want something big that isn't in those docs, payments, a mobile app, a social feed, that's a change order. I write it down and choose it on purpose.

This is the version of those discovery questions I want to still be able to answer.

**Who is this for?** Me, first. Then people like Alex in the proposal: adults who actually want the language to stick, who loved the old Memrise mems, and who bounced off Anki because it felt complicated and dull. Duolingo's casual crowd is not the audience. If I start designing for streaks, I drifted. It's for serious language learners. Not casual "do my streak" in 3 minutes and then I'm done for the day.

**What are competitors missing?** Memrise walked away from user-made mems. Duolingo optimized for showing up, not for remembering. Anki has the repetition science and almost none of the joy or the community inside the app. Quizlet feels nice, and the scheduling is soft. The gap I care about is a fast review loop where the thing that makes a word stick is a memory hook a person made, real learning, real personalization - not some generic mold around a language that everyone is forced to adopt.

**What am I actually building right now?** Two things, the two use cases already written down. One: open a course and review the cards that are due, without the app getting in the way. Two: when a card doesn't stick, attach a mem, a short story and an image, and have that mem be the one I see next time. Courses, levels, upvotes, and sharing can stay in the plan. They are not the kickoff. The review loop is.

**How will I know this worked?** I use it. A card grades, the next one shows up without a reload, and a word I kept missing finally sticks because of a mem I wrote. For class, success is a working slice of that. For me, success is that I still want to open it. User counts and revenue are real questions, and Jared was right that I still need to learn whether other people want this. That research does not block me from building the thing I already want.

**What does failure look like?** I polish the stack and never review a card. I keep adding features until Memli is a worse Anki. I talk myself out of shipping because it isn't a perfect startup. The point is to learn, and to make something I will use. If it never becomes a company, that is allowed. Forgetting why the review loop matters is the actual fail.

**What stays decided?** The stack stays the one in the tech stack doc: React, Hono, Cloudflare, Drizzle, TanStack, shadcn, Bun. Design standards already started in the [style tile](../designs/style-tile/StyleTile.md) and the wireframes. I revisit them when a screen feels off. I don't throw them out because a new tool looks fun. Maintenance, for now, is me. If I can't operate a service alone, it doesn't go in, and/or, I gradually implement AI agents/bots such as GitHub's dependabot, to micro-ly watch or manage things as I get more confident in their setups and abilities (caveat: will only use what's available for free).

**What about the name?** The app is Memli. That is the name on `dev` right now. I had a plan to rename it FluentVine, and I'm already unsure about that one too, so the name is not part of this kickoff and it is not worth stalling the build over. Heads up to future-me: this `research` branch is behind `dev`. If an older doc on this branch still says Mnemno, that name is stale. Trust Memli until I actually rename it, then swap the new name into the pitch and leave the rest of the script alone.

#### The 30-Second Pitch

Part of this week's independent study was the 30-second pitch, the short version of an idea you could say on an elevator ride. A [Techstars write-up](https://www.techstars.com/blog/founder-advice/the-keys-to-creating-the-perfect-30-second-pitch) I liked puts it as a handful of plain questions: who's it for, what's the problem, what's the product, and why should anyone care. Their formula is basically: for this person, who has this problem, we made this, so they can do this.

Spoken out loud, 30 seconds is roughly 75 words. If I can't get through it without wandering into Cloudflare and Drizzle, I'm not clear yet. That's the test. The script says Memli because that's the name today. Read it once out loud before I need it. If it runs long, I cut from the middle. The last line stays.

**Script**:

> Memli is for adults who are serious about remembering a language, not just keeping a streak. Most apps drill corporate generic cards until you burn out, or hand you a flashcard tool that feels dated and lonely. Memli brings back user-made memory hooks, the images and stories that make a word stick, then schedules those cards with spaced repetition so they stay. If a word slips the day after you learn it, Memli is built for that.

#### Reference Links

**Techstars**<br />[The Keys to Creating the Perfect 30-Second Pitch](https://www.techstars.com/blog/founder-advice/the-keys-to-creating-the-perfect-30-second-pitch)
