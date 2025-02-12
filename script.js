const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const deltaTime = 25;
const planc = deltaTime/1000;
let GN = 1000000;

class GRASS{
    constructor(p,n,ph){
        this.p={x: Math.min(Math.max(0,p.x+((Math.random()-0.5)*100)),1200), y: p.y};
        this.s=0;
        this.l=0;
        this.n=n;
        this.ph=ph;
        this.phr=ph.filter(x => true);
        this.rb=this.ph[0].rb;
        this.rn=Math.max(0,this.ph[0].rn+(Math.random()-0.5)*10);
        this.ig=Math.max(0,this.ph[0].ig+(Math.random()-0.5)*2);
        this.tl=this.ph[0].tl+(Math.random()-0.5);
        this.gr=Math.max(0,this.ph[0].gr+(Math.random()-0.5)/10);
        this.d=false;
        GRASS.all.push(this);
    }
    static all=[];
    /*
    p;  // position             {x: int, y: int}
    s;  // size                 int
    l;  // elapsed lifetime     int
    n;  // nutrient value       int
    ph; // phase modifiers      [phase_1_properties, phase_2_properties, phase_3_properties]
    phr;// phase modifiers to give to offspring -||-
        // phase related 
    rn; // reproduction nutrient    int
    ig; // intakegrade              int
    tl; // time limit               int
    gr; // growth rate              int
    */

    die(reason,related){
        this.d=true;
        GRASS.all = GRASS.all.filter(x => !x.d);
        GN+=this.n+this.s;
        //console.log(reason,related);
    }
    update(){
        if(this.n>this.s){  // Energy regulation
            this.n-=this.s*planc;
            GN+=this.s*planc;
        }
        else this.die('lack of energy',{energy:this.n,size:this.s});
        if(GN>this.ig*this.s && this.n<this.s*10){ // if enough nutrients exist in nature in accordance to size
            GN-=this.ig*this.s*planc; // remove nutrients from nature in accordance to size
            this.n+=this.ig*this.s*planc; // intake nutrients in accordance to size
        }
        else if(this.n<this.s*10){
            this.n+=GN;
            GN=0;
        }
        if(this.n>this.gr){     // if there is enough nutrients to grow
            this.n-=this.gr*planc;    // deduct nutrients
            this.s+=this.gr*planc;    // grow
        }
        if(this.rb && this.n>this.rn){       // if it is time to reproduce and there is enough nutrients to do so
            // reproduce
            try{
            if(GRASS.all.length<2000){
                new GRASS(this.p,this.rn,this.phr.filter(x => true));     // create new grass
                this.n-=this.rn;                                          // remove the energy
            }
            else if (Math.random()<0.05){
                new GRASS(this.p,this.rn,this.phr.filter(x => true));     // create new grass
                this.n-=this.rn;                                          // remove the energy
                new GRASS(this.p,this.rn,this.phr.filter(x => true));
                this.n-=this.rn;
            }
            }
            catch{
                //console.log(this.rb,this.ph, this.phr);
            }
            this.rb=false;
        }
        if(this.tl<=this.l){    // if the phase's timelimit is over
            // advance phase
            //console.log(this.ph)
            this.ph.shift();
            //console.log(this.ph);
            if(this.ph.length==0){    // if there are no more phases remaining
                // die
                this.die('end of life cycle',{own:this.ph,reproductive:this.phr});
                return;
            }
            this.rb=this.ph[0].rb;
            this.rn=Math.max(0,this.ph[0].rn+(Math.random()-0.5)*10);
            this.ig=Math.max(0,this.ph[0].ig+(Math.random()-0.5)*2);
            this.tl=this.ph[0].tl+(Math.random()-0.5);
            this.gr=Math.max(0,this.ph[0].gr+(Math.random()-0.5)/10);
        }
        this.l+=planc; //increase elapsed time
        this.draw();
        //console.log(GRASS.all.reduce((x,y) => x+y.n+y.s,0),GN);
    }
    draw(){
        ctx.strokeStyle=`hsl(${this.ig*50}, 100%, 50%)`
        ctx.beginPath();
        ctx.moveTo(this.p.x,this.p.y);
        ctx.lineTo(this.p.x,this.p.y-this.s);
        ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();
    }
}

new GRASS({x:400,y:900}, 500, [{rn: 0, ig: 6, tl: 4, gr: 40, rb: false}, {rn: 500, ig: 400, tl: 4, gr: 0, rb: true}, {rn: 0, ig: 3, tl: 40, gr: 0, rb: false}, {rn: 500, ig: 400, tl: 40, gr: 0, rb: true}]);
new GRASS({x:800,y:900}, 500, [{rn: 0, ig: 2, tl: 1, gr: 40, rb: false}, {rn: 500, ig: 200, tl: 1, gr: 0, rb: true},{rn: 200, ig: 400, tl: 1, gr: 0, rb: true}, {rn: 0, ig: 0, tl: 30, gr: 0, rb: false}]);

//return the magnitude of a 2d vector
function vec2Mag(v){return Math.sqrt(v.x**2 + v.y**2)};
function touch(any){console.log(`touched: ${(any instanceof GRASS)?"grass":"not grass"}`);}
function handedness(v,w){return Math.sign(v.x*w.y - w.x*v.y);}
function vec2FromAng(angle){return {x: Math.cos(angle), y: Math.sin(angle)};}
function dot(v,w){return v.x*w.x + v.y*w.y;}
function normalise(v){
    let mag = vec2Mag(v);
    if(mag == 0) return{x:0,y:0};
    return {x: v.x/mag, y: v.y/mag};
}
function renderVec2(v, origin, scale){
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x+v.x*scale, origin.y+v.y*scale);
    ctx.closePath();
    ctx.stroke();
}
//alternative to console
function write(text){
    ctx.fillText(text, 10,10);
    //(...)
    //make this smarter later
}
function isInView(grass, creature){
    if(Math.abs(grass.p.x-creature.p.x) > creature.gs.vis) return false;
    if(creature.y+creature.gs.vis < canvas.height-grass.s) return false;
    return true;
}


class CREATURE_STATE{
    constructor(nut){
        this.n = nut; //nutriens
        this.l = 0; //elapsed lifetime
        this.t = null; //target plant
        this.g = "wander"; //walking mode/goal
    }
}
class CREATURE_GENOM{
    constructor(vis, col, size, spd){
        this.vis = vis; //vision -> how far it can see
        this.col = col; //colour -> just visual for now
        this.size = size; //size -> max nutrients stored
        this.max = size*5;
        this.spd = spd; //speed  -> max speed
    }
    static mutationRate = 3;
    static random(){
        return new CREATURE_GENOM(
            Math.random()*100 + 40,
            Math.random()*360,
            Math.random()*20+10,
            Math.random()*50+100,
        );
    };
    mutate(){
        let cg = new CREATURE_GENOM();
        Object.keys(this).forEach(key=>cg[key]=this[key] + (Math.random()-0.5)*2*CREATURE_GENOM.mutationRate);
        return cg;
    }
}
class CREATURE{
    constructor(pos, genes, nutriens){
        this.p = pos; //position
        this.v = {x:1, y:1}; //velocity
        this.gs = genes; //genes
        this.st = new CREATURE_STATE(nutriens); //state of the creature
        this.dg = Math.PI; //desired angle
        CREATURE.all.push(this);
    }
    static all = [];
    render(){
        try{
            ctx.beginPath();
            ctx.fillStyle = `hsl(${this.gs.col}, ${this.st.n/this.gs.max*100}%, 50%)`;
            ctx.arc(this.p.x, this.p.y, this.gs.size, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.fill();
        }
        catch{ this.die();}
        //renderVec2(vec2FromAng(this.dg), this.p, 100);
        //renderVec2(this.v, this.p, 1);
    }
    update(){
        if(this.p.x-this.gs.size < 0){
            //left
            this.v.x *= -1;
            this.p.x = this.gs.size;
            let angVec = vec2FromAng(this.dg);
            this.dg = Math.atan2(angVec.y, -angVec.x);
        }
        else if(this.p.x + this.gs.size > canvas.width){
            //right
            this.v.x *= -1;
            this.p.x = canvas.width-this.gs.size;
            let angVec = vec2FromAng(this.dg);
            this.dg = Math.atan2(angVec.y, -angVec.x);

        }
        else if(this.p.y-this.gs.size < 0){
            //top
            this.v.y *= -1;
            this.p.y = this.gs.size;
            let angVec = vec2FromAng(this.dg);
            this.dg = Math.atan2(-angVec.y, angVec.x);
        }
        else if(this.p.y + this.gs.size > canvas.height){
            //bottom
            this.v.y *= -1;
            this.p.y = canvas.height-this.gs.size;
            let angVec = vec2FromAng(this.dg);
            this.dg = Math.atan2(-angVec.y, angVec.x);
        }
        let spent = (vec2Mag(this.v)*0.01 +this.gs.size*0.01 + this.gs.vis*0.01)*planc;
        this.st.n -= spent;
        GN += spent;
        if(this.st.n <= 0){this.die();}
        this.p.x += this.v.x*planc;
        this.p.y += this.v.y*planc;
        let ang, newAng, speedChange;
        switch(this.st.g){
            case "wander":
                ang = Math.atan2(this.v.y, this.v.x);
                if(Math.abs(ang - this.dg) < (this.gs.spd/180*Math.PI*planc)){
                    this.dg = (Math.random()-0.5)*Math.PI*2;
                }
                newAng = ang + handedness(this.v, vec2FromAng(this.dg))*this.gs.spd/180*Math.PI*planc;
                speedChange = (1+dot(vec2FromAng(this.dg), normalise(this.v)))*0.5;
                this.v = {x: Math.cos(newAng)*this.gs.spd*speedChange, y: Math.sin(newAng)*this.gs.spd*speedChange};
                if(this.st.n < this.gs.max*0.5){ this.lookAround();}
                break;
            case "goto":
                //console.error("not implemented");
                let dirvec = {x: this.st.t.p.x-this.p.x, y: canvas.height-this.st.t.s-this.p.y};
                if(vec2Mag(dirvec) < this.gs.size){
                    this.st.g = "eat";
                    this.v = {x:0,y:0};
                    break;
                }
                this.dg = Math.atan2(dirvec.y, dirvec.x);
                ctx.fillStyle = "black";
                ang = Math.atan2(this.v.y, this.v.x);
                newAng = ang + handedness(this.v, vec2FromAng(this.dg))*this.gs.spd/180*Math.PI*planc;
                speedChange = (1+dot(vec2FromAng(this.dg), normalise(this.v)))*0.5;
                this.v = {x: Math.cos(newAng)*this.gs.spd*speedChange, y: Math.sin(newAng)*this.gs.spd*speedChange};
                break;
            case "gofrom":
                console.error("not implemented");
                break;
            case "reproduce":
                //console.error("not implemented");
                //create two new creatures
                new CREATURE({x:this.p.x-this.gs.size, y:this.p.y}, this.gs.mutate(), this.st.n/2);
                new CREATURE({x:this.p.x+this.gs.size, y:this.p.y}, this.gs.mutate(), this.st.n/2);
                //kill the original creature
                this.die();
                break;
            case "eat":
                //console.error("not implemented");
                if((this.st.t.n + this.st.t.s) < this.gs.max*0.5){
                    this.st.n += this.st.t.n;
                    this.st.t.s = 0; 
                    this.st.t.n = 0;
                    this.st.t.die("eaten",{});
                }
                else{
                    this.st.t.n -= this.gs.max*0.25;
                    this.st.t.s -= this.gs.max*0.25;
                    this.st.n += this.gs.max*0.5;
                }
                if(this.st.n > this.gs.max*0.75){
                    if(true){//encouraging reproduction
                        this.st.g="reproduce";
                        break;
                    }
                }
                this.st.g = "wander";
                break;
            default:
                console.error(`unexpected goal: ${this.st.g}`);
                break;
        }
    }
    die(){
        if(!CREATURE.all.includes(this)) return;
        CREATURE.all.splice(CREATURE.all.indexOf(this),1);
    }
    lookAround(grass, creature){
        let seen = GRASS.all.filter(g=>isInView(g,this));
        if(seen.length == 0) return;
        this.st.g = "goto";
        this.st.t = seen[Math.floor(Math.random()*seen.length)];
    }
}
new CREATURE({x:600,y:450},CREATURE_GENOM.random(), 30);
setInterval(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    GRASS.all.forEach(g=>{
        g.update();
    })
    CREATURE.all.forEach(c=>{
        c.update();
        c.render();
        //ctx.fillText(`${c.p.x,c.p.y}`,10,10);
    });
}, deltaTime);
