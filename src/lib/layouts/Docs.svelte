<script lang="ts" context="module">
    import { navigating } from '$app/stores';
    import { writable } from 'svelte/store';

    export type DocsLayoutVariant = 'default' | 'expanded' | 'two-side-navs';
    export type DocsLayoutState = {
        showReferences: boolean;
        showSidenav: boolean;
        showSearch: boolean;
        currentVariant: DocsLayoutVariant | null;
    };
    export const layoutState = writable<DocsLayoutState>({
        showReferences: false,
        showSidenav: false,
        showSearch: false,
        currentVariant: null
    });

    export function toggleReferences() {
        layoutState.update((state) => ({
            ...state,
            showReferences: !state.showReferences,
            showSidenav: false
        }));
    }
    export function toggleSidenav() {
        layoutState.update((state) => {
            return {
                ...state,
                showReferences: false,
                showSidenav: !state.showSidenav
            };
        });
    }

    const CTX_KEY = Symbol('docs');
    const TUT_CTX_KEY = Symbol('tut-docs');
    export const isInDocs = () => getContext<boolean>(CTX_KEY) ?? false;
    export const isInTutorialDocs = () => getContext<boolean>(TUT_CTX_KEY) ?? false;
</script>

<script lang="ts">
    import { Search, IsLoggedIn } from '$lib/components';
    import { isMac } from '$lib/utils/platform';
    import { getContext, setContext } from 'svelte';
    import { SOCIAL_STATS } from '$lib/constants';
    import { page } from '$app/state';
    import { getAppwriteDashboardUrl } from '$lib/utils/dashboard';

    export let variant: DocsLayoutVariant = 'default';
    export let isReferences = false;

    const variantClasses: Record<DocsLayoutVariant, string> = {
        default: 'web-grid-side-nav max-w-[90rem] mx-auto',
        expanded: 'web-grid-huge-navs',
        'two-side-navs': 'web-grid-two-side-navs'
    };

    $: variantClass = variantClasses[variant];
    $: $layoutState.currentVariant = variant;

    navigating.subscribe(() => {
        layoutState.update((n) => ({
            ...n,
            showReferences: false,
            showSidenav: false
        }));
    });

    const key = page.route.id?.includes('tutorials') ? TUT_CTX_KEY : CTX_KEY;
    setContext(key, true);

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && ($layoutState.showReferences || $layoutState.showSidenav)) {
            e.preventDefault();
            layoutState.update((state) => ({
                ...state,
                showReferences: false,
                showSidenav: false
            }));
        }
    };
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="relative">
    <section class="web-mobile-header is-transparent">
        <div class="web-mobile-header-start">
            <a href="/" aria-label="homepage">
                <img
                    class="web-logo web-u-only-dark"
                    src="/images/logos/appwrite.svg"
                    alt="appwrite"
                    height="24"
                    width="130"
                />
                <img
                    class="web-logo web-u-only-light"
                    src="/images/logos/appwrite-light.svg"
                    alt="appwrite"
                    height="24"
                    width="130"
                />
            </a>
        </div>
        <div class="web-mobile-header-end">
            <a href={getAppwriteDashboardUrl()} class="web-button web-is-only-desktop">
                <span class="text-sub-body font-medium">Go to Console</span>
            </a>
            <button
                class="web-button is-text"
                aria-label="open navigation"
                on:click={toggleSidenav}
            >
                {#if $layoutState.showSidenav}
                    <span aria-hidden="true" class="web-icon-close"></span>
                {:else}
                    <span aria-hidden="true" class="web-icon-hamburger-menu"></span>
                {/if}
            </button>
        </div>
    </section>
    <header
        class="web-main-header {isReferences ? 'is-reference' : 'is-docs'}"
        class:is-transparent={variant !== 'expanded'}
    >
        <div class="web-main-header-wrapper">
            <div class="web-main-header-start flex-1">
                <a href="/" aria-label="homepage">
                    <img
                        class="web-logo web-u-only-dark"
                        src="/images/logos/appwrite.svg"
                        alt="appwrite"
                        height="24"
                        width="130"
                    />
                    <img
                        class="web-logo web-u-only-light"
                        src="/images/logos/appwrite-light.svg"
                        alt="appwrite"
                        height="24"
                        width="130"
                    />
                </a>
                <nav class="web-main-header-nav" aria-label="Top">
                    <ul class="web-main-header-nav-list">
                        <li class="web-main-header-nav-item">
                            <a class="web-link" href="/docs">Docs</a>
                        </li>
                    </ul>
                </nav>
                <div class="web-u-margin-inline-start-48 flex flex-1">
                    <button
                        class="web-input-button web-u-flex-basis-400"
                        on:click={() => ($layoutState.showSearch = true)}
                    >
                        <span class="web-icon-search" aria-hidden="true"></span>
                        <span class="text">Search in docs</span>

                        <div class="ml-auto flex gap-1">
                            {#if isMac()}
                                <span class="web-kbd" aria-label="command">⌘</span>
                            {:else}
                                <span class="web-kbd" aria-label="control">Ctrl</span>
                            {/if}
                            <span class="web-kbd">K</span>
                        </div>
                    </button>
                </div>
            </div>
            <div class="web-main-header-end">
                <div class="flex gap-2">
                    <a
                        href={SOCIAL_STATS.GITHUB.LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="web-button is-text"
                    >
                        <span class="web-icon-star" aria-hidden="true"></span>
                        <span class="text">Star on GitHub</span>
                        <span class="web-inline-tag text-sub-body">{SOCIAL_STATS.GITHUB.STAT}</span>
                    </a>
                    <IsLoggedIn />
                </div>
            </div>
        </div>
    </header>
    <div
        class={variantClass}
        class:is-open={$layoutState.showSidenav}
        style:--container-size={variant === 'default' ? 'var(--container-size-large)' : undefined}
    >
        <slot />
    </div>
</div>

<Search bind:open={$layoutState.showSearch} />
