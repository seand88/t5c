import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4, Color3 } from "@babylonjs/core/Maths/math.color";
import { Path3D } from "@babylonjs/core/Maths/math.path";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import State from "../../../client/Screens/Screens";
import { Sound } from "@babylonjs/core/Audio/sound";
import { dataDB } from "../../Data/dataDB";

export class EntityActions {
    private _scene: Scene;
    private _loadedAssets: any[];
    private particleTxt_01: Texture;

    private colors = {
        white: [Color3.FromInts(255, 255, 255), Color3.FromInts(240, 240, 240)],
        green: [Color3.FromInts(64, 141, 33), Color3.FromInts(146, 245, 107)],
        orange: [Color3.FromInts(249, 115, 0), Color3.FromInts(222, 93, 54)],
    };

    constructor(scene, _loadedAssets) {
        this._scene = scene;
        this._loadedAssets = _loadedAssets;
        this.particleTxt_01 = this._loadedAssets["TXT_particle_01"];
    }

    public playSound() {}

    public process(data, ability) {
        //console.log(ability);
        /*
        let soundToPlay = this._scene.getSoundByName("sound_"+ability.key);
        if(!soundToPlay){
            // play sound
            let soundData = this._loadedAssets[ability.sound];
            let sound = new Sound("sound_"+ability.key, soundData, this._scene, function(){ sound.play(); }, {
                volume: 0.3
            });
        }*/

        // get target mesh
        let mesh = this._scene.getMeshByName(data.targetId);

        // set start and end pos
        let start = data.fromPos;
        let end = data.targetPos;
        if (ability.effect.type === "target") {
            start = data.targetPos;
        }

        if (ability.effect.type === "self") {
            start = data.fromPos;
            end = data.fromPos;
        }

        // set effect
        if (ability.effect.particule === "fireball") {
            this.particule_fireball(new Vector3(start.x, start.y, start.z), new Vector3(end.x, end.y, end.z), mesh, ability.effect.color);
        }

        if (ability.effect.particule === "heal") {
            this.particule_heal(mesh, ability.effect.color);
        }
    }

    public particule_heal(mesh, color) {
        //////////////////////////////////////////////
        // create a particle system
        var particleSystem = new ParticleSystem("particles", 2000, this._scene);
        particleSystem.particleTexture = this.particleTxt_01.clone();
        particleSystem.emitter = mesh; // the starting location
        // Colors of all particles
        particleSystem.color1 = Color4.FromColor3(this.colors[color][0]);
        particleSystem.color2 = Color4.FromColor3(this.colors[color][1]);
        particleSystem.colorDead = new Color4(0, 0, 0, 0.0);
        // Size of each particle (random between...
        particleSystem.minSize = 0.5;
        particleSystem.maxSize = 0.9;
        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.6;
        // Emission rate
        particleSystem.emitRate = 100;
        particleSystem.createSphereEmitter(1);
        // Speed
        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 5;
        particleSystem.updateSpeed = 0.1;
        // Start the particle system
        particleSystem.start();
        //////////////////////////////////////////////

        setTimeout(() => {
            particleSystem.dispose(true);
        }, 500);
    }

    public particule_fireball(start, end, mesh, color) {
        // calculate angle
        var angle = Math.atan2(start.z - end.z, start.x - end.x);

        // create material
        var material = new StandardMaterial("player_spell");
        material.diffuseColor = this.colors[color][0];

        // create mesh
        var projectile = MeshBuilder.CreateSphere("Projectile", { segments: 4, diameter: 0.4 }, this._scene);
        projectile.material = material;
        projectile.position = start.clone();
        projectile.position.y = 2;
        projectile.rotation.y = Math.PI / 2 - angle;

        //////////////////////////////////////////////
        // create a particle system
        var particleSystem = new ParticleSystem("particles", 2000, this._scene);
        particleSystem.particleTexture = this.particleTxt_01.clone();
        particleSystem.emitter = projectile; // the starting location
        // Colors of all particles
        particleSystem.color1 = Color4.FromColor3(this.colors[color][0]);
        particleSystem.color2 = Color4.FromColor3(this.colors[color][1]);
        particleSystem.colorDead = new Color4(0, 0, 0, 0.0);
        // Size of each particle (random between...
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.4;
        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.05;
        particleSystem.maxLifeTime = 0.3;
        // Emission rate
        particleSystem.emitRate = 1000;
        particleSystem.createSphereEmitter(1);
        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 5;
        particleSystem.updateSpeed = 0.01;
        // Start the particle system
        particleSystem.start();
        //////////////////////////////////////////////

        var endVector = projectile.calcMovePOV(0, 0, 72).addInPlace(projectile.position);
        var points = [start, endVector];
        var path = new Path3D(points);
        var i = 0;
        var loop = this._scene.onBeforeRenderObservable.add(() => {
            if (i < 1) {
                projectile.position = path.getPointAt(i);
                i += 5e-3;
            }
            if (projectile.intersectsMesh(mesh) || i > 1) {
                this.particule_heal(mesh, color);
                projectile.dispose(true, true);
                particleSystem.dispose(true);
                this._scene.onBeforeRenderObservable.remove(loop);
            }
        });
    }
}
