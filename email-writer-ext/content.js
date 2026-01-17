// console.log("Email Writer Assistant loaded");

// const observer = new MutationObserver((mutations) => {
//   for (const mutation of mutations) {
//     for (const node of mutation.addedNodes) {

//       // ✅ Only ELEMENT nodes
//       if (node.nodeType !== Node.ELEMENT_NODE) continue;

//       const isCompose =
//         node.matches('div[role="dialog"], .aDh, .btC') ||
//         node.querySelector?.('div[role="dialog"], .aDh, .btC');

//       if (isCompose) {
//         console.log("Compose Window Detected");
//       }
//     }
//   }
// });

// observer.observe(document.body, {
//   childList: true,
//   subtree: true
// });
console.log("email writer");

function getEmailContent() {
  const selectors = ['.h7', '.a3s.aiL', '.gmai_quote'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el.innerText.trim();
  }
  return '';
}

function findComposeToolbar() {
  const selectors = ['.btC', '.aDh', '[role="toolbar"]'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function createAIButton() {
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji hG T-I-atl L3 ai-reply-button';
  button.innerText = 'AI Reply';
  button.style.marginRight = '8px';
  button.setAttribute('role', 'button');
  return button;
}


function injectButton(){
  const existingButton = document.querySelector('.ai-reply-button');
  if(existingButton){
    existingButton.remove();
  }

  const toolbar = findComposeToolbar();
  if(!toolbar){
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found");
  const button = createAIButton();
  button.classList.add('.ai-reply-button');

  button.addEventListener('click', async()=> {
    try{
        button.innerHTML = 'Generating...';
        button.disabled = true;
        const emailContent = getEmailContent();
        const response = await fetch('http://localhost:8080/api/email/generate', {
          method: 'POST',
          headers: {
            'Content-Type' : 'application/json',
          },
          body: JSON.stringify({
            emailContent: emailContent,
            tone:"professional"
          })
        });
        if(!response.ok){
          throw new Error('API Request Failed');
        }
        const generatedReply = await response.text();

        const composeBox = document.querySelector(
          '[role ="textbox"] [g_editable="true"]'
        );
        if(composeBox){
          composeBox.focus();
          document.execCommand('insertText',false, generatedReply);
        }
    }catch(error){

    }
  })

  toolbar.insertBefore(button,toolbar.firstChild);
}
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        (node.nodeType === Node.ELEMENT_NODE &&
          node.matches('.aDh, .btC, [role="dialog"]')) ||
        node.querySelector('.aDh,.btC,[role = "dialog"]'),
    );
    if (hasComposeElements) {
      console.log("Compose Window Detected.");
      setTimeout(injectButton, 500);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
