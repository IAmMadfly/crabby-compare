import { open } from '@tauri-apps/api/dialog'
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./App.css";
import { For, Show, createSignal, onMount } from 'solid-js';
import { selectDirectory } from './commands';
import { Comparison, listenForImageComparisons } from './events';

function App() {
  const [dir, setDir] = createSignal<null | string>(null);
  const [comparisons, setComparisons] = createSignal(new Array<Comparison>());
  const [scoreDiff, setScoreDiff] = createSignal(0.05);
  const [loading, setLoading] = createSignal(false);

  // setComparisons([JSON.parse('[{"baseImage":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"images":[]},{"baseImage":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"images":[{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06098922714591026}]},{"baseImage":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"images":[{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06832507252693176},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06641650944948196}]},{"baseImage":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"images":[{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.0822243019938469},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06525257229804993},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06606956571340561}]},{"baseImage":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"images":[{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.08349357545375824},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.07996509969234467},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06449173390865326},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.05921005457639694}]},{"baseImage":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"images":[{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.07804491370916367},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.06743849813938141},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.07139991968870163},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.08374447375535965},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06838823854923248},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06561696529388428}]},{"baseImage":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"images":[{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.06131584569811821},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.06872296333312988},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.06935736536979675},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.07560992985963821},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.0628027617931366},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06289245933294296},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.05592333897948265}]},{"baseImage":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"images":[{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.07320988923311234},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.0985388457775116},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.09024824947118759},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.08669310808181763},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.08296357095241547},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.08564753085374832},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.0801151916384697},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.0697229653596878}]},{"baseImage":{"name":"image_00013.jpg","path":"I:\\\\CompareData\\\\image_00013.jpg"},"images":[{"imageData":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"score":0.09496006369590759},{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.06594978272914886},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.08350367844104767},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.08700696378946304},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.0758499950170517},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.08421917259693146},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.08168450742959976},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06489329785108566},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06283509731292725}]},{"baseImage":{"name":"image_00010.jpg","path":"I:\\\\CompareData\\\\image_00010.jpg"},"images":[{"imageData":{"name":"image_00013.jpg","path":"I:\\\\CompareData\\\\image_00013.jpg"},"score":0.07954365760087967},{"imageData":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"score":0.09239345043897629},{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.0725969597697258},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.0947260707616806},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.08813165873289108},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.07385191321372986},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.0785762146115303},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.0765005499124527},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.08482814580202103},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.05955556407570839}]},{"baseImage":{"name":"image_00025.jpg","path":"I:\\\\CompareData\\\\image_00025.jpg"},"images":[{"imageData":{"name":"image_00010.jpg","path":"I:\\\\CompareData\\\\image_00010.jpg"},"score":0.07154582440853119},{"imageData":{"name":"image_00013.jpg","path":"I:\\\\CompareData\\\\image_00013.jpg"},"score":0.07202181220054626},{"imageData":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"score":0.08326222002506256},{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.057599276304244995},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.07177891582250595},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.07454391568899155},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.06717103719711304},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.07003924250602722},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.06681463122367859},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.06522180140018463},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.06629705429077148}]},{"baseImage":{"name":"image_00012.jpg","path":"I:\\\\CompareData\\\\image_00012.jpg"},"images":[{"imageData":{"name":"image_00025.jpg","path":"I:\\\\CompareData\\\\image_00025.jpg"},"score":0.07037705928087234},{"imageData":{"name":"image_00010.jpg","path":"I:\\\\CompareData\\\\image_00010.jpg"},"score":0.08426477760076523},{"imageData":{"name":"image_00013.jpg","path":"I:\\\\CompareData\\\\image_00013.jpg"},"score":0.08237044513225555},{"imageData":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"score":0.09378668665885925},{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.06464654207229614},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.0917254388332367},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.08115734905004501},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.07728800922632217},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.07760436832904816},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.07875582575798035},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.0684405043721199},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.05807296559214592}]},{"baseImage":{"name":"image_00022.jpg","path":"I:\\\\CompareData\\\\image_00022.jpg"},"images":[{"imageData":{"name":"image_00012.jpg","path":"I:\\\\CompareData\\\\image_00012.jpg"},"score":0.06521634757518768},{"imageData":{"name":"image_00025.jpg","path":"I:\\\\CompareData\\\\image_00025.jpg"},"score":0.05462914705276489},{"imageData":{"name":"image_00010.jpg","path":"I:\\\\CompareData\\\\image_00010.jpg"},"score":0.06300076842308044},{"imageData":{"name":"image_00013.jpg","path":"I:\\\\CompareData\\\\image_00013.jpg"},"score":0.0663582980632782},{"imageData":{"name":"image_00001.jpg","path":"I:\\\\CompareData\\\\image_00001.jpg"},"score":0.0694938525557518},{"imageData":{"name":"image_00003.jpg","path":"I:\\\\CompareData\\\\image_00003.jpg"},"score":0.04942278563976288},{"imageData":{"name":"image_00029.jpg","path":"I:\\\\CompareData\\\\image_00029.jpg"},"score":0.06396226584911346},{"imageData":{"name":"image_00021.jpg","path":"I:\\\\CompareData\\\\image_00021.jpg"},"score":0.06481780111789703},{"imageData":{"name":"image_00011.jpg","path":"I:\\\\CompareData\\\\image_00011.jpg"},"score":0.05496777221560478},{"imageData":{"name":"image_00027.jpg","path":"I:\\\\CompareData\\\\image_00027.jpg"},"score":0.0640202984213829},{"imageData":{"name":"image_00005.jpg","path":"I:\\\\CompareData\\\\image_00005.jpg"},"score":0.05472210422158241},{"imageData":{"name":"image_00017.jpg","path":"I:\\\\CompareData\\\\image_00017.jpg"},"score":0.05403198301792145},{"imageData":{"name":"image_00009.jpg","path":"I:\\\\CompareData\\\\image_00009.jpg"},"score":0.052430409938097}]}]')]);

  onMount(() => {
    listenForImageComparisons((comparison) => {
      console.log("Comparison:", comparison);
      setComparisons([...comparisons(), comparison]);
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
        <Show when={loading()}>
          <div class='flex justify-center text-lg'>
            <h2>Loading</h2>
          </div>
        </Show>
        <div class='flex justify-center'>
          <div class='flex flex-col w-96'>
            <button class='btn' onClick={() => { handleOpen() }}>Select directory</button>
            <span>{`${(scoreDiff() * 100).toFixed(2)}%`}</span>
            <input type="range" min="0" max="100" value={scoreDiff() * 100} onInput={(ev) => setScoreDiff(ev.target.valueAsNumber / 100)} class="range" />
          </div>
        </div>
        <For each={comparisons().filter(comp => comp.images.some(image => image.score >= scoreDiff()))}>
          {(comparison) => {
            return (
              <div class='flex flex-col justify-center'>
                <div class='flex flex-col justify-center space-y-2'>
                  <div class='flex justify-center'>
                    <img class='w-64' src={convertFileSrc(comparison.baseImage.path)} />
                  </div>
                  <div class='grid grid-cols-4 gap-4'>
                    <For each={comparison.images.filter(image => image.score >= scoreDiff())}>{(image) => {
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
