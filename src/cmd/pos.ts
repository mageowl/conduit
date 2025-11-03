type PosMode = "world" | "relative" | "rotLocal" | number;

/**
 * See https://minecraft.wiki/w/Coordinates#Commands
 */
export class Pos {
  mode: PosMode;
  x: number;
  y: number;
  z: number;

  private constructor(mode: PosMode, x: number, y: number, z: number) {
    this.mode = mode;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static world(x: number, y: number, z: number): Pos {
    return new Pos("world", x, y, z);
  }
  public static abs(x: number, y: number, z: number): Pos {
    return Pos.world(x, y, z);
  }
  public static relative(x = 0, y = 0, z = 0): Pos {
    return new Pos("relative", x, y, z);
  }
  public static rel(x = 0, y = 0, z = 0): Pos {
    return Pos.relative(x, y, z);
  }
  public static rotLocal(x: number, y: number, z: number): Pos {
    return new Pos("rotLocal", x, y, z);
  }
  public static rot(x: number, y: number, z: number): Pos {
    return Pos.rotLocal(x, y, z);
  }
  /**
   * Creates a "mixed" postion, consisting of some relative and some world coordinates.
   * Use `Pos.RELATIVE_X`, `Pos.RELATIVE_Y`, and `Pos.RELATIVE_Z` to define which coordinates should be relative versus absolute.
   * ```typescript
   * Pos.mixed(Pos.RELATIVE_X + Pos.RELATIVE_Z, 0, 64, 0) // becomes ~ 64 ~
   * ```
   * It is not possible to mix rotation local coordinates, due to the limitations of Minecraft.
   * Instead, use `execute.rotated(Rot.mixed(Rot.RELATIVE_X, 0, 0))` to "globalize" the Y component or Rot.RELATIVE_Y for the X and Z components.
   */
  public static mixed(mode: number, x: number, y: number, z: number): Pos {
    return new Pos(mode, x, y, z);
  }

  static readonly RELATIVE_X = 0b100;
  static readonly RELATIVE_Y = 0b010;
  static readonly RELATIVE_Z = 0b001;

  toString(): string {
    switch (this.mode) {
      case "world":
        return `${this.x.toFixed(4)} ${this.y.toFixed(4)} ${this.z.toFixed(4)}`;
      case "relative":
        return `~${this.x.toFixed(4)} ~${this.y.toFixed(4)} ~${
          this.z.toFixed(4)
        }`;
      case "rotLocal":
        return `^${this.x.toFixed(4)} ^${this.y.toFixed(4)} ^${
          this.z.toFixed(4)
        }`;
      default: {
        const xTag = this.mode & Pos.RELATIVE_X ? "~" : "";
        const yTag = this.mode & Pos.RELATIVE_Y ? "~" : "";
        const zTag = this.mode & Pos.RELATIVE_Z ? "~" : "";
        return `${xTag}${this.x} ${yTag}${this.y} ${zTag}${this.z}`;
      }
    }
  }
}

type RotMode = "world" | "relative" | number;

export class Rot {
  mode: RotMode;
  x: number;
  y: number;

  private constructor(mode: RotMode, x: number, y: number) {
    this.mode = mode;
    this.x = x;
    this.y = y;
  }

  public static world(x: number, y: number): Rot {
    return new Rot("world", x, y);
  }
  public static relative(x: number, y: number): Rot {
    return new Rot("relative", x, y);
  }
  /**
   * Creates a "mixed" rotation, consisting of some relative and some absolute components.
   * Use `Rot.RELATIVE_X` and `Rot.RELATIVE_Y` to define which coordinates should be relative versus absolute.
   * ```typescript
   * Rot.mixed(Rot.RELATIVE_X, 0, 0) // becomes ~ 0
   * ```
   */
  public static mixed(mode: number, x: number, y: number): Rot {
    return new Rot(mode, x, y);
  }

  static readonly RELATIVE_X = 0b10;
  static readonly RELATIVE_Y = 0b01;

  toString(): string {
    switch (this.mode) {
      case "world":
        return `${this.x} ${this.y}`;
      case "relative":
        return `~${this.x} ~${this.y}`;
      default: {
        const xTag = this.mode & Rot.RELATIVE_X ? "~" : "";
        const yTag = this.mode & Rot.RELATIVE_Y ? "~" : "";
        return `${xTag}${this.x} ${yTag}${this.y}`;
      }
    }
  }
}
