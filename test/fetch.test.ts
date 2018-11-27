/// <reference types="jest" />
/// <reference types="node" />

import { fetch, isAbortError } from '../src/taskFetch';
import { assertFork, jestAssertUntypedNeverCalled } from './helpers';

describe('fetch', () => {
    let fetchMock = jest.fn();

    beforeEach(() => {
        fetchMock = jest.fn();
        require('../src/taskFetch').dependencies.fetch = fetchMock;
    });

    it('Resolves if returns correctly', cb => {
        fetchMock.mockReturnValue(Promise.resolve({ok: true}));
        fetch('https://jsonplaceholder.typicode.com/todos/1').fork(
            jestAssertUntypedNeverCalled(cb),
            assertFork(cb, response => {
                // $ExpectType Response
                response;
                expect(response.ok).toBe(true);
            })
        );
    });

    it('Rejects if returns an error', cb => {
        fetchMock.mockReturnValue(Promise.reject('buu'));
        fetch('https://jsonplaceholder.typicode.com/todos/1').fork(
            assertFork(cb, err => {
                // $ExpectType TypeError
                err;
                expect(err).toBe('buu');
            }),
            jestAssertUntypedNeverCalled(cb)
        );
    });

    it('Rejects if there is no dependency', cb => {
        require('../src/taskFetch').dependencies.fetch = null;
        fetch('https://jsonplaceholder.typicode.com/todos/1').fork(
            assertFork(cb, err => {
                // $ExpectType TypeError
                err;
                expect(err).toBeInstanceOf(TypeError);
            }),
            jestAssertUntypedNeverCalled(cb)
        );
    });

    describe('response', () => {
        it('res.json() is wrapped to return a task', cb => {
            const res = {
                json: () => Promise.resolve('somejson')
            };
            fetchMock.mockReturnValue(Promise.resolve(res));
            fetch('https://jsonplaceholder.typicode.com/todos/1')
                .chain(res => {
                    // $ExpectType () => Task<any, TypeError | UnknownError>
                    res.json;
                    return res.json();
                })
                .fork(
                    jestAssertUntypedNeverCalled(cb),
                    assertFork(cb, json => {
                        // $ExpectType any
                        json;
                        expect(json).toBe('somejson');
                    })
                );
        });
        it('res.clone() is re-wrapped', cb => {
            const res = {
                json: () => Promise.resolve('somejson'),
                clone: () => res
            };
            fetchMock.mockReturnValue(Promise.resolve(res));
            fetch('https://jsonplaceholder.typicode.com/todos/1')
                .map(res => res.clone())
                .chain(res => {
                    // $ExpectType () => Task<any, TypeError | UnknownError>
                    res.json;
                    return res.json();
                })
                .fork(
                    jestAssertUntypedNeverCalled(cb),
                    assertFork(cb, json => {
                        // $ExpectType any
                        json;
                        expect(json).toBe('somejson');
                    })
                );
        });
    });
});

describe('isAbortError', () => {
    it('should return true when an AbortError is provided', () => {
        const error = new DOMException('AbortError', 'AbortError');
        expect(isAbortError(error)).toBe(true);
    });

    it('should return false when other error is provided', () => {
        const error = new TypeError('some other error ');
        expect(isAbortError(error)).toBe(false);
    });
});
