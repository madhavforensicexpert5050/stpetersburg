/**
 * Devender Garg's first-person page (/about/devender-garg/) and the homepage founder note.
 *
 * Every sentence here is a PROPOSED first-person statement. It is published only after Devender Garg
 * approves it (approvals.founderStatements). The "Founder & Owner" title is shown only after the
 * relationship is confirmed (approvals.founderRole). Until then the route and the homepage section
 * are left out of the public build.
 *
 * Rules: first person throughout; no invented history, education, years, credentials, clients,
 * achievements or founding story. The portrait is Devender's own supplied photo (approvals.founderPortrait).
 */
export const founder = {
  name: 'Devender Garg',
  /** Shown only when approvals.founderRole is recorded. */
  role: 'Founder & Owner',
  path: '/about/devender-garg/',
  /** Owner-supplied portrait (approvals.founderPortrait). Full frame keeps the face and the StageLiora backdrop intact. */
  portrait: {
    src: '/media/founder/devender-garg-founder-stageliora.webp', width: 1199, height: 1312,
    srcset: [['/media/founder/devender-garg-founder-stageliora-480w.webp', 480], ['/media/founder/devender-garg-founder-stageliora-800w.webp', 800], ['/media/founder/devender-garg-founder-stageliora.webp', 1199]] as [string, number][],
    headshot: '/media/founder/devender-garg-founder-stageliora-headshot-400.webp',
    headshotSmall: '/media/founder/devender-garg-founder-stageliora-headshot-200.webp',
    alt: 'Devender Garg, Founder and Owner of StageLiora, seated at his desk in a navy and gold office',
    altHeadshot: 'Portrait of Devender Garg, Founder and Owner of StageLiora',
  },

  hero: {
    eyebrow: 'About me',
    h1: "Hi, I'm Devender Garg.",
    sub: 'The perspective behind StageLiora',
    intro: 'Through StageLiora, I want to bring thoughtful design and clear visual presentation together, to help people explore the possibilities within residential spaces.',
  },

  story: {
    h: 'Why StageLiora matters to me',
    p: [
      'Most people meet a home on a screen long before they walk through it. An empty room in a photo can look smaller, colder and harder to understand than it feels in person. That gap between a photograph and a real space is what StageLiora is about for me.',
      'Careful virtual staging helps close that gap. A sofa at the right scale, a bed with room to walk around it, a dining table that shows how many people fit: these are the details that help someone understand a room before they visit.',
      'What matters to me is that it is done honestly. Furniture can change in an image. The walls, windows, floors and the view should not.',
    ],
  },

  vision: {
    h: 'My vision for StageLiora',
    intro: 'I want StageLiora to be known for property visuals people can trust. These are the things I want it to stand for:',
    points: [
      'Thoughtful visual presentation, where every room has a clear purpose',
      'Respect for the actual property and its permanent features',
      'Room styling that looks believable at true scale',
      'Clear before-and-after comparisons taken from the same view',
      'Useful design options, so a style can be chosen for the house and not only the trend',
      'Responsible image presentation, with edits that are easy to recognize and disclose',
    ],
    note: 'These are the goals I am building toward, not promises about any particular project.',
  },

  approach: {
    h: 'How I think about property presentation',
    principles: [
      { h: 'Respect the property', p: "I believe the best visual presentation starts with respecting a property's existing features. Windows, walls, proportions and permanent details should remain central to how a room is shown." },
      { h: 'Keep the visuals believable', p: 'I would rather show a room with fewer, well-scaled pieces than fill it with furniture that could never fit. When an image looks too good to be real, it stops being useful to the person looking at it.' },
      { h: 'Choose designs with purpose', p: 'I think a design direction should suit the architecture and the people likely to live there, not just follow what is popular. That is why I want StageLiora to show the same kinds of rooms across several styles.' },
      { h: 'Present changes clearly', p: 'I believe an edited image should be understood as edited. That means keeping the original beside the result, naming the kind of edit, and supporting whatever disclosure the MLS asks for.' },
    ],
  },

  building: {
    h: "What I'm building with StageLiora",
    p: [
      'StageLiora is focused on virtual staging and real estate image visualization for the St. Petersburg, Florida market.',
      'I keep two kinds of work apart. Listing photo edits, such as virtual staging, furniture removal and restaging, photo enhancement and twilight exteriors, are meant to show a property as it is. Concept visualizations of paint, flooring, ceilings, exterior color and landscaping are for planning a change, not for a listing photo.',
    ],
    links: [
      ['/services/', 'Explore Our Services', 'arrow'],
      ['/portfolio/', 'View Before & After', 'arrow'],
      ['/design-styles/', 'Browse Design Styles', 'guide'],
    ] as [string, string, 'arrow' | 'guide'][],
  },

  message: {
    h: 'A note from me',
    p: "To me, great property presentation is about more than adding furniture to an image. It is about helping a space feel understandable, balanced and thoughtfully presented. That is the perspective I want StageLiora to reflect.",
  },

  connect: {
    h: "Let's connect",
    p: 'You can reach StageLiora by phone or email. Questions about virtual staging, or about a specific listing photo, are welcome.',
  },

  /** Homepage section (about 60 words). */
  home: {
    eyebrow: 'Behind StageLiora',
    h: 'A note from Devender Garg',
    p: "I'm Devender Garg. My vision for StageLiora is to bring thoughtful design, realistic room visualization and clear property presentation together. I believe the best visuals should help people imagine a space while respecting the features that make each property unique.",
    cta: 'Read my story',
  },
} as const;
