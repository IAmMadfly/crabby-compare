import { listen } from "@tauri-apps/api/event";

type ImageData = {
  name: string;
  path: string;
};

export type Comparison = {
  images: [ImageData, ImageData];
  score: number;
};

export function listenForImageComparisons(
  fn: (comparison: Comparison) => void
) {
  listen("score", (ev) => {
    fn(ev.payload as Comparison);
  });
}
