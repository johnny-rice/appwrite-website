<script lang="ts">
    import { Select, Tooltip } from '$lib/components';
    import { getCodeHtml, type Language } from '$lib/utils/code';
    import { copy } from '$lib/utils/copy';
    import { platformMap } from '$lib/utils/references';
    import { writable } from 'svelte/store';

    interface Props {
        selected?: Language;
        data?: { language: string; content: string; platform?: string }[];
        width?: number | null;
        height?: number | null;
    }

    let { selected = $bindable('js'), data = [], width = null, height = null }: Props = $props();

    let snippets = $derived(writable(new Set(data.map((d) => d.language))));
    const getSnippets = () => {
        return snippets;
    };

    let content = $derived(data.find((d) => d.language === selected)?.content ?? '');

    let platform = $derived(data.find((d) => d.language === selected)?.platform ?? '');

    getSnippets().subscribe((n) => {
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

    let copyText = $state<CopyStatusValue>(CopyStatus.Copy);

    async function handleCopy() {
        await copy(content);

        copyText = CopyStatus.Copied;
        setTimeout(() => {
            copyText = CopyStatus.Copy;
        }, 1000);
    }

    let result = $derived(
        getCodeHtml({
            content,
            language: selected ?? 'sh',
            withLineNumbers: true
        })
    );
    let options = $derived(
        Array.from($snippets).map((language) => ({
            value: language,
            label: platformMap[language]
        }))
    );
</script>

<section
    class="dark web-code-snippet mx-auto w-full lg:!max-w-[90vw]"
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
                            onclick={handleCopy}
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
