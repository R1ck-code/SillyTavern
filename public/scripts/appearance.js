export const APPEARANCE_STORAGE_KEY = 'st-appearance-mode';
export const APPEARANCE_THEMES = {
    light: '对话 · 浅色',
    dark: '对话 · 深色',
};

const THEME_COLORS = {
    light: '#F4F3EE',
    dark: '#212121',
};

const TOKEN_SETS = {
    dark: {
        '--SmartThemeBodyColor': '#ececec',
        '--SmartThemeEmColor': '#9b9b9b',
        '--SmartThemeQuoteColor': '#d4a85a',
        '--SmartThemeBlurTintColor': '#212121',
        '--SmartThemeChatTintColor': '#212121',
        '--SmartThemeUserMesBlurTintColor': '#303030',
        '--SmartThemeBotMesBlurTintColor': 'transparent',
        '--SmartThemeBorderColor': 'rgba(255, 255, 255, 0.08)',
        '--SmartThemeShadowColor': 'transparent',
        '--SmartThemeUnderlineColor': '#c4d6c9',
        '--blurStrength': '0',
        '--shadowWidth': '0',
        '--mainFontFamily': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "WenQuanYi Micro Hei", "Droid Sans Fallback", "Helvetica Neue", sans-serif',
    },
    light: {
        '--SmartThemeBodyColor': '#1F1E1D',
        '--SmartThemeEmColor': '#1F1E1D',
        /* Accent chrome only. Chat dialogue is forced to #1F1E1D in conversation-theme.css. */
        '--SmartThemeQuoteColor': '#C15F3C',
        '--SmartThemeBlurTintColor': '#F4F3EE',
        '--SmartThemeChatTintColor': '#FFFFFF',
        '--SmartThemeUserMesBlurTintColor': '#FFFFFF',
        '--SmartThemeBotMesBlurTintColor': 'transparent',
        '--SmartThemeBorderColor': '#B1ADA1',
        '--SmartThemeShadowColor': 'transparent',
        '--SmartThemeUnderlineColor': '#C15F3C',
        '--blurStrength': '0',
        '--shadowWidth': '0',
        '--mainFontFamily': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "WenQuanYi Micro Hei", "Droid Sans Fallback", "Helvetica Neue", sans-serif',
    },
};

function applyColorTokens(resolved) {
    const tokens = TOKEN_SETS[resolved];
    if (!tokens) {
        return;
    }
    const root = document.documentElement;
    for (const [key, value] of Object.entries(tokens)) {
        root.style.setProperty(key, value);
    }
}

/**
 * @returns {'light'|'dark'|'system'}
 */
export function getStoredAppearanceMode() {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
        return raw;
    }
    return 'system';
}

/**
 * @param {'light'|'dark'|'system'} [mode]
 * @returns {'light'|'dark'}
 */
export function resolveAppearance(mode = getStoredAppearanceMode()) {
    if (mode === 'light' || mode === 'dark') {
        return mode;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function syncThemeColorMeta(resolved) {
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) {
        meta.setAttribute('content', THEME_COLORS[resolved]);
    }
}

function syncToggleUi(mode, resolved) {
    const icon = document.getElementById('appearance-toggle-icon');
    if (icon) {
        icon.classList.remove('fa-sun', 'fa-moon', 'fa-circle-half-stroke');
        icon.classList.add(mode === 'system' ? 'fa-circle-half-stroke' : (resolved === 'light' ? 'fa-sun' : 'fa-moon'));
    }

    const button = document.getElementById('appearance-toggle-button');
    if (button) {
        const label = mode === 'system' ? '跟随系统' : (resolved === 'light' ? '浅色' : '深色');
        button.setAttribute('aria-label', `外观：${label}`);
        button.title = `外观：${label}（点击切换）`;
    }

    document.querySelectorAll('#appearance-menu [data-appearance]').forEach(el => {
        el.classList.toggle('is-active', el.getAttribute('data-appearance') === mode);
    });

    const select = document.getElementById('appearance_mode_select');
    if (select && select.value !== mode) {
        select.value = mode;
    }
}

let syncingBuiltinTheme = false;

function syncBuiltinTheme(resolved) {
    const name = APPEARANCE_THEMES[resolved];
    const select = document.getElementById('themes');
    if (!select || !select.querySelector(`option[value="${name}"]`)) {
        return;
    }
    if (select.value === name) {
        return;
    }
    syncingBuiltinTheme = true;
    select.value = name;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncingBuiltinTheme = false;
}

/**
 * Apply the ChatGPT/Claude-like appearance.
 * @param {'light'|'dark'|'system'} [mode]
 * @param {{ persist?: boolean, applyBuiltinTheme?: boolean }} [options]
 */
export function applyAppearance(mode = getStoredAppearanceMode(), { persist = true, applyBuiltinTheme = false } = {}) {
    if (persist) {
        localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
    }

    const resolved = resolveAppearance(mode);
    document.documentElement.dataset.appearance = resolved;
    document.documentElement.dataset.appearanceMode = mode;
    document.body?.classList.toggle('st-appearance-light', resolved === 'light');
    document.body?.classList.toggle('st-appearance-dark', resolved === 'dark');
    document.body?.classList.add('noShadows');
    applyColorTokens(resolved);

    syncThemeColorMeta(resolved);
    syncToggleUi(mode, resolved);

    if (applyBuiltinTheme) {
        syncBuiltinTheme(resolved);
        // applyTheme writes inline colors; put appearance tokens back on top.
        applyColorTokens(resolved);
    }

    // Color pickers emit `change` after load/theme swap; re-assert once they settle.
    reassertTokensSoon(resolved);
}

function reassertTokensSoon(resolved) {
    const run = () => {
        const current = document.documentElement.dataset.appearance;
        if (current === 'light' || current === 'dark') {
            applyColorTokens(current);
            return;
        }
        if (resolved === 'light' || resolved === 'dark') {
            applyColorTokens(resolved);
        }
    };
    clearTimeout(applyAppearance._tokenTimer);
    applyAppearance._tokenTimer = setTimeout(run, 0);
    clearTimeout(applyAppearance._tokenTimerLate);
    applyAppearance._tokenTimerLate = setTimeout(run, 50);
}

/**
 * One tap always flips the color the user is looking at.
 * system→light is a no-op when the OS is already light, so do not cycle through system here.
 * @param {'light'|'dark'} resolved
 * @returns {'light'|'dark'}
 */
export function toggledAppearance(resolved) {
    return resolved === 'light' ? 'dark' : 'light';
}

function cycleAppearance() {
    const next = toggledAppearance(resolveAppearance(getStoredAppearanceMode()));
    applyAppearance(next, { persist: true, applyBuiltinTheme: true });
}

function setMenuOpen(open) {
    const menu = document.getElementById('appearance-menu');
    const button = document.getElementById('appearance-toggle-button');
    if (!menu || !button) {
        return;
    }
    menu.classList.toggle('hidden', !open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
}

export function initAppearance() {
    applyAppearance(getStoredAppearanceMode(), { persist: false, applyBuiltinTheme: false });

    const button = document.getElementById('appearance-toggle-button');
    const menu = document.getElementById('appearance-menu');
    if (button && menu) {
        let longPressTimer = 0;
        let longPressAt = 0;
        let ignoreNextClick = false;
        const cancelLongPress = () => window.clearTimeout(longPressTimer);
        button.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'mouse') {
                return;
            }
            ignoreNextClick = false;
            cancelLongPress();
            longPressTimer = window.setTimeout(() => {
                longPressAt = Date.now();
                ignoreNextClick = true;
                setMenuOpen(true);
            }, 500);
        });
        button.addEventListener('pointerup', cancelLongPress);
        button.addEventListener('pointercancel', cancelLongPress);
        button.addEventListener('pointerleave', cancelLongPress);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (ignoreNextClick) {
                ignoreNextClick = false;
                return;
            }
            if (event.shiftKey || event.altKey) {
                setMenuOpen(menu.classList.contains('hidden'));
                return;
            }
            cycleAppearance();
        });
        button.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            // A touch long-press also fires contextmenu; don't toggle the menu shut.
            if (Date.now() - longPressAt < 800) {
                setMenuOpen(true);
                return;
            }
            setMenuOpen(menu.classList.contains('hidden'));
        });
        menu.querySelectorAll('[data-appearance]').forEach(el => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                applyAppearance(el.getAttribute('data-appearance'), { persist: true, applyBuiltinTheme: true });
                setMenuOpen(false);
            });
        });
        document.addEventListener('click', (event) => {
            if (!menu.classList.contains('hidden') && !menu.contains(event.target) && !button.contains(event.target)) {
                setMenuOpen(false);
            }
        });
    }

    const select = document.getElementById('appearance_mode_select');
    if (select) {
        select.value = getStoredAppearanceMode();
        select.addEventListener('change', () => {
            applyAppearance(String(select.value), { persist: true, applyBuiltinTheme: true });
        });
    }

    $('#themes').on('change.appearance', function () {
        if (syncingBuiltinTheme) {
            // This change came from syncBuiltinTheme, not from the user picking a theme.
            reassertTokensSoon(resolveAppearance());
            return;
        }
        const selected = String($(this).val());
        if (selected === APPEARANCE_THEMES.light) {
            applyAppearance('light', { persist: true, applyBuiltinTheme: false });
        } else if (selected === APPEARANCE_THEMES.dark) {
            applyAppearance('dark', { persist: true, applyBuiltinTheme: false });
        } else {
            // Third-party UI themes still get appearance tokens so text cannot vanish.
            applyAppearance(getStoredAppearanceMode(), { persist: false, applyBuiltinTheme: false });
        }
    });

    // Theme color pickers write inline SmartTheme vars after applyTheme. Put tokens back.
    for (const id of [
        'main-text-color-picker',
        'italics-color-picker',
        'underline-color-picker',
        'quote-color-picker',
        'blur-tint-color-picker',
        'chat-tint-color-picker',
        'user-mes-blur-tint-color-picker',
        'bot-mes-blur-tint-color-picker',
        'shadow-color-picker',
        'border-color-picker',
    ]) {
        document.getElementById(id)?.addEventListener('change', () => {
            reassertTokensSoon(resolveAppearance());
        });
    }

    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = () => {
        if (getStoredAppearanceMode() === 'system') {
            applyAppearance('system', { persist: false, applyBuiltinTheme: true });
        }
    };
    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onSystemChange);
    } else if (typeof media.addListener === 'function') {
        media.addListener(onSystemChange);
    }
}
