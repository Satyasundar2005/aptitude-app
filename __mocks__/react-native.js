if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class MockWebSocket {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

module.exports = {
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: 'active',
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
};

