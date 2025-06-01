export class MemoriaDatos {
  matriz: number[][];

  constructor(filas = 4, columnas = 4) {
    this.matriz = Array.from({ length: filas }, () => Array(columnas).fill(0));
  }

  obtenerValor(fila: number, columna: number): number {
    return this.matriz[fila][columna];
  }

  asignarValor(fila: number, columna: number, valor: number): void {
    this.matriz[fila][columna] = valor;
  }
}
