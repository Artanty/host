const FAQ_BACK_URL = 'FAQ_BACK_URL_PLACEHOLDER';
const STAT_BACK_URL = 'STAT_BACK_URL_PLACEHOLDER';
const PROJECT_ID = 'PROJECT_ID_PLACEHOLDER' + '@github'
const NAMESPACE = 'NAMESPACE_PLACEHOLDER'
const SLAVE_REPO = 'SLAVE_REPO_PLACEHOLDER'
const COMMIT = 'COMMIT_PLACEHOLDER'
let count = 0

chrome.alarms.create('openPopup', { periodInMinutes: 1 });

chrome.alarms.create('sendStat', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener( async (alarm) => {
  if (alarm.name === 'openPopup') {
    const popupIsOpen = await isPopupOpen();
    if (popupIsOpen) {
      console.log('Popup is already open. Skipping openPopup.');
      return;
    }
    askToOpen()
  }
  if (alarm.name === 'sendStat') {
    sendStatEvent({ 
      stage: 'RUNTIME', 
      data: JSON.stringify({
        projectId: `${PROJECT_ID}`,
        slaveRepo: `${SLAVE_REPO}`,
        commit: `${COMMIT}`
      })
    });
  }
});

async function askToOpen () {
  fetch(`${FAQ_BACK_URL}/tickets/isTicketsToAnswer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId: 1 }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response "isTicketsToAnswer" was not ok');
      }
      return response.json();
    })
    .then((data) => {
      if (data.length) {
        console.log('HTTP request "isTicketsToAnswer" successful:', data);
        console.log('OPENING POPUP...')
        openPopup(data);
      } else {
        console.log('HTTP request "isTicketsToAnswer" successful with emtpy tickets');
        console.log('NOT OPENING POPUP.')
      }
    })
    .catch((error) => {
      console.error('Error sending HTTP request "isTicketsToAnswer":', error);
    });
}

async function isPopupOpen() {
  const windows = await chrome.windows.getAll();
  const popups = windows.filter((window) => window.type === 'popup');
  return popups.length > 0;
}

function openPopup(tickets = []) {
  chrome.windows.getAll({}, (windows) => {
    if (windows.length > 0) {
      chrome.action.openPopup((error) => {
        if (error) {
          console.error('Failed to open popup:', error);
          this.sendStatEvent({ stage: 'UNKNOWN', data: `chrome.action.openPopup error: ${error}` });
        } else {
          const data = {
            from: 'ext-service-worker',
            to: 'faq',
            event: 'SHOW_OLDEST_TICKET',
            payload: {
              tickets: tickets
            }
          }
          sendMessageToHost(data);
        }
      });
    } else {
      this.sendStatEvent({ stage: 'UNKNOWN', data: `!windows.length on openPopup` });
    }
  });
}

function sendStatEvent(props) {
  const statPayload = {
    projectId: `${PROJECT_ID}`,
    namespace: 'web-host',
    stage: props.stage,
    eventData: props.data,
  }

  const onErrorMessagePayload = {
    from: 'ext-service-worker',
    to: 'web-host',
    event: 'RETRY_SEND_STAT',
    payload: statPayload
  }

  fetch(`${STAT_BACK_URL}/add-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statPayload),
  })
    .then((response) => {
      if (!response.ok) {
        sendMessageToHost(onErrorMessagePayload);
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('HTTP request successful:', data);
    })
    .catch((error) => {
      console.error('Error sending HTTP request:', error);
      sendMessageToHost(onErrorMessagePayload);
    });
}

// export interface BusEvent<T = Record<string, unknown>> {
//   from: string;
//   to: string;
//   event: string;
//   payload: T;
//   self?: true;
//   status?: string;
// }
function sendMessageToHost(data) {
  chrome.runtime.sendMessage(data, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:');
      console.error(chrome.runtime.lastError.message)
    } else {
      console.log('WORKER received response of sent event: ');
      console.log(response)
    }
  });
}

