// Key for storage
const STORAGE_KEY = 'todos';

/** @typedef {{id:string,text:string,completed:boolean,createdAt:number,completedAt?:number}} Todo */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const input = $('#todo-input');
const addBtn = $('#add-btn');
const listActive = $('#list-active');
const listDone = $('#list-done');
const countActive = $('#count-active');
const countDone = $('#count-done');
const stats = $('#stats');
const tpl = $('#item-template');

let todos = /** @type {Todo[]} */([]);

// Utils
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmtDate = (ts) => {
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${hh}:${mm}`;
};

async function loadTodos() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      todos = Array.isArray(res[STORAGE_KEY]) ? res[STORAGE_KEY] : [];
      resolve(todos);
    });
  });
}

async function saveTodos() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: todos }, () => resolve());
  });
}

function render() {
  listActive.innerHTML = '';
  listDone.innerHTML = '';

  const active = todos.filter(t => !t.completed);
  const done = todos.filter(t => t.completed);

  active.forEach(t => listActive.appendChild(renderItem(t)));
  done.forEach(t => listDone.appendChild(renderItem(t)));

  countActive.textContent = String(active.length);
  countDone.textContent = String(done.length);
  stats.textContent = `待办: ${active.length} / 已完成: ${done.length}`;
}

function renderItem(todo) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  const li = node; // LI
  const checkbox = $('.toggle', li);
  const text = $('.text', li);
  const meta = $('.meta', li);
  const del = $('.delete', li);

  li.dataset.id = todo.id;
  if (todo.completed) li.classList.add('done');

  checkbox.checked = todo.completed;
  text.textContent = todo.text;
  meta.textContent = todo.completed ? `完成于 ${fmtDate(todo.completedAt || Date.now())}` : `创建于 ${fmtDate(todo.createdAt)}`;

  checkbox.addEventListener('change', async () => {
    const t = todos.find(x => x.id === todo.id);
    if (!t) return;
    t.completed = checkbox.checked;
    t.completedAt = t.completed ? Date.now() : undefined;
    await saveTodos();
    render();
  });

  del.addEventListener('click', async () => {
    todos = todos.filter(x => x.id !== todo.id);
    await saveTodos();
    render();
  });

  li.addEventListener('dblclick', () => startInlineEdit(li, todo));

  return li;
}

function startInlineEdit(li, todo) {
  const content = $('.content', li);
  const original = todo.text;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = original;
  input.maxLength = 120;
  input.className = 'edit';
  input.style.width = '100%';
  input.style.background = 'transparent';
  input.style.color = 'inherit';
  input.style.border = '1px dashed var(--border)';
  input.style.borderRadius = '6px';
  input.style.padding = '4px 6px';

  const onCommit = async () => {
    const v = input.value.trim();
    if (!v) { input.value = original; }
    else {
      const t = todos.find(x => x.id === todo.id);
      if (t) t.text = v;
      await saveTodos();
    }
    render();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onCommit();
    if (e.key === 'Escape') { render(); }
  });
  input.addEventListener('blur', onCommit);

  content.innerHTML = '';
  content.appendChild(input);
  input.focus();
}

function addTodoFromInput() {
  const text = input.value.trim();
  if (!text) return;
  const todo = { id: uid(), text, completed: false, createdAt: Date.now() };
  todos.unshift(todo);
  input.value = '';
  saveTodos().then(render);
}

addBtn.addEventListener('click', addTodoFromInput);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodoFromInput(); });

document.addEventListener('DOMContentLoaded', async () => {
  await loadTodos();
  render();
  // 让输入框更易用
  setTimeout(() => input.focus(), 50);
});
