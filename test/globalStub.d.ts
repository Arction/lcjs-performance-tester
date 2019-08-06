// Type definitions for globalStub

declare function stubForCodemirror(): void
declare function stubFetch(): void
declare function stubTern(): void
declare function setUserAgent( userAgent: string ): void
declare function resetUserAgent(): void
declare function setGlobal( name: string, value: any ): void

declare const UAStrings: {
    IE: string,
    CHROME: string,
    EDGE: string
}

export {
    stubForCodemirror,
    stubFetch,
    stubTern,
    setUserAgent,
    resetUserAgent,
    UAStrings,
    setGlobal
}
