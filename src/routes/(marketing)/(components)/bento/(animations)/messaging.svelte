<script lang="ts">
    import { isMobile } from '$lib/utils/is-mobile';
    import { format } from 'date-fns';
    import { animate, hover, inView, type AnimationSequence } from 'motion';
    import { onMount } from 'svelte';
    import Email from '../../../(assets)/icons/email.svg';
    import Calendar from '../../../(assets)/icons/calendar.svg';
    import Messages from '../../../(assets)/icons/messages.svg';
    import Settings from '../../../(assets)/icons/settings.svg';
    import GridPaper from '../../grid-paper.svelte';
    import { trackEvent } from '$lib/actions/analytics';

    let container: HTMLElement;

    let device: HTMLElement;
    let notification: HTMLElement;

    onMount(() => {
        const from: AnimationSequence = [
            [notification, { opacity: 0, y: -30, filter: 'blur(4px)' }, { duration: 0.2 }],
            [device, { y: 15 }, { duration: 0.25 }]
        ];

        const to: AnimationSequence = [
            [device, { y: 0 }, { duration: 0.25 }],
            [notification, { opacity: 1, y: 0, filter: 'blur(0px)' }, { duration: 0.2, at: 0.15 }]
        ];

        inView(
            container,
            () => {
                if (!isMobile()) return;
                animate(to);

                return () => {
                    animate(from);
                };
            },
            { amount: 'all' }
        );

        hover(container, () => {
            if (isMobile()) return;
            animate(to);

            return () => {
                animate(from);
            };
        });
    });
</script>

<a
    href="/products/messaging"
    class="border-smooth group col-span-12 flex flex-col rounded-2xl border bg-white/2 p-2 transition-shadow duration-300 hover:shadow-[0px_0px_0px_4px_var(--color-offset)] focus:shadow-[0px_0px_0px_4px_var(--color-offset)] md:col-span-6 lg:col-span-4"
    onclick={() => {
        trackEvent(`bento-messaging-click`);
    }}
    bind:this={container}
>
    <div class="space-y-3 px-3 pt-2 pb-4">
        <div class="flex items-center gap-2">
            <img
                loading="lazy"
                src="/images/icons/illustrated/dark/messaging.png"
                alt="Messaging icon"
                class="size-7"
            />
            <h3 class="font-aeonik-pro text-label text-primary">Messaging</h3>
        </div>
        <p class="text-sub-body text-primary max-w-lg font-medium">
            Set up a full-functioning messaging service that covers <span class="text-secondary"
                >multiple channels under one unified platform.</span
            >
        </p>
    </div>
    <div
        class="relative mt-auto mb-0 flex h-85 items-center justify-center overflow-clip rounded-xl bg-black/24 px-8"
    >
        <div
            class="light absolute top-14 z-10 flex h-[65px] w-[85%] items-center justify-between gap-4 rounded-[20px] bg-white/80 px-3 py-2 shadow-[-8px_4px_32px_rgba(0,0,0,0.24)] backdrop-blur-xl"
            style="transform: translateY(-15px); opacity: 0; filter: blur(4px);"
            bind:this={notification}
            data-theme-ignore
        >
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black">
                <div class="size-3 rounded-full bg-white"></div>
            </div>
            <div class="max-lg:text-micro text-x-micro flex flex-col">
                <h2 class="text-primary flex justify-between font-medium">
                    New security measures added <span class="text-secondary/50 mr-1 block">now</span
                    >
                </h2>
                <p class="text-secondary leading-tight">
                    Check out our latest security updates to protect your account!
                </p>
            </div>
        </div>
        <div
            class="light mt-20 flex h-full w-[300px] flex-col rounded-t-[42px] border-x border-t border-white/12 bg-white/8 mask-b-from-60% mask-b-to-100% backdrop-blur-2xl"
            style:transform="translateY(15px)"
            bind:this={device}
            data-theme-ignore
        >
            <div class="m-2 flex-1 rounded-t-[34px] bg-[#19191C]">
                <div class="flex items-center justify-between px-8 pt-4">
                    <span class="text-x-micro w-10 font-semibold text-white"
                        >{format(new Date(), 'h:mm')}</span
                    >
                    <div class="h-5 w-[84px] rounded-full bg-black"></div>
                    <div class="h-3 w-7 rounded-full bg-black"></div>
                </div>
                <div
                    class="text-micro mt-6 grid flex-1 grid-cols-4 grid-rows-24 place-items-center gap-3 p-6"
                >
                    <div
                        class="relative flex aspect-square size-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/3 shadow-sm shadow-black/5"
                    >
                        <div
                            class="bg-accent text-micro absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full"
                        ></div>

                        <img loading="lazy" src={Email} alt="" class="size-6" />
                    </div>
                    {#each [Messages, Settings, Calendar] as icon}
                        <div
                            class="flex aspect-square size-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/3 shadow-sm shadow-black/5"
                        >
                            <img loading="lazy" src={icon} alt="" class="size-6" />
                        </div>
                    {/each}

                    {#each Array.from({ length: 12 }) as _, index}
                        <div
                            class="aspect-square size-full shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/3 shadow-sm shadow-black/5"
                        ></div>
                    {/each}
                </div>
            </div>
        </div>
        <GridPaper class="absolute inset-0 -z-10 bg-size-[calc(100%/13)]" />
    </div>
</a>
