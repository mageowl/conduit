export const scoreboard = {
  players: {
    // TODO: Add objective macro
    set(target: string | "*", objective: string, score: number) {
      return `scoreboard players set ${target} ${objective} ${score}`;
    },
  },
};
