const API_END_POINT = "https://api.openai.com/v1/completions";

const getQueryResult = async (query, OPEN_AI_KEY) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!OPEN_AI_KEY) {
        throw new Error("Invalid key");
      }
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
      reject();
    }
  });
};
