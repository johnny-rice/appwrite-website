<script lang="ts">
    import { FooterNav, MainFooter, PreFooter } from '$lib/components';
    import OpenSourceAlternative from '$lib/components/marketing/open-source-alternative.svelte';
    import Testimonials from '$lib/components/marketing/testimonials.svelte';
    import ProductCards from '$lib/components/product-pages/product-cards.svelte';
    import Main from '$lib/layouts/Main.svelte';
    import { DEFAULT_HOST } from '$lib/utils/metadata';
    import { TITLE_SUFFIX } from '$routes/titles';
    import Create from './(components)/create.svelte';
    import Deploy from './(components)/deploy.svelte';
    import Faq from './(components)/faq.svelte';
    import Features from './(components)/features.svelte';
    import Hero from './(components)/hero.svelte';
    import Integrate from './(components)/integrate.svelte';
    import Steps from './(components)/steps.svelte';
    import Network from './(components)/network.svelte';
    import Scale from '$routes/(marketing)/(components)/scale.svelte';

    const title = 'Sites' + TITLE_SUFFIX;
    const description =
        'Appwrite Sites, the open-source Vercel alternative. Develop, deploy, and scale your web applications directly from Appwrite, alongside your backend.';
    const ogImage = DEFAULT_HOST + '/images/open-graph/website.png';
</script>

<svelte:head>
    <!-- Titles -->
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
    <!-- Description -->
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
    <!-- Image -->
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Main>
    <Hero />
    <div class="px-4 md:px-16">
        <Steps>
            <Create />
            <Deploy />
            <Integrate />
        </Steps>
        <Features />
    </div>
    <div class="light -mb-4 bg-[#EDEDF0] pb-8">
        <Network />
        <OpenSourceAlternative platforms={['Vercel', 'Netlify', 'Sevalla']} />
        <Testimonials class="mb-20" />
        <Scale
            testimonial={{
                name: 'Ryan O’Conner',
                title: 'Founder',
                company: 'K-Collect',
                image: '/images/testimonials/ryan-oconner-testimonial.png'
            }}
            theme="light"
            stats={[
                {
                    number: 50,
                    suffix: 'K+',
                    description: 'GitHub stars'
                },
                {
                    number: 300,
                    suffix: '+',
                    description: 'PoP locations'
                },
                {
                    number: 200,
                    suffix: 'K+',
                    description: 'developers'
                },
                {
                    number: 200,
                    suffix: 'B+',
                    description: 'monthly database operations'
                }
            ]}
        >
            The switch to using Appwrite brought
            <span class="text-primary">infinite value that I'm still discovering today.</span>
        </Scale>
    </div>

    <Faq />
    <ProductCards />

    <div class="relative -mt-6 max-w-screen overflow-hidden pt-20">
        <div class="container">
            <PreFooter />
            <FooterNav />
            <MainFooter />
        </div>
    </div>
</Main>
