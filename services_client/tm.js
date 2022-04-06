const SERVICE_PREFIX = "topic_model";

function displayTopics(msg) {
  console.log(msg);
  const topic_words = msg[SERVICE_PREFIX + "_topic_words"];

  // get topic modelling div
  let div = document.getElementById("topic_div");

  // display tokens
  let tokensParagraph = document.getElementById("tokens_paragraph");
  tokensParagraph.remove();
  let newTokensParagraph = document.createElement("p");
  newTokensParagraph.id = "tokens_paragraph";
  div.insertBefore(newTokensParagraph, div.firstChild);
  // for each token in utterance we create a span with topic color background
  const tokens = msg[SERVICE_PREFIX + "_tokens"];
  const tokenTopics = msg[SERVICE_PREFIX + "_token_topics"];
  const tokenBGColors = msg[SERVICE_PREFIX + "_token_bg_colors"];
  console.log(tokenBGColors);
  const tokenTextColors = msg[SERVICE_PREFIX + "_token_text_colors"];
  for (let idx = 0; idx < tokens.length; ++idx) {
    let tokenSpan = document.createElement("span");
    tokenSpan.textContent = tokens[idx];
    const rgbaBG = tokenBGColors[idx];
    const rgbaText = tokenTextColors[idx];
    tokenSpan.style.backgroundColor = `rgba(${rgbaBG[0] * 255}, ${rgbaBG[1] * 255}, ${rgbaBG[2] * 255}, 1.0)`;
    tokenSpan.style.color = `rgba(${rgbaText[0] * 255}, ${rgbaText[1] * 255}, ${rgbaText[2] * 255}, 1.0)`;
    tokenSpan.style.margin = "5px";
    tokenSpan.style.padding = "5px";
    tokenSpan.style.borderRadius = "10px";
    tokenSpan.style.fontSize = "larger";
    tokenSpan.style.cursor = "pointer";
    tokenSpan.className = tokenTopics[idx];
    tokenSpan.addEventListener("click", (e) => {
      let topicWords = document.getElementById("topic_words");
      if (document.contains(topicWords)) {
        topicWords.remove();
      }
      let newTopicWords = document.createElement("p");
      newTopicWords.id = "topic_words";
      newTopicWords.textContent = topic_words[parseInt(e.currentTarget.className)].join(", ");
      div.appendChild(newTopicWords);
    });
    newTokensParagraph.appendChild(tokenSpan);
  }

  // plot chart
  let oldCanvas = document.getElementById("myTMChart");
  oldCanvas.remove();

  let canvas = document.createElement("canvas");
  canvas.id = "myTMChart";
  div.insertBefore(canvas, div.firstChild);

  const labels = msg[SERVICE_PREFIX + "_labels"];

  const datasets = msg[SERVICE_PREFIX + "_datasets"];

  const data = {
    labels: labels,
    datasets: datasets
  };

  const config = {
    type: "line",
    data: data,
    options: {
      legend: {
        display: false
      },
      scales: {
        y: {
          min: 0.0,
          max: 1.0
        },
      },
    },
  };
  const myChart = new Chart(canvas, config);
}
