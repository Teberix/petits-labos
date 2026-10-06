// Parent area (behind the 3-second gate): version + updates, app language, profiles
// (edit, delete, start one again from zero), the save (restore a backup; start every
// profile again; on the preview: copy the live app's save in). A reset keeps the whole
// save aside first (js/storage.js resetProgress), restorable from the Save card.
import { h } from '../dom.js';
import { LANGS, LANG_NAMES, getLang, setLang, t } from '../i18n.js';
import { stopSpeaking } from '../audio.js';
import {
  addProfile, copyLiveSave, deleteProfile, getProfile, getProfiles, isPreview, listBackups, resetProgress,
  resetSkill, restoreBackup, setSetting, updateProfile,
} from '../storage.js';
import { GAMES } from '../../games/registry.js';
import { checkNow } from '../updates.js';
import { VERSION } from '../version.js';
import { iconButton, topBar } from '../ui.js';

// A kept save's date with the month as a word (no day/month mix-up), in the app's
// language: fr "5 oct. 2026, 14:10", es "5 oct 2026, 14:10", en "5 Oct 2026, 14:10".
// Date and time are formatted apart and joined with ", " (some browsers put "à"/"at").
const LOCALES = { fr: 'fr-FR', es: 'es-ES', en: 'en-GB' };
function formatWhen(time) {
  const d = new Date(time);
  const locale = LOCALES[getLang()] ?? 'fr-FR';
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  const clock = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  // No-break spaces: the line may wrap before the date, never inside it.
  return `${day}, ${clock}`.replace(/\s/g, ' ');
}

// What a backup is, in words a parent understands (never a schema number). Version
// backups (made by an update) have no date; with more than one, their version is shown.
function backupName({ kind, label, time }, versionCount) {
  if (kind === 'version') return versionCount > 1 ? t('keptUpdateN', { n: label.slice(1) }) : t('keptUpdate');
  const key = { reset: 'keptReset', restore: 'keptRestore', copy: 'keptCopy' }[kind];
  return t(key, { when: formatWhen(time) });
}

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

  // or { name: 'edit', id } / { name: 'confirmDelete', id } / { name: 'confirmReset', id | null }
  //    / { name: 'confirmSave', text, yes, run } / { name: 'confirmSkill', id, gameId }
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
          : view.name === 'confirmReset' ? confirmResetView(view.id)
            : view.name === 'confirmSave' ? confirmSaveView(view)
              : view.name === 'confirmSkill' ? confirmSkillView(view)
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
      fixedMap: existing?.fixedMap ?? false, // path games show their fixed level map instead
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
    const mapSlot = h('div');
    const drawChoices = () => {
      avatarSlot.replaceChildren(choiceRow(AVATARS.map((a) => ({ value: a, label: a })), draft.avatar,
        (a) => { draft.avatar = a; drawChoices(); }, 'avatar-choices'));
      langSlot.replaceChildren(choiceRow(LANGS.map((l) => ({ value: l, label: LANG_NAMES[l] })), draft.readingLang,
        (l) => { draft.readingLang = l; drawChoices(); }));
      unlockSlot.replaceChildren(choiceRow([{ value: false, label: t('no') }, { value: true, label: t('yes') }], draft.unlockAll,
        (v) => { draft.unlockAll = v; drawChoices(); }));
      mapSlot.replaceChildren(choiceRow([{ value: false, label: t('no') }, { value: true, label: t('yes') }], draft.fixedMap,
        (v) => { draft.fixedMap = v; drawChoices(); }));
    };
    drawChoices();

    return h('div', { class: 'card' },
      h('h2', {}, existing ? t('editProfile') : t('addProfile')),
      h('label', { for: 'profile-name' }, t('name')), nameInput,
      h('p', { class: 'field-label' }, t('avatar')), avatarSlot,
      h('p', { class: 'field-label' }, t('readingLang')), langSlot,
      h('p', { class: 'field-label' }, t('unlockAll')), unlockSlot,
      h('p', { class: 'hint' }, t('unlockAllHint')),
      h('p', { class: 'field-label' }, t('fixedMap')), mapSlot,
      h('p', { class: 'hint' }, t('fixedMapHint')),
      // reset difficulty: one button per game on the path (new engine)
      existing && GAMES.filter((g) => g.path).map((g) => h('button', {
        class: 'btn reset-skill-btn', type: 'button', onclick: () => go({ name: 'confirmSkill', id, gameId: g.id }),
      }, t('resetSkill', { game: t(g.titleKey) }))),
      h('div', { class: 'actions' },
        existing && h('button', {
          class: 'btn btn-danger reset-btn', type: 'button', onclick: () => go({ name: 'confirmReset', id }),
        }, t('resetProfile')),
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'main' }) }, t('cancel')),
        saveButton,
      ),
    );
  }

  // The save: one list of the copies the app kept (newest first; the update backups,
  // which have no date, last), then the copy (preview) and "start everything again".
  function saveCard() {
    const all = listBackups();
    const versions = all.filter((b) => b.kind === 'version').reverse();
    const kept = all.filter((b) => b.kind !== 'version'); // already newest first
    const copies = [...kept, ...versions].map((b) => {
      const name = backupName(b, versions.length);
      return h('li', {}, h('button', {
        class: 'btn backup-btn', type: 'button',
        onclick: () => go({ name: 'confirmSave', text: t('confirmRestoreCopy'), item: name, note: t('confirmRestoreNote'), yes: t('yesRestore'), run: () => restoreBackup(b.label) }),
      }, name));
    });
    const actions = [];
    if (isPreview()) {
      actions.push(h('button', {
        class: 'btn', type: 'button',
        onclick: () => go({ name: 'confirmSave', text: t('confirmCopySave'), yes: t('yesCopySave'), run: copyLiveSave }),
      }, t('copySave')));
    }
    if (getProfiles().length) {
      actions.push(h('button', {
        class: 'btn btn-danger reset-all-btn', type: 'button', onclick: () => go({ name: 'confirmReset', id: null }),
      }, t('resetAll')));
    }
    if (!copies.length && !actions.length) return null;
    return h('div', { class: 'card' }, h('h2', {}, t('saveTitle')),
      copies.length ? [h('p', { class: 'hint' }, t('saveIntro')), h('ul', { class: 'backup-list' }, copies)] : null,
      ...actions);
  }

  // Restore / copy: the whole app reloads afterwards (every screen reads the new save).
  function confirmSaveView({ text, item, note, yes, run }) {
    const status = h('p', { class: 'status', 'aria-live': 'polite' });
    return h('div', { class: 'card' },
      h('p', { class: 'confirm-text' }, text),
      item && h('p', { class: 'confirm-item' }, item),
      note && h('p', { class: 'hint' }, note),
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

  // Start one profile (id) or every profile (null) again from zero.
  function confirmResetView(id) {
    const profile = id ? getProfile(id) : null;
    const status = h('p', { class: 'status', 'aria-live': 'polite' });
    return h('div', { class: 'card' },
      h('p', { class: 'confirm-text' }, id ? t('confirmResetProfile', { name: profile?.name ?? '' }) : t('confirmResetAll')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => go({ name: 'main' }) }, t('cancel')),
        h('button', {
          class: 'btn btn-danger btn-solid confirm-reset-btn', type: 'button',
          onclick: () => {
            if (resetProgress(id)) go({ name: 'main' });
            else status.textContent = t('saveFailed');
          },
        }, t('yesReset')),
      ),
      status,
    );
  }

  // Difficulty of one path game back to step 1 for one profile, and its level map
  // starts over (the stones stay).
  function confirmSkillView({ id, gameId }) {
    const game = GAMES.find((g) => g.id === gameId);
    const back = () => go({ name: 'edit', id });
    return h('div', { class: 'card' },
      h('p', { class: 'confirm-text' }, t('confirmResetSkill', { game: game ? t(game.titleKey) : '', name: getProfile(id)?.name ?? '' })),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: back }, t('cancel')),
        h('button', {
          class: 'btn btn-danger btn-solid confirm-skill-btn', type: 'button',
          onclick: () => { resetSkill(id, gameId); back(); },
        }, t('yesResetSkill')),
      ),
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
