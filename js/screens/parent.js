// Parent area (behind the 3-second gate): version + updates, app language, profiles,
// the save (restore a backup; on the preview: copy the live app's save in).
import { h } from '../dom.js';
import { LANGS, LANG_NAMES, getLang, setLang, t } from '../i18n.js';
import { stopSpeaking } from '../audio.js';
import {
  addProfile, copyLiveSave, deleteProfile, getProfile, getProfiles, isPreview, listBackups, restoreBackup,
  setSetting, updateProfile,
} from '../storage.js';
import { checkNow } from '../updates.js';
import { VERSION } from '../version.js';
import { iconButton, topBar } from '../ui.js';

const AVATARS = ['🦊', '🐱', '🐼', '🦄', '🐸', '🐙', '🦋', '🐢', '🐰', '🐯', '🐧', '🦉', '🐞', '🐳', '🦁', '🐨'];

// A row of big toggle buttons (used for languages and avatars).
function choiceRow(options, selected, onPick, className = '') {
  return h('div', { class: `choice-row ${className}`, role: 'radiogroup' },
    options.map(({ value, label }) => h('button', {
      class: 'choice',
      type: 'button',
      role: 'radio',
      'aria-checked': String(value === selected),
      onclick: () => onPick(value),
    }, label)));
}

export function render(root, params, app) {
  stopSpeaking();
  // Where "back" goes: the hub if a player was chosen and still exists.
  const leave = () => (params.profileId && getProfile(params.profileId)
    ? app.show('hub', { profileId: params.profileId })
    : app.show('profiles'));

  // or { name: 'edit', id } / { name: 'confirmDelete', id } / { name: 'confirmSave', text, yes, run }
  let view = { name: 'main' };
  let updateStatus = '';

  const body = h('section', { class: 'screen-body parent-body' });
  root.append(topBar({ left: [iconButton('back', t('back'), leave)], title: t('parentTitle') }), body);

  function go(nextView) {
    view = nextView;
    redraw();
  }

  function redraw() {
    body.replaceChildren(
      view.name === 'edit' ? editView(view.id)
        : view.name === 'confirmDelete' ? confirmView(view.id)
          : view.name === 'confirmSave' ? confirmSaveView(view)
            : mainView(),
    );
  }

  function mainView() {
    const status = h('p', { class: 'status', 'aria-live': 'polite' }, updateStatus);
    const checkButton = h('button', {
      class: 'btn',
      type: 'button',
      onclick: async () => {
        checkButton.disabled = true;
        status.textContent = updateStatus = t('updateChecking');
        const result = await checkNow();
        const key = { ready: 'updateReady', upToDate: 'updateUpToDate', offline: 'updateOffline' }[result] ?? 'updateUnsupported';
        status.textContent = updateStatus = t(key);
        checkButton.disabled = false;
      },
    }, t('checkUpdates'));

    const languages = choiceRow(
      LANGS.map((lang) => ({ value: lang, label: LANG_NAMES[lang] })),
      getLang(),
      (lang) => {
        setSetting('lang', lang);
        setLang(lang);
        app.show('parent', params); // redraw everything, top bar included, in the new language
      },
    );

    const profiles = getProfiles().map((p) => h('li', { class: 'profile-row' },
      h('span', { class: 'row-avatar', 'aria-hidden': 'true' }, p.avatar),
      h('span', { class: 'row-name' }, p.name),
      h('div', { class: 'row-actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'edit', id: p.id }) }, t('edit')),
        h('button', { class: 'btn btn-danger', type: 'button', onclick: () => go({ name: 'confirmDelete', id: p.id }) }, t('delete')),
      ),
    ));

    return h('div', { class: 'parent-sections' },
      h('div', { class: 'card' },
        h('h2', {}, t('profiles')),
        h('ul', { class: 'profile-list' }, profiles),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go({ name: 'edit', id: null }) }, t('addProfile')),
      ),
      h('div', { class: 'card' }, h('h2', {}, t('appLanguage')), languages),
      saveCard(),
      h('div', { class: 'card' },
        h('h2', {}, t('version')),
        h('p', { class: 'version' }, VERSION),
        checkButton,
        status,
      ),
    );
  }

  // Create (id = null) or edit a profile.
  function editView(id) {
    const existing = id ? getProfile(id) : null;
    const draft = {
      name: existing?.name ?? '',
      avatar: existing?.avatar ?? AVATARS[getProfiles().length % AVATARS.length],
      readingLang: existing?.readingLang ?? getLang(),
      unlockAll: existing?.unlockAll ?? false, // games open every level for this player
    };

    const nameInput = h('input', {
      type: 'text', id: 'profile-name', maxlength: '20', autocomplete: 'off', value: draft.name,
      oninput: (e) => { draft.name = e.target.value; saveButton.disabled = !draft.name.trim(); },
    });
    const saveButton = h('button', {
      class: 'btn btn-primary', type: 'button', disabled: !draft.name.trim(),
      onclick: () => {
        const data = { ...draft, name: draft.name.trim() };
        if (existing) updateProfile(id, data);
        else addProfile(data);
        go({ name: 'main' });
      },
    }, t('save'));

    // Re-render only the choice rows when a choice is made (keeps the typed name).
    const avatarSlot = h('div');
    const langSlot = h('div');
    const unlockSlot = h('div');
    const drawChoices = () => {
      avatarSlot.replaceChildren(choiceRow(AVATARS.map((a) => ({ value: a, label: a })), draft.avatar,
        (a) => { draft.avatar = a; drawChoices(); }, 'avatar-choices'));
      langSlot.replaceChildren(choiceRow(LANGS.map((l) => ({ value: l, label: LANG_NAMES[l] })), draft.readingLang,
        (l) => { draft.readingLang = l; drawChoices(); }));
      unlockSlot.replaceChildren(choiceRow([{ value: false, label: t('no') }, { value: true, label: t('yes') }], draft.unlockAll,
        (v) => { draft.unlockAll = v; drawChoices(); }));
    };
    drawChoices();

    return h('div', { class: 'card' },
      h('h2', {}, existing ? t('editProfile') : t('addProfile')),
      h('label', { for: 'profile-name' }, t('name')), nameInput,
      h('p', { class: 'field-label' }, t('avatar')), avatarSlot,
      h('p', { class: 'field-label' }, t('readingLang')), langSlot,
      h('p', { class: 'field-label' }, t('unlockAll')), unlockSlot,
      h('p', { class: 'hint' }, t('unlockAllHint')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'main' }) }, t('cancel')),
        saveButton,
      ),
    );
  }

  // The save: only shown when there is something to do (a backup, or on the preview).
  function saveCard() {
    const backups = listBackups();
    if (!backups.length && !isPreview()) return null;
    // v1, v2…: the saves from before an update; the others: a save kept aside when a
    // restore or a copy replaced it (named by its date).
    const buttons = backups.map(({ label, kind, time }) => {
      const when = time ? new Date(time).toLocaleString(getLang()) : '';
      const name = kind === 'version' ? t('restoreBackup', { label }) : t('restoreKept', { when });
      const text = kind === 'version' ? t('confirmRestore', { label }) : t('confirmRestoreKept', { when });
      return h('button', {
        class: 'btn', type: 'button',
        onclick: () => go({ name: 'confirmSave', text, yes: t('yesRestore'), run: () => restoreBackup(label) }),
      }, name);
    });
    if (isPreview()) {
      buttons.unshift(h('button', {
        class: 'btn', type: 'button',
        onclick: () => go({ name: 'confirmSave', text: t('confirmCopySave'), yes: t('yesCopySave'), run: copyLiveSave }),
      }, t('copySave')));
    }
    return h('div', { class: 'card' }, h('h2', {}, t('saveTitle')), ...buttons);
  }

  // Restore / copy: the whole app reloads afterwards (every screen reads the new save).
  function confirmSaveView({ text, yes, run }) {
    const status = h('p', { class: 'status', 'aria-live': 'polite' });
    return h('div', { class: 'card' },
      h('p', { class: 'confirm-text' }, text),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'main' }) }, t('cancel')),
        h('button', {
          class: 'btn btn-danger btn-solid', type: 'button',
          onclick: () => {
            if (run()) location.reload();
            else status.textContent = t('saveFailed');
          },
        }, yes),
      ),
      status,
    );
  }

  function confirmView(id) {
    const profile = getProfile(id);
    return h('div', { class: 'card' },
      h('p', { class: 'confirm-text' }, t('confirmDelete', { name: profile?.name ?? '' })),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'main' }) }, t('cancel')),
        h('button', {
          class: 'btn btn-danger btn-solid', type: 'button',
          onclick: () => { deleteProfile(id); go({ name: 'main' }); },
        }, t('yesDelete')),
      ),
    );
  }

  redraw();
}
