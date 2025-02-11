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
        this.phr=[];
        for (let i = 0; i < ph.length; i++) this.phr.push({rn: Math.max(0,ph[i].rn+(Math.random()-0.5)*10), ig: Math.max(0,ph[i].ig+(Math.random()-0.5)*2), tl: ph[i].tl+(Math.random()-0.5), rl: Math.max(0,ph[i].rl+(Math.random()-0.5)/10), gr: Math.max(0,ph[i].gr+(Math.random()-0.5)/10), rb: ph[i].rb});
        this.rb=this.ph[0].rb;
        this.rn=Math.max(0,this.ph[0].rn+(Math.random()-0.5)*10);
        this.ig=Math.max(0,this.ph[0].ig+(Math.random()-0.5)*2);
        this.tl=this.ph[0].tl+(Math.random()-0.5);
        this.rl=Math.max(0,this.ph[0].rl+(Math.random()-0.5)/10);
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
    rl; // reproduction limit       int
    rt; // reproduction timer       int
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
        if(this.rb && this.l%this.rl<1 && this.n>this.rn+this.s){       // if it is time to reproduce and there is enough nutrients to do so
            // reproduce
            try{
            if(GRASS.all.length<1500){
                new GRASS(this.p,this.rn,this.phr.filter(x => true));     // create new grass
                this.n-=this.rn;                        // remove the energy
            }
            else if (Math.random()<1500/GRASS.all.length){
                new GRASS(this.p,this.rn,this.phr.filter(x => true));     // create new grass
                this.n-=this.rn;                        // remove the energy
            }
            }
            catch{
                //console.log(this.rb,this.ph, this.phr);
            }
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
            this.rl=Math.max(0,this.ph[0].rl+(Math.random()-0.5)/10);
            this.gr=Math.max(0,this.ph[0].gr+(Math.random()-0.5)/10);
        }
        this.l+=planc; //increase elapsed time
        this.draw();
        //console.log(GRASS.all.reduce((x,y) => x+y.n+y.s,0),GN);
    }
    draw(){
        ctx.strokeStyle=`hsl(${this.ig}, 100%, 50%)`
        ctx.beginPath();
        ctx.moveTo(this.p.x,this.p.y);
        ctx.lineTo(this.p.x,this.p.y-this.s);
        ctx.stroke();
        ctx.closePath();
        ctx.resetTransform();
    }
}

new GRASS({x:400,y:900}, 500, [{rn: 0, ig: 6, tl: 15, rl: 0, gr: 10, rb: false},{rn: 500, ig: 100, tl: 240, rl: 4, gr: 0, rb: true}]);
new GRASS({x:800,y:900}, 500, [{rn: 0, ig: 4, tl: 1, rl: 0, gr: 10, rb: false}, {rn: 80, ig: 45, tl: 8, rl: 1, gr: 0, rb: true}, {rn: 0, ig: 0, tl: 300, rl: 0, gr: 0, rb: false}]);

//return the magnitude of a 2d vector
function vec2Mag(v){return Math.sqrt(v.x**2 + v.y**2)};
function touch(any){console.log(`touched: ${(any instanceof GRASS)?"grass":"not grass"}`);}
function handedness(v,w){return Math.sign(v.x*w.y - w.x*v.y);}
function vec2FromAng(angle){return {x: Math.cos(angle), y: Math.sin(angle)};}
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
class CREATURE_GENENOM{
    constructor(vis, col, size, spd){
        this.vis = vis; //vision -> how far it can see
        this.col = col; //colour -> just visual for now
        this.size = size; //size -> max nutrients stored
        this.spd = spd; //speed  -> max speed
    }
    static mutationRate = 1;
    static random(){
        return new CREATURE_GENENOM(
            Math.random()*100 + 40,
            Math.random()*360,
            Math.random()*20+10,
            Math.random()*50+100,
        );
    };
    mutate(){
        let cg = new CREATURE_GENENOM();
        Object.keys(this).forEach(key=>cg[key]=this[key] + (Math.random()-0.5)*2*mutationRate);
        return cg;
    }
}
class CREATURE{
    constructor(pos, genes, nutriens){
        this.p = pos; //position
        this.v = {x:0, y:0}; //velocity
        this.gs = genes; //genes
        this.st = new CREATURE_STATE(genes.size*nutriens/100); //state of the creature
        this.dg = 0; //desired angle
        CREATURE.all.push(this);
    }
    static all = [];
    render(){
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.gs.col}, ${this.st.n/this.gs.size*100}%, 50%)`;
        ctx.arc(this.p.x, this.p.y, this.gs.size, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
        //renderVec2(vec2FromAng(this.dg), this.p, 100);
        //renderVec2(this.v, this.p, 1);
    }
    update(){
        this.st.n -= (vec2Mag(this.v)*this.gs.size*0.001 + this.gs.vis*0.001)*planc;
        if(this.st.n <= 0){this.die();}
        write(this.st.n);
        this.p.x += this.v.x*planc;
        this.p.y += this.v.y*planc;
        let ang, newAng;
        switch(this.st.g){
            case "wander":
                ang = Math.atan2(this.v.y, this.v.x);
                if(Math.abs(ang - this.dg) < (this.gs.spd/180*Math.PI*planc)){
                    this.dg = (Math.random()-0.5)*Math.PI*2;
                }
                newAng = ang + handedness(this.v, vec2FromAng(this.dg))*this.gs.spd/180*Math.PI*planc;
                this.v = {x: Math.cos(newAng)*this.gs.spd, y: Math.sin(newAng)*this.gs.spd}; //always going max speed right now
                this.lookAround();
                break;
            case "goto":
                //console.error("not implemented");
                this.dg = Math.atan2(this.st.t.p.s-this.p.y, this.st.t.p.x-this.p);
                ang = Math.atan2(this.v.y, this.v.x);
                newAng = ang + handedness(this.v, vec2FromAng(this.dg))*this.gs.spd/180*Math.PI*planc;
                this.v = {x: Math.cos(newAng)*this.gs.spd, y: Math.sin(newAng)*this.gs.spd}; //always going max speed right now
                
                break;
            case "gofrom":
                console.error("not implemented");
                break;
            case "reproduce":
                console.error("not implemented");
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
new CREATURE({x:600,y:450},CREATURE_GENENOM.random(), 100);
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