<!-- @migration-task Error while migrating Svelte code: Cannot use `export let` in runes mode — use `$props()` instead
https://svelte.dev/e/legacy_export_invalid -->
<!-- @migration-task Error while migrating Svelte code: Cannot use `export let` in runes mode — use `$props()` instead
https://svelte.dev/e/legacy_export_invalid -->
<script lang="ts">
    import { Select, Tooltip } from '$lib/components';
    import { getCodeHtml, type Language } from '$lib/utils/code';
    import { copy } from '$lib/utils/copy';
    import { platformMap } from '$lib/utils/references';
    import { writable } from 'svelte/store';

    export let selected: Language = 'js';
    export let data: { language: string; content: string; platform?: string }[] = [];
    export let width: number | null = null;
    export let height: number | null = null;

    $: snippets = writable(new Set(data.map((d) => d.language)));

    $: content = data.find((d) => d.language === selected)?.content ?? '';

    $: platform = data.find((d) => d.language === selected)?.platform ?? '';

    snippets?.subscribe((n) => {
        if (selected === null && n.size > 0) {
            selected = Array.from(n)[0] as Language;
        }
    });

    const CopyStatus = {
        Copy: 'Copy',
        Copied: 'Copied!'
    } as const;
    type CopyStatusType = keyof typeof CopyStatus;
    type CopyStatusValue = (typeof CopyStatus)[CopyStatusType];

    let copyText: CopyStatusValue = CopyStatus.Copy;

    async function handleCopy() {
        await copy(content);

        copyText = CopyStatus.Copied;
        setTimeout(() => {
            copyText = CopyStatus.Copy;
        }, 1000);
    }

    $: result = getCodeHtml({
        content,
        language: selected ?? 'sh',
        withLineNumbers: true
    });
    $: options = Array.from($snippets).map((language) => ({
        value: language,
        label: platformMap[language]
    }));
</script>

<section
    class="dark web-code-snippet mx-auto lg:!max-w-[90vw]"
    aria-label="code-snippet panel"
    style={`width: ${width ? width / 16 + 'rem' : 'inherit'}; height: ${
        height ? height / 16 + 'rem' : 'inherit'
    }`}
>
    <header class="web-code-snippet-header">
        <div class="web-code-snippet-header-start">
            <div class="flex gap-4">
                {#if platform}
                    <div class="web-tag"><span class="text">{platform}</span></div>
                {/if}
            </div>
        </div>
        <div class="web-code-snippet-header-end">
            <ul class="buttons-list flex gap-3">
                {#if $snippets.entries.length}
                    <li class="buttons-list-item flex self-center">
                        <Select bind:value={selected} bind:options />
                    </li>
                {/if}
                <li class="buttons-list-item" style="padding-inline-start: 13px">
                    <Tooltip>
                        <button
                            on:click={handleCopy}
                            class="web-icon-button"
                            aria-label="copy code from code-snippet"
                            ><span class="web-icon-copy" aria-hidden="true"></span></button
                        >
                        {#snippet tooltip()}
                            <span>
                                {copyText}
                            </span>
                        {/snippet}
                    </Tooltip>
                </li>
            </ul>
        </div>
    </header>
    <div
        class="web-code-snippet-content overflow-auto"
        style={`height: ${height ? height / 16 + 'rem' : 'inherit'}`}
    >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html result}
    </div>
</section>

<style>
    /* system breaks the corners */
    .overflow-auto::-webkit-scrollbar {
        display: none;
    }
</style>
