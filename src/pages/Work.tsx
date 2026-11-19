import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import {
  GALLERY_FOCUS_INDEX,
  galleryImages,
  projectCover,
} from "../data/workImages";
import "./Work.css";

const LOOP_COPIES = 3;
const REARRANGE_DELAY_MS = 1100;
const REARRANGE_DURATION_MS = 1100;

const midRots = [-8, 6, -11, 9, -5, 7, -10];

export function Work() {
  const stripRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLElement | null>(null);
  const [layout, setLayout] = useState<"row" | "stack">("row");
  const [looping, setLooping] = useState(false);

  // Enter as a row and guide-scroll to the 2nd image
  useEffect(() => {
    const strip = stripRef.current;
    const focus = focusRef.current;
    if (!strip || !focus || layout !== "row") return;

    const centerFocus = () => {
      const stripBox = strip.getBoundingClientRect();
      const focusBox = focus.getBoundingClientRect();
      const delta =
        focusBox.left +
        focusBox.width / 2 -
        (stripBox.left + stripBox.width / 2);
      strip.scrollTo({
        left: strip.scrollLeft + delta,
        behavior: "smooth",
      });
    };

    const t1 = window.setTimeout(centerFocus, 100);
    const t2 = window.setTimeout(centerFocus, 650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [layout]);

  // Rotate + FLIP rearrange into a vertical column
  useEffect(() => {
    if (layout !== "row") return;

    const timer = window.setTimeout(() => {
      const strip = stripRef.current;
      if (!strip) return;

      const figures = [
        ...strip.querySelectorAll<HTMLElement>(".work-page__figure"),
      ];
      const firsts = figures.map((f) => f.getBoundingClientRect());

      setLayout("stack");

      requestAnimationFrame(() => {
        figures.forEach((figure, index) => {
          const last = figure.getBoundingClientRect();
          const dx = firsts[index].left - last.left;
          const dy = firsts[index].top - last.top;
          const rot = midRots[index % midRots.length];
          figure.style.transition = "none";
          figure.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
        });

        requestAnimationFrame(() => {
          figures.forEach((figure) => {
            figure.style.transition = `transform ${REARRANGE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            figure.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
          });
        });
      });

      window.setTimeout(() => {
        figures.forEach((figure) => {
          figure.style.transition = "";
          figure.style.transform = "";
        });
        setLooping(true);
      }, REARRANGE_DURATION_MS + 40);
    }, REARRANGE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [layout]);

  // Infinite vertical scroll once stacked
  useEffect(() => {
    if (!looping || layout !== "stack") return;
    const strip = stripRef.current;
    if (!strip) return;

    const setHeight = () => strip.scrollHeight / LOOP_COPIES;

    // Land in the middle copy, aligned to the focus image
    requestAnimationFrame(() => {
      const h = setHeight();
      const focus = strip.querySelector<HTMLElement>(
        `[data-gallery-index="${GALLERY_FOCUS_INDEX}"]`,
      );
      if (focus) {
        const top =
          focus.offsetTop - (strip.clientHeight - focus.offsetHeight) / 2;
        strip.scrollTop = top;
      } else {
        strip.scrollTop = h;
      }
    });

    const onScroll = () => {
      const h = setHeight();
      if (h <= 0) return;
      if (strip.scrollTop < h * 0.35) {
        strip.scrollTop += h;
      } else if (strip.scrollTop > h * 1.65) {
        strip.scrollTop -= h;
      }
    };

    strip.addEventListener("scroll", onScroll, { passive: true });
    return () => strip.removeEventListener("scroll", onScroll);
  }, [looping, layout]);

  const copies = looping ? LOOP_COPIES : 1;
  const items = Array.from({ length: copies }, (_, copy) =>
    galleryImages.map((project, index) => ({
      image: projectCover(project),
      index,
      key: `${copy}-${project.title}`,
      copy,
    })),
  ).flat();

  return (
    <main
      className={
        layout === "stack"
          ? "work-page work-page--stack"
          : "work-page work-page--row"
      }
    >
      <SiteHeader animateIn />

      <div className="work-page__stage">
        <div className="work-page__strip" ref={stripRef}>
          {items.map(({ image, index, key }) => (
            <figure
              key={key}
              className="work-page__figure"
              data-gallery-index={index}
              ref={
                !looping && index === GALLERY_FOCUS_INDEX
                  ? focusRef
                  : undefined
              }
              style={
                layout === "row"
                  ? { animationDelay: `${80 + index * 45}ms` }
                  : undefined
              }
            >
              <img
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                style={{
                  objectPosition: image.position ?? "50% 50%",
                }}
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
    </main>
  );
}
