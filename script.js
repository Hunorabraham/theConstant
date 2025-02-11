const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const deltaTime = 16;
const planc = deltaTime/1000;

class GRASS{
    constructor(p,n,ph){
        this.p={x: p.x+Math.random()-0.5, y: p.y};
        this.s=0;
        this.l=0;
        this.n=n+Math.random()-0.5;
        this.ph=ph;
        this.phr=[];
        this.rn=ph[0].rn+Math.random()-0.5;
        this.ig=ph[0].ig+Math.random()-0.5;
        this.tl=ph[0].tl+Math.random()-0.5;
        this.rl=ph[0].rl+Math.random()-0.5;
        this.gr=ph[0].gr+Math.random()-0.5;
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

    update(){
        this.n+=this.ig; // intake nutrients
        if(this.n>this.gr){     // if there is enough nutrients to grow
            this.n-=this.gr;    // deduct nutrients
            this.s+=this.gr;    // grow
        }
        if(this.l%this.rl && this.n>this.rn){       // if it is time to reproduce and there is enough nutrients to do so
            // reproduce
            new GRASS(this.p,this.rn,this.phr);     // create new grass
            this.n-=this.rn;                        // remove the energy
        }
        if(this.tl<=this.l){    // if the phase's timelimit is over
            // advance phase
            this.phr.push(this.ph.shift());
            if(this.ph.length==0){    // if there are no more phases remaining
                // die
            }
            this.rn=this.ph[0].rn+Math.random()-0.5;
            this.ig=this.ph[0].ig+Math.random()-0.5;
            this.tl=this.ph[0].tl+Math.random()-0.5;
            this.rl=this.ph[0].rl+Math.random()-0.5;
            this.gr=this.ph[0].gr+Math.random()-0.5;
        }
        this.l++; //increase elapsed time
        this.draw();
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

new GRASS({x:600,y:900}, 200, [{rn: 0, ig: 0, tl: 5, rl: 0, gr: 2}, {rn: 0, ig: 50, tl: 10, rl: 0, gr: 1},{rn: 100, ig: 50, tl: 20, rl: 2, gr: 0}]);

//return the magnitude of a 2d vector
function vec2Mag(v){return Math.sqrt(v.x**2 + v.y**2);}
//funny
function touch(any){console.log(`touched: ${(any instanceof GRASS)?"grass":"not grass"}`);}
//returns -1; 1 or 0
//w is a (+/-) rotation from v, eg: (1,0) is a positive rotation, PI/2, from (0,1)
//if angle between w and v is 0, 0 is returned
function handedness(v,w){return Math.sign(v.x*w.y - w.x*v.y);}
//returns a normal vector with anlge (Math.atan2) = ang
function vec2FromAng(ang){return {x:Math.cos(ang), y:Math.sin(ang)};}
function debugRenderVec2(v, point){
    ctx.beginPath();
    ctx.moveTo(point.x,point.y);
    ctx.lineTo(point.x +v.x*100, point.y + v.y*100);
    ctx.closePath();
    ctx.stroke();
}


class CREATURE_STATE{
    constructor(nut){
        this.n = nut; //nutriens
        this.l = 0; //elapsed lifetime
        this.t = null; //target plant
        this.g = "wander"; //walking mode/goal
    }
}
class CREATURE_GENE{
    constructor(vis, col, size, spd){
        this.vis = vis; //vision -> how far it can see
        this.col = col; //colour -> just visual for now
        this.size = size; //size -> max nutrients stored
        this.spd = spd; //speed  -> max speed
    }
    static mutationRate = 1;
    static random(){
        return new CREATURE_GENE(
            Math.random()*100 + 40,
            Math.random()*360,
            Math.random()*20+10,
            Math.random()*50+100,
        );
    };
    mutate(){
        let cg = new CREATURE_GENE();
        Object.keys(this).forEach(key=>cg[key]=this[key] + (Math.random()-0.5)*2*mutationRate);
        return cg;
    }
}
class CREATURE{
    constructor(pos, genes, nutriens){
        this.p = pos; //position
        this.v = {x:1, y:1}; //velocity
        this.gs = genes; //genes
        this.st = new CREATURE_STATE(nutriens); //state of the creature
        CREATURE.all.push(this);
        this.dg = 0; //desired angle to head towards
        this.texp = 1; //turn expirity, at most turn in one direction for 1 second then change direction
    }
    static all = [];
    render(){
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.gs.col}, ${this.st.n}%, 50%)`;
        ctx.arc(this.p.x, this.p.y, this.gs.size, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
        debugRenderVec2(this.v,this.p);
    }
    update(){
        this.st.n -= (vec2Mag(this.v)/100*this.gs.size + this.gs.vis) * planc *0.1;
        if(this.st.n <= 0) {this.die(); return;}
        this.p.x += this.v.x *planc;
        this.p.y += this.v.y *planc;

        switch(this.st.g){
            case "wander":
                //make better, now runs forward on average -> BAD!
                let ang = Math.atan2(this.v.y, this.v.x);
                this.texp -= planc;
                if(Math.abs(this.dg - ang) < this.gs.spd/180*Math.PI*planc || this.texp <= 0){
                    this.dg = Math.random()*Math.PI*2;
                    this.texp = 1;
                    break;
                }
                let newAng = ang + handedness(vec2FromAng(this.dg),this.v) * this.gs.spd/180*Math.PI*planc; //here
                this.v = {x: Math.cos(newAng)*this.gs.spd, y: Math.sin(newAng)*this.gs.spd}; //always going max speed right now
                //this.lookAround();
                break;
            case "goto":
                console.error("not implemented");
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
    lookAround(){
        console.error("not implemented");
    }
    die(){
        if(!CREATURE.all.includes(this)) return;
        CREATURE.all.splice(CREATURE.all.indexOf(this),1);
    }
}
new CREATURE({x:600,y:450},CREATURE_GENE.random(), 100);
setInterval(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    CREATURE.all.forEach(c=>{
        c.update();
        c.render();
    });
},deltaTime);