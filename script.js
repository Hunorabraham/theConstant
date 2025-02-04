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
    }
    p;  // position             {x: int, y: int}
    s;  // size                 int
    l;  // elapsed lifetime     int
    n;  // nutrient value       int
    ph; // phase modifiers      [phase_1_properties, phase_2_properties, phase_3_properties]
    phr; // phase modifiers to give to offspring -||-
    // phase related 
    rn; // reproduction nutrient    int
    ig; // intakegrade              int
    tl; // time limit               int
    rl; // reproduction limit       int
    rt; // reproduction timer       int
    gr; // growth rate              int

    update(){
        this.n+=this.ig; // intake nutrients
        if(this.n>this.gr){     // if there is enough nutrients to grow
            this.n-=this.gr;    // deduct nutrients
            this.s+=this.gr;    // grow
        }
        if(this.l%this.rl && this.n>this.rn){     // if it is time to reproduce and there is enough nutrients to do so
            // reproduce
        }
        if(this.tl<=this.l){    // if the phase's timelimit is over
            // advance phase
            this.phr.push(this.ph.shift());
            if(this.ph.length()==0){    //if there are no more phases remaining
                // die
            }
            this.rn=ph[0].rn+Math.random()-0.5;
            this.ig=ph[0].ig+Math.random()-0.5;
            this.tl=ph[0].tl+Math.random()-0.5;
            this.rl=ph[0].rl+Math.random()-0.5;
            this.gr=ph[0].gr+Math.random()-0.5;
        }
        this.l++; //increase elapsed time
        // DRAW
    }
    draw(){
        
    }
}