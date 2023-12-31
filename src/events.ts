import { listen } from "@tauri-apps/api/event";

export type ImageData = {
  name: string;
  path: string;
};

export type ImageDataScored = {
  score: number;
  imageData: ImageData;
};

export type Comparison = {
  baseImage: ImageData;
  images: Array<ImageDataScored>;
};

export function listenForImageComparisons(
  fn: (comparison: Comparison) => void
) {
  listen<Comparison>("score", (ev) => {
    console.log("SCORE EVENT");
    fn(ev.payload);
  });
}
