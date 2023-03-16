const handleImageSubmit = async (e) => {
    e.preventDefault()
  
    const data = new FormData(form)
    console.log (data.get ('prompt'));
  
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  
    form.reset()
  
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
  
    chatContainer.scrollTop = chatContainer.scrollHeight;
  
    const messageDiv = document.getElementById(uniqueId)
  
    loader(messageDiv)
  
    const response = await fetch('http://localhost:7788/image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
  
      clearInterval(loadInterval)
      messageDiv.innerHTML = " "
  
    if (response.ok) {
        const data = await response.json();
        const url = data.urls;
        
        messageDiv.innerHTML += `<div class="message" id=${uniqueId}> ${`<img src="${url}" />`} </div>`;
  
    } else {
        const err = await response.text()
  
        messageDiv.innerHTML = "Something went wrong";
        alert(err)
    }
}