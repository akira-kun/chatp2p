    function getNow() {
			var time = new Date(Gun.state());
      //console.log(time, Math.floor(time.getTime() / 1000))
      return Math.floor(time.getTime() / 1000);
    }

    function sortUsersMessageLog(msg) {
        const sortedKeys = Object.keys(msg).sort((a, b) => {
            const [timestampA, userA] = a.split('_');
            const [timestampB, userB] = b.split('_');
            const timeComparison = Number(timestampA) - Number(timestampB);
            if (timeComparison !== 0) {
                return timeComparison;
            }
            return userA.localeCompare(userB);
        });
        const sortedLog = {};
        sortedKeys.forEach(key => {
            sortedLog[key] = msg[key];
        });
        return sortedLog;
    }

    //const uid = new ShortUniqueId({ length: 4 });

    function getUser() {
      let myUser = window.localStorage.getItem("myUser");
      if (myUser == null) {
        myUser = 'user-' + Math.random().toString().substring(9);
        window.localStorage.setItem("myUser", myUser);
      }
      return myUser;
    }

    let myUser = getUser();
    let msginput = document.getElementById('inputmsg');

    const peers = ['https://splendid-typhoon.glitch.me/gun', 'https://try.axe.eco/gun', 'https://test.era.eco/gun', 'https://peer.wallie.io/gun']
    const gun = Gun({
        peers: peers,
        radisk: false,
        localStorage: false,
        file: false
    });

    const chatId = decodeURIComponent(location.hash.slice(1)).replaceAll(/\s+/g,' ').substring(0,256) || 'default';
    document.getElementById('chat-id').textContent = chatId.replace(/(^|\s)[a-z]/gi, (c) => c.toUpperCase());
    window.location.hash = encodeURIComponent(chatId);
    addEventListener("hashchange", (event) => {
      window.location.reload();
    });

    const pad = gun.get(chatId);
    const log = gun.get(chatId).get("history-log");
    const users = gun.get(chatId).get("users");

    //if (!navigator.onLine) { msginput.readOnly = true }
    //addEventListener('offline', () => msginput.readOnly = true)
    addEventListener('online', () => {
      gun.opt(peers)
      pad.get('heartbeat').put('heartbeat')
      msginput.removeAttribute('readonly')
    });

    msginput.addEventListener('keyup', (e) => {
        if (e.key == 'Enter') {
            sendMSG();
        }
    });

    function sendMSG() {
        let msg = {};
        const timeNow = getNow();
        const key = timeNow + '_' + myUser;
        msg[key] = msginput.value;
        pad.put({ user: myUser, timestamp: timeNow, content: msginput.value });
        log.put(msg);
        sendMessage(myUser, timeNow, msginput.value);
        msginput.value = "";
    }

    log.once(async (data) => {
      if (data != null) {
        data = sortUsersMessageLog(data);
        let timestamp, user;
        for (let key in data) {
          if (key == '_') continue;
          //console.log('*************', key, data[key]);
          [timestamp, user] = key.split('_');
          if (user != myUser) {
            receivedMessage(user, timestamp, data[key]);
          } else {
            sendMessage(user, timestamp, data[key]);
          }
        }
        pad.on(data => {
          if (data != null && data.user != null) {
            if (data.user != myUser) {
              receivedMessage(data.user, data.timestamp, data.content);
            }
          }
        })
      }
    })

    supportedLanguage = "pt-BR";
    function formatHourMinute(timestamp, onlyTime = false) {
      let d;
      if (timestamp != null) {
        d = new Date();
      }
      d = new Date(timestamp * 1000);
      d = [(d.toLocaleDateString(supportedLanguage)),(d.toLocaleTimeString(supportedLanguage))];
      return onlyTime ? d[1] : d.join(' ');
    }
    

    let deviceTime = document.querySelector('.status-bar .time');
    deviceTime.innerHTML = formatHourMinute(getNow(), true);
    setInterval(function() {
        deviceTime.innerHTML = formatHourMinute(getNow(), true);
    }, 1000);
        
    /* Message */
    
    let conversation = document.querySelector('.conversation-container');
    let messageTime = document.querySelectorAll('.message .time');

    function sendMessage(user, timestamp, text) {
        const message = buildMessage(user, timestamp, text, 'sent');
    }

    function receivedMessage(user, timestamp, text) {
        const message = buildMessage(user, timestamp, text, 'received');
    }

    function displayMessage(message) {
        conversation.appendChild(message);
        animateMessage(message);
        conversation.scrollTop = conversation.scrollHeight;
    }

    let msgIndex = [];
    function buildMessage(user, timestamp, text, sendORreceive = 'sent') {
      hash = timestamp + '_' + user;
      //console.log("BUILD >>>>>>>>>>>>>", sendORreceive, hash, user, timestamp, text, document.getElementById(hash));
      if (document.getElementById(hash) == null) {
        var element = document.createElement('div');
        element.id = hash;
        element.classList.add('message', sendORreceive);
        element.innerHTML = (sendORreceive == 'received' ? user + ' - ' : '') + text +
            '<span class="metadata">' +
                '<span class="time">' + formatHourMinute(timestamp) + '</span>' +
                '<span class="tick tick-animation">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck" x="2047" y="2061"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#92a58c"/></svg>' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg>' +
                '</span>' +
            '</span>';
        displayMessage(element);
      }
    }

    function animateMessage(message) {
      setTimeout(function() {
          var tick = message.querySelector('.tick');
          tick.classList.remove('tick-animation');
      }, 500);
    }

    function updateStatusUsers(user, active, timestamp) {
      let userDiv = document.querySelector(".users-online #" + user);
      //console.log("Checking If User is Expired... ", user, userExpired(timestamp));
      if (userExpired(timestamp)) {
        const userStatus = {};
        userStatus[user] = null;
        users.put(userStatus);
        if (userDiv != null) {
          userDiv.remove();
        }
        return;
      }
      const update = '<div class="avatar">' +
                      '<img src="img/user-default.jpg"/>' +
                    '</div>' +
                    '<div class="name">' +
                      '<span>' + user + '</span>' +
                      '<span class="status">' + (myUser == user ? 'You' : (active ? 'online' : 'away')) + '</span>' +
                    '</div>';
      if (userDiv == null) {
        let users = document.querySelector(".users-online");
        userDiv = document.createElement('div');
        userDiv.id = user;
        userDiv.className = 'user';
        userDiv.innerHTML = update;
        users.appendChild(userDiv);
      } else {
        userDiv.innerHTML = update;
      }
    }

    const userMaxSecondsTTL = 60;
    function userExpired(timestamp) {
      if ((getNow() * 1000) < ((timestamp * 1000) + (userMaxSecondsTTL * 1000))) {
        return false;
      }
      return true;
    }

    users.on((users) => {
      console.log("ALL USER RAW LIST", users);
      if (users != null) {
        let checkAllUsersOnline = true;
        for (let key in users) {
          if (key.startsWith("user-")) {
            if (users[key] != null && typeof users[key] === "string" && users[key].indexOf(separator) > -1) {
              let active, timestamp;
              [active, timestamp] = users[key].split(separator);
              active = (active === "true") ? true : false;
              //console.log('USER:', key, users[key], (active === "true" ? true : false), userExpired(timestamp));
              if (!(!userExpired(timestamp) && active && checkAllUsersOnline)) checkAllUsersOnline = false;
              updateStatusUsers(key, active, timestamp);
            }
          }
        }
        if (checkAllUsersOnline) {
          console.log('TO-DO: all users online and active, store all msgs on local Database and do the history-log reset.');
        }
      }
    });

    let lastUserStatus = true;
    const separator = '|#|';
    function turnOnOffUser(bool) {
      const userStatus = {};
      bool = (bool == null) ? lastUserStatus : bool;
      lastUserStatus = bool;
      console.log("Heartbeating... Just checking:", bool + separator + getNow());
      userStatus[myUser] = bool + separator + getNow();
      users.put(userStatus);
    }

    addEventListener("load", () => {
      turnOnOffUser(true);
      setInterval(()=>{
        console.log("Heartbeating...");
        turnOnOffUser();
      }, Math.round(userMaxSecondsTTL/2) * 1000);
    });

    function returnFromExpiredTTL() {
      users.once((users) => {
        console.log("ONCE",users,(users != null && Object.keys(users).indexOf(myUser) > -1 && users[myUser] == null))
        if (users != null && Object.keys(users).indexOf(myUser) > -1 && users[myUser] == null) {
          setTimeout(()=>{
            alert("chat syncing...");
            window.location.reload();
          }
          , 500);
        }
        turnOnOffUser(true);
      });
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        turnOnOffUser(false);
        return;
      }
      returnFromExpiredTTL();
    });