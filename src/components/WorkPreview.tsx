import type { CSSProperties } from "react";
import { galleryImages, projectCover } from "../data/workImages";
import "./WorkPreview.css";

const sizes = ["md", "lg", "sm", "lg", "md", "sm", "md", "sm"] as const;
const offsets = [10, -14, 16, -4, 8, -16, 12, 6];
const rots = [-1.2, 0.9, -0.5, 0.7, -1.4, 1.2, -0.7, 0.4];

export function WorkPreview() {
  return (
    <div className="work-preview" aria-hidden="true">
      <ul className="work-preview__strip">
        {galleryImages.map((project, index) => {
          const image = projectCover(project);
          return (
            <li
              key={project.title}
              className={`work-preview__item work-preview__item--${sizes[index % sizes.length]}`}
              style={
                {
                  "--i": index,
                  "--y": `${offsets[index % offsets.length]}px`,
                  "--rot": `${rots[index % rots.length]}deg`,
                  "--pos": image.position ?? "50% 50%",
                } as CSSProperties
              }
            >
              <img
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
