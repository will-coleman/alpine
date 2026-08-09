/**
 * One file to change when something about the outside world changes.
 */

export const site = {
  url: "https://alpineflyer.com",
  name: "Alpine Media Group",
  // The studio name, not a company. Used in <title> suffixes and the footer.
  shortName: "Alpine Media Group",
  locale: "en_GB",
  lang: "en-GB",
  email: "milo@coleman-clan.co.uk",
  based: "England",
};

export const youtube = {
  // From the channel page source: "channelId":"UC…". Paste a new one here and
  // rebuild — nothing else references it.
  channelId: "UC4D2l9P7L_hJk5ZfkLD3_Xw",
  handle: "@AlpineFlyer",
  channelUrl: "https://www.youtube.com/@AlpineFlyer",
  subscribeUrl: "https://www.youtube.com/@AlpineFlyer?sub_confirmation=1",
  feedUrl(id = this.channelId) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
  },
};

export const instagram = {
  handle: "@visiteuropeproject",
  url: "https://www.instagram.com/visiteuropeproject/",
};

/**
 * The properties. Everything that renders a property iterates this array and
 * skips `enabled: false`, so adding the third one is a data edit and a
 * rebuild — no template changes, no new components.
 *
 *   id        stable key; content files reference it
 *   tag       what the running index prints in the channel column
 *   accent    the section accent, set as a CSS custom property on the wrapper
 */
export const properties = [
  {
    id: "alpine-flyer",
    enabled: true,
    name: "Alpine Flyer",
    tag: "Alpine Flyer",
    section: "videos",
    href: "/videos/",
    platform: "YouTube",
    external: youtube.channelUrl,
    blurb: "Airline reviews, flight sim, and what's actually wrong with the aeroplane.",
  },
  {
    // Still a real thing I run, but it lives on Instagram — the site just
    // points at it from /about rather than mirroring it.
    id: "visit-europe",
    enabled: false,
    name: "Visit Europe Project",
    tag: "Visit Europe",
    section: "europe",
    href: "/europe/",
    platform: "Instagram",
    external: instagram.url,
    blurb: "Forty-four countries, one at a time. Guides, hidden gems, and where to actually go.",
  },
  {
    // Third slot. Fill in, set enabled: true, add items with
    // `property: "slot-three"` to a content file, and it appears in the
    // running index, the footer and the home page doors on the next build.
    id: "slot-three",
    enabled: false,
    name: "",
    tag: "",
    section: "",
    href: "",
    platform: "",
    external: "",
    blurb: "",
  },
];

export const nav = [
  { href: "/videos/", label: "Videos" },
  { href: "/instagram/", label: "Instagram" },
  { href: "/partnerships/", label: "Partnerships" },
  { href: "/about/", label: "About" },
];


/**
 * The next video. Set `published: true` (or just delete this block) when it
 * goes up and the block disappears from the home page on the next build.
 *
 * Drop the artwork in src/assets/upcoming/. Both are optional — the block
 * renders without them, and the build tells you if a filename is wrong.
 *   thumb  the 16:9 title card
 *   still  a frame from the video, used on the Instagram page
 */
export const upcoming = {
  live: true,
  title: "I TOOK THE TRAIN ACROSS *EUROPE*",
  note: "London to Helsinki, overland, no flights. Out soon.",
  thumb: "europe-by-train.jpg",
  still: "train-window.jpg",
};

/** Set PUBLIC_FORMSPREE_ENDPOINT in the environment. See .env.example. */
export const formspree = process.env.PUBLIC_FORMSPREE_ENDPOINT || "";

export default { site, youtube, instagram, properties, nav, upcoming, formspree };
