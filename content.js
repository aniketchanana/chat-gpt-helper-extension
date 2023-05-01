console.log("This is content script");
const TRIGGER_START = "helper:";
const TRIGGER_END = ";";
const OPEN_AI = "openAi";

const getFromLocalStorage = async (key) => {
  return chrome.storage.local.get([key]);
};

const debounce = (callback, delay = 200) => {
  let timerOutId = null;
  return (...args) => {
    if (timerOutId) {
      clearTimeout(timerOutId);
    }
    timerOutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

const updateElement = (inputTargetElement, value) => {
  if (
    inputTargetElement instanceof HTMLInputElement ||
    inputTargetElement instanceof HTMLTextAreaElement
  ) {
    inputTargetElement.value = value;
  } else {
    inputTargetElement.textContent = value;
  }
};

const parseQuery = (text) => {
  const parsed = /helper:(.*?)\;/gi.exec(text);
  return parsed ? parsed[1] : "";
};

const getTextContentFromDOMElements = (node, textarea = false) => {
  if (textarea) {
    return parseQuery(node.value).trim();
  }
  const value = node.textContent;
  if (node && value) {
    return parseQuery(value).trim();
  }
};

window.addEventListener(
  "keypress",
  debounce((e) => {
    const inputTargetElement = e.target;
    let query = "";
    if (
      inputTargetElement instanceof HTMLInputElement ||
      inputTargetElement instanceof HTMLTextAreaElement
    ) {
      query = getTextContentFromDOMElements(inputTargetElement, true);
    } else {
      query = getTextContentFromDOMElements(inputTargetElement, false);
    }
    if (!query) {
      return;
    }

    updateElement(inputTargetElement, "Loading your content please wait...");
    getFromLocalStorage(OPEN_AI)
      .then((result) => {
        getQueryResult(query, result.openAi)
          .then((response) => {
            updateElement(inputTargetElement, response);
          })
          .catch(() => {
            updateElement(inputTargetElement, query);
          });
      })
      .catch(() => {
        console.log("::: unable to get key:::");
      });
  })
);
