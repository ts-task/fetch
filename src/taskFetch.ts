import { Task, UnknownError } from '@ts-task/task';

/**
 * Object that holds the reference to the real fetch function. If it's defined in the window
 * it uses that, if not, you can change it if you like.
 */
export const dependencies = {
    fetch: (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : null
};

export namespace TaskFetch {
    export interface Body {
        /**
         * A simple getter used to expose a ReadableStream of the body contents.
         */
        readonly body: ReadableStream | null;
        /**
         * Stores a Boolean that declares whether the body has been used in a response yet.
         */
        readonly bodyUsed: boolean;
        /**
         * Takes a Response stream and reads it to completion.
         * It returns a task that resolves with an ArrayBuffer.
         */
        arrayBuffer (): Task<ArrayBuffer, TypeError | UnknownError>;
        /**
         * Takes a Response stream and reads it to completion.
         * It returns a task that resolves with a Blob.
         */
        blob (): Task<Blob, TypeError | UnknownError>;
        /**
         * Takes a Response stream and reads it to completion.
         * It returns a task that resolves with a FormData object.
         */
        formData (): Task<FormData, TypeError | UnknownError>;
        /**
         * Takes a Response stream and reads it to completion. It returns a task
         * that resolves with the result of parsing the body text as JSON.
         */
        json (): Task<any, TypeError | UnknownError>;
        /**
         * Takes a Response stream and reads it to completion.
         * It returns a task that resolves with a USVString (text).
         */
        text (): Task<string, TypeError | UnknownError>;
    }

    export interface Response extends TaskFetch.Body {
        /**
         * Contains the Headers object associated with the response.
         */
        readonly headers: Headers;
        /**
         * Contains a boolean stating whether the response
         * was successful (status in the range 200-299) or not.
         */
        readonly ok: boolean;
        /**
         * Indicates whether or not the response is the result of a redirect;
         * that is, its URL list has more than one entry.
         */
        readonly redirected: boolean;
        /**
         * Contains the status code of the response (e.g., 200 for a success).
         */
        readonly status: number;
        /**
         * Contains the status message corresponding to the status code (e.g., OK for 200).
         */
        readonly statusText: string;
        readonly trailer: Task<Headers, UnknownError>;
        /**
         * Contains the type of the response (e.g., basic, cors).
         */
        readonly type: ResponseType;
        /**
         * Contains the URL of the response.
         */
        readonly url: string;
        /**
         * Creates a clone of a Response object.
         */
        clone (): TaskFetch.Response;
    }
}

/**
 * @ignore
 */
const promisedMethods = ['arrayBuffer', 'blob', 'formData', 'json', 'text', 'trailer'];

/**
 * This is the proxy of the Response object that returns fetch
 * @ignore
 */
const responseProxyHandler: ProxyHandler<Response> = {
    get: (target, propKey) => {
        // If we are asked for a method that returns a promise, convert it to task
        if (typeof propKey === 'string' && promisedMethods.indexOf(propKey) !== -1) {
            return () => Task.fromPromise((target as any)[propKey]());
        }
        // If we are asked to clone the response, then clone it, but also wrap it with
        // the proxy
        else if (propKey === 'clone') {
            return () => wrapInProxy(target.clone());
        }
        // If it is another property, return it as is
        else {
            return (target as any)[propKey];
        }
    }
};

function wrapInProxy (res: Response): TaskFetch.Response {
    return new Proxy(res, responseProxyHandler) as any as TaskFetch.Response;
}

/**
 * The Fetch API provides an interface for fetching resources
 * @param input the path to the resource you want to fetch
 * @param init  An init options object to configure the Request
 * @returns A Task that resolves to the Response for the request, whether it is successful or not.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
export function fetch (input: RequestInfo, init?: RequestInit) {
    // If the dependency is not set reject with a TypeError
    if (dependencies.fetch === null) {
        return Task.reject(new TypeError('The fetch function is not defined, you should install node-fetch or use a polyfill'));
    }
    // Convert the real fetch into a task
    return Task.fromPromise<TaskFetch.Response, TypeError>(
        // Do the actual fetch and return a proxy to the response that uses methods
        // that returns task insted of promises
        dependencies.fetch(input, init)
            .then(wrapInProxy)
    );
}
