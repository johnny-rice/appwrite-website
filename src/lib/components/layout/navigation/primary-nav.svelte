<script lang="ts">
    import { NavigationMenu } from 'bits-ui';

    import { classNames } from '$lib/utils/classnames';
    import type { Component, SvelteComponent } from 'svelte';
    import ProductMenu from './menus/product-menu.svelte';
    import { Icon } from '$lib/components/ui';

    type NavItem =
        | ({ label: string; href: string } & { menu?: never })
        | {
              label: string;
              menu: Component;
              href?: never;
          };

    export const navItems: Array<NavItem> = [
        { label: 'Products', menu: ProductMenu },
        {
            label: 'Docs',
            menu: ProductMenu
        },
        {
            label: 'Pricing',
            href: '/pricing'
        },
        {
            label: 'Enterprise',
            href: '/enterprise'
        }
    ];
    type Props = NavigationMenu.RootProps;

    const { class: className, ...rest }: Props = $props();
</script>

<NavigationMenu.Root class={className} {...rest}>
    <NavigationMenu.List class="flex items-center gap-8">
        {#each navItems as item}
            <NavigationMenu.Item class="hover:text-accent transition-colors">
                {#if item.menu}
                    {@const Submenu = item.menu}
                    <NavigationMenu.Trigger class="group flex items-center gap-3"
                        >{item.label}
                        <Icon
                            name="chevron-down"
                            class="relative size-4 transition-transform duration-200 group-data-[state=open]:-rotate-180"
                            aria-hidden="true"
                        /></NavigationMenu.Trigger
                    >
                    <Submenu />
                {:else}
                    <NavigationMenu.Link href={item.href}>{item.label}</NavigationMenu.Link>
                {/if}
            </NavigationMenu.Item>
        {/each}
    </NavigationMenu.List>
    <div class="absolute top-full left-0 flex w-full justify-center perspective-[2000px]">
        <NavigationMenu.Viewport
            class={classNames(
                'bg-greyscale-850 border-smooth relative w-full origin-[top_center] overflow-hidden rounded-b-md border-x border-b opacity-100 shadow-lg backdrop-blur-2xl transition-[width,_height] duration-200 before:rounded-md after:rounded-md',
                'data-[state=open]:animate-scale-in data-[state=closed]:hidden',
                'h-(--bits-navigation-menu-viewport-height) sm:w-(--bits-navigation-menu-viewport-width)'
            )}
        />
    </div>
</NavigationMenu.Root>
