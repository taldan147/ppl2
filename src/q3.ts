import { isAppExp, isIfExp,CExp, ClassExp, ProcExp,  Exp, Program, makeProcExp, Binding, IfExp, makeIfExp,VarDecl, AppExp, makeAppExp, makePrimOp, makeStrExp, makeBoolExp, makeVarDecl, isAtomicExp, isLitExp, isProcExp, makeLetExp, LetExp, makeBinding, isCExp, isDefineExp, makeDefineExp, isClassExp, makeVarRef } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { slice, map, zipWith } from "ramda";
import { isLetExp } from "../imp/L3-ast";




/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>
    makeProcExp(exp.fields, [makeProcExp([makeVarDecl("msg")], [makeBody(exp.methods)])])

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isCExp(exp) ? makeOk(rewriteAllClassCExp(exp)) :
    isDefineExp(exp) ? makeOk(makeDefineExp(exp.var, rewriteAllClassCExp(exp.val))) :
    makeOk(exp);

const rewriteAllClassCExp = (exp : CExp) : CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp : 
    isIfExp(exp) ? makeIfExp(rewriteAllClassCExp(exp.test),rewriteAllClassCExp(exp.then), rewriteAllClassCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllClassCExp(exp.rator), map(rewriteAllClassCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllClassCExp, exp.body)) :
    isLetExp(exp) ? makeLetExp(rewriteLetExp(exp.bindings), map(rewriteAllClassCExp, exp.body)) :
    isClassExp(exp) ? class2proc(exp) :
    exp; 

const rewriteLetExp = (exp : Binding[]) : Binding[] =>
   zipWith(makeBinding, map(b=>b.var.toString(), exp),  map(b=>rewriteAllClassCExp(b.val), exp))


/*
Purpose: Transform methods to if expressions
Signature: makeBody(methods)
Type: Binding[] => ifExp
*/
const makeBody = (methods: Binding[]): IfExp => 
   methods.length === 1 ? makeIfExp(makeTest(methods[0].var), makeAppExp(methods[0].val,[]), makeBoolExp(false)) :
        makeIfExp(makeTest(methods[0].var),makeAppExp(methods[0].val,[]), makeBody(slice(1,methods.length,methods)))

/*
Purpose: make test for ifExp
Signature: makeTest(funcName)
Type: VarDecl => AppExp
*/
const makeTest = (funcName: VarDecl) : AppExp =>
    makeAppExp(makePrimOp("eq?"),[ makeVarRef("msg"), makeVarRef(`'${funcName.var}`)])
