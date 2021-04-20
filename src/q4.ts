import { Exp, VarDecl, isBoolExp, Program, isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp,isAppExp, isPrimOp, isLetExp, isDefineExp, isProgram, ProcExp, isExp, AppExp, PrimOp, isVarDecl } from '../imp/L3-ast';
import { valueToString } from '../imp/L3-value';
import { Result, makeFailure, makeOk } from '../shared/result';
import {map} from 'ramda';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? makeOk(map(l2ToPythonExp,exp.exps).join("\n")) :
    isExp(exp) ? makeOk(l2ToPythonExp(exp)):
    makeFailure("not a good program");

const l2ToPythonProc = (pe : ProcExp) : string =>
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${l2ToPythonExp(pe.body[0])})`

const l2ToPythonApp = (ae: AppExp) : string => 
    isProcExp(ae.rator) ? `${l2ToPythonProc(ae.rator)}(${map(l2ToPythonExp, ae.rands).join(",")})`: 
    isPrimOp(ae.rator) && ae.rator.op === "not"? `(${l2ToPythonExp(ae.rator)} ${l2ToPythonExp(ae.rands[0])})` :
    isVarDecl(ae.rator) || isVarRef(ae.rator) ? `${l2ToPythonExp(ae.rator)}(${map(l2ToPythonExp, ae.rands).join(",")})`:
    `(${map(l2ToPythonExp, ae.rands).join(` ${l2ToPythonExp(ae.rator)} `)})` ;

const l2ToPythonPrimOp = (po : PrimOp) : string =>
    po.op === "=" || po.op === "eq?" ? "==" : 
    po.op === "boolean?" ? "(lambda x : (type(x) == bool)" :
    po.op === "number?" ? "(lambda x : (type(x) == int or type(x) == float)" :
    po.op;
    
const l2ToPythonExp = (exp: Exp) : string =>
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isLitExp(exp) ?'' :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? l2ToPythonProc(exp) :
    isIfExp(exp) ? `(${l2ToPythonExp(exp.then)} if ${l2ToPythonExp(exp.test)} else ${l2ToPythonExp(exp.alt)})` :
    isAppExp(exp) ? l2ToPythonApp(exp):
    isPrimOp(exp) ? l2ToPythonPrimOp(exp) :
    isLetExp(exp) ? '' :
    isDefineExp(exp) ? `${exp.var.var} = ${l2ToPythonExp(exp.val)}` :
    exp;

    
