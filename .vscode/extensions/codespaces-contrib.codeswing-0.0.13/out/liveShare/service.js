"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Implement more features
/*
interface Message {
  data?: any;
  peer?: number;
}

const SWING_OPENED_NOTIFICATION = "swingOpened";
const SWING_CLOSED_NOTIFICATION = "swingClosed";*/
function default_1(api, peer, service, broadcastNotifications = false) {
    /*
    onDidCloseSwing(() => {
      service.notify(SWING_CLOSED_NOTIFICATION, { peer });
    });
  
    service.onNotify(SWING_CLOSED_NOTIFICATION, (message: Message) => {
      if (message.peer === peer) return;
      store.activeSwing?.webViewPanel.dispose();
  
      if (broadcastNotifications) {
        service.notify(SWING_CLOSED_NOTIFICATION, message);
      }
    });
  
    onDidOpenSwing((uri) => {
      let sharedUri;
      if (api.session.role === Role.Host) {
        sharedUri = api.convertLocalUriToShared(uri).toString();
      } else {
        sharedUri = api.convertSharedUriToLocal(uri).toString();
      }
  
      const message = {
        peer,
        data: {
          uri: sharedUri,
        },
      };
  
      service.notify(SWING_OPENED_NOTIFICATION, message);
    });
  
    service.onNotify(SWING_OPENED_NOTIFICATION, (message: Message) => {
      if (message.peer === peer) return;
      openSwing(message.data.uri);
  
      if (broadcastNotifications) {
        service.notify(SWING_OPENED_NOTIFICATION, message);
      }
    });*/
}
exports.default = default_1;
//# sourceMappingURL=service.js.map