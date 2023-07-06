const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const myModal = new bootstrap.Modal(document.getElementById("staticBackdrop"), {
  backdrop: "static",
  keyboard: false
})
const userCounter = document.getElementById("spn-online-counter")
const notifSound = new Audio("notification-sound-7062.mp3")
var userName;

const socket = io();
var users = new Map();
var identifier;


document.getElementById("inpt-user-name").addEventListener("keyup", (e) => {
  if (document.getElementById("inpt-user-name").value === "") {
    document.getElementById('btn-username-confirm').disabled = true;
  } else {
    if (e.key === 'Enter' || e.keyCode === 13) {
      document.getElementById('btn-username-confirm').click()
    }
    document.getElementById('btn-username-confirm').disabled = false;
  }
})

function registerUser() {
  userName = document.getElementById("inpt-user-name").value
  socket.emit("identifier", userName);
  myModal.toggle()

}

socket.on("identifierCode", (msg) => {
  identifier = msg
})

socket.on("welcome", (msg) => {
  var html = `<li class="clearfix">
                                <div class="message-data">
                                    <span class="message-data-time">Server</span>
                                </div>
                                <div class="message my-message">`+ msg + `</div>
                            </li>`
  document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
  notifSound.play()
});

socket.on("message", (msg) => {
  var html = `<li class="clearfix">
      <div class="message-data">
          <span class="message-data-time">Server</span>
      </div>
      <div class="message my-message">`+ msg + `</div>
  </li>`
  document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
  notifSound.play()

});

socket.on("chatMessage", (msg) => {
  var recievedId = msg.substring(
    msg.indexOf("[") + 1,
    msg.indexOf("]")
  );
  console.log(msg)
  console.log(recievedId)
  var message = msg.substring(
    msg.indexOf("]") + 1
  );

  var html = `<li class="clearfix">
          <div class="message-data">
              <span class="message-data-time">`+ recievedId + `</span>
          </div>
          <div class="message my-message">`+ message + `</div>
      </li>`
  document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
  notifSound.play()

});

socket.on("command", (msg) => {
  var html = `<li class="clearfix">
<div class="message-data">
    <span class="message-data-time">Server</span>
</div>
<div class="message my-message">`+ msg + `</div>
</li>`
  document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
  notifSound.play()

});

window.addEventListener('beforeunload', (event) => {
  console.log("closing window")
  socket.disconnect()
});
window.addEventListener("load", (event) => {

  myModal.toggle()
});
$('#staticBackdrop').on('shown.bs.modal', function (e) {
  document.getElementById("inpt-user-name").focus()
})

document.getElementById("txt-message-to-send").addEventListener("keyup", (e) => {
  if (e.key === 'Enter' || e.keyCode === 13) {
    if (document.getElementById("txt-message-to-send").value !== "") {
      if (document.getElementById("txt-message-to-send").value.startsWith('/')) {
        var html = `<li class="clearfix">
        <div class="message-data text-right">
            <span class="message-data-time">Yo</span>
        </div>
        <div class="message other-message float-right">`+ document.getElementById("txt-message-to-send").value + `</div>
    </li>`
        document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
        notifSound.play()

        socket.emit("command", document.getElementById("txt-message-to-send").value)
      }
      else {
        var html = `<li class="clearfix">
      <div class="message-data text-right">
          <span class="message-data-time">Yo</span>
      </div>
      <div class="message other-message float-right">`+ document.getElementById("txt-message-to-send").value + `</div>
  </li>`
        document.getElementById("chat-messages").insertAdjacentHTML("beforeend", html)
        notifSound.play()
        socket.emit("chatMessage", document.getElementById("txt-message-to-send").value)
      }
      document.getElementById("txt-message-to-send").value = ""
    }
  }
})

socket.on("onlineCounter", (msg) => {
  console.log("Number of logged in users is: " + msg)
  userCounter.innerHTML = msg
})

socket.on("connectedUsers", msg => {
  users = new Map()
  console.log(msg)
  var auxString1 = msg.split(';')
  console.log(auxString1)
  auxString1.forEach(element => {
    if (element !== "") {
      var auxString2 = element.split(':')
      users.set(auxString2[0], auxString2[1])
    }
  });
  console.log(users)
})