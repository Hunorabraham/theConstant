const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const deltaTime = 16;
const planc = deltaTime/1000;
let GN = 50000;

class GRASS{
    constructor(p,n,ph){
        this.p={x: Math.min(Math.max(0,p.x+((Math.random()-0.5)*100)),1200), y: p.y};
        this.s=0;
        this.l=0;
        this.n=n;
        this.ph=ph;
        this.phr=[];
        for (let i = 0; i < ph.length; i++) this.phr.push({rn: Math.max(0,ph[i].rn+(Math.random()-0.5)*10), ig: Math.max(0,ph[i].ig+(Math.random()-0.5)*2), tl: ph[i].tl+(Math.random()-0.5)*10, rl: Math.max(0,ph[i].rl+Math.random()-0.5), gr: Math.max(0,ph[i].gr+Math.random()-0.5), rb: ph[i].rb});
        this.rb=this.ph[0].rb;
        this.rn=Math.max(0,this.ph[0].rn+(Math.random()-0.5)*10);
        this.ig=Math.max(0,this.ph[0].ig+(Math.random()-0.5)*2);
        this.tl=this.ph[0].tl+(Math.random()-0.5)*10;
        this.rl=Math.max(0,this.ph[0].rl+(Math.random()-0.5));
        this.gr=Math.max(0,this.ph[0].gr+(Math.random()-0.5));
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

    update(){
        if(GN>this.ig){ // if enough nutrients exist in nature
            GN-=this.ig // remove nutrients from nature
            this.n+=this.ig; // intake nutrients
        }
        if(this.n>this.gr){     // if there is enough nutrients to grow
            this.n-=this.gr;    // deduct nutrients
            this.s+=this.gr;    // grow
        }
        if(this.rb && this.l%this.rl<1 && this.n>this.rn){       // if it is time to reproduce and there is enough nutrients to do so
            // reproduce
            try{
            if(GRASS.all.length<1000){
                new GRASS(this.p,this.rn,this.phr);     // create new grass
                this.n-=this.rn;                        // remove the energy
            }
            }
            catch{
                //console.log(this.rb,this.ph, this.phr);
            }
        }
        if(this.tl<=this.l){    // if the phase's timelimit is over
            // advance phase
            this.ph.shift();
            if(this.ph.length==0){    // if there are no more phases remaining
                // die
                this.d=true;
                GRASS.all = GRASS.all.filter(x => !x.d);
                GN+=this.n+this.s;
                return;
            }
            this.rb=this.ph[0].rb;
            this.rn=Math.max(0,this.ph[0].rn+(Math.random()-0.5)*10);
            this.ig=Math.max(0,this.ph[0].ig+(Math.random()-0.5)*2);
            this.tl=this.ph[0].tl+(Math.random()-0.5)*10;
            this.rl=Math.max(0,this.ph[0].rl+(Math.random()-0.5));
            this.gr=Math.max(0,this.ph[0].gr+(Math.random()-0.5));
        }
        this.l++; //increase elapsed time
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

new GRASS({x:600,y:900}, 500, [{rn: 0, ig: 0, tl: 50, rl: 0, gr: 0.2, rb: false}, {rn: 0, ig: 1, tl: 100, rl: 0, gr: 0.1, rb: false},{rn: 20, ig: 2, tl: 400, rl: 1, gr: 0, rb: true}]);

//return the magnitude of a 2d vector
function vec2Mag(v){return Math.sqrt(v.x**2 + v.y**2)};
function touch(any){
    console.log(`touched: ${(any instanceof GRASS)?"grass":"not grass"}`);
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
            Math.random()*20+10,
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
        this.v = {x:0, y:0}; //velocity
        this.gs = genes; //genes
        this.st = new CREATURE_STATE(nutriens); //state of the creature
    }
    render(){
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.gs.col}, ${this.st.n}%, 50%)`;
        ctx.arc(this.p.x, this.p.y, this.gs.size, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
    }
    update(){
        this.st.n -= vec2Mag(this.v)*this.gs.size + this.gs.vis;
        switch(this.st.g){
            case "wander":
                //make better, now runs forward on average -> BAD!
                let ang = Math.atan2(this.v.y, this.v.x);
                let newAng = ang + (Math.random()-0.5)*2*10; //here
                this.v = {x: Math.cos(newAng)*this.gs.spd, y: Math.cos(newAng)*this.gs.spd}; //always going max speed right now
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
}