import { fetch } from '@ts-task/fetch';
import { Task } from '@ts-task/task';

fetch('https://jsonplaceholder.typicode.com/todos/1')
    .chain(res => res.json())
    .catch(err => {
        err; // $ExpectType TypeError | UnknownError
        return Task.reject(err);
    })
;

const c = new AbortController();

fetch('https://jsonplaceholder.typicode.com/todos/1', {signal: c.signal})
    .chain(res => res.json())
    .catch(err => {
        // TODO: this test is broken by some problem in typescript order.
        // depending on typescript versions
        err; // $ ExpectType TypeError | AbortError | UnknownError
        return Task.reject(err);
    })
;
