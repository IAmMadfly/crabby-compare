import { open } from '@tauri-apps/api/dialog'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./App.css";
import { For, Show, createSignal, onMount } from 'solid-js';
import { selectDirectory } from './commands';
import { Comparison, listenForImageComparisons } from './events';

function App() {
  const [dir, setDir] = createSignal<null | string>(null);
  const [score, setScore] = createSignal(new Array<Comparison>());
  const [scoreDiff, setScoreDiff] = createSignal(0.05);

  onMount(() => {
    listenForImageComparisons((comparison) => {
      setScore([...score(), comparison]);
    });
  })

  async function handleOpen() {
    const selected = await open({
      title: "Select directory",
      multiple: false,
      directory: true
    }) as string | null;

    if (!selected) {
      throw new Error("Selected directory is invalid");
    }

    setDir(selected);

    selectDirectory(selected);
  }

  return (
    <div class="">
      <div class='flex flex-col'>
        <div>
          <Show when={dir() != null}>
            <span>{dir()}</span>
          </Show>
        </div>
        <div class='flex justify-center'>
          <div class='flex flex-col w-96'>
            <button class='btn' onClick={() => { handleOpen() }}>Select directory</button>
            <span>{`${(scoreDiff() * 100).toFixed(2)}%`}</span>
            <input type="range" min="0" max="100" value="10" onChange={(ev) => setScoreDiff(ev.target.valueAsNumber / 100)} class="range" />
          </div>
        </div>
        <For each={score().filter(c => c.score > scoreDiff())}>
          {(images) => {
            return (
              <div class='flex flex-col justify-center'>
                <div class='flex flex-col justify-center space-x-2'>
                  <div class='flex flex-row'>
                    <img class='w-64' src={convertFileSrc(images.images[0].path)} />
                    <img class='w-64' src={convertFileSrc(images.images[1].path)} />
                  </div>
                  <span>{`${(images.score * 100).toFixed(2)}%`}</span>
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
