// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function checkRateLimits(rest, url) {
    const ratelimited = rest.ratelimitedPaths.get(url);
    const global = rest.ratelimitedPaths.get("global");
    const now = Date.now();
    if (ratelimited && now < ratelimited.resetTimestamp) {
        return ratelimited.resetTimestamp - now;
    }
    if (global && now < global.resetTimestamp) {
        return global.resetTimestamp - now;
    }
    return false;
}
function cleanupQueues(rest) {
    for (const [key, queue1] of rest.pathQueues){
        rest.debug(`[REST - cleanupQueues] Running for of loop. ${key}`);
        if (queue1.requests.length) continue;
        rest.pathQueues.delete(key);
    }
    if (!rest.pathQueues.size) rest.processingQueue = false;
}
const BASE_URL = "https://discord.com/api";
const DISCORDENO_VERSION = "13.0.0-rc17";
const USER_AGENT = `DiscordBot (https://github.com/discordeno/discordeno, v${DISCORDENO_VERSION})`;
const IMAGE_BASE_URL = "https://cdn.discordapp.com";
const baseEndpoints = {
    BASE_URL: `${BASE_URL}/v${9}`,
    CDN_URL: IMAGE_BASE_URL
};
const GUILDS_BASE = (guildId)=>`${baseEndpoints.BASE_URL}/guilds/${guildId}`
;
const CHANNEL_BASE = (channelId)=>`${baseEndpoints.BASE_URL}/channels/${channelId}`
;
const endpoints = {
    GUILDS_BASE,
    CHANNEL_BASE,
    GATEWAY_BOT: `${baseEndpoints.BASE_URL}/gateway/bot`,
    CHANNEL_MESSAGE: (channelId, messageId)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}`
    ,
    CHANNEL_MESSAGES: (channelId)=>`${CHANNEL_BASE(channelId)}/messages`
    ,
    CHANNEL_PIN: (channelId, messageId)=>`${CHANNEL_BASE(channelId)}/pins/${messageId}`
    ,
    CHANNEL_PINS: (channelId)=>`${CHANNEL_BASE(channelId)}/pins`
    ,
    CHANNEL_BULK_DELETE: (channelId)=>`${CHANNEL_BASE(channelId)}/messages/bulk-delete`
    ,
    CHANNEL_INVITES: (channelId)=>`${CHANNEL_BASE(channelId)}/invites`
    ,
    CHANNEL_WEBHOOKS: (channelId)=>`${CHANNEL_BASE(channelId)}/webhooks`
    ,
    CHANNEL_MESSAGE_REACTION_ME: (channelId, messageId, emoji)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}/reactions/${emoji}/@me`
    ,
    CHANNEL_MESSAGE_REACTION_USER: (channelId, messageId, emoji, userId)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}/reactions/${emoji}/${userId}`
    ,
    CHANNEL_MESSAGE_REACTIONS: (channelId, messageId)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}/reactions`
    ,
    CHANNEL_MESSAGE_REACTION: (channelId, messageId, emoji)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}/reactions/${emoji}`
    ,
    CHANNEL_FOLLOW: (channelId)=>`${CHANNEL_BASE(channelId)}/followers`
    ,
    CHANNEL_MESSAGE_CROSSPOST: (channelId, messageId)=>`${CHANNEL_BASE(channelId)}/messages/${messageId}/crosspost`
    ,
    CHANNEL_OVERWRITE: (channelId, overwriteId)=>`${CHANNEL_BASE(channelId)}/permissions/${overwriteId}`
    ,
    CHANNEL_TYPING: (channelId)=>`${CHANNEL_BASE(channelId)}/typing`
    ,
    THREAD_START_PUBLIC: (channelId, messageId)=>`${endpoints.CHANNEL_MESSAGE(channelId, messageId)}/threads`
    ,
    THREAD_START_PRIVATE: (channelId)=>`${CHANNEL_BASE(channelId)}/threads`
    ,
    THREAD_ACTIVE: (guildId)=>`${GUILDS_BASE(guildId)}/threads/active`
    ,
    THREAD_MEMBERS: (channelId)=>`${CHANNEL_BASE(channelId)}/thread-members`
    ,
    THREAD_ME: (channelId)=>`${endpoints.THREAD_MEMBERS(channelId)}/@me`
    ,
    THREAD_USER: (channelId, userId)=>`${endpoints.THREAD_MEMBERS(channelId)}/${userId}`
    ,
    THREAD_ARCHIVED_BASE: (channelId)=>`${CHANNEL_BASE(channelId)}/threads/archived`
    ,
    THREAD_ARCHIVED_PUBLIC: (channelId)=>`${endpoints.THREAD_ARCHIVED_BASE(channelId)}/public`
    ,
    THREAD_ARCHIVED_PRIVATE: (channelId)=>`${endpoints.THREAD_ARCHIVED_BASE(channelId)}/private`
    ,
    THREAD_ARCHIVED_PRIVATE_JOINED: (channelId)=>`${CHANNEL_BASE(channelId)}/users/@me/threads/archived/private`
    ,
    GUILDS: `${baseEndpoints.BASE_URL}/guilds`,
    GUILD_AUDIT_LOGS: (guildId)=>`${GUILDS_BASE(guildId)}/audit-logs`
    ,
    GUILD_BAN: (guildId, userId)=>`${GUILDS_BASE(guildId)}/bans/${userId}`
    ,
    GUILD_BANS: (guildId)=>`${GUILDS_BASE(guildId)}/bans`
    ,
    GUILD_BANNER: (guildId, icon)=>`${baseEndpoints.CDN_URL}/banners/${guildId}/${icon}`
    ,
    GUILD_CHANNELS: (guildId)=>`${GUILDS_BASE(guildId)}/channels`
    ,
    GUILD_WIDGET: (guildId)=>`${GUILDS_BASE(guildId)}/widget`
    ,
    GUILD_EMOJI: (guildId, emojiId)=>`${GUILDS_BASE(guildId)}/emojis/${emojiId}`
    ,
    GUILD_EMOJIS: (guildId)=>`${GUILDS_BASE(guildId)}/emojis`
    ,
    GUILD_ICON: (guildId, icon)=>`${baseEndpoints.CDN_URL}/icons/${guildId}/${icon}`
    ,
    GUILD_INTEGRATION: (guildId, integrationId)=>`${GUILDS_BASE(guildId)}/integrations/${integrationId}`
    ,
    GUILD_INTEGRATION_SYNC: (guildId, integrationId)=>`${GUILDS_BASE(guildId)}/integrations/${integrationId}/sync`
    ,
    GUILD_INTEGRATIONS: (guildId)=>`${GUILDS_BASE(guildId)}/integrations?include_applications=true`
    ,
    GUILD_INVITES: (guildId)=>`${GUILDS_BASE(guildId)}/invites`
    ,
    GUILD_LEAVE: (guildId)=>`${baseEndpoints.BASE_URL}/users/@me/guilds/${guildId}`
    ,
    GUILD_MEMBER: (guildId, userId)=>`${GUILDS_BASE(guildId)}/members/${userId}`
    ,
    GUILD_MEMBERS: (guildId)=>`${GUILDS_BASE(guildId)}/members`
    ,
    GUILD_MEMBER_ROLE: (guildId, memberId, roleId)=>`${GUILDS_BASE(guildId)}/members/${memberId}/roles/${roleId}`
    ,
    GUILD_MEMBERS_SEARCH: (guildId)=>`${GUILDS_BASE(guildId)}/members/search`
    ,
    GUILD_PRUNE: (guildId)=>`${GUILDS_BASE(guildId)}/prune`
    ,
    GUILD_REGIONS: (guildId)=>`${GUILDS_BASE(guildId)}/regions`
    ,
    GUILD_ROLE: (guildId, roleId)=>`${GUILDS_BASE(guildId)}/roles/${roleId}`
    ,
    GUILD_ROLES: (guildId)=>`${GUILDS_BASE(guildId)}/roles`
    ,
    GUILD_SPLASH: (guildId, icon)=>`${baseEndpoints.CDN_URL}/splashes/${guildId}/${icon}`
    ,
    GUILD_VANITY_URL: (guildId)=>`${GUILDS_BASE(guildId)}/vanity-url`
    ,
    GUILD_WEBHOOKS: (guildId)=>`${GUILDS_BASE(guildId)}/webhooks`
    ,
    GUILD_TEMPLATE: (code2)=>`${baseEndpoints.BASE_URL}/guilds/templates/${code2}`
    ,
    GUILD_TEMPLATES: (guildId)=>`${GUILDS_BASE(guildId)}/templates`
    ,
    GUILD_PREVIEW: (guildId)=>`${GUILDS_BASE(guildId)}/preview`
    ,
    UPDATE_VOICE_STATE: (guildId, userId)=>`${GUILDS_BASE(guildId)}/voice-states/${userId ?? "@me"}`
    ,
    GUILD_WELCOME_SCREEN: (guildId)=>`${GUILDS_BASE(guildId)}/welcome-screen`
    ,
    GUILD_SCHEDULED_EVENTS: (guildId)=>`${GUILDS_BASE(guildId)}/scheduled-events`
    ,
    GUILD_SCHEDULED_EVENT: (guildId, eventId)=>`${GUILDS_BASE(guildId)}/scheduled-events/${eventId}`
    ,
    GUILD_SCHEDULED_EVENT_USERS: (guildId, eventId)=>`${GUILDS_BASE(guildId)}/scheduled-events/${eventId}/users`
    ,
    VOICE_REGIONS: `${baseEndpoints.BASE_URL}/voice/regions`,
    INVITE: (inviteCode)=>`${baseEndpoints.BASE_URL}/invites/${inviteCode}`
    ,
    WEBHOOK: (webhookId, token)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}/${token}`
    ,
    WEBHOOK_ID: (webhookId)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}`
    ,
    WEBHOOK_MESSAGE: (webhookId, token, messageId)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}/${token}/messages/${messageId}`
    ,
    WEBHOOK_MESSAGE_ORIGINAL: (webhookId, token)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}/${token}/messages/@original`
    ,
    WEBHOOK_SLACK: (webhookId, token)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}/${token}/slack`
    ,
    WEBHOOK_GITHUB: (webhookId, token)=>`${baseEndpoints.BASE_URL}/webhooks/${webhookId}/${token}/github`
    ,
    COMMANDS: (applicationId)=>`${baseEndpoints.BASE_URL}/applications/${applicationId}/commands`
    ,
    COMMANDS_GUILD: (applicationId, guildId)=>`${baseEndpoints.BASE_URL}/applications/${applicationId}/guilds/${guildId}/commands`
    ,
    COMMANDS_PERMISSIONS: (applicationId, guildId)=>`${endpoints.COMMANDS_GUILD(applicationId, guildId)}/permissions`
    ,
    COMMANDS_PERMISSION: (applicationId, guildId, commandId)=>`${endpoints.COMMANDS_GUILD(applicationId, guildId)}/${commandId}/permissions`
    ,
    COMMANDS_ID: (applicationId, commandId)=>`${baseEndpoints.BASE_URL}/applications/${applicationId}/commands/${commandId}`
    ,
    COMMANDS_GUILD_ID: (applicationId, guildId, commandId)=>`${baseEndpoints.BASE_URL}/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`
    ,
    INTERACTION_ID_TOKEN: (interactionId, token)=>`${baseEndpoints.BASE_URL}/interactions/${interactionId}/${token}/callback`
    ,
    INTERACTION_ORIGINAL_ID_TOKEN: (interactionId, token)=>`${baseEndpoints.BASE_URL}/webhooks/${interactionId}/${token}/messages/@original`
    ,
    INTERACTION_ID_TOKEN_MESSAGE_ID: (applicationId, token, messageId)=>`${baseEndpoints.BASE_URL}/webhooks/${applicationId}/${token}/messages/${messageId}`
    ,
    USER: (userId)=>`${baseEndpoints.BASE_URL}/users/${userId}`
    ,
    USER_BOT: `${baseEndpoints.BASE_URL}/users/@me`,
    USER_GUILDS: `${baseEndpoints.BASE_URL}/@me/guilds`,
    USER_AVATAR: (userId, icon)=>`${baseEndpoints.CDN_URL}/avatars/${userId}/${icon}`
    ,
    USER_DEFAULT_AVATAR: (icon)=>`${baseEndpoints.CDN_URL}/embed/avatars/${icon}.png`
    ,
    USER_DM: `${baseEndpoints.BASE_URL}/users/@me/channels`,
    USER_CONNECTIONS: `${baseEndpoints.BASE_URL}/users/@me/connections`,
    USER_NICK: (guildId)=>`${GUILDS_BASE(guildId)}/members/@me`
    ,
    DISCOVERY_CATEGORIES: `${baseEndpoints.BASE_URL}/discovery/categories`,
    DISCOVERY_VALID_TERM: `${baseEndpoints.BASE_URL}/discovery/valid-term`,
    DISCOVERY_METADATA: (guildId)=>`${GUILDS_BASE(guildId)}/discovery-metadata`
    ,
    DISCOVERY_SUBCATEGORY: (guildId, categoryId)=>`${GUILDS_BASE(guildId)}/discovery-categories/${categoryId}`
    ,
    OAUTH2_APPLICATION: `${baseEndpoints.BASE_URL}/oauth2/applications/@me`,
    STAGE_INSTANCES: `${baseEndpoints.BASE_URL}/stage-instances`,
    STAGE_INSTANCE: (channelId)=>`${baseEndpoints.BASE_URL}/stage-instances/${channelId}`
};
function createRequestBody(rest, queuedRequest) {
    const headers = {
        Authorization: rest.token,
        "User-Agent": USER_AGENT
    };
    if (queuedRequest.request.method.toUpperCase() === "GET") {
        queuedRequest.payload.body = undefined;
    }
    if (queuedRequest.payload.body?.reason) {
        headers["X-Audit-Log-Reason"] = encodeURIComponent(queuedRequest.payload.body.reason);
    }
    if (queuedRequest.payload.body?.file) {
        if (!Array.isArray(queuedRequest.payload.body.file)) {
            queuedRequest.payload.body.file = [
                queuedRequest.payload.body.file
            ];
        }
        const form = new FormData();
        for(let i1 = 0; i1 < queuedRequest.payload.body.file.length; i1++){
            form.append(`file${i1}`, queuedRequest.payload.body.file[i1].blob, queuedRequest.payload.body.file[i1].name);
        }
        form.append("payload_json", JSON.stringify({
            ...queuedRequest.payload.body,
            file: undefined
        }));
        queuedRequest.payload.body.file = form;
    } else if (queuedRequest.payload.body && ![
        "GET",
        "DELETE"
    ].includes(queuedRequest.request.method)) {
        headers["Content-Type"] = "application/json";
    }
    return {
        headers,
        body: queuedRequest.payload.body?.file ?? JSON.stringify(queuedRequest.payload.body),
        method: queuedRequest.request.method.toUpperCase()
    };
}
var HTTPResponseCodes;
(function(HTTPResponseCodes1) {
    HTTPResponseCodes1[HTTPResponseCodes1["Ok"] = 200] = "Ok";
    HTTPResponseCodes1[HTTPResponseCodes1["Created"] = 201] = "Created";
    HTTPResponseCodes1[HTTPResponseCodes1["NoContent"] = 204] = "NoContent";
    HTTPResponseCodes1[HTTPResponseCodes1["NotModified"] = 304] = "NotModified";
    HTTPResponseCodes1[HTTPResponseCodes1["BadRequest"] = 400] = "BadRequest";
    HTTPResponseCodes1[HTTPResponseCodes1["Unauthorized"] = 401] = "Unauthorized";
    HTTPResponseCodes1[HTTPResponseCodes1["Forbidden"] = 403] = "Forbidden";
    HTTPResponseCodes1[HTTPResponseCodes1["NotFound"] = 404] = "NotFound";
    HTTPResponseCodes1[HTTPResponseCodes1["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HTTPResponseCodes1[HTTPResponseCodes1["TooManyRequests"] = 429] = "TooManyRequests";
    HTTPResponseCodes1[HTTPResponseCodes1["GatewayUnavailable"] = 502] = "GatewayUnavailable";
})(HTTPResponseCodes || (HTTPResponseCodes = {}));
function processQueue(rest, id) {
    const queue2 = rest.pathQueues.get(id);
    if (!queue2) return;
    while(queue2.requests.length){
        rest.debug(`[REST - processQueue] Running while loop.`);
        const queuedRequest = queue2.requests[0];
        if (!queuedRequest) break;
        const basicURL = rest.simplifyUrl(queuedRequest.request.url, queuedRequest.request.method.toUpperCase());
        const urlResetIn = rest.checkRateLimits(rest, basicURL);
        if (urlResetIn) {
            if (!queue2.isWaiting) {
                queue2.isWaiting = true;
                setTimeout(()=>{
                    queue2.isWaiting = false;
                    rest.debug(`[REST - processQueue] rate limited, running setTimeout.`);
                    rest.processQueue(rest, id);
                }, urlResetIn);
            }
            break;
        }
        const bucketResetIn = queuedRequest.payload.bucketId ? rest.checkRateLimits(rest, queuedRequest.payload.bucketId) : false;
        if (bucketResetIn) continue;
        const query = queuedRequest.request.method.toUpperCase() === "GET" && queuedRequest.payload.body ? Object.keys(queuedRequest.payload.body).filter((key)=>queuedRequest.payload.body[key] !== undefined
        ).map((key)=>`${encodeURIComponent(key)}=${encodeURIComponent(queuedRequest.payload.body[key])}`
        ).join("&") : "";
        const urlToUse = queuedRequest.request.method.toUpperCase() === "GET" && query ? `${queuedRequest.request.url}?${query}` : queuedRequest.request.url;
        rest.debug(`[REST - Add To Global Queue] ${JSON.stringify(queuedRequest.payload)}`);
        rest.globalQueue.push({
            ...queuedRequest,
            basicURL,
            urlToUse
        });
        rest.processGlobalQueue(rest);
        queue2.requests.shift();
    }
    rest.cleanupQueues(rest);
}
function processRateLimitedPaths(rest) {
    const now = Date.now();
    for (const [key, value] of rest.ratelimitedPaths.entries()){
        rest.debug(`[REST - processRateLimitedPaths] Running for of loop. ${value.resetTimestamp - now}`);
        if (value.resetTimestamp > now) continue;
        rest.ratelimitedPaths.delete(key);
        if (key === "global") rest.globallyRateLimited = false;
    }
    if (!rest.ratelimitedPaths.size) {
        rest.processingRateLimitedPaths = false;
    } else {
        rest.processingRateLimitedPaths = true;
        setTimeout(()=>{
            rest.debug(`[REST - processRateLimitedPaths] Running setTimeout.`);
            rest.processRateLimitedPaths(rest);
        }, 1000);
    }
}
function processRequest(rest, request, payload) {
    const route = request.url.substring(request.url.indexOf("api/"));
    const parts = route.split("/");
    parts.shift();
    if (parts[0]?.startsWith("v")) parts.shift();
    request.url = `${BASE_URL}/v${rest.version}/${parts.join("/")}`;
    parts.shift();
    const url = rest.simplifyUrl(request.url, request.method);
    const queue3 = rest.pathQueues.get(url);
    if (queue3) {
        queue3.requests.push({
            request,
            payload
        });
    } else {
        rest.pathQueues.set(url, {
            isWaiting: false,
            requests: [
                {
                    request,
                    payload
                }, 
            ]
        });
        rest.processQueue(rest, url);
    }
}
function processRequestHeaders(rest, url, headers) {
    let ratelimited = false;
    const remaining = headers.get("x-ratelimit-remaining");
    const retryAfter = headers.get("x-ratelimit-reset-after");
    const reset = Date.now() + Number(retryAfter) * 1000;
    const global = headers.get("x-ratelimit-global");
    const bucketId = headers.get("x-ratelimit-bucket") || undefined;
    if (remaining === "0") {
        ratelimited = true;
        rest.ratelimitedPaths.set(url, {
            url,
            resetTimestamp: reset,
            bucketId
        });
        if (bucketId) {
            rest.ratelimitedPaths.set(bucketId, {
                url,
                resetTimestamp: reset,
                bucketId
            });
        }
    }
    if (global) {
        const retryAfter = headers.get("retry-after");
        const globalReset = Date.now() + Number(retryAfter) * 1000;
        rest.debug(`[REST = Globally Rate Limited] URL: ${url} | Global Rest: ${globalReset}`);
        rest.globallyRateLimited = true;
        ratelimited = true;
        rest.ratelimitedPaths.set("global", {
            url: "global",
            resetTimestamp: globalReset,
            bucketId
        });
        if (bucketId) {
            rest.ratelimitedPaths.set(bucketId, {
                url: "global",
                resetTimestamp: globalReset,
                bucketId
            });
        }
    }
    if (ratelimited && !rest.processingRateLimitedPaths) {
        rest.processRateLimitedPaths(rest);
    }
    return ratelimited ? bucketId : undefined;
}
async function runMethod(rest, method, url, body, retryCount = 0, bucketId) {
    rest.debug(`[REST - RequestCreate] Method: ${method} | URL: ${url} | Retry Count: ${retryCount} | Bucket ID: ${bucketId} | Body: ${JSON.stringify(body)}`);
    const errorStack = new Error("Location:");
    Error.captureStackTrace(errorStack);
    if (!url.startsWith(`${BASE_URL}/v${9}`) && !url.startsWith(IMAGE_BASE_URL)) {
        const result = await fetch(url, {
            body: JSON.stringify(body || {}),
            headers: {
                authorization: rest.secretKey
            },
            method: method.toUpperCase()
        }).catch((error)=>{
            errorStack.message = error?.message;
            console.error(error);
            throw errorStack;
        });
        return result.status !== 204 ? await result.json() : undefined;
    }
    return new Promise((resolve, reject)=>{
        rest.processRequest(rest, {
            url,
            method,
            reject: (error)=>{
                errorStack.message = error?.message;
                reject(errorStack);
            },
            respond: (data2)=>resolve(data2.status !== 204 ? JSON.parse(data2.body ?? "{}") : undefined)
        }, {
            bucketId,
            body: body,
            retryCount
        });
    });
}
function simplifyUrl(url, method) {
    let route = url.replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, function(match, p) {
        return [
            "channels",
            "guilds"
        ].includes(p) ? match : `/${p}/skillzPrefersID`;
    }).replace(/\/reactions\/[^/]+/g, "/reactions/skillzPrefersID");
    if (route.includes("/reactions")) {
        route = route.substring(0, route.indexOf("/reactions") + "/reactions".length);
    }
    if (method === "DELETE" && route.endsWith("/messages/skillzPrefersID")) {
        route = method + route;
    }
    return route;
}
({
    token: "",
    maxRetryCount: 10,
    apiVersion: "9",
    authorization: "discordeno_best_lib_ever",
    pathQueues: new Map(),
    processingQueue: false,
    processingRateLimitedPaths: false,
    globallyRateLimited: false,
    ratelimitedPaths: new Map(),
    eventHandlers: {
        error: function(...args) {},
        debug: function(type, error) {},
        fetching (payload) {},
        fetched (payload) {},
        fetchSuccess (payload) {},
        fetchFailed (payload, error) {},
        globallyRateLimited (url, resetsAt) {},
        retriesMaxed (payload) {}
    },
    checkRateLimits,
    cleanupQueues,
    processQueue,
    processRateLimitedPaths,
    processRequestHeaders,
    processRequest,
    createRequestBody,
    runMethod,
    simplifyUrl
});
var GatewayIntents2;
(function(GatewayIntents1) {
    GatewayIntents1[GatewayIntents1["Guilds"] = 1] = "Guilds";
    GatewayIntents1[GatewayIntents1["GuildMembers"] = 2] = "GuildMembers";
    GatewayIntents1[GatewayIntents1["GuildBans"] = 4] = "GuildBans";
    GatewayIntents1[GatewayIntents1["GuildEmojis"] = 8] = "GuildEmojis";
    GatewayIntents1[GatewayIntents1["GuildIntegrations"] = 16] = "GuildIntegrations";
    GatewayIntents1[GatewayIntents1["GuildWebhooks"] = 32] = "GuildWebhooks";
    GatewayIntents1[GatewayIntents1["GuildInvites"] = 64] = "GuildInvites";
    GatewayIntents1[GatewayIntents1["GuildVoiceStates"] = 128] = "GuildVoiceStates";
    GatewayIntents1[GatewayIntents1["GuildPresences"] = 256] = "GuildPresences";
    GatewayIntents1[GatewayIntents1["GuildMessages"] = 512] = "GuildMessages";
    GatewayIntents1[GatewayIntents1["GuildMessageReactions"] = 1024] = "GuildMessageReactions";
    GatewayIntents1[GatewayIntents1["GuildMessageTyping"] = 2048] = "GuildMessageTyping";
    GatewayIntents1[GatewayIntents1["DirectMessages"] = 4096] = "DirectMessages";
    GatewayIntents1[GatewayIntents1["DirectMessageReactions"] = 8192] = "DirectMessageReactions";
    GatewayIntents1[GatewayIntents1["DirectMessageTyping"] = 16384] = "DirectMessageTyping";
    GatewayIntents1[GatewayIntents1["GuildScheduledEvents"] = 65536] = "GuildScheduledEvents";
})(GatewayIntents2 || (GatewayIntents2 = {}));
class Collection2 extends Map {
    maxSize;
    sweeper;
    constructor(entries, options){
        super(entries ?? []);
        this.maxSize = options?.maxSize;
        if (!options?.sweeper) return;
        this.startSweeper(options.sweeper);
    }
    startSweeper(options) {
        if (this.sweeper?.intervalId) clearInterval(this.sweeper.intervalId);
        this.sweeper = options;
        this.sweeper.intervalId = setInterval(()=>{
            this.forEach((value, key)=>{
                if (!this.sweeper?.filter(value, key, options.bot)) return;
                this.delete(key);
                return key;
            });
        }, options.interval);
        return this.sweeper.intervalId;
    }
    stopSweeper() {
        return clearInterval(this.sweeper?.intervalId);
    }
    changeSweeperInterval(newInterval) {
        if (!this.sweeper) return;
        this.startSweeper({
            filter: this.sweeper.filter,
            interval: newInterval
        });
    }
    changeSweeperFilter(newFilter) {
        if (!this.sweeper) return;
        this.startSweeper({
            filter: newFilter,
            interval: this.sweeper.interval
        });
    }
    set(key, value) {
        if ((this.maxSize || this.maxSize === 0) && this.size >= this.maxSize) {
            return this;
        }
        return super.set(key, value);
    }
    array() {
        return [
            ...this.values()
        ];
    }
    first() {
        return this.values().next().value;
    }
    last() {
        return [
            ...this.values()
        ][this.size - 1];
    }
    random() {
        const array = [
            ...this.values()
        ];
        return array[Math.floor(Math.random() * array.length)];
    }
    find(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return value;
        }
        return;
    }
    filter(callback) {
        const relevant = new Collection2();
        this.forEach((value, key)=>{
            if (callback(value, key)) relevant.set(key, value);
        });
        return relevant;
    }
    map(callback) {
        const results = [];
        for (const key of this.keys()){
            const value = this.get(key);
            results.push(callback(value, key));
        }
        return results;
    }
    some(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return true;
        }
        return false;
    }
    every(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (!callback(value, key)) return false;
        }
        return true;
    }
    reduce(callback, initialValue) {
        let accumulator = initialValue;
        for (const key of this.keys()){
            const value = this.get(key);
            accumulator = callback(accumulator, value, key);
        }
        return accumulator;
    }
}
var ChannelTypes2;
(function(ChannelTypes1) {
    ChannelTypes1[ChannelTypes1["GuildText"] = 0] = "GuildText";
    ChannelTypes1[ChannelTypes1["DM"] = 1] = "DM";
    ChannelTypes1[ChannelTypes1["GuildVoice"] = 2] = "GuildVoice";
    ChannelTypes1[ChannelTypes1["GroupDm"] = 3] = "GroupDm";
    ChannelTypes1[ChannelTypes1["GuildCategory"] = 4] = "GuildCategory";
    ChannelTypes1[ChannelTypes1["GuildNews"] = 5] = "GuildNews";
    ChannelTypes1[ChannelTypes1["GuildStore"] = 6] = "GuildStore";
    ChannelTypes1[ChannelTypes1["GuildNewsThread"] = 10] = "GuildNewsThread";
    ChannelTypes1[ChannelTypes1["GuildPublicThread"] = 11] = "GuildPublicThread";
    ChannelTypes1[ChannelTypes1["GuildPrivateThread"] = 12] = "GuildPrivateThread";
    ChannelTypes1[ChannelTypes1["GuildStageVoice"] = 13] = "GuildStageVoice";
})(ChannelTypes2 || (ChannelTypes2 = {}));
const Mask = (1n << 64n) - 1n;
function unpack64(v, shift) {
    return v >> BigInt(shift * 64) & Mask;
}
function separateOverwrites1(v) {
    return [
        Number(unpack64(v, 3)),
        unpack64(v, 2),
        unpack64(v, 0),
        unpack64(v, 1)
    ];
}
var Errors2;
(function(Errors1) {
    Errors1["BOTS_HIGHEST_ROLE_TOO_LOW"] = "BOTS_HIGHEST_ROLE_TOO_LOW";
    Errors1["CHANNEL_NOT_FOUND"] = "CHANNEL_NOT_FOUND";
    Errors1["CHANNEL_NOT_IN_GUILD"] = "CHANNEL_NOT_IN_GUILD";
    Errors1["CHANNEL_NOT_TEXT_BASED"] = "CHANNEL_NOT_TEXT_BASED";
    Errors1["CHANNEL_NOT_STAGE_VOICE"] = "CHANNEL_NOT_STAGE_VOICE";
    Errors1["MESSAGE_MAX_LENGTH"] = "MESSAGE_MAX_LENGTH";
    Errors1["RULES_CHANNEL_CANNOT_BE_DELETED"] = "RULES_CHANNEL_CANNOT_BE_DELETED";
    Errors1["UPDATES_CHANNEL_CANNOT_BE_DELETED"] = "UPDATES_CHANNEL_CANNOT_BE_DELETED";
    Errors1["INVALID_TOPIC_LENGTH"] = "INVALID_TOPIC_LENGTH";
    Errors1["GUILD_NOT_DISCOVERABLE"] = "GUILD_NOT_DISCOVERABLE";
    Errors1["GUILD_WIDGET_NOT_ENABLED"] = "GUILD_WIDGET_NOT_ENABLED";
    Errors1["GUILD_NOT_FOUND"] = "GUILD_NOT_FOUND";
    Errors1["MEMBER_NOT_FOUND"] = "MEMBER_NOT_FOUND";
    Errors1["MEMBER_NOT_IN_VOICE_CHANNEL"] = "MEMBER_NOT_IN_VOICE_CHANNEL";
    Errors1["MEMBER_SEARCH_LIMIT_TOO_HIGH"] = "MEMBER_SEARCH_LIMIT_TOO_HIGH";
    Errors1["MEMBER_SEARCH_LIMIT_TOO_LOW"] = "MEMBER_SEARCH_LIMIT_TOO_LOW";
    Errors1["PRUNE_MAX_DAYS"] = "PRUNE_MAX_DAYS";
    Errors1["ROLE_NOT_FOUND"] = "ROLE_NOT_FOUND";
    Errors1["INVALID_THREAD_PARENT_CHANNEL_TYPE"] = "INVALID_THREAD_PARENT_CHANNEL_TYPE";
    Errors1["GUILD_NEWS_CHANNEL_ONLY_SUPPORT_PUBLIC_THREADS"] = "GUILD_NEWS_CHANNEL_ONLY_SUPPORT_PUBLIC_THREADS";
    Errors1["NOT_A_THREAD_CHANNEL"] = "NOT_A_THREAD_CHANNEL";
    Errors1["MISSING_MANAGE_THREADS_AND_NOT_MEMBER"] = "MISSING_MANAGE_THREADS_AND_NOT_MEMBER";
    Errors1["CANNOT_GET_MEMBERS_OF_AN_UNJOINED_PRIVATE_THREAD"] = "CANNOT_GET_MEMBERS_OF_AN_UNJOINED_PRIVATE_THREAD";
    Errors1["HAVE_TO_BE_THE_CREATOR_OF_THE_THREAD_OR_HAVE_MANAGE_THREADS_TO_REMOVE_MEMBERS"] = "HAVE_TO_BE_THE_CREATOR_OF_THE_THREAD_OR_HAVE_MANAGE_THREADS_TO_REMOVE_MEMBERS";
    Errors1["INVALID_GET_MESSAGES_LIMIT"] = "INVALID_GET_MESSAGES_LIMIT";
    Errors1["DELETE_MESSAGES_MIN"] = "DELETE_MESSAGES_MIN";
    Errors1["PRUNE_MIN_DAYS"] = "PRUNE_MIN_DAYS";
    Errors1["INVALID_SLASH_DESCRIPTION"] = "INVALID_SLASH_DESCRIPTION";
    Errors1["INVALID_SLASH_NAME"] = "INVALID_SLASH_NAME";
    Errors1["INVALID_SLASH_OPTIONS"] = "INVALID_SLASH_OPTIONS";
    Errors1["INVALID_SLASH_OPTIONS_CHOICES"] = "INVALID_SLASH_OPTIONS_CHOICES";
    Errors1["TOO_MANY_SLASH_OPTIONS"] = "TOO_MANY_SLASH_OPTIONS";
    Errors1["INVALID_SLASH_OPTION_CHOICE_NAME"] = "INVALID_SLASH_OPTION_CHOICE_NAME";
    Errors1["INVALID_SLASH_OPTIONS_CHOICE_VALUE_TYPE"] = "INVALID_SLASH_OPTIONS_CHOICE_VALUE_TYPE";
    Errors1["TOO_MANY_SLASH_OPTION_CHOICES"] = "TOO_MANY_SLASH_OPTION_CHOICES";
    Errors1["ONLY_STRING_OR_INTEGER_OPTIONS_CAN_HAVE_CHOICES"] = "ONLY_STRING_OR_INTEGER_OPTIONS_CAN_HAVE_CHOICES";
    Errors1["INVALID_SLASH_OPTION_NAME"] = "INVALID_SLASH_OPTION_NAME";
    Errors1["INVALID_SLASH_OPTION_DESCRIPTION"] = "INVALID_SLASH_OPTION_DESCRIPTION";
    Errors1["INVALID_CONTEXT_MENU_COMMAND_NAME"] = "INVALID_CONTEXT_MENU_COMMAND_NAME";
    Errors1["INVALID_CONTEXT_MENU_COMMAND_DESCRIPTION"] = "INVALID_CONTEXT_MENU_COMMAND_DESCRIPTION";
    Errors1["INVALID_WEBHOOK_NAME"] = "INVALID_WEBHOOK_NAME";
    Errors1["INVALID_WEBHOOK_OPTIONS"] = "INVALID_WEBHOOK_OPTIONS";
    Errors1["MISSING_ADD_REACTIONS"] = "MISSING_ADD_REACTIONS";
    Errors1["MISSING_ADMINISTRATOR"] = "MISSING_ADMINISTRATOR";
    Errors1["MISSING_ATTACH_FILES"] = "MISSING_ATTACH_FILES";
    Errors1["MISSING_BAN_MEMBERS"] = "MISSING_BAN_MEMBERS";
    Errors1["MISSING_CHANGE_NICKNAME"] = "MISSING_CHANGE_NICKNAME";
    Errors1["MISSING_CONNECT"] = "MISSING_CONNECT";
    Errors1["MISSING_CREATE_INSTANT_INVITE"] = "MISSING_CREATE_INSTANT_INVITE";
    Errors1["MISSING_DEAFEN_MEMBERS"] = "MISSING_DEAFEN_MEMBERS";
    Errors1["MISSING_EMBED_LINKS"] = "MISSING_EMBED_LINKS";
    Errors1["MISSING_INTENT_GUILD_MEMBERS"] = "MISSING_INTENT_GUILD_MEMBERS";
    Errors1["MISSING_KICK_MEMBERS"] = "MISSING_KICK_MEMBERS";
    Errors1["MISSING_MANAGE_CHANNELS"] = "MISSING_MANAGE_CHANNELS";
    Errors1["MISSING_MANAGE_EMOJIS"] = "MISSING_MANAGE_EMOJIS";
    Errors1["MISSING_MANAGE_GUILD"] = "MISSING_MANAGE_GUILD";
    Errors1["MISSING_MANAGE_MESSAGES"] = "MISSING_MANAGE_MESSAGES";
    Errors1["MISSING_MANAGE_NICKNAMES"] = "MISSING_MANAGE_NICKNAMES";
    Errors1["MISSING_MANAGE_ROLES"] = "MISSING_MANAGE_ROLES";
    Errors1["MISSING_MANAGE_WEBHOOKS"] = "MISSING_MANAGE_WEBHOOKS";
    Errors1["MISSING_MENTION_EVERYONE"] = "MISSING_MENTION_EVERYONE";
    Errors1["MISSING_MOVE_MEMBERS"] = "MISSING_MOVE_MEMBERS";
    Errors1["MISSING_MUTE_MEMBERS"] = "MISSING_MUTE_MEMBERS";
    Errors1["MISSING_PRIORITY_SPEAKER"] = "MISSING_PRIORITY_SPEAKER";
    Errors1["MISSING_READ_MESSAGE_HISTORY"] = "MISSING_READ_MESSAGE_HISTORY";
    Errors1["MISSING_SEND_MESSAGES"] = "MISSING_SEND_MESSAGES";
    Errors1["MISSING_SEND_TTS_MESSAGES"] = "MISSING_SEND_TTS_MESSAGES";
    Errors1["MISSING_SPEAK"] = "MISSING_SPEAK";
    Errors1["MISSING_STREAM"] = "MISSING_STREAM";
    Errors1["MISSING_USE_VAD"] = "MISSING_USE_VAD";
    Errors1["MISSING_USE_EXTERNAL_EMOJIS"] = "MISSING_USE_EXTERNAL_EMOJIS";
    Errors1["MISSING_VIEW_AUDIT_LOG"] = "MISSING_VIEW_AUDIT_LOG";
    Errors1["MISSING_VIEW_CHANNEL"] = "MISSING_VIEW_CHANNEL";
    Errors1["MISSING_VIEW_GUILD_INSIGHTS"] = "MISSING_VIEW_GUILD_INSIGHTS";
    Errors1["NICKNAMES_MAX_LENGTH"] = "NICKNAMES_MAX_LENGTH";
    Errors1["USERNAME_INVALID_CHARACTER"] = "USERNAME_INVALID_CHARACTER";
    Errors1["USERNAME_INVALID_USERNAME"] = "USERNAME_INVALID_USERNAME";
    Errors1["USERNAME_MAX_LENGTH"] = "USERNAME_MAX_LENGTH";
    Errors1["USERNAME_MIN_LENGTH"] = "USERNAME_MIN_LENGTH";
    Errors1["NONCE_TOO_LONG"] = "NONCE_TOO_LONG";
    Errors1["INVITE_MAX_AGE_INVALID"] = "INVITE_MAX_AGE_INVALID";
    Errors1["INVITE_MAX_USES_INVALID"] = "INVITE_MAX_USES_INVALID";
    Errors1["RATE_LIMIT_RETRY_MAXED"] = "RATE_LIMIT_RETRY_MAXED";
    Errors1["REQUEST_CLIENT_ERROR"] = "REQUEST_CLIENT_ERROR";
    Errors1["REQUEST_SERVER_ERROR"] = "REQUEST_SERVER_ERROR";
    Errors1["REQUEST_UNKNOWN_ERROR"] = "REQUEST_UNKNOWN_ERROR";
    Errors1["TOO_MANY_COMPONENTS"] = "TOO_MANY_COMPONENTS";
    Errors1["TOO_MANY_ACTION_ROWS"] = "TOO_MANY_ACTION_ROWS";
    Errors1["LINK_BUTTON_CANNOT_HAVE_CUSTOM_ID"] = "LINK_BUTTON_CANNOT_HAVE_CUSTOM_ID";
    Errors1["COMPONENT_LABEL_TOO_BIG"] = "COMPONENT_LABEL_TOO_BIG";
    Errors1["COMPONENT_CUSTOM_ID_TOO_BIG"] = "COMPONENT_CUSTOM_ID_TOO_BIG";
    Errors1["BUTTON_REQUIRES_CUSTOM_ID"] = "BUTTON_REQUIRES_CUSTOM_ID";
    Errors1["COMPONENT_SELECT_MUST_BE_ALONE"] = "COMPONENT_SELECT_MUST_BE_ALONE";
    Errors1["COMPONENT_PLACEHOLDER_TOO_BIG"] = "COMPONENT_PLACEHOLDER_TOO_BIG";
    Errors1["COMPONENT_SELECT_MINVALUE_TOO_LOW"] = "COMPONENT_SELECT_MINVALUE_TOO_LOW";
    Errors1["COMPONENT_SELECT_MINVALUE_TOO_MANY"] = "COMPONENT_SELECT_MINVALUE_TOO_MANY";
    Errors1["COMPONENT_SELECT_MAXVALUE_TOO_LOW"] = "COMPONENT_SELECT_MAXVALUE_TOO_LOW";
    Errors1["COMPONENT_SELECT_MAXVALUE_TOO_MANY"] = "COMPONENT_SELECT_MAXVALUE_TOO_MANY";
    Errors1["COMPONENT_SELECT_OPTIONS_TOO_LOW"] = "COMPONENT_SELECT_OPTIONS_TOO_LOW";
    Errors1["COMPONENT_SELECT_OPTIONS_TOO_MANY"] = "COMPONENT_SELECT_OPTIONS_TOO_MANY";
    Errors1["SELECT_OPTION_LABEL_TOO_BIG"] = "SELECT_OPTION_LABEL_TOO_BIG";
    Errors1["SELECT_OPTION_VALUE_TOO_BIG"] = "SELECT_OPTION_VALUE_TOO_BIG";
    Errors1["SELECT_OPTION_TOO_MANY_DEFAULTS"] = "SELECT_OPTION_TOO_MANY_DEFAULTS";
    Errors1["COMPONENT_SELECT_MIN_HIGHER_THAN_MAX"] = "COMPONENT_SELECT_MIN_HIGHER_THAN_MAX";
    Errors1["CANNOT_ADD_USER_TO_ARCHIVED_THREADS"] = "CANNOT_ADD_USER_TO_ARCHIVED_THREADS";
    Errors1["CANNOT_LEAVE_ARCHIVED_THREAD"] = "CANNOT_LEAVE_ARCHIVED_THREAD";
    Errors1["CANNOT_REMOVE_FROM_ARCHIVED_THREAD"] = "CANNOT_REMOVE_FROM_ARCHIVED_THREAD";
    Errors1["YOU_CAN_NOT_DM_THE_BOT_ITSELF"] = "YOU_CAN_NOT_DM_THE_BOT_ITSELF";
})(Errors2 || (Errors2 = {}));
var GatewayCloseEventCodes;
(function(GatewayCloseEventCodes1) {
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["UnknownError"] = 4000] = "UnknownError";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["UnknownOpcode"] = 4001] = "UnknownOpcode";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["DecodeError"] = 4002] = "DecodeError";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["NotAuthenticated"] = 4003] = "NotAuthenticated";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["AuthenticationFailed"] = 4004] = "AuthenticationFailed";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["AlreadyAuthenticated"] = 4005] = "AlreadyAuthenticated";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["InvalidSeq"] = 4007] = "InvalidSeq";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["RateLimited"] = 4008] = "RateLimited";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["SessionTimedOut"] = 4009] = "SessionTimedOut";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["InvalidShard"] = 4010] = "InvalidShard";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["ShardingRequired"] = 4011] = "ShardingRequired";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["InvalidApiVersion"] = 4012] = "InvalidApiVersion";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["InvalidIntents"] = 4013] = "InvalidIntents";
    GatewayCloseEventCodes1[GatewayCloseEventCodes1["DisallowedIntents"] = 4014] = "DisallowedIntents";
})(GatewayCloseEventCodes || (GatewayCloseEventCodes = {}));
var GatewayOpcodes;
(function(GatewayOpcodes1) {
    GatewayOpcodes1[GatewayOpcodes1["Dispatch"] = 0] = "Dispatch";
    GatewayOpcodes1[GatewayOpcodes1["Heartbeat"] = 1] = "Heartbeat";
    GatewayOpcodes1[GatewayOpcodes1["Identify"] = 2] = "Identify";
    GatewayOpcodes1[GatewayOpcodes1["PresenceUpdate"] = 3] = "PresenceUpdate";
    GatewayOpcodes1[GatewayOpcodes1["VoiceStateUpdate"] = 4] = "VoiceStateUpdate";
    GatewayOpcodes1[GatewayOpcodes1["Resume"] = 6] = "Resume";
    GatewayOpcodes1[GatewayOpcodes1["Reconnect"] = 7] = "Reconnect";
    GatewayOpcodes1[GatewayOpcodes1["RequestGuildMembers"] = 8] = "RequestGuildMembers";
    GatewayOpcodes1[GatewayOpcodes1["InvalidSession"] = 9] = "InvalidSession";
    GatewayOpcodes1[GatewayOpcodes1["Hello"] = 10] = "Hello";
    GatewayOpcodes1[GatewayOpcodes1["HeartbeatACK"] = 11] = "HeartbeatACK";
})(GatewayOpcodes || (GatewayOpcodes = {}));
let wasm;
{
    const module = new WebAssembly.Module(((r1, n1)=>{
        var a1 = Uint8Array, e1 = Uint16Array, f1 = Uint32Array, o1 = a1.of(16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15), i1 = a1.of(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0), t1 = a1.of(0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0), v1 = function(r, n) {
            for(var a = new e1(31), o = 0; o < 31; ++o)a[o] = n += 1 << r[o - 1];
            var i2 = new f1(a[30]);
            for(o = 1; o < 30; ++o)for(var t = a[o]; t < a[o + 1]; ++t)i2[t] = t - a[o] << 5 | o;
            return [
                a,
                i2
            ];
        }, u1 = v1(i1, 2), l1 = u1[0], s1 = u1[1];
        l1[28] = 258, s1[258] = 28;
        for(var w1, b1 = v1(t1, 0)[0], c1 = new e1(32768), y1 = 0; y1 < 32768; ++y1)w1 = (61680 & (w1 = (52428 & (w1 = (43690 & y1) >>> 1 | (21845 & y1) << 1)) >>> 2 | (13107 & w1) << 2)) >>> 4 | (3855 & w1) << 4, c1[y1] = ((65280 & w1) >>> 8 | (255 & w1) << 8) >>> 1;
        var g = function(r, n, a) {
            for(var f = r.length, o = 0, i3 = new e1(n); o < f; ++o)++i3[r[o] - 1];
            var t, v = new e1(n);
            for(o = 0; o < n; ++o)v[o] = v[o - 1] + i3[o - 1] << 1;
            if (a) {
                t = new e1(1 << n);
                var u = 15 - n;
                for(o = 0; o < f; ++o)if (r[o]) for(var l = o << 4 | r[o], s = n - r[o], w = (v[r[o] - 1]++) << s, b = w | (1 << s) - 1; w <= b; ++w)t[c1[w] >>> u] = l;
            } else for(t = new e1(f), o = 0; o < f; ++o)r[o] && (t[o] = c1[v[r[o] - 1]++] >>> 15 - r[o]);
            return t;
        }, h1 = new a1(288);
        for(y1 = 0; y1 < 144; ++y1)h1[y1] = 8;
        for(y1 = 144; y1 < 256; ++y1)h1[y1] = 9;
        for(y1 = 256; y1 < 280; ++y1)h1[y1] = 7;
        for(y1 = 280; y1 < 288; ++y1)h1[y1] = 8;
        var k1 = new a1(32);
        for(y1 = 0; y1 < 32; ++y1)k1[y1] = 5;
        var A = g(h1, 9, 1), U = g(k1, 5, 1), d = function(r) {
            for(var n = r[0], a = 1; a < r.length; ++a)r[a] > n && (n = r[a]);
            return n;
        }, p = function(r, n, a) {
            var e = n >> 3 | 0;
            return (r[e] | r[e + 1] << 8) >> (7 & n) & a;
        }, m = function(r, n) {
            var a = n >> 3 | 0;
            return (r[a] | r[a + 1] << 8 | r[a + 2] << 16) >> (7 & n);
        };
        const z1 = new Uint8Array(r1);
        return (function(r2, n2, v) {
            var u = r2.length;
            if (!u || v && !v.l && u < 5) return n2 || new a1(0);
            v || (v = {}), n2 || (n2 = new a1(3 * u));
            var s, w = v.f || 0, c = v.p || 0, y = v.b || 0, h = v.l, k = v.d, z = v.m, j = v.n, q = 8 * u;
            do {
                if (!h) {
                    v.f = w = p(r2, c, 1);
                    var x = p(r2, c + 1, 3);
                    if (c += 3, !x) {
                        var B = r2[(M = ((s = c) >> 3 | 0) + (7 & s && 1) + 4) - 4] | r2[M - 3] << 8, C = M + B;
                        if (C > u) break;
                        n2.set(r2.subarray(M, C), y), v.b = y += B, v.p = c = 8 * C;
                        continue;
                    }
                    if (1 === x) h = A, k = U, z = 9, j = 5;
                    else if (2 === x) {
                        var D = p(r2, c, 31) + 257, E = p(r2, c + 10, 15) + 4, F1 = D + p(r2, c + 5, 31) + 1;
                        c += 14;
                        for(var G = new a1(F1), H1 = new a1(19), I = 0; I < E; ++I)H1[o1[I]] = p(r2, c + 3 * I, 7);
                        c += 3 * E;
                        var J = d(H1), K = (1 << J) - 1, L = g(H1, J, 1);
                        for(I = 0; I < F1;){
                            var M, N = L[p(r2, c, K)];
                            if (c += 15 & N, (M = N >>> 4) < 16) G[I++] = M;
                            else {
                                var O = 0, P = 0;
                                for(16 === M ? (P = 3 + p(r2, c, 3), c += 2, O = G[I - 1]) : 17 === M ? (P = 3 + p(r2, c, 7), c += 3) : 18 === M && (P = 11 + p(r2, c, 127), c += 7); P--;)G[I++] = O;
                            }
                        }
                        var Q = G.subarray(0, D), R = G.subarray(D);
                        z = d(Q), j = d(R), h = g(Q, z, 1), k = g(R, j, 1);
                    }
                    if (c > q) break;
                }
                for(var S = (1 << z) - 1, T = (1 << j) - 1, V = c;; V = c){
                    var W = (O = h[m(r2, c) & S]) >>> 4;
                    if ((c += 15 & O) > q) break;
                    if (W < 256) n2[y++] = W;
                    else {
                        if (256 === W) {
                            V = c, h = null;
                            break;
                        }
                        var X = W - 254;
                        if (W > 264) {
                            var Y = i1[I = W - 257];
                            X = p(r2, c, (1 << Y) - 1) + l1[I], c += Y;
                        }
                        var Z = k[m(r2, c) & T], $ = Z >>> 4;
                        c += 15 & Z;
                        R = b1[$];
                        if ($ > 3) {
                            Y = t1[$];
                            R += m(r2, c) & (1 << Y) - 1, c += Y;
                        }
                        if (c > q) break;
                        for(var _ = y + X; y < _; y += 4)n2[y] = n2[y - R], n2[y + 1] = n2[y + 1 - R], n2[y + 2] = n2[y + 2 - R], n2[y + 3] = n2[y + 3 - R];
                        y = _;
                    }
                }
                v.l = h, v.p = V, v.b = y, h && (w = 1, v.m = z, v.d = k, v.n = j);
            }while (!w)
            y === n2.length || (function(r, n, o) {
                (null == n || n < 0) && (n = 0), (null == o || o > r.length) && (o = r.length);
                var i4 = new (r instanceof e1 ? e1 : (r instanceof f1 ? f1 : a1))(o - n);
                i4.set(r.subarray(n, o));
            })(n2, 0, y);
        })(n1.subarray(2, -4), z1), z1;
    })(74037, Uint8Array.from(atob(''), (__char)=>__char.codePointAt(0)
    )));
    const instance = new WebAssembly.Instance(module, {
        wasi_snapshot_preview1: {
            fd_write () {},
            proc_exit () {}
        },
        env: {
            __sys_getcwd () {},
            emscripten_notify_memory_growth () {}
        }
    });
    wasm = instance.exports;
}class mem {
    static length() {
        return wasm.wlen();
    }
    static alloc(size) {
        return wasm.walloc(size);
    }
    static free(ptr, size) {
        return wasm.wfree(ptr, size);
    }
    static u8(ptr, size) {
        return new Uint8Array(wasm.memory.buffer, ptr, size);
    }
    static u32(ptr, size) {
        return new Uint32Array(wasm.memory.buffer, ptr, size);
    }
    static copy_and_free(ptr, size) {
        let slice = mem.u8(ptr, size).slice();
        return wasm.wfree(ptr, size), slice;
    }
}
new Map();
var MessageComponentTypes2;
(function(MessageComponentTypes1) {
    MessageComponentTypes1[MessageComponentTypes1["ActionRow"] = 1] = "ActionRow";
    MessageComponentTypes1[MessageComponentTypes1["Button"] = 2] = "Button";
    MessageComponentTypes1[MessageComponentTypes1["SelectMenu"] = 3] = "SelectMenu";
    MessageComponentTypes1[MessageComponentTypes1["InputText"] = 4] = "InputText";
})(MessageComponentTypes2 || (MessageComponentTypes2 = {}));
var PrivacyLevel;
(function(PrivacyLevel1) {
    PrivacyLevel1[PrivacyLevel1["GuildOnly"] = 2] = "GuildOnly";
})(PrivacyLevel || (PrivacyLevel = {}));
var ScheduledEventPrivacyLevel;
(function(ScheduledEventPrivacyLevel1) {
    ScheduledEventPrivacyLevel1[ScheduledEventPrivacyLevel1["GuildOnly"] = 2] = "GuildOnly";
})(ScheduledEventPrivacyLevel || (ScheduledEventPrivacyLevel = {}));
var ScheduledEventEntityType2;
(function(ScheduledEventEntityType1) {
    ScheduledEventEntityType1[ScheduledEventEntityType1["StageInstance"] = 1] = "StageInstance";
    ScheduledEventEntityType1[ScheduledEventEntityType1["Voice"] = 2] = "Voice";
    ScheduledEventEntityType1[ScheduledEventEntityType1["External"] = 3] = "External";
})(ScheduledEventEntityType2 || (ScheduledEventEntityType2 = {}));
var ScheduledEventStatus;
(function(ScheduledEventStatus1) {
    ScheduledEventStatus1[ScheduledEventStatus1["Scheduled"] = 1] = "Scheduled";
    ScheduledEventStatus1[ScheduledEventStatus1["Active"] = 2] = "Active";
    ScheduledEventStatus1[ScheduledEventStatus1["Completed"] = 3] = "Completed";
    ScheduledEventStatus1[ScheduledEventStatus1["Canceled"] = 4] = "Canceled";
})(ScheduledEventStatus || (ScheduledEventStatus = {}));
var BitwisePermissionFlags2;
(function(BitwisePermissionFlags1) {
    BitwisePermissionFlags1[BitwisePermissionFlags1["CREATE_INSTANT_INVITE"] = 1] = "CREATE_INSTANT_INVITE";
    BitwisePermissionFlags1[BitwisePermissionFlags1["KICK_MEMBERS"] = 2] = "KICK_MEMBERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["BAN_MEMBERS"] = 4] = "BAN_MEMBERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["ADMINISTRATOR"] = 8] = "ADMINISTRATOR";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_CHANNELS"] = 16] = "MANAGE_CHANNELS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_GUILD"] = 32] = "MANAGE_GUILD";
    BitwisePermissionFlags1[BitwisePermissionFlags1["ADD_REACTIONS"] = 64] = "ADD_REACTIONS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["VIEW_AUDIT_LOG"] = 128] = "VIEW_AUDIT_LOG";
    BitwisePermissionFlags1[BitwisePermissionFlags1["PRIORITY_SPEAKER"] = 256] = "PRIORITY_SPEAKER";
    BitwisePermissionFlags1[BitwisePermissionFlags1["STREAM"] = 512] = "STREAM";
    BitwisePermissionFlags1[BitwisePermissionFlags1["VIEW_CHANNEL"] = 1024] = "VIEW_CHANNEL";
    BitwisePermissionFlags1[BitwisePermissionFlags1["SEND_MESSAGES"] = 2048] = "SEND_MESSAGES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["SEND_TTS_MESSAGES"] = 4096] = "SEND_TTS_MESSAGES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_MESSAGES"] = 8192] = "MANAGE_MESSAGES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["EMBED_LINKS"] = 16384] = "EMBED_LINKS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["ATTACH_FILES"] = 32768] = "ATTACH_FILES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["READ_MESSAGE_HISTORY"] = 65536] = "READ_MESSAGE_HISTORY";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MENTION_EVERYONE"] = 131072] = "MENTION_EVERYONE";
    BitwisePermissionFlags1[BitwisePermissionFlags1["USE_EXTERNAL_EMOJIS"] = 262144] = "USE_EXTERNAL_EMOJIS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["VIEW_GUILD_INSIGHTS"] = 524288] = "VIEW_GUILD_INSIGHTS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["CONNECT"] = 1048576] = "CONNECT";
    BitwisePermissionFlags1[BitwisePermissionFlags1["SPEAK"] = 2097152] = "SPEAK";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MUTE_MEMBERS"] = 4194304] = "MUTE_MEMBERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["DEAFEN_MEMBERS"] = 8388608] = "DEAFEN_MEMBERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MOVE_MEMBERS"] = 16777216] = "MOVE_MEMBERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["USE_VAD"] = 33554432] = "USE_VAD";
    BitwisePermissionFlags1[BitwisePermissionFlags1["CHANGE_NICKNAME"] = 67108864] = "CHANGE_NICKNAME";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_NICKNAMES"] = 134217728] = "MANAGE_NICKNAMES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_ROLES"] = 268435456] = "MANAGE_ROLES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_WEBHOOKS"] = 536870912] = "MANAGE_WEBHOOKS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_EMOJIS"] = 1073741824] = "MANAGE_EMOJIS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["USE_SLASH_COMMANDS"] = 2147483648] = "USE_SLASH_COMMANDS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["REQUEST_TO_SPEAK"] = 4294967296] = "REQUEST_TO_SPEAK";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_EVENTS"] = 8589934592] = "MANAGE_EVENTS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MANAGE_THREADS"] = 17179869184] = "MANAGE_THREADS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["CREATE_PUBLIC_THREADS"] = 34359738368] = "CREATE_PUBLIC_THREADS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["CREATE_PRIVATE_THREADS"] = 68719476736] = "CREATE_PRIVATE_THREADS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["USE_EXTERNAL_STICKERS"] = 137438953472] = "USE_EXTERNAL_STICKERS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["SEND_MESSAGES_IN_THREADS"] = 274877906944] = "SEND_MESSAGES_IN_THREADS";
    BitwisePermissionFlags1[BitwisePermissionFlags1["START_EMBEDDED_ACTIVITIES"] = 549755813888] = "START_EMBEDDED_ACTIVITIES";
    BitwisePermissionFlags1[BitwisePermissionFlags1["MODERATE_MEMBERS"] = 1099511627776] = "MODERATE_MEMBERS";
})(BitwisePermissionFlags2 || (BitwisePermissionFlags2 = {}));
var ActivityFlags;
(function(ActivityFlags1) {
    ActivityFlags1[ActivityFlags1["Instance"] = 1] = "Instance";
    ActivityFlags1[ActivityFlags1["Join"] = 2] = "Join";
    ActivityFlags1[ActivityFlags1["Spectate"] = 4] = "Spectate";
    ActivityFlags1[ActivityFlags1["JoinRequest"] = 8] = "JoinRequest";
    ActivityFlags1[ActivityFlags1["Sync"] = 16] = "Sync";
    ActivityFlags1[ActivityFlags1["Play"] = 32] = "Play";
    ActivityFlags1[ActivityFlags1["PartyPrivacyFriends"] = 64] = "PartyPrivacyFriends";
    ActivityFlags1[ActivityFlags1["PartyPrivacyVoiceChannel"] = 128] = "PartyPrivacyVoiceChannel";
    ActivityFlags1[ActivityFlags1["Embedded"] = 256] = "Embedded";
})(ActivityFlags || (ActivityFlags = {}));
var ActivityTypes;
(function(ActivityTypes1) {
    ActivityTypes1[ActivityTypes1["Game"] = 0] = "Game";
    ActivityTypes1[ActivityTypes1["Streaming"] = 1] = "Streaming";
    ActivityTypes1[ActivityTypes1["Listening"] = 2] = "Listening";
    ActivityTypes1[ActivityTypes1["Watching"] = 3] = "Watching";
    ActivityTypes1[ActivityTypes1["Custom"] = 4] = "Custom";
    ActivityTypes1[ActivityTypes1["Competing"] = 5] = "Competing";
})(ActivityTypes || (ActivityTypes = {}));
var ApplicationFlags;
(function(ApplicationFlags1) {
    ApplicationFlags1[ApplicationFlags1["GatewayPresence"] = 4096] = "GatewayPresence";
    ApplicationFlags1[ApplicationFlags1["GatewayPresenceLimited"] = 8192] = "GatewayPresenceLimited";
    ApplicationFlags1[ApplicationFlags1["GatewayGuildMembers"] = 16384] = "GatewayGuildMembers";
    ApplicationFlags1[ApplicationFlags1["GatewayGuildMembersLimited"] = 32768] = "GatewayGuildMembersLimited";
    ApplicationFlags1[ApplicationFlags1["VerificationPendingGuildLimit"] = 65536] = "VerificationPendingGuildLimit";
    ApplicationFlags1[ApplicationFlags1["Embedded"] = 131072] = "Embedded";
    ApplicationFlags1[ApplicationFlags1["GatewayMessageCount"] = 262144] = "GatewayMessageCount";
    ApplicationFlags1[ApplicationFlags1["GatewayMessageContentLimited"] = 524288] = "GatewayMessageContentLimited";
})(ApplicationFlags || (ApplicationFlags = {}));
var AuditLogEvents;
(function(AuditLogEvents1) {
    AuditLogEvents1[AuditLogEvents1["GuildUpdate"] = 1] = "GuildUpdate";
    AuditLogEvents1[AuditLogEvents1["ChannelCreate"] = 10] = "ChannelCreate";
    AuditLogEvents1[AuditLogEvents1["ChannelUpdate"] = 11] = "ChannelUpdate";
    AuditLogEvents1[AuditLogEvents1["ChannelDelete"] = 12] = "ChannelDelete";
    AuditLogEvents1[AuditLogEvents1["ChannelOverwriteCreate"] = 13] = "ChannelOverwriteCreate";
    AuditLogEvents1[AuditLogEvents1["ChannelOverwriteUpdate"] = 14] = "ChannelOverwriteUpdate";
    AuditLogEvents1[AuditLogEvents1["ChannelOverwriteDelete"] = 15] = "ChannelOverwriteDelete";
    AuditLogEvents1[AuditLogEvents1["MemberKick"] = 20] = "MemberKick";
    AuditLogEvents1[AuditLogEvents1["MemberPrune"] = 21] = "MemberPrune";
    AuditLogEvents1[AuditLogEvents1["MemberBanAdd"] = 22] = "MemberBanAdd";
    AuditLogEvents1[AuditLogEvents1["MemberBanRemove"] = 23] = "MemberBanRemove";
    AuditLogEvents1[AuditLogEvents1["MemberUpdate"] = 24] = "MemberUpdate";
    AuditLogEvents1[AuditLogEvents1["MemberRoleUpdate"] = 25] = "MemberRoleUpdate";
    AuditLogEvents1[AuditLogEvents1["MemberMove"] = 26] = "MemberMove";
    AuditLogEvents1[AuditLogEvents1["MemberDisconnect"] = 27] = "MemberDisconnect";
    AuditLogEvents1[AuditLogEvents1["BotAdd"] = 28] = "BotAdd";
    AuditLogEvents1[AuditLogEvents1["RoleCreate"] = 30] = "RoleCreate";
    AuditLogEvents1[AuditLogEvents1["RoleUpdate"] = 31] = "RoleUpdate";
    AuditLogEvents1[AuditLogEvents1["RoleDelete"] = 32] = "RoleDelete";
    AuditLogEvents1[AuditLogEvents1["InviteCreate"] = 40] = "InviteCreate";
    AuditLogEvents1[AuditLogEvents1["InviteUpdate"] = 41] = "InviteUpdate";
    AuditLogEvents1[AuditLogEvents1["InviteDelete"] = 42] = "InviteDelete";
    AuditLogEvents1[AuditLogEvents1["WebhookCreate"] = 50] = "WebhookCreate";
    AuditLogEvents1[AuditLogEvents1["WebhookUpdate"] = 51] = "WebhookUpdate";
    AuditLogEvents1[AuditLogEvents1["WebhookDelete"] = 52] = "WebhookDelete";
    AuditLogEvents1[AuditLogEvents1["EmojiCreate"] = 60] = "EmojiCreate";
    AuditLogEvents1[AuditLogEvents1["EmojiUpdate"] = 61] = "EmojiUpdate";
    AuditLogEvents1[AuditLogEvents1["EmojiDelete"] = 62] = "EmojiDelete";
    AuditLogEvents1[AuditLogEvents1["MessageDelete"] = 72] = "MessageDelete";
    AuditLogEvents1[AuditLogEvents1["MessageBulkDelete"] = 73] = "MessageBulkDelete";
    AuditLogEvents1[AuditLogEvents1["MessagePin"] = 74] = "MessagePin";
    AuditLogEvents1[AuditLogEvents1["MessageUnpin"] = 75] = "MessageUnpin";
    AuditLogEvents1[AuditLogEvents1["IntegrationCreate"] = 80] = "IntegrationCreate";
    AuditLogEvents1[AuditLogEvents1["IntegrationUpdate"] = 81] = "IntegrationUpdate";
    AuditLogEvents1[AuditLogEvents1["IntegrationDelete"] = 82] = "IntegrationDelete";
    AuditLogEvents1[AuditLogEvents1["StageInstanceCreate"] = 83] = "StageInstanceCreate";
    AuditLogEvents1[AuditLogEvents1["StageInstanceUpdate"] = 84] = "StageInstanceUpdate";
    AuditLogEvents1[AuditLogEvents1["StageInstanceDelete"] = 85] = "StageInstanceDelete";
    AuditLogEvents1[AuditLogEvents1["StickerCreate"] = 90] = "StickerCreate";
    AuditLogEvents1[AuditLogEvents1["StickerUpdate"] = 91] = "StickerUpdate";
    AuditLogEvents1[AuditLogEvents1["StickerDelete"] = 92] = "StickerDelete";
    AuditLogEvents1[AuditLogEvents1["GuildScheduledEventCreate"] = 100] = "GuildScheduledEventCreate";
    AuditLogEvents1[AuditLogEvents1["GuildScheduledEventUpdate"] = 101] = "GuildScheduledEventUpdate";
    AuditLogEvents1[AuditLogEvents1["GuildScheduledEventDelete"] = 102] = "GuildScheduledEventDelete";
    AuditLogEvents1[AuditLogEvents1["ThreadCreate"] = 110] = "ThreadCreate";
    AuditLogEvents1[AuditLogEvents1["ThreadUpdate"] = 111] = "ThreadUpdate";
    AuditLogEvents1[AuditLogEvents1["ThreadDelete"] = 112] = "ThreadDelete";
})(AuditLogEvents || (AuditLogEvents = {}));
var OverwriteTypes;
(function(OverwriteTypes1) {
    OverwriteTypes1[OverwriteTypes1["Role"] = 0] = "Role";
    OverwriteTypes1[OverwriteTypes1["Member"] = 1] = "Member";
})(OverwriteTypes || (OverwriteTypes = {}));
var VideoQualityModes;
(function(VideoQualityModes1) {
    VideoQualityModes1[VideoQualityModes1["Auto"] = 1] = "Auto";
    VideoQualityModes1[VideoQualityModes1["Full"] = 2] = "Full";
})(VideoQualityModes || (VideoQualityModes = {}));
var JsonErrorCodes;
(function(JsonErrorCodes1) {
    JsonErrorCodes1[JsonErrorCodes1["GeneralError"] = 0] = "GeneralError";
    JsonErrorCodes1[JsonErrorCodes1["UnknownAccount"] = 10001] = "UnknownAccount";
    JsonErrorCodes1[JsonErrorCodes1["UnknownApplication"] = 10002] = "UnknownApplication";
    JsonErrorCodes1[JsonErrorCodes1["UnknownChannel"] = 10003] = "UnknownChannel";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuild"] = 10004] = "UnknownGuild";
    JsonErrorCodes1[JsonErrorCodes1["UnknownIntegration"] = 10005] = "UnknownIntegration";
    JsonErrorCodes1[JsonErrorCodes1["UnknownInvite"] = 10006] = "UnknownInvite";
    JsonErrorCodes1[JsonErrorCodes1["UnknownMember"] = 10007] = "UnknownMember";
    JsonErrorCodes1[JsonErrorCodes1["UnknownMessage"] = 10008] = "UnknownMessage";
    JsonErrorCodes1[JsonErrorCodes1["UnknownPermissionOverwrite"] = 10009] = "UnknownPermissionOverwrite";
    JsonErrorCodes1[JsonErrorCodes1["UnknownProvider"] = 10010] = "UnknownProvider";
    JsonErrorCodes1[JsonErrorCodes1["UnknownRole"] = 10011] = "UnknownRole";
    JsonErrorCodes1[JsonErrorCodes1["UnknownToken"] = 10012] = "UnknownToken";
    JsonErrorCodes1[JsonErrorCodes1["UnknownUser"] = 10013] = "UnknownUser";
    JsonErrorCodes1[JsonErrorCodes1["UnknownEmoji"] = 10014] = "UnknownEmoji";
    JsonErrorCodes1[JsonErrorCodes1["UnknownWebhook"] = 10015] = "UnknownWebhook";
    JsonErrorCodes1[JsonErrorCodes1["UnknownWebhookService"] = 10016] = "UnknownWebhookService";
    JsonErrorCodes1[JsonErrorCodes1["UnknownSession"] = 10020] = "UnknownSession";
    JsonErrorCodes1[JsonErrorCodes1["UnknownBan"] = 10026] = "UnknownBan";
    JsonErrorCodes1[JsonErrorCodes1["UnknownSKU"] = 10027] = "UnknownSKU";
    JsonErrorCodes1[JsonErrorCodes1["UnknownStoreListing"] = 10028] = "UnknownStoreListing";
    JsonErrorCodes1[JsonErrorCodes1["UnknownEntitlement"] = 10029] = "UnknownEntitlement";
    JsonErrorCodes1[JsonErrorCodes1["UnknownBuild"] = 10030] = "UnknownBuild";
    JsonErrorCodes1[JsonErrorCodes1["UnknownLobby"] = 10031] = "UnknownLobby";
    JsonErrorCodes1[JsonErrorCodes1["UnknownBranch"] = 10032] = "UnknownBranch";
    JsonErrorCodes1[JsonErrorCodes1["UnknownStoreDirectoryLayout"] = 10033] = "UnknownStoreDirectoryLayout";
    JsonErrorCodes1[JsonErrorCodes1["UnknownRedistributable"] = 10036] = "UnknownRedistributable";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGiftCode"] = 10038] = "UnknownGiftCode";
    JsonErrorCodes1[JsonErrorCodes1["UnknownStream"] = 10049] = "UnknownStream";
    JsonErrorCodes1[JsonErrorCodes1["UnknownPremiumServerSubscribeCooldown"] = 10050] = "UnknownPremiumServerSubscribeCooldown";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuildTemplate"] = 10057] = "UnknownGuildTemplate";
    JsonErrorCodes1[JsonErrorCodes1["UnknownDiscoveryCategory"] = 10059] = "UnknownDiscoveryCategory";
    JsonErrorCodes1[JsonErrorCodes1["UnknownSticker"] = 10060] = "UnknownSticker";
    JsonErrorCodes1[JsonErrorCodes1["UnknownInteraction"] = 10062] = "UnknownInteraction";
    JsonErrorCodes1[JsonErrorCodes1["UnknownApplicationCommand"] = 10063] = "UnknownApplicationCommand";
    JsonErrorCodes1[JsonErrorCodes1["UnknownApplicationCommandPermissions"] = 10066] = "UnknownApplicationCommandPermissions";
    JsonErrorCodes1[JsonErrorCodes1["UnknownStageInstance"] = 10067] = "UnknownStageInstance";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuildMemberVerificationForm"] = 10068] = "UnknownGuildMemberVerificationForm";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuildWelcomeScreen"] = 10069] = "UnknownGuildWelcomeScreen";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuildScheduledEvent"] = 10070] = "UnknownGuildScheduledEvent";
    JsonErrorCodes1[JsonErrorCodes1["UnknownGuildScheduledEventUser"] = 10071] = "UnknownGuildScheduledEventUser";
    JsonErrorCodes1[JsonErrorCodes1["BotsCannotUseThisEndpoint"] = 20001] = "BotsCannotUseThisEndpoint";
    JsonErrorCodes1[JsonErrorCodes1["OnlyBotsCanUseThisEndpoint"] = 20002] = "OnlyBotsCanUseThisEndpoint";
    JsonErrorCodes1[JsonErrorCodes1["ExplicitContentCannotBeSentToTheDesiredRecipient"] = 20009] = "ExplicitContentCannotBeSentToTheDesiredRecipient";
    JsonErrorCodes1[JsonErrorCodes1["YouAreNotAuthorizedToPerformThisActionOnThisApplication"] = 20012] = "YouAreNotAuthorizedToPerformThisActionOnThisApplication";
    JsonErrorCodes1[JsonErrorCodes1["ThisActionCannotBePerformedDueToSlowmodeRateLimit"] = 20016] = "ThisActionCannotBePerformedDueToSlowmodeRateLimit";
    JsonErrorCodes1[JsonErrorCodes1["OnlyTheOwnerOfThisAccountCanPerformThisAction"] = 20018] = "OnlyTheOwnerOfThisAccountCanPerformThisAction";
    JsonErrorCodes1[JsonErrorCodes1["ThisMessageCannotBeEditedDueToAnnouncementRateLimits"] = 20022] = "ThisMessageCannotBeEditedDueToAnnouncementRateLimits";
    JsonErrorCodes1[JsonErrorCodes1["TheChannelYouAreWritingHasHitTheWriteRateLimit"] = 20028] = "TheChannelYouAreWritingHasHitTheWriteRateLimit";
    JsonErrorCodes1[JsonErrorCodes1["TheWriteActionYouArePerformingOnTheServerHasHitTheWriteRateLimit"] = 20029] = "TheWriteActionYouArePerformingOnTheServerHasHitTheWriteRateLimit";
    JsonErrorCodes1[JsonErrorCodes1["YourStageTopicOrServerNameOrServerDescriptionOrChannelNamesContainsWordsThatAreNotAllowedForPublicStages"] = 20031] = "YourStageTopicOrServerNameOrServerDescriptionOrChannelNamesContainsWordsThatAreNotAllowedForPublicStages";
    JsonErrorCodes1[JsonErrorCodes1["GuildPremiumSubscriptionLevelTooLow"] = 20035] = "GuildPremiumSubscriptionLevelTooLow";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfGuildsReached"] = 30001] = "MaximumNumberOfGuildsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfFriendsReached"] = 30002] = "MaximumNumberOfFriendsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfPinsReachedForTheChannel"] = 30003] = "MaximumNumberOfPinsReachedForTheChannel";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfRecipientsReached"] = 30004] = "MaximumNumberOfRecipientsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfGuildRolesReached"] = 30005] = "MaximumNumberOfGuildRolesReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfWebhooksReached"] = 30007] = "MaximumNumberOfWebhooksReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfEmojisReached"] = 30008] = "MaximumNumberOfEmojisReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfReactionsReached"] = 30010] = "MaximumNumberOfReactionsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfGuildChannelsReached"] = 30013] = "MaximumNumberOfGuildChannelsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfAttachmentsInAMessageReached"] = 30015] = "MaximumNumberOfAttachmentsInAMessageReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfInvitesReached"] = 30016] = "MaximumNumberOfInvitesReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfAnimatedEmojisReached"] = 30018] = "MaximumNumberOfAnimatedEmojisReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfServerMembersReached"] = 30019] = "MaximumNumberOfServerMembersReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfServerCategoriesHasBeenReached"] = 30030] = "MaximumNumberOfServerCategoriesHasBeenReached";
    JsonErrorCodes1[JsonErrorCodes1["GuildAlreadyHasTemplate"] = 30031] = "GuildAlreadyHasTemplate";
    JsonErrorCodes1[JsonErrorCodes1["MaxNumberOfThreadParticipantsHasBeenReached"] = 30033] = "MaxNumberOfThreadParticipantsHasBeenReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfBansForNonGuildMembersHaveBeenExceeded"] = 30035] = "MaximumNumberOfBansForNonGuildMembersHaveBeenExceeded";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfBansFetchesHasBeenReached"] = 30037] = "MaximumNumberOfBansFetchesHasBeenReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfUncompletedGuildScheduledEventsReached"] = 30038] = "MaximumNumberOfUncompletedGuildScheduledEventsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfStickersReached"] = 30039] = "MaximumNumberOfStickersReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfPruneRequestsHasBeenReachedTryAgainLater"] = 30040] = "MaximumNumberOfPruneRequestsHasBeenReachedTryAgainLater";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReachedTryAgainLater"] = 30042] = "MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReachedTryAgainLater";
    JsonErrorCodes1[JsonErrorCodes1["UnauthorizedProvideAValidTokenAndTryAgain"] = 40001] = "UnauthorizedProvideAValidTokenAndTryAgain";
    JsonErrorCodes1[JsonErrorCodes1["YouNeedToVerifyYourAccountInOrderToPerformThisAction"] = 40002] = "YouNeedToVerifyYourAccountInOrderToPerformThisAction";
    JsonErrorCodes1[JsonErrorCodes1["YouAreOpeningDirectMessagesTooFast"] = 40003] = "YouAreOpeningDirectMessagesTooFast";
    JsonErrorCodes1[JsonErrorCodes1["RequestEntityTooLargeTrySendingSomethingSmallerInSize"] = 40005] = "RequestEntityTooLargeTrySendingSomethingSmallerInSize";
    JsonErrorCodes1[JsonErrorCodes1["ThisFeatureHasBeenTemporarilyDisabledServerSide"] = 40006] = "ThisFeatureHasBeenTemporarilyDisabledServerSide";
    JsonErrorCodes1[JsonErrorCodes1["ThisUserBannedFromThisGuild"] = 40007] = "ThisUserBannedFromThisGuild";
    JsonErrorCodes1[JsonErrorCodes1["TargetUserIsNotConnectedToVoice"] = 40032] = "TargetUserIsNotConnectedToVoice";
    JsonErrorCodes1[JsonErrorCodes1["ThisMessageHasAlreadyBeenCrossposted"] = 40033] = "ThisMessageHasAlreadyBeenCrossposted";
    JsonErrorCodes1[JsonErrorCodes1["AnApplicationCommandWithThatNameAlreadyExists"] = 40041] = "AnApplicationCommandWithThatNameAlreadyExists";
    JsonErrorCodes1[JsonErrorCodes1["MissingAccess"] = 50001] = "MissingAccess";
    JsonErrorCodes1[JsonErrorCodes1["InvalidAccountType"] = 50002] = "InvalidAccountType";
    JsonErrorCodes1[JsonErrorCodes1["CannotExecuteActionOnADMChannel"] = 50003] = "CannotExecuteActionOnADMChannel";
    JsonErrorCodes1[JsonErrorCodes1["GuildWidgetDisabled"] = 50004] = "GuildWidgetDisabled";
    JsonErrorCodes1[JsonErrorCodes1["CannotEditMessageAuthoredByAnotherUser"] = 50005] = "CannotEditMessageAuthoredByAnotherUser";
    JsonErrorCodes1[JsonErrorCodes1["CannotSendAnEmptyMessage"] = 50006] = "CannotSendAnEmptyMessage";
    JsonErrorCodes1[JsonErrorCodes1["CannotSendMessagesToThisUser"] = 50007] = "CannotSendMessagesToThisUser";
    JsonErrorCodes1[JsonErrorCodes1["CannotSendMessagesInAVoiceChannel"] = 50008] = "CannotSendMessagesInAVoiceChannel";
    JsonErrorCodes1[JsonErrorCodes1["ChannelVerificationLevelIsTooHighForYouToGainAccess"] = 50009] = "ChannelVerificationLevelIsTooHighForYouToGainAccess";
    JsonErrorCodes1[JsonErrorCodes1["OAuth2ApplicationDoesNotHaveABot"] = 50010] = "OAuth2ApplicationDoesNotHaveABot";
    JsonErrorCodes1[JsonErrorCodes1["OAuth2ApplicationLimitReached"] = 50011] = "OAuth2ApplicationLimitReached";
    JsonErrorCodes1[JsonErrorCodes1["InvalidOAuth2State"] = 50012] = "InvalidOAuth2State";
    JsonErrorCodes1[JsonErrorCodes1["YouLackPermissionsToPerformThatAction"] = 50013] = "YouLackPermissionsToPerformThatAction";
    JsonErrorCodes1[JsonErrorCodes1["InvalidAuthenticationTokenProvided"] = 50014] = "InvalidAuthenticationTokenProvided";
    JsonErrorCodes1[JsonErrorCodes1["NoteWasTooLong"] = 50015] = "NoteWasTooLong";
    JsonErrorCodes1[JsonErrorCodes1["ProvidedTooFewOrTooManyMessagesToDeleteMustProvideAtLeast2AndFewerThan100MessagesToDelete"] = 50016] = "ProvidedTooFewOrTooManyMessagesToDeleteMustProvideAtLeast2AndFewerThan100MessagesToDelete";
    JsonErrorCodes1[JsonErrorCodes1["AMessageCanOnlyBePinnedInTheChannelItWasSentIn"] = 50019] = "AMessageCanOnlyBePinnedInTheChannelItWasSentIn";
    JsonErrorCodes1[JsonErrorCodes1["InviteCodeWasEitherInvalidOrTaken"] = 50020] = "InviteCodeWasEitherInvalidOrTaken";
    JsonErrorCodes1[JsonErrorCodes1["CannotExecuteActionOnASystemMessage"] = 50021] = "CannotExecuteActionOnASystemMessage";
    JsonErrorCodes1[JsonErrorCodes1["CannotExecuteActionOnThisChannelType"] = 50024] = "CannotExecuteActionOnThisChannelType";
    JsonErrorCodes1[JsonErrorCodes1["InvalidOAuth2AccessTokenProvided"] = 50025] = "InvalidOAuth2AccessTokenProvided";
    JsonErrorCodes1[JsonErrorCodes1["MissingRequiredOAuth2Scope"] = 50026] = "MissingRequiredOAuth2Scope";
    JsonErrorCodes1[JsonErrorCodes1["InvalidWebhookTokenProvided"] = 50027] = "InvalidWebhookTokenProvided";
    JsonErrorCodes1[JsonErrorCodes1["InvalidRole"] = 50028] = "InvalidRole";
    JsonErrorCodes1[JsonErrorCodes1["InvalidRecipients"] = 50033] = "InvalidRecipients";
    JsonErrorCodes1[JsonErrorCodes1["AMessageProvidedWasTooOldToBulkDelete"] = 50034] = "AMessageProvidedWasTooOldToBulkDelete";
    JsonErrorCodes1[JsonErrorCodes1["InvalidFormBodyOrContentTypeProvided"] = 50035] = "InvalidFormBodyOrContentTypeProvided";
    JsonErrorCodes1[JsonErrorCodes1["AnInviteWasAcceptedToAGuildTheApplicationsBotIsNotIn"] = 50036] = "AnInviteWasAcceptedToAGuildTheApplicationsBotIsNotIn";
    JsonErrorCodes1[JsonErrorCodes1["InvalidApiVersionProvided"] = 50041] = "InvalidApiVersionProvided";
    JsonErrorCodes1[JsonErrorCodes1["FileUploadedExceedsTheMaximumSize"] = 50045] = "FileUploadedExceedsTheMaximumSize";
    JsonErrorCodes1[JsonErrorCodes1["InvalidFileUploaded"] = 50046] = "InvalidFileUploaded";
    JsonErrorCodes1[JsonErrorCodes1["CannotSelfRedeemThisGift"] = 50054] = "CannotSelfRedeemThisGift";
    JsonErrorCodes1[JsonErrorCodes1["InvalidGuild"] = 50055] = "InvalidGuild";
    JsonErrorCodes1[JsonErrorCodes1["PaymentSourceRequiredToRedeemGift"] = 50070] = "PaymentSourceRequiredToRedeemGift";
    JsonErrorCodes1[JsonErrorCodes1["CannotDeleteAChannelRequiredForCommunityGuilds"] = 50074] = "CannotDeleteAChannelRequiredForCommunityGuilds";
    JsonErrorCodes1[JsonErrorCodes1["InvalidStickerSent"] = 50081] = "InvalidStickerSent";
    JsonErrorCodes1[JsonErrorCodes1["TriedToPerformAnOperationOnAnArchivedThreadSuchAsEditingAMessageOrAddingAUserToTheThread"] = 50083] = "TriedToPerformAnOperationOnAnArchivedThreadSuchAsEditingAMessageOrAddingAUserToTheThread";
    JsonErrorCodes1[JsonErrorCodes1["InvalidThreadNotificationSettings"] = 50084] = "InvalidThreadNotificationSettings";
    JsonErrorCodes1[JsonErrorCodes1["BeforeValueIsEarlierThanTheThreadCreationDate"] = 50085] = "BeforeValueIsEarlierThanTheThreadCreationDate";
    JsonErrorCodes1[JsonErrorCodes1["ThisServerIsNotAvailableInYourLocation"] = 50095] = "ThisServerIsNotAvailableInYourLocation";
    JsonErrorCodes1[JsonErrorCodes1["ThisServerNeedsMonetizationEnabledInOrderToPerformThisAction"] = 50097] = "ThisServerNeedsMonetizationEnabledInOrderToPerformThisAction";
    JsonErrorCodes1[JsonErrorCodes1["ThisServerNeedsMoreBoostsToPerformThisAction"] = 50101] = "ThisServerNeedsMoreBoostsToPerformThisAction";
    JsonErrorCodes1[JsonErrorCodes1["TheRequestBodyContainsInvalidJSON"] = 50109] = "TheRequestBodyContainsInvalidJSON";
    JsonErrorCodes1[JsonErrorCodes1["TwoFactorIsRequiredForThisOperation"] = 60003] = "TwoFactorIsRequiredForThisOperation";
    JsonErrorCodes1[JsonErrorCodes1["NoUsersWithDiscordTagExist"] = 80004] = "NoUsersWithDiscordTagExist";
    JsonErrorCodes1[JsonErrorCodes1["ReactionWasBlocked"] = 90001] = "ReactionWasBlocked";
    JsonErrorCodes1[JsonErrorCodes1["ApiResourceIsCurrentlyOverloadedTryAgainALittleLater"] = 130000] = "ApiResourceIsCurrentlyOverloadedTryAgainALittleLater";
    JsonErrorCodes1[JsonErrorCodes1["TheStageIsAlreadyOpen"] = 150006] = "TheStageIsAlreadyOpen";
    JsonErrorCodes1[JsonErrorCodes1["CannotReplyWithoutPermissionToReadMessageHistory"] = 160002] = "CannotReplyWithoutPermissionToReadMessageHistory";
    JsonErrorCodes1[JsonErrorCodes1["AThreadHasAlreadyBeenCreatedForThisMessage"] = 160004] = "AThreadHasAlreadyBeenCreatedForThisMessage";
    JsonErrorCodes1[JsonErrorCodes1["ThreadIsLocked"] = 160005] = "ThreadIsLocked";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfActiveThreadsReached"] = 160006] = "MaximumNumberOfActiveThreadsReached";
    JsonErrorCodes1[JsonErrorCodes1["MaximumNumberOfActiveAnnouncementThreadsReached"] = 160007] = "MaximumNumberOfActiveAnnouncementThreadsReached";
    JsonErrorCodes1[JsonErrorCodes1["InvalidJsonForUploadedLottieFile"] = 170001] = "InvalidJsonForUploadedLottieFile";
    JsonErrorCodes1[JsonErrorCodes1["UploadedLottiesCannotContainRasterizedImagesSuchAsPngOrJpeg"] = 170002] = "UploadedLottiesCannotContainRasterizedImagesSuchAsPngOrJpeg";
    JsonErrorCodes1[JsonErrorCodes1["StickerMaximumFramerateExceeded"] = 170003] = "StickerMaximumFramerateExceeded";
    JsonErrorCodes1[JsonErrorCodes1["StickerFrameCountExceedsMaximumOf1000Frames"] = 170004] = "StickerFrameCountExceedsMaximumOf1000Frames";
    JsonErrorCodes1[JsonErrorCodes1["LottieAnimationMaximumDimensionsExceeded"] = 170005] = "LottieAnimationMaximumDimensionsExceeded";
    JsonErrorCodes1[JsonErrorCodes1["StickerFrameRateIsEitherTooSmallOrTooLarge"] = 170006] = "StickerFrameRateIsEitherTooSmallOrTooLarge";
    JsonErrorCodes1[JsonErrorCodes1["StickerAnimationDurationExceedsMaximumOf5Seconds"] = 170007] = "StickerAnimationDurationExceedsMaximumOf5Seconds";
    JsonErrorCodes1[JsonErrorCodes1["CannotUpdateAFinishedEvent"] = 180000] = "CannotUpdateAFinishedEvent";
    JsonErrorCodes1[JsonErrorCodes1["FailedToCreateStageNeededForStageEvent"] = 180002] = "FailedToCreateStageNeededForStageEvent";
})(JsonErrorCodes || (JsonErrorCodes = {}));
var RpcCloseEventCodes;
(function(RpcCloseEventCodes1) {
    RpcCloseEventCodes1[RpcCloseEventCodes1["InvalidClientId"] = 4000] = "InvalidClientId";
    RpcCloseEventCodes1[RpcCloseEventCodes1["InvalidOrigin"] = 4001] = "InvalidOrigin";
    RpcCloseEventCodes1[RpcCloseEventCodes1["RateLimited"] = 4002] = "RateLimited";
    RpcCloseEventCodes1[RpcCloseEventCodes1["TokenRevoked"] = 4003] = "TokenRevoked";
    RpcCloseEventCodes1[RpcCloseEventCodes1["InvalidVersion"] = 4004] = "InvalidVersion";
    RpcCloseEventCodes1[RpcCloseEventCodes1["InvalidEncoding"] = 4005] = "InvalidEncoding";
})(RpcCloseEventCodes || (RpcCloseEventCodes = {}));
var RpcErrorCodes;
(function(RpcErrorCodes1) {
    RpcErrorCodes1[RpcErrorCodes1["UnknownError"] = 1000] = "UnknownError";
    RpcErrorCodes1[RpcErrorCodes1["InvalidPayload"] = 4000] = "InvalidPayload";
    RpcErrorCodes1[RpcErrorCodes1["InvalidCommand"] = 4002] = "InvalidCommand";
    RpcErrorCodes1[RpcErrorCodes1["InvalidGuild"] = 4003] = "InvalidGuild";
    RpcErrorCodes1[RpcErrorCodes1["InvalidEvent"] = 4004] = "InvalidEvent";
    RpcErrorCodes1[RpcErrorCodes1["InvalidChannel"] = 4005] = "InvalidChannel";
    RpcErrorCodes1[RpcErrorCodes1["InvalidPermissions"] = 4006] = "InvalidPermissions";
    RpcErrorCodes1[RpcErrorCodes1["InvalidClientId"] = 4007] = "InvalidClientId";
    RpcErrorCodes1[RpcErrorCodes1["InvalidOrigin"] = 4008] = "InvalidOrigin";
    RpcErrorCodes1[RpcErrorCodes1["InvalidToken"] = 4009] = "InvalidToken";
    RpcErrorCodes1[RpcErrorCodes1["InvalidUser"] = 4010] = "InvalidUser";
    RpcErrorCodes1[RpcErrorCodes1["OAuth2Error"] = 5000] = "OAuth2Error";
    RpcErrorCodes1[RpcErrorCodes1["SelectChannelTimedOut"] = 5001] = "SelectChannelTimedOut";
    RpcErrorCodes1[RpcErrorCodes1["GetGuildTimedOut"] = 5002] = "GetGuildTimedOut";
    RpcErrorCodes1[RpcErrorCodes1["SelectVoiceForceRequired"] = 5003] = "SelectVoiceForceRequired";
    RpcErrorCodes1[RpcErrorCodes1["CaptureShortcutAlreadyListening"] = 5004] = "CaptureShortcutAlreadyListening";
})(RpcErrorCodes || (RpcErrorCodes = {}));
var VoiceCloseEventCodes;
(function(VoiceCloseEventCodes1) {
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["UnknownOpcode"] = 4001] = "UnknownOpcode";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["FailedToDecodePayload"] = 4002] = "FailedToDecodePayload";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["NotAuthenticated"] = 4003] = "NotAuthenticated";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["AuthenticationFailed"] = 4004] = "AuthenticationFailed";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["AlreadyAuthenticated"] = 4005] = "AlreadyAuthenticated";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["SessionNoLongerValid"] = 4006] = "SessionNoLongerValid";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["SessionTimedOut"] = 4009] = "SessionTimedOut";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["ServerNotFound"] = 4011] = "ServerNotFound";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["UnknownProtocol"] = 4012] = "UnknownProtocol";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["Disconnect"] = 4014] = "Disconnect";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["VoiceServerCrashed"] = 4015] = "VoiceServerCrashed";
    VoiceCloseEventCodes1[VoiceCloseEventCodes1["UnknownEncryptionMode"] = 4016] = "UnknownEncryptionMode";
})(VoiceCloseEventCodes || (VoiceCloseEventCodes = {}));
var VoiceOpcodes;
(function(VoiceOpcodes1) {
    VoiceOpcodes1[VoiceOpcodes1["Identify"] = 0] = "Identify";
    VoiceOpcodes1[VoiceOpcodes1["SelectProtocol"] = 1] = "SelectProtocol";
    VoiceOpcodes1[VoiceOpcodes1["Ready"] = 2] = "Ready";
    VoiceOpcodes1[VoiceOpcodes1["Heartbeat"] = 3] = "Heartbeat";
    VoiceOpcodes1[VoiceOpcodes1["SessionDescription"] = 4] = "SessionDescription";
    VoiceOpcodes1[VoiceOpcodes1["Speaking"] = 5] = "Speaking";
    VoiceOpcodes1[VoiceOpcodes1["HeartbeatACK"] = 6] = "HeartbeatACK";
    VoiceOpcodes1[VoiceOpcodes1["Resume"] = 7] = "Resume";
    VoiceOpcodes1[VoiceOpcodes1["Hello"] = 8] = "Hello";
    VoiceOpcodes1[VoiceOpcodes1["Resumed"] = 9] = "Resumed";
    VoiceOpcodes1[VoiceOpcodes1["ClientDisconnect"] = 13] = "ClientDisconnect";
})(VoiceOpcodes || (VoiceOpcodes = {}));
var DefaultMessageNotificationLevels;
(function(DefaultMessageNotificationLevels1) {
    DefaultMessageNotificationLevels1[DefaultMessageNotificationLevels1["AllMessages"] = 0] = "AllMessages";
    DefaultMessageNotificationLevels1[DefaultMessageNotificationLevels1["OnlyMentions"] = 1] = "OnlyMentions";
})(DefaultMessageNotificationLevels || (DefaultMessageNotificationLevels = {}));
var GuildNsfwLevel;
(function(GuildNsfwLevel1) {
    GuildNsfwLevel1[GuildNsfwLevel1["Default"] = 0] = "Default";
    GuildNsfwLevel1[GuildNsfwLevel1["Explicit"] = 1] = "Explicit";
    GuildNsfwLevel1[GuildNsfwLevel1["Safe"] = 2] = "Safe";
    GuildNsfwLevel1[GuildNsfwLevel1["AgeRestricted"] = 3] = "AgeRestricted";
})(GuildNsfwLevel || (GuildNsfwLevel = {}));
var ExplicitContentFilterLevels;
(function(ExplicitContentFilterLevels1) {
    ExplicitContentFilterLevels1[ExplicitContentFilterLevels1["Disabled"] = 0] = "Disabled";
    ExplicitContentFilterLevels1[ExplicitContentFilterLevels1["MembersWithoutRoles"] = 1] = "MembersWithoutRoles";
    ExplicitContentFilterLevels1[ExplicitContentFilterLevels1["AllMembers"] = 2] = "AllMembers";
})(ExplicitContentFilterLevels || (ExplicitContentFilterLevels = {}));
var GetGuildWidgetImageStyleOptions;
(function(GetGuildWidgetImageStyleOptions1) {
    GetGuildWidgetImageStyleOptions1["Shield"] = "shield";
    GetGuildWidgetImageStyleOptions1["Banner1"] = "banner1";
    GetGuildWidgetImageStyleOptions1["Banner2"] = "banner2";
    GetGuildWidgetImageStyleOptions1["Banner3"] = "banner3";
    GetGuildWidgetImageStyleOptions1["Banner4"] = "banner4";
})(GetGuildWidgetImageStyleOptions || (GetGuildWidgetImageStyleOptions = {}));
var GuildFeatures2;
(function(GuildFeatures1) {
    GuildFeatures1["InviteSplash"] = "INVITE_SPLASH";
    GuildFeatures1["VipRegions"] = "VIP_REGIONS";
    GuildFeatures1["VanityUrl"] = "VANITY_URL";
    GuildFeatures1["Verified"] = "VERIFIED";
    GuildFeatures1["Partnered"] = "PARTNERED";
    GuildFeatures1["Community"] = "COMMUNITY";
    GuildFeatures1["Commerce"] = "COMMERCE";
    GuildFeatures1["News"] = "NEWS";
    GuildFeatures1["Discoverable"] = "DISCOVERABLE";
    GuildFeatures1["DiscoverableDisabled"] = "DISCOVERABLE_DISABLED";
    GuildFeatures1["Feature"] = "FEATURABLE";
    GuildFeatures1["AnimatedIcon"] = "ANIMATED_ICON";
    GuildFeatures1["Banner"] = "BANNER";
    GuildFeatures1["WelcomeScreenEnabled"] = "WELCOME_SCREEN_ENABLED";
    GuildFeatures1["MemberVerificationGateEnabled"] = "MEMBER_VERIFICATION_GATE_ENABLED";
    GuildFeatures1["PreviewEnabled"] = "PREVIEW_ENABLED";
    GuildFeatures1["TicketedEventsEnabled"] = "TICKETED_EVENTS_ENABLED";
    GuildFeatures1["MonetizationEnabled"] = "MONETIZATION_ENABLED";
    GuildFeatures1["MoreStickers"] = "MORE_STICKERS";
    GuildFeatures1["ThreeDayThreadArchive"] = "THREE_DAY_THREAD_ARCHIVE";
    GuildFeatures1["SevenDayThreadArchive"] = "SEVEN_DAY_THREAD_ARCHIVE";
    GuildFeatures1["PrivateThreads"] = "PRIVATE_THREADS";
    GuildFeatures1["RoleIcons"] = "ROLE_ICONS";
})(GuildFeatures2 || (GuildFeatures2 = {}));
var MfaLevels;
(function(MfaLevels1) {
    MfaLevels1[MfaLevels1["None"] = 0] = "None";
    MfaLevels1[MfaLevels1["Elevated"] = 1] = "Elevated";
})(MfaLevels || (MfaLevels = {}));
var PremiumTiers;
(function(PremiumTiers1) {
    PremiumTiers1[PremiumTiers1["None"] = 0] = "None";
    PremiumTiers1[PremiumTiers1["Tier1"] = 1] = "Tier1";
    PremiumTiers1[PremiumTiers1["Tier2"] = 2] = "Tier2";
    PremiumTiers1[PremiumTiers1["Tier3"] = 3] = "Tier3";
})(PremiumTiers || (PremiumTiers = {}));
var SystemChannelFlags;
(function(SystemChannelFlags1) {
    SystemChannelFlags1[SystemChannelFlags1["SuppressJoinNotifications"] = 1] = "SuppressJoinNotifications";
    SystemChannelFlags1[SystemChannelFlags1["SuppressPremiumSubscriptions"] = 2] = "SuppressPremiumSubscriptions";
    SystemChannelFlags1[SystemChannelFlags1["SuppressGuildReminderNotifications"] = 4] = "SuppressGuildReminderNotifications";
    SystemChannelFlags1[SystemChannelFlags1["SuppressJoinNotificationReplies"] = 8] = "SuppressJoinNotificationReplies";
})(SystemChannelFlags || (SystemChannelFlags = {}));
var VerificationLevels;
(function(VerificationLevels1) {
    VerificationLevels1[VerificationLevels1["None"] = 0] = "None";
    VerificationLevels1[VerificationLevels1["Low"] = 1] = "Low";
    VerificationLevels1[VerificationLevels1["Medium"] = 2] = "Medium";
    VerificationLevels1[VerificationLevels1["High"] = 3] = "High";
    VerificationLevels1[VerificationLevels1["VeryHigh"] = 4] = "VeryHigh";
})(VerificationLevels || (VerificationLevels = {}));
var IntegrationExpireBehaviors;
(function(IntegrationExpireBehaviors1) {
    IntegrationExpireBehaviors1[IntegrationExpireBehaviors1["RemoveRole"] = 0] = "RemoveRole";
    IntegrationExpireBehaviors1[IntegrationExpireBehaviors1["Kick"] = 1] = "Kick";
})(IntegrationExpireBehaviors || (IntegrationExpireBehaviors = {}));
var ApplicationCommandOptionTypes2;
(function(ApplicationCommandOptionTypes1) {
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["SubCommand"] = 1] = "SubCommand";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["SubCommandGroup"] = 2] = "SubCommandGroup";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["String"] = 3] = "String";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Integer"] = 4] = "Integer";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Boolean"] = 5] = "Boolean";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["User"] = 6] = "User";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Channel"] = 7] = "Channel";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Role"] = 8] = "Role";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Mentionable"] = 9] = "Mentionable";
    ApplicationCommandOptionTypes1[ApplicationCommandOptionTypes1["Number"] = 10] = "Number";
})(ApplicationCommandOptionTypes2 || (ApplicationCommandOptionTypes2 = {}));
var ApplicationCommandPermissionTypes;
(function(ApplicationCommandPermissionTypes1) {
    ApplicationCommandPermissionTypes1[ApplicationCommandPermissionTypes1["Role"] = 1] = "Role";
    ApplicationCommandPermissionTypes1[ApplicationCommandPermissionTypes1["User"] = 2] = "User";
})(ApplicationCommandPermissionTypes || (ApplicationCommandPermissionTypes = {}));
var ApplicationCommandTypes2;
(function(ApplicationCommandTypes1) {
    ApplicationCommandTypes1[ApplicationCommandTypes1["ChatInput"] = 1] = "ChatInput";
    ApplicationCommandTypes1[ApplicationCommandTypes1["User"] = 2] = "User";
    ApplicationCommandTypes1[ApplicationCommandTypes1["Message"] = 3] = "Message";
})(ApplicationCommandTypes2 || (ApplicationCommandTypes2 = {}));
var InteractionResponseTypes;
(function(InteractionResponseTypes1) {
    InteractionResponseTypes1[InteractionResponseTypes1["Pong"] = 1] = "Pong";
    InteractionResponseTypes1[InteractionResponseTypes1["ChannelMessageWithSource"] = 4] = "ChannelMessageWithSource";
    InteractionResponseTypes1[InteractionResponseTypes1["DeferredChannelMessageWithSource"] = 5] = "DeferredChannelMessageWithSource";
    InteractionResponseTypes1[InteractionResponseTypes1["DeferredUpdateMessage"] = 6] = "DeferredUpdateMessage";
    InteractionResponseTypes1[InteractionResponseTypes1["UpdateMessage"] = 7] = "UpdateMessage";
    InteractionResponseTypes1[InteractionResponseTypes1["ApplicationCommandAutocompleteResult"] = 8] = "ApplicationCommandAutocompleteResult";
    InteractionResponseTypes1[InteractionResponseTypes1["Modal"] = 9] = "Modal";
})(InteractionResponseTypes || (InteractionResponseTypes = {}));
var InteractionTypes;
(function(InteractionTypes1) {
    InteractionTypes1[InteractionTypes1["Ping"] = 1] = "Ping";
    InteractionTypes1[InteractionTypes1["ApplicationCommand"] = 2] = "ApplicationCommand";
    InteractionTypes1[InteractionTypes1["MessageComponent"] = 3] = "MessageComponent";
    InteractionTypes1[InteractionTypes1["ApplicationCommandAutocomplete"] = 4] = "ApplicationCommandAutocomplete";
    InteractionTypes1[InteractionTypes1["ModalSubmit"] = 5] = "ModalSubmit";
})(InteractionTypes || (InteractionTypes = {}));
var InviteTargetTypes;
(function(InviteTargetTypes1) {
    InviteTargetTypes1[InviteTargetTypes1["Stream"] = 1] = "Stream";
    InviteTargetTypes1[InviteTargetTypes1["EmbeddedApplication"] = 2] = "EmbeddedApplication";
})(InviteTargetTypes || (InviteTargetTypes = {}));
var TargetTypes;
(function(TargetTypes1) {
    TargetTypes1[TargetTypes1["Stream"] = 1] = "Stream";
    TargetTypes1[TargetTypes1["EmbeddedApplication"] = 2] = "EmbeddedApplication";
})(TargetTypes || (TargetTypes = {}));
var AllowedMentionsTypes2;
(function(AllowedMentionsTypes1) {
    AllowedMentionsTypes1["RoleMentions"] = "roles";
    AllowedMentionsTypes1["UserMentions"] = "users";
    AllowedMentionsTypes1["EveryoneMentions"] = "everyone";
})(AllowedMentionsTypes2 || (AllowedMentionsTypes2 = {}));
var ButtonStyles2;
(function(ButtonStyles1) {
    ButtonStyles1[ButtonStyles1["Primary"] = 1] = "Primary";
    ButtonStyles1[ButtonStyles1["Secondary"] = 2] = "Secondary";
    ButtonStyles1[ButtonStyles1["Success"] = 3] = "Success";
    ButtonStyles1[ButtonStyles1["Danger"] = 4] = "Danger";
    ButtonStyles1[ButtonStyles1["Link"] = 5] = "Link";
})(ButtonStyles2 || (ButtonStyles2 = {}));
var MessageActivityTypes;
(function(MessageActivityTypes1) {
    MessageActivityTypes1[MessageActivityTypes1["Join"] = 1] = "Join";
    MessageActivityTypes1[MessageActivityTypes1["Spectate"] = 2] = "Spectate";
    MessageActivityTypes1[MessageActivityTypes1["Listen"] = 3] = "Listen";
    MessageActivityTypes1[MessageActivityTypes1["JoinRequest"] = 4] = "JoinRequest";
})(MessageActivityTypes || (MessageActivityTypes = {}));
var MessageFlags;
(function(MessageFlags1) {
    MessageFlags1[MessageFlags1["Crossposted"] = 1] = "Crossposted";
    MessageFlags1[MessageFlags1["IsCrosspost"] = 2] = "IsCrosspost";
    MessageFlags1[MessageFlags1["SuppressEmbeds"] = 4] = "SuppressEmbeds";
    MessageFlags1[MessageFlags1["SourceMessageDeleted"] = 8] = "SourceMessageDeleted";
    MessageFlags1[MessageFlags1["Urgent"] = 16] = "Urgent";
    MessageFlags1[MessageFlags1["HasThread"] = 32] = "HasThread";
    MessageFlags1[MessageFlags1["Empheral"] = 64] = "Empheral";
    MessageFlags1[MessageFlags1["Loading"] = 128] = "Loading";
})(MessageFlags || (MessageFlags = {}));
var MessageTypes;
(function(MessageTypes1) {
    MessageTypes1[MessageTypes1["Default"] = 0] = "Default";
    MessageTypes1[MessageTypes1["RecipientAdd"] = 1] = "RecipientAdd";
    MessageTypes1[MessageTypes1["RecipientRemove"] = 2] = "RecipientRemove";
    MessageTypes1[MessageTypes1["Call"] = 3] = "Call";
    MessageTypes1[MessageTypes1["ChannelNameChange"] = 4] = "ChannelNameChange";
    MessageTypes1[MessageTypes1["ChannelIconChange"] = 5] = "ChannelIconChange";
    MessageTypes1[MessageTypes1["ChannelPinnedMessage"] = 6] = "ChannelPinnedMessage";
    MessageTypes1[MessageTypes1["GuildMemberJoin"] = 7] = "GuildMemberJoin";
    MessageTypes1[MessageTypes1["UserPremiumGuildSubscription"] = 8] = "UserPremiumGuildSubscription";
    MessageTypes1[MessageTypes1["UserPremiumGuildSubscriptionTier1"] = 9] = "UserPremiumGuildSubscriptionTier1";
    MessageTypes1[MessageTypes1["UserPremiumGuildSubscriptionTier2"] = 10] = "UserPremiumGuildSubscriptionTier2";
    MessageTypes1[MessageTypes1["UserPremiumGuildSubscriptionTier3"] = 11] = "UserPremiumGuildSubscriptionTier3";
    MessageTypes1[MessageTypes1["ChannelFollowAdd"] = 12] = "ChannelFollowAdd";
    MessageTypes1[MessageTypes1["GuildDiscoveryDisqualified"] = 14] = "GuildDiscoveryDisqualified";
    MessageTypes1[MessageTypes1["GuildDiscoveryRequalified"] = 15] = "GuildDiscoveryRequalified";
    MessageTypes1[MessageTypes1["GuildDiscoveryGracePeriodInitialWarning"] = 16] = "GuildDiscoveryGracePeriodInitialWarning";
    MessageTypes1[MessageTypes1["GuildDiscoveryGracePeriodFinalWarning"] = 17] = "GuildDiscoveryGracePeriodFinalWarning";
    MessageTypes1[MessageTypes1["ThreadCreated"] = 18] = "ThreadCreated";
    MessageTypes1[MessageTypes1["Reply"] = 19] = "Reply";
    MessageTypes1[MessageTypes1["ChatInputCommand"] = 20] = "ChatInputCommand";
    MessageTypes1[MessageTypes1["ThreadStarterMessage"] = 21] = "ThreadStarterMessage";
    MessageTypes1[MessageTypes1["GuildInviteReminder"] = 22] = "GuildInviteReminder";
    MessageTypes1[MessageTypes1["ContextMenuCommand"] = 23] = "ContextMenuCommand";
})(MessageTypes || (MessageTypes = {}));
var StickerFormatTypes;
(function(StickerFormatTypes1) {
    StickerFormatTypes1[StickerFormatTypes1["Png"] = 1] = "Png";
    StickerFormatTypes1[StickerFormatTypes1["Apng"] = 2] = "Apng";
    StickerFormatTypes1[StickerFormatTypes1["Lottie"] = 3] = "Lottie";
})(StickerFormatTypes || (StickerFormatTypes = {}));
var StickerTypes;
(function(StickerTypes1) {
    StickerTypes1[StickerTypes1["Standard"] = 1] = "Standard";
    StickerTypes1[StickerTypes1["Guild"] = 2] = "Guild";
})(StickerTypes || (StickerTypes = {}));
var TeamMembershipStates;
(function(TeamMembershipStates1) {
    TeamMembershipStates1[TeamMembershipStates1["Invited"] = 1] = "Invited";
    TeamMembershipStates1[TeamMembershipStates1["Accepted"] = 2] = "Accepted";
})(TeamMembershipStates || (TeamMembershipStates = {}));
var PremiumTypes;
(function(PremiumTypes1) {
    PremiumTypes1[PremiumTypes1["None"] = 0] = "None";
    PremiumTypes1[PremiumTypes1["NitroClassic"] = 1] = "NitroClassic";
    PremiumTypes1[PremiumTypes1["Nitro"] = 2] = "Nitro";
})(PremiumTypes || (PremiumTypes = {}));
var UserFlags;
(function(UserFlags1) {
    UserFlags1[UserFlags1["None"] = 0] = "None";
    UserFlags1[UserFlags1["DiscordEmployee"] = 1] = "DiscordEmployee";
    UserFlags1[UserFlags1["ParteneredServerOwner"] = 2] = "ParteneredServerOwner";
    UserFlags1[UserFlags1["HypeSquadEvents"] = 4] = "HypeSquadEvents";
    UserFlags1[UserFlags1["BugHunterLevel1"] = 8] = "BugHunterLevel1";
    UserFlags1[UserFlags1["HouseBravery"] = 64] = "HouseBravery";
    UserFlags1[UserFlags1["HouseBrilliance"] = 128] = "HouseBrilliance";
    UserFlags1[UserFlags1["HouseBalance"] = 256] = "HouseBalance";
    UserFlags1[UserFlags1["EarlySupporter"] = 512] = "EarlySupporter";
    UserFlags1[UserFlags1["TeamUser"] = 1024] = "TeamUser";
    UserFlags1[UserFlags1["BugHunterLevel2"] = 16384] = "BugHunterLevel2";
    UserFlags1[UserFlags1["VerifiedBot"] = 65536] = "VerifiedBot";
    UserFlags1[UserFlags1["EarlyVerifiedBotDeveloper"] = 131072] = "EarlyVerifiedBotDeveloper";
    UserFlags1[UserFlags1["DiscordCertifiedModerator"] = 262144] = "DiscordCertifiedModerator";
    UserFlags1[UserFlags1["BotHttpInteractions"] = 524288] = "BotHttpInteractions";
})(UserFlags || (UserFlags = {}));
var VisibilityTypes;
(function(VisibilityTypes1) {
    VisibilityTypes1[VisibilityTypes1["None"] = 0] = "None";
    VisibilityTypes1[VisibilityTypes1["Everyone"] = 1] = "Everyone";
})(VisibilityTypes || (VisibilityTypes = {}));
var WebhookTypes;
(function(WebhookTypes1) {
    WebhookTypes1[WebhookTypes1["Incoming"] = 1] = "Incoming";
    WebhookTypes1[WebhookTypes1["ChannelFollower"] = 2] = "ChannelFollower";
    WebhookTypes1[WebhookTypes1["Application"] = 3] = "Application";
})(WebhookTypes || (WebhookTypes = {}));
function setupCacheRemovals(bot) {
    const { CHANNEL_DELETE , GUILD_BAN_ADD , GUILD_DELETE , GUILD_EMOJIS_UPDATE , GUILD_MEMBER_REMOVE , GUILD_ROLE_DELETE , MESSAGE_DELETE_BULK ,  } = bot.handlers;
    bot.handlers.GUILD_DELETE = function(_, data3, shardId) {
        const payload = data3.d;
        const id = bot.transformers.snowflake(payload.id);
        bot.guilds.delete(id);
        bot.channels.forEach((channel)=>{
            if (channel.guildId === id) bot.channels.delete(channel.id);
        });
        bot.members.forEach((member)=>{
            if (member.guildId === id) bot.members.delete(member.id);
        });
        bot.messages.forEach((message)=>{
            if (message.guildId === id) bot.messages.delete(message.id);
        });
        GUILD_DELETE(bot, data3, shardId);
    };
    bot.handlers.CHANNEL_DELETE = function(_, data4, shardId) {
        const payload = data4.d;
        CHANNEL_DELETE(bot, data4, shardId);
        const id = bot.transformers.snowflake(payload.id);
        bot.channels.delete(id);
        bot.messages.forEach((message)=>{
            if (message.channelId === id) bot.messages.delete(message.id);
        });
    };
    bot.handlers.GUILD_MEMBER_REMOVE = function(_, data5, shardId) {
        const payload = data5.d;
        bot.members.delete(bot.transformers.snowflake(payload.user.id));
        GUILD_MEMBER_REMOVE(bot, data5, shardId);
    };
    bot.handlers.GUILD_BAN_ADD = function(_, data6, shardId) {
        const payload = data6.d;
        bot.members.delete(bot.transformers.snowflake(payload.user.id));
        GUILD_BAN_ADD(bot, data6, shardId);
    };
    bot.handlers.GUILD_EMOJIS_UPDATE = function(_, data7, shardId) {
        const payload = data7.d;
        const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));
        if (guild) {
            guild.emojis = new Collection(payload.emojis.map((e)=>{
                const emoji = bot.transformers.emoji(bot, e);
                return [
                    emoji.id,
                    emoji
                ];
            }));
        }
        GUILD_EMOJIS_UPDATE(bot, data7, shardId);
    };
    bot.handlers.MESSAGE_DELETE = function(_, data8) {
        const payload = data8.d;
        const id = bot.transformers.snowflake(payload.id);
        const message = bot.messages.get(id);
        bot.events.messageDelete(bot, {
            id,
            channelId: bot.transformers.snowflake(payload.channel_id),
            guildId: payload.guild_id ? bot.transformers.snowflake(payload.guild_id) : undefined
        }, message);
        bot.messages.delete(id);
    };
    bot.handlers.MESSAGE_DELETE_BULK = function(_, data9, shardId) {
        const payload = data9.d;
        payload.ids.forEach((id)=>bot.messages.delete(bot.transformers.snowflake(id))
        );
        MESSAGE_DELETE_BULK(bot, data9, shardId);
    };
    bot.handlers.GUILD_ROLE_DELETE = function(_, data10, shardId) {
        const payload = data10.d;
        const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));
        const id = bot.transformers.snowflake(payload.role_id);
        if (guild) {
            guild.roles.delete(id);
            bot.members.forEach((member)=>{
                if (member.guildId !== guild.id) return;
                if (!member.roles.includes(id)) return;
                member.roles = member.roles.filter((roleId)=>roleId !== id
                );
            });
        }
        GUILD_ROLE_DELETE(bot, data10, shardId);
    };
}
function addCacheCollections(bot) {
    const cacheBot = bot;
    cacheBot.guilds = new Collection();
    cacheBot.users = new Collection();
    cacheBot.members = new Collection();
    cacheBot.channels = new Collection();
    cacheBot.messages = new Collection();
    cacheBot.presences = new Collection();
    cacheBot.dispatchedGuildIds = new Set();
    cacheBot.dispatchedChannelIds = new Set();
    cacheBot.activeGuildIds = new Set();
    return bot;
}
function setupCacheEdits(bot) {
    const { GUILD_MEMBER_ADD , GUILD_MEMBER_REMOVE  } = bot.handlers;
    bot.handlers.GUILD_MEMBER_ADD = function(_, data11, shardId) {
        const payload = data11.d;
        const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));
        if (guild) guild.memberCount++;
        GUILD_MEMBER_ADD(bot, data11, shardId);
    };
    bot.handlers.GUILD_MEMBER_REMOVE = function(_, data12, shardId) {
        const payload = data12.d;
        const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));
        if (guild) guild.memberCount--;
        GUILD_MEMBER_REMOVE(bot, data12, shardId);
    };
}
const processing = new Set();
async function dispatchRequirements(bot, data13) {
    if (data13.t && [
        "GUILD_CREATE",
        "GUILD_DELETE"
    ].includes(data13.t)) return;
    const id = bot.utils.snowflakeToBigint((data13.t && [
        "GUILD_UPDATE"
    ].includes(data13.t) ? data13.d?.id : data13.d?.guild_id) ?? "");
    if (!id || bot.activeGuildIds.has(id)) return;
    if (bot.guilds.has(id)) {
        bot.activeGuildIds.add(id);
        return;
    }
    if (processing.has(id)) {
        bot.events.debug(`[DISPATCH] New Guild ID already being processed: ${id} in ${data13.t} event`);
        let runs = 0;
        do {
            await bot.utils.delay(500);
            runs++;
        }while (processing.has(id) && runs < 40)
        if (!processing.has(id)) return;
        return bot.events.debug(`[DISPATCH] Already processed guild was not successfully fetched:  ${id} in ${data13.t} event`);
    }
    processing.add(id);
    bot.events.debug(`[DISPATCH] New Guild ID has appeared: ${id} in ${data13.t} event`);
    const guild = await bot.helpers.getGuild(id, {
        counts: true
    }).catch(console.log);
    if (!guild) {
        processing.delete(id);
        return bot.events.debug(`[DISPATCH] Guild ID ${id} failed to fetch.`);
    }
    bot.events.debug(`[DISPATCH] Guild ID ${id} has been found. ${guild.name}`);
    const [channels, botMember] = await Promise.all([
        bot.helpers.getChannels(id),
        bot.helpers.getMember(id, bot.id), 
    ]).catch((error)=>{
        bot.events.debug(error);
        return [];
    });
    if (!botMember || !channels) {
        processing.delete(id);
        return bot.events.debug(`[DISPATCH] Guild ID ${id} Name: ${guild.name} failed. Unable to get botMember or channels`);
    }
    bot.guilds.set(id, guild);
    bot.dispatchedGuildIds.delete(id);
    channels.forEach((channel)=>{
        bot.dispatchedChannelIds.delete(channel.id);
        bot.channels.set(channel.id, channel);
    });
    bot.members.set(bot.transformers.snowflake(`${botMember.id}${guild.id}`), botMember);
    processing.delete(id);
    bot.events.debug(`[DISPATCH] Guild ID ${id} Name: ${guild.name} completely loaded.`);
}
function enableCacheSweepers(bot1) {
    bot1.guilds.startSweeper({
        filter: function(guild, _, bot) {
            if (bot.activeGuildIds.delete(guild.id)) return false;
            bot.dispatchedGuildIds.add(guild.id);
            return true;
        },
        interval: 3660000,
        bot: bot1
    });
    bot1.channels.startSweeper({
        filter: function channelSweeper(channel, key, bot) {
            if (channel.guildId && bot.dispatchedGuildIds.has(channel.guildId)) {
                bot.dispatchedChannelIds.add(channel.id);
                return true;
            }
            if (!channel.guildId && !bot.members.has(key)) return true;
            return false;
        },
        interval: 3660000,
        bot: bot1
    });
    bot1.members.startSweeper({
        filter: function memberSweeper(member, _, bot) {
            if (member.id === bot.id) return false;
            return Date.now() - member.cachedAt > 1800000;
        },
        interval: 300000,
        bot: bot1
    });
    bot1.messages.startSweeper({
        filter: function messageSweeper(message) {
            if (!message.guildId) return true;
            return Date.now() - message.timestamp > 600000;
        },
        interval: 300000,
        bot: bot1
    });
    bot1.presences.startSweeper({
        filter: ()=>true
        ,
        interval: 300000,
        bot: bot1
    });
    const handleDiscordPayloadOld = bot1.gateway.handleDiscordPayload;
    bot1.gateway.handleDiscordPayload = async function(_, data14, shardId) {
        await dispatchRequirements(bot1, data14);
        handleDiscordPayloadOld(_, data14, shardId);
    };
}
function enableCachePlugin(rawBot) {
    rawBot.enabledPlugins.add("CACHE");
    const bot = addCacheCollections(rawBot);
    const { guild: guild1 , user: user1 , member , channel: channel1 , message , presence , role  } = bot.transformers;
    bot.transformers.guild = function(_, payload) {
        const result = guild1(bot, payload);
        if (result) {
            bot.guilds.set(result.id, result);
            const channels = payload.guild.channels || [];
            channels.forEach((channel)=>{
                bot.transformers.channel(bot, {
                    channel,
                    guildId: result.id
                });
            });
        }
        return result;
    };
    bot.transformers.user = function(...args) {
        const result = user1(...args);
        if (result) {
            bot.users.set(result.id, result);
        }
        return result;
    };
    bot.transformers.member = function(...args) {
        const result = member(...args);
        if (result) {
            bot.members.set(bot.transformers.snowflake(`${result.id}${result.guildId}`), result);
        }
        return result;
    };
    bot.transformers.channel = function(...args) {
        const result = channel1(...args);
        if (result) {
            bot.channels.set(result.id, result);
        }
        return result;
    };
    bot.transformers.message = function(_, payload) {
        const result = message(bot, payload);
        if (result) {
            bot.messages.set(result.id, result);
            const user = bot.transformers.user(bot, payload.author);
            bot.users.set(user.id, user);
            if (payload.guild_id && payload.member) {
                const guildId = bot.transformers.snowflake(payload.guild_id);
                bot.members.set(bot.transformers.snowflake(`${payload.author.id}${payload.guild_id}`), bot.transformers.member(bot, payload.member, guildId, user.id));
            }
        }
        return result;
    };
    bot.transformers.presence = function(...args) {
        const result = presence(...args);
        if (result) {
            bot.presences.set(result.user.id, result);
        }
        return result;
    };
    bot.transformers.role = function(...args) {
        const result = role(...args);
        if (result) {
            bot.guilds.get(result.guildId)?.roles.set(result.id, result);
        }
        return result;
    };
    const { GUILD_EMOJIS_UPDATE  } = bot.handlers;
    bot.handlers.GUILD_EMOJIS_UPDATE = function(_, data15, shardId) {
        const payload = data15.d;
        const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));
        if (guild) {
            guild.emojis = new Collection(payload.emojis.map((e)=>{
                const emoji = bot.transformers.emoji(bot, e);
                return [
                    emoji.id,
                    emoji
                ];
            }));
        }
        GUILD_EMOJIS_UPDATE(bot, data15, shardId);
    };
    setupCacheRemovals(bot);
    setupCacheEdits(bot);
    return bot;
}
function calculateBasePermissions(bot, guildOrId, memberOrId) {
    const guild = typeof guildOrId === "bigint" ? bot.guilds.get(guildOrId) : guildOrId;
    const member = typeof memberOrId === "bigint" ? bot.members.get(memberOrId) : memberOrId;
    if (!guild || !member) return 8n;
    let permissions = 0n;
    permissions |= [
        ...member.roles,
        guild.id
    ].map((id)=>guild.roles.get(id)?.permissions
    ).filter((perm)=>perm
    ).reduce((bits, perms)=>{
        bits |= perms;
        return bits;
    }, 0n) || 0n;
    if (guild.ownerId === member.id) permissions |= 8n;
    return permissions;
}
function calculateChannelOverwrites(bot, channelOrId, memberOrId) {
    const channel = typeof channelOrId === "bigint" ? bot.channels.get(channelOrId) : channelOrId;
    if (!channel?.guildId) return 8n;
    const member = typeof memberOrId === "bigint" ? bot.members.get(memberOrId) : memberOrId;
    if (!channel || !member) return 8n;
    let permissions = calculateBasePermissions(bot, channel.guildId, member);
    const overwriteEveryone = channel.permissionOverwrites?.find((overwrite)=>{
        const [_, id] = separateOverwrites(overwrite);
        return id === channel.guildId;
    });
    if (overwriteEveryone) {
        const [_type, _id, allow, deny] = separateOverwrites(overwriteEveryone);
        permissions &= ~deny;
        permissions |= allow;
    }
    const overwrites = channel.permissionOverwrites;
    let allow = 0n;
    let deny = 0n;
    const memberRoles = member.roles || [];
    for (const overwrite1 of overwrites || []){
        const [_type, id, allowBits, denyBits] = separateOverwrites(overwrite1);
        if (!memberRoles.includes(id)) continue;
        deny |= denyBits;
        allow |= allowBits;
    }
    permissions &= ~deny;
    permissions |= allow;
    const overwriteMember = overwrites?.find((overwrite)=>{
        const [_, id] = separateOverwrites(overwrite);
        return id === member.id;
    });
    if (overwriteMember) {
        const [_type, _id, allowBits, denyBits] = separateOverwrites(overwriteMember);
        permissions &= ~denyBits;
        permissions |= allowBits;
    }
    return permissions;
}
function missingPermissions(permissionBits, permissions) {
    if (permissionBits & 8n) return [];
    return permissions.filter((permission)=>!(permissionBits & BigInt(BitwisePermissionFlags[permission]))
    );
}
function getMissingGuildPermissions(bot, guild, member, permissions) {
    const permissionBits = calculateBasePermissions(bot, guild, member);
    return missingPermissions(permissionBits, permissions);
}
function getMissingChannelPermissions(bot, channel, member, permissions) {
    const permissionBits = calculateChannelOverwrites(bot, channel, member);
    return missingPermissions(permissionBits, permissions);
}
function requireGuildPermissions(bot, guild, member, permissions) {
    const missing = getMissingGuildPermissions(bot, guild, member, permissions);
    if (missing.length) {
        throw new Error(`Missing Permissions: ${missing.join(" & ")}`);
    }
}
function requireBotGuildPermissions(bot, guild, permissions) {
    return requireGuildPermissions(bot, guild, bot.id, permissions);
}
function requireChannelPermissions(bot, channel, member, permissions) {
    const missing = getMissingChannelPermissions(bot, channel, member, permissions);
    if (missing.length) {
        throw new Error(`Missing Permissions: ${missing.join(" & ")}`);
    }
}
function requireBotChannelPermissions(bot, channel, permissions) {
    return requireChannelPermissions(bot, channel, bot.id, permissions);
}
function highestRole(bot, guildOrId, memberOrId) {
    const guild = typeof guildOrId === "bigint" ? bot.guilds.get(guildOrId) : guildOrId;
    if (!guild) throw new Error(Errors.GUILD_NOT_FOUND);
    const memberRoles = (typeof memberOrId === "bigint" ? bot.members.get(memberOrId) : memberOrId)?.roles;
    if (!memberRoles) return guild.roles.get(guild.id);
    let memberHighestRole;
    for (const roleId of memberRoles){
        const role = guild.roles.get(roleId);
        if (!role) continue;
        if (!memberHighestRole || memberHighestRole.position < role.position || memberHighestRole.position === role.position) {
            memberHighestRole = role;
        }
    }
    return memberHighestRole;
}
function higherRolePosition(bot, guildOrId, roleId, otherRoleId) {
    const guild = typeof guildOrId === "bigint" ? bot.guilds.get(guildOrId) : guildOrId;
    if (!guild) return true;
    const role = guild.roles.get(roleId);
    const otherRole = guild.roles.get(otherRoleId);
    if (!role || !otherRole) throw new Error(Errors.ROLE_NOT_FOUND);
    if (role.position === otherRole.position) {
        return role.id < otherRole.id;
    }
    return role.position > otherRole.position;
}
function addToThread(bot) {
    const addToThreadOld = bot.helpers.addToThread;
    bot.helpers.addToThread = async function(threadId, userId) {
        if (userId === bot.id) {
            throw new Error("To add the bot to a thread, you must use bot.helpers.joinThread()");
        }
        const channel = bot.channels.get(threadId);
        if (channel) {
            if (channel.archived) {
                throw new Error("Cannot add user to thread if thread is archived.");
            }
            await requireBotChannelPermissions(bot, channel, [
                "SEND_MESSAGES"
            ]);
        }
        return addToThreadOld(threadId, userId);
    };
}
function getArchivedThreads(bot) {
    const getArchivedThreadsOld = bot.helpers.getArchivedThreads;
    bot.helpers.getArchivedThreads = async function(channelId, options) {
        const channel = await bot.channels.get(channelId);
        if (channel) {
            await requireBotChannelPermissions(bot, channel, options?.type === "private" ? [
                "READ_MESSAGE_HISTORY",
                "MANAGE_THREADS"
            ] : [
                "READ_MESSAGE_HISTORY"
            ]);
        }
        return getArchivedThreadsOld(channelId, options);
    };
}
function getThreadMembers(bot) {
    const getThreadMembersOld = bot.helpers.getThreadMembers;
    bot.helpers.getThreadMembers = function(threadId) {
        const hasIntent = bot.intents & GatewayIntents.GuildMembers;
        if (!hasIntent) {
            throw new Error("The get thread members endpoint requires GuildMembers intent.");
        }
        return getThreadMembersOld(threadId);
    };
}
function joinThread(bot) {
    const joinThreadOld = bot.helpers.joinThread;
    bot.helpers.joinThread = function(threadId) {
        const channel = bot.channels.get(threadId);
        if (channel && !channel.archived) {
            throw new Error("You can not join an archived channel.");
        }
        return joinThreadOld(threadId);
    };
}
function leaveThread(bot) {
    const leaveThreadOld = bot.helpers.leaveThread;
    bot.helpers.leaveThread = function(threadId) {
        const channel = bot.channels.get(threadId);
        if (channel && !channel.archived) {
            throw new Error("You can not leave an archived channel.");
        }
        return leaveThreadOld(threadId);
    };
}
function removeThreadMember(bot) {
    const removeThreadMemberOld = bot.helpers.removeThreadMember;
    bot.helpers.removeThreadMember = async function(threadId, userId) {
        if (userId === bot.id) {
            throw new Error("To remove the bot from a thread, you must use bot.helpers.leaveThread()");
        }
        const channel = bot.channels.get(threadId);
        if (channel) {
            if (channel.archived) {
                throw new Error("Cannot remove user from thread if thread is archived.");
            }
            if (!(bot.id === channel.ownerId && channel.type === ChannelTypes.GuildPrivateThread)) {
                await requireBotChannelPermissions(bot, channel, [
                    "MANAGE_MESSAGES"
                ]);
            }
        }
        return removeThreadMemberOld(threadId, userId);
    };
}
function setupThreadPermChecks(bot) {
    addToThread(bot);
    getArchivedThreads(bot);
    getThreadMembers(bot);
    joinThread(bot);
    leaveThread(bot);
    removeThreadMember(bot);
}
function createStageInstance(bot) {
    const createStageInstanceOld = bot.helpers.createStageInstance;
    bot.helpers.createStageInstance = function(channelId, topic, privacyLevel) {
        if (!bot.utils.validateLength(topic, {
            max: 120,
            min: 1
        })) {
            throw new Error("The topic length for creating a stage instance must be between 1-120.");
        }
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_CHANNELS",
            "MUTE_MEMBERS",
            "MOVE_MEMBERS", 
        ]);
        return createStageInstanceOld(channelId, topic, privacyLevel);
    };
}
function deleteStageInstance(bot) {
    const deleteStageInstanceOld = bot.helpers.deleteStageInstance;
    bot.helpers.deleteStageInstance = function(channelId) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_CHANNELS",
            "MUTE_MEMBERS",
            "MOVE_MEMBERS", 
        ]);
        return deleteStageInstanceOld(channelId);
    };
}
function updateStageInstance(bot) {
    const updateStageInstanceOld = bot.helpers.updateStageInstance;
    bot.helpers.updateStageInstance = function(channelId, data16) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_CHANNELS",
            "MUTE_MEMBERS",
            "MOVE_MEMBERS", 
        ]);
        return updateStageInstanceOld(channelId, data16);
    };
}
function setupStagePermChecks(bot) {
    createStageInstance(bot);
    deleteStageInstance(bot);
    updateStageInstance(bot);
}
function deleteChannel(bot) {
    const deleteChannelOld = bot.helpers.deleteChannel;
    bot.helpers.deleteChannel = function(channelId, reason) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            const guild = bot.guilds.get(channel.guildId);
            if (!guild) throw new Error("GUILD_NOT_FOUND");
            if (guild.rulesChannelId === channelId) {
                throw new Error("RULES_CHANNEL_CANNOT_BE_DELETED");
            }
            if (guild.publicUpdatesChannelId === channelId) {
                throw new Error("UPDATES_CHANNEL_CANNOT_BE_DELETED");
            }
            const isThread = [
                ChannelTypes.GuildNewsThread,
                ChannelTypes.GuildPublicThread,
                ChannelTypes.GuildPrivateThread, 
            ].includes(channel.type);
            requireBotGuildPermissions(bot, guild, isThread ? [
                "MANAGE_THREADS"
            ] : [
                "MANAGE_CHANNELS"
            ]);
        }
        return deleteChannelOld(channelId, reason);
    };
}
function deleteChannelOverwrite(bot) {
    const deleteChannelOverwriteOld = bot.helpers.deleteChannelOverwrite;
    bot.helpers.deleteChannelOverwrite = function(channelId, overwriteId) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channelId, [
                "MANAGE_ROLES"
            ]);
        }
        return deleteChannelOverwriteOld(channelId, overwriteId);
    };
}
function editChannel(bot) {
    const editChannelOld = bot.helpers.editChannel;
    bot.helpers.editChannel = function(channelId, options, reason) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            const guild = bot.guilds.get(channel.guildId);
            if (options.rateLimitPerUser && options.rateLimitPerUser > 21600) {
                throw new Error("Amount of seconds a user has to wait before sending another message must be between 0-21600");
            }
            if (options.name) {
                if (!bot.utils.validateLength(options.name, {
                    min: 1,
                    max: 100
                })) {
                    throw new Error("The channel name must be between 1-100 characters.");
                }
            }
            const isThread = [
                ChannelTypes.GuildNewsThread,
                ChannelTypes.GuildPublicThread,
                ChannelTypes.GuildPrivateThread, 
            ].includes(channel.type);
            const requiredPerms = [];
            if (isThread) {
                if (options.invitable !== undefined && channel.type !== ChannelTypes.GuildPrivateThread) {
                    throw new Error("Invitable option is only allowed on private threads.");
                }
                if (!channel.locked && options.archived === false) {
                    requiredPerms.push("SEND_MESSAGES");
                    if (Object.keys(options).length > 1) {
                        requiredPerms.push("MANAGE_THREADS");
                    }
                } else {
                    requiredPerms.push("MANAGE_THREADS");
                }
            } else {
                requiredPerms.push("MANAGE_CHANNELS");
                if (options.permissionOverwrites) {
                    requiredPerms.push("MANAGE_ROLES");
                }
                if (options.type) {
                    if ([
                        ChannelTypes.GuildNews,
                        ChannelTypes.GuildText
                    ].includes(options.type)) {
                        throw new Error("Only news and text types can be modified.");
                    }
                    if (guild && !guild.features.includes(GuildFeatures.News)) {
                        throw new Error("The NEWS feature is missing in this guild to be able to modify the channel type.");
                    }
                }
                if (options.topic) {
                    if (!bot.utils.validateLength(options.topic, {
                        min: 1,
                        max: 1024
                    })) {
                        throw new Error("The topic must be a number between 1 and 1024");
                    }
                }
                if (options.userLimit && options.userLimit > 99) {
                    throw new Error("The user limit must be less than 99.");
                }
                if (options.parentId) {
                    const category = bot.channels.get(options.parentId);
                    if (category && category.type !== ChannelTypes.GuildCategory) {
                        throw new Error("The parent id must be for a category channel type.");
                    }
                }
            }
            requireBotChannelPermissions(bot, channel, requiredPerms);
            if (options.autoArchiveDuration) {
                if (guild) {
                    if (!guild.features.includes(options.autoArchiveDuration === 4320 ? GuildFeatures.ThreeDayThreadArchive : GuildFeatures.SevenDayThreadArchive)) {
                        throw new Error("The 3 day and 7 day archive durations require the server to be boosted");
                    }
                }
            }
        }
        return editChannelOld(channelId, options, reason);
    };
}
function editChannelOverwrite(bot) {
    const editChannelOverwriteOld = bot.helpers.editChannelOverwrite;
    bot.helpers.editChannelOverwrite = function(channelId, overwriteId, options) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channelId, [
                "MANAGE_ROLES"
            ]);
        }
        return editChannelOverwriteOld(channelId, overwriteId, options);
    };
}
function followChannel(bot) {
    const followChannelOld = bot.helpers.followChannel;
    bot.helpers.followChannel = function(sourceChannelId, targetChannelId) {
        const channel = bot.channels.get(targetChannelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channel, [
                "MANAGE_WEBHOOKS"
            ]);
        }
        return followChannelOld(sourceChannelId, targetChannelId);
    };
}
function getChannelWebhooks(bot) {
    const getChannelWebhooksOld = bot.helpers.getChannelWebhooks;
    bot.helpers.getChannelWebhooks = function(channelId) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channelId, [
                "MANAGE_WEBHOOKS"
            ]);
        }
        return getChannelWebhooksOld(channelId);
    };
}
function swapChannels(bot) {
    const swapChannelsOld = bot.helpers.swapChannels;
    bot.helpers.swapChannels = function(guildId, channelPositions) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_CHANNELS"
        ]);
        return swapChannelsOld(guildId, channelPositions);
    };
}
function setupChannelPermChecks(bot) {
    setupThreadPermChecks(bot);
    setupStagePermChecks(bot);
    deleteChannel(bot);
    deleteChannelOverwrite(bot);
    editChannel(bot);
    editChannelOverwrite(bot);
    followChannel(bot);
    getChannelWebhooks(bot);
    swapChannels(bot);
}
function addDiscoverySubcategory(bot) {
    const addDiscoverySubcategoryOld = bot.helpers.addDiscoverySubcategory;
    bot.helpers.addDiscoverySubcategory = function(guildId, categoryId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return addDiscoverySubcategoryOld(guildId, categoryId);
    };
}
function removeDiscoverySubcategory(bot) {
    const removeDiscoverySubcategoryOld = bot.helpers.removeDiscoverySubcategory;
    bot.helpers.removeDiscoverySubcategory = function(guildId, categoryId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return removeDiscoverySubcategoryOld(guildId, categoryId);
    };
}
function getDiscovery(bot) {
    const getDiscoveryOld = bot.helpers.getDiscovery;
    bot.helpers.getDiscovery = function(guildId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return getDiscoveryOld(guildId);
    };
}
function editDiscovery(bot) {
    const editDiscoveryOld = bot.helpers.editDiscovery;
    bot.helpers.editDiscovery = function(guildId, data17) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return editDiscoveryOld(guildId, data17);
    };
}
function setupDiscoveryPermChecks(bot) {
    addDiscoverySubcategory(bot);
    editDiscovery(bot);
    getDiscovery(bot);
    removeDiscoverySubcategory(bot);
}
function editMember(bot) {
    const editMemberOld = bot.helpers.editMember;
    bot.helpers.editMember = async function(guildId, memberId, options) {
        const requiredPerms = new Set();
        if (options.nick) {
            if (options.nick.length > 32) {
                throw new Error("NICKNAMES_MAX_LENGTH");
            }
            requiredPerms.add("MANAGE_NICKNAMES");
        }
        if (options.roles) requiredPerms.add("MANAGE_ROLES");
        if (options.mute !== undefined || options.deaf !== undefined || options.channelId !== undefined) {
            const memberVoiceState = (await bot.guilds.get(guildId))?.voiceStates.get(memberId);
            if (!memberVoiceState?.channelId) {
                throw new Error("MEMBER_NOT_IN_VOICE_CHANNEL");
            }
            if (options.mute !== undefined) {
                requiredPerms.add("MUTE_MEMBERS");
            }
            if (options.deaf !== undefined) {
                requiredPerms.add("DEAFEN_MEMBERS");
            }
            if (options.channelId) {
                const requiredVoicePerms = new Set([
                    "CONNECT",
                    "MOVE_MEMBERS", 
                ]);
                if (memberVoiceState) {
                    await requireBotChannelPermissions(bot, memberVoiceState?.channelId, [
                        ...requiredVoicePerms, 
                    ]);
                }
                await requireBotChannelPermissions(bot, options.channelId, [
                    ...requiredVoicePerms, 
                ]);
            }
        }
        await requireBotGuildPermissions(bot, guildId, [
            ...requiredPerms, 
        ]);
        return editMemberOld(guildId, memberId, options);
    };
}
function createEmoji(bot) {
    const createEmojiOld = bot.helpers.createEmoji;
    bot.helpers.createEmoji = function(guildId, id) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_EMOJIS"
        ]);
        return createEmojiOld(guildId, id);
    };
}
function deleteEmoji(bot) {
    const deleteEmojiOld = bot.helpers.deleteEmoji;
    bot.helpers.deleteEmoji = function(guildId, id) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_EMOJIS"
        ]);
        return deleteEmojiOld(guildId, id);
    };
}
function editEmoji(bot) {
    const editEmojiOld = bot.helpers.editEmoji;
    bot.helpers.editEmoji = function(guildId, id, options) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_EMOJIS"
        ]);
        return editEmojiOld(guildId, id, options);
    };
}
function setupEmojiPermChecks(bot) {
    createEmoji(bot);
    deleteEmoji(bot);
    editEmoji(bot);
}
function createScheduledEvent(bot) {
    const createScheduledEventOld = bot.helpers.createScheduledEvent;
    bot.helpers.createScheduledEvent = function(guildId, options) {
        if (options.entityType === ScheduledEventEntityType.StageInstance) {
            if (!options.channelId) {
                throw new Error("A channel id is required for creating a stage scheduled event.");
            }
            requireBotChannelPermissions(bot, options.channelId, [
                "MANAGE_CHANNELS",
                "MUTE_MEMBERS",
                "MOVE_MEMBERS", 
            ]);
            try {
                requireBotGuildPermissions(bot, guildId, [
                    "MANAGE_EVENTS", 
                ]);
            } catch  {
                requireBotChannelPermissions(bot, options.channelId, [
                    "MANAGE_EVENTS", 
                ]);
            }
            return createScheduledEventOld(guildId, options);
        }
        if (options.entityType === ScheduledEventEntityType.Voice) {
            if (!options.channelId) {
                throw new Error("A channel id is required for creating a voice scheduled event.");
            }
            requireBotChannelPermissions(bot, options.channelId, [
                "VIEW_CHANNEL",
                "CONNECT", 
            ]);
            try {
                requireBotGuildPermissions(bot, guildId, [
                    "MANAGE_EVENTS", 
                ]);
            } catch  {
                requireBotChannelPermissions(bot, options.channelId, [
                    "MANAGE_EVENTS", 
                ]);
            }
            return createScheduledEventOld(guildId, options);
        }
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_EVENTS", 
        ]);
        return createScheduledEventOld(guildId, options);
    };
}
function editScheduledEvent(bot) {
    const editScheduledEventOld = bot.helpers.editScheduledEvent;
    bot.helpers.editScheduledEvent = function(guildId, eventId, options) {
        if (options.entityType === ScheduledEventEntityType.StageInstance) {
            if (!options.channelId) {
                throw new Error("A channel id is required for creating a stage scheduled event.");
            }
            requireBotChannelPermissions(bot, options.channelId, [
                "MANAGE_CHANNELS",
                "MUTE_MEMBERS",
                "MOVE_MEMBERS", 
            ]);
            try {
                requireBotGuildPermissions(bot, guildId, [
                    "MANAGE_EVENTS", 
                ]);
            } catch  {
                requireBotChannelPermissions(bot, options.channelId, [
                    "MANAGE_EVENTS", 
                ]);
            }
            return editScheduledEventOld(guildId, eventId, options);
        }
        if (options.entityType === ScheduledEventEntityType.Voice) {
            if (!options.channelId) {
                throw new Error("A channel id is required for creating a voice scheduled event.");
            }
            requireBotChannelPermissions(bot, options.channelId, [
                "VIEW_CHANNEL",
                "CONNECT", 
            ]);
            try {
                requireBotGuildPermissions(bot, guildId, [
                    "MANAGE_EVENTS", 
                ]);
            } catch  {
                requireBotChannelPermissions(bot, options.channelId, [
                    "MANAGE_EVENTS", 
                ]);
            }
            return editScheduledEventOld(guildId, eventId, options);
        }
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_EVENTS", 
        ]);
        return editScheduledEventOld(guildId, eventId, options);
    };
}
function setupEventsPermChecks(bot) {
    createScheduledEvent(bot);
    editScheduledEvent(bot);
}
function editWelcomeScreen(bot) {
    const editWelcomeScreenOld = bot.helpers.editWelcomeScreen;
    bot.helpers.editWelcomeScreen = function(guildId, options) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return editWelcomeScreenOld(guildId, options);
    };
}
function setupWelcomeScreenPermChecks(bot) {
    editWelcomeScreen(bot);
}
function editWidget(bot) {
    const editWidgetOld = bot.helpers.editWidget;
    bot.helpers.editWidget = function(guildId, enabled2, channelId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return editWidgetOld(guildId, enabled2, channelId);
    };
}
function setupWidgetPermChecks(bot) {
    editWidget(bot);
}
function createGuild(bot) {
    const createGuildOld = bot.helpers.createGuild;
    bot.helpers.createGuild = function(options) {
        if (bot.guilds.size > 10) {
            throw new Error("A bot can not create a guild if it is already in 10 guilds.");
        }
        if (options.name && !bot.utils.validateLength(options.name, {
            min: 2,
            max: 100
        })) {
            throw new Error("The guild name must be between 2 and 100 characters.");
        }
        return createGuildOld(options);
    };
}
function deleteGuild(bot) {
    const deleteGuildOld = bot.helpers.deleteGuild;
    bot.helpers.deleteGuild = function(guildId) {
        const guild = bot.guilds.get(guildId);
        if (guild && guild.ownerId !== bot.id) {
            throw new Error("A bot can only delete a guild it owns.");
        }
        return deleteGuildOld(guildId);
    };
}
function editGuild(bot) {
    const editGuildOld = bot.helpers.editGuild;
    bot.helpers.editGuild = function(guildId, options, shardId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return editGuildOld(guildId, options, shardId);
    };
}
function getAuditLogs(bot) {
    const getAuditLogsOld = bot.helpers.getAuditLogs;
    bot.helpers.getAuditLogs = function(guildId, options) {
        requireBotGuildPermissions(bot, guildId, [
            "VIEW_AUDIT_LOG"
        ]);
        return getAuditLogsOld(guildId, options);
    };
}
function getBan(bot) {
    const getBanOld = bot.helpers.getBan;
    bot.helpers.getBan = function(guildId, memberId) {
        requireBotGuildPermissions(bot, guildId, [
            "BAN_MEMBERS"
        ]);
        return getBanOld(guildId, memberId);
    };
}
function getBans(bot) {
    const getBansOld = bot.helpers.getBans;
    bot.helpers.getBans = function(guildId) {
        requireBotGuildPermissions(bot, guildId, [
            "BAN_MEMBERS"
        ]);
        return getBansOld(guildId);
    };
}
function getPruneCount(bot) {
    const getPruneCountOld = bot.helpers.getPruneCount;
    bot.helpers.getPruneCount = function(guildId, options) {
        requireBotGuildPermissions(bot, guildId, [
            "KICK_MEMBERS"
        ]);
        return getPruneCountOld(guildId, options);
    };
}
function getVanityUrl(bot) {
    const getVanityUrlOld = bot.helpers.getVanityUrl;
    bot.helpers.getVanityUrl = function(guildId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return getVanityUrlOld(guildId);
    };
}
function setupGuildPermChecks(bot) {
    setupEventsPermChecks(bot);
    createGuild(bot);
    deleteGuild(bot);
    editGuild(bot);
    setupWelcomeScreenPermChecks(bot);
    setupWidgetPermChecks(bot);
    getAuditLogs(bot);
    getBan(bot);
    getBans(bot);
    getPruneCount(bot);
    getVanityUrl(bot);
}
function deleteIntegration(bot) {
    const deleteIntegrationOld = bot.helpers.deleteIntegration;
    bot.helpers.deleteIntegration = function(guildId, id) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return deleteIntegrationOld(guildId, id);
    };
}
function getIntegrations(bot) {
    const getIntegrationsOld = bot.helpers.getIntegrations;
    bot.helpers.getIntegrations = function(guildId) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return getIntegrationsOld(guildId);
    };
}
function setupIntegrationPermChecks(bot) {
    deleteIntegration(bot);
    getIntegrations(bot);
}
function validateApplicationCommandOptions(bot, options) {
    const requiredOptions = [];
    const optionalOptions = [];
    for (const option of options){
        option.name = option.name.toLowerCase();
        if (option.choices?.length) {
            if (option.choices.length > 25) {
                throw new Error("Too many application command options provided.");
            }
            if (option.type !== ApplicationCommandOptionTypes.String && option.type !== ApplicationCommandOptionTypes.Integer) {
                throw new Error("Only string or integer options can have choices.");
            }
        }
        if (!bot.utils.validateLength(option.name, {
            min: 1,
            max: 32
        })) {
            throw new Error("Invalid application command option name.");
        }
        if (!bot.utils.validateLength(option.description, {
            min: 1,
            max: 100
        })) {
            throw new Error("Invalid application command description.");
        }
        option.choices?.every((choice)=>{
            if (!bot.utils.validateLength(choice.name, {
                min: 1,
                max: 100
            })) {
                throw new Error("Invalid application command option choice name. Must be between 1-100 characters long.");
            }
            if (option.type === ApplicationCommandOptionTypes.String && (typeof choice.value !== "string" || choice.value.length < 1 || choice.value.length > 100)) {
                throw new Error("Invalid slash options choice value type.");
            }
            if (option.type === ApplicationCommandOptionTypes.Integer && typeof choice.value !== "number") {
                throw new Error("A number must be set for Integer types.");
            }
        });
        if (option.required) {
            requiredOptions.push(option);
            continue;
        }
        optionalOptions.push(option);
    }
    return [
        ...requiredOptions,
        ...optionalOptions
    ];
}
function createApplicationCommand(bot) {
    const createApplicationCommandOld = bot.helpers.createApplicationCommand;
    bot.helpers.createApplicationCommand = function(options, guildId) {
        const isChatInput = !options.type || options.type === ApplicationCommandTypes.ChatInput;
        if (!options.name) {
            throw new Error("A name is required to create a options.");
        }
        if (isChatInput) {
            if (!SLASH_COMMANDS_NAME_REGEX.test(options.name)) {
                throw new Error("The name of the slash command did not match the required regex.");
            }
            options.name = options.name.toLowerCase();
        } else {
            if (!CONTEXT_MENU_COMMANDS_NAME_REGEX.test(options.name)) {
                throw new Error("The name of the context menu did not match the required regex.");
            }
        }
        if (!options.description && isChatInput) {
            throw new Error("Slash commands require some form of a description be provided.");
        }
        if (options.description && (options.type === ApplicationCommandTypes.User || options.type === ApplicationCommandTypes.Message)) {
            throw new Error("Context menu commands do not allow a description.");
        }
        if (options.description && !bot.utils.validateLength(options.description, {
            min: 1,
            max: 100
        })) {
            throw new Error("Application command descriptions must be between 1 and 100 characters.");
        }
        if (options.options?.length) {
            if (options.options.length > 25) {
                throw new Error("Only 25 options are allowed to be provided.");
            }
            options.options = validateApplicationCommandOptions(bot, options.options);
        }
        return createApplicationCommandOld(options, guildId);
    };
}
function editInteractionResponse(bot) {
    const editInteractionResponseOld = bot.helpers.editInteractionResponse;
    bot.helpers.editInteractionResponse = function(token, options) {
        if (options.content && options.content.length > 2000) {
            throw Error(bot.constants.Errors.MESSAGE_MAX_LENGTH);
        }
        if (options.embeds && options.embeds.length > 10) {
            options.embeds.splice(10);
        }
        if (options.allowedMentions) {
            if (options.allowedMentions.users?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.UserMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "users"
                    );
                }
                if (options.allowedMentions.users.length > 100) {
                    options.allowedMentions.users = options.allowedMentions.users.slice(0, 100);
                }
            }
            if (options.allowedMentions.roles?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.RoleMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "roles"
                    );
                }
                if (options.allowedMentions.roles.length > 100) {
                    options.allowedMentions.roles = options.allowedMentions.roles.slice(0, 100);
                }
            }
        }
        return editInteractionResponseOld(token, options);
    };
}
function setupInteractionCommandPermChecks(bot) {
    createApplicationCommand(bot);
    editInteractionResponse(bot);
}
function editFollowupMessage(bot) {
    const editFollowupMessageOld = bot.helpers.editFollowupMessage;
    bot.helpers.editFollowupMessage = function(token, messageId, options) {
        if (options.content && options.content.length > 2000) {
            throw Error("MESSAGE_MAX_LENGTH");
        }
        if (options.embeds && options.embeds.length > 10) {
            options.embeds.splice(10);
        }
        if (options.allowedMentions) {
            if (options.allowedMentions.users?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.UserMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "users"
                    );
                }
                if (options.allowedMentions.users.length > 100) {
                    options.allowedMentions.users = options.allowedMentions.users.slice(0, 100);
                }
            }
            if (options.allowedMentions.roles?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.RoleMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "roles"
                    );
                }
                if (options.allowedMentions.roles.length > 100) {
                    options.allowedMentions.roles = options.allowedMentions.roles.slice(0, 100);
                }
            }
        }
        return editFollowupMessageOld(token, messageId, options);
    };
}
function setupInteractionPermChecks(bot) {
    setupInteractionCommandPermChecks(bot);
    editFollowupMessage(bot);
}
function createInvite(bot) {
    const createInviteOld = bot.helpers.createInvite;
    bot.helpers.createInvite = function(channelId, options = {}) {
        if (options.maxAge && (options.maxAge < 0 || options.maxAge > 604800)) {
            throw new Error("The max age for an invite must be between 0 and 604800.");
        }
        if (options.maxUses && (options.maxUses < 0 || options.maxUses > 100)) {
            throw new Error("The max uses for an invite must be between 0 and 100.");
        }
        requireBotChannelPermissions(bot, channelId, [
            "CREATE_INSTANT_INVITE"
        ]);
        return createInviteOld(channelId, options);
    };
}
function getChannelInvites(bot) {
    const getChannelInvitesOld = bot.helpers.getChannelInvites;
    bot.helpers.getChannelInvites = function(channelId) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_CHANNELS"
        ]);
        return getChannelInvitesOld(channelId);
    };
}
function getInvites(bot) {
    const getInvitesOld = bot.helpers.getInvites;
    bot.helpers.getInvites = function(guildId) {
        requireBotChannelPermissions(bot, guildId, [
            "MANAGE_GUILD"
        ]);
        return getInvitesOld(guildId);
    };
}
function setupInvitesPermChecks(bot) {
    createInvite(bot);
    getChannelInvites(bot);
    getInvites(bot);
}
function banMember(bot) {
    const banMemberOld = bot.helpers.banMember;
    bot.helpers.banMember = function(guildId, id, options) {
        requireBotGuildPermissions(bot, guildId, [
            "BAN_MEMBERS"
        ]);
        return banMemberOld(guildId, id, options);
    };
}
function unbanMember(bot) {
    const unbanMemberOld = bot.helpers.unbanMember;
    bot.helpers.unbanMember = function(guildId, id) {
        requireBotGuildPermissions(bot, guildId, [
            "BAN_MEMBERS"
        ]);
        return unbanMemberOld(guildId, id);
    };
}
function setupBanPermChecks(bot) {
    banMember(bot);
    unbanMember(bot);
}
function editBotNickname(bot) {
    const editBotNicknameOld = bot.helpers.editBotNickname;
    bot.helpers.editBotNickname = function(guildId, options) {
        requireBotGuildPermissions(bot, guildId, [
            "CHANGE_NICKNAME"
        ]);
        return editBotNicknameOld(guildId, options);
    };
}
function editMember1(bot) {
    const editMemberOld = bot.helpers.editMember;
    bot.helpers.editMember = function(guildId, memberId, options) {
        const requiredPerms = [];
        if (options.roles) requiredPerms.push("MANAGE_ROLES");
        if (options.nick !== undefined) requiredPerms.push("MANAGE_NICKNAMES");
        if (options.channelId !== undefined) requiredPerms.push("MOVE_MEMBERS");
        if (options.mute !== undefined) requiredPerms.push("MUTE_MEMBERS");
        if (options.deaf !== undefined) requiredPerms.push("DEAFEN_MEMBERS");
        if (requiredPerms.length) {
            requireBotGuildPermissions(bot, guildId, requiredPerms);
        }
        return editMemberOld(guildId, memberId, options);
    };
}
function kickMember(bot) {
    const editMemberOld = bot.helpers.kickMember;
    bot.helpers.kickMember = function(guildId, memberId, reason) {
        requireBotGuildPermissions(bot, guildId, [
            "KICK_MEMBERS"
        ]);
        return editMemberOld(guildId, memberId, reason);
    };
}
function pruneMembers(bot) {
    const pruneMembersOld = bot.helpers.pruneMembers;
    bot.helpers.pruneMembers = function(guildId, options) {
        requireBotGuildPermissions(bot, guildId, [
            "KICK_MEMBERS"
        ]);
        return pruneMembersOld(guildId, options);
    };
}
function setupMemberPermChecks(bot) {
    setupBanPermChecks(bot);
    editBotNickname(bot);
    editMember1(bot);
    kickMember(bot);
    pruneMembers(bot);
}
function validateComponents(bot, components) {
    if (!components?.length) return;
    let actionRowCounter = 0;
    for (const component of components){
        actionRowCounter++;
        if (actionRowCounter > 5) throw new Error("Too many action rows.");
        if (component.components?.length > 5) {
            throw new Error("Too many components.");
        } else if (component.components?.length > 1 && component.components.some((subcomponent)=>subcomponent.type === MessageComponentTypes.SelectMenu
        )) {
            throw new Error("Select component must be alone.");
        }
        for (const subcomponent1 of component.components){
            if (subcomponent1.customId && !bot.utils.validateLength(subcomponent1.customId, {
                max: 100
            })) {
                throw new Error("The custom id in the component is too big.");
            }
            if (subcomponent1.type === MessageComponentTypes.Button) {
                if (subcomponent1.style === ButtonStyles.Link && subcomponent1.customId) {
                    throw new Error("Link buttons can not have custom ids.");
                }
                if (!subcomponent1.customId && subcomponent1.style !== ButtonStyles.Link) {
                    throw new Error("The button requires a custom id if it is not a link button.");
                }
                if (!bot.utils.validateLength(subcomponent1.label, {
                    max: 80
                })) {
                    throw new Error("The label can not be longer than 80 characters.");
                }
                subcomponent1.emoji = makeEmojiFromString(subcomponent1.emoji);
            }
            if (subcomponent1.type === MessageComponentTypes.SelectMenu) {
                if (subcomponent1.placeholder && !bot.utils.validateLength(subcomponent1.placeholder, {
                    max: 100
                })) {
                    throw new Error("The component placeholder can not be longer than 100 characters.");
                }
                if (subcomponent1.minValues) {
                    if (subcomponent1.minValues < 1) {
                        throw new Error("The min values must be more than 1 in a select component.");
                    }
                    if (subcomponent1.minValues > 25) {
                        throw new Error("The min values must be less than 25 in a select component.");
                    }
                    if (!subcomponent1.maxValues) {
                        subcomponent1.maxValues = subcomponent1.minValues;
                    }
                    if (subcomponent1.minValues > subcomponent1.maxValues) {
                        throw new Error("The select component can not have a min values higher than a max values.");
                    }
                }
                if (subcomponent1.maxValues) {
                    if (subcomponent1.maxValues < 1) {
                        throw new Error("The max values must be more than 1 in a select component.");
                    }
                    if (subcomponent1.maxValues > 25) {
                        throw new Error("The max values must be less than 25 in a select component.");
                    }
                }
                if (subcomponent1.options.length < 1) {
                    throw new Error("You need atleast 1 option in the select component.");
                }
                if (subcomponent1.options.length > 25) {
                    throw new Error("You can not have more than 25 options in the select component.");
                }
                let defaults = 0;
                for (const option of subcomponent1.options){
                    if (option.default) {
                        defaults++;
                        if (defaults > (subcomponent1.maxValues || 25)) {
                            throw new Error("You chose too many default options.");
                        }
                    }
                    if (!bot.utils.validateLength(option.label, {
                        max: 25
                    })) {
                        throw new Error("The select component label can not exceed 25 characters.");
                    }
                    if (!bot.utils.validateLength(option.value, {
                        max: 100
                    })) {
                        throw new Error("The select component value can not exceed 100 characters.");
                    }
                    if (option.description && !bot.utils.validateLength(option.description, {
                        max: 50
                    })) {
                        throw new Error("The select option description can not exceed 50 characters.");
                    }
                    option.emoji = makeEmojiFromString(option.emoji);
                }
            }
        }
    }
}
function makeEmojiFromString(emoji) {
    if (typeof emoji !== "string") return emoji;
    if (/^[0-9]+$/.test(emoji)) {
        emoji = {
            id: emoji
        };
    } else {
        emoji = {
            name: emoji
        };
    }
    return emoji;
}
function sendMessage(bot) {
    const sendMessageOld = bot.helpers.sendMessage;
    bot.helpers.sendMessage = function(channelId, content) {
        if (typeof content === "string") {
            throw new Error("TODO");
        }
        const channel = bot.channels.get(channelId);
        if (channel && [
            ChannelTypes.GuildCategory,
            ChannelTypes.GuildStore,
            ChannelTypes.GuildStageVoice, 
        ].includes(channel.type)) {
            throw new Error(`Can not send message to a channel of this type. Channel ID: ${channelId}`);
        }
        if (content.content && !bot.utils.validateLength(content.content, {
            max: 2000
        })) {
            throw new Error("The content should not exceed 2000 characters.");
        }
        if (content.allowedMentions) {
            if (content.allowedMentions.users?.length) {
                if (content.allowedMentions.parse?.includes(AllowedMentionsTypes.UserMentions)) {
                    content.allowedMentions.parse = content.allowedMentions.parse.filter((p)=>p !== "users"
                    );
                }
                if (content.allowedMentions.users.length > 100) {
                    content.allowedMentions.users = content.allowedMentions.users.slice(0, 100);
                }
            }
            if (content.allowedMentions.roles?.length) {
                if (content.allowedMentions.parse?.includes(AllowedMentionsTypes.RoleMentions)) {
                    content.allowedMentions.parse = content.allowedMentions.parse.filter((p)=>p !== "roles"
                    );
                }
                if (content.allowedMentions.roles.length > 100) {
                    content.allowedMentions.roles = content.allowedMentions.roles.slice(0, 100);
                }
            }
        }
        if (content.components) {
            validateComponents(bot, content.components);
        }
        if (channel) {
            const requiredPerms = [];
            if (channel.guildId) {
                requiredPerms.push("SEND_MESSAGES");
            }
            if (content.tts) requiredPerms.push("SEND_TTS_MESSAGES");
            if (content.messageReference) requiredPerms.push("READ_MESSAGE_HISTORY");
            if (requiredPerms.length) {
                requireBotChannelPermissions(bot, channel, requiredPerms);
            }
        }
        return sendMessageOld(channelId, content);
    };
}
function editMessage(bot) {
    const editMessageOld = bot.helpers.editMessage;
    bot.helpers.editMessage = function(channelId, messageId, content) {
        if (typeof content === "string") {
            throw new Error("TODO");
        }
        const message = bot.messages.get(messageId);
        if (message) {
            if (message.authorId !== bot.id) {
                content = {
                    flags: content.flags
                };
                requireBotChannelPermissions(bot, channelId, [
                    "MANAGE_MESSAGES"
                ]);
            }
        }
        if (content.allowedMentions) {
            if (content.allowedMentions.users?.length) {
                if (content.allowedMentions.parse?.includes(AllowedMentionsTypes.UserMentions)) {
                    content.allowedMentions.parse = content.allowedMentions.parse.filter((p)=>p !== "users"
                    );
                }
                if (content.allowedMentions.users.length > 100) {
                    content.allowedMentions.users = content.allowedMentions.users.slice(0, 100);
                }
            }
            if (content.allowedMentions.roles?.length) {
                if (content.allowedMentions.parse?.includes(AllowedMentionsTypes.RoleMentions)) {
                    content.allowedMentions.parse = content.allowedMentions.parse.filter((p)=>p !== "roles"
                    );
                }
                if (content.allowedMentions.roles.length > 100) {
                    content.allowedMentions.roles = content.allowedMentions.roles.slice(0, 100);
                }
            }
        }
        content.embeds?.splice(10);
        if (content.content && bot.utils.validateLength(content.content, {
            max: 2000
        })) {
            throw new Error("A message content can not contain more than 2000 characters.");
        }
        return editMessageOld(channelId, messageId, content);
    };
}
function publishMessage(bot) {
    const publishMessageOld = bot.helpers.publishMessage;
    bot.helpers.publishMessage = function(channelId, messageId) {
        const message = bot.messages.get(messageId);
        requireBotChannelPermissions(bot, channelId, message?.authorId === bot.id ? [
            "SEND_MESSAGES"
        ] : [
            "MANAGE_MESSAGES"
        ]);
        return publishMessageOld(channelId, messageId);
    };
}
function setupCreateMessagePermChecks(bot) {
    sendMessage(bot);
    editMessage(bot);
    publishMessage(bot);
}
function deleteMessage(bot) {
    const deleteMessageOld = bot.helpers.deleteMessage;
    bot.helpers.deleteMessage = function(channelId, messageId, reason, milliseconds) {
        const message = bot.messages.get(messageId);
        if (message?.authorId === bot.id) {
            return deleteMessageOld(channelId, messageId, reason, milliseconds);
        }
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channel, [
                "MANAGE_MESSAGES", 
            ]);
        } else {
            throw new Error(`You can only delete messages in a channel which has a guild id. Channel ID: ${channelId} Message Id: ${messageId}`);
        }
        return deleteMessageOld(channelId, messageId, reason, milliseconds);
    };
}
function deleteMessages(bot) {
    const deleteMessagesOld = bot.helpers.deleteMessages;
    bot.helpers.deleteMessages = function(channelId, ids, reason) {
        const channel = bot.channels.get(channelId);
        if (!channel?.guildId) {
            throw new Error(`Bulk deleting messages is only allowed in channels which has a guild id. Channel ID: ${channelId} IDS: ${ids.join(" ")}`);
        }
        const oldestAllowed = Date.now() - 1209600000;
        ids = ids.filter((id)=>{
            const createdAt = Number(id / 4194304n + 1420070400000n);
            if (createdAt > oldestAllowed) return true;
            console.log(`[Permission Plugin] Skipping bulk message delete of ID ${id} because it is older than 2 weeks.`);
            return false;
        });
        if (ids.length < 2) {
            throw new Error("Bulk message delete requires at least 2 messages.");
        }
        requireBotChannelPermissions(bot, channel, [
            "MANAGE_MESSAGES", 
        ]);
        return deleteMessagesOld(channelId, ids, reason);
    };
}
function setupDeleteMessagePermChecks(bot) {
    deleteMessage(bot);
    deleteMessages(bot);
}
function getMessage(bot) {
    const getMessageOld = bot.helpers.getMessage;
    bot.helpers.getMessage = function(channelId, messageId) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channel, [
                "READ_MESSAGE_HISTORY", 
            ]);
        }
        return getMessageOld(channelId, messageId);
    };
}
function getMessages(bot) {
    const getMessagesOld = bot.helpers.getMessages;
    bot.helpers.getMessages = function(channelId, options) {
        const channel = bot.channels.get(channelId);
        if (channel?.guildId) {
            requireBotChannelPermissions(bot, channel, [
                "READ_MESSAGE_HISTORY",
                "VIEW_CHANNEL", 
            ]);
        }
        return getMessagesOld(channelId, options);
    };
}
function setupGetMessagePermChecks(bot) {
    getMessage(bot);
    getMessages(bot);
}
function pinMessage(bot) {
    const pinMessageOld = bot.helpers.pinMessage;
    bot.helpers.pinMessage = function(channelId, messageId) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_MESSAGES", 
        ]);
        return pinMessageOld(channelId, messageId);
    };
}
function unpinMessage(bot) {
    const unpinMessageOld = bot.helpers.unpinMessage;
    bot.helpers.unpinMessage = function(channelId, messageId) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_MESSAGES", 
        ]);
        return unpinMessageOld(channelId, messageId);
    };
}
function setupPinMessagePermChecks(bot) {
    pinMessage(bot);
    unpinMessage(bot);
}
function addReaction(bot) {
    const addReactionOld = bot.helpers.addReaction;
    bot.helpers.addReaction = function(channelId, messageId, reaction) {
        requireBotChannelPermissions(bot, channelId, [
            "READ_MESSAGE_HISTORY",
            "ADD_REACTIONS", 
        ]);
        return addReactionOld(channelId, messageId, reaction);
    };
}
function addReactions(bot) {
    const addReactionsOld = bot.helpers.addReactions;
    bot.helpers.addReactions = function(channelId, messageId, reactions, ordered) {
        requireBotChannelPermissions(bot, channelId, [
            "READ_MESSAGE_HISTORY",
            "ADD_REACTIONS", 
        ]);
        return addReactionsOld(channelId, messageId, reactions, ordered);
    };
}
function removeReaction(bot) {
    const removeReactionOld = bot.helpers.removeReaction;
    bot.helpers.removeReaction = function(channelId, messageId, reactions, options) {
        if (options?.userId) {
            requireBotChannelPermissions(bot, channelId, [
                "MANAGE_MESSAGES", 
            ]);
        }
        return removeReactionOld(channelId, messageId, reactions, options);
    };
}
function removeAllReactions(bot) {
    const removeAllReactionsOld = bot.helpers.removeAllReactions;
    bot.helpers.removeAllReactions = function(channelId, messageId) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_MESSAGES", 
        ]);
        return removeAllReactionsOld(channelId, messageId);
    };
}
function removeReactionEmoji(bot) {
    const removeReactionEmojiOld = bot.helpers.removeReactionEmoji;
    bot.helpers.removeReactionEmoji = function(channelId, messageId, reaction) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_MESSAGES", 
        ]);
        return removeReactionEmojiOld(channelId, messageId, reaction);
    };
}
function setupReactionsPermChecks(bot) {
    addReaction(bot);
    addReactions(bot);
    removeReaction(bot);
    removeAllReactions(bot);
    removeReactionEmoji(bot);
}
function setupMessagesPermChecks(bot) {
    setupReactionsPermChecks(bot);
    setupDeleteMessagePermChecks(bot);
    setupGetMessagePermChecks(bot);
    setupPinMessagePermChecks(bot);
    setupCreateMessagePermChecks(bot);
}
function editBotProfile(bot) {
    const editBotProfileOld = bot.helpers.editBotProfile;
    bot.helpers.editBotProfile = function(options) {
        if (!options.username && options.botAvatarURL === undefined) {
            throw new Error("There was no change to the username or avatar found in the request.");
        }
        if (options.username) {
            if (options.username.length > 32) {
                throw new Error("A username for the bot must be less than 32 characters.");
            }
            if (options.username.length < 2) {
                throw new Error("A username for the bot can not be less than 2 characters.");
            }
            if ([
                "@",
                "#",
                ":",
                "```"
            ].some((__char)=>options.username.includes(__char)
            )) {
                throw new Error("A bot username can not include @ # : or ```");
            }
            if ([
                "discordtag",
                "everyone",
                "here"
            ].includes(options.username)) {
                throw new Error("A bot username can not be set to `discordtag` `everyone` and `here`");
            }
        }
        return editBotProfileOld(options);
    };
}
function setupMiscPermChecks(bot) {
    editBotProfile(bot);
}
function addRole(bot) {
    const addRoleOld = bot.helpers.addRole;
    bot.helpers.addRole = function(guildId, memberId, roleId, reason) {
        const guild = bot.guilds.get(guildId);
        if (guild) {
            const role = guild.roles.get(roleId);
            if (role) {
                const botRole = highestRole(bot, guild, bot.id);
                if (!higherRolePosition(bot, guild, botRole.id, role.id)) {
                    throw new Error(`The bot can not add this role to the member because it does not have a role higher than the role ID: ${role.id}.`);
                }
            }
            requireBotGuildPermissions(bot, guild, [
                "MANAGE_ROLES"
            ]);
        }
        return addRoleOld(guildId, memberId, roleId, reason);
    };
}
function createRole(bot) {
    const createRoleOld = bot.helpers.createRole;
    bot.helpers.createRole = function(guildId, options, reason) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_ROLES"
        ]);
        return createRoleOld(guildId, options, reason);
    };
}
function deleteRole(bot) {
    const deleteRoleOld = bot.helpers.deleteRole;
    bot.helpers.deleteRole = function(guildId, id) {
        requireBotGuildPermissions(bot, guildId, [
            "MANAGE_ROLES"
        ]);
        return deleteRoleOld(guildId, id);
    };
}
function editRole(bot) {
    const editRoleOld = bot.helpers.editRole;
    bot.helpers.editRole = function(guildId, id, options) {
        const guild = bot.guilds.get(guildId);
        if (guild) {
            const role = guild.roles.get(id);
            if (role) {
                const botRole = highestRole(bot, guild, bot.id);
                if (!higherRolePosition(bot, guild, botRole.id, role.id)) {
                    throw new Error(`The bot can not add this role to the member because it does not have a role higher than the role ID: ${role.id}.`);
                }
            }
            requireBotGuildPermissions(bot, guild, [
                "MANAGE_ROLES"
            ]);
        }
        return editRoleOld(guildId, id, options);
    };
}
function removeRole(bot) {
    const removeRoleOld = bot.helpers.removeRole;
    bot.helpers.removeRole = function(guildId, memberId, roleId, reason) {
        const guild = bot.guilds.get(guildId);
        if (guild) {
            const role = guild.roles.get(roleId);
            if (role) {
                const botRole = highestRole(bot, guild, bot.id);
                if (!higherRolePosition(bot, guild, botRole.id, role.id)) {
                    throw new Error(`The bot can not add this role to the member because it does not have a role higher than the role ID: ${role.id}.`);
                }
            }
            requireBotGuildPermissions(bot, guild, [
                "MANAGE_ROLES"
            ]);
        }
        return removeRoleOld(guildId, memberId, roleId, reason);
    };
}
function setupRolePermChecks(bot) {
    addRole(bot);
    createRole(bot);
    deleteRole(bot);
    editRole(bot);
    removeRole(bot);
}
function createWebhook(bot) {
    const createWebhookOld = bot.helpers.createWebhook;
    bot.helpers.createWebhook = function(channelId, options) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_WEBHOOKS"
        ]);
        if (options.name === "clyde" || !bot.utils.validateLength(options.name, {
            min: 2,
            max: 32
        })) {
            throw new Error("The webhook name can not be clyde and it must be between 2 and 32 characters long.");
        }
        return createWebhookOld(channelId, options);
    };
}
function deleteWebhook(bot) {
    const deleteWebhookOld = bot.helpers.deleteWebhook;
    bot.helpers.deleteWebhook = function(channelId, options) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_WEBHOOKS"
        ]);
        return deleteWebhookOld(channelId, options);
    };
}
function editWebhook(bot) {
    const editWebhookOld = bot.helpers.editWebhook;
    bot.helpers.editWebhook = function(channelId, webhookId, options) {
        requireBotChannelPermissions(bot, channelId, [
            "MANAGE_WEBHOOKS"
        ]);
        if (options.name) {
            if (options.name === "clyde" || !bot.utils.validateLength(options.name, {
                min: 2,
                max: 32
            })) {
                throw new Error("The webhook name can not be clyde and it must be between 2 and 32 characters long.");
            }
        }
        return editWebhookOld(channelId, webhookId, options);
    };
}
function editWebhookMessage(bot) {
    const editWebhookMessageOld = bot.helpers.editWebhookMessage;
    bot.helpers.editWebhookMessage = function(webhookId, webhookToken, options) {
        if (options.content && !bot.utils.validateLength(options.content, {
            max: 2000
        })) {
            throw Error("The content can not exceed 2000 characters.");
        }
        if (options.embeds && options.embeds.length > 10) {
            options.embeds.splice(10);
        }
        if (options.allowedMentions) {
            if (options.allowedMentions.users?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.UserMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "users"
                    );
                }
                if (options.allowedMentions.users.length > 100) {
                    options.allowedMentions.users = options.allowedMentions.users.slice(0, 100);
                }
            }
            if (options.allowedMentions.roles?.length) {
                if (options.allowedMentions.parse?.includes(AllowedMentionsTypes.RoleMentions)) {
                    options.allowedMentions.parse = options.allowedMentions.parse.filter((p)=>p !== "roles"
                    );
                }
                if (options.allowedMentions.roles.length > 100) {
                    options.allowedMentions.roles = options.allowedMentions.roles.slice(0, 100);
                }
            }
        }
        if (options.components) validateComponents(bot, options.components);
        return editWebhookMessageOld(webhookId, webhookToken, options);
    };
}
function setupMessageWebhookPermChecks(bot) {
    editWebhookMessage(bot);
}
function setupWebhooksPermChecks(bot) {
    createWebhook(bot);
    deleteWebhook(bot);
    editWebhook(bot);
    setupMessageWebhookPermChecks(bot);
}
function enablePermissionsPlugin(bot) {
    if (!bot.enabledPlugins?.has("CACHE")) {
        throw new Error("The PERMISSIONS plugin requires the CACHE plugin first.");
    }
    bot.enabledPlugins.add("PERMISSIONS");
    setupChannelPermChecks(bot);
    setupDiscoveryPermChecks(bot);
    setupEmojiPermChecks(bot);
    editMember(bot);
    setupGuildPermChecks(bot);
    setupIntegrationPermChecks(bot);
    setupInteractionPermChecks(bot);
    setupInvitesPermChecks(bot);
    setupMemberPermChecks(bot);
    setupMessagesPermChecks(bot);
    setupMiscPermChecks(bot);
    setupRolePermChecks(bot);
    setupWebhooksPermChecks(bot);
    return bot;
}
async function cloneChannel(bot, channel, reason) {
    if (!channel.guildId) {
        throw new Error(`Cannot clone a channel outside a guild`);
    }
    const createChannelOptions = {
        type: channel.type,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        rateLimitPerUser: channel.rateLimitPerUser,
        position: channel.position,
        parentId: channel.parentId,
        nsfw: channel.nsfw,
        name: channel.name,
        topic: channel.topic || undefined,
        permissionOverwrites: channel.permissionOverwrites.map((overwrite)=>{
            const [type, id, allow, deny] = separateOverwrites1(overwrite);
            return {
                id,
                type,
                allow: bot.utils.calculatePermissions(BigInt(allow)),
                deny: bot.utils.calculatePermissions(BigInt(deny))
            };
        })
    };
    return await bot.helpers.createChannel(channel.guildId, createChannelOptions, reason);
}
async function sendAutocompleteChoices(bot, interactionId, interactionToken, choices) {
    await bot.helpers.sendInteractionResponse(interactionId, interactionToken, {
        type: InteractionResponseTypes.ApplicationCommandAutocompleteResult,
        data: {
            choices: choices
        }
    });
}
const dmChannelIds = new Collection2();
async function sendDirectMessage(bot, userId, content) {
    if (typeof content === "string") content = {
        content
    };
    const cachedChannelId = dmChannelIds.get(userId);
    if (cachedChannelId) return bot.helpers.sendMessage(cachedChannelId, content);
    const channel = await bot.helpers.getDmChannel(userId);
    dmChannelIds.set(userId, channel.id);
    return bot.helpers.sendMessage(channel.id, content);
}
async function suppressEmbeds(bot, channelId, messageId) {
    const result = await bot.rest.runMethod(bot.rest, "patch", bot.constants.endpoints.CHANNEL_MESSAGE(channelId, messageId), {
        flags: 4
    });
    return bot.transformers.message(bot, result);
}
async function archiveThread(bot, threadId) {
    return await editThread(bot, threadId, {
        archived: true
    });
}
async function unarchiveThread(bot, threadId) {
    return await editThread(bot, threadId, {
        archived: false
    });
}
async function lockThread(bot, threadId) {
    return await editThread(bot, threadId, {
        locked: true
    });
}
async function unlockThread(bot, threadId) {
    return await editThread(bot, threadId, {
        locked: false
    });
}
async function editThread(bot, threadId, options, reason) {
    const result = await bot.rest.runMethod(bot.rest, "patch", bot.constants.endpoints.CHANNEL_BASE(threadId), {
        name: options.name,
        archived: options.archived,
        auto_archive_duration: options.autoArchiveDuration,
        locked: options.locked,
        rate_limit_per_user: options.rateLimitPerUser,
        reason
    });
    return bot.transformers.channel(bot, {
        channel: result,
        guildId: result.guild_id ? bot.transformers.snowflake(result.guild_id) : undefined
    });
}
function disconnectMember(bot, guildId, memberId) {
    return bot.helpers.editMember(guildId, memberId, {
        channelId: null
    });
}
async function getMembersPaginated(bot, guildId, options) {
    const members = new Collection2();
    let membersLeft = options?.limit ?? options.memberCount;
    let loops = 1;
    while((options?.limit ?? options.memberCount) > members.size && membersLeft > 0){
        bot.events.debug("Running while loop in getMembers function.");
        if (options?.limit && options.limit > 1000) {
            console.log(`Paginating get members from REST. #${loops} / ${Math.ceil((options?.limit ?? 1) / 1000)}`);
        }
        const result = await bot.rest.runMethod(bot.rest, "get", `${bot.constants.endpoints.GUILD_MEMBERS(guildId)}?limit=${membersLeft > 1000 ? 1000 : membersLeft}${options?.after ? `&after=${options.after}` : ""}`);
        const discordenoMembers = result.map((member)=>bot.transformers.member(bot, member, guildId, bot.transformers.snowflake(member.user.id))
        );
        if (!discordenoMembers.length) break;
        discordenoMembers.forEach((member)=>{
            bot.events.debug(`Running forEach loop in get_members file.`);
            members.set(member.id, member);
        });
        options = {
            limit: options?.limit,
            after: discordenoMembers[discordenoMembers.length - 1].id.toString(),
            memberCount: options.memberCount
        };
        membersLeft -= 1000;
        loops++;
    }
    return members;
}
function moveMember(bot, guildId, memberId, channelId) {
    return bot.helpers.editMember(guildId, memberId, {
        channelId
    });
}
function enableHelpersPlugin(rawBot) {
    const bot = rawBot;
    bot.helpers.sendDirectMessage = (userId, content)=>sendDirectMessage(bot, userId, content)
    ;
    bot.helpers.suppressEmbeds = (channelId, messageId)=>suppressEmbeds(bot, channelId, messageId)
    ;
    bot.helpers.archiveThread = (threadId)=>archiveThread(bot, threadId)
    ;
    bot.helpers.unarchiveThread = (threadId)=>unarchiveThread(bot, threadId)
    ;
    bot.helpers.lockThread = (threadId)=>lockThread(bot, threadId)
    ;
    bot.helpers.unlockThread = (threadId)=>unlockThread(bot, threadId)
    ;
    bot.helpers.editThread = (threadId, options, reason)=>editThread(bot, threadId, options, reason)
    ;
    bot.helpers.cloneChannel = (channel, reason)=>cloneChannel(bot, channel, reason)
    ;
    bot.helpers.sendAutocompleteChoices = (interactionId, interactionToken, choices)=>sendAutocompleteChoices(bot, interactionId, interactionToken, choices)
    ;
    bot.helpers.disconnectMember = (guildId, memberId)=>disconnectMember(bot, guildId, memberId)
    ;
    bot.helpers.getMembersPaginated = (guildId, options)=>getMembersPaginated(bot, guildId, options)
    ;
    bot.helpers.moveMember = (guildId, memberId, channelId)=>moveMember(bot, guildId, memberId, channelId)
    ;
    return bot;
}
const { Deno: Deno5  } = globalThis;
const noColor = typeof Deno5?.noColor === "boolean" ? Deno5.noColor : true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code1) {
    return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function italic(str) {
    return run(str, code([
        3
    ], 23));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
function magenta(str) {
    return run(str, code([
        35
    ], 39));
}
function cyan(str) {
    return run(str, code([
        36
    ], 39));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
const _toString = Object.prototype.toString;
const _isObjectLike = (value)=>value !== null && typeof value === "object"
;
const _isFunctionLike = (value)=>value !== null && typeof value === "function"
;
function isAnyArrayBuffer(value) {
    return _isObjectLike(value) && (_toString.call(value) === "[object ArrayBuffer]" || _toString.call(value) === "[object SharedArrayBuffer]");
}
function isArgumentsObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Arguments]";
}
function isArrayBuffer(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object ArrayBuffer]";
}
function isAsyncFunction(value) {
    return _isFunctionLike(value) && _toString.call(value) === "[object AsyncFunction]";
}
function isBooleanObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Boolean]";
}
function isBoxedPrimitive(value) {
    return isBooleanObject(value) || isStringObject(value) || isNumberObject(value) || isSymbolObject(value) || isBigIntObject(value);
}
function isDataView(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object DataView]";
}
function isDate(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Date]";
}
function isGeneratorFunction(value) {
    return _isFunctionLike(value) && _toString.call(value) === "[object GeneratorFunction]";
}
function isGeneratorObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Generator]";
}
function isMap(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Map]";
}
function isMapIterator(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Map Iterator]";
}
function isModuleNamespaceObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Module]";
}
function isNativeError(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Error]";
}
function isNumberObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Number]";
}
function isBigIntObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object BigInt]";
}
function isPromise(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Promise]";
}
function isRegExp(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object RegExp]";
}
function isSet(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Set]";
}
function isSetIterator(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Set Iterator]";
}
function isSharedArrayBuffer(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object SharedArrayBuffer]";
}
function isStringObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object String]";
}
function isSymbolObject(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object Symbol]";
}
function isWeakMap(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object WeakMap]";
}
function isWeakSet(value) {
    return _isObjectLike(value) && _toString.call(value) === "[object WeakSet]";
}
const __default = {
    isAsyncFunction,
    isGeneratorFunction,
    isAnyArrayBuffer,
    isArrayBuffer,
    isArgumentsObject,
    isBoxedPrimitive,
    isDataView,
    isMap,
    isMapIterator,
    isModuleNamespaceObject,
    isNativeError,
    isPromise,
    isSet,
    isSetIterator,
    isWeakMap,
    isWeakSet,
    isRegExp,
    isDate,
    isStringObject,
    isNumberObject,
    isBooleanObject,
    isBigIntObject
};
const mod = {
    isAnyArrayBuffer: isAnyArrayBuffer,
    isArgumentsObject: isArgumentsObject,
    isArrayBuffer: isArrayBuffer,
    isAsyncFunction: isAsyncFunction,
    isBooleanObject: isBooleanObject,
    isBoxedPrimitive: isBoxedPrimitive,
    isDataView: isDataView,
    isDate: isDate,
    isGeneratorFunction: isGeneratorFunction,
    isGeneratorObject: isGeneratorObject,
    isMap: isMap,
    isMapIterator: isMapIterator,
    isModuleNamespaceObject: isModuleNamespaceObject,
    isNativeError: isNativeError,
    isNumberObject: isNumberObject,
    isBigIntObject: isBigIntObject,
    isPromise: isPromise,
    isRegExp: isRegExp,
    isSet: isSet,
    isSetIterator: isSetIterator,
    isSharedArrayBuffer: isSharedArrayBuffer,
    isStringObject: isStringObject,
    isSymbolObject: isSymbolObject,
    isWeakMap: isWeakMap,
    isWeakSet: isWeakSet,
    default: __default
};
Symbol("kKeyObject");
Symbol("kKeyType");
const _toString1 = Object.prototype.toString;
const _isObjectLike1 = (value)=>value !== null && typeof value === "object"
;
function isArrayBufferView(value) {
    return ArrayBuffer.isView(value);
}
function isFloat32Array(value) {
    return _isObjectLike1(value) && _toString1.call(value) === "[object Float32Array]";
}
function isFloat64Array(value) {
    return _isObjectLike1(value) && _toString1.call(value) === "[object Float64Array]";
}
function isTypedArray(value) {
    const reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
    return _isObjectLike1(value) && reTypedTag.test(_toString1.call(value));
}
function isUint8Array(value) {
    return _isObjectLike1(value) && _toString1.call(value) === "[object Uint8Array]";
}
const { isDate: isDate1 , isArgumentsObject: isArgumentsObject1 , isBigIntObject: isBigIntObject1 , isBooleanObject: isBooleanObject1 , isNumberObject: isNumberObject1 , isStringObject: isStringObject1 , isSymbolObject: isSymbolObject1 , isNativeError: isNativeError1 , isRegExp: isRegExp1 , isAsyncFunction: isAsyncFunction1 , isGeneratorFunction: isGeneratorFunction1 , isGeneratorObject: isGeneratorObject1 , isPromise: isPromise1 , isMap: isMap1 , isSet: isSet1 , isMapIterator: isMapIterator1 , isSetIterator: isSetIterator1 , isWeakMap: isWeakMap1 , isWeakSet: isWeakSet1 , isArrayBuffer: isArrayBuffer1 , isDataView: isDataView1 , isSharedArrayBuffer: isSharedArrayBuffer1 , isModuleNamespaceObject: isModuleNamespaceObject1 , isAnyArrayBuffer: isAnyArrayBuffer1 , isBoxedPrimitive: isBoxedPrimitive1 ,  } = mod;
const codes = {};
function hideStackFrames(fn) {
    const hidden = "__node_internal_" + fn.name;
    Object.defineProperty(fn, "name", {
        value: hidden
    });
    return fn;
}
function normalizeEncoding(enc1) {
    if (enc1 == null || enc1 === "utf8" || enc1 === "utf-8") return "utf8";
    return slowCases(enc1);
}
function slowCases(enc2) {
    switch(enc2.length){
        case 4:
            if (enc2 === "UTF8") return "utf8";
            if (enc2 === "ucs2" || enc2 === "UCS2") return "utf16le";
            enc2 = `${enc2}`.toLowerCase();
            if (enc2 === "utf8") return "utf8";
            if (enc2 === "ucs2") return "utf16le";
            break;
        case 3:
            if (enc2 === "hex" || enc2 === "HEX" || `${enc2}`.toLowerCase() === "hex") {
                return "hex";
            }
            break;
        case 5:
            if (enc2 === "ascii") return "ascii";
            if (enc2 === "ucs-2") return "utf16le";
            if (enc2 === "UTF-8") return "utf8";
            if (enc2 === "ASCII") return "ascii";
            if (enc2 === "UCS-2") return "utf16le";
            enc2 = `${enc2}`.toLowerCase();
            if (enc2 === "utf-8") return "utf8";
            if (enc2 === "ascii") return "ascii";
            if (enc2 === "ucs-2") return "utf16le";
            break;
        case 6:
            if (enc2 === "base64") return "base64";
            if (enc2 === "latin1" || enc2 === "binary") return "latin1";
            if (enc2 === "BASE64") return "base64";
            if (enc2 === "LATIN1" || enc2 === "BINARY") return "latin1";
            enc2 = `${enc2}`.toLowerCase();
            if (enc2 === "base64") return "base64";
            if (enc2 === "latin1" || enc2 === "binary") return "latin1";
            break;
        case 7:
            if (enc2 === "utf16le" || enc2 === "UTF16LE" || `${enc2}`.toLowerCase() === "utf16le") {
                return "utf16le";
            }
            break;
        case 8:
            if (enc2 === "utf-16le" || enc2 === "UTF-16LE" || `${enc2}`.toLowerCase() === "utf-16le") {
                return "utf16le";
            }
            break;
        case 9:
            if (enc2 === "base64url" || enc2 === "BASE64URL" || `${enc2}`.toLowerCase() === "base64url") {
                return "base64url";
            }
            break;
        default:
            if (enc2 === "") return "utf8";
    }
}
function isInt32(value) {
    return value === (value | 0);
}
function isUint32(value) {
    return value === value >>> 0;
}
const validateBuffer = hideStackFrames((buffer2, name = "buffer")=>{
    if (!isArrayBufferView(buffer2)) {
        throw new codes.ERR_INVALID_ARG_TYPE(name, [
            "Buffer",
            "TypedArray",
            "DataView"
        ], buffer2);
    }
});
hideStackFrames((value, name, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)=>{
    if (typeof value !== "number") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
    if (!Number.isInteger(value)) {
        throw new codes.ERR_OUT_OF_RANGE(name, "an integer", value);
    }
    if (value < min || value > max) {
        throw new codes.ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
});
const validateObject = hideStackFrames((value, name, options)=>{
    const useDefaultOptions = options == null;
    const allowArray = useDefaultOptions ? false : options.allowArray;
    const allowFunction = useDefaultOptions ? false : options.allowFunction;
    const nullable = useDefaultOptions ? false : options.nullable;
    if (!nullable && value === null || !allowArray && Array.isArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function")) {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "Object", value);
    }
});
hideStackFrames((value, name, min = -2147483648, max = 2147483647)=>{
    if (!isInt32(value)) {
        if (typeof value !== "number") {
            throw new codes.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
        if (!Number.isInteger(value)) {
            throw new codes.ERR_OUT_OF_RANGE(name, "an integer", value);
        }
        throw new codes.ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
    if (value < min || value > max) {
        throw new codes.ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
});
hideStackFrames((value, name, positive)=>{
    if (!isUint32(value)) {
        if (typeof value !== "number") {
            throw new codes.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
        if (!Number.isInteger(value)) {
            throw new codes.ERR_OUT_OF_RANGE(name, "an integer", value);
        }
        const min = positive ? 1 : 0;
        throw new codes.ERR_OUT_OF_RANGE(name, `>= ${min} && < 4294967296`, value);
    }
    if (positive && value === 0) {
        throw new codes.ERR_OUT_OF_RANGE(name, ">= 1 && < 4294967296", value);
    }
});
function validateString(value, name) {
    if (typeof value !== "string") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "string", value);
    }
}
function validateBoolean(value, name) {
    if (typeof value !== "boolean") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "boolean", value);
    }
}
hideStackFrames((value, name, oneOf)=>{
    if (!Array.prototype.includes.call(oneOf, value)) {
        const allowed = Array.prototype.join.call(Array.prototype.map.call(oneOf, (v)=>typeof v === "string" ? `'${v}'` : String(v)
        ), ", ");
        const reason = "must be one of: " + allowed;
        throw new codes.ERR_INVALID_ARG_VALUE(name, value, reason);
    }
});
hideStackFrames((callback)=>{
    if (typeof callback !== "function") {
        throw new codes.ERR_INVALID_CALLBACK(callback);
    }
});
const validateAbortSignal = hideStackFrames((signal, name)=>{
    if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
    }
});
const validateFunction = hideStackFrames((value, name)=>{
    if (typeof value !== "function") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "Function", value);
    }
});
hideStackFrames((value, name, minLength = 0)=>{
    if (!Array.isArray(value)) {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "Array", value);
    }
    if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new codes.ERR_INVALID_ARG_VALUE(name, value, reason);
    }
});
const { Deno: Deno1  } = globalThis;
typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))", 
].join("|"), "g");
var DiffType;
(function(DiffType4) {
    DiffType4["removed"] = "removed";
    DiffType4["common"] = "common";
    DiffType4["added"] = "added";
})(DiffType || (DiffType = {}));
class AssertionError extends Error {
    name = "AssertionError";
    constructor(message){
        super(message);
    }
}
function unreachable() {
    throw new AssertionError("unreachable");
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
function indexOf(source, pattern, fromIndex = 0) {
    if (fromIndex >= source.length) {
        return -1;
    }
    if (fromIndex < 0) {
        fromIndex = Math.max(0, source.length + fromIndex);
    }
    const s = pattern[0];
    for(let i5 = fromIndex; i5 < source.length; i5++){
        if (source[i5] !== s) continue;
        const pin = i5;
        let matched = 1;
        let j = i5;
        while(matched < pattern.length){
            j++;
            if (source[j] !== pattern[j - pin]) {
                break;
            }
            matched++;
        }
        if (matched === pattern.length) {
            return pin;
        }
    }
    return -1;
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    partial;
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i6 = 100; i6 > 0; i6--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr = await this.#rd.read(p);
                const nread = rr ?? 0;
                assert(nread >= 0, "negative read");
                return rr;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer3 = await this.readSlice(delim.charCodeAt(0));
        if (buffer3 === null) return null;
        return new TextDecoder().decode(buffer3);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let partial;
            if (err instanceof PartialReadError) {
                partial = err.partial;
                assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i7 = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i7 >= 0) {
                i7 += s;
                slice = this.#buf.subarray(this.#r, this.#r + i7 + 1);
                this.#r += i7 + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n6) {
        if (n6 < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n6 && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = this.#buf.subarray(this.#r, this.#w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n6 && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n6) {
            throw new BufferFullError(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n6);
    }
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data18) {
        if (this.err !== null) throw this.err;
        if (data18.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data18.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data18);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data18, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data18 = data18.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data18, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data19) {
        if (this.err !== null) throw this.err;
        if (data19.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data19.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data19);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data19, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data19 = data19.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data19, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
function spliceOne(list, index) {
    for(; index + 1 < list.length; index++)list[index] = list[index + 1];
    list.pop();
}
const isNumericLookup = {};
function isArrayIndex(value) {
    switch(typeof value){
        case "number":
            return value >= 0 && (value | 0) === value;
        case "string":
            {
                const result = isNumericLookup[value];
                if (result !== void 0) {
                    return result;
                }
                const length = value.length;
                if (length === 0) {
                    return isNumericLookup[value] = false;
                }
                let ch = 0;
                let i8 = 0;
                for(; i8 < length; ++i8){
                    ch = value.charCodeAt(i8);
                    if (i8 === 0 && ch === 48 && length > 1 || ch < 48 || ch > 57) {
                        return isNumericLookup[value] = false;
                    }
                }
                return isNumericLookup[value] = true;
            }
        default:
            return false;
    }
}
function getOwnNonIndexProperties(obj, filter) {
    let allProperties = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj), 
    ];
    if (Array.isArray(obj)) {
        allProperties = allProperties.filter((k)=>!isArrayIndex(k)
        );
    }
    if (filter === 0) {
        return allProperties;
    }
    const result = [];
    for (const key of allProperties){
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc === undefined) {
            continue;
        }
        if (filter & 1 && !desc.writable) {
            continue;
        }
        if (filter & 2 && !desc.enumerable) {
            continue;
        }
        if (filter & 4 && !desc.configurable) {
            continue;
        }
        if (filter & 8 && typeof key === "string") {
            continue;
        }
        if (filter & 16 && typeof key === "symbol") {
            continue;
        }
        result.push(key);
    }
    return result;
}
const kObjectType = 0;
const kArrayExtrasType = 2;
const kRejected = 2;
const meta = [
    '\\x00',
    '\\x01',
    '\\x02',
    '\\x03',
    '\\x04',
    '\\x05',
    '\\x06',
    '\\x07',
    '\\b',
    '\\t',
    '\\n',
    '\\x0B',
    '\\f',
    '\\r',
    '\\x0E',
    '\\x0F',
    '\\x10',
    '\\x11',
    '\\x12',
    '\\x13',
    '\\x14',
    '\\x15',
    '\\x16',
    '\\x17',
    '\\x18',
    '\\x19',
    '\\x1A',
    '\\x1B',
    '\\x1C',
    '\\x1D',
    '\\x1E',
    '\\x1F',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    "\\'",
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '\\\\',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '\\x7F',
    '\\x80',
    '\\x81',
    '\\x82',
    '\\x83',
    '\\x84',
    '\\x85',
    '\\x86',
    '\\x87',
    '\\x88',
    '\\x89',
    '\\x8A',
    '\\x8B',
    '\\x8C',
    '\\x8D',
    '\\x8E',
    '\\x8F',
    '\\x90',
    '\\x91',
    '\\x92',
    '\\x93',
    '\\x94',
    '\\x95',
    '\\x96',
    '\\x97',
    '\\x98',
    '\\x99',
    '\\x9A',
    '\\x9B',
    '\\x9C',
    '\\x9D',
    '\\x9E',
    '\\x9F'
];
const isUndetectableObject = (v)=>typeof v === "undefined" && v !== undefined
;
const strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c\x7f-\x9f]/;
const strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c\x7f-\x9f]/g;
const strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c\x7f-\x9f]/;
const strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c\x7f-\x9f]/g;
const keyStrRegExp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
const numberRegExp = /^(0|[1-9][0-9]*)$/;
const nodeModulesRegExp = /[/\\]node_modules[/\\](.+?)(?=[/\\])/g;
const classRegExp = /^(\s+[^(]*?)\s*{/;
const stripCommentsRegExp = /(\/\/.*?\n)|(\/\*(.|\n)*?\*\/)/g;
const inspectDefaultOptions = {
    showHidden: false,
    depth: 2,
    colors: false,
    customInspect: true,
    showProxy: false,
    maxArrayLength: 100,
    maxStringLength: 10000,
    breakLength: 80,
    compact: 3,
    sorted: false,
    getters: false
};
function getUserOptions(ctx, isCrossContext) {
    const ret = {
        stylize: ctx.stylize,
        showHidden: ctx.showHidden,
        depth: ctx.depth,
        colors: ctx.colors,
        customInspect: ctx.customInspect,
        showProxy: ctx.showProxy,
        maxArrayLength: ctx.maxArrayLength,
        maxStringLength: ctx.maxStringLength,
        breakLength: ctx.breakLength,
        compact: ctx.compact,
        sorted: ctx.sorted,
        getters: ctx.getters,
        ...ctx.userOptions
    };
    if (isCrossContext) {
        Object.setPrototypeOf(ret, null);
        for (const key of Object.keys(ret)){
            if ((typeof ret[key] === "object" || typeof ret[key] === "function") && ret[key] !== null) {
                delete ret[key];
            }
        }
        ret.stylize = Object.setPrototypeOf((value, flavour)=>{
            let stylized;
            try {
                stylized = `${ctx.stylize(value, flavour)}`;
            } catch  {}
            if (typeof stylized !== "string") return value;
            return stylized;
        }, null);
    }
    return ret;
}
function inspect(value, opts) {
    const ctx = {
        budget: {},
        indentationLvl: 0,
        seen: [],
        currentDepth: 0,
        stylize: stylizeNoColor,
        showHidden: inspectDefaultOptions.showHidden,
        depth: inspectDefaultOptions.depth,
        colors: inspectDefaultOptions.colors,
        customInspect: inspectDefaultOptions.customInspect,
        showProxy: inspectDefaultOptions.showProxy,
        maxArrayLength: inspectDefaultOptions.maxArrayLength,
        maxStringLength: inspectDefaultOptions.maxStringLength,
        breakLength: inspectDefaultOptions.breakLength,
        compact: inspectDefaultOptions.compact,
        sorted: inspectDefaultOptions.sorted,
        getters: inspectDefaultOptions.getters
    };
    if (arguments.length > 1) {
        if (arguments.length > 2) {
            if (arguments[2] !== undefined) {
                ctx.depth = arguments[2];
            }
            if (arguments.length > 3 && arguments[3] !== undefined) {
                ctx.colors = arguments[3];
            }
        }
        if (typeof opts === "boolean") {
            ctx.showHidden = opts;
        } else if (opts) {
            const optKeys = Object.keys(opts);
            for(let i9 = 0; i9 < optKeys.length; ++i9){
                const key = optKeys[i9];
                if (inspectDefaultOptions.hasOwnProperty(key) || key === "stylize") {
                    ctx[key] = opts[key];
                } else if (ctx.userOptions === undefined) {
                    ctx.userOptions = opts;
                }
            }
        }
    }
    if (ctx.colors) ctx.stylize = stylizeWithColor;
    if (ctx.maxArrayLength === null) ctx.maxArrayLength = Infinity;
    if (ctx.maxStringLength === null) ctx.maxStringLength = Infinity;
    return formatValue(ctx, value, 0);
}
const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");
inspect.custom = customInspectSymbol;
Object.defineProperty(inspect, "defaultOptions", {
    get () {
        return inspectDefaultOptions;
    },
    set (options) {
        validateObject(options, "options");
        return Object.assign(inspectDefaultOptions, options);
    }
});
const defaultFG = 39;
const defaultBG = 49;
inspect.colors = Object.assign(Object.create(null), {
    reset: [
        0,
        0
    ],
    bold: [
        1,
        22
    ],
    dim: [
        2,
        22
    ],
    italic: [
        3,
        23
    ],
    underline: [
        4,
        24
    ],
    blink: [
        5,
        25
    ],
    inverse: [
        7,
        27
    ],
    hidden: [
        8,
        28
    ],
    strikethrough: [
        9,
        29
    ],
    doubleunderline: [
        21,
        24
    ],
    black: [
        30,
        defaultFG
    ],
    red: [
        31,
        defaultFG
    ],
    green: [
        32,
        defaultFG
    ],
    yellow: [
        33,
        defaultFG
    ],
    blue: [
        34,
        defaultFG
    ],
    magenta: [
        35,
        defaultFG
    ],
    cyan: [
        36,
        defaultFG
    ],
    white: [
        37,
        defaultFG
    ],
    bgBlack: [
        40,
        defaultBG
    ],
    bgRed: [
        41,
        defaultBG
    ],
    bgGreen: [
        42,
        defaultBG
    ],
    bgYellow: [
        43,
        defaultBG
    ],
    bgBlue: [
        44,
        defaultBG
    ],
    bgMagenta: [
        45,
        defaultBG
    ],
    bgCyan: [
        46,
        defaultBG
    ],
    bgWhite: [
        47,
        defaultBG
    ],
    framed: [
        51,
        54
    ],
    overlined: [
        53,
        55
    ],
    gray: [
        90,
        defaultFG
    ],
    redBright: [
        91,
        defaultFG
    ],
    greenBright: [
        92,
        defaultFG
    ],
    yellowBright: [
        93,
        defaultFG
    ],
    blueBright: [
        94,
        defaultFG
    ],
    magentaBright: [
        95,
        defaultFG
    ],
    cyanBright: [
        96,
        defaultFG
    ],
    whiteBright: [
        97,
        defaultFG
    ],
    bgGray: [
        100,
        defaultBG
    ],
    bgRedBright: [
        101,
        defaultBG
    ],
    bgGreenBright: [
        102,
        defaultBG
    ],
    bgYellowBright: [
        103,
        defaultBG
    ],
    bgBlueBright: [
        104,
        defaultBG
    ],
    bgMagentaBright: [
        105,
        defaultBG
    ],
    bgCyanBright: [
        106,
        defaultBG
    ],
    bgWhiteBright: [
        107,
        defaultBG
    ]
});
function defineColorAlias(target, alias) {
    Object.defineProperty(inspect.colors, alias, {
        get () {
            return this[target];
        },
        set (value) {
            this[target] = value;
        },
        configurable: true,
        enumerable: false
    });
}
defineColorAlias("gray", "grey");
defineColorAlias("gray", "blackBright");
defineColorAlias("bgGray", "bgGrey");
defineColorAlias("bgGray", "bgBlackBright");
defineColorAlias("dim", "faint");
defineColorAlias("strikethrough", "crossedout");
defineColorAlias("strikethrough", "strikeThrough");
defineColorAlias("strikethrough", "crossedOut");
defineColorAlias("hidden", "conceal");
defineColorAlias("inverse", "swapColors");
defineColorAlias("inverse", "swapcolors");
defineColorAlias("doubleunderline", "doubleUnderline");
inspect.styles = Object.assign(Object.create(null), {
    special: "cyan",
    number: "yellow",
    bigint: "yellow",
    boolean: "yellow",
    undefined: "grey",
    null: "bold",
    string: "green",
    symbol: "green",
    date: "magenta",
    regexp: "red",
    module: "underline"
});
function addQuotes(str, quotes) {
    if (quotes === -1) {
        return `"${str}"`;
    }
    if (quotes === -2) {
        return `\`${str}\``;
    }
    return `'${str}'`;
}
const escapeFn = (str)=>meta[str.charCodeAt(0)]
;
function strEscape(str) {
    let escapeTest = strEscapeSequencesRegExp;
    let escapeReplace = strEscapeSequencesReplacer;
    let singleQuote = 39;
    if (str.includes("'")) {
        if (!str.includes('"')) {
            singleQuote = -1;
        } else if (!str.includes("`") && !str.includes("${")) {
            singleQuote = -2;
        }
        if (singleQuote !== 39) {
            escapeTest = strEscapeSequencesRegExpSingle;
            escapeReplace = strEscapeSequencesReplacerSingle;
        }
    }
    if (str.length < 5000 && !escapeTest.test(str)) {
        return addQuotes(str, singleQuote);
    }
    if (str.length > 100) {
        str = str.replace(escapeReplace, escapeFn);
        return addQuotes(str, singleQuote);
    }
    let result = "";
    let last1 = 0;
    const lastIndex = str.length;
    for(let i10 = 0; i10 < lastIndex; i10++){
        const point = str.charCodeAt(i10);
        if (point === singleQuote || point === 92 || point < 32 || point > 126 && point < 160) {
            if (last1 === i10) {
                result += meta[point];
            } else {
                result += `${str.slice(last1, i10)}${meta[point]}`;
            }
            last1 = i10 + 1;
        }
    }
    if (last1 !== lastIndex) {
        result += str.slice(last1);
    }
    return addQuotes(result, singleQuote);
}
function stylizeWithColor(str, styleType) {
    const style = inspect.styles[styleType];
    if (style !== undefined) {
        const color = inspect.colors[style];
        if (color !== undefined) {
            return `\u001b[${color[0]}m${str}\u001b[${color[1]}m`;
        }
    }
    return str;
}
function stylizeNoColor(str) {
    return str;
}
function formatValue(ctx, value, recurseTimes, typedArray) {
    if (typeof value !== "object" && typeof value !== "function" && !isUndetectableObject(value)) {
        return formatPrimitive(ctx.stylize, value, ctx);
    }
    if (value === null) {
        return ctx.stylize("null", "null");
    }
    const context = value;
    const proxy = undefined;
    if (ctx.customInspect) {
        const maybeCustom = value[customInspectSymbol];
        if (typeof maybeCustom === "function" && maybeCustom !== inspect && !(value.constructor && value.constructor.prototype === value)) {
            const depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
            const isCrossContext = proxy !== undefined || !(context instanceof Object);
            const ret = maybeCustom.call(context, depth, getUserOptions(ctx, isCrossContext));
            if (ret !== context) {
                if (typeof ret !== "string") {
                    return formatValue(ctx, ret, recurseTimes);
                }
                return ret.replace(/\n/g, `\n${" ".repeat(ctx.indentationLvl)}`);
            }
        }
    }
    if (ctx.seen.includes(value)) {
        let index = 1;
        if (ctx.circular === undefined) {
            ctx.circular = new Map();
            ctx.circular.set(value, index);
        } else {
            index = ctx.circular.get(value);
            if (index === undefined) {
                index = ctx.circular.size + 1;
                ctx.circular.set(value, index);
            }
        }
        return ctx.stylize(`[Circular *${index}]`, "special");
    }
    return formatRaw(ctx, value, recurseTimes, typedArray);
}
function formatRaw(ctx, value, recurseTimes, typedArray) {
    let keys;
    let protoProps;
    if (ctx.showHidden && (recurseTimes <= ctx.depth || ctx.depth === null)) {
        protoProps = [];
    }
    const constructor = getConstructorName(value, ctx, recurseTimes, protoProps);
    if (protoProps !== undefined && protoProps.length === 0) {
        protoProps = undefined;
    }
    let tag = value[Symbol.toStringTag];
    if (typeof tag !== "string") {
        tag = "";
    }
    let base = "";
    let formatter = getEmptyFormatArray;
    let braces;
    let noIterator = true;
    let i11 = 0;
    const filter = ctx.showHidden ? 0 : 2;
    let extrasType = 0;
    if (value[Symbol.iterator] || constructor === null) {
        noIterator = false;
        if (Array.isArray(value)) {
            const prefix = constructor !== "Array" || tag !== "" ? getPrefix(constructor, tag, "Array", `(${value.length})`) : "";
            keys = getOwnNonIndexProperties(value, filter);
            braces = [
                `${prefix}[`,
                "]"
            ];
            if (value.length === 0 && keys.length === 0 && protoProps === undefined) {
                return `${braces[0]}]`;
            }
            extrasType = kArrayExtrasType;
            formatter = formatArray;
        } else if (isSet1(value)) {
            const size = value.size;
            const prefix = getPrefix(constructor, tag, "Set", `(${size})`);
            keys = getKeys(value, ctx.showHidden);
            formatter = constructor !== null ? formatSet.bind(null, value) : formatSet.bind(null, value.values());
            if (size === 0 && keys.length === 0 && protoProps === undefined) {
                return `${prefix}{}`;
            }
            braces = [
                `${prefix}{`,
                "}"
            ];
        } else if (isMap1(value)) {
            const size = value.size;
            const prefix = getPrefix(constructor, tag, "Map", `(${size})`);
            keys = getKeys(value, ctx.showHidden);
            formatter = constructor !== null ? formatMap.bind(null, value) : formatMap.bind(null, value.entries());
            if (size === 0 && keys.length === 0 && protoProps === undefined) {
                return `${prefix}{}`;
            }
            braces = [
                `${prefix}{`,
                "}"
            ];
        } else if (isTypedArray(value)) {
            keys = getOwnNonIndexProperties(value, filter);
            const bound = value;
            const fallback = "";
            const size = value.length;
            const prefix = getPrefix(constructor, tag, fallback, `(${size})`);
            braces = [
                `${prefix}[`,
                "]"
            ];
            if (value.length === 0 && keys.length === 0 && !ctx.showHidden) {
                return `${braces[0]}]`;
            }
            formatter = formatTypedArray.bind(null, bound, size);
            extrasType = kArrayExtrasType;
        } else if (isMapIterator1(value)) {
            keys = getKeys(value, ctx.showHidden);
            braces = getIteratorBraces("Map", tag);
            formatter = formatIterator.bind(null, braces);
        } else if (isSetIterator1(value)) {
            keys = getKeys(value, ctx.showHidden);
            braces = getIteratorBraces("Set", tag);
            formatter = formatIterator.bind(null, braces);
        } else {
            noIterator = true;
        }
    }
    if (noIterator) {
        keys = getKeys(value, ctx.showHidden);
        braces = [
            "{",
            "}"
        ];
        if (constructor === "Object") {
            if (isArgumentsObject1(value)) {
                braces[0] = "[Arguments] {";
            } else if (tag !== "") {
                braces[0] = `${getPrefix(constructor, tag, "Object")}{`;
            }
            if (keys.length === 0 && protoProps === undefined) {
                return `${braces[0]}}`;
            }
        } else if (typeof value === "function") {
            base = getFunctionBase(value, constructor, tag);
            if (keys.length === 0 && protoProps === undefined) {
                return ctx.stylize(base, "special");
            }
        } else if (isRegExp1(value)) {
            base = RegExp(constructor !== null ? value : new RegExp(value)).toString();
            const prefix = getPrefix(constructor, tag, "RegExp");
            if (prefix !== "RegExp ") {
                base = `${prefix}${base}`;
            }
            if (keys.length === 0 && protoProps === undefined || recurseTimes > ctx.depth && ctx.depth !== null) {
                return ctx.stylize(base, "regexp");
            }
        } else if (isDate1(value)) {
            base = Number.isNaN(value.getTime()) ? value.toString() : value.toISOString();
            const prefix = getPrefix(constructor, tag, "Date");
            if (prefix !== "Date ") {
                base = `${prefix}${base}`;
            }
            if (keys.length === 0 && protoProps === undefined) {
                return ctx.stylize(base, "date");
            }
        } else if (value instanceof Error) {
            base = formatError(value, constructor, tag, ctx, keys);
            if (keys.length === 0 && protoProps === undefined) {
                return base;
            }
        } else if (isAnyArrayBuffer1(value)) {
            const arrayType = isArrayBuffer1(value) ? "ArrayBuffer" : "SharedArrayBuffer";
            const prefix = getPrefix(constructor, tag, arrayType);
            if (typedArray === undefined) {
                formatter = formatArrayBuffer;
            } else if (keys.length === 0 && protoProps === undefined) {
                return prefix + `{ byteLength: ${formatNumber(ctx.stylize, value.byteLength)} }`;
            }
            braces[0] = `${prefix}{`;
            Array.prototype.unshift(keys, "byteLength");
        } else if (isDataView1(value)) {
            braces[0] = `${getPrefix(constructor, tag, "DataView")}{`;
            Array.prototype.unshift(keys, "byteLength", "byteOffset", "buffer");
        } else if (isPromise1(value)) {
            braces[0] = `${getPrefix(constructor, tag, "Promise")}{`;
            formatter = formatPromise;
        } else if (isWeakSet1(value)) {
            braces[0] = `${getPrefix(constructor, tag, "WeakSet")}{`;
            formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
        } else if (isWeakMap1(value)) {
            braces[0] = `${getPrefix(constructor, tag, "WeakMap")}{`;
            formatter = ctx.showHidden ? formatWeakMap : formatWeakCollection;
        } else if (isModuleNamespaceObject1(value)) {
            braces[0] = `${getPrefix(constructor, tag, "Module")}{`;
            formatter = formatNamespaceObject.bind(null, keys);
        } else if (isBoxedPrimitive1(value)) {
            base = getBoxedBase(value, ctx, keys, constructor, tag);
            if (keys.length === 0 && protoProps === undefined) {
                return base;
            }
        } else {
            if (keys.length === 0 && protoProps === undefined) {
                return `${getCtxStyle(value, constructor, tag)}{}`;
            }
            braces[0] = `${getCtxStyle(value, constructor, tag)}{`;
        }
    }
    if (recurseTimes > ctx.depth && ctx.depth !== null) {
        let constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);
        if (constructor !== null) {
            constructorName = `[${constructorName}]`;
        }
        return ctx.stylize(constructorName, "special");
    }
    recurseTimes += 1;
    ctx.seen.push(value);
    ctx.currentDepth = recurseTimes;
    let output;
    const indentationLvl = ctx.indentationLvl;
    try {
        output = formatter(ctx, value, recurseTimes);
        for(i11 = 0; i11 < keys.length; i11++){
            output.push(formatProperty(ctx, value, recurseTimes, keys[i11], extrasType));
        }
        if (protoProps !== undefined) {
            output.push(...protoProps);
        }
    } catch (err) {
        const constructorName = getCtxStyle(value, constructor, tag).slice(0, -1);
        return handleMaxCallStackSize(ctx, err, constructorName, indentationLvl);
    }
    if (ctx.circular !== undefined) {
        const index = ctx.circular.get(value);
        if (index !== undefined) {
            const reference = ctx.stylize(`<ref *${index}>`, "special");
            if (ctx.compact !== true) {
                base = base === "" ? reference : `${reference} ${base}`;
            } else {
                braces[0] = `${reference} ${braces[0]}`;
            }
        }
    }
    ctx.seen.pop();
    if (ctx.sorted) {
        const comparator = ctx.sorted === true ? undefined : ctx.sorted;
        if (extrasType === 0) {
            output = output.sort(comparator);
        } else if (keys.length > 1) {
            const sorted = output.slice(output.length - keys.length).sort(comparator);
            output.splice(output.length - keys.length, keys.length, ...sorted);
        }
    }
    const res = reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value);
    const budget = ctx.budget[ctx.indentationLvl] || 0;
    const newLength = budget + res.length;
    ctx.budget[ctx.indentationLvl] = newLength;
    if (newLength > 2 ** 27) {
        ctx.depth = -1;
    }
    return res;
}
const builtInObjects = new Set(Object.getOwnPropertyNames(globalThis).filter((e)=>/^[A-Z][a-zA-Z0-9]+$/.test(e)
));
function addPrototypeProperties(ctx, main, obj, recurseTimes, output) {
    let depth = 0;
    let keys;
    let keySet;
    do {
        if (depth !== 0 || main === obj) {
            obj = Object.getPrototypeOf(obj);
            if (obj === null) {
                return;
            }
            const descriptor = Object.getOwnPropertyDescriptor(obj, "constructor");
            if (descriptor !== undefined && typeof descriptor.value === "function" && builtInObjects.has(descriptor.value.name)) {
                return;
            }
        }
        if (depth === 0) {
            keySet = new Set();
        } else {
            Array.prototype.forEach(keys, (key)=>keySet.add(key)
            );
        }
        keys = Reflect.ownKeys(obj);
        Array.prototype.push(ctx.seen, main);
        for (const key1 of keys){
            if (key1 === "constructor" || main.hasOwnProperty(key1) || depth !== 0 && keySet.has(key1)) {
                continue;
            }
            const desc = Object.getOwnPropertyDescriptor(obj, key1);
            if (typeof desc.value === "function") {
                continue;
            }
            const value = formatProperty(ctx, obj, recurseTimes, key1, 0, desc, main);
            if (ctx.colors) {
                Array.prototype.push(output, `\u001b[2m${value}\u001b[22m`);
            } else {
                Array.prototype.push(output, value);
            }
        }
        Array.prototype.pop(ctx.seen);
    }while (++depth !== 3)
}
function getConstructorName(obj, ctx, recurseTimes, protoProps) {
    let firstProto;
    const tmp = obj;
    while(obj || isUndetectableObject(obj)){
        const descriptor = Object.getOwnPropertyDescriptor(obj, "constructor");
        if (descriptor !== undefined && typeof descriptor.value === "function" && descriptor.value.name !== "" && isInstanceof(tmp, descriptor.value)) {
            if (protoProps !== undefined && (firstProto !== obj || !builtInObjects.has(descriptor.value.name))) {
                addPrototypeProperties(ctx, tmp, firstProto || tmp, recurseTimes, protoProps);
            }
            return descriptor.value.name;
        }
        obj = Object.getPrototypeOf(obj);
        if (firstProto === undefined) {
            firstProto = obj;
        }
    }
    if (firstProto === null) {
        return null;
    }
    const res = undefined;
    if (recurseTimes > ctx.depth && ctx.depth !== null) {
        return `${res} <Complex prototype>`;
    }
    const protoConstr = getConstructorName(firstProto, ctx, recurseTimes + 1, protoProps);
    if (protoConstr === null) {
        return `${res} <${inspect(firstProto, {
            ...ctx,
            customInspect: false,
            depth: -1
        })}>`;
    }
    return `${res} <${protoConstr}>`;
}
function formatPrimitive(fn, value, ctx) {
    if (typeof value === "string") {
        let trailer = "";
        if (value.length > ctx.maxStringLength) {
            const remaining = value.length - ctx.maxStringLength;
            value = value.slice(0, ctx.maxStringLength);
            trailer = `... ${remaining} more character${remaining > 1 ? "s" : ""}`;
        }
        if (ctx.compact !== true && value.length > 16 && value.length > ctx.breakLength - ctx.indentationLvl - 4) {
            return value.split(/(?<=\n)/).map((line)=>fn(strEscape(line), "string")
            ).join(` +\n${" ".repeat(ctx.indentationLvl + 2)}`) + trailer;
        }
        return fn(strEscape(value), "string") + trailer;
    }
    if (typeof value === "number") {
        return formatNumber(fn, value);
    }
    if (typeof value === "bigint") {
        return formatBigInt(fn, value);
    }
    if (typeof value === "boolean") {
        return fn(`${value}`, "boolean");
    }
    if (typeof value === "undefined") {
        return fn("undefined", "undefined");
    }
    return fn(value.toString(), "symbol");
}
function getEmptyFormatArray() {
    return [];
}
function isInstanceof(object, proto) {
    try {
        return object instanceof proto;
    } catch  {
        return false;
    }
}
function getPrefix(constructor, tag, fallback, size = "") {
    if (constructor === null) {
        if (tag !== "" && fallback !== tag) {
            return `[${fallback}${size}: null prototype] [${tag}] `;
        }
        return `[${fallback}${size}: null prototype] `;
    }
    if (tag !== "" && constructor !== tag) {
        return `${constructor}${size} [${tag}] `;
    }
    return `${constructor}${size} `;
}
function formatArray(ctx, value, recurseTimes) {
    const valLen = value.length;
    const len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);
    const remaining = valLen - len;
    const output = [];
    for(let i12 = 0; i12 < len; i12++){
        if (!value.hasOwnProperty(i12)) {
            return formatSpecialArray(ctx, value, recurseTimes, len, output, i12);
        }
        output.push(formatProperty(ctx, value, recurseTimes, i12, 1));
    }
    if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? "s" : ""}`);
    }
    return output;
}
function getCtxStyle(_value, constructor, tag) {
    let fallback = "";
    if (constructor === null) {
        if (fallback === tag) {
            fallback = "Object";
        }
    }
    return getPrefix(constructor, tag, fallback);
}
function getKeys(value, showHidden) {
    let keys;
    const symbols = Object.getOwnPropertySymbols(value);
    if (showHidden) {
        keys = Object.getOwnPropertyNames(value);
        if (symbols.length !== 0) {
            Array.prototype.push.apply(keys, symbols);
        }
    } else {
        try {
            keys = Object.keys(value);
        } catch (_err) {
            keys = Object.getOwnPropertyNames(value);
        }
        if (symbols.length !== 0) {}
    }
    return keys;
}
function formatSet(value, ctx, _ignored, recurseTimes) {
    const output = [];
    ctx.indentationLvl += 2;
    for (const v of value){
        Array.prototype.push(output, formatValue(ctx, v, recurseTimes));
    }
    ctx.indentationLvl -= 2;
    return output;
}
function formatMap(value, ctx, _gnored, recurseTimes) {
    const output = [];
    ctx.indentationLvl += 2;
    for (const { 0: k , 1: v  } of value){
        output.push(`${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
    }
    ctx.indentationLvl -= 2;
    return output;
}
function formatTypedArray(value, length, ctx, _ignored, recurseTimes) {
    const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), length);
    const remaining = value.length - maxLength;
    const output = new Array(maxLength);
    const elementFormatter = value.length > 0 && typeof value[0] === "number" ? formatNumber : formatBigInt;
    for(let i13 = 0; i13 < maxLength; ++i13){
        output[i13] = elementFormatter(ctx.stylize, value[i13]);
    }
    if (remaining > 0) {
        output[maxLength] = `... ${remaining} more item${remaining > 1 ? "s" : ""}`;
    }
    if (ctx.showHidden) {
        ctx.indentationLvl += 2;
        for (const key of [
            "BYTES_PER_ELEMENT",
            "length",
            "byteLength",
            "byteOffset",
            "buffer", 
        ]){
            const str = formatValue(ctx, value[key], recurseTimes, true);
            Array.prototype.push(output, `[${key}]: ${str}`);
        }
        ctx.indentationLvl -= 2;
    }
    return output;
}
function getIteratorBraces(type, tag) {
    if (tag !== `${type} Iterator`) {
        if (tag !== "") {
            tag += "] [";
        }
        tag += `${type} Iterator`;
    }
    return [
        `[${tag}] {`,
        "}"
    ];
}
function formatIterator(braces, ctx, value, recurseTimes) {
    const { 0: entries , 1: isKeyValue  } = value;
    if (isKeyValue) {
        braces[0] = braces[0].replace(/ Iterator] {$/, " Entries] {");
        return formatMapIterInner(ctx, recurseTimes, entries, 2);
    }
    return formatSetIterInner(ctx, recurseTimes, entries, 1);
}
function getFunctionBase(value, constructor, tag) {
    const stringified = Function.prototype.toString(value);
    if (stringified.slice(0, 5) === "class" && stringified.endsWith("}")) {
        const slice = stringified.slice(5, -1);
        const bracketIndex = slice.indexOf("{");
        if (bracketIndex !== -1 && (!slice.slice(0, bracketIndex).includes("(") || classRegExp.test(slice.replace(stripCommentsRegExp)))) {
            return getClassBase(value, constructor, tag);
        }
    }
    let type = "Function";
    if (isGeneratorFunction1(value)) {
        type = `Generator${type}`;
    }
    if (isAsyncFunction1(value)) {
        type = `Async${type}`;
    }
    let base = `[${type}`;
    if (constructor === null) {
        base += " (null prototype)";
    }
    if (value.name === "") {
        base += " (anonymous)";
    } else {
        base += `: ${value.name}`;
    }
    base += "]";
    if (constructor !== type && constructor !== null) {
        base += ` ${constructor}`;
    }
    if (tag !== "" && constructor !== tag) {
        base += ` [${tag}]`;
    }
    return base;
}
function formatError(err, constructor, tag, ctx, keys) {
    const name = err.name != null ? String(err.name) : "Error";
    let len = name.length;
    let stack = err.stack ? String(err.stack) : err.toString();
    if (!ctx.showHidden && keys.length !== 0) {
        for (const name of [
            "name",
            "message",
            "stack"
        ]){
            const index = keys.indexOf(name);
            if (index !== -1 && stack.includes(err[name])) {
                keys.splice(index, 1);
            }
        }
    }
    if (constructor === null || name.endsWith("Error") && stack.startsWith(name) && (stack.length === len || stack[len] === ":" || stack[len] === "\n")) {
        let fallback = "Error";
        if (constructor === null) {
            const start = stack.match(/^([A-Z][a-z_ A-Z0-9[\]()-]+)(?::|\n {4}at)/) || stack.match(/^([a-z_A-Z0-9-]*Error)$/);
            fallback = start && start[1] || "";
            len = fallback.length;
            fallback = fallback || "Error";
        }
        const prefix = getPrefix(constructor, tag, fallback).slice(0, -1);
        if (name !== prefix) {
            if (prefix.includes(name)) {
                if (len === 0) {
                    stack = `${prefix}: ${stack}`;
                } else {
                    stack = `${prefix}${stack.slice(len)}`;
                }
            } else {
                stack = `${prefix} [${name}]${stack.slice(len)}`;
            }
        }
    }
    let pos = err.message && stack.indexOf(err.message) || -1;
    if (pos !== -1) {
        pos += err.message.length;
    }
    const stackStart = stack.indexOf("\n    at", pos);
    if (stackStart === -1) {
        stack = `[${stack}]`;
    } else if (ctx.colors) {
        let newStack = stack.slice(0, stackStart);
        const lines = stack.slice(stackStart + 1).split("\n");
        for (const line of lines){
            let nodeModule;
            newStack += "\n";
            let pos = 0;
            while(nodeModule = nodeModulesRegExp.exec(line)){
                newStack += line.slice(pos, nodeModule.index + 14);
                newStack += ctx.stylize(nodeModule[1], "module");
                pos = nodeModule.index + nodeModule[0].length;
            }
            newStack += pos === 0 ? line : line.slice(pos);
        }
        stack = newStack;
    }
    if (ctx.indentationLvl !== 0) {
        const indentation = " ".repeat(ctx.indentationLvl);
        stack = stack.replace(/\n/g, `\n${indentation}`);
    }
    return stack;
}
let hexSlice;
function formatArrayBuffer(ctx, value) {
    let buffer4;
    try {
        buffer4 = new Uint8Array(value);
    } catch  {
        return [
            ctx.stylize("(detached)", "special")
        ];
    }
    let str = hexSlice(buffer4, 0, Math.min(ctx.maxArrayLength, buffer4.length)).replace(/(.{2})/g, "$1 ").trim();
    const remaining = buffer4.length - ctx.maxArrayLength;
    if (remaining > 0) {
        str += ` ... ${remaining} more byte${remaining > 1 ? "s" : ""}`;
    }
    return [
        `${ctx.stylize("[Uint8Contents]", "special")}: <${str}>`
    ];
}
function formatNumber(fn, value) {
    return fn(Object.is(value, -0) ? "-0" : `${value}`, "number");
}
function formatPromise(ctx, value, recurseTimes) {
    let output;
    const { 0: state1 , 1: result  } = value;
    if (state1 === 0) {
        output = [
            ctx.stylize("<pending>", "special")
        ];
    } else {
        ctx.indentationLvl += 2;
        const str = formatValue(ctx, result, recurseTimes);
        ctx.indentationLvl -= 2;
        output = [
            state1 === kRejected ? `${ctx.stylize("<rejected>", "special")} ${str}` : str, 
        ];
    }
    return output;
}
function formatWeakCollection(ctx) {
    return [
        ctx.stylize("<items unknown>", "special")
    ];
}
function formatWeakSet(ctx, value, recurseTimes) {
    const entries = value;
    return formatSetIterInner(ctx, recurseTimes, entries, 0);
}
function formatWeakMap(ctx, value, recurseTimes) {
    const entries = value;
    return formatMapIterInner(ctx, recurseTimes, entries, 0);
}
function formatProperty(ctx, value, recurseTimes, key, type, desc, original = value) {
    let name, str;
    let extra = " ";
    desc = desc || Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key],
        enumerable: true
    };
    if (desc.value !== undefined) {
        const diff = ctx.compact !== true || type !== 0 ? 2 : 3;
        ctx.indentationLvl += diff;
        str = formatValue(ctx, desc.value, recurseTimes);
        if (diff === 3 && ctx.breakLength < getStringWidth(str, ctx.colors)) {
            extra = `\n${" ".repeat(ctx.indentationLvl)}`;
        }
        ctx.indentationLvl -= diff;
    } else if (desc.get !== undefined) {
        const label = desc.set !== undefined ? "Getter/Setter" : "Getter";
        const s = ctx.stylize;
        const sp = "special";
        if (ctx.getters && (ctx.getters === true || ctx.getters === "get" && desc.set === undefined || ctx.getters === "set" && desc.set !== undefined)) {
            try {
                const tmp = desc.get.call(original);
                ctx.indentationLvl += 2;
                if (tmp === null) {
                    str = `${s(`[${label}:`, sp)} ${s("null", "null")}${s("]", sp)}`;
                } else if (typeof tmp === "object") {
                    str = `${s(`[${label}]`, sp)} ${formatValue(ctx, tmp, recurseTimes)}`;
                } else {
                    const primitive = formatPrimitive(s, tmp, ctx);
                    str = `${s(`[${label}:`, sp)} ${primitive}${s("]", sp)}`;
                }
                ctx.indentationLvl -= 2;
            } catch (err) {
                const message = `<Inspection threw (${err.message})>`;
                str = `${s(`[${label}:`, sp)} ${message}${s("]", sp)}`;
            }
        } else {
            str = ctx.stylize(`[${label}]`, sp);
        }
    } else if (desc.set !== undefined) {
        str = ctx.stylize("[Setter]", "special");
    } else {
        str = ctx.stylize("undefined", "undefined");
    }
    if (type === 1) {
        return str;
    }
    if (typeof key === "symbol") {
        const tmp = key.toString().replace(strEscapeSequencesReplacer, escapeFn);
        name = `[${ctx.stylize(tmp, "symbol")}]`;
    } else if (key === "__proto__") {
        name = "['__proto__']";
    } else if (desc.enumerable === false) {
        const tmp = key.replace(strEscapeSequencesReplacer, escapeFn);
        name = `[${tmp}]`;
    } else if (keyStrRegExp.test(key)) {
        name = ctx.stylize(key, "name");
    } else {
        name = ctx.stylize(strEscape(key), "string");
    }
    return `${name}:${extra}${str}`;
}
function handleMaxCallStackSize(_ctx, _err, _constructorName, _indentationLvl) {}
const colorRegExp = /\u001b\[\d\d?m/g;
function removeColors(str) {
    return str.replace(colorRegExp, "");
}
function isBelowBreakLength(ctx, output, start, base) {
    let totalLength = output.length + start;
    if (totalLength + output.length > ctx.breakLength) {
        return false;
    }
    for(let i14 = 0; i14 < output.length; i14++){
        if (ctx.colors) {
            totalLength += removeColors(output[i14]).length;
        } else {
            totalLength += output[i14].length;
        }
        if (totalLength > ctx.breakLength) {
            return false;
        }
    }
    return base === "" || !base.includes("\n");
}
function formatBigInt(fn, value) {
    return fn(`${value}n`, "bigint");
}
function formatNamespaceObject(keys, ctx, value, recurseTimes) {
    const output = new Array(keys.length);
    for(let i15 = 0; i15 < keys.length; i15++){
        try {
            output[i15] = formatProperty(ctx, value, recurseTimes, keys[i15], kObjectType);
        } catch (_err) {
            const tmp = {
                [keys[i15]]: ""
            };
            output[i15] = formatProperty(ctx, tmp, recurseTimes, keys[i15], kObjectType);
            const pos = output[i15].lastIndexOf(" ");
            output[i15] = output[i15].slice(0, pos + 1) + ctx.stylize("<uninitialized>", "special");
        }
    }
    keys.length = 0;
    return output;
}
function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i16) {
    const keys = Object.keys(value);
    let index = i16;
    for(; i16 < keys.length && output.length < maxLength; i16++){
        const key = keys[i16];
        const tmp = +key;
        if (tmp > 2 ** 32 - 2) {
            break;
        }
        if (`${index}` !== key) {
            if (!numberRegExp.test(key)) {
                break;
            }
            const emptyItems = tmp - index;
            const ending = emptyItems > 1 ? "s" : "";
            const message = `<${emptyItems} empty item${ending}>`;
            output.push(ctx.stylize(message, "undefined"));
            index = tmp;
            if (output.length === maxLength) {
                break;
            }
        }
        output.push(formatProperty(ctx, value, recurseTimes, key, 1));
        index++;
    }
    const remaining = value.length - index;
    if (output.length !== maxLength) {
        if (remaining > 0) {
            const ending = remaining > 1 ? "s" : "";
            const message = `<${remaining} empty item${ending}>`;
            output.push(ctx.stylize(message, "undefined"));
        }
    } else if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? "s" : ""}`);
    }
    return output;
}
function getBoxedBase(value, ctx, keys, constructor, tag) {
    let type;
    if (isNumberObject1(value)) {
        type = "Number";
    } else if (isStringObject1(value)) {
        type = "String";
        keys.splice(0, value.length);
    } else if (isBooleanObject1(value)) {
        type = "Boolean";
    } else if (isBigIntObject1(value)) {
        type = "BigInt";
    } else {
        type = "Symbol";
    }
    let base = `[${type}`;
    if (type !== constructor) {
        if (constructor === null) {
            base += " (null prototype)";
        } else {
            base += ` (${constructor})`;
        }
    }
    base += `: ${formatPrimitive(stylizeNoColor, value.valueOf(), ctx)}]`;
    if (tag !== "" && tag !== constructor) {
        base += ` [${tag}]`;
    }
    if (keys.length !== 0 || ctx.stylize === stylizeNoColor) {
        return base;
    }
    return ctx.stylize(base, type.toLowerCase());
}
function getClassBase(value, constructor, tag) {
    const hasName = value.hasOwnProperty("name");
    const name = hasName && value.name || "(anonymous)";
    let base = `class ${name}`;
    if (constructor !== "Function" && constructor !== null) {
        base += ` [${constructor}]`;
    }
    if (tag !== "" && constructor !== tag) {
        base += ` [${tag}]`;
    }
    if (constructor !== null) {
        const superName = Object.getPrototypeOf(value).name;
        if (superName) {
            base += ` extends ${superName}`;
        }
    } else {
        base += " extends [null prototype]";
    }
    return `[${base}]`;
}
function reduceToSingleString(ctx, output, base, braces, extrasType, recurseTimes, value) {
    if (ctx.compact !== true) {
        if (typeof ctx.compact === "number" && ctx.compact >= 1) {
            const entries = output.length;
            if (extrasType === 2 && entries > 6) {
                output = groupArrayElements(ctx, output, value);
            }
            if (ctx.currentDepth - recurseTimes < ctx.compact && entries === output.length) {
                const start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;
                if (isBelowBreakLength(ctx, output, start, base)) {
                    return `${base ? `${base} ` : ""}${braces[0]} ${join(output, ", ")}` + ` ${braces[1]}`;
                }
            }
        }
        const indentation = `\n${" ".repeat(ctx.indentationLvl)}`;
        return `${base ? `${base} ` : ""}${braces[0]}${indentation}  ` + `${join(output, `,${indentation}  `)}${indentation}${braces[1]}`;
    }
    if (isBelowBreakLength(ctx, output, 0, base)) {
        return `${braces[0]}${base ? ` ${base}` : ""} ${join(output, ", ")} ` + braces[1];
    }
    const indentation = " ".repeat(ctx.indentationLvl);
    const ln = base === "" && braces[0].length === 1 ? " " : `${base ? ` ${base}` : ""}\n${indentation}  `;
    return `${braces[0]}${ln}${join(output, `,\n${indentation}  `)} ${braces[1]}`;
}
function join(output, separator) {
    let str = "";
    if (output.length !== 0) {
        const lastIndex = output.length - 1;
        for(let i17 = 0; i17 < lastIndex; i17++){
            str += output[i17];
            str += separator;
        }
        str += output[lastIndex];
    }
    return str;
}
function groupArrayElements(ctx, output, value) {
    let totalLength = 0;
    let maxLength = 0;
    let i18 = 0;
    let outputLength = output.length;
    if (ctx.maxArrayLength < output.length) {
        outputLength--;
    }
    const separatorSpace = 2;
    const dataLen = new Array(outputLength);
    for(; i18 < outputLength; i18++){
        const len = getStringWidth(output[i18], ctx.colors);
        dataLen[i18] = len;
        totalLength += len + separatorSpace;
        if (maxLength < len) {
            maxLength = len;
        }
    }
    const actualMax = maxLength + 2;
    if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (totalLength / actualMax > 5 || maxLength <= 6)) {
        const averageBias = Math.sqrt(actualMax - totalLength / output.length);
        const biasedMax = Math.max(actualMax - 3 - averageBias, 1);
        const columns = Math.min(Math.round(Math.sqrt(2.5 * biasedMax * outputLength) / biasedMax), Math.floor((ctx.breakLength - ctx.indentationLvl) / actualMax), ctx.compact * 4, 15);
        if (columns <= 1) {
            return output;
        }
        const tmp = [];
        const maxLineLength = [];
        for(let i19 = 0; i19 < columns; i19++){
            let lineMaxLength = 0;
            for(let j = i19; j < output.length; j += columns){
                if (dataLen[j] > lineMaxLength) {
                    lineMaxLength = dataLen[j];
                }
            }
            lineMaxLength += separatorSpace;
            maxLineLength[i19] = lineMaxLength;
        }
        let order = String.prototype.padStart;
        if (value !== undefined) {
            for(let i20 = 0; i20 < output.length; i20++){
                if (typeof value[i20] !== "number" && typeof value[i20] !== "bigint") {
                    order = String.prototype.padEnd;
                    break;
                }
            }
        }
        for(let i1 = 0; i1 < outputLength; i1 += columns){
            const max = Math.min(i1 + columns, outputLength);
            let str = "";
            let j = i1;
            for(; j < max - 1; j++){
                const padding = maxLineLength[j - i1] + output[j].length - dataLen[j];
                str += `${output[j]}, `.padStart(padding, " ");
            }
            if (order === String.prototype.padStart) {
                const padding = maxLineLength[j - i1] + output[j].length - dataLen[j] - 2;
                str += output[j].padStart(padding, " ");
            } else {
                str += output[j];
            }
            Array.prototype.push(tmp, str);
        }
        if (ctx.maxArrayLength < output.length) {
            Array.prototype.push(tmp, output[outputLength]);
        }
        output = tmp;
    }
    return output;
}
function formatMapIterInner(ctx, recurseTimes, entries, state2) {
    const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
    const len = entries.length / 2;
    const remaining = len - maxArrayLength;
    const maxLength = Math.min(maxArrayLength, len);
    let output = new Array(maxLength);
    let i21 = 0;
    ctx.indentationLvl += 2;
    if (state2 === 0) {
        for(; i21 < maxLength; i21++){
            const pos = i21 * 2;
            output[i21] = `${formatValue(ctx, entries[pos], recurseTimes)} => ${formatValue(ctx, entries[pos + 1], recurseTimes)}`;
        }
        if (!ctx.sorted) {
            output = output.sort();
        }
    } else {
        for(; i21 < maxLength; i21++){
            const pos = i21 * 2;
            const res = [
                formatValue(ctx, entries[pos], recurseTimes),
                formatValue(ctx, entries[pos + 1], recurseTimes), 
            ];
            output[i21] = reduceToSingleString(ctx, res, "", [
                "[",
                "]"
            ], kArrayExtrasType, recurseTimes);
        }
    }
    ctx.indentationLvl -= 2;
    if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? "s" : ""}`);
    }
    return output;
}
function formatSetIterInner(ctx, recurseTimes, entries, state3) {
    const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
    const maxLength = Math.min(maxArrayLength, entries.length);
    const output = new Array(maxLength);
    ctx.indentationLvl += 2;
    for(let i22 = 0; i22 < maxLength; i22++){
        output[i22] = formatValue(ctx, entries[i22], recurseTimes);
    }
    ctx.indentationLvl -= 2;
    if (state3 === 0 && !ctx.sorted) {
        output.sort();
    }
    const remaining = entries.length - maxLength;
    if (remaining > 0) {
        Array.prototype.push(output, `... ${remaining} more item${remaining > 1 ? "s" : ""}`);
    }
    return output;
}
const ansiPattern = "[\\u001B\\u009B][[\\]()#;?]*" + "(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*" + "|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)" + "|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))";
const ansi = new RegExp(ansiPattern, "g");
function getStringWidth(str, removeControlChars = true) {
    let width = 0;
    if (removeControlChars) {
        str = stripVTControlCharacters(str);
    }
    str = str.normalize("NFC");
    for (const __char of str[Symbol.iterator]()){
        const code3 = __char.codePointAt(0);
        if (isFullWidthCodePoint(code3)) {
            width += 2;
        } else if (!isZeroWidthCodePoint(code3)) {
            width++;
        }
    }
    return width;
}
const isFullWidthCodePoint = (code4)=>{
    return code4 >= 4352 && (code4 <= 4447 || code4 === 9001 || code4 === 9002 || code4 >= 11904 && code4 <= 12871 && code4 !== 12351 || code4 >= 12880 && code4 <= 19903 || code4 >= 19968 && code4 <= 42182 || code4 >= 43360 && code4 <= 43388 || code4 >= 44032 && code4 <= 55203 || code4 >= 63744 && code4 <= 64255 || code4 >= 65040 && code4 <= 65049 || code4 >= 65072 && code4 <= 65131 || code4 >= 65281 && code4 <= 65376 || code4 >= 65504 && code4 <= 65510 || code4 >= 110592 && code4 <= 110593 || code4 >= 127488 && code4 <= 127569 || code4 >= 127744 && code4 <= 128591 || code4 >= 131072 && code4 <= 262141);
};
const isZeroWidthCodePoint = (code5)=>{
    return code5 <= 31 || code5 >= 127 && code5 <= 159 || code5 >= 768 && code5 <= 879 || code5 >= 8203 && code5 <= 8207 || code5 >= 8400 && code5 <= 8447 || code5 >= 65024 && code5 <= 65039 || code5 >= 65056 && code5 <= 65071 || code5 >= 917760 && code5 <= 917999;
};
function stripVTControlCharacters(str) {
    validateString(str, "str");
    return str.replace(ansi, "");
}
new Set();
const kCustomPromisifiedSymbol = Symbol.for("nodejs.util.promisify.custom");
const kCustomPromisifyArgsSymbol = Symbol.for("nodejs.util.promisify.customArgs");
function promisify(original) {
    validateFunction(original, "original");
    if (original[kCustomPromisifiedSymbol]) {
        const fn = original[kCustomPromisifiedSymbol];
        validateFunction(fn, "util.promisify.custom");
        return Object.defineProperty(fn, kCustomPromisifiedSymbol, {
            value: fn,
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    const argumentNames = original[kCustomPromisifyArgsSymbol];
    function fn(...args) {
        return new Promise((resolve, reject)=>{
            args.push((err, ...values)=>{
                if (err) {
                    return reject(err);
                }
                if (argumentNames !== undefined && values.length > 1) {
                    const obj = {};
                    for(let i23 = 0; i23 < argumentNames.length; i23++){
                        obj[argumentNames[i23]] = values[i23];
                    }
                    resolve(obj);
                } else {
                    resolve(values[0]);
                }
            });
            Reflect.apply(original, this, args);
        });
    }
    Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
        value: fn,
        enumerable: false,
        writable: false,
        configurable: true
    });
    return Object.defineProperties(fn, Object.getOwnPropertyDescriptors(original));
}
promisify.custom = kCustomPromisifiedSymbol;
let core;
if (Deno?.core) {
    core = Deno.core;
} else {
    core = {
        setNextTickCallback: undefined,
        evalContext (_code, _filename) {
            throw new Error("Deno.core.evalContext is not supported in this environment");
        },
        encode (chunk) {
            return new TextEncoder().encode(chunk);
        }
    };
}
const kSize = 2048;
const kMask = 2048 - 1;
class FixedCircularBuffer {
    bottom;
    top;
    list;
    next;
    constructor(){
        this.bottom = 0;
        this.top = 0;
        this.list = new Array(kSize);
        this.next = null;
    }
    isEmpty() {
        return this.top === this.bottom;
    }
    isFull() {
        return (this.top + 1 & kMask) === this.bottom;
    }
    push(data20) {
        this.list[this.top] = data20;
        this.top = this.top + 1 & kMask;
    }
    shift() {
        const nextItem = this.list[this.bottom];
        if (nextItem === undefined) {
            return null;
        }
        this.list[this.bottom] = undefined;
        this.bottom = this.bottom + 1 & kMask;
        return nextItem;
    }
}
class FixedQueue {
    head;
    tail;
    constructor(){
        this.head = this.tail = new FixedCircularBuffer();
    }
    isEmpty() {
        return this.head.isEmpty();
    }
    push(data21) {
        if (this.head.isFull()) {
            this.head = this.head.next = new FixedCircularBuffer();
        }
        this.head.push(data21);
    }
    shift() {
        const tail = this.tail;
        const next = tail.shift();
        if (tail.isEmpty() && tail.next !== null) {
            this.tail = tail.next;
        }
        return next;
    }
}
const queue = new FixedQueue();
if (typeof core.setNextTickCallback !== "undefined") {
    function runNextTicks() {
        if (!core.hasTickScheduled()) {
            core.runMicrotasks();
        }
        if (!core.hasTickScheduled()) {
            return true;
        }
        processTicksAndRejections();
        return true;
    }
    function processTicksAndRejections() {
        let tock;
        do {
            while(tock = queue.shift()){
                try {
                    const callback = tock.callback;
                    if (tock.args === undefined) {
                        callback();
                    } else {
                        const args = tock.args;
                        switch(args.length){
                            case 1:
                                callback(args[0]);
                                break;
                            case 2:
                                callback(args[0], args[1]);
                                break;
                            case 3:
                                callback(args[0], args[1], args[2]);
                                break;
                            case 4:
                                callback(args[0], args[1], args[2], args[3]);
                                break;
                            default:
                                callback(...args);
                        }
                    }
                } finally{}
            }
            core.runMicrotasks();
        }while (!queue.isEmpty())
        core.setHasTickScheduled(false);
    }
    core.setNextTickCallback(processTicksAndRejections);
    core.setMacrotaskCallback(runNextTicks);
} else {}
var State;
(function(State1) {
    State1[State1["PASSTHROUGH"] = 0] = "PASSTHROUGH";
    State1[State1["PERCENT"] = 1] = "PERCENT";
    State1[State1["POSITIONAL"] = 2] = "POSITIONAL";
    State1[State1["PRECISION"] = 3] = "PRECISION";
    State1[State1["WIDTH"] = 4] = "WIDTH";
})(State || (State = {}));
var WorP;
(function(WorP1) {
    WorP1[WorP1["WIDTH"] = 0] = "WIDTH";
    WorP1[WorP1["PRECISION"] = 1] = "PRECISION";
})(WorP || (WorP = {}));
var F;
(function(F2) {
    F2[F2["sign"] = 1] = "sign";
    F2[F2["mantissa"] = 2] = "mantissa";
    F2[F2["fractional"] = 3] = "fractional";
    F2[F2["esign"] = 4] = "esign";
    F2[F2["exponent"] = 5] = "exponent";
})(F || (F = {}));
let debugImpls;
function initializeDebugEnv(debugEnv) {
    debugImpls = Object.create(null);
    if (debugEnv) {
        debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replaceAll("*", ".*").replaceAll(",", "$|^");
        new RegExp(`^${debugEnv}$`, "i");
    } else {}
}
let state = "";
if (Deno.permissions) {
    state = (await Deno.permissions.query({
        name: "env",
        variable: "NODE_DEBUG"
    })).state;
}
if (state === "granted") {
    initializeDebugEnv(Deno.env.get("NODE_DEBUG") ?? "");
} else {
    initializeDebugEnv("");
}
const osType = (()=>{
    const { Deno  } = globalThis;
    if (typeof Deno?.build?.os === "string") {
        return Deno.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const os = {
    UV_UDP_REUSEADDR: 4,
    dlopen: {
        RTLD_LAZY: 1,
        RTLD_NOW: 2,
        RTLD_GLOBAL: 8,
        RTLD_LOCAL: 4
    },
    errno: {
        E2BIG: 7,
        EACCES: 13,
        EADDRINUSE: 48,
        EADDRNOTAVAIL: 49,
        EAFNOSUPPORT: 47,
        EAGAIN: 35,
        EALREADY: 37,
        EBADF: 9,
        EBADMSG: 94,
        EBUSY: 16,
        ECANCELED: 89,
        ECHILD: 10,
        ECONNABORTED: 53,
        ECONNREFUSED: 61,
        ECONNRESET: 54,
        EDEADLK: 11,
        EDESTADDRREQ: 39,
        EDOM: 33,
        EDQUOT: 69,
        EEXIST: 17,
        EFAULT: 14,
        EFBIG: 27,
        EHOSTUNREACH: 65,
        EIDRM: 90,
        EILSEQ: 92,
        EINPROGRESS: 36,
        EINTR: 4,
        EINVAL: 22,
        EIO: 5,
        EISCONN: 56,
        EISDIR: 21,
        ELOOP: 62,
        EMFILE: 24,
        EMLINK: 31,
        EMSGSIZE: 40,
        EMULTIHOP: 95,
        ENAMETOOLONG: 63,
        ENETDOWN: 50,
        ENETRESET: 52,
        ENETUNREACH: 51,
        ENFILE: 23,
        ENOBUFS: 55,
        ENODATA: 96,
        ENODEV: 19,
        ENOENT: 2,
        ENOEXEC: 8,
        ENOLCK: 77,
        ENOLINK: 97,
        ENOMEM: 12,
        ENOMSG: 91,
        ENOPROTOOPT: 42,
        ENOSPC: 28,
        ENOSR: 98,
        ENOSTR: 99,
        ENOSYS: 78,
        ENOTCONN: 57,
        ENOTDIR: 20,
        ENOTEMPTY: 66,
        ENOTSOCK: 38,
        ENOTSUP: 45,
        ENOTTY: 25,
        ENXIO: 6,
        EOPNOTSUPP: 102,
        EOVERFLOW: 84,
        EPERM: 1,
        EPIPE: 32,
        EPROTO: 100,
        EPROTONOSUPPORT: 43,
        EPROTOTYPE: 41,
        ERANGE: 34,
        EROFS: 30,
        ESPIPE: 29,
        ESRCH: 3,
        ESTALE: 70,
        ETIME: 101,
        ETIMEDOUT: 60,
        ETXTBSY: 26,
        EWOULDBLOCK: 35,
        EXDEV: 18
    },
    signals: {
        SIGHUP: 1,
        SIGINT: 2,
        SIGQUIT: 3,
        SIGILL: 4,
        SIGTRAP: 5,
        SIGABRT: 6,
        SIGIOT: 6,
        SIGBUS: 10,
        SIGFPE: 8,
        SIGKILL: 9,
        SIGUSR1: 30,
        SIGSEGV: 11,
        SIGUSR2: 31,
        SIGPIPE: 13,
        SIGALRM: 14,
        SIGTERM: 15,
        SIGCHLD: 20,
        SIGCONT: 19,
        SIGSTOP: 17,
        SIGTSTP: 18,
        SIGTTIN: 21,
        SIGTTOU: 22,
        SIGURG: 16,
        SIGXCPU: 24,
        SIGXFSZ: 25,
        SIGVTALRM: 26,
        SIGPROF: 27,
        SIGWINCH: 28,
        SIGIO: 23,
        SIGINFO: 29,
        SIGSYS: 12
    },
    priority: {
        PRIORITY_LOW: 19,
        PRIORITY_BELOW_NORMAL: 10,
        PRIORITY_NORMAL: 0,
        PRIORITY_ABOVE_NORMAL: -7,
        PRIORITY_HIGH: -14,
        PRIORITY_HIGHEST: -20
    }
};
os.errno.EEXIST;
os.errno.ENOENT;
const codeToErrorWindows = [
    [
        -4093,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -4092,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -4091,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -4090,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -4089,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -4088,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -4084,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -4083,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -4082,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -4081,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -4079,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -4078,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -4077,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -4076,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -4075,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -4074,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -4036,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -4073,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4072,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -4071,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -4070,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -4069,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -4068,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -4067,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -4066,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -4065,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -4064,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -4063,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -4062,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -4061,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -4060,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -4059,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -4058,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -4057,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -4056,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -4035,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -4055,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -4054,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -4053,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -4052,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -4051,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -4050,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -4049,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -4048,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -4047,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -4046,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -4045,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -4044,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -4034,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -4043,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -4042,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -4041,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -4040,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -4039,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -4038,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -4037,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -4033,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -4032,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -4031,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -4030,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -4029,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -4028,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -4027,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeWindows = codeToErrorWindows.map(([status, [error]])=>[
        error,
        status
    ]
);
const codeToErrorDarwin = [
    [
        -7,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -13,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -48,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -49,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -47,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -35,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -37,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -9,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -16,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -89,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -53,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -61,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -54,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -39,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -17,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -14,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -27,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -65,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -22,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -5,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -56,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -21,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -62,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -24,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -40,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -63,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -50,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -51,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -23,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -55,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -19,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -2,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -12,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -4056,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -42,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -28,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -78,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -57,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -20,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -66,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -38,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -45,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -1,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -32,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -100,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -43,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -41,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -34,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -30,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -58,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -29,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -3,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -60,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -26,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -18,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -6,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -31,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -64,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -4030,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -25,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -79,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -92,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeDarwin = codeToErrorDarwin.map(([status, [code6]])=>[
        code6,
        status
    ]
);
const codeToErrorLinux = [
    [
        -7,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -13,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -98,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -99,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -97,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -11,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -114,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -9,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -16,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -125,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -103,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -111,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -104,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -89,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -17,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -14,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -27,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -113,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -22,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -5,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -106,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -21,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -40,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -24,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -90,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -36,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -100,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -101,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -23,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -105,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -19,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -2,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -12,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -64,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -92,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -28,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -38,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -107,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -20,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -39,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -88,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -95,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -1,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -32,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -71,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -93,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -91,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -34,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -30,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -108,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -29,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -3,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -110,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -26,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -18,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -6,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -31,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -112,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -121,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -25,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -4028,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -84,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeLinux = codeToErrorLinux.map(([status, [code7]])=>[
        code7,
        status
    ]
);
const errorMap = new Map(osType === "windows" ? codeToErrorWindows : osType === "darwin" ? codeToErrorDarwin : osType === "linux" ? codeToErrorLinux : unreachable());
const codeMap = new Map(osType === "windows" ? errorToCodeWindows : osType === "darwin" ? errorToCodeDarwin : osType === "linux" ? errorToCodeLinux : unreachable());
var Encodings;
(function(Encodings1) {
    Encodings1[Encodings1["ASCII"] = 0] = "ASCII";
    Encodings1[Encodings1["UTF8"] = 1] = "UTF8";
    Encodings1[Encodings1["BASE64"] = 2] = "BASE64";
    Encodings1[Encodings1["UCS2"] = 3] = "UCS2";
    Encodings1[Encodings1["BINARY"] = 4] = "BINARY";
    Encodings1[Encodings1["HEX"] = 5] = "HEX";
    Encodings1[Encodings1["BUFFER"] = 6] = "BUFFER";
    Encodings1[Encodings1["BASE64URL"] = 7] = "BASE64URL";
    Encodings1[Encodings1["LATIN1"] = 4] = "LATIN1";
})(Encodings || (Encodings = {}));
const encodings = [];
encodings[Encodings.ASCII] = "ascii";
encodings[Encodings.BASE64] = "base64";
encodings[Encodings.BASE64URL] = "base64url";
encodings[Encodings.BUFFER] = "buffer";
encodings[Encodings.HEX] = "hex";
encodings[Encodings.LATIN1] = "latin1";
encodings[Encodings.UCS2] = "utf16le";
encodings[Encodings.UTF8] = "utf8";
function numberToBytes(n) {
    if (n === 0) return new Uint8Array([
        0
    ]);
    const bytes = [];
    bytes.unshift(n & 255);
    while(n >= 256){
        n = n >>> 8;
        bytes.unshift(n & 255);
    }
    return new Uint8Array(bytes);
}
function findLastIndex(targetBuffer, buffer5, offset2) {
    offset2 = offset2 > targetBuffer.length ? targetBuffer.length : offset2;
    const searchableBuffer = targetBuffer.slice(0, offset2 + buffer5.length);
    const searchableBufferLastIndex = searchableBuffer.length - 1;
    const bufferLastIndex = buffer5.length - 1;
    let lastMatchIndex = -1;
    let matches = 0;
    let index = -1;
    for(let x = 0; x <= searchableBufferLastIndex; x++){
        if (searchableBuffer[searchableBufferLastIndex - x] === buffer5[bufferLastIndex - matches]) {
            if (lastMatchIndex === -1) {
                lastMatchIndex = x;
            }
            matches++;
        } else {
            matches = 0;
            if (lastMatchIndex !== -1) {
                x = lastMatchIndex + 1;
                lastMatchIndex = -1;
            }
            continue;
        }
        if (matches === buffer5.length) {
            index = x;
            break;
        }
    }
    if (index === -1) return index;
    return searchableBufferLastIndex - index;
}
function indexOfBuffer(targetBuffer, buffer6, byteOffset, encoding, forwardDirection) {
    if (!Encodings[encoding] === undefined) {
        throw new Error(`Unknown encoding code ${encoding}`);
    }
    if (!forwardDirection) {
        if (byteOffset < 0) {
            byteOffset = targetBuffer.length + byteOffset;
        }
        if (buffer6.length === 0) {
            return byteOffset <= targetBuffer.length ? byteOffset : targetBuffer.length;
        }
        return findLastIndex(targetBuffer, buffer6, byteOffset);
    }
    if (buffer6.length === 0) {
        return byteOffset <= targetBuffer.length ? byteOffset : targetBuffer.length;
    }
    return indexOf(targetBuffer, buffer6, byteOffset);
}
function indexOfNumber(targetBuffer, number, byteOffset, forwardDirection) {
    const bytes = numberToBytes(number);
    if (bytes.length > 1) {
        throw new Error("Multi byte number search is not supported");
    }
    return indexOfBuffer(targetBuffer, numberToBytes(number), byteOffset, Encodings.UTF8, forwardDirection);
}
const base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/", 
];
function encode(data22) {
    const uint8 = typeof data22 === "string" ? new TextEncoder().encode(data22) : data22 instanceof Uint8Array ? data22 : new Uint8Array(data22);
    let result = "", i24;
    const l = uint8.length;
    for(i24 = 2; i24 < l; i24 += 3){
        result += base64abc[uint8[i24 - 2] >> 2];
        result += base64abc[(uint8[i24 - 2] & 3) << 4 | uint8[i24 - 1] >> 4];
        result += base64abc[(uint8[i24 - 1] & 15) << 2 | uint8[i24] >> 6];
        result += base64abc[uint8[i24] & 63];
    }
    if (i24 === l + 1) {
        result += base64abc[uint8[i24 - 2] >> 2];
        result += base64abc[(uint8[i24 - 2] & 3) << 4];
        result += "==";
    }
    if (i24 === l) {
        result += base64abc[uint8[i24 - 2] >> 2];
        result += base64abc[(uint8[i24 - 2] & 3) << 4 | uint8[i24 - 1] >> 4];
        result += base64abc[(uint8[i24 - 1] & 15) << 2];
        result += "=";
    }
    return result;
}
function decode(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i25 = 0; i25 < size; i25++){
        bytes[i25] = binString.charCodeAt(i25);
    }
    return bytes;
}
function addPaddingToBase64url(base64url) {
    if (base64url.length % 4 === 2) return base64url + "==";
    if (base64url.length % 4 === 3) return base64url + "=";
    if (base64url.length % 4 === 1) {
        throw new TypeError("Illegal base64url string!");
    }
    return base64url;
}
function convertBase64urlToBase64(b64url) {
    if (!/^[-_A-Z0-9]*?={0,2}$/i.test(b64url)) {
        throw new TypeError("Failed to decode base64url: invalid character");
    }
    return addPaddingToBase64url(b64url).replace(/\-/g, "+").replace(/_/g, "/");
}
function convertBase64ToBase64url(b64) {
    return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function encode1(data23) {
    return convertBase64ToBase64url(encode(data23));
}
function decode1(b64url) {
    return decode(convertBase64urlToBase64(b64url));
}
function asciiToBytes(str) {
    const byteArray = [];
    for(let i26 = 0; i26 < str.length; ++i26){
        byteArray.push(str.charCodeAt(i26) & 255);
    }
    return new Uint8Array(byteArray);
}
function base64ToBytes(str) {
    str = base64clean(str);
    str = str.replaceAll("-", "+").replaceAll("_", "/");
    return decode(str);
}
const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2) return "";
    while(str.length % 4 !== 0){
        str = str + "=";
    }
    return str;
}
function base64UrlToBytes(str) {
    str = base64clean(str);
    str = str.replaceAll("+", "-").replaceAll("/", "_");
    return decode1(str);
}
function hexToBytes(str) {
    const byteArray = new Uint8Array(Math.floor((str || "").length / 2));
    let i27;
    for(i27 = 0; i27 < byteArray.length; i27++){
        const a = Number.parseInt(str[i27 * 2], 16);
        const b = Number.parseInt(str[i27 * 2 + 1], 16);
        if (Number.isNaN(a) && Number.isNaN(b)) {
            break;
        }
        byteArray[i27] = a << 4 | b;
    }
    return new Uint8Array(i27 === byteArray.length ? byteArray : byteArray.slice(0, i27));
}
function utf16leToBytes(str, units) {
    let c, hi, lo;
    const byteArray = [];
    for(let i28 = 0; i28 < str.length; ++i28){
        if ((units -= 2) < 0) {
            break;
        }
        c = str.charCodeAt(i28);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return new Uint8Array(byteArray);
}
function bytesToAscii(bytes) {
    let ret = "";
    for(let i29 = 0; i29 < bytes.length; ++i29){
        ret += String.fromCharCode(bytes[i29] & 127);
    }
    return ret;
}
function bytesToUtf16le(bytes) {
    let res = "";
    for(let i30 = 0; i30 < bytes.length - 1; i30 += 2){
        res += String.fromCharCode(bytes[i30] + bytes[i30 + 1] * 256);
    }
    return res;
}
const utf8Encoder = new TextEncoder();
const float32Array = new Float32Array(1);
const uInt8Float32Array = new Uint8Array(float32Array.buffer);
const float64Array = new Float64Array(1);
const uInt8Float64Array = new Uint8Array(float64Array.buffer);
float32Array[0] = -1;
const bigEndian = uInt8Float32Array[3] === 0;
function readUInt48LE(buf, offset3 = 0) {
    validateNumber(offset3, "offset");
    const first1 = buf[offset3];
    const last2 = buf[offset3 + 5];
    if (first1 === undefined || last2 === undefined) {
        boundsError(offset3, buf.length - 6);
    }
    return first1 + buf[++offset3] * 2 ** 8 + buf[++offset3] * 2 ** 16 + buf[++offset3] * 2 ** 24 + (buf[++offset3] + last2 * 2 ** 8) * 2 ** 32;
}
function readUInt40LE(buf, offset4 = 0) {
    validateNumber(offset4, "offset");
    const first2 = buf[offset4];
    const last3 = buf[offset4 + 4];
    if (first2 === undefined || last3 === undefined) {
        boundsError(offset4, buf.length - 5);
    }
    return first2 + buf[++offset4] * 2 ** 8 + buf[++offset4] * 2 ** 16 + buf[++offset4] * 2 ** 24 + last3 * 2 ** 32;
}
function readUInt24LE(buf, offset5 = 0) {
    validateNumber(offset5, "offset");
    const first3 = buf[offset5];
    const last4 = buf[offset5 + 2];
    if (first3 === undefined || last4 === undefined) {
        boundsError(offset5, buf.length - 3);
    }
    return first3 + buf[++offset5] * 2 ** 8 + last4 * 2 ** 16;
}
function readUInt48BE(buf, offset6 = 0) {
    validateNumber(offset6, "offset");
    const first4 = buf[offset6];
    const last5 = buf[offset6 + 5];
    if (first4 === undefined || last5 === undefined) {
        boundsError(offset6, buf.length - 6);
    }
    return (first4 * 2 ** 8 + buf[++offset6]) * 2 ** 32 + buf[++offset6] * 2 ** 24 + buf[++offset6] * 2 ** 16 + buf[++offset6] * 2 ** 8 + last5;
}
function readUInt40BE(buf, offset7 = 0) {
    validateNumber(offset7, "offset");
    const first5 = buf[offset7];
    const last6 = buf[offset7 + 4];
    if (first5 === undefined || last6 === undefined) {
        boundsError(offset7, buf.length - 5);
    }
    return first5 * 2 ** 32 + buf[++offset7] * 2 ** 24 + buf[++offset7] * 2 ** 16 + buf[++offset7] * 2 ** 8 + last6;
}
function readUInt24BE(buf, offset8 = 0) {
    validateNumber(offset8, "offset");
    const first6 = buf[offset8];
    const last7 = buf[offset8 + 2];
    if (first6 === undefined || last7 === undefined) {
        boundsError(offset8, buf.length - 3);
    }
    return first6 * 2 ** 16 + buf[++offset8] * 2 ** 8 + last7;
}
function readUInt16BE(offset9 = 0) {
    validateNumber(offset9, "offset");
    const first7 = this[offset9];
    const last8 = this[offset9 + 1];
    if (first7 === undefined || last8 === undefined) {
        boundsError(offset9, this.length - 2);
    }
    return first7 * 2 ** 8 + last8;
}
function readUInt32BE(offset10 = 0) {
    validateNumber(offset10, "offset");
    const first8 = this[offset10];
    const last9 = this[offset10 + 3];
    if (first8 === undefined || last9 === undefined) {
        boundsError(offset10, this.length - 4);
    }
    return first8 * 2 ** 24 + this[++offset10] * 2 ** 16 + this[++offset10] * 2 ** 8 + last9;
}
function readDoubleBackwards(buffer7, offset11 = 0) {
    validateNumber(offset11, "offset");
    const first9 = buffer7[offset11];
    const last10 = buffer7[offset11 + 7];
    if (first9 === undefined || last10 === undefined) {
        boundsError(offset11, buffer7.length - 8);
    }
    uInt8Float64Array[7] = first9;
    uInt8Float64Array[6] = buffer7[++offset11];
    uInt8Float64Array[5] = buffer7[++offset11];
    uInt8Float64Array[4] = buffer7[++offset11];
    uInt8Float64Array[3] = buffer7[++offset11];
    uInt8Float64Array[2] = buffer7[++offset11];
    uInt8Float64Array[1] = buffer7[++offset11];
    uInt8Float64Array[0] = last10;
    return float64Array[0];
}
function readDoubleForwards(buffer8, offset12 = 0) {
    validateNumber(offset12, "offset");
    const first10 = buffer8[offset12];
    const last11 = buffer8[offset12 + 7];
    if (first10 === undefined || last11 === undefined) {
        boundsError(offset12, buffer8.length - 8);
    }
    uInt8Float64Array[0] = first10;
    uInt8Float64Array[1] = buffer8[++offset12];
    uInt8Float64Array[2] = buffer8[++offset12];
    uInt8Float64Array[3] = buffer8[++offset12];
    uInt8Float64Array[4] = buffer8[++offset12];
    uInt8Float64Array[5] = buffer8[++offset12];
    uInt8Float64Array[6] = buffer8[++offset12];
    uInt8Float64Array[7] = last11;
    return float64Array[0];
}
function writeDoubleForwards(buffer9, val, offset13 = 0) {
    val = +val;
    checkBounds(buffer9, offset13, 7);
    float64Array[0] = val;
    buffer9[offset13++] = uInt8Float64Array[0];
    buffer9[offset13++] = uInt8Float64Array[1];
    buffer9[offset13++] = uInt8Float64Array[2];
    buffer9[offset13++] = uInt8Float64Array[3];
    buffer9[offset13++] = uInt8Float64Array[4];
    buffer9[offset13++] = uInt8Float64Array[5];
    buffer9[offset13++] = uInt8Float64Array[6];
    buffer9[offset13++] = uInt8Float64Array[7];
    return offset13;
}
function writeDoubleBackwards(buffer10, val, offset14 = 0) {
    val = +val;
    checkBounds(buffer10, offset14, 7);
    float64Array[0] = val;
    buffer10[offset14++] = uInt8Float64Array[7];
    buffer10[offset14++] = uInt8Float64Array[6];
    buffer10[offset14++] = uInt8Float64Array[5];
    buffer10[offset14++] = uInt8Float64Array[4];
    buffer10[offset14++] = uInt8Float64Array[3];
    buffer10[offset14++] = uInt8Float64Array[2];
    buffer10[offset14++] = uInt8Float64Array[1];
    buffer10[offset14++] = uInt8Float64Array[0];
    return offset14;
}
function readFloatBackwards(buffer11, offset15 = 0) {
    validateNumber(offset15, "offset");
    const first11 = buffer11[offset15];
    const last12 = buffer11[offset15 + 3];
    if (first11 === undefined || last12 === undefined) {
        boundsError(offset15, buffer11.length - 4);
    }
    uInt8Float32Array[3] = first11;
    uInt8Float32Array[2] = buffer11[++offset15];
    uInt8Float32Array[1] = buffer11[++offset15];
    uInt8Float32Array[0] = last12;
    return float32Array[0];
}
function readFloatForwards(buffer12, offset16 = 0) {
    validateNumber(offset16, "offset");
    const first12 = buffer12[offset16];
    const last13 = buffer12[offset16 + 3];
    if (first12 === undefined || last13 === undefined) {
        boundsError(offset16, buffer12.length - 4);
    }
    uInt8Float32Array[0] = first12;
    uInt8Float32Array[1] = buffer12[++offset16];
    uInt8Float32Array[2] = buffer12[++offset16];
    uInt8Float32Array[3] = last13;
    return float32Array[0];
}
function writeFloatForwards(buffer13, val, offset17 = 0) {
    val = +val;
    checkBounds(buffer13, offset17, 3);
    float32Array[0] = val;
    buffer13[offset17++] = uInt8Float32Array[0];
    buffer13[offset17++] = uInt8Float32Array[1];
    buffer13[offset17++] = uInt8Float32Array[2];
    buffer13[offset17++] = uInt8Float32Array[3];
    return offset17;
}
function writeFloatBackwards(buffer14, val, offset18 = 0) {
    val = +val;
    checkBounds(buffer14, offset18, 3);
    float32Array[0] = val;
    buffer14[offset18++] = uInt8Float32Array[3];
    buffer14[offset18++] = uInt8Float32Array[2];
    buffer14[offset18++] = uInt8Float32Array[1];
    buffer14[offset18++] = uInt8Float32Array[0];
    return offset18;
}
function readInt24LE(buf, offset19 = 0) {
    validateNumber(offset19, "offset");
    const first13 = buf[offset19];
    const last14 = buf[offset19 + 2];
    if (first13 === undefined || last14 === undefined) {
        boundsError(offset19, buf.length - 3);
    }
    const val = first13 + buf[++offset19] * 2 ** 8 + last14 * 2 ** 16;
    return val | (val & 2 ** 23) * 510;
}
function readInt40LE(buf, offset20 = 0) {
    validateNumber(offset20, "offset");
    const first14 = buf[offset20];
    const last15 = buf[offset20 + 4];
    if (first14 === undefined || last15 === undefined) {
        boundsError(offset20, buf.length - 5);
    }
    return (last15 | (last15 & 2 ** 7) * 33554430) * 2 ** 32 + first14 + buf[++offset20] * 2 ** 8 + buf[++offset20] * 2 ** 16 + buf[++offset20] * 2 ** 24;
}
function readInt48LE(buf, offset21 = 0) {
    validateNumber(offset21, "offset");
    const first15 = buf[offset21];
    const last16 = buf[offset21 + 5];
    if (first15 === undefined || last16 === undefined) {
        boundsError(offset21, buf.length - 6);
    }
    const val = buf[offset21 + 4] + last16 * 2 ** 8;
    return (val | (val & 2 ** 15) * 131070) * 2 ** 32 + first15 + buf[++offset21] * 2 ** 8 + buf[++offset21] * 2 ** 16 + buf[++offset21] * 2 ** 24;
}
function readInt24BE(buf, offset22 = 0) {
    validateNumber(offset22, "offset");
    const first16 = buf[offset22];
    const last17 = buf[offset22 + 2];
    if (first16 === undefined || last17 === undefined) {
        boundsError(offset22, buf.length - 3);
    }
    const val = first16 * 2 ** 16 + buf[++offset22] * 2 ** 8 + last17;
    return val | (val & 2 ** 23) * 510;
}
function readInt48BE(buf, offset23 = 0) {
    validateNumber(offset23, "offset");
    const first17 = buf[offset23];
    const last18 = buf[offset23 + 5];
    if (first17 === undefined || last18 === undefined) {
        boundsError(offset23, buf.length - 6);
    }
    const val = buf[++offset23] + first17 * 2 ** 8;
    return (val | (val & 2 ** 15) * 131070) * 2 ** 32 + buf[++offset23] * 2 ** 24 + buf[++offset23] * 2 ** 16 + buf[++offset23] * 2 ** 8 + last18;
}
function readInt40BE(buf, offset24 = 0) {
    validateNumber(offset24, "offset");
    const first18 = buf[offset24];
    const last19 = buf[offset24 + 4];
    if (first18 === undefined || last19 === undefined) {
        boundsError(offset24, buf.length - 5);
    }
    return (first18 | (first18 & 2 ** 7) * 33554430) * 2 ** 32 + buf[++offset24] * 2 ** 24 + buf[++offset24] * 2 ** 16 + buf[++offset24] * 2 ** 8 + last19;
}
function byteLengthUtf8(str) {
    return utf8Encoder.encode(str).length;
}
function base64ByteLength(str, bytes) {
    if (str.charCodeAt(bytes - 1) === 61) {
        bytes--;
    }
    if (bytes > 1 && str.charCodeAt(bytes - 1) === 61) {
        bytes--;
    }
    return bytes * 3 >>> 2;
}
const encodingsMap = Object.create(null);
for(let i = 0; i < encodings.length; ++i){
    encodingsMap[encodings[i]] = i;
}
const encodingOps = {
    ascii: {
        byteLength: (string)=>string.length
        ,
        encoding: "ascii",
        encodingVal: encodingsMap.ascii,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, asciiToBytes(val), byteOffset, encodingsMap.ascii, dir)
        ,
        slice: (buf, start, end)=>buf.asciiSlice(start, end)
        ,
        write: (buf, string, offset25, len)=>buf.asciiWrite(string, offset25, len)
    },
    base64: {
        byteLength: (string)=>base64ByteLength(string, string.length)
        ,
        encoding: "base64",
        encodingVal: encodingsMap.base64,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, base64ToBytes(val), byteOffset, encodingsMap.base64, dir)
        ,
        slice: (buf, start, end)=>buf.base64Slice(start, end)
        ,
        write: (buf, string, offset26, len)=>buf.base64Write(string, offset26, len)
    },
    base64url: {
        byteLength: (string)=>base64ByteLength(string, string.length)
        ,
        encoding: "base64url",
        encodingVal: encodingsMap.base64url,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, base64UrlToBytes(val), byteOffset, encodingsMap.base64url, dir)
        ,
        slice: (buf, start, end)=>buf.base64urlSlice(start, end)
        ,
        write: (buf, string, offset27, len)=>buf.base64urlWrite(string, offset27, len)
    },
    hex: {
        byteLength: (string)=>string.length >>> 1
        ,
        encoding: "hex",
        encodingVal: encodingsMap.hex,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, hexToBytes(val), byteOffset, encodingsMap.hex, dir)
        ,
        slice: (buf, start, end)=>buf.hexSlice(start, end)
        ,
        write: (buf, string, offset28, len)=>buf.hexWrite(string, offset28, len)
    },
    latin1: {
        byteLength: (string)=>string.length
        ,
        encoding: "latin1",
        encodingVal: encodingsMap.latin1,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, asciiToBytes(val), byteOffset, encodingsMap.latin1, dir)
        ,
        slice: (buf, start, end)=>buf.latin1Slice(start, end)
        ,
        write: (buf, string, offset29, len)=>buf.latin1Write(string, offset29, len)
    },
    ucs2: {
        byteLength: (string)=>string.length * 2
        ,
        encoding: "ucs2",
        encodingVal: encodingsMap.utf16le,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, utf16leToBytes(val), byteOffset, encodingsMap.utf16le, dir)
        ,
        slice: (buf, start, end)=>buf.ucs2Slice(start, end)
        ,
        write: (buf, string, offset30, len)=>buf.ucs2Write(string, offset30, len)
    },
    utf8: {
        byteLength: byteLengthUtf8,
        encoding: "utf8",
        encodingVal: encodingsMap.utf8,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, utf8Encoder.encode(val), byteOffset, encodingsMap.utf8, dir)
        ,
        slice: (buf, start, end)=>buf.utf8Slice(start, end)
        ,
        write: (buf, string, offset31, len)=>buf.utf8Write(string, offset31, len)
    },
    utf16le: {
        byteLength: (string)=>string.length * 2
        ,
        encoding: "utf16le",
        encodingVal: encodingsMap.utf16le,
        indexOf: (buf, val, byteOffset, dir)=>indexOfBuffer(buf, utf16leToBytes(val), byteOffset, encodingsMap.utf16le, dir)
        ,
        slice: (buf, start, end)=>buf.ucs2Slice(start, end)
        ,
        write: (buf, string, offset32, len)=>buf.ucs2Write(string, offset32, len)
    }
};
function getEncodingOps(encoding) {
    encoding = String(encoding).toLowerCase();
    switch(encoding.length){
        case 4:
            if (encoding === "utf8") return encodingOps.utf8;
            if (encoding === "ucs2") return encodingOps.ucs2;
            break;
        case 5:
            if (encoding === "utf-8") return encodingOps.utf8;
            if (encoding === "ascii") return encodingOps.ascii;
            if (encoding === "ucs-2") return encodingOps.ucs2;
            break;
        case 7:
            if (encoding === "utf16le") {
                return encodingOps.utf16le;
            }
            break;
        case 8:
            if (encoding === "utf-16le") {
                return encodingOps.utf16le;
            }
            break;
        case 6:
            if (encoding === "latin1" || encoding === "binary") {
                return encodingOps.latin1;
            }
            if (encoding === "base64") return encodingOps.base64;
        case 3:
            if (encoding === "hex") {
                return encodingOps.hex;
            }
            break;
        case 9:
            if (encoding === "base64url") {
                return encodingOps.base64url;
            }
            break;
    }
}
function _copyActual(source, target, targetStart, sourceStart, sourceEnd) {
    if (sourceEnd - sourceStart > target.length - targetStart) {
        sourceEnd = sourceStart + target.length - targetStart;
    }
    let nb = sourceEnd - sourceStart;
    const sourceLen = source.length - sourceStart;
    if (nb > sourceLen) {
        nb = sourceLen;
    }
    if (sourceStart !== 0 || sourceEnd < source.length) {
        source = new Uint8Array(source.buffer, source.byteOffset + sourceStart, nb);
    }
    target.set(source, targetStart);
    return nb;
}
function boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new codes.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    }
    if (length < 0) {
        throw new codes.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new codes.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
}
function validateNumber(value, name) {
    if (typeof value !== "number") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
}
function checkBounds(buf, offset33, byteLength1) {
    validateNumber(offset33, "offset");
    if (buf[offset33] === undefined || buf[offset33 + byteLength1] === undefined) {
        boundsError(offset33, buf.length - (byteLength1 + 1));
    }
}
function checkInt(value, min, max, buf, offset34, byteLength2) {
    if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
            if (min === 0 || min === 0n) {
                range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
                range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and ` + `< 2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
        } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new codes.ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds(buf, offset34, byteLength2);
}
function toInteger(n, defaultVal) {
    n = +n;
    if (!Number.isNaN(n) && n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) {
        return n % 1 === 0 ? n : Math.floor(n);
    }
    return defaultVal;
}
function writeU_Int8(buf, value, offset35, min, max) {
    value = +value;
    validateNumber(offset35, "offset");
    if (value > max || value < min) {
        throw new codes.ERR_OUT_OF_RANGE("value", `>= ${min} and <= ${max}`, value);
    }
    if (buf[offset35] === undefined) {
        boundsError(offset35, buf.length - 1);
    }
    buf[offset35] = value;
    return offset35 + 1;
}
function writeU_Int16BE(buf, value, offset36, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset36, 1);
    buf[offset36++] = value >>> 8;
    buf[offset36++] = value;
    return offset36;
}
function _writeUInt32LE(buf, value, offset37, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset37, 3);
    buf[offset37++] = value;
    value = value >>> 8;
    buf[offset37++] = value;
    value = value >>> 8;
    buf[offset37++] = value;
    value = value >>> 8;
    buf[offset37++] = value;
    return offset37;
}
function writeU_Int16LE(buf, value, offset38, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset38, 1);
    buf[offset38++] = value;
    buf[offset38++] = value >>> 8;
    return offset38;
}
function _writeUInt32BE(buf, value, offset39, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset39, 3);
    buf[offset39 + 3] = value;
    value = value >>> 8;
    buf[offset39 + 2] = value;
    value = value >>> 8;
    buf[offset39 + 1] = value;
    value = value >>> 8;
    buf[offset39] = value;
    return offset39 + 4;
}
function writeU_Int48BE(buf, value, offset40, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset40, 5);
    const newVal = Math.floor(value * 2 ** -32);
    buf[offset40++] = newVal >>> 8;
    buf[offset40++] = newVal;
    buf[offset40 + 3] = value;
    value = value >>> 8;
    buf[offset40 + 2] = value;
    value = value >>> 8;
    buf[offset40 + 1] = value;
    value = value >>> 8;
    buf[offset40] = value;
    return offset40 + 4;
}
function writeU_Int40BE(buf, value, offset41, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset41, 4);
    buf[offset41++] = Math.floor(value * 2 ** -32);
    buf[offset41 + 3] = value;
    value = value >>> 8;
    buf[offset41 + 2] = value;
    value = value >>> 8;
    buf[offset41 + 1] = value;
    value = value >>> 8;
    buf[offset41] = value;
    return offset41 + 4;
}
function writeU_Int32BE(buf, value, offset42, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset42, 3);
    buf[offset42 + 3] = value;
    value = value >>> 8;
    buf[offset42 + 2] = value;
    value = value >>> 8;
    buf[offset42 + 1] = value;
    value = value >>> 8;
    buf[offset42] = value;
    return offset42 + 4;
}
function writeU_Int24BE(buf, value, offset43, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset43, 2);
    buf[offset43 + 2] = value;
    value = value >>> 8;
    buf[offset43 + 1] = value;
    value = value >>> 8;
    buf[offset43] = value;
    return offset43 + 3;
}
function validateOffset(value, name, min = 0, max = Number.MAX_SAFE_INTEGER) {
    if (typeof value !== "number") {
        throw new codes.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
    if (!Number.isInteger(value)) {
        throw new codes.ERR_OUT_OF_RANGE(name, "an integer", value);
    }
    if (value < min || value > max) {
        throw new codes.ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
}
function writeU_Int48LE(buf, value, offset44, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset44, 5);
    const newVal = Math.floor(value * 2 ** -32);
    buf[offset44++] = value;
    value = value >>> 8;
    buf[offset44++] = value;
    value = value >>> 8;
    buf[offset44++] = value;
    value = value >>> 8;
    buf[offset44++] = value;
    buf[offset44++] = newVal;
    buf[offset44++] = newVal >>> 8;
    return offset44;
}
function writeU_Int40LE(buf, value, offset45, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset45, 4);
    const newVal = value;
    buf[offset45++] = value;
    value = value >>> 8;
    buf[offset45++] = value;
    value = value >>> 8;
    buf[offset45++] = value;
    value = value >>> 8;
    buf[offset45++] = value;
    buf[offset45++] = Math.floor(newVal * 2 ** -32);
    return offset45;
}
function writeU_Int32LE(buf, value, offset46, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset46, 3);
    buf[offset46++] = value;
    value = value >>> 8;
    buf[offset46++] = value;
    value = value >>> 8;
    buf[offset46++] = value;
    value = value >>> 8;
    buf[offset46++] = value;
    return offset46;
}
function writeU_Int24LE(buf, value, offset47, min, max) {
    value = +value;
    checkInt(value, min, max, buf, offset47, 2);
    buf[offset47++] = value;
    value = value >>> 8;
    buf[offset47++] = value;
    value = value >>> 8;
    buf[offset47++] = value;
    return offset47;
}
const kMaxLength = 2147483647;
const MAX_UINT32 = 2 ** 32;
const customInspectSymbol1 = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
const INSPECT_MAX_BYTES = 50;
Object.defineProperty(Buffer.prototype, "parent", {
    enumerable: true,
    get: function() {
        if (!Buffer.isBuffer(this)) {
            return void 0;
        }
        return this.buffer;
    }
});
Object.defineProperty(Buffer.prototype, "offset", {
    enumerable: true,
    get: function() {
        if (!Buffer.isBuffer(this)) {
            return void 0;
        }
        return this.byteOffset;
    }
});
function createBuffer(length) {
    if (length > 2147483647) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, Buffer.prototype);
    return buf;
}
function Buffer(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
            throw new codes.ERR_INVALID_ARG_TYPE("string", "string", arg);
        }
        return _allocUnsafe(arg);
    }
    return _from(arg, encodingOrOffset, length);
}
Buffer.poolSize = 8192;
function _from(value, encodingOrOffset, length) {
    if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
    }
    if (typeof value === "object" && value !== null) {
        if (isAnyArrayBuffer1(value)) {
            return fromArrayBuffer(value, encodingOrOffset, length);
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value && (typeof valueOf === "string" || typeof valueOf === "object")) {
            return _from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) {
            return b;
        }
        if (typeof value[Symbol.toPrimitive] === "function") {
            const primitive = value[Symbol.toPrimitive]("string");
            if (typeof primitive === "string") {
                return fromString(primitive, encodingOrOffset);
            }
        }
    }
    throw new codes.ERR_INVALID_ARG_TYPE("first argument", [
        "string",
        "Buffer",
        "ArrayBuffer",
        "Array",
        "Array-like Object"
    ], value);
}
Buffer.from = function from(value, encodingOrOffset, length) {
    return _from(value, encodingOrOffset, length);
};
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer, Uint8Array);
function assertSize(size) {
    validateNumber(size, "size");
    if (!(size >= 0 && size <= 2147483647)) {
        throw new codes.ERR_INVALID_ARG_VALUE.RangeError("size", size);
    }
}
function _alloc(size, fill, encoding) {
    assertSize(size);
    const buffer15 = createBuffer(size);
    if (fill !== undefined) {
        if (encoding !== undefined && typeof encoding !== "string") {
            throw new codes.ERR_INVALID_ARG_TYPE("encoding", "string", encoding);
        }
        return buffer15.fill(fill, encoding);
    }
    return buffer15;
}
Buffer.alloc = function alloc(size, fill, encoding) {
    return _alloc(size, fill, encoding);
};
function _allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
Buffer.allocUnsafe = function allocUnsafe(size) {
    return _allocUnsafe(size);
};
Buffer.allocUnsafeSlow = function allocUnsafeSlow(size) {
    return _allocUnsafe(size);
};
function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
    }
    if (!Buffer.isEncoding(encoding)) {
        throw new codes.ERR_UNKNOWN_ENCODING(encoding);
    }
    const length = byteLength(string, encoding) | 0;
    let buf = createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) {
        buf = buf.slice(0, actual);
    }
    return buf;
}
function fromArrayLike(array) {
    const length = array.length < 0 ? 0 : checked(array.length) | 0;
    const buf = createBuffer(length);
    for(let i31 = 0; i31 < length; i31 += 1){
        buf[i31] = array[i31] & 255;
    }
    return buf;
}
function fromObject(obj) {
    if (obj.length !== undefined || isAnyArrayBuffer1(obj.buffer)) {
        if (typeof obj.length !== "number") {
            return createBuffer(0);
        }
        return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
    }
}
function checked(length) {
    if (length >= 2147483647) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + 2147483647..toString(16) + " bytes");
    }
    return length | 0;
}
function SlowBuffer(length) {
    assertSize(length);
    return Buffer.alloc(+length);
}
Object.setPrototypeOf(SlowBuffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf(SlowBuffer, Uint8Array);
Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer.prototype;
};
Buffer.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array)) {
        a = Buffer.from(a, a.offset, a.byteLength);
    }
    if (isInstance(b, Uint8Array)) {
        b = Buffer.from(b, b.offset, b.byteLength);
    }
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    }
    if (a === b) {
        return 0;
    }
    let x = a.length;
    let y = b.length;
    for(let i32 = 0, len = Math.min(x, y); i32 < len; ++i32){
        if (a[i32] !== b[i32]) {
            x = a[i32];
            y = b[i32];
            break;
        }
    }
    if (x < y) {
        return -1;
    }
    if (y < x) {
        return 1;
    }
    return 0;
};
Buffer.isEncoding = function isEncoding(encoding) {
    return typeof encoding === "string" && encoding.length !== 0 && normalizeEncoding(encoding) !== undefined;
};
Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
        throw new codes.ERR_INVALID_ARG_TYPE("list", "Array", list);
    }
    if (list.length === 0) {
        return Buffer.alloc(0);
    }
    if (length === undefined) {
        length = 0;
        for(let i33 = 0; i33 < list.length; i33++){
            if (list[i33].length) {
                length += list[i33].length;
            }
        }
    } else {
        validateOffset(length, "length");
    }
    const buffer16 = Buffer.allocUnsafe(length);
    let pos = 0;
    for(let i34 = 0; i34 < list.length; i34++){
        const buf = list[i34];
        if (!isUint8Array(buf)) {
            throw new codes.ERR_INVALID_ARG_TYPE(`list[${i34}]`, [
                "Buffer",
                "Uint8Array"
            ], list[i34]);
        }
        pos += _copyActual(buf, buffer16, pos, 0, buf.length);
    }
    if (pos < length) {
        buffer16.fill(0, pos, length);
    }
    return buffer16;
};
function byteLength(string, encoding) {
    if (typeof string !== "string") {
        if (isArrayBufferView(string) || isAnyArrayBuffer1(string)) {
            return string.byteLength;
        }
        throw new codes.ERR_INVALID_ARG_TYPE("string", [
            "string",
            "Buffer",
            "ArrayBuffer"
        ], string);
    }
    const len = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) {
        return 0;
    }
    if (!encoding) {
        return mustMatch ? -1 : byteLengthUtf8(string);
    }
    const ops = getEncodingOps(encoding);
    if (ops === undefined) {
        return mustMatch ? -1 : byteLengthUtf8(string);
    }
    return ops.byteLength(string);
}
Buffer.byteLength = byteLength;
Buffer.prototype._isBuffer = true;
function swap(b, n, m) {
    const i35 = b[n];
    b[n] = b[m];
    b[m] = i35;
}
Buffer.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for(let i36 = 0; i36 < len; i36 += 2){
        swap(this, i36, i36 + 1);
    }
    return this;
};
Buffer.prototype.swap32 = function swap32() {
    const len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for(let i37 = 0; i37 < len; i37 += 4){
        swap(this, i37, i37 + 3);
        swap(this, i37 + 1, i37 + 2);
    }
    return this;
};
Buffer.prototype.swap64 = function swap64() {
    const len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for(let i38 = 0; i38 < len; i38 += 8){
        swap(this, i38, i38 + 7);
        swap(this, i38 + 1, i38 + 6);
        swap(this, i38 + 2, i38 + 5);
        swap(this, i38 + 3, i38 + 4);
    }
    return this;
};
Buffer.prototype.toString = function toString(encoding, start, end) {
    if (arguments.length === 0) {
        return this.utf8Slice(0, this.length);
    }
    const len = this.length;
    if (start <= 0) {
        start = 0;
    } else if (start >= len) {
        return "";
    } else {
        start |= 0;
    }
    if (end === undefined || end > len) {
        end = len;
    } else {
        end |= 0;
    }
    if (end <= start) {
        return "";
    }
    if (encoding === undefined) {
        return this.utf8Slice(start, end);
    }
    const ops = getEncodingOps(encoding);
    if (ops === undefined) {
        throw new codes.ERR_UNKNOWN_ENCODING(encoding);
    }
    return ops.slice(this, start, end);
};
Buffer.prototype.toLocaleString = Buffer.prototype.toString;
Buffer.prototype.equals = function equals(b) {
    if (!isUint8Array(b)) {
        throw new codes.ERR_INVALID_ARG_TYPE("otherBuffer", [
            "Buffer",
            "Uint8Array"
        ], b);
    }
    if (this === b) {
        return true;
    }
    return Buffer.compare(this, b) === 0;
};
Buffer.prototype.inspect = function inspect() {
    let str = "";
    const max = INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max) {
        str += " ... ";
    }
    return "<Buffer " + str + ">";
};
if (customInspectSymbol1) {
    Buffer.prototype[customInspectSymbol1] = Buffer.prototype.inspect;
}
Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength);
    }
    if (!Buffer.isBuffer(target)) {
        throw new codes.ERR_INVALID_ARG_TYPE("target", [
            "Buffer",
            "Uint8Array"
        ], target);
    }
    if (start === undefined) {
        start = 0;
    } else {
        validateOffset(start, "targetStart", 0, kMaxLength);
    }
    if (end === undefined) {
        end = target.length;
    } else {
        validateOffset(end, "targetEnd", 0, target.length);
    }
    if (thisStart === undefined) {
        thisStart = 0;
    } else {
        validateOffset(start, "sourceStart", 0, kMaxLength);
    }
    if (thisEnd === undefined) {
        thisEnd = this.length;
    } else {
        validateOffset(end, "sourceEnd", 0, this.length);
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new codes.ERR_OUT_OF_RANGE("out of range index", "range");
    }
    if (thisStart >= thisEnd && start >= end) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end) {
        return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) {
        return 0;
    }
    let x = thisEnd - thisStart;
    let y = end - start;
    const len = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for(let i39 = 0; i39 < len; ++i39){
        if (thisCopy[i39] !== targetCopy[i39]) {
            x = thisCopy[i39];
            y = targetCopy[i39];
            break;
        }
    }
    if (x < y) {
        return -1;
    }
    if (y < x) {
        return 1;
    }
    return 0;
};
function bidirectionalIndexOf(buffer17, val, byteOffset, encoding, dir) {
    validateBuffer(buffer17);
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = undefined;
    } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (Number.isNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer17.length || buffer17.byteLength;
    }
    dir = !!dir;
    if (typeof val === "number") {
        return indexOfNumber(buffer17, val >>> 0, byteOffset, dir);
    }
    let ops;
    if (encoding === undefined) {
        ops = encodingOps.utf8;
    } else {
        ops = getEncodingOps(encoding);
    }
    if (typeof val === "string") {
        if (ops === undefined) {
            throw new codes.ERR_UNKNOWN_ENCODING(encoding);
        }
        return ops.indexOf(buffer17, val, byteOffset, dir);
    }
    if (isUint8Array(val)) {
        const encodingVal = ops === undefined ? encodingsMap.utf8 : ops.encodingVal;
        return indexOfBuffer(buffer17, val, byteOffset, encodingVal, dir);
    }
    throw new codes.ERR_INVALID_ARG_TYPE("value", [
        "number",
        "string",
        "Buffer",
        "Uint8Array"
    ], val);
}
Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
Buffer.prototype.asciiSlice = function asciiSlice(offset48, length) {
    if (offset48 === 0 && length === this.length) {
        return bytesToAscii(this);
    } else {
        return bytesToAscii(this.slice(offset48, length));
    }
};
Buffer.prototype.asciiWrite = function asciiWrite(string, offset49, length) {
    return blitBuffer(asciiToBytes(string), this, offset49, length);
};
Buffer.prototype.base64Slice = function base64Slice(offset50, length) {
    if (offset50 === 0 && length === this.length) {
        return encode(this);
    } else {
        return encode(this.slice(offset50, length));
    }
};
Buffer.prototype.base64Write = function base64Write(string, offset51, length) {
    return blitBuffer(base64ToBytes(string), this, offset51, length);
};
Buffer.prototype.base64urlSlice = function base64urlSlice(offset52, length) {
    if (offset52 === 0 && length === this.length) {
        return encode1(this);
    } else {
        return encode1(this.slice(offset52, length));
    }
};
Buffer.prototype.base64urlWrite = function base64urlWrite(string, offset53, length) {
    return blitBuffer(base64UrlToBytes(string), this, offset53, length);
};
Buffer.prototype.hexWrite = function hexWrite(string, offset54, length) {
    return blitBuffer(hexToBytes(string, this.length - offset54), this, offset54, length);
};
Buffer.prototype.hexSlice = function hexSlice(string, offset55, length) {
    return _hexSlice(this, string, offset55, length);
};
Buffer.prototype.latin1Slice = function latin1Slice(string, offset56, length) {
    return _latin1Slice(this, string, offset56, length);
};
Buffer.prototype.latin1Write = function latin1Write(string, offset57, length) {
    return blitBuffer(asciiToBytes(string), this, offset57, length);
};
Buffer.prototype.ucs2Slice = function ucs2Slice(offset58, length) {
    if (offset58 === 0 && length === this.length) {
        return bytesToUtf16le(this);
    } else {
        return bytesToUtf16le(this.slice(offset58, length));
    }
};
Buffer.prototype.ucs2Write = function ucs2Write(string, offset59, length) {
    return blitBuffer(utf16leToBytes(string, this.length - offset59), this, offset59, length);
};
Buffer.prototype.utf8Slice = function utf8Slice(string, offset60, length) {
    return _utf8Slice(this, string, offset60, length);
};
Buffer.prototype.utf8Write = function utf8Write(string, offset61, length) {
    return blitBuffer(utf8ToBytes(string, this.length - offset61), this, offset61, length);
};
Buffer.prototype.write = function write(string, offset62, length, encoding) {
    if (offset62 === undefined) {
        return this.utf8Write(string, 0, this.length);
    }
    if (length === undefined && typeof offset62 === "string") {
        encoding = offset62;
        length = this.length;
        offset62 = 0;
    } else {
        validateOffset(offset62, "offset", 0, this.length);
        const remaining = this.length - offset62;
        if (length === undefined) {
            length = remaining;
        } else if (typeof length === "string") {
            encoding = length;
            length = remaining;
        } else {
            validateOffset(length, "length", 0, this.length);
            if (length > remaining) {
                length = remaining;
            }
        }
    }
    if (!encoding) {
        return this.utf8Write(string, offset62, length);
    }
    const ops = getEncodingOps(encoding);
    if (ops === undefined) {
        throw new codes.ERR_UNKNOWN_ENCODING(encoding);
    }
    return ops.write(this, string, offset62, length);
};
Buffer.prototype.toJSON = function toJSON() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function fromArrayBuffer(obj, byteOffset, length) {
    if (byteOffset === undefined) {
        byteOffset = 0;
    } else {
        byteOffset = +byteOffset;
        if (Number.isNaN(byteOffset)) {
            byteOffset = 0;
        }
    }
    const maxLength = obj.byteLength - byteOffset;
    if (maxLength < 0) {
        throw new codes.ERR_BUFFER_OUT_OF_BOUNDS("offset");
    }
    if (length === undefined) {
        length = maxLength;
    } else {
        length = +length;
        if (length > 0) {
            if (length > maxLength) {
                throw new codes.ERR_BUFFER_OUT_OF_BOUNDS("length");
            }
        } else {
            length = 0;
        }
    }
    const buffer18 = new Uint8Array(obj, byteOffset, length);
    Object.setPrototypeOf(buffer18, Buffer.prototype);
    return buffer18;
}
function _utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i40 = start;
    while(i40 < end){
        const firstByte = buf[i40];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i40 + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i40 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i40 + 1];
                    thirdByte = buf[i40 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i40 + 1];
                    thirdByte = buf[i40 + 2];
                    fourthByte = buf[i40 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i40 += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
}
const MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= 4096) {
        return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i41 = 0;
    while(i41 < len){
        res += String.fromCharCode.apply(String, codePoints.slice(i41, i41 += MAX_ARGUMENTS_LENGTH));
    }
    return res;
}
function _latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for(let i42 = start; i42 < end; ++i42){
        ret += String.fromCharCode(buf[i42]);
    }
    return ret;
}
function _hexSlice(buf, start, end) {
    const len = buf.length;
    if (!start || start < 0) {
        start = 0;
    }
    if (!end || end < 0 || end > len) {
        end = len;
    }
    let out = "";
    for(let i43 = start; i43 < end; ++i43){
        out += hexSliceLookupTable[buf[i43]];
    }
    return out;
}
Buffer.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === void 0 ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0) {
            start = 0;
        }
    } else if (start > len) {
        start = len;
    }
    if (end < 0) {
        end += len;
        if (end < 0) {
            end = 0;
        }
    } else if (end > len) {
        end = len;
    }
    if (end < start) {
        end = start;
    }
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer.prototype);
    return newBuf;
};
Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset63, byteLength1) {
    if (offset63 === undefined) {
        throw new codes.ERR_INVALID_ARG_TYPE("offset", "number", offset63);
    }
    if (byteLength1 === 6) {
        return readUInt48LE(this, offset63);
    }
    if (byteLength1 === 5) {
        return readUInt40LE(this, offset63);
    }
    if (byteLength1 === 3) {
        return readUInt24LE(this, offset63);
    }
    if (byteLength1 === 4) {
        return this.readUInt32LE(offset63);
    }
    if (byteLength1 === 2) {
        return this.readUInt16LE(offset63);
    }
    if (byteLength1 === 1) {
        return this.readUInt8(offset63);
    }
    boundsError(byteLength1, 6, "byteLength");
};
Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset64, byteLength2) {
    if (offset64 === undefined) {
        throw new codes.ERR_INVALID_ARG_TYPE("offset", "number", offset64);
    }
    if (byteLength2 === 6) {
        return readUInt48BE(this, offset64);
    }
    if (byteLength2 === 5) {
        return readUInt40BE(this, offset64);
    }
    if (byteLength2 === 3) {
        return readUInt24BE(this, offset64);
    }
    if (byteLength2 === 4) {
        return this.readUInt32BE(offset64);
    }
    if (byteLength2 === 2) {
        return this.readUInt16BE(offset64);
    }
    if (byteLength2 === 1) {
        return this.readUInt8(offset64);
    }
    boundsError(byteLength2, 6, "byteLength");
};
Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset65 = 0) {
    validateNumber(offset65, "offset");
    const val = this[offset65];
    if (val === undefined) {
        boundsError(offset65, this.length - 1);
    }
    return val;
};
Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = readUInt16BE;
Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset66 = 0) {
    validateNumber(offset66, "offset");
    const first19 = this[offset66];
    const last20 = this[offset66 + 1];
    if (first19 === undefined || last20 === undefined) {
        boundsError(offset66, this.length - 2);
    }
    return first19 + last20 * 2 ** 8;
};
Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset67 = 0) {
    validateNumber(offset67, "offset");
    const first20 = this[offset67];
    const last21 = this[offset67 + 3];
    if (first20 === undefined || last21 === undefined) {
        boundsError(offset67, this.length - 4);
    }
    return first20 + this[++offset67] * 2 ** 8 + this[++offset67] * 2 ** 16 + last21 * 2 ** 24;
};
Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = readUInt32BE;
Buffer.prototype.readBigUint64LE = Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset68) {
    offset68 = offset68 >>> 0;
    validateNumber(offset68, "offset");
    const first21 = this[offset68];
    const last22 = this[offset68 + 7];
    if (first21 === void 0 || last22 === void 0) {
        boundsError(offset68, this.length - 8);
    }
    const lo = first21 + this[++offset68] * 2 ** 8 + this[++offset68] * 2 ** 16 + this[++offset68] * 2 ** 24;
    const hi = this[++offset68] + this[++offset68] * 2 ** 8 + this[++offset68] * 2 ** 16 + last22 * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
Buffer.prototype.readBigUint64BE = Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset69) {
    offset69 = offset69 >>> 0;
    validateNumber(offset69, "offset");
    const first22 = this[offset69];
    const last23 = this[offset69 + 7];
    if (first22 === void 0 || last23 === void 0) {
        boundsError(offset69, this.length - 8);
    }
    const hi = first22 * 2 ** 24 + this[++offset69] * 2 ** 16 + this[++offset69] * 2 ** 8 + this[++offset69];
    const lo = this[++offset69] * 2 ** 24 + this[++offset69] * 2 ** 16 + this[++offset69] * 2 ** 8 + last23;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});
Buffer.prototype.readIntLE = function readIntLE(offset70, byteLength3) {
    if (offset70 === undefined) {
        throw new codes.ERR_INVALID_ARG_TYPE("offset", "number", offset70);
    }
    if (byteLength3 === 6) {
        return readInt48LE(this, offset70);
    }
    if (byteLength3 === 5) {
        return readInt40LE(this, offset70);
    }
    if (byteLength3 === 3) {
        return readInt24LE(this, offset70);
    }
    if (byteLength3 === 4) {
        return this.readInt32LE(offset70);
    }
    if (byteLength3 === 2) {
        return this.readInt16LE(offset70);
    }
    if (byteLength3 === 1) {
        return this.readInt8(offset70);
    }
    boundsError(byteLength3, 6, "byteLength");
};
Buffer.prototype.readIntBE = function readIntBE(offset71, byteLength4) {
    if (offset71 === undefined) {
        throw new codes.ERR_INVALID_ARG_TYPE("offset", "number", offset71);
    }
    if (byteLength4 === 6) {
        return readInt48BE(this, offset71);
    }
    if (byteLength4 === 5) {
        return readInt40BE(this, offset71);
    }
    if (byteLength4 === 3) {
        return readInt24BE(this, offset71);
    }
    if (byteLength4 === 4) {
        return this.readInt32BE(offset71);
    }
    if (byteLength4 === 2) {
        return this.readInt16BE(offset71);
    }
    if (byteLength4 === 1) {
        return this.readInt8(offset71);
    }
    boundsError(byteLength4, 6, "byteLength");
};
Buffer.prototype.readInt8 = function readInt8(offset72 = 0) {
    validateNumber(offset72, "offset");
    const val = this[offset72];
    if (val === undefined) {
        boundsError(offset72, this.length - 1);
    }
    return val | (val & 2 ** 7) * 33554430;
};
Buffer.prototype.readInt16LE = function readInt16LE(offset73 = 0) {
    validateNumber(offset73, "offset");
    const first23 = this[offset73];
    const last24 = this[offset73 + 1];
    if (first23 === undefined || last24 === undefined) {
        boundsError(offset73, this.length - 2);
    }
    const val = first23 + last24 * 2 ** 8;
    return val | (val & 2 ** 15) * 131070;
};
Buffer.prototype.readInt16BE = function readInt16BE(offset74 = 0) {
    validateNumber(offset74, "offset");
    const first24 = this[offset74];
    const last25 = this[offset74 + 1];
    if (first24 === undefined || last25 === undefined) {
        boundsError(offset74, this.length - 2);
    }
    const val = first24 * 2 ** 8 + last25;
    return val | (val & 2 ** 15) * 131070;
};
Buffer.prototype.readInt32LE = function readInt32LE(offset75 = 0) {
    validateNumber(offset75, "offset");
    const first25 = this[offset75];
    const last26 = this[offset75 + 3];
    if (first25 === undefined || last26 === undefined) {
        boundsError(offset75, this.length - 4);
    }
    return first25 + this[++offset75] * 2 ** 8 + this[++offset75] * 2 ** 16 + (last26 << 24);
};
Buffer.prototype.readInt32BE = function readInt32BE(offset76 = 0) {
    validateNumber(offset76, "offset");
    const first26 = this[offset76];
    const last27 = this[offset76 + 3];
    if (first26 === undefined || last27 === undefined) {
        boundsError(offset76, this.length - 4);
    }
    return (first26 << 24) + this[++offset76] * 2 ** 16 + this[++offset76] * 2 ** 8 + last27;
};
Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset77) {
    offset77 = offset77 >>> 0;
    validateNumber(offset77, "offset");
    const first27 = this[offset77];
    const last28 = this[offset77 + 7];
    if (first27 === void 0 || last28 === void 0) {
        boundsError(offset77, this.length - 8);
    }
    const val = this[offset77 + 4] + this[offset77 + 5] * 2 ** 8 + this[offset77 + 6] * 2 ** 16 + (last28 << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first27 + this[++offset77] * 2 ** 8 + this[++offset77] * 2 ** 16 + this[++offset77] * 2 ** 24);
});
Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset78) {
    offset78 = offset78 >>> 0;
    validateNumber(offset78, "offset");
    const first28 = this[offset78];
    const last29 = this[offset78 + 7];
    if (first28 === void 0 || last29 === void 0) {
        boundsError(offset78, this.length - 8);
    }
    const val = (first28 << 24) + this[++offset78] * 2 ** 16 + this[++offset78] * 2 ** 8 + this[++offset78];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset78] * 2 ** 24 + this[++offset78] * 2 ** 16 + this[++offset78] * 2 ** 8 + last29);
});
Buffer.prototype.readFloatLE = function readFloatLE(offset79) {
    return bigEndian ? readFloatBackwards(this, offset79) : readFloatForwards(this, offset79);
};
Buffer.prototype.readFloatBE = function readFloatBE(offset80) {
    return bigEndian ? readFloatForwards(this, offset80) : readFloatBackwards(this, offset80);
};
Buffer.prototype.readDoubleLE = function readDoubleLE(offset81) {
    return bigEndian ? readDoubleBackwards(this, offset81) : readDoubleForwards(this, offset81);
};
Buffer.prototype.readDoubleBE = function readDoubleBE(offset82) {
    return bigEndian ? readDoubleForwards(this, offset82) : readDoubleBackwards(this, offset82);
};
Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset83, byteLength5) {
    if (byteLength5 === 6) {
        return writeU_Int48LE(this, value, offset83, 0, 281474976710655);
    }
    if (byteLength5 === 5) {
        return writeU_Int40LE(this, value, offset83, 0, 1099511627775);
    }
    if (byteLength5 === 3) {
        return writeU_Int24LE(this, value, offset83, 0, 16777215);
    }
    if (byteLength5 === 4) {
        return writeU_Int32LE(this, value, offset83, 0, 4294967295);
    }
    if (byteLength5 === 2) {
        return writeU_Int16LE(this, value, offset83, 0, 65535);
    }
    if (byteLength5 === 1) {
        return writeU_Int8(this, value, offset83, 0, 255);
    }
    boundsError(byteLength5, 6, "byteLength");
};
Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset84, byteLength6) {
    if (byteLength6 === 6) {
        return writeU_Int48BE(this, value, offset84, 0, 281474976710655);
    }
    if (byteLength6 === 5) {
        return writeU_Int40BE(this, value, offset84, 0, 1099511627775);
    }
    if (byteLength6 === 3) {
        return writeU_Int24BE(this, value, offset84, 0, 16777215);
    }
    if (byteLength6 === 4) {
        return writeU_Int32BE(this, value, offset84, 0, 4294967295);
    }
    if (byteLength6 === 2) {
        return writeU_Int16BE(this, value, offset84, 0, 65535);
    }
    if (byteLength6 === 1) {
        return writeU_Int8(this, value, offset84, 0, 255);
    }
    boundsError(byteLength6, 6, "byteLength");
};
Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset85 = 0) {
    return writeU_Int8(this, value, offset85, 0, 255);
};
Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset86 = 0) {
    return writeU_Int16LE(this, value, offset86, 0, 65535);
};
Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset87 = 0) {
    return writeU_Int16BE(this, value, offset87, 0, 65535);
};
Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset88 = 0) {
    return _writeUInt32LE(this, value, offset88, 0, 4294967295);
};
Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset89 = 0) {
    return _writeUInt32BE(this, value, offset89, 0, 4294967295);
};
function wrtBigUInt64LE(buf, value, offset90, min, max) {
    checkIntBI(value, min, max, buf, offset90, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset90++] = lo;
    lo = lo >> 8;
    buf[offset90++] = lo;
    lo = lo >> 8;
    buf[offset90++] = lo;
    lo = lo >> 8;
    buf[offset90++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset90++] = hi;
    hi = hi >> 8;
    buf[offset90++] = hi;
    hi = hi >> 8;
    buf[offset90++] = hi;
    hi = hi >> 8;
    buf[offset90++] = hi;
    return offset90;
}
function wrtBigUInt64BE(buf, value, offset91, min, max) {
    checkIntBI(value, min, max, buf, offset91, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset91 + 7] = lo;
    lo = lo >> 8;
    buf[offset91 + 6] = lo;
    lo = lo >> 8;
    buf[offset91 + 5] = lo;
    lo = lo >> 8;
    buf[offset91 + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset91 + 3] = hi;
    hi = hi >> 8;
    buf[offset91 + 2] = hi;
    hi = hi >> 8;
    buf[offset91 + 1] = hi;
    hi = hi >> 8;
    buf[offset91] = hi;
    return offset91 + 8;
}
Buffer.prototype.writeBigUint64LE = Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset92 = 0) {
    return wrtBigUInt64LE(this, value, offset92, BigInt(0), BigInt("0xffffffffffffffff"));
});
Buffer.prototype.writeBigUint64BE = Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset93 = 0) {
    return wrtBigUInt64BE(this, value, offset93, BigInt(0), BigInt("0xffffffffffffffff"));
});
Buffer.prototype.writeIntLE = function writeIntLE(value, offset94, byteLength7) {
    if (byteLength7 === 6) {
        return writeU_Int48LE(this, value, offset94, -140737488355328, 140737488355327);
    }
    if (byteLength7 === 5) {
        return writeU_Int40LE(this, value, offset94, -549755813888, 549755813887);
    }
    if (byteLength7 === 3) {
        return writeU_Int24LE(this, value, offset94, -8388608, 8388607);
    }
    if (byteLength7 === 4) {
        return writeU_Int32LE(this, value, offset94, -2147483648, 2147483647);
    }
    if (byteLength7 === 2) {
        return writeU_Int16LE(this, value, offset94, -32768, 32767);
    }
    if (byteLength7 === 1) {
        return writeU_Int8(this, value, offset94, -128, 127);
    }
    boundsError(byteLength7, 6, "byteLength");
};
Buffer.prototype.writeIntBE = function writeIntBE(value, offset95, byteLength8) {
    if (byteLength8 === 6) {
        return writeU_Int48BE(this, value, offset95, -140737488355328, 140737488355327);
    }
    if (byteLength8 === 5) {
        return writeU_Int40BE(this, value, offset95, -549755813888, 549755813887);
    }
    if (byteLength8 === 3) {
        return writeU_Int24BE(this, value, offset95, -8388608, 8388607);
    }
    if (byteLength8 === 4) {
        return writeU_Int32BE(this, value, offset95, -2147483648, 2147483647);
    }
    if (byteLength8 === 2) {
        return writeU_Int16BE(this, value, offset95, -32768, 32767);
    }
    if (byteLength8 === 1) {
        return writeU_Int8(this, value, offset95, -128, 127);
    }
    boundsError(byteLength8, 6, "byteLength");
};
Buffer.prototype.writeInt8 = function writeInt8(value, offset96 = 0) {
    return writeU_Int8(this, value, offset96, -128, 127);
};
Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset97 = 0) {
    return writeU_Int16LE(this, value, offset97, -32768, 32767);
};
Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset98 = 0) {
    return writeU_Int16BE(this, value, offset98, -32768, 32767);
};
Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset99 = 0) {
    return writeU_Int32LE(this, value, offset99, -2147483648, 2147483647);
};
Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset100 = 0) {
    return writeU_Int32BE(this, value, offset100, -2147483648, 2147483647);
};
Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset101 = 0) {
    return wrtBigUInt64LE(this, value, offset101, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset102 = 0) {
    return wrtBigUInt64BE(this, value, offset102, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset103) {
    return bigEndian ? writeFloatBackwards(this, value, offset103) : writeFloatForwards(this, value, offset103);
};
Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset104) {
    return bigEndian ? writeFloatForwards(this, value, offset104) : writeFloatBackwards(this, value, offset104);
};
Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset105) {
    return bigEndian ? writeDoubleBackwards(this, value, offset105) : writeDoubleForwards(this, value, offset105);
};
Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset106) {
    return bigEndian ? writeDoubleForwards(this, value, offset106) : writeDoubleBackwards(this, value, offset106);
};
Buffer.prototype.copy = function copy(target, targetStart, sourceStart, sourceEnd) {
    if (!isUint8Array(this)) {
        throw new codes.ERR_INVALID_ARG_TYPE("source", [
            "Buffer",
            "Uint8Array"
        ], this);
    }
    if (!isUint8Array(target)) {
        throw new codes.ERR_INVALID_ARG_TYPE("target", [
            "Buffer",
            "Uint8Array"
        ], target);
    }
    if (targetStart === undefined) {
        targetStart = 0;
    } else {
        targetStart = toInteger(targetStart, 0);
        if (targetStart < 0) {
            throw new codes.ERR_OUT_OF_RANGE("targetStart", ">= 0", targetStart);
        }
    }
    if (sourceStart === undefined) {
        sourceStart = 0;
    } else {
        sourceStart = toInteger(sourceStart, 0);
        if (sourceStart < 0) {
            throw new codes.ERR_OUT_OF_RANGE("sourceStart", ">= 0", sourceStart);
        }
        if (sourceStart >= MAX_UINT32) {
            throw new codes.ERR_OUT_OF_RANGE("sourceStart", `< ${MAX_UINT32}`, sourceStart);
        }
    }
    if (sourceEnd === undefined) {
        sourceEnd = this.length;
    } else {
        sourceEnd = toInteger(sourceEnd, 0);
        if (sourceEnd < 0) {
            throw new codes.ERR_OUT_OF_RANGE("sourceEnd", ">= 0", sourceEnd);
        }
        if (sourceEnd >= MAX_UINT32) {
            throw new codes.ERR_OUT_OF_RANGE("sourceEnd", `< ${MAX_UINT32}`, sourceEnd);
        }
    }
    if (targetStart >= target.length) {
        return 0;
    }
    if (sourceEnd > 0 && sourceEnd < sourceStart) {
        sourceEnd = sourceStart;
    }
    if (sourceEnd === sourceStart) {
        return 0;
    }
    if (target.length === 0 || this.length === 0) {
        return 0;
    }
    if (sourceEnd > this.length) {
        sourceEnd = this.length;
    }
    if (target.length - targetStart < sourceEnd - sourceStart) {
        sourceEnd = target.length - targetStart + sourceStart;
    }
    const len = sourceEnd - sourceStart;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, sourceStart, sourceEnd);
    } else {
        Uint8Array.prototype.set.call(target, this.subarray(sourceStart, sourceEnd), targetStart);
    }
    return len;
};
Buffer.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
        } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
            const code8 = val.charCodeAt(0);
            if (encoding === "utf8" && code8 < 128 || encoding === "latin1") {
                val = code8;
            }
        }
    } else if (typeof val === "number") {
        val = val & 255;
    } else if (typeof val === "boolean") {
        val = Number(val);
    }
    if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
    }
    if (end <= start) {
        return this;
    }
    start = start >>> 0;
    end = end === void 0 ? this.length : end >>> 0;
    if (!val) {
        val = 0;
    }
    let i44;
    if (typeof val === "number") {
        for(i44 = start; i44 < end; ++i44){
            this[i44] = val;
        }
    } else {
        const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
            throw new codes.ERR_INVALID_ARG_VALUE("value", val);
        }
        for(i44 = 0; i44 < end - start; ++i44){
            this[i44 + start] = bytes[i44 % len];
        }
    }
    return this;
};
function checkBounds1(buf, offset107, byteLength2) {
    validateNumber(offset107, "offset");
    if (buf[offset107] === void 0 || buf[offset107 + byteLength2] === void 0) {
        boundsError(offset107, buf.length - (byteLength2 + 1));
    }
}
function checkIntBI(value, min, max, buf, offset108, byteLength2) {
    if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
                range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
                range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
        } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new codes.ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds1(buf, offset108, byteLength2);
}
function utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for(let i45 = 0; i45 < length; ++i45){
        codePoint = string.charCodeAt(i45);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                } else if (i45 + 1 === length) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) {
                    bytes.push(239, 191, 189);
                }
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) {
                bytes.push(239, 191, 189);
            }
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) {
                break;
            }
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) {
                break;
            }
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) {
                break;
            }
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) {
                break;
            }
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function blitBuffer(src, dst, offset109, length) {
    let i46;
    for(i46 = 0; i46 < length; ++i46){
        if (i46 + offset109 >= dst.length || i46 >= src.length) {
            break;
        }
        dst[i46 + offset109] = src[i46];
    }
    return i46;
}
function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
const hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for(let i47 = 0; i47 < 16; ++i47){
        const i16 = i47 * 16;
        for(let j = 0; j < 16; ++j){
            table[i16 + j] = alphabet[i47] + alphabet[j];
        }
    }
    return table;
}();
function defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
}
function BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
}
globalThis.atob;
globalThis.Blob;
globalThis.btoa;
var valueType;
(function(valueType1) {
    valueType1[valueType1["noIterator"] = 0] = "noIterator";
    valueType1[valueType1["isArray"] = 1] = "isArray";
    valueType1[valueType1["isSet"] = 2] = "isSet";
    valueType1[valueType1["isMap"] = 3] = "isMap";
})(valueType || (valueType = {}));
let memo;
function innerDeepEqual(val1, val2, strict, memos = memo) {
    if (val1 === val2) {
        if (val1 !== 0) return true;
        return strict ? Object.is(val1, val2) : true;
    }
    if (strict) {
        if (typeof val1 !== "object") {
            return typeof val1 === "number" && Number.isNaN(val1) && Number.isNaN(val2);
        }
        if (typeof val2 !== "object" || val1 === null || val2 === null) {
            return false;
        }
        if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
            return false;
        }
    } else {
        if (val1 === null || typeof val1 !== "object") {
            if (val2 === null || typeof val2 !== "object") {
                return val1 == val2 || Number.isNaN(val1) && Number.isNaN(val2);
            }
            return false;
        }
        if (val2 === null || typeof val2 !== "object") {
            return false;
        }
    }
    const val1Tag = Object.prototype.toString.call(val1);
    const val2Tag = Object.prototype.toString.call(val2);
    if (val1Tag !== val2Tag) {
        return false;
    }
    if (Array.isArray(val1)) {
        if (!Array.isArray(val2) || val1.length !== val2.length) {
            return false;
        }
        const filter = strict ? 2 : 2 | 16;
        const keys1 = getOwnNonIndexProperties(val1, filter);
        const keys2 = getOwnNonIndexProperties(val2, filter);
        if (keys1.length !== keys2.length) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, valueType.isArray, keys1);
    } else if (val1Tag === "[object Object]") {
        return keyCheck(val1, val2, strict, memos, valueType.noIterator);
    } else if (val1 instanceof Date) {
        if (!(val2 instanceof Date) || val1.getTime() !== val2.getTime()) {
            return false;
        }
    } else if (val1 instanceof RegExp) {
        if (!(val2 instanceof RegExp) || !areSimilarRegExps(val1, val2)) {
            return false;
        }
    } else if (isNativeError1(val1) || val1 instanceof Error) {
        if (!isNativeError1(val2) && !(val2 instanceof Error) || val1.message !== val2.message || val1.name !== val2.name) {
            return false;
        }
    } else if (isArrayBufferView(val1)) {
        const TypedArrayPrototypeGetSymbolToStringTag = (val)=>Object.getOwnPropertySymbols(val).map((item)=>item.toString()
            ).toString()
        ;
        if (isTypedArray(val1) && isTypedArray(val2) && TypedArrayPrototypeGetSymbolToStringTag(val1) !== TypedArrayPrototypeGetSymbolToStringTag(val2)) {
            return false;
        }
        if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
            if (!areSimilarFloatArrays(val1, val2)) {
                return false;
            }
        } else if (!areSimilarTypedArrays(val1, val2)) {
            return false;
        }
        const filter = strict ? 2 : 2 | 16;
        const keysVal1 = getOwnNonIndexProperties(val1, filter);
        const keysVal2 = getOwnNonIndexProperties(val2, filter);
        if (keysVal1.length !== keysVal2.length) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, valueType.noIterator, keysVal1);
    } else if (isSet1(val1)) {
        if (!isSet1(val2) || val1.size !== val2.size) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, valueType.isSet);
    } else if (isMap1(val1)) {
        if (!isMap1(val2) || val1.size !== val2.size) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, valueType.isMap);
    } else if (isAnyArrayBuffer1(val1)) {
        if (!isAnyArrayBuffer1(val2) || !areEqualArrayBuffers(val1, val2)) {
            return false;
        }
    } else if (isBoxedPrimitive1(val1)) {
        if (!isEqualBoxedPrimitive(val1, val2)) {
            return false;
        }
    } else if (Array.isArray(val2) || isArrayBufferView(val2) || isSet1(val2) || isMap1(val2) || isDate1(val2) || isRegExp1(val2) || isAnyArrayBuffer1(val2) || isBoxedPrimitive1(val2) || isNativeError1(val2) || val2 instanceof Error) {
        return false;
    }
    return keyCheck(val1, val2, strict, memos, valueType.noIterator);
}
function keyCheck(val1, val2, strict, memos, iterationType, aKeys = []) {
    if (arguments.length === 5) {
        aKeys = Object.keys(val1);
        const bKeys = Object.keys(val2);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
    }
    let i48 = 0;
    for(; i48 < aKeys.length; i48++){
        if (!val2.propertyIsEnumerable(aKeys[i48])) {
            return false;
        }
    }
    if (strict && arguments.length === 5) {
        const symbolKeysA = Object.getOwnPropertySymbols(val1);
        if (symbolKeysA.length !== 0) {
            let count = 0;
            for(i48 = 0; i48 < symbolKeysA.length; i48++){
                const key = symbolKeysA[i48];
                if (val1.propertyIsEnumerable(key)) {
                    if (!val2.propertyIsEnumerable(key)) {
                        return false;
                    }
                    aKeys.push(key.toString());
                    count++;
                } else if (val2.propertyIsEnumerable(key)) {
                    return false;
                }
            }
            const symbolKeysB = Object.getOwnPropertySymbols(val2);
            if (symbolKeysA.length !== symbolKeysB.length && getEnumerables(val2, symbolKeysB).length !== count) {
                return false;
            }
        } else {
            const symbolKeysB = Object.getOwnPropertySymbols(val2);
            if (symbolKeysB.length !== 0 && getEnumerables(val2, symbolKeysB).length !== 0) {
                return false;
            }
        }
    }
    if (aKeys.length === 0 && (iterationType === valueType.noIterator || iterationType === valueType.isArray && val1.length === 0 || val1.size === 0)) {
        return true;
    }
    if (memos === undefined) {
        memos = {
            val1: new Map(),
            val2: new Map(),
            position: 0
        };
    } else {
        const val2MemoA = memos.val1.get(val1);
        if (val2MemoA !== undefined) {
            const val2MemoB = memos.val2.get(val2);
            if (val2MemoB !== undefined) {
                return val2MemoA === val2MemoB;
            }
        }
        memos.position++;
    }
    memos.val1.set(val1, memos.position);
    memos.val2.set(val2, memos.position);
    const areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
    memos.val1.delete(val1);
    memos.val2.delete(val2);
    return areEq;
}
function areSimilarRegExps(a, b) {
    return a.source === b.source && a.flags === b.flags && a.lastIndex === b.lastIndex;
}
function areSimilarFloatArrays(arr1, arr2) {
    if (arr1.byteLength !== arr2.byteLength) {
        return false;
    }
    for(let i49 = 0; i49 < arr1.byteLength; i49++){
        if (arr1[i49] !== arr2[i49]) {
            return false;
        }
    }
    return true;
}
function areSimilarTypedArrays(arr1, arr2) {
    if (arr1.byteLength !== arr2.byteLength) {
        return false;
    }
    return Buffer.compare(new Uint8Array(arr1.buffer, arr1.byteOffset, arr1.byteLength), new Uint8Array(arr2.buffer, arr2.byteOffset, arr2.byteLength)) === 0;
}
function areEqualArrayBuffers(buf1, buf2) {
    return buf1.byteLength === buf2.byteLength && Buffer.compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0;
}
function isEqualBoxedPrimitive(a, b) {
    if (Object.getOwnPropertyNames(a).length !== Object.getOwnPropertyNames(b).length) {
        return false;
    }
    if (Object.getOwnPropertySymbols(a).length !== Object.getOwnPropertySymbols(b).length) {
        return false;
    }
    if (isNumberObject1(a)) {
        return isNumberObject1(b) && Object.is(Number.prototype.valueOf.call(a), Number.prototype.valueOf.call(b));
    }
    if (isStringObject1(a)) {
        return isStringObject1(b) && String.prototype.valueOf.call(a) === String.prototype.valueOf.call(b);
    }
    if (isBooleanObject1(a)) {
        return isBooleanObject1(b) && Boolean.prototype.valueOf.call(a) === Boolean.prototype.valueOf.call(b);
    }
    if (isBigIntObject1(a)) {
        return isBigIntObject1(b) && BigInt.prototype.valueOf.call(a) === BigInt.prototype.valueOf.call(b);
    }
    if (isSymbolObject1(a)) {
        return isSymbolObject1(b) && Symbol.prototype.valueOf.call(a) === Symbol.prototype.valueOf.call(b);
    }
    throw Error(`Unknown boxed type`);
}
function getEnumerables(val, keys) {
    return keys.filter((key)=>val.propertyIsEnumerable(key)
    );
}
function objEquiv(obj1, obj2, strict, keys, memos, iterationType) {
    let i50 = 0;
    if (iterationType === valueType.isSet) {
        if (!setEquiv(obj1, obj2, strict, memos)) {
            return false;
        }
    } else if (iterationType === valueType.isMap) {
        if (!mapEquiv(obj1, obj2, strict, memos)) {
            return false;
        }
    } else if (iterationType === valueType.isArray) {
        for(; i50 < obj1.length; i50++){
            if (obj1.hasOwnProperty(i50)) {
                if (!obj2.hasOwnProperty(i50) || !innerDeepEqual(obj1[i50], obj2[i50], strict, memos)) {
                    return false;
                }
            } else if (obj2.hasOwnProperty(i50)) {
                return false;
            } else {
                const keys1 = Object.keys(obj1);
                for(; i50 < keys1.length; i50++){
                    const key = keys1[i50];
                    if (!obj2.hasOwnProperty(key) || !innerDeepEqual(obj1[key], obj2[key], strict, memos)) {
                        return false;
                    }
                }
                if (keys1.length !== Object.keys(obj2).length) {
                    return false;
                }
                if (keys1.length !== Object.keys(obj2).length) {
                    return false;
                }
                return true;
            }
        }
    }
    for(i50 = 0; i50 < keys.length; i50++){
        const key = keys[i50];
        if (!innerDeepEqual(obj1[key], obj2[key], strict, memos)) {
            return false;
        }
    }
    return true;
}
function findLooseMatchingPrimitives(primitive) {
    switch(typeof primitive){
        case "undefined":
            return null;
        case "object":
            return undefined;
        case "symbol":
            return false;
        case "string":
            primitive = +primitive;
        case "number":
            if (Number.isNaN(primitive)) {
                return false;
            }
    }
    return true;
}
function setMightHaveLoosePrim(set1, set2, primitive) {
    const altValue = findLooseMatchingPrimitives(primitive);
    if (altValue != null) return altValue;
    return set2.has(altValue) && !set1.has(altValue);
}
function setHasEqualElement(set, val1, strict, memos) {
    for (const val2 of set){
        if (innerDeepEqual(val1, val2, strict, memos)) {
            set.delete(val2);
            return true;
        }
    }
    return false;
}
function setEquiv(set1, set2, strict, memos) {
    let set = null;
    for (const item of set1){
        if (typeof item === "object" && item !== null) {
            if (set === null) {
                set = new Set();
            }
            set.add(item);
        } else if (!set2.has(item)) {
            if (strict) return false;
            if (!setMightHaveLoosePrim(set1, set2, item)) {
                return false;
            }
            if (set === null) {
                set = new Set();
            }
            set.add(item);
        }
    }
    if (set !== null) {
        for (const item of set2){
            if (typeof item === "object" && item !== null) {
                if (!setHasEqualElement(set, item, strict, memos)) return false;
            } else if (!strict && !set1.has(item) && !setHasEqualElement(set, item, strict, memos)) {
                return false;
            }
        }
        return set.size === 0;
    }
    return true;
}
function mapMightHaveLoosePrimitive(map1, map2, primitive, item, memos) {
    const altValue = findLooseMatchingPrimitives(primitive);
    if (altValue != null) {
        return altValue;
    }
    const curB = map2.get(altValue);
    if (curB === undefined && !map2.has(altValue) || !innerDeepEqual(item, curB, false, memo)) {
        return false;
    }
    return !map1.has(altValue) && innerDeepEqual(item, curB, false, memos);
}
function mapEquiv(map1, map2, strict, memos) {
    let set = null;
    for (const { 0: key , 1: item1  } of map1){
        if (typeof key === "object" && key !== null) {
            if (set === null) {
                set = new Set();
            }
            set.add(key);
        } else {
            const item2 = map2.get(key);
            if (item2 === undefined && !map2.has(key) || !innerDeepEqual(item1, item2, strict, memos)) {
                if (strict) return false;
                if (!mapMightHaveLoosePrimitive(map1, map2, key, item1, memos)) {
                    return false;
                }
                if (set === null) {
                    set = new Set();
                }
                set.add(key);
            }
        }
    }
    if (set !== null) {
        for (const { 0: key , 1: item  } of map2){
            if (typeof key === "object" && key !== null) {
                if (!mapHasEqualEntry(set, map1, key, item, strict, memos)) {
                    return false;
                }
            } else if (!strict && (!map1.has(key) || !innerDeepEqual(map1.get(key), item, false, memos)) && !mapHasEqualEntry(set, map1, key, item, false, memos)) {
                return false;
            }
        }
        return set.size === 0;
    }
    return true;
}
function mapHasEqualEntry(set, map, key1, item1, strict, memos) {
    for (const key2 of set){
        if (innerDeepEqual(key1, key2, strict, memos) && innerDeepEqual(item1, map.get(key2), strict, memos)) {
            set.delete(key2);
            return true;
        }
    }
    return false;
}
const NumberIsSafeInteger = Number.isSafeInteger;
function getSystemErrorName(code9) {
    if (typeof code9 !== "number") {
        throw new codes.ERR_INVALID_ARG_TYPE("err", "number", code9);
    }
    if (code9 >= 0 || !NumberIsSafeInteger(code9)) {
        throw new codes.ERR_OUT_OF_RANGE("err", "a negative integer", code9);
    }
    return errorMap.get(code9)?.[0];
}
const { errno: { ENOTDIR , ENOENT  } ,  } = os;
const kIsNodeError = Symbol("kIsNodeError");
const classRegExp1 = /^([A-Z][a-z0-9]*)+$/;
const kTypes = [
    "string",
    "function",
    "number",
    "object",
    "Function",
    "Object",
    "boolean",
    "bigint",
    "symbol", 
];
class AbortError extends Error {
    code;
    constructor(){
        super("The operation was aborted");
        this.code = "ABORT_ERR";
        this.name = "AbortError";
    }
}
function addNumericalSeparator(val) {
    let res = "";
    let i51 = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for(; i51 >= start + 4; i51 -= 3){
        res = `_${val.slice(i51 - 3, i51)}${res}`;
    }
    return `${val.slice(0, i51)}${res}`;
}
const captureLargerStackTrace = hideStackFrames(function captureLargerStackTrace(err) {
    Error.captureStackTrace(err);
    return err;
});
hideStackFrames(function uvExceptionWithHostPort(err, syscall, address, port) {
    const { 0: code10 , 1: uvmsg  } = uvErrmapGet(err) || uvUnmappedError;
    const message = `${syscall} ${code10}: ${uvmsg}`;
    let details = "";
    if (port && port > 0) {
        details = ` ${address}:${port}`;
    } else if (address) {
        details = ` ${address}`;
    }
    const ex = new Error(`${message}${details}`);
    ex.code = code10;
    ex.errno = err;
    ex.syscall = syscall;
    ex.address = address;
    if (port) {
        ex.port = port;
    }
    return captureLargerStackTrace(ex);
});
hideStackFrames(function errnoException(err, syscall, original) {
    const code11 = getSystemErrorName(err);
    const message = original ? `${syscall} ${code11} ${original}` : `${syscall} ${code11}`;
    const ex = new Error(message);
    ex.errno = err;
    ex.code = code11;
    ex.syscall = syscall;
    return captureLargerStackTrace(ex);
});
function uvErrmapGet(name) {
    return errorMap.get(name);
}
const uvUnmappedError = [
    "UNKNOWN",
    "unknown error"
];
hideStackFrames(function uvException(ctx) {
    const { 0: code12 , 1: uvmsg  } = uvErrmapGet(ctx.errno) || uvUnmappedError;
    let message = `${code12}: ${ctx.message || uvmsg}, ${ctx.syscall}`;
    let path;
    let dest;
    if (ctx.path) {
        path = ctx.path.toString();
        message += ` '${path}'`;
    }
    if (ctx.dest) {
        dest = ctx.dest.toString();
        message += ` -> '${dest}'`;
    }
    const err = new Error(message);
    for (const prop of Object.keys(ctx)){
        if (prop === "message" || prop === "path" || prop === "dest") {
            continue;
        }
        err[prop] = ctx[prop];
    }
    err.code = code12;
    if (path) {
        err.path = path;
    }
    if (dest) {
        err.dest = dest;
    }
    return captureLargerStackTrace(err);
});
hideStackFrames(function exceptionWithHostPort(err, syscall, address, port, additional) {
    const code13 = getSystemErrorName(err);
    let details = "";
    if (port && port > 0) {
        details = ` ${address}:${port}`;
    } else if (address) {
        details = ` ${address}`;
    }
    if (additional) {
        details += ` - Local (${additional})`;
    }
    const ex = new Error(`${syscall} ${code13}${details}`);
    ex.errno = err;
    ex.code = code13;
    ex.syscall = syscall;
    ex.address = address;
    if (port) {
        ex.port = port;
    }
    return captureLargerStackTrace(ex);
});
hideStackFrames(function(code14, syscall, hostname) {
    let errno;
    if (typeof code14 === "number") {
        errno = code14;
        if (code14 === codeMap.get("EAI_NODATA") || code14 === codeMap.get("EAI_NONAME")) {
            code14 = "ENOTFOUND";
        } else {
            code14 = getSystemErrorName(code14);
        }
    }
    const message = `${syscall} ${code14}${hostname ? ` ${hostname}` : ""}`;
    const ex = new Error(message);
    ex.errno = errno;
    ex.code = code14;
    ex.syscall = syscall;
    if (hostname) {
        ex.hostname = hostname;
    }
    return captureLargerStackTrace(ex);
});
class NodeErrorAbstraction extends Error {
    code;
    constructor(name, code15, message){
        super(message);
        this.code = code15;
        this.name = name;
        this.stack = this.stack && `${name} [${this.code}]${this.stack.slice(20)}`;
    }
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
}
class NodeError extends NodeErrorAbstraction {
    constructor(code16, message){
        super(Error.prototype.name, code16, message);
    }
}
class NodeRangeError extends NodeErrorAbstraction {
    constructor(code17, message){
        super(RangeError.prototype.name, code17, message);
        Object.setPrototypeOf(this, RangeError.prototype);
        this.toString = function() {
            return `${this.name} [${this.code}]: ${this.message}`;
        };
    }
}
class NodeTypeError extends NodeErrorAbstraction {
    constructor(code18, message){
        super(TypeError.prototype.name, code18, message);
        Object.setPrototypeOf(this, TypeError.prototype);
        this.toString = function() {
            return `${this.name} [${this.code}]: ${this.message}`;
        };
    }
}
class NodeSystemError extends NodeErrorAbstraction {
    constructor(key, context, msgPrefix){
        let message = `${msgPrefix}: ${context.syscall} returned ` + `${context.code} (${context.message})`;
        if (context.path !== undefined) {
            message += ` ${context.path}`;
        }
        if (context.dest !== undefined) {
            message += ` => ${context.dest}`;
        }
        super("SystemError", key, message);
        captureLargerStackTrace(this);
        Object.defineProperties(this, {
            [kIsNodeError]: {
                value: true,
                enumerable: false,
                writable: false,
                configurable: true
            },
            info: {
                value: context,
                enumerable: true,
                configurable: true,
                writable: false
            },
            errno: {
                get () {
                    return context.errno;
                },
                set: (value)=>{
                    context.errno = value;
                },
                enumerable: true,
                configurable: true
            },
            syscall: {
                get () {
                    return context.syscall;
                },
                set: (value)=>{
                    context.syscall = value;
                },
                enumerable: true,
                configurable: true
            }
        });
        if (context.path !== undefined) {
            Object.defineProperty(this, "path", {
                get () {
                    return context.path;
                },
                set: (value)=>{
                    context.path = value;
                },
                enumerable: true,
                configurable: true
            });
        }
        if (context.dest !== undefined) {
            Object.defineProperty(this, "dest", {
                get () {
                    return context.dest;
                },
                set: (value)=>{
                    context.dest = value;
                },
                enumerable: true,
                configurable: true
            });
        }
    }
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
}
function makeSystemErrorWithCode(key, msgPrfix) {
    return class NodeError extends NodeSystemError {
        constructor(ctx){
            super(key, ctx, msgPrfix);
        }
    };
}
makeSystemErrorWithCode("ERR_FS_EISDIR", "Path is a directory");
function createInvalidArgType(name, expected) {
    expected = Array.isArray(expected) ? expected : [
        expected
    ];
    let msg = "The ";
    if (name.endsWith(" argument")) {
        msg += `${name} `;
    } else {
        const type = name.includes(".") ? "property" : "argument";
        msg += `"${name}" ${type} `;
    }
    msg += "must be ";
    const types = [];
    const instances = [];
    const other = [];
    for (const value of expected){
        if (kTypes.includes(value)) {
            types.push(value.toLocaleLowerCase());
        } else if (classRegExp1.test(value)) {
            instances.push(value);
        } else {
            other.push(value);
        }
    }
    if (instances.length > 0) {
        const pos = types.indexOf("object");
        if (pos !== -1) {
            types.splice(pos, 1);
            instances.push("Object");
        }
    }
    if (types.length > 0) {
        if (types.length > 2) {
            const last30 = types.pop();
            msg += `one of type ${types.join(", ")}, or ${last30}`;
        } else if (types.length === 2) {
            msg += `one of type ${types[0]} or ${types[1]}`;
        } else {
            msg += `of type ${types[0]}`;
        }
        if (instances.length > 0 || other.length > 0) {
            msg += " or ";
        }
    }
    if (instances.length > 0) {
        if (instances.length > 2) {
            const last31 = instances.pop();
            msg += `an instance of ${instances.join(", ")}, or ${last31}`;
        } else {
            msg += `an instance of ${instances[0]}`;
            if (instances.length === 2) {
                msg += ` or ${instances[1]}`;
            }
        }
        if (other.length > 0) {
            msg += " or ";
        }
    }
    if (other.length > 0) {
        if (other.length > 2) {
            const last32 = other.pop();
            msg += `one of ${other.join(", ")}, or ${last32}`;
        } else if (other.length === 2) {
            msg += `one of ${other[0]} or ${other[1]}`;
        } else {
            if (other[0].toLowerCase() !== other[0]) {
                msg += "an ";
            }
            msg += `${other[0]}`;
        }
    }
    return msg;
}
class ERR_INVALID_ARG_TYPE_RANGE extends NodeRangeError {
    constructor(name, expected, actual){
        const msg = createInvalidArgType(name, expected);
        super("ERR_INVALID_ARG_TYPE", `${msg}.${invalidArgTypeHelper(actual)}`);
    }
}
class ERR_INVALID_ARG_TYPE extends NodeTypeError {
    constructor(name, expected, actual){
        const msg = createInvalidArgType(name, expected);
        super("ERR_INVALID_ARG_TYPE", `${msg}.${invalidArgTypeHelper(actual)}`);
    }
    static RangeError = ERR_INVALID_ARG_TYPE_RANGE;
}
class ERR_INVALID_ARG_VALUE_RANGE extends NodeRangeError {
    constructor(name, value, reason = "is invalid"){
        const type = name.includes(".") ? "property" : "argument";
        const inspected = inspect(value);
        super("ERR_INVALID_ARG_VALUE", `The ${type} '${name}' ${reason}. Received ${inspected}`);
    }
}
class ERR_INVALID_ARG_VALUE extends NodeTypeError {
    constructor(name, value, reason = "is invalid"){
        const type = name.includes(".") ? "property" : "argument";
        const inspected = inspect(value);
        super("ERR_INVALID_ARG_VALUE", `The ${type} '${name}' ${reason}. Received ${inspected}`);
    }
    static RangeError = ERR_INVALID_ARG_VALUE_RANGE;
}
function invalidArgTypeHelper(input) {
    if (input == null) {
        return ` Received ${input}`;
    }
    if (typeof input === "function" && input.name) {
        return ` Received function ${input.name}`;
    }
    if (typeof input === "object") {
        if (input.constructor && input.constructor.name) {
            return ` Received an instance of ${input.constructor.name}`;
        }
        return ` Received ${inspect(input, {
            depth: -1
        })}`;
    }
    let inspected = inspect(input, {
        colors: false
    });
    if (inspected.length > 25) {
        inspected = `${inspected.slice(0, 25)}...`;
    }
    return ` Received type ${typeof input} (${inspected})`;
}
class ERR_OUT_OF_RANGE extends RangeError {
    code = "ERR_OUT_OF_RANGE";
    constructor(str, range, input, replaceDefaultBoolean = false){
        assert(range, 'Missing "range" argument');
        let msg = replaceDefaultBoolean ? str : `The value of "${str}" is out of range.`;
        let received;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
            received = String(input);
            if (input > 2n ** 32n || input < -(2n ** 32n)) {
                received = addNumericalSeparator(received);
            }
            received += "n";
        } else {
            received = inspect(input);
        }
        msg += ` It must be ${range}. Received ${received}`;
        super(msg);
        const { name  } = this;
        this.name = `${name} [${this.code}]`;
        this.stack;
        this.name = name;
    }
}
class ERR_BUFFER_OUT_OF_BOUNDS extends NodeRangeError {
    constructor(name){
        super("ERR_BUFFER_OUT_OF_BOUNDS", name ? `"${name}" is outside of buffer bounds` : "Attempt to access memory outside buffer bounds");
    }
}
class ERR_INVALID_CALLBACK extends NodeTypeError {
    constructor(object){
        super("ERR_INVALID_CALLBACK", `Callback must be a function. Received ${inspect(object)}`);
    }
}
class ERR_IPC_CHANNEL_CLOSED extends NodeError {
    constructor(){
        super("ERR_IPC_CHANNEL_CLOSED", `Channel closed`);
    }
}
class ERR_SOCKET_BAD_PORT extends NodeRangeError {
    constructor(name, port, allowZero = true){
        assert(typeof allowZero === "boolean", "The 'allowZero' argument must be of type boolean.");
        const operator = allowZero ? ">=" : ">";
        super("ERR_SOCKET_BAD_PORT", `${name} should be ${operator} 0 and < 65536. Received ${port}.`);
    }
}
class ERR_UNHANDLED_ERROR extends NodeError {
    constructor(x){
        super("ERR_UNHANDLED_ERROR", `Unhandled error. (${x})`);
    }
}
class ERR_UNKNOWN_ENCODING extends NodeTypeError {
    constructor(x){
        super("ERR_UNKNOWN_ENCODING", `Unknown encoding: ${x}`);
    }
}
codes.ERR_IPC_CHANNEL_CLOSED = ERR_IPC_CHANNEL_CLOSED;
codes.ERR_INVALID_ARG_TYPE = ERR_INVALID_ARG_TYPE;
codes.ERR_INVALID_ARG_VALUE = ERR_INVALID_ARG_VALUE;
codes.ERR_INVALID_CALLBACK = ERR_INVALID_CALLBACK;
codes.ERR_OUT_OF_RANGE = ERR_OUT_OF_RANGE;
codes.ERR_SOCKET_BAD_PORT = ERR_SOCKET_BAD_PORT;
codes.ERR_BUFFER_OUT_OF_BOUNDS = ERR_BUFFER_OUT_OF_BOUNDS;
codes.ERR_UNKNOWN_ENCODING = ERR_UNKNOWN_ENCODING;
"use strict";
const kRejection = Symbol.for("nodejs.rejection");
const kCapture = Symbol("kCapture");
const kErrorMonitor = Symbol("events.errorMonitor");
const kMaxEventTargetListeners = Symbol("events.maxEventTargetListeners");
const kMaxEventTargetListenersWarned = Symbol("events.maxEventTargetListenersWarned");
function EventEmitter(opts) {
    EventEmitter.init.call(this, opts);
}
EventEmitter.on = on;
EventEmitter.once = once;
EventEmitter.getEventListeners = getEventListeners;
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.usingDomains = false;
EventEmitter.captureRejectionSymbol = kRejection;
EventEmitter.captureRejectionSymbol;
EventEmitter.errorMonitor;
Object.defineProperty(EventEmitter, "captureRejections", {
    get () {
        return EventEmitter.prototype[kCapture];
    },
    set (value) {
        validateBoolean(value, "EventEmitter.captureRejections");
        EventEmitter.prototype[kCapture] = value;
    },
    enumerable: true
});
EventEmitter.errorMonitor = kErrorMonitor;
Object.defineProperty(EventEmitter.prototype, kCapture, {
    value: false,
    writable: true,
    enumerable: false
});
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;
let defaultMaxListeners = 10;
let isEventTarget;
function checkListener(listener) {
    validateFunction(listener, "listener");
}
Object.defineProperty(EventEmitter, "defaultMaxListeners", {
    enumerable: true,
    get: function() {
        return defaultMaxListeners;
    },
    set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
            throw new ERR_OUT_OF_RANGE("defaultMaxListeners", "a non-negative number", arg);
        }
        defaultMaxListeners = arg;
    }
});
Object.defineProperties(EventEmitter, {
    kMaxEventTargetListeners: {
        value: kMaxEventTargetListeners,
        enumerable: false,
        configurable: false,
        writable: false
    },
    kMaxEventTargetListenersWarned: {
        value: kMaxEventTargetListenersWarned,
        enumerable: false,
        configurable: false,
        writable: false
    }
});
EventEmitter.setMaxListeners = function(n = defaultMaxListeners, ...eventTargets) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
        throw new ERR_OUT_OF_RANGE("n", "a non-negative number", n);
    }
    if (eventTargets.length === 0) {
        defaultMaxListeners = n;
    } else {
        if (isEventTarget === undefined) {
            isEventTarget = require("internal/event_target").isEventTarget;
        }
        for(let i52 = 0; i52 < eventTargets.length; i52++){
            const target = eventTargets[i52];
            if (isEventTarget(target)) {
                target[kMaxEventTargetListeners] = n;
                target[kMaxEventTargetListenersWarned] = false;
            } else if (typeof target.setMaxListeners === "function") {
                target.setMaxListeners(n);
            } else {
                throw new ERR_INVALID_ARG_TYPE("eventTargets", [
                    "EventEmitter",
                    "EventTarget"
                ], target);
            }
        }
    }
};
EventEmitter.init = function(opts) {
    if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
        this._events = Object.create(null);
        this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || undefined;
    if (opts?.captureRejections) {
        validateBoolean(opts.captureRejections, "options.captureRejections");
        this[kCapture] = Boolean(opts.captureRejections);
    } else {
        this[kCapture] = EventEmitter.prototype[kCapture];
    }
};
function addCatch(that, promise, type, args) {
    if (!that[kCapture]) {
        return;
    }
    try {
        const then = promise.then;
        if (typeof then === "function") {
            then.call(promise, undefined, function(err) {
                process.nextTick(emitUnhandledRejectionOrErr, that, err, type, args);
            });
        }
    } catch (err) {
        that.emit("error", err);
    }
}
function emitUnhandledRejectionOrErr(ee, err, type, args) {
    if (typeof ee[kRejection] === "function") {
        ee[kRejection](err, type, ...args);
    } else {
        const prev = ee[kCapture];
        try {
            ee[kCapture] = false;
            ee.emit("error", err);
        } finally{
            ee[kCapture] = prev;
        }
    }
}
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
        throw new ERR_OUT_OF_RANGE("n", "a non-negative number", n);
    }
    this._maxListeners = n;
    return this;
};
function _getMaxListeners(that) {
    if (that._maxListeners === undefined) {
        return EventEmitter.defaultMaxListeners;
    }
    return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
};
EventEmitter.prototype.emit = function emit(type, ...args) {
    let doError = type === "error";
    const events = this._events;
    if (events !== undefined) {
        if (doError && events[kErrorMonitor] !== undefined) {
            this.emit(kErrorMonitor, ...args);
        }
        doError = doError && events.error === undefined;
    } else if (!doError) {
        return false;
    }
    if (doError) {
        let er;
        if (args.length > 0) {
            er = args[0];
        }
        if (er instanceof Error) {
            try {
                const capture = {};
                Error.captureStackTrace(capture, EventEmitter.prototype.emit);
            } catch  {}
            throw er;
        }
        let stringifiedEr;
        try {
            stringifiedEr = inspect(er);
        } catch  {
            stringifiedEr = er;
        }
        const err = new ERR_UNHANDLED_ERROR(stringifiedEr);
        err.context = er;
        throw err;
    }
    const handler = events[type];
    if (handler === undefined) {
        return false;
    }
    if (typeof handler === "function") {
        const result = handler.apply(this, args);
        if (result !== undefined && result !== null) {
            addCatch(this, result, type, args);
        }
    } else {
        const len = handler.length;
        const listeners = arrayClone(handler);
        for(let i53 = 0; i53 < len; ++i53){
            const result = listeners[i53].apply(this, args);
            if (result !== undefined && result !== null) {
                addCatch(this, result, type, args);
            }
        }
    }
    return true;
};
function _addListener(target, type, listener, prepend) {
    let m;
    let events;
    let existing;
    checkListener(listener);
    events = target._events;
    if (events === undefined) {
        events = target._events = Object.create(null);
        target._eventsCount = 0;
    } else {
        if (events.newListener !== undefined) {
            target.emit("newListener", type, listener.listener ?? listener);
            events = target._events;
        }
        existing = events[type];
    }
    if (existing === undefined) {
        events[type] = listener;
        ++target._eventsCount;
    } else {
        if (typeof existing === "function") {
            existing = events[type] = prepend ? [
                listener,
                existing
            ] : [
                existing,
                listener
            ];
        } else if (prepend) {
            existing.unshift(listener);
        } else {
            existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            const w = new Error("Possible EventEmitter memory leak detected. " + `${existing.length} ${String(type)} listeners ` + `added to ${inspect(target, {
                depth: -1
            })}. Use ` + "emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            process.emitWarning(w);
        }
    }
    return target;
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
};
function onceWrapper() {
    if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0) {
            return this.listener.call(this.target);
        }
        return this.listener.apply(this.target, arguments);
    }
}
function _onceWrap(target, type, listener) {
    const state4 = {
        fired: false,
        wrapFn: undefined,
        target,
        type,
        listener
    };
    const wrapped = onceWrapper.bind(state4);
    wrapped.listener = listener;
    state4.wrapFn = wrapped;
    return wrapped;
}
EventEmitter.prototype.once = function once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
};
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
};
EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    checkListener(listener);
    const events = this._events;
    if (events === undefined) {
        return this;
    }
    const list = events[type];
    if (list === undefined) {
        return this;
    }
    if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0) {
            this._events = Object.create(null);
        } else {
            delete events[type];
            if (events.removeListener) {
                this.emit("removeListener", type, list.listener || listener);
            }
        }
    } else if (typeof list !== "function") {
        let position = -1;
        for(let i54 = list.length - 1; i54 >= 0; i54--){
            if (list[i54] === listener || list[i54].listener === listener) {
                position = i54;
                break;
            }
        }
        if (position < 0) {
            return this;
        }
        if (position === 0) {
            list.shift();
        } else {
            spliceOne(list, position);
        }
        if (list.length === 1) {
            events[type] = list[0];
        }
        if (events.removeListener !== undefined) {
            this.emit("removeListener", type, listener);
        }
    }
    return this;
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    const events = this._events;
    if (events === undefined) {
        return this;
    }
    if (events.removeListener === undefined) {
        if (arguments.length === 0) {
            this._events = Object.create(null);
            this._eventsCount = 0;
        } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0) {
                this._events = Object.create(null);
            } else {
                delete events[type];
            }
        }
        return this;
    }
    if (arguments.length === 0) {
        for (const key of Reflect.ownKeys(events)){
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
    }
    const listeners = events[type];
    if (typeof listeners === "function") {
        this.removeListener(type, listeners);
    } else if (listeners !== undefined) {
        for(let i55 = listeners.length - 1; i55 >= 0; i55--){
            this.removeListener(type, listeners[i55]);
        }
    }
    return this;
};
function _listeners(target, type, unwrap) {
    const events = target._events;
    if (events === undefined) {
        return [];
    }
    const evlistener = events[type];
    if (evlistener === undefined) {
        return [];
    }
    if (typeof evlistener === "function") {
        return unwrap ? [
            evlistener.listener || evlistener
        ] : [
            evlistener
        ];
    }
    return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener);
}
EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
};
EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
};
EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
    }
    return listenerCount.call(emitter, type);
};
EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
    const events = this._events;
    if (events !== undefined) {
        const evlistener = events[type];
        if (typeof evlistener === "function") {
            return 1;
        } else if (evlistener !== undefined) {
            return evlistener.length;
        }
    }
    return 0;
}
EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};
function arrayClone(arr) {
    switch(arr.length){
        case 2:
            return [
                arr[0],
                arr[1]
            ];
        case 3:
            return [
                arr[0],
                arr[1],
                arr[2]
            ];
        case 4:
            return [
                arr[0],
                arr[1],
                arr[2],
                arr[3]
            ];
        case 5:
            return [
                arr[0],
                arr[1],
                arr[2],
                arr[3],
                arr[4]
            ];
        case 6:
            return [
                arr[0],
                arr[1],
                arr[2],
                arr[3],
                arr[4],
                arr[5]
            ];
    }
    return arr.slice();
}
function unwrapListeners(arr) {
    const ret = arrayClone(arr);
    for(let i56 = 0; i56 < ret.length; ++i56){
        const orig = ret[i56].listener;
        if (typeof orig === "function") {
            ret[i56] = orig;
        }
    }
    return ret;
}
function getEventListeners(emitterOrTarget, type) {
    if (typeof emitterOrTarget.listeners === "function") {
        return emitterOrTarget.listeners(type);
    }
    const { isEventTarget: isEventTarget1 , kEvents  } = require("internal/event_target");
    if (isEventTarget1(emitterOrTarget)) {
        const root = emitterOrTarget[kEvents].get(type);
        const listeners = [];
        let handler = root?.next;
        while(handler?.listener !== undefined){
            const listener = handler.listener?.deref ? handler.listener.deref() : handler.listener;
            listeners.push(listener);
            handler = handler.next;
        }
        return listeners;
    }
    throw new ERR_INVALID_ARG_TYPE("emitter", [
        "EventEmitter",
        "EventTarget"
    ], emitterOrTarget);
}
async function once(emitter, name, options = {}) {
    const signal = options?.signal;
    validateAbortSignal(signal, "options.signal");
    if (signal?.aborted) {
        throw new AbortError();
    }
    return new Promise((resolve, reject)=>{
        const errorListener = (err)=>{
            emitter.removeListener(name, resolver);
            if (signal != null) {
                eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
            }
            reject(err);
        };
        const resolver = (...args)=>{
            if (typeof emitter.removeListener === "function") {
                emitter.removeListener("error", errorListener);
            }
            if (signal != null) {
                eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
            }
            resolve(args);
        };
        eventTargetAgnosticAddListener(emitter, name, resolver, {
            once: true
        });
        if (name !== "error" && typeof emitter.once === "function") {
            emitter.once("error", errorListener);
        }
        function abortListener() {
            eventTargetAgnosticRemoveListener(emitter, name, resolver);
            eventTargetAgnosticRemoveListener(emitter, "error", errorListener);
            reject(new AbortError());
        }
        if (signal != null) {
            eventTargetAgnosticAddListener(signal, "abort", abortListener, {
                once: true
            });
        }
    });
}
const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function*() {}).prototype);
function createIterResult(value, done) {
    return {
        value,
        done
    };
}
function eventTargetAgnosticRemoveListener(emitter, name, listener, flags) {
    if (typeof emitter.removeListener === "function") {
        emitter.removeListener(name, listener);
    } else if (typeof emitter.removeEventListener === "function") {
        emitter.removeEventListener(name, listener, flags);
    } else {
        throw new ERR_INVALID_ARG_TYPE("emitter", "EventEmitter", emitter);
    }
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
    if (typeof emitter.on === "function") {
        if (flags?.once) {
            emitter.once(name, listener);
        } else {
            emitter.on(name, listener);
        }
    } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, (arg)=>{
            listener(arg);
        }, flags);
    } else {
        throw new ERR_INVALID_ARG_TYPE("emitter", "EventEmitter", emitter);
    }
}
function on(emitter, event, options) {
    const signal = options?.signal;
    validateAbortSignal(signal, "options.signal");
    if (signal?.aborted) {
        throw new AbortError();
    }
    const unconsumedEvents = [];
    const unconsumedPromises = [];
    let error = null;
    let finished = false;
    const iterator = Object.setPrototypeOf({
        next () {
            const value = unconsumedEvents.shift();
            if (value) {
                return Promise.resolve(createIterResult(value, false));
            }
            if (error) {
                const p = Promise.reject(error);
                error = null;
                return p;
            }
            if (finished) {
                return Promise.resolve(createIterResult(undefined, true));
            }
            return new Promise(function(resolve, reject) {
                unconsumedPromises.push({
                    resolve,
                    reject
                });
            });
        },
        return () {
            eventTargetAgnosticRemoveListener(emitter, event, eventHandler);
            eventTargetAgnosticRemoveListener(emitter, "error", errorHandler);
            if (signal) {
                eventTargetAgnosticRemoveListener(signal, "abort", abortListener, {
                    once: true
                });
            }
            finished = true;
            for (const promise of unconsumedPromises){
                promise.resolve(createIterResult(undefined, true));
            }
            return Promise.resolve(createIterResult(undefined, true));
        },
        throw (err) {
            if (!err || !(err instanceof Error)) {
                throw new ERR_INVALID_ARG_TYPE("EventEmitter.AsyncIterator", "Error", err);
            }
            error = err;
            eventTargetAgnosticRemoveListener(emitter, event, eventHandler);
            eventTargetAgnosticRemoveListener(emitter, "error", errorHandler);
        },
        [Symbol.asyncIterator] () {
            return this;
        }
    }, AsyncIteratorPrototype);
    eventTargetAgnosticAddListener(emitter, event, eventHandler);
    if (event !== "error" && typeof emitter.on === "function") {
        emitter.on("error", errorHandler);
    }
    if (signal) {
        eventTargetAgnosticAddListener(signal, "abort", abortListener, {
            once: true
        });
    }
    return iterator;
    function abortListener() {
        errorHandler(new AbortError());
    }
    function eventHandler(...args) {
        const promise = unconsumedPromises.shift();
        if (promise) {
            promise.resolve(createIterResult(args, false));
        } else {
            unconsumedEvents.push(args);
        }
    }
    function errorHandler(err) {
        finished = true;
        const toError = unconsumedPromises.shift();
        if (toError) {
            toError.reject(err);
        } else {
            error = err;
        }
        iterator.return();
    }
}
({
    path: `.env`,
    export: false,
    safe: false,
    example: `.env.example`,
    allowEmptyValues: false,
    defaults: `.env.defaults`
});
class Code {
    code;
    scope;
    constructor(code19, scope){
        this.code = code19;
        this.scope = scope;
    }
    toJSON() {
        return {
            code: this.code,
            scope: this.scope
        };
    }
    [Symbol.for("Deno.customInspect")]() {
        const codeJson = this.toJSON();
        return `new Code("${codeJson.code}"${codeJson.scope ? `, ${JSON.stringify(codeJson.scope)}` : ""})`;
    }
}
const BSON_INT32_MIN = -2147483648;
const JS_INT_MAX = 2 ** 53;
const JS_INT_MIN = -(2 ** 53);
var BSONData;
(function(BSONData2) {
    BSONData2[BSONData2["NUMBER"] = 1] = "NUMBER";
    BSONData2[BSONData2["STRING"] = 2] = "STRING";
    BSONData2[BSONData2["OBJECT"] = 3] = "OBJECT";
    BSONData2[BSONData2["ARRAY"] = 4] = "ARRAY";
    BSONData2[BSONData2["BINARY"] = 5] = "BINARY";
    BSONData2[BSONData2["UNDEFINED"] = 6] = "UNDEFINED";
    BSONData2[BSONData2["OID"] = 7] = "OID";
    BSONData2[BSONData2["BOOLEAN"] = 8] = "BOOLEAN";
    BSONData2[BSONData2["DATE"] = 9] = "DATE";
    BSONData2[BSONData2["NULL"] = 10] = "NULL";
    BSONData2[BSONData2["REGEXP"] = 11] = "REGEXP";
    BSONData2[BSONData2["DBPOINTER"] = 12] = "DBPOINTER";
    BSONData2[BSONData2["CODE"] = 13] = "CODE";
    BSONData2[BSONData2["SYMBOL"] = 14] = "SYMBOL";
    BSONData2[BSONData2["CODE_W_SCOPE"] = 15] = "CODE_W_SCOPE";
    BSONData2[BSONData2["INT"] = 16] = "INT";
    BSONData2[BSONData2["TIMESTAMP"] = 17] = "TIMESTAMP";
    BSONData2[BSONData2["LONG"] = 18] = "LONG";
    BSONData2[BSONData2["DECIMAL128"] = 19] = "DECIMAL128";
    BSONData2[BSONData2["MIN_KEY"] = 255] = "MIN_KEY";
    BSONData2[BSONData2["MAX_KEY"] = 127] = "MAX_KEY";
})(BSONData || (BSONData = {}));
const BSON_BINARY_SUBTYPE_DEFAULT = 0;
function normalizedFunctionString(fn) {
    return fn.toString().replace("function(", "function (");
}
const randomBytes = (size)=>crypto.getRandomValues(new Uint8Array(size))
;
function isObjectLike(candidate) {
    return typeof candidate === "object" && candidate !== null;
}
function bytesCopy(target, targetStart, source, sourceStart, sourceEnd) {
    Uint8Array.prototype.set.call(target, source.subarray(sourceStart, sourceEnd), targetStart);
}
function utf8ToBytes1(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for(let i57 = 0; i57 < length; ++i57){
        codePoint = string.charCodeAt(i57);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                } else if (i57 + 1 === length) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) {
                    bytes.push(239, 191, 189);
                }
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) {
                bytes.push(239, 191, 189);
            }
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) {
                break;
            }
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) {
                break;
            }
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) {
                break;
            }
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) {
                break;
            }
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function asciiToBytes1(str) {
    const byteArray = new Uint8Array(str.length);
    for(let i58 = 0; i58 < str.length; ++i58){
        byteArray[i58] = str.charCodeAt(i58) & 255;
    }
    return byteArray;
}
var Encoding;
(function(Encoding2) {
    Encoding2[Encoding2["Utf8"] = 0] = "Utf8";
    Encoding2[Encoding2["Ascii"] = 1] = "Ascii";
})(Encoding || (Encoding = {}));
function writeToBytes(bytes, data24, offset110, encoding) {
    const bytesLength = bytes.length;
    const src = encoding ? asciiToBytes1(data24) : utf8ToBytes1(data24, bytesLength - offset110);
    let i59;
    for(i59 = 0; i59 < bytesLength; ++i59){
        if (i59 + offset110 >= bytesLength || i59 >= src.length) {
            break;
        }
        bytes[i59 + offset110] = src[i59];
    }
    return i59;
}
function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i60 = start;
    while(i60 < end){
        const firstByte = buf[i60];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i60 + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i60 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i60 + 1];
                    thirdByte = buf[i60 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i60 + 1];
                    thirdByte = buf[i60 + 2];
                    fourthByte = buf[i60 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i60 += bytesPerSequence;
    }
    return decodeCodePointsArray1(res);
}
const MAX_ARGUMENTS_LENGTH1 = 4096;
function decodeCodePointsArray1(codePoints) {
    const len = codePoints.length;
    if (len <= 4096) {
        return String.fromCharCode(...codePoints);
    }
    let res = "";
    let i61 = 0;
    while(i61 < len){
        res += String.fromCharCode(...codePoints.slice(i61, i61 += MAX_ARGUMENTS_LENGTH1));
    }
    return res;
}
function isDBRefLike(value) {
    return isObjectLike(value) && value.$id != null && typeof value.$ref === "string" && (value.$db == null || typeof value.$db === "string");
}
class DBRef {
    collection;
    oid;
    db;
    fields;
    constructor(collection, oid, db, fields){
        const parts = collection.split(".");
        if (parts.length === 2) {
            db = parts.shift();
            collection = parts.shift();
        }
        this.collection = collection;
        this.oid = oid;
        this.db = db;
        this.fields = fields || {};
    }
    toJSON() {
        const o = Object.assign({
            $ref: this.collection,
            $id: this.oid
        }, this.fields);
        if (this.db != null) o.$db = this.db;
        return o;
    }
    static fromExtendedJSON(doc) {
        const copy5 = Object.assign({}, doc);
        delete copy5.$ref;
        delete copy5.$id;
        delete copy5.$db;
        return new DBRef(doc.$ref, doc.$id, doc.$db, copy5);
    }
    [Symbol.for("Deno.customInspect")]() {
        const oid = this.oid === undefined || this.oid.toString === undefined ? this.oid : this.oid.toString();
        return `new DBRef("${this.collection}", new ObjectId("${oid}")${this.db ? `, "${this.db}"` : ""})`;
    }
}
class BSONError extends Error {
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, BSONError.prototype);
    }
    get name() {
        return "BSONError";
    }
}
class BSONTypeError extends TypeError {
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, BSONTypeError.prototype);
    }
    get name() {
        return "BSONTypeError";
    }
}
const wasm1 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    13,
    2,
    96,
    0,
    1,
    127,
    96,
    4,
    127,
    127,
    127,
    127,
    1,
    127,
    3,
    7,
    6,
    0,
    1,
    1,
    1,
    1,
    1,
    6,
    6,
    1,
    127,
    1,
    65,
    0,
    11,
    7,
    50,
    6,
    3,
    109,
    117,
    108,
    0,
    1,
    5,
    100,
    105,
    118,
    95,
    115,
    0,
    2,
    5,
    100,
    105,
    118,
    95,
    117,
    0,
    3,
    5,
    114,
    101,
    109,
    95,
    115,
    0,
    4,
    5,
    114,
    101,
    109,
    95,
    117,
    0,
    5,
    8,
    103,
    101,
    116,
    95,
    104,
    105,
    103,
    104,
    0,
    0,
    10,
    191,
    1,
    6,
    4,
    0,
    35,
    0,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    126,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    127,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    128,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    129,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    130,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11
])), {}).exports;
const TWO_PWR_16_DBL = 1 << 16;
const TWO_PWR_24_DBL = 1 << 24;
const TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
const TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
const TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
const INT_CACHE = {};
const UINT_CACHE = {};
class Long {
    high;
    low;
    unsigned;
    constructor(low = 0, high, unsigned){
        if (typeof low === "bigint") {
            Object.assign(this, Long.fromBigInt(low, !!high));
        } else if (typeof low === "string") {
            Object.assign(this, Long.fromString(low, !!high));
        } else {
            this.low = low | 0;
            this.high = high | 0;
            this.unsigned = !!unsigned;
        }
    }
    static TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
    static MAX_UNSIGNED_VALUE = Long.fromBits(4294967295 | 0, 4294967295 | 0, true);
    static ZERO = Long.fromInt(0);
    static UZERO = Long.fromInt(0, true);
    static ONE = Long.fromInt(1);
    static UONE = Long.fromInt(1, true);
    static NEG_ONE = Long.fromInt(-1);
    static MAX_VALUE = Long.fromBits(4294967295 | 0, 2147483647 | 0, false);
    static MIN_VALUE = Long.fromBits(0, 2147483648 | 0, false);
    static fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    }
    static fromInt(value, unsigned) {
        let obj;
        let cache;
        if (unsigned) {
            value >>>= 0;
            if (cache = 0 <= value && value < 256) {
                const cachedObj = UINT_CACHE[value];
                if (cachedObj) return cachedObj;
            }
            obj = Long.fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache) UINT_CACHE[value] = obj;
            return obj;
        }
        value |= 0;
        if (cache = -128 <= value && value < 128) {
            const cachedObj = INT_CACHE[value];
            if (cachedObj) return cachedObj;
        }
        obj = Long.fromBits(value, value < 0 ? -1 : 0, false);
        if (cache) INT_CACHE[value] = obj;
        return obj;
    }
    static fromNumber(value, unsigned) {
        if (isNaN(value)) return unsigned ? Long.UZERO : Long.ZERO;
        if (unsigned) {
            if (value < 0) return Long.UZERO;
            if (value >= TWO_PWR_64_DBL) return Long.MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL) return Long.MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL) return Long.MAX_VALUE;
        }
        if (value < 0) return Long.fromNumber(-value, unsigned).neg();
        return Long.fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
    }
    static fromBigInt(value, unsigned) {
        return Long.fromString(value.toString(), unsigned);
    }
    static fromString(str, unsigned, radix) {
        if (str.length === 0) throw Error("empty string");
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") {
            return Long.ZERO;
        }
        if (typeof unsigned === "number") {
            radix = unsigned, unsigned = false;
        } else {
            unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        let p;
        if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
        else if (p === 0) {
            return Long.fromString(str.substring(1), unsigned, radix).neg();
        }
        const radixToPower = Long.fromNumber(radix ** 8);
        let result = Long.ZERO;
        for(let i62 = 0; i62 < str.length; i62 += 8){
            const size = Math.min(8, str.length - i62);
            const value = parseInt(str.substring(i62, i62 + size), radix);
            if (size < 8) {
                const power = Long.fromNumber(radix ** size);
                result = result.mul(power).add(Long.fromNumber(value));
            } else {
                result = result.mul(radixToPower);
                result = result.add(Long.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }
    static fromBytes(bytes, unsigned, le) {
        return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
    }
    static fromBytesLE(bytes, unsigned) {
        return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
    }
    static fromBytesBE(bytes, unsigned) {
        return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
    }
    static isLong(value) {
        return value instanceof Long;
    }
    static fromValue(val, unsigned) {
        if (typeof val === "number") return Long.fromNumber(val, unsigned);
        if (typeof val === "string") return Long.fromString(val, unsigned);
        return Long.fromBits(val.low, val.high, typeof unsigned === "boolean" ? unsigned : val.unsigned);
    }
    add(addend) {
        if (!Long.isLong(addend)) addend = Long.fromValue(addend);
        const a48 = this.high >>> 16;
        const a32 = this.high & 65535;
        const a16 = this.low >>> 16;
        const a00 = this.low & 65535;
        const b48 = addend.high >>> 16;
        const b32 = addend.high & 65535;
        const b16 = addend.low >>> 16;
        const b00 = addend.low & 65535;
        let c48 = 0;
        let c32 = 0;
        let c16 = 0;
        let c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 + b48;
        c48 &= 65535;
        return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    }
    and(other) {
        if (!Long.isLong(other)) other = Long.fromValue(other);
        return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    }
    compare(other) {
        if (!Long.isLong(other)) other = Long.fromValue(other);
        if (this.eq(other)) return 0;
        const thisNeg = this.isNegative();
        const otherNeg = other.isNegative();
        if (thisNeg && !otherNeg) return -1;
        if (!thisNeg && otherNeg) return 1;
        if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    }
    comp(other) {
        return this.compare(other);
    }
    divide(divisor) {
        if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
        if (divisor.isZero()) throw Error("division by zero");
        if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
            return this;
        }
        const low = (this.unsigned ? wasm1.div_u : wasm1.div_s)(this.low, this.high, divisor.low, divisor.high);
        return Long.fromBits(low, wasm1.get_high(), this.unsigned);
    }
    div(divisor) {
        return this.divide(divisor);
    }
    equals(other) {
        if (!Long.isLong(other)) other = Long.fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) {
            return false;
        }
        return this.high === other.high && this.low === other.low;
    }
    eq(other) {
        return this.equals(other);
    }
    getHighBits() {
        return this.high;
    }
    getHighBitsUnsigned() {
        return this.high >>> 0;
    }
    getLowBits() {
        return this.low;
    }
    getLowBitsUnsigned() {
        return this.low >>> 0;
    }
    getNumBitsAbs() {
        if (this.isNegative()) {
            return this.eq(Long.MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        }
        const val = this.high !== 0 ? this.high : this.low;
        let bit;
        for(bit = 31; bit > 0; bit--)if ((val & 1 << bit) !== 0) break;
        return this.high !== 0 ? bit + 33 : bit + 1;
    }
    greaterThan(other) {
        return this.comp(other) > 0;
    }
    gt(other) {
        return this.greaterThan(other);
    }
    greaterThanOrEqual(other) {
        return this.comp(other) >= 0;
    }
    gte(other) {
        return this.greaterThanOrEqual(other);
    }
    ge(other) {
        return this.greaterThanOrEqual(other);
    }
    isEven() {
        return (this.low & 1) === 0;
    }
    isNegative() {
        return !this.unsigned && this.high < 0;
    }
    isOdd() {
        return (this.low & 1) === 1;
    }
    isPositive() {
        return this.unsigned || this.high >= 0;
    }
    isZero() {
        return this.high === 0 && this.low === 0;
    }
    lessThan(other) {
        return this.comp(other) < 0;
    }
    lt(other) {
        return this.lessThan(other);
    }
    lessThanOrEqual(other) {
        return this.comp(other) <= 0;
    }
    lte(other) {
        return this.lessThanOrEqual(other);
    }
    modulo(divisor) {
        if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
        const low = (this.unsigned ? wasm1.rem_u : wasm1.rem_s)(this.low, this.high, divisor.low, divisor.high);
        return Long.fromBits(low, wasm1.get_high(), this.unsigned);
    }
    mod(divisor) {
        return this.modulo(divisor);
    }
    rem(divisor) {
        return this.modulo(divisor);
    }
    multiply(multiplier) {
        if (this.isZero()) return Long.ZERO;
        if (!Long.isLong(multiplier)) multiplier = Long.fromValue(multiplier);
        const low = wasm1.mul(this.low, this.high, multiplier.low, multiplier.high);
        return Long.fromBits(low, wasm1.get_high(), this.unsigned);
    }
    mul(multiplier) {
        return this.multiply(multiplier);
    }
    negate() {
        if (!this.unsigned && this.eq(Long.MIN_VALUE)) return Long.MIN_VALUE;
        return this.not().add(Long.ONE);
    }
    neg() {
        return this.negate();
    }
    not() {
        return Long.fromBits(~this.low, ~this.high, this.unsigned);
    }
    notEquals(other) {
        return !this.equals(other);
    }
    neq(other) {
        return this.notEquals(other);
    }
    ne(other) {
        return this.notEquals(other);
    }
    or(other) {
        if (!Long.isLong(other)) other = Long.fromValue(other);
        return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    }
    shiftLeft(numBits) {
        if (Long.isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits < 32) {
            return Long.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);
        }
        return Long.fromBits(0, this.low << numBits - 32, this.unsigned);
    }
    shl(numBits) {
        return this.shiftLeft(numBits);
    }
    shiftRight(numBits) {
        if (Long.isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits < 32) {
            return Long.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);
        }
        return Long.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
    }
    shr(numBits) {
        return this.shiftRight(numBits);
    }
    shiftRightUnsigned(numBits) {
        if (Long.isLong(numBits)) numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0) return this;
        const high = this.high;
        if (numBits < 32) {
            const low = this.low;
            return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
        }
        if (numBits === 32) return Long.fromBits(high, 0, this.unsigned);
        else return Long.fromBits(high >>> numBits - 32, 0, this.unsigned);
    }
    shr_u(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    shru(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    subtract(subtrahend) {
        if (!Long.isLong(subtrahend)) subtrahend = Long.fromValue(subtrahend);
        return this.add(subtrahend.neg());
    }
    sub(subtrahend) {
        return this.subtract(subtrahend);
    }
    toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    }
    toNumber() {
        if (this.unsigned) {
            return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        }
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    }
    toBigInt() {
        return BigInt(this.toString());
    }
    toBytes(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    }
    toBytesLE() {
        const hi = this.high;
        const lo = this.low;
        return [
            lo & 255,
            lo >>> 8 & 255,
            lo >>> 16 & 255,
            lo >>> 24,
            hi & 255,
            hi >>> 8 & 255,
            hi >>> 16 & 255,
            hi >>> 24, 
        ];
    }
    toBytesBE() {
        const hi = this.high;
        const lo = this.low;
        return [
            hi >>> 24,
            hi >>> 16 & 255,
            hi >>> 8 & 255,
            hi & 255,
            lo >>> 24,
            lo >>> 16 & 255,
            lo >>> 8 & 255,
            lo & 255, 
        ];
    }
    toSigned() {
        if (!this.unsigned) return this;
        return Long.fromBits(this.low, this.high, false);
    }
    toString(radix = 10) {
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        if (this.isZero()) return "0";
        if (this.isNegative()) {
            if (this.eq(Long.MIN_VALUE)) {
                const radixLong = Long.fromNumber(radix);
                const div = this.div(radixLong);
                const rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            return `-${this.neg().toString(radix)}`;
        }
        const radixToPower = Long.fromNumber(radix ** 6, this.unsigned);
        let rem = this;
        let result = "";
        while(true){
            const remDiv = rem.div(radixToPower);
            const intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
            let digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) {
                return digits + result;
            }
            while(digits.length < 6)digits = `0${digits}`;
            result = `${digits}${result}`;
        }
    }
    toUnsigned() {
        if (this.unsigned) return this;
        return Long.fromBits(this.low, this.high, true);
    }
    xor(other) {
        if (!Long.isLong(other)) other = Long.fromValue(other);
        return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    }
    eqz() {
        return this.isZero();
    }
    le(other) {
        return this.lessThanOrEqual(other);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Long("${this.toString()}"${this.unsigned ? ", true" : ""})`;
    }
}
const PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
const PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
const PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;
const EXPONENT_MAX = 6111;
const EXPONENT_MIN = -6176;
const EXPONENT_BIAS = 6176;
const NAN_BUFFER = [
    124,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const INF_NEGATIVE_BUFFER = [
    248,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const INF_POSITIVE_BUFFER = [
    120,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const EXPONENT_REGEX = /^([-+])?(\d+)?$/;
const EXPONENT_MASK = 16383;
function isDigit(value) {
    return !isNaN(parseInt(value, 10));
}
function divideu128(value) {
    const DIVISOR = Long.fromNumber(1000 * 1000 * 1000);
    let _rem = Long.fromNumber(0);
    if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
        return {
            quotient: value,
            rem: _rem
        };
    }
    for(let i63 = 0; i63 <= 3; i63++){
        _rem = _rem.shiftLeft(32);
        _rem = _rem.add(new Long(value.parts[i63], 0));
        value.parts[i63] = _rem.div(DIVISOR).low;
        _rem = _rem.modulo(DIVISOR);
    }
    return {
        quotient: value,
        rem: _rem
    };
}
function multiply64x2(left, right) {
    if (!left && !right) {
        return {
            high: Long.fromNumber(0),
            low: Long.fromNumber(0)
        };
    }
    const leftHigh = left.shiftRightUnsigned(32);
    const leftLow = new Long(left.getLowBits(), 0);
    const rightHigh = right.shiftRightUnsigned(32);
    const rightLow = new Long(right.getLowBits(), 0);
    let productHigh = leftHigh.multiply(rightHigh);
    let productMid = leftHigh.multiply(rightLow);
    const productMid2 = leftLow.multiply(rightHigh);
    let productLow = leftLow.multiply(rightLow);
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productMid = new Long(productMid.getLowBits(), 0).add(productMid2).add(productLow.shiftRightUnsigned(32));
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productLow = productMid.shiftLeft(32).add(new Long(productLow.getLowBits(), 0));
    return {
        high: productHigh,
        low: productLow
    };
}
function lessThan(left, right) {
    const uhleft = left.high >>> 0;
    const uhright = right.high >>> 0;
    if (uhleft < uhright) {
        return true;
    }
    if (uhleft === uhright) {
        const ulleft = left.low >>> 0;
        const ulright = right.low >>> 0;
        if (ulleft < ulright) return true;
    }
    return false;
}
function invalidErr(string, message) {
    throw new BSONTypeError(`"${string}" is not a valid Decimal128 string - ${message}`);
}
class Decimal128 {
    bytes;
    constructor(bytes){
        this.bytes = typeof bytes === "string" ? Decimal128.fromString(bytes).bytes : bytes;
    }
    static fromString(representation) {
        let isNegative = false;
        let sawRadix = false;
        let foundNonZero = false;
        let significantDigits = 0;
        let nDigitsRead = 0;
        let nDigits = 0;
        let radixPosition = 0;
        let firstNonZero = 0;
        const digits = [
            0
        ];
        let nDigitsStored = 0;
        let digitsInsert = 0;
        let firstDigit = 0;
        let lastDigit = 0;
        let exponent = 0;
        let i64 = 0;
        let significandHigh = new Long(0, 0);
        let significandLow = new Long(0, 0);
        let biasedExponent = 0;
        let index = 0;
        if (representation.length >= 7000) {
            throw new BSONTypeError(`${representation} not a valid Decimal128 string`);
        }
        const stringMatch = representation.match(PARSE_STRING_REGEXP);
        const infMatch = representation.match(PARSE_INF_REGEXP);
        const nanMatch = representation.match(PARSE_NAN_REGEXP);
        if (!stringMatch && !infMatch && !nanMatch || representation.length === 0) {
            throw new BSONTypeError(`${representation} not a valid Decimal128 string`);
        }
        if (stringMatch) {
            const unsignedNumber = stringMatch[2];
            const e = stringMatch[4];
            const expSign = stringMatch[5];
            const expNumber = stringMatch[6];
            if (e && expNumber === undefined) {
                invalidErr(representation, "missing exponent power");
            }
            if (e && unsignedNumber === undefined) {
                invalidErr(representation, "missing exponent base");
            }
            if (e === undefined && (expSign || expNumber)) {
                invalidErr(representation, "missing e before exponent");
            }
        }
        if (representation[index] === "+" || representation[index] === "-") {
            isNegative = representation[index++] === "-";
        }
        if (!isDigit(representation[index]) && representation[index] !== ".") {
            if (representation[index] === "i" || representation[index] === "I") {
                return new Decimal128(new Uint8Array(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
            }
            if (representation[index] === "N") {
                return new Decimal128(new Uint8Array(NAN_BUFFER));
            }
        }
        while(isDigit(representation[index]) || representation[index] === "."){
            if (representation[index] === ".") {
                if (sawRadix) invalidErr(representation, "contains multiple periods");
                sawRadix = true;
                index += 1;
                continue;
            }
            if (nDigitsStored < 34 && (representation[index] !== "0" || foundNonZero)) {
                if (!foundNonZero) {
                    firstNonZero = nDigitsRead;
                }
                foundNonZero = true;
                digits[digitsInsert++] = parseInt(representation[index], 10);
                nDigitsStored += 1;
            }
            if (foundNonZero) nDigits += 1;
            if (sawRadix) radixPosition += 1;
            nDigitsRead += 1;
            index += 1;
        }
        if (sawRadix && !nDigitsRead) {
            throw new BSONTypeError(`${representation} not a valid Decimal128 string`);
        }
        if (representation[index] === "e" || representation[index] === "E") {
            const match = representation.substr(++index).match(EXPONENT_REGEX);
            if (!match || !match[2]) {
                return new Decimal128(new Uint8Array(NAN_BUFFER));
            }
            exponent = parseInt(match[0], 10);
            index += match[0].length;
        }
        if (representation[index]) {
            return new Decimal128(new Uint8Array(NAN_BUFFER));
        }
        firstDigit = 0;
        if (!nDigitsStored) {
            firstDigit = 0;
            lastDigit = 0;
            digits[0] = 0;
            nDigits = 1;
            nDigitsStored = 1;
            significantDigits = 0;
        } else {
            lastDigit = nDigitsStored - 1;
            significantDigits = nDigits;
            if (significantDigits !== 1) {
                while(digits[firstNonZero + significantDigits - 1] === 0){
                    significantDigits -= 1;
                }
            }
        }
        exponent = exponent <= radixPosition && radixPosition - exponent > 1 << 14 ? EXPONENT_MIN : exponent - radixPosition;
        while(exponent > 6111){
            lastDigit += 1;
            if (lastDigit - firstDigit > 34) {
                const digitsString = digits.join("");
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX;
                    break;
                }
                invalidErr(representation, "overflow");
            }
            exponent -= 1;
        }
        while(exponent < EXPONENT_MIN || nDigitsStored < nDigits){
            if (lastDigit === 0 && significantDigits < nDigitsStored) {
                exponent = EXPONENT_MIN;
                significantDigits = 0;
                break;
            }
            if (nDigitsStored < nDigits) {
                nDigits -= 1;
            } else {
                lastDigit -= 1;
            }
            if (exponent < 6111) {
                exponent += 1;
            } else {
                const digitsString = digits.join("");
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX;
                    break;
                }
                invalidErr(representation, "overflow");
            }
        }
        if (lastDigit - firstDigit + 1 < significantDigits) {
            let endOfString = nDigitsRead;
            if (sawRadix) {
                firstNonZero += 1;
                endOfString += 1;
            }
            if (isNegative) {
                firstNonZero += 1;
                endOfString += 1;
            }
            const roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
            let roundBit = 0;
            if (roundDigit >= 5) {
                roundBit = 1;
                if (roundDigit === 5) {
                    roundBit = digits[lastDigit] % 2 === 1 ? 1 : 0;
                    for(i64 = firstNonZero + lastDigit + 2; i64 < endOfString; i64++){
                        if (parseInt(representation[i64], 10)) {
                            roundBit = 1;
                            break;
                        }
                    }
                }
            }
            if (roundBit) {
                let dIdx = lastDigit;
                for(; dIdx >= 0; dIdx--){
                    if (++digits[dIdx] > 9) {
                        digits[dIdx] = 0;
                        if (dIdx === 0) {
                            if (exponent < 6111) {
                                exponent += 1;
                                digits[dIdx] = 1;
                            } else {
                                return new Decimal128(new Uint8Array(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER));
                            }
                        }
                    }
                }
            }
        }
        significandHigh = Long.fromNumber(0);
        significandLow = Long.fromNumber(0);
        if (significantDigits === 0) {
            significandHigh = Long.fromNumber(0);
            significandLow = Long.fromNumber(0);
        } else if (lastDigit - firstDigit < 17) {
            let dIdx = firstDigit;
            significandLow = Long.fromNumber(digits[dIdx++]);
            significandHigh = new Long(0, 0);
            for(; dIdx <= lastDigit; dIdx++){
                significandLow = significandLow.multiply(Long.fromNumber(10));
                significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
            }
        } else {
            let dIdx = firstDigit;
            significandHigh = Long.fromNumber(digits[dIdx++]);
            for(; dIdx <= lastDigit - 17; dIdx++){
                significandHigh = significandHigh.multiply(Long.fromNumber(10));
                significandHigh = significandHigh.add(Long.fromNumber(digits[dIdx]));
            }
            significandLow = Long.fromNumber(digits[dIdx++]);
            for(; dIdx <= lastDigit; dIdx++){
                significandLow = significandLow.multiply(Long.fromNumber(10));
                significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
            }
        }
        const significand = multiply64x2(significandHigh, Long.fromString("100000000000000000"));
        significand.low = significand.low.add(significandLow);
        if (lessThan(significand.low, significandLow)) {
            significand.high = significand.high.add(Long.fromNumber(1));
        }
        biasedExponent = exponent + EXPONENT_BIAS;
        const dec1 = {
            low: Long.fromNumber(0),
            high: Long.fromNumber(0)
        };
        if (significand.high.shiftRightUnsigned(49).and(Long.fromNumber(1)).equals(Long.fromNumber(1))) {
            dec1.high = dec1.high.or(Long.fromNumber(3).shiftLeft(61));
            dec1.high = dec1.high.or(Long.fromNumber(biasedExponent).and(Long.fromNumber(16383).shiftLeft(47)));
            dec1.high = dec1.high.or(significand.high.and(Long.fromNumber(140737488355327)));
        } else {
            dec1.high = dec1.high.or(Long.fromNumber(biasedExponent & 16383).shiftLeft(49));
            dec1.high = dec1.high.or(significand.high.and(Long.fromNumber(562949953421311)));
        }
        dec1.low = significand.low;
        if (isNegative) {
            dec1.high = dec1.high.or(Long.fromString("9223372036854775808"));
        }
        const buffer19 = new Uint8Array(16);
        index = 0;
        buffer19[index++] = dec1.low.low & 255;
        buffer19[index++] = dec1.low.low >> 8 & 255;
        buffer19[index++] = dec1.low.low >> 16 & 255;
        buffer19[index++] = dec1.low.low >> 24 & 255;
        buffer19[index++] = dec1.low.high & 255;
        buffer19[index++] = dec1.low.high >> 8 & 255;
        buffer19[index++] = dec1.low.high >> 16 & 255;
        buffer19[index++] = dec1.low.high >> 24 & 255;
        buffer19[index++] = dec1.high.low & 255;
        buffer19[index++] = dec1.high.low >> 8 & 255;
        buffer19[index++] = dec1.high.low >> 16 & 255;
        buffer19[index++] = dec1.high.low >> 24 & 255;
        buffer19[index++] = dec1.high.high & 255;
        buffer19[index++] = dec1.high.high >> 8 & 255;
        buffer19[index++] = dec1.high.high >> 16 & 255;
        buffer19[index++] = dec1.high.high >> 24 & 255;
        return new Decimal128(buffer19);
    }
    toString() {
        let biasedExponent;
        let significandDigits = 0;
        const significand = new Array(36);
        for(let i65 = 0; i65 < significand.length; i65++)significand[i65] = 0;
        let index = 0;
        let isZero = false;
        let significandMsb;
        let significand128 = {
            parts: [
                0,
                0,
                0,
                0
            ]
        };
        let j;
        let k;
        const string = [];
        index = 0;
        const buffer20 = this.bytes;
        const low = buffer20[index++] | buffer20[index++] << 8 | buffer20[index++] << 16 | buffer20[index++] << 24;
        const midl = buffer20[index++] | buffer20[index++] << 8 | buffer20[index++] << 16 | buffer20[index++] << 24;
        const midh = buffer20[index++] | buffer20[index++] << 8 | buffer20[index++] << 16 | buffer20[index++] << 24;
        const high = buffer20[index++] | buffer20[index++] << 8 | buffer20[index++] << 16 | buffer20[index++] << 24;
        index = 0;
        const dec2 = {
            low: new Long(low, midl),
            high: new Long(midh, high)
        };
        if (dec2.high.lessThan(Long.ZERO)) {
            string.push("-");
        }
        const combination = high >> 26 & 31;
        if (combination >> 3 === 3) {
            if (combination === 30) {
                return `${string.join("")}Infinity`;
            }
            if (combination === 31) {
                return "NaN";
            }
            biasedExponent = high >> 15 & EXPONENT_MASK;
            significandMsb = 8 + (high >> 14 & 1);
        } else {
            significandMsb = high >> 14 & 7;
            biasedExponent = high >> 17 & EXPONENT_MASK;
        }
        const exponent = biasedExponent - 6176;
        significand128.parts[0] = (high & 16383) + ((significandMsb & 15) << 14);
        significand128.parts[1] = midh;
        significand128.parts[2] = midl;
        significand128.parts[3] = low;
        if (significand128.parts[0] === 0 && significand128.parts[1] === 0 && significand128.parts[2] === 0 && significand128.parts[3] === 0) {
            isZero = true;
        } else {
            for(k = 3; k >= 0; k--){
                let leastDigits = 0;
                const result = divideu128(significand128);
                significand128 = result.quotient;
                leastDigits = result.rem.low;
                if (!leastDigits) continue;
                for(j = 8; j >= 0; j--){
                    significand[k * 9 + j] = leastDigits % 10;
                    leastDigits = Math.floor(leastDigits / 10);
                }
            }
        }
        if (isZero) {
            significandDigits = 1;
            significand[index] = 0;
        } else {
            significandDigits = 36;
            while(!significand[index]){
                significandDigits -= 1;
                index += 1;
            }
        }
        const scientificExponent = significandDigits - 1 + exponent;
        if (scientificExponent >= 34 || scientificExponent <= -7 || exponent > 0) {
            if (significandDigits > 34) {
                string.push(`${0}`);
                if (exponent > 0) string.push(`E+${exponent}`);
                else if (exponent < 0) string.push(`E${exponent}`);
                return string.join("");
            }
            string.push(`${significand[index++]}`);
            significandDigits -= 1;
            if (significandDigits) {
                string.push(".");
            }
            for(let i66 = 0; i66 < significandDigits; i66++){
                string.push(`${significand[index++]}`);
            }
            string.push("E");
            if (scientificExponent > 0) {
                string.push(`+${scientificExponent}`);
            } else {
                string.push(`${scientificExponent}`);
            }
        } else {
            if (exponent >= 0) {
                for(let i67 = 0; i67 < significandDigits; i67++){
                    string.push(`${significand[index++]}`);
                }
            } else {
                let radixPosition = significandDigits + exponent;
                if (radixPosition > 0) {
                    for(let i68 = 0; i68 < radixPosition; i68++){
                        string.push(`${significand[index++]}`);
                    }
                } else {
                    string.push("0");
                }
                string.push(".");
                while(radixPosition++ < 0){
                    string.push("0");
                }
                for(let i69 = 0; i69 < significandDigits - Math.max(radixPosition - 1, 0); i69++){
                    string.push(`${significand[index++]}`);
                }
            }
        }
        return string.join("");
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Decimal128("${this.toString()}")`;
    }
    toJSON() {
        return {
            $numberDecimal: this.toString()
        };
    }
}
class Double {
    value;
    constructor(value){
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value;
    }
    valueOf() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Double(${this.toJSON()})`;
    }
}
function writeIEEE754(buffer21, value, offset111, endian, mLen, nBytes) {
    let e;
    let m;
    let c;
    const bBE = endian === "big";
    let eLen = nBytes * 8 - mLen - 1;
    const eMax = (1 << eLen) - 1;
    const eBias = eMax >> 1;
    const rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    let i70 = bBE ? nBytes - 1 : 0;
    const d = bBE ? -1 : 1;
    const s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    if (isNaN(value)) m = 0;
    while(mLen >= 8){
        buffer21[offset111 + i70] = m & 255;
        i70 += d;
        m /= 256;
        mLen -= 8;
    }
    e = e << mLen | m;
    if (isNaN(value)) e += 8;
    eLen += mLen;
    while(eLen > 0){
        buffer21[offset111 + i70] = e & 255;
        i70 += d;
        e /= 256;
        eLen -= 8;
    }
    buffer21[offset111 + i70 - d] |= s * 128;
}
class Int32 {
    value;
    constructor(value){
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value | 0;
    }
    valueOf() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    toJSON() {
        return this.value;
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Int32(${this.valueOf()})`;
    }
}
class MaxKey {
    [Symbol.for("Deno.customInspect")]() {
        return "new MaxKey()";
    }
}
class MinKey {
    [Symbol.for("Deno.customInspect")]() {
        return "new MinKey()";
    }
}
const hexTable = new TextEncoder().encode("0123456789abcdef");
function errInvalidByte(__byte) {
    return new TypeError(`Invalid byte '${String.fromCharCode(__byte)}'`);
}
function errLength() {
    return new RangeError("Odd length hex string");
}
function fromHexChar(__byte) {
    if (48 <= __byte && __byte <= 57) return __byte - 48;
    if (97 <= __byte && __byte <= 102) return __byte - 97 + 10;
    if (65 <= __byte && __byte <= 70) return __byte - 65 + 10;
    throw errInvalidByte(__byte);
}
function encode2(src) {
    const dst = new Uint8Array(src.length * 2);
    for(let i71 = 0; i71 < dst.length; i71++){
        const v = src[i71];
        dst[i71 * 2] = hexTable[v >> 4];
        dst[i71 * 2 + 1] = hexTable[v & 15];
    }
    return dst;
}
function decode2(src) {
    const dst = new Uint8Array(src.length / 2);
    for(let i72 = 0; i72 < dst.length; i72++){
        const a = fromHexChar(src[i72 * 2]);
        const b = fromHexChar(src[i72 * 2 + 1]);
        dst[i72] = a << 4 | b;
    }
    if (src.length % 2 == 1) {
        fromHexChar(src[dst.length * 2]);
        throw errLength();
    }
    return dst;
}
const mod1 = {
    encode: encode2,
    decode: decode2
};
const base64abc1 = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/", 
];
function encode3(data25) {
    const uint8 = typeof data25 === "string" ? new TextEncoder().encode(data25) : data25 instanceof Uint8Array ? data25 : new Uint8Array(data25);
    let result = "", i73;
    const l = uint8.length;
    for(i73 = 2; i73 < l; i73 += 3){
        result += base64abc1[uint8[i73 - 2] >> 2];
        result += base64abc1[(uint8[i73 - 2] & 3) << 4 | uint8[i73 - 1] >> 4];
        result += base64abc1[(uint8[i73 - 1] & 15) << 2 | uint8[i73] >> 6];
        result += base64abc1[uint8[i73] & 63];
    }
    if (i73 === l + 1) {
        result += base64abc1[uint8[i73 - 2] >> 2];
        result += base64abc1[(uint8[i73 - 2] & 3) << 4];
        result += "==";
    }
    if (i73 === l) {
        result += base64abc1[uint8[i73 - 2] >> 2];
        result += base64abc1[(uint8[i73 - 2] & 3) << 4 | uint8[i73 - 1] >> 4];
        result += base64abc1[(uint8[i73 - 1] & 15) << 2];
        result += "=";
    }
    return result;
}
function decode3(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i74 = 0; i74 < size; i74++){
        bytes[i74] = binString.charCodeAt(i74);
    }
    return bytes;
}
const mod2 = {
    encode: encode3,
    decode: decode3
};
function equalsNaive(a, b) {
    if (a.length !== b.length) return false;
    for(let i75 = 0; i75 < b.length; i75++){
        if (a[i75] !== b[i75]) return false;
    }
    return true;
}
function equalsSimd(a, b) {
    if (a.length !== b.length) return false;
    const len = a.length;
    const compressable = Math.floor(len / 4);
    const compressedA = new Uint32Array(a.buffer, 0, compressable);
    const compressedB = new Uint32Array(b.buffer, 0, compressable);
    for(let i76 = compressable * 4; i76 < len; i76++){
        if (a[i76] !== b[i76]) return false;
    }
    for(let i1 = 0; i1 < compressedA.length; i1++){
        if (compressedA[i1] !== compressedB[i1]) return false;
    }
    return true;
}
function equals(a, b) {
    if (a.length < 1000) return equalsNaive(a, b);
    return equalsSimd(a, b);
}
function copy1(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
function decodeHexString(hexString) {
    return mod1.decode(textEncoder.encode(hexString));
}
function encodeHexString(uint8Array) {
    return textDecoder.decode(mod1.encode(uint8Array));
}
const textEncoder1 = new TextEncoder();
const textDecoder1 = new TextDecoder();
const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
let PROCESS_UNIQUE = null;
class ObjectId {
    static #index = Math.floor(Math.random() * 16777215);
    static cacheHexString;
    #id;
    #bytesBuffer;
    constructor(inputId = ObjectId.generate()){
        let workingId;
        if (typeof inputId === "object" && inputId && "id" in inputId) {
            if (typeof inputId.id !== "string" && !ArrayBuffer.isView(inputId.id)) {
                throw new BSONTypeError("Argument passed in must have an id that is of type string or Buffer");
            }
            workingId = "toHexString" in inputId && typeof inputId.toHexString === "function" ? decodeHexString(inputId.toHexString()) : inputId.id;
        } else {
            workingId = inputId;
        }
        if (workingId == null || typeof workingId === "number") {
            this.#bytesBuffer = new Uint8Array(ObjectId.generate(typeof workingId === "number" ? workingId : undefined));
        } else if (ArrayBuffer.isView(workingId) && workingId.byteLength === 12) {
            this.#bytesBuffer = workingId;
        } else if (typeof workingId === "string") {
            if (workingId.length === 12) {
                const bytes = textEncoder1.encode(workingId);
                if (bytes.byteLength === 12) {
                    this.#bytesBuffer = bytes;
                } else {
                    throw new BSONTypeError("Argument passed in must be a string of 12 bytes");
                }
            } else if (workingId.length === 24 && checkForHexRegExp.test(workingId)) {
                this.#bytesBuffer = decodeHexString(workingId);
            } else {
                throw new BSONTypeError("Argument passed in must be a string of 12 bytes or a string of 24 hex characters");
            }
        } else {
            throw new BSONTypeError("Argument passed in does not match the accepted types");
        }
        if (ObjectId.cacheHexString) {
            this.#id = encodeHexString(this.id);
        }
    }
    get id() {
        return this.#bytesBuffer;
    }
    set id(value) {
        this.#bytesBuffer = value;
        if (ObjectId.cacheHexString) {
            this.#id = encodeHexString(value);
        }
    }
    toHexString() {
        if (ObjectId.cacheHexString && this.#id) {
            return this.#id;
        }
        const hexString = encodeHexString(this.id);
        if (ObjectId.cacheHexString && !this.#id) {
            this.#id = hexString;
        }
        return hexString;
    }
    static generate(time) {
        if ("number" !== typeof time) {
            time = Math.floor(Date.now() / 1000);
        }
        const inc = this.#index = (this.#index + 1) % 16777215;
        const objectId = new Uint8Array(12);
        new DataView(objectId.buffer, 0, 4).setUint32(0, time);
        if (PROCESS_UNIQUE === null) {
            PROCESS_UNIQUE = randomBytes(5);
        }
        objectId[4] = PROCESS_UNIQUE[0];
        objectId[5] = PROCESS_UNIQUE[1];
        objectId[6] = PROCESS_UNIQUE[2];
        objectId[7] = PROCESS_UNIQUE[3];
        objectId[8] = PROCESS_UNIQUE[4];
        objectId[11] = inc & 255;
        objectId[10] = inc >> 8 & 255;
        objectId[9] = inc >> 16 & 255;
        return objectId;
    }
    toString() {
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (otherId == null) {
            return false;
        }
        if (otherId instanceof ObjectId) {
            return this.toString() === otherId.toString();
        }
        if (typeof otherId === "string" && ObjectId.isValid(otherId) && otherId.length === 12 && this.id instanceof Uint8Array) {
            return otherId === textDecoder1.decode(this.id);
        }
        if (typeof otherId === "string" && ObjectId.isValid(otherId) && otherId.length === 24) {
            return otherId.toLowerCase() === this.toHexString();
        }
        if (typeof otherId === "string" && ObjectId.isValid(otherId) && otherId.length === 12) {
            const otherIdUint8Array = textEncoder1.encode(otherId);
            for(let i77 = 0; i77 < 12; i77++){
                if (otherIdUint8Array[i77] !== this.id[i77]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    getTimestamp() {
        const timestamp = new Date();
        const time = new DataView(this.id.buffer, 0, 4).getUint32(0);
        timestamp.setTime(Math.floor(time) * 1000);
        return timestamp;
    }
    static createFromTime(time) {
        const buffer22 = new Uint8Array([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]);
        new DataView(buffer22.buffer, 0, 4).setUint32(0, time);
        return new ObjectId(buffer22);
    }
    static createFromHexString(hexString) {
        if (typeof hexString === "undefined" || hexString != null && hexString.length !== 24) {
            throw new BSONTypeError("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        }
        return new ObjectId(decodeHexString(hexString));
    }
    static isValid(id) {
        if (id == null) return false;
        try {
            new ObjectId(id);
            return true;
        } catch  {
            return false;
        }
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new ObjectId("${this.toHexString()}")`;
    }
}
class Timestamp extends Long {
    static MAX_VALUE = Long.MAX_UNSIGNED_VALUE;
    constructor(value = new Long()){
        const isLong = Long.isLong(value);
        const low = isLong ? value.low : value.i;
        const high = isLong ? value.high : value.t;
        super(low, high, true);
    }
    toJSON() {
        return {
            $timestamp: this.toString()
        };
    }
    static fromInt(value) {
        return new Timestamp(Long.fromInt(value, true));
    }
    static fromNumber(value) {
        return new Timestamp(Long.fromNumber(value, true));
    }
    static fromBits(lowBits, highBits) {
        return new Timestamp(new Long(lowBits, highBits));
    }
    static fromString(str, optRadix) {
        return new Timestamp(Long.fromString(str, true, optRadix));
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Timestamp({ t: ${this.getHighBits()}, i: ${this.getLowBits()} })`;
    }
}
function alphabetize(str) {
    return str.split("").sort().join("");
}
class BSONRegExp {
    pattern;
    options;
    constructor(pattern, options){
        this.pattern = pattern;
        this.options = alphabetize(options ?? "");
        if (this.pattern.indexOf("\x00") !== -1) {
            throw new BSONError(`BSON Regex patterns cannot contain null bytes, found: ${JSON.stringify(this.pattern)}`);
        }
        if (this.options.indexOf("\x00") !== -1) {
            throw new BSONError(`BSON Regex options cannot contain null bytes, found: ${JSON.stringify(this.options)}`);
        }
        for(let i78 = 0; i78 < this.options.length; i78++){
            if (!(this.options[i78] === "i" || this.options[i78] === "m" || this.options[i78] === "x" || this.options[i78] === "l" || this.options[i78] === "s" || this.options[i78] === "u")) {
                throw new BSONError(`The regular expression option [${this.options[i78]}] is not supported`);
            }
        }
    }
    static parseOptions(options) {
        return options ? options.split("").sort().join("") : "";
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new BSONRegExp("${this.pattern}")`;
    }
}
const VALIDATION_REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15})$/i;
const uuidValidateString = (str)=>typeof str === "string" && VALIDATION_REGEX.test(str)
;
const uuidHexStringToBuffer = (hexString)=>{
    if (!uuidValidateString(hexString)) {
        throw new BSONTypeError('UUID string representations must be a 32 or 36 character hex string (dashes excluded/included). Format: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" or "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".');
    }
    const sanitizedHexString = hexString.replace(/-/g, "");
    return decodeHexString(sanitizedHexString);
};
const hexTable1 = new TextEncoder().encode("0123456789abcdef");
const textDecoder2 = new TextDecoder();
const bufferToUuidHexString = (bytes, includeDashes = true)=>{
    if (!includeDashes) return encodeHexString(bytes);
    const dst = new Uint8Array(36);
    let srcIndex = 0;
    let dstIndex = 0;
    while(srcIndex < bytes.length){
        if (dstIndex === 8 || dstIndex === 13 || dstIndex === 18 || dstIndex === 23) {
            dst[dstIndex] = 45;
            dstIndex++;
            continue;
        }
        const v = bytes[srcIndex];
        dst[dstIndex] = hexTable1[v >> 4];
        dst[dstIndex + 1] = hexTable1[v & 15];
        dstIndex += 2;
        srcIndex++;
    }
    return textDecoder2.decode(dst);
};
var BinarySizes;
(function(BinarySizes2) {
    BinarySizes2[BinarySizes2["BUFFER_SIZE"] = 256] = "BUFFER_SIZE";
    BinarySizes2[BinarySizes2["SUBTYPE_DEFAULT"] = 0] = "SUBTYPE_DEFAULT";
    BinarySizes2[BinarySizes2["SUBTYPE_FUNCTION"] = 1] = "SUBTYPE_FUNCTION";
    BinarySizes2[BinarySizes2["SUBTYPE_BYTE_ARRAY"] = 2] = "SUBTYPE_BYTE_ARRAY";
    BinarySizes2[BinarySizes2["SUBTYPE_UUID"] = 4] = "SUBTYPE_UUID";
    BinarySizes2[BinarySizes2["SUBTYPE_MD5"] = 5] = "SUBTYPE_MD5";
    BinarySizes2[BinarySizes2["SUBTYPE_ENCRYPTED"] = 6] = "SUBTYPE_ENCRYPTED";
    BinarySizes2[BinarySizes2["SUBTYPE_COLUMN"] = 7] = "SUBTYPE_COLUMN";
    BinarySizes2[BinarySizes2["SUBTYPE_USER_DEFINE"] = 128] = "SUBTYPE_USER_DEFINE";
    BinarySizes2[BinarySizes2["BSON_BINARY_SUBTYPE_DEFAULT"] = 0] = "BSON_BINARY_SUBTYPE_DEFAULT";
})(BinarySizes || (BinarySizes = {}));
const textDecoder3 = new TextDecoder();
class Binary {
    buffer;
    subType;
    constructor(buffer23, subType = BinarySizes.BSON_BINARY_SUBTYPE_DEFAULT){
        this.buffer = buffer23;
        this.subType = subType;
    }
    length() {
        return this.buffer.length;
    }
    toJSON() {
        return mod2.encode(this.buffer);
    }
    toString() {
        return textDecoder3.decode(this.buffer);
    }
    toUUID() {
        if (this.subType === BinarySizes.SUBTYPE_UUID) {
            return new UUID(this.buffer);
        }
        throw new BSONError(`Binary sub_type "${this.subType}" is not supported for converting to UUID. Only "${BinarySizes.SUBTYPE_UUID}" is currently supported.`);
    }
    [Symbol.for("Deno.customInspect")]() {
        if (this.subType === BinarySizes.SUBTYPE_DEFAULT) {
            return `new Binary(${Deno.inspect(this.buffer)})`;
        }
        return `new Binary(${Deno.inspect(this.buffer)}, ${this.subType})`;
    }
}
class UUID {
    static cacheHexString;
    #bytesBuffer;
    #id;
    constructor(input){
        if (typeof input === "undefined") {
            this.id = UUID.generate();
        } else if (input instanceof UUID) {
            this.#bytesBuffer = input.id;
            this.#id = input.#id;
        } else if (ArrayBuffer.isView(input) && input.byteLength === 16) {
            this.id = input;
        } else if (typeof input === "string") {
            this.id = uuidHexStringToBuffer(input);
        } else {
            throw new BSONTypeError("Argument passed in UUID constructor must be a UUID, a 16 byte Buffer or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).");
        }
        this.#bytesBuffer = this.id;
    }
    get id() {
        return this.#bytesBuffer;
    }
    set id(value) {
        this.#bytesBuffer = value;
        if (UUID.cacheHexString) {
            this.#id = bufferToUuidHexString(value);
        }
    }
    toHexString(includeDashes = true) {
        if (UUID.cacheHexString && this.#id) {
            return this.#id;
        }
        const uuidHexString = bufferToUuidHexString(this.id, includeDashes);
        if (UUID.cacheHexString) {
            this.#id = uuidHexString;
        }
        return uuidHexString;
    }
    toString() {
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (!otherId) {
            return false;
        }
        if (otherId instanceof UUID) {
            return equals(otherId.id, this.id);
        }
        try {
            return equals(new UUID(otherId).id, this.id);
        } catch  {
            return false;
        }
    }
    toBinary() {
        return new Binary(this.id, BinarySizes.SUBTYPE_UUID);
    }
    static generate() {
        const bytes = randomBytes(16);
        bytes[6] = bytes[6] & 15 | 64;
        bytes[8] = bytes[8] & 63 | 128;
        return bytes;
    }
    static isValid(input) {
        if (!input) {
            return false;
        }
        if (input instanceof UUID) {
            return true;
        }
        if (typeof input === "string") {
            return uuidValidateString(input);
        }
        if (input instanceof Uint8Array) {
            if (input.length !== 16) {
                return false;
            }
            try {
                return parseInt(input[6].toString(16)[0], 10) === BinarySizes.SUBTYPE_UUID;
            } catch  {
                return false;
            }
        }
        return false;
    }
    static createFromHexString(hexString) {
        const buffer24 = uuidHexStringToBuffer(hexString);
        return new UUID(buffer24);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new UUID("${this.toHexString()}")`;
    }
}
class BSONSymbol {
    value;
    constructor(value){
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
    toString() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new BSONSymbol("${this.value}")`;
    }
}
function validateUtf8(bytes, start, end) {
    let continuation = 0;
    for(let i79 = start; i79 < end; i79 += 1){
        const __byte = bytes[i79];
        if (continuation) {
            if ((__byte & 192) !== 128) {
                return false;
            }
            continuation -= 1;
        } else if (__byte & 128) {
            if ((__byte & 224) === 192) {
                continuation = 1;
            } else if ((__byte & 240) === 224) {
                continuation = 2;
            } else if ((__byte & 248) === 240) {
                continuation = 3;
            } else {
                return false;
            }
        }
    }
    return !continuation;
}
const JS_INT_MAX_LONG = Long.fromNumber(JS_INT_MAX);
const JS_INT_MIN_LONG = Long.fromNumber(JS_INT_MIN);
const functionCache = {};
function deserialize(buffer25, options = {}, isArray) {
    const index = options?.index ? options.index : 0;
    const size = buffer25[index] | buffer25[index + 1] << 8 | buffer25[index + 2] << 16 | buffer25[index + 3] << 24;
    if (size < 5) {
        throw new BSONError(`bson size must be >= 5, is ${size}`);
    }
    if (options.allowObjectSmallerThanBufferSize && buffer25.length < size) {
        throw new BSONError(`buffer length ${buffer25.length} must be >= bson size ${size}`);
    }
    if (!options.allowObjectSmallerThanBufferSize && buffer25.length !== size) {
        throw new BSONError(`buffer length ${buffer25.length} must === bson size ${size}`);
    }
    if (size + index > buffer25.byteLength) {
        throw new BSONError(`(bson size ${size} + options.index ${index} must be <= buffer length ${buffer25.byteLength})`);
    }
    if (buffer25[index + size - 1] !== 0) {
        throw new BSONError("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
    }
    return deserializeObject(buffer25, index, options, isArray);
}
const allowedDBRefKeys = /^\$ref$|^\$id$|^\$db$/;
function deserializeObject(buffer26, index, options, isArray = false) {
    const evalFunctions = options.evalFunctions ?? false;
    const cacheFunctions = options.cacheFunctions ?? false;
    const fieldsAsRaw = options.fieldsAsRaw ?? null;
    const raw = options.raw ?? false;
    const bsonRegExp = options.bsonRegExp ?? false;
    const promoteBuffers = options.promoteBuffers ?? false;
    const promoteLongs = options.promoteLongs ?? true;
    const promoteValues = options.promoteValues ?? true;
    const validation = options.validation ?? {
        utf8: true
    };
    let globalUTFValidation = true;
    let validationSetting;
    const utf8KeysSet = new Set();
    const utf8ValidatedKeys = validation.utf8;
    if (typeof utf8ValidatedKeys === "boolean") {
        validationSetting = utf8ValidatedKeys;
    } else {
        globalUTFValidation = false;
        const utf8ValidationValues = Object.keys(utf8ValidatedKeys).map((key)=>utf8ValidatedKeys[key]
        );
        if (utf8ValidationValues.length === 0) {
            throw new BSONError("UTF-8 validation setting cannot be empty");
        }
        if (typeof utf8ValidationValues[0] !== "boolean") {
            throw new BSONError("Invalid UTF-8 validation option, must specify boolean values");
        }
        validationSetting = utf8ValidationValues[0];
        if (!utf8ValidationValues.every((item)=>item === validationSetting
        )) {
            throw new BSONError("Invalid UTF-8 validation option - keys must be all true or all false");
        }
    }
    if (!globalUTFValidation) {
        for (const key of Object.keys(utf8ValidatedKeys)){
            utf8KeysSet.add(key);
        }
    }
    const startIndex = index;
    if (buffer26.length < 5) {
        throw new BSONError("corrupt bson message < 5 bytes long");
    }
    const size = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
    if (size < 5 || size > buffer26.length) {
        throw new BSONError("corrupt bson message");
    }
    const object = isArray ? [] : {};
    let arrayIndex = 0;
    let isPossibleDBRef = isArray ? false : null;
    while(!false){
        const elementType = buffer26[index++];
        if (elementType === 0) break;
        let i80 = index;
        while(buffer26[i80] !== 0 && i80 < buffer26.length){
            i80++;
        }
        if (i80 >= buffer26.byteLength) {
            throw new BSONError("Bad BSON Document: illegal CString");
        }
        const name = isArray ? arrayIndex++ : utf8Slice(buffer26, index, i80);
        let shouldValidateKey = true;
        shouldValidateKey = globalUTFValidation || utf8KeysSet.has(name) ? validationSetting : !validationSetting;
        if (isPossibleDBRef !== false && name[0] === "$") {
            isPossibleDBRef = allowedDBRefKeys.test(name);
        }
        let value;
        index = i80 + 1;
        if (elementType === BSONData.STRING) {
            const stringSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer26.length - index || buffer26[index + stringSize - 1] !== 0) {
                throw new BSONError("bad string length in bson");
            }
            value = getValidatedString(buffer26, index, index + stringSize - 1, shouldValidateKey);
            index += stringSize;
        } else if (elementType === BSONData.OID) {
            const oid = new Uint8Array(12);
            bytesCopy(oid, 0, buffer26, index, index + 12);
            value = new ObjectId(oid);
            index += 12;
        } else if (elementType === BSONData.INT && promoteValues === false) {
            value = new Int32(buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24);
        } else if (elementType === BSONData.INT) {
            value = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
        } else if (elementType === BSONData.NUMBER && promoteValues === false) {
            value = new Double(new DataView(buffer26.buffer, index, 8).getFloat64(0, true));
            index += 8;
        } else if (elementType === BSONData.NUMBER) {
            value = new DataView(buffer26.buffer, index, 8).getFloat64(0, true);
            index += 8;
        } else if (elementType === BSONData.DATE) {
            const lowBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            const highBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            value = new Date(new Long(lowBits, highBits).toNumber());
        } else if (elementType === BSONData.BOOLEAN) {
            if (buffer26[index] !== 0 && buffer26[index] !== 1) {
                throw new BSONError("illegal boolean type value");
            }
            value = buffer26[index++] === 1;
        } else if (elementType === BSONData.OBJECT) {
            const _index = index;
            const objectSize = buffer26[index] | buffer26[index + 1] << 8 | buffer26[index + 2] << 16 | buffer26[index + 3] << 24;
            if (objectSize <= 0 || objectSize > buffer26.length - index) {
                throw new BSONError("bad embedded document length in bson");
            }
            if (raw) {
                value = buffer26.slice(index, index + objectSize);
            } else {
                let objectOptions = options;
                if (!globalUTFValidation) {
                    objectOptions = {
                        ...options,
                        validation: {
                            utf8: shouldValidateKey
                        }
                    };
                }
                value = deserializeObject(buffer26, _index, objectOptions, false);
            }
            index += objectSize;
        } else if (elementType === BSONData.ARRAY) {
            const _index = index;
            const objectSize = buffer26[index] | buffer26[index + 1] << 8 | buffer26[index + 2] << 16 | buffer26[index + 3] << 24;
            let arrayOptions = options;
            const stopIndex = index + objectSize;
            if (fieldsAsRaw && fieldsAsRaw[name]) {
                arrayOptions = {};
                for(const n in options){
                    arrayOptions[n] = options[n];
                }
                arrayOptions.raw = true;
            }
            if (!globalUTFValidation) {
                arrayOptions = {
                    ...arrayOptions,
                    validation: {
                        utf8: shouldValidateKey
                    }
                };
            }
            value = deserializeObject(buffer26, _index, arrayOptions, true);
            index += objectSize;
            if (buffer26[index - 1] !== 0) {
                throw new BSONError("invalid array terminator byte");
            }
            if (index !== stopIndex) throw new BSONError("corrupted array bson");
        } else if (elementType === BSONData.UNDEFINED) {
            value = undefined;
        } else if (elementType === BSONData.NULL) {
            value = null;
        } else if (elementType === BSONData.LONG) {
            const lowBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            const highBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            const __long = new Long(lowBits, highBits);
            if (promoteLongs && promoteValues === true) {
                value = __long.lessThanOrEqual(JS_INT_MAX_LONG) && __long.greaterThanOrEqual(JS_INT_MIN_LONG) ? __long.toNumber() : __long;
            } else {
                value = __long;
            }
        } else if (elementType === BSONData.DECIMAL128) {
            const bytes = new Uint8Array(16);
            bytesCopy(bytes, 0, buffer26, index, index + 16);
            index += 16;
            const decimal128 = new Decimal128(bytes);
            value = "toObject" in decimal128 && typeof decimal128.toObject === "function" ? decimal128.toObject() : decimal128;
        } else if (elementType === BSONData.BINARY) {
            let binarySize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            const totalBinarySize = binarySize;
            const subType = buffer26[index++];
            if (binarySize < 0) {
                throw new BSONError("Negative binary type element size found");
            }
            if (binarySize > buffer26.byteLength) {
                throw new BSONError("Binary type size larger than document size");
            }
            if (buffer26.slice != null) {
                if (subType === BinarySizes.SUBTYPE_BYTE_ARRAY) {
                    binarySize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
                    if (binarySize < 0) {
                        throw new BSONError("Negative binary type element size found for subtype 0x02");
                    }
                    if (binarySize > totalBinarySize - 4) {
                        throw new BSONError("Binary type with subtype 0x02 contains too long binary size");
                    }
                    if (binarySize < totalBinarySize - 4) {
                        throw new BSONError("Binary type with subtype 0x02 contains too short binary size");
                    }
                }
                value = promoteBuffers && promoteValues ? buffer26.slice(index, index + binarySize) : new Binary(buffer26.slice(index, index + binarySize), subType);
            } else {
                const _buffer = new Uint8Array(binarySize);
                if (subType === BinarySizes.SUBTYPE_BYTE_ARRAY) {
                    binarySize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
                    if (binarySize < 0) {
                        throw new BSONError("Negative binary type element size found for subtype 0x02");
                    }
                    if (binarySize > totalBinarySize - 4) {
                        throw new BSONError("Binary type with subtype 0x02 contains too long binary size");
                    }
                    if (binarySize < totalBinarySize - 4) {
                        throw new BSONError("Binary type with subtype 0x02 contains too short binary size");
                    }
                }
                for(i80 = 0; i80 < binarySize; i80++){
                    _buffer[i80] = buffer26[index + i80];
                }
                value = promoteBuffers && promoteValues ? _buffer : new Binary(_buffer, subType);
            }
            index += binarySize;
        } else if (elementType === BSONData.REGEXP && bsonRegExp === false) {
            i80 = index;
            while(buffer26[i80] !== 0 && i80 < buffer26.length){
                i80++;
            }
            if (i80 >= buffer26.length) {
                throw new BSONError("Bad BSON Document: illegal CString");
            }
            const source = utf8Slice(buffer26, index, i80);
            index = i80 + 1;
            i80 = index;
            while(buffer26[i80] !== 0 && i80 < buffer26.length){
                i80++;
            }
            if (i80 >= buffer26.length) {
                throw new BSONError("Bad BSON Document: illegal CString");
            }
            const regExpOptions = utf8Slice(buffer26, index, i80);
            index = i80 + 1;
            const optionsArray = new Array(regExpOptions.length);
            for(i80 = 0; i80 < regExpOptions.length; i80++){
                switch(regExpOptions[i80]){
                    case "m":
                        optionsArray[i80] = "m";
                        break;
                    case "s":
                        optionsArray[i80] = "g";
                        break;
                    case "i":
                        optionsArray[i80] = "i";
                        break;
                }
            }
            value = new RegExp(source, optionsArray.join(""));
        } else if (elementType === BSONData.REGEXP && bsonRegExp === true) {
            i80 = index;
            while(buffer26[i80] !== 0 && i80 < buffer26.length){
                i80++;
            }
            if (i80 >= buffer26.length) {
                throw new BSONError("Bad BSON Document: illegal CString");
            }
            const source = utf8Slice(buffer26, index, i80);
            index = i80 + 1;
            i80 = index;
            while(buffer26[i80] !== 0 && i80 < buffer26.length){
                i80++;
            }
            if (i80 >= buffer26.length) {
                throw new BSONError("Bad BSON Document: illegal CString");
            }
            const regExpOptions = utf8Slice(buffer26, index, i80);
            index = i80 + 1;
            value = new BSONRegExp(source, regExpOptions);
        } else if (elementType === BSONData.SYMBOL) {
            const stringSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer26.length - index || buffer26[index + stringSize - 1] !== 0) {
                throw new BSONError("bad string length in bson");
            }
            const symbol = getValidatedString(buffer26, index, index + stringSize - 1, shouldValidateKey);
            value = promoteValues ? symbol : new BSONSymbol(symbol);
            index += stringSize;
        } else if (elementType === BSONData.TIMESTAMP) {
            const lowBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            const highBits = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            value = new Timestamp(new Long(lowBits, highBits));
        } else if (elementType === BSONData.MIN_KEY) {
            value = new MinKey();
        } else if (elementType === BSONData.MAX_KEY) {
            value = new MaxKey();
        } else if (elementType === BSONData.CODE) {
            const stringSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer26.length - index || buffer26[index + stringSize - 1] !== 0) {
                throw new BSONError("bad string length in bson");
            }
            const functionString = getValidatedString(buffer26, index, index + stringSize - 1, shouldValidateKey);
            if (evalFunctions) {
                value = cacheFunctions ? isolateEval(functionString, functionCache, object) : isolateEval(functionString);
            } else {
                value = new Code(functionString);
            }
            index += stringSize;
        } else if (elementType === BSONData.CODE_W_SCOPE) {
            const totalSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (totalSize < 4 + 4 + 4 + 1) {
                throw new BSONError("code_w_scope total size shorter minimum expected length");
            }
            const stringSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer26.length - index || buffer26[index + stringSize - 1] !== 0) {
                throw new BSONError("bad string length in bson");
            }
            const functionString = getValidatedString(buffer26, index, index + stringSize - 1, shouldValidateKey);
            index += stringSize;
            const _index = index;
            const objectSize = buffer26[index] | buffer26[index + 1] << 8 | buffer26[index + 2] << 16 | buffer26[index + 3] << 24;
            const scopeObject = deserializeObject(buffer26, _index, options, false);
            index += objectSize;
            if (totalSize < 4 + 4 + objectSize + stringSize) {
                throw new BSONError("code_w_scope total size is too short, truncating scope");
            }
            if (totalSize > 4 + 4 + objectSize + stringSize) {
                throw new BSONError("code_w_scope total size is too long, clips outer document");
            }
            if (evalFunctions) {
                value = cacheFunctions ? isolateEval(functionString, functionCache, object) : isolateEval(functionString);
                value.scope = scopeObject;
            } else {
                value = new Code(functionString, scopeObject);
            }
        } else if (elementType === BSONData.DBPOINTER) {
            const stringSize = buffer26[index++] | buffer26[index++] << 8 | buffer26[index++] << 16 | buffer26[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer26.length - index || buffer26[index + stringSize - 1] !== 0) {
                throw new BSONError("bad string length in bson");
            }
            if (validation?.utf8 && !validateUtf8(buffer26, index, index + stringSize - 1)) {
                throw new BSONError("Invalid UTF-8 string in BSON document");
            }
            const namespace = utf8Slice(buffer26, index, index + stringSize - 1);
            index += stringSize;
            const oidBuffer = new Uint8Array(12);
            bytesCopy(oidBuffer, 0, buffer26, index, index + 12);
            const oid = new ObjectId(oidBuffer);
            index += 12;
            value = new DBRef(namespace, oid);
        } else {
            throw new BSONError(`Detected unknown BSON type ${elementType.toString(16)}` + ' for fieldname "' + name + '"');
        }
        if (name === "__proto__") {
            Object.defineProperty(object, name, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else {
            object[name] = value;
        }
    }
    if (size !== index - startIndex) {
        if (isArray) throw new BSONError("corrupt array bson");
        throw new BSONError("corrupt object bson");
    }
    if (!isPossibleDBRef) return object;
    if (isDBRefLike(object)) {
        const copy6 = Object.assign({}, object);
        delete copy6.$ref;
        delete copy6.$id;
        delete copy6.$db;
        return new DBRef(object.$ref, object.$id, object.$db, copy6);
    }
    return object;
}
function isolateEval(functionString, functionCache1, object) {
    if (!functionCache1) return new Function(functionString);
    if (functionCache1[functionString] == null) {
        functionCache1[functionString] = new Function(functionString);
    }
    return functionCache1[functionString].bind(object);
}
function getValidatedString(buffer27, start, end, shouldValidateUtf8) {
    const value = utf8Slice(buffer27, start, end);
    if (shouldValidateUtf8) {
        for(let i81 = 0; i81 < value.length; i81++){
            if (value.charCodeAt(i81) === 65533) {
                if (!validateUtf8(buffer27, start, end)) {
                    throw new BSONError("Invalid UTF-8 string in BSON document");
                }
                break;
            }
        }
    }
    return value;
}
const utf8Encoder1 = new TextEncoder();
const regexp = /\x00/;
const MAXSIZE = 1024 * 1024 * 17;
let buffer = new Uint8Array(MAXSIZE);
function setInternalBufferSize(size) {
    if (buffer.length < size) {
        buffer = new Uint8Array(size);
    }
}
const ignoreKeys = new Set([
    "$db",
    "$ref",
    "$id",
    "$clusterTime"
]);
function serializeString(buffer28, key, value, index, isArray) {
    buffer28[index++] = BSONData.STRING;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer28, key, index, Encoding.Utf8) : writeToBytes(buffer28, key, index, Encoding.Ascii);
    index = index + numberOfWrittenBytes + 1;
    buffer28[index - 1] = 0;
    const size = writeToBytes(buffer28, value, index + 4, Encoding.Utf8);
    buffer28[index + 3] = size + 1 >> 24 & 255;
    buffer28[index + 2] = size + 1 >> 16 & 255;
    buffer28[index + 1] = size + 1 >> 8 & 255;
    buffer28[index] = size + 1 & 255;
    index = index + 4 + size;
    buffer28[index++] = 0;
    return index;
}
function serializeNumber(buffer29, key, value, index, isArray) {
    if (Number.isInteger(value) && value >= BSON_INT32_MIN && value <= 2147483647) {
        buffer29[index++] = BSONData.INT;
        const numberOfWrittenBytes = !isArray ? writeToBytes(buffer29, key, index, Encoding.Utf8) : writeToBytes(buffer29, key, index, Encoding.Ascii);
        index += numberOfWrittenBytes;
        buffer29[index++] = 0;
        buffer29[index++] = value & 255;
        buffer29[index++] = value >> 8 & 255;
        buffer29[index++] = value >> 16 & 255;
        buffer29[index++] = value >> 24 & 255;
    } else {
        buffer29[index++] = BSONData.NUMBER;
        const numberOfWrittenBytes = !isArray ? writeToBytes(buffer29, key, index, Encoding.Utf8) : writeToBytes(buffer29, key, index, Encoding.Ascii);
        index += numberOfWrittenBytes;
        buffer29[index++] = 0;
        writeIEEE754(buffer29, value, index, "little", 52, 8);
        index += 8;
    }
    return index;
}
function serializeNull(buffer30, key, _, index, isArray) {
    buffer30[index++] = BSONData.NULL;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer30, key, index, Encoding.Utf8) : writeToBytes(buffer30, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer30[index++] = 0;
    return index;
}
function serializeBoolean(buffer31, key, value, index, isArray) {
    buffer31[index++] = BSONData.BOOLEAN;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer31, key, index, Encoding.Utf8) : writeToBytes(buffer31, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer31[index++] = 0;
    buffer31[index++] = value ? 1 : 0;
    return index;
}
function serializeDate(buffer32, key, value, index, isArray) {
    buffer32[index++] = BSONData.DATE;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer32, key, index, Encoding.Utf8) : writeToBytes(buffer32, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer32[index++] = 0;
    const dateInMilis = Long.fromNumber(value.getTime());
    const lowBits = dateInMilis.getLowBits();
    const highBits = dateInMilis.getHighBits();
    buffer32[index++] = lowBits & 255;
    buffer32[index++] = lowBits >> 8 & 255;
    buffer32[index++] = lowBits >> 16 & 255;
    buffer32[index++] = lowBits >> 24 & 255;
    buffer32[index++] = highBits & 255;
    buffer32[index++] = highBits >> 8 & 255;
    buffer32[index++] = highBits >> 16 & 255;
    buffer32[index++] = highBits >> 24 & 255;
    return index;
}
function serializeRegExp(buffer33, key, value, index, isArray) {
    buffer33[index++] = BSONData.REGEXP;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer33, key, index, Encoding.Utf8) : writeToBytes(buffer33, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer33[index++] = 0;
    if (value.source && value.source.match(regexp) != null) {
        throw Error(`value ${value.source} must not contain null bytes`);
    }
    index += writeToBytes(buffer33, value.source, index, Encoding.Utf8);
    buffer33[index++] = 0;
    if (value.ignoreCase) buffer33[index++] = 105;
    if (value.global) buffer33[index++] = 115;
    if (value.multiline) buffer33[index++] = 109;
    buffer33[index++] = 0;
    return index;
}
function serializeBSONRegExp(buffer34, key, value, index, isArray) {
    buffer34[index++] = BSONData.REGEXP;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer34, key, index, Encoding.Utf8) : writeToBytes(buffer34, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer34[index++] = 0;
    if (value.pattern.match(regexp) != null) {
        throw Error(`pattern ${value.pattern} must not contain null bytes`);
    }
    index += writeToBytes(buffer34, value.pattern, index, Encoding.Utf8);
    buffer34[index++] = 0;
    index += writeToBytes(buffer34, value.options.split("").sort().join(""), index, Encoding.Utf8);
    buffer34[index++] = 0;
    return index;
}
function serializeMinMax(buffer35, key, value, index, isArray) {
    if (value === null) {
        buffer35[index++] = BSONData.NULL;
    } else if (value instanceof MinKey) {
        buffer35[index++] = BSONData.MIN_KEY;
    } else {
        buffer35[index++] = BSONData.MAX_KEY;
    }
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer35, key, index, Encoding.Utf8) : writeToBytes(buffer35, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer35[index++] = 0;
    return index;
}
function serializeObjectId(buffer36, key, value, index, isArray) {
    buffer36[index++] = BSONData.OID;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer36, key, index, Encoding.Utf8) : writeToBytes(buffer36, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer36[index++] = 0;
    if (typeof value.id === "string") {
        writeToBytes(buffer36, value.id, index, Encoding.Ascii);
    } else if (value.id instanceof Uint8Array) {
        buffer36.set(value.id.subarray(0, 12), index);
    } else {
        throw new BSONTypeError(`object [${JSON.stringify(value)}] is not a valid ObjectId`);
    }
    return index + 12;
}
function serializeBuffer(buffer37, key, value, index, isArray) {
    buffer37[index++] = BSONData.BINARY;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer37, key, index, Encoding.Utf8) : writeToBytes(buffer37, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer37[index++] = 0;
    const size = value.length;
    buffer37[index++] = size & 255;
    buffer37[index++] = size >> 8 & 255;
    buffer37[index++] = size >> 16 & 255;
    buffer37[index++] = size >> 24 & 255;
    buffer37[index++] = BSON_BINARY_SUBTYPE_DEFAULT;
    buffer37.set(value, index);
    index += size;
    return index;
}
function serializeObject(buffer38, key, value, index, checkKeys = false, depth = 0, serializeFunctions = false, ignoreUndefined = true, isArray = false, path = []) {
    for(let i82 = 0; i82 < path.length; i82++){
        if (path[i82] === value) throw new BSONError("cyclic dependency detected");
    }
    path.push(value);
    buffer38[index++] = Array.isArray(value) ? BSONData.ARRAY : BSONData.OBJECT;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer38, key, index, Encoding.Utf8) : writeToBytes(buffer38, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer38[index++] = 0;
    const endIndex = serializeInto(buffer38, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
    path.pop();
    return endIndex;
}
function serializeDecimal128(buffer39, key, value, index, isArray) {
    buffer39[index++] = BSONData.DECIMAL128;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer39, key, index, Encoding.Utf8) : writeToBytes(buffer39, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer39[index++] = 0;
    buffer39.set(value.bytes.subarray(0, 16), index);
    return index + 16;
}
function serializeLong(buffer40, key, value, index, isArray) {
    buffer40[index++] = value instanceof Timestamp ? BSONData.TIMESTAMP : BSONData.LONG;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer40, key, index, Encoding.Utf8) : writeToBytes(buffer40, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer40[index++] = 0;
    const lowBits = value.getLowBits();
    const highBits = value.getHighBits();
    buffer40[index++] = lowBits & 255;
    buffer40[index++] = lowBits >> 8 & 255;
    buffer40[index++] = lowBits >> 16 & 255;
    buffer40[index++] = lowBits >> 24 & 255;
    buffer40[index++] = highBits & 255;
    buffer40[index++] = highBits >> 8 & 255;
    buffer40[index++] = highBits >> 16 & 255;
    buffer40[index++] = highBits >> 24 & 255;
    return index;
}
function serializeInt32(buffer41, key, value, index, isArray) {
    value = value.valueOf();
    buffer41[index++] = BSONData.INT;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer41, key, index, Encoding.Utf8) : writeToBytes(buffer41, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer41[index++] = 0;
    buffer41[index++] = value & 255;
    buffer41[index++] = value >> 8 & 255;
    buffer41[index++] = value >> 16 & 255;
    buffer41[index++] = value >> 24 & 255;
    return index;
}
function serializeDouble(buffer42, key, value, index, isArray) {
    buffer42[index++] = BSONData.NUMBER;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer42, key, index, Encoding.Utf8) : writeToBytes(buffer42, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer42[index++] = 0;
    writeIEEE754(buffer42, value.value, index, "little", 52, 8);
    index += 8;
    return index;
}
function serializeFunction(buffer43, key, value, index, _checkKeys = false, _depth = 0, isArray) {
    buffer43[index++] = BSONData.CODE;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer43, key, index, Encoding.Utf8) : writeToBytes(buffer43, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer43[index++] = 0;
    const functionString = normalizedFunctionString(value);
    const size = writeToBytes(buffer43, functionString, index + 4, Encoding.Utf8) + 1;
    buffer43[index] = size & 255;
    buffer43[index + 1] = size >> 8 & 255;
    buffer43[index + 2] = size >> 16 & 255;
    buffer43[index + 3] = size >> 24 & 255;
    index = index + 4 + size - 1;
    buffer43[index++] = 0;
    return index;
}
function serializeCode(buffer44, key, value, index, checkKeys = false, depth = 0, serializeFunctions = false, ignoreUndefined = true, isArray = false) {
    if (value.scope && typeof value.scope === "object") {
        buffer44[index++] = BSONData.CODE_W_SCOPE;
        const numberOfWrittenBytes = !isArray ? writeToBytes(buffer44, key, index, Encoding.Utf8) : writeToBytes(buffer44, key, index, Encoding.Ascii);
        index += numberOfWrittenBytes;
        buffer44[index++] = 0;
        let startIndex = index;
        const functionString = typeof value.code === "string" ? value.code : value.code.toString();
        index += 4;
        const codeSize = writeToBytes(buffer44, functionString, index + 4, Encoding.Utf8) + 1;
        buffer44[index] = codeSize & 255;
        buffer44[index + 1] = codeSize >> 8 & 255;
        buffer44[index + 2] = codeSize >> 16 & 255;
        buffer44[index + 3] = codeSize >> 24 & 255;
        buffer44[index + 4 + codeSize - 1] = 0;
        index = index + codeSize + 4;
        const endIndex = serializeInto(buffer44, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined);
        index = endIndex - 1;
        const totalSize = endIndex - startIndex;
        buffer44[startIndex++] = totalSize & 255;
        buffer44[startIndex++] = totalSize >> 8 & 255;
        buffer44[startIndex++] = totalSize >> 16 & 255;
        buffer44[startIndex++] = totalSize >> 24 & 255;
    } else {
        buffer44[index++] = BSONData.CODE;
        const numberOfWrittenBytes = !isArray ? writeToBytes(buffer44, key, index, Encoding.Utf8) : writeToBytes(buffer44, key, index, Encoding.Ascii);
        index += numberOfWrittenBytes;
        buffer44[index++] = 0;
        const functionString = value.code.toString();
        const size = writeToBytes(buffer44, functionString, index + 4, Encoding.Utf8) + 1;
        buffer44[index] = size & 255;
        buffer44[index + 1] = size >> 8 & 255;
        buffer44[index + 2] = size >> 16 & 255;
        buffer44[index + 3] = size >> 24 & 255;
        index = index + 4 + size - 1;
    }
    buffer44[index++] = 0;
    return index;
}
function serializeBinary(buffer45, key, value, index, isArray) {
    buffer45[index++] = BSONData.BINARY;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer45, key, index, Encoding.Utf8) : writeToBytes(buffer45, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer45[index++] = 0;
    const data26 = value.buffer;
    let size = value.buffer.length;
    if (value.subType === BinarySizes.SUBTYPE_BYTE_ARRAY) size += 4;
    buffer45[index++] = size & 255;
    buffer45[index++] = size >> 8 & 255;
    buffer45[index++] = size >> 16 & 255;
    buffer45[index++] = size >> 24 & 255;
    buffer45[index++] = value.subType;
    if (value.subType === BinarySizes.SUBTYPE_BYTE_ARRAY) {
        size -= 4;
        buffer45[index++] = size & 255;
        buffer45[index++] = size >> 8 & 255;
        buffer45[index++] = size >> 16 & 255;
        buffer45[index++] = size >> 24 & 255;
    }
    buffer45.set(data26, index);
    index += size;
    return index;
}
function serializeSymbol(buffer46, key, value, index, isArray) {
    buffer46[index++] = BSONData.SYMBOL;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer46, key, index, Encoding.Utf8) : writeToBytes(buffer46, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer46[index++] = 0;
    const size = writeToBytes(buffer46, value.value, index + 4, Encoding.Utf8) + 1;
    buffer46[index] = size & 255;
    buffer46[index + 1] = size >> 8 & 255;
    buffer46[index + 2] = size >> 16 & 255;
    buffer46[index + 3] = size >> 24 & 255;
    index = index + 4 + size - 1;
    buffer46[index++] = 0;
    return index;
}
function serializeDBRef(buffer47, key, value, index, depth, serializeFunctions, isArray) {
    buffer47[index++] = BSONData.OBJECT;
    const numberOfWrittenBytes = !isArray ? writeToBytes(buffer47, key, index, Encoding.Utf8) : writeToBytes(buffer47, key, index, Encoding.Ascii);
    index += numberOfWrittenBytes;
    buffer47[index++] = 0;
    let startIndex = index;
    let output = {
        $ref: value.collection,
        $id: value.oid
    };
    if (value.db != null) {
        output.$db = value.db;
    }
    output = Object.assign(output, value.fields);
    const endIndex = serializeInto(buffer47, output, false, index, depth + 1, serializeFunctions);
    const size = endIndex - startIndex;
    buffer47[startIndex++] = size & 255;
    buffer47[startIndex++] = size >> 8 & 255;
    buffer47[startIndex++] = size >> 16 & 255;
    buffer47[startIndex++] = size >> 24 & 255;
    return endIndex;
}
function serializeInto(buffer48, object, checkKeys = false, startingIndex = 0, depth = 0, serializeFunctions = false, ignoreUndefined = true, path = []) {
    startingIndex = startingIndex || 0;
    path = path || [];
    path.push(object);
    let index = startingIndex + 4;
    if (Array.isArray(object)) {
        for(let i83 = 0; i83 < object.length; i83++){
            const key = i83.toString();
            let value = object[i83];
            if (value?.toBSON) {
                if (typeof value.toBSON !== "function") {
                    throw new BSONTypeError("toBSON is not a function");
                }
                value = value.toBSON();
            }
            if (typeof value === "string") {
                index = serializeString(buffer48, key, value, index, true);
            } else if (typeof value === "number") {
                index = serializeNumber(buffer48, key, value, index, true);
            } else if (typeof value === "bigint") {
                throw new BSONTypeError("Unsupported type BigInt, please use Decimal128");
            } else if (typeof value === "boolean") {
                index = serializeBoolean(buffer48, key, value, index, true);
            } else if (value instanceof Date) {
                index = serializeDate(buffer48, key, value, index, true);
            } else if (value === undefined) {
                index = serializeNull(buffer48, key, value, index, true);
            } else if (value === null) {
                index = serializeNull(buffer48, key, value, index, true);
            } else if (value instanceof ObjectId) {
                index = serializeObjectId(buffer48, key, value, index, true);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer(buffer48, key, value, index, true);
            } else if (value instanceof RegExp) {
                index = serializeRegExp(buffer48, key, value, index, true);
            } else if (value instanceof Decimal128) {
                index = serializeDecimal128(buffer48, key, value, index, true);
            } else if (value instanceof Long || value instanceof Timestamp) {
                index = serializeLong(buffer48, key, value, index, true);
            } else if (value instanceof Double) {
                index = serializeDouble(buffer48, key, value, index, true);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction(buffer48, key, value, index, checkKeys, depth, true);
            } else if (value instanceof Code) {
                index = serializeCode(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true);
            } else if (value instanceof Binary) {
                index = serializeBinary(buffer48, key, value, index, true);
            } else if (value instanceof BSONSymbol) {
                index = serializeSymbol(buffer48, key, value, index, true);
            } else if (value instanceof DBRef) {
                index = serializeDBRef(buffer48, key, value, index, depth, serializeFunctions, true);
            } else if (value instanceof BSONRegExp) {
                index = serializeBSONRegExp(buffer48, key, value, index, true);
            } else if (value instanceof Int32) {
                index = serializeInt32(buffer48, key, value, index, true);
            } else if (value instanceof MinKey || value instanceof MaxKey) {
                index = serializeMinMax(buffer48, key, value, index, true);
            } else if (value instanceof Object) {
                index = serializeObject(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true, path);
            } else {
                throw new BSONTypeError(`Unrecognized or invalid BSON Type: ${value}`);
            }
        }
    } else if (object instanceof Map) {
        const iterator = object.entries();
        let done = false;
        while(!done){
            const entry = iterator.next();
            done = !!entry.done;
            if (done) continue;
            const key = entry.value[0];
            const value = entry.value[1];
            const type = typeof value;
            if (typeof key === "string" && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    throw Error(`key ${key} must not contain null bytes`);
                }
                if (checkKeys) {
                    if (key.startsWith("$")) {
                        throw Error(`key ${key} must not start with '$'`);
                    } else if (~key.indexOf(".")) {
                        throw Error(`key ${key} must not contain '.'`);
                    }
                }
            }
            if (type === "string") {
                index = serializeString(buffer48, key, value, index);
            } else if (type === "number") {
                index = serializeNumber(buffer48, key, value, index);
            } else if (type === "bigint" || value instanceof BigInt64Array || value instanceof BigUint64Array) {
                throw new BSONTypeError("Unsupported type BigInt, please use Decimal128");
            } else if (type === "boolean") {
                index = serializeBoolean(buffer48, key, value, index);
            } else if (value instanceof Date) {
                index = serializeDate(buffer48, key, value, index);
            } else if (value === null || value === undefined && ignoreUndefined === false) {
                index = serializeNull(buffer48, key, value, index);
            } else if (value instanceof ObjectId) {
                index = serializeObjectId(buffer48, key, value, index);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer(buffer48, key, value, index);
            } else if (value instanceof RegExp) {
                index = serializeRegExp(buffer48, key, value, index);
            } else if (type === "object" && value instanceof Object) {
                index = serializeObject(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            } else if (type === "object" && value instanceof Decimal128) {
                index = serializeDecimal128(buffer48, key, value, index);
            } else if (value instanceof Long) {
                index = serializeLong(buffer48, key, value, index);
            } else if (value instanceof Double) {
                index = serializeDouble(buffer48, key, value, index);
            } else if (value instanceof Code) {
                index = serializeCode(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction(buffer48, key, value, index, checkKeys, depth, serializeFunctions);
            } else if (value instanceof Binary) {
                index = serializeBinary(buffer48, key, value, index);
            } else if (value instanceof BSONSymbol) {
                index = serializeSymbol(buffer48, key, value, index);
            } else if (value instanceof DBRef) {
                index = serializeDBRef(buffer48, key, value, index, depth, serializeFunctions);
            } else if (value instanceof BSONRegExp) {
                index = serializeBSONRegExp(buffer48, key, value, index);
            } else if (value instanceof Int32) {
                index = serializeInt32(buffer48, key, value, index);
            } else if (value instanceof MinKey || value instanceof MaxKey) {
                index = serializeMinMax(buffer48, key, value, index);
            } else {
                throw new BSONTypeError(`Unrecognized or invalid BSON TYPE: ${value}`);
            }
        }
    } else {
        if (object.toBSON) {
            if (typeof object.toBSON !== "function") {
                throw new BSONTypeError("toBSON is not a function");
            }
            object = object.toBSON();
            if (object != null && typeof object !== "object") {
                throw new BSONTypeError("toBSON function did not return an object");
            }
        }
        for(const key in object){
            let value = object[key];
            if (value?.toBSON) {
                if (typeof value.toBSON !== "function") {
                    throw new BSONTypeError("toBSON is not a function");
                }
                value = value.toBSON();
            }
            const type = typeof value;
            if (typeof key === "string" && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    throw Error(`key ${key} must not contain null bytes`);
                }
                if (checkKeys) {
                    if (key.startsWith("$")) {
                        throw Error(`key ${key} must not start with '$'`);
                    } else if (~key.indexOf(".")) {
                        throw Error(`key ${key} must not contain '.'`);
                    }
                }
            }
            if (type === "string") {
                index = serializeString(buffer48, key, value, index);
            } else if (type === "number") {
                index = serializeNumber(buffer48, key, value, index);
            } else if (type === "bigint") {
                throw new BSONTypeError("Unsupported type BigInt, please use Decimal128");
            } else if (type === "boolean") {
                index = serializeBoolean(buffer48, key, value, index);
            } else if (value instanceof Date) {
                index = serializeDate(buffer48, key, value, index);
            } else if (value === undefined) {
                if (ignoreUndefined === false) {
                    index = serializeNull(buffer48, key, value, index);
                }
            } else if (value === null) {
                index = serializeNull(buffer48, key, value, index);
            } else if (value instanceof ObjectId) {
                index = serializeObjectId(buffer48, key, value, index);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer(buffer48, key, value, index);
            } else if (value instanceof RegExp) {
                index = serializeRegExp(buffer48, key, value, index);
            } else if (type === "object" && value instanceof Decimal128) {
                index = serializeDecimal128(buffer48, key, value, index);
            } else if (value instanceof Long || value instanceof Timestamp) {
                index = serializeLong(buffer48, key, value, index);
            } else if (value instanceof Double) {
                index = serializeDouble(buffer48, key, value, index);
            } else if (value instanceof Code) {
                index = serializeCode(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction(buffer48, key, value, index, checkKeys, depth, serializeFunctions);
            } else if (value instanceof Binary) {
                index = serializeBinary(buffer48, key, value, index);
            } else if (value instanceof BSONSymbol) {
                index = serializeSymbol(buffer48, key, value, index);
            } else if (value instanceof DBRef) {
                index = serializeDBRef(buffer48, key, value, index, depth, serializeFunctions);
            } else if (value instanceof BSONRegExp) {
                index = serializeBSONRegExp(buffer48, key, value, index);
            } else if (value instanceof Int32) {
                index = serializeInt32(buffer48, key, value, index);
            } else if (value instanceof MinKey || value instanceof MaxKey) {
                index = serializeMinMax(buffer48, key, value, index);
            } else if (value instanceof Object) {
                index = serializeObject(buffer48, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            } else {
                throw new BSONTypeError(`Unrecognized or invalid BSON Type: ${value}`);
            }
        }
    }
    path.pop();
    buffer48[index++] = 0;
    const size = index - startingIndex;
    buffer48[startingIndex++] = size & 255;
    buffer48[startingIndex++] = size >> 8 & 255;
    buffer48[startingIndex++] = size >> 16 & 255;
    buffer48[startingIndex++] = size >> 24 & 255;
    return index;
}
function serialize(object, options = {}) {
    const checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    const serializationIndex = serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, []);
    const finishedBuffer = new Uint8Array(serializationIndex);
    bytesCopy(finishedBuffer, 0, buffer, 0, finishedBuffer.length);
    return finishedBuffer;
}
function serializeWithBufferAndIndex(object, finalBuffer, options = {}) {
    const checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    const startIndex = typeof options.index === "number" ? options.index : 0;
    const serializationIndex = serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined);
    bytesCopy(finalBuffer, startIndex, buffer, 0, serializationIndex);
    return startIndex + serializationIndex - 1;
}
function deserialize1(buffer1, options = {}) {
    return deserialize(buffer1 instanceof Uint8Array ? buffer1 : new Uint8Array(buffer1), options);
}
function calculateObjectSize(object, serializeFunctions, ignoreUndefined) {
    let totalLength = 4 + 1;
    if (Array.isArray(object)) {
        for(let i84 = 0; i84 < object.length; i84++){
            totalLength += calculateElement(i84.toString(), object[i84], serializeFunctions, true, ignoreUndefined);
        }
    } else {
        if (object.toBSON) {
            object = object.toBSON();
        }
        for(const key in object){
            totalLength += calculateElement(key, object[key], serializeFunctions, false, ignoreUndefined);
        }
    }
    return totalLength;
}
function calculateObjectSize1(object, options = {}) {
    options = options || {};
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    return calculateObjectSize(object, serializeFunctions, ignoreUndefined);
}
function deserializeStream(data27, startIndex, numberOfDocuments, documents, docStartIndex, options) {
    const internalOptions = Object.assign({
        allowObjectSmallerThanBufferSize: true,
        index: 0
    }, options);
    const bufferData = data27 instanceof Uint8Array ? data27 : data27 instanceof ArrayBuffer ? new Uint8Array(data27) : new Uint8Array(data27.buffer, data27.byteOffset, data27.byteLength);
    let index = startIndex;
    for(let i85 = 0; i85 < numberOfDocuments; i85++){
        const size = bufferData[index] | bufferData[index + 1] << 8 | bufferData[index + 2] << 16 | bufferData[index + 3] << 24;
        internalOptions.index = index;
        documents[docStartIndex + i85] = deserialize(bufferData, internalOptions);
        index += size;
    }
    return index;
}
function calculateElement(name, value, serializeFunctions = false, isArray = false, ignoreUndefined = false) {
    if (value?.toBSON) {
        value = value.toBSON();
    }
    switch(typeof value){
        case "string":
            return 1 + utf8Encoder1.encode(name).length + 1 + 4 + utf8Encoder1.encode(value).length + 1;
        case "number":
            if (Math.floor(value) === value && value >= JS_INT_MIN && value <= JS_INT_MAX) {
                return value >= BSON_INT32_MIN && value <= 2147483647 ? (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (4 + 1) : (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (8 + 1);
            } else {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (8 + 1);
            }
        case "undefined":
            if (isArray || !ignoreUndefined) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1;
            }
            return 0;
        case "boolean":
            return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (1 + 1);
        case "object":
            if (value == null || value instanceof MinKey || value instanceof MaxKey) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1;
            } else if (value instanceof ObjectId) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (12 + 1);
            } else if (value instanceof Date) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (8 + 1);
            } else if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (1 + 4 + 1) + value.byteLength;
            } else if (value instanceof Long || value instanceof Double || value instanceof Timestamp) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (8 + 1);
            } else if (value instanceof Decimal128) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (16 + 1);
            } else if (value instanceof Code) {
                if (value.scope != null && Object.keys(value.scope).length > 0) {
                    return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + 4 + 4 + utf8Encoder1.encode(value.code.toString()).length + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
                }
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + 4 + utf8Encoder1.encode(value.code.toString()).length + 1;
            } else if (value instanceof Binary) {
                return value.subType === BinarySizes.SUBTYPE_BYTE_ARRAY ? (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (value.buffer.length + 1 + 4 + 1 + 4) : (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + (value.buffer.length + 1 + 4 + 1);
            } else if (value instanceof BSONSymbol) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + utf8Encoder1.encode(value.value).length + 4 + 1 + 1;
            } else if (value instanceof DBRef) {
                const orderedValues = Object.assign({
                    $ref: value.collection,
                    $id: value.oid
                }, value.fields);
                if (value.db != null) {
                    orderedValues.$db = value.db;
                }
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + calculateObjectSize(orderedValues, serializeFunctions, ignoreUndefined);
            } else if (value instanceof RegExp) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + utf8Encoder1.encode(value.source).length + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
            } else if (value instanceof BSONRegExp) {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + utf8Encoder1.encode(value.pattern).length + 1 + utf8Encoder1.encode(value.options).length + 1;
            } else {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + calculateObjectSize(value, serializeFunctions, ignoreUndefined) + 1;
            }
        case "function":
            if (value instanceof RegExp || String.call(value) === "[object RegExp]") {
                return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + utf8Encoder1.encode(value.source).length + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
            } else {
                if (serializeFunctions && value.scope != null && Object.keys(value.scope).length > 0) {
                    return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + 4 + 4 + utf8Encoder1.encode(normalizedFunctionString(value)).length + 1 + calculateObjectSize(value.scope, serializeFunctions, ignoreUndefined);
                }
                if (serializeFunctions) {
                    return (name != null ? utf8Encoder1.encode(name).length + 1 : 0) + 1 + 4 + utf8Encoder1.encode(normalizedFunctionString(value)).length + 1;
                }
            }
    }
    return 0;
}
(function() {
    return {
        LongWithoutOverridesClass: Long,
        Binary,
        BinarySizes,
        BSONRegExp,
        BSONSymbol,
        Code,
        DBRef,
        Decimal128,
        Double,
        Int32,
        Long,
        MaxKey,
        MinKey,
        ObjectId,
        Timestamp,
        UUID,
        setInternalBufferSize,
        serialize,
        serializeWithBufferAndIndex,
        deserialize: deserialize1,
        calculateObjectSize: calculateObjectSize1,
        deserializeStream,
        BSON_INT32_MAX: 2147483647,
        BSON_INT32_MIN,
        JS_INT_MAX,
        JS_INT_MIN,
        BSONData,
        BSON_BINARY_SUBTYPE_DEFAULT: 0,
        BSONError,
        BSONTypeError
    };
})();
const data = decode3("");
const heap = new Array(32).fill(undefined);
heap.push(undefined, null, true, false);
function getObject(idx) {
    return heap[idx];
}
let heap_next = heap.length;
function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}
function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
}
let cachedTextDecoder = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true
});
cachedTextDecoder.decode();
let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm2.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm2.memory.buffer);
    }
    return cachegetUint8Memory0;
}
function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
let WASM_VECTOR_LEN = 0;
let cachedTextEncoder = new TextEncoder("utf-8");
const encodeString = function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
};
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }
    let len = arg.length;
    let ptr = malloc(len);
    const mem3 = getUint8Memory0();
    let offset112 = 0;
    for(; offset112 < len; offset112++){
        const code20 = arg.charCodeAt(offset112);
        if (code20 > 127) break;
        mem3[ptr + offset112] = code20;
    }
    if (offset112 !== len) {
        if (offset112 !== 0) {
            arg = arg.slice(offset112);
        }
        ptr = realloc(ptr, len, len = offset112 + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset112, ptr + len);
        const ret = encodeString(arg, view);
        offset112 += ret.written;
    }
    WASM_VECTOR_LEN = offset112;
    return ptr;
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm2.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm2.memory.buffer);
    }
    return cachegetInt32Memory0;
}
function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function digest(algorithm, data28, length) {
    try {
        const retptr = wasm2.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm0(algorithm, wasm2.__wbindgen_malloc, wasm2.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm2.digest(retptr, ptr0, len0, addHeapObject(data28), !isLikeNone(length), isLikeNone(length) ? 0 : length);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm2.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally{
        wasm2.__wbindgen_add_to_stack_pointer(16);
    }
}
const DigestContextFinalization = new FinalizationRegistry((ptr)=>wasm2.__wbg_digestcontext_free(ptr)
);
class DigestContext {
    static __wrap(ptr) {
        const obj = Object.create(DigestContext.prototype);
        obj.ptr = ptr;
        DigestContextFinalization.register(obj, obj.ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;
        DigestContextFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm2.__wbg_digestcontext_free(ptr);
    }
    constructor(algorithm){
        var ptr0 = passStringToWasm0(algorithm, wasm2.__wbindgen_malloc, wasm2.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm2.digestcontext_new(ptr0, len0);
        return DigestContext.__wrap(ret);
    }
    update(data29) {
        wasm2.digestcontext_update(this.ptr, addHeapObject(data29));
    }
    digest(length) {
        try {
            const retptr = wasm2.__wbindgen_add_to_stack_pointer(-16);
            wasm2.digestcontext_digest(retptr, this.ptr, !isLikeNone(length), isLikeNone(length) ? 0 : length);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm2.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm2.__wbindgen_add_to_stack_pointer(16);
        }
    }
    digestAndReset(length) {
        try {
            const retptr = wasm2.__wbindgen_add_to_stack_pointer(-16);
            wasm2.digestcontext_digestAndReset(retptr, this.ptr, !isLikeNone(length), isLikeNone(length) ? 0 : length);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm2.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm2.__wbindgen_add_to_stack_pointer(16);
        }
    }
    digestAndDrop(length) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm2.__wbindgen_add_to_stack_pointer(-16);
            wasm2.digestcontext_digestAndDrop(retptr, ptr, !isLikeNone(length), isLikeNone(length) ? 0 : length);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm2.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm2.__wbindgen_add_to_stack_pointer(16);
        }
    }
    reset() {
        wasm2.digestcontext_reset(this.ptr);
    }
    clone() {
        var ret = wasm2.digestcontext_clone(this.ptr);
        return DigestContext.__wrap(ret);
    }
}
const imports = {
    __wbindgen_placeholder__: {
        __wbg_new_f85dbdfb9cdbe2ec: function(arg0, arg1) {
            var ret = new TypeError(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
        __wbg_byteLength_e0515bc94cfc5dee: function(arg0) {
            var ret = getObject(arg0).byteLength;
            return ret;
        },
        __wbg_byteOffset_77eec84716a2e737: function(arg0) {
            var ret = getObject(arg0).byteOffset;
            return ret;
        },
        __wbg_buffer_1c5918a4ab656ff7: function(arg0) {
            var ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        },
        __wbg_newwithbyteoffsetandlength_e57ad1f2ce812c03: function(arg0, arg1, arg2) {
            var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_length_2d56cb37075fcfb1: function(arg0) {
            var ret = getObject(arg0).length;
            return ret;
        },
        __wbindgen_memory: function() {
            var ret = wasm2.memory;
            return addHeapObject(ret);
        },
        __wbg_buffer_9e184d6f785de5ed: function(arg0) {
            var ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        },
        __wbg_new_e8101319e4cf95fc: function(arg0) {
            var ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_set_e8ae7b27314e8b98: function(arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        },
        __wbindgen_throw: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_rethrow: function(arg0) {
            throw takeObject(arg0);
        }
    }
};
const wasmModule = new WebAssembly.Module(data);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
const wasm2 = wasmInstance.exports;
const _wasm = wasm2;
const _wasmModule = wasmModule;
const _wasmInstance = wasmInstance;
const mod3 = {
    digest: digest,
    DigestContext: DigestContext,
    _wasm: _wasm,
    _wasmModule: _wasmModule,
    _wasmInstance: _wasmInstance,
    _wasmBytes: data
};
const digestAlgorithms = [
    "BLAKE2B-256",
    "BLAKE2B-384",
    "BLAKE2B",
    "BLAKE2S",
    "BLAKE3",
    "KECCAK-224",
    "KECCAK-256",
    "KECCAK-384",
    "KECCAK-512",
    "SHA-384",
    "SHA3-224",
    "SHA3-256",
    "SHA3-384",
    "SHA3-512",
    "SHAKE128",
    "SHAKE256",
    "RIPEMD-160",
    "SHA-224",
    "SHA-256",
    "SHA-512",
    "MD5",
    "SHA-1", 
];
const webCrypto = ((crypto)=>({
        getRandomValues: crypto.getRandomValues?.bind(crypto),
        randomUUID: crypto.randomUUID?.bind(crypto),
        subtle: {
            decrypt: crypto.subtle?.decrypt?.bind(crypto.subtle),
            deriveBits: crypto.subtle?.deriveBits?.bind(crypto.subtle),
            deriveKey: crypto.subtle?.deriveKey?.bind(crypto.subtle),
            digest: crypto.subtle?.digest?.bind(crypto.subtle),
            encrypt: crypto.subtle?.encrypt?.bind(crypto.subtle),
            exportKey: crypto.subtle?.exportKey?.bind(crypto.subtle),
            generateKey: crypto.subtle?.generateKey?.bind(crypto.subtle),
            importKey: crypto.subtle?.importKey?.bind(crypto.subtle),
            sign: crypto.subtle?.sign?.bind(crypto.subtle),
            unwrapKey: crypto.subtle?.unwrapKey?.bind(crypto.subtle),
            verify: crypto.subtle?.verify?.bind(crypto.subtle),
            wrapKey: crypto.subtle?.wrapKey?.bind(crypto.subtle)
        }
    })
)(globalThis.crypto);
const bufferSourceBytes = (data30)=>{
    let bytes;
    if (data30 instanceof Uint8Array) {
        bytes = data30;
    } else if (ArrayBuffer.isView(data30)) {
        bytes = new Uint8Array(data30.buffer, data30.byteOffset, data30.byteLength);
    } else if (data30 instanceof ArrayBuffer) {
        bytes = new Uint8Array(data30);
    }
    return bytes;
};
const stdCrypto = ((x)=>x
)({
    ...webCrypto,
    subtle: {
        ...webCrypto.subtle,
        async digest (algorithm, data31) {
            const { name , length  } = normalizeAlgorithm(algorithm);
            const bytes = bufferSourceBytes(data31);
            if (webCrypto.subtle?.digest && webCryptoDigestAlgorithms.includes(name) && bytes) {
                return webCrypto.subtle.digest(algorithm, bytes);
            } else if (digestAlgorithms.includes(name)) {
                if (bytes) {
                    return stdCrypto.subtle.digestSync(algorithm, bytes);
                } else if (data31[Symbol.iterator]) {
                    return stdCrypto.subtle.digestSync(algorithm, data31);
                } else if (data31[Symbol.asyncIterator]) {
                    const context = new mod3.DigestContext(name);
                    for await (const chunk of data31){
                        const chunkBytes = bufferSourceBytes(chunk);
                        if (!chunkBytes) {
                            throw new TypeError("data contained chunk of the wrong type");
                        }
                        context.update(chunkBytes);
                    }
                    return context.digestAndDrop(length).buffer;
                } else {
                    throw new TypeError("data must be a BufferSource or [Async]Iterable<BufferSource>");
                }
            } else if (webCrypto.subtle?.digest) {
                return webCrypto.subtle.digest(algorithm, data31);
            } else {
                throw new TypeError(`unsupported digest algorithm: ${algorithm}`);
            }
        },
        digestSync (algorithm, data32) {
            algorithm = normalizeAlgorithm(algorithm);
            const bytes = bufferSourceBytes(data32);
            if (bytes) {
                return mod3.digest(algorithm.name, bytes, algorithm.length).buffer;
            } else if (data32[Symbol.iterator]) {
                const context = new mod3.DigestContext(algorithm.name);
                for (const chunk of data32){
                    const chunkBytes = bufferSourceBytes(chunk);
                    if (!chunkBytes) {
                        throw new TypeError("data contained chunk of the wrong type");
                    }
                    context.update(chunkBytes);
                }
                return context.digestAndDrop(algorithm.length).buffer;
            } else {
                throw new TypeError("data must be a BufferSource or Iterable<BufferSource>");
            }
        }
    }
});
const webCryptoDigestAlgorithms = [
    "SHA-384",
    "SHA-256",
    "SHA-512",
    "SHA-1", 
];
const normalizeAlgorithm = (algorithm)=>typeof algorithm === "string" ? {
        name: algorithm.toUpperCase()
    } : {
        ...algorithm,
        name: algorithm.name.toUpperCase()
    }
;
class DenoStdInternalError1 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE1 = 16;
const CR1 = "\r".charCodeAt(0);
const LF1 = "\n".charCodeAt(0);
class BufferFullError1 extends Error {
    partial;
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError1 extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader1 {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader1 ? r : new BufReader1(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE1;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i86 = 100; i86 > 0; i86--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert1(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr = await this.#rd.read(p);
                const nread = rr ?? 0;
                assert1(nread >= 0, "negative read");
                return rr;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert1(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy1(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError1();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError1) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError1();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer49 = await this.readSlice(delim.charCodeAt(0));
        if (buffer49 === null) return null;
        return new TextDecoder().decode(buffer49);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF1);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let partial;
            if (err instanceof PartialReadError1) {
                partial = err.partial;
                assert1(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError1)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR1) {
                assert1(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF1) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR1) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i87 = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i87 >= 0) {
                i87 += s;
                slice = this.#buf.subarray(this.#r, this.#r + i87 + 1);
                this.#r += i87 + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError1(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError1) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError1();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n6) {
        if (n6 < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n6 && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError1) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError1();
                    e.partial = this.#buf.subarray(this.#r, this.#w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n6 && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n6) {
            throw new BufferFullError1(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n6);
    }
}
class AbstractBufBase1 {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter1 extends AbstractBufBase1 {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter1 ? writer : new BufWriter1(writer, size);
    }
    constructor(writer, size = 4096){
        if (size <= 0) {
            size = DEFAULT_BUF_SIZE;
        }
        const buf = new Uint8Array(size);
        super(buf);
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data33) {
        if (this.err !== null) throw this.err;
        if (data33.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data33.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data33);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data33, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data33 = data33.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data33, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync1 extends AbstractBufBase1 {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync1 ? writer : new BufWriterSync1(writer, size);
    }
    constructor(writer, size = 4096){
        if (size <= 0) {
            size = DEFAULT_BUF_SIZE;
        }
        const buf = new Uint8Array(size);
        super(buf);
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data34) {
        if (this.err !== null) throw this.err;
        if (data34.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data34.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data34);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data34, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data34 = data34.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data34, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const { Deno: Deno2  } = globalThis;
typeof Deno2?.noColor === "boolean" ? Deno2.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType1;
(function(DiffType5) {
    DiffType5["removed"] = "removed";
    DiffType5["common"] = "common";
    DiffType5["added"] = "added";
})(DiffType1 || (DiffType1 = {}));
BigInt(Number.MAX_SAFE_INTEGER);
new TextDecoder();
({
    driver: {
        name: "Deno Mongo",
        version: "v0.0.1"
    },
    os: {
        type: Deno.build.os,
        name: Deno.build.os,
        architecture: Deno.build.arch
    }
});
var OpCode;
(function(OpCode2) {
    OpCode2[OpCode2["REPLAY"] = 1] = "REPLAY";
    OpCode2[OpCode2["UPDATE"] = 2001] = "UPDATE";
    OpCode2[OpCode2["INSERT"] = 2002] = "INSERT";
    OpCode2[OpCode2["RESERVED"] = 2003] = "RESERVED";
    OpCode2[OpCode2["QUERY"] = 2004] = "QUERY";
    OpCode2[OpCode2["GET_MORE"] = 2005] = "GET_MORE";
    OpCode2[OpCode2["DELETE"] = 2006] = "DELETE";
    OpCode2[OpCode2["KILL_CURSORS"] = 2007] = "KILL_CURSORS";
    OpCode2[OpCode2["MSG"] = 2013] = "MSG";
})(OpCode || (OpCode = {}));
new TextEncoder();
new TextDecoder();
var AllowedOption;
(function(AllowedOption2) {
    AllowedOption2["authSource"] = "authSource";
    AllowedOption2["replicaSet"] = "replicaSet";
    AllowedOption2["loadBalanced"] = "loadBalanced";
})(AllowedOption || (AllowedOption = {}));
function grow(pager, index) {
    while(pager.maxPages < index){
        const old = pager.pages;
        pager.pages = new Array(32768);
        pager.pages[0] = old;
        pager.level++;
        pager.maxPages *= 32768;
    }
}
function truncate(buf, len) {
    if (buf.length === len) {
        return buf;
    }
    if (buf.length > len) {
        return buf.slice(0, len);
    }
    const cpy = new Uint8Array(len);
    cpy.set(buf, 0);
    return cpy;
}
function concat(bufs) {
    const total = bufs.reduce((acc, cur)=>acc + cur.byteLength
    , 0);
    const buf = new Uint8Array(total);
    let offset113 = 0;
    for (const b of bufs){
        buf.set(b, offset113);
        offset113 += b.byteLength;
    }
    return buf;
}
function equal(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((x, i88)=>x === b[i88]
    );
}
function factor(n, out) {
    n = (n - (out[0] = n & 32767)) / 32768;
    n = (n - (out[1] = n & 32767)) / 32768;
    out[3] = (n - (out[2] = n & 32767)) / 32768 & 32767;
}
function copy2(buf) {
    const cpy = new Uint8Array(buf.length);
    cpy.set(buf, 0);
    return cpy;
}
class Page {
    offset;
    buffer;
    updated;
    deduplicate;
    constructor(i89, buf){
        this.offset = i89 * buf.length;
        this.buffer = buf;
        this.updated = false;
        this.deduplicate = 0;
    }
}
class Pager {
    pageSize;
    maxPages = 32768;
    pages = new Array(32768);
    length = 0;
    level = 0;
    updates = [];
    path = new Uint16Array(4);
    deduplicate;
    zeros;
    constructor(pageSize, opts = {}){
        this.pageSize = pageSize;
        this.deduplicate = opts.deduplicate || null;
        this.zeros = this.deduplicate ? new Uint8Array(this.deduplicate.length) : null;
    }
    updated(page) {
        while(this.deduplicate && page.buffer[page.deduplicate] === this.deduplicate[page.deduplicate]){
            if (++page.deduplicate === this.deduplicate.length) {
                page.deduplicate = 0;
                if (equal(page.buffer, this.deduplicate)) {
                    page.buffer = this.deduplicate;
                }
                break;
            }
        }
        if (page.updated || !this.updates) {
            return;
        }
        page.updated = true;
        this.updates.push(page);
    }
    lastUpdate() {
        if (!this.updates || !this.updates.length) {
            return null;
        }
        const page = this.updates.pop();
        page.updated = false;
        return page;
    }
    get(i90, noAllocate) {
        const arr = this._array(i90, !!noAllocate);
        const first29 = this.path[0];
        let page = arr && arr[first29];
        if (!page && !noAllocate) {
            page = arr[first29] = new Page(i90, new Uint8Array(this.pageSize));
            if (i90 >= this.length) {
                this.length = i90 + 1;
            }
        }
        if (page && page.buffer === this.deduplicate && this.deduplicate && !noAllocate) {
            page.buffer = copy2(page.buffer);
            page.deduplicate = 0;
        }
        return page;
    }
    set(i91, buf) {
        const arr = this._array(i91, false);
        const first30 = this.path[0];
        if (i91 >= this.length) {
            this.length = i91 + 1;
        }
        if (!buf || this.zeros && equal(buf, this.zeros)) {
            arr[first30] = undefined;
            return;
        }
        if (this.deduplicate && equal(buf, this.deduplicate)) {
            buf = this.deduplicate;
        }
        const page = arr[first30];
        const b = truncate(buf, this.pageSize);
        if (page) {
            page.buffer = b;
        } else {
            arr[first30] = new Page(i91, b);
        }
    }
    toBuffer() {
        const list = new Array(this.length);
        const empty = new Uint8Array(this.pageSize);
        let ptr = 0;
        while(ptr < list.length){
            const arr = this._array(ptr, true);
            for(let i92 = 0; i92 < 32768 && ptr < list.length; i92++){
                list[ptr++] = arr && arr[i92] ? arr[i92].buffer : empty;
            }
        }
        return concat(list);
    }
    _array(i93, noAllocate) {
        if (i93 >= this.maxPages) {
            if (noAllocate) {
                return [];
            }
            grow(this, i93);
        }
        factor(i93, this.path);
        let arr = this.pages;
        for(let j = this.level; j > 0; j--){
            const p = this.path[j];
            let next = arr[p];
            if (!next) {
                if (noAllocate) {
                    return [];
                }
                next = arr[p] = new Array(32768);
            }
            arr = next;
        }
        return arr;
    }
}
function powerOfTwo(x) {
    return !(x & x - 1);
}
class Bitfield {
    pageOffset;
    pageSize;
    pages;
    byteLength;
    length;
    _trackUpdates;
    _pageMask;
    constructor(opts = {}){
        if (opts instanceof Uint8Array) {
            opts = {
                buffer: opts
            };
        }
        this.pageOffset = opts.pageOffset || 0;
        this.pageSize = opts.pageSize || 1024;
        this.pages = opts.pages || new Pager(this.pageSize);
        this.byteLength = this.pages.length * this.pageSize;
        this.length = 8 * this.byteLength;
        if (!powerOfTwo(this.pageSize)) {
            throw new Error("The page size should be a power of two");
        }
        this._trackUpdates = !!opts.trackUpdates;
        this._pageMask = this.pageSize - 1;
        if (opts.buffer) {
            for(let i94 = 0; i94 < opts.buffer.length; i94 += this.pageSize){
                this.pages.set(i94 / this.pageSize, opts.buffer.slice(i94, i94 + this.pageSize));
            }
            this.byteLength = opts.buffer.length;
            this.length = 8 * this.byteLength;
        }
    }
    getByte(i95) {
        const o = i95 & this._pageMask;
        const j = (i95 - o) / this.pageSize;
        const page = this.pages.get(j, true);
        return page ? page.buffer[o + this.pageOffset] : 0;
    }
    setByte(i96, b) {
        const o = (i96 & this._pageMask) + this.pageOffset;
        const j = (i96 - o) / this.pageSize;
        const page = this.pages.get(j, false);
        if (page.buffer[o] === b) {
            return false;
        }
        page.buffer[o] = b;
        if (i96 >= this.byteLength) {
            this.byteLength = i96 + 1;
            this.length = this.byteLength * 8;
        }
        if (this._trackUpdates) {
            this.pages.updated(page);
        }
        return true;
    }
    get(i97) {
        const o = i97 & 7;
        const j = (i97 - o) / 8;
        return !!(this.getByte(j) & 128 >> o);
    }
    set(i98, v) {
        const o = i98 & 7;
        const j = (i98 - o) / 8;
        const b = this.getByte(j);
        return this.setByte(j, v ? b | 128 >> o : b & (255 ^ 128 >> o));
    }
    toBuffer() {
        const all = new Uint8Array(this.pages.length * this.pageSize);
        for(let i99 = 0; i99 < this.pages.length; i99++){
            const next = this.pages.get(i99, true);
            if (next) {
                all.subarray(i99 * this.pageSize).set(next.buffer.subarray(this.pageOffset, this.pageOffset + this.pageSize));
            }
        }
        return all;
    }
}
function readUint32BE(buf, offset1) {
    return buf[offset1 + 0] << 24 | buf[offset1 + 1] << 16 | buf[offset1 + 2] << 8 | buf[offset1 + 3];
}
const mem1 = mod2.decode(`
`.trim());
let offset = 0;
function read() {
    const size = readUint32BE(mem1, offset);
    offset += 4;
    const codepoints = mem1.slice(offset, offset + size);
    offset += size;
    return new Bitfield({
        buffer: codepoints
    });
}
function loadCodePoints() {
    return {
        unassigned_code_points: read(),
        commonly_mapped_to_nothing: read(),
        non_ASCII_space_characters: read(),
        prohibited_characters: read(),
        bidirectional_r_al: read(),
        bidirectional_l: read()
    };
}
const { unassigned_code_points , commonly_mapped_to_nothing , non_ASCII_space_characters , prohibited_characters , bidirectional_r_al , bidirectional_l ,  } = loadCodePoints();
new TextEncoder();
new TextEncoder();
new TextDecoder();
var ReadPreference;
(function(ReadPreference2) {
    ReadPreference2["Primary"] = "primary";
    ReadPreference2["PrimaryPreferred"] = "primaryPreferred";
    ReadPreference2["Secondary"] = "secondary";
    ReadPreference2["SecondaryPreferred"] = "secondaryPreferred";
    ReadPreference2["Nearest"] = "nearest";
})(ReadPreference || (ReadPreference = {}));
class Code1 {
    code;
    scope;
    constructor(code21, scope){
        this.code = code21;
        this.scope = scope;
    }
    toJSON() {
        return {
            code: this.code,
            scope: this.scope
        };
    }
    [Symbol.for("Deno.customInspect")]() {
        const codeJson = this.toJSON();
        return `new Code("${codeJson.code}"${codeJson.scope ? `, ${JSON.stringify(codeJson.scope)}` : ""})`;
    }
}
const BSON_INT32_MIN1 = -2147483648;
const JS_INT_MAX1 = 2 ** 53;
const JS_INT_MIN1 = -(2 ** 53);
var BSONData1;
(function(BSONData3) {
    BSONData3[BSONData3["NUMBER"] = 1] = "NUMBER";
    BSONData3[BSONData3["STRING"] = 2] = "STRING";
    BSONData3[BSONData3["OBJECT"] = 3] = "OBJECT";
    BSONData3[BSONData3["ARRAY"] = 4] = "ARRAY";
    BSONData3[BSONData3["BINARY"] = 5] = "BINARY";
    BSONData3[BSONData3["UNDEFINED"] = 6] = "UNDEFINED";
    BSONData3[BSONData3["OID"] = 7] = "OID";
    BSONData3[BSONData3["BOOLEAN"] = 8] = "BOOLEAN";
    BSONData3[BSONData3["DATE"] = 9] = "DATE";
    BSONData3[BSONData3["NULL"] = 10] = "NULL";
    BSONData3[BSONData3["REGEXP"] = 11] = "REGEXP";
    BSONData3[BSONData3["DBPOINTER"] = 12] = "DBPOINTER";
    BSONData3[BSONData3["CODE"] = 13] = "CODE";
    BSONData3[BSONData3["SYMBOL"] = 14] = "SYMBOL";
    BSONData3[BSONData3["CODE_W_SCOPE"] = 15] = "CODE_W_SCOPE";
    BSONData3[BSONData3["INT"] = 16] = "INT";
    BSONData3[BSONData3["TIMESTAMP"] = 17] = "TIMESTAMP";
    BSONData3[BSONData3["LONG"] = 18] = "LONG";
    BSONData3[BSONData3["DECIMAL128"] = 19] = "DECIMAL128";
    BSONData3[BSONData3["MIN_KEY"] = 255] = "MIN_KEY";
    BSONData3[BSONData3["MAX_KEY"] = 127] = "MAX_KEY";
})(BSONData1 || (BSONData1 = {}));
const BSON_BINARY_SUBTYPE_DEFAULT1 = 0;
function normalizedFunctionString1(fn) {
    return fn.toString().replace("function(", "function (");
}
const randomBytes1 = (size)=>crypto.getRandomValues(new Uint8Array(size))
;
function isObjectLike1(candidate) {
    return typeof candidate === "object" && candidate !== null;
}
function bytesCopy1(target, targetStart, source, sourceStart, sourceEnd) {
    Uint8Array.prototype.set.call(target, source.subarray(sourceStart, sourceEnd), targetStart);
}
function utf8ToBytes2(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for(let i100 = 0; i100 < length; ++i100){
        codePoint = string.charCodeAt(i100);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                } else if (i100 + 1 === length) {
                    if ((units -= 3) > -1) {
                        bytes.push(239, 191, 189);
                    }
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) {
                    bytes.push(239, 191, 189);
                }
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) {
                bytes.push(239, 191, 189);
            }
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) {
                break;
            }
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) {
                break;
            }
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) {
                break;
            }
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) {
                break;
            }
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function asciiToBytes2(str) {
    const byteArray = new Uint8Array(str.length);
    for(let i101 = 0; i101 < str.length; ++i101){
        byteArray[i101] = str.charCodeAt(i101) & 255;
    }
    return byteArray;
}
var Encoding1;
(function(Encoding3) {
    Encoding3[Encoding3["Utf8"] = 0] = "Utf8";
    Encoding3[Encoding3["Ascii"] = 1] = "Ascii";
})(Encoding1 || (Encoding1 = {}));
function writeToBytes1(bytes, data35, offset114, encoding) {
    const bytesLength = bytes.length;
    const src = encoding ? asciiToBytes2(data35) : utf8ToBytes2(data35, bytesLength - offset114);
    let i102;
    for(i102 = 0; i102 < bytesLength; ++i102){
        if (i102 + offset114 >= bytesLength || i102 >= src.length) {
            break;
        }
        bytes[i102 + offset114] = src[i102];
    }
    return i102;
}
function utf8Slice1(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i103 = start;
    while(i103 < end){
        const firstByte = buf[i103];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i103 + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i103 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i103 + 1];
                    thirdByte = buf[i103 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i103 + 1];
                    thirdByte = buf[i103 + 2];
                    fourthByte = buf[i103 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i103 += bytesPerSequence;
    }
    return decodeCodePointsArray2(res);
}
const MAX_ARGUMENTS_LENGTH2 = 4096;
function decodeCodePointsArray2(codePoints) {
    const len = codePoints.length;
    if (len <= 4096) {
        return String.fromCharCode(...codePoints);
    }
    let res = "";
    let i104 = 0;
    while(i104 < len){
        res += String.fromCharCode(...codePoints.slice(i104, i104 += MAX_ARGUMENTS_LENGTH2));
    }
    return res;
}
function isDBRefLike1(value) {
    return isObjectLike1(value) && value.$id != null && typeof value.$ref === "string" && (value.$db == null || typeof value.$db === "string");
}
class DBRef1 {
    collection;
    oid;
    db;
    fields;
    constructor(collection, oid, db, fields){
        const parts = collection.split(".");
        if (parts.length === 2) {
            db = parts.shift();
            collection = parts.shift();
        }
        this.collection = collection;
        this.oid = oid;
        this.db = db;
        this.fields = fields || {};
    }
    toJSON() {
        const o = Object.assign({
            $ref: this.collection,
            $id: this.oid
        }, this.fields);
        if (this.db != null) o.$db = this.db;
        return o;
    }
    static fromExtendedJSON(doc) {
        const copy7 = Object.assign({}, doc);
        delete copy7.$ref;
        delete copy7.$id;
        delete copy7.$db;
        return new DBRef1(doc.$ref, doc.$id, doc.$db, copy7);
    }
    [Symbol.for("Deno.customInspect")]() {
        const oid = this.oid === undefined || this.oid.toString === undefined ? this.oid : this.oid.toString();
        return `new DBRef("${this.collection}", new ObjectId("${oid}")${this.db ? `, "${this.db}"` : ""})`;
    }
}
class BSONError1 extends Error {
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, BSONError1.prototype);
    }
    get name() {
        return "BSONError";
    }
}
class BSONTypeError1 extends TypeError {
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, BSONTypeError1.prototype);
    }
    get name() {
        return "BSONTypeError";
    }
}
const wasm3 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    13,
    2,
    96,
    0,
    1,
    127,
    96,
    4,
    127,
    127,
    127,
    127,
    1,
    127,
    3,
    7,
    6,
    0,
    1,
    1,
    1,
    1,
    1,
    6,
    6,
    1,
    127,
    1,
    65,
    0,
    11,
    7,
    50,
    6,
    3,
    109,
    117,
    108,
    0,
    1,
    5,
    100,
    105,
    118,
    95,
    115,
    0,
    2,
    5,
    100,
    105,
    118,
    95,
    117,
    0,
    3,
    5,
    114,
    101,
    109,
    95,
    115,
    0,
    4,
    5,
    114,
    101,
    109,
    95,
    117,
    0,
    5,
    8,
    103,
    101,
    116,
    95,
    104,
    105,
    103,
    104,
    0,
    0,
    10,
    191,
    1,
    6,
    4,
    0,
    35,
    0,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    126,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    127,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    128,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    129,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11,
    36,
    1,
    1,
    126,
    32,
    0,
    173,
    32,
    1,
    173,
    66,
    32,
    134,
    132,
    32,
    2,
    173,
    32,
    3,
    173,
    66,
    32,
    134,
    132,
    130,
    34,
    4,
    66,
    32,
    135,
    167,
    36,
    0,
    32,
    4,
    167,
    11
])), {}).exports;
const TWO_PWR_16_DBL1 = 1 << 16;
const TWO_PWR_24_DBL1 = 1 << 24;
const TWO_PWR_32_DBL1 = TWO_PWR_16_DBL1 * TWO_PWR_16_DBL1;
const TWO_PWR_64_DBL1 = TWO_PWR_32_DBL1 * TWO_PWR_32_DBL1;
const TWO_PWR_63_DBL1 = TWO_PWR_64_DBL1 / 2;
const INT_CACHE1 = {};
const UINT_CACHE1 = {};
class Long1 {
    high;
    low;
    unsigned;
    constructor(low = 0, high, unsigned){
        if (typeof low === "bigint") {
            Object.assign(this, Long1.fromBigInt(low, !!high));
        } else if (typeof low === "string") {
            Object.assign(this, Long1.fromString(low, !!high));
        } else {
            this.low = low | 0;
            this.high = high | 0;
            this.unsigned = !!unsigned;
        }
    }
    static TWO_PWR_24 = Long1.fromInt(TWO_PWR_24_DBL1);
    static MAX_UNSIGNED_VALUE = Long1.fromBits(4294967295 | 0, 4294967295 | 0, true);
    static ZERO = Long1.fromInt(0);
    static UZERO = Long1.fromInt(0, true);
    static ONE = Long1.fromInt(1);
    static UONE = Long1.fromInt(1, true);
    static NEG_ONE = Long1.fromInt(-1);
    static MAX_VALUE = Long1.fromBits(4294967295 | 0, 2147483647 | 0, false);
    static MIN_VALUE = Long1.fromBits(0, 2147483648 | 0, false);
    static fromBits(lowBits, highBits, unsigned) {
        return new Long1(lowBits, highBits, unsigned);
    }
    static fromInt(value, unsigned) {
        let obj;
        let cache;
        if (unsigned) {
            value >>>= 0;
            if (cache = 0 <= value && value < 256) {
                const cachedObj = UINT_CACHE1[value];
                if (cachedObj) return cachedObj;
            }
            obj = Long1.fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache) UINT_CACHE1[value] = obj;
            return obj;
        }
        value |= 0;
        if (cache = -128 <= value && value < 128) {
            const cachedObj = INT_CACHE1[value];
            if (cachedObj) return cachedObj;
        }
        obj = Long1.fromBits(value, value < 0 ? -1 : 0, false);
        if (cache) INT_CACHE1[value] = obj;
        return obj;
    }
    static fromNumber(value, unsigned) {
        if (isNaN(value)) return unsigned ? Long1.UZERO : Long1.ZERO;
        if (unsigned) {
            if (value < 0) return Long1.UZERO;
            if (value >= TWO_PWR_64_DBL1) return Long1.MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL1) return Long1.MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL1) return Long1.MAX_VALUE;
        }
        if (value < 0) return Long1.fromNumber(-value, unsigned).neg();
        return Long1.fromBits(value % TWO_PWR_32_DBL1 | 0, value / TWO_PWR_32_DBL1 | 0, unsigned);
    }
    static fromBigInt(value, unsigned) {
        return Long1.fromString(value.toString(), unsigned);
    }
    static fromString(str, unsigned, radix) {
        if (str.length === 0) throw Error("empty string");
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") {
            return Long1.ZERO;
        }
        if (typeof unsigned === "number") {
            radix = unsigned, unsigned = false;
        } else {
            unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        let p;
        if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
        else if (p === 0) {
            return Long1.fromString(str.substring(1), unsigned, radix).neg();
        }
        const radixToPower = Long1.fromNumber(radix ** 8);
        let result = Long1.ZERO;
        for(let i105 = 0; i105 < str.length; i105 += 8){
            const size = Math.min(8, str.length - i105);
            const value = parseInt(str.substring(i105, i105 + size), radix);
            if (size < 8) {
                const power = Long1.fromNumber(radix ** size);
                result = result.mul(power).add(Long1.fromNumber(value));
            } else {
                result = result.mul(radixToPower);
                result = result.add(Long1.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }
    static fromBytes(bytes, unsigned, le) {
        return le ? Long1.fromBytesLE(bytes, unsigned) : Long1.fromBytesBE(bytes, unsigned);
    }
    static fromBytesLE(bytes, unsigned) {
        return new Long1(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
    }
    static fromBytesBE(bytes, unsigned) {
        return new Long1(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
    }
    static isLong(value) {
        return value instanceof Long1;
    }
    static fromValue(val, unsigned) {
        if (typeof val === "number") return Long1.fromNumber(val, unsigned);
        if (typeof val === "string") return Long1.fromString(val, unsigned);
        return Long1.fromBits(val.low, val.high, typeof unsigned === "boolean" ? unsigned : val.unsigned);
    }
    add(addend) {
        if (!Long1.isLong(addend)) addend = Long1.fromValue(addend);
        const a48 = this.high >>> 16;
        const a32 = this.high & 65535;
        const a16 = this.low >>> 16;
        const a00 = this.low & 65535;
        const b48 = addend.high >>> 16;
        const b32 = addend.high & 65535;
        const b16 = addend.low >>> 16;
        const b00 = addend.low & 65535;
        let c48 = 0;
        let c32 = 0;
        let c16 = 0;
        let c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 + b48;
        c48 &= 65535;
        return Long1.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
    }
    and(other) {
        if (!Long1.isLong(other)) other = Long1.fromValue(other);
        return Long1.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    }
    compare(other) {
        if (!Long1.isLong(other)) other = Long1.fromValue(other);
        if (this.eq(other)) return 0;
        const thisNeg = this.isNegative();
        const otherNeg = other.isNegative();
        if (thisNeg && !otherNeg) return -1;
        if (!thisNeg && otherNeg) return 1;
        if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
    }
    comp(other) {
        return this.compare(other);
    }
    divide(divisor) {
        if (!Long1.isLong(divisor)) divisor = Long1.fromValue(divisor);
        if (divisor.isZero()) throw Error("division by zero");
        if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
            return this;
        }
        const low = (this.unsigned ? wasm3.div_u : wasm3.div_s)(this.low, this.high, divisor.low, divisor.high);
        return Long1.fromBits(low, wasm3.get_high(), this.unsigned);
    }
    div(divisor) {
        return this.divide(divisor);
    }
    equals(other) {
        if (!Long1.isLong(other)) other = Long1.fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) {
            return false;
        }
        return this.high === other.high && this.low === other.low;
    }
    eq(other) {
        return this.equals(other);
    }
    getHighBits() {
        return this.high;
    }
    getHighBitsUnsigned() {
        return this.high >>> 0;
    }
    getLowBits() {
        return this.low;
    }
    getLowBitsUnsigned() {
        return this.low >>> 0;
    }
    getNumBitsAbs() {
        if (this.isNegative()) {
            return this.eq(Long1.MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        }
        const val = this.high !== 0 ? this.high : this.low;
        let bit;
        for(bit = 31; bit > 0; bit--)if ((val & 1 << bit) !== 0) break;
        return this.high !== 0 ? bit + 33 : bit + 1;
    }
    greaterThan(other) {
        return this.comp(other) > 0;
    }
    gt(other) {
        return this.greaterThan(other);
    }
    greaterThanOrEqual(other) {
        return this.comp(other) >= 0;
    }
    gte(other) {
        return this.greaterThanOrEqual(other);
    }
    ge(other) {
        return this.greaterThanOrEqual(other);
    }
    isEven() {
        return (this.low & 1) === 0;
    }
    isNegative() {
        return !this.unsigned && this.high < 0;
    }
    isOdd() {
        return (this.low & 1) === 1;
    }
    isPositive() {
        return this.unsigned || this.high >= 0;
    }
    isZero() {
        return this.high === 0 && this.low === 0;
    }
    lessThan(other) {
        return this.comp(other) < 0;
    }
    lt(other) {
        return this.lessThan(other);
    }
    lessThanOrEqual(other) {
        return this.comp(other) <= 0;
    }
    lte(other) {
        return this.lessThanOrEqual(other);
    }
    modulo(divisor) {
        if (!Long1.isLong(divisor)) divisor = Long1.fromValue(divisor);
        const low = (this.unsigned ? wasm3.rem_u : wasm3.rem_s)(this.low, this.high, divisor.low, divisor.high);
        return Long1.fromBits(low, wasm3.get_high(), this.unsigned);
    }
    mod(divisor) {
        return this.modulo(divisor);
    }
    rem(divisor) {
        return this.modulo(divisor);
    }
    multiply(multiplier) {
        if (this.isZero()) return Long1.ZERO;
        if (!Long1.isLong(multiplier)) multiplier = Long1.fromValue(multiplier);
        const low = wasm3.mul(this.low, this.high, multiplier.low, multiplier.high);
        return Long1.fromBits(low, wasm3.get_high(), this.unsigned);
    }
    mul(multiplier) {
        return this.multiply(multiplier);
    }
    negate() {
        if (!this.unsigned && this.eq(Long1.MIN_VALUE)) return Long1.MIN_VALUE;
        return this.not().add(Long1.ONE);
    }
    neg() {
        return this.negate();
    }
    not() {
        return Long1.fromBits(~this.low, ~this.high, this.unsigned);
    }
    notEquals(other) {
        return !this.equals(other);
    }
    neq(other) {
        return this.notEquals(other);
    }
    ne(other) {
        return this.notEquals(other);
    }
    or(other) {
        if (!Long1.isLong(other)) other = Long1.fromValue(other);
        return Long1.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    }
    shiftLeft(numBits) {
        if (Long1.isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits < 32) {
            return Long1.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);
        }
        return Long1.fromBits(0, this.low << numBits - 32, this.unsigned);
    }
    shl(numBits) {
        return this.shiftLeft(numBits);
    }
    shiftRight(numBits) {
        if (Long1.isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits < 32) {
            return Long1.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);
        }
        return Long1.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
    }
    shr(numBits) {
        return this.shiftRight(numBits);
    }
    shiftRightUnsigned(numBits) {
        if (Long1.isLong(numBits)) numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0) return this;
        const high = this.high;
        if (numBits < 32) {
            const low = this.low;
            return Long1.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
        }
        if (numBits === 32) return Long1.fromBits(high, 0, this.unsigned);
        else return Long1.fromBits(high >>> numBits - 32, 0, this.unsigned);
    }
    shr_u(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    shru(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    subtract(subtrahend) {
        if (!Long1.isLong(subtrahend)) subtrahend = Long1.fromValue(subtrahend);
        return this.add(subtrahend.neg());
    }
    sub(subtrahend) {
        return this.subtract(subtrahend);
    }
    toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    }
    toNumber() {
        if (this.unsigned) {
            return (this.high >>> 0) * TWO_PWR_32_DBL1 + (this.low >>> 0);
        }
        return this.high * TWO_PWR_32_DBL1 + (this.low >>> 0);
    }
    toBigInt() {
        return BigInt(this.toString());
    }
    toBytes(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    }
    toBytesLE() {
        const hi = this.high;
        const lo = this.low;
        return [
            lo & 255,
            lo >>> 8 & 255,
            lo >>> 16 & 255,
            lo >>> 24,
            hi & 255,
            hi >>> 8 & 255,
            hi >>> 16 & 255,
            hi >>> 24, 
        ];
    }
    toBytesBE() {
        const hi = this.high;
        const lo = this.low;
        return [
            hi >>> 24,
            hi >>> 16 & 255,
            hi >>> 8 & 255,
            hi & 255,
            lo >>> 24,
            lo >>> 16 & 255,
            lo >>> 8 & 255,
            lo & 255, 
        ];
    }
    toSigned() {
        if (!this.unsigned) return this;
        return Long1.fromBits(this.low, this.high, false);
    }
    toString(radix = 10) {
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        if (this.isZero()) return "0";
        if (this.isNegative()) {
            if (this.eq(Long1.MIN_VALUE)) {
                const radixLong = Long1.fromNumber(radix);
                const div = this.div(radixLong);
                const rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            return `-${this.neg().toString(radix)}`;
        }
        const radixToPower = Long1.fromNumber(radix ** 6, this.unsigned);
        let rem = this;
        let result = "";
        while(true){
            const remDiv = rem.div(radixToPower);
            const intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
            let digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) {
                return digits + result;
            }
            while(digits.length < 6)digits = `0${digits}`;
            result = `${digits}${result}`;
        }
    }
    toUnsigned() {
        if (this.unsigned) return this;
        return Long1.fromBits(this.low, this.high, true);
    }
    xor(other) {
        if (!Long1.isLong(other)) other = Long1.fromValue(other);
        return Long1.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    }
    eqz() {
        return this.isZero();
    }
    le(other) {
        return this.lessThanOrEqual(other);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Long("${this.toString()}"${this.unsigned ? ", true" : ""})`;
    }
}
const PARSE_STRING_REGEXP1 = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
const PARSE_INF_REGEXP1 = /^(\+|-)?(Infinity|inf)$/i;
const PARSE_NAN_REGEXP1 = /^(\+|-)?NaN$/i;
const EXPONENT_MAX1 = 6111;
const EXPONENT_MIN1 = -6176;
const EXPONENT_BIAS1 = 6176;
const NAN_BUFFER1 = [
    124,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const INF_NEGATIVE_BUFFER1 = [
    248,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const INF_POSITIVE_BUFFER1 = [
    120,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0, 
].reverse();
const EXPONENT_REGEX1 = /^([-+])?(\d+)?$/;
const EXPONENT_MASK1 = 16383;
function isDigit1(value) {
    return !isNaN(parseInt(value, 10));
}
function divideu1281(value) {
    const DIVISOR = Long1.fromNumber(1000 * 1000 * 1000);
    let _rem = Long1.fromNumber(0);
    if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
        return {
            quotient: value,
            rem: _rem
        };
    }
    for(let i106 = 0; i106 <= 3; i106++){
        _rem = _rem.shiftLeft(32);
        _rem = _rem.add(new Long1(value.parts[i106], 0));
        value.parts[i106] = _rem.div(DIVISOR).low;
        _rem = _rem.modulo(DIVISOR);
    }
    return {
        quotient: value,
        rem: _rem
    };
}
function multiply64x21(left, right) {
    if (!left && !right) {
        return {
            high: Long1.fromNumber(0),
            low: Long1.fromNumber(0)
        };
    }
    const leftHigh = left.shiftRightUnsigned(32);
    const leftLow = new Long1(left.getLowBits(), 0);
    const rightHigh = right.shiftRightUnsigned(32);
    const rightLow = new Long1(right.getLowBits(), 0);
    let productHigh = leftHigh.multiply(rightHigh);
    let productMid = leftHigh.multiply(rightLow);
    const productMid2 = leftLow.multiply(rightHigh);
    let productLow = leftLow.multiply(rightLow);
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productMid = new Long1(productMid.getLowBits(), 0).add(productMid2).add(productLow.shiftRightUnsigned(32));
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productLow = productMid.shiftLeft(32).add(new Long1(productLow.getLowBits(), 0));
    return {
        high: productHigh,
        low: productLow
    };
}
function lessThan1(left, right) {
    const uhleft = left.high >>> 0;
    const uhright = right.high >>> 0;
    if (uhleft < uhright) {
        return true;
    }
    if (uhleft === uhright) {
        const ulleft = left.low >>> 0;
        const ulright = right.low >>> 0;
        if (ulleft < ulright) return true;
    }
    return false;
}
function invalidErr1(string, message) {
    throw new BSONTypeError1(`"${string}" is not a valid Decimal128 string - ${message}`);
}
class Decimal1281 {
    bytes;
    constructor(bytes){
        this.bytes = typeof bytes === "string" ? Decimal1281.fromString(bytes).bytes : bytes;
    }
    static fromString(representation) {
        let isNegative = false;
        let sawRadix = false;
        let foundNonZero = false;
        let significantDigits = 0;
        let nDigitsRead = 0;
        let nDigits = 0;
        let radixPosition = 0;
        let firstNonZero = 0;
        const digits = [
            0
        ];
        let nDigitsStored = 0;
        let digitsInsert = 0;
        let firstDigit = 0;
        let lastDigit = 0;
        let exponent = 0;
        let i107 = 0;
        let significandHigh = new Long1(0, 0);
        let significandLow = new Long1(0, 0);
        let biasedExponent = 0;
        let index = 0;
        if (representation.length >= 7000) {
            throw new BSONTypeError1(`${representation} not a valid Decimal128 string`);
        }
        const stringMatch = representation.match(PARSE_STRING_REGEXP1);
        const infMatch = representation.match(PARSE_INF_REGEXP1);
        const nanMatch = representation.match(PARSE_NAN_REGEXP1);
        if (!stringMatch && !infMatch && !nanMatch || representation.length === 0) {
            throw new BSONTypeError1(`${representation} not a valid Decimal128 string`);
        }
        if (stringMatch) {
            const unsignedNumber = stringMatch[2];
            const e = stringMatch[4];
            const expSign = stringMatch[5];
            const expNumber = stringMatch[6];
            if (e && expNumber === undefined) {
                invalidErr1(representation, "missing exponent power");
            }
            if (e && unsignedNumber === undefined) {
                invalidErr1(representation, "missing exponent base");
            }
            if (e === undefined && (expSign || expNumber)) {
                invalidErr1(representation, "missing e before exponent");
            }
        }
        if (representation[index] === "+" || representation[index] === "-") {
            isNegative = representation[index++] === "-";
        }
        if (!isDigit1(representation[index]) && representation[index] !== ".") {
            if (representation[index] === "i" || representation[index] === "I") {
                return new Decimal1281(new Uint8Array(isNegative ? INF_NEGATIVE_BUFFER1 : INF_POSITIVE_BUFFER1));
            }
            if (representation[index] === "N") {
                return new Decimal1281(new Uint8Array(NAN_BUFFER1));
            }
        }
        while(isDigit1(representation[index]) || representation[index] === "."){
            if (representation[index] === ".") {
                if (sawRadix) invalidErr1(representation, "contains multiple periods");
                sawRadix = true;
                index += 1;
                continue;
            }
            if (nDigitsStored < 34 && (representation[index] !== "0" || foundNonZero)) {
                if (!foundNonZero) {
                    firstNonZero = nDigitsRead;
                }
                foundNonZero = true;
                digits[digitsInsert++] = parseInt(representation[index], 10);
                nDigitsStored += 1;
            }
            if (foundNonZero) nDigits += 1;
            if (sawRadix) radixPosition += 1;
            nDigitsRead += 1;
            index += 1;
        }
        if (sawRadix && !nDigitsRead) {
            throw new BSONTypeError1(`${representation} not a valid Decimal128 string`);
        }
        if (representation[index] === "e" || representation[index] === "E") {
            const match = representation.substr(++index).match(EXPONENT_REGEX1);
            if (!match || !match[2]) {
                return new Decimal1281(new Uint8Array(NAN_BUFFER1));
            }
            exponent = parseInt(match[0], 10);
            index += match[0].length;
        }
        if (representation[index]) {
            return new Decimal1281(new Uint8Array(NAN_BUFFER1));
        }
        firstDigit = 0;
        if (!nDigitsStored) {
            firstDigit = 0;
            lastDigit = 0;
            digits[0] = 0;
            nDigits = 1;
            nDigitsStored = 1;
            significantDigits = 0;
        } else {
            lastDigit = nDigitsStored - 1;
            significantDigits = nDigits;
            if (significantDigits !== 1) {
                while(digits[firstNonZero + significantDigits - 1] === 0){
                    significantDigits -= 1;
                }
            }
        }
        exponent = exponent <= radixPosition && radixPosition - exponent > 1 << 14 ? EXPONENT_MIN1 : exponent - radixPosition;
        while(exponent > 6111){
            lastDigit += 1;
            if (lastDigit - firstDigit > 34) {
                const digitsString = digits.join("");
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX1;
                    break;
                }
                invalidErr1(representation, "overflow");
            }
            exponent -= 1;
        }
        while(exponent < EXPONENT_MIN1 || nDigitsStored < nDigits){
            if (lastDigit === 0 && significantDigits < nDigitsStored) {
                exponent = EXPONENT_MIN1;
                significantDigits = 0;
                break;
            }
            if (nDigitsStored < nDigits) {
                nDigits -= 1;
            } else {
                lastDigit -= 1;
            }
            if (exponent < 6111) {
                exponent += 1;
            } else {
                const digitsString = digits.join("");
                if (digitsString.match(/^0+$/)) {
                    exponent = EXPONENT_MAX1;
                    break;
                }
                invalidErr1(representation, "overflow");
            }
        }
        if (lastDigit - firstDigit + 1 < significantDigits) {
            let endOfString = nDigitsRead;
            if (sawRadix) {
                firstNonZero += 1;
                endOfString += 1;
            }
            if (isNegative) {
                firstNonZero += 1;
                endOfString += 1;
            }
            const roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
            let roundBit = 0;
            if (roundDigit >= 5) {
                roundBit = 1;
                if (roundDigit === 5) {
                    roundBit = digits[lastDigit] % 2 === 1 ? 1 : 0;
                    for(i107 = firstNonZero + lastDigit + 2; i107 < endOfString; i107++){
                        if (parseInt(representation[i107], 10)) {
                            roundBit = 1;
                            break;
                        }
                    }
                }
            }
            if (roundBit) {
                let dIdx = lastDigit;
                for(; dIdx >= 0; dIdx--){
                    if (++digits[dIdx] > 9) {
                        digits[dIdx] = 0;
                        if (dIdx === 0) {
                            if (exponent < 6111) {
                                exponent += 1;
                                digits[dIdx] = 1;
                            } else {
                                return new Decimal1281(new Uint8Array(isNegative ? INF_NEGATIVE_BUFFER1 : INF_POSITIVE_BUFFER1));
                            }
                        }
                    }
                }
            }
        }
        significandHigh = Long1.fromNumber(0);
        significandLow = Long1.fromNumber(0);
        if (significantDigits === 0) {
            significandHigh = Long1.fromNumber(0);
            significandLow = Long1.fromNumber(0);
        } else if (lastDigit - firstDigit < 17) {
            let dIdx = firstDigit;
            significandLow = Long1.fromNumber(digits[dIdx++]);
            significandHigh = new Long1(0, 0);
            for(; dIdx <= lastDigit; dIdx++){
                significandLow = significandLow.multiply(Long1.fromNumber(10));
                significandLow = significandLow.add(Long1.fromNumber(digits[dIdx]));
            }
        } else {
            let dIdx = firstDigit;
            significandHigh = Long1.fromNumber(digits[dIdx++]);
            for(; dIdx <= lastDigit - 17; dIdx++){
                significandHigh = significandHigh.multiply(Long1.fromNumber(10));
                significandHigh = significandHigh.add(Long1.fromNumber(digits[dIdx]));
            }
            significandLow = Long1.fromNumber(digits[dIdx++]);
            for(; dIdx <= lastDigit; dIdx++){
                significandLow = significandLow.multiply(Long1.fromNumber(10));
                significandLow = significandLow.add(Long1.fromNumber(digits[dIdx]));
            }
        }
        const significand = multiply64x21(significandHigh, Long1.fromString("100000000000000000"));
        significand.low = significand.low.add(significandLow);
        if (lessThan1(significand.low, significandLow)) {
            significand.high = significand.high.add(Long1.fromNumber(1));
        }
        biasedExponent = exponent + EXPONENT_BIAS1;
        const dec3 = {
            low: Long1.fromNumber(0),
            high: Long1.fromNumber(0)
        };
        if (significand.high.shiftRightUnsigned(49).and(Long1.fromNumber(1)).equals(Long1.fromNumber(1))) {
            dec3.high = dec3.high.or(Long1.fromNumber(3).shiftLeft(61));
            dec3.high = dec3.high.or(Long1.fromNumber(biasedExponent).and(Long1.fromNumber(16383).shiftLeft(47)));
            dec3.high = dec3.high.or(significand.high.and(Long1.fromNumber(140737488355327)));
        } else {
            dec3.high = dec3.high.or(Long1.fromNumber(biasedExponent & 16383).shiftLeft(49));
            dec3.high = dec3.high.or(significand.high.and(Long1.fromNumber(562949953421311)));
        }
        dec3.low = significand.low;
        if (isNegative) {
            dec3.high = dec3.high.or(Long1.fromString("9223372036854775808"));
        }
        const buffer50 = new Uint8Array(16);
        index = 0;
        buffer50[index++] = dec3.low.low & 255;
        buffer50[index++] = dec3.low.low >> 8 & 255;
        buffer50[index++] = dec3.low.low >> 16 & 255;
        buffer50[index++] = dec3.low.low >> 24 & 255;
        buffer50[index++] = dec3.low.high & 255;
        buffer50[index++] = dec3.low.high >> 8 & 255;
        buffer50[index++] = dec3.low.high >> 16 & 255;
        buffer50[index++] = dec3.low.high >> 24 & 255;
        buffer50[index++] = dec3.high.low & 255;
        buffer50[index++] = dec3.high.low >> 8 & 255;
        buffer50[index++] = dec3.high.low >> 16 & 255;
        buffer50[index++] = dec3.high.low >> 24 & 255;
        buffer50[index++] = dec3.high.high & 255;
        buffer50[index++] = dec3.high.high >> 8 & 255;
        buffer50[index++] = dec3.high.high >> 16 & 255;
        buffer50[index++] = dec3.high.high >> 24 & 255;
        return new Decimal1281(buffer50);
    }
    toString() {
        let biasedExponent;
        let significandDigits = 0;
        const significand = new Array(36);
        for(let i108 = 0; i108 < significand.length; i108++)significand[i108] = 0;
        let index = 0;
        let isZero = false;
        let significandMsb;
        let significand128 = {
            parts: [
                0,
                0,
                0,
                0
            ]
        };
        let j;
        let k;
        const string = [];
        index = 0;
        const buffer51 = this.bytes;
        const low = buffer51[index++] | buffer51[index++] << 8 | buffer51[index++] << 16 | buffer51[index++] << 24;
        const midl = buffer51[index++] | buffer51[index++] << 8 | buffer51[index++] << 16 | buffer51[index++] << 24;
        const midh = buffer51[index++] | buffer51[index++] << 8 | buffer51[index++] << 16 | buffer51[index++] << 24;
        const high = buffer51[index++] | buffer51[index++] << 8 | buffer51[index++] << 16 | buffer51[index++] << 24;
        index = 0;
        const dec4 = {
            low: new Long1(low, midl),
            high: new Long1(midh, high)
        };
        if (dec4.high.lessThan(Long1.ZERO)) {
            string.push("-");
        }
        const combination = high >> 26 & 31;
        if (combination >> 3 === 3) {
            if (combination === 30) {
                return `${string.join("")}Infinity`;
            }
            if (combination === 31) {
                return "NaN";
            }
            biasedExponent = high >> 15 & EXPONENT_MASK1;
            significandMsb = 8 + (high >> 14 & 1);
        } else {
            significandMsb = high >> 14 & 7;
            biasedExponent = high >> 17 & EXPONENT_MASK1;
        }
        const exponent = biasedExponent - 6176;
        significand128.parts[0] = (high & 16383) + ((significandMsb & 15) << 14);
        significand128.parts[1] = midh;
        significand128.parts[2] = midl;
        significand128.parts[3] = low;
        if (significand128.parts[0] === 0 && significand128.parts[1] === 0 && significand128.parts[2] === 0 && significand128.parts[3] === 0) {
            isZero = true;
        } else {
            for(k = 3; k >= 0; k--){
                let leastDigits = 0;
                const result = divideu1281(significand128);
                significand128 = result.quotient;
                leastDigits = result.rem.low;
                if (!leastDigits) continue;
                for(j = 8; j >= 0; j--){
                    significand[k * 9 + j] = leastDigits % 10;
                    leastDigits = Math.floor(leastDigits / 10);
                }
            }
        }
        if (isZero) {
            significandDigits = 1;
            significand[index] = 0;
        } else {
            significandDigits = 36;
            while(!significand[index]){
                significandDigits -= 1;
                index += 1;
            }
        }
        const scientificExponent = significandDigits - 1 + exponent;
        if (scientificExponent >= 34 || scientificExponent <= -7 || exponent > 0) {
            if (significandDigits > 34) {
                string.push(`${0}`);
                if (exponent > 0) string.push(`E+${exponent}`);
                else if (exponent < 0) string.push(`E${exponent}`);
                return string.join("");
            }
            string.push(`${significand[index++]}`);
            significandDigits -= 1;
            if (significandDigits) {
                string.push(".");
            }
            for(let i109 = 0; i109 < significandDigits; i109++){
                string.push(`${significand[index++]}`);
            }
            string.push("E");
            if (scientificExponent > 0) {
                string.push(`+${scientificExponent}`);
            } else {
                string.push(`${scientificExponent}`);
            }
        } else {
            if (exponent >= 0) {
                for(let i110 = 0; i110 < significandDigits; i110++){
                    string.push(`${significand[index++]}`);
                }
            } else {
                let radixPosition = significandDigits + exponent;
                if (radixPosition > 0) {
                    for(let i111 = 0; i111 < radixPosition; i111++){
                        string.push(`${significand[index++]}`);
                    }
                } else {
                    string.push("0");
                }
                string.push(".");
                while(radixPosition++ < 0){
                    string.push("0");
                }
                for(let i112 = 0; i112 < significandDigits - Math.max(radixPosition - 1, 0); i112++){
                    string.push(`${significand[index++]}`);
                }
            }
        }
        return string.join("");
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Decimal128("${this.toString()}")`;
    }
    toJSON() {
        return {
            $numberDecimal: this.toString()
        };
    }
}
class Double1 {
    value;
    constructor(value){
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value;
    }
    valueOf() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Double(${this.toJSON()})`;
    }
}
function writeIEEE7541(buffer52, value, offset115, endian, mLen, nBytes) {
    let e;
    let m;
    let c;
    const bBE = endian === "big";
    let eLen = nBytes * 8 - mLen - 1;
    const eMax = (1 << eLen) - 1;
    const eBias = eMax >> 1;
    const rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    let i113 = bBE ? nBytes - 1 : 0;
    const d = bBE ? -1 : 1;
    const s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    if (isNaN(value)) m = 0;
    while(mLen >= 8){
        buffer52[offset115 + i113] = m & 255;
        i113 += d;
        m /= 256;
        mLen -= 8;
    }
    e = e << mLen | m;
    if (isNaN(value)) e += 8;
    eLen += mLen;
    while(eLen > 0){
        buffer52[offset115 + i113] = e & 255;
        i113 += d;
        e /= 256;
        eLen -= 8;
    }
    buffer52[offset115 + i113 - d] |= s * 128;
}
class Int321 {
    value;
    constructor(value){
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value | 0;
    }
    valueOf() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    toJSON() {
        return this.value;
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Int32(${this.valueOf()})`;
    }
}
class MaxKey1 {
    [Symbol.for("Deno.customInspect")]() {
        return "new MaxKey()";
    }
}
class MinKey1 {
    [Symbol.for("Deno.customInspect")]() {
        return "new MinKey()";
    }
}
const hexTable2 = new TextEncoder().encode("0123456789abcdef");
function errInvalidByte1(__byte) {
    return new TypeError(`Invalid byte '${String.fromCharCode(__byte)}'`);
}
function errLength1() {
    return new RangeError("Odd length hex string");
}
function fromHexChar1(__byte) {
    if (48 <= __byte && __byte <= 57) return __byte - 48;
    if (97 <= __byte && __byte <= 102) return __byte - 97 + 10;
    if (65 <= __byte && __byte <= 70) return __byte - 65 + 10;
    throw errInvalidByte1(__byte);
}
function encode4(src) {
    const dst = new Uint8Array(src.length * 2);
    for(let i114 = 0; i114 < dst.length; i114++){
        const v = src[i114];
        dst[i114 * 2] = hexTable2[v >> 4];
        dst[i114 * 2 + 1] = hexTable2[v & 15];
    }
    return dst;
}
function decode4(src) {
    const dst = new Uint8Array(src.length / 2);
    for(let i115 = 0; i115 < dst.length; i115++){
        const a = fromHexChar1(src[i115 * 2]);
        const b = fromHexChar1(src[i115 * 2 + 1]);
        dst[i115] = a << 4 | b;
    }
    if (src.length % 2 == 1) {
        fromHexChar1(src[dst.length * 2]);
        throw errLength1();
    }
    return dst;
}
const mod4 = {
    encode: encode4,
    decode: decode4
};
const base64abc2 = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/", 
];
function encode5(data36) {
    const uint8 = typeof data36 === "string" ? new TextEncoder().encode(data36) : data36 instanceof Uint8Array ? data36 : new Uint8Array(data36);
    let result = "", i116;
    const l = uint8.length;
    for(i116 = 2; i116 < l; i116 += 3){
        result += base64abc2[uint8[i116 - 2] >> 2];
        result += base64abc2[(uint8[i116 - 2] & 3) << 4 | uint8[i116 - 1] >> 4];
        result += base64abc2[(uint8[i116 - 1] & 15) << 2 | uint8[i116] >> 6];
        result += base64abc2[uint8[i116] & 63];
    }
    if (i116 === l + 1) {
        result += base64abc2[uint8[i116 - 2] >> 2];
        result += base64abc2[(uint8[i116 - 2] & 3) << 4];
        result += "==";
    }
    if (i116 === l) {
        result += base64abc2[uint8[i116 - 2] >> 2];
        result += base64abc2[(uint8[i116 - 2] & 3) << 4 | uint8[i116 - 1] >> 4];
        result += base64abc2[(uint8[i116 - 1] & 15) << 2];
        result += "=";
    }
    return result;
}
function decode5(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i117 = 0; i117 < size; i117++){
        bytes[i117] = binString.charCodeAt(i117);
    }
    return bytes;
}
const mod5 = {
    encode: encode5,
    decode: decode5
};
function equalsNaive1(a, b) {
    if (a.length !== b.length) return false;
    for(let i118 = 0; i118 < b.length; i118++){
        if (a[i118] !== b[i118]) return false;
    }
    return true;
}
function equalsSimd1(a, b) {
    if (a.length !== b.length) return false;
    const len = a.length;
    const compressable = Math.floor(len / 4);
    const compressedA = new Uint32Array(a.buffer, 0, compressable);
    const compressedB = new Uint32Array(b.buffer, 0, compressable);
    for(let i119 = compressable * 4; i119 < len; i119++){
        if (a[i119] !== b[i119]) return false;
    }
    for(let i1 = 0; i1 < compressedA.length; i1++){
        if (compressedA[i1] !== compressedB[i1]) return false;
    }
    return true;
}
function equals1(a, b) {
    if (a.length < 1000) return equalsNaive1(a, b);
    return equalsSimd1(a, b);
}
function copy3(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const textEncoder2 = new TextEncoder();
const textDecoder4 = new TextDecoder();
function decodeHexString1(hexString) {
    return mod4.decode(textEncoder2.encode(hexString));
}
function encodeHexString1(uint8Array) {
    return textDecoder4.decode(mod4.encode(uint8Array));
}
const textEncoder3 = new TextEncoder();
const textDecoder5 = new TextDecoder();
const checkForHexRegExp1 = new RegExp("^[0-9a-fA-F]{24}$");
let PROCESS_UNIQUE1 = null;
class ObjectId1 {
    static #index = Math.floor(Math.random() * 16777215);
    static cacheHexString;
    #id;
    #bytesBuffer;
    constructor(inputId = ObjectId1.generate()){
        let workingId;
        if (typeof inputId === "object" && inputId && "id" in inputId) {
            if (typeof inputId.id !== "string" && !ArrayBuffer.isView(inputId.id)) {
                throw new BSONTypeError1("Argument passed in must have an id that is of type string or Buffer");
            }
            workingId = "toHexString" in inputId && typeof inputId.toHexString === "function" ? decodeHexString1(inputId.toHexString()) : inputId.id;
        } else {
            workingId = inputId;
        }
        if (workingId == null || typeof workingId === "number") {
            this.#bytesBuffer = new Uint8Array(ObjectId1.generate(typeof workingId === "number" ? workingId : undefined));
        } else if (ArrayBuffer.isView(workingId) && workingId.byteLength === 12) {
            this.#bytesBuffer = workingId;
        } else if (typeof workingId === "string") {
            if (workingId.length === 12) {
                const bytes = textEncoder3.encode(workingId);
                if (bytes.byteLength === 12) {
                    this.#bytesBuffer = bytes;
                } else {
                    throw new BSONTypeError1("Argument passed in must be a string of 12 bytes");
                }
            } else if (workingId.length === 24 && checkForHexRegExp1.test(workingId)) {
                this.#bytesBuffer = decodeHexString1(workingId);
            } else {
                throw new BSONTypeError1("Argument passed in must be a string of 12 bytes or a string of 24 hex characters");
            }
        } else {
            throw new BSONTypeError1("Argument passed in does not match the accepted types");
        }
        if (ObjectId1.cacheHexString) {
            this.#id = encodeHexString1(this.id);
        }
    }
    get id() {
        return this.#bytesBuffer;
    }
    set id(value) {
        this.#bytesBuffer = value;
        if (ObjectId1.cacheHexString) {
            this.#id = encodeHexString1(value);
        }
    }
    toHexString() {
        if (ObjectId1.cacheHexString && this.#id) {
            return this.#id;
        }
        const hexString = encodeHexString1(this.id);
        if (ObjectId1.cacheHexString && !this.#id) {
            this.#id = hexString;
        }
        return hexString;
    }
    static generate(time) {
        if ("number" !== typeof time) {
            time = Math.floor(Date.now() / 1000);
        }
        const inc = this.#index = (this.#index + 1) % 16777215;
        const objectId = new Uint8Array(12);
        new DataView(objectId.buffer, 0, 4).setUint32(0, time);
        if (PROCESS_UNIQUE1 === null) {
            PROCESS_UNIQUE1 = randomBytes1(5);
        }
        objectId[4] = PROCESS_UNIQUE1[0];
        objectId[5] = PROCESS_UNIQUE1[1];
        objectId[6] = PROCESS_UNIQUE1[2];
        objectId[7] = PROCESS_UNIQUE1[3];
        objectId[8] = PROCESS_UNIQUE1[4];
        objectId[11] = inc & 255;
        objectId[10] = inc >> 8 & 255;
        objectId[9] = inc >> 16 & 255;
        return objectId;
    }
    toString() {
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (otherId == null) {
            return false;
        }
        if (otherId instanceof ObjectId1) {
            return equals1(this.#bytesBuffer, otherId.#bytesBuffer);
        }
        if (typeof otherId === "string" && ObjectId1.isValid(otherId) && otherId.length === 12 && this.id instanceof Uint8Array) {
            return otherId === textDecoder5.decode(this.id);
        }
        if (typeof otherId === "string" && ObjectId1.isValid(otherId) && otherId.length === 24) {
            return otherId.toLowerCase() === this.toHexString();
        }
        if (typeof otherId === "string" && ObjectId1.isValid(otherId) && otherId.length === 12) {
            const otherIdUint8Array = textEncoder3.encode(otherId);
            for(let i120 = 0; i120 < 12; i120++){
                if (otherIdUint8Array[i120] !== this.id[i120]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    getTimestamp() {
        const timestamp = new Date();
        const time = new DataView(this.id.buffer, 0, 4).getUint32(0);
        timestamp.setTime(Math.floor(time) * 1000);
        return timestamp;
    }
    static createFromTime(time) {
        const buffer53 = new Uint8Array([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]);
        new DataView(buffer53.buffer, 0, 4).setUint32(0, time);
        return new ObjectId1(buffer53);
    }
    static createFromHexString(hexString) {
        if (typeof hexString === "undefined" || hexString != null && hexString.length !== 24) {
            throw new BSONTypeError1("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        }
        return new ObjectId1(decodeHexString1(hexString));
    }
    static isValid(id) {
        if (id == null) return false;
        try {
            new ObjectId1(id);
            return true;
        } catch  {
            return false;
        }
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new ObjectId("${this.toHexString()}")`;
    }
}
class Timestamp1 extends Long1 {
    static MAX_VALUE = Long1.MAX_UNSIGNED_VALUE;
    constructor(value = new Long1()){
        const isLong = Long1.isLong(value);
        const low = isLong ? value.low : value.i;
        const high = isLong ? value.high : value.t;
        super(low, high, true);
    }
    toJSON() {
        return {
            $timestamp: this.toString()
        };
    }
    static fromInt(value) {
        return new Timestamp1(Long1.fromInt(value, true));
    }
    static fromNumber(value) {
        return new Timestamp1(Long1.fromNumber(value, true));
    }
    static fromBits(lowBits, highBits) {
        return new Timestamp1(new Long1(lowBits, highBits));
    }
    static fromString(str, optRadix) {
        return new Timestamp1(Long1.fromString(str, true, optRadix));
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new Timestamp({ t: ${this.getHighBits()}, i: ${this.getLowBits()} })`;
    }
}
function alphabetize1(str) {
    return str.split("").sort().join("");
}
class BSONRegExp1 {
    pattern;
    options;
    constructor(pattern, options){
        this.pattern = pattern;
        this.options = alphabetize1(options ?? "");
        if (this.pattern.indexOf("\x00") !== -1) {
            throw new BSONError1(`BSON Regex patterns cannot contain null bytes, found: ${JSON.stringify(this.pattern)}`);
        }
        if (this.options.indexOf("\x00") !== -1) {
            throw new BSONError1(`BSON Regex options cannot contain null bytes, found: ${JSON.stringify(this.options)}`);
        }
        for(let i121 = 0; i121 < this.options.length; i121++){
            if (!(this.options[i121] === "i" || this.options[i121] === "m" || this.options[i121] === "x" || this.options[i121] === "l" || this.options[i121] === "s" || this.options[i121] === "u")) {
                throw new BSONError1(`The regular expression option [${this.options[i121]}] is not supported`);
            }
        }
    }
    static parseOptions(options) {
        return options ? options.split("").sort().join("") : "";
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new BSONRegExp("${this.pattern}")`;
    }
}
const VALIDATION_REGEX1 = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15})$/i;
const uuidValidateString1 = (str)=>typeof str === "string" && VALIDATION_REGEX1.test(str)
;
const uuidHexStringToBuffer1 = (hexString)=>{
    if (!uuidValidateString1(hexString)) {
        throw new BSONTypeError1('UUID string representations must be a 32 or 36 character hex string (dashes excluded/included). Format: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" or "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".');
    }
    const sanitizedHexString = hexString.replace(/-/g, "");
    return decodeHexString1(sanitizedHexString);
};
const hexTable3 = new TextEncoder().encode("0123456789abcdef");
const textDecoder6 = new TextDecoder();
const bufferToUuidHexString1 = (bytes, includeDashes = true)=>{
    if (!includeDashes) return encodeHexString1(bytes);
    const dst = new Uint8Array(36);
    let srcIndex = 0;
    let dstIndex = 0;
    while(srcIndex < bytes.length){
        if (dstIndex === 8 || dstIndex === 13 || dstIndex === 18 || dstIndex === 23) {
            dst[dstIndex] = 45;
            dstIndex++;
            continue;
        }
        const v = bytes[srcIndex];
        dst[dstIndex] = hexTable3[v >> 4];
        dst[dstIndex + 1] = hexTable3[v & 15];
        dstIndex += 2;
        srcIndex++;
    }
    return textDecoder6.decode(dst);
};
var BinarySizes1;
(function(BinarySizes3) {
    BinarySizes3[BinarySizes3["BUFFER_SIZE"] = 256] = "BUFFER_SIZE";
    BinarySizes3[BinarySizes3["SUBTYPE_DEFAULT"] = 0] = "SUBTYPE_DEFAULT";
    BinarySizes3[BinarySizes3["SUBTYPE_FUNCTION"] = 1] = "SUBTYPE_FUNCTION";
    BinarySizes3[BinarySizes3["SUBTYPE_BYTE_ARRAY"] = 2] = "SUBTYPE_BYTE_ARRAY";
    BinarySizes3[BinarySizes3["SUBTYPE_UUID"] = 4] = "SUBTYPE_UUID";
    BinarySizes3[BinarySizes3["SUBTYPE_MD5"] = 5] = "SUBTYPE_MD5";
    BinarySizes3[BinarySizes3["SUBTYPE_ENCRYPTED"] = 6] = "SUBTYPE_ENCRYPTED";
    BinarySizes3[BinarySizes3["SUBTYPE_COLUMN"] = 7] = "SUBTYPE_COLUMN";
    BinarySizes3[BinarySizes3["SUBTYPE_USER_DEFINE"] = 128] = "SUBTYPE_USER_DEFINE";
    BinarySizes3[BinarySizes3["BSON_BINARY_SUBTYPE_DEFAULT"] = 0] = "BSON_BINARY_SUBTYPE_DEFAULT";
})(BinarySizes1 || (BinarySizes1 = {}));
const textDecoder7 = new TextDecoder();
class Binary1 {
    buffer;
    subType;
    constructor(buffer54, subType = BinarySizes1.BSON_BINARY_SUBTYPE_DEFAULT){
        this.buffer = buffer54;
        this.subType = subType;
    }
    length() {
        return this.buffer.length;
    }
    toJSON() {
        return mod5.encode(this.buffer);
    }
    toString() {
        return textDecoder7.decode(this.buffer);
    }
    toUUID() {
        if (this.subType === BinarySizes1.SUBTYPE_UUID) {
            return new UUID1(this.buffer);
        }
        throw new BSONError1(`Binary sub_type "${this.subType}" is not supported for converting to UUID. Only "${BinarySizes1.SUBTYPE_UUID}" is currently supported.`);
    }
    [Symbol.for("Deno.customInspect")]() {
        if (this.subType === BinarySizes1.SUBTYPE_DEFAULT) {
            return `new Binary(${Deno.inspect(this.buffer)})`;
        }
        return `new Binary(${Deno.inspect(this.buffer)}, ${this.subType})`;
    }
}
class UUID1 {
    static cacheHexString;
    #bytesBuffer;
    #id;
    constructor(input){
        if (typeof input === "undefined") {
            this.id = UUID1.generate();
        } else if (input instanceof UUID1) {
            this.#bytesBuffer = input.id;
            this.#id = input.#id;
        } else if (ArrayBuffer.isView(input) && input.byteLength === 16) {
            this.id = input;
        } else if (typeof input === "string") {
            this.id = uuidHexStringToBuffer1(input);
        } else {
            throw new BSONTypeError1("Argument passed in UUID constructor must be a UUID, a 16 byte Buffer or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).");
        }
        this.#bytesBuffer = this.id;
    }
    get id() {
        return this.#bytesBuffer;
    }
    set id(value) {
        this.#bytesBuffer = value;
        if (UUID1.cacheHexString) {
            this.#id = bufferToUuidHexString1(value);
        }
    }
    toHexString(includeDashes = true) {
        if (UUID1.cacheHexString && this.#id) {
            return this.#id;
        }
        const uuidHexString = bufferToUuidHexString1(this.id, includeDashes);
        if (UUID1.cacheHexString) {
            this.#id = uuidHexString;
        }
        return uuidHexString;
    }
    toString() {
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (!otherId) {
            return false;
        }
        if (otherId instanceof UUID1) {
            return equals1(otherId.id, this.id);
        }
        try {
            return equals1(new UUID1(otherId).id, this.id);
        } catch  {
            return false;
        }
    }
    toBinary() {
        return new Binary1(this.id, BinarySizes1.SUBTYPE_UUID);
    }
    static generate() {
        const bytes = randomBytes1(16);
        bytes[6] = bytes[6] & 15 | 64;
        bytes[8] = bytes[8] & 63 | 128;
        return bytes;
    }
    static isValid(input) {
        if (!input) {
            return false;
        }
        if (input instanceof UUID1) {
            return true;
        }
        if (typeof input === "string") {
            return uuidValidateString1(input);
        }
        if (input instanceof Uint8Array) {
            if (input.length !== 16) {
                return false;
            }
            try {
                return parseInt(input[6].toString(16)[0], 10) === BinarySizes1.SUBTYPE_UUID;
            } catch  {
                return false;
            }
        }
        return false;
    }
    static createFromHexString(hexString) {
        const buffer55 = uuidHexStringToBuffer1(hexString);
        return new UUID1(buffer55);
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new UUID("${this.toHexString()}")`;
    }
}
class BSONSymbol1 {
    value;
    constructor(value){
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
    toString() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    [Symbol.for("Deno.customInspect")]() {
        return `new BSONSymbol("${this.value}")`;
    }
}
function validateUtf81(bytes, start, end) {
    let continuation = 0;
    for(let i122 = start; i122 < end; i122 += 1){
        const __byte = bytes[i122];
        if (continuation) {
            if ((__byte & 192) !== 128) {
                return false;
            }
            continuation -= 1;
        } else if (__byte & 128) {
            if ((__byte & 224) === 192) {
                continuation = 1;
            } else if ((__byte & 240) === 224) {
                continuation = 2;
            } else if ((__byte & 248) === 240) {
                continuation = 3;
            } else {
                return false;
            }
        }
    }
    return !continuation;
}
const JS_INT_MAX_LONG1 = Long1.fromNumber(JS_INT_MAX1);
const JS_INT_MIN_LONG1 = Long1.fromNumber(JS_INT_MIN1);
const functionCache1 = {};
function deserialize2(buffer56, options = {}, isArray) {
    const index = options?.index ? options.index : 0;
    const size = buffer56[index] | buffer56[index + 1] << 8 | buffer56[index + 2] << 16 | buffer56[index + 3] << 24;
    if (size < 5) {
        throw new BSONError1(`bson size must be >= 5, is ${size}`);
    }
    if (options.allowObjectSmallerThanBufferSize && buffer56.length < size) {
        throw new BSONError1(`buffer length ${buffer56.length} must be >= bson size ${size}`);
    }
    if (!options.allowObjectSmallerThanBufferSize && buffer56.length !== size) {
        throw new BSONError1(`buffer length ${buffer56.length} must === bson size ${size}`);
    }
    if (size + index > buffer56.byteLength) {
        throw new BSONError1(`(bson size ${size} + options.index ${index} must be <= buffer length ${buffer56.byteLength})`);
    }
    if (buffer56[index + size - 1] !== 0) {
        throw new BSONError1("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
    }
    return deserializeObject1(buffer56, index, options, isArray);
}
const allowedDBRefKeys1 = /^\$ref$|^\$id$|^\$db$/;
function deserializeObject1(buffer57, index, options, isArray = false) {
    const evalFunctions = options.evalFunctions ?? false;
    const cacheFunctions = options.cacheFunctions ?? false;
    const fieldsAsRaw = options.fieldsAsRaw ?? null;
    const raw = options.raw ?? false;
    const bsonRegExp = options.bsonRegExp ?? false;
    const promoteBuffers = options.promoteBuffers ?? false;
    const promoteLongs = options.promoteLongs ?? true;
    const promoteValues = options.promoteValues ?? true;
    const validation = options.validation ?? {
        utf8: true
    };
    let globalUTFValidation = true;
    let validationSetting;
    const utf8KeysSet = new Set();
    const utf8ValidatedKeys = validation.utf8;
    if (typeof utf8ValidatedKeys === "boolean") {
        validationSetting = utf8ValidatedKeys;
    } else {
        globalUTFValidation = false;
        const utf8ValidationValues = Object.keys(utf8ValidatedKeys).map((key)=>utf8ValidatedKeys[key]
        );
        if (utf8ValidationValues.length === 0) {
            throw new BSONError1("UTF-8 validation setting cannot be empty");
        }
        if (typeof utf8ValidationValues[0] !== "boolean") {
            throw new BSONError1("Invalid UTF-8 validation option, must specify boolean values");
        }
        validationSetting = utf8ValidationValues[0];
        if (!utf8ValidationValues.every((item)=>item === validationSetting
        )) {
            throw new BSONError1("Invalid UTF-8 validation option - keys must be all true or all false");
        }
    }
    if (!globalUTFValidation) {
        for (const key of Object.keys(utf8ValidatedKeys)){
            utf8KeysSet.add(key);
        }
    }
    const startIndex = index;
    if (buffer57.length < 5) {
        throw new BSONError1("corrupt bson message < 5 bytes long");
    }
    const size = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
    if (size < 5 || size > buffer57.length) {
        throw new BSONError1("corrupt bson message");
    }
    const object = isArray ? [] : {};
    let arrayIndex = 0;
    let isPossibleDBRef = isArray ? false : null;
    while(!false){
        const elementType = buffer57[index++];
        if (elementType === 0) break;
        let i123 = index;
        while(buffer57[i123] !== 0 && i123 < buffer57.length){
            i123++;
        }
        if (i123 >= buffer57.byteLength) {
            throw new BSONError1("Bad BSON Document: illegal CString");
        }
        const name = isArray ? arrayIndex++ : utf8Slice1(buffer57, index, i123);
        let shouldValidateKey = true;
        shouldValidateKey = globalUTFValidation || utf8KeysSet.has(name) ? validationSetting : !validationSetting;
        if (isPossibleDBRef !== false && name[0] === "$") {
            isPossibleDBRef = allowedDBRefKeys1.test(name);
        }
        let value;
        index = i123 + 1;
        if (elementType === BSONData1.STRING) {
            const stringSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer57.length - index || buffer57[index + stringSize - 1] !== 0) {
                throw new BSONError1("bad string length in bson");
            }
            value = getValidatedString1(buffer57, index, index + stringSize - 1, shouldValidateKey);
            index += stringSize;
        } else if (elementType === BSONData1.OID) {
            const oid = new Uint8Array(12);
            bytesCopy1(oid, 0, buffer57, index, index + 12);
            value = new ObjectId1(oid);
            index += 12;
        } else if (elementType === BSONData1.INT && promoteValues === false) {
            value = new Int321(buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24);
        } else if (elementType === BSONData1.INT) {
            value = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
        } else if (elementType === BSONData1.NUMBER && promoteValues === false) {
            value = new Double1(new DataView(buffer57.buffer, index, 8).getFloat64(0, true));
            index += 8;
        } else if (elementType === BSONData1.NUMBER) {
            value = new DataView(buffer57.buffer, index, 8).getFloat64(0, true);
            index += 8;
        } else if (elementType === BSONData1.DATE) {
            const lowBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            const highBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            value = new Date(new Long1(lowBits, highBits).toNumber());
        } else if (elementType === BSONData1.BOOLEAN) {
            if (buffer57[index] !== 0 && buffer57[index] !== 1) {
                throw new BSONError1("illegal boolean type value");
            }
            value = buffer57[index++] === 1;
        } else if (elementType === BSONData1.OBJECT) {
            const _index = index;
            const objectSize = buffer57[index] | buffer57[index + 1] << 8 | buffer57[index + 2] << 16 | buffer57[index + 3] << 24;
            if (objectSize <= 0 || objectSize > buffer57.length - index) {
                throw new BSONError1("bad embedded document length in bson");
            }
            if (raw) {
                value = buffer57.slice(index, index + objectSize);
            } else {
                let objectOptions = options;
                if (!globalUTFValidation) {
                    objectOptions = {
                        ...options,
                        validation: {
                            utf8: shouldValidateKey
                        }
                    };
                }
                value = deserializeObject1(buffer57, _index, objectOptions, false);
            }
            index += objectSize;
        } else if (elementType === BSONData1.ARRAY) {
            const _index = index;
            const objectSize = buffer57[index] | buffer57[index + 1] << 8 | buffer57[index + 2] << 16 | buffer57[index + 3] << 24;
            let arrayOptions = options;
            const stopIndex = index + objectSize;
            if (fieldsAsRaw && fieldsAsRaw[name]) {
                arrayOptions = {};
                for(const n in options){
                    arrayOptions[n] = options[n];
                }
                arrayOptions.raw = true;
            }
            if (!globalUTFValidation) {
                arrayOptions = {
                    ...arrayOptions,
                    validation: {
                        utf8: shouldValidateKey
                    }
                };
            }
            value = deserializeObject1(buffer57, _index, arrayOptions, true);
            index += objectSize;
            if (buffer57[index - 1] !== 0) {
                throw new BSONError1("invalid array terminator byte");
            }
            if (index !== stopIndex) throw new BSONError1("corrupted array bson");
        } else if (elementType === BSONData1.UNDEFINED) {
            value = undefined;
        } else if (elementType === BSONData1.NULL) {
            value = null;
        } else if (elementType === BSONData1.LONG) {
            const lowBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            const highBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            const __long = new Long1(lowBits, highBits);
            if (promoteLongs && promoteValues === true) {
                value = __long.lessThanOrEqual(JS_INT_MAX_LONG1) && __long.greaterThanOrEqual(JS_INT_MIN_LONG1) ? __long.toNumber() : __long;
            } else {
                value = __long;
            }
        } else if (elementType === BSONData1.DECIMAL128) {
            const bytes = new Uint8Array(16);
            bytesCopy1(bytes, 0, buffer57, index, index + 16);
            index += 16;
            const decimal128 = new Decimal1281(bytes);
            value = "toObject" in decimal128 && typeof decimal128.toObject === "function" ? decimal128.toObject() : decimal128;
        } else if (elementType === BSONData1.BINARY) {
            let binarySize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            const totalBinarySize = binarySize;
            const subType = buffer57[index++];
            if (binarySize < 0) {
                throw new BSONError1("Negative binary type element size found");
            }
            if (binarySize > buffer57.byteLength) {
                throw new BSONError1("Binary type size larger than document size");
            }
            if (buffer57.slice != null) {
                if (subType === BinarySizes1.SUBTYPE_BYTE_ARRAY) {
                    binarySize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
                    if (binarySize < 0) {
                        throw new BSONError1("Negative binary type element size found for subtype 0x02");
                    }
                    if (binarySize > totalBinarySize - 4) {
                        throw new BSONError1("Binary type with subtype 0x02 contains too long binary size");
                    }
                    if (binarySize < totalBinarySize - 4) {
                        throw new BSONError1("Binary type with subtype 0x02 contains too short binary size");
                    }
                }
                value = promoteBuffers && promoteValues ? buffer57.slice(index, index + binarySize) : new Binary1(buffer57.slice(index, index + binarySize), subType);
            } else {
                const _buffer = new Uint8Array(binarySize);
                if (subType === BinarySizes1.SUBTYPE_BYTE_ARRAY) {
                    binarySize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
                    if (binarySize < 0) {
                        throw new BSONError1("Negative binary type element size found for subtype 0x02");
                    }
                    if (binarySize > totalBinarySize - 4) {
                        throw new BSONError1("Binary type with subtype 0x02 contains too long binary size");
                    }
                    if (binarySize < totalBinarySize - 4) {
                        throw new BSONError1("Binary type with subtype 0x02 contains too short binary size");
                    }
                }
                for(i123 = 0; i123 < binarySize; i123++){
                    _buffer[i123] = buffer57[index + i123];
                }
                value = promoteBuffers && promoteValues ? _buffer : new Binary1(_buffer, subType);
            }
            index += binarySize;
        } else if (elementType === BSONData1.REGEXP && bsonRegExp === false) {
            i123 = index;
            while(buffer57[i123] !== 0 && i123 < buffer57.length){
                i123++;
            }
            if (i123 >= buffer57.length) {
                throw new BSONError1("Bad BSON Document: illegal CString");
            }
            const source = utf8Slice1(buffer57, index, i123);
            index = i123 + 1;
            i123 = index;
            while(buffer57[i123] !== 0 && i123 < buffer57.length){
                i123++;
            }
            if (i123 >= buffer57.length) {
                throw new BSONError1("Bad BSON Document: illegal CString");
            }
            const regExpOptions = utf8Slice1(buffer57, index, i123);
            index = i123 + 1;
            const optionsArray = new Array(regExpOptions.length);
            for(i123 = 0; i123 < regExpOptions.length; i123++){
                switch(regExpOptions[i123]){
                    case "m":
                        optionsArray[i123] = "m";
                        break;
                    case "s":
                        optionsArray[i123] = "g";
                        break;
                    case "i":
                        optionsArray[i123] = "i";
                        break;
                }
            }
            value = new RegExp(source, optionsArray.join(""));
        } else if (elementType === BSONData1.REGEXP && bsonRegExp === true) {
            i123 = index;
            while(buffer57[i123] !== 0 && i123 < buffer57.length){
                i123++;
            }
            if (i123 >= buffer57.length) {
                throw new BSONError1("Bad BSON Document: illegal CString");
            }
            const source = utf8Slice1(buffer57, index, i123);
            index = i123 + 1;
            i123 = index;
            while(buffer57[i123] !== 0 && i123 < buffer57.length){
                i123++;
            }
            if (i123 >= buffer57.length) {
                throw new BSONError1("Bad BSON Document: illegal CString");
            }
            const regExpOptions = utf8Slice1(buffer57, index, i123);
            index = i123 + 1;
            value = new BSONRegExp1(source, regExpOptions);
        } else if (elementType === BSONData1.SYMBOL) {
            const stringSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer57.length - index || buffer57[index + stringSize - 1] !== 0) {
                throw new BSONError1("bad string length in bson");
            }
            const symbol = getValidatedString1(buffer57, index, index + stringSize - 1, shouldValidateKey);
            value = promoteValues ? symbol : new BSONSymbol1(symbol);
            index += stringSize;
        } else if (elementType === BSONData1.TIMESTAMP) {
            const lowBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            const highBits = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            value = new Timestamp1(new Long1(lowBits, highBits));
        } else if (elementType === BSONData1.MIN_KEY) {
            value = new MinKey1();
        } else if (elementType === BSONData1.MAX_KEY) {
            value = new MaxKey1();
        } else if (elementType === BSONData1.CODE) {
            const stringSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer57.length - index || buffer57[index + stringSize - 1] !== 0) {
                throw new BSONError1("bad string length in bson");
            }
            const functionString = getValidatedString1(buffer57, index, index + stringSize - 1, shouldValidateKey);
            if (evalFunctions) {
                value = cacheFunctions ? isolateEval1(functionString, functionCache1, object) : isolateEval1(functionString);
            } else {
                value = new Code1(functionString);
            }
            index += stringSize;
        } else if (elementType === BSONData1.CODE_W_SCOPE) {
            const totalSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (totalSize < 4 + 4 + 4 + 1) {
                throw new BSONError1("code_w_scope total size shorter minimum expected length");
            }
            const stringSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer57.length - index || buffer57[index + stringSize - 1] !== 0) {
                throw new BSONError1("bad string length in bson");
            }
            const functionString = getValidatedString1(buffer57, index, index + stringSize - 1, shouldValidateKey);
            index += stringSize;
            const _index = index;
            const objectSize = buffer57[index] | buffer57[index + 1] << 8 | buffer57[index + 2] << 16 | buffer57[index + 3] << 24;
            const scopeObject = deserializeObject1(buffer57, _index, options, false);
            index += objectSize;
            if (totalSize < 4 + 4 + objectSize + stringSize) {
                throw new BSONError1("code_w_scope total size is too short, truncating scope");
            }
            if (totalSize > 4 + 4 + objectSize + stringSize) {
                throw new BSONError1("code_w_scope total size is too long, clips outer document");
            }
            if (evalFunctions) {
                value = cacheFunctions ? isolateEval1(functionString, functionCache1, object) : isolateEval1(functionString);
                value.scope = scopeObject;
            } else {
                value = new Code1(functionString, scopeObject);
            }
        } else if (elementType === BSONData1.DBPOINTER) {
            const stringSize = buffer57[index++] | buffer57[index++] << 8 | buffer57[index++] << 16 | buffer57[index++] << 24;
            if (stringSize <= 0 || stringSize > buffer57.length - index || buffer57[index + stringSize - 1] !== 0) {
                throw new BSONError1("bad string length in bson");
            }
            if (validation?.utf8 && !validateUtf81(buffer57, index, index + stringSize - 1)) {
                throw new BSONError1("Invalid UTF-8 string in BSON document");
            }
            const namespace = utf8Slice1(buffer57, index, index + stringSize - 1);
            index += stringSize;
            const oidBuffer = new Uint8Array(12);
            bytesCopy1(oidBuffer, 0, buffer57, index, index + 12);
            const oid = new ObjectId1(oidBuffer);
            index += 12;
            value = new DBRef1(namespace, oid);
        } else {
            throw new BSONError1(`Detected unknown BSON type ${elementType.toString(16)}` + ' for fieldname "' + name + '"');
        }
        if (name === "__proto__") {
            Object.defineProperty(object, name, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else {
            object[name] = value;
        }
    }
    if (size !== index - startIndex) {
        if (isArray) throw new BSONError1("corrupt array bson");
        throw new BSONError1("corrupt object bson");
    }
    if (!isPossibleDBRef) return object;
    if (isDBRefLike1(object)) {
        const copy8 = Object.assign({}, object);
        delete copy8.$ref;
        delete copy8.$id;
        delete copy8.$db;
        return new DBRef1(object.$ref, object.$id, object.$db, copy8);
    }
    return object;
}
function isolateEval1(functionString, functionCache11, object) {
    if (!functionCache11) return new Function(functionString);
    if (functionCache11[functionString] == null) {
        functionCache11[functionString] = new Function(functionString);
    }
    return functionCache11[functionString].bind(object);
}
function getValidatedString1(buffer58, start, end, shouldValidateUtf8) {
    const value = utf8Slice1(buffer58, start, end);
    if (shouldValidateUtf8) {
        for(let i124 = 0; i124 < value.length; i124++){
            if (value.charCodeAt(i124) === 65533) {
                if (!validateUtf81(buffer58, start, end)) {
                    throw new BSONError1("Invalid UTF-8 string in BSON document");
                }
                break;
            }
        }
    }
    return value;
}
const utf8Encoder2 = new TextEncoder();
const regexp1 = /\x00/;
const MAXSIZE1 = 1024 * 1024 * 17;
let buffer1 = new Uint8Array(MAXSIZE1);
function setInternalBufferSize1(size) {
    if (buffer1.length < size) {
        buffer1 = new Uint8Array(size);
    }
}
const ignoreKeys1 = new Set([
    "$db",
    "$ref",
    "$id",
    "$clusterTime"
]);
function serializeString1(buffer59, key, value, index, isArray) {
    buffer59[index++] = BSONData1.STRING;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer59, key, index, Encoding1.Utf8) : writeToBytes1(buffer59, key, index, Encoding1.Ascii);
    index = index + numberOfWrittenBytes + 1;
    buffer59[index - 1] = 0;
    const size = writeToBytes1(buffer59, value, index + 4, Encoding1.Utf8);
    buffer59[index + 3] = size + 1 >> 24 & 255;
    buffer59[index + 2] = size + 1 >> 16 & 255;
    buffer59[index + 1] = size + 1 >> 8 & 255;
    buffer59[index] = size + 1 & 255;
    index = index + 4 + size;
    buffer59[index++] = 0;
    return index;
}
function serializeNumber1(buffer60, key, value, index, isArray) {
    if (Number.isInteger(value) && value >= BSON_INT32_MIN1 && value <= 2147483647) {
        buffer60[index++] = BSONData1.INT;
        const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer60, key, index, Encoding1.Utf8) : writeToBytes1(buffer60, key, index, Encoding1.Ascii);
        index += numberOfWrittenBytes;
        buffer60[index++] = 0;
        buffer60[index++] = value & 255;
        buffer60[index++] = value >> 8 & 255;
        buffer60[index++] = value >> 16 & 255;
        buffer60[index++] = value >> 24 & 255;
    } else {
        buffer60[index++] = BSONData1.NUMBER;
        const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer60, key, index, Encoding1.Utf8) : writeToBytes1(buffer60, key, index, Encoding1.Ascii);
        index += numberOfWrittenBytes;
        buffer60[index++] = 0;
        writeIEEE7541(buffer60, value, index, "little", 52, 8);
        index += 8;
    }
    return index;
}
function serializeNull1(buffer61, key, _, index, isArray) {
    buffer61[index++] = BSONData1.NULL;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer61, key, index, Encoding1.Utf8) : writeToBytes1(buffer61, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer61[index++] = 0;
    return index;
}
function serializeBoolean1(buffer62, key, value, index, isArray) {
    buffer62[index++] = BSONData1.BOOLEAN;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer62, key, index, Encoding1.Utf8) : writeToBytes1(buffer62, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer62[index++] = 0;
    buffer62[index++] = value ? 1 : 0;
    return index;
}
function serializeDate1(buffer63, key, value, index, isArray) {
    buffer63[index++] = BSONData1.DATE;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer63, key, index, Encoding1.Utf8) : writeToBytes1(buffer63, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer63[index++] = 0;
    const dateInMilis = Long1.fromNumber(value.getTime());
    const lowBits = dateInMilis.getLowBits();
    const highBits = dateInMilis.getHighBits();
    buffer63[index++] = lowBits & 255;
    buffer63[index++] = lowBits >> 8 & 255;
    buffer63[index++] = lowBits >> 16 & 255;
    buffer63[index++] = lowBits >> 24 & 255;
    buffer63[index++] = highBits & 255;
    buffer63[index++] = highBits >> 8 & 255;
    buffer63[index++] = highBits >> 16 & 255;
    buffer63[index++] = highBits >> 24 & 255;
    return index;
}
function serializeRegExp1(buffer64, key, value, index, isArray) {
    buffer64[index++] = BSONData1.REGEXP;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer64, key, index, Encoding1.Utf8) : writeToBytes1(buffer64, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer64[index++] = 0;
    if (value.source && value.source.match(regexp1) != null) {
        throw Error(`value ${value.source} must not contain null bytes`);
    }
    index += writeToBytes1(buffer64, value.source, index, Encoding1.Utf8);
    buffer64[index++] = 0;
    if (value.ignoreCase) buffer64[index++] = 105;
    if (value.global) buffer64[index++] = 115;
    if (value.multiline) buffer64[index++] = 109;
    buffer64[index++] = 0;
    return index;
}
function serializeBSONRegExp1(buffer65, key, value, index, isArray) {
    buffer65[index++] = BSONData1.REGEXP;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer65, key, index, Encoding1.Utf8) : writeToBytes1(buffer65, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer65[index++] = 0;
    if (value.pattern.match(regexp1) != null) {
        throw Error(`pattern ${value.pattern} must not contain null bytes`);
    }
    index += writeToBytes1(buffer65, value.pattern, index, Encoding1.Utf8);
    buffer65[index++] = 0;
    index += writeToBytes1(buffer65, value.options.split("").sort().join(""), index, Encoding1.Utf8);
    buffer65[index++] = 0;
    return index;
}
function serializeMinMax1(buffer66, key, value, index, isArray) {
    if (value === null) {
        buffer66[index++] = BSONData1.NULL;
    } else if (value instanceof MinKey1) {
        buffer66[index++] = BSONData1.MIN_KEY;
    } else {
        buffer66[index++] = BSONData1.MAX_KEY;
    }
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer66, key, index, Encoding1.Utf8) : writeToBytes1(buffer66, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer66[index++] = 0;
    return index;
}
function serializeObjectId1(buffer67, key, value, index, isArray) {
    buffer67[index++] = BSONData1.OID;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer67, key, index, Encoding1.Utf8) : writeToBytes1(buffer67, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer67[index++] = 0;
    if (typeof value.id === "string") {
        writeToBytes1(buffer67, value.id, index, Encoding1.Ascii);
    } else if (value.id instanceof Uint8Array) {
        buffer67.set(value.id.subarray(0, 12), index);
    } else {
        throw new BSONTypeError1(`object [${JSON.stringify(value)}] is not a valid ObjectId`);
    }
    return index + 12;
}
function serializeBuffer1(buffer68, key, value, index, isArray) {
    buffer68[index++] = BSONData1.BINARY;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer68, key, index, Encoding1.Utf8) : writeToBytes1(buffer68, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer68[index++] = 0;
    const size = value.length;
    buffer68[index++] = size & 255;
    buffer68[index++] = size >> 8 & 255;
    buffer68[index++] = size >> 16 & 255;
    buffer68[index++] = size >> 24 & 255;
    buffer68[index++] = BSON_BINARY_SUBTYPE_DEFAULT1;
    buffer68.set(value, index);
    index += size;
    return index;
}
function serializeObject1(buffer69, key, value, index, checkKeys = false, depth = 0, serializeFunctions = false, ignoreUndefined = true, isArray = false, path = []) {
    for(let i125 = 0; i125 < path.length; i125++){
        if (path[i125] === value) throw new BSONError1("cyclic dependency detected");
    }
    path.push(value);
    buffer69[index++] = Array.isArray(value) ? BSONData1.ARRAY : BSONData1.OBJECT;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer69, key, index, Encoding1.Utf8) : writeToBytes1(buffer69, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer69[index++] = 0;
    const endIndex = serializeInto1(buffer69, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
    path.pop();
    return endIndex;
}
function serializeDecimal1281(buffer70, key, value, index, isArray) {
    buffer70[index++] = BSONData1.DECIMAL128;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer70, key, index, Encoding1.Utf8) : writeToBytes1(buffer70, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer70[index++] = 0;
    buffer70.set(value.bytes.subarray(0, 16), index);
    return index + 16;
}
function serializeLong1(buffer71, key, value, index, isArray) {
    buffer71[index++] = value instanceof Timestamp1 ? BSONData1.TIMESTAMP : BSONData1.LONG;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer71, key, index, Encoding1.Utf8) : writeToBytes1(buffer71, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer71[index++] = 0;
    const lowBits = value.getLowBits();
    const highBits = value.getHighBits();
    buffer71[index++] = lowBits & 255;
    buffer71[index++] = lowBits >> 8 & 255;
    buffer71[index++] = lowBits >> 16 & 255;
    buffer71[index++] = lowBits >> 24 & 255;
    buffer71[index++] = highBits & 255;
    buffer71[index++] = highBits >> 8 & 255;
    buffer71[index++] = highBits >> 16 & 255;
    buffer71[index++] = highBits >> 24 & 255;
    return index;
}
function serializeInt321(buffer72, key, value, index, isArray) {
    value = value.valueOf();
    buffer72[index++] = BSONData1.INT;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer72, key, index, Encoding1.Utf8) : writeToBytes1(buffer72, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer72[index++] = 0;
    buffer72[index++] = value & 255;
    buffer72[index++] = value >> 8 & 255;
    buffer72[index++] = value >> 16 & 255;
    buffer72[index++] = value >> 24 & 255;
    return index;
}
function serializeDouble1(buffer73, key, value, index, isArray) {
    buffer73[index++] = BSONData1.NUMBER;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer73, key, index, Encoding1.Utf8) : writeToBytes1(buffer73, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer73[index++] = 0;
    writeIEEE7541(buffer73, value.value, index, "little", 52, 8);
    index += 8;
    return index;
}
function serializeFunction1(buffer74, key, value, index, _checkKeys = false, _depth = 0, isArray) {
    buffer74[index++] = BSONData1.CODE;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer74, key, index, Encoding1.Utf8) : writeToBytes1(buffer74, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer74[index++] = 0;
    const functionString = normalizedFunctionString1(value);
    const size = writeToBytes1(buffer74, functionString, index + 4, Encoding1.Utf8) + 1;
    buffer74[index] = size & 255;
    buffer74[index + 1] = size >> 8 & 255;
    buffer74[index + 2] = size >> 16 & 255;
    buffer74[index + 3] = size >> 24 & 255;
    index = index + 4 + size - 1;
    buffer74[index++] = 0;
    return index;
}
function serializeCode1(buffer75, key, value, index, checkKeys = false, depth = 0, serializeFunctions = false, ignoreUndefined = true, isArray = false) {
    if (value.scope && typeof value.scope === "object") {
        buffer75[index++] = BSONData1.CODE_W_SCOPE;
        const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer75, key, index, Encoding1.Utf8) : writeToBytes1(buffer75, key, index, Encoding1.Ascii);
        index += numberOfWrittenBytes;
        buffer75[index++] = 0;
        let startIndex = index;
        const functionString = typeof value.code === "string" ? value.code : value.code.toString();
        index += 4;
        const codeSize = writeToBytes1(buffer75, functionString, index + 4, Encoding1.Utf8) + 1;
        buffer75[index] = codeSize & 255;
        buffer75[index + 1] = codeSize >> 8 & 255;
        buffer75[index + 2] = codeSize >> 16 & 255;
        buffer75[index + 3] = codeSize >> 24 & 255;
        buffer75[index + 4 + codeSize - 1] = 0;
        index = index + codeSize + 4;
        const endIndex = serializeInto1(buffer75, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined);
        index = endIndex - 1;
        const totalSize = endIndex - startIndex;
        buffer75[startIndex++] = totalSize & 255;
        buffer75[startIndex++] = totalSize >> 8 & 255;
        buffer75[startIndex++] = totalSize >> 16 & 255;
        buffer75[startIndex++] = totalSize >> 24 & 255;
    } else {
        buffer75[index++] = BSONData1.CODE;
        const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer75, key, index, Encoding1.Utf8) : writeToBytes1(buffer75, key, index, Encoding1.Ascii);
        index += numberOfWrittenBytes;
        buffer75[index++] = 0;
        const functionString = value.code.toString();
        const size = writeToBytes1(buffer75, functionString, index + 4, Encoding1.Utf8) + 1;
        buffer75[index] = size & 255;
        buffer75[index + 1] = size >> 8 & 255;
        buffer75[index + 2] = size >> 16 & 255;
        buffer75[index + 3] = size >> 24 & 255;
        index = index + 4 + size - 1;
    }
    buffer75[index++] = 0;
    return index;
}
function serializeBinary1(buffer76, key, value, index, isArray) {
    buffer76[index++] = BSONData1.BINARY;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer76, key, index, Encoding1.Utf8) : writeToBytes1(buffer76, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer76[index++] = 0;
    const data37 = value.buffer;
    let size = value.buffer.length;
    if (value.subType === BinarySizes1.SUBTYPE_BYTE_ARRAY) size += 4;
    buffer76[index++] = size & 255;
    buffer76[index++] = size >> 8 & 255;
    buffer76[index++] = size >> 16 & 255;
    buffer76[index++] = size >> 24 & 255;
    buffer76[index++] = value.subType;
    if (value.subType === BinarySizes1.SUBTYPE_BYTE_ARRAY) {
        size -= 4;
        buffer76[index++] = size & 255;
        buffer76[index++] = size >> 8 & 255;
        buffer76[index++] = size >> 16 & 255;
        buffer76[index++] = size >> 24 & 255;
    }
    buffer76.set(data37, index);
    index += size;
    return index;
}
function serializeSymbol1(buffer77, key, value, index, isArray) {
    buffer77[index++] = BSONData1.SYMBOL;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer77, key, index, Encoding1.Utf8) : writeToBytes1(buffer77, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer77[index++] = 0;
    const size = writeToBytes1(buffer77, value.value, index + 4, Encoding1.Utf8) + 1;
    buffer77[index] = size & 255;
    buffer77[index + 1] = size >> 8 & 255;
    buffer77[index + 2] = size >> 16 & 255;
    buffer77[index + 3] = size >> 24 & 255;
    index = index + 4 + size - 1;
    buffer77[index++] = 0;
    return index;
}
function serializeDBRef1(buffer78, key, value, index, depth, serializeFunctions, isArray) {
    buffer78[index++] = BSONData1.OBJECT;
    const numberOfWrittenBytes = !isArray ? writeToBytes1(buffer78, key, index, Encoding1.Utf8) : writeToBytes1(buffer78, key, index, Encoding1.Ascii);
    index += numberOfWrittenBytes;
    buffer78[index++] = 0;
    let startIndex = index;
    let output = {
        $ref: value.collection,
        $id: value.oid
    };
    if (value.db != null) {
        output.$db = value.db;
    }
    output = Object.assign(output, value.fields);
    const endIndex = serializeInto1(buffer78, output, false, index, depth + 1, serializeFunctions);
    const size = endIndex - startIndex;
    buffer78[startIndex++] = size & 255;
    buffer78[startIndex++] = size >> 8 & 255;
    buffer78[startIndex++] = size >> 16 & 255;
    buffer78[startIndex++] = size >> 24 & 255;
    return endIndex;
}
function serializeInto1(buffer79, object, checkKeys = false, startingIndex = 0, depth = 0, serializeFunctions = false, ignoreUndefined = true, path = []) {
    startingIndex = startingIndex || 0;
    path = path || [];
    path.push(object);
    let index = startingIndex + 4;
    if (Array.isArray(object)) {
        for(let i126 = 0; i126 < object.length; i126++){
            const key = i126.toString();
            let value = object[i126];
            if (value?.toBSON) {
                if (typeof value.toBSON !== "function") {
                    throw new BSONTypeError1("toBSON is not a function");
                }
                value = value.toBSON();
            }
            if (typeof value === "string") {
                index = serializeString1(buffer79, key, value, index, true);
            } else if (typeof value === "number") {
                index = serializeNumber1(buffer79, key, value, index, true);
            } else if (typeof value === "bigint") {
                throw new BSONTypeError1("Unsupported type BigInt, please use Decimal128");
            } else if (typeof value === "boolean") {
                index = serializeBoolean1(buffer79, key, value, index, true);
            } else if (value instanceof Date) {
                index = serializeDate1(buffer79, key, value, index, true);
            } else if (value === undefined) {
                index = serializeNull1(buffer79, key, value, index, true);
            } else if (value === null) {
                index = serializeNull1(buffer79, key, value, index, true);
            } else if (value instanceof ObjectId1) {
                index = serializeObjectId1(buffer79, key, value, index, true);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer1(buffer79, key, value, index, true);
            } else if (value instanceof RegExp) {
                index = serializeRegExp1(buffer79, key, value, index, true);
            } else if (value instanceof Decimal1281) {
                index = serializeDecimal1281(buffer79, key, value, index, true);
            } else if (value instanceof Long1 || value instanceof Timestamp1) {
                index = serializeLong1(buffer79, key, value, index, true);
            } else if (value instanceof Double1) {
                index = serializeDouble1(buffer79, key, value, index, true);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction1(buffer79, key, value, index, checkKeys, depth, true);
            } else if (value instanceof Code1) {
                index = serializeCode1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true);
            } else if (value instanceof Binary1) {
                index = serializeBinary1(buffer79, key, value, index, true);
            } else if (value instanceof BSONSymbol1) {
                index = serializeSymbol1(buffer79, key, value, index, true);
            } else if (value instanceof DBRef1) {
                index = serializeDBRef1(buffer79, key, value, index, depth, serializeFunctions, true);
            } else if (value instanceof BSONRegExp1) {
                index = serializeBSONRegExp1(buffer79, key, value, index, true);
            } else if (value instanceof Int321) {
                index = serializeInt321(buffer79, key, value, index, true);
            } else if (value instanceof MinKey1 || value instanceof MaxKey1) {
                index = serializeMinMax1(buffer79, key, value, index, true);
            } else if (value instanceof Object) {
                index = serializeObject1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, true, path);
            } else {
                throw new BSONTypeError1(`Unrecognized or invalid BSON Type: ${value}`);
            }
        }
    } else if (object instanceof Map) {
        const iterator = object.entries();
        let done = false;
        while(!done){
            const entry = iterator.next();
            done = !!entry.done;
            if (done) continue;
            const key = entry.value[0];
            const value = entry.value[1];
            const type = typeof value;
            if (typeof key === "string" && !ignoreKeys1.has(key)) {
                if (key.match(regexp1) != null) {
                    throw Error(`key ${key} must not contain null bytes`);
                }
                if (checkKeys) {
                    if (key.startsWith("$")) {
                        throw Error(`key ${key} must not start with '$'`);
                    } else if (~key.indexOf(".")) {
                        throw Error(`key ${key} must not contain '.'`);
                    }
                }
            }
            if (type === "string") {
                index = serializeString1(buffer79, key, value, index);
            } else if (type === "number") {
                index = serializeNumber1(buffer79, key, value, index);
            } else if (type === "bigint" || value instanceof BigInt64Array || value instanceof BigUint64Array) {
                throw new BSONTypeError1("Unsupported type BigInt, please use Decimal128");
            } else if (type === "boolean") {
                index = serializeBoolean1(buffer79, key, value, index);
            } else if (value instanceof Date) {
                index = serializeDate1(buffer79, key, value, index);
            } else if (value === null || value === undefined && ignoreUndefined === false) {
                index = serializeNull1(buffer79, key, value, index);
            } else if (value instanceof ObjectId1) {
                index = serializeObjectId1(buffer79, key, value, index);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer1(buffer79, key, value, index);
            } else if (value instanceof RegExp) {
                index = serializeRegExp1(buffer79, key, value, index);
            } else if (type === "object" && value instanceof Object) {
                index = serializeObject1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            } else if (type === "object" && value instanceof Decimal1281) {
                index = serializeDecimal1281(buffer79, key, value, index);
            } else if (value instanceof Long1) {
                index = serializeLong1(buffer79, key, value, index);
            } else if (value instanceof Double1) {
                index = serializeDouble1(buffer79, key, value, index);
            } else if (value instanceof Code1) {
                index = serializeCode1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction1(buffer79, key, value, index, checkKeys, depth, serializeFunctions);
            } else if (value instanceof Binary1) {
                index = serializeBinary1(buffer79, key, value, index);
            } else if (value instanceof BSONSymbol1) {
                index = serializeSymbol1(buffer79, key, value, index);
            } else if (value instanceof DBRef1) {
                index = serializeDBRef1(buffer79, key, value, index, depth, serializeFunctions);
            } else if (value instanceof BSONRegExp1) {
                index = serializeBSONRegExp1(buffer79, key, value, index);
            } else if (value instanceof Int321) {
                index = serializeInt321(buffer79, key, value, index);
            } else if (value instanceof MinKey1 || value instanceof MaxKey1) {
                index = serializeMinMax1(buffer79, key, value, index);
            } else {
                throw new BSONTypeError1(`Unrecognized or invalid BSON TYPE: ${value}`);
            }
        }
    } else {
        if (object.toBSON) {
            if (typeof object.toBSON !== "function") {
                throw new BSONTypeError1("toBSON is not a function");
            }
            object = object.toBSON();
            if (object != null && typeof object !== "object") {
                throw new BSONTypeError1("toBSON function did not return an object");
            }
        }
        for(const key in object){
            let value = object[key];
            if (value?.toBSON) {
                if (typeof value.toBSON !== "function") {
                    throw new BSONTypeError1("toBSON is not a function");
                }
                value = value.toBSON();
            }
            const type = typeof value;
            if (typeof key === "string" && !ignoreKeys1.has(key)) {
                if (key.match(regexp1) != null) {
                    throw Error(`key ${key} must not contain null bytes`);
                }
                if (checkKeys) {
                    if (key.startsWith("$")) {
                        throw Error(`key ${key} must not start with '$'`);
                    } else if (~key.indexOf(".")) {
                        throw Error(`key ${key} must not contain '.'`);
                    }
                }
            }
            if (type === "string") {
                index = serializeString1(buffer79, key, value, index);
            } else if (type === "number") {
                index = serializeNumber1(buffer79, key, value, index);
            } else if (type === "bigint") {
                throw new BSONTypeError1("Unsupported type BigInt, please use Decimal128");
            } else if (type === "boolean") {
                index = serializeBoolean1(buffer79, key, value, index);
            } else if (value instanceof Date) {
                index = serializeDate1(buffer79, key, value, index);
            } else if (value === undefined) {
                if (ignoreUndefined === false) {
                    index = serializeNull1(buffer79, key, value, index);
                }
            } else if (value === null) {
                index = serializeNull1(buffer79, key, value, index);
            } else if (value instanceof ObjectId1) {
                index = serializeObjectId1(buffer79, key, value, index);
            } else if (value instanceof Uint8Array) {
                index = serializeBuffer1(buffer79, key, value, index);
            } else if (value instanceof RegExp) {
                index = serializeRegExp1(buffer79, key, value, index);
            } else if (type === "object" && value instanceof Decimal1281) {
                index = serializeDecimal1281(buffer79, key, value, index);
            } else if (value instanceof Long1 || value instanceof Timestamp1) {
                index = serializeLong1(buffer79, key, value, index);
            } else if (value instanceof Double1) {
                index = serializeDouble1(buffer79, key, value, index);
            } else if (value instanceof Code1) {
                index = serializeCode1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined);
            } else if (typeof value === "function" && serializeFunctions) {
                index = serializeFunction1(buffer79, key, value, index, checkKeys, depth, serializeFunctions);
            } else if (value instanceof Binary1) {
                index = serializeBinary1(buffer79, key, value, index);
            } else if (value instanceof BSONSymbol1) {
                index = serializeSymbol1(buffer79, key, value, index);
            } else if (value instanceof DBRef1) {
                index = serializeDBRef1(buffer79, key, value, index, depth, serializeFunctions);
            } else if (value instanceof BSONRegExp1) {
                index = serializeBSONRegExp1(buffer79, key, value, index);
            } else if (value instanceof Int321) {
                index = serializeInt321(buffer79, key, value, index);
            } else if (value instanceof MinKey1 || value instanceof MaxKey1) {
                index = serializeMinMax1(buffer79, key, value, index);
            } else if (value instanceof Object) {
                index = serializeObject1(buffer79, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, false, path);
            } else {
                throw new BSONTypeError1(`Unrecognized or invalid BSON Type: ${value}`);
            }
        }
    }
    path.pop();
    if (buffer79.length < index) {
        throw new Error("Document exceeds max BSON size");
    }
    buffer79[index++] = 0;
    const size = index - startingIndex;
    buffer79[startingIndex++] = size & 255;
    buffer79[startingIndex++] = size >> 8 & 255;
    buffer79[startingIndex++] = size >> 16 & 255;
    buffer79[startingIndex++] = size >> 24 & 255;
    return index;
}
function serialize1(object, options = {}) {
    const checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    const serializationIndex = serializeInto1(buffer1, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, []);
    const finishedBuffer = new Uint8Array(serializationIndex);
    bytesCopy1(finishedBuffer, 0, buffer1, 0, finishedBuffer.length);
    return finishedBuffer;
}
function serializeWithBufferAndIndex1(object, finalBuffer, options = {}) {
    const checkKeys = typeof options.checkKeys === "boolean" ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    const startIndex = typeof options.index === "number" ? options.index : 0;
    const serializationIndex = serializeInto1(buffer1, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined);
    bytesCopy1(finalBuffer, startIndex, buffer1, 0, serializationIndex);
    return startIndex + serializationIndex - 1;
}
function deserialize3(buffer110, options = {}) {
    return deserialize2(buffer110 instanceof Uint8Array ? buffer110 : new Uint8Array(buffer110), options);
}
function calculateObjectSize2(object, serializeFunctions, ignoreUndefined) {
    let totalLength = 4 + 1;
    if (Array.isArray(object)) {
        for(let i127 = 0; i127 < object.length; i127++){
            totalLength += calculateElement1(i127.toString(), object[i127], serializeFunctions, true, ignoreUndefined);
        }
    } else {
        if (object.toBSON) {
            object = object.toBSON();
        }
        for(const key in object){
            totalLength += calculateElement1(key, object[key], serializeFunctions, false, ignoreUndefined);
        }
    }
    return totalLength;
}
function calculateObjectSize3(object, options = {}) {
    options = options || {};
    const serializeFunctions = typeof options.serializeFunctions === "boolean" ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === "boolean" ? options.ignoreUndefined : true;
    return calculateObjectSize2(object, serializeFunctions, ignoreUndefined);
}
function deserializeStream1(data38, startIndex, numberOfDocuments, documents, docStartIndex, options) {
    const internalOptions = Object.assign({
        allowObjectSmallerThanBufferSize: true,
        index: 0
    }, options);
    const bufferData = data38 instanceof Uint8Array ? data38 : data38 instanceof ArrayBuffer ? new Uint8Array(data38) : new Uint8Array(data38.buffer, data38.byteOffset, data38.byteLength);
    let index = startIndex;
    for(let i128 = 0; i128 < numberOfDocuments; i128++){
        const size = bufferData[index] | bufferData[index + 1] << 8 | bufferData[index + 2] << 16 | bufferData[index + 3] << 24;
        internalOptions.index = index;
        documents[docStartIndex + i128] = deserialize2(bufferData, internalOptions);
        index += size;
    }
    return index;
}
function calculateElement1(name, value, serializeFunctions = false, isArray = false, ignoreUndefined = false) {
    if (value?.toBSON) {
        value = value.toBSON();
    }
    switch(typeof value){
        case "string":
            return 1 + utf8Encoder2.encode(name).length + 1 + 4 + utf8Encoder2.encode(value).length + 1;
        case "number":
            if (Math.floor(value) === value && value >= JS_INT_MIN1 && value <= JS_INT_MAX1) {
                return value >= BSON_INT32_MIN1 && value <= 2147483647 ? (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (4 + 1) : (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (8 + 1);
            } else {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (8 + 1);
            }
        case "undefined":
            if (isArray || !ignoreUndefined) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1;
            }
            return 0;
        case "boolean":
            return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (1 + 1);
        case "object":
            if (value == null || value instanceof MinKey1 || value instanceof MaxKey1) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1;
            } else if (value instanceof ObjectId1) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (12 + 1);
            } else if (value instanceof Date) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (8 + 1);
            } else if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (1 + 4 + 1) + value.byteLength;
            } else if (value instanceof Long1 || value instanceof Double1 || value instanceof Timestamp1) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (8 + 1);
            } else if (value instanceof Decimal1281) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (16 + 1);
            } else if (value instanceof Code1) {
                if (value.scope != null && Object.keys(value.scope).length > 0) {
                    return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + 4 + 4 + utf8Encoder2.encode(value.code.toString()).length + 1 + calculateObjectSize2(value.scope, serializeFunctions, ignoreUndefined);
                }
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + 4 + utf8Encoder2.encode(value.code.toString()).length + 1;
            } else if (value instanceof Binary1) {
                return value.subType === BinarySizes1.SUBTYPE_BYTE_ARRAY ? (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (value.buffer.length + 1 + 4 + 1 + 4) : (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + (value.buffer.length + 1 + 4 + 1);
            } else if (value instanceof BSONSymbol1) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + utf8Encoder2.encode(value.value).length + 4 + 1 + 1;
            } else if (value instanceof DBRef1) {
                const orderedValues = Object.assign({
                    $ref: value.collection,
                    $id: value.oid
                }, value.fields);
                if (value.db != null) {
                    orderedValues.$db = value.db;
                }
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + calculateObjectSize2(orderedValues, serializeFunctions, ignoreUndefined);
            } else if (value instanceof RegExp) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + utf8Encoder2.encode(value.source).length + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
            } else if (value instanceof BSONRegExp1) {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + utf8Encoder2.encode(value.pattern).length + 1 + utf8Encoder2.encode(value.options).length + 1;
            } else {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + calculateObjectSize2(value, serializeFunctions, ignoreUndefined) + 1;
            }
        case "function":
            if (value instanceof RegExp || String.call(value) === "[object RegExp]") {
                return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + utf8Encoder2.encode(value.source).length + 1 + (value.global ? 1 : 0) + (value.ignoreCase ? 1 : 0) + (value.multiline ? 1 : 0) + 1;
            } else {
                if (serializeFunctions && value.scope != null && Object.keys(value.scope).length > 0) {
                    return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + 4 + 4 + utf8Encoder2.encode(normalizedFunctionString1(value)).length + 1 + calculateObjectSize2(value.scope, serializeFunctions, ignoreUndefined);
                }
                if (serializeFunctions) {
                    return (name != null ? utf8Encoder2.encode(name).length + 1 : 0) + 1 + 4 + utf8Encoder2.encode(normalizedFunctionString1(value)).length + 1;
                }
            }
    }
    return 0;
}
const mod6 = function() {
    return {
        LongWithoutOverridesClass: Long1,
        Binary: Binary1,
        BinarySizes: BinarySizes1,
        BSONRegExp: BSONRegExp1,
        BSONSymbol: BSONSymbol1,
        Code: Code1,
        DBRef: DBRef1,
        Decimal128: Decimal1281,
        Double: Double1,
        Int32: Int321,
        Long: Long1,
        MaxKey: MaxKey1,
        MinKey: MinKey1,
        ObjectId: ObjectId1,
        Timestamp: Timestamp1,
        UUID: UUID1,
        setInternalBufferSize: setInternalBufferSize1,
        serialize: serialize1,
        serializeWithBufferAndIndex: serializeWithBufferAndIndex1,
        deserialize: deserialize3,
        calculateObjectSize: calculateObjectSize3,
        deserializeStream: deserializeStream1,
        BSON_INT32_MAX: 2147483647,
        BSON_INT32_MIN: BSON_INT32_MIN1,
        JS_INT_MAX: JS_INT_MAX1,
        JS_INT_MIN: JS_INT_MIN1,
        BSONData: BSONData1,
        BSON_BINARY_SUBTYPE_DEFAULT: 0,
        BSONError: BSONError1,
        BSONTypeError: BSONTypeError1
    };
}();
const data1 = decode5();
const heap1 = new Array(32).fill(undefined);
heap1.push(undefined, null, true, false);
function getObject1(idx) {
    return heap1[idx];
}
let heap_next1 = heap1.length;
function dropObject1(idx) {
    if (idx < 36) return;
    heap1[idx] = heap_next1;
    heap_next1 = idx;
}
function takeObject1(idx) {
    const ret = getObject1(idx);
    dropObject1(idx);
    return ret;
}
function addHeapObject1(obj) {
    if (heap_next1 === heap1.length) heap1.push(heap1.length + 1);
    const idx = heap_next1;
    heap_next1 = heap1[idx];
    heap1[idx] = obj;
    return idx;
}
let cachedTextDecoder1 = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true
});
cachedTextDecoder1.decode();
let cachegetUint8Memory01 = null;
function getUint8Memory01() {
    if (cachegetUint8Memory01 === null || cachegetUint8Memory01.buffer !== wasm4.memory.buffer) {
        cachegetUint8Memory01 = new Uint8Array(wasm4.memory.buffer);
    }
    return cachegetUint8Memory01;
}
function getStringFromWasm01(ptr, len) {
    return cachedTextDecoder1.decode(getUint8Memory01().subarray(ptr, ptr + len));
}
let WASM_VECTOR_LEN1 = 0;
let cachedTextEncoder1 = new TextEncoder("utf-8");
const encodeString1 = function(arg, view) {
    return cachedTextEncoder1.encodeInto(arg, view);
};
function passStringToWasm01(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder1.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory01().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN1 = buf.length;
        return ptr;
    }
    let len = arg.length;
    let ptr = malloc(len);
    const mem4 = getUint8Memory01();
    let offset116 = 0;
    for(; offset116 < len; offset116++){
        const code22 = arg.charCodeAt(offset116);
        if (code22 > 127) break;
        mem4[ptr + offset116] = code22;
    }
    if (offset116 !== len) {
        if (offset116 !== 0) {
            arg = arg.slice(offset116);
        }
        ptr = realloc(ptr, len, len = offset116 + arg.length * 3);
        const view = getUint8Memory01().subarray(ptr + offset116, ptr + len);
        const ret = encodeString1(arg, view);
        offset116 += ret.written;
    }
    WASM_VECTOR_LEN1 = offset116;
    return ptr;
}
function isLikeNone1(x) {
    return x === undefined || x === null;
}
let cachegetInt32Memory01 = null;
function getInt32Memory01() {
    if (cachegetInt32Memory01 === null || cachegetInt32Memory01.buffer !== wasm4.memory.buffer) {
        cachegetInt32Memory01 = new Int32Array(wasm4.memory.buffer);
    }
    return cachegetInt32Memory01;
}
function getArrayU8FromWasm01(ptr, len) {
    return getUint8Memory01().subarray(ptr / 1, ptr / 1 + len);
}
function digest1(algorithm, data39, length) {
    try {
        const retptr = wasm4.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm01(algorithm, wasm4.__wbindgen_malloc, wasm4.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN1;
        wasm4.digest(retptr, ptr0, len0, addHeapObject1(data39), !isLikeNone1(length), isLikeNone1(length) ? 0 : length);
        var r0 = getInt32Memory01()[retptr / 4 + 0];
        var r1 = getInt32Memory01()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm01(r0, r1).slice();
        wasm4.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally{
        wasm4.__wbindgen_add_to_stack_pointer(16);
    }
}
const DigestContextFinalization1 = new FinalizationRegistry((ptr)=>wasm4.__wbg_digestcontext_free(ptr)
);
class DigestContext1 {
    static __wrap(ptr) {
        const obj = Object.create(DigestContext1.prototype);
        obj.ptr = ptr;
        DigestContextFinalization1.register(obj, obj.ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;
        DigestContextFinalization1.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm4.__wbg_digestcontext_free(ptr);
    }
    constructor(algorithm){
        var ptr0 = passStringToWasm01(algorithm, wasm4.__wbindgen_malloc, wasm4.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN1;
        var ret = wasm4.digestcontext_new(ptr0, len0);
        return DigestContext1.__wrap(ret);
    }
    update(data40) {
        wasm4.digestcontext_update(this.ptr, addHeapObject1(data40));
    }
    digest(length) {
        try {
            const retptr = wasm4.__wbindgen_add_to_stack_pointer(-16);
            wasm4.digestcontext_digest(retptr, this.ptr, !isLikeNone1(length), isLikeNone1(length) ? 0 : length);
            var r0 = getInt32Memory01()[retptr / 4 + 0];
            var r1 = getInt32Memory01()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm01(r0, r1).slice();
            wasm4.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm4.__wbindgen_add_to_stack_pointer(16);
        }
    }
    digestAndReset(length) {
        try {
            const retptr = wasm4.__wbindgen_add_to_stack_pointer(-16);
            wasm4.digestcontext_digestAndReset(retptr, this.ptr, !isLikeNone1(length), isLikeNone1(length) ? 0 : length);
            var r0 = getInt32Memory01()[retptr / 4 + 0];
            var r1 = getInt32Memory01()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm01(r0, r1).slice();
            wasm4.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm4.__wbindgen_add_to_stack_pointer(16);
        }
    }
    digestAndDrop(length) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm4.__wbindgen_add_to_stack_pointer(-16);
            wasm4.digestcontext_digestAndDrop(retptr, ptr, !isLikeNone1(length), isLikeNone1(length) ? 0 : length);
            var r0 = getInt32Memory01()[retptr / 4 + 0];
            var r1 = getInt32Memory01()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm01(r0, r1).slice();
            wasm4.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally{
            wasm4.__wbindgen_add_to_stack_pointer(16);
        }
    }
    reset() {
        wasm4.digestcontext_reset(this.ptr);
    }
    clone() {
        var ret = wasm4.digestcontext_clone(this.ptr);
        return DigestContext1.__wrap(ret);
    }
}
const imports1 = {
    __wbindgen_placeholder__: {
        __wbg_new_a4b61a0f54824cfd: function(arg0, arg1) {
            var ret = new TypeError(getStringFromWasm01(arg0, arg1));
            return addHeapObject1(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject1(arg0);
        },
        __wbg_byteLength_3e250b41a8915757: function(arg0) {
            var ret = getObject1(arg0).byteLength;
            return ret;
        },
        __wbg_byteOffset_4204ecb24a6e5df9: function(arg0) {
            var ret = getObject1(arg0).byteOffset;
            return ret;
        },
        __wbg_buffer_facf0398a281c85b: function(arg0) {
            var ret = getObject1(arg0).buffer;
            return addHeapObject1(ret);
        },
        __wbg_newwithbyteoffsetandlength_4b9b8c4e3f5adbff: function(arg0, arg1, arg2) {
            var ret = new Uint8Array(getObject1(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject1(ret);
        },
        __wbg_length_1eb8fc608a0d4cdb: function(arg0) {
            var ret = getObject1(arg0).length;
            return ret;
        },
        __wbindgen_memory: function() {
            var ret = wasm4.memory;
            return addHeapObject1(ret);
        },
        __wbg_buffer_397eaa4d72ee94dd: function(arg0) {
            var ret = getObject1(arg0).buffer;
            return addHeapObject1(ret);
        },
        __wbg_new_a7ce447f15ff496f: function(arg0) {
            var ret = new Uint8Array(getObject1(arg0));
            return addHeapObject1(ret);
        },
        __wbg_set_969ad0a60e51d320: function(arg0, arg1, arg2) {
            getObject1(arg0).set(getObject1(arg1), arg2 >>> 0);
        },
        __wbindgen_throw: function(arg0, arg1) {
            throw new Error(getStringFromWasm01(arg0, arg1));
        },
        __wbindgen_rethrow: function(arg0) {
            throw takeObject1(arg0);
        }
    }
};
const wasmModule1 = new WebAssembly.Module(data1);
const wasmInstance1 = new WebAssembly.Instance(wasmModule1, imports1);
const wasm4 = wasmInstance1.exports;
const _wasm1 = wasm4;
const _wasmModule1 = wasmModule1;
const _wasmInstance1 = wasmInstance1;
const mod7 = {
    digest: digest1,
    DigestContext: DigestContext1,
    _wasm: _wasm1,
    _wasmModule: _wasmModule1,
    _wasmInstance: _wasmInstance1,
    _wasmBytes: data1
};
const digestAlgorithms1 = [
    "BLAKE2B-256",
    "BLAKE2B-384",
    "BLAKE2B",
    "BLAKE2S",
    "BLAKE3",
    "KECCAK-224",
    "KECCAK-256",
    "KECCAK-384",
    "KECCAK-512",
    "SHA-384",
    "SHA3-224",
    "SHA3-256",
    "SHA3-384",
    "SHA3-512",
    "SHAKE128",
    "SHAKE256",
    "TIGER",
    "RIPEMD-160",
    "SHA-224",
    "SHA-256",
    "SHA-512",
    "MD4",
    "MD5",
    "SHA-1", 
];
const webCrypto1 = ((crypto)=>({
        getRandomValues: crypto.getRandomValues?.bind(crypto),
        randomUUID: crypto.randomUUID?.bind(crypto),
        subtle: {
            decrypt: crypto.subtle?.decrypt?.bind(crypto.subtle),
            deriveBits: crypto.subtle?.deriveBits?.bind(crypto.subtle),
            deriveKey: crypto.subtle?.deriveKey?.bind(crypto.subtle),
            digest: crypto.subtle?.digest?.bind(crypto.subtle),
            encrypt: crypto.subtle?.encrypt?.bind(crypto.subtle),
            exportKey: crypto.subtle?.exportKey?.bind(crypto.subtle),
            generateKey: crypto.subtle?.generateKey?.bind(crypto.subtle),
            importKey: crypto.subtle?.importKey?.bind(crypto.subtle),
            sign: crypto.subtle?.sign?.bind(crypto.subtle),
            unwrapKey: crypto.subtle?.unwrapKey?.bind(crypto.subtle),
            verify: crypto.subtle?.verify?.bind(crypto.subtle),
            wrapKey: crypto.subtle?.wrapKey?.bind(crypto.subtle)
        }
    })
)(globalThis.crypto);
const bufferSourceBytes1 = (data41)=>{
    let bytes;
    if (data41 instanceof Uint8Array) {
        bytes = data41;
    } else if (ArrayBuffer.isView(data41)) {
        bytes = new Uint8Array(data41.buffer, data41.byteOffset, data41.byteLength);
    } else if (data41 instanceof ArrayBuffer) {
        bytes = new Uint8Array(data41);
    }
    return bytes;
};
const stdCrypto1 = ((x)=>x
)({
    ...webCrypto1,
    subtle: {
        ...webCrypto1.subtle,
        async digest (algorithm, data42) {
            const { name , length  } = normalizeAlgorithm1(algorithm);
            const bytes = bufferSourceBytes1(data42);
            if (webCryptoDigestAlgorithms1.includes(name) && bytes) {
                return webCrypto1.subtle.digest(algorithm, bytes);
            } else if (digestAlgorithms1.includes(name)) {
                if (bytes) {
                    return stdCrypto1.subtle.digestSync(algorithm, bytes);
                } else if (data42[Symbol.iterator]) {
                    return stdCrypto1.subtle.digestSync(algorithm, data42);
                } else if (data42[Symbol.asyncIterator]) {
                    const context = new mod7.DigestContext(name);
                    for await (const chunk of data42){
                        const chunkBytes = bufferSourceBytes1(chunk);
                        if (!chunkBytes) {
                            throw new TypeError("data contained chunk of the wrong type");
                        }
                        context.update(chunkBytes);
                    }
                    return context.digestAndDrop(length).buffer;
                } else {
                    throw new TypeError("data must be a BufferSource or [Async]Iterable<BufferSource>");
                }
            } else if (webCrypto1.subtle?.digest) {
                return webCrypto1.subtle.digest(algorithm, data42);
            } else {
                throw new TypeError(`unsupported digest algorithm: ${algorithm}`);
            }
        },
        digestSync (algorithm, data43) {
            algorithm = normalizeAlgorithm1(algorithm);
            const bytes = bufferSourceBytes1(data43);
            if (bytes) {
                return mod7.digest(algorithm.name, bytes, algorithm.length).buffer;
            } else if (data43[Symbol.iterator]) {
                const context = new mod7.DigestContext(algorithm.name);
                for (const chunk of data43){
                    const chunkBytes = bufferSourceBytes1(chunk);
                    if (!chunkBytes) {
                        throw new TypeError("data contained chunk of the wrong type");
                    }
                    context.update(chunkBytes);
                }
                return context.digestAndDrop(algorithm.length).buffer;
            } else {
                throw new TypeError("data must be a BufferSource or Iterable<BufferSource>");
            }
        }
    }
});
const webCryptoDigestAlgorithms1 = [
    "SHA-384",
    "SHA-256",
    "SHA-512",
    "SHA-1", 
];
const normalizeAlgorithm1 = (algorithm)=>typeof algorithm === "string" ? {
        name: algorithm.toUpperCase()
    } : {
        ...algorithm,
        name: algorithm.name.toUpperCase()
    }
;
class DenoStdInternalError2 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert2(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError2(msg);
    }
}
const MIN_BUF_SIZE2 = 16;
const CR2 = "\r".charCodeAt(0);
const LF2 = "\n".charCodeAt(0);
class BufferFullError2 extends Error {
    partial;
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError2 extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader2 {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader2 ? r : new BufReader2(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE2;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i129 = 100; i129 > 0; i129--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert2(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr = await this.#rd.read(p);
                const nread = rr ?? 0;
                assert2(nread >= 0, "negative read");
                return rr;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert2(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy3(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError2();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError2) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError2();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer80 = await this.readSlice(delim.charCodeAt(0));
        if (buffer80 === null) return null;
        return new TextDecoder().decode(buffer80);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF2);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let partial;
            if (err instanceof PartialReadError2) {
                partial = err.partial;
                assert2(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError2)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR2) {
                assert2(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF2) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR2) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i130 = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i130 >= 0) {
                i130 += s;
                slice = this.#buf.subarray(this.#r, this.#r + i130 + 1);
                this.#r += i130 + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError2(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError2) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError2();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n6) {
        if (n6 < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n6 && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError2) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError2();
                    e.partial = this.#buf.subarray(this.#r, this.#w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n6 && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n6) {
            throw new BufferFullError2(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n6);
    }
}
class AbstractBufBase2 {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter2 extends AbstractBufBase2 {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter2 ? writer : new BufWriter2(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data44) {
        if (this.err !== null) throw this.err;
        if (data44.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data44.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data44);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy3(data44, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data44 = data44.subarray(numBytesWritten);
        }
        numBytesWritten = copy3(data44, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync2 extends AbstractBufBase2 {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync2 ? writer : new BufWriterSync2(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data45) {
        if (this.err !== null) throw this.err;
        if (data45.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data45.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data45);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy3(data45, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data45 = data45.subarray(numBytesWritten);
        }
        numBytesWritten = copy3(data45, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
async function writeAll(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += await w.write(arr.subarray(nwritten));
    }
}
const { Deno: Deno3  } = globalThis;
typeof Deno3?.noColor === "boolean" ? Deno3.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType2;
(function(DiffType6) {
    DiffType6["removed"] = "removed";
    DiffType6["common"] = "common";
    DiffType6["added"] = "added";
})(DiffType2 || (DiffType2 = {}));
BigInt(Number.MAX_SAFE_INTEGER);
new TextDecoder();
function deferred() {
    let methods;
    let state5 = "pending";
    const promise = new Promise((resolve, reject)=>{
        methods = {
            async resolve (value) {
                await value;
                state5 = "fulfilled";
                resolve(value);
            },
            reject (reason) {
                state5 = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", {
        get: ()=>state5
    });
    return Object.assign(promise, methods);
}
class MongoError extends Error {
    constructor(info){
        super(`MongoError: ${JSON.stringify(info)}`);
    }
}
class MongoDriverError extends MongoError {
    constructor(info){
        super(info);
    }
}
class MongoServerError extends MongoError {
    ok;
    errmsg;
    code;
    codeName;
    constructor(info){
        super(info);
        this.ok = info.ok;
        this.errmsg = info.errmsg;
        this.code = info.code;
        this.codeName = info.codeName;
    }
}
class MongoInvalidArgumentError extends MongoError {
    constructor(info){
        super(info);
    }
}
function parseNamespace(ns) {
    const [db, ...rest] = ns.split(".");
    return {
        db,
        collection: rest.join(".")
    };
}
class CommandCursor {
    #id;
    #protocol;
    #batches = [];
    #db;
    #collection;
    #executor;
    #executed = false;
    constructor(protocol, executor){
        this.#protocol = protocol;
        this.#executor = executor;
    }
    async execute() {
        this.#executed = true;
        const options = await this.#executor();
        this.#batches = options.firstBatch;
        this.#id = BigInt(options.id);
        const { db , collection  } = parseNamespace(options.ns);
        this.#db = db;
        this.#collection = collection;
    }
    async next() {
        if (this.#batches.length > 0) {
            return this.#batches.shift();
        }
        if (!this.#executed) {
            await this.execute();
            return this.#batches.shift();
        }
        if (this.#id === 0n) {
            return undefined;
        }
        const { cursor  } = await this.#protocol.commandSingle(this.#db, {
            getMore: mod6.Long.fromBigInt(this.#id),
            collection: this.#collection
        });
        this.#batches = cursor.nextBatch || [];
        this.#id = BigInt(cursor.id.toString());
        return this.#batches.shift();
    }
    async *[Symbol.asyncIterator]() {
        while(this.#batches.length > 0 || this.#id !== 0n){
            const value = await this.next();
            if (value !== undefined) {
                yield value;
            }
        }
    }
    async forEach(callback) {
        let index = 0;
        for await (const item of this){
            if (item) {
                callback(item, index++);
            }
        }
    }
    async map(callback) {
        let index = 0;
        const result = [];
        for await (const item of this){
            if (item) {
                const newItem = callback(item, index++);
                result.push(newItem);
            }
        }
        return result;
    }
    toArray() {
        return this.map((item)=>item
        );
    }
}
class AggregateCursor extends CommandCursor {
    #context;
    async executor() {
        const { dbName , pipeline , collectionName , protocol , options  } = this.#context;
        const { cursor  } = await protocol.commandSingle(dbName, {
            aggregate: collectionName,
            pipeline,
            cursor: {
                batchSize: options?.batchSize || 1000
            },
            ...options
        });
        return {
            ...cursor,
            id: cursor.id.toString()
        };
    }
    constructor(context){
        super(context.protocol, ()=>this.executor()
        );
        this.#context = context;
    }
}
const driverMetadata = {
    driver: {
        name: "Deno Mongo",
        version: "v0.0.1"
    },
    os: {
        type: Deno.build.os,
        name: Deno.build.os,
        architecture: Deno.build.arch
    }
};
async function handshake(protocol) {
    const reply = await protocol.commandSingle("admin", {
        isMaster: true,
        client: driverMetadata
    });
    return reply;
}
var OpCode1;
(function(OpCode3) {
    OpCode3[OpCode3["REPLAY"] = 1] = "REPLAY";
    OpCode3[OpCode3["UPDATE"] = 2001] = "UPDATE";
    OpCode3[OpCode3["INSERT"] = 2002] = "INSERT";
    OpCode3[OpCode3["RESERVED"] = 2003] = "RESERVED";
    OpCode3[OpCode3["QUERY"] = 2004] = "QUERY";
    OpCode3[OpCode3["GET_MORE"] = 2005] = "GET_MORE";
    OpCode3[OpCode3["DELETE"] = 2006] = "DELETE";
    OpCode3[OpCode3["KILL_CURSORS"] = 2007] = "KILL_CURSORS";
    OpCode3[OpCode3["MSG"] = 2013] = "MSG";
})(OpCode1 || (OpCode1 = {}));
function setHeader(view, header) {
    view.setInt32(0, header.messageLength, true);
    view.setInt32(4, header.requestId, true);
    view.setInt32(8, header.responseTo, true);
    view.setInt32(12, header.opCode, true);
}
function parseHeader(buffer81) {
    const view = new DataView(buffer81.buffer);
    return {
        messageLength: view.getUint32(0, true),
        requestId: view.getUint32(4, true),
        responseTo: view.getUint32(8, true),
        opCode: view.getUint32(12, true)
    };
}
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function serializeSections(sections) {
    let totalLen = 0;
    const buffers = sections.map((section)=>{
        if ("document" in section) {
            const document = mod6.serialize(section.document);
            const section0 = new Uint8Array(1 + document.byteLength);
            new DataView(section0.buffer).setUint8(0, 0);
            section0.set(document, 1);
            totalLen += section0.byteLength;
            return section0;
        } else {
            const identifier = encoder.encode(section.identifier + "\0");
            let documentsLength = 0;
            const docs = section.documents.map((doc)=>{
                const document = mod6.serialize(doc);
                documentsLength += document.byteLength;
                return document;
            });
            const section1 = new Uint8Array(1 + 4 + identifier.byteLength + documentsLength);
            const view = new DataView(section1.buffer);
            view.setUint8(0, 1);
            view.setUint32(1, section1.byteLength - 1, true);
            let pos = 4;
            for (const doc1 of docs){
                section1.set(doc1, pos);
                pos += doc1.byteLength;
            }
            totalLen += section1.byteLength;
            return section1;
        }
    });
    return {
        length: totalLen,
        sections: buffers
    };
}
function serializeMessage(message) {
    const { length: sectionsLength , sections  } = serializeSections(message.sections);
    const buffer82 = new Uint8Array(20 + sectionsLength);
    const view = new DataView(buffer82.buffer);
    setHeader(view, {
        messageLength: buffer82.byteLength,
        responseTo: message.responseTo,
        requestId: message.requestId,
        opCode: OpCode1.MSG
    });
    view.setInt32(16, message.flags ?? 0, true);
    let pos = 20;
    for (const section of sections){
        buffer82.set(section, pos);
        pos += section.byteLength;
    }
    return buffer82;
}
function deserializeMessage(header, buffer83) {
    const view = new DataView(buffer83.buffer);
    const flags = view.getInt32(0);
    const sections = [];
    let pos = 4;
    while(pos < view.byteLength){
        const kind = view.getInt8(pos);
        pos++;
        if (kind === 0) {
            const docLen = view.getInt32(pos, true);
            const document = mod6.deserialize(new Uint8Array(view.buffer.slice(pos, pos + docLen)));
            pos += docLen;
            sections.push({
                document
            });
        } else if (kind === 1) {
            const len = view.getInt32(pos, true);
            const sectionBody = new Uint8Array(view.buffer.slice(pos + 4, pos + len - 4));
            const identifierEndPos = sectionBody.findIndex((__byte)=>__byte === 0
            );
            const identifier = decoder.decode(buffer83.slice(0, identifierEndPos));
            const docsBuffer = sectionBody.slice(identifierEndPos + 1);
            const documents = parseDocuments(docsBuffer);
            pos += len;
            sections.push({
                identifier,
                documents
            });
        } else {
            throw new Error("Invalid section kind: " + kind);
        }
    }
    return {
        responseTo: header.responseTo,
        requestId: header.requestId,
        flags,
        sections
    };
}
function parseDocuments(buffer84) {
    let pos = 0;
    const docs = [];
    const view = new DataView(buffer84);
    while(pos < buffer84.byteLength){
        const docLen = view.getInt32(pos, true);
        const doc = mod6.deserialize(buffer84.slice(pos, pos + docLen));
        docs.push(doc);
        pos += docLen;
    }
    return docs;
}
let nextRequestId = 0;
class WireProtocol {
    #socket;
    #isPendingResponse = false;
    #isPendingRequest = false;
    #pendingResponses = new Map();
    #reader;
    #commandQueue = [];
    constructor(socket){
        this.#socket = socket;
        this.#reader = new BufReader2(this.#socket);
    }
    async connect() {
        const { connectionId: _connectionId  } = await handshake(this);
    }
    async commandSingle(db, body) {
        const [doc] = await this.command(db, body);
        if (doc.ok === 0) {
            throw new MongoServerError(doc);
        }
        return doc;
    }
    async command(db, body) {
        const requestId = nextRequestId++;
        const commandTask = {
            requestId,
            db,
            body
        };
        this.#commandQueue.push(commandTask);
        this.send();
        const pendingMessage = deferred();
        this.#pendingResponses.set(requestId, pendingMessage);
        this.receive();
        const message = await pendingMessage;
        let documents = [];
        for (const section of message?.sections){
            if ("document" in section) {
                documents.push(section.document);
            } else {
                documents = documents.concat(section.documents);
            }
        }
        return documents;
    }
    async send() {
        if (this.#isPendingRequest) return;
        this.#isPendingRequest = true;
        while(this.#commandQueue.length > 0){
            const task = this.#commandQueue.shift();
            const buffer85 = serializeMessage({
                requestId: task.requestId,
                responseTo: 0,
                sections: [
                    {
                        document: {
                            ...task.body,
                            $db: task.db
                        }
                    }, 
                ]
            });
            await writeAll(this.#socket, buffer85);
        }
        this.#isPendingRequest = false;
    }
    async receive() {
        if (this.#isPendingResponse) return;
        this.#isPendingResponse = true;
        while(this.#pendingResponses.size > 0){
            const headerBuffer = await this.#reader.readFull(new Uint8Array(16));
            if (!headerBuffer) throw new MongoDriverError("Invalid response header");
            const header = parseHeader(headerBuffer);
            const bodyBuffer = await this.#reader.readFull(new Uint8Array(header.messageLength - 16));
            if (!bodyBuffer) throw new MongoDriverError("Invalid response body");
            const reply = deserializeMessage(header, bodyBuffer);
            const pendingMessage = this.#pendingResponses.get(header.responseTo);
            this.#pendingResponses.delete(header.responseTo);
            pendingMessage?.resolve(reply);
        }
        this.#isPendingResponse = false;
    }
}
class FindCursor extends CommandCursor {
    #context;
    async executor() {
        const { protocol , filter , dbName , collectionName , options  } = this.#context;
        const { cursor  } = await protocol.commandSingle(dbName, {
            find: collectionName,
            filter,
            batchSize: 1,
            noCursorTimeout: false,
            ...options
        });
        return {
            ...cursor,
            id: cursor.id.toString()
        };
    }
    constructor(context){
        super(context.protocol, ()=>this.executor()
        );
        this.#context = {
            ...context,
            options: {
                ...context.options
            }
        };
    }
    limit(limit) {
        this.#context.options.limit = limit;
        return this;
    }
    skip(skip) {
        this.#context.options.skip = skip;
        return this;
    }
    sort(sort) {
        this.#context.options.sort = sort;
        return this;
    }
}
class ListIndexesCursor extends CommandCursor {
    #context;
    async executor() {
        const { protocol , dbName , collectionName  } = this.#context;
        const { cursor  } = await protocol.commandSingle(dbName, {
            listIndexes: collectionName
        });
        return {
            ...cursor,
            id: cursor.id.toString()
        };
    }
    constructor(context){
        super(context.protocol, ()=>this.executor()
        );
        this.#context = context;
    }
}
async function update(protocol, dbName, collectionName, query, doc, options) {
    const { n , nModified , upserted  } = await protocol.commandSingle(dbName, {
        update: collectionName,
        updates: [
            {
                q: query,
                u: doc,
                upsert: options?.upsert ?? false,
                multi: options?.multi ?? true,
                collation: options?.collation,
                arrayFilters: options?.arrayFilters,
                hint: options?.hint
            }, 
        ],
        writeConcern: options?.writeConcern,
        ordered: options?.ordered ?? true,
        bypassDocumentValidation: options?.bypassDocumentValidation,
        comment: options?.comment
    });
    return {
        upsertedIds: upserted?.map((id)=>id._id
        ),
        upsertedCount: upserted?.length ?? 0,
        modifiedCount: nModified,
        matchedCount: n
    };
}
class Collection1 {
    name;
    #protocol;
    #dbName;
    constructor(protocol, dbName, name){
        this.name = name;
        this.#protocol = protocol;
        this.#dbName = dbName;
    }
    find(filter, options) {
        return new FindCursor({
            filter,
            protocol: this.#protocol,
            collectionName: this.name,
            dbName: this.#dbName,
            options: options ?? {}
        });
    }
    findOne(filter, options) {
        const cursor = this.find(filter, options);
        return cursor.next();
    }
    async findAndModify(filter, options) {
        const result = await this.#protocol.commandSingle(this.#dbName, {
            findAndModify: this.name,
            query: filter,
            ...options
        });
        if (result.ok === 0) {
            throw new MongoDriverError("Could not execute findAndModify operation");
        }
        return result.value;
    }
    async count(filter, options) {
        const res = await this.#protocol.commandSingle(this.#dbName, {
            count: this.name,
            query: filter,
            ...options
        });
        const { n , ok  } = res;
        if (ok === 1) {
            return n;
        } else {
            return 0;
        }
    }
    async countDocuments(filter, options) {
        const pipeline = [];
        if (filter) {
            pipeline.push({
                $match: filter
            });
        }
        if (typeof options?.skip === "number") {
            pipeline.push({
                $skip: options.limit
            });
            delete options.skip;
        }
        if (typeof options?.limit === "number") {
            pipeline.push({
                $limit: options.limit
            });
            delete options.limit;
        }
        pipeline.push({
            $group: {
                _id: 1,
                n: {
                    $sum: 1
                }
            }
        });
        const result = await this.aggregate(pipeline, options).next();
        if (result) return result.n;
        return 0;
    }
    async estimatedDocumentCount() {
        const pipeline = [
            {
                $collStats: {
                    count: {}
                }
            },
            {
                $group: {
                    _id: 1,
                    n: {
                        $sum: "$count"
                    }
                }
            }, 
        ];
        const result = await this.aggregate(pipeline).next();
        if (result) return result.n;
        return 0;
    }
    async insertOne(doc, options) {
        const { insertedIds  } = await this.insertMany([
            doc
        ], options);
        return insertedIds[0];
    }
    insert(docs, options) {
        docs = Array.isArray(docs) ? docs : [
            docs
        ];
        return this.insertMany(docs, options);
    }
    async insertMany(docs, options) {
        const insertedIds = docs.map((doc)=>{
            if (!doc._id) {
                doc._id = new mod6.ObjectId();
            }
            return doc._id;
        });
        const res = await this.#protocol.commandSingle(this.#dbName, {
            insert: this.name,
            documents: docs,
            ordered: options?.ordered ?? true,
            writeConcern: options?.writeConcern,
            bypassDocumentValidation: options?.bypassDocumentValidation,
            comment: options?.comment
        });
        const { writeErrors  } = res;
        if (writeErrors) {
            const [{ errmsg  }] = writeErrors;
            throw new Error(errmsg);
        }
        return {
            insertedIds,
            insertedCount: res.n
        };
    }
    async updateOne(filter, update1, options) {
        const { upsertedIds =[] , upsertedCount , matchedCount , modifiedCount ,  } = await this.updateMany(filter, update1, {
            ...options,
            multi: false
        });
        return {
            upsertedId: upsertedIds?.[0],
            upsertedCount,
            matchedCount,
            modifiedCount
        };
    }
    updateMany(filter, doc, options) {
        if (!hasAtomicOperators(doc)) {
            throw new MongoInvalidArgumentError("Update document requires atomic operators");
        }
        return update(this.#protocol, this.#dbName, this.name, filter, doc, {
            ...options,
            multi: options?.multi ?? true
        });
    }
    async replaceOne(filter, replacement, options) {
        if (hasAtomicOperators(replacement)) {
            throw new MongoInvalidArgumentError("Replacement document must not contain atomic operators");
        }
        const { upsertedIds =[] , upsertedCount , matchedCount , modifiedCount  } = await update(this.#protocol, this.#dbName, this.name, filter, replacement, {
            ...options,
            multi: false
        });
        return {
            upsertedId: upsertedIds?.[0],
            upsertedCount,
            matchedCount,
            modifiedCount
        };
    }
    async deleteMany(filter, options) {
        const res = await this.#protocol.commandSingle(this.#dbName, {
            delete: this.name,
            deletes: [
                {
                    q: filter,
                    limit: options?.limit ?? 0,
                    collation: options?.collation,
                    hint: options?.hint,
                    comment: options?.comment
                }, 
            ],
            ordered: options?.ordered ?? true,
            writeConcern: options?.writeConcern
        });
        return res.n;
    }
    delete = this.deleteMany;
    deleteOne(filter, options) {
        return this.delete(filter, {
            ...options,
            limit: 1
        });
    }
    async drop(options) {
        await this.#protocol.commandSingle(this.#dbName, {
            drop: this.name,
            ...options
        });
    }
    async distinct(key, query, options) {
        const { values  } = await this.#protocol.commandSingle(this.#dbName, {
            distinct: this.name,
            key,
            query,
            ...options
        });
        return values;
    }
    aggregate(pipeline, options) {
        return new AggregateCursor({
            pipeline,
            protocol: this.#protocol,
            dbName: this.#dbName,
            collectionName: this.name,
            options
        });
    }
    async createIndexes(options) {
        const res = await this.#protocol.commandSingle(this.#dbName, {
            createIndexes: this.name,
            ...options
        });
        return res;
    }
    async dropIndexes(options) {
        const res = await this.#protocol.commandSingle(this.#dbName, {
            dropIndexes: this.name,
            ...options
        });
        return res;
    }
    listIndexes() {
        return new ListIndexesCursor({
            protocol: this.#protocol,
            dbName: this.#dbName,
            collectionName: this.name
        });
    }
}
function hasAtomicOperators(doc) {
    if (Array.isArray(doc)) {
        for (const document of doc){
            if (hasAtomicOperators(document)) {
                return true;
            }
        }
        return false;
    }
    const keys = Object.keys(doc);
    return keys.length > 0 && keys[0][0] === "$";
}
class Database {
    name;
    #cluster;
    constructor(cluster, name){
        this.name = name;
        this.#cluster = cluster;
    }
    collection(name) {
        return new Collection1(this.#cluster.protocol, this.name, name);
    }
    listCollections(options = {}) {
        return new CommandCursor(this.#cluster.protocol, async ()=>{
            const { cursor  } = await this.#cluster.protocol.commandSingle(this.name, {
                listCollections: 1,
                ...options
            });
            return {
                id: cursor.id,
                ns: cursor.ns,
                firstBatch: cursor.firstBatch
            };
        });
    }
    async listCollectionNames(options = {}) {
        const cursor = this.listCollections({
            ...options,
            nameOnly: true,
            authorizedCollections: true
        });
        const names = [];
        for await (const item of cursor){
            names.push(item.name);
        }
        return names;
    }
    createUser(username, password, options) {
        return this.#cluster.protocol.commandSingle(this.name, {
            createUser: options?.username ?? username,
            pwd: options?.password ?? password,
            customData: options?.customData,
            roles: options?.roles ?? [],
            writeConcern: options?.writeConcern,
            authenticationRestrictions: options?.authenticationRestrictions,
            mechanisms: options?.mechanisms,
            digestPassword: options?.digestPassword,
            comment: options?.comment
        });
    }
    dropUser(username, options = {}) {
        return this.#cluster.protocol.commandSingle(this.name, {
            dropUser: username,
            writeConcern: options?.writeConcern,
            comment: options?.comment
        });
    }
}
function parse_url(url1) {
    const fragments = [
        "protocol",
        "auth",
        "hostname",
        "port",
        "pathname",
        "search",
        "hash", 
    ];
    const pattern = /([^:/?#]+:)?(?:(?:\/\/)(?:([^/?#]*:?[^@/]+)@)?([^/:?#]+)(?:(?::)(\d+))?)?(\/?[^?#]*)?(\?[^#]*)?(#[^\s]*)?/;
    const multipleServerPattern = /([^:/?#]+:)?(?:(?:\/\/)(?:([^/?#]*:?[^@/]+)@)?((?:(?:[^/:?#]+)(?:(?::)(?:\d+))?)+))?/;
    function parse_simple(url) {
        const parts = {
            servers: [],
            href: url
        };
        const multiServerMatch = url.match(multipleServerPattern);
        if (multiServerMatch[3].includes(",")) {
            const [first31, ...rest] = multiServerMatch[3].split(",");
            const parts = parse_simple(url.replace(multiServerMatch[3], first31));
            for (const serverName of rest){
                const subServer = parse_simple(`temp://${serverName}`);
                parts.servers.push(subServer.servers[0]);
            }
            return parts;
        }
        const matches = url.match(pattern);
        let l = fragments.length;
        while(l--){
            parts[fragments[l]] = matches[l + 1] ? decodeURIComponent(matches[l + 1]) : matches[l + 1];
        }
        parts["servers"] = [
            {
                host: parts["hostname"],
                port: parseInt(parts["port"])
            }, 
        ];
        delete parts["hostname"];
        delete parts["port"];
        parts.path = parts.search ? parts.pathname ? parts.pathname + parts.search : parts.search : parts.pathname;
        return parts;
    }
    function parse1(url) {
        const parsed = parse_simple(url);
        if (parsed.auth) parsed.auth = decodeAuth(parsed.auth);
        parsed.search = parsed.search ? queryString("?", parsed.search) : {};
        parsed.hash = parsed.hash ? queryString("#", parsed.hash) : {};
        return parsed;
    }
    function decodeAuth(auth) {
        const split = auth.split(":");
        return {
            user: split[0],
            password: split[1]
        };
    }
    function queryString(identifier, qs) {
        const obj = {};
        const params = decodeURI(qs || "").replace(new RegExp("\\" + identifier), "").split(/&amp;|&/);
        for (const param of params){
            if (params) {
                let index = param.indexOf("=");
                if (index === -1) index = param.length;
                const key = param.substring(0, index);
                const val = param.substring(index + 1);
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (!Array.isArray(obj[key])) obj[key] = [
                        obj[key]
                    ];
                    obj[key].push(val);
                } else {
                    obj[key] = val || true;
                }
            }
        }
        return obj;
    }
    return parse1(url1);
}
var AllowedOption1;
function isSrvUrl(url) {
    return /^mongodb\+srv/.test(url);
}
function parseSrvUrl(url) {
    const data46 = parse_url(url);
    const defaultAuthDb = data46.pathname && data46.pathname.length > 1 ? data46.pathname.substring(1) : null;
    const authSource = new URLSearchParams(data46.search).get("authSource");
    const connectOptions = {
        db: defaultAuthDb ?? "test"
    };
    if (data46.auth) {
        connectOptions.credential = {
            username: data46.auth.user,
            password: data46.auth.password,
            db: (authSource ?? defaultAuthDb) ?? "admin",
            mechanism: data46.search.authMechanism || "SCRAM-SHA-256"
        };
    }
    connectOptions.compression = data46.search.compressors ? data46.search.compressors.split(",") : [];
    connectOptions.srvServer = data46.servers?.[0].host;
    if (data46.search.appname) {
        connectOptions.appname = data46.search.appname;
    }
    if (data46.search.tls) {
        connectOptions.tls = data46.search.tls === "true";
    } else {
        connectOptions.tls = true;
    }
    if (data46.search.tlsCAFile) {
        connectOptions.certFile = data46.search.tlsCAFile;
    }
    if (data46.search.tlsCertificateKeyFile) {
        connectOptions.keyFile = data46.search.tlsCertificateKeyFile;
    }
    if (data46.search.tlsCertificateKeyFilePassword) {
        connectOptions.keyFilePassword = data46.search.tlsCertificateKeyFilePassword;
    }
    if (data46.search.safe) {
        connectOptions.safe = data46.search.safe === "true";
    }
    if (data46.search.retryWrites) {
        connectOptions.retryWrites = data46.search.retryWrites === "true";
    }
    return connectOptions;
}
(function(AllowedOption3) {
    AllowedOption3["authSource"] = "authSource";
    AllowedOption3["replicaSet"] = "replicaSet";
    AllowedOption3["loadBalanced"] = "loadBalanced";
})(AllowedOption1 || (AllowedOption1 = {}));
function isAllowedOption(key) {
    return Object.values(AllowedOption1).includes(key);
}
class SRVError extends Error {
    constructor(message){
        super(message);
        this.name = "SRVError";
    }
}
class Srv {
    resolver;
    constructor(resolver = {
        resolveDns: Deno.resolveDns
    }){
        this.resolver = resolver;
    }
    async resolveSrvUrl(urlString) {
        const options = parseSrvUrl(urlString);
        const { srvServer , ...connectOptions } = options;
        if (!srvServer) {
            throw new SRVError(`Could not parse srv server address from ${urlString}`);
        }
        const resolveResult = await this.resolve(srvServer);
        return {
            servers: resolveResult.servers,
            ...resolveResult.options,
            ...connectOptions
        };
    }
    async resolve(url) {
        const tokens = url.split(".");
        if (tokens.length < 3) {
            throw new SRVError(`Expected url in format 'host.domain.tld', received ${url}`);
        }
        const srvRecord = await this.resolver.resolveDns(`_mongodb._tcp.${url}`, "SRV");
        if (!(srvRecord?.length > 0)) {
            throw new SRVError(`Expected at least one SRV record, received ${srvRecord?.length} for url ${url}`);
        }
        const txtRecords = await this.resolver.resolveDns(url, "TXT");
        if (txtRecords?.length !== 1) {
            throw new SRVError(`Expected exactly one TXT record, received ${txtRecords?.length} for url ${url}`);
        }
        const servers = srvRecord.map((record)=>{
            return {
                host: record.target,
                port: record.port
            };
        });
        const optionsUri = txtRecords[0].join("");
        const options = {
            valid: {},
            illegal: []
        };
        for (const option of optionsUri.split("&")){
            const [key, value] = option.split("=");
            if (isAllowedOption(key) && !!value) options.valid[key] = value;
            else options.illegal.push(option);
        }
        if (options.illegal.length !== 0) {
            throw new SRVError(`Illegal uri options: ${options.illegal}. Allowed options: ${Object.values(AllowedOption1)}`);
        }
        return {
            servers,
            options: options.valid
        };
    }
}
function parse(url) {
    return isSrvUrl(url) ? new Srv().resolveSrvUrl(url) : Promise.resolve(parseNormalUrl(url));
}
function parseNormalUrl(url) {
    const data47 = parse_url(url);
    const defaultAuthDb = data47.pathname && data47.pathname.length > 1 ? data47.pathname.substring(1) : null;
    const authSource = new URLSearchParams(data47.search).get("authSource");
    const connectOptions = {
        servers: data47.servers,
        db: defaultAuthDb ?? "test"
    };
    for (const server of connectOptions.servers){
        if (server.host.includes(".sock")) {
            server.domainSocket = server.host;
        }
        server.port = server.port || 27017;
    }
    if (data47.auth) {
        connectOptions.credential = {
            username: data47.auth.user,
            password: data47.auth.password,
            db: (authSource ?? defaultAuthDb) ?? "admin",
            mechanism: data47.search.authMechanism || "SCRAM-SHA-256"
        };
    }
    connectOptions.compression = data47.search.compressors ? data47.search.compressors.split(",") : [];
    if (data47.search.appname) {
        connectOptions.appname = data47.search.appname;
    }
    if (data47.search.tls) {
        connectOptions.tls = data47.search.tls === "true";
    }
    if (data47.search.tlsCAFile) {
        connectOptions.certFile = data47.search.tlsCAFile;
    }
    if (data47.search.tlsCertificateKeyFile) {
        connectOptions.keyFile = data47.search.tlsCertificateKeyFile;
    }
    if (data47.search.tlsCertificateKeyFilePassword) {
        connectOptions.keyFilePassword = data47.search.tlsCertificateKeyFilePassword;
    }
    if (data47.search.safe) {
        connectOptions.safe = data47.search.safe === "true";
    }
    return connectOptions;
}
class AuthPlugin {
}
class AuthContext {
    protocol;
    credentials;
    options;
    response;
    nonce;
    constructor(protocol, credentials, options){
        this.protocol = protocol;
        this.credentials = credentials;
        this.options = options;
        this.nonce = globalThis.crypto.getRandomValues(new Uint8Array(24));
    }
}
function grow1(pager, index) {
    while(pager.maxPages < index){
        const old = pager.pages;
        pager.pages = new Array(32768);
        pager.pages[0] = old;
        pager.level++;
        pager.maxPages *= 32768;
    }
}
function truncate1(buf, len) {
    if (buf.length === len) {
        return buf;
    }
    if (buf.length > len) {
        return buf.slice(0, len);
    }
    const cpy = new Uint8Array(len);
    cpy.set(buf, 0);
    return cpy;
}
function concat1(bufs) {
    const total = bufs.reduce((acc, cur)=>acc + cur.byteLength
    , 0);
    const buf = new Uint8Array(total);
    let offset117 = 0;
    for (const b of bufs){
        buf.set(b, offset117);
        offset117 += b.byteLength;
    }
    return buf;
}
function equal1(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((x, i131)=>x === b[i131]
    );
}
function factor1(n, out) {
    n = (n - (out[0] = n & 32767)) / 32768;
    n = (n - (out[1] = n & 32767)) / 32768;
    out[3] = (n - (out[2] = n & 32767)) / 32768 & 32767;
}
function copy4(buf) {
    const cpy = new Uint8Array(buf.length);
    cpy.set(buf, 0);
    return cpy;
}
class Page1 {
    offset;
    buffer;
    updated;
    deduplicate;
    constructor(i132, buf){
        this.offset = i132 * buf.length;
        this.buffer = buf;
        this.updated = false;
        this.deduplicate = 0;
    }
}
class Pager1 {
    pageSize;
    maxPages = 32768;
    pages = new Array(32768);
    length = 0;
    level = 0;
    updates = [];
    path = new Uint16Array(4);
    deduplicate;
    zeros;
    constructor(pageSize, opts = {}){
        this.pageSize = pageSize;
        this.deduplicate = opts.deduplicate || null;
        this.zeros = this.deduplicate ? new Uint8Array(this.deduplicate.length) : null;
    }
    updated(page) {
        while(this.deduplicate && page.buffer[page.deduplicate] === this.deduplicate[page.deduplicate]){
            if (++page.deduplicate === this.deduplicate.length) {
                page.deduplicate = 0;
                if (equal1(page.buffer, this.deduplicate)) {
                    page.buffer = this.deduplicate;
                }
                break;
            }
        }
        if (page.updated || !this.updates) {
            return;
        }
        page.updated = true;
        this.updates.push(page);
    }
    lastUpdate() {
        if (!this.updates || !this.updates.length) {
            return null;
        }
        const page = this.updates.pop();
        page.updated = false;
        return page;
    }
    get(i133, noAllocate) {
        const arr = this._array(i133, !!noAllocate);
        const first32 = this.path[0];
        let page = arr && arr[first32];
        if (!page && !noAllocate) {
            page = arr[first32] = new Page1(i133, new Uint8Array(this.pageSize));
            if (i133 >= this.length) {
                this.length = i133 + 1;
            }
        }
        if (page && page.buffer === this.deduplicate && this.deduplicate && !noAllocate) {
            page.buffer = copy4(page.buffer);
            page.deduplicate = 0;
        }
        return page;
    }
    set(i134, buf) {
        const arr = this._array(i134, false);
        const first33 = this.path[0];
        if (i134 >= this.length) {
            this.length = i134 + 1;
        }
        if (!buf || this.zeros && equal1(buf, this.zeros)) {
            arr[first33] = undefined;
            return;
        }
        if (this.deduplicate && equal1(buf, this.deduplicate)) {
            buf = this.deduplicate;
        }
        const page = arr[first33];
        const b = truncate1(buf, this.pageSize);
        if (page) {
            page.buffer = b;
        } else {
            arr[first33] = new Page1(i134, b);
        }
    }
    toBuffer() {
        const list = new Array(this.length);
        const empty = new Uint8Array(this.pageSize);
        let ptr = 0;
        while(ptr < list.length){
            const arr = this._array(ptr, true);
            for(let i135 = 0; i135 < 32768 && ptr < list.length; i135++){
                list[ptr++] = arr && arr[i135] ? arr[i135].buffer : empty;
            }
        }
        return concat1(list);
    }
    _array(i136, noAllocate) {
        if (i136 >= this.maxPages) {
            if (noAllocate) {
                return [];
            }
            grow1(this, i136);
        }
        factor1(i136, this.path);
        let arr = this.pages;
        for(let j = this.level; j > 0; j--){
            const p = this.path[j];
            let next = arr[p];
            if (!next) {
                if (noAllocate) {
                    return [];
                }
                next = arr[p] = new Array(32768);
            }
            arr = next;
        }
        return arr;
    }
}
function powerOfTwo1(x) {
    return !(x & x - 1);
}
class Bitfield1 {
    pageOffset;
    pageSize;
    pages;
    byteLength;
    length;
    _trackUpdates;
    _pageMask;
    constructor(opts = {}){
        if (opts instanceof Uint8Array) {
            opts = {
                buffer: opts
            };
        }
        this.pageOffset = opts.pageOffset || 0;
        this.pageSize = opts.pageSize || 1024;
        this.pages = opts.pages || new Pager1(this.pageSize);
        this.byteLength = this.pages.length * this.pageSize;
        this.length = 8 * this.byteLength;
        if (!powerOfTwo1(this.pageSize)) {
            throw new Error("The page size should be a power of two");
        }
        this._trackUpdates = !!opts.trackUpdates;
        this._pageMask = this.pageSize - 1;
        if (opts.buffer) {
            for(let i137 = 0; i137 < opts.buffer.length; i137 += this.pageSize){
                this.pages.set(i137 / this.pageSize, opts.buffer.slice(i137, i137 + this.pageSize));
            }
            this.byteLength = opts.buffer.length;
            this.length = 8 * this.byteLength;
        }
    }
    getByte(i138) {
        const o = i138 & this._pageMask;
        const j = (i138 - o) / this.pageSize;
        const page = this.pages.get(j, true);
        return page ? page.buffer[o + this.pageOffset] : 0;
    }
    setByte(i139, b) {
        const o = (i139 & this._pageMask) + this.pageOffset;
        const j = (i139 - o) / this.pageSize;
        const page = this.pages.get(j, false);
        if (page.buffer[o] === b) {
            return false;
        }
        page.buffer[o] = b;
        if (i139 >= this.byteLength) {
            this.byteLength = i139 + 1;
            this.length = this.byteLength * 8;
        }
        if (this._trackUpdates) {
            this.pages.updated(page);
        }
        return true;
    }
    get(i140) {
        const o = i140 & 7;
        const j = (i140 - o) / 8;
        return !!(this.getByte(j) & 128 >> o);
    }
    set(i141, v) {
        const o = i141 & 7;
        const j = (i141 - o) / 8;
        const b = this.getByte(j);
        return this.setByte(j, v ? b | 128 >> o : b & (255 ^ 128 >> o));
    }
    toBuffer() {
        const all = new Uint8Array(this.pages.length * this.pageSize);
        for(let i142 = 0; i142 < this.pages.length; i142++){
            const next = this.pages.get(i142, true);
            if (next) {
                all.subarray(i142 * this.pageSize).set(next.buffer.subarray(this.pageOffset, this.pageOffset + this.pageSize));
            }
        }
        return all;
    }
}
function readUint32BE1(buf, offset1) {
    return buf[offset1 + 0] << 24 | buf[offset1 + 1] << 16 | buf[offset1 + 2] << 8 | buf[offset1 + 3];
}
const mem2 = mod5.decode(`

`.trim());
let offset1 = 0;
function read1() {
    const size = readUint32BE1(mem2, offset1);
    offset1 += 4;
    const codepoints = mem2.slice(offset1, offset1 + size);
    offset1 += size;
    return new Bitfield1({
        buffer: codepoints
    });
}
function loadCodePoints1() {
    return {
        unassigned_code_points: read1(),
        commonly_mapped_to_nothing: read1(),
        non_ASCII_space_characters: read1(),
        prohibited_characters: read1(),
        bidirectional_r_al: read1(),
        bidirectional_l: read1()
    };
}
const { unassigned_code_points: unassigned_code_points1 , commonly_mapped_to_nothing: commonly_mapped_to_nothing1 , non_ASCII_space_characters: non_ASCII_space_characters1 , prohibited_characters: prohibited_characters1 , bidirectional_r_al: bidirectional_r_al1 , bidirectional_l: bidirectional_l1 ,  } = loadCodePoints1();
const mapping2space = non_ASCII_space_characters1;
const mapping2nothing = commonly_mapped_to_nothing1;
function getCodePoint(chr) {
    const codePoint = chr.codePointAt(0);
    if (!codePoint) {
        throw new Error(`unable to encode character ${chr}`);
    }
    return codePoint;
}
function first(x) {
    return x[0];
}
function last(x) {
    return x[x.length - 1];
}
function toCodePoints(input) {
    const codepoints = [];
    const size = input.length;
    for(let i143 = 0; i143 < size; i143 += 1){
        const before = input.charCodeAt(i143);
        if (before >= 55296 && before <= 56319 && size > i143 + 1) {
            const next = input.charCodeAt(i143 + 1);
            if (next >= 56320 && next <= 57343) {
                codepoints.push((before - 55296) * 1024 + next - 56320 + 65536);
                i143 += 1;
                continue;
            }
        }
        codepoints.push(before);
    }
    return codepoints;
}
function saslprep(input, opts = {}) {
    if (input === null) {
        throw new TypeError("Input must not be null.");
    }
    if (input.length === 0) {
        return "";
    }
    const mapped_input = toCodePoints(input).map((character)=>mapping2space.get(character) ? 32 : character
    ).filter((character)=>!mapping2nothing.get(character)
    );
    const normalized_input = String.fromCodePoint.apply(null, mapped_input).normalize("NFKC");
    const normalized_map = toCodePoints(normalized_input);
    const hasProhibited = normalized_map.some((character)=>prohibited_characters1.get(character)
    );
    if (hasProhibited) {
        throw new Error("Prohibited character, see https://tools.ietf.org/html/rfc4013#section-2.3");
    }
    if (!opts.allowUnassigned) {
        const hasUnassigned = normalized_map.some((character)=>unassigned_code_points1.get(character)
        );
        if (hasUnassigned) {
            throw new Error("Unassigned code point, see https://tools.ietf.org/html/rfc4013#section-2.5");
        }
    }
    const hasBidiRAL = normalized_map.some((character)=>bidirectional_r_al1.get(character)
    );
    const hasBidiL = normalized_map.some((character)=>bidirectional_l1.get(character)
    );
    if (hasBidiRAL && hasBidiL) {
        throw new Error("String must not contain RandALCat and LCat at the same time," + " see https://tools.ietf.org/html/rfc3454#section-6");
    }
    const isFirstBidiRAL = bidirectional_r_al1.get(getCodePoint(first(normalized_input)));
    const isLastBidiRAL = bidirectional_r_al1.get(getCodePoint(last(normalized_input)));
    if (hasBidiRAL && !(isFirstBidiRAL && isLastBidiRAL)) {
        throw new Error("Bidirectional RandALCat character must be the first and the last" + " character of the string, see https://tools.ietf.org/html/rfc3454#section-6");
    }
    return normalized_input;
}
const encoder1 = new TextEncoder();
const algoMap = {
    sha: "SHA-1",
    "sha-1": "SHA-1",
    sha1: "SHA-1",
    sha256: "SHA-256",
    "sha-256": "SHA-256",
    sha384: "SHA-384",
    "sha-384": "SHA-384",
    "sha-512": "SHA-512",
    sha512: "SHA-512"
};
async function pbkdf2(password, salt, iterations, length, _algo) {
    const algo = algoMap[_algo];
    const key = await crypto.subtle.importKey("raw", encoder1.encode(password), {
        name: "PBKDF2"
    }, false, [
        "deriveBits"
    ]);
    return crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: {
            name: algo
        }
    }, key, length << 3);
}
const enc = new TextEncoder();
const dec = new TextDecoder();
class ScramAuthPlugin extends AuthPlugin {
    cryptoMethod;
    constructor(cryptoMethod){
        super();
        this.cryptoMethod = cryptoMethod || "sha256";
    }
    prepare(authContext) {
        const handshakeDoc = {
            ismaster: true,
            client: driverMetadata,
            compression: authContext.options.compression
        };
        const request = {
            ...handshakeDoc,
            ...{
                speculativeAuthenticate: {
                    ...makeFirstMessage(this.cryptoMethod, authContext.options.credential, authContext.nonce),
                    ...{
                        db: authContext.options.credential.db
                    }
                }
            }
        };
        return request;
    }
    auth(authContext) {
        const response = authContext.response;
        if (response && response.speculativeAuthenticate) {
            return continueScramConversation(this.cryptoMethod, response.speculativeAuthenticate, authContext);
        }
        return executeScram(this.cryptoMethod, authContext);
    }
}
function cleanUsername(username) {
    return username.replace("=", "=3D").replace(",", "=2C");
}
function clientFirstMessageBare(username, nonce) {
    return Uint8Array.from([
        ...enc.encode("n="),
        ...enc.encode(username),
        ...enc.encode(",r="),
        ...enc.encode(mod5.encode(nonce)), 
    ]);
}
function makeFirstMessage(cryptoMethod, credentials, nonce) {
    const username = cleanUsername(credentials.username);
    const mechanism = cryptoMethod === "sha1" ? "SCRAM-SHA-1" : "SCRAM-SHA-256";
    return {
        saslStart: 1,
        mechanism,
        payload: new mod6.Binary(Uint8Array.from([
            ...enc.encode("n,,"),
            ...clientFirstMessageBare(username, nonce)
        ])),
        autoAuthorize: 1,
        options: {
            skipEmptyExchange: true
        }
    };
}
async function executeScram(cryptoMethod, authContext) {
    const { protocol , credentials  } = authContext;
    if (!credentials) {
        throw new MongoDriverError("AuthContext must provide credentials.");
    }
    if (!authContext.nonce) {
        throw new MongoDriverError("AuthContext must contain a valid nonce property");
    }
    const nonce = authContext.nonce;
    const db = credentials.db;
    const saslStartCmd = makeFirstMessage(cryptoMethod, credentials, nonce);
    const result = await protocol.commandSingle(db, saslStartCmd);
    return continueScramConversation(cryptoMethod, result, authContext);
}
async function continueScramConversation(cryptoMethod, response, authContext) {
    const protocol = authContext.protocol;
    const credentials = authContext.credentials;
    if (!credentials) {
        throw new MongoDriverError("AuthContext must provide credentials.");
    }
    if (!authContext.nonce) {
        throw new MongoDriverError("Unable to continue SCRAM without valid nonce");
    }
    const nonce = authContext.nonce;
    const db = credentials.db;
    const username = cleanUsername(credentials.username);
    const password = credentials.password;
    let processedPassword;
    if (cryptoMethod === "sha256") {
        processedPassword = saslprep(password);
    } else {
        processedPassword = await passwordDigest(username, password);
    }
    const payload = fixPayload(dec.decode(response.payload.buffer));
    const dict = parsePayload(payload);
    const iterations = parseInt(dict.i, 10);
    if (iterations && iterations < 4096) {
        throw new MongoDriverError(`Server returned an invalid iteration count ${iterations}`);
    }
    const salt = dict.s;
    const rnonce = dict.r;
    if (rnonce.startsWith("nonce")) {
        throw new MongoDriverError(`Server returned an invalid nonce: ${rnonce}`);
    }
    const withoutProof = `c=biws,r=${rnonce}`;
    const saltedPassword = await HI(processedPassword, mod5.decode(salt), iterations, cryptoMethod);
    const clientKey = await HMAC(cryptoMethod, saltedPassword, "Client Key");
    const serverKey = await HMAC(cryptoMethod, saltedPassword, "Server Key");
    const storedKey = await H(cryptoMethod, clientKey);
    const authMessage = [
        dec.decode(clientFirstMessageBare(username, nonce)),
        payload,
        withoutProof, 
    ].join(",");
    const clientSignature = await HMAC(cryptoMethod, storedKey, authMessage);
    const clientProof = `p=${xor(clientKey, clientSignature)}`;
    const clientFinal = [
        withoutProof,
        clientProof
    ].join(",");
    const serverSignature = await HMAC(cryptoMethod, serverKey, authMessage);
    const saslContinueCmd = {
        saslContinue: 1,
        conversationId: response.conversationId,
        payload: new mod6.Binary(enc.encode(clientFinal))
    };
    const result = await protocol.commandSingle(db, saslContinueCmd);
    const parsedResponse = parsePayload(fixPayload2(dec.decode(result.payload.buffer)));
    if (!compareDigest(mod5.decode(parsedResponse.v), new Uint8Array(serverSignature))) {}
    if (result.done) {
        return result;
    }
    const retrySaslContinueCmd = {
        saslContinue: 1,
        conversationId: result.conversationId,
        payload: new Uint8Array(0)
    };
    return protocol.commandSingle(db, retrySaslContinueCmd);
}
function fixPayload(payload) {
    const temp = payload.split("=");
    temp.shift();
    const it = parseInt(temp.pop(), 10);
    payload = "r=" + temp.join("=") + "=" + it;
    return payload;
}
function fixPayload2(payload) {
    let temp = payload.split("v=");
    temp.shift();
    payload = temp.join("v=");
    temp = payload.split("ok");
    temp.pop();
    return "v=" + temp.join("ok");
}
function parsePayload(payload) {
    const dict = {};
    const parts = payload.split(",");
    for(let i144 = 0; i144 < parts.length; i144++){
        const valueParts = parts[i144].split("=");
        dict[valueParts[0]] = valueParts[1];
    }
    return dict;
}
async function passwordDigest(username, password) {
    if (typeof username !== "string") {
        throw new MongoDriverError("username must be a string");
    }
    if (typeof password !== "string") {
        throw new MongoDriverError("password must be a string");
    }
    if (password.length === 0) {
        throw new MongoDriverError("password cannot be empty");
    }
    const result = await stdCrypto1.subtle.digest("MD5", enc.encode(`${username}:mongo:${password}`));
    return dec.decode(mod4.encode(new Uint8Array(result)));
}
function xor(_a, _b) {
    const a = new Uint8Array(_a);
    const b = new Uint8Array(_b);
    const length = Math.max(a.length, b.length);
    const res = new Uint8Array(length);
    for(let i145 = 0; i145 < length; i145 += 1){
        res[i145] = a[i145] ^ b[i145];
    }
    return mod5.encode(res);
}
function H(method, text) {
    return crypto.subtle.digest(method === "sha256" ? "SHA-256" : "SHA-1", text);
}
async function HMAC(method, secret, text) {
    const key = await crypto.subtle.importKey("raw", secret, {
        name: "HMAC",
        hash: method === "sha256" ? "SHA-256" : "SHA-1"
    }, false, [
        "sign",
        "verify"
    ]);
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(text));
    return signature;
}
let _hiCache = {};
let _hiCacheCount = 0;
function _hiCachePurge() {
    _hiCache = {};
    _hiCacheCount = 0;
}
const hiLengthMap = {
    sha256: 32,
    sha1: 20
};
async function HI(data48, salt, iterations, cryptoMethod) {
    const key = [
        data48,
        mod5.encode(salt),
        iterations
    ].join("_");
    if (_hiCache[key] !== undefined) {
        return _hiCache[key];
    }
    const saltedData = await pbkdf2(data48, salt, iterations, hiLengthMap[cryptoMethod], cryptoMethod);
    if (_hiCacheCount >= 200) {
        _hiCachePurge();
    }
    _hiCache[key] = saltedData;
    _hiCacheCount += 1;
    return saltedData;
}
function compareDigest(lhs, rhs) {
    if (lhs.length !== rhs.length) {
        return false;
    }
    let result = 0;
    for(let i146 = 0; i146 < lhs.length; i146++){
        result |= lhs[i146] ^ rhs[i146];
    }
    return result === 0;
}
class X509AuthPlugin extends AuthPlugin {
    constructor(){
        super();
    }
    prepare(authContext) {
        const handshakeDoc = {
            ismaster: true,
            client: driverMetadata,
            compression: authContext.options.compression,
            speculativeAuthenticate: x509AuthenticateCommand(authContext.credentials)
        };
        return handshakeDoc;
    }
    auth(authContext) {
        if (authContext.response.speculativeAuthenticate) {
            return Promise.resolve(authContext.response);
        }
        return authContext.protocol.commandSingle("$external", x509AuthenticateCommand(authContext.credentials));
    }
}
function x509AuthenticateCommand(credentials) {
    const command = {
        authenticate: 1,
        mechanism: "MONGODB-X509"
    };
    if (credentials) {
        command.user = credentials.username;
    }
    return command;
}
class Cluster {
    #options;
    #connections;
    #protocols;
    #masterIndex;
    constructor(options){
        this.#options = options;
        this.#connections = [];
        this.#protocols = [];
        this.#masterIndex = -1;
    }
    async connect() {
        const options = this.#options;
        this.#connections = await Promise.all(options.servers.map((server)=>this.connectToServer(server, options)
        ));
    }
    connectToServer(server, options) {
        const denoConnectOps = {
            hostname: server.host,
            port: server.port
        };
        if (!options.tls) return Deno.connect(denoConnectOps);
        if (options.certFile) {
            denoConnectOps.caCerts = [
                Deno.readTextFileSync(options.certFile)
            ];
        }
        if (options.keyFile) {
            if (options.keyFilePassword) {
                throw new MongoDriverError("Tls keyFilePassword not implemented in Deno driver");
            }
            throw new MongoDriverError("Tls keyFile not implemented in Deno driver");
        }
        return Deno.connectTls(denoConnectOps);
    }
    async authenticate() {
        const options = this.#options;
        this.#protocols = await Promise.all(this.#connections.map((conn)=>this.authenticateToServer(conn, options)
        ));
    }
    async authenticateToServer(conn, options) {
        const protocol = new WireProtocol(conn);
        if (options.credential) {
            const authContext = new AuthContext(protocol, options.credential, options);
            const mechanism = options.credential.mechanism;
            let authPlugin;
            if (mechanism === "SCRAM-SHA-256") {
                authPlugin = new ScramAuthPlugin("sha256");
            } else if (mechanism === "SCRAM-SHA-1") {
                authPlugin = new ScramAuthPlugin("sha1");
            } else if (mechanism === "MONGODB-X509") {
                authPlugin = new X509AuthPlugin();
            } else {
                throw new MongoDriverError(`Auth mechanism not implemented in Deno driver: ${mechanism}`);
            }
            const request = authPlugin.prepare(authContext);
            authContext.response = await protocol.commandSingle("admin", request);
            await authPlugin.auth(authContext);
        } else {
            await protocol.connect();
        }
        return protocol;
    }
    async updateMaster() {
        const results = await Promise.all(this.#protocols.map((protocol)=>{
            return protocol.commandSingle("admin", {
                isMaster: 1
            });
        }));
        const masterIndex = results.findIndex((result)=>result.isWritablePrimary || result.ismaster
        );
        if (masterIndex === -1) throw new Error(`Could not find a master node`);
        this.#masterIndex = masterIndex;
    }
    getMaster() {
        return {
            protocol: this.#protocols[this.#masterIndex],
            conn: this.#connections[this.#masterIndex]
        };
    }
    get protocol() {
        return this.getMaster().protocol;
    }
    close() {
        for (const conn of this.#connections){
            try {
                conn.close();
            } catch (error) {
                console.error(`Error closing connection: ${error}`);
            }
        }
    }
}
var ReadPreference1;
(function(ReadPreference3) {
    ReadPreference3["Primary"] = "primary";
    ReadPreference3["PrimaryPreferred"] = "primaryPreferred";
    ReadPreference3["Secondary"] = "secondary";
    ReadPreference3["SecondaryPreferred"] = "secondaryPreferred";
    ReadPreference3["Nearest"] = "nearest";
})(ReadPreference1 || (ReadPreference1 = {}));
const noColor1 = globalThis.Deno?.noColor ?? true;
let enabled1 = !noColor1;
function code1(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run1(str, code110) {
    return enabled1 ? `${code110.open}${str.replace(code110.regexp, code110.open)}${code110.close}` : str;
}
function green(str) {
    return run1(str, code1([
        32
    ], 39));
}
function yellow1(str) {
    return run1(str, code1([
        33
    ], 39));
}
function blue(str) {
    return run1(str, code1([
        34
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
const { Deno: Deno4  } = globalThis;
typeof Deno4?.noColor === "boolean" ? Deno4.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
var DiffType3;
(function(DiffType7) {
    DiffType7["removed"] = "removed";
    DiffType7["common"] = "common";
    DiffType7["added"] = "added";
})(DiffType3 || (DiffType3 = {}));
class AssertionError1 extends Error {
    name = "AssertionError";
    constructor(message){
        super(message);
    }
}
function assert3(expr, msg = "") {
    if (!expr) {
        throw new AssertionError1(msg);
    }
}
(function(factory) {
    const root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : Function("return this;")();
    let exporter = makeExporter(Reflect);
    if (typeof root.Reflect === "undefined") {
        root.Reflect = Reflect;
    } else {
        exporter = makeExporter(root.Reflect, exporter);
    }
    factory(exporter);
    function makeExporter(target, previous) {
        return (key, value)=>{
            if (typeof target[key] !== "function") {
                Object.defineProperty(target, key, {
                    configurable: true,
                    writable: true,
                    value
                });
            }
            if (previous) previous(key, value);
        };
    }
})(function(exporter) {
    const hasOwn1 = Object.prototype.hasOwnProperty;
    const supportsSymbol = typeof Symbol === "function";
    const toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    const iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    const supportsCreate = typeof Object.create === "function";
    const supportsProto = ({
        __proto__: []
    }) instanceof Array;
    const downLevel = !supportsCreate && !supportsProto;
    const HashMap = {
        create: supportsCreate ? ()=>MakeDictionary(Object.create(null))
         : supportsProto ? ()=>MakeDictionary({
                __proto__: null
            })
         : ()=>MakeDictionary({})
        ,
        has: downLevel ? (map, key)=>hasOwn1.call(map, key)
         : (map, key)=>key in map
        ,
        get: downLevel ? (map, key)=>hasOwn1.call(map, key) ? map[key] : undefined
         : (map, key)=>map[key]
    };
    const functionPrototype = Object.getPrototypeOf(Function);
    const usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    const _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    const _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    const _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    const Metadata = new _WeakMap();
    function decorate(decorators, target, propertyKey, attributes) {
        if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsObject(target)) throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes)) throw new TypeError();
            if (IsNull(attributes)) attributes = undefined;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
        } else {
            if (!IsArray(decorators)) throw new TypeError();
            if (!IsConstructor(target)) throw new TypeError();
            return DecorateConstructor(decorators, target);
        }
    }
    exporter("decorate", decorate);
    function metadata(metadataKey, metadataValue) {
        function decorator(target, propertyKey) {
            if (!IsObject(target)) throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        return decorator;
    }
    exporter("metadata", metadata);
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    exporter("defineMetadata", defineMetadata);
    function hasMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasMetadata", hasMetadata);
    function hasOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasOwnMetadata", hasOwnMetadata);
    function getMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    exporter("getMetadata", getMetadata);
    function getOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("getOwnMetadata", getOwnMetadata);
    function getMetadataKeys(target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryMetadataKeys(target, propertyKey);
    }
    exporter("getMetadataKeys", getMetadataKeys);
    function getOwnMetadataKeys(target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    exporter("getOwnMetadataKeys", getOwnMetadataKeys);
    function deleteMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target)) throw new TypeError();
        if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey);
        const metadataMap = GetOrCreateMetadataMap(target, propertyKey, false);
        if (IsUndefined(metadataMap)) return false;
        if (!metadataMap.delete(metadataKey)) return false;
        if (metadataMap.size > 0) return true;
        const targetMetadata = Metadata.get(target);
        targetMetadata.delete(propertyKey);
        if (targetMetadata.size > 0) return true;
        Metadata.delete(target);
        return true;
    }
    exporter("deleteMetadata", deleteMetadata);
    function DecorateConstructor(decorators, target) {
        for(let i147 = decorators.length - 1; i147 >= 0; --i147){
            const decorator = decorators[i147];
            const decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsConstructor(decorated)) throw new TypeError();
                target = decorated;
            }
        }
        return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
        for(let i148 = decorators.length - 1; i148 >= 0; --i148){
            const decorator = decorators[i148];
            const decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsObject(decorated)) throw new TypeError();
                descriptor = decorated;
            }
        }
        return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
        let targetMetadata = Metadata.get(O);
        if (IsUndefined(targetMetadata)) {
            if (!Create) return undefined;
            targetMetadata = new _Map();
            Metadata.set(O, targetMetadata);
        }
        let metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
            if (!Create) return undefined;
            metadataMap = new _Map();
            targetMetadata.set(P, metadataMap);
        }
        return metadataMap;
    }
    function OrdinaryHasMetadata(MetadataKey, O, P) {
        const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) return true;
        const parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P);
        return false;
    }
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        const metadataMap = GetOrCreateMetadataMap(O, P, false);
        if (IsUndefined(metadataMap)) return false;
        return ToBoolean(metadataMap.has(MetadataKey));
    }
    function OrdinaryGetMetadata(MetadataKey, O, P) {
        const hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        const parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P);
        return undefined;
    }
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        const metadataMap = GetOrCreateMetadataMap(O, P, false);
        if (IsUndefined(metadataMap)) return undefined;
        return metadataMap.get(MetadataKey);
    }
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        const metadataMap = GetOrCreateMetadataMap(O, P, true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    function OrdinaryMetadataKeys(O, P) {
        const ownKeys = OrdinaryOwnMetadataKeys(O, P);
        const parent = OrdinaryGetPrototypeOf(O);
        if (parent === null) return ownKeys;
        const parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0) return ownKeys;
        if (ownKeys.length <= 0) return parentKeys;
        const set = new _Set();
        const keys = [];
        for (const key of ownKeys){
            const hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        for (const key1 of parentKeys){
            const hasKey = set.has(key1);
            if (!hasKey) {
                set.add(key1);
                keys.push(key1);
            }
        }
        return keys;
    }
    function OrdinaryOwnMetadataKeys(O, P) {
        const keys = [];
        const metadataMap = GetOrCreateMetadataMap(O, P, false);
        if (IsUndefined(metadataMap)) return keys;
        const keysObj = metadataMap.keys();
        const iterator = GetIterator(keysObj);
        let k = 0;
        while(true){
            const next = IteratorStep(iterator);
            if (!next) {
                keys.length = k;
                return keys;
            }
            const nextValue = IteratorValue(next);
            try {
                keys[k] = nextValue;
            } catch (e) {
                try {
                    IteratorClose(iterator);
                } finally{
                    throw e;
                }
            }
            k++;
        }
    }
    let Tag1;
    (function(Tag) {
        Tag[Tag["Undefined"] = 0] = "Undefined";
        Tag[Tag["Null"] = 1] = "Null";
        Tag[Tag["Boolean"] = 2] = "Boolean";
        Tag[Tag["String"] = 3] = "String";
        Tag[Tag["Symbol"] = 4] = "Symbol";
        Tag[Tag["Number"] = 5] = "Number";
        Tag[Tag["Object"] = 6] = "Object";
    })(Tag1 || (Tag1 = {}));
    function Type(x) {
        if (x === null) return Tag1.Null;
        switch(typeof x){
            case "undefined":
                return Tag1.Undefined;
            case "boolean":
                return Tag1.Boolean;
            case "string":
                return Tag1.String;
            case "symbol":
                return Tag1.Symbol;
            case "number":
                return Tag1.Number;
            case "object":
                return x === null ? Tag1.Null : Tag1.Object;
            default:
                return Tag1.Object;
        }
    }
    function IsUndefined(x) {
        return x === undefined;
    }
    function IsNull(x) {
        return x === null;
    }
    function IsSymbol(x) {
        return typeof x === "symbol";
    }
    function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }
    function ToPrimitive(input, PreferredType) {
        switch(Type(input)){
            case Tag1.Undefined:
                return input;
            case Tag1.Null:
                return input;
            case Tag1.Boolean:
                return input;
            case Tag1.String:
                return input;
            case Tag1.Symbol:
                return input;
            case Tag1.Number:
                return input;
        }
        const hint = PreferredType === Tag1.String ? "string" : PreferredType === Tag1.Number ? "number" : "default";
        const exoticToPrim = GetMethod(input, toPrimitiveSymbol);
        if (exoticToPrim !== undefined) {
            const result = exoticToPrim.call(input, hint);
            if (IsObject(result)) throw new TypeError();
            return result;
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    function OrdinaryToPrimitive(O, hint) {
        if (hint === "string") {
            const toString = O.toString;
            if (IsCallable(toString)) {
                const result = toString.call(O);
                if (!IsObject(result)) return result;
            }
            const valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                const result = valueOf.call(O);
                if (!IsObject(result)) return result;
            }
        } else {
            const valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                const result = valueOf.call(O);
                if (!IsObject(result)) return result;
            }
            const toString = O.toString;
            if (IsCallable(toString)) {
                const result = toString.call(O);
                if (!IsObject(result)) return result;
            }
        }
        throw new TypeError();
    }
    function ToBoolean(argument) {
        return !!argument;
    }
    function ToString(argument) {
        return "" + argument;
    }
    function ToPropertyKey(argument) {
        const key = ToPrimitive(argument, Tag1.String);
        if (IsSymbol(key)) return key;
        return ToString(key);
    }
    function IsArray(argument) {
        return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
    }
    function IsCallable(argument) {
        return typeof argument === "function";
    }
    function IsConstructor(argument) {
        return typeof argument === "function";
    }
    function IsPropertyKey(argument) {
        switch(Type(argument)){
            case Tag1.String:
                return true;
            case Tag1.Symbol:
                return true;
            default:
                return false;
        }
    }
    function GetMethod(V, P) {
        const func = V[P];
        if (func === undefined || func === null) return undefined;
        if (!IsCallable(func)) throw new TypeError();
        return func;
    }
    function GetIterator(obj) {
        const method = GetMethod(obj, iteratorSymbol);
        if (!IsCallable(method)) throw new TypeError();
        const iterator = method.call(obj);
        if (!IsObject(iterator)) throw new TypeError();
        return iterator;
    }
    function IteratorValue(iterResult) {
        return iterResult.value;
    }
    function IteratorStep(iterator) {
        const result = iterator.next();
        return result.done ? false : result;
    }
    function IteratorClose(iterator) {
        const f = iterator["return"];
        if (f) f.call(iterator);
    }
    function OrdinaryGetPrototypeOf(O) {
        const proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype) return proto;
        if (proto !== functionPrototype) return proto;
        const prototype = O.prototype;
        const prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype) return proto;
        const constructor = prototypeProto.constructor;
        if (typeof constructor !== "function") return proto;
        if (constructor === O) return proto;
        return constructor;
    }
    function CreateMapPolyfill() {
        const cacheSentinel = {};
        const arraySentinel = [];
        class MapIterator {
            _keys;
            _values;
            _index = 0;
            _selector;
            constructor(keys, values, selector){
                this._keys = keys;
                this._values = values;
                this._selector = selector;
            }
            "@@iterator"() {
                return this;
            }
            [iteratorSymbol]() {
                return this;
            }
            next() {
                const index = this._index;
                if (index >= 0 && index < this._keys.length) {
                    const result = this._selector(this._keys[index], this._values[index]);
                    if (index + 1 >= this._keys.length) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    } else {
                        this._index++;
                    }
                    return {
                        value: result,
                        done: false
                    };
                }
                return {
                    value: undefined,
                    done: true
                };
            }
            throw(error) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                throw error;
            }
            return(value) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                return {
                    value: value,
                    done: true
                };
            }
        }
        return class Map {
            _keys = [];
            _values = [];
            _cacheKey = cacheSentinel;
            _cacheIndex = -2;
            get size() {
                return this._keys.length;
            }
            has(key) {
                return this._find(key, false) >= 0;
            }
            get(key) {
                const index = this._find(key, false);
                return index >= 0 ? this._values[index] : undefined;
            }
            set(key, value) {
                const index = this._find(key, true);
                this._values[index] = value;
                return this;
            }
            delete(key) {
                const index = this._find(key, false);
                if (index >= 0) {
                    const size = this._keys.length;
                    for(let i149 = index + 1; i149 < size; i149++){
                        this._keys[i149 - 1] = this._keys[i149];
                        this._values[i149 - 1] = this._values[i149];
                    }
                    this._keys.length--;
                    this._values.length--;
                    if (key === this._cacheKey) {
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    }
                    return true;
                }
                return false;
            }
            clear() {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            }
            keys() {
                return new MapIterator(this._keys, this._values, getKey);
            }
            values() {
                return new MapIterator(this._keys, this._values, getValue);
            }
            entries() {
                return new MapIterator(this._keys, this._values, getEntry);
            }
            "@@iterator"() {
                return this.entries();
            }
            [iteratorSymbol]() {
                return this.entries();
            }
            _find(key, insert) {
                if (this._cacheKey !== key) {
                    this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                }
                if (this._cacheIndex < 0 && insert) {
                    this._cacheIndex = this._keys.length;
                    this._keys.push(key);
                    this._values.push(undefined);
                }
                return this._cacheIndex;
            }
        };
        function getKey(key, _) {
            return key;
        }
        function getValue(_, value) {
            return value;
        }
        function getEntry(key, value) {
            return [
                key,
                value
            ];
        }
    }
    function CreateSetPolyfill() {
        return class Set {
            _map = new _Map();
            get size() {
                return this._map.size;
            }
            has(value) {
                return this._map.has(value);
            }
            add(value) {
                return this._map.set(value, value), this;
            }
            delete(value) {
                return this._map.delete(value);
            }
            clear() {
                this._map.clear();
            }
            keys() {
                return this._map.keys();
            }
            values() {
                return this._map.values();
            }
            entries() {
                return this._map.entries();
            }
            "@@iterator"() {
                return this.keys();
            }
            [iteratorSymbol]() {
                return this.keys();
            }
        };
    }
    function CreateWeakMapPolyfill() {
        const keys = HashMap.create();
        const rootKey = CreateUniqueKey();
        return class WeakMap {
            _key = CreateUniqueKey();
            has(target) {
                const table = GetOrCreateWeakMapTable(target, false);
                return table !== undefined ? HashMap.has(table, this._key) : false;
            }
            get(target) {
                const table = GetOrCreateWeakMapTable(target, false);
                return table !== undefined ? HashMap.get(table, this._key) : undefined;
            }
            set(target, value) {
                const table = GetOrCreateWeakMapTable(target, true);
                table[this._key] = value;
                return this;
            }
            delete(target) {
                const table = GetOrCreateWeakMapTable(target, false);
                return table !== undefined ? delete table[this._key] : false;
            }
            clear() {
                this._key = CreateUniqueKey();
            }
        };
        function CreateUniqueKey() {
            let key;
            do key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key))
            keys[key] = true;
            return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn1.call(target, rootKey)) {
                if (!create) return undefined;
                Object.defineProperty(target, rootKey, {
                    value: HashMap.create()
                });
            }
            return target[rootKey];
        }
        function FillRandomBytes(buffer86, size) {
            for(let i150 = 0; i150 < size; ++i150)buffer86[i150] = Math.random() * 255 | 0;
            return buffer86;
        }
        function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
                if (typeof crypto !== "undefined") return crypto.getRandomValues(new Uint8Array(size));
                if (typeof msCrypto !== "undefined") return msCrypto.getRandomValues(new Uint8Array(size));
                return FillRandomBytes(new Uint8Array(size), size);
            }
            return FillRandomBytes(new Array(size), size);
        }
        function CreateUUID() {
            const data49 = GenRandomBytes(16);
            data49[6] = data49[6] & 79 | 64;
            data49[8] = data49[8] & 191 | 128;
            let result = "";
            for(let offset118 = 0; offset118 < 16; ++offset118){
                const __byte = data49[offset118];
                if (offset118 === 4 || offset118 === 6 || offset118 === 8) result += "-";
                if (__byte < 16) result += "0";
                result += __byte.toString(16).toLowerCase();
            }
            return result;
        }
    }
    function MakeDictionary(obj) {
        obj.__ = undefined;
        delete obj.__;
        return obj;
    }
});
const instanceCache = new Map();
function transToMongoId(id) {
    if (id && id instanceof mod6.ObjectId) {
        return id;
    }
    return new mod6.ObjectId(id);
}
function getInstance(cls) {
    if (instanceCache.has(cls)) {
        return instanceCache.get(cls);
    }
    const instance = new cls();
    instanceCache.set(cls, instance);
    return instance;
}
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc1 = {};
    Object.keys(descriptor).forEach(function(key) {
        desc1[key] = descriptor[key];
    });
    desc1.enumerable = !!desc1.enumerable;
    desc1.configurable = !!desc1.configurable;
    if ("value" in desc1 || desc1.initializer) {
        desc1.writable = true;
    }
    desc1 = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator ? decorator(target, property, desc) || desc : desc;
    }, desc1);
    if (context && desc1.initializer !== void 0) {
        desc1.value = desc1.initializer ? desc1.initializer.call(context) : void 0;
        desc1.initializer = undefined;
    }
    if (desc1.initializer === void 0) {
        Object.defineProperty(target, property, desc1);
        desc1 = null;
    }
    return desc1;
}
function _initializerDefineProperty(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class, _descriptor, _dec, _descriptor1, _dec1;
const PROP_META_KEY = Symbol("design:prop");
function transferPopulateSelect(select) {
    let _select = select ?? true;
    if (typeof select === "string") {
        _select = {};
        select.split(" ").forEach((item)=>{
            if (item.startsWith("-")) {
                _select[item.substring(1)] = 0;
            } else {
                _select[item] = 1;
            }
        });
    } else if (Array.isArray(select)) {
        _select = {};
        select.forEach((item)=>{
            _select[item] = 1;
        });
    }
    return _select;
}
let Schema = ((_class = class Schema {
    _id;
    id;
    constructor(){
        _initializerDefineProperty(this, "createTime", _descriptor, this);
        _initializerDefineProperty(this, "modifyTime", _descriptor1, this);
    }
}) || _class, _dec = Prop({
    default: Date.now
}), _dec1 = Prop({
    default: Date.now
}), _descriptor = _applyDecoratedDescriptor(_class.prototype, "createTime", [
    _dec
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class.prototype, "modifyTime", [
    _dec1
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
}), _class);
class BaseSchema {
    Cls;
    constructor(Cls){
        this.Cls = Cls;
    }
    preHooks = new Map();
    postHooks = new Map();
    populateMap = new Map();
    populateParams = new Map();
    pre(method, callback) {
        return this.hook(this.preHooks, method, callback);
    }
    post(method, callback) {
        return this.hook(this.postHooks, method, callback);
    }
    clearHooks() {
        this.preHooks.clear();
        this.postHooks.clear();
    }
    hook(hooks, method, callback) {
        let arr = hooks.get(method);
        if (!arr) {
            arr = [];
            hooks.set(method, arr);
        }
        arr.push(callback);
        return arr;
    }
    populate(path, select) {
        const _select = transferPopulateSelect(select);
        if (_select) {
            this.populateMap.set(path, _select);
        }
        return this;
    }
    unpopulate(path) {
        this.populateMap.delete(path);
        return this;
    }
    getMeta() {
        return getSchemaMetadata(this.Cls);
    }
    getPreHookByMethod(method) {
        return this.preHooks.get(method);
    }
    getPostHookByMethod(method) {
        return this.postHooks.get(method);
    }
    virtual(name, options) {
        this.populateParams.set(name, options);
        return this;
    }
    unVirtual(name) {
        this.populateParams.delete(name);
        return this;
    }
    getPopulateMap() {
        if (this.populateMap.size === 0) {
            return;
        }
        return this.populateMap;
    }
    getPopulateParams() {
        if (this.populateParams.size === 0) {
            return;
        }
        return this.populateParams;
    }
}
function Prop(props) {
    return function(target, propertyKey) {
        addSchemaMetadata(target, propertyKey, props);
        return target;
    };
}
function getFormattedModelName(name) {
    let modelName = name;
    if (!modelName.endsWith("s")) {
        modelName += "s";
    }
    return modelName.toLowerCase();
}
function addSchemaMetadata(target, propertyKey, props = {}) {
    Reflect.defineMetadata(PROP_META_KEY, props, target, propertyKey);
}
const schemaPropsCaches = new Map();
function getSchemaMetadata(target, propertyKey) {
    const instance = getInstance(target);
    if (propertyKey) {
        return Reflect.getMetadata(PROP_META_KEY, instance, propertyKey);
    }
    let map = schemaPropsCaches.get(target);
    if (!map) {
        map = {};
        Object.keys(instance).forEach((key)=>{
            const meta1 = Reflect.getMetadata(PROP_META_KEY, instance, key);
            if (meta1) {
                map[key] = meta1;
            }
        });
        schemaPropsCaches.set(target, map);
    }
    return map;
}
var ErrorCode;
(function(ErrorCode1) {
    ErrorCode1[ErrorCode1["IndexOptionsConflict"] = 85] = "IndexOptionsConflict";
    ErrorCode1[ErrorCode1["IndexKeySpecsConflict"] = 86] = "IndexKeySpecsConflict";
})(ErrorCode || (ErrorCode = {}));
function Cache(timeout, getCacheKey) {
    return (target, methodName, descriptor)=>{
        const originalMethod = descriptor.value;
        descriptor.value = function(...args) {
            const key = getCacheKey ? getCacheKey.apply(this, args) : args.join("-");
            let cache = Reflect.getMetadata("cache", target, methodName);
            if (cache) {
                if (cache[key] !== undefined) {
                    return cache[key];
                }
            } else {
                cache = {};
                Reflect.defineMetadata("cache", cache, target, methodName);
            }
            const result = originalMethod.apply(this, args);
            cache[key] = result;
            if (timeout >= 0) {
                setTimeout(()=>{
                    cache[key] = undefined;
                }, timeout);
            }
            Promise.resolve(result).catch(()=>{
                cache[key] = undefined;
            });
            return result;
        };
        return descriptor;
    };
}
var MongoHookMethod;
(function(MongoHookMethod1) {
    MongoHookMethod1["create"] = "create";
    MongoHookMethod1["update"] = "update";
    MongoHookMethod1["delete"] = "delete";
    MongoHookMethod1["findMany"] = "findMany";
    MongoHookMethod1["findOne"] = "findOne";
    MongoHookMethod1["findOneAndUpdate"] = "findOneAndUpdate";
})(MongoHookMethod || (MongoHookMethod = {}));
class Model {
    #collection;
    #schema;
    constructor(schema, collection){
        this.#schema = schema;
        this.#collection = collection;
    }
    get collection() {
        return this.#collection;
    }
    get schema() {
        return this.#schema;
    }
    getPopulateMap(populates) {
        if (populates) {
            const populateMap = new Map();
            for(const key in populates){
                if (populates[key]) {
                    populateMap.set(key, transferPopulateSelect(populates[key]));
                }
            }
            if (populateMap.size > 0) {
                return populateMap;
            }
        } else {
            return this.schema?.getPopulateMap();
        }
    }
    getPopulateParams() {
        return this.schema?.getPopulateParams();
    }
    _find(filter, options) {
        const { remainOriginId: _ , populates , ...others } = options || {};
        const populateParams = this.getPopulateParams();
        const populateMap = this.getPopulateMap(populates);
        if (populateParams && populateMap) {
            return this.findWithVirtual({
                populateMap,
                populateParams,
                filter,
                options
            });
        } else {
            const res = this.#collection.find(filter, others);
            if (options?.skip) {
                res.skip(options.skip);
            }
            if (options?.limit) {
                res.limit(options.limit);
            }
            if (options?.sort) {
                res.sort(options.sort);
            }
            return res;
        }
    }
    findWithVirtual(virturalOptions) {
        const { populateMap , populateParams , filter , options  } = virturalOptions;
        const paramsArray = [];
        if (filter) {
            paramsArray.push({
                $match: filter
            });
        }
        if (options?.sort) {
            paramsArray.push({
                $sort: options.sort
            });
        }
        if (options?.skip !== undefined) {
            paramsArray.push({
                $skip: options.skip
            });
        }
        if (options?.limit) {
            paramsArray.push({
                $limit: options.limit
            });
        }
        if (options?.projection) {
            paramsArray.push({
                $project: options.projection
            });
        }
        const addFields = {};
        for (const [key, value] of populateParams){
            if (!populateMap.has(key)) {
                continue;
            }
            const from = typeof value.ref === "string" ? getFormattedModelName(value.ref) : getFormattedModelName(value.ref.name);
            if (value.isTransformLocalFieldToObjectID || value.isTransformLocalFieldToString) {
                if (value.isTransformLocalFieldToObjectID) {
                    addFields[value.localField] = {
                        $toObjectId: "$" + value.localField
                    };
                } else if (value.isTransformLocalFieldToString) {
                    addFields[value.localField] = {
                        $toString: "$" + value.localField
                    };
                }
                paramsArray.push({
                    $addFields: addFields
                });
            }
            const lookup = {
                from,
                as: key,
                let: {
                    localField: "$" + value.localField
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$" + value.foreignField,
                                    "$$localField"
                                ]
                            },
                            ...value.match
                        }
                    }, 
                ]
            };
            if (value.count) {
                lookup.pipeline.push({
                    $group: {
                        _id: null,
                        "count": {
                            "$sum": 1
                        }
                    }
                });
            }
            paramsArray.push({
                $lookup: lookup
            });
        }
        return this.#collection.aggregate(paramsArray);
    }
    async preFind(hookType, filter, options) {
        this.formatBsonId(filter);
        if (options) {
            for(const key in options){
                if (options[key] === undefined) {
                    delete options[key];
                }
            }
        }
        await this.preHooks(hookType, filter, options);
    }
    async afterFind(docs, filter, options) {
        if (Array.isArray(docs)) {
            await this.postHooks(MongoHookMethod.findMany, docs, filter, options);
            docs.forEach((doc)=>this.formatFindDoc(doc, options)
            );
        } else {
            await this.postHooks(MongoHookMethod.findOne, docs, filter, options);
            this.formatFindDoc(docs, options);
        }
    }
    find(filter, options) {
        return this.#collection.find(filter, options);
    }
    async findOne(filter, options) {
        await this.preFind(MongoHookMethod.findOne, filter, options);
        const doc = await this._find(filter, options).next();
        await this.afterFind(doc, filter, options);
        return doc;
    }
    async findMany(filter, options) {
        await this.preFind(MongoHookMethod.findMany, filter, options);
        const docs = await this._find(filter, options).toArray();
        await this.afterFind(docs, filter, options);
        return docs;
    }
    formatFindDoc(doc, options) {
        if (!doc) {
            return;
        }
        const { remainOriginId , populates  } = options || {};
        this.transferId(doc, remainOriginId);
        const params = this.getPopulateParams();
        if (!params) {
            return;
        }
        const map = this.getPopulateMap(populates);
        if (!map) {
            return;
        }
        for (const [key, value] of params){
            if (!map.has(key) || !doc[key]) {
                continue;
            }
            if (populates && !populates[key]) {
                delete doc[key];
                continue;
            }
            const arr = doc[key];
            const pickMap = map.get(key);
            if (arr?.length === 0) {
                if (value.count) {
                    doc[key] = 0;
                } else if (value.justOne) {
                    doc[key] = null;
                }
            } else {
                for(let i151 = 0; i151 < arr.length; i151++){
                    const item = arr[i151];
                    if (value.count) {
                        doc[key] = item.count;
                        break;
                    } else {
                        if (value.justOne) {
                            doc[key] = this.pickVirtual(item, pickMap, remainOriginId);
                            break;
                        } else {
                            arr[i151] = this.pickVirtual(item, pickMap, remainOriginId);
                        }
                    }
                }
            }
        }
    }
    transferId(doc, remainOriginId) {
        if (!doc) {
            return doc;
        }
        const hasOwnId = "id" in doc;
        if (!hasOwnId && doc._id) {
            doc.id = doc._id.toString();
            if (!remainOriginId) {
                delete doc._id;
            }
        }
        return doc;
    }
    pickVirtual(virtualDoc, pickMap, remainOriginId) {
        let needPick = false;
        if (typeof pickMap === "object") {
            for(const k in pickMap){
                if (pickMap[k]) {
                    needPick = true;
                    break;
                }
            }
        }
        if (needPick) {
            const newObj = {};
            if (typeof pickMap === "object") {
                for(const k in pickMap){
                    if (pickMap[k]) {
                        newObj[k] = virtualDoc[k];
                    }
                }
                if (pickMap.id) {
                    newObj._id = virtualDoc._id;
                    this.transferId(newObj, remainOriginId);
                }
            }
            return newObj;
        } else {
            if (typeof pickMap === "boolean") {
                if (pickMap) {
                    this.transferId(virtualDoc, remainOriginId);
                }
            } else {
                for(const k in pickMap){
                    if (!pickMap[k]) {
                        delete virtualDoc[k];
                    }
                }
                this.transferId(virtualDoc, remainOriginId);
            }
            return virtualDoc;
        }
    }
    formatBsonId(filter) {
        if (!filter) {
            return;
        }
        if (filter._id) {
            const id = filter._id;
            if (typeof id === "string") {
                filter._id = transToMongoId(id);
            } else if (Array.isArray(id.$in)) {
                id.$in = id.$in.map(transToMongoId);
            }
        }
        if (Array.isArray(filter.$or)) {
            filter.$or.forEach(this.formatBsonId.bind(this));
        }
        if (Array.isArray(filter.$and)) {
            filter.$and.forEach(this.formatBsonId.bind(this));
        }
    }
    async preHooks(hook, ...args) {
        if (!this.schema) {
            return;
        }
        const fns = this.schema.getPreHookByMethod(hook);
        if (fns) {
            await Promise.all(fns.map((fn)=>fn.apply(this, args)
            ));
        }
    }
    async postHooks(hook, ...args) {
        if (!this.schema) {
            return;
        }
        const fns = this.schema.getPostHookByMethod(hook);
        if (fns) {
            await Promise.all(fns.map((fn)=>fn.apply(this, args)
            ));
        }
    }
    async preInsert(docs) {
        docs.forEach((doc)=>{
            if (doc._id) {
                doc._id = transToMongoId(doc._id);
            }
        });
        if (!this.schema) {
            return;
        }
        await this.preHooks(MongoHookMethod.create, docs);
        this.checkMetaBeforeInsert(docs);
    }
    getFormattedDefault(defaultData) {
        if (defaultData !== undefined) {
            if (typeof defaultData === "function") {
                if (defaultData === Date.now || defaultData === Date) {
                    return new Date();
                } else {
                    return defaultData();
                }
            }
        }
        return defaultData;
    }
    checkMetaBeforeInsert(docs) {
        const data50 = this.schema.getMeta();
        if (!data50) {
            return;
        }
        for(const key in data50){
            const val = data50[key];
            if (!val || Object.keys(val).length === 0) {
                continue;
            }
            docs.forEach((doc)=>{
                for(const dk in doc){
                    if (!Object.prototype.hasOwnProperty.call(data50, dk) && dk !== "_id") {
                        console.warn(yellow1(`remove undefined key [${blue(dk)}] in Schema`));
                        delete doc[dk];
                    }
                }
                if (doc[key] === undefined && val.default !== undefined) {
                    doc[key] = this.getFormattedDefault(val.default);
                }
                const required = val.required;
                if (required) {
                    if (doc[key] == null) {
                        if (Array.isArray(required)) {
                            if (required[0]) {
                                throw new Error(required[1]);
                            }
                        } else {
                            throw new Error(`${key} is required!`);
                        }
                    }
                }
                if (val.validate) {
                    const result = val.validate.validator(doc[key]);
                    if (!result) {
                        throw new Error(val.validate.message);
                    }
                }
            });
        }
    }
    async afterInsert(docs) {
        await this.postHooks(MongoHookMethod.create, docs);
    }
    async insertOne(doc, options) {
        const { insertedIds  } = await this.insertMany([
            doc
        ], options);
        return insertedIds[0];
    }
    async insertMany(docs, options) {
        const clonedDocs = docs.map((doc)=>({
                ...doc
            })
        );
        await this.preInsert(clonedDocs);
        const res = await this.#collection.insertMany(clonedDocs, options);
        await this.afterInsert(clonedDocs);
        return res;
    }
    async save(doc, options) {
        const id = await this.insertOne(doc, options);
        const res = {
            ...doc,
            _id: id
        };
        this.transferId(res, options?.remainOriginId);
        const meta2 = this.schema.getMeta();
        if (meta2) {
            const newDoc = res;
            Object.keys(meta2).forEach((key)=>{
                const val = meta2[key];
                if (!val || newDoc[key] !== undefined || val.default === undefined) {
                    return;
                }
                newDoc[key] = this.getFormattedDefault(val.default);
            });
        }
        return res;
    }
    async preFindOneAndUpdate(filter, update1, options) {
        await this.preUpdateHook(MongoHookMethod.findOneAndUpdate, filter, update1, options);
    }
    async afterFindOneAndUpdate(doc, options) {
        await this.postHooks(MongoHookMethod.findOneAndUpdate, doc);
        if (options?.new) {
            this.transferId(doc, options.remainOriginId);
        }
    }
    findByIdAndUpdate(id, update2, options) {
        const filter = {
            _id: transToMongoId(id)
        };
        if (options) {
            return this.findOneAndUpdate(filter, update2, options);
        }
        return this.findOneAndUpdate(filter, update2);
    }
    findById(id, options) {
        const filter = {
            _id: transToMongoId(id)
        };
        return this.findOne(filter, options);
    }
    async findOneAndUpdate(filter, update3, options = {}) {
        await this.preFindOneAndUpdate(filter, update3, options);
        const updatedDoc = await this.#collection.findAndModify(filter, {
            update: update3,
            sort: options?.sort,
            new: options?.new,
            upsert: options?.upsert,
            fields: options?.fields
        });
        await this.afterFindOneAndUpdate(updatedDoc, options);
        return updatedDoc;
    }
    async preUpdateHook(hook, filter, doc1, options) {
        this.formatBsonId(filter);
        if (this.schema) {
            const data51 = this.schema.getMeta();
            const removeKey = (doc)=>{
                for(const dk in doc){
                    if (!Object.prototype.hasOwnProperty.call(doc, dk)) {
                        continue;
                    }
                    if (dk.startsWith("$")) {
                        removeKey(doc[dk]);
                    } else {
                        if (!Object.prototype.hasOwnProperty.call(data51, dk)) {
                            console.warn(yellow1(`remove undefined key [${blue(dk)}] in Schema`));
                            delete doc[dk];
                        }
                    }
                }
            };
            removeKey(doc1);
        }
        if (!hasAtomicOperators(doc1)) {
            const oldDoc = {
                ...doc1,
                modifyTime: new Date()
            };
            for(const key in doc1){
                if (Object.prototype.hasOwnProperty.call(doc1, key)) {
                    delete doc1[key];
                }
            }
            doc1["$set"] = oldDoc;
        } else {
            if (doc1["$set"]) {
                doc1["$set"]["modifyTime"] = new Date();
            } else {
                doc1["$set"] = {
                    modifyTime: new Date()
                };
            }
        }
        await this.preHooks(hook, filter, doc1, options);
    }
    async preUpdate(filter, doc, options) {
        await this.preUpdateHook(MongoHookMethod.update, filter, doc, options);
    }
    async afterUpdate(filter, doc, options) {
        await this.postHooks(MongoHookMethod.update, filter, doc, options);
    }
    async updateMany(filter, doc, options) {
        await this.preUpdate(filter, doc, options);
        const res = await this.#collection.updateMany(filter, doc, options);
        await this.afterUpdate(filter, doc, options);
        return res;
    }
    async updateOne(filter, update4, options) {
        await this.preUpdate(filter, update4, options);
        const res = await this.#collection.updateOne(filter, update4, options);
        await this.afterUpdate(filter, update4, options);
        return res;
    }
    async preDelete(filter, options) {
        this.formatBsonId(filter);
        await this.preHooks(MongoHookMethod.delete, filter, options);
    }
    async afterDelete(filter, options, res) {
        await this.postHooks(MongoHookMethod.delete, filter, options, res);
    }
    async deleteMany(filter, options) {
        await this.preDelete(filter, options);
        const res = await this.#collection.deleteMany(filter, options);
        await this.afterDelete(filter, options, res);
        return res;
    }
    delete = this.deleteMany;
    deleteOne(filter, options) {
        return this.delete(filter, {
            ...options,
            limit: 1
        });
    }
    findOneAndDelete = this.deleteOne;
    deleteById(id) {
        const filter = {
            _id: transToMongoId(id)
        };
        return this.deleteOne(filter);
    }
    findByIdAndDelete = this.deleteById;
    distinct(key, query, options) {
        return this.#collection.distinct(key, query, options);
    }
    aggregate(pipeline, options) {
        return this.#collection.aggregate(pipeline, options);
    }
    async syncIndexes() {
        if (!this.#schema) {
            return false;
        }
        await this.dropIndexes({
            index: "*"
        });
        await this.initModel();
        return true;
    }
    dropIndexes(options) {
        return this.#collection.dropIndexes(options);
    }
    drop() {
        return this.#collection.drop();
    }
    listIndexes() {
        return this.#collection.listIndexes();
    }
    createIndexes(options) {
        return this.#collection.createIndexes(options);
    }
    countDocuments(filter, options) {
        this.formatBsonId(filter);
        return this.#collection.countDocuments(filter, options);
    }
    async initModel() {
        assert3(this.schema, "schema is not defined");
        const data52 = this.schema.getMeta();
        const indexes = [];
        for(const key in data52){
            const map = data52[key];
            if (!map || Object.keys(map).length === 0 || !map.index) {
                continue;
            }
            const { index , required: _required , default: _default , validate: _validate , ...otherParams } = map;
            indexes.push({
                expireAfterSeconds: map.expires,
                name: key + "_1",
                key: {
                    [key]: index === "text" ? "text" : 1
                },
                ...otherParams
            });
        }
        if (indexes.length === 0) {
            return;
        }
        await this.#collection.createIndexes({
            indexes
        });
    }
}
function _applyDecoratedDescriptor1(target, property, decorators, descriptor, context) {
    var desc2 = {};
    Object.keys(descriptor).forEach(function(key) {
        desc2[key] = descriptor[key];
    });
    desc2.enumerable = !!desc2.enumerable;
    desc2.configurable = !!desc2.configurable;
    if ("value" in desc2 || desc2.initializer) {
        desc2.writable = true;
    }
    desc2 = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator ? decorator(target, property, desc) || desc : desc;
    }, desc2);
    if (context && desc2.initializer !== void 0) {
        desc2.value = desc2.initializer ? desc2.initializer.call(context) : void 0;
        desc2.initializer = undefined;
    }
    if (desc2.initializer === void 0) {
        Object.defineProperty(target, property, desc2);
        desc2 = null;
    }
    return desc2;
}
var _class1, _dec2;
class SchemaFactory {
    static caches = new Map();
    static register(name, schema) {
        this.caches.set(getFormattedModelName(name), schema);
    }
    static unregister(name) {
        this.caches.delete(getFormattedModelName(name));
    }
    static getSchemaByName(name) {
        return this.caches.get(getFormattedModelName(name));
    }
    static createForClass(Cls, name = Cls.name) {
        let schema = this.getSchemaByName(name);
        if (!schema) {
            schema = new BaseSchema(Cls);
            this.register(name, schema);
        }
        return schema;
    }
    static forFeature(arr) {
        arr.forEach((item)=>{
            this.register(item.name, item.schema);
        });
    }
}
class MongoClient {
    #cluster;
    #defaultDbName = "admin";
    #buildInfo;
    #initedDBPromise;
    get buildInfo() {
        return this.#buildInfo;
    }
    async connect(options) {
        try {
            const parsedOptions = typeof options === "string" ? await parse(options) : options;
            this.#defaultDbName = parsedOptions.db;
            const cluster = new Cluster(parsedOptions);
            await cluster.connect();
            await cluster.authenticate();
            await cluster.updateMaster();
            this.#cluster = cluster;
            this.#buildInfo = await this.runCommand(this.#defaultDbName, {
                buildInfo: 1
            });
        } catch (e) {
            throw new MongoDriverError(`Connection failed: ${e.message || e}`);
        }
        return this.database(options.db);
    }
    async listDatabases(options = {}) {
        assert3(this.#cluster);
        const { databases  } = await this.#cluster.protocol.commandSingle("admin", {
            listDatabases: 1,
            ...options
        });
        return databases;
    }
    async runCommand(db, body) {
        assert3(this.#cluster);
        return await this.#cluster.protocol.commandSingle(db, body);
    }
    database(name = this.#defaultDbName) {
        assert3(this.#cluster);
        return new Database(this.#cluster, name);
    }
    close() {
        if (this.#cluster) {
            this.#cluster.close();
        }
    }
    initDB(db) {
        if (!this.#initedDBPromise) {
            this.#initedDBPromise = this.connect(db).then(()=>{
                return parse(db.split("?")[0]);
            }).then((options)=>{
                console.info(`connected mongo：${yellow1(db)} and connected db：${yellow1(options.db)}`);
                return this.database(options.db);
            });
        }
        return this.#initedDBPromise;
    }
    async getCollection(name) {
        assert3(this.#initedDBPromise);
        const db = await this.#initedDBPromise;
        const schema = SchemaFactory.getSchemaByName(name);
        assert3(schema, `Schema [${name}] must be registered`);
        const modelName = getFormattedModelName(name);
        return this.getCollectionByDb(db, modelName, schema);
    }
    async getCollectionByDb(db, name, schema) {
        assert3(this.#cluster);
        const collection = new Collection1(this.#cluster.protocol, db.name, name);
        return new Model(schema, collection);
    }
}
let MongoFactory = ((_class1 = class MongoFactory {
    static #client;
    static #initPromise;
    static get client() {
        if (!this.#client) {
            this.#client = new MongoClient();
        }
        return this.#client;
    }
    static forRoot(url) {
        this.#initPromise = this.client.initDB(url);
        return this.#initPromise;
    }
    static getModel(modelNameOrCls) {
        let modelName;
        if (typeof modelNameOrCls === "string") {
            modelName = getFormattedModelName(modelNameOrCls);
        } else {
            modelName = getFormattedModelName(modelNameOrCls.name);
        }
        return this.getModelByName(modelName);
    }
    static async getModelByName(name) {
        assert3(this.#initPromise, "must be inited");
        await this.#initPromise;
        const model = await this.client.getCollection(name);
        try {
            await model.initModel();
        } catch (e) {
            const err1 = e;
            if (err1.code === ErrorCode.IndexOptionsConflict || err1.code === ErrorCode.IndexKeySpecsConflict) {
                console.debug(`Init index caused conflict error: ${err1.message}, and will try to drop it and create it again`);
                await model.syncIndexes().catch((err)=>{
                    console.error("Tried to syncIndexes but still failed and the reason is ", err);
                });
            } else {
                console.error("InitModel error", err1);
            }
        }
        console.log(`${yellow1("Schema")} [${green(name)}] ${blue("init ok")}`);
        return model;
    }
}) || _class1, _dec2 = Cache(-1), _applyDecoratedDescriptor1(_class1, "getModelByName", [
    _dec2
], Object.getOwnPropertyDescriptor(_class1, "getModelByName"), _class1), _class1);
function SchemaDecorator(name) {
    return (target)=>{
        SchemaFactory.createForClass(target, name);
    };
}
const defaultConfigOptions = {
    events: {},
    intents: [],
    botId: 0n,
    token: "",
    optional: {
        bot_owners_ids: [],
        bot_supporters_ids: [],
        bot_staff_ids: [],
        bot_default_prefix: "",
        bot_development_server_id: undefined,
        bot_cooldown_bypass_ids: [],
        bot_internal_logs: false,
        bot_mention_with_prefix: false
    },
    providers: {
        type: "disabled"
    }
};
class AkumaKodoCollection extends Map {
    maxSize;
    sweeper;
    constructor(entries, options){
        super(entries ?? []);
        this.maxSize = options?.maxSize;
        if (!options?.sweeper) return;
        this.startSweeper(options.sweeper);
    }
    startSweeper(options) {
        if (this.sweeper?.intervalId) clearInterval(this.sweeper.intervalId);
        this.sweeper = options;
        this.sweeper.intervalId = setInterval(()=>{
            this.forEach((value, key)=>{
                if (!this.sweeper?.filter(value, key, options.bot)) return;
                this.delete(key);
                return key;
            });
        }, options.interval);
        return this.sweeper.intervalId;
    }
    stopSweeper() {
        return clearInterval(this.sweeper?.intervalId);
    }
    changeSweeperInterval(newInterval) {
        if (!this.sweeper) return;
        this.startSweeper({
            filter: this.sweeper.filter,
            interval: newInterval
        });
    }
    changeSweeperFilter(newFilter) {
        if (!this.sweeper) return;
        this.startSweeper({
            filter: newFilter,
            interval: this.sweeper.interval
        });
    }
    set(key, value) {
        if ((this.maxSize || this.maxSize === 0) && this.size >= this.maxSize) {
            return this;
        }
        return super.set(key, value);
    }
    array() {
        return [
            ...this.values()
        ];
    }
    first() {
        return this.values().next().value;
    }
    last() {
        return [
            ...this.values()
        ][this.size - 1];
    }
    random() {
        const array = [
            ...this.values()
        ];
        return array[Math.floor(Math.random() * array.length)];
    }
    find(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return value;
        }
        return;
    }
    filter(callback) {
        const relevant = new AkumaKodoCollection();
        this.forEach((value, key)=>{
            if (callback(value, key)) relevant.set(key, value);
        });
        return relevant;
    }
    map(callback) {
        const results = [];
        for (const key of this.keys()){
            const value = this.get(key);
            results.push(callback(value, key));
        }
        return results;
    }
    some(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return true;
        }
        return false;
    }
    every(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (!callback(value, key)) return false;
        }
        return true;
    }
    reduce(callback, initialValue) {
        let accumulator = initialValue;
        for (const key of this.keys()){
            const value = this.get(key);
            accumulator = callback(accumulator, value, key);
        }
        return accumulator;
    }
}
var Loglevels;
(function(Loglevels1) {
    Loglevels1[Loglevels1["Debug"] = 0] = "Debug";
    Loglevels1[Loglevels1["Info"] = 1] = "Info";
    Loglevels1[Loglevels1["Warn"] = 2] = "Warn";
    Loglevels1[Loglevels1["Error"] = 3] = "Error";
    Loglevels1[Loglevels1["Fatal"] = 4] = "Fatal";
    Loglevels1[Loglevels1["Table"] = 5] = "Table";
})(Loglevels || (Loglevels = {}));
const prefixes = new Map([
    [
        Loglevels.Debug,
        "DEBUG"
    ],
    [
        Loglevels.Info,
        "INFO"
    ],
    [
        Loglevels.Warn,
        "WARN"
    ],
    [
        Loglevels.Error,
        "ERROR"
    ],
    [
        Loglevels.Fatal,
        "FATAL"
    ],
    [
        Loglevels.Table,
        "TABLE"
    ], 
]);
const noColor2 = (msg)=>msg
;
const colorFunctions = new Map([
    [
        Loglevels.Debug,
        gray
    ],
    [
        Loglevels.Info,
        cyan
    ],
    [
        Loglevels.Warn,
        yellow
    ],
    [
        Loglevels.Error,
        (str)=>red(str)
    ],
    [
        Loglevels.Fatal,
        (str)=>red(bold(italic(str)))
    ],
    [
        Loglevels.Table,
        magenta
    ], 
]);
function logger({ logLevel =Loglevels.Info , name  } = {}) {
    function log1(level, ...args) {
        if (level < logLevel) return;
        let color = colorFunctions.get(level);
        if (!color) color = noColor2;
        const date = new Date();
        const log2 = [
            `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
            color(prefixes.get(level) || "DEBUG"),
            name ? `${name} >` : ">",
            ...args, 
        ];
        switch(level){
            case Loglevels.Debug:
                return console.debug(...log2);
            case Loglevels.Info:
                return console.info(...log2);
            case Loglevels.Warn:
                return console.warn(...log2);
            case Loglevels.Error:
                return console.error(...log2);
            case Loglevels.Fatal:
                return console.error(...log2);
            case Loglevels.Table:
                return console.table(...log2);
            default:
                return console.log(...log2);
        }
    }
    function setLevel(level) {
        logLevel = level;
    }
    function debug(...args) {
        log1(Loglevels.Debug, ...args);
    }
    function table(...args) {
        log1(Loglevels.Table, ...args);
    }
    function info(...args) {
        log1(Loglevels.Info, ...args);
    }
    function warn(...args) {
        log1(Loglevels.Warn, ...args);
    }
    function error(...args) {
        log1(Loglevels.Error, ...args);
    }
    function fatal(...args) {
        log1(Loglevels.Fatal, ...args);
    }
    return {
        log: log1,
        setLevel,
        debug,
        info,
        warn,
        error,
        fatal,
        table
    };
}
const log = logger;
class AkumaKodoLogger {
    configuration;
    constructor(config){
        if (!config) {
            this.configuration = defaultConfigOptions;
        }
        this.configuration = config;
    }
    create(level, event, context) {
        if (!this.configuration?.optional.bot_debug_mode) return;
        try {
            switch(level){
                case "debug":
                    log({
                        logLevel: Loglevels.Debug,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).debug(context);
                    break;
                case "info":
                    log({
                        logLevel: Loglevels.Info,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).info(context);
                    break;
                case "warn":
                    log({
                        logLevel: Loglevels.Warn,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).warn(context);
                    break;
                case "error":
                    log({
                        logLevel: Loglevels.Error,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).error(context);
                    break;
                case "fatal":
                    log({
                        logLevel: Loglevels.Fatal,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).fatal(context);
                    break;
                case "table":
                    log({
                        logLevel: Loglevels.Table,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).info(context);
                    break;
                default:
                    log({
                        logLevel: Loglevels.Info,
                        name: `AkumaKodo Internal - ${event.toUpperCase()}`
                    }).info(context);
                    break;
            }
        } catch (e) {
            log({
                logLevel: Loglevels.Error,
                name: `AkumaKodo Internal - ${event.toUpperCase()}`
            }).error(e);
        }
    }
}
function delay(ms) {
    return new Promise((res)=>setTimeout(()=>{
            res();
        }, ms)
    );
}
var Milliseconds;
(function(Milliseconds1) {
    Milliseconds1[Milliseconds1["Year"] = 31104000000] = "Year";
    Milliseconds1[Milliseconds1["Month"] = 2592000000] = "Month";
    Milliseconds1[Milliseconds1["Week"] = 604800000] = "Week";
    Milliseconds1[Milliseconds1["Day"] = 86400000] = "Day";
    Milliseconds1[Milliseconds1["Hour"] = 3600000] = "Hour";
    Milliseconds1[Milliseconds1["Minute"] = 60000] = "Minute";
    Milliseconds1[Milliseconds1["Second"] = 1000] = "Second";
})(Milliseconds || (Milliseconds = {}));
class AkumaKodoTaskModule {
    client;
    container;
    constructor(client, container){
        this.client = client;
        this.container = container;
    }
    initializeTask() {
        for (const task of this.container.taskCollection.values()){
            this.container.runningTasks.initialTimeouts.push(setTimeout(async ()=>{
                try {
                    await task.execute();
                    this.container.logger.create("info", "initialize Task", `Task ${task.name} executed`);
                } catch (error1) {
                    this.container.logger.create("error", "initialize Task", `Task ${task.name} failed to execute.\n ${error1}`);
                }
                this.container.runningTasks.initialTimeouts.push(setInterval(async ()=>{
                    if (!this.container.fullyReady) return;
                    try {
                        await task.execute();
                        this.container.logger.create("info", "initialize Task", `Task ${task.name} executed`);
                    } catch (error) {
                        this.container.logger.create("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
                    }
                }, task.interval));
            }, (task.interval - Date.now() % task.interval) ?? undefined));
        }
        this.container.logger.create("info", "initialize Task", `Task module initialized`);
    }
    createAkumaKodoTask(task, callback) {
        this.container.taskCollection.set(task.name, task);
        if (callback) {
            callback();
        }
        this.container.logger.create("info", "create AkumaKodo Task", `Task ${task.name} created`);
    }
    destroyTask(callback) {
        for (const task of this.container.runningTasks.initialTimeouts){
            clearTimeout(task);
        }
        for (const task1 of this.container.runningTasks.intervals)clearInterval(task1);
        this.container.taskCollection = new AkumaKodoCollection();
        this.container.runningTasks = {
            initialTimeouts: [],
            intervals: []
        };
        this.container.logger.create("info", "destroy Task", "All tasks destroyed!");
        if (callback) {
            callback();
        }
    }
}
const embedLimits = {
    title: 256,
    description: 4096,
    fieldName: 256,
    fieldValue: 1024,
    footerText: 2048,
    authorName: 256,
    fields: 25,
    total: 6000
};
class AkumaKodoEmbed {
    currentTotal = 0;
    enforceLimits = true;
    file;
    color = 4320244;
    fields = [];
    author;
    description;
    footer;
    image;
    timestamp;
    title;
    thumbnail;
    url;
    constructor(options, enforceLimits = true){
        if (!enforceLimits) this.enforceLimits = false;
        if (options) {
            if (options.color) this.color = options.color;
            if (options.fields) this.fields = options.fields;
            if (options.author) this.author = options.author;
            if (options.description) this.description = options.description;
            if (options.footer) this.footer = options.footer;
            if (options.image) this.image = options.image;
            if (options.timestamp) this.timestamp = options.timestamp;
            if (options.title) this.title = options.title;
            if (options.thumbnail) this.thumbnail = options.thumbnail;
            if (options.url) this.url = options.url;
        }
        return this;
    }
    fitData(data53, max) {
        if (data53.length > max) data53 = data53.substring(0, max);
        const availableCharacters = embedLimits.total - this.currentTotal;
        if (!availableCharacters) return ``;
        if (this.currentTotal + data53.length > embedLimits.total) {
            return data53.substring(0, availableCharacters);
        }
        return data53;
    }
    setAuthor(name, icon, url) {
        const finalName = this.enforceLimits ? this.fitData(name, embedLimits.authorName) : name;
        this.author = {
            name: finalName,
            iconUrl: icon,
            url
        };
        return this;
    }
    setColor(color) {
        this.color = color.toLowerCase() === `random` ? Math.floor(Math.random() * (16777215 + 1)) : parseInt(color.replace("#", ""), 16);
        return this;
    }
    setDescription(description) {
        if (Array.isArray(description)) description = description.join("\n");
        this.description = this.fitData(description, embedLimits.description);
        return this;
    }
    addField(name, value, inline = false) {
        if (this.fields.length >= 25) return this;
        this.fields.push({
            name: this.fitData(name, embedLimits.fieldName),
            value: this.fitData(value, embedLimits.fieldValue),
            inline
        });
        return this;
    }
    addBlankField(inline = false) {
        return this.addField("\u200B", "\u200B", inline);
    }
    attachFile(file, name) {
        this.file = {
            blob: file,
            name
        };
        this.setImage(`attachment://${name}`);
        return this;
    }
    setFooter(text, icon) {
        this.footer = {
            text: this.fitData(text, embedLimits.footerText),
            iconUrl: icon
        };
        return this;
    }
    setImage(url) {
        this.image = {
            url
        };
        return this;
    }
    setTimestamp(time = Date.now()) {
        this.timestamp = new Date(time).toISOString();
        return this;
    }
    setTitle(title, url) {
        this.title = this.fitData(title, embedLimits.title);
        if (url) this.url = url;
        return this;
    }
    setThumbnail(url) {
        this.thumbnail = {
            url
        };
        return this;
    }
}
function createAkumaKodoEmbed(options) {
    return new AkumaKodoEmbed({
        ...options
    });
}
class AkumaKodoVersionControl {
    logger;
    RequiredDenoVersion;
    constructor(config){
        this.RequiredDenoVersion = "1.19.0";
        this.logger = new AkumaKodoLogger(config);
    }
    validate() {
        const internalVersion = this.RequiredDenoVersion.split(".");
        const _ = AkumaKodoVersionControl.getInternalVersion();
        const userVersion = _.split(".");
        for(let i152 = 0; i152 < 3; i152++){
            const o = Number(internalVersion[i152]);
            const n = Number(userVersion[i152]);
            if (o > n) {
                this.logger.create("warn", "Version Control", "The version of the project is less than the required version. Please update to deno " + this.RequiredDenoVersion);
                return 1;
            }
            if (o < n) {
                this.logger.create("info", "Version Control", "The version of the project is greater than the required version. You can ignore this log. Recommended version: " + this.RequiredDenoVersion);
                return -1;
            }
            if (!isNaN(o) && isNaN(n)) {
                this.logger.create("debug", "Version Control", "The version of the project is greater than the required version. You can ignore this log. Recommended version: " + this.RequiredDenoVersion);
                return 1;
            }
            if (isNaN(o) && !isNaN(n)) {
                this.logger.create("debug", "Version Control", "The version of the project is greater than the required version. Please update to deno " + this.RequiredDenoVersion);
                return -1;
            }
        }
        this.logger.create("debug", "VersionControl", "The version of the project is up to date.");
        return 0;
    }
    static getInternalVersion() {
        return Deno.version.deno;
    }
}
function _applyDecoratedDescriptor2(target, property, decorators, descriptor, context) {
    var desc3 = {};
    Object.keys(descriptor).forEach(function(key) {
        desc3[key] = descriptor[key];
    });
    desc3.enumerable = !!desc3.enumerable;
    desc3.configurable = !!desc3.configurable;
    if ("value" in desc3 || desc3.initializer) {
        desc3.writable = true;
    }
    desc3 = decorators.slice().reverse().reduce(function(desc, decorator) {
        return decorator ? decorator(target, property, desc) || desc : desc;
    }, desc3);
    if (context && desc3.initializer !== void 0) {
        desc3.value = desc3.initializer ? desc3.initializer.call(context) : void 0;
        desc3.initializer = undefined;
    }
    if (desc3.initializer === void 0) {
        Object.defineProperty(target, property, desc3);
        desc3 = null;
    }
    return desc3;
}
class AkumaKodoProvider {
    logger;
    constructor(options, config){
        this.logger = new AkumaKodoLogger(config);
        if (options.provider === "mongodb") {
            if (!options.mongodb_connection_url) {
                throw new Error("MongoDB connection URL is required with this provider.");
            }
            this.logger.create("info", "Provider", "MongoDB provider loaded!");
        } else if (options.provider === "postgres") {
            this.logger.create("info", "Provider", "PostgreSQL provider loaded!");
        } else if (options.provider === "mysql") {
            this.logger.create("info", "Provider", "MySQL provider loaded!");
        } else {
            throw new Error("Invalid provider type! Please use one of the following: mongodb, postgres, mysql");
        }
    }
}
function _initializerDefineProperty1(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}
var _class2, _descriptor2, _dec3, _descriptor11, _dec11;
var _dec22 = SchemaDecorator();
let InternalMongoSchema = _class2 = _dec22(((_class2 = class InternalMongoSchema extends Schema {
    constructor(...args){
        super(...args);
        _initializerDefineProperty1(this, "guildId", _descriptor2, this);
        _initializerDefineProperty1(this, "settings", _descriptor11, this);
    }
}) || _class2, _dec3 = Prop({
    required: true
}), _dec11 = Prop({
    required: false,
    default: {}
}), _descriptor2 = _applyDecoratedDescriptor2(_class2.prototype, "guildId", [
    _dec3
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
}), _descriptor11 = _applyDecoratedDescriptor2(_class2.prototype, "settings", [
    _dec11
], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
}), _class2)) || _class2;
class AkumaKodoMongodbProvider extends AkumaKodoProvider {
    metadata;
    database_name;
    options;
    instance;
    connectedStatus;
    constructor(options, config, name){
        super(options, config);
        this.options = options;
        if (!name) name = "AkumaKodo";
        this.database_name = name;
        this.instance = MongoFactory.getModel(InternalMongoSchema);
        this.metadata = new AkumaKodoCollection();
        this.connectedStatus = false;
    }
    async connect() {
        while(!this.connectedStatus){
            try {
                let url = this.options.mongodb_connection_url;
                if (!url) url = "mongodb://localhost:27017";
                await MongoFactory.forRoot(url);
                this.logger.create("info", "Mongo Provider", `Connection success on > ${url}`);
            } catch (e) {
                this.logger.create("error", "Mongodb Provider", `Failed to connect to the database.\n ${e}`);
            }
        }
    }
    async initialize() {
        if (this.connectedStatus) {
            await (await this.instance).initModel();
            const data54 = await (await this.instance).findMany();
            for (const item of data54){
                this.metadata.set(item.guildId, item.settings);
            }
            this.logger.create("info", "Mongo Provider initialize", `Successfully loaded ${data54.length} documents from the database.`);
        } else {
            this.logger.create("error", "Mongodb Provider initialize", `Failed to initialize the database. Please check your connection.`);
        }
    }
    get(id, key, defaultValue) {
        const data55 = this.metadata.get(id);
        if (data55) {
            this.logger.create("info", "Mongo Provider get", `Fetched value from cache. Guild: ${id} Key: ${key} Value: ${data55.settings[key]}`);
            return data55.settings[key];
        }
        this.logger.create("warn", "Mongo Provider get", `Failed to get the value for ${id}. Returning default value.`);
        return defaultValue;
    }
    async set(id, key, value) {
        const data56 = this.metadata.get(id);
        if (data56) {
            const newData = data56.settings[key] = value;
            this.metadata.set(id, newData);
        }
        await (await this.instance).updateOne({
            guildId: id
        }, {
            $set: {
                settings: {
                    [key]: value
                }
            }
        }, {
            upsert: true
        });
        this.logger.create("info", "Mongo Provider set", `Successfully set ${key} to ${value} for guild ${id}`);
    }
    async delete(id, key) {
        const data57 = this.metadata.get(id);
        if (data57) {
            delete data57.settings[key];
            this.metadata.set(id, {
                ...data57,
                settings: {
                    ...data57.settings
                }
            });
        }
        await (await this.instance).deleteOne({
            guildId: id
        });
        this.logger.create("info", "Mongo Provider delete", `Deleted ${key} from guild ${id}`);
    }
    async clear(id) {
        this.metadata.delete(id);
        await (await this.instance).deleteOne({
            guildId: id
        });
        this.logger.create("info", "Mongo Provider clear", `Cleared all data for guild ${id}`);
    }
}
class AkumaKodoBotCore extends EventEmitter {
    launcher;
    versionControl;
    configuration;
    client;
    container;
    constructor(config){
        super();
        if (!config) {
            this.configuration = defaultConfigOptions;
        }
        this.versionControl = new AkumaKodoVersionControl(config);
        this.versionControl.validate();
        config.optional.bot_owners_ids = config.optional.bot_owners_ids || [];
        config.optional.bot_mention_with_prefix = config.optional.bot_mention_with_prefix || false;
        config.optional.bot_default_prefix = config.optional.bot_default_prefix || undefined;
        config.optional.bot_development_server_id = config.optional.bot_development_server_id || undefined;
        config.optional.bot_cooldown_bypass_ids = config.optional.bot_cooldown_bypass_ids || [];
        config.optional.bot_debug_mode = config.optional.bot_debug_mode || false;
        config.optional.bot_supporters_ids = config.optional.bot_supporters_ids || [];
        this.configuration = config;
        this.client = enableCachePlugin(createBot(config));
        enableHelpersPlugin(this.client);
        enableCachePlugin(this.client);
        enableCacheSweepers(this.client);
        enablePermissionsPlugin(this.client);
        this.container = {
            providers: {
                mongodb: new AkumaKodoMongodbProvider({
                    provider: "mongodb",
                    mongodb_connection_url: config.providers?.mongodb_connection_url
                }, {
                    ...config
                })
            },
            defaultCooldown: {
                seconds: Milliseconds.Second * 5,
                allowedUses: 1
            },
            ignoreCooldown: config.optional.bot_cooldown_bypass_ids,
            prefix: config.optional.bot_default_prefix,
            runningTasks: {
                intervals: [],
                initialTimeouts: []
            },
            commands: new AkumaKodoCollection(),
            taskCollection: new AkumaKodoCollection(),
            monitorCollection: new AkumaKodoCollection(),
            languageCollection: new AkumaKodoCollection(),
            fullyReady: false,
            logger: new AkumaKodoLogger(this.configuration),
            mentionWithPrefix: true,
            utils: {
                createEmbed (options) {
                    createAkumaKodoEmbed(options);
                },
                createTask (client, task) {
                    client.launcher.task.createAkumaKodoTask(task);
                },
                destroyTasks (client) {
                    client.launcher.task.destroyTask();
                },
                embed () {
                    return new AkumaKodoEmbed();
                }
            }
        };
        this.launcher = {
            task: new AkumaKodoTaskModule(this.client, this.container)
        };
        this.container.logger.create("info", "AkumaKodo Bot Core", "Core initialized.");
    }
    async createBot() {
        await startBot(this.client);
        this.client.events.ready = (bot, payload)=>{
            const Bot = bot;
            if (payload.shardId + 1 === Bot.gateway.maxShards) {
                this.container.fullyReady = true;
                this.container.logger.create("info", "createBot", "AkumaKodo Connection successful!");
            }
        };
    }
    async destroyBot() {
        await delay(1000);
        await stopBot(this.client);
        this.container.logger.create("info", "destroyBot", "Connection destroy successful!");
    }
    on(eventName, listener) {
        this.addEvent(eventName.toString());
        return super.on(eventName, listener);
    }
    addEvent(event) {
        this.client.events[event] = (...args)=>this.emit(event, ...args.slice(1))
        ;
    }
}
export { AkumaKodoBotCore as AkumaKodoBotCore };
export { AkumaKodoMongodbProvider as AkumaKodoMongodbProvider };
export { AkumaKodoCollection as AkumaKodoCollection };
export { AkumaKodoEmbed as AkumaKodoEmbed };
export { AkumaKodoTaskModule as AkumaKodoTaskModule };
