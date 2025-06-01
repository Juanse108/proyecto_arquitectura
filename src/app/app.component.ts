import { Component } from '@angular/core';
import { Instruccion } from './Models/instruccion';
import { ALU } from './Models/alu';
import { Memoria } from './Models/memoria';
import { AlmacenGeneral } from './Models/almacen-general';
import { ElementoProcesador } from './Enums/elemento-procesador';
import { EjecutarTareaService } from './Services/ejecutar-tarea.service';
import { EstadoComputador } from './Enums/estado-computador';
import { OperacionInstruccion } from './Enums/operacion-instruccion';
import { VariableInstruccion } from './Enums/variable-instruccion';
import { MemoriaDatos } from './Models/memoriaDatos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./reset.css', './app.component.css'],
})
export class AppComponent {

  // Elementos de la interfaz
  instruccionesIntroducidas: string = '';
  elementoActivo: ElementoProcesador;
  estadoComputador: EstadoComputador;

  // Elementos del procesador
  PC: number = 0;
  MAR: number = 0;
  MBR: Instruccion | undefined;
  IR: Instruccion | undefined;
  ALU: ALU = new ALU();
  memoria: Memoria = new Memoria();
  memoriaDatos: MemoriaDatos = new MemoriaDatos();
  almacenGeneral: AlmacenGeneral = new AlmacenGeneral();
  output: number | string = '';
  saltoManualRealizado: boolean = false;
  resultadoCMP: number = 0;
  valorEntrada: number = 0;

  constructor(
    private ejecutarTareaService: EjecutarTareaService
  ) {
    this.estadoComputador = EstadoComputador.SIN_INICIAR;
    this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
  }

  cargarYEjecutarInstrucciones() {
    this.estadoComputador = EstadoComputador.EN_EJECUCION;
    this.guardarInstruccionesEnMemoria();
    this.ejecutarInstruccionesGuardadas();
  }

  private guardarInstruccionesEnMemoria() {
    this.memoria = new Memoria();
    let instruccionesArray = this.instruccionesIntroducidas.split('\n');
    instruccionesArray.forEach((instruccion) => {
      this.memoria.agregarInstruccion(instruccion);
    });
  }

  private hayLineaPorEjecutar() {
    return this.PC < this.memoria.celdas.length;
  }

  //Flujo de captacion de instrucciones	

  private async ejecutarInstruccionesGuardadas() {
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.PC;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.MAR;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.MAR = this.PC;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.BUS_CONTROL;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.BUS_DIRECCIONES;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.MEMORIA;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.BUS_DATOS;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.MBR;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.MBR = this.memoria.obtenerInstruccion(this.PC);
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.IR;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.IR = this.MBR;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
    })
    await this.ejecutarTareaService.ejecutarTarea(async () => {
      await this.ejecutarInstruccion();
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
    })
    if (this.hayLineaPorEjecutar()) {
      if (!this.saltoManualRealizado) {
        this.PC++;
      } else {
        this.saltoManualRealizado = false;
      }
      await this.ejecutarInstruccionesGuardadas();
    }
    else {
      this.estadoComputador = EstadoComputador.FINALIZADO;
    }
  }

  private async ejecutarInstruccion(): Promise<void> {
    if (this.IR == undefined) {
      return;
    }
    const operacion = this.IR.operacion;
    const operando1: number | VariableInstruccion | undefined = this.IR.operando1;
    const operando2: number | VariableInstruccion | undefined = this.IR.operando2;
    const operando3: number | VariableInstruccion | undefined = this.IR.operando3;
    switch (operacion) {
      case OperacionInstruccion.LOAD:
        await this.ejecutarInstruccionLoad(operando1, operando2);
        break;
      case OperacionInstruccion.STORE_MEM:
        await this.ejecutarInstruccionStoreMem(operando1, operando2, operando3);
        break;
      case OperacionInstruccion.LOAD_MEM:
        await this.ejecutarInstruccionLoadMem(operando1, operando2, operando3);
        break;
      case OperacionInstruccion.ADD:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.ADD, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.SUB:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.SUB, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.MUL:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.MUL, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.DIV:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.DIV, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.MOVE:
        await this.ejecutarInstruccionMove(operando1, operando2);
        break;
      case OperacionInstruccion.INC:
        await this.ejecutarInstruccionInc(operando1, operando2);
        break;
      case OperacionInstruccion.DEC:
        await this.ejecutarInstruccionDec(operando1, operando2);
        break;
      case OperacionInstruccion.NOT:
        await this.ejecutarInstruccionNot(operando1);
        break;
      case OperacionInstruccion.AND:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.AND, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.OR:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.OR, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.HALT:
        this.PC = this.memoria.celdas.length;
        this.MAR = this.PC;
        break;
      case OperacionInstruccion.OUT:
        this.output = this.obtenerValorAlmacenGeneral(operando1);
        break;
      case OperacionInstruccion.IN:
        await this.ejecutarInstruccionLoad(operando1, this.valorEntrada);
        break;
      case OperacionInstruccion.CMP:
        await this.ejecutarInstruccionCmp(operando1, operando2);
        break;
      case OperacionInstruccion.JMP:
        await this.ejecutarInstruccionJmp(operando1);
        break;
      case OperacionInstruccion.JE:
        await this.ejecutarInstruccionSaltoCondicional(operando1, () => this.resultadoCMP === 0);
        break;
      case OperacionInstruccion.JNE:
        await this.ejecutarInstruccionSaltoCondicional(operando1, () => this.resultadoCMP !== 0);
        break;
      case OperacionInstruccion.JG:
        await this.ejecutarInstruccionSaltoCondicional(operando1, () => this.resultadoCMP > 0);
        break;
      case OperacionInstruccion.JL:
        await this.ejecutarInstruccionSaltoCondicional(operando1, () => this.resultadoCMP < 0);
        break;
      case OperacionInstruccion.JZ:
        await this.ejecutarInstruccionSaltoCondicional(operando2, () => this.obtenerValorAlmacenGeneral(operando1) === 0);
        break;
      case OperacionInstruccion.JNZ:
        await this.ejecutarInstruccionSaltoCondicional(operando2, () => this.obtenerValorAlmacenGeneral(operando1) != 0);
        break;
      default:
        break;
    }
  }

  // Ejecucion de instrucciones
  // Cargar
  private async ejecutarInstruccionLoad(variableAGuardar: number | VariableInstruccion | undefined, numero: number | VariableInstruccion | undefined): Promise<void> {
    if (variableAGuardar == undefined || numero == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      switch (variableAGuardar) {
        case VariableInstruccion.A:
          this.almacenGeneral.A = numero;
          break;
        case VariableInstruccion.B:
          this.almacenGeneral.B = numero;
          break;
        case VariableInstruccion.C:
          this.almacenGeneral.C = numero;
          break;
        case VariableInstruccion.D:
          this.almacenGeneral.D = numero;
          break;
        case VariableInstruccion.E:
          this.almacenGeneral.E = numero;
          break;
        case VariableInstruccion.F:
          this.almacenGeneral.F = numero;
          break;
        case VariableInstruccion.G:
          this.almacenGeneral.G = numero;
          break;
        case VariableInstruccion.H:
          this.almacenGeneral.H = numero;
          break;
        default:
          break;
      }
    })
  }
 
  //Comparación
  private async ejecutarInstruccionCmp(
    operando1: number | VariableInstruccion | undefined,
    operando2: number | VariableInstruccion | undefined
  ): Promise<void> {
    if (operando1 === undefined || operando2 === undefined) return;

    const valor1 = this.obtenerValorAlmacenGeneral(operando1);
    const valor2 = this.obtenerValorAlmacenGeneral(operando2);
    console.log(`[ANTES CMP] Valor de ${operando1} = ${valor1}, ${operando2} = ${valor2}`);
    this.resultadoCMP = valor1 - valor2;

    console.log(`[CMP] ${valor1} - ${valor2} = ${this.resultadoCMP}`);
  }


  //Matematicas
  private async ejecutarInstruccionMatematica(tipoOperacion: OperacionInstruccion, primeraVariable: number | VariableInstruccion | undefined, segundaVariable: number | VariableInstruccion | undefined, variableDestino: number | VariableInstruccion | undefined): Promise<void> {
    if (primeraVariable == undefined || segundaVariable == undefined) {
      return;
    }
    if (tipoOperacion === OperacionInstruccion.CMP) {

    }

    switch (variableDestino) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      default:
        break;
    }
  }



  //Mover
  private async ejecutarInstruccionMove(variableOrigen: number | VariableInstruccion | undefined, variableDestino: number | VariableInstruccion | undefined): Promise<void> {
    if (variableOrigen == undefined || variableDestino == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    switch (variableDestino) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      default:
        break;
    }
  }

  //Incrementar
  private async ejecutarInstruccionInc(variableOrigen: VariableInstruccion | undefined, numero: number | VariableInstruccion | undefined): Promise<void> {
    if (variableOrigen == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    switch (variableOrigen) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.A, numero);
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.B, numero);
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.C, numero);
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.D, numero);
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.E, numero);
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.F, numero);
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.G, numero);
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = await this.ejecutarOperacionALUInc(OperacionInstruccion.INC, this.almacenGeneral.H, numero);
        break;
      default:
        break;
    }
  }
  //Cargar en memoria de datos
  private async ejecutarInstruccionLoadMem(registro: VariableInstruccion | undefined, fila: number | undefined, columna: number | undefined): Promise<void> {
    if (registro === undefined || fila === undefined || columna === undefined) return;

    const valor = this.memoriaDatos.obtenerValor(fila, columna);

    switch (registro) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = valor;
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = valor;
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = valor;
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = valor;
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = valor;
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = valor;
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = valor;
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = valor;
        break;
    }
  }

  //Almacenar en memoria de datos

  private async ejecutarInstruccionStoreMem(
    operando1: number | VariableInstruccion | undefined,
    operando2: number | VariableInstruccion | undefined,
    operando3: number | VariableInstruccion | undefined
  ): Promise<void> {
    if (
      operando1 === undefined ||
      operando2 === undefined ||
      operando3 === undefined
    ) {
      return;
    }

    const valor = this.obtenerValorAlmacenGeneral(operando1);
    const fila = this.obtenerValor(operando2);
    const columna = this.obtenerValor(operando3);

    this.memoriaDatos.asignarValor(fila, columna, valor);
  }



  //Decrementar
  private async ejecutarInstruccionDec(variableOrigen: VariableInstruccion | undefined, numero: number | VariableInstruccion | undefined): Promise<void> {
    if (variableOrigen == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    switch (variableOrigen) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.A, numero);
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.B, numero);
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.C, numero);
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.D, numero);
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.E, numero);
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.F, numero);
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.G, numero);
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = await this.ejecutarOperacionALUInc(OperacionInstruccion.DEC, this.almacenGeneral.H, numero);
        break;
      default:
        break;
    }
  }

  private async ejecutarOperacionALUInc(operacion: OperacionInstruccion, operando1: number | VariableInstruccion | undefined, operando2: number | VariableInstruccion | undefined): Promise<number> {
    if (operando1 == undefined) {
      return 0;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALU;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    const resultadoOperacion = this.ALU.ejecutarOperacion(operacion, operando1, operando2 ?? 1);
    return resultadoOperacion;
  }

  //Negar
  private async ejecutarInstruccionNot(variableOrigen: VariableInstruccion | undefined): Promise<void> {
    if (variableOrigen == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    switch (variableOrigen) {
      case VariableInstruccion.A:
        this.almacenGeneral.A = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.A);
        break;
      case VariableInstruccion.B:
        this.almacenGeneral.B = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.B);
        break;
      case VariableInstruccion.C:
        this.almacenGeneral.C = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.C);
        break;
      case VariableInstruccion.D:
        this.almacenGeneral.D = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.D);
        break;
      case VariableInstruccion.E:
        this.almacenGeneral.E = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.E);
        break;
      case VariableInstruccion.F:
        this.almacenGeneral.F = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.F);
        break;
      case VariableInstruccion.G:
        this.almacenGeneral.G = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.G);
        break;
      case VariableInstruccion.H:
        this.almacenGeneral.H = await this.ejecutarOperacionALUNot(OperacionInstruccion.NOT, this.almacenGeneral.H);
        break;
      default:
        break;
    }
  }

  private async ejecutarOperacionALUNot(operacion: OperacionInstruccion, operando1: number | VariableInstruccion | undefined): Promise<number> {
    if (operando1 == undefined) {
      return 0;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALU;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    const resultadoOperacion = this.ALU.ejecutarOperacion(operacion, operando1, 0);
    return resultadoOperacion;
  }

  private async ejecutarInstruccionJmp(operando: number | VariableInstruccion | undefined): Promise<void> {
    if (operando === undefined) return;

    const direccion = this.obtenerValor(operando);

    if (direccion < 0 || direccion >= this.memoria.celdas.length) {
      throw new Error(`Dirección inválida para JMP: ${direccion}`);
    }

    this.PC = direccion;
    this.MAR = this.PC;
    this.saltoManualRealizado = true;
  }
   // De salto
    private async ejecutarInstruccionSaltoCondicional(
    operando: number | VariableInstruccion | undefined,
    condicion: () => boolean
  ): Promise<void> {
    if (operando === undefined) return;

    const debeSaltar = condicion();
    const destino = this.obtenerValor(operando);

    console.log(`[SALTO] Condición = ${debeSaltar}, destino = ${destino}`);

    if (debeSaltar) {
      if (destino >= 0 && destino < this.memoria.celdas.length) {
        this.PC = destino;
        this.MAR = this.PC;
        this.saltoManualRealizado = true;
        console.log(`[SALTO EJECUTADO] PC cambiado a ${this.PC}`);
      } else {
        console.warn(`[SALTO ERROR] Dirección fuera de rango: ${destino}`);
      }
    } else {
      console.log(`[SALTO OMITIDO] Condición no se cumple`);
    }
  }

  //Metodos complementarios

  private async ejecutarOperacionALU(operacion: OperacionInstruccion, operando1: number | VariableInstruccion | undefined, operando2: number | VariableInstruccion | undefined): Promise<number> {
    if (operando1 == undefined || operando2 == undefined) {
      return 0;
    }
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALU;
    })
    await this.ejecutarTareaService.ejecutarTarea(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    const numero1 = this.obtenerValorAlmacenGeneral(operando1);
    const numero2 = this.obtenerValorAlmacenGeneral(operando2);
    const resultadoOperacion = this.ALU.ejecutarOperacion(operacion, numero1, numero2);
    return resultadoOperacion;
  }
  private obtenerValor(operando: number | VariableInstruccion | undefined): number {
    if (typeof operando === 'number') {
      return operando;
    }
    return this.obtenerValorAlmacenGeneral(operando);
  }



  private obtenerValorAlmacenGeneral(variableAObtener: number | VariableInstruccion | undefined) {
    if (variableAObtener == undefined) {
      return 0;
    }
    console.log(variableAObtener);

    switch (variableAObtener) {
      case VariableInstruccion.A:
        return this.almacenGeneral.A;
      case VariableInstruccion.B:
        return this.almacenGeneral.B;
      case VariableInstruccion.C:
        return this.almacenGeneral.C;
      case VariableInstruccion.D:
        return this.almacenGeneral.D;
      case VariableInstruccion.E:
        return this.almacenGeneral.E;
      case VariableInstruccion.F:
        return this.almacenGeneral.F;
      case VariableInstruccion.G:
        return this.almacenGeneral.G;
      case VariableInstruccion.H:
        return this.almacenGeneral.H;
      default:
        return 0;
    }
  }

  //Opción de reiniciar simulador
  reiniciarSimulador() {
    this.PC = 0;
    this.MAR = 0;
    this.MBR = undefined;
    this.IR = undefined;
    this.ALU = new ALU();
    this.memoria = new Memoria();
    this.memoriaDatos = new MemoriaDatos()
    this.almacenGeneral = new AlmacenGeneral();
    this.output = '';
    this.resultadoCMP = 0;
    this.saltoManualRealizado = false;
    this.valorEntrada = 0;
    this.estadoComputador = EstadoComputador.SIN_INICIAR;
    this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
  }


  // Getters de estado de la interfaz
  get habilitarBtnEjecutar(): boolean {
    return this.estadoComputador == EstadoComputador.SIN_INICIAR;
  }

  get habilitarBtnPausar(): boolean {
    return this.estadoComputador == EstadoComputador.EN_EJECUCION;
  }

  get habilitarBtnReanudar(): boolean {
    return this.estadoComputador == EstadoComputador.PAUSADO;
  }

  get unidadControlEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.UNIDAD_CONTROL;
  }

  get memoriaEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.MEMORIA;
  }

  get aluEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.ALU;
  }

  get almacenGeneralEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.ALMACEN_GENERAL;
  }

  get pcEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.PC;
  }

  get marEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.MAR;
  }

  get mbrEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.MBR;
  }

  get irEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.IR;
  }

  get busDatosEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_DATOS;
  }

  get busDireccionesEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_DIRECCIONES;
  }

  get busControlEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_CONTROL;
  }
}
