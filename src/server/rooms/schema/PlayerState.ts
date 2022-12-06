import { Schema, type } from "@colyseus/schema";
import Logger from "../../../shared/Logger";
import Config from "../../../shared/Config";
import { PlayerInputs } from "../../../shared/types";
import { PlayerCurrentState } from "../../../shared/Entities/Player/PlayerCurrentState";
import { distanceBetween } from "../../../shared/Utils";

export class PlayerState extends Schema {

  // id and name
  @type("number") id: number = 0;
  @type('string') public sessionId: string;
  @type("string") public name: string = "";

  // position & rotation
  @type("number") public sequence: number = 0; // latest input sequence
  @type('number') public x: number;
  @type('number') public y: number;
  @type('number') public z: number;
  @type('number') public rot: number;

  // character details
  @type('number') public health: number;
  @type('number') public level: number;
  @type('number') public experience: number;

  // flags
  @type('boolean') public blocked: boolean; // if true, used to block player and to prevent movement
  @type('number') public state: PlayerCurrentState = PlayerCurrentState.IDLE;

  // current player zone
  @type("string") public location: string = "";

  private _navmesh;
  private _database;

  constructor(navmesh, database, ...args: any[]) {
		super(args);
    this._navmesh = navmesh;
    this._database = database;
	}

  setLocation(location) {
      this.location = location;
  }

  setPositionManual(x, y, z, rot) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.rot = rot;
  }

  loseHealth(amount:number) {
    this.health -= amount;

    // if player has no more health
    // todo: send him back to spawnpoint with health back to 50;
    if(this.health === 0){
      this.state = PlayerCurrentState.DEAD;
      this.blocked = true;
    }
  }

  processPlayerInput(playerInput:PlayerInputs) {

      if(this.blocked){
        this.state = PlayerCurrentState.IDLE;
        Logger.warning('Player '+this.name+' is blocked, no movment will be processed');
        return false;
      }

      // save current position
      let oldX = this.x;
      let oldZ = this.z;
      let oldRot = this.rot;

      // calculate new position
      let newX = this.x - (playerInput.h * Config.PLAYER_SPEED);
      let newZ = this.z - (playerInput.v * Config.PLAYER_SPEED);
      let newRot = Math.atan2(playerInput.h, playerInput.v);

      let diff = distanceBetween({x: oldX, y: 1, z: oldZ}, {x: newX, y: 1, z: newZ});

      // check it fits in navmesh
      const foundPath: any = this._navmesh.findPath({ x: this.x, y: this.z }, { x: newX, y: newZ });
      if (foundPath && foundPath.length > 0) {

          // next position validated, update player
          this.x = newX;
          this.y = 0;
          this.z = newZ;
          this.rot = newRot;
          this.sequence = playerInput.seq;
          this.state = PlayerCurrentState.WALKING;

          // add player to server
          Logger.info('Valid position for '+this.name+': ( x: '+this.x+', y: '+this.y+', z: '+this.z+', rot: '+this.rot+", diff: "+diff);

      } else {

          // collision detected, return player old position
          this.x = oldX;
          this.y = 0;
          this.z = oldZ;
          this.rot = oldRot;
          this.sequence = playerInput.seq;
          this.state = PlayerCurrentState.WALKING;

          Logger.warning('Invalid position for '+this.name+': ( x: '+this.x+', y: '+this.y+', z: '+this.z+', rot: '+this.rot+", diff: "+diff);
      }
  }

}