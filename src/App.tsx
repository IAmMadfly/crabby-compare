import { open } from '@tauri-apps/api/dialog'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./App.css";
import { For, Show, createSignal, onMount } from 'solid-js';
import { selectDirectory } from './commands';
import { ImageDataScored, listenForImageComparisons } from './events';

type CompareImages = {
  [imagePath: string]: {
    comparisons: Array<ImageDataScored>
  }
}

function App() {
  const [dir, setDir] = createSignal<null | string>(null);
  const [comparisons, setComparisons] = createSignal<CompareImages>({});
  const [scoreDiff, setScoreDiff] = createSignal(0.05);
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    listenForImageComparisons((comparison) => {
      console.log("Comparison:", comparison);

      const prevComparisons = comparisons();

      prevComparisons[comparison.baseImage.path] = {
        comparisons: comparison.images
      }

      setComparisons(prevComparisons);
    });
  })

  async function handleOpen() {
    if (loading()) {
      throw new Error("Cannot load until first directory is done");
    }
    const selected = await open({
      title: "Select directory",
      multiple: false,
      directory: true
    }) as string | null;

    if (!selected) {
      throw new Error("Selected directory is invalid");
    }

    setDir(selected);
    setLoading(true)
    selectDirectory(selected).finally(() => {
      console.log('Completed loading');
      setLoading(false);
    });
  }

  return (
    <div class="">
      <div class='flex flex-col'>
        <div class='flex justify-center'>
          <Show when={dir() != null}>
            <span>{dir()}</span>
          </Show>
        </div>
        <div class='flex justify-center'>
          <div class='flex flex-col w-96'>
            <button class='btn' disabled={loading()} onClick={() => { handleOpen() }}>{loading() ? 'Loading' : 'Select directory'}</button>
            <span>{`${(scoreDiff() * 100).toFixed(2)}%`}</span>
            <input type="range" min="0" max="100" value={scoreDiff() * 100} onInput={(ev) => setScoreDiff(ev.target.valueAsNumber / 100)} class="range" />
          </div>
        </div>
        <For each={Object.entries(comparisons())}>
          {([imagePath, comparison]) => {
            return (
              <div class='flex flex-col justify-center'>
                <div class='flex flex-col justify-center space-y-2'>
                  <div class='flex justify-center'>
                    <img class='w-64' src={convertFileSrc(imagePath)} />
                  </div>
                  <div class='grid grid-cols-4 gap-4'>
                    <For each={comparison.comparisons.filter(image => image.score >= scoreDiff())}>{(image) => {
                      return (
                        <div class='flex flex-col items-center'>
                          <img src={convertFileSrc(image.imageData.path)} />
                          <span>{`${(image.score * 100).toFixed(2)}%`}</span>
                        </div>
                      )
                    }}
                    </For>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export default App;
