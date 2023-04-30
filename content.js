console.log("This is content script");
const TRIGGER_START = "helper:";
const TRIGGER_END = ";";
const OPEN_AI = "openAi";
const API_END_POINT = "https://api.openai.com/v1/completions";

const getFromLocalStorage = async (key) => {
  return chrome.storage.local.get([key]);
};

let OPEN_AI_KEY = "";

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
// on initial load
(() => {
  getFromLocalStorage(OPEN_AI)
    .then((result) => {
      OPEN_AI_KEY = result.openAi;
    })
    .catch(() => {
      OPEN_AI_KEY = "";
    });
})();

const getQueryResult = async (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${OPEN_AI_KEY}`);

      const raw = JSON.stringify({
        model: "text-davinci-003",
        prompt: query,
        max_tokens: 2048,
        temperature: 0,
        top_p: 1,
        n: 1,
        stream: false,
        logprobs: null,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      let response = await fetch(API_END_POINT, requestOptions);
      response = await response.json();
      const { choices } = response;

      // remove the spaces from the response text
      const text = choices[0].text.replace(/^\s+|\s+$/g, "");
      resolve(text);
    } catch (e) {
      console.log(":::i am unable to parse query:::");
    }
  });
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
    getQueryResult(query)
      .then((response) => {
        updateElement(inputTargetElement, response);
      })
      .catch(() => {
        updateElement(inputTargetElement, query);
      });
  })
);
