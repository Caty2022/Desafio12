const { Command } = require("commander");
const program = new Command();
//Recuerden:
//1 - Comando // 2 - La descriptción, // 3- Valor por default
program.option("--mode <mode>", "modo de trabajo", "producción");
program.parse();
module.exports = program;
