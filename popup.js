const saveButton = document.querySelector("#save_btn");
const input = document.querySelector("#key_input");
const getQueryButton = document.querySelector("#getQueryButton");
const queryTextarea = document.querySelector("textarea");
const queryReply = document.querySelector("#queryReply");
const queryReplyContainer = document.querySelector("#queryReplyContainer");
const copyAnswer = document.querySelector("#copyAnswer");
const OPEN_AI = "openAi";

const saveToLocalStorage = async (key, value) => {
  await chrome.storage.local.set({ [key]: value });
};

const getFromLocalStorage = async (key) => {
  return chrome.storage.local.get([key]);
};

// on initial load
(() => {
  getFromLocalStorage(OPEN_AI)
    .then((result) => {
      input.setAttribute("value", result.openAi ?? "");
    })
    .catch(() => {
      input.setAttribute("value", "");
    });
})();

saveButton.addEventListener("click", () => {
  const inputValue = input.value;
  saveToLocalStorage(OPEN_AI, inputValue);
});

getQueryButton.addEventListener("click", () => {
  const query = queryTextarea.value;
  if (!query || queryReply.textContent === "Loading...") {
    queryReplyContainer.setAttribute("style", "display: none;");
    return;
  }
  queryReplyContainer.setAttribute("style", "display: block;");
  queryReply.textContent = "Loading...";
  getQueryResult(query, input.value).then((res) => {
    queryReply.textContent = res;
  });
});

copyAnswer.addEventListener("click", () => {
  navigator.clipboard.writeText(queryReply.textContent);
  copyAnswer.textContent = "Copied!!";
  setTimeout(() => {
    copyAnswer.textContent = "Copy";
  }, 1000);
});
