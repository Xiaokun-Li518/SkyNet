import bot from './assets/bot.svg'
import user from './assets/user.svg'


const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let state = null;

function useState(initialValue) {
  state = state || initialValue;

  function setState(newState) {
    state = newState;
  }

  return [state, setState];
}


let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            chatContainer.scrollTop = chatContainer.scrollHeight + 5;
            index++
        } else {
            clearInterval(interval)
        }
    }, 10)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    /> 
                    <br>
                </div>
                <br>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}
const systemMessage = { 
  role: "system", content: "A helpful assistant"
}

const handleSubmit = async (e) => {
    alert("API key removed");
    e.preventDefault()

    const data = new FormData(form)
    const message = data.get('prompt');
    const [messages, setMessages] = useState("");

    const newMessage = {
        message,
        sender: "user"
    }
    const newMessages = [...messages, newMessage];
    let apiMessages = newMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });

    const apiRequestBody = {
      "messages": [
        systemMessage,  
        ...apiMessages 
      ]
    }

    if (message.length != 0)
    {
        chatContainer.innerHTML += chatStripe(false, message)
    }

    form.reset()
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    const messageDiv = document.getElementById(uniqueId)
    loader(messageDiv)

    const response = await fetch('https://skynet-oa2q.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody)
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = "";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
        setMessages ([...newMessages, {
          message: parsedData,
          sender: "ChatGPT"
        }])

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Api key removed, access code: https://github.com/Xiaokun-Li518/SkyNet"
        alert(err)
    }
}

window.addEventListener ('load', handleSubmit);

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})