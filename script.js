const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const deltaTime = 16;
const planc = deltaTime/1000;

//return the magnitude of a 2d vector
function vec2Mag(v){return Math.sqrt(v.x**2 + v.y**2)};

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
                //make better, now runs forward -> BAD!
                let ang = Math.atan2(this.v.y, this.v.x);
                let newAng = (Math.random()-0.5)*2*10;
                this.v = 
                break;
            case "goto":
                console.error("not implemented");
                break;
            case "gofrom":
                console.error("not implemented");
                break;
        }
    }
}