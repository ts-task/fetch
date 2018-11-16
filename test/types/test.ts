import { fetch } from '@ts-task/fetch';

fetch('https://jsonplaceholder.typicode.com/todos/1')
    .chain(res => res.json());