/* Homepage editorial interactions. Destination pages remain independent. */
const menu = document.querySelector("#menu");
document
  .querySelector(".menu-toggle")
  .addEventListener("click", () => menu.showModal());
document
  .querySelectorAll("[data-close]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      document.getElementById(button.dataset.close).close(),
    ),
  );
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => menu.close()));
const stories = {
  coast: {
    title: "Coastal hours.",
    kicker: "002 / THE COAST",
    image: "../assets/coast.webp",
    alt: "Coastal hours visual study",
    copy: "A series of imagined views from the edge of the sea, where the road gives way to the horizon. An editorial visual study created for TOHEŞAR.",
  },
  detail: {
    title: "The small things.",
    kicker: "003 / MATERIAL & FORM",
    image: "../assets/detail.webp",
    alt: "Automotive detail visual study",
    copy: "An exploration of the details that give objects their character — light, material, reflection and form.",
  },
  bluehour: {
    title: "After the light.",
    kicker: "004 / BLUE HOUR",
    image: "../assets/yokohama-bluehour.webp",
    alt: "A silver Porsche at Yokohama harbor after dusk",
    copy: "Blue settles over the waterfront. A silver car remains by the water as the city lights begin to take over. An independently generated visual study for TOHEŞAR.",
  },
};
const storyDialog = document.querySelector("#story-dialog");
document.querySelectorAll("[data-story]").forEach((button) =>
  button.addEventListener("click", () => {
    const story = stories[button.dataset.story];
    document.querySelector("#dialog-title").textContent = story.title;
    document.querySelector("#dialog-kicker").textContent = story.kicker;
    document.querySelector("#dialog-copy").textContent = story.copy;
    const image = document.querySelector("#dialog-image");
    image.src = story.image;
    image.alt = story.alt;
    storyDialog.showModal();
  }),
);
storyDialog.addEventListener("click", (event) => {
  const rect = storyDialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    storyDialog.close();
});

// Motion follows the editorial rhythm. Native scrolling is never intercepted.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const ease = "cubic-bezier(.22,1,.36,1)";
const entrance = (element, keyframes, delay = 0) => {
  if (!element || reducedMotion.matches) return;
  element.animate(keyframes, {
    duration: 1250,
    delay,
    easing: ease,
    fill: "backwards",
  });
};
entrance(
  document.querySelector(".wordmark"),
  [
    { clipPath: "inset(0 0 100% 0)", transform: "translateY(24px)" },
    { clipPath: "inset(0)", transform: "translateY(0)" },
  ],
  80,
);
entrance(
  document.querySelector(".hero-intro"),
  [
    { opacity: 0, transform: "translateY(28px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  300,
);
entrance(
  document.querySelector(".opening-meta"),
  [{ opacity: 0 }, { opacity: 1 }],
  150,
);

const reveals = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entrance(entry.target, [
        { opacity: 0, transform: "translateY(35px)" },
        { opacity: 1, transform: "translateY(0)" },
      ]);
      reveals.unobserve(entry.target);
    }),
  { threshold: 0.12 },
);
document
  .querySelectorAll(
    ".selected-heading,.study,.manifesto h2,.manifesto-bottom,.destinations h2,.destination,.footer-top",
  )
  .forEach((el) => reveals.observe(el));

const feature = document.querySelector(".featured-frame");
const featureImage = feature.querySelector("img");
let scrollFrame = 0;
function scrollComposition() {
  scrollFrame = 0;
  const progress =
    scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty("--reading-progress", progress);
  if (reducedMotion.matches) {
    featureImage.style.transform = "";
    return;
  }
  const rect = feature.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < innerHeight) {
    const position =
      (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
    featureImage.style.transform = `translateY(${position * -24}px) scale(1.07)`;
  }
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollComposition);
  },
  { passive: true },
);
reducedMotion.addEventListener("change", scrollComposition);
scrollComposition();

// A short curtain and stagger give the index its own considered entrance.
new MutationObserver(() => {
  if (!menu.open || reducedMotion.matches) return;
  menu.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" }], {
    duration: 650,
    easing: ease,
  });
  menu.querySelectorAll("nav a").forEach((link, index) =>
    entrance(
      link,
      [
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      120 + index * 65,
    ),
  );
}).observe(menu, { attributes: true, attributeFilter: ["open"] });

// Fine pointers get a restrained magnetic response, without replacing the cursor.
if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
  document.querySelectorAll(".round-link").forEach((link) => {
    const circle = link.querySelector(".round-arrow");
    link.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches) return;
      const bounds = link.getBoundingClientRect();
      circle.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * 0.1}px,${(event.clientY - bounds.top - bounds.height / 2) * 0.2}px) rotate(45deg)`;
    });
    link.addEventListener("pointerleave", () => (circle.style.transform = ""));
  });
}
