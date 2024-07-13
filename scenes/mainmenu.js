class MainMenu {
  constructor() {

  }

  update() {
    background("#bf4040");

    textButtons.push({
      text: "PLAY",
      x: 20,
      y: 20,
      h: 71,
      c: "#4060bf",
      callback: e => {levelSelector.scene = game; setScene(levelSelector)}
    });

    if (devMode)
    textButtons.push({
      text: "EDITOR",
      x: 20,
      y: 91,
      h: 71,
      c: "#4060bf",
      callback: e => {setScene(editor)}
    });
    
    buttons.push({x: 0, y: height - 20, w: 20, h: 20, callback: e => {devMode = !devMode; localStorage.setItem("devMode", devMode)}});
  }
}