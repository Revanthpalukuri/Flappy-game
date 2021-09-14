const cvs=document.getElementById('bird');
const ctx=cvs.getContext("2d");
let frames=0;
const DEGREE = Math.PI/180;
//image
const sprite=new Image();
sprite.src="img/sprite.png";
// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

//game state
const state={
    current:0,
    getReady:0,
    game:1,
    over:2
}
//start button
const startBtn={
    x:120,
    y:263,
    w:83,
    h:29
}
//event
cvs.addEventListener('click',function(event){
    switch(state.current){
        case state.getReady: 
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            //it gives the position when the user scrolled alsoo
            let rect=cvs.getBoundingClientRect();


            let clickx=event.clientX- rect.left;
            let clicky=event.clientY-rect.top;
            if(clickx>=startBtn.x && clickx<=startBtn.x+startBtn.w && clicky>=startBtn.y && clicky<=startBtn.y+startBtn.h)
            {
                bird.speedReset();
                pipes.reset();
                score.reset();
                state.current=state.getReady;
            }
            break;
    }
})


//background
const bg={
    sx:0,
    sy:0,
    w:275,
    h:226,
    x:0,
    y:cvs.height -226,
    draw :function()
    {
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x+this.w,this.y,this.w,this.h);
    }
}
//foreground
const fg={
    sx:276,
    sy:0,
    w:224,
    h:112,
    x:0,
    dx:2,
    y:cvs.height -112,
    draw :function()
    {
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x+this.w,this.y,this.w,this.h);
    },
    update: function(){
        if(state.current==state.game)
        {
            this.x=(this.x-this.dx)%(this.w/2);
        }
    } 
}

//bird
const bird={
    animation:[
        {sx: 276, sy : 112},
        {sx: 276, sy : 139},
        {sx: 276, sy : 164},
        {sx: 276, sy : 139}
    ],
    x:50,
    y:150,
    w:34,
    h:26,
    radius:12,
    gravity:0.1,
    frame:0,
    jump:2.5,
    speed:0,
    rotation:0,
    draw :function()
    {
        let bird=this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite,bird.sx,bird.sy,this.w,this.h,-this.w/2,-this.h/2,this.w,this.h);
        ctx.restore();
    },
     flap: function()
     {
         this.speed-=this.jump;
    },
    update :function()
    {
        //initially bird flap slowly
         this.period=state.current==state.getReady?2:1;
         //increment frame
         this.frame+=frames%this.period==0?1:0;
         //frame from 0-4 and again 0
         this.frame=this.frame%this.animation.length;

         if(state.current==state.getReady) 
         {
             this.y=150;
             this.rotation = 0 * DEGREE;
         }
         else
         {
             this.speed+=this.gravity;
             this.y+=this.speed;

             //base ki touch ayithe
             if(this.y+this.h/2>=cvs.height-fg.h)
             {
                 this.y=cvs.height-fg.h-this.h/2;
                 if(state.current==state.game)
                 {
                    DIE.play();
                     state.current=state.over;  
                 }
             }

             //if speed greater than jump rotate the bird
             if(this.speed>this.jump)
             {
                 this.rotation=90* DEGREE;
                 this.frame=1;
             }
             else 
             {
                 this.rotation= -25*DEGREE;
             }
        }
    },
    speedReset : function(){
        this.speed = 0;
    }

}
//get ready message
const getReady={
    sx:0,
    sy:228,
    w:173,
    h:152,
    x:cvs.width/2-173/2,
    y:80,
    draw :function()
    {
        if(state.current==state.getReady)
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
    }
}

//game over message
const gameOver={
    sx:175,
    sy:228,
    w:225,
    h:202,
    x:cvs.width/2-225/2,
    y:90,
    draw :function()
    {
        if(state.current==state.over)
        ctx.drawImage(sprite,this.sx,this.sy,this.w,this.h,this.x,this.y,this.w,this.h);
    }
}
//pipes
const pipes={
     position:[],
     top:{
         sx:553,
         sy:0,
     },
     bottom:{
         sx:502,
         sy:0,
     },
     w:53,
     h:400,
     gap:100,
     dx:2,
     maxYpos:-150,
     draw: function(){
         for(let i=0;i<this.position.length;i++)
         {
             let p=this.position[i];
             let topy=p.y;
             let bottomy=p.y+this.gap+this.h;

             //top pipe
             ctx.drawImage(sprite,this.top.sx,this.top.sy,this.w,this.h,p.x,topy,this.w,this.h);
             //bottom pipe
             ctx.drawImage(sprite,this.bottom.sx,this.bottom.sy,this.w,this.h,p.x,bottomy,this.w,this.h);
         }
     },
     update: function(){
         if(state.current!=state.game) return;
         if(frames%150==0)
         {
             this.position.push({
                 x:cvs.width,
                 y:this.maxYpos*(Math.random()+1),
             });
         }
         for(let i=0;i<this.position.length;i++)
         {
             let p=this.position[i];
             let bottomPipeYPos = p.y + this.h + this.gap;
             // COLLISION DETECTION
            // TOP PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                HIT.play();
            }
            // BOTTOM PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                HIT.play();
            }
            //if pipes baytaaku pothe remove from array
             if(p.x+this.w<=0)
             {
                 this.position.shift();
                 score.value+=1;
                 SCORE_S.play();
                 score.best=Math.max(score.value,score.best);
                 localStorage.setItem("best",score.best);
             }
             p.x-=this.dx;
         }
     },
     reset: function(){
         this.position=[];
     }
}
//score 
const score={
    best:parseInt(localStorage.getItem("best")) || 0,
    value:0,
    draw: function(){
        ctx.fillStyle="#FFF";
        ctx.strokeStyle="#000";
        if(state.current==state.game)
        {
            ctx.lineWidth=2;
            ctx.font="35px Teko";
            ctx.fillText(this.value,cvs.width/2,50);
            ctx.strokeText(this.value,cvs.width/2,50);
        }
        else if(state.current==state.over)
        {
            //score
            ctx.font="25px Teko";
            ctx.fillText(this.value,225,186);
            ctx.strokeText(this.value,225,186);
            //high score
            ctx.fillText(this.best,225,228);
            ctx.strokeText(this.best,225,228);
        }
    },
    reset : function(){
        this.value=0;
    }
}
function draw()
{
    ctx.fillStyle="#70c5ce";
    ctx.fillRect(0,0,cvs.width,cvs.height);
    bg.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    pipes.draw();
    gameOver.draw();
    score.draw();
}

function update()
{
    bird.update();
    fg.update();
    pipes.update();
}

function loop()
{
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}
loop();

