import { Task } from '@ts-task/task';

export const dependencies = {
    fetch: (typeof window !== 'undefined' && window.fetch) ? window.fetch : null
};

/**
 * The Fetch API provides an interface for fetching resources
 * @param input the path to the resource you want to fetch
 * @param init  An init options object to configure the Request
 * @returns A Task that resolves to the Response for the request, whether it is successful or not.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
export function fetch (input: RequestInfo, init?: RequestInit) {
    if (dependencies.fetch === null) {
        return Task.reject(new TypeError('The fetch function is not defined, you should install node-fetch or use a polyfill'));
    }
    return Task.fromPromise<Response, TypeError>(dependencies.fetch(input, init));
}
