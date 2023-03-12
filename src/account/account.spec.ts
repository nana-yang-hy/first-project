import {getHomePage, signIn, getMember, updateMember, deleteMember, client} from "./account";
import {defineConfig} from "vitest/config";
import {beforeAll, afterEach, describe, expect, test, afterAll} from 'vitest'
import {setupServer} from 'msw/node';
import {rest} from 'msw';


export default defineConfig({
    test: {
        globals: true
    }
})
test("Web api GET method test", () => {
    const testMethod = getHomePage();
    const server = setupServer(testMethod);
    beforeAll(() => {
        server.listen({onUnhandledRequest: "error"})
    });
    afterEach(() => {
        server.resetHandlers()
    });
    afterAll(() => {
        server.close()
    });
})
test("Post request: add member test", () => {
    const testMethod = signIn();
    const server = setupServer(testMethod);
    beforeAll(() => {
        server.listen({onUnhandledRequest: "error"})
    });
    afterEach(() => {
        server.resetHandlers();
    });
    afterAll(() => {
        server.close()
    });
})
// test("Get method: get member test", () => {
//
//     beforeAll(() => {
//         server.listen({onUnhandledRequest: "error"})
//     });
//     afterEach(() => {
//         server.resetHandlers()
//     });
//     afterAll(() => {
//         server.close()
//     });
// })


