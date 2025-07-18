import type { Handle, RequestEvent } from '@sveltejs/kit';
import redirects from './redirects.json';
import { sequence } from '@sveltejs/kit/hooks';
import { BANNER_KEY } from '$lib/constants';
import { dev } from '$app/environment';
import { type GithubUser } from '$routes/(init)/init/(utils)/auth';
import {
    createInitServerClient,
    createInitSessionClient
} from '$routes/(init)/init/(utils)/appwrite';
import type { AppwriteUser } from '$lib/utils/console';

const redirectMap = new Map(redirects.map(({ link, redirect }) => [link, redirect]));

const redirecter: Handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;
    if (redirectMap.has(currentPath)) {
        return new Response(null, {
            status: 308,
            headers: {
                location: redirectMap.get(currentPath) ?? ''
            }
        });
    }

    return await resolve(event);
};

const securityheaders: Handle = async ({ event, resolve }) => {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    event.locals.nonce = nonce;

    const response = await resolve(event, {
        transformPageChunk: ({ html }) => {
            return html.replace(/%sveltekit.nonce%/g, nonce);
        }
    });

    // `true` if deployed via Coolify.
    const isPreview = !!process.env.COOLIFY_FQDN || process.env.NODE_ENV === 'development';
    // COOLIFY_FQDN already includes `http`.
    const previewDomain = isPreview ? `${process.env.COOLIFY_FQDN}` : null;
    const join = (arr: string[]) => arr.join(' ');

    const cspDirectives: Record<string, string> = {
        'default-src': "'self'",
        'script-src': join([
            "'self'",
            'blob:',
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://*.posthog.com',
            'https://*.plausible.io',
            'https://*.reo.dev',
            'https://plausible.io',
            'https://js.zi-scripts.com',
            'https://ws.zoominfo.com',
            'https://*.cookieyes.com',
            'https://cdn-cookieyes.com'
        ]),
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
        'font-src': "'self'",
        'object-src': "'none'",
        'base-uri': "'self'",
        'form-action': "'self'",
        'frame-ancestors': join(["'self'", 'https://www.youtube.com', 'https://*.vimeo.com']),
        'block-all-mixed-content': '',
        'upgrade-insecure-requests': '',
        'connect-src': join([
            "'self'",
            'https://*.appwrite.io',
            'https://*.appwrite.org',
            'https://*.posthog.com',
            'https://*.sentry.io',
            'https://*.plausible.io',
            'https://plausible.io',
            'https://*.reo.dev',
            'https://js.zi-scripts.com',
            'https://aorta.clickagy.com',
            'https://hemsync.clickagy.com',
            'https://ws.zoominfo.com ',
            'https://*.cookieyes.com',
            'https://cdn-cookieyes.com'
        ]),
        'frame-src': join([
            "'self'",
            'https://www.youtube.com',
            'https://status.appwrite.online',
            'https://www.youtube-nocookie.com',
            'https://player.vimeo.com',
            'https://hemsync.clickagy.com',
            'https://cdn-cookieyes.com'
        ])
    };

    if (isPreview) {
        delete cspDirectives['block-all-mixed-content'];
        delete cspDirectives['upgrade-insecure-requests'];
        ['default-src', 'script-src', 'style-src', 'img-src', 'font-src', 'connect-src'].forEach(
            (key) => {
                cspDirectives[key] += ` ${previewDomain}`;
            }
        );
    }

    const cspDirectivesString = Object.entries(cspDirectives)
        .map(([key, value]) => `${key} ${value}`.trim())
        .join('; ');

    // Set security headers
    response.headers.set('Content-Security-Policy', cspDirectivesString);

    // HTTP Strict Transport Security
    // max-age is set to 1 year in seconds
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
};

const initSession: Handle = async ({ event, resolve }) => {
    const session = await createInitSessionClient(event.cookies);

    const getGithubUser = async () => {
        try {
            const identitiesList = await session?.account.listIdentities();

            if (!identitiesList?.total) return null;
            const identity = identitiesList.identities[0];
            const { providerAccessToken, provider, providerEmail } = identity;
            if (provider !== 'github') return null;

            const res = await fetch('https://api.github.com/user', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${providerAccessToken}`
                }
            })
                .then((res) => {
                    return res.json() as Promise<GithubUser>;
                })
                .then((user) => ({
                    login: user.login,
                    name: user.name,
                    email: providerEmail,
                    avatar_url: user.avatar_url
                }));

            if (!res.login) {
                await session?.account.deleteSession('current');
                return null;
            }

            return res;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const getAppwriteUser = async (): Promise<AppwriteUser | null> => {
        const appwriteUser = await session?.account
            .get()
            .then((res) => res)
            .catch((e) => null);

        return appwriteUser || null;
    };

    const getInitUser = async () => {
        const [github, appwrite] = await Promise.all([getGithubUser(), getAppwriteUser()]);

        return { github, appwrite };
    };

    event.locals.initUser = await getInitUser();

    const response = await resolve(event);

    return response;
};

export const handle = sequence(redirecter, securityheaders, initSession);
