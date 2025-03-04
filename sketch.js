/*************************************************************
 * Time Machine - Final Extended (Plain JavaScript, No TS)
 *
 * States:
 *   1) "intro"
 *   2) "start"
 *   3) "badIntro"
 *   4) "bad"
 *   5) "panic"
 *   6) "postPanic"
 *   7) "scaryChoice"   (User picks "Go on a Date" or "Drugs")
 *   8) "bigStars"      (5s color-changing star animation)
 *   9) "cameraDrugs"   (Webcam in background, 5 drug choices)
 *  10) "pixelateChoice"(User picks same drug 5 times => meltdown)
 *  11) "finalChaos"    (5 "GET ME HIGH" => 30s => black screen)
 *************************************************************/

/** GLOBAL VARIABLES **/
// Primary state
let state = "intro";

// Intro
let introTime = 0;
let introAlpha = 255;
let showBeginButton = false;

// Start
let choices = ["Exercise","Sleep","Work","Meditate","Drugs"];
let fadeCount = 0;
let fadeMax = 10;
let bgColor; // from beige => white

// Bad Intro (smoke+stars)
let smokeParticles = [];
let starParticles = [];
let badIntroTimer = 0;
let badIntroDuration = 180; // ~3s

// Bad
let exerciseBtnPos = null;
let drugsBtnPos = null;
let arrowNeeded = false;
let arrowProgress = 0;
let showDrugsMsg = false;
let drugsMsgTimer = 0;
let drugsMsgDuration = 300; // 5s

// Panic
let meditateClicks = 0;
let maxMeditateClicks = 5;
let panicButton = null;
let panicFadeCount = 0;
let cursorTrail = [];

// Post-Panic
let finalHealthy = ["Eat Healthy","Work","Sleep","Exercise"];
let finalHealthyClicks = 0;
let finalMaxHealthy = 5;
let finalDrugAlpha = 0;
let finalDrugScale = 1;
let finalButtons = [];
let finalDrugBtn = null;

// SCARY Flow
//   "scaryChoice"   => user picks "Go on a Date" or "Drugs"
//   "bigStars"      => 5s color-changing star animation
//                     if date => show "Meaningless Sex"
//   "cameraDrugs"   => webcam background, 5 drug choices
//   "pixelateChoice"=> user picks same drug 5 times => meltdown
//   "finalChaos"    => 5 "GET ME HIGH" => 30s => black screen
let userScaryChoice = "";
let starAnimTimer = 0;
let starColorTimer = 0;
let bigStarsArray = [];
let webcam = null;
let pixelationLevel = 1;
let aggressionMessages = ["GIVE UP","LOSER","WORTHLESS","STOP FUCKING ABOUT","FUCK YOU","PIECE OF SHIT"];
let aggressionTimer = 0;
let aggressionInterval = 90;
let lastDrugChoice = "";
let pixelateCount = 0;
let pixelateMax = 5;
let chaosStartTime = 0;
let meltdownBtns = [];

/*************************************************************
 * p5.js SETUP
 *************************************************************/
function setup() {
  createCanvas(windowWidth, windowHeight);
  bgColor = color(245,240,220); // start beige

  textFont("OCR A, monospace");
  textSize(28);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

/*************************************************************
 * p5.js DRAW
 *************************************************************/
function draw() {
  if (state === "intro") {
    handleIntro();
  }
  else if (state === "start") {
    background(bgColor);
  }
  else if (state === "badIntro") {
    background(bgColor);
    drawBadIntroEffects();
  }
  else if (state === "bad") {
    background(bgColor);
    if (arrowNeeded) animateFakeCursor();
    if (showDrugsMsg) {
      drugsMsgTimer++;
      fill(0);
      text("Drugs again? That was silly", width/2, height/2 - 50);
      if (drugsMsgTimer > drugsMsgDuration) {
        showDrugsMsg = false;
        transitionToPanic();
      }
    }
  }
  else if (state === "panic") {
    handlePanicState();
  }
  else if (state === "postPanic") {
    background(255);
    drawFinalStage();
  }
  else if (state === "scaryChoice") {
    handleScaryChoice();
  }
  else if (state === "bigStars") {
    handleBigStars();
  }
  else if (state === "cameraDrugs") {
    handleCameraDrugs();
  }
  else if (state === "pixelateChoice") {
    handlePixelateChoice();
  }
  else if (state === "finalChaos") {
    handleFinalChaos();
  }
}

/*************************************************************
 * INTRO
 *************************************************************/
function handleIntro() {
  background(bgColor);

  introTime++;
  fill(0, introAlpha);
  text("Self Destruction Simulator", width/2, height/2 - 30);

  // 2s fully visible, 3s fade
  if (introTime < 120) {
    introAlpha = 255;
  } 
  else if (introTime >= 120 && introTime < 300) {
    let fadeRatio = map(introTime, 120, 300, 255, 0);
    introAlpha = fadeRatio;
  } 
  else if (introTime >= 300 && !showBeginButton) {
    introAlpha = 0;
    showBeginButton = true;
    createBeginButton();
  }
}

function createBeginButton() {
  removeAllButtons();
  let btn = createButton("Begin");
  btn.style("background","none");
  btn.style("border","2px solid black");
  btn.style("padding","10px");
  btn.style("font-family","OCR A, monospace");
  btn.style("font-size","16px");
  btn.style("cursor","pointer");
  btn.position(width/2 - 40, height/2 + 20);

  btn.mousePressed(() => {
    state = "start";
    btn.remove();
    createChoiceButtons();
  });
}

/*************************************************************
 * START: 5 Pink Oval Buttons
 *************************************************************/
function createChoiceButtons() {
  removeAllButtons();

  let radius = 200;
  let angleStep = TWO_PI / choices.length;

  for(let i=0; i<choices.length; i++){
    let angle = angleStep*i - HALF_PI;
    let x = width/2 + cos(angle)*radius;
    let y = height/2 + sin(angle)*radius;

    let btn = createButton(choices[i]);
    stylePinkOval(btn);
    btn.position(x,y);

    btn.mousePressed(()=>{
      handleChoice(choices[i]);
    });
  }
}

function stylePinkOval(btn) {
  btn.style("background","pink");
  btn.style("color","navy");
  btn.style("font-family","OCR A, monospace");
  btn.style("font-size","18px");
  btn.style("font-weight","bold");
  btn.style("border","none");
  btn.style("border-radius","30px");
  btn.style("padding","8px 14px");
  btn.style("cursor","pointer");
  btn.style("transition","transform 0.2s ease");
  btn.mouseOver(()=>{ btn.style("transform","scale(1.15)"); });
  btn.mouseOut(()=>{ btn.style("transform","scale(1.0)"); });
}

function handleChoice(choice) {
  console.log(choice + " chosen");
  if (state === "start") {
    if (choice === "Drugs") {
      state = "badIntro";
      removeAllButtons();
      for (let i=0; i<20; i++){
        spawnSmokeParticle();
        spawnStarParticle();
      }
    } else {
      fadeCount++;
      updateFade();
    }
  }
}

/*************************************************************
 * fade => white for healthy
 *************************************************************/
function updateFade() {
  let ratio = fadeCount / fadeMax;
  bgColor = lerpColor(color(245,240,220), color(255), ratio);

  let cVal = int(255 * ratio);
  let textColor = `rgb(${cVal},${cVal},${cVal})`;

  let btns = selectAll("button");
  for(let b of btns){
    b.style("color", textColor);
  }
  if (fadeCount >= fadeMax){
    removeAllButtons();
  }
}

/*************************************************************
 * BAD INTRO => smoke+stars => ~3s => "bad"
 *************************************************************/
function drawBadIntroEffects(){
  badIntroTimer++;
  if(frameCount%10===0) spawnSmokeParticle();
  if(frameCount%10===0) spawnStarParticle();

  for(let sp of smokeParticles){ sp.update(); sp.draw(); }
  for(let st of starParticles){ st.update(); st.draw(); }

  if(badIntroTimer > badIntroDuration){
    state="bad";
    removeAllParticles();
    createBadChoiceButtons();
  }
}

function spawnSmokeParticle(){
  smokeParticles.push(new SmokeParticle(random(width), height+20));
}
function spawnStarParticle(){
  starParticles.push(new StarParticle(random(width), random(height)));
}
function removeAllParticles(){
  smokeParticles=[];
  starParticles=[];
}

class SmokeParticle {
  constructor(x,y){
    this.x=x; 
    this.y=y;
    this.vy=random(-1,-3);
    this.alpha=200; 
    this.size=random(30,60);
  }
  update(){
    this.y+=this.vy;
    this.alpha-=1.5;
    if(this.alpha<0)this.alpha=0;
  }
  draw(){
    noStroke();
    fill(120,this.alpha);
    ellipse(this.x,this.y,this.size,this.size*0.7);
  }
}

class StarParticle {
  constructor(x,y){
    this.x=x; 
    this.y=y;
    this.vx=random(-1,1);
    this.vy=random(-1,1);
    this.alpha=255;
    this.size=random(5,10);
    this.c=color(random(255), random(255), random(255));
  }
  update(){
    this.x+=this.vx; 
    this.y+=this.vy;
    this.alpha-=2;
    if(this.alpha<0)this.alpha=0;
  }
  draw(){
    noStroke();
    fill(red(this.c), green(this.c), blue(this.c), this.alpha);
    ellipse(this.x,this.y,this.size,this.size);
  }
}

/*************************************************************
 * BAD: 2 Buttons => "Exercise","Drugs"
 *************************************************************/
function createBadChoiceButtons(){
  removeAllButtons();
  let newChoices=["Exercise","Drugs"];
  let radius = 150;
  let angleStep = TWO_PI/newChoices.length;

  for(let i=0; i<newChoices.length; i++){
    let angle=angleStep*i - HALF_PI;
    let x=width/2 + cos(angle)*radius;
    let y=height/2 + sin(angle)*radius;

    let btn=createButton(newChoices[i]);
    stylePinkOval(btn);
    btn.position(x,y);

    if(newChoices[i]==="Exercise") exerciseBtnPos={x,y};
    if(newChoices[i]==="Drugs") drugsBtnPos={x,y};

    btn.mousePressed(()=>{
      if(newChoices[i]==="Exercise"){
        arrowNeeded=true;
        arrowProgress=0;
        // keep the DRUGS button
        state="bad";
      } else {
        removeAllButtons();
        showDrugsAgainMsg();
      }
    });
  }
}

function showDrugsAgainMsg(){
  console.log("User => 'Drugs again? That was silly'");
  showDrugsMsg=true;
  drugsMsgTimer=0;
}

function animateFakeCursor(){
  arrowProgress+=0.01;
  if(arrowProgress>=1){
    arrowProgress=1;
    arrowNeeded=false;
    console.log("Fake cursor forced DRUGS");
    removeAllButtons();
    showDrugsAgainMsg();
  }

  if(!exerciseBtnPos || !drugsBtnPos) return;

  let x1=exerciseBtnPos.x+30; 
  let y1=exerciseBtnPos.y+20;
  let x2=drugsBtnPos.x+30;
  let y2=drugsBtnPos.y+20;

  let curX=lerp(x1,x2,arrowProgress);
  let curY=lerp(y1,y2,arrowProgress);

  // draw black pointer
  push();
  translate(curX, curY);
  let angle=atan2(y2-y1, x2-x1);
  rotate(angle);
  fill(0);
  noStroke();
  beginShape();
  vertex(0,0);
  vertex(0,16);
  vertex(5,12);
  vertex(9,22);
  vertex(11,20);
  vertex(7,11);
  vertex(14,11);
  vertex(14,9);
  vertex(0,0);
  endShape(CLOSE);
  pop();
}

/*************************************************************
 * DRUGS MSG => 5s => panic
 *************************************************************/
function draw(){ 
  if(state==="intro"){
    handleIntro();
  }
  else if(state==="start"){
    background(bgColor);
  }
  else if(state==="badIntro"){
    background(bgColor);
    drawBadIntroEffects();
  }
  else if(state==="bad"){
    background(bgColor);
    if(arrowNeeded) animateFakeCursor();
    if(showDrugsMsg){
      drugsMsgTimer++;
      fill(0);
      text("Drugs again? That was silly", width/2, height/2 - 50);
      if(drugsMsgTimer>drugsMsgDuration){
        showDrugsMsg=false;
        transitionToPanic();
      }
    }
  }
  else if(state==="panic"){
    handlePanicState();
  }
  else if(state==="postPanic"){
    background(255);
    drawFinalStage();
  }
  else if(state==="scaryChoice"){
    handleScaryChoice();
  }
  else if(state==="bigStars"){
    handleBigStars();
  }
  else if(state==="cameraDrugs"){
    handleCameraDrugs();
  }
  else if(state==="pixelateChoice"){
    handlePixelateChoice();
  }
  else if(state==="finalChaos"){
    handleFinalChaos();
  }
}

/*************************************************************
 * PANIC => user overcame => postPanic
 *************************************************************/
function transitionToPanic(){
  console.log("Now entering PANIC state...");
  state="panic";
  removeAllButtons();
  meditateClicks=0;
  panicFadeCount=0;
  createPanicButton();
}

function handlePanicState(){
  let ratio=panicFadeCount/maxMeditateClicks;
  let panicBg=lerpColor(color(255,0,0), color(245,240,220), ratio);
  background(panicBg);

  fill(255*(1-ratio));
  text("YOU FEEL LIKE SHIT", width/2, height/2 - 60);

  drawCursorTrail();

  if(panicButton){
    let currentX=panicButton.x;
    let currentY=panicButton.y;
    let newX=currentX+random(-10,10);
    let newY=currentY+random(-10,10);
    newX=constrain(newX,0,width-160);
    newY=constrain(newY,0,height-70);
    panicButton.position(newX,newY);
  }
}

function createPanicButton(){
  panicButton=createButton("Meditate");
  panicButton.style("background","purple");
  panicButton.style("color","white");
  panicButton.style("font-size","24px");
  panicButton.style("font-family","OCR A, monospace");
  panicButton.style("padding","10px 20px");
  panicButton.style("border-radius","10px");
  panicButton.style("cursor","pointer");

  panicButton.position(width/2, height/2);
  panicButton.mousePressed(()=>{
    meditateClicks++;
    panicFadeCount++;
    console.log("Meditate clicks: "+meditateClicks);
    if(meditateClicks>=maxMeditateClicks){
      console.log("You overcame the panic. Next => postPanic");
      removeAllButtons();
      state="postPanic";
      createPostPanicButtons();
    }
  });
}

/*************************************************************
 * POST-PANIC
 *************************************************************/
function createPostPanicButtons(){
  removeAllButtons();
  finalHealthyClicks=0;
  finalDrugAlpha=0;
  finalDrugScale=1;
  finalButtons=[];

  let radius=200;
  let angleStep=TWO_PI/(finalHealthy.length+1);

  for(let i=0; i<finalHealthy.length;i++){
    let angle=angleStep*i - HALF_PI;
    let x=width/2 + cos(angle)*radius;
    let y=height/2 + sin(angle)*radius;

    let btn=createButton(finalHealthy[i]);
    stylePinkOval(btn);
    btn.position(x,y);
    finalButtons.push(btn);

    btn.mousePressed(()=>{
      handleFinalChoice(finalHealthy[i], btn);
    });
  }

  // create DRUGS button, hidden
  let drugAngle=angleStep*finalHealthy.length - HALF_PI;
  let dx=width/2 + cos(drugAngle)*radius;
  let dy=height/2 + sin(drugAngle)*radius;

  finalDrugBtn=createButton("Drugs");
  stylePinkOval(finalDrugBtn);
  finalDrugBtn.position(dx,dy);
  finalDrugBtn.style("opacity","0");
  finalDrugBtn.style("transform","scale(0.5)");

  finalDrugBtn.mousePressed(()=>{
    console.log("Final forced DRUGS => proceed to scaryChoice");
    removeAllButtons();
    state="scaryChoice";
    createScaryChoiceButtons(); 
  });
}

function handleFinalChoice(choice, btn){
  console.log("Final healthy =>", choice);
  finalHealthyClicks++;
  updateFinalFades();
  if(finalHealthyClicks>=finalMaxHealthy){
    for(let b of finalButtons){
      b.remove();
    }
    finalButtons=[];
  }
}

function updateFinalFades(){
  let ratio=finalHealthyClicks/finalMaxHealthy;

  // fade healthy => white
  let cVal=int(255*ratio);
  let textColor=`rgb(${cVal},${cVal},${cVal})`;
  for(let b of finalButtons){
    b.style("color",textColor);
    let bcVal=255 - int(200*ratio);
    b.style("background",`rgb(${bcVal},${bcVal*0.7},${bcVal*0.7})`);
  }

  // DRUGS emerges
  let drugOpa=ratio;
  let drugScale=0.5 + 0.5*ratio;
  if(finalDrugBtn){
    finalDrugBtn.style("opacity", drugOpa.toString());
    finalDrugBtn.style("transform",`scale(${drugScale})`);
  }

  if(finalHealthyClicks>=finalMaxHealthy){
    for(let b of finalButtons) b.remove();
    finalButtons=[];
  }
}

function drawFinalStage(){
  fill(0);
  textSize(24);
  text("", width/2, height/2 - 200);
}

/*************************************************************
 * SCARY CHOICE => user picks "Go on a Date" or "Drugs"
 *************************************************************/
function createScaryChoiceButtons(){
  userScaryChoice="";
  let c1=createButton("Go on a Date");
  stylePinkOval(c1);
  c1.position(width/2-120, height/2);
  c1.mousePressed(()=>{
    userScaryChoice="date";
    removeAllButtons();
    state="bigStars";
    starAnimTimer=0;
    starColorTimer=0;
    bigStarsArray=[];
    spawnBigStars();
  });

  let c2=createButton("Drugs");
  stylePinkOval(c2);
  c2.position(width/2+60, height/2);
  c2.mousePressed(()=>{
    userScaryChoice="drugs";
    removeAllButtons();
    state="bigStars";
    starAnimTimer=0;
    starColorTimer=0;
    bigStarsArray=[];
    spawnBigStars();
  });
}

function handleScaryChoice(){
  background(0);
  fill(255);
  text("Which path?", width/2, height/2 - 100);
}

/*************************************************************
 * BIG STARS => 5s color-changing star animation
 *************************************************************/
function spawnBigStars(){
  for(let i=0; i<100; i++){
    bigStarsArray.push({
      x: random(width),
      y: random(height),
      size: random(20,60),
      c: color(random(255), random(255), random(255))
    });
  }
}

function handleBigStars(){
  starAnimTimer++;
  starColorTimer++;

  background(0);

  // change color every 15 frames => ~4 times a second
  if(starColorTimer>15){
    starColorTimer=0;
    for(let s of bigStarsArray){
      s.c=color(random(255), random(255), random(255));
    }
  }

  // draw bigger stars
  for(let s of bigStarsArray){
    fill(s.c);
    noStroke();
    ellipse(s.x, s.y, s.size, s.size);
  }

  // if userScaryChoice="date", show "Meaningless Sex"
  if(userScaryChoice==="date"){
    fill(255,0,255);
    text("Meaningless Sex", width/2, height/2);
  }

  if(starAnimTimer>300){ // 5s
    removeAllButtons();
    state="cameraDrugs";
    activateWebcam();
    createCameraDrugButtons();
  }
}

/*************************************************************
 * CAMERA DRUGS => 5 choices
 *************************************************************/
function activateWebcam(){
  webcam = createCapture(VIDEO);
  webcam.size(160,120);
  webcam.hide();
}

function createCameraDrugButtons(){
  removeAllButtons();
  let drugArr=["MOLLY","XANNAX","ACID","WEED","KETAMINE"];
  let radius=200;
  let angleStep=TWO_PI/drugArr.length;

  for(let i=0;i<drugArr.length;i++){
    let angle=angleStep*i - HALF_PI;
    let x=width/2+cos(angle)*radius;
    let y=height/2+sin(angle)*radius;

    let btn=createButton(drugArr[i]);
    stylePinkOval(btn);
    btn.position(x,y);
    btn.mousePressed(()=>{
      lastDrugChoice=drugArr[i];
      removeAllButtons();
      state="pixelateChoice";
      pixelateCount=0;
      createPixelateButtons();
    });
  }
}

function handleCameraDrugs(){
  background(0);
  drawWebcamPixel(3); // mild pixelation
}

/*************************************************************
 * PIXELATE CHOICE => 5 identical drug buttons
 *************************************************************/
function createPixelateButtons(){
  removeAllButtons();
  for(let i=0;i<5;i++){
    let x=random(width-100);
    let y=random(height-40);
    let btn=createButton(lastDrugChoice);
    stylePinkOval(btn);
    btn.position(x,y);
    btn.mousePressed(()=>{
      pixelateCount++;
      if(pixelateCount>=pixelateMax){
        removeAllButtons();
        state="finalChaos";
        chaosStartTime=millis();
        createGetHighButtons();
      }
    });
  }
}

function handlePixelateChoice(){
  background(0);
  let ratio=pixelateCount/pixelateMax;
  let pixLevel=3+int(ratio*10);
  drawWebcamPixel(pixLevel);
}

/*************************************************************
 * FINAL CHAOS => 5 "GET ME HIGH" => 30s => black
 *************************************************************/
function createGetHighButtons(){
  meltdownBtns=[];
  for(let i=0;i<5;i++){
    let x=random(width-100);
    let y=random(height-40);
    let btn=createButton("TIME IS MELTING");
    stylePinkOval(btn);
    btn.position(x,y);
    meltdownBtns.push(btn);
    btn.mousePressed(()=>{
      spawnAggressionMessage();
    });
  }
}

function handleFinalChaos(){
  let dt=millis()-chaosStartTime;
  // flicker
  let flashFreq=10;
  if(frameCount%flashFreq<flashFreq/2){
    background(random(255),random(255),random(255));
  } else {
    background(0);
  }
  drawWebcamPixel(15+random(5));
  drawHugeCursorTrail();

  if(dt>30000){
    removeAllButtons();
    background(0);
    noLoop(); // freeze
  }
}

/*************************************************************
 * AGGRESSION UTILS
 *************************************************************/
function spawnAggressionMessage(){
  let div=createDiv(random(aggressionMessages));
  div.style("position","absolute");
  div.style("left", random(width)+"px");
  div.style("top", random(height)+"px");
  div.style("color","red");
  div.style("font-size","24px");
  div.style("font-family","OCR A, monospace");
  setTimeout(()=>div.remove(),2000);
}

function drawWebcamPixel(px){
  if(!webcam) return;
  noSmooth();
  push();
  translate(width/2-(160*px)/2, height/2-(120*px)/2);
  image(webcam,0,0,160*px,120*px);
  pop();
}

function drawHugeCursorTrail(){
  cursorTrail.push({x:mouseX,y:mouseY});
  if(cursorTrail.length>80) cursorTrail.shift();

  noStroke();
  for(let i=0;i<cursorTrail.length;i++){
    let pos=cursorTrail[i];
    let alpha=map(i,0,cursorTrail.length,20,255);
    fill(random(255),alpha,random(255),alpha);
    ellipse(pos.x,pos.y,30,30);
  }
}

/*************************************************************
 * GLITCHY CURSOR (normal)
 *************************************************************/
function drawCursorTrail(){
  if(state==="finalChaos") return; 
  cursorTrail.push({x:mouseX,y:mouseY});
  if(cursorTrail.length>50) cursorTrail.shift();

  noStroke();
  for(let i=0;i<cursorTrail.length;i++){
    let pos=cursorTrail[i];
    let alpha=map(i,0,cursorTrail.length,20,200);
    fill(255,alpha,alpha);
    ellipse(pos.x,pos.y,10,10);
  }
}

/*************************************************************
 * UTILITY
 *************************************************************/
function removeAllParticles(){
  smokeParticles=[];
  starParticles=[];
}
function removeAllButtons(){
  let existingBtns=selectAll("button");
  for(let b of existingBtns){
    b.remove();
  }
}
