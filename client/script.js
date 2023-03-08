import bot from './assets/bot.svg'
import user from './assets/user.svg'

const API_KEY = "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";

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
            element.scrollTop = element.scrollHeight; 
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
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
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system", content: "Explain things like you're talking to a lover"
}


const handleSubmit = async (e) => {
    e.preventDefault()


    const data = new FormData(form)
    const message = data.get('prompt');
    console.log (env.OPENAI_API_KEY);
    console.log(message);

    const [messages, setMessages] = useState([
      {
        message: "Hello, I'm ChatGPT! Ask me anything!",
        sentTime: "just now",
        sender: "ChatGPT"
      }
    ]);

    console.log(messages);

    const newMessage = {
        message,
        direction: "outging",
        sender: "user"
    }

    const newMessages = [...messages, newMessage];

    setMessages (newMessages);


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
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

  

    chatContainer.innerHTML += chatStripe(false, message)
    console.log (chatContainer);

    form.reset()

    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);


    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.choices[0].message.content.trim() // trims any trailing spaces/'\n' 
        setMessages ([...newMessages, {
          message: parsedData,
          sender: "ChatGPT"
        }])

        console.log({parsedData})

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})