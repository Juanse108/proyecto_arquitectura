import { OperacionInstruccion } from '../Enums/operacion-instruccion';

export class ALU {
  operacionAEjecutar: OperacionInstruccion | undefined;
  operando1: number = 0;
  operando2: number = 0;
  resultado: number = 0;

  ejecutarOperacion(
    tipoOperacion: OperacionInstruccion,
    operando1: number,
    operando2: number
  ): number {
    this.operacionAEjecutar = tipoOperacion;
    this.operando1 = operando1;
    this.operando2 = operando2;

    switch (this.operacionAEjecutar) {
      case OperacionInstruccion.ADD:
        this.resultado = this.sumar(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.SUB:
        this.resultado = this.restar(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.MUL:
        this.resultado = this.multiplicar(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.DIV:
        this.resultado = this.dividir(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.INC:
        this.resultado = this.incrementar(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.DEC:
        this.resultado = this.decrementar(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.NOT:
        this.resultado = this.negar(operando1);
        return this.resultado;
      case OperacionInstruccion.AND:
        this.resultado = this.conjuncion(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.OR:
        this.resultado = this.disyuncion(operando1, operando2);
        return this.resultado;
      case OperacionInstruccion.CMP:
        this.resultado = this.comparar(operando1, operando2);
        return this.resultado;
      default:
        return 0;
    }
  }

  private sumar(operando1: number, operando2: number): number {
    return operando1 + operando2;
  }

  private restar(operando1: number, operando2: number): number {
    return operando1 - operando2;
  }

  private multiplicar(operando1: number, operando2: number): number {
    return operando1 * operando2;
  }

  private dividir(operando1: number, operando2: number): number {
    try {
      return operando1 / operando2;
    } catch (error) {
      return 0;
    }
  }

  private incrementar(operando1: number, operando2: number): number {
    if (operando2 == undefined || operando2 == null || operando2 == 0){
      operando2 = 1;
    }
    return operando1 += operando2;
  }

  private decrementar(operando1: number, operando2: number): number {
    if (operando2 == undefined || operando2 == null || operando2 == 0){
      operando2 = 1;
    }
    return operando1 -= operando2;
  }

  private negar(operando1: number): number {
    if(operando1 == 0){
      return 1;
    }else if(operando1 == 1){
      return 0;
    }else{
      return operando1 * -1;
    }
  }

  private conjuncion(operando1: number, operando2: number): number {
    if(operando1 == 1 && operando2 == 1){
      return 1;
    }else{
      return 0;
    }
  }

  private disyuncion(operando1: number, operando2: number): number {
    if(operando1 == 0 && operando2 == 0){
      return 0;
    }else{
      return 1;
    }
  }

  private comparar(operando1: number, operando2: number): number {
    if(operando1 == operando2){
      return 0;
    }else if(operando1 > operando2){
      return 1;
    }else{
      return -1;
    }
  }
}
