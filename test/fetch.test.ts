/// <reference types="jest" />
/// <reference types="node" />

import { fetch } from '../src/taskFetch';
import { assertFork, jestAssertUntypedNeverCalled } from './helpers';

describe('fetch', () => {
    let fetchMock = jest.fn();

    beforeEach(() => {
        fetchMock = jest.fn();
        require('../src/taskFetch').dependencies.fetch = fetchMock;
    });

    it('Resolves if returns correctly', cb => {
        fetchMock.mockReturnValue(Promise.resolve('yeay'));
        fetch('https://jsonplaceholder.typicode.com/todos/1').fork(
            jestAssertUntypedNeverCalled(cb),
            assertFork(cb, response => {
                // $ExpectType Response
                response;
                expect(response).toBe('yeay');
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

});
