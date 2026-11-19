import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type UIEvent,
  type WheelEvent,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import {
  GALLERY_FOCUS_INDEX,
  galleryImages,
  projectCover,
  ROMAN,
  type Project,
  type ProjectImage,
} from "../data/workImages";
import "./Portfolio.css";

gsap.registerPlugin(Flip);

/** Match CSS rise — keep JS and motion on the same clock */
const RISE_MS = 640;
const STEP_MS = 640;
const WHEEL_THRESHOLD = 48;

type Mode = "idle" | "work" | "project";

function padFrame(n: number) {
  return String(n).padStart(2, "0");
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function RollGlyph({
  char,
  reduced,
  delay,
}: {
  char: string;
  reduced: boolean;
  delay: number;
}) {
  const previous = useRef<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    if (reduced) {
      previous.current = char;
      setLeaving(null);
      setEnter(false);
      return;
    }
    if (previous.current === null) {
      previous.current = char;
      setEnter(true);
      const timer = window.setTimeout(() => setEnter(false), 700);
      return () => window.clearTimeout(timer);
    }
    if (previous.current === char) return;
    const from = previous.current;
    previous.current = char;
    setLeaving(from);
    setEnter(true);
    const timer = window.setTimeout(() => {
      setLeaving(null);
      setEnter(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [char, reduced]);

  const glyph = char === " " ? "\u00a0" : char;
  const exit = leaving === " " ? "\u00a0" : leaving;
  return (
    <span className="roll-glyph">
      {exit !== null && !reduced ? (
        <span
          className="roll-glyph__char roll-glyph__char--out"
          style={{ animationDelay: `${delay}ms` }}
          aria-hidden="true"
        >
          {exit}
        </span>
      ) : null}
      <span
        className={enter && !reduced ? "roll-glyph__char roll-glyph__char--in" : "roll-glyph__char"}
        style={enter && !reduced ? { animationDelay: `${delay}ms` } : undefined}
      >
        {glyph}
      </span>
    </span>
  );
}

function RollingText({ value }: { value: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="roll">
      {value.split("").map((char, index) => (
        <RollGlyph key={index} char={char} reduced={reduced} delay={index * 45} />
      ))}
    </span>
  );
}

/** One crossfade per value change — outgoing and incoming share a single clock. */
function FadeSwap({ value, live = false }: { value: string; live?: boolean }) {
  const reduced = useReducedMotion();
  const shownRef = useRef(value);
  const [shown, setShown] = useState(value);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const timer = useRef(0);

  useLayoutEffect(() => {
    if (value === shownRef.current) return;
    const previous = shownRef.current;
    shownRef.current = value;
    setShown(value);
    if (reduced) {
      setOutgoing(null);
      return;
    }
    setOutgoing(previous);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOutgoing(null), STEP_MS + 40);
  }, [reduced, value]);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <span className="portfolio__swap">
      {live ? (
        <span className="portfolio__swap-live" aria-live="polite">
          {shown}
        </span>
      ) : null}
      {outgoing !== null ? (
        <span className="portfolio__swap-out" aria-hidden="true">
          {outgoing}
        </span>
      ) : null}
      <span
        key={shown}
        className={outgoing !== null ? "portfolio__swap-in" : undefined}
        aria-hidden={live ? true : undefined}
      >
        {shown}
      </span>
    </span>
  );
}

type ExploreFrame = {
  kind: "hero" | "stack" | "pair" | "single";
  images: ProjectImage[];
  range: string;
  total: string;
  credits: boolean;
};

/** Hero, then pairs down the page: right stack, side-by-side, right stack. */
function exploreFrames(project: Project): ExploreFrame[] {
  const images = project.images;
  if (images.length === 0) return [];
  const total = padFrame(images.length);
  const frames: ExploreFrame[] = [
    {
      kind: "hero",
      images: [images[0]],
      range: padFrame(1),
      total,
      credits: false,
    },
  ];
  let cursor = 2;
  let sideBySide = false;
  for (let i = 1; i < images.length; ) {
    const chunk = images.slice(i, i + 2);
    const kind = chunk.length === 1 ? "single" : sideBySide ? "pair" : "stack";
    frames.push({
      kind,
      images: chunk,
      range:
        chunk.length === 2
          ? `${padFrame(cursor)} + ${padFrame(cursor + 1)}`
          : padFrame(cursor),
      total,
      credits: frames.length > 1,
    });
    cursor += chunk.length;
    i += chunk.length;
    sideBySide = !sideBySide;
  }
  return frames;
}

export function Portfolio() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedOnWork = location.pathname === "/work";

  const [mode, setMode] = useState<Mode>(openedOnWork ? "work" : "idle");
  const [raised, setRaised] = useState(openedOnWork);
  const [preview, setPreview] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [active, setActive] = useState(GALLERY_FOCUS_INDEX);
  const [viewed, setViewed] = useState(GALLERY_FOCUS_INDEX);
  const [moving, setMoving] = useState(false);
  const [frame, setFrame] = useState(0);
  const [morphing, setMorphing] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnSet, setReturnSet] = useState(false);
  const [heldScene, setHeldScene] = useState<null | "fan" | "project">(null);

  const lock = useRef(false);
  const wheelAcc = useRef(0);
  const previewTimer = useRef(0);
  const riseTimer = useRef(0);
  const moveTimer = useRef(0);
  const homeTimer = useRef(0);
  const rootRef = useRef<HTMLElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const stepPageRef = useRef<(dir: number) => void>(() => {});
  const activeRef = useRef(active);
  const modeRef = useRef(mode);
  const flipState = useRef<Flip.FlipState | null>(null);
  const morphingRef = useRef(false);
  const sceneHold = useRef(false);
  const returningRef = useRef(false);
  activeRef.current = active;
  modeRef.current = mode;

  const project: Project =
    galleryImages[active] ?? galleryImages[GALLERY_FOCUS_INDEX];
  const viewedProject: Project =
    galleryImages[viewed] ?? project;
  const frames = exploreFrames(viewedProject);
  const shown = frames[Math.min(frame, Math.max(frames.length - 1, 0))];
  const indexLabel =
    mode === "project" || (returning && heldScene === "project")
      ? "photographs"
      : project.title;

  const showPreview = useCallback(() => {
    if (mode !== "idle" || raised || lock.current) return;
    window.clearTimeout(previewTimer.current);
    setPreview(true);
  }, [mode, raised]);

  const clearHot = useCallback(() => {
    const root = rootRef.current;
    if (root) delete root.dataset.hot;
  }, []);

  const hidePreview = useCallback(() => {
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      setPreview(false);
      setHoverIndex(null);
      clearHot();
    }, 220);
  }, [clearHot]);

  const leavePreview = useCallback(
    (event: MouseEvent) => {
      const next = event.relatedTarget;
      if (
        next instanceof Element &&
        next.closest(
          ".portfolio__strip, .portfolio__bridge, .portfolio__link--work",
        )
      ) {
        return;
      }
      hidePreview();
    },
    [hidePreview],
  );

  const trackThumb = useCallback((index: number, current: HTMLElement) => {
    setHoverIndex(index);
    const roman = current.querySelector(".portfolio__strip-roman");
    const box = (roman ?? current).getBoundingClientRect();
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty(
      "--hot-x",
      `${((box.left + box.width / 2) / window.innerWidth) * 100}%`,
    );
    root.style.setProperty(
      "--hot-y",
      `${(box.bottom / window.innerHeight) * 100}%`,
    );
    root.dataset.hot = "true";
  }, []);

  const hold = useCallback((ms = RISE_MS) => {
    lock.current = true;
    window.clearTimeout(moveTimer.current);
    moveTimer.current = window.setTimeout(() => {
      lock.current = false;
      setMoving(false);
    }, ms);
  }, []);

  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(galleryImages.length - 1, next));
    if (clamped === activeRef.current || lock.current) return;
    setMoving(true);
    setActive(clamped);
    hold();
  }, [hold]);

  const stepProject = useCallback(
    (delta: number) => {
      goTo(activeRef.current + delta);
    },
    [goTo],
  );

  /** Home → work scroller (reference fan) */
  const enterWork = useCallback(
    (index = GALLERY_FOCUS_INDEX, event?: MouseEvent) => {
      event?.preventDefault();
      if (lock.current || returningRef.current) return;

      const clamped = Math.max(0, Math.min(galleryImages.length - 1, index));
      setPreview(false);
      setHoverIndex(null);

      if (mode === "work" || mode === "project") {
        if (mode === "project") setMode("work");
        goTo(clamped);
        if (!lock.current) hold();
        if (location.pathname !== "/work") navigate("/work");
        return;
      }

      setActive(clamped);

      const covers = rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-flip-id]",
      );
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      hold();
      setRaised(true);
      window.clearTimeout(riseTimer.current);

      if (!covers || covers.length === 0 || reduced) {
        riseTimer.current = window.setTimeout(() => {
          setMode("work");
          clearHot();
          if (location.pathname !== "/work") navigate("/work");
        }, RISE_MS);
        return;
      }

      flipState.current = Flip.getState(covers);
      morphingRef.current = true;
      setMode("work");
      setMorphing(true);
      if (location.pathname !== "/work") navigate("/work");
    },
    [clearHot, goTo, hold, location.pathname, mode, navigate],
  );

  useLayoutEffect(() => {
    if (!morphing || !flipState.current) return;
    const root = rootRef.current;
    if (!root) return;
    const state = flipState.current;
    flipState.current = null;
    const targets = root.querySelectorAll<HTMLElement>(".portfolio__fan-figure");
    Flip.from(state, {
      targets,
      duration: RISE_MS / 1000,
      ease: "power2.inOut",
      absolute: true,
      scale: true,
      prune: true,
      onComplete: () => {
        morphingRef.current = false;
        setMorphing(false);
        clearHot();
      },
    });
  }, [clearHot, morphing]);

  /** Work scroller → full project images */
  const openProject = useCallback((index = activeRef.current) => {
    if (lock.current || returningRef.current) return;
    const clamped = Math.max(0, Math.min(galleryImages.length - 1, index));
    setActive(clamped);
    setViewed(clamped);
    setFrame(0);
    setMode("project");
    hold();
  }, [hold]);

  const closeProject = useCallback(() => {
    if (modeRef.current !== "project" || returningRef.current || lock.current) return;
    setMode("work");
    hold();
  }, [hold]);

  const enterArchive = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (lock.current) return;

      if (raised || mode !== "idle") {
        navigate("/archive");
        return;
      }

      lock.current = true;
      setPreview(false);
      setHoverIndex(null);
      setRaised(true);
      window.clearTimeout(riseTimer.current);
      riseTimer.current = window.setTimeout(() => {
        lock.current = false;
        navigate("/archive");
      }, RISE_MS);
    },
    [mode, navigate, raised],
  );

  const goHome = useCallback(
    (event?: MouseEvent) => {
      event?.preventDefault();
      if (lock.current || returningRef.current) return;
      if (modeRef.current === "idle" && !raised) return;

      window.clearTimeout(riseTimer.current);
      window.clearTimeout(moveTimer.current);
      window.clearTimeout(homeTimer.current);
      setMoving(false);
      setPreview(false);
      setHoverIndex(null);
      clearHot();
      morphingRef.current = false;
      setMorphing(false);
      flipState.current = null;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      sceneHold.current = true;
      lock.current = true;

      if (reduced) {
        setReturning(false);
        setReturnSet(false);
        setHeldScene(null);
        setMode("idle");
        setRaised(false);
        if (location.pathname !== "/") navigate("/");
        homeTimer.current = window.setTimeout(() => {
          lock.current = false;
          sceneHold.current = false;
        }, 0);
        return;
      }

      const from =
        modeRef.current === "project"
          ? "project"
          : modeRef.current === "work"
            ? "fan"
            : null;
      returningRef.current = true;
      setHeldScene(from);
      setReturning(true);
      setReturnSet(true);
      setRaised(true);
      setMode("idle");

      if (location.pathname !== "/") navigate("/");
    },
    [clearHot, location.pathname, navigate, raised],
  );

  useEffect(() => {
    if (!returnSet) return;
    const id = requestAnimationFrame(() => {
      setReturnSet(false);
      setRaised(false);
    });
    return () => cancelAnimationFrame(id);
  }, [returnSet]);

  useEffect(() => {
    if (!returning) return;
    homeTimer.current = window.setTimeout(() => {
      returningRef.current = false;
      sceneHold.current = false;
      lock.current = false;
      setReturning(false);
      setReturnSet(false);
      setHeldScene(null);
    }, STEP_MS + 80);
    return () => window.clearTimeout(homeTimer.current);
  }, [returning]);

  useEffect(() => {
    if (morphingRef.current || sceneHold.current || returningRef.current) return;
      if (location.pathname === "/work") {
      window.clearTimeout(riseTimer.current);
      setRaised(true);
      setMode((m) => (m === "project" ? "project" : "work"));
      setPreview(false);
      return;
    }
    if (location.pathname === "/") {
      window.clearTimeout(riseTimer.current);
      window.clearTimeout(moveTimer.current);
      setMoving(false);
      setMode("idle");
      setRaised(false);
      setPreview(false);
      setHoverIndex(null);
      clearHot();
    }
  }, [clearHot, location.pathname]);

  useEffect(() => {
    return () => {
      window.clearTimeout(previewTimer.current);
      window.clearTimeout(riseTimer.current);
      window.clearTimeout(moveTimer.current);
      window.clearTimeout(homeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mode === "idle") return;

    const onKey = (event: KeyboardEvent) => {
      if (modeRef.current === "project") {
        if (event.key === "Escape") {
          event.preventDefault();
          closeProject();
        } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          stepPageRef.current(1);
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          stepPageRef.current(-1);
        }
        return;
      }

      // work scroller
      if (event.key === "Escape") {
        event.preventDefault();
        goHome();
      } else if (event.key === "Enter") {
        event.preventDefault();
        openProject();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        stepProject(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        stepProject(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(galleryImages.length - 1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeProject, goHome, goTo, mode, openProject, stepProject]);

  const onFanWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (mode !== "work") return;
      event.preventDefault();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      wheelAcc.current += delta;
      if (Math.abs(wheelAcc.current) < WHEEL_THRESHOLD) return;
      const dir = wheelAcc.current > 0 ? 1 : -1;
      wheelAcc.current = 0;
      stepProject(dir);
    },
    [mode, stepProject],
  );

  const onExploreScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const y = el.scrollTop + el.clientHeight * 0.4;
    const nodes = el.querySelectorAll<HTMLElement>("[data-frame]");
    let index = 0;
    nodes.forEach((node, i) => {
      if (node.offsetTop <= y) index = i;
    });
    setFrame((current) => (current === index ? current : index));
  }, []);

  useEffect(() => {
    if (mode !== "project") return;
    setFrame(0);
    const el = exploreRef.current;
    if (!el) return;
    el.scrollTo(0, 0);
    el.focus({ preventScroll: true });

    let quietTimer = 0;
    let frame = 0;
    let originPage = -1;
    let velocity = 0;
    let peak = 0;
    let lastWheel = 0;
    let touchOrigin = 0;
    let touchLastY = 0;
    let touchLastT = 0;
    let touchSpeed = 0;

    const height = () =>
      el.querySelector("section")?.offsetHeight || el.clientHeight || 1;
    const maxPage = () =>
      Math.max(0, Math.round(el.scrollHeight / height()) - 1);
    const clampPage = (page: number) =>
      Math.max(0, Math.min(maxPage(), page));
    const pageOf = (top: number) => clampPage(Math.round(top / height()));

    const animateTo = (top: number) => {
      const from = el.scrollTop;
      const dist = top - from;
      if (frame) cancelAnimationFrame(frame);
      if (Math.abs(dist) < 1) {
        el.scrollTop = top;
        frame = 0;
        return;
      }
      const t0 = performance.now();
      const dur = Math.min(680, Math.max(420, Math.abs(dist) * 0.72));
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const eased =
          t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        el.scrollTop = from + dist * eased;
        frame = t < 1 ? requestAnimationFrame(step) : 0;
      };
      frame = requestAnimationFrame(step);
    };

    const goPage = (dir: number, fromPage = pageOf(el.scrollTop)) => {
      animateTo(clampPage(fromPage + dir) * height());
    };
    stepPageRef.current = (dir) => goPage(dir);

    const settle = () => {
      const h = height();
      const start = originPage < 0 ? pageOf(el.scrollTop) : originPage;
      const traveled = el.scrollTop - start * h;
      const dir = peak !== 0 ? Math.sign(peak) : Math.sign(traveled);
      const flicked = Math.abs(peak) > 1.8 || Math.abs(traveled) > h * 0.42;
      const page =
        flicked && dir !== 0
          ? clampPage(start + dir)
          : pageOf(el.scrollTop);
      originPage = -1;
      velocity = 0;
      peak = 0;
      animateTo(page * h);
    };

    const onWheel = (event: globalThis.WheelEvent) => {
      let dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 16;
      if (event.deltaMode === 2) dy *= height();
      if (dy === 0) return;
      event.preventDefault();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;

      const now = performance.now();
      const h = height();
      if (originPage < 0) originPage = pageOf(el.scrollTop);
      const dt = Math.max(8, now - lastWheel);
      lastWheel = now;
      velocity = velocity * 0.35 + (dy / dt) * 0.65;
      if (Math.abs(velocity) > Math.abs(peak)) peak = velocity;

      const min = (originPage - 1) * h;
      const max = (originPage + 1) * h;
      const atStart = el.scrollTop <= 0 && dy < 0;
      const atEnd = el.scrollTop >= maxPage() * h && dy > 0;
      let next = el.scrollTop + (atStart || atEnd ? dy * 0.22 : dy);
      if (next < min) next = min + (next - min) * 0.18;
      if (next > max) next = max + (next - max) * 0.18;
      el.scrollTop = Math.max(0, next);

      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(settle, 140);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      touchLastY = event.touches[0]?.clientY ?? 0;
      touchLastT = performance.now();
      touchOrigin = pageOf(el.scrollTop);
      touchSpeed = 0;
      originPage = touchOrigin;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchLastY;
      const now = performance.now();
      const dt = Math.max(1, now - touchLastT);
      touchSpeed = (touchLastY - y) / dt;
      velocity = touchSpeed;
      touchLastY = y;
      touchLastT = now;
    };

    const onTouchEnd = () => {
      settle();
      touchSpeed = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      window.clearTimeout(quietTimer);
      if (frame) cancelAnimationFrame(frame);
      stepPageRef.current = () => {};
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [mode, active]);

  const onFanFigureClick = useCallback(
    (index: number) => {
      if (index === activeRef.current) {
        openProject(index);
        return;
      }
      goTo(index);
    },
    [goTo, openProject],
  );

  const onIndexClick = useCallback(
    (index: number) => {
      if (modeRef.current === "project") {
        if (index === activeRef.current || lock.current) return;
        setMode("work");
        goTo(index);
        if (!lock.current) hold();
        return;
      }
      goTo(index);
    },
    [goTo, hold],
  );

  return (
    <main
      ref={rootRef}
      style={{ "--active": active } as CSSProperties}
      className={[
        "portfolio",
        `portfolio--${mode}`,
        raised ? "portfolio--raised" : "",
        preview ? "portfolio--preview" : "",
        moving ? "portfolio--moving" : "",
        morphing ? "is-morphing" : "",
        returning ? "is-returning" : "",
        returnSet ? "is-return-set" : "",
        heldScene === "project" ? "is-from-project" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
            className="portfolio__hero"
            src="/hero.jpg"
            alt=""
            width={668}
            height={456}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
          <p className="portfolio__signature" aria-hidden="true">
            minh do
          </p>

          {mode === "idle" && !returning ? (
            <>
          <div
            className="portfolio__bridge"
            aria-hidden="true"
            onMouseEnter={showPreview}
            onMouseLeave={leavePreview}
          />

          <div
            className="portfolio__strip"
            onMouseEnter={showPreview}
            onMouseLeave={leavePreview}
          >
            <span className="portfolio__strip-dot" aria-hidden="true">
              •
            </span>
            <ul className="portfolio__strip-list">
              {galleryImages.map((item, index) => {
                const cover = projectCover(item);
                const hot = hoverIndex === index;
                return (
                  <li
                    key={item.title + index}
                    className={[
                      "portfolio__strip-item",
                      hot ? "is-hot" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={(event) =>
                      trackThumb(index, event.currentTarget)
                    }
                  >
                    <button
                      type="button"
                      className="portfolio__strip-hit"
                      onClick={(event) => enterWork(index, event)}
                    >
                      <figure
                        className="portfolio__strip-figure"
                        data-flip-id={`cover-${index}`}
                      >
                        <img
                          src={cover.src}
                          alt=""
                          width={cover.width}
                          height={cover.height}
                          decoding="async"
                          loading="eager"
                          draggable={false}
                          style={{
                            objectPosition: cover.position ?? "50% 50%",
                          }}
                        />
                      </figure>
                      <span className="portfolio__strip-meta">
                        <span className="portfolio__strip-roman">
                          {ROMAN[index]}
                          <span className="portfolio__strip-period" aria-hidden="true">
                            .
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
            </>
          ) : null}

      <nav className="portfolio__nav" aria-label="Primary">
        <NavLink
          to="/"
          end
          className="portfolio__link portfolio__link--brand"
          onClick={goHome}
        >
          minh do
        </NavLink>
        <NavLink
          to="/work"
          className={[
            "portfolio__link",
            "portfolio__link--work",
            !raised ? "portfolio__link--on-photo" : "",
            raised || mode === "work" || mode === "project" ? "is-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(event) => enterWork(GALLERY_FOCUS_INDEX, event)}
          onMouseEnter={showPreview}
          onMouseLeave={leavePreview}
          onFocus={showPreview}
          onBlur={hidePreview}
        >
          work
        </NavLink>
        <NavLink
          to="/archive"
          className={[
            "portfolio__link",
            "portfolio__link--archive",
            !raised ? "portfolio__link--on-photo" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={enterArchive}
        >
          archive
        </NavLink>
        <NavLink to="/info" className="portfolio__link portfolio__link--info">
          info
        </NavLink>
      </nav>

      <aside
        className="portfolio__index"
        aria-label="Projects"
        aria-hidden={mode === "idle" ? true : undefined}
        inert={mode === "idle"}
        style={{ "--active": active } as CSSProperties}
      >
        <span
          className="portfolio__index-mark"
          style={{ "--i": -1 } as CSSProperties}
          aria-hidden="true"
        >
          •
        </span>
        <ol className="portfolio__index-list">
          {galleryImages.map((item, index) => {
            const isActive = index === active;
            return (
              <li
                key={item.title + index}
                className={
                  isActive
                    ? "portfolio__index-item is-active"
                    : "portfolio__index-item"
                }
                style={{ "--i": index } as CSSProperties}
              >
                <button
                  type="button"
                  className="portfolio__index-btn"
                  onClick={() => onIndexClick(index)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="portfolio__index-roman">
                    {ROMAN[index]}.
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="portfolio__index-title">
          <FadeSwap value={indexLabel} />
        </p>
        {shown ? (
          <p
            className="explore__count"
            aria-hidden={mode !== "project" ? true : undefined}
            aria-label={`${shown.range} / ${shown.total}`}
          >
            <span className="explore__count-range">
              <RollingText value={shown.range} />
            </span>
            <span className="explore__count-slash" aria-hidden="true">
              /
            </span>
            <span className="explore__count-total">
              <RollingText value={shown.total} />
            </span>
          </p>
        ) : null}
      </aside>

      <p className="portfolio__year">
        <FadeSwap value={project.year} live />
      </p>

      <div
        className={[
          "scene",
          "scene-fan",
          heldScene === "fan" ? "is-held" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        inert={mode !== "work" && !morphing}
      >
          <div
            className="portfolio__fan"
            onWheel={onFanWheel}
            role="listbox"
            aria-label="Project scroller"
            aria-activedescendant={`fan-${active}`}
            tabIndex={0}
          >
            {galleryImages.map((item, index) => {
              const cover = projectCover(item);
              const offset = index - active;
              return (
                <figure
                  key={item.title + index}
                  id={`fan-${index}`}
                  data-flip-id={`cover-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={[
                    "portfolio__fan-figure",
                    index === active ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    {
                      "--offset": offset,
                      "--abs": Math.abs(offset),
                    } as CSSProperties
                  }
                  onClick={() => onFanFigureClick(index)}
                >
                  <img
                    src={cover.src}
                    alt=""
                    width={cover.width}
                    height={cover.height}
                    decoding="async"
                    loading={Math.abs(offset) > 2 ? "lazy" : "eager"}
                    draggable={false}
                    style={{ objectPosition: cover.position ?? "50% 50%" }}
                  />
                </figure>
              );
            })}
          </div>
      </div>

      <div
        className={[
          "scene",
          "scene-project",
          heldScene === "project" ? "is-held" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        inert={mode !== "project"}
      >
          <div className="explore__veil" aria-hidden="true" />

          <div className="explore__text">
            <div className="explore__mark">
              {viewedProject.mark ? <span>{viewedProject.mark}</span> : null}
              {viewedProject.logo ? (
                <span className="explore__logo">{viewedProject.logo}</span>
              ) : null}
            </div>
            <ul className="explore__meta">
              {viewedProject.code ? <li>{viewedProject.code}</li> : null}
              {viewedProject.location ? <li>Location: {viewedProject.location}</li> : null}
              {viewedProject.client ? <li>{viewedProject.client}</li> : null}
              <li>{viewedProject.year}</li>
              {viewedProject.category ? <li>{viewedProject.category}</li> : null}
            </ul>
            {viewedProject.copy.length > 0 ? (
              <div className="explore__copy">
                {viewedProject.copy.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
            {viewedProject.credits || viewedProject.body ? (
              <footer className="explore__credits">
                {viewedProject.credits ? (
                  <ul>
                    {viewedProject.credits.map((credit) => (
                      <li key={credit}>{credit}</li>
                    ))}
                  </ul>
                ) : null}
                {viewedProject.body ? <p>{viewedProject.body}</p> : null}
              </footer>
            ) : null}
          </div>

          <div
            className="explore"
            ref={exploreRef}
            tabIndex={0}
            onScroll={onExploreScroll}
          >
            {frames.map((section) => {
              const inset = section.kind === "stack" && section.credits;
              const sectionClass =
                section.kind === "hero"
                  ? "explore__hero"
                  : section.kind === "pair"
                    ? "explore__pair"
                    : section.kind === "single"
                      ? "explore__single"
                      : inset
                        ? "explore__stack explore__stack--inset"
                        : "explore__stack";
              return (
                <section key={section.range} className={sectionClass} data-frame>
                  {section.kind === "hero" ? (
                    <figure className="explore__hero-figure">
                      <img
                        src={section.images[0].src}
                        alt=""
                        width={section.images[0].width}
                        height={section.images[0].height}
                        decoding="async"
                        draggable={false}
                        style={{
                          objectPosition: section.images[0].position ?? "50% 50%",
                        }}
                      />
                    </figure>
                  ) : (
                    <div className="explore__media">
                      {section.images.map((image, imageIndex) => (
                        <img
                          key={image.src + imageIndex}
                          src={image.src}
                          alt=""
                          width={image.width}
                          height={image.height}
                          decoding="async"
                          draggable={false}
                          style={{
                            objectPosition: image.position ?? "50% 50%",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
      </div>
    </main>
  );
}
