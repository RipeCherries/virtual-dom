import { patch, createVNode, Node } from './vdom';
import './style.css';

type Store = {
  state: { count: number };
  onStateChanged: () => void;
  setState: (nextState: { count: number }) => void;
};

const createVApp = (store: Store) => {
  const { count } = store.state;
  return createVNode('div', { class: 'container', 'data-count': count }, [
    createVNode('h1', { class: 'title' }, ['Привет, виртуальный DOM!']),
    createVNode('p', { class: 'counter' }, ['Автоматический счётчик: ', createVNode('span', {}, [`${count}`])]),
    createVNode('img', {
      class: 'gif',
      src: 'https://media1.tenor.com/m/GiUbb4qg_vwAAAAd/csharp-cat-programmer.gif',
      width: 200
    })
  ]);
};

const store: Store = {
  state: { count: 0 },
  onStateChanged: () => {},
  setState(nextState) {
    this.state = nextState;
    this.onStateChanged();
  }
};

let app = patch(createVApp(store), document.getElementById('app') as Node);

store.onStateChanged = () => {
  app = patch(createVApp(store), app);
};

setInterval(() => {
  store.setState({ count: store.state.count + 1 });
}, 1000);
