class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            optionsContainer: document.querySelector('.chatbox__options')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });

        // Automatically open chatbox and show welcome message
        this.toggleState(chatBox);
        this.showWelcomeMessage(chatBox);
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox, predefinedMessage = null) {
        var textField = chatbox.querySelector('input');
        let text1 = predefinedMessage || textField.value;
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);

        fetch($SCRIPT_ROOT + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                let msg2 = { name: "Blox Buddy", message: r.answer };
                this.messages.push(msg2);
                this.updateChatText(chatbox);
                textField.value = '';

            }).catch((error) => {
                console.error('Error:', error);
                let errorMsg = { name: "Blox Buddy", message: "Oops! There was an error processing your request. Please try again later." };
                this.messages.push(errorMsg);
                this.updateChatText(chatbox);
                textField.value = '';
            });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item, index) {
            if (item.name === "Blox Buddy") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    showWelcomeMessage(chatbox) {
        let welcomeMessage = { name: "Blox Buddy", message: "Hey there, Thank you for visiting us, what can I help you with?" };
        this.messages.push(welcomeMessage);
        this.updateChatText(chatbox);

        this.displayOptions(['Know more about us', 'Contact us', 'Help us get to know you better']);
    }

    handleOptionSelection(option) {
        switch (option) {
            case 'Know more about us':
                this.showKnowMoreOptions();
                break;
            case 'Contact us':
                this.showContactInfo();
                break;
            case 'Help us get to know you better':
                this.showUserForm();
                break;
            default:
                this.onSendButton(document.querySelector('.chatbox__support'), option);
        }
    }

    displayOptions(options) {
        const { optionsContainer } = this.args;
        optionsContainer.innerHTML = options.map(option =>
            `<button class="welcome-options button" onclick="sendMessage('${option}')">${option}</button>`
        ).join('');
    }

    showKnowMoreOptions() {
        this.displayOptions(['About Infoblox', 'About Infoblox\'s Product', 'About Infoblox\'s Solution', 'Opening\'s at Infoblox']);
    }

    showContactInfo() {
        let contactInfo = {
            name: "Blox Buddy",
            message: "You can contact us at: contact@infoblox.com or call us at +1234567890."
        };
        this.messages.push(contactInfo);
        this.updateChatText(document.querySelector('.chatbox__support'));
    }

    showUserForm() {
        const { optionsContainer } = this.args;
        optionsContainer.innerHTML = `
            <div class="user-form">
                Name: <input type="text" id="userName" /><br/>
                Phone: <input type="text" id="userPhone" /><br/>
                Email: <input type="text" id="userEmail" /><br/>
                <button class="welcome-options button" onclick="submitUserForm()">Submit</button>
            </div>`;
    }
}

function sendMessage(message) {
    const chatbox = document.querySelector('.chatbox__support');
    const chatboxInstance = new Chatbox();
    chatboxInstance.handleOptionSelection(message);
}

function submitUserForm() {
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;

    const chatbox = document.querySelector('.chatbox__support');
    const chatboxInstance = new Chatbox();

    let userInfo = { name: "User", message: `Name: ${name}, Phone: ${phone}, Email: ${email}` };
    chatboxInstance.messages.push(userInfo);
    chatboxInstance.updateChatText(chatbox);
}

const chatbox = new Chatbox();
chatbox.display();
