const saveButton = document.querySelector("#save_btn");
const input = document.querySelector("#key_input");
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
