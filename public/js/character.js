(async function waitForSocketId() {
    while (!socket.id) {
        await sleep(100);
    }

    


})();
